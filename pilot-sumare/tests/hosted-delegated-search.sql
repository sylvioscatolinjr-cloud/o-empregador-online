-- Synthetic-only ranking probe. ROLLBACK leaves no cohort, identity, card or payment.
begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare c uuid:=gen_random_uuid();viewer uuid:=gen_random_uuid();delegate uuid:=gen_random_uuid();u uuid;o uuid;label text;begin
 insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(c,'ranking-probe-'||c::text,'Synthetic rollback probe','Teste',now());
 insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(viewer,'authenticated','authenticated','ranking-probe-'||viewer::text||'@example.invalid',now(),now(),now());
 insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(c,viewer,'recruiter','active',true);
 foreach label in array array['Alpha gratuito','Zulu pago','Omega destaque'] loop
  u:=gen_random_uuid();
  insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(u,'authenticated','authenticated','ranking-probe-'||u::text||'@example.invalid',now(),now(),now());
  insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(c,u,'learner','active',true);
  insert into public.portal_candidate_cards(user_id,cohort_id,name,headline,city,visible,is_fictitious,is_featured) values(u,c,label,'Desenho técnico','Teste',true,true,label='Omega destaque');
  if label='Zulu pago' then
   o:=gen_random_uuid();
   insert into public.billing_live_orders(id,user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version) values(o,u,c,'Candidato',1,'MONTHLY',1990,398,1,'SYNTHETIC-RANKING-ROLLBACK');
   insert into public.billing_live_payments(id,order_id,status,cents,credit_cents,period_start,period_end,eligible,checked_at) values('SYNTHETIC_RANKING_'||o::text,o,'CONFIRMED',1990,398,now()-interval '1 hour',now()+interval '1 day',true,now());
  end if;
 end loop;
 insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(delegate,'authenticated','authenticated','ranking-probe-'||delegate::text||'@example.invalid',now(),now(),now());
 insert into public.pilot_memberships(cohort_id,user_id,role,status,is_fictitious) values(c,delegate,'learner','active',true);
 insert into public.portal_org_access(cohort_id,organization_id,user_id,organization_name,user_name,permissions,status) values(c,viewer,delegate,'Organização sintética','Subusuário sintético',array['searchCandidates'],'accepted');
 perform set_config('oeo.ranking_org',viewer::text,true);
 perform set_config('request.jwt.claim.sub',delegate::text,true);
 perform set_config('oeo.ranking_cohort',c::text,true);
end $$;
set local role authenticated;
do $$declare r jsonb;begin
 r:=public.portal_delegated_command(current_setting('oeo.ranking_cohort')::uuid,current_setting('oeo.ranking_org')::uuid,'candidates','{}');
 if jsonb_array_length(r)<>3 or r->0->>'name'<>'Omega destaque' or r->1->>'name'<>'Zulu pago' or r->2->>'name'<>'Alpha gratuito' then raise exception 'delegated ranking order failed';end if;
 if r->0 ? 'subscription_tier' or r->0 ? 'professional_points' or r->0 ? 'user_id' or r->0 ? 'photo_data' then raise exception 'private or unused field leaked';end if;
 r:=public.portal_delegated_command(current_setting('oeo.ranking_cohort')::uuid,current_setting('oeo.ranking_org')::uuid,'candidates','{"query":"Zulu","page":0}');
 if jsonb_array_length(r)<>1 or r->0->>'name'<>'Zulu pago' then raise exception 'filter lost';end if;
 r:=public.portal_delegated_command(current_setting('oeo.ranking_cohort')::uuid,current_setting('oeo.ranking_org')::uuid,'candidates','{"page":1}');
 if jsonb_array_length(r)<>0 then raise exception 'pagination failed';end if;
end $$;
reset role;
update public.portal_org_access set status='revoked' where cohort_id=current_setting('oeo.ranking_cohort')::uuid;
set local role authenticated;
do $$begin
 begin
 perform public.portal_delegated_command(current_setting('oeo.ranking_cohort')::uuid,current_setting('oeo.ranking_org')::uuid,'candidates','{}');
 raise exception 'TEST: revoked access succeeded';
 exception when others then if SQLERRM like 'TEST:%' then raise;end if;end;
end $$;
select true as delegated_rank_filter_pagination_revocation_passed;
reset role;
rollback;
