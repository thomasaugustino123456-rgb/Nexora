// NEXORA OFFLINE MODE V2 — SERVICE WORKER
// Architecture: Versioned Application Shell Cache + Safe Static Assets + FCM Messaging

const CACHE_VERSION = 'nexora-offline-v2.0.0';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const VALID_CACHES = [SHELL_CACHE, ASSET_CACHE];

// Pre-cached critical application shell assets
const CRITICAL_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/login-bg.jpg',
  '/login-emblem.jpg',
  '/nexora_mascot_new.png',
  '/mascot.png',
  '/icon-192.png',
  '/icons/icon-192.png',
  '/icons/badge-72.png',
  '/mascots/blue-slim-notification.png',
  '/mascots/fire-slim-notification.png',
  '/mascots/earth-slim-notification.png',
  '/mascots/water-slim-notification.png',
  '/mascots/shield-slim-notification.png',
  '/mascots/lightning-slim-notification.png'
];

// Offline First-Visit Fallback HTML when device has never loaded the app online before
const NO_CACHE_OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nexora - Offline</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0A1733;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 32px 24px;
      max-width: 360px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      margin: 0 0 8px 0;
      color: #FFFFFF;
    }
    p {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    button {
      background: #10B981;
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }
    button:hover {
      background: #059669;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🌱</div>
    <h1>Internet Connection Required</h1>
    <p>Please connect to the internet to load Nexora for the first time. Once loaded, you can access your saved shell offline!</p>
    <button onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>`;

// Import Firebase compat scripts for FCM background notifications
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyAQkPQqVyHhzw-nkBiLpsAZ_ZatNQsvYrU",
    authDomain: "nexora-bdd1d.firebaseapp.com",
    projectId: "nexora-bdd1d",
    storageBucket: "nexora-bdd1d.firebasestorage.app",
    messagingSenderId: "317478625149",
    appId: "1:317478625149:web:32cfc40cc8efecdc4dd0bc"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[Offline Mode V2 SW] Received background FCM message:', payload);
    const data = payload.data || {};
    const notification = payload.notification || {};
    const title = notification.title || data.title || 'Nexora Reminder';
    const options = {
      body: notification.body || data.body || 'Your daily protocol awaits!',
      icon: data.icon || notification.icon || '/icons/icon-192.png',
      badge: data.badge || notification.badge || '/icons/badge-72.png',
      image: data.image || notification.image || '/mascots/blue-slim-notification.png',
      vibrate: [100, 50, 100],
      tag: data.tag || 'daily-reminder',
      renotify: true,
      data: {
        url: data.url || '/?screen=challenge',
        screen: 'challenge',
        ...(data || {})
      }
    };
    self.registration.showNotification(title, options);
  });
} catch (e) {
  console.warn('[Offline Mode V2 SW] FCM initialization skipped or offline:', e);
}

// Push notification listener
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (err) {
    if (event.data) {
      payload = { notification: { body: event.data.text() } };
    }
  }
  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = notification.title || data.title || 'Nexora Notification';
  const options = {
    body: notification.body || data.body || 'Stay on track with your habits.',
    icon: data.icon || notification.icon || '/icons/icon-192.png',
    badge: data.badge || notification.badge || '/icons/badge-72.png',
    data: {
      url: data.url || '/?screen=challenge',
      screen: 'challenge'
    }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click: Focus open tab or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/?screen=challenge', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            client.postMessage({
              type: 'NAVIGATE_SCREEN',
              screen: 'challenge'
            });
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Install Event: Pre-cache current application shell assets into SHELL_CACHE
self.addEventListener('install', (event) => {
  console.log('[Offline Mode V2 SW] Installing new service worker version:', CACHE_VERSION);
  self.skipWaiting();

  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      console.log('[Offline Mode V2 SW] Pre-caching critical application shell');
      await Promise.all(
        CRITICAL_SHELL_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[Offline Mode V2 SW] Non-critical shell asset skipped:', asset, err);
          })
        )
      );
    })
  );
});

// Activate Event: Purge ALL obsolete/legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[Offline Mode V2 SW] Activating new service worker version:', CACHE_VERSION);

  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!VALID_CACHES.includes(cacheName)) {
              console.log('[Offline Mode V2 SW] Purging obsolete cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ]).then(() => {
      // Notify all active clients that Offline Mode V2 is active
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'OFFLINE_V2_ACTIVATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// Fetch Event: Intelligent multi-tier caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // 1. Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. Network-Only for dynamic APIs, Firebase, Firestore, OAuth, Analytics, Cloudinary
  const isNetworkOnly =
    url.includes('/api/') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com') ||
    url.includes('fcmregistrations.googleapis.com') ||
    url.includes('googleapis.com') ||
    url.includes('firebase') ||
    url.includes('cloudinary.com') ||
    url.includes('google-analytics.com') ||
    url.includes('googletagmanager.com') ||
    url.includes('accounts.google.com');

  if (isNetworkOnly) {
    return;
  }

  // 3. Navigation Requests (HTML / App Shell): Network-First with Cache Fallback
  const isNavigation = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(SHELL_CACHE).then((cache) => {
              cache.put('/index.html', responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Attempt to return cached application shell
          const cachedShell = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cachedShell) {
            return cachedShell;
          }
          // If never cached before (first visit offline), show clean friendly notice
          return new Response(NO_CACHE_OFFLINE_HTML, {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 4. Static Assets (JS Chunks, CSS, Images, Fonts): Stale-While-Revalidate / Cache-First
  const isStaticAsset =
    url.includes('/assets/') ||
    url.includes('/icons/') ||
    url.includes('/mascots/') ||
    url.endsWith('.js') ||
    url.endsWith('.css') ||
    url.endsWith('.png') ||
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.svg') ||
    url.endsWith('.webp') ||
    url.endsWith('.woff2') ||
    url.endsWith('.json');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Fetch fresh copy in the background to keep cache up to date
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(ASSET_CACHE).then((cache) => {
                if (url.startsWith('http')) {
                  cache.put(request, responseClone);
                }
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failure is expected when offline; cached response handles it
            return null;
          });

        // Return cached version immediately if present, otherwise await the network response
        return cachedResponse || fetchPromise.then((res) => res || new Response('', { status: 404, statusText: 'Not Found' }));
      })
    );
    return;
  }

  // 5. Default: Network-First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(ASSET_CACHE).then((cache) => {
            if (url.startsWith('http')) {
              cache.put(request, responseClone);
            }
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
