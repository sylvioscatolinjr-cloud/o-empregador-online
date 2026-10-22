-- Public postal-area coordinates only. No link to search origins or user addresses.
create table public.portal_postal_coordinates(
 postal_code text primary key check(postal_code ~ '^[0-9]{8}$'),
 latitude double precision not null check(latitude between -34 and 6),
 longitude double precision not null check(longitude between -74 and -34),
 checked_at timestamptz not null default now()
);
alter table public.portal_postal_coordinates enable row level security;
revoke all on public.portal_postal_coordinates from public,anon,authenticated;
grant select,insert,update,delete on public.portal_postal_coordinates to service_role;
create table pilot_private.distance_search_limits(
 user_id uuid primary key references auth.users(id) on delete cascade,
 started_at timestamptz not null default now(),calls integer not null default 1
);
alter table pilot_private.distance_search_limits enable row level security;
revoke all on pilot_private.distance_search_limits from public,anon,authenticated;
grant select,insert,update,delete on pilot_private.distance_search_limits to service_role;
create function public.portal_distance_search_allowed(p_user uuid) returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;begin
 delete from pilot_private.distance_search_limits where started_at<now()-interval '30 days';
 insert into pilot_private.distance_search_limits(user_id) values(p_user)
 on conflict(user_id) do update set calls=case when distance_search_limits.started_at<=now()-interval '1 hour' then 1 else distance_search_limits.calls+1 end,
 started_at=case when distance_search_limits.started_at<=now()-interval '1 hour' then now() else distance_search_limits.started_at end
 returning calls into n;return n<=30;
end$$;
revoke all on function public.portal_distance_search_allowed(uuid) from public,anon,authenticated;
grant execute on function public.portal_distance_search_allowed(uuid) to service_role;
create function pilot_private.postal_distance_km(a double precision,b double precision,c double precision,d double precision)
returns double precision language sql immutable strict security invoker set search_path='' as $$
 select 6371.0088*2*asin(sqrt(least(1::double precision,greatest(0::double precision,
 sin(radians(c-a)/2)^2+cos(radians(a))*cos(radians(c))*sin(radians(d-b)/2)^2))))
$$;
revoke all on function pilot_private.postal_distance_km(double precision,double precision,double precision,double precision) from public,anon,authenticated;
grant execute on function pilot_private.postal_distance_km(double precision,double precision,double precision,double precision) to service_role;

create or replace function public.portal_distance_public_feed(p_cohort uuid,p_kind text,p_query text default '',p_page integer default 0,p_size integer default 50,p_lat double precision default null,p_lon double precision default null)
returns jsonb language plpgsql stable security invoker set search_path='' as $$begin
 if p_kind is null or p_kind not in ('job','course','training','learning','all','candidates') or p_page is null or p_page not between 0 and 1000 or p_size is null or p_size not in (30,50) then raise exception 'Invalid feed request';end if;
 if p_kind='candidates' or p_lat is null or p_lon is null or not(p_lat between -34 and 6) or not(p_lon between -74 and -34) then raise exception 'Invalid distance request';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier'-'organization_points'-'rank_distance' order by x.is_featured desc,x.subscription_tier desc,x.organization_points desc nulls last,x.rank_distance asc nulls last,lower(x.organization),lower(x.title),x.id)
 from (select l.id,l.kind,l.title,l.organization,left(l.description,600) as description,l.city,l.state_code,l.modality,l.job_type,l.created_at,l.is_fictitious,l.is_featured,l.logo_data,
 dense_rank() over(order by l.is_featured desc,pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) desc,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric desc nulls last) as presentation_group,
 pilot_private.verified_paid_tier(l.publisher_id,l.cohort_id,case m.role when 'recruiter' then 'Empresa' when 'school_staff' then 'Instituição de Ensino' else '' end) as subscription_tier,(pilot_private.organization_professional_points(l.publisher_id,l.cohort_id)->>'average')::numeric as organization_points,case when l.modality<>'Online' then pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) end as rank_distance,round((case when l.modality<>'Online' then pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) end)::numeric,1)::double precision as distance_km
 from public.portal_listings l join public.pilot_memberships m on m.user_id=l.publisher_id and m.cohort_id=l.cohort_id join auth.users u on u.id=m.user_id left join public.portal_postal_coordinates g on g.postal_code=l.postal_code and g.checked_at>statement_timestamp()-interval '30 days'
 where l.cohort_id=p_cohort and l.status='published' and m.status='active' and m.role in ('recruiter','school_staff')
 and (l.kind<>'job' or m.role='recruiter') and u.email_confirmed_at is not null and ((l.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (p_kind='all' or l.kind=p_kind or p_kind='learning' and l.kind in ('course','training'))
 and (coalesce(p_query,'')='' or l.title ilike '%'||left(p_query,100)||'%')
 order by l.is_featured desc,subscription_tier desc,organization_points desc nulls last,rank_distance asc nulls last,lower(l.organization),lower(l.title),l.id offset p_page*p_size limit p_size)x),'[]');
