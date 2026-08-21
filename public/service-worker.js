const CACHE_NAME = 'nexora-pwa-v8.5.1';
const ASSETS_TO_CACHE = [
  '/',
  '/?screen=challenge',
  '/index.html',
  '/manifest.json',
  '/login-bg.jpg',
  '/login-emblem.jpg',
  '/icons/icon-192.png',
  '/icons/badge-72.png',
  '/mascots/blue-slim-notification.png',
  '/mascots/fire-slim-notification.png',
  '/mascots/earth-slim-notification.png',
  '/mascots/water-slim-notification.png',
  '/mascots/shield-slim-notification.png',
  '/mascots/lightning-slim-notification.png',
  '/nexora_mascot_new.png'
];

// Import Firebase compat scripts
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in SW
firebase.initializeApp({
  apiKey: "AIzaSyAQkPQqVyHhzw-nkBiLpsAZ_ZatNQsvYrU",
  authDomain: "nexora-bdd1d.firebaseapp.com",
  projectId: "nexora-bdd1d",
  storageBucket: "nexora-bdd1d.firebasestorage.app",
  messagingSenderId: "317478625149",
  appId: "1:317478625149:web:32cfc40cc8efecdc4dd0bc"
});

const messaging = firebase.messaging();

function buildNotificationOptions(payload) {
  const data = payload.data || {};
  const notification = payload.notification || {};

  const title = notification.title || data.title || 'Blue Slim is waiting for you';
  const body = notification.body || data.body || "You have 2 challenges left today. Let’s grow together.";
  const icon = data.icon || notification.icon || '/icons/icon-192.png';
  const badge = data.badge || notification.badge || '/icons/badge-72.png';
  const image = data.image || notification.image || '/mascots/blue-slim-notification.png';

  return {
    title,
    options: {
      body,
      icon,
      badge,
      image,
      vibrate: [100, 50, 100],
      tag: data.tag || 'daily-reminder',
      renotify: true,
      requireInteraction: false,
      data: {
        url: data.url || '/?screen=challenge',
        screen: 'challenge',
        ...(data || {})
      }
    }
  };
}

// Background FCM Messages
messaging.onBackgroundMessage((payload) => {
  console.log('[service-worker.js] Received background FCM message:', payload);
  const { title, options } = buildNotificationOptions(payload);
  self.registration.showNotification(title, options);
});

// Push notification listener
self.addEventListener('push', (event) => {
  console.log('[service-worker.js] Push event received');
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
  const { title, options } = buildNotificationOptions(payload);
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click: Open/focus Nexora PWA & navigate directly to Daily Challenges
self.addEventListener('notificationclick', (event) => {
  console.log('[service-worker.js] Notification click received');
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || '/?screen=challenge', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Look for existing open window
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
      // 2. Open new window if app was completely closed
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Service Worker: Caching assets');
      await Promise.all(
        ASSETS_TO_CACHE.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('Service Worker: Non-critical asset cache skip:', asset, err);
          })
        )
      );
    })
  );
});

// Activate event - clean up old caches & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('Service Worker: Clearing old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
    ])
  );
});

// Fetch event - Network-First strategy
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (
    event.request.method !== 'GET' ||
    url.includes('/api/') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('fcmregistrations.googleapis.com') ||
    url.includes('googleapis.com') ||
    url.includes('firebase') ||
    url.includes('cloudinary') ||
    url.includes('google-analytics') ||
    url.includes('googletagmanager')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, responseClone);
            }
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          const acceptHeader = event.request.headers.get('accept') || '';
          if (event.request.mode === 'navigate' || acceptHeader.includes('text/html')) {
            return caches.match('/');
          }
          return new Response('', { status: 404, statusText: 'Not Found' });
        });
      })
  );
});
