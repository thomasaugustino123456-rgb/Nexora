import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Award, Target, Trophy, TrendingUp, ChevronLeft, ChevronRight, Droplets, Wind, Palette, Flame, Clock } from 'lucide-react';
import { UserStats, DailyProgress, UserSettings } from '../types';
import { Calendar } from './Calendar';
import { StatsCharts } from './StatsCharts';

export function ProgressScreen({ stats, history, settings, setSettings, userRank }: { stats: UserStats, history: DailyProgress[], settings: UserSettings, setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void, userRank: number }) {
  const totalCompletedDays = history.filter(h => h.completed).length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-32"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
          <TrendingUp size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-blue-900 tracking-tight">Your Progress</h2>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Growth Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mb-3 shadow-inner">
            <Flame size={24} />
          </div>
          <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1">Max Streak</p>
          <p className="text-2xl font-black text-blue-900">{stats.maxStreak || 0}</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 mb-3 shadow-inner">
            <Award size={24} />
          </div>
          <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1">Completed</p>
          <p className="text-2xl font-black text-blue-900">{totalCompletedDays}</p>
        </div>
      </div>

      <StatsCharts history={history} />
      
      <div className="glass-card p-6">
        <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest mb-6">Badges & Achievements</h3>
        <div className="grid grid-cols-4 gap-4">
           {/* Example badges */}
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
             <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center ${i <= Math.floor(stats.level / 2) ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'bg-blue-50 text-blue-200'}`}>
               <Trophy size={i <= Math.floor(stats.level / 2) ? 24 : 20} className={i <= Math.floor(stats.level / 2) ? "animate-bounce" : ""} />
             </div>
           ))}
        </div>
      </div>

      <Calendar history={history} />
    </motion.div>
  );
}
