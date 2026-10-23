import test from 'node:test';
import assert from 'node:assert/strict';
import {quotePlan} from '../src/billing-plans.mjs';
import {subscriberBenefits} from '../src/subscriber-benefits.mjs';
test('subscriber conversion preserves prices, percentages, cents and whole uses across profiles and cycles',()=>{
 assert.deepEqual([1,2,3].map(t=>quotePlan('Candidato',t).aiCreditCents),[398,1248,2997]);
 assert.deepEqual([1,2,3].map(t=>quotePlan('Candidato',t).aiUses),[3,12,29]);
 for(const profile of ['Empresa','Instituição de Ensino'])assert.deepEqual([1,2,3].map(t=>quotePlan(profile,t).aiCreditCents),[1980,14975,89700]);
 const q=quotePlan('Candidato',1,'QUARTERLY');assert.equal(q.cents,5373);assert.equal(q.aiCreditCents,1075);assert.equal(q.aiRemainderCents,75);assert.equal(q.aiUses,10);
 assert.equal(quotePlan('Candidato',0).aiCreditCents,0);
 for(const tier of [1,2,3]){assert.equal(subscriberBenefits(tier).rollover,false);assert.equal(subscriberBenefits(tier).trainingLevel,tier);assert.equal(subscriberBenefits(tier).agentFunctionLevel,0);}
 assert.throws(()=>subscriberBenefits(4));
});
