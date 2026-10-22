import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';import {PGlite} from '@electric-sql/pglite';
test('organization history records changed measurements, isolates scopes, caps retention and denies browser access',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema pilot_private;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz);
 create table public.pilot_cohorts(id uuid primary key);
 create table public.pilot_memberships(user_id uuid,cohort_id uuid,role text,status text,is_fictitious boolean default false);
 create table public.portal_departments(id uuid primary key,organization_id uuid,cohort_id uuid,name text);
 create table public.portal_team_invitations(candidate_id uuid,department_id uuid,organization_id uuid,cohort_id uuid,status text);
 create table public.portal_candidate_cards(user_id uuid,cohort_id uuid,visible boolean,points numeric,is_fictitious boolean default false);
 create function pilot_private.public_professional_points(uuid,uuid) returns numeric language sql stable as $$select points from public.portal_candidate_cards where user_id=$1 and cohort_id=$2$$;
 grant usage on schema auth,pilot_private to service_role;grant select on auth.users to service_role;grant select,update on public.pilot_memberships to service_role;grant select on public.portal_departments,public.portal_team_invitations,public.portal_candidate_cards to service_role;`);
 await db.exec(await readFile(new URL('../db/organization-points.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../db/organization-points-history.sql',import.meta.url),'utf8'));
 const [co,otherCo,org,otherOrg,a,b,dep,dep2]=Array.from({length:8},randomUUID);
 await db.query('insert into pilot_cohorts values($1),($2)',[co,otherCo]);for(const id of [org,otherOrg,a,b])await db.query('insert into auth.users(id) values($1)',[id]);
 for(const [id,role]of [[org,'recruiter'],[otherOrg,'school_staff'],[a,'learner'],[b,'learner']])await db.query("insert into pilot_memberships(user_id,cohort_id,role,status) values($1,$2,$3,'active')",[id,co,role]);
 await db.query("insert into portal_departments values($1,$3,$4,'A'),($2,$3,$4,'B')",[dep,dep2,org,co]);
 for(const id of [a,b])await db.query('insert into portal_candidate_cards values($1,$2,true,0,false)',[id,co]);
 const measure=async(o=org,c=co)=>{await db.exec('set role service_role');try{return (await db.query('select portal_organization_points_history($1,$2) data',[o,c])).rows[0].data;}finally{await db.exec('reset role');}};
 const general=r=>r.history.filter(x=>x.department_id===null);
 let r=await measure();assert.equal(r.organization.average,null);assert.equal(r.history.length,3);assert.equal(general(r)[0].previous_members,null);assert.equal((await measure()).history.length,3);
 await db.query("insert into portal_team_invitations values($1,$3,$4,$5,'accepted'),($2,$3,$4,$5,'pending'),($1,$6,$4,$5,'accepted')",[a,b,dep,org,co,dep2]);
 r=await measure();assert.deepEqual(r.organization,{average:0,members:1});assert.equal(general(r)[0].previous_average,null);assert.equal(general(r)[0].previous_members,0);
 await db.query('update portal_candidate_cards set points=200 where user_id=$1',[a]);r=await measure();assert.equal(general(r)[0].average,200);assert.equal(general(r)[0].previous_average,0);
 await db.query("update portal_team_invitations set status='accepted' where candidate_id=$1",[b]);await db.query('update portal_candidate_cards set points=100 where user_id=$1',[b]);
 r=await measure();assert.equal(r.organization.average,150);assert.equal(r.organization.members,2);assert.equal(general(r)[0].previous_average,200);assert.equal(r.departments.find(x=>x.id===dep2).points.average,200);
 await db.query('update portal_candidate_cards set visible=false where user_id=$1',[a]);r=await measure();assert.equal(r.organization.average,100);assert.equal(r.organization.members,1);
 await db.query("update portal_team_invitations set status='ended' where candidate_id=$1",[b]);r=await measure();assert.equal(r.organization.average,null);assert.equal(general(r)[0].previous_average,100);
 assert.equal((await measure(otherOrg)).history.length,1);await assert.rejects(measure(org,otherCo),/indisponível/);
 await db.query("update auth.users set banned_until=now()+interval '1 day' where id=$1",[org]);await assert.rejects(measure(),/indisponível/);await db.query('update auth.users set banned_until=null where id=$1',[org]);
 await db.query("update portal_team_invitations set status='accepted' where candidate_id=$1",[b]);
 for(let i=1;i<=105;i++){await db.query('update portal_candidate_cards set points=$1 where user_id=$2',[i,b]);r=await measure();}
 assert.equal(general(r).length,20);assert.equal(general(r)[0].average,105);assert.equal(general(r)[0].previous_average,104);
 const counts=(await db.query('select department_id,count(*)::int n from portal_organization_point_history where organization_id=$1 group by department_id',[org])).rows;assert(counts.every(x=>x.n<=100));assert.equal(counts.find(x=>x.department_id===null).n,100);
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);try{await assert.rejects(db.query('select * from portal_organization_point_history'),/permission denied/);await assert.rejects(db.query('select portal_organization_points_history($1,$2)',[org,co]),/permission denied/);}finally{await db.exec('reset role');}}
 await db.query('delete from portal_departments where id=$1',[dep]);assert.equal((await db.query('select count(*)::int n from portal_organization_point_history where department_id=$1',[dep])).rows[0].n,0);
 await db.query('delete from auth.users where id=$1',[org]);assert.equal((await db.query('select count(*)::int n from portal_organization_point_history where organization_id=$1',[org])).rows[0].n,0);
 }finally{await db.close();}
});
