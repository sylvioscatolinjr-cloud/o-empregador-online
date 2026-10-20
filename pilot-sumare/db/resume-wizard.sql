-- Compact, normalized raster images stay under existing row access policies.
create function pilot_private.valid_profile_image(v text) returns boolean language sql immutable set search_path='' as $$select v='' or (length(v)<=180000 and v ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$')$$;
revoke all on function pilot_private.valid_profile_image(text) from public;
grant execute on function pilot_private.valid_profile_image(text) to authenticated,service_role;
alter table public.pilot_profiles add column resume_details jsonb not null default '{}' check(jsonb_typeof(resume_details)='object' and octet_length(resume_details::text)<=80000);
alter table public.pilot_profiles add column photo_data text not null default '' check(pilot_private.valid_profile_image(photo_data));
grant update(resume_details,photo_data) on public.pilot_profiles to authenticated;
alter table public.portal_organizations add column logo_data text not null default '' check(pilot_private.valid_profile_image(logo_data));
grant insert(logo_data),update(logo_data) on public.portal_organizations to authenticated;
alter table public.portal_listings add column logo_data text not null default '' check(pilot_private.valid_profile_image(logo_data));
grant select(logo_data) on public.portal_listings to anon;
-- Only the owner edits organization logos; listings receive the stored value.
create function pilot_private.capture_organization_logo() returns trigger language plpgsql security definer set search_path='' as $$begin new.logo_data=coalesce((select logo_data from public.portal_organizations where user_id=new.publisher_id),'');return new;end$$;
revoke all on function pilot_private.capture_organization_logo() from public,anon,authenticated;
create trigger capture_organization_logo before insert or update of publisher_id,logo_data on public.portal_listings for each row execute function pilot_private.capture_organization_logo();
create function pilot_private.sync_organization_logo() returns trigger language plpgsql security definer set search_path='' as $$begin update public.portal_listings set logo_data=new.logo_data where publisher_id=new.user_id;return new;end$$;
revoke all on function pilot_private.sync_organization_logo() from public,anon,authenticated;
create trigger sync_organization_logo after insert or update of logo_data on public.portal_organizations for each row execute function pilot_private.sync_organization_logo();
-- New optional data is copied only on an explicitly confirmed job application.
create function pilot_private.capture_optional_resume() returns trigger language plpgsql security definer set search_path='' as $$
declare p public.pilot_profiles;begin
 if (select kind from public.portal_listings where id=new.listing_id)<>'job' then return new;end if;
 select * into p from public.pilot_profiles where user_id=new.candidate_id;
 if p.resume_details->'share_contact'='true'::jsonb then new.resume_snapshot=new.resume_snapshot||jsonb_build_object('contact',concat_ws(' · ',nullif(p.resume_details#>>'{contact,phone}',''),nullif(p.resume_details#>>'{contact,email}','')));end if;
 if p.resume_details->'share_optional'='true'::jsonb then new.resume_snapshot=new.resume_snapshot||jsonb_build_object('optional_info',concat_ws(' · ',nullif(p.resume_details#>>'{contact,address}',''),nullif(p.resume_details#>>'{contact,postal_code}',''),nullif(p.resume_details#>>'{contact,birth_date}',''),nullif(p.resume_details#>>'{contact,marital_status}',''),nullif(p.resume_details#>>'{contact,nationality}',''),nullif(p.resume_details#>>'{contact,driving_license}','')));end if;
 if p.resume_details->'share_photo'='true'::jsonb and p.photo_data<>'' then new.resume_snapshot=new.resume_snapshot||jsonb_build_object('photo_data',p.photo_data);end if;
 return new;end$$;
revoke all on function pilot_private.capture_optional_resume() from public,anon,authenticated;
-- Alphabetical trigger order: run after capture_application has created its safe snapshot.
create trigger capture_optional_resume before insert on public.portal_applications for each row execute function pilot_private.capture_optional_resume();
