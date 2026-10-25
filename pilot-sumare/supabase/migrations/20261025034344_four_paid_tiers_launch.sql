-- Additive expansion; no existing order, payment, balance or subscription is changed.
alter table public.billing_live_orders drop constraint billing_live_orders_tier_check;
alter table public.billing_live_orders add constraint billing_live_orders_tier_check check(tier between 1 and 4);
alter table public.portal_plan_selections drop constraint portal_plan_selections_tier_check;
alter table public.portal_plan_selections add constraint portal_plan_selections_tier_check check(tier between 0 and 4);
alter table public.portal_oeo_learning drop constraint portal_oeo_learning_tier_check;
alter table public.portal_oeo_learning add constraint portal_oeo_learning_tier_check check(tier between 0 and 4);
-- Internal price books are versioned; existing contracts retain their original amounts.
create or replace function pilot_private.verified_paid_tier(p_user uuid,p_cohort uuid,p_profile text)
returns integer language sql stable security invoker set search_path='' as $$
 with orders as (
  select o.*,case o.cycle when 'MONTHLY' then 1 when 'QUARTERLY' then 3 when 'SEMIANNUALLY' then 6 when 'YEARLY' then 12 end as cycle_months,
   case o.cycle when 'MONTHLY' then 100 when 'QUARTERLY' then 90 when 'SEMIANNUALLY' then 80 when 'YEARLY' then 70 end as price_percent,
   case o.tier when 1 then 20 when 2 then 25 when 3 then 30 when 4 then 30 end as ai_percent,
   case when o.terms_version='2026-10-25-four-tiers-v1' then
    case when p_profile='Candidato' then case o.tier when 1 then 1990 when 2 then 3990 when 3 then 6990 when 4 then 9990 end
     when p_profile in ('Empresa','Instituição de Ensino') then case o.tier when 1 then 9990 when 2 then 29990 when 3 then 69990 when 4 then 99990 end end
   else
    case when p_profile='Candidato' then case o.tier when 1 then 1990 when 2 then 4990 when 3 then 9990 end
     when p_profile in ('Empresa','Instituição de Ensino') then case o.tier when 1 then 9900 when 2 then 59900 when 3 then 299000 end end
   end as monthly_cents
  from public.billing_live_orders o where o.user_id=p_user and o.cohort_id=p_cohort and o.profile_type=p_profile and o.tier between 1 and 4
 ), quotes as (
  select orders.*,round(monthly_cents::numeric*cycle_months*price_percent/100)::integer as expected_cents from orders
 )
 select coalesce(max(o.tier),0)::integer from quotes o join public.billing_live_payments p on p.order_id=o.id
 where p.eligible is true and p.period_start<=statement_timestamp() and p.period_end>statement_timestamp()
 and o.cents=o.expected_cents and p.cents=o.expected_cents
 and p.credit_cents=round(o.expected_cents::numeric*o.ai_percent/100)::integer
$$;
revoke all on function pilot_private.verified_paid_tier(uuid,uuid,text) from public,anon,authenticated;
grant execute on function pilot_private.verified_paid_tier(uuid,uuid,text) to service_role;

notify pgrst,'reload schema';
