const CACHE_NAME = 'yj-speaks-v9';
const APP_SHELL = [
  './', './index.html', './word-garden.html', './diary-reflections.html',
  './reading-material.html', './attention-blooms.html', './real-confidence.html', './conscious-subconscious.html', './what-is-meant.html', './email/', './manifest.webmanifest', './app-icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key !== CACHE_NAME)
    .map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Bym is a live application with authentication and frequently changing
  // discovery content. Let its own Next.js deployment control all caching so
  // sessions, new posts, and editorial ordering never come from this static
  // site's offline cache.
  if (url.origin === self.location.origin && url.pathname.startsWith('/bym')) return;

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)
    .then(response => {
      const copy = response.clone();
      if (url.origin === self.location.origin) {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    })
    .catch(() => caches.match('./index.html'))));
});
