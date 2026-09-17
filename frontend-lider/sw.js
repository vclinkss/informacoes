const CACHE_NAME = "painel-equipe-v1";
const ARQUIVOS_APP_SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.json"];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ARQUIVOS_APP_SHELL); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (chaves) {
      return Promise.all(
        chaves.filter(function (c) { return c !== CACHE_NAME; }).map(function (c) { return caches.delete(c); })
      );
    })
  );
  self.clients.claim();
});

// Só cuida do "app shell" (HTML/CSS/JS deste site). Chamadas pra API e CDNs externos
// passam direto pra rede, sem cache, pra nunca mostrar dados desatualizados.
self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    caches.match(req).then(function (cached) {
      const buscaNaRede = fetch(req)
        .then(function (resp) {
          if (resp && resp.status === 200) {
            const copia = resp.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copia); });
          }
          return resp;
        })
        .catch(function () { return cached; });
      return cached || buscaNaRede;
    })
  );
});
