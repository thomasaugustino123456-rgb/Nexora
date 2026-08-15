import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Droplets, Flame, Brain, Palette, Star, Quote, Heart, Activity, Target, Crown, Sparkles, X, ShieldCheck, Zap, MessageSquare, Send, Smartphone, Download, Share, HelpCircle, CheckCircle2, Clock } from 'lucide-react';
import { Mascot } from './Mascot';
import { TermsPage, PrivacyPage, SupportPage, LegalPagesContainer } from './LegalPages';
import { vibrate } from '../lib/vibrate';
import { MascotImage } from './MascotImage';
import { ProgressiveImage } from './ProgressiveImage';

import laptopMockupImg from '../assets/images/nexora_laptop_mockup_1782482220242.jpg';
import phoneMockupImg from '../assets/images/nexora_phone_mockup_1782482234392.jpg';
import tabletMockupImg from '../assets/images/nexora_tablet_mockup_1782482248569.jpg';
import combinedMockupImg from '../assets/images/nexora_combined_mockup_1782482262347.jpg';
import nexoraAppIconImg from '../assets/images/nexora_app_icon.png';

const laptopMockup = "https://res.cloudinary.com/ddtfq9acc/image/upload/v1782483131/file_00000000523471f4a52cc74dc987076e_oz7hi8.png";
const phoneMockup = "https://res.cloudinary.com/ddtfq9acc/image/upload/v1782483159/file_0000000063d471f48667d8802475ef0e_ytmlpw.png";
const tabletMockup = "https://res.cloudinary.com/ddtfq9acc/image/upload/v1782483181/file_00000000352871f4b2fac6a36ed8b31f_djawfz.png";
const combinedMockup = "https://res.cloudinary.com/ddtfq9acc/image/upload/v1782483209/file_0000000009c871f4a4d86809b9d548ea_rpn9kb.png";

