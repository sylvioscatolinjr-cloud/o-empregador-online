-- Purchased credits pay services; subscription bonus credits remain IA-only.
-- No financial feature is enabled by applying this schema. Activation is separate and per cohort.
create table public.portal_wallet_rollout(
 cohort_id uuid primary key references public.pilot_cohorts(id),enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.portal_wallet_rollout enable row level security;
revoke all on public.portal_wallet_rollout from public,anon,authenticated;
grant select,insert,update on public.portal_wallet_rollout to service_role;
create function public.portal_wallet_require_enabled(p_cohort uuid) returns void
language plpgsql security invoker set search_path='' as $$begin
 if not exists(select 1 from public.portal_wallet_rollout where cohort_id=p_cohort and enabled) then raise exception 'wallet rollout disabled';end if;
end$$;
revoke all on function public.portal_wallet_require_enabled(uuid) from public,anon,authenticated;
grant execute on function public.portal_wallet_require_enabled(uuid) to service_role;
alter table public.billing_live_orders add column payment_source text not null default 'asaas' check(payment_source in('asaas','wallet'));
alter table public.billing_live_payments add column payment_source text not null default 'asaas' check(payment_source in('asaas','wallet'));
alter table public.portal_highlight_orders add column payment_source text not null default 'asaas' check(payment_source in('asaas','wallet'));
alter table public.portal_highlight_payments add column payment_source text not null default 'asaas' check(payment_source in('asaas','wallet'));
create table public.portal_wallet_purchases(
 id uuid primary key,user_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),
 kind text not null check(kind in('plan','highlight')),order_id uuid not null,cents integer not null check(cents>0),
 created_at timestamptz not null default now(),unique(kind,order_id,created_at)
);
create index wallet_purchases_actor on public.portal_wallet_purchases(user_id,cohort_id,created_at desc);
create table public.portal_wallet_purchase_lines(
 purchase_id uuid not null references public.portal_wallet_purchases(id),payment_id text not null references public.portal_ai_topup_payments(id),
 cents integer not null check(cents>0),primary key(purchase_id,payment_id)
);
create index wallet_purchase_payment on public.portal_wallet_purchase_lines(payment_id);
create table public.portal_wallet_subscriptions(
 order_id uuid primary key references public.billing_live_orders(id),next_due timestamptz not null,
 auto_renew boolean not null default true,reminded_for timestamptz,last_error text not null default '',
 terms_version text not null check(terms_version='2026-10-28-unified-wallet-v1'),accepted_at timestamptz not null default now()
);
do $$declare t text;begin foreach t in array array['portal_wallet_purchases','portal_wallet_purchase_lines','portal_wallet_subscriptions'] loop
 execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from public,anon,authenticated',t);execute format('grant all on public.%I to service_role',t);end loop;end$$;

create function public.portal_wallet_debit(p_user uuid,p_cohort uuid,p_request uuid,p_kind text,p_order uuid,p_cents integer) returns boolean
language plpgsql security invoker set search_path='' as $$declare b jsonb;remaining integer:=p_cents;t integer;pay record;existing public.portal_wallet_purchases;begin
 perform public.portal_wallet_require_enabled(p_cohort);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));
 perform public.portal_campaign_actor(p_user,p_cohort);
 select * into existing from public.portal_wallet_purchases where id=p_request;
 if found then if existing.user_id<>p_user or existing.cohort_id<>p_cohort or existing.kind<>p_kind or existing.order_id<>p_order or existing.cents<>p_cents then raise exception 'request mismatch';end if;return true;end if;
 if p_request is null or p_cents is null or p_cents<1 or p_kind not in('plan','highlight') then raise exception 'invalid purchase';end if;
 b:=public.portal_ai_wallet_balance(p_user,p_cohort);
 if coalesce((b->>'held')::boolean,true) or coalesce((b->>'purchasedCents')::integer,0)<p_cents then return false;end if;
 insert into public.portal_wallet_purchases(id,user_id,cohort_id,kind,order_id,cents) values(p_request,p_user,p_cohort,p_kind,p_order,p_cents);
 for pay in select p.id,p.cents-p.spent_cents as available from public.portal_ai_topup_payments p join public.portal_ai_topup_orders o on o.id=p.order_id where o.user_id=p_user and o.cohort_id=p_cohort and p.eligible and p.cents=o.cents and p.cents>p.spent_cents order by o.created_at,p.id for update of p loop
 t:=least(remaining,pay.available);update public.portal_ai_topup_payments set spent_cents=spent_cents+t where id=pay.id;
 insert into public.portal_wallet_purchase_lines values(p_request,pay.id,t);remaining:=remaining-t;exit when remaining=0;end loop;
 if remaining<>0 then raise exception 'wallet changed';end if;return true;
end$$;

