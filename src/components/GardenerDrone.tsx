import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface GardenerDroneProps {
  mood?: 'idle' | 'working' | 'happy';
  className?: string;
  targetPos?: { x: number; y: number } | null;
  onPositionChange?: (pos: { x: number, y: number }) => void;
}

export const GardenerDrone: React.FC<GardenerDroneProps> = ({ 
  mood = 'idle', 
  className = "", 
  targetPos = null,
  onPositionChange 
}) => {
  const droneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // DRAG & FLY LOGIC
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring damping for smooth "organic" following/flying
  // Extremely high stiffness to ensure antenna/light stay "stacked" and connected during rapid hand movement
  const springConfig = { damping: 25, stiffness: 300 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  useEffect(() => {
    if (targetPos) {
      // Offset to center the drone on the target
      x.set(targetPos.x - 50); 
      y.set(targetPos.y - 50);
    }
  }, [targetPos, x, y]);

  return (
    <motion.div 
      ref={droneRef}
      drag
      dragElastic={0.1}
      dragMomentum={true}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        if (onPositionChange) {
          onPositionChange({ x: info.point.x, y: info.point.y });
        }
      }}
      className={`absolute cursor-grab active:cursor-grabbing z-[100] ${className}`}
      style={{ x: sx, y: sy }}
      animate={mood === 'working' ? {
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0]
      } : {
        scale: 1,
        rotate: 0
      }}
      transition={{
        duration: 0.5,
        repeat: mood === 'working' ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {/* Floating Hover Effect (Secondary Animation) */}
      <motion.div
        animate={{
          y: isDragging ? 0 : [0, -10, 0],
          rotateX: isDragging ? 0 : [0, 5, 0],
          rotateZ: isDragging ? 0 : [0, 2, -2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-2xl overflow-visible">
          <defs>
            <linearGradient id="droneBodyMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="shadowGrad">
              <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Shadow on the ground (Visual cue for height) */}
          <motion.ellipse 
             cx="50" cy="95" rx="20" ry="5" 
             fill="url(#shadowGrad)"
             animate={{ scale: isDragging ? 0.8 : [1, 1.2, 1], opacity: isDragging ? 0.2 : [0.3, 0.1, 0.3] }}
             transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Support Legs (Squash/Stretch) */}
          <motion.g animate={{ scaleY: [1, 0.9, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            <path d="M 30,75 L 20,88 M 70,75 L 80,88" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          </motion.g>

          {/* Hover Blades (Spinning) */}
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }} style={{ originX: '20px', originY: '45px' }}>
            <circle cx="20" cy="45" r="12" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
            <rect x="10" y="44" width="20" height="2" fill="#475569" rx="1" />
          </motion.g>
          <motion.g animate={{ rotate: -360 }} transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }} style={{ originX: '80px', originY: '45px' }}>
            <circle cx="80" cy="45" r="12" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
            <rect x="70" y="44" width="20" height="2" fill="#475569" rx="1" />
          </motion.g>

          {/* ANTENNA (SIGNAL WARE - FIXED ATTACHMENT) */}
          <motion.g 
            animate={{ 
              rotate: [-5, 5, -5],
              scaleY: [1, 1.05, 1]
            }} 
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: '50px', originY: '25px' }}
          >
            {/* The Antenna Stem */}
            <path d="M 50,25 L 50,2" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <path d="M 45,18 L 55,18 M 47,12 L 53,12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Red Signal Light (Flickering with 12 principles - Anticipation/Intensity) */}
            <motion.g cx="50" cy="2">
              <motion.circle 
                cx="50" cy="2" r="4" 
                fill="#ef4444" 
                filter="url(#glow)"
                animate={{ 
                  opacity: [1, 0.4, 1, 0.8, 1],
                  scale: [1, 1.5, 1, 1.2, 1]
                }} 
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity,
                  times: [0, 0.2, 0.4, 0.6, 1]
                }} 
              />
              <motion.circle 
                cx="50" cy="2" r="10" 
                fill="none" stroke="#ef4444" 
                strokeWidth="1"
                animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.g>
          </motion.g>

          {/* Main Sphere Body (Squash and Stretch) */}
          <motion.circle 
            cx="50" cy="55" r="32" 
            fill="url(#droneBodyMain)" 
            stroke="#1e293b" 
            strokeWidth="3"
            animate={{ scaleY: [1, 1.05, 0.95, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Decorative Panel Lines */}
          <path d="M 25,45 Q 50,40 75,45" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.4" />
          <path d="M 25,65 Q 50,70 75,65" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.4" />

          {/* Face Visor */}
          <rect x="28" y="44" width="44" height="20" rx="10" fill="#0f172a" />

          {/* Eyes (Mood aware) */}
          <motion.g>
            {mood === 'idle' && (
               <>
                 <motion.circle 
                   cx="40" cy="54" r="4" fill="#38bdf8" 
                   animate={{ scaleY: [1, 0.1, 1] }}
                   transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                 />
                 <motion.circle 
                   cx="60" cy="54" r="4" fill="#38bdf8" 
                   animate={{ scaleY: [1, 0.1, 1] }}
                   transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                 />
               </>
            )}
            {mood === 'working' && (
              <>
                <motion.path 
                  d="M 35,54 L 45,54" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" 
                  animate={{ y: [-1, 1, -1] }} transition={{ duration: 0.3, repeat: Infinity }}
                />
                <motion.path 
                  d="M 55,54 L 65,54" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" 
                  animate={{ y: [1, -1, 1] }} transition={{ duration: 0.3, repeat: Infinity }}
                />
              </>
            )}
            {mood === 'happy' && (
              <g transform="translate(50, 54)">
                 <path d="M -14,-2 Q -10,-8 -6,-2" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
                 <path d="M 6,-2 Q 10,-8 14,-2" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}
          </motion.g>

          {/* Working Beam (Only shown when working) */}
          {mood === 'working' && (
            <motion.path 
              d="M 50,75 L 20,110 L 80,110 Z" 
              fill="rgba(56, 189, 248, 0.2)"
              animate={{ opacity: [0.2, 0.5, 0.2], scaleX: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}

          {/* Robotic Claws (Anticipation motion) */}
          <motion.g
            animate={mood === 'working' ? { rotate: [0, 15, -15, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ originX: '50px', originY: '80px' }}
          >
            <path d="M 45,85 L 40,95 M 55,85 L 60,95" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            <motion.circle 
              cx="50" cy="85" r="4" 
              fill="#1e293b" 
              animate={mood === 'working' ? { fill: ["#1e293b", "#38bdf8", "#1e293b"] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
};
