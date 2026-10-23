import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';import {PGlite} from '@electric-sql/pglite';
import {TOPUP_TERMS,topupCheckoutBody,topupPayment,syncTopup,topupAction} from '../src/ai-topups.mjs';
const origin='https://www.oempregadoronline.com.br';
test('topup checkout fixes one-off prices and payment identity; refunds/chargebacks never grant',()=>{
 const o={id:randomUUID(),cents:1000,checkout_id:'checkout_fixture'},b=topupCheckoutBody(o,origin);assert.deepEqual(b.chargeTypes,['DETACHED']);assert.deepEqual(b.billingTypes,['CREDIT_CARD']);assert.equal(b.items[0].value,10);assert(!b.subscription);assert(!b.customerData);assert.throws(()=>topupCheckoutBody({...o,cents:1},origin));
 const p={id:'pay_fixture',checkoutSession:o.checkout_id,value:10,status:'CONFIRMED'};assert(topupPayment(p,o).eligible);
 for(const m of [{status:'PENDING'},{status:'REFUNDED'},{deleted:true},{chargeback:{}},{refunds:[{status:'PENDING'}]}])assert(!topupPayment({...p,...m},o).eligible);
 for(const m of [{checkoutSession:'other'},{value:1},{subscription:'sub_other'},{installment:'ins_other'}])assert.throws(()=>topupPayment({...p,...m},o));
});
test('sync always checks fresh payment; foreign checkout never reaches ledger',async()=>{
 let hits=0;const db={rpc:async()=>{hits++;return {data:null}}},o={id:'order',checkout_id:'checkout_fixture',cents:1000};
 const p={id:'pay_fixture',checkoutSession:o.checkout_id,value:10,status:'CONFIRMED'};
 await syncTopup(db,async path=>path.startsWith('/payments?')?{data:[{id:p.id,status:'PENDING'}]}:p,o);assert.equal(hits,1);
 await assert.rejects(syncTopup(db,async path=>path.startsWith('/payments?')?{data:[{id:p.id}]}:{...p,checkoutSession:'other'},o));assert.equal(hits,1);
});
test('wallet SQL combines fractional credits, scopes every source, prevents duplicates/overspend and reverses exactly once',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz);create table public.pilot_cohorts(id uuid primary key);create table public.pilot_memberships(user_id uuid,cohort_id uuid,role text,status text,is_fictitious boolean);grant usage on schema auth to service_role;grant select on auth.users,public.pilot_memberships to service_role;`);
 await db.exec(await readFile(new URL('../db/billing-live.sql',import.meta.url),'utf8'));await db.exec(await readFile(new URL('../db/ai-wallet-topups.sql',import.meta.url),'utf8'));
 const [u,other,c,foreign]=Array.from({length:4},randomUUID);await db.query('insert into auth.users values($1,now(),null),($2,now(),null)',[u,other]);await db.query('insert into pilot_cohorts values($1),($2)',[c,foreign]);await db.query("insert into pilot_memberships values($1,$3,'learner','active',false),($2,$3,'learner','active',false)",[u,other,c]);
 const rpc=(fn,args)=>db.query(`select public.${fn}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as value`,args);
 const balance=async(who=u,co=c)=>(await rpc('portal_ai_wallet_balance',[who,co])).rows[0].value;
 await db.exec('set role service_role');const id=(await rpc('portal_ai_topup_create',[u,c,1000,TOPUP_TERMS])).rows[0].value;await assert.rejects(rpc('portal_ai_topup_create',[u,c,1000,TOPUP_TERMS]),/duplicate key/);await assert.rejects(rpc('portal_ai_topup_create',[u,c,1,TOPUP_TERMS]),/invalid purchase/);
 await db.query("update portal_ai_topup_orders set checkout_id='checkout_fixture',status='pending' where id=$1",[id]);
 const apply=p=>rpc('portal_ai_topup_apply',[id,JSON.stringify(p)]);const p={id:'pay_fixture',checkout_id:'checkout_fixture',cents:1000,status:'PENDING',eligible:false,checked_at:new Date().toISOString()};await apply(p);assert.equal((await balance()).availableCents,0);
 const paid={...p,status:'CONFIRMED',eligible:true};await apply(paid);await apply(paid);assert.equal((await balance()).availableCents,1000);assert.equal((await balance(other)).availableCents,0);await assert.rejects(balance(u,foreign),/unauthorized/);
 // Existing subscription cents expire; topups have no expiry. Consume 98+2 on one execution.
 const order=randomUUID();await db.query("insert into billing_live_orders(id,user_id,cohort_id,profile_type,tier,cycle,cents,credit_cents,months,terms_version) values($1,$2,$3,'Candidato',1,'MONTHLY',1990,398,1,'fixture')",[order,u,c]);await db.query("insert into billing_live_payments(id,order_id,status,cents,period_start,period_end,credit_cents,spent_cents,eligible,checked_at) values('pay_subscription',$1,'CONFIRMED',1990,now()-interval '1 day',now()+interval '1 day',398,300,true,now())",[order]);assert.equal((await balance()).availableCents,1098);
 const req=randomUUID();assert.equal((await rpc('portal_ai_wallet_reserve',[u,c,req])).rows[0].value,998);await assert.rejects(rpc('portal_ai_wallet_reserve',[u,c,req]),/duplicate request/);
 assert.equal((await db.query("select spent_cents from portal_ai_topup_payments where id='pay_fixture'")).rows[0].spent_cents,2);
 await assert.rejects(rpc('portal_ai_wallet_refund',[other,c,req]),/reservation not found/);for(let i=0;i<2;i++)assert.equal((await rpc('portal_ai_wallet_refund',[u,c,req])).rows[0].value,1098);
 await db.exec("update billing_live_payments set eligible=false");
 await Promise.all(Array.from({length:10},()=>rpc('portal_ai_wallet_reserve',[u,c,randomUUID()])));assert.equal((await balance()).availableCents,0);await assert.rejects(rpc('portal_ai_wallet_reserve',[u,c,randomUUID()]),/insufficient paid credits/);
 const next=(await rpc('portal_ai_topup_create',[u,c,2500,TOPUP_TERMS])).rows[0].value;assert(next);
 await apply({...paid,status:'PENDING',eligible:false,checked_at:new Date(Date.now()+1000).toISOString()});assert.equal((await db.query('select status from portal_ai_topup_orders where id=$1',[id])).rows[0].status,'canceled');await apply(paid);assert.equal((await balance()).held,true);assert.equal((await balance()).availableCents,0);
 await db.exec('reset role');await db.query("update pilot_memberships set status='suspended' where user_id=$1",[u]);await db.exec('set role service_role');await assert.rejects(balance(),/unauthorized/);await db.exec('reset role');
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(balance(),/permission denied/);await assert.rejects(rpc('portal_ai_topup_apply',[id,JSON.stringify(paid)]),/permission denied/);await assert.rejects(db.query('select * from portal_ai_wallet_lines'),/permission denied/);await db.exec('reset role');}
 }finally{await db.close();}
});
