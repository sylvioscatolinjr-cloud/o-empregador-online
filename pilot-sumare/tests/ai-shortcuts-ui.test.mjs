import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {parseHTML} from 'linkedom';
const source=(await readFile(new URL('../app/ai.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
test('Meus agentes links to the data-aware tasks and lets the person delete their own history',async()=>{
 const {window}=parseHTML('<section id="ai-app"></section>'),session={user:{id:'fixture'},access_token:'t'},deleted=[];
 let rows=[{id:'h1',task:'resume_review',result:{review:{summary:'<b>Resumo</b> guardado'}},created_at:'2026-10-21T12:00:00Z'}];
 const cfg={supabaseURL:'https://fixture.supabase.co',publishableKey:'sb_publishable_fixture',origin:'https://preview.example'};
 const client={auth:{onAuthStateChange(){},async getSession(){return {data:{session}};}},from(table){assert.equal(table,'portal_agent_history');const q={select(){return q;},order(){return q;},async limit(){return {data:rows,error:null};},delete(){return {async eq(_,id){deleted.push(id);rows=[];return {error:null};}};}};return q;}};
 const fetch=async url=>{if(url==='/api/config')return Response.json({ready:true,...cfg});const action=new URL(url,cfg.origin).searchParams.get('action');if(action==='catalog')return Response.json({agent:{title:'Agente de Carreira'},tasks:[],shortcuts:[{id:'resume_review',label:'Revisar meu currículo com IA',href:'/conta.html?ia=curriculo',hint:'Lê o currículo salvo.'}]});if(action==='balance')return Response.json({active:false,availableCalls:0});};
 const context={document:window.document,location:{origin:cfg.origin},createClient:()=>client,fetch,Response};vm.createContext(context);vm.runInContext(source,context);await tick();await tick();
 const root=window.document.querySelector('#ai-app');assert.equal(root.querySelector('#ai-shortcuts a').getAttribute('href'),'/conta.html?ia=curriculo');
 const history=root.querySelector('#ai-history');assert.match(history.textContent,/Revisão de currículo/);assert.equal(history.querySelector('b'),null);
 history.querySelector('[data-history-delete]').click();await tick();assert.deepEqual(deleted,['h1']);assert.equal(history.querySelector('article'),null);
});
