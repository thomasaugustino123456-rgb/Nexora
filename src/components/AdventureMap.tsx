import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, ArrowLeft, Coins, Star, Trophy, Sparkles, 
  Check, Volume2, Info, Compass, HelpCircle, AlertCircle, Play, ShieldAlert, CheckSquare, Plus, CheckCircle
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
  requirementsDescription: string;
  coinsReward: number;
  xpReward: number;
}

interface World {
  id: number;
  name: string;
  theme: string;
  badge: string;
  bgColor: string; // Background visual styling
  accentColor: string;
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
      // High frequency birds chirping sweeps
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(3500, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'river') {
      // Bubbling stream sound effects
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const pitch = 220 + Math.random() * 200;
        const start = now + (i * 0.12);
        osc.frequency.setValueAtTime(pitch, start);
        osc.frequency.exponentialRampToValueAtTime(pitch + 120, start + 0.18);
        gain.gain.setValueAtTime(0.03, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      }
    } else if (type === 'camel') {
      // Guttural camel bray/chewing sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'ice') {
      // High-pitched freezing frost cracks
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.35);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'victory') {
      // Bright major-chord arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (idx * 0.08));
        gain.gain.setValueAtTime(0.06, now + (idx * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.08) + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + (idx * 0.08));
        osc.stop(now + (idx * 0.08) + 0.35);
      });
    } else if (type === 'click') {
      // Soft woodblock UI sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch (error) {
    console.error("Audio synthesiser issue:", error);
  }
};

