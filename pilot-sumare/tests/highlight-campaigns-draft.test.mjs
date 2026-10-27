import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {quoteHighlight} from '../src/highlight-pricing.mjs';
const U='11111111-1111-4111-8111-111111111111',C='22222222-2222-4222-8222-222222222222',T='33333333-3333-4333-8333-333333333333';
const terms='2026-10-26-highlight-v1';
test('draft ledger checks ownership and tier, prevents duplicates, applies payment once and rejects stale snapshots',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema pilot_private;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz);
 create table public.pilot_cohorts(id uuid primary key);
 create table public.pilot_memberships(user_id uuid,cohort_id uuid,role text,status text,is_fictitious boolean);
 create table public.portal_candidate_cards(id uuid,user_id uuid,cohort_id uuid,visible boolean,is_fictitious boolean);
 create table public.portal_listings(id uuid,publisher_id uuid,cohort_id uuid,kind text,status text,is_fictitious boolean);
 create function pilot_private.verified_paid_tier(uuid,uuid,text) returns integer language sql stable as $$select 4$$;
 grant usage on schema public,auth,pilot_private to service_role;grant select on all tables in schema public,auth to service_role;
 insert into auth.users values('${U}',now(),null);insert into public.pilot_cohorts values('${C}');insert into public.pilot_memberships values('${U}','${C}','learner','active',false);insert into public.portal_candidate_cards values('${T}','${U}','${C}',true,false);`);
 await db.exec(await readFile(new URL('../db/highlight-campaigns-draft.sql',import.meta.url),'utf8'));
 await db.exec('set role service_role');
 const create=(user=U,target=T,tier=4,cents=743)=>db.query('select public.portal_highlight_create($1,$2,$3,$4,$5,$6,$7,$8) as result',[user,C,'candidate',target,7,tier,cents,terms]);
 await assert.rejects(create(U,T,3,792),/price changed/);await assert.rejects(create(U,'44444444-4444-4444-8444-444444444444'),/invalid target/);
 const o=(await create()).rows[0].result;assert.equal(o.cents,743);await assert.rejects(create(),/existing purchase/);
 await db.query("update public.portal_highlight_orders set checkout_id='chk_1',status='pending' where id=$1",[o.id]);
 const apply=(p)=>db.query('select public.portal_highlight_apply($1,$2::jsonb)',[o.id,JSON.stringify(p)]);
 const payment={id:'pay_valid',checkout_id:'chk_1',cents:743,status:'CONFIRMED',eligible:true,checked_at:'2026-10-26T12:00:00Z',provider_paid_on:'2026-10-26'};
 await assert.rejects(apply({...payment,cents:1}),/payment mismatch/);await apply(payment);
 const first=(await db.query('select starts_at,ends_at,status from public.portal_highlight_orders where id=$1',[o.id])).rows[0];assert.equal(first.status,'confirmed');assert.equal(new Date(first.ends_at)-new Date(first.starts_at),7*86400000);
 await apply(payment);const again=(await db.query('select starts_at,ends_at from public.portal_highlight_orders where id=$1',[o.id])).rows[0];assert.deepEqual(again,{starts_at:first.starts_at,ends_at:first.ends_at});
 await apply({...payment,status:'REFUNDED',eligible:false,checked_at:'2026-10-26T12:01:00Z'});
 await apply(payment);const saved=(await db.query('select eligible,status from public.portal_highlight_payments where order_id=$1',[o.id])).rows[0];assert.equal(saved.eligible,false);assert.equal(saved.status,'REFUNDED');
 await assert.rejects(apply({...payment,id:'pay_second'}),/multiple payments/);
 await db.exec('reset role');for(const role of ['anon','authenticated']){const x=(await db.query("select has_table_privilege($1,'public.portal_highlight_orders','select') as table_access,has_function_privilege($1,'public.portal_highlight_create(uuid,uuid,text,uuid,integer,integer,integer,text)','execute') as function_access",[role])).rows[0];assert.equal(x.table_access,false);assert.equal(x.function_access,false);}
 }finally{await db.close();}
});
test('server quote agrees with the price book for all roles, durations and verified tiers',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema pilot_private;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz);create table public.pilot_cohorts(id uuid primary key);
 create table public.pilot_memberships(user_id uuid,cohort_id uuid,role text,status text,is_fictitious boolean);
 create table public.portal_candidate_cards(id uuid,user_id uuid,cohort_id uuid,visible boolean,is_fictitious boolean);
 create table public.portal_listings(id uuid,publisher_id uuid,cohort_id uuid,kind text,status text,is_fictitious boolean);
 create table pilot_private.fixture_tier(tier integer);insert into pilot_private.fixture_tier values(0);
 create function pilot_private.verified_paid_tier(uuid,uuid,text) returns integer language sql stable as $$select tier from pilot_private.fixture_tier$$;
 grant usage on schema public,auth,pilot_private to service_role;grant select on all tables in schema public,auth to service_role;grant select,update on pilot_private.fixture_tier to service_role;grant update on public.pilot_memberships to service_role;
 insert into auth.users values('${U}',now(),null);insert into public.pilot_cohorts values('${C}');insert into public.pilot_memberships values('${U}','${C}','learner','active',false);insert into public.portal_candidate_cards values('${T}','${U}','${C}',true,false);
 insert into public.portal_listings values('${T}','${U}','${C}','job','published',false),('${T}','${U}','${C}','course','published',false),('${T}','${U}','${C}','training','published',false);`);
 await db.exec(await readFile(new URL('../db/highlight-campaigns-draft.sql',import.meta.url),'utf8'));await db.exec('set role service_role');
 for(const [role,kind] of [['learner','candidate'],['recruiter','job'],['school_staff','course'],['school_staff','training']]){
  await db.query('update public.pilot_memberships set role=$1',[role]);
  for(const days of [7,15,30])for(let tier=0;tier<=4;tier++){
   await db.query('update pilot_private.fixture_tier set tier=$1',[tier]);const q=quoteHighlight({role,kind,days,verifiedTier:tier});
   const r=(await db.query('select public.portal_highlight_create($1,$2,$3,$4,$5,$6,$7,$8) as result',[U,C,kind,T,days,tier,q.cents,terms])).rows[0].result;
   assert.equal(r.cents,q.cents);assert.equal(r.base_cents,q.baseCents);assert.equal(r.discount_percent,q.discountPercent);
   await db.query('delete from public.portal_highlight_orders where id=$1',[r.id]);
  }
 }
 }finally{await db.close();}
});
