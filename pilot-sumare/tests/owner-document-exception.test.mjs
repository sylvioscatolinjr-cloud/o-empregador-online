import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const migration=await readFile(new URL('../supabase/migrations/20261018022109_single_owner_cpf_duplicate_exception.sql',import.meta.url),'utf8');
test('only the captured owner CPF bypasses uniqueness; CPF/CNPJ restrictions remain atomic indexes',async()=>{
 const db=new PGlite();try{
 await db.exec(`create schema pilot_private;create table pilot_private.user_identities(user_id text primary key,identity_key text not null unique,profile_type text);create table public.pilot_memberships(user_id text,role text,status text);insert into pilot_private.user_identities values('owner','CPF:owner','Candidato');insert into public.pilot_memberships values('owner','pilot_owner','active');`);
 await db.exec(migration);
 await db.exec("insert into pilot_private.user_identities values('candidate','CPF:owner','Candidato'),('ordinary','CPF:ordinary','Candidato'),('company','CNPJ:company','Empresa')");
 for(const key of ['CPF:ordinary','CNPJ:company'])await assert.rejects(db.query('insert into pilot_private.user_identities values($1,$2,$3)',['duplicate-'+key,key,'Candidato']),{code:'23505'});
 assert.equal((await db.query("select count(*)::int n from pilot_private.user_identities where identity_key='CPF:owner'")).rows[0].n,2);
 assert.equal((await db.query("select role from public.pilot_memberships where user_id='owner'")).rows[0].role,'pilot_owner');
 }finally{await db.close();}
});
