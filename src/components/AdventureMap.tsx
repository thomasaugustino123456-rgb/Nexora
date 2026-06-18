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
    } else if (type === 'camel') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.35);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'ice') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2000, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.3);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
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
    } else if (type === 'boss') {
      // Powerful, epic boss sound
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

// Hardcoded coordinates for the 11 levels winding naturally.
// Each world uses these 11 position presets for a gorgeous curved trail.
const LEVEL_COORDS = [
  { left: '50%', bottom: '8%' },   // Level 1: Ground floor / Entry
  { left: '32%', bottom: '16%' },  // Level 2
  { left: '18%', bottom: '24%' },  // Level 3
  { left: '38%', bottom: '32%' },  // Level 4
  { left: '66%', bottom: '40%' },  // Level 5
  { left: '82%', bottom: '48%' },  // Level 6
  { left: '68%', bottom: '56%' },  // Level 7
  { left: '42%', bottom: '64%' },  // Level 8
  { left: '22%', bottom: '72%' },  // Level 9
  { left: '36%', bottom: '80%' },  // Level 10
  { left: '50%', bottom: '90%' }   // Level 11: BOSS
];

export const WORLDS_DATA: World[] = [
  {
    id: 1,
    name: "World 1 — Beginner City",
    theme: "The dawn of growth, quiet residential streets, green parks, and warm city lights.",
    badge: "City Pathfinder 🏙️",
    unlockedSeed: "Beginner Seed",
    seedDescription: "Produces resilient daisies and local urban flora. Essential starter plant.",
    bgColor: "bg-slate-900",
    skyColor: "from-sky-500/10 to-transparent",
    accentColor: "indigo",
    levels: [
      { id: 1, title: "Dawn Path", isBoss: false, requirementsDescription: "Complete at least 2 official challenges and 3 custom plans today.", coinsReward: 15, xpReward: 20 },
      { id: 2, title: "Residential Lane", isBoss: false, requirementsDescription: "Carry out today's habits. Sidestep busy intersections safely.", coinsReward: 20, xpReward: 25 },
      { id: 3, title: "Downtown Boulevard", isBoss: false, requirementsDescription: "Log hydration and tasks. Advance past skyscrapers.", coinsReward: 25, xpReward: 30 },
      { id: 4, title: "Cozy Cafe Focus", isBoss: false, requirementsDescription: "Clear routine limits under morning sun. Stay mentally refreshed.", coinsReward: 30, xpReward: 35 },
      { id: 5, title: "Central Park Rest", isBoss: false, requirementsDescription: "Take an active pause. Verify 2 official achievements to clear.", coinsReward: 35, xpReward: 40 },
      { id: 6, title: "Watering Fountain", isBoss: false, requirementsDescription: "Refresh cognitive batteries. Complete your focus targets.", coinsReward: 40, xpReward: 45 },
      { id: 7, title: "Subway Station", isBoss: false, requirementsDescription: "Maintain clear mental vision inside dense bustling trains.", coinsReward: 45, xpReward: 50 },
      { id: 8, title: "Skyline Overlook", isBoss: false, requirementsDescription: "Peer over metropolitan lights. Check off 3 custom logs.", coinsReward: 50, xpReward: 60 },
      { id: 9, title: "Grid Library", isBoss: false, requirementsDescription: "Review historic logs and study core mindfulness guidelines.", coinsReward: 55, xpReward: 70 },
      { id: 10, title: "Pioneer Crossway", isBoss: false, requirementsDescription: "The final preparation threshold. Double check your custom goals.", coinsReward: 60, xpReward: 80 },
      { id: 11, title: "Apex Skyscraper Boss", isBoss: true, requirementsDescription: "World 1 Climax. Master your habits to claim the Beginner Seed!", coinsReward: 100, xpReward: 150 }
    ]
  },
  {
    id: 2,
    name: "World 2 — Redwood Forest",
    theme: "Vast primeval forests with giant towering redwood trees, waterfalls, and timber bridges.",
    badge: "Redwood Ranger 🌲",
    unlockedSeed: "Redwood Seed",
    seedDescription: "Grows legendary giant forest conifers. Boosts continuous streak bonuses.",
    bgColor: "bg-emerald-950",
    skyColor: "from-emerald-500/10 to-transparent",
    accentColor: "emerald",
    levels: [
      { id: 12, title: "Canopy Arch", isBoss: false, requirementsDescription: "Cross deep under historic giant leaves. Complete 2 official targets.", coinsReward: 25, xpReward: 35 },
      { id: 13, title: "Suspension Bridge", isBoss: false, requirementsDescription: "Cross roaring wild creeks safely on hanging solid logs.", coinsReward: 30, xpReward: 40 },
      { id: 14, title: "Babbling Creek", isBoss: false, requirementsDescription: "Keep hydrated. Let mental stresses drift away like falling moss leaves.", coinsReward: 35, xpReward: 45 },
      { id: 15, title: "Deep Moss Glen", isBoss: false, requirementsDescription: "Step gingerly on ancient green stones. Keep streaks safe.", coinsReward: 40, xpReward: 50 },
      { id: 16, title: "Wild Mushroom Patch", isBoss: false, requirementsDescription: "Explore nature's micro-secrets. Stay consistent under heavy canopies.", coinsReward: 45, xpReward: 55 },
      { id: 17, title: "Forest Ranger Cabin", isBoss: false, requirementsDescription: "Rest under logs. Verify custom plans done to warm up under the hearth.", coinsReward: 50, xpReward: 60 },
      { id: 18, title: "Cascading Waterfall", isBoss: false, requirementsDescription: "Listen closely to falling deep mountain rivers. Clear focus criteria.", coinsReward: 55, xpReward: 70 },
      { id: 19, title: "Hidden Acorn Cave", isBoss: false, requirementsDescription: "Retrieve forgotten physical goals stored deep in the earth.", coinsReward: 60, xpReward: 80 },
      { id: 20, title: "Sun-Ray Grove", isBoss: false, requirementsDescription: "Sip golden daylight filtering down giant redwood redwoods.", coinsReward: 65, xpReward: 90 },
      { id: 21, title: "Ecotourism Trail", isBoss: false, requirementsDescription: "Lead colleagues through redwood flora safely. Maintain checklists.", coinsReward: 70, xpReward: 100 },
      { id: 22, title: "Elder Druid Oak Boss", isBoss: true, requirementsDescription: "World 2 Climax. Best forest hurdles to claim the Redwood Seed!", coinsReward: 120, xpReward: 180 }
    ]
  },
  {
    id: 3,
    name: "World 3 — Golden Desert",
    theme: "Endless shifting orange silica sands, baking suns, prehistoric dinosaur bones, and cacti fields.",
    badge: "Desert Mirage 🌵",
    unlockedSeed: "Golden Cactus",
    seedDescription: "Sprouts resilient golden desert cacti. Maximizes daily focus tolerance.",
    bgColor: "bg-[#3e230a]",
    skyColor: "from-amber-500/10 to-transparent",
    accentColor: "amber",
    levels: [
      { id: 23, title: "Cactus Outpost", isBoss: false, requirementsDescription: "Step past spiky local saguaros. Clear official tasks to keep safe of spines.", coinsReward: 30, xpReward: 45 },
      { id: 24, title: "Shifting Dunes", isBoss: false, requirementsDescription: "Walk over golden dry sand grains. Maintain strong balanced legs.", coinsReward: 35, xpReward: 50 },
      { id: 25, title: "Sun-Parched Ruins", isBoss: false, requirementsDescription: "Discover ancient adobe monuments. Track custom habits today.", coinsReward: 40, xpReward: 55 },
      { id: 26, title: "Fossilized Bones", isBoss: false, requirementsDescription: "Examine prehistoric skeletons buried deep under baking soils.", coinsReward: 45, xpReward: 60 },
      { id: 27, title: "Oasis Springs", isBoss: false, requirementsDescription: "Refresh with pure spring water. Verify 2 completed official goals.", coinsReward: 50, xpReward: 65 },
      { id: 28, title: "Mirage Tunnel", isBoss: false, requirementsDescription: "Avoid dynamic desert illusions by keeping strict mental focus.", coinsReward: 55, xpReward: 75 },
      { id: 29, title: "Clay Adobe Arch", isBoss: false, requirementsDescription: "Pass under historic ruins built by ancient desert nomads.", coinsReward: 60, xpReward: 85 },
      { id: 30, title: "Scorching Silt", isBoss: false, requirementsDescription: "Walk confidently on hot dry earth. Maintain high discipline.", coinsReward: 65, xpReward: 95 },
      { id: 31, title: "Silent Obelisk", isBoss: false, requirementsDescription: "Absorb the knowledge inscribed on ancient clay monument columns.", coinsReward: 70, xpReward: 105 },
      { id: 32, title: "Nomad Merchant", isBoss: false, requirementsDescription: "Trade details and logs for tips to handle harsh desert weather.", coinsReward: 75, xpReward: 115 },
      { id: 33, title: "Sphinx Gold Pyramid Boss", isBoss: true, requirementsDescription: "World 3 Climax. Best the sand beast to claim the Golden Cactus!", coinsReward: 140, xpReward: 210 }
    ]
  },
  {
    id: 4,
    name: "World 4 — Ocean Kingdom",
    theme: "Crystal clear turquoise reef water, swaying palm beaches, active seabirds, coral reefs, and sharks.",
    badge: "Oceanic Corsair 🦈",
    unlockedSeed: "Coral Plant",
    seedDescription: "Grows bioluminescent azure deep sea coral. Generates ambient sleep vibes.",
    bgColor: "bg-[#0b273b]",
    skyColor: "from-cyan-500/10 to-transparent",
    accentColor: "cyan",
    levels: [
      { id: 34, title: "Shallow Beaches", isBoss: false, requirementsDescription: "Wade into beautiful blue waters. Clear 2 official daily metrics.", coinsReward: 35, xpReward: 55 },
      { id: 35, title: "Swaying Palms", isBoss: false, requirementsDescription: "Walk along sandy docks under gentle tropical sea winds.", coinsReward: 40, xpReward: 60 },
      { id: 36, title: "Seagull Outpost", isBoss: false, requirementsDescription: "Observe flying oceanic birds. Match habits to maintain momentum.", coinsReward: 45, xpReward: 65 },
      { id: 37, title: "Coral Cathedral", isBoss: false, requirementsDescription: "Observe glowing underwater coral clusters and active reefs.", coinsReward: 50, xpReward: 75 },
      { id: 38, title: "Drifting Sailboat", isBoss: false, requirementsDescription: "Sail smoothly on clear turquoise tides. Handle custom agendas.", coinsReward: 55, xpReward: 85 },
      { id: 39, title: "Shell Haven", isBoss: false, requirementsDescription: "Gather gorgeous sea shells on secret islands. Complete today's targets.", coinsReward: 60, xpReward: 95 },
      { id: 40, title: "Deep Aquamarine Wall", isBoss: false, requirementsDescription: "Dive down into deep underwater trenches. Breathe deeply and flow.", coinsReward: 65, xpReward: 105 },
      { id: 41, title: "Shark Sanctuary", isBoss: false, requirementsDescription: "Swim safely past big underwater apex sharks. Maintain active focus.", coinsReward: 70, xpReward: 115 },
      { id: 42, title: "Submerged Columns", isBoss: false, requirementsDescription: "Investigate beautiful Atlantis pillars covered in sea leaves.", coinsReward: 75, xpReward: 125 },
      { id: 43, title: "Lagoon Overlook", isBoss: false, requirementsDescription: "Sip coconut milk on tropical sandbars. Polish your streaks.", coinsReward: 80, xpReward: 135 },
      { id: 44, title: "Poseidon Trident Boss", isBoss: true, requirementsDescription: "World 4 Climax. Conquer deep tides to claim the Coral Plant!", coinsReward: 160, xpReward: 250 }
    ]
  },
  {
    id: 5,
    name: "World 5 — Frozen Peaks",
    theme: "Towering snow mountains, glaciers, ice caves, and swirling fluorescent aurora borealis lights.",
    badge: "Glacier Sovereign 🏔️",
    unlockedSeed: "Ice Flower",
    seedDescription: "Blooms frosted freezing winter lotus. Boosts extreme physical focus.",
    bgColor: "bg-sky-950",
    skyColor: "from-sky-500/15 to-transparent",
    accentColor: "sky",
    levels: [
      { id: 45, title: "Frosted Foothills", isBoss: false, requirementsDescription: "Ascend past the snowy limits. Log 2 official challenges.", coinsReward: 45, xpReward: 70 },
      { id: 46, title: "Shivering Pass", isBoss: false, requirementsDescription: "Brave cold biting breezes. Maintain consistency under snowy peaks.", coinsReward: 50, xpReward: 80 },
      { id: 47, title: "Icicle Cathedral", isBoss: false, requirementsDescription: "Pass under giant icicles hanging from frosted rock walls.", coinsReward: 55, xpReward: 90 },
      { id: 48, title: "Aurora Canopy", isBoss: false, requirementsDescription: "View magical dancing violet aurora lights. Keep daily logs fully green.", coinsReward: 60, xpReward: 100 },
      { id: 49, title: "Glacier Crevasse", isBoss: false, requirementsDescription: "Cross deep cracks in solid ice glaciers. Walk carefully and focus.", coinsReward: 65, xpReward: 110 },
      { id: 50, title: "Deep Ice Caves", isBoss: false, requirementsDescription: "Sprout crystal habits in secret underground frosted pathways.", coinsReward: 70, xpReward: 120 },
      { id: 51, title: "Slumbering Village", isBoss: false, requirementsDescription: "Warm up with cozy cabin fireplace embers. Finish 3 custom plans.", coinsReward: 75, xpReward: 130 },
      { id: 52, title: "Avalanche Lookout", isBoss: false, requirementsDescription: "Scent fresh clean pine air on snowy heights. Guard your mental state.", coinsReward: 80, xpReward: 140 },
      { id: 53, title: "Frostbite Trail", isBoss: false, requirementsDescription: "Maintain clear routine ticks to keep frostbite away from habits.", coinsReward: 85, xpReward: 155 },
      { id: 54, title: "Frozen Mirror Lake", isBoss: false, requirementsDescription: "Reflect on progress on ice streams. Keep body active with tasks.", coinsReward: 90, xpReward: 170 },
      { id: 55, title: "Everest Emperor Boss", isBoss: true, requirementsDescription: "World 5 Climax. Master glacier trails to claim the Ice Flower!", coinsReward: 180, xpReward: 300 }
    ]
  },
  {
    id: 6,
    name: "World 6 — Sky Plains",
    theme: "Endless emerald green pastures, wildflowers, spinning warm windmills, and gold rainbows.",
    badge: "Sovereign of Nexora 👑",
    unlockedSeed: "Legendary Nexora Tree",
    seedDescription: "The absolute crown jewel plant. Radiates sovereign positive aura.",
    bgColor: "bg-emerald-900",
    skyColor: "from-yellow-500/10 to-transparent",
    accentColor: "yellow",
    levels: [
      { id: 56, title: "Whispering Pastures", isBoss: false, requirementsDescription: "Step into pristine valleys filled with dandelions and light winds.", coinsReward: 50, xpReward: 80 },
      { id: 57, title: "Rolling Emerald Hills", isBoss: false, requirementsDescription: "Walk up majestic wildflower hills. Check off 2 official goals.", coinsReward: 55, xpReward: 90 },
      { id: 58, title: "Spinning Windmills", isBoss: false, requirementsDescription: "Observe sails spinning gracefully. Sync mental gears with goals.", coinsReward: 60, xpReward: 100 },
      { id: 59, title: "Ethereal Rainbow", isBoss: false, requirementsDescription: "Cross under gold rainbows. Keep focus aligned and beautiful.", coinsReward: 65, xpReward: 110 },
      { id: 60, title: "Butterfly Meadows", isBoss: false, requirementsDescription: "Walk among hundreds of dancing yellow butterflies. Breath deeply.", coinsReward: 70, xpReward: 120 },
      { id: 61, title: "Highland Flute Fields", isBoss: false, requirementsDescription: "Hear lovely acoustic songs. Fill logs with completed checklist ticks.", coinsReward: 75, xpReward: 135 },
      { id: 62, title: "Eagle Nest Lookout", isBoss: false, requirementsDescription: "Peer down at the lands below. Savor the extreme freedom you built.", coinsReward: 80, xpReward: 150 },
      { id: 63, title: "Breezy Wildflowers", isBoss: false, requirementsDescription: "Smell fresh fields of blooming tulips and red roses.", coinsReward: 85, xpReward: 165 },
      { id: 64, title: "Celestial Starway", isBoss: false, requirementsDescription: "Walk near the clouds. Connect your habits with long-term dreams.", coinsReward: 90, xpReward: 180 },
      { id: 65, title: "Sovereign Gates", isBoss: false, requirementsDescription: "Reach the ivory threshold of the grand garden heights. Almost there!", coinsReward: 100, xpReward: 200 },
      { id: 66, title: "The Legendary Nexora Tree Peak", isBoss: true, requirementsDescription: "The ultimate climax. Master self-improvement to claim the Legendary Nexora Tree!", coinsReward: 300, xpReward: 500 }
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
        if (parsed.completedLevelIds) {
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

  // Auto-scroll on mount inside world structure
  useEffect(() => {
    // Determine the active level's world
    const activeLevelWorldIdx = WORLDS_DATA.findIndex(w => w.levels.some(l => l.id === activeLevelId));
    if (activeLevelWorldIdx !== -1) {
      setCurrentWorldIdx(activeLevelWorldIdx);
    }
    
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

  // Strictly validated criteria:
  // - Official Challenges completed today >= 2 (official count)
  // - Custom/Created Plan Challenges completed today >= 3 (custom count)
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

    // World Completion unlock check:
    // If completed Level 11, Level 22, Level 33, Level 44, Level 55, Level 66
    let newlyUnlockedSeed: string | undefined = undefined;
    let seedDesc: string | undefined = undefined;
    let badgeReward: string | undefined = undefined;
    
    const foundWorld = WORLDS_DATA.find(w => w.levels[w.levels.length - 1].id === levelId);
    
    if (foundWorld) {
      newlyUnlockedSeed = foundWorld.unlockedSeed;
      seedDesc = foundWorld.seedDescription;
      badgeReward = foundWorld.badge;

      // Persist unlocked seed to gardenState if accessible
      if (gardenState && setGardenState) {
        const currentSeeds = gardenState.seeds || [];
        if (!currentSeeds.includes(newlyUnlockedSeed)) {
          const updatedSeeds = [...currentSeeds, newlyUnlockedSeed];
          setGardenState({
            ...gardenState,
            seeds: updatedSeeds
          });
          // Persist to local storage
          localStorage.setItem('nexora_garden_state', JSON.stringify({
            ...gardenState,
            seeds: updatedSeeds
          }));
        }
      }
    }

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
    
    if (selectedLevel.isBoss) {
      playNatureSynthSound('victory');
      playNatureSynthSound('boss');
    } else {
      playNatureSynthSound('victory');
    }

    if (showToast) {
      showToast(`Conquered ${selectedLevel.title}! +${selectedLevel.xpReward} XP & Gold! 🏆`, 'success');
    }
  };

  // Simulated rapid developer overrides
  const handleCheatCompleteHabit = () => {
    vibrate(10);
    playNatureSynthSound('chirp');
    if (setDailyProgress) {
      setDailyProgress((prev: any) => ({
        ...prev,
        pushupsDone: true,
        waterDrank: 4,
        breathingDone: true
      }));
      if (showToast) {
        showToast("⚡ Quick-completed 3 Daily App Challenges!", 'success');
      }
    }
  };

  const handleCheatCompletePlan = () => {
    vibrate(10);
    playNatureSynthSound('click');
    localStorage.setItem('nexora_custom_plans_completed_today_count', '3');
    setCompletedLevelIds([...completedLevelIds]);
    if (showToast) {
      showToast("⚡ Quick-completed 3 Custom Plan Challenges!", 'success');
    }
  };

  const handleCheatUnlockAll = () => {
    vibrate(20);
    playNatureSynthSound('victory');
    const allIds = WORLDS_DATA.flatMap(w => w.levels).map(l => l.id);
    setCompletedLevelIds(allIds);
    saveProgress(allIds);
    if (showToast) {
      showToast("👑 unlocked all 66 levels of the Nexora Adventure Map!", 'success');
    }
  };

  const handleCheatResetAll = () => {
    vibrate(30);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem('nexora_custom_plans_completed_today_count', '0');
    setCompletedLevelIds([]);
    if (setDailyProgress) {
      setDailyProgress((prev: any) => ({
        ...prev,
        pushupsDone: false,
        waterDrank: 0,
        breathingDone: false
      }));
    }
    if (showToast) {
      showToast("🔄 Reset Adventure progression successfully.", 'info');
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
            <span className="text-[8px] font-black tracking-widest uppercase text-emerald-400 block font-mono">WORLD ADVENTURE</span>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <h1 className="text-sm font-black text-white uppercase tracking-tight">Nexora Expedition Trails</h1>
            </div>
          </div>
        </div>

        {/* Global Coin & XP Indicators */}
        <div className="flex items-center gap-2">
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

      {/* ─── WORLD NAV BAR (Sequential selector for 6 worlds) ─── */}
      <nav className="absolute top-16 inset-x-0 h-14 bg-[#0a111e] border-b border-white/5 px-4 overflow-x-auto overflow-y-hidden flex items-center gap-2.5 z-40 select-none scrollbar-none">
        {WORLDS_DATA.map((w, idx) => {
          const isWorldUnlocked = completedLevelIds.length >= idx * 11 || idx === 0;
          const isActive = currentWorldIdx === idx;

          return (
            <button
              key={w.id}
              onClick={() => {
                vibrate(5);
                playNatureSynthSound('click');
                if (!isWorldUnlocked) {
                  if (showToast) showToast(`Clear the previous worlds down the track to enter World ${w.id}! 🧭🔒`, 'info');
                  return;
                }
                setCurrentWorldIdx(idx);
                setTimeout(() => {
                  const targetLvl = w.levels[0].id;
                  const elem = document.getElementById(`level-node-${targetLvl}`);
                  if (elem && scrollContainerRef.current) {
                    elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-2xl border text-xs font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/20'
                  : isWorldUnlocked
                    ? 'bg-slate-800/70 border-white/5 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-900/40 border-slate-950 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>World {w.id}</span>
              {!isWorldUnlocked ? <Lock size={10} /> : <span className="text-[10px]">{w.id === 1 ? '🏙️' : w.id === 2 ? '🌲' : w.id === 3 ? '🌵' : w.id === 4 ? '🦈' : w.id === 5 ? '🏔️' : '🌈'}</span>}
            </button>
          );
        })}
      </nav>

      {/* ─── FULL-SCREEN LIVING LANDSCAPE ADVENTURE SCROLL TRACK ─── */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-y-auto pb-44 scroll-smooth scrollbar-none select-none relative"
        style={{ paddingTop: '120px' }} // clear both headers
      >
        <div className="w-full max-w-xl mx-auto flex flex-col relative">

          {/* Living Interactive Canvas layout of the Current Selected World */}
          {(() => {
            const world = WORLDS_DATA[currentWorldIdx];
            return (
              <div 
                key={world.id}
                className={`relative w-full h-[1800px] rounded-[3rem] ${world.bgColor} border border-white/5 overflow-hidden shadow-2xl transition-all duration-500`}
              >
                {/* World Ambient Atmosphere Overlay */}
                <div className={`absolute inset-x-0 top-0 h-44 bg-gradient-to-b ${world.skyColor} pointer-events-none z-10`} />
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

                {/* ─── WORLD SPECIFIC PARALLAX & RICH DYNAMIC CUSTOM GRAPHICS ─── */}

                {/* --- WORLD 1: BEGINNER CITY LANDSCAPE (Skyscrapers, Cafe, Parks, Fountains, Flower garden) --- */}
                {world.id === 1 && (
                  <div className="absolute inset-0 pointer-events-none z-0">
                    
                    {/* Floating Clouds */}
                    <div className="absolute top-14 inset-x-0 h-20 overflow-hidden">
                      <motion.div 
                        animate={{ x: ['-20%', '110%'] }} 
                        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                        className="absolute text-5xl opacity-20 filter drop-shadow"
                      >
                        ☁️
                      </motion.div>
                      <motion.div 
                        animate={{ x: ['-50%', '120%'] }} 
                        transition={{ duration: 45, repeat: Infinity, ease: 'linear', delay: 10 }}
                        className="absolute text-6xl opacity-15 filter blur-[1px]"
                      >
                        ☁️
                      </motion.div>
                    </div>

                    {/* Animated Birds soaring over sky heights */}
                    <motion.div 
                      animate={{ x: ['-10%', '110%'], y: [200, 240, 200] }} 
                      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute text-xl z-20 flex gap-1 text-slate-500"
                    >
                      🕊️<span>🕊️</span>
                    </motion.div>

                    {/* Handcrafted City Skylines (Modern houses, cafe architectures, parks) */}
                    <div className="absolute top-[350px] left-8 w-[140px] h-[190px] bg-slate-800/90 border border-slate-700/50 rounded-2xl p-3 shadow-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-black text-slate-400 block uppercase font-mono border-b border-slate-700/60 pb-1">Metropolitan Cafe</span>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="w-3.5 h-3.5 bg-yellow-400/80 rounded animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                        ))}
                      </div>
                      <span className="text-xl text-center">☕🍰</span>
                    </div>

                    <div className="absolute top-[820px] right-8 w-[160px] h-[220px] bg-slate-800/90 border border-slate-700/50 rounded-2xl p-4 shadow-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-black text-cyan-400 block uppercase font-mono border-b border-slate-700/60 pb-1">Nexora HQ Tower</span>
                      <div className="grid grid-cols-3 gap-2 py-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="w-3.5 h-3 bg-teal-300/60 rounded-sm animate-pulse" />
                        ))}
                      </div>
                      <span className="text-2xl text-center">🏢⭐</span>
                    </div>

                    <div className="absolute top-[1250px] left-8 w-[150px] h-[160px] bg-slate-800/80 border border-slate-700/40 rounded-3xl p-3 flex flex-col justify-between items-center text-center">
                      <span className="text-[8px] font-black tracking-widest text-emerald-400 font-mono uppercase">Neighborhood Park</span>
                      <div className="flex gap-2">
                        <span className="text-2xl animate-bounce" style={{ animationDuration: '3s' }}>🌲</span>
                        <span className="text-2xl animate-bounce" style={{ animationDuration: '4s' }}>🌳</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Flower Patch 🌷🌹</span>
                    </div>

                    {/* Interactive Fluid Fountain with real custom spraying animations */}
                    <div 
                      className="absolute top-[620px] right-14 w-28 h-28 bg-slate-850/90 border border-slate-700/60 rounded-full flex flex-col items-center justify-center pointer-events-auto cursor-pointer shadow-lg active:scale-95 transition-all"
                      onClick={() => {
                        vibrate(5);
                        playNatureSynthSound('river');
                        if (showToast) showToast("⛲ Splashing water fountain! Mind refreshed.", 'info');
                      }}
                      title="Tap the fountain"
                    >
                      <div className="absolute -top-3 flex flex-col gap-0.5 items-center">
                        <span className="text-xl animate-bounce">💦</span>
                        <span className="text-[7px] font-mono font-black text-sky-400 bg-sky-950/80 px-1 py-0.5 rounded border border-sky-500/20 uppercase tracking-widest">TAP SPLASH</span>
                      </div>
                      <span className="text-3xl filter drop-shadow">⛲</span>
                    </div >

                    {/* Bike lanes decorator */}
                    <div className="absolute bottom-[280px] left-1/3 flex items-center gap-1.5 px-3 py-1 bg-slate-800/40 rounded-full border border-white/5 text-[9px] text-slate-400">
                      <span>🚲 Bike Lane Trail</span>
                    </div>
                  </div>
                )}


                {/* --- WORLD 2: WHISPERING REDWOOD FOREST LANDSCAPE (Moss stones, streams, bridges, waterfalls, giant trees) --- */}
                {world.id === 2 && (
                  <div className="absolute inset-0 pointer-events-none z-0">
                    
                    {/* Waving forest shadows & sunrays */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />

                    {/* Giant Redwood Trees trunks rising */}
                    <div className="absolute top-[120px] left-12 w-14 h-[400px] bg-amber-950/40 border-r-4 border-emerald-900/30 rounded-r-3xl flex flex-col justify-between py-10">
                      <span className="text-2xl text-center select-none filter opacity-60">🌲</span>
                      <span className="text-3xl text-center select-none filter opacity-75 animate-pulse">🌲</span>
                    </div>

                    <div className="absolute top-[750px] right-6 w-16 h-[500px] bg-amber-950/40 border-l-4 border-emerald-900/30 rounded-l-3xl flex flex-col justify-between py-12">
                      <span className="text-3xl text-center select-none filter opacity-70 animate-pulse">🌳</span>
                      <span className="text-2xl text-center select-none filter opacity-60">🌲</span>
                    </div>

                    {/* Beautiful Waterfall Cascade (Clickable nature loop) */}
                    <div 
                      className="absolute top-[520px] left-2/3 -translate-x-1/2 w-32 h-32 bg-emerald-900/30 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center pointer-events-auto cursor-pointer hover:bg-emerald-900/40 active:scale-95 transition-all"
                      onClick={() => {
                        vibrate(6);
                        playNatureSynthSound('river');
                        if (showToast) showToast("🌊 Cascading Waterfall flowing down forest cliffs!", "info");
                      }}
                    >
                      <motion.div 
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-4xl text-center"
                      >
                        💧
                      </motion.div>
                      <span className="text-[7.5px] font-black font-mono text-emerald-300 uppercase tracking-widest mt-1">WATERFALL RUSH</span>
                    </div>

                    {/* Butterfly animations */}
                    {Array.from({ length: 4 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          x: [Math.sin(i) * 100 + 100, Math.sin(i) * 100 + 160, Math.sin(i) * 100 + 100],
                          y: [200 + (i * 280), 220 + (i * 280), 200 + (i * 280)]
                        }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute text-lg"
                      >
                        🦋
                      </motion.div>
                    ))}

                    {/* Wooden Bridge and stream crossway graphics */}
                    <div className="absolute top-[1050px] left-1/2 -translate-x-1/2 w-48 h-12 bg-amber-900/60 border-y-2 border-amber-800 rounded-lg flex items-center justify-between px-3 text-amber-200 text-[9px] font-black uppercase font-mono shadow-md z-10">
                      <span>🌁 Suspended Forest Bridge</span>
                      <span>🌲</span>
                    </div>

                    <div className="absolute bottom-[280px] right-20 text-3xl opacity-50">🍄🍄</div>
                    <div className="absolute top-[480px] left-16 text-3xl opacity-40">🍄</div>
                  </div>
                )}


                {/* --- WORLD 3: GOLDEN DESERT LANDSCAPE (Dust drift, heat wave ripple, ancient fossils, camel animation) --- */}
                {world.id === 3 && (
                  <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-amber-950/20 via-transparent to-amber-950/40">
                    
                    {/* Golden Baking Sun */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-16 left-16 w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center border-4 border-amber-300/40 shadow-[0_0_55px_rgba(245,158,11,0.5)] z-20"
                    >
                      <span className="text-4xl">☀️</span>
                    </motion.div>

                    {/* Heat Wave Shimmer Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent animate-pulse-slow mix-blend-color-dodge" />

                    {/* Animated moving camel walking across the golden sands */}
                    <motion.div 
                      animate={{ 
                        x: ['-20%', '115%'],
                        y: [600, 620, 600]
                      }}
                      transition={{ 
                        duration: 32, 
                        repeat: Infinity, 
                        ease: 'linear' 
                      }}
                      className="absolute z-20 pointer-events-auto cursor-pointer"
                      onClick={() => {
                        vibrate(10);
                        playNatureSynthSound('camel');
                        if (showToast) showToast("🐫 Dry Camel braying and chewing cactus!", "info");
                      }}
                      title="Tap the camel"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-4xl filter drop-shadow">🐫</span>
                        <span className="text-[7px] font-bold font-mono text-amber-300 bg-amber-955/80 border border-amber-500/20 px-1 py-0.5 rounded tracking-widest uppercase">TAP BRAY</span>
                      </div>
                    </motion.div>

                    {/* Clay Nomads Tents & Adobe Villages */}
                    <div className="absolute top-[450px] right-12 text-3xl">⛺</div>
                    <div className="absolute top-[1150px] left-16 text-4xl">🕌</div>

                    {/* Cacti fields */}
                    <div className="absolute top-[320px] left-20 text-3xl opacity-50">🌵</div>
                    <div className="absolute top-[950px] right-20 text-3xl opacity-40">🌵</div>
                    <div className="absolute bottom-[220px] left-24 text-4xl opacity-50">🌵</div>

                    {/* Ancient Dinosaur Bones & Fossil remnants ☠️ */}
                    <div className="absolute top-[750px] left-1/4 flex items-center gap-1 opacity-70">
                      <span className="text-2xl">☠️</span>
                      <span className="text-[8px] font-mono font-black text-amber-300 uppercase tracking-widest">Prehistoric Bones</span>
                    </div>

                    <div className="absolute top-[1380px] right-1/4 flex items-center gap-1 opacity-60">
                      <span className="text-xl">🦴</span>
                      <span className="text-[7.5px] font-mono font-bold text-amber-200/50 uppercase tracking-widest">Fossil Site</span>
                    </div>

                    {/* Dust particles drifting */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          x: ['-5%', '105%'],
                          y: [280 + (i * 120), 300 + (i * 120)]
                        }}
                        transition={{ duration: 12 + i, repeat: Infinity, ease: 'linear' }}
                        className="absolute text-[8px] opacity-25 text-amber-200"
                      >
                        ░▒
                      </motion.div>
                    ))}
                  </div>
                )}


                {/* --- WORLD 4: OCEAN KINGDOM LANDSCAPE (Swaying palms, sailing boats, sharks, tropical coral reefs) --- */}
                {world.id === 4 && (
                  <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0e3c5a]/40 to-[#051c2d]/80">
                    
                    {/* Waving Sea Corals on the margin borders */}
                    <div className="absolute bottom-16 left-12 text-5xl opacity-45">🪸</div>
                    <div className="absolute top-[420px] left-8 text-4xl opacity-35">🪸</div>
                    <div className="absolute top-[980px] right-12 text-5xl opacity-50 animate-pulse">🪸</div>

                    {/* Animated Swimming Sharks below seabed level ranges */}
                    <motion.div 
                      animate={{ x: ['115%', '-15%'] }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-[800px] z-10"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-3xl select-none filter drop-shadow">🦈</span>
                        <span className="text-[6.5px] font-black font-mono text-cyan-400 bg-black/40 px-1 rounded uppercase tracking-widest">Shark Guard</span>
                      </div>
                    </motion.div>

                    <motion.div 
                      animate={{ x: ['-15%', '115%'] }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: 4 }}
                      className="absolute top-[1300px] z-10"
                    >
                      <span className="text-2xl">🦈</span>
                    </motion.div>

                    {/* Swaying coconut Palm trees */}
                    <div className="absolute top-[280px] right-8 w-20 h-20 flex flex-col items-center">
                      <span className="text-3xl animate-bounce" style={{ animationDuration: '4s' }}>🌴</span>
                      <span className="text-[7px] text-slate-400 uppercase font-mono mt-1">Islet</span>
                    </div>

                    {/* Animated Sailing Boat floating on the aqua water */}
                    <motion.div
                      animate={{ 
                        x: ['-10%', '110%'],
                        y: [520, 540, 520],
                        rotate: [-3, 3, -3]
                      }}
                      transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute pointer-events-auto cursor-pointer"
                      onClick={() => {
                        vibrate(6);
                        playNatureSynthSound('river');
                        if (showToast) showToast("⛵ Wooden sailboat riding tropical tides!", 'info');
                      }}
                    >
                      <span className="text-3xl filter drop-shadow">⛵</span>
                    </motion.div>

                    {/* Multi-colored Tropical Fish swimming clusters */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          x: i % 2 === 0 ? ['110%', '-10%'] : ['-10%', '110%'],
                          y: [300 + (i * 220), 320 + (i * 220)]
                        }}
                        transition={{ duration: 12 + i, repeat: Infinity, ease: 'linear' }}
                        className="absolute text-xl flex gap-1.5"
                      >
                        <span>🐠</span><span>🐡</span>
                      </motion.div>
                    ))}

                    {/* Ocean water bubbles rising up */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: ['105%', '-5%'],
                          x: [Math.random() * 450, (Math.random() * 450) + 40]
                        }}
                        transition={{ 
                          duration: 8 + Math.random() * 6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: Math.random() * 5
                        }}
                        className="absolute text-xs text-cyan-300 opacity-40"
                      >
                        🫧
                      </motion.div>
                    ))}
                  </div>
                )}


                {/* --- WORLD 5: FROZEN PEAKS LANDSCAPE (Snow village, glaciers, ice caves, blizzard drift, aurora lights) --- */}
                {world.id === 5 && (
                  <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0a182c]/40 via-transparent to-[#050f1d]/85">
                    
                    {/* Spectacular glowing Neon Aurora Borealis Ribbon */}
                    <div className="absolute top-10 inset-x-0 h-44 bg-gradient-to-r from-purple-500/10 via-cyan-400/10 to-indigo-500/10 animate-pulse blur-3xl pointer-events-none z-15" />

                    {/* Fallen Icicle clusters & mountain caverns */}
                    <div className="absolute top-[320px] left-12 text-3xl opacity-50">🧊</div>
                    <div className="absolute top-[850px] right-14 text-4xl opacity-35">🧊</div>
                    <div className="absolute top-[1350px] left-16 text-3xl opacity-45">🧊</div>

                    {/* Cozy Cabin / Frozen Snow Village indicators */}
                    <div className="absolute top-[620px] left-1/4 w-[110px] bg-slate-900/80 border border-sky-400/20 p-2.5 rounded-2xl flex flex-col items-center">
                      <span className="text-2xl animate-pulse">🏡</span>
                      <span className="text-[7.5px] font-mono font-black text-sky-400 uppercase mt-1">Glacier Cabin</span>
                    </div>

                    <div className="absolute top-[1150px] right-1/4 w-[120px] bg-slate-900/80 border border-sky-400/20 p-2.5 rounded-2xl flex flex-col items-center">
                      <span className="text-2xl">🏚️</span>
                      <span className="text-[7.5px] font-mono font-black text-slate-400 uppercase mt-1">Ancient Ice Dome</span>
                    </div>

                    {/* Freezing Glacier mountain peaks in backdrops */}
                    <div className="absolute top-[160px] inset-x-0 flex justify-around">
                      <span className="text-5xl opacity-30">🏔️</span>
                      <span className="text-6xl opacity-25">🏔️</span>
                    </div>

                    {/* Interactive Glacier Breeze crack loop */}
                    <div 
                      className="absolute top-[920px] right-12 text-2xl bg-cyan-500/10 px-3 py-1.5 border border-cyan-400/20 rounded-full flex items-center gap-1 text-cyan-300 pointer-events-auto cursor-pointer active:scale-95 transition-all shadow-inner"
                      onClick={() => {
                        vibrate(6);
                        playNatureSynthSound('ice');
                        if (showToast) showToast("❄️ Extreme icy crack echoes in mountain passes!", "info");
                      }}
                    >
                      🔊 FREEZE COLD
                    </div>

                    {/* Drifting blizzard snowflakes */}
                    {Array.from({ length: 25 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: ['-5%', '105%'],
                          x: [Math.random() * 500, (Math.random() * 500) - 50]
                        }}
                        transition={{ 
                          duration: 4 + Math.random() * 4,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: Math.random() * 4
                        }}
                        className="absolute text-sky-200/60 text-xs"
                      >
                        ❄️
                      </motion.div>
                    ))}
                  </div>
                )}


                {/* --- WORLD 6: SKY PLAINS LANDSCAPE (Endless meadows, windmills rotating, rainbows, cloud palaces) --- */}
                {world.id === 6 && (
                  <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-yellow-500/15">
                    
                    {/* Double Magical Rainbow graphic backdrops */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-80 h-40 border-t-8 border-r-8 border-l-8 border-red-500/15 rounded-full filter blur-[1px] pointer-events-none" />
                    <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[270px] h-[135px] border-t-8 border-r-8 border-l-8 border-yellow-400/10 rounded-full filter blur-[2px] pointer-events-none" />

                    {/* Beautiful Sovereign Kingdom Gate Architecture */}
                    <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-48 bg-slate-900/95 border-3 border-yellow-500 p-4 rounded-3xl text-center shadow-xl">
                      <p className="text-[8px] font-mono font-black text-yellow-400 uppercase tracking-widest animate-pulse">CITADEL SUMMIT</p>
                      <span className="text-3xl my-1.5 block">👑🏛️</span>
                      <span className="text-[9px] font-bold text-slate-300">Legendary Nexora Tree thrives inside the sacred gates.</span>
                    </div>

                    {/* Dynamic Rotating Windmills built with CSS transitions */}
                    <div className="absolute top-[480px] left-12 w-24 h-32 flex flex-col items-center">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                        className="text-4xl"
                      >
                        ☸️
                      </motion.div>
                      <span className="text-[7.5px] font-mono font-black text-emerald-400 mt-1 uppercase">Windmill 1</span>
                    </div>

                    <div className="absolute top-[1020px] right-12 w-24 h-32 flex flex-col items-center">
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        className="text-4xl"
                      >
                        ☸️
                      </motion.div>
                      <span className="text-[7.5px] font-mono font-black text-emerald-400 mt-1 uppercase">Windmill 2</span>
                    </div>

                    {/* Wildflowers fields and butterfly clusters */}
                    <div className="absolute top-[350px] right-16 text-3xl opacity-40">🌷🌻</div>
                    <div className="absolute top-[820px] left-14 text-4xl opacity-50">🌸🌼</div>
                    <div className="absolute bottom-[280px] right-24 text-3xl opacity-40">🌻🌹</div>

                    {/* Flying bird flocks singing soft loops */}
                    <motion.div 
                      animate={{ 
                        x: ['-25%', '120%'],
                        y: [600, 520, 600]
                      }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute z-10 flex gap-1.5"
                    >
                      <span className="text-2xl filter drop-shadow">🐦</span>
                      <span className="text-2xl filter drop-shadow">🐦</span>
                    </motion.div>

                    {/* Sound trigger loops label */}
                    <div 
                      className="absolute top-[720px] left-1/2 -translate-x-1/2 text-xs bg-emerald-400/20 px-3.5 py-1.5 border border-emerald-400/30 rounded-full flex items-center gap-1.5 text-emerald-200 pointer-events-auto cursor-pointer active:scale-95 transition-all shadow-md"
                      onClick={() => {
                        vibrate(5);
                        playNatureSynthSound('chirp');
                        if (showToast) showToast("🎶 Peaceful Skylark melody resonating in pastures!", "info");
                      }}
                    >
                      🔊 PLAY MEADOW CHIRP
                    </div>
                  </div>
                )}

                {/* ─── WORLD DETAILS METADATA BILLBOARD ─── */}
                <div className="absolute top-[4rem] left-6 right-6 z-20 bg-[#0c1424]/90 border border-white/5 p-4 rounded-3xl shadow-2xl flex items-center gap-3.5">
                  <span className="text-3xl p-2 bg-slate-800/80 rounded-2xl shadow-inner select-none">
                    {world.id === 1 ? '🏙️' : world.id === 2 ? '🌲' : world.id === 3 ? '🌵' : world.id === 4 ? '🦈' : world.id === 5 ? '🏔️' : '🌈'}
                  </span>
                  <div>
                    <span className="text-[7.5px] font-mono font-black text-emerald-400 tracking-widest uppercase block">CURRENT WORLD CONQUEST [{world.id}/6]</span>
                    <h2 className="font-extrabold text-sm text-white uppercase tracking-tight leading-none mt-1">{world.name}</h2>
                    <p className="text-[9px] font-medium text-slate-300 italic mt-1 leading-tight">"{world.theme}"</p>
                  </div>
                </div>

                {/* ─── COHESIVE NATURAL WAVING TRAIL CONNECTING ALL 11 LEVELS ─── */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" style={{ zIndex: 1 }}>
                  <path 
                    d="M 50% 1620 C 32% 1476, 18% 1368, 38% 1224 C 66% 1080, 82% 936, 68% 792 C 42% 648, 22% 504, 36% 360 C 50% 180, 50% 180, 50% 180" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="18" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M 50% 1620 C 32% 1476, 18% 1368, 38% 1224 C 66% 1080, 82% 936, 68% 792 C 42% 648, 22% 504, 36% 360 C 50% 180, 50% 180, 50% 180" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="5" 
                    strokeDasharray="12 10"
                    strokeLinecap="round" 
                  />
                </svg>

                {/* ─── DYNAMIC LEVEL RENDER WITH PRECISION PLACEMENT ─── */}
                {world.levels.map((level, idx) => {
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
                      {/* Round Checkpoint Anchor */}
                      <button
                        onClick={() => handleLevelClick(level)}
                        className={`relative rounded-full flex items-center justify-center transition-all duration-300 border-3 border-black shadow-2xl ${
                          level.isBoss 
                            ? 'w-15 h-15 scale-110 ring-4' 
                            : 'w-12 h-12'
                        } ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                            : isAvailable 
                              ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white scale-115 ring-4 ring-orange-500/50 animate-[bounce_2.5s_infinite] border-amber-300' 
                              : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-75'
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={level.isBoss ? 24 : 20} className="stroke-[4px]" />
                        ) : isLocked ? (
                          <Lock size={level.isBoss ? 16 : 14} className="stroke-[2.5px]" />
                        ) : level.isBoss ? (
                          <span className="font-black text-xs font-mono uppercase text-yellow-300 animate-pulse">BOSS</span>
                        ) : (
                          <span className="font-extrabold text-sm font-sans tracking-tight">{level.id}</span>
                        )}

                        {/* Pulsing ring wrapper for available checkpoints */}
                        {isAvailable && (
                          <div className="absolute -inset-2.5 rounded-full border-2 border-orange-400/60 animate-ping opacity-60" />
                        )}
                      </button>

                      {/* Spark of Boss crown above boss levels */}
                      {level.isBoss && !isCompleted && !isLocked && (
                        <div className="absolute -top-5 z-40 bg-yellow-500/90 text-black text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-yellow-400 font-mono scale-95 shadow-md">
                          <Trophy size={6.5} /> Apex Boss
                        </div>
                      )}

                      {/* Micro Stars ratings */}
                      <div className="flex items-center gap-0.5 mt-1 bg-black/80 border border-slate-800/80 px-1.5 py-0.5 rounded-full">
                        <Star size={7.5} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                        <Star size={8} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                        <Star size={7.5} className={isCompleted ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
                      </div>

                      {/* Hover / tap title bubble tooltip */}
                      <div 
                        onClick={() => status !== 'locked' && handleLevelClick(level)}
                        className={`mt-1 max-w-[100px] px-2 py-0.5 bg-[#0f172a] border border-slate-800 rounded-lg text-center transition-all active:scale-95 cursor-pointer shadow-md ${
                          isLocked ? 'opacity-40' : 'hover:bg-slate-900 border-slate-700'
                        }`}
                      >
                        <p className="text-[7px] font-mono font-black text-amber-400 uppercase leading-none">LVL {level.id}</p>
                        <p className="text-[8px] font-black text-white truncate max-w-[85px] uppercase leading-tight mt-0.5">{level.title}</p>
                      </div>

                    </div>
                  );
                })}

              </div>
            );
          })()}

        </div>
      </div>

      {/* ─── REWRITE VERIFICATION ADVENTURE DEV PANEL (FOR USER CONVENIENCE SIMULTANEOUS TEST) ─── */}
      <footer className="absolute bottom-0 inset-x-0 h-16 bg-[#090f1a]/95 border-t border-white/5 py-2 px-4 flex items-center justify-around z-50 shadow-2xl">
        <button 
          onClick={handleCheatCompleteHabit}
          className="flex-1 max-w-[130px] p-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider font-mono mx-1 flex flex-col items-center justify-center leading-tight transition-all active:scale-95"
        >
          <span>Quick Log</span>
          <span>Official Habit</span>
        </button>
        <button 
          onClick={handleCheatCompletePlan}
          className="flex-1 max-w-[130px] p-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider font-mono mx-1 flex flex-col items-center justify-center leading-tight transition-all active:scale-95"
        >
          <span>Quick Log</span>
          <span>Custom Plan</span>
        </button>
        <button 
          onClick={handleCheatUnlockAll}
          className="flex-1 max-w-[130px] p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider font-mono mx-1 flex flex-col items-center justify-center leading-tight transition-all active:scale-95 animate-pulse"
        >
          <span>⚡ CHEAT UNLOCK</span>
          <span>ALL 66 LEVELS</span>
        </button>
        <button 
          onClick={handleCheatResetAll}
          className="p-2 bg-slate-800/80 hover:bg-rose-900/20 border border-slate-700 hover:border-rose-900/40 text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-wider font-mono mx-1 flex flex-col items-center justify-center leading-tight transition-all active:scale-95"
          title="Reset progression"
        >
          <span>RESET MAP</span>
        </button>
      </footer>

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
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[8.5px] uppercase rounded-full border border-slate-700 transition-all font-mono"
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
                      style={{ width: `${Math.min(100, (currentHabits.official / 2) * 100)}%` }}
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
                      style={{ width: `${Math.min(100, (currentHabits.custom / 3) * 100)}%` }}
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
                  <div className="p-3 bg-rose-500/10 border border-rose-550/20 rounded-2xl flex items-start gap-2.5">
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

              <div className="text-5xl my-4 animate-bounce">📦🏆🎉</div>

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
                    <span className="text-lg">🌱 Rare Prize Unlocked!</span>
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
