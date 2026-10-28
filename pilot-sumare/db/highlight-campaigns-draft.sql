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
