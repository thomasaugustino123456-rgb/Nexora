import React from 'react';
import { motion } from 'motion/react';

interface GardenerDroneProps {
  mood?: 'idle' | 'working' | 'happy';
  className?: string;
}

export const GardenerDrone: React.FC<GardenerDroneProps> = ({ mood = 'idle', className = "" }) => {
  return (
    <motion.div 
      className={`relative w-24 h-24 ${className}`}
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="droneBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <filter id="eyeGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Support Arms / Legs */}
        <motion.path 
          d="M 30,70 L 20,85 M 70,70 L 80,85" 
          stroke="#334155" 
          strokeWidth="4" 
          strokeLinecap="round"
          animate={{ scaleY: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Hover Fans */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} style={{ originX: '25px', originY: '40px' }}>
          <path d="M 15,40 L 35,40" stroke="#1e293b" strokeWidth="2" opacity="0.4" />
        </motion.g>
        <motion.g animate={{ rotate: -360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} style={{ originX: '75px', originY: '40px' }}>
          <path d="M 65,40 L 85,40" stroke="#1e293b" strokeWidth="2" opacity="0.4" />
        </motion.g>

        {/* Main Sphere Body */}
        <circle cx="50" cy="55" r="30" fill="url(#droneBody)" stroke="#1e293b" strokeWidth="2" />
        
        {/* Metal Panel Lines */}
        <path d="M 30,45 Q 50,40 70,45" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.3" />
        <path d="M 30,65 Q 50,70 70,65" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.3" />

        {/* Face Visor */}
        <rect x="30" y="48" width="40" height="15" rx="8" fill="#0f172a" />

        {/* Eyes (Animated for Mood) */}
        <motion.g filter="url(#eyeGlow)">
          {mood === 'idle' && (
             <>
               <motion.circle 
                 cx="42" cy="55" r="3" fill="#38bdf8" 
                 animate={{ opacity: [1, 0.4, 1] }}
                 transition={{ duration: 3, repeat: Infinity }}
               />
               <motion.circle 
                 cx="58" cy="55" r="3" fill="#38bdf8" 
                 animate={{ opacity: [1, 0.4, 1] }}
                 transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
               />
             </>
          )}
          {mood === 'working' && (
            <motion.path 
              d="M 38,55 L 46,55 M 54,55 L 62,55" 
              stroke="#fbbf24" 
              strokeWidth="2" 
              strokeLinecap="round"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          {mood === 'happy' && (
            <g transform="translate(50, 55)">
               <path d="M -12,-2 Q -8,-6 -4,-2" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
               <path d="M 4,-2 Q 8,-6 12,-2" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
        </motion.g>

        {/* Tool Arm */}
        <motion.g
          animate={mood === 'working' ? { rotate: [0, 20, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ originX: '50px', originY: '75px' }}
        >
          <path d="M 50,75 L 50,90" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <motion.circle 
            cx="50" cy="92" r="3" 
            fill={mood === 'working' ? "#38bdf8" : "#1e293b"} 
            animate={mood === 'working' ? { r: [3, 5, 3] } : {}}
          />
        </motion.g>

        {/* Antenna */}
        <motion.path 
          d="M 50,25 L 50,15" 
          stroke="#1e293b" 
          strokeWidth="2" 
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ originX: '50px', originY: '25px' }}
        />
        <motion.circle 
          cx="50" cy="15" r="2" 
          fill="#ef4444" 
          animate={{ opacity: [1, 0, 1] }} 
          transition={{ duration: 2, repeat: Infinity }} 
        />
      </svg>
    </motion.div>
  );
};
