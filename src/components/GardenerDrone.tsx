import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

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
  const springConfig = { damping: 25, stiffness: 180 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  // Inertia/Tilt effect for "12 Principles" (Overlapping Action) using Motion Values for zero lag
  const tilt = useTransform(sx, (latest) => {
    const velocity = sx.getVelocity();
    return velocity * 0.08; // Increased tilt for more impact
  });

  const antennaTilt = useTransform(sx, (latest) => {
    const velocity = sx.getVelocity();
    return velocity * 0.15; // Antenna bends more (overlapping action)
  });

  // Squash based on Y velocity (Principles: Squash and Stretch)
  const squash = useTransform(sy, (latest) => {
    const velocity = Math.abs(sy.getVelocity());
    return 1 + (velocity * 0.0005);
  });
  
  const stretch = useTransform(sy, (latest) => {
    const velocity = Math.abs(sy.getVelocity());
    return 1 / (1 + (velocity * 0.0005));
  });

  useEffect(() => {
    if (targetPos) {
      // Smoothly move to targetPos instead of jump
      x.set(targetPos.x - 50); 
      y.set(targetPos.y - 50);
    }
  }, [targetPos, x, y]);

  return (
    <motion.div 
      ref={droneRef}
      drag
      dragElastic={0.3}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        if (onPositionChange) {
          onPositionChange({ x: info.point.x, y: info.point.y });
        }
      }}
      className={`absolute cursor-grab active:cursor-grabbing z-[100] ${className}`}
      style={{ 
        x: sx, 
        y: sy, 
        rotateZ: tilt,
        scaleX: stretch, 
        scaleY: squash 
      }}
      animate={mood === 'working' ? {
        scale: [1, 1.08, 0.95, 1],
        rotate: [0, 5, -5, 0]
      } : {
        scale: 1,
        rotate: 0
      }}
      transition={{
        duration: 0.6,
        repeat: mood === 'working' ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {/* Floating Hover Effect (Secondary Animation) */}
      <motion.div
        animate={{
          y: isDragging ? 0 : [0, -12, 0],
          rotateX: isDragging ? 0 : [0, 8, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 100 120" className="w-24 h-28 overflow-visible">
          <defs>
            <linearGradient id="droneBodyMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <radialGradient id="shadowGrad">
              <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Shadow on the ground (Visual cue for height) */}
          <motion.ellipse 
             cx="50" cy="115" rx="20" ry="5" 
             fill="url(#shadowGrad)"
             animate={{ 
                scale: isDragging ? 0.7 : [1, 1.3, 1], 
                opacity: isDragging ? 0.1 : [0.4, 0.1, 0.4]
             }}
             transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Hover Blades (Spinning & Tilting) */}
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }} style={{ originX: '20px', originY: '65px' }}>
            <rect x="5" y="64" width="30" height="2" fill="#334155" rx="1" opacity="0.6" />
          </motion.g>
          <motion.g animate={{ rotate: -360 }} transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }} style={{ originX: '80px', originY: '65px' }}>
            <rect x="65" y="64" width="30" height="2" fill="#334155" rx="1" opacity="0.6" />
          </motion.g>

          {/* ANTENNA (SIGNAL WARE - Correctly attached to body top) */}
          <motion.g 
            style={{ originX: '50px', originY: '45px', rotate: antennaTilt }}
          >
            {/* The Antenna Stem anchored firmly */}
            <path d="M 50,45 L 50,15" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            
            {/* Red Signal Light (Prominent & Pulsing) */}
            <motion.g transform="translate(50, 15)">
              <circle r="6" fill="#ef4444" />
              <motion.circle 
                r="6" 
                fill="#ff0000" 
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.5, 1]
                }} 
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }} 
              />
              <motion.circle 
                r="10" 
                fill="none" stroke="#ff0000" 
                strokeWidth="1.5"
                animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.g>
          </motion.g>

          {/* Main Sphere Body */}
          <motion.circle 
            cx="50" cy="75" r="35" 
            fill="url(#droneBodyMain)" 
            stroke="#0f172a" 
            strokeWidth="3"
          />
          
          {/* Face Visor */}
          <rect x="25" y="65" width="50" height="20" rx="10" fill="#020617" />
          <rect x="30" y="67" width="40" height="4" rx="2" fill="white" opacity="0.1" />

          {/* Eyes (Mood aware) */}
          <motion.g>
            {mood === 'idle' && (
               <>
                 <motion.circle 
                   cx="40" cy="74" r="4" fill="#38bdf8" 
                   animate={{ scaleY: [1, 0.1, 1] }}
                   transition={{ duration: 5, repeat: Infinity, repeatDelay: 2 }}
                 />
                 <motion.circle 
                   cx="60" cy="74" r="4" fill="#38bdf8" 
                   animate={{ scaleY: [1, 0.1, 1] }}
                   transition={{ duration: 5, repeat: Infinity, repeatDelay: 2 }}
                 />
               </>
            )}
            {mood === 'working' && (
              <>
                <motion.path 
                  d="M 35,74 L 45,74" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" 
                  animate={{ y: [-1, 1, -1] }} transition={{ duration: 0.3, repeat: Infinity }}
                />
                <motion.path 
                  d="M 55,74 L 65,74" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" 
                  animate={{ y: [1, -1, 1] }} transition={{ duration: 0.3, repeat: Infinity }}
                />
              </>
            )}
            {mood === 'happy' && (
              <g transform="translate(50, 74)">
                 <path d="M -14,-2 Q -10,-8 -6,-2" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
                 <path d="M 6,-2 Q 10,-8 14,-2" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
              </g>
            )}
          </motion.g>

          {/* Robotic Claws (Anticipation motion) */}
          <motion.g
            animate={mood === 'working' ? { rotate: [0, 20, -20, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ originX: '50px', originY: '95px' }}
          >
            <path d="M 45,100 L 40,110 M 55,100 L 60,110" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
            <motion.circle 
              cx="50" cy="100" r="5" 
              fill="#0f172a" 
              animate={mood === 'working' ? { fill: ["#0f172a", "#38bdf8", "#0f172a"] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
};
