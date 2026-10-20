create table public.billing_sandbox_orders(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), profile_type text not null check(profile_type in ('Candidato','Empresa','Instituição de Ensino')), tier smallint not null check(tier between 1 and 3), cents integer not null check(cents>0), checkout_id text unique, status text not null default 'creating' check(status in ('creating','pending','paid','canceled','expired','review')), created_at timestamptz not null default now());
create index billing_sandbox_orders_user on public.billing_sandbox_orders(user_id);
create unique index billing_sandbox_one_open on public.billing_sandbox_orders(user_id) where status in ('creating','pending','review');
alter table public.billing_sandbox_orders enable row level security;
revoke all on public.billing_sandbox_orders from public,anon,authenticated;
grant all on public.billing_sandbox_orders to service_role;
create table public.billing_sandbox_events(id text primary key, event_type text not null, checkout_id text, received_at timestamptz not null default now());
alter table public.billing_sandbox_events enable row level security;
revoke all on public.billing_sandbox_events from public,anon,authenticated;
grant all on public.billing_sandbox_events to service_role;
create function public.billing_sandbox_event(p_id text,p_event text,p_checkout text) returns void language plpgsql security invoker set search_path='' as $$
begin
 insert into public.billing_sandbox_events(id,event_type,checkout_id) values(p_id,p_event,p_checkout) on conflict do nothing;
 if not found then return; end if;
 update public.billing_sandbox_orders set status=case p_event when 'CHECKOUT_PAID' then 'paid' when 'CHECKOUT_CANCELED' then 'canceled' when 'CHECKOUT_EXPIRED' then 'expired' else status end
 where checkout_id=p_checkout and (status<>'paid' or p_event='CHECKOUT_PAID');
end $$;
revoke all on function public.billing_sandbox_event(text,text,text) from public,anon,authenticated;
grant execute on function public.billing_sandbox_event(text,text,text) to service_role;
