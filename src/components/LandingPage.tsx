import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Droplets, Flame, Brain, Palette, Star, Quote, Heart, Activity, Target, Crown, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';
import { TermsPage, PrivacyPage, SupportPage } from './LegalPages';
import { vibrate } from '../lib/vibrate';

const nexoraAppIcon = "/nexora_mascot_logo.png?v=20260609b";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [view, setView] = useState<'home' | 'terms' | 'privacy' | 'support'>('home');
  const { scrollY } = useScroll();
  
  // Optimize scroll transforms by reducing their range and impact
  const bgOpacity = useTransform(scrollY, [0, 1000], [1, 0.8]);
  const heroY = useTransform(scrollY, [0, 500], [0, 40]);

  if (view === 'terms') return <TermsPage onBack={() => setView('home')} />;
  if (view === 'privacy') return <PrivacyPage onBack={() => setView('home')} />;
  if (view === 'support') return <SupportPage onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-[#f4f8ff] flex flex-col items-center relative selection:bg-blue-100 selection:text-blue-900">
      {/* Animated Background Mesh with Scroll Interaction - Optimized for Performance */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        {/* Main "Warm Blue" Lighting Glows - removed heavy blurs */}
        <motion.div 
          animate={{
            rotate: [0, 360],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(186,230,253,0.4)_0%,rgba(219,234,254,0.2)_30%,transparent_50%)]" 
          style={{ willChange: 'transform' }}
        />
        <motion.div 
          animate={{
            rotate: [360, 0],
            scale: [1.05, 1, 1.05],
          }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[30%] -right-[30%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(199,210,254,0.3)_0%,rgba(224,231,255,0.15)_40%,transparent_50%)]" 
          style={{ willChange: 'transform' }}
        />
        
        {/* Accent blobs for "warmth" */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[100px]" />

        {/* Floating Particles - Reduced count and simplified animation for performance */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: [0, -100 - (i * 20)],
              x: [0, i % 2 === 0 ? 50 : -50],
            }}
            transition={{ 
              duration: 12 + i, 
              repeat: Infinity, 
              delay: i * 1.5,
              ease: "easeInOut"
            }}
            className="absolute bg-blue-300/20 rounded-full blur-xl"
            style={{
              width: `${20 + (i * 15)}px`,
              height: `${20 + (i * 15)}px`,
              left: `${15 + (i * 12)}%`,
              bottom: '-10%',
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </motion.div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-6 md:p-10 flex justify-between items-center z-20 relative">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <div className="relative">
            <motion.div 
              animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 bg-gradient-to-tr from-blue-400 via-indigo-300 to-cyan-400 rounded-full opacity-30 group-hover:opacity-60 transition-opacity blur-xl"
            />
            <img 
              src={nexoraAppIcon} 
              alt="Nexora Logo" 
              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl relative z-10 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/20"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
          <span className="text-3xl md:text-5xl font-black text-blue-950 tracking-tighter drop-shadow-sm">Nexora</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-4 md:gap-8"
        >
          <motion.button 
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              vibrate(10);
              console.log('Pro features coming soon!');
            }}
            className="hidden sm:flex items-center gap-2 text-red-500 font-black px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-red-100 shadow-sm transition-all"
          >
            <Crown size={16} fill="currentColor" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Upgrade</span>
          </motion.button>
          <button 
            onClick={() => {
              vibrate(10);
              onGetStarted();
            }}
            className="text-blue-900/60 font-black hover:text-blue-600 transition-colors px-4 py-2 hover:translate-y-[-2px] duration-300 text-sm tracking-wide"
          >
            LOG IN
          </button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGetStarted}
            className="bg-blue-950 text-white px-6 py-3 rounded-xl font-black text-xs tracking-widest uppercase shadow-xl shadow-blue-950/20 hover:shadow-blue-950/40 transition-all hidden md:block"
          >
            Get Started
          </motion.button>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 gap-16 lg:gap-24 z-10 relative">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-md text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-8 border border-white/80 shadow-sm"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse ring-4 ring-blue-100" />
              Next Evolution of Wellness
            </motion.div>
            <h1 className="text-7xl md:text-9xl font-black text-blue-950 tracking-tighter leading-[0.85] mb-4">
              Unlock Your<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-[length:200%_auto] animate-gradient-x drop-shadow-xl">
                True Potential
              </span>
            </h1>
            <p className="mt-10 text-xl md:text-2xl text-blue-950/50 max-w-2xl font-medium leading-[1.6]">
              Escape the mundane routine. Nexora gamifies your growth with an AI-powered ritual system and a mascot that reflects your success.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <motion.button 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                vibrate(20);
                onGetStarted();
              }}
              className="group relative bg-blue-600 text-white px-12 py-6 rounded-2xl font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_30px_60px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              START FLOWING <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform duration-500" />
            </motion.button>
          </motion.div>

          {/* Features Grid - Quick Preview */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full"
          >
            {[
              { icon: <Droplets />, color: 'blue', text: 'HYDRATION' },
              { icon: <Flame />, color: 'orange', text: 'KINETIC' },
              { icon: <Brain />, color: 'emerald', text: 'NEURAL' },
              { icon: <Palette />, color: 'purple', text: 'CREATIVE' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8, scale: 1.05 }}
                className="glass-card p-5 flex flex-col items-center gap-3 border border-white/60 bg-white/40 shadow-lg group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-${f.color}-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-${f.color}-500/20 group-hover:rotate-12 transition-transform`}>
                  {React.cloneElement(f.icon as React.ReactElement<any>, { size: 24, strokeWidth: 2.5 })}
                </div>
                <div className="text-[10px] font-black text-blue-950/70 tracking-[0.2em]">{f.text}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Hero Illustration with Parallax */}
        <motion.div 
          style={{ y: heroY }}
          initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2, 
            type: "spring", 
            stiffness: 80, 
            damping: 15,
            delay: 0.3
          }}
          className="flex-1 w-full max-w-lg relative perspective-1000"
        >
          {/* Main Glowing Orb */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 bottom-1/4 h-[80%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.5)_0%,transparent_50%)]" 
            style={{ willChange: 'transform, opacity' }}
          />
          
          <div className="relative z-10">
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotateZ: [0, 2, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="drop-shadow-[0_30px_30px_rgba(30,58,138,0.2)]"
              style={{ willChange: 'transform' }}
            >
              <Mascot className="w-full h-auto" />
            </motion.div>
          </div>

          {/* Floating Data Indicators */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute -top-10 -left-12 glass-card p-5 rounded-2xl shadow-2xl border border-white backdrop-blur-md z-20 hidden lg:block"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-black text-blue-950 tracking-widest">NEXO LINKED</span>
              </div>
              <div className="h-1.5 w-32 bg-blue-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 2, delay: 1.5 }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute -bottom-6 -right-12 glass-card p-5 rounded-2xl shadow-2xl border border-white backdrop-blur-md z-20 hidden lg:block"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1">CURRENT STREAK</span>
                <span className="text-3xl font-black text-blue-950 leading-none">14 DAYS</span>
              </div>
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
                <Flame size={24} strokeWidth={3} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Floating Section Dividers / Stats */}
      <div className="w-full bg-blue-950 py-6 md:py-8 overflow-hidden relative z-20 shadow-[0_-10px_50px_rgba(30,58,138,0.4)]">
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap px-10"
        >
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 text-blue-300 font-black text-sm uppercase tracking-[0.3em] italic">
              <Sparkles size={16} className="text-blue-500 animate-pulse" />
              EVOLVE YOUR HABITS
              <span className="text-blue-800/50 w-2 h-2 rounded-full bg-current" />
              BUILD MASSIVE FOCUS
              <Sparkles size={16} className="text-indigo-500 animate-pulse" />
              BECOME A LEGEND
            </div>
          ))}
        </motion.div>
      </div>

      {/* Narrative Section */}
      <section className="w-full bg-white py-32 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-12"
          >
            <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase">The Philosophy</span>
            <h2 className="text-5xl md:text-7xl font-black text-blue-950 tracking-tighter max-w-4xl mx-auto leading-[0.95]">
              Greatness is built one<br/>
              <span className="text-blue-500 italic">small ritual</span> at a time.
            </h2>
            <p className="text-xl md:text-2xl text-blue-950/60 leading-relaxed font-semibold max-w-3xl mx-auto">
              Nexora isn't another rigid productivity tool. It's a living ecosystem where your mental, physical, and creative energies are synchronized. When you thrive, Nexo thrives. When you slack, Nexo feels it. It's mutual growth, redefined.
            </p>
            <div className="pt-10 flex justify-center gap-4">
              <div className="w-16 h-1 bg-blue-100 rounded-full" />
              <div className="w-4 h-1 bg-blue-500 rounded-full" />
              <div className="w-16 h-1 bg-blue-100 rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>
      {/* About Section */}
      <section className="w-full bg-white py-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6 text-center space-y-8"
        >
          <h2 className="text-4xl md:text-6xl font-black text-blue-950 tracking-tighter">More than just a tracker.</h2>
          <p className="text-xl text-blue-900/60 leading-relaxed font-medium">
            Nexora is your interactive companion for a healthier, more balanced lifestyle. By combining physical activities like hydration and exercise with mental wellness practices like breathing and drawing, Nexora provides a holistic approach to your well-being. As you complete your daily goals, your personal mascot grows, thrives, and celebrates alongside you!
          </p>
        </motion.div>
      </section>

      {/* Deep Dive Features */}
      <section className="w-full py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-blue-900">Everything you need to thrive</h2>
            <p className="text-lg text-blue-900/60 mt-4">Simple, effective tools to build a better routine.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-500 flex items-center justify-center">
                <Droplets size={32} />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Hydration Tracking</h3>
              <p className="text-blue-900/60">Log your daily water intake and hit your personalized goals to keep your body energized and your mind sharp.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center">
                <Flame size={32} />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Daily Push-ups</h3>
              <p className="text-blue-900/60">Build foundational strength with customizable daily push-up targets. Start small and grow incredibly strong over time.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-500 flex items-center justify-center">
                <Brain size={32} />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Mindful Breathing</h3>
              <p className="text-blue-900/60">Take a moment to center yourself with guided breathing exercises designed to reduce stress and improve focus.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-500 flex items-center justify-center">
                <Palette size={32} />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Creative Drawing</h3>
              <p className="text-blue-900/60">Unleash your creativity and relax your mind with our built-in drawing canvas. A perfect way to unwind.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full bg-blue-900 text-white py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black">Trusted by our community</h2>
            <p className="text-blue-200 mt-4 text-lg">See how Nexora is changing daily routines.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Review 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm"
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-blue-50 mb-6 leading-relaxed">"Nexora completely changed how I relax. The mindful breathing exercises are a lifesaver after a long, stressful day at work. It's my daily reset button!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">SJ</div>
                <div className="font-medium">Sarah J.</div>
              </div>
            </motion.div>

            {/* Review 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm"
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-blue-50 mb-6 leading-relaxed">"I used to always forget to hydrate. Now, my little mascot reminds me, and I'm drinking 2 liters a day effortlessly. My body feels so much healthier and energized."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold">MT</div>
                <div className="font-medium">Marcus T.</div>
              </div>
            </motion.div>

            {/* Review 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm"
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-blue-50 mb-6 leading-relaxed">"The daily push-up challenge is exactly what I needed. It starts small, but I've built so much strength over the last month without feeling overwhelmed."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">ER</div>
                <div className="font-medium">Emily R.</div>
              </div>
            </motion.div>

            {/* Review 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm"
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-blue-50 mb-6 leading-relaxed">"I love the creative drawing aspect! It's such a unique way to unwind. Nexo isn't just a health app; it's a daily companion that brings joy to my routine."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">DL</div>
                <div className="font-medium">David L.</div>
              </div>
            </motion.div>

            {/* Review 5 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm lg:col-start-2"
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-blue-50 mb-6 leading-relaxed">"Finally, a habit tracker that doesn't feel like a chore. Taking care of my digital pet by taking care of myself is genius. I feel amazing both mentally and physically."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold">CM</div>
                <div className="font-medium">Chloe M.</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Message */}
      <section className="w-full py-24 relative z-10 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="glass-card p-10 md:p-14 relative overflow-hidden"
          >
            <Quote className="absolute top-6 left-6 w-24 h-24 text-blue-500/10 -rotate-12" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-black text-blue-900">A message from the Founder</h2>
              
              <div className="space-y-4 text-lg text-blue-900/80 leading-relaxed font-medium">
                <p>Hey everyone, I'm Thomas, the founder of Nexora (or Nexo for short!).</p>
                
                <p>We built this app with a simple mission: to help you drink more water, stay active with daily push-ups, and find time to truly relax.</p>
                
                <p>We wanted to create something that wasn't just another boring tracker, but an experience you can actually enjoy and have fun with. While we love making it fun, our true focus is your health.</p>
                
                <p>If Nexora helps even one person live a healthier, happier life, then all our work was worth it. That shows our effort didn't go to waste.</p>
                
                <p className="font-bold text-blue-900">Stay healthy, be good, and enjoy the journey! Bye!</p>
              </div>

              <div className="pt-6 border-t border-blue-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                  T
                </div>
                <div>
                  <div className="font-black text-blue-900 text-lg">Thomas</div>
                  <div className="text-blue-600 font-medium text-sm">Founder, Nexora</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full bg-white py-24 relative z-10 border-t border-blue-50">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6 text-center space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-black text-blue-900 tracking-tighter">Ready to meet your new companion?</h2>
          <p className="text-xl text-blue-900/60 font-medium">Join our community today and start building habits that stick.</p>
          <button 
            onClick={onGetStarted}
            className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all inline-flex items-center justify-center gap-2 mt-4"
          >
            Start Your Journey <ArrowRight size={24} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-blue-950 text-blue-200 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={nexoraAppIcon} 
              alt="Nexora Logo" 
              className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl border border-white/20 shadow-md"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <span className="text-3xl font-black text-white tracking-tighter">Nexora</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium">
            <button onClick={() => setView('terms')} className="hover:text-white transition-colors">Terms of Service</button>
            <button onClick={() => setView('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setView('support')} className="hover:text-white transition-colors">Support & FAQ</button>
          </div>
          
          <div className="text-sm text-blue-400">
            © {new Date().getFullYear()} Nexora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
