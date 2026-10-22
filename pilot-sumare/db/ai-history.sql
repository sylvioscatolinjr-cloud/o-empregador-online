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
