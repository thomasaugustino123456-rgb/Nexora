import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageSquare } from 'lucide-react';
import { UserStats, UserSettings } from '../types';

export function MascotAI({ stats, settings, showToast }: { stats: UserStats, settings: UserSettings, showToast?: (m: string, t: any) => void }) {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateMotivation = async () => {
    setLoading(true);
    try {
      // Free up space by removing the AI SDK entirely and using predefined motivation tailored to stats!
      await new Promise(r => setTimeout(r, 800)); // Quick fake loading
      
      const predefinedMotivations = [
        "You're crushing it, bro! Keep that streak alive! 🌊",
        "Every drop of effort counts. Stay hydrated and stay focused! 💧",
        "Don't let up now! You've got this! 🚀",
        "Slow progress is still progress. Keep building! 🧱",
        "Take a deep breath and keep pushing forward! 🌬️",
        "Your future self will thank you for today's hard work! 🌟",
        "Challenge yourself, bro! That's how we grow! 🌱",
        "Another day, another victory! Let's get it! 🏆"
      ];
      
      let msg = predefinedMotivations[Math.floor(Math.random() * predefinedMotivations.length)];
      if (stats.streak > 3) msg = `A ${stats.streak}-day streak! That is absolute fire, bro! Keep it going! 🔥`;
      if (stats.level && stats.level > 5 && Math.random() > 0.5) msg = `Level ${stats.level}?! You're a true legend! 👑`;
      setResponse(msg);
    } catch (error: any) {
      console.error('Motivation Error:', error);
      setResponse("I'm always here to cheer you on! Let's crush today! 🚀");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !response) {
      generateMotivation();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-24 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-64 glass-card p-4 shadow-2xl border-2 border-blue-200"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nexora Says:</span>
              <button onClick={() => setIsOpen(false)} className="text-blue-900/20 hover:text-blue-900/40">
                <X size={14} />
              </button>
            </div>
            {loading ? (
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              <p className="text-sm font-medium text-blue-900 leading-relaxed italic">"{response}"</p>
            )}

            <button 
              onClick={() => { setResponse(""); generateMotivation(); }}
              className="mt-3 text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <Sparkles size={10} /> Get more wisdom
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
