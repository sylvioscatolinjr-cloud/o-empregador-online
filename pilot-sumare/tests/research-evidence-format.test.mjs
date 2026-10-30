import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {searchResultMarkup} from '../app/ai-result.mjs';
import {externalResult,externalInstruction} from '../src/ai-external-search.mjs';
const result=answer=>({answer,searchedAt:'2026-10-30T20:00:00Z',citations:[]});
test('legacy Markdown becomes readable opportunity blocks and safe links',()=>{
 const {document}=parseHTML(searchResultMarkup(result('**1. Projetista Mecânico — Sumaré**\n\n- **Link da vaga:** [Jooble](https://br.jooble.org/jdp/123)\n- **Requisito:** SolidWorks\n\n**2. Projetista — Campinas**\nInformação não fornecida — confirmar: AutoCAD.')));
 assert.equal(document.querySelectorAll('article').length,2);
 assert.equal(document.querySelector('h3').textContent,'1. Projetista Mecânico — Sumaré');
 assert.equal(document.querySelector('a').textContent,'Jooble');
 assert.equal(document.querySelector('a').getAttribute('rel'),'noopener noreferrer');
 assert.equal(document.querySelectorAll('strong').length,2);
 assert.doesNotMatch(document.querySelector('.research-result').textContent,/\*\*|\]\(https/);
});
test('HTML, event handlers, credential URLs and local URLs never become active markup',()=>{
 const r=result('1. Vaga\n<script>alert(1)</script> <img src=x onerror=bad()>\n[ruim](javascript:alert) [local](https://localhost/a) [segredo](https://user:pass@example.org/a)');
 r.citations=[{start:0,end:1,url:'https://localhost/a',title:'ruim'}];
 const {document}=parseHTML(searchResultMarkup(r));
 assert.equal(document.querySelector('script,img,a'),null);
 assert.match(document.querySelector('.research-result').textContent,/<script>/);
});
test('citation offsets remain correct beside formatted headings and cannot nest anchors',()=>{
 const answer='**1. Vaga**\nSolidWorks é necessário. [fonte]';const start=answer.indexOf('[fonte]');
 const r={...result(answer),citations:[{start,end:answer.length,url:'https://example.org/job',title:'Anúncio <original>'}]};
 const {document}=parseHTML(searchResultMarkup(r));
 assert.match(document.querySelector('article').textContent,/SolidWorks é necessário\. Fonte 1/);
 assert.equal(document.querySelector('a a'),null);assert.equal(document.querySelectorAll('a').length,2);
 assert.equal(document.querySelector('script,img'),null);
});
const provider=answer=>({status:'completed',output:[{type:'web_search_call',status:'completed'},{content:[{type:'output_text',text:answer,annotations:[{type:'url_citation',start_index:0,end_index:1,url:'https://example.org/job',title:'Vaga'}]}]}]});
test('hiring forecasts are rejected while evidence-based uncertainty is accepted',()=>{
 for(const label of ['**Probabilidade de contratação:** Alta','Chance de contratação: 80%','Probabilidade de contratação: Moderada'])assert.throws(()=>externalResult(provider(label)),/forecast/);
 assert.doesNotThrow(()=>externalResult(provider('Não é possível estimar probabilidade de contratação. Informação não fornecida — confirmar: AutoCAD.')));
});
test('both modes require declared evidence and distinguish unknown from incompatible',()=>{
 for(const mode of ['standard','expanded']){
  const s=externalInstruction(mode);assert.match(s,/Nunca copie requisitos do anúncio para o perfil/);assert.match(s,/três anos de SolidWorks/);assert.match(s,/Informação não fornecida — confirmar/);assert.match(s,/Divergência declarada/);assert.match(s,/Disponibilidade não confirmada/);
 }
});
test('plain specific HTTPS URLs are clickable without long addresses in the label',()=>{
 const {document}=parseHTML(searchResultMarkup(result('1. Vaga\nLink: https://example.org/job/123?source=test.')));
 const a=document.querySelector('a');assert.equal(a.getAttribute('href'),'https://example.org/job/123?source=test');assert.equal(a.textContent,'Abrir anúncio · example.org');
});
