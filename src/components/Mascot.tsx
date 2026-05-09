import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';

export type MascotMood = 'happy' | 'angry' | 'boiling' | 'neutral' | 'surprised';

interface MascotProps {
  className?: string;
  mood?: MascotMood;
  hat?: string;
  soundPack?: 'cat' | 'dog';
  onClick?: () => void;
  isSitting?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({ 
  className, 
  mood = 'happy', 
  hat = 'none', 
  soundPack = 'cat', 
  onClick,
  isSitting = false
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sloshAmount, setSloshAmount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();
  const controls = useAnimation();

  // Natural Blinking Logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMascotClick = async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Play sound
    const isDog = soundPack === 'dog';
    if (newCount <= 5) play(isDog ? 'dogHappy' : 'catHappy');
    else if (newCount <= 12) play(isDog ? 'dogHungry' : 'catHungry');

    // Water Sloshing Effect
    setSloshAmount(15);
    setTimeout(() => setSloshAmount(0), 600);

    // Professional "Bounce" Animation (Squash and Stretch)
    await controls.start({
      scaleY: [1, 0.75, 1.15, 1],
      scaleX: [1, 1.25, 0.85, 1],
      y: [0, 15, -35, 0],
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
    
    if (onClick) onClick();
  };

  const actualMood = (clickCount >= 9 && clickCount <= 12) ? 'angry' : mood;
  const isAngry = actualMood === 'angry' || actualMood === 'boiling';
  const isBoiling = actualMood === 'boiling';
  const isNeutral = actualMood === 'neutral';

  // Eye movement calculation
  const eyeX = mousePos.x * 20;
  const eyeY = mousePos.y * 10;

  return (
    <motion.div 
      ref={containerRef}
      className={`bottle-container cursor-pointer select-none relative group ${className || ''}`}
      onClick={handleMascotClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      animate={controls}
      whileHover={{ y: -5, scale: 1.02 }}
      style={{ 
        perspective: 1000,
        width: '100%',
        maxWidth: '512px', // User requested large size
        aspectRatio: '1/1.2'
      }}
    >
      <svg 
        viewBox="0 0 500 600" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full drop-shadow-2xl"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isBoiling ? "#FF5C5C" : "#5CD6FF"} />
            <stop offset="30%" stopColor={isBoiling ? "#FF2A2A" : "#0095FF"} />
            <stop offset="100%" stopColor={isBoiling ? "#D60000" : "#0047FF"} />
          </linearGradient>

          <linearGradient id="glass-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#C2EFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>

          <clipPath id="bottle-mask">
            <ellipse cx="250" cy="330" rx="190" ry="160" />
            <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" />
            <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" />
          </clipPath>
        </defs>

        {/* Shadow */}
        <motion.ellipse 
          cx="250" cy="520" rx={150} ry={15} 
          fill="#000" fillOpacity="0.08"
          animate={{ 
            rx: [150, 155, 150], 
            opacity: [0.08, 0.12, 0.08],
            scale: controls.isAnimating ? [1, 1.2, 0.8, 1] : 1
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Body Group with Squash/Stretch */}
        <motion.g
          animate={{ 
            y: isSitting ? 20 : [0, -6, 0],
            scaleY: isSitting ? 0.85 : [1, 1.03, 1] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* LIQUID LAYER */}
          <g clipPath="url(#bottle-mask)">
            <rect x="0" y="0" width="500" height="600" fill="#F0FAFF" fillOpacity="0.3" />
            <motion.g 
              animate={{ 
                y: isBoiling ? [220, 215, 220] : 220,
                rotate: sloshAmount ? [0, -sloshAmount, sloshAmount, 0] : 0,
                x: sloshAmount ? [0, -5, 5, 0] : 0
              }}
              transition={{ 
                rotate: { duration: 0.6, ease: "easeInOut" },
                y: { duration: 0.5, repeat: isBoiling ? Infinity : 0 }
              }}
              style={{ originX: "250px", originY: "330px" }}
            >
              {/* Back wave */}
              <motion.path 
                d="M -500,0 Q -375,-25 -250,0 T 0,0 T 250,0 T 500,0 T 750,0 T 1000,0 L 1000,400 L -500,400 Z" 
                fill={isBoiling ? "#FF8888" : "#66CCFF"} 
                fillOpacity="0.6" 
                animate={{ x: [-250, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              {/* Front wave */}
              <motion.path 
                d="M -500,10 Q -375,35 -250,10 T 0,10 T 250,10 T 500,10 T 750,10 T 1000,10 L 1000,400 L -500,400 Z" 
                fill="url(#water-grad)" 
                animate={{ x: [0, -250] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.g>
          </g>


          {/* GLASS BOTTLE HIGHLIGHTS & OUTLINES */}
          <g stroke="#88D4FF" strokeWidth="4" fill="none">
            <ellipse cx="250" cy="330" rx="190" ry="160" strokeOpacity="0.4" />
            
            {/* Ears with Follow-through wobble */}
            <motion.path 
              d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" 
              fill="url(#glass-edge)" 
              fillOpacity="0.8"
              animate={{ rotate: isAngry ? [-5, 5, -5] : [0, 3, 0] }}
              transition={{ duration: isAngry ? 0.3 : 3.5, repeat: Infinity }}
            />
            <motion.path 
              d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" 
              fill="url(#glass-edge)" 
              fillOpacity="0.8"
              animate={{ rotate: isAngry ? [5, -5, 5] : [0, -3, 0] }}
              transition={{ duration: isAngry ? 0.3 : 3.5, repeat: Infinity }}
            />
          </g>

          {/* Reflections */}
          <path d="M 90,300 A 160,130 0 0,1 200,190 A 150,120 0 0,0 110,310 Z" fill="#ffffff" fillOpacity="0.4" />
          <path d="M 425,300 A 170,140 0 0,1 350,460" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" opacity="0.3" />

          {/* ARMS */}
          <motion.ellipse 
            cx="60" cy="310" rx="15" ry="30" fill="#B3E5FC" stroke="#88D4FF" strokeWidth="2"
            animate={{ rotate: isAngry ? -60 : -30, x: isAngry ? -5 : 0 }} 
          />
          <motion.ellipse 
            cx="440" cy="310" rx="15" ry="30" fill="#B3E5FC" stroke="#88D4FF" strokeWidth="2"
            animate={{ rotate: isAngry ? 60 : 30, x: isAngry ? 5 : 0 }} 
          />

          {/* FACIAL FEATURES */}
          <g transform={`translate(${eyeX}, ${eyeY})`}>
            {/* EYES */}
            {!isAngry ? (
              <>
                <motion.g animate={{ scaleY: isBlinking ? 0.1 : 1 }} transition={{ duration: 0.1 }}>
                  <circle cx="180" cy="260" r="16" fill="#001845" />
                  <circle cx="320" cy="260" r="16" fill="#001845" />
                  {/* High Quality Pupils */}
                  <circle cx="185" cy="254" r="6" fill="#fff" />
                  <circle cx="325" cy="254" r="6" fill="#fff" />
                </motion.g>
              </>
            ) : (
              <>
                <path d="M 155,240 L 205,270" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
                <path d="M 295,270 L 345,240" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
              </>
            )}

            {/* MOUTH & BLUSH */}
            <AnimatePresence mode="wait">
              {isAngry ? (
                <motion.path 
                  key="angry-mouth"
                  d="M 220 320 Q 250 290 280 320" 
                  fill="none" stroke="#001845" strokeWidth="10" strokeLinecap="round"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                />
              ) : (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="happy-face">
                  <path 
                    d="M 210 295 Q 250 345 290 295" 
                    fill="#FF4D6D" stroke="#001845" strokeWidth="4"
                  />
                  <ellipse cx="145" cy="290" rx="18" ry="10" fill="#FF4D6D" fillOpacity="0.2" />
                  <ellipse cx="355" cy="290" rx="18" ry="10" fill="#FF4D6D" fillOpacity="0.2" />
                </motion.g>
              )}
            </AnimatePresence>
          </g>

          {/* Glowing N */}
          <motion.g 
            filter="url(#glow)"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path d="M 235 380 L 250 380 L 265 410 L 265 380 L 275 380 L 275 425 L 265 425 L 250 395 L 250 425 L 235 425 Z" fill="#fff" />
          </motion.g>
        </motion.g>

        {/* HATS - Weighted to follow body movement */}
        <motion.g 
          style={{ originX: "250px", originY: "330px" }}
          animate={{ y: isSitting ? 40 : 0 }}
        >
          {hat === 'crown' && (
            <path d="M 180,100 L 180,40 L 215,70 L 250,40 L 285,70 L 320,40 L 320,100 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="4" />
          )}
          {hat === 'cool' && (
             <g transform="translate(140, 245)">
               <rect x="0" y="0" width="80" height="25" rx="4" fill="#000" />
               <rect x="140" y="0" width="80" height="25" rx="4" fill="#000" />
               <rect x="80" y="10" width="60" height="5" fill="#000" />
             </g>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
};

