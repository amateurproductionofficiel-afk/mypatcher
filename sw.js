const CACHE_NAME = 'patcher-cache-v1';

// Les fichiers de l'Auto-Patcher à mettre en cache
const URLS_TO_CACHE = [
  './patcher.html',
  './manifest.json',
  './sw.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activation immédiate
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie : Réseau en priorité, puis Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Met à jour le cache dynamiquement
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Mode hors-ligne
        return caches.match(event.request);
      })
  );
});
