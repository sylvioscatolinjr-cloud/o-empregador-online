import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('homepage uses the approved launch positioning', () => {
  const html = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');
  const heading = html.match(/<h1>(.*?)<\/h1>/)[1];
  assert.equal(heading.replace(/<[^>]*>/g, ''), 'Sua plataforma de conexão e evolução profissional.');
  for (const word of ['plataforma', 'conexão', 'evolução']) assert.ok(heading.includes(`<span class="brand-turquoise">${word}</span>`));
  assert.ok(!html.includes('<h1>Seu talento.<br>Seu próximo passo.</h1>'));
});
