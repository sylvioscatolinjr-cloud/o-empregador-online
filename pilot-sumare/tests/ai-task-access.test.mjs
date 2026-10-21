import test from 'node:test';
import assert from 'node:assert/strict';
import {readTaskTier} from '../src/ai-task-access.mjs';
import {getGuidedTasks} from '../src/ai-agent-catalog.mjs';
import {quotePlan} from '../src/billing-plans.mjs';
function fixture(profile='Candidato',tier=1,{expired=false,forged=false,otherUser=false,error=false}={}){
 const q=quotePlan(profile,tier),order={id:'o',user_id:otherUser?'other':'u',profile_type:profile,tier,cycle:'MONTHLY',cents:q.cents};
 const pay={id:'p',order_id:'o',eligible:true,cents:q.cents,credit_cents:q.aiCreditCents+(forged?1:0),period_start:'2020-01-01',period_end:expired?'2021-01-01':'2099-01-01'};
 return {from(table){return {select(){return this},async eq(){return {data:[order],error:error?{}:null}},async in(){return {data:[pay],error:null}}}}};
}
test('paid tier and progressive task availability come from verified billing for each role',async()=>{
 for(const [role,profile] of [['learner','Candidato'],['recruiter','Empresa'],['school_staff','Instituição de Ensino']])for(const tier of [1,2,3]){assert.equal(await readTaskTier(fixture(profile,tier),'u',role),tier);assert.equal(getGuidedTasks(role,tier).filter(t=>t.available).length,tier);}
});
test('expired, altered, foreign-user and mismatched-profile payments do not unlock tasks',async()=>{
 for(const opts of [{expired:true},{forged:true},{otherUser:true}])assert.equal(await readTaskTier(fixture('Candidato',3,opts),'u','learner'),0);
 assert.equal(await readTaskTier(fixture('Empresa',3),'u','learner'),0);
 await assert.rejects(readTaskTier(fixture('Candidato',1,{error:true}),'u','learner'));
});
