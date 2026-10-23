import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';import {PGlite} from '@electric-sql/pglite';
test('owner test quota is atomic, capped at 60, requires active owner and is inaccessible to browser',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz);create table public.pilot_cohorts(id uuid primary key);create table public.pilot_memberships(user_id uuid,cohort_id uuid,role text,status text,is_fictitious boolean);grant usage on schema auth to service_role;grant select on auth.users,public.pilot_memberships to service_role;`);
 await db.exec(await readFile(new URL('../db/owner-test-usage.sql',import.meta.url),'utf8'));
 const [owner,learner,cohort,other]=Array.from({length:4},randomUUID);await db.query('insert into auth.users values($1,now(),null),($2,now(),null)',[owner,learner]);await db.query('insert into pilot_cohorts values($1),($2)',[cohort,other]);await db.query("insert into pilot_memberships values($1,$3,'pilot_owner','active',false),($2,$3,'learner','active',false)",[owner,learner,cohort]);
 const reserve=(who=owner,co=cohort)=>db.query('select public.portal_owner_test_reserve($1,$2) remaining',[who,co]);
 await db.exec('set role service_role');await assert.rejects(reserve(learner),/Acesso negado/);await assert.rejects(reserve(owner,other),/Acesso negado/);for(let i=0;i<60;i++)assert.equal((await reserve()).rows[0].remaining,59-i);await assert.rejects(reserve(),/Limite diário/);await db.exec('reset role');
 assert.equal((await db.query('select calls from portal_owner_test_usage')).rows[0].calls,60);
 await db.query("update pilot_memberships set status='suspended' where user_id=$1",[owner]);await db.exec('set role service_role');await assert.rejects(reserve(),/Acesso negado/);await db.exec('reset role');
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(reserve(),/permission denied/);await assert.rejects(db.query('select * from portal_owner_test_usage'),/permission denied/);await db.exec('reset role');}
 await db.query('delete from auth.users where id=$1',[owner]);assert.equal((await db.query('select count(*)::int n from portal_owner_test_usage')).rows[0].n,0);
 }finally{await db.close();}
});
