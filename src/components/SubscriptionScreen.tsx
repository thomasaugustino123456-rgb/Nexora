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
  RefreshCw
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

  // Determine if Pro (or Pro Test mode) is currently active
  const isPro = settings?.isPro || settings?.proTestActive;

  const features = [
    { title: 'UI Architect Lab', description: 'Redesign the app your way. Drag and hide anything.' },
    { title: 'Challenge Archive', description: 'Filter official challenges. Only focus on what matters.' },
    { title: 'Unlimited Everything', description: 'No daily limits. All tools unlocked.' },
    { title: 'Exclusive Content', description: 'Special skins and high-fidelity soundtracks.' },
  ];

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

    // Simulate AI loading with stateful analytics feedback
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

  // Stop any active synthesized soundwaves
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

  // Synthesize binaural frequencies or high-contrast pink-noise masking on-the-fly!
  const startSynthesizer = (type: string) => {
    stopSynthesizer();
    vibrate(VIBRATION_PATTERNS.SUCCESS);

    try {
      // Lazy init AudioContext securely
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      // Ensure AudioContext is resumed in case browser blocked it
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audioVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      audioNodesRef.current.push(masterGain);

      if (type === 'binaural_gamma') {
        // Binaural 40Hz Gamma Focus: Left Ear = 200Hz, Right Ear = 240Hz
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
        // Binaural 4Hz Delta Sleep: Left Ear = 150Hz, Right Ear = 154Hz
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
        // Synthesizing calming Pink Noise (Brownish Rain Ambient Noise Mask)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Brown noise math simulation for deep rainfall rumble
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Amplify slightly for comfortable volume levels
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        // Apply a BiquadFilter lowpass to make it sound incredibly smooth and watery
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        // Amplitude modulator (creates waves rolling or soft wind gusting)
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        modulator.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow cycle (8 seconds)
        modGain.gain.setValueAtTime(0.2, ctx.currentTime); // modulate up to 20%

        modulator.connect(modGain);
        // We link the modulator to gain directly
        
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

  // Adjust volume in real-time
  useEffect(() => {
    if (audioNodesRef.current.length > 0) {
      // First node in refs is the master Gain Node
      const masterGain = audioNodesRef.current[0];
      if (masterGain && masterGain.gain) {
        masterGain.gain.setValueAtTime(audioVolume, audioCtxRef.current?.currentTime || 0);
      }
    }
  }, [audioVolume]);

  // Cleanup synthesizer on component unmount
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
      className="min-h-screen relative bg-slate-950 text-white overflow-x-hidden selection:bg-amber-500/30"
    >
      {/* Dynamic Warm Glow Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ 
            y: scrollY * 0.2,
            scale: 1 + scrollY * 0.0005,
            opacity: 0.4 + (Math.sin(scrollY * 0.005) * 0.1)
          }}
          className="absolute top-[-20%] left-[-10%] w-[100vw] h-[100vw] rounded-full bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent blur-[120px]"
        />
        <motion.div 
          style={{ 
            y: scrollY * -0.1,
            scale: 1.2 - scrollY * 0.0003,
            opacity: 0.3 + (Math.cos(scrollY * 0.003) * 0.1)
          }}
          className="absolute bottom-[-20%] right-[-10%] w-[110vw] h-[110vw] rounded-full bg-gradient-to-tl from-blue-500/10 via-indigo-500/5 to-transparent blur-[140px]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 space-y-4 relative">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              stopSynthesizer();
              onBack();
            }} 
            className="absolute top-0 left-0 p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform sm:w-6 sm:h-6" />
          </motion.button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-amber-400 to-orange-600 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-amber-500/20 mb-2"
          >
            <Crown size={40} className="text-white drop-shadow-lg sm:w-12 sm:h-12" />
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white">NEXORA PRO</h1>
          <p className="text-slate-200 max-w-md text-base sm:text-lg font-medium leading-relaxed px-2">
            The ultimate protocol for discipline legends. Access the Architect Lab and support the mission.
          </p>
        </div>

        {/* Mission Transparency Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-12 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] bg-amber-500/5 border border-amber-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/30">
                <Heart size={12} fill="currentColor" /> THE MISSION
              </div>
              <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight uppercase">Where does your support go?</h2>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                Nexora is fully independent. We are a small team of engineers building high-contrast, beautiful productivity software without corporate venture funding. Your support directly enables:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {[
                  { icon: <Zap size={13}/>, text: 'Ultra-Fast AI Services' },
                  { icon: <ShieldCheck size={13}/>, text: 'Secure Cloud Synced Databases' },
                  { icon: <Crown size={13}/>, text: 'Exclusive Asset & Animation Design' },
                  { icon: <Users size={13}/>, text: 'Clean Interactive Soundscapes' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-amber-200/80">
                    <div className="p-1.5 bg-amber-500/20 rounded-md text-amber-500">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-2xl relative shrink-0">
              <div className="absolute inset-3 rounded-full border border-amber-500/20 animate-pulse" />
              <Crown className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] w-10 h-10 sm:w-16 sm:h-16" />
            </div>
          </div>
        </motion.div>

        {/* Pro Test Mode Card */}
        {onStartProTest && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-2 border-blue-500/30 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 rotate-3 group-hover:rotate-0 transition-transform shrink-0">
                <Crown className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">PRO TEST MODE</h3>
                  <span className="bg-blue-500 text-[8px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-widest">Limited Time</span>
                </div>
                <p className="text-blue-100 font-medium leading-relaxed max-w-lg text-xs sm:text-sm">
                  Curious about the power of Nexora Pro? Unlock every feature, custom plan, and exclusive item for 15 minutes. Experience the peak of consistency.
                </p>
                {settings?.proTestStartedAt && (
                   <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">
                      Last tested: {new Date(settings.proTestStartedAt).toLocaleDateString()}
                   </p>
                )}
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
                      className="w-full md:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-white text-blue-600 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all shrink-0"
                    >
                      START 15-MIN TEST
                    </button>
                  );
                } else {
                  const daysRemaining = Math.ceil((cooldownDays * 24 * 60 * 60 * 1000 - (now.getTime() - lastTest!.getTime())) / (24 * 60 * 60 * 1000));
                  return (
                    <div className="w-full md:w-auto px-6 py-4 sm:px-8 sm:py-5 bg-white/10 rounded-2xl border border-white/20 text-center opacity-70 shrink-0">
                       <p className="text-[9px] font-black uppercase text-white/40 tracking-widest leading-none mb-1">Cooldown Active</p>
                       <p className="text-xs sm:text-sm font-black text-white">{daysRemaining} DAYS WAIT</p>
                    </div>
                  );
                }
              })()}
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* NEW INTERACTIVE FEATURE: PRO MULTIVERSE SUITE (1, 2, 3) */}
        {/* ======================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] bg-slate-900/90 border border-amber-500/30 shadow-2xl relative overflow-hidden"
        >
          {/* Locked Overlay if not Pro */}
          {!isPro && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20 mb-4 animate-bounce">
                <Lock size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-amber-400">PRO MULTIVERSE COMMAND SUITE</h3>
              <p className="text-slate-200 text-xs sm:text-sm max-w-md mt-2 mb-6 font-medium">
                Unlock or test Nexora Pro to access the interactive AI Mentor, procedural focus sound waves synthesizer, and high-fidelity mascot skins customizer!
              </p>
              <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                  if (onStartProTest) onStartProTest();
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                Start Free Pro Test Mode
              </button>
            </div>
          )}

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-1">
                  Pro Interactive Deck
                </span>
                <h3 className="text-xl sm:text-2xl font-black italic tracking-tight text-white uppercase">MULTIVERSE COMMAND SUITE</h3>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab('coach')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                    activeTab === 'coach' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Bot size={14} /> <span className="hidden sm:inline">AI COACH</span>
                </button>
                <button
                  onClick={() => setActiveTab('soundscapes')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                    activeTab === 'soundscapes' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Music size={14} /> <span className="hidden sm:inline">SOUNDSCAPE</span>
                </button>
                <button
                  onClick={() => setActiveTab('auras')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                    activeTab === 'auras' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Palette size={14} /> <span className="hidden sm:inline">COMPANION</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: AI COACH */}
            {activeTab === 'coach' && (
              <div className="space-y-4">
                <p className="text-slate-200 text-xs sm:text-sm font-medium">
                  Talk directly with Nexora's AI Mentor. We analyze your levels to forge optimal strategy plans.
                </p>
                <div className="h-64 bg-black/60 rounded-2xl border border-white/5 p-4 overflow-y-auto space-y-3 font-medium flex flex-col">
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'coach' 
                          ? 'bg-amber-500/10 text-amber-200 self-start border border-amber-500/15' 
                          : 'bg-white/10 text-white self-end border border-white/10'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="bg-amber-500/10 text-amber-200 p-3 rounded-2xl text-xs self-start border border-amber-500/15 flex items-center gap-1.5">
                      <RefreshCw size={12} className="animate-spin text-amber-500" /> Thinking...
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
                      className="px-3.5 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-[10px] sm:text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1.5 transition-all text-left max-w-full"
                    >
                      <Sparkles size={11} className="text-amber-500 shrink-0" />
                      <span className="truncate">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SOUNDSCAPES PLAYER */}
            {activeTab === 'soundscapes' && (
              <div className="space-y-4">
                <p className="text-slate-200 text-xs sm:text-sm font-medium">
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
                          ? 'bg-amber-500/10 border-amber-500/50' 
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

                {/* Sound wave visualizer and Volume slider */}
                {isPlayingSound && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-black/40 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="flex items-center gap-2 text-amber-500 flex-1 w-full justify-center sm:justify-start">
                      <Volume2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Volume</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                        className="w-24 sm:w-32 accent-amber-500 cursor-pointer"
                      />
                    </div>
                    {/* Animated Synthesizer Wave SVG */}
                    <div className="h-8 flex gap-1 items-center shrink-0">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-amber-500 rounded-full"
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
                <p className="text-slate-200 text-xs sm:text-sm font-medium">
                  Activate elite, high-fidelity neon skins and custom companion aura particles that glow in real-time.
                </p>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Live Interactive Mascot Preview */}
                  <div className="w-40 h-40 bg-black/60 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0 group">
                    {/* Glowing Aura Loop */}
                    <div 
                      className="absolute inset-4 rounded-full filter blur-xl opacity-60 animate-pulse transition-all duration-500"
                      style={{
                        background: `radial-gradient(circle, ${getAuraColor(activeSkin)} 0%, transparent 70%)`
                      }}
                    />
                    
                    {/* Mini floating elements/particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(4)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-2 h-2 rounded-full opacity-60"
                          style={{
                            background: activeSkin === 'neon' ? '#EC4899' : activeSkin === 'cosmic' ? '#A855F7' : '#38BDF8',
                            top: `${20 + Math.random() * 60}%`,
                            left: `${20 + Math.random() * 60}%`,
                            animation: `float 2.5s ease-in-out infinite`,
                            animationDelay: `${i * 0.4}s`
                          }}
                        />
                      ))}
                    </div>

                    <Mascot theme={activeSkin} className="w-24 h-24 relative z-10 transition-transform duration-300 group-hover:scale-110" mood="happy" />
                  </div>

                  {/* Skins Grid List */}
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
                            ? 'bg-amber-500/10 border-amber-500/50' 
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full ${skin.color}`} />
                        <div>
                          <p className="text-[10px] font-black text-white leading-none mb-0.5">{skin.name}</p>
                          <p className={`text-[8px] font-bold uppercase tracking-widest ${activeSkin === skin.id ? 'text-amber-500' : 'text-slate-400'}`}>
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {features.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              key={f.title}
              className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Check size={20} />
                </div>
                <h4 className="font-black text-lg text-white">{f.title}</h4>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-24 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="p-8 border-b border-white/10 bg-white/5">
            <h3 className="font-black text-xl tracking-tight uppercase text-white">Protocol Comparison</h3>
            <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold mt-1">Free Tier vs Architect Pro</p>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-300">Capability</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-300 text-center bg-white/5">Free</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-amber-500 text-center bg-amber-500/5">Pro</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Core Challenges', free: true, pro: true },
                  { name: 'Community Access', free: true, pro: true },
                  { name: 'UI Customization', free: 'Limited', pro: 'Full (Architect Lab)' },
                  { name: 'Goal Limits', free: '3-5 Stages', pro: 'Unlimited (Up to 20)' },
                  { name: 'Soundtracks', free: 'Standard', pro: 'High-Fidelity Packs' },
                  { name: 'Mascot Skins', free: 'Basic', pro: 'Experimental/Elite' },
                  { name: 'Support', free: 'Community', pro: 'Priority Protocol' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-[11px]">
                    <td className="px-6 py-4 font-bold text-slate-200 uppercase tracking-tight whitespace-normal">{row.name}</td>
                    <td className="px-6 py-4 text-center text-slate-300 bg-white/5 font-black">
                      {typeof row.free === 'boolean' ? (row.free ? <Check size={14} className="mx-auto text-emerald-500" /> : <X size={14} className="mx-auto text-gray-700" />) : row.free}
                    </td>
                    <td className="px-6 py-4 text-center bg-amber-500/5 font-black text-amber-400">
                      {typeof row.pro === 'boolean' ? (row.pro ? <Crown size={14} className="mx-auto text-amber-500" /> : <X size={14} className="mx-auto text-rose-500" />) : row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4 mb-24">
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">SECURE PAYMENT PROTOCOLS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-4 hover:border-white/20 transition-all cursor-pointer hover:bg-white/10 group">
              <div className="text-4xl group-hover:rotate-12 transition-transform">💎</div>
              <div>
                <h3 className="font-black text-xl text-white">YEARLY</h3>
                <p className="text-amber-500 font-bold">$64.00 / year</p>
                <p className="text-[10px] text-slate-300 mt-2">Elite Master Access</p>
              </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-2 border-amber-500/50 flex flex-col items-center text-center space-y-4 relative hover:scale-105 transition-all cursor-pointer group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white">LEGEND CHOICE</div>
              <div className="text-4xl text-amber-400 group-hover:scale-125 transition-transform">🔥</div>
              <div>
                <h3 className="font-black text-xl text-white">MONTHLY</h3>
                <p className="text-amber-400 font-bold">$14.99 / mo</p>
                <p className="text-[10px] text-amber-300 mt-2">Maximum Protocol</p>
              </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-4 hover:border-white/20 transition-all cursor-pointer hover:bg-white/10 group">
              <div className="text-4xl text-blue-400 group-hover:-rotate-12 transition-transform">⚡</div>
              <div>
                <h3 className="font-black text-xl text-white">WEEKLY</h3>
                <p className="text-blue-400 font-bold">$4.99 / wk</p>
                <p className="text-[10px] text-slate-300 mt-2">Quick Protocol</p>
              </div>
            </div>
          </div>

          {/* Pay What You Want / Support Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600/10 via-slate-900 to-indigo-600/5 border-2 border-indigo-500/30 text-center space-y-8 overflow-hidden relative"
          >
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px]" />
            
            <div className="relative z-10 space-y-3">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <Heart className="text-indigo-400" size={28} />
              </div>
              <h3 className="text-3xl font-black tracking-tighter italic text-white">WILLINGLY SUPPORT</h3>
              <p className="text-base text-slate-200 max-w-lg mx-auto leading-relaxed">
                Nexora is built for the community. If you find value in our mission, you can choose to willingly support the lab with whatever amount you feel is right. Legends invest in the future.
              </p>
            </div>

            <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center gap-3 relative z-10">
              {['$5', '$10', '$25', '$50', '$100', 'Custom'].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.SUCCESS);
                    window.open(`https://api.whatsapp.com/send?phone=211929635502&text=Hi%20Nexora,%20I'd%20like%20to%20willingly%20support%20the%20mission%20with%20${val}.%20My%20UID:%20${userId}`, '_blank');
                  }}
                  className="px-6 py-4 bg-white/5 hover:bg-white text-slate-300 hover:text-slate-950 border border-white/10 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-xl shadow-black/20"
                >
                  {val}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="mt-8 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-black text-blue-400 flex items-center gap-2">
                  <MessageSquare size={20} /> CRYPTO & m-GURUSH
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Manual verification for South Sudan and Crypto users. Send payment and your UID <b className="text-white">({userId})</b> to WhatsApp.
                </p>
                <div className="space-y-3 font-mono text-[10px] sm:text-xs bg-black/50 p-5 rounded-2xl border border-white/5">
                  <p className="text-amber-200 select-all break-all leading-normal">
                    <span className="text-slate-400 font-bold block mb-1">BTC Address:</span>
                    bc1q5qfv4fkvd9s5j90pc6mg9fjxjyelt992fu0xfh
                  </p>
                  <p className="text-blue-200 select-all break-all leading-normal border-t border-white/5 pt-3">
                    <span className="text-slate-400 font-bold block mb-1">USDT (ERC20) Address:</span>
                    0x0d10b62ca87c87bcfa91cee9a08d3041b10d104e
                  </p>
                </div>
              </div>
              <div className="w-full md:w-64 flex flex-col justify-center gap-3">
                <button 
                  onClick={() => window.open(`https://api.whatsapp.com/send?phone=211929635502&text=Hi%20Nexora,%20I'd%20like%20to%20activate%20Pro%20manually.%20My%20UID%20is:%20${userId}`, '_blank')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> WHATSAPP
                </button>
                {onActivatePro && (
                  <button 
                    onClick={() => {
                      if (confirm("Developer Mode: Activate Pro instantly for verification?")) {
                        onActivatePro();
                        onBack();
                      }
                    }}
                    className="text-[8px] font-black text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors"
                  >
                    Auto-Verify (Admin)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pb-12">
          <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.6em]">Nexora Discipline Systems © 2026</p>
        </div>
      </div>
      
      {/* Dynamic Keyframes for simple CSS bounce & float */}
      <style>{`
        @keyframes bounce {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 0.8; }
          100% { transform: translateY(0px) scale(1); opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  );
}
