import { useState, useEffect, useRef, useCallback } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  getDocFromCache,
  getDocsFromCache,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserSettings, UserStats, DailyProgress } from "../types";
import { GardenState, createInitialGardenState } from "../types/garden";

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a && b && typeof a === "object" && typeof b === "object") {
    if (a.constructor !== b.constructor) return false;
    if (Array.isArray(a)) {
      const length = a.length;
      if (length !== b.length) return false;
      for (let i = length; i-- !== 0;) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (let i = keys.length; i-- !== 0;) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    }
    for (let i = keys.length; i-- !== 0;) {
      const key = keys[i];
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return a !== a && b !== b;
}

const today = new Date().toISOString().split("T")[0];

export function useNexoraData(
  DEFAULT_SETTINGS: UserSettings,
  DEFAULT_STATS: UserStats,
  showToast: (msg: string, type: "success" | "error" | "info") => void,
) {
  // Load cached settings/stats immediately if available
  const getCachedJson = (key: string, defaultValue: any) => {
    try {
      const val = localStorage.getItem(key);
      if (!val || val === "undefined") return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`Failed to parse cache for ${key}:`, e);
      return defaultValue;
    }
  };

  const cachedOnboarding =
    localStorage.getItem("nexora_onboarding_completed") === "true";
  const cachedUserId = localStorage.getItem("nexora_cached_user") || null;

  const [user, setUser] = useState<FirebaseUser | null>(
    cachedUserId ? ({ uid: cachedUserId } as FirebaseUser) : null,
  );

  // If the user has completed onboarding and we have a cached session, we immediately skip the splash loader.
  // This provides instant 100ms startup and bulletproof offline support.
  // Otherwise, we keep the splash loader active (loading = true) until we resolve user state from Firestore,
  // preventing user onboarding flashes/redirection glitches on slow connections.
  const [loading, setLoading] = useState(cachedUserId ? (cachedOnboarding ? false : true) : false);
  const [isDataReady, setIsDataReady] = useState(cachedUserId ? (cachedOnboarding ? true : false) : false);

  const cachedSettings = getCachedJson("nexora_settings", DEFAULT_SETTINGS);
  const cachedStats = getCachedJson("nexora_stats", DEFAULT_STATS);
  const cachedProgress = getCachedJson("nexora_progress", null);
  
  const rawCachedGarden = getCachedJson("nexora_garden", createInitialGardenState());
  const initialGardenDefault = createInitialGardenState();
  const cachedGarden = {
    ...initialGardenDefault,
    ...rawCachedGarden,
    mascotState: {
      ...initialGardenDefault.mascotState,
      ...(rawCachedGarden?.mascotState || {}),
    },
    inventory: {
      ...initialGardenDefault.inventory,
      ...(rawCachedGarden?.inventory || {}),
    },
    tiles: rawCachedGarden?.tiles || initialGardenDefault.tiles,
  };

  const currentUpdateSource = useRef<string>("Default Values");
  const onboardingReasonRef = useRef<string>("Default Initialization");

  const [settings, rawSetSettings] = useState<UserSettings>(cachedSettings);
  const [stats, rawSetStats] = useState<UserStats>(cachedStats);
  const [dailyProgress, rawSetDailyProgress] = useState<DailyProgress>(
    cachedProgress?.date === today
      ? cachedProgress
      : {
          date: today,
          completed: false,
          pushupsDone: false,
          waterDrank: 0,
          breathingDone: false,
          drawingDone: false,
          footballDone: false,
          bubblesDone: false,
          completionsCount: 0,
          customPlanCompleted: false,
        },
  );
  const [gardenState, rawSetGardenState] = useState<GardenState>(cachedGarden);

  const [needsOnboarding, rawSetNeedsOnboarding] = useState(!cachedOnboarding);

  const setSettings = useCallback((update: any) => {
    rawSetSettings((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setSettings] Source: ${currentUpdateSource.current}`);
      console.log(`[STATE UPDATE INTERCEPT] Old Settings:`, JSON.stringify(prev));
      console.log(`[STATE UPDATE INTERCEPT] New Settings:`, JSON.stringify(next));
      return next;
    });
  }, []);

  const setStats = useCallback((update: any) => {
    rawSetStats((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setStats] Source: ${currentUpdateSource.current}`);
      console.log(`[STATE UPDATE INTERCEPT] Old Stats:`, JSON.stringify(prev));
      console.log(`[STATE UPDATE INTERCEPT] New Stats:`, JSON.stringify(next));
      return next;
    });
  }, []);

  const setDailyProgress = useCallback((update: any) => {
    rawSetDailyProgress((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setDailyProgress] Source: ${currentUpdateSource.current}`);
      console.log(`[STATE UPDATE INTERCEPT] Old DailyProgress:`, JSON.stringify(prev));
      console.log(`[STATE UPDATE INTERCEPT] New DailyProgress:`, JSON.stringify(next));
      return next;
    });
  }, []);

  const setGardenState = useCallback((update: any) => {
    rawSetGardenState((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setGardenState] Source: ${currentUpdateSource.current}`);
      console.log(`[STATE UPDATE INTERCEPT] Old GardenState:`, JSON.stringify(prev));
      console.log(`[STATE UPDATE INTERCEPT] New GardenState:`, JSON.stringify(next));
      return next;
    });
  }, []);

  const setNeedsOnboarding = useCallback((update: any) => {
    rawSetNeedsOnboarding((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      console.log(`[STATE UPDATE INTERCEPT] [setNeedsOnboarding] Transition: ${prev} -> ${next}. Reason: ${onboardingReasonRef.current}`);
      return next;
    });
  }, []);

  const [authLoading, setAuthLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const dataLoadedFromFirestore = useRef(false);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const quotaExceededRef = useRef(false);
  const lastSyncedRef = useRef<any>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isStateLoadedRef = useRef(false);

  const setIsStateLoaded = (val: boolean, reason: string) => {
    isStateLoadedRef.current = val;
    console.log(`[STATE LOADED REF CHANGE] isStateLoadedRef.current set to ${val}. Reason: ${reason}`);
  };

  const hasMatchedHydratedStateRef = useRef(false);
  const hydratedStateRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setAuthLoading(false);
      console.log(`[PERSISTENCE AUDIT] AUTH RESOLVED - User UID: ${currentUser?.uid || "null"}, Email: ${currentUser?.email || "null"}`);
      const prevUserId = localStorage.getItem("nexora_cached_user");

      setIsStateLoaded(false, "Auth state listener triggered");
      hasMatchedHydratedStateRef.current = false;
      hydratedStateRef.current = null;

      if (currentUser) {
        console.log(`[PERSISTENCE AUDIT] AUTH UID: ${currentUser.uid}`);
        console.log(`[PERSISTENCE AUDIT] FIRESTORE DOCUMENT PATH BEING LOADED: users/${currentUser.uid}`);
        const hasCache = localStorage.getItem("nexora_onboarding_completed") === "true";
        if (prevUserId !== currentUser.uid || !hasCache) {
          // New / different user, or cache cleared (e.g. after explicit logout).
          // Force safe transition loading state before fetching Firestore settings
          // and prevent flashing onboarding screens or wiping user data!
          setLoading(true);
          setIsDataReady(false);
          setNeedsOnboarding(false);
        }

        if (prevUserId && prevUserId !== currentUser.uid) {
          console.log("Hooks: Different user detected, resetting caches in-memory and locally.");
          // Clear sync blockers and caches first
          dataLoadedFromFirestore.current = false;
          lastSyncedRef.current = null;
          lastLoadedUserIdRef.current = null;
          setIsStateLoaded(false, "Different user logged in, clearing cached state");
          hasMatchedHydratedStateRef.current = false;
          hydratedStateRef.current = null;
          setIsDataReady(false);
          setLoading(true);

          Object.keys(localStorage).forEach((key) => {
            if (
              (key.startsWith("nexora_") && key !== "nexora_cached_user") ||
              key.startsWith("hydration_") ||
              key === "admin_read_feedback_ids"
            ) {
               localStorage.removeItem(key);
            }
          });
          setSettings(DEFAULT_SETTINGS);
          setStats(DEFAULT_STATS);
          setDailyProgress({
            date: today,
            completed: false,
            pushupsDone: false,
            waterDrank: 0,
            breathingDone: false,
            drawingDone: false,
            footballDone: false,
            bubblesDone: false,
            completionsCount: 0,
            nextRestorationTime: null,
          });
          setGardenState(createInitialGardenState());
          setNeedsOnboarding(false);
        }
        localStorage.setItem("nexora_cached_user", currentUser.uid);
        setUser(currentUser);
      } else {
        // Only clear caches if they actually had an active user before (explicit sign out).
        // This prevents erasing local caches/onboarding flags during transient startup initialization.
        if (prevUserId) {
          console.log("Hooks: User explicit logout, clearing caches.");
          
          // CRITICAL: Block any sync during state resets
          dataLoadedFromFirestore.current = false;
          setIsDataReady(false);
          lastSyncedRef.current = null;
          lastLoadedUserIdRef.current = null;
          setIsStateLoaded(false, "User explicit logout, clearing cached state");
          hasMatchedHydratedStateRef.current = false;
          hydratedStateRef.current = null;

          Object.keys(localStorage).forEach((key) => {
            if (
              (key.startsWith("nexora_") && key !== "nexora_cached_user") ||
              key.startsWith("hydration_") ||
              key === "admin_read_feedback_ids"
            ) {
              localStorage.removeItem(key);
            }
          });
          setSettings(DEFAULT_SETTINGS);
          setStats(DEFAULT_STATS);
          setDailyProgress({
            date: today,
            completed: false,
            pushupsDone: false,
            waterDrank: 0,
            breathingDone: false,
            drawingDone: false,
            footballDone: false,
            bubblesDone: false,
            completionsCount: 0,
            nextRestorationTime: null,
          });
          setGardenState(createInitialGardenState());
        }
        setUser(null);
        setIsDataReady(false); // DO NOT allow ready state without user
        dataLoadedFromFirestore.current = false;
        lastLoadedUserIdRef.current = null;
        lastSyncedRef.current = null;
        setIsStateLoaded(false, "No user session exists");
        hasMatchedHydratedStateRef.current = false;
        hydratedStateRef.current = null;
        setNeedsOnboarding(false);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  // Separate effect for standardizing firestore loaders to prevent leaks (Optimized with safety timeout & prevents default overwrite on network errors)
  useEffect(() => {
    if (!user) {
      setIsDataReady(false);
      setLoading(false);
      return;
    }

    if (lastLoadedUserIdRef.current === user.uid && dataLoadedFromFirestore.current) {
      console.log("Hooks: User already loaded, avoiding redundant loadData trigger.");
      return;
    }

    // Force loading state for non-cached or newly logged-in sessions to let Firestore data resolve
    // this completely prevents existing users from flashing onboarding screens during transitional sign-ins!
    const hasCache = localStorage.getItem("nexora_onboarding_completed") === "true";
    if (!hasCache) {
      setLoading(true);
      setIsDataReady(false);
    }

    let isLoaderResolved = false;

    // Safety timeout: if Firestore takes too long (or user is offline), immediately resolve with either the local cached data
    // or a clean Connection Failed screen rather than hanging forever!
    let loadingTimeout: NodeJS.Timeout | null = null;
    
    const timeoutDuration = hasCache 
      ? (navigator.onLine ? 5000 : 500) 
      : (navigator.onLine ? 25000 : 1000); // 25 seconds max for online, 1 second for offline to prevent infinite splash hang
      
    loadingTimeout = setTimeout(() => {
      if (!isLoaderResolved) {
        console.warn("Hooks: Loading timeout reached. Falling back to local offline states to prevent infinite hang.");
        
        // If there's no cache, initialize with default offline states to allow playability
        if (!hasCache) {
          setSettings(DEFAULT_SETTINGS);
          setStats(DEFAULT_STATS);
          const currentProgress = {
            date: today,
            completed: false,
            pushupsDone: false,
            waterDrank: 0,
            breathingDone: false,
            drawingDone: false,
            footballDone: false,
            bubblesDone: false,
            completionsCount: 0,
            nextRestorationTime: null,
          };
          setDailyProgress(currentProgress);
          setGardenState(createInitialGardenState());
        }

        const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
        setNeedsOnboarding(!onboardingComp);
        setIsDataReady(true);
        setLoading(false);
        showToast("Slow connection detected. Running in offline backup mode! 📡", "info");
      }
    }, timeoutDuration);

    const loadData = async () => {
      // If offline and cache is present, bypass Firestore completely for instant rendering
      if (!navigator.onLine && hasCache) {
        console.log("Hooks: Offline mode detected with active cache. Directly using cached state.");
        setNeedsOnboarding(false);
        setIsDataReady(true);
        setLoading(false);
        dataLoadedFromFirestore.current = true;

        const currentProgress = cachedProgress?.date === today ? cachedProgress : {
          date: today,
          completed: false,
          pushupsDone: false,
          waterDrank: 0,
          breathingDone: false,
          drawingDone: false,
          footballDone: false,
          bubblesDone: false,
          completionsCount: 0,
          nextRestorationTime: null,
        };

        const cachedObj = {
          s: cachedSettings,
          st: cachedStats,
          p: {
            c: currentProgress.completed,
            cc: currentProgress.completionsCount,
            d: currentProgress.date,
          },
          g: cachedGarden,
        };

        hydratedStateRef.current = cachedObj;
        lastSyncedRef.current = cachedObj;
        console.log("[PERSISTENCE FIX]\nFirestore hydration started (offline bypass). Waiting for React state flush to unlock sync gate.");

        lastLoadedUserIdRef.current = user.uid;
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const progressDocRef = doc(db, "users", user.uid, "progress", today);
      const ecoShopRef = collection(db, "users", user.uid, "eco_shop");

      console.log(`[PERSISTENCE AUDIT] [READ START] Initiated Firestore read for user UID: ${user.uid}`);
      console.log(`[PERSISTENCE AUDIT] User document path: ${userDocRef.path}`);
      console.log(`[PERSISTENCE AUDIT] Progress document path: ${progressDocRef.path}`);

      const getDocWithCacheFallback = async (docRef: any) => {
        try {
          return await getDoc(docRef);
        } catch (e: any) {
          console.warn(`[PERSISTENCE FIX] getDoc failed for ${docRef.path}, trying cache fallback:`, e);
          try {
            return await getDocFromCache(docRef);
          } catch (cacheErr) {
            console.warn(`[PERSISTENCE FIX] getDocFromCache failed for ${docRef.path}:`, cacheErr);
            throw e;
          }
        }
      };

      const getDocsWithCacheFallback = async (queryRef: any) => {
        try {
          return await getDocs(queryRef);
        } catch (e: any) {
          console.warn(`[PERSISTENCE FIX] getDocs failed, trying cache fallback:`, e);
          try {
            return await getDocsFromCache(queryRef);
          } catch (cacheErr) {
            console.warn(`[PERSISTENCE FIX] getDocsFromCache failed:`, cacheErr);
            throw e;
          }
        }
      };

      try {
        const timeoutDuration = hasCache ? 15000 : 25000;
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Firebase network timed out (${timeoutDuration / 1000}s)`)), timeoutDuration)
        );

        let docSnap, progressSnap, ecoSnap;
        try {
          const fetchPromise = Promise.all([
            getDocWithCacheFallback(userDocRef),
            getDocWithCacheFallback(progressDocRef),
            getDocsWithCacheFallback(ecoShopRef),
          ]);

          [docSnap, progressSnap, ecoSnap] = (await Promise.race([
            fetchPromise,
            timeoutPromise,
          ])) as [any, any, any];
          
          console.log(`[PERSISTENCE AUDIT] [READ SUCCESS] Core Firestore data loaded successfully for UID: ${user.uid}`);
        } catch (fetchErr) {
          console.error(`[PERSISTENCE AUDIT] [READ FAILURE] Failed fetching Firestore data for UID: ${user.uid}. Error:`, fetchErr);
          
          // Regardless of hasCache, we should fallback gracefully to avoid blocking the user with a hard Connection Failed screen!
          console.warn("Hooks: Primary connection fetch timed out or failed. Falling back to local states to preserve offline playability.");

          const currentProgress = cachedProgress?.date === today ? cachedProgress : {
            date: today,
            completed: false,
            pushupsDone: false,
            waterDrank: 0,
            breathingDone: false,
            drawingDone: false,
            footballDone: false,
            bubblesDone: false,
            completionsCount: 0,
            nextRestorationTime: null,
          };

          const cachedObj = {
            s: cachedSettings,
            st: cachedStats,
            p: {
              c: currentProgress.completed,
              cc: currentProgress.completionsCount,
              d: currentProgress.date,
            },
            g: cachedGarden,
          };

          hydratedStateRef.current = cachedObj;
          lastSyncedRef.current = cachedObj;
          console.log("[PERSISTENCE FIX]\nNetwork loading timeout or primary connection failed, falling back to cache. Waiting for React state flush to unlock sync gate.");

          if (loadingTimeout) clearTimeout(loadingTimeout);
          isLoaderResolved = true;

          // Set client state to cached or default local states so the app is instantly usable
          setSettings(cachedSettings);
          setStats(cachedStats);
          setDailyProgress(currentProgress);
          setGardenState(cachedGarden);

          const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
          setNeedsOnboarding(!onboardingComp);
          setIsDataReady(true);
          setLoading(false);
          
          showToast("Running offline. Your progress will be synced when connection is restored! 📡", "info");
          return;
        }

        let firestoreSettings = DEFAULT_SETTINGS;
        let firestoreStats = DEFAULT_STATS;
        let firestoreProgress = {
          date: today,
          completed: false,
          pushupsDone: false,
          waterDrank: 0,
          breathingDone: false,
          drawingDone: false,
          footballDone: false,
          bubblesDone: false,
          completionsCount: 0,
          nextRestorationTime: null,
        } as DailyProgress;
        let firestoreGarden = createInitialGardenState();

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log(`[PERSISTENCE AUDIT] User document found in Firestore. onboardingCompleted: ${data.onboardingCompleted}`);
          console.log(`[PERSISTENCE AUDIT] COMPLETE FIRESTORE DOCUMENT:`, JSON.stringify(data));
          
          console.log(`%c=================== RUNTIME PROOF: USER DATA DIRECTLY FROM FIRESTORE ===================`, "color: #10B981; font-weight: bold; font-size: 14px;");
          console.log(`UID: ${user.uid}`);
          console.log(`Document Exists: true`);
          console.log(`OnboardingCompleted: ${data.onboardingCompleted}`);
          console.log(`Coins: ${data.stats?.coins ?? 0}`);
          console.log(`XP: ${data.stats?.xp ?? 0}`);
          console.log(`Username: ${data.displayName || 'Champion'}`);
          console.log(`GardenState:`, JSON.stringify(data.garden || null));
          console.log(`%c========================================================================================`, "color: #10B981; font-weight: bold; font-size: 14px;");
          
          firestoreSettings = {
            ...DEFAULT_SETTINGS,
            ...data,
            plantState: {
              ...DEFAULT_SETTINGS.plantState,
              ...(data.plantState || {}),
            },
          };

          firestoreStats = {
            ...DEFAULT_STATS,
            ...(data.stats || {}),
            pointsByCategory: {
              ...DEFAULT_STATS.pointsByCategory,
              ...(data.stats?.pointsByCategory || {}),
            },
            trophies: data.stats?.trophies || [],
          };
          const initialGardenDb = createInitialGardenState();
          firestoreGarden = {
            ...initialGardenDb,
            ...(data.garden || {}),
            mascotState: {
              ...initialGardenDb.mascotState,
              ...(data.garden?.mascotState || {}),
            },
            inventory: {
              ...initialGardenDb.inventory,
              ...(data.garden?.inventory || {}),
            },
            tiles: data.garden?.tiles || initialGardenDb.tiles,
          };

          // If they already have a document in Firestore, they have an existing account!
          // We bypass onboarding completely to make sure they are not taken to the onboarding pages.
          onboardingReasonRef.current = "User doc exists on Firestore. Skipping onboarding.";
          setNeedsOnboarding(false);
          localStorage.setItem("nexora_onboarding_completed", "true");
        } else {
          console.log(`[PERSISTENCE AUDIT] User document not found in Firestore for UID: ${user.uid}. Creating user as new.`);
          console.log(`%c=================== RUNTIME PROOF: USER DATA DIRECTLY FROM FIRESTORE ===================`, "color: #EF4444; font-weight: bold; font-size: 14px;");
          console.log(`UID: ${user.uid}`);
          console.log(`Document Exists: false`);
          console.log(`OnboardingCompleted: false`);
          console.log(`Coins: 0`);
          console.log(`XP: 0`);
          console.log(`Username: Champion`);
          console.log(`GardenState: null`);
          console.log(`%c========================================================================================`, "color: #EF4444; font-weight: bold; font-size: 14px;");
          
          // Clear any stale localstorage caches from other users immediately
          // to prevent leaks before we save the new user's data!
          Object.keys(localStorage).forEach((key) => {
            if (
              (key.startsWith("nexora_") && key !== "nexora_cached_user") ||
              key.startsWith("hydration_") ||
              key === "admin_read_feedback_ids"
            ) {
              localStorage.removeItem(key);
            }
          });

          firestoreSettings = {
            ...DEFAULT_SETTINGS,
            displayName: user.displayName || 'Champion',
          };
          firestoreStats = DEFAULT_STATS;
          firestoreProgress = {
            date: today,
            completed: false,
            pushupsDone: false,
            waterDrank: 0,
            breathingDone: false,
            drawingDone: false,
            footballDone: false,
            bubblesDone: false,
            completionsCount: 0,
            nextRestorationTime: null,
          } as DailyProgress;
          firestoreGarden = createInitialGardenState();

          const hydratedObj = {
            s: firestoreSettings,
            st: firestoreStats,
            p: {
              c: firestoreProgress.completed,
              cc: firestoreProgress.completionsCount,
              d: firestoreProgress.date,
            },
            g: firestoreGarden,
          };

          hydratedStateRef.current = hydratedObj;
          lastSyncedRef.current = hydratedObj;

          setSettings(firestoreSettings);
          setStats(firestoreStats);
          setDailyProgress(firestoreProgress);
          setGardenState(firestoreGarden);

          localStorage.setItem("nexora_settings", JSON.stringify(firestoreSettings));
          localStorage.setItem("nexora_stats", JSON.stringify(firestoreStats));
          localStorage.setItem("nexora_progress", JSON.stringify(firestoreProgress));
          localStorage.setItem("nexora_garden", JSON.stringify(firestoreGarden));

          const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
          if (onboardingComp) {
            onboardingReasonRef.current = "User doc not found on Firestore, but onboarding completed locally. Skipping onboarding.";
            setNeedsOnboarding(false);
          } else {
            onboardingReasonRef.current = "User doc not found on Firestore and onboarding not completed locally. Showing onboarding.";
            setNeedsOnboarding(true);
          }

          // Securely create a brand-new user profile in Firestore exactly once now
          const initialProfile = {
            displayName: firestoreSettings.displayName || user.displayName || 'Champion',
            ...firestoreSettings,
            uid: user.uid,
            email: user.email || `${user.uid}@nexora.app`,
            role: 'user',
            stats: firestoreStats,
            garden: firestoreGarden,
            isTodayCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            onboardingCompleted: onboardingComp,
          };

          console.log(`[PERSISTENCE AUDIT] Writing brand-new user document to Firestore for UID: ${user.uid}`);
          await setDoc(userDocRef, initialProfile);
          console.log(`[PERSISTENCE AUDIT] Successfully created brand-new user document for UID: ${user.uid}`);
        }

        if (progressSnap.exists()) {
          const pData = progressSnap.data();
          console.log(`[PERSISTENCE AUDIT] Progress document found for today: ${today}. Completed: ${pData.completed}`);
          if (pData.date === today) {
            firestoreProgress = {
              ...firestoreProgress,
              ...pData,
            };
          }
        } else {
          console.log(`[PERSISTENCE AUDIT] Progress document not found for today: ${today}`);
        }

        const ecoIds = ecoSnap.docs.map((d) => d.id);
        if (ecoIds.length > 0) {
          firestoreSettings.purchasedEcosystemItemIds = [
            ...new Set([
              ...(firestoreSettings.purchasedEcosystemItemIds || []),
              ...ecoIds,
            ]),
          ];
        }

        console.log(`[PERSISTENCE AUDIT] AUTH UID: ${user.uid}`);
        console.log(`[PERSISTENCE AUDIT] FIRESTORE DOCUMENT PATH: users/${user.uid}`);
        console.log(`[PERSISTENCE AUDIT] ONBOARDING STATUS: ${docSnap.exists() ? (docSnap.data().onboardingCompleted ? "Completed" : "Not Completed") : "Not Found"}`);
        console.log(`[PERSISTENCE AUDIT] LOADED XP: ${firestoreStats.xp}`);
        console.log(`[PERSISTENCE AUDIT] LOADED COINS: ${firestoreStats.coins}`);
        console.log(`[PERSISTENCE AUDIT] LOADED STREAK: ${firestoreStats.streak}`);
        console.log(`[PERSISTENCE AUDIT] LOADED GARDEN STATE:`, JSON.stringify(firestoreGarden));

        const hydratedObj = {
          s: firestoreSettings,
          st: firestoreStats,
          p: {
            c: firestoreProgress.completed,
            cc: firestoreProgress.completionsCount,
            d: firestoreProgress.date,
          },
          g: firestoreGarden,
        };

        hydratedStateRef.current = hydratedObj;
        lastSyncedRef.current = hydratedObj;

        // Save to state and local cache immediately
        setSettings(firestoreSettings);
        setStats(firestoreStats);
        setDailyProgress(firestoreProgress);
        setGardenState(firestoreGarden);

        localStorage.setItem("nexora_settings", JSON.stringify(firestoreSettings));
        localStorage.setItem("nexora_stats", JSON.stringify(firestoreStats));
        localStorage.setItem("nexora_progress", JSON.stringify(firestoreProgress));
        localStorage.setItem(`nexora_progress_${today}`, JSON.stringify(firestoreProgress));
        localStorage.setItem("nexora_garden", JSON.stringify(firestoreGarden));

        try {
          const progressCollRef = collection(db, "users", user.uid, "progress");
          const historySnap = await getDocsWithCacheFallback(progressCollRef) as any;
          historySnap.forEach((doc: any) => {
            const hData = doc.data() as any;
            if (hData && hData.date) {
              localStorage.setItem(`nexora_progress_${hData.date}`, JSON.stringify(hData));
            }
          });
        } catch (historyErr) {
          console.warn("Hooks: Error fetching history list from firestore:", historyErr);
        }

        // Successfully loaded. Wait for deepEqual matching to unlock the sync gate!
        dataLoadedFromFirestore.current = true;
        console.log("[PERSISTENCE FIX]\nFirestore load complete. Waiting for React state matching to unlock sync gate.");
        lastLoadedUserIdRef.current = user.uid;
        if (loadingTimeout) clearTimeout(loadingTimeout);
        isLoaderResolved = true;
        setIsDataReady(true);
        setLoading(false);
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [LOAD FAILURE] Error during user data initialization for UID ${user.uid}:`, err);
        const isOfflineReason = !navigator.onLine || err?.message?.includes("offline") || err?.message?.includes("timed out") || err?.code === "unavailable";
        if (isOfflineReason) {
          console.warn("Hooks: Firestore backend unreachable.");
        } else {
          console.error("Hooks: Error loading initial user data: ", err);
        }

        if (!isLoaderResolved) {
          if (loadingTimeout) clearTimeout(loadingTimeout);
          isLoaderResolved = true;

          // Rather than showing a hard Connection Failed blocking screen, we always boot into the offline-playable app!
          console.warn("Hooks: Resolving load data from final catch-block with local states fallback.");
          
          const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
          setNeedsOnboarding(!onboardingComp);
          setIsDataReady(true);
          setLoading(false);
          
          showToast("Running in local offline mode. Progress will sync when possible! 📡", "info");
        }
      }
    };

    loadData();

    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [user]);

  // Check if current state matches hydrated state to set hasMatchedHydratedStateRef
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current || !hydratedStateRef.current) return;

    if (hasMatchedHydratedStateRef.current) return;

    const currentState = {
      s: settings,
      st: stats,
      p: {
        c: dailyProgress.completed,
        cc: dailyProgress.completionsCount,
        d: dailyProgress.date,
      },
      g: gardenState,
    };

    if (deepEqual(currentState, hydratedStateRef.current)) {
      console.log(`[PERSISTENCE AUDIT] State matches loaded Firestore data. Ready to handle future user mutations.`);
      hasMatchedHydratedStateRef.current = true;
      setIsStateLoaded(true, "Current state matched hydrated Firestore state. Sync gate unlocked.");
    } else {
      console.log(`[PERSISTENCE AUDIT] Waiting for React in-memory states to flush and match hydrated Firestore/Cache values...`);
    }
  }, [settings, stats, dailyProgress, gardenState, user, isDataReady]);

  // Background Sync Effect with Aggressive Throttling (Optimized)
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (!isStateLoadedRef.current) {
      console.log(`[PERSISTENCE AUDIT] State is not fully loaded/synchronized with Firestore yet. Skipping background sync for user UID: ${user.uid}`);
      return;
    }
    if (!hasMatchedHydratedStateRef.current) {
      console.log(`[PERSISTENCE AUDIT] Stale memory state detected (React has not yet flushed hydrated state from Firestore). Skipping background sync to avoid data loss.`);
      return;
    }

    const syncData = async () => {
      if (quotaExceededRef.current) return;

      const currentState = {
        s: settings,
        st: stats,
        p: {
          c: dailyProgress.completed,
          cc: dailyProgress.completionsCount,
          d: dailyProgress.date,
        },
        g: gardenState,
      };

      if (lastSyncedRef.current && deepEqual(currentState, lastSyncedRef.current)) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const progressRef = doc(db, "users", user.uid, "progress", today);
        const leaderboardRef = doc(db, "leaderboard", user.uid);

        console.log(`[PERSISTENCE AUDIT] AUTH UID ON SAVE: ${user.uid}`);
        console.log(`[PERSISTENCE AUDIT] FIRESTORE DOCUMENT PATH BEING WRITTEN: users/${user.uid}`);
        console.log(`[PERSISTENCE AUDIT] Target progress document path: ${progressRef.path}`);

        // 1. Check if core settings/stats/garden changed
        const lastSyncedData = lastSyncedRef.current;
        const coreChanged =
          !lastSyncedData ||
          !deepEqual(lastSyncedData.s, settings) ||
          !deepEqual(lastSyncedData.st, stats) ||
          !deepEqual(lastSyncedData.g, gardenState);

        if (coreChanged) {
          console.log(`[PERSISTENCE AUDIT] Core fields changed. Initiating write for core document...`);
          console.log(`[PERSISTENCE AUDIT] Exact Firestore path: ${userRef.path}`);
          
          try {
            console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${userRef.path}`);
            const preSnap = await getDoc(userRef);
            const dbData = preSnap.exists() ? preSnap.data() : null;
            console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${userRef.path}:`, dbData ? JSON.stringify(dbData) : "Document does not exist");
            
            // CRITICAL DEFENSIVE GUARD: Never let uninitialized/empty stats overwrite positive Firestore stats
            if (dbData) {
              const dbStats = dbData.stats || {};
              const dbGarden = dbData.garden || {};
              const dbSettings = dbData.settings || dbData;

              const dbHasProgress = (dbStats.xp > 0 || dbStats.coins > 0 || (dbStats.totalPoints || 0) > 0 || (dbStats.streak || 0) > 0);
              const dbHasGarden = (dbGarden.tiles && dbGarden.tiles.length > 0) || (dbGarden.inventory && Object.keys(dbGarden.inventory).length > 0);
              const dbHasSettings = (dbSettings.displayName && dbSettings.displayName !== "Nexora User" && dbSettings.displayName !== "Champion");

              const localIsEmptyStats = (stats.xp === 0 && stats.coins === 0 && (stats.totalPoints || 0) === 0 && (stats.streak || 0) === 0);
              const localIsEmptyGarden = !gardenState.tiles || gardenState.tiles.length === 0;
              const localIsEmptySettings = !settings.displayName || settings.displayName === "Nexora User" || settings.displayName === "Champion";

              if (
                (dbHasProgress && localIsEmptyStats) ||
                (dbHasGarden && localIsEmptyGarden) ||
                (dbHasSettings && localIsEmptySettings)
              ) {
                console.error(`[CRITICAL BLOCKED WRITE] Emergency block triggered in syncData! Attempted to overwrite positive Firestore data with empty local states. DB Stats Has Progress: ${dbHasProgress}, Local Is Empty Stats: ${localIsEmptyStats}. DB Garden Has Data: ${dbHasGarden}, Local Is Empty Garden: ${localIsEmptyGarden}. DB Settings Has Info: ${dbHasSettings}, Local Is Empty Settings: ${localIsEmptySettings}. Aborting write to prevent data loss.`);
                
                // Trigger emergency recovery: update local state to match database
                if (dbData.stats) setStats(dbData.stats);
                if (dbData.settings || dbData.displayName) {
                  setSettings({
                    ...DEFAULT_SETTINGS,
                    ...dbData,
                    ...dbData.settings,
                  });
                }
                if (dbData.garden) setGardenState(dbData.garden);
                return;
              }
            }

            const writePayload = {
              displayName: settings.displayName || user.displayName || 'Champion',
              ...settings,
              uid: user.uid,
              email: user.email || `${user.uid}@nexora.app`,
              role: 'user',
              stats: stats,
              garden: gardenState,
              isTodayCompleted: dailyProgress.completed,
              updatedAt: serverTimestamp(),
              onboardingCompleted: true,
            };
            console.log(`[PERSISTENCE AUDIT] Write payload for core document:`, JSON.stringify(writePayload));
            
            console.log("=== FIRESTORE WRITE DEBBUGGING LOGS ===");
            console.log("1. Current authenticated uid:", user?.uid);
            console.log("2. Current event: background sync");
            console.log("3. JSON.stringify(stats):", JSON.stringify(stats));
            console.log("4. JSON.stringify(lastSyncedRef.current?.st):", JSON.stringify(lastSyncedRef.current?.st));
            console.log("5. Whether stats equals DEFAULT_STATS:", deepEqual(stats, DEFAULT_STATS));
            console.log("6. Whether stats.xp == 0:", stats.xp === 0);
            console.log("7. Whether stats.coins == 0:", stats.coins === 0);
            console.log("8. Stack Trace:");
            console.trace("Trace for Firestore setDoc write");
            console.log("9. The exact writePayload being sent to Firestore:", JSON.stringify(writePayload));
            console.log("======================================");

            await setDoc(userRef, writePayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote core document to: ${userRef.path}`);
            
            console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${userRef.path}`);
            const postSnap = await getDoc(userRef);
            console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${userRef.path}:`, postSnap.exists() ? JSON.stringify(postSnap.data()) : "Document does not exist");
          } catch (err: any) {
            console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write core document to: ${userRef.path}. Error:`, err);
          }
        }

        // 2. Sync progress always attempts, or can be throttled too
        console.log(`[PERSISTENCE AUDIT] Initiating write for progress document...`);
        console.log(`[PERSISTENCE AUDIT] Exact Firestore path: ${progressRef.path}`);
        try {
          console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${progressRef.path}`);
          const preProgSnap = await getDoc(progressRef);
          console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${progressRef.path}:`, preProgSnap.exists() ? JSON.stringify(preProgSnap.data()) : "Document does not exist");
          
          console.log(`[PERSISTENCE AUDIT] Write payload for progress document:`, JSON.stringify(dailyProgress));
          await setDoc(progressRef, dailyProgress, { merge: true });
          console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote progress document to: ${progressRef.path}`);
          
          console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${progressRef.path}`);
          const postProgSnap = await getDoc(progressRef);
          console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${progressRef.path}:`, postProgSnap.exists() ? JSON.stringify(postProgSnap.data()) : "Document does not exist");
        } catch (err: any) {
          console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write progress document to: ${progressRef.path}. Error:`, err);
        }

        // 3. Leaderboard sync (only if streak, points, name or photo changed)
        const lbChanged =
          !lastSyncedData ||
          lastSyncedData.st?.totalPoints !== stats.totalPoints ||
          lastSyncedData.st?.streak !== stats.streak ||
          lastSyncedData.s?.displayName !== settings.displayName ||
          lastSyncedData.s?.profilePic !== settings.profilePic;

        if (lbChanged) {
          console.log(`[PERSISTENCE AUDIT] Leaderboard relevant fields changed. Initiating write for leaderboard document...`);
          console.log(`[PERSISTENCE AUDIT] Exact Firestore path: ${leaderboardRef.path}`);
          try {
            console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${leaderboardRef.path}`);
            const preLbSnap = await getDoc(leaderboardRef);
            console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${leaderboardRef.path}:`, preLbSnap.exists() ? JSON.stringify(preLbSnap.data()) : "Document does not exist");
            
            const writePayload = {
              uid: user.uid,
              displayName: settings.displayName || "Anonymous",
              photoURL: settings.profilePic || user.photoURL || "",
              streak: stats.streak || 0,
              totalPoints: stats.totalPoints || 0,
              weeklyXP: stats.weeklyXP || 0,
              weeklyPoints: stats.weeklyPoints || 0,
              level: stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1,
              league: settings.league || "Bronze",
            };
            console.log(`[PERSISTENCE AUDIT] Write payload for leaderboard document:`, JSON.stringify(writePayload));
            
            await setDoc(leaderboardRef, writePayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote leaderboard document to: ${leaderboardRef.path}`);
            
            console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${leaderboardRef.path}`);
            const postLbSnap = await getDoc(leaderboardRef);
            console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${leaderboardRef.path}:`, postLbSnap.exists() ? JSON.stringify(postLbSnap.data()) : "Document does not exist");
          } catch (err: any) {
            console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Failed to write leaderboard document to: ${leaderboardRef.path}. Error:`, err);
          }
        }

        lastSyncedRef.current = currentState;
        console.log("Hooks: Optimized Background Sync Complete ✅");
      } catch (e: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Error syncing data for user UID: ${user?.uid}. Error:`, e);
        if (e.message?.includes("quota") || e.code === "resource-exhausted") {
          quotaExceededRef.current = true;
          showToast("Nexus Quota Reached. Local cache active. 🛡️", "info");
        } else {
          console.error("Sync error:", e);
        }
      }
    };

    // 1-second debounce for faster background sync (Ensures no data loss on immediate exits)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(syncData, 1000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    settings,
    stats,
    dailyProgress.completed,
    dailyProgress.completionsCount,
    dailyProgress.date,
    gardenState,
    user,
    isDataReady,
    needsOnboarding,
  ]);

  const onUpdateSettings = (
    update: Partial<UserSettings> | ((prev: UserSettings) => UserSettings),
  ) => {
    setSettings((prev) => {
      const next =
        typeof update === "function" ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem("nexora_settings", JSON.stringify(next));
        if (next.onboardingCompleted) {
          localStorage.setItem("nexora_onboarding_completed", "true");
        }
      } catch (e) {
        console.warn("Failed to cache settings:", e);
      }
      return next;
    });
  };

  const onUpdateStats = (
    update: Partial<UserStats> | ((prev: UserStats) => UserStats),
  ) => {
    setStats((prev) => {
      const next =
        typeof update === "function" ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem("nexora_stats", JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to cache stats:", e);
      }
      return next;
    });
  };

  const onUpdateDailyProgress = (
    update: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress),
  ) => {
    setDailyProgress((prev) => {
      const next =
        typeof update === "function" ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem(
          "nexora_progress",
          JSON.stringify({ ...next, date: today }),
        );
      } catch (e) {
        console.warn("Failed to cache progress:", e);
      }
      return next;
    });
  };

  const onUpdateGardenState = (
    update: Partial<GardenState> | ((prev: GardenState) => GardenState),
  ) => {
    setGardenState((prev) => {
      const next =
        typeof update === "function" ? update(prev) : { ...prev, ...update };
      try {
        localStorage.setItem("nexora_garden", JSON.stringify(next));
      } catch (e) {
        console.warn("Failed to cache garden:", e);
      }
      return next;
    });
  };

  const forceSyncData = useCallback(async () => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (!isStateLoadedRef.current || !hasMatchedHydratedStateRef.current) {
      console.warn(`[PERSISTENCE AUDIT] forceSyncData called but hydration is not complete. Blocking write to prevent data loss.`);
      return;
    }
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    if (quotaExceededRef.current) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const progressRef = doc(db, "users", user.uid, "progress", today);
      const leaderboardRef = doc(db, "leaderboard", user.uid);

      console.log(`[PERSISTENCE AUDIT] [WRITE START] Initiating FORCE SYNC for user UID: ${user.uid}`);
      console.log(`[PERSISTENCE AUDIT] Target user document path: ${userRef.path}`);
      console.log(`[PERSISTENCE AUDIT] Target progress document path: ${progressRef.path}`);

      // 1. Core Doc Force Write
      try {
        console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${userRef.path}`);
        const preSnap = await getDoc(userRef);
        const dbData = preSnap.exists() ? preSnap.data() : null;
        console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${userRef.path}:`, dbData ? JSON.stringify(dbData) : "Document does not exist");

        // CRITICAL DEFENSIVE GUARD: Never let uninitialized/empty stats overwrite positive Firestore stats
        if (dbData) {
          const dbStats = dbData.stats || {};
          const dbGarden = dbData.garden || {};
          const dbSettings = dbData.settings || dbData;

          const dbHasProgress = (dbStats.xp > 0 || dbStats.coins > 0 || (dbStats.totalPoints || 0) > 0 || (dbStats.streak || 0) > 0);
          const dbHasGarden = (dbGarden.tiles && dbGarden.tiles.length > 0) || (dbGarden.inventory && Object.keys(dbGarden.inventory).length > 0);
          const dbHasSettings = (dbSettings.displayName && dbSettings.displayName !== "Nexora User" && dbSettings.displayName !== "Champion");

          const localIsEmptyStats = (stats.xp === 0 && stats.coins === 0 && (stats.totalPoints || 0) === 0 && (stats.streak || 0) === 0);
          const localIsEmptyGarden = !gardenState.tiles || gardenState.tiles.length === 0;
          const localIsEmptySettings = !settings.displayName || settings.displayName === "Nexora User" || settings.displayName === "Champion";

          if (
            (dbHasProgress && localIsEmptyStats) ||
            (dbHasGarden && localIsEmptyGarden) ||
            (dbHasSettings && localIsEmptySettings)
          ) {
            console.error(`[CRITICAL BLOCKED WRITE] Emergency block triggered in forceSyncData! Attempted to overwrite positive Firestore data with empty local states. DB Stats Has Progress: ${dbHasProgress}, Local Is Empty Stats: ${localIsEmptyStats}. DB Garden Has Data: ${dbHasGarden}, Local Is Empty Garden: ${localIsEmptyGarden}. DB Settings Has Info: ${dbHasSettings}, Local Is Empty Settings: ${localIsEmptySettings}. Aborting write to prevent data loss.`);
            
            // Trigger emergency recovery: update local state to match database
            if (dbData.stats) setStats(dbData.stats);
            if (dbData.settings || dbData.displayName) {
              setSettings({
                ...DEFAULT_SETTINGS,
                ...dbData,
                ...dbData.settings,
              });
            }
            if (dbData.garden) setGardenState(dbData.garden);
            return;
          }
        }

        const writePayload = {
          displayName: settings.displayName || user.displayName || 'Champion',
          ...settings,
          uid: user.uid,
          email: user.email || `${user.uid}@nexora.app`,
          role: 'user',
          stats: stats,
          garden: gardenState,
          isTodayCompleted: dailyProgress.completed,
          updatedAt: serverTimestamp(),
          onboardingCompleted: true,
        };
        console.log(`[PERSISTENCE AUDIT] Force sync payload for core document:`, JSON.stringify(writePayload));

        console.log("=== FIRESTORE WRITE DEBBUGGING LOGS ===");
        console.log("1. Current authenticated uid:", user?.uid);
        console.log("2. Current event: force sync");
        console.log("3. JSON.stringify(stats):", JSON.stringify(stats));
        console.log("4. JSON.stringify(lastSyncedRef.current?.st):", JSON.stringify(lastSyncedRef.current?.st));
        console.log("5. Whether stats equals DEFAULT_STATS:", deepEqual(stats, DEFAULT_STATS));
        console.log("6. Whether stats.xp == 0:", stats.xp === 0);
        console.log("7. Whether stats.coins == 0:", stats.coins === 0);
        console.log("8. Stack Trace:");
        console.trace("Trace for Firestore setDoc write");
        console.log("9. The exact writePayload being sent to Firestore:", JSON.stringify(writePayload));
        console.log("======================================");

        await setDoc(userRef, writePayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote core document to: ${userRef.path}`);

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${userRef.path}`);
        const postSnap = await getDoc(userRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${userRef.path}:`, postSnap.exists() ? JSON.stringify(postSnap.data()) : "Document does not exist");
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write core document to: ${userRef.path}. Error:`, err);
      }

      // 2. Progress Doc Force Write
      try {
        console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${progressRef.path}`);
        const preProgSnap = await getDoc(progressRef);
        console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${progressRef.path}:`, preProgSnap.exists() ? JSON.stringify(preProgSnap.data()) : "Document does not exist");

        console.log(`[PERSISTENCE AUDIT] Force sync payload for progress document:`, JSON.stringify(dailyProgress));
        await setDoc(progressRef, dailyProgress, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote progress document to: ${progressRef.path}`);

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${progressRef.path}`);
        const postProgSnap = await getDoc(progressRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${progressRef.path}:`, postProgSnap.exists() ? JSON.stringify(postProgSnap.data()) : "Document does not exist");
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write progress document to: ${progressRef.path}. Error:`, err);
      }

      // 3. Leaderboard Doc Force Write
      try {
        console.log(`[PERSISTENCE AUDIT] Fetching pre-write document snapshot for: ${leaderboardRef.path}`);
        const preLbSnap = await getDoc(leaderboardRef);
        console.log(`[PERSISTENCE AUDIT] Document BEFORE write at ${leaderboardRef.path}:`, preLbSnap.exists() ? JSON.stringify(preLbSnap.data()) : "Document does not exist");

        const writePayload = {
          uid: user.uid,
          displayName: settings.displayName || "Anonymous",
          photoURL: settings.profilePic || user.photoURL || "",
          streak: stats.streak || 0,
          totalPoints: stats.totalPoints || 0,
          weeklyXP: stats.weeklyXP || 0,
          weeklyPoints: stats.weeklyPoints || 0,
          level: stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1,
          league: settings.league || "Bronze",
        };
        console.log(`[PERSISTENCE AUDIT] Force sync payload for leaderboard document:`, JSON.stringify(writePayload));

        await setDoc(leaderboardRef, writePayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote leaderboard document to: ${leaderboardRef.path}`);

        console.log(`[PERSISTENCE AUDIT] Fetching post-write document snapshot for: ${leaderboardRef.path}`);
        const postLbSnap = await getDoc(leaderboardRef);
        console.log(`[PERSISTENCE AUDIT] Document AFTER write at ${leaderboardRef.path}:`, postLbSnap.exists() ? JSON.stringify(postLbSnap.data()) : "Document does not exist");
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed to write leaderboard document to: ${leaderboardRef.path}. Error:`, err);
      }

      console.log("Hooks: Manual/Force Sync complete ✅");
    } catch (e: any) {
      console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Force sync failed for user UID: ${user?.uid}. Error:`, e);
      console.error("Hooks: Force sync failed", e);
    }
  }, [user, isDataReady, settings, stats, dailyProgress, gardenState]);

  // Synchronize immediately when the tab is backgrounded, minimized, or when the phone screen is locked.
  // This is critical for mobile devices where immediate teardown or backgrounding is the primary exit vector.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        user &&
        isDataReady &&
        dataLoadedFromFirestore.current
      ) {
        console.log("Hooks: Tab backgrounded, flushing pending state to Firestore...");
        forceSyncData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, isDataReady, forceSyncData]);

  return {
    user,
    loading,
    authLoading,
    isDataReady,
    settings,
    setSettings: onUpdateSettings,
    stats,
    setStats: onUpdateStats,
    dailyProgress,
    setDailyProgress: onUpdateDailyProgress,
    gardenState,
    setGardenState: onUpdateGardenState,
    needsOnboarding,
    setNeedsOnboarding,
    dataLoadedFromFirestore,
    loadError,
    forceSyncData,
  };
}
