import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, Check, Star, Coins, Sparkles, CheckCircle, 
  ChevronRight, Compass, Map, Trophy, ArrowLeft, Volume2, Info, Award,
  VolumeX, Moon, Sun, Flame, Wind, Eye
} from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { GardenState, addSeedToInventory } from '../types/garden';
import { UserSettings, UserStats } from '../types';

interface AdventureMapProps {
  onBack: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  stats: UserStats;
  onUpdateStats: (updater: any) => void;
  gardenState?: GardenState;
  setGardenState?: (g: GardenState) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

interface MapLevel {
  id: number;
  title: string;
  requirementsDescription: string;
  coinsReward: number;
  xpReward: number;
  milestoneSeedId?: string;
  milestoneSeedName?: string;
  milestoneBadge?: string;
}

interface World {
  id: number;
  name: string;
  theme: string;
  bgGradient: string; // Tailored for bright green/sky valley theme
  accentColor: string;
  borderColor: string;
  badge: string;
  levels: MapLevel[];
}

export const WORLDS_DATA: World[] = [
  {
    id: 1,
    name: "Green Valley",
    theme: "Lush meadows, rotating windmills, flowing crystal streams and peaceful forests.",
    bgGradient: "from-[#F0FDF4] via-[#DCFCE7] to-[#F0FDF4]", // Beautiful bright emerald/cream gradient
    accentColor: "emerald",
    borderColor: "emerald-300",
    badge: "Valley Pioneer 🏅",
    levels: [
      { id: 1, title: "Fresh Start", requirementsDescription: "Complete your basic focus task & drink 1 cup of pure water to cultivate your morning routine.", coinsReward: 10, xpReward: 15 },
      { id: 2, title: "River Walk", requirementsDescription: "Drink 2 cups of pure spring hydration and stretch with 5 light active movements.", coinsReward: 15, xpReward: 25 },
      { id: 3, title: "Discipline Meadow", requirementsDescription: "Perform 1 complete focus block (20 mins), drink 3 cups of water, and sync breathing protocols.", coinsReward: 20, xpReward: 40 },
      { id: 4, title: "Windmill Whistle", requirementsDescription: "Hit your daily hydration targets, complete 10 pushups or active moves, and log 1 gratitude detail.", coinsReward: 30, xpReward: 60, milestoneSeedId: 'moon-sprout', milestoneSeedName: 'Moon Sprout Seed' },
      { id: 5, title: "Valley Peak", requirementsDescription: "Conquer all of your daily habit lists, reach 2.5L water tracker, and complete a heavy 15-pushup cycle.", coinsReward: 50, xpReward: 100, milestoneBadge: "Valley Pioneer 🏅" }
    ]
  },
  {
    id: 2,
    name: "Mountain Pass",
    theme: "Steep rocky cliffs, winding stone trails, soaring eagles and roaring waterfalls.",
    bgGradient: "from-[#F0FDFA] via-[#CCFBF1] to-[#E0F2FE]", // Airy teal/sky peaks theme
    accentColor: "teal",
    borderColor: "teal-300",
    badge: "Mountain Conqueror ⛰️",
    levels: [
      { id: 6, title: "Rocky Ascent", requirementsDescription: "Perform 1 focus task with 10 pushups and 2 large glasses of morning hydration.", coinsReward: 20, xpReward: 30 },
      { id: 7, title: "Stone Gateway", requirementsDescription: "Drink 3 water cups, do a quick posture check, and complete a 2-minute breathing meditation.", coinsReward: 25, xpReward: 45 },
      { id: 8, title: "Eagle's Nest", requirementsDescription: "Maintain high focus goals, drink 4 water cups, and execute 12 precise pushup triggers.", coinsReward: 30, xpReward: 60 },
      { id: 9, title: "Gorge Crossing", requirementsDescription: "Perform 2 focusing intervals, drink 4 cups of water, and draft a 3-bullet priority list in your notebook.", coinsReward: 40, xpReward: 85, milestoneSeedId: 'solar-flare-pea', milestoneSeedName: 'Solar Flare Pea Seed' },
      { id: 10, title: "Summit Gate", requirementsDescription: "Achieve all active targets, do a rigorous 18-pushups set, and log your thoughts in the journal.", coinsReward: 60, xpReward: 120, milestoneBadge: "Mountain Conqueror ⛰️" }
    ]
  },
  {
    id: 3,
    name: "Forest Kingdom",
    theme: "Ancient giant trees, glowing botanical flowers, mossy stone arches and mystical trails.",
    bgGradient: "from-[#F2FDF1] via-[#E2F7E0] to-[#F2FDF1]", // Deep verdant woodland
    accentColor: "green",
    borderColor: "green-300",
    badge: "Guardian of Wood 🌳",
    levels: [
      { id: 11, title: "Glow Sprout", requirementsDescription: "Warm up in the woods by drinking 3 cups of water and logging a light 5-minute breathing flow.", coinsReward: 25, xpReward: 40 },
      { id: 12, title: "Mossy Step", requirementsDescription: "Perform your primary custom onboarding challenge and write 2 positive thoughts in the journal.", coinsReward: 30, xpReward: 55 },
      { id: 13, title: "Canopy Climb", requirementsDescription: "Drink 4 cups of water and complete 15 pushups or equivalent active daily exercise.", coinsReward: 35, xpReward: 75 },
      { id: 14, title: "Firefly Dance", requirementsDescription: "Practice 3 minutes of deep stress-relief breathing, log 5 water glasses, and achieve 1 core task.", coinsReward: 45, xpReward: 95, milestoneSeedId: 'star-silk-leaf', milestoneSeedName: 'Star Silk Leaf Seed' },
      { id: 15, title: "Heart of Wood", requirementsDescription: "Complete the entire forest milestone: do 20 pushups, track 3L of water, and log a master session.", coinsReward: 70, xpReward: 150, milestoneBadge: "Guardian of Wood 🌳" }
    ]
  },
  {
    id: 4,
    name: "Ocean Islands",
    theme: "Turquoise ocean lagoons, sweeping sandy beaches, palm fronds and wooden bridges.",
    bgGradient: "from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD]", // Sparkling sandy/water shore
    accentColor: "sky",
    borderColor: "sky-300",
    badge: "Ocean Navigator ⛵",
    levels: [
      { id: 16, title: "Sandy Dunes", requirementsDescription: "Start walking on sand by completing 1 focus task and drinking 3 refreshing water glasses.", coinsReward: 30, xpReward: 50 },
      { id: 17, title: "Tide Tracker", requirementsDescription: "Keep track of tide flow. Work on a 2-minute breathing pattern & do 12 pushups.", coinsReward: 35, xpReward: 65 },
      { id: 18, title: "Coral Reef", requirementsDescription: "Perform 1 creativity target, log 4 hydration events, and list 3 blessings in your journal.", coinsReward: 45, xpReward: 80 },
      { id: 19, title: "Hidden Cove", requirementsDescription: "Do 18 pushups, monitor 5 full glasses of hydration, and do a quick cognitive game session.", coinsReward: 55, xpReward: 110, milestoneSeedId: 'dream-shroom', milestoneSeedName: 'Dream Shroom Seed' },
      { id: 20, title: "Isle of Wisdom", requirementsDescription: "Clear all daily objectives: do 22 dynamic pushups, sync 3.2L water, and review key progress.", coinsReward: 80, xpReward: 180, milestoneBadge: "Ocean Navigator ⛵" }
    ]
  },
  {
    id: 5,
    name: "Frozen Peaks",
    theme: "Glaciers, glowing auroras, and eternal blizzard ridges.",
    bgGradient: "from-[#F0FDF4] via-[#E0F2FE] to-[#F1F5F9]", // Frosty blue & white snowscape
    accentColor: "cyan",
    borderColor: "cyan-300",
    badge: "Frost Walker Peak 🏔️",
    levels: [
      { id: 21, title: "Frosty Path", requirementsDescription: "Soothe your focus inside frosty air with 10 pushups and 3 water cups logged.", coinsReward: 40, xpReward: 60 },
      { id: 22, title: "Aurora Glimmer", requirementsDescription: "Complete 15 pushups and log 1 min deep breathing as the magical lights swirl.", coinsReward: 45, xpReward: 80 },
      { id: 23, title: "Glacier Ridge", requirementsDescription: "Challenge with 20 solid focus pushups, 4 water cups, and drafting a 5-bullet priority list.", coinsReward: 55, xpReward: 105 },
      { id: 24, title: "Ice Cave Echo", requirementsDescription: "Do 25 pushups, drink 5 cups of water, and log 3 minutes of serene mental recovery.", coinsReward: 65, xpReward: 135, milestoneSeedId: 'luck-fern', milestoneSeedName: 'Mighty Luck Fern Seed' },
      { id: 25, title: "Glacial Zenith", requirementsDescription: "Perform 25 master pushups, track 3.2L pristine water, and hit all routine targets.", coinsReward: 95, xpReward: 210, milestoneBadge: "Frost Walker Peak 🏔️" }
    ]
  },
  {
    id: 6,
    name: "Sky Realm",
    theme: "Kingdom of clouds, floating islands, and sunbeams.",
    bgGradient: "from-[#FFFBEB] via-[#FEF3C7] to-[#FAF5FF]", // Golden sunset clouds in sky
    accentColor: "indigo",
    borderColor: "indigo-300",
    badge: "Sky Sovereign Titan 👑",
    levels: [
      { id: 26, title: "Cloud Entrance", requirementsDescription: "Float into the stratosphere with 15 pushups and 4 refreshing glasses of water.", coinsReward: 50, xpReward: 80 },
      { id: 27, title: "Sun Portal", requirementsDescription: "Log 20 pushups and write down 5 target improvements in your dynamic notebook.", coinsReward: 60, xpReward: 110 },
      { id: 28, title: "Floating Pillar", requirementsDescription: "Complete 25 pushups, 5 cups of water, and run 3 minutes of deep mental focus.", coinsReward: 75, xpReward: 150 },
      { id: 29, title: "Wind Sanctuary", requirementsDescription: "Log a heavy 30-pushups set, track 6 cups of water, and do 1 quick cognitive challenge game.", coinsReward: 90, xpReward: 190, milestoneSeedId: 'luck-lotus', milestoneSeedName: 'Celestial Luck Lotus Seed' },
      { id: 30, title: "Sky Sovereign", requirementsDescription: "Conquer the ultimate climax level: 35 pushups, log 4L total water, write a blueprint planner, and complete 4 min core breathing flow.", coinsReward: 150, xpReward: 300, milestoneBadge: "Sky Sovereign Titan 👑" }
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
  showToast 
}: AdventureMapProps) {
  
  const STORAGE_KEY = 'nexora_adventure_map_prog';

  // --- Map State ---
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>([]);
  const [unlockedWorldIds, setUnlockedWorldIds] = useState<number[]>([1]);
  
  const [selectedLevel, setSelectedLevel] = useState<MapLevel | null>(null);
  const [activeWorld, setActiveWorld] = useState<World>(WORLDS_DATA[0]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    title: string;
    xp: number;
    coins: number;
    badge?: string;
    seedId?: string;
    seedName?: string;
    isWorldComplete?: boolean;
  } | null>(null);

  // Audio simulation state 
  const [sandboxSound, setSandboxSound] = useState<boolean>(false);
  const [soundHookInfo, setSoundHookInfo] = useState<string | null>(null);
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});

