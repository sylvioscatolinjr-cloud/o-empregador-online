create table if not exists public.portal_ai_payment_usage (
 request_id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 payment_id text not null references public.billing_live_payments(id),
 cost_cents integer not null check(cost_cents=100),
 created_at timestamptz not null default now(),
 refunded_at timestamptz
);
create index if not exists portal_ai_payment_usage_user on public.portal_ai_payment_usage(user_id,created_at desc);
alter table public.portal_ai_payment_usage enable row level security;
revoke all on public.portal_ai_payment_usage from public,anon,authenticated;
create or replace function public.portal_ai_paid_reserve(p_user uuid,p_request uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare p public.billing_live_payments; v_available integer;
begin
 if auth.role() <> 'service_role' then raise exception 'unauthorized'; end if;
 if p_user is null or p_request is null then raise exception 'invalid request'; end if;
 if exists(select 1 from public.portal_ai_payment_usage where request_id=p_request) then raise exception 'duplicate request'; end if;
 select pay.* into p from public.billing_live_payments pay
 join public.billing_live_orders o on o.id=pay.order_id
 where o.user_id=p_user and o.tier between 1 and 3 and pay.eligible is true
 and pay.cents=o.cents and pay.credit_cents=o.credit_cents
 and pay.period_start<=now() and pay.period_end>now()
 and pay.credit_cents-pay.spent_cents>=100
 order by pay.period_end asc,pay.id asc
 limit 1 for update of pay;
 if not found then raise exception 'insufficient paid credits'; end if;
 update public.billing_live_payments set spent_cents=spent_cents+100 where id=p.id
 returning credit_cents-spent_cents into v_available;
 insert into public.portal_ai_payment_usage(request_id,user_id,payment_id,cost_cents)
 values(p_request,p_user,p.id,100);
 return v_available;
end $$;
create or replace function public.portal_ai_paid_refund(p_user uuid,p_request uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare v_usage public.portal_ai_payment_usage; v_available integer;
begin
 if auth.role() <> 'service_role' then raise exception 'unauthorized'; end if;
 if p_user is null or p_request is null then raise exception 'invalid request'; end if;
 select * into v_usage from public.portal_ai_payment_usage
 where request_id=p_request and user_id=p_user for update;
 if not found then raise exception 'reservation not found'; end if;
 if v_usage.refunded_at is not null then
  select credit_cents-spent_cents into v_available from public.billing_live_payments where id=v_usage.payment_id;
  return v_available;
 end if;
 update public.billing_live_payments set spent_cents=spent_cents-v_usage.cost_cents
 where id=v_usage.payment_id and spent_cents>=v_usage.cost_cents
 returning credit_cents-spent_cents into v_available;
 if not found then raise exception 'payment balance mismatch'; end if;
 update public.portal_ai_payment_usage set refunded_at=now() where request_id=p_request;
 return v_available;
end $$;
revoke all on function public.portal_ai_paid_reserve(uuid,uuid) from public,anon,authenticated;
revoke all on function public.portal_ai_paid_refund(uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_ai_paid_reserve(uuid,uuid) to service_role;
grant execute on function public.portal_ai_paid_refund(uuid,uuid) to service_role;