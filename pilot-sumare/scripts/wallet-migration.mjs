import {createHash} from 'node:crypto';
// One atomic migration, not a sequence of partial financial changes.
export function buildWalletMigration(payload){
 if(payload.includes('$oeo_wallet_payload$'))throw Error('Reserved SQL delimiter.');
 const checksum=createHash('sha256').update(payload).digest('hex');
 return `-- Reviewed additive schema. Does not enable the rollout or scheduler, spend money or migrate contracts.
do $migration$
declare previous text; v_payload text:=$oeo_wallet_payload$${payload}$oeo_wallet_payload$;
begin
 perform pg_catalog.set_config('lock_timeout','2s',true);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('oeo-wallet-schema-v1',0));
 create table if not exists public.portal_wallet_migration_versions(version text primary key,checksum text not null,applied_at timestamptz not null default now());
 alter table public.portal_wallet_migration_versions enable row level security;
 revoke all on public.portal_wallet_migration_versions from public,anon,authenticated;
 grant select on public.portal_wallet_migration_versions to service_role;
 select checksum into previous from public.portal_wallet_migration_versions where version='unified-wallet-v1';
 if previous is not null then
  if previous<>'${checksum}' then raise exception 'Wallet migration version checksum mismatch; review required';end if;
  return;
 end if;
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name in('billing_live_orders','billing_live_payments','portal_highlight_orders','portal_highlight_payments') and column_name='payment_source')
 or exists(select 1 from information_schema.tables where table_schema='public' and table_name in('portal_wallet_rollout','portal_wallet_purchases','portal_wallet_purchase_lines','portal_wallet_subscriptions'))
 or exists(select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in('portal_wallet_debit','portal_wallet_plan','portal_wallet_highlight','portal_wallet_cancel','portal_wallet_renewals','portal_wallet_revoke_funding','portal_wallet_require_enabled'))
 then raise exception 'Partial or unexpected wallet schema; no changes applied';end if;
 if to_regprocedure('public.portal_ai_wallet_balance(uuid,uuid)') is null or to_regprocedure('public.portal_campaign_actor(uuid,uuid)') is null or to_regprocedure('public.portal_highlight_create(uuid,uuid,text,uuid,integer,integer,integer,text)') is null then raise exception 'Missing wallet dependencies; no changes applied';end if;
 if encode(pg_catalog.sha256(pg_catalog.convert_to(v_payload,'UTF8')),'hex')<>'${checksum}' then raise exception 'Wallet migration payload checksum mismatch';end if;
 execute v_payload;
 if exists(select 1 from public.portal_wallet_rollout where enabled) then raise exception 'Rollout must remain disabled after migration';end if;
 insert into public.portal_wallet_migration_versions(version,checksum) values('unified-wallet-v1','${checksum}');
end $migration$;
`;
}
