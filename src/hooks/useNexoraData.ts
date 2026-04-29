import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserSettings, UserStats, DailyProgress } from '../types';

const today = new Date().toISOString().split('T')[0];

export function useNexoraData(DEFAULT_SETTINGS: UserSettings, DEFAULT_STATS: UserStats, showToast: (msg: string, type: 'success' | 'error' | 'info') => void) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
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
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        dataLoadedFromFirestore.current = false;
        
        try {
          // Rapid fetch: Get core document first
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
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
          } else {
            console.log("Hooks: Loading existing data");
            const data = userDoc.data();
            
            // Merge defaults for safety
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

            // Parallel fetch sub-collections
            const [spaceDoc, statsDoc, progressDoc] = await Promise.all([
              getDoc(doc(db, 'users', currentUser.uid, 'settings', 'space')),
              getDoc(doc(db, 'users', currentUser.uid, 'stats', 'main')),
              getDoc(doc(db, 'users', currentUser.uid, 'progress', today))
            ]);

            if (spaceDoc.exists()) firestoreSettings.spaceOnboardingCompleted = !!spaceDoc.data().completed;
            if (statsDoc.exists()) {
              const d = statsDoc.data();
              Object.assign(firestoreStats, d);
              if (d.trophies) firestoreStats.trophies = d.trophies;
            }
            if (progressDoc.exists()) setDailyProgress(prev => ({ ...prev, ...progressDoc.data() }));

            setSettings(firestoreSettings);
            setStats(firestoreStats);
            setNeedsOnboarding(data.onboardingCompleted === false);
          }
          dataLoadedFromFirestore.current = true;
          setIsDataReady(true);
        } catch (error) {
          console.error("Hooks: Load critical failure:", error);
          showToast("Offline mode synced. Some features might be restricted.", 'info');
          setIsDataReady(true); // Allow entry even if off-sync for resilience
        }
      } else {
        setUser(null);
        setIsDataReady(false);
        dataLoadedFromFirestore.current = false;
        setSettings(DEFAULT_SETTINGS);
        setStats(DEFAULT_STATS);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Background Sync Effect
  useEffect(() => {
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
      
      const timeout = setTimeout(syncData, 5000); // Debounced sync
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
