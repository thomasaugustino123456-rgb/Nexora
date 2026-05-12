import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        localStorage.setItem('nexora_cached_user', currentUser.uid);
        setUser(currentUser);
        dataLoadedFromFirestore.current = false;
        
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const statsDocRef = doc(db, 'users', currentUser.uid, 'stats', 'main');
          const progressDocRef = doc(db, 'users', currentUser.uid, 'progress', today);

          const [userDoc, statsDoc, progressDoc] = await Promise.all([
            getDoc(userDocRef),
            getDoc(statsDocRef),
            getDoc(progressDocRef)
          ]);
          
          if (!userDoc.exists()) {
            console.log("Hooks: Initializing new user on server...");
            const newUser = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Nexora User',
              email: currentUser.email || '',
              role: 'user',
              onboardingCompleted: false,
              ...DEFAULT_SETTINGS,
              stats: DEFAULT_STATS,
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', currentUser.uid), newUser);
          } else {
            console.log("Hooks: Loading data from Firestore...");
            const data = userDoc.data();
            
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

            if (statsDoc.exists()) {
              Object.assign(firestoreStats, statsDoc.data());
            }

            if (progressDoc.exists()) {
               const pData = progressDoc.data();
               setDailyProgress(prev => ({ ...prev, ...pData }));
            }

            setSettings(firestoreSettings);
            setStats(firestoreStats);
            setNeedsOnboarding(data.onboardingCompleted !== true);
            
            localStorage.setItem('nexora_settings', JSON.stringify(firestoreSettings));
            localStorage.setItem('nexora_stats', JSON.stringify(firestoreStats));
          }
          dataLoadedFromFirestore.current = true;
          setIsDataReady(true);
        } catch (error) {
          console.error("Hooks: Load critical failure:", error);
          showToast("Sync issue: using offline mode.", 'info');
          setIsDataReady(true);
        } finally {
          setLoading(false);
        }
      } else {
        localStorage.removeItem('nexora_cached_user');
        setUser(null);
        setIsDataReady(false);
        dataLoadedFromFirestore.current = false;
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Background Sync Effect with Aggressive Throttling (2 minutes)
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return;

    const currentStateStr = JSON.stringify({
      s: settings,
      st: stats,
      p: { c: dailyProgress.completed, cc: dailyProgress.completionsCount, d: dailyProgress.date }
    });

    if (currentStateStr === lastSyncedRef.current) return;

    const syncData = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        
        // Sync everything in one batch of setDoc calls
        await setDoc(userRef, {
          ...settings,
          uid: user.uid,
          stats: stats,
          isTodayCompleted: dailyProgress.completed,
          updatedAt: serverTimestamp(),
          onboardingCompleted: !needsOnboarding
        }, { merge: true });
        
        await setDoc(doc(db, 'users', user.uid, 'progress', today), dailyProgress, { merge: true });
        
        await setDoc(doc(db, 'leaderboard', user.uid), {
          uid: user.uid,
          displayName: settings.displayName || 'Anonymous',
          photoURL: settings.profilePic || user.photoURL || '',
          streak: stats.streak || 0,
          totalPoints: stats.totalPoints || 0,
          level: Math.floor((stats.totalPoints || 0) / 100) + 1,
          league: settings.league || 'Bronze'
        }, { merge: true });

        lastSyncedRef.current = currentStateStr;
        console.log("Hooks: Optimized Background Sync Complete ✅");
      } catch (e: any) {
        if (e.message?.includes("quota")) {
          showToast("Daily cloud sync limit reached. Data saved locally.", "info");
        } else {
          console.error("Sync error:", e);
        }
      }
    };
    
    // 2-minute debounce for background sync
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(syncData, 120000); 

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
    dataLoadedFromFirestore
  };
}
