import test from 'node:test';
import assert from 'node:assert/strict';
import ai from '../api/ai.mjs';
test('unknown agent action fails closed without invoking handlers',async()=>{
 const response={setHeader(){},status(code){this.code=code;return this},json(body){this.body=body;return this}};
 await ai({method:'GET',query:{action:'unknown'},headers:{}},response);
 assert.equal(response.code,404);
 assert.match(response.body.error,/não encontrado/i);
});
