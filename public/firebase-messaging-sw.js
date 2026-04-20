// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
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
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Default icon
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
