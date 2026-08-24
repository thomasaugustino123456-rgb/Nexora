import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Check, 
  X,
  Crown, 
  Zap, 
  ShieldCheck, 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  Music, 
  RefreshCw, 
  Coins, 
  Star, 
  CalendarCheck, 
  Clock, 
  WifiOff,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Smartphone,
  Laptop,
  TrendingUp,
  BrainCircuit,
  Target,
  BarChart3,
  Users,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { playSound } from '../hooks/useSound';
import { Mascot } from './Mascot';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { safeSetDoc } from '../lib/firestoreUtils';
import { isUserProUnlocked } from '../types';

interface SubscriptionScreenProps {
  onBack: () => void;
  userId: string;
  onActivatePro?: () => void;
  onUpdateSettings?: (settings: any) => void;
  onStartProTest?: () => void;
  settings?: any;
  stats?: any;
}

type PlanType = 'weekly' | 'monthly' | 'yearly';

interface PlanDetails {
  id: PlanType;
  name: string;
  badge?: string;
  price: string;
  period: string;
  billingSubtitle: string;
  savings?: string;
  theme: 'lime' | 'light' | 'dark';
  features: string[];
}

const PLANS: PlanDetails[] = [
  {
    id: 'weekly',
    name: 'Weekly Sprint',
    badge: 'FLEXIBLE',
    price: '$2.99',
    period: '/ week',
    billingSubtitle: 'Billed weekly · Auto-renewable · Cancel anytime',
    theme: 'lime',
    features: [
      'Full access to all Pro features',
      'Unlimited AI Coach & habit scans',
      'Focus soundscapes & 40Hz gamma audio',
      'Basic mascot element auras'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Pass',
    badge: 'POPULAR',
    price: '$7.99',
    period: '/ month',
    billingSubtitle: 'Billed monthly · Just $1.99/week · Cancel anytime',
    theme: 'light',
    features: [
      'Unlimited scans & AI Coach consultations',
      'Full Pantry & saved history access',
      'Clean Score & flagged breakdown',
      'Custom routine & diet compatibility',
      'Focus soundscapes & offline mode'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Master',
    badge: 'BEST VALUE · SAVE 48%',
    price: '$49.99',
    period: '/ year',
    billingSubtitle: 'Just $4.16 / month · Billed annually ($49.99)',
    savings: 'Save 48%',
    theme: 'dark',
    features: [
      'Unlimited scans & instant AI Coach queries',
      'Full Pantry access and saved scan history',
      'Comprehensive Clean Score & flagged breakdown',
      'Personalized diet & circadian routine compatibility',
      'Unlimited focus soundscapes & 40Hz audio',
      'All gamification features & mascot auras unlocked',
      'Priority 24/7 VIP support & cloud sync'
    ]
  }
];

// Comparison Matrix Data
const COMPARISON_FEATURES = [
  {
    category: 'Core AI & Analytics',
    items: [
      { name: 'AI Habit & Food Scans', free: '3 scans / day', pro: 'Unlimited ⚡' },
      { name: 'AI Health Coach Consultations', free: 'Limited (3 msgs/day)', pro: 'Unlimited Realtime AI' },
      { name: 'Clean Score Breakdown & Alerts', free: 'Basic overview', pro: 'Deep Molecular Analysis' },
      { name: 'Pantry Database & Scan History', free: 'Last 7 days', pro: 'Lifetime Unlimited Vault' },
    ]
  },
  {
    category: 'Performance & Focus',
    items: [
      { name: '40Hz Gamma & Binaural Audio', free: '1 preview track', pro: 'Full Soundscape Library' },
      { name: 'Circadian Routine Planner', free: 'Standard presets', pro: 'Custom Adaptive Schedules' },
      { name: 'Offline Mode Access', free: 'Partial', pro: 'Full Offline Engine' },
    ]
  },
  {
    category: 'Gamification & VIP Perks',
    items: [
      { name: 'Mascot Evolved Auras & Costumes', free: 'Basic tiers', pro: 'All Mythic & Gold Auras' },
      { name: 'Daily XP & Streak Multiplier', free: '1.0x baseline', pro: '2.5x VIP Boost 🚀' },
      { name: 'Direct VIP Cloud Sync & Priority Support', free: 'Standard', pro: '24/7 Priority VIP' },
    ]
  }
];

// Success Metrics / Social Proof Stats
const SUCCESS_METRICS = [
  { value: '94%', label: 'Habit Consistency', icon: Target, desc: 'Users report unbroken streaks' },
  { value: '3.8x', label: 'Faster Focus Entry', icon: Zap, desc: 'Using 40Hz gamma soundscapes' },
  { value: '4.9★', label: 'App Rating', icon: Star, desc: 'From 12,400+ verified reviews' },
  { value: '180k+', label: 'Scans Analyzed', icon: TrendingUp, desc: 'Foods, supplements & habits' },
];

export function SubscriptionScreen({ 
  onBack, 
  userId, 
  onActivatePro,
  onUpdateSettings,
  onStartProTest,
  settings,
  stats = { streak: 0, xp: 0, coins: 0, level: 1 }
}: SubscriptionScreenProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanType>('yearly');
  const [isFreeTrialEnabled, setIsFreeTrialEnabled] = useState<boolean>(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'USDT' | 'BTC' | 'm-GURUSH'>('USDT');
  const [showAdvancedTools, setShowAdvancedTools] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isActivatingTrial, setIsActivatingTrial] = useState<boolean>(false);

  // Duolingo-style superhero flying state
  const [hasLaunched, setHasLaunched] = useState<boolean>(false);
  const [flightPhase, setFlightPhase] = useState<'launch' | 'hover'>('launch');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll direction detection for appear / hide dynamic floating dock
  const [showFloatingDock, setShowFloatingDock] = useState<boolean>(false);
  const lastScrollY = useRef<number>(0);

  // Launch superhero animation sequence
  useEffect(() => {
    const launchTimer = setTimeout(() => {
      setHasLaunched(true);
    }, 150);

    const hoverTimer = setTimeout(() => {
      setFlightPhase('hover');
    }, 1400);

    return () => {
      clearTimeout(launchTimer);
      clearTimeout(hoverTimer);
    };
  }, []);

  // Handle scroll to show/hide floating dock cleanly
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > 480) {
      if (currentScrollY < lastScrollY.current || currentScrollY > 700) {
        setShowFloatingDock(true);
      }
    } else {
      setShowFloatingDock(false);
    }
    lastScrollY.current = currentScrollY;
  };

  // Network online state & verification
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    isPro: boolean;
    plan?: string;
    activatedAt?: string;
    expiresAt?: string;
    message?: string;
    checkedAt?: string;
  } | null>(null);

  // Determine if Pro (or Pro Test mode) is currently active
  const isPro = settings?.isPro || settings?.proTestActive;

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Online verification logic with Firebase
  const handleCheckProStatus = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    setIsVerifying(true);
    try {
      const userDocRef = doc(db, "users", userId);
      const userSnap = await getDoc(userDocRef);

      let firestoreIsPro = false;
      let plan = settings?.proPlan || "Yearly Master";
      let activatedAt = settings?.proActivatedAt || "";
      let expiresAt = settings?.proExpiresAt || "";

      if (userSnap.exists()) {
        const data = userSnap.data();
        firestoreIsPro = isUserProUnlocked(userId) || Boolean(data.isPro) || Boolean(data.settings?.isPro) || Boolean(data.subscription?.active);
        plan = data.proPlan || data.settings?.proPlan || data.subscription?.plan || plan;
        activatedAt = data.proActivatedAt || data.settings?.proActivatedAt || data.subscription?.activatedAt || activatedAt;
        expiresAt = data.proExpiresAt || data.settings?.proExpiresAt || data.subscription?.expiresAt || expiresAt;
      } else {
        firestoreIsPro = isUserProUnlocked(userId);
      }

      const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      if (firestoreIsPro) {
        const finalPlan = plan || "Yearly Master";
        const finalAct = activatedAt || todayStr;
        const finalExp = expiresAt || "Auto-Renewing";

        if (onUpdateSettings) {
          onUpdateSettings({
            isPro: true,
            proPlan: finalPlan,
            proActivatedAt: finalAct,
            proExpiresAt: finalExp,
          });
        }

        setVerificationResult({
          isPro: true,
          plan: finalPlan,
          activatedAt: finalAct,
          expiresAt: finalExp,
          message: "Confirmation: Pro features are active for your account.",
          checkedAt: new Date().toLocaleTimeString()
        });
      } else {
        if (onUpdateSettings && !settings?.proTestActive) {
          onUpdateSettings({ isPro: false });
        }

        setVerificationResult({
          isPro: false,
          plan: "Free Tier",
          activatedAt: "-",
          expiresAt: "-",
          message: "You are currently using the Free plan.",
          checkedAt: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      console.error("Firebase subscription verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify on mount if online
  useEffect(() => {
    if (isOnline && userId) {
      handleCheckProStatus();
    }
  }, [userId, isOnline]);

  // Robust 4-Day Free Pro Test Activation Flow
  const handleActivate4DayTrial = async () => {
    if (!isOnline) return;

    // Check if test is currently in 3-week cooldown
    if (settings?.proTestCooldownUntil && new Date(settings.proTestCooldownUntil).getTime() > Date.now()) {
      const remainingMs = new Date(settings.proTestCooldownUntil).getTime() - Date.now();
      const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      alert(`Your 4-Day Free Pro Test is currently on cooldown. You can test again in ${remainingDays} day(s), or upgrade instantly via WhatsApp!`);
      return;
    }

    vibrate(VIBRATION_PATTERNS.SUCCESS);
    setIsActivatingTrial(true);

    try {
      if (onStartProTest) {
        await onStartProTest();
      } else if (onUpdateSettings) {
        const now = new Date();
        const expiry = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
        const settingsUpdate = {
          proTestStartedAt: now.toISOString(),
          proTestExpiresAt: expiry.toISOString(),
          proTestLastUsedAt: now.toISOString(),
          proTestActive: true,
          proTestDay2Notified: false,
          isPro: true,
          proPlan: '4-Day Free Pro Test',
        };
        onUpdateSettings(settingsUpdate);

        if (userId && navigator.onLine) {
          try {
            await safeSetDoc(doc(db, 'users', userId), settingsUpdate, { merge: true });
          } catch (e) {
            console.warn('Firestore sync warning:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error starting free trial:', error);
    } finally {
      setIsActivatingTrial(false);
    }
  };

  // Handle WhatsApp upgrade request for manual payment
  const handleOpenWhatsApp = (planId: PlanType) => {
    if (!isOnline) return;
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    const planObj = PLANS.find(p => p.id === planId) || PLANS[2];
    
    const whatsappMsg = `Hello! I would like to upgrade to Nexora Pro.\n\n👤 UID: ${userId}\n💎 Selected Plan: ${planObj.name} (${planObj.price}${planObj.period})\n💳 Payment Method: ${selectedPaymentMethod}\n\nPlease verify and activate my Nexora Pro access. Thank you!`;

    window.open(`https://api.whatsapp.com/send?phone=211929635502&text=${encodeURIComponent(whatsappMsg)}`, '_blank');
  };

  // Primary CTA click action
  const handlePrimaryAction = () => {
    if (isFreeTrialEnabled) {
      handleActivate4DayTrial();
    } else {
      handleOpenWhatsApp(selectedPlanId);
    }
  };

  // Copy helper with animated feedback
  const copyToClipboard = (text: string, label: string) => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // ==========================================
  // AUDIO SYNTHESIZER ENGINE FOR PREVIEW
  // ==========================================
  const [isPlayingSound, setIsPlayingSound] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(0.5);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);

  const stopSynthesizer = () => {
    if (audioNodesRef.current.length > 0) {
      audioNodesRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
        try { node.disconnect(); } catch (e) {}
      });
      audioNodesRef.current = [];
    }
    setIsPlayingSound(null);
  };

  const startSynthesizer = (type: string) => {
    stopSynthesizer();
    vibrate(VIBRATION_PATTERNS.SUCCESS);

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audioVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      audioNodesRef.current.push(masterGain);

      if (type === 'binaural_gamma') {
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(240, ctx.currentTime);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, ctx.currentTime);
          pannerR.pan.setValueAtTime(1, ctx.currentTime);

          oscL.connect(pannerL);
          pannerL.connect(masterGain);

          oscR.connect(pannerR);
          pannerR.connect(masterGain);

          audioNodesRef.current.push(pannerL, pannerR);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start();
        oscR.start();
        audioNodesRef.current.push(oscL, oscR);
        setIsPlayingSound('binaural_gamma');

      } else if (type === 'pink_noise_rain') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);

        noiseSource.start();
        audioNodesRef.current.push(noiseSource, filter);
        setIsPlayingSound('pink_noise_rain');
      }

    } catch (e) {
      console.error('Audio synthesis failed:', e);
    }
  };

  useEffect(() => {
    return () => {
      stopSynthesizer();
    };
  }, []);

  const activePlanIndex = PLANS.findIndex(p => p.id === selectedPlanId);

  // Swipe navigation handler
  const handleSwipePlan = (direction: 'next' | 'prev') => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    playSound('nav_switch');
    if (direction === 'next') {
      const nextIndex = (activePlanIndex + 1) % PLANS.length;
      setSelectedPlanId(PLANS[nextIndex].id);
    } else {
      const prevIndex = (activePlanIndex - 1 + PLANS.length) % PLANS.length;
      setSelectedPlanId(PLANS[prevIndex].id);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="min-h-screen bg-gradient-to-b from-[#2B86FE] via-[#5CB2FF] via-40% to-[#D8F696] text-slate-900 overflow-y-auto overflow-x-hidden font-sans relative selection:bg-[#94E421]/40"
    >
      {/* ======================================================== */}
      {/* DUOLINGO-STYLE SKY WITH REAL SVG SUPERHERO MASCOT FLIGHT */}
      {/* ======================================================== */}
      <div className="relative w-full pt-4 pb-8 overflow-hidden select-none">
        
        {/* Animated Drifting Background Clouds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Cloud 1 (slow drift) */}
          <motion.div 
            animate={{ x: [-100, 450] }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="absolute top-6 left-0 opacity-40 blur-[1px]"
          >
            <div className="w-36 h-12 bg-white/70 rounded-full" />
            <div className="w-20 h-20 bg-white/70 rounded-full -mt-14 ml-6" />
          </motion.div>

          {/* Cloud 2 (higher drift) */}
          <motion.div 
            animate={{ x: [450, -120] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-0 opacity-30 blur-[1px]"
          >
            <div className="w-48 h-14 bg-white/60 rounded-full" />
            <div className="w-24 h-24 bg-white/60 rounded-full -mt-16 ml-10" />
          </motion.div>

          {/* Floating Sparkles & Golden Stars */}
          <motion.div 
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 text-yellow-200"
          >
            <Sparkles size={22} className="fill-yellow-200" />
          </motion.div>
          <motion.div 
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            className="absolute top-16 right-12 text-white"
          >
            <Sparkles size={18} className="fill-white" />
          </motion.div>
          <motion.div 
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.7, 1.2, 0.7] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
            className="absolute top-32 left-1/4 text-yellow-300"
          >
            <Star size={16} className="fill-yellow-300 stroke-yellow-300" />
          </motion.div>
        </div>

        {/* Top Header Floating Controls Bar (Responsive Width) */}
        <div className="w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between relative z-30 mb-2">
          {/* Back Button */}
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              stopSynthesizer();
              onBack();
            }} 
            id="sub-back-btn"
            aria-label="Go Back"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg border border-black/5 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
          </motion.button>

          {/* Social Proof Trust Rating Badge */}
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-black/5 shadow-md">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400 stroke-amber-400" />
              ))}
            </div>
            <span className="text-[11px] sm:text-xs font-black text-slate-900 ml-0.5">4.9</span>
            <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold">· 12.4k reviews</span>
          </div>

          {/* Restore / Sync Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheckProStatus}
            disabled={!isOnline || isVerifying}
            id="sub-restore-btn"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 hover:bg-white text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5 shadow-md border border-black/5 transition-all cursor-pointer"
          >
            <RefreshCw size={12} className={isVerifying ? 'animate-spin text-[#64A312]' : 'text-slate-600'} />
            <span>{isVerifying ? 'Syncing...' : 'Restore'}</span>
          </motion.button>
        </div>

        {/* HERO SUPERHERO FLIGHT CONTAINER */}
        <div className="relative flex flex-col items-center justify-center mt-2 mb-2 z-20 min-h-[190px] sm:min-h-[220px]">
          
          {/* Dynamic Superhero Launch & Hover Mascot Animation */}
          <motion.div
            initial={{ y: 220, scale: 0.35, rotate: -25, opacity: 0 }}
            animate={
              hasLaunched
                ? flightPhase === 'launch'
                  ? { y: [220, -15, 0], scale: [0.35, 1.15, 1], rotate: [-25, 8, 0], opacity: [0, 1, 1] }
                  : { 
                      y: [0, -14, 0], 
                      scale: [1, 1.03, 1], 
                      rotate: [0, 2.5, -2.5, 0], 
                      opacity: 1 
                    }
                : { y: 220, opacity: 0 }
            }
            transition={
              flightPhase === 'launch'
                ? { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
                : { 
                    y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                  }
            }
            className="relative flex flex-col items-center cursor-pointer"
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.SUCCESS);
            }}
          >
            {/* Speed / Rocket Jet Trail Particles */}
            <div className="relative flex flex-col items-center">
              {/* Radial Superhero Energy Burst Glow */}
              <motion.div 
                animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0.8, 0.45] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-8 bg-gradient-to-r from-[#98E724]/60 via-cyan-300/60 to-yellow-300/60 rounded-full blur-2xl -z-10"
              />

              {/* AUTHENTIC SVG VECTOR MASCOT WITH SUPERHERO GLOW THEME */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 relative flex items-center justify-center filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.3)]">
                <Mascot 
                  mood="hyped"
                  theme="lightning-slim"
                  effect="sparkles"
                  hat="none"
                  className="w-full h-full"
                />
              </div>

              {/* Superhero Twin Rocket Booster Exhaust Flares */}
              <motion.div 
                animate={{ 
                  scaleY: [1, 1.5, 0.8, 1.4, 1],
                  scaleX: [1, 0.9, 1.1, 0.95, 1],
                  opacity: [0.75, 1, 0.7, 1, 0.75]
                }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center gap-3 -mt-2"
              >
                <div className="w-3 h-7 bg-gradient-to-b from-[#FF2E93] via-amber-400 to-yellow-200 rounded-full blur-[1px] shadow-[0_0_12px_#FF2E93]" />
                <div className="w-3 h-7 bg-gradient-to-b from-[#FF2E93] via-amber-400 to-yellow-200 rounded-full blur-[1px] shadow-[0_0_12px_#FF2E93]" />
              </motion.div>
            </div>
          </motion.div>

          {/* Super Nexora VIP Header Text */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-3 text-center px-4"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#98E724] to-[#74DD05] text-slate-950 font-black text-xs sm:text-sm shadow-lg border border-white/50 uppercase tracking-wider">
              <Zap size={14} className="fill-slate-950" />
              <span>Super Nexora VIP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] mt-2">
              Fly Past Your Limits
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/95 font-semibold drop-shadow-[0_1px_5px_rgba(0,0,0,0.25)] mt-1 max-w-sm sm:max-w-md mx-auto">
              Supercharge your health, focus & discipline with AI
            </p>
          </motion.div>
        </div>

        {/* Fluffy Sky Cloud Bottom Divider SVG */}
        <div className="relative w-full -mb-1 mt-3">
          <svg 
            viewBox="0 0 1440 220" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-md preserve-3d"
          >
            <path 
              d="M0,180 C150,110 320,130 460,170 C600,210 750,140 900,160 C1050,180 1200,110 1350,150 C1400,165 1440,180 1440,180 L1440,220 L0,220 Z" 
              fill="#D8F696" 
              fillOpacity="0.4"
            />
            <path 
              d="M0,190 C120,140 280,160 420,190 C580,220 740,160 920,180 C1100,200 1260,150 1440,190 L1440,220 L0,220 Z" 
              fill="#D8F696" 
            />
          </svg>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RESPONSIVE MAIN BODY CONTENT CONTAINER (ALL DEVICES) */}
      {/* ======================================================== */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pb-28 -mt-2 relative z-10">

        {/* Offline Warning Banner */}
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-950 backdrop-blur-md flex items-center gap-3 text-left shadow-sm"
          >
            <WifiOff size={20} className="text-rose-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm">Offline Mode</h4>
              <p className="text-[11px] sm:text-xs text-rose-800 font-medium">
                Internet connection is required to verify and activate Nexora Pro.
              </p>
            </div>
          </motion.div>
        )}

        {/* Active Pro Status Banner (if user is already active) */}
        {isPro && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 sm:p-5 rounded-3xl bg-[#1B1D1A] text-white shadow-xl flex items-center justify-between gap-3 border border-white/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#94E421] text-slate-950 flex items-center justify-center font-black shadow-md">
                <Crown size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-white">Nexora Pro is Active</h4>
                  <span className="bg-[#98E724] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    VIP
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Plan: <span className="text-[#98E724] font-bold">{verificationResult?.plan || settings?.proPlan || 'Active Pass'}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plan Switcher Segmented Control */}
        <div className="bg-black/10 backdrop-blur-md p-1.5 rounded-full flex items-center justify-between mb-6 border border-black/10 shadow-inner max-w-md mx-auto">
          {PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
                  playSound('nav_switch');
                  setSelectedPlanId(plan.id);
                }}
                className={`relative flex-1 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all text-center cursor-pointer ${
                  isSelected ? 'text-slate-950' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activePlanTab"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-white rounded-full shadow-md"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {plan.id === 'weekly' ? 'Weekly' : plan.id === 'monthly' ? 'Monthly' : 'Yearly'}
                  {plan.savings && (
                    <span className="bg-[#98E724] text-[9px] sm:text-[10px] text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                      -48%
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* 3D SLIDING CARD DECK CAROUSEL (RESPONSIVE ON ALL DEVICES) */}
        {/* ======================================================== */}
        <div 
          className="relative min-h-[410px] sm:min-h-[440px] md:min-h-[460px] w-full flex items-center justify-center select-none"
          style={{ perspective: '1200px' }}
        >
          {PLANS.map((plan, index) => {
            const offset = (index - activePlanIndex + PLANS.length) % PLANS.length;
            const isCenter = offset === 0;
            const isRight = offset === 1;
            const isLeft = offset === PLANS.length - 1;

            let xOffset = 0;
            let scale = 1;
            let zIndex = 30;
            let rotateY = 0;
            let opacity = 1;
            let translateY = 0;

            if (isCenter) {
              xOffset = 0;
              scale = 1;
              zIndex = 30;
              rotateY = 0;
              opacity = 1;
              translateY = 0;
            } else if (isRight) {
              xOffset = 55;
              scale = 0.88;
              zIndex = 15;
              rotateY = -12;
              opacity = 0.6;
              translateY = 12;
            } else if (isLeft) {
              xOffset = -55;
              scale = 0.88;
              zIndex = 15;
              rotateY = 12;
              opacity = 0.6;
              translateY = 12;
            } else {
              opacity = 0;
              zIndex = 0;
              scale = 0.7;
            }

            return (
              <motion.div
                key={plan.id}
                initial={false}
                animate={{
                  x: xOffset,
                  y: translateY,
                  scale,
                  rotateY,
                  opacity,
                  zIndex,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 320,
                  damping: 28,
                }}
                drag={isCenter ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x > 60 || velocity.x > 400) {
                    handleSwipePlan('prev');
                  } else if (offset.x < -60 || velocity.x < -400) {
                    handleSwipePlan('next');
                  }
                }}
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
                  setSelectedPlanId(plan.id);
                  handleOpenWhatsApp(plan.id);
                }}
                className={`absolute w-full max-w-md sm:max-w-lg rounded-[36px] p-6 sm:p-7 shadow-2xl transition-shadow cursor-pointer overflow-hidden ${
                  plan.theme === 'dark' 
                    ? 'bg-[#191C18] text-white border border-white/10' 
                    : plan.theme === 'lime'
                      ? 'bg-[#98E724] text-slate-950 border border-black/10'
                      : 'bg-white text-slate-950 border border-black/10'
                } ${isCenter ? 'ring-4 ring-black/15 shadow-2xl' : 'shadow-md'}`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Subtle Shimmer Sweep Animation on Active Card */}
                {isCenter && (
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
                  />
                )}

                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className={`text-[10px] sm:text-xs font-black tracking-wider px-3 py-1 rounded-full uppercase ${
                    plan.theme === 'dark'
                      ? 'bg-[#98E724] text-slate-950'
                      : plan.theme === 'lime'
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-900'
                  }`}>
                    {plan.badge}
                  </span>

                  {plan.savings && (
                    <span className="text-xs sm:text-sm font-black text-[#98E724] bg-white/10 px-2 py-0.5 rounded-full">
                      {plan.savings}
                    </span>
                  )}
                </div>

                {/* Plan Name & Price */}
                <div className="mb-4">
                  <h3 className={`text-base sm:text-lg font-black ${plan.theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${plan.theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs sm:text-sm font-bold ${plan.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-[11px] sm:text-xs font-medium mt-1 ${plan.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {plan.billingSubtitle}
                  </p>
                </div>

                {/* Feature Checklist */}
                <div className={`space-y-2.5 sm:space-y-3 pt-3.5 border-t ${plan.theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 ${
                        plan.theme === 'dark'
                          ? 'bg-[#98E724] text-slate-950'
                          : plan.theme === 'lime'
                            ? 'bg-slate-950 text-white'
                            : 'bg-[#98E724] text-slate-950'
                      }`}>
                        <Check size={12} className="stroke-[3.5]" />
                      </div>
                      <span className={plan.theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Choose / Select Button */}
                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setSelectedPlanId(plan.id);
                      handleOpenWhatsApp(plan.id);
                    }}
                    className={`w-full py-3 sm:py-3.5 rounded-full font-black text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                      isCenter
                        ? plan.theme === 'dark'
                          ? 'bg-[#98E724] hover:bg-[#86D41A] text-slate-950 shadow-md'
                          : plan.theme === 'lime'
                            ? 'bg-slate-950 text-white hover:bg-black shadow-md'
                            : 'bg-slate-950 text-white hover:bg-black shadow-md'
                        : 'bg-black/10 hover:bg-black/20 text-slate-900'
                    }`}
                  >
                    <span>Get {plan.name} ({plan.price})</span>
                    <MessageCircle size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3D Carousel Slide Dots Indicator */}
        <div className="flex items-center justify-center gap-2.5 mt-5 mb-8">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                setSelectedPlanId(plan.id);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                selectedPlanId === plan.id 
                  ? 'w-7 bg-slate-950 shadow-sm' 
                  : 'w-2.5 bg-slate-950/30 hover:bg-slate-950/50'
              }`}
              aria-label={`Select ${plan.name}`}
            />
          ))}
        </div>

        {/* ======================================================== */}
        {/* 4-DAY FREE PRO TEST TIMELINE (CONVERSION TRUST MODULE) */}
        {/* ======================================================== */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 md:p-7 border border-black/5 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5">
            <span className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-2 uppercase tracking-wide">
              <CalendarCheck size={18} className="text-[#64A312]" /> 4-Day Free Pro Test Timeline
            </span>
            <span className="text-[10px] sm:text-xs font-black bg-[#98E724]/40 text-slate-950 px-3 py-1 rounded-full shadow-xs">
              $0.00 Due Today
            </span>
          </div>

          {/* Timeline steps */}
          <div className="space-y-4 sm:space-y-5 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs sm:text-sm">
            <div className="relative flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-[#98E724] border-2 border-white ring-2 ring-[#98E724]/50 absolute -left-[23px] top-0.5 shrink-0 shadow-xs" />
              <div>
                <span className="font-extrabold text-slate-950 text-xs sm:text-sm">Today (Day 1)</span>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">Unlock all Pro features immediately for 4 days at $0.00.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white ring-2 ring-amber-400/50 absolute -left-[23px] top-0.5 shrink-0 shadow-xs" />
              <div>
                <span className="font-extrabold text-slate-950 text-xs sm:text-sm">Day 2</span>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">We send you a reminder notification about your Pro trial features.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-slate-950 border-2 border-white ring-2 ring-slate-950/25 absolute -left-[23px] top-0.5 shrink-0 shadow-xs" />
              <div>
                <span className="font-extrabold text-slate-950 text-xs sm:text-sm">Day 4</span>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
                  Test finishes. Upgrade to lifetime VIP via WhatsApp or wait 3 weeks to test again.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Free Trial Toggle Switch Container */}
        <div 
          id="free-trial-container"
          className="bg-white rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-lg border border-black/5 mb-6"
        >
          <div>
            <span className="text-sm sm:text-base font-black text-slate-950 block">
              Start 4-day free trial
            </span>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              Try full Pro access risk-free before any payment
            </span>
          </div>

          <button
            type="button"
            id="toggle-free-trial-btn"
            aria-label="Toggle Free Trial"
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.CLICK);
              setIsFreeTrialEnabled(!isFreeTrialEnabled);
            }}
            className={`w-14 h-8 sm:w-16 sm:h-9 rounded-full transition-colors relative p-1 flex items-center shrink-0 cursor-pointer ${
              isFreeTrialEnabled ? 'bg-[#98E724]' : 'bg-slate-300'
            }`}
          >
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-md ${
                isFreeTrialEnabled ? 'ml-auto' : 'mr-auto'
              }`}
            />
          </button>
        </div>

        {/* Primary Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          id="main-continue-btn"
          disabled={!isOnline || isActivatingTrial}
          onClick={handlePrimaryAction}
          className={`w-full py-4 sm:py-5 px-6 rounded-3xl font-black text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-2.5 shadow-2xl cursor-pointer ${
            !isOnline
              ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
              : 'bg-[#191C18] hover:bg-black text-white shadow-black/35'
          }`}
        >
          {isActivatingTrial ? (
            <div className="flex items-center gap-2">
              <RefreshCw size={18} className="animate-spin text-[#98E724]" />
              <span>Activating 4-Day Free Pro Test...</span>
            </div>
          ) : isOnline ? (
            <div className="flex items-center gap-2">
              <span>
                {isFreeTrialEnabled 
                  ? 'Start 4-Day Free Pro Test ($0.00)' 
                  : selectedPlanId === 'yearly' 
                    ? 'Continue with Yearly ($49.99)' 
                    : selectedPlanId === 'monthly' 
                      ? 'Continue with Monthly ($7.99)' 
                      : 'Continue with Weekly ($2.99)'}
              </span>
              <Sparkles size={18} className="text-[#98E724]" />
            </div>
          ) : (
            <span>Offline - Connect to Internet</span>
          )}
        </motion.button>

        {/* Direct 4-Day Pro Pass Instant Button */}
        {onStartProTest && !isPro && (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="mt-4 p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-sm border border-black/10 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-black text-slate-950">Direct 4-Day Pro Test</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium">Activate full VIP features for 4 days with zero delay.</p>
              </div>
            </div>

            <button
              onClick={handleActivate4DayTrial}
              id="start-4day-test-btn"
              disabled={isActivatingTrial}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm shrink-0 transition-all shadow-md cursor-pointer"
            >
              {isActivatingTrial ? 'Activating...' : 'Activate Now'}
            </button>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* NEW: APP SUCCESS METRICS (WHERE MOST APPS SUCCEED) */}
        {/* ======================================================== */}
        <div className="mt-10 mb-8">
          <div className="text-center mb-4">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-900/80 bg-white/70 px-3 py-1 rounded-full border border-black/5 shadow-xs">
              Proven Health & Focus Results
            </span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-950 mt-2">
              Why 94% of Members Reach Their Goals
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-sm sm:max-w-md mx-auto mt-0.5">
              Science-backed habit tracking, biofeedback soundscapes, and AI accountability.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {SUCCESS_METRICS.map((metric, idx) => {
              const IconComp = metric.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-black/5 shadow-md flex flex-col justify-between"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#98E724]/25 text-slate-950 flex items-center justify-center mb-2 shadow-xs">
                    <IconComp size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight block">
                      {metric.value}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 block mt-0.5">
                      {metric.label}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block mt-0.5">
                      {metric.desc}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* NEW: FREE VS. PRO COMPARISON MATRIX CARD */}
        {/* ======================================================== */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] sm:rounded-[36px] p-5 sm:p-7 border border-black/5 shadow-xl mb-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/10 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1">
                <Crown size={12} className="text-amber-500" /> Plan Comparison
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-950">
                Free vs. Super Nexora Pro
              </h3>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-black">
              <span className="text-slate-500 px-3 py-1 bg-slate-100 rounded-full">Free</span>
              <span className="text-slate-950 px-3.5 py-1 bg-[#98E724] rounded-full shadow-xs">VIP Pro</span>
            </div>
          </div>

          <div className="space-y-6 mt-5">
            {COMPARISON_FEATURES.map((cat, cIdx) => (
              <div key={cIdx} className="space-y-2.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-400 block pl-1">
                  {cat.category}
                </span>

                <div className="space-y-2">
                  {cat.items.map((item, iIdx) => (
                    <div 
                      key={iIdx}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {item.name}
                      </span>

                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 text-xs font-bold shrink-0">
                        {/* Free column */}
                        <div className="flex items-center gap-1.5 text-slate-500 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-slate-200">
                          <span className="sm:hidden text-[9px] uppercase font-bold text-slate-400 block">Free:</span>
                          <span className="text-[11px] sm:text-xs">{item.free}</span>
                        </div>

                        {/* Pro column */}
                        <div className="flex items-center gap-1.5 text-slate-950 bg-[#98E724]/20 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-[#98E724]/40">
                          <span className="sm:hidden text-[9px] uppercase font-bold text-[#64A312] block">Pro:</span>
                          <Check size={14} className="text-[#64A312] stroke-[3]" />
                          <span className="text-[11px] sm:text-xs font-black text-slate-950">{item.pro}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Drawer: Alternative Payment Channels & Soundscape Preview */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.CLICK);
              setShowAdvancedTools(!showAdvancedTools);
            }}
            id="toggle-advanced-tools-btn"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 py-2 px-4 sm:px-5 rounded-full bg-black/5 hover:bg-black/10 transition-all cursor-pointer"
          >
            <span>Crypto payments & Soundscape preview</span>
            {showAdvancedTools ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {showAdvancedTools && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4 text-left overflow-hidden"
              >
                {/* Crypto Payment Method Selection */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white shadow-md border border-black/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Coins size={16} className="text-amber-500" /> Alternative Payment Methods
                    </span>
                    <div className="flex bg-slate-100 p-0.5 rounded-xl">
                      {(['USDT', 'BTC', 'm-GURUSH'] as const).map((method) => (
                        <button
                          key={method}
                          onClick={() => setSelectedPaymentMethod(method)}
                          className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                            selectedPaymentMethod === method 
                              ? 'bg-white text-slate-950 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wallet addresses for copy */}
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-sans text-[10px] sm:text-xs font-bold text-slate-400 block">BTC:</span>
                        <span className="text-slate-800 text-[11px] sm:text-xs">bc1q5qfv4fkvd9s5j90pc6mg9fjxjyelt992fu0xfh</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('bc1q5qfv4fkvd9s5j90pc6mg9fjxjyelt992fu0xfh', 'btc')}
                        className="px-3 py-1.5 bg-amber-500/10 text-amber-700 font-sans font-bold text-[11px] sm:text-xs rounded-lg hover:bg-amber-500/20 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'btc' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-sans text-[10px] sm:text-xs font-bold text-slate-400 block">USDT (TRC20):</span>
                        <span className="text-slate-800 text-[11px] sm:text-xs">0x0d10b62ca87c87bcfa91cee9a08d3041b10d104e</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('0x0d10b62ca87c87bcfa91cee9a08d3041b10d104e', 'usdt')}
                        className="px-3 py-1.5 bg-[#98E724]/20 text-slate-900 font-sans font-bold text-[11px] sm:text-xs rounded-lg hover:bg-[#98E724]/30 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'usdt' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Soundscapes & Live Synthesis */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white shadow-md border border-black/5">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mb-3">
                    <Music size={16} className="text-emerald-600" /> Focus Soundscapes Preview
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'binaural_gamma', title: '40Hz Gamma Focus' },
                      { id: 'pink_noise_rain', title: 'Pink Noise Rain' }
                    ].map((track) => (
                      <button
                        key={track.id}
                        onClick={() => {
                          if (isPlayingSound === track.id) {
                            stopSynthesizer();
                          } else {
                            startSynthesizer(track.id);
                          }
                        }}
                        className={`p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                          isPlayingSound === track.id 
                            ? 'bg-[#98E724]/20 border-[#98E724]' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{track.title}</span>
                        {isPlayingSound === track.id ? <Pause size={16} className="text-slate-900" /> : <Play size={16} className="text-slate-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Direct WhatsApp Contact Button */}
        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.SUCCESS);
              const selectedPlanObj = PLANS.find(p => p.id === selectedPlanId) || PLANS[2];
              const customMsg = `Hello! I would like to upgrade to Nexora Pro or ask a question.\n\n👤 UID: ${userId || 'User'}\n💎 Plan: ${selectedPlanObj.name} (${selectedPlanObj.price}${selectedPlanObj.period})\n\nPlease get in touch with me. Thank you!`;
              window.open(`https://api.whatsapp.com/send?phone=211929635502&text=${encodeURIComponent(customMsg)}`, '_blank');
            }}
            id="whatsapp-direct-contact-btn"
            className="w-full p-4 sm:p-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/25 flex items-center justify-between gap-3 border border-emerald-400/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center font-black shadow-md shrink-0">
                <MessageCircle size={24} className="fill-emerald-600 text-white stroke-[1.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base text-white">Chat on WhatsApp Directly</span>
                  <span className="bg-emerald-400/30 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                    Online
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  Direct support, upgrades & VIP activation · +211 929 635 502
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ArrowRight size={18} className="text-white" />
            </div>
          </motion.button>
        </div>

        {/* Footer Disclaimer & Terms */}
        <div className="text-center mt-6 text-[11px] sm:text-xs text-slate-600 font-medium">
          <p>Nexora Health & Discipline Systems · Auto-renewable · Cancel anytime</p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* NEW: DYNAMIC APPEAR/HIDE FLOATING CONVERSION DOCK */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showFloatingDock && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none"
          >
            <div className="max-w-md sm:max-w-xl mx-auto bg-[#191C18]/95 backdrop-blur-xl text-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/15 flex items-center justify-between gap-3 pointer-events-auto">
              <div className="pl-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-white">
                    {PLANS.find(p => p.id === selectedPlanId)?.name}
                  </span>
                  <span className="bg-[#98E724] text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {PLANS.find(p => p.id === selectedPlanId)?.price}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-300 block font-medium">
                  {isFreeTrialEnabled ? '4-Day Free Pro Test ($0.00 today)' : 'Instant VIP Access'}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handlePrimaryAction}
                disabled={!isOnline || isActivatingTrial}
                className="py-2.5 px-5 sm:px-6 rounded-2xl bg-[#98E724] hover:bg-[#86D41A] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                {isActivatingTrial ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>{isFreeTrialEnabled ? 'Claim 4 Days Free' : 'Continue'}</span>
                    <Sparkles size={14} className="fill-slate-950" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
