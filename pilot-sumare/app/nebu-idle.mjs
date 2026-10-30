import {nebuAvatar,nebuRunner,catSprite,duckToy,playToy} from './nebu-avatar.mjs';
// Brincadeiras da Nebu quando a tela fica parada (pedido do titular em 29/10/2026):
// 1 min: um gato passa e ela corre latindo atrás. 2 min: ela dorme, às vezes com o pato de brinquedo.
// Dormindo, às vezes solta um pum ou o gato chega de mansinho, cutuca 3 vezes e ela acorda correndo atrás dele.
// 15 s: ela dá uma volta pela parte de baixo da tela, fareja e volta para o canto.
// 30 s: às vezes ela traz a bolinha ou o frango para brincar de bobinho: o brinquedo sempre desvia do ponteiro.
// Nas correrias e passeios ela anda pela tela toda e deixa pegadas que vão sumindo.
// Qualquer movimento do usuário acorda a Nebu e desfaz a cena. Tudo é decorativo (aria-hidden, sem cliques).
export const IDLE={stroll:15000,play:30000,playChance:0.6,playDodges:6,playGiveUp:20000,chase:60000,sleep:120000,sleepEventMin:25000,sleepEventMax:45000,resleep:30000};
export const idleCss=`.nebu-stage{position:fixed;inset:0;pointer-events:none;z-index:899;overflow:hidden}
.nebu-sprite{position:absolute;top:0;left:0;will-change:transform}
.nebu-paw{position:absolute;top:0;left:0;width:16px;height:16px;animation:nebu-paw-fade 3.5s ease-in forwards}.nebu-paw svg{display:block}
@keyframes nebu-paw-fade{0%{opacity:.75}100%{opacity:0}}.nebu-flip svg{transform:scaleX(-1)}
.nebu-sprite .nebu-leg-a{animation:nebu-leg .22s steps(2) infinite}.nebu-sprite .nebu-leg-b{animation:nebu-leg .22s steps(2) infinite reverse}
.nebu-sneak .nebu-leg-a,.nebu-sneak .nebu-leg-b{animation-duration:.6s}
@keyframes nebu-leg{0%{transform:translateY(0)}100%{transform:translateY(-3px)}}
.nebu-say{position:absolute;bottom:64px;left:40px;background:#fff;border:1px solid #ddd4e6;border-radius:12px;padding:2px 8px;font:700 13px/1.4 system-ui,sans-serif;color:#543878;white-space:nowrap}
.nebu-flip .nebu-say{left:auto;right:40px}
.nebu-still .nebu-leg-a,.nebu-still .nebu-leg-b{animation:none}
.nebu-wary svg{transform-origin:30% 100%;transform:scaleY(.94)}
.nebu-poke .nebu-stick{animation:nebu-poke .55s ease-in-out}.nebu-poke svg{animation:nebu-lean .55s ease-in-out}
@keyframes nebu-poke{0%,100%{transform:translateX(0)}40%,60%{transform:translateX(12px)}}
@keyframes nebu-lean{0%,100%{transform:scaleY(.94) translateX(0)}70%{transform:scaleY(.94) translateX(-6px)}}
.nebu-launcher .nebu-avatar{transition:opacity .3s}.nebu-launcher.nebu-away .nebu-avatar{opacity:0}
.nebu-zzz{position:fixed;right:14px;bottom:100px;z-index:900;pointer-events:none;font:700 16px/1 system-ui,sans-serif;color:#543878;animation:nebu-zzz 2.4s ease-in-out infinite}
@keyframes nebu-zzz{0%{opacity:0;transform:translate(0,6px)}50%{opacity:1}100%{opacity:0;transform:translate(10px,-14px)}}
.nebu-toy{position:fixed;right:88px;bottom:8px;z-index:900;pointer-events:none}
.nebu-puff{position:fixed;right:76px;bottom:16px;z-index:900;pointer-events:none;font:700 12px/1 system-ui,sans-serif;color:#6b7d4f;background:radial-gradient(circle,#dfe8c8 55%,transparent 60%);padding:12px 10px;border-radius:50%;animation:nebu-puff 2s ease-out forwards}
@keyframes nebu-puff{0%{opacity:0;transform:scale(.4)}25%{opacity:1}100%{opacity:0;transform:translate(-18px,-10px) scale(1.4)}}
.nebu-play{position:fixed;z-index:900;pointer-events:auto;cursor:grab;transition:right .35s cubic-bezier(.3,1.6,.5,1),bottom .35s cubic-bezier(.3,1.6,.5,1);touch-action:none}
.nebu-play-say{position:fixed;right:16px;bottom:104px;z-index:900;pointer-events:none;background:#fff;border:1px solid #ddd4e6;border-radius:12px;padding:2px 8px;font:700 13px/1.4 system-ui,sans-serif;color:#543878}
.nebu-launcher.nebu-wiggle{animation:nebu-wiggle .5s ease-in-out 2}@keyframes nebu-wiggle{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
@media (max-width:600px){.nebu-zzz{right:10px;bottom:82px}.nebu-toy{right:70px;bottom:6px}.nebu-puff{right:62px;bottom:12px}.nebu-play-say{bottom:86px}}
@media (prefers-reduced-motion:reduce){.nebu-play{transition:none}.nebu-zzz,.nebu-sprite .nebu-leg-a,.nebu-sprite .nebu-leg-b{animation:none}}`;

