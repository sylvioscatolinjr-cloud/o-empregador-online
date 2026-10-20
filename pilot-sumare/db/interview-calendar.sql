create table public.portal_interviews(
 application_id uuid primary key references public.portal_applications(id) on delete cascade,
 starts_at timestamptz not null,ends_at timestamptz not null,
 location text not null check(length(btrim(location)) between 3 and 500),
 meeting_url text not null default '' check(meeting_url='' or (meeting_url ~ '^https://[^[:space:]]+$' and length(meeting_url)<=1000)),
 status text not null default 'proposed' check(status in ('proposed','confirmed','declined','cancelled')),
 revision integer not null default 1,updated_at timestamptz not null default now(),
 check(ends_at>starts_at and ends_at<=starts_at+interval '8 hours')
);
alter table public.portal_interviews enable row level security;
revoke all on public.portal_interviews from public,anon,authenticated;
grant select on public.portal_interviews to authenticated;
grant all on public.portal_interviews to service_role;
create policy interview_participants on public.portal_interviews for select to authenticated using(exists(select 1 from public.portal_applications a join public.portal_listings l on l.id=a.listing_id where a.id=application_id and pilot_private.portal_role(a.cohort_id) is not null and (a.candidate_id=(select auth.uid()) or l.publisher_id=(select auth.uid()))));
create function pilot_private.propose_interview(p_application uuid,p_start timestamptz,p_end timestamptz,p_location text,p_url text,p_revision integer) returns void language plpgsql security definer set search_path='' as $$
declare a public.portal_applications;l public.portal_listings;v_revision integer;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 select * into a from public.portal_applications where id=p_application for update;
 if not found then raise exception 'Participação indisponível';end if;
 select * into l from public.portal_listings where id=a.listing_id;
 if l.publisher_id<>auth.uid() or pilot_private.portal_role(a.cohort_id) is distinct from 'recruiter' or l.kind<>'job' then raise exception 'Acesso negado';end if;
 if a.status in ('withdrawn','rejected') or l.status<>'published' then raise exception 'Processo encerrado';end if;
 select revision into v_revision from public.portal_interviews where application_id=p_application;
 if coalesce(v_revision,0) is distinct from p_revision then raise exception 'Horário alterado. Atualize a página';end if;
 if p_start is null or p_end is null or p_start<=now() or p_end<=p_start or p_end>p_start+interval '8 hours' or length(btrim(coalesce(p_location,''))) not between 3 and 500 or p_url is null or (p_url<>'' and (p_url !~ '^https://[^[:space:]]+$' or length(p_url)>1000)) then raise exception 'Confira data futura, duração, local e link HTTPS';end if;
 insert into public.portal_interviews(application_id,starts_at,ends_at,location,meeting_url) values(p_application,p_start,p_end,btrim(p_location),p_url)
 on conflict(application_id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at,location=excluded.location,meeting_url=excluded.meeting_url,status='proposed',revision=portal_interviews.revision+1,updated_at=now();
 update public.portal_applications set status='interview',updated_at=now() where id=p_application;
 insert into public.portal_notifications(cohort_id,user_id,title,body,listing_id) values(a.cohort_id,a.candidate_id,'Horário de entrevista proposto',left(l.title,160)||'. Abra suas candidaturas para aceitar ou recusar. Horário de Brasília: '||to_char(p_start at time zone 'America/Sao_Paulo','DD/MM/YYYY HH24:MI'),l.id);
end$$;
create function pilot_private.reply_interview(p_application uuid,p_action text,p_revision integer) returns void language plpgsql security definer set search_path='' as $$
declare a public.portal_applications;l public.portal_listings;i public.portal_interviews;v_candidate boolean;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 select * into a from public.portal_applications where id=p_application for update;if not found then raise exception 'Participação indisponível';end if;
 select * into l from public.portal_listings where id=a.listing_id;
 v_candidate:=a.candidate_id=auth.uid();
 if pilot_private.portal_role(a.cohort_id) is null or not(v_candidate or l.publisher_id=auth.uid()) then raise exception 'Acesso negado';end if;
 select * into i from public.portal_interviews where application_id=p_application for update;
 if not found or i.revision is distinct from p_revision then raise exception 'Horário alterado. Atualize a página';end if;
 if p_action is null or p_action not in ('confirmed','declined','cancelled') or (p_action in ('confirmed','declined') and (not v_candidate or i.status<>'proposed')) or (p_action='cancelled' and i.status not in ('proposed','confirmed')) then raise exception 'Ação indisponível';end if;
 if p_action='confirmed' and (i.starts_at<=now() or a.status in ('withdrawn','rejected') or l.status<>'published') then raise exception 'Entrevista indisponível';end if;
 update public.portal_interviews set status=p_action,revision=revision+1,updated_at=now() where application_id=p_application;
 insert into public.portal_notifications(cohort_id,user_id,title,body,listing_id) values(a.cohort_id,case when v_candidate then l.publisher_id else a.candidate_id end,'Atualização da entrevista',left(l.title,160)||' — '||case p_action when 'confirmed' then 'Confirmada' when 'declined' then 'Horário recusado' else 'Cancelada — atualize também sua agenda externa' end,l.id);
end$$;
create function public.portal_propose_interview(p_application uuid,p_start timestamptz,p_end timestamptz,p_location text,p_url text,p_revision integer) returns void language sql security invoker set search_path='' as $$select pilot_private.propose_interview(p_application,p_start,p_end,p_location,p_url,p_revision)$$;
create function public.portal_reply_interview(p_application uuid,p_action text,p_revision integer) returns void language sql security invoker set search_path='' as $$select pilot_private.reply_interview(p_application,p_action,p_revision)$$;
revoke all on function pilot_private.propose_interview(uuid,timestamptz,timestamptz,text,text,integer),pilot_private.reply_interview(uuid,text,integer),public.portal_propose_interview(uuid,timestamptz,timestamptz,text,text,integer),public.portal_reply_interview(uuid,text,integer) from public,anon;
grant execute on function pilot_private.propose_interview(uuid,timestamptz,timestamptz,text,text,integer),pilot_private.reply_interview(uuid,text,integer),public.portal_propose_interview(uuid,timestamptz,timestamptz,text,text,integer),public.portal_reply_interview(uuid,text,integer) to authenticated;
create function pilot_private.cancel_unavailable_interview() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.status in ('withdrawn','rejected') and new.status is distinct from old.status then
 update public.portal_interviews set status='cancelled',revision=revision+1,updated_at=now() where application_id=new.id and status in ('proposed','confirmed');end if;return new;end$$;
revoke all on function pilot_private.cancel_unavailable_interview() from public,anon,authenticated;
create trigger cancel_unavailable_interview after update of status on public.portal_applications for each row execute function pilot_private.cancel_unavailable_interview();
notify pgrst,'reload schema';
