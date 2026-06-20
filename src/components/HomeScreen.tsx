import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'motion/react';
import { 
  AlertCircle, Star, Bell, Flame, Trophy as TrophyIcon, 
  Plus, Trash2, Clock, Target, ChevronRight, Sprout, LogOut, Save, CheckCircle2,
  Infinity, Zap, Crown, Coins, Brain, Sparkles, BookOpen, Flower2, Compass, Map
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

  const lastMascotTapRef = useRef<number>(0);
  const mascotTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerMascotDoubleTapReaction = async () => {
    await mascotControls.start({
      scaleY: [1, 0.76, 1.18, 0.94, 1],
      scaleX: [1, 1.22, 0.82, 1.06, 1],
      y: [0, 5, -55, 3, 0],
      rotate: [0, -6, 15, -2, 0],
      transition: { duration: 0.45, ease: "easeInOut" }
    });
  };

  const triggerMascotSimpleTapReaction = async () => {
    await mascotControls.start({
      scale: [1, 1.1, 1],
      y: [0, -10, 0],
      transition: { duration: 0.2 }
    });
  };

  const handleMascotTap = (e: React.MouseEvent<HTMLDivElement>) => {
    triggerMascotSimpleTapReaction();
    const rect = e.currentTarget.getBoundingClientRect();
    window.dispatchEvent(
        new CustomEvent("trigger-mascot-celebration", {
          detail: { source: "home", rect }
        })
    );

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastMascotTapRef.current < DOUBLE_TAP_DELAY) {
      if (mascotTapTimeoutRef.current) {
        clearTimeout(mascotTapTimeoutRef.current);
        mascotTapTimeoutRef.current = null;
      }
      triggerMascotDoubleTapReaction();
    } else {
      lastMascotTapRef.current = now;
      mascotTapTimeoutRef.current = setTimeout(() => {
        vibrate(VIBRATION_PATTERNS.CLICK);
        setTapCount(prev => prev + 1);
        if (tapCount < 5) {
          triggerJump();
        }
        mascotTapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
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
          <div key="stats" className="glass-card p-6 flex flex-col gap-6 border-[#E9E4D4]/50 shadow-[0_8px_30px_rgb(79,63,52,0.04)] rounded-[24px] transition-all">
            {/* Bento Stats Grid */}
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 w-full">
              <div className="grid grid-cols-3 gap-3 md:gap-6 flex-1">
                {/* Streak Metric */}
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex flex-col justify-between p-3.5 rounded-2xl bg-orange-500/[0.04] border border-orange-500/10 shadow-sm select-none cursor-pointer"
                >
                  <span className="text-[9px] font-black text-orange-600/60 uppercase tracking-widest block mb-2">Streak</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                      <Flame size={18} strokeWidth={2.2} />
                    </div>
                    <span className="text-2xl font-black text-[#4F3F34] tracking-tight">{stats.streak}</span>
                  </div>
                </motion.div>
                
                {/* XP Metric */}
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex flex-col justify-between p-3.5 rounded-2xl bg-blue-500/[0.04] border border-blue-500/10 shadow-sm select-none cursor-pointer"
                >
                  <span className="text-[9px] font-black text-[#69C496]/80 uppercase tracking-widest block mb-2">XP</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#69C496] to-[#58B383] flex items-center justify-center text-white shadow-md shadow-[#69C496]/20">
                      <Star size={18} strokeWidth={2.2} />
                    </div>
                    <span className="text-2xl font-black text-[#4F3F34] tracking-tight">{stats.xp || 0}</span>
                  </div>
                </motion.div>

                {/* Coins Metric */}
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex flex-col justify-between p-3.5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/10 shadow-sm select-none cursor-pointer"
                >
                  <span className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest block mb-2">Coins</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                      <Coins size={18} strokeWidth={2.2} />
                    </div>
                    <span className="text-2xl font-black text-[#4F3F34] tracking-tight">{stats.coins || 0}</span>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions Toolbar */}
              <div className="flex items-center justify-start md:justify-end gap-3 px-1">
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    onOpenArchives();
                  }}
                  className="p-3.5 bg-gradient-to-br from-[#69C496] to-[#58B383] text-white rounded-2xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all group relative overflow-hidden flex items-center justify-center border border-emerald-600/30"
                  title="Retention Academy"
                >
                  <BookOpen size={20} className="group-hover:rotate-12 transition-transform" strokeWidth={2} />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                <button 
                  onClick={onOpenPlant}
                  className={`p-3.5 rounded-2xl transition-all flex items-center justify-center group relative border ${
                    !settings.plantOnboardingCompleted
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse border-white/40'
                      : gardenState?.pendingLootSeed
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.6)] border-yellow-200 animate-[bounce_1.5s_infinite] scale-110 z-10'
                        : settings.plantState?.isThirsty || localStorage.getItem('nexora_new_plant_unlocked') === 'true'
                          ? 'bg-yellow-400 text-white border-yellow-500/30 shadow-md shadow-yellow-200 hover:scale-105 active:scale-95 animate-pulse' 
                          : 'bg-emerald-500 text-white border-emerald-600/30 shadow-md hover:scale-105 active:scale-95 shadow-emerald-200/50'
                  }`}
                >
                  <Sprout size={20} className="group-hover:rotate-12 transition-transform" strokeWidth={2} />
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
          </div>
        );

      case 'protocol':
        if (layoutConfig.hideFlow) return null;
        const progressPercent = Math.min(100, Math.floor(((dailyProgress.completionsCount || 0) / 3) * 100));
        
        return (
          <div key="protocol" className="glass-card p-6 border-2 border-[#E9E4D4]/50 bg-gradient-to-br from-white to-[#FAF7F2]/40 shadow-[0_12px_40px_rgba(79,63,52,0.03)] relative overflow-hidden transition-all rounded-[24px]">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none">
              <Target size={140} className="text-[#4F3F34]" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-[#4F3F34] uppercase tracking-wider leading-none mb-1.5 flex items-center gap-2">
                    <Zap size={16} className="text-[#69C496]" strokeWidth={2.5} />
                    DAILY PROTOCOL
                  </h3>
                  <p className="text-[#7D6B58] text-[9px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#69C496] animate-pulse" />
                    Resets in: <CountdownToMidnight />
                  </p>
                </div>
                <div className="text-left sm:text-right flex items-center sm:flex-col justify-between sm:justify-start gap-2">
                  <div className="text-[#4F3F34] font-black text-base flex items-center gap-1">
                    {isPro ? (
                      <span className="flex items-center gap-1 text-[#69C496] bg-[#69C496]/10 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                        <Infinity size={14} strokeWidth={2.5} />
                        UNLIMITED PRO
                      </span>
                    ) : (
                      <span className="bg-[#69C496]/5 border border-[#69C496]/20 px-3 py-1 rounded-full text-xs font-black text-[#69C496] shadow-sm">
                        {dailyProgress.completionsCount} / 3 Challenges Done
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-[#7D6B58]/60 uppercase tracking-wider">
                    {isPro ? 'Pro Status Active' : 'Daily Challenge Limit'}
                  </p>
                </div>
              </div>

              {/* Progress Visualization */}
              {!isPro && (
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    className="bg-gradient-to-r from-[#69C496] to-[#58B383] h-full rounded-full shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              )}

              {/* Main 3D Tactile Action Button */}
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ y: 2 }}
                onClick={() => {
                  if (!isPro && dailyProgress.completionsCount >= 3) return;
                  vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                  onStartChallenge();
                }}
                disabled={!isPro && dailyProgress.completionsCount >= 3}
                className={`w-full text-white font-extrabold text-sm uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2.5 relative group overflow-hidden transition-all ${
                  !isPro && dailyProgress.completionsCount >= 3
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none border border-slate-200'
                    : 'bg-[#69C496] hover:bg-[#58B383] shadow-[0_4px_0_#4e9973] active:shadow-[0_1px_0_#4e9973] active:translate-y-1'
                }`}
              >
                <Zap size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                {!isPro && dailyProgress.completionsCount >= 3 
                  ? 'PROTOCOL COMPLETE 🏆' 
                  : dailyProgress.completionsCount > 0 
                    ? `NEXT CHALLENGE (#${dailyProgress.completionsCount + 1})` 
                    : 'START INITIAL CHALLENGE'}
              </motion.button>

              {!isPro && dailyProgress.completionsCount >= 3 && (
                <div className="flex items-center justify-center gap-3 p-3.5 bg-yellow-50/40 rounded-2xl border border-yellow-200/50">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-amber-500" strokeWidth={2.5} />
                    <span className="text-[10px] font-black text-[#4F3F34]/80 uppercase tracking-wider">Next Recovery:</span>
                  </div>
                  <div className="text-xs font-extrabold text-[#69C496]">
                    <NextRestorationCountdown targetTime={(dailyProgress as any).nextRestorationTime} />
                  </div>
                </div>
              )}

              {/* Challenge Category Navigation */}
              <div className="space-y-3 pt-4 border-t border-[#E9E4D4]/40">
                <span className="text-[9px] font-black text-[#7D6B58]/60 uppercase tracking-[0.2em] block text-center sm:text-left">
                  TAP ANY CATEGORY TO RUN DIRECT CHALLENGE
                </span>
                
                <div className="grid grid-cols-5 xs:grid-cols-5 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-1">
                  {[
                    { id: "pushups", label: "Pushups", done: dailyProgress.pushupsDone, icon: "💪" },
                    { id: "water", label: "Water", done: dailyProgress.waterDrank >= settings.waterGoal, icon: "💧" },
                    { id: "breathing", label: "Breath", done: dailyProgress.breathingDone, icon: "🧘" },
                    { id: "drawing", label: "Draw", done: dailyProgress.drawingDone, icon: "🎨" },
                    { id: "football", label: "Field", done: dailyProgress.footballDone, icon: "⚽" },
                    { id: "bubbles", label: "Bubble", done: dailyProgress.bubblesDone, icon: "🫧" },
                    { id: "memory", label: "Brain", done: dailyProgress.memoryDone, icon: "🧠" },
                    { id: "gratitude", label: "Gratitude", done: dailyProgress.gratitudeDone, icon: "🙏" },
                    { id: "reaction", label: "Reaction", done: dailyProgress.reactionDone, icon: "⚡" },
                    { id: "meditation", label: "Calm", done: dailyProgress.meditationDone, icon: "🧘‍♀️" }
                  ].filter(task => !(settings.archivedOfficialChallenges || []).includes(task.id)).map((task, i) => (
                    <motion.button 
                      key={task.id}
                      id={`challenge-category-nav-${task.id}`}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      onClick={() => onSelectTask(task.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl w-full sm:w-[58px] aspect-square transition-all cursor-pointer relative group ${
                        task.done 
                          ? 'bg-[#69C496]/10 border-2 border-[#69C496]/40 text-[#4F3F34]' 
                          : 'bg-white border border-[#E9E4D4]/60 hover:bg-slate-50 text-[#7D6B58]/50 hover:text-[#4F3F34]'
                      }`}
                      title={`Start ${task.label}`}
                    >
                      <span className={`text-[21px] select-none block transition-transform duration-300 group-hover:scale-110 ${task.done ? 'filter-none' : 'grayscale-[20%] opacity-80'}`}>
                        {task.icon}
                      </span>
                      
                      {/* Smooth indicator dot for completed states */}
                      {task.done && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#69C496] shadow-sm">
                          <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
                        </span>
                      )}

                      <span className="text-[7.5px] font-bold uppercase tracking-tight mt-1 text-[#7D6B58] block max-w-full truncate">
                        {task.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
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
        
        // Define dynamic status dialogue text based on the mascot's current mood state
        let companionSpeech = "";
        if (mascotMood === 'boiling') {
          companionSpeech = "🔥 COGENT VELOCITY ENGAGED! NO EXCUSES TODAY!";
        } else if (mascotMood === 'angry') {
          companionSpeech = "⚡ Hey! Less tapping, more high performance habits!";
        } else if (mascotMood === 'happy') {
          companionSpeech = "✨ Yes! Every bit of discipline builds massive momentum!";
        } else {
          companionSpeech = `☘️ "${quote}"`;
        }

        return (
          <div key="mascot" className="relative w-full aspect-square sm:w-[500px] sm:h-[520px] lg:w-[580px] lg:h-[600px] flex flex-col items-center justify-center flex-shrink-0 mx-auto py-4 select-none">
            {/* Soft Ambient Shadow Underlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#69C496]/5 via-amber-500/[0.02] to-transparent blur-[60px] rounded-full" />
            
            {/* Elegant Duolingo style Dialogue Speech Bubble */}
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
              className="relative mb-6 max-w-[85%] bg-white border-2 border-[#E9E4D4] p-4 rounded-3xl shadow-md text-center group cursor-pointer hover:border-[#69C496]/40 transition-colors"
              onClick={triggerJump}
            >
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-[#E9E4D4] rotate-45" />
              <p className="text-[#4F3F34] text-xs font-black tracking-wide leading-relaxed">
                {companionSpeech}
              </p>
              <div className="text-[9px] font-extrabold text-[#7D6B58] uppercase tracking-[0.12em] mt-1.5 opacity-60 group-hover:text-[#69C496] transition-colors">
                TAP COMPANION TO JUMP • {stats.streak} DAYS STRONG
              </div>
            </motion.div>

            {/* Mascot Container */}
            <motion.div 
              animate={mascotControls} 
              className="w-[82%] h-[82%] relative z-10 cursor-pointer"
            >
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
      
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {sectionOrder.map(id => {
          const content = renderSection(id);
          if (!content) return null;
          // Span certain wide elements across two columns on desktop to maximize clarity
          const isFullWidth = id === 'protocol' || id === 'plans';
          return (
            <div key={id} className={`${isFullWidth ? 'md:col-span-2' : ''} w-full`}>
              {content}
            </div>
          );
        })}
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
