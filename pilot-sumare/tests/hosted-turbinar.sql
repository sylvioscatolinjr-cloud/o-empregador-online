begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare c uuid:=gen_random_uuid();s uuid:=gen_random_uuid();o uuid:=gen_random_uuid();r uuid:=gen_random_uuid();begin
 insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(c,'campaign-probe-'||c::text,'Synthetic rollback','Teste',now());
 insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at)
 select x,'authenticated','authenticated','campaign-probe-'||x::text||'@example.invalid',now(),now(),now() from unnest(array[s,o,r]) x;
 insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious,age_band) values(c,s,'school_staff','active',false,'18_plus'),(c,o,'pilot_owner','active',false,'18_plus'),(c,r,'learner','active',false,'18_plus');
 perform set_config('oeo.campaign_sender',s::text,true);perform set_config('oeo.campaign_owner',o::text,true);perform set_config('oeo.campaign_recipient',r::text,true);perform set_config('oeo.campaign_cohort',c::text,true);
end$$;
set local role service_role;
do $$declare s uuid:=current_setting('oeo.campaign_sender')::uuid;o uuid:=current_setting('oeo.campaign_owner')::uuid;r uuid:=current_setting('oeo.campaign_recipient')::uuid;c uuid:=current_setting('oeo.campaign_cohort')::uuid;campaign uuid;topup uuid;result jsonb;begin
 perform public.portal_campaign_preference(r,c,true,array['industry']);
 campaign:=public.portal_campaign_quote(s,c,jsonb_build_object('title','Synthetic rollback','body','Not a real campaign','filters',jsonb_build_object('role','learner','state','','city','','topic','industry')));
 if (select quoted_cents from public.portal_campaigns where id=campaign)<>5 then raise exception 'bad quote';end if;
 perform public.portal_campaign_action(s,c,campaign,'submit','',5);
 result:=public.portal_campaign_action(o,c,campaign,'approve');if (result->>'missingCents')::integer<>5 then raise exception 'bad shortage';end if;
 if exists(select 1 from public.portal_notifications where cohort_id=c) then raise exception 'delivery before balance';end if;
 topup:=public.portal_ai_topup_create(s,c,1000,'2026-10-23-ai-topup-v1');update public.portal_ai_topup_orders set checkout_id='checkout_ROLLBACK_'||topup::text,status='pending' where portal_ai_topup_orders.id=topup;
 perform public.portal_ai_topup_apply(topup,jsonb_build_object('id','pay_ROLLBACK_'||topup::text,'checkout_id','checkout_ROLLBACK_'||topup::text,'cents',1000,'status','CONFIRMED','eligible',true,'checked_at',now()));
 result:=public.portal_campaign_action(s,c,campaign,'send');if (result->>'chargedCents')::integer<>5 then raise exception 'bad charge';end if;
 result:=public.portal_campaign_action(s,c,campaign,'send');if not (result->>'duplicate')::boolean then raise exception 'bad duplicate';end if;
 if (public.portal_ai_wallet_balance(s,c)->>'purchasedCents')::integer<>995 then raise exception 'bad balance';end if;
 if (select count(*) from public.portal_notifications where cohort_id=c and user_id=r)<>1 then raise exception 'bad delivery';end if;
 if has_table_privilege('authenticated','public.portal_campaigns','select') or has_function_privilege('authenticated','public.portal_campaign_send(uuid,uuid,uuid)','execute') then raise exception 'browser privilege leak';end if;
end$$;
rollback;
