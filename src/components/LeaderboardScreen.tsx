import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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
  AlertCircle,
  WifiOff,
  Loader2
} from 'lucide-react';
import { FirebaseUser } from '../firebase';
import { LeaderboardEntry, UserSettings, UserStats } from '../types';
import { Mascot } from './Mascot';
import { useSound } from '../hooks/useSound';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { getStartOfWeekKey } from '../lib/firestoreUtils';

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

export function getRankRewardCoins(rank: number): number {
  if (rank === 1) return 400;
  if (rank === 2) return 200;
  if (rank === 3) return 150;
  if (rank >= 4 && rank <= 6) return 50;
  return 0;
}

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
  isLeaderboardLoading = false,
  onBack,
  onClaimRankReward
}: { 
  leaderboard: LeaderboardEntry[]; 
  user: FirebaseUser | null; 
  settings: UserSettings; 
  stats: UserStats; 
  isLeaderboardLoading?: boolean;
  onBack: () => void;
  onClaimRankReward: (rank: number, coins: number) => void;
}) {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const hasRealUsers = useMemo(() => {
    return (leaderboard || []).some(
      (item) => item.uid && !item.uid.startsWith("bot-") && item.uid !== user?.uid
    );
  }, [leaderboard, user?.uid]);

  const isSyncingRankings = isOnline && (isLeaderboardLoading || !hasRealUsers);

  const [displayList, setDisplayList] = useState<LeaderboardEntry[]>(() => {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    return (leaderboard || []).filter((item) => {
      if (!item || !item.uid) return false;
      // In offline mode: only bots and current user are shown per user specifications
      if (!online && !item.uid.startsWith("bot-") && item.uid !== user?.uid) return false;
      if (item.uid.startsWith("bot-")) return true;
      if ((item as any).deleted || (item as any).isDeleted || (item as any).is_deleted || (item as any).status === "deleted") return false;
      const pts = Math.max(
        Number(item.weeklyPoints || 0),
        Number((item as any).weeklyXP || 0),
        Number(item.totalPoints || 0),
        Number((item as any).points || 0),
        Number((item as any).xp || 0)
      );
      return pts > 0;
    }).map((item) => ({
      ...item,
      displayName: item.displayName || (item.uid.startsWith("bot-") ? "AI_Rival" : (item.uid === user?.uid ? (settings.displayName || user?.displayName || "You") : `Champion_${item.uid.slice(0, 4)}`))
    }));
  });

  const currentRank = useMemo(() => {
    const userPts = Math.max(
      Number(stats.weeklyPoints || 0),
      Number(stats.weeklyXP || 0),
      Number(stats.totalPoints || 0),
      Number(stats.xp || 0)
    );
    if (userPts <= 0) return 0;
    // When live standings are syncing, avoid computing a transient/fake rank against only bots
    if (isSyncingRankings) return -1;
    const idx = displayList.findIndex(l => l.uid === user?.uid);
    return idx !== -1 ? idx + 1 : 0;
  }, [displayList, user, stats, isSyncingRankings]);

  const userRank = currentRank;
  const { play } = useSound();
  const [isAnimatingRank, setIsAnimatingRank] = useState<boolean>(false);
  const [showCelebrationSpot, setShowCelebrationSpot] = useState<boolean>(false);
  const [animationPreviousRank, setAnimationPreviousRank] = useState<number | null>(null);
  const [climbPhase, setClimbPhase] = useState<'idle' | 'anticipation' | 'shooting' | 'impact' | 'celebrate'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const scrollToUser = (instant = false) => {
    const attempt = () => {
      const el = document.getElementById("leaderboard-user-row");
      if (el) {
        el.scrollIntoView({
          behavior: instant ? "auto" : "smooth",
          block: "center"
        });
      }
    };
    attempt();
    requestAnimationFrame(attempt);
    setTimeout(attempt, 60);
    setTimeout(attempt, 180);
    setTimeout(attempt, 350);
  };

  // Auto scroll to user row on screen launch
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToUser(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const cardAnimProps = useMemo(() => {
    switch (climbPhase) {
      case 'anticipation':
        return {
          scaleX: 1.15,
          scaleY: 0.8,
          y: 8,
          borderColor: "rgba(245, 158, 11, 0.4)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        };
      case 'shooting':
        return {
          scaleX: 0.85,
          scaleY: 1.25,
          y: -15,
          borderColor: "rgba(245, 158, 11, 0.8)",
          boxShadow: "0 15px 30px rgba(245, 158, 11, 0.45), 0 0 15px rgba(245, 158, 11, 0.3)"
        };
      case 'impact':
        return {
          scaleX: 1.25,
          scaleY: 0.75,
          y: 4,
          borderColor: "rgba(245, 158, 11, 0.5)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        };
      case 'celebrate':
        return {
          scaleX: 1.04,
          scaleY: 1.04,
          y: -3,
          borderColor: "rgba(245, 158, 11, 0.6)",
          boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3), 0 0 12px rgba(245, 158, 11, 0.2)"
        };
      case 'idle':
      default:
        return {
          scaleX: 1,
          scaleY: 1,
          y: 0,
          boxShadow: "none"
        };
    }
  }, [climbPhase]);

  // Set up the moving animation if there's a stored previous rank or if glowing button was clicked
  useEffect(() => {
    const sanitizedLeaderboard = (leaderboard || []).filter((item) => {
      if (!item || !item.uid) return false;
      // In offline mode: only bots and current user are shown per user specifications
      if (!isOnline && !item.uid.startsWith("bot-") && item.uid !== user?.uid) {
        return false;
      }
      if (item.uid.startsWith("bot-")) return true;
      if ((item as any).deleted || (item as any).isDeleted || (item as any).is_deleted || (item as any).status === "deleted") return false;
      const pts = Math.max(
        Number(item.weeklyPoints || 0),
        Number((item as any).weeklyXP || 0),
        Number(item.totalPoints || 0),
        Number((item as any).points || 0),
        Number((item as any).xp || 0)
      );
      return pts > 0;
    }).map((item) => ({
      ...item,
      displayName: item.displayName || (item.uid.startsWith("bot-") ? "AI_Rival" : (item.uid === user?.uid ? (settings.displayName || user?.displayName || "You") : `Champion_${item.uid.slice(0, 4)}`))
    }));

    if (!user || sanitizedLeaderboard.length === 0 || currentRank <= 0) {
      setDisplayList(sanitizedLeaderboard);
      return;
    }

    const prevRankStr = localStorage.getItem("nexora_previous_rank");
    const wasGlowActive = localStorage.getItem("nexora_scrolling_to_user_rank") === "true";

    // Always update displayList immediately so real users are visible instantly
    setDisplayList(sanitizedLeaderboard);

    // Track all timers for this effect run to guarantee complete cleanup on unmount or re-render
    const activeTimers: ReturnType<typeof setTimeout>[] = [];
    const addTimer = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      activeTimers.push(id);
      return id;
    };

    // Safety watchdog: after 8.5 seconds, force settle back to idle so UI never hangs
    addTimer(() => {
      setClimbPhase('idle');
      setIsAnimatingRank(false);
      setShowCelebrationSpot(false);
    }, 8500);

    if (prevRankStr) {
      const prevRank = parseInt(prevRankStr);
      if (prevRank > currentRank && prevRank <= sanitizedLeaderboard.length) {
        setAnimationPreviousRank(prevRank);
        setIsAnimatingRank(true);

        const listCopy = [...sanitizedLeaderboard];
        const curIdx = listCopy.findIndex(l => l.uid === user.uid);
        if (curIdx !== -1) {
          const userEntry = listCopy[curIdx];
          listCopy.splice(curIdx, 1);
          listCopy.splice(prevRank - 1, 0, userEntry);
          setDisplayList(listCopy);

          // Scroll immediately to the starting (lower) position
          scrollToUser(true);

          // Step 1: Wait 1400ms so they see their starting position before the climb starts
          addTimer(() => {
            setClimbPhase('anticipation');
            vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT || [30, 50, 10]);
            
            // Step 2: Wait 550ms of squash preparation, then shoot up!
            addTimer(() => {
              setClimbPhase('shooting');
              setDisplayList(sanitizedLeaderboard); // Update list order to trigger layout transition!
              vibrate([20, 30, 20, 30, 20]); // Speed-dash rapid haptic vibrations
              
              if (settings?.soundEnabled !== false) {
                play('header_switch'); // Whoosh sound!
              }
              
              // Smooth scroll to follow the climb to the new final position
              addTimer(() => {
                scrollToUser(false);
              }, 120);
              
              // Step 3: Wait 850ms during the climb, then impact!
              addTimer(() => {
                setClimbPhase('impact');
                setShowCelebrationSpot(true);
                vibrate(VIBRATION_PATTERNS.HEAVY || 40); // Thump/impact vibration!
                
                if (settings?.soundEnabled !== false) {
                  play('chest_land'); // Slam/impact sound!
                }
                
                // Step 4: Wait 400ms squash rebound, then celebrate!
                addTimer(() => {
                  setClimbPhase('celebrate');
                  setIsAnimatingRank(false);
                  localStorage.removeItem("nexora_previous_rank");
                  localStorage.removeItem("nexora_scrolling_to_user_rank"); // Clean up both
                  vibrate(VIBRATION_PATTERNS.TROPHY || [40, 60, 40, 60, 40]);
                  
                  if (settings?.soundEnabled !== false) {
                    play('trophy1'); // Beautiful reward chime!
                  }
                  
                  // Step 5: Settle back to normal idle
                  addTimer(() => {
                    setClimbPhase('idle');
                    setShowCelebrationSpot(false);
                  }, 1800);
                }, 400);
              }, 850);
            }, 550);
          }, 1400);
        }
      } else {
        localStorage.removeItem("nexora_previous_rank");
        setDisplayList(sanitizedLeaderboard);
      }
    } else if (wasGlowActive) {
      // User clicked the glowing tab. Smoothly scroll to user position, wait, then trigger a gorgeous highlight bounce!
      localStorage.removeItem("nexora_scrolling_to_user_rank");
      setDisplayList(sanitizedLeaderboard);
      
      // First, scroll to user smoothly
      scrollToUser(false);
      
      // Step 1: Wait 1400ms for smooth scroll to finish and user to fully focus on their row
      addTimer(() => {
        setClimbPhase('anticipation');
        vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT || [30, 50, 10]);
        
        // Step 2: Wait 550ms, then jump up (bounce stretch)!
        addTimer(() => {
          setClimbPhase('shooting');
          vibrate([25, 45, 25]); // Playful bounce vibrations
          if (settings?.soundEnabled !== false) {
            play('header_switch'); // Whoosh sound
          }
          
          // Step 3: Wait 650ms in the air, then slam back down!
          addTimer(() => {
            setClimbPhase('impact');
            setShowCelebrationSpot(true);
            vibrate(VIBRATION_PATTERNS.HEAVY || 40); // Impact vibration
            if (settings?.soundEnabled !== false) {
              play('chest_land'); // Slam sound
            }
            
            // Step 4: Wait 400ms, then celebrate!
            addTimer(() => {
              setClimbPhase('celebrate');
              vibrate(VIBRATION_PATTERNS.SUCCESS || [20, 50, 20]); // Happy victory vibration
              if (settings?.soundEnabled !== false) {
                play('continue'); // Light success chime
              }
              
              // Step 5: Wait 1800ms, then settle back to normal idle
              addTimer(() => {
                setClimbPhase('idle');
                setShowCelebrationSpot(false);
              }, 1800);
            }, 400);
          }, 650);
        }, 550);
      }, 1400);
    }

    return () => {
      activeTimers.forEach(id => clearTimeout(id));
    };
  }, [leaderboard, user, currentRank, settings.soundEnabled, play]);

  const currentLeague = settings.league || 'Bronze';
  const leagueIndex = LEAGUES.indexOf(currentLeague);

  const startOfWeek = useMemo(() => {
    return getStartOfWeekKey();
  }, []);

  const hasClaimedThisWeek = useMemo(() => {
    if (!userRank || userRank > 6 || userRank < 1) return true;
    const rankKey = `week_${startOfWeek}_rank_${userRank}`;
    return Boolean(stats.claimedRankRewards?.[rankKey]);
  }, [userRank, startOfWeek, stats.claimedRankRewards]);

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
      className="flex flex-col w-full pb-32"
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
        
        <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-1">
          {LEAGUES.map((l, i) => {
            const isActive = l === currentLeague;
            const isCompleted = i < leagueIndex;
            return (
              <div key={l} className="flex flex-col items-center gap-2 relative">
                <div className="relative">
                  <LeagueIcon league={l} active={isActive || isCompleted} className="w-13 h-13 transition-transform duration-300 hover:scale-110" />
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
                <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-blue-900 font-extrabold' : 'text-slate-400'}`}>
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
        <div className="bg-slate-50 border-2 border-slate-100 text-slate-800 rounded-[2rem] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrophyIcon size={120} className="text-yellow-600 rotate-12" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                Weekly Prize Chest
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-black uppercase">
                Reset Weekly
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
                {isSyncingRankings ? (
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                ) : !isOnline ? (
                  "🤖"
                ) : userRank === 1 ? (
                  "🏆"
                ) : userRank === 2 ? (
                  "🥇"
                ) : userRank === 3 ? (
                  "🥈"
                ) : userRank >= 4 && userRank <= 6 ? (
                  "🥉"
                ) : (
                  "🎗️"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black uppercase tracking-tight truncate text-slate-800">
                  {isSyncingRankings
                    ? "Syncing Live Arena..."
                    : !isOnline
                    ? "Offline Arena - AI Rivals"
                    : userRank > 0 && userRank <= 6
                    ? `Congratulations, Champion!`
                    : userRank > 6
                    ? `Progress Recognition`
                    : `Unranked`}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  {isSyncingRankings
                    ? "Connecting to live server combatants and verifying your official ranking..."
                    : !isOnline
                    ? "You are currently offline. Showing AI sparring rivals. Reconnect to the internet to enter the global standings and claim weekly rewards."
                    : userRank === 1
                    ? `You are Rank #1! You've earned the ultimate weekly championship: 400 Coins, Golden Trophy, and +150 XP Bonus! 🔥`
                    : userRank > 1 && userRank <= 6
                    ? `You are Rank #${userRank} this week and earned +${getRankRewardCoins(userRank)} Coins reward!`
                    : userRank > 6
                    ? `You are Rank #${userRank}. Excellent effort! Keep pushing to reach the Top 6 for coin rewards.`
                    : `Complete your active habits to climb the ranks and unlock weekly chest rewards!`}
                </p>
                {!isOnline && !hasClaimedThisWeek && (
                  <p className="text-[10px] text-rose-500 font-extrabold flex items-center gap-1 mt-1.5 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-lg">
                    <WifiOff size={12} /> Internet connection required to claim Rank section rewards.
                  </p>
                )}
              </div>
            </div>

            {/* Reward Claim Parameters */}
            {isSyncingRankings ? (
              <div className="pt-2 border-t border-slate-150 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Calculated Reward</p>
                  <p className="text-sm font-black text-slate-500 flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-blue-500" />
                    <span>Verifying Live Position...</span>
                  </p>
                </div>
                <button
                  disabled
                  className="bg-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-not-allowed opacity-80"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span>Syncing Arena...</span>
                </button>
              </div>
            ) : !isOnline ? (
              <div className="pt-2 border-t border-slate-150 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Offline Status</p>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-wider">AI Rival Standings</p>
                </div>
                <button
                  disabled
                  className="bg-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-not-allowed opacity-80"
                >
                  <WifiOff size={14} />
                  <span>Online Required</span>
                </button>
              </div>
            ) : userRank > 0 && userRank <= 6 ? (
              <div className="pt-2 border-t border-slate-150 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Calculated Reward</p>
                  <p className="text-sm font-black text-amber-600 flex flex-col leading-tight">
                    <span>🪙 +{getRankRewardCoins(userRank)} Coins</span>
                    {userRank === 1 && <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">+150 XP & Golden Trophy</span>}
                  </p>
                </div>
                {hasClaimedThisWeek ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-sm">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Claimed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const coins = getRankRewardCoins(userRank);
                      onClaimRankReward(userRank, coins);
                    }}
                    className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-950 font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg ring-2 ring-yellow-400/30 border border-yellow-200/50 transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    Claim Rewards
                  </button>
                )}
              </div>
            ) : userRank > 6 ? (
              <div className="pt-2 border-t border-slate-150 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status Award</p>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Top 6 Required for Coin Rewards</p>
                </div>
                <div className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-xl text-slate-500 font-bold uppercase tracking-wider border border-slate-150">
                  No Coin Reward
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-150 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Unranked</p>
                </div>
                <div className="text-[10px] bg-blue-50 px-3 py-1.5 rounded-xl text-blue-700 font-bold uppercase tracking-wider border border-blue-100">
                  Earn XP to Enter
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. The Leaderboard List Stream - Clean continuous layout with separators */}
      <div className="flex-1 px-6 py-3">
        {isSyncingRankings && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-blue-950 uppercase tracking-tight">Syncing Arena Rankings</p>
              <p className="text-[10px] text-blue-600 font-medium">Connecting to live combatants from the server...</p>
            </div>
          </div>
        )}
        {!isOnline && (
          <div className="mb-3 p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-3">
            <WifiOff size={16} className="text-slate-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Offline Mode: AI Rivals Only</p>
              <p className="text-[10px] text-slate-500 font-medium">Connect to the internet to view real competitors and live ranks.</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between py-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Award size={14} className="text-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Arena Rankings</span>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase">{displayList.length} Combatants</span>
        </div>

        {displayList.length === 0 ? (
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
            {displayList.map((entry, index) => {
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
                rowBg = "bg-blue-50/70 border border-blue-100/50 rounded-2xl my-1 relative";
                textColor = "text-blue-950 font-black";
                subTextColor = "text-blue-600";
                pointsTextStyle = "text-blue-600 font-black";

                if (climbPhase !== 'idle') {
                  rowBg = "bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-amber-300 rounded-2xl my-1 relative z-30 shadow-[0_10px_25px_rgba(245,158,11,0.2)]";
                  textColor = "text-amber-950 font-black";
                  subTextColor = "text-amber-700";
                  pointsTextStyle = "text-amber-600 font-black";
                } else if (showCelebrationSpot) {
                  rowBg = "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-2xl my-1 relative shadow-[0_0_20px_rgba(250,204,21,0.35)]";
                  textColor = "text-yellow-950 font-black animate-pulse";
                  subTextColor = "text-yellow-700";
                  pointsTextStyle = "text-yellow-600 font-black";
                }
              }

              const itemAnimate = isCurrentUser 
                ? { opacity: 1, ...cardAnimProps } 
                : { opacity: 1, y: 0 };

              const itemTransition = (isCurrentUser && climbPhase !== 'idle'
                ? {
                    layout: {
                      type: "spring",
                      stiffness: climbPhase === 'shooting' ? 120 : 85,
                      damping: climbPhase === 'shooting' ? 10 : 14,
                      mass: 1.15
                    },
                    scaleX: { type: "spring", stiffness: 220, damping: 15 },
                    scaleY: { type: "spring", stiffness: 220, damping: 15 },
                    y: { type: "spring", stiffness: 220, damping: 15 },
                    boxShadow: { duration: 0.2 },
                    borderColor: { duration: 0.2 },
                    opacity: { duration: 0.2 }
                  }
                : {
                    layout: {
                      type: "spring",
                      stiffness: 85,
                      damping: 14,
                      mass: 1.15
                    },
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 }
                  }) as any;

              return (
                <React.Fragment key={entry.uid ? `${entry.uid}-${index}` : index}>
                  <motion.div
                    layout
                    id={isCurrentUser ? "leaderboard-user-row" : undefined}
                    initial={{ opacity: 0, y: 10 }}
                    animate={itemAnimate}
                    transition={itemTransition}
                    className={`flex items-center gap-4 py-3.5 px-3 transition-all relative overflow-hidden ${rowBg}`}
                  >
                    {/* Celebration Sparkles Overlay */}
                    {isCurrentUser && showCelebrationSpot && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-around z-20">
                        <Sparkles size={16} className="text-yellow-500 animate-bounce absolute left-4" />
                        <Sparkles size={14} className="text-yellow-400 animate-pulse absolute right-12" />
                        <Star size={12} className="text-amber-400 fill-amber-400 animate-spin absolute right-4" />
                      </div>
                    )}

                    {/* Speed Lines/Dashes Overlay for Duolingo-style climb */}
                    {isCurrentUser && climbPhase === 'shooting' && (
                      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                        {[...Array(5)].map((_, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ y: -60, opacity: 0 }}
                            animate={{ y: 160, opacity: [0, 0.75, 0] }}
                            transition={{
                              duration: 0.45,
                              repeat: Infinity,
                              delay: idx * 0.08,
                              ease: "linear"
                            }}
                            className="absolute w-[2px] h-10 bg-gradient-to-b from-yellow-300 via-amber-400 to-transparent"
                            style={{
                              left: `${15 + idx * 18}%`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Rank Position */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs relative z-10">
                      {rankBadge}
                    </div>

                    {/* Profile Picture / Avatar */}
                    <div className="relative z-10">
                      {entry.photoURL ? (
                        <img 
                          src={entry.photoURL} 
                          alt={entry.displayName} 
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/35 shadow-sm flex-shrink-0" 
                          referrerPolicy="no-referrer" 
                          decoding="async"
                          loading="eager" 
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-tr from-slate-100 to-slate-250 text-slate-500 ring-2 ring-white/35 shadow-sm">
                          👤
                        </div>
                      )}
                      {isTop3 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 shadow border border-white">
                          <Star size={7} className="text-yellow-950 fill-yellow-950" />
                        </div>
                      )}
                    </div>

                    {/* Name and Level Details */}
                    <div className="flex-1 min-w-0 relative z-10">
                      <h4 className={`font-black text-sm uppercase tracking-wide truncate flex items-center gap-1.5 ${textColor}`}>
                        <span>{entry.displayName || "Anonymous Champion"}</span>
                        {isCurrentUser && <span className="font-bold text-[8px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">You</span>}
                        {(entry.hasUltimateBadge || entry.purchasedItems?.includes("badge-ultimate") || (isCurrentUser && (settings?.hasUltimateBadge || settings?.purchasedItems?.includes("badge-ultimate")))) && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-sm border border-amber-300 animate-pulse" title="Ultimate Mythic Emblem">
                            ⚜️ Mythic
                          </span>
                        )}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-150">
                          Lvl {entry.level || 1}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-black tracking-tight">
                          <Flame size={11} className={isCurrentUser ? "text-orange-500" : "text-slate-400 opacity-60"} />
                          <span className={isCurrentUser ? subTextColor : "text-slate-400 font-medium opacity-70"}>
                            {isCurrentUser ? `${entry.streak || 0} Day Streak` : "Streak Hidden"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Points Counter */}
                    <div className="text-right pl-2 flex-shrink-0 relative z-10">
                      <div className={`text-base ${pointsTextStyle}`}>
                        {entry.weeklyPoints !== undefined ? entry.weeklyPoints : ((entry as any).weeklyXP || 0)}
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        XP
                      </div>
                    </div>
                  </motion.div>

                  {/* Duolingo promotion dashed zone line */}
                  {rank === 3 && displayList.length > 3 && (
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
