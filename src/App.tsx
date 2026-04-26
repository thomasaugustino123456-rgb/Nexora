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
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { PlanBuilder } from './components/PlanBuilder';
import { Mascot } from './components/Mascot';
import { ArtistMascot } from './components/ArtistMascot';
import { BreathingMascot } from './components/BreathingMascot';
import { PushupMascot } from './components/PushupMascot';
import { WaterMascot } from './components/WaterMascot';
import { WritingMascot } from './components/WritingMascot';
import { HouseScreen } from './components/HouseScreen';
import { GoldenTrophy, IceTrophy, BrokenTrophy, playTrophySound } from './components/Trophies';
import { LibraryScreen } from './components/LibraryScreen';
import { ShopScreen, SHOP_ITEMS } from './components/ShopScreen';
import { PlantScreen } from './components/PlantScreen';
import { Calendar } from './components/Calendar';
import { StatsCharts } from './components/StatsCharts';
import { VideoPlayer } from './components/VideoPlayer';

const SocialScreen = lazy(() => import('./components/SocialScreen').then(m => ({ default: m.SocialScreen })));
const NexusVideoScreen = lazy(() => import('./components/NexusVideoScreen').then(m => ({ default: m.NexusVideoScreen })));
const LeaderboardScreen = lazy(() => import('./components/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const ProgressScreen = lazy(() => import('./components/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const ProfileScreen = lazy(() => import('./components/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const SettingsScreen = lazy(() => import('./components/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const GalleryScreen = lazy(() => import('./components/GalleryScreen').then(m => ({ default: m.GalleryScreen })));
const NotebookScreen = lazy(() => import('./components/NotebookScreen').then(m => ({ default: m.NotebookScreen })));

const SOCIAL_LOCKED = false;

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { vibrate, VIBRATION_PATTERNS } from './lib/vibrate';
import { requestNotificationPermission, setupOnMessageListener } from './lib/notifications';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function WhatIsNewModal({ onClose }: { onClose: () => void }) {
  const [updates, setUpdates] = useState<any>(null);

  useEffect(() => {
    fetch('/updates.json')
      .then(res => res.json())
      .then(data => setUpdates(data))
      .catch(err => console.error('Failed to fetch updates:', err));
  }, []);

  if (!updates) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 space-y-6 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="p-2 hover:bg-blue-50 rounded-full text-blue-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-blue-900 leading-tight">What's New!</h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Version {updates.version}</p>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {updates.updates.map((update: any, i: number) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase rounded-md">
                  {update.category}
                </span>
                <h4 className="font-bold text-blue-900 text-sm">{update.title}</h4>
              </div>
              <p className="text-xs text-blue-900/60 leading-relaxed pl-2 border-l-2 border-blue-100 ml-1">
                {update.description}
              </p>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-200"
        >
          Awesome! 🚀
        </button>
      </motion.div>
    </motion.div>
  );
}

// Moved to separate files: Calendar, StatsCharts, VideoPlayer

function HappyMascot({ size = 32, hat = 'none', settings }: { size?: number, hat?: string, settings: UserSettings }) {
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
        <Mascot className="w-full h-full drop-shadow-lg" hat={hat} soundPack={settings.isDogSoundPackActive ? 'dog' : 'cat'} />
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

function LevelUpCelebration({ level, onComplete }: { level: number, onComplete: () => void }) {
  useEffect(() => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-500/90 backdrop-blur-md p-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="mb-8 relative inline-block"
        >
          <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-50 animate-pulse" />
          <Award size={120} className="text-yellow-400 relative z-10 drop-shadow-2xl" />
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black text-white mb-2 uppercase tracking-tighter"
        >
          Level Up!
        </motion.h2>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-8xl font-black text-white drop-shadow-lg"
        >
          {level}
        </motion.div>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-blue-100 font-bold mt-4"
        >
          You're becoming a legend, bro! 🚀
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="mt-6 flex gap-4 justify-center"
        >
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30 shadow-xl">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-yellow-700 font-black text-sm">$</span>
            </div>
            <span className="text-white font-black">+15 COINS</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30 shadow-xl">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Flame size={16} className="text-white" />
            </div>
            <span className="text-white font-black">+5 STREAK</span>
          </div>
        </motion.div>
        
        <div className="mt-8 flex gap-2 justify-center">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0, x: 0, opacity: 1 }}
              animate={{ 
                y: [0, -100 - Math.random() * 200],
                x: [0, (Math.random() - 0.5) * 200],
                opacity: [1, 0],
                scale: [1, 0.5]
              }}
              transition={{ duration: 1 + Math.random(), repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-yellow-400"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MascotAI({ stats, settings }: { stats: UserStats, settings: UserSettings }) {
  const [message, setMessage] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const userMsg = message;
    setMessage("");
    setLoading(true);
    setResponse("");
    
    try {
      const prompt = `You are Nexora, a friendly water-bottle mascot for a productivity and wellness app. 
      The user says: "${userMsg}"
      Respond as Nexora. Be friendly, helpful, and encouraging. 
      Keep it short (max 2-3 sentences). 
      User stats: Streak ${stats.streak}, Points ${stats.totalPoints}, Level ${stats.level || 1}.
      Your current outfit is: ${settings.activeSkin || 'none'}.`;
      
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      setResponse(result.response.text() || "I'm here for you, bro! 🌊");
    } catch (error) {
      setResponse("I'm a bit parched right now, but I'm still cheering for you! 🚀");
    } finally {
      setLoading(false);
    }
  };

  const generateMotivation = async () => {
    setLoading(true);
    try {
      const prompt = `You are Nexora, a friendly water-bottle mascot for a productivity and wellness app. 
      The user's current streak is ${stats.streak} days. 
      Their total points are ${stats.totalPoints}.
      They have ${stats.trophies.length} trophies.
      Give them a short, punchy, and super friendly motivational message (max 2 sentences). 
      Be encouraging and maybe a bit bubbly!`;
      
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      setResponse(result.response.text() || "You're doing great, bro! Keep that streak alive! 🌊");
    } catch (error) {
      setResponse("I'm always here to cheer you on! Let's crush today! 🚀");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !response) {
      generateMotivation();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-24 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-64 glass-card p-4 shadow-2xl border-2 border-blue-200"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nexora Says:</span>
              <button onClick={() => setIsOpen(false)} className="text-blue-900/20 hover:text-blue-900/40">
                <X size={14} />
              </button>
            </div>
            {loading ? (
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              <p className="text-sm font-medium text-blue-900 leading-relaxed italic">"{response}"</p>
            )}
            
            <form onSubmit={handleChat} className="mt-4 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something..."
                className="flex-1 text-[10px] bg-white/50 border border-blue-200 rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-blue-900"
              />
              <button 
                type="submit"
                disabled={loading}
                className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </form>

            <button 
              onClick={() => { setResponse(""); generateMotivation(); }}
              className="mt-3 text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <Sparkles size={10} /> Get more wisdom
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}

function CoinAnimation({ onComplete, play, settings }: { onComplete: () => void, play: (s: string) => void, settings: UserSettings }) {
  const [phase, setPhase] = useState<'appear' | 'fly' | 'dust'>('appear');

  useEffect(() => {
    if (settings.soundEnabled) {
      play('coin');
    }
    const timer1 = setTimeout(() => setPhase('fly'), 2500);
    const timer2 = setTimeout(() => setPhase('dust'), 4000);
    const timer3 = setTimeout(() => onComplete(), 5000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete, play]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        {phase === 'appear' && (
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              rotate: 0, 
              opacity: 1,
              y: [0, -20, 0] 
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              duration: 1.5,
              y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
            }}
            className="relative"
          >
            <div className="w-32 h-32 bg-yellow-400 rounded-full border-4 border-yellow-600 flex items-center justify-center shadow-2xl">
              <span className="text-5xl font-black text-yellow-700">$</span>
            </div>
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 animate-pulse" />
          </motion.div>
        )}

        {phase === 'fly' && (
          <motion.div
            initial={{ x: 0, y: 0, scale: 1 }}
            animate={{ 
              x: [0, -100, -200], 
              y: [0, 200, 400], 
              scale: 0.5,
              opacity: [1, 1, 0]
            }}
            transition={{ duration: 1.5, ease: "anticipate" }}
            className="w-16 h-16 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-xl"
          >
            <span className="text-xl font-black text-yellow-700">$</span>
          </motion.div>
        )}

        {phase === 'dust' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ 
                  y: -50 - Math.random() * 50, 
                  x: (Math.random() - 0.5) * 100,
                  scale: 0,
                  opacity: 0 
                }}
                transition={{ duration: 1.0 }}
                className="w-2 h-2 bg-yellow-400 rounded-full"
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const today = new Date().toISOString().split('T')[0];
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Preload lazy components when the browser is idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        import('./components/SocialScreen');
        import('./components/NexusVideoScreen');
        import('./components/LeaderboardScreen');
        import('./components/ProgressScreen');
        import('./components/ProfileScreen');
        import('./components/SettingsScreen');
        import('./components/GalleryScreen');
        import('./components/NotebookScreen');
      });
    }
  }, []);
  const [isDataReady, setIsDataReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Initialize from localStorage for immediate UI (no flash of zero)
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('nexora_settings');
    if (!saved) return DEFAULT_SETTINGS;
    
    try {
      const parsed = JSON.parse(saved);
      // Deep merge plantState to ensure it's never empty if it exists
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        plantState: parsed.plantState ? { ...DEFAULT_SETTINGS.plantState, ...parsed.plantState } : DEFAULT_SETTINGS.plantState
      };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('nexora_stats');
    const base = saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    return base;
  });

  // Track if data has been loaded from Firestore at least once this session
  const dataLoadedFromFirestore = useRef(false);

  const [activeScreen, setActiveScreen] = useLocalStorage<Screen>('nexora_active_screen', 'home');
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

  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const onUpdateSettings = (newSettings: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => {
    setSettings(prev => {
      const updated = typeof newSettings === 'function' ? newSettings(prev) : { ...prev, ...newSettings };
      // Safety check: Ensure plantState has a valid type if it exists
      if (updated.plantState && !updated.plantState.type) {
        updated.plantState.type = 'zen';
      }
      localStorage.setItem('nexora_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const onUpdateStats = (newStats: Partial<UserStats> | ((prev: UserStats) => UserStats)) => {
    setStats(prev => {
      const updated = typeof newStats === 'function' ? newStats(prev) : { ...prev, ...newStats };
      localStorage.setItem('nexora_stats', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Reset daily states if date changes
    const checkDateChange = () => {
      const now = new Date().toISOString().split('T')[0];
      if (now !== today) {
        console.log("Daily reset detected. Refreshing...");
        window.location.reload(); // Hard reset is safest for PWA/ServiceWorker consistency
      }
    };
    const interval = setInterval(checkDateChange, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [today]);

  const onUpdateDailyProgress = (update: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress)) => {
    setDailyProgress(prev => {
       const updated = typeof update === 'function' ? update(prev) : { ...prev, ...update };
       localStorage.setItem(`nexora_progress_${today}`, JSON.stringify(updated));
       return updated;
    });
  };

  // Effect to keep localStorage always mirroring state for immediate reload recovery
  useEffect(() => {
    if (dataLoadedFromFirestore.current) {
      localStorage.setItem('nexora_settings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (dataLoadedFromFirestore.current) {
      localStorage.setItem('nexora_stats', JSON.stringify(stats));
    }
  }, [stats]);

  const { play, stop, playMusic, stopAllMusic } = useSound();
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [earnedTrophyToday, setEarnedTrophyToday] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeCustomPlan, setActiveCustomPlan] = useState<CustomPlan | null>(null);
  const [viewingTrophy, setViewingTrophy] = useState<Trophy | null>(null);

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

  const isPro = settings.isPro;
  const setIsPro = (val: boolean) => setSettings(prev => ({ ...prev, isPro: val }));

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    const saved = localStorage.getItem(`nexora_progress_${today}`);
    return saved ? JSON.parse(saved) : {
      date: today,
      completed: false,
      completionsCount: 0,
      pushupsDone: false,
      waterDrank: 0,
      breathingDone: false,
      drawingDone: false,
      footballDone: false,
      bubblesDone: false,
      waterChallengeCount: 0
    };
  });

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
    if (!fcmToken) {
      showToast('No device token found. Please enable notifications.', 'error');
      return;
    }

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
        showToast('Server Error: ' + (text.substring(0, 50) || response.statusText), 'error');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast('Test notification sent!', 'success');
      } else {
        showToast('Failed to send: ' + data.error, 'error');
      }
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      showToast('Error: ' + error.message, 'error');
    }
  };

  const sendMotivation = async () => {
    if (!fcmToken) {
      showToast('No device token found.', 'error');
      return;
    }

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
        showToast('Server Error: ' + (text.substring(0, 50) || response.statusText), 'error');
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast('Motivation sent! 🔥', 'success');
      } else {
        showToast('Failed: ' + data.error, 'error');
      }
    } catch (error: any) {
      console.error('Error sending motivation:', error);
      showToast('Error: ' + error.message, 'error');
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
    // 0. Initialize Auth Persistence
    async function initAuth() {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.error("Auth persistence failed:", e);
      }
    }
    initAuth();

    async function testConnection() {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        console.warn("Firestore status check:", error);
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        setIsDataReady(false);
        setUser(currentUser);
        setIsDataReady(false);
        dataLoadedFromFirestore.current = false;
        
        try {
          // Force fetch from server for critical initial load
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (!userDoc.exists()) {
            console.log("Firestore: New user setup");
            // Important: Set default states first, then say data is ready
            setSettings(DEFAULT_SETTINGS);
            setStats(DEFAULT_STATS);
            
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
            setNeedsOnboarding(true);
            dataLoadedFromFirestore.current = true;
            setIsDataReady(true);
          } else {
            console.log("Firestore: Loading existing data");
            const data = userDoc.data();
            setNeedsOnboarding(data.onboardingCompleted === false);
            
            // Source of Truth is NOW Firestore on login
            const firestoreSettings = { ...DEFAULT_SETTINGS, ...data };
            const firestoreStats = { ...DEFAULT_STATS, ...(data.stats || {}) };

            // Fetch specific settings
            const spaceSettingsDoc = await getDoc(doc(db, 'users', currentUser.uid, 'settings', 'space'));
            if (spaceSettingsDoc.exists()) {
              firestoreSettings.spaceOnboardingCompleted = !!spaceSettingsDoc.data().completed;
            }

            // Fetch detailed stats
            const detailedStatsDoc = await getDoc(doc(db, 'users', currentUser.uid, 'stats', 'main'));
            if (detailedStatsDoc.exists()) {
              Object.assign(firestoreStats, detailedStatsDoc.data());
            }

            setSettings(firestoreSettings);
            setStats(firestoreStats);
            
            const progressDoc = await getDoc(doc(db, 'users', currentUser.uid, 'progress', today));
            if (progressDoc.exists()) {
              setDailyProgress(prev => ({ ...prev, ...progressDoc.data() }));
            }
            
            // Only after state is set, we allow syncing BACK to firestore
            dataLoadedFromFirestore.current = true;
            setIsDataReady(true);
          }
        } catch (error) {
          console.error("Load critical failure:", error);
          // Fallback to local if fetch fails (prevents complete wipe)
          dataLoadedFromFirestore.current = true;
          setIsDataReady(true);
        }
        setLoading(false);
      } else {
        setUser(null);
        setIsDataReady(false);
        dataLoadedFromFirestore.current = false;
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log("App State Change:", { 
      loading, 
      user: !!user, 
      activeScreen, 
      isAuthReady: !!auth.currentUser,
      settingsLoaded: !!settings.displayName,
      statsLoaded: !!stats.totalPoints,
      showAuth,
      needsOnboarding
    });
  }, [loading, user, activeScreen, settings, stats, showAuth, needsOnboarding]);

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
      await addDoc(collection(db, 'feedback'), {
        ...feedbackData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        version: currentAppVersion
      });
      showToast('Feedback sent! Thanks bro! 🏮', 'success');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (err) {
      console.error(err);
      showToast('Failed to send feedback', 'error');
    }
  };

  const onShowManifesto = () => {
    setShowUpdatePopup(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-blue-600 font-bold animate-pulse">Loading Nexora...</p>
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
    return <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} settings={settings} setSettings={onUpdateSettings} setupFCM={setupFCM} />;
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
                onClick={() => setActiveScreen('subscription')}
                className={`flex items-center gap-1 p-2 transition-colors ${activeScreen === 'subscription' ? 'text-amber-500' : 'text-amber-500/60 hover:text-amber-500'}`}
              >
                <Crown size={24} />
                <span className="font-bold text-xs">Pro</span>
              </button>
              <button 
                onClick={() => setActiveScreen('house')}
                className={`p-2 transition-colors ${activeScreen === 'house' ? 'text-blue-600' : 'text-blue-900/40 hover:text-blue-900/60'}`}
              >
                <Home size={24} />
              </button>
              <button 
                onClick={() => setActiveScreen('profile')}
                className={`p-2 transition-colors ${activeScreen === 'profile' ? 'text-blue-600' : 'text-blue-900/40 hover:text-blue-900/60'}`}
              >
                {settings.profilePic ? (
                  <img src={settings.profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" referrerPolicy="no-referrer" loading="lazy" />
                ) : (
                  <User size={24} />
                )}
              </button>
              <button 
                onClick={() => setActiveScreen('settings')}
                className={`p-2 transition-colors ${activeScreen === 'settings' ? 'text-blue-600' : 'text-blue-900/40 hover:text-blue-900/60'}`}
              >
                <Settings size={24} />
              </button>
              <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
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
                  fcmToken={fcmToken}
                  setupFCM={setupFCM}
                  fcmError={fcmError}
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
                <PlanBuilder 
                  onBack={() => setActiveScreen('home')}
                  onSave={handleSaveCustomPlan}
                  isPro={isPro}
                  existingPlansCount={customPlans.length}
                  settings={settings}
                />
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
            {activeScreen === 'house' && (
              <motion.div
                key="house"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
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
                        // If they haven't finished this one yet, keep stage.
                        // If they want independent tracking per plant, we'd need a map.
                        // For now, let's keep it as one active progression.
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
              </motion.div>
            )}
            {activeScreen === 'challenge' && (
              <motion.div
                key="challenge"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
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
                    setActiveScreen('home');
                  }}
                  earnedTrophyToday={earnedTrophyToday}
                  showToast={showToast}
                  play={play}
                  dailyQuest={dailyQuest}
                />
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
                  setActiveScreen('home');
                }} 
                icon={<Home size={24} />} 
                label="Home"
              />
              <NavButton 
                active={activeScreen === 'progress'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  setActiveScreen('progress');
                }} 
                icon={<BarChart2 size={24} />} 
                label="Progress"
              />
              <NavButton 
                active={activeScreen === 'shop'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  setActiveScreen('shop');
                }} 
                icon={<Star size={24} />} 
                label="Shop"
              />
              <NavButton 
                active={activeScreen === 'library'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  setActiveScreen('library');
                }} 
                icon={<TrophyIcon size={24} />} 
                label="Library"
              />
              <NavButton 
                active={activeScreen === 'notebook'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  setActiveScreen('notebook');
                }} 
                icon={<Book size={24} />} 
                label="Notebook"
              />
              <NavButton 
                active={activeScreen === 'leaderboard'} 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
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

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  const handleClick = () => {
    vibrate(15);
    onClick();
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex flex-col items-center gap-0.5 sm:gap-1 transition-all flex-shrink-0 ${active ? 'scale-105 sm:scale-110' : 'text-blue-900/30 hover:text-blue-900/50'}`}
      style={active ? { color: 'var(--accent-color)' } : {}}
    >
      <div className="scale-90 sm:scale-100">
        {icon}
      </div>
      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

function getLeagueColor(league: string) {
  switch (league) {
    case 'Bronze': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Silver': return 'text-slate-500 bg-slate-50 border-slate-200';
    case 'Gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Platinum': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
    case 'Diamond': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-blue-600 bg-blue-50 border-blue-200';
  }
}


function CountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{timeLeft}</span>;
}

function HomeScreen({ stats, onStartChallenge, isCompletedToday, dailyProgress, settings, history, onOpenGallery, dailyQuest, isPro, emergencyActive, customPlans = [], onStartCustomPlan, onDeleteCustomPlan, onOpenPlanBuilder, onOpenPlant, fcmToken, setupFCM, fcmError }: { 
  stats: UserStats, 
  onStartChallenge: () => void, 
  isCompletedToday: boolean,
  dailyProgress: DailyProgress,
  settings: UserSettings,
  history: DailyProgress[],
  onOpenGallery: () => void,
  dailyQuest: ChallengeStep | null,
  isPro: boolean,
  emergencyActive: boolean,
  customPlans?: CustomPlan[],
  onStartCustomPlan: (plan: CustomPlan) => void,
  onDeleteCustomPlan: (id: string) => void,
  onOpenPlanBuilder: () => void,
  onOpenPlant: () => void,
  fcmToken: string | null,
  setupFCM: () => void,
  fcmError: string | null
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
    vibrate(VIBRATION_PATTERNS.CLICK);
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
      <AnimatePresence>
        {emergencyActive && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.9 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.9 }}
            className="w-full max-w-md mx-auto overflow-hidden"
          >
            <div className="bg-red-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-2xl shadow-red-200 border-2 border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
              <div className="p-3 bg-white/20 rounded-2xl relative z-10">
                <AlertCircle size={28} className="animate-bounce" />
              </div>
              <div className="flex-1 relative z-10">
                <h4 className="font-black text-lg uppercase tracking-tight leading-none mb-1">Emergency! 🚨</h4>
                <p className="text-[10px] font-bold opacity-90 leading-tight">Your trophy is degrading! Finish a challenge now to get a Golden Trophy and stop the alarm!</p>
              </div>
              <button 
                onClick={onStartChallenge}
                className="px-5 py-3 bg-white text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-lg shadow-red-900/20 relative z-10"
              >
                Fix Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MascotAI stats={stats} settings={settings} />
      
      {/* Daily Quest Card */}
      {dailyQuest && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-2 border-yellow-400/30 bg-yellow-400/5 mb-8 w-full max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-200">
                <Star size={20} />
              </div>
              <div>
                <h3 className="font-black text-blue-900 leading-tight">Daily Quest</h3>
                <p className="text-[10px] text-blue-900/40 font-bold uppercase tracking-widest">Double Points! 🔥</p>
              </div>
            </div>
            {dailyProgress.dailyQuestDone && (
              <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Completed
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900/60">Complete the <span className="text-blue-900 uppercase">{dailyQuest}</span> challenge today!</p>
            {!dailyProgress.dailyQuestDone && (
              <button 
                onClick={onStartChallenge}
                className="bg-yellow-400 text-white px-4 py-2 rounded-xl font-black text-xs shadow-lg shadow-yellow-200 active:scale-95 transition-transform"
              >
                GO!
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Push Notification Onboarding Card */}
      {!fcmToken && !fcmError && Notification.permission !== 'denied' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl flex items-center gap-4 shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Bell size={24} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm uppercase tracking-tight">Never miss a streak! 🔔</h4>
              <p className="text-[10px] font-bold opacity-80 leading-tight">Enable notifications to get reminders and plant alerts even when the app is closed, bro!</p>
            </div>
            <button 
              onClick={setupFCM}
              className="px-4 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-50 active:scale-95 transition-all"
            >
              Enable
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 w-full">
        <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full" />
          <motion.div animate={mascotControls} className="w-56 h-56 lg:w-72 lg:h-72 relative z-10">
            <Mascot 
              className="w-full h-full drop-shadow-2xl" 
              mood={mascotMood}
              hat={settings.activeSkin}
              soundPack={settings.isDogSoundPackActive ? 'dog' : 'cat'}
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
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-blue-900/70">Ready for today?</h3>
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    onOpenPlant();
                  }}
                  className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 active:scale-90 transition-all flex items-center justify-center group"
                >
                  <Sprout size={24} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <Flame size={18} className="text-orange-500" />
                  <span>Streak: {stats.streak} (Best: {stats.bestStreak || stats.streak})</span>
                </div>
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <Star size={18} className="text-yellow-500" />
                  <span>{stats.xp || 0} XP</span>
                </div>
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black text-yellow-700 shadow-sm border border-yellow-600">
                    $
                  </div>
                  <span>{stats.coins || 0} coins</span>
                </div>
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <TrophyIcon size={18} className="text-emerald-500" />
                  <span>{dailyProgress.completionsCount}/{isPro ? (settings.challengeCountGoal || 999) : 3} Today</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 flex flex-col items-center gap-2 border-2 border-orange-100 bg-orange-50/30">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Flame size={20} />
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Streak</div>
                  <div className="text-xl font-black text-blue-900">{stats.streak}</div>
                  <div className="text-[8px] font-bold text-blue-900/40">+5 XP per day</div>
                </div>
              </div>
              <div className="glass-card p-4 flex flex-col items-center gap-2 border-2 border-yellow-100 bg-yellow-50/30">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-200">
                  <div className="font-black text-lg">$</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Coins</div>
                  <div className="text-xl font-black text-blue-900">{stats.coins || 0}</div>
                  <div className="text-[8px] font-bold text-blue-900/40">Earned: {stats.xp || 0} XP</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3)) return;
                vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                onStartChallenge();
              }}
              disabled={dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3)}
              className={`btn-primary w-full flex items-center justify-center gap-2 ${dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              {dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3)
                ? `Daily Limit Reached (${dailyProgress.completionsCount}/${isPro ? (settings.challengeCountGoal || 10) : 3}) 🏆` 
                : dailyProgress.completionsCount > 0 
                  ? `Start Challenge #${dailyProgress.completionsCount + 1} ✍️` 
                  : 'Start Today\'s Challenge ✍️'}
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                onOpenPlant();
              }}
              className="w-full flex items-center justify-between p-4 glass-card bg-emerald-50/30 border-2 border-emerald-100/50 hover:bg-emerald-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                  <Sprout size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-blue-900 leading-none">Your Plant</h4>
                  <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest mt-1">
                    {settings.plantState?.isDead ? "🥀 Restoration Required" : settings.plantState?.isThirsty ? "💧 Needs Water" : `🌿 Stage ${settings.plantState?.stage || 0} Growth`}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3) && (
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Resets in</p>
                <div className="flex items-center justify-center gap-2 text-blue-900 font-black">
                  <Clock size={14} className="text-blue-500" />
                  <CountdownToMidnight />
                </div>
              </div>
            )}
          </div>

          {/* Custom Plans Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest">Your Custom Plans</h3>
              <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-tighter">Unlimited</div>
                <button 
                  onClick={onOpenPlanBuilder}
                  className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Create New
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {customPlans.length === 0 ? (
                <div className="p-6 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                    <Target size={24} />
                  </div>
                  <p className="text-xs font-bold text-blue-900/30">No custom plans yet, bro. Create one to level up your routine!</p>
                </div>
              ) : (
                customPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${plan.color} text-white flex items-center justify-center shadow-lg shadow-blue-100`}>
                      <Target size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-blue-900">{plan?.name || "Unnamed Plan"}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">
                          {plan.challenges.length} Challenges • {plan.days.length} Days
                        </p>
                        {plan.reminderTime && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600">
                            <Clock size={8} />
                            <span className="text-[8px] font-black">{plan.reminderTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onDeleteCustomPlan(plan.id)}
                        className="p-2 text-red-500/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => onStartCustomPlan(plan)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xs shadow-lg shadow-blue-200 active:scale-95 transition-all"
                      >
                        START
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
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
    </motion.div>
  );
}






function ChallengeFlow({ step, setStep, customSteps, settings, setSettings, dailyProgress, setDailyProgress, stats, setStats, onFinish, onExit, earnedTrophyToday, showToast, play, dailyQuest }: { 
  step: ChallengeStep, 
  setStep: (s: ChallengeStep) => void, 
  customSteps?: ChallengeStep[],
  settings: UserSettings,
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void,
  dailyProgress: DailyProgress,
  setDailyProgress: (p: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress)) => void,
  stats: UserStats,
  setStats: (s: Partial<UserStats> | ((prev: UserStats) => UserStats)) => void,
  onFinish: (p?: DailyProgress) => void,
  onExit: () => void,
  earnedTrophyToday: boolean,
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void,
  play: (s: any) => void,
  dailyQuest: ChallengeStep | null
}) {
  const baseSteps: ChallengeStep[] = ['pushups', 'water', 'breathing', 'drawing', 'football', 'bubbles', 'memory', 'gratitude', 'reaction'];
  const defaultSteps: ChallengeStep[] = [...baseSteps, ...(settings.isPro ? ['writing' as ChallengeStep] : []), 'meditation' as ChallengeStep];
  const steps = customSteps || defaultSteps;
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const currentIdx = steps.indexOf(step as any);
  const progressLabel = step === 'completion' ? 'Done!' : `Challenge ${currentIdx + 1}/${steps.length}`;

  const saveChallenge = () => {
    setSettings(prev => ({
      ...prev,
      savedChallengeIds: [...(prev.savedChallengeIds || []), step]
    }));
    showToast('Challenge saved to library!');
  };

  const nextStep = (data?: any, skipped: boolean = false) => {
    if (!skipped && settings.soundEnabled) {
      play('continue');
    }
    if (!skipped) {
      showToast('Step Complete! Keep going, bro! 🔥', 'success');
    }
    const updates: Partial<DailyProgress> = {};
    if (step === 'pushups') updates.pushupsDone = !skipped;
    if (step === dailyQuest) updates.dailyQuestDone = !skipped;
    if (step === 'breathing') updates.breathingDone = true;
    if (step === 'drawing') {
      updates.drawingDone = true;
    }
    if (step === 'football') updates.footballDone = true;
    if (step === 'bubbles') updates.bubblesDone = true;
    if (step === 'memory') updates.memoryDone = true;
    if (step === 'gratitude') updates.gratitudeDone = true;
    if (step === 'reaction') updates.reactionDone = true;
    if (step === 'meditation') updates.meditationDone = true;
    if (step === 'writing') updates.writingDone = true;

    const finalProgress = { ...dailyProgress, ...updates };

    if (Object.keys(updates).length > 0) {
      setDailyProgress(finalProgress);
    }

    if (currentIdx < steps.length - 1) {
      setStep(steps[currentIdx + 1]);
    } else {
      onFinish(finalProgress);
    }
  };

  const handleBackClick = () => {
    if (step === 'completion') {
      onExit();
    } else {
      vibrate(VIBRATION_PATTERNS.CLICK);
      setShowExitConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#E0F2FF] to-[#F0E6FF] z-[100] flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-4xl flex flex-col min-h-screen">
        <header className="p-6 flex items-center justify-between">
          <button onClick={handleBackClick} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
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
                onSkip={() => nextStep(null, true)}
                activeSkin={settings.activeSkin}
                settings={settings}
                play={play}
              />
            )}
            {step === 'water' && (
              <WaterStep 
                goal={settings.waterGoal} 
                progress={dailyProgress.waterDrank}
                onUpdate={(val) => setDailyProgress({ ...dailyProgress, waterDrank: val })}
                onContinue={nextStep} 
                activeSkin={settings.activeSkin}
                settings={settings}
                play={play}
              />
            )}
            {step === 'breathing' && (
              <BreathingStep 
                onDone={nextStep} 
                activeSkin={settings.activeSkin}
                settings={settings}
              />
            )}
            {step === 'drawing' && (
              <DrawingStep 
                onFinish={nextStep} 
                onSave={(data) => {
                  setStats(prev => ({
                    ...prev,
                    drawings: [data, ...(prev.drawings || [])].slice(0, 20)
                  }));
                  showToast('Drawing saved to library!', 'success');
                }}
              />
            )}
            {step === 'football' && (
              <FootballStep 
                onFinish={nextStep} 
                activeSkin={settings.activeSkin}
                play={play}
                settings={settings}
              />
            )}
            {step === 'bubbles' && (
              <BubbleStep 
                onFinish={nextStep} 
              />
            )}
            {step === 'memory' && (
              <MemoryStep 
                onComplete={nextStep} 
              />
            )}
            {step === 'gratitude' && (
              <GratitudeStep 
                onComplete={nextStep} 
                onSave={(text) => {
                  setStats(prev => ({
                    ...prev,
                    gratitudeEntries: [
                      { id: Math.random().toString(36).substr(2, 9), text, date: new Date().toISOString() },
                      ...(prev.gratitudeEntries || [])
                    ]
                  }));
                }}
                showToast={showToast}
              />
            )}
            {step === 'reaction' && (
              <ReactionStep 
                onComplete={nextStep} 
              />
            )}
            {step === 'meditation' && (
              <MeditationStep 
                onDone={nextStep} 
                activeSkin={settings.activeSkin}
                settings={settings}
              />
            )}
            {step === 'writing' && (
              <WritingStep 
                onDone={nextStep} 
                activeSkin={settings.activeSkin}
                settings={settings}
              />
            )}
            {step === 'completion' && (
              <CompletionStep 
                onFinish={onExit} 
                streak={stats.streak || 0} 
                points={10} 
                xp={5}
                coins={15}
                showTrophy={earnedTrophyToday}
                settings={settings}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-sm p-8 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 shadow-lg shadow-red-200/50">
                <LogOut size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900 leading-tight">Wait, don't go! 🥺</h2>
                <p className="text-blue-900/60 font-medium">
                  If you quit now, you'll lose your progress for this session. Are you sure you want to stop?
                </p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    onExit();
                  }}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl hover:bg-red-700 transition-all active:scale-95"
                >
                  Quit Session
                </button>
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setShowExitConfirm(false);
                  }}
                  className="w-full py-4 bg-blue-100 text-blue-600 rounded-2xl font-black hover:bg-blue-200 transition-all active:scale-95"
                >
                  Keep Going! ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PushupsStep({ goal, onDone, onSkip, activeSkin = 'none', settings, play }: { goal: number, onDone: () => void, onSkip: () => void, activeSkin?: string, settings: UserSettings, play: (s: string) => void }) {
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
      >
        <div className="w-full max-w-[300px]">
          <PushupMascot className="drop-shadow-2xl grayscale opacity-60" />
        </div>
        
        <div className="glass-card w-full p-10 text-center space-y-8 border-red-200 bg-red-50/50">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-red-500" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-red-900/80">Challenge Failed</h2>
            <p className="text-red-900/50 font-medium">You skipped the push-ups. No trophy will be awarded for this session.</p>
          </div>

          <button 
            onClick={() => onSkip()} 
            className="btn-primary w-full bg-red-500 hover:bg-red-600 border-none shadow-red-200"
          >
            Continue Anyway
          </button>
        </div>
      </motion.div>
    );
  }

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
          {isReady && <HappyMascot size={32} hat={activeSkin} settings={settings} />}
          {!isReady ? (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setIsReady(true);
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              I'm Done! 💪
            </button>
          ) : (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onDone();
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
          <button 
            onClick={() => { 
              vibrate(VIBRATION_PATTERNS.CLICK); 
              if (settings.soundEnabled) {
                play('losing'); 
              }
              setFailed(true);
            }} 
            className="btn-secondary w-full"
          >
            Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function WaterStep({ goal, progress, onUpdate, onContinue, activeSkin = 'none', settings, play }: { goal: number, progress: number, onUpdate: (v: number) => void, onContinue: () => void, activeSkin?: string, settings: UserSettings, play: (s: string) => void }) {
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
          {isFinished && <HappyMascot size={40} hat={activeSkin} settings={settings} />}
          {!isFinished ? (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                if (settings.soundEnabled) {
                  play('water');
                }
                onUpdate(progress + 1);
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Drink +1 💧
            </button>
          ) : (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onContinue();
              }} 
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

function BreathingStep({ onDone, activeSkin = 'none', settings }: { onDone: () => void, activeSkin?: string, settings: UserSettings }) {
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
      vibrate(10);
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
          {isFinished && <HappyMascot size={40} hat={activeSkin} settings={settings} />}
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
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onDone();
              }} 
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

function DrawingStep({ onFinish, onSave }: { onFinish: (data: string) => void, onSave: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3B82F6');
  const [tool, setTool] = useState<'pencil' | 'pen' | 'brush' | 'bucket'>('pen');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const lastPoint = useRef<{ x: number, y: number } | null>(null);
  const lastMidPoint = useRef<{ x: number, y: number } | null>(null);

  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#000000', // Black
    '#FFFFFF', // White
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const getPixel = (x: number, y: number) => {
      const i = (y * canvas.width + x) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    };

    const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
      const i = (y * canvas.width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    };

    const targetColor = getPixel(startX, startY);
    const fillRGB = hexToRgb(fillColor);
    if (!fillRGB) return;

    if (colorsMatch(targetColor, [fillRGB.r, fillRGB.g, fillRGB.b, 255])) return;

    const stack: [number, number][] = [[startX, startY]];
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      let curX = x;
      while (curX >= 0 && colorsMatch(getPixel(curX, y), targetColor)) {
        curX--;
      }
      curX++;
      let reachAbove = false;
      let reachBelow = false;
      while (curX < canvas.width && colorsMatch(getPixel(curX, y), targetColor)) {
        setPixel(curX, y, fillRGB.r, fillRGB.g, fillRGB.b);
        if (y > 0) {
          if (colorsMatch(getPixel(curX, y - 1), targetColor)) {
            if (!reachAbove) {
              stack.push([curX, y - 1]);
              reachAbove = true;
            }
          } else {
            reachAbove = false;
          }
        }
        if (y < canvas.height - 1) {
          if (colorsMatch(getPixel(curX, y + 1), targetColor)) {
            if (!reachBelow) {
              stack.push([curX, y + 1]);
              reachBelow = true;
            }
          } else {
            reachBelow = false;
          }
        }
        curX++;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const colorsMatch = (c1: number[], c2: number[]) => {
    const threshold = 15;
    return Math.abs(c1[0] - c2[0]) < threshold &&
           Math.abs(c1[1] - c2[1]) < threshold &&
           Math.abs(c1[2] - c2[2]) < threshold &&
           Math.abs(c1[3] - c2[3]) < threshold;
  };

  const startDrawing = (e: any) => {
    vibrate(5);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    if (tool === 'bucket') {
      floodFill(Math.floor(x), Math.floor(y), color);
      setHasDrawn(true);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    lastPoint.current = { x, y };
    lastMidPoint.current = { x, y };
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: any) => {
    if (!isDrawing || tool === 'bucket') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    if (lastPoint.current && lastMidPoint.current) {
      const midPoint = {
        x: (lastPoint.current.x + x) / 2,
        y: (lastPoint.current.y + y) / 2
      };
      
      ctx.beginPath();
      ctx.moveTo(lastMidPoint.current.x, lastMidPoint.current.y);
      ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midPoint.x, midPoint.y);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === 'pencil' ? 2 : tool === 'pen' ? 8 : 24;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      lastPoint.current = { x, y };
      lastMidPoint.current = midPoint;
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
    lastMidPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
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
              onClick={() => {
                vibrate(10);
                setTool('pencil');
              }}
              className={`p-2 rounded-md transition-all ${tool === 'pencil' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400 hover:bg-blue-50'}`}
              title="Pencil"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => {
                vibrate(10);
                setTool('pen');
              }}
              className={`p-2 rounded-md transition-all ${tool === 'pen' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400 hover:bg-blue-50'}`}
              title="Pen"
            >
              <Pen size={20} />
            </button>
            <button
              onClick={() => {
                vibrate(10);
                setTool('brush');
              }}
              className={`p-2 rounded-md transition-all ${tool === 'brush' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400 hover:bg-blue-50'}`}
              title="Brush"
            >
              <Palette size={20} />
            </button>
            <button
              onClick={() => {
                vibrate(10);
                setTool('bucket');
              }}
              className={`p-2 rounded-md transition-all ${tool === 'bucket' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400 hover:bg-blue-50'}`}
              title="Bucket Fill"
            >
              <PaintBucket size={20} />
            </button>
          </div>

          <div className="h-8 w-px bg-blue-200 mx-2" />

          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  vibrate(10);
                  setColor(c);
                }}
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
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                const drawing = saveDrawing();
                onSave(drawing);
                setIsSaved(true);
              }} 
              disabled={!hasDrawn || isSaved}
              className={`flex-1 py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all ${(!hasDrawn || isSaved) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaved ? 'Saved! ✨' : 'Save to Library'} <Save size={18} />
            </button>
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                const drawing = saveDrawing();
                onFinish(drawing);
              }} 
              disabled={!hasDrawn}
              className={`flex-[2] btn-primary flex items-center justify-center gap-2 ${!hasDrawn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Finish Masterpiece <CheckCircle2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompletionStep({ onFinish, streak, points, xp, coins, showTrophy, settings }: { onFinish: () => void, streak: number, points: number, xp: number, coins: number, showTrophy: boolean, settings: UserSettings }) {
  useEffect(() => {
    if (showTrophy) {
      vibrate(VIBRATION_PATTERNS.TROPHY);
      if (settings.soundEnabled) {
        playTrophySound('golden');
      }
    }
  }, [showTrophy, settings.soundEnabled]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto w-full"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-black text-blue-900 tracking-tighter">PLAN COMPLETE!</h2>
          <p className="text-lg text-blue-900/40 font-bold">You're unstoppable! 🔥</p>
        </motion.div>
      </div>

      {showTrophy && (
        <div className="w-full max-w-[200px]">
          <GoldenTrophy />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="glass-card p-4 text-center border-emerald-100 bg-emerald-50/30">
          <div className="text-2xl font-black text-emerald-500">+{points}</div>
          <div className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Points</div>
        </div>
        <div className="glass-card p-4 text-center border-orange-100 bg-orange-50/30">
          <div className="text-2xl font-black text-orange-500">{streak}</div>
          <div className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Day Streak</div>
        </div>
        <div className="glass-card p-4 text-center border-blue-100 bg-blue-50/30">
          <div className="text-2xl font-black text-blue-500">+5</div>
          <div className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Bonus XP</div>
        </div>
        <div className="glass-card p-4 text-center border-yellow-100 bg-yellow-50/30">
          <div className="text-2xl font-black text-yellow-500">+15</div>
          <div className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Coins</div>
        </div>
      </div>

      <button 
        onClick={() => {
          vibrate(VIBRATION_PATTERNS.CLICK);
          onFinish();
        }}
        className="btn-primary w-full py-5 text-lg shadow-2xl shadow-blue-500/20"
      >
        Back to Home ✨
      </button>
    </motion.div>
  );
}

function FootballStep({ onFinish, activeSkin = 'none', play, settings }: { onFinish: () => void, activeSkin?: string, play: (s: string) => void, settings: UserSettings }) {
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
    vibrate(10);
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
          vibrate([20, 50, 20]);
          setScore(s => s + 1);
          setScoredBalls(prev => [...prev, { x: targetX, y: targetY }]);
        } else {
          vibrate(15);
          // Only play losing sound if we haven't lost the whole game yet
          // The game-over losing sound will play when Try Again appears
          if ((ballsLeft > 1 || score >= 4) && settings.soundEnabled) {
             play('losing');
          }
        }

        setBallsLeft(b => b - 1);
        setTimeout(reset, 1200);
      }
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (ballsLeft === 0 && !isFlying && score < 5 && settings.soundEnabled) {
      play('losing');
    }
  }, [ballsLeft, isFlying, score, play, settings.soundEnabled]);

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
            <HappyMascot size={40} hat={activeSkin} settings={settings} />
            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onFinish();
              }}
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
    vibrate(VIBRATION_PATTERNS.CLICK);
    playPopSound();
    setBubbles(prev => prev.filter(b => b.id !== id));
    setPoppedCount(prev => prev + 1);
  };

  useEffect(() => {
    if (poppedCount >= 20) {
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      playPopSound();
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
            <button onClick={() => { vibrate(VIBRATION_PATTERNS.SUCCESS); onFinish(); }} className="btn-primary w-full mt-4">
              Finish Today's Flow! ✨
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function MemoryStep({ onComplete }: { onComplete: () => void }) {
  const [cards, setCards] = useState<{ id: number, emoji: string, flipped: boolean, matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const emojis = ['💧', '🍎', '🏃', '🧘', '⚽', '🎨'];

  useEffect(() => {
    const initialCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(initialCards);
  }, []);

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || cards[id].matched || cards[id].flipped) return;
    vibrate(10);
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    setFlipped([...flipped, id]);

    if (flipped.length === 1) {
      const firstId = flipped[0];
      if (cards[firstId].emoji === cards[id].emoji) {
        newCards[firstId].matched = true;
        newCards[id].matched = true;
        setCards(newCards);
        setFlipped([]);
        if (newCards.every(c => c.matched)) {
          vibrate(VIBRATION_PATTERNS.SUCCESS);
          setTimeout(onComplete, 1000);
        }
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstId].flipped = false;
          resetCards[id].flipped = false;
          setCards(resetCards);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-blue-900 mb-2">Memory Match</h2>
        <p className="text-blue-600 font-medium">Keep your brain sharp!</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-md transition-all ${
              card.flipped || card.matched ? 'bg-white' : 'bg-blue-500 text-transparent'
            }`}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function GratitudeStep({ onComplete, onSave, showToast }: { onComplete: () => void, onSave: (text: string) => void, showToast: (msg: string, type?: 'success' | 'info' | 'error') => void }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (text.trim().length < 3) return;
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    setSubmitted(true);
    setTimeout(onComplete, 2000);
  };

  const handleSave = () => {
    if (text.trim().length < 3) return;
    vibrate(VIBRATION_PATTERNS.CLICK);
    onSave(text);
    showToast('Saved to your Gratitude Library!');
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xs mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-blue-900 mb-2">Gratitude Jar</h2>
        <p className="text-blue-600 font-medium">What's one good thing today?</p>
      </div>
      <div className="relative w-full aspect-square bg-blue-50 rounded-3xl border-4 border-blue-200 flex items-center justify-center p-6 overflow-hidden">
        <AnimatePresence>
          {!submitted ? (
            <motion.div exit={{ y: -100, opacity: 0 }} className="w-full">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="I am grateful for..."
                className="w-full h-32 bg-white rounded-xl p-4 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-medium"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  disabled={text.trim().length < 3}
                  className="p-3 bg-amber-100 text-amber-600 rounded-xl font-bold shadow-sm disabled:opacity-50"
                  title="Save to Library"
                >
                  <Save size={24} />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={text.trim().length < 3}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                >
                  Drop in Jar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">✨</div>
              <p className="text-blue-900 font-bold">Saved to your jar!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReactionStep({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<'waiting' | 'ready' | 'clicked' | 'too-soon'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const timerRef = useRef<any>(null);

  const startTest = () => {
    setState('waiting');
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
      vibrate(50);
    }, delay);
  };

  useEffect(() => {
    startTest();
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleClick = () => {
    if (state === 'waiting') {
      clearTimeout(timerRef.current);
      setState('too-soon');
      vibrate(VIBRATION_PATTERNS.ERROR);
    } else if (state === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setState('clicked');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      setTimeout(onComplete, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <h2 className="text-2xl font-black text-blue-900 mb-2">Reaction Test</h2>
        <p className="text-blue-600 font-medium">Tap when it turns GREEN!</p>
      </div>
      <button
        onClick={handleClick}
        className={`w-full aspect-square rounded-3xl flex flex-col items-center justify-center transition-colors duration-75 shadow-xl ${
          state === 'waiting' ? 'bg-blue-100' :
          state === 'ready' ? 'bg-green-500' :
          state === 'too-soon' ? 'bg-red-500' : 'bg-blue-500'
        }`}
      >
        {state === 'waiting' && <p className="text-blue-400 font-bold text-xl">Wait...</p>}
        {state === 'ready' && <p className="text-white font-black text-4xl animate-pulse">TAP!</p>}
        {state === 'too-soon' && (
          <div className="text-center text-white">
            <p className="font-black text-2xl mb-2">Too soon!</p>
            <button onClick={startTest} className="px-4 py-2 bg-white/20 rounded-lg font-bold">Try Again</button>
          </div>
        )}
        {state === 'clicked' && (
          <div className="text-center text-white">
            <p className="font-black text-4xl mb-2">{reactionTime}ms</p>
            <p className="font-bold">Great reflexes!</p>
          </div>
        )}
      </button>
    </div>
  );
}





function MeditationStep({ onDone, activeSkin = 'none', settings }: { onDone: () => void, activeSkin?: string, settings: UserSettings }) {
  const duration = settings.isPro ? 60 : 30;
  const [timer, setTimer] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const isFinished = timer <= 0;

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[300px]">
        <BreathingMascot phase={isActive ? 'In' : 'Out'} className={`drop-shadow-2xl transition-all duration-1000 ${isActive ? 'scale-110' : 'scale-100'}`} />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8 border-purple-200 bg-purple-50/30">
        <div className="space-y-4">
          {settings.isPro && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
              <Crown size={12} /> Pro Challenge
            </div>
          )}
          <h2 className="text-3xl font-bold text-purple-900/80">Deep Meditation</h2>
          <p className="text-purple-900/50 font-medium">Clear your mind for {duration} seconds</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-black text-purple-600 tabular-nums">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>

          {isFinished ? (
            <div className="space-y-4 w-full">
              <HappyMascot size={40} hat={activeSkin} settings={settings} />
              <button 
                onClick={onDone} 
                className="btn-primary w-full bg-purple-500 hover:bg-purple-600 border-none"
              >
                Continue <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setIsActive(!isActive);
              }} 
              className={`btn-primary w-full ${isActive ? 'bg-purple-200 text-purple-600 border-none' : 'bg-purple-500 hover:bg-purple-600 border-none'}`}
            >
              {isActive ? 'Pause' : 'Start Meditation'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function WritingStep({ onDone, activeSkin = 'none', settings }: { onDone: () => void, activeSkin?: string, settings: UserSettings }) {
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const prompts = [
    "What's one thing you're proud of today?",
    "Describe your perfect morning routine.",
    "What's a goal you're working towards?",
    "Write about a person who inspires you.",
    "What's a lesson you've learned recently?"
  ];

  useEffect(() => {
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[250px]">
        <ArtistMascot className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-8 space-y-6 border-blue-200 bg-blue-50/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
            <Crown size={12} /> Pro Challenge
          </div>
          <h2 className="text-2xl font-bold text-blue-900/80">Creative Writing</h2>
          <p className="text-blue-900/60 font-medium italic">"{prompt}"</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-40 bg-white/80 rounded-xl p-4 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-medium border border-blue-100 shadow-sm"
        />

        <button 
          onClick={() => {
            vibrate(VIBRATION_PATTERNS.SUCCESS);
            onDone();
          }} 
          disabled={text.trim().length < 10}
          className="btn-primary w-full bg-blue-500 hover:bg-blue-600 border-none disabled:opacity-50"
        >
          Finish Writing ✨
        </button>
      </div>
    </motion.div>
  );
}
