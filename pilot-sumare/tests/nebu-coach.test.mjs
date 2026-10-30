import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {candidateStatus,organizationStatus,nebuCoach,nebuNudge,quotes,quoteOfDay,publishNebuStatus,patchNebuStatus,STATUS_EVENT} from '../src/nebu-coach.mjs';
import {nebuSniff} from '../src/nebu-guide.mjs';

const fullProfile={display_name:'Ana Souza',city:'Sumaré',state_code:'SP',skills:'Excel, atendimento',about:'Atendente com cinco anos de experiência em comércio e foco em clientes.',experience:'Loja X',education:'Ensino médio',courses:'Excel básico',photo_data:'data:image/png;base64,AA==',resume_details:{contact:{first_name:'Ana',last_name:'Souza',phone:'19999999999'}}};

test('candidato vazio: prioriza cartão público e explica a ordem real da busca',()=>{
 const c=nebuCoach(candidateStatus({profile:{display_name:'Ana'}}));
 assert.equal(c.complete,false);assert.equal(c.tips.length,3);
 assert.equal(c.tips[0].id,'card');
 assert.match(c.why,/destaques pagos, depois assinantes/);assert.match(c.why,/pontos profissionais/);
 assert.match(nebuNudge(c),/^Seu cadastro está \d+% completo/);
});

test('candidato completo recebe só dica de crescimento, em rodízio',()=>{
 const s=candidateStatus({profile:fullProfile,card:{visible:true,headline:'Atendente',skills:'Excel'},goal:{role:'Supervisora'}});
 const c=nebuCoach(s);assert.equal(c.complete,true);assert.equal(c.percent,100);assert.equal(c.tips.length,0);
 const ids=new Set([0,1,2,3].map(i=>nebuCoach(s,i).growth.id));assert.equal(ids.size,4);
 assert.ok(ids.has('g-plan'));
});

test('cartão sem título ou competências não conta como encontrável',()=>{
 const s=candidateStatus({profile:fullProfile,card:{visible:true,headline:'',skills:''}});
 assert.equal(s.checks.card,true);assert.equal(s.checks.cardSearch,false);
});

test('empresa: vaga incompleta, equipe vazia e convite aos funcionários',()=>{
 const s=organizationStatus({org:{name:'Loja',city:'Sumaré',state_code:'SP',logo_data:'x'},listings:[{kind:'job',description:'curta'}],points:{organization:{members:0},departments:[]}});
 const ids=nebuCoach(s).tips.map(t=>t.id);
 assert.deepEqual(ids,['detailed','team','departments']);
 assert.match(nebuCoach(s).tips[1].text,/média de pontos de cada setor/);
});

test('empresa sem dados de pontos não conta equipe como pendente',()=>{
 const s=organizationStatus({org:{name:'Loja'},listings:[],points:{unavailable:true}});
 assert.equal(s.checks.team,null);
 assert.ok(!nebuCoach(s).tips.some(t=>t.id==='team'));
});

test('instituição: cursos bem descritos, agente de captação e turma sem prometer contagem de vagas',()=>{
 const s=organizationStatus({school:true,org:{name:'Escola'},listings:[{kind:'job'}]});
 assert.equal(s.checks.published,false,'vagas de emprego não contam como curso');
 const growth=[0,1,2,3].map(i=>nebuCoach(s,i).growth);
 const ai=growth.find(g=>g.id==='g-ai'),cls=growth.find(g=>g.id==='g-class');
 assert.match(ai.text,/Preparar divulgação de curso/);assert.match(ai.text,/R\$ 2,50/);
 assert.match(cls.text,/R\$ 0,05 por destinatário/);
 assert.doesNotMatch(cls.text,/\d+ vagas/);
});

test('fatos de preço e ordem batem com o código',async()=>{
 const feeds=await readFile(new URL('../db/ordered-public-feeds.sql',import.meta.url),'utf8');
 assert.match(feeds,/order by c\.is_featured desc,subscription_tier desc,professional_points desc/);
 assert.match(feeds,/order by l\.is_featured desc,subscription_tier desc,organization_points desc/);
 const catalog=await readFile(new URL('../src/ai-agent-catalog.mjs',import.meta.url),'utf8');
 for(const label of ['Preparar divulgação de curso','Criar posts para divulgar cursos','Planejar parceria com empresas','Preparar descrição de vaga','Criar perguntas de entrevista','Analisar competências do setor'])assert.ok(catalog.includes(label),label);
});

test('frases: rodízio diário, sem repetir em dias seguidos',()=>{
 assert.ok(quotes.length>=30);assert.equal(new Set(quotes).size,quotes.length);
 const a=quoteOfDay(new Date(2026,9,30)),b=quoteOfDay(new Date(2026,9,31));
 assert.ok(quotes.includes(a));assert.notEqual(a,b);
});

test('ponte leva só marcas sim/não e atualiza depois de salvar',()=>{
 const events=[];const target={document:{dispatchEvent:e=>events.push(e)},CustomEvent:class{constructor(t,o){this.type=t;this.detail=o.detail;}}};
 const s=candidateStatus({profile:{...fullProfile,about:'texto privado do currículo'}});
 assert.ok(Object.values(s.checks).every(v=>typeof v==='boolean'));
 assert.ok(!JSON.stringify(s).includes('Ana'));
 publishNebuStatus(s,target);assert.equal(events[0].type,STATUS_EVENT);
 patchNebuStatus('candidate',{card:true},target);assert.equal(target.__oeoNebuStatus.checks.card,true);
 patchNebuStatus('company',{card:false},target);assert.equal(target.__oeoNebuStatus.checks.card,true);
 publishNebuStatus(null,target);assert.equal(target.__oeoNebuStatus,null);
});

test('Farejar responde sobre ordem e pontos',()=>{
 assert.match(nebuSniff('como funciona a ordem dos currículos')[0].text,/assinantes/);
 assert.match(nebuSniff('como ganho pontos')[0].title,/pontos/);
});
