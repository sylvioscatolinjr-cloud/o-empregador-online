import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {orderOcrText} from '../web/resume-layout.mjs';
import {extractResumeText} from '../web/resume-extractors.mjs';
const require=createRequire(import.meta.url),runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const dep=process.env.RESUME_TEST_DEPENDENCIES||'/workspace/scratch/6b8b020acc41/resume-deps/node_modules';
const canvas=require(path.join(runtime,'@napi-rs/canvas'));
Object.assign(globalThis,{DOMMatrix:canvas.DOMMatrix,Path2D:canvas.Path2D,ImageData:canvas.ImageData});
const pdfjs=await import('../web/vendor/pdf.min.mjs');
pdfjs.GlobalWorkerOptions.workerSrc=pathToFileURL(path.resolve('web/vendor/pdf.worker.min.mjs')).href;
const mammoth=require(path.join(dep,'mammoth'));
const options={pdfjs,standardFontDataUrl:path.resolve('web/vendor/standard_fonts')+'/',mammoth:{extractRawText:({arrayBuffer})=>mammoth.extractRawText({buffer:Buffer.from(arrayBuffer)})}};
const parser=require('../web/resume-parser.js');
for(const ext of ['pdf','docx']){
 const file=new File([fs.readFileSync('tests/fixtures/resume-senai.'+ext)],'Currículo.'+ext);
 const result=await extractResumeText(file,options),parsed=parser.parseResumeText(result.text,{blocks:result.blocks});
 assert.equal(parsed.fields.email,'maria@example.com');assert.equal(parsed.fields.name,'MARIA EXEMPLO');assert.equal(parsed.senai.senaiStatus,'completed');assert.equal(result.ocrUsed,false);assert(!parsed.fields.skills.includes('PORTFÓLIO'));
}

for(const filename of ['resume-columns.pdf','resume-sidebar-left.pdf']){
 const result=await extractResumeText(new File([fs.readFileSync('tests/fixtures/'+filename)],filename),options),parsed=parser.parseResumeText(result.text,{blocks:result.blocks});
 assert(result.blocks.some(b=>b.column===1));assert.equal(parsed.fields.name,'PESSOA MODELO');
 assert.match(parsed.fields.experience,/Empresa Modelo/);assert.match(parsed.fields.experience,/Oficina Exemplo/);assert.match(parsed.fields.experience,/Indústria Modelo/);
 assert(!parsed.fields.education.includes('SENAI'));assert.match(parsed.fields.education,/Faculdade Modelo/);assert.match(parsed.fields.courses,/SENAI - Aprendizagem industrial/);assert.match(parsed.fields.courses,/Concluído em 2020/);assert(!parsed.fields.education.includes('Certificação'));
 assert.match(parsed.fields.courses,/Curso de CAD/);assert.match(parsed.fields.courses,/Treinamento de metrologia/);
 assert.match(parsed.fields.certifications,/Certificação de qualidade/);assert.match(parsed.fields.certifications,/Certificado de segurança/);
 assert.match(parsed.fields.skills,/Facilidade em trabalhar em equipe/);assert(!/Empresa|Faculdade|Certific|Curso|Treinamento|SENAI/.test(parsed.fields.skills));assert.equal(parsed.senai.senaiStatus,'completed');
}
await assert.rejects(()=>extractResumeText(new File(['texto inválido'],'curriculo.pdf'),options),/válido/);
await assert.rejects(()=>extractResumeText(new File(['PK falso'],'curriculo.docx'),options),/DOCX válido/);
await assert.rejects(()=>extractResumeText(new File([new Uint8Array(5*1024*1024+1)],'grande.pdf'),options),/5 MB/);
let worker;
try{
 const {createWorker}=require(path.join(runtime,'tesseract.js'));
 worker=await createWorker('por',1,{langPath:path.resolve('web/vendor/ocr/lang'),corePath:path.resolve('web/vendor/ocr/tesseract-core-lstm.js'),cacheMethod:'none'});
 const file=new File([fs.readFileSync('tests/fixtures/resume-senai-scan.pdf')],'escaneado.pdf');
 const result=await extractResumeText(file,{...options,ocr:async page=>{const viewport=page.getViewport({scale:2}),image=canvas.createCanvas(Math.ceil(viewport.width),Math.ceil(viewport.height));await page.render({canvas:image,canvasContext:image.getContext('2d'),viewport}).promise;const data=(await worker.recognize(image.toBuffer('image/png'),{}, {text:true,blocks:true})).data;assert(data.blocks?.length);return orderOcrText(data,viewport.width);}});
 assert.equal(result.ocrUsed,true);assert(result.warnings.length);const parsed=parser.parseResumeText(result.text,{blocks:result.blocks});assert.equal(parsed.senai.senaiTraining,true);assert.equal(parsed.senai.senaiStatus,'completed');assert(result.warnings.some(x=>x.includes('confira')));assert.match(result.text,/MARIA EXEMPLO/);
 console.log('PASS: real PDF and DOCX extraction, two-column PDF with both sidebar positions and disordered font objects, scanned PDF → local Portuguese OCR → SENAI, invalid/signature/size rejection. No external model calls.');
}finally{if(worker)await worker.terminate();}
