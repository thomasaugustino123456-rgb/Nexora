import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Droplets, Flame, User, Globe, Sparkles, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserSettings } from '../types';
import { vibrate } from '../lib/vibrate';

interface OnboardingProps {
  onComplete: () => void;
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  setupFCM: () => Promise<void>;
}

export function OnboardingScreen({ onComplete, settings, setSettings, setupFCM }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [source, setSource] = useState('');
  const [water, setWater] = useState<number>(2);
  const [pushups, setPushups] = useState<number>(5);
  const [isHoveringContinue, setIsHoveringContinue] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);

  const totalSteps = 9;

  useEffect(() => {
    if (step === 8) {
      // Simulate plan creation
      const timer = setTimeout(() => {
        setStep(9);
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
    if (step > 1 && step < 8) {
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
      {step < 7 && (
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
                <p className="text-blue-900/50 text-xs mt-2">We are constantly trying to grow our amazing community of habit-builders. Letting us know how you found Nexora helps us reach more people just like you!</p>
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

          {/* STEP 5: Water Goal */}
          {step === 5 && (
            <motion.div 
              key="step5"
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

          {/* STEP 6: Pushups Goal */}
          {step === 6 && (
            <motion.div 
              key="step6"
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

          {/* STEP 7: Notifications */}
          {step === 7 && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-8"
            >
              <motion.img 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src="https://i.postimg.cc/Hk3hzChG/Nexora-app-notifications-on-display-removebg-preview.png"
                alt="Notifications"
                className="w-48 h-48 object-contain"
              />
              
              <div className="space-y-4">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-2xl font-black text-blue-900"
                >
                  Stay in the loop, bro!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="text-blue-900/60 text-sm"
                >
                  Enable notifications to get daily challenges, motivation, and streak updates. Never miss a beat!
                </motion.p>
              </div>

              <div className="w-full flex flex-col gap-3 mt-4">
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  onClick={async () => {
                    await setupFCM();
                    nextStep();
                  }}
                  className="btn-primary w-full flex justify-center items-center gap-2"
                >
                  Enable Notifications
                </motion.button>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  onClick={nextStep}
                  className="w-full py-4 text-blue-900/40 font-bold hover:text-blue-900/60 transition-colors"
                >
                  Skip
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 8: Creating Plan */}
          {step === 8 && (
            <motion.div 
              key="step8"
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

          {/* STEP 9: Thanks */}
          {step === 9 && (
            <motion.div 
              key="step9"
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
