create table public.portal_blog_editors (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portal_blog_editors enable row level security;
revoke all on public.portal_blog_editors from public,anon,authenticated;
grant select on public.portal_blog_editors to authenticated;
grant all on public.portal_blog_editors to service_role;
create policy editor_self on public.portal_blog_editors for select to authenticated using(user_id=(select auth.uid()));
create table public.portal_blog_posts (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(btrim(title)) between 5 and 160),
 category text not null check(category in ('Carreira','Entrevistas com RH','Legislação trabalhista','Resultados')),
 summary text not null check(length(btrim(summary)) between 10 and 400),
 body text not null check(length(btrim(body)) between 30 and 30000),
 source_url text not null default '' check(source_url='' or source_url ~ '^https://[^[:space:]]+$'),
 status text not null default 'draft' check(status in ('draft','published')),
 created_at timestamptz not null default now(),
 published_at timestamptz,
 check(status<>'published' or published_at is not null),
 check(category<>'Resultados' or status='draft')
);
alter table public.portal_blog_posts enable row level security;
revoke all on public.portal_blog_posts from public,anon,authenticated;
grant select on public.portal_blog_posts to anon,authenticated;
grant insert,update,delete on public.portal_blog_posts to authenticated;
grant all on public.portal_blog_posts to service_role;
create index portal_blog_published on public.portal_blog_posts(published_at desc) where status='published';
create policy blog_read on public.portal_blog_posts for select to anon,authenticated using(status='published');
create policy blog_editor_read on public.portal_blog_posts for select to authenticated using(exists(select 1 from public.portal_blog_editors where user_id=(select auth.uid())));
create policy blog_editor_insert on public.portal_blog_posts for insert to authenticated with check(exists(select 1 from public.portal_blog_editors where user_id=(select auth.uid())));
create policy blog_editor_update on public.portal_blog_posts for update to authenticated using(exists(select 1 from public.portal_blog_editors where user_id=(select auth.uid()))) with check(exists(select 1 from public.portal_blog_editors where user_id=(select auth.uid())));
create policy blog_editor_delete on public.portal_blog_posts for delete to authenticated using(exists(select 1 from public.portal_blog_editors where user_id=(select auth.uid())));
create function public.portal_valid_wishes(courses text[]) returns boolean language sql immutable security invoker set search_path='' as $$
 select coalesce(array_ndims(courses)=1 and cardinality(courses) between 1 and 5
 and not exists(select 1 from unnest(courses) c where c is null or length(btrim(c)) not between 2 and 120)
 and (select count(distinct lower(btrim(c))) from unnest(courses) c)=cardinality(courses),false)
$$;
revoke all on function public.portal_valid_wishes(text[]) from public;
grant execute on function public.portal_valid_wishes(text[]) to authenticated,service_role;
create table public.portal_course_wishlists(
 user_id uuid primary key references auth.users(id) on delete cascade,
 courses text[] not null check(public.portal_valid_wishes(courses)),
 modality text not null default 'Indiferente' check(modality in ('Indiferente','Presencial','Online','Híbrido')),
 updated_at timestamptz not null default now()
);
alter table public.portal_course_wishlists enable row level security;
revoke all on public.portal_course_wishlists from public,anon,authenticated;
grant select,insert,update,delete on public.portal_course_wishlists to authenticated;
grant all on public.portal_course_wishlists to service_role;
create policy wishes_read on public.portal_course_wishlists for select to authenticated using(user_id=(select auth.uid()));
create policy wishes_insert on public.portal_course_wishlists for insert to authenticated with check(user_id=(select auth.uid()));
create policy wishes_update on public.portal_course_wishlists for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy wishes_delete on public.portal_course_wishlists for delete to authenticated using(user_id=(select auth.uid()));
insert into public.portal_blog_editors(user_id) select id from auth.users where lower(email)='sylvio.scatolin.jr@gmail.com' and email_confirmed_at is not null on conflict do nothing;
