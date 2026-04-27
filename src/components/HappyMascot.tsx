import React from 'react';
import { motion } from 'framer-motion';
import { Mascot } from './Mascot';
import { UserSettings } from '../types';

interface HappyMascotProps {
  size?: number;
  hat?: string;
  settings: UserSettings;
}

export function HappyMascot({ size = 32, hat = 'none', settings }: HappyMascotProps) {
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
