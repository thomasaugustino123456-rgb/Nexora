import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Droplets, Flame, User, Globe, Sparkles, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserSettings } from '../types';
import { WritingMascot } from './WritingMascot';

interface OnboardingProps {
  onComplete: () => void;
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
}

export function OnboardingScreen({ onComplete, settings, setSettings }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [source, setSource] = useState('');
  const [water, setWater] = useState<number>(2);
  const [pushups, setPushups] = useState<number>(5);
  const [isHoveringContinue, setIsHoveringContinue] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);

  useEffect(() => {
    // Reset waiting state on step change
    setIsWaiting(false);
    
    // Idle timer for mascot attention
    const idleTimer = setTimeout(() => {
      setIsWaiting(true);
    }, 5000);

    return () => clearTimeout(idleTimer);
  }, [step, isHoveringContinue]);

  useEffect(() => {
    if (step === 6) {
      // Simulate plan creation
      const timer = setTimeout(() => {
        setStep(7);
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
    updates.waterGoal = water;
    updates.pushupsGoal = pushups;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
      
      setSettings({
        ...settings,
        displayName: name.trim() || settings.displayName,
        waterGoal: water,
        pushupsGoal: pushups
      });
      
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      // Fallback to complete anyway so user isn't stuck
      onComplete();
    }
  };

  const handleContinueClick = (action: () => void) => {
    setIsHappy(true);
    setShowGlow(true);
    setTimeout(() => {
      setIsHappy(false);
      setShowGlow(false);
      action();
    }, 600);
  };

  const handleButtonHover = (isHovering: boolean) => {
    setIsHoveringContinue(isHovering);
    if (isHovering) {
      setIsJumping(true);
      setButtonPulse(true);
      setTimeout(() => {
        setIsJumping(false);
        setButtonPulse(false);
      }, 400);
    }
  };

  const nextStep = () => handleContinueClick(() => setStep(prev => prev + 1));

  const handleBack = async () => {
    if (step > 1 && step < 6) {
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
      {step < 6 && (
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
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              delay: 0.5 
            }}
            className="w-48 h-48 drop-shadow-xl"
          >
            <WritingMascot 
              isLookingAtButton={isHoveringContinue} 
              isHappy={isHappy}
              isWaving={step === 1}
              isWaiting={isWaiting}
              isJumping={isJumping}
              showGlow={showGlow}
            />
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs font-bold text-blue-900/40 uppercase tracking-widest">
            <span>Step {step} of 7</span>
            <span>{Math.round((step / 7) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 7) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Name */}
          {step === 1 && (
            <motion.div 
              key="step1"
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

          {/* STEP 2: Gender */}
          {step === 2 && (
            <motion.div 
              key="step2"
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
                    onClick={() => setGender(option)}
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

          {/* STEP 3: Source */}
          {step === 3 && (
            <motion.div 
              key="step3"
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
                <p className="text-blue-900/50 text-xs mt-2">We are constantly trying to grow our amazing community of habit-builders. Letting us know how you found Nexora helps us reach more people just like you!</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                {["YouTube", "Reddit", "Friends", "Google", "Others"].map((option) => (
                  <button 
                    key={option}
                    onClick={() => setSource(option)}
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
                    onMouseEnter={() => handleButtonHover(true)}
                    onMouseLeave={() => handleButtonHover(false)}
                    className={`bg-indigo-500 text-white py-4 px-6 rounded-xl font-black shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all w-full flex justify-center items-center gap-2 ${buttonPulse ? 'scale-105 shadow-indigo-500/50' : ''}`}
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

          {/* STEP 4: Water Goal */}
          {step === 4 && (
            <motion.div 
              key="step4"
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

          {/* STEP 5: Pushups Goal */}
          {step === 5 && (
            <motion.div 
              key="step5"
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

          {/* STEP 6: Creating Plan */}
          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="glass-card p-12 flex flex-col items-center text-center space-y-6"
            >
              <Loader2 size={48} className="text-blue-500 animate-spin" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-blue-900">Creating your plan...</h2>
                <p className="text-blue-900/60 text-sm">Setting up your daily challenges based on your goals.</p>
                <p className="text-blue-900/50 text-xs mt-4">We're preparing your personal dashboard, initializing your mascot, and organizing your daily tasks. Get ready to build some amazing habits!</p>
              </div>
            </motion.div>
          )}

          {/* STEP 7: Thanks */}
          {step === 7 && (
            <motion.div 
              key="step7"
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
