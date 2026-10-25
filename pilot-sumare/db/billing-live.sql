-- Real money records; no client privileges and no Sandbox references.
create table public.billing_live_orders (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),
 profile_type text not null check(profile_type in ('Candidato','Empresa','Instituição de Ensino')),
 tier smallint not null check(tier between 1 and 4),cycle text not null check(cycle in ('MONTHLY','QUARTERLY','SEMIANNUALLY','YEARLY')),
 cents integer not null check(cents>0),credit_cents integer not null check(credit_cents>=0),months integer not null check(months in (1,3,6,12)),terms_version text not null,
 status text not null default 'creating' check(status in ('creating','pending','active','canceled','expired','review','failed')),
 checkout_id text unique,subscription_id text unique,cancel_requested_at timestamptz,canceled_at timestamptz,created_at timestamptz not null default now());
create index billing_live_orders_user_idx on public.billing_live_orders(user_id);
create index billing_live_orders_cohort_idx on public.billing_live_orders(cohort_id);
create unique index billing_live_one_open on public.billing_live_orders(user_id) where status in ('creating','pending','active','review');
create table public.billing_live_payments (
 id text primary key,order_id uuid not null references public.billing_live_orders(id),status text not null,cents integer not null,
 period_start timestamptz not null,period_end timestamptz not null,credit_cents integer not null,spent_cents integer not null default 0 check(spent_cents>=0),
 eligible boolean not null default false,checked_at timestamptz not null,check(period_end>period_start));
create index billing_live_payments_order_idx on public.billing_live_payments(order_id);
create table public.billing_live_events(id text primary key,event_type text not null,resource_id text not null,received_at timestamptz not null default now(),processed_at timestamptz);
create table public.billing_live_configuration(id boolean primary key default true check(id),connected boolean not null default false,account_approved boolean not null default false,webhook_ready boolean not null default false,updated_at timestamptz not null default now());
insert into public.billing_live_configuration(id) values(true);
create function public.billing_live_apply_payment(p_order uuid,p_payment jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare o public.billing_live_orders; b timestamptz; e timestamptz;
begin
 select * into strict o from public.billing_live_orders where id=p_order for update;
 if (p_payment->>'eligible')::boolean and (p_payment->>'cents')::integer<>o.cents then raise exception 'amount mismatch';end if;
 b:=(p_payment->>'period_start')::timestamptz;e:=(p_payment->>'period_end')::timestamptz;
 if e<=b or e>b+interval '370 days' then raise exception 'invalid period';end if;
 if exists(select 1 from public.billing_live_payments where id=p_payment->>'id' and order_id<>o.id) then raise exception 'payment ownership mismatch';end if;
 insert into public.billing_live_payments(id,order_id,status,cents,period_start,period_end,credit_cents,eligible,checked_at)
 values(p_payment->>'id',o.id,p_payment->>'status',(p_payment->>'cents')::integer,b,e,o.credit_cents,(p_payment->>'eligible')::boolean,(p_payment->>'checked_at')::timestamptz)
 on conflict(id) do update set cents=excluded.cents,status=excluded.status,eligible=excluded.eligible,checked_at=excluded.checked_at
 where public.billing_live_payments.checked_at<=excluded.checked_at;
 if found and (p_payment->>'eligible')::boolean and o.status in ('creating','pending','review') then update public.billing_live_orders set status='active' where id=o.id;end if;
end $$;
do $$declare t text;begin foreach t in array array['billing_live_orders','billing_live_payments','billing_live_events','billing_live_configuration'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
end loop;end $$;
revoke all on function public.billing_live_apply_payment(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.billing_live_apply_payment(uuid,jsonb) to service_role;
