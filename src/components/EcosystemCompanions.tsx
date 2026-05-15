import React from 'react';
import { motion } from 'motion/react';

export const NanoBees: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ x: 50 + i * 20, y: 50 + i * 10 }}
          animate={{
            x: [50 + i * 20, 150 + i * 10, 50 + i * 20],
            y: [50 + i * 10, 80 + i * 30, 50 + i * 10],
            rotateZ: [0, 10, -10, 0]
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 40 40" className="w-8 h-8">
            <motion.path 
              d="M 10,20 Q 15,10 20,20 Q 25,30 30,20" 
              fill="none" stroke="#fbbf24" strokeWidth="2" 
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <circle cx="20" cy="20" r="4" fill="#fbbf24" />
            <motion.path 
              d="M 18,18 L 10,12 M 22,18 L 30,12" 
              stroke="#cbd5e1" strokeWidth="1" 
              animate={{ rotate: [0, 45, 0] }}
              transition={{ duration: 0.1, repeat: Infinity }}
            />
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
        x: [0, 100, -50, 0],
        y: [0, -50, 100, 0],
        rotate: [0, 20, -20, 0]
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <svg viewBox="0 0 60 60" className="w-12 h-12">
        <defs>
          <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
        {/* Left Wing */}
        <motion.path 
          d="M 30,30 Q 10,10 5,30 Q 10,50 30,35" 
          fill="url(#wingGrad)"
          animate={{ scaleX: [1, 0.2, 1] }}
          transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '30px' }}
        />
        
        {/* Right Wing */}
        <motion.path 
          d="M 30,30 Q 50,10 55,30 Q 50,50 30,35" 
          fill="url(#wingGrad)"
          animate={{ scaleX: [1, 0.2, 1] }}
          transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '30px' }}
        />
        
        <circle cx="30" cy="30" r="2" fill="white" className="blur-[1px]" />
      </svg>
    </motion.div>
  );
};
