const CACHE_NAME = 'nexora-v6.0.0'; // Updated to ensure fresh cache bust with new icons and premium flow
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/nexora-mascot.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js'
];

// Import Firebase compat scripts (required for FCM in SW)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in SW
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
    icon: '/nexora-mascot.png',
    badge: '/nexora-mascot.png',
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
    icon: '/nexora-mascot.png',
    badge: '/nexora-mascot.png',
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
