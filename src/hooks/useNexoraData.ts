import { useState, useEffect, useRef } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserSettings, UserStats, DailyProgress } from "../types";

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

  const [needsOnboarding, setNeedsOnboarding] = useState(!cachedOnboarding);
  const [loadError, setLoadError] = useState<string | null>(null);
  const dataLoadedFromFirestore = useRef(false);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const quotaExceededRef = useRef(false);
  const lastSyncedRef = useRef<string>("");
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.error("Auth persistence failed:", e);
      }
    }
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      const prevUserId = localStorage.getItem("nexora_cached_user");

      if (currentUser) {
        if (prevUserId && prevUserId !== currentUser.uid) {
          console.log("Hooks: Different user detected, resetting caches in-memory and locally.");
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
          setNeedsOnboarding(false);
          dataLoadedFromFirestore.current = false;
          lastLoadedUserIdRef.current = null;
          setIsDataReady(false);
          setLoading(true);
        }
        localStorage.setItem("nexora_cached_user", currentUser.uid);
        setUser(currentUser);
      } else {
        // Only clear caches if they actually had an active user before (explicit sign out).
        // This prevents erasing local caches/onboarding flags during transient startup initialization.
        if (prevUserId) {
          console.log("Hooks: User explicit logout, clearing caches.");
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
        }
        setUser(null);
        setIsDataReady(true);
        dataLoadedFromFirestore.current = false;
        lastLoadedUserIdRef.current = null;
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
      const userDocRef = doc(db, "users", user.uid);
      const progressDocRef = doc(db, "users", user.uid, "progress", today);
      const ecoShopRef = collection(db, "users", user.uid, "eco_shop");

      try {
        const [docSnap, progressSnap, ecoSnap] = await Promise.all([
          getDoc(userDocRef),
          getDoc(progressDocRef),
          getDocs(ecoShopRef),
        ]);

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
          setNeedsOnboarding(false);
          localStorage.setItem("nexora_onboarding_completed", "true");
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

        // Save to state and local cache immediately
        setSettings(firestoreSettings);
        setStats(firestoreStats);
        setDailyProgress(firestoreProgress);

        localStorage.setItem("nexora_settings", JSON.stringify(firestoreSettings));
        localStorage.setItem("nexora_stats", JSON.stringify(firestoreStats));
        localStorage.setItem("nexora_progress", JSON.stringify(firestoreProgress));
        localStorage.setItem(`nexora_progress_${today}`, JSON.stringify(firestoreProgress));

        try {
          const progressCollRef = collection(db, "users", user.uid, "progress");
          const historySnap = await getDocs(progressCollRef);
          historySnap.forEach((doc) => {
            const hData = doc.data();
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
        console.error("Hooks: Error loading initial user data, fallback to cache: ", err);
        if (!isLoaderResolved) {
          if (loadingTimeout) clearTimeout(loadingTimeout);
          isLoaderResolved = true;

          // Check if local cache indicates onboarding is already completed
          const onboardingComp = localStorage.getItem("nexora_onboarding_completed") === "true";
          
          if (!hasCache) {
             console.error("Critical: User has no local cache and Firestore failed. Halting app to prevent data overwrite.");
             setLoadError("A network or server error occurred while retrieving your profile. Please check your connection and try again later.");
             setIsDataReady(false);
             setLoading(false);
             return;
          }

          setNeedsOnboarding(!onboardingComp);
          setIsDataReady(true);
          setLoading(false);
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
          JSON.stringify(lastSyncedData.st) !== JSON.stringify(stats);

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
              level: Math.floor((stats.totalPoints || 0) / 1000) + 1,
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
    if (document.hidden) return; // Don't sync if tab is backgrounded

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
    needsOnboarding,
    setNeedsOnboarding,
    dataLoadedFromFirestore,
    loadError,
  };
}
