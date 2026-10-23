-- Purchased credits are separate from subscription benefits. Service-only APIs.
create table public.portal_ai_topup_orders(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),
 cents integer not null check(cents in(1000,2500,5000)),terms_version text not null,
 status text not null default 'creating' check(status in('creating','pending','confirmed','canceled','expired','review','failed')),
 checkout_id text unique,created_at timestamptz not null default now()
);
create index portal_ai_topup_user_cohort on public.portal_ai_topup_orders(user_id,cohort_id,created_at desc);
create unique index portal_ai_topup_one_open on public.portal_ai_topup_orders(user_id,cohort_id) where status in('creating','pending','review');
create table public.portal_ai_topup_payments(
 id text primary key,order_id uuid not null unique references public.portal_ai_topup_orders(id),
 cents integer not null check(cents>0),status text not null,eligible boolean not null default false,
 spent_cents integer not null default 0 check(spent_cents>=0),checked_at timestamptz not null
);
create table public.portal_ai_wallet_usage(
 request_id uuid primary key,user_id uuid not null references auth.users(id),
 cohort_id uuid not null references public.pilot_cohorts(id),created_at timestamptz not null default now(),refunded_at timestamptz
);
create index portal_ai_wallet_user_cohort on public.portal_ai_wallet_usage(user_id,cohort_id,created_at desc);
create table public.portal_ai_wallet_lines(
 id uuid primary key default gen_random_uuid(),request_id uuid not null references public.portal_ai_wallet_usage(request_id),
 subscription_payment_id text references public.billing_live_payments(id),topup_payment_id text references public.portal_ai_topup_payments(id),
 cents integer not null check(cents between 1 and 100),check(num_nonnulls(subscription_payment_id,topup_payment_id)=1)
);
create index portal_ai_wallet_lines_request on public.portal_ai_wallet_lines(request_id);
create index portal_ai_wallet_lines_subscription on public.portal_ai_wallet_lines(subscription_payment_id);
create index portal_ai_wallet_lines_topup on public.portal_ai_wallet_lines(topup_payment_id);

