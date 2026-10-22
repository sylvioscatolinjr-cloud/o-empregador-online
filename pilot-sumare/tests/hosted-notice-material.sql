begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare co uuid:=gen_random_uuid();owner uuid:=gen_random_uuid();recipient uuid:=gen_random_uuid();asset uuid:=gen_random_uuid();begin
 insert into public.pilot_cohorts(id,slug,school_name,city,starts_at) values(co,'notice-material-probe-'||co::text,'Synthetic rollback probe','Teste',now());
 insert into auth.users(id,aud,role,email,email_confirmed_at,created_at,updated_at) values(owner,'authenticated','authenticated','notice-probe-'||owner::text||'@example.invalid',now(),now(),now()),(recipient,'authenticated','authenticated','notice-probe-'||recipient::text||'@example.invalid',now(),now(),now());
 insert into public.pilot_memberships(user_id,cohort_id,role,status) values(owner,co,'pilot_owner','active'),(recipient,co,'learner','active');
 insert into public.pilot_profiles(user_id,display_name,city,state_code) values(recipient,'Synthetic recipient','Campinas','SP') on conflict(user_id) do update set city='Campinas',state_code='SP';
 insert into public.portal_notice_attachments(id,cohort_id,created_by,asset_path,filename,file_type,byte_size,status) values(asset,co,owner,owner::text||'/'||co::text||'/notices/'||asset::text||'.pdf','Synthetic.pdf','pdf',100,'ready');
 perform set_config('oeo.notice_cohort',co::text,true);perform set_config('oeo.notice_owner',owner::text,true);perform set_config('oeo.notice_asset',asset::text,true);perform set_config('oeo.notice_recipient',recipient::text,true);
end$$;
set local role service_role;
do $$declare co uuid:=current_setting('oeo.notice_cohort')::uuid;owner uuid:=current_setting('oeo.notice_owner')::uuid;asset uuid:=current_setting('oeo.notice_asset')::uuid;r integer;n public.portal_notifications;begin
 r:=public.portal_broadcast_material(owner,co,'learner',array['SP'],'Campinas','Synthetic notice','Synthetic message',false,'https://example.invalid/material',asset);
 if r<>1 or exists(select 1 from public.portal_notifications where cohort_id=co) then raise exception 'preview mismatch';end if;
 r:=public.portal_broadcast_material(owner,co,'learner',array['SP'],'Campinas','Synthetic notice','Synthetic message',true,'https://example.invalid/material',asset);
 if r<>1 then raise exception 'send count mismatch';end if;
 select * into n from public.portal_notifications where cohort_id=co;
 if n.user_id<>current_setting('oeo.notice_recipient')::uuid or n.attachment_id<>asset or n.attachment_name<>'Synthetic.pdf' or n.access_url<>'https://example.invalid/material' then raise exception 'recipient or material mismatch';end if;
 if (select status from public.portal_notice_attachments where id=asset)<>'used' then raise exception 'attachment not bound';end if;
end$$;
reset role;
do $$begin
 if has_table_privilege('authenticated','public.portal_notice_attachments','SELECT') or has_function_privilege('anon','public.portal_broadcast_material(uuid,uuid,text,text[],text,text,text,boolean,text,uuid)','EXECUTE') then raise exception 'client access leaked';end if;
 if (select public from storage.buckets where id='oeo-notice-private') then raise exception 'bucket is public';end if;
end$$;
rollback;
select true as transactional_notice_material_probe_passed;
