-- AI credits are denominated in integer units, not currency.
-- All accounts start with zero; paid entitlements require separate reconciliation.
create table if not exists public.portal_ai_wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 balance integer not null default 0 check(balance>=0),
 updated_at timestamptz not null default now()
);
create table if not exists public.portal_ai_ledger (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 delta integer not null check(delta<>0),
 reason text not null check(reason in ('grant','reserve','refund')),
 created_at timestamptz not null default now(),
 unique(user_id,request_id,reason)
);
create index if not exists portal_ai_ledger_user_created on public.portal_ai_ledger(user_id,created_at desc);
alter table public.portal_ai_wallets enable row level security;
alter table public.portal_ai_ledger enable row level security;
revoke all on public.portal_ai_wallets from anon,authenticated;
revoke all on public.portal_ai_ledger from anon,authenticated;
create or replace function public.portal_ai_reserve(p_user uuid,p_request uuid,p_cost integer)
returns integer language plpgsql security definer set search_path='' as $$
declare v_balance integer;
begin
 if auth.role() <> 'service_role' then raise exception 'unauthorized'; end if;
 if p_user is null or p_request is null or p_cost is null or p_cost<1 or p_cost>100 then raise exception 'invalid reservation'; end if;
 insert into public.portal_ai_wallets(user_id) values(p_user) on conflict do nothing;
 select balance into v_balance from public.portal_ai_wallets where user_id=p_user for update;
 if exists(select 1 from public.portal_ai_ledger where user_id=p_user and request_id=p_request and reason='reserve') then
   raise exception 'duplicate request';
 end if;
 if v_balance<p_cost then raise exception 'insufficient credits'; end if;
 update public.portal_ai_wallets set balance=balance-p_cost,updated_at=now() where user_id=p_user returning balance into v_balance;
 insert into public.portal_ai_ledger(user_id,request_id,delta,reason) values(p_user,p_request,-p_cost,'reserve');
 return v_balance;
end $$;
create or replace function public.portal_ai_refund(p_user uuid,p_request uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare v_cost integer; v_balance integer;
begin
 if auth.role() <> 'service_role' then raise exception 'unauthorized'; end if;
 if p_user is null or p_request is null then raise exception 'invalid refund'; end if;
 select balance into v_balance from public.portal_ai_wallets where user_id=p_user for update;
 if v_balance is null then raise exception 'wallet not found'; end if;
 select -delta into v_cost from public.portal_ai_ledger where user_id=p_user and request_id=p_request and reason='reserve';
 if v_cost is null then raise exception 'reservation not found'; end if;
 if exists(select 1 from public.portal_ai_ledger where user_id=p_user and request_id=p_request and reason='refund') then return v_balance; end if;
 update public.portal_ai_wallets set balance=balance+v_cost,updated_at=now() where user_id=p_user returning balance into v_balance;
 insert into public.portal_ai_ledger(user_id,request_id,delta,reason) values(p_user,p_request,v_cost,'refund');
 return v_balance;
end $$;
revoke all on function public.portal_ai_reserve(uuid,uuid,integer) from public,anon,authenticated;
revoke all on function public.portal_ai_refund(uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_ai_reserve(uuid,uuid,integer) to service_role;
grant execute on function public.portal_ai_refund(uuid,uuid) to service_role;