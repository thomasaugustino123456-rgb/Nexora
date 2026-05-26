import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Flower2, Droplet, Sprout, Sparkles, AlertCircle, 
  HelpCircle, Trash2, Heart, RefreshCw, Trophy, Gift, Star 
} from 'lucide-react';
import { 
  GardenState, createInitialGardenState, PLANT_ARCHETYPES, 
  addSeedToInventory, harvestPlant 
} from '../types/garden';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { playLootSound } from './LootCard';

interface GardenScreenProps {
  onBack: () => void;
  gardenState?: GardenState;
  setGardenState?: (g: GardenState) => void;
}

export const GardenScreen: React.FC<GardenScreenProps> = ({ 
  onBack, 
  gardenState, 
  setGardenState 
}) => {
  // Use props state as the primary source of truth, fall back to initial on blank
  const activeGarden = gardenState || createInitialGardenState();
  const dispatchUpdate = setGardenState || (() => {});

  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [showSeedSelector, setShowSeedSelector] = useState(false);
  const [harvestReward, setHarvestReward] = useState<{ plantName: string; loot: string } | null>(null);

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
    } else if (tile.growthStage < 5) {
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
          return {
            ...t,
            waterCount: shouldGrow ? 0 : nextWater,
            growthStage: shouldGrow ? Math.min(5, t.growthStage + 1) : t.growthStage,
            lastWateredAt: Date.now()
          };
        }
        return t;
      });

      // Update mascot to happy for keeping up with garden discipline!
      const updatedMascot = {
        ...activeGarden.mascotState,
        mood: 'happy' as const,
        lastInteractedAt: Date.now()
      };

      dispatchUpdate({
        ...activeGarden,
        tiles: updatedTiles,
        mascotState: updatedMascot
      });
    } else {
      // Fully mature (Stage 5): Harvest it for loot!
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

    const updatedTiles = activeGarden.tiles.map(t => {
      if (t.tileIndex === selectedTileIndex) {
        return {
          ...t,
          plantId: seedId,
          growthStage: 1,
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
            {activeGarden.mascotState.mood === 'happy' ? '🦊✨' :
             activeGarden.mascotState.mood === 'angry' ? '🦊💢' :
             activeGarden.mascotState.mood === 'sad' ? '🦊💧' : '🦊😐'}
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider">Mascot State</h3>
            <p className="text-xs font-bold text-stone-400 uppercase mt-1">
              "N" is currently feeling <span className="text-emerald-600 font-extrabold">{activeGarden.mascotState.mood}</span>! Keep your daily discipline sharp to secure their joyful mood!
            </p>
          </div>
        </div>

        {/* 3x3 Grid Layout */}
        <div className="grid grid-cols-3 gap-4 w-full aspect-square bg-stone-100 p-4 rounded-[2.5rem] border-2 border-stone-200/45 shadow-inner">
          {activeGarden.tiles.map((tile) => {
            const archetype = tile.plantId ? PLANT_ARCHETYPES[tile.plantId] : null;
            const percentage = tile.plantId && archetype 
              ? Math.floor((tile.growthStage / 5) * 100) 
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
                {tile.plantId && tile.growthStage === 5 && (
                  <div className="absolute inset-0 bg-yellow-400/5 animate-pulse" />
                )}

                {tile.plantId && archetype ? (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    {/* Stage icon/emoji depiction */}
                    <div className="text-3xl filter drop-shadow">
                      {tile.growthStage === 1 ? '🌱' : 
                       tile.growthStage === 2 ? '🌿' : 
                       tile.growthStage === 3 ? '🍀' : 
                       tile.growthStage === 4 ? '🪴' : 
                       (tile.plantId === 'dream-shroom' ? '🍄' : '🌸')}
                    </div>
                    <span className="text-[8px] font-black text-stone-500 uppercase truncate max-w-[70px]">
                      {archetype.name}
                    </span>
                    <span className="text-[7px] font-mono text-stone-400">
                      STG {tile.growthStage}/5 ({percentage}%)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-300">
                    <span className="text-stone-300/70 text-[9px] font-black uppercase tracking-wider">Empty</span>
                    <span className="text-xs text-stone-400/50 font-bold mt-1">Soil</span>
                  </div>
                )}

                {/* Floating Droplet count badge */}
                {tile.plantId && archetype && tile.growthStage < 5 && (
                  <div className="absolute bottom-2 right-2 bg-blue-50 text-blue-600 border border-blue-200/60 rounded-full px-1.5 py-0.5 text-[8px] font-black flex items-center gap-0.5 animate-pulse">
                    <Droplet size={8} className="fill-blue-500" />
                    <span>{tile.waterCount}/{archetype.waterRequired}</span>
                  </div>
                )}

                {/* Sparkling Harvest indicator */}
                {tile.plantId && tile.growthStage === 5 && (
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
                    const arche = PLANT_ARCHETYPES[seed.id] || { name: seed.id, themeColor: 'bg-emerald-100' };
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