const nexoraAppIcon = "/mascot.png";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  // Preload all device showcase images instantly
  useEffect(() => {
    const imagesToPreload = [laptopMockup, phoneMockup, tabletMockup, combinedMockup];
    imagesToPreload.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  const [view, setView] = useState<'home' | 'terms' | 'privacy' | 'support'>('home');
  const [activeDeviceTab, setActiveDeviceTab] = useState<'all' | 'phone' | 'tablet' | 'laptop'>('all');
  
  // Mascot customization states
  const [mascotTheme, setMascotTheme] = useState<string>('standard');
  const [mascotHat, setMascotHat] = useState<string>('none');
  const [mascotMood, setMascotMood] = useState<'happy' | 'angry' | 'boiling' | 'neutral' | 'surprised'>('happy');
  const [mascotEffect, setMascotEffect] = useState<string>('none');
  const [waterLogged, setWaterLogged] = useState<number>(1250);
  const [pushupsLogged, setPushupsLogged] = useState<number>(30);
  
  // Interactive Breathing states
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');
  const [breathPercent, setBreathPercent] = useState<number>(100);
  const [breathingActive, setBreathingActive] = useState(false);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Floating notifications feedback array
  const [notifications, setNotifications] = useState<{ id: string; text: string }[]>([]);
  const addNotification = (text: string) => {
    const id = Math.random().toString();
    setNotifications(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  };

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const startBreathingSim = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathPhase('Ready');
      setBreathPercent(100);
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
        breathIntervalRef.current = null;
      }
      addNotification("🌬️ Breathing simulator paused");
      return;
    }
    vibrate(15);
    setBreathingActive(true);
    setMascotMood('neutral');
    setBreathPhase('Inhale');
    setBreathPercent(60);
    addNotification("🌬️ Breathing simulator active! Synchronize now.");
    
    let tick = 0;
    const interval = setInterval(() => {
      tick = (tick + 1) % 12;
      if (tick < 4) {
        setBreathPhase('Inhale');
        setBreathPercent(60 + (tick * 10)); // scales up
      } else if (tick < 8) {
        setBreathPhase('Hold');
        setBreathPercent(100);
      } else {
        setBreathPhase('Exhale');
        setBreathPercent(100 - ((tick - 8) * 10)); // scales down
        setMascotMood('happy');
      }
    }, 1000);
    breathIntervalRef.current = interval;
  };

  useEffect(() => {
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, []);

  const applyPreset = (preset: 'hydration' | 'kinetic' | 'neural' | 'creative') => {
    vibrate(15);
    if (preset === 'hydration') {
      setMascotTheme('ice');
      setMascotMood('happy');
      setMascotEffect('orbs');
      setMascotHat('none');
      setWaterLogged(prev => prev + 250);
      addNotification("💧 Preset loaded: Glacier Ice theme & logged 250ml water!");
    } else if (preset === 'kinetic') {
      setMascotTheme('fire');
      setMascotMood('surprised');
      setMascotEffect('embers');
      setMascotHat('viking');
      setPushupsLogged(prev => prev + 10);
      addNotification("🔥 Preset loaded: Volcanic Fire theme, Viking Helmet & +10 pushups!");
    } else if (preset === 'neural') {
      setMascotTheme('cosmic');
      setMascotEffect('sparkles');
      setMascotHat('wizard');
      startBreathingSim();
    } else if (preset === 'creative') {
      setMascotTheme('neon');
      setMascotMood('happy');
      setMascotEffect('neon_glow');
      setMascotHat('artist');
      addNotification("🎨 Preset loaded: Electric Neon theme, Artist Beret & Glow active!");
    }
  };

  if (view === 'terms' || view === 'privacy' || view === 'support') {
    return <LegalPagesContainer onBack={() => setView('home')} initialTab={view} />;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f4f8ff] flex flex-col items-center relative selection:bg-blue-100 selection:text-blue-900">
      {/* Floating Interactive Live Notifications Stack */}
      <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-xs sm:max-w-sm">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/95 text-white text-xs font-bold px-4 py-3 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-2 pointer-events-auto backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span>{n.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Premium Upgrade Features Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-blue-100"
            >
              <button
                onClick={() => { vibrate(5); setShowUpgradeModal(false); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-blue-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/10">
                  <Crown size={32} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nexora Architect Elite</h3>
                <p className="text-slate-600 text-sm">Unlock the ultimate customized lifestyle environment with exclusive creator rewards and skins.</p>
                
                <div className="w-full space-y-3 pt-4 text-left">
                  {[
                    "Unlocks all 8 Premium Mascot Skins (Cosmic, Gold, Neon...)",
                    "Equip all 10+ legendary active Mascot hats & particles",
                    "Advanced analytics dashboard & historic run charts",
                    "Full Lofi Ambient Soundscapes soundboard integration",
                    "Cloud Sync & real-time offline persistence engines"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full pt-6 space-y-3">
                  <button
                    onClick={() => {
                      vibrate(25);
                      setShowUpgradeModal(false);
                      onGetStarted();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    Get Elite Access Now
                  </button>
                  <button
                    onClick={() => { vibrate(5); setShowUpgradeModal(false); }}
                    className="w-full text-slate-500 text-xs font-bold uppercase tracking-widest py-2 hover:text-slate-900 cursor-pointer"
                  >
                    Continue Sandbox Tour
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightweight Static Ambient Mesh Background - 0% Scroll CPU Overhead */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[700px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/40 via-blue-100/20 to-transparent" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(224,231,255,0.3)_0%,transparent_70%)]" />
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-6 md:p-10 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <MascotImage 
              alt="Nexora Logo" 
              className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-2xl relative z-10 shadow-md border border-white/60"
            />
          </div>
          <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Nexora</span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => {
              vibrate(10);
              setShowUpgradeModal(true);
            }}
            className="hidden sm:flex items-center gap-2 text-amber-600 font-bold px-4 py-2 bg-amber-50 hover:bg-amber-100 rounded-full border border-amber-200 shadow-2xs transition-all cursor-pointer"
          >
            <Crown size={15} fill="currentColor" />
            <span className="text-xs uppercase tracking-wider">Upgrade</span>
          </button>
          <button 
            onClick={() => {
              vibrate(10);
              onGetStarted();
            }}
            className="text-slate-600 font-bold hover:text-blue-600 transition-colors px-3 py-2 text-sm tracking-wide cursor-pointer"
          >
            LOG IN
          </button>
          <button
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase shadow-md shadow-blue-500/20 transition-all hidden md:block cursor-pointer active:scale-95"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 gap-12 lg:gap-16 z-10 relative">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="space-y-4">
            <div 
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 shadow-2xs cursor-pointer hover:border-blue-200 transition-all"
              onClick={() => {
                vibrate(10);
                setShowUpgradeModal(true);
              }}
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Next Evolution of Wellness</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Unlock Your<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600">
                True Potential
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
              Escape the mundane routine. Nexora gamifies your daily growth with an intuitive ritual system and a living mascot that evolves with your success.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button 
              onClick={() => {
                vibrate(20);
                onGetStarted();
              }}
              className="group relative bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95"
            >
              <span>START FLOWING</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Preset Test Pills */}
          <div className="space-y-2.5 w-full pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Try Interactive Presets:</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">💡 Tap to preview</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
              {[
                { icon: <Droplets />, bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/70', badgeBg: 'bg-cyan-500', text: 'Hydration', preset: 'hydration' as const },
                { icon: <Flame />, bg: 'bg-orange-50 text-orange-700 border-orange-200/70', badgeBg: 'bg-orange-500', text: 'Kinetic', preset: 'kinetic' as const },
                { icon: <Brain />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70', badgeBg: 'bg-emerald-500', text: 'Neural', preset: 'neural' as const },
                { icon: <Palette />, bg: 'bg-purple-50 text-purple-700 border-purple-200/70', badgeBg: 'bg-purple-500', text: 'Creative', preset: 'creative' as const }
              ].map((f, i) => (
                <button 
                  key={i}
                  onClick={() => applyPreset(f.preset)}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 font-bold text-xs shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer bg-white ${f.bg}`}
                >
                  <div className={`w-8 h-8 rounded-xl ${f.badgeBg} text-white flex items-center justify-center shrink-0`}>
                    {React.cloneElement(f.icon as React.ReactElement<any>, { size: 16, strokeWidth: 2.5 })}
                  </div>
                  <span>{f.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Interactive Mascot + Live Preview Panel */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg flex flex-col items-center">
          <div className="w-full relative flex flex-col items-center">
            {/* Mascot Centerpiece */}
            <div className="relative z-10 w-60 h-60 sm:w-68 sm:h-68 flex items-center justify-center">
              <div 
                className="relative z-10 w-full h-full cursor-pointer flex items-center justify-center"
                onClick={() => {
                  vibrate(10);
                  addNotification("✨ Tapped Nexo Mascot!");
                }}
              >
                <Mascot 
                  className="w-full h-full object-contain" 
                  theme={mascotTheme}
                  hat={mascotHat}
                  mood={mascotMood}
                  effect={mascotEffect}
                />
              </div>
            </div>

            {/* Compact Live Studio Control Panel */}
            <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-5 shadow-lg shadow-blue-900/5 space-y-4 z-20 mt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Crown size={16} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Nexo Live Studio</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Interactive</span>
              </div>

              {/* Skin Theme selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                  <span>Mascot Theme Skin</span>
                  <span className="text-blue-600 capitalize">{mascotTheme.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: 'standard', name: 'Classic', color: 'bg-sky-500' },
                    { value: 'cosmic', name: 'Cosmic', color: 'bg-purple-600' },
                    { value: 'neon', name: 'Neon', color: 'bg-pink-500' },
                    { value: 'fire', name: 'Fire', color: 'bg-orange-500' },
                    { value: 'ice', name: 'Ice', color: 'bg-cyan-500' },
                    { value: 'nature', name: 'Nature', color: 'bg-emerald-500' },
                    { value: 'royal_gold', name: 'Gold', color: 'bg-amber-500' },
                  ].map(th => (
                    <button
                      key={th.value}
                      onClick={() => {
                        vibrate(5);
                        setMascotTheme(th.value);
                        addNotification(`🎨 Theme: ${th.name}`);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                        mascotTheme === th.value
                          ? `${th.color} text-white shadow-xs ring-2 ring-blue-300/40`
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${mascotTheme === th.value ? 'bg-white' : th.color}`} />
                      <span>{th.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hats & Aura Tabs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 block">Accessories</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'crown', label: '👑' },
                      { id: 'cool', label: '🕶️' },
                      { id: 'wizard', label: '🧙' },
                      { id: 'artist', label: '🎨' },
                      { id: 'viking', label: '🪓' },
                    ].map(h => (
                      <button
                        key={h.id}
                        onClick={() => {
                          vibrate(5);
                          setMascotHat(h.id);
                        }}
                        className={`h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          mascotHat === h.id ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 block">Auras</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'none', label: 'Off' },
                      { id: 'sparkles', label: '✨' },
                      { id: 'embers', label: '🔥' },
                      { id: 'orbs', label: '🔮' },
                      { id: 'neon_glow', label: '🌈' },
                      { id: 'gold_dust', label: '⭐' },
                    ].map(a => (
                      <button
                        key={a.id}
                        onClick={() => {
                          vibrate(5);
                          setMascotEffect(a.id);
                        }}
                        className={`h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          mascotEffect === a.id ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ritual Simulator Actions */}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    vibrate(10);
                    setWaterLogged(prev => prev + 250);
                    setMascotMood('happy');
                    addNotification("💧 Logged +250ml Water!");
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Droplets size={14} className="text-sky-600" />
                  <span>+250ml</span>
                </button>

                <button
                  onClick={() => {
                    vibrate(15);
                    setPushupsLogged(prev => prev + 5);
                    setMascotMood('surprised');
                    addNotification("🔥 Logged +5 Pushups!");
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Flame size={14} className="text-orange-600" />
                  <span>+5 Pushups</span>
                </button>

                <button
                  onClick={startBreathingSim}
                  className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    breathingActive 
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <Brain size={14} />
                  <span>{breathingActive ? breathPhase : "Breathe"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Smooth Continuous Auto-Scrolling Ticker Strip */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 py-2.5 sm:py-3 overflow-hidden relative z-20 shadow-sm select-none border-y border-white/20">
        <div className="animate-marquee-continuous flex items-center">
          {[
            "Gamified Daily Rituals",
            "Living Mascot Companion",
            "Real-Time Cloud Sync",
            "Mindful Breathing Sanctuary",
            "Smart Hydration Tracking",
            "Daily Push-Up Milestones",
            "Creative Digital Sketch Canvas",
            "Legendary Outfits & Auras",
            "Synced Across Phone, Tablet & Laptop",
            "Zen Garden Habit Growth",
            "Zero-Ad Private & Encrypted Ecosystem",
            "Daily XP Boosts & League Ranks",
            "Gamified Daily Rituals",
            "Living Mascot Companion",
            "Real-Time Cloud Sync",
            "Mindful Breathing Sanctuary",
            "Smart Hydration Tracking",
            "Daily Push-Up Milestones",
            "Creative Digital Sketch Canvas",
            "Legendary Outfits & Auras",
            "Synced Across Phone, Tablet & Laptop",
            "Zen Garden Habit Growth",
            "Zero-Ad Private & Encrypted Ecosystem",
            "Daily XP Boosts & League Ranks"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 sm:gap-3.5 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider px-4 sm:px-6 whitespace-nowrap shrink-0">
              <Sparkles size={13} className="text-yellow-300 shrink-0 animate-pulse" />
              <span className="shrink-0 drop-shadow-xs">{item}</span>
              <span className="text-white/40 w-1.5 h-1.5 rounded-full bg-current shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Visual 3-Pillar Story Section with Lightweight Scroll Reveal */}
      <section className="w-full bg-white py-16 sm:py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ willChange: 'opacity, transform' }}
            className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16"
          >
            <span className="text-blue-600 font-extrabold text-xs uppercase tracking-widest">The Nexora Philosophy</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Greatness is built one <span className="text-blue-600">small ritual</span> at a time.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              Nexora synchronizes your mental, physical, and creative energies. When you thrive, Nexo thrives with you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Target size={24} />,
                badgeBg: 'bg-blue-100 text-blue-600',
                title: 'Gamified Momentum',
                desc: 'Transform daily routines into enjoyable micro-challenges. Level up streaks, earn coins, and unlock cosmetic rewards naturally.'
              },
              {
                icon: <Heart size={24} />,
                badgeBg: 'bg-emerald-100 text-emerald-600',
                title: 'Living Digital Pet',
                desc: 'Your companion reflects your balance. Feed it water when you drink, exercise together, and keep its mood glowing brightly.'
              },
              {
                icon: <Brain size={24} />,
                badgeBg: 'bg-purple-100 text-purple-600',
                title: 'Holistic Mind & Body',
                desc: 'A complete sanctuary combining physical hydration and push-ups with mindful breathing cycles and freeform creative drawing.'
              }
            ].map((pillar, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
                style={{ willChange: 'opacity, transform' }}
                className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-7 space-y-4 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl ${pillar.badgeBg} flex items-center justify-center`}>
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2x2 Bento Grid: Core Feature Arsenal with Lightweight Scroll Reveal */}
      <section className="w-full py-16 sm:py-24 bg-[#f8fbff] relative z-10 border-t border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ willChange: 'opacity, transform' }}
            className="text-center max-w-2xl mx-auto mb-12 space-y-2"
          >
            <span className="text-blue-600 font-extrabold text-xs uppercase tracking-widest">Core Feature Suite</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Everything you need to thrive</h2>
            <p className="text-base text-slate-600">Four essential daily pillars designed to keep you focused and balanced.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bento Card 1: Hydration */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ willChange: 'opacity, transform' }}
              className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                  <Droplets size={26} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Hydration Tracking</h3>
                  <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
                    Set customized daily hydration targets and log water in one tap. Keep your energy high and mental clarity razor sharp.
                  </p>
                </div>
              </div>
              <div className="bg-cyan-50/70 border border-cyan-100 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-900">Daily Target</span>
                <span className="text-sm font-black text-cyan-700">2,000 ml / day</span>
              </div>
            </motion.div>

            {/* Bento Card 2: Push-ups */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ willChange: 'opacity, transform' }}
              className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Flame size={26} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Daily Strength & Push-ups</h3>
                  <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
                    Build functional bodyweight strength with incremental daily push-up goals. Start small and build lasting physical resilience.
                  </p>
                </div>
              </div>
              <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-900">Progressive Overload</span>
                <span className="text-sm font-black text-orange-700">Daily XP Bonuses</span>
              </div>
            </motion.div>

            {/* Bento Card 3: Mindful Breathing */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ willChange: 'opacity, transform' }}
              className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Brain size={26} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Guided Mindful Breathing</h3>
                  <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
                    Immerse in visual rhythm-guided breathing exercises engineered to dissolve stress, reduce cortisol, and restore focus.
                  </p>
                </div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">4-4-4 Box Technique</span>
                <span className="text-sm font-black text-emerald-700">Instant Calm</span>
              </div>
            </motion.div>

            {/* Bento Card 4: Creative Drawing */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ willChange: 'opacity, transform' }}
              className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Palette size={26} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Creative Drawing Studio</h3>
                  <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
                    Unleash your imagination on a responsive canvas. Doodle, sketch, and unwind while your companion cheers your creativity.
                  </p>
                </div>
              </div>
              <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">Multi-Tool Canvas</span>
                <span className="text-sm font-black text-purple-700">Auto-Saved</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Multi-Device Showcase Section - Clean, Floating & Free of Card Boxes */}
      <section className="w-full bg-white py-14 sm:py-20 relative z-10 border-t border-slate-200/60" id="device-experience-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ willChange: 'opacity, transform' }}
            className="text-center max-w-2xl mx-auto mb-8 space-y-2"
          >
            <span className="text-blue-600 font-extrabold text-xs uppercase tracking-widest">Multi-Device Synergy</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Nexora Across All Your Screens</h2>
            <p className="text-sm sm:text-base text-slate-600">
              Seamlessly transition between smartphone, tablet, and laptop with real-time cloud synchronization.
            </p>
          </motion.div>

          {/* Clean Device Selector Tabs (No Icons) */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex flex-wrap justify-center gap-1 sm:gap-2 max-w-full">
              {[
                { id: 'all', label: 'All Devices' },
                { id: 'phone', label: 'Mobile' },
                { id: 'tablet', label: 'Tablet' },
                { id: 'laptop', label: 'Laptop' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    vibrate(8);
                    setActiveDeviceTab(tab.id as any);
                  }}
                  className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeDeviceTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm scale-[1.02]'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Floating Device Showcase (No Card Boxes Behind Image) */}
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center mb-12">
            <div className="w-full relative flex items-center justify-center min-h-[260px] sm:min-h-[380px] md:min-h-[440px] py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDeviceTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex items-center justify-center"
                >
                  <img 
                    src={
                      activeDeviceTab === 'phone' 
                        ? phoneMockup
                        : activeDeviceTab === 'tablet'
                        ? tabletMockup
                        : activeDeviceTab === 'laptop'
                        ? laptopMockup
                        : combinedMockup
                    }
                    alt={`Nexora on ${activeDeviceTab}`} 
                    className="w-full max-w-3xl h-auto max-h-[460px] object-contain drop-shadow-xl"
                    loading="eager"
                    decoding="async"
                    crossOrigin="anonymous"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Context Summary for Active Device */}
            <div className="w-full pt-6 mt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                  {activeDeviceTab === 'all' && 'Unified Cloud Experience'}
                  {activeDeviceTab === 'phone' && 'On-The-Go Companion'}
                  {activeDeviceTab === 'tablet' && 'Generous Creative Canvas'}
                  {activeDeviceTab === 'laptop' && 'Deep Productivity Station'}
                </span>
                <h4 className="text-lg sm:text-xl font-black text-slate-900">
                  {activeDeviceTab === 'all' && 'All-in-One Synchronized Ecosystem'}
                  {activeDeviceTab === 'phone' && 'Pocket Habit Tracker & Fast Logging'}
                  {activeDeviceTab === 'tablet' && 'Interactive Studio & Breathing Sanctuary'}
                  {activeDeviceTab === 'laptop' && 'Full Widescreen Dashboard & Analytics'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                  {activeDeviceTab === 'all' && 'Real-time Firestore synchronization guarantees your mascot, hydration logs, push-ups, and streaks update effortlessly across every screen.'}
                  {activeDeviceTab === 'phone' && 'Designed for quick thumb taps, instant water reminders, rapid push-up entries, and pocket notifications.'}
                  {activeDeviceTab === 'tablet' && 'Spacious touch screen interface perfectly tuned for mindful breathing relaxation and full-screen digital sketch drawing.'}
                  {activeDeviceTab === 'laptop' && 'Multi-widget layout featuring comprehensive streak graphs, mascot wardrobing, and leaderboard tracking.'}
                </p>
              </div>
              <button
                onClick={() => {
                  vibrate(10);
                  onGetStarted();
                }}
                className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Launch Nexora</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* 3 Dedicated Device Floating Previews (Free of Card Boxes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-6">
            {/* 1: Mobile */}
            <div 
              onClick={() => {
                vibrate(5);
                setActiveDeviceTab('phone');
              }}
              className="flex flex-col items-center text-center cursor-pointer group space-y-3"
            >
              <div className="w-full h-44 flex items-center justify-center p-2">
                <img 
                  src={phoneMockup} 
                  alt="Nexora Mobile" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Mobile</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                  Fast single-hand ritual logging, instant water tally, and push-up counter on the move.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                <span>View Mobile</span>
                <ArrowRight size={13} />
              </span>
            </div>

            {/* 2: Tablet */}
            <div 
              onClick={() => {
                vibrate(5);
                setActiveDeviceTab('tablet');
              }}
              className="flex flex-col items-center text-center cursor-pointer group space-y-3"
            >
              <div className="w-full h-44 flex items-center justify-center p-2">
                <img 
                  src={tabletMockup} 
                  alt="Nexora Tablet" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Tablet</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                  Expansive touch surface for relaxing breathing circles and stylus sketch doodling.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                <span>View Tablet</span>
                <ArrowRight size={13} />
              </span>
            </div>

            {/* 3: Laptop */}
            <div 
              onClick={() => {
                vibrate(5);
                setActiveDeviceTab('laptop');
              }}
              className="flex flex-col items-center text-center cursor-pointer group space-y-3"
            >
              <div className="w-full h-44 flex items-center justify-center p-2">
                <img 
                  src={laptopMockup} 
                  alt="Nexora Laptop" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Laptop</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                  Wide workstation dashboard for deep planning, full analytics, and live companion tracking.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                <span>View Laptop</span>
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Testimonials - Light, Crisp, & Elegant Aesthetic */}
      <section className="w-full bg-gradient-to-b from-white via-sky-50/20 to-slate-50 py-16 sm:py-24 relative z-10 border-t border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ willChange: 'opacity, transform' }}
            className="text-center max-w-2xl mx-auto mb-12 space-y-2"
          >
            <span className="text-blue-600 font-extrabold text-xs uppercase tracking-widest">Community Love</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">Trusted by our community</h2>
            <p className="text-slate-600 text-base">See how Nexora is empowering people to cultivate daily health rituals.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: `"Nexora completely changed how I relax. The mindful breathing exercises are a lifesaver after a long day at work. It's my daily reset button!"`,
                name: 'Sarah J.',
                streak: '🔥 42-day streak',
                avatarBg: 'bg-blue-600',
                initials: 'SJ'
              },
              {
                text: `"I used to always forget to hydrate. Now my little mascot reminds me, and I'm drinking 2 liters a day effortlessly. My body feels energized!"`,
                name: 'Marcus T.',
                streak: '💧 60-day streak',
                avatarBg: 'bg-cyan-600',
                initials: 'MT'
              },
              {
                text: `"The push-up challenge starts small and builds steady strength without feeling overwhelming. Taking care of my digital pet feels rewarding!"`,
                name: 'Emily R.',
                streak: '🔥 30-day streak',
                avatarBg: 'bg-orange-600',
                initials: 'ER'
              }
            ].map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.35, delay: i * 0.1, ease: "easeOut" }}
                style={{ willChange: 'opacity, transform' }}
                className="bg-white border border-slate-200/80 rounded-3xl p-7 flex flex-col justify-between space-y-5 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">
                    {review.text}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className={`w-9 h-9 ${review.avatarBg} rounded-full flex items-center justify-center font-bold text-xs text-white`}>
                    {review.initials}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{review.name}</div>
                    <div className="text-[11px] text-blue-600 font-semibold">{review.streak}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Message - Compact & Authentic Card with Lightweight Scroll Reveal */}
      <section className="w-full py-16 sm:py-20 relative z-10 bg-slate-50/50 border-t border-slate-200/60">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ willChange: 'opacity, transform' }}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs relative"
          >
            <Quote className="absolute top-6 right-6 w-16 h-16 text-blue-100" />
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                <span>💬</span> Note from the Founder
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                "Our mission is to make personal wellness enjoyable, not a chore."
              </h2>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                Hey everyone, I'm Thomas, the founder of Nexora. We built this app with a simple purpose: to help you drink more water, stay active with daily push-ups, and find moments to genuinely relax. If Nexora helps even one person build a healthier, happier routine, every line of code was worth it.
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-2xs">
                  T
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Thomas</div>
                  <div className="text-xs text-blue-600 font-medium">Founder, Nexora</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final Radiant Call to Action with Lightweight Scroll Reveal */}
      <section className="w-full bg-gradient-to-b from-slate-50/50 to-white py-16 sm:py-24 relative z-10 border-t border-slate-200/60 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ willChange: 'opacity, transform' }}
            className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl shadow-blue-500/20 overflow-hidden"
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="text-yellow-300" />
                <span>Start Your Companion Journey</span>
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to meet your companion?
              </h2>
              
              <p className="text-blue-50 text-base sm:text-lg max-w-lg mx-auto font-medium leading-relaxed">
                Join Nexora today and begin cultivating joyful daily rituals that last a lifetime.
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={() => {
                    vibrate(20);
                    onGetStarted();
                  }}
                  className="bg-white hover:bg-slate-50 text-blue-600 px-9 py-4 sm:px-11 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg shadow-lg shadow-blue-950/20 transition-all inline-flex items-center justify-center gap-3 cursor-pointer active:scale-95"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clean Light-Themed Footer */}
      <footer className="w-full bg-white text-slate-600 py-10 relative z-10 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <MascotImage 
              alt="Nexora Logo" 
              className="w-10 h-10 object-cover rounded-xl shadow-2xs"
            />
            <span className="text-2xl font-black text-slate-900 tracking-tight">Nexora</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-500">
            <button onClick={() => setView('terms')} className="hover:text-blue-600 transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => setView('privacy')} className="hover:text-blue-600 transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => setView('support')} className="hover:text-blue-600 transition-colors cursor-pointer">Support & FAQ</button>
          </div>
          
          <div className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} Nexora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
