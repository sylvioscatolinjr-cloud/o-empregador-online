import test from 'node:test';
import assert from 'node:assert/strict';
import {getAgentCatalog,getGuidedTasks} from '../src/ai-agent-catalog.mjs';

test('each verified role maps to a distinct agent',()=>{
  const agents=['learner','recruiter','school_staff'].map(getAgentCatalog);
  assert.equal(new Set(agents.map(x=>x.profile)).size,3);
  assert.ok(agents.every(x=>x.capabilities.length>=5));
});
test('untrusted and privileged roles do not inherit capabilities',()=>{
  for(const role of ['pilot_owner','admin','candidate',null,undefined,'__proto__'])
    assert.equal(getAgentCatalog(role),null);
});
test('catalog does not claim unimplemented tools are live',()=>{
  for(const role of ['learner','recruiter','school_staff'])
    assert.ok(getAgentCatalog(role).capabilities.every(x=>x.status==='planned'));
});

test('57 functions are available at every tier and strictly isolated by profile',()=>{
 const ids=new Set();for(const role of ['learner','recruiter','school_staff']){
  const tasks=getGuidedTasks(role,0);assert.equal(tasks.length,19);
  for(const tier of [1,2,3])assert.equal(tasks.filter(t=>t.suggestedTier===tier).length,6);
  for(const task of tasks){assert(!ids.has(task.id));ids.add(task.id);assert(task.hint.length>20);assert(task.instruction.length>40);assert.equal(task.costCents,100);}
  for(const tier of [0,1,2,3])assert.equal(getGuidedTasks(role,tier).filter(t=>t.available).length,19);
 }assert.equal(ids.size,57);
});
