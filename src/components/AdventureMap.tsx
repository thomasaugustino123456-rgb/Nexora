import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, ArrowLeft, Coins, Star, Trophy, Sparkles, 
  Check, Volume2, Info, Compass, HelpCircle, AlertCircle, Play, ShieldAlert, CheckSquare, Plus, CheckCircle,
  Flame, Gem, ShoppingBag, Backpack, BookOpen, Map, Menu, Sprout, Wind
} from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { UserSettings, UserStats } from '../types';

interface AdventureMapProps {
  onBack: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  stats: UserStats;
  onUpdateStats: (updater: any) => void;
  gardenState?: any;
  setGardenState?: (g: any) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
  dailyProgress?: any;
  setDailyProgress?: any;
}

interface MapLevel {
  id: number;
  title: string;
  isBoss: boolean;
  requirementsDescription: string;
  coinsReward: number;
  xpReward: number;
}

interface World {
  id: number;
  name: string;
  theme: string;
  badge: string;
  unlockedSeed: string;
  seedDescription: string;
  bgColor: string; 
  accentColor: string;
  skyColor: string;
  levels: MapLevel[];
}

// Global browser synthesiser for zero-dependency high fidelity sounds
let audioCtx: AudioContext | null = null;
const playNatureSynthSound = (type: string) => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const ctx = audioCtx;
    const now = ctx.currentTime;
    
    if (type === 'chirp') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'river') {
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const pitch = 250 + Math.random() * 180;
        const start = now + (i * 0.1);
        osc.frequency.setValueAtTime(pitch, start);
        osc.frequency.exponentialRampToValueAtTime(pitch + 100, start + 0.15);
        gain.gain.setValueAtTime(0.02, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      }
    } else if (type === 'victory') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (idx * 0.08));
        gain.gain.setValueAtTime(0.04, now + (idx * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.08) + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + (idx * 0.08));
        osc.stop(now + (idx * 0.08) + 0.3);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'bus') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.setValueAtTime(290, now + 0.1);
      osc.frequency.setValueAtTime(340, now + 0.15);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'boss') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.frequency.setValueAtTime(90, now);
      osc1.frequency.linearRampToValueAtTime(50, now + 0.6);
      osc2.frequency.setValueAtTime(93, now);
      osc2.frequency.linearRampToValueAtTime(53, now + 0.6);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
    }
  } catch (error) {
    console.error("Audio synthesiser issue:", error);
  }
};

// Precise coordinates for the 10 levels winding naturally in the City of Beginnings World 1.
const LEVEL_COORDS = [
  { left: '46%', bottom: '6%', speech: 'Every journey begins here! 🏠' },
  { left: '58%', bottom: '15%', speech: 'Nice start! Take your steps! 🚶' },
  { left: '44%', bottom: '24%', speech: "You're doing fantastic! 🔥" },
  { left: '48%', bottom: '33%', speech: 'Unlock deeper focus values! 👍' },
  { left: '36%', bottom: '42%', speech: 'Take a break under shady trees! 🌸' },
  { left: '52%', bottom: '51%', speech: 'Drip fresh focus fountain drops! ⛲' },
  { left: '60%', bottom: '60%', speech: "Stay radiant! You're glowing! ✨" },
  { left: '50%', bottom: '70%', speech: 'A metropolitan intersection insight! 🚦' },
  { left: '60%', bottom: '80%', speech: "Peer over tower structures! 🏢" },
  { left: '50%', bottom: '88%', speech: 'HQ Rooftop Summit Climax Peak! 👑' }
];

export const WORLDS_DATA: World[] = [
  {
    id: 1,
    name: "City of New Horizons",
    theme: "A modern city full of opportunities, growth and new beginnings. Today is the beginning of my journey.",
    badge: "City Pathfinder 🏙️",
    unlockedSeed: "Beginner Seed",
    seedDescription: "Produces resilient daisies and local urban flora. Essential starter plant.",
    bgColor: "bg-[#82cd73]", // Lush green playground parkland canvas
    skyColor: "from-sky-300 via-sky-200 to-sky-100/50",
    accentColor: "indigo",
    levels: [
      { id: 1, title: "Home Base", isBoss: false, requirementsDescription: "Complete at least 2 official challenges and 3 custom plans today.", coinsReward: 15, xpReward: 20 },
      { id: 2, title: "Residential Lane", isBoss: false, requirementsDescription: "Carry out today's habits. Sidestep busy intersections safely.", coinsReward: 20, xpReward: 25 },
      { id: 3, title: "Riverwalk View", isBoss: false, requirementsDescription: "Log hydration and tasks. Advance past skyscrapers.", coinsReward: 25, xpReward: 30 },
      { id: 4, title: "Cozy Cafe Focus", isBoss: false, requirementsDescription: "Clear routine limits under morning sun. Stay mentally refreshed.", coinsReward: 30, xpReward: 35 },
      { id: 5, title: "Central Plaza Rest", isBoss: false, requirementsDescription: "Take an active pause. Verify 2 official achievements to clear.", coinsReward: 35, xpReward: 40 },
      { id: 6, title: "Stay Consistent", isBoss: false, requirementsDescription: "Refresh cognitive batteries. Complete your focus targets.", coinsReward: 40, xpReward: 45 },
      { id: 7, title: "Learning Center", isBoss: false, requirementsDescription: "Maintain clear mental vision inside dense bustling streams.", coinsReward: 45, xpReward: 50 },
      { id: 8, title: "Traffic Crossway", isBoss: false, requirementsDescription: "Peer over metropolitan lights. Check off 3 custom logs.", coinsReward: 50, xpReward: 60 },
      { id: 9, title: "Nexora Tower Peak", isBoss: false, requirementsDescription: "Review historic logs and study core mindfulness guidelines.", coinsReward: 55, xpReward: 70 },
      { id: 10, title: "Rooftop Horizon", isBoss: true, requirementsDescription: "World 1 Climax. Reach the Nexora HQ rooftop and claim the Beginner Seed!", coinsReward: 150, xpReward: 200 }
    ]
  }
];

