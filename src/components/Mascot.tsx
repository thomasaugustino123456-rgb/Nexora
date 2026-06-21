import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useSound } from '../hooks/useSound';

export type MascotMood = 'happy' | 'angry' | 'boiling' | 'neutral' | 'surprised';

interface MascotProps {
  className?: string;
  mood?: MascotMood;
  hat?: string;
  theme?: string;
  soundPack?: 'cat' | 'dog';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();
  const controls = useAnimation();
  const [tilt, setTilt] = useState(0);

  // Desktop Hover Tilt Interaction
  useEffect(() => {
    if (performanceMode) return;
    let active = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!active) return;
      const ratio = (e.clientX / window.innerWidth) - 0.5;
      setTilt(ratio * 15); // Tilt by [-7.5, 7.5] degrees
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      active = false;
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [performanceMode]);

  const handleMascotClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setClickCount(prev => {
      const newCount = prev + 1;
      const isDog = soundPack === 'dog';
      // Loop the sound states so clicks indefinitely play sound
      const currentCount = newCount > 12 ? 1 : newCount;
      if (currentCount <= 5) play(isDog ? 'dogHappy' : 'catHappy');
      else if (currentCount <= 12) play(isDog ? 'dogHungry' : 'catHungry');
      return currentCount;
    });

    controls.start({
      y: [0, 12, -80, -90, -80, -12, 6, -2, 0],
      scaleY: [1, 0.72, 1.35, 1.38, 1.35, 0.82, 1.1, 0.96, 1],
      scaleX: [1, 1.28, 0.72, 0.7, 0.72, 1.18, 0.9, 1.04, 1],
      rotate: [0, -6, 6, 8, 6, -3, 2, -1, 0],
      transition: {
        duration: 0.85,
        times: [0, 0.12, 0.35, 0.45, 0.55, 0.7, 0.82, 0.92, 1],
        ease: "easeInOut"
      }
    });
    
