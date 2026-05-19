import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
console.log("App.tsx is loading...");
import { Home, BarChart2, BarChart3, User, CheckCircle2, Droplets, Wind, Palette, Flame, Star, ChevronRight, ChevronLeft, ArrowLeft, Settings, X, Pen, Pencil, Eraser, Trophy as TrophyIcon, Zap, Brain, Heart, Target, Camera, Upload, Bell, BellOff, Volume2, Download, Trash2, Save, PaintBucket, MessageSquare, Music, Image as ImageIcon, Sparkles, BrainCircuit, Smile, LogOut, Send, Book, RefreshCw, AlertCircle, Award, Users, Crown, Info, Map as MapIcon, Check, Plus, Clock, History, BookOpen, Sprout, MoreHorizontal, Flag, Bookmark, EyeOff, Share2, Search, Youtube, Video, Lock, WifiOff } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSound } from './hooks/useSound';
import { HouseItem, PlacedHouseItem, UserSettings, UserStats, DailyProgress, Screen, ChallengeStep, Trophy, TrophyType, MascotMood, BadgeSettings, LeaderboardEntry, CustomPlan, PlantType, SocialCircle, Post, SocialComment, NexusNotification, NexusVideo, UserReport, SystemNotification, PlantState } from './types';
import { HOUSE_ITEMS } from './constants/houseItems';
import { NexoraStudio } from './components/NexoraStudio';
import { format, subDays, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { auth, db, messaging, handleFirestoreError, OperationType, trackEvent } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut, deleteUser, reauthenticateWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, getDocFromServer, deleteDoc, collection, query, orderBy, limit, onSnapshot, serverTimestamp, where, getDocs, addDoc, increment } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { useAppIcon } from './hooks/useAppIcon';
import { PlanBuilder } from './components/PlanBuilder';
import { HomeScreen } from './components/HomeScreen';
import { Mascot } from './components/Mascot';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GoldenTrophy, IceTrophy, BrokenTrophy, playTrophySound } from './components/Trophies';
import WhatIsNewModal from './components/WhatIsNewModal';
import { HappyMascot, LevelUpCelebration, CoinAnimation, MascotAIWrapper } from './components/SuspenseWrappers';

import { CelebrationModal } from './components/CelebrationModal';

