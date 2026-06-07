import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useSound } from '../hooks/useSound';

const nexoraAppIcon = "/nexora_app_icon.png?v=1.5.2";

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
    if (now - lastStateUpdateRef.current < 32) return; // ~30fps throttle
    
    lastStateUpdateRef.current = now;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMascotClick = useCallback(() => {
    setClickCount(prev => {
      const newCount = prev + 1;
      
      const isDog = soundPack === 'dog';
      if (newCount <= 5) play(isDog ? 'dogHappy' : 'catHappy');
      else if (newCount <= 12) play(isDog ? 'dogHungry' : 'catHungry');

      return newCount;
    });

    setSloshAmount(25);
    setTimeout(() => setSloshAmount(0), 800);

    // Bouncy Squish & Stretch Click Anim
    controls.start({
      scaleY: [1, 0.75, 1.15, 1],
      scaleX: [1, 1.25, 0.85, 1],
      y: [0, 8, -25, 0],
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.45, ease: "circOut" }
    });
    
    if (onClick) onClick();
  }, [soundPack, play, controls, onClick]);

  const actualMood = useMemo(() => (clickCount >= 9 && clickCount <= 12) ? 'angry' : mood, [clickCount, mood]);
  const isAngry = actualMood === 'angry' || actualMood === 'boiling';
  const isBoiling = actualMood === 'boiling';
  const isNeutral = actualMood === 'neutral';
  const isSurprised = actualMood === 'surprised';

  const getThemeColors = () => {
    switch (theme) {
      case 'neural_bio':
        return {
          aura: "rgba(16, 185, 129, 0.25)",
          nColor: "#50FA7B"
        };
      case 'obsidian':
        return {
          aura: "rgba(59, 130, 246, 0.35)",
          nColor: "#3b82f6"
        };
      case 'sunset':
        return {
          aura: "rgba(249, 115, 22, 0.3)",
          nColor: "#ffedd5"
        };
      case 'oceanic_midnight':
        return {
          aura: "rgba(0, 242, 254, 0.3)",
          nColor: "#00F2FE"
        };
      default:
        return {
          aura: "rgba(59, 130, 246, 0.22)",
          nColor: "#88D4FF"
        };
    }
  };

  const colors = getThemeColors();

  return (
    <motion.div 
      ref={containerRef}
      className={`mascot-app-logo-container cursor-pointer select-none relative group ${className || ''}`}
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
          {/* Squircle Clip Path for perfect Apple/Google standard PWA frame ratio */}
          <clipPath id="app-icon-clip">
            <rect x="75" y="115" width="350" height="350" rx="80" ry="80" />
          </clipPath>

          {/* Theme Gradients for the Standard App Store Badge Background */}
          <linearGradient id="app-icon-bg-standard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="app-icon-bg-obsidian" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#070a13" />
            <stop offset="55%" stopColor="#020617" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="app-icon-bg-neural_bio" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#022c22" />
            <stop offset="50%" stopColor="#064e40" />
            <stop offset="100%" stopColor="#020e0c" />
          </linearGradient>
          <linearGradient id="app-icon-bg-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#431407" />
            <stop offset="50%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>
          <linearGradient id="app-icon-bg-oceanic_midnight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#021526" />
            <stop offset="60%" stopColor="#03346E" />
            <stop offset="100%" stopColor="#010610" />
          </linearGradient>
          
          {/* Glass Glossy highlight layer overlay */}
          <linearGradient id="app-icon-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
            <stop offset="38%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="38.1%" stopColor="#ffffff" stopOpacity="0" stopColor-opacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient background glow aura */}
        <ellipse 
          cx="250" cy="290" rx="210" ry="210" 
          fill={colors.aura} 
          className={(isVisible && !performanceMode) ? "animate-mascot-aura" : ""}
        />

        {/* Floating shadow beneath the App Card */}
        <ellipse 
          cx="250" cy="510" rx="135" ry="12" 
          fill="#000" 
          opacity="0.6"
          className={isVisible ? "animate-mascot-shadow" : ""}
        />

        {/* Body Group with Squash/Stretch - CSS classes for steady animation */}
        <motion.g animate={isSitting ? { y: 20, scaleY: 0.85 } : { y: 0, scaleY: 1 }}>
          <g className={(!isSitting && isVisible && !performanceMode) ? "animate-mascot-breathe" : ""}>
            
            {/* 3D App Store Icon Squircle Container */}
            <g className={isAngry ? "animate-shake" : ""}>
              {/* Outer soft shadow and high-tech bezel */}
              <rect 
                x="71" 
                y="111" 
                width="358" 
                height="358" 
                rx="84" 
                ry="84" 
                fill="none" 
                stroke={isAngry ? "#ef4444" : (theme === 'neural_bio' ? "#10b981" : "#ffffff")} 
                strokeWidth="4" 
                strokeOpacity="0.25"
              />
              <rect 
                x="73" 
                y="113" 
                width="354" 
                height="354" 
                rx="82" 
                ry="82" 
                fill="none" 
                stroke={isAngry ? "#f87171" : (theme === 'neural_bio' ? "#34d399" : "#3b82f6")} 
                strokeWidth="2.5" 
                strokeOpacity="0.4"
              />
              
              {/* Core Rounded App Icon Block with Dynamic Gradient Background */}
              <rect 
                x="75" 
                y="115" 
                width="350" 
                height="350" 
                rx="80" 
                ry="80" 
                fill={`url(#app-icon-bg-${theme === 'standard' ? 'standard' : theme})`}
                className="transition-all duration-300"
              />

              {/* Decorative Matrix Grid Lines for Cyber Neural bio theme */}
              {theme === 'neural_bio' && (
                <g clipPath="url(#app-icon-clip)" opacity="0.15" stroke="#50FA7B" strokeWidth="2">
                  <line x1="75" y1="200" x2="425" y2="200" />
                  <line x1="75" y1="290" x2="425" y2="290" />
                  <line x1="75" y1="380" x2="425" y2="380" />
                  <line x1="162" y1="115" x2="162" y2="465" />
                  <line x1="250" y1="115" x2="250" y2="465" />
                  <line x1="337" y1="115" x2="337" y2="465" />
                </g>
              )}

              {/* RENDER THE ACTUAL HIGH-QUALITY OFFICIAL 3D LOGO ICON IMAGE AS THE CORE CONTENT */}
              {/* Centered with beautiful proportions & premium shadow depth */}
              <g clipPath="url(#app-icon-clip)">
                <image
                  href={nexoraAppIcon}
                  x="80"
                  y="120"
                  width="340"
                  height="340"
                  className={`transition-all duration-500 ease-out ${
                    isAngry ? "brightness-[1.12] contrast-[1.15] saturate-125 hue-rotate-[348deg] scale-105" : "hover:scale-105"
                  }`}
                  style={{ transformOrigin: '250px 290px' }}
                />
              </g>

              {/* Gentle digital LED reactive face accents overlaying on top of Mascot vector */}
              <g pointerEvents="none" opacity={isAngry ? 0.95 : 0.75}>
                {!isAngry && !isSurprised ? (
                  <g className="animate-pulse">
                    <circle cx="210" cy="330" r="13" fill="#69C496" fillOpacity="0.65" />
                    <circle cx="290" cy="330" r="13" fill="#69C496" fillOpacity="0.65" />
                  </g>
                ) : null}
              </g>

              {/* Inner Gloss Overlay for genuine glassmorphic App Store sheen */}
              <rect 
                x="75" 
                y="115" 
                width="350" 
                height="350" 
                rx="80" 
                ry="80" 
                fill="url(#app-icon-gloss)" 
                pointerEvents="none"
              />

              {/* Dynamic Emoji State & Interaction Indicators in Corners */}
              <AnimatePresence mode="popLayout">
                {isAngry && (
                  <motion.g 
                    key="angry-indicators"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    {/* Bouncing Angry Vein Mark 💢 in top corners */}
                    <text x="95" y="165" fontSize="26" className="animate-bounce">💢</text>
                    <text x="355" y="165" fontSize="26" className="animate-bounce" style={{ animationDelay: '0.15s' }}>💢</text>
                    <text x="210" y="155" fontSize="18" className="animate-pulse">⚡</text>
                    <text x="270" y="155" fontSize="18" className="animate-pulse" style={{ animationDelay: '0.2s' }}>⚡</text>
                  </motion.g>
                )}
                {isSurprised && (
                  <motion.g 
                    key="surprised-indicators"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    {/* Exclamation marks popping out */}
                    <text x="110" y="170" fontSize="30" className="animate-pulse">❗</text>
                    <text x="360" y="170" fontSize="30" className="animate-pulse" style={{ animationDelay: '0.1s' }}>❗</text>
                  </motion.g>
                )}
                {mood === 'happy' && !isAngry && !isSurprised && (
                  <motion.g
                    key="happy-sparks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none"
                  >
                    {/* Golden Stars sparkling on top corner bevels */}
                    <text x="100" y="160" fontSize="18" className="animate-pulse">⭐</text>
                    <text x="375" y="160" fontSize="18" className="animate-ping" style={{ animationDelay: '0.5s' }}>⭐</text>
                  </motion.g>
                )}
              </AnimatePresence>
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
               <polygon points="90,120 45,10 0,120" fill="#7C3AED" stroke="#5B21B6" strokeWidth="4" />
               <path d="M 45,30 L 48,38 L 56,38 L 50,43 L 52,51 L 45,46 L 38,51 L 40,43 L 34,38 L 42,38 Z" fill="#FBBF24" />
               <path d="M 27,75 L 29,79 L 34,79 L 30,82 L 31,87 L 27,84 L 23,87 L 24,82 L 20,79 L 25,79 Z" fill="#FBBF24" />
               <path d="M 63,70 L 65,74 L 70,74 L 66,77 L 67,82 L 63,79 L 59,82 L 60,77 L 56,74 L 61,74 Z" fill="#FBBF24" />
               <ellipse cx="45" cy="115" rx="60" ry="10" fill="#6D28D9" stroke="#4C1D95" strokeWidth="3" />
            </g>
          )}
          {hat === 'artist' && (
            <g transform="translate(160, 75)">
               <ellipse cx="90" cy="30" rx="48" ry="16" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
               <ellipse cx="90" cy="22" rx="40" ry="12" fill="#EF4444" />
               <path d="M 90,14 L 90,2" stroke="#991B1B" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
          {hat === 'viking' && (
            <g transform="translate(160, 65)">
               <path d="M 40,40 Q 12,15 22,0 Q 28,15 45,30 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2.5" />
               <path d="M 140,40 Q 168,15 158,0 Q 152,15 135,30 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2.5" />
               <path d="M 40,55 A 50,50 0 0,1 140,55 Z" fill="#64748B" stroke="#475569" strokeWidth="4" />
               <rect x="85" y="5" width="10" height="50" fill="#475569" />
               <rect x="40" y="50" width="100" height="8" fill="#475569" rx="3" />
            </g>
          )}
          {hat === 'space' && (
            <g transform="translate(160, 105)">
               <circle cx="90" cy="110" r="105" fill="rgba(186, 230, 253, 0.15)" stroke="#0ea5e9" strokeWidth="3.5" strokeDasharray="4 4" />
               <line x1="90" y1="5" x2="90" y2="-18" stroke="#0ea5e9" strokeWidth="3.5" />
               <circle cx="90" cy="-20" r="6" fill="#f43f5e" />
            </g>
          )}
          {hat === 'ninja' && (
            <g transform="translate(160, 215)">
               <rect x="35" y="10" width="112" height="26" rx="5" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
               <path d="M 35,22 Q 15,10 10,24" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
               <path d="M 35,22 Q 13,32 12,38" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
               <ellipse cx="91" cy="23" rx="32" ry="5.5" fill="#f8fafc" />
            </g>
          )}
          {hat === 'detective' && (
            <g transform="translate(160, 75)">
               <path d="M 40,55 A 50,50 0 0,1 140,55 Z" fill="#854D0E" stroke="#713F12" strokeWidth="3" />
               <rect x="84" y="5" width="12" height="15" rx="3" fill="#A16207" />
               <circle cx="90" cy="3" r="3.5" fill="#713F12" />
               <path d="M 40,55 Q 5,55 35,45 Z" fill="#713F12" />
               <path d="M 140,55 Q 175,55 145,45 Z" fill="#713F12" />
            </g>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
});
