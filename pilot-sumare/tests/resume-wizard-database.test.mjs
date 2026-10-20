import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
test('resume details and images: private fields, opt-in application snapshot, safe logos and publication sync',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,service_role;grant execute on function auth.uid() to authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url),files=(await readdir(dir)).sort();for(const name of files.filter(n=>n.includes('pilot_accounts')||n.includes('candidate_role_isolation')||n.includes('portal_shared_operations')||n.includes('public_homepage')))await db.exec(await readFile(new URL(name,dir),'utf8'));
 const cohort='00000000-0000-4000-8000-000000000001';const ids=['00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000015'];const [candidate,company,school,other,owner]=ids;
 await db.query("insert into pilot_cohorts(id,slug,school_name,city,starts_at) values($1,'test','Fictícia','Teste',now())",[cohort]);for(let i=0;i<ids.length;i++){await db.query("insert into auth.users values($1,$2,now(),'{\"role\":\"pilot_owner\"}')",[ids[i],`fixture${i}@example.invalid`]);await db.query("insert into pilot_memberships(cohort_id,user_id,role,status) values($1,$2,$3,'active')",[cohort,ids[i],['learner','recruiter','school_staff','recruiter','pilot_owner'][i]]);await db.query("insert into pilot_profiles(user_id,display_name,skills) values($1,'Pessoa Fictícia','SolidWorks')",[ids[i]]);}
 async function actor(id,fn,role='authenticated'){await db.exec('begin');try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id||'']);await db.exec('set local role '+role);const result=await fn();await db.exec('commit');return result;}catch(e){await db.exec('rollback');throw e;}}

 await db.exec(await readFile(new URL('../db/resume-wizard.sql',import.meta.url),'utf8'));
 const img='data:image/png;base64,AAAA';
 await actor(candidate,()=>db.query('update pilot_profiles set resume_details=$1,photo_data=$2 where user_id=$3',[JSON.stringify({contact:{phone:'123',address:'Private'},share_photo:false,share_contact:false}),img,candidate]));
 assert.equal((await actor(company,()=>db.query('select photo_data,resume_details from pilot_profiles'))).rows.length,0);
 await assert.rejects(actor(candidate,()=>db.query("update pilot_profiles set photo_data='data:image/svg+xml;base64,AAAA' where user_id=$1",[candidate])),/check/);
 await actor(company,()=>db.query("insert into portal_organizations(user_id,cohort_id,name,logo_data) values($1,$2,'Empresa Modelo',$3)",[company,cohort,img]));
 const publish=()=>actor(company,()=>db.query("insert into portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type) values($1,$2,'job','Técnico','Empresa Modelo','Descrição completa de teste.','13000000','Campinas','SP','Presencial','CLT') returning id,logo_data",[cohort,company]));
 const j1=(await publish()).rows[0];assert.equal(j1.logo_data,img);
 const apply=id=>actor(candidate,()=>db.query('insert into portal_applications(listing_id,cohort_id,candidate_id) values($1,$2,$3) returning resume_snapshot',[id,cohort,candidate]));
 assert(!(await apply(j1.id)).rows[0].resume_snapshot.photo_data);
 await actor(candidate,()=>db.query('update pilot_profiles set resume_details=$1 where user_id=$2',[JSON.stringify({contact:{phone:'123',address:'Private'},share_photo:true,share_contact:true,share_optional:false}),candidate]));
 const j2=(await publish()).rows[0],snapshot=(await apply(j2.id)).rows[0].resume_snapshot;assert.equal(snapshot.photo_data,img);assert.equal(snapshot.contact,'123');assert(!snapshot.optional_info);
 await actor(company,()=>db.query("update portal_organizations set logo_data='' where user_id=$1",[company]));assert.equal((await actor(null,()=>db.query('select logo_data from portal_listings'),'anon')).rows[0].logo_data,'');
 await assert.rejects(actor(other,()=>db.query("update portal_listings set logo_data=$1",[img])),/permission denied/);
 }finally{await db.close();}
});
