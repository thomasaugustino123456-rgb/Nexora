import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ScreenWater } from './ScreenWater';
import { UserStats, DailyProgress, UserSettings } from '../types';
import { vibrate } from '../lib/vibrate';

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
  const [isDropping, setIsDropping] = useState(false);
  const [dropAnimateKey, setDropAnimateKey] = useState(0);

  const playCoolWaterDropSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        if (play) play('water');
        return;
      }
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Drip tone (rising frequency fast)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(150, now);
      osc1.frequency.exponentialRampToValueAtTime(650, now + 0.155);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.155);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.155);

      // 2. Secondary tiny ripple sound (slightly delayed higher pitch drop)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1250, now + 0.165);
      gain2.gain.setValueAtTime(0.06, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.2);
    } catch (e) {
      console.warn("Dripping audio synthesis failed:", e);
      if (play) play('water');
    }
  };

  const handleCardBoxClick = () => {
    vibrate(10);
    setIsDropping(true);
    setDropAnimateKey(prev => prev + 1);
  };

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

  // Handle addition of water via clicking the card box!
  const handleAddWater = () => {
    // Play splash sound
    if (play) play('water');
    vibrate(15);

    const nextDrunk = finalDrunk + 1;
    const isCompletedNow = nextDrunk >= finalGoal;

    // Trigger drinking wave explosion animations!
    setIsDrinkingAnimate(true);
    setTimeout(() => setIsDrinkingAnimate(false), 2200);

    if (setDailyProgress) {
      setDailyProgress((prev) => ({
        ...prev,
        waterDrank: nextDrunk,
        waterDone: isCompletedNow
      }));
    }

    // Since a cup is logged, increase the water level on the fly in proportion to goal
    const fractionalAddition = 1 / finalGoal;
    let nextLevel = waterLevel + fractionalAddition;
    let awardCoins = 0;

    if (nextLevel >= 0.999) {
      // Bottle filled up completely! Reset level to 0 and grant 10 epic coins!
      nextLevel = 0.0;
      awardCoins = 10;
    }

    if (setWaterLevel) {
      setWaterLevel(nextLevel);
      localStorage.setItem('hydration_water_level', nextLevel.toFixed(3));
    }

    // Update streak to keep everything working elegantly
    const todayStr = new Date().toISOString().split('T')[0];
    const nextDays = consecutiveDays + 1;
    if (setConsecutiveDays) {
      setConsecutiveDays(nextDays);
      localStorage.setItem('hydration_consecutive_days', nextDays.toString());
      localStorage.setItem('hydration_last_completed_date', todayStr);
    }

    if (awardCoins > 0) {
      if (setStats) {
        setStats((prev) => ({
          ...prev,
          coins: (prev.coins || 0) + awardCoins
        }));
      }
      if (showToast) {
        showToast("🪙 Epic! Big Water Bottle is totally full! +10 Coins Added! 🏆💧", "success");
      }
    } else {
      if (showToast) {
        showToast(`💧 Gulp! Logged 1 cup of water (${nextDrunk}/${finalGoal})! Streak: ${nextDays}`, "success");
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
          <span className="text-xl animate-bounce" style={{ animationDuration: "3s" }}>🪙</span>
          <span className="font-sans font-black text-amber-600 text-sm">{stats.coins || 0}</span>
        </div>
      </header>

      {/* Main Container - Modern Dashboard featuring bottle on left, and ring widget + streak counter on right */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 xs:px-6 flex items-center justify-center relative z-40 -mt-6">
        
        <div className="flex flex-row items-center justify-center gap-4 xs:gap-6 sm:gap-12 md:gap-16 w-full max-w-4xl mx-auto">
          
          {/* Left Column: Adaptive/Responsive Elegant Water Bottle (User's request to place on the left) */}
          <div className="flex items-center justify-center flex-shrink-0 animate-in fade-in duration-500 w-[42%] xs:w-[45%] md:w-[50%] md:max-w-[512px]">
            <div className="relative w-[130px] h-[325px] xs:w-[155px] xs:h-[388px] sm:w-[220px] sm:h-[450px] md:w-[512px] md:h-[512px] drop-shadow-[0_25px_60px_rgba(14,165,233,0.22)] animate-in zoom-in duration-500 flex items-center justify-center">
              
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
                  strokeLinecap="round"
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
                <span className="text-xs xs:text-sm font-black text-white/95 tracking-widest block uppercase drop-shadow-md bg-blue-950/40 px-3 py-1 rounded-full border border-blue-400">
                  {(activeProgress * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive stats & layout (User's request to place on the right next to the bottle) */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4 xs:space-y-6 sm:space-y-8 md:space-y-10 w-[55%] xs:w-[50%] sm:w-[50%] max-w-[280px] sm:max-w-md text-[#4F3F34]">
            
            {/* Red Circle-inspired Custom Circular Hydration progress widget matching third image */}
            <motion.div 
              onClick={handleCardBoxClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                borderColor: isDrinkingAnimate ? "#38bdf8" : "#E9E4D4",
                boxShadow: isDrinkingAnimate ? "0 25px 50px -12px rgba(14,165,233,0.35)" : "0 8px 16px -8px rgba(0,0,0,0.04)",
                scale: isDrinkingAnimate ? 1.04 : 1
              }}
              transition={{ 
                borderColor: { duration: 0.2 },
                boxShadow: { duration: 0.2 },
                scale: { type: "spring", stiffness: 350, damping: 15 },
                default: { delay: 0.1 }
              }}
              className="glass-card bg-white/80 hover:bg-white backdrop-blur-md rounded-[1.5rem] xs:rounded-[2.2rem] p-3 xs:p-4 sm:p-6 md:p-8 border-2 border-[#E9E4D4]/80 shadow-xl w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-6 relative overflow-hidden cursor-pointer hover:border-[#38bdf8]/40 transition-all active:ring-4 active:ring-blue-100"
            >
              {/* Outer Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

              {/* Falling Droplet Layer relative on top of the phone screen landing directly into the container */}
              <AnimatePresence>
                {isDropping && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <motion.div
                      key={dropAnimateKey}
                      initial={{ y: -800, opacity: 0.2, scale: 1.3 }}
                      animate={{ y: 0, opacity: [0.3, 1, 1], scale: [1.3, 1, 0.95] }}
                      exit={{ scale: [0.95, 2.2], opacity: [1, 0] }}
                      transition={{ 
                        y: { duration: 0.62, ease: [0.47, 0, 0.745, 0.715] }, // gravity acceleration curve
                        opacity: { duration: 0.15 },
                        scale: { duration: 0.25 }
                      }}
                      onAnimationComplete={() => {
                        setIsDropping(false);
                        playCoolWaterDropSound();
                        setIsDrinkingAnimate(true);
                        setTimeout(() => setIsDrinkingAnimate(false), 1200);
                      }}
                      className="absolute pl-0.5 pt-0.5"
                    >
                      <svg className="w-10 h-10 xs:w-12 xs:h-12 text-[#0ea5e9] drop-shadow-[0_4px_15px_rgba(14,165,233,0.75)]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                      </svg>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              
              {/* SVG Ring Progress - Properly scaled with responsive viewBox */}
              <div className="relative w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-blue-100/50"
                    strokeWidth="6.5"
                    fill="transparent"
                  />
                  {/* Foreground Animated Circle */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-[#0ea5e9]"
                    strokeWidth="6.5"
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
                          animate={{ scale: 2.8, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="absolute w-12 h-12 bg-[#0ea5e9]/20 rounded-full"
                        />
                        <motion.div
                          key="pulse-2"
                          initial={{ scale: 0.7, opacity: 0.6 }}
                          animate={{ scale: 3.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2.0, ease: "easeOut", delay: 0.2 }}
                          className="absolute w-12 h-12 bg-[#38bdf8]/15 rounded-full"
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
                    <svg className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#0ea5e9] drop-shadow-[0_2px_6px_rgba(14,165,233,0.35)]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Text Information for today's drinks */}
              <div className="flex flex-col text-center sm:text-left space-y-0.5 select-none min-w-0 flex-1">
                <span className="text-blue-900/50 text-[10px] sm:text-xs font-black tracking-widest uppercase truncate">
                  Today's Water
                </span>
                
                <div className="h-6 sm:h-10 flex items-center justify-center sm:justify-start">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={finalDrunk}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 18 }}
                      className="text-base xs:text-lg sm:text-xl md:text-2xl font-black text-[#0ea5e9] tracking-tight block truncate"
                    >
                      {finalDrunk.toFixed(1)} cups
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="h-4 sm:h-5 flex items-center justify-center sm:justify-start">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={finalDrunk}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className="text-[#0ea5e9]/70 font-semibold text-[10px] xs:text-xs sm:text-sm tracking-tight block truncate"
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
              className="flex flex-col items-center sm:items-start space-y-0.5 w-full pl-0 sm:pl-2"
            >
              <div className="flex items-baseline gap-1 xs:gap-2 justify-center sm:justify-start">
                <span className="text-4xl xs:text-5xl sm:text-6xl md:text-[8rem] font-sans font-black tracking-tighter text-[#0ea5e9] leading-none drop-shadow-[0_4px_15px_rgba(14,165,233,0.18)] select-none">
                  {consecutiveDays}
                </span>
                <span className="text-xl sm:text-3xl text-[#0ea5e9] select-none animate-bounce" style={{ animationDuration: "4s" }}>🔥</span>
              </div>
              <span className="text-[#0ea5e9]/60 font-black text-[9px] xs:text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase text-center sm:text-left">
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
