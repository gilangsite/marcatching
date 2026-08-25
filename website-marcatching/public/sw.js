// Marcatching service worker.
//
// Next.js gives every CSS/JS build a content-hashed URL. Caching an HTML
// document independently from those assets can therefore serve old HTML that
// points at chunks which no longer exist after a Vercel deployment. That was
// the source of the occasional unstyled first visit.
//
// Keep the worker for push notifications and update signalling, but let the
// browser/Vercel handle every navigation and static asset directly.

const CACHE_VERSION = 'v2-network-only';
const LEGACY_CACHE_PREFIX = 'marcatching-';

self.addEventListener('install', () => {
  // Activate this repair immediately so legacy page caches are removed.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith(LEGACY_CACHE_PREFIX))
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Take over existing tabs so the old fetch handler stops serving pages.
      return self.clients.claim();
    })
  );
});

// ============================================================
// MESSAGE: Terima perintah dari client (force update, dll.)
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: CACHE_VERSION });
  }
});

// ============================================================
// PUSH: Handler notifikasi push (opsional, siap dipakai)
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Marcatching', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || 'https://marcatching.com')
  );
});
