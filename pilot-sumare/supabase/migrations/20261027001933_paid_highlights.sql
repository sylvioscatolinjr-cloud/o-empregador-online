-- Draft only: do not deploy until checkout, all feeds, metrics and reconciliation are complete.
create table public.portal_highlight_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 cohort_id uuid not null references public.pilot_cohorts(id),
 role text not null check(role in ('learner','recruiter','school_staff')),
 kind text not null check(kind in ('candidate','job','course','training')),
 target_id uuid not null,
 days integer not null check(days in (7,15,30)),
 tier integer not null check(tier between 0 and 4),
 base_cents integer not null check(base_cents>0),
 discount_percent integer not null check(discount_percent in (0,10,15,20,25)),
 cents integer not null check(cents>0),
 terms_version text not null,
 status text not null default 'creating' check(status in ('creating','pending','confirmed','expired','canceled','failed','review')),
 checkout_id text unique,
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz not null default now(),
 check ((starts_at is null and ends_at is null) or (starts_at is not null and ends_at=starts_at+days*interval '1 day'))
);
create index portal_highlight_order_actor on public.portal_highlight_orders(user_id,cohort_id,created_at desc);
create index portal_highlight_order_target on public.portal_highlight_orders(cohort_id,kind,target_id,ends_at);
create table public.portal_highlight_payments (
 id text primary key check(id ~ '^pay_[A-Za-z0-9_-]+$'),
 order_id uuid not null references public.portal_highlight_orders(id),
 cents integer not null check(cents>0),
 status text not null,
 eligible boolean not null,
 checked_at timestamptz not null,
 provider_paid_on date
);
alter table public.portal_highlight_orders enable row level security;
alter table public.portal_highlight_payments enable row level security;
revoke all on public.portal_highlight_orders,public.portal_highlight_payments from public,anon,authenticated;
grant select,insert,update,delete on public.portal_highlight_orders,public.portal_highlight_payments to service_role;

create function public.portal_highlight_create(p_user uuid,p_cohort uuid,p_kind text,p_target uuid,p_days integer,p_expected_tier integer,p_expected_cents integer,p_terms text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r text; profile text; tier integer; base integer; discount integer; final_cents integer; o uuid;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 select m.role into r from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.user_id=p_user and m.cohort_id=p_cohort and m.status='active' and not m.is_fictitious
 and m.role in ('learner','recruiter','school_staff','pilot_owner') and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now());
 if not found then raise exception 'unauthorized';end if;
 if r='pilot_owner' then r:='learner';end if;
 if p_terms is distinct from '2026-10-26-highlight-v1' or p_days not in (7,15,30) or p_target is null then raise exception 'invalid request';end if;
 if r='learner' and p_kind='candidate' then
  if not exists(select 1 from public.portal_candidate_cards c where c.id=p_target and c.user_id=p_user and c.cohort_id=p_cohort and c.visible and not c.is_fictitious) then raise exception 'invalid target';end if;
 elsif r='recruiter' and p_kind='job' or r='school_staff' and p_kind in ('course','training') then
  if not exists(select 1 from public.portal_listings l where l.id=p_target and l.publisher_id=p_user and l.cohort_id=p_cohort and l.kind=p_kind and l.status='published' and not l.is_fictitious) then raise exception 'invalid target';end if;
 else raise exception 'invalid role or kind';end if;
 profile:=case r when 'learner' then 'Candidato' when 'recruiter' then 'Empresa' else 'Instituição de Ensino' end;
 tier:=pilot_private.verified_paid_tier(p_user,p_cohort,profile);
 discount:=case tier when 0 then 0 when 1 then 10 when 2 then 15 when 3 then 20 when 4 then 25 else null end;
 base:=case when r='learner' then case p_days when 7 then 990 when 15 then 1990 when 30 then 2990 end else case p_days when 7 then 2990 when 15 then 5990 when 30 then 9990 end end;
 final_cents:=round(base::numeric*(100-discount)/100)::integer;
 if tier is distinct from p_expected_tier or final_cents is distinct from p_expected_cents then raise exception 'price changed';end if;
 if (select count(*) from public.portal_highlight_orders where user_id=p_user and cohort_id=p_cohort and created_at>now()-interval '1 hour')>=3 then raise exception 'rate limit';end if;
 if exists(select 1 from public.portal_highlight_orders where user_id=p_user and cohort_id=p_cohort and kind=p_kind and target_id=p_target and (status in ('creating','pending','review') or (status='confirmed' and ends_at>now()))) then raise exception 'existing purchase';end if;
 insert into public.portal_highlight_orders(user_id,cohort_id,role,kind,target_id,days,tier,base_cents,discount_percent,cents,terms_version)
 values(p_user,p_cohort,r,p_kind,p_target,p_days,tier,base,discount,final_cents,p_terms) returning id into o;
 return jsonb_build_object('id',o,'tier',tier,'base_cents',base,'discount_percent',discount,'cents',final_cents);
