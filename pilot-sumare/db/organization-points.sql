-- Aggregate only accepted team links whose members opted into a public professional card.
-- Never include private non-professional records, pending invitations or duplicate members.
create or replace function pilot_private.organization_professional_points(p_org uuid,p_cohort uuid,p_department uuid default null)
returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('members',count(*),'average',round(avg(points),2)) from (
 select distinct t.candidate_id,pilot_private.public_professional_points(t.candidate_id,p_cohort) as points
 from public.portal_team_invitations t
 join public.portal_departments d on d.id=t.department_id and d.organization_id=t.organization_id and d.cohort_id=t.cohort_id
 join public.pilot_memberships m on m.user_id=t.candidate_id and m.cohort_id=t.cohort_id
 join public.portal_candidate_cards c on c.user_id=t.candidate_id and c.cohort_id=t.cohort_id and c.visible
 join auth.users u on u.id=t.candidate_id
 where t.organization_id=p_org and t.cohort_id=p_cohort and t.status='accepted' and (p_department is null or t.department_id=p_department)
 and m.status='active' and m.role in ('learner','pilot_owner') and u.email_confirmed_at is not null
 and ((m.is_fictitious and c.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 ) members
$$;
revoke all on function pilot_private.organization_professional_points(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function pilot_private.organization_professional_points(uuid,uuid,uuid) to service_role;

create or replace function public.portal_organization_points(p_org uuid,p_cohort uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('organization',pilot_private.organization_professional_points(p_org,p_cohort),
 'departments',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'name',d.name,'points',pilot_private.organization_professional_points(p_org,p_cohort,d.id)) order by lower(d.name),d.id)
 from public.portal_departments d where d.organization_id=p_org and d.cohort_id=p_cohort),'[]'::jsonb))
$$;
revoke all on function public.portal_organization_points(uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_organization_points(uuid,uuid) to service_role;
