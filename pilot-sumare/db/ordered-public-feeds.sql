-- Service-only read projection: no new definer functions or client ledger privileges.
create or replace function pilot_private.public_professional_points(p_user uuid,p_cohort uuid)
returns numeric language sql stable security invoker set search_path='' as $$
 select coalesce(sum((case level when 'doctorate' then 1200 when 'masters' then 800 when 'postgraduate' then 400 when 'degree' then 300 when 'technical' then 200 when 'course' then hours when 'training' then hours*2 end)
 *(1+case when recommended and level in ('course','training') then .25 else 0 end+case when completed_on>=current_date-interval '24 months' then .20 else 0 end)),0)
 from public.portal_learning_records where user_id=p_user and cohort_id=p_cohort and status='verified' and sphere='professional'
$$;
revoke all on function pilot_private.public_professional_points(uuid,uuid) from public,anon,authenticated;
grant execute on function pilot_private.public_professional_points(uuid,uuid) to service_role;

create or replace function public.portal_ordered_public_feed(p_cohort uuid,p_kind text,p_query text default '',p_page integer default 0,p_size integer default 50)
returns jsonb language plpgsql stable security invoker set search_path='' as $$begin
 if p_kind is null or p_kind not in ('job','course','training','learning','all','candidates') or p_page is null or p_page not between 0 and 1000 or p_size is null or p_size not in (30,50) then raise exception 'Invalid feed request';end if;
 if p_kind='candidates' then
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier'-'professional_points' order by x.is_featured desc,x.subscription_tier desc,x.professional_points desc,lower(x.name),x.id)
 from (select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.updated_at,c.is_fictitious,c.is_featured,c.has_senai,case when c.show_card_image then c.photo_data else '' end as photo_data,c.show_card_image,
 dense_rank() over(order by c.is_featured desc,pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') desc,pilot_private.public_professional_points(c.user_id,c.cohort_id) desc) as presentation_group,
 pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier,pilot_private.public_professional_points(c.user_id,c.cohort_id) as professional_points
 from public.portal_candidate_cards c join public.pilot_memberships m on m.user_id=c.user_id and m.cohort_id=c.cohort_id join auth.users u on u.id=m.user_id
 where c.cohort_id=p_cohort and c.visible and m.status='active' and m.role in ('learner','pilot_owner') and u.email_confirmed_at is not null
 and ((c.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%')
 order by c.is_featured desc,subscription_tier desc,professional_points desc,lower(c.name),c.id offset p_page*p_size limit p_size)x),'[]');
 end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier' order by x.is_featured desc,x.subscription_tier desc,lower(x.organization),lower(x.title),x.id)
 from (select l.id,l.kind,l.title,l.organization,left(l.description,600) as description,l.city,l.state_code,l.modality,l.job_type,l.created_at,l.is_fictitious,l.is_featured,l.logo_data,
 dense_rank() over(order by l.is_featured desc,pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) desc) as presentation_group,
 pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) as subscription_tier
 from public.portal_listings l join public.pilot_memberships m on m.user_id=l.publisher_id and m.cohort_id=l.cohort_id join auth.users u on u.id=m.user_id
 where l.cohort_id=p_cohort and l.status='published' and m.status='active' and m.role in ('recruiter','school_staff')
 and (l.kind<>'job' or m.role='recruiter') and u.email_confirmed_at is not null and ((l.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (p_kind='all' or l.kind=p_kind or p_kind='learning' and l.kind in ('course','training'))
 and (coalesce(p_query,'')='' or l.title ilike '%'||left(p_query,100)||'%')
 order by l.is_featured desc,subscription_tier desc,lower(l.organization),lower(l.title),l.id offset p_page*p_size limit p_size)x),'[]');
end $$;
revoke all on function public.portal_ordered_public_feed(uuid,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.portal_ordered_public_feed(uuid,text,text,integer,integer) to service_role;