end $$;

create function public.portal_highlight_apply(p_order uuid,p_payment jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare o public.portal_highlight_orders; actor uuid; checked timestamptz; eligible boolean;
begin
 select user_id into strict actor from public.portal_highlight_orders where id=p_order;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text,0));
 select * into strict o from public.portal_highlight_orders where id=p_order for update;
 if o.checkout_id is null or p_payment->>'checkout_id' is distinct from o.checkout_id or (p_payment->>'cents')::integer is distinct from o.cents or p_payment->>'id' !~ '^pay_[A-Za-z0-9_-]+$' then raise exception 'payment mismatch';end if;
 checked:=(p_payment->>'checked_at')::timestamptz;eligible:=(p_payment->>'eligible')::boolean;
 if checked is null or eligible is null then raise exception 'invalid snapshot';end if;
 if exists(select 1 from public.portal_highlight_payments where id=p_payment->>'id' and order_id<>o.id) then raise exception 'payment ownership mismatch';end if;
 insert into public.portal_highlight_payments(id,order_id,cents,status,eligible,checked_at,provider_paid_on)
 values(p_payment->>'id',o.id,o.cents,left(p_payment->>'status',80),eligible,checked,nullif(p_payment->>'provider_paid_on','')::date)
 on conflict(id) do update set status=excluded.status,eligible=excluded.eligible,checked_at=excluded.checked_at,provider_paid_on=coalesce(excluded.provider_paid_on,public.portal_highlight_payments.provider_paid_on)
 where public.portal_highlight_payments.order_id=excluded.order_id and (
  public.portal_highlight_payments.checked_at<excluded.checked_at or
  (public.portal_highlight_payments.checked_at=excluded.checked_at and public.portal_highlight_payments.eligible and not excluded.eligible)
 );
 if not found then return;end if;
 -- A second payment or another paid campaign for this item requires manual
 -- reconciliation. Keep every snapshot and never grant overlapping time.
 if o.status='review' or (select count(*) from public.portal_highlight_payments where order_id=o.id)>1 or
  (eligible and exists(select 1 from public.portal_highlight_orders other
   join public.portal_highlight_payments paid on paid.order_id=other.id
   where other.id<>o.id and other.user_id=o.user_id and other.cohort_id=o.cohort_id and other.kind=o.kind and other.target_id=o.target_id
   and other.status='confirmed' and paid.eligible and paid.cents=other.cents and other.starts_at<=now() and other.ends_at>now())) then
  update public.portal_highlight_orders set status='review' where id=o.id;return;
 end if;
 update public.portal_highlight_orders set
  starts_at=case when eligible then coalesce(o.starts_at,now()) else o.starts_at end,
  ends_at=case when eligible then coalesce(o.ends_at,now()+o.days*interval '1 day') else o.ends_at end,
  status=case when eligible then 'confirmed' when p_payment->>'status' in ('PENDING','OVERDUE') and o.status in ('creating','pending') then 'pending' else 'canceled' end
 where id=o.id;
