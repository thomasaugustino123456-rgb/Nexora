import React from 'react';
import { motion } from 'motion/react';

export const SunRenderer: React.FC = () => {
  return (
    <motion.div 
      className="absolute -top-20 -right-20 pointer-events-none z-[60]"
      animate={{
        rotate: 360
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <svg viewBox="0 0 100 100" className="w-32 h-32 overflow-visible">
        <defs>
          <radialGradient id="sunInner">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Rays */}
        {[...Array(8)].map((_, i) => (
          <motion.rect
            key={i}
            x="45" y="0" width="10" height="25" rx="5"
            fill="#fbbf24"
            transform={`rotate(${i * 45} 50 50)`}
            animate={{ 
              height: [25, 35, 25],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}

        {/* Core */}
        <circle cx="50" cy="50" r="25" fill="url(#sunInner)" filter="url(#sunGlow)" />
        
        {/* Face */}
        <motion.g
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ originX: '50px', originY: '50px' }}
        >
          <circle cx="43" cy="45" r="3" fill="#92400e" opacity="0.6" />
          <circle cx="57" cy="45" r="3" fill="#92400e" opacity="0.6" />
          <path d="M 40,55 Q 50,65 60,55" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </motion.g>
      </svg>
      
      {/* Light Rays Pattern */}
      <motion.div 
        className="absolute inset-0 bg-amber-400/10 rounded-full blur-3xl scale-[3]"
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
};
