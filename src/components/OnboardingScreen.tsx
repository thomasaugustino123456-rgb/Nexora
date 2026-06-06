import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Droplets, 
  Flame, 
  User, 
  Globe, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft, 
  Briefcase, 
  Zap, 
  Brain,
  ShieldCheck,
  Heart,
  Dumbbell,
  Compass,
  Award,
  Lock,
  FlameKindling
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserSettings } from '../types';
import { vibrate } from '../lib/vibrate';
import nexoraAppIcon from '../assets/images/nexora_app_icon.png';

import { AnimatedBell } from './AnimatedBell';

interface OnboardingProps {
  onComplete: () => void;
  settings: UserSettings;
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  setupFCM: () => Promise<string | null>;
}

export function OnboardingScreen({ onComplete, settings, setSettings, setupFCM }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
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

  const totalSteps = 17;

  useEffect(() => {
    if (step === 16) {
      // Simulate plan creation
      const timer = setTimeout(() => {
        setStep(17);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleComplete = async () => {
    try {
      const user = auth.currentUser;
      const updates: any = { onboardingCompleted: true };
      
      const safeName = (name && typeof name === 'string') ? name.trim() : '';
      updates.displayName = safeName || 'Champion';
      if (age) updates.age = parseInt(age, 10);
      if (gender) updates.gender = gender;
      if (source) updates.source = source;
      if (workType) updates.workType = workType;
      if (energyPeak) updates.energyPeak = energyPeak;
      if (priorityFocus) updates.priorityFocus = priorityFocus;
      if (commitmentLevel) updates.commitmentLevel = commitmentLevel;
      updates.waterGoal = water || 2;
      updates.pushupsGoal = pushups || 5;

      // Filter and pre-archive tasks that do not align with the selected Core Objective focus
      let archivedChallenges: string[] = [];
      if (priorityFocus === 'physical') {
        archivedChallenges = ['breathing', 'drawing', 'bubbles', 'memory', 'meditation', 'gratitude', 'writing'];
      } else if (priorityFocus === 'mental') {
        archivedChallenges = ['pushups', 'water', 'breathing', 'football', 'bubbles', 'reaction', 'gratitude'];
      } else if (priorityFocus === 'stress') {
        archivedChallenges = ['pushups', 'water', 'drawing', 'football', 'memory', 'reaction', 'writing'];
      } else if (priorityFocus === 'habit') {
        archivedChallenges = ['drawing', 'football', 'bubbles', 'reaction', 'memory', 'meditation', 'writing'];
      } else {
        archivedChallenges = [];
      }
      updates.archivedOfficialChallenges = archivedChallenges;

      if (user) {
        updates.uid = user.uid;
        updates.email = user.email || `${user.uid}@nexora.app`;
        updates.role = 'user';

        setDoc(doc(db, 'users', user.uid), updates, { merge: true }).catch(err => {
          console.error("Firestore update failed behind scenes:", err);
        });
      }
      
      setSettings(prev => ({
        ...prev,
        displayName: safeName || prev.displayName,
        age: age ? parseInt(age, 10) : prev.age,
        waterGoal: water || 2,
        pushupsGoal: pushups || 5,
        priorityFocus: priorityFocus || prev.priorityFocus,
        archivedOfficialChallenges: archivedChallenges,
        onboardingCompleted: true,
        workType: workType || prev.workType,
        energyPeak: energyPeak || prev.energyPeak,
        commitmentLevel: commitmentLevel || prev.commitmentLevel
      }));

    } catch (error) {
      console.error("Critical error in handleComplete:", error);
    } finally {
      console.log("Forcing onComplete");
      onComplete();
    }
  };

  const handleContinueClick = (action: () => void) => {
    vibrate(12);
    action();
  };

  const handleButtonHover = (isHovering: boolean) => {
    setIsHoveringContinue(isHovering);
    if (isHovering) {
      vibrate(5);
      setButtonPulse(true);
      setTimeout(() => {
        setButtonPulse(false);
      }, 450);
    }
  };

  const nextStep = () => handleContinueClick(() => setStep(prev => prev + 1));

  const handleBack = async () => {
    vibrate(10);
    if (step > 1 && step < 16) {
      setStep(prev => prev - 1);
    } else if (step === 1) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  // Helper to determine active background or border effects
  const accentColor = "#69C496";

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4F3F34] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden transition-colors duration-500">
      
      {/* Decorative Warm Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#69C496]/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#BACBBF]/15 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] bg-[#7D6B58]/4 rounded-full blur-[80px]" />
      </div>

      {/* Back Button */}
      {step < 16 && (
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 p-3 rounded-full bg-white border border-[#E9E4D4] text-[#7D6B58] hover:bg-[#FAF7F2] hover:text-[#4F3F34] hover:scale-105 active:scale-95 transition-all z-20 shadow-sm flex items-center justify-center cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {/* Progress Floating Header */}
      <div className="w-full max-w-lg z-10 space-y-4 mb-4">
        {/* Mascot Frame */}
        {step < 16 && (
          <div className="flex justify-center">
            <motion.div 
              initial={{ y: -25, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 280, 
                damping: 20
              }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-white border border-[#E9E4D4] rounded-full shadow-md overflow-hidden p-2 bg-gradient-to-tr from-white to-[#FAF7F2]"
            >
              <img 
                src={nexoraAppIcon} 
                alt="Nexora Mascot" 
                className="w-full h-full object-cover rounded-full shadow-inner"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute -bottom-1.5 px-3 py-0.5 rounded-full bg-[#69C496] border border-white text-white text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                Nexy Ally
              </div>
            </motion.div>
          </div>
        )}

        {/* Progress Bar with modern bento feel */}
        <div className="space-y-1.5 px-1 sm:px-4">
          <div className="flex justify-between text-[10px] font-black text-[#7D6B58]/70 uppercase tracking-widest">
            <span>Rhythm Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2.5 w-full bg-white border border-[#E9E4D4] rounded-full overflow-hidden p-[2px] shadow-sm">
            <motion.div 
              className="h-full bg-[#69C496] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg z-10 px-1 sm:px-4">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Welcome & Significance (Polished Redesign) */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl shadow-[#4F3F34]/3"
            >
              <div className="w-16 h-16 bg-[#69C496]/10 text-[#69C496] rounded-full flex items-center justify-center border border-[#69C496]/20">
                <Sparkles size={28} className="animate-pulse" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black text-[#4F3F34] leading-tight tracking-tight">
                  Welcome to <span className="text-[#69C496] bg-[#69C496]/5 px-2.5 py-0.5 rounded-xl border border-[#69C496]/15">Nexora</span>, bro!
                </h2>
                <p className="text-[#7D6B58] text-sm font-medium px-4">
                  Let's design your day and sync your rhythm. Creating an account is the ultimate step to stay locked in:
                </p>
              </div>

              <div className="w-full bg-[#FFFDF9]/60 border border-[#E9E4D4]/80 rounded-2xl p-5 text-left space-y-4 shadow-inner">
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#69C496]/20 text-[#69C496] flex items-center justify-center shrink-0 text-xs font-black">1</div>
                  <div>
                    <h4 className="text-xs font-black text-[#4F3F34] uppercase tracking-wider">Save Your Progress</h4>
                    <p className="text-xs text-[#7D6B58] font-medium">Never lose streak multiplier milestones or custom achievements. Backed up safely.</p>
                  </div>
                </div>
                <div className="flex gap-3.5 items-start border-t border-[#E9E4D4]/50 pt-3">
                  <div className="w-6 h-6 rounded-full bg-[#69C496]/20 text-[#69C496] flex items-center justify-center shrink-0 text-xs font-black">2</div>
                  <div>
                    <h4 className="text-xs font-black text-[#4F3F34] uppercase tracking-wider">Personalized Energy Target</h4>
                    <p className="text-xs text-[#7D6B58] font-medium">Tailors daily micro-quests directly to your natural biorhythms and schedule constraints.</p>
                  </div>
                </div>
                <div className="flex gap-3.5 items-start border-t border-[#E9E4D4]/50 pt-3">
                  <div className="w-6 h-6 rounded-full bg-[#69C496]/20 text-[#69C496] flex items-center justify-center shrink-0 text-xs font-black">3</div>
                  <div>
                    <h4 className="text-xs font-black text-[#4F3F34] uppercase tracking-wider">Passive Mascot Synthesis</h4>
                    <p className="text-xs text-[#7D6B58] font-medium">Your interactive buddy acts as an accountability partner, reacting dynamically to consistency.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={nextStep} 
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496] hover:bg-[#5bb385] text-white py-4 rounded-2xl shadow-lg shadow-[#69C496]/20 transition-all font-black text-sm uppercase tracking-widest mt-2"
              >
                Let's Formulate <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: How Nexora Helps (NEW) */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl shadow-[#4F3F34]/3"
            >
              <div className="w-16 h-16 bg-[#BACBBF]/25 text-[#4F3F34] rounded-full flex items-center justify-center border border-[#E9E4D4]">
                <Compass size={28} className="text-[#69C496]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] leading-tight tracking-tight uppercase">
                  How Nexora Helps You
                </h2>
                <p className="text-[#7D6B58] text-xs font-medium px-2">
                  Building lasting habits requires systems, not just motivation. Here is how Nexora assists you every day:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="p-4 rounded-2xl border border-[#E9E4D4] bg-[#FFFDF9] text-left space-y-2">
                  <div className="p-2 w-fit bg-[#BACBBF]/20 rounded-lg text-[#4F3F34]">
                    <Zap size={16} />
                  </div>
                  <h4 className="text-[11px] font-black text-[#4F3F34] uppercase tracking-widest">Micro-Metrics</h4>
                  <p className="text-[10px] text-[#7D6B58] leading-normal font-medium">Tracks hydration volume and physical power prompts throughout your busy work hours.</p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E9E4D4] bg-[#FFFDF9] text-left space-y-2">
                  <div className="p-2 w-fit bg-[#69C496]/20 rounded-lg text-[#69C496]">
                    <Brain size={16} />
                  </div>
                  <h4 className="text-[11px] font-black text-[#4F3F34] uppercase tracking-widest">Cognitive State</h4>
                  <p className="text-[10px] text-[#7D6B58] leading-normal font-medium">Brings mental clarity with breathing cadences and short gratitude logging workflows.</p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E9E4D4] bg-[#FFFDF9] text-left space-y-2">
                  <div className="p-2 w-fit bg-orange-100 rounded-lg text-orange-600">
                    <Dumbbell size={16} />
                  </div>
                  <h4 className="text-[11px] font-black text-[#4F3F34] uppercase tracking-widest">Growth Loop</h4>
                  <p className="text-[10px] text-[#7D6B58] leading-normal font-medium">Your activity translates into Volt power, fueling your garden flora and level evolution.</p>
                </div>

                <div className="p-4 rounded-2xl border border-[#E9E4D4] bg-[#FFFDF9] text-left space-y-2">
                  <div className="p-2 w-fit bg-red-100 rounded-lg text-red-600">
                    <FlameKindling size={16} />
                  </div>
                  <h4 className="text-[11px] font-black text-[#4F3F34] uppercase tracking-widest">High Energy</h4>
                  <p className="text-[10px] text-[#7D6B58] leading-normal font-medium">Dynamically syncs difficulty levels based on the rhythm goals you define next.</p>
                </div>
              </div>

              <button 
                onClick={nextStep}
                className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496] hover:bg-[#5bb385] text-white py-4 rounded-2xl shadow-lg shadow-[#69C496]/15 transition-all font-black text-sm uppercase tracking-widest"
              >
                Learn More <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 3: Ironclad Privacy (NEW) */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl shadow-[#4F3F34]/3"
            >
              <div className="w-16 h-16 bg-[#69C496]/10 text-[#69C496] rounded-full flex items-center justify-center border border-[#69C496]/20">
                <ShieldCheck size={28} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] leading-tight tracking-tight uppercase">
                  Ironclad Privacy Guarantee
                </h2>
                <p className="text-[#7D6B58] text-xs font-medium px-2">
                  Your daily life is private. That’s why privacy is baked into the foundation of Nexora:
                </p>
              </div>

              <div className="w-full space-y-3.5">
                <div className="flex items-center gap-3 p-4 bg-[#FFFDF9] border border-[#E9E4D4] rounded-2xl text-left">
                  <div className="p-2.5 bg-green-50 text-[#69C496] rounded-xl shrink-0">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#4F3F34] uppercase tracking-wider">Zero Scraping or Telemetry</h4>
                    <p className="text-[10px] text-[#7D6B58] leading-tight mt-0.5 font-medium">None of your wellness tallies, personal thoughts, or routine structures are ever shared or monetized.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#FFFDF9] border border-[#E9E4D4] rounded-2xl text-left">
                  <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#4F3F34] uppercase tracking-wider">Secure Encrypted Key</h4>
                    <p className="text-[10px] text-[#7D6B58] leading-tight mt-0.5 font-medium">Your logs are written on your sovereign Firestore profile instance, secured via military-grade client rules.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#FFFDF9] border border-[#E9E4D4] rounded-2xl text-left">
                  <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl shrink-0">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#4F3F34] uppercase tracking-wider">Offline State Synchronization</h4>
                    <p className="text-[10px] text-[#7D6B58] leading-tight mt-0.5 font-medium">Sync with complete peace of mind. All active tracking metrics remain locally stored on your machine first.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={nextStep}
                className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496] hover:bg-[#5bb385] text-white py-4 rounded-2xl shadow-lg shadow-[#69C496]/15 transition-all font-black text-sm uppercase tracking-widest"
              >
                Sync Safely <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 4: Mascot Partnership (NEW) */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl shadow-[#4F3F34]/3"
            >
              <div className="w-16 h-16 bg-pink-100 text-[#4F3F34] rounded-full flex items-center justify-center border border-pink-200">
                <Heart size={28} className="text-pink-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] leading-tight tracking-tight uppercase">
                  Meet Your Mascot Ally
                </h2>
                <p className="text-[#7D6B58] text-xs font-medium px-2">
                  Nexy is not just an illustration. It is custom-linked to your personal daily frequency:
                </p>
              </div>

              <div className="space-y-4 text-left bg-[#FFFDF9]/60 border border-[#E9E4D4] rounded-2xl p-5 shadow-inner">
                <ul className="space-y-3">
                  <li className="flex gap-2.5 text-xs text-[#7D6B58] font-semibold items-start">
                    <div className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                    <span><strong>Mood Reactivity:</strong> Nexy smiles when you check in early, but will start tapping its foot or looking anxious if you drift past your target hours.</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-[#7D6B58] font-semibold items-start border-t border-[#E9E4D4]/40 pt-2.5">
                    <div className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                    <span><strong>Evolution Growth:</strong> As you achieve streaks, Nexy helps feed your seedling tree in the background garden – watch it transform!</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-[#7D6B58] font-semibold items-start border-t border-[#E9E4D4]/40 pt-2.5">
                    <div className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                    <span><strong>Discipline Vault:</strong> Collect gold tokens and badges as you prove your daily focus.</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={nextStep}
                className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496] hover:bg-[#5bb385] text-white py-4 rounded-2xl shadow-lg shadow-[#69C496]/15 transition-all font-black text-sm uppercase tracking-widest animate-bounce"
              >
                Let's Start Customizing! <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 5: Name (original Step 2) */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl shadow-[#4F3F34]/3"
            >
              <div className="w-16 h-16 bg-[#69C496]/10 text-[#69C496] rounded-full flex items-center justify-center border border-[#69C496]/20">
                <User size={28} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">What should we call you?</h2>
                <p className="text-[#7D6B58] text-xs font-semibold">Enter your name or a favorite moniker, bro.</p>
                <p className="text-[#7D6B58]/60 text-[11px] mt-1 italic">Nexy will use this name to celebrate your victories and keep your daily streak stats personal!</p>
              </div>
              
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Thomas, Champ" 
                className="w-full p-4 rounded-2xl border-2 border-[#E9E4D4] focus:border-[#69C496] focus:ring-1 focus:ring-[#69C496] outline-none text-xl text-center font-bold text-[#4F3F34] bg-[#FFFDF9]/60 placeholder-[#7D6B58]/40 transition-all font-sans"
                autoFocus
              />

              <div className="w-full flex flex-col gap-2.5">
                {name.trim() ? (
                  <button 
                    onClick={nextStep} 
                    onMouseEnter={() => handleButtonHover(true)}
                    onMouseLeave={() => handleButtonHover(false)}
                    className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={nextStep} 
                    className="w-full py-3.5 text-[#7D6B58]/60 hover:text-[#4F3F34] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 6: Age choice and typing (NEW) */}
          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl shadow-[#4F3F34]/3"
            >
              <div className="w-16 h-16 bg-[#69C496]/10 text-[#69C496] rounded-full flex items-center justify-center border border-[#69C496]/20 animate-pulse">
                <Sparkles size={28} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">How old are you, bro?</h2>
                <p className="text-[#7D6B58] text-xs font-semibold">Choose your age group or type your exact age below.</p>
                <p className="text-[#7D6B58]/60 text-[10px] mt-1 italic font-semibold leading-relaxed">
                  * This customizes daily challenge workloads, metabolic baseline frequencies, and mascot interaction intensity!
                </p>
              </div>

              {/* Age Predetermined Quick-Select Option Chips */}
              <div className="w-full grid grid-cols-2 gap-2 mt-1">
                {[
                  { label: "Teen (13-19)", value: "17" },
                  { label: "Young Adult (20-29)", value: "24" },
                  { label: "Adult (30-44)", value: "33" },
                  { label: "Senior/Elite (45+)", value: "50" }
                ].map((chip) => {
                  const isMatch = age !== "" && (
                    (chip.label.includes("13-19") && Number(age) >= 13 && Number(age) <= 19) ||
                    (chip.label.includes("20-29") && Number(age) >= 20 && Number(age) <= 29) ||
                    (chip.label.includes("30-44") && Number(age) >= 30 && Number(age) <= 44) ||
                    (chip.label.includes("45+") && Number(age) >= 45)
                  );
                  return (
                    <button
                      key={chip.label}
                      onClick={() => {
                        vibrate(10);
                        setAge(chip.value);
                      }}
                      className={`p-3 rounded-2xl border-2 text-center font-black transition-all text-xs uppercase tracking-wider cursor-pointer ${isMatch ? 'border-[#69C496] bg-[#69C496]/5 text-[#4F3F34]' : 'border-[#E9E4D4] bg-[#FFFDF9]/60 text-[#7D6B58] hover:border-[#69C496]/40'}`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Precise Typeable Age Section */}
              <div className="w-full space-y-1.5 pt-1">
                <span className="text-[10px] font-black uppercase text-[#7D6B58]/60 tracking-widest">Or type your exact age, bro:</span>
                <input 
                  type="number" 
                  value={age}
                  min="5"
                  max="120"
                  onChange={(e) => {
                    const val = e.target.value;
                    setAge(val);
                  }}
                  placeholder="25" 
                  className="w-full p-4 rounded-2xl border-2 border-[#E9E4D4] focus:border-[#69C496] focus:ring-1 focus:ring-[#69C496] outline-none text-2xl text-center font-black text-[#4F3F34] bg-[#FFFDF9]/60 placeholder-[#7D6B58]/35 transition-all font-sans"
                  autoFocus
                />
              </div>

              {/* The "Continue" button appears ONLY when finished selecting or typing */}
              <AnimatePresence>
                {age.trim() !== "" && !isNaN(Number(age)) && Number(age) >= 5 && Number(age) <= 120 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-full mt-2"
                  >
                    <button 
                      onClick={nextStep} 
                      onMouseEnter={() => handleButtonHover(true)}
                      onMouseLeave={() => handleButtonHover(false)}
                      className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496] hover:bg-[#5bb385] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                      Continue <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* STEP 7: Gender (original Step 3) */}
          {step === 7 && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">Your Identity</h2>
                <p className="text-[#7D6B58] text-xs font-semibold">Helps calibrating metabolic hydration profiles.</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                {["Male", "Female", "Other", "Prefer not to mention"].map((option) => (
                  <button 
                    key={option}
                    onClick={() => {
                      vibrate(10);
                      setGender(option);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left font-black transition-all text-xs uppercase tracking-wider cursor-pointer ${gender === option ? 'border-[#69C496] bg-[#69C496]/5 text-[#4F3F34]' : 'border-[#E9E4D4] bg-[#FFFDF9]/60 text-[#7D6B58] hover:border-[#69C496]/40'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="w-full flex flex-col gap-2 mt-2">
                {gender ? (
                  <button 
                    onClick={nextStep} 
                    className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496]"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={nextStep} 
                    className="w-full py-3 text-[#7D6B58]/40 hover:text-[#4F3F34] font-black text-xs uppercase tracking-widest cursor-pointer"
                  >
                    Skip
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 8: Source (original Step 4) */}
          {step === 8 && (
            <motion.div 
              key="step8"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="w-16 h-16 bg-[#BACBBF]/20 text-[#69C496] rounded-full flex items-center justify-center border border-[#E9E4D4]">
                <Globe size={28} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">How did you find us?</h2>
                <p className="text-[#7D6B58]/60 text-[11px] font-semibold">Help Nexora grow and support its server maintenance, bro.</p>
              </div>
              
              <div className="w-full flex flex-col gap-2.5">
                {["YouTube", "Reddit", "Friends & Word of Mouth", "Google Search", "Others / Social Media"].map((option) => (
                  <button 
                    key={option}
                    onClick={() => {
                      vibrate(10);
                      setSource(option);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left font-black transition-all text-xs uppercase tracking-wider cursor-pointer ${source === option ? 'border-[#69C496] bg-[#69C496]/5 text-[#4F3F34]' : 'border-[#E9E4D4] bg-[#FFFDF9]/60 text-[#7D6B58] hover:border-[#69C496]/40'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="w-full flex flex-col gap-2 mt-2">
                {source ? (
                  <button 
                    onClick={nextStep} 
                    className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496]"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                ) : (
                  <button onClick={nextStep} className="w-full py-3 text-[#7D6B58]/40 hover:text-[#4F3F34] font-black text-xs uppercase tracking-widest cursor-pointer">Skip</button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 9: Work Type (original Step 5) */}
          {step === 9 && (
            <motion.div 
              key="step9"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-6 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="w-16 h-16 bg-slate-100/80 text-[#7D6B58] rounded-full flex items-center justify-center border border-[#E9E4D4]">
                <Briefcase size={28} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">Your typical day?</h2>
                <p className="text-[#7D6B58]/60 text-[11px] font-semibold">Tuning hydration reminders to fit perfectly without disruption.</p>
              </div>
              
              <div className="w-full flex flex-col gap-2.5">
                {[
                  { id: 'desk', label: 'Desk Bound (Office/Home)', desc: 'Optimized for high focus and keyboard physical reminders' },
                  { id: 'active', label: 'On the Move (Active)', desc: 'Optimized for dynamic high output hydration targets' },
                  { id: 'student', label: 'Student / Hybrid life', desc: 'Bridges continuous sitting study phases with movement' },
                  { id: 'night', label: 'Night Shift Focus Schedule', desc: 'Reverse circadian patterns, late-night companion logs' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => {
                      vibrate(10);
                      setWorkType(option.id);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${workType === option.id ? 'border-[#69C496] bg-[#69C496]/5' : 'border-[#E9E4D4] bg-[#FFFDF9]/60 hover:border-[#69C496]/30'}`}
                  >
                    <p className={`font-black uppercase text-[10px] tracking-widest ${workType === option.id ? 'text-[#4F3F34]' : 'text-[#7D6B58]/55'}`}>{option.label}</p>
                    <p className="text-[11px] font-bold text-[#7D6B58] mt-0.5 leading-snug">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="w-full mt-2">
                <button 
                  onClick={nextStep} 
                  disabled={!workType}
                  className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496] disabled:opacity-40"
                >
                  Analyze My Habit Schedule <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 10: Peak Energy (original Step 6) */}
          {step === 10 && (
            <motion.div 
              key="step10"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-6 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center border border-amber-150">
                <Zap size={28} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">Peak Energy Pulse?</h2>
                <p className="text-[#7D6B58] text-xs font-semibold">When do you feel most active and focused, bro?</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5 w-full">
                {[
                  { id: 'morning', label: 'Morning Lark Peak', icon: '🌅', subtitle: '6:00 AM - 12:00 PM power zone' },
                  { id: 'midday', label: 'Mid-day Warrior Output', icon: '☀️', subtitle: '12:00 PM - 5:00 PM peak state' },
                  { id: 'night', label: 'Night Owl Focus', icon: '🌙', subtitle: '6:00 PM - Late night inspiration shift' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => {
                      vibrate(10);
                      setEnergyPeak(option.id);
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${energyPeak === option.id ? 'border-amber-500 bg-amber-50/40 shadow-sm' : 'border-[#E9E4D4] bg-[#FFFDF9]/60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-left">
                        <span className={`block font-black uppercase tracking-widest text-[11px] ${energyPeak === option.id ? 'text-amber-800' : 'text-[#4F3F34]'}`}>{option.label}</span>
                        <span className="block text-[10px] text-[#7D6B58] leading-tight font-medium">{option.subtitle}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="w-full mt-4">
                <button 
                  onClick={nextStep} 
                  disabled={!energyPeak}
                  className="bg-amber-500 text-white font-black py-4 px-8 rounded-2xl w-full flex justify-center items-center gap-2 hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10 disabled:opacity-40 cursor-pointer text-xs uppercase tracking-widest"
                >
                  Log Energy Pulse <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 11: Priority Focus Focus (original Step 7) */}
          {step === 11 && (
            <motion.div 
              key="step11"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-6 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="w-16 h-16 bg-purple-100/80 text-purple-600 rounded-full flex items-center justify-center border border-purple-200">
                <Brain size={28} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">Core Objective focus?</h2>
                <p className="text-[#7D6B58] text-xs font-semibold">Select your primary alignment for this month.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { id: 'physical', label: 'Body Power', color: 'bg-orange-500', desc: 'Focus physical workout habits' },
                  { id: 'mental', label: 'Mind Flow', color: 'bg-blue-500', desc: 'Boost cognitive concentration' },
                  { id: 'stress', label: 'Stress Armor', color: 'bg-emerald-500', desc: 'Soothe mental burnout risks' },
                  { id: 'habit', label: 'Habit Pure', color: 'bg-indigo-500', desc: 'Formulate raw daily consistency' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => {
                      vibrate(10);
                      setPriorityFocus(option.id);
                    }}
                    className={`flex flex-col items-center justify-center p-5 rounded-[24px] border-4 transition-all aspect-square cursor-pointer ${priorityFocus === option.id ? 'border-purple-500 bg-purple-50/40 scale-[1.03] shadow-md shadow-purple-500/5' : 'border-[#E9E4D4] bg-[#FFFDF9]/60 opacity-70'}`}
                  >
                    <div className={`w-3 h-3 rounded-full mb-2 ${option.color}`} />
                    <span className="font-black uppercase tracking-tighter text-[11px] text-[#4F3F34] text-center leading-none">{option.label}</span>
                    <span className="text-[9px] text-[#7D6B58] text-center mt-1.5 leading-tight font-medium font-sans">{option.desc}</span>
                  </button>
                ))}
              </div>

              <div className="w-full mt-4 flex flex-col gap-2.5">
                <button 
                  onClick={nextStep} 
                  disabled={!priorityFocus}
                  className="bg-purple-600 text-white font-black py-4 px-8 rounded-2xl w-full flex justify-center items-center gap-2 hover:bg-purple-700 transition-all shadow-md shadow-purple-600/10 disabled:opacity-40 cursor-pointer text-xs uppercase tracking-widest"
                >
                  Finalize Focus Target <ChevronRight size={18} />
                </button>
                <button 
                  onClick={() => {
                    vibrate(10);
                    setPriorityFocus('');
                    nextStep();
                  }}
                  className="w-full py-2 bg-transparent text-purple-600 font-bold hover:text-purple-700 hover:underline transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Unlock All Challenges Together
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 12: Water Goal (original Step 8) */}
          {step === 12 && (
            <motion.div 
              key="step12"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="w-16 h-16 bg-cyan-100 text-cyan-500 rounded-full flex items-center justify-center border border-cyan-200">
                <Droplets size={28} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">Daily Water Goal</h2>
                <p className="text-[#7D6B58] text-xs font-semibold">Choose your target liquid volume, bro.</p>
                <p className="text-[10px] text-[#7D6B58] mt-1 bg-cyan-50/50 p-3.5 rounded-xl border border-cyan-100/50 leading-relaxed font-semibold">Staying hydrated keeps your brain running sharp, boosts metabolism, and eliminates afternoon energy drops. 2L is a great starting base!</p>
              </div>
              
              <div className="flex items-center justify-center gap-5 w-full bg-[#FFFDF9] border border-[#E9E4D4] py-4 rounded-2xl shadow-inner">
                <button 
                  onClick={() => {
                    vibrate(10);
                    setWater(Math.max(1, water - 1));
                  }}
                  className="w-11 h-11 rounded-full bg-cyan-100 text-cyan-600 font-black text-xl flex items-center justify-center hover:bg-cyan-200 cursor-pointer"
                >
                  -
                </button>
                <div className="text-4xl font-black text-cyan-600 w-24 text-center">
                  {water}L
                </div>
                <button 
                  onClick={() => {
                    vibrate(10);
                    setWater(water + 1);
                  }}
                  className="w-11 h-11 rounded-full bg-cyan-100 text-cyan-600 font-black text-xl flex items-center justify-center hover:bg-cyan-200 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="w-full mt-2">
                <button 
                  onClick={nextStep} 
                  className="bg-cyan-500 text-white font-black py-4 px-6 rounded-2xl shadow-md hover:bg-cyan-600 hover:shadow-cyan-500/20 hover:-translate-y-0.5 transition-all w-full flex justify-center items-center gap-2 cursor-pointer text-xs uppercase tracking-widest"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 13: Pushups Goal (original Step 9) */}
          {step === 13 && (
            <motion.div 
              key="step13"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center border border-orange-200 animate-pulse">
                <Flame size={28} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">Push-up Objective</h2>
                <p className="text-[#7D6B58] text-xs font-semibold">How many push-ups do you commit to each day?</p>
                <p className="text-[10px] text-[#7D6B58] bg-orange-50/50 p-3.5 rounded-xl border border-orange-100/50 leading-relaxed font-semibold">Doing even a single digit amount of daily pushups establishes outstanding cognitive consistency. We recommend starting with 5 daily repetitions!</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2.5 w-full">
                {[1, 5, 10, 20].map((num) => (
                  <button 
                    key={num}
                    onClick={() => {
                      vibrate(10);
                      setPushups(num);
                    }}
                    className={`p-4 rounded-2xl border-2 font-black text-lg transition-all cursor-pointer ${pushups === num ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-[#E9E4D4] bg-[#FFFDF9]/60 text-[#7D6B58]/40 hover:border-orange-300'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="w-full mt-2">
                <button 
                  onClick={nextStep} 
                  className="bg-orange-500 text-white font-black py-4 px-6 rounded-2xl shadow-md hover:bg-orange-600 hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all w-full flex justify-center items-center gap-2 cursor-pointer text-xs uppercase tracking-widest"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 14: Commitment Level (original Step 10) */}
          {step === 14 && (
            <motion.div 
              key="step14"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-6 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center border border-rose-200 animate-pulse">
                <ArrowLeft size={18} className="rotate-135 text-rose-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#4F3F34] uppercase tracking-tight">Mascot Intensity?</h2>
                <p className="text-[#7D6B58] text-xs font-semibold">How hard do you want your mascot to check you, bro?</p>
              </div>
              
              <div className="w-full flex flex-col gap-2.5">
                {[
                  { id: 'casual', label: 'Casual', desc: '1-2 challenges/day • Laid back cadence', color: 'bg-rose-400' },
                  { id: 'consistent', label: 'Consistent', desc: '3-4 challenges/day • Solid muscle progress', color: 'bg-rose-600' },
                  { id: 'intense', label: 'Intense Grid', desc: 'Expert pacing • Heavy mascot nudges', color: 'bg-rose-800' }
                ].map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => {
                      vibrate(10);
                      setCommitmentLevel(option.id as any);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${commitmentLevel === option.id ? 'border-rose-500 bg-rose-50/40 shadow-sm' : 'border-[#E9E4D4] bg-[#FFFDF9]/60 hover:border-rose-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${option.color} shrink-0`} />
                      <div>
                        <p className={`font-black uppercase text-[10px] tracking-widest ${commitmentLevel === option.id ? 'text-rose-700' : 'text-[#7D6B58]/40'}`}>{option.label}</p>
                        <p className="text-[11px] font-bold text-[#7D6B58] mt-0.5 leading-tight">{option.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="w-full mt-2">
                 <p className="text-[9px] text-[#7D6B58]/55 font-bold mb-3 italic">
                  * This sets the daily evolution points math for gardening.
                 </p>
                <button 
                   onClick={nextStep} 
                   className="bg-rose-500 hover:bg-rose-600 text-white font-black py-4 px-8 rounded-2xl w-full flex justify-center items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-widest"
                >
                  Define My Intensity <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 15: Notifications (original Step 11) */}
          {step === 15 && (
            <motion.div 
              key="step15"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 125, damping: 14 }}
              className="glass-card p-6 sm:p-10 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <AnimatedBell />
              
              <div className="space-y-4 text-[#4F3F34] mt-5">
                <h2 className="text-2xl font-black leading-tight tracking-tight uppercase">
                  Smart Notifications Nudge
                </h2>
                <p className="text-xs font-semibold text-[#7D6B58]">
                  Nexora uses smart offsets to alert you at your peak energy hours.
                </p>
                
                <div className="bg-[#FFFDF9]/60 border border-[#E9E4D4] rounded-2xl p-4 text-left space-y-3.5">
                  <p className="text-[11px] text-[#7D6B58] font-bold">Smart alerts system delivers:</p>
                  <ul className="grid grid-cols-2 gap-2 text-[10px] text-[#7D6B58] font-semibold">
                    <li className="flex gap-1.5"><span className="text-[#69C496]">✔</span> Peak Energy reminders</li>
                    <li className="flex gap-1.5"><span className="text-[#69C496]">✔</span> Streak saver protections</li>
                    <li className="flex gap-1.5"><span className="text-[#69C496]">✔</span> Dynamic mascot calls</li>
                    <li className="flex gap-1.5"><span className="text-[#69C496]">✔</span> Zero spam policy</li>
                  </ul>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2 mt-2">
                <button 
                  onClick={() => {
                    try {
                      setupFCM().catch(err => console.warn("FCM error behind scenes:", err));
                    } catch (e) {
                      console.warn("FCM setup setupFCM error:", e);
                    }
                    nextStep();
                  }}
                  className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest cursor-pointer bg-[#69C496]"
                >
                  Enable Smart Alerts
                </button>
                <button 
                  onClick={nextStep}
                  className="w-full py-3 text-[#7D6B58]/40 font-black hover:text-[#4F3F34] transition-colors cursor-pointer text-xs uppercase tracking-widest"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 16: Creating Plan (original Step 12) */}
          {step === 16 && (
            <motion.div 
              key="step16"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              className="glass-card p-10 sm:p-14 rounded-[32px] flex flex-col items-center text-center space-y-6 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <Loader2 size={44} className="text-[#69C496] animate-spin" />
              <div className="space-y-4">
                <h2 className="text-xl font-black text-[#4F3F34] uppercase tracking-wider">Formulating your daily sequence...</h2>
                <div className="space-y-2 bg-[#FFFDF9] border border-[#E9E4D4] p-4 rounded-xl">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                    className="text-[9px] font-black text-[#69C496] uppercase tracking-widest"
                  >
                    Locking in {commitmentLevel || 'Consistent'} pace...
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, times: [0, 0.5, 1] }}
                    className="text-[9px] font-black text-[#69C496] uppercase tracking-widest"
                  >
                    Mapping hydration alerts to {water}L goal...
                  </motion.p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1, times: [0, 0.5, 1] }}
                    className="text-[9px] font-black text-[#69C496] uppercase tracking-widest"
                  >
                    Syncing {priorityFocus || 'Unified'} focus target with mascot AI...
                  </motion.p>
                </div>
                <p className="text-[#7D6B58]/50 text-[10px] uppercase font-bold tracking-tight">This creates a daily loop that is 4x more effective than standard alarms.</p>
              </div>
            </motion.div>
          )}

          {/* STEP 17: Thanks (original Step 13) */}
          {step === 17 && (
            <motion.div 
              key="step17"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-10 sm:p-14 rounded-[32px] flex flex-col items-center text-center space-y-7 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="w-20 h-20 bg-[#69C496]/10 text-[#69C496] rounded-full flex items-center justify-center border border-[#69C496]/20 mb-1"
              >
                <Sparkles size={38} className="animate-spin-slow" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-[#4F3F34] leading-tight uppercase tracking-tight">Formulation Complete!</h2>
                <p className="text-[#7D6B58] text-xs font-semibold px-2">Your bespoke daily routine loop is locked in and synced to Firestore.</p>
                <p className="text-[#7D6B58]/60 text-[11px] mt-2 font-medium">Remember, discipline is a muscle built repetition by repetition, day by day. Be kind to yourself, follow Nexy’s cues, and let’s keep moving forward!</p>
              </div>
              
              <button 
                onClick={handleComplete} 
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className="bg-[#69C496] hover:bg-[#5bb385] text-white py-4 px-8 rounded-2xl font-black shadow-lg shadow-[#69C496]/20 transition-all w-full flex justify-center items-center gap-2 text-xs uppercase tracking-widest cursor-pointer leading-none"
              >
                Enter My Companion Portal <CheckCircle2 size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
