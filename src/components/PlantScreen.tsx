import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Droplets, Info, RefreshCw, Sparkles, Sprout, Target, Trophy } from 'lucide-react';
import { Mascot } from './Mascot';
import { PlantState, UserSettings, UserStats } from '../types';
import { vibrate } from '../lib/vibrate';

interface PlantScreenProps {
  plantState: PlantState;
  onboardingCompleted: boolean;
  onCompleteOnboarding: () => void;
  onExit: () => void;
  onRecover: () => void;
  settings: UserSettings;
  stats: UserStats;
}

const PlantSVG: React.FC<{ stage: number; isThirsty: boolean; isDead: boolean }> = ({ stage, isThirsty, isDead }) => {
  const getPlantColor = () => {
    if (isDead) return '#8B4513'; // Brown
    if (isThirsty) return '#C5E1A5'; // Lighter/Yellowish green
    return '#4CAF50'; // Healthy green
  };

  const color = getPlantColor();

  return (
    <motion.svg 
      viewBox="0 0 200 200" 
      className="w-64 h-64 drop-shadow-2xl"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {/* Pot */}
      <path d="M 60,150 L 140,150 L 130,190 L 70,190 Z" fill="#D2691E" />
      <rect x="55" y="145" width="90" height="10" rx="2" fill="#A0522D" />
      
      {/* Soil */}
      <ellipse cx="100" cy="150" rx="35" ry="5" fill="#3E2723" />

      {/* Plant Growth Stages */}
      {!isDead && (
        <g>
          {stage >= 1 && (
            <motion.path 
              d="M 100,150 Q 100,130 110,120" 
              stroke={color} 
              strokeWidth="4" 
              fill="none" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          )}
          {stage >= 2 && (
            <motion.path 
              d="M 100,150 Q 100,110 90,100" 
              stroke={color} 
              strokeWidth="4" 
              fill="none" 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          )}
          {stage >= 3 && (
            <>
              <motion.circle cx="110" cy="120" r="6" fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.circle cx="90" cy="100" r="8" fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.path d="M 100,150 L 100,80" stroke={color} strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            </>
          )}
          {stage >= 4 && (
            <g>
              <motion.path d="M 100,100 Q 130,90 140,70" stroke={color} strokeWidth="4" fill="none" />
              <motion.circle cx="140" cy="70" r="10" fill="#FF4081" initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.path d="M 100,100 Q 70,90 60,70" stroke={color} strokeWidth="4" fill="none" />
              <motion.circle cx="60" cy="70" r="10" fill="#FF4081" initial={{ scale: 0 }} animate={{ scale: 1 }} />
            </g>
          )}
          {stage >= 5 && (
            <g>
              <motion.path d="M 100,80 Q 100,40 120,30" stroke={color} strokeWidth="6" fill="none" />
              <motion.circle cx="120" cy="30" r="15" fill="#ffd700" initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <Sparkles className="text-yellow-400 absolute top-10 right-10 animate-pulse" />
            </g>
          )}
        </g>
      )}

      {/* Dead State */}
      {isDead && (
        <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <path d="M 100,150 L 95,130" stroke="#5D4037" strokeWidth="4" />
          <path d="M 95,130 Q 80,120 75,135" stroke="#5D4037" strokeWidth="2" fill="none" />
          <text x="100" y="120" textAnchor="middle" fontSize="10" fill="#5D4037" className="font-bold">🥀 DEAD</text>
        </motion.g>
      )}

      {/* Wilted State Effects */}
      {isThirsty && !isDead && (
        <motion.g animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
           <path d="M 120,130 Q 125,140 120,150" stroke="#90A4AE" strokeWidth="1" fill="none" opacity="0.5" />
           <text x="100" y="70" textAnchor="middle" fontSize="12" fill="#607D8B" className="font-bold">💧 THIRSTY</text>
        </motion.g>
      )}
    </motion.svg>
  );
};

