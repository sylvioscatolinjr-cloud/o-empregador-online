import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
test('PostgreSQL: admission, verified identity, unique documents, capacity and row isolation',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated,service_role;grant execute on function auth.uid() to authenticated,service_role;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261015210327_pilot_accounts_profiles_and_goals.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/migrations/20261015211042_pilot_reference_indexes.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/migrations/20261016160134_candidate_role_isolation.sql',import.meta.url),'utf8'));
 const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222',third='33333333-3333-4333-8333-333333333333',cohort='44444444-4444-4444-8444-444444444444';
 for(const [id,email] of [[alice,'alice@example.com'],[bob,'bob@example.com'],[third,'third@example.com']])await db.query("insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values($1,$2,now(),'{\"role\":\"pilot_owner\",\"display_name\":\"Pessoa Modelo\"}')",[id,email]);
 await db.query("insert into public.pilot_cohorts(id,slug,school_name,city,max_learners,starts_at) values($1,'test','Escola Fictícia','Sumaré',2,now())",[cohort]);
 async function actor(id,fn,role='authenticated'){await db.exec('begin');try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id||'']);await db.exec('set local role '+role);const out=await fn();await db.exec('commit');return out;}catch(e){await db.exec('rollback');throw e;}}
 const token=id=>id.replace(/-/g,'')+'token';
 for(const [id,email,band] of [[alice,'alice@example.com','16_17'],[bob,'bob@example.com','18_plus'],[third,'third@example.com','18_plus']])await db.query("insert into pilot_private.invitations(cohort_id,email,token_hash,age_band,participation_approved,expires_at) values($1,$2,sha256(convert_to($3,'UTF8')),$4,true,now()+interval '1 day')",[cohort,email,token(id),band]);
 const redeem=id=>actor(id,()=>db.query('select public.redeem_pilot_invite($1,$2)',[cohort,token(id)]));
 await assert.rejects(actor(null,()=>db.query('select * from public.pilot_profiles'),'anon'),/permission denied/);
 await assert.rejects(actor(alice,()=>db.query('select public.register_pilot_identity($1,$2,$3)',[alice,'CPF:'+ 'a'.repeat(64),'Candidato'])),/permission denied/);
 await assert.rejects(redeem(alice),/cadastro documental/);
 for(const [id,key] of [[alice,'a'],[bob,'b'],[third,'c']])await actor(null,()=>db.query('select public.register_pilot_identity($1,$2,$3)',[id,'CPF:'+key.repeat(64),'Candidato']),'service_role');
 await actor(null,()=>db.query('select public.register_pilot_identity($1,$2,$3)',[alice,'CPF:'+'a'.repeat(64),'Candidato']),'service_role'); // Idempotent retry.
 await assert.rejects(actor(null,()=>db.query('select public.register_pilot_identity($1,$2,$3)',[bob,'CPF:'+'a'.repeat(64),'Candidato']),'service_role'),/revisão/);
 assert.equal((await actor(alice,()=>db.query('select public.pilot_registration_status() as registered'))).rows[0].registered,true);
 await assert.rejects(actor(alice,()=>db.query('select * from pilot_private.user_identities')),/permission denied/);
 await assert.rejects(redeem(alice),/Ingresso indisponível/);
 await db.exec('update public.pilot_cohorts set admissions_open=true,school_approved=true,privacy_approved=true,email_delivery_verified=true');
 await assert.rejects(redeem(alice),/Convite indisponível/); // 16/17 guard is still closed.
 await db.exec('update public.pilot_cohorts set minors_approved=true');
 await redeem(alice);await redeem(alice); // Used token is only idempotent for its own active membership.
 await assert.rejects(actor(bob,()=>db.query('select public.redeem_pilot_invite($1,$2)',[cohort,token(alice)])),/Convite indisponível/);
 await redeem(bob);await assert.rejects(redeem(third),/Turma sem vagas/);
 assert.equal((await db.query('select count(*)::int as n from public.pilot_memberships')).rows[0].n,2);
 assert.equal((await db.query('select role from public.pilot_memberships where user_id=$1',[alice])).rows[0].role,'learner'); // Metadata cannot grant ownership.
 await assert.rejects(actor(alice,()=>db.exec("update public.pilot_memberships set role='pilot_owner'")),/permission denied/);
 await actor(alice,()=>db.query("update public.pilot_profiles set display_name='Pessoa A',education='Ensino médio',courses='CAI' where user_id=$1",[alice]));
 assert.equal((await actor(bob,()=>db.query('select * from public.pilot_profiles where user_id=$1',[alice]))).rows.length,0);
 assert.equal((await actor(bob,()=>db.query("update public.pilot_profiles set display_name='Invasão' where user_id=$1 returning user_id",[alice]))).rows.length,0);
 await actor(alice,()=>db.query("insert into public.pilot_goals(cohort_id,user_id,role,salary,skills,weekly_hours,budget) values($1,$2,'Técnico',4000,'Metrologia',5,100)",[cohort,alice]));
 assert.equal((await actor(bob,()=>db.query('select * from public.pilot_goals'))).rows.length,0);
 await assert.rejects(actor(alice,()=>db.query('update public.pilot_goals set user_id=$1 where user_id=$2',[bob,alice])),/row-level security/);
 assert.equal((await actor(alice,()=>db.query('select role from public.pilot_goals'))).rows[0].role,'Técnico');

 for(const role of ['recruiter','school_staff']){
  await db.query('update public.pilot_memberships set role=$1 where user_id=$2',[role,alice]);
  assert.equal((await actor(alice,()=>db.query('select * from public.pilot_profiles'))).rows.length,0);
  assert.equal((await actor(alice,()=>db.query("update public.pilot_profiles set display_name='Blocked' returning user_id"))).rows.length,0);
  assert.equal((await actor(alice,()=>db.query('select * from public.pilot_goals'))).rows.length,0);
  await assert.rejects(actor(alice,()=>db.query("insert into public.pilot_goals(cohort_id,user_id,role,salary,skills,weekly_hours,budget) values($1,$2,'Blocked',0,'Test',1,0)",[cohort,alice])),/row-level security/);
 }
 await db.query("update public.pilot_memberships set role='learner' where user_id=$1",[alice]);
 await db.query("update public.pilot_memberships set status='suspended' where user_id=$1",[alice]);
 assert.equal((await actor(alice,()=>db.query("update public.pilot_profiles set display_name='Alterado' returning user_id"))).rows.length,0);
 assert.equal((await actor(alice,()=>db.query('select * from public.pilot_goals'))).rows.length,0);
 const tables=(await db.query("select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','pilot_private') and c.relkind='r' and not c.relrowsecurity")).rows;assert.deepEqual(tables,[]);
 }finally{await db.close();}
});
