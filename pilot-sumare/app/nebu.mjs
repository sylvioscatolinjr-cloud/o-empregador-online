import {nebuAvatar} from './nebu-avatar.mjs';
import {nebuGuide,nebuFieldTip} from '../src/nebu-guide.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shortcuts=['[data-view="forgot"]','[data-view="login"]','[data-view="account"]','[data-view="goal"]','[data-portal="listings"]','[data-portal="applications"]','[data-portal="candidates"]','[data-portal="notifications"]'];
const css=`.nebu-launcher{position:fixed;right:16px;bottom:16px;z-index:900;width:64px;height:64px;padding:0;border-radius:50%;border:2px solid var(--purple,#543878);background:#fff;box-shadow:0 6px 20px rgba(44,33,56,.25);cursor:pointer;display:grid;place-items:center;min-height:0}
.nebu-launcher .nebu-avatar{width:56px;height:56px}.nebu-launcher[aria-expanded=true]{transform:scale(.92)}
.nebu-bubble{position:fixed;right:88px;bottom:30px;z-index:900;background:#fff;color:#2c2138;border:1px solid #ddd4e6;border-radius:14px 14px 4px 14px;padding:8px 12px;font-size:14px;box-shadow:0 4px 14px rgba(44,33,56,.15);max-width:200px}
.nebu-panel{position:fixed;right:16px;bottom:92px;z-index:901;width:min(380px,calc(100vw - 32px));max-height:min(620px,calc(100vh - 120px));overflow:auto;background:#fff;color:#2c2138;border:1px solid #ddd4e6;border-radius:18px;box-shadow:0 12px 40px rgba(44,33,56,.3);padding:0 0 12px;font-size:15px;line-height:1.5;text-align:left}
.nebu-panel[hidden],.nebu-bubble[hidden]{display:none}
.nebu-head{display:flex;gap:10px;align-items:center;padding:12px 14px;background:#f1ebf7;border-radius:18px 18px 0 0;position:sticky;top:0}
.nebu-head strong{display:block;color:#543878;font-size:16px}.nebu-head small{color:#70637d}.nebu-head .nebu-close{margin-left:auto;min-height:40px;min-width:40px;padding:6px 10px}
.nebu-section{padding:4px 16px}.nebu-section h2{font-size:16px;margin:12px 0 6px;color:#543878}
.nebu-steps{margin:0;padding-left:22px}.nebu-steps li{margin:6px 0}
.nebu-steps a,.nebu-steps button{font:inherit;color:#543878;font-weight:650;background:none;border:0;padding:0;min-height:0;text-decoration:underline;cursor:pointer;text-align:left}
.nebu-tip{background:#eaf5f2;border-radius:10px;padding:10px 12px;margin:8px 0}.nebu-tip p{margin:4px 0 0}
.nebu-faq details{border-top:1px solid #ddd4e6;padding:8px 0}.nebu-faq summary{cursor:pointer;font-weight:650}.nebu-faq p{margin:6px 0 0}
.nebu-note{font-size:13px;color:#70637d;margin:10px 16px 0}
@media (max-width:600px){.nebu-launcher{width:56px;height:56px;right:12px;bottom:12px}.nebu-launcher .nebu-avatar{width:48px;height:48px}.nebu-panel{right:8px;left:8px;width:auto;bottom:76px;max-height:calc(100vh - 96px)}.nebu-bubble{right:76px;bottom:22px}}
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
 const style=doc.createElement('style');style.textContent=css;style.setAttribute('data-nebu','');doc.head.append(style);
 const root=doc.createElement('div');root.setAttribute('data-nebu','');
 root.innerHTML=`<p class="nebu-bubble" data-nebu-bubble hidden>Ficou com dúvida? Eu ajudo!</p><button type="button" class="nebu-launcher" aria-expanded="false" aria-controls="nebu-panel" aria-label="Precisa de ajuda? Fale com a Nebu">${nebuAvatar({size:56,title:'Nebu'})}</button><section class="nebu-panel" id="nebu-panel" role="dialog" aria-modal="false" aria-labelledby="nebu-title" hidden><div class="nebu-head">${nebuAvatar({size:48,title:'Nebu'})}<div><strong id="nebu-title">Oi, eu sou a Nebu!</strong><small>Estou aqui para te guiar no portal.</small></div><button type="button" class="nebu-close" data-nebu-close aria-label="Fechar a ajuda da Nebu">✕</button></div><div class="nebu-section" data-nebu-steps></div><div class="nebu-section" data-nebu-field hidden></div><div class="nebu-section nebu-faq" data-nebu-faq></div><div class="nebu-section" data-nebu-ask hidden></div><p class="nebu-note">A Nebu dá dicas gerais e não lê nem envia o que você digita. Para falar com a equipe: contato@oempregadoronline.com.br.</p></section>`;
 doc.body.append(root);
 const launcher=root.querySelector('.nebu-launcher'),panel=root.querySelector('.nebu-panel'),bubble=root.querySelector('[data-nebu-bubble]'),fieldBox=root.querySelector('[data-nebu-field]');
 let lastField=null,observer=null,timer=null,lastKey='';
 function renderGuide(force=false){
  const g=nebuGuide(snapshot(doc,loc)),key=g.key+'|'+g.steps.map(s=>s.text+(s.click||'')).join();
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
  panel.hidden=false;bubble.hidden=true;launcher.setAttribute('aria-expanded','true');renderGuide(true);renderField();
  observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>renderGuide(),250);});
  observer.observe(doc.querySelector('main')||doc.body,{childList:true,subtree:true});
  try{sessionStorage.setItem('nebu-seen','1');}catch{}
  root.querySelector('[data-nebu-close]').focus();
 }
 function close(returnFocus=true){panel.hidden=true;launcher.setAttribute('aria-expanded','false');observer?.disconnect();observer=null;if(returnFocus)launcher.focus();}
 launcher.addEventListener('click',()=>panel.hidden?open():close());
 root.addEventListener('click',e=>{
  if(e.target.closest('[data-nebu-close]'))return close();
  const go=e.target.closest('[data-nebu-go]');
  if(go){const target=[...doc.querySelectorAll(go.dataset.nebuGo)].find(el=>!el.closest('[data-nebu]'));if(target){close(false);target.click();target.focus?.();}}
  else if(e.target.closest('.nebu-steps a'))close(false);
 });
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close();});
 doc.addEventListener('focusin',e=>{if(fieldInfo(e.target,doc)){lastField=e.target;if(!panel.hidden)renderField();}});
 // Um convite discreto por sessão, só para quem ainda não abriu a Nebu.
 let seen=false;try{seen=sessionStorage.getItem('nebu-seen')==='1';}catch{}
 if(!seen){setTimeout(()=>{if(panel.hidden)bubble.hidden=false;},4000);setTimeout(()=>{bubble.hidden=true;},14000);}
 return {open,close,root};
}

if(typeof document!=='undefined'&&typeof window!=='undefined'&&!globalThis.__NEBU_TEST__){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mountNebu());else mountNebu();
}
