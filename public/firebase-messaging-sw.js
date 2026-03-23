// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you're not using Firebase Hosting, you can import them from a CDN:
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDzMyKhCPNckxUKzlTzKsSrfzUF7blGJkk",
  authDomain: "gen-lang-client-0115801809.firebaseapp.com",
  projectId: "gen-lang-client-0115801809",
  storageBucket: "gen-lang-client-0115801809.firebasestorage.app",
  messagingSenderId: "546238758641",
  appId: "1:546238758641:web:366fb9e770c9a240787350"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'Nexora 🔥';
  const notificationOptions = {
    body: payload.notification.body || 'Hey 👋 Ready for today’s challenge?',
    icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
    badge: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
