create table public.billing_sandbox_methods(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),
 profile_type text not null, tier smallint not null check(tier between 1 and 3),cycle text not null check(cycle in ('MONTHLY','QUARTERLY','SEMIANNUALLY','YEARLY')),cents integer not null check(cents>0),
 method text not null check(method in ('PIX','BOLETO','PIX_AUTOMATIC')),status text not null default 'creating' check(status in ('creating','pending','paid','canceled','review','failed')),
 customer_id text,subscription_id text unique,authorization_id text unique,first_payment_id text,
 invoice_url text,pix_payload text,pix_image text,created_at timestamptz not null default now());
create index billing_sandbox_methods_user on public.billing_sandbox_methods(user_id);
create unique index billing_sandbox_methods_open on public.billing_sandbox_methods(user_id,method) where status in ('creating','pending','review');
alter table public.billing_sandbox_methods enable row level security;
revoke all on public.billing_sandbox_methods from public,anon,authenticated;grant all on public.billing_sandbox_methods to service_role;
create table public.billing_sandbox_method_events(
 id text primary key,event_type text not null,resource_id text not null,parent_id text,resource_status text not null,event_at timestamptz not null,received_at timestamptz not null default now());
create index billing_method_event_resource on public.billing_sandbox_method_events(resource_id,event_at);
create index billing_method_event_parent on public.billing_sandbox_method_events(parent_id);
alter table public.billing_sandbox_method_events enable row level security;
revoke all on public.billing_sandbox_method_events from public,anon,authenticated;grant all on public.billing_sandbox_method_events to service_role;
alter table public.billing_sandbox_orders add column cycle text not null default 'MONTHLY';
