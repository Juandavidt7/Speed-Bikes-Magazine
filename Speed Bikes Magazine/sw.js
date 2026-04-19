const CACHE_NAME = 'speed-bikes-v5';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './js/app.js',
  './js/controllers/AppController.js',
  './js/models/ForoModel.js',
  './js/models/MotoModel.js',
  './js/models/UserModel.js',
  './js/views/ForoView.js',
  './js/views/NavView.js',
  './js/views/RevistaView.js',
  './js/views/LoginView.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Forzar activación del nuevo Service Worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache v5');
        return cache.addAll(urlsToCache);
      })
  );
});

// Estrategia Network-First: primero intenta la red, si falla usa el caché.
// Las peticiones a la API (/api/) NUNCA se cachean — siempre van directo al servidor.
self.addEventListener('fetch', event => {
  // Excluir peticiones API del caché (siempre requieren datos frescos del servidor)
  if (event.request.url.includes('/api/')) {
    return; // Dejar que el navegador maneje la petición normalmente
  }

  // Solo cachear peticiones GET de archivos estáticos
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red responde, actualizamos el caché con la respuesta fresca
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si la red falla (offline), usamos el caché
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          console.log('Sin conexión y sin caché disponible para:', event.request.url);
        });
      })
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
