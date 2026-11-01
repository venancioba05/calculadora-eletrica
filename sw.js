const CACHE_NAME = 'calc-eletrica-v1';
const urlsToCache = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Instala o Service Worker e guarda os ficheiros em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta os pedidos de rede para carregar do telemóvel offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
