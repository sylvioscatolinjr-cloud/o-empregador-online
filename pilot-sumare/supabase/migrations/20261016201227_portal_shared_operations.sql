begin;
-- Authoritative role lookup: only memberships and confirmed Auth users, never user_metadata.
create function pilot_private.portal_role(p_cohort uuid) returns text language sql stable security definer set search_path='' as $$
 select m.role from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.cohort_id=p_cohort and m.user_id=(select auth.uid()) and m.status='active' and u.email_confirmed_at is not null
$$;
revoke all on function pilot_private.portal_role(uuid) from public,anon;
grant execute on function pilot_private.portal_role(uuid) to authenticated;
create table public.portal_listings(
 id uuid primary key default gen_random_uuid(),cohort_id uuid not null references public.pilot_cohorts(id),
 publisher_id uuid not null references auth.users(id),kind text not null check(kind in ('job','course','training')),
 title text not null check(length(btrim(title)) between 3 and 160),organization text not null check(length(btrim(organization)) between 2 and 160),
 description text not null check(length(btrim(description)) between 20 and 12000),
 postal_code text not null check(postal_code ~ '^[0-9]{8}$'),city text not null check(length(btrim(city)) between 2 and 100),state_code text not null check(state_code ~ '^[A-Z]{2}$'),
 modality text not null check(modality in ('Presencial','Online','Híbrido')),
 job_type text check(job_type in ('CLT','PJ','MEI','Autônomo/Freelancer','Estágio','Jovem Aprendiz','Temporário','Intermitente','Doméstico','Voluntário','PCD')),
 status text not null default 'published' check(status in ('published','closed')),
 created_at timestamptz not null default now(),closed_at timestamptz,
 check((kind='job' and job_type is not null) or (kind<>'job' and job_type is null)),
 unique(id,cohort_id)
);
create index portal_listings_feed on public.portal_listings(cohort_id,status,created_at desc);
create index portal_listings_publisher on public.portal_listings(publisher_id,created_at desc);
create table public.portal_applications(
 id uuid primary key default gen_random_uuid(),listing_id uuid not null,cohort_id uuid not null,
 candidate_id uuid not null references auth.users(id),message text not null default '' check(length(message)<=3000),
 resume_snapshot jsonb not null default '{}'::jsonb,
 status text not null default 'submitted' check(status in ('submitted','reviewing','interview','accepted','rejected','withdrawn')),
 response text not null default '' check(length(response)<=3000),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 foreign key(listing_id,cohort_id) references public.portal_listings(id,cohort_id),unique(listing_id,candidate_id)
);
create index portal_applications_cohort on public.portal_applications(cohort_id);
create index portal_applications_candidate on public.portal_applications(candidate_id,created_at desc);
create table public.portal_notifications(
 id uuid primary key default gen_random_uuid(),cohort_id uuid not null references public.pilot_cohorts(id),user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(title) between 1 and 160),body text not null check(length(body)<=4000),listing_id uuid references public.portal_listings(id),
 created_at timestamptz not null default now(),read_at timestamptz
);
create index portal_notifications_user on public.portal_notifications(user_id,created_at desc);
create index portal_notifications_cohort on public.portal_notifications(cohort_id);
create index portal_notifications_listing on public.portal_notifications(listing_id);
-- Organization data is independent of the private candidate resume.
create table public.portal_organizations(
 user_id uuid primary key references auth.users(id) on delete cascade,cohort_id uuid not null references public.pilot_cohorts(id),
 name text not null check(length(btrim(name)) between 2 and 160),city text not null default '' check(length(city)<=100),state_code text not null default '' check(state_code='' or state_code ~ '^[A-Z]{2}$')
);
create index portal_organizations_cohort on public.portal_organizations(cohort_id);
create table public.portal_plan_selections(
 user_id uuid primary key references auth.users(id) on delete cascade,cohort_id uuid not null references public.pilot_cohorts(id),
 tier integer not null check(tier between 0 and 3),cycle text not null check(cycle in ('MONTHLY','QUARTERLY','SEMIANNUALLY','YEARLY')),
 updated_at timestamptz not null default now()
);
create index portal_plan_selections_cohort on public.portal_plan_selections(cohort_id);
alter table public.portal_listings enable row level security;
alter table public.portal_applications enable row level security;
alter table public.portal_notifications enable row level security;
alter table public.portal_organizations enable row level security;
alter table public.portal_plan_selections enable row level security;
revoke all on public.portal_listings,public.portal_applications,public.portal_notifications,public.portal_organizations,public.portal_plan_selections from public,anon,authenticated;
grant all on public.portal_listings,public.portal_applications,public.portal_notifications,public.portal_organizations,public.portal_plan_selections to service_role;
grant select on public.portal_listings,public.portal_applications,public.portal_notifications,public.portal_organizations,public.portal_plan_selections to authenticated;
grant insert(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type) on public.portal_listings to authenticated;
grant insert(listing_id,cohort_id,candidate_id,message) on public.portal_applications to authenticated;
grant update(read_at) on public.portal_notifications to authenticated;
grant insert,update(name,city,state_code) on public.portal_organizations to authenticated;
grant insert,update(tier,cycle,updated_at) on public.portal_plan_selections to authenticated;
create policy listing_read on public.portal_listings for select to authenticated using(pilot_private.portal_role(cohort_id) is not null);
create policy listing_insert on public.portal_listings for insert to authenticated with check(publisher_id=(select auth.uid()) and ((kind='job' and pilot_private.portal_role(cohort_id)='recruiter') or (kind in ('course','training') and pilot_private.portal_role(cohort_id) in ('recruiter','school_staff'))));
create policy application_read on public.portal_applications for select to authenticated using(pilot_private.portal_role(cohort_id) is not null and (candidate_id=(select auth.uid()) or exists(select 1 from public.portal_listings l where l.id=listing_id and l.publisher_id=(select auth.uid()))));
create policy application_insert on public.portal_applications for insert to authenticated with check(candidate_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner') and exists(select 1 from public.portal_listings l where l.id=listing_id and l.cohort_id=portal_applications.cohort_id and l.status='published'));
create policy notification_read on public.portal_notifications for select to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null);
create policy notification_mark on public.portal_notifications for update to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null) with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null);
create policy organization_read on public.portal_organizations for select to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('recruiter','school_staff'));
create policy organization_insert on public.portal_organizations for insert to authenticated with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('recruiter','school_staff'));
create policy organization_update on public.portal_organizations for update to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('recruiter','school_staff')) with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('recruiter','school_staff'));
create policy plan_read on public.portal_plan_selections for select to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null);
create policy plan_insert on public.portal_plan_selections for insert to authenticated with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null);
create policy plan_update on public.portal_plan_selections for update to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null) with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) is not null);
-- Trigger captures only the submitted resume. Publisher never obtains unrestricted profile access.
create function pilot_private.capture_application() returns trigger language plpgsql security definer set search_path='' as $$
 declare l public.portal_listings;begin
 if new.candidate_id is distinct from auth.uid() or pilot_private.portal_role(new.cohort_id) not in ('learner','pilot_owner') or pilot_private.portal_role(new.cohort_id) is null then raise exception 'Acesso de candidato necessário';end if;
 select * into l from public.portal_listings where id=new.listing_id and cohort_id=new.cohort_id for update;
 if not found or l.status<>'published' then raise exception 'Anúncio encerrado';end if;
 if l.kind='job' then
 select jsonb_build_object('display_name',display_name,'city',city,'state_code',state_code,'skills',skills,'about',about,'experience',experience,'education',education,'courses',courses,'certifications',certifications) into new.resume_snapshot from public.pilot_profiles where user_id=new.candidate_id;
 if new.resume_snapshot is null then raise exception 'Preencha seu currículo antes de se candidatar';end if;
 else select jsonb_build_object('display_name',display_name) into new.resume_snapshot from public.pilot_profiles where user_id=new.candidate_id;
 if new.resume_snapshot is null then raise exception 'Conclua seu perfil';end if;end if;
 insert into public.portal_notifications(cohort_id,user_id,title,body,listing_id) values(new.cohort_id,l.publisher_id,case when l.kind='job' then 'Nova candidatura' else 'Novo interesse em curso' end,l.title,new.listing_id);
 return new;end$$;
