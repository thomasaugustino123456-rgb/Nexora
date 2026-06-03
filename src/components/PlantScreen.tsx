import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Droplets, Info, RefreshCw, Sparkles, Sprout, Target, Trophy, Play, X, Lock, ShoppingBag, Package, Trash2, Power, PowerOff } from 'lucide-react';
import { Mascot } from './Mascot';
import { PlantState, UserSettings, UserStats, PlantType } from '../types';
import { vibrate } from '../lib/vibrate';
import { GardenState, addSeedToInventory, PLANT_ARCHETYPES } from '../types/garden';
import { playLootSound } from './LootCard';
import { PlantRenderer } from './PlantRenderer';
import { PlantCompletionCard } from './PlantCompletionCard';
import { PlantShop, EcosystemItem, SHOP_ITEMS } from './PlantShop';
import { VIDEO_URLS } from '../constants/videos';
import { ForestBackdrop } from './ForestBackdrop';

const VideoPlayer = lazy(() => import('./VideoPlayer').then(m => ({ default: m.VideoPlayer })));

interface PlantScreenProps {
  plantState: PlantState;
  onboardingCompleted: boolean;
  onCompleteOnboarding: () => void;
  onExit: () => void;
  onRecover: () => void;
  onSwitchType: (type: PlantType) => void;
  onSaveToLibrary: (imageData: string) => void;
  onPurchaseEcosystemItem: (item: EcosystemItem) => void;
  onToggleEcosystemItem: (itemId: string) => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  settings: UserSettings;
  stats: UserStats;
  gardenState?: GardenState;
  setGardenState?: (g: GardenState) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
  onOpenGarden?: () => void;
}

