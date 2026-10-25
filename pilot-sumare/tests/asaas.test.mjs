import test from 'node:test';
import assert from 'node:assert/strict';
import {monthlyPlan,verifyWebhookToken,createAsaasSandbox} from '../src/asaas.mjs';
test('monthly catalog matches approved prices across all profiles',()=>{
 assert.deepEqual([0,1,2,3,4].map(t=>monthlyPlan('Candidato',t).cents),[0,1990,3990,6990,9990]);
 for(const p of ['Empresa','Instituição de Ensino'])assert.deepEqual([0,1,2,3,4].map(t=>monthlyPlan(p,t).cents),[0,9990,29990,69990,99990]);
 assert.throws(()=>monthlyPlan('__proto__',1));assert.throws(()=>monthlyPlan('Candidato','1'));
});
test('sandbox request uses authoritative price and cannot use production',async()=>{
 let calls=0;
 const client=createAsaasSandbox({apiKey:'test-key',fetchImpl:async(url,options)=>{
  calls++;assert.equal(url,'https://api-sandbox.asaas.com/v3/subscriptions');
  const body=JSON.parse(options.body);assert.equal(body.value,19.9);assert.equal(body.cycle,'MONTHLY');assert.equal(body.customer,'cus_test');assert.equal(options.headers.access_token,'test-key');return {ok:true,json:async()=>({id:'sub_test'})};
 }});
 const input={customerId:'cus_test',profileType:'Candidato',tier:1,nextDueDate:'2026-11-05',reference:'bill_1234567890123456',value:0.01};
 assert.equal((await client.createSubscription(input)).id,'sub_test');
 await assert.rejects(client.createSubscription({...input,tier:0}));
 await assert.rejects(client.createSubscription({...input,nextDueDate:'2026-02-31'}));assert.equal(calls,1);
});
test('authentication of webhook fails closed',()=>{
 const secret='a'.repeat(64);assert.equal(verifyWebhookToken(secret,secret),true);
 for(const v of [undefined,'','b'.repeat(64),'a'.repeat(63)])assert.equal(verifyWebhookToken(v,secret),false);
 assert.equal(verifyWebhookToken('short','short'),false);
});
test('failed subscription is not retried and does not expose provider details',async()=>{
 let calls=0;const client=createAsaasSandbox({apiKey:'test',fetchImpl:async()=>{calls++;return {ok:false,status:401};}});
 await assert.rejects(client.createSubscription({customerId:'cus_test',profileType:'Empresa',tier:3,nextDueDate:'2026-11-05',reference:'bill_1234567890123456'}),/não concluiu/);assert.equal(calls,1);
});
