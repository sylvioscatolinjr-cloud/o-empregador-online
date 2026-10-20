/* Cache only the generic offline page. Never retain navigation, API or account data. */
const CACHE='empregador-offline-v1';
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fetch('/offline.html',{cache:'reload',credentials:'same-origin'});
 if(!response.ok||response.redirected||!response.headers.get('Content-Type')?.includes('text/html'))throw Error('Offline page unavailable');
 const cache=await caches.open(CACHE);await cache.put('/offline.html',response);
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('empregador-offline-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||event.request.mode!=='navigate'||url.pathname.startsWith('/api/')||/\/(signin|signout|auth|callback|logout)/i.test(url.pathname))return;
 event.respondWith(fetch(event.request).catch(async()=>{
  const cached=await caches.match('/offline.html');return cached||new Response('Sem conexão. Conecte-se e tente novamente.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 }));
});
