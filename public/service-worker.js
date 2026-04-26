const CACHE_NAME = 'nexora-v1.3'; // Bumping version for fresh install with background check
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
];

// Import Firebase compat scripts (required for FCM in SW)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in SW
// Note: We use the same config as the app
firebase.initializeApp({
  apiKey: "AIzaSyDzMyKhCPNckxUKzlTzKsSrfzUF7blGJkk",
  authDomain: "gen-lang-client-0115801809.firebaseapp.com",
  projectId: "gen-lang-client-0115801809",
  storageBucket: "gen-lang-client-0115801809.firebasestorage.app",
  messagingSenderId: "546238758641",
  appId: "1:546238758641:web:366fb9e770c9a240787350"
});

const messaging = firebase.messaging();

// Background FCM Messages
messaging.onBackgroundMessage((payload) => {
  console.log('[service-worker.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'Nexora 🔥';
  const notificationOptions = {
    body: payload.notification.body || 'Ready for your next win, bro?',
    icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
    badge: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
    data: payload.data,
    vibrate: [200, 100, 200],
    tag: 'nexora-alert' // Groups notifications
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Install event - caching assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - cleaning up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - network-first for navigation, cache-first for others
self.addEventListener('fetch', (event) => {
  // EXCLUDE API calls from service worker interception
  if (event.request.url.includes('/api/')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Optionally cache new assets on the fly
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http') && event.request.method === 'GET') {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      }).catch(() => {
        // Fallback if both cache and network fail
        return caches.match('/');
      });
    })
  );
});

// Handle background notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Push notification listener (placeholder)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Hey 👋 Ready for today’s challenge?',
    icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
    badge: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nexora 🔥', options)
  );
});
