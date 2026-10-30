import test,{mock} from 'node:test';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';import {readFile} from 'node:fs/promises';
import {nebuGuide,nebuGuideKey,nebuFieldTip,nebuSniff} from '../src/nebu-guide.mjs';
globalThis.__NEBU_TEST__=true;
mock.timers.enable({apis:['setTimeout']});
const {attachNebuIdle,IDLE}=await import('../app/nebu-idle.mjs');
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
 const nebu=mountNebu(doc,loc);assert.ok(nebu);nebu.idle.stop();assert.equal(mountNebu(doc,loc),null,'mounts once');
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
 const n=mountNebu(doc,loc);n.idle.stop();n.open();
 doc.querySelector('[data-nebu-go]').click();
 assert.equal(clicked,1);assert.equal(doc.querySelector('#nebu-panel').hidden,true);
});

test('snapshot ignores the Nebu panel and hidden/checkbox fields get no tip',()=>{
 const {doc,loc}=page('<main><form id="goal"><input type="checkbox" name="x"></form></main>');
 mountNebu(doc,loc).idle.stop();const s=snapshot(doc,loc);
 assert.deepEqual(s.forms,['goal']);
 assert.equal(fieldInfo(doc.querySelector('[name=x]'),doc),null);
});

test('Nebu is loaded on portal pages and sends nothing to the network',async()=>{
 for(const name of ['index','conta','assistente','assinatura','carteira','treinamentos','blog','termos','privacidade'])assert.match(await readFile(new URL(`../app/${name}.html`,import.meta.url),'utf8'),/<script type="module" src="\/nebu.js"><\/script>/,name);
 assert.match(await readFile(new URL('../scripts/build.mjs',import.meta.url),'utf8'),/app\/nebu\.mjs/);
 for(const file of ['../app/nebu.mjs','../src/nebu-guide.mjs','../app/nebu-avatar.mjs'])assert.doesNotMatch(await readFile(new URL(file,import.meta.url),'utf8'),/fetch\(|XMLHttpRequest|sendBeacon/,file);
});

const advance=ms=>{for(let left=ms;left>0;left-=100)mock.timers.tick(Math.min(100,left));};
const idlePage=()=>{const {doc}=page('<main><p>x</p></main>');doc.body.insertAdjacentHTML('beforeend','<button class="nebu-launcher"><svg class="nebu-avatar"></svg></button>');return {doc,launcher:doc.querySelector('.nebu-launcher')};};
const poke=doc=>{const e=new doc.defaultView.Event('keydown');doc.dispatchEvent(e);};
const seq=values=>{let i=0;return ()=>values[Math.min(i++,values.length-1)];};

test('idle: after 1 minute a cat runs by and Nebu chases it barking, then comes back',()=>{
 const {doc,launcher}=idlePage(),idle=attachNebuIdle({doc,launcher,reducedMotion:false,random:()=>0.9});
 advance(IDLE.chase);
 assert.equal(idle.state(),'chasing');assert.equal(doc.querySelectorAll('.nebu-sprite').length,2);
 assert.match(doc.querySelector('.nebu-stage').textContent,/Au! Au!/);assert.ok(launcher.classList.contains('nebu-away'));
 assert.equal(doc.querySelector('.nebu-stage').getAttribute('aria-hidden'),'true');
 advance(3800);
 assert.equal(idle.state(),'awake');assert.equal(doc.querySelectorAll('.nebu-sprite').length,0);assert.ok(!launcher.classList.contains('nebu-away'));
 idle.stop();
});

test('idle: after 2 minutes Nebu sleeps, and any activity wakes her',()=>{
 const {doc,launcher}=idlePage(),idle=attachNebuIdle({doc,launcher,reducedMotion:false,random:()=>0.9});
 advance(IDLE.sleep);advance(500);
 assert.equal(idle.state(),'sleeping');assert.ok(doc.querySelector('.nebu-zzz'));assert.match(launcher.innerHTML,/M40 53/);
 poke(doc);
 assert.equal(idle.state(),'awake');assert.equal(doc.querySelector('.nebu-zzz'),null);assert.doesNotMatch(launcher.innerHTML,/M40 53/);
 advance(IDLE.chase-1);assert.equal(idle.state(),'awake','idle clock restarts after activity');
 idle.stop();
});

test('idle: sometimes she fetches the toy duck and sleeps next to it',()=>{
 const {doc,launcher}=idlePage(),idle=attachNebuIdle({doc,launcher,reducedMotion:false,random:seq([0.9,0.1,0.95])});
 advance(IDLE.chase);advance(3800);advance(IDLE.sleep-IDLE.chase-3800);
 assert.equal(idle.state(),'fetching');
 advance(1900);assert.match(doc.querySelector('.nebu-stage').innerHTML,/ffd23f/,'comes back carrying the duck');
 advance(2000);
 assert.equal(idle.state(),'sleeping');assert.ok(doc.querySelector('.nebu-toy'));
 idle.stop();assert.equal(doc.querySelector('.nebu-toy'),null);
});

test('idle: while asleep she may fart, or the cat taps her 3 times and she chases it again',()=>{
 const {doc,launcher}=idlePage(),idle=attachNebuIdle({doc,launcher,reducedMotion:false,random:seq([0.9,0.9,0,0.2,0,0.6,0.9])});
 advance(IDLE.chase);advance(3800);advance(IDLE.sleep-IDLE.chase-3800);
 assert.equal(idle.state(),'sleeping');
 advance(IDLE.sleepEventMin);assert.ok(doc.querySelector('.nebu-puff'));assert.ok(launcher.classList.contains('nebu-wiggle'));
 advance(2100);assert.equal(doc.querySelector('.nebu-puff'),null);assert.equal(idle.state(),'sleeping');
 advance(IDLE.sleepEventMin-2100);assert.equal(idle.state(),'teased');assert.ok(doc.querySelector('.nebu-stick'),'cat carries a stick');
 let tocs=0;for(let t=0;t<5400;t+=100){advance(100);if(/toc/.test(doc.body.textContent)&&!doc.body.dataset.tocSeen){tocs++;doc.body.dataset.tocSeen='1';}if(!/toc/.test(doc.body.textContent))delete doc.body.dataset.tocSeen;}
 assert.equal(tocs,3,'pokes 3 times');assert.equal(idle.state(),'chasing');assert.equal(doc.querySelector('.nebu-zzz'),null);
 advance(4800);assert.equal(idle.state(),'awake');
 advance(IDLE.resleep);assert.equal(idle.state(),'sleeping','goes back to sleep');
 idle.stop();
});

test('idle: with reduced motion she only naps, without running scenes',()=>{
 const {doc,launcher}=idlePage(),idle=attachNebuIdle({doc,launcher,reducedMotion:true,random:()=>0});
 advance(IDLE.chase);assert.equal(doc.querySelector('.nebu-sprite'),null);
 advance(IDLE.sleep-IDLE.chase);assert.equal(idle.state(),'sleeping');
 advance(IDLE.sleepEventMax*3);assert.equal(doc.querySelector('.nebu-sprite'),null);assert.equal(doc.querySelector('.nebu-puff'),null);
 idle.stop();
});

test('idle: bobinho game, the toy always dodges the pointer and Nebu keeps it',()=>{
 const {doc,launcher}=idlePage(),win=doc.defaultView;win.innerWidth=1000;win.innerHeight=800;
 const idle=attachNebuIdle({doc,launcher,reducedMotion:false,random:seq([0.1,0.9,0.5])});
 advance(IDLE.play);
 assert.equal(idle.state(),'playing');const toy=doc.querySelector('.nebu-play');assert.ok(toy);assert.equal(toy.dataset.toy,'chicken');
 assert.match(doc.body.textContent,/Pega!/);
 const move=(x,y,type='pointermove',target=doc.body)=>{const e=new win.Event(type,{bubbles:true});e.clientX=x;e.clientY=y;target.dispatchEvent(e);};
 move(10,10);assert.equal(idle.state(),'playing','far moves do not end the game');assert.equal(toy.style.right,'110px');
 const center=()=>({x:1000-parseFloat(toy.style.right)-18,y:800-parseFloat(toy.style.bottom)-18});
 for(let i=0;i<IDLE.playDodges;i++){const before=toy.style.right+toy.style.bottom,c=center();move(c.x,c.y);assert.notEqual(toy.style.right+toy.style.bottom,before,'dodges '+i);const after=center();assert.ok(Math.hypot(after.x-c.x,after.y-c.y)>20);}
 advance(1000);
 assert.equal(idle.state(),'awake');assert.equal(doc.querySelector('.nebu-play'),null);assert.match(doc.body.textContent,/É meu!/);
 idle.stop();
});

test('idle: tapping the toy also makes it dodge, and typing ends the game',()=>{
 const {doc,launcher}=idlePage(),win=doc.defaultView;
 const idle=attachNebuIdle({doc,launcher,reducedMotion:false,random:seq([0.1,0.1,0.3])});
 advance(IDLE.play);const toy=doc.querySelector('.nebu-play');const before=toy.style.right+toy.style.bottom;
 const tap=new win.Event('pointerdown',{bubbles:true});toy.dispatchEvent(tap);
 assert.notEqual(toy.style.right+toy.style.bottom,before);assert.equal(idle.state(),'playing');
 poke(doc);assert.equal(idle.state(),'awake');assert.equal(doc.querySelector('.nebu-play'),null);
 idle.stop();
});

test('Farejar finds answers in plain Portuguese, without accents or exact words',()=>{
 const top=q=>nebuSniff(q)[0]?.title;
 assert.equal(top('como faço pra me candidatar a uma vaga'),'Como me candidato a uma vaga?');
 assert.equal(top('esqueci a senha'),'Esqueci minha senha. E agora?');
 assert.equal(top('publicar vaga'),'Como publico uma vaga ou curso?');
 assert.match(top('recarregar creditos pix'),/carteira/i);
 assert.match(top('instalar no celular'),/Instalar/);
 assert.equal(nebuSniff('xyzabc').length,0);assert.equal(nebuSniff('o que é').length,0);
 const titles=nebuSniff('publicar vaga').map(h=>h.title);assert.equal(new Set(titles).size,titles.length,'no repeated titles');
});

test('Farejar button sniffs, shows answers and points to things on the current screen',()=>{
 const {doc,loc}=page('<main><button id="vagas-btn" data-portal="listings">Vagas e cursos</button></main>','/conta.html');
 const n=mountNebu(doc,loc);n.idle.stop();n.open();
 const form=doc.querySelector('[data-nebu-sniff]');assert.match(form.textContent,/Farejar/);
 form.querySelector('input').value='onde vejo as vagas';
 form.dispatchEvent(new doc.defaultView.Event('submit',{bubbles:true,cancelable:true}));
 assert.match(doc.querySelector('[data-nebu-found]').textContent,/Farejando/);
 mock.timers.tick(1200);
 const found=doc.querySelector('[data-nebu-found]');assert.match(found.textContent,/Achei!/);assert.match(found.textContent,/Mostrar "Vagas e cursos"/);
 found.querySelector('[data-nebu-here]').click();
 assert.ok(doc.querySelector('#vagas-btn').classList.contains('nebu-found-here'));assert.equal(doc.querySelector('#nebu-panel').hidden,true);
 mock.timers.tick(3200);assert.ok(!doc.querySelector('#vagas-btn').classList.contains('nebu-found-here'));
 n.open();form.querySelector('input').value='xyzabc';form.dispatchEvent(new doc.defaultView.Event('submit',{bubbles:true,cancelable:true}));mock.timers.tick(1200);
 assert.match(doc.querySelector('[data-nebu-found]').textContent,/não achei esse cheiro/);
});

test('launcher Nebu blinks and moves her ears while waiting',()=>{
 const {doc,loc}=page('<main></main>','/');const n=mountNebu(doc,loc);n.idle.stop();
 const svg=doc.querySelector('.nebu-launcher .nebu-avatar');assert.ok(svg.querySelector('.nebu-eyes'));assert.ok(svg.querySelector('.nebu-ear-l'));assert.ok(svg.querySelector('.nebu-ear-r'));
 const css=doc.querySelector('style[data-nebu]').textContent;assert.match(css,/nebu-blink/);assert.match(css,/nebu-ear/);assert.match(css,/prefers-reduced-motion/);
});

test('Nebu keeps the Super Maker look: black head, pink ears and bow, teal collar with gold tag',async()=>{
 const {nebuAvatar}=await import('../app/nebu-avatar.mjs');const svg=nebuAvatar();
 for(const color of ['#2b2a33','#f2a5b0','#1aa3b8','#f2c230','#ff7aa8'])assert.ok(svg.includes(color),color);
 assert.match(svg,/<title id="nebu-[a-z0-9]+">Nebu, assistente do portal<\/title>/);
});

test('idle: after 15 s Nebu strolls along the bottom, sniffs and goes back to her corner',()=>{
 const {doc,launcher}=idlePage(),idle=attachNebuIdle({doc,launcher,reducedMotion:false,random:()=>0.9});
 advance(IDLE.stroll);assert.equal(idle.state(),'strolling');assert.ok(launcher.classList.contains('nebu-away'));assert.equal(doc.querySelectorAll('.nebu-sprite').length,1);
 advance(3800);assert.match(doc.querySelector('.nebu-stage').textContent,/snif snif/);
 advance(4700);assert.equal(idle.state(),'awake');assert.equal(doc.querySelector('.nebu-sprite'),null);assert.ok(!launcher.classList.contains('nebu-away'));
 idle.stop();
});

test('Nebu sits free in the bottom-right corner, without the round frame',()=>{
 const {doc,loc}=page('<main></main>','/');const n=mountNebu(doc,loc);n.idle.stop();
 const css=doc.querySelector('style[data-nebu]').textContent,rule=css.match(/\.nebu-launcher\{[^}]*\}/)[0];
 assert.match(rule,/right:\d+px;bottom:\d+px/);assert.match(rule,/border:0/);assert.match(rule,/background:none/);assert.doesNotMatch(rule,/border-radius:50%/);
});

