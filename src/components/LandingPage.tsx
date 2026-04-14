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
  console.log("LandingPage is rendering...");
  const [view, setView] = useState<'home' | 'terms' | 'privacy' | 'support'>('home');

  if (view === 'terms') return <TermsPage onBack={() => setView('home')} />;
  if (view === 'privacy') return <PrivacyPage onBack={() => setView('home')} />;
  if (view === 'support') return <SupportPage onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-green-500 flex flex-col items-center overflow-x-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <img 
            src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
            alt="Nexora Logo" 
            className="w-24 h-24 object-contain"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <span className="text-4xl font-black text-blue-900 tracking-tighter">Nexora</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              vibrate(10);
              // Assuming 'shop' screen is not accessible before login, maybe just alert or redirect?
              // For now, let's just make it visible.
              alert('Pro features coming soon!');
            }}
            className="flex items-center gap-1 text-red-500 font-bold hover:text-red-600 transition-colors px-4 py-2"
          >
            <Crown size={20} />
            <span className="text-sm">Pro</span>
          </button>
          <button 
            onClick={() => {
              vibrate(10);
              onGetStarted();
            }}
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors px-4 py-2"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center p-6 gap-12 z-10 relative overflow-hidden">
        {/* Background Mascot Watermark for Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-[0.05] z-[-1] flex items-center justify-center">
          <img 
            src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
            alt="" 
            className="w-[150%] max-w-none"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-blue-900 tracking-tighter leading-tight">
              Your personal <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                flow companion
              </span>
            </h1>
            <p className="mt-6 text-xl text-blue-900/60 max-w-xl font-medium">
              Build healthy habits, stay hydrated, and track your daily goals with a cute, interactive mascot that grows with you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => {
                vibrate(20);
                onGetStarted();
              }}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </button>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 mt-8 w-full max-w-lg"
          >
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                <Droplets size={20} />
              </div>
              <div className="text-sm font-bold text-blue-900">Track Water</div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                <Flame size={20} />
              </div>
              <div className="text-sm font-bold text-blue-900">Daily Pushups</div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
                <Brain size={20} />
              </div>
              <div className="text-sm font-bold text-blue-900">Mindful Breathing</div>
            </div>
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center shrink-0">
                <Palette size={20} />
              </div>
              <div className="text-sm font-bold text-blue-900">Creative Drawing</div>
            </div>
          </motion.div>
        </div>

        {/* Hero Image/Mascot */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex-1 w-full max-w-md relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-100 rounded-full blur-3xl opacity-50" />
          <div className="relative z-10 drop-shadow-2xl">
            <Mascot className="w-full h-auto" />
          </div>
        </motion.div>
      </main>

      {/* About Section */}
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
