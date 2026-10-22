import test from 'node:test';import assert from 'node:assert/strict';import {organizationPointsMarkup} from '../app/organization-points.mjs';
test('organization points distinguish a real zero from unavailable average and escape department names',()=>{const html=organizationPointsMarkup({organization:{members:2,average:0},departments:[{name:'<script>unsafe</script>',points:{members:0,average:null}}]});assert(html.includes('<strong>0</strong>'));assert(html.includes('Sem média'));assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>'));assert(html.includes('Cada pessoa conta uma vez'));});
test('history distinguishes increases, decreases, empty means and first measurements without inventing hiring causes',()=>{
 const base={organization:{members:2,average:150},departments:[],history:[]};
 for(const [average,previous_average,previous_members,text]of [[150,100,2,'↑ Subiu 50'],[0,100,2,'↓ Caiu 100'],[0,0,1,'Média mantida'],[null,100,1,'Média indisponível'],[100,null,0,'Média disponível'],[0,null,null,'Primeiro registro']]){
  const html=organizationPointsMarkup({...base,history:[{department_id:null,average,previous_average,previous_members,members:average===null?0:2,recorded_at:'2026-10-22T18:00:00Z'}]});assert(html.includes(text));assert(html.includes('15:00:00'));assert(html.includes('<caption>'));assert(html.includes('Alterações entre duas consultas aparecem juntas'));
 }
});
test('each department history contains only its own measurements and shared styling stays intact',()=>{
 const html=organizationPointsMarkup({organization:{members:2,average:150},departments:[{id:'a',name:'Setor A',points:{members:1,average:200}},{id:'b',name:'Setor B',points:{members:1,average:100}}],history:[{department_id:null,members:2,average:150,previous_average:100,previous_members:2,recorded_at:'2026-10-22T18:00:00Z'},{department_id:'a',members:1,average:200,previous_average:100,previous_members:1,recorded_at:'2026-10-22T18:00:00Z'}]});
 assert.equal((html.match(/<table>/g)||[]).length,2);assert.equal((html.match(/↑ Subiu 100/g)||[]).length,2);assert(html.includes('class="table-scroll"'));assert(html.includes('tabindex="0"'));
});
