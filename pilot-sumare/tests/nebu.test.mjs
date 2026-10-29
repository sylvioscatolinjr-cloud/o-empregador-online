import test from 'node:test';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';import {readFile} from 'node:fs/promises';
import {nebuGuide,nebuGuideKey,nebuFieldTip} from '../src/nebu-guide.mjs';
globalThis.__NEBU_TEST__=true;
const {mountNebu,snapshot,fieldInfo}=await import('../app/nebu.mjs');
const page=(body,path='/conta.html',search='')=>{const {window}=parseHTML(`<!doctype html><html><head></head><body>${body}</body></html>`);globalThis.MutationObserver??=class{observe(){}disconnect(){}};globalThis.sessionStorage??={getItem(){return null},setItem(){}};return {doc:window.document,loc:{pathname:path,search}};};

test('guide follows the account screen shown to the visitor',()=>{
 assert.equal(nebuGuideKey({path:'/'}),'home');
 assert.equal(nebuGuideKey({path:'/conta.html',forms:['signup']}),'signup');
 assert.equal(nebuGuideKey({path:'/conta.html',forms:['login'],search:'?cadastro=1'}),'choose');
 assert.equal(nebuGuideKey({path:'/conta.html',forms:['login']}),'login');
 assert.equal(nebuGuideKey({path:'/conta.html',forms:['verification']}),'verification');
 assert.equal(nebuGuideKey({path:'/conta.html',signedIn:true,forms:['profile']}),'resume');
 assert.equal(nebuGuideKey({path:'/conta.html',signedIn:true,career:true}),'candidate');
 assert.equal(nebuGuideKey({path:'/conta.html',signedIn:true,recruiting:true}),'company');
 assert.equal(nebuGuideKey({path:'/carteira.html'}),'carteira');
 assert.equal(nebuGuideKey({path:'/desconhecida.html'}),'home');
});

test('shortcut steps only become buttons when the target exists on screen',()=>{
 const without=nebuGuide({path:'/conta.html',signedIn:true,career:true});
 assert.ok(without.steps.every(s=>!s.click));
 const withNav=nebuGuide({path:'/conta.html',signedIn:true,career:true,clickable:['[data-portal="listings"]']});
 assert.deepEqual(withNav.steps.filter(s=>s.click).map(s=>s.click),['[data-portal="listings"]']);
 assert.match(nebuGuide({path:'/conta.html',signedIn:true,recruiting:true,school:true}).title,/O que fazer/);
 assert.ok(nebuGuide({path:'/conta.html',signedIn:true,recruiting:true,school:true}).steps.some(s=>/alunos/.test(s.text)));
});

test('field tips explain known fields and fall back to the visible label',()=>{
 assert.match(nebuFieldTip({form:'signup',name:'document'}).tip,/CPF/);
 assert.match(nebuFieldTip({form:'signup',name:'name'}).tip,/responsável/);
 assert.match(nebuFieldTip({name:'driving_license'}).tip,/Nunca coloque o número/);
 const fallback=nebuFieldTip({name:'xyz',label:' Nome da turma ',required:true,maxLength:80});
 assert.equal(fallback.label,'Nome da turma');assert.match(fallback.tip,/obrigatório.*80/);
 assert.equal(nebuFieldTip({name:'xyz'}),null);
});

test('widget opens with page steps, explains the focused field and closes with Escape',()=>{
 const {doc,loc}=page('<main><form id="signup"><label>CPF<input name="document" required></label><input type="hidden" name="profileType"></form></main>','/conta.html','?cadastro=1');
 const nebu=mountNebu(doc,loc);assert.ok(nebu);assert.equal(mountNebu(doc,loc),null,'mounts once');
 const launcher=doc.querySelector('.nebu-launcher'),panel=doc.querySelector('#nebu-panel');
 assert.equal(panel.hidden,true);assert.match(launcher.getAttribute('aria-label'),/Nebu/);
 const input=doc.querySelector('[name=document]');input.focus();input.dispatchEvent(new doc.defaultView.Event('focusin',{bubbles:true}));
 launcher.click();
 assert.equal(panel.hidden,false);assert.equal(launcher.getAttribute('aria-expanded'),'true');
 assert.match(panel.textContent,/Vamos criar sua conta/);
 assert.match(panel.querySelector('[data-nebu-field]').textContent,/CPF.*não aparece/s);
 const esc=new doc.defaultView.Event('keydown');esc.key='Escape';doc.dispatchEvent(esc);
 assert.equal(panel.hidden,true);
});

test('shortcut buttons click the matching portal control',()=>{
 const {doc,loc}=page('<main><nav><button data-view="forgot">Esqueci</button></nav><form id="login"><input name="email" type="email"></form></main>');
 let clicked=0;doc.querySelector('[data-view="forgot"]').addEventListener('click',()=>clicked++);
 mountNebu(doc,loc).open();
 doc.querySelector('[data-nebu-go]').click();
 assert.equal(clicked,1);assert.equal(doc.querySelector('#nebu-panel').hidden,true);
});

test('snapshot ignores the Nebu panel and hidden/checkbox fields get no tip',()=>{
 const {doc,loc}=page('<main><form id="goal"><input type="checkbox" name="x"></form></main>');
 mountNebu(doc,loc);const s=snapshot(doc,loc);
 assert.deepEqual(s.forms,['goal']);
 assert.equal(fieldInfo(doc.querySelector('[name=x]'),doc),null);
});

test('Nebu is loaded on portal pages and sends nothing to the network',async()=>{
 for(const name of ['index','conta','assistente','assinatura','carteira','treinamentos','blog','termos','privacidade'])assert.match(await readFile(new URL(`../app/${name}.html`,import.meta.url),'utf8'),/<script type="module" src="\/nebu.js"><\/script>/,name);
 assert.match(await readFile(new URL('../scripts/build.mjs',import.meta.url),'utf8'),/app\/nebu\.mjs/);
 for(const file of ['../app/nebu.mjs','../src/nebu-guide.mjs','../app/nebu-avatar.mjs'])assert.doesNotMatch(await readFile(new URL(file,import.meta.url),'utf8'),/fetch\(|XMLHttpRequest|sendBeacon/,file);
});
