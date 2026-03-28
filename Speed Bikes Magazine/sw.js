const CACHE_NAME = 'speed-bikes-v3';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './js/app.js',
  './js/controllers/AppController.js',
  './js/models/ForoModel.js',
  './js/models/MotoModel.js',
  './js/views/ForoView.js',
  './js/views/NavView.js',
  './js/views/RevistaView.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Forzar activación del nuevo Service Worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache v3');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // Fallback for offline mode, ideally an offline page
            console.log('You are offline and no cache is available.');
        });
      }
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Tomar control de clientes inmediatamente
  );
});
