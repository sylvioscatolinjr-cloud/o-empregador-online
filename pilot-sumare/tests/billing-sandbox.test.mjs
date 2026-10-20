import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {checkoutBody,checkoutURL,validateCheckoutEvent,asaasRequest} from '../src/billing-sandbox.mjs';
test('checkout fixes monthly prices, origin and sandbox URL',()=>{
 const b=checkoutBody({profileType:'Empresa',tier:3,reference:'12345678-1234-1234-1234-123456789012',origin:'https://portal.example',now:new Date('2026-11-05T02:00:00Z'),value:1});
 assert.equal(b.items[0].value,2990);assert.equal(b.subscription.nextDueDate,'2026-11-04');assert.equal(b.callback.successUrl,'https://portal.example/pagamentos.html?retorno=sucesso');assert.equal(b.customerData,undefined);assert.deepEqual(b.chargeTypes,['RECURRENT']);
 assert.throws(()=>checkoutBody({profileType:'Candidato',tier:0}));assert.throws(()=>checkoutURL('https://evil.test'));assert.match(checkoutURL('12345678-1234-1234-1234-123456789012'),/^https:\/\/sandbox.asaas.com\//);
});
test('sandbox POST is never retried after timeout',async()=>{
 let calls=0;await assert.rejects(asaasRequest('/checkouts',{method:'POST',body:{},env:{ASAAS_SANDBOX_API_KEY:'fake'},fetchImpl:async url=>{calls++;assert.match(url,/^https:\/\/api-sandbox.asaas.com\/v3\//);throw Error('timeout');}}));assert.equal(calls,1);
 assert.throws(()=>validateCheckoutEvent({id:'evt_one',event:'PAYMENT_RECEIVED',checkout:{id:'test'}}));
});
test('database rejects client access and duplicate open orders; events are idempotent and paid does not regress',async()=>{
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);');
 await db.exec(await readFile(new URL('../supabase/migrations/20261016034603_billing_sandbox_checkout.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/migrations/20261016034828_billing_sandbox_attach_race.sql',import.meta.url),'utf8'));
 const u='11111111-1111-1111-1111-111111111111';await db.query('insert into auth.users values($1)',[u]);
 await db.query("insert into public.billing_sandbox_orders(user_id,profile_type,tier,cents,checkout_id,status) values($1,'Candidato',1,1990,'checkout_test','pending')",[u]);
 await assert.rejects(db.query("insert into public.billing_sandbox_orders(user_id,profile_type,tier,cents) values($1,'Candidato',1,1990)",[u]));
 await db.query("select public.billing_sandbox_event('evt_paid','CHECKOUT_PAID','checkout_test')");
 await db.query("select public.billing_sandbox_event('evt_paid','CHECKOUT_PAID','checkout_test')");
 await db.query("select public.billing_sandbox_event('evt_old_cancel','CHECKOUT_CANCELED','checkout_test')");
 assert.equal((await db.query('select status from public.billing_sandbox_orders')).rows[0].status,'paid');assert.equal((await db.query('select count(*)::int n from public.billing_sandbox_events')).rows[0].n,2);
 const early=(await db.query("insert into public.billing_sandbox_orders(user_id,profile_type,tier,cents) values($1,'Candidato',1,1990) returning id",[u])).rows[0].id;
 await db.query("select public.billing_sandbox_event('evt_early','CHECKOUT_PAID','checkout_early')");
 await db.query("select public.billing_sandbox_attach($1,'checkout_early')",[early]);
 assert.equal((await db.query('select status from public.billing_sandbox_orders where id=$1',[early])).rows[0].status,'paid');
 await db.exec('set role authenticated');await assert.rejects(db.query('select * from public.billing_sandbox_orders'));await assert.rejects(db.query("select public.billing_sandbox_event('evt_forged','CHECKOUT_PAID','checkout_test')"));
 }finally{await db.close();}
});
