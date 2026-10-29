import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('homepage uses the approved launch positioning', () => {
  const html = readFileSync(new URL('../app/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('<h1>Sua plataforma de conexão e evolução profissional.</h1>'));
  assert.ok(!html.includes('<h1>Seu talento.<br>Seu próximo passo.</h1>'));
});
