import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';import {buildWalletMigration} from '../scripts/wallet-migration.mjs';
test('atomic wallet migration rejects partial state, rolls back, repeats safely and preserves legacy money',async()=>{const db=new PGlite();try{
 const fixture=await readFile(new URL('./unified-wallet-database.test.mjs',import.meta.url),'utf8');await db.exec(fixture.match(/await db\.exec\(`([\s\S]*?)`\);/)[1]);
 for(const f of ['billing-live.sql','ai-wallet-topups.sql','highlight-campaigns-draft.sql'])await db.exec(await readFile(new URL('../db/'+f,import.meta.url),'utf8'));
 const u=randomUUID(),co=randomUUID(),id=randomUUID();await db.query('insert into auth.users(id) values($1)',[u]);await db.query('insert into pilot_cohorts values($1)',[co]);await db.query("insert into pilot_memberships(user_id,cohort_id,role) values($1,$2,'learner')",[u,co]);
 await db.query("insert into billing_live_orders(id,user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version,status,subscription_id) values($1,$2,$3,'Candidato',1,'MONTHLY',1990,398,1,'2026-10-25-four-tiers-v1','active','sub_existing')",[id,u,co]);
 await db.query("insert into billing_live_payments(id,order_id,status,cents,period_start,period_end,credit_cents,spent_cents,eligible,checked_at) values('pay_existing',$1,'CONFIRMED',1990,now()-interval '1 day',now()+interval '29 days',398,17,true,now())",[id]);
 const snapshot=async()=>JSON.stringify((await db.query('select id,order_id,status,cents,period_start,period_end,credit_cents,spent_cents,eligible,checked_at from billing_live_payments')).rows);
 const before=await snapshot(),sql=buildWalletMigration(await readFile(new URL('../db/unified-wallet.sql',import.meta.url),'utf8'));
 await db.exec('alter table billing_live_orders add column payment_source text');await assert.rejects(db.exec(sql),/Partial or unexpected/);
 assert.equal((await db.query("select to_regclass('public.portal_wallet_purchases') t")).rows[0].t,null);await db.exec('alter table billing_live_orders drop column payment_source');
 await db.exec('begin');await db.exec(sql);assert((await db.query("select to_regclass('public.portal_wallet_purchases') t")).rows[0].t);await db.exec('rollback');
 assert.equal((await db.query("select to_regclass('public.portal_wallet_purchases') t")).rows[0].t,null);assert.equal(await snapshot(),before);
 await db.exec(sql);await db.exec(sql);assert.equal(await snapshot(),before);
 assert.equal((await db.query('select count(*) n from portal_wallet_purchases')).rows[0].n,0);assert.equal((await db.query('select count(*) n from portal_wallet_rollout where enabled')).rows[0].n,0);
 assert.equal((await db.query('select count(*) n from portal_wallet_migration_versions')).rows[0].n,1);
 assert.equal((await db.query("select subscription_id from billing_live_orders where id=$1",[id])).rows[0].subscription_id,'sub_existing');
 }finally{await db.close();}});
