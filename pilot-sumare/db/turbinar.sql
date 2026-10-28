-- Paid inbox campaigns: service-only, no direct browser access or SECURITY DEFINER.
create table public.portal_campaign_preferences(
 user_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id),
 enabled boolean not null default false, topics text[] not null default '{}',
 updated_at timestamptz not null default now(), primary key(user_id,cohort_id),
 check(topics <@ array['industry','technology','administration','languages','services']::text[])
);
create table public.portal_campaigns(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),
 cohort_id uuid not null references public.pilot_cohorts(id),listing_id uuid references public.portal_listings(id),
 title text not null check(length(title) between 1 and 160),body text not null check(length(body) between 1 and 4000),
 access_url text not null default '' check(length(access_url)<=2000 and (access_url='' or access_url ~ '^https://[^[:space:]]+$' and access_url !~ '^https://[^/?#]*@')),
 attachment_id uuid references public.portal_notice_attachments(id),filters jsonb not null,
 status text not null default 'quoted' check(status in('quoted','pending','approved','rejected','sent','canceled')),
 quoted_count integer not null default 0 check(quoted_count between 0 and 1000),
 quoted_cents integer not null default 0 check(quoted_cents=quoted_count*5),
 charged_cents integer not null default 0 check(charged_cents>=0 and charged_cents<=quoted_cents),
 created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '7 days',
 submitted_at timestamptz,reviewed_at timestamptz,reviewed_by uuid references auth.users(id),
 reason text not null default '' check(length(reason)<=500),sent_at timestamptz,
 terms_version text not null default '2026-10-28-turbinar-v1'
);
create table public.portal_campaign_consent_events(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id),enabled boolean not null,topics text[] not null,
 version text not null default '2026-10-28-turbinar-v1',created_at timestamptz not null default now()
);
create index portal_campaigns_owner on public.portal_campaigns(user_id,cohort_id,created_at desc);
create index portal_campaigns_review on public.portal_campaigns(cohort_id,created_at) where status='pending';
create table public.portal_campaign_recipients(
 campaign_id uuid not null references public.portal_campaigns(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 notification_id uuid references public.portal_notifications(id),primary key(campaign_id,user_id)
);
create index campaign_notification on public.portal_campaign_recipients(notification_id) where notification_id is not null;
create table public.portal_campaign_debits(
 campaign_id uuid not null references public.portal_campaigns(id),
 payment_id text not null references public.portal_ai_topup_payments(id),
 cents integer not null check(cents>0),primary key(campaign_id,payment_id)
);
do $$declare t text;begin foreach t in array array['portal_campaign_preferences','portal_campaign_consent_events','portal_campaigns','portal_campaign_recipients','portal_campaign_debits'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select,insert,update,delete on public.%I to service_role',t);
end loop;end $$;

create function public.portal_campaign_actor(p_user uuid,p_cohort uuid) returns text
language plpgsql security invoker set search_path='' as $$declare r text;begin
 select m.role into r from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.user_id=p_user and m.cohort_id=p_cohort and m.status='active' and not m.is_fictitious
 and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now());
 if r is null then raise exception 'campaign unauthorized';end if;return r;
end $$;

create function public.portal_campaign_preference(p_user uuid,p_cohort uuid,p_enabled boolean,p_topics text[]) returns void
language plpgsql security invoker set search_path='' as $$begin
 perform public.portal_campaign_actor(p_user,p_cohort);
 if p_enabled is null or p_topics is null or cardinality(p_topics)>5 or not(p_topics <@ array['industry','technology','administration','languages','services']::text[]) then raise exception 'invalid preference';end if;
 if p_enabled and not exists(select 1 from public.pilot_memberships where user_id=p_user and cohort_id=p_cohort and age_band='18_plus') then raise exception 'adult campaigns only';end if;
 -- Match sends and opt-out on the same cohort lock; consent cannot change mid-delivery.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('campaign-consent:'||p_cohort::text,0));
 insert into public.portal_campaign_preferences(user_id,cohort_id,enabled,topics) values(p_user,p_cohort,p_enabled,p_topics)
 on conflict(user_id,cohort_id) do update set enabled=excluded.enabled,topics=excluded.topics,updated_at=now();
 insert into public.portal_campaign_consent_events(user_id,cohort_id,enabled,topics) values(p_user,p_cohort,p_enabled,p_topics);
end $$;

create function public.portal_campaign_audience(p_cohort uuid,p_sender uuid,p_filters jsonb) returns setof uuid
language sql stable security invoker set search_path='' as $$
 select distinct m.user_id from public.pilot_memberships m
 join auth.users u on u.id=m.user_id
 join public.portal_campaign_preferences pref on pref.user_id=m.user_id and pref.cohort_id=m.cohort_id and pref.enabled
 left join public.pilot_profiles p on p.user_id=m.user_id and m.role in('learner','pilot_owner')
 left join public.portal_organizations o on o.user_id=m.user_id and o.cohort_id=m.cohort_id and m.role in('recruiter','school_staff')
 where m.cohort_id=p_cohort and m.user_id<>p_sender and m.status='active' and not m.is_fictitious and m.age_band='18_plus'
 and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now())
 and (p_filters->>'role'='all' or m.role=p_filters->>'role')
 and (p_filters->>'state'='' or upper(coalesce(o.state_code,p.state_code))=p_filters->>'state')
 and (p_filters->>'city'='' or lower(coalesce(o.city,p.city))=lower(p_filters->>'city'))
 and (p_filters->>'topic'='' or p_filters->>'topic'=any(pref.topics));
