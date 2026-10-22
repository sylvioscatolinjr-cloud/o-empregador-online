-- Synthetic-only ranking probe. ROLLBACK leaves no cohort, identity, card or payment.
begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare c uuid:=gen_random_uuid();viewer uuid:=gen_random_uuid();u uuid;o uuid;label text;begin
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
 perform set_config('request.jwt.claim.sub',viewer::text,true);
 perform set_config('oeo.ranking_cohort',c::text,true);
end $$;
set local role authenticated;
do $$declare r jsonb;begin
 r:=public.portal_search_scored_candidates(current_setting('oeo.ranking_cohort')::uuid,'','',false,0);
 if jsonb_array_length(r)<>3 or r->0->>'name'<>'Omega destaque' or r->1->>'name'<>'Zulu pago' or r->2->>'name'<>'Alpha gratuito' then raise exception 'ranking order failed';end if;
 if r->0 ? 'subscription_tier' then raise exception 'internal billing field leaked';end if;
end $$;
select true as actual_rank_and_projection_passed;
reset role;
rollback;
