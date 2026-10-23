alter table public.portal_ai_wallet_lines drop constraint portal_ai_wallet_lines_cents_check;
alter table public.portal_ai_wallet_lines add constraint portal_ai_wallet_lines_cents_check check(cents between 1 and 250);

create or replace function public.portal_ai_wallet_reserve_cost(p_user uuid,p_cohort uuid,p_request uuid,p_cost integer) returns integer
language plpgsql security invoker set search_path='' as $$
declare b jsonb; left_cents integer:=p_cost; take_cents integer; row record; r text;
begin
 if p_cost is null or p_cost not in(100,250) then raise exception 'invalid execution cost';end if;
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
