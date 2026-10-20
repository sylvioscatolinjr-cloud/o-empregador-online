begin;
do $$
declare c record;v_cohort uuid;company uuid;school uuid;job uuid;course uuid;app uuid;interest uuid;dep uuid;inv uuid;step uuid;ci public.portal_candidate_cards;v_count int;v_n int:=0;
begin
 select id into strict v_cohort from public.pilot_cohorts where slug='senai-sumare-2026';
 for c in select u.id,u.email from auth.users u join public.pilot_memberships m on m.user_id=u.id where m.cohort_id=v_cohort and m.is_fictitious and m.role='learner' and u.email like 'learner-%@demo.oempregador.invalid' order by u.email loop
 v_n:=v_n+1;
 select u.id into strict company from auth.users u join public.pilot_memberships m on m.user_id=u.id where u.email=replace(c.email,'learner-','recruiter-') and m.cohort_id=v_cohort and m.is_fictitious and m.role='recruiter';
 select u.id into strict school from auth.users u join public.pilot_memberships m on m.user_id=u.id where u.email=replace(c.email,'learner-','school_staff-') and m.cohort_id=v_cohort and m.is_fictitious and m.role='school_staff';
 select id into strict job from public.portal_listings where publisher_id=company and cohort_id=v_cohort and is_fictitious and kind='job' limit 1;
 select id into strict course from public.portal_listings where publisher_id=school and cohort_id=v_cohort and is_fictitious and kind='course' limit 1;
 select * into strict ci from public.portal_candidate_cards where user_id=c.id and is_fictitious;
 perform set_config('request.jwt.claim.sub',c.id::text,true);set local role authenticated;
 insert into public.portal_favorites(user_id,cohort_id,listing_id) values(c.id,v_cohort,job) on conflict do nothing;
 if not exists(select 1 from public.portal_career_jobs where user_id=c.id and portal_career_jobs.company='Empresa de Teste — Fictício') then
 insert into public.portal_career_jobs(user_id,cohort_id,company,role,starts_on,salary,level,events) values(c.id,v_cohort,'Empresa de Teste — Fictício','Técnico','2025-01-01',2500,2,'[{"date":"2026-01-01","role":"Técnico Pleno","salary":3500,"level":3}]');end if;
 if not exists(select 1 from public.portal_applications where listing_id=job and candidate_id=c.id) then insert into public.portal_applications(listing_id,cohort_id,candidate_id,message) values(job,v_cohort,c.id,'Fictício — candidatura de ensaio integrado');end if;
 select id into strict app from public.portal_applications where listing_id=job and candidate_id=c.id;
 if not exists(select 1 from public.portal_applications where listing_id=course and candidate_id=c.id) then insert into public.portal_applications(listing_id,cohort_id,candidate_id,message) values(course,v_cohort,c.id,'Fictício — interesse em curso para ensaio integrado');end if;
 select id into strict interest from public.portal_applications where listing_id=course and candidate_id=c.id;
 reset role;
 perform set_config('request.jwt.claim.sub',school::text,true);set local role authenticated;
 if not exists(select 1 from public.portal_applications where id=interest and response like 'Fictício%') then perform public.portal_respond_application(interest,'reviewing','Fictício — instituição recebeu seu interesse no curso. Não há matrícula real.');end if;reset role;
 perform set_config('request.jwt.claim.sub',company::text,true);set local role authenticated;
 if not exists(select 1 from public.portal_selection_steps where application_id=app and name='Triagem — Fictício') then
 insert into public.portal_selection_steps(application_id,name,due_at) values(app,'Triagem — Fictício',now()+interval '1 day') returning id into step;
 update public.portal_selection_steps set completed=true where id=step;
 update public.portal_selection_steps set completed=false where id=step;
 update public.portal_selection_steps set completed=true where id=step;end if;
 if not exists(select 1 from public.portal_applications where id=app and response like 'Fictício%') then perform public.portal_respond_application(app,'interview','Fictício — empresa recebeu seu currículo e propõe entrevista de teste.');end if;
 if not exists(select 1 from public.portal_interviews where application_id=app) then perform public.portal_propose_interview(app,now()+interval '2 days',now()+interval '2 days 1 hour','Online — Fictício','https://meet.google.com/entrevista-ficticia',0);end if;
 insert into public.portal_departments(organization_id,cohort_id,name) values(company,v_cohort,'Equipe de Teste — Fictício') on conflict do nothing;
 select id into strict dep from public.portal_departments where organization_id=company and name='Equipe de Teste — Fictício';
 if not exists(select 1 from public.portal_team_invitations where department_id=dep and candidate_id=c.id) then perform public.portal_team_command(dep,ci.id,null,'invite');end if;
 select id into strict inv from public.portal_team_invitations where department_id=dep and candidate_id=c.id;
 reset role;
 perform set_config('request.jwt.claim.sub',c.id::text,true);set local role authenticated;
 if exists(select 1 from public.portal_interviews where application_id=app and status='proposed' and revision=1) then perform public.portal_reply_interview(app,case when v_n%5=0 then 'declined' else 'confirmed' end,1);end if;
 if exists(select 1 from public.portal_team_invitations where id=inv and status='pending') then perform public.portal_team_command(null,null,inv,case when v_n%5=0 then 'declined' else 'accepted' end);end if;
 if not exists(select 1 from public.portal_applications where id=interest and response like 'Fictício%') or not exists(select 1 from public.portal_selection_steps where application_id=app and completed) then raise exception 'Falha na comunicação candidato/organização';end if;
 select count(*) into v_count from public.portal_career_jobs;if v_count<>1 then raise exception 'Carreira privada vazou ou está ausente';end if;
 update public.portal_notifications set read_at=now() where read_at is null;
 reset role;
 perform set_config('request.jwt.claim.sub',company::text,true);set local role authenticated;
 if exists(select 1 from public.portal_career_jobs) or exists(select 1 from public.portal_favorites) then raise exception 'Dados privados expostos à empresa';end if;
 if not exists(select 1 from public.portal_team_invitations where id=inv and status in ('accepted','declined')) then raise exception 'Resposta do vínculo não recebida';end if;
 reset role;
 end loop;
 if v_n<>50 then raise exception 'Esperados 50 candidatos fictícios, encontrados %',v_n;end if;
end $$;
commit;
