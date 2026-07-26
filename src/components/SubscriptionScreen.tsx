import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Zap, 
  ShieldCheck, 
  Users, 
  X, 
  MessageSquare, 
  Heart, 
  Play, 
  Pause, 
  Volume2, 
  Bot, 
  Sparkles, 
  Music, 
  Palette, 
  Lock, 
  ArrowRight,
  RefreshCw,
  Copy,
  Coins,
  CheckCircle2,
  Globe,
  Star,
  ExternalLink
} from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { Mascot } from './Mascot';

interface SubscriptionScreenProps {
  onBack: () => void;
  userId: string;
  onActivatePro?: () => void;
  onUpdateSettings?: (settings: any) => void;
  onStartProTest?: () => void;
  settings?: any;
  stats?: any;
}

export function SubscriptionScreen({ 
  onBack, 
  userId, 
  onActivatePro,
  onUpdateSettings,
  onStartProTest,
  settings,
  stats = { streak: 0, xp: 0, coins: 0, level: 1 }
}: SubscriptionScreenProps) {
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState<'coach' | 'soundscapes' | 'auras'>('coach');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'USDT' | 'BTC' | 'ALL'>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<'yearly' | 'monthly' | 'weekly'>('yearly');

  // Determine if Pro (or Pro Test mode) is currently active
  const isPro = settings?.isPro || settings?.proTestActive;

  // Crypto conversion rate reference (approx 1 BTC = $66,666, 1 USDT = $1.00 USD)
  const plans = [
    {
      id: 'yearly',
      name: 'YEARLY MASTER',
      usd: '$64.00',
      period: '/ year',
      equivalent: '$5.33 / month',
      usdt: '64.00 USDT',
      btc: '~0.00096 BTC',
      savings: 'SAVE 64%',
      badge: 'BEST VALUE',
      popular: true,
      accent: 'border-emerald-500/60 bg-gradient-to-b from-emerald-500/10 via-slate-900 to-slate-950',
      badgeBg: 'bg-emerald-500 text-slate-950',
      icon: '💎',
      desc: 'Full year of unlimited protocol access & priority features.'
    },
    {
      id: 'monthly',
      name: 'MONTHLY LEGEND',
      usd: '$14.99',
      period: '/ month',
      equivalent: '$0.50 / day',
      usdt: '14.99 USDT',
      btc: '~0.000225 BTC',
      savings: 'MOST POPULAR',
      badge: 'LEGEND CHOICE',
      popular: false,
      accent: 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950',
      badgeBg: 'bg-amber-500 text-slate-950',
      icon: '🔥',
      desc: 'Flexible monthly plan with complete Architect Lab unlocks.'
    },
    {
      id: 'weekly',
      name: 'WEEKLY SPRINT',
      usd: '$4.99',
      period: '/ week',
      equivalent: '$0.71 / day',
      usdt: '4.99 USDT',
      btc: '~0.000075 BTC',
      savings: 'FLEXIBLE',
      badge: 'STARTER',
      popular: false,
      accent: 'border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 via-slate-900 to-slate-950',
      badgeBg: 'bg-indigo-500 text-white',
      icon: '⚡',
      desc: 'Short-term boost to test and master your discipline habits.'
    }
  ];

  const features = [
    { title: 'UI Architect Lab', description: 'Redesign the app your way. Drag, reorder, and customize every widget.' },
    { title: 'Challenge Archive', description: 'Filter official challenges and target hyper-specific focus goals.' },
    { title: 'Unlimited Everything', description: 'No daily limits. All tools, trackers, and soundscapes unlocked.' },
    { title: 'Exclusive Content', description: 'Special neon companion skins and binaural focus soundtracks.' },
  ];

  // Copy helper with animated feedback
  const copyToClipboard = (text: string, label: string) => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Track scroll position for dynamic styling
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ==========================================
  // FEATURE 1: AI COACH STATE & GENERATOR
  // ==========================================
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'coach', text: string }>>([
    { sender: 'coach', text: "Greetings, legend! I am Nexora, your AI Discipline Protocol Coach. I analyze your neural patterns and routine performance to guide you toward peak mental focus. What strategy shall we analyze today?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAskCoach = async (question: string) => {
    if (aiLoading) return;
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    setAiLoading(true);

    setTimeout(() => {
      let aiResponse = "";
      if (question.includes("optimize")) {
        aiResponse = `Analyzing your current habits, Champion. To optimize your focus, trigger your hardest routine within 2 hours of waking. Your brain's dopamine reservoirs are highest here. Shield your visual workspace from smartphone ping notifications.`;
      } else if (question.includes("protocol")) {
        aiResponse = `Understood. Generating a 3-Day custom recovery protocol:\n• Day 1: Absolute sensory fast (No digital media for first 60 minutes after waking).\n• Day 2: Hyper-hydration (Drink 500ml pure water with pink salt before lunch).\n• Day 3: Physical activation (Complete a 5-minute cold exposure session or 50 pushups to oxygenate neural cells).`;
      } else {
        const streakText = stats.streak > 0 ? `Your ${stats.streak}-day streak is a fantastic neural baseline.` : `Let's focus on anchoring a single 1-day streak to reset your brain.`;
        aiResponse = `System Audit complete.\n• Level: ${stats.level}\n• XP: ${stats.xp}\n• Current Streak: ${stats.streak} days\n\n${streakText} To double your XP gain efficiency, always start your core daily challenge first. I recommend trying out our Binaural Focus Sound pack to lock into a deep flow state immediately.`;
      }

      setMessages(prev => [...prev, { sender: 'coach', text: aiResponse }]);
      setAiLoading(false);
    }, 1200);
  };

  // ==========================================
  // FEATURE 2: focus Soundscapes engine (web audio)
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

      } else if (type === 'binaural_delta') {
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(150, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(154, ctx.currentTime);

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
        setIsPlayingSound('binaural_delta');

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

        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        modulator.frequency.setValueAtTime(0.12, ctx.currentTime);
        modGain.gain.setValueAtTime(0.2, ctx.currentTime);

        modulator.connect(modGain);
        
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
    if (audioNodesRef.current.length > 0) {
      const masterGain = audioNodesRef.current[0];
      if (masterGain && masterGain.gain) {
        masterGain.gain.setValueAtTime(audioVolume, audioCtxRef.current?.currentTime || 0);
      }
    }
  }, [audioVolume]);

  useEffect(() => {
    return () => {
      if (audioNodesRef.current.length > 0) {
        audioNodesRef.current.forEach(node => {
          try { node.stop(); } catch (e) {}
          try { node.disconnect(); } catch (e) {}
        });
      }
    };
  }, []);

  // ==========================================
  // FEATURE 3: COMPANION skin / aura customized
  // ==========================================
  const handleSelectAuraSkin = (skinId: string) => {
    if (!isPro) return;
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    if (onUpdateSettings) {
      onUpdateSettings({ activeSkin: skinId });
    }
  };

  const getAuraColor = (skinId: string) => {
    switch (skinId) {
      case 'cosmic': return 'rgba(168, 85, 247, 0.4)';
      case 'neon': return 'rgba(236, 72, 153, 0.4)';
      case 'fire': return 'rgba(249, 115, 22, 0.4)';
      case 'ice': return 'rgba(14, 165, 233, 0.4)';
      case 'nature': return 'rgba(16, 185, 129, 0.4)';
      case 'royal_gold': return 'rgba(234, 179, 8, 0.4)';
      default: return 'rgba(59, 130, 246, 0.4)';
    }
  };

  const activeSkin = settings?.activeSkin || 'standard';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative bg-slate-950 text-white overflow-x-hidden selection:bg-emerald-500/30"
    >
      {/* Background Radial Glow Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ 
            y: scrollY * 0.2,
            scale: 1 + scrollY * 0.0005,
            opacity: 0.3 + (Math.sin(scrollY * 0.005) * 0.1)
          }}
          className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent blur-[140px]"
        />
        <motion.div 
          style={{ 
            y: scrollY * -0.1,
            scale: 1.1 - scrollY * 0.0003,
            opacity: 0.3 + (Math.cos(scrollY * 0.003) * 0.1)
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tl from-indigo-500/15 via-amber-500/5 to-transparent blur-[160px]"
        />
      </div>

      {/* Main Container - EXPANDED WIDESCREEN SUPPORT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              stopSynthesizer();
              onBack();
            }} 
            className="p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md group flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-200"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Workspace</span>
          </motion.button>

          {/* Member Social Proof Pill */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Users size={14} />
            <span>14,200+ Active Pro Legends</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-12 space-y-4 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-emerald-400 via-teal-500 to-amber-500 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/25 mb-2 relative group"
          >
            <Crown size={42} className="text-slate-950 drop-shadow-md sm:w-12 sm:h-12 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-white/30 animate-ping opacity-20" />
          </motion.div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/20">
            <Sparkles size={12} /> UNLOCK MAXIMUM DISCIPLINE
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white">
            NEXORA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">PRO</span>
          </h1>
          <p className="text-slate-300 max-w-xl text-base sm:text-lg font-medium leading-relaxed">
            The ultimate protocol for discipline legends. Access the Architect Lab, custom soundscapes, and support independent AI engineering.
          </p>

          {/* Risk Free Guarantee Banner */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-extrabold text-slate-400 pt-2">
            <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck size={14} /> 7-Day Money Back Guarantee</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-300"><CheckCircle2 size={14} /> Cancel Anytime</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1 text-amber-400"><Zap size={14} /> Instant Activation</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NEW CRYPTO & CURRENCY SELECTOR STRIP */}
        {/* ======================================================== */}
        <div className="mb-10 p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
              <Coins size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Display Currency & Crypto Rates</h3>
              <p className="text-xs text-slate-400 font-medium">Select your preferred viewing format (USD, USDT, or Bitcoin BTC equivalent)</p>
            </div>
          </div>

          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/10 shrink-0">
            {(['ALL', 'USD', 'USDT', 'BTC'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                  setSelectedCurrency(curr);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedCurrency === curr 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {curr === 'ALL' && '✨ All Rates'}
                {curr === 'USD' && '💵 USD ($)'}
                {curr === 'USDT' && '🪙 USDT (Tether)'}
                {curr === 'BTC' && '₿ BTC (Bitcoin)'}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* WIDESCREEN PRICING CARDS GRID (3-COLUMN DESKTOP LAYOUT) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 items-stretch">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedPlanId(plan.id as any)}
                className={`p-6 sm:p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden backdrop-blur-xl ${
                  plan.accent
                } ${
                  isSelected ? 'ring-2 ring-emerald-400 shadow-2xl shadow-emerald-500/20 scale-[1.02]' : 'opacity-95 hover:opacity-100'
                }`}
              >
                {/* Popular / Best Value Badge */}
                {plan.badge && (
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest shadow-md ${plan.badgeBg}`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="text-4xl mb-4">{plan.icon}</div>
                  <h3 className="font-black text-xl text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-300 font-medium mt-1 mb-6 leading-relaxed">{plan.desc}</p>

                  {/* Dynamic Pricing View based on Currency Selection */}
                  <div className="space-y-2 py-4 border-y border-white/10 my-4 bg-black/20 p-4 rounded-2xl">
                    {(selectedCurrency === 'ALL' || selectedCurrency === 'USD') && (
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl sm:text-3xl font-black text-white">{plan.usd}</span>
                        <span className="text-xs font-bold text-slate-400">{plan.period}</span>
                      </div>
                    )}

                    {(selectedCurrency === 'ALL' || selectedCurrency === 'USDT') && (
                      <div className="flex items-center justify-between text-emerald-400 font-black text-xs sm:text-sm">
                        <span>🪙 USDT:</span>
                        <span>{plan.usdt}</span>
                      </div>
                    )}

                    {(selectedCurrency === 'ALL' || selectedCurrency === 'BTC') && (
                      <div className="flex items-center justify-between text-amber-400 font-mono text-xs font-bold">
                        <span>₿ Bitcoin:</span>
                        <span>{plan.btc}</span>
                      </div>
                    )}

                    <div className="pt-2 text-[11px] font-extrabold text-teal-300 flex items-center justify-between">
                      <span>Equiv Rate:</span>
                      <span>{plan.equivalent}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs font-medium text-slate-200 mb-6">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" /> Full Architect UI Customizer</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" /> Unlimited AI Coach Queries</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" /> Web Audio Soundscapes Live</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" /> High-Fidelity Companion Skins</li>
                  </ul>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    vibrate(VIBRATION_PATTERNS.SUCCESS);
                    const whatsappMsg = `Hi Nexora, I'd like to subscribe to the ${plan.name} (${plan.usd} / ${plan.usdt} / ${plan.btc}). My UID: ${userId}`;
                    window.open(`https://api.whatsapp.com/send?phone=211929635502&text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                    plan.id === 'yearly'
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 shadow-emerald-500/20'
                      : plan.id === 'monthly'
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                  }`}
                >
                  <MessageSquare size={16} /> SUBSCRIBE VIA WHATSAPP
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Pro Test Mode Banner */}
        {onStartProTest && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-teal-600/20 border-2 border-blue-500/30 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/40 shrink-0">
                  <Crown size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-white">PRO TEST DRIVE MODE</h3>
                    <span className="bg-blue-500 text-[9px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-widest">Free Trial</span>
                  </div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                    Test every feature, custom plan, and exclusive item for 15 minutes before choosing your plan. Experience peak focus.
                  </p>
                </div>
              </div>

              {(() => {
                const now = new Date();
                const lastTest = settings?.proTestStartedAt ? new Date(settings.proTestStartedAt) : null;
                const cooldownDays = 7;
                const canRetry = !lastTest || (now.getTime() - lastTest.getTime() > cooldownDays * 24 * 60 * 60 * 1000);
                
                if (canRetry) {
                  return (
                    <button 
                      onClick={() => {
                        vibrate(VIBRATION_PATTERNS.SUCCESS);
                        onStartProTest();
                      }}
                      className="w-full md:w-auto px-8 py-4 bg-white text-blue-600 hover:bg-slate-100 rounded-2xl font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
                    >
                      START 15-MIN FREE TEST
                    </button>
                  );
                } else {
                  const daysRemaining = Math.ceil((cooldownDays * 24 * 60 * 60 * 1000 - (now.getTime() - lastTest!.getTime())) / (24 * 60 * 60 * 1000));
                  return (
                    <div className="w-full md:w-auto px-6 py-4 bg-white/10 rounded-2xl border border-white/20 text-center opacity-80 shrink-0">
                       <p className="text-[9px] font-black uppercase text-white/50 tracking-widest mb-0.5">Cooldown Active</p>
                       <p className="text-xs font-black text-white">{daysRemaining} DAYS WAIT</p>
                    </div>
                  );
                }
              })()}
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* INTERACTIVE PRO MULTIVERSE COMMAND SUITE */}
        {/* ======================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 p-6 sm:p-10 rounded-[3rem] bg-slate-900/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden"
        >
          {/* Locked Overlay if not Pro */}
          {!isPro && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
                <Lock size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-emerald-400">PRO COMMAND SUITE LOCKED</h3>
              <p className="text-slate-200 text-xs sm:text-sm max-w-md mt-2 mb-6 font-medium">
                Unlock or test Nexora Pro to access the interactive AI Mentor, procedural focus sound waves synthesizer, and high-fidelity mascot skins customizer!
              </p>
              <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                  if (onStartProTest) onStartProTest();
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Start Free 15-Min Pro Test Mode
              </button>
            </div>
          )}

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-1">
                  Pro Interactive Deck
                </span>
                <h3 className="text-xl sm:text-2xl font-black italic tracking-tight text-white uppercase">MULTIVERSE COMMAND SUITE</h3>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/10 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab('coach')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'coach' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Bot size={14} /> <span>AI COACH</span>
                </button>
                <button
                  onClick={() => setActiveTab('soundscapes')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'soundscapes' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Music size={14} /> <span>SOUNDSCAPE</span>
                </button>
                <button
                  onClick={() => setActiveTab('auras')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'auras' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Palette size={14} /> <span>SKINS</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: AI COACH */}
            {activeTab === 'coach' && (
              <div className="space-y-4">
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  Talk directly with Nexora's AI Mentor. We analyze your levels to forge optimal strategy plans.
                </p>
                <div className="h-64 bg-black/60 rounded-2xl border border-white/10 p-4 overflow-y-auto space-y-3 font-medium flex flex-col">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'coach' 
                          ? 'bg-emerald-500/10 text-emerald-200 self-start border border-emerald-500/20' 
                          : 'bg-white/10 text-white self-end border border-white/10'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="bg-emerald-500/10 text-emerald-200 p-3 rounded-2xl text-xs self-start border border-emerald-500/20 flex items-center gap-1.5">
                      <RefreshCw size={12} className="animate-spin text-emerald-400" /> Thinking...
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    "Optimize my daily routine focus",
                    "Generate a custom 3-day recovery protocol",
                    "Audit my current statistics"
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      disabled={aiLoading}
                      onClick={() => handleAskCoach(q)}
                      className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1.5 transition-all text-left"
                    >
                      <Sparkles size={12} className="text-emerald-400 shrink-0" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SOUNDSCAPES PLAYER */}
            {activeTab === 'soundscapes' && (
              <div className="space-y-4">
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  Trigger procedural focus sound waves synthesized live inside your browser using the Web Audio API.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'binaural_gamma', title: '⚡ 40Hz Gamma Focus', desc: 'Stereo headphones required. Matches brain state for pure cognitive flow.' },
                    { id: 'binaural_delta', title: '🌌 4Hz Delta Sleep', desc: 'Promotes deep recovery sleep waves and calms neural hyper-activity.' },
                    { id: 'pink_noise_rain', title: '🌧️ Calming Rain Mask', desc: 'Procedural low-pass acoustic noise that perfectly blankets ambient room noise.' }
                  ].map((track) => (
                    <div 
                      key={track.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isPlayingSound === track.id 
                          ? 'bg-emerald-500/10 border-emerald-500/50' 
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <div>
                        <h4 className="font-black text-xs text-white mb-1 uppercase tracking-tight">{track.title}</h4>
                        <p className="text-[10px] text-slate-300 font-medium leading-relaxed mb-4">{track.desc}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (isPlayingSound === track.id) {
                            stopSynthesizer();
                          } else {
                            startSynthesizer(track.id);
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                          isPlayingSound === track.id
                            ? 'bg-rose-500 hover:bg-rose-600 text-white'
                            : 'bg-white text-slate-950 hover:bg-slate-100'
                        }`}
                      >
                        {isPlayingSound === track.id ? (
                          <>
                            <Pause size={12} /> STOP WAVE
                          </>
                        ) : (
                          <>
                            <Play size={12} /> PLAY LIVE
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Volume & Wave Visualizer */}
                {isPlayingSound && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-black/40 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 flex-1 w-full justify-center sm:justify-start">
                      <Volume2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Volume</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                        className="w-24 sm:w-32 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div className="h-8 flex gap-1 items-center shrink-0">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-emerald-400 rounded-full"
                          style={{
                            height: `${15 + Math.random() * 85}%`,
                            animation: `bounce 0.8s ease-in-out infinite alternate`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MASCOT CUSTOMIZER */}
            {activeTab === 'auras' && (
              <div className="space-y-4">
                <p className="text-slate-300 text-xs sm:text-sm font-medium">
                  Activate elite, high-fidelity neon skins and custom companion aura particles that glow in real-time.
                </p>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-40 h-40 bg-black/60 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0 group">
                    <div 
                      className="absolute inset-4 rounded-full filter blur-xl opacity-60 animate-pulse transition-all duration-500"
                      style={{
                        background: `radial-gradient(circle, ${getAuraColor(activeSkin)} 0%, transparent 70%)`
                      }}
                    />
                    
                    <Mascot theme={activeSkin} className="w-24 h-24 relative z-10 transition-transform duration-300 group-hover:scale-110" mood="happy" />
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
                    {[
                      { id: 'standard', name: 'Classic Blue', color: 'bg-[#38BDF8]' },
                      { id: 'cosmic', name: 'Cosmic Nebula', color: 'bg-[#A855F7]' },
                      { id: 'neon', name: 'Cyber Neon', color: 'bg-[#EC4899]' },
                      { id: 'fire', name: 'Volcanic Spark', color: 'bg-[#F97316]' },
                      { id: 'ice', name: 'Glacier Frost', color: 'bg-[#0EA5E9]' },
                      { id: 'nature', name: 'Neural Bio', color: 'bg-[#10B981]' }
                    ].map((skin) => (
                      <button
                        key={skin.id}
                        onClick={() => handleSelectAuraSkin(skin.id)}
                        className={`p-3 rounded-xl border transition-all text-left flex items-center gap-2 ${
                          activeSkin === skin.id 
                            ? 'bg-emerald-500/10 border-emerald-500/50' 
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full ${skin.color}`} />
                        <div>
                          <p className="text-[10px] font-black text-white leading-none mb-0.5">{skin.name}</p>
                          <p className={`text-[8px] font-bold uppercase tracking-widest ${activeSkin === skin.id ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {activeSkin === skin.id ? 'Active' : 'Aura'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Feature Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {features.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              key={f.title}
              className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Check size={20} />
              </div>
              <h4 className="font-black text-base text-white mb-1">{f.title}</h4>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-16 overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/90 backdrop-blur-xl">
          <div className="p-6 sm:p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div>
              <h3 className="font-black text-xl tracking-tight uppercase text-white">PROTOCOL COMPARISON</h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Free Tier vs Architect Pro</p>
            </div>
            <Crown size={28} className="text-amber-400" />
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Capability</th>
                  <th className="px-6 py-4 text-center bg-white/5">Free</th>
                  <th className="px-6 py-4 text-center bg-emerald-500/10 text-emerald-400">Pro</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium">
                {[
                  { name: 'Core Challenges', free: true, pro: true },
                  { name: 'Community Access', free: true, pro: true },
                  { name: 'UI Customization', free: 'Limited', pro: 'Full (Architect Lab)' },
                  { name: 'Goal Limits', free: '3-5 Stages', pro: 'Unlimited (Up to 20)' },
                  { name: 'Soundtracks', free: 'Standard', pro: 'High-Fidelity Packs' },
                  { name: 'Mascot Skins', free: 'Basic', pro: 'Experimental/Elite' },
                  { name: 'Support', free: 'Community', pro: 'Priority Protocol' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200 uppercase tracking-tight">{row.name}</td>
                    <td className="px-6 py-4 text-center text-slate-400 bg-white/5 font-black">
                      {typeof row.free === 'boolean' ? (row.free ? <Check size={16} className="mx-auto text-emerald-400" /> : <X size={16} className="mx-auto text-slate-600" />) : row.free}
                    </td>
                    <td className="px-6 py-4 text-center bg-emerald-500/5 font-black text-emerald-400">
                      {typeof row.pro === 'boolean' ? (row.pro ? <Crown size={16} className="mx-auto text-amber-400" /> : <X size={16} className="mx-auto text-rose-500" />) : row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crypto & Direct Payment Details */}
        <div className="p-6 sm:p-10 rounded-[3rem] bg-slate-900/90 border border-white/10 backdrop-blur-xl mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
                <Coins size={18} /> CRYPTO & DIRECT MANUAL PAYMENT
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Prefer paying with Crypto (BTC/USDT) or m-GURUSH?</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Send your payment to the wallet addresses below along with your Unique User ID <b className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">({userId})</b> via WhatsApp to get activated instantly.
              </p>

              {/* Copyable Wallet Cards */}
              <div className="space-y-3 font-mono text-xs pt-2">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 group hover:border-amber-500/40 transition-colors">
                  <div className="break-all">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase font-sans mb-0.5">Bitcoin (BTC) Wallet:</span>
                    <span className="text-amber-200 select-all font-semibold">bc1q5qfv4fkvd9s5j90pc6mg9fjxjyelt992fu0xfh</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('bc1q5qfv4fkvd9s5j90pc6mg9fjxjyelt992fu0xfh', 'btc')}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl font-sans font-extrabold text-xs transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Copy size={12} /> {copiedKey === 'btc' ? 'Copied!' : 'Copy Address'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 group hover:border-emerald-500/40 transition-colors">
                  <div className="break-all">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase font-sans mb-0.5">USDT (ERC20 / TRC20) Wallet:</span>
                    <span className="text-emerald-200 select-all font-semibold">0x0d10b62ca87c87bcfa91cee9a08d3041b10d104e</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('0x0d10b62ca87c87bcfa91cee9a08d3041b10d104e', 'usdt')}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-xl font-sans font-extrabold text-xs transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Copy size={12} /> {copiedKey === 'usdt' ? 'Copied!' : 'Copy Address'}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 flex flex-col justify-center gap-3 shrink-0">
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?phone=211929635502&text=${encodeURIComponent(`Hi Nexora, I'd like to activate Pro manually. My UID is: ${userId}`)}`, '_blank')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} /> OPEN WHATSAPP CHAT
              </button>

              {onActivatePro && (
                <button 
                  onClick={() => {
                    if (confirm("Admin Verification Mode: Instantly activate Pro on this device?")) {
                      onActivatePro();
                      onBack();
                    }
                  }}
                  className="py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors text-center"
                >
                  ⚡ Admin Quick Verify
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center pb-8">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Nexora Discipline Systems © 2026</p>
        </div>
      </div>
      
      {/* Keyframe animations */}
      <style>{`
        @keyframes bounce {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </motion.div>
  );
}

