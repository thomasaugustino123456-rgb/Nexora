import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics, logEvent, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { 
  getAuth, 
  onAuthStateChanged as fbOnAuthStateChanged, 
  signOut as fbSignOut, 
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword, 
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword, 
  signInWithPopup as fbSignInWithPopup, 
  sendPasswordResetEmail as fbSendPasswordResetEmail, 
  updatePassword as fbUpdatePassword, 
  linkWithCredential as fbLinkWithCredential, 
  reauthenticateWithPopup as fbReauthenticateWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  deleteUser as fbDeleteUser
} from 'firebase/auth';
import firebaseConfigData from './firebase-applet-config.json';

const firebaseConfig = {
  apiKey: "AIzaSyAcgcLykBAYF75aeN4kfwgAnwHZuWKk5_Q",
  authDomain: "nexora-2-26605.firebaseapp.com",
  projectId: "nexora-2-26605",
  storageBucket: "nexora-2-26605.firebasestorage.app",
  messagingSenderId: "10386801037",
  appId: "1:10386801037:web:7334f8fc655a2f89107dc4",
  measurementId: "G-TDN7Y2K7DG"
};

console.log("Firebase Initialization: Using project", firebaseConfig.projectId);
const databaseId = "(default)";
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

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  ...(isIframe ? { experimentalForceLongPolling: true } : {}),
}, databaseId === "(default)" ? undefined : databaseId);

export type FirebaseUser = any;

export const auth = getAuth(app);

export const onAuthStateChanged = (authInstance: any, callback: any) => {
  return fbOnAuthStateChanged(authInstance, (user) => {
    if (user) {
      localStorage.setItem("nexora_cached_user", user.uid);
    } else {
      localStorage.removeItem("nexora_cached_user");
    }
    callback(user);
  });
};

export const signOut = async (authInstance: any) => {
  localStorage.removeItem("nexora_cached_user");
  return fbSignOut(authInstance);
};

export const deleteUser = async (userInstance: any) => {
  return fbDeleteUser(userInstance);
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password?: string) => {
  return fbSignInWithEmailAndPassword(authInstance, email, password || "");
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password?: string) => {
  return fbCreateUserWithEmailAndPassword(authInstance, email, password || "");
};

export const signInWithPopup = async (authInstance: any, provider?: any) => {
  return fbSignInWithPopup(authInstance, provider);
};

export const sendPasswordResetEmail = async (authInstance: any, email: string) => {
  return fbSendPasswordResetEmail(authInstance, email);
};

export const updatePassword = async (userInstance: any, password: string) => {
  return fbUpdatePassword(userInstance, password);
};

export const linkWithCredential = async (userInstance: any, credential: any) => {
  return fbLinkWithCredential(userInstance, credential);
};

export const reauthenticateWithPopup = async (userInstance: any, provider: any) => {
  return fbReauthenticateWithPopup(userInstance, provider);
};

export { GoogleAuthProvider, EmailAuthProvider };

export const setPersistence = async () => {};
export const browserLocalPersistence = {};

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
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map(provider => ({
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
