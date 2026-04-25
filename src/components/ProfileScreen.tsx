import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Target, Award, Star, History, Camera, Crown, Globe, MessageSquare, Zap, Clock, MoreHorizontal } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserSettings, UserStats, SocialCircle, Screen } from '../types';

export function ProfileScreen({ settings, setSettings, stats, user, setActiveScreen, circles }: { settings: UserSettings, setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void, stats: UserStats, user: FirebaseUser | null, setActiveScreen: (screen: Screen) => void, circles: SocialCircle[] }) {
  const currentXP = stats.xp || 0;
  const nextLevelXP = (stats.level || 1) * 1000;
  const progressPercent = (currentXP / nextLevelXP) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto w-full space-y-8 pb-32"
    >
      <div className="flex flex-col items-center gap-6 pt-10">
        <div className="relative group">
           <div className="absolute inset-0 bg-blue-500 rounded-[2.5rem] rotate-6 scale-105 opacity-20 blur-xl group-hover:rotate-12 transition-transform duration-500" />
           <div className="w-32 h-32 rounded-[2.5rem] bg-white border-4 border-white shadow-2xl relative z-10 overflow-hidden">
              {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover shadow-inner" referrerPolicy="no-referrer" /> : <User size={64} className="m-8 text-blue-200" />}
           </div>
           <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl z-20 border-4 border-white">
              <Shield size={20} />
           </div>
        </div>

        <div className="text-center space-y-2">
           <h2 className="text-4xl font-black text-blue-900 tracking-tight leading-none">{settings.displayName || user?.displayName || 'Nexora User'}</h2>
           <div className="flex items-center gap-2 justify-center">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Level {stats.level || 1} Pioneer</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest leading-loose">The Nexus Node</span>
           </div>
        </div>
      </div>

      <div className="glass-card p-8 space-y-6">
         <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-blue-900/30 uppercase tracking-[0.25em]">Evolution Path</h3>
            <span className="text-[10px] font-black text-blue-500">{currentXP} / {nextLevelXP} XP</span>
         </div>
         <div className="w-full h-3 bg-blue-50 rounded-full overflow-hidden shadow-inner flex p-0.5">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_#3b82f6]"
            />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <button onClick={() => setActiveScreen('social')} className="glass-card p-6 flex flex-col items-center text-center space-y-2 hover:border-blue-400 transition-all active:scale-95 group">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
               <Globe size={24} />
            </div>
            <span className="font-black text-blue-900 uppercase text-[10px] tracking-widest pt-1">The Nexus</span>
         </button>
         <button onClick={() => setActiveScreen('notebook')} className="glass-card p-6 flex flex-col items-center text-center space-y-2 hover:border-blue-400 transition-all active:scale-95 group">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
               <Zap size={24} />
            </div>
            <span className="font-black text-blue-900 uppercase text-[10px] tracking-widest pt-1">Brain Hub</span>
         </button>
      </div>

      <div className="glass-card p-8">
         <h3 className="text-xs font-black text-blue-900/30 uppercase tracking-[0.25em] mb-6">Achievements Unlock</h3>
         <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="min-w-[120px] aspect-[4/5] bg-blue-50 rounded-[2rem] border-2 border-white flex flex-col items-center justify-center p-4 text-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                  <div className="p-3 bg-white rounded-2xl shadow-sm mb-3">
                     <Award size={24} className="text-blue-500" />
                  </div>
                  <p className="font-black text-blue-900 uppercase text-[8px] tracking-widest leading-tight">Elite Pioneer</p>
               </div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}
