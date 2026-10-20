begin;
do $$
declare v_owner uuid; v_cohort uuid; v_run uuid; v_item uuid; v_post uuid; v_retry uuid; v_count integer;
begin
 select user_id,cohort_id into strict v_owner,v_cohort from public.pilot_memberships where role='pilot_owner' and status='active' and cohort_id='5d36b59c-4fec-45e1-a74a-c2423a16c3fe' limit 1;
 v_run:=public.portal_editorial_reserve(v_owner,v_cohort,'research');
 begin perform public.portal_editorial_reserve(v_owner,v_cohort,'research');raise exception 'Daily cap failed';exception when others then if sqlerrm not like 'Limite atingido%' then raise; end if;end;
 insert into public.portal_editorial_items(cohort_id,run_id,title,category,audience,summary,reason,sources,body,status) values(v_cohort,v_run,'Verificação editorial temporária','Carreira','Comunidade','Conteúdo fictício restrito à transação de verificação.','Teste de isolamento','[{"url":"https://www.gov.br/","title":"Referência de teste","published_at":null}]','Texto fictício para verificar a transferência como rascunho. Não será publicado.','review') returning id into v_item;
 perform set_config('request.jwt.claim.sub',v_owner::text,true);
 set local role authenticated;
 select count(*) into v_count from public.portal_editorial_items where id=v_item;
 if v_count<>1 then raise exception 'Owner read failed';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 select count(*) into v_count from public.portal_editorial_items where id=v_item;
 if v_count<>0 then raise exception 'Isolation failed';end if;
 reset role;
 v_post:=public.portal_editorial_send(v_owner,v_cohort,v_item);
 v_retry:=public.portal_editorial_send(v_owner,v_cohort,v_item);
 if v_post<>v_retry or not exists(select 1 from public.portal_blog_posts where id=v_post and status='draft') then raise exception 'Draft transfer failed';end if;
 set local role anon;
 select count(*) into v_count from public.portal_blog_posts where id=v_post;
 if v_count<>0 then raise exception 'Draft leaked';end if;
 reset role;
end $$;
rollback;
select 'passed: owner isolation, daily cap, draft-only idempotent transfer; transaction rolled back' as verification;
