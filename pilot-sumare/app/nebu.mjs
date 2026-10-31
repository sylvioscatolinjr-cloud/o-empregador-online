import {nebuAvatar} from './nebu-avatar.mjs';
import {nebuGuide,nebuGuideKey,nebuFieldTip,nebuSniff,sniffWords} from '../src/nebu-guide.mjs';
import {attachNebuIdle,idleCss} from './nebu-idle.mjs';
import {nebuCoach,nebuNudge,quoteOfDay,STATUS_EVENT} from '../src/nebu-coach.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shortcuts=['[data-view="forgot"]','[data-view="login"]','[data-view="account"]','[data-view="goal"]','[data-portal="listings"]','[data-portal="applications"]','[data-portal="candidates"]','[data-portal="notifications"]'];
const css=`.nebu-launcher{position:fixed;right:10px;bottom:6px;z-index:900;width:80px;height:98px;padding:0;border:0;border-radius:12px;background:none;box-shadow:none;cursor:pointer;display:block;min-height:0;filter:drop-shadow(0 3px 5px rgba(44,33,56,.28));transition:transform .2s}
.nebu-launcher:hover{transform:translateY(-3px)}
.nebu-launcher .nebu-avatar{width:80px;height:98px;display:block}.nebu-launcher[aria-expanded=true]{transform:scale(.92)}
.nebu-bubble{position:fixed;right:92px;bottom:58px;z-index:900;background:#fff;color:#2c2138;border:1px solid #ddd4e6;border-radius:14px 14px 4px 14px;padding:8px 12px;font-size:14px;box-shadow:0 4px 14px rgba(44,33,56,.15);max-width:200px}
.nebu-panel{position:fixed;right:16px;bottom:110px;z-index:901;width:min(380px,calc(100vw - 32px));max-height:min(620px,calc(100vh - 130px));overflow:auto;background:#fff;color:#2c2138;border:1px solid #ddd4e6;border-radius:18px;box-shadow:0 12px 40px rgba(44,33,56,.3);padding:0 0 12px;font-size:15px;line-height:1.5;text-align:left}
.nebu-panel[hidden],.nebu-bubble[hidden]{display:none}
.nebu-head{display:flex;gap:10px;align-items:center;padding:12px 14px;background:#f1ebf7;border-radius:18px 18px 0 0;position:sticky;top:0}
.nebu-head strong{display:block;color:#543878;font-size:16px}.nebu-head small{color:#70637d}.nebu-head .nebu-close{margin-left:auto;min-height:40px;min-width:40px;padding:6px 10px}
.nebu-section{padding:4px 16px}.nebu-section h2{font-size:16px;margin:12px 0 6px;color:#543878}
.nebu-steps{margin:0;padding-left:22px}.nebu-steps li{margin:6px 0}
.nebu-steps a,.nebu-steps button{font:inherit;color:#543878;font-weight:650;background:none;border:0;padding:0;min-height:0;text-decoration:underline;cursor:pointer;text-align:left}
.nebu-tip{background:#eaf5f2;border-radius:10px;padding:10px 12px;margin:8px 0}.nebu-tip p{margin:4px 0 0}
.nebu-faq details{border-top:1px solid #ddd4e6;padding:8px 0}.nebu-faq summary{cursor:pointer;font-weight:650}.nebu-faq p{margin:6px 0 0}
.nebu-note{font-size:13px;color:#70637d;margin:10px 16px 0}
@media (max-width:600px){.nebu-launcher{width:64px;height:78px;right:6px;bottom:4px}.nebu-launcher .nebu-avatar{width:64px;height:78px}.nebu-panel{right:8px;left:8px;width:auto;bottom:88px;max-height:calc(100vh - 104px)}.nebu-bubble{right:74px;bottom:44px}}
.nebu-avatar .nebu-ear-l,.nebu-avatar .nebu-ear-r,.nebu-avatar .nebu-eyes{transform-box:fill-box}
.nebu-launcher .nebu-eyes{transform-origin:center;animation:nebu-blink 5s infinite}
.nebu-launcher .nebu-ear-l{transform-origin:80% 90%;animation:nebu-ear 7s infinite}.nebu-launcher .nebu-ear-r{transform-origin:20% 90%;animation:nebu-ear-r 9s 2s infinite}
@keyframes nebu-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes nebu-ear{0%,84%,100%{transform:rotate(0)}88%{transform:rotate(-10deg)}92%{transform:rotate(4deg)}}
@keyframes nebu-ear-r{0%,80%,100%{transform:rotate(0)}85%{transform:rotate(10deg)}90%{transform:rotate(-3deg)}}
@media (prefers-reduced-motion:reduce){.nebu-launcher .nebu-eyes,.nebu-launcher .nebu-ear-l,.nebu-launcher .nebu-ear-r{animation:none}}
.nebu-sniff{padding:12px 16px 0}.nebu-sniff label{margin:0 0 6px;font-size:14px}.nebu-sniff-row{display:flex;gap:8px}.nebu-sniff-row input{margin:0;min-width:0;flex:1;padding:10px}.nebu-sniff-row button{flex:none;background:#543878;color:#fff;border:0}
.nebu-found{padding:0 16px}.nebu-found h2{font-size:16px;margin:12px 0 4px;color:#543878}.nebu-found:empty{display:none}.nebu-hit{border:1px solid #ddd4e6;border-radius:10px;padding:8px 12px;margin:8px 0}.nebu-hit p{margin:4px 0}.nebu-hit a,.nebu-hit button{font:inherit;color:#543878;font-weight:650;background:none;border:0;padding:0;min-height:0;text-decoration:underline;cursor:pointer}
.nebu-trail{color:#70637d;font-style:italic}.nebu-trail span{display:inline-block;animation:nebu-paw 1s infinite}.nebu-trail span:nth-child(2){animation-delay:.2s}.nebu-trail span:nth-child(3){animation-delay:.4s}
@keyframes nebu-paw{0%,100%{opacity:.2}50%{opacity:1}}
.nebu-sniffing .nebu-head .nebu-avatar{animation:nebu-sniff .35s ease-in-out infinite}@keyframes nebu-sniff{50%{transform:translateY(2px) rotate(-4deg)}}
.nebu-found-here{outline:4px solid #f2c94c!important;outline-offset:3px;animation:nebu-here 1s ease-in-out 3}@keyframes nebu-here{50%{outline-color:#543878}}
@media (prefers-reduced-motion:reduce){.nebu-trail span,.nebu-sniffing .nebu-head .nebu-avatar,.nebu-found-here{animation:none}}
.nebu-quote{margin:10px 16px 0;padding:8px 12px;border-left:4px solid #2bb3a3;background:#f4fbfa;border-radius:0 10px 10px 0;font-style:italic;color:#3d3150}
.nebu-coach h2{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.nebu-coach h2 small{font-size:13px;color:#70637d;font-weight:600}
.nebu-meter{height:10px;border-radius:99px;background:#ece6f2;overflow:hidden;margin:4px 0 8px}.nebu-meter span{display:block;height:100%;background:linear-gradient(90deg,#2bb3a3,#543878);border-radius:99px}
.nebu-why{font-size:14px;color:#4c4058;margin:6px 0}
.nebu-coach .nebu-tip button,.nebu-coach .nebu-tip a{font:inherit;color:#543878;font-weight:650;background:none;border:0;padding:0;min-height:0;text-decoration:underline;cursor:pointer}
.nebu-tip.nebu-grow{background:#fff7e0}
.nebu-bubble.nebu-bubble-coach{max-width:250px;cursor:pointer}
@media print{.nebu-launcher,.nebu-panel,.nebu-bubble{display:none!important}}`;

