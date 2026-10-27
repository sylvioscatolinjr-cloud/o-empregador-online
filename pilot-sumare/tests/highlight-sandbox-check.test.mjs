import test from 'node:test';
import assert from 'node:assert/strict';
import {checkHighlightSandbox,inspectHighlightSandbox,sandboxProbeHandler,controlSandboxWebhook} from '../src/highlight-sandbox-check.mjs';

test('sandbox checkout probe uses only the isolated endpoint and exact production highlight payload',async()=>{
 const calls=[];const fetchImpl=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>options.method==='POST'?({id:'checkout_fixture'}):({data:[],hasMore:false})};};
 const result=await checkHighlightSandbox({key:'sandbox-test-secret',origin:'https://preview.example',fetchImpl});
 assert.equal(calls.length,2);assert.equal(calls[0].url,'https://api-sandbox.asaas.com/v3/checkouts');
 assert.equal(calls[1].url,'https://api-sandbox.asaas.com/v3/payments?checkoutSession=checkout_fixture&limit=100');
 assert.deepEqual(JSON.parse(calls[0].options.body).chargeTypes,['DETACHED']);
 assert.equal(JSON.parse(calls[0].options.body).items[0].value,9.9);
 assert.match(result.checkoutURL,/^https:\/\/sandbox\.asaas\.com\//);assert(!JSON.stringify(result).includes('sandbox-test-secret'));
});
test('sandbox inspection fetches the fresh payment and verifies checkout, amount and eligibility',async()=>{
 const calls=[];const fetchImpl=async(url)=>{calls.push(url);return {ok:true,json:async()=>url.includes('?checkoutSession=')?{data:[{id:'pay_test'}],hasMore:false}:{id:'pay_test',checkoutSession:'checkout_fixture',value:9.9,status:'CONFIRMED'}}};
 const result=await inspectHighlightSandbox({key:'fixture',checkoutId:'checkout_fixture',fetchImpl});
 assert.equal(calls.length,2);assert.equal(result.payments[0].eligible,true);assert.equal(result.payments[0].cents,990);
 await assert.rejects(inspectHighlightSandbox({key:'fixture',checkoutId:'../wrong',fetchImpl}),/Referência inválida/);
});
test('probe refuses production, other branches and unauthorized callers before contacting Asaas',async()=>{
 let calls=0;const res={setHeader(){},status(n){this.code=n;return this;},json(o){this.body=o;return this;}};
 const env={VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'feat/destaque-pago',VERCEL_URL:'preview.vercel.app',HIGHLIGHT_SANDBOX_PROBE_TOKEN:'a'.repeat(64),ASAAS_SANDBOX_API_KEY:'fixture'};
 const req={method:'POST',headers:{authorization:'Bearer '+'a'.repeat(64)}};const fetchImpl=async(_url,opts)=>{calls++;return {ok:true,json:async()=>opts.method==='POST'?({id:'checkout_fixture'}):({data:[],hasMore:false})}};
 await sandboxProbeHandler(req,res,{env,fetchImpl});assert.equal(res.code,404);
 env.VERCEL_ENV='preview';env.VERCEL_GIT_COMMIT_REF='main';await sandboxProbeHandler(req,res,{env,fetchImpl});assert.equal(res.code,404);
 env.VERCEL_GIT_COMMIT_REF='feat/destaque-pago';req.headers.authorization='Bearer '+'b'.repeat(64);await sandboxProbeHandler(req,res,{env,fetchImpl});assert.equal(res.code,401);assert.equal(calls,0);
 req.headers.authorization='Bearer '+'a'.repeat(64);await sandboxProbeHandler(req,res,{env,fetchImpl});assert.equal(res.code,200);assert.equal(calls,2);
});
test('sandbox probe rejects missing credentials and errors without disclosing provider response',async()=>{
 await assert.rejects(checkHighlightSandbox({key:'',origin:'https://preview.example'}),/chave/);
 await assert.rejects(checkHighlightSandbox({key:'secret',origin:'https://preview.example',fetchImpl:async()=>({ok:false,status:401})}),/HTTP 401/);
});
test('temporary webhook control permits only the isolated sandbox and fixed test refund',async()=>{
 const calls=[],fetchImpl=async(url,opts)=>{calls.push({url,opts});return {ok:true,json:async()=>({id:'fixture_webhook',enabled:true})}};
 const cfg={key:'fixture',token:'a'.repeat(64),host:'preview.vercel.app',shareSecret:'b'.repeat(32),fetchImpl};
 await controlSandboxWebhook({...cfg,action:'create-webhook'});const body=JSON.parse(calls[0].opts.body);assert.equal(calls[0].url,'https://api-sandbox.asaas.com/v3/webhooks');assert.match(body.url,/^https:\/\/preview\.vercel\.app\//);assert.deepEqual(body.events,['PAYMENT_REFUNDED','PAYMENT_REFUND_IN_PROGRESS']);
 await controlSandboxWebhook({...cfg,action:'refund-fixture'});assert.equal(calls[1].url,'https://api-sandbox.asaas.com/v3/payments/pay_l9wvx0oeq5fiojba/refund');
 await controlSandboxWebhook({...cfg,action:'disable-webhook',webhookId:'fixture_webhook'});assert.equal(calls[2].opts.method,'PUT');
 await assert.rejects(controlSandboxWebhook({...cfg,host:'evil.example',action:'create-webhook'}));await assert.rejects(controlSandboxWebhook({...cfg,action:'refund-other'}));
});