$$;

create function public.portal_campaign_quote(p_user uuid,p_cohort uuid,p_content jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare r text;f jsonb:=p_content->'filters';n uuid;listing uuid;asset uuid;cnt integer;
begin
 r:=public.portal_campaign_actor(p_user,p_cohort);
 if r not in('recruiter','school_staff','pilot_owner') then raise exception 'publisher only';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 if f is null or coalesce(f->>'role','') not in('all','learner','recruiter','school_staff')
 or f->>'state' is null or (f->>'state'<>'' and f->>'state' !~ '^[A-Z]{2}$')
 or f->>'city' is null or length(f->>'city')>100
 or coalesce(f->>'topic','invalid') not in('','industry','technology','administration','languages','services') then raise exception 'invalid filters';end if;
 f:=jsonb_build_object('role',f->>'role','state',f->>'state','city',f->>'city','topic',f->>'topic');
 if (select count(*) from public.portal_campaigns where user_id=p_user and created_at>now()-interval '1 day')>=20 then raise exception 'campaign daily limit';end if;
 listing:=nullif(p_content->>'listing_id','')::uuid;asset:=nullif(p_content->>'attachment_id','')::uuid;
 if listing is not null and not exists(select 1 from public.portal_listings where id=listing and publisher_id=p_user and cohort_id=p_cohort and status='published' and not is_fictitious) then raise exception 'own published listing required';end if;
 if asset is not null then
 -- Reserve the private material so the generic stale-upload cleanup cannot delete a pending campaign.
 update public.portal_notice_attachments set status='used' where id=asset and created_by=p_user and cohort_id=p_cohort and status='ready' and file_type in('png','jpg','pdf') and byte_size<=3145728 and created_at>now()-interval '24 hours';
 if not found then raise exception 'invalid campaign attachment';end if;end if;
 insert into public.portal_campaigns(user_id,cohort_id,listing_id,title,body,access_url,attachment_id,filters)
 values(p_user,p_cohort,listing,btrim(p_content->>'title'),btrim(p_content->>'body'),coalesce(p_content->>'access_url',''),asset,f) returning id into n;
 select count(*) into cnt from public.portal_campaign_audience(p_cohort,p_user,f);
 if cnt>1000 then raise exception 'audience exceeds 1000; narrow filters';end if;
 insert into public.portal_campaign_recipients(campaign_id,user_id) select n,x from public.portal_campaign_audience(p_cohort,p_user,f) x;
 get diagnostics cnt=row_count;
 update public.portal_campaigns set quoted_count=cnt,quoted_cents=cnt*5 where id=n;return n;
end $$;

create function public.portal_campaign_send(p_actor uuid,p_cohort uuid,p_id uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare c public.portal_campaigns;r text;b jsonb;available integer;cnt integer;need integer;remaining integer;take integer;pay record;recipient record;n uuid;filename text;
begin
 r:=public.portal_campaign_actor(p_actor,p_cohort);
 -- Wallet lock is identical to the AI/topup lock, preventing cross-resource double spending.
 select * into c from public.portal_campaigns where id=p_id and cohort_id=p_cohort;
 if c.id is null or (c.user_id<>p_actor and r<>'pilot_owner') then raise exception 'campaign unauthorized';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(c.user_id::text,0));
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('campaign-consent:'||p_cohort::text,0));
 select * into strict c from public.portal_campaigns where id=p_id for update;
 if c.status='sent' then return jsonb_build_object('status','sent','chargedCents',c.charged_cents,'count',c.charged_cents/5,'duplicate',true);end if;
 if c.status<>'approved' then raise exception 'approval required';end if;
 if c.expires_at<=now() then raise exception 'campaign expired; create another';end if;
 if public.portal_campaign_actor(c.user_id,p_cohort) not in('recruiter','school_staff','pilot_owner') then raise exception 'publisher only';end if;
 if c.listing_id is not null and not exists(select 1 from public.portal_listings where id=c.listing_id and cohort_id=p_cohort and publisher_id=c.user_id and status='published' and not is_fictitious) then raise exception 'listing unavailable';end if;
 select count(*) into cnt from public.portal_campaign_recipients cr where cr.campaign_id=c.id and cr.user_id in(select public.portal_campaign_audience(p_cohort,c.user_id,c.filters));
 need:=cnt*5;b:=public.portal_ai_wallet_balance(c.user_id,p_cohort);
 available:=case when coalesce((b->>'held')::boolean,true) then 0 else (b->>'purchasedCents')::integer end;
 if cnt=0 then return jsonb_build_object('status','approved','count',0,'requiredCents',0,'availableCents',available,'message','Nenhum destinatário elegível no público aprovado. Nada cobrado.');end if;
 if available<need then return jsonb_build_object('status','approved','count',cnt,'requiredCents',need,'availableCents',available,'missingCents',need-available,'message','Saldo insuficiente. Recarregue e clique em Enviar novamente.');end if;
 remaining:=need;
 for pay in select p.id,p.cents-p.spent_cents as balance from public.portal_ai_topup_payments p join public.portal_ai_topup_orders o on o.id=p.order_id
 where o.user_id=c.user_id and o.cohort_id=p_cohort and p.eligible and p.cents=o.cents and p.cents>p.spent_cents order by o.created_at,p.id for update of p loop
 take:=least(remaining,pay.balance);update public.portal_ai_topup_payments set spent_cents=spent_cents+take where id=pay.id;
 insert into public.portal_campaign_debits(campaign_id,payment_id,cents) values(c.id,pay.id,take);remaining:=remaining-take;exit when remaining=0;end loop;
 if remaining<>0 then raise exception 'wallet changed';end if;
 select a.filename into filename from public.portal_notice_attachments a where a.id=c.attachment_id and a.status='used';
 if c.attachment_id is not null and filename is null then raise exception 'attachment unavailable';end if;
 for recipient in select cr.user_id from public.portal_campaign_recipients cr where cr.campaign_id=c.id and cr.user_id in(select public.portal_campaign_audience(p_cohort,c.user_id,c.filters)) loop
 insert into public.portal_notifications(cohort_id,user_id,title,body,listing_id,access_url,attachment_id,attachment_name)
 values(p_cohort,recipient.user_id,'Patrocinado · '||left(c.title,140),c.body,c.listing_id,c.access_url,c.attachment_id,coalesce(filename,'')) returning id into n;
 update public.portal_campaign_recipients set notification_id=n where campaign_id=c.id and user_id=recipient.user_id;
 end loop;
 update public.portal_campaigns set status='sent',charged_cents=need,sent_at=now() where id=c.id;
 return jsonb_build_object('status','sent','count',cnt,'chargedCents',need,'message','Campanha entregue na central de avisos.');
 -- Any error rolls back debits AND deliveries. No provider messages are sent by this RPC.