create function public.portal_wallet_plan(p_user uuid,p_cohort uuid,p_request uuid,p_tier integer,p_cycle text,p_expected integer,p_terms text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare r text;profile text;months integer;discount integer;monthly integer;price integer;credit integer;ord uuid;purchase public.portal_wallet_purchases;finish timestamptz;b jsonb;begin
 perform public.portal_wallet_require_enabled(p_cohort);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));r:=public.portal_campaign_actor(p_user,p_cohort);
 if p_terms is distinct from '2026-10-28-unified-wallet-v1' then raise exception 'terms changed';end if;
 profile:=case r when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else 'Candidato' end;
 months:=case p_cycle when 'MONTHLY' then 1 when 'QUARTERLY' then 3 when 'SEMIANNUALLY' then 6 when 'YEARLY' then 12 end;
 discount:=case months when 1 then 0 when 3 then 10 when 6 then 20 when 12 then 30 end;
 monthly:=case when profile='Candidato' then case p_tier when 1 then 1990 when 2 then 3990 when 3 then 6990 when 4 then 9990 end else case p_tier when 1 then 9990 when 2 then 29990 when 3 then 69990 when 4 then 99990 end end;
 price:=round(monthly::numeric*months*(100-discount)/100)::integer;credit:=round(price::numeric*(case p_tier when 1 then 20 when 2 then 25 else 30 end)/100)::integer;
 if price is null or price is distinct from p_expected then raise exception 'price changed';end if;
 select * into purchase from public.portal_wallet_purchases where id=p_request;
 if found then
 if purchase.user_id<>p_user or purchase.cohort_id<>p_cohort or purchase.kind<>'plan' or purchase.cents<>price or not exists(select 1 from public.billing_live_orders where id=purchase.order_id and tier=p_tier and cycle=p_cycle and profile_type=profile) then raise exception 'request mismatch';end if;
 return jsonb_build_object('paid',true,'id',purchase.order_id,'duplicate',true);end if;
 if exists(select 1 from public.billing_live_orders where user_id=p_user and status in('creating','pending','active','review')) or exists(select 1 from public.billing_live_orders o join public.billing_live_payments p on p.order_id=o.id where o.user_id=p_user and ((p.eligible and p.period_end>now()) or (o.payment_source='asaas' and p.status in('PENDING','OVERDUE')))) then raise exception 'existing subscription; cancel previous renewal and wait for paid period';end if;
 if not exists(select 1 from public.portal_course_wishlists where user_id=p_user) then raise exception 'wishlist required';end if;
 b:=public.portal_ai_wallet_balance(p_user,p_cohort);
 if coalesce((b->>'held')::boolean,true) or (b->>'purchasedCents')::integer<price then return jsonb_build_object('paid',false,'requiredCents',price,'availableCents',case when (b->>'held')::boolean then 0 else (b->>'purchasedCents')::integer end,'missingCents',case when (b->>'held')::boolean then price else greatest(price-(b->>'purchasedCents')::integer,0) end);end if;
 insert into public.billing_live_orders(user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version,status,payment_source)
 values(p_user,p_cohort,profile,p_tier,p_cycle,price,credit,months,'2026-10-25-four-tiers-v1','active','wallet') returning id into ord;
 if not public.portal_wallet_debit(p_user,p_cohort,p_request,'plan',ord,price) then raise exception 'wallet changed';end if;
 finish:=now()+pg_catalog.make_interval(months=>months);
 insert into public.billing_live_payments(id,order_id,status,cents,period_start,period_end,credit_cents,eligible,checked_at,payment_source)
 values('wallet_'||p_request::text,ord,'WALLET_PAID',price,now(),finish,credit,true,now(),'wallet');
 insert into public.portal_wallet_subscriptions(order_id,next_due,terms_version) values(ord,finish,p_terms);
 return jsonb_build_object('paid',true,'id',ord,'nextDue',finish,'chargedCents',price);
end$$;

