import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
test('production SQL preserves selected fields, rejects stale/unauthorized writes and isolates saved notes from clients',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;grant usage on schema auth to service_role;create function auth.role() returns text language sql as $$select current_setting('request.jwt.claim.role',true)$$;create table auth.users(id uuid primary key);create table public.pilot_cohorts(id uuid primary key);create table public.pilot_profiles(user_id uuid primary key references auth.users(id),display_name text not null,about text not null default '',skills text not null default '',experience text not null default '',education text not null default '',courses text not null default '',certifications text not null default '',resume_details jsonb not null default '{}',resume_path text not null default '');grant select,update on public.pilot_profiles to service_role;`);
 const migration=await readFile(new URL('../supabase/migrations/20261021232120_ai_resume_review_and_private_history.sql',import.meta.url),'utf8');
 for(const file of ['ai-resume-review.sql','ai-history.sql'])assert(migration.includes(await readFile(new URL('../db/'+file,import.meta.url),'utf8')));
 await db.exec('begin;'+migration+'commit;');
 const u='11111111-1111-4111-8111-111111111111',c='22222222-2222-4222-8222-222222222222';
 await db.query('insert into auth.users values($1)',[u]);await db.query('insert into public.pilot_cohorts values($1)',[c]);await db.query("insert into public.pilot_profiles(user_id,display_name,about,skills,resume_details) values($1,'Fictício','Original','CAD','{\"contact\":{\"email\":\"private@example.invalid\"}}')",[u]);
 const expected=(await db.query('select to_jsonb(p)-\'user_id\' as snapshot from public.pilot_profiles p')).rows[0].snapshot;
 await db.exec("set role service_role;set request.jwt.claim.role='service_role';");
 const apply=patch=>db.query('select public.portal_ai_apply_resume($1,$2::jsonb,$3::jsonb) as saved',[u,JSON.stringify(expected),JSON.stringify(patch)]);
 assert.equal((await apply({about:'Revisado'})).rows[0].saved,true);assert.equal((await apply({about:'Outra aba'})).rows[0].saved,false);
 let row=(await db.query('select * from public.pilot_profiles')).rows[0];assert.equal(row.skills,'CAD');assert.equal(row.resume_details.contact.email,'private@example.invalid');assert.equal(row.about,'Revisado');await assert.rejects(apply({display_name:'Alterado'}));
 await db.query("insert into public.portal_ai_notes(user_id,cohort_id,profile_role,task_id,question,answer) values($1,$2,'learner','goal_followup','Pergunta fictícia','Resposta fictícia')",[u,c]);assert.equal((await db.query('select count(*)::int as n from public.portal_ai_notes')).rows[0].n,1);
 for(const role of ['anon','authenticated']){await db.exec('reset role;set role '+role);await assert.rejects(db.query('select * from public.portal_ai_notes'));await assert.rejects(db.query('delete from public.portal_ai_notes'));await assert.rejects(apply({about:'Inválido'}));}
 await db.exec('reset role;');await db.query('delete from public.pilot_profiles where user_id=$1',[u]);await db.query('delete from auth.users where id=$1',[u]);assert.equal((await db.query('select count(*)::int as n from public.portal_ai_notes')).rows[0].n,0);
 }finally{await db.close();}
});
