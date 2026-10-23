create or replace function public.portal_ai_topup_apply(p_order uuid,p_payment jsonb) returns void
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
 if found then update public.portal_ai_topup_orders set status=case when (p_payment->>'eligible')::boolean then 'confirmed' when p_payment->>'status' in('PENDING','OVERDUE') and o.status in('creating','pending') then 'pending' else 'canceled' end where id=o.id;end if;
end $$;
