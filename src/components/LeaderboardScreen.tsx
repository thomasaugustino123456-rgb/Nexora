import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy as TrophyIcon, Star, Flame } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { LeaderboardEntry, UserSettings, UserStats } from '../types';

const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Champion', 'Divine', 'Nexus'];

export function LeaderboardScreen({ leaderboard, user, settings, stats, onBack }: { leaderboard: LeaderboardEntry[], user: FirebaseUser | null, settings: UserSettings, stats: UserStats, onBack: () => void }) {
  const userRank = leaderboard.findIndex(l => l.uid === user?.uid) + 1;
  const currentLeague = settings.league || 'Bronze';
  const leagueIndex = LEAGUES.indexOf(currentLeague);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-screen bg-white"
    >
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
          <ChevronRight className="rotate-180" size={28} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">{currentLeague} League</h2>
          <div className="flex gap-1 mt-1">
            {LEAGUES.map((l, i) => (
              <div 
                key={l} 
                className={`w-2 h-2 rounded-full ${i <= leagueIndex ? 'bg-yellow-400' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="bg-blue-50 p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yellow-200">
          <TrophyIcon size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-blue-900/60 uppercase tracking-widest">Promotion Zone</p>
          <p className="text-sm font-bold text-blue-900">Top 3 advance to the next league!</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.uid === user?.uid;
          const rank = index + 1;
          
          return (
            <motion.div
              key={entry.uid}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                isCurrentUser ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02] z-10' : 'bg-white border-2 border-gray-50'
              }`}
            >
              <div className={`w-8 text-center font-black text-lg ${
                rank === 1 ? 'text-yellow-500' : 
                rank === 2 ? 'text-gray-400' : 
                rank === 3 ? 'text-orange-400' : 
                isCurrentUser ? 'text-white' : 'text-blue-900/20'
              }`}>
                {rank}
              </div>
              
              <div className="relative">
                {entry.photoURL ? (
                  <img src={entry.photoURL || ''} alt={entry.displayName} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20" referrerPolicy="no-referrer" loading="lazy" />
                ) : (
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isCurrentUser ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    {(entry.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                {rank <= 3 && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-bold truncate ${isCurrentUser ? 'text-white' : 'text-blue-900'}`}>
                  {entry.displayName}
                </h4>
                <div className="flex items-center gap-2">
                  <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isCurrentUser ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    Lvl {entry.level}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold opacity-60">
                    <Flame size={12} className={isCurrentUser ? 'text-white' : 'text-orange-500'} />
                    {entry.streak}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-black ${isCurrentUser ? 'text-white' : 'text-blue-900'}`}>
                  {entry.weeklyPoints}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>
                  Points
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {userRank > 10 && (
        <div className="p-4 bg-blue-600 text-white shadow-2xl">
           <div className="flex items-center gap-4 max-w-2xl mx-auto">
             <div className="w-8 text-center font-black text-lg">{userRank}</div>
             <div className="flex-1 font-black text-xs uppercase tracking-widest">You're almost there! Keep pushing! 🔥</div>
             <div className="text-right">
               <div className="text-lg font-black">{stats.weeklyXP || 0}</div>
               <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">XP</div>
             </div>
           </div>
        </div>
      )}
    </motion.div>
  );
}
