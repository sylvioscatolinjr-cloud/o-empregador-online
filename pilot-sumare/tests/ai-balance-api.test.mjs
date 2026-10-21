import test from 'node:test';
import assert from 'node:assert/strict';
import {aiBalanceHandler} from '../api/ai-balance.mjs';
function fixture({role='learner',status='active',balance=4}={}){
 const queried=[];
 const db={auth:{async getUser(){return {data:{user:{id:'uid',email_confirmed_at:'2026-10-21'}},error:null}}},from(table){queried.push(table);const q={select(){return q},eq(k,v){if(k==='user_id')assert.equal(v,'uid');return q},async maybeSingle(){return {data:table==='pilot_memberships'?{role,status,is_fictitious:false}:{balance},error:null}}};return q}};
 const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SECRET_KEY:'fake',PILOT_COHORT_ID:'cohort'};
 const res={setHeader(){},status(n){this.code=n;return this},json(x){this.body=x;return this}};
 const req={method:'GET',headers:{authorization:'Bearer fake'}};
 return {handler:aiBalanceHandler({env,clientFactory:()=>db}),res,req,queried};
}
test('only returns authenticated user wallet',async()=>{const f=fixture();await f.handler(f.req,f.res);assert.equal(f.res.code,200);assert.equal(f.res.body.balance,4);assert.deepEqual(f.queried,['pilot_memberships','portal_ai_wallets'])});
test('rejects owner and suspended membership',async()=>{for(const input of [{role:'pilot_owner'},{status:'suspended'}]){const f=fixture(input);await f.handler(f.req,f.res);assert.equal(f.res.code,403);assert.deepEqual(f.queried,['pilot_memberships'])}});
test('rejects anonymous balance queries',async()=>{const f=fixture();delete f.req.headers.authorization;await f.handler(f.req,f.res);assert.equal(f.res.code,401);assert.equal(f.queried.length,0)});
