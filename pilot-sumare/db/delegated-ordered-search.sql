CREATE OR REPLACE FUNCTION pilot_private.delegated_command(p_cohort uuid, p_org uuid, p_action text, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare v_role text;r public.portal_listings;v_page integer;begin
 if auth.uid() is null then raise exception 'Entre na sua conta';end if;
 if p_action='getProfile' and pilot_private.org_permission(p_org,p_cohort,'editProfile') then return coalesce((select to_jsonb(o) from public.portal_organizations o where user_id=p_org),'{}');
 elsif p_action='profile' and pilot_private.org_permission(p_org,p_cohort,'editProfile') then
 insert into public.portal_organizations(user_id,cohort_id,name,city,state_code) values(p_org,p_cohort,btrim(p_payload->>'name'),btrim(p_payload->>'city'),upper(p_payload->>'state_code')) on conflict(user_id) do update set name=excluded.name,city=excluded.city,state_code=excluded.state_code;return '{}';
 elsif p_action='publish' and pilot_private.org_permission(p_org,p_cohort,'publish') then
 select role into v_role from public.pilot_memberships where user_id=p_org and cohort_id=p_cohort and status='active';
 if p_payload->>'kind'='job' and v_role<>'recruiter' then raise exception 'Vagas somente para empresas';end if;
 insert into public.portal_listings(cohort_id,publisher_id,kind,title,organization,description,postal_code,city,state_code,modality,job_type) values(p_cohort,p_org,p_payload->>'kind',p_payload->>'title',p_payload->>'organization',p_payload->>'description',p_payload->>'postal_code',p_payload->>'city',p_payload->>'state_code',p_payload->>'modality',case when p_payload->>'kind'='job' then p_payload->>'job_type' else null end) returning * into r;return to_jsonb(r);
 elsif p_action='candidates' and pilot_private.org_permission(p_org,p_cohort,'searchCandidates') then
 if not exists(select 1 from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.user_id=auth.uid() and m.cohort_id=p_cohort and m.status='active' and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=statement_timestamp()))
 or not exists(select 1 from public.pilot_memberships m join auth.users u on u.id=m.user_id
 where m.user_id=p_org and m.cohort_id=p_cohort and m.status='active' and m.role in ('recruiter','school_staff') and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=statement_timestamp()))
 then raise exception 'Acesso indisponível ou revogado';end if;
 if coalesce(p_payload->>'page','0') !~ '^[0-9]{1,4}$' then raise exception 'Página inválida';end if;
 v_page:=coalesce(p_payload->>'page','0')::integer;
 if v_page>1000 then raise exception 'Página inválida';end if;
 return (select coalesce(jsonb_agg(value-'photo_data'-'show_card_image' order by ordinality),'[]'::jsonb) from jsonb_array_elements(public.portal_ordered_public_feed(p_cohort,'candidates',left(coalesce(p_payload->>'query',''),100),v_page,30)) with ordinality);
 else raise exception 'Permissão indisponível. Compras e gestão de acessos são exclusivas do responsável principal';end if;end$function$
;
