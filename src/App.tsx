import React, { useState, useEffect, useRef } from 'react';
import { Home, BarChart2, User, CheckCircle2, Droplets, Wind, Palette, Flame, Star, ChevronRight, ChevronLeft, Settings, X, Pen, Pencil, Eraser, Trophy as TrophyIcon, Zap, Brain, Heart, Target, Camera, Upload, Bell, Volume2, Download, Trash2, Save, PaintBucket, MessageSquare, Music, Image as ImageIcon, Sparkles, BrainCircuit, Smile, LogOut, Send, Book, RefreshCw, AlertCircle, Trophy, Award, Users, Crown, Info } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserSettings, UserStats, DailyProgress, Screen, ChallengeStep, Trophy as TrophyType, MascotMood } from './types';
import { format, subDays, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { auth, db, messaging, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, getDocFromServer, deleteDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Mascot } from './components/Mascot';
import { ArtistMascot } from './components/ArtistMascot';
import { BreathingMascot } from './components/BreathingMascot';
import { PushupMascot } from './components/PushupMascot';
import { WaterMascot } from './components/WaterMascot';
import { WritingMascot } from './components/WritingMascot';
import { GoldenTrophy, IceTrophy, BrokenTrophy } from './components/Trophies';
import { LibraryScreen } from './components/LibraryScreen';
import { ShopScreen, SHOP_ITEMS } from './components/ShopScreen';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { vibrate, VIBRATION_PATTERNS } from './lib/vibrate';

function playTrophySound(type: string) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'triangle';
    if (type === 'golden') {
      osc.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6
    } else if (type === 'ice') {
      osc.frequency.setValueAtTime(329.63, audioContext.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(164.81, audioContext.currentTime + 0.3); // E3
    } else {
      osc.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4
      osc.frequency.exponentialRampToValueAtTime(130.81, audioContext.currentTime + 0.3); // C3
    }

    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.error('Trophy sound error:', e);
  }
}

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

