import test from 'node:test';import assert from 'node:assert/strict';import {alternateDemoCards} from '../app/highlight-order.mjs';
test('all fifty demo cards alternate image/no image without loss, preserving real positions and featured tiers',()=>{
 const rows=Array.from({length:50},(_,i)=>({id:i,is_fictitious:true,is_featured:true,logo_data:i<25?'image':''}));const result=alternateDemoCards(rows);assert.equal(new Set(result.map(r=>r.id)).size,50);result.forEach((r,i)=>assert.equal(Boolean(r.logo_data),i%2===0));assert.equal(rows[1].id,1);
 const real={id:'real'},plain={id:'plain',is_fictitious:true,is_featured:false};const mixed=[rows[0],real,rows[1],plain,rows[25]];const ordered=alternateDemoCards(mixed);assert.equal(ordered[1],real);assert.equal(ordered[3],plain);assert.equal(ordered[2],rows[25]);
 assert.deepEqual(alternateDemoCards([]),[]);assert.equal(alternateDemoCards([rows[0]]).length,1);
});