revoke all on function pilot_private.capture_application() from public,anon,authenticated;
create trigger capture_application before insert on public.portal_applications for each row execute function pilot_private.capture_application();
-- Narrow transactional commands, with authorization in the private implementation.
create function pilot_private.respond_application(p_id uuid,p_status text,p_response text) returns void language plpgsql security definer set search_path='' as $$
 declare a public.portal_applications;l public.portal_listings;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 select * into a from public.portal_applications where id=p_id for update;if not found then raise exception 'Registro indisponível';end if;
 select * into l from public.portal_listings where id=a.listing_id;
 if l.publisher_id<>auth.uid() or pilot_private.portal_role(a.cohort_id) not in ('recruiter','school_staff') or pilot_private.portal_role(a.cohort_id) is null then raise exception 'Acesso negado';end if;
 if a.status='withdrawn' then raise exception 'Participação cancelada pelo candidato';end if;
 if p_status not in ('reviewing','interview','accepted','rejected') or p_status is null or length(btrim(coalesce(p_response,''))) not between 1 and 3000 then raise exception 'Confira a situação e a resposta';end if;
 update public.portal_applications set status=p_status,response=btrim(p_response),updated_at=now() where id=p_id;
 insert into public.portal_notifications(cohort_id,user_id,title,body,listing_id) values(a.cohort_id,a.candidate_id,'Resposta recebida: '||left(l.title,130),p_response,l.id);
 end$$;
