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
  const [isHydrated, setIsHydrated] = useState(false);
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
    let loadingTimeout: NodeJS.Timeout | null = null;
    let isLoaderResolved = false;

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

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log(`[STARTUP] AUTH STATE RESOLVED - User UID: ${currentUser?.uid || "null"}`);
      setAuthLoading(false);

      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }
      isLoaderResolved = false;

      // Always reset the state loading guards upon an auth state transition to prevent syncing stale data
      setIsStateLoaded(false, "Auth state changed");
      hasMatchedHydratedStateRef.current = false;
      hydratedStateRef.current = null;
      setIsHydrated(false);

      if (!currentUser) {
        // Handle User Explicit Logout or Missing Session
        const prevUserId = localStorage.getItem("nexora_cached_user");
        if (prevUserId) {
          console.log("Hooks: User explicit logout, clearing caches.");
          
          dataLoadedFromFirestore.current = false;
          setIsDataReady(false);
          lastSyncedRef.current = null;
          lastLoadedUserIdRef.current = null;

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
        setIsDataReady(false);
        dataLoadedFromFirestore.current = false;
        lastLoadedUserIdRef.current = null;
        lastSyncedRef.current = null;
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      // We have a logged-in user!
      const prevUserId = localStorage.getItem("nexora_cached_user");
      const hasCache = localStorage.getItem("nexora_onboarding_completed") === "true";

      setUser(currentUser);
      localStorage.setItem("nexora_cached_user", currentUser.uid);

      // Handle Switch User Cleanup
      if (prevUserId && prevUserId !== currentUser.uid) {
        console.log("Hooks: Different user detected, resetting caches in-memory and locally.");
        dataLoadedFromFirestore.current = false;
        lastSyncedRef.current = null;
        lastLoadedUserIdRef.current = null;
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

      // Prevent redundant loads if this user's data is already successfully fetched
      if (lastLoadedUserIdRef.current === currentUser.uid && dataLoadedFromFirestore.current) {
        console.log("Hooks: User already loaded, avoiding redundant loadData trigger.");
        setIsDataReady(true);
        setLoading(false);
        return;
      }

      // Set loading and ready transitions
      if (hasCache) {
        console.log("Hooks: Fast path. We have active cache. Instantly starting the app with cached state.");
        setLoading(false);
        setIsDataReady(true);
        setNeedsOnboarding(false);

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
        lastLoadedUserIdRef.current = currentUser.uid;
        setIsHydrated(true);
      } else {
        setLoading(true);
        setIsDataReady(false);
      }

      // Setup the deterministic safety loading timeout duration
      if (!hasCache) {
        const timeoutDuration = 3000; // Snappy 3s timeout for new users
        loadingTimeout = setTimeout(() => {
          if (!isLoaderResolved) {
            console.warn("Hooks: Loading timeout reached. Falling back to local offline states to prevent infinite hang.");
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
            const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
            setNeedsOnboarding(!onboardingComp);
            setIsDataReady(true);
            setLoading(false);
            setIsHydrated(true);
            showToast("Slow connection detected. Running in offline backup mode! 📡", "info");
          }
        }, timeoutDuration);
      }

      // Offline Cache Bypass
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
        lastLoadedUserIdRef.current = currentUser.uid;
        setIsHydrated(true);

        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
        isLoaderResolved = true;
        return;
      }

      // Initiate Core Firestore Reads
      const userDocRef = doc(db, "users", currentUser.uid);
      const progressDocRef = doc(db, "users", currentUser.uid, "progress", today);
      const ecoShopRef = collection(db, "users", currentUser.uid, "eco_shop");
      const rewardsDocRef = doc(db, "users", currentUser.uid, "rewards", "main");
      const plantSectionDocRef = doc(db, "users", currentUser.uid, "plant_section", "main");

      console.log(`[PERSISTENCE AUDIT] [READ START] Initiated Firestore read for user UID: ${currentUser.uid}`);

      try {
        const networkTimeoutDuration = hasCache ? 5000 : 8000;
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Firebase network timed out (${networkTimeoutDuration / 1000}s)`)), networkTimeoutDuration)
        );

        const fetchPromise = Promise.all([
          getDocWithCacheFallback(userDocRef),
          getDocWithCacheFallback(progressDocRef),
          getDocsWithCacheFallback(ecoShopRef),
          getDocWithCacheFallback(rewardsDocRef),
          getDocWithCacheFallback(plantSectionDocRef),
        ]);

        const [docSnap, progressSnap, ecoSnap, rewardsSnap, plantSectionSnap] = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as [any, any, any, any, any];

        console.log(`[PERSISTENCE AUDIT] [READ SUCCESS] Core Firestore data loaded successfully for UID: ${currentUser.uid}`);

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

        const hasRewards = rewardsSnap && rewardsSnap.exists();
        const hasPlantSection = plantSectionSnap && plantSectionSnap.exists();

        if (docSnap.exists() || hasRewards || hasPlantSection) {
          const data = docSnap.exists() ? docSnap.data() : {};
          console.log(`[PERSISTENCE AUDIT] User core or sub-documents found in Firestore. docSnap.exists: ${docSnap.exists()}, hasRewards: ${hasRewards}, hasPlantSection: ${hasPlantSection}`);

          firestoreSettings = {
            ...DEFAULT_SETTINGS,
            displayName: currentUser.displayName || data.displayName || 'Champion',
            profilePic: currentUser.photoURL || data.profilePic || "",
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

          // Merge Rewards data if it exists
          if (hasRewards) {
            const rewardsData = rewardsSnap.data();
            console.log(`[PERSISTENCE AUDIT] Loading rewards from dedicated path /rewards/main...`);
            firestoreStats = {
              ...firestoreStats,
              ...rewardsData,
              pointsByCategory: {
                ...firestoreStats.pointsByCategory,
                ...(rewardsData.pointsByCategory || {}),
              },
              trophies: [
                ...new Set([
                  ...(firestoreStats.trophies || []),
                  ...(rewardsData.trophies || []),
                ]),
              ],
            };
          }

          // Merge Plant Section data if it exists
          if (hasPlantSection) {
            const plantSecData = plantSectionSnap.data();
            console.log(`[PERSISTENCE AUDIT] Loading plant section from dedicated path /plant_section/main...`);
            if (plantSecData.plantOnboardingCompleted !== undefined) {
              firestoreSettings.plantOnboardingCompleted = plantSecData.plantOnboardingCompleted;
            }
            if (plantSecData.plantState) {
              firestoreSettings.plantState = {
                ...firestoreSettings.plantState,
                ...plantSecData.plantState,
              };
            }
            if (plantSecData.purchasedEcosystemItemIds) {
              firestoreSettings.purchasedEcosystemItemIds = [
                ...new Set([
                  ...(firestoreSettings.purchasedEcosystemItemIds || []),
                  ...(plantSecData.purchasedEcosystemItemIds || []),
                ]),
              ];
            }
            if (plantSecData.gardenState) {
              firestoreGarden = {
                ...firestoreGarden,
                ...plantSecData.gardenState,
                mascotState: {
                  ...firestoreGarden.mascotState,
                  ...(plantSecData.gardenState.mascotState || {}),
                },
                inventory: {
                  ...firestoreGarden.inventory,
                  ...(plantSecData.gardenState.inventory || {}),
                },
                tiles: plantSecData.gardenState.tiles || firestoreGarden.tiles,
              };
            }
          }

          // Write back core document if it did not exist but sub-documents existed
          if (!docSnap.exists()) {
            console.log(`[PERSISTENCE AUDIT] Core document was missing, but rewards/plant data existed. Recreating core document...`);
            const initialProfile = {
              displayName: firestoreSettings.displayName,
              ...firestoreSettings,
              uid: currentUser.uid,
              email: currentUser.email || `${currentUser.uid}@nexora.app`,
              role: 'user',
              stats: firestoreStats,
              garden: firestoreGarden,
              isTodayCompleted: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              onboardingCompleted: true,
            };
            await setDoc(userDocRef, initialProfile);
          }

          const hasCompletedOnboardingDb = (data.onboardingCompleted === true) || hasRewards || hasPlantSection;
          setNeedsOnboarding(!hasCompletedOnboardingDb);
          if (hasCompletedOnboardingDb) {
            localStorage.setItem("nexora_onboarding_completed", "true");
            onboardingReasonRef.current = "User doc exists on Firestore with onboardingCompleted=true. Skipping onboarding.";
          } else {
            localStorage.removeItem("nexora_onboarding_completed");
            onboardingReasonRef.current = "User doc exists on Firestore with onboardingCompleted=false. Showing onboarding.";
          }
        } else {
          // New Profile Path
          console.log(`[PERSISTENCE AUDIT] User document not found in Firestore for UID: ${currentUser.uid}. Creating user as new.`);

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
            displayName: currentUser.displayName || 'Champion',
            profilePic: currentUser.photoURL || "",
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

          const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
          if (onboardingComp) {
            onboardingReasonRef.current = "User doc not found on Firestore, but onboarding completed locally. Skipping onboarding.";
            setNeedsOnboarding(false);
          } else {
            onboardingReasonRef.current = "User doc not found on Firestore and onboarding not completed locally. Showing onboarding.";
            setNeedsOnboarding(true);
          }

          const initialProfile = {
            displayName: firestoreSettings.displayName || currentUser.displayName || 'Champion',
            ...firestoreSettings,
            uid: currentUser.uid,
            email: currentUser.email || `${currentUser.uid}@nexora.app`,
            role: 'user',
            stats: firestoreStats,
            garden: firestoreGarden,
            isTodayCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            onboardingCompleted: onboardingComp,
          };

          const initialRewards = {
            uid: currentUser.uid,
            userName: firestoreSettings.displayName || currentUser.displayName || 'Champion',
            streak: firestoreStats.streak || 0,
            bestStreak: firestoreStats.bestStreak || 0,
            xp: firestoreStats.xp || 0,
            coins: firestoreStats.coins || 0,
            weeklyPoints: firestoreStats.weeklyPoints || 0,
            weeklyXP: firestoreStats.weeklyXP || 0,
            totalPoints: firestoreStats.totalPoints || 0,
            trophies: firestoreStats.trophies || [],
            pointsByCategory: firestoreStats.pointsByCategory || { physical: 0, mental: 0, creative: 0 },
            updatedAt: serverTimestamp(),
            finishedAt: new Date().toISOString(),
          };

          const initialPlantSection = {
            uid: currentUser.uid,
            plantOnboardingCompleted: firestoreSettings.plantOnboardingCompleted || false,
            plantState: firestoreSettings.plantState || null,
            gardenState: firestoreGarden || null,
            purchasedEcosystemItemIds: firestoreSettings.purchasedEcosystemItemIds || [],
            updatedAt: serverTimestamp(),
          };

          console.log(`[PERSISTENCE AUDIT] Writing brand-new user document to Firestore for UID: ${currentUser.uid}`);
          await setDoc(userDocRef, initialProfile);
          await setDoc(rewardsDocRef, initialRewards);
          await setDoc(plantSectionDocRef, initialPlantSection);
          console.log(`[PERSISTENCE AUDIT] Successfully created brand-new user document and sub-documents for UID: ${currentUser.uid}`);
        }

        if (progressSnap.exists()) {
          const pData = progressSnap.data();
          if (pData.date === today) {
            firestoreProgress = {
              ...firestoreProgress,
              ...pData,
            };
          }
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

        // Perform atomic hydration of local states
        setSettings(firestoreSettings);
        setStats(firestoreStats);
        setDailyProgress(firestoreProgress);
        setGardenState(firestoreGarden);
        setIsHydrated(true);

        localStorage.setItem("nexora_settings", JSON.stringify(firestoreSettings));
        localStorage.setItem("nexora_stats", JSON.stringify(firestoreStats));
        localStorage.setItem("nexora_progress", JSON.stringify(firestoreProgress));
        localStorage.setItem(`nexora_progress_${today}`, JSON.stringify(firestoreProgress));
        localStorage.setItem("nexora_garden", JSON.stringify(firestoreGarden));

        try {
          const progressCollRef = collection(db, "users", currentUser.uid, "progress");
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

        dataLoadedFromFirestore.current = true;
        lastLoadedUserIdRef.current = currentUser.uid;
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
        isLoaderResolved = true;
        setIsDataReady(true);
        setLoading(false);
      } catch (err: any) {
        console.error(`[PERSISTENCE AUDIT] [LOAD FAILURE] Error during user data initialization for UID ${currentUser.uid}:`, err);
        if (!isLoaderResolved) {
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
          }
          isLoaderResolved = true;

          const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
          setNeedsOnboarding(!onboardingComp);
          setIsDataReady(true);
          setLoading(false);
          setIsHydrated(true);
          showToast("Running in local offline mode. Progress will sync when possible! 📡", "info");
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, []);

  // Safe State Matching Gate: ensure React state matches the loaded/hydrated Firestore data
  // before unlocking the sync gate. This prevents empty default states from overwriting database records.
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;
    if (hasMatchedHydratedStateRef.current) return;

    if (isHydrated && hydratedStateRef.current) {
      const currentObj = {
        s: settings,
        st: stats,
        g: gardenState,
      };

      const dbObj = {
        s: hydratedStateRef.current.s,
        st: hydratedStateRef.current.st,
        g: hydratedStateRef.current.g,
      };

      if (deepEqual(currentObj, dbObj)) {
        console.log(`[PERSISTENCE AUDIT] Memory state matches hydrated database state perfectly. Unlocking sync gate safely.`);
        hasMatchedHydratedStateRef.current = true;
        setIsStateLoaded(true, "State matching complete");
      } else {
        console.log(`[PERSISTENCE AUDIT] Memory state does not match hydrated database state yet. Keeping sync gate locked.`);
      }
    }
  }, [isHydrated, user, isDataReady, settings, stats, gardenState]);

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

            const rewardsPayload = {
              uid: user.uid,
              userName: settings.displayName || user.displayName || 'Champion',
              streak: stats.streak || 0,
              bestStreak: stats.bestStreak || 0,
              xp: stats.xp || 0,
              coins: stats.coins || 0,
              weeklyPoints: stats.weeklyPoints || 0,
              weeklyXP: stats.weeklyXP || 0,
              totalPoints: stats.totalPoints || 0,
              trophies: stats.trophies || [],
              pointsByCategory: stats.pointsByCategory || { physical: 0, mental: 0, creative: 0 },
              updatedAt: serverTimestamp(),
              finishedAt: new Date().toISOString(),
            };

            const plantSectionPayload = {
              uid: user.uid,
              plantOnboardingCompleted: settings.plantOnboardingCompleted || false,
              plantState: settings.plantState || null,
              gardenState: gardenState || null,
              purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
              updatedAt: serverTimestamp(),
            };

            const rewardsDocRef = doc(db, "users", user.uid, "rewards", "main");
            const plantSectionDocRef = doc(db, "users", user.uid, "plant_section", "main");

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

            await setDoc(rewardsDocRef, rewardsPayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote rewards subdocument to: ${rewardsDocRef.path}`);

            await setDoc(plantSectionDocRef, plantSectionPayload, { merge: true });
            console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote plant section subdocument to: ${plantSectionDocRef.path}`);
            
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

        const rewardsPayload = {
          uid: user.uid,
          userName: settings.displayName || user.displayName || 'Champion',
          streak: stats.streak || 0,
          bestStreak: stats.bestStreak || 0,
          xp: stats.xp || 0,
          coins: stats.coins || 0,
          weeklyPoints: stats.weeklyPoints || 0,
          weeklyXP: stats.weeklyXP || 0,
          totalPoints: stats.totalPoints || 0,
          trophies: stats.trophies || [],
          pointsByCategory: stats.pointsByCategory || { physical: 0, mental: 0, creative: 0 },
          updatedAt: serverTimestamp(),
          finishedAt: new Date().toISOString(),
        };

        const plantSectionPayload = {
          uid: user.uid,
          plantOnboardingCompleted: settings.plantOnboardingCompleted || false,
          plantState: settings.plantState || null,
          gardenState: gardenState || null,
          purchasedEcosystemItemIds: settings.purchasedEcosystemItemIds || [],
          updatedAt: serverTimestamp(),
        };

        const rewardsDocRef = doc(db, "users", user.uid, "rewards", "main");
        const plantSectionDocRef = doc(db, "users", user.uid, "plant_section", "main");

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

        await setDoc(rewardsDocRef, rewardsPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote rewards subdocument to: ${rewardsDocRef.path}`);

        await setDoc(plantSectionDocRef, plantSectionPayload, { merge: true });
        console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Force sync successfully wrote plant section subdocument to: ${plantSectionDocRef.path}`);

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
