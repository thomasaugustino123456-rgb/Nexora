import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, ArrowLeft, Coins, Star, Trophy, Sparkles, 
  Check, Volume2, Info, Compass, HelpCircle, AlertCircle, Play, ShieldAlert, CheckSquare, Plus, CheckCircle,
  Flame, Gem, ShoppingBag, Backpack, BookOpen, Map, Menu, Sprout, Wind
} from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { UserSettings, UserStats } from '../types';

const cityWorldBg = new URL('../assets/images/city_world_bg_1781813646094.jpg', import.meta.url).href;

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
  { left: '52%', bottom: '8%', speech: 'Every journey begins with a single step.' },
  { left: '53%', bottom: '18%', speech: 'Nice start!' },
  { left: '46%', bottom: '27%', speech: "You're on fire!" },
  { left: '46%', bottom: '36%', speech: 'Keep up!' },
  { left: '36%', bottom: '44%', speech: 'Great job!' },
  { left: '50%', bottom: '52%', speech: 'Stay Consistent' },
  { left: '56%', bottom: '61%', speech: 'Almost there!' },
  { left: '49%', bottom: '71%', speech: 'Excellent 🌟' },
  { left: '57%', bottom: '80%', speech: "Keep going! You're doing great!" },
  { left: '50%', bottom: '88%', speech: 'Reach the rooftop for a big view!' }
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
      
      {/* ─── STICKY/FLOATING HUD HEADER OVERLAYS ─── */}
      <div className="absolute top-4 inset-x-4 flex flex-col sm:flex-row gap-3 justify-between items-center z-50 pointer-events-none">
        {/* Nexora Brand Pill */}
        <div className="bg-[#0b1528]/95 backdrop-blur-md border border-white/10 px-4 py-2 rounded-[20px] shadow-2xl flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white filter drop-shadow">
            <Sprout className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wider text-white select-none leading-none">NEXORA</h2>
            <p className="text-[8px] font-bold text-[#82cd73] select-none leading-none mt-1">Your Journey Begins</p>
          </div>
        </div>

        {/* Coins, Gems, Streak Indicators */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onDoubleClick={resetAllProgression}
            className="text-[8px] font-mono font-bold text-slate-500 hover:text-rose-400 mr-2 uppercase block tracking-wider"
            title="Double click to reset adventure progress"
          >
            Reset Progress
          </button>

          {/* Coins Pill */}
          <div className="bg-[#0b1528]/95 border border-white/10 rounded-full py-1.5 pl-3 pr-1.5 flex items-center gap-2 shadow-xl hover:bg-slate-900 transition-colors">
            <span className="text-yellow-400 select-none">🪙</span>
            <span className="text-xs font-black font-mono text-white select-none">{stats.coins !== undefined ? Number(stats.coins).toLocaleString() : '1,250'}</span>
            <button 
              onClick={() => { vibrate(5); if (onUpdateStats) onUpdateStats((p: any) => ({ ...p, coins: (p.coins || 0) + 100 })); }}
              className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white font-extrabold text-[10px]"
            >
              +
            </button>
          </div>

          {/* Gems Pill */}
          <div className="bg-[#0b1528]/95 border border-white/10 rounded-full py-1.5 pl-3 pr-1.5 flex items-center gap-2 shadow-xl hover:bg-slate-900 transition-colors">
            <span className="text-cyan-400 select-none">💎</span>
            <span className="text-xs font-black font-mono text-white select-none">{stats.gems !== undefined ? Number(stats.gems).toLocaleString() : '280'}</span>
            <button 
              onClick={() => { vibrate(5); if (onUpdateStats) onUpdateStats((p: any) => ({ ...p, gems: (p.gems || 0) + 10 })); }}
              className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white font-extrabold text-[10px]"
            >
              +
            </button>
          </div>

          {/* Streak Pill */}
          <div className="bg-[#0b1528]/95 border border-white/10 rounded-full py-1.5 px-3 flex items-center gap-2 shadow-xl">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-xs font-black text-white select-none">{stats.streak || 12} Day Streak</span>
          </div>

          {/* Back navigation/burger menu button */}
          <button 
            onClick={onBack}
            className="p-2 bg-[#0b1528]/95 hover:bg-slate-900 rounded-xl border border-white/10 text-white shadow-xl flex items-center justify-center transition-all active:scale-95"
            title="Exit Map"
          >
            <Menu size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* ─── WORLD TITLE CARD FLOATER ─── */}
      <div className="absolute top-24 left-4 w-60 bg-[#0b1528]/90 backdrop-blur-md border border-white/10 rounded-[24px] p-4 shadow-2xl z-40 pointer-events-auto flex flex-col gap-2.5 hidden sm:flex">
        <div>
          <span className="text-[7px] font-black tracking-widest text-[#7dd3fc] uppercase font-mono">WORLD 1</span>
          <h3 className="text-xs font-black text-white uppercase tracking-tight mt-0.5">CITY OF NEW HORIZONS</h3>
        </div>
        <p className="text-[9px] text-slate-300 font-medium leading-relaxed font-sans">
          A modern city full of opportunities, growth and new beginnings. Today is the beginning of my journey.
        </p>
        <div className="border-t border-white/10 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-450" />
            <div>
              <span className="text-[7px] font-black text-slate-400 uppercase font-mono block leading-none">WORLD REWARD</span>
              <span className="text-[8.5px] font-black text-emerald-350 block mt-0.5">Beginner Seed</span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400">
            <Lock size={12} />
          </div>
        </div>
      </div>

      {/* ─── LEFT SIDE NAVIGATION FLOATER ─── */}
      <div className="absolute bottom-28 left-4 flex flex-col gap-3.5 z-40 pointer-events-auto">
        <button 
          onClick={() => { vibrate(5); if (showToast) showToast("🏪 Shop is opening soon inside your inventory!", "info"); }}
          className="w-13 h-13 rounded-2xl bg-[#0b1528]/95 hover:bg-slate-900 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-white transition-all active:scale-95 group"
        >
          <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-tight mt-0.5">Shop</span>
        </button>
        <button 
          onClick={() => { vibrate(5); if (showToast) showToast("🎒 Open inventory details inside active profiles!", "info"); }}
          className="w-13 h-13 rounded-2xl bg-[#0b1528]/95 hover:bg-slate-900 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-white transition-all active:scale-95 group"
        >
          <Backpack className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-tight mt-0.5">Inventory</span>
        </button>
        <button 
          onClick={() => { vibrate(5); if (showToast) showToast("📖 Personal habit journal logs saved privately!", "info"); }}
          className="w-13 h-13 rounded-2xl bg-[#0b1528]/95 hover:bg-slate-900 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-white transition-all active:scale-95 group"
        >
          <BookOpen className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-tight mt-0.5">Journal</span>
        </button>
        <button 
          onClick={() => { vibrate(5); if (showToast) showToast("🌱 Your green greenhouse plant is growing!", "info"); }}
          className="w-13 h-13 rounded-2xl bg-[#0b1528]/95 hover:bg-slate-900 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-white transition-all active:scale-95 group p-1"
        >
          <Sprout className="w-5 h-5 text-emerald-450 group-hover:scale-110 transition-transform animate-pulse" />
          <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-tight mt-0.5">My Plant</span>
        </button>
      </div>

      {/* ─── RIGHT SIDE NAVIGATION FLOATER ─── */}
      <div className="absolute bottom-28 right-4 flex flex-col gap-3.5 z-40 pointer-events-auto">
        <button 
          onClick={() => { vibrate(5); if (showToast) showToast("🏙️ World 1: City of New Horizons active!", "info"); }}
          className="w-13 h-13 rounded-2xl bg-[#0b1528]/95 hover:bg-slate-900 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-white transition-all active:scale-95 group"
        >
          <Map className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-tight mt-0.5">Worlds</span>
        </button>
        <button 
          onClick={() => { vibrate(5); if (showToast) showToast("🏆 Check rankings on Leaderboard screen!", "info"); }}
          className="w-13 h-13 rounded-2xl bg-[#0b1528]/95 hover:bg-slate-900 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-white transition-all active:scale-95 group"
        >
          <Trophy className="w-5 h-5 text-yellow-450 group-hover:scale-110 transition-transform" />
          <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-tight mt-0.5">Rankings</span>
        </button>
      </div>

      {/* ─── FULL-SCREEN LIVING LANDSCAPE ADVENTURE SCROLL TRACK ─── */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-y-auto pb-24 scroll-smooth scrollbar-none select-none relative bg-[#3f651c]"
      >
        {/* Outer Grid Canvas Layout */}
        <div className="w-full max-w-xl mx-auto min-h-[2400px] relative">
          
          {/* Dynamic Floating Zoom Controller */}
          <div className="absolute right-4 top-24 z-40 bg-[#090f1a]/95 backdrop-blur-md border border-white/10 px-3 py-2 rounded-2xl flex flex-col items-center gap-1.5 shadow-2xl pointer-events-auto">
            <span className="text-[7px] font-mono font-black text-slate-400 tracking-wider">ZOOM</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => { vibrate(5); setZoomLevel(z => Math.max(0.7, z - 0.1)); }}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 font-extrabold flex items-center justify-center border border-white/5 transition-all text-white text-xs active:scale-90"
              >
                －
              </button>
              <span className="text-[10px] font-mono font-bold text-center w-8 text-emerald-400">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => { vibrate(5); setZoomLevel(z => Math.min(1.4, z + 0.1)); }}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-705 font-extrabold flex items-center justify-center border border-white/5 transition-all text-white text-xs active:scale-90"
              >
                ＋
              </button>
            </div>
          </div>

          {/* ─────── HERO MAP CONTAINER WITH ZOOM SCALED MATRIX ─────── */}
          <div 
            className="w-full h-[2400px] relative origin-top transition-transform duration-300"
            style={{ 
              transform: `scale(${zoomLevel})`,
              backgroundImage: `url(${cityWorldBg})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          >
            
            {/* 1. Floating Sky Clouds & Birds soared on top of background */}
            <div className="absolute top-10 inset-x-0 h-44 pointer-events-none z-10 overflow-hidden">
              <motion.div 
                animate={{ x: ['-20%', '115%'] }} 
                transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
                className="absolute text-5xl opacity-40 select-none"
              >
                ☁️
              </motion.div>
              <motion.div 
                animate={{ x: ['115%', '-20%'] }} 
                transition={{ duration: 50, repeat: Infinity, ease: 'linear', delay: 15 }}
                className="absolute top-16 text-6xl opacity-30 select-none"
              >
                ☁️
              </motion.div>
              <motion.div 
                animate={{ x: ['-40%', '120%'], y: [0, 40, 0] }} 
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-24 text-xl z-20 flex gap-2 text-slate-500/45"
              >
                🕊️<span>🕊️</span>
              </motion.div>
            </div>

            {/* 2. Animated sailboat overlay on the river right-hand area */}
            <div className="absolute top-[300px] right-0 w-36 h-[1700px] pointer-events-none z-[10] overflow-hidden">
              <motion.div
                animate={{ 
                  y: [400, 550, 650, 400],
                  x: [10, 45, 15, 10],
                  rotate: [-3, 4, -2, -3]
                }}
                transition={{ duration: 45, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-44 left-10 pointer-events-auto cursor-pointer z-10 flex flex-col items-center"
                onClick={() => {
                  vibrate(5);
                  playNatureSynthSound('river');
                  if (showToast) showToast("⛵ Tap Yacht sailing smoothly through water waves!", "info");
                }}
                title="Tap yacht"
              >
                <span className="text-3xl filter drop-shadow-md select-none">⛵</span>
              </motion.div>
            </div>

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
