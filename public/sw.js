/* Saturn service worker */
const VERSION = "saturn-v1";
const PRECACHE = [
  "/",
  "/calendar",
  "/settings",
  "/offline",
  "/manifest.webmanifest",
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
  "/pwa/maskable-512.png",
  "/pwa/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

const isNavigation = (request) => request.mode === "navigate";
const isStatic = (url) =>
  url.pathname.startsWith("/_next/static") ||
  url.pathname.startsWith("/pwa/") ||
  url.pathname === "/manifest.webmanifest";

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/");
          if (fallback) return fallback;
          return caches.match("/offline");
        })
    );
    return;
  }

  if (isStatic(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          fetch(request).then((fresh) => {
            if (fresh && fresh.ok) {
              caches.open(VERSION).then((cache) => cache.put(request, fresh));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then((fresh) => {
          const copy = fresh.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return fresh;
        }).catch(() => cached);
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(VERSION).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});