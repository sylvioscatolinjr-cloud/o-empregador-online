import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
const source=async name=>(await readFile(new URL('../app/'+name,import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
test('course wishlist continues to real subscription rather than owner sandbox',async()=>{
 const {document}=parseHTML('<p id="status">Conectando…</p><main id="content"></main>');
 const db={from:()=>({select(){return this;},eq(){return this;},maybeSingle:async()=>({data:null})}),auth:{getUser:async()=>({data:{user:{id:'fixture'}}}),onAuthStateChange(){}}};
 const context={document,location:{origin:'https://portal.example',pathname:'/cursos-desejados.html'},fetch:async()=>Response.json({ready:true,origin:'https://portal.example'}),createClient:()=>db,Response,setTimeout(){}};vm.createContext(context);await vm.runInContext('(async()=>{'+await source('community.mjs')+'})()',context);
 assert(document.querySelector('input[name=course0][required]'));assert(document.querySelector('a.portal-action[href="/assinatura.html"]'));assert(!document.querySelector('a[href="/pagamentos.html"]'));assert.equal(document.querySelector('#status').textContent,'');
});
test('wallet loading indicator finishes on success and on visible failure',async()=>{for(const failed of [false,true]){
 const {document}=parseHTML('<p id="status">Conectando…</p><main id="wallet"></main>');
 const context={document,location:{origin:'https://portal.example'},fetch:async()=>Response.json({origin:'https://portal.example'}),Response,createClient:()=>({auth:{getSession:async()=>({data:{session:failed?null:{user:{id:'fixture'}}}}),onAuthStateChange(){}}}),mountCreditWallet:root=>({show:async()=>{root.innerHTML='<h1>Minha carteira</h1>';}})};vm.createContext(context);await vm.runInContext('(async()=>{'+await source('wallet-entry.mjs')+'})()',context);assert.equal(document.querySelector('#status').textContent,'');assert.match(document.querySelector('#wallet').textContent,failed?/Entre na sua conta/:/Minha carteira/);if(failed)assert.equal(document.querySelector('#wallet').getAttribute('role'),'alert');
}});
