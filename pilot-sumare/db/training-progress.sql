create table public.portal_training_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id) on delete cascade,
 profile_role text not null check(profile_role in ('learner','recruiter','school_staff')),
 training_id text not null check(training_id ~ '^(cand|emp|edu)-[a-z]+$'),
 completed_lessons integer[] not null default '{}' check(completed_lessons <@ array[0,1,2,3]),
 best_score integer not null default 0 check(best_score between 0 and 100),
 activity_ack boolean not null default false,
 completed_at timestamptz,
 updated_at timestamptz not null default now(),
 primary key(user_id,cohort_id,profile_role,training_id)
);
alter table public.portal_training_progress enable row level security;
revoke all on public.portal_training_progress from public,anon,authenticated;
grant select,insert,update,delete on public.portal_training_progress to service_role;
create function public.portal_training_record(p_user uuid,p_cohort uuid,p_profile text,p_training text,p_lesson integer default null,p_score integer default null,p_activity boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if p_lesson is not null and p_lesson not between 0 and 3 or p_score is not null and p_score not between 0 and 100 then raise exception 'invalid progress'; end if;
 insert into public.portal_training_progress as current_progress(user_id,cohort_id,profile_role,training_id,completed_lessons,best_score,activity_ack)
 values(p_user,p_cohort,p_profile,p_training,case when p_lesson is null then '{}'::integer[] else array[p_lesson] end,coalesce(p_score,0),coalesce(p_activity,false))
 on conflict(user_id,cohort_id,profile_role,training_id) do update set
 completed_lessons=coalesce((select array_agg(distinct n order by n) from unnest(current_progress.completed_lessons || excluded.completed_lessons) as n),'{}'::integer[]),
 best_score=greatest(current_progress.best_score,excluded.best_score),activity_ack=current_progress.activity_ack or excluded.activity_ack,updated_at=now();
 update public.portal_training_progress set completed_at=coalesce(completed_at,case when completed_lessons @> array[0,1,2,3] and best_score>=80 and activity_ack then now() else null end)
 where user_id=p_user and cohort_id=p_cohort and profile_role=p_profile and training_id=p_training
 returning jsonb_build_object('training_id',training_id,'completed_lessons',completed_lessons,'best_score',best_score,'activity_ack',activity_ack,'completed_at',completed_at,'updated_at',updated_at) into result;
 return result;
end $$;
revoke all on function public.portal_training_record(uuid,uuid,text,text,integer,integer,boolean) from public,anon,authenticated;
grant execute on function public.portal_training_record(uuid,uuid,text,text,integer,integer,boolean) to service_role;
