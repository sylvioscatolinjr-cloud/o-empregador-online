create function public.billing_sandbox_method_event(p_event jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare target uuid; latest text;
begin
 insert into public.billing_sandbox_method_events(id,event_type,resource_id,parent_id,resource_status,event_at) values(p_event->>'id',p_event->>'event_type',p_event->>'resource_id',p_event->>'parent_id',p_event->>'resource_status',(p_event->>'event_at')::timestamptz) on conflict do nothing;
 if not found then return; end if;
 select id into target from public.billing_sandbox_methods where first_payment_id=p_event->>'resource_id' or authorization_id=p_event->>'resource_id' for update;
 if target is null then return; end if;
 select resource_status into latest from public.billing_sandbox_method_events where resource_id=p_event->>'resource_id' order by event_at desc,(resource_status in ('REFUNDED','DELETED','CANCELLED','REFUSED','EXPIRED')) desc,received_at desc limit 1;
 if (p_event->>'event_type') like 'PAYMENT_%' then
  update public.billing_sandbox_methods set status=case when latest in ('CONFIRMED','RECEIVED','RECEIVED_IN_CASH') then 'paid' when latest in ('REFUNDED','DELETED') then 'canceled' else status end where id=target;
 elsif latest in ('CANCELLED','REFUSED','EXPIRED') then
  update public.billing_sandbox_methods set status=case when latest='REFUSED' then 'failed' else 'canceled' end where id=target and status<>'paid';
 end if;
end $$;
revoke all on function public.billing_sandbox_method_event(jsonb) from public,anon,authenticated;
grant execute on function public.billing_sandbox_method_event(jsonb) to service_role;
create index billing_sandbox_methods_first_payment on public.billing_sandbox_methods(first_payment_id);