function Calendar({ history }: { history: DailyProgress[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest">Activity Calendar</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subDays(monthStart, 1))} className="p-1 hover:bg-blue-50 rounded-md text-blue-400">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-blue-900/60 min-w-[100px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentDate(subDays(monthEnd, -1))} className="p-1 hover:bg-blue-50 rounded-md text-blue-400">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[10px] font-black text-blue-900/20 text-center py-2">{d}</div>
        ))}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayData = history.find(h => h.date === dateStr);
          const isToday = isSameDay(day, new Date());
          return (
            <div 
              key={dateStr}
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                dayData?.completed 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : isToday 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-blue-900/30 hover:bg-blue-50/50'
              }`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsCharts({ history }: { history: DailyProgress[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = history.find(h => h.date === dateStr);
    return {
      name: format(date, 'EEE'),
      water: dayData?.waterDrank || 0,
    };
  });

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest mb-6">Hydration Stats</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 800, fill: '#1e3a8a', opacity: 0.3 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="water" radius={[4, 4, 0, 0]}>
              {last7Days.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.water >= 2 ? '#10b981' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HappyMascot({ size = 32, hat = 'none' }: { size?: number, hat?: string }) {
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
        <Mascot className="w-full h-full drop-shadow-lg" hat={hat} />
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
  activeHat: 'none',
  activeSkin: 'none',
  zenModeEnabled: false,
  challengeCountGoal: 3,
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
      const apiKey = typeof process !== 'undefined' ? process?.env?.GEMINI_API_KEY : undefined;
      if (!apiKey) throw new Error("API Key missing");
      
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      const prompt = `You are Nexora, a friendly water-bottle mascot for a productivity and wellness app. 
      The user says: "${userMsg}"
      Respond as Nexora. Be friendly, helpful, and encouraging. 
      Keep it short (max 2-3 sentences). 
      User stats: Streak ${stats.streak}, Points ${stats.totalPoints}, Level ${stats.level || 1}.
      Your current outfit is: ${settings.activeSkin || 'none'}.`;
      
      const result = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });
      setResponse(result.text || "I'm here for you, bro! 🌊");
    } catch (error) {
      setResponse("I'm a bit parched right now, but I'm still cheering for you! 🚀");
    } finally {
      setLoading(false);
    }
  };

  const generateMotivation = async () => {
    setLoading(true);
    try {
      const apiKey = typeof process !== 'undefined' ? process?.env?.GEMINI_API_KEY : undefined;
      if (!apiKey) {
        throw new Error("API Key missing");
      }
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      const prompt = `You are Nexora, a friendly water-bottle mascot for a productivity and wellness app. 
      The user's current streak is ${stats.streak} days. 
      Their total points are ${stats.totalPoints}.
      They have ${stats.trophies.length} trophies.
      Give them a short, punchy, and super friendly motivational message (max 2 sentences). 
      Be encouraging and maybe a bit bubbly!`;
      
      const result = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });
      setResponse(result.text || "You're doing great, bro! Keep that streak alive! 🌊");
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

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [challengeStep, setChallengeStep] = useState<ChallengeStep>('pushups');
  const [viewingTrophy, setViewingTrophy] = useState<TrophyType | null>(null);
  const [settings, setSettings] = useLocalStorage<UserSettings>('nexora_settings', DEFAULT_SETTINGS);
  const [stats, setStats] = useLocalStorage<UserStats>('nexora_stats', DEFAULT_STATS);
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [earnedTrophyToday, setEarnedTrophyToday] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const [dailyQuest, setDailyQuest] = useState<ChallengeStep | null>(null);

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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmError, setFcmError] = useState<string | null>(null);
  
  // Version Update Logic
  const [updateInfo, setUpdateInfo] = useState<{ version: string, releaseNotes: string[], forceUpdate: boolean, imageUrl?: string } | null>(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const currentAppVersion = "1.2.1"; // Current hardcoded version

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Use cache: 'no-store' to ensure we get the latest file from the server
        const response = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          const dismissedVersion = localStorage.getItem('nexora_dismissed_version');
          
          if (data.version !== currentAppVersion && dismissedVersion !== data.version) {
            console.log('New version detected:', data.version);
            setUpdateInfo(data);
            setShowUpdatePopup(true);
          }
        }
      } catch (error) {
        console.error('Error checking version:', error);
      }
    };

    // Check immediately on mount
    checkVersion();

    // Check every 5 minutes
    const interval = setInterval(checkVersion, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    vibrate(50);
    if (updateInfo) {
      localStorage.setItem('nexora_dismissed_version', updateInfo.version);
    }
    window.location.reload();
  };
  
  const today = new Date().toISOString().split('T')[0];
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
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
            setIsPro(!!userDoc.data().isPro);
          }
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.GET, path);
          } catch (e) {
            console.error("Firestore error handled:", e);
          }
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
    const nextCompletionsCount = dailyProgress.completionsCount + 1;
    const canAwardTrophy = nextCompletionsCount <= 3;
    
    if (canAwardTrophy) {
      console.log(`Awarding trophy for completion #${nextCompletionsCount} today!`);
      if (settings.soundEnabled) playTrophySound('golden');
      setEarnedTrophyToday(true);
    } else {
      console.log("Already reached 3 completions today, no more trophies.");
      setEarnedTrophyToday(false);
    }

    setStats((prevStats) => {
      const isDailyQuest = challengeStep === dailyQuest;
      const pointsToAdd = isDailyQuest ? 20 : 10;
      const oldLevel = Math.floor((prevStats.totalPoints || 0) / 100) + 1;
      const newPoints = (prevStats.totalPoints || 0) + pointsToAdd;
      const newLevel = Math.floor(newPoints / 100) + 1;

      if (newLevel > oldLevel) {
        setShowLevelUp(newLevel);
      }

      const newStats = {
        ...prevStats,
        totalPoints: newPoints,
        level: newLevel,
        pointsByCategory: {
          physical: (prevStats.pointsByCategory?.physical || 0) + (isDailyQuest ? 8 : 4),
          mental: (prevStats.pointsByCategory?.mental || 0) + (isDailyQuest ? 8 : 4),
          creative: (prevStats.pointsByCategory?.creative || 0) + (isDailyQuest ? 4 : 2),
        }
      };

      // Update Leaderboard
      if (user) {
        const leaderboardRef = doc(db, 'leaderboard', user.uid);
        setDoc(leaderboardRef, {
          uid: user.uid,
          displayName: settings.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          streak: newStats.streak || 0,
          totalPoints: newStats.totalPoints,
          level: newLevel
        }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'leaderboard'));
      }

      // Streak logic (only on first completion of the day)
      if (stats.lastCompletedDate !== today) {
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
      }

      // Award Golden Trophy if within daily limit
      if (canAwardTrophy) {
        const newTrophy: TrophyType = {
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
      completionsCount: nextCompletionsCount,
      dailyQuestDone: dailyProgress.dailyQuestDone || (challengeStep === dailyQuest),
      // Reset tasks for the next run if under limit
      pushupsDone: false,
      waterDrank: 0,
      breathingDone: false,
      drawingDone: false,
      footballDone: false,
      bubblesDone: false
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
                <Mascot className="w-12 h-12" hat={settings.activeSkin} />
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
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveScreen('subscription')}
                className={`flex items-center gap-1 p-2 transition-colors ${activeScreen === 'subscription' ? 'text-amber-500' : 'text-amber-500/60 hover:text-amber-500'}`}
              >
                <Crown size={24} />
                <span className="font-bold text-xs">Pro</span>
              </button>
              <button 
                onClick={() => setActiveScreen('profile')}
                className={`p-2 transition-colors ${activeScreen === 'profile' ? 'text-blue-600' : 'text-blue-900/40 hover:text-blue-900/60'}`}
              >
                {settings.profilePic ? (
                  <img src={settings.profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
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
                <ProgressScreen stats={stats} history={history} settings={settings} setSettings={setSettings} />
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
                <ProfileScreen settings={settings} setSettings={setSettings} stats={stats} user={user} />
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
                <SettingsScreen 
                  settings={settings} 
                  setSettings={setSettings} 
                  isPro={isPro}
                  onBack={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('home');
                  }} 
                  onLogout={handleLogout} 
                  fcmToken={fcmToken} 
                  fcmError={fcmError}
                  onRetryFCM={setupFCM}
                />
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
                  purchasedItems={settings.purchasedItems || []}
                  isPro={isPro}
                  onBuy={(item) => {
                    vibrate(VIBRATION_PATTERNS.SUCCESS);
                    
                    const newItem: any = {
                      id: `${item.id}-${Date.now()}`,
                      itemId: item.id,
                      name: item.name,
                      icon: item.icon,
                      activated: false,
                      type: item.effect === 'skin' ? 'skin' : item.effect === 'gift' ? 'gift' : 'power-up',
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
                      inventory: [...(prev.inventory || []), newItem, ...bonusItems]
                    }));

                    setStats(prev => ({
                      ...prev,
                      streak: prev.streak - item.price
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
                className="w-full"
              >
                <SubscriptionScreen onBack={() => setActiveScreen('home')} />
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
                  onActivate={(id) => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setSettings(prev => {
                      const inventory = (prev.inventory || []).map(item => {
                        if (item.id === id) {
                          return { ...item, activated: true };
                        }
                        // If it's a skin, deactivate other skins
                        if (item.type === 'skin' && (prev.inventory?.find(i => i.id === id)?.type === 'skin')) {
                          return { ...item, activated: false };
                        }
                        return item;
                      });
                      
                      const activeItem = inventory.find(i => i.id === id);
                      let activeSkin = prev.activeSkin;
                      if (activeItem?.type === 'skin') {
                        activeSkin = activeItem.itemId.replace('skin-', '');
                      }

                      return { ...prev, inventory, activeSkin };
                    });
                  }}
                  onDeactivate={(id) => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setSettings(prev => {
                      const inventory = (prev.inventory || []).map(item => {
                        if (item.id === id) {
                          return { ...item, activated: false };
                        }
                        return item;
                      });
                      
                      const activeItem = prev.inventory?.find(i => i.id === id);
                      let activeSkin = prev.activeSkin;
                      if (activeItem?.type === 'skin') {
                        activeSkin = 'none';
                      }

                      return { ...prev, inventory, activeSkin };
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
                <GalleryScreen 
                  stats={stats} 
                  onBack={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('home');
                  }} 
                />
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
                <NotebookScreen 
                  stats={stats} 
                  setStats={setStats}
                  onBack={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('home');
                  }} 
                  showToast={showToast}
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
                  settings={settings}
                  setSettings={setSettings}
                  dailyProgress={dailyProgress}
                  setDailyProgress={setDailyProgress}
                  stats={stats}
                  setStats={setStats}
                  onFinish={handleCompleteChallenge}
                  onExit={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setActiveScreen('home');
                  }}
                  earnedTrophyToday={earnedTrophyToday}
                  showToast={showToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {activeScreen !== 'challenge' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 flex justify-center pointer-events-none">
            <nav className="glass-card px-4 py-3 sm:px-8 sm:py-4 flex items-center gap-4 sm:gap-12 pointer-events-auto">
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
      className={`flex flex-col items-center gap-0.5 sm:gap-1 transition-all ${active ? 'scale-105 sm:scale-110' : 'text-blue-900/30 hover:text-blue-900/50'}`}
      style={active ? { color: 'var(--accent-color)' } : {}}
    >
      <div className="scale-90 sm:scale-100">
        {icon}
      </div>
      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function HomeScreen({ stats, onStartChallenge, isCompletedToday, dailyProgress, settings, history, onOpenGallery, dailyQuest, isPro }: { 
  stats: UserStats, 
  onStartChallenge: () => void, 
  isCompletedToday: boolean,
  dailyProgress: DailyProgress,
  settings: UserSettings,
  history: DailyProgress[],
  onOpenGallery: () => void,
  dailyQuest: ChallengeStep | null,
  isPro: boolean
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

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 w-full">
        <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full" />
          <motion.div animate={mascotControls} className="w-56 h-56 lg:w-72 lg:h-72 relative z-10">
            <Mascot 
              className="w-full h-full drop-shadow-2xl" 
              mood={mascotMood}
              hat={settings.activeSkin}
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
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <TrophyIcon size={18} className="text-emerald-500" />
                  <span>{dailyProgress.completionsCount}/{isPro ? (settings.challengeCountGoal || 999) : 3} Today</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 999) : 3)) return;
                vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                onStartChallenge();
              }}
              disabled={dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 999) : 3)}
              className={`btn-primary w-full flex items-center justify-center gap-2 ${dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 999) : 3) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              {dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 999) : 3)
                ? `Daily Limit Reached (${dailyProgress.completionsCount}/${isPro ? (settings.challengeCountGoal || 999) : 3}) 🏆` 
                : dailyProgress.completionsCount > 0 
                  ? `Start Challenge #${dailyProgress.completionsCount + 1} ✍️` 
                  : 'Start Today\'s Challenge ✍️'}
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
    </motion.div>
  );
}

function ProgressScreen({ stats, history, settings, setSettings }: { stats: UserStats, history: DailyProgress[], settings: UserSettings, setSettings: (s: UserSettings) => void }) {
  const handleTrophyClick = (type: any) => {
    vibrate(VIBRATION_PATTERNS.TROPHY);
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
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.CLICK);
              fileInputRef.current?.click();
            }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    vibrate(VIBRATION_PATTERNS.SUCCESS);
                    handleSaveName();
                  }
                }}
              />
              <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                  handleSaveName();
                }} 
                className="p-2 text-white rounded-lg"
                style={{ backgroundColor: settings.themeColor }}
              >
                <Save size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl font-black text-blue-900">{settings.displayName}</h2>
              <button onClick={() => { vibrate(VIBRATION_PATTERNS.CLICK); setIsEditingName(true); }} className="p-1 text-blue-900/30 hover:text-blue-900/60">
                <Pen size={18} />
              </button>
            </div>
          )}
          <p className="text-blue-900/40 font-medium tracking-wide uppercase text-xs">Nexora Member Since March 2026</p>
        </div>
      </div>

      {/* Mascot Wardrobe */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-blue-900/40 uppercase tracking-widest px-4">Mascot Wardrobe</h3>
        <div className="glass-card p-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setSettings({ ...settings, activeSkin: 'none' });
              }}
              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${
                settings.activeSkin === 'none' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-slate-50'
              }`}
            >
              🚫
            </button>
            {(settings.purchasedItems || []).filter(id => id.startsWith('skin-')).map(skinId => {
              const skinName = skinId.replace('skin-', '');
              const icon = SHOP_ITEMS.find(i => i.id === skinId)?.icon || '✨';
              return (
                <button
                  key={skinId}
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setSettings({ ...settings, activeSkin: skinName });
                  }}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${
                    settings.activeSkin === skinName ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-slate-50'
                  }`}
                >
                  {icon}
                </button>
              );
            })}
          </div>
          {(!settings.purchasedItems || settings.purchasedItems.filter(id => id.startsWith('skin-')).length === 0) && (
            <p className="text-center text-blue-900/40 font-medium py-4">
              Visit the shop to unlock mascot skins! 🛍️
            </p>
          )}
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

