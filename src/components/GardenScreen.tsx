import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Flower2, Droplet, Sprout, Sparkles, AlertCircle, 
  HelpCircle, Trash2, Heart, RefreshCw, Trophy, Gift, Star 
} from 'lucide-react';
import { 
  GardenState, createInitialGardenState, PLANT_ARCHETYPES, 
  addSeedToInventory, harvestPlant, GardenTile, GrowthStage
} from '../types/garden';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { playLootSound } from './LootCard';

interface GardenScreenProps {
  onBack: () => void;
  gardenState?: GardenState;
  setGardenState?: (g: GardenState) => void;
  stats?: any;
  onUpdateStats?: (updater: any) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const GardenScreen: React.FC<GardenScreenProps> = ({ 
  onBack, 
  gardenState, 
  setGardenState,
  stats,
  onUpdateStats,
  showToast
}) => {
  // Use props state as the primary source of truth, fall back to initial on blank
  const initial = createInitialGardenState();
  const activeGarden = {
    ...initial,
    ...gardenState,
    tiles: gardenState?.tiles || initial.tiles,
    inventory: { ...initial.inventory, ...(gardenState?.inventory || {}) },
    mascotState: { ...initial.mascotState, ...(gardenState?.mascotState || {}) }
  };
  const dispatchUpdate = setGardenState || (() => {});

  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [showSeedSelector, setShowSeedSelector] = useState(false);
  const [harvestReward, setHarvestReward] = useState<{ plantName: string; loot: string } | null>(null);

  // Celestial Seed Guess Mini-game state
  const [guessStatus, setGuessStatus] = useState<'idle' | 'shaking' | 'revealed'>('idle');
  const [activePodIndex, setActivePodIndex] = useState<number | null>(null);
  const [revealedSeed, setRevealedSeed] = useState<any>(null);
  const [isLuckySeed, setIsLuckySeed] = useState<boolean>(false);

  // Added interactive states for Cozy Luck Draw
  const [correctPodIndex, setCorrectPodIndex] = useState<number>(() => Math.floor(Math.random() * 3));
  const [rollCost, setRollCost] = useState<number>(5);
  const [wrongPods, setWrongPods] = useState<number[]>([]);

  // Helper inside click handler to guess a pod
  const handleGuessPod = (podIdx: number) => {
    if (guessStatus !== 'idle') return;
    if (wrongPods.includes(podIdx)) return;
    
    // Check if they have enough coins
    const currentCoins = stats?.coins || 0;
    if (currentCoins < rollCost) {
      if (showToast) {
        showToast("Not enough Coins for Celestial Materializer roll, bro! 🪙", "error");
      }
      vibrate(VIBRATION_PATTERNS.ERROR);
      return;
    }

    vibrate(30);
    playLootSound('click');
    setActivePodIndex(podIdx);
    setGuessStatus('shaking');

    // Deduct coins
    if (stats && onUpdateStats) {
      onUpdateStats((prev: any) => ({
        ...prev,
        coins: Math.max(0, prev.coins - rollCost)
      }));
    }

    setTimeout(() => {
      // Check if chosen pod matches correctPodIndex
      if (podIdx === correctPodIndex) {
        // Correct Choice! Winner! Only ONE pod shows a plant seed upon success
        // 60% chance for custom dynamic Luck Seed, 40% standard seed
        const isLuckMaterialized = Math.random() < 0.6;
        let chosenId = '';
        
        if (isLuckMaterialized) {
          const luckPool = ['luck-lotus', 'luck-fern', 'luck-clover', 'luck-orchid', 'luck-cactus'];
          chosenId = luckPool[Math.floor(Math.random() * luckPool.length)];
          setIsLuckySeed(true);
        } else {
          const stdPool = ['slime-berry', 'solar-flare-pea', 'moon-sprout', 'star-silk-leaf', 'dream-shroom'];
          chosenId = stdPool[Math.floor(Math.random() * stdPool.length)];
          setIsLuckySeed(false);
        }

        const archetype = PLANT_ARCHETYPES[chosenId];
        if (archetype) {
          const added = addSeedToInventory(activeGarden, chosenId);
          dispatchUpdate(added);

          setRevealedSeed(archetype);
          setGuessStatus('revealed');
          vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
          playLootSound('success');
          
          // Reset cost and empty status for next game
          setRollCost(5);
          setWrongPods([]);
          setCorrectPodIndex(Math.floor(Math.random() * 3));
          if (showToast) {
            showToast(`Awesome! Found the Seed in Pod ${String.fromCharCode(65 + podIdx)}! Cost reset to 5 Coins. 🌱🏆`, "success");
          }
        } else {
          setGuessStatus('idle');
          setWrongPods([]);
        }
      } else {
        // Wrong Choice!
        setGuessStatus('idle');
        setWrongPods(prev => [...prev, podIdx]);
        // Increase roll cost by 5
        setRollCost(prev => prev + 5);
        vibrate(VIBRATION_PATTERNS.ERROR);
        if (showToast) {
          showToast(`Empty Pod, bro! Finding cost increased to ${rollCost + 5} Coins. Target the remaining pods! 🔮`, "error");
        }
      }
    }, 1400);
  };

  // Helper to identify owned seeds
  const ownedSeeds = Object.entries(activeGarden.inventory || {})
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => ({ id, qty }));

