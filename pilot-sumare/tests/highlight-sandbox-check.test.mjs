import test from 'node:test';
import assert from 'node:assert/strict';
import {checkHighlightSandbox,sandboxProbeHandler} from '../src/highlight-sandbox-check.mjs';

test('sandbox checkout probe uses only the isolated endpoint and exact production highlight payload',async()=>{
 const calls=[];const fetchImpl=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({id:'checkout_fixture'})};};
 const result=await checkHighlightSandbox({key:'sandbox-test-secret',origin:'https://preview.example',fetchImpl});
 assert.equal(calls.length,2);assert.equal(calls[0].url,'https://api-sandbox.asaas.com/v3/checkouts');
 assert.equal(calls[1].url,'https://api-sandbox.asaas.com/v3/checkouts/checkout_fixture');
 assert.deepEqual(JSON.parse(calls[0].options.body).chargeTypes,['DETACHED']);
 assert.equal(JSON.parse(calls[0].options.body).items[0].value,9.9);
 assert.match(result.checkoutURL,/^https:\/\/sandbox\.asaas\.com\//);assert(!JSON.stringify(result).includes('sandbox-test-secret'));
});
test('probe refuses production, other branches and unauthorized callers before contacting Asaas',async()=>{
 let calls=0;const res={setHeader(){},status(n){this.code=n;return this;},json(o){this.body=o;return this;}};
 const env={VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'feat/destaque-pago',VERCEL_URL:'preview.vercel.app',HIGHLIGHT_SANDBOX_PROBE_TOKEN:'a'.repeat(64),ASAAS_SANDBOX_API_KEY:'fixture'};
 const req={method:'POST',headers:{authorization:'Bearer '+'a'.repeat(64)}};const fetchImpl=async()=>{calls++;return {ok:true,json:async()=>({id:'checkout_fixture'})}};
 await sandboxProbeHandler(req,res,{env,fetchImpl});assert.equal(res.code,404);
 env.VERCEL_ENV='preview';env.VERCEL_GIT_COMMIT_REF='main';await sandboxProbeHandler(req,res,{env,fetchImpl});assert.equal(res.code,404);
 env.VERCEL_GIT_COMMIT_REF='feat/destaque-pago';req.headers.authorization='Bearer '+'b'.repeat(64);await sandboxProbeHandler(req,res,{env,fetchImpl});assert.equal(res.code,401);assert.equal(calls,0);
 req.headers.authorization='Bearer '+'a'.repeat(64);await sandboxProbeHandler(req,res,{env,fetchImpl});assert.equal(res.code,200);assert.equal(calls,2);
});
test('sandbox probe rejects missing credentials and errors without disclosing provider response',async()=>{
 await assert.rejects(checkHighlightSandbox({key:'',origin:'https://preview.example'}),/chave/);
 await assert.rejects(checkHighlightSandbox({key:'secret',origin:'https://preview.example',fetchImpl:async()=>({ok:false,status:401})}),/HTTP 401/);
});