export const PlantScreen: React.FC<PlantScreenProps> = ({
  plantState,
  onboardingCompleted,
  onCompleteOnboarding,
  onExit,
  onRecover,
  onSwitchType,
  onSaveToLibrary,
  onPurchaseEcosystemItem,
  onToggleEcosystemItem,
  onUpdateSettings,
  settings,
  stats,
  gardenState,
  setGardenState,
  showToast,
  onOpenGarden
}) => {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [showGarden, setShowGarden] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [droneTargetPos, setDroneTargetPos] = useState<{ x: number, y: number } | null>(null);
  const [isLibraryShaking, setIsLibraryShaking] = useState(false);
  const [isAnimatingSeed, setIsAnimatingSeed] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'decorations' | 'seeds'>('decorations');
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);

  const handleAreaClick = (e: React.MouseEvent) => {
    // Triple tap logic
    clickCountRef.current += 1;
    if (clickCountRef.current === 3) {
      vibrate(20);
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setDroneTargetPos({ x, y });
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    } else {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 500);
    }
  };

  const ecosystemInfo: Record<PlantType, { name: string, description: string }> = {
    sprout: { name: "Classic Sprout", description: "The heart of Nexora. A symbol of your new beginning and pure consistency." },
    zen: { name: "Zen Retreat", description: "Bonsai, Bamboo, and Moss. A starting point for focused minds." },
    desert: { name: "Desert Resilience", description: "Cactus and Aloe. Thriving in the toughest conditions." },
    tropical: { name: "Tropical Paradise", description: "Monstera and Bird of Paradise. Vibrant growth and energy." },
    forest: { name: "Ancient Forest", description: "Oak, Fern, and Mushrooms. Deep roots and ancient wisdom." },
    meadow: { name: "Meadow Harmony", description: "Wildflowers and Lavender. Swaying with the rhythm of life." },
    crystal: { name: "Crystal Sanctuary", description: "Floating Air Plants and Crystals. Pure energy and clarity." },
    volcano: { name: "Volcano Forge", description: "Obsidian stems and Lava blooms. Forged in the fires of discipline." },
    boredFlower: { name: "Bored Blossom", description: "Blinks slowly and shifts its eyes. It's seen enough tasks for one lifetime, bro." },
    mourningSprout: { name: "Mourning Sprout", description: "A gentle soul that feels the weight of missed tasks. Its tears nourish the sand below." },
    breezeTulip: { name: "Breeze Tulip", description: "A happy blue tulip that loves the fresh morning wind. It sways happily and inhales the sweet scents of nature." },
    happyTulip: { name: "Radiant Red", description: "A cheerful red tulip that waves its leaves and sparkles with joy. Its happiness is as vibrant as its petals!" },
    distressedRose: { name: "Distressed Rose", description: "A tired rose facing a caterpillar invasion. It needs your tasks to stay strong and dizzy-free!" },
    'slime-berry': { name: "Slime-Berry Sprout", description: "An energetic lime sprout of pure celestial joy. It giggles on check-ins, bro!" },
    'solar-flare-pea': { name: "Solar Flare Pea", description: "A radiant, fiery blossom of discipline. Its leaves glow with the warmth of the sun!" },
    'moon-sprout': { name: "Moon Sprout", description: "A majestic indigo bloom aligned with the moon. It shimmers in cosmic harmony!" },
    'star-silk-leaf': { name: "Star-Silk Leaf", description: "An ultra-rare cosmic clover. Sways with beautiful magenta starlight." },
    'dream-shroom': { name: "Dream-Shroom Forest", description: "A legendary bioluminescent mushroom. It hums motivational chord sequences!" },
    'luck-lotus': { name: "Cosmic Luck Lotus", description: "A mystical pink lotus of extreme fortune. Grown from sacred lunar seeds!" },
    'luck-fern': { name: "Golden Fortune Fern", description: "An epic high-gloss emerald fern that refracts golden dust into your workspace!" },
    'luck-clover': { name: "Emerald Aura Clover", description: "The legendary clover of golden aura. Brings unparalleled focus and good vibes." },
    'luck-orchid': { name: "Astra Velvet Orchid", description: "The crown jewel of botanical matrixes. A deep velvet flower humming with violet electricity!" },
    'luck-cactus': { name: "Solar Mystic Cactus", description: "An epic desert survivor with a fiery coral flower. Thrives elegantly on sheer focus power." }
  };

  const cozySeedsList = [
    { id: 'slime-berry', name: 'Slime-Berry', rarity: 'Common', emoji: '🌱' },
    { id: 'solar-flare-pea', name: 'Solar Flare Pea', rarity: 'Rare', emoji: '🔥' },
    { id: 'moon-sprout', name: 'Moon Sprout', rarity: 'Rare', emoji: '🌙' },
    { id: 'star-silk-leaf', name: 'Star-Silk Leaf', rarity: 'Epic', emoji: '✨' },
    { id: 'dream-shroom', name: 'Dream-Shroom', rarity: 'Legendary', emoji: '🍄' },
    { id: 'luck-lotus', name: 'Cosmic Luck Lotus', rarity: 'Rare', emoji: '🌸' },
    { id: 'luck-fern', name: 'Golden Fortune Fern', rarity: 'Epic', emoji: '🌿' },
    { id: 'luck-clover', name: 'Emerald Aura Clover', rarity: 'Legendary', emoji: '🍀' },
    { id: 'luck-orchid', name: 'Astra Velvet Orchid', rarity: 'Legendary', emoji: '🌌' },
    { id: 'luck-cactus', name: 'Solar Mystic Cactus', rarity: 'Epic', emoji: '🌵' }
  ];

  const onboardingSteps = [
    "Welcome to your Living Plant, bro! 🌿 This space is a reflection of your discipline. As you grow, your ecosystem grows too!",
    "To grow your ecosystem, you need to complete all your daily tasks. Each completion gives the plants growth energy! ✨",
    "THE UNLOCK SYSTEM: To unlock the next plant, you must reach Level 5 in your character progress or keep growing! 🏆",
    "THE SPACE HOUSE: Deep in Nexora lies the legendary Space House! 🛸 To unlock it, you must have at least 3 plants at their Legendary Stage (Level 5)!",
    "Once you reach 3 Legendary plants, the Space House section will unlock and unhide in your main navigation! 🔥",
    "Be careful: If you don't 'water' it (by doing tasks) for 1.5 days, it starts to wilt. 💧 If you wait 2 days, it will die. 🥀",
    "Ready to build your ultimate garden and unlock the Space House? Let's grow together, legend! 🔥🚀"
  ];

  useEffect(() => {
    if (!onboardingCompleted) {
      setMessage(onboardingSteps[step]);
    }
  }, [step, onboardingCompleted]);

  useEffect(() => {
    if (onboardingCompleted && stats) {
      const currentUnlocked = plantState?.unlockedTypes || (['sprout'] as PlantType[]);
      let needsUpdate = false;
      const newUnlocked: PlantType[] = ['sprout'];

      // Dynamically calculate which plants are unlocked based on previous completion stages
      for (let i = 0; i < ECOSYSTEM_PATH.length - 1; i++) {
        const currentType = ECOSYSTEM_PATH[i];
        const progress = settings.plantsProgress?.[currentType];
        if (progress && progress.stage >= 5) {
          const nextType = ECOSYSTEM_PATH[i + 1];
          if (!newUnlocked.includes(nextType)) {
            newUnlocked.push(nextType);
          }
        } else {
          break;
        }
      }

      // Merge with already unlocked types to avoid any data loss
      currentUnlocked.forEach(type => {
        if (!newUnlocked.includes(type)) {
          newUnlocked.push(type);
        }
      });

      if (newUnlocked.length !== currentUnlocked.length || !newUnlocked.every((v, i) => v === currentUnlocked[i])) {
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        onUpdateSettings({
          plantState: {
            ...plantState,
            unlockedTypes: newUnlocked,
          }
        });
      }
    }
  }, [onboardingCompleted, plantState?.unlockedTypes?.length, settings.plantsProgress]);

  const handleNext = () => {
    vibrate(10);
    if (step < onboardingSteps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onCompleteOnboarding();
    }
  };

  const getStageName = (s: number) => {
    switch(s) {
      case 0: return "Seed";
      case 1: return "Sprout";
      case 2: return "Developing";
      case 3: return "Thriving";
      case 4: return "Lush";
      case 5: return "Legendary";
      default: return "Seed";
    }
  };

  const ECOSYSTEM_PATH: PlantType[] = ['sprout', 'zen', 'desert', 'tropical', 'forest', 'meadow', 'crystal', 'volcano', 'boredFlower', 'mourningSprout', 'breezeTulip', 'happyTulip', 'distressedRose'];
  const unlocked = plantState.unlockedTypes || ['sprout'];
  const isForestActive = settings.activeEcosystemItemIds?.includes('eco_forest_01');

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE] z-[120] flex flex-col items-center">
      {isForestActive && <ForestBackdrop />}
      <header className="w-full p-6 flex items-center justify-between z-[140] bg-[#F0F9FF]/80 backdrop-blur-sm sticky top-0">
        <button onClick={onExit} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-black text-blue-900/60 uppercase tracking-widest text-[10px]">Ecosystem</span>
          <span className="font-black text-blue-900 text-sm uppercase">{ecosystemInfo[plantState.type]?.name || "Plant"}</span>
        </div>
        <button 
          onClick={() => { vibrate(5); setShowGarden(!showGarden); }}
          className={`p-2 transition-colors ${showGarden ? 'text-green-500' : 'text-blue-900/40'}`}
        >
          <Trophy size={24} />
        </button>
        <button 
          onClick={() => { 
            vibrate(5); 
            setShowLibrary(true);
            if (settings.hasNewPlantItem) {
              onUpdateSettings({ hasNewPlantItem: false });
            }
          }}
          className={`p-2 transition-all relative ${showLibrary ? 'text-blue-600' : 'text-blue-900/40'} ${settings.hasNewPlantItem || gardenState?.pendingLootSeed ? 'scale-110' : ''}`}
        >
          <motion.div 
            animate={isLibraryShaking ? {
              rotate: [0, -15, 15, -10, 10, -5, 5, 0],
              scale: [1, 1.25, 1.25, 1.15, 1.15, 1],
            } : {}}
            transition={{ duration: 0.6 }}
            className={`p-1.5 rounded-xl transition-all ${settings.hasNewPlantItem || gardenState?.pendingLootSeed ? 'bg-yellow-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse' : ''}`}
          >
            <Package size={24} />
          </motion.div>
          {(settings.hasNewPlantItem || gardenState?.pendingLootSeed) && (
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
          )}
        </button>
        <button 
          onClick={() => { vibrate(5); setShowShop(true); }}
          className={`p-2 transition-colors ${showShop ? 'text-blue-600' : 'text-blue-900/40'}`}
        >
          <ShoppingBag size={24} />
        </button>
      </header>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center justify-start relative w-full px-6 pt-8 pb-32 min-h-full">
        <AnimatePresence>
          {!onboardingCompleted && message && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 50 }}
              className="absolute bottom-64 left-6 right-6 p-8 bg-white rounded-[3rem] shadow-2xl border-4 border-green-500 z-[130] text-center"
            >
              <p className="text-lg font-bold text-green-900 leading-relaxed mb-6 italic">
                "{message}"
              </p>
              <button
                onClick={handleNext}
                className="w-full py-5 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20"
              >
                {step === onboardingSteps.length - 1 ? "Start Gardening! 🌿" : "Next, Bro! 👍"}
              </button>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-b-4 border-r-4 border-green-500 rotate-45" />
            </motion.div>
          )}

          {showGarden && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute inset-0 bg-white/95 backdrop-blur-md z-[150] p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter italic">Your Garden Room</h2>
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Only active plant grows</p>
                </div>
                <button onClick={() => setShowGarden(false)} className="p-2 text-blue-900/40">
                  <ChevronRight size={32} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {ECOSYSTEM_PATH.map((type) => {
                  const isUnlocked = unlocked.includes(type);
                  const isActive = plantState.type === type;
                  const plantData = settings.plantsProgress?.[type] || { stage: 0 };
                  
                  return (
                    <button
                      key={type}
                      disabled={!isUnlocked}
                      onClick={() => { vibrate(10); onSwitchType(type); setShowGarden(false); }}
                      className={`relative group flex flex-col items-center p-6 rounded-[2rem] transition-all duration-700 ${
                        isUnlocked 
                          ? isActive ? 'bg-green-500 text-white shadow-xl shadow-green-500/20' : 'bg-gray-100 hover:bg-gray-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`mb-2 scale-50 -mt-12 -mb-12 transition-all ${!isUnlocked ? 'grayscale brightness-50 opacity-20' : ''}`}>
                        <PlantRenderer 
                          type={type} 
                          stage={isUnlocked ? (plantData.stage || (isActive ? plantState.stage : 0)) : 1} 
                          isThirsty={false} 
                          isDead={false} 
                          activeEcosystemItemIds={isActive ? settings.activeEcosystemItemIds : []}
                        />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? (isActive ? 'text-white' : 'text-blue-900/40') : 'text-blue-900/20'}`}>
                        {ecosystemInfo[type]?.name || "Ecosystem"}
                      </span>
                      {isUnlocked && (
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 mt-1">
                          Stage {plantData.stage}/5
                        </span>
                      )}
                      {!isUnlocked && (
                        <motion.div 
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          className="absolute inset-0 flex items-center justify-center rounded-[2rem] overflow-hidden"
                        >
                           <div className="bg-white/40 backdrop-blur-sm p-4 rounded-full shadow-lg border border-white/60">
                             <Lock size={20} className="text-blue-900/40" />
                           </div>
                        </motion.div>
                      )}
                      {isActive && <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-md">✓</div>}
                    </button>
                  );
                })}
              </div>
              
              <p className="mt-8 text-[10px] text-center font-bold text-blue-900/30 uppercase leading-relaxed px-8">
                Reach Stage 5 (Legendary) on your current plant to unlock the next room in your garden. Only the plant you select will grow from your efforts!
              </p>
            </motion.div>
          )}

          {showCompletion && (
            <PlantCompletionCard 
              type={plantState.type}
              ecosystemName={ecosystemInfo[plantState.type]?.name || "Ecosystem"}
              onSaveToLibrary={onSaveToLibrary}
              onClose={() => setShowCompletion(false)}
            />
          )}

          {showShop && (
            <PlantShop 
              onClose={() => setShowShop(false)}
              stats={stats}
              settings={settings}
              onPurchase={onPurchaseEcosystemItem}
              onToggleActive={onToggleEcosystemItem}
            />
          )}

          {showLibrary && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute inset-0 bg-white/95 backdrop-blur-md z-[150] p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter italic">Ecosystem Library</h2>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Digital Botanical Registry</p>
                </div>
                <button onClick={() => setShowLibrary(false)} className="p-2 text-blue-900/40 hover:bg-blue-50 rounded-full transition-colors">
                  <X size={32} />
                </button>
              </div>

              {/* Tab Switcher Headers */}
              <div className="flex border-b border-gray-100 mb-6 font-semibold">
                <button
                  type="button"
                  onClick={() => { vibrate(5); setLibraryTab('decorations'); }}
                  className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest border-b-2 text-center transition-all ${libraryTab === 'decorations' ? 'border-blue-600 text-blue-900' : 'border-transparent text-gray-400'}`}
                >
                  🎨 Sanctuary Decor
                </button>
                <button
                  type="button"
                  onClick={() => { vibrate(5); setLibraryTab('seeds'); }}
                  className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest border-b-2 text-center transition-all relative ${libraryTab === 'seeds' ? 'border-blue-600 text-blue-900' : 'border-transparent text-gray-400'}`}
                >
                  🌱 Botanical Seeds
                  {Object.values(gardenState?.inventory || {}).some(qty => qty > 0) && (
                    <span className="absolute top-1 right-2 w-2,5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-white" />
                  )}
                </button>
              </div>

              {libraryTab === 'decorations' ? (
                /* DECORATIONS TAB CONTENT */
                (settings.purchasedEcosystemItemIds || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 grayscale opacity-50">
                      <Package size={40} className="text-blue-200" />
                    </div>
                    <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter italic mb-2">Vault is Empty</h3>
                    <p className="text-blue-900/40 text-xs font-bold uppercase max-w-xs leading-loose">
                      Buy and save sanctuary items from the shop to customize your environment, bro!
                    </p>
                    <button 
                      onClick={() => { setShowLibrary(false); setShowShop(true); }}
                      className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                      Go to Shop
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {(settings.purchasedEcosystemItemIds || []).map((itemId: string) => {
                      const item = SHOP_ITEMS.find(i => i.id === itemId);
                      if (!item) return null;
                      const isActive = (settings.activeEcosystemItemIds || []).includes(itemId);
                      
                      return (
                        <div 
                          key={itemId}
                          className={`p-5 rounded-[2rem] border-4 transition-all flex items-center justify-between ${isActive ? 'bg-blue-50 border-blue-400 shadow-xl shadow-blue-500/10' : 'bg-gray-50 border-gray-100 hover:border-blue-200'}`}
                        >
                          <div className="flex items-center gap-5">
                            <div className="text-5xl drop-shadow-sm">{item.icon}</div>
                            <div className="flex flex-col">
                              <h3 className="font-black text-blue-900 uppercase text-sm tracking-tight">{item.name}</h3>
                              <p className="text-[10px] text-blue-900/40 font-bold uppercase tracking-widest">
                                {isActive ? 'Currently Active' : 'In Library'}
                              </p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              vibrate(10);
                              onToggleEcosystemItem(itemId);
                            }}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${isActive ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
                          >
                            {isActive ? <PowerOff size={14} /> : <Power size={14} />}
                            {isActive ? 'Disable' : 'Apply'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* SEEDS LIBRARY TAB CONTENT */
                (() => {
                  const availableSeeds = Object.entries(gardenState?.inventory || {})
                    .filter(([_, qty]) => qty > 0)
                    .map(([id, qty]) => ({ id, qty }));

                  if (availableSeeds.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 opacity-75">
                          <Sprout size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter italic mb-2">No Seeds in Vault</h3>
                        <p className="text-emerald-900/40 text-xs font-bold uppercase max-w-sm leading-loose">
                          Reveal mystery pods inside the Cozy Sanctuary Garden Cozy Luck Draw toMATERIALIZE incredible custom Seeds!
                        </p>
                        <button 
                          onClick={() => { 
                            setShowLibrary(false); 
                            if (onOpenGarden) {
                              onOpenGarden();
                            } else {
                              onExit();
                            }
                          }}
                          className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                          Go to Garden draw 🔮
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-4">
                      {availableSeeds.map(({ id, qty }) => {
                        const seedMeta = cozySeedsList.find(s => s.id === id);
                        const emoji = seedMeta?.emoji || "🌱";
                        const name = seedMeta?.name || id;
                        const rarity = seedMeta?.rarity || "Rare";
                        const desc = ecosystemInfo[id as PlantType]?.description || "A rare, custom hybrid plant.";

                        // Custom background gradients depending on rarity
                        const cardBg = 
                          rarity === 'Legendary' ? 'bg-yellow-50/50 border-yellow-200' :
                          rarity === 'Epic' ? 'bg-fuchsia-50/50 border-fuchsia-200' :
                          rarity === 'Rare' ? 'bg-blue-50/50 border-blue-200' : 'bg-emerald-50/40 border-emerald-100';

                        const textBadge = 
                          rarity === 'Legendary' ? 'text-yellow-700 bg-yellow-100 border-yellow-200' :
                          rarity === 'Epic' ? 'text-fuchsia-700 bg-fuchsia-100 border-fuchsia-200' :
                          rarity === 'Rare' ? 'text-blue-700 bg-blue-100 border-blue-200' : 'text-emerald-700 bg-emerald-100 border-emerald-200';

                        return (
                          <div 
                            key={id}
                            className={`p-5 rounded-[2rem] border-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cardBg}`}
                          >
                            <div className="flex items-center gap-5">
                              <div className="text-5xl filter drop-shadow-sm select-none">{emoji}</div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-extrabold text-[#2C3E50] uppercase text-sm tracking-tight">{name}</h3>
                                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border rounded-full ${textBadge}`}>
                                    {rarity}
                                  </span>
                                  <span className="text-[10px] bg-white border border-gray-200 text-gray-500 font-extrabold px-1.5 py-0.5 rounded-full">
                                    {qty} Owned
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1 leading-relaxed max-w-sm">
                                  {desc}
                                </p>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => {
                                vibrate(20);
                                playLootSound('success');
                                
                                // Reset active workspace plantState to grow this seed!
                                onUpdateSettings({
                                  plantState: {
                                    type: id as PlantType,
                                    stage: 0,
                                    growthPoints: 0,
                                    health: 100,
                                    isDead: false,
                                    isThirsty: false,
                                    lastCheckDate: new Date().toISOString(),
                                    lastGrowthDate: null
                                  }
                                });

                                // Deduct 1 draft from garden inventory
                                if (gardenState && setGardenState) {
                                  const updatedInv = {
                                    ...gardenState.inventory,
                                    [id]: Math.max(0, qty - 1)
                                  };
                                  setGardenState({
                                    ...gardenState,
                                    inventory: updatedInv
                                  });
                                }

                                setShowLibrary(false);
                                showToast && showToast(`Cultivating ${name} seed in active mental workspace! Keep watering to complete its lifecycle! 🌿`, "success");
                              }}
                              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:scale-95 transition-all text-center"
                            >
                              Cultivate Seed 🌱
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CINEMATIC SEED FLY AND OVERLAY SEQUENCE */}
        <AnimatePresence>
          {gardenState?.pendingLootSeed && !isAnimatingSeed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm z-[180] flex items-center justify-center p-6"
            >
              <div className="absolute w-80 h-80 bg-amber-400/15 rounded-full blur-[60px] animate-pulse pointer-events-none" />
              
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 12 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!gardenState || !setGardenState) return;
                  
                  // Play dynamic woosh audio
                  vibrate(30);
                  playLootSound('click');
                  playLootSound('woosh');
                  
                  // Trigger flying animation
                  setIsAnimatingSeed(true);
                  setIsLibraryShaking(true);
                  
                  // Dispatch inventory update on completion
                  setTimeout(() => {
                    setIsAnimatingSeed(false);
                    setIsLibraryShaking(false);
                    
                    const loot = gardenState.pendingLootSeed;
                    if (loot && loot.seedId) {
                      const withInventory = addSeedToInventory(gardenState, loot.seedId);
                      setGardenState({
                        ...withInventory,
                        pendingLootSeed: null
                      });
                    }
                  }, 850);
                }}
                className="w-full max-w-xs bg-stone-900 border-4 border-amber-400 rounded-[3rem] p-8 text-center shadow-2xl relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite] pointer-events-none" />
                
                <h3 className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em] mb-3">Mystical Drop Secured</h3>
                
                <div className="relative my-6 select-none flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl scale-125" />
                  <motion.div
                    animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="text-7xl filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.5)]"
                  >
                    ✉️
                  </motion.div>
                </div>

                <h2 className="text-xl font-black text-amber-550 uppercase tracking-tight text-white">
                  {gardenState.pendingLootSeed.seedName}
                </h2>
                <span className="text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-widest mt-2 inline-block">
                  {gardenState.pendingLootSeed.rarity} Seed
                </span>

                <p className="text-xs text-stone-400 font-bold mt-6 leading-relaxed">
                  Click the seed card to fly it directly to your Sanctuary Vault, bro! 💫
                </p>
                
                <div className="mt-6 w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/35 rounded-2xl flex items-center justify-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">Collect Seed</span>
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {isAnimatingSeed && (
            <motion.div
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ 
                x: '34vw', 
                y: '-42vh', 
                scale: 0.15,
                opacity: 0.3,
                rotate: 360
              }}
              transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="fixed inset-0 z-[190] flex items-center justify-center pointer-events-none"
            >
              <div className="bg-amber-400 p-5 rounded-full text-3xl shadow-[0_0_20px_rgba(251,191,36,0.85)] border-4 border-white">
                🌱
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <div className="w-full max-w-lg space-y-4">
                <div className="flex justify-between items-center text-white">
                  <h3 className="font-black uppercase tracking-widest text-xs italic">Ecosystem Tutorial</h3>
                  <button onClick={() => setShowTutorial(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <Suspense fallback={<div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center text-white/20 text-xs font-black uppercase tracking-widest animate-pulse">Loading Video...</div>}>
                  <VideoPlayer url={VIDEO_URLS.PLANT_TUTORIAL} />
                </Suspense>
                <p className="text-[10px] text-white/40 font-bold text-center uppercase tracking-widest px-8">
                  Learn how to master your garden and keep your level 5 legendary plants alive, bro!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-12 flex flex-col items-center relative" onClick={handleAreaClick}>
          <PlantRenderer 
            type={plantState.type} 
            stage={plantState.stage} 
            isThirsty={plantState.isThirsty} 
            isDead={plantState.isDead} 
            activeEcosystemItemIds={settings.activeEcosystemItemIds}
            isForestActive={isForestActive}
            droneTargetPos={droneTargetPos}
            onDronePositionChange={(pos) => setDroneTargetPos(pos)}
          />
          <motion.div 
            className="mt-8 px-8 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border-2 border-green-100 flex items-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {plantState.isDead ? (
               <div className="flex items-center gap-2 text-red-500 font-black uppercase text-xs">
                 <RefreshCw size={16} /> Restoration Required
               </div>
            ) : (
              <>
                <Sprout size={18} className="text-green-500" />
                <span className="text-green-900 font-black uppercase text-xs tracking-[0.2em]">
                  {getStageName(plantState.stage)}: Level {plantState.stage}/5
                </span>
              </>
            )}
          </motion.div>
          <p className="mt-4 text-[10px] font-bold text-blue-900/40 uppercase tracking-widest text-center px-12 italic">
            {ecosystemInfo[plantState.type]?.description || "Cultivate your garden."}
          </p>
        </div>

        {onboardingCompleted && (
          <div className="w-full max-w-sm space-y-4">
            {plantState.isDead ? (
              <button 
                onClick={() => { vibrate(10); onRecover(); }}
                className="w-full py-6 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-all"
              >
                <RefreshCw size={24} /> Complete Task to Restore
              </button>
            ) : (
              <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-xl space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Growth Energy</span>
                    <span className="text-xs font-black text-green-500">{plantState.growthPoints}%</span>
                  </div>
                  <div className="h-4 bg-gray-100/50 rounded-full overflow-hidden border-2 border-white shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${plantState.growthPoints}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-around">
                   <div className="flex flex-col items-center gap-1">
                      <Droplets size={24} className={plantState.isThirsty ? "text-orange-400 animate-bounce" : "text-blue-400"} />
                      <span className="text-[8px] font-black text-blue-900/40 uppercase">{plantState.isThirsty ? "Thirsty" : "Hydrated"}</span>
                   </div>
                   <div className="w-px h-8 bg-blue-900/5" />
                   <div className="flex flex-col items-center gap-1">
                      <Target size={24} className="text-purple-400" />
                      <span className="text-[8px] font-black text-blue-900/40 uppercase">{stats.streak}d Streak</span>
                   </div>
                   <div className="w-px h-8 bg-blue-900/5" />
                   <div className="flex flex-col items-center gap-1">
                      <Sparkles size={24} className="text-amber-400" />
                      <span className="text-[8px] font-black text-blue-900/40 uppercase">Lv. {stats.level} User</span>
                   </div>
                </div>

                {plantState.stage === 5 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { vibrate(20); setShowCompletion(true); }}
                    className="w-full py-4 mt-4 bg-gradient-to-r from-yellow-400 to-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                  >
                    <Trophy size={16} /> Capture Achievement
                  </motion.button>
                )}
              </div>
            )}
            
            <button 
              onClick={() => { vibrate(5); setShowGarden(true); }}
              className="w-full py-4 bg-white/40 hover:bg-white/60 border border-white/60 rounded-2xl text-[10px] font-black uppercase text-blue-900/60 tracking-widest"
            >
              Enter Garden Room
            </button>

            <button 
              onClick={() => { vibrate(5); setShowTutorial(true); }}
              className="w-full py-4 bg-blue-100/50 hover:bg-blue-200/50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Play size={14} /> Watch Tutorial
            </button>

            <p className="text-[9px] leading-relaxed text-blue-900/20 text-center font-bold px-8 uppercase tracking-tighter opacity-50">
              1.5 days = Thirsty. 2 days = Dead. 
              Keep your discipline sharp, bro.
            </p>
          </div>
        )}

        <div className="absolute bottom-8 right-8 w-24 h-24 pointer-events-none opacity-40">
          <Mascot mood={!onboardingCompleted ? 'happy' : plantState.isDead ? 'angry' : 'happy'} className="w-full h-full" />
        </div>
      </div>
    </div>
  </div>
  );
};