export const PlantScreen: React.FC<PlantScreenProps> = ({
  plantState,
  onboardingCompleted,
  onCompleteOnboarding,
  onExit,
  onRecover,
  settings,
  stats
}) => {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const onboardingSteps = [
    "Welcome to your Living Plant, bro! 🌿 This little seed is a reflection of your discipline. As you grow, it grows with you!",
    "To grow the plant, you need to complete all your daily tasks and finish your custom plans. Each completion gives the plant growth energy! ✨",
    "Be careful though, bro! If you don't 'water' it (by doing your tasks) for 1.5 days, it starts to wilt and becomes thirsty. 💧",
    "If you neglect it for a full 2 days, the plant will die. 🥀 If that happens, you'll have to complete a new task to restore it from a seed again.",
    "Ready to cultivate your productivity? Let's grow this plant together! 🔥🚀"
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
      case 2: return "Growing";
      case 3: return "Healthy";
      case 4: return "Flowering";
      case 5: return "Legendary";
      default: return "Seed";
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F0F9FF] z-[120] flex flex-col items-center">
      <header className="w-full p-6 flex items-center justify-between">
        <button onClick={onExit} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <span className="font-black text-blue-900/60 uppercase tracking-widest text-xs">Nexora Plant</span>
        <button className="p-2 text-blue-900/20">
          <Info size={24} />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative w-full px-6">
        <AnimatePresence>
          {!onboardingCompleted && message && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 50 }}
              className="absolute bottom-64 left-6 right-6 p-8 bg-white rounded-[3rem] shadow-2xl border-4 border-green-500 z-[130]"
            >
              <p className="text-lg font-bold text-green-900 leading-relaxed mb-6">
                {message}
              </p>
              <button
                onClick={handleNext}
                className="w-full py-5 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20"
              >
                {step === onboardingSteps.length - 1 ? "Let's Start! 🌿" : "Next, Bro! 👍"}
              </button>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-b-4 border-r-4 border-green-500 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-12 flex flex-col items-center">
          <PlantSVG stage={plantState.stage} isThirsty={plantState.isThirsty} isDead={plantState.isDead} />
          <motion.div 
            className="mt-8 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border-2 border-green-100 flex items-center gap-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {plantState.isDead ? (
               <div className="flex items-center gap-2 text-red-500 font-black uppercase text-xs">
                 <RefreshCw size={14} /> Plant Dead
               </div>
            ) : (
              <>
                <Sprout size={16} className="text-green-500" />
                <span className="text-green-900 font-black uppercase text-xs tracking-widest">
                  Level {plantState.stage}: {getStageName(plantState.stage)}
                </span>
              </>
            )}
          </motion.div>
        </div>

        {onboardingCompleted && (
          <div className="w-full max-w-sm space-y-4">
            {plantState.isDead ? (
              <button 
                onClick={() => { vibrate(10); onRecover(); }}
                className="w-full py-5 bg-red-500 text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                <RefreshCw size={24} /> Restore Seed
              </button>
            ) : (
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Growth Progress</span>
                  <span className="text-xs font-black text-green-500">{plantState.growthPoints}%</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${plantState.growthPoints}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-2">
                      <Droplets size={16} className={plantState.isThirsty ? "text-orange-400 animate-pulse" : "text-blue-400"} />
                      <span className="text-[10px] font-bold text-blue-900/60 uppercase">Status: {plantState.isThirsty ? "THIRSTY" : "HYDRATED"}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Target size={16} className="text-purple-400" />
                      <span className="text-[10px] font-bold text-blue-900/60 uppercase">Streak: {stats.streak}d</span>
                   </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 flex flex-col items-center text-center">
                <Trophy size={16} className="text-amber-500 mb-1" />
                <span className="text-[8px] font-black text-blue-900/40 uppercase">Total Growth</span>
                <span className="text-sm font-black text-blue-900">{plantState.stage} Stages</span>
              </div>
              <div className="glass-card p-4 flex flex-col items-center text-center">
                <Sparkles size={16} className="text-blue-500 mb-1" />
                <span className="text-[8px] font-black text-blue-900/40 uppercase">Power Level</span>
                <span className="text-sm font-black text-blue-900">{stats.xp} XP</span>
              </div>
            </div>
            
            <p className="text-[8px] leading-relaxed text-blue-900/30 text-center font-bold px-4 uppercase tracking-tighter">
              Complete your daily tasks to water your plant.
              1.5 Days without water = Thirsty. 
              2 Days without water = Dead.
            </p>
          </div>
        )}

        <div className="absolute bottom-8 right-8 w-24 h-24 pointer-events-none">
          <Mascot mood={!onboardingCompleted ? 'happy' : plantState.isDead ? 'angry' : 'happy'} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};
