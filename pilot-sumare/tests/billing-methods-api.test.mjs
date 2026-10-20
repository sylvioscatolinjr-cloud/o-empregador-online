import test from 'node:test';import assert from 'node:assert/strict';
import handler from '../api/billing-methods.mjs';import {checkoutEvents} from '../src/billing-sandbox.mjs';import {methodEvents} from '../src/billing-methods.mjs';
test('server authenticates test owner, ignores client price and sends only fictitious customer to sandbox',async()=>{
 const names=['SUPABASE_URL','SUPABASE_SECRET_KEY','ASAAS_SANDBOX_API_KEY','ASAAS_WEBHOOK_TOKEN','BILLING_TEST_EMAIL','APP_ORIGIN'],old=Object.fromEntries(names.map(k=>[k,process.env[k]])),oldFetch=globalThis.fetch;let customerCalls=0,subscriptionCalls=0,owner=true,hasWishes=true;
 Object.assign(process.env,{SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_fixture',ASAAS_SANDBOX_API_KEY:'sandbox_fixture',ASAAS_WEBHOOK_TOKEN:'a'.repeat(64),BILLING_TEST_EMAIL:'owner@example.test',APP_ORIGIN:'https://portal.example'});
 const id='12345678-1234-1234-1234-123456789012';
 globalThis.fetch=async(input,init={})=>{const url=String(input),method=init.method||'GET';
  if(url.includes('/rest/v1/portal_course_wishlists'))return Response.json(hasWishes?{user_id:id}:null);
  if(url.includes('/auth/v1/user'))return Response.json({id,email:owner?'owner@example.test':'other@example.test',email_confirmed_at:'2026-10-16T00:00:00Z'});
  if(url.startsWith('https://api-sandbox.asaas.com/v3/webhooks'))return Response.json({data:[{url:'https://portal.example/api/billing?action=webhook',enabled:true,interrupted:false,events:[...checkoutEvents,...methodEvents]}]});
  if(url.includes('/rest/v1/billing_sandbox_methods')){if(method==='POST'){const body=JSON.parse(init.body);assert.equal(body.cents,5373);assert.equal(body.user_id,id);return Response.json({id});}if(method==='PATCH')return new Response(null,{status:204});return Response.json([]);}
  if(url==='https://api-sandbox.asaas.com/v3/customers'){customerCalls++;const b=JSON.parse(init.body);assert.equal(b.notificationDisabled,true);assert.equal(b.email,undefined);assert.match(b.name,/FICTICIO/);return Response.json({id:'cus_fixture1234'});}
  if(url==='https://api-sandbox.asaas.com/v3/subscriptions'){subscriptionCalls++;const b=JSON.parse(init.body);assert.equal(b.value,53.73);assert.equal(b.cycle,'QUARTERLY');assert.equal(b.billingType,'PIX');return Response.json({id:'sub_fixture1234'});}
  throw Error('Unexpected request '+url);
 };
 const req={method:'POST',headers:{origin:'https://portal.example','content-type':'application/json',authorization:'Bearer fixture-token'},body:{action:'create',profileType:'Candidato',tier:1,cycle:'QUARTERLY',method:'PIX',value:0.01}};
 function response(){return {code:0,body:null,setHeader(){},status(n){this.code=n;return this;},json(b){this.body=b;return this;}};}
 try{let res=response();await handler(req,res);assert.equal(res.code,200,JSON.stringify(res.body));assert.equal(customerCalls,1);assert.equal(subscriptionCalls,1);hasWishes=false;res=response();await handler(req,res);assert.equal(res.code,409);assert.equal(subscriptionCalls,1);owner=false;res=response();await handler(req,res);assert.equal(res.code,403);assert.equal(subscriptionCalls,1);res=response();await handler({...req,headers:{...req.headers,authorization:''}},res);assert.equal(res.code,401);assert.equal(subscriptionCalls,1);}finally{globalThis.fetch=oldFetch;for(const k of names)if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}
});
