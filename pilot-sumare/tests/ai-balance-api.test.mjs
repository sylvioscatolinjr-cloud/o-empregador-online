import test from 'node:test';
import assert from 'node:assert/strict';
import {aiBalanceHandler} from '../src/ai-balance-handler.mjs';
function fixture({role='learner',status='active',balance=4}={}){
 const queried=[];
 const db={async rpc(name,args){assert.equal(name,'portal_ai_wallet_balance');assert.deepEqual(args,{p_user:'uid',p_cohort:'cohort'});queried.push(name);return {data:{availableCents:balance*100,availableCalls:balance}}},auth:{async getUser(){return {data:{user:{id:'uid',email_confirmed_at:'2026-10-21'}},error:null}}},from(table){queried.push(table);const q={select(){return q},eq(k,v){if(k==='user_id')assert.equal(v,'uid');return q},in(){return q},async maybeSingle(){return {data:{role,status,is_fictitious:false},error:null}}};if(table==='billing_live_orders')q.then=(resolve)=>Promise.resolve({data:[{id:'order-1'}],error:null}).then(resolve);if(table==='billing_live_payments')q.then=(resolve)=>Promise.resolve({data:[{credit_cents:balance*100,spent_cents:0,eligible:true,period_start:'2026-01-01T00:00:00Z',period_end:'2099-01-01T00:00:00Z'}],error:null}).then(resolve);return q}};
 const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'fake',PILOT_COHORT_ID:'cohort'};
 const res={setHeader(){},status(n){this.code=n;return this},json(x){this.body=x;return this}};
 const req={method:'GET',headers:{authorization:'Bearer fake'}};
 return {handler:aiBalanceHandler({env,clientFactory:()=>db}),res,req,queried};
}
test('only returns authenticated user wallet',async()=>{const f=fixture();await f.handler(f.req,f.res);assert.equal(f.res.code,200);assert.equal(f.res.body.availableCalls,4);assert.deepEqual(f.queried,['pilot_memberships','portal_ai_wallet_balance'])});
test('owner wallet remains scoped to authenticated owner',async()=>{const f=fixture({role:'pilot_owner'});await f.handler(f.req,f.res);assert.equal(f.res.code,200);assert.equal(f.res.body.availableCalls,4);});
test('rejects unsupported and suspended membership',async()=>{for(const input of [{role:'unsupported'},{status:'suspended'}]){const f=fixture(input);await f.handler(f.req,f.res);assert.equal(f.res.code,403);assert.deepEqual(f.queried,['pilot_memberships'])}});
test('rejects anonymous balance queries',async()=>{const f=fixture();delete f.req.headers.authorization;await f.handler(f.req,f.res);assert.equal(f.res.code,401);assert.equal(f.queried.length,0)});
