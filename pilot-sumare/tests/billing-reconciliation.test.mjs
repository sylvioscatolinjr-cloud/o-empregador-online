import test from 'node:test';
import assert from 'node:assert/strict';
import {livePayment,syncLiveOrder} from '../src/billing-live.mjs';
const order={id:'order',checkout_id:'checkout_1',subscription_id:null,cents:1990,months:1};
const payment={id:'pay_1',checkoutSession:'checkout_1',subscription:null,value:19.90,status:'CONFIRMED',dueDate:'2026-10-21'};
test('confirmed checkout payment grants only its own order even before subscription is exposed',()=>{
 assert.equal(livePayment(payment,order).eligible,true);
 assert.throws(()=>livePayment({...payment,checkoutSession:'other'},order));
 assert.throws(()=>livePayment({...payment,checkoutSession:null},order));
 assert.throws(()=>livePayment({...payment,subscription:'sub_wrong'},{...order,subscription_id:'sub_right'}));
 assert.equal(livePayment({...payment,value:1},order).eligible,false);
 assert.equal(livePayment({...payment,status:'REFUNDED'},order).eligible,false);
});
test('manual reconciliation fetches fresh checkout payment and applies without waiting for subscription',async()=>{
 const calls=[];const db={rpc:async(name,args)=>{calls.push([name,args]);return {error:null}}};
 const request=async path=>path.startsWith('/payments?')?{data:[{id:'pay_1'}]}:payment;
 await syncLiveOrder(db,request,order);
 assert.equal(calls.length,1);assert.equal(calls[0][1].p_payment.eligible,true);
});
test('provider list cannot attach a foreign checkout and failed storage cannot claim success',async()=>{
 let hits=0;const db={rpc:async()=>{hits++;return {error:{message:'failure'}}}};
 await assert.rejects(syncLiveOrder(db,async path=>path.startsWith('/payments?')?{data:[{id:'pay_1'}]}:{...payment,checkoutSession:'other'},order));assert.equal(hits,0);
 await assert.rejects(syncLiveOrder(db,async path=>path.startsWith('/payments?')?{data:[{id:'pay_1'}]}:payment,order));
});
