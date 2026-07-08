import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
console.log("App.tsx is loading...");
import {
  Home,
  BarChart2,
  BarChart3,
  User,
  CheckCircle2,
  Droplets,
  Wind,
  Palette,
  Flame,
  Star,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Settings,
  X,
  Pen,
  Pencil,
  Eraser,
  Trophy as TrophyIcon,
  Zap,
  Brain,
  Heart,
  Target,
  Camera,
  Upload,
  Bell,
  BellOff,
  Volume2,
  Download,
  Trash2,
  Save,
  PaintBucket,
  MessageSquare,
  Music,
  Image as ImageIcon,
  Sparkles,
  BrainCircuit,
  Smile,
  LogOut,
  Send,
  Book,
  RefreshCw,
  AlertCircle,
  Award,
  Users,
  Crown,
  Info,
  Map as MapIcon,
  Check,
  Plus,
  Clock,
  History,
  BookOpen,
  Sprout,
  MoreHorizontal,
  Flag,
  Bookmark,
  EyeOff,
  Share2,
  Search,
  Youtube,
  Video,
  Lock,
  WifiOff,
  Shield,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence, useAnimationControls } from "motion/react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useSound } from "./hooks/useSound";
import {
  HouseItem,
  PlacedHouseItem,
  UserSettings,
  UserStats,
  DailyProgress,
  Screen,
  ChallengeStep,
  Trophy,
  TrophyType,
  MascotMood,
  BadgeSettings,
  LeaderboardEntry,
  CustomPlan,
  PlantType,
  SocialCircle,
  Post,
  SocialComment,
  NexusNotification,
  NexusVideo,
  UserReport,
  SystemNotification,
  PlantState,
} from "./types";
import { HOUSE_ITEMS } from "./constants/houseItems";
import { NexoraStudio } from "./components/NexoraStudio";
import {
  format,
  subDays,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import {
  db,
  messaging,
  handleFirestoreError,
  OperationType,
  trackEvent,
  auth,
  onAuthStateChanged,
  signOut,
  deleteUser,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "./firebase";
import {
  doc,
  getDoc,
  setDoc as firestoreSetDoc,
  updateDoc as firestoreUpdateDoc,
  getDocFromServer,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  where,
  getDocs,
  addDoc as firestoreAddDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";

function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj as any;
  if (
    (obj as any)._methodName || 
    (obj as any).constructor?.name?.includes('FieldValue') ||
    (obj as any)._sentinel ||
    typeof (obj as any).isEqual === 'function'
  ) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanPayload) as any;
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      cleaned[key] = cleanPayload(val);
    }
  }
  return cleaned;
}

const setDoc = (reference: any, data: any, options?: any) => {
  return firestoreSetDoc(reference, cleanPayload(data), options);
};

const updateDoc = (reference: any, data: any) => {
  return firestoreUpdateDoc(reference, cleanPayload(data));
};

const addDoc = (reference: any, data: any) => {
  return firestoreAddDoc(reference, cleanPayload(data));
};
import { getToken, onMessage } from "firebase/messaging";
import { AuthScreen } from "./components/AuthScreen";
import { LandingPage } from "./components/LandingPage";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { useAppIcon } from "./hooks/useAppIcon";
import { PlanBuilder } from "./components/PlanBuilder";
import { HomeScreen } from "./components/HomeScreen";
import { LootDropResult } from "./types/garden";
import { LootCard } from "./components/LootCard";
import { Mascot } from "./components/Mascot";
import { MascotParticleRain } from "./components/MascotParticleRain";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  GoldenTrophy,
  IceTrophy,
  BrokenTrophy,
  playTrophySound,
} from "./components/Trophies";
import WhatIsNewModal from "./components/WhatIsNewModal";
import {
  HappyMascot,
  LevelUpCelebration,
  CoinAnimation,
  MascotAIWrapper,
} from "./components/SuspenseWrappers";

import { CelebrationModal } from "./components/CelebrationModal";
import { playLootSound } from "./components/LootCard";
import { addSeedToInventory, calculateLootDrop } from "./types/garden";
import { startPreloading } from "./lib/preloader";

import { GardenScreen } from "./components/GardenScreen";
import { HouseScreen } from "./components/HouseScreen";
import { ArchivesScreen } from "./components/ArchivesScreen";
import { LibraryScreen } from "./components/LibraryScreen";
import { ShopScreen } from "./components/ShopScreen";
import { PlantScreen } from "./components/PlantScreen";
import { SocialScreen } from "./components/SocialScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { ProgressScreen } from "./components/ProgressScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { DeviceShowcase } from "./components/DeviceShowcase";
import { SubscriptionScreen } from "./components/SubscriptionScreen";
import { GalleryScreen } from "./components/GalleryScreen";
import { NotebookScreen } from "./components/NotebookScreen";
import { ChallengeFlow } from "./components/ChallengeFlow";
import { ArchitectLab } from "./components/ArchitectLab";
import { NexusVision } from "./components/NexusVision";
import { DeepChecklist } from "./components/DeepChecklist";
import { CompletionFlame } from "./components/CompletionFlame";
import { RewardsScreen } from "./components/RewardsScreen";
import { TrophyRewardsScreen } from "./components/TrophyRewardsScreen";
import { AdminPanel } from "./components/AdminPanel";
import { HydrationDetailPage } from "./components/HydrationDetailPage";

const SOCIAL_LOCKED = false;

import { vibrate, VIBRATION_PATTERNS } from "./lib/vibrate";
import {
  requestNotificationPermission,
  setupOnMessageListener,
  VAPID_KEY,
} from "./lib/notifications";

import { NavButton } from "./components/NavButton";
import { SplashScreen } from "./components/SplashScreen";
import { useNexoraData } from "./hooks/useNexoraData";
import { MascotImage } from "./components/MascotImage";
import nexoraAppIconImg from "./assets/images/nexora_app_icon.png";

const nexoraAppIcon = "/nexora_mascot_new.png";

const detectLowEndDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  
  // Low concurrency (CPUs with 4 or fewer cores)
  const cores = navigator.hardwareConcurrency;
  if (cores && cores <= 4) return true;
  
  // Weak memory (4 GB or less memory)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory <= 4) return true;
  
  // Old Chrome version graphics bottlenecks
  const ua = navigator.userAgent.toLowerCase();
  const chromeMatch = ua.match(/chrome\/(\d+)/);
  if (chromeMatch) {
    const version = parseInt(chromeMatch[1], 10);
    if (version && version < 90) return true; // Chrome 89 or older
  }
  
  return false;
};

const DEFAULT_SETTINGS: UserSettings = {
  pushupsGoal: 5,
  waterGoal: 2,
  reminderTime: "09:00",
  reminderTime2: "21:00",
  motivationTime: "12:00",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  displayName: "Nexora User",
  themeColor: "#3b82f6",
  soundEnabled: true,
  notificationsEnabled: true,
  showQuotes: true,
  unitSystem: "metric",
  activeHat: "none",
  activeSkin: "sunset",
  zenModeEnabled: false,
  challengeCountGoal: 3,
  league: "Bronze",
  badgeSettings: {
    trophyAlerts: true,
    appUpdates: true,
    dailyChallenge: true,
    dailyQuest: true,
    dynamicUrgency: true,
  },
  purchasedHouseItemIds: [],
  placedHouseItems: [],
  mascotSize: 1.5,
  mascotPos: { x: 400, y: 300 },
  mascotPinnedItemId: null,
  spaceOnboardingCompleted: false,
  plantOnboardingCompleted: false,
  performanceMode: detectLowEndDevice(),
  lowPowerMode: detectLowEndDevice(),
  plantState: {
    type: "sprout",
    stage: 0,
    growthPoints: 0,
    lastGrowthDate: null,
    lastCheckDate: new Date().toISOString(),
    health: 100,
    isDead: false,
    isThirsty: false,
    unlockedTypes: ["sprout"],
  },
  accountName: "",
  email: "",
  time: "",
  profilePrivacy: "private",
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
  unlockedHats: ["none"],
};

import { PublicRankView } from "./components/PublicRankView";

const NAV_ITEMS_MAP: Record<
  string,
  { label: string; icon: React.ReactNode; screen: Screen }
> = {
  home: { label: "Home", icon: <Home size={22} strokeWidth={2} />, screen: "home" },
  social: { label: "Community", icon: <Users size={22} strokeWidth={2} />, screen: "social" },
  progress: {
    label: "Stats",
    icon: <BarChart2 size={22} strokeWidth={2} />,
    screen: "progress",
  },
  shop: { label: "Shop", icon: <Star size={22} strokeWidth={2} />, screen: "shop" },
  library: {
    label: "Library",
    icon: <TrophyIcon size={22} strokeWidth={2} />,
    screen: "library",
  },
  notebook: { label: "Notebook", icon: <Book size={22} strokeWidth={2} />, screen: "notebook" },
  leaderboard: {
    label: "Rank",
    icon: <TrophyIcon size={22} strokeWidth={2} />,
    screen: "leaderboard",
  },
};