end $$;
revoke all on function public.portal_highlight_create(uuid,uuid,text,uuid,integer,integer,integer,text) from public,anon,authenticated;
revoke all on function public.portal_highlight_apply(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.portal_highlight_create(uuid,uuid,text,uuid,integer,integer,integer,text) to service_role;
grant execute on function public.portal_highlight_apply(uuid,jsonb) to service_role;

-- Exposed only to service role; it never accepts a profile supplied by a buyer.
create function public.portal_highlight_tier(p_user uuid,p_cohort uuid) returns integer
language plpgsql stable security invoker set search_path='' as $$
declare r text; profile text;
begin
 select m.role into r from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.user_id=p_user and m.cohort_id=p_cohort and m.status='active' and not m.is_fictitious
 and m.role in ('learner','recruiter','school_staff','pilot_owner') and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now());
 if not found then raise exception 'unauthorized';end if;
 profile:=case r when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else 'Candidato' end;
 return pilot_private.verified_paid_tier(p_user,p_cohort,profile);
end $$;
revoke all on function public.portal_highlight_tier(uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_highlight_tier(uuid,uuid) to service_role;
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
-- Draft only: do not apply before concurrency, delivery and tracking are complete.
create or replace function pilot_private.highlight_active(p_cohort uuid,p_user uuid,p_kind text,p_target uuid)
returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.portal_highlight_orders o join public.portal_highlight_payments p on p.order_id=o.id
 where o.cohort_id=p_cohort and o.user_id=p_user and o.kind=p_kind and o.target_id=p_target
 and o.status='confirmed' and p.eligible and p.cents=o.cents
 and o.starts_at<=statement_timestamp() and o.ends_at>statement_timestamp())
$$;
revoke all on function pilot_private.highlight_active(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function pilot_private.highlight_active(uuid,uuid,text,uuid) to service_role;

-- pilot_private.search_scored_candidates: preserve existing permissions on CREATE OR REPLACE.
CREATE OR REPLACE FUNCTION pilot_private.search_scored_candidates(p_cohort uuid, p_query text, p_city text, p_senai boolean, p_page integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
 if auth.uid() is null or coalesce(pilot_private.portal_role(p_cohort),'') not in ('recruiter','school_staff','pilot_owner') then raise exception 'Busca de currículos indisponível para este perfil';end if;
 if p_page is null or p_page not between 0 and 1000 then raise exception 'Página inválida';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'promotion_order'-'subscription_tier' order by x.is_featured desc,case when x.is_featured then x.is_fictitious else false end asc,x.promotion_order asc nulls last,x.subscription_tier desc,x.professional_points desc,lower(x.name),x.id)
 from (
  select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.is_fictitious,(c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) as is_featured,case when (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) then mod(row_number() over(partition by (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) order by c.id)-1+floor(extract(epoch from statement_timestamp())/300)::bigint,count(*) over(partition by (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)))) end as promotion_order,c.demo_resume,c.has_senai,c.photo_data,c.show_card_image,
   pilot_private.learning_score(c.user_id,c.cohort_id) as professional_points,
   pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier
  from public.portal_candidate_cards c
  where c.cohort_id=p_cohort and c.visible and pilot_private.public_candidate_active(c.user_id,c.cohort_id)
   and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%' or c.skills ilike '%'||left(p_query,100)||'%')
   and (coalesce(p_city,'')='' or c.city ilike '%'||left(p_city,100)||'%') and (not coalesce(p_senai,false) or c.has_senai)
  order by (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) desc,case when (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) then c.is_fictitious else false end asc,promotion_order asc nulls last,subscription_tier desc,professional_points desc,lower(c.name),c.id offset p_page*30 limit 30
 )x),'[]');
end $function$;

