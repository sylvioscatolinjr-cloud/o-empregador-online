begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare c uuid:=gen_random_uuid();u uuid:=gen_random_uuid();o uuid:=gen_random_uuid();t uuid:=gen_random_uuid();begin
insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(c,'sweep-probe-'||c::text,'Synthetic rollback','Teste',now());
insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(u,'authenticated','authenticated','sweep-probe-'||u::text||'@example.invalid',now(),now(),now());
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(c,u,'learner','active',false);
insert into public.billing_live_orders(id,user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version) values(o,u,c,'Candidato',1,'MONTHLY',1990,398,1,'2026-10-19-v1');
insert into public.portal_ai_topup_orders(id,user_id,cohort_id,cents,status,terms_version,checkout_id) values(t,u,c,1000,'pending','2026-10-23-ai-topup-v1','checkout_SWEEP_'||t::text);
perform set_config('oeo.sweep_order',o::text,true);perform set_config('oeo.sweep_topup',t::text,true);
end $$;
set local role service_role;
do $$declare o uuid:=current_setting('oeo.sweep_order')::uuid;t uuid:=current_setting('oeo.sweep_topup')::uuid;p jsonb;q jsonb;begin
p:=jsonb_build_object('id','pay_SWEEP_'||o::text,'status','CONFIRMED','cents',1990,'eligible',true,'period_start',now()-interval '1 hour','period_end',now()+interval '29 days','checked_at',now(),'provider_paid_on','2026-10-02');
q:=jsonb_build_object('id','pay_SWEEP_'||t::text,'checkout_id','checkout_SWEEP_'||t::text,'status','CONFIRMED','cents',1000,'eligible',true,'checked_at',now(),'provider_paid_on','2026-10-03');
perform public.billing_live_apply_payment(o,p);perform public.portal_ai_topup_apply(t,q);
update public.billing_live_payments set spent_cents=100 where order_id=o;
update public.portal_ai_topup_payments set spent_cents=100 where order_id=t;
perform public.billing_live_apply_payment(o,p||jsonb_build_object('checked_at',now()+interval '1 minute'));
perform public.portal_ai_topup_apply(t,q||jsonb_build_object('checked_at',now()+interval '1 minute'));
perform public.billing_live_apply_payment(o,p||jsonb_build_object('checked_at',now()-interval '1 minute','provider_paid_on','2026-09-01'));
perform public.portal_ai_topup_apply(t,q||jsonb_build_object('checked_at',now()-interval '1 minute','provider_paid_on','2026-09-01'));
if not exists(select 1 from public.billing_live_payments where order_id=o and provider_paid_on=date '2026-10-02' and spent_cents=100 and credit_cents=398 and eligible) then raise exception 'subscription date/credit mismatch';end if;
if not exists(select 1 from public.portal_ai_topup_payments where order_id=t and provider_paid_on=date '2026-10-03' and spent_cents=100 and cents=1000 and eligible) then raise exception 'topup date/credit mismatch';end if;
end $$;
reset role;
do $$begin
if has_column_privilege('authenticated','public.billing_live_payments','provider_paid_on','SELECT') or has_column_privilege('anon','public.portal_ai_topup_payments','provider_paid_on','SELECT') then raise exception 'client date access';end if;
end $$;
rollback;
select 'PASS: provider dates stable, stale snapshots ignored, spent/credit preserved and browser denied; rolled back' as result;
