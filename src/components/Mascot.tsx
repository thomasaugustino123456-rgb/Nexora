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

    // Professional "Bounce" Animation (Squash and Stretch)
    await controls.start({
      scaleY: [1, 0.8, 1.1, 1],
      scaleX: [1, 1.2, 0.9, 1],
      y: [0, 10, -20, 0],
      transition: { duration: 0.5, ease: "easeOut" }
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
      className={`bottle-container cursor-pointer select-none ${className || ''}`}
      onClick={handleMascotClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      animate={controls}
      whileHover={{ y: -5 }}
      style={{ perspective: 1000 }}
    >
      <svg 
        viewBox="0 0 500 600" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isBoiling ? "#FF5C5C" : "#5CD6FF"} />
            <stop offset="100%" stopColor={isBoiling ? "#D60000" : "#0047FF"} />
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
          fill="#000" fillOpacity="0.1"
          animate={{ rx: [150, 160, 150], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Body Group with Squash/Stretch */}
        <motion.g
          animate={{ 
            y: isSitting ? 20 : [0, -4, 0],
            scaleY: isSitting ? 0.85 : [1, 1.02, 1] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* LIQUID LAYER */}
          <g clipPath="url(#bottle-mask)">
            <rect x="0" y="0" width="500" height="600" fill="#F0FAFF" fillOpacity="0.3" />
            <motion.g 
              animate={{ y: isBoiling ? [220, 215, 220] : 220 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <path 
                d="M 0,0 Q 125,-25 250,0 T 500,0 T 750,0 T 1000,0 T 1250,0 T 1500,0 L 1500,400 L 0,400 Z" 
                fill={isBoiling ? "#FF8888" : "#66CCFF"} 
                fillOpacity="0.6" 
              />
              <path 
                d="M -1000,10 Q -875,35 -750,10 T -500,10 T -250,10 T 0,10 T 250,10 T 500,10 L 500,400 L -1000,400 Z" 
                fill="url(#water-grad)" 
              />
            </motion.g>
          </g>

          {/* GLASS BOTTLE */}
          <g stroke="#88D4FF" strokeWidth="4" fill="none">
            <ellipse cx="250" cy="330" rx="190" ry="160" strokeOpacity="0.5" />
            
            {/* Ears with Follow-through wobble */}
            <motion.path 
              d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" 
              fill="#E0F7FF" fillOpacity="0.6"
              animate={{ rotate: isAngry ? [-5, 5, -5] : [0, 2, 0] }}
              transition={{ duration: isAngry ? 0.3 : 3, repeat: Infinity }}
            />
            <motion.path 
              d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" 
              fill="#E0F7FF" fillOpacity="0.6"
              animate={{ rotate: isAngry ? [5, -5, 5] : [0, -2, 0] }}
              transition={{ duration: isAngry ? 0.3 : 3, repeat: Infinity }}
            />
          </g>

          {/* ARMS */}
          <motion.ellipse 
            cx="60" cy="310" rx="15" ry="30" fill="#B3E5FC" 
            animate={{ rotate: isAngry ? -60 : -30, x: isAngry ? -5 : 0 }} 
          />
          <motion.ellipse 
            cx="440" cy="310" rx="15" ry="30" fill="#B3E5FC" 
            animate={{ rotate: isAngry ? 60 : 30, x: isAngry ? 5 : 0 }} 
          />

          {/* FACIAL FEATURES */}
          <g transform={`translate(${eyeX}, ${eyeY})`}>
            {/* EYES */}
            {!isAngry ? (
              <>
                <motion.g animate={{ scaleY: isBlinking ? 0.1 : 1 }} transition={{ duration: 0.1 }}>
                  <circle cx="180" cy="260" r="15" fill="#001845" />
                  <circle cx="320" cy="260" r="15" fill="#001845" />
                  {/* Highlights */}
                  <circle cx="185" cy="255" r="5" fill="#fff" />
                  <circle cx="325" cy="255" r="5" fill="#fff" />
                </motion.g>
              </>
            ) : (
              <>
                <path d="M 155,240 L 205,270" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
                <path d="M 295,270 L 345,240" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
              </>
            )}

            {/* MOUTH */}
            <AnimatePresence mode="wait">
              {isAngry ? (
                <motion.path 
                  key="angry-mouth"
                  d="M 220 320 Q 250 290 280 320" 
                  fill="none" stroke="#001845" strokeWidth="10" strokeLinecap="round"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                />
              ) : (
                <motion.path 
                  key="happy-mouth"
                  d="M 210 295 Q 250 340 290 295" 
                  fill="#FF4D6D" stroke="#001845" strokeWidth="4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                />
              )}
            </AnimatePresence>
          </g>

          {/* Glowing N */}
          <motion.g 
            filter="url(#glow)"
            animate={{ opacity: [0.5, 1, 0.5] }}
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

