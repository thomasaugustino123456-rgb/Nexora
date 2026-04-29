import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { 
  AlertCircle, Star, Bell, Flame, Trophy as TrophyIcon, 
  Plus, Trash2, Clock, Target, ChevronRight, Sprout, LogOut, Save, CheckCircle2
} from 'lucide-react';
import { 
  UserStats, UserSettings, DailyProgress, MascotMood, ChallengeStep, CustomPlan 
} from '../types';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { Mascot } from './Mascot';
import { GoldenTrophy, IceTrophy, BrokenTrophy } from './Trophies';
import { MascotAIWrapper } from './SuspenseWrappers';

function CountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{timeLeft}</span>;
}

export function HomeScreen({ stats, onStartChallenge, isCompletedToday, dailyProgress, settings, history, onOpenGallery, dailyQuest, isPro, emergencyActive, customPlans = [], onStartCustomPlan, onDeleteCustomPlan, onOpenPlanBuilder, onOpenPlant, fcmToken, setupFCM, fcmError, showToast }: { 
  stats: UserStats, 
  onStartChallenge: () => void, 
  isCompletedToday: boolean,
  dailyProgress: DailyProgress,
  settings: UserSettings,
  history: DailyProgress[],
  onOpenGallery: () => void,
  dailyQuest: ChallengeStep | null,
  isPro: boolean,
  emergencyActive: boolean,
  customPlans?: CustomPlan[],
  onStartCustomPlan: (plan: CustomPlan) => void,
  onDeleteCustomPlan: (id: string) => void,
  onOpenPlanBuilder: () => void,
  onOpenPlant: () => void,
  fcmToken: string | null,
  setupFCM: () => void,
  fcmError: string | null,
  showToast?: (m: string, t: any) => void
}) {
  const trophies = stats.trophies || [];
  const latestTrophy = trophies[0];
  const quotes = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it."
  ];
  const quote = quotes[new Date().getDay() % quotes.length];

  // Mascot Interaction State
  const [tapCount, setTapCount] = useState(0);
  const mascotControls = useAnimationControls();

  // Calming down state
  const [lastY, setLastY] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);

  // Determine Mascot Mood
  let mascotMood: MascotMood = 'neutral';
  if (tapCount >= 6) {
    mascotMood = 'boiling';
  } else if (tapCount >= 5) {
    mascotMood = 'angry';
  } else if (tapCount > 0) {
    mascotMood = 'happy';
  }

  const triggerJump = async () => {
    await mascotControls.start({ y: -20, transition: { type: "spring", stiffness: 400, damping: 10 } });
    await mascotControls.start({ y: 0, transition: { type: "spring", stiffness: 400, damping: 10 } });
  };

  const handleMascotTap = () => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    setTapCount(prev => prev + 1);
    if (tapCount < 5) {
      triggerJump();
    }
  };

  const handleMascotPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (tapCount >= 5) {
      if (lastY !== null) {
        const deltaY = Math.abs(e.clientY - lastY);
        if (deltaY > 15) { // significant vertical movement
          setMoveCount(prev => {
            const newCount = prev + 1;
            if (newCount > 8) {
              setTapCount(0); // calm down
              setLastY(null);
              return 0;
            }
            return newCount;
          });
          setLastY(e.clientY);
        }
      } else {
        setLastY(e.clientY);
      }
    }
  };

  const handleMascotPointerLeave = () => {
    setLastY(null);
    setMoveCount(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center pt-4 gap-12 w-full max-w-4xl mx-auto"
    >
      <AnimatePresence>
        {emergencyActive && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.9 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.9 }}
            className="w-full max-w-md mx-auto overflow-hidden"
          >
            <div className="bg-red-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-2xl shadow-red-200 border-2 border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
              <div className="p-3 bg-white/20 rounded-2xl relative z-10">
                <AlertCircle size={28} className="animate-bounce" />
              </div>
              <div className="flex-1 relative z-10">
                <h4 className="font-black text-lg uppercase tracking-tight leading-none mb-1">Emergency! 🚨</h4>
                <p className="text-[10px] font-bold opacity-90 leading-tight">Your trophy is degrading! Finish a challenge now to get a Golden Trophy and stop the alarm!</p>
              </div>
              <button 
                onClick={onStartChallenge}
                className="px-5 py-3 bg-white text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-lg shadow-red-900/20 relative z-10"
              >
                Fix Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MascotAIWrapper stats={stats} settings={settings} showToast={showToast} />
      
      {/* Daily Quest Card */}
      {dailyQuest && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-2 border-yellow-400/30 bg-yellow-400/5 mb-8 w-full max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-200">
                <Star size={20} />
              </div>
              <div>
                <h3 className="font-black text-blue-900 leading-tight">Daily Quest</h3>
                <p className="text-[10px] text-blue-900/40 font-bold uppercase tracking-widest">Double Points! 🔥</p>
              </div>
            </div>
            {dailyProgress.dailyQuestDone && (
              <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Completed
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900/60">Complete the <span className="text-blue-900 uppercase">{dailyQuest}</span> challenge today!</p>
            {!dailyProgress.dailyQuestDone && (
              <button 
                onClick={onStartChallenge}
                className="bg-yellow-400 text-white px-4 py-2 rounded-xl font-black text-xs shadow-lg shadow-yellow-200 active:scale-95 transition-transform"
              >
                GO!
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Push Notification Onboarding Card */}
      {!fcmToken && !fcmError && Notification.permission !== 'denied' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl flex items-center gap-4 shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Bell size={24} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-sm uppercase tracking-tight">Never miss a streak! 🔔</h4>
              <p className="text-[10px] font-bold opacity-80 leading-tight">Enable notifications to get reminders and plant alerts even when the app is closed, bro!</p>
            </div>
            <button 
              onClick={setupFCM}
              className="px-4 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-50 active:scale-95 transition-all"
            >
              Enable
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 w-full">
        <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full" />
          <motion.div animate={mascotControls} className="w-56 h-56 lg:w-72 lg:h-72 relative z-10">
            <Mascot 
              className="w-full h-full drop-shadow-2xl" 
              mood={mascotMood}
              hat={settings.activeSkin}
              soundPack={settings.isDogSoundPackActive ? 'dog' : 'cat'}
              onClick={handleMascotTap}
              onPointerMove={handleMascotPointerMove}
              onPointerLeave={handleMascotPointerLeave}
            />
          </motion.div>
        </div>

        <div className="flex flex-col gap-6 w-full max-w-md">
          <div className="glass-card w-full p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-blue-900/80">Hey 👋</h2>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-blue-900/70">Ready for today?</h3>
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    onOpenPlant();
                  }}
                  className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 active:scale-90 transition-all flex items-center justify-center group"
                >
                  <Sprout size={24} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <Flame size={18} className="text-orange-500" />
                  <span>Streak: {stats.streak} (Best: {stats.bestStreak || stats.streak})</span>
                </div>
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <Star size={18} className="text-yellow-500" />
                  <span>{stats.xp || 0} XP</span>
                </div>
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black text-yellow-700 shadow-sm border border-yellow-600">
                    $
                  </div>
                  <span>{stats.coins || 0} coins</span>
                </div>
                <div className="flex items-center gap-2 text-blue-900/50 font-medium">
                  <TrophyIcon size={18} className="text-emerald-500" />
                  <span>{dailyProgress.completionsCount}/{isPro ? (settings.challengeCountGoal || 999) : 3} Today</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 flex flex-col items-center gap-2 border-2 border-orange-100 bg-orange-50/30">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Flame size={20} />
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Streak</div>
                  <div className="text-xl font-black text-blue-900">{stats.streak}</div>
                  <div className="text-[8px] font-bold text-blue-900/40">+5 XP per day</div>
                </div>
              </div>
              <div className="glass-card p-4 flex flex-col items-center gap-2 border-2 border-yellow-100 bg-yellow-50/30">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-200">
                  <div className="font-black text-lg">$</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Coins</div>
                  <div className="text-xl font-black text-blue-900">{stats.coins || 0}</div>
                  <div className="text-[8px] font-bold text-blue-900/40">Earned: {stats.xp || 0} XP</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3)) return;
                vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                onStartChallenge();
              }}
              disabled={dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3)}
              className={`btn-primary w-full flex items-center justify-center gap-2 ${dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              {dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3)
                ? `Daily Limit Reached (${dailyProgress.completionsCount}/${isPro ? (settings.challengeCountGoal || 10) : 3}) 🏆` 
                : dailyProgress.completionsCount > 0 
                  ? `Start Challenge #${dailyProgress.completionsCount + 1} ✍️` 
                  : 'Start Today\'s Challenge ✍️'}
            </button>

            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                onOpenPlant();
              }}
              className="w-full flex items-center justify-between p-4 glass-card bg-emerald-50/30 border-2 border-emerald-100/50 hover:bg-emerald-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                  <Sprout size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-blue-900 leading-none">Your Plant</h4>
                  <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest mt-1">
                    {settings.plantState?.isDead ? "🥀 Restoration Required" : settings.plantState?.isThirsty ? "💧 Needs Water" : `🌿 Stage ${settings.plantState?.stage || 0} Growth`}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {dailyProgress.completionsCount >= (isPro ? (settings.challengeCountGoal || 10) : 3) && (
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Resets in</p>
                <div className="flex items-center justify-center gap-2 text-blue-900 font-black">
                  <Clock size={14} className="text-blue-500" />
                  <CountdownToMidnight />
                </div>
              </div>
            )}
          </div>

          {/* Custom Plans Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-blue-900/40 uppercase tracking-widest">Your Custom Plans</h3>
              <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-tighter">Unlimited</div>
                <button 
                  onClick={onOpenPlanBuilder}
                  className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Create New
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {customPlans.length === 0 ? (
                <div className="p-6 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                    <Target size={24} />
                  </div>
                  <p className="text-xs font-bold text-blue-900/30">No custom plans yet, bro. Create one to level up your routine!</p>
                </div>
              ) : (
                customPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${plan.color} text-white flex items-center justify-center shadow-lg shadow-blue-100`}>
                      <Target size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-blue-900">{plan?.name || "Unnamed Plan"}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">
                          {plan.challenges.length} Challenges • {plan.days.length} Days
                        </p>
                        {plan.reminderTime && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600">
                            <Clock size={8} />
                            <span className="text-[8px] font-black">{plan.reminderTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onDeleteCustomPlan(plan.id)}
                        className="p-2 text-red-500/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => onStartCustomPlan(plan)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xs shadow-lg shadow-blue-200 active:scale-95 transition-all"
                      >
                        START
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {latestTrophy && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card w-full p-6 flex items-center gap-6 border-2 border-emerald-100/50"
            >
              <div className="w-20 h-20 flex-shrink-0">
                {latestTrophy.type === 'golden' && <GoldenTrophy />}
                {latestTrophy.type === 'ice' && <IceTrophy />}
                {latestTrophy.type === 'broken' && <BrokenTrophy />}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Latest Trophy</div>
                <h4 className="font-bold text-blue-900 leading-tight">
                  {latestTrophy.type === 'golden' ? 'Golden Glory!' : latestTrophy.type === 'ice' ? 'Frozen Solid' : 'Shattered Dreams'}
                </h4>
                <p className="text-[10px] text-blue-900/40 mt-1">
                  {latestTrophy.type === 'golden' ? 'Keep it up to stay golden!' : 
                   latestTrophy.type === 'ice' ? 'Freezing! Complete a flow to restore!' : 
                   'Broken! Start a new flow to get a new one!'}
                </p>
              </div>
            </motion.div>
          )}

          <div className="glass-card w-full p-6">
            <h4 className="text-sm font-bold text-blue-900/40 uppercase tracking-widest mb-4">Today's Flow:</h4>
            <div className="flex items-center justify-between px-2">
              <div className={`text-3xl transition-all ${dailyProgress.pushupsDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>💪</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.waterDrank >= settings.waterGoal ? 'grayscale-0' : 'grayscale opacity-40'}`}>💧</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.breathingDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>🧘</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.drawingDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>🎨</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.footballDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>⚽</div>
              <div className="text-blue-900/20 text-xl">•</div>
              <div className={`text-3xl transition-all ${dailyProgress.bubblesDone ? 'grayscale-0' : 'grayscale opacity-40'}`}>🫧</div>
            </div>
          </div>
        </div>
      </div>

      {settings.showQuotes && (
        <div className="w-full space-y-8">
          <div className="text-center max-w-2xl mx-auto px-6">
            <p className="text-lg font-serif italic text-blue-900/60">"{quote}"</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
