create or replace function public.portal_push_claim() returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 update public.portal_push_outbox o set state='failed' where o.state in ('pending','leased') and not exists(select 1 from public.portal_push_subscriptions s join public.pilot_memberships m on m.user_id=s.user_id and m.cohort_id=s.cohort_id where s.id=o.subscription_id and m.status='active' and not m.is_fictitious);
 update public.portal_push_outbox o set state='sent' from public.portal_notifications n where o.notification_id=n.id and n.read_at is not null and o.state in ('pending','leased');
 update public.portal_push_outbox set state='failed' where attempts>=5 and state in ('pending','leased') and available_at<=now();
 with picked as(select o.id from public.portal_push_outbox o join public.portal_push_subscriptions s on s.id=o.subscription_id join public.pilot_memberships m on m.user_id=s.user_id and m.cohort_id=s.cohort_id where o.state in ('pending','leased') and o.available_at<=now() and o.attempts<5 and m.status='active' and not m.is_fictitious order by o.created_at for update of o skip locked limit 20), claimed as(update public.portal_push_outbox o set state='leased',lease=gen_random_uuid(),attempts=attempts+1,available_at=now()+interval '2 minutes' from picked where o.id=picked.id returning o.*)
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'lease',c.lease,'user_id',s.user_id,'cohort_id',s.cohort_id,'subscription',s.subscription)),'[]'::jsonb) into result from claimed c join public.portal_push_subscriptions s on s.id=c.subscription_id;
 return result;
end $$;
