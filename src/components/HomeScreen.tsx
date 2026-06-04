import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';
import { 
  AlertCircle, Star, Bell, Flame, Trophy as TrophyIcon, 
  Plus, Trash2, Clock, Target, ChevronRight, Sprout, LogOut, Save, CheckCircle2,
  Infinity, Zap, Crown, Coins, Brain, Sparkles, BookOpen, Flower2
} from 'lucide-react';
import { 
  UserStats, UserSettings, DailyProgress, MascotMood, ChallengeStep, CustomPlan 
} from '../types';
import { GardenState } from '../types/garden';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { Mascot } from './Mascot';
import { GoldenTrophy, IceTrophy, BrokenTrophy } from './Trophies';
import { MascotAIWrapper } from './SuspenseWrappers';
import { formatDistanceToNow } from 'date-fns';

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

function NextRestorationCountdown({ targetTime }: { targetTime: number | null }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetTime) return;
    const updateTime = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setTimeLeft('Restoring...');
        return;
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return <span>{timeLeft}</span>;
}

export interface HomeScreenProps {
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
  onOpenArchives: () => void,
  fcmToken: string | null,
  setupFCM: () => void,
  fcmError: string | null,
  showToast?: (m: string, t: any) => void,
  onArchiveChallenge?: (id: string) => void,
  onSelectTask: (taskId: string) => void,
  onOpenGarden: () => void,
  gardenState?: GardenState
}

