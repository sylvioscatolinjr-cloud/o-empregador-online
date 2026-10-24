begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare c uuid:=gen_random_uuid();u uuid:=gen_random_uuid();other_u uuid:=gen_random_uuid();begin
 insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(c,'wallet-probe-'||c::text,'Synthetic rollback','Teste',now());
 insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(u,'authenticated','authenticated','wallet-probe-'||u::text||'@example.invalid',now(),now(),now()),(other_u,'authenticated','authenticated','wallet-probe-'||other_u::text||'@example.invalid',now(),now(),now());
 insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(c,u,'learner','active',false),(c,other_u,'learner','active',false);
 perform set_config('oeo.wallet_user',u::text,true);perform set_config('oeo.wallet_other',other_u::text,true);perform set_config('oeo.wallet_cohort',c::text,true);
end$$;

set local role service_role;
do $$declare u uuid:=current_setting('oeo.wallet_user')::uuid;c uuid:=current_setting('oeo.wallet_cohort')::uuid;other_u uuid:=current_setting('oeo.wallet_other')::uuid;o uuid;j uuid:=gen_random_uuid();j2 uuid:=gen_random_uuid();p jsonb;r jsonb;begin
 o:=public.portal_ai_topup_create(u,c,1000,'2026-10-23-ai-topup-v1');update public.portal_ai_topup_orders set checkout_id='checkout_ROLLBACK_'||o::text,status='pending' where id=o;
 p:=jsonb_build_object('id','pay_ROLLBACK_'||o::text,'checkout_id','checkout_ROLLBACK_'||o::text,'cents',1000,'status','CONFIRMED','eligible',true,'checked_at',now());perform public.portal_ai_topup_apply(o,p);
 r:=public.portal_ai_image_reserve(u,c,j,'learner','high','9:16',false);if (r->>'isNew')::boolean is not true or (public.portal_ai_wallet_balance(u,c)->>'availableCents')::integer<>500 then raise exception 'price mismatch';end if;
 r:=public.portal_ai_image_reserve(u,c,j,'learner','high','9:16',false);if (r->>'isNew')::boolean is not false or (public.portal_ai_wallet_balance(u,c)->>'availableCents')::integer<>500 then raise exception 'duplicate charged';end if;
 begin perform public.portal_ai_image_reserve(other_u,c,j,'learner','high','9:16',false);raise exception 'TEST foreign job';exception when others then if SQLERRM<>'request mismatch' then raise;end if;end;
 begin perform public.portal_ai_image_reserve(u,c,j2,'learner','medium','4:5',false);raise exception 'TEST parallel job';exception when unique_violation then null;end;
 perform public.portal_ai_image_fail(u,c,j);if (public.portal_ai_wallet_balance(u,c)->>'availableCents')::integer<>1000 then raise exception 'refund mismatch';end if;
 begin perform public.portal_ai_image_fail(u,c,j);raise exception 'TEST repeat refund';exception when others then if SQLERRM<>'invalid job' then raise;end if;end;
 perform public.portal_ai_image_reserve(u,c,j2,'learner','high','16:9',false);update public.portal_ai_image_jobs set status='completed' where id=j2;
 perform public.portal_ai_image_reserve(u,c,gen_random_uuid(),'learner','high','1:1',false);update public.portal_ai_image_jobs set status='completed' where user_id=u;
 begin perform public.portal_ai_image_reserve(u,c,gen_random_uuid(),'learner','medium','4:5',false);raise exception 'TEST overspend';exception when others then if SQLERRM<>'insufficient paid credits' then raise;end if;end;
end$$;
reset role;
set local role authenticated;
do $$begin
 begin perform * from public.portal_ai_image_jobs;raise exception 'TEST browser job table';exception when insufficient_privilege then null;end;
 begin perform public.portal_ai_image_reserve(current_setting('oeo.wallet_user')::uuid,current_setting('oeo.wallet_cohort')::uuid,gen_random_uuid(),'learner','high','1:1',false);raise exception 'TEST browser RPC';exception when insufficient_privilege then null;end;
end$$;
reset role;
rollback;
select true as synthetic_publication_probe_passed;