export default function App() {
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const {
    user,
    loading,
    authLoading,
    isDataReady,
    settings,
    setSettings,
    stats,
    setStats,
    dailyProgress,
    setDailyProgress,
    gardenState,
    setGardenState,
    needsOnboarding,
    setNeedsOnboarding,
    dataLoadedFromFirestore,
    loadError,
    forceSyncData,
  } = useNexoraData(DEFAULT_SETTINGS, DEFAULT_STATS, showToast);

  const [splashFinished, setSplashFinished] = useState(false);

  // Performance-optimized animation configs for page transitions
  const pageVariants = {
    initial: settings.performanceMode ? { opacity: 0 } : { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: settings.performanceMode ? { opacity: 0 } : { opacity: 0, x: -15 },
  };
  const pageTransition = settings.performanceMode 
    ? { duration: 0.1 } 
    : { type: "spring" as const, stiffness: 500, damping: 40 };

  // Global hydration-detail states synced with localStorage
  const [hydrationConsecutiveDays, setHydrationConsecutiveDays] = useState<number>(() => {
    return parseInt(localStorage.getItem('hydration_consecutive_days') || '0', 10);
  });
  const [hydrationWaterLevel, setHydrationWaterLevel] = useState<number>(() => {
    return parseFloat(localStorage.getItem('hydration_water_level') || '0.0');
  });
  const [hydrationLastCompletedDate, setHydrationLastCompletedDate] = useState<string>(() => {
    return localStorage.getItem('hydration_last_completed_date') || '';
  });
  const [pendingHydrationCoinsAdded, setPendingHydrationCoinsAdded] = useState<boolean>(false);

  // Reload hydration state when the logged-in user changes to prevent cross-account leaks
  useEffect(() => {
    if (!user) {
      setHydrationConsecutiveDays(0);
      setHydrationWaterLevel(0.0);
      setHydrationLastCompletedDate('');
      setSplashFinished(false);
    } else {
      setHydrationConsecutiveDays(parseInt(localStorage.getItem('hydration_consecutive_days') || '0', 10));
      setHydrationWaterLevel(parseFloat(localStorage.getItem('hydration_water_level') || '0.0'));
      setHydrationLastCompletedDate(localStorage.getItem('hydration_last_completed_date') || '');
      setSplashFinished(false);
    }
  }, [user]);

  // 2-Day Inactivity Check & Reset
  useEffect(() => {
    if (!user) return;
    const lastCompleted = localStorage.getItem('hydration_last_completed_date');
    if (lastCompleted) {
      const lastDate = new Date(lastCompleted);
      const todayDate = new Date();
      lastDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 2) {
        localStorage.setItem('hydration_consecutive_days', '0');
        localStorage.setItem('hydration_water_level', '0.0');
        localStorage.removeItem('hydration_last_completed_date');
        setHydrationConsecutiveDays(0);
        setHydrationWaterLevel(0.0);
        setHydrationLastCompletedDate('');
        showToast("⚠️ Inactivity detected! High-water challenge streak & bottle level reset to 0.", "error");
      }
    }
  }, [user]);

  const triggerWaterChallengeCompletion = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Increment consecutive days
    const nextDays = hydrationConsecutiveDays + 1;
    // Increment bottle water level by 20%
    let nextLevel = hydrationWaterLevel + 0.20; 
    let awardedCoins = 0;

    if (nextLevel >= 0.999) {
      nextLevel = 0.0; // resets back to 0 so they can fill it again!
      awardedCoins = 10;
    }

    localStorage.setItem('hydration_consecutive_days', nextDays.toString());
    localStorage.setItem('hydration_water_level', nextLevel.toFixed(3));
    localStorage.setItem('hydration_last_completed_date', todayStr);

    setHydrationConsecutiveDays(nextDays);
    setHydrationWaterLevel(nextLevel);
    setHydrationLastCompletedDate(todayStr);

    // Increment daily progress counter when fully completing the Water Challenge!
    onUpdateDailyProgress((prev) => {
      const updatedCount = (prev.waterDrank || 0) + 1;
      return {
        ...prev,
        waterDrank: updatedCount,
        waterDone: updatedCount >= (settings.waterGoal || 2),
      };
    });

    if (awardedCoins > 0) {
      // Award +10 coins!
      onUpdateStats((prev) => ({
        ...prev,
        coins: (prev.coins || 0) + awardedCoins
      }));
      setPendingHydrationCoinsAdded(true);
      setTimeout(() => {
        setPendingHydrationCoinsAdded(false);
      }, 4000);
      showToast("🪙 Epic! Big Water Bottle is totally full! +10 Coins Added! 🏆💧", "success");
    } else {
      showToast(`💧 Water Challenge Complete! Streak: ${nextDays} (+20% Bottle Water) 🏆`, "success");
    }
  };

  useEffect(() => {
    const skin = settings.activeSkin || 'none';
    const themeClass = skin === 'obsidian' 
      ? 'theme-obsidian' 
      : skin === 'neural_bio'
        ? 'theme-neural_bio'
        : skin === 'sunset'
          ? 'theme-sunset'
          : skin === 'oceanic_midnight'
            ? 'theme-oceanic_midnight'
            : 'theme-standard';
            
    document.body.classList.remove('theme-standard', 'theme-obsidian', 'theme-neural_bio', 'theme-sunset', 'theme-oceanic_midnight');
    document.body.classList.add(themeClass);
  }, [settings.activeSkin]);

  useEffect(() => {
    if (gardenState?.pendingLootSeed) {
      playLootSound('appear');
      vibrate(25);
    }
  }, [gardenState?.pendingLootSeed]);

  const onUpdateSettings = useCallback(
    (
      newSettings:
        | Partial<UserSettings>
        | ((prev: UserSettings) => UserSettings),
    ) => {
      try {
        setSettings((prev) => {
          const updated =
            typeof newSettings === "function"
              ? newSettings(prev)
              : { ...prev, ...newSettings };
          if (updated.plantState && !updated.plantState.type)
            updated.plantState.type = "sprout";
          return updated;
        });
      } catch (e) {
        console.error("NEXORA: Settings Update Failed", e);
        showToast("Critical: Settings Sync Error", "error");
      }
    },
    [setSettings],
  );

  const onUpdateStats = useCallback(
    (newStats: Partial<UserStats> | ((prev: UserStats) => UserStats)) => {
      try {
        setStats((prev) => {
          if (typeof newStats === "function") return newStats(prev);
          // Deep merge protection for stats including trophies and categories
          return {
            ...prev,
            ...newStats,
            pointsByCategory: {
              ...prev.pointsByCategory,
              ...(newStats.pointsByCategory || {}),
            },
            trophies: newStats.trophies || prev.trophies || [],
          };
        });
      } catch (e) {
        console.error("NEXORA: Stats Update Failed", e);
        showToast("Critical: Stats Sync Error", "error");
      }
    },
    [setStats],
  );

  const headerMascotControls = useAnimationControls();
  const lastLogoTapRef = useRef<number>(0);
  const logoTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerHeaderMascotReaction = async () => {
    await headerMascotControls.start({
      scaleY: [1, 0.78, 1.15, 0.95, 1],
      scaleX: [1, 1.2, 0.85, 1.05, 1],
      y: [0, 5, -28, 2, 0],
      rotate: [0, -4, 10, -2, 0],
      boxShadow: [
        "0 0 0 rgba(96,165,250,0)",
        "0 0 10px rgba(96,165,250,0.4)",
        "0 0 20px rgba(96,165,250,0.6)",
        "0 0 4px rgba(96,165,250,0.2)",
        "0 0 0 rgba(96,165,250,0)"
      ],
      transition: { duration: 0.45, ease: "easeInOut" }
    });
  };

  const triggerHeaderMascotSingleBounce = async () => {
    await headerMascotControls.start({
      y: [0, -8, 0],
      scaleY: [1, 0.92, 1.04, 1],
      transition: { duration: 0.28, ease: "easeInOut" }
    });
  };

  const handleLogoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Play sweet mascot sound
    try {
      if (settings.isDogSoundPackActive) {
        play("dogHappy");
      } else {
        play("catHappy");
      }
    } catch (err) {
      console.warn("Mascot click sound deferred:", err);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastLogoTapRef.current < DOUBLE_TAP_DELAY) {
      if (logoTapTimeoutRef.current) {
        clearTimeout(logoTapTimeoutRef.current);
        logoTapTimeoutRef.current = null;
      }
      triggerHeaderMascotReaction();
      window.dispatchEvent(
        new CustomEvent("trigger-mascot-celebration", {
          detail: { source: "logo", rect }
        })
      );
    } else {
      lastLogoTapRef.current = now;
      logoTapTimeoutRef.current = setTimeout(() => {
        triggerHeaderMascotSingleBounce();
        logoTapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const [circles, setCircles] = useState<SocialCircle[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<NexusNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showCompletionFlame, setShowCompletionFlame] = useState(false);
  const [showRewardsScreen, setShowRewardsScreen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showArchitectLab, setShowArchitectLab] = useState(false);
  const [proTestMessage, setProTestMessage] = useState<string | null>(null);
  const [originalStatsBeforeProTest, setOriginalStatsBeforeProTest] =
    useLocalStorage<UserStats | null>("nexora_original_stats", null);
  const [isCurrentlyBoosting, setIsCurrentlyBoosting] = useState(false);

  // Pro Test Expiration & Boost Manager
  useEffect(() => {
    if (!isDataReady) return;

    const testExpiresAt = settings.proTestExpiresAt;
    const now = new Date();
    // Use a small buffer to avoid weird edge cases on load
    const isTestActive =
      testExpiresAt && new Date(testExpiresAt).getTime() > now.getTime() + 100;

    if (isTestActive) {
      if (!isCurrentlyBoosting) {
        setIsCurrentlyBoosting(true);

        // Only save original if we haven't already (prevents recursive overwrite on refresh)
        if (!originalStatsBeforeProTest) {
          const statsToSave = JSON.parse(JSON.stringify(stats));
          setOriginalStatsBeforeProTest(statsToSave);

          // Apply temporary boost ONLY ONCE
          setStats((prev) => ({
            ...prev,
            streak: Math.max(prev.streak, 9999),
            coins: Math.max(prev.coins, 900000),
            xp: Math.max(prev.xp, 150000),
            level: Math.max(prev.level, 99),
          }));
          showToast("PRO PROTOCOL: BOOSTED STATS ACTIVATED!", "success");
        }
      }
    } else if (
      isCurrentlyBoosting ||
      (testExpiresAt && new Date(testExpiresAt).getTime() <= now.getTime())
    ) {
      // Transition from active to expired, OR detected as already expired on load
      setIsCurrentlyBoosting(false);

      // If we were previously boosting or detected it was active but expired
      if (originalStatsBeforeProTest) {
        if (
          !originalStatsBeforeProTest ||
          Object.keys(originalStatsBeforeProTest).length === 0
        ) {
          console.warn("Skipping Pro rollback because original stats are empty");
          return;
        }

        // Force rollback of stats
        setStats(originalStatsBeforeProTest);
        setOriginalStatsBeforeProTest(null);
        showToast("PRO TRIAL ENDED: STATS ROLLBACK SUCCESSFUL.", "info");
        onUpdateSettings({ proTestActive: false, proTestExpiresAt: null });
        setProTestMessage(
          "Your pro features test time is out. If u want it u can pay, bro! 👑",
        );
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
  const [sessionTrophy, setSessionTrophy] = useState<TrophyType>("golden");
  const [globalSavedVideos, setGlobalSavedVideos] = useState<NexusVideo[]>([]);
  const [focusedVideoId, setFocusedVideoId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [dailyQuest, setDailyQuest] = useState<ChallengeStep>("water");
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [isLibraryReplay, setIsLibraryReplay] = useState(false);
  const [challengeStep, setChallengeStep] = useState<ChallengeStep | null>(
    null,
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  // Space House Unlock Logic
  const isSpaceHouseUnlocked = useMemo(() => {
    const progress = settings.plantsProgress || {};
    const plantsArray = Object.values(progress);
    if (plantsArray.length < 3) return false;

    // Check if at least 3 plants have reached Stage 5
    const stage5Plants = plantsArray.filter((p) => p.stage >= 5);
    return stage5Plants.length >= 3;
  }, [settings.plantsProgress]);

  // Calculate Global Mascot Mood for the Dynamic Icon (Duolingo Style)
  const globalMascotMood: MascotMood = useMemo(() => {
    if (!isDataReady) return "neutral";

    const now = new Date();
    const hours = now.getHours();

    // 1. Boiling (Streak Power)
    if (stats.streak >= 3) return "boiling";

    // 2. Angry (Reminder Mode)
    const isLate = hours >= 18;
    const tasksDone = (dailyProgress as any).completionsCount > 0;
    if (isLate && !tasksDone) return "angry";

    // 3. Happy (Default progress)
    if (tasksDone) return "happy";

    return "neutral";
  }, [stats.streak, (dailyProgress as any).completionsCount, isDataReady]);

  // Apply Dynamic Icon & Badging (Duolingo-style)
  useAppIcon(globalMascotMood, stats, dailyProgress);

  const isPro = settings?.isPro || (settings?.proTestActive ? true : false);

  const currentAppVersion = "1.5.2"; // Stable v1.5.2 Standard Version
  const [activeScreen, setActiveScreen] = useLocalStorage<Screen>(
    "nexora_active_screen",
    "home",
  );
  const [decayAlert, setDecayAlert] = useState<{
    days: number;
    decayedPoints: number;
    decayedXP: number;
    resetAll: boolean;
    message: string;
  } | null>(null);
  // --- VERSION ROLLBACK & RECOVERY ENGINE STATES & HANDLERS ---
  const [rollbackCountdown, setRollbackCountdown] = useState<number | null>(null);
  const [rollbackBackupData, setRollbackBackupData] = useState<any>(null);

  const handleRollbackRestore = useCallback(() => {
    try {
      const rawBackup = localStorage.getItem("nexora_version_rollback_backup");
      if (!rawBackup) {
        showToast("No rollback recovery backup available!", "error");
        return;
      }
      
      const backup = JSON.parse(rawBackup);
      
      // Revert Settings
      if (backup.settings) {
        onUpdateSettings(backup.settings);
      }
      // Revert Stats
      if (backup.stats) {
        onUpdateStats(backup.stats);
      }
      // Revert dailyProgress
      if (backup.dailyProgress) {
        setDailyProgress(backup.dailyProgress);
        localStorage.setItem('nexora_progress', JSON.stringify(backup.dailyProgress));
      }
      // Revert gardenState
      if (backup.gardenState) {
        setGardenState(backup.gardenState);
        localStorage.setItem('nexora_garden', JSON.stringify(backup.gardenState));
      }
      
      // Revert active run version
      const oldVersion = backup.version || "2.1.0";
      localStorage.setItem("nexora_version", oldVersion);
      // Clean timer seen tag so it can mismatch again
      localStorage.removeItem("nexora_rollback_timer_seen_for_version");
      
      // Close the timer
      setRollbackCountdown(null);
      
      vibrate(VIBRATION_PATTERNS.NOTIFY);
      showToast(`Rollback complete! Rolled back to version v${oldVersion} configuration because of emergency.`, "success");
    } catch (e) {
      console.error("Rollback restore failed:", e);
      showToast("Rollback failed. Profile data corrupt.", "error");
    }
  }, [onUpdateSettings, onUpdateStats, setDailyProgress, setGardenState, showToast]);

  const handleSimulateNewUpdate = useCallback(() => {
    try {
      // Create backup with version mismatching current
      const backup = {
        version: "2.1.0",
        settings: { ...settings },
        stats: { ...stats },
        dailyProgress: { ...dailyProgress },
        gardenState: { ...gardenState },
        backupTime: new Date().toISOString()
      };
      
      localStorage.setItem("nexora_version_rollback_backup", JSON.stringify(backup));
      localStorage.setItem("nexora_version", "2.1.0"); // Set previous version to trigger mismatch
      localStorage.removeItem("nexora_rollback_timer_seen_for_version"); // Clear timer seen
      
      setRollbackBackupData(backup);
      
      // Force trigger the timer
      setRollbackCountdown(10);
      
      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
      showToast("Simulated update! 10s Countdown activated with backup of active state.", "success");
    } catch (e) {
      console.error("Simulation failed:", e);
      showToast("Simulation failed.", "error");
    }
  }, [settings, stats, dailyProgress, gardenState, showToast]);

  // SMART FEEDBACK TRIGGER
  useEffect(() => {
    if (
      !isDataReady ||
      !user ||
      activeScreen !== "home" ||
      settings.feedbackSubmitted
    )
      return;

    const lastPrompt = settings.lastFeedbackPromptDate
      ? new Date(settings.lastFeedbackPromptDate)
      : null;
    const now = new Date();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    const timeToPrompt =
      !lastPrompt || now.getTime() - lastPrompt.getTime() > SEVEN_DAYS_MS;
    const reachedMilestone = stats.totalPoints > 300 || (stats.level || 0) > 1;

    if (timeToPrompt && reachedMilestone) {
      const timer = setTimeout(() => {
        setShowFeedbackPrompt(true);
        vibrate(VIBRATION_PATTERNS.NOTIFY);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [
    isDataReady,
    user,
    activeScreen,
    settings.feedbackSubmitted,
    settings.lastFeedbackPromptDate,
    stats.totalPoints,
    stats.level,
  ]);

  const onDismissFeedback = () => {
    onUpdateSettings({ lastFeedbackPromptDate: new Date().toISOString() });
    setShowFeedbackPrompt(false);
  };

  const onAcceptFeedback = () => {
    setShowFeedbackPrompt(false);
    setActiveScreen("settings");
    setTimeout(() => {
      showToast("TAP 'SYNC FEEDBACK' TO SHARE YOUR LOGS!", "info");
    }, 500);
  };

  // Tracking screen views
  useEffect(() => {
    if (user && isDataReady) {
      trackEvent("screen_view", { screen_name: activeScreen });
    }
  }, [activeScreen, user, isDataReady]);

  // Tracking app open
  useEffect(() => {
    if (user && isDataReady) {
      trackEvent("app_opened", {
        streak: stats.streak,
        coins: stats.coins,
        isPro: settings.isPro,
      });
    }
  }, [user, isDataReady]);

  // Preload large content images lazily in background
  useEffect(() => {
    if (isDataReady) {
      const timer = setTimeout(() => {
        try {
          startPreloading();
        } catch (err) {
          console.warn("NEXORA: Background image preloader load skipped (offline mode)", err);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDataReady]);

  // Handle URL parameters for PWA Shortcuts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get("screen") as Screen | null;
    if (
      screenParam &&
      ["home", "challenge", "nexus-vision", "social", "progress"].includes(
        screenParam,
      )
    ) {
      setActiveScreen(screenParam);
      // Clean up URL without refreshing
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Persistence, Version Sync, & Rollback Detection
  useEffect(() => {
    if (!isDataReady) return;

    const storedVersion = localStorage.getItem("nexora_version");
    const lastTimerSeenVersion = localStorage.getItem("nexora_rollback_timer_seen_for_version");

    if (storedVersion && storedVersion !== currentAppVersion) {
      console.log(
        `PWA: New version detected: ${currentAppVersion}. Clearing stale caches.`,
      );
      setShowUpdatePopup(true);

      // Create configuration safety backup of ALL active user states!
      const backup = {
        version: storedVersion,
        settings: { ...settings },
        stats: { ...stats },
        hydrationConsecutiveDays,
        hydrationWaterLevel,
        dailyProgress: { ...dailyProgress },
        backupTime: new Date().toISOString()
      };
      
      localStorage.setItem("nexora_version_rollback_backup", JSON.stringify(backup));
      setRollbackBackupData(backup);

      // If we haven't shown or dismissed the 10-second countdown for this specific version yet, start it!
      if (lastTimerSeenVersion !== currentAppVersion) {
        setRollbackCountdown(10);
      }
    } else {
      // If there's no stored version, write this version immediately
      if (!storedVersion) {
        localStorage.setItem("nexora_version", currentAppVersion);
      }
      // Load current rollback backup details if found in localStorage
      const existingBackup = localStorage.getItem("nexora_version_rollback_backup");
      if (existingBackup) {
        try {
          setRollbackBackupData(JSON.parse(existingBackup));
        } catch (e) {
          console.warn("NEXORA: Failed parse for rollback backup cache:", e);
        }
      }
    }

    // Save running version
    localStorage.setItem("nexora_version", currentAppVersion);
  }, [isDataReady]);

  // Version countdown ticker clock
  useEffect(() => {
    if (rollbackCountdown === null) return;

    if (rollbackCountdown <= 0) {
      // Completed/Dismissed! Save tag so timer is completely eliminated and never prompts again for this update
      localStorage.setItem("nexora_rollback_timer_seen_for_version", currentAppVersion);
      localStorage.setItem("nexora_version", currentAppVersion);
      setRollbackCountdown(null);
      showToast(`Welcome to v${currentAppVersion}! System stable.`, "info");
      return;
    }

    const interval = setInterval(() => {
      setRollbackCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [rollbackCountdown]);

  // FIXED NOTIFICATION SCHEDULE
  const NOTIFICATION_SLOTS = useMemo(
    () => [
      {
        time: "07:30",
        topic: "Motivation",
        body: "Rise and shine, bro! Ready to crush your goals? 🚀",
      },
      {
        time: "10:00",
        topic: "Morning Reminder",
        body: "Mid-morning check-in! Keep that momentum high. 🔥",
      },
      {
        time: "14:30",
        topic: "Afternoon Boost",
        body: "Afternoon slump? Not for a Nexora legend! Let's go! ⚡",
      },
      {
        time: "18:30",
        topic: "Motivation",
        body: "Evening energy! Finish your day strong, bro! 🛡️",
      },
      {
        time: "20:30",
        topic: "Evening Reflection",
        body: "Time to reflect on your wins today. Deep breaths. 🧘",
      },
    ],
    [],
  );

  useEffect(() => {
    if (!settings.notificationsEnabled || !isDataReady) return;

    const checkSchedule = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const lastSent = JSON.parse(
        localStorage.getItem("nexora_sent_notifications") || "{}",
      );

      NOTIFICATION_SLOTS.forEach((slot) => {
        if (slot.time === timeStr && lastSent[slot.time] !== today) {
          sendNotification(`Nexora: ${slot.topic}`, { body: slot.body });
          lastSent[slot.time] = today;
          localStorage.setItem(
            "nexora_sent_notifications",
            JSON.stringify(lastSent),
          );
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

    const notifRef = collection(db, "users", user.uid, "notifications");
    const q = query(
      notifRef,
      where("read", "==", false),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const notifs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as SystemNotification,
        );

        // Sort in memory to bypass composite/collectionGroup index constraints
        notifs.sort((a, b) => {
          const timeA = a.createdAt ? (typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : (typeof a.createdAt === "object" && a.createdAt && "seconds" in a.createdAt ? (a.createdAt as any).seconds * 1000 : 0)) : 0;
          const timeB = b.createdAt ? (typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : (typeof b.createdAt === "object" && b.createdAt && "seconds" in b.createdAt ? (b.createdAt as any).seconds * 1000 : 0)) : 0;
          return timeB - timeA;
        });

        const activeNotif = notifs[0];
        const notifId = activeNotif.id;
        // Check if user dismissed it locally in this session/browser
        if (localStorage.getItem(`nexora_system_notif_dismissed_${notifId}`)) {
          return;
        }

        setActiveSystemNotification(activeNotif);
        vibrate(VIBRATION_PATTERNS.NOTIFY);
      }
    });

    return () => unsubscribe();
  }, [user, isDataReady]);

  const markSystemNotificationRead = async (id: string) => {
    // ALWAYS hide the notification immediately from the UI
    setActiveSystemNotification(null);

    try {
      localStorage.setItem(`nexora_system_notif_dismissed_${id}`, "true");
    } catch {}

    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "notifications", id), {
        read: true,
      });
    } catch (e) {
      console.warn("Failed to mark notification as read in Firestore:", e);
    }
  };
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );
  const [lastScrollY, setLastScrollY] = useState(0);
  const { play, stop, playMusic, stopAllMusic } = useSound();

  const currentPlayingMusicTrack = useMemo(() => {
    if (!settings.soundEnabled) return null;
    const activeMusicItem = (settings.inventory || []).find(
      (item) => item.type === "music" && item.activated,
    );
    if (activeMusicItem) {
      return {
        id: activeMusicItem.id,
        itemId: activeMusicItem.itemId,
        name: activeMusicItem.name || "Custom Beat Track",
        isZen: false,
      };
    }
    if (
      settings.zenModeEnabled &&
      (activeScreen === "challenge" || activeScreen === "home")
    ) {
      return {
        id: "zen-forest",
        itemId: "music-forest",
        name: "Forest Treasure (Zen Mode)",
        isZen: true,
      };
    }
    return null;
  }, [settings.inventory, settings.soundEnabled, settings.zenModeEnabled, activeScreen]);
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [earnedTrophyToday, setEarnedTrophyToday] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [activeSystemNotification, setActiveSystemNotification] =
    useState<SystemNotification | null>(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("SYSTEM RECONNECTED: NEXUS SYNC RESTORED", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast(
        "SYSTEM OFFLINE: SHIELD ACTIVATED (LOCAL CACHE ENABLED)",
        "info",
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check for slow network
    const conn = (navigator as any).connection;
    if (conn) {
      const handleConnChange = () => {
        if (
          conn.saveData ||
          conn.effectiveType === "2g" ||
          conn.effectiveType === "slow-2g"
        ) {
          showToast(
            "SLOW NETWORK DETECTED: NEXORA OPTIMIZED MODE ACTIVE",
            "info",
          );
        }
      };
      conn.addEventListener("change", handleConnChange);
      handleConnChange();
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        conn.removeEventListener("change", handleConnChange);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const [activeCustomPlan, setActiveCustomPlan] = useState<CustomPlan | null>(
    null,
  );
  const [viewingTrophy, setViewingTrophy] = useState<Trophy | null>(null);
  const [publicUserViewId, setPublicUserViewId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUserId = params.get("user");
    if (sharedUserId) {
      setPublicUserViewId(sharedUserId);
    }
  }, []);

  const onUpdateDailyProgress = (
    update: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress),
  ) => {
    setDailyProgress((prev) =>
      typeof update === "function" ? update(prev) : { ...prev, ...update },
    );
  };

  useEffect(() => {
    let ticking = false;
    let prevScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > prevScrollY && currentScrollY > 50) {
            setScrollDirection("down");
          } else if (currentScrollY < prevScrollY) {
            setScrollDirection("up");
          }
          prevScrollY = currentScrollY;
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleUpdateProfile = async (
    name: string,
    photoURL: string,
    location: string,
    extraFields?: { accountName?: string; email?: string }
  ) => {
    if (!user) return;
    try {
      const finalAccountName = extraFields?.accountName || settings.accountName || name || user.displayName || user.email?.split('@')[0] || "Champion";
      const finalEmail = extraFields?.email || settings.email || user.email || "";
      const finalTime = settings.time || new Date().toISOString();

      // Update local state first
      onUpdateSettings({
        displayName: name,
        profilePic: photoURL,
        location,
        accountName: finalAccountName,
        email: finalEmail,
        time: finalTime
      });

      // Update Firestore user document
      const userDocRef = doc(db, "users", user.uid);
      const userSingularDocRef = doc(db, "user", user.uid);
      const updatePayload = {
        uid: user.uid,
        role: "user",
        name: name,
        "Name": name,
        displayName: name,
        photoFileName: photoURL,
        "Photo file name": photoURL,
        profilePic: photoURL,
        "Profile image": photoURL,
        location: location,
        "Location": location,
        time: finalTime,
        "Time": finalTime,
        date: settings.date || new Date().toISOString(),
        "Date": settings.date || new Date().toISOString(),
        accountName: finalAccountName,
        "Account name": finalAccountName,
        email: finalEmail || `${user.uid}@nexora.app`,
        "Email": finalEmail || `${user.uid}@nexora.app`,
        "Email address": finalEmail || `${user.uid}@nexora.app`,
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, updatePayload, { merge: true });
      await setDoc(userSingularDocRef, updatePayload, { merge: true });

      // Sync to leaderboard immediately
      const leaderboardRef = doc(db, "leaderboard", user.uid);
      await setDoc(
        leaderboardRef,
        {
          uid: user.uid,
          displayName: name,
          photoURL: photoURL || settings.profilePic || user.photoURL || "",
          streak: stats.streak || 0,
          totalPoints: stats.totalPoints || 0,
          weeklyXP: stats.weeklyXP || 0,
          weeklyPoints: stats.weeklyPoints || 0,
          level: stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1,
          league: settings.league || "Bronze",
        },
        { merge: true },
      );

      showToast("Profile sync successful! 🛡️", "success");
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (err) {
      console.error(err);
      showToast("Profile update failed", "error");
    }
  };

  useEffect(() => {
    if (!user) {
      setGlobalSavedVideos([]);
      return;
    }
    const q = query(
      collection(db, "social_videos"),
      where("savedBy", "array-contains", user.uid),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setGlobalSavedVideos(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as NexusVideo,
          ),
        );
      },
      (err) => {
        console.error("Global saved videos fetch error:", err);
      },
    );
    return unsub;
  }, [user]);

  const handleDeleteSavedVideo = async (vId: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, "social_videos", vId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as NexusVideo;
        const newSavedBy = (data.savedBy || []).filter((id) => id !== user.uid);
        await updateDoc(docRef, {
          savedBy: newSavedBy,
          saves: newSavedBy.length,
        });
        showToast("Video removed from library, bro! 🛡️", "success");
        vibrate(VIBRATION_PATTERNS.CLICK);
      }
    } catch (err) {
      console.error(err);
      showToast("Action failed", "error");
    }
  };

  const handlePostVideo = async (videoData: any) => {
    if (!user) return;
    try {
      const postData = {
        ...videoData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        isAuthorized: true,
      };

      await addDoc(collection(db, "social_videos"), postData);
      showToast("Nexus Reel Published! 🚀", "success");
      setActiveScreen("home");
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (err) {
      console.error("Studio Post Error:", err);
      showToast("Error fail to post", "error");
      handleFirestoreError(err, OperationType.WRITE, "social_videos");
    }
  };

  const buyHouseItem = (id: string, currency: "streak" | "coins") => {
    const item = HOUSE_ITEMS.find((i) => i.id === id);
    if (!item) return;

    if (currency === "coins") {
      if (stats.coins < item.coinPrice) {
        showToast("Not enough coins, bro! 🪙", "error");
        return;
      }
      setStats((prev) => ({ ...prev, coins: prev.coins - item.coinPrice }));
    } else {
      if (stats.streak < item.price) {
        showToast("Streak not high enough, bro! 🔥", "error");
        return;
      }
    }

    onUpdateSettings({
      purchasedHouseItemIds: [...(settings.purchasedHouseItemIds || []), id],
    });

    if (user) {
      const purchaseRef = doc(db, "shop_purchases", user.uid);
      setDoc(purchaseRef, {
        userId: user.uid,
        userName: settings.displayName || user.displayName || "Champion",
        userEmail: user.email || `${user.uid}@nexora.app`,
        purchases: arrayUnion({
          itemId: item.id,
          itemName: item.name,
          itemIcon: item.icon || "🏠",
          price: currency === "coins" ? item.coinPrice : item.price,
          currency: currency,
          itemType: "house_item",
          purchasedAt: new Date().toISOString(),
        }),
        updatedAt: serverTimestamp()
      }, { merge: true }).catch((err) => console.error("Failed to save house item purchase:", err));
    }

    showToast(`Purchased ${item.name}! 🏠`, "success");
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    if (settings.soundEnabled) play("coin");
  };

  const buyEcosystemItem = async (item: any) => {
    if (stats.coins < item.price) {
      showToast("Not enough coins, bro! 🪙", "error");
      return;
    }

    setStats((prev) => ({ ...prev, coins: prev.coins - item.price }));

    const newPurchasedIds = [
      ...(settings.purchasedEcosystemItemIds || []),
      item.id,
    ];
    onUpdateSettings({
      purchasedEcosystemItemIds: newPurchasedIds,
      hasNewPlantItem: true,
    });

    // PERMANENT BACKEND REGISTRATION (Legacy support)
    if (user) {
      try {
        const itemRef = doc(db, "users", user.uid, "eco_shop", item.id);
        await setDoc(itemRef, {
          purchasedAt: new Date().toISOString(),
        });

        // 1. Log to global shop_purchases collection under user UID
        const purchaseRef = doc(db, "shop_purchases", user.uid);
        setDoc(purchaseRef, {
          userId: user.uid,
          userName: settings.displayName || user.displayName || "Champion",
          userEmail: user.email || `${user.uid}@nexora.app`,
          purchases: arrayUnion({
            itemId: item.id,
            itemName: item.name,
            itemIcon: item.icon || "🌿",
            price: item.price,
            currency: "coins",
            itemType: "ecosystem_item",
            purchasedAt: new Date().toISOString(),
          }),
          updatedAt: serverTimestamp()
        }, { merge: true }).catch((err) => console.error("Failed to save ecosystem purchase to shop_purchases:", err));

        // 2. Log to global plants collection under user UID
        const plantRef = doc(db, "plants", user.uid);
        setDoc(plantRef, {
          userId: user.uid,
          userName: settings.displayName || user.displayName || "Champion",
          userEmail: user.email || `${user.uid}@nexora.app`,
          lastEcosystemItemId: item.id,
          lastEcosystemItemName: item.name,
          lastEcosystemItemType: "purchased_ecosystem_item",
          lastEcosystemItemAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch((err) => console.error("Failed to write to plants collection:", err));

      } catch (e) {
        console.error("Ecosystem item sync failed:", e);
      }
    }

    showToast(`Ecosystem upgraded: ${item.name}! 🌿`, "success");
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    if (settings.soundEnabled) play("coin");

    trackEvent("item_purchased", {
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      currency: "coins",
    });
  };

  const toggleEcosystemItem = (itemId: string) => {
    const current = settings.activeEcosystemItemIds || [];
    const isActive = current.includes(itemId);
    const updated = isActive
      ? current.filter((id) => id !== itemId)
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
      room,
    };
    onUpdateSettings({
      placedHouseItems: [...(settings.placedHouseItems || []), newItem],
    });
    vibrate(10);
  };

  const removeHouseItem = (instanceId: string) => {
    const itemToRemove = settings.placedHouseItems?.find(
      (i) => i.id === instanceId,
    );
    const updatedItems = (settings.placedHouseItems || []).filter(
      (item) => item.id !== instanceId,
    );

    onUpdateSettings({
      placedHouseItems: updatedItems,
      mascotPinnedItemId:
        itemToRemove && settings.mascotPinnedItemId === itemToRemove.id
          ? null
          : settings.mascotPinnedItemId,
    });
    vibrate(5);
  };

  const updateHouseItemPosition = (
    instanceId: string,
    x: number,
    y: number,
  ) => {
    const currentItems = settings.placedHouseItems || [];
    const index = currentItems.findIndex((i) => i.id === instanceId);
    if (index === -1) return;

    const movingItem = currentItems[index];

    // Update position and bring to front by moving it to the end of the array
    const otherItems = currentItems.filter((item) => item.id !== instanceId);
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
      mascotPos,
    });
  };

  useEffect(() => {
    if (activeScreen === "challenge") {
      setEmergencyActive(false);
    }
  }, [activeScreen]);

  const handleArchiveChallenge = (challengeId: string) => {
    const updated = [
      ...(settings.archivedOfficialChallenges || []),
      challengeId,
    ];
    onUpdateSettings({ archivedOfficialChallenges: updated });
    showToast(`The ${challengeId} challenge has been archived.`, "info");

    // Immediately pick a new one if it was current
    if (dailyQuest === challengeId) {
      const allSteps: ChallengeStep[] = [
        "pushups",
        "water",
        "breathing",
        "drawing",
        "football",
        "bubbles",
        "memory",
        "reaction",
      ];
      const available = allSteps.filter((s) => !updated.includes(s));
      if (available.length > 0) {
        setDailyQuest(available[Math.floor(Math.random() * available.length)]);
      } else {
        setDailyQuest(null);
      }
    }
  };

  useEffect(() => {
    // Select a daily quest based on the date
    const allSteps: ChallengeStep[] = [
      "pushups",
      "water",
      "breathing",
      "drawing",
      "football",
      "bubbles",
      "memory",
      "reaction",
    ];
    const archived = settings.archivedOfficialChallenges || [];
    const available = allSteps.filter((s) => !archived.includes(s));

    if (available.length === 0) {
      setDailyQuest(null);
      return;
    }

    const dayOfYear = Math.floor(
      (new Date().getTime() -
        new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    setDailyQuest(available[dayOfYear % available.length]);
  }, [settings.archivedOfficialChallenges]);

  // PLANT LOGIC: GROWTH & HEALTH CHECKER
  const ECOSYSTEM_PATH: PlantType[] = [
    "sprout",
    "zen",
    "desert",
    "tropical",
    "forest",
    "meadow",
    "crystal",
    "volcano",
    "boredFlower",
    "mourningSprout",
    "breezeTulip",
    "happyTulip",
    "distressedRose",
  ];

  const growPlant = useCallback(() => {
    setSettings((prev) => {
      const type = prev.plantState?.type || "sprout";
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
      const hasUV = activeItems.includes("eco_uv_lamp_01");
      const hasDrone = activeItems.includes("eco_drone_01");

      let growthAmount = 15;
      if (hasUV) growthAmount *= 2;
      if (hasDrone) growthAmount += 2; // Passive bonus

      let newPoints = current.growthPoints + growthAmount;
      let newStage = current.stage;
      let newUnlocked = [...(prev.plantState?.unlockedTypes || ["sprout"])];

      if (newPoints >= 100) {
        if (newStage < 5) {
          newStage += 1;
          newPoints = 0;
          vibrate(VIBRATION_PATTERNS.SUCCESS);
          showToast(
            `Your ${type.toUpperCase()} grew to Stage ${newStage}! 🌿✨`,
            "success",
          );

          // Unlock logic when ANY plant reaches Stage (Level) 5
          if (newStage === 5) {
            const currentIdx = ECOSYSTEM_PATH.indexOf(type);
            if (currentIdx !== -1 && currentIdx < ECOSYSTEM_PATH.length - 1) {
              const nextType = ECOSYSTEM_PATH[currentIdx + 1];
              if (!newUnlocked.includes(nextType)) {
                newUnlocked.push(nextType);
                showToast(
                  `Congratulations! NEW ECOSYSTEM UNLOCKED: ${nextType.toUpperCase()}! 🌿🏆`,
                  "success",
                );
                // Set flag for golden glow notification
                localStorage.setItem("nexora_new_plant_unlocked", "true");

                // SpaceHouse Unlock Flow
                if (newUnlocked.length >= 4 && !settings.spaceHouseUnlocked) {
                  setShowCelebration(true);
                  if (settings.soundEnabled) play("fire_streak");
                }
              }
            }
          }
        } else {
          newPoints = 100;
        }
      } else {
        showToast(`Energy gathered for ${type}! +15% Energy 💧`, "success");
      }

      const updatedPlantProgress = {
        ...current,
        stage: newStage,
        growthPoints: newPoints,
        lastGrowthDate: new Date().toISOString(),
        health: 100,
        isThirsty: false,
      };

      return {
        ...prev,
        plantsProgress: {
          ...plants,
          [type]: updatedPlantProgress,
        },
        plantState: {
          ...prev.plantState,
          type,
          stage: newStage,
          growthPoints: newPoints,
          unlockedTypes: newUnlocked,
          isDead: false,
          isThirsty: false,
          health: 100,
        },
      };
    });
  }, [settings.plantState, settings.plantsProgress]);

  useEffect(() => {
    if (!user) return;

    // Initialize plant if not exists
    if (isDataReady && !settings.plantState) {
      onUpdateSettings({
        plantState: {
          type: "sprout",
          stage: 0,
          growthPoints: 0,
          lastGrowthDate: null,
          lastCheckDate: new Date().toISOString(),
          health: 100,
          isDead: false,
          isThirsty: false,
          unlockedTypes: ["sprout"],
        },
      });
      return;
    }

    if (!settings.plantState) return;

    const checkPlant = () => {
      const now = new Date();
      const lastCheck = new Date(
        settings.plantState!.lastCheckDate || now.toISOString(),
      );
      const diffMs = now.getTime() - lastCheck.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      const activeItems = settings.activeEcosystemItemIds || [];
      const hasSprinkler = activeItems.includes("eco_sprinkler_01");
      const deathThreshold = 48;
      const thirstThreshold = hasSprinkler ? 48 : 36; // Sprinkler buys time

      if (diffHours >= deathThreshold && !settings.plantState!.isDead) {
        // 2 days
        const type = settings.plantState!.type;
        const currentProgress = settings.plantsProgress?.[type] || {
          stage: settings.plantState!.stage,
          growthPoints: settings.plantState!.growthPoints,
          lastGrowthDate: settings.plantState!.lastGrowthDate,
          health: 100,
          isDead: false,
          isThirsty: false,
        };

        const updatedProgress = {
          ...currentProgress,
          isDead: true,
          health: 0,
          isThirsty: true,
        };

        onUpdateSettings({
          plantState: {
            ...settings.plantState!,
            isDead: true,
            health: 0,
            isThirsty: true,
            lastCheckDate: now.toISOString(),
          },
          plantsProgress: {
            ...(settings.plantsProgress || {}),
            [type]: updatedProgress,
          },
        });

        // Inactivity Penalty: Reduce weekly leaderboard points & XP by 250!
        onUpdateStats((prev) => {
          const updatedPoints = Math.max(0, (prev.weeklyPoints || 0) - 250);
          const updatedXP = Math.max(0, (prev.weeklyXP || 0) - 250);
          return {
            ...prev,
            weeklyPoints: updatedPoints,
            weeklyXP: updatedXP,
          };
        });

        showToast("INACTIVITY PENALTY: You left for 2 days. Leaderboard progress reduced! ⚠️📉", "error");

        sendNotification("Your Nexora Ecosystem has died... 🥀", {
          body: "Bro, your plants need discipline! Restore the room and try again.",
        });
      } else if (
        diffHours >= thirstThreshold &&
        !settings.plantState!.isThirsty &&
        !settings.plantState!.isDead
      ) {
        // 1.5 days or 2 days with tech
        const type = settings.plantState!.type;
        const currentProgress = settings.plantsProgress?.[type] || {
          stage: settings.plantState!.stage,
          growthPoints: settings.plantState!.growthPoints,
          lastGrowthDate: settings.plantState!.lastGrowthDate,
          health: 100,
          isDead: false,
          isThirsty: false,
        };
        const updatedProgress = { ...currentProgress, isThirsty: true };

        onUpdateSettings({
          plantState: {
            ...settings.plantState!,
            isThirsty: true,
          },
          plantsProgress: {
            ...(settings.plantsProgress || {}),
            [type]: updatedProgress,
          },
        });
        sendNotification("Your ecosystem is thirsty! 💧", {
          body: "Nurture your plants by completing your daily tasks, bro!",
        });
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
    const qNotifs = query(
      collection(db, "users", user.uid, "notifications"),
    );
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      const notifs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as NexusNotification,
      );
      // Sort in memory to bypass index constraints
      notifs.sort((a, b) => {
        const timeA = a.createdAt ? (typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : (typeof a.createdAt === "object" && a.createdAt && "seconds" in a.createdAt ? (a.createdAt as any).seconds * 1000 : 0)) : 0;
        const timeB = b.createdAt ? (typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : (typeof b.createdAt === "object" && b.createdAt && "seconds" in b.createdAt ? (b.createdAt as any).seconds * 1000 : 0)) : 0;
        return timeB - timeA;
      });
      setNotifications(notifs);
      setUnreadNotifCount(notifs.filter((n) => !n.isRead).length);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/notifications`);
      } catch (e) {
        console.error("Firestore global notifications error:", e);
      }
    });

    // Fetch Circles (Filter by user UID for strict privacy)
    const qCircles = query(
      collection(db, "circles"),
      where("ownerId", "==", user.uid)
    );
    const unsubCircles = onSnapshot(qCircles, (snapshot) => {
      const circlesData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as SocialCircle,
      );
      // Sort in memory to bypass index constraints
      circlesData.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
      setCircles(circlesData);
      if (circlesData.length === 0) {
        setCircles([
          {
            id: "nexora-general",
            name: "Nexora General",
            description: "The main hub for all Nexora members.",
            icon: "🏛️",
            color: "bg-blue-100",
            memberCount: 1250,
            category: "general",
            ownerId: "system",
            rules: ["Be respectful", "No spam", "Stay focused"],
            followerIds: [],
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setCircles(circlesData);
      }
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, "circles");
      } catch (e) {
        console.error("Firestore circles error:", e);
      }
    });

    // Fetch Posts (Filter by user UID for strict privacy)
    const qPosts = query(
      collection(db, "posts"),
      where("userId", "==", user.uid)
    );
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      const postsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Post,
      );
      postsData.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setPosts(postsData.slice(0, 50));
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, "posts");
      } catch (e) {
        console.error("Firestore posts error:", e);
      }
    });

    return () => {
      unsubNotifs();
      unsubCircles();
      unsubPosts();
    };
  }, [user]);

  
  
  
  
  const [appMascotError, setAppMascotError] = useState(false);

  // Advanced PWA Master Installation Prompter States - Completely Disabled as requested
  
  
  
  
  
  
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");

  useEffect(() => {
    // Keep track of visits and show popup if they visit multiple times
    const visitsStr = localStorage.getItem("nexora_visit_count") || "0";
    const visits = parseInt(visitsStr, 10) + 1;
    localStorage.setItem("nexora_visit_count", visits.toString());

    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        // Safari fallback detection
        (window.navigator.userAgent.includes("Safari") && !window.navigator.userAgent.includes("Chrome") && (window.navigator as any).standalone) ||
        document.referrer.includes("android-app://");
      

      // Show beautiful install popup after visiting multiple times if not standalone and not dismissed
      const isInstalled = standalone || localStorage.getItem("nexora_pwa_installed") === "true";
      const isDismissed = sessionStorage.getItem("nexora_install_prompt_dismissed") === "true";
      
      const lastDismissedAt = localStorage.getItem("nexora_install_modal_dismissed_at");
      const isDismissed24h = lastDismissedAt && (Date.now() - parseInt(lastDismissedAt, 10)) < (24 * 60 * 60 * 1000);

      // Check if browser supports installation
      const supportsInstall = !!(((window as any).deferredPrompt) || (window as any).deferredPrompt || ('BeforeInstallPromptEvent' in window));

      if (!isInstalled && !isDismissed && !isDismissed24h && visits >= 2 && supportsInstall) {
        setTimeout(() => {
          
        }, 2000);
      }
    };
    checkStandalone();
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    if (mediaQuery && typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", checkStandalone);
      return () => mediaQuery.removeEventListener("change", checkStandalone);
    }
  }, []);

  useEffect(() => {
    // If running in standalone (PWA already installed and active), do not show.
        
    // Check if user has already marked app as installed in localStorage
    const isInstalled = localStorage.getItem("nexora_pwa_installed") === "true";
    if (isInstalled) {
      
      return;
    }

    // Determine if dismissed on current screen / context
    
  }, [user, showAuth, needsOnboarding, activeScreen, challengeStep]);

  // "when I click the Cancel button supposed it have to appear again when the user go to another section of the app"
  // Reset dismiss states on screen transition so the banner can appear again in other sections
  useEffect(() => {
    
    
    
  }, [activeScreen, showAuth]);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nexora_fcm_token");
    }
    return null;
  });
  const [fcmError, setFcmError] = useState<string | null>(null);

  // Sync fcmToken from settings if state is empty but setting exists
  useEffect(() => {
    if (isDataReady && settings.fcmToken && !fcmToken) {
      console.log(
        "FCM: Initializing state from settings matching storage/cloud",
      );
      setFcmToken(settings.fcmToken);
      localStorage.setItem("nexora_fcm_token", settings.fcmToken);
    }
  }, [isDataReady, settings.fcmToken, fcmToken]);

  const sendNotification = async (
    title: string,
    options: NotificationOptions,
  ) => {
    let shownNatively = false;

    // 1. Local Browser Notification (Immediate feedback if app is open)
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      (window as any).Notification &&
      (window as any).Notification.permission === "granted"
    ) {
      try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, options);
          shownNatively = true;
        } else {
          new (window as any).Notification(title, options);
          shownNatively = true;
        }
      } catch (err) {
        console.warn("Native local notification failed, running fallback overlay:", err);
      }
    }

    // 2. Show beautiful fallback overlay inside the app if native notifications aren't showing!
    // This perfectly routes push reminders of actions/reminders to iOS and Android users inside the app!
    if (!shownNatively) {
      const fallbackNotif = {
        id: "local_fall_" + Date.now(),
        title: title,
        message: options.body || "",
        type: "mascot" as const,
        read: false,
        createdAt: new Date().toISOString(),
      };
      // Trigger both sound and state overlay
      setActiveSystemNotification(fallbackNotif);
      if (settings.soundEnabled) {
        try {
          play("challenge_unlock");
        } catch (soundErr) {
          console.warn("Notification sound play rejected:", soundErr);
        }
      }
    }

    // 3. Server-Side FCM Notification (For background/closed app support)
    // We try this regardless of local permission if we have a token,
    // as it might reach other devices where permission IS granted.
    if (fcmToken) {
      try {
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: fcmToken,
            title: title,
            body: options.body || "",
          }),
        });
      } catch (error) {
        console.error("Error sending server-side notification:", error);
      }
    }
  };

  // Version Update Logic
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    releaseNotes: string[];
    forceUpdate: boolean;
    imageUrl?: string;
  } | null>(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(
    localStorage.getItem("nexora_last_update_time"),
  );

  // Background Music Logic
  useEffect(() => {
    if (!settings.soundEnabled) {
      stopAllMusic();
      return;
    }

    const activeMusicItem = (settings.inventory || []).find(
      (item) => item.type === "music" && item.activated,
    );
    if (activeMusicItem) {
      playMusic(activeMusicItem.itemId);
    } else if (
      settings.zenModeEnabled &&
      (activeScreen === "challenge" || activeScreen === "home")
    ) {
      playMusic("music-forest");
    } else {
      stopAllMusic();
    }
  }, [
    settings.inventory, 
    settings.soundEnabled, 
    settings.zenModeEnabled, 
    activeScreen, 
    playMusic, 
    stopAllMusic
  ]);

  // App Badge Logic
  useEffect(() => {
    const updateBadge = async () => {
      // Check if the App Badging API is supported
      if (!("setAppBadge" in navigator)) {
        console.warn(
          "PWA: App Badging API not supported in this browser/mode. (Must be in Standalone/PWA mode on supported OS)",
        );
        return;
      }

      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      if (!isStandalone) {
        console.warn(
          "PWA: App is not running in standalone mode. Badges might not appear on the home screen icon.",
        );
      }

      let count = 0;
      const badgeSettings = settings.badgeSettings || {
        trophyAlerts: true,
        appUpdates: true,
        dailyChallenge: true,
        dailyQuest: true,
        dynamicUrgency: true,
      };
      const now = new Date();

      // 1. Trophy degradation alert (High priority)
      if (badgeSettings.trophyAlerts && emergencyActive) {
        count++;
        console.log("PWA Badge: Trophy emergency active");
      }

      // 2. App update available
      if (badgeSettings.appUpdates && showUpdatePopup) {
        count++;
        console.log(
          "PWA Badge: App update available (showUpdatePopup is true)",
        );
      }

      // 2.5 New content badge (For 24 hours after update)
      if (lastUpdateTime && badgeSettings.appUpdates) {
        const updateDate = new Date(lastUpdateTime);
        const diff = now.getTime() - updateDate.getTime();
        if (diff < 24 * 60 * 60 * 1000) {
          count++;
          console.log("PWA Badge: Recent update (24h window)");
        }
      }

      // 3. Daily challenge not completed (If it's after 6 PM)
      if (
        badgeSettings.dailyChallenge &&
        !dailyProgress.completed &&
        now.getHours() >= 18
      ) {
        count++;
        console.log("PWA Badge: Daily challenge not done (Evening)");
        // Dynamic Urgency: Add another count if it's after 10 PM
        if (badgeSettings.dynamicUrgency && now.getHours() >= 22) {
          count++;
          console.log("PWA Badge: Dynamic urgency active (>10 PM)");
        }
      }

      // 4. Daily quest not done (If it's after 12 PM)
      if (
        badgeSettings.dailyQuest &&
        !dailyProgress.dailyQuestDone &&
        now.getHours() >= 12
      ) {
        count++;
        console.log("PWA Badge: Daily quest not done");
      }

      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
          console.log(
            `PWA Badge: Successfully set to ${count} (Update: ${showUpdatePopup}, Emergency: ${emergencyActive}, LastUpdate: ${lastUpdateTime})`,
          );
        } else {
          await (navigator as any).clearAppBadge();
          console.log("PWA Badge: Cleared (Count is 0)");
        }
      } catch (error) {
        console.error("PWA Badge: Error calling setAppBadge:", error);
      }
    };

    updateBadge();

    // Update every minute to handle time-based badges
    const intervalId = setInterval(updateBadge, 60000);
    return () => clearInterval(intervalId);
  }, [
    emergencyActive,
    showUpdatePopup,
    dailyProgress.completed,
    dailyProgress.dailyQuestDone,
    settings.badgeSettings,
    lastUpdateTime,
  ]);

  const handleUpdate = async (infoArg?: any) => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    const info = infoArg && typeof infoArg === "object" && infoArg.version ? infoArg : updateInfo;
    if (info) {
      const now = new Date().toISOString();
      localStorage.setItem("nexora_dismissed_version", info.version);
      localStorage.setItem("nexora_last_update_time", now);
      localStorage.setItem("nexora_version", info.version);
      setLastUpdateTime(now);
    }

    // Nuclear Update: Unregister SW and clear all caches to ensure a fresh fetch
    try {
      showToast("REBOOTING SYSTEM... STAND BY", "info");

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      console.log(
        "PWA: Caches cleared and Service Worker unregistered. Reloading...",
      );
    } catch (err) {
      console.error("PWA: Error during nuclear update:", err);
    }

    // Clear session storage just in case
    sessionStorage.clear();

    // Forced fresh reload with cache busters
    const targetVer = info?.version || "fresh";
    window.location.href = "/?v=" + targetVer + "&t=" + Date.now();
  };

  // Version check interval - Optimized for performance
  useEffect(() => {
    if (!isDataReady) return;
    const checkVersion = async () => {
      try {
        // Use cache: 'no-store' to ensure we get the latest file from the server
        const response = await fetch("/version.json?t=" + Date.now(), {
          cache: "no-store",
        });
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            const dismissedVersion = localStorage.getItem(
              "nexora_dismissed_version",
            );
            console.log(
              "PWA: Version check - Current:",
              currentAppVersion,
              "Fetched:",
              data.version,
              "Dismissed:",
              dismissedVersion,
            );

            if (dismissedVersion !== data.version) {
              console.log(
                "PWA: New version or unseen update detected:",
                data.version,
              );
              setUpdateInfo(data);
              setShowUpdatePopup(true);

              // If it's a new version, we should also ensure the badge is set immediately
              if ("setAppBadge" in navigator) {
                console.log("PWA: Setting initial update badge");
                (navigator as any).setAppBadge(1).catch(console.error);
              }
            } else {
              console.log("PWA: No new update or already dismissed");
            }
          } else {
            const text = await response.text();
            console.error(
              "Expected JSON for version check, but got:",
              contentType,
              text.substring(0, 100),
            );
          }
        }
      } catch (error) {
        console.error("Error checking version:", error);
      }
    };

    // Check immediately on mount
    checkVersion();

    // Monitor Service Worker updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("PWA: Controller changed, new Service Worker is active");
        // We don't force reload here to avoid interrupting the user,
        // but we know we're ready for the next reload.
      });
    }

    // Set last update time for 1.5.1 if not set
    if (!localStorage.getItem("nexora_last_update_time")) {
      const now = new Date().toISOString();
      localStorage.setItem("nexora_last_update_time", now);
      setLastUpdateTime(now);
    }

    // Check every 2 minutes
    const interval = setInterval(checkVersion, 120000);
    return () => clearInterval(interval);
  }, []);

  // Automatic update reload logic with safety checks for active challenges (Official or User-Created)
  useEffect(() => {
    if (!updateInfo || !updateInfo.version) return;
    
    // Only auto-reload if the fetched version is indeed newer than the current version running
    if (updateInfo.version === currentAppVersion) return;

    // Check if the user is currently taking App Official Challenges or User Created Challenges plan
    // If activeScreen is "challenge" or there's an active challengeStep, do NOT reload right now.
    const isInChallenge = activeScreen === "challenge" || challengeStep !== null;

    if (!isInChallenge) {
      console.log(`PWA: Automatic Reload Triggered! Updating to v${updateInfo.version}`);
      showToast("🚀 Installing Nexora Update... Reloading!", "info");
      
      // Delay slightly so the toast is visible to the user
      const timeout = setTimeout(() => {
        handleUpdate(updateInfo);
      }, 1500);

      return () => clearTimeout(timeout);
    } else {
      console.log("PWA: Update is pending but deferred because user is actively taking a challenge.");
    }
  }, [updateInfo, activeScreen, challengeStep]);

  const sendTestNotification = async () => {
    // Diagnose health first if needed
    try {
      const health = await fetch("/api/health");
      if (!health.ok) {
        showToast(
          "Server Health Check Failed. Is the server running?",
          "error",
        );
      }
    } catch (e) {
      console.warn("Health check failed", e);
    }

    let currentToken = fcmToken;
    if (!currentToken) {
      console.log("Token missing, attempting auto-setup...");
      currentToken = await setupFCM();
    }

    if (!currentToken) {
      showToast(
        "No device token found. Please ensure notifications are enabled in browser settings.",
        "error",
      );
      console.error("FCM Token missing after setup attempt");
      return;
    }

    console.log("Sending test notification to token:", currentToken);
    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: currentToken,
          title: "Nexora Challenge BRO! 🚀",
          body: "This is a test notification from your app. It works!",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error (Notification):", response.status, text);
        showToast(
          `Server Error (${response.status}): ` +
            (text.substring(0, 100) || response.statusText),
          "error",
        );
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast("Test notification sent! Check your device.", "success");
      } else {
        console.error("Notification send failure:", data.error);
        showToast("Failed to send: " + data.error, "error");
      }
    } catch (error: any) {
      console.error("Error sending test notification:", error);
      showToast("Connection Error: " + error.message, "error");
    }
  };

  const sendMotivation = async () => {
    let currentToken = fcmToken;
    if (!currentToken) {
      currentToken = await setupFCM();
    }

    if (!currentToken) {
      showToast(
        "Notification token missing. Enable notifications first!",
        "error",
      );
      return;
    }

    console.log("Requesting AI Motivation for token:", currentToken);
    try {
      const response = await fetch("/api/send-motivation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: currentToken,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error (Motivation):", response.status, text);
        showToast(
          "Server Error: " + (text.substring(0, 100) || response.statusText),
          "error",
        );
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast("AI Motivation transmitted! 🔥", "success");
      } else {
        console.error("Motivation send failure:", data.error);
        showToast("Sync Failed: " + data.error, "error");
      }
    } catch (error: any) {
      console.error("Error sending motivation:", error);
      showToast("Sync Error: " + error.message, "error");
    }
  };

  const sendTestEmail = async () => {
    if (!user?.email) {
      showToast("No user email found.", "error");
      return;
    }

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "email",
          email: user.email,
          title: "Nexora Email Test! 📧",
          body: "Hey bro, this is a test email from your Nexora app. It works!",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        showToast(
          "Server Error: " + (text.substring(0, 50) || response.statusText),
          "error",
        );
        return;
      }

      const data = await response.json();
      if (data.success) {
        showToast("Test email sent to " + user.email, "success");
      } else {
        showToast("Failed to send email: " + data.error, "error");
      }
    } catch (error: any) {
      console.error("Error sending test email:", error);
      showToast("Error: " + error.message, "error");
    }
  };

  // Auto-setup FCM when notifications are enabled
  useEffect(() => {
    if (settings.notificationsEnabled && !fcmToken && !fcmError) {
      console.log(
        "FCM: Notifications enabled but no token, triggering setup...",
      );
      setupFCM();
    }
  }, [settings.notificationsEnabled, fcmToken, fcmError]);

  const setupFCM = async (): Promise<string | null> => {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || VAPID_KEY || "";
    console.log(
      "FCM: Starting setup with VAPID key:",
      vapidKey ? vapidKey.substring(0, 10) + "..." : "none",
    );
    setFcmError(null);
    try {
      // 1. Check if token already exists in localStorage (Legacy check)
      const cachedToken = localStorage.getItem("nexora_fcm_token");
      if (cachedToken && !fcmToken) {
        console.log(
          "FCM: Restored from localStorage:",
          cachedToken.substring(0, 8) + "...",
        );
        setFcmToken(cachedToken);
      }

      // Check if Notification is supported
      if (!("Notification" in window) || !window.Notification) {
        console.warn("FCM: Notifications not supported/blocked in this window environment.");
        setFcmError("NOT_SUPPORTED");
        return null;
      }

      // Request permission if not granted
      if (window.Notification.permission !== "granted") {
        const permission = await window.Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("FCM: Notification permission denied.");
          setFcmError("PERMISSION_DENIED");
          return null;
        }
      }

      const m = await messaging();
      if (!m) {
        console.warn("FCM: Messaging not supported in this browser.");
        setFcmError("NOT_SUPPORTED");
        return null;
      }

      // Ensure service worker is ready
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log("FCM: Service Worker ready:", registration.scope);

        try {
          const token = await getToken(m, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration,
          });

          if (token) {
            console.log("FCM Device Token Acquired:", token);
            setFcmToken(token);
            localStorage.setItem("nexora_fcm_token", token);

            // Only update settings if it's different to prevent loops
            if (settings.fcmToken !== token) {
              onUpdateSettings({ fcmToken: token, notificationsEnabled: true });
            }
            return token;
          } else {
            console.warn("FCM: No token received from getToken.");
            setFcmError("NO_TOKEN");
            return cachedToken || null;
          }
        } catch (tokenErr: any) {
          console.error("FCM getToken error:", tokenErr);
          setFcmError(tokenErr.message || "GET_TOKEN_ERROR");
          return cachedToken || null;
        }
      } else {
        setFcmError("NO_SW");
        return null;
      }
    } catch (error: any) {
      console.error("Error setting up FCM:", error);
      setFcmError(error.message || "UNKNOWN_ERROR");

      // Fallback: If we had a cached token, use it anyway even if fresh fetch failed
      const cachedToken = localStorage.getItem("nexora_fcm_token");
      if (cachedToken) {
        setFcmToken(cachedToken);
        return cachedToken;
      }
      return null;
    }
  };

  useEffect(() => {
    if (user && fcmToken) {
      const saveToken = async () => {
        try {
          /*
          const userRef = doc(db, "users", user.uid);
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          await setDoc(userRef, {
            fcmToken: fcmToken,
            notificationsEnabled: true,
            timezone: tz,
            "settings.fcmToken": fcmToken,
            "settings.notificationsEnabled": true,
            "settings.timezone": tz,
          }, { merge: true });
          console.log("FCM: Token and Timezone saved to Firestore.");
          */
          console.log("FCM: Token saving to Firestore is temporarily disabled.");

        } catch (e) {
          console.error("FCM: Failed to save token:", e);
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

      console.log("FCM: Setting up foreground message listener...");
      unsubscribe = onMessage(m, (payload) => {
        console.log("FCM: Foreground message received!", payload);
        if (payload.notification) {
          // Add notification to historical notifications list if applicable
          setNotifications((prev) => [
            {
              id: Date.now().toString(),
              userId: user.uid,
              senderId: "nexora-system",
              senderName: "Nexora 🔥",
              message: `${payload.notification?.title}: ${payload.notification?.body}`,
              isRead: false,
              createdAt: new Date().toISOString(),
              type: "system",
            },
            ...prev,
          ]);
          setUnreadNotifCount((prev) => prev + 1);

          showToast(
            `🔔 ${payload.notification.title}: ${payload.notification.body}`,
            "info",
          );
          if (settings.soundEnabled) play("nav_switch");
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
    // If the prompt was captured early by main.tsx, use it immediately
    if ((window as any).deferredPrompt) {
      
      
      console.log("PWA: Early captured ((window as any).deferredPrompt) loaded into state");
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      
      (window as any).deferredPrompt = e;
      
      // Automatic uninstallation detection: if promptable, app is not installed
      localStorage.setItem("nexora_pwa_installed", "false");
      

      // Update UI notify the user they can install the PWA
      
      console.log("PWA: beforeinstallprompt event fired, reset installation state");

      // Check auto trigger
      const visitsStr = localStorage.getItem("nexora_visit_count") || "0";
      const visits = parseInt(visitsStr, 10);
      const lastDismissedAt = localStorage.getItem("nexora_install_modal_dismissed_at");
      const isDismissed24h = lastDismissedAt && (Date.now() - parseInt(lastDismissedAt, 10)) < (24 * 60 * 60 * 1000);
      const isDismissed = sessionStorage.getItem("nexora_install_prompt_dismissed") === "true";

      if (visits >= 2 && !isDismissed && !isDismissed24h) {
        
      }
    };

    // Custom event dispatched from main.tsx if it fired before this useEffect but after rendering started
    const handleCustomPromptEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        
        localStorage.setItem("nexora_pwa_installed", "false");
        
        
        console.log("PWA: Custom pre-load prompt event handled, reset installation state");

        // Check auto trigger
        const visitsStr = localStorage.getItem("nexora_visit_count") || "0";
        const visits = parseInt(visitsStr, 10);
        const lastDismissedAt = localStorage.getItem("nexora_install_modal_dismissed_at");
        const isDismissed24h = lastDismissedAt && (Date.now() - parseInt(lastDismissedAt, 10)) < (24 * 60 * 60 * 1000);
        const isDismissed = sessionStorage.getItem("nexora_install_prompt_dismissed") === "true";

        if (visits >= 2 && !isDismissed && !isDismissed24h) {
          
        }
      }
    };

    const handleAppInstalled = () => {
      console.log("PWA: appinstalled event fired");
      localStorage.setItem("nexora_pwa_installed", "true");
      
      
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-deferred-prompt", handleCustomPromptEvent);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (!isStandalone && isIOS) {
      // Custom iOS guides completely disabled as requested
    }

    // Request notification permission on mount if supported
    if (typeof window !== "undefined" && "Notification" in window && window.Notification) {
      if (window.Notification.permission === "default") {
        window.Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("PWA: Notification permission granted");
            setupFCM();
          }
        });
      } else if (window.Notification.permission === "granted") {
        setupFCM();
      }
    }

    // Smart In-App Reminder: Check last active time
    const lastActive = localStorage.getItem("nexora_last_active");
    const now = new Date().getTime();
    if (lastActive) {
      const lastActiveTime = parseInt(lastActive);
      const diffHours = (now - lastActiveTime) / (1000 * 60 * 60);
      if (diffHours > 24) {
        setShowWelcomeBack(true);
      }
    }
    localStorage.setItem("nexora_last_active", now.toString());

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("pwa-deferred-prompt", handleCustomPromptEvent);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setupFCM();
    }
  }, [user]);

  // Daily Reminder Timer removed from here and moved after customPlans definition

  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      showToast(
        "Payment successful! Your Pro features are being unlocked... 🚀",
        "success",
      );
      // Clear the URL param
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    setActiveScreen("home"); // Ensure home is default after major state transitions
  }, [user]);

  // 11. Leaderboard Data Fetching
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "customPlans"),
        where("userId", "==", user.uid),
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const plans = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as CustomPlan,
          );
          // Sort in memory to bypass composite index constraints
          plans.sort((a, b) => {
            const timeA = a.createdAt ? (typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : (typeof a.createdAt === "object" && a.createdAt && "seconds" in a.createdAt ? (a.createdAt as any).seconds * 1000 : 0)) : 0;
            const timeB = b.createdAt ? (typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : (typeof b.createdAt === "object" && b.createdAt && "seconds" in b.createdAt ? (b.createdAt as any).seconds * 1000 : 0)) : 0;
            return timeB - timeA;
          });
          setCustomPlans(plans);
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.LIST, "customPlans");
          } catch (e) {
            console.error("Firestore error handled:", e);
          }
        },
      );
      return () => unsubscribe();
    }
  }, [user]);

  // Daily & Custom Plan Reminder Timer
  useEffect(() => {
    const checkReminders = () => {
      if (!settings.notificationsEnabled) return;
      if (typeof window === "undefined" || !("Notification" in window) || !window.Notification || window.Notification.permission !== "granted")
        return;

      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const todayStr = now.toISOString().split("T")[0];

      // Dynamic Daily Reminders based on Typical Day (workType)
      const workType = settings.workType || "desk";

      if (workType === "desk") {
        // Morning Desk Reminder
        if (currentTimeStr === "09:00") {
          const lastMorningKey = `nexora_morning_${todayStr}`;
          if (!localStorage.getItem(lastMorningKey)) {
            sendNotification("Morning Desk check-in! 🖥️", {
              body: "Desk Bound Focus session: Ready to build incredible habits at your workspace today, bro?",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastMorningKey, "true");
          }
        }
        // Afternoon Desk Reminder
        if (currentTimeStr === "14:00") {
          const lastAfternoonKey = `nexora_afternoon_${todayStr}`;
          if (!localStorage.getItem(lastAfternoonKey)) {
            sendNotification("Afternoon Desk stretch! ☀️", {
              body: "Hey desk warrior, stretch those legs! Ready for your afternoon habit boost?",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastAfternoonKey, "true");
          }
        }
        // Evening Desk Reminder
        if (currentTimeStr === "19:00") {
          const lastEveningKey = `nexora_evening_${todayStr}`;
          if (!localStorage.getItem(lastEveningKey)) {
            sendNotification("Evening Desk Wrap-up! 🌙", {
              body: "End your sedentary session with a finish of strength, bro. Let's lock in!",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastEveningKey, "true");
          }
        }
      } else if (workType === "active") {
        // Morning Active Reminder
        if (currentTimeStr === "08:00") {
          const lastMorningKey = `nexora_morning_${todayStr}`;
          if (!localStorage.getItem(lastMorningKey)) {
            sendNotification("On the Move Morning! 🏃", {
              body: "Start your active journey powerful, bro! Complete a quick morning habit.",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastMorningKey, "true");
          }
        }
        // Afternoon Active Reminder
        if (currentTimeStr === "13:00") {
          const lastAfternoonKey = `nexora_afternoon_${todayStr}`;
          if (!localStorage.getItem(lastAfternoonKey)) {
            sendNotification("Midday On-transit Check! ☀️", {
              body: "Keep moving and stay hydrated, active champion! Take a quick challenge break.",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastAfternoonKey, "true");
          }
        }
        // Evening Active Reminder
        if (currentTimeStr === "18:00") {
          const lastEveningKey = `nexora_evening_${todayStr}`;
          if (!localStorage.getItem(lastEveningKey)) {
            sendNotification("Sunset Active Check-in! 🌙", {
              body: "You have been on the move all day! Let's complete your remaining goals.",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastEveningKey, "true");
          }
        }
      } else if (workType === "student") {
        // Morning Student Reminder
        if (currentTimeStr === "07:30") {
          const lastMorningKey = `nexora_morning_${todayStr}`;
          if (!localStorage.getItem(lastMorningKey)) {
            sendNotification("Student Morning Preparation! 📚", {
              body: "Rise and shine student! Prep for school with a quick training routine!",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastMorningKey, "true");
          }
        }
        // Evening Student Reminder (Overskip Afternoon since students are in school session)
        if (currentTimeStr === "18:00" || currentTimeStr === "18:30") {
          const lastEveningKey = `nexora_evening_${todayStr}`;
          if (!localStorage.getItem(lastEveningKey)) {
            sendNotification("Student School Wrap-up! 🌙", {
              body: "Welcome back from school, bro! Let's complete your daily study and habits loop!",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastEveningKey, "true");
          }
        }
      } else if (workType === "night") {
        // Late Night Start Reminder
        if (currentTimeStr === "21:00") {
          const lastMorningKey = `nexora_morning_${todayStr}`;
          if (!localStorage.getItem(lastMorningKey)) {
            sendNotification("Night Shift Activation! 🌙", {
              body: "The night is young for reverse schedule champions! Ready to flow, bro?",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastMorningKey, "true");
          }
        }
        // Midnight Peak Reminder
        if (currentTimeStr === "23:30") {
          const lastAfternoonKey = `nexora_afternoon_${todayStr}`;
          if (!localStorage.getItem(lastAfternoonKey)) {
            sendNotification("Midnight Peak Focus! ⚡", {
              body: "Midnight focus hour starts now. Let's smash our physical and mental limits!",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastAfternoonKey, "true");
          }
        }
        // Overnight Dawn Wrap-up Reminder
        if (currentTimeStr === "02:00") {
          const lastEveningKey = `nexora_evening_${todayStr}`;
          if (!localStorage.getItem(lastEveningKey)) {
            sendNotification("Overnight Check-in! 🌌", {
              body: "Keep going strong overnight! Hydrate and check in on your habits.",
              icon: nexoraAppIcon,
            });
            localStorage.setItem(lastEveningKey, "true");
          }
        }
      }

      // Daily Motivation Reminder
      if (currentTimeStr === "12:00") {
        const lastMotivationKey = `nexora_last_motivation_${todayStr}`;
        if (!localStorage.getItem(lastMotivationKey)) {
          const quotes = [
            "The only way to do great work is to love what you do. 🔥",
            "Believe you can and you're halfway there. 🚀",
            "Your limitation—it's only your imagination. ✨",
            "Push yourself, because no one else is going to do it for you. 💪",
            "Great things never come from comfort zones. 🏆",
            "Dream it. Wish it. Do it. 🌟",
            "Success doesn’t just find you. You have to go out and get it. ⚡",
          ];
          const quote = quotes[Math.floor(Math.random() * quotes.length)];
          sendNotification("Daily Motivation! 💡", {
            body: quote,
            icon: nexoraAppIcon,
          });
          localStorage.setItem(lastMotivationKey, "true");
        }
      }

      // Midnight Challenge Restart Notification
      if (currentTimeStr === "00:00") {
        const lastRestartKey = `nexora_last_restart_${todayStr}`;
        if (!localStorage.getItem(lastRestartKey)) {
          sendNotification("New Day, New Goals! 🌅", {
            body: "Challenges have been restarted! Let's crush it today, bro!",
            icon: nexoraAppIcon,
          });
          localStorage.setItem(lastRestartKey, "true");
        }
      }

      // Custom Plan Reminders
      customPlans.forEach((plan) => {
        if (
          plan.reminderTime === currentTimeStr ||
          plan.reminderTime2 === currentTimeStr
        ) {
          const currentDay = now.getDay();
          if (plan.days.includes(currentDay)) {
            const lastPlanReminderKey = `nexora_last_reminder_${plan.id}_${currentTimeStr}_${todayStr}`;
            if (!localStorage.getItem(lastPlanReminderKey)) {
              sendNotification(`${plan.name} 🚀`, {
                body: `Time for your custom plan: ${plan.name}! Let's go!`,
                icon: nexoraAppIcon,
              });
              localStorage.setItem(lastPlanReminderKey, "true");
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
  }, [
    settings.notificationsEnabled,
    settings.reminderTime,
    settings.reminderTime2,
    settings.motivationTime,
    customPlans,
  ]);

  const handleSaveCustomPlan = async (plan: CustomPlan) => {
    if (!user) return;
    try {
      const planWithUser = { ...plan, userId: user.uid };
      const planRef = doc(db, "customPlans", plan.id);
      await setDoc(planRef, planWithUser);
      showToast("Plan created successfully!", "success");
      setActiveScreen("home");
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (error) {
      console.error("Plan save error:", error);
      showToast("Could not save plan bro. Check connection.", "error");
      try {
        handleFirestoreError(error, OperationType.WRITE, "customPlans");
      } catch (e) {
        console.error("Firestore error handled:", e);
      }
      // Force exit builder if it hangs on network
      setActiveScreen("home");
    }
  };

  const handleDeleteCustomPlan = async (planId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "customPlans", planId));
      showToast("Plan deleted", "info");
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, "customPlans");
      } catch (e) {
        console.error("Firestore error handled:", e);
      }
    }
  };

  const handleClaimRankReward = async (rank: number, rewardCoins: number) => {
    if (!user) return;
    const startOfWeekStr = new Date(
      new Date().setDate(new Date().getDate() - new Date().getDay())
    )
      .toISOString()
      .split("T")[0];

    setStats((prev) => {
      const nextCoins = (prev.coins || 0) + rewardCoins;
      let nextXP = prev.xp || 0;
      let nextLevel = prev.level || Math.floor((prev.totalPoints || 0) / 100) + 1;
      let nextTrophies = [...(prev.trophies || [])];
      let msg = `Weekly Reward Claimed! +${rewardCoins} Coins! 🎁`;

      if (rank === 1) {
        nextXP += 150;
        nextTrophies.push({
          id: `weekly_championship_${Date.now()}`,
          type: "golden" as const,
          earnedDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        msg = `Championship Claimed! +250 Coins, Golden Trophy, & +150 XP Bonus! 🏆`;
      }

      const next = {
        ...prev,
        coins: nextCoins,
        xp: nextXP,
        trophies: nextTrophies,
        lastRankRewardClaimWeek: startOfWeekStr
      };
      
      try {
        localStorage.setItem("nexora_stats", JSON.stringify(next));
      } catch (err) {
        console.warn("Storage write failed:", err);
      }
      return next;
    });

    const isRankOne = rank === 1;
    showToast(isRankOne ? "Championship Claimed! +250 Coins, Golden Trophy, & +150 XP Bonus! 🏆" : `Weekly Reward Claimed! +${rewardCoins} Coins! 🎁`, "success");
    vibrate(VIBRATION_PATTERNS.SUCCESS);

    // 2. Log Weekly Leaderboard Rewards to global "rewards" collection
    const rewardDocRef = doc(db, "rewards", user.uid);
    setDoc(rewardDocRef, {
      userId: user.uid,
      userName: settings.displayName || user.displayName || "Champion",
      userEmail: user.email || `${user.uid}@nexora.app`,
      coins: stats.coins + rewardCoins,
      streak: stats.streak || 0,
      xp: stats.xp + (isRankOne ? 150 : 0),
      points: (stats.totalPoints || 0) + (isRankOne ? 150 : 0),
      lastRewardReceivedAt: serverTimestamp(),
      lastRewardSource: `weekly_leaderboard_reward_rank_${rank}`,
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch((err) => {
      console.error("Failed to save weekly reward claim to global rewards collection", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `rewards/${user.uid}`);
      } catch (e) {
        console.error("Firestore error handled:", e);
      }
    });
  };

  useEffect(() => {
    if (user && isDataReady) {
      // Weekly Reset Logic
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
        .toISOString()
        .split("T")[0];
      if (stats.lastWeeklyReset !== startOfWeek) {
        setStats((prev) => ({
          ...prev,
          weeklyPoints: 0,
          weeklyXP: 0,
          lastWeeklyReset: startOfWeek,
        }));
      }

      // League Synchronization (Bronze, Silver, Gold, Platinum, Diamond, Master, Champion, Divine, Nexus)
      const currentLvl = stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1;
      const getLeagueForLevel = (lvl: number) => {
        if (lvl >= 40) return 'Nexus';
        if (lvl >= 35) return 'Divine';
        if (lvl >= 30) return 'Champion';
        if (lvl >= 25) return 'Master';
        if (lvl >= 20) return 'Diamond';
        if (lvl >= 15) return 'Platinum';
        if (lvl >= 10) return 'Gold';
        if (lvl >= 5) return 'Silver';
        return 'Bronze';
      };
      const expectedLeague = getLeagueForLevel(currentLvl);
      if (settings.league !== expectedLeague) {
        setSettings((prev) => ({
          ...prev,
          league: expectedLeague
        }));
      }

      // Absence Decay (Point decay if away for 2 days, complete reset if away for 4+ days)
      const lastActiveStr = stats.lastActiveDate;
      if (!lastActiveStr) {
        setStats((prev) => ({ ...prev, lastActiveDate: today }));
      } else if (lastActiveStr !== today) {
        const activeDate = new Date(lastActiveStr + "T00:00:00");
        const currentDate = new Date(today + "T00:00:00");
        const diffTime = currentDate.getTime() - activeDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 2) {
          let decayMsg = "";
          let nextWeeklyXP = stats.weeklyXP || 0;
          let nextWeeklyPoints = stats.weeklyPoints || 0;
          let nextTotalPoints = stats.totalPoints || 0;
          let nextXP = stats.xp || 0;
          let resetAll = false;

          if (diffDays === 2) {
            decayMsg = "You were away for 2 days! Cosmic Energy decayed 25% of your Weekly Rank score.";
            nextWeeklyXP = Math.round(nextWeeklyXP * 0.75);
            nextWeeklyPoints = Math.round(nextWeeklyPoints * 0.75);
            nextTotalPoints = Math.max(0, Math.round(nextTotalPoints * 0.9));
            nextXP = Math.max(0, Math.round(nextXP * 0.9));
          } else if (diffDays === 3) {
            decayMsg = "You were away for 3 days! Major Entropy decayed 50% of your Weekly Rank score.";
            nextWeeklyXP = Math.round(nextWeeklyXP * 0.50);
            nextWeeklyPoints = Math.round(nextWeeklyPoints * 0.50);
            nextTotalPoints = Math.max(0, Math.round(nextTotalPoints * 0.8));
            nextXP = Math.max(0, Math.round(nextXP * 0.8));
          } else {
            resetAll = true;
            decayMsg = `You were away for ${diffDays} days! Your Arena XP faded entirely. You must restart from 0 at the lower position!`;
            nextWeeklyXP = 0;
            nextWeeklyPoints = 0;
            nextTotalPoints = Math.max(0, Math.round(nextTotalPoints * 0.6));
            nextXP = Math.max(0, Math.round(nextXP * 0.6));
          }

          const lostWeeklyXP = (stats.weeklyXP || 0) - nextWeeklyXP;
          const lostWeeklyPoints = (stats.weeklyPoints || 0) - nextWeeklyPoints;

          if (lostWeeklyXP > 0 || lostWeeklyPoints > 0 || resetAll) {
            setStats((prev) => ({
              ...prev,
              weeklyXP: nextWeeklyXP,
              weeklyPoints: nextWeeklyPoints,
              totalPoints: nextTotalPoints,
              xp: nextXP,
              lastActiveDate: today,
            }));

            setDecayAlert({
              days: diffDays,
              decayedPoints: lostWeeklyPoints,
              decayedXP: lostWeeklyXP,
              resetAll,
              message: decayMsg,
            });
            showToast("⚠️ Arena Decay Penalization Triggered!", "error");
          } else {
            setStats((prev) => ({ ...prev, lastActiveDate: today }));
          }
        } else {
          setStats((prev) => ({ ...prev, lastActiveDate: today }));
        }
      }

      // Pro Daily Gift Logic
      if (settings.isPro && stats.lastGiftDate !== today) {
        setStats((prev) => ({
          ...prev,
          coins: (prev.coins || 0) + 50,
          lastGiftDate: today,
        }));
        showToast(`Pro Daily Gift: +50 Coins! 🎁`, "success");
      }

      // Leaderboard Listener - Query collection cleanly to bypass composite index constraints, then filter in memory
      const q = query(
        collection(db, "leaderboard"),
        limit(150),
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const rawDocs = snapshot.docs.map((doc) => doc.data() as any);
          const currentLeagueName = settings.league || "Bronze";
          // Filter by league in memory
          let data = rawDocs.filter((d) => d.league === currentLeagueName);

          // BOT SYSTEM: Always add some competitive AI players to make it feel alive!
          const bots = [
            {
              uid: "bot-1",
              displayName: "Apex_Habit",
              weeklyXP: 1250,
              weeklyPoints: 1250,
              level: 12,
              streak: 45,
              league: settings.league || "Bronze",
            },
            {
              uid: "bot-2",
              displayName: "Zen_Master",
              weeklyXP: 950,
              weeklyPoints: 950,
              level: 10,
              streak: 32,
              league: settings.league || "Bronze",
            },
            {
              uid: "bot-3",
              displayName: "HabitHero_99",
              weeklyXP: 750,
              weeklyPoints: 750,
              level: 8,
              streak: 15,
              league: settings.league || "Bronze",
            },
            {
              uid: "bot-4",
              displayName: "FlowState",
              weeklyXP: 500,
              weeklyPoints: 500,
              level: 6,
              streak: 8,
              league: settings.league || "Bronze",
            },
            {
              uid: "bot-5",
              displayName: "Iron_Will",
              weeklyXP: 320,
              weeklyPoints: 320,
              level: 4,
              streak: 5,
              league: settings.league || "Bronze",
            },
          ];

          // Merge real users and bots, then deduplicate by ID just in case
          const allDataMap = new Map();

          // Only keep real users who have at least > 0 in streak, weeklyXP, or weeklyPoints
          data.forEach((d) => {
            if (!d || !d.uid) return;
            const hasXp = (d.weeklyXP || 0) > 0;
            const hasStreak = (d.streak || 0) > 0;
            const hasPts = (d.weeklyPoints || 0) > 0;
            const hasTotal = (d.totalPoints || 0) > 0;
            if (hasXp || hasStreak || hasPts || hasTotal) {
              allDataMap.set(d.uid, d);
            }
          });

          // Add Bots
          bots.forEach((b) => {
            if (b && b.uid && !allDataMap.has(b.uid)) {
              allDataMap.set(b.uid, b);
            }
          });

          data = Array.from(allDataMap.values());

          // Also handle current user: add them IF they have > 0 points
          const userHasPoints =
            (stats.weeklyXP || 0) > 0 ||
            (stats.streak || 0) > 0 ||
            (stats.weeklyPoints || 0) > 0 ||
            (stats.totalPoints || 0) > 0;

          if (user && !allDataMap.has(user.uid) && userHasPoints) {
            data.push({
              uid: user.uid,
              displayName: settings.displayName || "Anonymous",
              photoURL: settings.profilePic || user.photoURL || "",
              weeklyXP: stats.weeklyXP || 0,
              weeklyPoints: stats.weeklyPoints || 0,
              level: Math.floor((stats.totalPoints || 0) / 100) + 1,
              streak: stats.streak || 0,
              league: settings.league || "Bronze",
            });
          } else if (user && allDataMap.has(user.uid)) {
            // Force local settings to be used for the current user's entry
            // (fixes bug where Firestore latency ignores recent photo uploads in leaderboard)
            const localEntry = allDataMap.get(user.uid);
            if (localEntry) {
              localEntry.displayName =
                settings.displayName || localEntry.displayName || "Anonymous";
              localEntry.photoURL = settings.profilePic || localEntry.photoURL || "";
            }
          }
          setLeaderboard(
            data.sort((a, b) => {
              // Primary: weeklyPoints > weeklyXP > totalPoints > level-based points desc (Duolingo Style: points earned are authoritative!)
              const aPoints = a.weeklyPoints !== undefined ? a.weeklyPoints : (a.weeklyXP || a.totalPoints || a.xp || 0);
              const bPoints = b.weeklyPoints !== undefined ? b.weeklyPoints : (b.weeklyXP || b.totalPoints || b.xp || 0);
              
              const pointsDiff = bPoints - aPoints;
              if (pointsDiff !== 0) return pointsDiff;
              
              // Secondary: Level desc
              const levelDiff = (b.level || 0) - (a.level || 0);
              if (levelDiff !== 0) return levelDiff;
              
              // Tertiary: Streak desc (used strictly as a tie-breaker, streak shouldn't penalize active high earners)
              return (b.streak || 0) - (a.streak || 0);
            }),
          );
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.LIST, "leaderboard");
          } catch (e) {
            console.error("Firestore error handled:", e);
          }
        },
      );
      return () => unsubscribe();
    }
  }, [
    user,
    isDataReady,
    settings.league,
    stats.lastWeeklyReset,
    stats.lastGiftDate,
    today,
    settings.isPro,
    stats.weeklyXP,
    stats.weeklyPoints,
    stats.totalPoints,
    stats.streak,
    settings.displayName,
    settings.profilePic,
  ]);

  const userRank = leaderboard.findIndex((l) => l.uid === user?.uid) + 1;

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
        nextRestorationTime: null,
      } as any);
    }
  }, [today, dailyProgress.date, isDataReady]);

  // CHALLENGE LIMIT RESTORATION LOGIC
  useEffect(() => {
    if (
      isDataReady &&
      dailyProgress &&
      dailyProgress.completionsCount > 0 &&
      !isPro
    ) {
      const interval = setInterval(() => {
        const now = Date.now();
        
        let cachedTime: number | null = null;
        try {
          const cached = localStorage.getItem("nexora_progress");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.nextRestorationTime) cachedTime = Number(parsed.nextRestorationTime);
          }
        } catch (e) {}

        const nextTime =
          dailyProgress.nextRestorationTime || cachedTime || now + 4 * 60 * 60 * 1000;

        if (now >= nextTime) {
          setDailyProgress((prev) => {
            const currentNextTime = prev.nextRestorationTime || cachedTime;
            if (!currentNextTime) return prev;
            // Calculate how many 4-hour chunks have passed since the original target time
            const timePassedSinceTarget = now - currentNextTime;
            const chunksPassed =
              Math.floor(timePassedSinceTarget / (4 * 60 * 60 * 1000)) + 1;

            const newCount = Math.max(0, prev.completionsCount - chunksPassed);
            const nextRest =
              newCount > 0
                ? currentNextTime + chunksPassed * 4 * 60 * 60 * 1000
                : null;
            return {
              ...prev,
              completionsCount: newCount,
              nextRestorationTime: nextRest,
            };
          });
        } else if (!dailyProgress.nextRestorationTime) {
          setDailyProgress((prev) => ({
            ...prev,
            nextRestorationTime: nextTime,
          }));
        }
      }, 5000);
      return () => clearInterval(interval);
    } else if (isPro && dailyProgress.nextRestorationTime) {
      // Clear timer for Pro users
      setDailyProgress((prev) => ({
        ...prev,
        nextRestorationTime: null,
      }));
    }
  }, [
    dailyProgress?.completionsCount,
    dailyProgress?.nextRestorationTime,
    isPro,
    isDataReady,
  ]);

  // Optimized History calculation using useMemo to avoid O(N) calculation on every render
  const memoizedHistory = useMemo(() => {
    const allKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith("nexora_progress_"),
    );
    return allKeys
      .map((k) => {
        try {
          return JSON.parse(localStorage.getItem(k) || "{}");
        } catch (e) {
          return {};
        }
      })
      .filter((item) => item && item.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyProgress.date]); // Only recalculate if date changes (new day)

  useEffect(() => {
    setHistory(memoizedHistory);
  }, [memoizedHistory]);

  // Trophy Alert Logic (Side-effect separated from state update for reliability)
  const [lastTrophyAlert, setLastTrophyAlert] = useState<
    { id: string; type: string }[]
  >([]);

  useEffect(() => {
    if (!isDataReady || !settings.badgeSettings?.trophyAlerts) return;

    const currentTrophyStates = stats.trophies.map((t) => ({
      id: t.id,
      type: t.type,
    }));

    // Compare with last known states to find transitions
    if (lastTrophyAlert.length === 0) {
      setLastTrophyAlert(currentTrophyStates);
      return;
    }

    currentTrophyStates.forEach((curr) => {
      const prev = lastTrophyAlert.find((p) => p.id === curr.id);
      if (prev && prev.type !== curr.type) {
        if (curr.type === "ice") {
          sendNotification("Trophy Alert! 🧊", {
            body: "One of your trophies just turned to ICE! Complete a challenge now to save it!",
            icon: nexoraAppIcon,
          });
          if (settings.soundEnabled) playTrophySound("ice");
          showToast("TROPHY ALERT: ICE DETECTED! 🧊", "info");
        } else if (curr.type === "broken") {
          sendNotification("Trophy Alert! 💔", {
            body: "Oh no! A trophy has BROKEN! Don't let more break, bro!",
            icon: nexoraAppIcon,
          });
          if (settings.soundEnabled) playTrophySound("broken");
          showToast("TROPHY ALERT: SHATTERED! 💔", "error");
        }
      }
    });

    setLastTrophyAlert(currentTrophyStates);
  }, [
    stats.trophies,
    isDataReady,
    settings.badgeSettings?.trophyAlerts,
    settings.soundEnabled,
  ]);

  const checkTrophies = useCallback(() => {
    onUpdateStats((prevStats) => {
      if (!prevStats.trophies || prevStats.trophies.length === 0)
        return prevStats;

      const now = Date.now();
      let changed = false;

      const trophies = prevStats.trophies || [];
      const updatedTrophies = trophies.map((t) => {
        const earnedTime = new Date(t.earnedDate).getTime();
        const daysSince = (now - earnedTime) / (1000 * 60 * 60 * 24);

        // Revised thresholds: Golden->Ice (3 days), Ice->Broken (5 days)
        if (t.type === "golden" && daysSince >= 3) {
          changed = true;
          return {
            ...t,
            type: "ice" as const,
            lastUpdated: new Date().toISOString(),
          };
        }
        if (t.type === "ice" && daysSince >= 5) {
          changed = true;
          return {
            ...t,
            type: "broken" as const,
            lastUpdated: new Date().toISOString(),
          };
        }
        return t;
      });

      // 5-day Auto-Removal Cleanup: Delete old trophies (e.g., golden, ice, broken) older than 5 days.
      let cleanedTrophies = updatedTrophies;
      if (updatedTrophies.length > 3) {
        const oldTrophies = updatedTrophies.filter((t) => {
          const earnedTime = new Date(t.earnedDate).getTime();
          const daysSince = (now - earnedTime) / (1000 * 60 * 60 * 24);
          return daysSince >= 5;
        });

        if (oldTrophies.length > 0) {
          // Sort oldest first to remove
          oldTrophies.sort((a, b) => new Date(a.earnedDate).getTime() - new Date(b.earnedDate).getTime());
          
          // Delete up to 20 of them but leave at least 3 trophies as a buffer so we don't wipe out everything!
          const maxToDelete = Math.min(oldTrophies.length, 20, updatedTrophies.length - 3);
          if (maxToDelete > 0) {
            const idsToDelete = oldTrophies.slice(0, maxToDelete).map(t => t.id);
            cleanedTrophies = updatedTrophies.filter(t => !idsToDelete.includes(t.id));
            changed = true;
          }
        }
      }

      if (changed) {
        return { ...prevStats, trophies: cleanedTrophies };
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

  const handlePlayLibraryChallenge = (cid: string) => {
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    setIsLibraryReplay(true);
    setActiveCustomPlan({
      id: `replay-${cid}`,
      userId: user?.uid || "guest",
      name: `Replaying ${cid.toUpperCase()}`,
      icon: "🎯",
      color: "#10B981",
      challenges: [cid as ChallengeStep],
      days: [0, 1, 2, 3, 4, 5, 6],
      createdAt: new Date().toISOString()
    });
    setChallengeStep(cid as ChallengeStep);
    setActiveScreen("challenge");
  };

  const handleCompleteChallenge = async (
    finalProgress?: DailyProgress,
    isCustomPlanFlag?: boolean,
  ) => {
    // If completed from library replay (Practice Mode), do not award items, XP, or stars!
    if (isLibraryReplay) {
      showToast("Practice Protocol Completed! Great work, bro! 🔥", "success");
      setIsLibraryReplay(false);
      setActiveCustomPlan(null);
      setChallengeStep(null);
      setActiveScreen("library");
      return;
    }

    // Immediate sound feedback for better UX
    if (settings.soundEnabled) {
      play("challenge_unlock");
    }

    setEmergencyActive(false);
    const progress = finalProgress || dailyProgress;
    const isCustomPlan = isCustomPlanFlag ?? activeCustomPlan !== null;

    // Restoring ice trophies logic
    onUpdateStats((prev) => {
      const hasIce = prev.trophies?.some((t) => t.type === "ice");
      if (hasIce) {
        const updated = prev.trophies.map((t) => {
          if (t.type === "ice")
            return {
              ...t,
              type: "golden" as const,
              lastUpdated: new Date().toISOString(),
            };
          return t;
        });
        showToast("TROPHY RESTORED TO GOLD! 🔥", "success");
        return { ...prev, trophies: updated };
      }
      return prev;
    });

    // Calculate how many tasks were actually completed in this session
    const completedTasksList = Object.entries(progress).filter(
      ([key, value]) =>
        [
          "pushupsDone",
          "waterDrank",
          "breathingDone",
          "drawingDone",
          "footballDone",
          "bubblesDone",
          "memoryDone",
          "gratitudeDone",
          "reactionDone",
          "meditationDone",
          "writingDone",
        ].includes(key) &&
        (typeof value === "boolean"
          ? value === true
          : typeof value === "number"
            ? value > 0
            : false),
    );
    const completedTasks = completedTasksList.length;

    if (isCustomPlan && user && activeCustomPlan) {
      const customPlanRef = doc(
        collection(db, "users", user.uid, "custom_progress"),
      );
      setDoc(customPlanRef, {
        planId: activeCustomPlan.id,
        planName: activeCustomPlan.name,
        completedAt: serverTimestamp(),
        date: today,
      }).catch((e) => console.error("Failed to save custom plan progress", e));
    }

    const nextCompletionsCount = isCustomPlan
      ? dailyProgress.completionsCount || 0
      : (dailyProgress.completionsCount || 0) + 1;
    const canAwardTrophy = (completedTasks > 0 || isCustomPlan) && !progress.skippedPushups;
    setSessionTrophy("golden");

    if (canAwardTrophy) {
      if (settings.soundEnabled) {
        setTimeout(() => {
          if (nextCompletionsCount === 1) play("trophy1");
          else if (nextCompletionsCount === 2) play("trophy2");
          else if (nextCompletionsCount === 3) play("trophy3");
          else play("trophy1");
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
      if (totalPlanTasks <= 2) {
        // Easy
        coinsToAdd = 5;
        xpToAdd = 10;
      } else if (totalPlanTasks <= 4) {
        // Medium
        coinsToAdd = 10;
        xpToAdd = 20;
      } else {
        // Hard
        coinsToAdd = 15;
        xpToAdd = 30;
      }
      pointsToAdd = xpToAdd;
    } else {
      // Official Daily Challenges Rebalance
      // Easy: 'water', 'gratitude', 'bubbles' -> 10 Coins, 20 XP
      // Hard: 'pushups', 'football', 'memory', 'reaction' -> 35 Coins, 70 XP
      // Medium: others -> 20 Coins, 40 XP
      const stepStr = challengeStep as string;
      if (["water", "gratitude", "bubbles"].includes(stepStr)) {
        coinsToAdd = 10;
        xpToAdd = 20;
      } else if (["pushups", "football", "memory", "reaction"].includes(stepStr)) {
        coinsToAdd = 35;
        xpToAdd = 70;
      } else {
        coinsToAdd = 20;
        xpToAdd = 40;
      }

      const isDailyQuest = progress.dailyQuestDone || challengeStep === dailyQuest;
      if (isDailyQuest) {
        coinsToAdd += 15; // Daily Quest completion bonus
        xpToAdd += 20;
      }

      const sessionBonusMultiplier = completedTasks >= 3 ? 1.5 : 1.0;
      xpToAdd = Math.round(xpToAdd * sessionBonusMultiplier);
      coinsToAdd = Math.round(coinsToAdd * sessionBonusMultiplier);

      if (completedTasks >= 9) {
        xpToAdd += 10;
        coinsToAdd += 10;
      }
      pointsToAdd = xpToAdd;
    }

    // CONSUMABLES AND MULTIPLIERS ENGINE
    const inventoryItems = settings.inventory || [];
    const hasStreakProtection = inventoryItems.some(item => item.itemId === "streak-protection" && item.activated);
    const hasDoubleXP = inventoryItems.some(item => item.itemId === "double-points" && item.activated);
    const hasXPBoost = inventoryItems.some(item => item.itemId === "xp-boost" && item.activated);
    const hasCoinMagnet = inventoryItems.some(item => item.itemId === "coin-magnet" && item.activated);

    let xpMultiplier = 1;
    let usedDoubleXP = false;
    let usedXPBoost = false;

    if (hasXPBoost) {
      xpMultiplier = 3;
      usedXPBoost = true;
    } else if (hasDoubleXP) {
      xpMultiplier = 2;
      usedDoubleXP = true;
    }

    let coinMultiplier = 1;
    let usedCoinMagnet = false;
    if (hasCoinMagnet) {
      coinMultiplier = 1.35;
      usedCoinMagnet = true;
    }

    pointsToAdd = Math.round(pointsToAdd * xpMultiplier);
    xpToAdd = Math.round(xpToAdd * xpMultiplier);
    coinsToAdd = Math.round(coinsToAdd * coinMultiplier);

    // PLANT GROWTH & HEALING PRE-CALCULATION
    let plantBonusCoins = 0;
    let plantBonusXP = 0;
    let plantLevelUpMessage = "";
    let plantBonusItems: any[] = [];
    let updatedPlantState: any = null;
    let plantType: PlantType = "sprout";

    if (settings.plantState) {
      plantType = settings.plantState.type;
      let currentPoints = settings.plantState.growthPoints || 0;
      let currentStage = settings.plantState.stage || 0;

      // Calculate growth: +25% per full completion
      let newPoints = currentPoints + 25;
      let newStage = currentStage;
      let newUnlocked = [...(settings.plantState?.unlockedTypes || ["sprout"])];

      if (newPoints >= 100) {
        if (currentStage < 50) { // Support levels up to 50
          newStage = currentStage + 1;
          newPoints = 0;
          
          // Determine milestone rewards
          if (newStage === 1) {
            plantBonusCoins += 10;
          } else if (newStage === 2) {
            plantBonusCoins += 15;
          } else if (newStage === 3) {
            plantBonusCoins += 20;
          } else if (newStage === 4) {
            plantBonusCoins += 25;
          } else if (newStage === 5) {
            plantBonusCoins += 100;
            plantBonusXP += 100;
          } else if (newStage === 10) {
            plantBonusCoins += 250;
            plantBonusItems.push({
              id: `dec-goldchime-${Date.now()}`,
              itemId: 'dec-goldchime',
              name: 'Golden Chime',
              icon: '🔔',
              activated: false,
              type: 'gift',
              purchasedAt: new Date().toISOString()
            });
          } else if (newStage === 20) {
            plantBonusCoins += 500;
            plantBonusItems.push({
              id: `garden-zen-${Date.now()}`,
              itemId: 'garden-zen',
              name: 'Zen Rock Garden',
              icon: '🪨',
              activated: false,
              type: 'gift',
              purchasedAt: new Date().toISOString()
            });
          } else if (newStage === 50) {
            plantBonusCoins += 1000;
            plantBonusItems.push({
              id: `skin-emperor-${Date.now()}`,
              itemId: 'skin-emperor',
              name: 'Golden Emperor Skin',
              icon: '👑✨',
              activated: false,
              type: 'skin',
              purchasedAt: new Date().toISOString()
            });
          } else {
            // General growth rewards
            plantBonusCoins += 10;
          }

          plantLevelUpMessage = `LEVEL UP: Your ${plantType} reached Level ${newStage}! 🌿✨ (+${plantBonusCoins} Coins)`;

          if (newStage === 5) {
            const currentIdx = ECOSYSTEM_PATH.indexOf(plantType);
            if (currentIdx !== -1 && currentIdx < ECOSYSTEM_PATH.length - 1) {
              const nextType = ECOSYSTEM_PATH[currentIdx + 1];
              if (!newUnlocked.includes(nextType)) {
                newUnlocked.push(nextType);
                plantLevelUpMessage += ` & NEW ECOSYSTEM UNLOCKED: ${nextType.toUpperCase()}! 🌿🏆`;
                localStorage.setItem("nexora_new_plant_unlocked", "true");
              }
            }
          }
        } else {
          newPoints = 100; // Cap at Legendary Level 50
        }
      }

      updatedPlantState = {
        ...settings.plantState,
        stage: newStage,
        growthPoints: newPoints,
        unlockedTypes: newUnlocked,
        health: 100,
        isDead: false,
        isThirsty: false,
        lastCheckDate: new Date().toISOString(),
        lastGrowthDate: new Date().toISOString(),
      };
    }

    // Apply pre-calculated plant milestone bonuses
    coinsToAdd += plantBonusCoins;
    xpToAdd += plantBonusXP;

    // STRICT DAILY STREAK CALCULATION
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let currentActualStreak = stats.streak || 0;
    let finalStreakShow = currentActualStreak;
    let usedStreakProtection = false;

    if (
      stats.lastCompletedDate === today ||
      stats.lastCompletedDate === yesterdayStr
    ) {
      finalStreakShow = currentActualStreak + 1;
    } else if (hasStreakProtection) {
      finalStreakShow = currentActualStreak + 1;
      usedStreakProtection = true;
    } else {
      finalStreakShow = 1;
    }

    setSessionStreak(finalStreakShow);
    setIsNewStreak(true); // Always treat it as a new streak bump for the animation since it always increases now

    if (usedXPBoost) {
      showToast("XP Overdrive consumed! Triple XP added! 🚀⚡", "success");
    } else if (usedDoubleXP) {
      showToast("Double XP active! 2x XP added! 🌟", "success");
    }
    if (usedCoinMagnet) {
      showToast("Coin Magnet consumed! +35% bonus coins added! 🧲🪙", "success");
    }
    if (usedStreakProtection) {
      showToast("Streak Protection Saved! Your daily streak didn't break! 🛡️🔥", "success");
    }

    setStats((prevStats) => {
      const oldLevel = prevStats.level || 1;
      let streakToSave = prevStats.streak || 0;

      if (
        prevStats.lastCompletedDate === today ||
        prevStats.lastCompletedDate === yesterdayStr
      ) {
        streakToSave = (prevStats.streak || 0) + 1;
      } else if (hasStreakProtection) {
        streakToSave = (prevStats.streak || 0) + 1;
      } else {
        streakToSave = 1;
      }

      const newBestStreak = Math.max(prevStats.bestStreak || 0, streakToSave);
      const newTotalCompletedDays =
        prevStats.lastCompletedDate !== today
          ? (prevStats.totalCompletedDays || 0) + 1
          : prevStats.totalCompletedDays || 0;
      const newLastCompletedDate = today;

      const hasDoublePoints =
        settings.purchasedItems?.includes("double-points") || hasDoubleXP;
      const streakBonusPoints = hasDoublePoints ? 10 : 5;

      const newPoints =
        (prevStats.totalPoints || 0) + pointsToAdd + streakBonusPoints;
      const newXP = (prevStats.xp || 0) + xpToAdd;
      const newLevel = Math.floor(newXP / 1000) + 1;

      let levelUpBonusCoins = 0;
      if (newLevel > oldLevel) {
        setShowLevelUp(newLevel);
        vibrate(VIBRATION_PATTERNS.TROPHY);

        // Tiered variety rewards for leveling up
        if (newLevel <= 5) {
          levelUpBonusCoins = 50;
        } else if (newLevel <= 15) {
          levelUpBonusCoins = 150;
          // Award cosmetic item variety - Silver Profile Frame
          plantBonusItems.push({
            id: `frame-silver-${Date.now()}`,
            itemId: 'frame-silver',
            name: 'Silver Profile Frame',
            icon: '🖼️',
            activated: false,
            type: 'power-up',
            purchasedAt: new Date().toISOString()
          });
        } else {
          levelUpBonusCoins = 300;
          // Award Cosmic Skin
          plantBonusItems.push({
            id: `skin-cosmic-${Date.now()}`,
            itemId: 'skin-cosmic',
            name: 'Cosmic Skin',
            icon: '🌌',
            activated: false,
            type: 'skin',
            purchasedAt: new Date().toISOString()
          });
        }
      }

      let newTrophies = [...(prevStats.trophies || [])];
      if (canAwardTrophy) {
        // Filter out any older degraded/ice/broken trophies now that a new Golden Trophy is earned
        newTrophies = newTrophies.filter((t) => t.type !== "ice" && t.type !== "broken");
        newTrophies.unshift({
          id: `trophy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: "golden",
          earnedDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });
      }

      const updatedStats = {
        ...prevStats,
        totalPoints: newPoints,
        weeklyPoints:
          (prevStats.weeklyPoints || 0) + pointsToAdd + streakBonusPoints,
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
          physical:
            (prevStats.pointsByCategory?.physical || 0) +
            (completedTasks > 1 ? 10 : 5),
          mental:
            (prevStats.pointsByCategory?.mental || 0) +
            (completedTasks > 1 ? 10 : 5),
          creative:
            (prevStats.pointsByCategory?.creative || 0) +
            (completedTasks > 2 ? 5 : 2),
        },
      };

      if (user) {
        const leaderboardRef = doc(db, "leaderboard", user.uid);
        setDoc(
          leaderboardRef,
          {
            uid: user.uid,
            displayName: settings.displayName || "Anonymous",
            photoURL: settings.profilePic || user.photoURL || "",
            streak: updatedStats.streak,
            totalPoints: updatedStats.totalPoints,
            weeklyXP: updatedStats.weeklyXP || 0,
            weeklyPoints: updatedStats.weeklyPoints || 0,
            xp: updatedStats.xp,
            level: newLevel,
            league: settings.league || "Bronze",
          },
          { merge: true },
        ).catch((err) => {
          try {
            handleFirestoreError(err, OperationType.WRITE, `leaderboard/${user.uid}`);
          } catch (e) {
            console.error("LB sync error", e);
          }
        });

        // 1. Log Finished Challenge to the new global "challenges" collection under user UID
        const challengeDocRef = doc(db, "challenges", user.uid);
        setDoc(challengeDocRef, {
          userId: user.uid,
          userName: settings.displayName || user.displayName || "Champion",
          userEmail: user.email || `${user.uid}@nexora.app`,
          counter: updatedStats.totalCompletedDays || 1,
          lastChallengeId: isCustomPlan ? (activeCustomPlan?.id || "custom") : (challengeStep || "official"),
          lastChallengeName: isCustomPlan ? (activeCustomPlan?.name || "Custom Plan") : (challengeStep || "Official Daily Challenge"),
          lastChallengeType: isCustomPlan ? "user_created_plan" : "official_challenge",
          lastCompletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch((err) => {
          console.error("Failed to save to global challenges collection", err);
        });

        // 2. Log Rewards (Coins, Streaks, XP, Points) to the new global "rewards" collection under user UID
        const rewardDocRef = doc(db, "rewards", user.uid);
        setDoc(rewardDocRef, {
          userId: user.uid,
          userName: settings.displayName || user.displayName || "Champion",
          userEmail: user.email || `${user.uid}@nexora.app`,
          coins: updatedStats.coins || 0,
          streak: updatedStats.streak || 0,
          xp: updatedStats.xp || 0,
          points: updatedStats.totalPoints || 0,
          lastRewardReceivedAt: serverTimestamp(),
          lastRewardSource: isCustomPlan ? "custom_plan_completion" : "official_challenge_completion",
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch((err) => {
          console.error("Failed to save to global rewards collection", err);
          try {
            handleFirestoreError(err, OperationType.WRITE, `rewards/${user.uid}`);
          } catch (e) {
            console.error("Firestore error handled:", e);
          }
        });
      }

      return updatedStats;
    });

    setDailyProgress((prev) => ({
      ...prev,
      completed: isCustomPlan ? prev.completed : true,
      customPlanCompleted: isCustomPlan ? true : prev.customPlanCompleted,
      completionsCount: isCustomPlan
        ? prev.completionsCount
        : (prev.completionsCount || 0) + 1,
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
    let finalInventory = settings.inventory || [];
    let itemsToConsume: string[] = [];

    if (usedStreakProtection) itemsToConsume.push("streak-protection");
    if (usedXPBoost) itemsToConsume.push("xp-boost");
    else if (usedDoubleXP) itemsToConsume.push("double-points");
    if (usedCoinMagnet) itemsToConsume.push("coin-magnet");

    if (itemsToConsume.length > 0) {
      finalInventory = finalInventory.map(item => {
        if (itemsToConsume.includes(item.itemId) && item.activated) {
          return { ...item, activated: false }; // Consume item
        }
        return item;
      });
    }

    if (plantBonusItems.length > 0) {
      finalInventory = [...finalInventory, ...plantBonusItems];
    }

    const settingsUpdate: any = {
      inventory: finalInventory,
    };

    if (plantBonusItems.length > 0) {
      const purchased = settings.purchasedItems || [];
      const itemIdsToAdd = plantBonusItems.map(item => item.itemId);
      settingsUpdate.purchasedItems = [...new Set([...purchased, ...itemIdsToAdd])];
    }

    if (settings.plantState && updatedPlantState) {
      settingsUpdate.plantState = updatedPlantState;
      settingsUpdate.plantsProgress = {
        ...(settings.plantsProgress || {}),
        [plantType]: updatedPlantState,
      };

      if (plantLevelUpMessage) {
        showToast(plantLevelUpMessage, "success");
      }

      if (settings.plantState.isDead) {
        showToast("THE ECOSYSTEM HAS BEEN RESTORED! 🌿🔥", "success");
        vibrate(VIBRATION_PATTERNS.SUCCESS);
      }
    }

    onUpdateSettings(settingsUpdate);

    // Attempt Loot Drop upon finishing the entire Official challenge task flow!
    if (!isCustomPlan) {
      const drop = calculateLootDrop(gardenState?.lastSeedDropAt);
      if (drop.triggered) {
        const newState = {
          ...gardenState,
          pendingLootSeed: drop,
          lastSeedDropAt: Date.now(),
        };
        setGardenState(newState);
      }
    }

    setSessionXP(xpToAdd);
    setSessionStreak(finalStreakShow);

    setShowCompletionFlame(true);
    setActiveScreen("home");
    setChallengeStep("home" as any);
    setShowCoinAnimation(true);
  };

  const handleLogout = async () => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    try {
      await signOut(auth);
      showToast("Logout successful.", "success");
    } catch (error) {
      console.error("Error signing out:", error);
      showToast("Logout error, bro.", "error");
    }
  };

  const handleDeleteAccount = async () => {
    vibrate(VIBRATION_PATTERNS.ERROR);
    const activeUser = auth.currentUser;
    if (!activeUser) {
      showToast("No active session.", "error");
      return;
    }

    const userId = activeUser.uid;
    showToast("Processing account deletion...", "info");

    try {
      // 1. Delete user data from Firestore
      try {
        console.log("[DELETE ACCOUNT] Wiping Firestore documents for:", userId);

        // Delete stats/main
        try {
          await deleteDoc(doc(db, "users", userId, "stats", "main"));
        } catch (e) {
          console.warn("Failed to delete users/stats/main:", e);
        }

        // Delete all progress documents
        try {
          const progressSnap = await getDocs(collection(db, "users", userId, "progress"));
          for (const docSnap of progressSnap.docs) {
            await deleteDoc(doc(db, "users", userId, "progress", docSnap.id));
          }
        } catch (e) {
          console.warn("Failed to delete users/progress:", e);
        }

        // Delete all custom_progress documents
        try {
          const customProgressSnap = await getDocs(collection(db, "users", userId, "custom_progress"));
          for (const docSnap of customProgressSnap.docs) {
            await deleteDoc(doc(db, "users", userId, "custom_progress", docSnap.id));
          }
        } catch (e) {
          console.warn("Failed to delete users/custom_progress:", e);
        }

        // Delete all eco_shop documents
        try {
          const ecoShopSnap = await getDocs(collection(db, "users", userId, "eco_shop"));
          for (const docSnap of ecoShopSnap.docs) {
            await deleteDoc(doc(db, "users", userId, "eco_shop", docSnap.id));
          }
        } catch (e) {
          console.warn("Failed to delete users/eco_shop:", e);
        }

        // Delete all notifications documents
        try {
          const notifSnap = await getDocs(collection(db, "users", userId, "notifications"));
          for (const docSnap of notifSnap.docs) {
            await deleteDoc(doc(db, "users", userId, "notifications", docSnap.id));
          }
        } catch (e) {
          console.warn("Failed to delete users/notifications:", e);
        }

        // Delete leaderboard doc
        try {
          await deleteDoc(doc(db, "leaderboard", userId));
        } catch (e) {
          console.warn("Failed to delete leaderboard:", e);
        }

        // Delete main user doc /users/{{uid}}
        try {
          await deleteDoc(doc(db, "users", userId));
        } catch (e) {
          console.warn("Failed to delete user doc:", e);
        }

        console.log("[DELETE ACCOUNT] Firestore data wipe completed for:", userId);
      } catch (e) {
        console.warn("Error during Firestore cleanup:", e);
      }

      // 2. Clear all local storage keys starting with nexora_ or hydration_
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("nexora_") ||
          key.startsWith("hydration_") ||
          key === "admin_read_feedback_ids"
        ) {
          localStorage.removeItem(key);
        }
      });

      // Reset local garden states in-memory
      setSettings(DEFAULT_SETTINGS);
      setStats(DEFAULT_STATS);

      // 3. Delete the Firebase Auth user account
      try {
        await deleteUser(activeUser);
        showToast("Account and all data completely deleted.", "success");
      } catch (authError: any) {
        console.warn("Auth deletion failed (needs recent login), signing out. Data is already wiped.", authError);
        await signOut(auth);
        showToast("All data deleted. Signed out successfully.", "success");
      }
    } catch (error: any) {
      console.error("General Delete Error:", error);
      showToast(`Delete failed: ${error.message || "System error"}`, "error");
    }
  };

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  const onClearCache = async () => {
    try {
      // 1. Clear Service Worker Caches
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
      // 2. Clear critical localStorage keys (but KEEP auth/settings/stats/fcm_token)
      const keysToKeep = [
        "nexora_settings",
        "nexora_stats",
        "firebase:authUser",
        "nexora_fcm_token",
      ];
      Object.keys(localStorage).forEach((key) => {
        if (!keysToKeep.some((k) => key.includes(k))) {
          localStorage.removeItem(key);
        }
      });
      showToast("Static cache cleared! 🧹", "success");
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      showToast("Cache clear failed", "error");
    }
  };

  const onExportData = () => {
    const data = {
      settings,
      stats,
      history,
      exportedAt: new Date().toISOString(),
      user: user?.email,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexora_data_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data exported! Check downloads. 📥", "success");
  };

  const onSubmitFeedback = async (feedbackData: {
    rating: number;
    message: string;
    category: string;
  }) => {
    if (!user) return;
    try {
      const userLocation =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
      await addDoc(collection(db, "feedback"), {
        ...feedbackData,
        userName:
          user.displayName || user.email?.split("@")[0] || "Unknown User",
        userLocation: userLocation,
        userEmail: user.email,
        userId: user.uid,
        createdAt: serverTimestamp(),
        version: currentAppVersion,
      });
      showToast("Feedback transmitted! HQ is on it, bro! 🏮", "success");
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      onUpdateSettings({ feedbackSubmitted: true });
    } catch (err) {
      console.error("Feedback Error:", err);
      showToast("Transmission failed. Connectivity issue?", "error");
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
          window.history.replaceState({}, "", window.location.pathname);
        }}
      />
    );
  }

  if (!splashFinished) {
    if (loadError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-black mb-4">Connection Failed</h1>
          <p className="text-slate-400 max-w-sm mb-8">{loadError}</p>
          <button 
             onClick={() => window.location.reload()}
             className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all"
          >
             Retry Connection
          </button>
        </div>
      );
    }
    return (
      <SplashScreen 
        isReady={!loading && !authLoading && (!user || isDataReady)} 
        onFinish={() => setSplashFinished(true)} 
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
        

        <ErrorBoundary>
          {showAuth ? (
            <Suspense
              fallback={
                <div className="min-h-screen bg-blue-50 flex items-center justify-center animate-pulse text-blue-900 font-black italic">
                  AUTHENTICATING...
                </div>
              }
            >
              <AuthScreen onBack={() => setShowAuth(false)} />
            </Suspense>
          ) : (
            <Suspense
              fallback={
                <div className="min-h-screen bg-blue-50 flex items-center justify-center animate-pulse text-blue-900 font-black italic">
                  LOADING MANIFESTO...
                </div>
              }
            >
              <LandingPage onGetStarted={() => setShowAuth(true)} />
            </Suspense>
          )}
        </ErrorBoundary>

        {/* Global PWA overlays rendered dynamically in front of Authentication screens */}
        
      </div>
    );
  }

  if (needsOnboarding && isDataReady && !loading) {
    return (
      <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden bg-gradient-to-b from-[#0A1733] to-[#040B1A]">
        

        <Suspense
          fallback={
            <div className="min-h-screen bg-blue-50 flex items-center justify-center animate-pulse text-blue-900 font-black italic">
              PREPARING ONBOARDING...
            </div>
          }
        >
          <OnboardingScreen
            onComplete={() => {
              onUpdateSettings({ onboardingCompleted: true });
              setNeedsOnboarding(false);
            }}
            settings={settings}
            setSettings={onUpdateSettings}
            setupFCM={setupFCM}
          />
        </Suspense>

        
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen w-full flex flex-col items-center overflow-x-hidden ${
          settings.activeSkin === 'obsidian' 
            ? 'theme-obsidian' 
            : settings.activeSkin === 'neural_bio'
              ? 'theme-neural_bio'
              : settings.activeSkin === 'sunset'
                ? 'theme-sunset'
                : settings.activeSkin === 'oceanic_midnight'
                  ? 'theme-oceanic_midnight'
                  : 'theme-standard'
        }`}
        style={{ "--accent-color": settings.themeColor } as React.CSSProperties}
      >
        {/* Connection Status Banner (Nexora Shield) */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-[#0A1733]/95 border-b border-rose-500/30 text-rose-200 overflow-hidden z-[1000] sticky top-0 shadow-lg"
            >
              <div className="flex items-center justify-center gap-3 py-3 px-4 text-xs font-semibold tracking-wide">
                <div className="relative flex items-center justify-center shrink-0">
                  <WifiOff size={16} className="text-rose-400 animate-pulse" />
                  <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-rose-500 rounded-full blur-sm"
                  />
                </div>
                <span className="text-center font-medium">
                  You are offline. Nexora will sync automatically when your connection returns.
                </span>
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
          src="/nexora-mascot.png" 
          alt="" 
          className="w-[150%] max-w-none"
          referrerPolicy="no-referrer"
        />
      </div>
      */}

        

        {/* Offline Indicator handled elegantly via status banner above */}

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
                    hat={settings.activeHat || "none"}
                    theme={settings.activeSkin || "standard"}
                    performanceMode={settings.performanceMode}
                    soundPack={settings.isDogSoundPackActive ? "dog" : "cat"}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-blue-900">Hey 👋</h3>
                  <p className="text-blue-900/60 font-medium">
                    You missed yesterday. Let’s get back on track 🔥
                  </p>
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
            <WhatIsNewModal
              onClose={() => {
                if (updateInfo) {
                  localStorage.setItem(
                    "nexora_dismissed_version",
                    updateInfo.version,
                  );
                }
                setShowUpdatePopup(false);
              }}
            />
          )}
        </AnimatePresence>

        

        {/* Beautiful Premium Download Progress Modal removed */}

        

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
                  setActiveScreen("subscription");
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
          {(activeScreen as string) !== "challenge" &&
            (activeScreen as string) !== "subscription" &&
            (activeScreen as string) !== "nexus-vision" &&
            (activeScreen as string) !== "plant" &&
            (activeScreen as string) !== "house" &&
            (activeScreen as string) !== "archives" &&
            (activeScreen as string) !== "leaderboard" &&
            (activeScreen as string) !== "admin" &&
            (activeScreen as string) !== "hydration-detail" &&
            (activeScreen as string) !== "social" &&
            (activeScreen as string) !== "garden" &&
            (activeScreen as string) !== "device-showcase" &&
            !showArchitectLab && (
              <header className="px-6 pt-8 pb-4 flex items-center justify-between w-full mx-auto max-w-7xl border-b border-[#E9E4D4]/50">
                <div className="flex items-center gap-3 select-none">
                  <motion.div
                    animate={headerMascotControls}
                    onClick={handleLogoTap}
                    className="relative group p-0.5 rounded-2xl bg-[#69C496]/10 border border-[#69C496]/30 shadow-sm transition-all hover:scale-105 duration-300 cursor-pointer"
                  >
                    <Mascot
                      className="w-14 h-14 pointer-events-none"
                      mood={globalMascotMood}
                      hat={settings.activeHat || "none"}
                      theme={settings.activeSkin || "standard"}
                      performanceMode={settings.performanceMode}
                      soundPack={settings.isDogSoundPackActive ? "dog" : "cat"}
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#69C496]"></span>
                    </span>
                  </motion.div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-black tracking-tight text-blue-950 bg-gradient-to-r from-blue-950 via-[#4F3F34] to-[#4F3F34] bg-clip-text text-transparent">
                      Nexora
                    </h1>
                    <span className="text-[9px] font-extrabold text-[#7D6B58] uppercase tracking-[0.15em] opacity-80 select-none">
                      Flow Catalyst
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 sm:gap-3 ml-auto">
                  {isSpaceHouseUnlocked && (
                    <button
                      onClick={() => {
                        if (settings.soundEnabled) play("header_switch");
                        setActiveScreen("house");
                      }}
                      className={`p-2.5 rounded-2xl transition-all relative shadow-sm border ${
                        (activeScreen as string) === "house"
                          ? "bg-gradient-to-br from-[#69C496] to-[#58B383] text-white border-[#69C496]/50 scale-105"
                          : !settings.spaceOnboardingCompleted
                            ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse border-white/50"
                            : "text-[#4F3F34]/70 bg-white hover:bg-slate-50 border-[#E9E4D4]"
                      }`}
                    >
                      <Home size={18} strokeWidth={2} />
                      {!settings.spaceOnboardingCompleted && (
                        <div className="absolute -top-1 -right-1">
                          <Sparkles
                            size={12}
                            className="text-amber-200 animate-spin"
                          />
                        </div>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (settings.soundEnabled) play("header_switch");
                      setActiveScreen("settings");
                    }}
                    className={`p-2.5 rounded-2xl transition-all shadow-sm border ${
                      activeScreen === "settings" 
                        ? "bg-gradient-to-br from-[#69C496] to-[#58B383] text-white border-[#69C496]/50 scale-105" 
                        : "text-[#4F3F34]/70 bg-white hover:bg-slate-50 border-[#E9E4D4]"
                    }`}
                  >
                    <Settings size={18} strokeWidth={2} />
                  </button>

                  <button
                    onClick={() => {
                      if (settings.soundEnabled) play("header_switch");
                      setActiveScreen("profile");
                    }}
                    className={`p-2.5 rounded-2xl transition-all shadow-sm border ${
                      activeScreen === "profile" 
                        ? "bg-gradient-to-br from-[#69C496] to-[#58B383] text-white border-[#69C496]/50 scale-105" 
                        : "text-[#4F3F34]/70 bg-white hover:bg-slate-50 border-[#E9E4D4]"
                    }`}
                  >
                    {(settings.profilePic || user?.photoURL) ? (
                      <img
                        src={settings.profilePic || user?.photoURL || ""}
                        alt="Profile"
                        className="w-[18px] h-[18px] rounded-full object-cover border border-[#E9E4D4]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User size={18} strokeWidth={2} />
                    )}
                  </button>

                  {(user?.uid === "G77faQhRPfe5jr4hbY0O0L4fNUs2" || user?.email === "thomasaugustino12345678@gmail.com") && (
                    <button
                      onClick={() => {
                        if (settings.soundEnabled) play("header_switch");
                        setActiveScreen("admin");
                      }}
                      className={`p-2.5 rounded-2xl transition-all hover:scale-105 text-white flex items-center justify-center border`}
                      style={{ 
                        backgroundColor: activeScreen === "admin" ? "#9f1239" : "#e11d48", 
                        borderColor: activeScreen === "admin" ? "#9f1239" : "#e11d48",
                        boxShadow: "0 4px 12px rgba(225, 29, 72, 0.2)" 
                      }}
                      title="Commander Control Deck"
                    >
                      <Shield size={18} strokeWidth={2} />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (settings.soundEnabled) play("header_switch");
                      setActiveScreen("subscription");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all border shadow-sm ${
                      (activeScreen as string) === "subscription" 
                        ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-amber-600/30 scale-105" 
                        : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"
                    }`}
                  >
                    <Crown size={14} strokeWidth={2.2} />
                    <span className="font-extrabold text-[10px] uppercase tracking-wider">
                      Pro
                    </span>
                  </button>
                </div>
              </header>
            )}

          <main
            className={`flex-1 flex flex-col w-full max-w-7xl mx-auto ${(activeScreen as string) === "subscription" || (activeScreen as string) === "archives" || (activeScreen as string) === "leaderboard" || (activeScreen as string) === "admin" || (activeScreen as string) === "garden" || showArchitectLab ? "px-0 sm:px-0 pb-0 pt-0 max-w-none" : "px-4 sm:px-6 pb-32"}`}
          >
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
              ) : (
                activeScreen === "home" && (
                  <motion.div
                    key="home"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="w-full"
                  >
                    <HomeScreen
                      stats={stats}
                      onStartChallenge={() => {
                        vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                        setActiveCustomPlan(null);
                        
                        // Select a random first step that is not archived
                        const archived = settings.archivedOfficialChallenges || [];
                        const possibleStarts: ChallengeStep[] = ([
                          "pushups",
                          "water",
                          "breathing",
                          "drawing",
                          "football",
                          "bubbles",
                          "memory",
                          "gratitude",
                          "reaction",
                          "meditation"
                        ] as ChallengeStep[]).filter(s => !archived.includes(s));
                        
                        const finalStarts = possibleStarts.length > 0 ? possibleStarts : ["water" as ChallengeStep];
                        const randomStart = finalStarts[Math.floor(Math.random() * finalStarts.length)];
                        setChallengeStep(randomStart);
                        
                        setActiveScreen("challenge");
                        // Reset session flags for replayability
                        setDailyProgress((prev) => ({
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
                          writingDone: false,
                        }));
                      }}
                      isCompletedToday={false} // Allow infinite replays as requested
                      dailyProgress={dailyProgress}
                      settings={settings}
                      history={history}
                      onOpenGallery={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("gallery");
                      }}
                      dailyQuest={dailyQuest}
                      isPro={isPro}
                      emergencyActive={emergencyActive}
                      customPlans={customPlans}
                      onStartCustomPlan={(plan) => {
                        vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                        setActiveCustomPlan(plan);
                        setChallengeStep(plan.challenges[0]);
                        setActiveScreen("challenge");
                        // Ensure session flags are reset for custom plans too
                        setDailyProgress((prev) => ({
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
                          writingDone: false,
                        }));
                      }}
                      onDeleteCustomPlan={handleDeleteCustomPlan}
                      onOpenPlanBuilder={() => setActiveScreen("plan-builder")}
                      onOpenPlant={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("plant");
                      }}
                      onOpenArchives={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("archives");
                      }}
                      onOpenGarden={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("garden");
                        if (!settings.hasEnteredGarden) {
                          onUpdateSettings({ hasEnteredGarden: true });
                        }
                      }}
                      onSelectTask={(taskId) => {
                        vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                        setActiveCustomPlan(null);
                        setChallengeStep(taskId as any);
                        setActiveScreen("challenge");
                      }}
                      fcmToken={fcmToken}
                      setupFCM={setupFCM}
                      fcmError={fcmError}
                      showToast={showToast}
                      onArchiveChallenge={handleArchiveChallenge}
                      gardenState={gardenState}
                    />
                  </motion.div>
                )
              )}
              {activeScreen === "progress" && (
                <motion.div
                  key="progress"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        SYNCHRONIZING GROWTH...
                      </div>
                    }
                  >
                    <ProgressScreen
                      stats={stats}
                      history={history}
                      settings={settings}
                      setSettings={onUpdateSettings}
                      userRank={userRank}
                      onScreenChange={setActiveScreen}
                      dailyProgress={dailyProgress}
                      setStats={onUpdateStats}
                      setDailyProgress={onUpdateDailyProgress}
                      play={play}
                      showToast={showToast}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "profile" && (
                <motion.div
                  key="profile"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        FETCHING IDENTITY...
                      </div>
                    }
                  >
                    <ProfileScreen
                      settings={settings}
                      setSettings={onUpdateSettings}
                      stats={stats}
                      user={user}
                      setActiveScreen={setActiveScreen}
                      circles={circles}
                      onUpdateProfile={handleUpdateProfile}
                      deleteAccount={handleDeleteAccount}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "social" && (
                <motion.div
                  key="social"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        ENTERING THE NEXUS...
                      </div>
                    }
                  >
                    <SocialScreen
                      play={play}
                      onBack={() => setActiveScreen("home")}
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
              {activeScreen === "settings" && (
                <motion.div
                  key="settings"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        ACCESSING CONTROL...
                      </div>
                    }
                  >
                    <SettingsScreen
                      user={user}
                      settings={settings}
                      setSettings={onUpdateSettings}
                      isPro={isPro}
                      onBack={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("home");
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
                      sendNotification={(title, body) =>
                        sendNotification(title, { body })
                      }
                      rollbackBackupData={rollbackBackupData}
                      onRollbackRestore={handleRollbackRestore}
                      onSimulateUpdate={handleSimulateNewUpdate}
                      currentAppVersion={currentAppVersion}
                      
                      
                      onOpenDeviceShowcase={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("device-showcase");
                      }}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "device-showcase" && (
                <motion.div
                  key="device-showcase"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="w-full"
                >
                  <DeviceShowcase
                    userStats={stats}
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen("settings");
                    }}
                  />
                </motion.div>
              )}
              {activeScreen === "shop" && (
                <motion.div
                  key="shop"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        CURATING WARES...
                      </div>
                    }
                  >
                    <ShopScreen
                      streak={stats.streak}
                      coins={stats.coins || 0}
                      purchasedItems={settings.purchasedItems || []}
                      isPro={isPro}
                      onBuy={(item, currency) => {
                        vibrate(VIBRATION_PATTERNS.SUCCESS);

                        const isSkin = item.effect === "skin";
                        const isMusic = item.effect === "music";
                        const isSoundPack = item.effect === "sound-pack";

                        const newItem: any = {
                          id: `${item.id}-${Date.now()}`,
                          itemId: item.id,
                          name: item.name,
                          icon: item.icon,
                          activated: isSkin || isMusic || isSoundPack, // Activate immediately!
                          type:
                            item.effect === "skin"
                              ? "skin"
                              : item.effect === "gift"
                                ? "gift"
                                : item.effect === "sound-pack"
                                  ? "sound-pack"
                                  : item.effect === "music"
                                    ? "music"
                                    : "power-up",
                          purchasedAt: new Date().toISOString(),
                        };

                        const bonusItems: any[] = [];
                        if (item.effect === "gift") {
                          // Add an automatic bonus gift
                          bonusItems.push({
                            id: `bonus-${item.id}-${Date.now()}`,
                            itemId: `bonus-${item.id}`,
                            name: `Bonus ${item.name}`,
                            icon: `✨${item.icon}`,
                            activated: false,
                            type: "gift",
                            purchasedAt: new Date().toISOString(),
                          });
                        }

                        onUpdateSettings((prev) => {
                          let inventory = prev.inventory || [];
                          
                          // If we activated the new skin/music/sound-pack, deactivate existing matching categories
                          if (isSkin || isMusic || isSoundPack) {
                            inventory = inventory.map((invItem) => {
                              if (isSkin && invItem.type === "skin") {
                                return { ...invItem, activated: false };
                              }
                              if (isMusic && invItem.type === "music") {
                                return { ...invItem, activated: false };
                              }
                              if (isSoundPack && invItem.type === "sound-pack") {
                                return { ...invItem, activated: false };
                              }
                              return invItem;
                            });
                          }

                          let activeHat = prev.activeHat;
                          if (isSkin) {
                            activeHat = item.id.replace("skin-", "");
                          }

                          let isDogSoundPackActive = prev.isDogSoundPackActive;
                          if (isSoundPack) {
                            isDogSoundPackActive = item.id === "sound-dog";
                          }

                          return {
                            ...prev,
                            activeSkin: prev.activeSkin,
                            activeHat,
                            isDogSoundPackActive,
                            purchasedItems: [
                              ...(prev.purchasedItems || []),
                              item.id,
                            ],
                            inventory: [
                              ...inventory,
                              newItem,
                              ...bonusItems,
                            ],
                          };
                        });

                        if (user) {
                          const purchaseRef = doc(db, "shop_purchases", user.uid);
                          setDoc(purchaseRef, {
                            userId: user.uid,
                            userName: settings.displayName || user.displayName || "Champion",
                            userEmail: user.email || `${user.uid}@nexora.app`,
                            purchases: arrayUnion({
                              itemId: item.id,
                              itemName: item.name,
                              itemIcon: item.icon || "🛒",
                              price: currency === "coins" ? (item.coinPrice || 0) : (item.price || 0),
                              currency: currency,
                              itemType: item.effect || "shop_item",
                              purchasedAt: new Date().toISOString(),
                            }),
                            updatedAt: serverTimestamp()
                          }, { merge: true }).catch((err) => console.error("Failed to save shop purchase to shop_purchases:", err));
                        }

                        setStats((prev) => ({
                          ...prev,
                          streak:
                            currency === "streak"
                              ? Math.max(0, prev.streak - item.price)
                              : prev.streak,
                          coins:
                            currency === "coins"
                              ? Math.max(
                                  0,
                                  (prev.coins || 0) - (item.coinPrice || 0),
                                )
                              : prev.coins || 0,
                        }));

                        // SYNC WITH ORIGINAL STATS FOR ROLLBACK CONSISTENCY
                        if (originalStatsBeforeProTest) {
                          setOriginalStatsBeforeProTest((prev) => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              streak:
                                currency === "streak"
                                  ? Math.max(0, prev.streak - item.price)
                                  : prev.streak,
                              coins:
                                currency === "coins"
                                  ? Math.max(
                                      0,
                                      (prev.coins || 0) - (item.coinPrice || 0),
                                    )
                                  : prev.coins || 0,
                            };
                          });
                        }
                      }}
                      onBack={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("home");
                      }}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "subscription" && user && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black italic">
                        OPENING THE TREASURY...
                      </div>
                    }
                  >
                    <SubscriptionScreen
                      onBack={() => setActiveScreen("home")}
                      userId={user.uid}
                      settings={settings}
                      stats={stats}
                      onUpdateSettings={onUpdateSettings}
                      onActivatePro={() => {
                        onUpdateSettings({ isPro: true });
                        showToast(
                          "NEXORA PRO ACTIVATED! WELCOME TO THE LEGION! 🔥",
                          "success",
                        );
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
                            showToast(
                              `NEXORA RESTRICTION: BRO, WAIT ${remainingDays} MORE DAYS TO TEST AGAIN! ⏳`,
                              "error",
                            );
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
                          proTestActive: true,
                        };
                        onUpdateSettings(settingsUpdate);

                        // CRITICAL: Force immediate sync to Firestore so refresh/exit doesn't lose the test state
                        if (user) {
                          setDoc(doc(db, "users", user.uid), settingsUpdate, {
                            merge: true,
                          }).catch((e) =>
                            console.error("Pro Test immediate sync failed:", e),
                          );
                        }

                        showToast(
                          "PRO PROTOCOL ACTIVATED! 15 MINUTES OF UNLIMITED POWER! ⏳",
                          "info",
                        );
                        vibrate(VIBRATION_PATTERNS.SUCCESS);
                        setActiveScreen("home");
                      }}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "plan-builder" && (
                <motion.div
                  key="plan-builder"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        ARCHITECTING FLOW...
                      </div>
                    }
                  >
                    <PlanBuilder
                      onBack={() => setActiveScreen("home")}
                      onSave={handleSaveCustomPlan}
                      isPro={isPro}
                      existingPlansCount={customPlans.length}
                      settings={settings}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "archives" && (
                <motion.div
                  key="archives"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        OPENING ARCHIVES...
                      </div>
                    }
                  >
                    <ArchivesScreen
                      stats={stats}
                      onUpdateStats={onUpdateStats}
                      settings={settings}
                      onUpdateSettings={onUpdateSettings}
                      play={play}
                      onBack={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("home");
                      }}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "library" && (
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
                      const itemToActivate = settings.inventory?.find(
                        (i) => i.id === id,
                      );
                      if (!itemToActivate) return;

                      let inventory = (settings.inventory || []).map(
                        (item) => {
                          if (item.id === id) {
                            return { ...item, activated: true };
                          }
                          // If it's a skin, deactivate other skins
                          if (
                            item.type === "skin" &&
                            itemToActivate.type === "skin"
                          ) {
                            return { ...item, activated: false };
                          }
                          // If it's music, deactivate other music
                          if (
                            item.type === "music" &&
                            itemToActivate.type === "music"
                          ) {
                            return { ...item, activated: false };
                          }
                          // If it's sound-pack, deactivate other sound-packs
                          if (
                            item.type === "sound-pack" &&
                            itemToActivate.type === "sound-pack"
                          ) {
                            return { ...item, activated: false };
                          }
                          return item;
                        },
                      );

                      let activeSkin = settings.activeSkin;
                      let activeHat = settings.activeHat;
                      if (itemToActivate.type === "skin") {
                        activeHat = itemToActivate.itemId.replace("skin-", "");
                      }

                      let isDogSoundPackActive = settings.isDogSoundPackActive;
                      if (itemToActivate.type === "sound-pack") {
                        isDogSoundPackActive =
                          itemToActivate.itemId === "sound-dog";
                      }

                      let updatedPlantState = settings.plantState;
                      if (itemToActivate.itemId === "plant-recovery") {
                        const nextHealth = Math.min(100, (settings.plantState?.health || 100) + 25);
                        updatedPlantState = settings.plantState ? {
                          ...settings.plantState,
                          health: nextHealth,
                          isDead: nextHealth <= 0 ? settings.plantState.isDead : false
                        } : {
                          type: "sprout",
                          stage: 0,
                          growthPoints: 0,
                          lastGrowthDate: null,
                          health: nextHealth,
                          isDead: false,
                          isThirsty: false,
                          unlockedTypes: ["sprout"],
                          lastCheckDate: new Date().toISOString()
                        };
                        inventory = inventory.filter(item => item.id !== itemToActivate.id);
                        showToast("Nano Fertilizer used! Restored 25% plant health! 🧪🌱", "success");
                      }

                      // If it's a gift, give a reward and keep it activated (as opened)
                      if (
                        itemToActivate.type === "gift" &&
                        !itemToActivate.activated
                      ) {
                        const rewards = [
                          {
                            type: "coins",
                            amount: 50,
                            msg: "You found 50 coins! 💰",
                          },
                          {
                            type: "coins",
                            amount: 100,
                            msg: "Jackpot! 100 coins! 💎",
                          },
                          {
                            type: "xp",
                            amount: 200,
                            msg: "Epic discovery! +200 XP! ✨",
                          },
                          { type: "xp", amount: 50, msg: "Nice! +50 XP! 🌟" },
                          {
                            type: "streak",
                            amount: 1,
                            msg: "Bonus Streak Day! 🔥",
                          },
                        ];
                        const reward =
                          rewards[Math.floor(Math.random() * rewards.length)];

                        showToast(reward.msg, "success");
                        vibrate(VIBRATION_PATTERNS.SUCCESS);

                        setStats((s) => ({
                          ...s,
                          coins:
                            reward.type === "coins"
                              ? (s.coins || 0) + reward.amount
                              : s.coins,
                          xp:
                            reward.type === "xp"
                              ? (s.xp || 0) + reward.amount
                              : s.xp,
                          streak:
                            reward.type === "streak"
                              ? s.streak + reward.amount
                              : s.streak,
                        }));
                      }

                      onUpdateSettings({
                        inventory,
                        activeSkin,
                        activeHat,
                        isDogSoundPackActive,
                        plantState: updatedPlantState,
                      });
                      if (itemToActivate.itemId !== "plant-recovery") {
                        showToast(`${itemToActivate.name} activated!`, "success");
                      }
                    }}
                    onDeactivate={(id) => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      onUpdateSettings((prev) => {
                        const itemToDeactivate = prev.inventory?.find(
                          (i) => i.id === id,
                        );
                        const inventory = (prev.inventory || []).map((item) => {
                          if (item.id === id) {
                            return { ...item, activated: false };
                          }
                          return item;
                        });

                        let activeHat = prev.activeHat;
                        if (itemToDeactivate?.type === "skin") {
                          activeHat = "none";
                        }

                        let isDogSoundPackActive = prev.isDogSoundPackActive;
                        if (itemToDeactivate?.type === "sound-pack") {
                          isDogSoundPackActive = false;
                        }

                        return {
                          ...prev,
                          inventory,
                          activeSkin: prev.activeSkin,
                          activeHat,
                          isDogSoundPackActive,
                        };
                      });
                    }}
                    onDelete={(id) => {
                      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                      onUpdateSettings((prev) => {
                        const itemToDelete = prev.inventory?.find(
                          (i) => i.id === id,
                        );
                        const inventory = (prev.inventory || []).filter(
                          (item) => item.id !== id,
                        );

                        // If deleted, remove from purchasedItems so it can be bought again
                        // But ONLY if it's not a bonus gift (bonus gifts don't exist in shop)
                        const purchasedItems = (
                          prev.purchasedItems || []
                        ).filter((pid) => pid !== itemToDelete?.itemId);

                        let activeHat = prev.activeHat;
                        if (
                          itemToDelete?.type === "skin" &&
                          itemToDelete.activated
                        ) {
                          activeHat = "none";
                        }

                        return {
                          ...prev,
                          inventory,
                          purchasedItems,
                          activeSkin: prev.activeSkin,
                          activeHat,
                        };
                      });
                      showToast("Item deleted from library", "info");
                    }}
                    onDeleteNote={(id) => {
                      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                      setStats((prev) => ({
                        ...prev,
                        gratitudeEntries: (prev.gratitudeEntries || []).filter(
                          (e) => e.id !== id,
                        ),
                      }));
                      showToast("Note deleted", "info");
                    }}
                    onDeleteDrawing={(index) => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setStats((prev) => ({
                        ...prev,
                        drawings: prev.drawings.filter((_, i) => i !== index),
                      }));
                      showToast("Drawing deleted");
                    }}
                    onDeleteChallenge={(id) => {
                      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                      onUpdateSettings((prev) => ({
                        ...prev,
                        savedChallengeIds: (
                          prev.savedChallengeIds || []
                        ).filter((cid) => cid !== id),
                      }));
                      showToast("Challenge removed", "info");
                    }}
                    onBack={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setActiveScreen("home");
                    }}
                    onPlayChallenge={handlePlayLibraryChallenge}
                  />
                </motion.div>
              )}
              {activeScreen === "gallery" && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        OPENING VAULT...
                      </div>
                    }
                  >
                    <GalleryScreen
                      stats={stats}
                      onBack={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("home");
                      }}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "notebook" && (
                <motion.div
                  key="notebook"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        OPENING ARCHIVES...
                      </div>
                    }
                  >
                    <NotebookScreen
                      stats={stats}
                      setStats={setStats}
                      onBack={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("home");
                      }}
                      showToast={showToast}
                      setActiveScreen={setActiveScreen}
                      circles={circles}
                    />
                  </Suspense>
                </motion.div>
              )}

              {activeScreen === "nexus-vision" && (
                <motion.div
                  key="nexus-vision"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-400 font-black">
                        SYNCING NEURAL LINK...
                      </div>
                    }
                  >
                    <NexusVision
                      stats={stats}
                      history={history}
                      isPro={isPro}
                      proTestActive={settings.proTestActive}
                      onBack={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("home");
                      }}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "leaderboard" && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black">
                        COMPUTING HIERARCHY...
                      </div>
                    }
                  >
                    <LeaderboardScreen
                      leaderboard={leaderboard}
                      user={user}
                      settings={settings}
                      stats={stats}
                      onBack={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setActiveScreen("home");
                      }}
                      onClaimRankReward={handleClaimRankReward}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "house" && (
                <motion.div
                  key="house"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-blue-900 font-black italic">
                        HOUSE LOADING...
                      </div>
                    }
                  >
                    <HouseScreen
                      onBack={() => setActiveScreen("home")}
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
                      onCompleteWaterChallenge={triggerWaterChallengeCompletion}
                    />
                  </Suspense>
                </motion.div>
              )}
              {activeScreen === "plant" && settings.plantState && (
                <motion.div
                  key="plant"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-20 animate-pulse text-green-700 font-black italic uppercase tracking-widest">
                        NURTURING ECOSYSTEM...
                      </div>
                    }
                  >
                    <PlantScreen
                      plantState={settings.plantState}
                      onboardingCompleted={!!settings.plantOnboardingCompleted}
                      onCompleteOnboarding={() =>
                        onUpdateSettings({ plantOnboardingCompleted: true })
                      }
                      onExit={() => {
                        vibrate(5);
                        setActiveScreen("home");
                      }}
                      onSaveToLibrary={(imageData) => {
                        onUpdateStats((prev) => ({
                          ...prev,
                          drawings: [imageData, ...(prev.drawings || [])],
                        }));
                      }}
                      onSwitchType={(type) => {
                        vibrate(10);
                        onUpdateSettings((prev) => {
                          const currentType = prev.plantState?.type || "sprout";
                          const plants = prev.plantsProgress || {};
                          
                          // Save current plant state to plantsProgress
                          const updatedPlants = {
                            ...plants,
                            [currentType]: {
                              stage: prev.plantState?.stage ?? 0,
                              growthPoints: prev.plantState?.growthPoints ?? 0,
                              lastGrowthDate: prev.plantState?.lastGrowthDate ?? null,
                              lastCheckDate: prev.plantState?.lastCheckDate ?? new Date().toISOString(),
                              health: prev.plantState?.health ?? 100,
                              isDead: prev.plantState?.isDead ?? false,
                              isThirsty: prev.plantState?.isThirsty ?? false,
                            }
                          };

                          // Get the progress of the switched-to type, or default to starting template
                          const rawProgress = updatedPlants[type];
                          const nextPlantProgress = {
                            stage: rawProgress?.stage ?? 0,
                            growthPoints: rawProgress?.growthPoints ?? 0,
                            lastGrowthDate: rawProgress?.lastGrowthDate ?? null,
                            health: rawProgress?.health ?? 100,
                            isDead: rawProgress?.isDead ?? false,
                            isThirsty: rawProgress?.isThirsty ?? false,
                          };

                          return {
                            ...prev,
                            plantsProgress: updatedPlants,
                            plantState: {
                              ...prev.plantState!,
                              type,
                              stage: nextPlantProgress.stage,
                              growthPoints: nextPlantProgress.growthPoints,
                              lastGrowthDate: nextPlantProgress.lastGrowthDate,
                              lastCheckDate: new Date().toISOString(),
                              health: nextPlantProgress.health,
                              isDead: nextPlantProgress.isDead,
                              isThirsty: nextPlantProgress.isThirsty,
                            },
                          };
                        });
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
                            lastCheckDate: new Date().toISOString(),
                          },
                        });
                        showToast("Ecosystem restored! 🌿", "info");
                      }}
                      onPurchaseEcosystemItem={buyEcosystemItem}
                      onToggleEcosystemItem={toggleEcosystemItem}
                      onUpdateSettings={onUpdateSettings}
                      settings={settings}
                      stats={stats}
                      gardenState={gardenState}
                      setGardenState={setGardenState}
                      showToast={showToast}
                      onUpdateStats={onUpdateStats}
                      onOpenGarden={() => {
                        vibrate(5);
                        setActiveScreen("garden");
                        if (!settings.hasEnteredGarden) {
                          onUpdateSettings({ hasEnteredGarden: true });
                        }
                      }}
                    />
                  </Suspense>
                </motion.div>
              )}

              {activeScreen === "hydration-detail" && (
                <motion.div
                  key="hydration-detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <HydrationDetailPage
                    stats={stats}
                    setStats={setStats}
                    dailyProgress={dailyProgress}
                    setDailyProgress={setDailyProgress}
                    onBack={() => setActiveScreen("progress")}
                    play={play}
                    showToast={showToast}
                    settings={settings}
                    consecutiveDays={hydrationConsecutiveDays}
                    setConsecutiveDays={setHydrationConsecutiveDays}
                    waterLevel={hydrationWaterLevel}
                    setWaterLevel={setHydrationWaterLevel}
                    pendingCoinsAdded={pendingHydrationCoinsAdded}
                  />
                </motion.div>
              )}

              {activeScreen === "admin" && isDataReady && user && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-full"
                >
                  <AdminPanel
                    currentUserId={user.uid}
                    currentUserEmail={user.email}
                    onBack={() => setActiveScreen("home")}
                    showToast={showToast}
                  />
                </motion.div>
              )}
              {activeScreen === "challenge" && (
                <motion.div
                  key="challenge"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-blue-50 flex items-center justify-center animate-pulse text-blue-900 font-black italic">
                        INITIALIZING CHALLENGE...
                      </div>
                    }
                  >
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
                        setActiveScreen("home");
                      }}
                      earnedTrophyToday={earnedTrophyToday}
                      showToast={showToast}
                      play={play}
                      dailyQuest={dailyQuest}
                      isCustomPlan={activeCustomPlan !== null}
                      gardenState={gardenState}
                      setGardenState={setGardenState}
                      onLootFound={() => {}}
                      onCompleteWaterChallenge={triggerWaterChallengeCompletion}
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
                setActiveScreen("social");
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
                setShowRewardsScreen(true);
              }}
            />
          )}

          {showRewardsScreen && (
            <RewardsScreen
              stats={stats}
              onUpdateStats={onUpdateStats}
              settings={settings}
              isCustomPlan={activeCustomPlan !== null}
              onFinish={() => {
                setShowRewardsScreen(false);
                setActiveScreen("trophy-rewards");
              }}
            />
          )}

          {decayAlert && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-red-950/60 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden border-4 border-red-500 relative"
              >
                {/* Background Rays */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(239,68,68,0.3)_10deg,transparent_20deg)] animate-spin" style={{ animationDuration: '15s' }} />
                </div>

                <div className="p-8 text-center relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/10 border-2 border-white animate-bounce">
                    <span className="text-5xl">⚠️</span>
                  </div>

                  <h3 className="text-xl font-black text-red-650 uppercase tracking-tight mb-2">
                    ENERGY DECAY DETECTED
                  </h3>
                  
                  <div className="text-[10px] bg-red-50 hover:bg-red-100 border border-red-100 font-black tracking-widest text-red-800 uppercase px-3 py-1.5 rounded-full mb-4">
                    ABSENT FOR {decayAlert.days} DAYS
                  </div>

                  <p className="text-slate-600 text-xs font-semibold leading-relaxed mb-6">
                    {decayAlert.message}
                  </p>

                  <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase text-slate-500">
                      <span>Weekly XP lost:</span>
                      <span className="text-red-600">-{decayAlert.decayedXP} XP</span>
                    </div>
                    <div className="flex justify-between text-xs font-black uppercase text-slate-500">
                      <span>Weekly score lost:</span>
                      <span className="text-red-600">-{decayAlert.decayedPoints} pts</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setDecayAlert(null);
                    }}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 text-center block"
                  >
                    Restabilize Energy Now 🔥
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {activeScreen === "trophy-rewards" && (
            <TrophyRewardsScreen
              trophyType={sessionTrophy}
              settings={settings}
              onFinish={() => {
                setActiveCustomPlan(null);
                setActiveScreen("home");
              }}
            />
          )}

          {(activeScreen as string) !== "challenge" &&
            (activeScreen as string) !== "subscription" &&
            (activeScreen as string) !== "nexus-vision" &&
            (activeScreen as string) !== "plant" &&
            (activeScreen as string) !== "house" &&
            (activeScreen as string) !== "archives" &&
            (activeScreen as string) !== "leaderboard" &&
            (activeScreen as string) !== "admin" &&
            (activeScreen as string) !== "hydration-detail" &&
            (activeScreen as string) !== "social" &&
            (activeScreen as string) !== "garden" &&
            (activeScreen as string) !== "device-showcase" &&
            !showArchitectLab && (
              <motion.div
                initial={false}
                animate={{
                  y: scrollDirection === "down" ? 110 : 0,
                  opacity: scrollDirection === "down" ? 0 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 p-3 sm:p-5 flex justify-center pointer-events-none z-[80]"
              >
                <nav className="bg-white/95 backdrop-blur-lg border border-slate-200/85 shadow-2xl px-2 py-1 rounded-[2rem] flex items-center justify-around gap-0.5 pointer-events-auto w-[96%] max-w-[370px] sm:max-w-[440px] h-[60px] sm:h-[66px] overflow-hidden select-none">
                  {(settings.navOrder || Object.keys(NAV_ITEMS_MAP)).map(
                    (id) => {
                      const item = NAV_ITEMS_MAP[id];
                      if (!item) return null;
                      if (id === "social") return null; // Keep hidden in bottom menu to prevent crowded arrangement
                      const isHidden = settings.hiddenNavItems?.includes(id);
                      if (isHidden) return null;

                      return (
                        <NavButton
                          key={id}
                          active={(activeScreen as string) === item.screen}
                          onClick={() => {
                            vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                            if (settings.soundEnabled) play("nav_switch");
                            setActiveScreen(item.screen);
                          }}
                          icon={item.icon}
                          label={item.label}
                        />
                      );
                    },
                  )}
                </nav>
              </motion.div>
            )}

          {publicUserViewId && (
            <PublicRankView
              userId={publicUserViewId}
              onClose={() => {
                setPublicUserViewId(null);
                window.history.replaceState({}, "", window.location.pathname);
              }}
            />
          )}

          {viewingTrophy && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
              onClick={() => setViewingTrophy(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 flex flex-col items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-24 h-24">
                  {viewingTrophy.type === "golden" && <GoldenTrophy />}
                  {viewingTrophy.type === "ice" && <IceTrophy />}
                  {viewingTrophy.type === "broken" && <BrokenTrophy />}
                </div>
                <h2 className="text-2xl font-black capitalize">
                  {viewingTrophy.type} Trophy
                </h2>
                <p className="text-sm text-blue-900/60">
                  Earned on{" "}
                  {format(parseISO(viewingTrophy.earnedDate), "MMMM d, yyyy")}
                </p>
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
                        src={
                          updateInfo.imageUrl ||
                          nexoraAppIcon
                        }
                        alt="Mascot"
                        className="w-12 h-12 object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-black text-blue-900">
                          Nexora Update v{updateInfo.version}
                        </h3>
                        <button
                          onClick={() => {
                            if (updateInfo) {
                              localStorage.setItem(
                                "nexora_dismissed_version",
                                updateInfo.version,
                              );
                            }
                            setShowUpdatePopup(false);
                          }}
                          className="p-1 hover:bg-blue-50 rounded-lg text-blue-400"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-bold text-blue-900/60 uppercase tracking-wider">
                          What's New:
                        </p>
                        <ul className="space-y-1">
                          {updateInfo.releaseNotes.map((note, i) => (
                            <li
                              key={i}
                              className="text-xs text-blue-900/80 flex items-start gap-2"
                            >
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
                        <RefreshCw
                          size={18}
                          className="group-active:rotate-180 transition-transform duration-500"
                        />
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
                onClick={() =>
                  markSystemNotificationRead(activeSystemNotification.id)
                }
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
                      onClick={() =>
                        markSystemNotificationRead(activeSystemNotification.id)
                      }
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
          {/* Removed by request */}

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
                      <h4 className="text-xl font-black text-blue-900 leading-none uppercase italic">
                        Mission Report
                      </h4>
                      <p className="text-sm font-bold text-blue-600/80 mt-1">
                        Yo bro, enjoying the protocol? HQ needs your feedback to
                        optimize the Nexora system!
                      </p>
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

          {/* Dynamic Dancing Mascot Floating Music Player Card */}
          <AnimatePresence>
            {currentPlayingMusicTrack && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
                className="fixed bottom-28 right-4 md:right-10 md:bottom-28 z-[120] pointer-events-auto"
              >
                <style>{`
                  @keyframes mascotSuperDance {
                    0%, 100% {
                      transform: translateY(0) rotate(0deg) scale(1);
                    }
                    15% {
                      transform: translateY(-20px) rotate(-10deg) scaleX(0.88) scaleY(1.12);
                    }
                    30% {
                      transform: translateY(0) rotate(10deg) scaleX(1.12) scaleY(0.88);
                    }
                    45% {
                      transform: translateY(-12px) rotate(-6deg) scaleX(0.92) scaleY(1.08);
                    }
                    60% {
                      transform: translateY(0) rotate(0deg) rotateY(180deg) scale(1);
                    }
                    75% {
                      transform: translateY(-16px) rotate(8deg) rotateY(180deg) scaleX(0.92) scaleY(1.08);
                    }
                    90% {
                      transform: translateY(0) rotate(-4deg) rotateY(360deg) scaleX(1.08) scaleY(0.92);
                    }
                  }
                  .mascot-super-dance {
                    animation: mascotSuperDance 1.8s infinite ease-in-out;
                    transform-origin: bottom center;
                    will-change: transform;
                  }
                  @keyframes floatParticle1 {
                    0% { transform: translate(0, 0) scale(0.6) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 0.8; }
                    100% { transform: translate(-15px, -55px) scale(1.1) rotate(-15deg); opacity: 0; }
                  }
                  @keyframes floatParticle2 {
                    0% { transform: translate(0, 0) scale(0.6) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 0.8; }
                    100% { transform: translate(20px, -60px) scale(1.1) rotate(30deg); opacity: 0; }
                  }
                  @keyframes floatParticle3 {
                    0% { transform: translate(0, 0) scale(0.6) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 0.8; }
                    100% { transform: translate(-10px, -50px) scale(1.1) rotate(20deg); opacity: 0; }
                  }
                  .anim-particle-1 { animation: floatParticle1 2.5s infinite linear; }
                  .anim-particle-2 { animation: floatParticle2 2.5s infinite linear; animation-delay: 0.8s; }
                  .anim-particle-3 { animation: floatParticle3 2.5s infinite linear; animation-delay: 1.5s; }
                `}</style>

                {/* Main Glass Media Card Container */}
                <div className="bg-[#0B0F19]/90 border-2 border-cyan-500/30 rounded-3xl p-4 shadow-[0_20px_50px_rgba(6,182,212,0.25)] backdrop-blur-md flex items-center gap-4 w-[290px] relative overflow-hidden">
                  {/* Neon laser border sweep bar */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 animate-pulse" />

                  {/* Music Emojis & Sparkle Particles Spray floating in background */}
                  <div className="absolute top-0 right-4 left-4 h-12 overflow-hidden pointer-events-none">
                    <div className="absolute left-[20%] text-xs anim-particle-1">🎵</div>
                    <div className="absolute left-[50%] text-[10px] anim-particle-2">🎶</div>
                    <div className="absolute left-[80%] text-xs anim-particle-3">✨</div>
                  </div>

                  {/* Mascot Container Frame */}
                  <div className="relative group w-16 h-16 bg-gradient-to-tr from-cyan-950/40 to-sky-900/10 rounded-2xl border border-cyan-500/20 flex items-center justify-center p-1 overflow-visible">
                    {/* Glowing Ring Backdrop */}
                    <div className="absolute inset-0 rounded-2xl bg-cyan-400/10 animate-ping duration-[3s]" />
                    
                    <div className="mascot-super-dance w-full h-full">
                      <Mascot
                        mood="happy"
                        theme={
                          settings.activeSkin === "none"
                            ? "standard"
                            : settings.activeSkin
                        }
                        hat={settings.activeHat || "none"}
                        performanceMode={settings.performanceMode}
                        className="w-full h-full scale-125 select-none pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Audio Details & Controls Panel */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="overflow-hidden">
                      <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                        Now Vibing
                      </span>
                      <div className="text-white text-sm font-black truncate tracking-tight mt-1 max-w-[150px]">
                        {currentPlayingMusicTrack.name}
                      </div>
                    </div>

                    {/* Miniature Music Wave Visualizer Beams */}
                    <div className="flex gap-0.5 items-end h-3 my-2 opacity-80">
                      <span className="w-[3px] bg-cyan-400 rounded-t-full animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: "0.1s" }} />
                      <span className="w-[3px] bg-sky-400 rounded-t-full animate-[bounce_0.8s_infinite_alternate]" style={{ animationDelay: "0.3s" }} />
                      <span className="w-[3px] bg-indigo-400 rounded-t-full animate-[bounce_0.5s_infinite_alternate]" style={{ animationDelay: "0.2s" }} />
                      <span className="w-[3px] bg-cyan-400 rounded-t-full animate-[bounce_0.7s_infinite_alternate]" style={{ animationDelay: "0.4s" }} />
                      <span className="w-[3px] bg-sky-400 rounded-t-full animate-[bounce_0.9s_infinite_alternate]" style={{ animationDelay: "0.15s" }} />
                      <span className="w-[3px] bg-[#69C496] rounded-t-full animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: "0.05s" }} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        {currentPlayingMusicTrack.isZen ? "Zen Mode" : "Purchased Track"}
                      </span>

                      {/* Stop Music Button */}
                      <button
                        onClick={() => {
                          vibrate(VIBRATION_PATTERNS.CLICK);
                          if (currentPlayingMusicTrack.isZen) {
                            onUpdateSettings({ soundEnabled: false });
                            showToast("Sound Muted 🔇", "success");
                          } else {
                            const inventory = (settings.inventory || []).map((item) => {
                              if (item.id === currentPlayingMusicTrack.id) {
                                return { ...item, activated: false };
                              }
                              return item;
                            });
                            onUpdateSettings({ inventory });
                            showToast("Music stopped! Mascot dismissed.", "success");
                          }
                        }}
                        className="px-2.5 py-1 text-[9px] font-black tracking-widest text-white hover:text-white bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 rounded-xl transition-all uppercase whitespace-nowrap active:scale-95"
                      >
                        Stop ⏹️
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
                  backgroundColor:
                    toast.type === "success"
                      ? "rgba(16, 185, 129, 0.9)"
                      : toast.type === "error"
                        ? "rgba(239, 68, 68, 0.9)"
                        : "rgba(59, 130, 246, 0.9)",
                  color: "white",
                }}
              >
                <div className="p-1.5 bg-white/20 rounded-lg">
                  {toast.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : toast.type === "error" ? (
                    <AlertCircle size={18} />
                  ) : (
                    <Info size={18} />
                  )}
                </div>
                <p className="font-bold text-sm">{toast.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CELESTIAL GOLDEN SEED DROP CELEBRATION OVERLAY */}
          <AnimatePresence>
            {gardenState?.pendingLootSeed && (
              <LootCard
                loot={gardenState.pendingLootSeed}
                onCollect={() => {
                  const seedId = gardenState.pendingLootSeed?.seedId;
                  if (seedId) {
                    const updatedState = addSeedToInventory(gardenState, seedId);
                    setGardenState({
                      ...updatedState,
                      pendingLootSeed: null,
                    });

                    // Log lucky seed drop to plants collection under user UID
                    if (user) {
                      const plantRef = doc(db, "plants", user.uid);
                      setDoc(plantRef, {
                        userId: user.uid,
                        userName: settings.displayName || user.displayName || "Champion",
                        userEmail: user.email || `${user.uid}@nexora.app`,
                        lastLuckySeedId: seedId,
                        lastLuckySeedName: gardenState.pendingLootSeed?.seedName || "Unknown Seed",
                        lastLuckySeedType: "lucky_seed_drop",
                        lastLuckySeedAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                      }, { merge: true }).catch((err) => console.error("Failed to log lucky seed drop:", err));
                    }

                    showToast(`Saved ${gardenState.pendingLootSeed?.seedName} direct to inventory vault! 🎒🌱`, 'success');
                  } else {
                    setGardenState({
                      ...gardenState,
                      pendingLootSeed: null,
                    });
                  }
                }}
              />
            )}
          </AnimatePresence>

          {/* Rollback & Recovery Countdown System Overlay */}
          <AnimatePresence>
            {rollbackCountdown !== null && rollbackCountdown > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-[9999] bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl shadow-2xl p-5 border border-white/10 backdrop-blur-md"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl border border-white/10 shrink-0">
                    <span className="text-xl font-black">{rollbackCountdown}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-xs uppercase tracking-wider text-blue-300">System Upgrade in Progress</h4>
                    <p className="text-[10px] font-bold text-slate-300">Nexora is optimizing cache files. Stable version rollback available.</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.NOTIFY);
                      handleRollbackRestore();
                    }}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md shadow-rose-900/40"
                  >
                    Emergency Rollback
                  </button>
                  <button
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                      localStorage.setItem("nexora_rollback_timer_seen_for_version", currentAppVersion);
                      localStorage.setItem("nexora_version", currentAppVersion);
                      setRollbackCountdown(null);
                      showToast(`Welcome to v${currentAppVersion}! System stable.`, "success");
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Keep Update
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <MascotParticleRain />
        </div>
      </div>
    </ErrorBoundary>
  );
}
