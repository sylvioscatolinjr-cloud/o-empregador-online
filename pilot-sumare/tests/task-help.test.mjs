import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {getGuidedTasks} from '../src/ai-agent-catalog.mjs';
import {taskHelp,taskHelpMarkup,attachTaskHelp} from '../app/task-help.mjs';
test('all 54 resources have purpose, tailored input instructions and explicit credit steps',()=>{
 let count=0;
 for(const role of ['learner','recruiter','school_staff'])for(const task of getGuidedTasks(role,3)){
  const help=taskHelp(task);assert(help.description.length>50);assert.notEqual(help.description,task.hint);assert.equal(help.steps.length,4);assert(help.steps.join(' ').includes('R$ 1,00'));assert(help.steps.join(' ').includes(task.id==='resume_review'?'Carregar meu currículo e anexo':task.hint));count++;
 }
 assert.equal(count,54);
});
test('help toggles once even after repeated attachment and never activates the resource or submits',()=>{
 const task=getGuidedTasks('learner',1)[0],{window}=parseHTML(`<form><div class="ai-resource"><button type="button" data-action>Recurso</button>${taskHelpMarkup(task,'test')}</div></form>`),root=window.document.querySelector('form');let actions=0,submits=0;
 root.querySelector('[data-action]').addEventListener('click',()=>actions++);root.addEventListener('submit',()=>submits++);
 attachTaskHelp(root);attachTaskHelp(root);const button=root.querySelector('[data-task-help]'),panel=window.document.getElementById(button.getAttribute('aria-controls'));
 assert.equal(root.querySelector('button button'),null);assert.equal(panel.hidden,true);button.click();assert.equal(panel.hidden,false);assert.equal(button.getAttribute('aria-expanded'),'true');button.click();assert.equal(panel.hidden,true);assert.equal(actions,0);assert.equal(submits,0);
});
test('help escapes labels and instructions and explains a locked resource without purchasing',()=>{
 const task={...getGuidedTasks('recruiter',0)[0],label:'<img src=x onerror=bad()>',hint:'<script>private</script>'},{window}=parseHTML('<section>'+taskHelpMarkup(task,'test')+'</section>');assert.equal(window.document.querySelector('img,script'),null);assert.match(window.document.querySelector('section').textContent,/Requer plano nível 1/);
});

test('resource numbering starts at one and stays sequential across tiers',()=>{
 for(const role of ['learner','recruiter','school_staff']){
 const tasks=getGuidedTasks(role,1);
 const {document}=parseHTML('<section>'+tasks.map((t,i)=>taskHelpMarkup(t,'number',i)).join('')+'</section>');
 assert.deepEqual([...document.querySelectorAll('.ai-resource-number')].map(n=>n.textContent),tasks.map((_,i)=>String(i+1)));
 assert.equal(document.querySelector('button .ai-resource-number'),null);
 assert.equal(tasks.filter(t=>t.available).length,6);assert.equal(tasks.length,18);
 }
});
