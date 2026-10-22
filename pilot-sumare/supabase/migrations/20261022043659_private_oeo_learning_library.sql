create table public.portal_oeo_learning (
 id uuid primary key default gen_random_uuid(),
 cohort_id uuid not null references public.pilot_cohorts(id) on delete cascade,
 created_by uuid not null references auth.users(id) on delete cascade,
 audiences text[] not null check(cardinality(audiences)>0 and audiences <@ array['learner','recruiter','school_staff']),
 kind text not null check(kind in ('course','training')),
 module text not null check(length(module) between 2 and 100),
 title text not null check(length(title) between 3 and 160),
 description text not null check(length(description) between 20 and 1000),
 tier integer not null check(tier between 0 and 3),
 published boolean not null default false,
 source_type text not null check(source_type in ('pdf','pptx','link')),
 external_url text,
 asset_path text,
 password_hash text,
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 check((source_type='link' and external_url is not null and asset_path is null) or (source_type in ('pdf','pptx') and asset_path is not null and external_url is null))
);
create index portal_oeo_learning_catalog on public.portal_oeo_learning(cohort_id,published,tier);
alter table public.portal_oeo_learning enable row level security;
revoke all on public.portal_oeo_learning from public,anon,authenticated;
grant select,insert,update,delete on public.portal_oeo_learning to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('oeo-learning-private','oeo-learning-private',false,20971520,array['application/pdf','application/vnd.openxmlformats-officedocument.presentationml.presentation']) on conflict(id) do nothing;