export function AdventureMap({ 
  onBack, 
  settings, 
  onUpdateSettings, 
  stats, 
  onUpdateStats, 
  gardenState, 
  setGardenState, 
  showToast,
  dailyProgress,
  setDailyProgress
}: AdventureMapProps) {
  
  const STORAGE_KEY = 'nexora_adventure_map_prog_v3';
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Map States ---
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<MapLevel | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [currentWorldIdx, setCurrentWorldIdx] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  
  const [celebrationDetails, setCelebrationDetails] = useState<{
    title: string;
    xp: number;
    coins: number;
    unlockedSeed?: string;
    seedDescription?: string;
    badge?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.completedLevelIds)) {
          setCompletedLevelIds(parsed.completedLevelIds);
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedLevelIds: [] }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const activeLevelId = WORLDS_DATA.flatMap(w => w.levels).map(l => l.id)
    .find(id => !completedLevelIds.includes(id)) || 1;

  // Auto-scroll on mount inside world structure centering on current active level
  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById(`level-node-${activeLevelId}`);
      if (element && scrollContainerRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [activeLevelId]);

  const saveProgress = (compIds: number[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedLevelIds: compIds }));
    } catch (e) {
      console.error(e);
    }
  };

  const getLevelStatus = (levelId: number): 'locked' | 'available' | 'completed' => {
    if (completedLevelIds.includes(levelId)) return 'completed';
    if (levelId === 1) return 'available';
    if (completedLevelIds.includes(levelId - 1)) return 'available';
    return 'locked';
  };

  // Habit criteria completed evaluation:
  const getDailyHabitsResult = () => {
    let officialCount = 0;
    if (dailyProgress) {
      if (dailyProgress.pushupsDone) officialCount++;
      if (dailyProgress.waterDrank && dailyProgress.waterDrank > 0) officialCount++;
      if (dailyProgress.breathingDone) officialCount++;
      if (dailyProgress.drawingDone) officialCount++;
      if (dailyProgress.footballDone) officialCount++;
      if (dailyProgress.bubblesDone) officialCount++;
      if (dailyProgress.memoryDone) officialCount++;
      if (dailyProgress.gratitudeDone) officialCount++;
      if (dailyProgress.reactionDone) officialCount++;
      if (dailyProgress.meditationDone) officialCount++;
      if (dailyProgress.writingDone) officialCount++;
      if (dailyProgress.dailyQuestDone) officialCount++;
    }

    const customCount = Number(localStorage.getItem('nexora_custom_plans_completed_today_count') || '0');
    const officialReq = 2;
    const customReq = 3;

    return {
      official: officialCount,
      officialReq,
      officialMet: officialCount >= officialReq,
      custom: customCount,
      customReq,
      customMet: customCount >= customReq,
      isFullyMet: officialCount >= officialReq && customCount >= customReq
    };
  };

  const currentHabits = getDailyHabitsResult();

  const handleLevelClick = (level: MapLevel) => {
    const status = getLevelStatus(level.id);
    vibrate(8);
    playNatureSynthSound('click');
    if (status === 'locked') {
      if (showToast) {
        showToast("Trails are locked! Clear previous levels sequentially in the winding roads! 🗺️🔒", 'info');
      }
      return;
    }
    setSelectedLevel(level);
  };

  const triggerCompleteLevel = () => {
    if (!selectedLevel) return;
    
    if (!currentHabits.isFullyMet) {
      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
      if (showToast) {
        showToast("Requirements not met! Complete 2 App Challenges & 3 Custom Roadmaps first! 🛡️⚡", 'error');
      }
      return;
    }

    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    const levelId = selectedLevel.id;
    const isAlreadyComp = completedLevelIds.includes(levelId);
    const updatedCompleted = isAlreadyComp ? completedLevelIds : [...completedLevelIds, levelId];
    
    // Grant rewards
    if (onUpdateStats && !isAlreadyComp) {
      onUpdateStats((prev: any) => ({
        ...prev,
        coins: (prev.coins || 0) + selectedLevel.coinsReward,
        xp: (prev.xp || 0) + selectedLevel.xpReward
      }));
    }

    setCompletedLevelIds(updatedCompleted);
    saveProgress(updatedCompleted);

    // Seed Unlocks Check
    let newlyUnlockedSeed: string | undefined = undefined;
    let seedDesc: string | undefined = undefined;
    let badgeReward: string | undefined = undefined;
    
    // Level 10 Boss provides pathfinder seeds & unique badge
    if (levelId === 10 && !isAlreadyComp) {
      newlyUnlockedSeed = "Beginner Seed";
      seedDesc = "Produces beautiful daisies and local urban greenery. Essential starter seed.";
      badgeReward = "City Pathfinder 🏙️";

      // Insert seed into garden state if provided
      if (setGardenState && gardenState) {
        const updatedSeeds = [...(gardenState.unlockedSeeds || [])];
        if (!updatedSeeds.includes("Beginner Seed")) {
          updatedSeeds.push("Beginner Seed");
        }
        setGardenState({
          ...gardenState,
          unlockedSeeds: updatedSeeds,
          inventory: {
            ...(gardenState.inventory || {}),
            "Beginner Seed": (gardenState.inventory?.["Beginner Seed"] || 0) + 1
          }
        });
      }
    }

    // Set celebration details
    setCelebrationDetails({
      title: selectedLevel.title,
      xp: selectedLevel.xpReward,
      coins: selectedLevel.coinsReward,
      unlockedSeed: newlyUnlockedSeed,
      seedDescription: seedDesc,
      badge: badgeReward
    });

    setSelectedLevel(null);
    setShowCelebration(true);
    playNatureSynthSound('victory');
  };

  const resetAllProgression = () => {
    if (window.confirm("Are you sure you want to reset all your Adventure progression? This cannot be undone.")) {
      vibrate(VIBRATION_PATTERNS.ERROR);
      setCompletedLevelIds([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
      if (showToast) {
        showToast("🔄 Reset Adventure progression successfully.", 'info');
      }
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#070b13] text-white flex flex-col overflow-hidden z-[200]">
      
      {/* ─── STICKY HEADER AREA ─── */}
      <header className="absolute top-0 inset-x-0 h-16 bg-[#090f1a]/95 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 flex items-center justify-between z-50 select-none shadow-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl border border-white/5 transition-all active:scale-95 flex items-center justify-center shadow-inner"
            title="Exit Map"
          >
            <ArrowLeft size={16} strokeWidth={3} />
          </button>
          <div>
            <span className="text-[8px] font-black tracking-widest uppercase text-emerald-400 block font-mono">Nexora Expedition</span>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <h1 className="text-sm font-black text-white uppercase tracking-tight">Adventure Trails</h1>
            </div>
          </div>
        </div>

        {/* Global Coin & XP Indicators */}
        <div className="flex items-center gap-2">
          {/* Reset button hidden natively, double click stats to reset */}
          <button 
            onDoubleClick={resetAllProgression}
            className="text-[8px] font-mono font-bold text-slate-500 hover:text-rose-400 mr-2 uppercase block tracking-wider"
            title="Double click to reset adventure progress"
          >
            Reset Progress
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-300 font-extrabold text-xs font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{stats.coins || 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-300 font-extrabold text-xs font-mono">
            <Star className="w-3.5 h-3.5 text-emerald-400" />
            <span>{stats.xp || 0} XP</span>
          </div>
        </div>
      </header>

      {/* ─── FULL-SCREEN LIVING LANDSCAPE ADVENTURE SCROLL TRACK ─── */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-y-auto pb-24 scroll-smooth scrollbar-none select-none relative bg-[#82cd73]"
        style={{ paddingTop: '64px' }} // clear sticky header nicely
      >
        {/* Sky Background Gradient Overlay at the Top */}
        <div className="absolute inset-x-0 top-0 h-[450px] bg-gradient-to-b from-[#aae0ff] via-[#ceeffc] to-transparent pointer-events-none z-10" />

        {/* Outer Grid Canvas Layout */}
        <div className="w-full max-w-xl mx-auto min-h-[2400px] relative">
          
          {/* Dynamic Floating Zoom Controller */}
          <div className="absolute right-6 top-8 z-40 bg-[#090f1a]/95 backdrop-blur-md border border-white/10 px-3.5 py-2.5 rounded-2xl flex flex-col items-center gap-2 shadow-2xl">
            <span className="text-[8px] font-mono font-black text-slate-400 tracking-wider">MAP ZOOM</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { vibrate(5); setZoomLevel(z => Math.max(0.7, z - 0.1)); }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 font-extrabold flex items-center justify-center border border-white/5 transition-all text-white active:scale-90"
                title="Zoom Out"
              >
                －
              </button>
              <span className="text-xs font-mono font-bold text-center w-12 text-emerald-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => { vibrate(5); setZoomLevel(z => Math.min(1.4, z + 0.1)); }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 font-extrabold flex items-center justify-center border border-white/5 transition-all text-white active:scale-90"
                title="Zoom In"
              >
                ＋
              </button>
            </div>
            <button 
              onClick={() => { vibrate(5); setZoomLevel(1.0); }}
              className="text-[7.5px] font-bold font-mono text-slate-400 hover:text-white uppercase transition-colors"
            >
              RESET ZOOM
            </button>
          </div>

          {/* ─────── HERO MAP CONTAINER WITH ZOOM SCALED MATRIX ─────── */}
          <div 
            className="w-full h-[2400px] relative origin-top transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            
            {/* ─── COHESIVE NATURAL WAVING ROAD PATH (SVG) ─── */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              style={{ zIndex: 5 }} 
              viewBox="0 0 1000 2400" 
              preserveAspectRatio="none"
            >
              {/* Thick soft-green earth curb outline */}
              <path 
                d="M 460 2256 C 580 2040, 580 2040, 580 2040 C 440 1824, 480 1608, 480 1608 C 360 1392, 520 1176, 520 1176 C 600 960, 500 720, 500 720 C 600 480, 500 288, 500 288" 
                fill="none" 
                stroke="#6cb35d" 
                strokeWidth="38" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="opacity-60"
              />
              {/* Main Brick Walkway road backing */}
              <path 
                d="M 460 2256 C 580 2040, 580 2040, 580 2040 C 440 1824, 480 1608, 480 1608 C 360 1392, 520 1176, 520 1176 C 600 960, 500 720, 500 720 C 600 480, 500 288, 500 288" 
                fill="none" 
                stroke="#fff8e2" 
                strokeWidth="24" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Yellow dotted dividing center lane lanes */}
              <path 
                d="M 460 2256 C 580 2040, 580 2040, 580 2040 C 440 1824, 480 1608, 480 1608 C 360 1392, 520 1176, 520 1176 C 600 960, 500 720, 500 720 C 600 480, 500 288, 500 288" 
                fill="none" 
                stroke="#f3bc3c" 
                strokeWidth="4" 
                strokeDasharray="14 14"
                strokeLinecap="round" 
              />
            </svg>

            {/* ─── PREMIUM LANDSCAPE DECORATIVE ASSETS & ARCHITECTURES ─── */}

            {/* 1. Dynamic Floating Sky Clouds & Birds soaring high up */}
            <div className="absolute top-10 inset-x-0 h-44 pointer-events-none z-10 overflow-hidden">
              <motion.div 
                animate={{ x: ['-20%', '115%'] }} 
                transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
                className="absolute text-5xl opacity-40 filter drop-shadow-sm select-none"
              >
                ☁️
              </motion.div>
              <motion.div 
                animate={{ x: ['115%', '-20%'] }} 
                transition={{ duration: 50, repeat: Infinity, ease: 'linear', delay: 15 }}
                className="absolute top-16 text-6xl opacity-30 filter drop-shadow-sm select-none"
              >
                ☁️
              </motion.div>
              <motion.div 
                animate={{ x: ['-40%', '120%'], y: [0, 40, 0] }} 
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-24 text-2xl z-20 flex gap-2 text-slate-500/60"
              >
                🕊️<span>🕊️</span>
              </motion.div>
            </div>

            {/* 2. Blue River Waterway on the right edge with a Sailing Boat */}
            <div className="absolute top-[300px] right-0 w-36 h-[1700px] bg-gradient-to-r from-sky-400/30 to-sky-200/20 rounded-l-[40px] border-l-4 border-sky-400/20 shadow-inner z-[2] overflow-hidden pointer-events-none">
              {/* Elegant water ripple effects */}
              <div className="absolute top-44 left-6 w-14 h-14 rounded-full border-2 border-sky-400/10 animate-ping opacity-30 animate-pulse" />
              <div className="absolute top-[600px] right-8 w-20 h-20 rounded-full border-2 border-sky-400/15 animate-pulse opacity-40" />
              <div className="absolute top-[1200px] left-8 w-16 h-16 rounded-full border-2 border-sky-400/10 animate-ping opacity-30" />

              {/* Animated Sailboat floating on the aquamarine river */}
              <motion.div
                animate={{ 
                  y: [200, 350, 450, 200],
                  x: [10, 45, 15, 10],
                  rotate: [-3, 4, -2, -3]
                }}
                transition={{ duration: 45, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-44 left-4 pointer-events-auto cursor-pointer z-10 flex flex-col items-center"
                onClick={() => {
                  vibrate(5);
                  playNatureSynthSound('river');
                  if (showToast) showToast("⛵ Beautiful white Yacht sailing smoothly through water waves!", "info");
                }}
                title="Tap yacht"
              >
                <span className="text-4xl filter drop-shadow-md select-none">⛵</span>
                <span className="bg-[#0f172a]/90 text-[7px] text-cyan-300 px-1 py-0.5 border border-cyan-400/20 font-black rounded uppercase">Cruise</span>
              </motion.div>

              <div className="absolute bottom-[200px] left-8 text-3xl opacity-30 select-none">🪷</div>
            </div>

            {/* 3. NEXORA TOWER SKY-HIGH HQ (Top: Levels 9, 10) */}
            <div className="absolute top-[110px] left-1/2 -translate-x-1/2 w-80 flex flex-col items-center text-center z-10 overflow-visible">
              
              {/* Flag Pole with glowing sovereign crown representing overall World 1 climax mastery */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex flex-col items-center mb-1.5"
              >
                <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(253,224,71,0.5)] select-none">👑</span>
                <div className="w-1.5 h-10 bg-slate-400 rounded-sm shadow-md" />
              </motion.div>

              {/* Glass Skyscraper HQ Structure */}
              <div className="w-[180px] bg-gradient-to-b from-[#1e293b]/95 via-[#0f172a]/95 to-[#0b0f19] border-3 border-teal-500/40 rounded-[30px] p-4.5 shadow-2xl relative">
                
                {/* Glowing Danger Antenna light */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-1 h-4 bg-slate-400" />
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute -top-1" />
                  <div className="w-2 h-2 bg-red-400 rounded-full absolute -top-0.5" />
                </div>

                <div className="border-b border-teal-500/25 pb-1.5 mb-2.5">
                  <span className="text-[7.5px] font-mono font-black tracking-widest text-[#22d3ee] uppercase block">HQ APEX STATION</span>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-tight mt-0.5">NEXORA ROOFTOP SUMMIT</h4>
                </div>

                {/* Grid window pane lights */}
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2.5 rounded-xs transition-colors duration-1000 ${
                        (i + 3) % 4 === 0 
                          ? 'bg-yellow-300/85 shadow-[0_0_8px_rgba(253,224,71,0.5)] animate-pulse' 
                          : 'bg-teal-905/60'
                      }`} 
                    />
                  ))}
                </div>

                <div className="mt-3.5 bg-slate-950/60 rounded-xl px-2.5 py-1.5 border border-white/5 flex items-center justify-center gap-1.5">
                  <span className="text-sm select-none">🏢</span>
                  <span className="text-[7.5px] font-mono font-black text-slate-400 tracking-wider">LEVEL 10 ROOFTOP REALM</span>
                </div>
              </div>
            </div>

            {/* 4. LEVEL 7, 8 METROPOLITAN AREA (Learning Center & Traffic crossway) */}
            
            {/* Learning Center Reading Pavilion (Left aspect, y: 720px) */}
            <div className="absolute top-[720px] left-8 w-[160px] bg-[#0f172a]/90 backdrop-blur-sm border border-emerald-500/20 rounded-[24px] p-3.5 shadow-2xl z-10">
              <span className="text-[8px] font-mono font-black text-emerald-400 tracking-wider block uppercase border-b border-slate-800 pb-1.5 mb-2">🎓 Learning Center</span>
              <div className="flex gap-2 items-center justify-center py-1">
                <span className="text-3xl filter drop-shadow">📚</span>
                <span className="text-2xl animate-bounce select-none" style={{ animationDuration: '3.5s' }}>📖</span>
              </div>
              <p className="text-[7.5px] text-slate-400 leading-tight mt-1 text-center font-medium">A silent place to organize mental tasks and review roadmaps.</p>
            </div>

            {/* Traffic Intersection Crossway (Right aspect, y: 880px) */}
            <div className="absolute top-[880px] right-8 w-[170px] bg-slate-900/80 border border-slate-700/30 rounded-3xl p-3.5 shadow-xl font-sans text-center z-10">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                {/* Traffic light */}
                <div className="w-3.5 h-8 bg-slate-950 rounded-full flex flex-col justify-between p-0.5 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div>
                  <span className="text-[7px] font-mono font-black text-amber-400 block tracking-wider uppercase">TRANSIT JUNCTION</span>
                  <h5 className="text-[10px] font-bold text-white uppercase tracking-tight">PEDESTRIAN TRAIL</h5>
                </div>
              </div>

              {/* Red Transit Bus traveling horizontally */}
              <div className="w-full h-8 overflow-hidden bg-slate-950/60 rounded-xl relative flex items-center justify-start border border-white/5">
                <motion.div 
                  animate={{ x: ['-20%', '115%'] }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="absolute pointer-events-auto cursor-pointer flex items-center gap-0.5"
                  onClick={() => {
                    vibrate(7);
                    playNatureSynthSound('bus');
                    if (showToast) showToast("🚌 honk! Honk! The City Shuttle Transport bus going past shops!", "info");
                  }}
                  title="Tap Shuttle Bus"
                >
                  <span className="text-lg filter drop-shadow select-none">🚌</span>
                  <span className="text-[5.5px] font-mono font-black bg-red-600 px-0.5 rounded text-white tracking-widest leading-none">TAP</span>
                </motion.div>
                <div className="w-full h-0.5 border-t border-dashed border-slate-800/80" />
              </div>
            </div>

            {/* 5. LEVEL 5, 6 WATER PLAZA & COFFEE SHOP */}

            {/* Grand Water Fountain Pond (Left aspect, y: 1120px) */}
            <div 
              className="absolute top-[1120px] left-10 w-28 h-28 bg-[#1e293b]/90 border border-cyan-400/30 rounded-full flex flex-col items-center justify-center pointer-events-auto cursor-pointer shadow-2xl hover:bg-slate-900/90 active:scale-95 transition-all z-10"
              onClick={() => {
                vibrate(5);
                playNatureSynthSound('river');
                if (showToast) showToast("⛲ splash splash! Tap the crystal water fountain pond! Pure focus. 💦", "info");
              }}
              title="Tap Water Fountain"
            >
              {/* Splashing particle drops */}
              <div className="absolute -top-3.5 flex flex-col gap-0.5 items-center">
                <motion.span 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  className="text-lg select-none"
                >
                  💦
                </motion.span>
                <span className="text-[6.5px] font-mono font-black text-cyan-400 bg-[#0f172a] border border-cyan-500/25 px-1 py-0.5 rounded uppercase tracking-wider">TAP REFRESH</span>
              </div>
              <span className="text-4xl filter drop-shadow select-none">⛲</span>
            </div>

            {/* Cozy Sidewalk Cafe Front (Right aspect, y: 1250px) */}
            <div 
              className="absolute top-[1250px] right-8 w-44 bg-[#0f172a]/90 backdrop-blur-sm border border-amber-500/20 rounded-[28px] p-3.5 shadow-2xl pointer-events-auto cursor-pointer hover:bg-slate-900/90 active:scale-95 transition-all z-10"
              onClick={() => {
                vibrate(6);
                playNatureSynthSound('chirp');
                if (showToast) showToast("☕ Mmm... Freshly grounded arabica beans and croissants! Welcome to Focus Cafe!", "info");
              }}
              title="Tap Coffee Shop"
            >
              {/* Bakery Awning & Coffee Steam animation */}
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2">
                <span className="text-[7.5px] font-mono font-black text-amber-400 tracking-wider block uppercase">☕ FOCUS BAKERY</span>
                <span className="text-[7px] text-emerald-400 font-mono font-bold animate-pulse">OPEN</span>
              </div>
              
              <div className="flex gap-2.5 items-center justify-center">
                <div className="relative">
                  <motion.div 
                    animate={{ y: [0, -4, 0], opacity: [0.4, 0.8, 0.4] }} 
                    transition={{ duration: 2, repeat: Infinity }} 
                    className="absolute -top-3 left-2 text-[10px] select-none"
                  >
                    💭
                  </motion.div>
                  <span className="text-3xl filter drop-shadow select-none">Croissant 🥐</span>
                </div>
                <div className="relative">
                  <motion.div 
                    animate={{ y: [0, -5, 0], opacity: [0.5, 0.9, 0.5] }} 
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }} 
                    className="absolute -top-2.5 left-2 text-[10px] select-none"
                  >
                    ♨️
                  </motion.div>
                  <span className="text-3xl filter drop-shadow select-none">☕</span>
                </div>
              </div>
              <p className="text-[7px] text-slate-400 italic text-center mt-2">(Tap to scent coffee steam)</p>
            </div>

            {/* 6. COZY STARTING HOME & ENTRY COTTAGE (Bottom: Levels 1, 2, 3) */}

            {/* Beginner Garden Cottage Yard (Left aspect, y: 1800px) */}
            <div className="absolute top-[1800px] left-6 w-[200px] bg-emerald-950/80 backdrop-blur-xs border border-emerald-500/20 rounded-[32px] p-4.5 shadow-2xl z-10">
              <span className="text-[8px] font-mono font-black text-teal-400 tracking-wider block uppercase border-b border-emerald-800 pb-1.5 mb-2.5">🏠 NEIGHBORHOOD HOME</span>
              
              <div className="flex items-center justify-around py-1">
                {/* Picket fence gate */}
                <span className="text-3xl filter drop-shadow animate-pulse select-none">🏠</span>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-white block">Home Base</span>
                  <span className="text-[7px] text-slate-400 leading-none block mt-0.5">Where self-improvement starts!</span>
                </div>
              </div>
              
              <div className="flex gap-1.5 justify-center mt-2.5 bg-[#090f1a]/80 py-1.5 px-2 rounded-xl">
                <span className="text-xs select-none">🌷</span>
                <span className="text-xs animate-[bounce_3s_infinite] select-none">🌹</span>
                <span className="text-xs select-none">🌻</span>
                <span className="text-[7px] font-mono font-black text-teal-300 uppercase leading-none self-center ml-1">FLOWER YARD</span>
              </div>
            </div>

            {/* Stone Bridge Crossing the Riverway (Bottom cross, y: 2060px) */}
            <div className="absolute top-[2060px] right-6 w-32 h-14 bg-amber-900/60 border-y-3 border-amber-800 rounded-2xl flex items-center justify-center p-2 text-center text-amber-200 text-[8px] font-black uppercase font-mono shadow-xl z-20 select-none">
              <span className="select-none text-[10px] mr-1">🌁</span> Custom Stone Bridge
            </div>

            {/* Small bicycle riding inside lanes */}
            <div className="absolute top-[1520px] left-1/3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/5 text-[8.5px] text-slate-300 z-10">
              <span className="select-none">🚲</span>
              <span className="font-mono font-extrabold text-[7.5px] uppercase text-emerald-400">Bike lanes trail path</span>
            </div>

            <div className="absolute top-[1020px] right-20 text-3xl opacity-45 select-none font-sans">🌷🌳</div>
            <div className="absolute top-[1700px] right-14 text-4xl opacity-55 select-none animate-pulse font-sans">🌻🌹</div>

            {/* ─── DYNAMIC LEVEL RENDER WITH PRECISION PLACEMENT ─── */}
            {WORLDS_DATA[0].levels.map((level, idx) => {
              const status = getLevelStatus(level.id);
              const isCompleted = status === 'completed';
              const isAvailable = status === 'available';
              const isLocked = status === 'locked';

              const coords = LEVEL_COORDS[idx];

              return (
                <div 
                  key={level.id}
                  id={`level-node-${level.id}`}
                  style={{ left: coords.left, bottom: coords.bottom }}
                  className="absolute z-30 -translate-x-1/2 flex flex-col items-center"
                >
                  {/* Floating speech bubble / advice pointer above the CURRENT AVAILABLE level */}
                  {isAvailable && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-16 w-36 bg-[#0f172a] border border-cyan-400/30 rounded-2xl p-2.5 text-center shadow-2xl z-40"
                    >
                      {/* Bubble pointer tail */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0f172a] border-r border-b border-cyan-400/30 rotate-45 translate-y-2.5" />
                      
                      <span className="text-[7px] font-mono font-black text-amber-400 tracking-wider block uppercase">START CONQUEST</span>
                      <p className="text-[8.5px] font-semibold text-white leading-tight mt-0.5">{coords.speech}</p>
                      
                      {/* Mini action indicator */}
                      <button 
                        onClick={() => handleLevelClick(level)}
                        className="mt-1.5 w-full py-1 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-[7px] uppercase font-bold text-white transition-all active:scale-95 shadow"
                      >
                        Start Challenge
                      </button>
                    </motion.div>
                  )}

                  {/* Round Checkpoint Node Circle */}
                  <button
                    onClick={() => handleLevelClick(level)}
                    className={`relative rounded-full flex items-center justify-center transition-all duration-300 border-3 border-black shadow-[0_8px_20px_rgba(0,0,0,0.5)] ${
                      level.isBoss 
                        ? 'w-16 h-16 scale-110 ring-4' 
                        : 'w-13 h-13'
                    } ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.5)]' 
                        : isAvailable 
                          ? 'bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 text-white scale-115 ring-4 ring-cyan-500/50 animate-[bounce_2.5s_infinite] border-cyan-300' 
                          : 'bg-slate-700/90 border-slate-600 text-slate-400 cursor-not-allowed opacity-80'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={level.isBoss ? 28 : 22} className="stroke-[4.5px]" />
                    ) : isLocked ? (
                      <Lock size={level.isBoss ? 16 : 14} className="stroke-[2.5px] text-slate-400" />
                    ) : level.isBoss ? (
                      <span className="font-black text-[9px] font-mono uppercase text-yellow-300 animate-pulse tracking-tighter">HQ BOSS</span>
                    ) : (
                      <span className="font-extrabold text-sm font-sans tracking-tight">{level.id}</span>
                    )}

                    {/* Ring glow for current available level */}
                    {isAvailable && (
                      <div className="absolute -inset-3 rounded-full border-2 border-cyan-400/50 animate-ping opacity-65 pointer-events-none" />
                    )}
                  </button>

                  {/* Spark of Boss crown above boss levels */}
                  {level.isBoss && !isCompleted && !isLocked && (
                    <div className="absolute -top-5 z-40 bg-yellow-500/90 text-black text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-yellow-400 font-mono scale-95 shadow-md">
                      <Trophy size={6.5} /> Apex Boss
                    </div>
                  )}

                  {/* Micro Stars complete rating under checkpoint */}
                  <div className="flex items-center gap-0.5 mt-1.5 bg-black/85 border border-slate-800 px-2 py-0.5 rounded-full shadow-inner">
                    <Star size={8} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                    <Star size={8.5} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                    <Star size={8} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                  </div>

                  {/* Micro Level Number Tag Bubble */}
                  <div 
                    onClick={() => status !== 'locked' && handleLevelClick(level)}
                    className={`mt-1 max-w-[100px] px-2.5 py-1 bg-[#090f1a]/95 border border-slate-800 rounded-xl text-center shadow-lg transition-all active:scale-95 cursor-pointer ${
                      isLocked ? 'opacity-40' : 'hover:bg-slate-900 border-slate-600/60'
                    }`}
                  >
                    <p className="text-[7px] font-mono font-black text-amber-400 uppercase leading-none">LVL {level.id}</p>
                    <p className="text-[8px] font-black text-white truncate max-w-[85px] uppercase mt-0.5 tracking-tight leading-tight">{level.title}</p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* ─── MODAL 1: PRE-ENTRY GATE / MISSION BRIEFING (COMPLETION TARGET VERIFIER) ─── */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b1321] border-3 border-slate-800 rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] uppercase font-black tracking-widest px-3 py-1 rounded-full flex items-center gap-1 font-mono">
                  ⚔️ Trail Entry Gate
                </span>
                <button 
                  onClick={() => { vibrate(5); setSelectedLevel(null); }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-705 text-slate-300 font-extrabold text-[8.5px] uppercase rounded-full border border-slate-700 transition-all font-mono"
                >
                  Close
                </button>
              </div>

              {/* Title Header info */}
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {selectedLevel.isBoss ? '🔴 BOSS REALM' : '📜 Level'} {selectedLevel.id}: {selectedLevel.title}
              </h3>
              <p className="text-[8.5px] text-amber-400 font-black uppercase tracking-widest block font-mono">
                CONQUEST CRITERIA VERIFICATION
              </p>

              {/* Chest rewards overview */}
              <div className="my-4 p-3.5 bg-slate-900/90 rounded-2xl border border-white/5 flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 block uppercase">XP REWARD</span>
                  <p className="text-emerald-400 font-black text-xs sm:text-sm flex items-center justify-center gap-0.5 mt-0.5 font-mono">
                    <Star size={11} className="text-emerald-400 fill-emerald-400/20" /> +{selectedLevel.xpReward} XP
                  </p>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div className="text-center">
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 block uppercase">GOLD REWARD</span>
                  <p className="text-amber-400 font-black text-xs sm:text-sm flex items-center justify-center gap-0.5 mt-0.5 font-mono">
                    <Coins size={11} className="text-amber-400 fill-amber-400/20" /> +{selectedLevel.coinsReward} Gold
                  </p>
                </div>
              </div>

              {/* Mission Narratives briefing */}
              <div className="text-[10px] text-slate-300 bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 leading-relaxed mb-4">
                <span className="text-[8px] font-black text-slate-400 block uppercase tracking-widest mb-1 font-mono">
                  🧭 OBJECTIVES & TARGETS
                </span>
                {selectedLevel.requirementsDescription}
              </div>

              {/* CRITERICAL HABIT PROGRESS GAUGE (Mandated metrics check) */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-white/5 mb-5 relative">
                
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5">
                  <span className="text-[8px] font-black text-amber-400 font-mono uppercase tracking-widest flex items-center gap-1">
                    🛡️ PROGRESS VERIFICATION
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 font-mono">TODAY</span>
                </div>

                {/* 1. Official Challenges progress */}
                <div>
                  <div className="flex justify-between text-[9px] font-black uppercase mb-1">
                    <span className="text-slate-300 font-mono flex items-center gap-1">
                      {currentHabits.officialMet ? '✅' : '⏳'} App Official Challenges
                    </span>
                    <span className={currentHabits.officialMet ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                      {currentHabits.official}/2 cleared
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-550 ${currentHabits.officialMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (currentHabits.official / 2) * 105)}%` }}
                    />
                  </div>
                  <p className="text-[7.5px] text-slate-400 mt-1 italic">
                    (Requires completing at least two standard daily challenges)
                  </p>
                </div>

                {/* 2. Custom plan progress */}
                <div>
                  <div className="flex justify-between text-[9px] font-black uppercase mb-1">
                    <span className="text-slate-300 font-mono flex items-center gap-1">
                      {currentHabits.customMet ? '✅' : '⏳'} User roadmap plans
                    </span>
                    <span className={currentHabits.customMet ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                      {currentHabits.custom}/3 cleared
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-550 ${currentHabits.customMet ? 'bg-emerald-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min(100, (currentHabits.custom / 3) * 105)}%` }}
                    />
                  </div>
                  <p className="text-[7.5px] text-slate-400 mt-1 italic">
                    (Requires completing at least three custom roadmaps)
                  </p>
                </div>

              </div>

              {/* Proceed Buttons */}
              {currentHabits.isFullyMet ? (
                <button
                  onClick={triggerCompleteLevel}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 tracking-widest uppercase transition-all active:scale-95 border-b-4 border-emerald-700 font-sans"
                >
                  <Trophy size={16} /> Conquest Level Done 🎉
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-450 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold text-[8.5px] text-rose-400 uppercase tracking-wider font-mono">MISSION ROADBLOCK</p>
                      <p className="text-[9.5px] text-slate-350 leading-snug">
                        Finish 2 App Challenges & 3 Custom Roadmap Plans before locking this trail sequence as conquered!
                      </p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="w-full py-3.5 bg-slate-800 text-slate-500 font-black text-xs sm:text-sm rounded-2xl cursor-not-allowed uppercase tracking-wider font-mono border border-slate-700/60"
                  >
                    🔒 Requirements locked
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: WORLD & LEVEL CONQUEST CELEBRATION (LOOT CHEST UNLOCKER) ─── */}
      <AnimatePresence>
        {showCelebration && celebrationDetails && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[700] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, rotate: -4, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-[#121b2d] to-[#0c1424] border-3 border-yellow-500 rounded-[3rem] p-6 text-center w-full max-w-sm shadow-[0_0_55px_rgba(234,179,8,0.35)] relative text-white"
            >
              
              {/* Confetti Sparkles animations particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [300, -20],
                      x: [Math.random() * 300, (Math.random() * 300) - 50],
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                    className="absolute text-yellow-400 opacity-60 text-sm"
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              <div className="text-5xl my-4 animate-bounce select-none">📦🏆🎉</div>

              <h2 className="text-xl sm:text-2xl font-black text-yellow-400 uppercase tracking-tight">
                CONQUEST COMPLETED!
              </h2>
              <p className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest">
                Level Conquered down Winding Valleys
              </p>

              {/* Rewards loot chest items */}
              <div className="my-6 p-4 bg-slate-900/90 rounded-2xl border border-white/5 space-y-3 shadow-inner">
                <p className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest border-b border-white/5 pb-2">
                  LOOT RECOVERED
                </p>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <span className="text-emerald-400 font-black text-base flex items-center justify-center gap-0.5 font-mono">
                      <Star size={14} className="text-emerald-400 fill-emerald-400" /> +{celebrationDetails.xp} XP
                    </span>
                    <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase">EXPERIENCE</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-center">
                    <span className="text-amber-300 font-black text-base flex items-center justify-center gap-0.5 font-mono">
                      <Coins size={14} className="text-amber-400 fill-amber-400" /> +{celebrationDetails.coins} Coins
                    </span>
                    <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase">GOLD COINS</span>
                  </div>
                </div>

                {/* If a world capstone was unlocked, display the rare prize seed */}
                {celebrationDetails.unlockedSeed && (
                  <div className="mt-4 pt-3 border-t border-white/5 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 text-center">
                    <span className="text-lg select-none">🌱 Rare Prize Unlocked!</span>
                    <p className="font-extrabold text-xs text-yellow-300 uppercase tracking-tight mt-1">
                      {celebrationDetails.unlockedSeed}
                    </p>
                    <p className="text-[9px] text-slate-350 leading-relaxed max-w-[240px] mx-auto mt-1 italic">
                      "{celebrationDetails.seedDescription}"
                    </p>
                    <p className="text-[7.5px] font-black tracking-widest text-emerald-400 mt-2 font-mono uppercase">
                      ADD TO GARDEN SEEDS INVENTORY
                    </p>
                  </div>
                )}
              </div>

              {/* Badge celebration */}
              {celebrationDetails.badge && (
                <div className="mb-4 bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20 max-w-[240px] mx-auto">
                  <span className="text-[7px] font-mono font-black text-emerald-400 block uppercase tracking-widest">EXPEDITION BADGE EARNED</span>
                  <p className="font-extrabold text-[#99f6e4] text-[10.5px] uppercase mt-0.5">{celebrationDetails.badge}</p>
                </div>
              )}

              <button
                onClick={() => {
                  vibrate(10);
                  playNatureSynthSound('click');
                  setShowCelebration(false);
                  setCelebrationDetails(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm rounded-2xl shadow-xl tracking-widest uppercase transition-all select-none border-b-4 border-amber-700 font-sans"
              >
                Claim Rewards & Continue 📦
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