export const WORLDS_DATA: World[] = [
  {
    id: 1,
    name: "Metropolis Grid (City)",
    theme: "Tall steel skyscrapers, concrete pathways, neon warning lights and active urban roads.",
    badge: "Metro Pioneer 🏙️",
    bgColor: "bg-slate-900 border-slate-700/60",
    accentColor: "indigo",
    levels: [
      { id: 1, title: "Urban Highway", requirementsDescription: "Clear 2 daily official goals & 3 custom roadmap plans today to proceed down the city boulevard.", coinsReward: 15, xpReward: 15 },
      { id: 2, title: "Skyscraper Step", requirementsDescription: "Complete the mandatory Nexora checks to climb higher past the city structures.", coinsReward: 20, xpReward: 25 },
      { id: 3, title: "Neon Tunnel", requirementsDescription: "Maintain your streak metrics to slide through the grid of the city lights.", coinsReward: 25, xpReward: 35 },
      { id: 4, title: "Traffic Signal", requirementsDescription: "Secure your focus checkmarks. Keep a clear mind down busy subway systems.", coinsReward: 35, xpReward: 50 },
      { id: 5, title: "Downtown Plaza", requirementsDescription: "Climax of the City Grid. Achieve your goals to ascend past urban horizons.", coinsReward: 50, xpReward: 80 }
    ]
  },
  {
    id: 2,
    name: "Whispering Redwoods (Forest)",
    theme: "Ancient rustling giant trees, winding dirt trails, cascading creeks, and deep woodland birds.",
    badge: "Druid Guardian 🌳",
    bgColor: "bg-emerald-950 border-emerald-800/60",
    accentColor: "emerald",
    levels: [
      { id: 6, title: "Canopy Cross", requirementsDescription: "Step into the dense forest floor under giant canopy trees. Keep daily targets green.", coinsReward: 25, xpReward: 40 },
      { id: 7, title: "Ancient Moss", requirementsDescription: "Cross mossy logs and winding stone routes safely by achieving your daily schedule.", coinsReward: 30, xpReward: 50 },
      { id: 8, title: "Waterfall Ridge", requirementsDescription: "Scale up near cascading wild creeks and damp stone formations with active focus.", coinsReward: 35, xpReward: 65 },
      { id: 9, title: "Ranger Cabin", requirementsDescription: "Check inside the local forestry cabin. Secure your habit checkpoints for safety.", coinsReward: 45, xpReward: 80 },
      { id: 10, title: "Druid Heartwood", requirementsDescription: "Reach the grand forest monument. Absorb the spirit of pristine deep forests.", coinsReward: 60, xpReward: 100 }
    ]
  },
  {
    id: 3,
    name: "Golden Sand Dunes (Desert)",
    theme: "Endless baking soils, cacti, prehistoric animal bone fossils, and animated camels walking on sand.",
    badge: "Dune Crawler 🦂",
    bgColor: "bg-amber-950 border-amber-800/60",
    accentColor: "amber",
    levels: [
      { id: 11, title: "Oasis Outpost", requirementsDescription: "Sip pristine water to counteract desert heat. Clear your official list to continue.", coinsReward: 30, xpReward: 45 },
      { id: 12, title: "Cactus Crossing", requirementsDescription: "Navigate past prickly giant desert saguaros. Steady breathing keeps focus aligned.", coinsReward: 35, xpReward: 60 },
      { id: 13, title: "Fossil Valley", requirementsDescription: "Examine ancient animal skeletons and bone remnants hidden deep in dry clay soils.", coinsReward: 40, xpReward: 75 },
      { id: 14, title: "Mirage Track", requirementsDescription: "Dodge the shimmering illusions by completing your custom habit logs.", coinsReward: 50, xpReward: 95 },
      { id: 15, title: "Pyramid Peak", requirementsDescription: "The massive ancient shrine. Stand proud on top of sand valleys under baking sun.", coinsReward: 75, xpReward: 125 }
    ]
  },
  {
    id: 4,
    name: "Vibrant Abyss (Ocean)",
    theme: "Vast deep teal depths, waving sea corals, drifting air bubbles, swimming tropical fish and sharks.",
    badge: "Abyss Voyager 🦈",
    bgColor: "bg-cyan-950 border-cyan-800/60",
    accentColor: "cyan",
    levels: [
      { id: 16, title: "Shallow Shore", requirementsDescription: "Dive from sea sands into gorgeous light-refracted shallow coral lagoons.", coinsReward: 35, xpReward: 60 },
      { id: 17, title: "Kelpfury Path", requirementsDescription: "Swim safely past waving giant organic kelp leaves. Log physical exercises to swim.", coinsReward: 40, xpReward: 75 },
      { id: 18, title: "Coral Cathedral", requirementsDescription: "Observe glowing reefs, marine plants, and sea shells. Breathe deeply under reefs.", coinsReward: 48, xpReward: 90 },
      { id: 19, title: "Deep Trench", requirementsDescription: "Avoid dynamic marine sharks swimming below. Maintain active cognitive focus.", coinsReward: 60, xpReward: 115 },
      { id: 20, title: "Poseidon Vault", requirementsDescription: "Conquer the crown jewels of ocean kingdoms. Complete goals to unlock deep treasures.", coinsReward: 90, xpReward: 150 }
    ]
  },
  {
    id: 5,
    name: "Glacier Ridge (Ice Mountains)",
    theme: "Massive snowy glaciers, frosted cracking slopes, eternal freezing blizzards and shivering ice breezes.",
    badge: "Frost Zenith 🏔️",
    bgColor: "bg-sky-950 border-sky-800/60",
    accentColor: "sky",
    levels: [
      { id: 21, title: "Frozen Valley", requirementsDescription: "Step across frozen solid streams. Maintain core physical heat with habit targets.", coinsReward: 45, xpReward: 70 },
      { id: 22, title: "Icicle Gorge", requirementsDescription: "Scale frozen stone walls with massive hanging icicles. Move carefully with focus.", coinsReward: 50, xpReward: 85 },
      { id: 23, title: "Silent Glacier", requirementsDescription: "Cross deep crevasses. Squeeze out stress with focused habit ticks.", coinsReward: 60, xpReward: 110 },
      { id: 24, title: "Blizzard Ridge", requirementsDescription: "Ascend past swirling snow storms. Cold ice sounds ring from rocky cracks.", coinsReward: 75, xpReward: 140 },
      { id: 25, title: "Everest Throne", requirementsDescription: "The peak of the ice world. Claim crown rewards on frozen thrones of the world.", coinsReward: 110, xpReward: 200 }
    ]
  },
  {
    id: 6,
    name: "Chirping Pastures (Plain Meadow)",
    theme: "Elegant, peaceful line flat grasslands filled with blooming wildflowers, soft wind and flying birds.",
    badge: "Sovereign Meadow 👑",
    bgColor: "bg-emerald-900 border-emerald-700/60",
    accentColor: "emerald",
    levels: [
      { id: 26, title: "Flat Grassland", requirementsDescription: "Wander open green pastures filled with fresh mountain breezes and birds.", coinsReward: 60, xpReward: 100 },
      { id: 27, title: "Wildflower Row", requirementsDescription: "Step past blooming dynamic red tulips and dandelions with continuous focus.", coinsReward: 70, xpReward: 125 },
      { id: 28, title: "Wind Gate", requirementsDescription: "Clear goals to feel relaxed under floating kites and spinning pinwheels.", coinsReward: 85, xpReward: 160 },
      { id: 29, title: "Falcon Nest", requirementsDescription: "Observe lovely dynamic birds soaring high. Keep pristine habits active.", coinsReward: 105, xpReward: 210 },
      { id: 30, title: "Nexora Sovereign", requirementsDescription: "The final climax. Rule the entire map. Congratulations on absolute peak health!", coinsReward: 200, xpReward: 350 }
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
  
  const STORAGE_KEY = 'nexora_adventure_map_prog_v2';
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Map State ---
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<MapLevel | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  
  const [celebrationDetails, setCelebrationDetails] = useState<{
    title: string;
    xp: number;
    coins: number;
    badge?: string;
  } | null>(null);

  // Sound and ambient toggles
  const [ambientSound, setAmbientSound] = useState<string | null>(null);

  // Load level progression
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.completedLevelIds) {
          setCompletedLevelIds(parsed.completedLevelIds);
        }
      } else {
        // Migration check from older storage key if exists
        const oldStored = localStorage.getItem('nexora_adventure_map_prog');
        if (oldStored) {
          const oldParsed = JSON.parse(oldStored);
          if (oldParsed.completedLevelIds) {
            setCompletedLevelIds(oldParsed.completedLevelIds);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedLevelIds: oldParsed.completedLevelIds }));
          }
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedLevelIds: [] }));
        }
      }
    } catch (e) {
      console.error("Progression loading error", e);
    }
  }, []);

  // Compute active level: first level that is not completed
  const activeLevelId = WORLDS_DATA.flatMap(w => w.levels).map(l => l.id)
    .find(id => !completedLevelIds.includes(id)) || 1;

  // Center/Scroll to active level container on mount
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

  // Evaluate daily completion criteria requested specifically:
  // - at least 2 official challenges completed
  // - at least 3 custom plans completed
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

    // Persist custom plan count completed today inside local storage
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
        showToast("Trails are locked! Clear the previous levels on the winding valley road first! 🗺️🔒", 'info');
      }
      return;
    }
    setSelectedLevel(level);
  };

  const triggerCompleteLevel = () => {
    if (!selectedLevel) return;
    
    // Check strict requirements block
    if (!currentHabits.isFullyMet) {
      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
      if (showToast) {
        showToast("Unlock requirements not fully met! Track your daily habits first! 🛡️⚡", 'error');
      }
      return;
    }

    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    const levelId = selectedLevel.id;
    const isAlreadyComp = completedLevelIds.includes(levelId);
    
    const updatedCompleted = isAlreadyComp ? completedLevelIds : [...completedLevelIds, levelId];
    
    // Update parent stats
    if (onUpdateStats && !isAlreadyComp) {
      onUpdateStats((prev: any) => ({
        ...prev,
        coins: (prev.coins || 0) + selectedLevel.coinsReward,
        xp: (prev.xp || 0) + selectedLevel.xpReward
      }));
    }

    setCompletedLevelIds(updatedCompleted);
    saveProgress(updatedCompleted);

    // Compute badge reward if world capstone levels are cleared:
    // Capstone levels are Level 5 (World 1), Level 10 (World 2), Level 15 (World 3), Level 20 (World 4), Level 25 (World 5), Level 30 (World 6)
    let badgeReward: string | undefined = undefined;
    if (levelId % 5 === 0) {
      const worldIdx = Math.floor(levelId / 5) - 1;
      const world = WORLDS_DATA[worldIdx];
      if (world) {
        badgeReward = world.badge;
      }
    }

    setCelebrationDetails({
      title: selectedLevel.title,
      xp: selectedLevel.xpReward,
      coins: selectedLevel.coinsReward,
      badge: badgeReward
    });

    setSelectedLevel(null);
    setShowCelebration(true);
    playNatureSynthSound('victory');

    if (showToast) {
      showToast(`Level ${levelId} Conquered! Claimed +${selectedLevel.xpReward} XP & Gold! 🎉`, 'success');
    }
  };

  // Helper mock controls to satisfy metrics immediately in dev/sandbox
  const handleQuickCompleteHabit = () => {
    vibrate(10);
    playNatureSynthSound('chirp');
    if (setDailyProgress) {
      setDailyProgress((prev: any) => {
        // Find is there any missing done habit
        const update: Partial<any> = {};
        if (!prev.pushupsDone) update.pushupsDone = true;
        else if (!prev.breathingDone) update.breathingDone = true;
        else if (!prev.writingDone) update.writingDone = true;
        else if (!prev.meditationDone) update.meditationDone = true;
        else if (!prev.drawingDone) update.drawingDone = true;
        else {
          update.dailyQuestDone = true;
        }
        return { ...prev, ...update };
      });
      if (showToast) {
        showToast("⚡ Quick-logged 1 Daily Habit! App Checklist updated.", "success");
      }
    }
  };

  const handleQuickCompletePlan = () => {
    vibrate(10);
    playNatureSynthSound('click');
    const current = Number(localStorage.getItem('nexora_custom_plans_completed_today_count') || '0');
    localStorage.setItem('nexora_custom_plans_completed_today_count', String(current + 1));
    // Trigger State refresh
    setCompletedLevelIds([...completedLevelIds]);
    if (showToast) {
      showToast(`⚡ Quick-logged 1 Custom Plan! Completed (${current + 1}/3 today)`, 'success');
    }
  };

  const handleResetDailyCompletions = () => {
    vibrate(15);
    localStorage.removeItem('nexora_custom_plans_completed_today_count');
    if (setDailyProgress) {
      setDailyProgress((prev: any) => ({
        ...prev,
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
        dailyQuestDone: false
      }));
    }
    setCompletedLevelIds([...completedLevelIds]);
    if (showToast) {
      showToast("🔄 Daily criteria logs reset safely.", "info");
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#070b13] text-white flex flex-col overflow-hidden z-[200]">
      
      {/* ─── STICKY HEADER AREA ─── */}
      <header className="absolute top-0 inset-x-0 h-16 bg-[#0c1424]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-50 select-none shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl border border-slate-700 transition-all active:scale-95 flex items-center justify-center"
            title="Exit Map"
          >
            <ArrowLeft size={16} strokeWidth={3} />
          </button>
          <div>
            <span className="text-[8px] font-black tracking-widest uppercase text-emerald-400 block font-mono">ADVENTURE MODE</span>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <h1 className="text-sm font-black text-white uppercase tracking-tight">Nexora Conquest Map</h1>
            </div>
          </div>
        </div>

        {/* Dynamic Global Coin & XP Tracker */}
        <div className="flex items-center gap-2">
          {ambientSound && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] rounded-lg border border-emerald-500/20">
              <span className="animate-pulse">●</span> {ambientSound} active
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-300 font-black text-xs font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            <span>{stats.coins || 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-300 font-black text-xs font-mono">
            <Star className="w-3.5 h-3.5 text-emerald-400" />
            <span>{stats.xp || 0} XP</span>
          </div>
        </div>
      </header>

      {/* ─── CORE FULL-SCREEN SCROLLABLE ADVENTURE WORLD TRACK ─── */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-y-auto pt-16 pb-16 scroll-smooth select-none scrollbar-none"
      >
        <div className="w-full max-w-lg mx-auto flex flex-col">
          
          {/* We render from WORLD 6 at the top to WORLD 1 at the bottom, so the player climbs UPWARDS */}
          {[...WORLDS_DATA].reverse().map((world, wReverseIdx) => {
            const worldIdx = WORLDS_DATA.length - 1 - wReverseIdx;
            const isWorldUnlocked = completedLevelIds.length >= worldIdx * 5 || world.id === 1;

            return (
              <div 
                key={world.id}
                className={`relative w-full h-[720px] transition-all overflow-hidden ${world.bgColor} border-b-4 border-black/40`}
              >
                {/* Visual Sky & Light Glimmer Overlays */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />

                {/* World Visual Decorators based on specific details requested */}
                
                {/* --- WORLD 1: METROPOLIS GRID (City Skyscrapers) --- */}
                {world.id === 1 && (
                  <div className="absolute inset-0 pointer-events-none opacity-40 z-0 overflow-hidden">
                    {/* Skyscrapers vector drawings */}
                    <div className="absolute bottom-0 left-4 w-16 h-80 bg-slate-800 border-t-4 border-slate-600 rounded-t-lg flex flex-wrap p-2 gap-1.5">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-yellow-400/80 rounded-[1px] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                    <div className="absolute bottom-0 right-8 w-24 h-[340px] bg-slate-800 border-t-4 border-indigo-500 rounded-t-xl flex flex-wrap p-3 gap-2">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-yellow-300/60 rounded-[1px] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                      ))}
                    </div>
                    {/* Traffic Lights & Street lamps */}
                    <div className="absolute bottom-32 left-1/3 text-3xl animate-bounce">🚥</div>
                    <div className="absolute bottom-44 right-1/4 text-3xl">🏢</div>
                    <div className="absolute top-20 left-12 text-3xl opacity-50">🏙️</div>
                    <div className="absolute top-36 right-16 text-4xl opacity-50">🏢</div>
                  </div>
                )}

                {/* --- WORLD 2: WHISPERING REDWOODS (Forest with interactive nature sound loops) --- */}
                {world.id === 2 && (
                  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-12 left-8 text-4xl opacity-30">🌲</div>
                    <div className="absolute top-36 right-12 text-5xl opacity-35">🌳</div>
                    <div className="absolute bottom-20 left-10 text-5xl opacity-40 animate-pulse">🌲</div>
                    <div className="absolute bottom-40 right-8 text-4xl opacity-35">🌳</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-2xl bg-emerald-500/20 px-3 py-1.5 border border-emerald-400/30 rounded-full flex items-center gap-1 text-emerald-300 pointer-events-auto cursor-pointer active:scale-95 transition-all shadow-lg"
                         onClick={() => {
                           vibrate(5);
                           playNatureSynthSound('river');
                           setAmbientSound('Forest River flowing');
                         }}
                         title="Tap to play flowing river sound"
                    >
                      🔊 Cascading River Ripple
                    </div>
                    {/* Flying forest butterflies */}
                    <motion.div 
                      animate={{ y: [0, -15, 0], x: [0, 20, 0] }}
                      transition={{ duration: 6, repeat: Infinity }}
                      className="absolute top-1/3 left-16 text-lg"
                    >
                      🦋
                    </motion.div>
                    <motion.div 
                      animate={{ y: [0, 10, 0], x: [0, -25, 0] }}
                      transition={{ duration: 8, repeat: Infinity }}
                      className="absolute bottom-1/3 right-24 text-lg"
                    >
                      🦋
                    </motion.div>
                  </div>
                )}

                {/* --- WORLD 3: GOLDEN SAND DESERT (Animated camels, sun, and bone fossils) --- */}
                {world.id === 3 && (
                  <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#4a3511] to-[#241703]">
                    {/* Desert baking sun with smooth rotational keyframes */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-12 left-12 w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center border-4 border-amber-300/40 shadow-[0_0_35px_rgba(245,158,11,0.6)]"
                    >
                      <span className="text-3xl font-sans font-black text-amber-100">☀️</span>
                    </motion.div>

                    {/* Animated moving camel walking across the desert sand soil */}
                    <motion.div 
                      animate={{ 
                        x: ['-10%', '110%'],
                      }}
                      transition={{ 
                        duration: 25, 
                        repeat: Infinity, 
                        ease: 'linear' 
                      }}
                      className="absolute bottom-28 z-20 pointer-events-auto cursor-pointer"
                      onClick={() => {
                        vibrate(12);
                        playNatureSynthSound('camel');
                        if (showToast) showToast("🐫 Braying Camel chewing desert grasses!", "info");
                      }}
                      title="Tap the camel"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl antialiased select-none filter drop-shadow">🐫</span>
                        <span className="text-[7px] font-black tracking-widest text-amber-400 uppercase font-mono bg-black/50 px-1 py-0.5 rounded">TAP🐪</span>
                      </div>
                    </motion.div>

                    {/* Cactus plants */}
                    <div className="absolute bottom-24 right-12 text-3xl opacity-50">🌵</div>
                    <div className="absolute bottom-40 left-10 text-2xl opacity-40">🌵</div>

                    {/* Animal Bones & Fossil Remnants */}
                    <div className="absolute bottom-16 left-1/3 opacity-75 flex items-center gap-1 select-none pointer-events-none">
                      <span className="text-xl">☠️</span>
                      <span className="text-xs font-mono font-bold text-amber-200/50 uppercase tracking-widest text-[8px]">Fossils</span>
                    </div>
                    <div className="absolute bottom-24 right-1/3 opacity-50 text-base">🦴</div>
                  </div>
                )}

                {/* --- WORLD 4: VIBRANT ABYSS (Deep ocean swimming fish and sharks) --- */}
                {world.id === 4 && (
                  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-cyan-950 to-blue-950">
                    {/* Bubble generator physics simulation */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          y: ['105%', '-5%'], 
                          x: [Math.random() * 400, (Math.random() * 400) + (Math.sin(i) * 50)] 
                        }}
                        transition={{ 
                          duration: 8 + Math.random() * 6, 
                          repeat: Infinity, 
                          ease: 'easeInOut',
                          delay: Math.random() * 4
                        }}
                        className="absolute text-cyan-300 opacity-60 text-xs"
                      >
                        🫧
                      </motion.div>
                    ))}

                    {/* Animated Swimming Sharks */}
                    <motion.div 
                      animate={{ x: ['110%', '-10%'] }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-1/4 scale-125 z-10"
                    >
                      <span className="text-3xl select-none filter drop-shadow">🦈</span>
                    </motion.div>
                    <motion.div 
                      animate={{ x: ['-10%', '110%'] }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                      className="absolute bottom-1/3"
                    >
                      <span className="text-2xl select-none">🦈</span>
                    </motion.div>

                    {/* Animated Swimming Coral Fish */}
                    <motion.div 
                      animate={{ x: ['110%', '-10%'], y: [160, 180, 160] }}
                      transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                      className="absolute"
                    >
                      <span className="text-xl">🐠</span>
                    </motion.div>
                    <motion.div 
                      animate={{ x: ['-10%', '110%'], y: [260, 240, 260] }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                      className="absolute"
                    >
                      <span className="text-lg">🐡</span>
                    </motion.div>
                    <motion.div 
                      animate={{ x: ['-20%', '120%'], y: [350, 370, 350] }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      className="absolute"
                    >
                      <span className="text-lg">🐟🐠</span>
                    </motion.div>

                    {/* Ocean sea shell and corals */}
                    <div className="absolute bottom-6 left-12 text-3xl opacity-40">🪸</div>
                    <div className="absolute bottom-4 right-16 text-4xl opacity-55">🪸</div>
                  </div>
                )}

                {/* --- WORLD 5: GLACIER RIDGE (Ice Mountains & blizzard drift effect) --- */}
                {world.id === 5 && (
                  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-sky-950 to-slate-950">
                    {/* Drifting blizzard snowflakes particles */}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: ['-5%', '105%'],
                          x: [Math.random() * 450, (Math.random() * 450) - 80]
                        }}
                        transition={{ 
                          duration: 4 + Math.random() * 4, 
                          repeat: Infinity, 
                          ease: 'linear',
                          delay: Math.random() * 3
                        }}
                        className="absolute text-sky-200/80 text-xs"
                      >
                        ❄️
                      </motion.div>
                    ))}

                    {/* Glacier peaks */}
                    <div className="absolute bottom-0 inset-x-0 h-44 bg-sky-900/30 border-t-2 border-sky-400/50 flex items-center justify-around">
                      <div className="text-6xl opacity-35">🏔️</div>
                      <div className="text-5xl opacity-30">🏔️</div>
                    </div>

                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-2xl bg-cyan-500/10 px-3 py-1.5 border border-cyan-400/20 rounded-full flex items-center gap-1.5 text-cyan-300 pointer-events-auto cursor-pointer active:scale-95 transition-all shadow-lg"
                         onClick={() => {
                           vibrate(6);
                           playNatureSynthSound('ice');
                           setAmbientSound('Freezing Frost rings');
                         }}
                         title="Tap to trigger ice crack sound"
                    >
                      🔊 Eternal Glacier Breeze
                    </div>

                    <div className="absolute bottom-20 left-16 text-3xl">🧊</div>
                    <div className="absolute bottom-24 right-12 text-4xl opacity-35">🐧</div>
                  </div>
                )}

                {/* --- WORLD 6: CHIRPING PASTURES (Flat meadow bird chirp loops) --- */}
                {world.id === 6 && (
                  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-emerald-900 to-[#122c15]">
                    
                    {/* Beautiful flying birds soaring across meadows */}
                    <motion.div 
                      animate={{ 
                        x: ['-20%', '120%'],
                        y: [100, 160, 100]
                      }}
                      transition={{ 
                        duration: 16, 
                        repeat: Infinity, 
                        ease: 'easeInOut' 
                      }}
                      className="absolute z-10"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-2xl filter drop-shadow">🐦🐦</span>
                        <span className="text-[6.5px] font-black font-mono text-emerald-300 bg-black/40 px-1 rounded uppercase">Flying</span>
                      </div>
                    </motion.div>

                    {/* Sound trigger loops */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-2xl bg-emerald-400/20 px-4 py-2 border border-emerald-400/30 rounded-full flex items-center gap-1.5 text-emerald-200 pointer-events-auto cursor-pointer active:scale-95 transition-all shadow-lg"
                         onClick={() => {
                           vibrate(5);
                           playNatureSynthSound('chirp');
                           setAmbientSound('Restorative Birdsong loop');
                         }}
                         title="Tap for Birds singing sound"
                    >
                      🎶 Restful Birdsong Melody
                    </div>

                    {/* Meadow plants and pasture flatlands */}
                    <div className="absolute bottom-16 left-12 text-3xl opacity-40">🌱</div>
                    <div className="absolute bottom-20 right-16 text-4xl opacity-35">🌻</div>
                    <div className="absolute top-12 right-20 text-3xl opacity-40">🌷</div>
                  </div>
                )}

                {/* ─── WORLD HEADER DETAILS LABEL ─── */}
                <div className="absolute top-6 left-6 z-20 bg-black/70 border border-slate-700/60 p-3.5 rounded-3xl max-w-[280px]">
                  <span className="text-[8px] font-mono font-black text-emerald-400 tracking-widest uppercase block">WORLD {world.id}</span>
                  <p className="font-extrabold text-sm text-white uppercase tracking-tight mt-0.5">{world.name}</p>
                  <p className="text-[9.5px] font-medium text-slate-300 leading-tight italic mt-1 bg-white/5 p-2 rounded-xl">"{world.theme}"</p>
                </div>

                {/* --- WINDING ROAD CONNECTOR SVG INSIDE EACH WORLD OVERLAY --- */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 1 }}>
                  <path 
                    d="M 120 620 C 180 550, 240 480, 180 380 C 120 280, 250 180, 210 90" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="16" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M 120 620 C 180 550, 240 480, 180 380 C 120 280, 250 180, 210 90" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="4" 
                    strokeDasharray="10 8"
                    strokeLinecap="round" 
                  />
                </svg>

                {/* --- LEVELS COORDS PLACEMENTS inside relative container --- */}
                {world.levels.map((level, idx) => {
                  const status = getLevelStatus(level.id);
                  const isCompleted = status === 'completed';
                  const isAvailable = status === 'available';
                  const isLocked = status === 'locked';

                  // Dynamic Zig-Zag placement coordinates for perfect mobile winding look
                  const positions = [
                    { left: '25%', bottom: '82%' }, // Level 1
                    { left: '68%', bottom: '66%' }, // Level 2
                    { left: '32%', bottom: '48%' }, // Level 3
                    { left: '72%', bottom: '30%' }, // Level 4
                    { left: '50%', bottom: '12%' }  // Level 5
                  ];
                  const coords = positions[idx];

                  return (
                    <div 
                      key={level.id}
                      id={`level-node-${level.id}`}
                      style={{ left: coords.left, bottom: coords.bottom }}
                      className="absolute z-30 -translate-x-1/2 flex flex-col items-center"
                    >
                      {/* Level Round Checkpoint Anchor */}
                      <button
                        onClick={() => handleLevelClick(level)}
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-3 border-black shadow-lg ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400' 
                            : isAvailable 
                              ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white scale-115 ring-4 ring-orange-500/55 animate-[bounce_2.2s_infinite] border-amber-300' 
                              : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-80'
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={20} className="stroke-[4px]" />
                        ) : isLocked ? (
                          <Lock size={14} className="stroke-[2.5px]" />
                        ) : (
                          // Large active level indices font
                          <span className="font-extrabold text-sm font-sans tracking-tight">{level.id}</span>
                        )}

                        {/* Rippling pulse for current active available level */}
                        {isAvailable && (
                          <div className="absolute -inset-2 rounded-full border-2 border-orange-400/60 animate-ping opacity-75" />
                        )}
                      </button>

                      {/* Micro Star Ratings visual (Duolingo style) */}
                      <div className="flex items-center gap-0.5 mt-1 bg-black/80 border border-slate-700/80 px-1.5 py-0.5 rounded-full">
                        <Star size={7.5} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                        <Star size={8} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                        <Star size={7.5} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                      </div>

                      {/* Hover / tap bubble tooltip */}
                      <div 
                        onClick={() => status !== 'locked' && handleLevelClick(level)}
                        className={`mt-1 max-w-[90px] px-1.5 py-0.5 bg-black border border-slate-800 rounded-md text-center transition-all active:scale-95 cursor-pointer ${
                          isLocked ? 'opacity-35' : 'hover:bg-slate-900 border-slate-700'
                        }`}
                      >
                        <p className="text-[7px] font-mono font-black text-amber-400 uppercase leading-none">LVL {level.id}</p>
                        <p className="text-[7.5px] font-black text-white truncate max-w-[70px] uppercase leading-tight mt-0.5">{level.title}</p>
                      </div>

                    </div>
                  );
                })}

              </div>
            );
          })}

        </div>
      </div>

      {/* ─── MODAL 1: LEVEL REQUIREMENT / IN-DEPTH ENTRY CONTROLS ─── */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f172a] border-3 border-slate-800 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <span className="bg-emerald-500/10 border border-emerald-550/20 text-emerald-400 text-[8px] uppercase font-black tracking-widest px-3 py-1 rounded-full flex items-center gap-1 font-mono">
                  ⚔️ Level Challenge Entry Gate
                </span>
                <button 
                  onClick={() => { vibrate(5); setSelectedLevel(null); }}
                  className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[9px] uppercase rounded-full border border-slate-700 transition-all font-mono"
                >
                  Close
                </button>
              </div>

              {/* Title info */}
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-sans">
                🏆 Level {selectedLevel.id}: {selectedLevel.title}
              </h3>
              <p className="text-[8.5px] text-emerald-400 font-black uppercase mt-0.5 tracking-wider font-mono">
                CRITERIA VERIFICATION REQUIRED
              </p>

              {/* Loot Chest Overview */}
              <div className="my-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800/85 flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 block uppercase">XP REWARD</span>
                  <p className="text-emerald-400 font-black text-xs sm:text-sm flex items-center justify-center gap-1 mt-0.5 font-mono">
                    <Star size={11} className="text-emerald-400 fill-emerald-400/20" /> +{selectedLevel.xpReward} XP
                  </p>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div className="text-center">
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 block uppercase">COIN REWARD</span>
                  <p className="text-amber-400 font-black text-xs sm:text-sm flex items-center justify-center gap-1 mt-0.5 font-mono">
                    <Coins size={11} className="text-amber-400 fill-amber-400/20" /> +{selectedLevel.coinsReward} Coins
                  </p>
                </div>
              </div>

              {/* Narratives details */}
              <div className="text-[10.5px] text-slate-300 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 leading-relaxed mb-4">
                <span className="text-[8px] font-black text-slate-400 block uppercase tracking-widest mb-1 flex items-center gap-0.5 font-mono">
                  <Info size={10} className="text-emerald-400" /> MISSION OBJECTIVES
                </span>
                {selectedLevel.requirementsDescription}
              </div>

              {/* REQUIRED PROGRESS BAR GAUGES FROM USER PROMPT DESCRIPTION */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-5 relative">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
                  <span className="text-[8.5px] font-black text-amber-400 font-mono uppercase tracking-widest flex items-center gap-1">
                    🛡️ CONQUEST REQUIREMENTS
                  </span>
                  <span className="text-[8px] font-black text-stone-500 uppercase font-mono">DAILY METRIC</span>
                </div>

                {/* 1. Official Challenges Count Progress bar (Requires 2 Completed Tasks today) */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-200 mb-1 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      🎯 App Official Challenges {currentHabits.officialMet ? '✅' : '⏳'}
                    </span>
                    <span className="text-emerald-400">{currentHabits.official} / {currentHabits.officialReq}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className={`h-full transition-all duration-300 ${currentHabits.officialMet ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-orange-500 animate-pulse'}`}
                      style={{ width: `${Math.min(100, (currentHabits.official / currentHabits.officialReq) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 2. Custom plan completed (Requires 3 completed protocols today) */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-200 mb-1 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      📋 User Created Plans {currentHabits.customMet ? '✅' : '⏳'}
                    </span>
                    <span className="text-emerald-400">{currentHabits.custom} / {currentHabits.customReq}</span>
                  </div>
                  <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-750">
                    <div 
                      className={`h-full transition-all duration-300 ${currentHabits.customMet ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-orange-500 animate-pulse'}`}
                      style={{ width: `${Math.min(100, (currentHabits.custom / currentHabits.customReq) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* MOCK/DEBUG SIMULATORS BLOCK (To speed up evaluation & testing) */}
                <div className="pt-2 mt-3 border-t border-slate-900 flex flex-wrap gap-1.5 justify-center">
                  <button 
                    onClick={handleQuickCompleteHabit}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-slate-300"
                    title="Completes 1 app task for today"
                  >
                    <Plus size={10} className="text-emerald-400" /> Log Official Habit
                  </button>
                  <button 
                    onClick={handleQuickCompletePlan}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider text-slate-300"
                    title="Increments user custom plan done parameter count"
                  >
                    <Plus size={10} className="text-emerald-400" /> Log Custom Plan
                  </button>
                  <button 
                    onClick={handleResetDailyCompletions}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider"
                    title="Resets criteria stats parameters to 0"
                  >
                    Reset Today
                  </button>
                </div>

              </div>

              {/* Verification and trigger finish buttons */}
              {currentHabits.isFullyMet ? (
                <button
                  onClick={triggerCompleteLevel}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 border border-emerald-300/20"
                >
                  <CheckCircle size={14} className="animate-bounce" /> Claim Conquest Treasures 👑
                </button>
              ) : (
                <div className="p-4 bg-slate-950 border border-red-500/25 rounded-2xl text-center flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5 text-red-400 font-extrabold text-[9px] uppercase tracking-widest font-mono">
                    <ShieldAlert size={12} /> Progress Criteria Locked
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Finish 2 App Official Challenges and 3 User Created Plans to unlock this trails gate! Check your home screen dashboard or use simulation helpers above.
                  </p>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: PROGRESS / CONQUEST CELEBRATION WORLD UNLOCKED OVERLAY ─── */}
      <AnimatePresence>
        {showCelebration && celebrationDetails && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[700] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-[#0f172a] border-3 border-amber-400 rounded-[2.5rem] p-7 max-w-sm w-full text-center shadow-2xl relative text-white"
            >
              {/* Confetti simulation rays */}
              <div className="absolute inset-x-0 inset-y-0 pointer-events-none overflow-hidden rounded-[2.5rem] opacity-35">
                <span className="absolute top-4 left-6 text-2xl animate-bounce">✨</span>
                <span className="absolute top-12 right-12 text-2xl animate-pulse">🎉</span>
                <span className="absolute bottom-20 left-8 text-xl animate-bounce">⭐</span>
                <span className="absolute bottom-16 right-10 text-xl text-yellow-500 animate-pulse">👑</span>
              </div>

              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-black rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg border border-white/20 mb-4 animate-bounce">
                👑
              </div>

              <span className="text-[9px] font-mono font-black tracking-widest uppercase text-amber-400 block">ADVENTURE MILESTONE</span>
              <h3 className="text-xl font-black text-white uppercase mt-0.5 leading-tight font-sans">
                Stage Conquered!
              </h3>
              <p className="text-[10.5px] text-slate-300 font-extrabold uppercase italic mt-0.5 font-mono">"{celebrationDetails.title}"</p>

              {/* Treasures layout */}
              <div className="my-5 space-y-2.5 bg-slate-900 border border-slate-800 p-4 rounded-3xl text-left">
                <p className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1 pb-1 border-b border-slate-800">TREASURES CLAIMED:</p>
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 font-mono">
                  <span className="flex items-center gap-1.5"><Coins size={12} className="text-amber-500" /> Nexora Coins</span>
                  <span>+{celebrationDetails.coins} Coins</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 font-mono">
                  <span className="flex items-center gap-1.5"><Star size={12} className="text-emerald-400" /> Adventure XP</span>
                  <span>+{celebrationDetails.xp} XP</span>
                </div>

                {celebrationDetails.badge && (
                  <div className="flex items-center justify-between text-[11px] font-bold text-teal-300 border-t border-slate-800 pt-1.5 font-mono">
                    <span className="flex items-center gap-1.5">🏅 Unlocked World Badge</span>
                    <span>{celebrationDetails.badge}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  vibrate(10);
                  setShowCelebration(false);
                  setCelebrationDetails(null);
                }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-md active:scale-95 transition-all text-center block border border-amber-300/30"
              >
                Collect Treasures & Continue Climb 👍
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
