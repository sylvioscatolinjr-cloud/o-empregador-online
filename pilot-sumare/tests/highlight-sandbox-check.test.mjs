import test from 'node:test';
import assert from 'node:assert/strict';
import {checkHighlightSandbox} from '../src/highlight-sandbox-check.mjs';

test('sandbox checkout probe uses only the isolated endpoint and exact production highlight payload',async()=>{
 const calls=[];const fetchImpl=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({id:'checkout_fixture'})};};
 const result=await checkHighlightSandbox({key:'sandbox-test-secret',origin:'https://preview.example',fetchImpl});
 assert.equal(calls.length,2);assert.equal(calls[0].url,'https://api-sandbox.asaas.com/v3/checkouts');
 assert.equal(calls[1].url,'https://api-sandbox.asaas.com/v3/checkouts/checkout_fixture');
 assert.deepEqual(JSON.parse(calls[0].options.body).chargeTypes,['DETACHED']);
 assert.equal(JSON.parse(calls[0].options.body).items[0].value,9.9);
 assert.match(result.checkoutURL,/^https:\/\/sandbox\.asaas\.com\//);assert(!JSON.stringify(result).includes('sandbox-test-secret'));
});
test('sandbox probe rejects missing credentials and errors without disclosing provider response',async()=>{
 await assert.rejects(checkHighlightSandbox({key:'',origin:'https://preview.example'}),/chave/);
 await assert.rejects(checkHighlightSandbox({key:'secret',origin:'https://preview.example',fetchImpl:async()=>({ok:false,status:401})}),/HTTP 401/);
});
