// ============================================================
// Marcatching Service Worker
// Strategi: Stale-While-Revalidate + Auto Update
// Setiap kali Vercel deploy baru, SW versi baru akan aktif
// otomatis tanpa perlu user menutup aplikasi.
// ============================================================

const CACHE_VERSION = 'v1';
const CACHE_NAME = `marcatching-${CACHE_VERSION}`;

// Aset statis yang di-pre-cache saat install
const PRECACHE_URLS = [
  '/',
  '/offline',
];

// ============================================================
// INSTALL: Pre-cache aset penting
// ============================================================
self.addEventListener('install', (event) => {
  // skipWaiting() memastikan SW baru langsung aktif
  // tanpa menunggu semua tab ditutup terlebih dahulu
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // Jangan gagalkan install jika pre-cache gagal
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
});

// ============================================================
// ACTIVATE: Bersihkan cache lama dari versi sebelumnya
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('marcatching-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Ambil kontrol semua client segera setelah aktif
      return self.clients.claim();
    })
  );
});

// ============================================================
// FETCH: Strategi Stale-While-Revalidate
// - Sajikan dari cache (cepat) sambil fetch update di background
// - Cocok untuk konten yang sering berubah (halaman, API)
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya tangani request GET dari origin yang sama
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Bypass cache untuk Next.js internals, API routes, dan Admin Dashboard
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.hostname.startsWith('inside.') ||
    url.pathname === '/sw.js'
  ) {
    return;
  }

  // Stale-While-Revalidate untuk halaman HTML & aset publik
  event.respondWith(staleWhileRevalidate(request));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch dari network di background (update cache)
  const networkFetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network gagal — tidak apa-apa jika ada cache
      return null;
    });

  // Kembalikan cache jika ada (cepat), sambil update di background
  if (cachedResponse) {
    return cachedResponse;
  }

  // Tidak ada cache — tunggu network
  const networkResponse = await networkFetchPromise;
  if (networkResponse) return networkResponse;

  // Fallback terakhir: halaman offline (jika ada)
  const offlineFallback = await cache.match('/offline');
  return offlineFallback || new Response('Offline', { status: 503 });
}

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
