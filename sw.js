// Service Worker for asset caching.
// This file is a placeholder. For full offline functionality,
// you would implement caching strategies for assets (HTML, CSS, JS, images).
// Example events: 'install', 'activate', 'fetch'.

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  // Example of pre-caching essential assets:
  // event.waitUntil(
  //   caches.open('luxejewels-v1').then(cache => {
  //     return cache.addAll([
  //       '/',
  //       '/index.html',
  //       '/products.html',
  //       // Add other essential HTML pages
  //       '/assets/styles/main.css',
  //       '/scripts/app.js',
  //       '/scripts/ai-custom.js',
  //       '/scripts/pricing.js',
  //       // Add key images/icons including manifest icons
  //       '/assets/images/icon-192.png',
  //       '/assets/images/icon-512.png'
  //     ]);
  //   })
  // );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  // Example of cleaning up old caches:
  // event.waitUntil(
  //   caches.keys().then(cacheNames => {
  //     return Promise.all(
  //       cacheNames.map(cache => {
  //         if (cache !== 'luxejewels-v1') { // Replace 'luxejewels-v1' with your current cache name
  //           return caches.delete(cache);
  //         }
  //       })
  //     );
  //   })
  // );
  return self.clients.claim(); // Take control of all open clients without a page reload.
});

self.addEventListener('fetch', event => {
  // console.log('Service Worker: Fetching ', event.request.url);
  // Example: Cache-first strategy for navigation requests, network-first for others.
  // if (event.request.mode === 'navigate') {
  //   event.respondWith(
  //     caches.match(event.request).then(response => {
  //       return response || fetch(event.request);
  //     })
  //   );
  // } else {
  //   event.respondWith(
  //     caches.open('luxejewels-dynamic').then(cache => {
  //       return fetch(event.request).then(response => {
  //         cache.put(event.request, response.clone());
  //         return response;
  //       }).catch(() => {
  //         return caches.match(event.request);
  //       });
  //     })
  //   );
  // }
});
