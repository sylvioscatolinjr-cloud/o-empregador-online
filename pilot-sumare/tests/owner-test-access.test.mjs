import test from 'node:test';import assert from 'node:assert/strict';import {ownerTestAccess} from '../src/owner-test-access.mjs';import {agentCatalogHandler} from '../src/agent-catalog-handler.mjs';import {aiChatHandler} from '../src/ai-chat-handler.mjs';import {trainingHandler} from '../src/training-handler.mjs';import {aiBalanceHandler} from '../src/ai-balance-handler.mjs';import {aiHistoryHandler} from '../src/ai-history-handler.mjs';import {getGuidedTasks} from '../src/ai-agent-catalog.mjs';
const env={OEO_OWNER_TEST_USER_ID:'owner',PILOT_COHORT_ID:'cohort',SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'fixture',APP_ORIGIN:'https://portal.example',AI_CHAT_METERING_ENABLED:'true',OPENAI_API_KEY:'fixture',AI_CHAT_MODEL:'fixture'};
function fixture({userId='owner',role='pilot_owner',active=true,fictitious=false,quota=false,providerFail=false,configured=true}={}){
 const calls=[];const db={auth:{async getUser(){return {data:{user:{id:userId,email_confirmed_at:'yes'}}}}},from(table){let filters=[];calls.push({table,filters});const q={select(){return q},eq(k,v){filters.push([k,v]);return q},contains(){return q},order(){return q},limit(){return q},async maybeSingle(){return {data:table==='pilot_memberships'?{role,status:active?'active':'suspended',is_fictitious:fictitious}:table==='portal_owner_test_usage'?{calls:7}:null}},then(resolve,reject){return Promise.resolve({data:[]}).then(resolve,reject)}};return q},async rpc(name,args){calls.push({name,args});return quota?{error:{}}:{data:52}}};
 const fetchImpl=async()=>{calls.push({provider:true});return {ok:!providerFail,async json(){return {status:'completed',output:[{content:[{type:'output_text',text:'Resposta sintética'}]}]}}}};
 const cfg={...env,...(!configured?{OEO_OWNER_TEST_USER_ID:''}:{})};
 async function run(factory,action,{profile='learner',method='GET',body={}}={}){const res={setHeader(){},status(n){this.code=n;return this},json(b){this.body=b;return this}};await factory({env:cfg,clientFactory:()=>db,fetchImpl})({method,headers:{authorization:'Bearer fixture',origin:env.APP_ORIGIN,'content-type':'application/json'},query:{action,profile},body:{...body,profile}},res);return res;}
 return {calls,run};
}
test('owner override requires exact configured ID and database owner status, never metadata or requested profile alone',()=>{
 const m={role:'pilot_owner',status:'active',is_fictitious:false};assert.equal(ownerTestAccess(env,'owner',m,'recruiter').enabled,true);
 for(const [id,member] of [['other',m],['owner',{...m,role:'learner'}],['owner',{...m,status:'suspended'}],['owner',{...m,is_fictitious:true}]])assert.equal(ownerTestAccess(env,id,member,'recruiter').enabled,false);
 assert.equal(ownerTestAccess({},'owner',m,'recruiter').enabled,false);assert.equal(ownerTestAccess(env,'owner',m,'__proto__').role,'learner');
});
test('only designated owner sees all 65 tasks and 36 built-in trainings across three test profiles without querying paid tiers',async()=>{
 for(const profile of ['learner','recruiter','school_staff']){const f=fixture(),r=await f.run(agentCatalogHandler,'catalog',{profile});assert.equal(r.code,200);assert.equal(r.body.ownerTesting,true);assert.equal(r.body.tasks.length,profile==='learner'?21:22);assert(r.body.tasks.every(t=>t.available&&t.costCents===0));assert.equal(r.body.profileRole,profile);const training=await f.run(trainingHandler,'training-catalog',{profile});assert.equal(training.body.courses.length,12);assert(training.body.courses.every(t=>t.available));assert.equal(training.body.role,profile);assert(!f.calls.some(c=>c.table?.startsWith('billing_')));}
});
test('other accounts see their own tasks but never receive zero-cost owner test calls',async()=>{
 for(const options of [{userId:'other'},{role:'learner'},{role:'recruiter'},{role:'school_staff'},{configured:false}]){const f=fixture(options),r=await f.run(agentCatalogHandler,'catalog',{profile:'school_staff'});assert.equal(r.code,200);assert.equal(r.body.ownerTesting,false);assert.equal(r.body.tier,0);assert(r.body.tasks.every(t=>t.available&&t.costCents===(t.mode==='external_search'?250:100)));}
 for(const options of [{active:false},{fictitious:true}])assert.equal((await fixture(options).run(agentCatalogHandler,'catalog')).code,403);
});
test('owner executes each profile task through test quota with no paid reservation or refund',async()=>{
 for(const profile of ['learner','recruiter','school_staff']){const task=getGuidedTasks(profile,3).find(t=>t.suggestedTier===3&&t.id!=='resume_review'),f=fixture();const r=await f.run(aiChatHandler,'chat',{profile,method:'POST',body:{taskId:task.id,question:'Dados profissionais sintéticos para teste.'}});assert.equal(r.code,200);assert.equal(r.body.creditsCharged,0);assert.equal(r.body.remainingTestCalls,52);assert.equal(r.body.ownerTesting,true);assert.deepEqual(f.calls.filter(c=>c.name).map(c=>c.name),['portal_owner_test_reserve']);assert(f.calls.some(c=>c.provider));}
});
test('owner daily cap blocks model and model failure never touches paid wallet',async()=>{
 for(const [options,status]of [[{quota:true},429],[{providerFail:true},503]]){const f=fixture(options),r=await f.run(aiChatHandler,'chat',{method:'POST',body:{taskId:'career_gps',question:'Dados sintéticos para teste.'}});assert.equal(r.code,status);assert.deepEqual(f.calls.filter(c=>c.name).map(c=>c.name),['portal_owner_test_reserve']);if(options.quota)assert(!f.calls.some(c=>c.provider));}
});
test('owner balance exposes test calls and history remains own user/cohort/selected profile',async()=>{
 const f=fixture();const r=await f.run(aiBalanceHandler,'balance');assert.equal(r.body.availableCalls,53);assert.equal(r.body.unit,'TEST_CALL');assert.equal(r.body.availableCents,0);assert(!f.calls.some(c=>c.table?.startsWith('billing_')));
 await f.run(aiHistoryHandler,'history-list',{profile:'recruiter'});const query=f.calls.find(c=>c.table==='portal_ai_notes');assert.deepEqual(query.filters,[['user_id','owner'],['cohort_id','cohort'],['profile_role','recruiter']]);
});
