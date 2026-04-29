import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Save, LogOut, Pencil, Pen, Palette, PaintBucket, 
  CheckCircle2, X, Star, Flame, Award, Heart, Brain, Zap, Crown
} from 'lucide-react';
import { UserSettings, UserStats, DailyProgress, ChallengeStep } from '../types';
import { VIBRATION_PATTERNS, vibrate } from '../lib/vibrate';
import { playTrophySound, GoldenTrophy, IceTrophy, BrokenTrophy } from './Trophies';
import { PushupMascot } from './PushupMascot';
import { WaterMascot } from './WaterMascot';
import { BreathingMascot } from './BreathingMascot';
import { ArtistMascot } from './ArtistMascot';
import { WritingMascot } from './WritingMascot';

// Lazy load some UI feedback components
const HappyMascot = lazy(() => import('./FeedbackUI').then(m => ({ default: m.HappyMascot })));

function LazyHappyMascot(props: any) {
  return (
    <Suspense fallback={<div className="w-32 h-32" />}>
      <HappyMascot {...props} />
    </Suspense>
  );
}

export function ChallengeFlow({ step, setStep, customSteps, settings, setSettings, dailyProgress, setDailyProgress, stats, setStats, onFinish, onExit, earnedTrophyToday, showToast, play, dailyQuest }: { 
  step: ChallengeStep, 
  setStep: (s: ChallengeStep) => void, 
  customSteps?: ChallengeStep[],
  settings: UserSettings,
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void,
  dailyProgress: DailyProgress,
  setDailyProgress: (p: Partial<DailyProgress> | ((prev: DailyProgress) => DailyProgress)) => void,
  stats: UserStats,
  setStats: (s: Partial<UserStats> | ((prev: UserStats) => UserStats)) => void,
  onFinish: (p?: DailyProgress) => void,
  onExit: () => void,
  earnedTrophyToday: boolean,
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void,
  play: (s: any) => void,
  dailyQuest: ChallengeStep | null
}) {
  const baseSteps: ChallengeStep[] = ['pushups', 'water', 'breathing', 'drawing', 'football', 'bubbles', 'memory', 'gratitude', 'reaction'];
  const defaultSteps: ChallengeStep[] = [...baseSteps, ...(settings.isPro ? ['writing' as ChallengeStep] : []), 'meditation' as ChallengeStep];
  const steps = customSteps || defaultSteps;
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const currentIdx = steps.indexOf(step as any);
  const progressLabel = step === 'completion' ? 'Done!' : `Challenge ${currentIdx + 1}/${steps.length}`;

  const saveChallenge = () => {
    setSettings(prev => ({
      ...prev,
      savedChallengeIds: [...(prev.savedChallengeIds || []), step]
    }));
    showToast('Challenge saved to library!');
  };

  const nextStep = (data?: any, skipped: boolean = false) => {
    if (!skipped && settings.soundEnabled) {
      play('continue');
    }
    if (!skipped) {
      showToast('Step Complete! Keep going, bro! 🔥', 'success');
    }
    const updates: Partial<DailyProgress> = {};
    if (step === 'pushups') updates.pushupsDone = !skipped;
    if (step === dailyQuest) updates.dailyQuestDone = !skipped;
    if (step === 'breathing') updates.breathingDone = true;
    if (step === 'drawing') updates.drawingDone = true;
    if (step === 'football') updates.footballDone = true;
    if (step === 'bubbles') updates.bubblesDone = true;
    if (step === 'memory') updates.memoryDone = true;
    if (step === 'gratitude') updates.gratitudeDone = true;
    if (step === 'reaction') updates.reactionDone = true;
    if (step === 'meditation') updates.meditationDone = true;
    if (step === 'writing') updates.writingDone = true;

    const finalProgress = { ...dailyProgress, ...updates };

    if (Object.keys(updates).length > 0) {
      setDailyProgress(finalProgress);
    }

    if (currentIdx < steps.length - 1) {
      setStep(steps[currentIdx + 1]);
    } else {
      onFinish(finalProgress);
    }
  };

  const handleBackClick = () => {
    if (step === 'completion') {
      onExit();
    } else {
      vibrate(VIBRATION_PATTERNS.CLICK);
      setShowExitConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#E0F2FF] to-[#F0E6FF] z-[100] flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-4xl flex flex-col min-h-screen">
        <header className="p-6 flex items-center justify-between">
          <button onClick={handleBackClick} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
            <ChevronRight className="rotate-180" size={28} />
          </button>
          <h2 className="text-lg font-bold text-blue-900/60 tracking-tight">{progressLabel}</h2>
          <button onClick={saveChallenge} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
            <Save size={28} />
          </button>
        </header>

        <div className="flex-1 px-6 flex flex-col pb-12 justify-center">
          <AnimatePresence mode="wait">
            {step === 'pushups' && (
              <PushupsStep 
                goal={settings.pushupsGoal} 
                onDone={nextStep} 
                onSkip={() => nextStep(null, true)}
                activeSkin={settings.activeSkin}
                settings={settings}
                play={play}
              />
            )}
            {step === 'water' && (
              <WaterStep 
                goal={settings.waterGoal} 
                progress={dailyProgress.waterDrank}
                onUpdate={(val) => setDailyProgress(prev => ({ ...prev, waterDrank: val }))}
                onContinue={nextStep} 
                activeSkin={settings.activeSkin}
                settings={settings}
                play={play}
              />
            )}
            {step === 'breathing' && (
              <BreathingStep 
                onDone={nextStep} 
                activeSkin={settings.activeSkin}
                settings={settings}
              />
            )}
            {step === 'drawing' && (
              <DrawingStep 
                onFinish={nextStep} 
                onSave={(data) => {
                  setStats(prev => ({
                    ...prev,
                    drawings: [data, ...(prev.drawings || [])].slice(0, 20)
                  }));
                  showToast('Drawing saved to library!', 'success');
                }}
              />
            )}
            {step === 'football' && (
              <FootballStep 
                onFinish={nextStep} 
                activeSkin={settings.activeSkin}
                play={play}
                settings={settings}
              />
            )}
            {step === 'bubbles' && <BubbleStep onFinish={nextStep} />}
            {step === 'memory' && <MemoryStep onComplete={nextStep} />}
            {step === 'gratitude' && (
              <GratitudeStep 
                onComplete={nextStep} 
                onSave={(text) => {
                  setStats(prev => ({
                    ...prev,
                    gratitudeEntries: [
                      { id: Math.random().toString(36).substr(2, 9), text, date: new Date().toISOString() },
                      ...(prev.gratitudeEntries || [])
                    ]
                  }));
                }}
                showToast={showToast}
              />
            )}
            {step === 'reaction' && <ReactionStep onComplete={nextStep} />}
            {step === 'meditation' && (
              <MeditationStep 
                onDone={nextStep} 
                activeSkin={settings.activeSkin}
                settings={settings}
              />
            )}
            {step === 'writing' && (
              <WritingStep 
                onDone={nextStep} 
                activeSkin={settings.activeSkin}
                settings={settings}
              />
            )}
            {step === 'completion' && (
              <CompletionStep 
                onFinish={onExit} 
                streak={stats.streak || 0} 
                points={10} 
                xp={5}
                coins={15}
                showTrophy={earnedTrophyToday}
                settings={settings}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-sm p-8 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 shadow-lg shadow-red-200/50">
                <LogOut size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900 leading-tight">Wait, don't go! 🥺</h2>
                <p className="text-blue-900/60 font-medium">
                  If you quit now, you'll lose your progress for this session. Are you sure you want to stop?
                </p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    onExit();
                  }}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl hover:bg-red-700 transition-all active:scale-95"
                >
                  Quit Session
                </button>
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    setShowExitConfirm(false);
                  }}
                  className="w-full py-4 bg-blue-100 text-blue-600 rounded-2xl font-black hover:bg-blue-200 transition-all active:scale-95"
                >
                  Keep Going! ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Steps Components ---

export function PushupsStep({ goal, onDone, onSkip, activeSkin = 'none', settings, play }: { goal: number, onDone: () => void, onSkip: () => void, activeSkin?: string, settings: UserSettings, play: (s: string) => void }) {
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
      >
        <div className="w-full max-w-[300px]">
          <PushupMascot className="drop-shadow-2xl grayscale opacity-60" />
        </div>
        
        <div className="glass-card w-full p-10 text-center space-y-8 border-red-200 bg-red-50/50">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-red-500" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-red-900/80">Challenge Failed</h2>
            <p className="text-red-900/50 font-medium">You skipped the push-ups. No trophy will be awarded for this session.</p>
          </div>

          <button 
            onClick={() => onSkip()} 
            className="btn-primary w-full bg-red-500 hover:bg-red-600 border-none shadow-red-200"
          >
            Continue Anyway
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[400px] lg:max-w-[600px]">
        <PushupMascot className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-blue-900/80">Push-ups</h2>
          <p className="text-blue-900/50 font-medium">Do {goal} push-ups</p>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          {isReady && <LazyHappyMascot size={32} hat={activeSkin} settings={settings} />}
          {!isReady ? (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setIsReady(true);
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              I'm Done! 💪
            </button>
          ) : (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onDone();
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
          <button 
            onClick={() => { 
              vibrate(VIBRATION_PATTERNS.CLICK); 
              if (settings.soundEnabled) play('losing'); 
              setFailed(true);
            }} 
            className="btn-secondary w-full"
          >
            Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function WaterStep({ goal, progress, onUpdate, onContinue, activeSkin = 'none', settings, play }: { goal: number, progress: number, onUpdate: (v: number) => void, onContinue: () => void, activeSkin?: string, settings: UserSettings, play: (s: string) => void }) {
  const isFinished = progress >= goal;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[300px] lg:max-w-[400px]">
        <WaterMascot progress={Math.min(progress / goal, 1)} className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-blue-900/80">Drink Water</h2>
          <p className="text-blue-900/50 font-medium">{progress} / {goal} glasses</p>
          
          <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((progress / goal) * 100, 100)}%` }}
              className="h-full bg-blue-400 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isFinished && <LazyHappyMascot size={40} hat={activeSkin} settings={settings} />}
          {!isFinished ? (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                if (settings.soundEnabled) play('water');
                onUpdate(progress + 1);
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Drink +1 💧
            </button>
          ) : (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onContinue();
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function BreathingStep({ onDone, activeSkin = 'none', settings }: { onDone: () => void, activeSkin?: string, settings: UserSettings }) {
  const [phase, setPhase] = useState<'In' | 'Out'>('In');
  const [timer, setTimer] = useState(5);
  const [cycles, setCycles] = useState(0);
  const isFinished = cycles >= 5;

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  useEffect(() => {
    if (timer < 0) {
      vibrate(10);
      setTimer(5);
      setPhase((p) => {
        const next = p === 'In' ? 'Out' : 'In';
        if (next === 'In') setCycles((c) => c + 1);
        return next;
      });
    }
  }, [timer]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[300px] lg:max-w-[400px]">
        <BreathingMascot phase={phase} className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-blue-900/80">Breathing</h2>
          <p className="text-blue-900/50 font-medium text-xl">
            {isFinished ? 'Exercise Complete!' : `Breathe ${phase === 'In' ? 'In' : 'Out'}...`}
          </p>
          
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-8 rounded-full transition-colors duration-500 ${i < cycles ? 'bg-blue-500' : 'bg-blue-100'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {isFinished && <LazyHappyMascot size={40} hat={activeSkin} settings={settings} />}
          {!isFinished ? (
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-blue-50" />
                <motion.circle
                  cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8"
                  strokeDasharray="364.4"
                  animate={{ strokeDashoffset: 364.4 * (1 - Math.max(0, timer) / 5) }}
                  className="text-blue-500"
                />
              </svg>
              <div className="text-4xl font-bold text-blue-600">{Math.max(0, timer)}</div>
            </div>
          ) : (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onDone();
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function DrawingStep({ onFinish, onSave }: { onFinish: (data: string) => void, onSave: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3B82F6');
  const [tool, setTool] = useState<'pencil' | 'pen' | 'brush' | 'bucket'>('pen');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const lastPoint = useRef<{ x: number, y: number } | null>(null);
  const lastMidPoint = useRef<{ x: number, y: number } | null>(null);

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#000000', '#FFFFFF'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const getPixel = (x: number, y: number) => {
      const i = (y * canvas.width + x) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    };
    const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
      const i = (y * canvas.width + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
    };
    const targetColor = getPixel(startX, startY);
    const fillRGB = hexToRgb(fillColor);
    if (!fillRGB || colorsMatch(targetColor, [fillRGB.r, fillRGB.g, fillRGB.b, 255])) return;
    const stack: [number, number][] = [[startX, startY]];
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      let curX = x;
      while (curX >= 0 && colorsMatch(getPixel(curX, y), targetColor)) curX--;
      curX++;
      let reachAbove = false, reachBelow = false;
      while (curX < canvas.width && colorsMatch(getPixel(curX, y), targetColor)) {
        setPixel(curX, y, fillRGB.r, fillRGB.g, fillRGB.b);
        if (y > 0) {
          if (colorsMatch(getPixel(curX, y - 1), targetColor)) {
            if (!reachAbove) { stack.push([curX, y - 1]); reachAbove = true; }
          } else reachAbove = false;
        }
        if (y < canvas.height - 1) {
          if (colorsMatch(getPixel(curX, y + 1), targetColor)) {
            if (!reachBelow) { stack.push([curX, y + 1]); reachBelow = true; }
          } else reachBelow = false;
        }
        curX++;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const colorsMatch = (c1: number[], c2: number[]) => {
    const threshold = 15;
    return Math.abs(c1[0] - c2[0]) < threshold && Math.abs(c1[1] - c2[1]) < threshold && Math.abs(c1[2] - c2[2]) < threshold && Math.abs(c1[3] - c2[3]) < threshold;
  };

  const startDrawing = (e: any) => {
    vibrate(5);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    if (tool === 'bucket') {
      floodFill(Math.floor(x), Math.floor(y), color);
      setHasDrawn(true);
      return;
    }
    ctx.beginPath(); ctx.moveTo(x, y);
    lastPoint.current = { x, y };
    lastMidPoint.current = { x, y };
    setIsDrawing(true); setHasDrawn(true);
  };

  const draw = (e: any) => {
    if (!isDrawing || tool === 'bucket') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    if (lastPoint.current && lastMidPoint.current) {
      const midPoint = { x: (lastPoint.current.x + x) / 2, y: (lastPoint.current.y + y) / 2 };
      ctx.beginPath(); ctx.moveTo(lastMidPoint.current.x, lastMidPoint.current.y);
      ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midPoint.x, midPoint.y);
      ctx.strokeStyle = color; ctx.lineWidth = tool === 'pencil' ? 2 : tool === 'pen' ? 8 : 24;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
      lastPoint.current = { x, y }; lastMidPoint.current = midPoint;
    }
  };

  const stopDrawing = () => { setIsDrawing(false); lastPoint.current = null; lastMidPoint.current = null; };
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); setHasDrawn(false);
  };
  const saveDrawing = () => { const canvas = canvasRef.current; return canvas ? canvas.toDataURL('image/png') : ''; };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto w-full">
      <div className="w-full max-w-[400px]"><ArtistMascot className="drop-shadow-2xl" /></div>
      <div className="glass-card w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-900/80">Creativity</h2>
          <button onClick={clearCanvas} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">Clear Canvas</button>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm border border-blue-100">
            {(['pencil', 'pen', 'brush', 'bucket'] as const).map(t => (
              <button key={t} onClick={() => { vibrate(10); setTool(t); }} className={`p-2 rounded-md transition-all ${tool === t ? 'bg-blue-500 text-white shadow-md' : 'text-blue-400 hover:bg-blue-50'}`}>
                {t === 'pencil' && <Pencil size={20} />} {t === 'pen' && <Pen size={20} />} {t === 'brush' && <Palette size={20} />} {t === 'bucket' && <PaintBucket size={20} />}
              </button>
            ))}
          </div>
          <div className="h-8 w-px bg-blue-200 mx-2" />
          <div className="flex gap-2">
            {colors.map(c => <button key={c} onClick={() => { vibrate(10); setColor(c); }} className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />)}
          </div>
        </div>
        <div className="h-80 bg-white rounded-2xl border-2 border-blue-100 overflow-hidden touch-none shadow-inner relative">
          <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full cursor-crosshair" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2 w-full">
            <button onClick={() => { vibrate(VIBRATION_PATTERNS.CLICK); onSave(saveDrawing()); setIsSaved(true); }} disabled={!hasDrawn || isSaved} className={`flex-1 py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all ${(!hasDrawn || isSaved) ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSaved ? 'Saved! ✨' : 'Save to Library'} <Save size={18} />
            </button>
            <button onClick={() => { vibrate(VIBRATION_PATTERNS.SUCCESS); onFinish(saveDrawing()); }} disabled={!hasDrawn} className={`flex-[2] btn-primary flex items-center justify-center gap-2 ${!hasDrawn ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Finish Masterpiece <CheckCircle2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CompletionStep({ onFinish, streak, points, xp, coins, showTrophy, settings }: { onFinish: () => void, streak: number, points: number, xp: number, coins: number, showTrophy: boolean, settings: UserSettings }) {
  useEffect(() => {
    if (showTrophy) {
      vibrate(VIBRATION_PATTERNS.TROPHY);
      if (settings.soundEnabled) {
        playTrophySound('golden');
      }
    }
  }, [showTrophy, settings.soundEnabled]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto w-full"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-black text-blue-900 tracking-tighter">PLAN COMPLETE!</h2>
          <p className="text-lg text-blue-900/40 font-bold">You're unstoppable! 🔥</p>
        </motion.div>
      </div>

      {showTrophy && (
        <div className="w-full max-w-[200px]">
          <GoldenTrophy />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 text-center border-emerald-100 bg-emerald-50/30"
        >
          <div className="text-2xl font-black text-emerald-500">+{points}</div>
          <div className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Points</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 text-center border-orange-100 bg-orange-50/30"
        >
          <div className="text-2xl font-black text-orange-500">{streak}</div>
          <div className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Day Streak</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-4 text-center border-blue-100 bg-blue-50/30"
        >
          <div className="text-2xl font-black text-blue-500">+{xp}</div>
          <div className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Bonus XP</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-4 text-center border-yellow-100 bg-yellow-50/30"
        >
          <div className="text-2xl font-black text-yellow-500">+{coins}</div>
          <div className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Coins</div>
        </motion.div>
      </div>

      <button 
        onClick={() => {
          vibrate(VIBRATION_PATTERNS.CLICK);
          onFinish();
        }} 
        className="btn-primary w-full py-5 text-lg shadow-2xl shadow-blue-500/20"
      >
        Back to Home ✨
      </button>
    </motion.div>
  );
}

// Memory, Football, Bubble, etc. steps omitted for brevity in this single file or can be included if needed.
// Given the volume, I'll group them but keep code clean.
// Actually, I'll include the ones already edited in App.tsx.

export function FootballStep({ onFinish, activeSkin = 'none', play, settings }: { onFinish: () => void, activeSkin?: string, play: (s: string) => void, settings: UserSettings }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [score, setScore] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(5);
  const [isFlying, setIsFlying] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 400, y: 520 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint] = useState({ x: 400, y: 520 });
  const [aimLine, setAimLine] = useState({ x2: 400, y2: 520, opacity: 0 });
  const [ballScale, setBallScale] = useState(1);
  const [scoredBalls, setScoredBalls] = useState<{ x: number, y: number }[]>([]);

  const getCoord = (e: any) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    return {
      x: (clientX - rect.left) * (800 / rect.width),
      y: (clientY - rect.top) * (600 / rect.height)
    };
  };

  const onStart = (e: any) => {
    if (isFlying || ballsLeft <= 0) return;
    vibrate(10);
    setIsDragging(true);
  };

  const onMove = (e: any) => {
    if (!isDragging) return;
    const pos = getCoord(e);
    const dx = startPoint.x - pos.x;
    const dy = startPoint.y - pos.y;
    const limit = 100;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ratio = Math.min(dist, limit) / dist;

    const newX = startPoint.x - (dx * ratio);
    const newY = startPoint.y - (dy * ratio);

    setBallPos({ x: newX, y: newY });
    setAimLine({
      x2: startPoint.x + (dx * 3),
      y2: startPoint.y - 40 + (dy * 3),
      opacity: 0.8
    });
  };

  const onEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsFlying(true);
    setAimLine(prev => ({ ...prev, opacity: 0 }));

    const power = 14;
    const vx = (startPoint.x - ballPos.x) * power;
    const vy = (startPoint.y - ballPos.y) * power;
    const targetX = ballPos.x + vx;
    const targetY = ballPos.y + vy;

    let startTime: number | null = null;
    const duration = 1000;
    const oX = ballPos.x;
    const oY = ballPos.y;

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const p = (now - startTime) / duration;
      if (p < 1) {
        const t = 1 - Math.pow(1 - p, 2);
        const curX = oX + (targetX - oX) * t;
        const curY = oY + (targetY - oY) * t;
        setBallPos({ x: curX, y: curY });
        setBallScale(1 - (p * 0.7));
        requestAnimationFrame(animate);
      } else {
        const goalXMin = 150;
        const goalXMax = 650;
        const goalYMin = 120;
        const goalYMax = 270;
        const obsXMin = 330;
        const obsXMax = 470;

        const isGoal = targetY >= goalYMin && targetY <= goalYMax &&
          targetX >= goalXMin && targetX <= goalXMax &&
          (targetX < obsXMin || targetX > obsXMax);

        if (isGoal) {
          vibrate([20, 50, 20]);
          setScore(s => s + 1);
          setScoredBalls(prev => [...prev, { x: targetX, y: targetY }]);
        } else {
          vibrate(15);
          if ((ballsLeft > 1 || score >= 4) && settings.soundEnabled) {
             play('losing');
          }
        }

        setBallsLeft(b => b - 1);
        setTimeout(reset, 1200);
      }
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (ballsLeft === 0 && !isFlying && score < 5 && settings.soundEnabled) {
      play('losing');
    }
  }, [ballsLeft, isFlying, score, play, settings.soundEnabled]);

  const reset = () => {
    setBallPos({ x: 400, y: 520 });
    setBallScale(1);
    setIsFlying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-4 sm:space-y-8 max-w-4xl mx-auto w-full"
    >
      <div className="glass-card w-full p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-hidden">
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-blue-900/80">Football Challenge</h2>
            <p className="text-sm text-blue-900/40">Score 5 goals to continue!</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
              Score: {score}/5
            </div>
            <div className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
              Balls: {ballsLeft}
            </div>
          </div>
        </div>

        <div className="relative w-full aspect-[3/2] bg-[#2f855a] rounded-xl sm:rounded-2xl border-4 sm:border-8 border-[#22543d] overflow-hidden shadow-2xl touch-none">
          <svg
            ref={svgRef}
            viewBox="0 0 800 600"
            className="w-full h-full cursor-crosshair"
            onMouseDown={onStart}
            onMouseMove={onMove}
            onMouseUp={onEnd}
            onTouchStart={onStart}
            onTouchMove={onMove}
            onTouchEnd={onEnd}
          >
            <defs>
              <radialGradient id="ballGlass" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
              </radialGradient>
              <linearGradient id="innerLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <pattern id="net-grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.4" />
              </pattern>
              <linearGradient id="grass-pitch" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#166534" />
              </linearGradient>
              <filter id="shadowBlur">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <clipPath id="ballClip">
                <circle cx="0" cy="-50" r="50" />
              </clipPath>
            </defs>

            <rect x="0" y="0" width="800" height="250" fill="#a0aec0" opacity="0.2" />
            <g opacity="0.2">
              {Array.from({ length: 17 }).map((_, i) => (
                <path key={`v-${i}`} d={`M ${i * 50},0 V 220`} stroke="white" strokeWidth="1" />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <path key={`h-${i}`} d={`M 0,${i * 40} H 800`} stroke="white" strokeWidth="1" />
              ))}
            </g>
            <rect x="0" y="210" width="800" height="40" fill="#14532d" />
            <rect x="0" y="250" width="800" height="350" fill="url(#grass-pitch)" />
            <rect x="0" y="520" width="800" height="10" fill="white" opacity="0.8" />

            <g transform="translate(150, 120) scale(1.1)">
              <path d="M 0,150 L -30,170 L -30,20 L 0,0 Z" fill="#fff" opacity="0.1" />
              <path d="M 450,150 L 480,170 L 480,20 L 450,0 Z" fill="#fff" opacity="0.1" />
              <rect x="0" y="0" width="450" height="150" fill="url(#net-grid)" stroke="white" strokeWidth="1" />
              <path d="M 0,150 V 0 H 450 V 150" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
            </g>

            <g transform="translate(330, 120)">
              <rect x="0" y="0" width="140" height="165" fill="#7c2d12" stroke="#451a03" strokeWidth="4" rx="8" />
              <path d="M 0,0 L 140,165 M 140,0 L 0,165" stroke="#451a03" strokeWidth="2" opacity="0.5" />
              <text x="70" y="85" textAnchor="middle" fill="white" className="font-bold" style={{ fontSize: '24px' }}>BLOCK</text>
            </g>

            {scoredBalls.map((b, i) => (
              <g key={i} transform={`translate(${b.x}, ${b.y}) scale(0.3)`}>
                <circle cx="0" cy="-50" r="50" fill="url(#ballGlass)" stroke="#7dd3fc" strokeWidth="2" />
                <g clipPath="url(#ballClip)">
                  <rect x="-50" y="-35" width="100" height="100" fill="url(#innerLiquid)" />
                </g>
              </g>
            ))}

            {!isFlying && ballsLeft > 0 && (
              <ellipse cx={ballPos.x} cy={ballPos.y + 10} rx={60 * (ballPos.y / 520)} ry={15 * (ballPos.y / 520)} fill="black" opacity="0.4" filter="url(#shadowBlur)" />
            )}

            {(isFlying || ballsLeft > 0) && (
              <g transform={`translate(${ballPos.x}, ${ballPos.y}) scale(${ballScale})`}>
                <g className={!isFlying && !isDragging ? "idle-anim" : ""}>
                  <circle cx="0" cy="-50" r="50" fill="url(#ballGlass)" stroke="#7dd3fc" strokeWidth="2" />
                  <g clipPath="url(#ballClip)">
                    <rect x="-50" y="-35" width="100" height="100" fill="url(#innerLiquid)" />
                  </g>
                  <ellipse cx="-18" cy="-75" rx="15" ry="8" fill="white" opacity="0.3" transform="rotate(-30, -18, -75)" />
                  <g transform="translate(-15, -75) scale(0.65)">
                    <path d="M 0 0 L 10 0 L 30 40 L 30 0 L 45 0 L 45 60 L 30 60 L 10 20 L 10 60 L 0 60 Z" fill="white" opacity="0.9" />
                  </g>
                  <g transform="translate(0, -45)">
                    <circle cx="-18" cy="0" r="5" fill="#001845" />
                    <circle cx="18" cy="0" r="5" fill="#001845" />
                    <path d="M -10,12 Q 0,22 10,12" fill="none" stroke="#001845" strokeWidth="4" strokeLinecap="round" />
                  </g>
                </g>
              </g>
            )}

            {isDragging && (
              <line x1={startPoint.x} y1={startPoint.y - 40} x2={aimLine.x2} y2={aimLine.y2} stroke="white" strokeWidth="4" strokeDasharray="10,6" opacity={aimLine.opacity} />
            )}
          </svg>

          {ballsLeft === 0 && !isFlying && score < 5 && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-4 text-center">
              <h3 className="text-3xl font-bold">Game Over!</h3>
              <p>You need at least 5 goals.</p>
              <button
                onClick={() => {
                  setBallsLeft(5);
                  setScore(0);
                  setScoredBalls([]);
                }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {score >= 5 && (
          <div className="flex flex-col items-center w-full">
            <LazyHappyMascot size={40} hat={activeSkin} settings={settings} />
            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onFinish();
              }}
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 animate-bounce"
            >
              Continue <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes mascotIdle {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.04, 0.96); }
        }
        .idle-anim {
          animation: mascotIdle 3s infinite ease-in-out;
          transform-origin: bottom center;
        }
      `}</style>
    </motion.div>
  );
}

export function BubbleStep({ onFinish }: { onFinish: () => void }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);

  const playPopSound = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContext.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error('Audio error:', e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (bubbles.length < 12 && poppedCount < 20) {
        const id = Math.random();
        const size = Math.random() * 60 + 40;
        const x = Math.random() * 80 + 10;
        const y = 110;
        const color = `hsla(${Math.random() * 360}, 70%, 70%, 0.4)`;
        setBubbles(prev => [...prev, { id, x, y, size, color }]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [bubbles.length, poppedCount]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBubbles(prev => prev.map(b => ({ ...b, y: b.y - 0.3 })).filter(b => b.y > -20));
    }, 16);
    return () => clearInterval(moveInterval);
  }, []);

  const popBubble = (id: number) => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    playPopSound();
    setBubbles(prev => prev.filter(b => b.id !== id));
    setPoppedCount(prev => prev + 1);
  };

  useEffect(() => {
    if (poppedCount >= 20) {
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      playPopSound();
      const timer = setTimeout(onFinish, 2000);
      return () => clearTimeout(timer);
    }
  }, [poppedCount, onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto w-full relative overflow-hidden h-[600px] bg-blue-50/30 rounded-3xl border-4 border-white/50 shadow-2xl"
    >
      <div className="absolute top-8 left-8 z-10">
        <h2 className="text-2xl font-bold text-blue-900/80">Bubble Pop!</h2>
        <p className="text-sm text-blue-900/40">Pop 20 bubbles to relax ✨</p>
      </div>

      <div className="absolute top-8 right-8 z-10 bg-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
        {poppedCount}/20
      </div>

      <div className="relative w-full h-full">
        <AnimatePresence>
          {bubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              onClick={() => popBubble(bubble.id)}
              className="absolute cursor-pointer rounded-full border-2 border-white/80 shadow-inner backdrop-blur-[2px]"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
                backgroundColor: bubble.color,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.8 }}
            >
              <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/40 rounded-full blur-[1px]" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {poppedCount >= 20 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-20"
        >
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 flex flex-col items-center">
            <h3 className="text-3xl font-bold text-blue-900">Amazing!</h3>
            <p className="text-blue-900/60">You're so focused! 🫧</p>
            <button onClick={() => { vibrate(VIBRATION_PATTERNS.SUCCESS); onFinish(); }} className="btn-primary w-full mt-4">
              Finish Today's Flow! ✨
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function MemoryStep({ onComplete }: { onComplete: () => void }) {
  const [cards, setCards] = useState<{ id: number, emoji: string, flipped: boolean, matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const emojis = ['💧', '🍎', '🏃', '🧘', '⚽', '🎨'];

  useEffect(() => {
    const initialCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(initialCards);
  }, []);

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || cards[id].matched || cards[id].flipped) return;
    vibrate(10);
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    setFlipped([...flipped, id]);

    if (flipped.length === 1) {
      const firstId = flipped[0];
      if (cards[firstId].emoji === cards[id].emoji) {
        newCards[firstId].matched = true;
        newCards[id].matched = true;
        setCards(newCards);
        setFlipped([]);
        if (newCards.every(c => c.matched)) {
          vibrate(VIBRATION_PATTERNS.SUCCESS);
          setTimeout(onComplete, 1000);
        }
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstId].flipped = false;
          resetCards[id].flipped = false;
          setCards(resetCards);
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-blue-900 mb-2">Memory Match</h2>
        <p className="text-blue-600 font-medium">Keep your brain sharp!</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-md transition-all ${
              card.flipped || card.matched ? 'bg-white' : 'bg-blue-500 text-transparent'
            }`}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function GratitudeStep({ onComplete, onSave, showToast }: { onComplete: () => void, onSave: (text: string) => void, showToast: (msg: string, type?: 'success' | 'info' | 'error') => void }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (text.trim().length < 3) return;
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    setSubmitted(true);
    setTimeout(onComplete, 2000);
  };

  const handleSave = () => {
    if (text.trim().length < 3) return;
    vibrate(VIBRATION_PATTERNS.CLICK);
    onSave(text);
    showToast('Saved to your Gratitude Library!');
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xs mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-black text-blue-900 mb-2">Gratitude Jar</h2>
        <p className="text-blue-600 font-medium">What's one good thing today?</p>
      </div>
      <div className="relative w-full aspect-square bg-blue-50 rounded-3xl border-4 border-blue-200 flex items-center justify-center p-6 overflow-hidden">
        <AnimatePresence>
          {!submitted ? (
            <motion.div exit={{ y: -100, opacity: 0 }} className="w-full">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="I am grateful for..."
                className="w-full h-32 bg-white rounded-xl p-4 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-medium"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  disabled={text.trim().length < 3}
                  className="p-3 bg-amber-100 text-amber-600 rounded-xl font-bold shadow-sm disabled:opacity-50"
                  title="Save to Library"
                >
                  <Save size={24} />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={text.trim().length < 3}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                >
                  Drop in Jar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">✨</div>
              <p className="text-blue-900 font-bold">Saved to your jar!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ReactionStep({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<'waiting' | 'ready' | 'clicked' | 'too-soon'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const timerRef = useRef<any>(null);

  const startTest = () => {
    setState('waiting');
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
      vibrate(50);
    }, delay);
  };

  useEffect(() => {
    startTest();
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleClick = () => {
    if (state === 'waiting') {
      clearTimeout(timerRef.current);
      setState('too-soon');
      vibrate(VIBRATION_PATTERNS.ERROR);
    } else if (state === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setState('clicked');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      setTimeout(onComplete, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <h2 className="text-2xl font-black text-blue-900 mb-2">Reaction Test</h2>
        <p className="text-blue-600 font-medium">Tap when it turns GREEN!</p>
      </div>
      <button
        onClick={handleClick}
        className={`w-full aspect-square rounded-3xl flex flex-col items-center justify-center transition-colors duration-75 shadow-xl ${
          state === 'waiting' ? 'bg-blue-100' :
          state === 'ready' ? 'bg-green-500' :
          state === 'too-soon' ? 'bg-red-500' : 'bg-blue-500'
        }`}
      >
        {state === 'waiting' && <p className="text-blue-400 font-bold text-xl">Wait...</p>}
        {state === 'ready' && <p className="text-white font-black text-4xl animate-pulse">TAP!</p>}
        {state === 'too-soon' && (
          <div className="text-center text-white">
            <p className="font-black text-2xl mb-2">Too soon!</p>
            <button onClick={startTest} className="px-4 py-2 bg-white/20 rounded-lg font-bold">Try Again</button>
          </div>
        )}
        {state === 'clicked' && (
          <div className="text-center text-white">
            <p className="font-black text-4xl mb-2">{reactionTime}ms</p>
            <p className="font-bold">Great reflexes!</p>
          </div>
        )}
      </button>
    </div>
  );
}

export function MeditationStep({ onDone, activeSkin = 'none', settings }: { onDone: () => void, activeSkin?: string, settings: UserSettings }) {
  const duration = settings.isPro ? 60 : 30;
  const [timer, setTimer] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const isFinished = timer <= 0;

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[300px]">
        <BreathingMascot phase={isActive ? 'In' : 'Out'} className={`drop-shadow-2xl transition-all duration-1000 ${isActive ? 'scale-110' : 'scale-100'}`} />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8 border-purple-200 bg-purple-50/30">
        <div className="space-y-4">
          {settings.isPro && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
              <Crown size={12} /> Pro Challenge
            </div>
          )}
          <h2 className="text-3xl font-bold text-purple-900/80">Deep Meditation</h2>
          <p className="text-purple-900/50 font-medium">Clear your mind for {duration} seconds</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-black text-purple-600 tabular-nums">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>

          {isFinished ? (
            <div className="space-y-4 w-full">
              <LazyHappyMascot size={40} hat={activeSkin} settings={settings} />
              <button 
                onClick={onDone} 
                className="btn-primary w-full bg-purple-500 hover:bg-purple-600 border-none"
              >
                Continue <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setIsActive(!isActive);
              }} 
              className={`btn-primary w-full ${isActive ? 'bg-purple-200 text-purple-600 border-none' : 'bg-purple-500 hover:bg-purple-600 border-none'}`}
            >
              {isActive ? 'Pause' : 'Start Meditation'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function WritingStep({ onDone, activeSkin = 'none', settings }: { onDone: () => void, activeSkin?: string, settings: UserSettings }) {
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState('');
  const prompts = [
    "What's one thing you're proud of today?",
    "Describe your perfect morning routine.",
    "What's a goal you're working towards?",
    "Write about a person who inspires you.",
    "What's a lesson you've learned recently?"
  ];

  useEffect(() => {
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[250px]">
        <WritingMascot className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-8 space-y-6 border-blue-200 bg-blue-50/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
            <Crown size={12} /> Pro Challenge
          </div>
          <h2 className="text-2xl font-bold text-blue-900/80">Creative Writing</h2>
          <p className="text-blue-900/60 font-medium italic">"{prompt}"</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-40 bg-white/80 rounded-xl p-4 text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-medium border border-blue-100 shadow-sm"
        />

        <button 
          onClick={() => {
            vibrate(VIBRATION_PATTERNS.SUCCESS);
            onDone();
          }} 
          disabled={text.trim().length < 10}
          className="btn-primary w-full bg-blue-500 hover:bg-blue-600 border-none disabled:opacity-50"
        >
          Finish Writing ✨
        </button>
      </div>
    </motion.div>
  );
}
