import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Zap, Star, MessageSquare } from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';

export function SubscriptionScreen({ 
  onBack, 
  userId, 
  onActivatePro,
  onUpdateSettings,
  onStartProTest
}: { 
  onBack: () => void, 
  userId: string,
  onActivatePro?: () => void,
  onUpdateSettings?: (settings: any) => void,
  onStartProTest?: () => void
}) {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { title: 'UI Architect Lab', description: 'Redesign the app your way. Drag and hide anything.' },
    { title: 'Challenge Archive', description: 'Filter official challenges. Only focus on what matters.' },
    { title: 'Unlimited Everything', description: 'No daily limits. All tools unlocked.' },
    { title: 'Exclusive Content', description: 'Special skins and high-fidelity soundtracks.' },
  ];

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
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack} 
            className="absolute top-8 left-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 backdrop-blur-xl group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </motion.button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-amber-500/20 mb-4"
          >
            <Crown size={48} className="text-white drop-shadow-lg" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">NEXORA PRO</h1>
          <p className="text-slate-400 max-w-md text-lg font-medium leading-relaxed">
            The ultimate protocol for discipline legends. Access the Architect Lab and unlock your full potential.
          </p>
        </div>

        {/* Pro Test Mode Card (Unified) */}
        {onStartProTest && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-2 border-blue-500/30 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 rotate-3 group-hover:rotate-0 transition-transform">
                <Crown size={40} />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h3 className="text-2xl font-black text-white">PRO TEST MODE</h3>
                  <span className="bg-blue-500 text-[8px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-widest">Limited Time</span>
                </div>
                <p className="text-blue-100/70 text-sm font-medium leading-relaxed max-w-lg">
                  Curious about the power of Nexora Pro? Unlock every feature, custom plan, and exclusive item for 10 minutes. Experience the peak of consistency.
                </p>
              </div>

              <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                  onStartProTest();
                }}
                className="w-full md:w-auto px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-sm shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all"
              >
                START 10-MIN TEST
              </button>
            </div>
          </motion.div>
        )}

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
                <h4 className="font-black text-lg">{f.title}</h4>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Payment Options */}
        <div className="space-y-4 mb-24">
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">SECURE PAYMENT PROTOCOLS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-4">
              <div className="text-4xl">💎</div>
              <div>
                <h3 className="font-black text-xl">YEARLY</h3>
                <p className="text-amber-500 font-bold">$39.99 / year</p>
                <p className="text-[10px] text-slate-500 mt-2">Best for masters</p>
              </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-2 border-amber-500/50 flex flex-col items-center text-center space-y-4 relative">
              <div className="absolute -top-3 left-1/2 -track-x-1/2 bg-amber-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">POPULAR</div>
              <div className="text-4xl text-amber-400">🔥</div>
              <div>
                <h3 className="font-black text-xl">MONTHLY</h3>
                <p className="text-amber-400 font-bold">$4.99 / mo</p>
                <p className="text-[10px] text-amber-500/60 mt-2">Elite Consistency</p>
              </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-4">
              <div className="text-4xl">⚡</div>
              <div>
                <h3 className="font-black text-xl">WEEKLY</h3>
                <p className="text-blue-400 font-bold">$1.99 / wk</p>
                <p className="text-[10px] text-slate-500 mt-2">Quick Protocol</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-8 rounded-[2.5rem] bg-slate-900/80 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-black text-blue-400 flex items-center gap-2">
                  <MessageSquare size={20} /> CRYPTO & m-GURUSH
                </h3>
                <p className="text-xs text-slate-400">Manual verification for South Sudan and Crypto users. Send payment and your UID <b>({userId})</b> to WhatsApp.</p>
                <div className="space-y-2 font-mono text-[10px] bg-black/50 p-4 rounded-2xl border border-white/5 break-all">
                  <p className="text-amber-200">BTC: bc1q5qfv4fkvd9s5j90pc6mg9fjxjyelt992fu0xfh</p>
                  <p className="text-blue-200 mt-2">USDT (ERC20): 0x0d10b62ca87c87bcfa91cee9a08d3041b10d104e</p>
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
    </motion.div>
  );
}

