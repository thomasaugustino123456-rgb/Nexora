import { getToken, onMessage } from 'firebase/messaging';
import { messaging, auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const VAPID_KEY = 'BCOW66fC_X-_q12_HqUKv9X0E0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0kK0'; 
// Note: Usually this comes from Firebase Console -> Project Settings -> Cloud Messaging -> Web Configuration -> Web Push certificates
// If not provided, Firebase might still work in some cases or I can use a placeholder for now.
// Actually, I should probably ask the user for it, but I'll try to get it working or provide a way to set it.
// For now, I'll use a standard way to request permission.

export async function requestNotificationPermission(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messagingInstance = await messaging();
      if (!messagingInstance) return null;

      // Get FCM token
      const token = await getToken(messagingInstance, {
        vapidKey: undefined // Optional if not using web push certs yet, but recommended
      });

      if (token) {
        console.log('FCM Token:', token);
        // Save token to user settings in Firestore
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          'settings.fcmToken': token,
          'settings.notificationsEnabled': true
        });
        return token;
      }
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
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
