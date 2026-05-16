import React from 'react';
import { motion } from 'framer-motion';

export const NanoBees: React.FC<{ isForestActive?: boolean }> = ({ isForestActive }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute z-30"
          animate={{
            x: isForestActive 
              ? [i * 40 - 100, 30, i * 40 + 100, i * 40 - 50, i * 40 - 100] // Added a point (30) near center
              : [50, 100, 150, 100, 50], // 100 is center-ish
            y: isForestActive 
              ? [i * 20 - 50, 40, i * 20 + 50, i * 20 - 20, i * 20 - 50] // Added a point (40) near center
              : [30, 60, 80, 40, 30],
            translateX: [i * 15, 0, -i * 10, i * 12], // 0 for center phase
            translateY: [-i * 5, 0, i * 15, -i * 10], // 0 for center phase
            scale: [1, 1.2, 1, 0.8, 1], // Squash and stretch
          }}
          transition={{
            duration: isForestActive ? 8 + i : 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
            times: [0, 0.4, 0.7, 0.9, 1] // Explicit timing to stay near center longer (0.4)
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

export const SpiritButterfly: React.FC<{ isForestActive?: boolean }> = ({ isForestActive }) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-40"
      animate={{
        x: isForestActive ? [-200, 200, 100, -100, -200] : [0, 140, 60, -60, 0],
        y: isForestActive ? [-150, 150, 50, 200, -150] : [0, -100, 60, 140, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: isForestActive ? 20 : 15,
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
          animate={{ rotateY: [0, 80, 0] }}
          transition={{ duration: 0.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '50px' }}
        >
          {/* Left Wings - 2D Detailed Style */}
          <path d="M 50,50 Q 15,15 10,50 Q 15,85 50,60" fill="url(#wingGradMain)" stroke="#4c1d95" strokeWidth="1.5" />
          <path d="M 50,55 Q 25,75 25,90 Q 40,95 50,65" fill="#a855f7" opacity="0.8" stroke="#4c1d95" strokeWidth="1" />
          {/* Wing Detail Circles */}
          <circle cx="25" cy="40" r="4" fill="white" opacity="0.3" />
        </motion.g>

        <motion.g
          animate={{ rotateY: [0, -80, 0] }}
          transition={{ duration: 0.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '50px' }}
        >
          {/* Right Wings - 2D Detailed Style */}
          <path d="M 50,50 Q 85,15 90,50 Q 85,85 50,60" fill="url(#wingGradMain)" stroke="#4c1d95" strokeWidth="1.5" />
          <path d="M 50,55 Q 75,75 75,90 Q 60,95 50,65" fill="#a855f7" opacity="0.8" stroke="#4c1d95" strokeWidth="1" />
          {/* Wing Detail Circles */}
          <circle cx="75" cy="40" r="4" fill="white" opacity="0.3" />
        </motion.g>

        {/* Body Segments (Squash & Stretch - 12 principles) */}
        <motion.g
          animate={{ 
            scaleY: [1, 1.15, 0.9, 1],
            y: [0, -2, 2, 0]
          }}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          {/* Head & Antennae (Strongly attached) */}
          <circle cx="50" cy="42" r="3.5" fill="#1e1b4b" stroke="#4c1d95" strokeWidth="0.5" />
          <path d="M 48,40 L 40,30 M 52,40 L 60,30" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="40" cy="30" r="1" fill="#1e1b4b" />
          <circle cx="60" cy="30" r="1" fill="#1e1b4b" />
          
          {/* Main Thorax & Abdomen */}
          <ellipse cx="50" cy="55" rx="3.5" ry="10" fill="#1e1b4b" />
          <ellipse cx="50" cy="68" rx="2.5" ry="6" fill="#312e81" />
          {/* 2D highlight on body */}
          <rect x="49" y="48" width="1.5" height="15" rx="0.75" fill="white" opacity="0.2" />
        </motion.g>
      </svg>
    </motion.div>
  );
};
