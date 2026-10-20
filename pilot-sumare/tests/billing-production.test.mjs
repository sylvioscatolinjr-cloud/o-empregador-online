import test from 'node:test';
import assert from 'node:assert/strict';
import {productionBillingReadiness} from '../src/billing-production.mjs';
import {productionStatusHandler} from '../api/billing-production.mjs';
test('production diagnostics never reuse sandbox credentials or activate billing and redact provider details',async()=>{
 let calls=0;
 const empty=await productionBillingReadiness({env:{ASAAS_SANDBOX_API_KEY:'test'},fetchImpl:()=>{calls++;}});
 assert.deepEqual(empty.missing,['ASAAS_PRODUCTION_API_KEY']);assert.equal(calls,0);
 const r=await productionBillingReadiness({env:{ASAAS_PRODUCTION_API_KEY:'prod-test'},fetchImpl:async(url,options)=>{assert.equal(url,'https://api.asaas.com/v3/myAccount/status');assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.equal(options.headers.access_token,'prod-test');return Response.json({general:'APPROVED',cpfCnpj:'private'});}});
 assert.equal(r.connected,true);assert.equal(r.ready,false);assert.equal(r.cpfCnpj,undefined);
});
test('production status is read only and restricted to verified active owner',async()=>{
 let role='learner',status='active',calls=0;
 const db={auth:{getUser:async()=>({data:{user:{id:'u',email_confirmed_at:'yes'}}})},from(){const q={select(){return q},eq(){return q},maybeSingle:async()=>({data:{role,status}})};return q}};
 const handler=productionStatusHandler({env:{SUPABASE_URL:'https://example.test',SUPABASE_SECRET_KEY:'fixture',PILOT_COHORT_ID:'c',ASAAS_PRODUCTION_API_KEY:'p'},clientFactory:()=>db,fetchImpl:async()=>{calls++;return Response.json({general:'APPROVED'})}});
 const res=()=>({setHeader(){},status(n){this.code=n;return this},json(body){this.body=body;return this}});
 for(const [method,headers,expected] of [['GET',{},401],['POST',{authorization:'Bearer t'},405],['GET',{authorization:'Bearer t'},403]]){const r=res();await handler({method,headers},r);assert.equal(r.code,expected);}assert.equal(calls,0);
 role='pilot_owner';status='suspended';let r=res();await handler({method:'GET',headers:{authorization:'Bearer t'}},r);assert.equal(r.code,403);assert.equal(calls,0);
 status='active';r=res();await handler({method:'GET',headers:{authorization:'Bearer t'}},r);assert.equal(r.code,200);assert.equal(calls,1);assert.equal(r.body.ready,false);
});