  // Loading state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currentWorldId) {
          setCurrentWorldId(parsed.currentWorldId);
          const worldObj = WORLDS_DATA.find(w => w.id === parsed.currentWorldId);
          if (worldObj) setActiveWorld(worldObj);
        }
        if (parsed.completedLevelIds) setCompletedLevelIds(parsed.completedLevelIds);
        if (parsed.unlockedWorldIds) setUnlockedWorldIds(parsed.unlockedWorldIds);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          currentWorldId: 1,
          completedLevelIds: [],
          unlockedWorldIds: [1]
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveProgress = (worldId: number, compIds: number[], unlWorlds: number[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentWorldId: worldId,
        completedLevelIds: compIds,
        unlockedWorldIds: unlWorlds
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const playInteractiveSound = (type: 'click' | 'victory' | 'unlock_gate' | 'birds_wave' | 'river_flowing') => {
    setSoundHookInfo(`🔊 Sound Hook: ${type}.mp3`);
    setTimeout(() => {
      setSoundHookInfo(null);
    }, 2000);
  };

  const getLevelStatus = (levelId: number): 'locked' | 'available' | 'completed' => {
    if (completedLevelIds.includes(levelId)) return 'completed';
    if (levelId === 1) return 'available';
    if (completedLevelIds.includes(levelId - 1)) return 'available';
    return 'locked';
  };

  const handleLevelClick = (level: MapLevel) => {
    const status = getLevelStatus(level.id);
    vibrate(8);
    if (status === 'locked') {
      playInteractiveSound('click');
      if (showToast) {
        showToast("Level Locked! Complete previous checkpoints on winding trail to unlock! ⛰️", 'info');
      }
      return;
    }
    
    // Set checkboxes based on completed state: if already completed, prefill
    const isCompleted = status === 'completed';
    const subTasks = getSubTasksForLevel(level);
    const initialBoxes: Record<string, boolean> = {};
    subTasks.forEach(task => {
      initialBoxes[task.id] = isCompleted;
    });
    setCheckboxes(initialBoxes);
    setSelectedLevel(level);
    playInteractiveSound('click');
  };

  const getSubTasksForLevel = (level: MapLevel) => {
    const priorityFocus = settings.priorityFocus || 'all';
    const basePushups = Math.max(5, settings.pushupsGoal || 5);
    const baseWater = Math.max(2, settings.waterGoal || 2);
    const rankFactor = Math.ceil(level.id / 3);

    const taskList: { id: string; label: string; icon: string }[] = [];

    // Filter bases on onboarding choice:
    if (priorityFocus === 'water' || priorityFocus === 'all' || !priorityFocus) {
      const waterAmt = Math.min(10, Math.ceil(baseWater / 2) + Math.floor(rankFactor / 2));
      taskList.push({
        id: `water_${level.id}`,
        label: `Rehydrate with ${waterAmt} cups of fresh spring water`,
        icon: "💧"
      });
    }

    if (priorityFocus === 'pushups' || priorityFocus === 'all' || !priorityFocus) {
      const pushupCount = Math.min(50, basePushups + (rankFactor * 2));
      taskList.push({
        id: `pushups_${level.id}`,
        label: `Power through ${pushupCount} physical pushups`,
        icon: "💪"
      });
    }

    // Always include a cognitive/focus breathing element
    taskList.push({
      id: `breath_${level.id}`,
      label: `Perform ${10 + (rankFactor * 10)} seconds of synced deep breathing intervals`,
      icon: "🧘"
    });

    // Alternate additional mini tasks
    if (level.id % 2 === 0) {
      taskList.push({
        id: `journal_${level.id}`,
        label: "Record 1 gratitude entry or reflection inside your dynamic Notebook",
        icon: "📝"
      });
    }

    return taskList;
  };

  const triggerCompleteLevel = () => {
    if (!selectedLevel) return;
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    const levelId = selectedLevel.id;
    const isAlreadyComp = completedLevelIds.includes(levelId);

    const updatedCompleted = isAlreadyComp ? completedLevelIds : [...completedLevelIds, levelId];
    
    // Update central stats
    if (onUpdateStats && !isAlreadyComp) {
      onUpdateStats((prev: any) => ({
        ...prev,
        coins: (prev.coins || 0) + selectedLevel.coinsReward,
        xp: (prev.xp || 0) + selectedLevel.xpReward
      }));
    }

    // Seed drop reward integration
    if (selectedLevel.milestoneSeedId && gardenState && setGardenState && !isAlreadyComp) {
      const withNewSeed = addSeedToInventory(gardenState, selectedLevel.milestoneSeedId);
      setGardenState(withNewSeed);
    }

    // Check if world is fully completed
    const activeWorldLevelIds = activeWorld.levels.map(l => l.id);
    const completedInThisWorld = activeWorldLevelIds.filter(id => id === levelId || completedLevelIds.includes(id));
    const isWorldJustFinished = completedInThisWorld.length === activeWorldLevelIds.length;

    let updatedUnlockedWorlds = [...unlockedWorldIds];
    if (isWorldJustFinished && activeWorld.id < WORLDS_DATA.length) {
      const nextWorldId = activeWorld.id + 1;
      if (!updatedUnlockedWorlds.includes(nextWorldId)) {
        updatedUnlockedWorlds.push(nextWorldId);
      }
    }

    setCompletedLevelIds(updatedCompleted);
    setUnlockedWorldIds(updatedUnlockedWorlds);
    saveProgress(currentWorldId, updatedCompleted, updatedUnlockedWorlds);

    setCelebrationDetails({
      title: selectedLevel.title,
      xp: selectedLevel.xpReward,
      coins: selectedLevel.coinsReward,
      badge: selectedLevel.milestoneBadge,
      seedId: selectedLevel.milestoneSeedId,
      seedName: selectedLevel.milestoneSeedName,
      isWorldComplete: isWorldJustFinished
    });

    setSelectedLevel(null);
    setShowCelebration(true);
    playInteractiveSound('victory');

    if (showToast) {
      showToast(`Level ${levelId} Conquered! Claimed +${selectedLevel.xpReward} XP & +${selectedLevel.coinsReward} Coins! 🎉`, 'success');
    }
  };

  const handleWorldSwitch = (worldId: number) => {
    vibrate(6);
    if (!unlockedWorldIds.includes(worldId)) {
      if (showToast) {
        showToast(`Mountain Pass is locked! Complete all Green Valley checkpoints to break open the giant pass gate! 🏔️🔓`, 'error');
      }
      return;
    }
    setCurrentWorldId(worldId);
    const targetWObj = WORLDS_DATA.find(w => w.id === worldId);
    if (targetWObj) {
      setActiveWorld(targetWObj);
    }
    playInteractiveSound('unlock_gate');
  };

  return (
    <div className="min-h-screen w-full bg-[#E8F5E9] text-stone-900 flex flex-col relative select-none">
      
      {/* Absolute Sound Debug Floating Pill */}
      {soundHookInfo && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white font-black text-[11px] px-5 py-2.5 rounded-full z-[800] tracking-wide uppercase shadow-lg border border-emerald-400 select-none flex items-center gap-1.5 animate-bounce">
          <Volume2 size={13} className="animate-pulse" />
          <span>{soundHookInfo}</span>
        </div>
      )}

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-emerald-100 px-4 py-3 sm:py-4 flex items-center justify-between z-50 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 sm:p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200/50 transition-colors active:scale-95"
            title="Return back"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <span className="text-[9px] font-black tracking-widest uppercase text-emerald-600 block">Progression Map</span>
            <div className="flex items-center gap-1">
              <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
              <h1 className="text-xs sm:text-sm font-black text-emerald-900 uppercase tracking-tight">Nexora Journey</h1>
            </div>
          </div>
        </div>

        {/* Coin and XP Tracker Header Badge */}
        <div className="flex items-center gap-2">
          {/* Nature Loop preparation */}
          <button
            onClick={() => {
              setSandboxSound(!sandboxSound);
              playInteractiveSound(sandboxSound ? 'click' : 'river_flowing');
            }}
            className={`p-2 rounded-xl transition-all border ${
              sandboxSound 
                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
            title="Ambient sound previewer"
          >
            {sandboxSound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm text-amber-800 font-black text-xs">
            <Coins className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            <span>{stats.coins || 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm text-emerald-800 font-black text-xs">
            <Star className="w-3.5 h-3.5 text-emerald-600" />
            <span>{stats.xp || 0} XP</span>
          </div>
        </div>
      </header>

      {/* ─── WORLD REGION BAR ─── */}
      <div className="w-[92%] max-w-lg mx-auto mt-4 bg-white border border-emerald-100 rounded-3xl p-4 flex flex-col shadow-sm z-10 select-none relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Active Territory</span>
            <h2 className="text-sm font-black text-emerald-900 tracking-wider uppercase mt-0.5 flex items-center gap-1.5">
              🌎 World {activeWorld.id}: {activeWorld.name}
            </h2>
          </div>
          
          {/* Mini switch buttons */}
          <div className="flex items-center gap-1.5">
            {WORLDS_DATA.map(w => {
              const isUnlocked = unlockedWorldIds.includes(w.id);
              const isActive = activeWorld.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => handleWorldSwitch(w.id)}
                  title={w.name}
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md' 
                      : isUnlocked 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                  }`}
                >
                  {isUnlocked ? w.id : <Lock size={10} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-2 text-[10.5px] text-stone-600 font-medium leading-relaxed italic bg-emerald-50/40 p-2.5 rounded-2xl border border-emerald-100/50">
          "{activeWorld.theme}"
        </div>
      </div>

      {/* ─── MAIN VERTICAL ILLUSTRATED ADVENTURE MAP AREA ─── */}
      <div className="flex-1 w-full max-w-lg mx-auto px-4 py-8 flex flex-col items-center relative z-10">
        
        {/* Scenic Map Frame Wrapper */}
        <div className={`relative w-full rounded-[2.5rem] border border-emerald-200 overflow-hidden shadow-xl bg-gradient-to-b ${activeWorld.bgGradient} p-4 pb-12`} style={{ minHeight: '680px' }}>
          
          {/* STATIC DECORATIVE MAP ELEMENTS (Illustrated aesthetic) */}
          <div className="absolute inset-x-0 inset-y-0 pointer-events-none overflow-hidden z-0">
            
            {/* Drifting soft clouds vector style */}
            <motion.div 
              animate={{ x: [-20, 480, -20] }} 
              transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
              className="absolute top-8 left-0 opacity-40 text-4xl"
            >
              ☁️
            </motion.div>
            <motion.div 
              animate={{ x: [400, -100, 400] }} 
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-0 opacity-30 text-5xl"
            >
              ☁️
            </motion.div>

            {/* Mountains in background */}
            {/* Top-Right Mountain peaks */}
            <div className="absolute top-12 right-6 opacity-85 scale-90 flex flex-col items-center">
              <svg width="100" height="70" viewBox="0 0 100 70" fill="none" className="drop-shadow-sm">
                <polygon points="50,10 90,70 10,70" fill="#CBD5E1" />
                <polygon points="50,10 63,30 37,30" fill="white" />
                <polygon points="70,25 95,70 45,70" fill="#94A3B8" />
                <polygon points="70,25 78,40 62,40" fill="white" />
              </svg>
              <span className="text-[7.5px] font-black text-stone-400 -mt-2 tracking-widest uppercase">SUMMIT</span>
            </div>

            {/* Middle-Left Mountain Pass Peaks */}
            <div className="absolute top-[350px] left-2 opacity-75 scale-75">
              <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                <polygon points="40,10 75,60 5,60" fill="#D1D5DB" />
                <polygon points="40,10 49,25 31,25" fill="#E2E8F0" />
              </svg>
            </div>

            {/* Bottom-Right Mountains near base */}
            <div className="absolute bottom-16 right-2 opacity-90 scale-80">
              <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
                <polygon points="45,5 80,60 10,60" fill="#94A3B8" />
                <polygon points="45,5 53,20 37,20" fill="white" />
              </svg>
            </div>

            {/* WINDMILLS (Iconic features that rotate!) */}
            <div className="absolute top-[110px] left-[65px] flex flex-col items-center opacity-90">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="w-1.5 h-7 bg-stone-500 rounded-t-full absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom shadow-sm" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 absolute flex items-center justify-center"
                >
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <line x1="20" y1="20" x2="20" y2="4" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="20" y1="20" x2="36" y2="20" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="20" y1="20" x2="20" y2="36" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="20" y1="20" x2="4" y2="20" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              </div>
              <span className="text-[7px] font-bold text-emerald-800 uppercase tracking-widest mt-0.5">MILL RIDGE</span>
            </div>

            {/* Winding flowing blue River with simple橋 Bridge */}
            <svg className="absolute inset-0 w-full h-full opacity-35" style={{ zIndex: 1 }}>
              <path 
                d="M 380 180 Q 280 280, 240 410 T 360 620" 
                fill="none" 
                stroke="#A5F3FC" 
                strokeWidth="20" 
                strokeLinecap="round" 
              />
              <path 
                d="M 380 180 Q 280 280, 240 410 T 360 620" 
                fill="none" 
                stroke="#67E8F9" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeDasharray="14 10"
              />
            </svg>

            {/* Cozy River Pond Blue lake at bottom pass */}
            <div className="absolute bottom-[200px] right-8 w-24 h-14 bg-cyan-200/50 border border-cyan-300 rounded-full flex items-center justify-center opacity-85 shadow-inner">
              <span className="text-[7.5px] font-black text-cyan-800 tracking-wider">SWAN LAKE 💧</span>
            </div>

            {/* Wooden Bridges at intersection */}
            <div className="absolute bottom-[240px] right-[78px] rotate-12 scale-90 opacity-90" style={{ zIndex: 5 }}>
              <div className="w-10 h-6 bg-[#C68B59] rounded-md shadow-sm border border-[#5C3D2E] flex flex-col justify-between p-0.5">
                <div className="h-0.5 w-full bg-[#5C3D2E]" />
                <div className="h-0.5 w-full bg-[#5C3D2E]" />
              </div>
            </div>

            {/* Swaying decorative trees along valley */}
            <motion.div 
              animate={{ rotate: [-2, 2, -2] }} 
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '150px', left: '230px' }}
              className="absolute text-xl"
            >
              🌳
            </motion.div>
            <motion.div 
              animate={{ rotate: [2, -2, 2] }} 
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '220px', left: '25px' }}
              className="absolute text-xl"
            >
              🌲
            </motion.div>
            <motion.div 
              animate={{ rotate: [-1, 1, -1] }} 
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ top: '480px', right: '35px' }}
              className="absolute text-xl"
            >
              🌳
            </motion.div>
            <motion.div 
              style={{ bottom: '260px', left: '30px' }}
              className="absolute text-xl"
            >
              🌲🌳🌲
            </motion.div>

            {/* Group campfire/tent camp at center-left */}
            <div className="absolute top-[410px] left-[15px] p-2 flex flex-col items-center opacity-95">
              <div className="flex gap-1 text-sm">🏕️⛺</div>
              <span className="text-[7px] font-black text-amber-800 tracking-widest uppercase mt-0.5">GRIT CAMP</span>
            </div>

            {/* Flapping Birds soaring */}
            <motion.div 
              animate={{ y: [0, -10, 0], x: [0, 20, 0] }}
              transition={{ duration: 7, repeat: Infinity }}
              style={{ top: '90px', right: '35%' }}
              className="absolute text-xs"
            >
              🐦🐦
            </motion.div>
            <motion.div 
              animate={{ y: [0, 8, 0], x: [0, -15, 0] }}
              transition={{ duration: 9, repeat: Infinity }}
              style={{ top: '390px', right: '70px' }}
              className="absolute text-xs"
            >
              🐦
            </motion.div>
          </div>

          {/* ─── ROAD SVG PATH (CREAM WITH WHITE DASHES - EXACTLY MATCHES IMAGE LOOK!) ─── */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
            {/* Outline of cozy winding road */}
            <path 
              d="M 220 680 C 130 580, 100 540, 110 520 C 130 465, 335 465, 330 405 C 320 330, 90 320, 110 240 C 140 140, 310 180, 311 150 C 310 90, 230 110, 220 75" 
              fill="none" 
              stroke="#D7C49E" 
              strokeWidth="19" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="opacity-20"
            />
            {/* Cream winding primary road */}
            <path 
              d="M 220 680 C 130 580, 100 540, 110 520 C 130 465, 335 465, 330 405 C 320 330, 90 320, 110 240 C 140 140, 310 180, 311 150 C 310 90, 230 110, 220 75" 
              fill="none" 
              stroke="#FBF7EB" 
              strokeWidth="15" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* White dash guide in road center */}
            <path 
              d="M 220 680 C 130 580, 100 540, 110 520 C 130 465, 335 465, 330 405 C 320 330, 90 320, 110 240 C 140 140, 310 180, 311 150 C 310 90, 230 110, 220 75" 
              fill="none" 
              stroke="#E1C699" 
              strokeWidth="2" 
              strokeDasharray="6 6"
              strokeLinecap="round" 
            />
          </svg>

          {/* 🏡 HOME BASE - AT THE BOTTOM OF ROAD */}
          <div 
            className="absolute z-10 flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105"
            style={{ left: '197px', top: '635px' }}
          >
            <div className="p-1 px-2.5 bg-yellow-400 text-stone-900 border-2 border-stone-800 rounded-full font-black text-[9px] uppercase tracking-wide shadow-sm animate-pulse mb-1">
              HOME BASE 🏡
            </div>
            {/* Home Base Cottage Illustration */}
            <div className="w-11 h-10 relative">
              {/* Roof */}
              <div className="w-12 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[20px] border-b-red-500 -ml-0.5" />
              {/* Walls */}
              <div className="w-9 h-6 bg-amber-100 border-x-2 border-b-2 border-stone-800 mx-auto -mt-0.5 flex items-end justify-center">
                {/* Door */}
                <div className="w-2.5 h-4 bg-yellow-700 rounded-t-sm" />
              </div>
            </div>
          </div>

          {/* LEVEL CHECKPOINTS ABSOLUTE POSITIONED ON THE WINDING ROAD COORDINATES */}
          {activeWorld.levels.map((level, idx) => {
            const status = getLevelStatus(level.id);
            const isCompleted = status === 'completed';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';

            // Coordinates correspond directly to curves in the road
            const positions = [
              { left: '98px', top: '515px' }, // Level 1 (x: 100, y: 620 -> shifted up)
              { left: '298px', top: '400px' }, // Level 2 (x: 300, y: 490 -> coordinates matching scale)
              { left: '98px', top: '235px' }, // Level 3 (x: 100, y: 350)
              { left: '292px', top: '145px' }, // Level 4 (x: 300, y: 220)
              { left: '198px', top: '65px' }   // Level 5 (x: 200, y: 90)
            ];

            const coords = positions[idx];

            return (
              <div 
                key={level.id}
                style={{ left: coords.left, top: coords.top }}
                className="absolute z-30 flex flex-col items-center"
              >
                
                {/* Level Circular Checkpoint Button */}
                <button
                  onClick={() => handleLevelClick(level)}
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center transition-all duration-300 border-3 border-stone-800 shadow-md ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white hover:brightness-110 shadow-emerald-500/10' 
                      : isAvailable 
                        ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white scale-110 ring-4 ring-yellow-400/40 animate-[bounce_2s_infinite]' 
                        : 'bg-stone-300 border-stone-400 text-stone-500 cursor-not-allowed opacity-80'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={4} />
                  ) : isLocked ? (
                    <Lock size={15} strokeWidth={2.5} />
                  ) : (
                    // Beautiful big styled map text for unlocked ones
                    <span className="font-extrabold text-sm tracking-tighter text-white font-sans">{level.id}</span>
                  )}
                  
                  {/* Outer Pulsing glow indicators */}
                  {isAvailable && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-orange-500/50 animate-ping opacity-60" />
                  )}
                </button>

                {/* Star rating preview below circular nodes (matches image aesthetic) */}
                <div className="flex items-center gap-0.5 mt-1 bg-white/95 border border-stone-800/80 px-1.5 py-0.5 rounded-full shadow-xs">
                  <Star size={7.5} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-stone-300"} />
                  <Star size={8} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-stone-300"} />
                  <Star size={7.5} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-stone-300"} />
                </div>

                {/* Level Detail Tooltip Pill Label */}
                <div 
                  onClick={() => status !== 'locked' && handleLevelClick(level)}
                  className={`mt-1.5 min-w-[70px] max-w-[95px] px-1.5 py-0.5 bg-stone-900 border border-stone-950 text-white rounded-md text-center shadow-sm cursor-pointer select-none active:scale-95 transition-all ${
                    isLocked ? 'opacity-40' : 'hover:bg-stone-850'
                  }`}
                >
                  <p className="text-[7.5px] font-black uppercase tracking-widest leading-none text-amber-400 truncate">Lvl {level.id}</p>
                  <p className="text-[8px] font-black text-white/95 truncate leading-tight uppercase mt-0.5">{level.title}</p>
                </div>
              </div>
            );
          })}

          {/* WORLD GIANT LOCKED GATE FOR WORLD 2 (Visible at top path exit!) */}
          <div className="absolute top-[15px] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
            <div className="flex items-center gap-1 bg-[#F59E0B] text-black font-black text-[8px] tracking-wider uppercase px-2 py-0.5 rounded-full border border-stone-800 shadow-sm animate-pulse">
              <Lock size={8} /> World Exit Gate
            </div>
            <div className="w-18 h-7 bg-stone-800 border-2 border-stone-950 rounded-lg flex items-center justify-center text-stone-200 mt-1 shadow-md">
              <span className="text-[7px] font-black tracking-widest text-[#F59E0B] uppercase">Mountain Pass🔒</span>
            </div>
          </div>

        </div>

        {/* Locked future world promotional notice */}
        {activeWorld.id === 1 && (
          <div className="w-full mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[10px] sm:text-xs font-bold text-amber-800 text-center flex items-center justify-center gap-1.5">
            <span> Complete Level 1 to 5 to break open the World 2 Mountain Pass! 🏅🏔️</span>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: LEVEL DETAILS & QUEST SUB-TASKS OVERLAY ─── */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-3 border-stone-800 rounded-[2.5rem] p-6 sm:p-7 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                  ⚔️ Level Challenge Objective
                </span>
                <button 
                  onClick={() => { vibrate(5); setSelectedLevel(null); }}
                  className="p-1 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-950 font-black text-[10px] uppercase rounded-full border border-stone-200 transition-all"
                >
                  Close
                </button>
              </div>

              {/* Title & Sub */}
              <h3 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight">
                🏆 {selectedLevel.id}. {selectedLevel.title}
              </h3>
              <p className="text-[10px] text-emerald-600 font-black uppercase mt-0.5 tracking-wider">
                WORLD {activeWorld.id} / {activeWorld.name}
              </p>

              {/* Reward Chest panel */}
              <div className="my-4 p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-around shadow-inner">
                <div className="text-center">
                  <span className="text-[8px] font-bold text-stone-500 block uppercase">XP Drop</span>
                  <p className="text-emerald-700 font-extrabold text-sm flex items-center justify-center gap-0.5 mt-0.5">
                    <Star size={12} className="text-emerald-600 fill-emerald-600" /> +{selectedLevel.xpReward}
                  </p>
                </div>
                <div className="w-px h-6 bg-emerald-250" />
                <div className="text-center">
                  <span className="text-[8px] font-bold text-stone-500 block uppercase">Coin Loot</span>
                  <p className="text-amber-700 font-extrabold text-sm flex items-center justify-center gap-0.5 mt-0.5 font-mono">
                    <Coins size={12} className="text-amber-500 fill-amber-500" /> +{selectedLevel.coinsReward}
                  </p>
                </div>
                {selectedLevel.milestoneSeedId && (
                  <>
                    <div className="w-px h-6 bg-emerald-250" />
                    <div className="text-center">
                      <span className="text-[8px] font-bold text-amber-600 block uppercase">🌱 Bonus Seed</span>
                      <p className="text-emerald-700 font-extrabold text-[10px] uppercase mt-0.5 max-w-[80px] truncate leading-none">
                        {selectedLevel.milestoneSeedName}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Requirements narrative */}
              <div className="text-[11px] text-stone-700 bg-emerald-50/20 p-3.5 rounded-2xl border border-emerald-100/60 leading-relaxed mb-4">
                <span className="text-[8px] font-black text-emerald-700 block uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Info size={10} strokeWidth={3} /> QUEST PROTOCOL SUMMARY
                </span>
                {selectedLevel.requirementsDescription}
              </div>

              {/* Checklist details (Satisfying Onboarding Requirements) */}
              <div className="space-y-2 mb-5">
                <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block">
                  👉 COMPLETE ALL STAGE GOALS:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {getSubTasksForLevel(selectedLevel).map((item) => (
                    <label 
                      key={item.id}
                      className="flex items-start gap-3 p-2.5 bg-stone-50 hover:bg-emerald-50/50 border border-stone-200 rounded-xl cursor-pointer select-none group transition-all"
                    >
                      <input 
                        type="checkbox"
                        checked={!!checkboxes[item.id]}
                        onChange={(e) => {
                          vibrate(8);
                          setCheckboxes(prev => ({ ...prev, [item.id]: e.target.checked }));
                          if (e.target.checked) playInteractiveSound('click');
                        }}
                        className="mt-0.5 w-4 h-4 text-emerald-600 rounded-md border-stone-300 focus:ring-emerald-500"
                      />
                      <span className="text-[10.5px] font-bold text-stone-700 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action play */}
              {Object.keys(checkboxes).length === getSubTasksForLevel(selectedLevel).length && 
               Object.values(checkboxes).every(Boolean) ? (
                <button
                  onClick={triggerCompleteLevel}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-550 to-teal-600 hover:brightness-110 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-1"
                >
                  <CheckCircle size={14} /> Finish Level & Claims Gold 👑
                </button>
              ) : (
                <div className="p-3 bg-stone-100 text-stone-500 border border-stone-200 text-center rounded-2xl text-[9px] font-black uppercase tracking-wider">
                  Check all goals above to claim stage loot! 🛡️
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: CELEBRATION WORLD / LEVEL COMPLETION OVERLAY ─── */}
      <AnimatePresence>
        {showCelebration && celebrationDetails && (
          <div className="fixed inset-0 bg-stone-900/95 backdrop-blur-md z-[700] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white border-4 border-amber-400 rounded-[2.5rem] p-7 max-w-sm w-full text-center shadow-2xl relative"
            >
              {/* Confetti simulation visuals */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem] opacity-35">
                <span className="absolute top-4 left-6 text-2xl animate-bounce">✨</span>
                <span className="absolute top-12 right-12 text-2xl animate-pulse">🎉</span>
                <span className="absolute bottom-20 left-8 text-xl animate-bounce">⭐</span>
              </div>

              <div className="w-16 h-16 bg-amber-400 text-stone-950 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-md border border-white mb-4 animate-bounce">
                👑
              </div>

              <span className="text-[9px] font-black tracking-widest uppercase text-amber-600 block">Journey Completed!</span>
              <h3 className="text-xl font-black text-stone-900 uppercase mt-0.5 leading-tight">
                {celebrationDetails.isWorldComplete ? 'World Cleaned! 🎉' : `Stage Conquered!`}
              </h3>
              <p className="text-[10px] text-stone-500 font-extrabold uppercase italic mt-0.5">"{celebrationDetails.title}"</p>

              {/* Treasures layout */}
              <div className="my-5 space-y-2.5 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left">
                <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5 border-b border-stone-200 pb-1">TREASURES CLAIMED:</p>
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                  <span className="flex items-center gap-1.5"><Coins size={12} className="text-amber-500" /> Nexora Golden Coins</span>
                  <span>+{celebrationDetails.coins} Coins</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5"><Star size={12} className="text-emerald-500" /> Journey Level XP</span>
                  <span>+{celebrationDetails.xp} XP</span>
                </div>

                {celebrationDetails.badge && (
                  <div className="flex items-center justify-between text-[11px] font-bold text-teal-800 border-t border-stone-200 pt-1.5">
                    <span className="flex items-center gap-1.5"><Award size={12} className="text-teal-500" /> Milestone Badge</span>
                    <span>{celebrationDetails.badge}</span>
                  </div>
                )}

                {celebrationDetails.seedId && (
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 border-t border-stone-200 pt-1.5">
                    <span className="flex items-center gap-1.5">🌱 Bonus Seed Plant</span>
                    <span className="font-extrabold text-xs text-emerald-700">{celebrationDetails.seedName}</span>
                  </div>
                )}
              </div>

              {celebrationDetails.isWorldComplete && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-xl text-[10px] font-bold text-emerald-800 uppercase mb-4 leading-relaxed">
                  Excellent! You have successfully completed all the checkpoints inside {activeWorld.name}. Next world Mountain Pass is now available! 🏔️✨
                </div>
              )}

              <button
                onClick={() => {
                  vibrate(10);
                  setShowCelebration(false);
                  setCelebrationDetails(null);
                }}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-850 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-md active:scale-95 transition-all text-center block"
              >
                Collect Treasures & Go Back 👍
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