export function snapshot(doc=document,loc=location){
 const outside=el=>!el.closest('[data-nebu]');
 return {path:loc.pathname,search:loc.search,signedIn:doc.body.classList.contains('signed-in'),
  forms:[...doc.querySelectorAll('form[id]')].filter(outside).map(f=>f.id),
  clickable:shortcuts.filter(sel=>[...doc.querySelectorAll(sel)].some(outside)),
  career:Boolean(doc.querySelector('[data-extended="career"]')),recruiting:Boolean(doc.querySelector('[data-portal="candidates"]')),
  school:[...doc.querySelectorAll('[data-portal="candidates"]')].some(b=>/alunos/i.test(b.textContent))};
}

function fieldLabel(el,doc){
 const label=(el.id&&[...doc.querySelectorAll('label[for]')].find(l=>l.htmlFor===el.id||l.getAttribute('for')===el.id))||el.closest('label');
 if(label){const copy=label.cloneNode(true);for(const x of copy.querySelectorAll('input,select,textarea,details,button'))x.remove();const text=copy.textContent.trim();if(text)return text;}
 return el.getAttribute('aria-label')||el.placeholder||'';
}
export function fieldInfo(el,doc=document){
 if(!el?.matches?.('input,select,textarea')||el.closest('[data-nebu]')||['hidden','submit','button','checkbox','radio','file'].includes(el.type))return null;
 return nebuFieldTip({form:el.form?.id||'',name:el.name||'',label:fieldLabel(el,doc),type:el.type,required:el.required,maxLength:el.maxLength});
}

