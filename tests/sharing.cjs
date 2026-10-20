const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={URL};vm.createContext(ctx);vm.runInContext(fs.readFileSync('web/share-core.js','utf8'),ctx);const {link,share}=ctx.PortalShare;
(async()=>{
 assert.equal(link('https://portal.example/?token=private#account','anuncio','vaga 1'),'https://portal.example/?anuncio=vaga+1');
 assert.equal(link('https://portal.example','artigo','abc'),'https://portal.example/blog.html?artigo=abc');
 assert.equal(link('https://portal.example','anuncio','v1','/laboratorio/'),'https://portal.example/laboratorio/?anuncio=v1');
 assert.throws(()=>link('https://portal.example','cpf','abc'));
 let copied=0,shared=0;const data={title:'Vaga teste',url:'https://portal.example/?anuncio=1'};
 assert.equal(await share(data,{share:async d=>{shared++;assert.equal(d.url,data.url)},clipboard:{writeText:async()=>copied++}}),'shared');assert.equal(shared,1);assert.equal(copied,0);
 assert.equal(await share(data,{share:async()=>{const e=Error();e.name='AbortError';throw e},clipboard:{writeText:async()=>copied++}}),'canceled');assert.equal(copied,0);
 assert.equal(await share(data,{share:async()=>{throw Error('Denied')},clipboard:{writeText:async text=>{copied++;assert.equal(text,data.url)}}}),'copied');
 assert.equal(await share(data,{canShare:()=>false,share:async()=>{throw Error()},clipboard:{writeText:async()=>{}}}),'copied');
 assert.equal(await share(data,{clipboard:{writeText:async()=>{throw Error()}}}),'manual');assert.equal(await share(data,{}),'manual');
 assert.equal(fs.readFileSync('web/share-core.js','utf8'),fs.readFileSync('pilot-sumare/src/share-core.mjs','utf8'));
 console.log('Share: stable clean links, native share, cancellation, clipboard and manual fallback passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
