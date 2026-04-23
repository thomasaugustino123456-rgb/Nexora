importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDzMyKhCPNckxUKzlTzKsSrfzUF7blGJkk",
  projectId: "gen-lang-client-0115801809",
  messagingSenderId: "546238758641",
  appId: "1:546238758641:web:366fb9e770c9a240787350"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title || 'Nexora Alert';
  const notificationOptions = {
    body: payload.notification.body || 'Your plant needs you!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
