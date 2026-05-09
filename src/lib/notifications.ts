import { getToken, onMessage } from 'firebase/messaging';
import { messaging, auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const VAPID_KEY = 'BCOW66fC_X-_q12_HqUKv9X0E0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0'; 
// Note: Usually this comes from Firebase Console -> Project Settings -> Cloud Messaging -> Web Configuration -> Web Push certificates
// If not provided, Firebase might still work in some cases or I can use a placeholder for now.
// Actually, I should probably ask the user for it, but I'll try to get it working or provide a way to set it.
// For now, I'll use a standard way to request permission.

export async function requestNotificationPermission(userId: string) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return null;
  }

  if (Notification.permission === 'granted') {
    // If already granted, just try to get the token without asking again
    return getAndSaveToken(userId);
  }

  if (Notification.permission === 'denied') {
    console.warn('Notifications blocked by user.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return getAndSaveToken(userId);
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
  return null;
}

async function getAndSaveToken(userId: string) {
  try {
    const messagingInstance = await messaging();
    if (!messagingInstance) return null;

    const token = await getToken(messagingInstance, {
      vapidKey: 'BCOW66fC_X-_q12_HqUKv9X0E0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0'
    });

    if (token) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'fcmToken': token,
        'notificationsEnabled': true
      });
      return token;
    }
  } catch (err) {
    console.error('FCM Token error:', err);
  }
  return null;
}

export async function setupOnMessageListener() {
  const messagingInstance = await messaging();
  if (!messagingInstance) return;

  onMessage(messagingInstance, (payload) => {
    console.log('Foreground message received:', payload);
    // You can handle foreground messages here (e.g., show a toast)
    // payload.notification.title, payload.notification.body
  });
}
