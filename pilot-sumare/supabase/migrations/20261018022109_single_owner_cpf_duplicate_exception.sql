-- Explicit owner-authorized CPF exception. No raw CPF or lookup key in source.
-- Capture exactly one existing active owner's CPF; abort rather than widen the exception.
do $$
declare v_key text; v_count integer;
begin
 select count(*),min(identity_key) into v_count,v_key from (
  select distinct i.identity_key from pilot_private.user_identities i
  join public.pilot_memberships m using(user_id)
  where m.role='pilot_owner' and m.status='active'
    and i.profile_type='Candidato' and i.identity_key like 'CPF:%'
 ) approved_owner;
 if v_count<>1 then raise exception 'Exceção exige exatamente um CPF de proprietário ativo'; end if;
 alter table pilot_private.user_identities drop constraint user_identities_identity_key_key;
 execute format('create unique index user_identities_non_owner_document_key on pilot_private.user_identities(identity_key) where identity_key <> %L',v_key);
end $$;
-- Existing primary key, immutable registration, verified email and membership roles are unchanged.