create function public.portal_wallet_highlight(p_user uuid,p_cohort uuid,p_request uuid,p_kind text,p_target uuid,p_days integer,p_tier integer,p_expected integer,p_terms text) returns jsonb
language plpgsql security invoker set search_path='' as $$declare q jsonb;b jsonb;ord uuid;purchase public.portal_wallet_purchases;begin
 perform public.portal_wallet_require_enabled(p_cohort);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));perform public.portal_campaign_actor(p_user,p_cohort);
 select * into purchase from public.portal_wallet_purchases where id=p_request;
 if found then if purchase.user_id<>p_user or purchase.cohort_id<>p_cohort or purchase.kind<>'highlight' or purchase.cents<>p_expected or not exists(select 1 from public.portal_highlight_orders where id=purchase.order_id and kind=p_kind and target_id=p_target and days=p_days) then raise exception 'request mismatch';end if;return jsonb_build_object('paid',true,'id',purchase.order_id,'duplicate',true);end if;
 b:=public.portal_ai_wallet_balance(p_user,p_cohort);
 if coalesce((b->>'held')::boolean,true) or (b->>'purchasedCents')::integer<p_expected then return jsonb_build_object('paid',false,'requiredCents',p_expected,'availableCents',case when (b->>'held')::boolean then 0 else (b->>'purchasedCents')::integer end,'missingCents',case when (b->>'held')::boolean then p_expected else greatest(p_expected-(b->>'purchasedCents')::integer,0) end);end if;
 q:=public.portal_highlight_create(p_user,p_cohort,p_kind,p_target,p_days,p_tier,p_expected,p_terms);ord:=(q->>'id')::uuid;
 if not public.portal_wallet_debit(p_user,p_cohort,p_request,'highlight',ord,(q->>'cents')::integer) then raise exception 'wallet changed';end if;
 update public.portal_highlight_orders set payment_source='wallet',status='confirmed',starts_at=now(),ends_at=now()+p_days*interval '1 day' where id=ord;
 insert into public.portal_highlight_payments(id,order_id,cents,status,eligible,checked_at,payment_source) values('pay_wallet_'||p_request::text,ord,p_expected,'WALLET_PAID',true,now(),'wallet');
 return jsonb_build_object('paid',true,'id',ord,'chargedCents',p_expected);
end$$;

create function public.portal_wallet_cancel(p_user uuid,p_cohort uuid,p_order uuid) returns void
language plpgsql security invoker set search_path='' as $$begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text,0));perform public.portal_campaign_actor(p_user,p_cohort);
 if not exists(select 1 from public.billing_live_orders where id=p_order and user_id=p_user and cohort_id=p_cohort and payment_source='wallet') then raise exception 'not your wallet subscription';end if;
 update public.portal_wallet_subscriptions set auto_renew=false where order_id=p_order;
 update public.billing_live_orders set status='canceled',canceled_at=now() where id=p_order;
end$$;

create function public.portal_wallet_renewals() returns integer
language plpgsql security invoker set search_path='' as $$
declare row record;contract public.portal_wallet_subscriptions;ord public.billing_live_orders;b jsonb;price integer;request uuid;finish timestamptz;done integer:=0;begin
 if not pg_catalog.pg_try_advisory_xact_lock(pg_catalog.hashtextextended('oeo-wallet-renewals',0)) then return 0;end if;
 for row in select s.order_id,o.user_id from public.portal_wallet_subscriptions s join public.billing_live_orders o on o.id=s.order_id join public.portal_wallet_rollout rollout on rollout.cohort_id=o.cohort_id and rollout.enabled where s.auto_renew and s.next_due<=now()+interval '24 hours' and (s.next_due<=now() or s.reminded_for is distinct from s.next_due) order by s.next_due limit 200 loop
 begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(row.user_id::text,0));
 select * into strict contract from public.portal_wallet_subscriptions where order_id=row.order_id for update;
 select * into strict ord from public.billing_live_orders where id=row.order_id for update;
 if not contract.auto_renew or ord.payment_source<>'wallet' or ord.status<>'active' or ord.subscription_id is not null then continue;end if;
 if (ord.profile_type='Empresa' and public.portal_campaign_actor(ord.user_id,ord.cohort_id)<>'recruiter') or (ord.profile_type='Instituição de Ensino' and public.portal_campaign_actor(ord.user_id,ord.cohort_id)<>'school_staff') or (ord.profile_type='Candidato' and public.portal_campaign_actor(ord.user_id,ord.cohort_id) not in('learner','pilot_owner')) then raise exception 'profile changed';end if;
 b:=public.portal_ai_wallet_balance(ord.user_id,ord.cohort_id);price:=ord.cents;
 if contract.next_due>now() then
 if (coalesce((b->>'held')::boolean,true) or (b->>'purchasedCents')::integer<price) and contract.reminded_for is distinct from contract.next_due then
 insert into public.portal_notifications(cohort_id,user_id,title,body,access_url) values(ord.cohort_id,ord.user_id,'Renovação amanhã: confira o saldo','Sua renovação de R$ '||round(price::numeric/100,2)::text||' exige saldo comprado. Faltam R$ '||round(greatest(price-(case when (b->>'held')::boolean then 0 else (b->>'purchasedCents')::integer end),0)::numeric/100,2)::text||'. Recarregue antes do vencimento.','https://www.oempregadoronline.com.br/carteira.html');
 end if;update public.portal_wallet_subscriptions set reminded_for=contract.next_due where order_id=ord.id;continue;end if;
 -- A scheduler outage never debits several historical cycles at once.
 if contract.next_due<now()-interval '24 hours' then
 update public.portal_wallet_subscriptions set auto_renew=false,last_error='Renovação atrasada; reconfirme a contratação.' where order_id=ord.id;
 update public.billing_live_orders set status='canceled',canceled_at=now() where id=ord.id;continue;end if;
 request:=gen_random_uuid();
 if public.portal_wallet_debit(ord.user_id,ord.cohort_id,request,'plan',ord.id,price) then
 finish:=contract.next_due+pg_catalog.make_interval(months=>ord.months);
 insert into public.billing_live_payments(id,order_id,status,cents,period_start,period_end,credit_cents,eligible,checked_at,payment_source) values('wallet_'||request::text,ord.id,'WALLET_PAID',price,contract.next_due,finish,ord.credit_cents,true,now(),'wallet');
 update public.portal_wallet_subscriptions set next_due=finish,reminded_for=null,last_error='' where order_id=ord.id;
 insert into public.portal_notifications(cohort_id,user_id,title,body) values(ord.cohort_id,ord.user_id,'Plano renovado pela carteira','Débito de R$ '||round(price::numeric/100,2)::text||' concluído. Confira o período em Minha assinatura.');done:=done+1;
 else
 update public.portal_wallet_subscriptions set auto_renew=false,last_error='Saldo insuficiente no vencimento; recarregue e contrate novamente.' where order_id=ord.id;
 update public.billing_live_orders set status='canceled',canceled_at=now() where id=ord.id;
 insert into public.portal_notifications(cohort_id,user_id,title,body,access_url) values(ord.cohort_id,ord.user_id,'Plano não renovado: saldo insuficiente','Nenhum débito feito. O período pago terminou. Recarregue e confirme uma nova contratação para reativar.','https://www.oempregadoronline.com.br/assinatura.html');
 end if;
 exception when others then update public.portal_wallet_subscriptions set auto_renew=false,last_error='Falha de renovação; atendimento deve conferir antes de reativar.' where order_id=row.order_id;end;
 end loop;return done;
