import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';
const C='11111111-1111-4111-8111-111111111111',U='22222222-2222-4222-8222-222222222222',E='33333333-3333-4333-8333-333333333333',S='44444444-4444-4444-8444-444444444444';
test('draft feeds display eligible paid highlights only within their period and retain the fictional flag',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema pilot_private;
 create function auth.uid() returns uuid language sql stable as $$select '${U}'::uuid$$;
 create function pilot_private.portal_role(uuid) returns text language sql stable as $$select 'recruiter'::text$$;
 create function pilot_private.verified_paid_tier(uuid,uuid,text) returns integer language sql stable as $$select 0$$;
 create function pilot_private.public_professional_points(uuid,uuid) returns numeric language sql stable as $$select 0::numeric$$;
 create function pilot_private.organization_professional_points(uuid,uuid) returns jsonb language sql stable as $$select '{"average":0}'::jsonb$$;
 create function pilot_private.public_candidate_active(uuid,uuid) returns boolean language sql stable as $$select true$$;
 create function pilot_private.learning_score(uuid,uuid) returns numeric language sql stable as $$select 0::numeric$$;
 create function pilot_private.postal_distance_km(double precision,double precision,double precision,double precision) returns double precision language sql stable as $$select 1::double precision$$;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz);
 create table public.pilot_memberships(user_id uuid,cohort_id uuid,role text,status text,is_fictitious boolean);
 create table public.portal_candidate_cards(id uuid,user_id uuid,cohort_id uuid,name text,headline text,city text,state_code text,skills text,updated_at timestamptz,is_fictitious boolean,is_featured boolean,has_senai boolean,photo_data text,show_card_image boolean,visible boolean,demo_resume jsonb);
 create table public.portal_listings(id uuid,publisher_id uuid,cohort_id uuid,kind text,title text,organization text,description text,city text,state_code text,modality text,job_type text,created_at timestamptz,is_fictitious boolean,is_featured boolean,logo_data text,postal_code text,status text);
 create table public.portal_candidate_regions(user_id uuid,cohort_id uuid,latitude double precision,longitude double precision);
 create table public.portal_postal_coordinates(postal_code text,latitude double precision,longitude double precision,checked_at timestamptz);
 create table public.portal_highlight_orders(id uuid,cohort_id uuid,user_id uuid,kind text,target_id uuid,status text,cents integer,starts_at timestamptz,ends_at timestamptz);
 create table public.portal_highlight_payments(order_id uuid,cents integer,eligible boolean);
 grant usage on schema public,auth,pilot_private to service_role;grant select on all tables in schema public,auth to service_role;
 insert into auth.users values('${U}',now(),null),('${E}',now(),null),('${S}',now(),null);
 insert into public.pilot_memberships values('${U}','${C}','learner','active',false),('${E}','${C}','recruiter','active',false),('${S}','${C}','school_staff','active',false);
 insert into public.portal_candidate_cards values('${U}','${U}','${C}','Candidato','CAD','Campinas','SP','CAD',now(),false,false,false,'',false,true,null);
 insert into public.portal_listings values('${E}','${E}','${C}','job','Vaga','Empresa','Descrição','Campinas','SP','Online','CLT',now(),false,false,'','13000000','published'),('${S}','${S}','${C}','course','Curso','Escola','Descrição','Campinas','SP','Online',null,now(),false,false,'','13000000','published');
 insert into public.portal_highlight_orders values('${U}','${C}','${U}','candidate','${U}','confirmed',743,now()-interval '1 hour',now()+interval '1 day'),('${E}','${C}','${E}','job','${E}','confirmed',2243,now()-interval '1 hour',now()+interval '1 day'),('${S}','${C}','${S}','course','${S}','confirmed',2243,now()-interval '1 hour',now()+interval '1 day');
 insert into public.portal_highlight_payments values('${U}',743,true),('${E}',2243,true),('${S}',2243,true);`);
 const feedSql=await readFile(new URL('../db/highlight-feeds-draft.sql',import.meta.url),'utf8');await db.exec(feedSql);
 const feeds=async()=>{
  const rows=[];for(const [q,args] of [
   ['select public.portal_ordered_public_feed($1,$2,\'\',0,30) as r',[C,'candidates']],
   ['select public.portal_ordered_public_feed($1,$2,\'\',0,30) as r',[C,'job']],
   ['select public.portal_ordered_public_feed($1,$2,\'\',0,30) as r',[C,'course']],
   ['select public.portal_distance_candidate_search($1,\'\',\'\',false,0,-23.0,-46.0) as r',[C]],
   ['select public.portal_distance_public_feed($1,\'job\',\'\',0,30,-23.0,-46.0) as r',[C]],
   ['select pilot_private.search_scored_candidates($1,\'\',\'\',false,0) as r',[C]],
  ])rows.push((await db.query(q,args)).rows[0].r[0]);return rows;
 };
 await db.exec('set role service_role');let rows=await feeds();assert(rows.every(row=>row.is_featured===true));assert(rows.every(row=>!('cents' in row)&&!('subscription_tier' in row)));await db.exec('reset role');
 await db.query("update public.portal_highlight_orders set ends_at=now()-interval '1 minute'");await db.exec('set role service_role');rows=await feeds();assert(rows.every(row=>row.is_featured===false));await db.exec('reset role');
 await db.query("update public.portal_highlight_orders set ends_at=now()+interval '1 day'");await db.query('update public.portal_highlight_payments set eligible=false');await db.exec('set role service_role');rows=await feeds();assert(rows.every(row=>row.is_featured===false));await db.exec('reset role');
 await db.query('update public.portal_candidate_cards set is_fictitious=true,is_featured=true');await db.exec('set role service_role');rows=await feeds();assert.equal(rows[0].is_featured,true);assert.equal(rows[3].is_featured,true);assert.equal(rows[5].is_featured,true);await db.exec('reset role');
 const N='55555555-5555-4555-8555-555555555555';
 await db.exec(`update public.portal_candidate_cards set is_fictitious=false,is_featured=false;update public.portal_highlight_payments set eligible=true;
 insert into auth.users values('${N}',now(),null);insert into public.pilot_memberships values('${N}','${C}','learner','active',false);
 insert into public.portal_candidate_cards values('${N}','${N}','${C}','Outra pessoa','CAD','Campinas','SP','CAD',now(),false,false,false,'',false,true,null);
 insert into public.portal_highlight_orders values('${N}','${C}','${N}','candidate','${N}','confirmed',743,now()-interval '1 hour',now()+interval '1 day');
 insert into public.portal_highlight_payments values('${N}',743,true);`);
 const fakeClock=instant=>feedSql.replaceAll('extract(epoch from statement_timestamp())',`extract(epoch from timestamptz '${instant}')`);
 await db.exec(fakeClock('2026-10-26 00:00:00+00'));await db.exec('set role service_role');const first=(await db.query("select public.portal_ordered_public_feed($1,'candidates','',0,30) as r",[C])).rows[0].r;await db.exec('reset role');
 await db.exec(fakeClock('2026-10-26 00:05:00+00'));await db.exec('set role service_role');const second=(await db.query("select public.portal_ordered_public_feed($1,'candidates','',0,30) as r",[C])).rows[0].r;
 assert.equal(first.length,2);assert.equal(second.length,2);assert.notEqual(first[0].id,second[0].id);assert.deepEqual(first.map(x=>x.id).sort(),second.map(x=>x.id).sort());assert(first.every(row=>!('promotion_order' in row)));
 await db.exec('reset role');
 for(let i=0;i<35;i++){
  const id=`66666666-6666-4666-8666-${String(i).padStart(12,'0')}`;
  await db.query('insert into auth.users values($1,now(),null)',[id]);await db.query("insert into public.pilot_memberships values($1,$2,'learner','active',false)",[id,C]);
  await db.query("insert into public.portal_candidate_cards values($1,$1,$2,$3,'CAD','Campinas','SP','CAD',now(),false,false,false,'',false,true,null)",[id,C,'Pessoa '+i]);
  await db.query("insert into public.portal_highlight_orders values($1,$2,$1,'candidate',$1,'confirmed',743,now()-interval '1 hour',now()+interval '1 day')",[id,C]);await db.query('insert into public.portal_highlight_payments values($1,743,true)',[id]);
 }
 await db.exec('set role service_role');const page0=(await db.query("select public.portal_ordered_public_feed($1,'candidates','',0,30) as r",[C])).rows[0].r;const page1=(await db.query("select public.portal_ordered_public_feed($1,'candidates','',1,30) as r",[C])).rows[0].r;
 assert.equal(page0.length,30);assert.equal(page1.length,7);assert.equal(new Set([...page0,...page1].map(x=>x.id)).size,37);await db.exec('reset role');
 await db.exec(fakeClock('2026-10-26 00:10:00+00'));await db.exec('set role service_role');const rotated=(await db.query("select public.portal_ordered_public_feed($1,'candidates','',0,30) as r",[C])).rows[0].r;assert.notEqual(page0[0].id,rotated[0].id);
 }finally{await db.close();}
});
