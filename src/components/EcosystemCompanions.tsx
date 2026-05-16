import React from 'react';
import { motion } from 'framer-motion';

export const NanoBees: React.FC<{ plantPos?: { x: number, y: number } }> = ({ plantPos }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute z-30"
          animate={{
            x: [50, 150, 100, 50],
            y: [30, 80, 40, 30],
            translateX: [i * 15, -i * 10, i * 12],
            translateY: [-i * 5, i * 15, -i * 10]
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2
          }}
        >
          {/* 2D detailed Bee */}
          <svg viewBox="0 0 40 40" className="w-8 h-8 overflow-visible drop-shadow-sm">
            {/* WINGS - Attached and High Speed (Principles: Timing/Exaggeration) */}
            <motion.g animate={{ rotateY: [0, 90, 0] }} transition={{ duration: 0.08, repeat: Infinity }} style={{ originX: '20px', originY: '20px' }}>
              <path d="M 20,20 Q 15,10 5,20 Q 15,30 20,22" fill="white" opacity="0.6" />
              <path d="M 20,20 Q 25,10 35,20 Q 25,30 20,22" fill="white" opacity="0.6" />
            </motion.g>
            
            {/* Body (Squash & Stretch) */}
            <motion.g
              animate={{ scale: [1, 1.1, 0.95, 1] }} 
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <ellipse cx="20" cy="22" rx="8" ry="6" fill="#facc15" stroke="#422006" strokeWidth="1" />
              {/* Stripes */}
              <path d="M 16,17 Q 20,16 24,17" fill="none" stroke="#422006" strokeWidth="1.5" />
              <path d="M 15,22 Q 20,21 25,22" fill="none" stroke="#422006" strokeWidth="1.5" />
              <path d="M 16,27 Q 20,26 24,27" fill="none" stroke="#422006" strokeWidth="1.5" />
              
              {/* Eyes and Face (2D detail) */}
              <circle cx="23" cy="21" r="1.5" fill="black" />
              <circle cx="23" cy="20.5" r="0.5" fill="white" />
              
              {/* Feelers */}
              <path d="M 24,18 L 28,14" fill="none" stroke="#422006" strokeWidth="1" />
              <circle cx="28" cy="14" r="0.5" fill="#422006" />
            </motion.g>
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export const SpiritButterfly: React.FC = () => {
  return (
    <motion.div
      className="absolute pointer-events-none z-40"
      animate={{
        x: [0, 140, 60, -60, 0],
        y: [0, -100, 60, 140, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Secondary Glow Layer (Fast performance) */}
      <motion.div 
        className="absolute -inset-8 bg-purple-500/10 rounded-full blur-2xl"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <svg viewBox="0 0 100 100" className="w-16 h-16 overflow-visible">
        <defs>
          <linearGradient id="wingGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* GUIDING PRINCIPLE: Wings attached at body center (X=50) */}
        <motion.g
          animate={{ rotateY: [0, 75, 0] }}
          transition={{ duration: 0.25, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '50px' }}
        >
          {/* Left Wings */}
          <path d="M 50,50 Q 10,10 5,50 Q 10,90 50,60" fill="url(#wingGradMain)" opacity="0.9" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M 50,55 Q 20,70 20,95 Q 40,100 50,65" fill="url(#wingGradMain)" opacity="0.75" />
        </motion.g>

        <motion.g
          animate={{ rotateY: [0, -75, 0] }}
          transition={{ duration: 0.25, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '50px' }}
        >
          {/* Right Wings */}
          <path d="M 50,50 Q 90,10 95,50 Q 90,90 50,60" fill="url(#wingGradMain)" opacity="0.9" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M 50,55 Q 80,70 80,95 Q 60,100 50,65" fill="url(#wingGradMain)" opacity="0.75" />
        </motion.g>

        {/* Body (Overlapping Action - slightly offset in Y) */}
        <motion.g
          animate={{ y: [0, 2, 0], scaleY: [1, 1.1, 1] }}
          transition={{ duration: 0.25, repeat: Infinity }}
        >
          {/* Head & Antennae */}
          <circle cx="50" cy="42" r="3" fill="white" />
          <path d="M 48,40 L 42,32 M 52,40 L 58,32" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          
          {/* Body Segments */}
          <ellipse cx="50" cy="55" rx="3" ry="12" fill="white" />
          <ellipse cx="50" cy="68" rx="2" ry="5" fill="white" opacity="0.6" />
        </motion.g>
      </svg>
    </motion.div>
  );
};
