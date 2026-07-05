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
import { db, auth, signOut } from '../firebase';
import { UserSettings } from '../types';
import { vibrate } from '../lib/vibrate';
import { MascotV2 } from './MascotV2';
import { AnimatedBell } from './AnimatedBell';

interface OnboardingProps {
  onComplete: () => void;
  settings: UserSettings;
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  setupFCM: () => Promise<string | null>;
}

// Premium visual interactive Confetti effect for the final Duolingo celebration screen
function ConfettiEffect() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#69C496', '#BACBBF', '#FBBF24', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];
    const shapes = ['circle', 'square', 'triangle'];
    const initialParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage horizontal width
      y: -10 - Math.random() * 20, // vertical starting point
      size: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: 100 + Math.random() * 300,
    }));
    setParticles(initialParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: `${p.y}vh`, 
            rotate: p.rotation,
            opacity: 1 
          }}
          animate={{ 
            y: '110vh',
            rotate: p.rotation + p.rotationSpeed,
            opacity: [1, 1, 0.8, 0]
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay,
            ease: 'linear',
            repeat: Infinity
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'triangle' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : '0%',
            borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : 'none',
            borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : 'none',
            borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

export function OnboardingScreen({ onComplete, settings, setSettings, setupFCM }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [introStep, setIntroStep] = useState(0); // Conversational sub-steps
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

  // The Display step indicators mapping (total of 14 key stages in progress bar)
  const displayTotalSteps = 14;
  const getDisplayStep = () => {
    if (step === 1) return 1;
    if (step >= 5) return step - 3; // step 5 is display step 2, step 17 is display step 14
    return step;
  };
  const displayStep = getDisplayStep();

  useEffect(() => {
    if (step === 16) {
      // Simulate bespoke plan creation
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

      // Filter and pre-archive challenges that don't align with the selected Core Objective focus
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

        console.log(`[PERSISTENCE AUDIT] [WRITE START] Onboarding completed. Writing initial user doc to: users/${user.uid}`);
        try {
          await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
          console.log(`[PERSISTENCE AUDIT] [WRITE SUCCESS] Successfully wrote initial user doc on onboarding completion to: users/${user.uid}`);
        } catch (err: any) {
          console.error(`[PERSISTENCE AUDIT] [WRITE FAILURE] Onboarding setDoc failed for user UID: ${user.uid}. Error:`, err);
        }
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
    if (step > 5 && step < 16) {
      setStep(prev => prev - 1);
    } else if (step === 5) {
      // Return smoothly to final slide of conversational intro
      setStep(1);
      setIntroStep(4);
    } else if (step === 1) {
      if (introStep > 0) {
        setIntroStep(prev => prev - 1);
      } else {
        try {
          await signOut(auth);
        } catch (error) {
          console.error("Error signing out:", error);
        }
      }
    }
  };

  // Determine dynamic Mascot mood and decorative effects
  const getMascotMoodAndEffect = () => {
    if (step === 1) {
      if (introStep === 0) return { mood: 'happy' as const, effect: 'none' };
      if (introStep === 1) return { mood: 'happy' as const, effect: 'none' };
      if (introStep === 2) return { mood: 'happy' as const, effect: 'none' };
      if (introStep === 3) return { mood: 'happy' as const, effect: 'none' };
      if (introStep === 4) return { mood: 'neutral' as const, effect: 'none' };
    }
    switch (step) {
      case 5: // Name
        return { mood: 'happy' as const, effect: 'none' };
      case 6: // Age
        return { mood: 'happy' as const, effect: 'none' };
      case 7: // Gender
        return { mood: 'neutral' as const, effect: 'none' };
      case 8: // Source
        return { mood: 'happy' as const, effect: 'none' };
      case 9: // Work Type
        return { mood: 'neutral' as const, effect: 'none' };
      case 10: // Energy
        return { mood: 'neutral' as const, effect: 'none' }; // 🤔 Questioning
      case 11: // Goals
        return { mood: 'surprised' as const, effect: 'none' }; // 🤩 Excited
      case 12: // Water
        return { mood: 'happy' as const, effect: 'none' };
      case 13: // Pushups
        return { mood: 'happy' as const, effect: 'none' };
      case 14: // Intensity
        return { mood: 'neutral' as const, effect: 'none' };
      case 15: // Notifications
        return { mood: 'happy' as const, effect: 'none' };
      case 16: // Creating Plan
        return { mood: 'neutral' as const, effect: 'none' };
      case 17: // Celebration
        return { mood: 'surprised' as const, effect: 'gold_dust' };
      default:
        return { mood: 'happy' as const, effect: 'none' };
    }
  };

  const { mood: mascotMood, effect: mascotEffect } = getMascotMoodAndEffect();

  // Dynamic dialog text
  const getSpeechText = () => {
    if (step === 1) {
      switch (introStep) {
        case 0:
          return "Hey! 👋\nI'm Nexy.";
        case 1:
          return "I'm your daily companion.\n\nI'll help you build\nsmall habits that actually last.";
        case 2:
          return "Every small win grows\nyour streak,\nyour garden,\nand your confidence.";
        case 3:
          return "I'll celebrate your victories,\nencourage you when you miss a day,\nand help you stay consistent.";
        case 4:
          return "Now I'd love to learn\na little about you\nso I can personalize\nyour journey.";
        default:
          return "";
      }
    }
    switch (step) {
      case 5:
        return "What should I call you?";
      case 6:
        return "I'd love to know your age group\nto tune your daily challenge workloads.";
      case 7:
        return "What is your identity?\nThis helps calibrate metabolic hydration profiles.";
      case 8:
        return "How did you find us?\nHelp me grow Nexora, bro.";
      case 9:
        return "What does your typical day look like?\nI'll fit hydration reminders without disruption.";
      case 10:
        return "When do you usually feel most productive?";
      case 11:
        return "Awesome!\nLet's choose your main goal.";
      case 12:
        return "Staying hydrated keeps your brain running sharp.\nLet's choose your water goal.";
      case 13:
        return "Doing daily pushups builds awesome consistency.\nHow many push-ups do you commit to?";
      case 14:
        return "How hard do you want me to check you, bro?";
      case 15:
        return "When should I remind you?";
      case 16:
        return "Formulating your daily sequence...";
      case 17:
        return "Everything is ready!\n\nYour personalized journey starts now.\n\nLet's build an incredible streak together!";
      default:
        return "";
    }
  };

  const speechText = getSpeechText();
  const dialogueKey = step === 1 ? introStep : step;

  const handleIntroNext = () => {
    vibrate(12);
    if (introStep < 4) {
      setIntroStep(prev => prev + 1);
    } else {
      setStep(5);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4F3F34] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Celebration Confetti on completion */}
      {step === 17 && <ConfettiEffect />}

      {/* Decorative Warm Ambient Background Blobs - Idea 2 & 3 Combined: Animated Fluid Blobs, Zen Micro-Particles & Concentric Rings (Highly Optimized for Mobile Devices) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle dot matrix grid mesh for architectural elegance */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(#4F3F34 1.5px, transparent 1.5px)', 
            backgroundSize: '28px 28px' 
          }} 
        />

        {/* Soft Mint Green Blob (Hardware-Accelerated) */}
        <motion.div 
          className="absolute rounded-full bg-[#69C496] opacity-[0.12] blur-[80px]"
          style={{ 
            width: '45vw', 
            height: '45vw', 
            minWidth: '280px', 
            minHeight: '280px', 
            top: '-5%', 
            left: '-5%',
            willChange: 'transform'
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Soft Sunlight Gold/Amber Blob (Hardware-Accelerated) */}
        <motion.div 
          className="absolute rounded-full bg-[#F59E0B] opacity-[0.07] blur-[90px]"
          style={{ 
            width: '40vw', 
            height: '40vw', 
            minWidth: '250px', 
            minHeight: '250px', 
            bottom: '-5%', 
            right: '-5%',
            willChange: 'transform'
          }}
          animate={{
            x: [0, -30, 30, 0],
            y: [0, 30, -20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Soft Wellness Clay/Rose Blob (Hardware-Accelerated) */}
        <motion.div 
          className="absolute rounded-full bg-[#F43F5E] opacity-[0.05] blur-[80px]"
          style={{ 
            width: '35vw', 
            height: '35vw', 
            minWidth: '220px', 
            minHeight: '220px', 
            top: '40%', 
            left: '50%',
            willChange: 'transform'
          }}
          animate={{
            x: [0, 20, -30, 0],
            y: [0, 40, -25, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Zen Micro-particles representing breathing/mindfulness energy */}
        {/* Optimized: Only 6 particles, no expensive box-shadows, pure transform transitions */}
        {[
          { id: 1, size: 6, x: "15%", y: "75%", color: "#69C496", dur: 14, delay: 0 },
          { id: 2, size: 8, x: "85%", y: "25%", color: "#F59E0B", dur: 18, delay: 1 },
          { id: 3, size: 5, x: "38%", y: "65%", color: "#3B82F6", dur: 12, delay: 2 },
          { id: 4, size: 7, x: "75%", y: "80%", color: "#F43F5E", dur: 16, delay: 0.5 },
          { id: 5, size: 9, x: "20%", y: "30%", color: "#69C496", dur: 20, delay: 3 },
          { id: 6, size: 6, x: "65%", y: "18%", color: "#F59E0B", dur: 15, delay: 1.5 }
        ].map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full opacity-[0.4]"
            style={{
              width: p.size,
              height: p.size,
              left: p.x,
              top: p.y,
              backgroundColor: p.color,
              willChange: 'transform, opacity'
            }}
            animate={{
              y: [0, -90, 0],
              x: [0, 15, -15, 0],
              opacity: [0.15, 0.6, 0.15],
              scale: [0.9, 1.2, 0.9],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Pulsating Zen Concentric Rings in the bottom left (Extremely low paint cost) */}
        <motion.div 
          className="absolute rounded-full border border-[#7D6B58]/10"
          style={{ 
            width: '160px', 
            height: '160px', 
            bottom: '10%', 
            left: '10%',
            willChange: 'transform'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute rounded-full border border-[#7D6B58]/5"
          style={{ 
            width: '260px', 
            height: '260px', 
            bottom: '5%', 
            left: '5%',
            willChange: 'transform' 
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Back Button */}
      {((step > 1 && step < 16) || (step === 1 && introStep > 0)) && (
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 p-3 rounded-full bg-white border border-[#E9E4D4] text-[#7D6B58] hover:bg-[#FAF7F2] hover:text-[#4F3F34] hover:scale-105 active:scale-95 transition-all z-20 shadow-sm flex items-center justify-center cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {/* Progress Bar (Visible only during actual questions steps 5 to 15) */}
      {step >= 5 && step <= 15 && (
        <div className="w-full max-w-lg z-10 space-y-1.5 px-1 sm:px-4 mb-4">
          <div className="flex justify-between text-[10px] font-black text-[#7D6B58]/70 uppercase tracking-widest">
            <span>Rhythm Step {displayStep} of {displayTotalSteps}</span>
            <span>{Math.round((displayStep / displayTotalSteps) * 100)}%</span>
          </div>
          <div className="h-2.5 w-full bg-white border border-[#E9E4D4] rounded-full overflow-hidden p-[2px] shadow-sm">
            <motion.div 
              className="h-full bg-[#69C496] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(displayStep / displayTotalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Unified Mascot and Speech Bubble container (Keeps the layout perfectly fixed!) */}
      <div className="w-full max-w-lg z-10 flex flex-col items-center">
        
        {/* Animated Mascot Frame */}
        {step < 16 && (
          <div className="flex justify-center h-44 sm:h-48 w-full relative mb-1">
            <MascotV2 
              className="h-full w-auto max-w-[160px]"
              isSmiling={step === 1 ? (introStep === 0 || introStep === 1 || introStep === 2 || introStep === 3) : (step === 5 || step === 6 || step === 8 || step === 11 || step === 12 || step === 13 || step === 15)}
            />
          </div>
        )}

        {/* Duolingo inspired speech bubble */}
        <div className="relative w-full max-w-md bg-white border-2 border-[#E9E4D4] rounded-3xl p-6 shadow-sm mt-3 mb-6">
          {/* Triangluar Speech bubble arrow pointing upwards to mascot */}
          {step < 16 && (
            <>
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white z-10" />
              <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[15px] border-b-[#E9E4D4] z-0" />
            </>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={dialogueKey}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <p className="text-base sm:text-lg font-bold text-[#4F3F34] leading-relaxed whitespace-pre-line px-2">
                {speechText}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dynamic interactive screens section */}
      <div className="w-full max-w-lg z-10 px-1 sm:px-4">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Conversational Intro Buttons (Unifying 5 sub-dialogues in one layout) */}
          {step === 1 && (
            <motion.div 
              key={`intro-btn-${introStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center w-full"
            >
              <button 
                onClick={handleIntroNext} 
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className="w-full flex justify-center items-center gap-2 cursor-pointer bg-[#69C496] hover:bg-[#5bb385] text-white py-4 rounded-2xl shadow-lg shadow-[#69C496]/20 transition-all font-black text-sm uppercase tracking-widest mt-2"
              >
                {introStep < 4 ? "Next" : "Let's Get Started →"} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 5: Name input */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-6 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 6: Age choice and typing */}
          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
              {/* Age select chips */}
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

              {/* Exact Age typing */}
              <div className="w-full space-y-1.5 pt-1">
                <span className="text-[10px] font-black uppercase text-[#7D6B58]/60 tracking-widest">Or type exact age:</span>
                <input 
                  type="number" 
                  value={age}
                  min="5"
                  max="120"
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25" 
                  className="w-full p-4 rounded-2xl border-2 border-[#E9E4D4] focus:border-[#69C496] focus:ring-1 focus:ring-[#69C496] outline-none text-2xl text-center font-black text-[#4F3F34] bg-[#FFFDF9]/60 placeholder-[#7D6B58]/35 transition-all font-sans"
                  autoFocus
                />
              </div>

              {age.trim() !== "" && !isNaN(Number(age)) && Number(age) >= 5 && Number(age) <= 120 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
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
            </motion.div>
          )}

          {/* STEP 7: Gender selection */}
          {step === 7 && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 8: Source / Discovery */}
          {step === 8 && (
            <motion.div 
              key="step8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 9: Work Type / Daily life rhythm */}
          {step === 9 && (
            <motion.div 
              key="step9"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 10: Peak Energy Pulse */}
          {step === 10 && (
            <motion.div 
              key="step10"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 11: Core Objective Focus */}
          {step === 11 && (
            <motion.div 
              key="step11"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 12: Water Goal */}
          {step === 12 && (
            <motion.div 
              key="step12"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 13: Pushups Goal */}
          {step === 13 && (
            <motion.div 
              key="step13"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 14: Commitment / Mascot Intensity */}
          {step === 14 && (
            <motion.div 
              key="step14"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
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

          {/* STEP 15: Notifications */}
          {step === 15 && (
            <motion.div 
              key="step15"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-[32px] flex flex-col items-center text-center space-y-5 border border-[#E9E4D4] bg-white shadow-xl"
            >
              <div className="w-full text-[#4F3F34] mt-1">
                <div className="bg-[#FFFDF9]/60 border border-[#E9E4D4] rounded-2xl p-4 text-left space-y-3 shadow-inner">
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

          {/* STEP 16: Creating Plan Loading screen */}
          {step === 16 && (
            <motion.div 
              key="step16"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              className="glass-card p-10 sm:p-12 rounded-[32px] flex flex-col items-center text-center space-y-6 border border-[#E9E4D4] bg-white shadow-xl w-full"
            >
              <Loader2 size={44} className="text-[#69C496] animate-spin" />
              <div className="space-y-4 w-full">
                <h2 className="text-lg font-black text-[#4F3F34] uppercase tracking-wider">Formulating your daily sequence...</h2>
                <div className="space-y-2 bg-[#FFFDF9] border border-[#E9E4D4] p-4 rounded-xl text-left shadow-inner">
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

          {/* STEP 17: Celebration Screen (Onboarding Complete) */}
          {step === 17 && (
            <motion.div 
              key="step17"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              {/* Excited Mascot renders at the top of the card when completing onboarding */}
              <div className="flex justify-center h-44 sm:h-48 w-full relative mb-1">
                <MascotV2 
                  className="h-full w-auto max-w-[160px]"
                  isSmiling={true}
                />
              </div>

              {/* Celebration Speech bubble with dynamic text */}
              <div className="relative w-full max-w-md bg-white border-2 border-[#E9E4D4] rounded-3xl p-6 shadow-sm mt-3 mb-6">
                <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white z-10" />
                <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[15px] border-b-[#E9E4D4] z-0" />
                
                <p className="text-base sm:text-lg font-bold text-[#4F3F34] leading-relaxed text-center px-2">
                  Everything is ready!{"\n\n"}Your personalized journey starts now.{"\n\n"}Let's build an incredible streak together!
                </p>
              </div>

              {/* Start My Journey button */}
              <button 
                onClick={handleComplete} 
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className="bg-[#69C496] hover:bg-[#5bb385] text-white py-4 px-8 rounded-2xl font-black shadow-lg shadow-[#69C496]/20 transition-all w-full flex justify-center items-center gap-2 text-xs uppercase tracking-widest cursor-pointer leading-none"
              >
                Start My Journey → <CheckCircle2 size={18} />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
