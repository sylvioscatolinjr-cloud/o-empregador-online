import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {EXTERNAL_TERMS,externalSearchCost,validateExternalInput} from '../src/ai-external-search.mjs';
import {taskCostLabel} from '../app/ai-result.mjs';
const body=(mode,price)=>({searchMode:mode,priceCents:price,externalConsent:true,terms:EXTERNAL_TERMS,question:'Projetista SolidWorks em Campinas, presencial.'});
test('preço por modo e valores exatos aceitos',()=>{
 assert.equal(externalSearchCost('standard'),250);assert.equal(externalSearchCost('expanded'),500);
 assert.doesNotThrow(()=>validateExternalInput(body('standard',250)));
 assert.doesNotThrow(()=>validateExternalInput(body('expanded',500)));
});
test('rejeita preço adulterado, modo inválido e autorização antiga',()=>{
 for(const b of [body('expanded',250),body('standard',500),body('expanded',499),body('expanded','500'),body('anything',250),{...body('expanded',500),externalConsent:false},{...body('expanded',500),terms:'2026-10-23-premium-search-v1'},null])assert.throws(()=>validateExternalInput(b));
});
test('rótulos refletem modo e preservam teste do proprietário',()=>{
 const task={mode:'external_search',costCents:250};
 assert.match(taskCostLabel(task),/Padrão R\$ 2,50 \/ Ampliada R\$ 5,00/);
 assert.equal(taskCostLabel(task,false,'standard'),'R$ 2,50 em créditos');
 assert.equal(taskCostLabel(task,false,'expanded'),'R$ 5,00 em créditos');
 assert.equal(taskCostLabel(task,true,'expanded'),'Teste — sem débito');
 assert.equal(taskCostLabel({costCents:100}),'R$ 1,00 em créditos');
});
test('servidor calcula reserva antes de chamar carteira e usa a mesma quantia na resposta',async()=>{
 const s=await readFile(new URL('../src/ai-chat-handler.mjs',import.meta.url),'utf8');
 assert.ok(s.indexOf('validateExternalInput(req.body);costCents=externalSearchCost')<s.indexOf('const reserved='));
 assert.match(s,/p_cost:costCents/);assert.match(s,/creditsCharged:ownerTest.enabled\?0:costCents\/100/);
});
test('interface envia o modo e valor calculados, exige novo aceite e informa bloqueio',async()=>{
 const s=await readFile(new URL('../app/ai.mjs',import.meta.url),'utf8');
 assert.match(s,/priceCents:selectedCost\(\)/);assert.doesNotMatch(s,/priceCents:250/);
 assert.match(s,/Saldo insuficiente/);assert.match(s,/externalOptions.querySelector\('input'\).checked=false/);
 assert.match(s,/Ampliada — até 10 oportunidades — R\$ 5,00/);
 assert.match(s,/data-search-price/);assert.match(s,/availableCents>=selectedCost\(\)/);
});
