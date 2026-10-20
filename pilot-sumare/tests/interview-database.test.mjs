import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
test('interviews: private proposals, candidate confirmation, revision checks and automatic cancellation',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,service_role;grant execute on function auth.uid() to authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url),files=(await readdir(dir)).sort();for(const name of files.filter(n=>n.includes('pilot_accounts')||n.includes('candidate_role_isolation')||n.includes('portal_shared_operations')||n.includes('public_homepage')))await db.exec(await readFile(new URL(name,dir),'utf8'));
 const cohort='00000000-0000-4000-8000-000000000001';const ids=['00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000015'];const [candidate,company,school,other,owner]=ids;
 await db.query("insert into pilot_cohorts(id,slug,school_name,city,starts_at) values($1,'test','Fictícia','Teste',now())",[cohort]);for(let i=0;i<ids.length;i++){await db.query("insert into auth.users values($1,$2,now(),'{\"role\":\"pilot_owner\"}')",[ids[i],`fixture${i}@example.invalid`]);await db.query("insert into pilot_memberships(cohort_id,user_id,role,status) values($1,$2,$3,'active')",[cohort,ids[i],['learner','recruiter','school_staff','recruiter','pilot_owner'][i]]);await db.query("insert into pilot_profiles(user_id,display_name,skills) values($1,'Pessoa Fictícia','SolidWorks')",[ids[i]]);}
 async function actor(id,fn,role='authenticated'){await db.exec('begin');try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id||'']);await db.exec('set local role '+role);const result=await fn();await db.exec('commit');return result;}catch(e){await db.exec('rollback');throw e;}}

 await db.exec(await readFile(new URL('../db/interview-calendar.sql',import.meta.url),'utf8'));
 const job=(await actor(company,()=>db.query("insert into portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type) values($1,$2,'job','Técnico','Empresa Fictícia','Descrição completa de teste.','13000000','Campinas','SP','Presencial','CLT') returning id",[cohort,company]))).rows[0].id;
 const app=(await actor(candidate,()=>db.query('insert into portal_applications(listing_id,cohort_id,candidate_id) values($1,$2,$3) returning id',[job,cohort,candidate]))).rows[0].id;
 const propose=(who,rev=0)=>actor(who,()=>db.query("select portal_propose_interview($1,now()+interval '1 day',now()+interval '1 day 1 hour','Online','https://meet.google.com/test',$2)",[app,rev]));
 const reply=(who,action,rev)=>actor(who,()=>db.query('select portal_reply_interview($1,$2,$3)',[app,action,rev]));
 await assert.rejects(propose(candidate),/Acesso negado/);await assert.rejects(propose(other),/Acesso negado/);await propose(company);
 assert.equal((await actor(other,()=>db.query('select * from portal_interviews'))).rows.length,0);await assert.rejects(actor(null,()=>db.query('select * from portal_interviews'),'anon'),/permission denied/);
 await assert.rejects(reply(company,'confirmed',1),/indisponível/);await assert.rejects(reply(other,'confirmed',1),/Acesso negado/);await reply(candidate,'confirmed',1);
 assert.equal((await actor(company,()=>db.query('select status from portal_interviews'))).rows[0].status,'confirmed');
 await assert.rejects(propose(company,1),/alterado/);await propose(company,2);await assert.rejects(reply(candidate,'confirmed',2),/alterado/);await reply(candidate,'declined',3);await propose(company,4);await reply(candidate,'confirmed',5);await reply(company,'cancelled',6);
 await propose(company,7);await reply(candidate,'confirmed',8);
 await actor(candidate,()=>db.query('select portal_withdraw_application($1)',[app]));assert.equal((await actor(company,()=>db.query('select status from portal_interviews'))).rows[0].status,'cancelled');await assert.rejects(propose(company,10),/encerrado/);
 await assert.rejects(actor(company,()=>db.query("update portal_interviews set status='confirmed'")),/permission denied/);
 }finally{await db.close();}
});
