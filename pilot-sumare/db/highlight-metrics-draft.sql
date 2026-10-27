-- Draft only: event metrics are approximate, deduplicated by browser session/day.
-- No names, IPs, email addresses, user IDs, or raw browser session IDs are stored.
create table public.portal_highlight_metric_keys (
 order_id uuid not null references public.portal_highlight_orders(id),
 day date not null,
 event_kind text not null check(event_kind in ('view','click')),
 session_digest text not null check(session_digest ~ '^[a-f0-9]{64}$'),
 primary key(order_id,day,event_kind,session_digest)
);
create index portal_highlight_metric_keys_day on public.portal_highlight_metric_keys(day);
create table public.portal_highlight_daily_stats (
 order_id uuid not null references public.portal_highlight_orders(id),
 day date not null,
 views integer not null default 0 check(views>=0),
 clicks integer not null default 0 check(clicks>=0),
 primary key(order_id,day)
);
alter table public.portal_highlight_metric_keys enable row level security;
alter table public.portal_highlight_daily_stats enable row level security;
revoke all on public.portal_highlight_metric_keys,public.portal_highlight_daily_stats from public,anon,authenticated;
grant select,insert,update,delete on public.portal_highlight_metric_keys,public.portal_highlight_daily_stats to service_role;

create function public.portal_highlight_record_metric(p_cohort uuid,p_kind text,p_target uuid,p_event text,p_digest text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare campaign uuid; cnt integer; inserted uuid; today date:=(statement_timestamp() at time zone 'America/Sao_Paulo')::date;
begin
 if p_cohort is null or p_target is null or p_kind not in ('candidate','job','course','training') or p_event not in ('view','click') or p_digest !~ '^[a-f0-9]{64}$' then raise exception 'invalid metric';end if;
 -- The current candidate card has no individual detail action to measure as a click.
 if p_kind='candidate' and p_event='click' then return false;end if;
 -- Accept only currently visible and permitted real items and confirmed campaigns.
 select count(*)::integer into cnt from public.portal_highlight_orders o join public.portal_highlight_payments p on p.order_id=o.id
 join public.pilot_memberships m on m.user_id=o.user_id and m.cohort_id=o.cohort_id
 join auth.users u on u.id=o.user_id
 where o.cohort_id=p_cohort and o.kind=p_kind and o.target_id=p_target and o.status='confirmed' and p.eligible and p.cents=o.cents
 and o.starts_at<=statement_timestamp() and o.ends_at>statement_timestamp() and m.status='active' and not m.is_fictitious
 and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=statement_timestamp())
 and (p_kind='candidate' and exists(select 1 from public.portal_candidate_cards c where c.id=p_target and c.user_id=o.user_id and c.cohort_id=p_cohort and c.visible and not c.is_fictitious)
   or p_kind<>'candidate' and exists(select 1 from public.portal_listings l where l.id=p_target and l.publisher_id=o.user_id and l.cohort_id=p_cohort and l.kind=p_kind and l.status='published' and not l.is_fictitious));
 -- Ambiguous overlapping campaigns require reconciliation, not an arbitrary attribution.
 if cnt<>1 then return false;end if;
 select o.id into strict campaign from public.portal_highlight_orders o join public.portal_highlight_payments p on p.order_id=o.id
 where o.cohort_id=p_cohort and o.kind=p_kind and o.target_id=p_target and o.status='confirmed' and p.eligible and p.cents=o.cents
 and o.starts_at<=statement_timestamp() and o.ends_at>statement_timestamp();
 insert into public.portal_highlight_metric_keys(order_id,day,event_kind,session_digest) values(campaign,today,p_event,p_digest)
 on conflict do nothing returning order_id into inserted;
 if inserted is null then return false;end if;
 insert into public.portal_highlight_daily_stats(order_id,day,views,clicks) values(campaign,today,case when p_event='view' then 1 else 0 end,case when p_event='click' then 1 else 0 end)
 on conflict(order_id,day) do update set views=public.portal_highlight_daily_stats.views+excluded.views,clicks=public.portal_highlight_daily_stats.clicks+excluded.clicks;
 return true;
end $$;
revoke all on function public.portal_highlight_record_metric(uuid,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.portal_highlight_record_metric(uuid,text,uuid,text,text) to service_role;

-- Bounded opportunistic cleanup; counts survive while session-level digests expire.
create function public.portal_highlight_metric_cleanup() returns integer
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 delete from public.portal_highlight_metric_keys where ctid in (
  select ctid from public.portal_highlight_metric_keys
  where day<(statement_timestamp() at time zone 'America/Sao_Paulo')::date-31 order by day limit 1000
 );
 get diagnostics n=row_count;return n;
end $$;
revoke all on function public.portal_highlight_metric_cleanup() from public,anon,authenticated;
grant execute on function public.portal_highlight_metric_cleanup() to service_role;

create function public.portal_highlight_stats(p_user uuid,p_cohort uuid,p_orders uuid[]) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
begin
 if p_user is null or p_cohort is null or p_orders is null or cardinality(p_orders)>50 then raise exception 'invalid stats request';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('order_id',s.order_id,'views',s.views,'clicks',s.clicks)) from (
  select o.id as order_id,coalesce(sum(d.views),0)::bigint as views,coalesce(sum(d.clicks),0)::bigint as clicks
  from public.portal_highlight_orders o left join public.portal_highlight_daily_stats d on d.order_id=o.id
  where o.user_id=p_user and o.cohort_id=p_cohort and o.id=any(p_orders) group by o.id
 ) s),'[]'::jsonb);
end $$;
revoke all on function public.portal_highlight_stats(uuid,uuid,uuid[]) from public,anon,authenticated;
grant execute on function public.portal_highlight_stats(uuid,uuid,uuid[]) to service_role;