  const handleTileClick = (index: number) => {
    vibrate(10);
    const tile = activeGarden.tiles.find(t => t.tileIndex === index);
    if (!tile) return;

    if (!tile.plantId) {
      // Empty soil: Show seed planting selector if they own any seeds
      setSelectedTileIndex(index);
      setShowSeedSelector(true);
      playLootSound('click');
    } else if (tile.growthStage !== 'Fully Grown') {
      // Growing sprout: Water it to progress growth!
      playLootSound('click');
      vibrate(15);
      
      const archetype = PLANT_ARCHETYPES[tile.plantId];
      if (!archetype) return;

      const updatedTiles = activeGarden.tiles.map(t => {
        if (t.tileIndex === index) {
          const nextWater = t.waterCount + 1;
          // If watered enough, it develops into the next stage!
          const shouldGrow = nextWater >= archetype.waterRequired;
          
          let nextStage = t.growthStage;
          if (shouldGrow) {
            if (t.growthStage === "Seed") nextStage = "Sprout";
            else if (t.growthStage === "Sprout") nextStage = "Bud";
            else if (t.growthStage === "Bud" || !t.growthStage) nextStage = "Fully Grown";
          }

          return {
            ...t,
            waterCount: shouldGrow ? 0 : nextWater,
            growthStage: nextStage,
            lastWateredAt: Date.now()
          };
        }
        return t;
      });

      // Update mascot to happy for keeping up with garden discipline!
      const updatedMascot = {
        mood: 'happy' as const,
        lastInteracted: activeGarden?.mascotState?.lastInteracted || Date.now()
      };

      dispatchUpdate({
        ...activeGarden,
        tiles: updatedTiles,
        mascotState: updatedMascot
      });
    } else {
      // Fully mature (Stage 4 - Fully Grown): Harvest it for loot!
      vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
      playLootSound('success');

      const archetype = PLANT_ARCHETYPES[tile.plantId];
      const result = harvestPlant(activeGarden, index);
      
      setHarvestReward({
        plantName: archetype?.name || "Celestial Sprout",
        loot: result.rewardDropped || "150 Gold Coins & 50 XP"
      });

      dispatchUpdate(result.updatedState);
    }
  };

  const handlePlantSeed = (seedId: string) => {
    if (selectedTileIndex === null) return;
    vibrate(20);
    playLootSound('success');

    const updatedTiles: GardenTile[] = activeGarden.tiles.map((t): GardenTile => {
      if (t.tileIndex === selectedTileIndex) {
        return {
          ...t,
          plantId: seedId,
          growthStage: "Seed" as GrowthStage,
          waterCount: 0,
          plantedAt: Date.now()
        };
      }
      return t;
    });

    // Deduct 1 seed from inventory
    const currentQty = activeGarden.inventory[seedId] || 0;
    const updatedInventory = {
      ...activeGarden.inventory,
      [seedId]: Math.max(0, currentQty - 1)
    };

    dispatchUpdate({
      ...activeGarden,
      tiles: updatedTiles,
      inventory: updatedInventory
    });

    setShowSeedSelector(false);
    setSelectedTileIndex(null);
  };

  // Backdoor dev cheat to instantly refresh seed cooldown or drop a free seed for test convenience!
  const handleDevCheatGiveSeed = () => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    playLootSound('success');
    
    // Pick standard seeds
    const seeds = ['slime-berry', 'solar-flare-pea', 'moon-sprout', 'star-silk-leaf', 'dream-shroom'];
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
    
