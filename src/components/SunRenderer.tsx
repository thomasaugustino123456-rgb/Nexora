import React from 'react';
import { motion } from 'framer-motion';

export const SunRenderer: React.FC = () => {
  return (
    <div className="absolute -top-20 -right-20 pointer-events-none z-[60]">
      <motion.div 
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1]
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <svg viewBox="0 0 100 100" className="w-32 h-32 overflow-visible">
          <defs>
            <radialGradient id="sunInner">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>
            <filter id="sunGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* UV Halo / Pulsing Rings (Visualizing "Reflecting Light") */}
          <motion.circle 
            cx="50" cy="50" r="30" 
            fill="none" stroke="#fde047" strokeWidth="0.5"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle 
            cx="50" cy="50" r="25" 
            fill="none" stroke="#fde047" strokeWidth="1"
            animate={{ scale: [1, 2], opacity: [0.4, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          />

          {/* Rays (12 Principles: Staggered animation) */}
          {[...Array(12)].map((_, i) => (
            <motion.path
              key={i}
              d="M 50,5 L 50,15"
              stroke="#fbbf24"
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(${i * 30} 50 50)`}
              animate={{ 
                scaleY: [1, 1.4, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
              style={{ originY: '15px' }}
            />
          ))}

          {/* LIGHT REFLECTION BEAMS (Directing light to plant) */}
          <motion.g
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <path d="M 50,50 L -200,300" stroke="#fde047" strokeWidth="2" strokeDasharray="10 20" opacity="0.3" />
            <path d="M 55,55 L -150,280" stroke="#fde047" strokeWidth="1" strokeDasharray="5 15" opacity="0.2" />
          </motion.g>

          {/* Core Sun Body */}
          <circle cx="50" cy="50" r="22" fill="url(#sunInner)" stroke="#854d0e" strokeWidth="2" filter="url(#sunGlow)" />
          
          {/* Cartoon Face (Expressive Squash/Stretch) */}
          <motion.g
            animate={{ scaleY: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ originX: '50px', originY: '50px' }}
          >
            {/* Eyes */}
            <circle cx="44" cy="48" r="2" fill="#854d0e" />
            <circle cx="56" cy="48" r="2" fill="#854d0e" />
            <circle cx="45" cy="47" r="0.8" fill="white" />
            <circle cx="57" cy="47" r="0.8" fill="white" />
            
            {/* Smile */}
            <path d="M 44,56 Q 50,60 56,56" fill="none" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
            
            {/* Blushed Cheeks */}
            <circle cx="40" cy="54" r="3" fill="#fca5a5" opacity="0.4" />
            <circle cx="60" cy="54" r="3" fill="#fca5a5" opacity="0.4" />
          </motion.g>
        </svg>
      </motion.div>
      
      {/* Ambient Glow */}
      <motion.div 
        className="absolute inset-0 bg-yellow-400/5 rounded-full blur-[100px] scale-[4]"
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  );
};
