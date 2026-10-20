-- Prepared for a NEW, dedicated Supabase project. NOT APPLIED to any hosted database.
-- No users, invitations, roles or institutional approvals are created by this migration.
-- Every admissions flag starts false; all real email/provider and school checks remain required.
begin;
create schema if not exists pilot_private;
revoke all on schema pilot_private from public, anon;
grant usage on schema pilot_private to authenticated;

create table public.pilot_cohorts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  school_name text not null,
  city text not null,
  max_learners integer not null default 300 check(max_learners between 1 and 300),
  admissions_open boolean not null default false,
  school_approved boolean not null default false,
  privacy_approved boolean not null default false,
  minors_approved boolean not null default false,
  email_delivery_verified boolean not null default false,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check(ends_at is null or ends_at>starts_at)
);
create table public.pilot_memberships (
  cohort_id uuid not null references public.pilot_cohorts(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(role in ('learner','school_staff','recruiter','pilot_owner')),
  status text not null default 'pending' check(status in ('pending','active','suspended','withdrawn')),
  age_band text check(age_band in ('16_17','18_plus')),
  joined_at timestamptz not null default now(),
  primary key(cohort_id,user_id)
);
create index pilot_memberships_user on public.pilot_memberships(user_id,cohort_id,status);
create index pilot_memberships_capacity on public.pilot_memberships(cohort_id,role,status);
create table public.pilot_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check(char_length(display_name) between 1 and 100),
  city text not null default '' check(char_length(city)<=100),
  state_code text not null default '' check(state_code='' or state_code ~ '^[A-Z]{2}$'),
  skills text not null default '' check(char_length(skills)<=3000),
  about text not null default '' check(char_length(about)<=12000),
  experience text not null default '' check(char_length(experience)<=12000),
  education text not null default '' check(char_length(education)<=12000),
  courses text not null default '' check(char_length(courses)<=12000),
  certifications text not null default '' check(char_length(certifications)<=12000),
  contact_visibility text not null default 'private' check(contact_visibility='private'),
  created_at timestamptz not null default now()
);
create table pilot_private.user_identities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  identity_key text not null unique check(identity_key ~ '^(CPF|CNPJ):[0-9a-f]{64}$'),
  profile_type text not null check(profile_type in ('Candidato','Empresa','Instituição de Ensino')),
  created_at timestamptz not null default now(),
  check((profile_type='Candidato' and identity_key like 'CPF:%') or (profile_type<>'Candidato' and identity_key like 'CNPJ:%'))
);
create table public.pilot_goals (
  cohort_id uuid not null references public.pilot_cohorts(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(char_length(role) between 1 and 120),
  company text not null default '' check(char_length(company)<=150),
  salary numeric(12,2) not null check(salary between 0 and 100000000),
  target_date date,
  skills text not null check(char_length(skills) between 1 and 1500),
  weekly_hours integer not null check(weekly_hours between 1 and 60),
  budget numeric(12,2) not null check(budget between 0 and 100000000),
  primary key(cohort_id,user_id)
);
create index pilot_goals_user on public.pilot_goals(user_id,cohort_id);
create table pilot_private.invitations (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.pilot_cohorts(id),
  email text not null check(email=lower(btrim(email))),
  token_hash bytea not null unique check(octet_length(token_hash)=32),
  age_band text not null check(age_band in ('16_17','18_plus')),
  participation_approved boolean not null default false,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz,
  unique(cohort_id,email)
);
create table pilot_private.access_events (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.pilot_cohorts(id),
  actor_id uuid references auth.users(id) on delete set null,
  kind text not null check(kind in ('learner_joined')),
  created_at timestamptz not null default now()
);

create function pilot_private.is_member(p_cohort_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.pilot_memberships m where m.cohort_id=p_cohort_id
 and m.user_id=(select auth.uid()) and m.status='active');
$$;
create function pilot_private.is_owner(p_cohort_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.pilot_memberships m where m.cohort_id=p_cohort_id
 and m.user_id=(select auth.uid()) and m.status='active' and m.role='pilot_owner');
$$;
revoke all on function pilot_private.is_member(uuid),pilot_private.is_owner(uuid) from public,anon;
grant execute on function pilot_private.is_member(uuid),pilot_private.is_owner(uuid) to authenticated;

alter table public.pilot_cohorts enable row level security;
alter table public.pilot_memberships enable row level security;
alter table public.pilot_profiles enable row level security;
alter table pilot_private.invitations enable row level security;
alter table pilot_private.access_events enable row level security;
alter table pilot_private.user_identities enable row level security;
alter table public.pilot_goals enable row level security;
revoke all on pilot_private.user_identities from public,anon,authenticated;
revoke all on public.pilot_goals from public,anon,authenticated;
revoke all on public.pilot_cohorts,public.pilot_memberships,public.pilot_profiles from public,anon,authenticated;
revoke all on pilot_private.invitations,pilot_private.access_events from public,anon,authenticated;
grant select on public.pilot_cohorts,public.pilot_memberships,public.pilot_profiles to authenticated;
grant update(display_name,city,state_code,skills,about,experience,education,courses,certifications) on public.pilot_profiles to authenticated;
grant select,insert,update on public.pilot_goals to authenticated;
create policy cohort_member_read on public.pilot_cohorts for select to authenticated
 using(pilot_private.is_member(id));
create policy membership_self_or_owner_read on public.pilot_memberships for select to authenticated
 using(user_id=(select auth.uid()) or pilot_private.is_owner(cohort_id));
create policy profile_self_read on public.pilot_profiles for select to authenticated
 using(user_id=(select auth.uid()));
create policy profile_self_update on public.pilot_profiles for update to authenticated
 using(user_id=(select auth.uid()) and exists(select 1 from public.pilot_memberships m where m.user_id=(select auth.uid()) and m.status='active'))
 with check(user_id=(select auth.uid()) and exists(select 1 from public.pilot_memberships m where m.user_id=(select auth.uid()) and m.status='active'));
create policy goal_self_read on public.pilot_goals for select to authenticated
 using(user_id=(select auth.uid()) and pilot_private.is_member(cohort_id));
create policy goal_self_insert on public.pilot_goals for insert to authenticated
 with check(user_id=(select auth.uid()) and pilot_private.is_member(cohort_id));
create policy goal_self_update on public.pilot_goals for update to authenticated
 using(user_id=(select auth.uid()) and pilot_private.is_member(cohort_id))
 with check(user_id=(select auth.uid()) and pilot_private.is_member(cohort_id));
-- No client INSERT/UPDATE policy exists for memberships, school flags, invitations or roles.

create function pilot_private.register_identity(p_user_id uuid,p_identity_key text,p_profile_type text)
returns void language plpgsql security definer set search_path='' as $$
declare v_existing pilot_private.user_identities%rowtype;
begin
 if not exists(select 1 from auth.users where id=p_user_id and email_confirmed_at is not null)
 then raise exception 'Conta não confirmada'; end if;
 select * into v_existing from pilot_private.user_identities where user_id=p_user_id for update;
 if found then
   if v_existing.identity_key=p_identity_key and v_existing.profile_type=p_profile_type then return; end if;
   raise exception 'Solicite revisão da identidade cadastrada';
 end if;
 insert into pilot_private.user_identities(user_id,identity_key,profile_type) values(p_user_id,p_identity_key,p_profile_type);
end;
$$;
grant usage on schema pilot_private to service_role;
revoke all on function pilot_private.register_identity(uuid,text,text) from public,anon,authenticated;
grant execute on function pilot_private.register_identity(uuid,text,text) to service_role;
create function public.register_pilot_identity(p_user_id uuid,p_identity_key text,p_profile_type text)
returns void language sql security invoker set search_path='' as $$
 select pilot_private.register_identity(p_user_id,p_identity_key,p_profile_type);
$$;
revoke all on function public.register_pilot_identity(uuid,text,text) from public,anon,authenticated;
grant execute on function public.register_pilot_identity(uuid,text,text) to service_role;
create function pilot_private.registration_status() returns boolean
language sql stable security definer set search_path='' as $$
 select (select auth.uid()) is not null and exists(select 1 from pilot_private.user_identities where user_id=(select auth.uid()));
$$;
revoke all on function pilot_private.registration_status() from public,anon;
grant execute on function pilot_private.registration_status() to authenticated;
create function public.pilot_registration_status() returns boolean
language sql security invoker set search_path='' as $$select pilot_private.registration_status();$$;
revoke all on function public.pilot_registration_status() from public,anon;
grant execute on function public.pilot_registration_status() to authenticated;

create function pilot_private.redeem_invitation(p_cohort_id uuid,p_invite_token text)
returns void language plpgsql security definer set search_path='' as $$
declare
 v_user uuid := auth.uid();
 v_email text;
 v_confirmed timestamptz;
 v_cohort public.pilot_cohorts%rowtype;
 v_invite pilot_private.invitations%rowtype;
 v_count integer;
 v_membership public.pilot_memberships%rowtype;
begin
 if v_user is null or p_invite_token is null or char_length(p_invite_token) not between 32 and 256 or p_invite_token !~ '^[a-zA-Z0-9_-]+$'
 then raise exception 'Convite indisponível' using errcode='P0001'; end if;
 select lower(email),email_confirmed_at into v_email,v_confirmed from auth.users where id=v_user;
 if v_confirmed is null then raise exception 'Confirme seu e-mail' using errcode='P0001'; end if;
 if not exists(select 1 from pilot_private.user_identities where user_id=v_user and profile_type='Candidato')
 then raise exception 'Conclua seu cadastro documental' using errcode='P0001'; end if;
 -- One cohort lock serializes capacity checking and admission in this transaction.
 select * into v_cohort from public.pilot_cohorts where id=p_cohort_id for update;
 if not found or not(v_cohort.admissions_open and v_cohort.school_approved
   and v_cohort.privacy_approved and v_cohort.email_delivery_verified)
 then raise exception 'Ingresso indisponível' using errcode='P0001'; end if;
 select * into v_invite from pilot_private.invitations
 where cohort_id=p_cohort_id and email=v_email
 and token_hash=pg_catalog.sha256(pg_catalog.convert_to(p_invite_token,'UTF8')) for update;
 if not found or v_invite.revoked_at is not null or v_invite.expires_at<=now()
 or not v_invite.participation_approved or (v_invite.age_band='16_17' and not v_cohort.minors_approved)
 then raise exception 'Convite indisponível' using errcode='P0001'; end if;
 select * into v_membership from public.pilot_memberships where cohort_id=p_cohort_id and user_id=v_user;
 if found then
   if v_membership.status='active' and v_invite.redeemed_by=v_user then return; end if;
   raise exception 'Solicite revisão do acesso' using errcode='P0001';
 end if;
 if v_invite.redeemed_by is not null or v_invite.redeemed_at is not null
 then raise exception 'Convite indisponível' using errcode='P0001'; end if;
 select count(*) into v_count from public.pilot_memberships
 where cohort_id=p_cohort_id and role='learner' and status='active';
 if v_count>=v_cohort.max_learners then raise exception 'Turma sem vagas' using errcode='P0001'; end if;
 insert into public.pilot_memberships(cohort_id,user_id,role,status,age_band)
 values(p_cohort_id,v_user,'learner','active',v_invite.age_band);
 insert into public.pilot_profiles(user_id,display_name)
 select v_user,left(coalesce(nullif(btrim(raw_user_meta_data->>'display_name'),''),'Participante'),100)
 from auth.users where id=v_user on conflict(user_id) do nothing;
 update pilot_private.invitations set redeemed_by=v_user,redeemed_at=now() where id=v_invite.id;
 insert into pilot_private.access_events(cohort_id,actor_id,kind) values(p_cohort_id,v_user,'learner_joined');
end;
$$;
revoke all on function pilot_private.redeem_invitation(uuid,text) from public,anon;
grant execute on function pilot_private.redeem_invitation(uuid,text) to authenticated;
-- Only an invoker wrapper is exposed through the API; privileged logic lives in a non-exposed schema.
create function public.redeem_pilot_invite(p_cohort_id uuid,p_invite_token text)
returns void language sql security invoker set search_path='' as $$
 select pilot_private.redeem_invitation(p_cohort_id,p_invite_token);
$$;
revoke all on function public.redeem_pilot_invite(uuid,text) from public,anon;
grant execute on function public.redeem_pilot_invite(uuid,text) to authenticated;
commit;
