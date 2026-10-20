-- Exact identity matching is server-only. No raw document or lookup key in the invitation.
create table pilot_private.team_invite_limits (
 actor_id uuid primary key references auth.users(id) on delete cascade,
 hour_started timestamptz not null default now(), hour_count integer not null default 0,
 day_started timestamptz not null default now(), day_count integer not null default 0
);
alter table pilot_private.team_invite_limits enable row level security;
revoke all on pilot_private.team_invite_limits from public,anon,authenticated;

create function pilot_private.invite_team_by_identity(p_actor uuid,p_cohort uuid,p_department uuid,p_identity_key text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.portal_departments;lim pilot_private.team_invite_limits;target uuid;targets uuid[];inv uuid;begin
 if not exists(select 1 from public.pilot_memberships m join auth.users u on u.id=m.user_id where m.user_id=p_actor and m.cohort_id=p_cohort and m.status='active' and m.role in ('recruiter','school_staff') and not m.is_fictitious and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now())) then raise exception 'Acesso negado';end if;
 select * into d from public.portal_departments where id=p_department and organization_id=p_actor and cohort_id=p_cohort;
 if not found or p_identity_key is null or p_identity_key!~'^CPF:[0-9a-f]{64}$' then raise exception 'Acesso negado';end if;
 insert into pilot_private.team_invite_limits(actor_id) values(p_actor) on conflict do nothing;
 select * into lim from pilot_private.team_invite_limits where actor_id=p_actor for update;
 if lim.hour_started<=now()-interval '1 hour' then lim.hour_count=0;lim.hour_started=now();end if;
 if lim.day_started<=now()-interval '1 day' then lim.day_count=0;lim.day_started=now();end if;
 if lim.hour_count>=10 or lim.day_count>=40 then return jsonb_build_object('limited',true);end if;
 update pilot_private.team_invite_limits set hour_started=lim.hour_started,hour_count=lim.hour_count+1,day_started=lim.day_started,day_count=lim.day_count+1 where actor_id=p_actor;
 select array_agg(i.user_id) into targets from pilot_private.user_identities i join public.pilot_memberships m on m.user_id=i.user_id and m.cohort_id=p_cohort join auth.users u on u.id=i.user_id where i.identity_key=p_identity_key and i.profile_type='Candidato' and m.role='learner' and m.status='active' and not m.is_fictitious and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now());
 -- Ambiguous exceptional owner documents never select an arbitrary account.
 if coalesce(cardinality(targets),0)<>1 then return jsonb_build_object('processed',true);end if;
 target=targets[1];
 insert into public.portal_team_invitations(department_id,organization_id,candidate_id,cohort_id,candidate_name,department_name,organization_name)
 values(d.id,p_actor,target,p_cohort,'Aguardando aceite do candidato',d.name,coalesce((select name from public.portal_organizations where user_id=p_actor),'Organização cadastrada'))
 on conflict(department_id,candidate_id) do nothing returning id into inv;
 if inv is not null then
 insert into public.portal_notifications(cohort_id,user_id,title,body) values(p_cohort,target,'Convite de equipe','Você recebeu um convite para o departamento '||d.name||'. Abra Meus vínculos e confira a organização. Ao aceitar, você compartilha seu nome e este vínculo; CPF, currículo privado e salários não são compartilhados. Você pode recusar. Nenhum acesso administrativo é concedido.');
 end if;
 return jsonb_build_object('processed',true);
end$$;
create function public.portal_invite_team_by_identity(p_actor uuid,p_cohort uuid,p_department uuid,p_identity_key text) returns jsonb language sql security invoker set search_path='' as $$select pilot_private.invite_team_by_identity(p_actor,p_cohort,p_department,p_identity_key)$$;
revoke all on function pilot_private.invite_team_by_identity(uuid,uuid,uuid,text),public.portal_invite_team_by_identity(uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function pilot_private.invite_team_by_identity(uuid,uuid,uuid,text),public.portal_invite_team_by_identity(uuid,uuid,uuid,text) to service_role;
create or replace function pilot_private.team_command(p_department uuid,p_card uuid,p_invite uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare d public.portal_departments;c public.portal_candidate_cards;i public.portal_team_invitations;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 if p_action='invite' then
 raise exception 'Use o convite protegido por CPF';
 else
 select * into i from public.portal_team_invitations where id=p_invite for update;
 if not found or pilot_private.portal_role(i.cohort_id) is null then raise exception 'Acesso negado';end if;
 if p_action in ('accepted','declined') and i.candidate_id=auth.uid() and i.status='pending' then null;
 elsif p_action='cancelled' and i.organization_id=auth.uid() and i.status='pending' then null;
 elsif p_action='ended' and (i.organization_id=auth.uid() or i.candidate_id=auth.uid()) and i.status='accepted' then null;
 else raise exception 'Ação indisponível';end if;
 update public.portal_team_invitations set status=p_action,candidate_name=case when p_action='accepted' then coalesce(nullif((select display_name from public.pilot_profiles where user_id=i.candidate_id),''),'Candidato conectado') else candidate_name end,updated_at=now() where id=i.id;
 insert into public.portal_notifications(cohort_id,user_id,title,body) values(i.cohort_id,case when auth.uid()=i.candidate_id then i.organization_id else i.candidate_id end,'Vínculo de equipe atualizado','Situação do convite: '||p_action||'. Nenhuma permissão administrativa foi concedida.');
 end if;end$$;

-- Pending invitations disclose no candidate name before acceptance.
update public.portal_team_invitations set candidate_name='Aguardando aceite do candidato' where status='pending';
