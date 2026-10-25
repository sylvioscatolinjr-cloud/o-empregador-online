import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {businessMetrics} from '../src/owner-business.mjs';import handler from '../api/owner.mjs';

const start='2026-10-01T03:00:00.000Z',end='2026-11-01T03:00:00.000Z';
test('business metrics count only confirmed payments in the period and current active subscriptions',()=>{
 const m=businessMetrics({start,end,now:Date.parse('2026-10-25T12:00:00Z'),
  orders:[{id:'a',profile_type:'Candidato',tier:1,cents:1990,months:1,status:'active',created_at:'2026-10-05T12:00:00+00:00'},
   {id:'b',profile_type:'Empresa',tier:2,cents:161730,months:3,status:'active',created_at:'2026-09-20T12:00:00+00:00'},
   {id:'c',profile_type:'Candidato',tier:2,cents:4990,months:1,status:'canceled',created_at:'2026-10-02T12:00:00+00:00',canceled_at:'2026-10-10T12:00:00+00:00'},
   {id:'d',profile_type:'Candidato',tier:1,cents:1990,months:1,status:'failed',created_at:'2026-10-03T12:00:00+00:00'}],
  topupOrders:[{id:'t',cents:1000},{id:'u',cents:2500}],
  payments:[{order_id:'a',cents:1990,eligible:true,period_start:'2026-10-05',period_end:'2026-11-05',provider_paid_on:'2026-10-05',checked_at:'2026-10-05T12:01:00+00:00'},
   {order_id:'b',cents:161730,eligible:true,period_start:'2026-09-20',period_end:'2026-12-20',provider_paid_on:'2026-09-20',checked_at:'2026-09-20T12:01:00+00:00'},
   {order_id:'c',cents:4990,eligible:false,provider_paid_on:'2026-10-02',checked_at:'2026-10-02T12:01:00+00:00'}],
  topupPayments:[{order_id:'t',cents:1000,eligible:true,provider_paid_on:'2026-10-24',checked_at:'2026-10-24T02:00:00+00:00'},{order_id:'u',cents:2500,eligible:false,checked_at:'2026-10-24T02:00:00+00:00'}],
  usage:[{request_id:'r1'},{request_id:'r2',refunded_at:'2026-10-24T02:00:00+00:00'},{request_id:'r3'}],
  lines:[{request_id:'r1',cents:100},{request_id:'r2',cents:100},{request_id:'r3',cents:60},{request_id:'r3',cents:40}],
  images:[{status:'completed',cents:250,owner_testing:false},{status:'completed',cents:500,owner_testing:true},{status:'failed',cents:500,owner_testing:false}]});
 assert.equal(m.subscribers.active,2);assert.equal(m.subscribers.byProfile.Candidato[1],1);assert.equal(m.subscribers.byProfile.Empresa[2],1);
 assert.equal(m.subscribers.mrrCents,1990+53910);
 assert.deepEqual(m.revenue,{subscriptionCents:1990,topupCents:1000,totalCents:2990,subscriptionPayments:1,topupPayments:1,undatedPayments:0,undatedCents:0});
 assert.equal(m.newSubscriptions,2);assert.equal(m.cancellations,1);
 assert.deepEqual(m.ai,{runs:2,refunded:1,spentCents:200,images:1,imageCents:250});assert.equal(m.truncated,false);
 assert.doesNotMatch(JSON.stringify(m),/user_id|email|cpf/i);
});

test('business view stays owner-only and reads billing tables only after authorization',async()=>{
 const keys=['SUPABASE_URL','SUPABASE_SECRET_KEY','PILOT_COHORT_ID'],old=Object.fromEntries(keys.map(k=>[k,process.env[k]])),oldFetch=globalThis.fetch;
 Object.assign(process.env,{SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_fixture',PILOT_COHORT_ID:'fixture'});
 let role='learner';const tables=[];
 globalThis.fetch=async(input)=>{const url=String(input);if(url.includes('/auth/v1/user'))return Response.json({id:'verified-user',email_confirmed_at:'2026-10-16'});if(url.includes('/pilot_memberships'))return Response.json({role,status:'active'});tables.push(new URL(url).pathname.split('/').pop());return Response.json([]);};
 const req={method:'GET',query:{view:'business',period:'month'},headers:{authorization:'Bearer fixture'}},response=()=>({code:0,setHeader(){},status(n){this.code=n;return this;},json(body){this.body=body;return this;}});
 try{let r=response();await handler(req,r);assert.equal(r.code,403);assert.equal(tables.length,0);
  role='pilot_owner';r=response();await handler(req,r);assert.equal(r.code,200);assert.equal(r.body.subscribers.active,0);assert.equal(r.body.revenue.totalCents,0);assert.match(r.body.scope,/Asaas/);
  assert.deepEqual([...new Set(tables)].sort(),['billing_live_orders','portal_ai_image_jobs','portal_ai_topup_orders','portal_ai_wallet_usage']);
 }finally{globalThis.fetch=oldFetch;for(const k of keys)if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}
});

test('legal pages are published and linked, and prototype leftovers are gone',async()=>{
 const [build,vercel,app,home,wallet,privacy,terms]=await Promise.all(['scripts/build.mjs','vercel.json','app/app.mjs','app/index.html','app/credit-wallet.mjs','app/privacidade.html','app/termos.html'].map(f=>readFile(new URL('../'+f,import.meta.url),'utf8')));
 assert.match(build,/'privacidade\.html','termos\.html'/);assert.doesNotMatch(build,/plataforma\.html/);
 assert.doesNotMatch(vercel,/chatgpt\.site/);const redirects=JSON.parse(vercel).redirects.map(r=>r.source);for(const s of ['/laboratorio','/laboratorio/:path*','/plataforma.html'])assert(redirects.includes(s));
 assert.doesNotMatch(app,/ChatGPT/);for(const text of [app,home,wallet])assert.match(text,/\/termos\.html[\s\S]*\/privacidade\.html/);
 for(const page of [privacy,terms]){assert.match(page,/Versão preliminar/);assert.match(page,/class="pendente"/);assert.match(page,/<meta name="robots" content="noindex,nofollow">/);}
});
