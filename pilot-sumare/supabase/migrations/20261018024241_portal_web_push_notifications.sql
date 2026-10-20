create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create table public.portal_push_subscriptions(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id),endpoint_hash text not null unique check(length(endpoint_hash)=64),
 subscription jsonb not null,created_at timestamptz not null default now()
);
create index portal_push_subscriptions_user on public.portal_push_subscriptions(user_id,cohort_id);
create index portal_push_subscriptions_cohort on public.portal_push_subscriptions(cohort_id);
alter table public.portal_push_subscriptions enable row level security;
revoke all on public.portal_push_subscriptions from public,anon,authenticated;
grant all on public.portal_push_subscriptions to service_role;
create table public.portal_push_outbox(
 id uuid primary key default gen_random_uuid(),subscription_id uuid not null references public.portal_push_subscriptions(id) on delete cascade,
 notification_id uuid not null references public.portal_notifications(id) on delete cascade,
 state text not null default 'pending' check(state in ('pending','leased','sent','failed')),
 attempts integer not null default 0,available_at timestamptz not null default now(),lease uuid,
 created_at timestamptz not null default now(),unique(subscription_id,notification_id)
);
create index portal_push_outbox_pending on public.portal_push_outbox(available_at) where state in ('pending','leased');
create index portal_push_outbox_notification on public.portal_push_outbox(notification_id);
alter table public.portal_push_outbox enable row level security;
revoke all on public.portal_push_outbox from public,anon,authenticated;
grant all on public.portal_push_outbox to service_role;
create function public.portal_push_subscribe(p_user uuid,p_cohort uuid,p_hash text,p_subscription jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare v_id uuid;v_count integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,42));
 if not exists(select 1 from public.pilot_memberships m where m.user_id=p_user and m.cohort_id=p_cohort and m.status='active' and not m.is_fictitious) then raise exception 'Conta indisponível';end if;
 select id into v_id from public.portal_push_subscriptions where endpoint_hash=p_hash and user_id=p_user and cohort_id=p_cohort;
 if found then update public.portal_push_subscriptions set subscription=p_subscription where id=v_id;return;end if;
 select count(*) into v_count from public.portal_push_subscriptions where user_id=p_user;
 if v_count>=5 then raise exception 'Limite de aparelhos atingido';end if;
 insert into public.portal_push_subscriptions(user_id,cohort_id,endpoint_hash,subscription) values(p_user,p_cohort,p_hash,p_subscription);
 insert into public.portal_notifications(cohort_id,user_id,title,body) values(p_cohort,p_user,'Notificações ativadas','Este é o aviso de teste do aparelho. Os próximos avisos continuarão disponíveis nesta central.');
end $$;
revoke all on function public.portal_push_subscribe(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.portal_push_subscribe(uuid,uuid,text,jsonb) to service_role;
create function pilot_private.queue_notice_push() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.portal_push_outbox(subscription_id,notification_id)
 select s.id,new.id from public.portal_push_subscriptions s join public.pilot_memberships m on m.user_id=s.user_id and m.cohort_id=s.cohort_id
 where s.user_id=new.user_id and s.cohort_id=new.cohort_id and m.status='active' and not m.is_fictitious;
 return new;
end $$;
revoke all on function pilot_private.queue_notice_push() from public,anon,authenticated;
create trigger queue_notice_push after insert on public.portal_notifications for each row execute function pilot_private.queue_notice_push();
create function public.portal_push_claim() returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 update public.portal_push_outbox o set state='sent' from public.portal_notifications n where o.notification_id=n.id and n.read_at is not null and o.state in ('pending','leased');
 update public.portal_push_outbox set state='failed' where attempts>=5 and state in ('pending','leased') and available_at<=now();
 with picked as(select o.id from public.portal_push_outbox o join public.portal_push_subscriptions s on s.id=o.subscription_id join public.pilot_memberships m on m.user_id=s.user_id and m.cohort_id=s.cohort_id where o.state in ('pending','leased') and o.available_at<=now() and o.attempts<5 and m.status='active' and not m.is_fictitious order by o.created_at for update of o skip locked limit 20), claimed as(update public.portal_push_outbox o set state='leased',lease=gen_random_uuid(),attempts=attempts+1,available_at=now()+interval '2 minutes' from picked where o.id=picked.id returning o.*)
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'lease',c.lease,'user_id',s.user_id,'cohort_id',s.cohort_id,'subscription',s.subscription)),'[]'::jsonb) into result from claimed c join public.portal_push_subscriptions s on s.id=c.subscription_id;
 return result;
end $$;
revoke all on function public.portal_push_claim() from public,anon,authenticated;
grant execute on function public.portal_push_claim() to service_role;
create function public.portal_push_finish(p_id uuid,p_lease uuid,p_outcome text) returns void language plpgsql security invoker set search_path='' as $$
declare v_sub uuid;
begin
 if p_outcome not in ('sent','retry','expired') then raise exception 'Resultado inválido';end if;
 if p_outcome='expired' then
  select subscription_id into v_sub from public.portal_push_outbox where id=p_id and lease=p_lease and state='leased';
  delete from public.portal_push_subscriptions where id=v_sub;
 else
  update public.portal_push_outbox set state=case when p_outcome='sent' then 'sent' when attempts>=5 then 'failed' else 'pending' end,available_at=now()+interval '2 minutes' where id=p_id and lease=p_lease and state='leased';
 end if;
end $$;
revoke all on function public.portal_push_finish(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.portal_push_finish(uuid,uuid,text) to service_role;
create function pilot_private.wake_push() returns void language plpgsql security definer set search_path='' as $$
declare v_secret text;
begin
 if not exists(select 1 from public.portal_push_outbox where state in ('pending','leased') and available_at<=now() and attempts<5) then return;end if;
 select decrypted_secret into v_secret from vault.decrypted_secrets where name='portal_push_dispatch_secret';
 if v_secret is null then return;end if;
 perform net.http_post(url:='https://www.oempregadoronline.com.br/api/push?dispatch=1',headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||v_secret),body:='{}'::jsonb,timeout_milliseconds:=15000);
end $$;
revoke all on function pilot_private.wake_push() from public,anon,authenticated,service_role;
select cron.schedule('portal-push-dispatch','* * * * *','select pilot_private.wake_push()');
notify pgrst,'reload schema';
