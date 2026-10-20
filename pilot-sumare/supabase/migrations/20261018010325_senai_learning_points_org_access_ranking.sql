alter table public.pilot_profiles add column has_senai boolean not null default false;
alter table public.pilot_profiles add column senai_status text not null default 'unspecified' check(senai_status in ('unspecified','in_progress','completed'));
alter table public.pilot_profiles add column resume_path text not null default '' check(resume_path='' or resume_path like user_id::text||'/%/resume/%');
grant update(has_senai,senai_status,resume_path) on public.pilot_profiles to authenticated;
alter table public.portal_candidate_cards add column has_senai boolean not null default false;
grant select(has_senai) on public.portal_candidate_cards to anon;
grant insert(has_senai),update(has_senai) on public.portal_candidate_cards to authenticated;
create table public.portal_learning_records(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),
 title text not null check(length(btrim(title)) between 3 and 160),institution text not null check(length(btrim(institution)) between 2 and 160),
 level text not null check(level in ('doctorate','masters','postgraduate','degree','technical','course','training')),
 hours numeric check(hours is null or hours>0 and hours<=100000),completed_on date not null check(completed_on<=current_date),
 sphere text not null default 'professional' check(sphere in ('professional','personal','intellectual','spiritual')),
 competencies text not null default '' check(length(competencies)<=1000),evidence_path text not null,
 status text not null default 'pending' check(status in ('pending','verified','rejected')),recommended boolean not null default false,
 reviewed_by uuid references auth.users(id),review_note text not null default '',reviewed_at timestamptz,created_at timestamptz not null default now(),
 check(level not in ('course','training') or hours is not null),
 check(evidence_path like user_id::text||'/'||cohort_id::text||'/evidence/%')
);
create function pilot_private.learning_key(p_text text) returns text language sql immutable set search_path='' as $$select translate(lower(regexp_replace(btrim(p_text),'\s+',' ','g')),'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc')$$;
revoke all on function pilot_private.learning_key(text) from public,anon;grant execute on function pilot_private.learning_key(text) to authenticated,service_role;
create unique index portal_learning_unique on public.portal_learning_records(user_id,cohort_id,pilot_private.learning_key(title),pilot_private.learning_key(institution),(case when level in ('course','training') then 'short' else level end));
create index portal_learning_cohort on public.portal_learning_records(cohort_id,status);create index portal_learning_reviewer on public.portal_learning_records(reviewed_by);
alter table public.portal_learning_records enable row level security;revoke all on public.portal_learning_records from public,anon,authenticated;
grant select,delete on public.portal_learning_records to authenticated;
grant insert(user_id,cohort_id,title,institution,level,hours,completed_on,sphere,competencies,evidence_path),update(title,institution,level,hours,completed_on,sphere,competencies,evidence_path) on public.portal_learning_records to authenticated;
grant all on public.portal_learning_records to service_role;
create policy learning_self on public.portal_learning_records to authenticated using(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner')) with check(user_id=(select auth.uid()) and pilot_private.portal_role(cohort_id) in ('learner','pilot_owner'));
create policy learning_owner on public.portal_learning_records for select to authenticated using(pilot_private.portal_role(cohort_id)='pilot_owner');
create function pilot_private.check_learning_record() returns trigger language plpgsql security definer set search_path='' as $$begin
 if not exists(select 1 from storage.objects where bucket_id='portal-private-files' and name=new.evidence_path) then raise exception 'Envie o comprovante privado antes de salvar';end if;
 if tg_op='UPDATE' and row(new.title,new.institution,new.level,new.hours,new.completed_on,new.sphere,new.competencies,new.evidence_path) is distinct from row(old.title,old.institution,old.level,old.hours,old.completed_on,old.sphere,old.competencies,old.evidence_path) then new.status:='pending';new.reviewed_by:=null;new.reviewed_at:=null;new.review_note:='';new.recommended:=false;end if;return new;end$$;
revoke all on function pilot_private.check_learning_record() from public,anon,authenticated;
create trigger check_learning_record before insert or update on public.portal_learning_records for each row execute function pilot_private.check_learning_record();
create function pilot_private.review_learning(p_id uuid,p_decision text,p_note text,p_recommended boolean) returns void language plpgsql security definer set search_path='' as $$declare r public.portal_learning_records;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 select * into r from public.portal_learning_records where id=p_id for update;
 if not found or pilot_private.portal_role(r.cohort_id) is distinct from 'pilot_owner' then raise exception 'Acesso negado';end if;
 if p_decision is null or p_decision not in ('verified','rejected') or length(btrim(coalesce(p_note,''))) not between 5 and 3000 or p_recommended is null then raise exception 'Confira a decisão e a justificativa';end if;
 update public.portal_learning_records set status=p_decision,review_note=btrim(p_note),recommended=p_recommended and level in ('course','training'),reviewed_by=auth.uid(),reviewed_at=now() where id=p_id;
 insert into public.portal_notifications(cohort_id,user_id,title,body) values(r.cohort_id,r.user_id,'Comprovante analisado',r.title||' — '||case when p_decision='verified' then 'Validado' else 'Não validado' end||'. '||left(p_note,2000));end$$;
create function public.portal_review_learning(p_id uuid,p_decision text,p_note text,p_recommended boolean) returns void language sql security invoker set search_path='' as $$select pilot_private.review_learning(p_id,p_decision,p_note,p_recommended)$$;
revoke all on function pilot_private.review_learning(uuid,text,text,boolean),public.portal_review_learning(uuid,text,text,boolean) from public,anon;
grant execute on function pilot_private.review_learning(uuid,text,text,boolean),public.portal_review_learning(uuid,text,text,boolean) to authenticated;
create function pilot_private.learning_score(p_user uuid,p_cohort uuid) returns numeric language plpgsql stable security definer set search_path='' as $$begin
 if auth.uid() is null or pilot_private.portal_role(p_cohort) is null or (p_user<>auth.uid() and pilot_private.portal_role(p_cohort)<>'pilot_owner' and not exists(select 1 from public.portal_candidate_cards where user_id=p_user and cohort_id=p_cohort and visible and pilot_private.public_candidate_active(user_id,cohort_id))) then raise exception 'Acesso negado';end if;
 return (select coalesce(sum((case level when 'doctorate' then 1200 when 'masters' then 800 when 'postgraduate' then 400 when 'degree' then 300 when 'technical' then 200 when 'course' then hours when 'training' then hours*2 end)*(1+case when recommended and level in ('course','training') then .25 else 0 end+case when completed_on>=current_date-interval '24 months' then .20 else 0 end)),0) from public.portal_learning_records where user_id=p_user and cohort_id=p_cohort and status='verified' and sphere='professional');end
$$;
revoke all on function pilot_private.learning_score(uuid,uuid) from public,anon;
create function public.portal_learning_score(p_user uuid,p_cohort uuid) returns numeric language plpgsql security invoker set search_path='' as $$begin
 if auth.uid() is null or pilot_private.portal_role(p_cohort) is null then raise exception 'Entre na sua conta';end if;
 if p_user<>auth.uid() and pilot_private.portal_role(p_cohort)<>'pilot_owner' and not exists(select 1 from public.portal_candidate_cards where user_id=p_user and cohort_id=p_cohort and visible) then raise exception 'Acesso negado';end if;
 return pilot_private.learning_score(p_user,p_cohort);end$$;
revoke all on function public.portal_learning_score(uuid,uuid) from public,anon;grant execute on function public.portal_learning_score(uuid,uuid),pilot_private.learning_score(uuid,uuid) to authenticated;
-- Subusers never become owners. Organization permissions are checked on every command.
create table public.portal_org_access(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references auth.users(id),user_id uuid not null references auth.users(id),cohort_id uuid not null references public.pilot_cohorts(id),organization_name text not null,user_name text not null,
 permissions text[] not null check(permissions<@array['editProfile','publish','searchCandidates','recruitment']::text[]),status text not null default 'pending' check(status in ('pending','accepted','declined','revoked')),created_at timestamptz not null default now(),unique(organization_id,user_id),check(organization_id<>user_id));
create index portal_org_access_user on public.portal_org_access(user_id,cohort_id);create index portal_org_access_cohort on public.portal_org_access(cohort_id);
alter table public.portal_org_access enable row level security;revoke all on public.portal_org_access from public,anon,authenticated;grant select on public.portal_org_access to authenticated;grant all on public.portal_org_access to service_role;
create policy org_access_participant on public.portal_org_access for select to authenticated using(pilot_private.portal_role(cohort_id) is not null and (organization_id=(select auth.uid()) or user_id=(select auth.uid())));
create function pilot_private.org_permission(p_org uuid,p_cohort uuid,p_permission text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and pilot_private.portal_role(p_cohort) is not null and exists(select 1 from public.pilot_memberships where cohort_id=p_cohort and user_id=p_org and status='active' and role in ('recruiter','school_staff')) and (p_org=auth.uid() or exists(select 1 from public.portal_org_access where organization_id=p_org and user_id=auth.uid() and cohort_id=p_cohort and status='accepted' and p_permission=any(permissions)))
$$;
revoke all on function pilot_private.org_permission(uuid,uuid,text) from public,anon;grant execute on function pilot_private.org_permission(uuid,uuid,text) to authenticated;
create function pilot_private.org_access_command(p_cohort uuid,p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare v_org uuid;v_user uuid;r public.portal_org_access;v_permissions text[];begin
 if auth.uid() is null or pilot_private.portal_role(p_cohort) is null then raise exception 'Entre na sua conta';end if;
 if p_action='invite' then
 v_org:=auth.uid();if pilot_private.portal_role(p_cohort) not in ('recruiter','school_staff') then raise exception 'Acesso negado';end if;
 select u.id into v_user from auth.users u join public.pilot_memberships m on m.user_id=u.id and m.cohort_id=p_cohort and m.status='active' where lower(u.email)=lower(btrim(p_payload->>'email')) and u.email_confirmed_at is not null and m.role<>'pilot_owner';
 if v_user is null or v_user=v_org then raise exception 'O convidado precisa ter conta própria confirmada e cadastro concluído';end if;
 select array_agg(value) into v_permissions from jsonb_array_elements_text(p_payload->'permissions');v_permissions:=coalesce(v_permissions,'{}');
 insert into public.portal_org_access(organization_id,user_id,cohort_id,organization_name,user_name,permissions) values(v_org,v_user,p_cohort,coalesce((select name from public.portal_organizations where user_id=v_org),'Organização cadastrada'),coalesce((select left(raw_user_meta_data->>'display_name',100) from auth.users where id=v_user),'Usuário'),v_permissions)
 on conflict(organization_id,user_id) do update set permissions=excluded.permissions,status='pending';
 insert into public.portal_notifications(cohort_id,user_id,title,body) values(p_cohort,v_user,'Convite de acesso à organização','Abra Acessos e permissões para conferir e responder. Nenhum acesso é liberado antes do aceite.');return '{}'::jsonb;
 elsif p_action in ('accepted','declined','revoked') then
 select * into r from public.portal_org_access where id=(p_payload->>'id')::uuid and cohort_id=p_cohort for update;
 if not found or not((p_action in ('accepted','declined') and r.user_id=auth.uid() and r.status='pending') or (p_action='revoked' and r.organization_id=auth.uid())) then raise exception 'Acesso negado';end if;
 update public.portal_org_access set status=p_action where id=r.id;return '{}'::jsonb;
 else raise exception 'Ação indisponível';end if;end$$;
create function public.portal_org_access_command(p_cohort uuid,p_action text,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select pilot_private.org_access_command(p_cohort,p_action,p_payload)$$;
revoke all on function pilot_private.org_access_command(uuid,text,jsonb),public.portal_org_access_command(uuid,text,jsonb) from public,anon;
grant execute on function pilot_private.org_access_command(uuid,text,jsonb),public.portal_org_access_command(uuid,text,jsonb) to authenticated;
create table public.portal_rubrics(listing_id uuid primary key references public.portal_listings(id),criteria jsonb not null check(jsonb_typeof(criteria)='array' and jsonb_array_length(criteria) between 1 and 10));
create table public.portal_evaluations(application_id uuid primary key references public.portal_applications(id),reviewer_id uuid not null references auth.users(id),grades jsonb not null check(jsonb_typeof(grades)='array'),evidence text not null check(length(btrim(evidence)) between 10 and 3000),average numeric not null,updated_at timestamptz not null default now());
alter table public.portal_rubrics enable row level security;alter table public.portal_evaluations enable row level security;
revoke all on public.portal_rubrics,public.portal_evaluations from public,anon,authenticated;grant all on public.portal_rubrics,public.portal_evaluations to service_role;
create index portal_evaluations_reviewer on public.portal_evaluations(reviewer_id);
create function pilot_private.recruitment_command(p_cohort uuid,p_org uuid,p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare l public.portal_listings;a public.portal_applications;r public.portal_rubrics;v_grades jsonb;v_avg numeric;v_count int;begin
 if auth.uid() is null or not pilot_private.org_permission(p_org,p_cohort,'recruitment') then raise exception 'Acesso negado';end if;
 if p_action='listings' then return coalesce((select jsonb_agg(to_jsonb(x)) from (select id,title,organization from public.portal_listings where cohort_id=p_cohort and publisher_id=p_org and kind='job')x),'[]');end if;
 select * into l from public.portal_listings where id=(p_payload->>'listing')::uuid and cohort_id=p_cohort and publisher_id=p_org and kind='job' for update;if not found then raise exception 'Vaga indisponível';end if;
 if exists(select 1 from public.portal_applications where listing_id=l.id and candidate_id=auth.uid()) then raise exception 'Você participa deste processo como candidato e não pode acessar avaliações internas';end if;
 if p_action='rubric' then
 if exists(select 1 from public.portal_evaluations e join public.portal_applications x on x.id=e.application_id where x.listing_id=l.id) then raise exception 'Critérios congelados após a primeira avaliação';end if;
 if jsonb_typeof(p_payload->'criteria') is distinct from 'array' or jsonb_array_length(p_payload->'criteria') not between 1 and 10 or exists(select 1 from jsonb_array_elements(p_payload->'criteria') c where jsonb_typeof(c)<>'string' or length(btrim(c#>>'{}')) not between 2 and 100) then raise exception 'Informe de 1 a 10 critérios válidos';end if;
 insert into public.portal_rubrics(listing_id,criteria) values(l.id,p_payload->'criteria') on conflict(listing_id) do update set criteria=excluded.criteria;return '{}';
 elsif p_action='evaluate' then
 select * into a from public.portal_applications where id=(p_payload->>'application')::uuid and listing_id=l.id;
 if not found or a.status in ('withdrawn','rejected') or not exists(select 1 from public.portal_interviews where application_id=a.id and status='confirmed' and ends_at<=now()) then raise exception 'Avalie somente após uma entrevista confirmada e encerrada';end if;
 select * into r from public.portal_rubrics where listing_id=l.id;if not found then raise exception 'Defina os critérios comuns primeiro';end if;
 v_grades:=p_payload->'grades';if jsonb_typeof(v_grades) is distinct from 'array' or jsonb_array_length(v_grades)<>jsonb_array_length(r.criteria) or exists(select 1 from jsonb_array_elements(v_grades) g where jsonb_typeof(g)<>'number' or (g#>>'{}')::numeric not between 0 and 10) then raise exception 'Use uma nota de 0 a 10 para cada critério';end if;
 select avg((g#>>'{}')::numeric) into v_avg from jsonb_array_elements(v_grades) g;
 insert into public.portal_evaluations(application_id,reviewer_id,grades,evidence,average) values(a.id,auth.uid(),v_grades,p_payload->>'evidence',v_avg) on conflict(application_id) do update set reviewer_id=excluded.reviewer_id,grades=excluded.grades,evidence=excluded.evidence,average=excluded.average,updated_at=now();return '{}';
 elsif p_action='overview' then
 return jsonb_build_object('criteria',coalesce((select criteria from public.portal_rubrics where listing_id=l.id),'[]'),
 'applications',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'name',x.resume_snapshot->>'display_name','status',x.status,'ended',exists(select 1 from public.portal_interviews where application_id=x.id and status='confirmed' and ends_at<=now()))) from public.portal_applications x where x.listing_id=l.id),'[]'),
 'ranking',coalesce((select jsonb_agg(to_jsonb(x) order by position,name) from (select dense_rank() over(order by e.average desc) as position,app_row.resume_snapshot->>'display_name' as name,e.average,e.evidence,e.grades,e.application_id from public.portal_evaluations e join public.portal_applications app_row on app_row.id=e.application_id where app_row.listing_id=l.id and app_row.status<>'withdrawn')x),'[]'));
 else raise exception 'Ação indisponível';end if;end$$;
create function public.portal_recruitment_command(p_cohort uuid,p_org uuid,p_action text,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select pilot_private.recruitment_command(p_cohort,p_org,p_action,p_payload)$$;
revoke all on function pilot_private.recruitment_command(uuid,uuid,text,jsonb),public.portal_recruitment_command(uuid,uuid,text,jsonb) from public,anon;
grant execute on function pilot_private.recruitment_command(uuid,uuid,text,jsonb),public.portal_recruitment_command(uuid,uuid,text,jsonb) to authenticated;
-- Only narrowly authorized commands can operate on behalf of an organization.
create function pilot_private.delegated_command(p_cohort uuid,p_org uuid,p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare v_role text;r public.portal_listings;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 if p_action='getProfile' and pilot_private.org_permission(p_org,p_cohort,'editProfile') then return coalesce((select to_jsonb(o) from public.portal_organizations o where user_id=p_org),'{}');
 elsif p_action='profile' and pilot_private.org_permission(p_org,p_cohort,'editProfile') then
 insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(p_org,p_cohort,btrim(p_payload->>'name'),btrim(p_payload->>'city'),upper(p_payload->>'state_code')) on conflict(user_id) do update set name=excluded.name,city=excluded.city,state_code=excluded.state_code;return '{}';
 elsif p_action='publish' and pilot_private.org_permission(p_org,p_cohort,'publish') then
 select role into v_role from public.pilot_memberships where user_id=p_org and cohort_id=p_cohort and status='active';
 if p_payload->>'kind'='job' and v_role<>'recruiter' then raise exception 'Vagas somente para empresas';end if;
 insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type) values(p_cohort,p_org,p_payload->>'kind',p_payload->>'title',p_payload->>'organization',p_payload->>'description',p_payload->>'postal_code',p_payload->>'city',p_payload->>'state_code',p_payload->>'modality',case when p_payload->>'kind'='job' then p_payload->>'job_type' else null end) returning * into r;return to_jsonb(r);
 elsif p_action='candidates' and pilot_private.org_permission(p_org,p_cohort,'searchCandidates') then
 return coalesce((select jsonb_agg(to_jsonb(x)) from (select id,name,headline,city,state_code,skills,has_senai from public.portal_candidate_cards where cohort_id=p_cohort and visible and pilot_private.public_candidate_active(user_id,cohort_id) and (name ilike '%'||left(coalesce(p_payload->>'query',''),100)||'%' or headline ilike '%'||left(coalesce(p_payload->>'query',''),100)||'%') limit 100)x),'[]');
 else raise exception 'Permissão indisponível. Compras e gestão de acessos são exclusivas do responsável principal';end if;end$$;
create function public.portal_delegated_command(p_cohort uuid,p_org uuid,p_action text,p_payload jsonb) returns jsonb language sql security invoker set search_path='' as $$select pilot_private.delegated_command(p_cohort,p_org,p_action,p_payload)$$;
revoke all on function pilot_private.delegated_command(uuid,uuid,text,jsonb),public.portal_delegated_command(uuid,uuid,text,jsonb) from public,anon;
grant execute on function pilot_private.delegated_command(uuid,uuid,text,jsonb),public.portal_delegated_command(uuid,uuid,text,jsonb) to authenticated;
notify pgrst,'reload schema';
create function pilot_private.search_scored_candidates(p_cohort uuid,p_query text,p_city text,p_senai boolean,p_page integer) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if auth.uid() is null or pilot_private.portal_role(p_cohort) is null then raise exception 'Entre na sua conta';end if;
 if p_page is null or p_page not between 0 and 1000 then raise exception 'Página inválida';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)) from (select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.is_fictitious,c.is_featured,c.demo_resume,c.has_senai,pilot_private.learning_score(c.user_id,c.cohort_id) as professional_points from public.portal_candidate_cards c where c.cohort_id=p_cohort and c.visible and pilot_private.public_candidate_active(c.user_id,c.cohort_id) and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%' or c.skills ilike '%'||left(p_query,100)||'%') and (coalesce(p_city,'')='' or c.city ilike '%'||left(p_city,100)||'%') and (not coalesce(p_senai,false) or c.has_senai) order by c.is_featured desc,professional_points desc,lower(c.name),c.id offset p_page*30 limit 30)x),'[]');end$$;
create function public.portal_search_scored_candidates(p_cohort uuid,p_query text,p_city text,p_senai boolean,p_page integer) returns jsonb language sql security invoker set search_path='' as $$select pilot_private.search_scored_candidates(p_cohort,p_query,p_city,p_senai,p_page)$$;
revoke all on function pilot_private.search_scored_candidates(uuid,text,text,boolean,integer),public.portal_search_scored_candidates(uuid,text,text,boolean,integer) from public,anon;
grant execute on function pilot_private.search_scored_candidates(uuid,text,text,boolean,integer),public.portal_search_scored_candidates(uuid,text,text,boolean,integer) to authenticated;
