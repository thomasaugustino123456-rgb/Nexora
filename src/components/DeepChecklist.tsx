import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Droplets, 
  Wind, 
  Palette, 
  Brain, 
  Target, 
  Heart, 
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
import { DailyProgress, UserStats, UserSettings } from '../types';

interface DeepChecklistProps {
  progress: DailyProgress;
  stats: UserStats;
  settings: UserSettings;
  onSelectTask: (task: string) => void;
}

const TASK_CONFIG: Record<string, { label: string, icon: any, color: string, xp: number }> = {
  pushups: { label: 'Push-ups Protocol', icon: <Flame size={18} />, color: 'text-orange-500', xp: 30 },
  water: { label: 'Hydration Intake', icon: <Droplets size={18} />, color: 'text-blue-500', xp: 20 },
  breathing: { label: 'Mental Clarity', icon: <Wind size={18} />, color: 'text-cyan-500', xp: 25 },
  drawing: { label: 'Creative Spark', icon: <Palette size={18} />, color: 'text-pink-500', xp: 40 },
  memory: { label: 'Neural Matrix', icon: <Brain size={18} />, color: 'text-purple-500', xp: 35 },
  reaction: { label: 'Reflex Calibration', icon: <Target size={18} />, color: 'text-red-500', xp: 30 },
  meditation: { label: 'Zen Alignment', icon: <Heart size={18} />, color: 'text-emerald-500', xp: 50 },
  gratitude: { label: 'Soul Frequency', icon: <Sparkles size={18} />, color: 'text-yellow-500', xp: 25 },
};

export const DeepChecklist: React.FC<DeepChecklistProps> = ({ progress, stats, settings, onSelectTask }) => {
  const archived = settings.archivedOfficialChallenges || [];
  const tasks = Object.entries(TASK_CONFIG).filter(([id]) => !archived.includes(id));
  const completedCount = tasks.filter(([id]) => {
    return (progress as any)[id + 'Done'] || (id === 'water' && progress.waterDrank >= (settings.waterGoal || 2));
  }).length;
  const totalTasks = tasks.length || 1;
  const completionRate = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Deep Checklist</h3>
          <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em]">Protocol Comprehensive Analysis</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-blue-600 leading-none">{completionRate}%</div>
          <p className="text-[9px] font-bold text-blue-900/30 uppercase">Operational Status</p>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 gap-3">
        {tasks.map(([id, config], index) => {
          const isDone = (progress as any)[id + 'Done'] || (id === 'water' && progress.waterDrank >= (settings.waterGoal || 2));
          
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectTask(id)}
              className={`p-4 rounded-3xl border-2 flex items-center gap-4 transition-all group ${
                isDone 
                  ? 'bg-emerald-50/50 border-emerald-100' 
                  : 'bg-white border-blue-50 hover:border-blue-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-90 ${
                isDone ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-blue-50 text-blue-600 shadow-blue-50'
              }`}>
                {config.icon}
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h4 className={`font-black text-sm uppercase tracking-tight ${isDone ? 'text-emerald-900/60 line-through' : 'text-blue-900'}`}>
                    {config.label}
                  </h4>
                  {isDone && <CheckCircle2 size={14} className="text-emerald-500" />}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isDone ? 'text-emerald-500' : 'text-blue-900/30'}`}>
                    {config.xp} XP Points
                  </span>
                  {!isDone && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-blue-400 uppercase">
                      <Zap size={10} /> Priority
                    </span>
                  )}
                </div>
              </div>

              {!isDone && (
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Award size={18} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Motivation Footer */}
      <div className="p-5 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden shadow-xl shadow-blue-200">
        <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Officer Insight</span>
          </div>
          <p className="font-bold text-sm leading-relaxed italic">
            "Your discipline determines your destiny, bro. Don't leave any marker unchecked on this list today. HQ is watching! 🛡️"
          </p>
        </div>
      </div>
    </div>
  );
};
