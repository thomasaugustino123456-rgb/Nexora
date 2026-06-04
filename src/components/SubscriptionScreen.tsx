import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Crown, Zap, Star, MessageSquare, Heart, ShieldCheck, Users, X } from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';

export function SubscriptionScreen({ 
  onBack, 
  userId, 
  onActivatePro,
  onUpdateSettings,
  onStartProTest,
  settings
}: { 
  onBack: () => void, 
  userId: string,
  onActivatePro?: () => void,
  onUpdateSettings?: (settings: any) => void,
  onStartProTest?: () => void,
  settings?: any
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
            className="absolute top-8 left-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md group"
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
            The ultimate protocol for discipline legends. Access the Architect Lab and support the mission.
          </p>
        </div>

        {/* Mission Transparency Section - NEW */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-16 p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/30">
                <Heart size={12} fill="currentColor" /> THE MISSION
              </div>
              <h2 className="text-3xl font-black italic tracking-tight">WHERE DOES YOUR MONEY GO?</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nexora isn't a heartless corporation. We are a small team of warriors building the future of discipline. Your subscription directly funds:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {[
                  { icon: <Zap size={14}/>, text: 'Ultra-Fast AI Servers' },
                  { icon: <ShieldCheck size={14}/>, text: 'Secure Field Reports' },
                  { icon: <Crown size={14}/>, text: 'Exclusive Asset Design' },
                  { icon: <Users size={14}/>, text: 'Community Infrastructure' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-amber-200/80">
                    <div className="p-1 bg-amber-500/20 rounded-md text-amber-500">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-2xl relative">
              <div className="absolute inset-4 rounded-full border border-amber-500/20 animate-pulse" />
              <Crown size={64} className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            </div>
          </div>
        </motion.div>

        {/* Pro Test Mode Card (Unified) */}
        {onStartProTest && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-2 border-blue-500/30 backdrop-blur-md relative overflow-hidden group"
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
                      className="w-full md:w-auto px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-sm shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all"
                    >
                      START 10-MIN TEST
                    </button>
                  );
                } else {
                  const daysRemaining = Math.ceil((cooldownDays * 24 * 60 * 60 * 1000 - (now.getTime() - lastTest!.getTime())) / (24 * 60 * 60 * 1000));
                  return (
                    <div className="w-full md:w-auto px-8 py-5 bg-white/10 rounded-2xl border border-white/20 text-center opacity-70">
                       <p className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-none mb-1">Cooldown Active</p>
                       <p className="text-sm font-black text-white">{daysRemaining} DAYS WAIT</p>
                    </div>
                  );
                }
              })()}
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

        {/* Comparison Table - NEW */}
        <div className="mb-24 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="p-8 border-b border-white/10 bg-white/5">
            <h3 className="font-black text-xl tracking-tight uppercase">Protocol Comparison</h3>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Free Tier vs Architect Pro</p>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400">Capability</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center bg-white/5">Free</th>
                  <th className="p-6 text-[10px] font-black uppercase text-amber-500 text-center bg-amber-500/5">Pro</th>
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
                    <td className="p-6 font-bold text-slate-300 uppercase tracking-tight">{row.name}</td>
                    <td className="p-6 text-center text-slate-500 bg-white/5 font-black">
                      {typeof row.free === 'boolean' ? (row.free ? <Check size={14} className="mx-auto text-emerald-500" /> : <X size={14} className="mx-auto text-gray-700" />) : row.free}
                    </td>
                    <td className="p-6 text-center bg-amber-500/5 font-black text-amber-400">
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
                <h3 className="font-black text-xl">YEARLY</h3>
                <p className="text-amber-500 font-bold">$64.00 / year</p>
                <p className="text-[10px] text-slate-500 mt-2">Elite Master Access</p>
              </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-2 border-amber-500/50 flex flex-col items-center text-center space-y-4 relative hover:scale-105 transition-all cursor-pointer group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white">LEGEND CHOICE</div>
              <div className="text-4xl text-amber-400 group-hover:scale-125 transition-transform">🔥</div>
              <div>
                <h3 className="font-black text-xl">MONTHLY</h3>
                <p className="text-amber-400 font-bold">$14.99 / mo</p>
                <p className="text-[10px] text-amber-500/60 mt-2">Maximum Protocol</p>
              </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-4 hover:border-white/20 transition-all cursor-pointer hover:bg-white/10 group">
              <div className="text-4xl text-blue-400 group-hover:-rotate-12 transition-transform">⚡</div>
              <div>
                <h3 className="font-black text-xl">WEEKLY</h3>
                <p className="text-blue-400 font-bold">$4.99 / wk</p>
                <p className="text-[10px] text-slate-500 mt-2">Quick Protocol</p>
              </div>
            </div>
          </div>

          {/* Pay What You Want / Support Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600/10 via-slate-900 to-indigo-600/5 border-2 border-indigo-500/30 text-center space-y-8 overflow-hidden relative"
          >
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px]" />
            
            <div className="relative z-10 space-y-3">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <Heart className="text-indigo-400" size={28} />
              </div>
              <h3 className="text-3xl font-black tracking-tighter italic">WILLINGLY SUPPORT</h3>
              <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
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

                    <div className="mt-8 p-8 rounded-[2.5rem] bg-slate-900/80 border border-white/10 backdrop-blur-md">
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

