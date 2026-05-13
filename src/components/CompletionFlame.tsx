import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Flame, Sparkles } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface CompletionFlameProps {
  streak: number;
  xpEarned: number;
  onContinue: () => void;
  settings?: any;
}

export function CompletionFlame({ streak, xpEarned, onContinue }: CompletionFlameProps) {
  const { play } = useSound();
  const [showContent, setShowContent] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    // Initial sequence - faster transition
    const timer = setTimeout(() => {
      setShowContent(true);
      if (settings?.soundEnabled !== false) {
        play('flame_complete'); 
      }
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
      
      const fireLoop = setInterval(() => {
        if (showContent && settings?.soundEnabled !== false) play('fire_ambient');
      }, 3000);
      return () => clearInterval(fireLoop);
    }, 100); 

    return () => clearTimeout(timer);
  }, [play, showContent]);

  return (
    <div className="fixed inset-0 z-[1000] bg-blue-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <AnimatePresence>
        {showContent && (
          <>
            {/* Background Glow */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.4, scale: 1.5 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
              className="absolute w-64 h-64 bg-orange-600 rounded-full blur-[120px] pointer-events-none"
            />

            {/* The Flame Animation (Duolingo Style) */}
            <motion.div
              initial={{ scale: 0, y: 100 }}
              animate={{ 
                scale: isBouncing ? [0, 1.2, 1] : 1,
                y: 0
              }}
              transition={{ type: "spring", damping: 15, stiffness: 150 }}
              className="relative w-64 h-64 mb-6 flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,100,0,0.6)]">
                <defs>
                  <linearGradient id="duoFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFC107" />
                    <stop offset="50%" stopColor="#FF9800" />
                    <stop offset="100%" stopColor="#FF5722" />
                  </linearGradient>
                </defs>

                {/* Outer Flame (Orange) */}
                <motion.path
                  d="M100,180 C140,180 170,140 170,100 C170,40 100,10 100,10 C100,10 30,40 30,100 C30,140 60,180 100,180 Z"
                  fill="#FF5722"
                  animate={{ 
                    scaleY: [1, 1.05, 1],
                    d: [
                      "M100,180 C140,180 170,140 170,100 C170,40 100,10 100,10 C100,10 30,40 30,100 C30,140 60,180 100,180 Z",
                      "M100,185 C145,185 175,145 175,105 C175,45 100,5 100,5 C100,5 25,45 25,105 C25,145 55,185 100,185 Z",
                      "M100,180 C140,180 170,140 170,100 C170,40 100,10 100,10 C100,10 30,40 30,100 C30,140 60,180 100,180 Z"
                    ]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Central Inner Drop (Yellow) */}
                <motion.path
                  d="M100,165 C125,165 145,140 145,110 C145,80 100,50 100,50 C100,50 55,80 55,110 C55,140 75,165 100,165 Z"
                  fill="#FFC107"
                  animate={{ 
                    scale: [1, 0.95, 1],
                    y: [0, 5, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>

              {/* Day Number in the center of the flame drop */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pt-8"
              >
                <div className="text-7xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                  {streak}
                </div>
              </motion.div>
            </motion.div>


            {/* Labels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-2 mb-12"
            >
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                DAY STREAK!
              </h2>
              <p className="text-orange-300 font-bold tracking-widest text-sm uppercase">
                Challenge Complete • {xpEarned} XP Earned
              </p>
            </motion.div>

            {/* Features Staggered */}
            <div className="flex gap-4 mb-16">
              {[
                { icon: <Flame className="text-orange-500" />, label: "On Fire" },
                { icon: <Sparkles className="text-yellow-400" />, label: "Legendary" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10"
                >
                  {item.icon}
                  <span className="text-white font-black uppercase text-xs tracking-widest">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Continue Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 1.5 }}
              onClick={() => {
                play('nav_switch');
                onContinue();
              }}
              className="group relative bg-orange-500 hover:bg-orange-600 px-12 py-5 rounded-[2rem] flex items-center gap-4 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.4)]"
            >
              <span className="text-white font-black text-xl italic uppercase tracking-tighter">Continue to Trophy Reward</span>
              <div className="bg-white/20 p-2 rounded-xl group-hover:translate-x-2 transition-transform">
                <ChevronRight className="text-white" size={24} />
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-white/20 skew-x-12"
                />
              </div>
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
