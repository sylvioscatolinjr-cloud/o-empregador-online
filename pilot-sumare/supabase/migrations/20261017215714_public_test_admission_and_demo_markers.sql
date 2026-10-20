-- Public testing is a separate admission path; school cohort approvals stay intact.
alter table public.pilot_cohorts add column public_test_open boolean not null default false;
alter table public.pilot_memberships add column is_fictitious boolean not null default false;
alter table public.portal_listings add column is_fictitious boolean not null default false;
alter table public.portal_listings add column is_featured boolean not null default false;
alter table public.portal_candidate_cards add column is_fictitious boolean not null default false;
alter table public.portal_candidate_cards add column is_featured boolean not null default false;
alter table public.portal_candidate_cards add column demo_resume jsonb;
alter table public.portal_candidate_cards add constraint demo_resume_only_fictitious check(demo_resume is null or is_fictitious);
grant select(is_fictitious,is_featured) on public.portal_listings to anon;
grant select(is_fictitious,is_featured,demo_resume) on public.portal_candidate_cards to anon;
create index portal_listings_featured on public.portal_listings(cohort_id,is_featured desc,created_at desc) where status='published';
create index portal_cards_featured on public.portal_candidate_cards(is_featured desc,updated_at desc) where visible;
create function pilot_private.join_public_test(p_cohort_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare u auth.users; v_type text; v_role text; v_status text;
begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 select * into u from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if not found or u.banned_until>now() then raise exception 'Confirme seu e-mail ou confira seu acesso';end if;
 -- Serialize admission with moderation. Never restore a suspended or withdrawn membership.
 perform pg_advisory_xact_lock(hashtextextended(u.id::text||p_cohort_id::text,0));
 select status into v_status from public.pilot_memberships where user_id=u.id and cohort_id=p_cohort_id for update;
 if found then return v_status='active';end if;
 if not exists(select 1 from public.pilot_cohorts where id=p_cohort_id and public_test_open) then return false;end if;
 select profile_type into v_type from pilot_private.user_identities where user_id=u.id;
 v_role:=case v_type when 'Candidato' then 'learner' when 'Empresa' then 'recruiter' when 'Instituição de Ensino' then 'school_staff' end;
 if v_role is null then return false;end if;
 insert into public.pilot_profiles(user_id,display_name) values(u.id,left(coalesce(nullif(btrim(u.raw_user_meta_data->>'display_name'),''),'Usuário'),100)) on conflict do nothing;
 insert into public.pilot_memberships(cohort_id,user_id,role,status) values(p_cohort_id,u.id,v_role,'active');
 return true;
end $$;
create function public.portal_join_public_test(p_cohort_id uuid) returns boolean language sql security invoker set search_path='' as $$select pilot_private.join_public_test(p_cohort_id)$$;
revoke all on function pilot_private.join_public_test(uuid),public.portal_join_public_test(uuid) from public,anon;
grant execute on function pilot_private.join_public_test(uuid),public.portal_join_public_test(uuid) to authenticated;
-- Published synthetic accounts cannot log in, and cannot be promoted via editable metadata.
notify pgrst,'reload schema';

create or replace function pilot_private.owner_metrics(p_actor uuid,p_cohort uuid,p_start timestamptz,p_end timestamptz,p_bucket text) returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare v_result jsonb;begin
 if not exists(select 1 from public.pilot_memberships where cohort_id=p_cohort and user_id=p_actor and role='pilot_owner' and status='active') then raise exception 'Acesso negado';end if;
 if p_bucket not in ('hour','day','month') or p_end<=p_start or p_end-p_start>interval '370 days' then raise exception 'Período inválido';end if;
 with events as (
 select p.created_at as at,'profiles' as kind from public.pilot_profiles p join public.pilot_memberships m on m.user_id=p.user_id and m.cohort_id=p_cohort and m.role in ('learner','pilot_owner') and not m.is_fictitious
 union all select created_at,case when kind='job' then 'jobs' else 'courses' end from public.portal_listings where cohort_id=p_cohort and not is_fictitious
 union all select a.created_at,'applications' from public.portal_applications a join public.portal_listings l on l.id=a.listing_id where a.cohort_id=p_cohort and not l.is_fictitious
 ), filtered as(select * from events where at>=p_start and at<p_end),
 buckets as(select generate_series(date_trunc(p_bucket,p_start at time zone 'America/Sao_Paulo'),date_trunc(p_bucket,(p_end-interval '1 microsecond') at time zone 'America/Sao_Paulo'),('1 '||p_bucket)::interval) as bucket),
 series as(select b.bucket,count(*) filter(where f.kind='profiles') as profiles,count(*) filter(where f.kind='jobs') as jobs,count(*) filter(where f.kind='courses') as courses,count(*) filter(where f.kind='applications') as applications
 from buckets b left join filtered f on date_trunc(p_bucket,f.at at time zone 'America/Sao_Paulo')=b.bucket group by b.bucket)
 select jsonb_build_object('profiles',(select count(*) from filtered where kind='profiles'),'jobs',(select count(*) from filtered where kind='jobs'),'courses',(select count(*) from filtered where kind='courses'),'applications',(select count(*) from filtered where kind='applications'),'revenueCents',0,'series',coalesce((select jsonb_agg(jsonb_build_object('label',to_char(bucket,case when p_bucket='hour' then 'HH24:MI' when p_bucket='month' then 'MM/YYYY' else 'DD/MM' end),'profiles',profiles,'jobs',jobs,'courses',courses,'applications',applications,'revenueCents',0) order by bucket) from series),'[]'::jsonb)) into v_result;
 return v_result;end$$;

create or replace function pilot_private.broadcast(p_actor uuid,p_cohort uuid,p_role text,p_states text[],p_city text,p_title text,p_body text,p_send boolean) returns integer language plpgsql security definer set search_path='' as $$
 declare v_count integer;begin
 if not exists(select 1 from public.pilot_memberships where cohort_id=p_cohort and user_id=p_actor and role='pilot_owner' and status='active') then raise exception 'Acesso negado';end if;
 if p_role not in ('all','learner','recruiter','school_staff') or p_role is null or length(btrim(coalesce(p_title,''))) not between 1 and 160 or length(btrim(coalesce(p_body,''))) not between 1 and 4000 or length(coalesce(p_city,''))>100 then raise exception 'Confira os filtros e a mensagem';end if;
 with recipients as(
 select m.user_id from public.pilot_memberships m join auth.users u on u.id=m.user_id and u.email_confirmed_at is not null
 left join public.pilot_profiles p on p.user_id=m.user_id and m.role in ('learner','pilot_owner')
 left join public.portal_organizations o on o.user_id=m.user_id and o.cohort_id=m.cohort_id and m.role in ('recruiter','school_staff')
 where m.cohort_id=p_cohort and m.status='active' and not m.is_fictitious and (p_role='all' or m.role=p_role)
 and (p_states is null or coalesce(o.state_code,p.state_code)=any(p_states))
 and (coalesce(btrim(p_city),'')='' or lower(coalesce(o.city,p.city))=lower(btrim(p_city)))
 ),sent as(insert into public.portal_notifications(cohort_id,user_id,title,body) select p_cohort,user_id,btrim(p_title),btrim(p_body) from recipients where p_send returning id)
 select case when p_send then (select count(*) from sent) else (select count(*) from recipients) end into v_count;
 return v_count;end$$;

revoke insert on public.portal_candidate_cards from authenticated;
grant insert(user_id,cohort_id,name,headline,city,state_code,skills,visible,consented_at,updated_at) on public.portal_candidate_cards to authenticated;
