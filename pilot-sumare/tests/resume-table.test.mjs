import test from 'node:test';
import assert from 'node:assert/strict';
import '../app/import/resume-parser.js';
import {orderPositionedText} from '../app/import/resume-layout.mjs';
const parser=globalThis.ResumeParser;
test('table rows preserve wrapped skills, language levels and full width experience across pages',()=>{
 const items=[];const add=(text,x,y,width=90)=>items.push({text,x,y,width,height:10});
 add('PESSOA MODELO',40,20,160);add('DADOS PESSOAIS',40,40,130);
 add('Horário:',40,60);add('Formação:',240,60);add('Sim',400,60);
 add('CONHECIMENTOS',40,90,140);
 add('Facilidade de',40,110);add('relacionamento',40,124);add('Criatividade',240,117);add('Organização',400,117);
 add('Trabalho em equipe',40,145);add('CAD',240,145);add('Metrologia',400,145);
 add('IDIOMAS',40,170);for(const [i,v] of ['Idioma','Compreensão','Escrita','Fala','Leitura'].entries())add(v,40+i*100,190,80);
 for(const [i,v] of ['Português','Intermediário','Intermediário','Avançado','Avançado'].entries())add(v,40+i*100,210,80);
 const layout=orderPositionedText(items,600,1);assert.equal(layout.table,true);assert.match(layout.text,/Facilidade de relacionamento \| Criatividade \| Organização/);
 const more={column:0,page:2,text:'Inglês | Básico | Básico | Básico | Básico\nFORMAÇÃO\nCurso: Mecânica geral\nTipo: Cursos Complementares\nInstituição: SENAI\nStatus: Completo\nEXPERIÊNCIAS\nEmpresa: Empresa Modelo\nCargo: Instrutor\nAtividade: Ministrar cursos de desenho e controle de qualidade.\nEntrada: 2012 | Saída: 2019'};
 const r=parser.parseResumeText(layout.text+'\n'+more.text,{blocks:[...layout.blocks,more]});assert.equal(r.fields.education,undefined);assert.match(r.fields.courses,/Mecânica geral/);assert.match(r.fields.experience,/Ministrar cursos/);assert.match(r.fields.skills,/Português — compreensão: Intermediário; escrita: Intermediário; fala: Avançado; leitura: Avançado/);assert.match(r.fields.skills,/Inglês — compreensão: Básico/);assert(!r.fields.skills.includes('Idioma | Compreensão'));assert(!r.fields.skills.includes('Empresa Modelo'));
});
