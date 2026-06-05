import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ScreenWater } from './ScreenWater';
import { UserStats, DailyProgress, UserSettings } from '../types';

interface HydrationDetailPageProps {
  stats: UserStats;
  setStats?: (s: Partial<UserStats> | ((prev: UserStats) => UserStats)) => void;
  dailyProgress: DailyProgress;
  setDailyProgress?: (p: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress)) => void;
  onBack: () => void;
  play?: (sound: string) => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  settings: UserSettings;
  consecutiveDays: number;
  setConsecutiveDays?: (d: number) => void;
  waterLevel: number;
  setWaterLevel?: (l: number) => void;
  pendingCoinsAdded: boolean;
}

export const HydrationDetailPage: React.FC<HydrationDetailPageProps> = ({
  stats,
  onBack,
  play,
  dailyProgress,
  settings,
  consecutiveDays,
  waterLevel,
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

  // Compute local coordinates for the water surface inside our Bottle SVG
  // Cavity bottom is Y=468, maximum water line is Y=135
  const activeProgress = Math.min(Math.max(waterLevel, 0), 1);

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

  // Compute today's values for the circular hydration widget
  const finalDrunk = dailyProgress?.waterDrank ?? Math.round(activeProgress * (settings?.waterGoal ?? 8)) ?? 0;
  const finalGoal = settings?.waterGoal ?? 8;

  const [prevDrunk, setPrevDrunk] = useState(finalDrunk);
  const [isDrinkingAnimate, setIsDrinkingAnimate] = useState(false);

  useEffect(() => {
    if (finalDrunk > prevDrunk) {
      setIsDrinkingAnimate(true);
      const timer = setTimeout(() => setIsDrinkingAnimate(false), 2200);
      setPrevDrunk(finalDrunk);
      return () => clearTimeout(timer);
    } else if (finalDrunk < prevDrunk) {
      setPrevDrunk(finalDrunk);
    }
  }, [finalDrunk, prevDrunk]);

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
          <span className="text-xl animate-bounce" style={{ animationDuration: "3s" }}>🪙</span>
          <span className="font-sans font-black text-amber-600 text-sm">{stats.coins || 0}</span>
        </div>
      </header>

      {/* Main Container - Modern Dashboard featuring bottle on left, and ring widget + streak counter on right */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 xs:px-6 flex flex-col items-center justify-center relative z-40 -mt-3 min-[370px]:-mt-6 md:-mt-10 pb-12 md:pb-20">
        
        <div className="flex flex-row items-center justify-center gap-3.5 sm:gap-8 md:gap-14 w-full">
          
          {/* Left Column: Adaptive/Responsive Elegant Water Bottle (User's request to place on the left) */}
          <div className="flex items-center justify-center flex-shrink-0 animate-in fade-in duration-500">
            <div className="relative w-[150px] h-[350px] min-[370px]:w-[175px] min-[370px]:h-[410px] xs:w-[195px] xs:h-[455px] sm:w-[218px] sm:h-[512px] md:w-[245px] md:h-[575px] drop-shadow-[0_15px_35px_rgba(14,165,233,0.18)] md:drop-shadow-[0_25px_60px_rgba(14,165,233,0.22)]">
              
              <svg
                viewBox="0 0 200 500"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
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
                      <circle cx="82" cy="350" r="2.5" className="animate-bounce" style={{ animationDuration: "3s" }} />
                      <circle cx="120" cy="410" r="3" className="animate-bounce" style={{ animationDuration: "4s" }} />
                      <circle cx="68" cy="280" r="2" className="animate-bounce" style={{ animationDuration: "2.5s" }} />
                      <circle cx="110" cy="310" r="3.5" className="animate-bounce" style={{ animationDuration: "3.5s" }} />
                      <circle cx="95" cy="440" r="2" className="animate-bounce" style={{ animationDuration: "5s" }} />
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

                {/* Specular curved glass reflections */}
                <path d="M 54,195 A 150,120 0 0,1 146,195" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.45" />
                <path d="M 70,464 Q 100,466 130,464" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />

                {/* Floating shiny stars for premium appearance */}
                <g fill="#ffffff">
                  <polygon points="35,160 38,163 41,160 38,157" className="animate-pulse" style={{ animationDuration: "2.5s" }} />
                  <polygon points="165,145 168,148 171,145 168,142" className="animate-pulse" style={{ animationDuration: "3.5s" }} />
                </g>
              </svg>

              {/* Water level digital percentage label inside the bottle */}
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                <span className="text-[9px] min-[370px]:text-[10px] sm:text-xs font-black text-white/90 tracking-wider xs:tracking-widest block uppercase drop-shadow-md bg-blue-950/20 px-1.5 md:px-2 py-0.5 rounded-full">
                  {(activeProgress * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive stats & layout (User's request to place on the right next to the bottle) */}
          <div className="flex flex-col items-start text-left space-y-4 xs:space-y-6 md:space-y-8 max-w-[195px] min-[370px]:max-w-[215px] xs:max-w-[240px] sm:max-w-[280px] md:max-w-[340px] w-full text-[#4F3F34]">
            
            {/* Red Circle-inspired Custom Circular Hydration progress widget matching third image */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                borderColor: isDrinkingAnimate ? "#38bdf8" : "#E9E4D4",
                boxShadow: isDrinkingAnimate ? "0 20px 40px -10px rgba(14,165,233,0.3)" : "0 8px 16px -8px rgba(0,0,0,0.04)",
                scale: isDrinkingAnimate ? 1.04 : 1
              }}
              transition={{ 
                borderColor: { duration: 0.2 },
                boxShadow: { duration: 0.2 },
                scale: { type: "spring", stiffness: 350, damping: 15 },
                default: { delay: 0.1 }
              }}
              className="glass-card bg-white/70 backdrop-blur-md rounded-[1.6rem] min-[370px]:rounded-[1.8rem] md:rounded-[2.2rem] p-3.5 min-[370px]:p-4.5 md:p-6 border border-[#E9E4D4] shadow-xl w-full flex items-center gap-3.5 md:gap-5 relative overflow-hidden"
            >
              {/* Outer Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />
              
              {/* Absolute floating droplets animation when clicked/completed */}
              <AnimatePresence>
                {isDrinkingAnimate && (
                  <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          opacity: 0, 
                          y: 80, 
                          x: 60 + Math.random() * 120, 
                          scale: 0.5 + Math.random() * 0.5 
                        }}
                        animate={{ 
                          opacity: [0, 1, 1, 0], 
                          y: -30, 
                          scale: [0.5, 1.3, 0.9, 0] 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 1.4 + Math.random() * 0.6, 
                          ease: "easeOut",
                          delay: i * 0.12 
                        }}
                        className="absolute"
                      >
                        <svg className="w-5 h-5 text-[#38bdf8] drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                        </svg>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* SVG Ring Progress - Properly scaled with responsive viewBox */}
              <div className="relative w-[52px] h-[52px] min-[370px]:w-[60px] min-[370px]:h-[60px] xs:w-[68px] xs:h-[68px] sm:w-[72px] sm:h-[72px] md:w-[80px] md:h-[80px] flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-blue-100/50"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Foreground Animated Circle */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-[#0ea5e9]"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 - (Math.min(finalDrunk / finalGoal, 1) * 2 * Math.PI * 34) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                {/* Central Droplet Icon inside the ring */}
                <div className="absolute inset-0 flex items-center justify-center pl-0.5 pt-0.5">
                  {/* Glowing pulses behind the droplet */}
                  <AnimatePresence>
                    {isDrinkingAnimate && (
                      <>
                        <motion.div
                          key="pulse-1"
                          initial={{ scale: 0.8, opacity: 0.8 }}
                          animate={{ scale: 2.4, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="absolute w-8 h-8 bg-[#0ea5e9]/20 rounded-full"
                        />
                        <motion.div
                          key="pulse-2"
                          initial={{ scale: 0.7, opacity: 0.6 }}
                          animate={{ scale: 3.2, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2.0, ease: "easeOut", delay: 0.2 }}
                          className="absolute w-8 h-8 bg-[#38bdf8]/15 rounded-full"
                        />
                      </>
                    )}
                  </AnimatePresence>
                  
                  <motion.div
                    animate={isDrinkingAnimate ? {
                      scale: [1, 1.4, 0.9, 1.2, 1],
                      rotate: [0, 15, -15, 5, 0],
                    } : {}}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <svg className="w-[18px] h-[18px] min-[370px]:w-[22px] min-[370px]:h-[22px] xs:w-[26px] xs:h-[26px] md:w-[30px] md:h-[30px] text-[#0ea5e9] drop-shadow-[0_2px_4px_rgba(14,165,233,0.3)]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Text Information for today's drinks */}
              <div className="flex flex-col text-left space-y-0.5 select-none min-w-0 flex-1">
                <span className="text-blue-900/40 text-[9px] min-[370px]:text-[10px] md:text-[11px] font-black tracking-wider xs:tracking-widest uppercase truncate">
                  Today's Water
                </span>
                
                <div className="h-6 md:h-8 flex items-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={finalDrunk}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 18 }}
                      className="text-sm min-[370px]:text-base sm:text-lg md:text-2xl font-black text-[#0ea5e9] tracking-tight block truncate"
                    >
                      {finalDrunk.toFixed(1)} cups
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="h-4 flex items-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={finalDrunk}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className="text-[#0ea5e9]/60 font-bold text-[9px] min-[370px]:text-[11px] sm:text-xs tracking-tight block truncate"
                    >
                      {finalDrunk.toFixed(1)} of {finalGoal} cups
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Streak Counter Segment (Positioned cleanly on the right column below progress widget) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-start space-y-0.5 w-full pl-1.5 min-[370px]:pl-2.5"
            >
              <div className="flex items-baseline gap-1.5 xs:gap-2.5">
                <span className="text-6xl min-[370px]:text-7xl xs:text-8xl sm:text-9xl md:text-[8.5rem] font-sans font-black tracking-tighter text-[#0ea5e9] leading-none drop-shadow-[0_4px_15px_rgba(14,165,233,0.18)] md:drop-shadow-[0_6px_25px_rgba(14,165,233,0.22)] select-none">
                  {consecutiveDays}
                </span>
                <span className="text-3xl min-[370px]:text-4xl sm:text-5xl text-[#0ea5e9] select-none animate-bounce" style={{ animationDuration: "4s" }}>🔥</span>
              </div>
              <span className="text-[#0ea5e9]/60 font-black text-[9px] min-[370px]:text-[10px] sm:text-xs tracking-[0.1em] xs:tracking-[0.2em] uppercase">
                CONSECUTIVE DAYS STREAK
              </span>
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
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-[215] p-6"
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
