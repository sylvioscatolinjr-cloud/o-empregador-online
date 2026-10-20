create or replace function public.billing_live_apply_payment(p_order uuid,p_payment jsonb) returns void language plpgsql security invoker set search_path='' as $$
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
