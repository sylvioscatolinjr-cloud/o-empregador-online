import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {nebuSniff,nebuTroubleshoot} from '../src/nebu-guide.mjs';

test('candidatura: distingue instrução de falha, com e sem acentos',()=>{
 assert.equal(nebuSniff('Como me candidato a uma vaga?')[0].title,'Como me candidato a uma vaga?');
 for(const q of ['Cliquei em enviar candidatura e nada aconteceu. O que faço?','a candidatura nao funcionou','tentei participar da vaga e não deu certo']){
  const hits=nebuSniff(q);assert.equal(hits.length,1);assert.equal(hits[0].kind,'problema');
  assert.match(hits[0].text,/Minhas participações/);assert.match(hits[0].text,/não consegue confirmar/);
 }
});
test('pagamento: orienta conciliação, sem afirmar consulta nem sugerir nova compra',()=>{
 for(const q of ['Paguei por Pix e meus créditos não apareceram','a recarga não entrou','meu plano não liberou']){
  const hit=nebuSniff(q)[0];assert.equal(hit.kind,'problema');assert.match(hit.text,/Atualizar situação do pagamento/);
  assert.match(hit.text,/Não pague novamente/);assert.match(hit.text,/não consulta pagamentos/);
 }
 assert.equal(nebuSniff('meu plano não liberou')[0].href,'/assinatura.html');
 assert.equal(nebuSniff('a recarga não entrou')[0].href,'/carteira.html');
});
test('acesso e formulário preservam segredos e conteúdo não salvo',()=>{
 assert.match(nebuSniff('O link do email expirou')[0].text,/mais recente/);
 assert.match(nebuSniff('Não consigo entrar')[0].text,/Esqueci minha senha/);
 assert.match(nebuSniff('meu currículo não salvou')[0].text,/Preserve o texto/);
 assert.match(nebuSniff('meu currículo não salvou')[0].text,/não salva nem altera/);
});
test('erro ambíguo pede a etapa sem inventar diagnóstico',()=>{
 const hit=nebuSniff('não funcionou')[0];assert.match(hit.title,/qual etapa/);
 assert.match(hit.text,/não consulta sua conta/);assert.equal(hit.href,undefined);
});
test('busca informativa e conteúdo desconhecido continuam funcionando',()=>{
 assert.equal(nebuTroubleshoot('como publicar vaga'),null);
 assert.equal(nebuSniff('publicar vaga')[0].title,'Como publico uma vaga ou curso?');
 assert.match(nebuSniff('recarregar creditos pix')[0].title,/carteira/i);
 assert.equal(nebuSniff('xyzabc').length,0);
});
test('a interface trata dificuldade sem anúncio de sucesso ou atalhos irrelevantes',async()=>{
 const source=await readFile(new URL('../app/nebu.mjs',import.meta.url),'utf8');
 assert.match(source,/problem\?\[\]:pageMatches\(q\)/);
 assert.match(source,/problem\?'<h2>Vamos verificar/);
 for(const path of ['../app/nebu.mjs','../src/nebu-guide.mjs']){
  const s=await readFile(new URL(path,import.meta.url),'utf8');
  assert.doesNotMatch(s,/fetch\(|XMLHttpRequest|sendBeacon/);
 }
});
