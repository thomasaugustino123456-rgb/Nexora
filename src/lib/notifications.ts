import { getToken, onMessage } from 'firebase/messaging';
import { messaging, auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const VAPID_KEY = 'BF2tHGVbbJHc3wxlE98atQFPU1TRqX3shN0bhSsaNf-UxdDxgoj25zLhpttoeDsrjQ8l24cnysfF-eyzH3P7baw'; // Standard fallback

export async function requestNotificationPermission(userId: string) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return null;
  }

  if (Notification.permission === 'granted') {
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
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || VAPID_KEY
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
