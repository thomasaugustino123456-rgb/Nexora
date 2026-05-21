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

  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const dataLoadedFromFirestore = useRef(false);
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
      if (currentUser) {
        const prevUserId = localStorage.getItem("nexora_cached_user");
        if (prevUserId !== currentUser.uid) {
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
          setIsDataReady(false);
          setLoading(true);
        }
        localStorage.setItem("nexora_cached_user", currentUser.uid);
        setUser(currentUser);
      } else {
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
        setUser(null);
        setIsDataReady(false);
        dataLoadedFromFirestore.current = false;
        setNeedsOnboarding(false);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  // Separate effect for standardizing firestore listeners to prevent leaks
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const progressDocRef = doc(db, "users", user.uid, "progress", today);

    // Safety timeout for slow or offline connections
    const timeoutDuration = navigator.onLine ? 8000 : 250;
    const loadingTimeout = setTimeout(() => {
      if (!isDataReady) {
        console.warn(
          "Hooks: Loading timeout reached, forcing ready state for offline use.",
        );
        setIsDataReady(true);
        setLoading(false);
      }
    }, timeoutDuration);

    const unsubUser = onSnapshot(
      userDocRef,
      (docSnap) => {
        clearTimeout(loadingTimeout);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const firestoreSettings = {
            ...DEFAULT_SETTINGS,
            ...data,
            plantState: {
              ...DEFAULT_SETTINGS.plantState,
              ...(data.plantState || {}),
            },
          };

          const firestoreStats = {
            ...DEFAULT_STATS,
            ...(data.stats || {}),
            pointsByCategory: {
              ...DEFAULT_STATS.pointsByCategory,
              ...(data.stats?.pointsByCategory || {}),
            },
            trophies: data.stats?.trophies || [],
          };

          // If the profile exists in Firestore, the user is an existing user.
          // Since their user document exists, they are 100% an existing user and should skip onboarding.
          const isCompleted = true;
          setSettings(firestoreSettings);
          setStats(firestoreStats);
          setNeedsOnboarding(!isCompleted);
          
          if (isCompleted) {
            localStorage.setItem("nexora_onboarding_completed", "true");
          }

          localStorage.setItem(
            "nexora_settings",
            JSON.stringify(firestoreSettings),
          );
          localStorage.setItem("nexora_stats", JSON.stringify(firestoreStats));

          dataLoadedFromFirestore.current = true;
          setIsDataReady(true);
          setLoading(false);
        } else {
          console.log("Hooks: User doc not found, marked as ready (new user).");
          setNeedsOnboarding(true);
          setIsDataReady(true);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Hooks: User snapshot error:", error);
        setIsDataReady(true);
        setLoading(false);
      },
    );

    const unsubProgress = onSnapshot(progressDocRef, (progressSnap) => {
      if (progressSnap.exists()) {
        const pData = progressSnap.data();
        setDailyProgress((prev) => {
          // Only update if dates match and it's actually different
          if (pData.date === today) {
            return { ...prev, ...pData };
          }
          return prev;
        });
      }
    });

    // NEW: Load Ecosystem Shop Items
    const ecoShopRef = collection(db, "users", user.uid, "eco_shop");
    const unsubEcoShop = onSnapshot(ecoShopRef, (snap) => {
      const ecoIds = snap.docs.map((doc) => doc.id);
      if (ecoIds.length > 0) {
        setSettings((prev) => ({
          ...prev,
          purchasedEcosystemItemIds: [
            ...new Set([...(prev.purchasedEcosystemItemIds || []), ...ecoIds]),
          ],
        }));
      }
    });

    return () => {
      unsubUser();
      unsubProgress();
      unsubEcoShop();
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
              ...settings,
              uid: user.uid,
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

    // 5-second debounce for faster background sync
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    if (document.hidden) return; // Don't sync if tab is backgrounded

    syncTimeoutRef.current = setTimeout(syncData, 5000);

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
  };
}
