begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare c uuid:=gen_random_uuid();u uuid;o uuid;p jsonb;profile text;r text;q integer;cr integer;t integer;begin
insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(c,'tier4-probe-'||c::text,'Synthetic rollback','Teste',now());
for profile,r,q in select * from (values('Candidato','learner',9990),('Empresa','recruiter',99990),('Instituição de Ensino','school_staff',99990)) x(profile,role,cents) loop
u:=gen_random_uuid();o:=gen_random_uuid();cr:=round(q::numeric*30/100)::integer;
insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(u,'authenticated','authenticated','tier4-probe-'||u::text||'@example.invalid',now(),now(),now());
insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(c,u,r,'active',false);
insert into public.billing_live_orders(id,user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version) values(o,u,c,profile,4,'MONTHLY',q,cr,1,'2026-10-25-four-tiers-v1');
p:=jsonb_build_object('id','pay_TIER4_'||o::text,'status','CONFIRMED','cents',q,'period_start',now()-interval '1 hour','period_end',now()+interval '29 days','eligible',true,'checked_at',now());
perform public.billing_live_apply_payment(o,p);perform public.billing_live_apply_payment(o,p);
if pilot_private.verified_paid_tier(u,c,profile)<>4 then raise exception 'tier four grant failed';end if;
if (public.portal_ai_wallet_balance(u,c)->>'subscriptionCents')::int<>cr then raise exception 'cashback mismatch or duplicate';end if;
if pilot_private.verified_paid_tier(u,c,case when profile='Empresa' then 'Candidato' else 'Empresa' end)<>0 then raise exception 'foreign profile grant';end if;
perform public.billing_live_apply_payment(o,p||jsonb_build_object('status','REFUNDED','eligible',false,'checked_at',now()+interval '1 second'));
if pilot_private.verified_paid_tier(u,c,profile)<>0 or (public.portal_ai_wallet_balance(u,c)->>'subscriptionCents')::int<>0 then raise exception 'refunded credit not revoked';end if;
end loop;
if has_function_privilege('authenticated','pilot_private.verified_paid_tier(uuid,uuid,text)','execute') or has_function_privilege('anon','public.billing_live_apply_payment(uuid,jsonb)','execute') then raise exception 'financial client access';end if;
end $$;
rollback;
select 'PASS: three tier-four profiles, exact 30% credit, payment idempotency, profile isolation and refund revocation; rollback' as result;
