-- Run only in the dedicated pilot project. All fixture rows, including Auth rows,
-- are rolled back. No Auth API or email provider is called.
begin;
create temporary table pilot_rls_fixture on commit drop as select
 gen_random_uuid() as alice,gen_random_uuid() as bob,gen_random_uuid() as cohort,
 replace(gen_random_uuid()::text,'-','') as token_a,replace(gen_random_uuid()::text,'-','') as token_b;
grant select on pilot_rls_fixture to authenticated;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
select alice,'rls-'||alice::text||'@example.invalid',now(),'{"display_name":"Teste transacional A","role":"pilot_owner"}'::jsonb from pilot_rls_fixture
union all select bob,'rls-'||bob::text||'@example.invalid',now(),'{"display_name":"Teste transacional B"}'::jsonb from pilot_rls_fixture;
insert into public.pilot_cohorts(id,slug,school_name,city,max_learners,admissions_open,school_approved,privacy_approved,minors_approved,email_delivery_verified,starts_at)
select cohort,'transactional-test-'||cohort::text,'Fixture transacional','Teste',2,true,true,true,true,true,now() from pilot_rls_fixture;
select public.register_pilot_identity(alice,'CPF:'||encode(sha256(convert_to(alice::text,'UTF8')),'hex'),'Candidato') from pilot_rls_fixture;
select public.register_pilot_identity(bob,'CPF:'||encode(sha256(convert_to(bob::text,'UTF8')),'hex'),'Candidato') from pilot_rls_fixture;
insert into pilot_private.invitations(cohort_id,email,token_hash,age_band,participation_approved,expires_at)
select cohort,'rls-'||alice::text||'@example.invalid',sha256(convert_to(token_a,'UTF8')),'18_plus',true,now()+interval '1 hour' from pilot_rls_fixture
union all select cohort,'rls-'||bob::text||'@example.invalid',sha256(convert_to(token_b,'UTF8')),'18_plus',true,now()+interval '1 hour' from pilot_rls_fixture;

select set_config('request.jwt.claim.sub',alice::text,true) from pilot_rls_fixture;
set local role authenticated;
select public.redeem_pilot_invite(cohort,token_a) from pilot_rls_fixture;
insert into public.pilot_goals(cohort_id,user_id,role,salary,skills,weekly_hours,budget)
select cohort,alice,'Meta de teste transacional',1000,'Competência de teste',5,0 from pilot_rls_fixture;
do $$begin
 if (select count(*) from public.pilot_profiles)<>1 then raise exception 'Self profile isolation failed'; end if;
 if exists(select 1 from public.pilot_memberships where role<>'learner') then raise exception 'Metadata granted a role'; end if;
 begin perform public.register_pilot_identity((select alice from pilot_rls_fixture),'CPF:'||repeat('d',64),'Candidato');raise exception 'Privileged registration exposed';exception when insufficient_privilege then null;end;
 begin perform count(*) from pilot_private.user_identities;raise exception 'Identity lookup exposed';exception when insufficient_privilege then null;end;
 begin update public.pilot_memberships set role='pilot_owner';raise exception 'Membership write exposed';exception when insufficient_privilege then null;end;
 begin update public.pilot_goals set user_id=(select bob from pilot_rls_fixture);raise exception 'Goal ownership reassigned';exception when insufficient_privilege then null;end;
end$$;
reset role;

select set_config('request.jwt.claim.sub',bob::text,true) from pilot_rls_fixture;
set local role authenticated;
select public.redeem_pilot_invite(cohort,token_b) from pilot_rls_fixture;
do $$declare changed integer;begin
 if exists(select 1 from public.pilot_profiles where user_id=(select alice from pilot_rls_fixture)) then raise exception 'Other profile exposed';end if;
 if (select count(*) from public.pilot_goals)<>0 then raise exception 'Other goal exposed';end if;
 update public.pilot_profiles set display_name='Unauthorized change' where user_id=(select alice from pilot_rls_fixture);get diagnostics changed=row_count;
 if changed<>0 then raise exception 'Other profile modified';end if;
end$$;
reset role;
update public.pilot_memberships set status='suspended' where user_id=(select alice from pilot_rls_fixture);
select set_config('request.jwt.claim.sub',alice::text,true) from pilot_rls_fixture;
set local role authenticated;
do $$declare changed integer;begin
 update public.pilot_profiles set display_name='Suspended change';get diagnostics changed=row_count;
 if changed<>0 then raise exception 'Suspended profile modified';end if;
 if (select count(*) from public.pilot_goals)<>0 then raise exception 'Suspended goals exposed';end if;
end$$;
reset role;
set local role anon;
do $$begin
 begin perform count(*) from public.pilot_profiles;raise exception 'Anonymous profiles exposed';exception when insufficient_privilege then null;end;
 begin perform count(*) from public.pilot_goals;raise exception 'Anonymous goals exposed';exception when insufficient_privilege then null;end;
end$$;
reset role;
rollback;
select jsonb_build_object('hosted_rls_test','passed','fixture_auth_rows_remaining',(select count(*) from auth.users where email like 'rls-%@example.invalid'),'fixture_cohorts_remaining',(select count(*) from public.pilot_cohorts where slug like 'transactional-test-%')) as verification;
