import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ScreenWater } from './ScreenWater';
import { UserStats, DailyProgress, UserSettings } from '../types';

interface HydrationDetailPageProps {
  stats: UserStats;
  setStats: (s: Partial<UserStats> | ((prev: UserStats) => UserStats)) => void;
  dailyProgress: DailyProgress;
  setDailyProgress: (p: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress)) => void;
  onBack: () => void;
  play?: (sound: string) => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  settings: UserSettings;
  consecutiveDays: number;
  setConsecutiveDays: (d: number) => void;
  waterLevel: number;
  setWaterLevel: (l: number) => void;
  pendingCoinsAdded: boolean;
}

export const HydrationDetailPage: React.FC<HydrationDetailPageProps> = ({
  stats,
  setStats,
  dailyProgress,
  setDailyProgress,
  onBack,
  play,
  showToast,
  settings,
  consecutiveDays,
  setConsecutiveDays,
  waterLevel,
  setWaterLevel,
  pendingCoinsAdded,
}) => {
  const [time, setTime] = useState(0);

  // Time ticker for organic water bobbing waves inside the bottle
  useEffect(() => {
    let active = true;
    let frameId: number;
    const tick = () => {
      if (!active) return;
      setTime((prev) => prev + 1);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Compute todays values for hydration progress
  const finalGoal = settings?.waterGoal || 8;
  const finalDrunk = dailyProgress?.waterDrank ?? Math.round(waterLevel * finalGoal) ?? 0;
  const activeProgress = Math.min(Math.max(finalDrunk / finalGoal, 0), 1);

  // Surface waving animations inside bottle SVG
  const fillY = 468 - (activeProgress * 333);
  const wave1 = Math.sin(time * 0.05) * 5;
  const wave2 = Math.cos(time * 0.06) * 4;

  const foregroundWaterPath = `
    M 50,${fillY + wave1}
    Q 100,${fillY + wave1 + wave2} 150,${fillY + wave2}
    L 150,470
    L 50,470
    Z
  `;

  const backgroundWaterPath = `
    M 50,${fillY - 8 + wave2}
    Q 100,${fillY - 8 + wave1} 150,${fillY - 8 + wave1 + wave2}
    L 150,470
    L 50,470
    Z
  `;

  // Interactive drinking logger
  const handleLogCup = () => {
    if (play) play('water');

    const nextDrunk = finalDrunk + 1;
    
    // 1. Update daily water consumed
    setDailyProgress((prev) => ({
      ...prev,
      waterDrank: nextDrunk,
    }));

    // 2. Adjust visual water fill ratio (0 to 1)
    const newRatio = Math.min(nextDrunk / finalGoal, 1);
    setWaterLevel(newRatio);

    if (showToast) {
      showToast(`Glug glug! Logged 1 Cup of Water 💧`, "success");
    }

    // 3. Complete Water Challenge state if goal met
    if (nextDrunk === finalGoal) {
      if (play) play('challenge_unlock');
      
      // Reward the user with coins
      setStats((prev) => ({
        ...prev,
        coins: (prev.coins || 0) + 10,
        streak: prev.streak + 1
      }));

      // Increment streak days
      setConsecutiveDays(consecutiveDays + 1);

      if (showToast) {
        showToast("Eco Hydration Bottle Filled! +10 Coins Added! 🏆🌱", "success");
      }
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-full bg-gradient-to-b from-[#FAF7F2] to-[#F4F0E2] text-[#4F3F34] overflow-hidden select-none flex flex-col justify-between z-[200]">
      
      {/* Background sloshing liquid - fixed very low at the bottom of the screen */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <ScreenWater progress={0.06} />
      </div>

      {/* Top Header - Back Button & Coin Counter */}
      <header className="px-6 pt-12 flex items-center justify-between relative z-50">
        <button
          onClick={() => {
            if (play) play('click');
            onBack();
          }}
          className="p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E9E4D4] hover:bg-white active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center text-[#4F3F34]"
        >
          <ArrowLeft size={22} className="text-[#0ea5e9]" />
        </button>

        {/* Small coin icon counter positioned on top of the screen */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-200 shadow-md">
          <span className="text-xl animate-bounce" style={{ animationDuration: '3s' }}>🪙</span>
          <span className="font-sans font-black text-amber-600 text-sm">{stats.coins || 0}</span>
        </div>
      </header>

      {/* Main Container - Modern Dashboard featuring bottle on left, and ring widget + streak counter on right */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center relative z-40 -mt-6 md:-mt-10 pb-20">
        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-14 xl:gap-20 w-full">
          
          {/* Left Column: Majestic 512px footprint containing the Water Bottle */}
          <div className="flex items-center justify-center flex-shrink-0 animate-in fade-in duration-500 max-w-full">
            <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] md:w-[512px] md:h-[512px] flex items-center justify-center drop-shadow-[0_25px_60px_rgba(14,165,233,0.22)] bg-white/20 p-6 rounded-[3rem] border border-white/30 backdrop-blur-sm">
              
              <svg
                viewBox="0 0 200 500"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[200px] h-full overflow-visible"
              >
                <defs>
                  {/* Inner cavity mask to clip water inside the container perfectly */}
                  <clipPath id="bottle-inner-mask">
                    <path
                      d="
                        M 84,130
                        L 84,82
                        L 116,82
                        L 116,130
                        C 116,130 126,155 148,175
                        L 148,452
                        Q 148,468 132,468
                        L 68,468
                        Q 52,468 52,452
                        L 52,175
                        C 52,175 74,155 84,130
                        Z
                      "
                    />
                  </clipPath>

                  {/* Glass reflective radial glare */}
                  <linearGradient id="glass-specular" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.25" />
                  </linearGradient>

                  {/* Rich water body colors with shading */}
                  <linearGradient id="water-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.98" />
                  </linearGradient>
                </defs>

                {/* Ground Shadow underneath the bottle */}
                <ellipse cx="100" cy="482" rx="60" ry="8" fill="#000000" fillOpacity="0.18" filter="blur(3px)" />

                {/* 1. LIQUID CONTENTS (Clamped inside bottle body cavity) */}
                <g clipPath="url(#bottle-inner-mask)">
                  {/* Soft backing glass refraction tint */}
                  <rect x="30" y="30" width="140" height="440" fill="#e0f2fe" fillOpacity="0.3" />
                  <ellipse cx="100" cy="300" rx="46" ry="164" fill="#0ea5e9" fillOpacity="0.06" />

                  {/* Parallax background waver */}
                  <motion.path
                    d={backgroundWaterPath}
                    fill="#0284c7"
                    opacity="0.4"
                    animate={{ y: [0, -1, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  />

                  {/* Main foreground sloshing liquid */}
                  <motion.path
                    d={foregroundWaterPath}
                    fill="url(#water-body-grad)"
                    animate={{ y: [0, 1.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  />

                  {/* Tiny rising oxygen bubbles inside the water */}
                  {activeProgress > 0 && (
                    <g fill="#ffffff" fillOpacity="0.7">
                      <circle cx="82" cy="350" r="2.5" className="animate-bounce" style={{ animationDuration: '3s' }} />
                      <circle cx="120" cy="410" r="3" className="animate-bounce" style={{ animationDuration: '4s' }} />
                      <circle cx="68" cy="280" r="2" className="animate-bounce" style={{ animationDuration: '2.5s' }} />
                      <circle cx="110" cy="310" r="3.5" className="animate-bounce" style={{ animationDuration: '3.5s' }} />
                      <circle cx="95" cy="440" r="2" className="animate-bounce" style={{ animationDuration: '5s' }} />
                    </g>
                  )}
                </g>

                {/* 2. REALISTIC GLOSSY GLASS SHELL (Drawn on top for perfect specular refraction) */}
                <path
                  d="
                    M 80,130
                    L 80,82
                    L 120,82
                    L 120,130
                    C 120,130 132,155 154,175
                    L 154,452
                    Q 154,472 132,472
                    L 68,472
                    Q 46,472 46,452
                    L 46,175
                    C 46,175 68,155 80,130
                    Z
                  "
                  fill="url(#glass-specular)"
                  fillOpacity="0.3"
                  stroke="#0ea5e9"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />

                {/* Thread details near the neck */}
                <line x1="82" y1="92" x2="118" y2="92" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
                <line x1="82" y1="102" x2="118" y2="102" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
                <line x1="82" y1="112" x2="118" y2="112" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />

                {/* Premium shiny cap on top */}
                <rect x="74" y="44" width="52" height="38" rx="8" fill="#1e40af" stroke="#0ea5e9" strokeWidth="3" />
                <line x1="84" y1="48" x2="84" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
                <line x1="92" y1="48" x2="92" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
                <line x1="100" y1="48" x2="100" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
                <line x1="108" y1="48" x2="108" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
                <line x1="116" y1="48" x2="116" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />

                {/* Glossy linear highlights tracing down the side profiles */}
                <path d="M 52,190 Q 51,320 51,440" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />
                <path d="M 148,190 Q 149,320 149,440" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" opacity="0.4" />

                {/* Specular curved glare reflections */}
                <path d="M 54,195 A 150,120 0 0,1 146,195" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.45" />
                <path d="M 70,464 Q 100,466 130,464" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />

                {/* Floating shiny stars for premium appearance */}
                <g fill="#ffffff">
                  <polygon points="35,160 38,163 41,160 38,157" className="animate-pulse" style={{ animationDuration: '2.5s' }} />
                  <polygon points="165,145 168,148 171,145 168,142" className="animate-pulse" style={{ animationDuration: '3.5s' }} />
                </g>
              </svg>

              {/* Water level digital percentage label inside the bottle */}
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                <span className="text-sm font-black text-white tracking-widest block uppercase drop-shadow-md bg-blue-950/40 px-3 py-1 rounded-full border border-white/20">
                  {(activeProgress * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive stats, Challenge logs, and Streak counters sitting next to the bottle */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 max-w-sm w-full">
            
            {/* Top Section Interactive Challenge Card - Fulfilling Red mark on Third Image */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card bg-white border border-blue-200/50 shadow-xl rounded-[2.2rem] p-6 w-full relative overflow-hidden transition-all duration-300"
            >
              {/* Backglow design effect */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#0ea5e9]/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0ea5e9] shadow-inner font-extrabold text-2xl">
                  💧
                </div>
                <div className="text-left">
                  <h3 className="text-[#1e3a8a] font-black text-sm uppercase tracking-wider mb-0.5">Water Challenge Log</h3>
                  <p className="text-[#0ea5e9] font-black text-xl tracking-tight">
                    {finalDrunk} / {finalGoal} glasses
                  </p>
                </div>
              </div>

              {/* Interactive Horizontal Progressive Wave Bar */}
              <div className="relative w-full h-3.5 bg-blue-100/50 rounded-full overflow-hidden mb-5 border border-blue-150 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${activeProgress * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] rounded-full flex items-center justify-end"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping" />
                </motion.div>
              </div>

              {/* Functional Drinking log button that matches the other challenges */}
              <button
                onClick={handleLogCup}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-b-4 border-[#0369a1]"
              >
                LOG GLASS OF WATER 🥛
              </button>
            </motion.div>

            {/* Streak Counter Block positioned next to it (with beautiful ocean blue text format replacing the brown) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card bg-white/50 border border-[#E9E4D4] rounded-[2.2rem] p-6 w-full flex flex-col items-center lg:items-start"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-8xl md:text-[8rem] font-sans font-black tracking-tighter text-[#0ea5e9] leading-none drop-shadow-[0_10px_35px_rgba(14,165,233,0.22)] select-none">
                  {consecutiveDays}
                </span>
                <span className="text-4xl text-[#0ea5e9] select-none animate-bounce" style={{ animationDuration: '4.5s' }}>🔥</span>
              </div>
              <span className="text-[#0ea5e9] font-black text-[10px] tracking-[0.2em] uppercase mt-2">
                Consecutive Hydration Streak
              </span>
              <p className="text-[#4F3F34]/60 text-[10px] font-bold mt-1 text-center lg:text-left">
                Keep the sequence glowing, bro! Inactivity drains your leaderboard standing!
              </p>
            </motion.div>

          </div>

        </div>

      </div>

      {/* Floating Temporal Coins Added Popup Modal */}
      <AnimatePresence>
        {pendingCoinsAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-[210] p-6"
          >
            <div className="bg-white border-2 border-amber-400 rounded-[2rem] p-8 text-center shadow-2xl flex flex-col items-center justify-center max-w-sm space-y-4">
              <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/20 text-white text-5xl font-extrabold animate-bounce">
                🪙
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">Bottle Filled!</h3>
                <p className="text-amber-500 text-3xl font-extrabold italic tracking-wider">
                  +10 COINS ADDED!
                </p>
              </div>
              <p className="text-sm text-[#7D6B58] font-semibold leading-relaxed">
                Super progress! You filled your hydration bottle and logged consecutive success streak! Keep staying focused! 💧🏆
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer to lock the structural bounds */}
      <div className="h-6 w-full" />
    </div>
  );
};
