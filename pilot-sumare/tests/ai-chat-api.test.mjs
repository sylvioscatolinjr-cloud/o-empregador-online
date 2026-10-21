import test from 'node:test';
import assert from 'node:assert/strict';
import {aiChatHandler} from '../api/ai-chat.mjs';
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'fake',PILOT_COHORT_ID:'cohort',APP_ORIGIN:'https://portal.example',OPENAI_API_KEY:'fake',AI_CHAT_MODEL:'gpt-4.1-mini',AI_CHAT_METERING_ENABLED:'true'};
function fixture({balance=3,role='learner',providerOk=true,enabled=true}={}){
 const calls=[];
 const db={auth:{async getUser(){return {data:{user:{id:'user-1',email_confirmed_at:'today'}},error:null}}},from(){const q={select(){return q},eq(){return q},async maybeSingle(){return {data:{role,status:'active',is_fictitious:false},error:null}}};return q},async rpc(name,args){calls.push([name,args]);if(name==='portal_ai_paid_reserve')return balance>0?{data:balance-1,error:null}:{error:{message:'insufficient'}};return {data:balance,error:null}}};
 const fetchImpl=async()=>{calls.push(['provider']);return {ok:providerOk,async json(){return {output:[{content:[{type:'output_text',text:'Resposta de teste'}]}]}}}};
 const handler=aiChatHandler({env:{...env,...(!enabled?{AI_CHAT_METERING_ENABLED:'false'}:{})},clientFactory:()=>db,fetchImpl});
 const res={setHeader(){},status(code){this.code=code;return this},json(body){this.body=body;return this}};
 const req={method:'POST',headers:{origin:env.APP_ORIGIN,'content-type':'application/json',authorization:'Bearer token'},body:{question:'Como crescer profissionalmente?'}};
 return {handler,res,req,calls};
}
test('disabled flag never debits or invokes model',async()=>{const f=fixture({enabled:false});await f.handler(f.req,f.res);assert.equal(f.res.code,503);assert.equal(f.calls.length,0)});
test('insufficient credits prevents provider invocation',async()=>{const f=fixture({balance:0});await f.handler(f.req,f.res);assert.equal(f.res.code,402);assert.deepEqual(f.calls.map(x=>x[0]),['portal_ai_paid_reserve'])});
test('successful response reserves one credit and returns model text',async()=>{const f=fixture();await f.handler(f.req,f.res);assert.equal(f.res.code,200);assert.equal(f.res.body.answer,'Resposta de teste');assert.equal(f.res.body.creditsCharged,1);assert.deepEqual(f.calls.map(x=>x[0]),['portal_ai_paid_reserve','provider'])});
test('provider error refunds reserved credit',async()=>{const f=fixture({providerOk:false});await f.handler(f.req,f.res);assert.equal(f.res.code,503);assert.deepEqual(f.calls.map(x=>x[0]),['portal_ai_paid_reserve','provider','portal_ai_paid_refund'])});
test('unsupported role never reserves credits',async()=>{const f=fixture({role:'pilot_owner'});await f.handler(f.req,f.res);assert.equal(f.res.code,403);assert.equal(f.calls.length,0)});
test('invalid origin never reserves credits',async()=>{const f=fixture();f.req.headers.origin='https://evil.example';await f.handler(f.req,f.res);assert.equal(f.res.code,403);assert.equal(f.calls.length,0)});
