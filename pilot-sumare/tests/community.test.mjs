import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';
test('Blog and wishes: private drafts, editor permissions, isolated wishes and inactive results',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261016143403_portal_blog_and_course_wishlists.sql',import.meta.url),'utf8'));
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';await db.query('insert into auth.users(id) values($1),($2)',[a,b]);await db.query('insert into portal_blog_editors values($1)',[a]);
 async function as(id,fn,role='authenticated'){await db.exec('begin');try{await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id||'']);await db.exec('set local role '+role);const r=await fn();await db.exec('commit');return r;}catch(e){await db.exec('rollback');throw e;}}
 await as(a,()=>db.query("insert into portal_course_wishlists(user_id,courses) values($1,array['Eletroeletrônica','Inglês'])",[a]));
 assert.equal((await as(b,()=>db.query('select * from portal_course_wishlists'))).rows.length,0);
 assert.equal((await as(b,()=>db.query("update portal_course_wishlists set courses=array['Outra'] returning user_id"))).rows.length,0);
 await assert.rejects(as(b,()=>db.query("insert into portal_course_wishlists(user_id,courses) values($1,array['Outra'])",[a])),/row-level security/);
 await assert.rejects(as(a,()=>db.query('update portal_course_wishlists set user_id=$1',[b])),/row-level security/);
 for(const list of [[],[''],['Curso','curso'],['a','b','c','d','e','f']])await assert.rejects(as(a,()=>db.query('update portal_course_wishlists set courses=$1',[list])),/check constraint/);
 await assert.rejects(as(null,()=>db.query('select * from portal_course_wishlists'),'anon'),/permission denied/);
 const insert=(status='draft',category='Carreira')=>db.query('insert into portal_blog_posts(title,category,summary,body,status,published_at) values($1,$2,$3,$4,$5,now()) returning id',['Matéria de teste',category,'Resumo editorial de exemplo','Texto de exemplo para validar as permissões do Blog.',status]);
 await assert.rejects(as(b,()=>insert()),/row-level security/);
 await as(a,()=>insert());assert.equal((await as(null,()=>db.query('select * from portal_blog_posts'),'anon')).rows.length,0);
 assert.equal((await as(a,()=>db.query('select * from portal_blog_posts'))).rows.length,1);
 await as(a,()=>insert('published'));assert.equal((await as(null,()=>db.query('select * from portal_blog_posts'),'anon')).rows.length,1);
 await assert.rejects(as(a,()=>insert('published','Resultados')),/check constraint/);
 await as(a,()=>db.exec("update portal_blog_posts set status='draft'"));assert.equal((await as(null,()=>db.query('select * from portal_blog_posts'),'anon')).rows.length,0);
 await assert.rejects(as(b,()=>db.query('insert into portal_blog_editors values($1)',[b])),/permission denied/);
 }finally{await db.close();}
});
