import test from 'node:test';import assert from 'node:assert/strict';import handler from '../api/owner.mjs';
test('owner API verifies token and active server membership before reading aggregate data',async()=>{
 const keys=['SUPABASE_URL','SUPABASE_SECRET_KEY','PILOT_COHORT_ID'],old=Object.fromEntries(keys.map(k=>[k,process.env[k]])),oldFetch=globalThis.fetch;
 Object.assign(process.env,{SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_fixture',PILOT_COHORT_ID:'fixture'});
 let role='learner',status='active',reads=0;
 globalThis.fetch=async(input)=>{const url=String(input);if(url.includes('/auth/v1/user'))return Response.json({id:'verified-user',email_confirmed_at:'2026-10-16'});if(url.includes('/pilot_memberships'))return Response.json({role,status});reads++;return Response.json({profiles:3,revenueCents:0,series:[]});};
 const req={method:'GET',headers:{authorization:'Bearer fixture'}},response=()=>({code:0,setHeader(){},status(n){this.code=n;return this;},json(body){this.body=body;return this;}});
 try{let r=response();await handler(req,r);assert.equal(r.code,403);assert.equal(reads,0);role='pilot_owner';status='suspended';r=response();await handler(req,r);assert.equal(r.code,403);assert.equal(reads,0);status='active';r=response();await handler(req,r);assert.equal(r.code,200);assert.equal(r.body.profiles,3);assert.equal(r.body.revenueCents,0);assert.equal(reads,2);assert(r.body.demo);r=response();await handler({...req,headers:{}},r);assert.equal(r.code,401);}finally{globalThis.fetch=oldFetch;for(const k of keys)if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}
});
