/* Wealth Mastery OS — service worker (offline app shell cache).
   Network-first for navigations, cache-first for static assets. */
const CACHE = "wms-v1";
const APP_SHELL = ["/", "/dashboard", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) return; // never cache API/auth
  if (request.mode === "navigate") {
    e.respondWith(fetch(request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); return res; }).catch(() => caches.match(request).then((r) => r || caches.match("/dashboard"))));
    return;
  }
  e.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); return res; }).catch(() => cached)));
});
