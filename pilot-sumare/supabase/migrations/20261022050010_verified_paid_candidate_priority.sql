-- Internal paid-plan lookup. No caller-controlled selection or public billing disclosure.
create or replace function pilot_private.verified_paid_tier(p_user uuid,p_cohort uuid,p_profile text)
returns integer language sql stable security invoker set search_path='' as $$
 with orders as (
  select o.*,case o.cycle when 'MONTHLY' then 1 when 'QUARTERLY' then 3 when 'SEMIANNUALLY' then 6 when 'YEARLY' then 12 end as cycle_months,
   case o.cycle when 'MONTHLY' then 100 when 'QUARTERLY' then 90 when 'SEMIANNUALLY' then 80 when 'YEARLY' then 70 end as price_percent,
   case o.tier when 1 then 20 when 2 then 25 when 3 then 30 end as ai_percent,
   case when p_profile='Candidato' then case o.tier when 1 then 1990 when 2 then 4990 when 3 then 9990 end
    when p_profile in ('Empresa','Instituição de Ensino') then case o.tier when 1 then 9900 when 2 then 59900 when 3 then 299000 end end as monthly_cents
  from public.billing_live_orders o where o.user_id=p_user and o.cohort_id=p_cohort and o.profile_type=p_profile and o.tier between 1 and 3
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

-- Preserve the existing definer boundary, role guards, visible-card checks and projection.
-- It needs protected learning/billing reads; no additional public privileged function is exposed.
create or replace function pilot_private.search_scored_candidates(p_cohort uuid,p_query text,p_city text,p_senai boolean,p_page integer)
returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if auth.uid() is null or coalesce(pilot_private.portal_role(p_cohort),'') not in ('recruiter','school_staff','pilot_owner') then raise exception 'Busca de currículos indisponível para este perfil';end if;
 if p_page is null or p_page not between 0 and 1000 then raise exception 'Página inválida';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier' order by x.is_featured desc,x.subscription_tier desc,x.professional_points desc,lower(x.name),x.id)
 from (
  select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.is_fictitious,c.is_featured,c.demo_resume,c.has_senai,c.photo_data,c.show_card_image,
   pilot_private.learning_score(c.user_id,c.cohort_id) as professional_points,
   pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier
  from public.portal_candidate_cards c
  where c.cohort_id=p_cohort and c.visible and pilot_private.public_candidate_active(c.user_id,c.cohort_id)
   and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%' or c.skills ilike '%'||left(p_query,100)||'%')
   and (coalesce(p_city,'')='' or c.city ilike '%'||left(p_city,100)||'%') and (not coalesce(p_senai,false) or c.has_senai)
  order by c.is_featured desc,subscription_tier desc,professional_points desc,lower(c.name),c.id offset p_page*30 limit 30
 )x),'[]');
end $$;
revoke all on function pilot_private.search_scored_candidates(uuid,text,text,boolean,integer) from public,anon;
grant execute on function pilot_private.search_scored_candidates(uuid,text,text,boolean,integer) to authenticated;
notify pgrst,'reload schema';
