begin;
-- Only published opportunity fields are readable without signing in.
grant select(id,kind,title,organization,description,city,state_code,modality,job_type,created_at,status) on public.portal_listings to anon;
create policy listing_public_read on public.portal_listings for select to anon,authenticated using(status='published');
-- Public talent cards are explicitly opt-in and separate from private resumes.
create table public.portal_candidate_cards(
 id uuid not null unique default gen_random_uuid(),user_id uuid primary key references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id),name text not null check(length(btrim(name)) between 2 and 100),
 headline text not null check(length(btrim(headline)) between 3 and 160),city text not null default '' check(length(city)<=100),
 state_code text not null default '' check(state_code='' or state_code ~ '^[A-Z]{2}$'),skills text not null default '' check(length(skills)<=500),
 visible boolean not null default false,consented_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
alter table public.portal_candidate_cards enable row level security;
revoke all on public.portal_candidate_cards from public,anon,authenticated;
grant select(id,name,headline,city,state_code,skills,updated_at) on public.portal_candidate_cards to anon;
grant select,insert,update(name,headline,city,state_code,skills,visible,consented_at,updated_at) on public.portal_candidate_cards to authenticated;
grant all on public.portal_candidate_cards to service_role;
create index portal_candidate_cards_cohort on public.portal_candidate_cards(cohort_id);
create index portal_candidate_cards_public on public.portal_candidate_cards(updated_at desc) where visible;
-- The private helper avoids exposing Auth or membership rows to anonymous visitors.
create function pilot_private.public_candidate_active(p_user uuid,p_cohort uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.pilot_memberships m join auth.users u on u.id=m.user_id where m.user_id=p_user and m.cohort_id=p_cohort and m.status='active' and m.role in ('learner','pilot_owner') and u.email_confirmed_at is not null)$$;
revoke all on function pilot_private.public_candidate_active(uuid,uuid) from public;
grant usage on schema pilot_private to anon;
grant execute on function pilot_private.public_candidate_active(uuid,uuid) to anon,authenticated;
create policy candidate_card_public on public.portal_candidate_cards for select to anon,authenticated using(visible and pilot_private.public_candidate_active(user_id,cohort_id));
create policy candidate_card_self on public.portal_candidate_cards for select to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner'));
create policy candidate_card_insert on public.portal_candidate_cards for insert to authenticated with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner'));
create policy candidate_card_update on public.portal_candidate_cards for update to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner')) with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner'));
notify pgrst,'reload schema';
commit;
