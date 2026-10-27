import test from 'node:test';
import assert from 'node:assert/strict';
import {quoteHighlight, HIGHLIGHT_TERMS} from '../src/highlight-pricing.mjs';
import {highlightCheckoutBody, highlightPayment} from '../src/highlight-checkout.mjs';
import {syncHighlight} from '../src/highlight-sales-draft.mjs';

const tables = {
  learner: {kind:'candidate', prices:[[990,891,842,792,743],[1990,1791,1692,1592,1493],[2990,2691,2542,2392,2243]]},
  recruiter: {kind:'job', prices:[[2990,2691,2542,2392,2243],[5990,5391,5092,4792,4493],[9990,8991,8492,7992,7493]]},
  school_staff: {kind:'course', prices:[[2990,2691,2542,2392,2243],[5990,5391,5092,4792,4493],[9990,8991,8492,7992,7493]]},
};
for (const [role, table] of Object.entries(tables)) test(role+' applies all periods and verified tier discounts with cent rounding',()=>{
  for (const [i, days] of [7,15,30].entries()) for (let tier=0;tier<=4;tier++) {
    const q=quoteHighlight({role,kind:table.kind,days,verifiedTier:tier});
    assert.equal(q.cents,table.prices[i][tier]);
    assert.equal(q.discountPercent,[0,10,15,20,25][tier]);
    assert.equal(q.baseCents,q.cents+q.discountCents);
  }
  if (role==='school_staff') assert.equal(quoteHighlight({role,kind:'training',days:7,verifiedTier:1}).cents,2691);
});
test('invalid roles, kinds, tiers, or periods cannot produce a quote',()=>{
  const good={role:'learner',kind:'candidate',days:7,verifiedTier:0};
  for (const change of [{role:'pilot_owner'}, {role:'__proto__'}, {kind:'job'}, {days:14}, {days:'7'}, {verifiedTier:5}, {verifiedTier:-1}, {verifiedTier:'4'}, {verifiedTier:NaN}])
    assert.throws(()=>quoteHighlight({...good,...change}));
});
const order={id:'e9a83a47-1d06-4de8-a7c8-e4f0525cbe2c',role:'learner',kind:'candidate',days:7,tier:4,cents:743,terms_version:HIGHLIGHT_TERMS,checkout_id:'checkout_test'};
test('checkout uses one-time exact stored price with approved methods, and rejects tampering',()=>{
 const c=highlightCheckoutBody(order,'https://portal.example',['PIX','CREDIT_CARD']);
 assert.deepEqual(c.chargeTypes,['DETACHED']);assert.equal(c.items[0].value,7.43);assert.equal(c.externalReference,order.id);assert(!('subscription' in c));
 for(const bad of [{...order,cents:1},{...order,tier:5},{...order,terms_version:'old'},{...order,id:'invalid'}])assert.throws(()=>highlightCheckoutBody(bad,'https://portal.example',['CREDIT_CARD']));
 assert.throws(()=>highlightCheckoutBody(order,'https://portal.example/path',['CREDIT_CARD']));
 assert.throws(()=>highlightCheckoutBody(order,'https://portal.example',['BOLETO']));
});
test('only matching confirmed provider payments without refunds or chargeback are eligible',()=>{
 const p={id:'pay_test',checkoutSession:'checkout_test',value:7.43,status:'CONFIRMED',confirmedDate:'2026-10-26'};
 assert.equal(highlightPayment(p,order).eligible,true);
 assert.equal(highlightPayment({...p,status:'RECEIVED'},order).eligible,true);
 for(const change of [{status:'PENDING'},{deleted:true},{chargeback:{status:'OPEN'}},{refunds:[{status:'DONE'}]}])assert.equal(highlightPayment({...p,...change},order).eligible,false);
 for(const change of [{id:'bad'},{checkoutSession:'other'},{value:7.42},{subscription:'sub_123'},{installment:'ins_123'}])assert.throws(()=>highlightPayment({...p,...change},order));
});
test('reconciliation fetches each provider payment afresh and rejects a foreign checkout before applying',async()=>{
 const calls=[],db={rpc:async(name,args)=>{calls.push({name,args});return {data:null};}};
 const p={id:'pay_test',checkoutSession:order.checkout_id,value:7.43,status:'CONFIRMED'};
 const paths=[];await syncHighlight(db,async path=>{paths.push(path);return path.startsWith('/payments?')?{data:[{id:p.id,status:'PENDING'}]}:p;},order);
 assert.deepEqual(paths,['/payments?checkoutSession=checkout_test&limit=100','/payments/pay_test']);assert.equal(calls.length,1);assert.equal(calls[0].name,'portal_highlight_apply');assert.equal(calls[0].args.p_payment.eligible,true);
 await assert.rejects(syncHighlight(db,async path=>path.startsWith('/payments?')?{data:[{id:p.id}]}:{...p,checkoutSession:'other'},order));assert.equal(calls.length,1);
 await assert.rejects(syncHighlight(db,async()=>({hasMore:true,data:[]}),order));assert.equal(calls.length,1);
});
