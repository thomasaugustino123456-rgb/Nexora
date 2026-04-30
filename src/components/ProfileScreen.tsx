import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Target, Award, Star, History, Camera, Crown, Globe, MessageSquare, Zap, Clock, MoreHorizontal, Video } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserSettings, UserStats, SocialCircle, Screen } from '../types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function ProfileScreen({ settings, setSettings, stats, user, setActiveScreen, circles }: { settings: UserSettings, setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void, stats: UserStats, user: FirebaseUser | null, setActiveScreen: (screen: Screen) => void, circles: SocialCircle[] }) {
  const currentXP = stats.xp || 0;
  const nextLevelXP = (stats.level || 1) * 1000;
  const progressPercent = (currentXP / nextLevelXP) * 100;

  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('reels');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'social_videos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setUserVideos(snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((vid: any) => vid.userId === user.uid));
    });
    return () => unsub();
  }, [user]);

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

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-blue-50/50 backdrop-blur-xl rounded-[2rem] border border-white/50">
        <button 
          onClick={() => setActiveTab('reels')}
          className={`flex-1 py-4 rounded-[1.5rem] flex flex-col items-center gap-1 transition-all ${activeTab === 'reels' ? 'bg-white shadow-xl text-blue-600' : 'text-blue-900/30 hover:bg-white/50'}`}
        >
          <Video size={18} className={activeTab === 'reels' ? 'animate-pulse' : ''} />
          <span className="text-[9px] font-black uppercase tracking-widest">Pulses</span>
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-4 rounded-[1.5rem] flex flex-col items-center gap-1 transition-all ${activeTab === 'posts' ? 'bg-white shadow-xl text-blue-600' : 'text-blue-900/30 hover:bg-white/50'}`}
        >
          <Target size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">Feed</span>
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'reels' ? (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.25em]">Nexus Reels</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
               {userVideos.map(video => (
                 <div key={video.id} className="relative aspect-[9/16] bg-blue-50 rounded-2xl overflow-hidden shadow-sm border border-white/5 group cursor-pointer active:scale-95 transition-all">
                    <video 
                      src={video.videoUrl} 
                      className="w-full h-full object-cover" 
                      muted 
                      playsInline
                      onMouseOver={(e) => e.currentTarget.play().catch(()=>{})}
                      onMouseOut={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white bg-black/50 px-2 py-0.5 rounded-lg text-[9px] font-bold backdrop-blur-sm">
                       <Zap size={10} className="text-orange-400" /> {video.likes || 0}
                    </div>
                 </div>
               ))}
               {userVideos.length === 0 && (
                 <div className="col-span-3 py-16 text-center space-y-4">
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-200">
                     <Video size={32} />
                   </div>
                   <p className="text-blue-900/20 text-[10px] font-black uppercase tracking-[0.3em] italic">No pulses broadcasted yet...</p>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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
          </div>
        )}
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
