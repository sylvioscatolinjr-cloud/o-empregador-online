// Draft only. A view means at least half a promoted card was visible for one
// second in a foreground tab. Deduplication is per browser session and day.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function mountHighlightMetrics(root,{fetcher=fetch,Observer=globalThis.IntersectionObserver,clock=globalThis,doc=root.ownerDocument,uuid=()=>crypto.randomUUID()}={}){
 let session;
 function sessionId(){if(session)return session;try{session=doc.defaultView.sessionStorage.getItem('oeo-highlight-session');if(!UUID.test(session||'')){session=uuid();doc.defaultView.sessionStorage.setItem('oeo-highlight-session',session);}}catch{session=session||uuid();}return session;}
 const visible=new Set(),observed=new Set(),timers=new Map(),sent=new Set();
 function data(el){const {highlightKind:kind,highlightId:targetId}=el.dataset;return ['candidate','job','course','training'].includes(kind)&&UUID.test(targetId||'')?{kind,targetId}:null;}
 function send(el,event){const d=data(el);if(!d||(d.kind==='candidate'&&event==='click'))return;const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const key=[day,d.kind,d.targetId,event].join('|');if(sent.has(key))return;let token;try{token=sessionId();}catch{return;}sent.add(key);
  Promise.resolve().then(()=>fetcher('/api/ai?action=highlight-metric',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...d,event,session:token}),keepalive:true,credentials:'same-origin'})).then(r=>{if(!r.ok)sent.delete(key);}).catch(()=>sent.delete(key));
 }
 function cancel(el){const t=timers.get(el);if(t!==undefined)clock.clearTimeout(t);timers.delete(el);}
 function start(el){if(doc.hidden||!visible.has(el)||timers.has(el))return;timers.set(el,clock.setTimeout(()=>{timers.delete(el);if(!doc.hidden&&visible.has(el)&&root.contains(el))send(el,'view');},1000));}
 const observer=Observer?new Observer(entries=>{for(const e of entries){const el=e.target;if(e.isIntersecting&&e.intersectionRatio>=0.5){visible.add(el);start(el);}else{visible.delete(el);cancel(el);}}},{threshold:[0,0.5]}):null;
 function refresh(){const current=new Set(root.querySelectorAll('[data-highlight-kind][data-highlight-id]'));for(const el of observed)if(!current.has(el)){observer?.unobserve(el);observed.delete(el);visible.delete(el);cancel(el);}for(const el of current)if(data(el)&&!observed.has(el)){observed.add(el);observer?.observe(el);}}
 function onVisibility(){if(doc.hidden)for(const el of visible)cancel(el);else for(const el of visible)start(el);}
 function onClick(event){const action=event.target.closest?.('[data-highlight-click]');if(!action)return;const el=action.closest('[data-highlight-kind][data-highlight-id]');if(el&&root.contains(el))send(el,'click');}
 root.addEventListener('click',onClick);doc.addEventListener('visibilitychange',onVisibility);refresh();
 return {refresh,dispose(){observer?.disconnect();for(const el of timers.keys())cancel(el);root.removeEventListener('click',onClick);doc.removeEventListener('visibilitychange',onVisibility);visible.clear();observed.clear();}};
}
export function highlightAttributes(kind,id,isFeatured,isFictitious){return isFeatured&&!isFictitious&&['candidate','job','course','training'].includes(kind)&&UUID.test(id||'')?` data-highlight-kind="${kind}" data-highlight-id="${id}"`:'';}
