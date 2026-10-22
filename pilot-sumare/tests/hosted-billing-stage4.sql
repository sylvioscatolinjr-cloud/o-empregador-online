-- Synthetic database-only probe. Never send these references to Asaas.
begin;
set local lock_timeout='3s';
set local statement_timeout='30s';
do $$declare u uuid:=gen_random_uuid(); o uuid:=gen_random_uuid(); begin
insert into auth.users(id,aud,role,email,created_at,updated_at) values(u,'authenticated','authenticated','billing-stage4-'||u::text||'@example.invalid',now(),now());
insert into public.billing_live_orders(id,user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version)
values(o,u,'5d36b59c-4fec-45e1-a74a-c2423a16c3fe','Candidato',1,'MONTHLY',1990,398,1,'SYNTHETIC-STAGE4-ROLLBACK-NO-PAYMENT');
perform set_config('oeo.probe_user',u::text,true);
perform set_config('oeo.probe_order',o::text,true);
end$$;
set local role service_role;
select set_config('request.jwt.claim.role','service_role',true),set_config('request.jwt.claims','{"role":"service_role"}',true);
do $$declare u uuid:=current_setting('oeo.probe_user')::uuid; o uuid:=current_setting('oeo.probe_order')::uuid;
pid text:='pay_STAGE4_'||o::text; p jsonb; r uuid:=gen_random_uuid(); r2 uuid:=gen_random_uuid(); r3 uuid:=gen_random_uuid(); r4 uuid:=gen_random_uuid(); v integer;
begin
p:=jsonb_build_object('id',pid,'status','CONFIRMED','cents',1990,'period_start',now()-interval '1 hour','period_end',now()+interval '29 days','eligible',true,'checked_at',now());
perform public.billing_live_apply_payment(o,p);
v:=public.portal_ai_paid_reserve(u,r);
if v<>298 then raise exception 'first debit mismatch';end if;
perform public.billing_live_apply_payment(o,p);
if (select spent_cents from public.billing_live_payments where id=pid)<>100 then raise exception 'duplicate payment reset spending';end if;
begin perform public.portal_ai_paid_reserve(u,r);raise exception 'duplicate accepted';exception when others then if sqlerrm<>'duplicate request' then raise;end if;end;
if public.portal_ai_paid_refund(u,r)<>398 or public.portal_ai_paid_refund(u,r)<>398 then raise exception 'refund not idempotent';end if;
perform public.portal_ai_paid_reserve(u,r2);
perform public.portal_ai_paid_reserve(u,r3);
if public.portal_ai_paid_reserve(u,r4)<>98 then raise exception 'whole call rounding mismatch';end if;
begin perform public.portal_ai_paid_reserve(u,gen_random_uuid());raise exception 'overspending accepted';exception when others then if sqlerrm<>'insufficient paid credits' then raise;end if;end;
perform public.billing_live_apply_payment(o,p||jsonb_build_object('eligible',false,'status','REFUNDED','checked_at',now()+interval '1 second'));
perform public.billing_live_apply_payment(o,p);
if (select eligible from public.billing_live_payments where id=pid) then raise exception 'stale payment restored refunded access';end if;
begin perform public.portal_ai_paid_reserve(u,gen_random_uuid());raise exception 'refunded payment allowed';exception when others then if sqlerrm<>'insufficient paid credits' then raise;end if;end;
if has_function_privilege('authenticated','public.portal_ai_paid_reserve(uuid,uuid)','EXECUTE') or has_function_privilege('anon','public.portal_ai_paid_refund(uuid,uuid)','EXECUTE') then raise exception 'client wallet access';end if;
end$$;
reset role;
rollback;
select 'PASS: synthetic payment, debit, duplicate prevention, refund, insufficient balance, revocation and stale snapshot; transaction rolled back' as result;
