-- Private measurements, not an event log: record changes when the principal opens the panel.
create table public.portal_organization_point_history (
 id bigint generated always as identity primary key,
 organization_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id) on delete cascade,
 department_id uuid references public.portal_departments(id) on delete cascade,
 members integer not null check(members>=0),
 average numeric check(average>=0),
 recorded_at timestamptz not null default clock_timestamp(),
 check((members=0 and average is null) or (members>0 and average is not null))
);
create index organization_point_history_scope on public.portal_organization_point_history(organization_id,cohort_id,department_id,id desc);
create index organization_point_history_cohort on public.portal_organization_point_history(cohort_id);
create index organization_point_history_department on public.portal_organization_point_history(department_id);
alter table public.portal_organization_point_history enable row level security;
revoke all on public.portal_organization_point_history from public,anon,authenticated;
grant select,insert,delete on public.portal_organization_point_history to service_role;
revoke all on sequence public.portal_organization_point_history_id_seq from public,anon,authenticated;
grant usage,select on sequence public.portal_organization_point_history_id_seq to service_role;

create or replace function public.portal_organization_points_history(p_org uuid,p_cohort uuid)
returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare current_points jsonb;scope jsonb;department uuid;previous public.portal_organization_point_history;result_history jsonb;
begin
 -- Server calls only. Lock the actual organization membership to serialize concurrent observations.
 perform 1 from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.user_id=p_org and m.cohort_id=p_cohort and m.status='active' and m.role in ('recruiter','school_staff')
 and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=statement_timestamp()) for update of m;
 if not found then raise exception 'Organização indisponível';end if;
 current_points:=public.portal_organization_points(p_org,p_cohort);
 for scope in select jsonb_build_object('id',null,'points',current_points->'organization')
 union all select jsonb_build_object('id',d->'id','points',d->'points') from jsonb_array_elements(current_points->'departments') d loop
  department:=(scope->>'id')::uuid;
  select * into previous from public.portal_organization_point_history h
   where h.organization_id=p_org and h.cohort_id=p_cohort and h.department_id is not distinct from department order by h.id desc limit 1;
  if not found or previous.members is distinct from (scope->'points'->>'members')::integer
   or previous.average is distinct from (scope->'points'->>'average')::numeric then
   insert into public.portal_organization_point_history(organization_id,cohort_id,department_id,members,average)
   values(p_org,p_cohort,department,(scope->'points'->>'members')::integer,(scope->'points'->>'average')::numeric);
  end if;
  -- Retain at most 100 changed measurements per scope, including the first baseline.
  delete from public.portal_organization_point_history h where h.organization_id=p_org and h.cohort_id=p_cohort
   and h.department_id is not distinct from department and h.id in (
    select old.id from public.portal_organization_point_history old where old.organization_id=p_org and old.cohort_id=p_cohort
    and old.department_id is not distinct from department order by old.id desc offset 100);
 end loop;
 select coalesce(jsonb_agg(to_jsonb(x)-'scope_row' order by x.id desc),'[]'::jsonb) into result_history from (
  select id,department_id,members,average,recorded_at,
   lag(average) over w as previous_average,lag(members) over w as previous_members,
   row_number() over(partition by department_id order by id desc) as scope_row
  from public.portal_organization_point_history where organization_id=p_org and cohort_id=p_cohort
  window w as(partition by department_id order by id)
 ) x where x.scope_row<=20;
 return current_points||jsonb_build_object('history',result_history,'history_limit',100,'history_mode','on_consultation');
end $$;
revoke all on function public.portal_organization_points_history(uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_organization_points_history(uuid,uuid) to service_role;
