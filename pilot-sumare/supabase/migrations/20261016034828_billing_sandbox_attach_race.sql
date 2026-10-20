create function public.billing_sandbox_attach(p_order uuid,p_checkout text) returns void language plpgsql security invoker set search_path='' as $$
declare resolved text;
begin
 update public.billing_sandbox_orders set checkout_id=p_checkout,status='pending' where id=p_order and status in ('creating','review');
 if not found then raise exception 'order cannot be attached'; end if;
 select case event_type when 'CHECKOUT_PAID' then 'paid' when 'CHECKOUT_CANCELED' then 'canceled' when 'CHECKOUT_EXPIRED' then 'expired' else 'pending' end into resolved from public.billing_sandbox_events where checkout_id=p_checkout order by (event_type='CHECKOUT_PAID') desc,received_at desc limit 1;
 if resolved is not null then update public.billing_sandbox_orders set status=resolved where id=p_order; end if;
end $$;
revoke all on function public.billing_sandbox_attach(uuid,text) from public,anon,authenticated;
grant execute on function public.billing_sandbox_attach(uuid,text) to service_role;
