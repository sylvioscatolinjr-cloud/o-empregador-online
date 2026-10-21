begin;
do $$declare u uuid:=gen_random_uuid();begin
insert into auth.users(id,aud,role,email,created_at,updated_at) values(u,'authenticated','authenticated','resume-review-probe-'||u::text||'@example.invalid',now(),now());
insert into public.pilot_profiles(user_id,display_name,about,skills,resume_details) values(u,'Teste fictício','Texto original','CAD','{"version":1,"contact":{"email":"private@example.invalid"},"share_contact":false,"share_photo":false}'::jsonb) on conflict(user_id) do update set about='Texto original',skills='CAD',resume_details=excluded.resume_details;
perform set_config('oeo.probe_user',u::text,true);
end$$;
set local role service_role;
select set_config('request.jwt.claim.role','service_role',true),set_config('request.jwt.claims','{"role":"service_role"}',true);
do $$declare u uuid:=current_setting('oeo.probe_user')::uuid; expected jsonb; ok boolean;begin
select to_jsonb(s) into expected from (select about,skills,experience,education,courses,certifications,resume_details,resume_path,display_name from public.pilot_profiles where user_id=u) s;
ok:=public.portal_ai_apply_resume(u,expected,'{"about":"Texto revisado"}'::jsonb);
if ok is distinct from true then raise exception 'save failed';end if;
if (select about from public.pilot_profiles where user_id=u)<>'Texto revisado' then raise exception 'text not saved';end if;
if (select skills from public.pilot_profiles where user_id=u)<>'CAD' then raise exception 'unselected field changed';end if;
if (select resume_details->'contact'->>'email' from public.pilot_profiles where user_id=u)<>'private@example.invalid' then raise exception 'contact changed';end if;
ok:=public.portal_ai_apply_resume(u,expected,'{"about":"Old proposal"}'::jsonb);
if ok is distinct from false then raise exception 'stale save accepted';end if;
if has_function_privilege('authenticated','public.portal_ai_apply_resume(uuid,jsonb,jsonb)','EXECUTE') then raise exception 'client privilege';end if;
begin perform public.portal_ai_apply_resume(u,expected,'{"display_name":"tamper"}'::jsonb);raise exception 'bad patch accepted';exception when others then if sqlerrm<>'invalid patch key' then raise;end if;end;
end$$;
do $$declare u uuid:=current_setting('oeo.probe_user')::uuid; c uuid;begin
 select id into c from public.pilot_cohorts limit 1;
 insert into public.portal_ai_notes(user_id,cohort_id,profile_role,task_id,question,answer) values(u,c,'learner','goal_followup','STAGE2_FICTITIOUS_PROBE','Orientação fictícia');
 if (select count(*) from public.portal_ai_notes where user_id=u)<>1 then raise exception 'history insert';end if;
 delete from public.portal_ai_notes where user_id=u;
 if exists(select 1 from public.portal_ai_notes where user_id=u) then raise exception 'history delete';end if;
 if not exists(select 1 from pg_class where oid='public.portal_ai_notes'::regclass and relrowsecurity) then raise exception 'RLS missing';end if;
 if exists(select 1 from (values('anon'),('authenticated')) r(name) where has_table_privilege(r.name,'public.portal_ai_notes','SELECT') or has_table_privilege(r.name,'public.portal_ai_notes','INSERT') or has_table_privilege(r.name,'public.portal_ai_notes','UPDATE') or has_table_privilege(r.name,'public.portal_ai_notes','DELETE') or has_table_privilege(r.name,'public.portal_ai_notes','TRUNCATE') or has_function_privilege(r.name,'public.portal_ai_apply_resume(uuid,jsonb,jsonb)','EXECUTE')) then raise exception 'client privileges';end if;
end$$;
reset role;
select 'atomic save, stale conflict, field preservation and client denial passed; fixtures rolled back' as result;
rollback;
