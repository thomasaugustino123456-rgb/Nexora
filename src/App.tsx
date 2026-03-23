import React, { useState, useEffect, useRef } from 'react';
import { Home, BarChart2, User, CheckCircle2, Droplets, Wind, Palette, Flame, Star, ChevronRight, Settings, X, Pen, Pencil, Eraser, Trophy as TrophyIcon, Zap, Brain, Heart, Target, Camera, Upload, Bell, Volume2, Download, Trash2, Save, LogOut } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserSettings, UserStats, DailyProgress, Screen, ChallengeStep, Trophy } from './types';
import { Mascot, MascotMood } from './components/Mascot';
import { PushupMascot } from './components/PushupMascot';
import { WaterMascot } from './components/WaterMascot';
import { BreathingMascot } from './components/BreathingMascot';
import { ArtistMascot } from './components/ArtistMascot';
import { Calendar, StatsCharts } from './components/Dashboard';
import { ShopScreen } from './components/ShopScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { GoldenTrophy, IceTrophy, BrokenTrophy, playTrophySound } from './components/Trophies';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { auth, db, messaging, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, getDocFromServer } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { OnboardingScreen } from './components/OnboardingScreen';

function HappyMascot({ size = 32 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ 
        scale: 1, 
        y: [0, -20, 0],
      }}
      transition={{ 
        scale: { type: "spring", damping: 12 },
        y: { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
      }}
      className="flex flex-col items-center gap-2 mb-4"
    >
      <div className={`w-${size} h-${size} relative`}>
        <Mascot className="w-full h-full drop-shadow-lg" />
      </div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-black shadow-lg"
      >
        AWESOME! 🌟
      </motion.div>
    </motion.div>
  );
}

const DEFAULT_SETTINGS: UserSettings = {
  pushupsGoal: 5,
  waterGoal: 2,
  reminderTime: '09:00',
  displayName: 'Nexora User',
  themeColor: '#3b82f6',
  soundEnabled: true,
  notificationsEnabled: true,
  showQuotes: true,
  unitSystem: 'metric',
};

