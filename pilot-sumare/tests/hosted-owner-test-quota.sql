begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare co uuid:=gen_random_uuid();actor uuid:=gen_random_uuid();begin
 insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(co,'owner-test-probe-'||co::text,'Synthetic rollback','Teste',now());
 insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(actor,'authenticated','authenticated','owner-test-'||actor::text||'@example.invalid',now(),now(),now());
 insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(co,actor,'pilot_owner','active',false);
 perform set_config('oeo.test_owner',actor::text,true);perform set_config('oeo.test_cohort',co::text,true);
end$$;
set local role service_role;
do $$declare remaining integer;actor uuid:=current_setting('oeo.test_owner')::uuid;co uuid:=current_setting('oeo.test_cohort')::uuid;begin
 for i in 1..60 loop remaining:=public.portal_owner_test_reserve(actor,co);if remaining<>60-i then raise exception 'Quota mismatch';end if;end loop;
 begin perform public.portal_owner_test_reserve(actor,co);raise exception 'TEST: quota exceeded';exception when others then if SQLERRM not like 'Limite diário%' then raise;end if;end;
 if (select calls from public.portal_owner_test_usage where user_id=actor and cohort_id=co)<>60 then raise exception 'Quota mutated incorrectly';end if;
end$$;
reset role;
set local role authenticated;
do $$begin
 begin perform public.portal_owner_test_reserve(current_setting('oeo.test_owner')::uuid,current_setting('oeo.test_cohort')::uuid);raise exception 'TEST: client execute';exception when insufficient_privilege then null;end;
 begin perform * from public.portal_owner_test_usage;raise exception 'TEST: client read';exception when insufficient_privilege then null;end;
end$$;
reset role;
update public.pilot_memberships set status='suspended' where user_id=current_setting('oeo.test_owner')::uuid and cohort_id=current_setting('oeo.test_cohort')::uuid;
set local role service_role;
do $$begin
 begin perform public.portal_owner_test_reserve(current_setting('oeo.test_owner')::uuid,current_setting('oeo.test_cohort')::uuid);raise exception 'TEST: suspended owner allowed';exception when others then if SQLERRM<>'Acesso negado' then raise;end if;end;
end$$;
reset role;
rollback;
select true as synthetic_owner_quota_and_client_denial_passed;
