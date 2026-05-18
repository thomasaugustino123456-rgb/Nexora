import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Droplets, Flame, User, Globe, Sparkles, Loader2, CheckCircle2, ArrowLeft, Briefcase, Zap, Brain } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserSettings } from '../types';
import { vibrate } from '../lib/vibrate';

import { AnimatedBell } from './AnimatedBell';

interface OnboardingProps {
  onComplete: () => void;
  settings: UserSettings;
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  setupFCM: () => Promise<void>;
}

export function OnboardingScreen({ onComplete, settings, setSettings, setupFCM }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [source, setSource] = useState('');
  const [workType, setWorkType] = useState('');
  const [energyPeak, setEnergyPeak] = useState('');
  const [priorityFocus, setPriorityFocus] = useState('');
  const [water, setWater] = useState<number>(2);
  const [pushups, setPushups] = useState<number>(5);
  const [commitmentLevel, setCommitmentLevel] = useState<'casual' | 'consistent' | 'intense'>('consistent');
  const [isHoveringContinue, setIsHoveringContinue] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);

  const totalSteps = 13;

  useEffect(() => {
    if (step === 12) {
      // Simulate plan creation
      const timer = setTimeout(() => {
        setStep(13);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleComplete = async () => {
    if (!auth.currentUser) return;
    
    const updates: any = { onboardingCompleted: true };
    if (name.trim()) updates.displayName = name.trim();
    if (gender) updates.gender = gender;
    if (source) updates.source = source;
    if (workType) updates.workType = workType;
    if (energyPeak) updates.energyPeak = energyPeak;
    if (priorityFocus) updates.priorityFocus = priorityFocus;
    if (commitmentLevel) updates.commitmentLevel = commitmentLevel;
    updates.waterGoal = water;
    updates.pushupsGoal = pushups;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
      
      setSettings({
        ...settings,
        displayName: name.trim() || settings.displayName,
        waterGoal: water,
        pushupsGoal: pushups,
        onboardingCompleted: true
      });
      
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      // Fallback to complete anyway so user isn't stuck
      onComplete();
    }
  };

  const handleContinueClick = (action: () => void) => {
    vibrate(15);
    action();
  };

  const handleButtonHover = (isHovering: boolean) => {
    setIsHoveringContinue(isHovering);
    if (isHovering) {
      vibrate(5);
      setButtonPulse(true);
      setTimeout(() => {
        setButtonPulse(false);
      }, 400);
    }
  };

  const nextStep = () => handleContinueClick(() => setStep(prev => prev + 1));

  const handleBack = async () => {
    vibrate(10);
    if (step > 1 && step < 12) {
      setStep(prev => prev - 1);
    } else if (step === 1) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Back Button */}
      {step < 12 && (
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 p-3 rounded-full bg-white/50 text-blue-900/60 hover:bg-white/80 hover:text-blue-900 transition-all z-20 shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
      )}

      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Mascot */}
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              delay: 0.2 
            }}
            className="w-64 h-64 md:w-[512px] md:h-[512px] max-w-full flex items-center justify-center"
          >
            <img 
              src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
              alt="Nexora Mascot" 
              className="w-full h-full object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs font-bold text-blue-900/40 uppercase tracking-widest">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Welcome & Importance */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-2">
                <Sparkles size={32} />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-blue-900 leading-tight">Welcome to Nexora, bro!</h2>
                <div className="space-y-3 text-left">
                  <p className="text-blue-900/70 text-sm font-medium">
                    Creating an account is the first step to a better you. Here's why it's important:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-xs text-blue-900/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                      <span><strong>Save Your Progress:</strong> Never lose your streaks or trophies. Your data is safely synced to the cloud.</span>
                    </li>
                    <li className="flex gap-2 text-xs text-blue-900/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                      <span><strong>Personalized Flow:</strong> We tailor your daily challenges to your specific goals and lifestyle.</span>
                    </li>
                    <li className="flex gap-2 text-xs text-blue-900/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                      <span><strong>Multi-Device Sync:</strong> Access your flow companion from any device, anywhere, anytime.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button 
                onClick={nextStep} 
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className={`btn-primary w-full flex justify-center items-center gap-2 transition-all duration-300 ${buttonPulse ? 'scale-105 shadow-blue-500/50' : ''}`}
              >
                Continue <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Name */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-2">
                <User size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">What should we call you?</h2>
                <p className="text-blue-900/60 text-sm">Enter your name or a nickname.</p>
                <p className="text-blue-900/50 text-xs mt-2">We want to make your experience as personal as possible. Your mascot will use this name to cheer you on and celebrate your daily victories!</p>
              </div>
              
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name" 
                className="w-full p-4 rounded-xl border-2 border-blue-100 focus:border-blue-500 outline-none text-xl text-center font-bold text-blue-900 bg-white/50"
                autoFocus
              />

              <div className="w-full flex flex-col gap-3">
                {name.trim() ? (
                  <button 
                    onClick={nextStep} 
                    onMouseEnter={() => handleButtonHover(true)}
                    onMouseLeave={() => handleButtonHover(false)}
                    className={`btn-primary w-full flex justify-center items-center gap-2 transition-all duration-300 ${buttonPulse ? 'scale-105 shadow-blue-500/50' : ''}`}
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={nextStep} 
                    onMouseEnter={() => handleButtonHover(true)}
                    onMouseLeave={() => handleButtonHover(false)}
                    className={`w-full py-4 text-blue-900/40 font-bold hover:text-blue-900/60 transition-colors ${buttonPulse ? 'scale-105' : ''}`}
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Gender */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">What is your gender?</h2>
                <p className="text-blue-900/60 text-sm">This helps us personalize your experience.</p>
                <p className="text-blue-900/50 text-xs mt-2">Knowing a bit more about you allows us to tailor your health and fitness baselines. Don't worry, you can always skip this step if you prefer not to say.</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                {["Male", "Female", "Other", "I don't know or I don't want to talk about it"].map((option) => (
                  <button 
                    key={option}
                    onClick={() => {
                      vibrate(10);
                      setGender(option);
                    }}
                    className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${gender === option ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-blue-100 bg-white/50 text-blue-900/70 hover:border-blue-300'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="w-full flex flex-col gap-3 mt-4">
                {gender ? (
                  <button 
                    onClick={nextStep} 
                    onMouseEnter={() => handleButtonHover(true)}
                    onMouseLeave={() => handleButtonHover(false)}
                    className={`btn-primary w-full flex justify-center items-center gap-2 transition-all duration-300 ${buttonPulse ? 'scale-105 shadow-blue-500/50' : ''}`}
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={nextStep} 
                    onMouseEnter={() => handleButtonHover(true)}
                    onMouseLeave={() => handleButtonHover(false)}
                    className={`w-full py-4 text-blue-900/40 font-bold hover:text-blue-900/60 transition-colors ${buttonPulse ? 'scale-105' : ''}`}
                  >
                    Skip
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Source */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-2">
                <Globe size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">Where did you hear about us?</h2>
                <p className="text-blue-900/50 text-xs mt-2">Letting us know how you found Nexora helps us reach more people just like you!</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                {["YouTube", "Reddit", "Friends", "Google", "Others"].map((option) => (
                  <button 
                    key={option}
                    onClick={() => {
                      vibrate(10);
                      setSource(option);
                    }}
                    className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${source === option ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-blue-100 bg-white/50 text-blue-900/70 hover:border-indigo-300'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="w-full flex flex-col gap-3 mt-4">
                {source ? (
                  <button 
                    onClick={nextStep} 
                    className="btn-primary w-full flex justify-center items-center gap-2"
                  >
                    Continue <ChevronRight size={20} />
                  </button>
                ) : (
                  <button onClick={nextStep} className="w-full py-4 text-blue-900/40 font-bold">Skip</button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 5: Work Type (NEW) */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-7"
            >
              <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-2">
                <Briefcase size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">What's your typical day?</h2>
                <p className="text-blue-900/50 text-xs">This helps us time your reminders perfectly, bro.</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                {[
                  { id: 'desk', label: 'Desk Bound (Office/Home)', desc: 'High focus sessions' },
                  { id: 'active', label: 'On the Move (Active)', desc: 'Field work or physical' },
                  { id: 'student', label: 'Student Life (Hybrid)', desc: 'Mix of sitting and movement' },
                  { id: 'night', label: 'Night Shift (Late)', desc: 'Reverse schedule' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => {
                      vibrate(10);
                      setWorkType(option.id);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${workType === option.id ? 'border-slate-500 bg-slate-50' : 'border-blue-100 bg-white/50 hover:border-slate-300'}`}
                  >
                    <p className={`font-black uppercase text-[10px] tracking-widest ${workType === option.id ? 'text-slate-600' : 'text-blue-900/40'}`}>{option.label}</p>
                    <p className="text-xs font-bold text-blue-900 mt-0.5">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="w-full mt-2">
                <button 
                  onClick={nextStep} 
                  disabled={!workType}
                  className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  Analyze Schedule <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: Peak Energy (NEW) */}
          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-7"
            >
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-2">
                <Zap size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">Peak Energy Pulse?</h2>
                <p className="text-blue-900/50 text-xs">When do you feel most unstoppable?</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 w-full">
                {[
                  { id: 'morning', label: 'Morning Lark', icon: '🌅' },
                  { id: 'midday', label: 'Mid-day Warrior', icon: '☀️' },
                  { id: 'night', label: 'Night Owl', icon: '🌙' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => {
                      vibrate(10);
                      setEnergyPeak(option.id);
                    }}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${energyPeak === option.id ? 'border-yellow-500 bg-yellow-50 shadow-lg shadow-yellow-100' : 'border-blue-100 bg-white/50'}`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className={`font-black uppercase tracking-widest text-sm ${energyPeak === option.id ? 'text-yellow-700' : 'text-blue-900/40'}`}>{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="w-full mt-4">
                <button 
                  onClick={nextStep} 
                  disabled={!energyPeak}
                  className="bg-yellow-500 text-white font-black py-4 px-8 rounded-2xl w-full flex justify-center items-center gap-2 hover:bg-yellow-600 transition-all disabled:opacity-50"
                >
                  Log Pulse <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: Priority Focus (NEW) */}
          {step === 7 && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-7"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                <Brain size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">Core Objective?</h2>
                <p className="text-blue-900/50 text-xs">Choose your primary nexus for this month.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { id: 'physical', label: 'Body Power', color: 'bg-orange-500' },
                  { id: 'mental', label: 'Mind Flow', color: 'bg-blue-500' },
                  { id: 'stress', label: 'Stress Armor', color: 'bg-emerald-500' },
                  { id: 'habit', label: 'Habit Pure', color: 'bg-indigo-500' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => {
                      vibrate(10);
                      setPriorityFocus(option.id);
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-[24px] border-4 transition-all aspect-square ${priorityFocus === option.id ? 'border-purple-500 bg-purple-50 scale-105 shadow-xl shadow-purple-100' : 'border-blue-50 bg-white/50 opacity-60'}`}
                  >
                    <div className={`w-3 h-3 rounded-full mb-3 ${option.color}`} />
                    <span className="font-black uppercase tracking-tighter text-[11px] text-blue-900">{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="w-full mt-4">
                <button 
                  onClick={nextStep} 
                  disabled={!priorityFocus}
                  className="bg-purple-600 text-white font-black py-4 px-8 rounded-2xl w-full flex justify-center items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50"
                >
                  Finalize Target <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 8: Water Goal */}
          {step === 8 && (
            <motion.div 
              key="step8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-16 h-16 bg-cyan-100 text-cyan-500 rounded-full flex items-center justify-center mb-2">
                <Droplets size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">Daily Water Goal</h2>
                <p className="text-blue-900/60 text-sm">How many liters of water do you want to drink daily? (You can change this later)</p>
                <p className="text-blue-900/50 text-xs mt-2 bg-cyan-50 p-3 rounded-lg border border-cyan-100">Did you know? Staying properly hydrated improves your focus, boosts your energy levels, and keeps your skin healthy. We recommend starting with at least 2 liters a day!</p>
              </div>
              
              <div className="flex items-center justify-center gap-4 w-full">
                <button 
                  onClick={() => setWater(Math.max(1, water - 1))}
                  className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 font-black text-xl flex items-center justify-center hover:bg-cyan-200"
                >
                  -
                </button>
                <div className="text-5xl font-black text-cyan-600 w-24 text-center">
                  {water}L
                </div>
                <button 
                  onClick={() => setWater(water + 1)}
                  className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 font-black text-xl flex items-center justify-center hover:bg-cyan-200"
                >
                  +
                </button>
              </div>

              <div className="w-full flex flex-col gap-3 mt-4">
                <button 
                  onClick={nextStep} 
                  onMouseEnter={() => handleButtonHover(true)}
                  onMouseLeave={() => handleButtonHover(false)}
                  className={`bg-cyan-500 text-white py-4 px-6 rounded-xl font-black shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all w-full flex justify-center items-center gap-2 ${buttonPulse ? 'scale-105 shadow-cyan-500/50' : ''}`}
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 9: Pushups Goal */}
          {step === 9 && (
            <motion.div 
              key="step9"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-2">
                <Flame size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">Daily Push-up Goal</h2>
                <p className="text-blue-900/60 text-sm">How many push-ups do you want to do daily? (You can change this later)</p>
                <p className="text-blue-900/50 text-xs mt-2 bg-orange-50 p-3 rounded-lg border border-orange-100">Consistency is key! Even doing just 5 push-ups every single day builds incredible discipline and foundational strength over time. Start small and grow strong.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {[1, 5, 10, 20].map((num) => (
                  <button 
                    key={num}
                    onClick={() => setPushups(num)}
                    className={`p-4 rounded-xl border-2 font-black text-xl transition-all ${pushups === num ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-orange-100 bg-white/50 text-orange-900/40 hover:border-orange-300'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="w-full flex flex-col gap-3 mt-4">
                <button 
                  onClick={nextStep} 
                  onMouseEnter={() => handleButtonHover(true)}
                  onMouseLeave={() => handleButtonHover(false)}
                  className={`bg-orange-500 text-white py-4 px-6 rounded-xl font-black shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all w-full flex justify-center items-center gap-2 ${buttonPulse ? 'scale-105 shadow-orange-500/50' : ''}`}
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 10: Commitment Level (NEW) */}
          {step === 10 && (
            <motion.div 
              key="step10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-7"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-2">
                <Flame size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">Your Commitment?</h2>
                <p className="text-blue-900/50 text-xs">How hard do you want your mascot to push you?</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                {[
                  { id: 'casual', label: 'Casual', desc: '1-2 challenges/day • Relaxed pace', color: 'bg-rose-400' },
                  { id: 'consistent', label: 'Consistent', desc: '3-4 challenges/day • Solid progress', color: 'bg-rose-600' },
                  { id: 'intense', label: 'Intense', desc: 'Expert flow • Maximum growth', color: 'bg-rose-800' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => {
                      vibrate(10);
                      setCommitmentLevel(option.id as any);
                    }}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${commitmentLevel === option.id ? 'border-rose-500 bg-rose-50' : 'border-blue-100 bg-white/50 hover:border-rose-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <div>
                        <p className={`font-black uppercase text-xs tracking-widest ${commitmentLevel === option.id ? 'text-rose-700' : 'text-blue-900/40'}`}>{option.label}</p>
                        <p className="text-xs font-bold text-blue-900 mt-0.5">{option.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="w-full mt-2">
                 <p className="text-[10px] text-blue-900/40 font-bold mb-4 italic">
                  * This data allows your mascot to calculate the perfect difficulty level for your daily journey.
                </p>
                <button 
                  onClick={nextStep} 
                  className="btn-primary w-full flex justify-center items-center gap-2"
                >
                  Set Commitment <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 11: Notifications */}
          {step === 11 && (
            <motion.div 
              key="step11"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-6 p-4"
            >
              <AnimatedBell />
              
              <div className="space-y-6 text-blue-900 mt-8">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-3xl font-black leading-tight"
                >
                  Stay Consistent with Smart Notifications
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-lg font-medium text-blue-900/80"
                >
                  Nexora uses AI to nudge you at the exact moment you're most likely to take action.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="space-y-4 text-left text-blue-900/70"
                >
                  <p>Your personalized notification system includes:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <li className="flex gap-2"><strong>🔔 Smart Reminders:</strong> timed to your energy peaks.</li>
                    <li className="flex gap-2"><strong>🏆 Streak Shield:</strong> alerts when progress is at risk.</li>
                    <li className="flex gap-2"><strong>💪 Mascot Nudges:</strong> personalized motivation messages.</li>
                    <li className="flex gap-2"><strong>🚀 Adaptive Hub:</strong> notification frequency scales with your commitment.</li>
                  </ul>
                </motion.div>
              </div>

              <div className="w-full flex flex-col gap-3 mt-6">
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  onClick={async () => {
                    await setupFCM();
                    nextStep();
                  }}
                  className="btn-primary w-full py-4 text-lg font-bold"
                >
                  Enable Smart Alerts
                </motion.button>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                  onClick={nextStep}
                  className="w-full py-4 text-blue-900/50 font-bold hover:text-blue-900/70 transition-colors"
                >
                  Skip for now
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 12: Creating Plan */}
          {step === 12 && (
            <motion.div 
              key="step12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="glass-card p-12 flex flex-col items-center text-center space-y-6"
            >
              <Loader2 size={48} className="text-blue-500 animate-spin" />
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-blue-900">Synchronizing Nexus Intelligence...</h2>
                <div className="space-y-2">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                    className="text-xs font-black text-blue-500 uppercase tracking-widest"
                  >
                    Calibrating {commitmentLevel || 'Consistent'} intensity...
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, times: [0, 0.5, 1] }}
                    className="text-xs font-black text-blue-500 uppercase tracking-widest"
                  >
                    Mapping {energyPeak || 'Midday'} energy peaks to {water}L goal...
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1, times: [0, 0.5, 1] }}
                    className="text-xs font-black text-blue-500 uppercase tracking-widest"
                  >
                    Syncing {priorityFocus || 'Mind'} focus with mascot memory...
                  </motion.p>
                </div>
                <p className="text-blue-900/50 text-[10px] mt-4 uppercase font-bold tracking-tight">Your data makes Nexora 4x more effective at building lasting habits.</p>
              </div>
            </motion.div>
          )}

          {/* STEP 13: Thanks */}
          {step === 13 && (
            <motion.div 
              key="step13"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 flex flex-col items-center text-center space-y-8"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2"
              >
                <Sparkles size={48} />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-blue-900">Thanks for joining us!</h2>
                <p className="text-blue-900/60">Your journey starts today. Let's crush those goals!</p>
                <p className="text-blue-900/50 text-xs mt-2">Your mascot is excited to meet you. Remember, building habits takes time, so be kind to yourself and take it one day at a time. Let's go!</p>
              </div>
              
              <button 
                onClick={() => handleContinueClick(handleComplete)} 
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className={`bg-emerald-500 text-white py-4 px-8 rounded-xl font-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all w-full flex justify-center items-center gap-2 text-lg ${buttonPulse ? 'scale-105 shadow-emerald-500/50' : ''}`}
              >
                Let's Go! <CheckCircle2 size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
