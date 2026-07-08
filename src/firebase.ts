import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut, deleteUser, reauthenticateWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence, User } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics, logEvent, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import firebaseConfigData from './firebase-applet-config.json';

const firebaseConfig = firebaseConfigData;

console.log("Firebase Initialization: Using project", firebaseConfig.projectId);
const databaseId = "(default)";
console.log("Firestore Initialization: Using database", databaseId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { onAuthStateChanged, signOut, deleteUser, reauthenticateWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence };
export type FirebaseUser = User;

// Initialize Analytics lazily
export const analytics = async () => {
  if (typeof window !== 'undefined') {
    // Disable Firebase Analytics in development, preview, or sandboxed iframe environments
    // to prevent IndexedDB Transaction QuotaExceeded errors inside iframe sandboxes.
    const isDevPreview = 
      import.meta.env.DEV || 
      window.location.hostname.includes("localhost") || 
      window.location.hostname.includes("run.app") || 
      window.self !== window.top;

    if (isDevPreview) {
      console.log("[Analytics] Disabled in dev/preview iframe sandbox to prevent quota issues.");
      return null;
    }

    try {
      const supported = await isAnalyticsSupported();
      return supported ? getAnalytics(app) : null;
    } catch (e) {
      console.warn("Firebase Analytics support check failed:", e);
      return null;
    }
  }
  return null;
};

// Helper for easy event logging
export const trackEvent = async (eventName: string, params?: any) => {
  try {
    const instance = await analytics();
    if (instance) {
      logEvent(instance, eventName, params);
      console.log(`[Analytics] Event tracked: ${eventName}`, params);
    }
  } catch (err) {
    console.error(`[Analytics] Failed to track ${eventName}:`, err);
  }
};

const isIframe = typeof window !== 'undefined' && window.self !== window.top;

export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  ...(isIframe ? { experimentalForceLongPolling: true } : {}),
}, databaseId === "(default)" ? undefined : databaseId);

// Messaging is only supported in some browsers
export const messaging = async () => {
  try {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
  } catch (e) {
    return null;
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Soft-logging instead of crashing the entire React app with a hard throw.
  // This keeps the system fully resilient and stable even in low-connectivity/offline scenarios.
}
