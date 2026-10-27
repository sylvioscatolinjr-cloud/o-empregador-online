-- Draft only: do not apply before concurrency, delivery and tracking are complete.
create function pilot_private.highlight_active(p_cohort uuid,p_user uuid,p_kind text,p_target uuid)
returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.portal_highlight_orders o
 join public.portal_highlight_payments p on p.order_id=o.id
 where o.cohort_id=p_cohort and o.user_id=p_user and o.kind=p_kind and o.target_id=p_target
 and o.status='confirmed' and p.eligible and p.cents=o.cents
 and o.starts_at<=statement_timestamp() and o.ends_at>statement_timestamp())
$$;
revoke all on function pilot_private.highlight_active(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function pilot_private.highlight_active(uuid,uuid,text,uuid) to service_role;

-- pilot_private.search_scored_candidates: preserve existing permissions on CREATE OR REPLACE.
CREATE OR REPLACE FUNCTION pilot_private.search_scored_candidates(p_cohort uuid, p_query text, p_city text, p_senai boolean, p_page integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
 if auth.uid() is null or coalesce(pilot_private.portal_role(p_cohort),'') not in ('recruiter','school_staff','pilot_owner') then raise exception 'Busca de currículos indisponível para este perfil';end if;
 if p_page is null or p_page not between 0 and 1000 then raise exception 'Página inválida';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier' order by x.is_featured desc,x.subscription_tier desc,x.professional_points desc,lower(x.name),x.id)
 from (
  select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.is_fictitious,(c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) as is_featured,c.demo_resume,c.has_senai,c.photo_data,c.show_card_image,
   pilot_private.learning_score(c.user_id,c.cohort_id) as professional_points,
   pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier
  from public.portal_candidate_cards c
  where c.cohort_id=p_cohort and c.visible and pilot_private.public_candidate_active(c.user_id,c.cohort_id)
   and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%' or c.skills ilike '%'||left(p_query,100)||'%')
   and (coalesce(p_city,'')='' or c.city ilike '%'||left(p_city,100)||'%') and (not coalesce(p_senai,false) or c.has_senai)
  order by (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) desc,subscription_tier desc,professional_points desc,lower(c.name),c.id offset p_page*30 limit 30
 )x),'[]');
end $function$;

-- public.portal_distance_candidate_search: preserve existing permissions on CREATE OR REPLACE.
CREATE OR REPLACE FUNCTION public.portal_distance_candidate_search(p_cohort uuid, p_query text, p_city text, p_senai boolean, p_page integer, p_lat double precision, p_lon double precision)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$begin
 if p_page is null or p_page not between 0 and 1000 or p_lat is null or p_lon is null or not(p_lat between -34 and 6) or not(p_lon between -74 and -34) then raise exception 'Invalid distance request';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier'-'rank_distance' order by x.is_featured desc,x.subscription_tier desc,x.professional_points desc,x.rank_distance asc nulls last,lower(x.name),x.id)
 from (select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.is_fictitious,(c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) as is_featured,c.demo_resume,c.has_senai,case when c.show_card_image then c.photo_data else '' end as photo_data,c.show_card_image,
 pilot_private.public_professional_points(c.user_id,c.cohort_id) as professional_points,pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier,
 pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) as rank_distance
 from public.portal_candidate_cards c join public.pilot_memberships m on m.user_id=c.user_id and m.cohort_id=c.cohort_id join auth.users u on u.id=c.user_id
 left join public.portal_candidate_regions g on g.user_id=c.user_id and g.cohort_id=c.cohort_id
 where c.cohort_id=p_cohort and c.visible and m.status='active' and m.role in ('learner','pilot_owner') and u.email_confirmed_at is not null
 and ((c.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%' or c.skills ilike '%'||left(p_query,100)||'%')
 and (coalesce(p_city,'')='' or c.city ilike '%'||left(p_city,100)||'%') and (not coalesce(p_senai,false) or c.has_senai)
 order by (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) desc,subscription_tier desc,professional_points desc,rank_distance asc nulls last,lower(c.name),c.id offset p_page*30 limit 30)x),'[]');
end$function$;

