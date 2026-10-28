import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('complete migration connects verified payment to feed and metric, then removes highlight on reversal', async()=>{
 const db=new PGlite();
 const U='22222222-2222-4222-8222-222222222222', C='11111111-1111-4111-8111-111111111111';
 try {
  const fixture=await readFile(new URL('./highlight-feeds-draft.test.mjs',import.meta.url),'utf8');
  let setup=fixture.match(/await db\.exec\(`([\s\S]*?)`\);/)[1].split(' create table public.portal_highlight_orders')[0];
  setup=setup.replaceAll('${U}',U).replaceAll('${C}',C);
  await db.exec(setup+`\ncreate table public.pilot_cohorts(id uuid primary key); grant usage on schema public,auth,pilot_private to service_role; grant select on all tables in schema public,auth to service_role; insert into auth.users values('${U}',now(),null);insert into public.pilot_cohorts values('${C}');insert into public.pilot_memberships values('${U}','${C}','learner','active',false);insert into public.portal_candidate_cards values('${U}','${U}','${C}','Candidato','CAD','Campinas','SP','CAD',now(),false,false,false,'',false,true,null);`);
  await db.exec(await readFile(new URL('../supabase/migrations/20261027001933_paid_highlights.sql',import.meta.url),'utf8'));
  await db.exec('set role service_role');
  const order=(await db.query('select public.portal_highlight_create($1,$2,$3,$4,$5,$6,$7,$8) as o',[U,C,'candidate',U,7,0,990,'2026-10-26-highlight-v1'])).rows[0].o;
  await db.query("update public.portal_highlight_orders set checkout_id='chk_fixture',status='pending' where id=$1",[order.id]);
  const feed=async()=>(await db.query("select public.portal_ordered_public_feed($1,'candidates','',0,30) as r",[C])).rows[0].r[0];
  assert.equal((await feed()).is_featured,false);
  const payment={id:'pay_fixture',checkout_id:'chk_fixture',cents:990,status:'CONFIRMED',eligible:true,checked_at:'2026-10-26T12:00:00Z'};
  await db.query('select public.portal_highlight_apply($1,$2::jsonb)',[order.id,JSON.stringify(payment)]);
  assert.equal((await feed()).is_featured,true);
  assert.equal((await db.query('select public.portal_highlight_record_metric($1,$2,$3,$4,$5) as r',[C,'candidate',U,'view','a'.repeat(64)])).rows[0].r,true);
  assert.equal((await db.query('select public.portal_highlight_stats($1,$2,$3::uuid[]) as r',[U,C,[order.id]])).rows[0].r[0].views,1);
  await db.query('select public.portal_highlight_apply($1,$2::jsonb)',[order.id,JSON.stringify({...payment,status:'REFUNDED',eligible:false,checked_at:'2026-10-26T12:01:00Z'})]);
  assert.equal((await feed()).is_featured,false);
 } finally { await db.close(); }
});
