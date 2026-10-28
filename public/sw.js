// Offline support: the app shell and every file it has loaded are cached, so the khata opens
// with no internet. Pages try the network first (to pick up new versions); files are cache-first
// because their names change with every build. Speech recognition still needs internet.

const CACHE = 'bkh-v1';
const SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

function cacheCopy(request, response) {
  if (response.ok || response.type === 'opaque') {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cacheCopy('/', response))
        .catch(() => caches.match('/')),
    );
    return;
  }

  const cacheable =
    url.origin === self.location.origin ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';
  if (!cacheable) return;
  event.respondWith(
    caches
      .match(request)
      .then((hit) => hit || fetch(request).then((res) => cacheCopy(request, res))),
  );
});
