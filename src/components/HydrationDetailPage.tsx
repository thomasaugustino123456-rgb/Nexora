import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Zap, Droplet, Star, Flame } from 'lucide-react';
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
}

export const HydrationDetailPage: React.FC<HydrationDetailPageProps> = ({
  stats,
  setStats,
  dailyProgress,
  setDailyProgress,
  onBack,
  play,
  showToast,
  settings
}) => {
  // Streaks and levels from localStorage
  const [consecutiveDays, setConsecutiveDays] = useState<number>(() => {
    return parseInt(localStorage.getItem('hydration_consecutive_days') || '0', 10);
  });
  const [waterLevel, setWaterLevel] = useState<number>(() => {
    return parseFloat(localStorage.getItem('hydration_water_level') || '0.0');
  });
  const [lastCompletedDate, setLastCompletedDate] = useState<string>(() => {
    return localStorage.getItem('hydration_last_completed_date') || '';
  });

  const [runPhase, setRunPhase] = useState(0);

  // 2-Day Inactivity Check & Reset
  useEffect(() => {
    const checkReset = () => {
      const lastCompleted = localStorage.getItem('hydration_last_completed_date');
      if (lastCompleted) {
        const lastDate = new Date(lastCompleted);
        const today = new Date();
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 2) {
          localStorage.setItem('hydration_consecutive_days', '0');
          localStorage.setItem('hydration_water_level', '0.0');
          localStorage.removeItem('hydration_last_completed_date');
          setConsecutiveDays(0);
          setWaterLevel(0.0);
          setLastCompletedDate('');
          if (showToast) {
            showToast("⚠️ Inactivity detected! High-water challenge streak & bottle level reset to 0.", "error");
          }
        }
      }
    };
    checkReset();
  }, [showToast]);

  // Animated stationary jog cycle timer
  useEffect(() => {
    let subActive = true;
    let animationId: number;
    const loop = () => {
      if (!subActive) return;
      setRunPhase((prev) => (prev + 0.16) % (Math.PI * 2));
      animationId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      subActive = false;
      cancelAnimationFrame(animationId);
    };
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = lastCompletedDate === todayStr;

  const handleConcludeChallenge = () => {
    if (isCompletedToday) {
      if (showToast) showToast("You already claimed today's high-water challenge progress!", "info");
      return;
    }

    if (play) play('success');
    
    const nextDays = consecutiveDays + 1;
    const nextLevel = Math.min(1.0, waterLevel + 0.15); // rise by a little (15%)
    
    localStorage.setItem('hydration_consecutive_days', nextDays.toString());
    localStorage.setItem('hydration_water_level', nextLevel.toFixed(3));
    localStorage.setItem('hydration_last_completed_date', todayStr);
    
    setConsecutiveDays(nextDays);
    setWaterLevel(nextLevel);
    setLastCompletedDate(todayStr);

    // Give coins and XP rewards
    setStats((prev) => ({
      ...prev,
      coins: (prev.coins || 0) + 15,
      xp: (prev.xp || 0) + 10
    }));

    // Update dailyProgress to match drank count successfully
    setDailyProgress((prev) => ({
      ...prev,
      waterDrank: Math.max(prev.waterDrank || 0, settings.waterGoal || 8)
    }));

    if (showToast) {
      showToast(`💧 Level Increased! Streak: ${nextDays} Days (+15 Coins, +10 XP) 🏆`, "success");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your high-water consecutive days and character level back to 0?")) {
      if (play) play('click');
      localStorage.setItem('hydration_consecutive_days', '0');
      localStorage.setItem('hydration_water_level', '0.0');
      localStorage.removeItem('hydration_last_completed_date');
      setConsecutiveDays(0);
      setWaterLevel(0.0);
      setLastCompletedDate('');
      if (showToast) showToast("Challenge counts reset back to 0 💧", "info");
    }
  };

  // Human running joint mathematical angles
  const leftLegRot = Math.sin(runPhase) * 35;
  const rightLegRot = -Math.sin(runPhase) * 35;
  const leftArmRot = -Math.sin(runPhase) * 28;
  const rightArmRot = Math.sin(runPhase) * 28;
  const torsoBob = Math.abs(Math.cos(runPhase * 2)) * 6;

  // Mascot Glass Body Liquid representation
  // Body boundary height: from bottom of feet/legs to top of head
  // 0% -> empty, 100% -> full.
  const liquidHeight = waterLevel * 300; // body height scale is roughly 300px

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#4F3F34] relative overflow-hidden flex flex-col font-sans pb-16">
      
      {/* 1. Embedded static background water challenge flow filling the screen perfectly at bottom */}
      {/* Fixed to 0.35 level (35% filled), representing standard calm filling height */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <ScreenWater progress={0.35} />
      </div>

      {/* 2. Top Header Navigation */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between relative z-50">
        <button
          onClick={() => {
            if (play) play('click');
            onBack();
          }}
          className="p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E9E4D4] hover:bg-white active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-[#4F3F34]" />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-sky-50 text-sky-500 px-3 py-1 rounded-full border border-sky-100">
          HYDRATION ARENA
        </span>
        <button
          onClick={handleReset}
          className="p-3 bg-red-50/70 backdrop-blur-md rounded-2xl border border-red-100 text-red-500 hover:bg-red-50 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          title="Reset hydration progress"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {/* MAIN BODY LAYOUT */}
      <div className="flex-1 max-w-lg mx-auto w-full px-6 flex flex-col justify-between py-4 relative z-40">
        
        {/* Summary title */}
        <div className="text-center space-y-1 mt-2">
          <h2 className="text-3xl font-black tracking-tight text-[#4F3F34]">Hydration Analytics</h2>
          <p className="text-sm font-semibold text-[#4F3F34]/70 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Droplet size={14} className="text-sky-500 animate-pulse" />
            Active Challenge Tracker
          </p>
        </div>

        {/* 3. MASCOT CHASSIS & DAY BADGE BOARD ROW */}
        <div className="my-8 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
          
          {/* Glass reflection highlights on background */}
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

          {/* Running arena background grid layout */}
          <div className="w-full flex items-center justify-between gap-4 relative z-10 py-6">
            
            {/* LEFT SIDE: Translucent 2D glass athletic human mascot runner */}
            <div className="w-1/2 flex items-center justify-center relative">
              
              <svg 
                viewBox="0 0 240 380" 
                className="w-full max-w-[150px] overflow-visible drop-shadow-2xl"
              >
                <defs>
                  {/* Glass runner body clip to mask internal rising water */}
                  <clipPath id="runner-body-mask">
                    {/* Head sphere */}
                    <circle cx="120" cy="65" r="28" />
                    {/* Torso/Neck neck body */}
                    <path d="M 112 90 L 128 90 L 132 105 L 145 160 L 135 230 L 105 230 L 95 160 Q 110 110 112 90 Z" />
                    {/* Left arm swung path */}
                    <path d="M 102 110 C 85 105, 70 125, 65 145 C 60 160, 75 160, 80 148 L 94 125 Z" />
                    {/* Right arm swung path */}
                    <path d="M 138 110 C 155 105, 170 120, 175 138 C 180 152, 165 155, 160 142 L 146 125 Z" />
                    {/* Left hip leg path */}
                    <path d="M 105 230 L 95 290 L 80 340 L 95 350 L 110 295 L 115 230 Z" />
                    {/* Right hip leg path */}
                    <path d="M 135 230 L 145 290 L 160 340 L 145 350 L 130 295 L 125 230 Z" />
                  </clipPath>

                  {/* Glass highlight gradients */}
                  <linearGradient id="glass-glare" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="30%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="#e0f2fe" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
                  </linearGradient>

                  <linearGradient id="body-water-colour" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#1e40af" stopOpacity="0.95" />
                    <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                {/* ANIMATED CHASSIS (Legs, arm elements dynamically swinging as standard SVG group) */}
                <g transform={`translate(0, ${torsoBob})`}>
                  
                  {/* 1. Underlying Mascot Core Water (Clipped inside running man body shape) */}
                  <g clipPath="url(#runner-body-mask)">
                    {/* Full backing for translucent depth */}
                    <rect x="20" y="20" width="200" height="340" fill="rgba(240, 249, 255, 0.4)" />
                    
                    {/* Rising water body based on water level (rising from feet 350 to head 40) */}
                    <motion.rect
                      x="20"
                      y={350 - (waterLevel * 310)}
                      width="200"
                      height="340"
                      fill="url(#body-water-colour)"
                      animate={{
                        y: 350 - (waterLevel * 310) + Math.sin(runPhase * 3) * 3
                      }}
                      transition={{ ease: "linear", duration: 0.1 }}
                    />

                    {/* Beautiful fluid internal wave crest inside mascot */}
                    <path
                      d={`M 15,${350 - (waterLevel * 310)} q 45,${Math.sin(runPhase * 2) * 5} 90,0 t 90,0 90,0 L 220,400 L 15,400 Z`}
                      fill="#7dd3fc"
                      opacity="0.5"
                    />
                  </g>

                  {/* 2. Overlying Cartoon Glass outlines & Joint Swing elements */}
                  {/* Left Arm swing */}
                  <g transform={`translate(100, 110) rotate(${leftArmRot}) translate(-100, -110)`}>
                    <path d="M 100,110 Q 82,108 72,125 Q 64,138 72,152 Q 80,154 85,140 Q 94,120 100,110 Z" fill="url(#glass-glare)" stroke="#0284c7" strokeWidth="3" />
                  </g>

                  {/* Right Arm swing */}
                  <g transform={`translate(140, 110) rotate(${rightArmRot}) translate(-140, -110)`}>
                    <path d="M 140,110 Q 158,108 168,125 Q 176,138 168,152 Q 160,154 155,140 Q 146,120 140,110 Z" fill="url(#glass-glare)" stroke="#0284c7" strokeWidth="3" />
                  </g>

                  {/* Left Leg swing */}
                  <g transform={`translate(105, 230) rotate(${leftLegRot}) translate(-105, -230)`}>
                    <path d="M 105,230 L 92,290 L 75,340 Q 80,352 95,348 L 108,295 L 112,230 Z" fill="url(#glass-glare)" stroke="#0284c7" strokeWidth="3.5" strokeLinejoin="round" />
                    {/* Glass Jogger Shoe foot outline */}
                    <path d="M 75,340 L 62,345 Q 60,352 72,352 L 95,348 Z" fill="#0ea5e9" stroke="#000" strokeWidth="0.5" />
                  </g>

                  {/* Right Leg swing */}
                  <g transform={`translate(135, 230) rotate(${rightLegRot}) translate(-135, -230)`}>
                    <path d="M 135,230 L 148,290 L 165,340 Q 160,352 145,348 L 132,295 L 128,230 Z" fill="url(#glass-glare)" stroke="#0284c7" strokeWidth="3.5" strokeLinejoin="round" />
                    {/* Glass Jogger Shoe foot outline */}
                    <path d="M 165,340 L 178,345 Q 180,352 168,352 L 145,348 Z" fill="#0ea5e9" stroke="#000" strokeWidth="0.5" />
                  </g>

                  {/* Core Torso Base */}
                  <path 
                    d="M 112,90 L 128,90 L 134,105 L 146,160 L 135,230 L 105,230 L 94,160 Q 110,110 112,90 Z" 
                    fill="url(#glass-glare)" 
                    stroke="#0284c7" 
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                  
                  {/* Head outline sphere */}
                  <circle 
                    cx="120" 
                    cy="65" 
                    r="28" 
                    fill="url(#glass-glare)" 
                    stroke="#0284c7" 
                    strokeWidth="4.5" 
                  />

                  {/* Cartoon runner smiley eyes & sweaty runner grin */}
                  <ellipse cx="112" cy="62" rx="2.5" ry="4" fill="#1e293b" />
                  <ellipse cx="128" cy="62" rx="2.5" ry="4" fill="#1e293b" />
                  <path d="M 115,74 Q 120,82 125,74" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Clean highlights on runner head */}
                  <circle cx="108" cy="55" r="4" fill="#fff" opacity="0.8" />
                </g>
              </svg>
            </div>

            {/* RIGHT SIDE: Day Milestones Badge Board placed where the runner faces */}
            <div className="w-1/2 flex flex-col items-center justify-center space-y-3 relative">
              <div className="w-full max-w-[160px] bg-slate-50 border border-[#E9E4D4]/80 rounded-3xl p-5 text-center shadow-md relative">
                
                {/* Embedded shiny physical coin border */}
                <div className="absolute -top-3 -right-3 bg-amber-400 text-white rounded-full p-2.5 shadow-md flex items-center justify-center animate-bounce">
                  <Trophy size={16} />
                </div>

                <span className="text-[9px] font-black text-[#69C496] tracking-widest uppercase block">STREAK TARGET</span>
                
                {/* Big physical consecutive days total */}
                <span className="text-4xl font-extrabold text-[#4F3F34] my-2 block font-mono">
                  {consecutiveDays}
                </span>

                <span className="text-[10px] font-extrabold text-[#4F3F34]/60 uppercase block">
                  {consecutiveDays === 1 ? 'DAY ACTIVE' : 'DAYS COMPLETED'}
                </span>

                {/* Progress bar fill for next milestone */}
                <div className="w-full bg-stone-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (waterLevel * 100))}%` }}
                  />
                </div>
                <span className="text-[8px] font-black text-gray-400 block mt-1 uppercase">
                  BOTTLE WATER: {(waterLevel * 100).toFixed(0)}%
                </span>
              </div>
            </div>

          </div>

          {/* Prompt banner detailing the rules */}
          <div className="w-full mt-2 py-3 px-4.5 bg-sky-50/50 border border-sky-100 rounded-2xl text-[10px] font-semibold text-[#4F3F34]/70 leading-relaxed text-center">
            Runner body water level increases by <span className="text-sky-500 font-extrabold">15%</span> per completed Hydration day. Inactivity for 2 consecutive days drains water & resets counts to 0.
          </div>
        </div>

        {/* 4. CLINCHING ACTION TRIGGER BOX */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!isCompletedToday ? (
              <motion.button
                key="complete-btn"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                onClick={handleConcludeChallenge}
                className="w-full bg-sky-500 hover:bg-sky-600 active:scale-98 text-white py-5 px-6 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Flame size={18} className="animate-pulse" />
                <span>Conclude Today's Water Challenge</span>
              </motion.button>
            ) : (
              <motion.div
                key="congratulations-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-3xl text-center space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <Star size={20} className="text-amber-500 fill-amber-300 animate-spin" />
                  <span className="font-black uppercase tracking-widest text-xs">Today's Target Completed!</span>
                  <Star size={20} className="text-amber-500 fill-amber-300 animate-spin" />
                </div>
                <p className="text-xs font-semibold leading-relaxed">
                  Excellent! You have successfully completed today's official hydration challenges. See you tomorrow, CHAMP ! 🏆
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