-- public.portal_distance_public_feed: preserve existing permissions on CREATE OR REPLACE.
CREATE OR REPLACE FUNCTION public.portal_distance_public_feed(p_cohort uuid, p_kind text, p_query text DEFAULT ''::text, p_page integer DEFAULT 0, p_size integer DEFAULT 50, p_lat double precision DEFAULT NULL::double precision, p_lon double precision DEFAULT NULL::double precision)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$begin
 if p_kind is null or p_kind not in ('job','course','training','learning','all','candidates') or p_page is null or p_page not between 0 and 1000 or p_size is null or p_size not in (30,50) then raise exception 'Invalid feed request';end if;
 if p_kind='candidates' or p_lat is null or p_lon is null or not(p_lat between -34 and 6) or not(p_lon between -74 and -34) then raise exception 'Invalid distance request';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier'-'organization_points'-'rank_distance' order by x.is_featured desc,x.subscription_tier desc,x.organization_points desc nulls last,x.rank_distance asc nulls last,lower(x.organization),lower(x.title),x.id)
 from (select l.id,l.kind,l.title,l.organization,left(l.description,600) as description,l.city,l.state_code,l.modality,l.job_type,l.created_at,l.is_fictitious,(l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) as is_featured,l.logo_data,
 dense_rank() over(order by (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) desc,pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) desc,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric desc nulls last) as presentation_group,
 pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) as subscription_tier,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric as organization_points,case when l.modality<>'Online' then pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) end as rank_distance,round((case when l.modality<>'Online' then pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) end)::numeric,1)::double precision as distance_km
 from public.portal_listings l join public.pilot_memberships m on m.user_id=l.publisher_id and m.cohort_id=l.cohort_id join auth.users u on u.id=m.user_id left join public.portal_postal_coordinates g on g.postal_code=l.postal_code and g.checked_at>statement_timestamp()-interval '30 days'
 where l.cohort_id=p_cohort and l.status='published' and m.status='active' and m.role in ('recruiter','school_staff')
 and (l.kind<>'job' or m.role='recruiter') and u.email_confirmed_at is not null and ((l.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (p_kind='all' or l.kind=p_kind or p_kind='learning' and l.kind in ('course','training'))
 and (coalesce(p_query,'')='' or l.title ilike '%'||left(p_query,100)||'%')
 order by (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) desc,subscription_tier desc,organization_points desc nulls last,rank_distance asc nulls last,lower(l.organization),lower(l.title),l.id offset p_page*p_size limit p_size)x),'[]');
end $function$;

-- public.portal_ordered_public_feed: preserve existing permissions on CREATE OR REPLACE.
CREATE OR REPLACE FUNCTION public.portal_ordered_public_feed(p_cohort uuid, p_kind text, p_query text DEFAULT ''::text, p_page integer DEFAULT 0, p_size integer DEFAULT 50)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$begin
 if p_kind is null or p_kind not in ('job','course','training','learning','all','candidates') or p_page is null or p_page not between 0 and 1000 or p_size is null or p_size not in (30,50) then raise exception 'Invalid feed request';end if;
 if p_kind='candidates' then
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier'-'professional_points' order by x.is_featured desc,x.subscription_tier desc,x.professional_points desc,lower(x.name),x.id)
 from (select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.updated_at,c.is_fictitious,(c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) as is_featured,c.has_senai,case when c.show_card_image then c.photo_data else '' end as photo_data,c.show_card_image,
 dense_rank() over(order by (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) desc,pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') desc,pilot_private.public_professional_points(c.user_id,c.cohort_id) desc) as presentation_group,
 pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier,pilot_private.public_professional_points(c.user_id,c.cohort_id) as professional_points
 from public.portal_candidate_cards c join public.pilot_memberships m on m.user_id=c.user_id and m.cohort_id=c.cohort_id join auth.users u on u.id=m.user_id
 where c.cohort_id=p_cohort and c.visible and m.status='active' and m.role in ('learner','pilot_owner') and u.email_confirmed_at is not null
 and ((c.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%')
 order by (c.is_fictitious and c.is_featured or pilot_private.highlight_active(c.cohort_id,c.user_id,'candidate',c.id)) desc,subscription_tier desc,professional_points desc,lower(c.name),c.id offset p_page*p_size limit p_size)x),'[]');
 end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier'-'organization_points' order by x.is_featured desc,x.subscription_tier desc,x.organization_points desc nulls last,lower(x.organization),lower(x.title),x.id)
 from (select l.id,l.kind,l.title,l.organization,left(l.description,600) as description,l.city,l.state_code,l.modality,l.job_type,l.created_at,l.is_fictitious,(l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) as is_featured,l.logo_data,
 dense_rank() over(order by (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) desc,pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) desc,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric desc nulls last) as presentation_group,
 pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) as subscription_tier,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric as organization_points
 from public.portal_listings l join public.pilot_memberships m on m.user_id=l.publisher_id and m.cohort_id=l.cohort_id join auth.users u on u.id=m.user_id
 where l.cohort_id=p_cohort and l.status='published' and m.status='active' and m.role in ('recruiter','school_staff')
 and (l.kind<>'job' or m.role='recruiter') and u.email_confirmed_at is not null and ((l.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (p_kind='all' or l.kind=p_kind or p_kind='learning' and l.kind in ('course','training'))
 and (coalesce(p_query,'')='' or l.title ilike '%'||left(p_query,100)||'%')
 order by (l.is_fictitious and l.is_featured or pilot_private.highlight_active(l.cohort_id,l.publisher_id,l.kind,l.id)) desc,subscription_tier desc,organization_points desc nulls last,lower(l.organization),lower(l.title),l.id offset p_page*p_size limit p_size)x),'[]');
end $function$;
