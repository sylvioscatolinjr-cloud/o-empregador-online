-- AI agent usage log and daily caps. Stores no prompt text or generated content (LGPD: data minimization).
create table public.portal_agent_runs (
 id uuid primary key default gen_random_uuid(),
 cohort_id uuid not null references public.pilot_cohorts(id),
 actor_id uuid not null references auth.users(id) on delete cascade,
 agent text not null check(agent in ('job_writer')),
 period date not null,
 slot integer not null check(slot between 1 and 100),
 status text not null default 'running' check(status in ('running','completed','failed')),
 input_chars integer not null default 0 check(input_chars between 0 and 20000),
 model text check(model is null or length(model)<=80),
 usage jsonb not null default '{}' check(jsonb_typeof(usage)='object' and octet_length(usage::text)<=4000),
 error text check(error is null or length(error)<=500),
 created_at timestamptz not null default now(),
 finished_at timestamptz,
 unique(actor_id,agent,period,slot)
);
create index portal_agent_runs_cohort on public.portal_agent_runs(cohort_id,created_at desc);
alter table public.portal_agent_runs enable row level security;
revoke all on public.portal_agent_runs from public,anon,authenticated;
grant select on public.portal_agent_runs to authenticated;
grant all on public.portal_agent_runs to service_role;
create policy agent_runs_self_or_owner on public.portal_agent_runs for select to authenticated using(actor_id=(select auth.uid()) or exists(select 1 from public.pilot_memberships m where m.cohort_id=portal_agent_runs.cohort_id and m.user_id=(select auth.uid()) and m.role='pilot_owner' and m.status='active'));
-- Service-only invoker functions. The advisory lock makes the daily cap atomic across concurrent requests.
create function public.portal_agent_reserve(p_actor uuid,p_cohort uuid,p_agent text,p_limit integer,p_input_chars integer) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_period date; v_slot integer; v_id uuid;
begin
 if p_agent<>'job_writer' then raise exception 'Agente inválido'; end if;
 if not exists(select 1 from public.pilot_memberships where user_id=p_actor and cohort_id=p_cohort and role in ('recruiter','school_staff','pilot_owner') and status='active') then raise exception 'Perfil sem acesso a este agente'; end if;
 if p_limit is null or p_limit not between 1 and 100 then raise exception 'Limite inválido'; end if;
 v_period:=(now() at time zone 'America/Sao_Paulo')::date;
 perform pg_advisory_xact_lock(hashtextextended(p_actor::text||p_agent||v_period::text,0));
 select coalesce(max(slot),0)+1 into v_slot from public.portal_agent_runs where actor_id=p_actor and agent=p_agent and period=v_period;
 if v_slot>p_limit then raise exception 'Limite diário atingido: % usos por dia. Tentativas com falha também contam.',p_limit; end if;
 insert into public.portal_agent_runs(cohort_id,actor_id,agent,period,slot,input_chars) values(p_cohort,p_actor,p_agent,v_period,v_slot,least(greatest(coalesce(p_input_chars,0),0),20000)) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.portal_agent_reserve(uuid,uuid,text,integer,integer) from public,anon,authenticated;
grant execute on function public.portal_agent_reserve(uuid,uuid,text,integer,integer) to service_role;
create function public.portal_agent_finish(p_run uuid,p_status text,p_model text,p_usage jsonb,p_error text) returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_status not in ('completed','failed') then raise exception 'Situação inválida'; end if;
 update public.portal_agent_runs set status=p_status,model=left(p_model,80),usage=coalesce(p_usage,'{}'),error=left(p_error,500),finished_at=now() where id=p_run and status='running';
end $$;
revoke all on function public.portal_agent_finish(uuid,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.portal_agent_finish(uuid,text,text,jsonb,text) to service_role;
notify pgrst,'reload schema';
