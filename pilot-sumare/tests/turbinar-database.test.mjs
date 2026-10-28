import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';import {randomUUID as uuid} from 'node:crypto';
test('campaigns freeze opt-in adult audience, require owner approval and atomically debit purchased credits once',async()=>{const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz);
 create table pilot_cohorts(id uuid primary key);
 create table pilot_memberships(user_id uuid,cohort_id uuid,role text,status text default 'active',is_fictitious boolean default false,age_band text default '18_plus');
 create table pilot_profiles(user_id uuid,city text,state_code text);
 create table portal_organizations(user_id uuid,cohort_id uuid,city text,state_code text);
 create table portal_listings(id uuid primary key,publisher_id uuid,cohort_id uuid,status text,is_fictitious boolean);
 create table portal_notice_attachments(id uuid primary key,created_by uuid,cohort_id uuid,status text,created_at timestamptz default now(),filename text,file_type text,byte_size integer);
 create table portal_notifications(id uuid primary key default gen_random_uuid(),cohort_id uuid,user_id uuid,title text,body text,listing_id uuid,access_url text,attachment_id uuid,attachment_name text);
 create table portal_ai_topup_orders(id uuid primary key,user_id uuid,cohort_id uuid,cents int,created_at timestamptz default now());
 create table portal_ai_topup_payments(id text primary key,order_id uuid,cents int,spent_cents int default 0,eligible boolean default true);
 create function portal_ai_wallet_balance(p_user uuid,p_cohort uuid) returns jsonb language sql as $$select jsonb_build_object('purchasedCents',coalesce(sum(greatest(p.cents-p.spent_cents,0)) filter(where p.eligible),0),'held',coalesce(bool_or(not p.eligible and p.spent_cents>0),false)) from public.portal_ai_topup_payments p join public.portal_ai_topup_orders o on o.id=p.order_id where o.user_id=p_user and o.cohort_id=p_cohort$$;
 grant usage on schema auth to service_role;grant select on auth.users to service_role;grant all on all tables in schema public to service_role;`);
 await db.exec(await readFile(new URL('../db/turbinar.sql',import.meta.url),'utf8'));
 const co=uuid(),sender=uuid(),owner=uuid(),a=uuid(),b=uuid(),minor=uuid(),stranger=uuid(),otherCo=uuid();
 await db.query('insert into pilot_cohorts values($1),($2)',[co,otherCo]);
 for(const [u,role,c,age] of [[sender,'school_staff',co,'18_plus'],[owner,'pilot_owner',co,'18_plus'],[a,'learner',co,'18_plus'],[b,'learner',co,'18_plus'],[minor,'learner',co,'16_17'],[stranger,'learner',otherCo,'18_plus']]){await db.query('insert into auth.users(id) values($1)',[u]);await db.query('insert into pilot_memberships(user_id,cohort_id,role,age_band) values($1,$2,$3,$4)',[u,c,role,age]);await db.query("insert into pilot_profiles values($1,'Sumaré','SP')",[u]);}
 await db.exec('set role service_role');
 const pref=(u,on,c=co)=>db.query("select portal_campaign_preference($1,$2,$3,array['industry'])",[u,c,on]);
 const quote=async()=> (await db.query('select portal_campaign_quote($1,$2,$3) id',[sender,co,{title:'Nova turma',body:'Inscrições abertas',filters:{role:'learner',state:'SP',city:'Sumaré',topic:'industry'}}])).rows[0].id;
 const action=async(id,act,user=sender,cents=10)=> (await db.query('select portal_campaign_action($1,$2,$3,$4,$5,$6) result',[user,co,id,act,act==='reject'?'Correção necessária':'',cents])).rows[0].result;
 await assert.rejects(pref(minor,true));await pref(a,true);await pref(b,true);await pref(stranger,true,otherCo);
 const id=await quote();assert.equal((await db.query('select quoted_count from portal_campaigns where id=$1',[id])).rows[0].quoted_count,2);
 await assert.rejects(action(id,'send'));await assert.rejects(action(id,'approve',sender));await assert.rejects(action(id,'submit',sender,1));
 await action(id,'submit');let result=await action(id,'approve',owner);assert.equal(result.missingCents,10);assert.equal((await db.query('select count(*) n from portal_notifications')).rows[0].n,0);
 const order=uuid();await db.query('insert into portal_ai_topup_orders(id,user_id,cohort_id,cents) values($1,$2,$3,1000)',[order,sender,co]);await db.query("insert into portal_ai_topup_payments(id,order_id,cents) values('synthetic',$1,1000)",[order]);
 // Withdrawal shrinks the approved audience, never increases price.
 await pref(b,false);result=await action(id,'send');assert.equal(result.count,1);assert.equal(result.chargedCents,5);
 assert.equal((await action(id,'send')).duplicate,true);await action(id,'approve',owner);
 assert.equal((await db.query("select spent_cents from portal_ai_topup_payments where id='synthetic'")).rows[0].spent_cents,5);
 assert.equal((await db.query('select user_id from portal_notifications')).rows[0].user_id,a);
 await assert.rejects(action(id,'send',stranger));
 // Failure during inbox insertion rolls the entire wallet operation back.
 const second=await quote();await action(second,'submit',sender,5);
 await db.exec("reset role;create function fail_delivery() returns trigger language plpgsql as $$begin raise exception 'synthetic delivery failure';end$$;create trigger fail_delivery before insert on portal_notifications for each row execute function fail_delivery();set role service_role;");
 await assert.rejects(action(second,'approve',owner));assert.equal((await db.query("select spent_cents from portal_ai_topup_payments where id='synthetic'")).rows[0].spent_cents,5);
 await db.exec('reset role;drop trigger fail_delivery on portal_notifications;set role service_role;');
 await action(second,'reject',owner);await assert.rejects(action(second,'send'));
 // Zero audience cannot be submitted and forged listing ownership fails.
 await pref(a,false);const empty=await quote();await assert.rejects(action(empty,'submit',sender,0));
 for(const role of ['anon','authenticated']){await db.exec('reset role;set role '+role);await assert.rejects(db.query('select * from portal_campaigns'));await assert.rejects(db.query('select portal_campaign_actor($1,$2)',[sender,co]));}
 }finally{await db.close();}});
