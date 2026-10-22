-- Synthetic records only; all mutations rolled back, no provider calls.
begin;
set local lock_timeout='3s';set local statement_timeout='30s';
do $$declare u uuid:=gen_random_uuid();begin
 insert into auth.users(id,aud,role,email,created_at,updated_at) values(u,'authenticated','authenticated','oeo-learning-probe-'||u::text||'@example.invalid',now(),now());
 perform set_config('oeo.training_probe',u::text,true);
end $$;
set local role service_role;
do $$declare u uuid:=current_setting('oeo.training_probe')::uuid;c uuid:='5d36b59c-4fec-45e1-a74a-c2423a16c3fe';p jsonb;i integer;begin
 p:=public.portal_training_record(u,c,'learner','cand-curriculo',null,40,false);
 for i in 0..3 loop p:=public.portal_training_record(u,c,'learner','cand-curriculo',i,null,false);end loop;
 p:=public.portal_training_record(u,c,'learner','cand-curriculo',1,80,true);
 if p->>'completed_at' is null or (p->>'best_score')::integer<>80 or jsonb_array_length(p->'completed_lessons')<>4 then raise exception 'completion mismatch';end if;
 p:=public.portal_training_record(u,c,'learner','cand-curriculo',null,20,false);
 if (p->>'best_score')::integer<>80 then raise exception 'best score regressed';end if;
 insert into public.portal_oeo_learning(cohort_id,created_by,audiences,kind,module,title,description,tier,source_type,external_url,published) values(c,u,array['learner'],'training','Synthetic','SYNTHETIC ROLLBACK PROBE','Synthetic data for transactional verification only.',0,'link','https://example.invalid',false);
end $$;
reset role;
select jsonb_build_object('progress_completed',(select count(*)=1 from public.portal_training_progress where user_id=current_setting('oeo.training_probe')::uuid and completed_at is not null),'draft_created',(select count(*)=1 from public.portal_oeo_learning where created_by=current_setting('oeo.training_probe')::uuid and not published),'client_cannot_read',not has_table_privilege('authenticated','public.portal_oeo_learning','select'),'client_cannot_call',not has_function_privilege('authenticated','public.portal_training_record(uuid,uuid,text,text,integer,integer,boolean)','execute')) as checks;
rollback;
