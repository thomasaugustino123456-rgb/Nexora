import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Award, Target, Trophy, 
  TrendingUp, ChevronLeft, Droplets, Flame, 
  Clock, Zap, Star, Shield, BrainCircuit, 
  Palette, Dumbbell, Coins, Crown, BarChart2
} from 'lucide-react';
import { UserStats, DailyProgress, UserSettings } from '../types';
import { Calendar } from './Calendar';
import { StatsCharts } from './StatsCharts';

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
      className="space-y-6 pb-40"
    >
      {/* Header with Level Card */}
      <motion.div variants={item} className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-blue-900 tracking-tight">Nexora Analytics</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Growth Synchronizer</p>
          </div>
        </div>

        <div className="glass-card p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden shadow-2xl shadow-blue-200 border-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-12 -mb-12 blur-xl" />
          
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Nexus Rank</p>
                <h3 className="text-4xl font-black flex items-center gap-3">
                  Level {stats.level || 1} 
                  <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest font-black">
                    {stats.level && stats.level > 10 ? 'Elite' : 'Rookie'}
                  </span>
                </h3>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <Crown size={32} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest">Experience Points</p>
                <p className="text-xs font-black">{stats.xp} / {(stats.level || 1) * 1000}</p>
              </div>
              <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/10 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
              <p className="text-[9px] font-bold opacity-60 text-right uppercase tracking-widest italic">{xpToNextLevel} XP to Next Evolution</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        {[
          { label: 'Hyper Streak', value: stats.streak || 0, sub: 'Daily Frequency', icon: <Flame className="text-orange-500" />, bg: 'bg-orange-50' },
          { label: 'Neural Score', value: stats.totalPoints || 0, sub: 'Lifetime Volts', icon: <Zap className="text-yellow-500" />, bg: 'bg-yellow-50' },
          { label: 'Nexus Rank', value: `#${userRank || '--'}`, sub: 'Global Standing', icon: <Star className="text-purple-500" />, bg: 'bg-purple-50' },
          { label: 'Wallet', value: `${stats.coins || 0}N`, sub: 'Nexora Currency', icon: <Coins className="text-blue-500" />, bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:rotate-12 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-blue-900/30 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-blue-900 leading-none">{stat.value}</p>
            <p className="text-[8px] text-blue-400 font-bold uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">{stat.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Category Breakdown */}
      <motion.div variants={item} className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Skill Architecture</h3>
           <BarChart2 size={18} className="text-blue-400" />
        </div>

        <div className="grid grid-cols-1 gap-6">
           {[
             { label: 'Physical Rigor', points: stats.pointsByCategory?.physical || 0, icon: <Dumbbell size={14} />, color: 'bg-red-500' },
             { label: 'Mental Clarity', points: stats.pointsByCategory?.mental || 0, icon: <BrainCircuit size={14} />, color: 'bg-blue-500' },
             { label: 'Creative Flow', points: stats.pointsByCategory?.creative || 0, icon: <Palette size={14} />, color: 'bg-emerald-500' }
           ].map((cat, i) => (
             <div key={i} className="space-y-3">
               <div className="flex justify-between items-center px-1">
                 <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                   <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{cat.label}</span>
                 </div>
                 <span className="text-xs font-black text-blue-900">{cat.points} <span className="opacity-40 text-[9px]">VOLTS</span></span>
               </div>
               <div className="h-2 bg-blue-50 rounded-full overflow-hidden border border-blue-100">
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
        <StatsCharts history={history} />
      </motion.div>
      
      {/* Trophies & Badges */}
      <motion.div variants={item} className="glass-card p-8 bg-neutral-900 text-white border-none shadow-[20px_40px_80px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Achievement Vault</h3>
            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.3em]">Locked Frequency Artifacts</p>
          </div>
          <Trophy size={24} className="text-orange-500" />
        </div>

        <div className="grid grid-cols-4 gap-4">
           {/* Legacy Badges representation */}
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
             const isUnlocked = i <= Math.floor((stats.level || 1) / 2) || i <= (stats.trophies?.length || 0);
             return (
               <div key={i} className={`aspect-square rounded-[1.5rem] flex items-center justify-center transition-all ${isUnlocked ? 'bg-orange-500/20 text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.1)] border-2 border-orange-500/20' : 'bg-white/5 text-white/5 border border-white/5'}`}>
                 <Award size={isUnlocked ? 28 : i === 7 ? 20 : 16} className={isUnlocked ? "animate-pulse" : ""} />
               </div>
             );
           })}
        </div>

        {stats.trophies && stats.trophies.length > 0 && (
          <div className="mt-8 pt-8 border-t border-white/5">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Highest Artifacts</p>
             <div className="flex flex-wrap gap-2">
                {stats.trophies.slice(0, 3).map(t => (
                  <div key={t.id} className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t.id.split('_').join(' ')}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </motion.div>

      {/* History Calendar */}
      <motion.div variants={item}>
        <Calendar history={history} />
      </motion.div>

      <motion.div variants={item} className="text-center pb-8 opacity-20">
         <p className="text-[10px] font-black uppercase tracking-[0.5em]">Nexora Nexus Engine v1.2</p>
         <p className="text-[8px] font-bold mt-1 uppercase italic">Restored Architecture Protocol 🏮</p>
      </motion.div>
    </motion.div>
  );
}
