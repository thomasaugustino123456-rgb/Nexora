import React from 'react';
import { motion } from 'framer-motion';

interface WaterMascotProps {
  className?: string;
  progress: number; // 0 to 1 (0% to 100%)
}

export const WaterMascot: React.FC<WaterMascotProps> = ({ className, progress }) => {
  // Map progress (0-1) to Y translation (490 to 150)
  // 0% -> 490 (bottom)
  // 100% -> 150 (top)
  const fillY = 490 - (progress * 340);

  return (
    <div className={`bottle-container ${className || ''}`}>
      <svg viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          {/* Filters - removed for performance */}

          {/* Gradients */}
          <linearGradient id="water-grad-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5CD6FF" />
            <stop offset="30%" stopColor="#0095FF" />
            <stop offset="100%" stopColor="#0047FF" />
          </linearGradient>

          <linearGradient id="glass-edge-water" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#C2EFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>

          {/* Clip Path to mask the liquid to the bottle shape (Mascot body + Ears) */}
          <clipPath id="bottle-mask-water">
            {/* Main Body */}
            <ellipse cx="250" cy="330" rx="190" ry="160" />
            {/* Left Ear */}
            <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" />
            {/* Right Ear */}
            <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" />
          </clipPath>

          {/* Clip Path for the mouth */}
          <clipPath id="mouth-mask-water">
            <path d="M 225 300 Q 250 310 275 300 C 275 340 225 340 225 300 Z" />
          </clipPath>
        </defs>

        {/* Background Drop Shadow - Simplified */}
        <ellipse cx="250" cy="500" rx="150" ry="15" fill="#0066FF" fillOpacity="0.05" />

        {/* BOTTLE BACK GLASS */}
        <g id="bottle-back" stroke="#99DFFF" strokeWidth="4" fill="none">
          {/* Back of the neck/rim */}
          <path d="M 220 160 L 220 140 A 10 10 0 0 1 230 130 L 270 130 A 10 10 0 0 1 280 140 L 280 160" />
          {/* Back lip of the opening */}
          <ellipse cx="250" cy="130" rx="30" ry="8" strokeOpacity="0.5" />
        </g>

        {/* LIQUID LAYER (Clipped to Mascot Shape) */}
        <g clipPath="url(#bottle-mask-water)">
          
          {/* Empty Glass Tint (Background inside bottle) */}
          <rect x="0" y="0" width="500" height="600" fill="#F0FAFF" fillOpacity="0.3" />

          {/* The Water System */}
          <g id="water-system">
             {/* Using standard Framer Motion for the filling animation for better stability than CSS on re-renders */}
            <motion.g 
              animate={{ y: fillY }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              
              {/* Efficient Seamless Wave Animation using Framer Motion */}
              <motion.g
                animate={{ x: [0, -400] }}
                transition={{ ease: "linear", duration: 4, repeat: Infinity }}
              >
                <path 
                  d="M 0,20 Q 50,0 100,20 T 200,20 T 300,20 T 400,20 T 500,20 T 600,20 T 700,20 T 800,20 T 900,20 L 900,600 L 0,600 Z" 
                  fill="url(#water-grad-fill)" 
                  fillOpacity="0.9"
                />
                
                {/* Surface Highlight Wave */}
                <path 
                  d="M 0,25 Q 50,15 100,25 T 200,25 T 300,25 T 400,25 T 500,25 T 600,25 T 700,25 T 800,25 T 900,25 L 900,35 L 0,35 Z" 
                  fill="#ffffff" 
                  fillOpacity="0.15"
                />
              </motion.g>

              {/* Rising Bubbles */}
              <g fill="#ffffff" fillOpacity="0.4">
                <motion.circle cx="150" r="4"
                  animate={{ cy: [250, -20] }}
                  transition={{ ease: "linear", duration: 2.5, repeat: Infinity }}
                />
                <motion.circle cx="200" r="7"
                  initial={{ cy: 250 }}
                  animate={{ cy: [250, -20] }}
                  transition={{ ease: "linear", duration: 3.5, repeat: Infinity, delay: 1 }}
                />
                <motion.circle cx="350" r="3"
                  initial={{ cy: 250 }}
                  animate={{ cy: [250, -20] }}
                  transition={{ ease: "linear", duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </g>
            </motion.g>
          </g>
        </g>

        {/* WATER DROPS (Falling from the opening to create the "filling" effect) */}
        {progress < 1 && (
          <g fill="#5CD6FF">
            <motion.path 
              d="M 250 140 C 250 140 245 155 245 160 A 5 5 0 0 0 255 160 C 255 155 250 140 250 140 Z"
              animate={{ y: [0, 80], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear", times: [0, 0.2, 0.8, 1] }}
            />
            {/* Splash ripples on the surface */}
            <motion.ellipse 
              cx="250" cy={fillY} rx="15" ry="4" 
              fill="none" stroke="#FFFFFF" strokeWidth="2"
              animate={{ rx: [5, 35], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear", times: [0, 0.1, 1] }}
            />
          </g>
        )}

        {/* BOTTLE FRONT GLASS & OUTLINES */}
        {/* Front Rim */}
        <ellipse cx="250" cy="130" rx="30" ry="8" fill="rgba(255,255,255,0.2)" stroke="#88D4FF" strokeWidth="4" />
        <path d="M 220 130 L 220 160 A 10 10 0 0 0 230 170 L 270 170 A 10 10 0 0 0 280 160 L 280 130" fill="none" stroke="#88D4FF" strokeWidth="4" />
        
        {/* Main Mascot Bottle Body Outline */}
        <g stroke="#88D4FF" strokeWidth="4" fill="url(#glass-edge-water)">
          {/* Main Ellipse */}
          <ellipse cx="250" cy="330" rx="190" ry="160" />
          {/* Left Ear */}
          <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" strokeLinejoin="round" />
          {/* Right Ear */}
          <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" strokeLinejoin="round" />
        </g>

        {/* Floating Glass Arms / Nubs */}
        <g stroke="#88D4FF" strokeWidth="4" fill="url(#glass-edge-water)">
          {/* Left Arm */}
          <ellipse cx="60" cy="310" rx="15" ry="30" transform="rotate(-15, 60, 310)" />
          {/* Right Arm */}
          <ellipse cx="440" cy="310" rx="15" ry="30" transform="rotate(15, 440, 310)" />
        </g>

        {/* Glass Specular Highlights (To make it shiny!) */}
        {/* Big top-left highlight */}
        <path d="M 90,300 A 160,130 0 0,1 200,190 A 150,120 0 0,0 110,310 Z" fill="#ffffff" fillOpacity="0.6" />
        {/* Soft right edge glow */}
        <path d="M 425,300 A 170,140 0 0,1 350,460" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
        {/* Bottom bounce light */}
        <path d="M 150,470 A 170,140 0 0,0 350,470" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
        {/* Ear highlights */}
        <path d="M 120,130 C 120,130 140,140 150,160" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        <path d="M 380,130 C 380,130 360,140 350,160" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.7" />

        {/* MASCOT FACE & FEATURES */}
        <g id="face">
          {/* Left Eye */}
          <ellipse cx="180" cy="270" rx="20" ry="28" fill="#001845" />
          <circle cx="173" cy="255" r="8" fill="#ffffff" />
          <circle cx="185" cy="275" r="3" fill="#ffffff" />

          {/* Right Eye */}
          <ellipse cx="320" cy="270" rx="20" ry="28" fill="#001845" />
          <circle cx="313" cy="255" r="8" fill="#ffffff" />
          <circle cx="325" cy="275" r="3" fill="#ffffff" />

          {/* Mouth */}
          <path d="M 225 300 Q 250 310 275 300 C 275 340 225 340 225 300 Z" fill="#52001A" stroke="#001845" strokeWidth="4" strokeLinejoin="round" />
          <g clipPath="url(#mouth-mask-water)">
            <ellipse cx="250" cy="330" rx="18" ry="12" fill="#FF4D6D" />
          </g>
        </g>

        {/* The Glowing "N" on the belly - Simplified */}
        <g>
          <path d="M 220 360 L 235 360 L 260 400 L 260 360 L 275 360 L 275 420 L 260 420 L 235 380 L 235 420 L 220 420 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" />
        </g>

        {/* HALO - Simplified */}
        <motion.g 
          id="halo"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="250" cy="60" rx="90" ry="15" fill="none" stroke="#52D1FF" strokeWidth="6" opacity="0.6" />
          <ellipse cx="250" cy="60" rx="90" ry="15" fill="none" stroke="#ffffff" strokeWidth="2" />
        </motion.g>

        {/* SPARKLES / STARS - Removed filter */}
        <defs>
          <path id="star-water" d="M 0,-15 Q 0,0 15,0 Q 0,0 0,15 Q 0,0 -15,0 Q 0,0 0,-15 Z" fill="#ffffff" />
        </defs>

        <use href="#star-water" x="80" y="150" className="sparkle sparkle-1" />
        <use href="#star-water" x="420" y="200" className="sparkle sparkle-2" transform="scale(0.8)" />
        <use href="#star-water" x="120" y="450" className="sparkle sparkle-3" transform="scale(0.6)" />
        <use href="#star-water" x="380" y="420" className="sparkle sparkle-4" transform="scale(0.9)" />
        
        <motion.polygon 
          points="100,100 105,105 110,100 105,95" fill="#5CD6FF"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.polygon 
          points="400,120 403,123 406,120 403,117" fill="#5CD6FF"
          animate={{ opacity: [0.1, 0.9, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

      </svg>
    </div>
  );
};
