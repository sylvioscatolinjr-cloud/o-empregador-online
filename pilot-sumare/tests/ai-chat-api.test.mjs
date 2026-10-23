import {getGuidedTasks} from '../src/ai-agent-catalog.mjs';
import {quotePlan} from '../src/billing-plans.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {aiChatHandler} from '../src/ai-chat-handler.mjs';
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'fake',PILOT_COHORT_ID:'cohort',APP_ORIGIN:'https://portal.example',OPENAI_API_KEY:'fake',AI_CHAT_MODEL:'gpt-4.1-mini',AI_CHAT_METERING_ENABLED:'true'};
function fixture({balance=3,role='learner',providerOk=true,enabled=true,tier=2,incomplete=false,foreignCohort=false}={}){
 const calls=[];const profile={learner:'Candidato',recruiter:'Empresa',school_staff:'Instituição de Ensino'}[role]||'Candidato',quote=quotePlan(profile,Math.max(1,tier));
 const db={auth:{async getUser(){return {data:{user:{id:'user-1',email_confirmed_at:'today'}},error:null}}},from(name){if(name==='billing_live_orders')return {select(){return this},eq(){return this},then(resolve,reject){return Promise.resolve({data:[{id:'o',cohort_id:foreignCohort?'other':env.PILOT_COHORT_ID,user_id:'user-1',profile_type:profile,tier,cycle:'MONTHLY',cents:quote.cents}],error:null}).then(resolve,reject)}};if(name==='billing_live_payments')return {select(){return this},async in(){return {data:[{id:'p',order_id:'o',eligible:true,cents:quote.cents,credit_cents:quote.aiCreditCents,period_start:'2020-01-01',period_end:'2099-01-01'}],error:null}}};const q={select(){return q},eq(){return q},async maybeSingle(){return {data:{role,status:'active',is_fictitious:false},error:null}}};return q},async rpc(name,args){calls.push([name,args]);if(name==='portal_ai_wallet_reserve')return balance>0&&!foreignCohort?{data:balance-1,error:null}:{error:{message:'insufficient'}};return {data:balance,error:null}}};
 const fetchImpl=async(url,options)=>{calls.push(['provider',JSON.parse(options.body)]);return {ok:providerOk,async json(){return {status:incomplete?'incomplete':'completed',output:[{content:[{type:'output_text',text:'Resposta de teste'}]}]}}}};
 const handler=aiChatHandler({env:{...env,...(!enabled?{AI_CHAT_METERING_ENABLED:'false'}:{})},clientFactory:()=>db,fetchImpl});
 const res={setHeader(){},status(code){this.code=code;return this},json(body){this.body=body;return this}};
 const req={method:'POST',headers:{origin:env.APP_ORIGIN,'content-type':'application/json',authorization:'Bearer token'},body:{taskId:'interview_practice',question:'Como crescer profissionalmente?'}};
 return {handler,res,req,calls};
}
test('disabled flag never debits or invokes model',async()=>{const f=fixture({enabled:false});await f.handler(f.req,f.res);assert.equal(f.res.code,503);assert.equal(f.calls.length,0)});
test('owner can use candidate tasks at every tier but cannot invoke company agent',async()=>{const f=fixture({role:'pilot_owner',tier:1});f.req.body.taskId=getGuidedTasks('learner',1).find(t=>t.available&&t.id!=='resume_review').id;await f.handler(f.req,f.res);assert.equal(f.res.code,200);assert.equal(f.res.body.agent,'candidate');for(const taskId of ['job_description']){const denied=fixture({role:'pilot_owner',tier:1});denied.req.body.taskId=taskId;await denied.handler(denied.req,denied.res);assert([400,403].includes(denied.res.code));assert.equal(denied.calls.length,0);}});
test('insufficient credits prevents provider invocation',async()=>{const f=fixture({balance:0});await f.handler(f.req,f.res);assert.equal(f.res.code,402);assert.deepEqual(f.calls.map(x=>x[0]),['portal_ai_wallet_reserve'])});
test('successful response reserves one credit and returns model text',async()=>{const f=fixture();await f.handler(f.req,f.res);assert.equal(f.res.code,200);assert.equal(f.res.body.answer,'Resposta de teste');assert.equal(f.res.body.creditsCharged,1);assert.deepEqual(f.calls.map(x=>x[0]),['portal_ai_wallet_reserve','provider'])});
test('provider error refunds reserved credit',async()=>{const f=fixture({providerOk:false});await f.handler(f.req,f.res);assert.equal(f.res.code,503);assert.deepEqual(f.calls.map(x=>x[0]),['portal_ai_wallet_reserve','provider','portal_ai_wallet_refund'])});
test('unsupported role never reserves credits',async()=>{const f=fixture({role:'unsupported'});await f.handler(f.req,f.res);assert.ok([400,403].includes(f.res.code));assert.equal(f.calls.length,0)});
test('invalid origin never reserves credits',async()=>{const f=fixture();f.req.headers.origin='https://evil.example';await f.handler(f.req,f.res);assert.ok([400,403].includes(f.res.code));assert.equal(f.calls.length,0)});

test('formerly higher-tier task works at free tier with paid wallet',async()=>{const f=fixture({tier:0});f.req.body.taskId='career_gps';await f.handler(f.req,f.res);assert.equal(f.res.code,200);assert.equal(f.calls[0][1].p_cohort,env.PILOT_COHORT_ID)});
test('foreign and missing task IDs never debit',async()=>{for(const taskId of ['course_planning',undefined,'__proto__']){const f=fixture();f.req.body.taskId=taskId;await f.handler(f.req,f.res);assert.equal(f.res.code,400);assert.equal(f.calls.length,0)}});

test('resume review cannot use the free text chat route',async()=>{const f=fixture();f.req.body.taskId='resume_review';await f.handler(f.req,f.res);assert.equal(f.res.code,400);assert.equal(f.calls.length,0);});

for(const role of ['learner','recruiter','school_staff'])test(role+' checks every function at all four tiers before charging and fixes the server instruction',async()=>{
 for(const task of getGuidedTasks(role,0))for(const tier of [0,1,2,3]){
  if(task.id==='resume_review'||task.mode==='external_search')continue;
  const f=fixture({role,tier});f.req.body.taskId=task.id;await f.handler(f.req,f.res);
  assert.equal(f.res.code,tier>=task.minTier?200:403,`${task.id} tier ${tier}`);
  if(tier<task.minTier)assert.equal(f.calls.length,0);
  else{assert.deepEqual(f.calls.map(x=>x[0]),['portal_ai_wallet_reserve','provider']);const payload=f.calls[1][1];assert.equal(payload.store,false);assert(payload.input[0].content.includes(task.instruction));}
 }
});
test('truncated provider result refunds and is not shown as completed',async()=>{const f=fixture({incomplete:true});await f.handler(f.req,f.res);assert.equal(f.res.code,503);assert.deepEqual(f.calls.map(x=>x[0]),['portal_ai_wallet_reserve','provider','portal_ai_wallet_refund']);});

test('payment for another cohort cannot unlock chat or debit credits in any profile',async()=>{for(const role of ['learner','recruiter','school_staff']){const f=fixture({role,tier:3,foreignCohort:true});f.req.body.taskId=getGuidedTasks(role,3).find(t=>t.id!=='resume_review').id;await f.handler(f.req,f.res);assert.equal(f.res.code,402);assert.equal(f.calls.length,1);assert.equal(f.calls[0][1].p_cohort,env.PILOT_COHORT_ID);}});