export const HomeScreen = React.memo(({ stats, onStartChallenge, isCompletedToday, dailyProgress, settings, history, onOpenGallery, dailyQuest, isPro, emergencyActive, customPlans = [], onStartCustomPlan, onDeleteCustomPlan, onOpenPlanBuilder, onOpenPlant, onOpenArchives, fcmToken, setupFCM, fcmError, showToast, onArchiveChallenge, onSelectTask, onOpenGarden, gardenState }: HomeScreenProps) => {

  const trophies = stats.trophies || [];
  const latestTrophy = trophies[0];
  const layoutConfig = settings.layoutConfig || {};
  const sectionOrder = layoutConfig.sectionOrder || ['stats', 'protocol', 'quests', 'plans', 'mascot'];

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

  const renderSection = (id: string) => {
    switch (id) {
      case 'stats':
        if (layoutConfig.hideStats) return null;
        return (
          <div key="stats" className="glass-card p-4 flex flex-col gap-4 border-white/50 shadow-blue-900/5 transition-colors">
            {/* Stats Overview */}
            <div className="flex flex-wrap items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-6 px-2">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-blue-900/30 uppercase tracking-[0.2em] mb-1">Discipline Streak</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Flame size={20} />
                    </div>
                    <span className="text-2xl font-black text-blue-900 tracking-tight">{stats.streak}</span>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-blue-900/10" />

                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-blue-900/30 uppercase tracking-[0.2em] mb-1">Growth XP</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Star size={20} />
                    </div>
                    <span className="text-2xl font-black text-blue-900 tracking-tight">{stats.xp || 0}</span>
                  </div>
                </div>

                <div className="h-10 w-px bg-blue-900/10" />

                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-blue-900/30 uppercase tracking-[0.2em] mb-1">Earned Coins</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Coins size={20} />
                    </div>
                    <span className="text-2xl font-black text-blue-900 tracking-tight">{stats.coins || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={onOpenGarden}
                  className="p-3 bg-gradient-to-br from-[#8D7D62] to-[#5A5040] text-white rounded-2xl shadow-xl shadow-[#8D7D62]/20 hover:scale-105 transition-all group relative overflow-hidden"
                  title="My Garden"
                >
                  <Flower2 size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
    
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    onOpenArchives();
                  }}
                  className="p-3 bg-gradient-to-br from-[#69C496] to-[#58B383] text-white rounded-2xl shadow-xl shadow-[#69C496]/20 hover:scale-105 transition-all group relative overflow-hidden"
                  title="Retention Academy"
                >
                  <BookOpen size={20} className="group-hover:rotate-12 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                <button 
                  onClick={onOpenPlant}
                  className={`p-3 rounded-2xl transition-all flex items-center justify-center group relative ${
                    !settings.plantOnboardingCompleted
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse border-2 border-white/50'
                      : gardenState?.pendingLootSeed
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-[0_0_35px_rgba(245,158,11,1.0)] border-3 border-yellow-200 animate-[bounce_1.5s_infinite] scale-110 z-10'
                        : settings.plantState?.isThirsty || localStorage.getItem('nexora_new_plant_unlocked') === 'true'
                          ? 'bg-yellow-400 text-white shadow-xl shadow-yellow-200 animate-pulse' 
                          : 'bg-emerald-500 text-white shadow-xl shadow-emerald-200'
                  }`}
                >
                  <Sprout size={20} className="group-hover:rotate-12 transition-transform" />
                  {gardenState?.pendingLootSeed && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles size={14} className="text-amber-200 animate-spin" />
                    </div>
                  )}
                  {!settings.plantOnboardingCompleted && !gardenState?.pendingLootSeed && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles size={14} className="text-amber-200 animate-spin" />
                    </div>
                  )}
                  {settings.plantState?.isThirsty && settings.plantOnboardingCompleted && !gardenState?.pendingLootSeed && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-bounce" />
                  )}
                </button>
              </div>
            </div>

            {/* Cozy Garden Promotional Card */}
            {!settings.hasEnteredGarden && (
              <div className="w-full bg-gradient-to-br from-[#1E251C] via-[#2F3A2A] to-[#1E251C] border border-[#8D7D62]/30 p-5 rounded-3xl text-white relative overflow-hidden shadow-lg group">
                <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-[0.08] text-6xl select-none pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🌸</div>
                <div className="flex items-center justify-between gap-5 flex-wrap relative z-10">
                  <div className="flex-1">
                    <span className="text-[8px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={10} className="text-amber-300 animate-pulse" /> BOTANICAL SANCTUARY
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-tight mt-0.5 text-stone-100">Cozy Sanctuary Garden & Seed Draw</h4>
                    <p className="text-[10px] text-[#DBCBB1] font-bold uppercase mt-1.5 leading-relaxed max-w-lg">
                      Sow harvested plant seeds into your 3x3 soil grid! Spend 100 surplus coins to guess/draw celestial pods for rare, epic & legendary botanical seeds.
                    </p>
                  </div>
                  <button
                    onClick={onOpenGarden}
                    className="w-full sm:w-auto px-5 py-3 bg-[#8D7D62] hover:bg-[#9E8B6E] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all text-center"
                  >
                    Enter Garden 🔮
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'protocol':
        if (layoutConfig.hideFlow) return null;
        return (
          <div key="protocol" className="glass-card p-8 border-2 border-blue-600/5 bg-gradient-to-br from-white/80 to-blue-50/20 shadow-2xl shadow-blue-900/10 relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Target size={120} />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-blue-900 leading-none mb-2">DAILY PROTOCOL</h3>
                  <p className="text-blue-900/40 text-[10px] font-black uppercase tracking-[0.2em]">Resets in <CountdownToMidnight /></p>
                </div>
                <div className="text-right">
                  <div className="text-blue-900 font-black text-lg">
                    {isPro ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Infinity size={20} />
                        UNLIMITED
                      </span>
                    ) : (
                      `${dailyProgress.completionsCount} / 3`
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-blue-900/30 uppercase tracking-widest">
                    {isPro ? 'Pro Status Active' : 'Daily Limit Status'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (!isPro && dailyProgress.completionsCount >= 3) return;
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  onStartChallenge();
                }}
                disabled={!isPro && dailyProgress.completionsCount >= 3}
                className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 relative group overflow-hidden"
              >
                <Zap size={24} className="group-hover:scale-125 transition-transform" />
                {!isPro && dailyProgress.completionsCount >= 3 
                  ? 'PROTOCOL COMPLETE 🏆' 
                  : dailyProgress.completionsCount > 0 
                    ? `NEXT CHALLENGE (#${dailyProgress.completionsCount + 1})` 
                    : 'START INITIAL CHALLENGE'}
              </button>

              {!isPro && dailyProgress.completionsCount >= 3 && (
                <div className="flex items-center justify-center gap-4 p-4 bg-white/40 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-xs font-black text-blue-900/60 uppercase">Next Recovery:</span>
                  </div>
                  <div className="text-sm font-black text-blue-600">
                    <NextRestorationCountdown targetTime={(dailyProgress as any).nextRestorationTime} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 py-2">
                {[
                  { id: "pushups", done: dailyProgress.pushupsDone, icon: "💪" },
                  { id: "water", done: dailyProgress.waterDrank >= settings.waterGoal, icon: "💧" },
                  { id: "breathing", done: dailyProgress.breathingDone, icon: "🧘" },
                  { id: "drawing", done: dailyProgress.drawingDone, icon: "🎨" },
                  { id: "football", done: dailyProgress.footballDone, icon: "⚽" },
                  { id: "bubbles", done: dailyProgress.bubblesDone, icon: "🫧" },
                  { id: "memory", done: dailyProgress.memoryDone, icon: "🧠" },
                  { id: "gratitude", done: dailyProgress.gratitudeDone, icon: "🙏" },
                  { id: "reaction", done: dailyProgress.reactionDone, icon: "⚡" }
                ].filter(task => !(settings.archivedOfficialChallenges || []).includes(task.id)).map((task, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-500 scale-90 ${
                      task.done ? 'bg-blue-600/10 grayscale-0 opacity-100 scale-100' : 'bg-slate-100 grayscale opacity-30 shadow-inner'
                    }`}
                  >
                    {task.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'quests':
        if (layoutConfig.hideQuests || !dailyQuest) return null;
        return (
          <motion.div 
            key="quests"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-3xl border-2 flex items-center justify-between gap-4 transition-colors ${
              dailyProgress.dailyQuestDone 
                ? 'bg-emerald-50 border-emerald-100' 
                : 'bg-yellow-400/5 border-yellow-400/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                dailyProgress.dailyQuestDone ? 'bg-emerald-500 text-white' : 'bg-yellow-400 text-white'
              }`}>
                <Crown size={20} />
              </div>
              <div>
                <h4 className="font-black text-blue-900 text-sm">{dailyProgress.dailyQuestDone ? "QUEST ACHIEVED" : "LEGENDARY QUEST"}</h4>
                <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest italic">
                  {dailyProgress.dailyQuestDone ? "You crushed the daily goal!" : `Complete "${dailyQuest}" for DOUBLE REWARDS`}
                </p>
              </div>
            </div>
            {!dailyProgress.dailyQuestDone && (
              <button 
                onClick={onStartChallenge}
                className="bg-blue-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
              >
                Target
              </button>
            )}
          </motion.div>
        );

      case 'plans':
        if (layoutConfig.hideCustomPlans) return null;
        return (
          <div key="plans" className="space-y-4 pt-4 transition-colors">
            
            <div className="flex items-center justify-between mt-8">
              <h3 className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em]">Custom Protocol Library</h3>
              <button 
                onClick={onOpenPlanBuilder}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                title="Create New Plan"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {customPlans.length === 0 ? (
                <div className="p-12 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-3 text-center">
                  <Target size={32} className="text-slate-200" />
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No Custom Protocols</p>
                </div>
              ) : (
                customPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    className="glass-card p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all border-white/80"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${plan.color} text-white flex items-center justify-center shadow-lg`}>
                      <Target size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-blue-900">{plan?.name}</h4>
                      <p className="text-[10px] font-bold text-blue-900/30 uppercase tracking-widest">{plan.challenges.length} Steps • {plan.days.length} Days</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onDeleteCustomPlan(plan.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <button onClick={() => onStartCustomPlan(plan)} className="bg-blue-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg active:scale-95 transition-all">
                        RUN
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );

      case 'trophies':
        return null; // Removed from home as per user request (visible in progress)

      case 'mascot':
        if (layoutConfig.hideMascot) return null;
        return (
          <div key="mascot" className="relative w-full aspect-square sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] flex items-center justify-center flex-shrink-0 mx-auto">
            <div className="absolute inset-0 bg-blue-400/5 blur-[40px] rounded-full" />
            <motion.div animate={mascotControls} className="w-[90%] h-[90%] relative z-10">
              <Mascot 
                className="w-full h-full" 
                mood={mascotMood}
                hat={settings.activeHat || 'none'}
                theme={settings.activeSkin || 'standard'}
                soundPack={settings.isDogSoundPackActive ? 'dog' : 'cat'}
                onClick={handleMascotTap}
                onPointerMove={handleMascotPointerMove}
                onPointerLeave={handleMascotPointerLeave}
              />
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center pt-4 gap-8 w-full max-w-7xl mx-auto px-4"
    >
      <AnimatePresence>
        {emergencyActive && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.9 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.9 }}
            className="w-full max-w-4xl mx-auto overflow-hidden"
          >
            <div className="bg-red-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-2xl shadow-red-200 border-2 border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
              <div className="p-3 bg-white/20 rounded-2xl relative z-10">
                <AlertCircle size={24} className="animate-bounce" />
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

      {/* DashboardWidgets removed for cleaner home screen */}

      <MascotAIWrapper stats={stats} settings={settings} showToast={showToast} />
      
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {sectionOrder.map(id => renderSection(id))}
      </div>

      {settings.showQuotes && (
        <div className="w-full py-12">
          <div className="text-center max-w-xl mx-auto px-6">
            <p className="text-sm font-serif italic text-blue-900/40 leading-relaxed">"{quote}"</p>
          </div>
        </div>
      )}
    </motion.div>
  );
});
