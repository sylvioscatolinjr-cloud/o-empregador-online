import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('Turbinar is separate from paid showcase highlights and remains fail-closed',async()=>{
 const app=await readFile(new URL('../app/app.mjs',import.meta.url),'utf8');
 assert.match(app,/recruiting\?'<a class="portal-action" href="\/turbinar.html">Turbinar anúncio/);
 assert.match(app,/href="\/destaques.html">Destacar na vitrine/);
 const html=await readFile(new URL('../app/turbinar.html',import.meta.url),'utf8');
 assert.match(html,/Envio comercial ainda indisponível/);
 assert.match(html,/R\$ 0,05/);
 assert.match(html,/Nenhum valor será debitado/);
 assert.doesNotMatch(html,/<form|<script|<input|<button/i);
 const build=await readFile(new URL('../scripts/build.mjs',import.meta.url),'utf8');
 assert.match(build,/copyFile\('app\/turbinar.html','dist\/turbinar.html'\)/);
});
