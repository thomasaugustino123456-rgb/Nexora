import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Flame, 
  Droplets, 
  Wind, 
  Palette, 
  Target, 
  Brain, 
  Heart, 
  Sparkles, 
  Loader2,
  Clock,
  Calendar
} from 'lucide-react';
import { ChallengeStep, CustomPlan, UserSettings, MascotMood } from '../types';
import { vibrate } from '../lib/vibrate';
import { Mascot } from './Mascot';

interface PlanBuilderProps {
  onBack: () => void;
  onSave: (plan: CustomPlan) => void;
  isPro: boolean;
  existingPlansCount: number;
  settings: UserSettings;
}

const CHALLENGE_OPTIONS: { id: ChallengeStep; label: string; icon: any; color: string }[] = [
  { id: 'pushups', label: 'Push-ups', icon: <Flame size={20} />, color: 'bg-orange-500' },
  { id: 'water', label: 'Water', icon: <Droplets size={20} />, color: 'bg-blue-500' },
  { id: 'breathing', label: 'Breathing', icon: <Wind size={20} />, color: 'bg-cyan-500' },
  { id: 'drawing', label: 'Drawing', icon: <Palette size={20} />, color: 'bg-pink-500' },
  { id: 'memory', label: 'Memory', icon: <Brain size={20} />, color: 'bg-purple-500' },
  { id: 'reaction', label: 'Reaction', icon: <Target size={20} />, color: 'bg-red-500' },
  { id: 'meditation', label: 'Meditation', icon: <Heart size={20} />, color: 'bg-emerald-500' },
  { id: 'gratitude', label: 'Gratitude', icon: <Sparkles size={20} />, color: 'bg-yellow-500' },
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function PlanBuilder({ onBack, onSave, isPro, existingPlansCount, settings }: PlanBuilderProps) {
  const [name, setName] = useState('');
  const [selectedChallenges, setSelectedChallenges] = useState<ChallengeStep[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [time, setTime] = useState('09:00');
  const [time2, setTime2] = useState('21:00');
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);

  // Launch Mode: Unlimited plans for everyone until we reach 20+ users
  const canCreate = true; 
  const planLimit = isPro ? 999 : 5;

  const handleToggleChallenge = (id: ChallengeStep) => {
    vibrate(10);
    setSelectedChallenges(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleToggleDay = (index: number) => {
    vibrate(10);
    setSelectedDays(prev => 
      prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index]
    );
  };

  const handleCreate = async () => {
    if (!name || selectedChallenges.length === 0) return;
    
    vibrate(20);
    setIsCreating(true);
    
    // Simulate mascot "creating" the plan
    setTimeout(async () => {
      const newPlan: CustomPlan = {
        id: Math.random().toString(36).substr(2, 9),
        userId: '', // Will be set by App.tsx
        name,
        icon: 'Target', // Default for now
        color: 'bg-blue-500',
        challenges: selectedChallenges,
        days: selectedDays,
        reminderTime: time,
        reminderTime2: time2,
        createdAt: new Date().toISOString()
      };
      await onSave(newPlan);
      setIsCreating(false);
    }, 3000);
  };

  if (isCreating) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-full max-w-sm space-y-12"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full" />
            <Mascot className="w-64 h-64 mx-auto drop-shadow-2xl relative z-10" mood="happy" />
            
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -top-12 -right-4 bg-white p-4 rounded-2xl shadow-xl border-2 border-blue-100 max-w-[200px] z-20"
            >
              <p className="text-sm font-black text-blue-900 leading-tight">Wait bro, I'm creating your custom plan right now! 🚀</p>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-100 rotate-45" />
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-blue-900">Building "{name}"</h2>
              <p className="text-blue-900/40 font-bold uppercase tracking-widest text-xs">Setting up your routine...</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-500" size={20} />
                <span className="text-blue-900/60 font-bold text-sm">Almost ready, bro...</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[150] flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-gray-100">
        <button onClick={onBack} className="p-2 text-blue-900/40 hover:text-blue-900/60 transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Create Plan</h2>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        {/* Plan Name */}
        <section className="space-y-4">
          <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Plan Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning Routine"
            className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none text-lg font-bold text-blue-900 transition-all"
          />
        </section>

        {/* Challenge Selection */}
        <section className="space-y-4">
          <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Select Challenges</label>
          <div className="grid grid-cols-2 gap-3">
            {CHALLENGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleToggleChallenge(option.id)}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  selectedChallenges.includes(option.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-100 bg-white hover:border-blue-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${option.color} text-white flex items-center justify-center shadow-lg shadow-blue-100`}>
                  {option.icon}
                </div>
                <span className={`font-bold text-sm ${selectedChallenges.includes(option.id) ? 'text-blue-900' : 'text-blue-900/60'}`}>
                  {option.label}
                </span>
                {selectedChallenges.includes(option.id) && (
                  <div className="ml-auto text-blue-500">
                    <Check size={16} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section className="space-y-4">
          <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Schedule</label>
          <div className="flex justify-between gap-2">
            {DAYS.map((day, i) => (
              <button
                key={i}
                onClick={() => handleToggleDay(i)}
                className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                  selectedDays.includes(i)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-blue-900/30 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </section>

        {/* Reminder Time */}
        <section className="space-y-4">
          <label className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Reminder Times</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border-2 border-transparent">
              <Clock className="text-blue-900/30" size={20} />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-blue-900/40 uppercase">Time 1</span>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-transparent outline-none font-bold text-blue-900 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border-2 border-transparent">
              <Clock className="text-purple-900/30" size={20} />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-blue-900/40 uppercase">Time 2</span>
                <input 
                  type="time" 
                  value={time2}
                  onChange={(e) => setTime2(e.target.value)}
                  className="bg-transparent outline-none font-bold text-blue-900 text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Launch Special Message */}
        <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-100 text-blue-900 text-sm font-bold flex gap-3 items-center">
          <Sparkles className="text-blue-500 shrink-0" size={24} />
          <div>
            <p className="text-blue-600 uppercase tracking-widest text-[10px] font-black">Launch Special! 🚀</p>
            <p className="text-xs">Unlimited plan creation is unlocked for everyone during our launch phase, bro! Go crazy!</p>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 border-t border-gray-100 bg-white/80 backdrop-blur-md absolute bottom-0 left-0 right-0">
        <button
          disabled={!name || selectedChallenges.length === 0 || !canCreate}
          onClick={handleCreate}
          className={`btn-primary w-full py-4 text-lg font-black flex items-center justify-center gap-2 ${
            (!name || selectedChallenges.length === 0 || !canCreate) ? 'opacity-50 grayscale cursor-not-allowed' : ''
          }`}
        >
          Create Plan <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
