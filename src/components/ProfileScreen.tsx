import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Target, Award, Star, History, Camera, Crown, Globe, MessageSquare, Zap, Clock, MoreHorizontal, Video, Plus, Info } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserSettings, UserStats, SocialCircle, Screen } from '../types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function ProfileScreen({ settings, setSettings, stats, user, setActiveScreen, circles, onUpdateProfile }: { settings: UserSettings, setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void, stats: UserStats, user: FirebaseUser | null, setActiveScreen: (screen: Screen) => void, circles: SocialCircle[], onUpdateProfile: (name: string, photo: string) => void }) {
  const currentXP = stats.xp || 0;
  const nextLevelXP = (stats.level || 1) * 1000;
  const progressPercent = (currentXP / nextLevelXP) * 100;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(settings.displayName || user?.displayName || 'Nexora User');
  const [editPhoto, setEditPhoto] = useState(settings.profilePic || user?.photoURL || '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    onUpdateProfile(editName, editPhoto);
    setIsEditing(false);
  };

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
              {editPhoto ? <img src={editPhoto} className="w-full h-full object-cover shadow-inner" referrerPolicy="no-referrer" /> : <User size={64} className="m-8 text-blue-200" />}
           </div>
           <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl z-20 border-4 border-white hover:scale-110 active:scale-95 transition-all"
           >
              <Camera size={20} />
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="text-center space-y-2">
           {isEditing ? (
             <div className="flex flex-col items-center gap-2">
               <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-4xl font-black text-blue-900 tracking-tight leading-none text-center bg-blue-50 border-none rounded-2xl p-2 w-full max-w-sm focus:ring-2 focus:ring-blue-400"
               />
               <button onClick={saveProfile} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100">Sync Changes</button>
             </div>
           ) : (
             <h2 onClick={() => setIsEditing(true)} className="text-4xl font-black text-blue-900 tracking-tight leading-none cursor-pointer hover:opacity-70">{settings.displayName || user?.displayName || 'Nexora User'}</h2>
           ) }
           <div className="flex items-center gap-2 justify-center">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Level {stats.level || 1} Pioneer</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest leading-loose flex items-center gap-1 hover:text-blue-600"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Page'}
              </button>
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

      {/* Helpful Things Section */}
      <div className="space-y-6">
        <h3 className="text-center text-[10px] font-black text-blue-900/30 uppercase tracking-[0.4em]">Nexus Support Protocols</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              if (confirm('Are you sure? This will clear all data and refresh the app.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-red-400 group transition-all"
          >
            <div className="p-3 bg-red-50 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">Master Reset</p>
              <p className="text-[8px] text-blue-400 font-bold uppercase mt-1">Force Frequency Sync</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveScreen('social')}
            className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-blue-400 group transition-all"
          >
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">Nexus Hub</p>
              <p className="text-[8px] text-blue-400 font-bold uppercase mt-1">Social Protocols</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveScreen('leaderboard')}
            className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-yellow-400 group transition-all"
          >
            <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600 group-hover:scale-110 transition-transform">
              <Globe size={24} />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">Global Rank</p>
              <p className="text-[8px] text-blue-400 font-bold uppercase mt-1">Check Peer Standing</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveScreen('progress')}
            className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-indigo-400 group transition-all"
          >
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">Brain Hub</p>
              <p className="text-[8px] text-blue-400 font-bold uppercase mt-1">Access Neural Logs</p>
            </div>
          </button>
        </div>

        <div className="glass-card p-8 bg-blue-900 text-white border-none shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
           <div className="relative z-10 flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black flex items-center gap-2">Data Protection <Shield size={18} className="text-blue-400" /></h4>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Integrity: 100% Secured</p>
              </div>
              <Info size={32} className="opacity-20" />
           </div>
           <p className="text-xs mt-4 opacity-80 leading-relaxed font-medium">Your progress and biological data are synchronized across the Nexus Grid. No hackers or bugs can breach the Bio-ID lock, bro. 🔥</p>
        </div>
      </div>
      
      <div className="glass-card p-8">
         <h3 className="text-xs font-black text-blue-900/30 uppercase tracking-[0.25em] mb-6">Achievements Unlock</h3>
         <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {stats.trophies && stats.trophies.length > 0 ? (
              stats.trophies.map((t, i) => (
                <div key={t.id || i} className="min-w-[120px] aspect-[4/5] bg-blue-50 rounded-[2rem] border-2 border-white flex flex-col items-center justify-center p-4 text-center hover:scale-105 transition-all">
                   <div className={`p-3 rounded-2xl shadow-sm mb-3 ${t.type === 'golden' ? 'bg-yellow-50 text-yellow-600' : t.type === 'ice' ? 'bg-blue-50 text-blue-400' : 'bg-red-50 text-red-400'}`}>
                      <Award size={24} />
                   </div>
                   <p className="font-black text-blue-900 uppercase text-[8px] tracking-widest leading-tight">{t.id.split('-')[0]} Rank</p>
                   <p className="text-[6px] font-bold text-blue-400/60 mt-1 uppercase italic">{t.type}</p>
                </div>
              ))
            ) : (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="min-w-[120px] aspect-[4/5] bg-blue-50 rounded-[2rem] border-2 border-white flex flex-col items-center justify-center p-4 text-center grayscale opacity-40">
                   <div className="p-3 bg-white rounded-2xl shadow-sm mb-3">
                      <Award size={24} className="text-blue-500" />
                   </div>
                   <p className="font-black text-blue-900 uppercase text-[8px] tracking-widest leading-tight">Elite Pioneer</p>
                </div>
              ))
            )}
         </div>
      </div>
    </motion.div>
  );
}
