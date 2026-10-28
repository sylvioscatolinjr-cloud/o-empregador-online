-- Additive: existing descriptions remain unchanged; RLS and ownership policies remain active.
alter table public.portal_listings
 add column if not exists required_requirements text not null default '' check(length(required_requirements)<=6000),
 add column if not exists desired_requirements text not null default '' check(length(desired_requirements)<=6000),
 add column if not exists behavioral_profile text not null default '' check(length(behavioral_profile)<=6000),
 add column if not exists benefits text not null default '' check(length(benefits)<=6000),
 add column if not exists salary text not null default '' check(length(salary)<=200);
grant insert(required_requirements,desired_requirements,behavioral_profile,benefits,salary) on public.portal_listings to authenticated;
