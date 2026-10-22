-- Homologacao xxirjbsbfxwzplrcbbjt only. All fixtures roll back. No external payment or AI call.
begin;
create temp table oeo_credit_probe_result(label text, passed boolean);
do $$
declare u uuid:=gen_random_uuid(); other_u uuid:=gen_random_uuid(); o uuid:=gen_random_uuid(); r uuid:=gen_random_uuid(); p text:='SYNTHETIC-CREDIT-PROBE-'||gen_random_uuid()::text; n integer; denied boolean;
begin
 insert into auth.users(id,aud,role,email,created_at,updated_at) values(u,'authenticated','authenticated','credit-probe-'||u::text||'@example.invalid',now(),now());
 insert into public.billing_live_orders(id,user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version,status)
 values(o,u,'5956c4b2-ac81-449b-ac7f-6b1314a93e59','Candidato',1,'MONTHLY',1990,398,1,'SYNTHETIC-NO-PAYMENT','active');
 insert into public.billing_live_payments(id,order_id,status,cents,period_start,period_end,credit_cents,spent_cents,eligible,checked_at)
 values(p,o,'SYNTHETIC_TEST',1990,now()-interval '1 day',now()+interval '1 day',398,0,true,now());
 perform set_config('request.jwt.claim.role','service_role',true);
 perform set_config('request.jwt.claims','{"role":"service_role"}',true);
 n:=public.portal_ai_paid_reserve(u,r); if n<>298 then raise exception 'reserve amount mismatch'; end if;
 insert into oeo_credit_probe_result values('reserva exata de 100 centavos',true);
 denied:=false;begin perform public.portal_ai_paid_reserve(u,r);exception when others then if sqlerrm like '%duplicate request%' then denied:=true;else raise;end if;end;
 if not denied then raise exception 'duplicate accepted';end if;
 insert into oeo_credit_probe_result values('pedido duplicado bloqueado',true);
 denied:=false;begin perform public.portal_ai_paid_refund(other_u,r);exception when others then if sqlerrm like '%reservation not found%' then denied:=true;else raise;end if;end;
 if not denied then raise exception 'foreign refund accepted';end if;
 insert into oeo_credit_probe_result values('estorno de outro usuario bloqueado',true);
 n:=public.portal_ai_paid_refund(u,r);if n<>398 then raise exception 'refund mismatch';end if;
 n:=public.portal_ai_paid_refund(u,r);if n<>398 then raise exception 'repeated refund mismatch';end if;
 insert into oeo_credit_probe_result values('estorno devolve 100 e repeticao nao duplica saldo',true);
 update public.billing_live_payments set spent_cents=300 where id=p;
 denied:=false;begin perform public.portal_ai_paid_reserve(u,gen_random_uuid());exception when others then if sqlerrm like '%insufficient paid credits%' then denied:=true;else raise;end if;end;
 if not denied then raise exception 'insufficient balance accepted';end if;
 insert into oeo_credit_probe_result values('saldo de 98 centavos bloqueado',true);
 update public.billing_live_payments set spent_cents=0,period_start=now()-interval '2 days',period_end=now()-interval '1 day' where id=p;
 denied:=false;begin perform public.portal_ai_paid_reserve(u,gen_random_uuid());exception when others then if sqlerrm like '%insufficient paid credits%' then denied:=true;else raise;end if;end;
 if not denied then raise exception 'expired accepted';end if;
 insert into oeo_credit_probe_result values('credito expirado bloqueado',true);
 update public.billing_live_payments set period_start=now()-interval '1 day',period_end=now()+interval '1 day',cents=1 where id=p;
 denied:=false;begin perform public.portal_ai_paid_reserve(u,gen_random_uuid());exception when others then if sqlerrm like '%insufficient paid credits%' then denied:=true;else raise;end if;end;
 if not denied then raise exception 'amount mismatch accepted';end if;
 insert into oeo_credit_probe_result values('pagamento com valor divergente bloqueado',true);
 perform set_config('request.jwt.claim.role','authenticated',true);
 perform set_config('request.jwt.claims','{"role":"authenticated"}',true);
 denied:=false;begin perform public.portal_ai_paid_reserve(u,gen_random_uuid());exception when others then if sqlerrm like '%unauthorized%' then denied:=true;else raise;end if;end;
 if not denied then raise exception 'client role accepted';end if;
 if has_function_privilege('authenticated','public.portal_ai_paid_reserve(uuid,uuid)','EXECUTE') then raise exception 'client function privilege';end if;
 if has_table_privilege('authenticated','public.portal_ai_payment_usage','SELECT') then raise exception 'client ledger privilege';end if;
 insert into oeo_credit_probe_result values('cliente sem acesso direto a reserva ou ledger',true);
end $$;
select label,passed from oeo_credit_probe_result;
rollback;