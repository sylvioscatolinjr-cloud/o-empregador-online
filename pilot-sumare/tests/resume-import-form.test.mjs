import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {resumeWizardMarkup,attachResumeWizard} from '../app/resume-wizard.mjs';
await import('../app/import/resume-parser.js');
const source=(await readFile(new URL('../app/resume-upload.mjs',import.meta.url),'utf8'))
 .replace(/export /g,'').replace("await import('/import/resume-extractors.mjs')",'await loadReaders()').replace("await import('/import/resume-parser.js')",'undefined');
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
test('import review preserves existing fields, applies only selected values, and reopens wizard without duplication or implicit sharing',async()=>{
 const profile={display_name:'Pessoa Fictícia',skills:'Competência já salva',experience:'Experiência anterior'};
 const {window,document}=parseHTML('<main>'+resumeWizardMarkup(profile)+'</main>');
 const previous=globalThis.document;globalThis.document=document;
 try{
  const form=document.querySelector('form'),wizard=attachResumeWizard(form,{profile});let uploads=0;
  const input=form.querySelector('[name=resumeFile]');Object.defineProperty(input,'files',{value:[new File(['fixture'],'ficticio.pdf')]});
  const context={document,Event:window.Event,ResumeParser:globalThis.ResumeParser,loadReaders:async()=>({async extractResumeText(){return {text:'Pessoa Exemplo\nEXPERIÊNCIA\nOficina Modelo — Técnico\n2020 a 2023\nFORMAÇÃO\nUniversidade Modelo — Pedagogia\nConcluído 2024\nSENAI — Curso de aprendizagem industrial (CAI)\nEletricista\nConcluído 2023\nCOMPETÊNCIAS\nCAD, Comunicação',warnings:[]}}})};
  vm.createContext(context);vm.runInContext(source,context);const uploader=context.attachResumeUpload(form,{profile,repo:{async upload(){uploads++;return 'private/fixture.pdf'}},feedback(){}});
  form.querySelector('[data-resume=read]').click();await tick();
  assert.match(form.querySelector('[data-resume-status]').textContent,/Leitura concluída/);
  assert.equal(form.querySelector('[name=skills]').value,'Competência já salva');
  assert.equal(form.querySelector('[data-import-field=skills]').hasAttribute('checked'),false);
  const choices=['education','courses'];for(const box of form.querySelectorAll('[data-import-field]')){box.checked=choices.includes(box.dataset.importField);if(box.checked)box.setAttribute('checked','');else box.removeAttribute('checked');}
  form.querySelector('[data-resume=apply]').click();await tick();
  const saved=wizard.values();assert.match(saved.education,/Pedagogia/);assert(!saved.education.includes('aprendizagem'));assert.match(saved.courses,/SENAI/);assert.equal(saved.skills,'Competência já salva');assert.equal(saved.experience,'Experiência anterior');assert.equal(uploads,0);
  const reopened=parseHTML('<main>'+resumeWizardMarkup(saved)+'</main>');globalThis.document=reopened.document;const next=attachResumeWizard(reopened.document.querySelector('form'),{profile:saved});const values=next.values();assert.equal(values.education,saved.education);assert.equal(values.courses,saved.courses);assert.equal(values.resume_details.share_contact,false);assert.equal(values.resume_details.share_photo,false);assert.equal(values.resume_details.share_optional,false);
  assert.equal(await uploader.attachment(),'private/fixture.pdf');assert.equal(uploads,1);uploader.committed('private/fixture.pdf');
 }finally{if(previous)globalThis.document=previous;else delete globalThis.document;}
});
