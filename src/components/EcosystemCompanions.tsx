import React from 'react';
import { motion } from 'framer-motion';

// NEON HIGH-FIDELITY FUTURE BEE SWARM COMPANION
export const NanoBees: React.FC<{ isForestActive?: boolean }> = ({ isForestActive }) => {
  // We've increased the swarm size to 4 for a visually richer environment
  const beeCount = 4;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(beeCount)].map((_, i) => {
        // Individualized offset orbits for clean natural swarming simulation
        const delay = i * 0.7;
        const duration = isForestActive ? 7 + i * 1.5 : 5 + i * 1.2;
        
        return (
          <motion.div
            key={i}
            className="absolute z-30 overflow-visible"
            style={{
              width: "48px",
              height: "48px",
            }}
            animate={{
              // Elegant Lissajous / chaotic orbits centering near the plant
              x: isForestActive 
                ? [
                    15 + Math.sin(i + 1) * 80, 
                    60 + Math.sin(i + 2) * 40, 
                    120 + Math.cos(i + 3) * 60, 
                    -30 + Math.sin(i + 4) * 50, 
                    15 + Math.sin(i + 1) * 80
                  ]
                : [
                    20 + Math.cos(i * 1.5) * 60, 
                    100 + Math.sin(i * 1.2) * 50, 
                    160 + Math.cos(i * 2) * 40, 
                    60 + Math.sin(i * 0.8) * 40, 
                    20 + Math.cos(i * 1.5) * 60
                  ],
              y: isForestActive 
                ? [
                    40 + Math.cos(i + 1) * 60, 
                    140 + Math.sin(i + 2) * 80, 
                    80 + Math.cos(i + 3) * 50, 
                    20 + Math.sin(i + 4) * 40, 
                    40 + Math.cos(i + 1) * 60
                  ]
                : [
                    20 + Math.sin(i) * 30, 
                    70 + Math.cos(i * 1.1) * 40, 
                    120 + Math.sin(i * 1.5) * 30, 
                    40 + Math.cos(i * 0.9) * 20, 
                    20 + Math.sin(i) * 30
                  ],
              scale: [0.95, 1.15, 0.85, 1.05, 0.95],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            }}
          >
            {/* Ambient Micro-Glow Underlay to give a futuristic vector bloom effect */}
            <div className="absolute inset-2 bg-yellow-400/25 rounded-full blur-[6px] animate-pulse pointer-events-none" />

            <svg viewBox="0 0 50 50" className="w-12 h-12 overflow-visible filter drop-shadow-[0_2px_8px_rgba(250,204,21,0.45)]">
              <defs>
                <linearGradient id="cyberWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="nanoStripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
              </defs>

              {/* TRANSLUCENT CYBER GLOW WINGS (Super High-frequency wings flapping) */}
              <motion.g 
                animate={{ rotateY: [0, 85, -85, 0] }} 
                transition={{ duration: 0.05 + (i * 0.005), repeat: Infinity, ease: "linear" }} 
                style={{ originX: '25px', originY: '25px' }}
              >
                {/* Advanced mechanical honeycomb wings */}
                <path d="M 25,25 Q 18,10 6,18 Q 15,32 25,27" fill="url(#cyberWingGrad)" stroke="#0284c7" strokeWidth="0.75" />
                <path d="M 25,25 Q 32,10 44,18 Q 35,32 25,27" fill="url(#cyberWingGrad)" stroke="#0284c7" strokeWidth="0.75" />
                {/* Internal wing fiber matrix */}
                <line x1="25" y1="25" x2="12" y2="15" stroke="#bae6fd" strokeWidth="0.5" opacity="0.6" />
                <line x1="25" y1="25" x2="38" y2="15" stroke="#bae6fd" strokeWidth="0.5" opacity="0.6" />
              </motion.g>

              {/* DETAILED NANO-BEE CHASSIS */}
              <motion.g
                animate={{ 
                  y: [-1, 1, -1],
                  rotateZ: [-2, 2, -2]
                }}
                transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: '25px', originY: '25px' }}
              >
                {/* Micro Power Core (Thump/Pulse) */}
                <motion.circle 
                  cx="25" cy="27" r="9" 
                  fill="#1e293b" 
                  stroke="#fbbf24" 
                  strokeWidth="1.5" 
                />

                {/* Cyber Stripes (Highly detailed warning decals) */}
                <ellipse cx="25" cy="27" rx="7.5" ry="5.5" fill="url(#nanoStripeGrad)" />
                <path d="M 21,22 Q 25,21 29,22" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                <path d="M 19,27 Q 25,26 31,27" fill="none" stroke="#1e293b" strokeWidth="2" />
                <path d="M 21,31 Q 25,30 29,31" fill="none" stroke="#1e293b" strokeWidth="1.5" />

                {/* Sub-Armor Plating (Visual depth) */}
                <path d="M 24,21 L 26,21" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" />

                {/* Bioluminescent Sensor Eyes */}
                <circle cx="28.5" cy="25.5" r="1.5" fill="#38bdf8" className="animate-pulse" />
                <circle cx="21.5" cy="25.5" r="1.5" fill="#38bdf8" className="animate-pulse" />
                
                {/* High Tech Antennae Systems */}
                <path d="M 28,21 Q 33,16 35,17" fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                <circle cx="35" cy="17" r="1" fill="#38bdf8" />
                
                <path d="M 22,21 Q 17,16 15,17" fill="none" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                <circle cx="15" cy="17" r="1" fill="#38bdf8" />

                {/* Honeycomb Polishing Dust Ring */}
                <motion.circle 
                  cx="25" cy="27" r="13" 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="1.25" 
                  strokeDasharray="4 8"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </motion.g>
            </svg>

            {/* Glowing Golden Particle Sparks Trailing Behind (Secondary action principle) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_8px_#facc15]"
                animate={{ 
                  scale: [0, 1.4, 0],
                  y: [10, 32, 45],
                  x: [-5, 5, -10],
                  opacity: [0.8, 0] 
                }}
                transition={{ 
                  duration: 1.4, 
                  repeat: Infinity, 
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              />
              <motion.div 
                className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]"
                animate={{ 
                  scale: [0, 1.2, 0],
                  y: [5, 20, 35],
                  x: [10, -5, 8],
                  opacity: [0.7, 0] 
                }}
                transition={{ 
                  duration: 1.1, 
                  repeat: Infinity, 
                  delay: i * 0.45,
                  ease: "easeOut"
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};


// SUPREME BIOLUMINESCENT SPIRIT BUTTERFLY WITH SACRED GEOMETRY GLOW
export const SpiritButterfly: React.FC<{ isForestActive?: boolean }> = ({ isForestActive }) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-40 overflow-visible"
      style={{
        width: "90px",
        height: "90px",
      }}
      animate={{
        // Graceful hovering sway with elegant loop sweeps
        x: isForestActive 
          ? [-140, 120, -40, 70, -140] 
          : [-20, 90, 30, -50, -20],
        y: isForestActive 
          ? [-110, 80, -90, 130, -110] 
          : [10, -80, 40, 100, 10],
        rotate: [0, 12, -10, 4, 0]
      }}
      transition={{
        duration: isForestActive ? 16 : 12,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* 1. Divine Aura Ring / Sacred Geometry (Aesthetic design upgrade) */}
      <motion.div 
        className="absolute -inset-10 border border-fuchsia-500/25 rounded-full pointer-events-none"
        animate={{ 
          scale: [0.75, 1.15, 0.75],
          rotate: 360,
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute -inset-10 bg-gradient-to-tr from-fuchsia-500/5 via-violet-500/10 to-indigo-500/5 rounded-full blur-2xl pointer-events-none"
        animate={{ 
          scale: [0.9, 1.3, 0.9],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 100 100" className="w-20 h-20 overflow-visible filter drop-shadow-[0_4px_16px_rgba(168,85,247,0.55)]">
        <defs>
          {/* Stunning multi-color gradient maps for the iridescent glowing wings */}
          <linearGradient id="iridescentLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="40%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="iridescentRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="40%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="wingVeinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fae8ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* GUIDING PRINCIPLE: Elegant flaps paired with 3D roll and skew angles */}
        
        {/* LEFT WING ASSEMBLY */}
        <motion.g
          animate={{ rotateY: [0, 75, -15, 0] }}
          transition={{ duration: 0.22, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '50px', originY: '52px' }}
        >
          {/* Main Top Wing Shield */}
          <path 
            d="M 50,50 Q 15,10 6,45 Q 12,75 50,58" 
            fill="url(#iridescentLeft)" 
            stroke="#4a044e" 
            strokeWidth="1.5" 
          />
          {/* Bottom Wing Feather */}
          <path 
            d="M 50,56 Q 22,76 22,88 Q 36,92 50,62" 
            fill="#a855f7" 
            opacity="0.9" 
            stroke="#4a044e" 
            strokeWidth="1.2" 
          />
          {/* Detailed Iridescent Glowing Orbs */}
          <circle cx="24" cy="38" r="4.5" fill="#fae8ff" className="animate-pulse" />
          <circle cx="24" cy="38" r="2" fill="white" />
          <circle cx="34" cy="72" r="3" fill="#22d3ee" />
          
          {/* Elegant Wing Veins for master craft detail */}
          <path d="M 50,52 Q 35,35 20,40" fill="none" stroke="url(#wingVeinGrad)" strokeWidth="1" />
          <path d="M 50,54 Q 38,55 24,58" fill="none" stroke="url(#wingVeinGrad)" strokeWidth="0.75" />
          <path d="M 50,56 Q 32,70 30,82" fill="none" stroke="url(#wingVeinGrad)" strokeWidth="0.75" />
        </motion.g>

        {/* RIGHT WING ASSEMBLY */}
        <motion.g
          animate={{ rotateY: [0, -75, 15, 0] }}
          transition={{ duration: 0.22, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '50px', originY: '52px' }}
        >
          {/* Main Top Wing Shield */}
          <path 
            d="M 50,50 Q 85,10 94,45 Q 88,75 50,58" 
            fill="url(#iridescentRight)" 
            stroke="#4a044e" 
            strokeWidth="1.5" 
          />
          {/* Bottom Wing Feather */}
          <path 
            d="M 50,56 Q 78,76 78,88 Q 64,92 50,62" 
            fill="#a855f7" 
            opacity="0.9" 
            stroke="#4a044e" 
            strokeWidth="1.2" 
          />
          {/* Detailed Iridescent Glowing Orbs */}
          <circle cx="76" cy="38" r="4.5" fill="#fae8ff" className="animate-pulse" />
          <circle cx="76" cy="38" r="2" fill="white" />
          <circle cx="66" cy="72" r="3" fill="#22d3ee" />

          {/* Elegant Wing Veins for master craft detail */}
          <path d="M 50,52 Q 65,35 80,40" fill="none" stroke="url(#wingVeinGrad)" strokeWidth="1" />
          <path d="M 50,54 Q 62,55 76,58" fill="none" stroke="url(#wingVeinGrad)" strokeWidth="0.75" />
          <path d="M 50,56 Q 68,70 70,82" fill="none" stroke="url(#wingVeinGrad)" strokeWidth="0.75" />
        </motion.g>

        {/* CORE SYSTEM BUTTERFLY CORPUS */}
        <motion.g
          animate={{ 
            scaleY: [1, 1.12, 0.92, 1],
            y: [-1, -2, 1, -1]
          }}
          transition={{ duration: 0.44, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: '50px', originY: '55px' }}
        >
          {/* Head & Sensory Pods */}
          <circle cx="50" cy="41" r="4" fill="#1e152a" stroke="#d946ef" strokeWidth="1" />
          <circle cx="49" cy="40" r="1.2" fill="#22d3ee" />
          <circle cx="51" cy="40" r="1.2" fill="#22d3ee" />

          {/* Curved, glowing physical antennae */}
          <path d="M 48,39 Q 42,28 32,29" fill="none" stroke="#4a044e" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 52,39 Q 58,28 68,29" fill="none" stroke="#4a044e" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="32" cy="29" r="1.5" fill="#fae8ff" className="animate-pulse" />
          <circle cx="68" cy="29" r="1.5" fill="#fae8ff" className="animate-pulse" />
          
          {/* Layered Abdomen Segments */}
          <ellipse cx="50" cy="55" rx="4" ry="11" fill="#1e152a" stroke="#a855f7" strokeWidth="0.75" />
          <ellipse cx="50" cy="69" rx="2.5" ry="7" fill="#3b0764" />
          
          {/* Intricately detailed shining biological core accent */}
          <rect x="49" y="47" width="2" height="15" rx="1" fill="#22d3ee" opacity="0.8" />
          <rect x="49.5" y="49" width="1" height="8" rx="0.5" fill="white" />
        </motion.g>
      </svg>

      {/* Divine Spirit Stardust Falling Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: index % 2 === 0 ? "5px" : "3px",
              height: index % 2 === 0 ? "5px" : "3px",
              background: index % 2 === 0 ? "#e9d5ff" : "#86efac",
              boxShadow: "0 0 8px currentColor"
            }}
            animate={{
              y: [10, 40, 75],
              x: [Math.sin(index) * 15, Math.cos(index) * 20, Math.sin(index) * 25],
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.2, 0.3]
            }}
            transition={{
              duration: 2.2 + index * 0.4,
              repeat: Infinity,
              delay: index * 0.7,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
