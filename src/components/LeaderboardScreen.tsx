import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Trophy as TrophyIcon, 
  Star, 
  Flame, 
  Sparkles, 
  Crown, 
  TrendingUp, 
  Clock, 
  Award,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { LeaderboardEntry, UserSettings, UserStats } from '../types';
import { Mascot } from './Mascot';

const LEAGUES = [
  'Bronze', 
  'Silver', 
  'Gold', 
  'Platinum', 
  'Diamond', 
  'Master', 
  'Champion', 
  'Divine', 
  'Nexus'
];

// Beautiful custom vector SVG component for each specific League to give a high-prestige feel
export function LeagueIcon({ league, active, className = "w-14 h-14" }: { league: string; active: boolean; className?: string }) {
  const activeShadow = active ? "drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse" : "opacity-45 grayscale-[40%]";
  
  switch (league) {
    case 'Bronze':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="url(#bronzeGrad)" stroke="#B45309" strokeWidth="4" />
          <path d="M50 25 L65 45 L50 65 L35 45 Z" fill="#92400E" opacity="0.8" />
          <defs>
            <linearGradient id="bronzeGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'Silver':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="60" height="60" rx="16" fill="url(#silverGrad)" stroke="#64748B" strokeWidth="4" />
          <circle cx="50" cy="50" r="18" fill="#475569" opacity="0.8" />
          <path d="M50 38 L54 46 L62 48 L56 54 L58 62 L50 58 L42 62 L44 54 L38 48 L46 46 Z" fill="#F1F5F9" />
          <defs>
            <linearGradient id="silverGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'Gold':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15 L80 30 L80 65 L50 85 L20 65 L20 30 Z" fill="url(#goldGrad)" stroke="#D97706" strokeWidth="4" />
          <path d="M50 28 L57 42 L72 44 L61 54 L64 69 L50 61 L36 69 L39 54 L28 44 L43 42 Z" fill="#FEF08A" />
          <circle cx="50" cy="50" r="2" fill="#D97706" />
          <defs>
            <linearGradient id="goldGrad" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'Platinum':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15 L85 45 L50 85 L15 45 Z" fill="url(#platGrad)" stroke="#0284C7" strokeWidth="4" />
          <path d="M50 30 L62 48 L50 66 L38 48 Z" fill="#E2E8F0" opacity="0.65" />
          <circle cx="50" cy="48" r="8" fill="#F1F5F9" />
          <defs>
            <linearGradient id="platGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'Diamond':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L82 35 L50 90 L18 35 Z" fill="url(#diamGrad)" stroke="#06B6D4" strokeWidth="4.5" />
          <path d="M50 10 L66 35 L50 90 Z" fill="#CCFBF1" opacity="0.4" />
          <path d="M50 10 L34 35 L50 90 Z" fill="#0891B2" opacity="0.2" />
          <line x1="18" y1="35" x2="82" y2="35" stroke="#06B6D4" strokeWidth="3" />
          <defs>
            <linearGradient id="diamGrad" x1="18" y1="10" x2="82" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ECFEFF" />
              <stop offset="30%" stopColor="#22D3EE" />
              <stop offset="70%" stopColor="#0891B2" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'Master':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="60" height="60" rx="30" transform="rotate(45 50 50)" fill="url(#masterGrad)" stroke="#7C3AED" strokeWidth="4" />
          <path d="M38 45 L50 32 L62 45 L57 68 L43 68 Z" fill="#DDD6FE" opacity="0.75" />
          <circle cx="50" cy="50" r="10" fill="#7C3AED" />
          <defs>
            <linearGradient id="masterGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="40%" stopColor="#A78BFA" />
              <stop offset="80%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'Champion':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 12 L85 22 L75 68 L50 88 L25 68 L15 22 Z" fill="url(#champGrad)" stroke="#DC2626" strokeWidth="4" />
          <path d="M50 25 L80 32 L72 65 L50 82 Z" fill="#FEE2E2" opacity="0.35" />
          <path d="M50 40 L54 48 L63 49 L56 55 L58 64 L50 59 L42 64 L44 55 L37 49 L46 48 Z" fill="#EF4444" />
          <defs>
            <linearGradient id="champGrad" x1="15" y1="12" x2="85" y2="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF2F2" />
              <stop offset="30%" stopColor="#F87171" />
              <stop offset="70%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'Divine':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="url(#divGrad)" stroke="#EC4899" strokeWidth="5" />
          <circle cx="50" cy="50" r="22" fill="#FDF2F8" opacity="0.6" stroke="#DB2777" strokeWidth="2" />
          <path d="M50 35 L53 43 L61 45 L55 51 L57 59 L50 55 L43 59 L45 51 L39 45 L47 43 Z" fill="#DB2777" />
          <defs>
            <linearGradient id="divGrad" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDF2F8" />
              <stop offset="40%" stopColor="#F472B6" />
              <stop offset="80%" stopColor="#DB2777" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'Nexus':
      return (
        <svg className={`${className} ${activeShadow}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#nexusRing)" strokeWidth="6" strokeDasharray="6 4" />
          <path d="M50 15 L82 48 L50 82 L18 48 Z" fill="url(#nexusGrad)" stroke="#10B981" strokeWidth="4" />
          <path d="M50 30 L62 48 L50 66 L38 48 Z" fill="#ECFDF5" opacity="0.5" />
          <defs>
            <linearGradient id="nexusGrad" x1="18" y1="15" x2="82" y2="82" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D1FAE5" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
            <linearGradient id="nexusRing" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>
          </defs>
        </svg>
      );
    default:
      return <TrophyIcon className={className} />;
  }
}

export function LeaderboardScreen({ 
  leaderboard, 
  user, 
  settings, 
  stats, 
  onBack,
  onClaimRankReward
}: { 
  leaderboard: LeaderboardEntry[]; 
  user: FirebaseUser | null; 
  settings: UserSettings; 
  stats: UserStats; 
  onBack: () => void;
  onClaimRankReward: (rank: number, coins: number) => void;
}) {
  const userRank = leaderboard.findIndex(l => l.uid === user?.uid) + 1;
  const currentLeague = settings.league || 'Bronze';
  const leagueIndex = LEAGUES.indexOf(currentLeague);

  const startOfWeek = useMemo(() => {
    const today = new Date();
    return new Date(today.setDate(today.getDate() - today.getDay()))
      .toISOString()
      .split("T")[0];
  }, []);

  const hasClaimedThisWeek = stats.lastRankRewardClaimWeek === startOfWeek;

  // Filter or format the countdown statement
  const daysString = useMemo(() => {
    const today = new Date();
    const sunday = new Date();
    sunday.setDate(today.getDate() + (7 - today.getDay()));
    sunday.setHours(21, 59, 59, 999);
    const diffMs = sunday.getTime() - today.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h left`;
  }, []);

  // Determine user level accurately
  const calculatedLevel = stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col min-h-screen bg-gradient-to-b from-[#F3F7FA] via-white to-white pb-32 overflow-x-hidden"
    >
      {/* 1. Header Navigation - Styled like the high-contrast archives bar */}
      <div className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <button 
          onClick={onBack} 
          className="p-3 bg-slate-50 border border-slate-100 shadow-sm rounded-2xl text-blue-900/60 hover:text-blue-900 hover:bg-slate-100 active:scale-95 transition-all"
        >
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.25em]">Global Arenas</p>
          <h2 className="text-lg font-black text-blue-950 uppercase tracking-tight">{currentLeague} League</h2>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <TrendingUp size={20} className="animate-pulse" />
        </div>
      </div>

      {/* 2. Interactive League Slider Track - Gorgeous horizontal progression (UNBOXED) */}
      <div className="px-6 pt-6 pb-2 flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Your League Journey</span>
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-100/60 px-2.5 py-1 rounded-full text-[10px] font-black text-yellow-600">
            <Zap size={11} className="fill-yellow-500 text-yellow-500 animate-bounce" />
            <span>Rank Up Now</span>
          </div>
        </div>
        
        <div className="flex items-center gap-5 overflow-x-auto py-2 px-1 no-scrollbar">
          {LEAGUES.map((l, i) => {
            const isActive = l === currentLeague;
            const isCompleted = i < leagueIndex;
            return (
              <div key={l} className="flex flex-col items-center gap-2 flex-shrink-0 relative">
                <div className="relative">
                  <LeagueIcon league={l} active={isActive || isCompleted} className="w-15 h-15 transition-transform duration-300 hover:scale-110" />
                  {isCompleted && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border border-white text-white shadow-md">
                      <CheckCircle2 size={11} className="fill-emerald-500 text-white" />
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-1.5 right-1/2 translate-x-1/2 bg-yellow-400 text-[8px] font-black uppercase text-yellow-950 px-1.5 py-0.5 rounded-md shadow-md animate-bounce">
                      ACTIVE
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-blue-900 font-extrabold' : 'text-slate-400'}`}>
                  {l}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-[1px] bg-slate-200/60 mt-1" />
      </div>

      {/* 3. Competitive Alert & Status Header - Flat integrated notification banner */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-150 pb-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-600">
              <Clock size={12} className="text-blue-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-700">{daysString}</span>
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Chrono Championship is Live</h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Complete active habits daily! The top 3 users in the arena advance to the prestige ranks.
            </p>
          </div>
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
            <TrophyIcon size={24} className="fill-blue-50 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Dynamic Prize Chest and Claim Panel */}
      <div className="px-6 py-2">
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-[2rem] p-5 shadow-2xl relative overflow-hidden border-2 border-indigo-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrophyIcon size={120} className="text-yellow-400 rotate-12" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                Weekly Prize Chest
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 px-2.5 py-1 rounded-full font-black uppercase">
                Reset Weekly
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner shadow-black/40 animate-pulse">
                {userRank > 0 && userRank <= 3 ? "🎁" : userRank >= 4 && userRank <= 6 ? "📦" : "🔒"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black uppercase tracking-tight truncate">
                  {userRank > 0 && userRank <= 6 
                    ? `Congratulations, bro!` 
                    : `Unranked / Outside Top 6`}
                </h4>
                <p className="text-[11px] text-slate-300 font-medium leading-tight">
                  {userRank > 0 && userRank <= 6 
                    ? `You are Rank #${userRank} this week and eligible for special coins reward, bro!` 
                    : `Reach Rank 1-6 this week to unlock gorgeous chests and earn raw coin items!`}
                </p>
              </div>
            </div>

            {/* Reward Claim Parameters */}
            {userRank > 0 && userRank <= 6 ? (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Calculated Reward</p>
                  <p className="text-md font-black text-yellow-400 flex items-center gap-1">
                    🪙 +{userRank === 1 ? 500 : userRank === 2 ? 300 : userRank === 3 ? 200 : 50} Coins
                  </p>
                </div>
                {hasClaimedThisWeek ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Claimed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const coins = userRank === 1 ? 500 : userRank === 2 ? 300 : userRank === 3 ? 200 : 50;
                      onClaimRankReward(userRank, coins);
                    }}
                    className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-950 font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg ring-2 ring-yellow-400/30 border border-yellow-200/50 transition-all active:scale-95 duration-200"
                  >
                    Claim Coins
                  </button>
                )}
              </div>
            ) : (
              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <p className="text-[8px] font-black text-yellow-400 uppercase">Top 1 - 3 Rewards</p>
                  <p className="text-xs font-black text-white">Up to 500 🪙</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                  <p className="text-[8px] font-black text-indigo-300 uppercase">Top 4 - 6 Rewards</p>
                  <p className="text-xs font-black text-white font-black">50 🪙</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. The Leaderboard List Stream - Clean continuous layout with separators */}
      <div className="flex-1 px-6 py-3">
        <div className="flex items-center justify-between py-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Award size={14} className="text-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Arena Rankings</span>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase">{leaderboard.length} Combatants</span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20">
              <Mascot mood="neutral" className="w-full h-full" />
            </div>
            <h4 className="text-slate-800 font-black uppercase text-xs">No Combatants Active</h4>
            <p className="text-slate-400 text-[11px] max-w-xs font-medium">
              Complete your active habits, log some hydration, or write in your workbook to claim your position instantly, bro!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.uid === user?.uid;
              const rank = index + 1;
              const isTop3 = rank <= 3;
              
              let rowBg = "bg-transparent";
              let textColor = "text-slate-800";
              let subTextColor = "text-slate-500";
              let pointsTextStyle = "text-blue-950 font-black";
              let rankBadge = "";
              
              if (rank === 1) rankBadge = "👑";
              else if (rank === 2) rankBadge = "🥈";
              else if (rank === 3) rankBadge = "🥉";
              else rankBadge = rank.toString();

              if (isCurrentUser) {
                rowBg = "bg-blue-50/70 border-x border-y border-blue-100/50 rounded-2xl my-1 relative";
                textColor = "text-blue-950 font-black";
                subTextColor = "text-blue-600";
                pointsTextStyle = "text-blue-600 font-black";
              }

              return (
                <React.Fragment key={entry.uid}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.4) }}
                    className={`flex items-center gap-4 py-3.5 px-3 transition-all relative overflow-hidden ${rowBg}`}
                  >
                    {/* Rank Position */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">
                      {rankBadge}
                    </div>

                    {/* Profile Picture / Avatar */}
                    <div className="relative">
                      {entry.photoURL ? (
                        <img 
                          src={entry.photoURL} 
                          alt={entry.displayName} 
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/35 shadow-sm flex-shrink-0" 
                          referrerPolicy="no-referrer" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-tr from-blue-100 to-indigo-150 text-blue-700 ring-2 ring-white/35 shadow-sm">
                          {(entry.displayName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isTop3 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 shadow border border-white">
                          <Star size={7} className="text-yellow-950 fill-yellow-950" />
                        </div>
                      )}
                    </div>

                    {/* Name and Level Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-black text-sm uppercase tracking-wide truncate ${textColor}`}>
                        {entry.displayName || "Nexora Champion"}
                        {isCurrentUser && <span className="ml-1.5 font-bold text-[8px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">You</span>}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-150">
                          Lvl {entry.level || 1}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-black tracking-tight">
                          <Flame size={11} className="text-orange-500" />
                          <span className={subTextColor}>
                            {entry.streak || 0} Day Streak
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Points Counter */}
                    <div className="text-right pl-2 flex-shrink-0">
                      <div className={`text-base ${pointsTextStyle}`}>
                        {entry.weeklyPoints !== undefined ? entry.weeklyPoints : ((entry as any).weeklyXP || 0)}
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        XP
                      </div>
                    </div>
                  </motion.div>

                  {/* Duolingo promotion dashed zone line */}
                  {rank === 3 && leaderboard.length > 3 && (
                    <div className="my-3 flex items-center gap-3 px-2">
                      <div className="h-[1px] flex-grow bg-emerald-400/40" />
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        <Shield size={9} className="fill-emerald-400 text-teal-600" />
                        Promotion Cut-off
                      </span>
                      <div className="h-[1px] flex-grow bg-emerald-400/40" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Sticky Floating Motivation Footer - Welcomes the user with actionable instructions if they're rank 0 or unranked */}
      {userRank === 0 && (
        <div className="fixed bottom-24 left-4 right-4 bg-white border-2 border-blue-100/70 p-4 rounded-[2.2rem] shadow-2xl z-[90] flex items-center gap-4 max-w-md mx-auto animate-bounce-slow">
          <div className="w-12 h-12 flex-shrink-0">
            <Mascot mood="happy" className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Mascot TIP</p>
            <h5 className="text-xs font-black text-blue-950 uppercase">Complete Habits to Enter!</h5>
            <p className="text-[10px] text-gray-400 font-medium">Earn point items to appear on live standings!</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-blue-900">{stats.weeklyXP || 0}</div>
            <div className="text-[8px] font-black uppercase tracking-wider text-blue-900/40">Your XP</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