end $$;
revoke all on function public.portal_distance_public_feed(uuid,text,text,integer,integer,double precision,double precision) from public,anon,authenticated;
grant execute on function public.portal_distance_public_feed(uuid,text,text,integer,integer,double precision,double precision) to service_role;

-- Optional coarse candidate regions: no postal code, address or GPS; private server access only.
create table public.portal_candidate_regions(
 user_id uuid not null references auth.users(id) on delete cascade,
 cohort_id uuid not null references public.pilot_cohorts(id) on delete cascade,
 latitude double precision not null check(latitude between -34 and 6 and abs(latitude*10-round((latitude*10)::numeric))<0.00001),
 longitude double precision not null check(longitude between -74 and -34 and abs(longitude*10-round((longitude*10)::numeric))<0.00001),
 consented_at timestamptz not null default now(),primary key(user_id,cohort_id)
);
alter table public.portal_candidate_regions enable row level security;
revoke all on public.portal_candidate_regions from public,anon,authenticated;
grant select,insert,update,delete on public.portal_candidate_regions to service_role;
create function public.portal_distance_candidate_search(p_cohort uuid,p_query text,p_city text,p_senai boolean,p_page integer,p_lat double precision,p_lon double precision)
returns jsonb language plpgsql stable security invoker set search_path='' as $$begin
 if p_page is null or p_page not between 0 and 1000 or p_lat is null or p_lon is null or not(p_lat between -34 and 6) or not(p_lon between -74 and -34) then raise exception 'Invalid distance request';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)-'subscription_tier'-'rank_distance' order by x.is_featured desc,x.subscription_tier desc,x.professional_points desc,x.rank_distance asc nulls last,lower(x.name),x.id)
 from (select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.is_fictitious,c.is_featured,c.demo_resume,c.has_senai,case when c.show_card_image then c.photo_data else '' end as photo_data,c.show_card_image,
 pilot_private.public_professional_points(c.user_id,c.cohort_id) as professional_points,pilot_private.verified_paid_tier(c.user_id,c.cohort_id,'Candidato') as subscription_tier,
 pilot_private.postal_distance_km(p_lat,p_lon,g.latitude,g.longitude) as rank_distance
 from public.portal_candidate_cards c join public.pilot_memberships m on m.user_id=c.user_id and m.cohort_id=c.cohort_id join auth.users u on u.id=c.user_id
 left join public.portal_candidate_regions g on g.user_id=c.user_id and g.cohort_id=c.cohort_id
 where c.cohort_id=p_cohort and c.visible and m.status='active' and m.role in ('learner','pilot_owner') and u.email_confirmed_at is not null
 and ((c.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%' or c.skills ilike '%'||left(p_query,100)||'%')
 and (coalesce(p_city,'')='' or c.city ilike '%'||left(p_city,100)||'%') and (not coalesce(p_senai,false) or c.has_senai)
 order by c.is_featured desc,subscription_tier desc,professional_points desc,rank_distance asc nulls last,lower(c.name),c.id offset p_page*30 limit 30)x),'[]');
end$$;
revoke all on function public.portal_distance_candidate_search(uuid,text,text,boolean,integer,double precision,double precision) from public,anon,authenticated;
grant execute on function public.portal_distance_candidate_search(uuid,text,text,boolean,integer,double precision,double precision) to service_role;

create function public.portal_public_postal_codes(p_cohort uuid) returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from (
 select distinct l.postal_code from public.portal_listings l
 join public.pilot_memberships m on m.user_id=l.publisher_id and m.cohort_id=l.cohort_id join auth.users u on u.id=m.user_id
 where l.cohort_id=p_cohort and l.status='published' and m.status='active' and m.role in ('recruiter','school_staff')
 and (l.kind<>'job' or m.role='recruiter') and u.email_confirmed_at is not null
 and ((l.is_fictitious and m.is_fictitious) or u.banned_until is null or u.banned_until<=statement_timestamp())
 and l.postal_code ~ '^[0-9]{8}$' order by l.postal_code limit 1000)x
$$;
revoke all on function public.portal_public_postal_codes(uuid) from public,anon,authenticated;
grant execute on function public.portal_public_postal_codes(uuid) to service_role;