end $$;

create function public.portal_campaign_action(p_user uuid,p_cohort uuid,p_id uuid,p_action text,p_reason text default '',p_cents integer default null) returns jsonb
language plpgsql security invoker set search_path='' as $$declare r text;c public.portal_campaigns;begin
 r:=public.portal_campaign_actor(p_user,p_cohort);
 -- Same lock order as send, including when approval auto-attempts delivery.
 select * into c from public.portal_campaigns where id=p_id and cohort_id=p_cohort;
 if c.id is null or (c.user_id<>p_user and r<>'pilot_owner') then raise exception 'campaign unauthorized';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(c.user_id::text,0));
 select * into strict c from public.portal_campaigns where id=p_id for update;
 if p_action='send' then
 if c.user_id<>p_user then raise exception 'sender only';end if;
 return public.portal_campaign_send(p_user,p_cohort,p_id);
 elsif p_action='submit' then
 if c.user_id<>p_user or c.status not in('quoted','pending') then raise exception 'invalid campaign state';end if;
 if c.status='pending' then return jsonb_build_object('status','pending');end if;
 if c.created_at<now()-interval '15 minutes' or c.quoted_count=0 or p_cents is distinct from c.quoted_cents then raise exception 'quote expired or invalid';end if;
 update public.portal_campaigns set status='pending',submitted_at=now() where id=c.id;
 elsif p_action in('approve','reject') then
 if r<>'pilot_owner' then raise exception 'owner only';end if;
 if p_action='approve' and c.status in('approved','sent') then return jsonb_build_object('status',c.status);end if;
 if c.status<>'pending' or c.expires_at<=now() then raise exception 'invalid campaign state';end if;
 if p_action='reject' and length(btrim(p_reason)) not between 3 and 500 then raise exception 'rejection reason required';end if;
 update public.portal_campaigns set status=case p_action when 'approve' then 'approved' else 'rejected' end,reason=case when p_action='reject' then btrim(p_reason) else '' end,reviewed_by=p_user,reviewed_at=now() where id=c.id;
 if p_action='approve' then return public.portal_campaign_send(p_user,p_cohort,c.id);end if;
 elsif p_action='cancel' and c.user_id=p_user and c.status in('quoted','pending','approved') then
 update public.portal_campaigns set status='canceled' where id=c.id;
 else raise exception 'invalid campaign action';end if;
 return jsonb_build_object('ok',true);
end $$;
do $$declare sig text;begin foreach sig in array array[
 'portal_campaign_actor(uuid,uuid)','portal_campaign_preference(uuid,uuid,boolean,text[])','portal_campaign_audience(uuid,uuid,jsonb)',
 'portal_campaign_quote(uuid,uuid,jsonb)','portal_campaign_send(uuid,uuid,uuid)','portal_campaign_action(uuid,uuid,uuid,text,text,integer)'] loop
 execute 'revoke all on function public.'||sig||' from public,anon,authenticated';execute 'grant execute on function public.'||sig||' to service_role';end loop;end $$;
