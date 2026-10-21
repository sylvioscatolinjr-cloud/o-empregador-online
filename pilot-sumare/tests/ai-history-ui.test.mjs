import test from 'node:test';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';
import {mountAgentHistory,continuationText} from '../app/ai-history.mjs';
const tick=()=>new Promise(r=>setTimeout(r,5));
test('history is escaped and resume does not call a model or debit',async()=>{
 const {document}=parseHTML('<section id="history"></section>'),root=document.querySelector('section'),calls=[],reused=[];
 const note={id:'n',task_id:'goal_followup',label:'Metas',question:'<script>private</script>',answer:'Orientação',created_at:'2026-10-21'};
 const history=mountAgentHistory(root,{api:async(action)=>{calls.push(action);return {notes:[note]}},isCurrent:()=>true,onReuse:(n,text)=>reused.push([n,text])});
 await history.refresh();assert.equal(root.querySelector('script'),null);root.querySelector('[data-history-reuse]').click();assert.equal(reused.length,1);assert.match(reused[0][1],/Meu progresso/);assert.deepEqual(calls,['history-list']);
 root.querySelector('[data-history-delete]').click();await tick();assert.deepEqual(calls,['history-list','history-delete','history-list']);
});
test('long prior guidance is explicitly shortened within the input budget',()=>{const text=continuationText({question:'a'.repeat(4000),answer:'b'.repeat(20000)});assert(text.length<4000);assert.match(text,/trecho/);});
test('late history response is discarded after session change',async()=>{const {document}=parseHTML('<section></section>');let resolve,current=true;const root=document.querySelector('section'),history=mountAgentHistory(root,{api:()=>new Promise(r=>resolve=r),isCurrent:()=>current,onReuse(){}});const pending=history.refresh();current=false;root.textContent='Sessão encerrada';resolve({notes:[{question:'segredo'}]});await pending;assert.equal(root.textContent,'Sessão encerrada');});
