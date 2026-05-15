import React from 'react';
import { motion } from 'framer-motion';

export const NanoBees: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute z-30"
          animate={{
            x: [50, 150, 100, 50],
            y: [30, 80, 40, 30],
            // Individual bee offset (organic swarm behavior)
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
          <svg viewBox="0 0 20 20" className="w-5 h-5 overflow-visible drop-shadow-md">
            {/* WINGS (High speed flicker - 12 principles) */}
            <motion.path 
              d="M 10,10 Q 5,5 2,10 Q 5,15 10,12" 
              fill="#94a3b8" opacity="0.6"
              animate={{ rotateZ: [0, 45, 0] }}
              transition={{ duration: 0.05, repeat: Infinity }}
              style={{ originX: '10px', originY: '10px' }}
            />
            <motion.path 
              d="M 10,10 Q 15,5 18,10 Q 15,15 10,12" 
              fill="#94a3b8" opacity="0.6"
              animate={{ rotateZ: [0, -45, 0] }}
              transition={{ duration: 0.05, repeat: Infinity }}
              style={{ originX: '10px', originY: '10px' }}
            />
            
            {/* Body (Squash & Stretch) */}
            <motion.ellipse 
              cx="10" cy="11" rx="4" ry="3" 
              fill="#facc15" 
              animate={{ scale: [1, 1.1, 0.9, 1] }} 
              transition={{ duration: 0.2, repeat: Infinity }}
            />
            <rect x="7" y="9" width="6" height="1" fill="#422006" />
            <rect x="7" y="12" width="6" height="1" fill="#422006" />
            
            {/* Eyes */}
            <circle cx="8" cy="10" r="0.5" fill="black" />
            <circle cx="12" cy="10" r="0.5" fill="black" />
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
        x: [0, 120, 80, -40, 0],
        y: [0, -80, 40, 120, 0],
        rotateX: [0, 15, 0, -15, 0],
        rotateY: [0, 45, 0, -45, 0],
        rotateZ: [0, 10, -10, 0]
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* GLOW TRAIL PARTICLE (Anticipation) */}
      <motion.div 
        className="absolute -inset-4 bg-purple-500/20 blur-xl rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <svg viewBox="0 0 60 60" className="w-12 h-12 overflow-visible">
        <defs>
          <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
          </linearGradient>
          <filter id="butterflyGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Antennae */}
        <motion.g animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 0.5, repeat: Infinity }}>
          <path d="M 30,30 L 25,15 M 30,30 L 35,15" stroke="white" strokeWidth="0.5" opacity="0.6" />
        </motion.g>

        {/* Left Wing (Squash & Stretch) */}
        <motion.path 
          d="M 30,30 Q 5,5 2,30 Q 5,55 30,35" 
          fill="url(#wingGrad)"
          filter="url(#butterflyGlow)"
          animate={{ rotateY: [0, 80, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '30px' }}
        />
        
        {/* Right Wing */}
        <motion.path 
          d="M 30,30 Q 55,5 58,30 Q 55,55 30,35" 
          fill="url(#wingGrad)"
          filter="url(#butterflyGlow)"
          animate={{ rotateY: [0, -80, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '30px' }}
        />
        
        {/* Core Body */}
        <motion.ellipse 
          cx="30" cy="32" rx="1.5" ry="6" 
          fill="white" 
          animate={{ scaleY: [1, 1.2, 1] }} 
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
};
