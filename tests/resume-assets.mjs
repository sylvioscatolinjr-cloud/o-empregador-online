import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync('dist/server/index.js');
const {default:worker}=await import('data:text/javascript;base64,'+source.toString('base64'));
for(const [file,type] of [['resume-extractors.mjs','text/javascript'],['vendor/pdf.worker.min.mjs','text/javascript'],['vendor/ocr/worker.min.js','text/javascript'],['vendor/ocr/tesseract-core-lstm.wasm','application/wasm'],['vendor/ocr/lang/por.traineddata.gz','application/gzip'],['vendor/standard_fonts/LiberationSans-Regular.ttf','font/ttf']]){
 const response=await worker.fetch(new Request('https://test.example/'+file),{});
 assert.equal(response.status,200);assert(response.headers.get('Content-Type').startsWith(type));assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync('web/'+file));
}
console.log('PASS: packaged PDF/OCR workers, WASM, Portuguese data and fonts served intact with correct MIME types.');