-- public.portal_distance_candidate_search: preserve existing permissions on CREATE OR REPLACE.
CREATE OR REPLACE FUNCTION public.portal_distance_candidate_search(p_cohort uuid, p_query text, p_city text, p_senai boolean, p_page integer, p_lat double precision, p_lon double precision)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$begin
 if p_page is null or p_page not between 0 and 1000 or p_lat is null or p_lon is null or not(p_lat between -34 and 6) or not(p_lon between -74 and -34) then raise exception 'Invalid distance request';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'promotion_order'-'subscription_tier'-'rank_distance' order by x.is_featured desc,case when x.is_featured then x.is_fictitious else false end asc,x.promotion_order asc nulls last,x.subscription_tier desc,x.professional_points desc,x.rank_distance asc nulls last,lower(x.name),x.id)
 from (select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.is_fictitious,(c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) as is_featured,case when (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) then mod(row_number() over(partition by (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) order by c.id)-1+floor(extract(epoch from statement_timestamp())/300)::bigint,count(*) over(partition by (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)))) end as promotion_order,c.demo_resume,c.has_senai,case when c.show_card_image then c.photo_data else '' end as photo_data,c.show_card_image,
 pilot_private.public_professional_points(c.user_id,c.cohort_id) as professional_points,pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier,
 pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) as rank_distance
 from public.portal_candidate_cards c join public.pilot_memberships m on m.user_id=c.user_id and m.cohort_id=c.cohort_id join auth.users u on u.id=c.user_id
 left join public.portal_candidate_regions g on g.user_id=c.user_id and g.cohort_id=c.cohort_id
 where c.cohort_id=p_cohort and c.visible and m.status='active' and m.role in ('learner','pilot_owner') and u.email_confirmed_at is not null
 and ((c.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%' or c.skills ilike '%'||left(p_query,100)||'%')
 and (coalesce(p_city,'')='' or c.city ilike '%'||left(p_city,100)||'%') and (not coalesce(p_senai,false) or c.has_senai)
 order by (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) desc,case when (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) then c.is_fictitious else false end asc,promotion_order asc nulls last,subscription_tier desc,professional_points desc,rank_distance asc nulls last,lower(c.name),c.id offset p_page*30 limit 30)x),'[]');
end$function$;

-- public.portal_distance_public_feed: preserve existing permissions on CREATE OR REPLACE.
CREATE OR REPLACE FUNCTION public.portal_distance_public_feed(p_cohort uuid, p_kind text, p_query text DEFAULT ''::text, p_page integer DEFAULT 0, p_size integer DEFAULT 50, p_lat double precision DEFAULT NULL::double precision, p_lon double precision DEFAULT NULL::double precision)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$begin
 if p_kind is null or p_kind not in ('job','course','training','learning','all','candidates') or p_page is null or p_page not between 0 and 1000 or p_size is null or p_size not in (30,50) then raise exception 'Invalid feed request';end if;
 if p_kind='candidates' or p_lat is null or p_lon is null or not(p_lat between -34 and 6) or not(p_lon between -74 and -34) then raise exception 'Invalid distance request';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'promotion_order'-'subscription_tier'-'organization_points'-'rank_distance' order by x.is_featured desc,case when x.is_featured then x.is_fictitious else false end asc,x.promotion_order asc nulls last,x.subscription_tier desc,x.organization_points desc nulls last,x.rank_distance asc nulls last,lower(x.organization),lower(x.title),x.id)
 from (select l.id,l.kind,l.title,l.organization,left(l.description,600) as description,l.city,l.state_code,l.modality,l.job_type,l.created_at,l.is_fictitious,(l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) as is_featured,case when (not l.is_fictitious and pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) then mod(row_number() over(partition by (not l.is_fictitious and pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) order by l.id)-1+floor(extract(epoch from statement_timestamp())/300)::bigint,count(*) over(partition by (not l.is_fictitious and pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)))) end as promotion_order,l.logo_data,
 dense_rank() over(order by (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) desc,pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) desc,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric desc nulls last) as presentation_group,
 pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) as subscription_tier,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric as organization_points,case when l.modality<>'Online' then pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) end as rank_distance,round((case when l.modality<>'Online' then pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) end)::numeric,1)::double precision as distance_km
 from public.portal_listings l join public.pilot_memberships m on m.user_id=l.publisher_id and m.cohort_id=l.cohort_id join auth.users u on u.id=m.user_id left join public.portal_postal_coordinates g on g.postal_code=l.postal_code and g.checked_at>statement_timestamp()-interval '30 days'
 where l.cohort_id=p_cohort and l.status='published' and m.status='active' and m.role in ('recruiter','school_staff')
 and (l.kind<>'job' or m.role='recruiter') and u.email_confirmed_at is not null and ((l.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (p_kind='all' or l.kind=p_kind or p_kind='learning' and l.kind in ('course','training'))
 and (coalesce(p_query,'')='' or l.title ilike '%'||left(p_query,100)||'%')
 order by (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) desc,case when (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) then l.is_fictitious else false end asc,promotion_order asc nulls last,subscription_tier desc,organization_points desc nulls last,rank_distance asc nulls last,lower(l.organization),lower(l.title),l.id offset p_page*p_size limit p_size)x),'[]');
