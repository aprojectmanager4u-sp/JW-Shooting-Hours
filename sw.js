// WI Shooting Hours offline support. The build bumps the version so phones pick up a new worker.
const CACHE='wish-'+'2026.11.19-1445', TILES='wish-tiles-v1', TILE_MAX=5000;
// Map images: USGS base maps and Wisconsin DNR public land. Property lines are not kept offline.
const isTile=u=>(u.hostname==='basemap.nationalmap.gov'&&u.pathname.indexOf('/tile/')>0)||(u.hostname==='dnrmaps.wi.gov'&&/\/export$/.test(u.pathname));
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const corsOK={}; let puts=0, trimming=false;
async function trim(c){ if(trimming) return; trimming=true; try{ const ks=await c.keys(); if(ks.length>TILE_MAX) for(const k of ks.slice(0,ks.length-TILE_MAX)) await c.delete(k); } catch(e){} trimming=false; }
async function tile(req){
  // Map images you've viewed are kept (up to about 5,000) so those areas still show without a signal.
  const c=await caches.open(TILES); const hit=await c.match(req.url); if(hit) return hit;
  const url=req.url.split('#')[0], host=new URL(url).hostname;
  // Give up on a stalled request after 20 seconds and try once more, so a slow server can't leave a blank square.
  const get=async(mode,ms)=>{ const ac=new AbortController(), t=setTimeout(()=>ac.abort(),ms); try{ return await fetch(url,{mode,credentials:'omit',signal:ac.signal}); } finally{ clearTimeout(t); } };
  for(let i=0;i<2;i++){
    if(corsOK[host]!==false){
      try{
        const r=await get('cors',20000);
        if(r.ok && r.status===200){ corsOK[host]=true; c.put(url,r.clone()); if(++puts%50===0) trim(c); return r; }
        if(r.status>=500||r.status===429){ if(i===0){ await new Promise(z=>setTimeout(z,800)); continue; } }
        return r;
      }catch(e){
        if(!self.navigator.onLine) return Response.error();
        // Only stop asking for shareable (CORS) images when the plain request works and the CORS one doesn't.
        if(corsOK[host]===undefined && e.name!=='AbortError'){ try{ const o=await get('no-cors',20000); corsOK[host]=false; return o; }catch(e2){} }
        continue;
      }
    }
    try{ return await get('no-cors',20000); }catch(e){ if(i) return Response.error(); }
  }
  return Response.error();
}
self.addEventListener('fetch',e=>{
  const req=e.request, u=new URL(req.url);
  if(req.method!=='GET') return;
  if(isTile(u)){ e.respondWith(tile(req)); return; }
  if(u.origin!==location.origin) return;
  const key=u.origin+u.pathname;
  // App files: always ask the server first; use the saved copy only when offline.
  e.respondWith(fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(r=>{
    if(r.ok && !u.search){ const c=r.clone(); caches.open(CACHE).then(x=>x.put(key,c)); }
    return r;
  }).catch(()=>caches.match(key).then(r=>r||caches.match('./index.html',{ignoreSearch:true}))));
});
