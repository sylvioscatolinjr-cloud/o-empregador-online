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
select true as authenticated_rank_passed;
reset role;
set local role service_role;
do $$declare r jsonb;begin
 r:=public.portal_ordered_public_feed(current_setting('oeo.ranking_cohort')::uuid,'candidates','',0,50);
 if jsonb_array_length(r)<>3 or r->0->>'name'<>'Omega destaque' or r->1->>'name'<>'Zulu pago' then raise exception 'public feed order mismatch';end if;
 if r->0 ? 'subscription_tier' or r->0 ? 'professional_points' or r->0 ? 'user_id' then raise exception 'private field leaked';end if;
end $$;
select true as public_projection_and_order_passed;
reset role;

-- All users below were created in this transaction; never impersonate a real account.
do $$declare co uuid:=current_setting('oeo.ranking_cohort')::uuid;org uuid:=current_setting('request.jwt.claim.sub')::uuid;dep uuid;dep2 uuid;member uuid;begin
 insert into public.portal_departments(organization_id,cohort_id,name) values(org,co,'Synthetic A') returning id into dep;
 insert into public.portal_departments(organization_id,cohort_id,name) values(org,co,'Synthetic B') returning id into dep2;
 for member in select user_id from public.portal_candidate_cards where cohort_id=co loop
  insert into public.portal_team_invitations(department_id,organization_id,candidate_id,cohort_id,candidate_name,department_name,organization_name,status)
  values(dep,org,member,co,'Synthetic member','Synthetic A','Synthetic organization','accepted'),(dep2,org,member,co,'Synthetic member','Synthetic B','Synthetic organization','accepted');
 end loop;
 insert into public.portal_candidate_regions(user_id,cohort_id,latitude,longitude) select user_id,co,-22.9,-47.1 from public.portal_candidate_cards where cohort_id=co and name='Alpha gratuito';
end$$;
set local role service_role;
do $$declare co uuid:=current_setting('oeo.ranking_cohort')::uuid;org uuid:=current_setting('request.jwt.claim.sub')::uuid;s jsonb;r jsonb;begin
 s:=public.portal_organization_points(org,co);
 if (s->'organization'->>'members')::integer<>3 or (s->'organization'->>'average')::numeric<>0 then raise exception 'team aggregate mismatch';end if;
 if jsonb_array_length(s->'departments')<>2 then raise exception 'department aggregate mismatch';end if;
 r:=public.portal_distance_candidate_search(co,'','',false,0,-22.9,-47.1);
 if jsonb_array_length(r)<>3 or r->0->>'name'<>'Omega destaque' or r->1->>'name'<>'Zulu pago' then raise exception 'candidate priority regressed';end if;
 if r->0 ? 'latitude' or r->0 ? 'rank_distance' or r->0 ? 'subscription_tier' then raise exception 'private region data leaked';end if;
 if abs(pilot_private.postal_distance_km(-22.8965,-47.0533,-23.5505,-46.6333)-84)>10 then raise exception 'distance formula mismatch';end if;
end$$;
reset role;
set local role service_role;
do $$declare co uuid:=current_setting('oeo.ranking_cohort')::uuid;org uuid:=current_setting('request.jwt.claim.sub')::uuid;r jsonb;n bigint;begin
 r:=public.portal_organization_points_history(org,co);
 if jsonb_array_length(r->'history')<>3 then raise exception 'initial history missing';end if;
 r:=public.portal_organization_points_history(org,co);
 select count(*) into n from public.portal_organization_point_history where organization_id=org and cohort_id=co;
 if n<>3 then raise exception 'unchanged means duplicated';end if;
end$$;
reset role;
update public.portal_team_invitations set status='ended' where cohort_id=current_setting('oeo.ranking_cohort')::uuid;
set local role service_role;
do $$declare co uuid:=current_setting('oeo.ranking_cohort')::uuid;org uuid:=current_setting('request.jwt.claim.sub')::uuid;r jsonb;general jsonb;begin
 r:=public.portal_organization_points_history(org,co);
 select item into general from jsonb_array_elements(r->'history') item where item->>'department_id' is null limit 1;
 if (r->'organization'->>'members')::integer<>0 or r->'organization'->>'average' is not null then raise exception 'empty means should be unavailable';end if;
 if (general->>'previous_members')::integer<>3 or (general->>'previous_average')::numeric<>0 then raise exception 'history did not preserve previous mean';end if;
 if general ? 'candidate_id' or general ? 'organization_id' then raise exception 'history projection leaked identity';end if;
end$$;
reset role;
set local role authenticated;
do $$begin
 begin
 perform public.portal_organization_points_history(current_setting('request.jwt.claim.sub')::uuid,current_setting('oeo.ranking_cohort')::uuid);
 raise exception 'TEST: client history execute succeeded';
 exception when insufficient_privilege then null;end;
 begin
 perform * from public.portal_organization_point_history;
 raise exception 'TEST: client history table succeeded';
 exception when insufficient_privilege then null;end;
end$$;
reset role;
rollback;
select true as transactional_history_baseline_change_isolation_passed;
