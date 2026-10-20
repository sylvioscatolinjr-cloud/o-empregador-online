import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const worker=(await import('../dist/server/index.js')).default;
const manifestResponse=await worker.fetch(new Request('https://portal.test/manifest.webmanifest'),{});
assert.match(manifestResponse.headers.get('Content-Type'),/application\/manifest\+json/);
const manifest=await manifestResponse.json();assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'/');
for(const icon of manifest.icons){const response=await worker.fetch(new Request('https://portal.test'+icon.src),{});assert.equal(response.status,200);assert.equal(response.headers.get('Content-Type'),'image/png');const b=new DataView(await response.arrayBuffer());const size=Number(icon.sizes.split('x')[0]);assert.equal(b.getUint32(16),size);assert.equal(b.getUint32(20),size)}
const swResponse=await worker.fetch(new Request('https://portal.test/sw.js'),{});assert.match(swResponse.headers.get('Content-Type'),/javascript/);
const events={},cached=new Map(),names=['other-app-cache','empregador-offline-old'];let online=true,redirect=false,requests=[];
const scope={location:{origin:'https://portal.test'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>events[name]=fn};
const fetchMock=async req=>{requests.push(typeof req==='string'?req:req.url);if(!online)throw Error('offline');const r=new Response('<title>Generic offline</title>',{headers:{'Content-Type':'text/html'}});Object.defineProperty(r,'redirected',{value:redirect});return r};
const caches={open:async()=>({put:async(k,r)=>cached.set(k,r)}),match:async k=>cached.get(k)?.clone(),keys:async()=>names,delete:async name=>{names.splice(names.indexOf(name),1);return true}};
vm.runInNewContext(fs.readFileSync('web/sw.js','utf8'),{self:scope,caches,fetch:fetchMock,URL,Response});
let pending;events.install({waitUntil:p=>pending=p});await pending;assert.deepEqual([...cached.keys()],['/offline.html']);
events.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(names,['other-app-cache']);
for(const path of ['/api/state','/api/resume','/signin-with-chatgpt','/auth/callback','/logout']){let intercepted=false;events.fetch({request:{url:'https://portal.test'+path,method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});assert(!intercepted,path)}
for(const request of [{url:'https://portal.test/app.js',method:'GET',mode:'cors'},{url:'https://another.test/',method:'GET',mode:'navigate'},{url:'https://portal.test/',method:'POST',mode:'navigate'}]){let intercepted=false;events.fetch({request,respondWith:()=>intercepted=true});assert(!intercepted)}
let navigation;events.fetch({request:{url:'https://portal.test/',method:'GET',mode:'navigate'},respondWith:p=>navigation=p});assert.equal((await navigation).status,200);assert.equal(cached.size,1);
online=false;events.fetch({request:{url:'https://portal.test/?source=pwa',method:'GET',mode:'navigate'},respondWith:p=>navigation=p});assert.match(await (await navigation).text(),/Generic offline/);assert.equal(cached.size,1);
online=true;redirect=true;events.install({waitUntil:p=>pending=p});await assert.rejects(pending,/Offline page unavailable/);
console.log('OK: manifest, icon dimensions, MIME, service-worker lifecycle, generic offline fallback, API/auth/cross-origin exclusions, no navigation-data caching.');
