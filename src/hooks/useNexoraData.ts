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

  const [settings, setSettings] = useState<UserSettings>(cachedSettings);
  const [stats, setStats] = useState<UserStats>(cachedStats);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(
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
        },
  );
  const [gardenState, setGardenState] = useState<GardenState>(cachedGarden);

  const [needsOnboarding, setNeedsOnboarding] = useState(!cachedOnboarding);
  const [loadError, setLoadError] = useState<string | null>(null);
  const dataLoadedFromFirestore = useRef(false);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const quotaExceededRef = useRef(false);
  const lastSyncedRef = useRef<string>("");
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      const prevUserId = localStorage.getItem("nexora_cached_user");

      if (currentUser) {
        if (prevUserId && prevUserId !== currentUser.uid) {
          console.log("Hooks: Different user detected, resetting caches in-memory and locally.");
          // Clear sync blockers and caches first
          dataLoadedFromFirestore.current = false;
          lastSyncedRef.current = "";
          lastLoadedUserIdRef.current = null;
          setIsDataReady(false);
          setLoading(true);

          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("nexora_") && key !== "nexora_cached_user") {
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
          lastSyncedRef.current = "";
          lastLoadedUserIdRef.current = null;

          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("nexora_")) {
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
        lastSyncedRef.current = "";
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

    // Safety timeout: if Firestore takes too long (or user is offline), immediately open using local cached data!
    // This stops the app from getting stuck on the SplashScreen indefinitely and makes loading immediate.
    // ONLY apply timeout if we have local cache to fall back on. If we just logged in (no cache),
    // we MUST wait for Firestore, otherwise returning users are forced into Onboarding!
    let loadingTimeout: NodeJS.Timeout | null = null;
    
    if (hasCache) {
      const timeoutDuration = navigator.onLine ? 3000 : 300;
      loadingTimeout = setTimeout(() => {
        if (!isLoaderResolved) {
          console.warn("Hooks: Loading timeout reached, letting user open with cached local data.");
          setIsDataReady(true);
          setLoading(false);
        }
      }, timeoutDuration);
    }

    const loadData = async () => {
      // If offline and cache is present, bypass Firestore completely for instant rendering
      if (!navigator.onLine && hasCache) {
        console.log("Hooks: Offline mode detected with active cache. Directly using cached state.");
        setNeedsOnboarding(false);
        setIsDataReady(true);
        setLoading(false);
        dataLoadedFromFirestore.current = true;
        lastLoadedUserIdRef.current = user.uid;
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const progressDocRef = doc(db, "users", user.uid, "progress", today);
      const ecoShopRef = collection(db, "users", user.uid, "eco_shop");

      const getDocWithCacheFallback = async (docRef: any) => {
        if (!navigator.onLine) {
          try {
            return await getDocFromCache(docRef);
          } catch (e) {
            console.warn("getDocFromCache failed, falling back to network getDoc:", e);
          }
        }
        return await getDoc(docRef);
      };

      const getDocsWithCacheFallback = async (queryRef: any) => {
        if (!navigator.onLine) {
          try {
            return await getDocsFromCache(queryRef);
          } catch (e) {
            console.warn("getDocsFromCache failed, falling back to network getDocs:", e);
          }
        }
        return await getDocs(queryRef);
      };

      try {
        const timeoutDuration = hasCache ? 6000 : 20000;
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
          
          console.log("Hooks: Core Firestore data loaded successfully.");
        } catch (fetchErr) {
          console.error("Hooks: Failed fetching initial user collections:", fetchErr);
          throw fetchErr;
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

          if (data.onboardingCompleted === true) {
            setNeedsOnboarding(false);
            localStorage.setItem("nexora_onboarding_completed", "true");
          } else {
            console.log("Hooks: User doc exists but onboarding is not completed. Showing onboarding.");
            setNeedsOnboarding(true);
          }
        } else {
          const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
          if (onboardingComp) {
            console.log("Hooks: User doc not found on Firestore, but onboarding completed locally. Skipping onboarding.");
            setNeedsOnboarding(false);
          } else {
            console.log("Hooks: User doc not found on Firestore. Introducing onboarding.");
            setNeedsOnboarding(true);
          }
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

        // Initialize lastSyncedRef with the exact loaded structure before enabling sync.
        // This ensures the next background sync check sees full identity and returns early,
        // preventing any race overrides of defaulted memory states!
        lastSyncedRef.current = JSON.stringify({
          s: firestoreSettings,
          st: firestoreStats,
          p: {
            c: firestoreProgress.completed,
            cc: firestoreProgress.completionsCount,
            d: firestoreProgress.date,
          },
          g: firestoreGarden,
        });

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

        // Successfully loaded. Safe to sync background changes now!
        dataLoadedFromFirestore.current = true;
        lastLoadedUserIdRef.current = user.uid;
        if (loadingTimeout) clearTimeout(loadingTimeout);
        isLoaderResolved = true;
        setIsDataReady(true);
        setLoading(false);
      } catch (err: any) {
        const isOfflineReason = !navigator.onLine || err?.message?.includes("offline") || err?.message?.includes("timed out") || err?.code === "unavailable";
        if (isOfflineReason) {
          console.warn("Hooks: Firestore backend unreachable.");
        } else {
          console.error("Hooks: Error loading initial user data: ", err);
        }

        if (!isLoaderResolved) {
          if (loadingTimeout) clearTimeout(loadingTimeout);
          isLoaderResolved = true;

          if (!hasCache) {
            console.warn("Hooks: User has no local cache and Firestore failed. Showing Connection Failed screen to protect data.");
            setLoadError("We couldn't connect to our servers to load your profile. Please check your internet connection and try again.");
          } else {
            const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
            setNeedsOnboarding(!onboardingComp);
            setIsDataReady(true);
            setLoading(false);
          }
        }
      }
    };

    loadData();

    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [user]);

  // Background Sync Effect with Aggressive Throttling (Optimized)
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;

    const syncData = async () => {
      if (quotaExceededRef.current) return;

      const currentStateStr = JSON.stringify({
        s: settings,
        st: stats,
        p: {
          c: dailyProgress.completed,
          cc: dailyProgress.completionsCount,
          d: dailyProgress.date,
        },
        g: gardenState,
      });

      if (currentStateStr === lastSyncedRef.current) return;

      try {
        const userRef = doc(db, "users", user.uid);

        // 1. Check if core settings/stats changed
        const lastSyncedData = lastSyncedRef.current
          ? JSON.parse(lastSyncedRef.current)
          : null;
        const coreChanged =
          !lastSyncedData ||
          JSON.stringify(lastSyncedData.s) !== JSON.stringify(settings) ||
          JSON.stringify(lastSyncedData.st) !== JSON.stringify(stats) ||
          JSON.stringify(lastSyncedData.g) !== JSON.stringify(gardenState);

        if (coreChanged) {
          await setDoc(
            userRef,
            {
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
            },
            { merge: true },
          );
        }

        // 2. Sync progress always attempts, or can be throttled too
        await setDoc(
          doc(db, "users", user.uid, "progress", today),
          dailyProgress,
          { merge: true },
        );

        // 3. Leaderboard sync (only if streak, points, name or photo changed)
        const lbChanged =
          !lastSyncedData ||
          lastSyncedData.st?.totalPoints !== stats.totalPoints ||
          lastSyncedData.st?.streak !== stats.streak ||
          lastSyncedData.s?.displayName !== settings.displayName ||
          lastSyncedData.s?.profilePic !== settings.profilePic;

        if (lbChanged) {
          await setDoc(
            doc(db, "leaderboard", user.uid),
            {
              uid: user.uid,
              displayName: settings.displayName || "Anonymous",
              photoURL: settings.profilePic || user.photoURL || "",
              streak: stats.streak || 0,
              totalPoints: stats.totalPoints || 0,
              weeklyXP: stats.weeklyXP || 0,
              weeklyPoints: stats.weeklyPoints || 0,
              level: stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1,
              league: settings.league || "Bronze",
            },
            { merge: true },
          );
        }

        lastSyncedRef.current = currentStateStr;
        console.log("Hooks: Optimized Background Sync Complete ✅");
      } catch (e: any) {
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
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    if (quotaExceededRef.current) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
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
        },
        { merge: true },
      );
      await setDoc(
        doc(db, "users", user.uid, "progress", today),
        dailyProgress,
        { merge: true },
      );
      await setDoc(
        doc(db, "leaderboard", user.uid),
        {
          uid: user.uid,
          displayName: settings.displayName || "Anonymous",
          photoURL: settings.profilePic || user.photoURL || "",
          streak: stats.streak || 0,
          totalPoints: stats.totalPoints || 0,
          weeklyXP: stats.weeklyXP || 0,
          weeklyPoints: stats.weeklyPoints || 0,
          level: stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1,
          league: settings.league || "Bronze",
        },
        { merge: true },
      );
      console.log("Hooks: Manual/Force Sync complete ✅");
    } catch (e: any) {
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
