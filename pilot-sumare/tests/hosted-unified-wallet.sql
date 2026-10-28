-- Isolated synthetic cohort only. No Asaas/OpenAI calls. Every record and notification is rolled back.
begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare c uuid:=gen_random_uuid();u uuid:=gen_random_uuid();card uuid:=gen_random_uuid();begin
 insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(c,'unified-wallet-probe-'||c::text,'Synthetic rollback','Teste',now());
 insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(u,'authenticated','authenticated','unified-wallet-'||u::text||'@example.invalid',now(),now(),now());
 insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious,age_band) values(c,u,'learner','active',false,'18_plus');
 insert into public.portal_course_wishlists(user_id,courses) values(u,array['SolidWorks','Impressão 3D','Tecnologia']);
 insert into public.portal_candidate_cards(id,user_id,cohort_id,name,headline,visible) values(card,u,c,'Synthetic rollback','Synthetic test',true);
 insert into public.portal_wallet_rollout(cohort_id,enabled) values(c,true);
 perform set_config('oeo.unified_user',u::text,true);perform set_config('oeo.unified_cohort',c::text,true);perform set_config('oeo.unified_card',card::text,true);
end$$;
set local role service_role;
do $$declare u uuid:=current_setting('oeo.unified_user')::uuid;c uuid:=current_setting('oeo.unified_cohort')::uuid;card uuid:=current_setting('oeo.unified_card')::uuid;req uuid:=gen_random_uuid();hreq uuid:=gen_random_uuid();topup uuid;ord uuid;b jsonb;tier integer;begin
 b:=public.portal_wallet_plan(u,c,req,1,'MONTHLY',1990,'2026-10-28-unified-wallet-v1');if (b->>'missingCents')::integer<>1990 then raise exception 'shortage failed';end if;
 topup:=public.portal_ai_topup_create(u,c,5000,'2026-10-23-ai-topup-v1');update public.portal_ai_topup_orders set checkout_id='checkout_ROLLBACK_'||topup::text where id=topup;
 perform public.portal_ai_topup_apply(topup,jsonb_build_object('id','pay_ROLLBACK_'||topup::text,'checkout_id','checkout_ROLLBACK_'||topup::text,'cents',5000,'status','CONFIRMED','eligible',true,'checked_at',now()));
 b:=public.portal_wallet_plan(u,c,req,1,'MONTHLY',1990,'2026-10-28-unified-wallet-v1');ord:=(b->>'id')::uuid;if not (b->>'paid')::boolean then raise exception 'purchase failed';end if;
 b:=public.portal_wallet_plan(u,c,req,1,'MONTHLY',1990,'2026-10-28-unified-wallet-v1');if not (b->>'duplicate')::boolean then raise exception 'duplicate purchase';end if;
 tier:=public.portal_highlight_tier(u,c);if tier<>1 then raise exception 'wallet did not grant real entitlement';end if;
 b:=public.portal_wallet_highlight(u,c,hreq,'candidate',card,7,1,891,'2026-10-26-highlight-v1');if not (b->>'paid')::boolean then raise exception 'highlight failed';end if;
 b:=public.portal_wallet_highlight(u,c,hreq,'candidate',card,7,1,891,'2026-10-26-highlight-v1');if not (b->>'duplicate')::boolean then raise exception 'duplicate highlight';end if;
 if (public.portal_ai_wallet_balance(u,c)->>'purchasedCents')::integer<>2119 then raise exception 'balance mismatch';end if;
 update public.portal_wallet_subscriptions set next_due=now()+interval '23 hours' where order_id=ord;
 update public.portal_ai_topup_payments set spent_cents=4900 where order_id=topup;
 perform public.portal_wallet_renewals();perform public.portal_wallet_renewals();
 if (select count(*) from public.portal_notifications where cohort_id=c and title like 'Renovação amanhã%')<>1 then raise exception 'reminder duplicate or absent';end if;
 -- Restore only the synthetic spending snapshot in this rollback transaction, then test due renewal.
 update public.portal_ai_topup_payments set spent_cents=2881 where order_id=topup;
 -- Model the previous cycle as one month old; transaction now() is constant in this rollback test.
 update public.portal_wallet_purchases set created_at=now()-interval '1 month' where id=req;
 update public.billing_live_payments set period_start=now()-interval '1 month',period_end=now()-interval '1 second' where order_id=ord;
 update public.portal_wallet_subscriptions set next_due=now()-interval '1 second' where order_id=ord;
 if public.portal_wallet_renewals()<>1 or public.portal_wallet_renewals()<>0 then raise exception 'renewal idempotence failed';end if;
 if (public.portal_ai_wallet_balance(u,c)->>'purchasedCents')::integer<>129 then raise exception 'renewal balance failed';end if;
 perform public.portal_wallet_cancel(u,c,ord);
 if (select auto_renew from public.portal_wallet_subscriptions where order_id=ord) then raise exception 'cancel failed';end if;
 update public.portal_ai_topup_payments set eligible=false where order_id=topup;
 if exists(select 1 from public.billing_live_payments where order_id=ord and eligible) then raise exception 'funding reversal failed';end if;
 if has_table_privilege('authenticated','public.portal_wallet_purchases','select') or has_function_privilege('authenticated','public.portal_wallet_plan(uuid,uuid,uuid,integer,text,integer,text)','execute') then raise exception 'client privilege leak';end if;
end$$;
rollback;
