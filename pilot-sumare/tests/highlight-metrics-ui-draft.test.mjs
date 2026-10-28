import test from 'node:test';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';import {mountHighlightMetrics} from '../app/highlight-metrics-draft.mjs';
const id='33333333-3333-4333-8333-333333333333',session='55555555-5555-4555-8555-555555555555';
test('visibility counts after a second; hidden cards, repeated events and unrelated buttons do not inflate metrics',async()=>{
 const {document,window}=parseHTML(`<main><article data-highlight-kind="job" data-highlight-id="${id}"><button data-highlight-click>Ver detalhes</button><button data-other>Favoritar</button></article></main>`),root=document.querySelector('main'),card=document.querySelector('article'),calls=[],timers=new Map();let next=0,instance;
 Object.defineProperty(document,'hidden',{value:false,writable:true});
 const clock={setTimeout(fn){const id=++next;timers.set(id,fn);return id},clearTimeout(id){timers.delete(id)}};
 class FakeObserver{constructor(callback){this.callback=callback;this.elements=[];instance=this;}observe(el){this.elements.push(el)}disconnect(){this.closed=true;}}
 const tracker=mountHighlightMetrics(root,{doc:document,clock,Observer:FakeObserver,uuid:()=>session,fetcher:async(_path,opt)=>{calls.push(JSON.parse(opt.body));return {ok:true}}});assert.equal(instance.elements.length,1);
 instance.callback([{target:card,isIntersecting:true,intersectionRatio:0.6}]);assert.equal(timers.size,1);instance.callback([{target:card,isIntersecting:false,intersectionRatio:0}]);assert.equal(timers.size,0);assert.equal(calls.length,0);
 instance.callback([{target:card,isIntersecting:true,intersectionRatio:0.6}]);for(const fn of [...timers.values()])fn();await Promise.resolve();assert.equal(calls.length,1);assert.equal(calls[0].event,'view');
 instance.callback([{target:card,isIntersecting:true,intersectionRatio:0.6}]);for(const fn of [...timers.values()])fn();await Promise.resolve();assert.equal(calls.length,1);
 root.querySelector('[data-other]').dispatchEvent(new window.Event('click',{bubbles:true}));assert.equal(calls.length,1);root.querySelector('[data-highlight-click]').dispatchEvent(new window.Event('click',{bubbles:true}));await Promise.resolve();assert.equal(calls.length,2);assert.equal(calls[1].event,'click');assert(calls.every(x=>x.session===session));
 tracker.dispose();assert(instance.closed);
});
