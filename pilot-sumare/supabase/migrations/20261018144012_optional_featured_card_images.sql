-- Explicit, revocable image publication; uploads alone never publish candidate photos.
alter table public.portal_candidate_cards add column show_card_image boolean not null default false;
alter table public.portal_candidate_cards add column photo_data text not null default '' check(pilot_private.valid_profile_image(photo_data));
grant update(show_card_image) on public.portal_candidate_cards to authenticated;
grant select(photo_data,show_card_image) on public.portal_candidate_cards to anon;
create function pilot_private.capture_card_photo() returns trigger language plpgsql security definer set search_path='' as $$begin
 new.photo_data=case when new.visible and new.show_card_image then coalesce((select photo_data from public.pilot_profiles where user_id=new.user_id),'') else '' end;
 return new;end$$;
revoke all on function pilot_private.capture_card_photo() from public,anon,authenticated;
create trigger capture_card_photo before insert or update on public.portal_candidate_cards for each row execute function pilot_private.capture_card_photo();
create function pilot_private.sync_card_photo() returns trigger language plpgsql security definer set search_path='' as $$begin
 update public.portal_candidate_cards set photo_data='' where user_id=new.user_id;
 return new;end$$;
revoke all on function pilot_private.sync_card_photo() from public,anon,authenticated;
create trigger sync_card_photo after update of photo_data on public.pilot_profiles for each row execute function pilot_private.sync_card_photo();

alter table public.portal_organizations add column show_card_image boolean not null default false;
grant insert(show_card_image),update(show_card_image) on public.portal_organizations to authenticated;
create or replace function pilot_private.capture_organization_logo() returns trigger language plpgsql security definer set search_path='' as $$begin
 new.logo_data=coalesce((select case when show_card_image then logo_data else '' end from public.portal_organizations where user_id=new.publisher_id),'');return new;end$$;
drop trigger sync_organization_logo on public.portal_organizations;
create trigger sync_organization_logo after insert or update of logo_data,show_card_image on public.portal_organizations for each row execute function pilot_private.sync_organization_logo();
-- Existing uploads do not imply opt-in to publication.
update public.portal_listings set logo_data='';

create or replace function pilot_private.search_scored_candidates(p_cohort uuid,p_query text,p_city text,p_senai boolean,p_page integer) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if auth.uid() is null or coalesce(pilot_private.portal_role(p_cohort),'') not in ('recruiter','school_staff','pilot_owner') then raise exception 'Busca de currículos indisponível para este perfil';end if;
 if auth.uid() is null or pilot_private.portal_role(p_cohort) is null then raise exception 'Entre na sua conta';end if;
 if p_page is null or p_page not between 0 and 1000 then raise exception 'Página inválida';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)) from (select c.id,c.name,c.headline,c.city,c.state_code,c.skills,c.is_fictitious,c.is_featured,c.demo_resume,c.has_senai,c.photo_data,c.show_card_image,pilot_private.learning_score(c.user_id,c.cohort_id) as professional_points from public.portal_candidate_cards c where c.cohort_id=p_cohort and c.visible and pilot_private.public_candidate_active(c.user_id,c.cohort_id) and (coalesce(p_query,'')='' or c.name ilike '%'||left(p_query,100)||'%' or c.headline ilike '%'||left(p_query,100)||'%' or c.skills ilike '%'||left(p_query,100)||'%') and (coalesce(p_city,'')='' or c.city ilike '%'||left(p_city,100)||'%') and (not coalesce(p_senai,false) or c.has_senai) order by c.is_featured desc,professional_points desc,lower(c.name),c.id offset p_page*30 limit 30)x),'[]');end$$;
