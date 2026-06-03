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
  onBack,
  play,
  consecutiveDays,
  waterLevel,
  pendingCoinsAdded
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
  const fillY = 468 - (activeProgress * 333);

  // Surface waving animations
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

  return (
    <div className="h-screen w-full relative bg-[#090b11] text-[#e2e8f0] overflow-hidden select-none flex flex-col justify-between">
      
      {/* Background sloshing liquid - fixed very low at the bottom of the screen */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <ScreenWater progress={0.06} />
      </div>

      {/* Glass reflections details and soft gradient rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />

      {/* Top Header - Back Button Only */}
      <header className="px-6 pt-12 flex items-center justify-between relative z-50">
        <button
          onClick={() => {
            if (play) play('click');
            onBack();
          }}
          className="p-3.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all shadow-lg shadow-black/20 cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft size={22} className="text-[#38bdf8]" />
        </button>
      </header>

      {/* Main Container - Side by Side Bottle & Counter */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-8 flex items-center justify-center relative z-40">
        
        <div className="flex items-center justify-center gap-12 md:gap-20 w-full">
          
          {/* Left Portion: Tall, Beautiful, Highly Realistic 3D Glass Water Bottle */}
          <div className="w-1/2 flex items-center justify-center">
            <div className="relative w-full max-w-[200px] aspect-[1/2.5] drop-shadow-[0_20px_50px_rgba(56,189,248,0.25)]">
              
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
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                  </linearGradient>

                  {/* Rich water body colors with shading */}
                  <linearGradient id="water-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.98" />
                  </linearGradient>
                </defs>

                {/* Ground Shadow underneath the bottle */}
                <ellipse cx="100" cy="482" rx="60" ry="8" fill="#000000" fillOpacity="0.4" filter="blur(2px)" />

                {/* 1. LIQUID CONTENTS (Clamped inside bottle body cavity) */}
                <g clipPath="url(#bottle-inner-mask)">
                  {/* Soft backing glass refraction tint */}
                  <rect x="30" y="30" width="140" height="440" fill="#131e35" fillOpacity="0.4" />
                  <ellipse cx="100" cy="300" rx="46" ry="164" fill="#1e293b" fillOpacity="0.25" />

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
                    <g fill="#ffffff" fillOpacity="0.55">
                      <circle cx="82" cy="350" r="2.5" className="animate-bounce" style={{ animationDuration: '3s' }} />
                      <circle cx="120" cy="410" r="3" className="animate-bounce" style={{ animationDuration: '4s' }} />
                      <circle cx="68" cy="280" r="2" className="animate-bounce" style={{ animationDuration: '2.5s' }} />
                      <circle cx="110" cy="310" r="3.5" className="animate-bounce" style={{ animationDuration: '3.5s' }} />
                      <circle cx="95" cy="440" r="2" className="animate-bounce" style={{ animationDuration: '5s' }} />
                    </g>
                  )}
                </g>

                {/* 2. REALISTIC GLOSSY GLASS SHELL (Drawn on top for perfect specular refraction) */}
                
                {/* Shiny glass outlines */}
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
                  fillOpacity="0.25"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />

                {/* Thread details near the neck */}
                <line x1="82" y1="92" x2="118" y2="92" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
                <line x1="82" y1="102" x2="118" y2="102" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
                <line x1="82" y1="112" x2="118" y2="112" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />

                {/* Premium cap on top */}
                <rect x="74" y="44" width="52" height="38" rx="8" fill="#1e3a8a" stroke="#38bdf8" strokeWidth="3" />
                <line x1="84" y1="48" x2="84" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
                <line x1="92" y1="48" x2="92" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
                <line x1="100" y1="48" x2="100" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
                <line x1="108" y1="48" x2="108" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />
                <line x1="116" y1="48" x2="116" y2="78" stroke="#38bdf8" strokeWidth="2.5" opacity="0.7" />

                {/* Glossy linear highlights tracing down the side profiles */}
                <path d="M 52,190 Q 51,320 51,440" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 148,190 Q 149,320 149,440" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" opacity="0.3" />

                {/* Specular curved glare reflections */}
                <path d="M 54,195 A 150,120 0 0,1 146,195" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.3" />
                <path d="M 70,464 Q 100,466 130,464" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.45" />

                {/* Floating shiny stars for premium appearance */}
                <g fill="#ffffff">
                  <polygon points="35,160 38,163 41,160 38,157" className="animate-pulse" style={{ animationDuration: '2.5s' }} />
                  <polygon points="165,145 168,148 171,145 168,142" className="animate-pulse" style={{ animationDuration: '3.5s' }} />
                </g>
              </svg>

              {/* Water level digital label inside the bottle (Subtle visual aid) */}
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                <span className="text-[11px] font-black text-white/50 tracking-widest block uppercase">
                  {(activeProgress * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Portion: Huge Minimalist Counter Number right adjacent to the Water Bottle */}
          <div className="w-1/2 flex items-center justify-start">
            <div className="flex flex-col items-start justify-center">
              <span className="text-9xl md:text-[11rem] font-sans font-black tracking-tighter text-[#38bdf8] leading-none drop-shadow-xl animate-fade-in">
                {consecutiveDays}
              </span>
            </div>
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
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100] p-6"
          >
            <div className="bg-[#111827] border-2 border-amber-400 rounded-[2.5rem] p-10 text-center shadow-2xl flex flex-col items-center justify-center max-w-sm space-y-4">
              <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/20 text-white text-5xl font-extrabold animate-bounce">
                🪙
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Bottle Filled!</h3>
                <p className="text-amber-400 text-3xl font-extrabold italic tracking-wider">
                  +10 COINS ADDED!
                </p>
              </div>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Epic progress, champion! Your water streak has earned you bonus coins in your active wallet. Keep drinking and staying focused! 💧🏆
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer to lock the structural bounds */}
      <div className="h-10 w-full" />
    </div>
  );
};
