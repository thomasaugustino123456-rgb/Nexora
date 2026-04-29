import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
console.log("App.tsx is loading...");
import { Home, BarChart2, BarChart3, User, CheckCircle2, Droplets, Wind, Palette, Flame, Star, ChevronRight, ChevronLeft, ArrowLeft, Settings, X, Pen, Pencil, Eraser, Trophy as TrophyIcon, Zap, Brain, Heart, Target, Camera, Upload, Bell, BellOff, Volume2, Download, Trash2, Save, PaintBucket, MessageSquare, Music, Image as ImageIcon, Sparkles, BrainCircuit, Smile, LogOut, Send, Book, RefreshCw, AlertCircle, Award, Users, Crown, Info, Map as MapIcon, Check, Plus, Clock, History, BookOpen, Sprout, MoreHorizontal, Flag, Bookmark, EyeOff, Share2, Search, Youtube, Video } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSound } from './hooks/useSound';
import { HouseItem, PlacedHouseItem, UserSettings, UserStats, DailyProgress, Screen, ChallengeStep, Trophy, TrophyType, MascotMood, BadgeSettings, LeaderboardEntry, CustomPlan, PlantType, SocialCircle, Post, SocialComment, NexusNotification, NexusVideo, UserReport } from './types';
import { HOUSE_ITEMS } from './constants/houseItems';
import { NexoraStudio } from './components/NexoraStudio';
import { format, subDays, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { auth, db, messaging, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut, deleteUser, reauthenticateWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, getDocFromServer, deleteDoc, collection, query, orderBy, limit, onSnapshot, serverTimestamp, where, getDocs, addDoc, increment } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
const AuthScreen = lazy(() => import('./components/AuthScreen').then(m => ({ default: m.AuthScreen })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const OnboardingScreen = lazy(() => import('./components/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })));
const PlanBuilder = lazy(() => import('./components/PlanBuilder').then(m => ({ default: m.PlanBuilder })));
const HomeScreen = lazy(() => import('./components/HomeScreen').then(m => ({ default: m.HomeScreen })));
import { Mascot } from './components/Mascot';
import { GoldenTrophy, IceTrophy, BrokenTrophy, playTrophySound } from './components/Trophies';
import { WhatIsNewModalWrapper, HappyMascot, LevelUpCelebration, CoinAnimation, MascotAIWrapper } from './components/SuspenseWrappers';

const HouseScreen = lazy(() => import('./components/HouseScreen').then(m => ({ default: m.HouseScreen })));
const LibraryScreen = lazy(() => import('./components/LibraryScreen').then(m => ({ default: m.LibraryScreen })));
const ShopScreen = lazy(() => import('./components/ShopScreen').then(m => ({ default: m.ShopScreen })));
const PlantScreen = lazy(() => import('./components/PlantScreen').then(m => ({ default: m.PlantScreen })));
const SocialScreen = lazy(() => import('./components/SocialScreen').then(m => ({ default: m.SocialScreen })));
const NexusVideoScreen = lazy(() => import('./components/NexusVideoScreen').then(m => ({ default: m.NexusVideoScreen })));
const LeaderboardScreen = lazy(() => import('./components/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const ProgressScreen = lazy(() => import('./components/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const ProfileScreen = lazy(() => import('./components/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const SettingsScreen = lazy(() => import('./components/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const GalleryScreen = lazy(() => import('./components/GalleryScreen').then(m => ({ default: m.GalleryScreen })));
const NotebookScreen = lazy(() => import('./components/NotebookScreen').then(m => ({ default: m.NotebookScreen })));
const ChallengeFlow = lazy(() => import('./components/ChallengeFlow').then(m => ({ default: m.ChallengeFlow })));

const SOCIAL_LOCKED = false;

import { GoogleGenerativeAI } from "@google/generative-ai";
import { vibrate, VIBRATION_PATTERNS } from './lib/vibrate';
import { requestNotificationPermission, setupOnMessageListener } from './lib/notifications';

import { NavButton } from './components/NavButton';
import { SplashScreen } from './components/SplashScreen';
import { useNexoraData } from './hooks/useNexoraData';

const DEFAULT_SETTINGS: UserSettings = {
  pushupsGoal: 5,
  waterGoal: 2,
  reminderTime: '09:00',
  reminderTime2: '21:00',
  motivationTime: '12:00',
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
  mascotSize: 1.0,
  mascotPos: { x: 400, y: 300 },
  mascotPinnedItemId: null,
  spaceOnboardingCompleted: false,
  plantOnboardingCompleted: false,
  plantState: {
    type: 'sprout',
    stage: 0,
    growthPoints: 0,
    lastGrowthDate: null,
    lastCheckDate: new Date().toISOString(),
    health: 100,
    isDead: false,
    isThirsty: false,
    unlockedTypes: ['sprout', 'zen', 'desert', 'tropical', 'forest', 'meadow', 'crystal', 'volcano']
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

  const today = new Date().toISOString().split('T')[0];
  const [circles, setCircles] = useState<SocialCircle[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<NexusNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [globalSavedVideos, setGlobalSavedVideos] = useState<NexusVideo[]>([]);
  const [focusedVideoId, setFocusedVideoId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [dailyQuest, setDailyQuest] = useState<ChallengeStep>('water');
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [challengeStep, setChallengeStep] = useState<ChallengeStep | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [activeScreen, setActiveScreen] = useLocalStorage<Screen>('nexora_active_screen', 'home');
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { play, stop, playMusic, stopAllMusic } = useSound();
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [earnedTrophyToday, setEarnedTrophyToday] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeCustomPlan, setActiveCustomPlan] = useState<CustomPlan | null>(null);
  const [viewingTrophy, setViewingTrophy] = useState<Trophy | null>(null);

  const onUpdateSettings = (newSettings: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => {
    setSettings(prev => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      if (updated.plantState && !updated.plantState.type) updated.plantState.type = 'zen';
      return updated;
    });
  };

  const onUpdateStats = (newStats: Partial<UserStats> | ((prev: UserStats) => UserStats)) => {
    setStats(prev => typeof newStats === 'function' ? newStats(prev) : { ...prev, ...newStats });
  };

  const onUpdateDailyProgress = (update: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress)) => {
    setDailyProgress(prev => typeof update === 'function' ? update(prev) : { ...prev, ...update });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) setScrollDirection('down');
      else if (currentScrollY < lastScrollY) setScrollDirection('up');
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isPro = settings.isPro;
  const setIsPro = (val: boolean) => setSettings(prev => ({ ...prev, isPro: val }));

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
    
    setSettings(prev => ({
      ...prev,
      purchasedHouseItemIds: [...(prev.purchasedHouseItemIds || []), id]
    }));
    showToast(`Purchased ${item.name}! 🏠`, "success");
  };

  const placeHouseItem = (id: string, x: number, y: number, room: number) => {
    const newItem: PlacedHouseItem = { 
      id: `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: id, 
      x, 
      y, 
      room 
    };
    setSettings(prev => ({
      ...prev,
      placedHouseItems: [...(prev.placedHouseItems || []), newItem]
    }));
  };

  const removeHouseItem = (instanceId: string) => {
    setSettings(prev => {
      const itemToRemove = prev.placedHouseItems?.find(i => i.id === instanceId);
      return {
        ...prev,
        placedHouseItems: (prev.placedHouseItems || []).filter(item => item.id !== instanceId),
        mascotPinnedItemId: (itemToRemove && prev.mascotPinnedItemId === itemToRemove.id) ? null : prev.mascotPinnedItemId
      };
    });
  };

  const updateHouseItemPosition = (instanceId: string, x: number, y: number) => {
    setSettings(prev => {
      const currentItems = prev.placedHouseItems || [];
      const index = currentItems.findIndex(i => i.id === instanceId);
      if (index === -1) return prev;
      
      const movingItem = currentItems[index];

      // Update position and bring to front by moving it to the end of the array
      const otherItems = currentItems.filter(item => item.id !== instanceId);
      const updatedItem = { ...movingItem, x, y };
      const updatedItems = [...otherItems, updatedItem];

      // If mascot is pinned to this specific item instance, update mascot position relatively
      let mascotPos = prev.mascotPos;
      if (prev.mascotPinnedItemId === movingItem.id && mascotPos) {
        const dx = x - movingItem.x;
        const dy = y - movingItem.y;
        mascotPos = { x: mascotPos.x + dx, y: mascotPos.y + dy };
      }

      return { ...prev, placedHouseItems: updatedItems, mascotPos };
    });
  };

  useEffect(() => {
    if (activeScreen === 'challenge') {
      setEmergencyActive(false);
    }
  }, [activeScreen]);

  useEffect(() => {
    // Select a daily quest based on the date
    const steps: ChallengeStep[] = ['pushups', 'water', 'breathing', 'drawing', 'football', 'bubbles', 'memory', 'reaction'];
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuest(steps[dayOfYear % steps.length]);
  }, []);

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
      const current = prev.plantState || {
        type: 'zen',
        stage: 0,
        growthPoints: 0,
        lastGrowthDate: null,
        lastCheckDate: new Date().toISOString(),
        health: 100,
        isDead: false,
        isThirsty: false,
        unlockedTypes: ['zen']
      };
      
      if (current.isDead) return prev;

      let newPoints = current.growthPoints + 15;
      let newStage = current.stage;
      let newUnlocked = [...(current.unlockedTypes || ['zen'])];
      
      if (newPoints >= 100) {
        if (newStage < 5) {
          newStage += 1;
          newPoints = 0;
          vibrate(VIBRATION_PATTERNS.SUCCESS);
          showToast(`Your ecosystem grew to Stage ${newStage}! 🌿✨`, 'success');
          
          if (newStage === 5) {
            const currentIdx = ECOSYSTEM_PATH.indexOf(current.type);
            if (currentIdx !== -1 && currentIdx < ECOSYSTEM_PATH.length - 1) {
              const nextType = ECOSYSTEM_PATH[currentIdx + 1];
              if (!newUnlocked.includes(nextType)) {
                newUnlocked.push(nextType);
                showToast(`New Ecosystem Unlocked: ${nextType.toUpperCase()}! 🏆`, 'success');
              }
            }
          }
        } else {
          newPoints = 100;
        }
      } else {
        showToast(`Ecosystem nurtured! +15% Energy 💧`, 'success');
      }

      return {
        ...prev,
        plantState: {
          ...current,
          stage: newStage,
          growthPoints: newPoints,
          unlockedTypes: newUnlocked,
          lastCheckDate: new Date().toISOString(),
          lastGrowthDate: new Date().toISOString(),
          health: 100,
          isThirsty: false
        }
      };
    });
  }, [settings.plantState]);

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

    // FORCE UNLOCK & SET TO DISTRESSED ROSE FOR TESTING (Per User Request)
    if (settings.plantState.type !== 'distressedRose' || settings.plantState.stage < 5) {
        onUpdateSettings({
            plantState: {
                ...settings.plantState,
                type: 'distressedRose',
                stage: 5,
                growthPoints: 100,
                unlockedTypes: [...ECOSYSTEM_PATH]
            }
        });
    }
    
    const checkPlant = () => {
      const now = new Date();
      const lastCheck = new Date(settings.plantState!.lastCheckDate);
      const diffMs = now.getTime() - lastCheck.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours >= 48 && !settings.plantState!.isDead) { // 2 days
        onUpdateSettings({
          plantState: {
            ...settings.plantState!,
            isDead: true,
            health: 0,
            isThirsty: true,
            lastCheckDate: now.toISOString()
          }
        });
        sendNotification("Your Nexora Ecosystem has died... 🥀", { body: "Bro, your plants need discipline! Restore the room and try again." });
      } else if (diffHours >= 36 && !settings.plantState!.isThirsty && !settings.plantState!.isDead) { // 1.5 days
        onUpdateSettings({
          plantState: {
            ...settings.plantState!,
            isThirsty: true
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
          { id: 'nexora-general', name: 'Nexora General', description: 'The main hub for all Nexora members.', icon: '🏛️', color: '#3b82f6', memberCount: 1250, category: 'general' }
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
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    // 1. Local Browser Notification (Immediate feedback if app is open)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }

    // 2. Server-Side FCM Notification (For background/closed app support)
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
  const currentAppVersion = "1.5.1"; // Auto-bumping version to trigger update sync
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

  // Firestore Sync Logic
  useEffect(() => {
    if (!user || !isDataReady || !dataLoadedFromFirestore.current) return; 

    // Update localStorage immediately
    localStorage.setItem('nexora_settings', JSON.stringify(settings));
    localStorage.setItem('nexora_stats', JSON.stringify(stats));

    const syncToFirestore = async () => {
      const path = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        
        // ULTIMATE Safety Check: Never sync if settings/stats appear empty but user is NOT new
        const isDefaultState = settings.displayName === 'Nexora User' && (stats.totalPoints === 0 || !stats.totalPoints);
        if (isDefaultState && !needsOnboarding && dataLoadedFromFirestore.current) {
          console.warn("Firestore Sync Blocked: State appears to be default while user is already existing. Preventing overwrite.");
          return;
        }

        // Sync main user document
        await setDoc(userRef, {
          ...settings,
          uid: user.uid,
          email: user.email || '',
          onboardingCompleted: !needsOnboarding,
          isTodayCompleted: dailyProgress.completed,
          stats: stats, // Summary for queries
          fcmToken: fcmToken,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Sync detailed stats to subcollection
        const statsRef = doc(db, 'users', user.uid, 'stats', 'main');
        await setDoc(statsRef, stats, { merge: true });

        // Sync daily progress to subcollection
        const progressRef = doc(db, 'users', user.uid, 'progress', today);
        await setDoc(progressRef, {
          ...dailyProgress,
          date: today
        }, { merge: true });

        // Sync to leaderboard collection
        const leaderboardRef = doc(db, 'leaderboard', user.uid);
        await setDoc(leaderboardRef, {
          uid: user.uid,
          displayName: settings.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          streak: stats.streak || 0,
          totalPoints: stats.totalPoints,
          xp: stats.xp || 0,
          weeklyPoints: stats.weeklyPoints,
          weeklyXP: stats.weeklyXP || 0,
          level: Math.floor((stats.totalPoints || 0) / 100) + 1,
          league: settings.league || 'Bronze'
        }, { merge: true });

        // Sync music specifically to the new path as requested
        const musicItems = (settings.inventory || []).filter(item => item.type === 'music');
        if (musicItems.length > 0) {
          const musicRef = doc(db, 'users', user.uid, 'music', 'purchased');
          await setDoc(musicRef, { items: musicItems });
        }

        // Sync space onboarding specifically to the new path as requested
        const spaceSettingsRef = doc(db, 'users', user.uid, 'settings', 'space');
        await setDoc(spaceSettingsRef, { 
          completed: !!settings.spaceOnboardingCompleted,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.UPDATE, path);
        } catch (e) {
          console.error("Firestore sync error handled:", e);
        }
      }
    };

    const timeoutId = setTimeout(syncToFirestore, 3000); // Increased debounce for safety
    return () => clearTimeout(timeoutId);
  }, [settings, stats, dailyProgress, user, fcmToken, today, isDataReady]);

  useEffect(() => {
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
              setShowUpdatePopup(true);
              
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
    if (currentAppVersion === "1.5.1" && !localStorage.getItem('nexora_last_update_time')) {
      const now = new Date().toISOString();
      localStorage.setItem('nexora_last_update_time', now);
      setLastUpdateTime(now);
    }

    // Check every 2 minutes
    const interval = setInterval(checkVersion, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    if (updateInfo) {
      const now = new Date().toISOString();
      localStorage.setItem('nexora_dismissed_version', updateInfo.version);
      localStorage.setItem('nexora_last_update_time', now);
      setLastUpdateTime(now);
    }
    
    // Nuclear Update: Unregister SW and clear all caches to ensure a fresh fetch
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      console.log('PWA: Caches cleared and Service Worker unregistered. Reloading...');
    } catch (err) {
      console.error('PWA: Error during nuclear update:', err);
    }

    window.location.href = '/?update=' + Date.now(); // Force full reload with cache-busting query
  };
  
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
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BF2tHGVbbJHc3wxlE98atQFPU1TRqX3shN0bhSsaNf-UxdDxgoj25zLhpttoeDsrjQ8l24cnysfF-eyzH3P7baw',
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
    if (user && fcmToken) {
      const saveToken = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            fcmToken: fcmToken,
            notificationsEnabled: true,
            'settings.fcmToken': fcmToken,
            'settings.notificationsEnabled': true
          });
          console.log('FCM: Token saved to Firestore dashboard and settings.');
        } catch (e) {
          console.error('FCM: Failed to save token:', e);
        }
      };
      saveToken();
    }
  }, [user, fcmToken]);

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
      
      // Main Reminders (AM/PM or any two times)
      if (currentTimeStr === settings.reminderTime || currentTimeStr === settings.reminderTime2) {
        const lastReminderKey = `nexora_last_reminder_${currentTimeStr}_${todayStr}`;
        const lastReminderDone = localStorage.getItem(lastReminderKey);
        if (!lastReminderDone) {
          sendNotification('Nexora 🔥', {
            body: 'Hey 👋 Ready for today’s challenge?',
            icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
          });
          localStorage.setItem(lastReminderKey, 'true');
        }
      }

      // Daily Motivation Reminder
      if (currentTimeStr === (settings.motivationTime || '12:00')) {
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
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, 'customPlans');
      } catch (e) {
        console.error("Firestore error handled:", e);
      }
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
        const data = snapshot.docs.map(doc => doc.data() as any);
        if (user && !data.find(d => d.uid === user.uid)) {
          data.push({
            uid: user.uid,
            displayName: settings.displayName || 'Anonymous',
            photoURL: settings.profilePic || user.photoURL || '',
            weeklyXP: stats.weeklyXP || 0,
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

  useEffect(() => {
    const saved = localStorage.getItem(`nexora_progress_${today}`);
    if (saved) {
      try {
        setDailyProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse daily progress", e);
      }
    } else {
      // Reset for new day
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
      });
    }
  }, [today]);

  useEffect(() => {
    localStorage.setItem(`nexora_progress_${today}`, JSON.stringify(dailyProgress));
    
    // Update history whenever daily progress changes
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('nexora_progress_'));
    const allHistory = allKeys.map(k => {
      try {
        return JSON.parse(localStorage.getItem(k) || '{}');
      } catch (e) {
        return {};
      }
    })
      .filter(item => item && item.date)
      .sort((a, b) => a.date.localeCompare(b.date));
    setHistory(allHistory);
  }, [dailyProgress, today]);

  const checkTrophies = useCallback(() => {
    setStats((prevStats) => {
      const now = Date.now();
      let changed = false;
      const trophies = prevStats.trophies || [];
      const updatedTrophies = trophies.map(t => {
        const earnedTime = new Date(t.earnedDate).getTime();
        const daysSince = (now - earnedTime) / (1000 * 60 * 60 * 24);
        
        if (t.type === 'golden' && daysSince >= 2) {
          changed = true;
          return { ...t, type: 'ice' as const, lastUpdated: new Date().toISOString() };
        }
        if (t.type === 'ice' && daysSince >= 3) {
          changed = true;
          return { ...t, type: 'broken' as const, lastUpdated: new Date().toISOString() };
        }
        return t;
      });
      
      if (changed) {
        const hasIce = updatedTrophies.some(t => t.type === 'ice');
        const hasBroken = updatedTrophies.some(t => t.type === 'broken');

        if (settings.notificationsEnabled) {
          if (hasIce) {
            sendNotification('Trophy Alert! 🧊', {
              body: 'One of your trophies just turned to ICE! Complete a challenge now to save it!',
              icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
            });
          } else if (hasBroken) {
            sendNotification('Trophy Alert! 💔', {
              body: 'Oh no! A trophy has BROKEN! Don\'t let more break, bro!',
              icon: 'https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png'
            });
          }
        }

        if (settings.soundEnabled) {
          // Use a timeout to ensure side effects happen outside of the render/update phase
          setTimeout(() => {
            if (hasIce) playTrophySound('ice');
            else if (hasBroken) playTrophySound('broken');
            setEmergencyActive(true);
          }, 100);
        }
        return { ...prevStats, trophies: updatedTrophies };
      }
      return prevStats;
    });
  }, [settings.notificationsEnabled, settings.soundEnabled]);

  // Trophy degradation logic
  useEffect(() => {
    const timer = setTimeout(checkTrophies, 2000); // Check shortly after load
    return () => clearTimeout(timer);
  }, [checkTrophies]);

  const handleCompleteChallenge = (finalProgress?: DailyProgress) => {
    setEmergencyActive(false);
    const progress = finalProgress || dailyProgress;
    const nextCompletionsCount = (progress.completionsCount || 0) + 1;
    const trophyLimit = isPro ? 10 : 3;
    const canAwardTrophy = nextCompletionsCount <= trophyLimit && progress.pushupsDone;
    
    // Calculate how many tasks were actually completed in this session
    const completedTasks = Object.entries(progress).filter(([key, value]) => 
      ['pushupsDone', 'waterDrank', 'breathingDone', 'drawingDone', 'footballDone', 'bubblesDone', 'memoryDone', 'gratitudeDone', 'reactionDone', 'meditationDone', 'writingDone'].includes(key) && 
      (typeof value === 'boolean' ? value === true : (typeof value === 'number' ? value > 0 : false))
    ).length;

    if (canAwardTrophy) {
      console.log(`Awarding trophy for completion #${nextCompletionsCount} today!`);
      if (settings.soundEnabled) {
        if (nextCompletionsCount === 1) play('trophy1');
        else if (nextCompletionsCount === 2) play('trophy2');
        else if (nextCompletionsCount === 3) play('trophy3');
        else play('trophy1');
      }
      setEarnedTrophyToday(true);
    } else {
      if (settings.soundEnabled) play('continue');
      setEarnedTrophyToday(false);
    }

    setStats((prevStats) => {
      const isDailyQuest = progress.dailyQuestDone || (challengeStep === dailyQuest);
      
      // Base rewards for finishing the flow
      let pointsToAdd = isDailyQuest ? 25 : 15;
      let xpToAdd = isDailyQuest ? 50 : 30;
      let coinsToAdd = isDailyQuest ? 30 : 20;

      // Session Bonus: Only give full bonus if they completed at least 3 tasks
      const sessionBonusMultiplier = completedTasks >= 3 ? 1.5 : 1.0;
      pointsToAdd = Math.round(pointsToAdd * sessionBonusMultiplier);
      xpToAdd = Math.round(xpToAdd * sessionBonusMultiplier);
      coinsToAdd = Math.round(coinsToAdd * sessionBonusMultiplier);

      const oldLevel = prevStats.level || 1;
      
      // Streak logic
      let finalStreak = prevStats.streak || 0;
      let newBestStreak = prevStats.bestStreak || 0;
      let newTotalCompletedDays = prevStats.totalCompletedDays || 0;
      let newLastCompletedDate = prevStats.lastCompletedDate;
      let streakBonusPoints = 0;

      if (prevStats.lastCompletedDate !== today) {
        const baseStreak = prevStats.lastCompletedDate === getYesterday() ? (prevStats.streak || 0) + 1 : 1;
        const hasStreakProtection = settings.purchasedItems?.includes('streak-protection');
        finalStreak = hasStreakProtection ? Math.max(baseStreak, prevStats.streak || 0) : baseStreak;
        
        newBestStreak = Math.max(prevStats.bestStreak || 0, finalStreak);
        newTotalCompletedDays = (prevStats.totalCompletedDays || 0) + 1;
        newLastCompletedDate = today;
        
        const hasDoublePoints = settings.purchasedItems?.includes('double-points');
        streakBonusPoints = hasDoublePoints ? 10 : 5;
      }

      const newPoints = (prevStats.totalPoints || 0) + pointsToAdd + streakBonusPoints;
      const newXP = (prevStats.xp || 0) + xpToAdd;
      const newLevel = Math.floor(newXP / 1000) + 1; // 1000 XP per level
      
      let levelUpBonusCoins = 0;
      if (newLevel > oldLevel) {
        setShowLevelUp(newLevel);
        levelUpBonusCoins = 50;
        showToast(`LEVEL UP! You are now Level ${newLevel}! +50 Coins! 🔥`, 'success');
        vibrate(VIBRATION_PATTERNS.TROPHY);
      }

      showToast(`Session Complete! +${pointsToAdd + streakBonusPoints} Points, +${xpToAdd} XP & +${coinsToAdd} Coins! 🏆`, 'success');

      // Grow the plant, bro!
      growPlant();

      const newTrophies = [...(prevStats.trophies || [])];
      if (newTotalCompletedDays === 1 && !newTrophies.find(t => t.id === 'first-steps')) {
        newTrophies.push({ id: 'first-steps', type: 'golden', earnedDate: new Date().toISOString(), lastUpdated: new Date().toISOString() });
      }

      const newStats = {
        ...prevStats,
        totalPoints: newPoints,
        weeklyPoints: (prevStats.weeklyPoints || 0) + pointsToAdd + streakBonusPoints,
        xp: newXP,
        weeklyXP: (prevStats.weeklyXP || 0) + xpToAdd,
        level: newLevel,
        coins: (prevStats.coins || 0) + coinsToAdd + levelUpBonusCoins,
        streak: finalStreak,
        bestStreak: newBestStreak,
        totalCompletedDays: newTotalCompletedDays,
        lastCompletedDate: newLastCompletedDate,
        trophies: newTrophies,
        pointsByCategory: {
          physical: (prevStats.pointsByCategory?.physical || 0) + (isDailyQuest ? 10 : 5),
          mental: (prevStats.pointsByCategory?.mental || 0) + (isDailyQuest ? 10 : 5),
          creative: (prevStats.pointsByCategory?.creative || 0) + (isDailyQuest ? 5 : 2),
        }
      };

      // Update Leaderboard
      if (user) {
        const currentRank = leaderboard.findIndex(l => l.uid === user.uid) + 1;
        let newLeague = settings.league || 'Bronze';
        if (currentRank > 0 && currentRank <= 3 && newStats.weeklyPoints > 50) {
          const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
          const leagueIndex = LEAGUES.indexOf(newLeague);
          if (leagueIndex < LEAGUES.length - 1) {
            newLeague = LEAGUES[leagueIndex + 1];
            setSettings(prev => ({ ...prev, league: newLeague }));
            showToast(`PROMOTED! Welcome to the ${newLeague} League! 🏆`, 'success');
          }
        }

        const leaderboardRef = doc(db, 'leaderboard', user.uid);
        setDoc(leaderboardRef, {
          uid: user.uid,
          displayName: settings.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          streak: newStats.streak || 0,
          totalPoints: newStats.totalPoints,
          weeklyPoints: newStats.weeklyPoints,
          weeklyXP: newStats.weeklyXP || 0,
          xp: newStats.xp || 0,
          level: newLevel,
          league: newLeague
        }, { merge: true }).catch(e => {
          try {
            handleFirestoreError(e, OperationType.WRITE, 'leaderboard');
          } catch (err) {
            console.error("Leaderboard update error handled:", err);
          }
        });
      }

      // Award Golden Trophy if within daily limit
      if (canAwardTrophy) {
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
      ...progress, 
      completed: true,
      completionsCount: nextCompletionsCount,
      dailyQuestDone: progress.dailyQuestDone || (challengeStep === dailyQuest),
      // Reset tasks for the next run if under limit
      pushupsDone: false,
      waterDrank: 0,
      breathingDone: false,
      drawingDone: false,
      footballDone: false,
      bubblesDone: false
    });
    setChallengeStep('completion');
    setShowCoinAnimation(true);
  };

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      await signOut(auth);
      setStats(DEFAULT_STATS);
      setSettings(DEFAULT_SETTINGS);
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
    } catch (err) {
      console.error('Feedback Error:', err);
      showToast('Transmission failed. Connectivity issue?', 'error');
    }
  };

  const onShowManifesto = () => {
    setShowUpdatePopup(true);
  };

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
        <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} settings={settings} setSettings={onUpdateSettings} setupFCM={setupFCM} />
      </Suspense>
    );
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
                <Mascot className="w-12 h-12" hat={settings.activeSkin} soundPack={settings.isDogSoundPackActive ? 'dog' : 'cat'} />
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
          <WhatIsNewModalWrapper onClose={() => setShowUpdatePopup(false)} />
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl flex flex-col min-h-screen relative z-10 mx-auto">
        
        {activeScreen !== 'challenge' && activeScreen !== 'social' && activeScreen !== 'nexus-video' && (
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
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (settings.soundEnabled) play('header_switch');
                  setActiveScreen('subscription');
                }}
                className={`flex items-center gap-1 p-2 transition-colors ${activeScreen === 'subscription' ? 'text-amber-500' : 'text-amber-500/60 hover:text-amber-500'}`}
              >
                <Crown size={24} />
                <span className="font-bold text-xs">Pro</span>
              </button>
              <button 
                onClick={() => {
                  if (settings.soundEnabled) play('header_switch');
                  setActiveScreen('house');
                }}
                className={`p-2 transition-colors ${activeScreen === 'house' ? 'text-blue-600' : 'text-blue-900/40 hover:text-blue-900/60'}`}
              >
                <Home size={24} />
              </button>
              <button 
                onClick={() => {
                  if (settings.soundEnabled) play('header_switch');
                  setActiveScreen('profile');
                }}
                className={`p-2 transition-colors ${activeScreen === 'profile' ? 'text-blue-600' : 'text-blue-900/40 hover:text-blue-900/60'}`}
              >
                {settings.profilePic ? (
                  <img src={settings.profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" referrerPolicy="no-referrer" loading="lazy" />
                ) : (
                  <User size={24} />
                )}
              </button>
              <button 
                onClick={() => {
                  if (settings.soundEnabled) play('header_switch');
                  setActiveScreen('settings');
                }}
                className={`p-2 transition-colors ${activeScreen === 'settings' ? 'text-blue-600' : 'text-blue-900/40 hover:text-blue-900/60'}`}
              >
                <Settings size={24} />
              </button>
              <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
                  if (settings.soundEnabled) play('header_switch');
                  setActiveScreen('social');
                  // We can't easily set activeTab here without complex ref/callback, 
                  // but we can use sessionStorage or just let them click Inbox in social.
                  // For now, let's just go to social.
                }}
                className={`p-2 transition-colors relative text-blue-900/40 hover:text-blue-900/60`}
              >
                <Bell size={24} className={unreadNotifCount > 0 ? "text-blue-600" : ""} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-sm border border-white">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 flex flex-col px-4 sm:px-6 pb-32">
          <AnimatePresence mode="wait">
            {activeScreen === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <HomeScreen 
                  stats={stats} 
                  onStartChallenge={() => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    setActiveCustomPlan(null);
                    setChallengeStep('pushups');
                    setActiveScreen('challenge');
                  }}
                  isCompletedToday={dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 999) : 3)}
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
                  }}
                  onDeleteCustomPlan={handleDeleteCustomPlan}
                  onOpenPlanBuilder={() => setActiveScreen('plan-builder')}
                  onOpenPlant={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('plant');
                  }}
                  onOpenStudio={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('studio');
                  }}
                  fcmToken={fcmToken}
                  setupFCM={setupFCM}
                  fcmError={fcmError}
                  showToast={showToast}
                />
              </motion.div>
            )}
            {activeScreen === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">FETCHING IDENTITY...</div>}>
                  <ProfileScreen settings={settings} setSettings={onUpdateSettings} stats={stats} user={user} setActiveScreen={setActiveScreen} circles={circles} />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'social' && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">ENTERING THE NEXUS...</div>}>
                  <SocialScreen 
                    play={play}
                    onBack={() => setActiveScreen('profile')} 
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
            {activeScreen === 'nexus-video' && (
               <motion.div
                  key="nexus-video"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="w-full"
               >
                  <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">TUNING FREQUENCIES...</div>}>
                    <NexusVideoScreen 
                       onBack={() => {
                          setActiveScreen('social');
                          setFocusedVideoId(null);
                       }}
                       user={user}
                       settings={settings}
                       showToast={showToast}
                       initialVideoId={focusedVideoId}
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
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                        streak: currency === 'streak' ? prev.streak - item.price : prev.streak,
                        coins: currency === 'coins' ? (prev.coins || 0) - (item.coinPrice || 0) : (prev.coins || 0)
                      }));
                    }}
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen('home');
                    }}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'subscription' && (
              <motion.div
                key="subscription"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full p-6 flex flex-col items-center justify-center min-h-screen text-center"
              >
                <h2 className="text-3xl font-black text-blue-900 mb-4">Coming Soon</h2>
                <p className="text-blue-900/60">We're working hard to bring you Nexora Pro. Stay tuned!</p>
                <button onClick={() => setActiveScreen('home')} className="mt-8 px-6 py-3 bg-blue-900 text-white rounded-full font-bold">Back Home</button>
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
                    setFocusedVideoId(v.id);
                    setActiveScreen('nexus-video');
                  }}
                  onDeleteVideo={handleDeleteSavedVideo}
                  onActivate={(id) => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setSettings(prev => {
                      const itemToActivate = prev.inventory?.find(i => i.id === id);
                      const inventory = (prev.inventory || []).map(item => {
                        if (item.id === id) {
                          return { ...item, activated: true };
                        }
                        // If it's a skin, deactivate other skins
                        if (item.type === 'skin' && itemToActivate?.type === 'skin') {
                          return { ...item, activated: false };
                        }
                        // If it's music, deactivate other music
                        if (item.type === 'music' && itemToActivate?.type === 'music') {
                          return { ...item, activated: false };
                        }
                        // If it's sound-pack, deactivate other sound-packs
                        if (item.type === 'sound-pack' && itemToActivate?.type === 'sound-pack') {
                          return { ...item, activated: false };
                        }
                        return item;
                      });
                      
                      const activeItem = inventory.find(i => i.id === id);
                      let activeSkin = prev.activeSkin;
                      if (activeItem?.type === 'skin') {
                        activeSkin = activeItem.itemId.replace('skin-', '');
                      }

                      let isDogSoundPackActive = prev.isDogSoundPackActive;
                      if (activeItem?.type === 'sound-pack') {
                        isDogSoundPackActive = activeItem.itemId === 'sound-dog';
                      }

                      // If it's a gift, give a reward and keep it activated (as opened)
                      if (activeItem?.type === 'gift' && !activeItem.activated) {
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

                      return { ...prev, inventory, activeSkin, isDogSoundPackActive };
                    });
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
            {activeScreen === 'studio' && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                <Suspense fallback={<div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black italic tracking-widest">NEXORA STUDIO LOADING...</div>}>
                  <NexoraStudio 
                    onBack={() => setActiveScreen('home')}
                    onPost={handlePostVideo}
                    user={user}
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
                    settings={settings}
                    stats={stats}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === 'challenge' && (
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
                />
              </Suspense>
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

        {activeScreen !== 'challenge' && activeScreen !== 'nexus-video' && (
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
              <NavButton 
                active={activeScreen === 'home'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  if (settings.soundEnabled) play('nav_switch');
                  setActiveScreen('home');
                }} 
                icon={<Home size={24} />} 
                label="Home"
              />
              <NavButton 
                active={activeScreen === 'progress'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  if (settings.soundEnabled) play('nav_switch');
                  setActiveScreen('progress');
                }} 
                icon={<BarChart2 size={24} />} 
                label="Progress"
              />
              <NavButton 
                active={activeScreen === 'shop'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  if (settings.soundEnabled) play('nav_switch');
                  setActiveScreen('shop');
                }} 
                icon={<Star size={24} />} 
                label="Shop"
              />
              <NavButton 
                active={activeScreen === 'library'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  if (settings.soundEnabled) play('nav_switch');
                  setActiveScreen('library');
                }} 
                icon={<TrophyIcon size={24} />} 
                label="Library"
              />
              <NavButton 
                active={activeScreen === 'notebook'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  if (settings.soundEnabled) play('nav_switch');
                  setActiveScreen('notebook');
                }} 
                icon={<Book size={24} />} 
                label="Notebook"
              />
              <NavButton 
                active={activeScreen === 'leaderboard'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  if (settings.soundEnabled) play('nav_switch');
                  setActiveScreen('leaderboard');
                }} 
                icon={<TrophyIcon size={24} />} 
                label="Rank"
              />
            </nav>
          </motion.div>
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
                        onClick={() => setShowUpdatePopup(false)}
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
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <RefreshCw size={18} className="animate-spin-slow" />
                      UPDATE NOW
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
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] border border-white/20 backdrop-blur-xl"
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
  );
}
