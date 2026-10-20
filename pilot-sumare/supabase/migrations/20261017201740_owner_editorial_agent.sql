-- Owner-only editorial queue; clients never receive service write permissions.
create table public.portal_editorial_runs (
 id uuid primary key default gen_random_uuid(),
 cohort_id uuid not null references public.pilot_cohorts(id),
 actor_id uuid not null references auth.users(id),
 action text not null check(action in ('research','draft')),
 period date not null,
 slot integer not null check(slot between 1 and 3),
 status text not null default 'running' check(status in ('running','completed','failed')),
 usage jsonb not null default '{}',
 error text,
 created_at timestamptz not null default now(),
 finished_at timestamptz,
 unique(cohort_id,action,period,slot)
);
create table public.portal_editorial_items (
 id uuid primary key default gen_random_uuid(),
 cohort_id uuid not null references public.pilot_cohorts(id),
 run_id uuid not null references public.portal_editorial_runs(id),
 title text not null check(length(title) between 5 and 160),
 category text not null check(category in ('Carreira','Entrevistas com RH','Legislação trabalhista')),
 audience text not null check(audience in ('Candidatos','Empresas','Instituições de ensino','Comunidade')),
 summary text not null check(length(summary) between 10 and 400),
 reason text not null,
 sources jsonb not null check(jsonb_typeof(sources)='array' and jsonb_array_length(sources) between 1 and 8),
 body text not null default '' check(length(body)<=30000),
 review_notes text not null default '',
 status text not null default 'suggested' check(status in ('suggested','review','discarded','sent')),
 blog_post_id uuid unique references public.portal_blog_posts(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index portal_editorial_items_cohort on public.portal_editorial_items(cohort_id,created_at desc);
create index portal_editorial_runs_actor on public.portal_editorial_runs(actor_id);
create index portal_editorial_items_run on public.portal_editorial_items(run_id);
alter table public.portal_editorial_runs enable row level security;
alter table public.portal_editorial_items enable row level security;
revoke all on public.portal_editorial_runs,public.portal_editorial_items from public,anon,authenticated;
grant select on public.portal_editorial_runs,public.portal_editorial_items to authenticated;
grant all on public.portal_editorial_runs,public.portal_editorial_items to service_role;
create policy editorial_owner_runs on public.portal_editorial_runs for select to authenticated using(exists(select 1 from public.pilot_memberships m where m.cohort_id=portal_editorial_runs.cohort_id and m.user_id=(select auth.uid()) and m.role='pilot_owner' and m.status='active'));
create policy editorial_owner_items on public.portal_editorial_items for select to authenticated using(exists(select 1 from public.pilot_memberships m where m.cohort_id=portal_editorial_items.cohort_id and m.user_id=(select auth.uid()) and m.role='pilot_owner' and m.status='active'));
-- Service-only invoker functions. Advisory locks make caps atomic across concurrent requests.
create function public.portal_editorial_reserve(p_actor uuid,p_cohort uuid,p_action text) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_period date; v_limit integer; v_slot integer; v_id uuid;
begin
 if not exists(select 1 from public.pilot_memberships where user_id=p_actor and cohort_id=p_cohort and role='pilot_owner' and status='active') then raise exception 'Proprietário obrigatório'; end if;
 if p_action not in ('research','draft') then raise exception 'Ação inválida'; end if;
 v_period:=(now() at time zone 'America/Sao_Paulo')::date;
 v_limit:=1;
 if p_action='draft' then v_period:=date_trunc('week',now() at time zone 'America/Sao_Paulo')::date; v_limit:=3; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_cohort::text||p_action||v_period::text,0));
 select coalesce(max(slot),0)+1 into v_slot from public.portal_editorial_runs where cohort_id=p_cohort and action=p_action and period=v_period;
 if v_slot>v_limit then raise exception 'Limite atingido. Pesquisas: 1 por dia; rascunhos: 3 por semana. Tentativas com falha também contam.'; end if;
 insert into public.portal_editorial_runs(cohort_id,actor_id,action,period,slot) values(p_cohort,p_actor,p_action,v_period,v_slot) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.portal_editorial_reserve(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.portal_editorial_reserve(uuid,uuid,text) to service_role;
create function public.portal_editorial_send(p_actor uuid,p_cohort uuid,p_item uuid) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_item public.portal_editorial_items; v_post uuid;
begin
 if not exists(select 1 from public.pilot_memberships where user_id=p_actor and cohort_id=p_cohort and role='pilot_owner' and status='active') or not exists(select 1 from public.portal_blog_editors where user_id=p_actor) then raise exception 'Proprietário e editor obrigatórios'; end if;
 select * into v_item from public.portal_editorial_items where id=p_item and cohort_id=p_cohort for update;
 if not found then raise exception 'Pauta indisponível'; end if;
 if v_item.blog_post_id is not null then return v_item.blog_post_id; end if;
 if v_item.status<>'review' or length(btrim(v_item.body))<30 then raise exception 'Revise o rascunho antes de enviar'; end if;
 insert into public.portal_blog_posts(title,category,summary,body,source_url,status) values(v_item.title,v_item.category,v_item.summary,v_item.body,v_item.sources->0->>'url','draft') returning id into v_post;
 update public.portal_editorial_items set status='sent',blog_post_id=v_post,updated_at=now() where id=p_item;
 return v_post;
end $$;
revoke all on function public.portal_editorial_send(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_editorial_send(uuid,uuid,uuid) to service_role;