const DEFAULT_STATS: UserStats = {
  streak: 0,
  bestStreak: 0,
  totalPoints: 0,
  totalCompletedDays: 0,
  lastCompletedDate: null,
  currentChallengeIndex: 0,
  trophies: [],
  pointsByCategory: {
    physical: 0,
    mental: 0,
    creative: 0,
  },
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [challengeStep, setChallengeStep] = useState<ChallengeStep>('pushups');
  const [viewingTrophy, setViewingTrophy] = useState<Trophy | null>(null);
  const [settings, setSettings] = useLocalStorage<UserSettings>('nexora_settings', DEFAULT_SETTINGS);
  const [stats, setStats] = useLocalStorage<UserStats>('nexora_stats', DEFAULT_STATS);
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [earnedTrophyToday, setEarnedTrophyToday] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmError, setFcmError] = useState<string | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: today,
    completed: false,
    pushupsDone: false,
    waterDrank: 0,
    breathingDone: false,
    drawingDone: false,
    footballDone: false,
    bubblesDone: false,
  });

  const setupFCM = async () => {
    console.log('FCM: Starting setup...');
    setFcmError(null);
    try {
      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('FCM: Notification permission denied.');
          setFcmError('PERMISSION_DENIED');
          return;
        }
      }

      const m = await messaging();
      if (!m) {
        console.log('FCM: Messaging not supported in this browser.');
        setFcmError('NOT_SUPPORTED');
        return;
      }
      
      // Ensure service worker is ready
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('FCM: Service Worker ready:', registration.scope);
        
        const token = await getToken(m, {
          vapidKey: 'BF2tHGVbbJHc3wxlE98atQFPU1TRqX3shN0bhSsaNf-UxdDxgoj25zLhpttoeDsrjQ8l24cnysfF-eyzH3P7baw',
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          console.log('FCM Device Token:', token);
          setFcmToken(token);
        } else {
          console.log('FCM: No token received.');
          setFcmError('NO_TOKEN');
        }
      } else {
        setFcmError('NO_SW');
      }
    } catch (error: any) {
      console.error('Error setting up FCM:', error);
      setFcmError(error.message || 'UNKNOWN_ERROR');
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallButton(true);
      console.log('PWA: beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (!isStandalone && isIOS) {
      // For iOS, we can't use beforeinstallprompt, so we show a custom guide
      // But maybe not immediately on every load to avoid annoyance
      const hasSeenGuide = localStorage.getItem('nexora_ios_guide_seen');
      if (!hasSeenGuide) {
        setShowIOSInstallGuide(true);
      }
    }

    // Request notification permission on mount if supported
    if ('Notification' in window && Notification.permission === 'default') {
      // Show a friendly message first? (Optional, but user asked for it)
      // For simplicity, we just request it.
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('PWA: Notification permission granted');
          setupFCM();
        }
      });
    } else if (Notification.permission === 'granted') {
      setupFCM();
    }

    // Smart In-App Reminder: Check last active time
    const lastActive = localStorage.getItem('nexora_last_active');
    const now = new Date().getTime();
    if (lastActive) {
      const lastActiveTime = parseInt(lastActive);
      const diffHours = (now - lastActiveTime) / (1000 * 60 * 60);
      if (diffHours > 24) {
        setShowWelcomeBack(true);
      }
    }
    localStorage.setItem('nexora_last_active', now.toString());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setupFCM();
    }
  }, [user]);

  // Daily Reminder Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!settings.notificationsEnabled || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTimeStr === settings.reminderTime) {
        const lastReminderDate = localStorage.getItem('nexora_last_reminder_date');
        const todayStr = now.toISOString().split('T')[0];

        if (lastReminderDate !== todayStr) {
          new Notification('Nexora 🔥', {
            body: 'Hey 👋 Ready for today’s challenge?',
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          localStorage.setItem('nexora_last_reminder_date', todayStr);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [settings.notificationsEnabled, settings.reminderTime]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore: Connection test successful");
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
        // Skip logging for other errors, as this is simply a connection test.
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true); // Prevent flashing home screen while checking profile
        setUser(currentUser);
        
        const path = `users/${currentUser.uid}`;
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (!userDoc.exists()) {
            const newUser = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Nexora User',
              email: currentUser.email || '',
              role: 'user',
              onboardingCompleted: false
            };
            await setDoc(doc(db, 'users', currentUser.uid), newUser);
            setNeedsOnboarding(true);
          } else {
            setNeedsOnboarding(userDoc.data().onboardingCompleted === false);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`nexora_progress_${today}`);
    if (saved) {
      setDailyProgress(JSON.parse(saved));
    }
  }, [today]);

  useEffect(() => {
    localStorage.setItem(`nexora_progress_${today}`, JSON.stringify(dailyProgress));
    
    // Update history whenever daily progress changes
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('nexora_progress_'));
    const allHistory = allKeys.map(k => JSON.parse(localStorage.getItem(k) || '{}'))
      .sort((a, b) => a.date.localeCompare(b.date));
    setHistory(allHistory);
  }, [dailyProgress, today]);

  // Trophy degradation logic
  useEffect(() => {
    const checkTrophies = () => {
      setStats((prevStats) => {
        const now = Date.now();
        let changed = false;
        const trophies = prevStats.trophies || [];
        const updatedTrophies = trophies.map(t => {
          const earnedTime = new Date(t.earnedDate).getTime();
          const daysSince = (now - earnedTime) / (1000 * 60 * 60 * 24);
          
          if (t.type === 'golden' && daysSince >= 2) {
            changed = true;
      if (settings.soundEnabled) playTrophySound('ice');
            return { ...t, type: 'ice' as const, lastUpdated: new Date().toISOString() };
          }
          if (t.type === 'ice' && daysSince >= 3) {
            changed = true;
      if (settings.soundEnabled) playTrophySound('broken');
            return { ...t, type: 'broken' as const, lastUpdated: new Date().toISOString() };
          }
          return t;
        });
        
        if (changed) {
          return { ...prevStats, trophies: updatedTrophies };
        }
        return prevStats;
      });
    };

    const timer = setTimeout(checkTrophies, 2000); // Check shortly after load
    return () => clearTimeout(timer);
  }, []); // Run once on mount

  const handleCompleteChallenge = () => {
    const isNewDay = stats.lastCompletedDate !== today;
    
    if (isNewDay) {
      console.log("Awarding new trophy for today!");
      if (settings.soundEnabled) playTrophySound('golden');
      setEarnedTrophyToday(true);
    } else {
      console.log("Already completed today, no new trophy.");
      setEarnedTrophyToday(false);
    }

    setStats((prevStats) => {
      const newStats = {
        ...prevStats,
        totalPoints: prevStats.totalPoints + 10,
        pointsByCategory: {
          physical: (prevStats.pointsByCategory?.physical || 0) + 4,
          mental: (prevStats.pointsByCategory?.mental || 0) + 4,
          creative: (prevStats.pointsByCategory?.creative || 0) + 2,
        }
      };

      if (isNewDay) {
        const newStreak = prevStats.lastCompletedDate === getYesterday() ? prevStats.streak + 5 : 5;
        
        // Apply Streak Protection effect if purchased
        const hasStreakProtection = settings.purchasedItems?.includes('streak-protection');
        const finalStreak = hasStreakProtection ? newStreak : newStreak; // Placeholder for actual protection logic
        
        newStats.streak = finalStreak;
        newStats.bestStreak = Math.max(prevStats.bestStreak || 0, finalStreak);
        newStats.totalCompletedDays = prevStats.totalCompletedDays + 1;
        newStats.lastCompletedDate = today;
        
        // Apply Double Points effect if purchased
        const hasDoublePoints = settings.purchasedItems?.includes('double-points');
        newStats.totalPoints = newStats.totalPoints + (hasDoublePoints ? 10 : 5);

        // Award Golden Trophy for finishing all challenges
        const newTrophy: Trophy = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'golden',
          earnedDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        newStats.trophies = [newTrophy, ...(prevStats.trophies || [])];
      }
      return newStats;
    });

    setDailyProgress({ 
      ...dailyProgress, 
      completed: true,
      pushupsDone: true,
      breathingDone: true,
      drawingDone: true,
      footballDone: true,
      bubblesDone: true
    });
    setChallengeStep('completion');
  };

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      await signOut(auth);
      console.log("Sign out successful");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-blue-900/60 font-bold animate-pulse">Loading Nexora...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <AuthScreen onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  if (needsOnboarding) {
    return <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} settings={settings} setSettings={setSettings} />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center overflow-x-hidden"
      style={{ '--accent-color': settings.themeColor } as React.CSSProperties}
    >
      {/* Sparkles Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="sparkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              '--duration': `${Math.random() * 3 + 2}s`
            } as any}
          />
        ))}
      </div>

      {/* Background Mascot Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 opacity-[0.03]">
        <img 
          src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
          alt="" 
          className="w-[150%] max-w-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* PWA Install Button (Android/Chrome) */}
      <AnimatePresence>
        {showInstallButton && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4"
          >
            <div className="bg-white p-4 rounded-3xl shadow-2xl border-2 border-indigo-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Download size={24} />
                </div>
                <div>
                  <h4 className="font-black text-blue-900 leading-tight text-sm">Install Nexora App</h4>
                  <p className="text-[10px] text-blue-900/40 font-bold">Get the full experience on your home screen!</p>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              >
                INSTALL NOW
              </button>
              <button 
                onClick={() => setShowInstallButton(false)}
                className="w-full text-[10px] font-black text-blue-900/40 hover:text-blue-900/60"
              >
                NOT NOW
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Install Guide */}
      <AnimatePresence>
        {showIOSInstallGuide && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-end justify-center">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[40px] p-8 pb-12 space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-16 h-1.5 bg-blue-900/10 rounded-full" />
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-indigo-50 rounded-[28px] flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                  <img 
                    src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
                    alt="Logo" 
                    className="w-14 h-14 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-2xl font-black text-blue-900">Add to Home Screen</h3>
                <p className="text-blue-900/60 font-medium">Install Nexora on your iPhone for the best experience.</p>
              </div>

              <div className="space-y-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-900 font-black text-sm">1</div>
                  <p className="text-sm font-bold text-blue-900/80">Tap the <span className="text-blue-600">Share</span> button in Safari</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-900 font-black text-sm">2</div>
                  <p className="text-sm font-bold text-blue-900/80">Scroll down and tap <span className="text-blue-600">"Add to Home Screen"</span></p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowIOSInstallGuide(false);
                  localStorage.setItem('nexora_ios_guide_seen', 'true');
                }}
                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-transform"
              >
                GOT IT!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Welcome Back Popup */}
      <AnimatePresence>
        {showWelcomeBack && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Mascot className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-blue-900">Hey 👋</h3>
                <p className="text-blue-900/60 font-medium">You missed yesterday. Let’s get back on track 🔥</p>
              </div>
              <button 
                onClick={() => setShowWelcomeBack(false)}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-colors"
              >
                Let's Go!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl flex flex-col min-h-screen relative z-10 mx-auto">
        
        {activeScreen !== 'challenge' && (
          <header className="px-6 pt-12 pb-4 flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <img 
                src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
                alt="Nexora Logo" 
                className="w-20 h-20 object-contain"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-4xl font-bold text-blue-900/80 tracking-tight">Nexora</h1>
            </div>
            <button 
              onClick={() => setActiveScreen('settings')}
              className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors"
            >
              <Settings size={24} />
            </button>
          </header>
        )}

        <main className="flex-1 flex flex-col px-4 sm:px-6 pb-32">
          <AnimatePresence mode="wait">
            {activeScreen === 'home' && (
              <HomeScreen 
                stats={stats} 
                onStartChallenge={() => {
                  setChallengeStep('pushups');
                  setActiveScreen('challenge');
                }}
                isCompletedToday={dailyProgress.completed}
                dailyProgress={dailyProgress}
                settings={settings}
                history={history}
              />
            )}
            {activeScreen === 'progress' && (
              <ProgressScreen stats={stats} history={history} settings={settings} setSettings={setSettings} />
            )}
            {activeScreen === 'profile' && (
              <ProfileScreen settings={settings} setSettings={setSettings} stats={stats} user={user} />
            )}
            {activeScreen === 'settings' && (
              <SettingsScreen 
                settings={settings} 
                setSettings={setSettings} 
                onBack={() => setActiveScreen('home')} 
                onLogout={handleLogout} 
                fcmToken={fcmToken} 
                fcmError={fcmError}
                onRetryFCM={setupFCM}
              />
            )}
            {activeScreen === 'shop' && (
              <ShopScreen 
                streak={stats.streak}
                purchasedItems={settings.purchasedItems || []}
                onBuy={(item) => {
                  setSettings(prev => ({
                    ...prev,
                    purchasedItems: [...(prev.purchasedItems || []), item.id]
                  }));
                  setStats(prev => ({
                    ...prev,
                    streak: prev.streak - item.price
                  }));
                }}
                onBack={() => setActiveScreen('home')}
              />
            )}
            {activeScreen === 'library' && (
              <LibraryScreen
                settings={settings}
                stats={stats}
                onBack={() => setActiveScreen('home')}
                onPlayChallenge={(challengeId) => {
                  setChallengeStep(challengeId);
                  setActiveScreen('challenge');
                }}
                onViewTrophy={(trophy) => {
                  setViewingTrophy(trophy);
                }}
              />
            )}
            {activeScreen === 'challenge' && (
              <ChallengeFlow 
                step={challengeStep} 
                setStep={setChallengeStep} 
                settings={settings}
                setSettings={setSettings}
                dailyProgress={dailyProgress}
                setDailyProgress={setDailyProgress}
                onFinish={handleCompleteChallenge}
                onExit={() => setActiveScreen('home')}
                earnedTrophyToday={earnedTrophyToday}
              />
            )}
          </AnimatePresence>
        </main>

        {activeScreen !== 'challenge' && (
          <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none">
            <nav className="glass-card px-8 py-4 flex items-center gap-12 pointer-events-auto">
              <NavButton 
                active={activeScreen === 'home'} 
                onClick={() => setActiveScreen('home')} 
                icon={<Home size={24} />} 
                label="Home"
              />
              <NavButton 
                active={activeScreen === 'progress'} 
                onClick={() => setActiveScreen('progress')} 
                icon={<BarChart2 size={24} />} 
                label="Progress"
              />
              <NavButton 
                active={activeScreen === 'profile'} 
                onClick={() => setActiveScreen('profile')} 
                icon={<User size={24} />} 
                label="Profile"
              />
              <NavButton 
                active={activeScreen === 'shop'} 
                onClick={() => setActiveScreen('shop')} 
                icon={<Star size={24} />} 
                label="Shop"
              />
              <NavButton 
                active={activeScreen === 'library'} 
                onClick={() => setActiveScreen('library')} 
                icon={<TrophyIcon size={24} />} 
                label="Library"
              />
            </nav>
          </div>
        )}

        {viewingTrophy && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setViewingTrophy(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-24 h-24">
                {viewingTrophy.type === 'golden' && <GoldenTrophy />}
                {viewingTrophy.type === 'ice' && <IceTrophy />}
                {viewingTrophy.type === 'broken' && <BrokenTrophy />}
              </div>
              <h2 className="text-2xl font-black capitalize">{viewingTrophy.type} Trophy</h2>
              <p className="text-sm text-blue-900/60">Earned on {format(parseISO(viewingTrophy.earnedDate), 'MMMM d, yyyy')}</p>
              <button 
                onClick={() => setViewingTrophy(null)}
                className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg font-bold"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'scale-110' : 'text-blue-900/30 hover:text-blue-900/50'}`}
      style={active ? { color: 'var(--accent-color)' } : {}}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function HomeScreen({ stats, onStartChallenge, isCompletedToday, dailyProgress, settings, history }: { 
  stats: UserStats, 
  onStartChallenge: () => void, 
  isCompletedToday: boolean,
  dailyProgress: DailyProgress,
  settings: UserSettings,
  history: DailyProgress[]
}) {
  const trophies = stats.trophies || [];
  const latestTrophy = trophies[0];
  const quotes = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it."
  ];
  const quote = quotes[new Date().getDay() % quotes.length];

  // Mascot Interaction State
  const [tapCount, setTapCount] = useState(0);
  const mascotControls = useAnimationControls();

  // Calming down state
  const [lastY, setLastY] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);

  // Determine Mascot Mood
  let mascotMood: MascotMood = 'neutral';
  if (tapCount >= 6) {
    mascotMood = 'boiling';
  } else if (tapCount >= 5) {
    mascotMood = 'angry';
  } else if (tapCount > 0) {
    mascotMood = 'happy';
  }

  const triggerJump = async () => {
    await mascotControls.start({ y: -20, transition: { type: "spring", stiffness: 400, damping: 10 } });
    await mascotControls.start({ y: 0, transition: { type: "spring", stiffness: 400, damping: 10 } });
  };

  const handleMascotTap = () => {
    setTapCount(prev => prev + 1);
    if (tapCount < 5) {
      triggerJump();
    }
  };

  const handleMascotPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (tapCount >= 5) {
      if (lastY !== null) {
        const deltaY = Math.abs(e.clientY - lastY);
        if (deltaY > 15) { // significant vertical movement
          setMoveCount(prev => {
            const newCount = prev + 1;
            if (newCount > 8) {
              setTapCount(0); // calm down
              setLastY(null);
              return 0;
            }
            return newCount;
          });
          setLastY(e.clientY);
        }
      } else {
        setLastY(e.clientY);
      }
    }
  };

  const handleMascotPointerLeave = () => {
    setLastY(null);
    setMoveCount(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center pt-4 gap-12 w-full max-w-4xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 w-full">
        <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full" />
          <motion.div animate={mascotControls} className="w-56 h-56 lg:w-72 lg:h-72 relative z-10">
            <Mascot 
              className="w-full h-full drop-shadow-2xl" 
              mood={mascotMood}
              onClick={handleMascotTap}
              onPointerMove={handleMascotPointerMove}
              onPointerLeave={handleMascotPointerLeave}
            />
          </motion.div>
        </div>

        <div className="flex flex-col gap-6 w-full max-w-md">
          <div className="glass-card w-full p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-blue-900/80">Hey 👋</h2>
              <h3 className="text-2xl font-bold text-blue-900/70">Ready for today?</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <Flame size={18} className="text-orange-500" />
                  <span>Streak: {stats.streak} (Best: {stats.bestStreak || stats.streak})</span>
                </div>
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <Star size={18} className="text-yellow-500" />
                  <span>{stats.totalPoints} pts</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onStartChallenge}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isCompletedToday ? 'Review Today\'s Work' : 'Start Today\'s Challenge ✍️'}
            </button>
          </div>

          {latestTrophy && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card w-full p-6 flex items-center gap-6 border-2 border-emerald-100/50"
            >
              <div className="w-20 h-20 flex-shrink-0">
                {latestTrophy.type === 'golden' && <GoldenTrophy />}
                {latestTrophy.type === 'ice' && <IceTrophy />}
                {latestTrophy.type === 'broken' && <BrokenTrophy />}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Latest Trophy</div>
                <h4 className="font-bold text-blue-900 leading-tight">
                  {latestTrophy.type === 'golden' ? 'Golden Glory!' : latestTrophy.type === 'ice' ? 'Frozen Solid' : 'Shattered Dreams'}
                </h4>
                <p className="text-[10px] text-blue-900/40 mt-1">
                  {latestTrophy.type === 'golden' ? 'Keep it up to stay golden!' : 
                   latestTrophy.type === 'ice' ? 'Freezing! Complete a flow to restore!' : 
                   'Broken! Start a new flow to get a new one!'}
                </p>
              </div>
            </motion.div>
          )}

          <div className="glass-card w-full p-6">
            <h4 className="text-sm font-bold text-blue-900/40 uppercase tracking-widest mb-4">Today's Flow:</h4>
            <div className="flex items-center justify-between px-2">
              <div className={`text-3xl transition-all ${dailyProgress.pushupsDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>💪</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.waterDrank >= settings.waterGoal ? 'grayscale-0' : 'grayscale opacity-40'}`}>💧</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.breathingDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>🧘</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.drawingDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>🎨</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.footballDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>⚽</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.bubblesDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>🫧</div>
            </div>
          </div>
        </div>
      </div>

      {settings.showQuotes && (
        <div className="w-full space-y-8">
          <div className="text-center max-w-2xl mx-auto px-6">
            <p className="text-lg font-serif italic text-blue-900/60">"{quote}"</p>
          </div>
        </div>
      )}

      <div className="w-full space-y-8">
        <div className="grid grid-cols-1 gap-8">
          <Calendar history={history} />
          <StatsCharts history={history} />
        </div>
      </div>
    </motion.div>
  );
}

