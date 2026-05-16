import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserSettings, UserStats, DailyProgress } from '../types';

const today = new Date().toISOString().split('T')[0];

export function useNexoraData(DEFAULT_SETTINGS: UserSettings, DEFAULT_STATS: UserStats, showToast: (msg: string, type: 'success' | 'error' | 'info') => void) {
  // Try to load cached user ID immediately to bypass slow loading screen
  const cachedUserId = localStorage.getItem('nexora_cached_user') || null;
  const [user, setUser] = useState<FirebaseUser | null>(cachedUserId ? { uid: cachedUserId } as FirebaseUser : null);
  const [loading, setLoading] = useState(cachedUserId ? false : true); 
  const [isDataReady, setIsDataReady] = useState(false);

  // Load cached settings/stats immediately if available
  const getCachedJson = (key: string, defaultValue: any) => {
    try {
      const val = localStorage.getItem(key);
      if (!val || val === 'undefined') return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`Failed to parse cache for ${key}:`, e);
      return defaultValue;
    }
  };

  const cachedSettings = getCachedJson('nexora_settings', DEFAULT_SETTINGS);
  const cachedStats = getCachedJson('nexora_stats', DEFAULT_STATS);
  const cachedProgress = getCachedJson('nexora_progress', null);
  const cachedOnboarding = localStorage.getItem('nexora_onboarding_completed') === 'true';

  const [settings, setSettings] = useState<UserSettings>(cachedSettings);
  const [stats, setStats] = useState<UserStats>(cachedStats);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(cachedProgress?.date === today ? cachedProgress : {
    date: today,
    completed: false,
    pushupsDone: false,
    waterDrank: 0,
    breathingDone: false,
    drawingDone: false,
    footballDone: false,
    bubblesDone: false,
    completionsCount: 0
  });

  const [needsOnboarding, setNeedsOnboarding] = useState(!cachedOnboarding && !!cachedUserId);
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
        localStorage.setItem('nexora_cached_user', currentUser.uid);
        setUser(currentUser);
      } else {
        localStorage.removeItem('nexora_cached_user');
        setUser(null);
        setIsDataReady(false);
        dataLoadedFromFirestore.current = false;
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  // Separate effect for standardizing firestore listeners to prevent leaks
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const progressDocRef = doc(db, 'users', user.uid, 'progress', today);

    // Safety timeout for slow connections
    const loadingTimeout = setTimeout(() => {
      if (!isDataReady) {
        console.warn("Hooks: Loading timeout reached, forcing ready state for offline use.");
        setIsDataReady(true);
        setLoading(false);
      }
    }, 15000); // 15s window for slow first loads

    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      clearTimeout(loadingTimeout);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const firestoreSettings = { 
          ...DEFAULT_SETTINGS, 
          ...data,
          plantState: { ...DEFAULT_SETTINGS.plantState, ...(data.plantState || {}) }
        };
        
        const firestoreStats = { 
          ...DEFAULT_STATS, 
          ...(data.stats || {}),
          pointsByCategory: { ...DEFAULT_STATS.pointsByCategory, ...(data.stats?.pointsByCategory || {}) },
          trophies: data.stats?.trophies || []
        };

        setSettings(firestoreSettings);
        setStats(firestoreStats);
        setNeedsOnboarding(data.onboardingCompleted !== true);
        
        localStorage.setItem('nexora_settings', JSON.stringify(firestoreSettings));
        localStorage.setItem('nexora_stats', JSON.stringify(firestoreStats));

        dataLoadedFromFirestore.current = true;
        setIsDataReady(true);
        setLoading(false);
      } else {
        console.log("Hooks: User doc not found, marked as ready (new user).");
        setIsDataReady(true);
        setLoading(false);
      }
    }, (error) => {
      console.error("Hooks: User snapshot error:", error);
      setIsDataReady(true);
      setLoading(false);
    });

    const unsubProgress = onSnapshot(progressDocRef, (progressSnap) => {
      if (progressSnap.exists()) {
        const pData = progressSnap.data();
        setDailyProgress(prev => {
          // Only update if dates match and it's actually different
          if (pData.date === today) {
             return { ...prev, ...pData };
          }
          return prev;
        });
      }
    });

    return () => {
      unsubUser();
      unsubProgress();
    };
  }, [user]);

  // Background Sync Effect with Aggressive Throttling (Optimized)
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;

    const currentStateStr = JSON.stringify({
      s: settings,
      st: stats,
      p: { c: dailyProgress.completed, cc: dailyProgress.completionsCount, d: dailyProgress.date }
    });

    if (currentStateStr === lastSyncedRef.current) return;

    const syncData = async () => {
      if (quotaExceededRef.current) return;
      try {
        const userRef = doc(db, 'users', user.uid);
        
        // 1. Check if core settings/stats changed
        const coreChanged = lastSyncedRef.current === "" || 
                           JSON.parse(lastSyncedRef.current).s !== JSON.stringify(settings) ||
                           JSON.parse(lastSyncedRef.current).st !== JSON.stringify(stats);

        if (coreChanged) {
          await setDoc(userRef, {
            ...settings,
            uid: user.uid,
            stats: stats,
            isTodayCompleted: dailyProgress.completed,
            updatedAt: serverTimestamp(),
            onboardingCompleted: !needsOnboarding
          }, { merge: true });
        }
        
        // 2. Sync progress only if completion state changed
        await setDoc(doc(db, 'users', user.uid, 'progress', today), dailyProgress, { merge: true });
        
        // 3. Leaderboard sync (only if streak or points changed)
        const lbChanged = lastSyncedRef.current === "" || 
                          JSON.parse(lastSyncedRef.current).st?.totalPoints !== stats.totalPoints ||
                          JSON.parse(lastSyncedRef.current).st?.streak !== stats.streak;

        if (lbChanged) {
          await setDoc(doc(db, 'leaderboard', user.uid), {
            uid: user.uid,
            displayName: settings.displayName || 'Anonymous',
            photoURL: settings.profilePic || user.photoURL || '',
            streak: stats.streak || 0,
            totalPoints: stats.totalPoints || 0,
            level: Math.floor((stats.totalPoints || 0) / 1000) + 1,
            league: settings.league || 'Bronze'
          }, { merge: true });
        }

        lastSyncedRef.current = currentStateStr;
        console.log("Hooks: Optimized Background Sync Complete ✅");
      } catch (e: any) {
        if (e.message?.includes("quota") || e.code === 'resource-exhausted') {
          quotaExceededRef.current = true;
          showToast("Nexus Quota Reached. Local cache active. 🛡️", "info");
        } else {
          console.error("Sync error:", e);
        }
      }
    };
    
    // 5-minute debounce for background sync
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    if (document.hidden) return; // Don't sync if tab is backgrounded
    
    syncTimeoutRef.current = setTimeout(syncData, 300000); 

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [settings, stats, dailyProgress.completed, dailyProgress.completionsCount, dailyProgress.date, user, isDataReady, needsOnboarding]);

  const onUpdateSettings = (update: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setSettings(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      localStorage.setItem('nexora_settings', JSON.stringify(next));
      return next;
    });
  };

  const onUpdateStats = (update: UserStats | ((prev: UserStats) => UserStats)) => {
    setStats(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      localStorage.setItem('nexora_stats', JSON.stringify(next));
      return next;
    });
  };

  const onUpdateDailyProgress = (update: DailyProgress | ((prev: DailyProgress) => DailyProgress)) => {
    setDailyProgress(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      localStorage.setItem('nexora_progress', JSON.stringify({ ...next, date: today }));
      return next;
    });
  };

  const syncEcosystemPurchase = async (itemId: string, purchased: boolean) => {
    if (!user) return;
    try {
      const itemRef = doc(db, 'users', user.uid, 'plant_eco_items', itemId);
      await setDoc(itemRef, {
        id: itemId,
        purchasedAt: new Date().toISOString(),
        active: true
      }, { merge: true });
      
      // Also trigger a general sync for settings
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        purchasedEcosystemItemIds: purchased ? [...(settings.purchasedEcosystemItemIds || []), itemId] : settings.purchasedEcosystemItemIds,
        activeEcosystemItemIds: [...(settings.activeEcosystemItemIds || []), itemId],
        updatedAt: serverTimestamp()
      });
      lastSyncedRef.current = ""; // Force next background sync to re-evaluate
    } catch (e) {
      console.error("Shop sync error:", e);
    }
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
    syncEcosystemPurchase
  };
}
