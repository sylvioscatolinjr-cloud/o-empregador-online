import test from 'node:test';
import assert from 'node:assert/strict';
import {createAgentRequest} from '../src/ai-agent-policy.mjs';

test('roles produce distinct instructions and no automatic decisions',()=>{
 const a=createAgentRequest({role:'learner',question:'Como melhorar?'});
 const b=createAgentRequest({role:'recruiter',question:'Como contratar?'});
 const c=createAgentRequest({role:'school_staff',question:'Que curso oferecer?'});
 assert.equal(new Set([a.agent,b.agent,c.agent]).size,3);
 assert.match(b.system,/Nunca decida contratação/);
 assert.match(c.system,/dados agregados/);
 assert.equal(a.capabilityStatus,'planned');
});
test('rejects privileged and unknown roles',()=>{
 for(const role of ['pilot_owner','admin',null,'institution'])
  assert.throws(()=>createAgentRequest({role,question:'oi'}),{code:'forbidden'});
});
test('rejects empty or oversized prompts',()=>{
 for(const question of ['', ' '.repeat(20),'x'.repeat(4001)])
  assert.throws(()=>createAgentRequest({role:'learner',question}),{code:'invalid_question'});
});
test('context is explicitly allowlisted and length bounded',()=>{
 const req=createAgentRequest({role:'learner',question:' Ajuda ',context:{goal:'Carreira',password:'secret',cpf:'000',skills:'x'.repeat(2000)}});
 const data=JSON.parse(req.user);
 assert.equal(data.question,'Ajuda');
 assert.equal(data.context.goal,'Carreira');
 assert.equal(data.context.skills.length,1500);
 assert.ok(!req.user.includes('secret'));
 assert.ok(!req.user.includes('cpf'));
});
