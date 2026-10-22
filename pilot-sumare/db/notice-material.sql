create table public.portal_notice_attachments(
 id uuid primary key default gen_random_uuid(),cohort_id uuid not null references public.pilot_cohorts(id),created_by uuid not null references auth.users(id),
 asset_path text not null unique,filename text not null check(length(filename) between 5 and 160),file_type text not null check(file_type in ('pdf','pptx','png','jpg')),
 byte_size integer not null check(byte_size between 10 and 20971520),status text not null default 'pending' check(status in ('pending','ready','used','expired')),
 created_at timestamptz not null default now(),check(asset_path like created_by::text||'/'||cohort_id::text||'/notices/%')
);
create index notice_attachment_drafts on public.portal_notice_attachments(created_by,cohort_id,created_at) where status<>'used';
alter table public.portal_notice_attachments enable row level security;
revoke all on public.portal_notice_attachments from public,anon,authenticated;
grant select,insert,update,delete on public.portal_notice_attachments to service_role;
alter table public.portal_notifications add column access_url text not null default '' check(length(access_url)<=2000 and (access_url='' or access_url ~ '^https://[^[:space:]]+$' and access_url !~ '^https://[^/?#]*@'));
alter table public.portal_notifications add column attachment_id uuid references public.portal_notice_attachments(id);
alter table public.portal_notifications add column attachment_name text not null default '' check(length(attachment_name)<=160);
create index notification_attachment_ref on public.portal_notifications(attachment_id) where attachment_id is not null;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('oeo-notice-private','oeo-notice-private',false,20971520,array['application/pdf','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/png','image/jpeg']);
-- No browser Storage policies: owner uploads scoped signed tokens; recipients get short download links after recipient verification.
create function public.portal_broadcast_material(p_actor uuid,p_cohort uuid,p_role text,p_states text[],p_city text,p_title text,p_body text,p_send boolean,p_access_url text,p_attachment uuid)
returns integer language plpgsql security invoker set search_path='' as $$
declare v_count integer;file public.portal_notice_attachments;begin
 if not exists(select 1 from public.pilot_memberships m join auth.users u on u.id=m.user_id where m.cohort_id=p_cohort and m.user_id=p_actor and m.role='pilot_owner' and m.status='active' and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now())) then raise exception 'Acesso negado';end if;
 if p_role is null or p_role not in ('all','learner','recruiter','school_staff') or p_send is null or length(btrim(coalesce(p_title,''))) not between 1 and 160 or length(btrim(coalesce(p_body,''))) not between 1 and 4000 or length(coalesce(p_city,''))>100 or p_access_url is null or length(p_access_url)>2000 or (p_access_url<>'' and (p_access_url !~ '^https://[^[:space:]]+$' or p_access_url ~ '^https://[^/?#]*@')) then raise exception 'Confira mensagem, link e filtros';end if;
 if p_attachment is not null then
 select * into file from public.portal_notice_attachments where id=p_attachment and cohort_id=p_cohort and created_by=p_actor and status='ready' and created_at>now()-interval '24 hours' for update;
 if not found then raise exception 'Anexo indisponível; envie novamente';end if;
 end if;
 with recipients as(
 select m.user_id from public.pilot_memberships m join auth.users u on u.id=m.user_id and u.email_confirmed_at is not null
 left join public.pilot_profiles p on p.user_id=m.user_id and m.role in ('learner','pilot_owner')
 left join public.portal_organizations o on o.user_id=m.user_id and o.cohort_id=m.cohort_id and m.role in ('recruiter','school_staff')
 where m.cohort_id=p_cohort and m.status='active' and not m.is_fictitious and (u.banned_until is null or u.banned_until<=now()) and (p_role='all' or m.role=p_role)
 and (p_states is null or coalesce(o.state_code,p.state_code)=any(p_states))
 and (coalesce(btrim(p_city),'')='' or lower(coalesce(o.city,p.city))=lower(btrim(p_city)))
 ),sent as(insert into public.portal_notifications(cohort_id,user_id,title,body,access_url,attachment_id,attachment_name)
 select p_cohort,user_id,btrim(p_title),btrim(p_body),p_access_url,p_attachment,coalesce(file.filename,'') from recipients where p_send returning id)
 select case when p_send then (select count(*) from sent) else (select count(*) from recipients) end into v_count;
 if p_send and v_count>0 and p_attachment is not null then update public.portal_notice_attachments set status='used' where id=p_attachment;end if;
 return v_count;
end$$;
revoke all on function public.portal_broadcast_material(uuid,uuid,text,text[],text,text,text,boolean,text,uuid) from public,anon,authenticated;
grant execute on function public.portal_broadcast_material(uuid,uuid,text,text[],text,text,text,boolean,text,uuid) to service_role;