create function public.portal_respond_application(p_id uuid,p_status text,p_response text) returns void language sql security invoker set search_path='' as $$select pilot_private.respond_application(p_id,p_status,p_response)$$;
create function pilot_private.withdraw_application(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
 declare a public.portal_applications;l public.portal_listings;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 select * into a from public.portal_applications where id=p_id for update;
 if not found or a.candidate_id<>auth.uid() or pilot_private.portal_role(a.cohort_id) not in ('learner','pilot_owner') or pilot_private.portal_role(a.cohort_id) is null then raise exception 'Acesso negado';end if;
 if a.status='withdrawn' then return;end if;
 select * into l from public.portal_listings where id=a.listing_id;
 update public.portal_applications set status='withdrawn',updated_at=now() where id=p_id;
 insert into public.portal_notifications(cohort_id,user_id,title,body,listing_id) values(a.cohort_id,l.publisher_id,'Participação cancelada',l.title,l.id);end$$;
create function public.portal_withdraw_application(p_id uuid) returns void language sql security invoker set search_path='' as $$select pilot_private.withdraw_application(p_id)$$;
create function pilot_private.close_listing(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
 declare l public.portal_listings;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 select * into l from public.portal_listings where id=p_id for update;
 if not found or l.publisher_id<>auth.uid() or pilot_private.portal_role(l.cohort_id) not in ('recruiter','school_staff') or pilot_private.portal_role(l.cohort_id) is null then raise exception 'Acesso negado';end if;
 update public.portal_listings set status='closed',closed_at=now() where id=p_id;end$$;
create function public.portal_close_listing(p_id uuid) returns void language sql security invoker set search_path='' as $$select pilot_private.close_listing(p_id)$$;
revoke all on function pilot_private.respond_application(uuid,text,text),pilot_private.withdraw_application(uuid),pilot_private.close_listing(uuid),public.portal_respond_application(uuid,text,text),public.portal_withdraw_application(uuid),public.portal_close_listing(uuid) from public,anon;
grant execute on function pilot_private.respond_application(uuid,text,text),pilot_private.withdraw_application(uuid),pilot_private.close_listing(uuid),public.portal_respond_application(uuid,text,text),public.portal_withdraw_application(uuid),public.portal_close_listing(uuid) to authenticated;
-- Server-only administration commands. Public wrappers are not executable by visitor roles.
create function pilot_private.activate_test_account(p_actor uuid,p_cohort uuid,p_email text) returns text language plpgsql security definer set search_path='' as $$
 declare u auth.users;v_type text;v_role text;v_status text;begin
 if not exists(select 1 from public.pilot_memberships where cohort_id=p_cohort and user_id=p_actor and role='pilot_owner' and status='active') then raise exception 'Acesso negado';end if;
 select * into u from auth.users where lower(email)=lower(btrim(p_email)) and email_confirmed_at is not null;
 if not found then raise exception 'Conta não encontrada ou e-mail ainda não confirmado';end if;
 select profile_type into v_type from pilot_private.user_identities where user_id=u.id;
 v_role:=case v_type when 'Candidato' then 'learner' when 'Empresa' then 'recruiter' when 'Instituição de Ensino' then 'school_staff' end;
 if v_role is null then raise exception 'A conta precisa concluir o CPF ou CNPJ primeiro';end if;
 select status into v_status from public.pilot_memberships where cohort_id=p_cohort and user_id=u.id for update;
 if found then
 if v_status='active' then return 'Esta conta já está ativa.';else raise exception 'Vínculo existente exige revisão; ativação automática bloqueada';end if;end if;
 insert into public.pilot_profiles(user_id,display_name) values(u.id,left(coalesce(nullif(btrim(u.raw_user_meta_data->>'display_name'),''),'Usuário'),100)) on conflict do nothing;
 insert into public.pilot_memberships(cohort_id,user_id,role,status) values(p_cohort,u.id,v_role,'active');
 return 'Conta de teste ativada como '||v_type||'.';end$$;
create function public.portal_activate_test_account(p_actor uuid,p_cohort uuid,p_email text) returns text language sql security invoker set search_path='' as $$select pilot_private.activate_test_account(p_actor,p_cohort,p_email)$$;
create function pilot_private.owner_metrics(p_actor uuid,p_cohort uuid,p_start timestamptz,p_end timestamptz,p_bucket text) returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare v_result jsonb;begin
 if not exists(select 1 from public.pilot_memberships where cohort_id=p_cohort and user_id=p_actor and role='pilot_owner' and status='active') then raise exception 'Acesso negado';end if;
 if p_bucket not in ('hour','day','month') or p_end<=p_start or p_end-p_start>interval '370 days' then raise exception 'Período inválido';end if;
 with events as (
 select p.created_at as at,'profiles' as kind from public.pilot_profiles p join public.pilot_memberships m on m.user_id=p.user_id and m.cohort_id=p_cohort and m.role in ('learner','pilot_owner')
 union all select created_at,case when kind='job' then 'jobs' else 'courses' end from public.portal_listings where cohort_id=p_cohort
 union all select created_at,'applications' from public.portal_applications where cohort_id=p_cohort
 ), filtered as(select * from events where at>=p_start and at<p_end),
 buckets as(select generate_series(date_trunc(p_bucket,p_start at time zone 'America/Sao_Paulo'),date_trunc(p_bucket,(p_end-interval '1 microsecond') at time zone 'America/Sao_Paulo'),('1 '||p_bucket)::interval) as bucket),
 series as(select b.bucket,count(*) filter(where f.kind='profiles') as profiles,count(*) filter(where f.kind='jobs') as jobs,count(*) filter(where f.kind='courses') as courses,count(*) filter(where f.kind='applications') as applications
 from buckets b left join filtered f on date_trunc(p_bucket,f.at at time zone 'America/Sao_Paulo')=b.bucket group by b.bucket)
 select jsonb_build_object('profiles',(select count(*) from filtered where kind='profiles'),'jobs',(select count(*) from filtered where kind='jobs'),'courses',(select count(*) from filtered where kind='courses'),'applications',(select count(*) from filtered where kind='applications'),'revenueCents',0,'series',coalesce((select jsonb_agg(jsonb_build_object('label',to_char(bucket,case when p_bucket='hour' then 'HH24:MI' when p_bucket='month' then 'MM/YYYY' else 'DD/MM' end),'profiles',profiles,'jobs',jobs,'courses',courses,'applications',applications,'revenueCents',0) order by bucket) from series),'[]'::jsonb)) into v_result;
 return v_result;end$$;
create function public.portal_owner_metrics(p_actor uuid,p_cohort uuid,p_start timestamptz,p_end timestamptz,p_bucket text) returns jsonb language sql security invoker set search_path='' as $$select pilot_private.owner_metrics(p_actor,p_cohort,p_start,p_end,p_bucket)$$;
create function pilot_private.broadcast(p_actor uuid,p_cohort uuid,p_role text,p_states text[],p_city text,p_title text,p_body text,p_send boolean) returns integer language plpgsql security definer set search_path='' as $$
 declare v_count integer;begin
 if not exists(select 1 from public.pilot_memberships where cohort_id=p_cohort and user_id=p_actor and role='pilot_owner' and status='active') then raise exception 'Acesso negado';end if;
 if p_role not in ('all','learner','recruiter','school_staff') or p_role is null or length(btrim(coalesce(p_title,''))) not between 1 and 160 or length(btrim(coalesce(p_body,''))) not between 1 and 4000 or length(coalesce(p_city,''))>100 then raise exception 'Confira os filtros e a mensagem';end if;
 with recipients as(
 select m.user_id from public.pilot_memberships m join auth.users u on u.id=m.user_id and u.email_confirmed_at is not null
 left join public.pilot_profiles p on p.user_id=m.user_id and m.role in ('learner','pilot_owner')
 left join public.portal_organizations o on o.user_id=m.user_id and o.cohort_id=m.cohort_id and m.role in ('recruiter','school_staff')
 where m.cohort_id=p_cohort and m.status='active' and (p_role='all' or m.role=p_role)
 and (p_states is null or coalesce(o.state_code,p.state_code)=any(p_states))
 and (coalesce(btrim(p_city),'')='' or lower(coalesce(o.city,p.city))=lower(btrim(p_city)))
 ),sent as(insert into public.portal_notifications(cohort_id,user_id,title,body) select p_cohort,user_id,btrim(p_title),btrim(p_body) from recipients where p_send returning id)
 select case when p_send then (select count(*) from sent) else (select count(*) from recipients) end into v_count;
 return v_count;end$$;
create function public.portal_broadcast(p_actor uuid,p_cohort uuid,p_role text,p_states text[],p_city text,p_title text,p_body text,p_send boolean) returns integer language sql security invoker set search_path='' as $$select pilot_private.broadcast(p_actor,p_cohort,p_role,p_states,p_city,p_title,p_body,p_send)$$;
revoke all on function pilot_private.activate_test_account(uuid,uuid,text),public.portal_activate_test_account(uuid,uuid,text),pilot_private.owner_metrics(uuid,uuid,timestamptz,timestamptz,text),public.portal_owner_metrics(uuid,uuid,timestamptz,timestamptz,text),pilot_private.broadcast(uuid,uuid,text,text[],text,text,text,boolean),public.portal_broadcast(uuid,uuid,text,text[],text,text,text,boolean) from public,anon,authenticated;
grant execute on function pilot_private.activate_test_account(uuid,uuid,text),public.portal_activate_test_account(uuid,uuid,text),pilot_private.owner_metrics(uuid,uuid,timestamptz,timestamptz,text),public.portal_owner_metrics(uuid,uuid,timestamptz,timestamptz,text),pilot_private.broadcast(uuid,uuid,text,text[],text,text,text,boolean),public.portal_broadcast(uuid,uuid,text,text[],text,text,text,boolean) to service_role;

notify pgrst,'reload schema';
commit;
