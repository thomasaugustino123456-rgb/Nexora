import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Award, Target, Trophy, 
  TrendingUp, ChevronLeft, Droplets, Flame, 
  Clock, Zap, Star, Shield, BrainCircuit, 
  Palette, Dumbbell, Coins, Crown, BarChart2,
  X, ShieldAlert, Sparkles, Plus, ChevronDown, ChevronUp, RotateCcw, Check, Trash2
} from 'lucide-react';
import { UserStats, DailyProgress, UserSettings, Trophy as TrophyType, Screen } from '../types';
import { Calendar } from './Calendar';
import { StatsCharts } from './StatsCharts';
import { GoldenTrophy, IceTrophy, BrokenTrophy } from './Trophies';

export function ProgressScreen({ 
  stats, 
  history, 
  settings, 
  setSettings, 
  userRank,
  onScreenChange,
  dailyProgress,
  setStats,
  setDailyProgress,
  play,
  showToast
}: { 
  stats: UserStats, 
  history: DailyProgress[], 
  settings: UserSettings, 
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void, 
  userRank: number,
  onScreenChange: (screen: Screen) => void,
  dailyProgress: DailyProgress,
  setStats: (s: Partial<UserStats> | ((prev: UserStats) => UserStats)) => void,
  setDailyProgress: (p: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress)) => void,
  play: (sound: string) => void,
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) {
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyType | null>(null);
  const [waveOffset, setWaveOffset] = useState(0);
  const [isHydrationExpanded, setIsHydrationExpanded] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1.0);

  // continuous fluid loop
  useEffect(() => {
    let frame: number;
    const tick = () => {
      setWaveOffset(prev => (prev + 2.5) % 360);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const waterGoal = settings.commitmentLevel === 'casual' 
    ? Math.max(4, Math.floor((settings.waterGoal || 8) * 0.5)) 
    : settings.commitmentLevel === 'intense' 
      ? Math.floor((settings.waterGoal || 8) * 1.5) 
      : (settings.waterGoal || 8);

  const totalCompletedDays = history.filter(h => h.completed).length;
  const xpToNextLevel = ((stats.level || 1) * 1000) - stats.xp;
  const progressPercent = Math.min(100, (stats.xp / ((stats.level || 1) * 1000)) * 100);

  // Dynamically calculate actual category points based on historical database and today's live progress
  const physicalVolts = (() => {
    let pts = stats.pointsByCategory?.physical || 0;
    (history || []).forEach(day => {
      if (day.pushupsDone) pts += 40;
      if (day.footballDone) pts += 40;
      if (day.waterDrank > 0) pts += Math.min(8, day.waterDrank) * 15;
    });
    if (dailyProgress) {
      if (dailyProgress.pushupsDone) pts += 40;
      if (dailyProgress.footballDone) pts += 40;
      if (dailyProgress.waterDrank > 0) pts += Math.min(8, dailyProgress.waterDrank) * 15;
    }
    return Math.max(0, Math.round(pts));
  })();

  const mentalVolts = (() => {
    let pts = stats.pointsByCategory?.mental || 0;
    (history || []).forEach(day => {
      if (day.breathingDone) pts += 45;
      if (day.bubblesDone) pts += 35;
      if (day.memoryDone) pts += 45;
      if (day.reactionDone) pts += 45;
      if (day.gratitudeDone) pts += 35;
      if (day.meditationDone) pts += 50;
    });
    if (dailyProgress) {
      if (dailyProgress.breathingDone) pts += 45;
      if (dailyProgress.bubblesDone) pts += 35;
      if (dailyProgress.memoryDone) pts += 45;
      if (dailyProgress.reactionDone) pts += 45;
      if (dailyProgress.gratitudeDone) pts += 35;
      if (dailyProgress.meditationDone) pts += 50;
    }
    return Math.max(0, Math.round(pts));
  })();

  const creativeVolts = (() => {
    let pts = stats.pointsByCategory?.creative || 0;
    (history || []).forEach(day => {
      if (day.drawingDone) pts += 50;
      if (day.writingDone) pts += 50;
    });
    if (dailyProgress) {
      if (dailyProgress.drawingDone) pts += 50;
      if (dailyProgress.writingDone) pts += 50;
    }
    return Math.max(0, Math.round(pts));
  })();

  // Use a beautifully adaptive max categories target based on level
  const maxCategoryPoints = Math.max(500, (stats.level || 1) * 350);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-40 w-full max-w-5xl mx-auto px-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start space-y-6 lg:space-y-0">
        {/* Left Column: Level Tracker, Core Stats, Hydration Widget, & Skill Breakdown */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6 flex flex-col">
          {/* Header with Level Card */}
          <motion.div variants={item} className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#69C496] rounded-3xl text-white shadow-lg shadow-[#69C496]/20">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#4F3F34] tracking-tight uppercase">Nexora Analytics</h2>
                <p className="text-[10px] font-black text-[#69C496] uppercase tracking-[0.3em]">Growth Synchronizer Protocol</p>
              </div>
            </div>

            {/* Level card aligned to retention design palette */}
            <div className="bg-gradient-to-br from-[#7D6B58] to-[#4F3F34] text-white relative overflow-hidden shadow-xl border-none rounded-[2rem] p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#69C496]/10 rounded-full -ml-12 -mb-12 blur-xl" />
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Current Status</p>
                    <h3 className="text-3xl font-black flex items-center gap-3 mt-1">
                      Level {stats.level || 1} 
                      <span className="text-[9px] bg-[#69C496]/30 text-[#E8F5EE] px-3 py-1 rounded-full uppercase tracking-widest font-black">
                        {stats.level && stats.level > 10 ? 'Elite Architect' : 'Guardian Novice'}
                      </span>
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <Crown size={28} className="text-[#69C496]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Experience Points</p>
                    <p className="text-xs font-black tracking-tight">{stats.xp} / {(stats.level || 1) * 1000}</p>
                  </div>
                  <div className="h-4 bg-black/25 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-[#69C496] to-[#51AF7E] rounded-full shadow-[0_0_12px_rgba(105,196,150,0.5)]"
                    />
                  </div>
                  <p className="text-[9px] font-black text-right uppercase tracking-[0.2em] italic text-[#E9E4D4]">{xpToNextLevel} XP to Next Evolution</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={item} className="grid grid-cols-2 gap-4">
            {[
              { label: 'Hyper Streak', value: stats.streak || 0, sub: 'Daily Frequency', icon: <Flame className="text-amber-600 animate-pulse" />, bg: 'bg-amber-100/40' },
              { label: 'Neural Score', value: stats.totalPoints || 0, sub: 'Lifetime Volts', icon: <Zap className="text-[#69C496]" />, bg: 'bg-emerald-100/40' },
              { label: 'Nexus Rank', value: `#${userRank || '--'}`, sub: 'Global Standing', icon: <Star className="text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />, bg: 'bg-purple-100/40' },
              { label: 'Wallet', value: `${stats.coins || 0}N`, sub: 'Nexora Currency', icon: <Coins className="text-amber-500" />, bg: 'bg-amber-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-[#E9E4D4] rounded-3xl p-6 flex flex-col items-center text-center group transition-all duration-300 hover:scale-[1.02] shadow-sm">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-transform`}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black text-[#4F3F34]/50 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-[#4F3F34] leading-none">{stat.value}</p>
                <p className="text-[9px] text-[#4F3F34]/60 font-bold uppercase mt-2 opacity-75">{stat.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Hydration Analytics Box Card */}
          <motion.div
            variants={item}
            onClick={() => {
              if (play) play("click");
              onScreenChange('hydration-detail');
            }}
            className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 flex items-center justify-between group transition-all duration-300 hover:scale-[1.01] active:scale-98 cursor-pointer shadow-sm relative overflow-hidden"
          >
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#69C496]">Hydration Suite</span>
                <span className="bg-sky-50 text-sky-500 font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                  Interactive Arena
                </span>
              </div>
              <h3 className="text-xl font-black text-[#4F3F34] mt-1 flex items-center gap-1.5">
                Hydration Analytics
              </h3>
              <p className="text-xs font-semibold text-[#4F3F34]/70 uppercase tracking-widest">
                Challenge Streak: <span className="text-sky-500 font-black">{parseInt(localStorage.getItem('hydration_consecutive_days') || '0', 10)}</span> Days
              </p>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Bottle Water Level: <span className="text-[#4F3F34]">{(parseFloat(localStorage.getItem('hydration_water_level') || '0.0') * 100).toFixed(0)}%</span>
              </p>
            </div>

            {/* Counter and Small Beautiful Water Bottle */}
            <div className="flex items-center gap-4 shrink-0 z-10">
              <div className="text-right flex flex-col justify-center">
                <div className="text-[9px] font-black text-[#69C496] uppercase tracking-wider">STREAK</div>
                <div className="text-2xl font-black text-[#4F3F34] leading-none">
                  {parseInt(localStorage.getItem('hydration_consecutive_days') || '0', 10)}
                </div>
                <div className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">DAYS</div>
              </div>
              
              {/* Small Beautiful Water Bottle */}
              <div className="relative w-12 h-20 flex items-center justify-center bg-sky-50/50 rounded-2xl p-1.5 border border-sky-100/50 overflow-hidden">
                <svg width="28" height="56" viewBox="0 0 100 200" className="overflow-visible">
                  <defs>
                    <clipPath id="bottle-shape-progress">
                      <path d="M 38,10 Q 50,8 62,10 L 62,35 C 72,40 82,50 82,65 L 82,185 Q 82,195 72,195 L 28,195 Q 18,195 18,185 L 18,65 C 18,50 28,40 38,35 Z" />
                    </clipPath>
                  </defs>

                  {/* Bottle Outline */}
                  <path 
                    d="M 38,10 Q 50,8 62,10 L 62,35 C 72,40 82,50 82,65 L 82,185 Q 82,195 72,195 L 28,195 Q 18,195 18,185 L 18,65 C 18,50 28,40 38,35 Z" 
                    fill="#F0F9FF" 
                    stroke="#0E5A8E" 
                    strokeWidth="7" 
                    strokeLinejoin="round" 
                  />

                  {/* Clipped liquid body inside the bottle */}
                  <g clipPath="url(#bottle-shape-progress)">
                    <rect x="0" y="0" width="100" height="200" fill="#BAE6FD" opacity="0.32" />
                    
                    {/* Waving rising water */}
                    <rect 
                      x="0" 
                      y={195 - (parseFloat(localStorage.getItem('hydration_water_level') || '0.0') * 140)} 
                      width="100" 
                      height="200" 
                      fill="#0EA5E9" 
                      className="transition-all duration-300"
                    />

                    {/* Wave surface motion */}
                    <path 
                      d={`M -20,${195 - (parseFloat(localStorage.getItem('hydration_water_level') || '0.0') * 140)} 
                         q 15,${Math.sin((waveOffset * Math.PI) / 180) * 4} 30,0 
                         t 30,0 30,0 30,0 30,0
                         L 120,200 L -20,200 Z`} 
                      fill="#38BDF8" 
                      opacity="0.9"
                    />
                  </g>

                  {/* Highlight glass glare reflex */}
                  <path 
                    d="M 28,70 L 28,175" 
                    fill="none" 
                    stroke="#FFFFFF" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    opacity="0.45" 
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div variants={item} className="bg-white border border-[#E9E4D4] rounded-[2rem] p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-[#4F3F34] uppercase tracking-wider">Skill Architecture</h3>
               <BarChart2 size={16} className="text-[#69C496]" />
            </div>

            <div className="grid grid-cols-1 gap-6">
               {[
                 { label: 'Physical Rigor', points: physicalVolts, icon: <Dumbbell size={14} />, color: 'bg-[#69C496]' },
                 { label: 'Mental Clarity', points: mentalVolts, icon: <BrainCircuit size={14} />, color: 'bg-[#7D6B58]' },
                 { label: 'Creative Flow', points: creativeVolts, icon: <Palette size={14} />, color: 'bg-[#BACBBF]' }
               ].map((cat, i) => (
                 <div key={i} className="space-y-3">
                   <div className="flex justify-between items-center px-1">
                     <div className="flex items-center gap-2">
                       <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                       <span className="text-[10px] font-black text-[#4F3F34] uppercase tracking-widest">{cat.label}</span>
                     </div>
                     <span className="text-xs font-black text-[#4F3F34]">{cat.points} <span className="opacity-40 text-[9px]">VOLTS</span></span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-[#E9E4D4]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: maxCategoryPoints > 0 ? `${Math.min(100, Math.round((cat.points / maxCategoryPoints) * 100))}%` : '0%' }}
                        className={`h-full ${cat.color} rounded-full`}
                      />
                   </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive Graphs, Trends, & Achievements Catalog */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col pt-0 lg:pt-0">
          {/* Visual Analytics */}
          <motion.div variants={item} className="w-full">
            <StatsCharts 
              history={history} 
              stats={stats} 
              dailyProgress={dailyProgress} 
              settings={settings} 
            />
          </motion.div>
          
          {/* Trophies & Badges */}
          <motion.div variants={item} className="bg-white border border-[#E9E4D4] rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#4F3F34]">Achievement Vault</h3>
            <p className="text-[9px] font-bold text-[#69C496] uppercase tracking-[0.25em]">Historical Frequency Artifacts</p>
          </div>
          <Trophy size={20} className="text-[#69C496] animate-pulse" />
        </div>

        <p className="text-[10px] font-black text-[#4F3F34]/60 uppercase tracking-widest mb-4">Milestone Badges (Tap to inspect)</p>
        <div className="grid grid-cols-4 gap-4">
           {/* Milestone Badges representation */}
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
             const isUnlocked = i <= Math.floor((stats.level || 1) / 2) || i <= (stats.trophies?.length || 0);
             // Create a shadow trophy representation on click if unlocked
             const simulatedTrophy: TrophyType = {
               id: `MILESTONE_BADGE_0${i}`,
               type: i % 3 === 0 ? 'broken' : i % 2 === 0 ? 'ice' : 'golden',
               earnedDate: new Date(Date.now() - i * 86400000).toISOString(),
               lastUpdated: new Date().toISOString()
             };

             return (
               <button 
                 key={i} 
                 disabled={!isUnlocked}
                 onClick={() => setSelectedTrophy(simulatedTrophy)}
                 className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                   isUnlocked 
                     ? 'bg-[#E8F5EE] text-[#69C496] border-2 border-[#D0EFE0] hover:scale-105 active:scale-95 shadow-sm shadow-[#69C496]/10' 
                     : 'bg-white/40 text-[#4F3F34]/10 border border-[#E9E4D4] cursor-not-allowed'
                 }`}
               >
                 <Award size={isUnlocked ? 24 : 16} />
               </button>
             );
           })}
        </div>

        {stats.trophies && stats.trophies.length > 0 && (
          <div className="mt-8 pt-8 border-t border-[#E9E4D4]">
             <p className="text-[10px] font-black text-[#4F3F34]/60 uppercase tracking-widest mb-4">Highest Artifacts (Tap to view big)</p>
             <div className="flex flex-wrap gap-3">
                {stats.trophies.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setSelectedTrophy(t)}
                    className="px-4 py-3 bg-[#FCFAF6] hover:bg-white active:scale-95 transition-all rounded-2xl border border-[#E9E4D4] flex items-center gap-3 min-w-[155px] shadow-sm text-left group relative pr-10"
                  >
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.15)] flex-shrink-0 ${
                      t.type === 'golden' ? 'bg-amber-400 animate-pulse' : 
                      t.type === 'ice' ? 'bg-sky-300' : 'bg-rose-400'
                    }`} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-[#4F3F34] group-hover:text-[#69C496] transition-colors truncate">
                        {t.id.replace(/_/g, ' ').split(' ')[0]}
                      </span>
                      <span className={`text-[8px] font-bold uppercase tracking-tighter opacity-75 ${
                        t.type === 'golden' ? 'text-amber-600' : 
                        t.type === 'ice' ? 'text-sky-600' : 'text-rose-600'
                      }`}>
                        {t.type} Status
                      </span>
                    </div>
                    {/* Hover Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Do you want to delete the ${t.type.toUpperCase()} trophy, bro?`)) {
                          const updated = (stats.trophies || []).filter(item => item.id !== t.id);
                          setStats({ ...stats, trophies: updated });
                          showToast("Trophy deleted successfully 🗑️", "success");
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 z-10"
                      title="Delete trophy"
                    >
                      <Trash2 size={13} />
                    </button>
                  </button>
                ))}
             </div>
          </div>
        )}
      </motion.div>
    </div> {/* End Right Column */}
  </div> {/* End Grid Container */}

      {/* History Calendar */}
      <motion.div variants={item}>
        <Calendar history={history} />
      </motion.div>

      <motion.div variants={item} className="text-center pb-8 opacity-40">
         <p className="text-[9px] font-black uppercase tracking-[0.42em] text-[#4F3F34]">Nexora Nexus Engine v1.2</p>
         <p className="text-[8px] font-bold mt-1 uppercase italic text-[#69C496]">Restored Architecture Protocol 🏮</p>
      </motion.div>

      {/* STUNNING ANIMATED FULLSCREEN TROPHY VIEWER MODAL */}
      <AnimatePresence>
        {selectedTrophy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white overflow-y-auto"
          >
            {/* Soft decorative background glow circles */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full filter blur-3xl opacity-30 bg-gradient-to-br from-[#69C496] to-transparent pointer-events-none" />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="max-w-md w-full text-center relative z-10 flex flex-col items-center py-6"
            >
              {/* Close Button in right upper corner of view */}
              <button 
                onClick={() => setSelectedTrophy(null)} 
                className="absolute top-0 right-4 p-2.5 bg-white/10 hover:bg-white/20 active:scale-90 transition-all rounded-full border border-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 text-amber-400 mb-2 mt-4">
                <Sparkles size={14} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em]">Artifact Inspected</span>
                <Sparkles size={14} className="animate-spin" />
              </div>

              {/* Title Header */}
              <h1 className="text-2xl font-black uppercase tracking-tight italic text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-amber-200 mb-6 px-4">
                {selectedTrophy.id.replace(/_/g, ' ')}
              </h1>

              {/* Big Interactive Animated Trophy Centerpiece */}
              <div className="w-56 h-56 relative mb-6">
                {selectedTrophy.type === 'golden' && (
                  <div className="w-full h-full scale-105">
                    <GoldenTrophy />
                  </div>
                )}
                {selectedTrophy.type === 'ice' && (
                  <div className="w-full h-full scale-105 filter drop-shadow-[0_0_20px_rgba(186,203,191,0.5)]">
                    <IceTrophy />
                  </div>
                )}
                {selectedTrophy.type === 'broken' && (
                  <div className="w-full h-full scale-105">
                    <BrokenTrophy />
                  </div>
                )}
              </div>

              {/* Status Banner */}
              <div className={`px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest mb-6 border ${
                selectedTrophy.type === 'golden' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                selectedTrophy.type === 'ice' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {selectedTrophy.type} Trophy Status
              </div>

              {/* Custom descriptive text */}
              <p className="text-xs font-semibold max-w-sm leading-relaxed text-gray-300 px-6 mb-8">
                {selectedTrophy.type === 'golden' && (
                  "Pure Fire, bro! Your daily disciplines are running hot. Keep this streak active to protect its gorgeous solid gold finish!"
                )}
                {selectedTrophy.type === 'ice' && (
                  "Frozen Preservation, bro! Consistent efforts have turned this into high-strength ice, securing your credentials on the global server!"
                )}
                {selectedTrophy.type === 'broken' && (
                  "Damaged Integrity, bro. The daily sequence got cold and collapsed under pressure! Rebuild your streak to weld this trophy back into gold!"
                )}
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl w-full p-4 mb-8 text-left space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <span>Earned Milestone:</span>
                  <span className="text-white">{new Date(selectedTrophy.earnedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <span>Last Refined:</span>
                  <span className="text-white">{new Date(selectedTrophy.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setSelectedTrophy(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border border-white/10 active:scale-95"
                >
                  Close View
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to permanently delete this ${selectedTrophy.type.toUpperCase()} trophy, bro? This is irreversible!`)) {
                      const updated = (stats.trophies || []).filter(item => item.id !== selectedTrophy.id);
                      setStats({ ...stats, trophies: updated });
                      showToast("Trophy permanently deleted 🗑️", "success");
                      setSelectedTrophy(null);
                    }
                  }}
                  className="flex-1 bg-rose-600/90 hover:bg-rose-700 text-white px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-md shadow-rose-900/20 shadow-inner"
                >
                  Delete Trophy 🗑️
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