function ProgressScreen({ stats, history, settings, setSettings }: { stats: UserStats, history: DailyProgress[], settings: UserSettings, setSettings: (s: UserSettings) => void }) {
  const handleTrophyClick = (type: any) => {
    if (settings.soundEnabled) playTrophySound(type);
  };

  const level = Math.floor(stats.totalPoints / 100) + 1;
  const pointsInLevel = stats.totalPoints % 100;
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = history.find(h => h.date === dateStr);
    return {
      date: dateStr,
      label: format(date, 'EEE'),
      completed: dayData?.completed || false
    };
  });

  const focusData = [
    { name: 'Physical', value: stats.pointsByCategory?.physical || 0, color: '#3b82f6', icon: Zap },
    { name: 'Mental', value: stats.pointsByCategory?.mental || 0, color: '#8b5cf6', icon: Brain },
    { name: 'Creative', value: stats.pointsByCategory?.creative || 0, color: '#ec4899', icon: Palette },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pt-4 max-w-4xl mx-auto w-full pb-20"
    >
      {/* 1. Level & Points Header */}
      <div className="glass-card p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-2xl font-black text-white">{level}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-blue-900">Level {level} Explorer</h2>
              <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest">Next level at {level * 100} pts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-blue-600">{stats.totalPoints}</p>
            <p className="text-[10px] font-bold text-blue-900/30 uppercase tracking-widest">Total Points</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-3 w-full bg-blue-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pointsInLevel}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-blue-900/30 uppercase tracking-tighter">
            <span>Progress to Level {level + 1}</span>
            <span>{pointsInLevel}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Streak Stats */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest flex items-center gap-2">
            <Flame size={16} className="text-orange-500" /> Consistency
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <p className="text-3xl font-black text-orange-500">{stats.streak}</p>
              <p className="text-[10px] font-bold text-orange-900/40 uppercase tracking-widest">Current Streak</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-3xl font-black text-emerald-500">{stats.bestStreak || stats.streak}</p>
              <p className="text-[10px] font-bold text-emerald-900/40 uppercase tracking-widest">Best Streak</p>
            </div>
          </div>
          
          {/* Weekly Grid */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-blue-900/30 uppercase tracking-widest">Last 7 Days</p>
            <div className="flex justify-between items-center px-1">
              {last7Days.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                    day.completed 
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-white/50 border-blue-100 text-blue-200'
                  }`}>
                    {day.completed ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-100" />}
                  </div>
                  <span className="text-[9px] font-black text-blue-900/30 uppercase">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Focus Balance Chart */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest flex items-center gap-2">
            <Target size={16} className="text-blue-500" /> Focus Balance
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#1e3a8a', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 rounded-xl shadow-xl border border-blue-50 text-[10px] font-black text-blue-900 uppercase">
                          {payload[0].value} pts
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                  {focusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between gap-2">
            {focusData.map((item, i) => (
              <div key={i} className="flex-1 flex items-center gap-2 bg-blue-50/50 p-2 rounded-xl">
                <item.icon size={12} style={{ color: item.color }} />
                <span className="text-[9px] font-black text-blue-900/60 uppercase">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Trophy Library */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest flex items-center gap-2">
            <TrophyIcon size={16} className="text-emerald-500" /> Trophy Library
          </h3>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
            {stats.trophies?.length || 0} Earned
          </span>
        </div>
        
        {(!stats.trophies || stats.trophies.length === 0) ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <Star className="text-blue-200" size={40} />
            </div>
            <p className="text-blue-900/40 font-medium text-sm">Complete your first daily flow to earn a Golden Trophy!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {(stats.trophies || []).map((trophy) => (
              <motion.div 
                key={trophy.id}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center space-y-2 p-3 bg-white/50 rounded-2xl border border-white/80 shadow-sm relative"
              >
                <div className="cursor-pointer" onClick={() => handleTrophyClick(trophy.type)}>
                  <div className="w-12 h-12">
                    {trophy.type === 'golden' && <GoldenTrophy />}
                    {trophy.type === 'ice' && <IceTrophy />}
                    {trophy.type === 'broken' && <BrokenTrophy />}
                  </div>
                  <div className="text-[8px] font-black text-blue-900/30 uppercase tracking-tighter text-center">
                    {format(parseISO(trophy.earnedDate), 'MMM d')}
                  </div>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, savedTrophyIds: [...(settings.savedTrophyIds || []), trophy.id] })}
                  className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white"
                >
                  <Save size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProfileScreen({ settings, setSettings, stats, user }: { settings: UserSettings, setSettings: (s: UserSettings) => void, stats: UserStats, user: FirebaseUser | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(settings.displayName || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setSettings({ ...settings, profilePic: base64 });
        const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), { profilePic: base64 });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = async () => {
    setSettings({ ...settings, displayName: tempName });
    setIsEditingName(false);
    if (user) {
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName: tempName });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 pt-4 max-w-4xl mx-auto w-full pb-24"
    >
      {/* Profile Header */}
      <div className="glass-card p-10 flex flex-col items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: settings.themeColor }} />
        
        <div className="relative group">
          <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-blue-100 flex items-center justify-center">
            {settings.profilePic ? (
              <img src={settings.profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={80} className="text-blue-300" />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 p-3 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
            style={{ backgroundColor: settings.themeColor }}
          >
            <Camera size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            capture="user"
            className="hidden" 
          />
        </div>

        <div className="text-center space-y-4 w-full max-w-sm">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-white/50 border border-white/40 rounded-xl px-4 py-2 font-bold text-blue-900 focus:outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button 
                onClick={handleSaveName} 
                className="p-2 text-white rounded-lg"
                style={{ backgroundColor: settings.themeColor }}
              >
                <Save size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl font-black text-blue-900">{settings.displayName}</h2>
              <button onClick={() => setIsEditingName(true)} className="p-1 text-blue-900/30 hover:text-blue-900/60">
                <Pen size={18} />
              </button>
            </div>
          )}
          <p className="text-blue-900/40 font-medium tracking-wide uppercase text-xs">Nexora Member Since March 2026</p>
        </div>
      </div>

      {/* Your Nexora Journey Stats */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-blue-900/40 uppercase tracking-widest px-4">Your Nexora Journey</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-6 text-center space-y-2">
            <div className="text-2xl font-black text-blue-900">{stats.streak}</div>
            <div className="text-[10px] font-bold text-blue-900/40 uppercase">Current Streak</div>
          </div>
          <div className="glass-card p-6 text-center space-y-2">
            <div className="text-2xl font-black text-blue-900">{stats.bestStreak || stats.streak}</div>
            <div className="text-[10px] font-bold text-blue-900/40 uppercase">Best Streak</div>
          </div>
          <div className="glass-card p-6 text-center space-y-2">
            <div className="text-2xl font-black text-blue-900">{stats.totalPoints}</div>
            <div className="text-[10px] font-bold text-blue-900/40 uppercase">Total XP</div>
          </div>
          <div className="glass-card p-6 text-center space-y-2">
            <div className="text-2xl font-black text-blue-900">{stats.trophies?.length || 0}</div>
            <div className="text-[10px] font-bold text-blue-900/40 uppercase">Trophies</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsScreen({ settings, setSettings, onBack, onLogout, fcmToken, fcmError, onRetryFCM }: { 
  settings: UserSettings, 
  setSettings: (s: UserSettings) => void, 
  onBack: () => void, 
  onLogout: () => Promise<void>,
  fcmToken: string | null,
  fcmError: string | null,
  onRetryFCM: () => void
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const exportData = () => {
    const data = {
      settings,
      stats: JSON.parse(localStorage.getItem('nexora_stats') || '{}'),
      history: Object.keys(localStorage)
        .filter(k => k.startsWith('nexora_progress_'))
        .map(k => JSON.parse(localStorage.getItem(k) || '{}'))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const resetApp = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12 pt-4 max-w-4xl mx-auto w-full pb-24"
    >
      <div className="flex items-center gap-4 px-4">
        <button onClick={onBack} className="p-2 bg-white/50 rounded-full text-blue-900/60 hover:text-blue-900 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-black text-blue-900">Settings</h2>
      </div>

      {/* 7 Helpful Things Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Water Goal Adjuster */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-blue-500">
            <Droplets size={24} />
            <h3 className="font-bold text-blue-900">Hydration Goal</h3>
          </div>
          <p className="text-xs text-blue-900/40">Adjust your daily water intake target.</p>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="1" max="10" step="0.5"
              value={settings.waterGoal}
              onChange={(e) => setSettings({ ...settings, waterGoal: parseFloat(e.target.value) })}
              className="flex-1"
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <span className="font-bold text-blue-900 w-12">{settings.waterGoal}{settings.unitSystem === 'metric' ? 'L' : 'gal'}</span>
          </div>
        </div>

        {/* 2. Pushup Goal Adjuster */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-orange-500">
            <Zap size={24} />
            <h3 className="font-bold text-blue-900">Physical Goal</h3>
          </div>
          <p className="text-xs text-blue-900/40">Set your daily push-up challenge target.</p>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="5" max="100" step="5"
              value={settings.pushupsGoal}
              onChange={(e) => setSettings({ ...settings, pushupsGoal: parseInt(e.target.value) })}
              className="flex-1"
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <span className="font-bold text-blue-900 w-12">{settings.pushupsGoal}</span>
          </div>
        </div>

        {/* 3. Sound Effects Toggle */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${settings.soundEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              <Volume2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Sound Effects</h3>
              <p className="text-[10px] text-blue-900/40">Trophy & pop sounds</p>
            </div>
          </div>
          <button 
            onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* 4. Notifications Toggle */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings.notificationsEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                <Bell size={24} />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Reminders</h3>
                <p className="text-[10px] text-blue-900/40">Daily flow alerts</p>
              </div>
            </div>
            <button 
              onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.notificationsEnabled ? 'bg-purple-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notificationsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          {settings.notificationsEnabled && (
            <div className="flex items-center gap-3 bg-white/40 p-3 rounded-xl">
              <span className="text-xs font-bold text-blue-900/60">Time:</span>
              <input 
                type="time" 
                value={settings.reminderTime}
                onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                className="bg-transparent font-bold text-blue-900 text-sm focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 5. Theme Color Picker */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-pink-500">
            <Palette size={24} />
            <h3 className="font-bold text-blue-900">App Theme</h3>
          </div>
          <div className="flex gap-2">
            {['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'].map(color => (
              <button 
                key={color}
                onClick={() => setSettings({ ...settings, themeColor: color })}
                className={`w-8 h-8 rounded-full border-2 ${settings.themeColor === color ? 'border-blue-900 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* 6. Daily Quote Toggle */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${settings.showQuotes ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <Star size={24} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Daily Quotes</h3>
              <p className="text-[10px] text-blue-900/40">Motivational messages</p>
            </div>
          </div>
          <button 
            onClick={() => setSettings({ ...settings, showQuotes: !settings.showQuotes })}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.showQuotes ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showQuotes ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* 7. Unit System Toggle */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-indigo-500">
            <Target size={24} />
            <h3 className="font-bold text-blue-900">Unit System</h3>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setSettings({ ...settings, unitSystem: 'metric' })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.unitSystem === 'metric' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-900/40'}`}
            >
              Metric (L)
            </button>
            <button 
              onClick={() => setSettings({ ...settings, unitSystem: 'imperial' })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.unitSystem === 'imperial' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-900/40'}`}
            >
              Imperial (gal)
            </button>
          </div>
        </div>

        {/* 8. Logout */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-500">
            <LogOut size={24} />
            <h3 className="font-bold text-blue-900">Sign Out</h3>
          </div>
          <button 
            onClick={onLogout}
            className="bg-red-50 text-red-600 font-bold py-2 px-4 rounded-xl hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* 10. FCM Status */}
        <div className="glass-card p-6 space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 text-indigo-500">
            <Zap size={24} />
            <h3 className="font-bold text-blue-900">Cloud Sync</h3>
          </div>
          <p className="text-xs text-blue-900/40">Status of your cloud notification connection.</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900/60">Status:</span>
              <span className={`text-xs font-black px-2 py-1 rounded-full ${
                fcmToken ? 'bg-emerald-100 text-emerald-600' : 
                fcmError === 'PERMISSION_DENIED' ? 'bg-amber-100 text-amber-600' :
                fcmError ? 'bg-rose-100 text-rose-600' : 
                'bg-amber-100 text-amber-600'
              }`}>
                {fcmToken ? 'CONNECTED' : 
                 fcmError === 'PERMISSION_DENIED' ? 'PERMISSION REQUIRED' :
                 fcmError ? 'ERROR' : 'WAITING FOR KEY'}
              </span>
            </div>
            {fcmToken && (
              <div className="mt-2">
                <span className="text-[10px] font-bold text-blue-900/40 block mb-1">Device Token:</span>
                <div className="bg-white/40 p-2 rounded-lg break-all text-[8px] font-mono text-blue-900/60 border border-blue-900/5">
                  {fcmToken}
                </div>
              </div>
            )}
            {fcmError && (
              <p className="text-[10px] text-rose-600 font-medium italic mt-1">
                Error: {fcmError}
              </p>
            )}
            {!fcmToken && !fcmError && (
              <p className="text-[10px] text-amber-600 font-medium italic">
                {Notification.permission === 'granted' ? 'Connecting to cloud...' : 'Enable notifications to connect.'}
              </p>
            )}
            <button 
              onClick={onRetryFCM}
              className="mt-2 text-[10px] font-bold text-blue-600 hover:underline text-left"
            >
              Retry Connection
            </button>
          </div>
        </div>

        {/* 9. Reset App */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-500">
            <Trash2 size={24} />
            <h3 className="font-bold text-blue-900">Reset Data</h3>
          </div>
          <p className="text-xs text-blue-900/40">This will clear all your local progress and trophies.</p>
          {!showResetConfirm ? (
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="w-full bg-red-50 text-red-600 font-bold py-2 rounded-xl hover:bg-red-100 transition-colors"
            >
              Reset App Data
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={resetApp}
                className="flex-1 bg-red-500 text-white font-bold py-2 rounded-xl hover:bg-red-600 transition-colors"
              >
                Confirm Reset
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Section */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-blue-900/40 uppercase tracking-widest px-4">Advanced Settings</h3>
        <div className="glass-card p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-blue-900">Data Management</h4>
              <p className="text-xs text-blue-900/40">Backup your progress or start fresh.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={exportData}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
              >
                <Download size={18} /> Export Data
              </button>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
              >
                <Trash2 size={18} /> Reset App
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pb-12">
        <p className="text-[10px] font-black text-blue-900/20 uppercase tracking-[0.2em]">Nexora v1.0.0 • Built for Growth</p>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-blue-900">Reset Everything?</h3>
                <p className="text-sm text-blue-900/60">This will permanently delete all your progress, stats, and settings. You can't undo this!</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={resetApp}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChallengeFlow({ step, setStep, settings, setSettings, dailyProgress, setDailyProgress, onFinish, onExit, earnedTrophyToday }: { 
  step: ChallengeStep, 
  setStep: (s: ChallengeStep) => void, 
  settings: UserSettings,
  setSettings: (s: UserSettings | ((prev: UserSettings) => UserSettings)) => void,
  dailyProgress: DailyProgress,
  setDailyProgress: (p: DailyProgress) => void,
  onFinish: () => void,
  onExit: () => void,
  earnedTrophyToday: boolean
}) {
  const steps: ChallengeStep[] = ['pushups', 'water', 'breathing', 'drawing', 'football', 'bubbles'];
  const currentIdx = steps.indexOf(step as any);
  const progressLabel = step === 'completion' ? 'Done!' : `Challenge ${currentIdx + 1}/${steps.length}`;

  const saveChallenge = () => {
    setSettings(prev => ({
      ...prev,
      savedChallengeIds: [...(prev.savedChallengeIds || []), step]
    }));
    alert('Challenge saved to library!');
  };

  const nextStep = () => {
    const updates: Partial<DailyProgress> = {};
    if (step === 'pushups') updates.pushupsDone = true;
    if (step === 'breathing') updates.breathingDone = true;
    if (step === 'drawing') updates.drawingDone = true;
    if (step === 'football') updates.footballDone = true;
    if (step === 'bubbles') updates.bubblesDone = true;

    if (Object.keys(updates).length > 0) {
      setDailyProgress({ ...dailyProgress, ...updates });
    }

    if (currentIdx < steps.length - 1) {
      setStep(steps[currentIdx + 1]);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#E0F2FF] to-[#F0E6FF] z-[100] flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-4xl flex flex-col min-h-screen">
        <header className="p-6 flex items-center justify-between">
          <button onClick={onExit} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
            <ChevronRight className="rotate-180" size={28} />
          </button>
          <h2 className="text-lg font-bold text-blue-900/60 tracking-tight">{progressLabel}</h2>
          <button onClick={saveChallenge} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
            <Save size={28} />
          </button>
        </header>

        <div className="flex-1 px-6 flex flex-col pb-12 justify-center">
          <AnimatePresence mode="wait">
            {step === 'pushups' && (
              <PushupsStep 
                goal={settings.pushupsGoal} 
                onDone={nextStep} 
                onSkip={nextStep}
              />
            )}
            {step === 'water' && (
              <WaterStep 
                goal={settings.waterGoal} 
                progress={dailyProgress.waterDrank}
                onUpdate={(val) => setDailyProgress({ ...dailyProgress, waterDrank: val })}
                onContinue={nextStep} 
              />
            )}
            {step === 'breathing' && (
              <BreathingStep 
                onDone={nextStep} 
              />
            )}
            {step === 'drawing' && (
              <DrawingStep 
                onFinish={nextStep} 
              />
            )}
            {step === 'football' && (
              <FootballStep 
                onFinish={nextStep} 
              />
            )}
            {step === 'bubbles' && (
              <BubbleStep 
                onFinish={nextStep} 
              />
            )}
            {step === 'completion' && (
              <CompletionStep 
                onFinish={onExit} 
                streak={dailyProgress.completed ? 1 : 0} 
                points={10} 
                showTrophy={earnedTrophyToday}
                settings={settings}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PushupsStep({ goal, onDone, onSkip }: { goal: number, onDone: () => void, onSkip: () => void }) {
  const [isReady, setIsReady] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[400px] lg:max-w-[600px]">
        <PushupMascot className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-blue-900/80">Push-ups</h2>
          <p className="text-blue-900/50 font-medium">Do {goal} push-ups</p>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          {isReady && <HappyMascot size={32} />}
          {!isReady ? (
            <button 
              onClick={() => setIsReady(true)} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              I'm Done! 💪
            </button>
          ) : (
            <button 
              onClick={onDone} 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
          <button onClick={onSkip} className="btn-secondary w-full">
            Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function WaterStep({ goal, progress, onUpdate, onContinue }: { goal: number, progress: number, onUpdate: (v: number) => void, onContinue: () => void }) {
  const isFinished = progress >= goal;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[300px] lg:max-w-[400px]">
        <WaterMascot progress={Math.min(progress / goal, 1)} className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-blue-900/80">Drink Water</h2>
          <p className="text-blue-900/50 font-medium">{progress} / {goal} glasses</p>
          
          <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((progress / goal) * 100, 100)}%` }}
              className="h-full bg-blue-400 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isFinished && <HappyMascot size={40} />}
          {!isFinished ? (
            <button onClick={() => onUpdate(progress + 1)} className="btn-primary w-full flex items-center justify-center gap-2">
              Drink +1 💧
            </button>
          ) : (
            <button 
              onClick={onContinue} 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BreathingStep({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'In' | 'Out'>('In');
  const [timer, setTimer] = useState(5);
  const [cycles, setCycles] = useState(0);
  const isFinished = cycles >= 5;

  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished]);

  useEffect(() => {
    if (timer < 0) {
      setTimer(5);
      setPhase((p) => {
        const next = p === 'In' ? 'Out' : 'In';
        if (next === 'In') {
          setCycles((c) => c + 1);
        }
        return next;
      });
    }
  }, [timer, isFinished]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[300px] lg:max-w-[400px]">
        <BreathingMascot phase={phase} className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-blue-900/80">Breathing</h2>
          <p className="text-blue-900/50 font-medium text-xl">
            {isFinished ? 'Exercise Complete!' : `Breathe ${phase === 'In' ? 'In' : 'Out'}...`}
          </p>
          
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-8 rounded-full transition-colors duration-500 ${i < cycles ? 'bg-blue-500' : 'bg-blue-100'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {isFinished && <HappyMascot size={40} />}
          {!isFinished ? (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-blue-50"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="364.4"
                  animate={{ strokeDashoffset: 364.4 * (1 - Math.max(0, timer) / 5) }}
                  className="text-blue-500"
                />
              </svg>
              <div className="text-4xl font-bold text-blue-600">{Math.max(0, timer)}</div>
            </div>
          ) : (
            <button 
              onClick={onDone} 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DrawingStep({ onFinish }: { onFinish: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3B82F6');
  const [tool, setTool] = useState<'pencil' | 'pen'>('pen');
  const [hasDrawn, setHasDrawn] = useState(false);

  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#000000', // Black
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === 'pencil' ? 2 : 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto w-full"
    >
      <div className="w-full max-w-[400px]">
        <ArtistMascot className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-900/80">Creativity</h2>
          <button 
            onClick={clearCanvas}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear Canvas
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm border border-blue-100">
            <button
              onClick={() => setTool('pencil')}
              className={`p-2 rounded-md transition-all ${tool === 'pencil' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400 hover:bg-blue-50'}`}
              title="Pencil"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-md transition-all ${tool === 'pen' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400 hover:bg-blue-50'}`}
              title="Pen"
            >
              <Pen size={20} />
            </button>
          </div>

          <div className="h-8 w-px bg-blue-200 mx-2" />

          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="h-80 bg-white rounded-2xl border-2 border-blue-100 overflow-hidden touch-none shadow-inner relative">
          <canvas 
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-blue-300 font-medium">
              Draw something here...
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={onFinish} 
            disabled={!hasDrawn}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${!hasDrawn ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Finish Masterpiece <CheckCircle2 size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CompletionStep({ onFinish, streak, points, showTrophy, settings }: { onFinish: () => void, streak: number, points: number, showTrophy: boolean, settings: UserSettings }) {
  useEffect(() => {
    if (showTrophy && settings.soundEnabled) {
      playTrophySound('golden');
    }
  }, [showTrophy, settings.soundEnabled]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-5xl font-black text-blue-900 tracking-tighter">DAY COMPLETE!</h2>
          <p className="text-xl text-blue-900/40 font-bold">You're unstoppable! 🔥</p>
        </motion.div>
      </div>

      {showTrophy && (
        <div className="w-full max-w-[300px]">
          <GoldenTrophy />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-black text-emerald-500">+{points}</div>
          <div className="text-xs font-bold text-blue-900/40 uppercase">Points</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-black text-orange-500">{streak}</div>
          <div className="text-xs font-bold text-blue-900/40 uppercase">Day Streak</div>
        </div>
      </div>

      <button 
        onClick={onFinish}
        className="btn-primary w-full py-6 text-xl shadow-2xl shadow-blue-500/20"
      >
        Back to Home ✨
      </button>
    </motion.div>
  );
}

function FootballStep({ onFinish }: { onFinish: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [score, setScore] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(5);
  const [isFlying, setIsFlying] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 400, y: 520 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint] = useState({ x: 400, y: 520 });
  const [aimLine, setAimLine] = useState({ x2: 400, y2: 520, opacity: 0 });
  const [ballScale, setBallScale] = useState(1);
  const [scoredBalls, setScoredBalls] = useState<{ x: number, y: number }[]>([]);

  const getCoord = (e: any) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    return {
      x: (clientX - rect.left) * (800 / rect.width),
      y: (clientY - rect.top) * (600 / rect.height)
    };
  };

  const onStart = (e: any) => {
    if (isFlying || ballsLeft <= 0) return;
    setIsDragging(true);
  };

  const onMove = (e: any) => {
    if (!isDragging) return;
    const pos = getCoord(e);
    const dx = startPoint.x - pos.x;
    const dy = startPoint.y - pos.y;
    const limit = 100;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ratio = Math.min(dist, limit) / dist;

    const newX = startPoint.x - (dx * ratio);
    const newY = startPoint.y - (dy * ratio);

    setBallPos({ x: newX, y: newY });
    setAimLine({
      x2: startPoint.x + (dx * 3),
      y2: startPoint.y - 40 + (dy * 3),
      opacity: 0.8
    });
  };

  const onEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsFlying(true);
    setAimLine(prev => ({ ...prev, opacity: 0 }));

    const power = 14;
    const vx = (startPoint.x - ballPos.x) * power;
    const vy = (startPoint.y - ballPos.y) * power;
    const targetX = ballPos.x + vx;
    const targetY = ballPos.y + vy;

    let startTime: number | null = null;
    const duration = 1000;
    const oX = ballPos.x;
    const oY = ballPos.y;

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const p = (now - startTime) / duration;
      if (p < 1) {
        const t = 1 - Math.pow(1 - p, 2);
        const curX = oX + (targetX - oX) * t;
        const curY = oY + (targetY - oY) * t;
        setBallPos({ x: curX, y: curY });
        setBallScale(1 - (p * 0.7));
        requestAnimationFrame(animate);
      } else {
        // Goal area: x [150, 650], y [120, 270] (approx)
        const goalXMin = 150;
        const goalXMax = 650;
        const goalYMin = 120;
        const goalYMax = 270;

        // Obstacle area (middle)
        const obsXMin = 330;
        const obsXMax = 470;

        const isGoal = targetY >= goalYMin && targetY <= goalYMax &&
          targetX >= goalXMin && targetX <= goalXMax &&
          (targetX < obsXMin || targetX > obsXMax);

        if (isGoal) {
          setScore(s => s + 1);
          setScoredBalls(prev => [...prev, { x: targetX, y: targetY }]);
        }

        setBallsLeft(b => b - 1);
        setTimeout(reset, 1200);
      }
    };
    requestAnimationFrame(animate);
  };

  const reset = () => {
    setBallPos({ x: 400, y: 520 });
    setBallScale(1);
    setIsFlying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-4 sm:space-y-8 max-w-4xl mx-auto w-full"
    >
      <div className="glass-card w-full p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-hidden">
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-blue-900/80">Football Challenge</h2>
            <p className="text-sm text-blue-900/40">Score 5 goals to continue!</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
              Score: {score}/5
            </div>
            <div className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
              Balls: {ballsLeft}
            </div>
          </div>
        </div>

        <div className="relative w-full aspect-[3/2] bg-[#2f855a] rounded-xl sm:rounded-2xl border-4 sm:border-8 border-[#22543d] overflow-hidden shadow-2xl touch-none">
          <svg
            ref={svgRef}
            viewBox="0 0 800 600"
            className="w-full h-full cursor-crosshair"
            onMouseDown={onStart}
            onMouseMove={onMove}
            onMouseUp={onEnd}
            onTouchStart={onStart}
            onTouchMove={onMove}
            onTouchEnd={onEnd}
          >
            <defs>
              <radialGradient id="ballGlass" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
              </radialGradient>
              <linearGradient id="innerLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <pattern id="net-grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.4" />
              </pattern>
              <linearGradient id="grass-pitch" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#166534" />
              </linearGradient>
              <filter id="shadowBlur">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <clipPath id="ballClip">
                <circle cx="0" cy="-50" r="50" />
              </clipPath>
            </defs>

            <rect x="0" y="0" width="800" height="250" fill="#a0aec0" opacity="0.2" />
            <g opacity="0.2">
              {Array.from({ length: 17 }).map((_, i) => (
                <path key={`v-${i}`} d={`M ${i * 50},0 V 220`} stroke="white" strokeWidth="1" />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <path key={`h-${i}`} d={`M 0,${i * 40} H 800`} stroke="white" strokeWidth="1" />
              ))}
            </g>
            <rect x="0" y="210" width="800" height="40" fill="#14532d" />
            <rect x="0" y="250" width="800" height="350" fill="url(#grass-pitch)" />
            <rect x="0" y="520" width="800" height="10" fill="white" opacity="0.8" />

            <g transform="translate(150, 120) scale(1.1)">
              <path d="M 0,150 L -30,170 L -30,20 L 0,0 Z" fill="#fff" opacity="0.1" />
              <path d="M 450,150 L 480,170 L 480,20 L 450,0 Z" fill="#fff" opacity="0.1" />
              <rect x="0" y="0" width="450" height="150" fill="url(#net-grid)" stroke="white" strokeWidth="1" />
              <path d="M 0,150 V 0 H 450 V 150" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
            </g>

            {/* Obstacles (Boxes) */}
            <g transform="translate(330, 120)">
              <rect x="0" y="0" width="140" height="165" fill="#7c2d12" stroke="#451a03" strokeWidth="4" rx="8" />
              <path d="M 0,0 L 140,165 M 140,0 L 0,165" stroke="#451a03" strokeWidth="2" opacity="0.5" />
              <text x="70" y="85" textAnchor="middle" fill="white" className="font-bold" style={{ fontSize: '24px' }}>BLOCK</text>
            </g>

            {/* Scored Balls */}
            {scoredBalls.map((b, i) => (
              <g key={i} transform={`translate(${b.x}, ${b.y}) scale(0.3)`}>
                <circle cx="0" cy="-50" r="50" fill="url(#ballGlass)" stroke="#7dd3fc" strokeWidth="2" />
                <g clipPath="url(#ballClip)">
                  <rect x="-50" y="-35" width="100" height="100" fill="url(#innerLiquid)" />
                </g>
              </g>
            ))}

            {/* Current Ball Shadow */}
            {!isFlying && ballsLeft > 0 && (
              <ellipse cx={ballPos.x} cy={ballPos.y + 10} rx={60 * (ballPos.y / 520)} ry={15 * (ballPos.y / 520)} fill="black" opacity="0.4" filter="url(#shadowBlur)" />
            )}

            {/* Current Ball */}
            {(isFlying || ballsLeft > 0) && (
              <g transform={`translate(${ballPos.x}, ${ballPos.y}) scale(${ballScale})`}>
                <g className={!isFlying && !isDragging ? "idle-anim" : ""}>
                  <circle cx="0" cy="-50" r="50" fill="url(#ballGlass)" stroke="#7dd3fc" strokeWidth="2" />
                  <g clipPath="url(#ballClip)">
                    <rect x="-50" y="-35" width="100" height="100" fill="url(#innerLiquid)" />
                  </g>
                  <ellipse cx="-18" cy="-75" rx="15" ry="8" fill="white" opacity="0.3" transform="rotate(-30, -18, -75)" />
                  <g transform="translate(-15, -75) scale(0.65)">
                    <path d="M 0 0 L 10 0 L 30 40 L 30 0 L 45 0 L 45 60 L 30 60 L 10 20 L 10 60 L 0 60 Z" fill="white" opacity="0.9" />
                  </g>
                  <g transform="translate(0, -45)">
                    <circle cx="-18" cy="0" r="5" fill="#001845" />
                    <circle cx="18" cy="0" r="5" fill="#001845" />
                    <path d="M -10,12 Q 0,22 10,12" fill="none" stroke="#001845" strokeWidth="4" strokeLinecap="round" />
                  </g>
                </g>
              </g>
            )}

            {/* Aim Line */}
            {isDragging && (
              <line x1={startPoint.x} y1={startPoint.y - 40} x2={aimLine.x2} y2={aimLine.y2} stroke="white" strokeWidth="4" strokeDasharray="10,6" opacity={aimLine.opacity} />
            )}
          </svg>

          {ballsLeft === 0 && !isFlying && score < 5 && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-4">
              <h3 className="text-3xl font-bold">Game Over!</h3>
              <p>You need at least 5 goals.</p>
              <button
                onClick={() => {
                  setBallsLeft(5);
                  setScore(0);
                  setScoredBalls([]);
                }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {score >= 5 && (
          <div className="flex flex-col items-center w-full">
            <HappyMascot size={40} />
            <button
              onClick={onFinish}
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 animate-bounce"
            >
              Continue to Bubbles <CheckCircle2 size={20} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes mascotIdle {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.04, 0.96); }
        }
        .idle-anim {
          animation: mascotIdle 3s infinite ease-in-out;
          transform-origin: bottom center;
        }
      `}</style>
    </motion.div>
  );
}

function BubbleStep({ onFinish }: { onFinish: () => void }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);

  const playPopSound = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContext.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (bubbles.length < 12 && poppedCount < 20) {
        const id = Math.random();
        const size = Math.random() * 60 + 40;
        const x = Math.random() * 80 + 10;
        const y = 110; // Start below screen
        const color = `hsla(${Math.random() * 360}, 70%, 70%, 0.4)`;
        setBubbles(prev => [...prev, { id, x, y, size, color }]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [bubbles.length, poppedCount]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBubbles(prev => prev.map(b => ({ ...b, y: b.y - 0.3 })).filter(b => b.y > -20));
    }, 16);
    return () => clearInterval(moveInterval);
  }, []);

  const popBubble = (id: number) => {
    playPopSound();
    setBubbles(prev => prev.filter(b => b.id !== id));
    setPoppedCount(prev => prev + 1);
  };

  useEffect(() => {
    if (poppedCount >= 20) {
      const timer = setTimeout(onFinish, 2000);
      return () => clearTimeout(timer);
    }
  }, [poppedCount, onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto w-full relative overflow-hidden h-[600px] bg-blue-50/30 rounded-3xl border-4 border-white/50 shadow-2xl"
    >
      <div className="absolute top-8 left-8 z-10">
        <h2 className="text-2xl font-bold text-blue-900/80">Bubble Pop!</h2>
        <p className="text-sm text-blue-900/40">Pop 20 bubbles to relax ✨</p>
      </div>

      <div className="absolute top-8 right-8 z-10 bg-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
        {poppedCount}/20
      </div>

      <div className="relative w-full h-full">
        <AnimatePresence>
          {bubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              onClick={() => popBubble(bubble.id)}
              className="absolute cursor-pointer rounded-full border-2 border-white/80 shadow-inner backdrop-blur-[2px]"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
                backgroundColor: bubble.color,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
            >
              <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/40 rounded-full blur-[1px]" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {poppedCount >= 20 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-20"
        >
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 flex flex-col items-center">
            <h3 className="text-3xl font-bold text-blue-900">Amazing!</h3>
            <p className="text-blue-900/60">You're so focused! 🫧</p>
            <button onClick={onFinish} className="btn-primary w-full mt-4">
              Finish Today's Flow! ✨
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