end $function$;

-- public.portal_ordered_public_feed: preserve existing permissions on CREATE OR REPLACE.
CREATE OR REPLACE FUNCTION public.portal_ordered_public_feed(p_cohort uuid, p_kind text, p_query text DEFAULT ''::text, p_page integer DEFAULT 0, p_size integer DEFAULT 50)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$begin
 if p_kind is null or p_kind not in ('job','course','training','learning','all','candidates') or p_page is null or p_page not between 0 and 1000 or p_size is null or p_size not in (30,50) then raise exception 'Invalid feed request';end if;
 if p_kind='candidates' then
 return coalesce((select jsonb_agg(to_jsonb(x)-'promotion_order'-'subscription_tier'-'professional_points' order by x.is_featured desc,case when x.is_featured then x.is_fictitious else false end asc,x.promotion_order asc nulls last,x.subscription_tier desc,x.professional_points desc,lower(x.name),x.id)
 from (select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.updated_at,c.is_fictitious,(c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) as is_featured,case when (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) then mod(row_number() over(partition by (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) order by c.id)-1+floor(extract(epoch from statement_timestamp())/300)::bigint,count(*) over(partition by (not c.is_fictitious and pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)))) end as promotion_order,c.has_senai,case when c.show_card_image then c.photo_data else '' end as photo_data,c.show_card_image,
 dense_rank() over(order by (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) desc,pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') desc,pilot_private.public_professional_points(c.user_id,c.cohort_id) desc) as presentation_group,
 pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier,pilot_private.public_professional_points(c.user_id,c.cohort_id) as professional_points
 from public.portal_candidate_cards c join public.pilot_memberships m on m.user_id=c.user_id and m.cohort_id=c.cohort_id join auth.users u on u.id=m.user_id
 where c.cohort_id=p_cohort and c.visible and m.status='active' and m.role in ('learner','pilot_owner') and u.email_confirmed_at is not null
 and ((c.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%')
 order by (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) desc,case when (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) then c.is_fictitious else false end asc,promotion_order asc nulls last,subscription_tier desc,professional_points desc,lower(c.name),c.id offset p_page*p_size limit p_size)x),'[]');
 end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier'-'organization_points' order by x.is_featured desc,x.subscription_tier desc,x.organization_points desc nulls last,lower(x.organization),lower(x.title),x.id)
 from (select l.id,l.kind,l.title,l.organization,left(l.description,600) as description,l.city,l.state_code,l.modality,l.job_type,l.created_at,l.is_fictitious,(l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) as is_featured,case when (not l.is_fictitious and pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) then mod(row_number() over(partition by (not l.is_fictitious and pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) order by l.id)-1+floor(extract(epoch from statement_timestamp())/300)::bigint,count(*) over(partition by (not l.is_fictitious and pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)))) end as promotion_order,l.logo_data,
 dense_rank() over(order by (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) desc,pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) desc,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric desc nulls last) as presentation_group,
 pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) as subscription_tier,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric as organization_points
 from public.portal_listings l join public.pilot_memberships m on m.user_id=l.publisher_id and m.cohort_id=l.cohort_id join auth.users u on u.id=m.user_id
 where l.cohort_id=p_cohort and l.status='published' and m.status='active' and m.role in ('recruiter','school_staff')
 and (l.kind<>'job' or m.role='recruiter') and u.email_confirmed_at is not null and ((l.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (p_kind='all' or l.kind=p_kind or p_kind='learning' and l.kind in ('course','training'))
 and (coalesce(p_query,'')='' or l.title ilike '%'||left(p_query,100)||'%')
 order by (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) desc,case when (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) then l.is_fictitious else false end asc,promotion_order asc nulls last,subscription_tier desc,organization_points desc nulls last,lower(l.organization),lower(l.title),l.id offset p_page*p_size limit p_size)x),'[]');
end $function$;



notify pgrst, 'reload schema';
