import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {liveCheckoutBody,livePayment,currentEntitlement,liveRequestFactory} from '../src/billing-live.mjs';
import {subscriptionsHandler} from '../api/subscriptions.mjs';
const order={id:'11111111-1111-4111-8111-111111111111',profile_type:'Candidato',tier:1,cycle:'MONTHLY',months:1,cents:1990,credit_cents:398,subscription_id:'sub_1'};
const payment={id:'pay_1',subscription:'sub_1',value:19.90,status:'CONFIRMED',dueDate:'2026-10-19'};
test('real checkout locks server price and has no card, CPF or Sandbox credentials',async()=>{
 const body=liveCheckoutBody(order,'https://www.oempregadoronline.com.br',new Date('2026-10-19T01:00:00Z'));
 assert.equal(body.items[0].value,19.90);assert.equal(body.subscription.nextDueDate,'2026-10-18');assert.equal(body.customerData,undefined);assert.deepEqual(body.chargeTypes,['RECURRENT']);
 assert.throws(()=>liveCheckoutBody({...order,cents:1},'https://www.oempregadoronline.com.br'));
 let hits=0;const noKey=liveRequestFactory({ASAAS_SANDBOX_API_KEY:'fixture'},()=>hits++);await assert.rejects(noKey('/checkouts'));assert.equal(hits,0);
 const request=liveRequestFactory({ASAAS_PRODUCTION_API_KEY:'fixture'},async(url,opts)=>{assert.equal(url,'https://api.asaas.com/v3/payments/pay_1');assert.equal(opts.redirect,'error');return Response.json({id:'pay_1'});});await request('/payments/pay_1');await assert.rejects(request('/customers'));await assert.rejects(request('/payments/../customers'));
});
test('only confirmed exact payment grants a period; refunds, chargebacks and future periods cannot grant',()=>{
 const p=livePayment(payment,order);assert.equal(p.eligible,true);assert.equal(p.period_end,'2026-11-19T00:00:00-03:00');
 for(const mod of [{status:'PENDING'},{status:'REFUNDED'},{chargeback:{status:'REQUESTED'}},{refunds:[{status:'PENDING'}]},{deleted:true}])assert.equal(livePayment({...payment,...mod},order).eligible,false);
 assert.equal(livePayment({...payment,value:1},order).eligible,false);assert.throws(()=>livePayment({...payment,subscription:'sub_other'},order));
 const rows=[{...p,order_id:order.id,credit_cents:398,spent_cents:100}];
 assert.equal(currentEntitlement([order],rows,Date.parse('2026-10-20')).creditCents,298);
 assert.equal(currentEntitlement([order],rows,Date.parse('2026-11-19T03:00:00Z')).tier,0);
 assert.equal(currentEntitlement([order],rows,Date.parse('2026-10-18')).tier,0);
 assert.equal(currentEntitlement([{...order,status:'canceled'}],rows,Date.parse('2026-10-20')).tier,1);
 const renewal={...rows[0],id:'pay_2',period_start:'2026-11-19T03:00:00Z',period_end:'2026-12-19T03:00:00Z',spent_cents:0};
 assert.equal(currentEntitlement([order],[...rows,renewal],Date.parse('2026-11-20')).creditCents,398);
});
const env={SUPABASE_URL:'https://fixture.test',SUPABASE_SECRET_KEY:'server',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',ASAAS_PRODUCTION_API_KEY:'prod',ASAAS_PRODUCTION_WEBHOOK_TOKEN:'secret',PILOT_COHORT_ID:'cohort',APP_ORIGIN:'https://www.oempregadoronline.com.br'};
const res=()=>({setHeader(){},status(n){this.code=n;return this},json(body){this.body=body;return this}});
test('anonymous, unverified, fictitious and non-owner buyers cannot create real payments',async()=>{
 let role='learner',confirmed=true,fictitious=false,reauth=true,hits=0;
 const db={auth:{getUser:async()=>({data:{user:{id:'u',email:'u@example.test',email_confirmed_at:confirmed?'yes':null}}}),signInWithPassword:async()=>({data:{user:{id:reauth?'u':'other'}}})},from(table){const q={select(){return q},eq(){return q},maybeSingle:async()=>({data:{role,status:'active',is_fictitious:fictitious}}),single:async()=>({data:{connected:true,account_approved:true,webhook_ready:true}})};return q}};
 const handler=subscriptionsHandler({env,clientFactory:()=>db,fetchImpl:async()=>{hits++;throw Error('unexpected provider request');}});
 const request={method:'POST',headers:{authorization:'Bearer t',origin:env.APP_ORIGIN,'content-type':'application/json'},body:{action:'checkout',password:'fixture'}};
 let r=res();await handler({...request,headers:{}},r);assert.equal(r.code,401);
 confirmed=false;r=res();await handler(request,r);assert.equal(r.code,401);confirmed=true;
 fictitious=true;r=res();await handler(request,r);assert.equal(r.code,403);fictitious=false;
 r=res();await handler(request,r);assert.equal(r.code,403);
 role='pilot_owner';reauth=false;r=res();await handler(request,r);assert.equal(r.code,403);
 reauth=true;r=res();await handler({...request,headers:{...request.headers,origin:'https://evil.test'}},r);assert.equal(r.code,403);
 r=res();await handler({method:'POST',headers:{'asaas-access-token':'wrong'},query:{action:'webhook'},body:{}},r);assert.equal(r.code,401);assert.equal(hits,0);
 r=res();await handler({method:'GET',query:{action:'config'},headers:{}},r);assert.equal(r.code,200);assert.deepEqual(Object.keys(r.body).sort(),['origin','publishableKey','supabaseURL']);
});
test('SQL ledger is idempotent, preserves spent credits, ignores stale snapshots and denies clients',async()=>{
 const db=new PGlite();try{
 await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create table public.pilot_cohorts(id uuid primary key);");
 await db.exec(await readFile(new URL('../db/billing-live.sql',import.meta.url),'utf8'));
 const uid='22222222-2222-4222-8222-222222222222',cid='33333333-3333-4333-8333-333333333333';
 await db.query('insert into auth.users values($1)',[uid]);await db.query('insert into pilot_cohorts values($1)',[cid]);
 await db.query("insert into billing_live_orders(id,user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version) values($1,$2,$3,'Candidato',1,'MONTHLY',1990,398,1,'test')",[order.id,uid,cid]);
 const apply=p=>db.query('select billing_live_apply_payment($1,$2::jsonb)',[order.id,JSON.stringify(p)]);
 const p=livePayment(payment,order,'2026-10-19T12:00:00Z');await apply(p);await db.exec("update billing_live_payments set spent_cents=100 where id='pay_1'");await apply(p);
 let row=(await db.query('select * from billing_live_payments')).rows[0];assert.equal(row.spent_cents,100);assert.equal(row.credit_cents,398);
 await apply({...p,eligible:false,status:'REFUNDED',checked_at:'2026-10-20T12:00:00Z'});await apply(p);row=(await db.query('select * from billing_live_payments')).rows[0];assert.equal(row.eligible,false);
 await assert.rejects(apply({...p,cents:1}));
 await db.exec('set role authenticated');await assert.rejects(db.query('select * from billing_live_payments'));await assert.rejects(apply(p));
 }finally{await db.close();}
});
