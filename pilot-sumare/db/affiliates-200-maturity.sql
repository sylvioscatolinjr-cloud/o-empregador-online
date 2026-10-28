-- Regra de 28/10/2026 (pedido do titular): candidatos recebem R$ 200 por Pix a cada 200 pagamentos válidos
-- de planos trimestrais dos indicados; empresas e instituições mantêm o equipamento de até R$ 4.000 a cada 1.000. Um pagamento só conta 30 dias depois de confirmado
-- e sai da contagem se a assinatura for cancelada, estornada ou contestada nesse prazo.
-- A carência e a retirada por cancelamento valem para os três perfis.
alter table public.portal_affiliate_claims drop constraint if exists portal_affiliate_claims_prize_cents_check;
alter table public.portal_affiliate_claims alter column prize_cents set default 20000;
alter table public.portal_affiliate_claims add constraint portal_affiliate_claims_prize_cents_check check(prize_cents in (20000,400000));
alter table public.portal_affiliate_claims add column if not exists goal integer not null default 1000 check(goal in (200,1000));

-- p_matured=true: pagamentos com 30 dias completos; false: pagamentos ainda em carência.
create or replace function public.portal_affiliate_payments(p_user uuid,p_cohort uuid,p_matured boolean) returns bigint language sql stable security invoker set search_path='' as $$
 select count(distinct p.id) from public.portal_affiliate_referrals r
 join public.billing_live_orders o on o.user_id=r.user_id and o.cohort_id=r.cohort_id and o.created_at>=r.created_at
 join public.billing_live_payments p on p.order_id=o.id
 join public.pilot_memberships m on m.user_id=r.affiliate_id and m.cohort_id=r.cohort_id
 cross join lateral (select coalesce(p.provider_paid_on::timestamptz,p.period_start) as paid_at) d
 where r.affiliate_id=p_user and r.cohort_id=p_cohort and o.cycle='QUARTERLY' and p.eligible and p.cents=o.cents
 and p.status in ('CONFIRMED','RECEIVED') and m.status='active' and not m.is_fictitious
 and coalesce(least(o.canceled_at,o.cancel_requested_at),'infinity'::timestamptz)>d.paid_at+interval '30 days'
 and (d.paid_at+interval '30 days'<=statement_timestamp())=p_matured$$;
create or replace function public.portal_affiliate_count(p_user uuid,p_cohort uuid) returns bigint language sql stable security invoker set search_path='' as $$select public.portal_affiliate_payments(p_user,p_cohort,true)$$;

create or replace function public.portal_affiliate_claim(p_user uuid,p_cohort uuid,p_email text,p_milestone integer) returns uuid language plpgsql security invoker set search_path='' as $$declare n bigint;used bigint;claims bigint;goal_n integer;rid uuid;r text;nm text;begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 select m.role,p.display_name into r,nm from public.pilot_memberships m join public.pilot_profiles p on p.user_id=m.user_id where m.user_id=p_user and m.cohort_id=p_cohort and m.status='active' and not m.is_fictitious and m.role in ('learner','recruiter','school_staff');
 if r is null then raise exception 'Perfil indisponível.';end if;
 select id into rid from public.portal_affiliate_claims where user_id=p_user and milestone=p_milestone;if rid is not null then return rid;end if;
 n=public.portal_affiliate_count(p_user,p_cohort);
 -- Pagamentos já usados em resgates anteriores, inclusive os da regra antiga.
 select count(*),coalesce(sum(goal),0) into claims,used from public.portal_affiliate_claims where user_id=p_user and cohort_id=p_cohort;
 goal_n=case when r='learner' then 200 else 1000 end;
 if p_milestone<>claims+1 or n<used+goal_n then raise exception 'A meta para um novo resgate ainda não foi atingida.';end if;
 insert into public.portal_affiliate_claims(user_id,cohort_id,milestone,role,name,email,prize_cents,goal) values(p_user,p_cohort,p_milestone,r,coalesce(nm,'Afiliado'),p_email,case when r='learner' then 20000 else 400000 end,goal_n) returning id into rid;
 insert into public.portal_notifications(cohort_id,user_id,title,body) select p_cohort,m.user_id,'Solicitação de premiação de afiliado','Resgate '||case when r='learner' then 'de R$ 200,00 por Pix' else 'de equipamento de até R$ 4.000,00' end||' solicitado. Acesse Programa de afiliados no painel do proprietário para conferir os dados e entrar em contato. Referência: '||rid::text from public.pilot_memberships m where m.cohort_id=p_cohort and m.role='pilot_owner' and m.status='active';
 return rid;
end$$;
revoke all on function public.portal_affiliate_payments(uuid,uuid,boolean),public.portal_affiliate_count(uuid,uuid),public.portal_affiliate_claim(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.portal_affiliate_payments(uuid,uuid,boolean),public.portal_affiliate_count(uuid,uuid),public.portal_affiliate_claim(uuid,uuid,text,integer) to service_role;
