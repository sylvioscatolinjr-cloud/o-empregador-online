import test from 'node:test';
import assert from 'node:assert/strict';
import {quotePlan} from '../src/billing-plans.mjs';
import {verifiedAiAllowance} from '../src/ai-entitlement.mjs';
const now=Date.parse('2026-10-21T12:00:00Z');
function fixture(profile='Candidato',tier=1,cycle='MONTHLY'){
 const q=quotePlan(profile,tier,cycle);
 return {order:{id:'order-1',user_id:'owner-1',profile_type:profile,tier,cycle,cents:q.cents},
 payment:{id:'payment-1',order_id:'order-1',eligible:true,cents:q.cents,credit_cents:q.aiCreditCents,period_start:'2026-10-01T00:00:00Z',period_end:'2026-11-01T00:00:00Z'}};
}
test('candidate tier 1 allows three whole calls',()=>{const {order,payment}=fixture();const result=verifiedAiAllowance(order,payment,now);assert.equal(result.calls,3);assert.equal(result.userId,'owner-1')});
test('rejects unpaid or wrong order payment',()=>{const {order,payment}=fixture();assert.equal(verifiedAiAllowance(order,{...payment,eligible:false},now),null);assert.equal(verifiedAiAllowance(order,{...payment,order_id:'other'},now),null)});
test('rejects mismatched prices or credits',()=>{const {order,payment}=fixture();assert.equal(verifiedAiAllowance({...order,cents:1},payment,now),null);assert.equal(verifiedAiAllowance(order,{...payment,credit_cents:9999},now),null)});
test('rejects expired or future billing periods',()=>{const {order,payment}=fixture();assert.equal(verifiedAiAllowance(order,payment,Date.parse('2026-12-01T00:00:00Z')),null);assert.equal(verifiedAiAllowance(order,payment,Date.parse('2026-09-01T00:00:00Z')),null)});
test('rejects free and unknown plans',()=>{const {order,payment}=fixture();assert.equal(verifiedAiAllowance({...order,tier:0},payment,now),null);assert.equal(verifiedAiAllowance({...order,profile_type:'unknown'},payment,now),null)});
test('larger prepaid cycles use discounted actual payment',()=>{const {order,payment}=fixture('Empresa',2,'QUARTERLY');const result=verifiedAiAllowance(order,payment,now);assert.equal(result.calls,Math.floor(quotePlan('Empresa',2,'QUARTERLY').aiCreditCents/100))});
