create table public.portal_owner_test_usage(
 user_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id) on delete cascade,
 usage_day date not null,
 calls integer not null check(calls between 0 and 60),
 primary key(user_id,cohort_id,usage_day)
);
alter table public.portal_owner_test_usage enable row level security;
revoke all on public.portal_owner_test_usage from public,anon,authenticated;
grant select,insert,update,delete on public.portal_owner_test_usage to service_role;
create index owner_test_usage_cohort on public.portal_owner_test_usage(cohort_id);
create or replace function public.portal_owner_test_reserve(p_user uuid,p_cohort uuid)
returns integer language plpgsql security invoker set search_path='' as $$
declare used integer;today date:=(statement_timestamp() at time zone 'America/Sao_Paulo')::date;
begin
 if not exists(select 1 from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.user_id=p_user and m.cohort_id=p_cohort and m.status='active' and m.role='pilot_owner' and not m.is_fictitious
 and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=statement_timestamp())) then raise exception 'Acesso negado';end if;
 delete from public.portal_owner_test_usage where user_id=p_user and cohort_id=p_cohort and usage_day<today-30;
 insert into public.portal_owner_test_usage(user_id,cohort_id,usage_day,calls) values(p_user,p_cohort,today,1)
 on conflict(user_id,cohort_id,usage_day) do update set calls=public.portal_owner_test_usage.calls+1 where public.portal_owner_test_usage.calls<60 returning calls into used;
 if used is null then raise exception 'Limite diário de testes atingido';end if;
 return 60-used;
end $$;
revoke all on function public.portal_owner_test_reserve(uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_owner_test_reserve(uuid,uuid) to service_role;
