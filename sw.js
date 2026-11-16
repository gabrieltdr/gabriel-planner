// Service worker do Gabriel Planner: guarda o app no aparelho pra abrir sem internet.
// Ao publicar uma mudança no app, aumente o número da versão abaixo.
const VERSAO = "planner-v1";
const ARQUIVOS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSAO).then(function(c){ return c.addAll(ARQUIVOS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== VERSAO && k.indexOf("planner-") === 0; }).map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.clients.claim(); })
  );
});

// Abre do cache primeiro (rápido e offline) e atualiza o cache em segundo plano.
// Inclui as fontes do Google, que ficam guardadas na primeira vez que o app abre com internet.
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.open(VERSAO).then(function(cache){
      return cache.match(e.request, { ignoreSearch:true }).then(function(hit){
        var rede = fetch(e.request).then(function(resp){
          if(resp && (resp.ok || resp.type === "opaque")) cache.put(e.request, resp.clone());
          return resp;
        }).catch(function(){ return hit; });
        return hit || rede;
      });
    })
  );
});
