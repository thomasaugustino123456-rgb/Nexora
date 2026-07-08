import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserStats, UserSettings } from '../types';
import { GoldenTrophy, IceTrophy, BrokenTrophy } from './Trophies';
import { Mascot } from './Mascot';
import { Sparkles, ArrowLeft, Trophy as TrophyIcon, Zap, Flame } from 'lucide-react';

interface PublicRankViewProps {
  userId: string;
  onClose: () => void;
}

export function PublicRankView({ userId, onClose }: PublicRankViewProps) {
  const [data, setData] = useState<{ stats: UserStats, settings: UserSettings } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        let stats: any = {};
        let settings: any = {};
        let hasData = false;

        // Try leaderboard first (publicly readable for any authenticated user)
        try {
          const lbDoc = await getDoc(doc(db, 'leaderboard', userId));
          if (lbDoc.exists()) {
            const lbData = lbDoc.data();
            stats = {
              level: lbData.level || 1,
              streak: lbData.streak || 0,
              totalPoints: lbData.totalPoints || 0,
              trophies: lbData.trophies || [],
            };
            settings = {
              displayName: lbData.displayName || 'Nexora User',
              activeHat: lbData.activeSkin || 'none',
              profilePic: lbData.photoURL || '',
            };
            hasData = true;
          }
        } catch (lbErr) {
          console.warn("PublicRankView: failed to fetch public leaderboard card", lbErr);
        }

        // If user is the owner or admin, they can query the full users doc
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const d = userDoc.data();
            stats = d.stats || stats;
            settings = {
              displayName: d.displayName || settings.displayName || 'Nexora User',
              activeHat: d.activeSkin || settings.activeHat || 'none',
              profilePic: d.profilePic || settings.profilePic || '',
              ...d
            };
            hasData = true;
          }
        } catch (userDocErr) {
          console.log("PublicRankView: Not authorized to fetch detailed profile. Displaying public leaderboard data.");
        }

        if (hasData) {
          setData({ stats, settings });
        }
      } catch (e) {
        console.error("PublicRankView error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  if (loading) return (
    <div className="fixed inset-0 bg-white z-[2000] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (!data) return (
    <div className="fixed inset-0 bg-white z-[2000] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-blue-900 mb-4">User Not Found</h2>
      <button onClick={onClose} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest">Go Back</button>
    </div>
  );

  const { stats, settings } = data;
  const latestTrophy = stats.trophies?.[0];
  const isOwner = auth.currentUser?.uid === userId;
  const displayName = isOwner ? settings.displayName : "Competitor";
  const activeHat = isOwner ? settings.activeHat : "none";

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white z-[2000] overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center p-6 max-w-md mx-auto relative">
        <button onClick={onClose} className="absolute left-6 top-8 p-3 bg-white shadow-lg rounded-2xl text-blue-900 active:scale-90 transition-all">
          <ArrowLeft size={24} />
        </button>
 
        <div className="mt-12 mb-8 text-center space-y-2">
           <h2 className="text-3xl font-black text-blue-900 italic uppercase tracking-tighter">
             {displayName}'s Rank
           </h2>
           <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Nexora Elite Profile</p>
        </div>
 
        {/* Level & Trophy Section */}
        <div className="w-full glass-card p-8 flex flex-col items-center gap-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
           
           <div className="w-48 h-48 relative">
              <Mascot 
                mood="happy" 
                hat={activeHat} 
                className="w-full h-full drop-shadow-2xl" 
              />
           </div>
 
           {isOwner && (
             <div className="flex flex-col items-center gap-2">
                <div className="text-5xl font-black text-blue-900">LV.{stats.level || 1}</div>
                <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Current Prestige</p>
             </div>
           )}
        </div>
 
        <div className="grid grid-cols-2 gap-4 w-full mt-6">
           <div className="glass-card p-6 flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                <Flame size={20} />
              </div>
              <div className="text-xl font-black text-blue-900">{stats.streak}</div>
              <p className="text-[8px] font-black text-blue-900/40 uppercase tracking-widest">Day Streak</p>
           </div>
           
           <div className="glass-card p-6 flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white">
                <Sparkles size={20} />
              </div>
              <div className="text-xl font-black text-blue-900">{stats.totalPoints}</div>
              <p className="text-[8px] font-black text-blue-900/40 uppercase tracking-widest">Total Points</p>
           </div>
        </div>
 
        {isOwner && latestTrophy && (
          <div className="w-full mt-6 glass-card p-8 flex flex-col items-center gap-4 bg-emerald-50/30 border-2 border-emerald-100">
             <div className="w-32 h-32">
                {latestTrophy.type === 'golden' && <GoldenTrophy />}
                {latestTrophy.type === 'ice' && <IceTrophy />}
                {latestTrophy.type === 'broken' && <BrokenTrophy />}
             </div>
             <div className="text-center">
                <h4 className="font-black text-blue-900 uppercase">Latest Achievement</h4>
                <p className="text-[10px] font-bold text-gray-500 italic mt-1 font-serif">
                   {latestTrophy.type === 'golden' ? '"Pure discipline captured."' : '"Consistent but cooling."'}
                </p>
             </div>
          </div>
        )}

        <div className="mt-12 w-full text-center">
           <button 
             onClick={() => {
               window.location.href = window.location.origin;
             }}
             className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
           >
             <Zap size={20} /> Join Nexora Now
           </button>
           <p className="mt-4 text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em]">Created with Nexora AI Studio • Join 10k+ Legends</p>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
         <div className="absolute top-1/4 -right-20 w-64 h-64 bg-blue-200/20 blur-[100px] rounded-full" />
         <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-indigo-200/20 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
