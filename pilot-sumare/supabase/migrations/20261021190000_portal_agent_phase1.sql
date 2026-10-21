-- Phase 1 of the agents: one usage log for every agent task, link to the paid credit charge, and a history the user owns.
alter table public.portal_agent_runs drop constraint portal_agent_runs_agent_check;
alter table public.portal_agent_runs add constraint portal_agent_runs_agent_check check(agent in ('job_writer','resume_reviewer','guided_chat'));
alter table public.portal_agent_runs add column charge text not null default 'free' check(charge in ('free','credit'));
-- Results kept so the agents can follow goals and past recommendations. Readable and deletable only by their owner; purged after 180 days.
create table public.portal_agent_history (
 id uuid primary key default gen_random_uuid(),
 run_id uuid not null unique references public.portal_agent_runs(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id),
 agent text not null,
 task text not null check(length(task) between 1 and 60),
 result jsonb not null check(jsonb_typeof(result)='object' and octet_length(result::text)<=40000),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '180 days'
);
create index portal_agent_history_user on public.portal_agent_history(user_id,created_at desc);
alter table public.portal_agent_history enable row level security;
revoke all on public.portal_agent_history from public,anon,authenticated;
grant select,delete on public.portal_agent_history to authenticated;
grant all on public.portal_agent_history to service_role;
create policy agent_history_own_select on public.portal_agent_history for select to authenticated using(user_id=(select auth.uid()) and expires_at>now());
create policy agent_history_own_delete on public.portal_agent_history for delete to authenticated using(user_id=(select auth.uid()));
drop function public.portal_agent_reserve(uuid,uuid,text,integer,integer);
create function public.portal_agent_reserve(p_actor uuid,p_cohort uuid,p_agent text,p_limit integer,p_input_chars integer) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_period date; v_slot integer; v_id uuid; v_roles text[]; v_role text;
begin
 v_roles:=case p_agent when 'job_writer' then array['recruiter','school_staff','pilot_owner'] when 'resume_reviewer' then array['learner','pilot_owner'] when 'guided_chat' then array['learner','recruiter','school_staff'] end;
 if v_roles is null then raise exception 'Agente inválido'; end if;
 select role into v_role from public.pilot_memberships where user_id=p_actor and cohort_id=p_cohort and role=any(v_roles) and status='active' and not is_fictitious;
 if v_role is null then raise exception 'Perfil sem acesso a este agente'; end if;
 if p_limit is null or p_limit not between 1 and 100 then raise exception 'Limite inválido'; end if;
 delete from public.portal_agent_history where user_id=p_actor and expires_at<=now();
 v_period:=(now() at time zone 'America/Sao_Paulo')::date;
 perform pg_advisory_xact_lock(hashtextextended(p_actor::text||p_agent||v_period::text,0));
 select coalesce(max(slot),0)+1 into v_slot from public.portal_agent_runs where actor_id=p_actor and agent=p_agent and period=v_period;
 if v_slot>p_limit then raise exception 'Limite diário atingido: % usos por dia. Tentativas com falha também contam.',p_limit; end if;
 insert into public.portal_agent_runs(cohort_id,actor_id,agent,period,slot,input_chars) values(p_cohort,p_actor,p_agent,v_period,v_slot,least(greatest(coalesce(p_input_chars,0),0),20000)) returning id into v_id;
 return jsonb_build_object('id',v_id,'slot',v_slot,'role',v_role);
end $$;
revoke all on function public.portal_agent_reserve(uuid,uuid,text,integer,integer) from public,anon,authenticated;
grant execute on function public.portal_agent_reserve(uuid,uuid,text,integer,integer) to service_role;
drop function public.portal_agent_finish(uuid,text,text,jsonb,text);
create function public.portal_agent_finish(p_run uuid,p_status text,p_model text,p_usage jsonb,p_error text,p_charge text,p_task text,p_result jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare v_run public.portal_agent_runs;
begin
 if p_status not in ('completed','failed') then raise exception 'Situação inválida'; end if;
 update public.portal_agent_runs set status=p_status,model=left(p_model,80),usage=coalesce(p_usage,'{}'),error=left(p_error,500),charge=case when p_status='completed' then coalesce(p_charge,'free') else 'free' end,finished_at=now() where id=p_run and status='running' returning * into v_run;
 if found and p_status='completed' and p_result is not null then
  insert into public.portal_agent_history(run_id,user_id,cohort_id,agent,task,result) values(v_run.id,v_run.actor_id,v_run.cohort_id,v_run.agent,p_task,p_result);
 end if;
end $$;
revoke all on function public.portal_agent_finish(uuid,text,text,jsonb,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.portal_agent_finish(uuid,text,text,jsonb,text,text,text,jsonb) to service_role;
notify pgrst,'reload schema';
