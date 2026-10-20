-- Only synthetic actors participate; all changes are rolled back.
begin;
do $$
declare co uuid;company uuid;delegate_user uuid;candidate_user uuid;owner_user uuid;job uuid;app uuid;inv uuid;result jsonb;blocked boolean:=false;
begin
 select id into strict co from public.pilot_cohorts where slug='senai-sumare-2026';
 select user_id into strict owner_user from public.pilot_memberships where cohort_id=co and role='pilot_owner' and status='active' limit 1;
 select u.id into strict company from auth.users u join public.pilot_memberships m on m.user_id=u.id and m.cohort_id=co where u.email='recruiter-01@demo.oempregador.invalid' and m.is_fictitious;
 select u.id into strict candidate_user from auth.users u join public.pilot_memberships m on m.user_id=u.id and m.cohort_id=co where u.email='learner-01@demo.oempregador.invalid' and m.is_fictitious;
 select u.id into strict delegate_user from auth.users u join public.pilot_memberships m on m.user_id=u.id and m.cohort_id=co where u.email='learner-02@demo.oempregador.invalid' and m.is_fictitious;
 select l.id,a.id into strict job,app from public.portal_listings l join public.portal_applications a on a.listing_id=l.id where l.publisher_id=company and l.is_fictitious and a.candidate_id=candidate_user;
 perform set_config('request.jwt.claim.sub',candidate_user::text,true);set local role authenticated;
 update public.pilot_profiles set has_senai=true,senai_status='completed' where user_id=candidate_user;
 update public.portal_candidate_cards set has_senai=true where user_id=candidate_user;
 result:=public.portal_search_scored_candidates(co,'','',true,0);
 if jsonb_array_length(result)<1 then raise exception 'Filtro SENAI falhou';end if;
 if public.portal_learning_score(candidate_user,co)<>0 then raise exception 'Pontos sem comprovação';end if;
 reset role;
 -- A past confirmed synthetic interview permits assessment; real interviews are untouched.
 update public.portal_interviews set starts_at=now()-interval '2 hours',ends_at=now()-interval '1 hour',status='confirmed' where application_id=app;
 perform set_config('request.jwt.claim.sub',company::text,true);set local role authenticated;
 perform public.portal_org_access_command(co,'invite',jsonb_build_object('email','learner-02@demo.oempregador.invalid','permissions',jsonb_build_array('publish','recruitment')));
 select id into strict inv from public.portal_org_access where organization_id=company and user_id=delegate_user;
 reset role;
 perform set_config('request.jwt.claim.sub',delegate_user::text,true);set local role authenticated;
 perform public.portal_org_access_command(co,'accepted',jsonb_build_object('id',inv));
 perform public.portal_recruitment_command(co,company,'rubric',jsonb_build_object('listing',job,'criteria',jsonb_build_array('Conhecimento técnico','Comunicação')));
 perform public.portal_recruitment_command(co,company,'evaluate',jsonb_build_object('listing',job,'application',app,'grades',jsonb_build_array(8,10),'evidence','Fictício — evidências para ensaio transacional.'));
 result:=public.portal_recruitment_command(co,company,'overview',jsonb_build_object('listing',job));
 if (result->'ranking'->0->>'average')::numeric<>9 then raise exception 'Média incorreta';end if;
 reset role;
 perform set_config('request.jwt.claim.sub',company::text,true);set local role authenticated;
 perform public.portal_org_access_command(co,'revoked',jsonb_build_object('id',inv));reset role;
 perform set_config('request.jwt.claim.sub',delegate_user::text,true);set local role authenticated;
 begin perform public.portal_recruitment_command(co,company,'overview',jsonb_build_object('listing',job));exception when others then if sqlerrm like '%Acesso negado%' then blocked:=true;else raise;end if;end;
 if not blocked then raise exception 'Acesso revogado continuou ativo';end if;
 reset role;
 perform set_config('request.jwt.claim.sub',candidate_user::text,true);set local role authenticated;
 blocked:=false;begin perform public.portal_recruitment_command(co,company,'overview',jsonb_build_object('listing',job));exception when others then if sqlerrm like '%Acesso negado%' then blocked:=true;else raise;end if;end;
 if not blocked then raise exception 'Candidato acessou observações internas';end if;reset role;
end $$;
rollback;
