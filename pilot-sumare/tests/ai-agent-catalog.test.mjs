import test from 'node:test';
import assert from 'node:assert/strict';
import {getAgentCatalog} from '../src/ai-agent-catalog.mjs';

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
