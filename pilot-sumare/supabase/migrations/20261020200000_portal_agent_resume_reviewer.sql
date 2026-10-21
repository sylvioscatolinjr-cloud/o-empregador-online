-- Adds the candidate resume reviewer to the agent usage log. Same caps; still no prompt text stored.
alter table public.portal_agent_runs drop constraint portal_agent_runs_agent_check;
alter table public.portal_agent_runs add constraint portal_agent_runs_agent_check check(agent in ('job_writer','resume_reviewer'));
create or replace function public.portal_agent_reserve(p_actor uuid,p_cohort uuid,p_agent text,p_limit integer,p_input_chars integer) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_period date; v_slot integer; v_id uuid; v_roles text[];
begin
 v_roles:=case p_agent when 'job_writer' then array['recruiter','school_staff','pilot_owner'] when 'resume_reviewer' then array['learner','pilot_owner'] end;
 if v_roles is null then raise exception 'Agente inválido'; end if;
 if not exists(select 1 from public.pilot_memberships where user_id=p_actor and cohort_id=p_cohort and role=any(v_roles) and status='active') then raise exception 'Perfil sem acesso a este agente'; end if;
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
notify pgrst,'reload schema';
