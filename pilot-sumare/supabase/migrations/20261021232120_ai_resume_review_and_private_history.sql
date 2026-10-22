set local lock_timeout='3s';
set local statement_timeout='30s';
-- Stage 2: production prerequisites only; no user data, paid grants or checkout activation.
-- Apply selected signed suggestions atomically; callers never supply another identity.
create or replace function public.portal_ai_apply_resume(p_user uuid,p_expected jsonb,p_patch jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare p public.pilot_profiles; snapshot jsonb;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'unauthorized';end if;
 if p_user is null or jsonb_typeof(p_expected) is distinct from 'object' or jsonb_typeof(p_patch) is distinct from 'object' or p_patch='{}'::jsonb then raise exception 'invalid patch';end if;
 if exists(select 1 from jsonb_object_keys(p_patch) k where k not in ('about','skills','experience','education','courses','certifications','resume_details')) then raise exception 'invalid patch key';end if;
 select * into p from public.pilot_profiles where user_id=p_user for update;
 if not found then return false;end if;
 snapshot:=jsonb_build_object('about',p.about,'skills',p.skills,'experience',p.experience,'education',p.education,'courses',p.courses,'certifications',p.certifications,'resume_details',p.resume_details,'resume_path',p.resume_path,'display_name',p.display_name);
 if snapshot<>p_expected then return false;end if;
 update public.pilot_profiles set about=case when p_patch?'about' then p_patch->>'about' else p.about end,skills=case when p_patch?'skills' then p_patch->>'skills' else p.skills end,experience=case when p_patch?'experience' then p_patch->>'experience' else p.experience end,education=case when p_patch?'education' then p_patch->>'education' else p.education end,courses=case when p_patch?'courses' then p_patch->>'courses' else p.courses end,certifications=case when p_patch?'certifications' then p_patch->>'certifications' else p.certifications end,resume_details=case when p_patch?'resume_details' then p_patch->'resume_details' else p.resume_details end where user_id=p_user;
 return true;
end $$;
revoke all on function public.portal_ai_apply_resume(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.portal_ai_apply_resume(uuid,jsonb,jsonb) to service_role;

-- Private user-selected working notes. Server authenticates every operation.
-- No direct Data API grants; service_role is used only inside authorized handlers.
create table if not exists public.portal_ai_notes (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id) on delete cascade,
 profile_role text not null check(profile_role in ('learner','recruiter','school_staff')),
 task_id text not null check(length(task_id) between 1 and 80),
 question text not null check(length(question) between 1 and 4000),
 answer text not null check(length(answer) between 1 and 20000),
 created_at timestamptz not null default now()
);
alter table public.portal_ai_notes enable row level security;
revoke all on public.portal_ai_notes from public,anon,authenticated;
grant select,insert,delete on public.portal_ai_notes to service_role;
create index if not exists portal_ai_notes_user_cohort_created on public.portal_ai_notes(user_id,cohort_id,profile_role,created_at desc);
comment on table public.portal_ai_notes is 'Private opt-in working notes; retained until user deletion or account deletion. No automatic AI execution.';
