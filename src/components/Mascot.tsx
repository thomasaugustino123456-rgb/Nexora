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
  const [isBlinking, setIsBlinking] = useState(false);
  const [tilt, setTilt] = useState(0); // Target physics/hover tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const lastStateUpdateRef = useRef(0);
  const { play } = useSound();
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(true);

  // Intersection Observer to stop animations when off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Natural Blinking loops
  useEffect(() => {
    if (!isVisible || performanceMode) return;
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.25) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, [isVisible, performanceMode]);

  // Handle cursor/mouse tracking for interactive physics tilt
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !isVisible) return;
    const now = Date.now();
    if (now - lastStateUpdateRef.current < 25) return; // limit to ~40fps tracking
    lastStateUpdateRef.current = now;

    const rect = containerRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width - 0.5; // range [-0.5, 0.5]
    setTilt(ratio * 16); // tilt by up to 8 degrees left/right
  };

  const handleMascotClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setClickCount(prev => {
      const newCount = prev + 1;
      const isDog = soundPack === 'dog';
      // Play high-quality sound responses
      if (newCount <= 5) play(isDog ? 'dogHappy' : 'catHappy');
      else if (newCount <= 12) play(isDog ? 'dogHungry' : 'catHungry');
      return newCount;
    });

    // Bouncy squish micro-animation
    controls.start({
      scaleY: [1, 0.78, 1.14, 0.95, 1],
      scaleX: [1, 1.22, 0.88, 1.05, 1],
      y: [0, 6, -18, 2, 0],
      rotate: [0, -3, 3, -1, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    });
    
    if (onClick) onClick(e);
  }, [soundPack, play, controls, onClick]);

  const actualMood = useMemo(() => (clickCount >= 9 && clickCount <= 12) ? 'angry' : mood, [clickCount, mood]);
  const isAngry = actualMood === 'angry' || actualMood === 'boiling';
  const isNeutral = actualMood === 'neutral';
  const isSurprised = actualMood === 'surprised';

  const getThemeColors = () => {
    switch (theme) {
      case 'neural_bio':
        return {
          aura: "rgba(16, 185, 129, 0.22)",
          stroke: "#10b981",
          strokeLighter: "#34d399",
          liquidTop: "#A7F3D0",
          liquidBottom: "#047857",
          glassTint: "#E6FBF2",
          emptyTint: "rgba(16, 185, 129, 0.08)"
        };
      case 'obsidian':
        return {
          aura: "rgba(99, 102, 241, 0.2)",
          stroke: "#6366f1",
          strokeLighter: "#818cf8",
          liquidTop: "#818CF8",
          liquidBottom: "#4338CA",
          glassTint: "#ECEEFE",
          emptyTint: "rgba(99, 102, 241, 0.06)"
        };
      case 'sunset':
        return {
          aura: "rgba(249, 115, 22, 0.22)",
          stroke: "#F97316",
          strokeLighter: "#FDBA74",
          liquidTop: "#FDBA74",
          liquidBottom: "#C2410C",
          glassTint: "#FFF5EC",
          emptyTint: "rgba(249, 115, 22, 0.06)"
        };
      case 'oceanic_midnight':
        return {
          aura: "rgba(34, 211, 238, 0.24)",
          stroke: "#22D3EE",
          strokeLighter: "#67e8f9",
          liquidTop: "#67E8F9",
          liquidBottom: "#0E7490",
          glassTint: "#ECFEFF",
          emptyTint: "rgba(34, 211, 238, 0.08)"
        };
      default: // standard sky-blue
        return {
          aura: "rgba(56, 189, 248, 0.18)",
          stroke: "#38BDF8",
          strokeLighter: "#7dd3fc",
          liquidTop: "#7DD3FC",
          liquidBottom: "#0284C7",
          glassTint: "#E0F2FE",
          emptyTint: "rgba(56, 189, 248, 0.06)"
        };
    }
  };

  const colors = getThemeColors();

  return (
    <motion.div 
      ref={containerRef}
      className={`mascot-bottle-container cursor-pointer select-none relative group ${className || ''}`}
      onClick={handleMascotClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt(0)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      animate={controls}
      style={{ 
        perspective: 1000,
        aspectRatio: '1/1.2',
        willChange: 'transform'
      }}
    >
      <style>{`
        @keyframes waveTranslation {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-300px); }
        }
        @keyframes waveTranslationDouble {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(150px); }
        }
        @keyframes floatIdle {
          0%, 100% { transform: translateY(-3px) rotate(-1.5deg); }
          50% { transform: translateY(4px) rotate(1.5deg); }
        }
        @keyframes riseBubble {
          0% { transform: translateY(50px) scale(0.65); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-160px) scale(1.1); opacity: 0; }
        }
        .anim-wave-1 {
          animation: waveTranslation 4.5s linear infinite;
        }
        .anim-wave-2 {
          animation: waveTranslationDouble 6.5s linear infinite;
        }
        .anim-mascot-float {
          animation: floatIdle 3.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .anim-bubble-bg {
          animation: riseBubble 4s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <svg 
        viewBox="0 0 500 600" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        <defs>
          {/* Transparent Glass reflections gradient */}
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
            <stop offset="35%" stopColor="#E2F5FF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#B3E5FF" stopOpacity="0.48" />
          </linearGradient>

          {/* Seamless Water liquid gradient */}
          <linearGradient id="water-grad-mascot" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.liquidTop} />
            <stop offset="100%" stopColor={colors.liquidBottom} />
          </linearGradient>

          {/* Mask matching the iconic Mascot Jar Shell Shape (Ears + Rounded Body) */}
          <clipPath id="mascot-shell-mask">
            <ellipse cx="250" cy="330" rx="190" ry="160" />
            <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" />
            <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" />
          </clipPath>
        </defs>

        {/* Ambient background glow aura */}
        <ellipse 
          cx="250" cy="330" rx="200" ry="200" 
          fill={colors.aura} 
          className="transition-all duration-300"
        />

        {/* Soft interactive floor shadow */}
        <ellipse 
          cx="250" cy="515" rx="130" ry="11" 
          fill="#000" 
          opacity="0.3"
        />

        {/* Floating body group with reactive tilt */}
        <motion.g 
          animate={isSitting ? { y: 20, scaleY: 0.88 } : { y: 0, scaleY: 1 }}
          className={performanceMode ? "" : "anim-mascot-float"}
        >
          {/* Rotational pivot group */}
          <g transform={`rotate(${tilt}, 250, 330)`} className="transition-transform duration-200">
            
            {/* BACK GLASS PARTS */}
            <g id="aquarium-shell-back" stroke={colors.strokeLighter} strokeWidth="1" fill="none" opacity="0.35">
              <ellipse cx="250" cy="130" rx="30" ry="8" strokeWidth="2" />
              <path d="M 220 160 L 220 140 A 10 10 0 0 1 230 130 L 270 130 A 10 10 0 0 1 280 140 L 280 160" strokeWidth="3" />
            </g>

            {/* WATER AND INNER LIQUID LAYER */}
            <g clipPath="url(#mascot-shell-mask)">
              {/* Back empty glass tint */}
              <rect x="0" y="0" width="500" height="600" fill="#F0F9FF" fillOpacity="0.4" />
              <ellipse cx="250" cy="330" rx="175" ry="145" fill={colors.glassTint} fillOpacity="0.25" />

              {/* Physical Animated Liquid (Steady high standard 70% level) */}
              <g transform="translate(0, 235)">
                {performanceMode ? (
                  /* Static high-performance solid liquid rect representation */
                  <rect x="-50" y="20" width="600" height="600" fill="url(#water-grad-mascot)" />
                ) : (
                  <>
                    {/* Parallax background wave */}
                    <g className="anim-wave-2" opacity="0.45">
                      <path 
                        d="M -300,10 Q -225,-5 -150,10 T 0,10 T 150,10 T 300,10 T 450,10 T 600,10 T 750,10 T 900,10 L 900,600 L -300,600 Z" 
                        fill={colors.liquidTop} 
                      />
                    </g>

                    {/* Foreground wave */}
                    <g className="anim-wave-1">
                      <path 
                        d="M -300,20 Q -225,5 -150,20 T 0,20 T 150,20 T 300,20 T 450,20 T 600,20 T 750,20 T 900,20 L 900,600 L -300,600 Z" 
                        fill="url(#water-grad-mascot)" 
                      />
                    </g>

                    {/* Bubbles float loop */}
                    {isVisible && (
                      <g fill="#FFFFFF" fillOpacity="0.5">
                        <circle cx="160" cy="120" r="4.5" className="anim-bubble-bg" style={{ animationDelay: '0s', animationDuration: '4.2s' }} />
                        <circle cx="210" cy="190" r="3" className="anim-bubble-bg" style={{ animationDelay: '1.5s', animationDuration: '3.6s' }} />
                        <circle cx="330" cy="140" r="4" className="anim-bubble-bg" style={{ animationDelay: '0.8s', animationDuration: '4.0s' }} />
                        <circle cx="280" cy="220" r="2.5" className="anim-bubble-bg" style={{ animationDelay: '2.5s', animationDuration: '3.2s' }} />
                      </g>
                    )}
                  </>
                )}
              </g>
            </g>

            {/* CUTEST VECTOR FACIAL FEATURES */}
            <g transform="translate(0, -10)">
              {/* EYES */}
              {isBlinking ? (
                // Closed/Blinking Eyes
                <g stroke="#001845" strokeWidth="5.5" strokeLinecap="round" fill="none">
                  <path d="M 195 290 Q 210 275 225 290" />
                  <path d="M 275 290 Q 290 275 305 290" />
                </g>
              ) : (
                // Open Eyes
                <g>
                  {/* Left Eye */}
                  {actualMood === 'angry' ? (
                    <path d="M 195 282 L 225 295 L 225 302 L 195 289 Z" fill="#001845" />
                  ) : (
                    <g>
                      <circle cx="210" cy="290" r="14.5" fill="#001845" />
                      <circle cx="213.5" cy="285.5" r="5.5" fill="#ffffff" />
                    </g>
                  )}

                  {/* Right Eye */}
                  {actualMood === 'angry' ? (
                    <path d="M 305 282 L 275 295 L 275 302 L 305 289 Z" fill="#001845" />
                  ) : (
                    <g>
                      <circle cx="290" cy="290" r="14.5" fill="#001845" />
                      <circle cx="293.5" cy="285.5" r="5.5" fill="#ffffff" />
                    </g>
                  )}
                </g>
              )}

              {/* Glowing interactive blush */}
              <ellipse cx="178" cy="312" rx="14" ry="7.5" fill="#FF4D6D" fillOpacity="0.25" />
              <ellipse cx="322" cy="312" rx="14" ry="7.5" fill="#FF4D6D" fillOpacity="0.25" />

              {/* Responsive Mouth */}
              {isNeutral ? (
                <line x1="235" y1="312" x2="265" y2="312" stroke="#001845" strokeWidth="4.5" strokeLinecap="round" />
              ) : isSurprised ? (
                <circle cx="250" cy="315" r="10" fill="none" stroke="#001845" strokeWidth="4" />
              ) : isAngry ? (
                <path d="M 233 318 Q 250 300 267 318" fill="none" stroke="#001845" strokeWidth="4" strokeLinecap="round" />
              ) : (
                // Happy smile with mini tongue
                <g>
                  <path d="M 233 308 Q 250 328 267 308" fill="none" stroke="#001845" strokeWidth="4.5" strokeLinecap="round" />
                </g>
              )}
            </g>

            {/* CONTAINER GLASS SHELL & OUTLINES */}
            {/* Neck Rim Open */}
            <ellipse cx="250" cy="130" rx="30" ry="8" fill="rgba(255,255,255,0.25)" stroke={colors.stroke} strokeWidth="4" />
            <path d="M 220 130 L 220 160 A 10 10 0 0 0 230 170 L 270 170 A 10 10 0 0 0 280 160 L 280 130" fill="none" stroke={colors.stroke} strokeWidth="4" />

            {/* Outer Bottle Outline with glass shine */}
            <g stroke={colors.stroke} strokeWidth="4" fill="url(#glass-grad)" fillOpacity="0.2">
              <ellipse cx="250" cy="330" rx="190" ry="160" />
              <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" strokeLinejoin="round" />
              <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" strokeLinejoin="round" />
            </g>

            {/* Side handle loops */}
            <g stroke={colors.stroke} strokeWidth="4" fill="url(#glass-grad)">
              <ellipse cx="60" cy="310" rx="15" ry="30" transform="rotate(-15, 60, 310)" />
              <ellipse cx="440" cy="310" rx="15" ry="30" transform="rotate(15, 440, 310)" />
            </g>

            {/* Specular premium glass gloss lines */}
            <path d="M 92,290 A 160,130 0 0,1 210,195 A 150,120 0 0,0 112,305 Z" fill="#FFFFFF" fillOpacity="0.75" />
            <path d="M 425,300 A 170,140 0 0,1 350,460" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" opacity="0.32" />
            <path d="M 150,470 A 170,140 0 0,0 350,470" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" opacity="0.4" />

            <path d="M 120,135 C 120,135 138,143 148,162" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" opacity="0.65" />
            <path d="M 380,135 C 380,135 362,143 352,162" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" opacity="0.65" />

            {/* Star lights sparkles */}
            {!performanceMode && (
              <g fill="#FFFFFF" opacity="0.8">
                <polygon points="100,105 104,108 108,105 104,102" className="animate-pulse" style={{ animationDuration: '2.5s' }} />
                <polygon points="405,125 408,128 411,125 408,122" className="animate-pulse" style={{ animationDuration: '3.5s' }} />
                <polygon points="85,380 91,385 97,380 91,375" fill={colors.stroke} className="animate-pulse" style={{ animationDuration: '2.8s' }} />
                <polygon points="415,395 420,399 425,395 420,391" fill={colors.stroke} className="animate-pulse" style={{ animationDuration: '3.1s' }} />
              </g>
            )}

            {/* STACKED ACCESSORY HATS */}
            {hat !== 'none' && (
              <g id="mascot-active-accessory" transform="translate(0, 15)">
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

          </g>
        </motion.g>
      </svg>
    </motion.div>
  );
});

Mascot.displayName = 'Mascot';
