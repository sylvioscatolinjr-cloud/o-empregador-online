import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {sha1Hex,leakCount,assertPasswordNotLeaked,LEAKED_PASSWORD_MESSAGE} from '../src/password-breach.mjs';

test('only the five-character SHA-1 prefix is sent and a listed suffix is detected',async()=>{
 const hash=await sha1Hex('password');assert.equal(hash,'5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8');
 const sent=[];const fetch=async(url,init)=>{sent.push({url,init});return new Response('0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:9545824\r\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:0');};
 assert.equal(await leakCount('password',{fetch}),9545824);
 assert.equal(sent.length,1);assert.equal(sent[0].url,'https://api.pwnedpasswords.com/range/5BAA6');assert.equal(sent[0].init.credentials,'omit');
 assert.equal(sent[0].init.body,undefined);assert.equal(sent[0].init.headers,undefined);assert.doesNotMatch(JSON.stringify(sent),/5BAA61|1E4C9B93F3F0682250B6CF8331B7EE68FD8/);
 await assert.rejects(assertPasswordNotLeaked('password',{fetch}),{message:LEAKED_PASSWORD_MESSAGE});
});

test('unlisted passwords pass and service failures never block the account flow',async()=>{
 assert.equal(await leakCount('a-unique-fictitious-password',{fetch:async()=>new Response('0018A45C4D1DEF81644B54AB7F969B88D65:1')}),0);
 assert.equal(await leakCount('password',{fetch:async()=>new Response('',{status:503})}),null);
 assert.equal(await leakCount('password',{fetch:async()=>{throw TypeError('offline');}}),null);
 assert.equal(await leakCount('password',{fetch:(url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted')))),timeoutMs:10}),null);
 await assertPasswordNotLeaked('password',{fetch:async()=>{throw TypeError('offline');}});
});

test('signup and password change run the check, and the CSP allows the range API',async()=>{
 const [app,vercel]=await Promise.all(['app/app.mjs','vercel.json'].map(f=>readFile(new URL('../'+f,import.meta.url),'utf8')));
 assert.match(app,/\(form\.getAttribute\?\.\('id'\)\|\|form\.id\)==='signup'\)\{[^}]*await assertPasswordNotLeaked\(values\.password\);await access\.signUp/);
 assert.match(app,/\(form\.getAttribute\?\.\('id'\)\|\|form\.id\)==='password'\)\{[^}]*await assertPasswordNotLeaked\(values\.password\);await access\.changePassword/);
 assert.match(vercel,/connect-src [^;"]*https:\/\/api\.pwnedpasswords\.com/);
});
