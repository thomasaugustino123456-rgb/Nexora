import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, Check, Star, Coins, Sparkles, CheckCircle, 
  ChevronRight, Compass, Map, Trophy, ArrowLeft, Volume2, Info, Award
} from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { playLootSound } from './LootCard';
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
  ambientSoundName: string;
  bgGradient: string;
  accentColor: string;
  levels: MapLevel[];
}

export const WORLDS_DATA: World[] = [
  {
    id: 1,
    name: "Green Valley",
    theme: "Lush meadows, rotating windmills, flowing crystal streams.",
    ambientSoundName: "river_breeze",
    bgGradient: "from-emerald-500/10 via-teal-500/5 to-amber-500/5",
    accentColor: "from-emerald-500 to-teal-500",
    levels: [
      { id: 1, title: "Healthy Start", requirementsDescription: "Perform 1 complete focus task & drink 1 cup of water to establish your morning flow.", coinsReward: 10, xpReward: 15 },
      { id: 2, title: "Rising Habit", requirementsDescription: "Drink 2 cups of pure water and complete 5 quick pushups to activate your core.", coinsReward: 15, xpReward: 25 },
      { id: 3, title: "Discipline Forest", requirementsDescription: "Drink 3 cups of water, perform 1 min deep breathing patterns, and write 1 quick journal detail.", coinsReward: 20, xpReward: 40 },
      { id: 4, title: "Windmill Whistle", requirementsDescription: "Complete a full 10 pushups set, drink 4 cups of water, and reflect on 2 positive things.", coinsReward: 30, xpReward: 60, milestoneSeedId: 'moon-sprout', milestoneSeedName: 'Moon Sprout Seed' },
      { id: 5, title: "Valley Peak", requirementsDescription: "Hit all of your custom habit list goals, log 5L hydration, and hold breathing sync for 2 mins.", coinsReward: 50, xpReward: 100, milestoneBadge: "Valley Pioneer 🏅" }
    ]
  },
  {
    id: 2,
    name: "Mountain Pass",
    theme: "Stone castles, high slopes, and pure thin air.",
    ambientSoundName: "mountain_wind",
    bgGradient: "from-indigo-950/20 via-slate-800/10 to-indigo-900/5",
    accentColor: "from-indigo-600 to-slate-700",
    levels: [
      { id: 6, title: "Rocky Ascent", requirementsDescription: "Ascend higher with 10 pushups logs & log 2 large glasses of morning hydration.", coinsReward: 20, xpReward: 30 },
      { id: 7, title: "Stone Gateway", requirementsDescription: "Log 3 active drinking events and practice 90s meditative breathing of focus.", coinsReward: 25, xpReward: 45 },
      { id: 8, title: "Eagle's Nest", requirementsDescription: "Write 1 complete morning plan and complete 15 total pushups for muscular resilience.", coinsReward: 30, xpReward: 60 },
      { id: 9, title: "Gorge Crossing", requirementsDescription: "Perform 2 minutes of focus intervals, drink 4 water cups, and write 1 positive review entry.", coinsReward: 40, xpReward: 85, milestoneSeedId: 'solar-flare-pea', milestoneSeedName: 'Solar Flare Pea Seed' },
      { id: 10, title: "Summit Gate", requirementsDescription: "Achieve all active daily commitments, do a heavy 20 pushups cycle, and claim 200 XP points.", coinsReward: 60, xpReward: 120, milestoneBadge: "Mountain Conqueror ⛰️" }
    ]
  },
  {
    id: 3,
    name: "Forest Kingdom",
    theme: "Deep ancient woodland, dancing moss, and fireflies.",
    ambientSoundName: "forest_birds",
    bgGradient: "from-emerald-950/20 via-green-900/10 to-emerald-900/5",
    accentColor: "from-green-700 to-emerald-800",
    levels: [
      { id: 11, title: "Glow Sprout", requirementsDescription: "Embrace nature with 3 cups of water and do a quick 5-pushups focus session.", coinsReward: 25, xpReward: 40 },
      { id: 12, title: "Mossy Step", requirementsDescription: "Maintain a clean hydration schedule (3 cups) and write down 2 grateful thoughts.", coinsReward: 30, xpReward: 55 },
      { id: 13, title: " Canopy Climb", requirementsDescription: "Perform 2 complete focus events & challenge yourself to 15 pushups in one block.", coinsReward: 35, xpReward: 75 },
      { id: 14, title: "Firefly Dance", requirementsDescription: "Inhale/Exhale for 3 minutes, record 4 water glasses drank, and review 2 life targets.", coinsReward: 45, xpReward: 95, milestoneSeedId: 'star-silk-leaf', milestoneSeedName: 'Star Silk Leaf Seed' },
      { id: 15, title: "Heart of Wood", requirementsDescription: "Conquer the entire forest challenge list: 25 pushups, 2.5L water tracker, and write 1 master plan.", coinsReward: 70, xpReward: 150, milestoneBadge: "Guardian of Eldervale 🌳" }
    ]
  },
  {
    id: 4,
    name: "Ocean Islands",
    theme: "Crystal clear water lagoons, palm trees, and warm sands.",
    ambientSoundName: "sea_waves",
    bgGradient: "from-blue-500/10 via-cyan-500/5 to-sky-500/5",
    accentColor: "from-sky-500 to-blue-600",
    levels: [
      { id: 16, title: "Sandy Dunes", requirementsDescription: "Start walking on sand by completing 1 focus task and drinking 3 refreshing water glasses.", coinsReward: 30, xpReward: 50 },
      { id: 17, title: "Tide Tracker", requirementsDescription: "Keep track of tide flow. Work on a 2-minute breathing pattern & do 12 pushups.", coinsReward: 35, xpReward: 65 },
      { id: 18, title: "Coral Reef", requirementsDescription: "Perform 1 creativity target, log 4 hydration events, and list 3 blessings in your journal.", coinsReward: 45, xpReward: 80 },
      { id: 19, title: "Hidden Cove", requirementsDescription: "Do 18 pushups, monitor 5 full glasses of hydration, and do a quick cognitive game session.", coinsReward: 55, xpReward: 110, milestoneSeedId: 'dream-shroom', milestoneSeedName: 'Dream Shroom Seed' },
      { id: 20, title: "Isle of Wisdom", requirementsDescription: "Clear all daily objectives: do 30 dynamic pushups, sync 3L water, and review key progress.", coinsReward: 80, xpReward: 180, milestoneBadge: "Ocean Navigator ⛵" }
    ]
  },
  {
    id: 5,
    name: "Frozen Peaks",
    theme: "Glaciers, glowing auroras, and eternal blizzard ridges.",
    ambientSoundName: "arctic_chill",
    bgGradient: "from-cyan-900/20 via-blue-950/10 to-slate-900/5",
    accentColor: "from-cyan-400 to-sky-500",
    levels: [
      { id: 21, title: "Frosty Path", requirementsDescription: "Soothe your focus inside frosty air with 10 pushups and 3 water cups logged.", coinsReward: 40, xpReward: 60 },
      { id: 22, title: "Aurora Glimmer", requirementsDescription: "Complete 15 pushups and log 1 min deep breathing as the magical lights swirl.", coinsReward: 45, xpReward: 80 },
      { id: 23, title: "Glacier Ridge", requirementsDescription: "Challenge with 20 solid focus pushups, 4 water cups, and drafting a 5-bullet priority list.", coinsReward: 55, xpReward: 105 },
      { id: 24, title: "Ice Cave Echo", requirementsDescription: "Do 25 pushups, drink 5 cups of water, and log 3 minutes of serene mental recovery.", coinsReward: 65, xpReward: 135, milestoneSeedId: 'luck-fern', milestoneSeedName: 'Mighty Luck Fern Seed' },
      { id: 25, title: "Glacial Zenith", requirementsDescription: "Perform 35 master pushups, track 3.2L pristine water, and hit all routine targets.", coinsReward: 95, xpReward: 210, milestoneBadge: "Frost Walker Peak 🏔️" }
    ]
  },
  {
    id: 6,
    name: "Sky Realm",
    theme: "Kingdom of clouds, floating islands, and sunbeams.",
    ambientSoundName: "sky_choir",
    bgGradient: "from-sky-300/10 via-purple-300/10 to-amber-200/5",
    accentColor: "from-violet-400 to-indigo-500",
    levels: [
      { id: 26, title: "Cloud Entrance", requirementsDescription: "Float into the stratosphere with 15 pushups and 4 refreshing glasses of water.", coinsReward: 50, xpReward: 80 },
      { id: 27, title: "Sun Portal", requirementsDescription: "Log 20 pushups and write down 5 target improvements in your dynamic notebook.", coinsReward: 60, xpReward: 110 },
      { id: 28, title: "Floating Pillar", requirementsDescription: "Complete 25 pushups, 5 cups of water, and run 3 minutes of deep mental focus.", coinsReward: 75, xpReward: 150 },
      { id: 29, title: "Wind Sanctuary", requirementsDescription: "Log a heavy 30-pushups set, track 6 cups of water, and do 1 quick cognitive challenge game.", coinsReward: 90, xpReward: 190, milestoneSeedId: 'luck-lotus', milestoneSeedName: 'Celestial Luck Lotus Seed' },
      { id: 30, title: "Sky Sovereign", requirementsDescription: "Conquer the ultimate climax level: 50 pushups, log 4L total water, write a blueprint planner, and complete 4 min core breathing flow.", coinsReward: 150, xpReward: 300, milestoneBadge: "Sky Sovereign Titan 👑" }
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
  
  // Storage keys
  const STORAGE_KEY = 'nexora_adventure_map_prog';

  // State
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  const [completedLevelIds, setCompletedLevelIds] = useState<number[]>([]);
  const [unlockedWorldIds, setUnlockedWorldIds] = useState<number[]>([1]);
  
  // Interactive level detail modal
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

  // Challenge checkable list inside clicked level modal
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});

  // Audio state preparation
  const [audioFeedbackText, setAudioFeedbackText] = useState<string | null>(null);

  // Load Adventure map state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currentWorldId) setCurrentWorldId(parsed.currentWorldId);
        if (parsed.completedLevelIds) setCompletedLevelIds(parsed.completedLevelIds);
        if (parsed.unlockedWorldIds) setUnlockedWorldIds(parsed.unlockedWorldIds);
      } else {
        // Fallback: Check standard history or start new
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

  // Save changes
  const saveMapProgress = (worldId: number, compIds: number[], unlWorlds: number[]) => {
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

  // Switch world
  const handleSwitchWorld = (worldId: number) => {
    vibrate(10);
    const targetWorld = WORLDS_DATA.find(w => w.id === worldId);
    if (!targetWorld) return;
    
    if (!unlockedWorldIds.includes(worldId)) {
      if (showToast) {
        showToast(`World ${worldId} is Locked! Complete all prior valley levels to unlock, bro! Limitless grit! 🔓`, 'info');
      }
      return;
    }
    
    setCurrentWorldId(worldId);
    setActiveWorld(targetWorld);
    playFutureSound('click');
  };

  // Play Sound (Future preparation framework)
  const playFutureSound = (type: 'click' | 'success' | 'unlock' | 'river' | 'wind' | 'birds') => {
    // Console log to signify that standard preparation is fully aligned
    console.log(`[Sound System Active - Future Config]: Played "${type}" hook successfully.`);
    setAudioFeedbackText(`🎵 Simulating sound hook: ${type}`);
    setTimeout(() => setAudioFeedbackText(null), 1800);
  };

  // Determine user-specific goals from onboarding and customize list
  const getSubTasksForLevel = (level: MapLevel) => {
    // Base tasks on their Onboarding inputs in settings
    const priorityFocus = settings.priorityFocus || 'all';
    const pushupsTarget = Math.max(5, settings.pushupsGoal || 5);
    const waterTarget = Math.max(2, settings.waterGoal || 2);
    
    // Level difficulty multiplier (level.id scales 1 to 30)
    const factor = Math.ceil(level.id / 3); 
    
    let list: { id: string, label: string }[] = [];
    
    if (priorityFocus === 'water' || priorityFocus === 'all' || !priorityFocus) {
      list.push({
        id: 'water_sub',
        label: `Inhale deeply & drink ${Math.min(10, Math.ceil(waterTarget / 2) + Math.floor(factor / 2))} cups of pristine pure water.`
      });
    }
    
    if (priorityFocus === 'pushups' || priorityFocus === 'all' || !priorityFocus) {
      list.push({
        id: 'pushups_sub',
        label: `Execute ${Math.min(50, pushupsTarget + (factor * 2))} focused organic pushups.`
      });
    }
    
    list.push({
      id: 'breathing_sub',
      label: `Perform ${10 + (factor * 10)} seconds of calm, heart-synchronizer breathing rhythms.`
    });

    if (level.id % 2 === 0) {
      list.push({
        id: 'reflection_sub',
        label: "Reflect on 1 positive peak moment & save your gratitude report details."
      });
    }

    if (factor > 4) {
      list.push({
        id: 'extra_grit',
        label: "Complete 1 dynamic core mental puzzle game to stimulate memory synapses."
      });
    }

    return list;
  };

  const handleOpenLevel = (level: MapLevel) => {
    vibrate(12);
    // Safety check if level is unlocked
    const isLevelUnlocked = getLevelStatus(level.id) !== 'locked';
    if (!isLevelUnlocked) {
      if (showToast) {
        showToast("Access Locked, Bro! Beat the available levels in sequence to unlock this gate! 🛠️", 'error');
      }
      return;
    }

    setSelectedLevel(level);
    // Reset checked tasks
    setCheckboxes({});
    playFutureSound('click');
  };

  const getLevelStatus = (levelId: number): 'locked' | 'available' | 'completed' => {
    if (completedLevelIds.includes(levelId)) return 'completed';
    
    // Check sequence. Level 1 is always unlocked or if the previous level is completed.
    if (levelId === 1) return 'available';
    if (completedLevelIds.includes(levelId - 1)) return 'available';
    
    return 'locked';
  };

  // Complete a level
  const handleCompleteActiveLevel = () => {
    if (!selectedLevel) return;
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    
    const levelId = selectedLevel.id;
    const isAlreadyComp = completedLevelIds.includes(levelId);
    
    // Prepare updated lists
    const updatedCompleted = isAlreadyComp 
      ? completedLevelIds 
      : [...completedLevelIds, levelId];
    
    // Update stats: coins and XP
    if (onUpdateStats && !isAlreadyComp) {
      onUpdateStats((prev: any) => ({
        ...prev,
        xp: (prev.xp || 0) + selectedLevel.xpReward,
        coins: (prev.coins || 0) + selectedLevel.coinsReward
      }));
    }

    // Handle reward seeds integration with physical inventory!
    if (selectedLevel.milestoneSeedId && gardenState && setGardenState && !isAlreadyComp) {
      const withNewSeed = addSeedToInventory(gardenState, selectedLevel.milestoneSeedId);
      setGardenState(withNewSeed);
    }

    // Check if this completes the world
    const worldLevels = activeWorld.levels.map(l => l.id);
    const completedWorldLevels = worldLevels.filter(id => id === levelId || completedLevelIds.includes(id));
    const isWorldJustCompleted = completedWorldLevels.length === worldLevels.length;

    let updatedUnlockedWorlds = [...unlockedWorldIds];
    if (isWorldJustCompleted && activeWorld.id < 6) {
      const nextWorldId = activeWorld.id + 1;
      if (!updatedUnlockedWorlds.includes(nextWorldId)) {
        updatedUnlockedWorlds.push(nextWorldId);
      }
    }

    // Save
    setCompletedLevelIds(updatedCompleted);
    setUnlockedWorldIds(updatedUnlockedWorlds);
    saveMapProgress(currentWorldId, updatedCompleted, updatedUnlockedWorlds);

    // Prepare celebration details modal
    setCelebrationDetails({
      title: selectedLevel.title,
      xp: selectedLevel.xpReward,
      coins: selectedLevel.coinsReward,
      badge: selectedLevel.milestoneBadge,
      seedId: selectedLevel.milestoneSeedId,
      seedName: selectedLevel.milestoneSeedName,
      isWorldComplete: isWorldJustCompleted
    });

    setSelectedLevel(null);
    setShowCelebration(true);
    playFutureSound('success');

    if (showToast) {
      showToast(`Level ${levelId} Done! Claimed +${selectedLevel.xpReward} XP & +${selectedLevel.coinsReward} Coins! 🏅`, 'success');
    }
  };

  // Trees, Clouds, Windmill items coordinates
  const backgroundItems = [
    { type: 'tree', x: '12%', y: '15%' },
    { type: 'tree', x: '82%', y: '28%' },
    { type: 'tree', x: '25%', y: '50%' },
    { type: 'windmill', x: '18%', y: '68%' },
    { type: 'cloud', x: '5%', y: '8%', duration: 25 },
    { type: 'cloud', x: '45%', y: '42%', duration: 32 },
    { type: 'cloud', x: '15%', y: '75%', duration: 28 },
    { type: 'river', x: '40%', y: '0%' }
  ];

  return (
    <div className="min-h-screen w-full bg-[#1e293b] text-slate-100 flex flex-col overflow-x-hidden relative select-none">
      
      {/* Dynamic Sound Action Debug Banner */}
      {audioFeedbackText && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-indigo-500/90 border border-indigo-400 text-white font-extrabold text-[11px] px-4 py-2 rounded-full z-[800] tracking-wide uppercase shadow-lg select-none">
          {audioFeedbackText}
        </div>
      )}

      {/* ─── DYNAMIC MAP BACKGROUND WITH HIGH PARALLAX & SWING EFFECTS ─── */}
      <div className={`absolute inset-0 bg-[#0F172A] opacity-90 z-0 overflow-hidden pointer-events-none transition-all duration-1000 bg-gradient-to-b ${activeWorld.bgGradient}`}>
        
        {/* Sky / Cloud elements drifting across the screen layout */}
        {backgroundItems.filter(item => item.type === 'cloud').map((cloud, index) => (
          <motion.div
            key={`cloud-${index}`}
            initial={{ x: '-150px' }}
            animate={{ x: '100vw' }}
            transition={{
              duration: cloud.duration || 30,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ top: cloud.y }}
            className="absolute text-5xl opacity-10 filter blur-xs selection:bg-transparent pointer-events-none"
          >
            ☁️
          </motion.div>
        ))}

        {/* Ambient Nature elements (trees, windmills) based on selected world */}
        {backgroundItems.map((item, index) => {
          if (item.type === 'tree') {
            return (
              <motion.div
                key={`tree-${index}`}
                style={{ left: item.x, top: item.y }}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" }}
                className="absolute text-4xl opacity-15 pointer-events-none select-none"
              >
                🌲
              </motion.div>
            );
          }
          if (item.type === 'windmill') {
            return (
              <div 
                key={`windmill-${index}`}
                style={{ left: item.x, top: item.y }}
                className="absolute flex flex-col items-center opacity-25 p-1 pointer-events-none"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="text-3xl"
                >
                  ⚙️
                </motion.div>
                <div className="w-1.5 h-6 bg-slate-600 rounded-t-full -mt-0.5" />
              </div>
            );
          }
          return null;
        })}
        
        {/* Flowing styled river path representation */}
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none z-0">
          <path 
            d="M 120 0 Q 340 300, 200 600 T 150 1200" 
            fill="none" 
            stroke="#38bdf8" 
            strokeWidth="32" 
            strokeLinecap="round" 
            className="animate-pulse"
          />
          <path 
            d="M 120 0 Q 340 300, 200 600 T 150 1200" 
            fill="none" 
            stroke="#0284c7" 
            strokeWidth="8" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-4 flex items-center justify-between z-50 transition-all select-none">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/30 rounded-2xl text-slate-200 transition-colors active:scale-95"
            title="Return back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[9px] font-black tracking-widest uppercase text-emerald-400 block">World Progress Map</span>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400 rotate-12" />
              <h1 className="text-sm font-black text-white tracking-tight uppercase">Nexora Journey</h1>
            </div>
          </div>
        </div>

        {/* Dynamic header stats */}
        <div className="flex items-center gap-2">
          {/* Audio Prep Tooltip button */}
          <button 
            onClick={() => playFutureSound('birds')}
            className="p-2 bg-slate-800 hover:bg-slate-750 rounded-xl text-slate-300 transition-all border border-slate-700/30"
            title="Prepare Ambient Nature sound"
          >
            <Volume2 size={16} />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/40 shadow-inner">
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs font-black text-white">{stats.coins || 0}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/40 shadow-inner">
            <Star className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span className="text-xs font-black text-white">{stats.xp || 0} XP</span>
          </div>
        </div>
      </header>

      {/* ─── WORLD CONTROLLER BANNER (PREMIUM DROPDOWN VIEW) ─── */}
      <div className="w-[92%] max-w-xl mx-auto mt-4 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 flex flex-col shadow-xl z-10 select-none relative">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Realm</span>
            <h2 className="text-base font-black text-white tracking-widest uppercase mt-0.5 flex items-center gap-2">
              🧭 World {activeWorld.id}: {activeWorld.name}
            </h2>
          </div>
          <div className="flex gap-1.5">
            {WORLDS_DATA.map(w => {
              const isUnlocked = unlockedWorldIds.includes(w.id);
              const isActive = currentWorldId === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => handleSwitchWorld(w.id)}
                  title={w.name}
                  className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 scale-110' 
                      : isUnlocked 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                        : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  {isUnlocked ? w.id : <Lock size={10} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-2.5 bg-slate-850/60 rounded-2xl border border-slate-800/45 text-[10.5px] text-slate-300 font-medium leading-relaxed italic">
          "{activeWorld.theme}"
        </div>
      </div>

      {/* ─── VERTICAL ADVENTURE PATH RENDERER ─── */}
      <div className="flex-1 w-full max-w-sm mx-auto px-4 py-12 flex flex-col justify-end items-center relative z-10">
        
        {/* Loop through World levels vertically. Scroll upward means we place level 5 at the TOP, level 1 at the BOTTOM! */}
        <div className="flex flex-col-reverse justify-start items-center space-y-reverse space-y-16 w-full pr-4 relative">
          
          {/* Curved connected SVG path connecting level items in sequence */}
          <svg className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-32 h-full opacity-20 pointer-events-none z-0">
            <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="white" strokeWidth="4" strokeDasharray="8 8" />
          </svg>

          {activeWorld.levels.map((level, idx) => {
            const status = getLevelStatus(level.id);
            const isCompleted = status === 'completed';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';

            // Left/Right alternating layouts to create winding game track feel
            const offsetDir = idx % 2 === 0 ? 'translate-x-[45px] sm:translate-x-[60px]' : '-translate-x-[45px] sm:-translate-x-[60px]';

            return (
              <div 
                key={level.id} 
                className={`relative flex flex-col items-center transition-all z-10 ${offsetDir}`}
              >
                {/* Float level designation overhead */}
                <div className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${isLocked ? 'text-slate-500' : isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Lvl {level.id}
                </div>

                {/* Level Circular Checkpoint Button */}
                <button
                  onClick={() => handleOpenLevel(level)}
                  className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-4 border-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/20' 
                      : isAvailable 
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-amber-300 text-white shadow-xl shadow-amber-500/30 scale-105 animate-[bounce_2s_infinite]' 
                        : 'bg-slate-800 border-4 border-slate-700/80 text-slate-500 cursor-not-allowed opacity-65'
                  }`}
                >
                  {/* Lock/Unlock indicators inside circle checkpoint */}
                  {isCompleted ? (
                    <span className="font-extrabold text-xs">✓</span>
                  ) : isLocked ? (
                    <Lock size={15} />
                  ) : (
                    <span className="font-black text-xs animate-none">PLAY</span>
                  )}

                  {/* Soft pulsing glow loop for the unlocked target level */}
                  {isAvailable && (
                    <div className="absolute inset-0 rounded-full border border-amber-400/60 animate-ping opacity-75" />
                  )}
                </button>

                {/* Level Detail Capsule overlay */}
                <div 
                  onClick={() => status !== 'locked' && handleOpenLevel(level)}
                  className={`mt-2 bg-slate-900/90 border p-2 rounded-2xl w-36 text-center shadow-md select-none cursor-pointer ${
                    isLocked 
                      ? 'border-slate-800/80 opacity-50' 
                      : isCompleted 
                        ? 'border-emerald-500/20 bg-slate-900' 
                        : 'border-amber-500/50 scale-102 font-bold'
                  }`}
                >
                  <p className="text-[10px] uppercase font-black tracking-tight text-white truncate">{level.title}</p>
                  
                  {/* Reward line */}
                  <div className="flex items-center justify-center gap-1 mt-0.5 text-[9px] font-bold text-slate-400 uppercase">
                    <span>+{level.coinsReward}🪙</span>
                    <span>•</span>
                    <span>+{level.xpReward}⭐</span>
                  </div>
                </div>

                {/* Dynamic mini decor element below level check */}
                {idx === 0 && level.id === 1 && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-base select-none whitespace-nowrap opacity-80 pointer-events-none">
                    🏠 Home Base
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── MODAL 1: LEVEL CHALLENGE DETAILS & INTERACTIVE COMPLETE CHECKER ─── */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[600] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
            >
              {/* Top info badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full">
                  <Star size={10} /> Active Challenge Stage
                </div>
                <button 
                  onClick={() => setSelectedLevel(null)}
                  className="p-1 px-3 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-slate-400 hover:text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>

              {/* Title group */}
              <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                🏆 LEVEL {selectedLevel.id}: {selectedLevel.title}
              </h3>
              <p className="text-[11px] text-slate-400 font-extrabold uppercase mt-1 tracking-wide">
                World {activeWorld.id} • {activeWorld.name}
              </p>

              {/* Reward layout panel */}
              <div className="my-5 p-4 bg-slate-850/80 rounded-3xl border border-slate-800 flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[9px] font-black text-slate-400 block uppercase">XP Reward</span>
                  <p className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1 mt-0.5">
                    <Star size={14} className="text-emerald-400" /> +{selectedLevel.xpReward}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center">
                  <span className="text-[9px] font-black text-slate-400 block uppercase">Coin Reward</span>
                  <p className="text-amber-400 font-black text-sm flex items-center justify-center gap-1 mt-0.5 font-mono">
                    <Coins size={14} className="text-amber-400" /> +{selectedLevel.coinsReward}
                  </p>
                </div>
                {selectedLevel.milestoneSeedId && (
                  <>
                    <div className="w-px h-8 bg-slate-800" />
                    <div className="text-center">
                      <span className="text-[9px] font-black text-amber-300 block uppercase flex items-center gap-0.5">🌱 Seed Bonus</span>
                      <p className="text-green-400 font-black text-[11px] uppercase tracking-tighter mt-1 truncate max-w-[100px]">
                        {selectedLevel.milestoneSeedName}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Challenge summary text */}
              <div className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-850 leading-relaxed mb-5 select-none font-medium">
                <span className="text-[9px] font-black text-amber-500 block uppercase mb-1 tracking-widest flex items-center gap-1">
                  <Info size={12} /> Challenge Mission Overview
                </span>
                {selectedLevel.requirementsDescription}
              </div>

              {/* CHECKLIST: Satisfy the user onboarding custom selection requirement */}
              <div className="space-y-3 mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  🎯 Perform Sub-Tasks To Attain Victory:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {getSubTasksForLevel(selectedLevel).map((item) => (
                    <label 
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-slate-850/40 hover:bg-slate-850/70 border border-slate-800 rounded-2xl cursor-pointer select-none group transition-all"
                    >
                      <input 
                        type="checkbox"
                        checked={!!checkboxes[item.id]}
                        onChange={(e) => {
                          vibrate(8);
                          setCheckboxes(prev => ({
                            ...prev,
                            [item.id]: e.target.checked
                          }));
                          if (e.target.checked) playFutureSound('click');
                        }}
                        className="mt-0.5 w-4 h-4 text-emerald-500 rounded-md bg-slate-950 border-slate-800"
                      />
                      <span className="text-[11px] font-bold text-slate-300 leading-normal group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {Object.keys(checkboxes).length === getSubTasksForLevel(selectedLevel).length && 
               Object.values(checkboxes).every(Boolean) ? (
                <button
                  onClick={handleCompleteActiveLevel}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={16} /> Complete Level & Claims Rewards!
                </button>
              ) : (
                <div className="p-3.5 bg-slate-950 text-center rounded-2xl border border-slate-850 text-[10px] font-extrabold text-[#7D6B58] uppercase tracking-wide">
                  Complete all tasks above to lock victory, bro! 🏃‍♂️
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: CELEBRATION WORLD / LEVEL COMPLETION OVERLAY ─── */}
      <AnimatePresence>
        {showCelebration && celebrationDetails && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[700] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-slate-900 border-4 border-amber-400 rounded-[3rem] p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] relative"
            >
              {/* Sparkles particles animation background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem] opacity-35">
                <span className="absolute top-10 left-12 text-3xl animate-bounce">✨</span>
                <span className="absolute bottom-12 right-12 text-3xl animate-pulse">🎉</span>
                <span className="absolute top-28 right-8 text-2xl animate-spin">⭐</span>
              </div>

              <div className="w-20 h-20 bg-amber-400 text-slate-950 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-lg border-2 border-white mb-5 animate-bounce">
                👑
              </div>

              <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">Victory Unlocked!</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                {celebrationDetails.isWorldComplete ? 'World Complete! 🎉' : `Level Cleaned!`}
              </h3>
              <p className="text-xs text-slate-400 font-extrabold mt-1 uppercase italic">"{celebrationDetails.title}"</p>

              {/* Accumulated loot list */}
              <div className="my-6 space-y-2 bg-slate-950 p-5 rounded-2xl border border-slate-850 text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-850 pb-1.5">Claimed Treasures:</p>
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span className="flex items-center gap-1.5"><Coins size={14} /> Nexora Level Coins</span>
                  <span>+{celebrationDetails.coins} Coins</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5"><Star size={14} /> Profile XP Earned</span>
                  <span>+{celebrationDetails.xp} XP</span>
                </div>
                {celebrationDetails.badge && (
                  <div className="flex items-center justify-between text-xs font-bold text-purple-400 pt-1.5 border-t border-slate-850">
                    <span className="flex items-center gap-1.5"><Award size={14} /> Exclusive Badge</span>
                    <span>{celebrationDetails.badge}</span>
                  </div>
                )}
                {celebrationDetails.seedId && (
                  <div className="flex items-center justify-between text-xs font-bold text-green-400 pt-1.5 border-t border-slate-850">
                    <span className="flex items-center gap-1.5">🌱 Milestone Seed</span>
                    <span>{celebrationDetails.seedName}</span>
                  </div>
                )}
              </div>

              {celebrationDetails.isWorldComplete && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-extrabold text-emerald-400 uppercase mb-6 leading-relaxed">
                  Congratulations! All levels inside {activeWorld.name} have been conquered gloriously. Next Realm is now materializing! 🏔️✨
                </div>
              )}

              <button
                onClick={() => {
                  vibrate(10);
                  setShowCelebration(false);
                  setCelebrationDetails(null);
                }}
                className="w-full py-4 bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center block"
              >
                Accept Loot & Run! 👍
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
