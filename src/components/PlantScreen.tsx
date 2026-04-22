import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Droplets, Info, RefreshCw, Sparkles, Sprout, Target, Trophy } from 'lucide-react';
import { Mascot } from './Mascot';
import { PlantState, UserSettings, UserStats, PlantType } from '../types';
import { vibrate } from '../lib/vibrate';
import { PlantRenderer } from './PlantRenderer';
import { PlantCompletionCard } from './PlantCompletionCard';

interface PlantScreenProps {
  plantState: PlantState;
  onboardingCompleted: boolean;
  onCompleteOnboarding: () => void;
  onExit: () => void;
  onRecover: () => void;
  onSwitchType: (type: PlantType) => void;
  onSaveToLibrary: (imageData: string) => void;
  settings: UserSettings;
  stats: UserStats;
}

export const PlantScreen: React.FC<PlantScreenProps> = ({
  plantState,
  onboardingCompleted,
  onCompleteOnboarding,
  onExit,
  onRecover,
  onSwitchType,
  onSaveToLibrary,
  settings,
  stats
}) => {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [showGarden, setShowGarden] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

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
    happyTulip: { name: "Radiant Red", description: "A cheerful red tulip that waves its leaves and sparkles with joy. Its happiness is as vibrant as its petals!" }
  };

  const onboardingSteps = [
    "Welcome to your Living Plant, bro! 🌿 This space is a reflection of your discipline. As you grow, your ecosystem grows too!",
    "To grow your ecosystem, you need to complete all your daily tasks. Each completion gives the plants growth energy! ✨",
    "Once you reach Level 5 (Legendary) on an ecosystem, you unlock the next one! Can you cultivate all 7, bro?",
    "Be careful: If you don't 'water' it (by doing tasks) for 1.5 days, it starts to wilt. 💧 If you wait 2 days, it will die. 🥀",
    "Ready to build your ultimate garden? Let's grow together! 🔥🚀"
  ];

  useEffect(() => {
    if (!onboardingCompleted) {
      setMessage(onboardingSteps[step]);
    }
  }, [step, onboardingCompleted]);

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

  const unlocked = plantState.unlockedTypes || ['zen'];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE] z-[120] flex flex-col items-center">
      <header className="w-full p-6 flex items-center justify-between z-[140] bg-[#F0F9FF]/80 backdrop-blur-md sticky top-0">
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
                <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter italic">Your Garden Room</h2>
                <button onClick={() => setShowGarden(false)} className="p-2 text-blue-900/40">
                  <ChevronRight size={32} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {(Object.keys(ecosystemInfo) as PlantType[]).map((type) => {
                  const isUnlocked = unlocked.includes(type);
                  const isActive = plantState.type === type;
                  
                  return (
                    <button
                      key={type}
                      disabled={!isUnlocked}
                      onClick={() => { vibrate(10); onSwitchType(type); setShowGarden(false); }}
                      className={`relative group flex flex-col items-center p-6 rounded-[2rem] transition-all ${
                        isUnlocked 
                          ? isActive ? 'bg-green-500 text-white shadow-xl shadow-green-500/20' : 'bg-gray-100 hover:bg-gray-200'
                          : 'bg-gray-50 opacity-50 grayscale'
                      }`}
                    >
                      <div className="mb-2 scale-50 -mt-12 -mb-12">
                        <PlantRenderer type={type} stage={isUnlocked ? 5 : 1} isThirsty={false} isDead={false} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{ecosystemInfo[type]?.name || "Ecosystem"}</span>
                      {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-[2rem] backdrop-blur-[2px]">🔒</div>}
                      {isActive && <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-md">✓</div>}
                    </button>
                  );
                })}
              </div>
              
              <p className="mt-8 text-[10px] text-center font-bold text-blue-900/30 uppercase leading-relaxed">
                Reach Stage 5 (Legendary) to unlock the next ecosystem room in your garden.
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
        </AnimatePresence>

        <div className="mb-12 flex flex-col items-center">
          <PlantRenderer type={plantState.type} stage={plantState.stage} isThirsty={plantState.isThirsty} isDead={plantState.isDead} />
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