export function mountNebu(doc=document,loc=location){
 if(doc.querySelector('[data-nebu]'))return null;
 const style=doc.createElement('style');style.textContent=css+idleCss;style.setAttribute('data-nebu','');doc.head.append(style);
 const root=doc.createElement('div');root.setAttribute('data-nebu','');
 root.innerHTML=`<p class="nebu-bubble" data-nebu-bubble hidden>Oi, eu sou a Nebu! Pergunte e eu farejo a resposta para você!</p><button type="button" class="nebu-launcher" aria-expanded="false" aria-controls="nebu-panel" aria-label="Precisa de ajuda? Fale com a Nebu">${nebuAvatar({size:56,title:'Nebu'})}</button><section class="nebu-panel" id="nebu-panel" role="dialog" aria-modal="false" aria-labelledby="nebu-title" hidden><div class="nebu-head">${nebuAvatar({size:48,title:'Nebu'})}<div><strong id="nebu-title">Oi, eu sou a Nebu!</strong><small>Pergunte e eu farejo a resposta para você!</small></div><button type="button" class="nebu-close" data-nebu-close aria-label="Fechar a ajuda da Nebu">✕</button></div><form class="nebu-sniff" data-nebu-sniff role="search"><label for="nebu-q">Pergunte à Nebu</label><div class="nebu-sniff-row"><input id="nebu-q" name="q" maxlength="200" autocomplete="off" placeholder="Ex.: como me candidato a uma vaga?"><button type="submit">Farejar</button></div></form><p class="nebu-quote" data-nebu-quote></p><div class="nebu-found" data-nebu-found aria-live="polite"></div><div class="nebu-section nebu-coach" data-nebu-coach hidden></div><div class="nebu-section" data-nebu-steps></div><div class="nebu-section" data-nebu-field hidden></div><div class="nebu-section nebu-faq" data-nebu-faq></div><p class="nebu-note">A Nebu dá dicas gerais e fareja as respostas aqui no seu aparelho: nada do que você digita é enviado. Para falar com a equipe: contato@oempregadoronline.com.br.</p></section>`;
 doc.body.append(root);
 const launcher=root.querySelector('.nebu-launcher'),panel=root.querySelector('.nebu-panel'),bubble=root.querySelector('[data-nebu-bubble]'),fieldBox=root.querySelector('[data-nebu-field]'),coachBox=root.querySelector('[data-nebu-coach]'),win=doc.defaultView||globalThis;
 root.querySelector('[data-nebu-quote]').textContent='“'+quoteOfDay()+'”';
 let lastField=null,observer=null,timer=null,lastKey='',lastCoach='',opens=0;
 // Incentivo ao cadastro completo: só nas telas da própria conta e com as marcas sim/não enviadas pela tela.
 const coachKeys=new Set(['resume','candidate','goal','company']);
 function coachNow(){const status=win.__oeoNebuStatus;if(!status||!coachKeys.has(nebuGuideKey(snapshot(doc,loc))))return null;return nebuCoach(status,opens);}
 const action=t=>t.focus?`<button type="button" data-nebu-focus="${esc(t.focus)}">Mostrar onde</button>`:t.click?`<button type="button" data-nebu-go="${esc(t.click)}">Abrir</button>`:t.href?`<a href="${esc(t.href)}">Ver agora</a>`:'';
 function renderCoach(){
  const c=coachNow();coachBox.hidden=!c;
  const key=c?JSON.stringify(c):'';if(key===lastCoach)return;lastCoach=key;
  coachBox.innerHTML=c?`<h2>${c.complete?'Cadastro completo!':'Seu cadastro'} <small>${c.done} de ${c.total} · ${c.percent}%</small></h2><div class="nebu-meter" role="img" aria-label="Cadastro ${c.percent}% completo"><span style="width:${c.percent}%"></span></div>${c.complete?'<p class="nebu-why">Muito bem! Agora é hora de crescer.</p>':`<p class="nebu-why">${esc(c.why)}</p>${c.tips.map(t=>`<div class="nebu-tip"><strong>${esc(t.title)}</strong><p>${esc(t.text)}</p><p>${action(t)}</p></div>`).join('')}`}<div class="nebu-tip nebu-grow"><strong>${esc(c.growth.title)}</strong><p>${esc(c.growth.text)}</p><p>${action(c.growth)}</p></div>`:'';
 }
 function renderGuide(force=false){
  const g=nebuGuide(snapshot(doc,loc)),key=g.key+'|'+g.steps.map(s=>s.text+(s.click||'')).join();
  renderCoach();
  if(!force&&key===lastKey)return g;lastKey=key;
  root.querySelector('[data-nebu-steps]').innerHTML=`<h2>${esc(g.title)}</h2><ol class="nebu-steps">${g.steps.map(s=>`<li>${s.href?`<a href="${esc(s.href)}">${esc(s.text)}</a>`:s.click?`<button type="button" data-nebu-go="${esc(s.click)}">${esc(s.text)}</button>`:esc(s.text)}</li>`).join('')}</ol>`;
  root.querySelector('[data-nebu-faq]').innerHTML=g.faq.length?`<h2>Dúvidas comuns</h2>${g.faq.map(f=>`<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}`:'';
  return g;
 }
 function renderField(){
  const info=lastField&&lastField.isConnected?fieldInfo(lastField,doc):null;
  fieldBox.hidden=!info;
  fieldBox.innerHTML=info?`<h2>Sobre este campo</h2><div class="nebu-tip"><strong>${esc(info.label)}</strong><p>${esc(info.tip)}</p></div>`:'';
 }
 function open(){
  opens++;lastCoach='';panel.hidden=false;bubble.hidden=true;launcher.setAttribute('aria-expanded','true');renderGuide(true);renderField();
  observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>renderGuide(),250);});
  observer.observe(doc.querySelector('main')||doc.body,{childList:true,subtree:true});
  try{sessionStorage.setItem('nebu-seen','1');}catch{}
  root.querySelector('[data-nebu-close]').focus();
 }
 const found=root.querySelector('[data-nebu-found]'),calm=Boolean(doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 let onScreen=[];
 function pageMatches(query){
  const terms=sniffWords(query).filter(w=>w.length>=4);if(!terms.length)return [];
  const seen=new Set();
  return [...doc.querySelectorAll('main a,main button,main h1,main h2,main h3,main label,nav a,nav button,header a')].filter(el=>!el.closest('[data-nebu]')&&!el.hidden&&!el.closest('[hidden]')).map(el=>{const text=(el.textContent||'').replace(/\s+/g,' ').trim(),w=sniffWords(text);return {el,text,hits:terms.filter(t=>w.some(x=>x.startsWith(t.slice(0,Math.max(4,t.length-2))))).length};}).filter(m=>m.hits&&m.text&&m.text.length<=80&&!seen.has(m.text)&&seen.add(m.text)).sort((a,b)=>b.hits-a.hits).slice(0,2);
 }
 function sniff(query){
  const q=String(query||'').trim();if(!q){found.innerHTML='<p>Escreva sua dúvida e clique em Farejar.</p>';return;}
  panel.classList.add('nebu-sniffing');found.innerHTML='<p class="nebu-trail">Farejando<span>.</span><span>.</span><span>.</span></p>';
  setTimeout(()=>{
   panel.classList.remove('nebu-sniffing');
   const hits=nebuSniff(q),problem=hits.some(h=>h.kind==='problema');onScreen=problem?[]:pageMatches(q);
   found.innerHTML=(problem?'<h2>Vamos verificar</h2>':hits.length||onScreen.length?'<h2>Achei!</h2>':`<p>Farejei tudo e não achei esse cheiro. Tente outras palavras ou escreva para <a href="mailto:contato@oempregadoronline.com.br">contato@oempregadoronline.com.br</a>.</p>`)
    +hits.map(h=>`<div class="nebu-hit"><strong>${esc(h.title)}</strong><p>${esc(h.text)}</p>${h.href&&h.href!==loc.pathname?`<p><a href="${esc(h.href)}">${h.href.startsWith('mailto:')?'Escrever e-mail':'Ir para lá'}</a></p>`:''}</div>`).join('')
    +(onScreen.length?`<div class="nebu-hit"><strong>Aqui nesta tela</strong>${onScreen.map((m,i)=>`<p><button type="button" data-nebu-here="${i}">Mostrar "${esc(m.text)}"</button></p>`).join('')}</div>`:'');
  },calm?200:1200);
 }
 root.querySelector('[data-nebu-sniff]').addEventListener('submit',e=>{e.preventDefault();sniff(e.target.querySelector('input').value);});
 function close(returnFocus=true){panel.hidden=true;launcher.setAttribute('aria-expanded','false');observer?.disconnect();observer=null;if(returnFocus)launcher.focus();}
 launcher.addEventListener('click',()=>panel.hidden?open():close());
 root.addEventListener('click',e=>{
  if(e.target.closest('[data-nebu-close]'))return close();
  const here=e.target.closest('[data-nebu-here]');
  if(here){const m=onScreen[Number(here.dataset.nebuHere)];if(m?.el.isConnected){close(false);m.el.scrollIntoView?.({behavior:calm?'auto':'smooth',block:'center'});m.el.classList.add('nebu-found-here');setTimeout(()=>m.el.classList.remove('nebu-found-here'),3200);if(m.el.matches('a,button'))m.el.focus?.({preventScroll:true});}return;}
  const spot=e.target.closest('[data-nebu-focus]');
  if(spot){const el=doc.querySelector(spot.dataset.nebuFocus);if(el&&!el.closest('[data-nebu]')){const box=el.closest('details');if(box)box.open=true;close(false);el.scrollIntoView?.({behavior:calm?'auto':'smooth',block:'center'});el.classList.add('nebu-found-here');setTimeout(()=>el.classList.remove('nebu-found-here'),3200);el.querySelector('input:not([type=hidden]),textarea,select')?.focus?.({preventScroll:true});}return;}
  const go=e.target.closest('[data-nebu-go]');
  if(go){const target=[...doc.querySelectorAll(go.dataset.nebuGo)].find(el=>!el.closest('[data-nebu]'));if(target){close(false);target.click();target.focus?.();}}
  else if(e.target.closest('.nebu-steps a,.nebu-hit a'))close(false);
 });
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close();});
 doc.addEventListener('focusin',e=>{if(fieldInfo(e.target,doc)){lastField=e.target;if(!panel.hidden)renderField();}});
 // Um convite discreto por sessão, só para quem ainda não abriu a Nebu.
 let seen=false;try{seen=sessionStorage.getItem('nebu-seen')==='1';}catch{}
 if(!seen){setTimeout(()=>{if(panel.hidden)bubble.hidden=false;},4000);setTimeout(()=>{bubble.hidden=true;},14000);}
 const idle=attachNebuIdle({doc,launcher,isPanelOpen:()=>!panel.hidden});
 // Um único recado extra por sessão (incentivo ao cadastro ou frase do dia), nunca por cima do painel ou das brincadeiras.
 let extraShown=false;try{extraShown=sessionStorage.getItem('nebu-coach')==='1';}catch{}
 function sessionBubble(){
  if(extraShown||!panel.hidden||!bubble.hidden||idle.state()!=='awake')return false;
  const c=coachNow(),text=c&&!c.complete?nebuNudge(c):'“'+quoteOfDay()+'”';
  extraShown=true;try{sessionStorage.setItem('nebu-coach','1');}catch{}
  bubble.textContent=text;bubble.classList.add('nebu-bubble-coach');bubble.hidden=false;
  setTimeout(()=>{bubble.hidden=true;bubble.classList.remove('nebu-bubble-coach');},12000);
  return true;
 }
 let extraTimer=null;
 const schedule=delay=>{clearTimeout(extraTimer);extraTimer=setTimeout(function retry(){if(!sessionBubble()&&!extraShown)extraTimer=setTimeout(retry,15000);},delay);};
 schedule(30000);
 doc.addEventListener(STATUS_EVENT,()=>{if(!panel.hidden)renderGuide(true);else schedule(20000);});
 bubble.addEventListener('click',()=>{if(panel.hidden)open();});
 return {open,close,root,idle};
}

if(typeof document!=='undefined'&&typeof window!=='undefined'&&!globalThis.__NEBU_TEST__){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mountNebu());else mountNebu();
}

