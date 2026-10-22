import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,readdir} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
test('talent: approval, protected points, revocable subuser permissions and internal interview ranking',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,service_role;grant execute on function auth.uid() to authenticated,service_role;`);
 const dir=new URL('../supabase/migrations/',import.meta.url),files=(await readdir(dir)).sort();for(const name of files.filter(n=>n.includes('pilot_accounts')||n.includes('candidate_role_isolation')||n.includes('portal_shared_operations')||n.includes('public_homepage')))await db.exec(await readFile(new URL(name,dir),'utf8'));
 const cohort='00000000-0000-4000-8000-000000000001';const ids=['00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000013','00000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000015'];const [candidate,company,school,other,owner]=ids;
 await db.query("insert into pilot_cohorts(id,slug,school_name,city,starts_at) values($1,'test','Fictícia','Teste',now())",[cohort]);for(let i=0;i<ids.length;i++){await db.query("insert into auth.users values($1,$2,now(),'{\"role\":\"pilot_owner\"}')",[ids[i],`fixture${i}@example.invalid`]);await db.query("insert into pilot_memberships(cohort_id,user_id,role,status) values($1,$2,$3,'active')",[cohort,ids[i],['learner','recruiter','school_staff','recruiter','pilot_owner'][i]]);await db.query("insert into pilot_profiles(user_id,display_name,skills) values($1,'Pessoa Fictícia','SolidWorks')",[ids[i]]);}
 async function actor(id,fn,role='authenticated'){await db.exec('begin');try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id||'']);await db.exec('set local role '+role);const result=await fn();await db.exec('commit');return result;}catch(e){await db.exec('rollback');throw e;}}

 await db.exec(`create schema storage;create table storage.objects(bucket_id text,name text);create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;grant usage on schema storage to authenticated;grant select,insert on storage.objects to authenticated;alter table storage.objects enable row level security;`);
 await db.exec(await readFile(new URL('../db/interview-calendar.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../db/talent-features.sql',import.meta.url),'utf8'));await db.exec(await readFile(new URL('../db/private-files.sql',import.meta.url),'utf8'));await db.exec(await readFile(new URL('../db/talent-review-progress.sql',import.meta.url),'utf8'));
 const proof=candidate+'/'+cohort+'/evidence/test.pdf';await db.query("insert into storage.objects values('portal-private-files',$1)",[proof]);
 await actor(candidate,()=>db.query("insert into storage.objects values('portal-private-files',$1)",[candidate+'/'+cohort+'/resume/cv.pdf']));assert.equal((await actor(company,()=>db.query('select * from storage.objects'))).rows.length,0);assert.equal((await actor(owner,()=>db.query('select * from storage.objects'))).rows.length,1);await assert.rejects(actor(company,()=>db.query("insert into storage.objects values('portal-private-files',$1)",[candidate+'/'+cohort+'/resume/other.pdf'])),/row-level security/);
 const record=(await actor(candidate,()=>db.query("insert into portal_learning_records(user_id,cohort_id,title,institution,level,hours,completed_on,evidence_path) values($1,$2,'Automação','Instituto Modelo','training',300,current_date,$3) returning id",[candidate,cohort,proof]))).rows[0].id;
 const score=()=>actor(candidate,()=>db.query('select portal_learning_score($1,$2) points',[candidate,cohort]));assert.equal(Number((await score()).rows[0].points),0);
 await assert.rejects(actor(candidate,()=>db.query("update portal_learning_records set status='verified'")),/permission denied/);
 await assert.rejects(actor(company,()=>db.query("select portal_review_learning($1,'verified','Comprovante conferido',true)",[record])),/Acesso negado/);
 await actor(owner,()=>db.query("select portal_review_learning($1,'verified','Comprovante conferido',true)",[record]));assert.equal(Number((await score()).rows[0].points),870);assert.equal(Number((await actor(candidate,()=>db.query('select portal_learning_progress($1) p',[cohort]))).rows[0].p.professional),870);assert.equal((await actor(owner,()=>db.query('select portal_learning_review_queue($1) q',[cohort]))).rows[0].q[0].candidate_name,'Pessoa Fictícia');await assert.rejects(actor(company,()=>db.query('select portal_learning_review_queue($1)',[cohort])),/Acesso negado/);
 await actor(candidate,()=>db.query("update portal_learning_records set hours=301 where id=$1",[record]));assert.equal(Number((await score()).rows[0].points),0);
 await actor(owner,()=>db.query("select portal_review_learning($1,'verified','Conferência revisada',true)",[record]));
 await actor(candidate,()=>db.query("update portal_learning_records set sphere='spiritual' where id=$1",[record]));await actor(owner,()=>db.query("select portal_review_learning($1,'verified','Progresso privado conferido',false)",[record]));assert.equal(Number((await score()).rows[0].points),0);
 assert.equal((await actor(company,()=>db.query('select * from portal_learning_records'))).rows.length,0);await assert.rejects(actor(other,()=>db.query('select pilot_private.learning_score($1,$2)',[candidate,cohort])),/Acesso negado/);
 await actor(company,()=>db.query("select portal_org_access_command($1,'invite',$2::jsonb)",[cohort,JSON.stringify({email:'fixture0@example.invalid',permissions:['publish','recruitment']})]));
 const invitation=(await actor(candidate,()=>db.query('select * from portal_org_access'))).rows[0];assert.equal(invitation.status,'pending');
 const payload={kind:'job',title:'Técnico Modelo',organization:'Empresa Modelo',description:'Descrição válida para seleção de teste.',postal_code:'13000000',city:'Campinas',state_code:'SP',modality:'Presencial',job_type:'CLT'};
 const publish=()=>actor(candidate,()=>db.query("select portal_delegated_command($1,$2,'publish',$3::jsonb) as result",[cohort,company,JSON.stringify(payload)]));await assert.rejects(publish(),/Permissão indisponível/);
 await assert.rejects(actor(company,()=>db.query("select portal_org_access_command($1,'accepted',$2::jsonb)",[cohort,JSON.stringify({id:invitation.id})])),/Acesso negado/);
 await actor(candidate,()=>db.query("select portal_org_access_command($1,'accepted',$2::jsonb)",[cohort,JSON.stringify({id:invitation.id})]));const job=(await publish()).rows[0].result.id;
 await assert.rejects(actor(candidate,()=>db.query("select portal_delegated_command($1,$2,'profile',$3::jsonb)",[cohort,company,'{}'])),/Permissão indisponível/);
 const app=(await actor(owner,()=>db.query('insert into portal_applications(listing_id,cohort_id,candidate_id) values($1,$2,$3) returning id',[job,cohort,owner]))).rows[0].id;
 const command=(who,action,payload)=>actor(who,()=>db.query('select portal_recruitment_command($1,$2,$3,$4::jsonb) as result',[cohort,company,action,JSON.stringify({listing:job,...payload})]));
 await command(company,'rubric',{criteria:['Conhecimento técnico','Comunicação']});
 await assert.rejects(command(candidate,'evaluate',{application:app,grades:[8,10],evidence:'Evidências técnicas documentadas.'}),/encerrada/);
 await db.query("insert into portal_interviews(application_id,starts_at,ends_at,location,status) values($1,now()-interval '2 hours',now()-interval '1 hour','Local de teste','confirmed')",[app]);
 await command(candidate,'evaluate',{application:app,grades:[8,10],evidence:'Evidências técnicas documentadas.'});
 assert.equal(Number((await command(company,'overview',{})).rows[0].result.ranking[0].average),9);
 const second='00000000-0000-4000-8000-000000000099';await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,'second@example.invalid',now())",[second]);await db.query("insert into pilot_memberships(cohort_id,user_id,role,status) values($1,$2,'learner','active')",[cohort,second]);await db.query("insert into pilot_profiles(user_id,display_name) values($1,'Segundo Modelo')",[second]);const app2=(await actor(second,()=>db.query('insert into portal_applications(listing_id,cohort_id,candidate_id) values($1,$2,$3) returning id',[job,cohort,second]))).rows[0].id;await db.query("insert into portal_interviews(application_id,starts_at,ends_at,location,status) values($1,now()-interval '2 hours',now()-interval '1 hour','Local fictício','confirmed')",[app2]);await command(company,'evaluate',{application:app2,grades:[9,9],evidence:'Segunda avaliação com evidências.'});const ranking=(await command(company,'overview',{})).rows[0].result.ranking;assert.deepEqual(ranking.map(r=>Number(r.position)),[1,1]);
 await assert.rejects(command(company,'rubric',{criteria:['Critério alterado']}),/congelados/);
 await assert.rejects(command(owner,'overview',{}),/Acesso negado/);await assert.rejects(actor(owner,()=>db.query('select * from portal_evaluations')),/permission denied/);
 await actor(company,()=>db.query("select portal_org_access_command($1,'revoked',$2::jsonb)",[cohort,JSON.stringify({id:invitation.id})]));await assert.rejects(publish(),/Permissão indisponível/);await assert.rejects(command(candidate,'overview',{}),/Acesso negado/);
 await db.exec("alter table portal_candidate_cards add column is_fictitious boolean default false,add column is_featured boolean default false,add column demo_resume jsonb");
 await db.exec(await readFile(new URL('../db/candidate-scope.sql',import.meta.url),'utf8'));
 for(const person of [candidate,owner])await db.query("insert into portal_candidate_cards(user_id,cohort_id,name,headline,visible) values($1,$2,'Pessoa Modelo','Técnico',true)",[person,cohort]);
 await assert.rejects(actor(candidate,()=>db.query("select portal_search_scored_candidates($1,'','',false,0)",[cohort])),/indisponível/);
 await assert.rejects(actor(candidate,()=>db.query('select pilot_private.learning_score($1,$2)',[owner,cohort])),/Acesso negado/);
 assert.equal((await actor(candidate,()=>db.query('select user_id from portal_candidate_cards'))).rows.length,1);
 assert.equal((await actor(company,()=>db.query('select user_id from portal_candidate_cards'))).rows.length,2);
 assert.equal((await actor(company,()=>db.query("select jsonb_array_length(portal_search_scored_candidates($1,'','',false,0)) n",[cohort]))).rows[0].n,2);
 assert.equal(Number((await actor(candidate,()=>db.query('select portal_learning_score($1,$2) n',[candidate,cohort]))).rows[0].n),0);
 // Ordered delegated search must preserve accepted permission and reject stale/forged scope.
 await db.exec("alter table auth.users add column banned_until timestamptz");
 await db.exec(`create function public.portal_ordered_public_feed(uuid,text,text,integer,integer) returns jsonb language sql as $$select jsonb_build_array(jsonb_build_object('page',$4,'size',$5,'query',$3,'kind',$2))$$;revoke all on function public.portal_ordered_public_feed(uuid,text,text,integer,integer) from public,anon,authenticated;grant execute on function public.portal_ordered_public_feed(uuid,text,text,integer,integer) to service_role;`);
 await db.exec(await readFile(new URL('../db/delegated-ordered-search.sql',import.meta.url),'utf8'));
 const delegatedSearch=(who=candidate,org=company,payload={})=>actor(who,()=>db.query("select public.portal_delegated_command($1,$2,'candidates',$3::jsonb) result",[cohort,org,JSON.stringify(payload)]));
 await assert.rejects(delegatedSearch(),/Permissão indisponível/);
 await db.query("update portal_org_access set status='pending',permissions=array['searchCandidates'] where id=$1",[invitation.id]);
 await assert.rejects(delegatedSearch(),/Permissão indisponível/);
 await db.query("update portal_org_access set status='accepted' where id=$1",[invitation.id]);
 assert.deepEqual((await delegatedSearch(candidate,company,{query:'CAD',page:2})).rows[0].result,[{page:2,size:30,query:'CAD',kind:'candidates'}]);
 assert.equal((await delegatedSearch(company,company)).rows[0].result[0].page,0);
 await assert.rejects(delegatedSearch(candidate,other),/Permissão indisponível/);
 for(const page of [-1,1001,1.5,'1 OR 1=1'])await assert.rejects(delegatedSearch(candidate,company,{page}),/Página inválida/);
 await db.query("update auth.users set banned_until=now()+interval '1 day' where id=$1",[company]);await assert.rejects(delegatedSearch(),/indisponível/);
 await db.query("update auth.users set banned_until=null where id=$1",[company]);
 await db.query("update auth.users set email_confirmed_at=null where id=$1",[candidate]);await assert.rejects(delegatedSearch(),/indisponível/);
 await db.query("update auth.users set email_confirmed_at=now() where id=$1",[candidate]);
 await db.query("update portal_org_access set permissions=array['publish'] where id=$1",[invitation.id]);await assert.rejects(delegatedSearch(),/Permissão indisponível/);
 }finally{await db.close();}
});