end$$;

-- Reversed topups revoke the services funded by those credits, without fabricating a refund.
create function public.portal_wallet_revoke_funding() returns trigger language plpgsql security invoker set search_path='' as $$begin
 if old.eligible and not new.eligible then
 update public.billing_live_payments p set eligible=false where p.payment_source='wallet' and p.id in(select 'wallet_'||w.id::text from public.portal_wallet_purchases w join public.portal_wallet_purchase_lines l on l.purchase_id=w.id where l.payment_id=new.id and w.kind='plan');
 update public.portal_highlight_payments p set eligible=false where p.payment_source='wallet' and p.id in(select 'pay_wallet_'||w.id::text from public.portal_wallet_purchases w join public.portal_wallet_purchase_lines l on l.purchase_id=w.id where l.payment_id=new.id and w.kind='highlight');
 update public.portal_wallet_subscriptions set auto_renew=false,last_error='Recarga estornada ou contestada; conferência necessária.' where order_id in(select w.order_id from public.portal_wallet_purchases w join public.portal_wallet_purchase_lines l on l.purchase_id=w.id where l.payment_id=new.id and w.kind='plan');
 end if;return new;end$$;
create trigger portal_wallet_revoke_funding after update of eligible on public.portal_ai_topup_payments for each row execute function public.portal_wallet_revoke_funding();
-- Wallet-funded quarterly cycles count once, and reverse when their funding is revoked.
do $outer$begin if to_regclass('public.portal_affiliate_referrals') is not null then execute $sql$
 create or replace function public.portal_affiliate_count(p_user uuid,p_cohort uuid) returns bigint language sql stable security invoker set search_path='' as $body$
 select count(distinct p.id) from public.portal_affiliate_referrals r join public.billing_live_orders o on o.user_id=r.user_id and o.cohort_id=r.cohort_id and o.created_at>=r.created_at join public.billing_live_payments p on p.order_id=o.id join public.pilot_memberships m on m.user_id=r.affiliate_id and m.cohort_id=r.cohort_id
 where r.affiliate_id=p_user and r.cohort_id=p_cohort and o.cycle='QUARTERLY' and p.eligible and p.cents=o.cents and (p.status in('CONFIRMED','RECEIVED') or (p.status='WALLET_PAID' and p.payment_source='wallet')) and m.status='active' and not m.is_fictitious
 $body$; $sql$;end if;end$outer$;
do $$declare sig text;begin foreach sig in array array['portal_wallet_debit(uuid,uuid,uuid,text,uuid,integer)','portal_wallet_plan(uuid,uuid,uuid,integer,text,integer,text)','portal_wallet_highlight(uuid,uuid,uuid,text,uuid,integer,integer,integer,text)','portal_wallet_cancel(uuid,uuid,uuid)','portal_wallet_renewals()','portal_wallet_revoke_funding()'] loop execute 'revoke all on function public.'||sig||' from public,anon,authenticated';execute 'grant execute on function public.'||sig||' to service_role';end loop;end$$;
