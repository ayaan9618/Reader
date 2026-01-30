const CACHE_NAME = 'reader-v1';
const urlsToCache = [
  '/',
  '/auth',
  '/home',
  '/queue',
  '/archive',
  '/highlights'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Handle share events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARE_URL') {
    // Forward share data to the app
    event.waitUntil(
      clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SHARE_URL',
            url: event.data.url,
            title: event.data.title,
            text: event.data.text
          });
        });
      })
    );
  }
});
