begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare c uuid:=gen_random_uuid();u uuid:=gen_random_uuid();other_u uuid:=gen_random_uuid();begin
 insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(c,'wallet-probe-'||c::text,'Synthetic rollback','Teste',now());
 insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(u,'authenticated','authenticated','wallet-probe-'||u::text||'@example.invalid',now(),now(),now()),(other_u,'authenticated','authenticated','wallet-probe-'||other_u::text||'@example.invalid',now(),now(),now());
 insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(c,u,'learner','active',false),(c,other_u,'learner','active',false);
 perform set_config('oeo.wallet_user',u::text,true);perform set_config('oeo.wallet_other',other_u::text,true);perform set_config('oeo.wallet_cohort',c::text,true);
end$$;
set local role service_role;
do $$declare u uuid:=current_setting('oeo.wallet_user')::uuid;c uuid:=current_setting('oeo.wallet_cohort')::uuid;other_u uuid:=current_setting('oeo.wallet_other')::uuid;o uuid;r uuid:=gen_random_uuid();p jsonb;b jsonb;begin
 o:=public.portal_ai_topup_create(u,c,1000,'2026-10-23-ai-topup-v1');update public.portal_ai_topup_orders set checkout_id='checkout_ROLLBACK_'||o::text,status='pending' where id=o;
 p:=jsonb_build_object('id','pay_ROLLBACK_'||o::text,'checkout_id','checkout_ROLLBACK_'||o::text,'cents',1000,'status','CONFIRMED','eligible',true,'checked_at',now());
 perform public.portal_ai_topup_apply(o,p);perform public.portal_ai_topup_apply(o,p);
 b:=public.portal_ai_wallet_balance(u,c);if (b->>'availableCents')::integer<>1000 then raise exception 'duplicate grant';end if;
 if (public.portal_ai_wallet_balance(other_u,c)->>'availableCents')::integer<>0 then raise exception 'wallet leak';end if;
 if public.portal_ai_wallet_reserve(u,c,r)<>900 then raise exception 'debit mismatch';end if;
 begin perform public.portal_ai_wallet_reserve(u,c,r);raise exception 'TEST duplicate accepted';exception when others then if SQLERRM<>'duplicate request' then raise;end if;end;
 begin perform public.portal_ai_wallet_refund(other_u,c,r);raise exception 'TEST foreign refund';exception when others then if SQLERRM<>'reservation not found' then raise;end if;end;
 if public.portal_ai_wallet_refund(u,c,r)<>1000 or public.portal_ai_wallet_refund(u,c,r)<>1000 then raise exception 'refund not idempotent';end if;
 for i in 1..10 loop perform public.portal_ai_wallet_reserve(u,c,gen_random_uuid());end loop;
 begin perform public.portal_ai_wallet_reserve(u,c,gen_random_uuid());raise exception 'TEST overspend';exception when others then if SQLERRM<>'insufficient paid credits' then raise;end if;end;
 perform public.portal_ai_topup_create(u,c,2500,'2026-10-23-ai-topup-v1');
 perform public.portal_ai_topup_apply(o,p||jsonb_build_object('eligible',false,'status','PENDING','checked_at',now()+interval '1 second'));perform public.portal_ai_topup_apply(o,p);
 if (public.portal_ai_wallet_balance(u,c)->>'held')::boolean is not true then raise exception 'stale event restored credit';end if;
end$$;
reset role;
set local role authenticated;
do $$begin
 begin perform public.portal_ai_wallet_balance(current_setting('oeo.wallet_user')::uuid,current_setting('oeo.wallet_cohort')::uuid);raise exception 'TEST client rpc';exception when insufficient_privilege then null;end;
 begin perform * from public.portal_ai_topup_payments;raise exception 'TEST client table';exception when insufficient_privilege then null;end;
end$$;
reset role;
rollback;
select true as synthetic_wallet_probe_passed;
