import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Award, Target, Trophy, 
  TrendingUp, ChevronLeft, Droplets, Flame, 
  Clock, Zap, Star, Shield, BrainCircuit, 
  Palette, Dumbbell, Coins, Crown, BarChart2,
  X, ShieldAlert, Sparkles
} from 'lucide-react';
import { UserStats, DailyProgress, UserSettings, Trophy as TrophyType } from '../types';
import { Calendar } from './Calendar';
import { StatsCharts } from './StatsCharts';
import { GoldenTrophy, IceTrophy, BrokenTrophy } from './Trophies';

export function ProgressScreen({ 
  stats, 
  history, 
  settings, 
  setSettings, 
  userRank 
}: { 
  stats: UserStats, 
  history: DailyProgress[], 
  settings: UserSettings, 
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void, 
  userRank: number 
}) {
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyType | null>(null);

  const totalCompletedDays = history.filter(h => h.completed).length;
  const xpToNextLevel = ((stats.level || 1) * 1000) - stats.xp;
  const progressPercent = Math.min(100, (stats.xp / ((stats.level || 1) * 1000)) * 100);

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
      className="space-y-6 pb-40 w-full max-w-2xl mx-auto px-4"
    >
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

      {/* Category Breakdown */}
      <motion.div variants={item} className="bg-white border border-[#E9E4D4] rounded-[2rem] p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black text-[#4F3F34] uppercase tracking-wider">Skill Architecture</h3>
           <BarChart2 size={16} className="text-[#69C496]" />
        </div>

        <div className="grid grid-cols-1 gap-6">
           {[
             { label: 'Physical Rigor', points: stats.pointsByCategory?.physical || 0, icon: <Dumbbell size={14} />, color: 'bg-[#69C496]' },
             { label: 'Mental Clarity', points: stats.pointsByCategory?.mental || 0, icon: <BrainCircuit size={14} />, color: 'bg-[#7D6B58]' },
             { label: 'Creative Flow', points: stats.pointsByCategory?.creative || 0, icon: <Palette size={14} />, color: 'bg-[#BACBBF]' }
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
                    animate={{ width: `${Math.min(100, (cat.points / 5000) * 100)}%` }}
                    className={`h-full ${cat.color} rounded-full`}
                  />
               </div>
             </div>
           ))}
        </div>
      </motion.div>

      {/* Visual Analytics */}
      <motion.div variants={item}>
        <StatsCharts history={history} stats={stats} />
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
                    className="px-4 py-3 bg-[#FCFAF6] hover:bg-white active:scale-95 transition-all rounded-2xl border border-[#E9E4D4] flex items-center gap-3 min-w-[150px] shadow-sm text-left group"
                  >
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.15)] ${
                      t.type === 'golden' ? 'bg-amber-400 animate-pulse' : 
                      t.type === 'ice' ? 'bg-sky-300' : 'bg-rose-400'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-[#4F3F34] group-hover:text-[#69C496] transition-colors">
                        {t.id.replace(/_/g, ' ').split(' ')[0]}
                      </span>
                      <span className={`text-[8px] font-bold uppercase tracking-tighter opacity-75 ${
                        t.type === 'golden' ? 'text-amber-600' : 
                        t.type === 'ice' ? 'text-sky-600' : 'text-rose-600'
                      }`}>
                        {t.type} Status
                      </span>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        )}
      </motion.div>

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

              {/* Dismiss button */}
              <button
                onClick={() => setSelectedTrophy(null)}
                className="w-full bg-[#69C496] hover:bg-[#51AF7E] text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Close View
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
