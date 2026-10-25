import test from 'node:test';
import assert from 'node:assert/strict';
import {subscriptionsHandler} from '../api/subscriptions.mjs';

const env={SUPABASE_URL:'https://fixture.test',SUPABASE_SECRET_KEY:'server',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',ASAAS_PRODUCTION_API_KEY:'fixture',ASAAS_PRODUCTION_WEBHOOK_TOKEN:'fixture',PILOT_COHORT_ID:'current',OEO_OWNER_TEST_USER_ID:'actor',APP_ORIGIN:'https://portal.example'};
function fixture({role='learner',orders=[],payments=[],proof=true}={}){
 const calls=[],patches=[];
 const db={auth:{getUser:async()=>({data:{user:{id:'actor',email:'actor@example.invalid',email_confirmed_at:'yes'}}}),signInWithPassword:async()=>({data:{user:{id:proof?'actor':'other'}}})},from(table){
  const filters=[];let patch;
  const rows=()=>{const source=table==='billing_live_orders'?orders:table==='billing_live_payments'?payments:table==='pilot_memberships'?[{user_id:'actor',cohort_id:'current',role,status:'active',is_fictitious:false}]:table==='billing_live_configuration'?[{id:true,connected:true,account_approved:true,webhook_ready:true}]:[];return source.filter(r=>filters.every(f=>f(r)));};
  const resolve=()=>{const data=rows();if(patch){for(const r of data)Object.assign(r,patch);patches.push({table,count:data.length,patch});}return {data,error:null};};
  const q={select(){return q},eq(k,v){filters.push(r=>r[k]===v);return q},in(k,vs){filters.push(r=>vs.includes(r[k]));return q},is(k,v){filters.push(r=>r[k]===v);return q},order(){return q},limit(){return q},update(p){patch=p;return q},then(a,b){return Promise.resolve(resolve()).then(a,b)},maybeSingle:async()=>{const r=resolve();return {data:r.data[0]||null}},single:async()=>{const r=resolve();return r.data.length===1?{data:r.data[0]}:{error:{message:'not found'}}}};return q;
 },rpc:async(name,args)=>{calls.push({rpc:name,args});return {data:null}}};
 const handler=subscriptionsHandler({env,clientFactory:()=>db,fetchImpl:async(url,options)=>{calls.push({url,method:options.method});return Response.json(url.includes('/payments?')?{data:[]}:{});}});
 return {calls,patches,async run(action,id,profile){const res={setHeader(){},status(n){this.code=n;return this},json(body){this.body=body;return this}};await handler({method:action?'POST':'GET',query:profile?{profile}:undefined,headers:{authorization:'Bearer fixture',origin:env.APP_ORIGIN,'content-type':'application/json'},body:action?{action,id,password:'synthetic'}:undefined},res);return res;}};
}
const order=(id,extra={})=>({id,user_id:'actor',cohort_id:'current',profile_type:'Candidato',tier:1,months:1,cents:1990,checkout_id:null,subscription_id:'sub_'+id,status:'active',...extra});
const payment=(id,extra={})=>({id:'pay_'+id,order_id:id,eligible:true,credit_cents:398,spent_cents:100,period_start:new Date(Date.now()-3600000).toISOString(),period_end:new Date(Date.now()+86400000).toISOString(),...extra});

test('subscription history and current benefits isolate cohort, actor and active profile',async()=>{
 const f=fixture({role:'school_staff',orders:[order('current',{profile_type:'Instituição de Ensino',tier:2}),order('old-profile'),order('foreign',{cohort_id:'foreign'}),order('other',{user_id:'other'})],payments:[payment('current'),payment('old-profile'),payment('foreign'),payment('other')]});
 const r=await f.run();assert.equal(r.code,200);assert.deepEqual(r.body.orders.map(o=>o.id),['current','old-profile']);assert.deepEqual(r.body.payments.map(p=>p.order_id),['current','old-profile']);assert.equal(r.body.entitlement.tier,2);assert.equal(f.calls.length,0);
 const old=fixture({role:'school_staff',orders:[order('old-profile')],payments:[payment('old-profile')]});assert.equal((await old.run()).body.entitlement.tier,0);
});
for(const action of ['sync','cancel'])test(action+' refuses another cohort or account before reaching Asaas',async()=>{
 for(const extra of [{cohort_id:'foreign'},{user_id:'other'}]){const f=fixture({orders:[order('foreign',extra)]});const r=await f.run(action,'foreign');assert.equal(r.code,503);assert.equal(f.calls.length,0);assert.equal(f.patches.length,0);}
});
test('cancellation stops renewal while preserving existing paid entitlement and payment rows',async()=>{
 const paid=payment('own'),f=fixture({orders:[order('own')],payments:[paid]});const before=structuredClone(paid);
 assert.equal((await f.run('cancel','own')).code,200);assert(f.calls.some(c=>c.method==='DELETE'&&c.url.endsWith('/subscriptions/sub_own')));assert.equal((await f.run()).body.entitlement.tier,1);assert.deepEqual(paid,before);assert(!f.patches.some(p=>p.table==='billing_live_payments'));
});
test('cancel requires password proof and old profile sync cannot claim active profile benefits',async()=>{
 const denied=fixture({orders:[order('own')],proof:false});assert.equal((await denied.run('cancel','own')).code,403);assert.equal(denied.calls.length,0);
 const f=fixture({role:'school_staff',orders:[order('old')],payments:[payment('old')]});const r=await f.run('sync','old');assert.equal(r.code,200);assert(!r.body.message.includes('Plano e créditos liberados'));
});

for(const [role,profile] of [['learner','Candidato'],['recruiter','Empresa'],['school_staff','Instituição de Ensino']])test('designated owner previews '+profile+' without changing purchase identity',async()=>{
 const f=fixture({role:'pilot_owner'}),r=await f.run(null,null,role);assert.equal(r.code,200);assert.equal(r.body.profile,profile);assert.equal(r.body.ownerTesting,true);assert.equal(r.body.canPurchase,role==='learner');assert.equal(r.body.previewProfile,role!=='learner');assert.equal(f.calls.length,0);
});
test('ordinary users cannot switch pricing profile with query parameters',async()=>{
 for(const role of ['learner','recruiter','school_staff']){const r=await fixture({role}).run(null,null,role==='learner'?'recruiter':'learner');assert.equal(r.body.profile,{learner:'Candidato',recruiter:'Empresa',school_staff:'Instituição de Ensino'}[role]);assert.equal(r.body.previewProfile,false);assert.equal(r.body.ownerTesting,false);}
});
