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
    return velocity * 0.08; // Proportional tilt relative to flight speed
  });

  const antennaTilt = useTransform(sx, (latest) => {
    const velocity = sx.getVelocity();
    return velocity * 0.15; // Antenna bends with organic lag
  });

  // Squash and Stretch based on Y velocity (Principles of Animation)
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
      // Smoothly drift target position center offset
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
        scaleY: squash,
        willChange: 'transform' // Hardware-level rendering optimization
      }}
      animate={mood === 'working' ? {
        scale: [1, 1.06, 0.96, 1],
        rotate: [0, 4, -4, 0]
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
      {/* Floating Hover Effect (Secondary organic hover sway) */}
      <motion.div
        animate={{
          y: isDragging ? 0 : [0, -14, 0],
          rotateX: isDragging ? 0 : [0, 6, 0]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative overflow-visible"
      >
        <svg viewBox="0 0 110 130" className="w-24 h-28 overflow-visible">
          <defs>
            {/* Sleek executive metal and glossy reflections */}
            <linearGradient id="droneBodyMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="45%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="armorOrange" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <linearGradient id="laserGleam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="shadowGradZone">
              <stop offset="0%" stopColor="rgba(15,23,42,0.45)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0)" />
            </radialGradient>
          </defs>

          {/* Height cues: Dynamic ground shadow */}
          <motion.ellipse 
             cx="55" cy="120" rx="22" ry="5.5" 
             fill="url(#shadowGradZone)"
             animate={{ 
                scale: isDragging ? 0.75 : [1, 1.25, 1], 
                opacity: isDragging ? 0.15 : [0.45, 0.2, 0.45]
             }}
             transition={{ duration: 3.2, repeat: Infinity }}
             className="pointer-events-none"
          />

          {/* ACTIVE SWEEPING SCANNER BEAM (Working state animation) */}
          {mood === 'working' && (
            <motion.polygon 
              points="55,95 20,240 90,240"
              fill="url(#laserGleam)"
              animate={{ 
                opacity: [0.3, 0.65, 0.3],
                scaleX: [0.9, 1.15, 0.9],
                skewX: [-8, 8, -8]
              }}
              style={{ originX: '55px', originY: '95px' }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none"
            />
          )}

          {/* Cybernetic Landing Struts */}
          <motion.g animate={{ scaleY: [1, 0.85, 1.15, 1] }} transition={{ duration: 3.2, repeat: Infinity }}>
            <path d="M 33,95 L 22,112 M 77,95 L 88,112" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="22" cy="112" r="3" fill="#475569" />
            <circle cx="88" cy="112" r="3" fill="#475569" />
          </motion.g>

          {/* Jet Thruster Fire Trails on Left & Right Side Engines */}
          <g className="pointer-events-none">
            {/* Left Engine Fire */}
            <motion.path 
              d="M 12,85 Q 5,108 12,118 Q 19,108 12,85"
              fill="url(#armorOrange)" 
              animate={{ scaleY: [1, 1.4, 0.9, 1.2, 1] }}
              transition={{ duration: 0.25, repeat: Infinity }}
              style={{ originY: '85px', originX: '12px' }}
            />
            {/* Right Engine Fire */}
            <motion.path 
              d="M 98,85 Q 91,108 98,118 Q 105,108 98,85"
              fill="url(#armorOrange)" 
              animate={{ scaleY: [1.1, 0.95, 1.45, 1, 1.1] }}
              transition={{ duration: 0.22, repeat: Infinity }}
              style={{ originY: '85px', originX: '98px' }}
            />
          </g>

          {/* Side Engine Thrusters Capsule */}
          <rect x="7" y="68" width="10" height="22" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <rect x="93" y="68" width="10" height="22" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />

          {/* Ultra-Fast Dual Hover Rotors */}
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }} style={{ originX: '22px', originY: '58px' }}>
            <circle cx="22" cy="58" r="16" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.45" />
            <rect x="6" y="57" width="32" height="2" fill="#0f172a" rx="1" />
            <circle cx="22" cy="58" r="3.5" fill="#fbbf24" />
          </motion.g>
          <motion.g animate={{ rotate: -360 }} transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }} style={{ originX: '88px', originY: '58px' }}>
            <circle cx="88" cy="58" r="16" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.45" />
            <rect x="72" y="57" width="32" height="2" fill="#0f172a" rx="1" />
            <circle cx="88" cy="58" r="3.5" fill="#fbbf24" />
          </motion.g>

          {/* ANTENNA STEM (Bends beautifully with velocity) */}
          <motion.g 
            style={{ originX: '55px', originY: '42px', rotate: antennaTilt }}
          >
            {/* Deep space steel antenna spire */}
            <path d="M 55,42 L 55,14" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <path d="M 55,36 L 55,14" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
            
            {/* Transmitter Node Halo */}
            <circle cx="55" cy="14" r="8" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
            
            {/* Cybernetic Status Core Beam Indicator (Pulsing neon) */}
            <motion.circle 
              cx="55" cy="14" r="5" 
              fill={mood === 'working' ? '#22d3ee' : mood === 'happy' ? '#4ade80' : '#f43f5e'} 
              animate={{ 
                opacity: [0.65, 1, 0.65],
                scale: [1, 1.45, 1]
              }} 
              transition={{ 
                duration: mood === 'working' ? 0.8 : 1.6, 
                repeat: Infinity,
                ease: "easeInOut"
              }} 
            />
            {/* Secondary Beacon Wave Expansion */}
            <motion.circle 
              cx="55" cy="14" r="8" 
              fill="none" 
              stroke={mood === 'working' ? '#22d3ee' : mood === 'happy' ? '#4ade80' : '#f43f5e'} 
              strokeWidth="1.5"
              animate={{ scale: [1, 2.7], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.g>

          {/* PREMIUM GLOBULAR HULL (Equipped with high-tech racing stripes) */}
          <motion.circle 
            cx="55" cy="76" r="36" 
            fill="url(#droneBodyMetal)" 
            stroke="#0f172a" 
            strokeWidth="3.5" 
            animate={{ 
              scaleY: [1, 1.04, 0.96, 1],
              scaleX: [1, 0.96, 1.04, 1]
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Sporty High-Contrast Decal Bands */}
          <path d="M 23,60 Q 55,75 87,60" fill="none" stroke="#f97316" strokeWidth="3" />
          <path d="M 20,85 Q 55,100 90,85" fill="none" stroke="#f97316" strokeWidth="3" />

          {/* Hull Screw Mechanical Details (Professional asset feel) */}
          <circle cx="31" cy="51" r="1.5" fill="#475569" />
          <circle cx="79" cy="51" r="1.5" fill="#475569" />
          <circle cx="21" cy="74" r="1.5" fill="#475569" />
          <circle cx="89" cy="74" r="1.5" fill="#475569" />
          
          {/* Main Curved Dark Glass Visor Screen */}
          <rect x="27" y="64" width="56" height="24" rx="12" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
          <path d="M 33,67 Q 55,74 77,67" stroke="white" strokeWidth="1" opacity="0.15" fill="none" />

          {/* Emotional Face Matrices (Cozy, high fidelity) */}
          <motion.g>
            {mood === 'idle' && (
               <>
                 <motion.ellipse 
                   cx="43" cy="76" rx="3.5" ry="4.5" fill="#06b6d4" 
                   animate={{ scaleY: [1, 0.15, 1] }}
                   transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 2.5 }}
                 />
                 <motion.ellipse 
                   cx="67" cy="76" rx="3.5" ry="4.5" fill="#06b6d4" 
                   animate={{ scaleY: [1, 0.15, 1] }}
                   transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 2.5 }}
                 />
                 {/* Calm micro breathing indicator grid */}
                 <rect x="52" y="78" width="6" height="1.5" rx="0.75" fill="#22d3ee" opacity="0.4" />
               </>
            )}
            {mood === 'working' && (
              <>
                {/* Advanced task focus displays */}
                <motion.path 
                  d="M 36,76 L 48,76" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" 
                  animate={{ y: [-1.2, 1.2, -1.2] }} transition={{ duration: 0.25, repeat: Infinity }}
                />
                <motion.path 
                  d="M 62,76 L 74,76" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" 
                  animate={{ y: [1.2, -1.2, 1.2] }} transition={{ duration: 0.25, repeat: Infinity }}
                />
                {/* Concentrated heart sensor */}
                <circle cx="55" cy="76" r="2" fill="#fbbf24" className="animate-pulse" />
              </>
            )}
            {mood === 'happy' && (
              <g transform="translate(55, 77)">
                 {/* High quality friendly smile curving */}
                 <path d="M -15,-3 Q -10,-10 -5,-3" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
                 <path d="M 5,-3 Q 10,-10 15,-3" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
                 <path d="M -4,4 Q 0,8 4,4" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
          </motion.g>

          {/* Underbelly Suction Nozzle Cap (Water hose feeder nozzle) */}
          <rect x="47" y="112" width="16" height="5" rx="2.5" fill="#475569" opacity="0.9" />
          <motion.circle 
            cx="55" cy="112" r="3" 
            fill={mood === 'working' ? '#22d3ee' : '#1e293b'} 
            animate={mood === 'working' ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};
