import React from 'react';
import { motion } from 'framer-motion';

interface CompanionProps {
  isPlantGrown?: boolean;
}

export const NanoBees: React.FC<CompanionProps> = ({ isPlantGrown }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute z-30"
          animate={{
            x: isPlantGrown ? [80, 120, 100 + (i * 10)] : [50, 250, 100, 50],
            y: isPlantGrown ? [180, 200, 190 + (i * 5)] : [100, 200, 150, 100],
            rotateZ: [0, 5, -5, 0],
            scale: isPlantGrown ? 0.7 : 0.9
          }}
          transition={{
            duration: 10 + i,
            repeat: Infinity,
            ease: "linear", 
            delay: i * 0.5
          }}
        >
          {/* Detailed 2D Bee */}
          <svg viewBox="0 0 40 40" className="w-8 h-8 overflow-visible">
             {/* Wings - Simplified (No Filters) */}
             <motion.g style={{ originX: '20px', originY: '20px' }}>
                <motion.path 
                  d="M 20,20 Q 10,5 5,20 Q 10,35 20,20" 
                  fill="rgba(255,255,255,0.6)" 
                  stroke="#94a3b8" 
                  strokeWidth="0.5"
                  animate={{ rotateY: [0, 80, 0] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                />
                <motion.path 
                  d="M 20,20 Q 30,5 35,20 Q 30,35 20,20" 
                  fill="rgba(255,255,255,0.6)" 
                  stroke="#94a3b8" 
                  strokeWidth="0.5"
                  animate={{ rotateY: [0, -80, 0] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                />
             </motion.g>

             {/* Bee Body */}
             <g>
                <ellipse cx="20" cy="22" rx="7" ry="5" fill="#facc15" stroke="#422006" strokeWidth="1" />
                <path d="M 17,18 L 17,26 M 20,17 L 20,27 M 23,18 L 23,26" stroke="#422006" strokeWidth="1.5" opacity="0.6" />
                <circle cx="28" cy="22" r="4" fill="#facc15" stroke="#422006" strokeWidth="1" />
                <circle cx="29" cy="21" r="1" fill="#000" />
             </g>
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export const SpiritButterfly: React.FC<CompanionProps> = ({ isPlantGrown }) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-40"
      animate={{
        x: isPlantGrown ? 110 : [0, 140, -40, 0],
        y: isPlantGrown ? 160 : [0, -80, 80, 0],
      }}
      transition={{
        duration: isPlantGrown ? 12 : 20,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <svg viewBox="0 0 80 80" className="w-16 h-16 overflow-visible">
        <defs>
          <linearGradient id="buttyWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        
        {/* Left Wings */}
        <motion.g style={{ originX: '40px', originY: '42px' }}>
          <motion.path 
            d="M 40,42 Q 10,10 5,42 Q 10,75 40,45" 
            fill="url(#buttyWing)"
            stroke="white"
            strokeWidth="0.5"
            animate={{ rotateY: [0, 70, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
        
        {/* Right Wings */}
        <motion.g style={{ originX: '40px', originY: '42px' }}>
          <motion.path 
            d="M 40,42 Q 70,10 75,42 Q 70,75 40,45" 
            fill="url(#buttyWing)"
            stroke="white"
            strokeWidth="0.5"
            animate={{ rotateY: [0, -70, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
        
        {/* Body */}
        <ellipse cx="40" cy="42" rx="2" ry="8" fill="#1e293b" />
        <circle cx="40" cy="33" r="2.5" fill="#1e293b" />
      </svg>
    </motion.div>
  );
};
