import React from 'react';
import { motion } from 'framer-motion';
import { LootDropResult } from '../types/garden';
import { VIBRATION_PATTERNS, vibrate } from '../lib/vibrate';

export const LootCard = ({ loot, onCollect }: { loot: LootDropResult, onCollect: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
      onClick={() => {
        vibrate(VIBRATION_PATTERNS.CLICK);
        onCollect();
      }}
    >
        <motion.div 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="w-full max-w-sm bg-gradient-to-br from-amber-400 to-amber-600 p-8 rounded-3xl text-center text-white shadow-2xl space-y-6"
        >
            <h2 className="text-3xl font-black tracking-tighter">Mystery Seed Found!</h2>
            <div className="text-6xl my-4">🌱</div>
            <p className="text-xl font-bold">{loot.seedName}</p>
            <button className="w-full bg-white/20 hover:bg-white/30 px-6 py-4 rounded-2xl font-black text-lg transition-all active:scale-95">
              Collect
            </button>
        </motion.div>
    </motion.div>
  );
}
