alter table public.portal_listings add column if not exists address text not null default '' check(length(address)<=300);
grant insert(address) on public.portal_listings to authenticated;
notify pgrst,'reload schema';
