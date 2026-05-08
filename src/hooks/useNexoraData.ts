import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserSettings, UserStats, DailyProgress } from '../types';

const today = new Date().toISOString().split('T')[0];

export function useNexoraData(DEFAULT_SETTINGS: UserSettings, DEFAULT_STATS: UserStats, showToast: (msg: string, type: 'success' | 'error' | 'info') => void) {
  // Try to load cached user ID immediately to bypass slow loading screen
  const cachedUserId = localStorage.getItem('nexora_cached_user') || null;
  const [user, setUser] = useState<FirebaseUser | null>(cachedUserId ? { uid: cachedUserId } as FirebaseUser : null);
  const [loading, setLoading] = useState(cachedUserId ? false : true); // Instantly false if cached!
  const [isDataReady, setIsDataReady] = useState(false);

  // Load cached settings/stats immediately if available
  const cachedSettings = localStorage.getItem('nexora_settings') ? JSON.parse(localStorage.getItem('nexora_settings')!) : DEFAULT_SETTINGS;
  const cachedStats = localStorage.getItem('nexora_stats') ? JSON.parse(localStorage.getItem('nexora_stats')!) : DEFAULT_STATS;
  const cachedProgress = localStorage.getItem('nexora_progress') ? JSON.parse(localStorage.getItem('nexora_progress')!) : null;

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

  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const dataLoadedFromFirestore = useRef(false);

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
      // Loading screen goes away immediately if cached, but we still ensure we disable loading for new users
      setLoading(false); 
      
      if (currentUser) {
        // Cache user to instant-load next time
        localStorage.setItem('nexora_cached_user', currentUser.uid);
        setUser(currentUser);
        dataLoadedFromFirestore.current = false;
        
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const spaceDocRef = doc(db, 'users', currentUser.uid, 'settings', 'space');
          const statsDocRef = doc(db, 'users', currentUser.uid, 'stats', 'main');
          const progressDocRef = doc(db, 'users', currentUser.uid, 'progress', today);

          const [userDoc, spaceDoc, statsDoc, progressDoc] = await Promise.all([
            getDoc(userDocRef),
            getDoc(spaceDocRef),
            getDoc(statsDocRef),
            getDoc(progressDocRef)
          ]);
          
          if (!userDoc.exists()) {
            console.log("Hooks: New user setup");
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
            setSettings(DEFAULT_SETTINGS);
            setStats(DEFAULT_STATS);
            setNeedsOnboarding(true);
            
            localStorage.setItem('nexora_settings', JSON.stringify(DEFAULT_SETTINGS));
            localStorage.setItem('nexora_stats', JSON.stringify(DEFAULT_STATS));
            
          } else {
            console.log("Hooks: Loading existing data");
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

            if (spaceDoc.exists()) firestoreSettings.spaceOnboardingCompleted = !!spaceDoc.data().completed;
            if (statsDoc.exists()) {
              const d = statsDoc.data();
              Object.assign(firestoreStats, d);
              if (d.trophies) firestoreStats.trophies = d.trophies;
            }
            if (progressDoc.exists()) {
               setDailyProgress(prev => {
                 const newProgress = { ...prev, ...progressDoc.data() };
                 localStorage.setItem('nexora_progress', JSON.stringify(newProgress));
                 return newProgress as DailyProgress;
               });
            }

            setSettings(firestoreSettings);
            setStats(firestoreStats);
            setNeedsOnboarding(data.onboardingCompleted === false);
            
            localStorage.setItem('nexora_settings', JSON.stringify(firestoreSettings));
            localStorage.setItem('nexora_stats', JSON.stringify(firestoreStats));
          }
          dataLoadedFromFirestore.current = true;
          setIsDataReady(true);
        } catch (error) {
          console.error("Hooks: Load critical failure:", error);
          showToast("Offline mode synced.", 'info');
          setIsDataReady(true);
        }
      } else {
        localStorage.removeItem('nexora_cached_user');
        setUser(null);
        setIsDataReady(false);
        dataLoadedFromFirestore.current = false;
        setSettings(DEFAULT_SETTINGS);
        setStats(DEFAULT_STATS);
      }
    });

    return unsubscribe;
  }, []);

  // Background Sync Effect
  useEffect(() => {
    // Also save to localStorage for instantaneous load next time
    localStorage.setItem('nexora_settings', JSON.stringify(settings));
    localStorage.setItem('nexora_stats', JSON.stringify(stats));
    localStorage.setItem('nexora_progress', JSON.stringify(dailyProgress));

    if (user && isDataReady && dataLoadedFromFirestore.current) {
      const syncData = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            ...settings,
            stats: stats,
            updatedAt: serverTimestamp()
          });
          
          await setDoc(doc(db, 'users', user.uid, 'progress', today), dailyProgress, { merge: true });
        } catch (e) {
          console.error("Sync error:", e);
        }
      };
      
      const timeout = setTimeout(syncData, 5000); 
      return () => clearTimeout(timeout);
    }
  }, [settings, stats, dailyProgress, user, isDataReady]);

  return {
    user,
    loading,
    isDataReady,
    settings,
    setSettings,
    stats,
    setStats,
    dailyProgress,
    setDailyProgress,
    needsOnboarding,
    setNeedsOnboarding,
    dataLoadedFromFirestore
  };
}
