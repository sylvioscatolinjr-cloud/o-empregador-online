import {nebuAvatar,nebuRunner,catSprite,duckToy,playToy} from './nebu-avatar.mjs';
// Brincadeiras da Nebu quando a tela fica parada (pedido do titular em 29/10/2026):
// 1 min: um gato passa e ela corre latindo atrás. 2 min: ela dorme, às vezes com o pato de brinquedo.
// Dormindo, às vezes solta um pum ou o gato chega de mansinho, cutuca 3 vezes e ela acorda correndo atrás dele.
// 30 s: às vezes ela traz a bolinha ou o frango para brincar de bobinho: o brinquedo sempre desvia do ponteiro.
// Qualquer movimento do usuário acorda a Nebu e desfaz a cena. Tudo é decorativo (aria-hidden, sem cliques).
export const IDLE={play:30000,playChance:0.6,playDodges:6,playGiveUp:20000,chase:60000,sleep:120000,sleepEventMin:25000,sleepEventMax:45000,resleep:30000};
export const idleCss=`.nebu-stage{position:fixed;left:0;right:0;bottom:6px;height:84px;pointer-events:none;z-index:899;overflow:hidden}
.nebu-sprite{position:absolute;bottom:0;left:0;will-change:transform}.nebu-flip svg{transform:scaleX(-1)}
.nebu-sprite .nebu-leg-a{animation:nebu-leg .22s steps(2) infinite}.nebu-sprite .nebu-leg-b{animation:nebu-leg .22s steps(2) infinite reverse}
.nebu-sneak .nebu-leg-a,.nebu-sneak .nebu-leg-b{animation-duration:.6s}
@keyframes nebu-leg{0%{transform:translateY(0)}100%{transform:translateY(-3px)}}
.nebu-say{position:absolute;bottom:64px;left:40px;background:#fff;border:1px solid #ddd4e6;border-radius:12px;padding:2px 8px;font:700 13px/1.4 system-ui,sans-serif;color:#543878;white-space:nowrap}
.nebu-flip .nebu-say{left:auto;right:40px}
.nebu-tap{animation:nebu-tap .4s ease-in-out}@keyframes nebu-tap{50%{transform:translateY(-6px) rotate(-6deg)}}
.nebu-launcher .nebu-avatar{transition:opacity .3s}.nebu-launcher.nebu-away .nebu-avatar{opacity:0}
.nebu-zzz{position:fixed;right:22px;bottom:84px;z-index:900;pointer-events:none;font:700 16px/1 system-ui,sans-serif;color:#543878;animation:nebu-zzz 2.4s ease-in-out infinite}
@keyframes nebu-zzz{0%{opacity:0;transform:translate(0,6px)}50%{opacity:1}100%{opacity:0;transform:translate(10px,-14px)}}
.nebu-toy{position:fixed;right:78px;bottom:14px;z-index:900;pointer-events:none}
.nebu-puff{position:fixed;right:64px;bottom:20px;z-index:900;pointer-events:none;font:700 12px/1 system-ui,sans-serif;color:#6b7d4f;background:radial-gradient(circle,#dfe8c8 55%,transparent 60%);padding:12px 10px;border-radius:50%;animation:nebu-puff 2s ease-out forwards}
@keyframes nebu-puff{0%{opacity:0;transform:scale(.4)}25%{opacity:1}100%{opacity:0;transform:translate(-18px,-10px) scale(1.4)}}
.nebu-play{position:fixed;z-index:900;pointer-events:auto;cursor:grab;transition:right .35s cubic-bezier(.3,1.6,.5,1),bottom .35s cubic-bezier(.3,1.6,.5,1);touch-action:none}
.nebu-play-say{position:fixed;right:20px;bottom:86px;z-index:900;pointer-events:none;background:#fff;border:1px solid #ddd4e6;border-radius:12px;padding:2px 8px;font:700 13px/1.4 system-ui,sans-serif;color:#543878}
.nebu-launcher.nebu-wiggle{animation:nebu-wiggle .5s ease-in-out 2}@keyframes nebu-wiggle{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
@media (max-width:600px){.nebu-zzz{right:16px;bottom:72px}.nebu-toy{right:70px;bottom:10px}.nebu-puff{right:58px;bottom:14px}}
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
 function move(el,from,to,ms){el.style.transition='none';el.style.transform=`translateX(${from}px)`;later(()=>{el.style.transition=`transform ${ms}ms linear`;el.style.transform=`translateX(${to}px)`;},30);}
 const face=mood=>{const svg=launcher.querySelector('.nebu-avatar');if(svg)svg.outerHTML=nebuAvatar({size:56,title:'Nebu',mood});};
 const away=on=>launcher.classList.toggle('nebu-away',on);
 const clearScene=()=>{toy=null;for(const t of timers)clearTimeout(t);timers.clear();sceneLayer?.remove();sceneLayer=null;for(const el of doc.querySelectorAll('[data-nebu-scene]'))el.remove();launcher.classList.remove('nebu-away','nebu-wiggle','nebu-sleeping');};
 function wake(){if(state!=='awake')face('happy');state='awake';}
 const busy=()=>isPanelOpen()||doc.hidden;

 function chaseRight(done){
  state='chasing';const cat=sprite(catSprite()),dog=sprite(nebuRunner(),{say:'Au! Au!'});away(true);
  move(cat,-90,width()+100,3200);move(dog,-230,width()+20,3600);
  later(()=>{cat.remove();dog.remove();away(false);state='awake';done?.();},3700);
 }
 function chaseLeft(done){
  state='chasing';const cat=sprite(catSprite(),{flip:true}),dog=sprite(nebuRunner(),{flip:true,say:'Au! Au!'});away(true);
  move(cat,width()-170,-110,2400);move(dog,home(),-130,2800);
  later(()=>{dog.innerHTML=nebuRunner();dog.classList.remove('nebu-flip');move(dog,-130,home(),1800);},2900);
  later(()=>{cat.remove();dog.remove();away(false);state='awake';done?.();},4800);
 }
 function sleep(){
  if(busy())return void later(sleep,5000);
  const nap=()=>{state='sleeping';launcher.classList.add('nebu-sleeping');face('sleep');extra('nebu-zzz','Zzz');scheduleSleepEvent();};
  if(!calm&&random()<0.5){
   state='fetching';away(true);const dog=sprite(nebuRunner(),{flip:true});move(dog,home(),-120,1800);
   later(()=>{dog.innerHTML=nebuRunner({duck:true});dog.classList.remove('nebu-flip');move(dog,-120,home(),1800);},1900);
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
  state='teased';const cat=sprite(catSprite(),{cls:'nebu-sneak'});move(cat,-90,width()-170,2500);
  for(let i=0;i<3;i++)later(()=>{cat.classList.remove('nebu-tap');void cat.offsetWidth;cat.classList.add('nebu-tap');},2600+i*450);
  later(()=>{cat.remove();for(const z of doc.querySelectorAll('.nebu-zzz'))z.remove();launcher.classList.remove('nebu-sleeping');face('happy');state='awake';chaseLeft(()=>later(sleep,IDLE.resleep));},4000);
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
  idleTimers=[setTimeout(()=>{if(state==='awake'&&!busy()&&!calm&&random()<IDLE.playChance)play();},IDLE.play),setTimeout(()=>{if(state==='awake'&&!busy()&&!calm)chaseRight();},IDLE.chase),setTimeout(()=>{const go=()=>['chasing','playing'].includes(state)?later(go,500):sleep();go();},IDLE.sleep)];
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