function SettingsScreen({ settings, setSettings, isPro, onBack, onLogout, fcmToken, fcmError, onRetryFCM }: { 
  settings: UserSettings, 
  setSettings: (s: UserSettings) => void, 
  isPro: boolean,
  onBack: () => void, 
  onLogout: () => Promise<void>,
  fcmToken: string | null,
  fcmError: string | null,
  onRetryFCM: () => void
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const handleRemoveAccount = async () => {
    if (!auth.currentUser) return;
    
    setIsRemoving(true);
    setRemoveError(null);
    
    try {
      const user = auth.currentUser;
      const uid = user.uid;
      
      // 1. Try to delete Auth account first (this is the most sensitive and likely to fail)
      try {
        await deleteUser(user);
      } catch (error: any) {
        // If it requires recent login, try to re-authenticate automatically for Google users
        if (error.code === 'auth/requires-recent-login') {
          const provider = new GoogleAuthProvider();
          try {
            await reauthenticateWithPopup(user, provider);
            // After re-auth, try deleting again
            await deleteUser(user);
          } catch (reauthError: any) {
            console.error('Re-authentication failed:', reauthError);
            setRemoveError('For security, please sign out and sign back in, then try deleting again immediately.');
            setIsRemoving(false);
            return;
          }
        } else {
          throw error;
        }
      }
      
      // 2. Delete Firestore data (main user doc and known subcollections)
      // We do this AFTER auth deletion because if auth deletion fails, we don't want to orphan the data
      // although usually it's the other way around. But here, auth deletion is the blocker.
      try {
        await deleteDoc(doc(db, 'users', uid));
        await deleteDoc(doc(db, 'users', uid, 'stats', 'main'));
        await deleteDoc(doc(db, 'users', uid, 'shop', 'purchases'));
        await deleteDoc(doc(db, 'users', uid, 'library', 'trophies'));
      } catch (fsError: any) {
        console.error('Firestore deletion failed:', fsError);
      }
      
      // 3. Clear local storage
      localStorage.clear();
      
      // 4. Reload or redirect
      window.location.reload();
    } catch (error: any) {
      console.error('Error removing account:', error);
      if (error.code === 'auth/requires-recent-login') {
        setRemoveError('For security, this action requires a recent login. Please sign out and sign back in, then try again.');
      } else if (error.code === 'permission-denied') {
        setRemoveError('Permission denied. Please try logging in again.');
      } else {
        setRemoveError('Failed to remove account: ' + (error.message || 'Unknown error'));
      }
      setIsRemoving(false);
    }
  };

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
              onChange={(e) => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setSettings({ ...settings, waterGoal: parseFloat(e.target.value) });
              }}
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
              onChange={(e) => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setSettings({ ...settings, pushupsGoal: parseInt(e.target.value) });
              }}
              className="flex-1"
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <span className="font-bold text-blue-900 w-12">{settings.pushupsGoal}</span>
          </div>
        </div>

        {/* 2.5 Challenge Count Goal Adjuster (Pro Only) */}
        {isPro && (
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3 text-purple-500">
              <Target size={24} />
              <h3 className="font-bold text-blue-900">Challenge Count</h3>
            </div>
            <p className="text-xs text-blue-900/40">Set your daily challenge count goal.</p>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="3" max="20" step="1"
                value={settings.challengeCountGoal || 3}
                onChange={(e) => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
                  setSettings({ ...settings, challengeCountGoal: parseInt(e.target.value) });
                }}
                className="flex-1"
                style={{ accentColor: 'var(--accent-color)' }}
              />
              <span className="font-bold text-blue-900 w-12">{settings.challengeCountGoal || 3}</span>
            </div>
          </div>
        )}

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
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.CLICK);
              setSettings({ ...settings, soundEnabled: !settings.soundEnabled });
            }}
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
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
              }}
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
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
                  setSettings({ ...settings, themeColor: color });
                }}
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
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.CLICK);
              setSettings({ ...settings, showQuotes: !settings.showQuotes });
            }}
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
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setSettings({ ...settings, unitSystem: 'metric' });
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.unitSystem === 'metric' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-900/40'}`}
            >
              Metric (L)
            </button>
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setSettings({ ...settings, unitSystem: 'imperial' });
              }}
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
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
              onLogout();
            }}
            className="bg-red-50 text-red-600 font-bold py-2 px-4 rounded-xl hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* 9. Remove Account */}
        <div className="glass-card p-6 flex items-center justify-between border-2 border-red-100 bg-red-50/10">
          <div className="flex items-center gap-3 text-red-600">
            <Trash2 size={24} />
            <div className="flex flex-col">
              <h3 className="font-bold text-blue-900">Remove Account</h3>
              <p className="text-[10px] text-red-500/60 font-medium italic">This action is permanent, bro.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.ERROR);
              setShowRemoveConfirm(true);
            }}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-200"
          >
            Remove
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

        {/* 11. What's New Link */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <Sparkles size={24} />
            <h3 className="font-bold text-blue-900">What's New</h3>
          </div>
          <p className="text-xs text-blue-900/40">Check out the latest updates and features.</p>
          <button 
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.CLICK);
              window.open('/changelog.md', '_blank');
            }}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-xl font-black text-sm transition-all active:scale-95 border border-blue-200"
          >
            VIEW CHANGELOG
          </button>
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

        {showRemoveConfirm && (
          <div className="fixed inset-0 bg-red-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-blue-900">Remove Account?</h3>
                <p className="text-sm text-blue-900/60">
                  This will permanently delete your account and all your progress from our servers. This cannot be undone, bro.
                </p>
                {removeError && (
                  <p className="text-red-500 text-xs font-bold mt-2 bg-red-50 p-2 rounded-lg">
                    {removeError}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleRemoveAccount}
                  disabled={isRemoving}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRemoving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Removing...
                    </>
                  ) : 'Yes, Delete Everything'}
                </button>
                <button 
                  onClick={() => { setShowRemoveConfirm(false); setRemoveError(null); }}
                  disabled={isRemoving}
                  className="w-full py-3 font-bold text-blue-900/40 hover:text-blue-900 transition-colors"
                >
                  Wait, I changed my mind
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChallengeFlow({ step, setStep, settings, setSettings, dailyProgress, setDailyProgress, stats, setStats, onFinish, onExit, earnedTrophyToday, showToast }: { 
  step: ChallengeStep, 
  setStep: (s: ChallengeStep) => void, 
  settings: UserSettings,
  setSettings: (s: UserSettings | ((prev: UserSettings) => UserSettings)) => void,
  dailyProgress: DailyProgress,
  setDailyProgress: (p: DailyProgress) => void,
  stats: UserStats,
  setStats: (s: UserStats | ((prev: UserStats) => UserStats)) => void,
  onFinish: () => void,
  onExit: () => void,
  earnedTrophyToday: boolean,
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void
}) {
  const steps: ChallengeStep[] = ['pushups', 'water', 'breathing', 'drawing', 'football', 'bubbles', 'memory', 'gratitude', 'reaction'];
  const currentIdx = steps.indexOf(step as any);
  const progressLabel = step === 'completion' ? 'Done!' : `Challenge ${currentIdx + 1}/${steps.length}`;

  const saveChallenge = () => {
    setSettings(prev => ({
      ...prev,
      savedChallengeIds: [...(prev.savedChallengeIds || []), step]
    }));
    showToast('Challenge saved to library!');
  };

  const nextStep = (data?: any) => {
    const updates: Partial<DailyProgress> = {};
    if (step === 'pushups') updates.pushupsDone = true;
    if (step === 'breathing') updates.breathingDone = true;
    if (step === 'drawing') {
      updates.drawingDone = true;
      if (data && typeof data === 'string') {
        setStats(prev => ({
          ...prev,
          drawings: [data, ...(prev.drawings || [])].slice(0, 20)
        }));
      }
    }
    if (step === 'football') updates.footballDone = true;
    if (step === 'bubbles') updates.bubblesDone = true;
    if (step === 'memory') updates.memoryDone = true;
    if (step === 'gratitude') updates.gratitudeDone = true;
    if (step === 'reaction') updates.reactionDone = true;

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
                activeSkin={settings.activeSkin}
              />
            )}
            {step === 'water' && (
              <WaterStep 
                goal={settings.waterGoal} 
                progress={dailyProgress.waterDrank}
                onUpdate={(val) => setDailyProgress({ ...dailyProgress, waterDrank: val })}
                onContinue={nextStep} 
                activeSkin={settings.activeSkin}
              />
            )}
            {step === 'breathing' && (
              <BreathingStep 
                onDone={nextStep} 
                activeSkin={settings.activeSkin}
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
                activeSkin={settings.activeSkin}
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

function PushupsStep({ goal, onDone, onSkip, activeSkin = 'none' }: { goal: number, onDone: () => void, onSkip: () => void, activeSkin?: string }) {
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
          {isReady && <HappyMascot size={32} hat={activeSkin} />}
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
          <button onClick={() => { vibrate(VIBRATION_PATTERNS.CLICK); onSkip(); }} className="btn-secondary w-full">
            Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function WaterStep({ goal, progress, onUpdate, onContinue, activeSkin = 'none' }: { goal: number, progress: number, onUpdate: (v: number) => void, onContinue: () => void, activeSkin?: string }) {
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
          {isFinished && <HappyMascot size={40} hat={activeSkin} />}
          {!isFinished ? (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
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

function BreathingStep({ onDone, activeSkin = 'none' }: { onDone: () => void, activeSkin?: string }) {
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
          {isFinished && <HappyMascot size={40} hat={activeSkin} />}
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

function DrawingStep({ onFinish }: { onFinish: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3B82F6');
  const [tool, setTool] = useState<'pencil' | 'pen' | 'brush' | 'bucket'>('pen');
  const [hasDrawn, setHasDrawn] = useState(false);
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
          <button 
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.SUCCESS);
              const drawing = saveDrawing();
              onFinish(drawing);
            }} 
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
        onClick={() => {
          vibrate(VIBRATION_PATTERNS.CLICK);
          onFinish();
        }}
        className="btn-primary w-full py-6 text-xl shadow-2xl shadow-blue-500/20"
      >
        Back to Home ✨
      </button>
    </motion.div>
  );
}

function FootballStep({ onFinish, activeSkin = 'none' }: { onFinish: () => void, activeSkin?: string }) {
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
            <HappyMascot size={40} hat={activeSkin} />
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

function GalleryScreen({ stats, onBack }: { stats: UserStats, onBack: () => void }) {
  return (
    <div className="min-h-screen bg-blue-50 p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm text-blue-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-blue-900">Masterpieces</h1>
      </div>

      {stats.drawings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
          <ImageIcon size={64} className="text-blue-300 mb-4" />
          <p className="text-blue-900 font-bold">No drawings yet, bro!</p>
          <p className="text-sm text-blue-600">Complete the drawing challenge to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {stats.drawings.map((drawing, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-2 rounded-2xl shadow-md border-2 border-blue-100 overflow-hidden"
            >
              <img src={drawing} alt={`Drawing ${i}`} className="w-full aspect-square object-cover rounded-xl" />
              <div className="mt-2 flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-blue-400">#{i + 1}</span>
                <button className="text-blue-500 hover:text-blue-700">
                  <Sparkles size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotebookScreen({ stats, setStats, onBack, showToast }: { stats: UserStats, setStats: (s: UserStats | ((prev: UserStats) => UserStats)) => void, onBack: () => void, showToast: (msg: string, type?: 'success' | 'info' | 'error') => void }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    if (text.trim().length < 3) return;
    vibrate(30);
    
    setStats(prev => {
      const entries = prev.gratitudeEntries || [];
      if (editingId) {
        return {
          ...prev,
          gratitudeEntries: entries.map(e => e.id === editingId ? { ...e, text, date: new Date().toISOString() } : e)
        };
      } else {
        const newEntry = {
          id: Math.random().toString(36).substr(2, 9),
          text,
          date: new Date().toISOString()
        };
        return {
          ...prev,
          gratitudeEntries: [newEntry, ...entries]
        };
      }
    });

    setText("");
    setEditingId(null);
    showToast('Saved to your Gratitude Library!');
  };

  const handleEdit = (entry: any) => {
    setText(entry.text);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    setStats(prev => ({
      ...prev,
      gratitudeEntries: (prev.gratitudeEntries || []).filter(e => e.id !== id)
    }));
    showToast('Note deleted', 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 pb-24 max-w-2xl mx-auto w-full"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm text-blue-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-blue-900">Gratitude Notebook</h1>
      </div>

      <div className="glass-card p-6 mb-8 border-l-8 border-l-amber-400 bg-[#fffef5]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-amber-900">
            {editingId ? 'Edit Note' : 'New Note'}
          </h2>
          {editingId && (
            <button 
              onClick={() => { setEditingId(null); setText(""); }}
              className="text-xs font-bold text-red-500 uppercase"
            >
              Cancel
            </button>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write what you are grateful for..."
          className="w-full h-48 bg-white/80 rounded-xl p-4 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-medium border-l-4 border-l-red-400 shadow-sm"
        />
        <button
          onClick={handleSave}
          disabled={text.trim().length < 3}
          className="w-full mt-4 py-4 bg-amber-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors"
        >
          <Save size={20} />
          {editingId ? 'Update Note' : 'Save to Library'}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest">Recent Entries</h3>
        {(stats.gratitudeEntries || []).length === 0 ? (
          <div className="text-center py-12 text-blue-900/30 font-medium">
            No entries yet. Start writing!
          </div>
        ) : (
          stats.gratitudeEntries?.map((entry) => (
            <div key={entry.id} className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <p className="text-blue-900 font-medium whitespace-pre-wrap">{entry.text}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(entry)} className="p-2 text-blue-400 hover:text-blue-600">
                    <Pen size={18} />
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="text-[10px] font-bold text-blue-900/30 uppercase">
                {new Date(entry.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