export function attachNebuIdle({doc=document,launcher,isPanelOpen=()=>false,random=Math.random,reducedMotion}={}){
 const win=doc.defaultView||globalThis,timers=new Set();
 const calm=reducedMotion??Boolean(win.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 let state='awake',sceneLayer=null,idleTimers=[];
 const later=(fn,ms)=>{const t=setTimeout(()=>{timers.delete(t);fn();},ms);timers.add(t);return t;};
 const width=()=>win.innerWidth||1024,home=()=>width()-90;
 const stage=()=>{if(!sceneLayer){sceneLayer=doc.createElement('div');sceneLayer.className='nebu-stage';sceneLayer.setAttribute('aria-hidden','true');sceneLayer.setAttribute('data-nebu-scene','');doc.body.append(sceneLayer);}return sceneLayer;};
 const extra=(cls,html)=>{const el=doc.createElement('div');el.className=cls;el.setAttribute('aria-hidden','true');el.setAttribute('data-nebu-scene','');el.innerHTML=html;doc.body.append(el);return el;};
 function sprite(html,{flip=false,say='',cls=''}={}){const el=doc.createElement('div');el.className='nebu-sprite'+(flip?' nebu-flip':'')+(cls?' '+cls:'');el.innerHTML=html+(say?`<span class="nebu-say">${say}</span>`:'');stage().append(el);return el;}
 const height=()=>win.innerHeight||768,ground=(h=68)=>height()-h-6,pt=(fx,fy)=>({x:Math.round(width()*fx),y:Math.round(height()*fy)});
 const PAW='<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><g fill="#2b2a33" fill-opacity=".55"><ellipse cx="10" cy="13" rx="5" ry="4.2"/><ellipse cx="4" cy="7.5" rx="2" ry="2.6"/><ellipse cx="8" cy="4" rx="2" ry="2.6"/><ellipse cx="12" cy="4" rx="2" ry="2.6"/><ellipse cx="16" cy="7.5" rx="2" ry="2.6"/></g></svg>';
 function paw(x,y,angle){const el=doc.createElement('span');el.className='nebu-paw';el.innerHTML=PAW;el.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) rotate(${Math.round(angle)}deg)`;stage().append(el);later(()=>el.remove(),3600);}
 // Percorre os pontos em linha reta, virando para o lado em que anda; com prints, deixa pegadas no caminho.
 function path(el,pts,ms,{prints=false,h=68,w=96}={}){
  const lens=pts.slice(1).map((p,i)=>Math.hypot(p.x-pts[i].x,p.y-pts[i].y)||1),total=lens.reduce((a,b)=>a+b,0);
  const place=(p,dur)=>{el.style.transition=dur?`transform ${dur}ms linear`:'none';el.style.transform=`translate(${p.x}px,${p.y}px)`;};
  place(pts[0],0);let t=30;
  lens.forEach((len,i)=>{const dur=Math.round(ms*len/total),a=pts[i],b=pts[i+1];later(()=>{el.classList.toggle('nebu-flip',b.x<a.x);place(b,dur);},t);
   if(prints){const steps=Math.max(1,Math.floor(dur/160)),ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+90;
    for(let k=1;k<=steps;k++){const f=k/steps,side=k%2?-5:5,nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len;later(()=>paw(a.x+(b.x-a.x)*f+w/2+nx*side,a.y+(b.y-a.y)*f+h-8+ny*side,ang),t+Math.round(dur*f));}}
   t+=dur;});
 }
 let route=0;
 const face=mood=>{const svg=launcher.querySelector('.nebu-avatar');if(svg)svg.outerHTML=nebuAvatar({size:56,title:'Nebu',mood});};
 const away=on=>launcher.classList.toggle('nebu-away',on);
 const clearScene=()=>{toy=null;for(const t of timers)clearTimeout(t);timers.clear();sceneLayer?.remove();sceneLayer=null;for(const el of doc.querySelectorAll('[data-nebu-scene]'))el.remove();launcher.classList.remove('nebu-away','nebu-wiggle','nebu-sleeping');};
 function wake(){if(state!=='awake')face('happy');state='awake';}
 const busy=()=>isPanelOpen()||doc.hidden;

 function stroll(){
  state='strolling';away(true);const start={x:home(),y:ground()},sniffAt=pt(0.3,0.35),dog=sprite(nebuRunner(),{cls:'nebu-sneak'});
  path(dog,[start,pt(0.6,0.6),sniffAt],3600,{prints:true});
  later(()=>{dog.classList.remove('nebu-sneak');const s=doc.createElement('span');s.className='nebu-say';s.textContent='snif snif';dog.append(s);},3700);
  later(()=>{dog.innerHTML=nebuRunner();dog.classList.add('nebu-sneak');path(dog,[sniffAt,pt(0.45,0.8),start],3600,{prints:true});},4700);
  later(()=>{dog.remove();away(false);state='awake';},8400);
 }
 const routes=[[[0.3,0.35],[0.6,0.7],[1,0.25]],[[0.25,0.7],[0.5,0.2],[1,0.55]],[[0.4,0.5],[0.7,0.15],[1,0.75]]];
 function chaseRight(done){
  state='chasing';const r=routes[route++%routes.length],cat=sprite(catSprite()),dog=sprite(nebuRunner(),{say:'Au! Au!'});away(true);
  const via=r.map(([fx,fy])=>pt(fx,fy));
  path(cat,[{x:-90,y:ground(60)},...via.slice(0,2),{x:width()+100,y:via[2].y}],3200,{h:60,w:80});
  path(dog,[{x:-230,y:ground()},...via.slice(0,2),{x:width()+20,y:via[2].y}],3600,{prints:true});
  later(()=>{cat.remove();dog.remove();away(false);state='awake';done?.();},3700);
 }
 function chaseLeft(done){
  state='chasing';const cat=sprite(catSprite()),dog=sprite(nebuRunner(),{say:'Au! Au!'});away(true);
  const mid=pt(0.5,0.3),out={x:-130,y:Math.round(height()*0.6)};
  path(cat,[{x:width()-215,y:ground(60)},mid,{x:-110,y:out.y}],2400,{h:60,w:80});
  path(dog,[{x:home(),y:ground()},mid,out],2800,{prints:true});
  later(()=>{dog.innerHTML=nebuRunner();path(dog,[out,pt(0.4,0.8),{x:home(),y:ground()}],1800,{prints:true});},2900);
  later(()=>{cat.remove();dog.remove();away(false);state='awake';done?.();},4800);
 }
 function sleep(){
  if(busy())return void later(sleep,5000);
  const nap=()=>{state='sleeping';launcher.classList.add('nebu-sleeping');face('sleep');extra('nebu-zzz','Zzz');scheduleSleepEvent();};
  if(!calm&&random()<0.5){
   state='fetching';away(true);const dog=sprite(nebuRunner()),start={x:home(),y:ground()},far={x:-120,y:ground()};path(dog,[start,far],1800,{prints:true});
   later(()=>{dog.innerHTML=nebuRunner({duck:true});path(dog,[far,start],1800,{prints:true});},1900);
   later(()=>{dog.remove();away(false);extra('nebu-toy',duckToy());nap();},3800);
  }else nap();
 }
 function scheduleSleepEvent(){
  if(calm)return;
  later(()=>{
   if(state!=='sleeping')return;
   const roll=random();
   if(roll<0.4){extra('nebu-puff','prrt');launcher.classList.add('nebu-wiggle');later(()=>{launcher.classList.remove('nebu-wiggle');for(const p of doc.querySelectorAll('.nebu-puff'))p.remove();},2100);scheduleSleepEvent();}
   else if(roll<0.75)catWake();
   else scheduleSleepEvent();
  },IDLE.sleepEventMin+random()*(IDLE.sleepEventMax-IDLE.sleepEventMin));
 }
 function catWake(){
  // O gato chega de mansinho e, desconfiado, cutuca a Nebu 3 vezes com um galho.
  state='teased';const cat=sprite(catSprite({stick:true}),{cls:'nebu-sneak'});path(cat,[{x:-130,y:ground(60)},{x:width()-215,y:ground(60)}],2500,{h:60,w:124});
  later(()=>{cat.classList.remove('nebu-sneak');cat.classList.add('nebu-still','nebu-wary');},2550);
  for(let i=0;i<3;i++)later(()=>{cat.classList.remove('nebu-poke');void cat.offsetWidth;cat.classList.add('nebu-poke');later(()=>say('toc',450),220);},2800+i*900);
  later(()=>{cat.remove();for(const z of doc.querySelectorAll('.nebu-zzz'))z.remove();launcher.classList.remove('nebu-sleeping');face('happy');say('!',900);state='awake';chaseLeft(()=>later(sleep,IDLE.resleep));},5400);
 }
 const toyZone={minRight:96,maxRight:320,minBottom:16,maxBottom:170};
 let toy=null,toyPos=null,dodges=0,giveUp=null;
 function say(text,ms=1400){for(const b of doc.querySelectorAll('.nebu-play-say'))b.remove();const b=extra('nebu-play-say',text);later(()=>b.remove(),ms);}
 function placeToy({right,bottom}){toyPos={right,bottom};toy.style.right=right+'px';toy.style.bottom=bottom+'px';}
 function toyCenter(){const h=win.innerHeight||768;return {x:width()-toyPos.right-18,y:h-toyPos.bottom-18};}
 function play(){
  state='playing';dodges=0;const kind=random()<0.5?'ball':'chicken';
  toy=extra('nebu-play',playToy(kind));toy.dataset.toy=kind;placeToy({right:110,bottom:18});
  launcher.classList.add('nebu-wiggle');later(()=>launcher.classList.remove('nebu-wiggle'),1000);say('Pega!',2000);
  giveUp=later(endPlay,IDLE.playGiveUp);
 }
 function dodge(px,py){
  dodges++;clearTimeout(giveUp);timers.delete(giveUp);
  // Vai para o ponto da área de brincadeira mais longe do ponteiro.
  const h=win.innerHeight||768;let best=null;
  for(let i=0;i<6;i++){const c={right:toyZone.minRight+random()*(toyZone.maxRight-toyZone.minRight),bottom:toyZone.minBottom+random()*(toyZone.maxBottom-toyZone.minBottom)};const d=Math.hypot(width()-c.right-18-px,h-c.bottom-18-py);if(!best||d>best.d)best={...c,d};}
  if(best.d<120)for(const right of [toyZone.minRight,toyZone.maxRight])for(const bottom of [toyZone.minBottom,toyZone.maxBottom]){const d=Math.hypot(width()-right-18-px,h-bottom-18-py);if(d>best.d)best={right,bottom,d};}
  placeToy({right:Math.round(best.right),bottom:Math.round(best.bottom)});
  launcher.classList.remove('nebu-wiggle');void launcher.offsetWidth;launcher.classList.add('nebu-wiggle');
  say(['Hehe!','Quase!','Não pegou!','Au! Au!','Tenta de novo!'][dodges%5]);
  if(dodges>=IDLE.playDodges)later(endPlay,900);else giveUp=later(endPlay,IDLE.playGiveUp);
 }
 function endPlay(){if(state!=='playing')return;say('É meu! Hehe',1800);toy?.remove();toy=null;state='awake';launcher.classList.remove('nebu-wiggle');idleStart();}
 function idleStart(){
  for(const t of idleTimers)clearTimeout(t);
  idleTimers=[setTimeout(()=>{if(state==='awake'&&!busy()&&!calm)stroll();},IDLE.stroll),setTimeout(()=>{if(state==='awake'&&!busy()&&!calm&&random()<IDLE.playChance)play();},IDLE.play),setTimeout(()=>{if(state==='awake'&&!busy()&&!calm)chaseRight();},IDLE.chase),setTimeout(()=>{const go=()=>['chasing','playing','strolling'].includes(state)?later(go,500):sleep();go();},IDLE.sleep)];
 }
 function activity(e){
  // No bobinho, chegar perto do brinquedo faz ele desviar; o resto da tela segue normal.
  if(state==='playing'&&e&&['pointermove','pointerdown','touchstart'].includes(e.type)){
   const p=e.touches?.[0]||e,{x,y}=toyCenter(),near=Math.hypot((p.clientX??-999)-x,(p.clientY??-999)-y)<90;
   if(near||e.target===toy||toy?.contains(e.target)){e.type!=='pointermove'&&e.cancelable&&e.preventDefault?.();dodge(p.clientX??x,p.clientY??y);}
   return;
  }
  if(state!=='awake'||timers.size){clearScene();wake();}idleStart();
 }
 const events=['pointermove','pointerdown','keydown','wheel','touchstart','scroll','focusin'];
 for(const name of events)doc.addEventListener(name,activity,{passive:name!=='pointerdown'&&name!=='touchstart',capture:true});
 idleStart();
 return {state:()=>state,stop(){for(const name of events)doc.removeEventListener(name,activity,{capture:true});for(const t of idleTimers)clearTimeout(t);clearScene();wake();},activity};
}
