create table public.portal_favorites(user_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),listing_id uuid not null references public.portal_listings(id),created_at timestamptz not null default now(),primary key(user_id,listing_id));
alter table public.portal_favorites enable row level security;
revoke all on public.portal_favorites from public,anon,authenticated;
grant select,insert,delete on public.portal_favorites to authenticated;grant all on public.portal_favorites to service_role;
create policy favorites_self on public.portal_favorites to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null) with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null and exists(select 1 from portal_listings l where l.id=listing_id and l.cohort_id=portal_favorites.cohort_id));
create table public.portal_career_jobs(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),company text not null check(length(btrim(company)) between 2 and 160),role text not null check(length(btrim(role)) between 2 and 120),starts_on date not null check(starts_on<=current_date),ends_on date check(ends_on is null or ends_on>=starts_on and ends_on<=current_date),salary numeric not null check(salary>=0 and salary<=100000000),level integer not null check(level between 1 and 5),events jsonb not null default '[]' check(jsonb_typeof(events)='array' and jsonb_array_length(events)<=200));
alter table public.portal_career_jobs enable row level security;
revoke all on public.portal_career_jobs from public,anon,authenticated;
grant select,delete on public.portal_career_jobs to authenticated;grant insert(user_id,cohort_id,company,role,starts_on,ends_on,salary,level,events),update(company,role,starts_on,ends_on,salary,level,events) on public.portal_career_jobs to authenticated;grant all on public.portal_career_jobs to service_role;
create policy career_self on public.portal_career_jobs to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner')) with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner'));
create function pilot_private.validate_career_events() returns trigger language plpgsql set search_path='' as $$declare e jsonb;begin
 for e in select value from jsonb_array_elements(new.events) loop
 if e->>'date' is null or e->>'role' is null or length(btrim(e->>'role')) not between 2 and 120 or e->>'salary' is null or (e->>'salary')::numeric not between 0 and 100000000 or e->>'level' is null or (e->>'level')::int not between 1 and 5 or (e->>'date')::date<new.starts_on or (e->>'date')::date>coalesce(new.ends_on,current_date) then raise exception 'Movimentação de carreira inválida';end if;end loop;return new;end$$;