    if (onClick) onClick(e);
  }, [soundPack, play, controls, onClick]);

  const renderFace = () => {
    switch (mood) {
      case 'angry':
        return (
          <g transform="translate(0, 5)">
            {/* Angry Eyebrows */}
            <path d="M 175,268 L 215,285" stroke="#001845" strokeWidth="6" strokeLinecap="round" />
            <path d="M 325,268 L 285,285" stroke="#001845" strokeWidth="6" strokeLinecap="round" />
            {/* Narrow Angry Eyes */}
            <circle cx="210" cy="298" r="13" fill="#001845" />
            <circle cx="290" cy="298" r="13" fill="#001845" />
            <circle cx="212" cy="294" r="5" fill="#fff" />
            <circle cx="288" cy="294" r="5" fill="#fff" />
            {/* Angry Cheeks Blush */}
            <ellipse cx="178" cy="318" rx="14" ry="7" fill="#FF4D6D" fillOpacity="0.4" />
            <ellipse cx="322" cy="318" rx="14" ry="7" fill="#FF4D6D" fillOpacity="0.4" />
            {/* Grumpy Mouth */}
            <path d="M 235,330 Q 250,314 265,330" fill="none" stroke="#001845" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        );
      case 'surprised':
        return (
          <g transform="translate(0, 5)">
            {/* Surprised arched eyebrows */}
            <path d="M 180,265 Q 195,250 210,265" fill="none" stroke="#001845" strokeWidth="4" strokeLinecap="round" />
            <path d="M 290,265 Q 305,250 320,265" fill="none" stroke="#001845" strokeWidth="4" strokeLinecap="round" />
            {/* Wide Open Eyes */}
            <circle cx="210" cy="290" r="16" fill="#001845" />
            <circle cx="290" cy="290" r="16" fill="#001845" />
            <circle cx="208" cy="286" r="6" fill="#fff" />
            <circle cx="288" cy="286" r="6" fill="#fff" />
            {/* Surprised Open Mouth */}
            <circle cx="250" cy="330" r="11" fill="none" stroke="#001845" strokeWidth="4.5" />
          </g>
        );
      case 'boiling':
        return (
          <g transform="translate(0, 5)">
            {/* Extreme Angry / Boiling eyes */}
            <path d="M 170,265 L 215,285" stroke="#991B1B" strokeWidth="7" strokeLinecap="round" />
            <path d="M 330,265 L 285,285" stroke="#991B1B" strokeWidth="7" strokeLinecap="round" />
            <circle cx="210" cy="295" r="14" fill="#991B1B" />
            <circle cx="290" cy="295" r="14" fill="#991B1B" />
            <circle cx="213" cy="290" r="5" fill="#fff" />
            <circle cx="287" cy="290" r="5" fill="#fff" />
            {/* Heavy Red Blush */}
            <ellipse cx="178" cy="318" rx="16" ry="10" fill="#EF4444" fillOpacity="0.6" />
            <ellipse cx="322" cy="318" rx="16" ry="10" fill="#EF4444" fillOpacity="0.6" />
            {/* Squiggly frustrated mouth */}
            <path d="M 233,328 Q 241,336 250,326 T 267,330" fill="none" stroke="#991B1B" strokeWidth="5" strokeLinecap="round" />
          </g>
        );
      case 'neutral':
        return (
          <g transform="translate(0, 5)">
            {/* High-quality neutral relaxed sleeping line eyes */}
            <path d="M 195,290 L 225,290" stroke="#001845" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M 275,290 L 305,290" stroke="#001845" strokeWidth="6.5" strokeLinecap="round" />
            {/* Simple calm tiny smile line */}
            <path d="M 238,322 Q 250,326 262,322" fill="none" stroke="#001845" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        );
      case 'happy':
      default:
        return (
          <g transform="translate(0, -5)">
            {/* Classic Sparkling Happy Eyes */}
            <circle cx="210" cy="290" r="15" fill="#001845" />
            <circle cx="290" cy="290" r="15" fill="#001845" />
            {/* Sparkling Pupil Highlights */}
            <circle cx="213" cy="285" r="5.5" fill="#fff" />
            <circle cx="293" cy="285" r="5.5" fill="#fff" />
            <circle cx="205" cy="295" r="2.5" fill="#fff" />
            <circle cx="285" cy="295" r="2.5" fill="#fff" />
            {/* Cheek blush */}
            <ellipse cx="178" cy="312" rx="14" ry="7" fill="#FF4D6D" fillOpacity="0.25" />
            <ellipse cx="322" cy="312" rx="14" ry="7" fill="#FF4D6D" fillOpacity="0.25" />
            {/* Cute Smiling Mouth */}
            <path 
              d="M 233 308 Q 250 328 267 308" 
              fill="none" stroke="#001845" strokeWidth="5" strokeLinecap="round"
            />
          </g>
        );
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      className={`mascot-bottle-container select-none relative flex items-center justify-center ${className || ''}`}
      onClick={handleMascotClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      animate={controls}
      style={{ 
        aspectRatio: '1/1',
        willChange: 'transform'
      }}
    >
      <style>{`
        @keyframes waveFloatMascot {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-300px); }
        }
        @keyframes waveFloatMascotDouble {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(150px); }
        }
        @keyframes floatIdleMain {
          0%, 100% { transform: translateY(-7px) rotate(-1deg); }
          50% { transform: translateY(7px) rotate(1deg); }
        }
        @keyframes bubbleRiseMascot {
          0% { transform: translateY(60px) scale(0.7); opacity: 0; }
          20% { opacity: 0.8; }
          85% { opacity: 0.4; }
          100% { transform: translateY(-150px) scale(1.1); opacity: 0; }
        }
        .anim-wave-mascot-1 {
          animation: waveFloatMascot 5s linear infinite;
        }
        .anim-wave-mascot-2 {
          animation: waveFloatMascotDouble 7s linear infinite;
        }
        .anim-mascot-float-main {
          animation: floatIdleMain 3s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .anim-bubble-mascot {
          animation: bubbleRiseMascot 4.5s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      {/* Fully Animated Vector SVG Glass Beaker Bottle Mascot Shell */}
      <div className="relative w-full h-full p-1 anim-mascot-float-main">
        <svg viewBox="0 40 500 495" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_15px_35px_rgba(59,130,246,0.3)]">
          <defs>
            <linearGradient id="glass-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#E2F5FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#B3E5FF" stopOpacity="0.4" />
            </linearGradient>

            {/* Electric Blue Water Gradients for interactive bottle inner */}
            <linearGradient id="water-grad-main-blue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={mood === 'angry' || mood === 'boiling' ? "#FF5A5A" : "#38BDF8"} />
              <stop offset="60%" stopColor={mood === 'angry' || mood === 'boiling' ? "#DC2626" : "#0EA5E9"} stopOpacity="0.95" />
              <stop offset="100%" stopColor={mood === 'angry' || mood === 'boiling' ? "#991B1B" : "#1E40AF"} stopOpacity="0.99" />
            </linearGradient>

            <clipPath id="mascot-shell-mask-main">
              <ellipse cx="250" cy="330" rx="190" ry="160" />
              <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" />
              <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" />
            </clipPath>
          </defs>

          {/* Ambient Platform Shadow */}
          <ellipse cx="250" cy="515" rx="130" ry="12" fill="#0284C7" fillOpacity="0.08" />

          {/* BACKGROUND LIQUID INTERACTION */}
          <g clipPath="url(#mascot-shell-mask-main)">
            <motion.g 
              animate={{ y: mood === 'boiling' ? 140 : 220 }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
              <motion.g
                animate={{ rotate: tilt }}
                style={{ transformOrigin: `250px 0px` }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
              >
                {/* Sloshing Wave Parallax Background */}
                <g className="anim-wave-mascot-2" opacity="0.3">
                  <path 
                    d="M -300,10 Q -225,-5 -150,10 T 0,10 T 150,10 T 300,10 T 450,10 T 600,10 T 750,10 T 900,10 L 900,600 L -300,600 Z" 
                    fill={mood === 'angry' || mood === 'boiling' ? "#FF7F7F" : "#7DD3FC"} 
                  />
                </g>

                {/* Main Foreground Liquid Wave Body */}
                <g className="anim-wave-mascot-1">
                  <path 
                    d="M -300,20 Q -225,5 -150,20 T 0,20 T 150,20 T 300,20 T 450,20 T 600,20 T 750,20 T 900,20 L 900,600 L -300,600 Z" 
                    fill="url(#water-grad-main-blue)" 
                  />
                </g>

                {/* Active bubbling/fizzing steam bubbles */}
                <g fill="#FFFFFF" fillOpacity="0.6">
                  <circle cx="150" cy="220" r="4" className="anim-bubble-mascot" style={{ animationDelay: '0s', animationDuration: '4.2s' }} />
                  <circle cx="220" cy="270" r="3" className="anim-bubble-mascot" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
                  <circle cx="330" cy="230" r="4.5" className="anim-bubble-mascot" style={{ animationDelay: '0.5s', animationDuration: '4s' }} />
                  <circle cx="270" cy="310" r="3.5" className="anim-bubble-mascot" style={{ animationDelay: '2s', animationDuration: '3s' }} />
                </g>
              </motion.g>
            </motion.g>
          </g>

          {/* FACIAL EXPRESSIONS GROUP */}
          <g transform={`translate(${tilt * 0.25}, -5)`}>
            {renderFace()}
          </g>

          {/* GLASS BEAKER OUTLINES */}
          {/* Beaker Lip Opening */}
          <ellipse cx="250" cy="130" rx="30" ry="8" fill="rgba(255,255,255,0.25)" stroke="#38BDF8" strokeWidth="4" />
          <path d="M 220 130 L 220 160 A 10 10 0 0 0 230 170 L 270 170 A 10 10 0 0 0 280 160 L 280 130" fill="none" stroke="#38BDF8" strokeWidth="4" />

          {/* Beaker Side Handles */}
          <g stroke="#38BDF8" strokeWidth="4" fill="url(#glass-grad-main)" fillOpacity="0.2">
            <ellipse cx="60" cy="310" rx="15" ry="30" transform="rotate(-15, 60, 310)" />
            <ellipse cx="440" cy="310" rx="15" ry="30" transform="rotate(15, 440, 310)" />
          </g>

          {/* Main Beaker Outlines with Shiny Highlights Overlay */}
          <g stroke="#38BDF8" strokeWidth="4.5" fill="url(#glass-grad-main)" fillOpacity="0.2">
            <ellipse cx="250" cy="330" rx="190" ry="160" />
            <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" strokeLinejoin="round" />
            <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" strokeLinejoin="round" />
          </g>

          {/* Glass Gloss Refraction Lines */}
          <path d="M 92,290 A 160,130 0 0,1 210,195 A 150,120 0 0,0 112,305 Z" fill="#FFFFFF" fillOpacity="0.75" />
          <path d="M 425,300 A 170,140 0 0,1 350,460" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" opacity="0.35" />
          <path d="M 150,470 A 170,140 0 0,0 350,470" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.4" />

          {/* Cute Ears Reflections */}
          <path d="M 120,135 C 120,135 138,143 148,162" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
          <path d="M 380,135 C 380,135 362,143 352,162" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.6" />

          {/* Sparkly Star Emitters */}
          <g fill="#FFFFFF">
            <polygon points="100,105 104,108 108,105 104,102" className="animate-pulse" style={{ animationDuration: '2.5s' }} />
            <polygon points="405,125 408,128 411,125 408,122" className="animate-pulse" style={{ animationDuration: '3.5s' }} />
            <polygon points="85,380 91,385 97,380 91,375" fill="#38BDF8" className="animate-pulse" style={{ animationDuration: '2.8s' }} />
            <polygon points="415,395 420,399 425,395 420,391" fill="#38BDF8" className="animate-pulse" style={{ animationDuration: '3.1s' }} />
          </g>

          {/* ACCESSORY MATTING (Hats rendered precisely over the SVG crown area) */}
          {hat !== 'none' && (
            <g id="mascot-active-accessory" transform="translate(0, 32)">
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
            </g>
          )}
        </svg>
      </div>
    </motion.div>
  );
});

Mascot.displayName = 'Mascot';