test('Nebu greets with the owner chosen phrase',()=>{
 const {doc,loc}=page('<main></main>','/');const n=mountNebu(doc,loc);n.idle.stop();
 assert.match(doc.querySelector('.nebu-head').textContent,/Oi, eu sou a Nebu!\s*Pergunte e eu farejo a resposta para você!/);
 assert.equal(doc.querySelector('[data-nebu-bubble]').textContent,'Oi, eu sou a Nebu! Pergunte e eu farejo a resposta para você!');
});

test('idle: Nebu leaves paw prints that fade away and roams the whole screen',()=>{
 const {doc,launcher}=idlePage(),win=doc.defaultView;win.innerWidth=1000;win.innerHeight=800;
 const idle=attachNebuIdle({doc,launcher,reducedMotion:false,random:()=>0.9});
 advance(IDLE.stroll+3500);
 const prints=doc.querySelectorAll('.nebu-paw');assert.ok(prints.length>=5,'paw prints on the way: '+prints.length);
 assert.match(prints[0].style.transform,/rotate\(/);
 const ys=[...prints].map(p=>Number(p.style.transform.match(/translate\([^,]+,(-?\d+)px/)[1]));
 assert.ok(Math.min(...ys)<600,'goes up the screen, not only along the bottom');
 advance(3700);assert.ok(![...doc.querySelectorAll('.nebu-paw')].includes(prints[0]),'old prints disappear');
 advance(2000);assert.equal(idle.state(),'awake');
 advance(IDLE.chase-IDLE.stroll-9200);assert.equal(idle.state(),'chasing');
 const cat=doc.querySelector('.nebu-cat-svg').parentNode;advance(1500);
 assert.ok(Number(cat.style.transform.match(/translate\([^,]+,(-?\d+)px/)[1])<700,'cat runs across the screen');
 idle.stop();
});
