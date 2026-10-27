import test from 'node:test';import assert from 'node:assert/strict';
import {highlightAction,applyHighlightPayment} from '../src/highlight-sales-draft.mjs';
import {HIGHLIGHT_TERMS} from '../src/highlight-pricing.mjs';
import {subscriptionsHandler} from '../api/subscriptions.mjs';
const user={id:'11111111-1111-4111-8111-111111111111',email:'fixture@example.org'},target='33333333-3333-4333-8333-333333333333',orderId='44444444-4444-4444-8444-444444444444';
function fixture({enabled=true,validPassword=true,createError=false,providerFailure=false}={}){
 const calls=[],env={APP_ORIGIN:'https://portal.example',PILOT_COHORT_ID:'cohort',SUPABASE_URL:'https://db.example',SUPABASE_PUBLISHABLE_KEY:'fake',ASAAS_PRODUCTION_API_KEY:'fake',ASAAS_PRODUCTION_WEBHOOK_TOKEN:'fake',HIGHLIGHT_SALES_ENABLED:enabled?'true':'false'};
 const req={method:'POST',headers:{origin:env.APP_ORIGIN,'content-type':'application/json'},body:{action:'highlight-checkout',targetId:target,kind:'candidate',days:7,tier:4,cents:743,termsVersion:HIGHLIGHT_TERMS,password:'fixture-password',accept:true}};
 const res={status(v){this.code=v;return this;},json(v){this.body=v;return this;}};
 const db={rpc:async(name,args)=>{calls.push({rpc:name,args});return createError?{error:{message:'conflict'}}:{data:{id:orderId,tier:4,cents:743}};},from(table){const q={update(value){calls.push({table,update:value});return this;},eq(){return this;},then(resolve){resolve({data:null});}};return q;}};
 const request=async(path,options)=>{calls.push({path,options});if(path.startsWith('/pix/'))return {data:[{status:'ACTIVE'}]};if(providerFailure)throw Object.assign(Error('fixture'),{providerStatus:503});return {id:'chk_test'};};
 const clientFactory=()=>({auth:{signInWithPassword:async()=>{calls.push({reauth:true});return validPassword?{data:{user,session:{}}}:{error:'invalid'};},signOut:async()=>{calls.push({signout:true});}}});
 const invoke=()=>highlightAction({req,res,db,user,member:{role:'learner'},env,request,config:{connected:true,account_approved:true,webhook_ready:true},clientFactory,options:{}});
 return {req,res,calls,invoke};
}
test('draft checkout requires enabled sales, explicit consent, matching quote, password and atomic reservation',async()=>{
 for(const change of [f=>{f.req.body.accept=false},f=>{f.req.body.cents=1},f=>{f.req.body.termsVersion='old'},f=>{f.req.headers.origin='https://other.example'}]){const f=fixture();change(f);await f.invoke();assert([400,403].includes(f.res.code));assert(!f.calls.some(x=>x.reauth||x.rpc||x.path));}
 const off=fixture({enabled:false});await off.invoke();assert.equal(off.res.code,503);assert.equal(off.calls.length,0);
 const wrong=fixture({validPassword:false});await wrong.invoke();assert.equal(wrong.res.code,403);assert(!wrong.calls.some(x=>x.rpc||x.path));
 const conflict=fixture({createError:true});await conflict.invoke();assert.equal(conflict.res.code,409);assert(!conflict.calls.some(x=>x.path));
 const f=fixture();await f.invoke();assert.equal(f.res.code,200);assert.equal(f.res.body.url,'https://asaas.com/checkoutSession/show?id=chk_test');assert(f.calls.findIndex(x=>x.reauth)<f.calls.findIndex(x=>x.rpc==='portal_highlight_create'));assert(f.calls.findIndex(x=>x.rpc==='portal_highlight_create')<f.calls.findIndex(x=>x.path==='/checkouts'));const checkout=f.calls.find(x=>x.path==='/checkouts').options.body;assert.equal(checkout.items[0].value,7.43);assert.deepEqual(checkout.chargeTypes,['DETACHED']);assert.deepEqual(checkout.billingTypes,['PIX','CREDIT_CARD']);
});
test('uncertain provider failure sends order to review and does not offer a second checkout',async()=>{const f=fixture({providerFailure:true});await f.invoke();assert.equal(f.res.code,503);assert.match(f.res.body.error,/Não repita/);assert(f.calls.some(x=>x.update?.status==='review'));});
test('webhook apply uses provider checkout and amount and never accepts an unrelated payment',async()=>{
 const calls=[],order={id:orderId,checkout_id:'chk_test',cents:743};const q={select(){return this},eq(){return this},maybeSingle:async()=>({data:order})};const db={from:()=>q,rpc:async(name,args)=>{calls.push({name,args});return {data:null}}};
 const p={id:'pay_fixture',checkoutSession:'chk_test',value:7.43,status:'CONFIRMED'};assert.equal(await applyHighlightPayment(db,p),true);assert.equal(calls.length,1);await assert.rejects(applyHighlightPayment(db,{...p,value:0.01}));await assert.rejects(applyHighlightPayment(db,{...p,checkoutSession:'chk_other'}));assert.equal(calls.length,1);
});
test('integrated webhook retrieves fresh provider state and processes a highlight event only once',async()=>{
 let processed=false,providerCalls=0,applies=0;const env={SUPABASE_URL:'https://fixture.example',SUPABASE_SECRET_KEY:'fixture',PILOT_COHORT_ID:'cohort',ASAAS_PRODUCTION_API_KEY:'fixture',ASAAS_PRODUCTION_WEBHOOK_TOKEN:'synthetic_webhook_token_32_chars_minimum'};
 const fresh={id:'pay_fixture',checkoutSession:'chk_test',value:7.43,status:'CONFIRMED'};
 const db={from(table){let patch;const q={select(){return q},eq(){return q},insert(){return q},update(p){patch=p;return q},async maybeSingle(){return {data:table==='billing_live_events'?(processed?{processed_at:'yes'}:null):table==='portal_highlight_orders'?{id:orderId,cents:743,checkout_id:'chk_test'}:null}},then(a,b){if(patch?.processed_at)processed=true;return Promise.resolve({data:null}).then(a,b)}};return q},async rpc(name,args){assert.equal(name,'portal_highlight_apply');assert.equal(args.p_payment.cents,743);assert.equal(args.p_payment.eligible,true);applies++;return {data:null}}};
 const handler=subscriptionsHandler({env,clientFactory:()=>db,fetchImpl:async()=>{providerCalls++;return Response.json(fresh);}}),req={method:'POST',query:{action:'webhook'},headers:{'asaas-access-token':env.ASAAS_PRODUCTION_WEBHOOK_TOKEN},body:{id:'evt_fixture',event:'PAYMENT_CONFIRMED',payment:{id:'pay_fixture',status:'REFUNDED',value:999}}};
 const run=async request=>{const res={setHeader(){},status(n){this.code=n;return this},json(b){this.body=b;return this}};await handler(request,res);return res;};
 assert.equal((await run({...req,headers:{'asaas-access-token':'wrong'}})).code,401);assert.equal(providerCalls,0);assert.equal((await run(req)).code,200);assert.equal((await run(req)).code,200);assert.equal(applies,1);assert.equal(providerCalls,1);
});
test('preview webhook uses the same handler against sandbox and is unavailable in production',async()=>{
 const env={VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/destaque-pago',SUPABASE_URL:'https://fixture.example',SUPABASE_SECRET_KEY:'fixture',PILOT_COHORT_ID:'cohort',ASAAS_SANDBOX_API_KEY:'sandbox-key',HIGHLIGHT_SANDBOX_PROBE_TOKEN:'a'.repeat(64)};
 let urls=[],applied=0;const db={from(table){const q={select(){return q},eq(){return q},insert(){return q},update(){return q},async maybeSingle(){return {data:table==='portal_highlight_orders'?{id:orderId,cents:990,checkout_id:'chk_test'}:null}},then(a,b){return Promise.resolve({data:null}).then(a,b)}};return q},async rpc(_name,args){assert.equal(args.p_payment.cents,990);applied++;return {data:null}}};
 const handler=subscriptionsHandler({env,clientFactory:()=>db,fetchImpl:async url=>{urls.push(url);return Response.json({id:'pay_fixture',checkoutSession:'chk_test',value:9.9,status:'CONFIRMED'});}});
 const req=Object.create({method:'POST',headers:{'asaas-access-token':'a'.repeat(64)}});Object.assign(req,{query:{action:'highlight-sandbox-webhook'},body:{id:'evt_fixture',event:'PAYMENT_CONFIRMED',payment:{id:'pay_fixture'}}});const res={setHeader(){},status(n){this.code=n;return this},json(b){this.body=b;return this}};
 await handler(req,res);assert.equal(res.code,200);assert.equal(applied,1);assert.deepEqual(urls,['https://api-sandbox.asaas.com/v3/payments/pay_fixture']);
 env.VERCEL_ENV='production';await handler(req,res);assert.equal(res.code,404);assert.equal(applied,1);
});
