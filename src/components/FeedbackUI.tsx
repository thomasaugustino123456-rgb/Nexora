import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Flame, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';
import { UserSettings } from '../types';
import { VIBRATION_PATTERNS, vibrate } from '../lib/vibrate';

export function HappyMascot({ size = 32, hat = 'none', settings }: { size?: number, hat?: string, settings: UserSettings }) {
  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ 
        scale: 1, 
        y: [0, -20, 0],
      }}
      transition={{ 
        scale: { type: "spring", damping: 12 },
        y: { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
      }}
      className="flex flex-col items-center gap-2 mb-4"
    >
      <div className={`w-${size} h-${size} relative`}>
        <Mascot className="w-full h-full drop-shadow-lg" hat={hat} soundPack={settings.isDogSoundPackActive ? 'dog' : 'cat'} />
      </div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-black shadow-lg"
      >
        AWESOME! 🌟
      </motion.div>
    </motion.div>
  );
}

export function LevelUpCelebration({ level, onComplete }: { level: number, onComplete: () => void }) {
  useEffect(() => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-500/90 backdrop-blur-md p-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="mb-8 relative inline-block"
        >
          <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-50 animate-pulse" />
          <Award size={120} className="text-yellow-400 relative z-10 drop-shadow-2xl" />
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black text-white mb-2 uppercase tracking-tighter"
        >
          Level Up!
        </motion.h2>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-8xl font-black text-white drop-shadow-lg"
        >
          {level}
        </motion.div>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-blue-100 font-bold mt-4"
        >
          You're becoming a legend, bro! 🚀
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="mt-6 flex gap-4 justify-center"
        >
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30 shadow-xl">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-yellow-700 font-black text-sm">$</span>
            </div>
            <span className="text-white font-black">+15 COINS</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30 shadow-xl">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Flame size={16} className="text-white" />
            </div>
             <span className="text-white font-black">+2 STREAK</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function CoinAnimation({ onComplete, play, settings }: { onComplete: () => void, play: (s: string) => void, settings: UserSettings }) {
  const [phase, setPhase] = useState<'appear' | 'fly' | 'dust'>('appear');

  useEffect(() => {
    if (settings.soundEnabled) {
      play('coin');
    }
    const timer1 = setTimeout(() => setPhase('fly'), 2500);
    const timer2 = setTimeout(() => setPhase('dust'), 4000);
    const timer3 = setTimeout(() => onComplete(), 5000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete, play, settings.soundEnabled]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        {phase === 'appear' && (
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1], 
              rotate: 0, 
              opacity: 1,
              y: [0, -20, 0] 
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              duration: 1.5,
              y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
            }}
            className="relative"
          >
            <div className="w-32 h-32 bg-yellow-400 rounded-full border-4 border-yellow-600 flex items-center justify-center shadow-2xl">
              <span className="text-5xl font-black text-yellow-700">$</span>
            </div>
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 animate-pulse" />
          </motion.div>
        )}

        {phase === 'fly' && (
          <motion.div
            initial={{ x: 0, y: 0, scale: 1 }}
            animate={{ 
              x: [0, -100, -200], 
              y: [0, 200, 400], 
              scale: 0.5,
              opacity: [1, 1, 0]
            }}
            transition={{ duration: 1.5, ease: "anticipate" }}
            className="w-16 h-16 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-xl"
          >
            <span className="text-xl font-black text-yellow-700">$</span>
          </motion.div>
        )}

        {phase === 'dust' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ 
                  y: -50 - Math.random() * 50, 
                  x: (Math.random() - 0.5) * 100,
                  scale: 0,
                  opacity: 0 
                }}
                transition={{ duration: 1.0 }}
                className="w-2 h-2 bg-yellow-400 rounded-full"
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
