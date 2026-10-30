import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {searchResultMarkup} from '../app/ai-result.mjs';
import {externalResult,externalInstruction,validateDeclaredEvidence} from '../src/ai-external-search.mjs';
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
test('both bold title conventions render without leftover Markdown',()=>{
 const {document}=parseHTML(searchResultMarkup(result('1. **Vaga: Projetista Mecânico**\nTexto.\n**2. Outra vaga**')));
 assert.equal(document.querySelectorAll('article').length,2);assert.doesNotMatch(document.querySelector('.research-result').textContent,/\*\*/);
});
test('a compatible criterion must be supported in full by a literal declared excerpt',()=>{
 const profile='Técnico em mecânica com três anos de experiência em SolidWorks e desenho mecânico 3D.';
 const row=(req,evidence,situation='Compatível com a informação declarada')=>`Requisito do anúncio: ${req}\nEvidência no perfil: ${evidence}\nSituação: ${situation}`;
 assert.doesNotThrow(()=>validateDeclaredEvidence(row('SolidWorks','três anos de experiência em SolidWorks'),profile));
 assert.doesNotThrow(()=>validateDeclaredEvidence(row('Técnico em mecânica','Técnico em mecânica'),profile));
 assert.doesNotThrow(()=>validateDeclaredEvidence(row('AutoCAD','Não fornecida','Informação não fornecida — confirmar'),profile));
 assert.equal(validateDeclaredEvidence(row('SolidWorks; máquinas industriais; listas de materiais','três anos de experiência em SolidWorks'),profile).length,1);
 assert.equal(validateDeclaredEvidence(row('AutoCAD','três anos de experiência em SolidWorks'),profile).length,1);
 assert.equal(validateDeclaredEvidence(row('AutoCAD','AutoCAD'),'Não tenho experiência em AutoCAD.').length,1);
 assert.equal(validateDeclaredEvidence(row('SolidWorks avançado','SolidWorks avançado'),profile).length,2);
});

test('uncertain evidence is downgraded and later source offsets remain aligned',()=>{
 const text='Requisito do anúncio: AutoCAD\nEvidência no perfil: três anos de experiência em SolidWorks\nSituação: Compatível com a informação declarada\n[fonte]';
 const raw=provider(text);raw.output[1].content[0].annotations[0].start_index=text.indexOf('[fonte]');raw.output[1].content[0].annotations[0].end_index=text.length;
 const r=externalResult(raw,{question:'Tenho três anos de experiência em SolidWorks.'});
 assert.doesNotMatch(r.answer,/Situação: Compatível/);assert.match(r.answer,/Informação não fornecida — confirmar/);assert.equal(r.answer.slice(r.citations[0].start,r.citations[0].end),'[fonte]');
});

test('plain-text URLs must match real tool sources before becoming citations',()=>{
 const text='1. Vaga\nLink do anúncio: https://example.org/job?utm_source=openai';
 const data={status:'completed',output:[{type:'web_search_call',status:'completed',action:{sources:[{url:'https://example.org/job',title:'Vaga original'}]}},{content:[{type:'output_text',text,annotations:[]}]}]};
 const result=externalResult(data);assert.equal(result.citations.length,1);assert.match(result.answer.slice(result.citations[0].start,result.citations[0].end),/^https:/);
 data.output[1].content[0].text='Link: https://inventado.example.org/job';assert.throws(()=>externalResult(data),/No cited/);
});
