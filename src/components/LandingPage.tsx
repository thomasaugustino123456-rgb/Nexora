import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Droplets, Flame, Brain, Palette, Star, Quote, Heart, Activity, Target, Crown } from 'lucide-react';
import { Mascot } from './Mascot';
import { TermsPage, PrivacyPage, SupportPage } from './LegalPages';
import { vibrate } from '../lib/vibrate';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [view, setView] = useState<'home' | 'terms' | 'privacy' | 'support'>('home');

  if (view === 'terms') return <TermsPage onBack={() => setView('home')} />;
  if (view === 'privacy') return <PrivacyPage onBack={() => setView('home')} />;
  if (view === 'support') return <SupportPage onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col items-center overflow-x-hidden relative">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-blue-200/30 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -45, 0],
            x: [0, -50, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] bg-indigo-200/30 rounded-full blur-[120px]" 
        />
        
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: [0, -100 - (i * 20)],
              x: [0, i % 2 === 0 ? 50 : -50],
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: 5 + i, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "easeInOut"
            }}
            className="absolute bg-blue-400/20 rounded-full blur-xl"
            style={{
              width: `${20 + (i * 10)}px`,
              height: `${20 + (i * 10)}px`,
              left: `${15 + (i * 15)}%`,
              bottom: '10%'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <div className="relative">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-md"
            />
            <img 
              src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
              alt="Nexora Logo" 
              className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10 group-hover:scale-110 transition-transform"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
          <span className="text-4xl font-black text-blue-900 tracking-tighter">Nexora</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <button 
            onClick={() => {
              vibrate(10);
              console.log('Pro features coming soon!');
            }}
            className="flex items-center gap-1 text-red-500 font-black hover:scale-105 transition-transform px-4 py-2 bg-red-50 rounded-full border border-red-100"
          >
            <Crown size={18} fill="currentColor" />
            <span className="text-xs uppercase tracking-widest">Upgrade</span>
          </button>
          <button 
            onClick={() => {
              vibrate(10);
              onGetStarted();
            }}
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors px-4 py-2 hover:translate-y-[-1px]"
          >
            Log In
          </button>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center p-6 gap-12 z-10 relative">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-200">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Next Gen Motivation
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-blue-950 tracking-tighter leading-[0.9]">
              Crush Goals<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 animate-gradient-x">
                Like a Pro
              </span>
            </h1>
            <p className="mt-8 text-xl text-blue-950/60 max-w-xl font-medium leading-relaxed">
              Stop surviving, start thriving. Nexora is the ultimate companion to gamify your habits and unlock your peak performance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => {
                vibrate(20);
                onGetStarted();
              }}
              className="group relative bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              Join the Flow <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Features Grid - Quick Preview */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4 mt-8 w-full max-w-lg"
          >
            {[
              { icon: <Droplets />, color: 'blue', text: 'Hydration' },
              { icon: <Flame />, color: 'orange', text: 'Fitness' },
              { icon: <Brain />, color: 'emerald', text: 'Focus' },
              { icon: <Palette />, color: 'purple', text: 'Creativity' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-4 flex items-center gap-3 border border-white/40 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl bg-${f.color}-100 text-${f.color}-500 flex items-center justify-center shrink-0`}>
                  {React.cloneElement(f.icon as React.ReactElement, { size: 20 })}
                </div>
                <div className="text-sm font-black text-blue-900/80">{f.text}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Hero Illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1, 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            delay: 0.2
          }}
          className="flex-1 w-full max-w-md relativePerspective"
        >
          {/* Glowing Aura */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-indigo-300 rounded-full blur-[80px]" 
          />
          
          <div className="relative z-10 perspective-1000">
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotateZ: [0, 2, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="drop-shadow-[0_35px_35px_rgba(30,58,138,0.25)]"
            >
              <Mascot className="w-full h-auto" />
            </motion.div>
          </div>

          {/* Floating Data Cards around Mascot */}
          <motion.div 
            animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0 }}
            className="absolute top-10 -left-6 glass-card p-3 rounded-xl shadow-xl border border-white/60 z-20 hidden md:block"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-[10px] font-black text-blue-900">FLOW ACTIVE</span>
            </div>
          </motion.div>

          <motion.div 
            animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute bottom-10 -right-6 glass-card p-3 rounded-xl shadow-xl border border-white/60 z-20 hidden md:block"
          >
            <div className="flex items-center gap-2">
              <Flame size={12} className="text-orange-500" />
              <span className="text-[10px] font-black text-blue-900">12 DAY STREAK</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Ticker / Social Proof */}
      <div className="w-full bg-blue-950 py-4 overflow-hidden relative z-10 border-y border-white/10">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap px-6"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 text-blue-300 font-black text-xs uppercase tracking-widest italic opacity-50">
              <Star size={14} className="text-blue-500" />
              Unlock Your Potential
              <span className="text-blue-700">•</span>
              Master Your Habits
              <span className="text-blue-700">•</span>
              Build Consistency
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features Grid Sections... rest of the code remains but stylized */}

      <section className="w-full bg-white py-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6 text-center space-y-8"
        >
          <h2 className="text-4xl font-black text-blue-900">More than just a tracker.</h2>
          <p className="text-xl text-blue-900/70 leading-relaxed font-medium">
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
              src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
              alt="Nexora Logo" 
              className="w-20 h-20 object-contain"
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
