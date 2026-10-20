import {test} from 'node:test';import assert from 'node:assert/strict';import {cardIdentity} from '../app/card-identity.mjs';
test('card image markup preserves watermark fallback and puts fictional label below image',()=>{
 assert.equal(cardIdentity('',false),'');assert.equal(cardIdentity('',true),'<span class="fictitious-watermark">Fictício</span>');
 const html=cardIdentity('data:image/png;base64,AAAA',true,true);assert.match(html,/card-identity/);assert.match(html,/card-portrait/);assert(html.indexOf('<img')<html.indexOf('Fictício'));assert.equal((html.match(/Fictício/g)||[]).length,1);
 assert(!cardIdentity('data:image/svg+xml;base64,AAAA',true).includes('<img'));assert(!cardIdentity('" onerror="alert(1)',true).includes('onerror'));
 assert(!cardIdentity('data:image/png;base64,AAAA',false).includes('Fictício'));
});
