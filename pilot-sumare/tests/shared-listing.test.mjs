import test from 'node:test';
import assert from 'node:assert/strict';
import {discoveryHandler} from '../src/discovery-handler.mjs';
const env={SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'server-only',PILOT_COHORT_ID:'server-cohort'};
const id='60989cbe-29bd-42c3-a938-bc04a43c3f61';
function fixture({listing=true,role='school_staff',status='active',confirmed=true,banned=false,fail=false}={}){
 const calls=[];const db={from(table){const q={select(fields){calls.push([table,'select',fields]);return q},eq(k,v){calls.push([table,k,v]);return q},async maybeSingle(){if(fail)return {error:{}};return {data:table==='portal_listings'?(listing?{id,publisher_id:'private-id',title:'Curso',kind:'course',description:'a'.repeat(1800),is_fictitious:true}:null):{role,status,is_fictitious:false}}}};return q},auth:{admin:{async getUserById(uid){calls.push(['auth',uid]);return {data:{user:{email:'private@example.test',email_confirmed_at:confirmed?'yes':null,banned_until:banned?'2099-01-01':null}}}}}}};
 async function run(query={id,cohort:'forged'}){const res={setHeader(){},status(code){this.code=code;return this},json(body){this.body=body;return this}};await discoveryHandler({env,clientFactory:()=>db})({method:'GET',query,headers:{}},res);return res}return {calls,run};
}
test('shared lookup returns full publication outside feed pagination without private publisher data',async()=>{
 const f=fixture(),r=await f.run();assert.equal(r.code,200);assert.equal(r.body.items[0].description.length,1800);assert(!JSON.stringify(r.body).includes('private'));assert(f.calls.some(c=>c[0]==='portal_listings'&&c[1]==='cohort_id'&&c[2]==='server-cohort'));assert(f.calls.some(c=>c[1]==='status'&&c[2]==='published'));assert(f.calls.some(c=>c[0]==='pilot_memberships'&&c[1]==='cohort_id'&&c[2]==='server-cohort'));
});
test('shared lookup hides unavailable, inactive, wrong-role, unconfirmed and banned publishers',async()=>{
 for(const opts of [{listing:false},{status:'suspended'},{role:'learner'},{confirmed:false},{banned:true}]){const r=await fixture(opts).run();assert.equal(r.code,200);assert.deepEqual(r.body,{items:[]});}
 const f=fixture();assert.equal((await f.run({id:['x']})).code,400);assert.equal((await f.run({id:'bad'})).code,400);assert.deepEqual(f.calls,[]);assert.equal((await fixture({fail:true}).run()).code,503);
});
