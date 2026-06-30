import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics, logEvent, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import firebaseConfigData from './firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId || "G-HCHSRFZY2E", // User provided measurementId
};

console.log("Firebase Initialization: Using project", firebaseConfigData.projectId);
const databaseId = firebaseConfigData.firestoreDatabaseId || "(default)";
console.log("Firestore Initialization: Using database", databaseId);

const app = initializeApp(firebaseConfig);

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

export const db = initializeFirestore(app, isIframe ? {
  experimentalForceLongPolling: true,
} : {}, databaseId === "(default)" ? undefined : databaseId);

// Persistence is key for offline/slow networks/multiple preview windows
if (typeof window !== 'undefined') {
  try {
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore Multi-Tab Persistence: Multiple tabs open, state synchronization active.");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore Multi-Tab Persistence: The current browser doesn't support all of the features required to enable active synchronization.");
      } else {
        console.warn("Firestore Multi-Tab Persistence failed safely:", err);
      }
    });
  } catch (err) {
    console.warn("Caught synchronous exception while enabling Firestore Multi-Tab Persistence:", err);
  }
}

export const auth = getAuth(app);

// Messaging is only supported in some browsers
export const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
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
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Soft-logging instead of crashing the entire React app with a hard throw.
  // This keeps the system fully resilient and stable even in low-connectivity/offline scenarios.
}
