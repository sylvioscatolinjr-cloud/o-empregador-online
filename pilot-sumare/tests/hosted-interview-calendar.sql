begin;
do $$
declare v_candidate uuid;v_company uuid;v_cohort uuid;v_job uuid;v_app uuid;v_status text;
begin
select id into strict v_cohort from public.pilot_cohorts where slug='senai-sumare-2026';
select user_id into strict v_candidate from public.pilot_memberships where cohort_id=v_cohort and is_fictitious and role='learner' order by user_id limit 1;
select id,publisher_id into strict v_job,v_company from public.portal_listings where cohort_id=v_cohort and is_fictitious and kind='job' and not exists(select 1 from portal_applications a where a.listing_id=portal_listings.id and a.candidate_id=v_candidate) order by id limit 1;
perform set_config('request.jwt.claim.sub',v_candidate::text,true);
insert into public.portal_applications(listing_id,cohort_id,candidate_id,message) values(v_job,v_cohort,v_candidate,'Verificação transacional — será revertida') returning id into v_app;
perform set_config('request.jwt.claim.sub',v_company::text,true);
perform public.portal_propose_interview(v_app,now()+interval '1 day',now()+interval '1 day 1 hour','Online','https://meet.google.com/test',0);
perform set_config('request.jwt.claim.sub',v_candidate::text,true);
perform public.portal_reply_interview(v_app,'confirmed',1);
select status into v_status from public.portal_interviews where application_id=v_app;
if v_status<>'confirmed' then raise exception 'Confirmação falhou';end if;
perform public.portal_withdraw_application(v_app);
select status into v_status from public.portal_interviews where application_id=v_app;
if v_status<>'cancelled' then raise exception 'Cancelamento falhou';end if;
end $$;
rollback;
