import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useSound } from '../hooks/useSound';
import nexoraAppIcon from '../assets/images/nexora_app_icon.png';

export type MascotMood = 'happy' | 'angry' | 'boiling' | 'neutral' | 'surprised';

interface MascotProps {
  className?: string;
  mood?: MascotMood;
  hat?: string;
  theme?: string;
  soundPack?: 'cat' | 'dog';
  onClick?: () => void;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: () => void;
  isSitting?: boolean;
  performanceMode?: boolean;
}

export const Mascot = React.memo(({ 
  className, 
  mood = 'happy', 
  hat = 'none', 
  theme = 'standard',
  soundPack = 'cat', 
  onClick,
  onPointerMove,
  onPointerLeave,
  isSitting = false,
  performanceMode = false
}: MascotProps) => {
  const [clickCount, setClickCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sloshAmount, setSloshAmount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastStateUpdateRef = useRef(0);
  const { play } = useSound();
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(true);

  // Intersection Observer to stop animations when not visible
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Natural Blinking Logic - Throttled when not visible
  useEffect(() => {
    if (!isVisible || performanceMode) return;
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, [isVisible]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !isVisible) return;
    const now = Date.now();
    if (now - lastStateUpdateRef.current < 32) return; // ~30fps throttle for smoothness + performance
    
    lastStateUpdateRef.current = now;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMascotClick = useCallback(() => {
    setClickCount(prev => {
      const newCount = prev + 1;
      
      // Play sound immediately without awaiting
      const isDog = soundPack === 'dog';
      if (newCount <= 5) play(isDog ? 'dogHappy' : 'catHappy');
      else if (newCount <= 12) play(isDog ? 'dogHungry' : 'catHungry');

      return newCount;
    });

    // Water Sloshing Effect
    setSloshAmount(25);
    setTimeout(() => setSloshAmount(0), 800);

    // Professional "Bounce" Animation
    controls.start({
      scaleY: [1, 0.7, 1.2, 1],
      scaleX: [1, 1.3, 0.8, 1],
      y: [0, 15, -40, 0],
      rotate: [0, -8, 8, 0],
      transition: { duration: 0.5, ease: "circOut" }
    });
    
    if (onClick) onClick();
  }, [soundPack, play, controls, onClick]);

  const actualMood = useMemo(() => (clickCount >= 9 && clickCount <= 12) ? 'angry' : mood, [clickCount, mood]);
  const isAngry = actualMood === 'angry' || actualMood === 'boiling';
  const isBoiling = actualMood === 'boiling';
  const isNeutral = actualMood === 'neutral';
  const isSurprised = actualMood === 'surprised';

  // Eye movement calculation
  const eyeX = mousePos.x * 20;
  const eyeY = mousePos.y * 10;

  // Theme Colors
  const getThemeColors = () => {
    switch (theme) {
      case 'neural_bio':
        return {
          water: ["#50FA7B", "#50FA7B", "#10b981"],
          edge: "#10b981",
          aura: "rgba(16, 185, 129, 0.2)",
          nColor: "#fff"
        };
      case 'obsidian':
        return {
          water: ["#2d3436", "#000000", "#1e293b"],
          edge: "#3b82f6",
          aura: "rgba(59, 130, 246, 0.3)",
          nColor: "#3b82f6"
        };
      case 'sunset':
        return {
          water: ["#f97316", "#ef4444", "#991b1b"],
          edge: "#ef4444",
          aura: "rgba(239, 68, 68, 0.2)",
          nColor: "#fff"
        };
      case 'oceanic_midnight':
        return {
          water: ["#00F2FE", "#0072FF", "#0A1C36"],
          edge: "#00F2FE",
          aura: "rgba(0, 242, 254, 0.25)",
          nColor: "#00F2FE"
        };
      default:
        return {
          water: [isBoiling ? "#FF5C5C" : "#5CD6FF", isBoiling ? "#FF2A2A" : "#0095FF", isBoiling ? "#D60000" : "#0047FF"],
          edge: "#88D4FF",
          aura: "rgba(59, 130, 246, 0.2)",
          nColor: "#fff"
        };
    }
  };

  const colors = getThemeColors();

  return (
    <motion.div 
      ref={containerRef}
      className={`bottle-container cursor-pointer select-none relative group ${className || ''}`}
      onClick={handleMascotClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      animate={controls}
      style={{ 
        perspective: 1000,
        width: '100%',
        maxWidth: '512px', 
        aspectRatio: '1/1.2',
        willChange: 'transform'
      }}
    >
      <svg 
        viewBox="0 0 500 600" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        <defs>
          {/* Use a simpler shadow or none for performance */}
          <clipPath id="bottle-mask-main">
            <ellipse cx="250" cy="330" rx="190" ry="160" />
            <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" />
            <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" />
          </clipPath>

          <linearGradient id="water-grad-main" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.water[0]} />
            <stop offset="30%" stopColor={colors.water[1]} />
            <stop offset="100%" stopColor={colors.water[2]} />
          </linearGradient>

          <linearGradient id="glass-edge-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor={theme === 'obsidian' ? '#1e293b' : '#C2EFFF'} stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Aura - Using CSS class instead of Framer to prevent re-render jumps */}
        <ellipse 
          cx="250" cy="330" rx="220" ry="220" 
          fill={colors.aura} 
          className={(isVisible && !performanceMode) ? "animate-mascot-aura" : ""}
        />

        {/* Neural Link Connection Effect for neural_bio theme */}
        {theme === 'neural_bio' && isVisible && !performanceMode && (
          <g opacity={0.4}>
            {[1, 2, 3].map((i) => (
              <motion.ellipse
                key={`neural-ring-${i}`}
                cx="250" cy="330" rx={190 + i * 20} ry={160 + i * 20}
                fill="none" stroke="#50FA7B" strokeWidth="1"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </g>
        )}

        {/* Shadow */}
        <ellipse 
          cx="250" cy="520" rx={150} ry={15} 
          fill="#000" 
          className={isVisible ? "animate-mascot-shadow" : ""}
        />

        {/* Body Group with Squash/Stretch - CSS classes for steady animation */}
        <motion.g animate={isSitting ? { y: 20, scaleY: 0.85 } : { y: 0, scaleY: 1 }}>
          <g className={(!isSitting && isVisible && !performanceMode) ? "animate-mascot-breathe" : ""}>
            {/* LIQUID LAYER */}
            <g clipPath="url(#bottle-mask-main)">
              <rect x="0" y="0" width="500" height="600" fill={theme === 'obsidian' ? '#0f172a' : '#F0FAFF'} fillOpacity="0.2" />
              
              {/* Liquid Group with Ambient Slosh */}
              <g transform={`translate(0, ${isBoiling ? -5 : 230})`}>
                {/* Seamless River Water Animation (CPU Optimized) */}
                <g className={(isVisible && !performanceMode) ? "animate-wave-mascot" : ""}>
                  <path 
                    d="M 0,20 Q 50,0 100,20 T 200,20 T 300,20 T 400,20 T 500,20 T 600,20 T 700,20 T 800,20 T 900,20 T 1000,20 L 1000,600 L 0,600 Z" 
                    fill="url(#water-grad-main)" 
                    fillOpacity="0.95"
                  />
                  {/* Highlight layer */}
                  <path 
                    d="M 0,25 Q 50,15 100,25 T 200,25 T 300,25 T 400,25 T 500,25 T 600,25 T 700,25 T 800,25 T 900,25 T 1000,25 L 1000,40 L 0,40 Z" 
                    fill="#ffffff" 
                    fillOpacity="0.1"
                  />
                </g>
              
                {/* Boiling Bubbles - Optimized with pure SVG animations */}
                {isBoiling && (
                  <g fill="#fff" fillOpacity="0">
                    <circle cx="230" cy="350" r="3" className="animate-bubble-angry-1" />
                    <circle cx="260" cy="350" r="3" className="animate-bubble-angry-2" />
                    <circle cx="290" cy="350" r="3" className="animate-bubble-angry-3" />
                  </g>
                )}
              </g>
            </g>

            {/* GLASS BOTTLE HIGHLIGHTS & OUTLINES */}
            <g stroke={colors.edge} strokeWidth="4" fill="none">
              <ellipse cx="250" cy="330" rx="190" ry="160" strokeOpacity="0.4" />
              
              {/* Glossy Sheen - Dynamic based on mouse */}
              <motion.path 
                d="M 150,220 Q 250,180 350,220" 
                fill="none" 
                stroke="#fff" 
                strokeWidth="15" 
                strokeLinecap="round" 
                strokeOpacity="0.1"
                animate={{ 
                  x: mousePos.x * 20,
                  y: mousePos.y * 10
                }}
              />
              
              {/* Ears with Follow-through wobble */}
              <path 
                d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" 
                fill="url(#glass-edge-main)" 
                fillOpacity="0.8"
                className={(isAngry || !isVisible) ? "" : "animate-mascot-ear-left"}
              />
              <path 
                d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" 
                fill="url(#glass-edge-main)" 
                fillOpacity="0.8"
                className={(isAngry || !isVisible) ? "" : "animate-mascot-ear-right"}
              />
            </g>

            {/* Reflections */}
            <path d="M 90,300 A 160,130 0 0,1 200,190 A 150,120 0 0,0 110,310 Z" fill="#ffffff" fillOpacity="0.4" />
            <path d="M 425,300 A 170,140 0 0,1 350,460" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" opacity={theme === 'obsidian' ? 0.1 : 0.3} />

            {/* ARMS */}
            <motion.ellipse 
              cx="60" cy="310" rx="15" ry="30" fill={theme === 'obsidian' ? '#1e293b' : '#B3E5FC'} stroke={colors.edge} strokeWidth="2"
              animate={isVisible ? { rotate: isAngry ? -60 : -30, x: isAngry ? -5 : 0 } : {}} 
            />
            <motion.ellipse 
              cx="440" cy="310" rx="15" ry="30" fill={theme === 'obsidian' ? '#1e293b' : '#B3E5FC'} stroke={colors.edge} strokeWidth="2"
              animate={isVisible ? { rotate: isAngry ? 60 : 30, x: isAngry ? 5 : 0 } : {}} 
            />

            {/* FACIAL FEATURES */}
            <g transform={`translate(${eyeX}, ${eyeY})`}>
              {/* EYES */}
              {!isAngry && !isSurprised ? (
                <>
                  <motion.g animate={{ scaleY: isBlinking ? 0.1 : 1 }} transition={{ duration: 0.1 }}>
                    <circle cx="180" cy="260" r="16" fill={theme === 'obsidian' ? '#60a5fa' : '#001845'} />
                    <circle cx="320" cy="260" r="16" fill={theme === 'obsidian' ? '#60a5fa' : '#001845'} />
                    {/* High Quality Pupils */}
                    <circle cx="185" cy="254" r="6" fill="#fff" />
                    <circle cx="325" cy="254" r="6" fill="#fff" />
                  </motion.g>
                </>
              ) : isSurprised ? (
                <>
                  <circle cx="180" cy="255" r="20" fill={theme === 'obsidian' ? '#60a5fa' : '#001845'} />
                  <circle cx="320" cy="255" r="20" fill={theme === 'obsidian' ? '#60a5fa' : '#001845'} />
                  <circle cx="180" cy="255" r="8" fill="#fff" />
                  <circle cx="320" cy="255" r="8" fill="#fff" />
                </>
              ) : (
                <>
                  <path d="M 155,240 L 205,270" stroke={theme === 'obsidian' ? '#60a5fa' : '#001845'} strokeWidth="12" strokeLinecap="round" />
                  <path d="M 295,270 L 345,240" stroke={theme === 'obsidian' ? '#60a5fa' : '#001845'} strokeWidth="12" strokeLinecap="round" />
                </>
              )}

              {/* MOUTH & BLUSH */}
              <AnimatePresence mode="wait">
                {isAngry ? (
                  <motion.path 
                    key="angry-mouth"
                    d="M 220 320 Q 250 290 280 320" 
                    fill="none" stroke={theme === 'obsidian' ? '#60a5fa' : '#001845'} strokeWidth="10" strokeLinecap="round"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  />
                ) : isSurprised ? (
                  <motion.ellipse 
                    key="surprised-mouth"
                    cx="250" cy="320" rx="15" ry="20" 
                    fill={theme === 'obsidian' ? '#60a5fa' : '#001845'}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                  />
                ) : (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="happy-face">
                    <path 
                      d="M 210 295 Q 250 345 290 295" 
                      fill={isNeutral && theme === 'obsidian' ? '#1e293b' : "#FF4D6D"} stroke={theme === 'obsidian' ? '#60a5fa' : '#001845'} strokeWidth="4"
                    />
                    <ellipse cx="145" cy="290" rx="18" ry="10" fill="#FF4D6D" fillOpacity={theme === 'obsidian' ? 0.05 : 0.2} />
                    <ellipse cx="355" cy="290" rx="18" ry="10" fill="#FF4D6D" fillOpacity={theme === 'obsidian' ? 0.05 : 0.2} />
                  </motion.g>
                )}
              </AnimatePresence>
            </g>

            {/* 3D Mascot Logo Badge - Embeds the official high-quality 3D droplet mascot inside the dynamic SVG */}
            <g transform="translate(250, 400)" className="animate-pulse">
              <circle cx="0" cy="0" r="45" fill={colors.nColor} opacity="0.25" />
              <circle cx="0" cy="0" r="38" fill="#FFFFFF" stroke={colors.edge} strokeWidth="3" />
              <clipPath id="logo-badge-clip">
                <circle cx="0" cy="0" r="35" />
              </clipPath>
              <g clipPath="url(#logo-badge-clip)">
                <image
                  href={nexoraAppIcon}
                  x="-35"
                  y="-35"
                  width="70"
                  height="70"
                />
              </g>
            </g>
          </g>
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
          {hat === 'wizard' && (
            <g transform="translate(160, 20)">
              {/* Purple Conical Wizard Hat */}
              <polygon points="90,120 45,10 0,120" fill="#7C3AED" stroke="#5B21B6" strokeWidth="4" />
              {/* Golden Stars */}
              <path d="M 45,30 L 48,38 L 56,38 L 50,43 L 52,51 L 45,46 L 38,51 L 40,43 L 34,38 L 42,38 Z" fill="#FBBF24" />
              <path d="M 27,75 L 29,79 L 34,79 L 30,82 L 31,87 L 27,84 L 23,87 L 24,82 L 20,79 L 25,79 Z" fill="#FBBF24" />
              <path d="M 63,70 L 65,74 L 70,74 L 66,77 L 67,82 L 63,79 L 59,82 L 60,77 L 56,74 L 61,74 Z" fill="#FBBF24" />
              {/* Hat brim */}
              <ellipse cx="45" cy="115" rx="60" ry="10" fill="#6D28D9" stroke="#4C1D95" strokeWidth="3" />
            </g>
          )}
          {hat === 'artist' && (
            <g transform="translate(160, 75)">
              {/* Red Beret */}
              <ellipse cx="90" cy="30" rx="48" ry="16" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
              <ellipse cx="90" cy="22" rx="40" ry="12" fill="#EF4444" />
              {/* Small fold / crease stem */}
              <path d="M 90,14 L 90,2" stroke="#991B1B" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
          {hat === 'viking' && (
            <g transform="translate(160, 65)">
              {/* Viking Horns */}
              <path d="M 40,40 Q 12,15 22,0 Q 28,15 45,30 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2.5" />
              <path d="M 140,40 Q 168,15 158,0 Q 152,15 135,30 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2.5" />
              {/* Steel Half-Helm */}
              <path d="M 40,55 A 50,50 0 0,1 140,55 Z" fill="#64748B" stroke="#475569" strokeWidth="4" />
              <rect x="85" y="5" width="10" height="50" fill="#475569" />
              <rect x="40" y="50" width="100" height="8" fill="#475569" rx="3" />
            </g>
          )}
          {hat === 'space' && (
            <g transform="translate(160, 105)">
              {/* Space helmet visor/bubble around face/head */}
              <circle cx="90" cy="110" r="105" fill="rgba(186, 230, 253, 0.15)" stroke="#0ea5e9" strokeWidth="3.5" strokeDasharray="4 4" />
              {/* Antenna */}
              <line x1="90" y1="5" x2="90" y2="-18" stroke="#0ea5e9" strokeWidth="3.5" />
              <circle cx="90" cy="-20" r="6" fill="#f43f5e" />
            </g>
          )}
          {hat === 'ninja' && (
            <g transform="translate(160, 215)">
              {/* Black Ninja Headband Mask across face */}
              <rect x="35" y="10" width="112" height="26" rx="5" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
              {/* Ties flowing on the left */}
              <path d="M 35,22 Q 15,10 10,24" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <path d="M 35,22 Q 13,32 12,38" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              {/* Ninja eye mask cutout inside */}
              <ellipse cx="91" cy="23" rx="32" ry="5.5" fill="#f8fafc" />
            </g>
          )}
          {hat === 'detective' && (
            <g transform="translate(160, 75)">
              {/* Classic Sherlock Brown Deerstalker Hat */}
              <path d="M 40,55 A 50,50 0 0,1 140,55 Z" fill="#854D0E" stroke="#713F12" strokeWidth="3" />
              {/* Earnest Ribbon bow */}
              <rect x="84" y="5" width="12" height="15" rx="3" fill="#A16207" />
              <circle cx="90" cy="3" r="3.5" fill="#713F12" />
              {/* Visors */}
              <path d="M 40,55 Q 5,55 35,45 Z" fill="#713F12" />
              <path d="M 140,55 Q 175,55 145,45 Z" fill="#713F12" />
            </g>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
});

