const CACHE="transitkita-offline-v1";
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(["/offline.html","/transitkita.svg"])).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("transitkita-offline-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin||req.mode!=="navigate")return;
 event.respondWith(fetch(req).catch(async()=>await caches.match("/offline.html")||new Response("TransitKita sedang offline.",{headers:{"Content-Type":"text/plain; charset=utf-8"}})));
});
