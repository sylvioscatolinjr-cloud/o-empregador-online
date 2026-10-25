-- Stable provider payment dates for reporting only. Never infer receipt from checked_at.
alter table public.billing_live_payments add column provider_paid_on date;
alter table public.portal_ai_topup_payments add column provider_paid_on date;
CREATE OR REPLACE FUNCTION public.billing_live_apply_payment(p_order uuid, p_payment jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare o public.billing_live_orders; b timestamptz; e timestamptz;
begin
 select * into strict o from public.billing_live_orders where id=p_order for update;
 if (p_payment->>'eligible')::boolean and (p_payment->>'cents')::integer<>o.cents then raise exception 'amount mismatch';end if;
 b:=(p_payment->>'period_start')::timestamptz;e:=(p_payment->>'period_end')::timestamptz;
 if e<=b or e>b+interval '370 days' then raise exception 'invalid period';end if;
 if exists(select 1 from public.billing_live_payments where id=p_payment->>'id' and order_id<>o.id) then raise exception 'payment ownership mismatch';end if;
 insert into public.billing_live_payments(id,order_id,status,cents,period_start,period_end,credit_cents,eligible,checked_at,provider_paid_on)
 values(p_payment->>'id',o.id,p_payment->>'status',(p_payment->>'cents')::integer,b,e,o.credit_cents,(p_payment->>'eligible')::boolean,(p_payment->>'checked_at')::timestamptz,(p_payment->>'provider_paid_on')::date)
 on conflict(id) do update set cents=excluded.cents,status=excluded.status,eligible=excluded.eligible,checked_at=excluded.checked_at,provider_paid_on=coalesce(excluded.provider_paid_on,public.billing_live_payments.provider_paid_on)
 where public.billing_live_payments.checked_at<=excluded.checked_at;
 if found and (p_payment->>'eligible')::boolean and o.status in ('creating','pending','review') then update public.billing_live_orders set status='active' where id=o.id;end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.portal_ai_topup_apply(p_order uuid, p_payment jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare o public.portal_ai_topup_orders; actor uuid; checked timestamptz;
begin
 select user_id into strict actor from public.portal_ai_topup_orders where id=p_order;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,0));
 select * into strict o from public.portal_ai_topup_orders where id=p_order for update;
 if o.checkout_id is null or p_payment->>'checkout_id' is distinct from o.checkout_id or (p_payment->>'cents')::integer<>o.cents or p_payment->>'id' !~ '^pay_[A-Za-z0-9_-]+$' then raise exception 'payment mismatch';end if;
 checked:=(p_payment->>'checked_at')::timestamptz;
 if checked is null then raise exception 'missing timestamp';end if;
 if exists(select 1 from public.portal_ai_topup_payments where id=p_payment->>'id' and order_id<>o.id) then raise exception 'payment ownership mismatch';end if;
 insert into public.portal_ai_topup_payments(id,order_id,cents,status,eligible,checked_at,provider_paid_on)
 values(p_payment->>'id',o.id,o.cents,p_payment->>'status',(p_payment->>'eligible')::boolean,checked,(p_payment->>'provider_paid_on')::date)
 on conflict(id) do update set status=excluded.status,eligible=excluded.eligible,checked_at=excluded.checked_at,provider_paid_on=coalesce(excluded.provider_paid_on,public.portal_ai_topup_payments.provider_paid_on)
 where public.portal_ai_topup_payments.checked_at<=excluded.checked_at;
 if found then update public.portal_ai_topup_orders set status=case when (p_payment->>'eligible')::boolean then 'confirmed' when p_payment->>'status' in('PENDING','OVERDUE') and o.status in('creating','pending') then 'pending' else 'canceled' end where id=o.id;end if;
end $function$
;
notify pgrst,'reload schema';
