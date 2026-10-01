// WI Shooting Hours offline support. Version is bumped by the build so phones pick up a new worker.
const CACHE='wish-'+'2026.10.01-1003';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request, u=new URL(req.url);
  if(req.method!=='GET'||u.origin!==location.origin)return;
  // Network first, always revalidating with the server (no stale browser cache); cached copy when offline.
  e.respondWith(fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(r=>{
    if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(u.search.includes('check=')?'./index.html':req,c));}
    return r;
  }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
});
