alter table public.portal_ai_wallet_lines drop constraint portal_ai_wallet_lines_cents_check;
alter table public.portal_ai_wallet_lines add constraint portal_ai_wallet_lines_cents_check check(cents between 1 and 500);

create or replace function public.portal_ai_wallet_reserve_cost(p_user uuid,p_cohort uuid,p_request uuid,p_cost integer) returns integer
language plpgsql security invoker set search_path='' as $$
declare b jsonb; left_cents integer:=p_cost; take_cents integer; row record; r text;
begin
 if p_cost is null or p_cost not in(100,250,500) then raise exception 'invalid execution cost';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 b:=public.portal_ai_wallet_balance(p_user,p_cohort);
 if (b->>'availableCents')::integer<p_cost then raise exception 'insufficient paid credits';end if;
 if p_request is null or exists(select 1 from public.portal_ai_wallet_usage where request_id=p_request) then raise exception 'duplicate request';end if;
 insert into public.portal_ai_wallet_usage(request_id,user_id,cohort_id) values(p_request,p_user,p_cohort);
 select role into r from public.pilot_memberships where user_id=p_user and cohort_id=p_cohort;
 -- Consume expiring subscription credits before purchased credits, including fractions.
 for row in select p.id,p.credit_cents-p.spent_cents as available from public.billing_live_payments p join public.billing_live_orders o on o.id=p.order_id
 where o.user_id=p_user and o.cohort_id=p_cohort and o.profile_type=case r when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else 'Candidato' end
 and p.eligible and p.cents=o.cents and p.credit_cents=o.credit_cents and p.period_start<=now() and p.period_end>now() and p.credit_cents>p.spent_cents
 order by p.period_end,p.id for update of p loop
 take_cents:=least(left_cents,row.available);
 update public.billing_live_payments set spent_cents=spent_cents+take_cents where id=row.id;
 insert into public.portal_ai_wallet_lines(request_id,subscription_payment_id,cents) values(p_request,row.id,take_cents);
 left_cents:=left_cents-take_cents;exit when left_cents=0;
 end loop;
 if left_cents>0 then
 for row in select p.id,p.cents-p.spent_cents as available from public.portal_ai_topup_payments p join public.portal_ai_topup_orders o on o.id=p.order_id
 where o.user_id=p_user and o.cohort_id=p_cohort and p.eligible and p.cents=o.cents and p.cents>p.spent_cents order by o.created_at,p.id for update of p loop
 take_cents:=least(left_cents,row.available);
 update public.portal_ai_topup_payments set spent_cents=spent_cents+take_cents where id=row.id;
 insert into public.portal_ai_wallet_lines(request_id,topup_payment_id,cents) values(p_request,row.id,take_cents);
 left_cents:=left_cents-take_cents;exit when left_cents=0;
 end loop;end if;
 if left_cents<>0 then raise exception 'insufficient paid credits';end if;
 b:=public.portal_ai_wallet_balance(p_user,p_cohort);return (b->>'availableCents')::integer;
end $$;

revoke all on function public.portal_ai_wallet_reserve_cost(uuid,uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.portal_ai_wallet_reserve_cost(uuid,uuid,uuid,integer) to service_role;

create table public.portal_ai_image_jobs(
 id uuid primary key,user_id uuid not null references auth.users(id) on delete cascade,cohort_id uuid not null references public.pilot_cohorts(id) on delete cascade,
 profile_role text not null check(profile_role in('learner','recruiter','school_staff')),
 quality text not null check(quality in('medium','high')),ratio text not null check(ratio in('1:1','4:5','9:16','16:9')),
 cents integer not null check(cents in(250,500)),owner_testing boolean not null,
 status text not null default 'processing' check(status in('processing','completed','failed','review','deleted')),
 storage_path text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(cents=case quality when 'high' then 500 else 250 end)
);
create unique index portal_ai_image_one_open on public.portal_ai_image_jobs(user_id,cohort_id) where status in('processing','review');
create index portal_ai_image_own_recent on public.portal_ai_image_jobs(user_id,cohort_id,profile_role,created_at desc);
alter table public.portal_ai_image_jobs enable row level security;
revoke all on public.portal_ai_image_jobs from public,anon,authenticated;
grant select,insert,update,delete on public.portal_ai_image_jobs to service_role;
create function public.portal_ai_image_reserve(p_user uuid,p_cohort uuid,p_id uuid,p_role text,p_quality text,p_ratio text,p_owner boolean) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare j public.portal_ai_image_jobs;m public.pilot_memberships;cost integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 select * into m from public.pilot_memberships where user_id=p_user and cohort_id=p_cohort;
 if m.status is distinct from 'active' or m.is_fictitious or (p_owner and m.role<>'pilot_owner') or (not p_owner and m.role<>p_role) or p_owner is null then raise exception 'unauthorized actor';end if;
 if not exists(select 1 from auth.users where id=p_user and email_confirmed_at is not null and (banned_until is null or banned_until<=now())) then raise exception 'unauthorized actor';end if;
 if p_quality not in('medium','high') or p_quality is null or p_ratio not in('1:1','4:5','9:16','16:9') or p_ratio is null or p_role not in('learner','recruiter','school_staff') or p_role is null then raise exception 'invalid options';end if;
 select * into j from public.portal_ai_image_jobs where id=p_id;
 if found then
 if j.user_id<>p_user or j.cohort_id<>p_cohort or j.profile_role<>p_role or j.quality<>p_quality or j.ratio<>p_ratio or j.owner_testing<>p_owner then raise exception 'request mismatch';end if;
 return jsonb_build_object('isNew',false,'job',to_jsonb(j));end if;
 cost:=case p_quality when 'high' then 500 else 250 end;
 insert into public.portal_ai_image_jobs(id,user_id,cohort_id,profile_role,quality,ratio,cents,owner_testing) values(p_id,p_user,p_cohort,p_role,p_quality,p_ratio,cost,p_owner) returning * into j;
 if p_owner then perform public.portal_owner_test_reserve(p_user,p_cohort);else perform public.portal_ai_wallet_reserve_cost(p_user,p_cohort,p_id,cost);end if;
 return jsonb_build_object('isNew',true,'job',to_jsonb(j));
end $$;
create function public.portal_ai_image_fail(p_user uuid,p_cohort uuid,p_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare j public.portal_ai_image_jobs;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 select * into j from public.portal_ai_image_jobs where id=p_id and user_id=p_user and cohort_id=p_cohort for update;
 if not found or j.status<>'processing' then raise exception 'invalid job';end if;
 if not j.owner_testing then perform public.portal_ai_wallet_refund(p_user,p_cohort,p_id);end if;
 update public.portal_ai_image_jobs set status='failed',updated_at=now() where id=p_id;
end $$;
revoke all on function public.portal_ai_image_reserve(uuid,uuid,uuid,text,text,text,boolean) from public,anon,authenticated;
revoke all on function public.portal_ai_image_fail(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_ai_image_reserve(uuid,uuid,uuid,text,text,text,boolean),public.portal_ai_image_fail(uuid,uuid,uuid) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('oeo-ai-images','oeo-ai-images',false,8388608,array['image/png']) on conflict(id) do update set public=false,file_size_limit=8388608,allowed_mime_types=array['image/png'];