    // Clear cooldown and add random seed
    const addedState = addSeedToInventory(activeGarden, randomSeed);
    dispatchUpdate({
      ...addedState,
      lastSeedDropAt: undefined // reset cooldown completely
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] text-[#4A443A] overflow-hidden select-none">
      <header className="flex items-center justify-between p-6 border-b border-stone-200/60 bg-white/70 backdrop-blur-sm sticky top-0 z-40">
        <button onClick={onBack} className="p-2.5 hover:bg-stone-100 rounded-full transition-colors active:scale-95 text-stone-500">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black text-[#5A5040] uppercase tracking-wider">Cozy Sanctuary Garden</h1>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">3x3 Soil Grid</span>
        </div>
        <button 
          onClick={handleDevCheatGiveSeed}
          className="p-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider border border-amber-300/30"
          title="Cheat Drop Seed for Review Testing"
        >
          <Sparkles size={14} />
          <span>Dev Drop</span>
        </button>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-start overflow-y-auto max-w-md mx-auto w-full space-y-6">
        
        {/* Mascot / Mood Panel */}
        <div className="w-full bg-white border border-stone-200/50 p-5 rounded-[2rem] flex items-center gap-5 shadow-sm">
          <div className="text-4xl select-none filter drop-shadow">
            {(activeGarden?.mascotState?.mood || 'happy') === 'happy' ? '🦊✨' :
             (activeGarden?.mascotState?.mood || 'happy') === 'angry' ? '🦊💢' :
             (activeGarden?.mascotState?.mood || 'happy') === 'sad' ? '🦊💧' : '🦊😐'}
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider">Mascot State</h3>
            <p className="text-xs font-bold text-stone-400 uppercase mt-1">
              "N" is currently feeling <span className="text-emerald-600 font-extrabold">{activeGarden?.mascotState?.mood || 'happy'}</span>! Keep your daily discipline sharp to secure their joyful mood!
            </p>
          </div>
        </div>

        {/* Celestial Guessing & Luck Seed Draw Section */}
        <div className="w-full bg-gradient-to-br from-stone-900 via-amber-950/80 to-stone-900 text-white border-2 border-amber-500/25 p-6 rounded-[2.5rem] space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 font-bold text-7xl select-none pointer-events-none">✨</div>
          
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-400 rotate-12" /> COZY LUCK DRAW
            </span>
            <h3 className="text-sm font-black uppercase tracking-tight italic mt-0.5">Celestial Seed Materializer</h3>
            <p className="text-[10px] font-bold text-stone-300 leading-relaxed uppercase tracking-wider mt-1">
              Select one of the 3 mystical pods to guess and reveal a rare seed! Saved instantly to your Botanical Library.
            </p>
          </div>

          {guessStatus === 'idle' && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[0, 1, 2].map((idx) => {
                const isWrong = wrongPods.includes(idx);
                return (
                  <motion.button
                    key={idx}
                    disabled={isWrong}
                    whileHover={isWrong ? {} : { scale: 1.05, y: -4 }}
                    whileTap={isWrong ? {} : { scale: 0.95 }}
                    onClick={() => handleGuessPod(idx)}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 relative group focus:outline-none transition-all ${
                      isWrong 
                        ? 'bg-stone-900/60 border border-stone-800 text-stone-600 opacity-40 cursor-not-allowed select-none' 
                        : 'bg-stone-800/80 hover:bg-stone-850 border border-amber-500/20 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-3xl text-amber-300 group-hover:animate-bounce duration-1000">
                      {isWrong ? '💨' : '🔮'}
                    </div>
                    <span className={`text-[10px] font-black tracking-widest uppercase ${isWrong ? 'text-stone-700 font-bold' : 'text-[#9A8975]'}`}>
                      {isWrong ? 'EMPTY' : `POD ${String.fromCharCode(65 + idx)}`}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {guessStatus === 'shaking' && (
            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <motion.div
                animate={{ 
                  x: [-4, 4, -4, 4, 0],
                  y: [-2, 2, -1, 1, 0],
                  rotate: [-3, 3, -1, 1, 0]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 0.25,
                  ease: "easeInOut"
                }}
                className="text-5xl"
              >
                🔮⚡
              </motion.div>
              <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                Materializing Celestial Matrix...
              </p>
            </div>
          )}

          {guessStatus === 'revealed' && revealedSeed && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4 bg-[#FAF9F6]/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-5 text-center relative"
            >
              <div className="absolute top-2 right-2 text-xs">
                <Sparkles className="text-amber-400 animate-spin" size={14} />
              </div>

              {/* Glowing Halo around seed */}
              <div className="relative my-3 w-20 h-20 bg-amber-500/10 rounded-full border border-amber-400/20 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span className="text-5xl filter drop-shadow animate-bounce">
                  {revealedSeed.id === 'luck-lotus' ? '🌸' :
                   revealedSeed.id === 'luck-fern' ? '🌿' :
                   revealedSeed.id === 'luck-clover' ? '🍀' :
                   revealedSeed.id === 'luck-orchid' ? '🌌' :
                   revealedSeed.id === 'luck-cactus' ? '🌵' :
                   revealedSeed.id === 'slime-berry' ? '🟢' :
                   revealedSeed.id === 'solar-flare-pea' ? '🔥' :
                   revealedSeed.id === 'moon-sprout' ? '🌙' : '⭐'}
                </span>
              </div>

              <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest block">
                {revealedSeed.rarity} Secret Sprout Securified
              </span>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                {revealedSeed.name}
              </h4>
              <p className="text-[10px] text-stone-400 font-bold uppercase mt-1 leading-relaxed max-w-[280px]">
                {revealedSeed.id.startsWith('luck-') 
                  ? 'A rare dynamically altered mutation. Cultivate this inside the Ecosystem Library Seeds tab!'
                  : 'A gorgeous celestial base seed. Plant it in the grid below or grow it in your mind garden!'}
              </p>

              <button
                onClick={() => {
                  vibrate(10);
                  playLootSound('click');
                  setGuessStatus('idle');
                  setActivePodIndex(null);
                  setRevealedSeed(null);
                }}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-900 border border-amber-300/20 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
              >
                Claim Seed & Materialize More! 👍
              </button>
            </motion.div>
          )}

          <div className="flex justify-between items-center bg-stone-950/40 px-4 py-2.5 rounded-xl text-[9px] font-black text-stone-400 tracking-wider">
            <span>COST PER ROLL: <span className="text-amber-400">{rollCost} COINS</span></span>
            <span>YOUR VAULT: <span className={(stats?.coins || 0) >= rollCost ? "text-emerald-400 animate-pulse" : "text-stone-500"}>{(stats?.coins || 0)} COINS</span></span>
          </div>
        </div>

        {/* 3x3 Grid Layout */}
        <div className="grid grid-cols-3 gap-4 w-full aspect-square bg-stone-100 p-4 rounded-[2.5rem] border-2 border-stone-200/45 shadow-inner">
          {activeGarden.tiles.map((tile) => {
            const archetype = tile.plantId ? PLANT_ARCHETYPES[tile.plantId] : null;

            const stageNum = 
              tile.growthStage === "Seed" ? 1 :
              tile.growthStage === "Sprout" ? 2 :
              tile.growthStage === "Bud" ? 3 :
              tile.growthStage === "Fully Grown" ? 4 : 0;

            const percentage = tile.plantId && archetype 
              ? Math.floor((stageNum / 4) * 100) 
              : 0;

            return (
              <motion.div 
                whileTap={{ scale: 0.95 }}
                key={tile.tileIndex}
                onClick={() => handleTileClick(tile.tileIndex)}
                className={`aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center relative transition-all cursor-pointer overflow-hidden ${
                  tile.plantId 
                    ? 'bg-white border-stone-200 shadow-sm' 
                    : 'bg-stone-200/70 border-dashed border-stone-300/80 hover:bg-[#F3EFE9]'
                }`}
              >
                {/* Glowing halo when mature */}
                {tile.plantId && tile.growthStage === "Fully Grown" && (
                  <div className="absolute inset-0 bg-yellow-400/5 animate-pulse" />
                )}

                {tile.plantId && archetype ? (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    {/* Stage icon/emoji depiction */}
                    <div className="text-3xl filter drop-shadow">
                      {tile.growthStage === "Seed" ? '🌱' : 
                       tile.growthStage === "Sprout" ? '🌿' : 
                       tile.growthStage === "Bud" ? '🍀' : 
                       (tile.plantId === 'dream-shroom' ? '🍄' : '🌸')}
                    </div>
                    <span className="text-[8px] font-black text-stone-500 uppercase truncate max-w-[70px]">
                      {archetype.name}
                    </span>
                    <span className="text-[7px] font-mono text-stone-400">
                      STG {stageNum}/4 ({percentage}%)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-300">
                    <span className="text-stone-300/70 text-[9px] font-black uppercase tracking-wider">Empty</span>
                    <span className="text-xs text-stone-400/50 font-bold mt-1">Soil</span>
                  </div>
                )}

                {/* Floating Droplet count badge */}
                {tile.plantId && archetype && tile.growthStage !== "Fully Grown" && (
                  <div className="absolute bottom-2 right-2 bg-blue-50 text-blue-600 border border-blue-200/60 rounded-full px-1.5 py-0.5 text-[8px] font-black flex items-center gap-0.5 animate-pulse">
                    <Droplet size={8} className="fill-blue-500" />
                    <span>{tile.waterCount}/{archetype.waterRequired}</span>
                  </div>
                )}

                {/* Sparkling Harvest indicator */}
                {tile.plantId && tile.growthStage === "Fully Grown" && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-stone-900 border border-yellow-300 rounded-full p-1 text-[8px] font-black flex items-center justify-center animate-bounce">
                    <Sparkles size={10} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Inventory Quick Bar */}
        <div className="w-full bg-stone-50 border border-stone-200 p-5 rounded-[2rem] space-y-3">
          <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider">My Inventory Seeds</h3>
          
          {ownedSeeds.length === 0 ? (
            <p className="text-xs font-bold text-stone-400 uppercase leading-relaxed">
              Saved seeds are empty, bro! Finish daily protocol goals on the Home Screen to trigger a lucky seed drop!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ownedSeeds.map((seed) => {
                const arche = PLANT_ARCHETYPES[seed.id];
                return (
                  <div 
                    key={seed.id}
                    className="bg-white border border-stone-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-stone-600"
                  >
                    <span>🌱</span>
                    <span className="font-extrabold">{arche?.name || seed.id}</span>
                    <span className="text-stone-400 font-mono">x{seed.qty}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Streak Savers count */}
        <div className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="text-emerald-600" size={24} />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Streak Savers</span>
              <span className="text-[10px] text-emerald-600/60 font-black uppercase tracking-widest mt-0.5">Harvest Drops Vault</span>
            </div>
          </div>
          <span className="text-xl font-mono font-black text-emerald-800 bg-white border border-emerald-200 px-4 py-1.5 rounded-2xl shadow-sm">
            {activeGarden.streakSavers} Owned
          </span>
        </div>

      </main>

      {/* MODAL overlay for seed planting */}
      <AnimatePresence>
        {showSeedSelector && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-white rounded-t-[3rem] p-8 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black text-stone-800 uppercase tracking-tight">Plant Celestial Seed</h2>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Select an owned sprout</p>
                </div>
                <button 
                  onClick={() => { setShowSeedSelector(false); setSelectedTileIndex(null); }}
                  className="p-2 text-stone-400 hover:bg-stone-50 rounded-full"
                >
                  Close
                </button>
              </div>

              {ownedSeeds.length === 0 ? (
                <div className="py-12 text-center text-stone-400 uppercase font-black text-xs leading-loose">
                  You don't own any seeds right now, bro! Keep completing targets to find them! ✨
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {ownedSeeds.map((seed) => {
                    const arche = PLANT_ARCHETYPES[seed.id] || { name: seed.id, themeColor: 'bg-emerald-100', waterRequired: 3 };
                    return (
                      <button 
                        key={seed.id}
                        onClick={() => handlePlantSeed(seed.id)}
                        className="w-full bg-stone-50 border border-stone-200 hover:border-amber-400 hover:bg-amber-50/10 p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🌱</span>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-stone-800 text-sm">{arche.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">Requires {arche.waterRequired} drops to expand</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-amber-600 bg-white border border-amber-200 px-3 py-1 rounded-full">
                          {seed.qty} Available
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL for Harvesting rewards */}
      <AnimatePresence>
        {harvestReward && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-sm bg-stone-900 border-4 border-emerald-500 rounded-[2.5rem] p-8 text-center relative overflow-hidden"
            >
              <div className="absolute top-4 left-4 text-emerald-400">
                <Sparkles className="animate-pulse" />
              </div>
              <div className="absolute top-4 right-4 text-emerald-400">
                <Sparkles className="animate-bounce" />
              </div>

              <div className="text-5xl my-4">🎁✨</div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Plant Harvested!</h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                Successfully nurtured: <span className="text-emerald-400">{harvestReward.plantName}</span>
              </p>

              <div className="bg-emerald-500/10 border-2 border-emerald-500/25 p-5 rounded-2xl my-6 space-y-2">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase block">Harvest Loot Drop</span>
                <span className="text-sm font-black text-stone-100 block">
                  {harvestReward.loot === 'streak_saver_card' ? '🎫 1x Streak Saver Card!' : harvestReward.loot}
                </span>
                <p className="text-[10px] text-stone-500 font-bold leading-relaxed">
                  Drops are fully saved to your live inventory. Keep your daily habits active, legend!
                </p>
              </div>

              <button 
                onClick={() => setHarvestReward(null)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-stone-950 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
              >
                Claim Loot & Clear soil 👍
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
