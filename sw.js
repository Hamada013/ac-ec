/* Offline shell. Answers live in the browser's own storage and never enter this cache. */
importScripts('assets/release.js');
const {version,files}=self.ACEC_RELEASE,PREFIX='ac-ec:'+new URL(self.registration.scope).pathname+':',CACHE=PREFIX+version;
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(files.map(f=>new Request(f,{cache:'reload'})));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==location.origin||!url.href.startsWith(self.registration.scope)||url.pathname.includes('/api/'))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),key=event.request.mode==='navigate'?new URL('index.html',self.registration.scope).href:url.origin+url.pathname;return await cache.match(key)||fetch(event.request);})());});