revoke all on function pilot_private.validate_career_events() from public,anon,authenticated;
create trigger validate_career_events before insert or update on public.portal_career_jobs for each row execute function pilot_private.validate_career_events();
create table public.portal_departments(id uuid primary key default gen_random_uuid(),organization_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),name text not null check(length(btrim(name)) between 2 and 100),unique(organization_id,name));
alter table public.portal_departments enable row level security;
revoke all on public.portal_departments from public,anon,authenticated;
grant select,insert on public.portal_departments to authenticated;grant all on public.portal_departments to service_role;
create policy department_owner on public.portal_departments to authenticated using(organization_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('recruiter','school_staff')) with check(organization_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('recruiter','school_staff'));
create table public.portal_team_invitations(id uuid primary key default gen_random_uuid(),department_id uuid not null references public.portal_departments(id),organization_id uuid not null references auth.users(id),candidate_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),candidate_name text not null,department_name text not null,organization_name text not null,status text not null default 'pending' check(status in ('pending','accepted','declined','cancelled','ended')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(department_id,candidate_id));
alter table public.portal_team_invitations enable row level security;
revoke all on public.portal_team_invitations from public,anon,authenticated;
grant select on public.portal_team_invitations to authenticated;grant all on public.portal_team_invitations to service_role;
create policy team_participant on public.portal_team_invitations for select to authenticated using(pilot_private.portal_role(cohort_id) is not null and (organization_id=(select auth.uid()) or candidate_id=(select auth.uid())));
create function pilot_private.team_command(p_department uuid,p_card uuid,p_invite uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare d public.portal_departments;c public.portal_candidate_cards;i public.portal_team_invitations;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 if p_action='invite' then
 select * into d from public.portal_departments where id=p_department;
 if not found or d.organization_id<>auth.uid() or coalesce(pilot_private.portal_role(d.cohort_id),'') not in ('recruiter','school_staff') then raise exception 'Acesso negado';end if;
 select * into c from public.portal_candidate_cards where id=p_card and cohort_id=d.cohort_id and visible and pilot_private.public_candidate_active(user_id,cohort_id);
 if not found then raise exception 'Cartão público indisponível';end if;
 insert into public.portal_team_invitations(department_id,organization_id,candidate_id,cohort_id,candidate_name,department_name,organization_name) values(d.id,d.organization_id,c.user_id,d.cohort_id,c.name,d.name,coalesce((select name from public.portal_organizations where user_id=d.organization_id),'Organização cadastrada'));
 insert into public.portal_notifications(cohort_id,user_id,title,body) values(d.cohort_id,c.user_id,'Convite de equipe','Convite para o departamento '||d.name||'. Abra Meus vínculos para aceitar ou recusar. Aceitar não concede acesso administrativo.');
 else
 select * into i from public.portal_team_invitations where id=p_invite for update;
 if not found or pilot_private.portal_role(i.cohort_id) is null then raise exception 'Acesso negado';end if;
 if p_action in ('accepted','declined') and i.candidate_id=auth.uid() and i.status='pending' then null;
 elsif p_action='cancelled' and i.organization_id=auth.uid() and i.status='pending' then null;
 elsif p_action='ended' and i.organization_id=auth.uid() and i.status='accepted' then null;
 else raise exception 'Ação indisponível';end if;
 update public.portal_team_invitations set status=p_action,updated_at=now() where id=i.id;
 insert into public.portal_notifications(cohort_id,user_id,title,body) values(i.cohort_id,case when auth.uid()=i.candidate_id then i.organization_id else i.candidate_id end,'Vínculo de equipe atualizado','Situação do convite: '||p_action||'. Nenhuma permissão administrativa foi concedida.');
 end if;end$$;
create function public.portal_team_command(p_department uuid,p_card uuid,p_invite uuid,p_action text) returns void language sql security invoker set search_path='' as $$select pilot_private.team_command(p_department,p_card,p_invite,p_action)$$;
revoke all on function pilot_private.team_command(uuid,uuid,uuid,text),public.portal_team_command(uuid,uuid,uuid,text) from public,anon;
grant execute on function pilot_private.team_command(uuid,uuid,uuid,text),public.portal_team_command(uuid,uuid,uuid,text) to authenticated;
create table public.portal_selection_steps(id uuid primary key default gen_random_uuid(),application_id uuid not null references public.portal_applications(id),name text not null check(length(btrim(name)) between 2 and 120),due_at timestamptz,completed boolean not null default false,created_at timestamptz not null default now());
alter table public.portal_selection_steps enable row level security;
revoke all on public.portal_selection_steps from public,anon,authenticated;
grant select on public.portal_selection_steps to authenticated;grant insert(application_id,name,due_at),update(completed) on public.portal_selection_steps to authenticated;grant all on public.portal_selection_steps to service_role;
create policy step_read on public.portal_selection_steps for select to authenticated using(exists(select 1 from public.portal_applications a join public.portal_listings l on l.id=a.listing_id where a.id=application_id and pilot_private.portal_role(a.cohort_id) is not null and (a.candidate_id=(select auth.uid()) or l.publisher_id=(select auth.uid()))));
create policy step_insert on public.portal_selection_steps for insert to authenticated with check(exists(select 1 from public.portal_applications a join public.portal_listings l on l.id=a.listing_id where a.id=application_id and l.kind='job' and a.status not in ('withdrawn','rejected') and l.publisher_id=(select auth.uid()) and pilot_private.portal_role(a.cohort_id)='recruiter'));
create policy step_update on public.portal_selection_steps for update to authenticated using(exists(select 1 from public.portal_applications a join public.portal_listings l on l.id=a.listing_id where a.id=application_id and l.publisher_id=(select auth.uid()) and pilot_private.portal_role(a.cohort_id)='recruiter')) with check(exists(select 1 from public.portal_applications a join public.portal_listings l on l.id=a.listing_id where a.id=application_id and l.publisher_id=(select auth.uid()) and pilot_private.portal_role(a.cohort_id)='recruiter'));
create function pilot_private.notify_selection_step() returns trigger language plpgsql security definer set search_path='' as $$declare a public.portal_applications;l public.portal_listings;begin
 select * into a from public.portal_applications where id=new.application_id;select * into l from public.portal_listings where id=a.listing_id;
 if l.publisher_id is distinct from auth.uid() or pilot_private.portal_role(a.cohort_id) is distinct from 'recruiter' then raise exception 'Acesso negado';end if;
 insert into public.portal_notifications(cohort_id,user_id,title,body,listing_id) values(a.cohort_id,a.candidate_id,'Etapa do processo atualizada',new.name||case when new.completed then ' — concluída' else ' — pendente' end,l.id);return new;end$$;
revoke all on function pilot_private.notify_selection_step() from public,anon,authenticated;
create trigger notify_selection_step after insert or update on public.portal_selection_steps for each row execute function pilot_private.notify_selection_step();
notify pgrst,'reload schema';
create function pilot_private.demo_communication_report(p_actor uuid,p_cohort uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
if not exists(select 1 from public.pilot_memberships where cohort_id=p_cohort and user_id=p_actor and role='pilot_owner' and status='active') then raise exception 'Acesso negado';end if;
return jsonb_build_object(
'candidates',(select count(*) from public.pilot_memberships where cohort_id=p_cohort and is_fictitious and role='learner'),
'companies',(select count(*) from public.pilot_memberships where cohort_id=p_cohort and is_fictitious and role='recruiter'),
'schools',(select count(*) from public.pilot_memberships where cohort_id=p_cohort and is_fictitious and role='school_staff'),
'jobApplications',(select count(*) from public.portal_applications a join public.portal_listings l on l.id=a.listing_id join public.pilot_memberships m on m.user_id=a.candidate_id and m.cohort_id=a.cohort_id where a.cohort_id=p_cohort and m.is_fictitious and l.is_fictitious and l.kind='job'),
'courseInterests',(select count(*) from public.portal_applications a join public.portal_listings l on l.id=a.listing_id join public.pilot_memberships m on m.user_id=a.candidate_id and m.cohort_id=a.cohort_id where a.cohort_id=p_cohort and m.is_fictitious and l.is_fictitious and l.kind='course'),
'confirmedInterviews',(select count(*) from public.portal_interviews i join public.portal_applications a on a.id=i.application_id join public.pilot_memberships m on m.user_id=a.candidate_id and m.cohort_id=a.cohort_id where a.cohort_id=p_cohort and m.is_fictitious and i.status='confirmed'),
'acceptedTeams',(select count(*) from public.portal_team_invitations i join public.pilot_memberships m on m.user_id=i.candidate_id and m.cohort_id=i.cohort_id where i.cohort_id=p_cohort and m.is_fictitious and i.status='accepted'),
'completedSteps',(select count(*) from public.portal_selection_steps s join public.portal_applications a on a.id=s.application_id join public.pilot_memberships m on m.user_id=a.candidate_id and m.cohort_id=a.cohort_id where a.cohort_id=p_cohort and m.is_fictitious and s.completed),
'privateCareers',(select count(*) from public.portal_career_jobs c join public.pilot_memberships m on m.user_id=c.user_id and m.cohort_id=c.cohort_id where c.cohort_id=p_cohort and m.is_fictitious),
'favorites',(select count(*) from public.portal_favorites f join public.pilot_memberships m on m.user_id=f.user_id and m.cohort_id=f.cohort_id where f.cohort_id=p_cohort and m.is_fictitious));end$$;
create function public.portal_demo_communication_report(p_actor uuid,p_cohort uuid) returns jsonb language sql security invoker set search_path='' as $$select pilot_private.demo_communication_report(p_actor,p_cohort)$$;
revoke all on function pilot_private.demo_communication_report(uuid,uuid),public.portal_demo_communication_report(uuid,uuid) from public,anon,authenticated;
grant execute on function pilot_private.demo_communication_report(uuid,uuid),public.portal_demo_communication_report(uuid,uuid) to service_role;
create index portal_favorites_cohort on public.portal_favorites(cohort_id);
create index portal_favorites_listing on public.portal_favorites(listing_id);
create index portal_career_user on public.portal_career_jobs(user_id,cohort_id);
create index portal_career_cohort on public.portal_career_jobs(cohort_id);
create index portal_departments_cohort on public.portal_departments(cohort_id);
create index portal_team_candidate on public.portal_team_invitations(candidate_id,cohort_id);
create index portal_team_organization on public.portal_team_invitations(organization_id,cohort_id);
create index portal_team_cohort on public.portal_team_invitations(cohort_id);
create index portal_selection_application on public.portal_selection_steps(application_id);
