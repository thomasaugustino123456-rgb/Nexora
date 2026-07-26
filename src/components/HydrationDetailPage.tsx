import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ScreenWater } from './ScreenWater';
import { WaterMascot } from './WaterMascot';
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

      {/* Main Container - Modern Dashboard featuring mascot on left (512px max), and card box + streak counter on right */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-3 xs:px-5 flex items-center justify-center relative z-40 -mt-2 sm:-mt-6">
        
        <div className="flex flex-row items-center justify-center gap-3 xs:gap-6 sm:gap-10 md:gap-12 w-full max-w-5xl mx-auto">
          
          {/* Left Column: App Water Mascot (Prominent, up to 512px size as requested) */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 animate-in fade-in duration-500 w-[55%] xs:w-[58%] sm:w-[60%] max-w-[320px] xs:max-w-[420px] sm:max-w-[480px] md:max-w-[512px]">
            <div className="relative w-full drop-shadow-[0_20px_50px_rgba(14,165,233,0.25)] animate-in zoom-in duration-500 flex flex-col items-center justify-center">
              <WaterMascot progress={activeProgress} className="w-full max-w-[320px] xs:max-w-[420px] sm:max-w-[480px] md:max-w-[512px]" />
              
              {/* Water level digital percentage badge below mascot */}
              <div className="-mt-1 xs:-mt-2 sm:-mt-4 pointer-events-none text-center z-30">
                <span className="text-xs xs:text-sm sm:text-base font-black text-white tracking-wider inline-block uppercase drop-shadow-md bg-blue-600/90 px-4 py-1.5 xs:px-5 xs:py-2 rounded-full border border-blue-300 shadow-md">
                  {(activeProgress * 100).toFixed(0)}% FULL
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive stats & card box balanced with mascot */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 xs:space-y-5 sm:space-y-6 w-[45%] xs:w-[42%] max-w-[220px] xs:max-w-[260px] sm:max-w-[320px] text-[#4F3F34]">
            
            {/* Today's Water Progress Card Box (Balanced with 512px mascot) */}
            <motion.div 
              onClick={handleCardBoxClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                borderColor: isDrinkingAnimate ? "#0ea5e9" : "#E9E4D4",
                boxShadow: isDrinkingAnimate ? "0 15px 35px -10px rgba(14,165,233,0.2)" : "0 8px 25px rgba(79,63,52,0.06)",
                scale: isDrinkingAnimate ? 1.03 : 1
              }}
              transition={{ 
                borderColor: { duration: 0.2 },
                boxShadow: { duration: 0.2 },
                scale: { type: "spring", stiffness: 350, damping: 15 },
                default: { delay: 0.1 }
              }}
              className="bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl xs:rounded-3xl p-3.5 xs:p-4 sm:p-5 md:p-6 border border-[#E9E4D4]/80 shadow-md w-full flex flex-col items-center gap-2.5 xs:gap-3 relative overflow-hidden cursor-pointer hover:border-[#0ea5e9]/30 transition-all active:ring-2 active:ring-blue-100"
            >
              {/* Outer Decorative Glow */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-blue-400/10 rounded-full blur-lg pointer-events-none" />

              {/* Falling Droplet Layer */}
              <AnimatePresence>
                {isDropping && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <motion.div
                      key={dropAnimateKey}
                      initial={{ y: -800, opacity: 0.2, scale: 1.3 }}
                      animate={{ y: 0, opacity: [0.3, 1, 1], scale: [1.3, 1, 0.95] }}
                      exit={{ scale: [0.95, 2.2], opacity: [1, 0] }}
                      transition={{ 
                        y: { duration: 0.62, ease: [0.47, 0, 0.745, 0.715] },
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
                      <svg className="w-8 h-8 xs:w-10 xs:h-10 text-[#0ea5e9] drop-shadow-[0_4px_15px_rgba(14,165,233,0.75)]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                      </svg>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              
              {/* SVG Ring Progress */}
              <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="33"
                    className="stroke-blue-100/60"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Foreground Animated Circle */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="33"
                    className="stroke-[#0ea5e9]"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 33}
                    initial={{ strokeDashoffset: 2 * Math.PI * 33 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 33 - (Math.min(finalDrunk / finalGoal, 1) * 2 * Math.PI * 33) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                {/* Central Droplet Icon inside ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence>
                    {isDrinkingAnimate && (
                      <>
                        <motion.div
                          key="pulse-1"
                          initial={{ scale: 0.8, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="absolute w-10 h-10 bg-[#0ea5e9]/20 rounded-full"
                        />
                      </>
                    )}
                  </AnimatePresence>
                  
                  <motion.div
                    animate={isDrinkingAnimate ? {
                      scale: [1, 1.3, 0.9, 1.1, 1],
                      rotate: [0, 15, -15, 5, 0],
                    } : {}}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-[#0ea5e9] drop-shadow-[0_2px_4px_rgba(14,165,233,0.3)]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Text Information for today's drinks */}
              <div className="flex flex-col text-center space-y-0.5 select-none w-full">
                <span className="text-[#0ea5e9] text-[10px] xs:text-xs font-black tracking-widest uppercase truncate">
                  Today's Water
                </span>
                
                <div className="h-6 xs:h-7 flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={finalDrunk}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 18 }}
                      className="text-base xs:text-lg sm:text-xl font-black text-[#4F3F34] tracking-tight block truncate"
                    >
                      {finalDrunk.toFixed(1)} cups
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="h-4 xs:h-5 flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={finalDrunk}
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className="text-stone-500 font-semibold text-[10px] xs:text-xs sm:text-sm tracking-tight block truncate"
                    >
                      {finalDrunk.toFixed(1)} of {finalGoal} cups
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="mt-1 flex items-center justify-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] xs:text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Tap Box to log +1 cup</span>
                </div>
              </div>
            </motion.div>

            {/* Consecutive Days Streak Counter Segment */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center space-y-0.5 w-full pt-1"
            >
              <div className="flex items-baseline gap-1 justify-center">
                <span className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-sans font-black tracking-tighter text-[#3C2E2B] leading-none drop-shadow-sm select-none">
                  {consecutiveDays}
                </span>
                <span className="text-xl xs:text-2xl sm:text-3xl select-none animate-bounce" style={{ animationDuration: "4s" }}>🔥</span>
              </div>
              <span className="text-[#3C2E2B]/70 font-black text-[9px] xs:text-[10px] sm:text-xs tracking-wider uppercase text-center">
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
