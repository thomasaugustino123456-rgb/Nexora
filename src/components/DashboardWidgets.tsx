import React from 'react';
import { motion } from 'motion/react';
import { Activity, Sprout, Trophy, Zap, Heart, Shield, Crown } from 'lucide-react';
import { UserStats, DailyProgress, UserSettings } from '../types';

interface DashboardWidgetsProps {
  stats: UserStats;
  dailyProgress: DailyProgress;
  settings: UserSettings;
}

export const DashboardWidgets = React.memo(({ stats, dailyProgress, settings }: DashboardWidgetsProps) => {
  const isPlantAlive = settings.plantState && !settings.plantState.isDead;
  const level = Math.floor((stats.xp || 0) / 1000) + 1;
  const progressPercent = Math.min(100, Math.max(0, ((dailyProgress as any).completionsCount || 0) / Math.max(1, settings.challengeCountGoal || 3) * 100));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
      {/* Activity Widget */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="glass-card p-4 flex flex-col justify-between min-h-[140px] border-blue-500/20 bg-blue-50/30"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Activity size={18} />
          </div>
          <span className="text-[10px] font-black text-blue-900/30 uppercase tracking-widest">Active</span>
        </div>
        <div>
          <h4 className="text-2xl font-black text-blue-900 tracking-tighter">{progressPercent.toFixed(0)}%</h4>
          <div className="w-full h-1.5 bg-blue-100 rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-blue-600"
            />
          </div>
        </div>
      </motion.div>

      {/* Plant Widget */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="glass-card p-4 flex flex-col justify-between min-h-[140px] border-emerald-500/20 bg-emerald-50/30"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Sprout size={18} />
          </div>
          <span className="text-[10px] font-black text-emerald-900/30 uppercase tracking-widest">Ecosystem</span>
        </div>
        <div className="flex flex-col gap-1">
          <h4 className={`text-sm font-black uppercase tracking-tight ${isPlantAlive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {isPlantAlive ? 'Status: Alive' : 'Status: Dead'}
          </h4>
          <p className="text-[10px] font-bold text-slate-400">STAGE {settings.plantState?.stage || 0} GROWING</p>
        </div>
      </motion.div>

      {/* Trophies Widget */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="glass-card p-4 flex flex-col justify-between min-h-[140px] border-amber-500/20 bg-amber-50/30"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Trophy size={18} />
          </div>
          <span className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest">Trophies</span>
        </div>
        <div>
          <h4 className="text-2xl font-black text-amber-900 tracking-tighter">{(stats.trophies || []).length}</h4>
          <p className="text-[10px] font-bold text-amber-800/40 uppercase tracking-widest mt-1">Global Artifacts</p>
        </div>
      </motion.div>

      {/* Level Widget */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="glass-card p-4 flex flex-col justify-between min-h-[140px] border-purple-500/20 bg-purple-50/30"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Shield size={18} />
          </div>
          <span className="text-[10px] font-black text-purple-900/30 uppercase tracking-widest">Nexora Rank</span>
        </div>
        <div className="flex items-center gap-2">
          <h4 className="text-2xl font-black text-purple-900 tracking-tighter">L{level}</h4>
          <div className="flex-1 h-3 bg-purple-100 rounded-lg relative overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((stats.xp || 0) % 1000) / 10}%` }}
              className="h-full bg-purple-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
});
