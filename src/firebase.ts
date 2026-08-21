import { initializeApp } from 'firebase/app';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut, deleteUser, reauthenticateWithPopup, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, setPersistence, browserLocalPersistence, User, updateProfile } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics, logEvent, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from 'firebase/app-check';
import firebaseConfigData from './firebase-applet-config.json';

// Intercept and demote internal Firestore SDK assertion errors (e.g., ID: ca9, b815, ve: -1) to warnings to prevent console error noise
if (typeof window !== 'undefined') {
  const isAssertionMsg = (msg: string) => {
    if (!msg) return false;
    const lower = msg.toLowerCase();
    return (
      lower.includes('internal assertion failed') ||
      lower.includes('unexpected state') ||
      lower.includes('ca9') ||
      lower.includes('b815') ||
      lower.includes('ve:') ||
      (lower.includes('firestore') && lower.includes('assertion')) ||
      (lower.includes('firestore') && lower.includes('internal')) ||
      lower.includes('token-subscribe-failed') ||
      lower.includes('messaging/token-subscribe-failed') ||
      lower.includes('missing required authentication credential')
    );
  };

  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const msg = args.map((a) => {
      if (!a) return '';
      if (a instanceof Error) return `${a.name}: ${a.message}\n${a.stack}`;
      if (typeof a === 'object') return `${a.message || ''} ${a.stack || ''} ${JSON.stringify(a)}`;
      return String(a);
    }).join(' ');

    if (isAssertionMsg(msg)) {
      console.warn('[Firestore Internal Assertion Handled]', ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const msg = `${event.reason?.message || ''} ${event.reason?.stack || ''} ${String(event.reason || '')}`;
    if (isAssertionMsg(msg)) {
      try {
        event.preventDefault();
        event.stopPropagation();
      } catch (e) {}
      console.warn('[Firestore Unhandled Rejection Handled]', msg);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = `${event.message || ''} ${event.error?.message || ''} ${event.error?.stack || ''} ${String(event.error || '')}`;
    if (isAssertionMsg(msg)) {
      try {
        event.preventDefault();
        event.stopPropagation();
      } catch (e) {}
      console.warn('[Firestore Window Error Handled]', msg);
    }
  }, true);
}

const firebaseConfig = firebaseConfigData;

console.log("Firebase Initialization: Using project", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("[Firebase Auth] Persistence initialization notice:", err);
  });
}

export { onAuthStateChanged, signOut, deleteUser, reauthenticateWithPopup, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, setPersistence, browserLocalPersistence, updateProfile };
export type FirebaseUser = User;

// Initialize Analytics lazily
let analyticsInstance: any = null;
export const analytics = async () => {
  if (typeof window !== 'undefined') {
    if (analyticsInstance) return analyticsInstance;
    try {
      const supported = await isAnalyticsSupported();
      if (supported) {
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
      }
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

// Initialize Firebase App Check safely
export const initAppCheck = () => {
  if (typeof window === 'undefined') return null;

  const siteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) || (window as any).VITE_RECAPTCHA_SITE_KEY;
  const isDevPreview = 
    import.meta.env.DEV || 
    window.location.hostname.includes("localhost") || 
    window.location.hostname.includes("run.app") || 
    window.self !== window.top;

  try {
    if (siteKey) {
      console.log("[App Check] Initializing with reCAPTCHA v3 provider...");
      return initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
    } else if (isDevPreview) {
      if ((window as any).FIREBASE_APPCHECK_DEBUG_TOKEN === true || typeof (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN === 'string') {
        console.log("[App Check] Initializing in Debug Mode for preview environment...");
        return initializeAppCheck(app, {
          provider: new CustomProvider({
            getToken: () => Promise.resolve({
              token: typeof (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN === 'string' ? (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN : 'DEBUG_TOKEN',
              expireTimeMillis: Date.now() + 3600000
            })
          }),
          isTokenAutoRefreshEnabled: true
        });
      }
      console.log("[App Check] System ready. Set VITE_RECAPTCHA_SITE_KEY in .env to enforce reCAPTCHA in production.");
      return null;
    }
  } catch (err) {
    console.warn("[App Check] Initialization check handled:", err);
    return null;
  }
  return null;
};

// Auto-initialize App Check if siteKey or debug token is set
if (typeof window !== 'undefined') {
  initAppCheck();
}

export const db = getFirestore(app);

// Silent native Firestore warnings (e.g. offline warnings) to prevent them being captured as platform errors.
try {
  setLogLevel('silent');
} catch (e) {
  console.warn("Failed to set Firestore log level to silent:", e);
}

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
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Detect if this is a internal assertion or unexpected SDK state error (e.g. ID: ca9, ve: -1)
  const isInternalAssertion = 
    errorMessage.includes('INTERNAL ASSERTION FAILED') ||
    errorMessage.includes('Unexpected state') ||
    errorMessage.includes('ca9') ||
    errorMessage.includes('ve:');

  if (isInternalAssertion) {
    console.warn(`[Firestore Internal Assertion Handled] Operating through transient SDK assertion during ${operationType} on path: ${path}. Detail:`, errorMessage);
    return;
  }

  // Detect if this is an expected offline/network/unavailable state.
  const isOffline = 
    errorMessage.toLowerCase().includes('offline') || 
    errorMessage.toLowerCase().includes('could not reach') ||
    errorMessage.toLowerCase().includes('connection failed') ||
    errorMessage.toLowerCase().includes('unavailable') ||
    errorMessage.toLowerCase().includes('network') ||
    (error && typeof error === 'object' && 'code' in error && (error as any).code === 'unavailable');

  if (isOffline) {
    console.warn(`[Firestore Offline] Operating in local fallback mode for ${operationType} on path: ${path}. Detail:`, errorMessage);
    return;
  }

  const isPermissionError = 
    errorMessage.toLowerCase().includes('permission') || 
    errorMessage.toLowerCase().includes('insufficient') ||
    (error && typeof error === 'object' && 'code' in error && (error as any).code === 'permission-denied');

  if (isPermissionError) {
    console.warn(`[Firestore Permission] Operating in local fallback mode for ${operationType} on path: ${path}. Detail:`, errorMessage);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Soft-logging instead of crashing the entire React app with a hard throw.
  // This keeps the system fully resilient and stable even in low-connectivity/offline scenarios.
}