do $$declare t text;begin foreach t in array array['portal_ai_topup_orders','portal_ai_topup_payments','portal_ai_wallet_usage','portal_ai_wallet_lines'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select,insert,update,delete on public.%I to service_role',t);
end loop;end $$;

create function public.portal_ai_wallet_balance(p_user uuid,p_cohort uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare s integer; t integer; held boolean; r text;
begin
 select m.role into r from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.user_id=p_user and m.cohort_id=p_cohort and m.status='active' and not m.is_fictitious
 and m.role in('learner','recruiter','school_staff','pilot_owner') and u.email_confirmed_at is not null
 and (u.banned_until is null or u.banned_until<=now());
 if not found then raise exception 'unauthorized';end if;
 select coalesce(sum(greatest(0,p.credit_cents-p.spent_cents)),0)::integer into s
 from public.billing_live_payments p join public.billing_live_orders o on o.id=p.order_id
 where o.user_id=p_user and o.cohort_id=p_cohort and o.profile_type=case r when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else 'Candidato' end
 and p.eligible and p.cents=o.cents and p.credit_cents=o.credit_cents and p.period_start<=now() and p.period_end>now();
 select coalesce(sum(case when p.eligible and p.cents=o.cents then greatest(0,p.cents-p.spent_cents) else 0 end),0)::integer,
 coalesce(bool_or(not p.eligible and p.spent_cents>0),false) into t,held
 from public.portal_ai_topup_payments p join public.portal_ai_topup_orders o on o.id=p.order_id where o.user_id=p_user and o.cohort_id=p_cohort;
 return jsonb_build_object('availableCents',case when held then 0 else s+t end,'availableCalls',case when held then 0 else (s+t)/100 end,'subscriptionCents',s,'purchasedCents',t,'held',held);
end $$;

create function public.portal_ai_topup_apply(p_order uuid,p_payment jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare o public.portal_ai_topup_orders; actor uuid; checked timestamptz;
begin
 select user_id into strict actor from public.portal_ai_topup_orders where id=p_order;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,0));
 select * into strict o from public.portal_ai_topup_orders where id=p_order for update;
 if o.checkout_id is null or p_payment->>'checkout_id' is distinct from o.checkout_id or (p_payment->>'cents')::integer<>o.cents or p_payment->>'id' !~ '^pay_[A-Za-z0-9_-]+$' then raise exception 'payment mismatch';end if;
 checked:=(p_payment->>'checked_at')::timestamptz;
 if checked is null then raise exception 'missing timestamp';end if;
 if exists(select 1 from public.portal_ai_topup_payments where id=p_payment->>'id' and order_id<>o.id) then raise exception 'payment ownership mismatch';end if;
 insert into public.portal_ai_topup_payments(id,order_id,cents,status,eligible,checked_at)
 values(p_payment->>'id',o.id,o.cents,p_payment->>'status',(p_payment->>'eligible')::boolean,checked)
 on conflict(id) do update set status=excluded.status,eligible=excluded.eligible,checked_at=excluded.checked_at
 where public.portal_ai_topup_payments.checked_at<=excluded.checked_at;
 if found then update public.portal_ai_topup_orders set status=case when (p_payment->>'eligible')::boolean then 'confirmed' when p_payment->>'status' in('PENDING','OVERDUE') then 'pending' else 'canceled' end where id=o.id;end if;
end $$;

create function public.portal_ai_topup_create(p_user uuid,p_cohort uuid,p_cents integer,p_terms text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare n uuid;
begin
 perform public.portal_ai_wallet_balance(p_user,p_cohort);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 if p_cents not in(1000,2500,5000) or p_terms is distinct from '2026-10-23-ai-topup-v1' then raise exception 'invalid purchase';end if;
 if (select count(*) from public.portal_ai_topup_orders where user_id=p_user and created_at>now()-interval '1 hour')>=3 then raise exception 'purchase rate limit';end if;
 insert into public.portal_ai_topup_orders(user_id,cohort_id,cents,terms_version) values(p_user,p_cohort,p_cents,p_terms) returning id into n;return n;
end $$;

create function public.portal_ai_wallet_reserve(p_user uuid,p_cohort uuid,p_request uuid) returns integer
language plpgsql security invoker set search_path='' as $$
declare b jsonb; left_cents integer:=100; take_cents integer; row record; r text;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 b:=public.portal_ai_wallet_balance(p_user,p_cohort);
 if (b->>'availableCents')::integer<100 then raise exception 'insufficient paid credits';end if;
 if p_request is null or exists(select 1 from public.portal_ai_wallet_usage where request_id=p_request) then raise exception 'duplicate request';end if;
 insert into public.portal_ai_wallet_usage(request_id,user_id,cohort_id) values(p_request,p_user,p_cohort);
 select role into r from public.pilot_memberships where user_id=p_user and cohort_id=p_cohort;
 -- Consume expiring subscription credits before purchased credits, including fractions.
 for row in select p.id,p.credit_cents-p.spent_cents as available from public.billing_live_payments p join public.billing_live_orders o on o.id=p.order_id
 where o.user_id=p_user and o.cohort_id=p_cohort and o.profile_type=case r when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else 'Candidato' end
 and p.eligible and p.cents=o.cents and p.credit_cents=o.credit_cents and p.period_start<=now() and p.period_end>now() and p.credit_cents>p.spent_cents
 order by p.period_end,p.id for update of p loop
 take_cents:=least(left_cents,row.available);
 update public.billing_live_payments set spent_cents=spent_cents+take_cents where id=row.id;
 insert into public.portal_ai_wallet_lines(request_id,subscription_payment_id,cents) values(p_request,row.id,take_cents);
 left_cents:=left_cents-take_cents;exit when left_cents=0;
 end loop;
 if left_cents>0 then
 for row in select p.id,p.cents-p.spent_cents as available from public.portal_ai_topup_payments p join public.portal_ai_topup_orders o on o.id=p.order_id
 where o.user_id=p_user and o.cohort_id=p_cohort and p.eligible and p.cents=o.cents and p.cents>p.spent_cents order by o.created_at,p.id for update of p loop
 take_cents:=least(left_cents,row.available);
 update public.portal_ai_topup_payments set spent_cents=spent_cents+take_cents where id=row.id;
 insert into public.portal_ai_wallet_lines(request_id,topup_payment_id,cents) values(p_request,row.id,take_cents);
 left_cents:=left_cents-take_cents;exit when left_cents=0;
 end loop;end if;
 if left_cents<>0 then raise exception 'insufficient paid credits';end if;
 b:=public.portal_ai_wallet_balance(p_user,p_cohort);return (b->>'availableCents')::integer;
end $$;

create function public.portal_ai_wallet_refund(p_user uuid,p_cohort uuid,p_request uuid) returns integer
language plpgsql security invoker set search_path='' as $$
declare u public.portal_ai_wallet_usage; row record; b jsonb;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 select * into u from public.portal_ai_wallet_usage where request_id=p_request and user_id=p_user and cohort_id=p_cohort for update;
 if not found then raise exception 'reservation not found';end if;
 if u.refunded_at is null then
 for row in select * from public.portal_ai_wallet_lines where request_id=p_request loop
 if row.subscription_payment_id is not null then
 update public.billing_live_payments set spent_cents=spent_cents-row.cents where id=row.subscription_payment_id and spent_cents>=row.cents;
 else update public.portal_ai_topup_payments set spent_cents=spent_cents-row.cents where id=row.topup_payment_id and spent_cents>=row.cents;end if;
 if not found then raise exception 'balance mismatch';end if;
 end loop;
 update public.portal_ai_wallet_usage set refunded_at=now() where request_id=p_request;
 end if;
 b:=public.portal_ai_wallet_balance(p_user,p_cohort);return (b->>'availableCents')::integer;
end $$;

do $$declare sig text;begin foreach sig in array array['portal_ai_wallet_balance(uuid,uuid)','portal_ai_topup_apply(uuid,jsonb)','portal_ai_topup_create(uuid,uuid,integer,text)','portal_ai_wallet_reserve(uuid,uuid,uuid)','portal_ai_wallet_refund(uuid,uuid,uuid)'] loop
 execute 'revoke all on function public.'||sig||' from public,anon,authenticated';
 execute 'grant execute on function public.'||sig||' to service_role';
end loop;end $$;