const HouseScreen = lazy(() => import('./components/HouseScreen').then(m => ({ default: m.HouseScreen })));
const LibraryScreen = lazy(() => import('./components/LibraryScreen').then(m => ({ default: m.LibraryScreen })));
const ShopScreen = lazy(() => import('./components/ShopScreen').then(m => ({ default: m.ShopScreen })));
const PlantScreen = lazy(() => import('./components/PlantScreen').then(m => ({ default: m.PlantScreen })));
const SocialScreen = lazy(() => import('./components/SocialScreen').then(m => ({ default: m.SocialScreen })));
const LeaderboardScreen = lazy(() => import('./components/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const ProgressScreen = lazy(() => import('./components/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const ProfileScreen = lazy(() => import('./components/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const SettingsScreen = lazy(() => import('./components/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const SubscriptionScreen = lazy(() => import('./components/SubscriptionScreen').then(m => ({ default: m.SubscriptionScreen })));
const GalleryScreen = lazy(() => import('./components/GalleryScreen').then(m => ({ default: m.GalleryScreen })));
const NotebookScreen = lazy(() => import('./components/NotebookScreen').then(m => ({ default: m.NotebookScreen })));
const ChallengeFlow = lazy(() => import('./components/ChallengeFlow').then(m => ({ default: m.ChallengeFlow })));
const ArchitectLab = lazy(() => import('./components/ArchitectLab').then(m => ({ default: m.ArchitectLab })));
const NexusVision = lazy(() => import('./components/NexusVision').then(m => ({ default: m.NexusVision })));
import { DeepChecklist } from './components/DeepChecklist';
import { CompletionFlame } from './components/CompletionFlame';
import { TrophyRewardsScreen } from './components/TrophyRewardsScreen';

const SOCIAL_LOCKED = false;

import { vibrate, VIBRATION_PATTERNS } from './lib/vibrate';
import { requestNotificationPermission, setupOnMessageListener, VAPID_KEY } from './lib/notifications';

import { NavButton } from './components/NavButton';
import { SplashScreen } from './components/SplashScreen';
import { useNexoraData } from './hooks/useNexoraData';

const DEFAULT_SETTINGS: UserSettings = {
  pushupsGoal: 5,
  waterGoal: 2,
  reminderTime: '09:00',
  reminderTime2: '21:00',
  motivationTime: '12:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  displayName: 'Nexora User',
  themeColor: '#3b82f6',
  soundEnabled: true,
  notificationsEnabled: true,
  showQuotes: true,
  unitSystem: 'metric',
  activeHat: 'none',
  activeSkin: 'none',
  zenModeEnabled: false,
  challengeCountGoal: 3,
  league: 'Bronze',
  badgeSettings: {
    trophyAlerts: true,
    appUpdates: true,
    dailyChallenge: true,
    dailyQuest: true,
    dynamicUrgency: true
  },
  purchasedHouseItemIds: [],
  placedHouseItems: [],
  mascotSize: 1.5,
  mascotPos: { x: 400, y: 300 },
  mascotPinnedItemId: null,
  spaceOnboardingCompleted: false,
  plantOnboardingCompleted: false,
  isWalkthroughCompleted: false,
  performanceMode: false,
  lowPowerMode: false,
  plantState: {
    type: 'sprout',
    stage: 0,
    growthPoints: 0,
    lastGrowthDate: null,
    lastCheckDate: new Date().toISOString(),
    health: 100,
    isDead: false,
    isThirsty: false,
    unlockedTypes: ['sprout']
  }
};

const DEFAULT_STATS: UserStats = {
  streak: 0,
  bestStreak: 0,
  totalPoints: 0,
  totalCompletedDays: 0,
  lastCompletedDate: null,
  currentChallengeIndex: 0,
  coins: 0,
  xp: 0,
  weeklyPoints: 0,
  weeklyXP: 0,
  trophies: [],
  pointsByCategory: {
    physical: 0,
    mental: 0,
    creative: 0,
  },
  drawings: [],
  unlockedHats: ['none'],
};




import { PublicRankView } from './components/PublicRankView';

const NAV_ITEMS_MAP: Record<string, { label: string, icon: React.ReactNode, screen: Screen }> = {
  'home': { label: 'Home', icon: <Home size={24} />, screen: 'home' },
  'social': { label: 'Nexora', icon: <Zap size={24} />, screen: 'social' },
  'progress': { label: 'Stats', icon: <BarChart2 size={24} />, screen: 'progress' },
  'shop': { label: 'Shop', icon: <Star size={24} />, screen: 'shop' },
  'library': { label: 'Library', icon: <TrophyIcon size={24} />, screen: 'library' },
  'notebook': { label: 'Notebook', icon: <Book size={24} />, screen: 'notebook' },
  'leaderboard': { label: 'Rank', icon: <TrophyIcon size={24} />, screen: 'leaderboard' },
};

export default function App() {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const {
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
  } = useNexoraData(DEFAULT_SETTINGS, DEFAULT_STATS, showToast);

  const onUpdateSettings = useCallback((newSettings: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => {
    try {
      setSettings(prev => {
        const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
        if (updated.plantState && !updated.plantState.type) updated.plantState.type = 'sprout';
        return updated;
      });
    } catch (e) {
      console.error("NEXORA: Settings Update Failed", e);
      showToast("Critical: Settings Sync Error", "error");
    }
  }, [setSettings]);

  const onUpdateStats = useCallback((newStats: Partial<UserStats> | ((prev: UserStats) => UserStats)) => {
    try {
      setStats(prev => {
        if (typeof newStats === 'function') return newStats(prev);
        // Deep merge protection for stats including trophies and categories
        return { 
          ...prev, 
          ...newStats,
          pointsByCategory: { ...prev.pointsByCategory, ...(newStats.pointsByCategory || {}) },
          trophies: newStats.trophies || prev.trophies || []
        };
      });
    } catch (e) {
      console.error("NEXORA: Stats Update Failed", e);
      showToast("Critical: Stats Sync Error", "error");
    }
  }, [setStats]);

  const today = new Date().toISOString().split('T')[0];
  const [circles, setCircles] = useState<SocialCircle[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<NexusNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showCompletionFlame, setShowCompletionFlame] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showArchitectLab, setShowArchitectLab] = useState(false);
  const [proTestMessage, setProTestMessage] = useState<string | null>(null);
  const [originalStatsBeforeProTest, setOriginalStatsBeforeProTest] = useLocalStorage<UserStats | null>('nexora_original_stats', null);
  const [isCurrentlyBoosting, setIsCurrentlyBoosting] = useState(false);

  // Pro Test Expiration & Boost Manager
  useEffect(() => {
    if (!isDataReady) return;

    const testExpiresAt = settings.proTestExpiresAt;
    const now = new Date();
    // Use a small buffer to avoid weird edge cases on load
    const isTestActive = testExpiresAt && (new Date(testExpiresAt).getTime() > now.getTime() + 100);

    if (isTestActive) {
      if (!isCurrentlyBoosting) {
        setIsCurrentlyBoosting(true);
        
        // Only save original if we haven't already (prevents recursive overwrite on refresh)
        if (!originalStatsBeforeProTest) {
          const statsToSave = JSON.parse(JSON.stringify(stats));
          setOriginalStatsBeforeProTest(statsToSave);
          
          // Apply temporary boost ONLY ONCE
          setStats(prev => ({
            ...prev,
            streak: Math.max(prev.streak, 9999),
            coins: Math.max(prev.coins, 900000),
            xp: Math.max(prev.xp, 150000),
            level: Math.max(prev.level, 99)
          }));
          showToast("PRO PROTOCOL: BOOSTED STATS ACTIVATED!", "success");
        }
      }
    } else if (isCurrentlyBoosting || (testExpiresAt && new Date(testExpiresAt).getTime() <= now.getTime())) {
      // Transition from active to expired, OR detected as already expired on load
      setIsCurrentlyBoosting(false);
      
      // If we were previously boosting or detected it was active but expired
      if (originalStatsBeforeProTest) {
        // Force rollback of stats
        setStats(originalStatsBeforeProTest);
        setOriginalStatsBeforeProTest(null);
        showToast("PRO TRIAL ENDED: STATS ROLLBACK SUCCESSFUL.", "info");
        onUpdateSettings({ proTestActive: false, proTestExpiresAt: null }); 
        setProTestMessage("Your pro features test time is out. If u want it u can pay, bro! 👑");
        vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
      }
    }
  }, [settings.proTestExpiresAt, isDataReady, isCurrentlyBoosting]);

  // Expiry Check Interval
  useEffect(() => {
    if (!settings.proTestExpiresAt || settings.isPro) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(settings.proTestExpiresAt!);
      
      if (now >= expiry) {
        // This will trigger the boost manager useEffect
        onUpdateSettings({ proTestExpiresAt: null, proTestActive: false });
        clearInterval(interval);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [settings.proTestExpiresAt, settings.isPro]);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [isNewStreak, setIsNewStreak] = useState(true);
  const [sessionTrophy, setSessionTrophy] = useState<TrophyType>('golden');
  const [globalSavedVideos, setGlobalSavedVideos] = useState<NexusVideo[]>([]);
  const [focusedVideoId, setFocusedVideoId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [dailyQuest, setDailyQuest] = useState<ChallengeStep>('water');
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [challengeStep, setChallengeStep] = useState<ChallengeStep | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const WALKTHROUGH_STEPS: { screen: Screen; title: string; message: string; mood: MascotMood }[] = [
    { 
      screen: 'home', 
      title: 'HOME SECTION', 
      message: 'Yo bro! This is your Dashboard. Track your Daily Protocol and active Quests here. Consistency is your weapon.',
      mood: 'happy'
    },
    { 
      screen: 'progress', 
      title: 'PROGRESS SECTION', 
      message: 'Analyze your gains! Check your streaks, level up, and view your Trophy collection. Real power is documented here.',
      mood: 'surprised'
    },
    { 
      screen: 'leaderboard', 
      title: 'RANK SECTION', 
      message: 'See where you stand among other legends. Rise through the ranks by staying consistent every single day.',
      mood: 'boiling'
    },
    { 
      screen: 'profile', 
      title: 'PROFILE SECTION', 
      message: 'Your identity in the Nexora system. Customize your avatar and check your permanent record here.',
      mood: 'happy'
    },
    { 
      screen: 'library', 
      title: 'LIBRARY SECTION', 
      message: 'Your arsenal of power-ups and unlocked gear. Equip yourself for the mission from your stored assets.',
      mood: 'happy'
    },
    { 
      screen: 'notebook', 
      title: 'NOTEBOOK SECTION', 
      message: 'Log your mental updates. Discipline requires a sharp mind. Use this for reflection and focus.',
      mood: 'neutral'
    },
    { 
      screen: 'nexus-vision', 
      title: 'PLANT SECTION', 
      message: 'Your mental ecosystem. Growing your plant correlates with your real-world discipline. Keep it alive!',
      mood: 'happy'
    },
    { 
      screen: 'subscription', 
      title: 'SUBSCRIPTION SECTION', 
      message: 'Unlock elite protocols. Pro status grants you advanced artillery and exclusive system access.',
      mood: 'surprised'
    },
    { 
      screen: 'settings', 
      title: 'SETTINGS SECTION', 
      message: 'Finalize your setup. Adjust notifications and sync your feedback directly to HQ. You are ready.',
      mood: 'happy'
    }
  ];

  // WALKTHROUGH TRIGGER
  useEffect(() => {
    if (!isDataReady || !user || settings.isWalkthroughCompleted) return;
    
    const timer = setTimeout(() => {
      setShowWalkthrough(true);
      setWalkthroughStep(0);
      setActiveScreen('home');
      vibrate(VIBRATION_PATTERNS.NOTIFY);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isDataReady, user, settings.isWalkthroughCompleted]);

  const onNextWalkthroughStep = () => {
    if (walkthroughStep < WALKTHROUGH_STEPS.length - 1) {
      const nextStep = walkthroughStep + 1;
      setWalkthroughStep(nextStep);
      setActiveScreen(WALKTHROUGH_STEPS[nextStep].screen);
      vibrate(VIBRATION_PATTERNS.CLICK);
    } else {
      onFinishWalkthrough();
    }
  };

  const onFinishWalkthrough = async () => {
    setShowWalkthrough(false);
    onUpdateSettings({ isWalkthroughCompleted: true });
    // Bonus for finishing + permanent flag persistence
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { 
        coins: increment(50),
        totalPoints: increment(10),
        isWalkthroughCompleted: true
      });
    }
    showToast("WELCOME CACHE RECEIVED: +50 COINS! 🚀", "success");
    vibrate(VIBRATION_PATTERNS.SUCCESS);
  };

  // Space House Unlock Logic
  const isSpaceHouseUnlocked = useMemo(() => {
    const progress = settings.plantsProgress || {};
    const plantsArray = Object.values(progress);
    if (plantsArray.length < 3) return false;
    
    // Check if at least 3 plants have reached Stage 5
    const stage5Plants = plantsArray.filter(p => p.stage >= 5);
    return stage5Plants.length >= 3;
  }, [settings.plantsProgress]);
  
  // Calculate Global Mascot Mood for the Dynamic Icon (Duolingo Style)
  const globalMascotMood: MascotMood = useMemo(() => {
    if (!isDataReady) return 'neutral';
    
    const now = new Date();
    const hours = now.getHours();
    
    // 1. Boiling (Streak Power)
    if (stats.streak >= 3) return 'boiling';
    
    // 2. Angry (Reminder Mode)
    const isLate = hours >= 18;
    const tasksDone = (dailyProgress as any).completionsCount > 0;
    if (isLate && !tasksDone) return 'angry';
    
    // 3. Happy (Default progress)
    if (tasksDone) return 'happy';
    
    return 'neutral';
  }, [stats.streak, (dailyProgress as any).completionsCount, isDataReady]);

  // Apply Dynamic Icon & Badging (Duolingo-style)
  useAppIcon(globalMascotMood, stats, dailyProgress);

  const isPro = settings?.isPro || (settings?.proTestActive ? true : false);

  const currentAppVersion = "2.0.1"; // V2.0.1 Upgrade: Force Cache Reset
  const [activeScreen, setActiveScreen] = useLocalStorage<Screen>('nexora_active_screen', 'home');

  // SMART FEEDBACK TRIGGER
  useEffect(() => {
    if (!isDataReady || !user || activeScreen !== 'home' || settings.feedbackSubmitted) return;

    const lastPrompt = settings.lastFeedbackPromptDate ? new Date(settings.lastFeedbackPromptDate) : null;
    const now = new Date();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    const timeToPrompt = !lastPrompt || (now.getTime() - lastPrompt.getTime()) > SEVEN_DAYS_MS;
    const reachedMilestone = stats.totalPoints > 300 || (stats.level || 0) > 1;

    if (timeToPrompt && reachedMilestone) {
      const timer = setTimeout(() => {
        setShowFeedbackPrompt(true);
        vibrate(VIBRATION_PATTERNS.NOTIFY);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDataReady, user, activeScreen, settings.feedbackSubmitted, settings.lastFeedbackPromptDate, stats.totalPoints, stats.level]);

  const onDismissFeedback = () => {
    onUpdateSettings({ lastFeedbackPromptDate: new Date().toISOString() });
    setShowFeedbackPrompt(false);
  };

  const onAcceptFeedback = () => {
    setShowFeedbackPrompt(false);
    setActiveScreen('settings');
    setTimeout(() => {
      showToast("TAP 'SYNC FEEDBACK' TO SHARE YOUR LOGS!", "info");
    }, 500);
  };

  // Tracking screen views
  useEffect(() => {
    if (user && isDataReady) {
      trackEvent('screen_view', { screen_name: activeScreen });
    }
  }, [activeScreen, user, isDataReady]);

  // Tracking app open
  useEffect(() => {
    if (user && isDataReady) {
      trackEvent('app_opened', { 
        streak: stats.streak,
        coins: stats.coins,
        isPro: settings.isPro 
      });
    }
  }, [user, isDataReady]);

  // Handle URL parameters for PWA Shortcuts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen') as Screen | null;
    if (screenParam && ['home', 'challenge', 'nexus-vision', 'social', 'progress'].includes(screenParam)) {
      setActiveScreen(screenParam);
      // Clean up URL without refreshing
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Persistence and Version Sync
  useEffect(() => {
    if (!isDataReady) return;
    const storedVersion = localStorage.getItem('nexora_version');
    if (storedVersion && storedVersion !== currentAppVersion) {
      console.log(`PWA: New version detected: ${currentAppVersion}. Clearing stale caches.`);
      setShowUpdatePopup(true);
    }
    localStorage.setItem('nexora_version', currentAppVersion);
  }, [isDataReady]);

  // FIXED NOTIFICATION SCHEDULE
  const NOTIFICATION_SLOTS = useMemo(() => [
    { time: '07:30', topic: 'Motivation', body: 'Rise and shine, bro! Ready to crush your goals? 🚀' },
    { time: '10:00', topic: 'Morning Reminder', body: 'Mid-morning check-in! Keep that momentum high. 🔥' },
    { time: '14:30', topic: 'Afternoon Boost', body: 'Afternoon slump? Not for a Nexora legend! Let\'s go! ⚡' },
    { time: '18:30', topic: 'Motivation', body: 'Evening energy! Finish your day strong, bro! 🛡️' },
    { time: '20:30', topic: 'Evening Reflection', body: 'Time to reflect on your wins today. Deep breaths. 🧘' }
  ], []);

  useEffect(() => {
    if (!settings.notificationsEnabled || !isDataReady) return;

    const checkSchedule = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      const lastSent = JSON.parse(localStorage.getItem('nexora_sent_notifications') || '{}');
      
      NOTIFICATION_SLOTS.forEach(slot => {
        if (slot.time === timeStr && lastSent[slot.time] !== today) {
          sendNotification(`Nexora: ${slot.topic}`, { body: slot.body });
          lastSent[slot.time] = today;
          localStorage.setItem('nexora_sent_notifications', JSON.stringify(lastSent));
        }
      });
    };

    const interval = setInterval(checkSchedule, 60000);
    checkSchedule();
    return () => clearInterval(interval);
  }, [settings.notificationsEnabled, isDataReady, today, NOTIFICATION_SLOTS]);

  // SYSTEM NOTIFICATION LISTENER
  useEffect(() => {
    if (!user || !isDataReady) return;

    const notifRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notifRef, where('read', '==', false), orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const notifData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as SystemNotification;
        setActiveSystemNotification(notifData);
        vibrate(VIBRATION_PATTERNS.NOTIFY);
      }
    });

    return () => unsubscribe();
  }, [user, isDataReady]);

  const markSystemNotificationRead = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
      setActiveSystemNotification(null);
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { play, stop, playMusic, stopAllMusic } = useSound();
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [earnedTrophyToday, setEarnedTrophyToday] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [activeSystemNotification, setActiveSystemNotification] = useState<SystemNotification | null>(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("SYSTEM RECONNECTED: NEXUS SYNC RESTORED", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("SYSTEM OFFLINE: SHIELD ACTIVATED (LOCAL CACHE ENABLED)", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for slow network
    const conn = (navigator as any).connection;
    if (conn) {
      const handleConnChange = () => {
        if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
          showToast("SLOW NETWORK DETECTED: NEXORA OPTIMIZED MODE ACTIVE", "info");
        }
      };
      conn.addEventListener('change', handleConnChange);
      handleConnChange();
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        conn.removeEventListener('change', handleConnChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [activeCustomPlan, setActiveCustomPlan] = useState<CustomPlan | null>(null);
  const [viewingTrophy, setViewingTrophy] = useState<Trophy | null>(null);
  const [publicUserViewId, setPublicUserViewId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUserId = params.get('user');
    if (sharedUserId) {
      setPublicUserViewId(sharedUserId);
    }
  }, []);

  const onUpdateDailyProgress = (update: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress)) => {
    setDailyProgress(prev => typeof update === 'function' ? update(prev) : { ...prev, ...update });
  };

  useEffect(() => {
    let ticking = false;
    let prevScrollY = window.scrollY;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > prevScrollY && currentScrollY > 50) {
            setScrollDirection('down');
          } else if (currentScrollY < prevScrollY) {
            setScrollDirection('up');
          }
          prevScrollY = currentScrollY;
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUpdateProfile = async (name: string, photoURL: string) => {
    if (!user) return;
    try {
      // Update local state first
      onUpdateSettings({ displayName: name, profilePic: photoURL });
      
      // Update Firebase Auth if photoURL is provided
      if (photoURL && !photoURL.startsWith('data:')) {
         // This would usually be a URL from storage, but if they upload as base64 we just keep it in settings
      }

      // Sync to leaderboard immediately
      const leaderboardRef = doc(db, 'leaderboard', user.uid);
      await setDoc(leaderboardRef, {
        displayName: name,
        photoURL: photoURL
      }, { merge: true });

      showToast('Profile sync successful! 🛡️', 'success');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (err) {
      console.error(err);
      showToast('Profile update failed', 'error');
    }
  };

  useEffect(() => {
    if (!user) {
      setGlobalSavedVideos([]);
      return;
    }
    const q = query(collection(db, 'social_videos'), where('savedBy', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setGlobalSavedVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NexusVideo)));
    }, (err) => {
      console.error("Global saved videos fetch error:", err);
    });
    return unsub;
  }, [user]);

  const handleDeleteSavedVideo = async (vId: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'social_videos', vId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as NexusVideo;
        const newSavedBy = (data.savedBy || []).filter(id => id !== user.uid);
        await updateDoc(docRef, {
          savedBy: newSavedBy,
          saves: newSavedBy.length
        });
        showToast('Video removed from library, bro! 🛡️', 'success');
        vibrate(VIBRATION_PATTERNS.CLICK);
      }
    } catch (err) {
      console.error(err);
      showToast('Action failed', 'error');
    }
  };

  const handlePostVideo = async (videoData: any) => {
    if (!user) return;
    try {
      const postData = {
        ...videoData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        isAuthorized: true
      };
      
      await addDoc(collection(db, 'social_videos'), postData);
      showToast('Nexus Reel Published! 🚀', 'success');
      setActiveScreen('home'); 
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (err) {
      console.error("Studio Post Error:", err);
      showToast('Error fail to post', 'error');
      handleFirestoreError(err, OperationType.WRITE, 'social_videos');
    }
  };

  const buyHouseItem = (id: string, currency: 'streak' | 'coins') => {
    const item = HOUSE_ITEMS.find(i => i.id === id);
    if (!item) return;
    
    if (currency === 'coins') {
      if (stats.coins < item.coinPrice) {
        showToast("Not enough coins, bro! 🪙", "error");
        return;
      }
      setStats(prev => ({ ...prev, coins: prev.coins - item.coinPrice }));
    } else {
      if (stats.streak < item.price) {
        showToast("Streak not high enough, bro! 🔥", "error");
        return;
      }
    }
    
    onUpdateSettings({
      purchasedHouseItemIds: [...(settings.purchasedHouseItemIds || []), id]
    });
    showToast(`Purchased ${item.name}! 🏠`, "success");
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    if (settings.soundEnabled) play('coin');
  };

  const buyEcosystemItem = async (item: any) => {
    if (stats.coins < item.price) {
      showToast("Not enough coins, bro! 🪙", "error");
      return;
    }
    
    setStats(prev => ({ ...prev, coins: prev.coins - item.price }));
    
    const newPurchasedIds = [...(settings.purchasedEcosystemItemIds || []), item.id];
    onUpdateSettings({
      purchasedEcosystemItemIds: newPurchasedIds,
      hasNewPlantItem: true
    });

    // PERMANENT BACKEND REGISTRATION (Legacy support)
    if (user) {
      try {
        const itemRef = doc(db, 'users', user.uid, 'eco_shop', item.id);
        await setDoc(itemRef, {
          purchasedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Ecosystem item sync failed:", e);
      }
    }

    showToast(`Ecosystem upgraded: ${item.name}! 🌿`, "success");
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    if (settings.soundEnabled) play('coin');
    
    trackEvent('item_purchased', {
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      currency: 'coins'
    });
  };

  const toggleEcosystemItem = (itemId: string) => {
    const current = settings.activeEcosystemItemIds || [];
    const isActive = current.includes(itemId);
    const updated = isActive 
      ? current.filter(id => id !== itemId)
      : [...current, itemId];
    
    onUpdateSettings({ activeEcosystemItemIds: updated });
    vibrate(10);
  };

  const placeHouseItem = (id: string, x: number, y: number, room: number) => {
    const newItem: PlacedHouseItem = { 
      id: `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: id, 
      x, 
      y, 
      room 
    };
    onUpdateSettings({
      placedHouseItems: [...(settings.placedHouseItems || []), newItem]
    });
    vibrate(10);
  };

  const removeHouseItem = (instanceId: string) => {
    const itemToRemove = settings.placedHouseItems?.find(i => i.id === instanceId);
    const updatedItems = (settings.placedHouseItems || []).filter(item => item.id !== instanceId);
    
    onUpdateSettings({
      placedHouseItems: updatedItems,
      mascotPinnedItemId: (itemToRemove && settings.mascotPinnedItemId === itemToRemove.id) ? null : settings.mascotPinnedItemId
    });
    vibrate(5);
  };

  const updateHouseItemPosition = (instanceId: string, x: number, y: number) => {
    const currentItems = settings.placedHouseItems || [];
    const index = currentItems.findIndex(i => i.id === instanceId);
    if (index === -1) return;
    
    const movingItem = currentItems[index];

    // Update position and bring to front by moving it to the end of the array
    const otherItems = currentItems.filter(item => item.id !== instanceId);
    const updatedItem = { ...movingItem, x, y };
    const updatedItems = [...otherItems, updatedItem];

    // If mascot is pinned to this specific item instance, update mascot position relatively
    let mascotPos = settings.mascotPos;
    if (settings.mascotPinnedItemId === movingItem.id && mascotPos) {
      const dx = x - movingItem.x;
      const dy = y - movingItem.y;
      mascotPos = { x: mascotPos.x + dx, y: mascotPos.y + dy };
    }

    onUpdateSettings({ 
      placedHouseItems: updatedItems,
      mascotPos
    });
  };

  useEffect(() => {
    if (activeScreen === 'challenge') {
      setEmergencyActive(false);
    }
  }, [activeScreen]);

  const handleArchiveChallenge = (challengeId: string) => {
    const updated = [...(settings.archivedOfficialChallenges || []), challengeId];
    onUpdateSettings({ archivedOfficialChallenges: updated });
    showToast(`The ${challengeId} challenge has been archived.`, 'info');
    
    // Immediately pick a new one if it was current
    if (dailyQuest === challengeId) {
      const allSteps: ChallengeStep[] = ['pushups', 'water', 'breathing', 'drawing', 'football', 'bubbles', 'memory', 'reaction'];
      const available = allSteps.filter(s => !updated.includes(s));
      if (available.length > 0) {
        setDailyQuest(available[Math.floor(Math.random() * available.length)]);
      } else {
        setDailyQuest(null);
      }
    }
  };

  useEffect(() => {
    // Select a daily quest based on the date
    const allSteps: ChallengeStep[] = ['pushups', 'water', 'breathing', 'drawing', 'football', 'bubbles', 'memory', 'reaction'];
    const archived = settings.archivedOfficialChallenges || [];
    const available = allSteps.filter(s => !archived.includes(s));
    
    if (available.length === 0) {
      setDailyQuest(null);
      return;
    }

    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuest(available[dayOfYear % available.length]);
  }, [settings.archivedOfficialChallenges]);

  // Zen Mode Audio
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    if (settings.zenModeEnabled && (activeScreen === 'challenge' || activeScreen === 'home')) {
      audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Placeholder lo-fi
      audio.loop = true;
      audio.volume = 0.2;
      audio.play().catch(() => console.log("Audio play blocked by browser"));
    }
    return () => {
      if (audio) {
        audio.pause();
        audio = null;
      }
    };
  }, [settings.zenModeEnabled, activeScreen]);

  // PLANT LOGIC: GROWTH & HEALTH CHECKER
  const ECOSYSTEM_PATH: PlantType[] = ['sprout', 'zen', 'desert', 'tropical', 'forest', 'meadow', 'crystal', 'volcano', 'boredFlower', 'mourningSprout', 'breezeTulip', 'happyTulip', 'distressedRose'];

  const growPlant = useCallback(() => {
    setSettings(prev => {
      const type = prev.plantState?.type || 'sprout';
      const plants = prev.plantsProgress || {};
      
      const current = plants[type] || {
        stage: prev.plantState?.stage || 0,
        growthPoints: prev.plantState?.growthPoints || 0,
        lastGrowthDate: prev.plantState?.lastGrowthDate || null,
        health: prev.plantState?.health || 100,
        isDead: prev.plantState?.isDead || false,
        isThirsty: prev.plantState?.isThirsty || false,
      };
      
      if (current.isDead) return prev;

      const activeItems = prev.activeEcosystemItemIds || [];
      const hasUV = activeItems.includes('eco_uv_lamp_01');
      const hasDrone = activeItems.includes('eco_drone_01');
      
      let growthAmount = 15;
      if (hasUV) growthAmount *= 2;
      if (hasDrone) growthAmount += 2; // Passive bonus

      let newPoints = current.growthPoints + growthAmount;
      let newStage = current.stage;
      let newUnlocked = [...(prev.plantState?.unlockedTypes || ['sprout'])];
      
      if (newPoints >= 100) {
        if (newStage < 5) {
          newStage += 1;
          newPoints = 0;
          vibrate(VIBRATION_PATTERNS.SUCCESS);
          showToast(`Your ${type.toUpperCase()} grew to Stage ${newStage}! 🌿✨`, 'success');
          
          // Plant unlock logic based on User Level (as requested: every 5 levels)
          const userLevel = Math.floor((stats.totalPoints || 0) / 100) + 1;
          if (userLevel >= 5 && userLevel % 5 === 0) {
            const currentIdx = ECOSYSTEM_PATH.indexOf(type);
            if (currentIdx !== -1 && currentIdx < ECOSYSTEM_PATH.length - 1) {
              const nextType = ECOSYSTEM_PATH[currentIdx + 1];
              if (!newUnlocked.includes(nextType)) {
                newUnlocked.push(nextType);
                showToast(`Level ${userLevel} Legend! New Ecosystem Unlocked: ${nextType.toUpperCase()}! 🏆`, 'success');
                // Set flag for golden glow notification
                localStorage.setItem('nexora_new_plant_unlocked', 'true');
                
                // SpaceHouse Unlock Flow
                if (newUnlocked.length >= 4 && !settings.spaceHouseUnlocked) {
                  setShowCelebration(true);
                  if (settings.soundEnabled) play('fire_streak');
                }
              }
            }
          }
        } else {
          newPoints = 100;
        }
      } else {
        showToast(`Energy gathered for ${type}! +15% Energy 💧`, 'success');
      }

      const updatedPlantProgress = {
        ...current,
        stage: newStage,
        growthPoints: newPoints,
        lastGrowthDate: new Date().toISOString(),
        health: 100,
        isThirsty: false
      };

      return {
        ...prev,
        plantsProgress: {
          ...plants,
          [type]: updatedPlantProgress
        },
        plantState: {
          ...prev.plantState,
          type,
          stage: newStage,
          growthPoints: newPoints,
          unlockedTypes: newUnlocked,
          isDead: false,
          isThirsty: false,
          health: 100
        }
      };
    });
  }, [settings.plantState, settings.plantsProgress]);

  useEffect(() => {
    if (!user) return;

    // Initialize plant if not exists
    if (isDataReady && !settings.plantState) {
        onUpdateSettings({
            plantState: {
                type: 'sprout',
                stage: 0,
                growthPoints: 0,
                lastGrowthDate: null,
                lastCheckDate: new Date().toISOString(),
                health: 100,
                isDead: false,
                isThirsty: false,
                unlockedTypes: ['sprout']
            }
        });
        return;
    }

    if (!settings.plantState) return;
    
    const checkPlant = () => {
      const now = new Date();
      const lastCheck = new Date(settings.plantState!.lastCheckDate || now.toISOString());
      const diffMs = now.getTime() - lastCheck.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      const activeItems = settings.activeEcosystemItemIds || [];
      const hasSprinkler = activeItems.includes('eco_sprinkler_01');
      const deathThreshold = 48;
      const thirstThreshold = hasSprinkler ? 48 : 36; // Sprinkler buys time
      
      if (diffHours >= deathThreshold && !settings.plantState!.isDead) { // 2 days
        const type = settings.plantState!.type;
        const currentProgress = settings.plantsProgress?.[type] || {
          stage: settings.plantState!.stage,
          growthPoints: settings.plantState!.growthPoints,
          lastGrowthDate: settings.plantState!.lastGrowthDate,
          health: 100,
          isDead: false,
          isThirsty: false
        };

        const updatedProgress = { ...currentProgress, isDead: true, health: 0, isThirsty: true };

        onUpdateSettings({
          plantState: {
            ...settings.plantState!,
            isDead: true,
            health: 0,
            isThirsty: true,
            lastCheckDate: now.toISOString()
          },
          plantsProgress: {
            ...(settings.plantsProgress || {}),
            [type]: updatedProgress
          }
        });
        sendNotification("Your Nexora Ecosystem has died... 🥀", { body: "Bro, your plants need discipline! Restore the room and try again." });
      } else if (diffHours >= thirstThreshold && !settings.plantState!.isThirsty && !settings.plantState!.isDead) { // 1.5 days or 2 days with tech
        const type = settings.plantState!.type;
        const currentProgress = settings.plantsProgress?.[type] || {
           stage: settings.plantState!.stage,
           growthPoints: settings.plantState!.growthPoints,
           lastGrowthDate: settings.plantState!.lastGrowthDate,
           health: 100,
           isDead: false,
           isThirsty: false
        };
        const updatedProgress = { ...currentProgress, isThirsty: true };

        onUpdateSettings({
          plantState: {
            ...settings.plantState!,
            isThirsty: true
          },
          plantsProgress: {
            ...(settings.plantsProgress || {}),
            [type]: updatedProgress
          }
        });
        sendNotification("Your ecosystem is thirsty! 💧", { body: "Nurture your plants by completing your daily tasks, bro!" });
      }
    };

    checkPlant();
    const timer = setInterval(checkPlant, 30 * 60 * 1000); 
    return () => clearInterval(timer);
  }, [user, settings.plantState?.lastCheckDate, isDataReady]);

  // Global Social Listeners
  useEffect(() => {
    if (!user) return;
    
    // Fetch Notifications
    const qNotifs = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'), limit(20));
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NexusNotification));
      setNotifications(notifs);
      setUnreadNotifCount(notifs.filter(n => !n.isRead).length);
    });

    // Fetch Circles
    const qCircles = query(collection(db, 'circles'), orderBy('memberCount', 'desc'));
    const unsubCircles = onSnapshot(qCircles, (snapshot) => {
      const circlesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialCircle));
      if (circlesData.length === 0) {
        setCircles([
          { 
            id: 'nexora-general', 
            name: 'Nexora General', 
            description: 'The main hub for all Nexora members.', 
            icon: '🏛️', 
            color: 'bg-blue-100', 
            memberCount: 1250, 
            category: 'general',
            ownerId: 'system',
            rules: ['Be respectful', 'No spam', 'Stay focused'],
            followerIds: [],
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        setCircles(circlesData);
      }
    });

    // Fetch Posts
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    });

    return () => {
      unsubNotifs();
      unsubCircles();
      unsubPosts();
    };
  }, [user]);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmError, setFcmError] = useState<string | null>(null);

  const sendNotification = async (title: string, options: NotificationOptions) => {
    // 1. Local Browser Notification (Immediate feedback if app is open)
    if (('Notification' in window) && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options);
        });
      } else {
        new Notification(title, options);
      }
    }

    // 2. Server-Side FCM Notification (For background/closed app support)
    // We try this regardless of local permission if we have a token, 
    // as it might reach other devices where permission IS granted.
    if (fcmToken) {
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: fcmToken,
            title: title,
            body: options.body || '',
          }),
        });
      } catch (error) {
        console.error('Error sending server-side notification:', error);
      }
    }
  };

  // Version Update Logic
  const [updateInfo, setUpdateInfo] = useState<{ version: string, releaseNotes: string[], forceUpdate: boolean, imageUrl?: string } | null>(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(localStorage.getItem('nexora_last_update_time'));

  // Background Music Logic
  useEffect(() => {
    if (!settings.soundEnabled) {
      stopAllMusic();
      return;
    }

    const activeMusicItem = (settings.inventory || []).find(item => item.type === 'music' && item.activated);
    if (activeMusicItem) {
      playMusic(activeMusicItem.itemId);
    } else {
      stopAllMusic();
    }
  }, [settings.inventory, settings.soundEnabled]);

  // App Badge Logic
  useEffect(() => {
    const updateBadge = async () => {
      // Check if the App Badging API is supported
      if (!('setAppBadge' in navigator)) {
        console.warn('PWA: App Badging API not supported in this browser/mode. (Must be in Standalone/PWA mode on supported OS)');
        return;
      }

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        console.warn('PWA: App is not running in standalone mode. Badges might not appear on the home screen icon.');
      }

      let count = 0;
      const badgeSettings = settings.badgeSettings || {
        trophyAlerts: true,
        appUpdates: true,
        dailyChallenge: true,
        dailyQuest: true,
        dynamicUrgency: true
      };
      const now = new Date();
      
      // 1. Trophy degradation alert (High priority)
      if (badgeSettings.trophyAlerts && emergencyActive) {
        count++;
        console.log('PWA Badge: Trophy emergency active');
      }
      
      // 2. App update available
      if (badgeSettings.appUpdates && showUpdatePopup) {
        count++;
        console.log('PWA Badge: App update available (showUpdatePopup is true)');
      }
      
      // 2.5 New content badge (For 24 hours after update)
      if (lastUpdateTime && badgeSettings.appUpdates) {
        const updateDate = new Date(lastUpdateTime);
        const diff = now.getTime() - updateDate.getTime();
        if (diff < 24 * 60 * 60 * 1000) {
          count++;
          console.log('PWA Badge: Recent update (24h window)');
        }
      }
      
      // 3. Daily challenge not completed (If it's after 6 PM)
      if (badgeSettings.dailyChallenge && !dailyProgress.completed && now.getHours() >= 18) {
        count++;
        console.log('PWA Badge: Daily challenge not done (Evening)');
        // Dynamic Urgency: Add another count if it's after 10 PM
        if (badgeSettings.dynamicUrgency && now.getHours() >= 22) {
          count++;
          console.log('PWA Badge: Dynamic urgency active (>10 PM)');
        }
      }
      
      // 4. Daily quest not done (If it's after 12 PM)
      if (badgeSettings.dailyQuest && !dailyProgress.dailyQuestDone && now.getHours() >= 12) {
        count++;
        console.log('PWA Badge: Daily quest not done');
      }

      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
          console.log(`PWA Badge: Successfully set to ${count} (Update: ${showUpdatePopup}, Emergency: ${emergencyActive}, LastUpdate: ${lastUpdateTime})`);
        } else {
          await (navigator as any).clearAppBadge();
          console.log('PWA Badge: Cleared (Count is 0)');
        }
      } catch (error) {
        console.error('PWA Badge: Error calling setAppBadge:', error);
      }
    };

    updateBadge();
    
    // Update every minute to handle time-based badges
    const intervalId = setInterval(updateBadge, 60000);
    return () => clearInterval(intervalId);
  }, [emergencyActive, showUpdatePopup, dailyProgress.completed, dailyProgress.dailyQuestDone, settings.badgeSettings, lastUpdateTime]);

  const handleUpdate = async () => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    if (updateInfo) {
      const now = new Date().toISOString();
      localStorage.setItem('nexora_dismissed_version', updateInfo.version);
      localStorage.setItem('nexora_last_update_time', now);
      localStorage.setItem('nexora_version', updateInfo.version);
      setLastUpdateTime(now);
    }
    
    // Nuclear Update: Unregister SW and clear all caches to ensure a fresh fetch
    try {
      showToast("REBOOTING SYSTEM... STAND BY", "info");
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      console.log('PWA: Caches cleared and Service Worker unregistered. Reloading...');
    } catch (err) {
      console.error('PWA: Error during nuclear update:', err);
    }

    // Clear session storage just in case
    sessionStorage.clear();

    // Forced fresh reload
    window.location.href = '/?v=' + (updateInfo?.version || Date.now()); 
  };

  // Version check interval - Optimized for performance
  useEffect(() => {
    if (!isDataReady) return;
    const checkVersion = async () => {
      try {
        // Use cache: 'no-store' to ensure we get the latest file from the server
        const response = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            const dismissedVersion = localStorage.getItem('nexora_dismissed_version');
            console.log('PWA: Version check - Current:', currentAppVersion, 'Fetched:', data.version, 'Dismissed:', dismissedVersion);
            
            if (dismissedVersion !== data.version) {
              console.log('PWA: New version or unseen update detected:', data.version);
              setUpdateInfo(data);
              
              if (data.forceUpdate) {
                console.log('PWA: Force update active. Triggering sequence.');
                handleUpdate();
              } else {
                setShowUpdatePopup(true);
              }
              
              // If it's a new version, we should also ensure the badge is set immediately
              if ('setAppBadge' in navigator) {
                console.log('PWA: Setting initial update badge');
                (navigator as any).setAppBadge(1).catch(console.error);
              }
            } else {
              console.log('PWA: No new update or already dismissed');
            }
          } else {
            const text = await response.text();
            console.error('Expected JSON for version check, but got:', contentType, text.substring(0, 100));
          }
        }
      } catch (error) {
        console.error('Error checking version:', error);
      }
    };

    // Check immediately on mount
    checkVersion();
    
    // Monitor Service Worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: Controller changed, new Service Worker is active');
        // We don't force reload here to avoid interrupting the user, 
        // but we know we're ready for the next reload.
      });
    }

    // Set last update time for 1.5.1 if not set
    if (!localStorage.getItem('nexora_last_update_time')) {
      const now = new Date().toISOString();
      localStorage.setItem('nexora_last_update_time', now);
      setLastUpdateTime(now);
    }

    // Check every 2 minutes
    const interval = setInterval(checkVersion, 120000);
    return () => clearInterval(interval);
  }, []);

  const sendTestNotification = async () => {
    // Diagnose health first if needed
    try {
      const health = await fetch('/api/health');
      if (!health.ok) {
        showToast('Server Health Check Failed. Is the server running?', 'error');
      }
    } catch (e) {
      console.warn('Health check failed', e);
    }

    if (!fcmToken) {
      showToast('No device token found. Please ensure notifications are enabled in browser settings.', 'error');
      console.error('FCM Token missing');
      return;
    }

    console.log('Sending test notification to token:', fcmToken);
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          title: 'Nexora Challenge BRO! 🚀',
          body: 'This is a test notification from your app. It works!',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server Error (Notification):', response.status, text);
        showToast(`Server Error (${response.status}): ` + (text.substring(0, 100) || response.statusText), 'error');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast('Test notification sent! Check your device.', 'success');
      } else {
        console.error('Notification send failure:', data.error);
        showToast('Failed to send: ' + data.error, 'error');
      }
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      showToast('Connection Error: ' + error.message, 'error');
    }
  };

  const sendMotivation = async () => {
    if (!fcmToken) {
      showToast('Notification token missing. Enable notifications first!', 'error');
      return;
    }

    console.log('Requesting AI Motivation for token:', fcmToken);
    try {
      const response = await fetch('/api/send-motivation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server Error (Motivation):', response.status, text);
        showToast('Server Error: ' + (text.substring(0, 100) || response.statusText), 'error');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast('AI Motivation transmitted! 🔥', 'success');
      } else {
        console.error('Motivation send failure:', data.error);
        showToast('Sync Failed: ' + data.error, 'error');
      }
    } catch (error: any) {
      console.error('Error sending motivation:', error);
      showToast('Sync Error: ' + error.message, 'error');
    }
  };

  const sendTestEmail = async () => {
    if (!user?.email) {
      showToast('No user email found.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'email',
          email: user.email,
          title: 'Nexora Email Test! 📧',
          body: 'Hey bro, this is a test email from your Nexora app. It works!',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        showToast('Server Error: ' + (text.substring(0, 50) || response.statusText), 'error');
        return;
      }

      const data = await response.json();
      if (data.success) {
        showToast('Test email sent to ' + user.email, 'success');
      } else {
        showToast('Failed to send email: ' + data.error, 'error');
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  // Auto-setup FCM when notifications are enabled
  useEffect(() => {
    if (settings.notificationsEnabled && !fcmToken && !fcmError) {
      console.log('FCM: Notifications enabled but no token, triggering setup...');
      setupFCM();
    }
  }, [settings.notificationsEnabled, fcmToken, fcmError]);

  const setupFCM = async () => {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || VAPID_KEY;
    console.log('FCM: Starting setup with VAPID key:', vapidKey.substring(0, 10) + '...');
    setFcmError(null);
    try {
      // 1. Check if token already exists in localStorage (Legacy check)
      const cachedToken = localStorage.getItem('nexora_fcm_token');
      if (cachedToken && !fcmToken) {
        console.log('FCM: Restored from localStorage:', cachedToken.substring(0, 8) + '...');
        setFcmToken(cachedToken);
      }

      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('FCM: Notification permission denied.');
          setFcmError('PERMISSION_DENIED');
          return;
        }
      }

      const m = await messaging();
      if (!m) {
        console.warn('FCM: Messaging not supported in this browser.');
        setFcmError('NOT_SUPPORTED');
        return;
      }
      
      // Ensure service worker is ready
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('FCM: Service Worker ready:', registration.scope);
        
        const token = await getToken(m, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          console.log('FCM Device Token Acquired:', token);
          setFcmToken(token);
          localStorage.setItem('nexora_fcm_token', token);
          
          // Only update settings if it's different to prevent loops
          if (settings.fcmToken !== token) {
            setSettings(prev => ({ ...prev, fcmToken: token, notificationsEnabled: true }));
          }
        } else {
          console.warn('FCM: No token received from getToken.');
          setFcmError('NO_TOKEN');
        }
      } else {
        setFcmError('NO_SW');
      }
    } catch (error: any) {
      console.error('Error setting up FCM:', error);
      setFcmError(error.message || 'UNKNOWN_ERROR');
      
      // Fallback: If we had a cached token, use it anyway even if fresh fetch failed
      const cachedToken = localStorage.getItem('nexora_fcm_token');
      if (cachedToken) {
        setFcmToken(cachedToken);
      }
    }
  };

  useEffect(() => {
    if (user && fcmToken) {
      const saveToken = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          await updateDoc(userRef, {
            fcmToken: fcmToken,
            notificationsEnabled: true,
            timezone: tz,
            'settings.fcmToken': fcmToken,
            'settings.notificationsEnabled': true,
            'settings.timezone': tz
          });
          console.log('FCM: Token and Timezone saved to Firestore.');
        } catch (e) {
          console.error('FCM: Failed to save token:', e);
        }
      };
      saveToken();
    }
  }, [user, fcmToken]);

  // Foreground Notification Listener
  useEffect(() => {
    if (!fcmToken) return;
    
    let unsubscribe: () => void;
    
    const setupListener = async () => {
      const m = await messaging();
      if (!m) return;
      
      console.log('FCM: Setting up foreground message listener...');
      unsubscribe = onMessage(m, (payload) => {
        console.log('FCM: Foreground message received!', payload);
        if (payload.notification) {
          // Add notification to historical notifications list if applicable
          setNotifications(prev => [{
            id: Date.now().toString(),
            userId: user.uid,
            senderId: 'nexora-system',
            senderName: 'Nexora 🔥',
            message: `${payload.notification?.title}: ${payload.notification?.body}`,
            isRead: false,
            createdAt: new Date().toISOString(),
            type: 'system'
          }, ...prev]);
          setUnreadNotifCount(prev => prev + 1);

          showToast(`🔔 ${payload.notification.title}: ${payload.notification.body}`, 'info');
          if (settings.soundEnabled) play('nav_switch');
          vibrate(VIBRATION_PATTERNS.LIGHT);
        }
      });
    };

    setupListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fcmToken, settings.soundEnabled]);

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

  // Daily Reminder Timer removed from here and moved after customPlans definition

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
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      showToast('Payment successful! Your Pro features are being unlocked... 🚀', 'success');
      // Clear the URL param
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    setActiveScreen('home'); // Ensure home is default after major state transitions
  }, [user]);

  // 11. Leaderboard Data Fetching
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);
  
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'customPlans'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomPlan));
        setCustomPlans(plans);
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'customPlans');
        } catch (e) {
          console.error("Firestore error handled:", e);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Daily & Custom Plan Reminder Timer
  useEffect(() => {
    const checkReminders = () => {
      if (!settings.notificationsEnabled) return;
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];
      
      // Morning Reminder
      if (currentTimeStr === '08:00') {
        const lastMorningKey = `nexora_morning_${todayStr}`;
        if (!localStorage.getItem(lastMorningKey)) {
          sendNotification('Good Morning bro! 🌅', {
            body: 'Hey 👋 Ready to crush today’s challenges?',
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          localStorage.setItem(lastMorningKey, 'true');
        }
      }

      // Afternoon Reminder
      if (currentTimeStr === '14:00') {
        const lastAfternoonKey = `nexora_afternoon_${todayStr}`;
        if (!localStorage.getItem(lastAfternoonKey)) {
          sendNotification('Afternoon Check-in ☀️', {
            body: 'Keep the momentum going, bro! Don\'t forget your challenges!',
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          localStorage.setItem(lastAfternoonKey, 'true');
        }
      }

      // Evening Reminder
      if (currentTimeStr === '19:00') {
        const lastEveningKey = `nexora_evening_${todayStr}`;
        if (!localStorage.getItem(lastEveningKey)) {
          sendNotification('Evening Wrap-up 🌙', {
            body: 'Time to finish strong, bro! Complete any remaining goals.',
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          localStorage.setItem(lastEveningKey, 'true');
        }
      }

      // Daily Motivation Reminder
      if (currentTimeStr === '12:00') {
        const lastMotivationKey = `nexora_last_motivation_${todayStr}`;
        if (!localStorage.getItem(lastMotivationKey)) {
          const quotes = [
            "The only way to do great work is to love what you do. 🔥",
            "Believe you can and you're halfway there. 🚀",
            "Your limitation—it's only your imagination. ✨",
            "Push yourself, because no one else is going to do it for you. 💪",
            "Great things never come from comfort zones. 🏆",
            "Dream it. Wish it. Do it. 🌟",
            "Success doesn’t just find you. You have to go out and get it. ⚡"
          ];
          const quote = quotes[Math.floor(Math.random() * quotes.length)];
          sendNotification('Daily Motivation! 💡', {
            body: quote,
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          localStorage.setItem(lastMotivationKey, 'true');
        }
      }

      // Midnight Challenge Restart Notification
      if (currentTimeStr === '00:00') {
        const lastRestartKey = `nexora_last_restart_${todayStr}`;
        if (!localStorage.getItem(lastRestartKey)) {
          sendNotification('New Day, New Goals! 🌅', {
            body: 'Challenges have been restarted! Let\'s crush it today, bro!',
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          localStorage.setItem(lastRestartKey, 'true');
        }
      }

      // Custom Plan Reminders
      customPlans.forEach(plan => {
        if (plan.reminderTime === currentTimeStr || plan.reminderTime2 === currentTimeStr) {
          const currentDay = now.getDay();
          if (plan.days.includes(currentDay)) {
            const lastPlanReminderKey = `nexora_last_reminder_${plan.id}_${currentTimeStr}_${todayStr}`;
            if (!localStorage.getItem(lastPlanReminderKey)) {
              sendNotification(`${plan.name} 🚀`, {
                body: `Time for your custom plan: ${plan.name}! Let's go!`,
                icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
              });
              localStorage.setItem(lastPlanReminderKey, 'true');
            }
          }
        }
      });

      // Automatic Trophy Check (Periodic)
      checkTrophies();
    };

    // Check every 30 seconds to be more precise and avoid missing the minute mark
    const interval = setInterval(checkReminders, 30000);
    
    // Also check immediately
    checkReminders();

    return () => clearInterval(interval);
  }, [settings.notificationsEnabled, settings.reminderTime, settings.reminderTime2, settings.motivationTime, customPlans]);

  const handleSaveCustomPlan = async (plan: CustomPlan) => {
    if (!user) return;
    try {
      const planWithUser = { ...plan, userId: user.uid };
      const planRef = doc(db, 'customPlans', plan.id);
      await setDoc(planRef, planWithUser);
      showToast('Plan created successfully!', 'success');
      setActiveScreen('home');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (error) {
      console.error("Plan save error:", error);
      showToast('Could not save plan bro. Check connection.', 'error');
      try {
        handleFirestoreError(error, OperationType.WRITE, 'customPlans');
      } catch (e) {
        console.error("Firestore error handled:", e);
      }
      // Force exit builder if it hangs on network
      setActiveScreen('home');
    }
  };

  const handleDeleteCustomPlan = async (planId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'customPlans', planId));
      showToast('Plan deleted', 'info');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, 'customPlans');
      } catch (e) {
        console.error("Firestore error handled:", e);
      }
    }
  };

  useEffect(() => {
    if (user && isDataReady) {
      // Weekly Reset Logic
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
      if (stats.lastWeeklyReset !== startOfWeek) {
        setStats(prev => ({
          ...prev,
          weeklyPoints: 0,
          weeklyXP: 0,
          lastWeeklyReset: startOfWeek
        }));
      }

      // Pro Daily Gift Logic
      if (settings.isPro && stats.lastGiftDate !== today) {
        setStats(prev => ({
          ...prev,
          coins: (prev.coins || 0) + 50,
          lastGiftDate: today
        }));
        showToast(`Pro Daily Gift: +50 Coins! 🎁`, 'success');
      }

      // Leaderboard Listener
      const q = query(
        collection(db, 'leaderboard'), 
        where('league', '==', settings.league || 'Bronze'),
        orderBy('weeklyXP', 'desc'), 
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let data = snapshot.docs.map(doc => doc.data() as any);
        
        // BOT SYSTEM: If leaderboard is too empty, add some competitive AI players
        if (data.length < 5) {
          const bots = [
            { uid: 'bot-1', displayName: 'Apex_Habit', weeklyXP: 1200, weeklyPoints: 1200, level: 12, streak: 45, league: settings.league || 'Bronze' },
            { uid: 'bot-2', displayName: 'Zen_Master', weeklyXP: 950, weeklyPoints: 950, level: 10, streak: 32, league: settings.league || 'Bronze' },
            { uid: 'bot-3', displayName: 'HabitHero_99', weeklyXP: 750, weeklyPoints: 750, level: 8, streak: 15, league: settings.league || 'Bronze' },
            { uid: 'bot-4', displayName: 'FlowState', weeklyXP: 500, weeklyPoints: 500, level: 6, streak: 8, league: settings.league || 'Bronze' },
          ];
          data = [...data, ...bots];
        }

        if (user && !data.find(d => d.uid === user.uid)) {
          data.push({
            uid: user.uid,
            displayName: settings.displayName || 'Anonymous',
            photoURL: settings.profilePic || user.photoURL || '',
            weeklyXP: stats.weeklyXP || 0,
            weeklyPoints: stats.weeklyPoints || 0,
            level: Math.floor((stats.totalPoints || 0) / 100) + 1,
            streak: stats.streak || 0,
            league: settings.league || 'Bronze'
          });
        }
        setLeaderboard(data.sort((a, b) => (b.weeklyXP || 0) - (a.weeklyXP || 0)));
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'leaderboard');
        } catch (e) {
          console.error("Firestore error handled:", e);
        }
      });
      return () => unsubscribe();
    }
  }, [user, isDataReady, settings.league, stats.lastWeeklyReset, stats.lastGiftDate, today, settings.isPro, stats.weeklyXP, settings.displayName, settings.profilePic]);

  const userRank = leaderboard.findIndex(l => l.uid === user?.uid) + 1;

  // Midnight rollover
  useEffect(() => {
    if (isDataReady && dailyProgress.date && dailyProgress.date !== today) {
      setDailyProgress({
        date: today,
        completed: false,
        completionsCount: 0,
        pushupsDone: false,
        waterDrank: 0,
        breathingDone: false,
        drawingDone: false,
        footballDone: false,
        bubblesDone: false,
        memoryDone: false,
        gratitudeDone: false,
        reactionDone: false,
        meditationDone: false,
        writingDone: false,
        nextRestorationTime: null
      } as any);
    }
  }, [today, dailyProgress.date, isDataReady]);

  // CHALLENGE LIMIT RESTORATION LOGIC
  useEffect(() => {
    if (isDataReady && dailyProgress && dailyProgress.completionsCount > 0 && !isPro) {
      const interval = setInterval(() => {
        const now = Date.now();
        const nextTime = dailyProgress.nextRestorationTime || (now + 4 * 60 * 60 * 1000);
        
        if (now >= nextTime) {
          setDailyProgress(prev => {
            if (!prev.nextRestorationTime) return prev;
            // Calculate how many 4-hour chunks have passed since the original target time
            const timePassedSinceTarget = now - prev.nextRestorationTime;
            const chunksPassed = Math.floor(timePassedSinceTarget / (4 * 60 * 60 * 1000)) + 1;
            
            const newCount = Math.max(0, prev.completionsCount - chunksPassed);
            const nextRest = newCount > 0 ? (prev.nextRestorationTime + chunksPassed * 4 * 60 * 60 * 1000) : null; 
            return {
              ...prev,
              completionsCount: newCount,
              nextRestorationTime: nextRest
            };
          });
        } else if (!dailyProgress.nextRestorationTime) {
          setDailyProgress(prev => ({
            ...prev,
            nextRestorationTime: nextTime
          }));
        }
      }, 5000); 
      return () => clearInterval(interval);
    } else if (isPro && dailyProgress.nextRestorationTime) {
      // Clear timer for Pro users
      setDailyProgress(prev => ({
        ...prev,
        nextRestorationTime: null
      }));
    }
  }, [dailyProgress?.completionsCount, dailyProgress?.nextRestorationTime, isPro, isDataReady]);

  // Optimized History calculation using useMemo to avoid O(N) calculation on every render
  const memoizedHistory = useMemo(() => {
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('nexora_progress_'));
    return allKeys.map(k => {
      try {
        return JSON.parse(localStorage.getItem(k) || '{}');
      } catch (e) {
        return {};
      }
    })
      .filter(item => item && item.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyProgress.date]); // Only recalculate if date changes (new day)

  useEffect(() => {
    setHistory(memoizedHistory);
  }, [memoizedHistory]);

  // Trophy Alert Logic (Side-effect separated from state update for reliability)
  const [lastTrophyAlert, setLastTrophyAlert] = useState<{ id: string, type: string }[]>([]);
  
  useEffect(() => {
    if (!isDataReady || !settings.badgeSettings?.trophyAlerts) return;
    
    const currentTrophyStates = stats.trophies.map(t => ({ id: t.id, type: t.type }));
    
    // Compare with last known states to find transitions
    if (lastTrophyAlert.length === 0) {
      setLastTrophyAlert(currentTrophyStates);
      return;
    }

    currentTrophyStates.forEach(curr => {
      const prev = lastTrophyAlert.find(p => p.id === curr.id);
      if (prev && prev.type !== curr.type) {
        if (curr.type === 'ice') {
          sendNotification('Trophy Alert! 🧊', {
            body: 'One of your trophies just turned to ICE! Complete a challenge now to save it!',
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          if (settings.soundEnabled) playTrophySound('ice');
          showToast("TROPHY ALERT: ICE DETECTED! 🧊", "info");
        } else if (curr.type === 'broken') {
          sendNotification('Trophy Alert! 💔', {
            body: 'Oh no! A trophy has BROKEN! Don\'t let more break, bro!',
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          if (settings.soundEnabled) playTrophySound('broken');
          showToast("TROPHY ALERT: SHATTERED! 💔", "error");
        }
      }
    });

    setLastTrophyAlert(currentTrophyStates);
  }, [stats.trophies, isDataReady, settings.badgeSettings?.trophyAlerts, settings.soundEnabled]);

  const checkTrophies = useCallback(() => {
    onUpdateStats((prevStats) => {
      if (!prevStats.trophies || prevStats.trophies.length === 0) return prevStats;
      
      const now = Date.now();
      let changed = false;
      
      const trophies = prevStats.trophies || [];
      const updatedTrophies = trophies.map(t => {
        const earnedTime = new Date(t.earnedDate).getTime();
        const daysSince = (now - earnedTime) / (1000 * 60 * 60 * 24);
        
        // Revised thresholds: Golden->Ice (3 days), Ice->Broken (5 days)
        if (t.type === 'golden' && daysSince >= 3) {
          changed = true;
          return { ...t, type: 'ice' as const, lastUpdated: new Date().toISOString() };
        }
        if (t.type === 'ice' && daysSince >= 5) {
          changed = true;
          return { ...t, type: 'broken' as const, lastUpdated: new Date().toISOString() };
        }
        return t;
      });
      
      if (changed) {
        return { ...prevStats, trophies: updatedTrophies };
      }
      return prevStats;
    });
  }, [onUpdateStats]);

  // Trophy degradation logic
  useEffect(() => {
    if (!isDataReady) return;
    const timer = setTimeout(checkTrophies, 2000); // Check shortly after load
    return () => clearTimeout(timer);
  }, [checkTrophies, isDataReady]);

  const handleCompleteChallenge = async (finalProgress?: DailyProgress, isCustomPlanFlag?: boolean) => {
    // Immediate sound feedback for better UX
    if (settings.soundEnabled) {
      play('challenge_unlock'); 
    }
    
    setEmergencyActive(false);
    const progress = finalProgress || dailyProgress;
    const isCustomPlan = isCustomPlanFlag ?? activeCustomPlan !== null;

    // Restoring ice trophies logic
    onUpdateStats(prev => {
      const hasIce = prev.trophies?.some(t => t.type === 'ice');
      if (hasIce) {
        const updated = prev.trophies.map(t => {
          if (t.type === 'ice') return { ...t, type: 'golden' as const, lastUpdated: new Date().toISOString() };
          return t;
        });
        showToast("TROPHY RESTORED TO GOLD! 🔥", "success");
        return { ...prev, trophies: updated };
      }
      return prev;
    });

    // Calculate how many tasks were actually completed in this session
    const completedTasksList = Object.entries(progress).filter(([key, value]) => 
      ['pushupsDone', 'waterDrank', 'breathingDone', 'drawingDone', 'footballDone', 'bubblesDone', 'memoryDone', 'gratitudeDone', 'reactionDone', 'meditationDone', 'writingDone'].includes(key) && 
      (typeof value === 'boolean' ? value === true : (typeof value === 'number' ? value > 0 : false))
    );
    const completedTasks = completedTasksList.length;

    if (isCustomPlan && user && activeCustomPlan) {
      const customPlanRef = doc(collection(db, 'users', user.uid, 'custom_progress'));
      setDoc(customPlanRef, {
        planId: activeCustomPlan.id,
        planName: activeCustomPlan.name,
        completedAt: serverTimestamp(),
        date: today
      }).catch(e => console.error("Failed to save custom plan progress", e));
    }

    const nextCompletionsCount = isCustomPlan ? (dailyProgress.completionsCount || 0) : ((dailyProgress.completionsCount || 0) + 1);
    const canAwardTrophy = completedTasks > 0 || isCustomPlan; 
    setSessionTrophy('golden');

    if (canAwardTrophy) {
      if (settings.soundEnabled) {
        setTimeout(() => {
          if (nextCompletionsCount === 1) play('trophy1');
          else if (nextCompletionsCount === 2) play('trophy2');
          else if (nextCompletionsCount === 3) play('trophy3');
          else play('trophy1');
        }, 50);
      }
      setEarnedTrophyToday(true);
    } else {
      setEarnedTrophyToday(false);
    }

    // CALCULATE REWARDS
    let pointsToAdd = 0;
    let xpToAdd = 0;
    let coinsToAdd = 0;

    if (isCustomPlan) {
      const totalPlanTasks = activeCustomPlan?.challenges.length || 1;
      xpToAdd = Math.max(15, totalPlanTasks * 10);
      coinsToAdd = Math.max(15, totalPlanTasks * 10);
      pointsToAdd = xpToAdd;
    } else {
      const isDailyQuest = progress.dailyQuestDone || (challengeStep === dailyQuest);
      pointsToAdd = isDailyQuest ? 25 : 15;
      xpToAdd = isDailyQuest ? 50 : 30;
      coinsToAdd = isDailyQuest ? 30 : 20;

      const sessionBonusMultiplier = completedTasks >= 3 ? 1.5 : 1.0;
      pointsToAdd = Math.round(pointsToAdd * sessionBonusMultiplier);
      xpToAdd = Math.round(xpToAdd * sessionBonusMultiplier);
      coinsToAdd = Math.round(coinsToAdd * sessionBonusMultiplier);

      if (completedTasks >= 9) {
        xpToAdd += 10;
        coinsToAdd += 10;
      }
    }

    // STRICT DAILY STREAK CALCULATION
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let currentActualStreak = (stats.streak || 0);
    const wasAlreadyCompletedToday = stats.lastCompletedDate === today;
    let finalStreakShow = currentActualStreak;

    // Logic: If last completed was yesterday, increment. If today, stay. If before yesterday, reset to 1.
    if (!wasAlreadyCompletedToday) {
       if (stats.lastCompletedDate === yesterdayStr) {
          finalStreakShow = currentActualStreak + 1;
       } else {
          finalStreakShow = 1;
       }
    }
    
    setSessionStreak(finalStreakShow);
    setIsNewStreak(!wasAlreadyCompletedToday);

    setStats((prevStats) => {
      const oldLevel = prevStats.level || 1;
      let streakToSave = prevStats.streak || 0;
      
      if (prevStats.lastCompletedDate !== today) {
        if (prevStats.lastCompletedDate === yesterdayStr) {
          streakToSave = (prevStats.streak || 0) + 1;
        } else {
          streakToSave = 1;
        }
      }

      const newBestStreak = Math.max(prevStats.bestStreak || 0, streakToSave);
      const newTotalCompletedDays = prevStats.lastCompletedDate !== today ? (prevStats.totalCompletedDays || 0) + 1 : (prevStats.totalCompletedDays || 0);
      const newLastCompletedDate = today;
      
      const hasDoublePoints = settings.purchasedItems?.includes('double-points');
      const streakBonusPoints = hasDoublePoints ? 10 : 5;

      const newPoints = (prevStats.totalPoints || 0) + pointsToAdd + streakBonusPoints;
      const newXP = (prevStats.xp || 0) + xpToAdd;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      let levelUpBonusCoins = 0;
      if (newLevel > oldLevel) {
        setShowLevelUp(newLevel);
        levelUpBonusCoins = 50;
        vibrate(VIBRATION_PATTERNS.TROPHY);
      }

      const newTrophies = [...(prevStats.trophies || [])];
      if (canAwardTrophy) {
        newTrophies.unshift({
          id: `trophy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'golden',
          earnedDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });
      }

      const updatedStats = {
        ...prevStats,
        totalPoints: newPoints,
        weeklyPoints: (prevStats.weeklyPoints || 0) + pointsToAdd + streakBonusPoints,
        xp: newXP,
        weeklyXP: (prevStats.weeklyXP || 0) + xpToAdd,
        level: newLevel,
        coins: (prevStats.coins || 0) + coinsToAdd + levelUpBonusCoins,
        streak: streakToSave,
        bestStreak: newBestStreak,
        totalCompletedDays: newTotalCompletedDays,
        lastCompletedDate: newLastCompletedDate,
        trophies: newTrophies.slice(0, 50),
        pointsByCategory: {
          physical: (prevStats.pointsByCategory?.physical || 0) + (completedTasks > 1 ? 10 : 5),
          mental: (prevStats.pointsByCategory?.mental || 0) + (completedTasks > 1 ? 10 : 5),
          creative: (prevStats.pointsByCategory?.creative || 0) + (completedTasks > 2 ? 5 : 2),
        }
      };

      if (user) {
        const leaderboardRef = doc(db, 'leaderboard', user.uid);
        setDoc(leaderboardRef, {
          uid: user.uid,
          displayName: settings.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          streak: updatedStats.streak,
          totalPoints: updatedStats.totalPoints,
          xp: updatedStats.xp,
          level: newLevel,
        }, { merge: true }).catch(err => console.error("LB sync error", err));
      }

      return updatedStats;
    });

    setDailyProgress(prev => ({ 
      ...prev, 
      completed: isCustomPlan ? prev.completed : true,
      completionsCount: isCustomPlan ? prev.completionsCount : (prev.completionsCount || 0) + 1,
      pushupsDone: false,
      waterChallengeCount: 0,
      breathingDone: false,
      drawingDone: false,
      footballDone: false,
      bubblesDone: false,
      memoryDone: false,
      gratitudeDone: false,
      reactionDone: false,
      meditationDone: false,
      writingDone: false,
    }));
    
    // PLANT GROWTH & HEALING LOGIC
    if (settings.plantState) {
      const type = settings.plantState.type;
      let currentPoints = settings.plantState.growthPoints || 0;
      let currentStage = settings.plantState.stage || 0;
      const wasDead = settings.plantState.isDead;
      
      // Calculate growth: +25% per full completion
      let newPoints = currentPoints + 25;
      let newStage = currentStage;
      
      if (newPoints >= 100) {
        if (currentStage < 5) {
          newStage = currentStage + 1;
          newPoints = 0;
          showToast(`LEVEL UP: Your ${type} reached Stage ${newStage}! 🌿✨`, 'success');
        } else {
          newPoints = 100; // Cap at Legendary Stage 5
        }
      }

      const updatedPlantState: PlantState = {
        ...settings.plantState,
        stage: newStage,
        growthPoints: newPoints,
        health: 100,
        isDead: false,
        isThirsty: false,
        lastCheckDate: new Date().toISOString(),
        lastGrowthDate: new Date().toISOString()
      };

      onUpdateSettings({
        plantState: updatedPlantState,
        plantsProgress: {
          ...(settings.plantsProgress || {}),
          [type]: updatedPlantState
        }
      });
      
      if (wasDead) {
        showToast("THE ECOSYSTEM HAS BEEN RESTORED! 🌿🔥", "success");
        vibrate(VIBRATION_PATTERNS.SUCCESS);
      }
    }
    
    setSessionXP(xpToAdd);
    setSessionStreak(finalStreakShow);

    setShowCompletionFlame(true);
    setActiveScreen('home'); 
    setChallengeStep('home' as any); 
    setShowCoinAnimation(true);
  };

  const handleLogout = async () => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    try {
      await signOut(auth);
      // Hook handles state cleanup via onAuthStateChanged
      showToast("Logout successful.", 'success');
    } catch (error) {
      console.error("Error signing out:", error);
      showToast("Logout error, bro.", 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    vibrate(VIBRATION_PATTERNS.ERROR);
    
    try {
      // 1. Delete user data from Firestore
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);
      
      // 2. Delete the auth account
      await deleteUser(user);
      
      // Hook handles state cleanup via onAuthStateChanged
      showToast("Account protocol terminated. Farewell, bro.", 'success');
    } catch (error: any) {
      console.error("Delete Error:", error);
      if (error.code === 'auth/requires-recent-login') {
        showToast("Security Protocol: Re-authentication required. Please logout and login again.", 'error');
      } else {
        showToast("Termination failed. System error.", 'error');
      }
    }
  };

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const onClearCache = async () => {
    try {
      // 1. Clear Service Worker Caches
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      // 2. Clear critical localStorage keys (but KEEP auth/settings/stats)
      const keysToKeep = ['nexora_settings', 'nexora_stats', 'firebase:authUser'];
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.some(k => key.includes(k))) {
          localStorage.removeItem(key);
        }
      });
      showToast('Static cache cleared! 🧹', 'success');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      showToast('Cache clear failed', 'error');
    }
  };

  const onExportData = () => {
    const data = {
      settings,
      stats,
      history,
      exportedAt: new Date().toISOString(),
      user: user?.email
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_data_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported! Check downloads. 📥', 'success');
  };

  const onSubmitFeedback = async (feedbackData: { rating: number, message: string, category: string }) => {
    if (!user) return;
    try {
      const userLocation = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
      await addDoc(collection(db, 'feedback'), {
        ...feedbackData,
        userName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
        userLocation: userLocation,
        userEmail: user.email,
        userId: user.uid,
        createdAt: serverTimestamp(),
        version: currentAppVersion
      });
      showToast('Feedback transmitted! HQ is on it, bro! 🏮', 'success');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      onUpdateSettings({ feedbackSubmitted: true });
    } catch (err) {
      console.error('Feedback Error:', err);
      showToast('Transmission failed. Connectivity issue?', 'error');
    }
  };

  const onShowManifesto = () => {
    setShowUpdatePopup(true);
  };

  if (publicUserViewId) {
    return (
      <PublicRankView 
        userId={publicUserViewId} 
        onClose={() => {
          setPublicUserViewId(null);
          window.history.replaceState({}, '', window.location.pathname);
        }} 
      />
    );
  }

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    if (showAuth) {
      return (
        <Suspense fallback={<div className="min-h-screen bg-blue-50 flex items-center justify-center animate-pulse text-blue-900 font-black italic">AUTHENTICATING...</div>}>
          <AuthScreen onBack={() => setShowAuth(false)} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div className="min-h-screen bg-blue-50 flex items-center justify-center animate-pulse text-blue-900 font-black italic">LOADING MANIFESTO...</div>}>
        <LandingPage onGetStarted={() => setShowAuth(true)} />
      </Suspense>
    );
  }

  if (needsOnboarding) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-blue-50 flex items-center justify-center animate-pulse text-blue-900 font-black italic">PREPARING ONBOARDING...</div>}>
        <OnboardingScreen 
          onComplete={() => {
            onUpdateSettings({ onboardingCompleted: true });
          }} 
          settings={settings} 
          setSettings={onUpdateSettings} 
          setupFCM={setupFCM} 
        />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen w-full flex flex-col items-center overflow-x-hidden"
        style={{ '--accent-color': settings.themeColor } as React.CSSProperties}
      >
      {/* Connection Status Banner (Nexora Shield) */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-blue-600 text-white overflow-hidden z-[1000] sticky top-0 shadow-lg"
          >
            <div className="flex items-center justify-center gap-3 py-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] italic">
              <div className="relative">
                 <WifiOff size={14} className="animate-pulse" />
                 <motion.div 
                   animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-white rounded-full blur-sm" 
                 />
              </div>
              <span>Protocol: Nexora Shield Active - System Offline (Local Data Safeguarded)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Performance optimized: Sparkles Background Effect removed to prevent heating
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
      */}

      {/* Performance optimized: Background Mascot Watermark removed to prevent heating
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 opacity-[0.03]">
        <img 
          src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
          alt="" 
          className="w-[150%] max-w-none"
          referrerPolicy="no-referrer"
        />
      </div>
      */}

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
      
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[400] bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw size={14} className="animate-spin" />
            Working Offline... Syncing soon! 🌐
          </motion.div>
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
                <Mascot 
                  className="w-12 h-12" 
                  hat={settings.activeHat || 'none'} 
                  theme={settings.activeSkin || 'standard'}
                  performanceMode={settings.performanceMode}
                  soundPack={settings.isDogSoundPackActive ? 'dog' : 'cat'} 
                />
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

      <AnimatePresence>
        {showUpdatePopup && (
          <WhatIsNewModal onClose={() => {
            if (updateInfo) {
              localStorage.setItem('nexora_dismissed_version', updateInfo.version);
            }
            setShowUpdatePopup(false);
          }} />
        )}
      </AnimatePresence>

      {/* Global Notifications for Pro Test */}
      <AnimatePresence>
        {proTestMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-4 right-4 z-[100] glass-card p-6 border-2 border-blue-500 bg-white shadow-2xl flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Crown size={32} />
            </div>
            <p className="font-black text-blue-900">{proTestMessage}</p>
            <button 
              onClick={() => {
                setProTestMessage(null);
                setActiveScreen('subscription');
              }}
              className="btn-primary w-full py-3 text-white"
            >
              UPGRADE TO PRO
            </button>
            <button 
              onClick={() => setProTestMessage(null)}
              className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest"
            >
              Continue Free
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex flex-col min-h-screen relative z-10 px-0 sm:px-6">
        
        {activeScreen !== 'challenge' && activeScreen !== 'subscription' && activeScreen !== 'nexus-vision' && !showArchitectLab && (
          <header className="px-6 pt-12 pb-4 flex items-center justify-between w-full mx-auto max-w-7xl">
            <div className="flex items-center gap-4">
              <img 
                src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
                alt="Nexora Logo" 
                className="w-20 h-20 object-contain"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-4xl font-bold text-blue-900/80 tracking-tight">Nexora</h1>
            </div>
            <div className="flex items-center justify-end w-full gap-3 sm:gap-8 ml-auto">
              {isSpaceHouseUnlocked && (
                <button 
                  onClick={() => {
                    if (settings.soundEnabled) play('header_switch');
                    setActiveScreen('house');
                  }}
                  className={`p-2.5 rounded-2xl transition-all relative ${
                    activeScreen === 'house' 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' 
                      : !settings.spaceOnboardingCompleted
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse border-2 border-white/50'
                        : 'text-blue-900/60 bg-white/70 hover:bg-white border border-white/50 backdrop-blur-sm'
                  }`}
                >
                  <Home size={20} />
                  {!settings.spaceOnboardingCompleted && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles size={12} className="text-amber-200 animate-spin" />
                    </div>
                  )}
                </button>
              )}

              <button 
                onClick={() => {
                  if (settings.soundEnabled) play('header_switch');
                  setActiveScreen('settings');
                }}
                className={`p-2.5 rounded-2xl transition-all ${activeScreen === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' : 'text-blue-900/60 bg-white/70 hover:bg-white border border-white/50 backdrop-blur-sm'}`}
              >
                <Settings size={20} />
              </button>

              <button 
                onClick={() => {
                  if (settings.soundEnabled) play('header_switch');
                  setActiveScreen('profile');
                }}
                className={`p-2.5 rounded-2xl transition-all ${activeScreen === 'profile' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' : 'text-blue-900/60 bg-white/70 hover:bg-white border border-white/50 backdrop-blur-sm'}`}
              >
                {settings.profilePic ? (
                  <img src={settings.profilePic} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-white" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} />
                )}
              </button>

              <button 
                onClick={() => {
                  if (settings.soundEnabled) play('header_switch');
                  setActiveScreen('subscription');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${(activeScreen as string) === 'subscription' ? 'bg-amber-500 text-white shadow-xl shadow-amber-200 scale-105' : 'bg-amber-500/10 text-amber-600 border border-amber-200 backdrop-blur-sm hover:bg-amber-500/20'}`}
              >
                <Crown size={14} />
                <span className="font-black text-[10px] uppercase tracking-tight">Pro</span>
              </button>
            </div>
          </header>
        )}

        <main className={`flex-1 flex flex-col w-full max-w-7xl mx-auto ${activeScreen === 'subscription' || showArchitectLab ? 'px-0 sm:px-0 pb-0 pt-0 max-w-none' : 'px-4 sm:px-6 pb-32'}`}>
          <AnimatePresence mode="wait">
            {showArchitectLab ? (
              <motion.div
                key="architect"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full h-full min-h-screen bg-white z-[200] overflow-y-auto"
              >
                <Suspense fallback={<SplashScreen />}>
                  <ArchitectLab 
                    settings={settings}
                    onUpdateSettings={onUpdateSettings}
                    onClose={() => setShowArchitectLab(false)}
                  />
                </Suspense>
              </motion.div>
            ) : activeScreen === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="w-full"
              >
                <HomeScreen 
                  stats={stats} 
                  onStartChallenge={() => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    setActiveCustomPlan(null);
                    setChallengeStep('pushups');
                    setActiveScreen('challenge');
                    // Reset session flags for replayability
                    setDailyProgress(prev => ({ 
                      ...prev, 
                      waterDrank: 0, 
                      pushupsDone: false,
                      dailyQuestDone: false,
                      breathingDone: false,
                      drawingDone: false,
                      footballDone: false,
                      bubblesDone: false,
                      memoryDone: false,
                      gratitudeDone: false,
                      reactionDone: false,
                      meditationDone: false,
                      writingDone: false
                    }));
                  }}
                  isCompletedToday={false} // Allow infinite replays as requested
                  dailyProgress={dailyProgress}
                  settings={settings}
                  history={history}
                  onOpenGallery={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('gallery');
                  }}
                  dailyQuest={dailyQuest}
                  isPro={isPro}
                  emergencyActive={emergencyActive}
                  customPlans={customPlans}
                  onStartCustomPlan={(plan) => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    setActiveCustomPlan(plan);
                    setChallengeStep(plan.challenges[0]);
                    setActiveScreen('challenge');
                    // Ensure session flags are reset for custom plans too
                    setDailyProgress(prev => ({ 
                      ...prev, 
                      waterDrank: 0, 
                      pushupsDone: false,
                      dailyQuestDone: false,
                      breathingDone: false,
                      drawingDone: false,
                      footballDone: false,
                      bubblesDone: false,
                      memoryDone: false,
                      gratitudeDone: false,
                      reactionDone: false,
                      meditationDone: false,
                      writingDone: false
                    }));
                  }}
                  onDeleteCustomPlan={handleDeleteCustomPlan}
                  onOpenPlanBuilder={() => setActiveScreen('plan-builder')}
                  onOpenPlant={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('plant');
                  }}
                  onOpenNexusVision={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('nexus-vision');
                  }}
                  onSelectTask={(taskId) => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    setActiveCustomPlan(null);
                    setChallengeStep(taskId as any);
                    setActiveScreen('challenge');
                  }}
                  fcmToken={fcmToken}
                  setupFCM={setupFCM}
                  fcmError={fcmError}
                  showToast={showToast}
                  onArchiveChallenge={handleArchiveChallenge}
                />
              </motion.div>
            )}
            {activeScreen === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">SYNCHRONIZING GROWTH...</div>}>
                  <ProgressScreen stats={stats} history={history} settings={settings} setSettings={onUpdateSettings} userRank={userRank} />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">FETCHING IDENTITY...</div>}>
                  <ProfileScreen 
                    settings={settings} 
                    setSettings={onUpdateSettings} 
                    stats={stats} 
                    user={user} 
                    setActiveScreen={setActiveScreen} 
                    circles={circles}
                    onUpdateProfile={handleUpdateProfile}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">ENTERING THE NEXUS...</div>}>
                  <SocialScreen 
                    play={play}
                    onBack={() => setActiveScreen('home')} 
                    user={user}
                    settings={settings}
                    stats={stats}
                    showToast={showToast}
                    onUpdateSettings={onUpdateSettings}
                    posts={posts}
                    circles={circles}
                    notifications={notifications}
                    setActiveScreen={setActiveScreen}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">ACCESSING CONTROL...</div>}>
                  <SettingsScreen 
                    user={user}
                    settings={settings} 
                    setSettings={onUpdateSettings} 
                    isPro={isPro}
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen('home');
                    }} 
                    onLogout={handleLogout} 
                    onDeleteAccount={handleDeleteAccount}
                    fcmToken={fcmToken} 
                    fcmError={fcmError}
                    onRetryFCM={setupFCM}
                    onSendTestNotification={sendTestNotification}
                    onSendMotivation={sendMotivation}
                    onSendTestEmail={sendTestEmail}
                    onClearCache={onClearCache}
                    onExportData={onExportData}
                    onSubmitFeedback={onSubmitFeedback}
                    onShowManifesto={onShowManifesto}
                    onOpenArchitectLab={() => setShowArchitectLab(true)}
                    showToast={showToast}
                    sendNotification={(title, body) => sendNotification(title, { body })}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">CURATING WARES...</div>}>
                  <ShopScreen 
                    streak={stats.streak}
                    coins={stats.coins || 0}
                    purchasedItems={settings.purchasedItems || []}
                    isPro={isPro}
                    onBuy={(item, currency) => {
                      vibrate(VIBRATION_PATTERNS.SUCCESS);
                      
                      const newItem: any = {
                        id: `${item.id}-${Date.now()}`,
                        itemId: item.id,
                        name: item.name,
                        icon: item.icon,
                        activated: false,
                        type: item.effect === 'skin' ? 'skin' : item.effect === 'gift' ? 'gift' : item.effect === 'sound-pack' ? 'sound-pack' : item.effect === 'music' ? 'music' : 'power-up',
                        purchasedAt: new Date().toISOString()
                      };

                      const bonusItems: any[] = [];
                      if (item.effect === 'gift') {
                        // Add an automatic bonus gift
                        bonusItems.push({
                          id: `bonus-${item.id}-${Date.now()}`,
                          itemId: `bonus-${item.id}`,
                          name: `Bonus ${item.name}`,
                          icon: `✨${item.icon}`,
                          activated: false,
                          type: 'gift',
                          purchasedAt: new Date().toISOString()
                        });
                      }

                      setSettings(prev => ({
                        ...prev,
                        purchasedItems: [...(prev.purchasedItems || []), item.id],
                        inventory: [...(prev.inventory || []), newItem, ...bonusItems],
                      }));

                      setStats(prev => ({
                        ...prev,
                        streak: currency === 'streak' ? Math.max(0, prev.streak - item.price) : prev.streak,
                        coins: currency === 'coins' ? Math.max(0, (prev.coins || 0) - (item.coinPrice || 0)) : (prev.coins || 0)
                      }));

                      // SYNC WITH ORIGINAL STATS FOR ROLLBACK CONSISTENCY
                      if (originalStatsBeforeProTest) {
                        setOriginalStatsBeforeProTest(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            streak: currency === 'streak' ? Math.max(0, prev.streak - item.price) : prev.streak,
                            coins: currency === 'coins' ? Math.max(0, (prev.coins || 0) - (item.coinPrice || 0)) : (prev.coins || 0)
                          };
                        });
                      }
                    }}
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen('home');
                    }}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'subscription' && user && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black italic">OPENING THE TREASURY...</div>}>
                  <SubscriptionScreen 
                    onBack={() => setActiveScreen('home')} 
                    userId={user.uid}
                    settings={settings}
                    onActivatePro={() => {
                      onUpdateSettings({ isPro: true });
                      showToast("NEXORA PRO ACTIVATED! WELCOME TO THE LEGION! 🔥", 'success');
                      vibrate(VIBRATION_PATTERNS.SUCCESS);
                    }}
                    onStartProTest={() => {
                      const now = new Date();
                      
                      // 7-day cooldown check - Hardened with precise timestamp
                      if (settings.proTestLastUsedAt) {
                        const lastUsed = new Date(settings.proTestLastUsedAt);
                        const msSince = now.getTime() - lastUsed.getTime();
                        const daysSince = msSince / (1000 * 60 * 60 * 24);
                        if (daysSince < 7) {
                          const remainingDays = Math.ceil(7 - daysSince);
                          showToast(`NEXORA RESTRICTION: BRO, WAIT ${remainingDays} MORE DAYS TO TEST AGAIN! ⏳`, 'error');
                          vibrate(VIBRATION_PATTERNS.ERROR);
                          return;
                        }
                      }

                      // Adjusted duration: 15 minutes for a balanced test experience
                      const expiry = new Date(now.getTime() + 15 * 60 * 1000); 
                      const settingsUpdate = {
                        proTestStartedAt: now.toISOString(),
                        proTestExpiresAt: expiry.toISOString(),
                        proTestLastUsedAt: now.toISOString(),
                        proTestActive: true 
                      };
                      onUpdateSettings(settingsUpdate);
                      
                      // CRITICAL: Force immediate sync to Firestore so refresh/exit doesn't lose the test state
                      if (user) {
                        setDoc(doc(db, 'users', user.uid), settingsUpdate, { merge: true })
                          .catch(e => console.error("Pro Test immediate sync failed:", e));
                      }

                      showToast("PRO PROTOCOL ACTIVATED! 15 MINUTES OF UNLIMITED POWER! ⏳", 'info');
                      vibrate(VIBRATION_PATTERNS.SUCCESS);
                      setActiveScreen('home');
                    }}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'plan-builder' && (
              <motion.div
                key="plan-builder"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">ARCHITECTING FLOW...</div>}>
                  <PlanBuilder 
                    onBack={() => setActiveScreen('home')}
                    onSave={handleSaveCustomPlan}
                    isPro={isPro}
                    existingPlansCount={customPlans.length}
                    settings={settings}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <LibraryScreen
                  items={settings.inventory || []}
                  stats={stats}
                  settings={settings}
                  savedVideos={globalSavedVideos}
                  onPlayVideo={(v) => {
                    // Deleted as per request
                  }}
                  onDeleteVideo={handleDeleteSavedVideo}
                  onActivate={(id) => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    const itemToActivate = settings.inventory?.find(i => i.id === id);
                    if (!itemToActivate) return;

                    const inventory = (settings.inventory || []).map(item => {
                      if (item.id === id) {
                        return { ...item, activated: true };
                      }
                      // If it's a skin, deactivate other skins
                      if (item.type === 'skin' && itemToActivate.type === 'skin') {
                        return { ...item, activated: false };
                      }
                      // If it's music, deactivate other music
                      if (item.type === 'music' && itemToActivate.type === 'music') {
                        return { ...item, activated: false };
                      }
                      // If it's sound-pack, deactivate other sound-packs
                      if (item.type === 'sound-pack' && itemToActivate.type === 'sound-pack') {
                        return { ...item, activated: false };
                      }
                      return item;
                    });
                    
                    let activeSkin = settings.activeSkin;
                    if (itemToActivate.type === 'skin') {
                      activeSkin = itemToActivate.itemId.replace('skin-', '');
                    }

                    let isDogSoundPackActive = settings.isDogSoundPackActive;
                    if (itemToActivate.type === 'sound-pack') {
                      isDogSoundPackActive = itemToActivate.itemId === 'sound-dog';
                    }

                    // If it's a gift, give a reward and keep it activated (as opened)
                    if (itemToActivate.type === 'gift' && !itemToActivate.activated) {
                      const rewards = [
                        { type: 'coins', amount: 50, msg: 'You found 50 coins! 💰' },
                        { type: 'coins', amount: 100, msg: 'Jackpot! 100 coins! 💎' },
                        { type: 'xp', amount: 200, msg: 'Epic discovery! +200 XP! ✨' },
                        { type: 'xp', amount: 50, msg: 'Nice! +50 XP! 🌟' },
                        { type: 'streak', amount: 1, msg: 'Bonus Streak Day! 🔥' }
                      ];
                      const reward = rewards[Math.floor(Math.random() * rewards.length)];
                      
                      showToast(reward.msg, 'success');
                      vibrate(VIBRATION_PATTERNS.SUCCESS);

                      setStats(s => ({
                        ...s,
                        coins: reward.type === 'coins' ? (s.coins || 0) + reward.amount : s.coins,
                        xp: reward.type === 'xp' ? (s.xp || 0) + reward.amount : s.xp,
                        streak: reward.type === 'streak' ? s.streak + reward.amount : s.streak
                      }));
                    }

                    onUpdateSettings({ inventory, activeSkin, isDogSoundPackActive });
                    showToast(`${itemToActivate.name} activated!`, 'success');
                  }}
                  onDeactivate={(id) => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setSettings(prev => {
                      const itemToDeactivate = prev.inventory?.find(i => i.id === id);
                      const inventory = (prev.inventory || []).map(item => {
                        if (item.id === id) {
                          return { ...item, activated: false };
                        }
                        return item;
                      });
                      
                      let activeSkin = prev.activeSkin;
                      if (itemToDeactivate?.type === 'skin') {
                        activeSkin = 'none';
                      }

                      let isDogSoundPackActive = prev.isDogSoundPackActive;
                      if (itemToDeactivate?.type === 'sound-pack') {
                        isDogSoundPackActive = false;
                      }

                      return { ...prev, inventory, activeSkin, isDogSoundPackActive };
                    });
                  }}
                  onDelete={(id) => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    setSettings(prev => {
                      const itemToDelete = prev.inventory?.find(i => i.id === id);
                      const inventory = (prev.inventory || []).filter(item => item.id !== id);
                      
                      // If deleted, remove from purchasedItems so it can be bought again
                      // But ONLY if it's not a bonus gift (bonus gifts don't exist in shop)
                      const purchasedItems = (prev.purchasedItems || []).filter(pid => pid !== itemToDelete?.itemId);
                      
                      let activeSkin = prev.activeSkin;
                      if (itemToDelete?.type === 'skin' && itemToDelete.activated) {
                        activeSkin = 'none';
                      }

                      return { ...prev, inventory, purchasedItems, activeSkin };
                    });
                    showToast('Item deleted from library', 'info');
                  }}
                  onDeleteNote={(id) => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    setStats(prev => ({
                      ...prev,
                      gratitudeEntries: (prev.gratitudeEntries || []).filter(e => e.id !== id)
                    }));
                    showToast('Note deleted', 'info');
                  }}
                  onDeleteDrawing={(index) => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setStats(prev => ({
                      ...prev,
                      drawings: prev.drawings.filter((_, i) => i !== index)
                    }));
                    showToast('Drawing deleted');
                  }}
                  onDeleteChallenge={(id) => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    setSettings(prev => ({
                      ...prev,
                      savedChallengeIds: (prev.savedChallengeIds || []).filter(cid => cid !== id)
                    }));
                    showToast('Challenge removed', 'info');
                  }}
                  onBack={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('home');
                  }}
                />
              </motion.div>
            )}
            {activeScreen === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">OPENING VAULT...</div>}>
                  <GalleryScreen 
                    stats={stats} 
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen('home');
                    }} 
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'notebook' && (
              <motion.div
                key="notebook"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">OPENING ARCHIVES...</div>}>
                  <NotebookScreen 
                    stats={stats} 
                    setStats={setStats}
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen('home');
                    }} 
                    showToast={showToast}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeScreen === 'nexus-vision' && (
              <motion.div
                key="nexus-vision"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-400 font-black">SYNCING NEURAL LINK...</div>}>
                  <NexusVision 
                    stats={stats} 
                    history={history}
                    isPro={isPro}
                    proTestActive={settings.proTestActive}
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen('home');
                    }} 
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">COMPUTING HIERARCHY...</div>}>
                  <LeaderboardScreen 
                    leaderboard={leaderboard} 
                    user={user} 
                    settings={settings}
                    stats={stats}
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen('home');
                    }}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'house' && (
              <motion.div
                key="house"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black italic">HOUSE LOADING...</div>}>
                  <HouseScreen 
                    onBack={() => setActiveScreen('home')} 
                    stats={stats}
                    settings={settings}
                    dailyProgress={dailyProgress}
                    onUpdateDailyProgress={onUpdateDailyProgress}
                    onBuyItem={buyHouseItem}
                    onPlaceItem={placeHouseItem}
                    onRemoveItem={removeHouseItem}
                    onUpdateItemPosition={updateHouseItemPosition}
                    onUpdateSettings={onUpdateSettings}
                    onUpdateStats={onUpdateStats}
                    showToast={showToast}
                    play={play}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'plant' && settings.plantState && (
              <motion.div
                key="plant"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-green-700 font-black italic uppercase tracking-widest">NURTURING ECOSYSTEM...</div>}>
                  <PlantScreen 
                    plantState={settings.plantState}
                    onboardingCompleted={!!settings.plantOnboardingCompleted}
                    onCompleteOnboarding={() => onUpdateSettings({ plantOnboardingCompleted: true })}
                    onExit={() => { vibrate(5); setActiveScreen('home'); }}
                    onSaveToLibrary={(imageData) => {
                      onUpdateStats(prev => ({
                        ...prev,
                        drawings: [imageData, ...(prev.drawings || [])]
                      }));
                    }}
                    onSwitchType={(type) => {
                      vibrate(10);
                      onUpdateSettings(prev => ({
                        ...prev,
                        plantState: {
                          ...prev.plantState!,
                          type,
                        }
                      }));
                    }}
                    onRecover={() => {
                      onUpdateSettings({
                        plantState: {
                          ...settings.plantState!,
                          stage: 0,
                          growthPoints: 0,
                          isDead: false,
                          isThirsty: false,
                          health: 100,
                          lastCheckDate: new Date().toISOString()
                        }
                      });
                      showToast("Ecosystem restored! 🌿", "info");
                    }}
                    onPurchaseEcosystemItem={buyEcosystemItem}
                    onToggleEcosystemItem={toggleEcosystemItem}
                    onUpdateSettings={onUpdateSettings}
                    settings={settings}
                    stats={stats}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'challenge' && (
              <motion.div
                key="challenge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <Suspense fallback={<div className="min-h-screen bg-blue-50 flex items-center justify-center animate-pulse text-blue-900 font-black italic">INITIALIZING CHALLENGE...</div>}>
                  <ChallengeFlow 
                    step={challengeStep} 
                    setStep={setChallengeStep} 
                    customSteps={activeCustomPlan?.challenges}
                    settings={settings}
                    setSettings={onUpdateSettings}
                    dailyProgress={dailyProgress}
                    setDailyProgress={onUpdateDailyProgress}
                    stats={stats}
                    setStats={onUpdateStats}
                    onFinish={handleCompleteChallenge}
                    onExit={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveCustomPlan(null);
                      setActiveScreen('home');
                    }}
                    earnedTrophyToday={earnedTrophyToday}
                    showToast={showToast}
                    play={play}
                    dailyQuest={dailyQuest}
                    isCustomPlan={activeCustomPlan !== null}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {showCoinAnimation && (
          <CoinAnimation 
            onComplete={() => setShowCoinAnimation(false)} 
            play={play}
            settings={settings}
          />
        )}

        {showCelebration && (
          <CelebrationModal 
            settings={settings}
            onFinish={() => {
              setShowCelebration(false);
              onUpdateSettings({ spaceHouseUnlocked: true });
              setActiveScreen('social');
            }}
          />
        )}

        {showCompletionFlame && (
          <CompletionFlame 
            streak={sessionStreak}
            xpEarned={sessionXP}
            settings={settings}
            isNewStreak={isNewStreak}
            onContinue={() => {
              setShowCompletionFlame(false);
              setActiveScreen('trophy-rewards'); 
            }}
          />
        )}

        {activeScreen === 'trophy-rewards' && (
          <TrophyRewardsScreen 
            trophyType={sessionTrophy} 
            settings={settings}
            onFinish={() => {
              setActiveCustomPlan(null);
              setActiveScreen('home');
            }}
          />
        )}

        {activeScreen !== 'challenge' && activeScreen !== 'subscription' && activeScreen !== 'nexus-vision' && !showArchitectLab && (
          <motion.div 
            initial={false}
            animate={{ 
              y: scrollDirection === 'down' ? 100 : 0,
              opacity: scrollDirection === 'down' ? 0 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 flex justify-center pointer-events-none z-[80]"
          >
            <nav className="glass-card px-4 py-3 sm:px-8 sm:py-4 flex items-center gap-4 sm:gap-12 pointer-events-auto overflow-x-auto max-w-[95vw] no-scrollbar">
              {(settings.navOrder || Object.keys(NAV_ITEMS_MAP)).map((id) => {
                const item = NAV_ITEMS_MAP[id];
                if (!item) return null;
                const isHidden = settings.hiddenNavItems?.includes(id);
                if (isHidden) return null;
                if (id === 'social') return null; // FORCE HIDE SOCIAL AS REQUESTED

                return (
                  <NavButton 
                    key={id}
                    active={(activeScreen as string) === item.screen} 
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                      if (settings.soundEnabled) play('nav_switch');
                      setActiveScreen(item.screen);
                    }} 
                    icon={item.icon} 
                    label={item.label}
                  />
                );
              })}
            </nav>
          </motion.div>
        )}

        {publicUserViewId && (
          <PublicRankView 
            userId={publicUserViewId} 
            onClose={() => {
              setPublicUserViewId(null);
              window.history.replaceState({}, '', window.location.pathname);
            }} 
          />
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

        <AnimatePresence>
          {showUpdatePopup && updateInfo && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-24 left-6 right-6 z-[60]"
            >
              <div className="glass-card p-6 border-2 border-blue-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 animate-pulse" />
                
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10 border border-blue-100 overflow-hidden">
                    <img 
                      src={updateInfo.imageUrl || "https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png"} 
                      alt="Mascot" 
                      className="w-12 h-12 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-black text-blue-900">Nexora Update v{updateInfo.version}</h3>
                      <button 
                        onClick={() => {
                          if (updateInfo) {
                            localStorage.setItem('nexora_dismissed_version', updateInfo.version);
                          }
                          setShowUpdatePopup(false);
                        }}
                        className="p-1 hover:bg-blue-50 rounded-lg text-blue-400"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-bold text-blue-900/60 uppercase tracking-wider">What's New:</p>
                      <ul className="space-y-1">
                        {updateInfo.releaseNotes.map((note, i) => (
                          <li key={i} className="text-xs text-blue-900/80 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button 
                      onClick={handleUpdate}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 transition-all active:scale-95 group"
                    >
                      <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
                      UPGRADE SYSTEM PROTOCOL
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Notification Mascot Message Overlay */}
        <AnimatePresence>
          {activeSystemNotification && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 100 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
              onClick={() => markSystemNotificationRead(activeSystemNotification.id)}
            >
              <div 
                className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative border-4 border-blue-500 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center p-4 border-2 border-blue-100">
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=Nexora&backgroundColor=b6e3f4`}
                      alt="Mascot"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-blue-900 tracking-tight leading-tight">
                      {activeSystemNotification.title || "SYSTEM INCOMING"}
                    </h2>
                    <p className="text-blue-900/70 font-bold leading-relaxed">
                      {activeSystemNotification.message}
                    </p>
                  </div>

                  <button
                    onClick={() => markSystemNotificationRead(activeSystemNotification.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 transition-all active:scale-95"
                  >
                    LOUD AND CLEAR! 🚀
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nexora Navigation Protocol (Walkthrough) */}
        <AnimatePresence>
          {showWalkthrough && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-end justify-center p-6 overflow-hidden"
            >
              {/* Overlay with focus effect */}
              <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px]" />
              
              <motion.div
                key={walkthroughStep}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-4 border-blue-400 relative z-10"
              >
                {/* Connector Line (Pointing to content) */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-1 h-16 bg-gradient-to-t from-blue-400 to-transparent" />
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping absolute top-0" />
                </div>

                {/* Protocol Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 flex gap-1 px-8 pt-4">
                  {WALKTHROUGH_STEPS.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= walkthroughStep ? 'bg-blue-500' : 'bg-blue-100'}`}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center text-center gap-6 mt-4">
                  {/* Real App Mascot */}
                  <div className="relative group">
                    <div className="w-32 h-32 bg-blue-50/50 rounded-full flex items-center justify-center p-4 border-2 border-blue-100 relative shadow-[inset_0_2px_10px_rgba(59,130,246,0.1)]">
                      <Mascot 
                        mood={WALKTHROUGH_STEPS[walkthroughStep].mood}
                        theme={settings.activeSkin === 'none' ? 'standard' : settings.activeSkin}
                        hat={settings.activeHat}
                        performanceMode={settings.performanceMode}
                        className="w-full h-full scale-110"
                      />
                      {/* Aura pulse */}
                      <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ping" />
                    </div>
                    <div className="absolute -bottom-2 -right-4 bg-blue-600 text-white text-[11px] font-black px-3 py-1.5 rounded-2xl border-2 border-white uppercase shadow-lg shadow-blue-500/30">
                      NEXORA AI
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl font-black text-blue-900 leading-tight uppercase tracking-tighter italic">
                      {WALKTHROUGH_STEPS[walkthroughStep].title}
                    </h2>
                    <p className="text-blue-900/70 font-bold text-base leading-snug">
                      "{WALKTHROUGH_STEPS[walkthroughStep].message}"
                    </p>
                  </div>

                  <button
                    onClick={onNextWalkthroughStep}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-[0_15px_30px_-5px_rgba(59,130,246,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 active:shadow-none"
                  >
                    {walkthroughStep === WALKTHROUGH_STEPS.length - 1 ? (
                      <>FINISH MISSION <Check className="w-6 h-6 stroke-[4]" /></>
                    ) : (
                      <>ENCRYPT & NEXT <ChevronRight className="w-6 h-6 stroke-[4]" /></>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                      PHASE {walkthroughStep + 1} // 09
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Feedback Mascot Bubble */}
        <AnimatePresence>
          {showFeedbackPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.8 }}
              className="fixed bottom-28 left-6 right-6 z-[95] flex items-end justify-center pointer-events-none md:justify-end md:right-10 md:left-auto"
            >
              <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border-4 border-blue-500 max-w-sm w-full pointer-events-auto relative">
                <div className="absolute -top-12 -left-2 w-20 h-20">
                   <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=Nexora&backgroundColor=b6e3f4`}
                      alt="Mascot"
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                </div>
                <div className="ml-16 space-y-3">
                  <div>
                    <h4 className="text-xl font-black text-blue-900 leading-none uppercase italic">Mission Report</h4>
                    <p className="text-sm font-bold text-blue-600/80 mt-1">Yo bro, enjoying the protocol? HQ needs your feedback to optimize the Nexora system!</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={onDismissFeedback}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-tighter active:scale-95 transition-all"
                    >
                      Not now
                    </button>
                    <button 
                      onClick={onAcceptFeedback}
                      className="flex-[2] py-3 px-4 bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      SYNC FEEDBACK 🚀
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] border border-white/20 backdrop-blur-md"
              style={{ 
                backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 
                                 toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                                 'rgba(59, 130, 246, 0.9)',
                color: 'white'
              }}
            >
              <div className="p-1.5 bg-white/20 rounded-lg">
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : 
                 toast.type === 'error' ? <AlertCircle size={18} /> : 
                 <Info size={18} />}
              </div>
              <p className="font-bold text-sm">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </ErrorBoundary>
  );
}
