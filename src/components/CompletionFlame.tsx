import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Flame, Sparkles } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface CompletionFlameProps {
  streak: number;
  xpEarned: number;
  onContinue: () => void;
}

export function CompletionFlame({ streak, xpEarned, onContinue }: CompletionFlameProps) {
  const { play } = useSound();
  const [showContent, setShowContent] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    // Initial sequence
    const timer = setTimeout(() => {
      setShowContent(true);
      play('music-fanfare'); 
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
    }, 500);

    return () => clearTimeout(timer);
  }, [play]);

  return (
    <div className="fixed inset-0 z-[1000] bg-blue-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <AnimatePresence>
        {showContent && (
          <>
            {/* Background Glow */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.3, scale: 1.5 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
              className="absolute w-64 h-64 bg-orange-500 rounded-full blur-[100px] pointer-events-none"
            />

            {/* The Flame Animation */}
            <motion.div
              initial={{ scale: 0, y: 50, rotate: -20 }}
              animate={{ 
                scale: isBouncing ? [0, 1.4, 1] : 1,
                y: 0,
                rotate: 0
              }}
              transition={{ 
                type: "spring",
                damping: 12,
                stiffness: 100,
                duration: 0.8
              }}
              className="relative w-48 h-64 mb-8"
            >
              <svg viewBox="0 0 100 120" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(255,165,0,0.8)]">
                <defs>
                  <filter id="flameWarp">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05 0.1" numOctaves="2" seed="5">
                      <animate attributeName="seed" values="1;100" dur="5s" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" scale="10" />
                  </filter>
                  
                  <linearGradient id="innerFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFF700" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>

                {/* Outer Layer */}
                <motion.path
                  d="M50,110 C80,100 90,70 80,40 C75,20 60,0 50,10 C40,0 25,20 20,40 C10,70 20,100 50,110"
                  fill="#FF3D00"
                  style={{ filter: "url(#flameWarp)" }}
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                
                {/* Middle Layer */}
                <motion.path
                  d="M50,105 C70,95 75,75 70,55 C65,40 55,25 50,30 C45,25 35,40 30,55 C25,75 30,95 50,105"
                  fill="#FF9100"
                  style={{ filter: "url(#flameWarp)" }}
                  animate={{ scale: [1, 1.1, 1], y: [0, -2, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                />

                {/* Inner Layer */}
                <motion.path
                  d="M50,100 C60,90 62,80 60,70 C58,60 53,50 50,55 C47,50 42,60 40,70 C38,80 40,90 50,100"
                  fill="url(#innerFlame)"
                  style={{ filter: "url(#flameWarp)" }}
                  animate={{ scale: [1, 1.15, 1], y: [0, -4, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: 0.2 }}
                />
              </svg>

              {/* Streak Number */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute inset-0 flex items-center justify-center pt-12"
              >
                <div className="text-6xl font-black text-white drop-shadow-2xl italic tracking-tighter">
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
              <span className="text-white font-black text-xl italic uppercase tracking-tighter">Continue to Hall of Fame</span>
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
