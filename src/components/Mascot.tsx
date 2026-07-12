import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useSound } from '../hooks/useSound';


export type MascotMood = 'happy' | 'angry' | 'boiling' | 'neutral' | 'surprised';

export interface MascotProps {
  className?: string;
  mood?: MascotMood;
  hat?: string;
  theme?: string;
  effect?: string; // none, sparkles, embers, orbs, neon_glow, gold_dust
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
  effect = 'none',
  soundPack = 'cat', 
  onClick,
  onPointerMove,
  onPointerLeave,
  isSitting = false,
  performanceMode = false
}: MascotProps) => {
  const { play } = useSound();
  const [tilt, setTilt] = useState(0);
  const [clickTriggered, setClickTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt effect (for desktop)
  useEffect(() => {
    if (performanceMode) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const dx = e.clientX - mascotCenterX;
      // Calculate normalized tilt angle [-10, 10] degrees
      const maxDistance = window.innerWidth / 2;
      const angle = Math.max(-10, Math.min(10, (dx / maxDistance) * 12));
      setTilt(angle);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [performanceMode]);

  useEffect(() => {
    if (clickTriggered) {
      const timer = setTimeout(() => {
        setClickTriggered(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [clickTriggered]);

  const handleMascotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setClickTriggered(true);
    // Play meow or woof bark based on soundpack and mood
    try {
      if (soundPack === 'dog') {
        if (mood === 'angry') {
          play('dogAngry');
        } else if (mood === 'neutral') {
          play('dogHungry');
        } else {
          play('dogHappy');
        }
      } else {
        if (mood === 'neutral' || mood === 'angry') {
          play('catHungry');
        } else {
          play('catHappy');
        }
      }
    } catch (err) {
      console.warn("Sound play deferred:", err);
    }

    if (onClick) onClick(e);
  };

  // Generate a unique ID to prevent gradient collisions when multiple mascots are on screen
  const uid = React.useId().replace(/:/g, '');

  const getThemeColors = () => {
    switch (theme) {
      case 'gold':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#ffe885',
          bodyStop2: '#ffd700',
          bodyEnd: '#c59b00',
          armEnd: '#ffd700',
          stroke: '#8a6d00',
          halo1: '#ffd700',
          halo2: '#ffd700',
        };
      case 'cyberpunk':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#ff9cf4',
          bodyStop2: '#aa00ff',
          bodyEnd: '#4a0082',
          armEnd: '#aa00ff',
          stroke: '#5a008a',
          halo1: '#ff00ff',
          halo2: '#ff00ff',
        };
      case 'cosmic':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#d2b0ff',
          bodyStop2: '#673ab7',
          bodyEnd: '#311b92',
          armEnd: '#673ab7',
          stroke: '#1a0066',
          halo1: '#d2b0ff',
          halo2: '#d2b0ff',
        };
      case 'angry':
      case 'boiling':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#ffb0b0',
          bodyStop2: '#ff3b3b',
          bodyEnd: '#990000',
          armEnd: '#ff3b3b',
          stroke: '#660000',
          halo1: '#ffb0b0',
          halo2: '#ff3b3b',
        };
      default: // standard / blue
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#a3e3ff',
          bodyStop2: '#21a7f0',
          bodyEnd: '#0066cc',
          armEnd: '#21a7f0',
          stroke: '#0055b3',
          halo1: '#b8f1ff',
          halo2: '#b8f1ff',
        };
    }
  };

  const colors = getThemeColors();
  const activeMood = mood === 'angry' && theme === 'boiling' ? 'boiling' : mood;

  // Render floating cute mascot SVG
  return (
    <motion.div
      ref={containerRef}
      className={`relative select-none cursor-pointer flex items-center justify-center ${className || "w-32 h-32"}`}
      onClick={handleMascotClick}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        setTilt(0);
        if (onPointerLeave) onPointerLeave();
      }}
      animate={{
        y: performanceMode ? 0 : [0, -6, 0],
        rotate: tilt,
        scale: clickTriggered ? [1, 1.15, 0.9, 1.05, 1] : 1,
      }}
      transition={{
        y: {
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut"
        },
        rotate: {
          type: "spring",
          stiffness: 100,
          damping: 10
        },
        scale: {
          duration: 0.6,
          ease: "easeInOut"
        }
      }}
    >
      <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.35)]">
        <defs>
          <radialGradient id={`bodyGrad-${uid}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={colors.bodyStart}/>
            <stop offset="25%" stopColor={colors.bodyStop1}/>
            <stop offset="70%" stopColor={colors.bodyStop2}/>
            <stop offset="100%" stopColor={colors.bodyEnd}/>
          </radialGradient>
          <linearGradient id={`haloGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.halo1}/>
            <stop offset="50%" stopColor="#ffffff"/>
            <stop offset="100%" stopColor={colors.halo2}/>
          </linearGradient>
          <linearGradient id={`armGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9}/>
            <stop offset="100%" stopColor={colors.armEnd} stopOpacity={0.4}/>
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="200" cy="355" rx="120" ry="14" fill="#000000" opacity="0.15" />

        <g className="slime-mascot-core">
          {/* Halo */}
          <ellipse cx="200" cy="75" rx="95" ry="16" fill="none" stroke={`url(#haloGrad-${uid})`} strokeWidth={9} filter="drop-shadow(0 0 8px rgba(184,241,255,0.7))"/>

          {/* Cat-ears */}
          <path d="M125,120 Q105,75 140,88 Z" fill={`url(#bodyGrad-${uid})`} stroke={colors.stroke} strokeWidth={2}/>
          <path d="M275,120 Q295,75 260,88 Z" fill={`url(#bodyGrad-${uid})`} stroke={colors.stroke} strokeWidth={2}/>

          {/* Body */}
          <ellipse cx="200" cy="215" rx="160" ry="130" fill={`url(#bodyGrad-${uid})`}/>

          {/* Left Arm */}
          <ellipse cx="74" cy="225" rx="18" ry="24" fill={`url(#armGrad-${uid})`} transform="rotate(-15 74 225)"/>

          {/* Right Arm */}
          <ellipse cx="326" cy="225" rx="18" ry="24" fill={`url(#armGrad-${uid})`} transform="rotate(15 326 225)"/>

          {/* Dynamic Eyes based on mood */}
          {activeMood === 'happy' ? (
            <g stroke="#031b33" strokeWidth={7} strokeLinecap="round" fill="none">
              <path d="M125,185 Q145,165 165,185" />
              <path d="M235,185 Q255,165 275,185" />
            </g>
          ) : activeMood === 'angry' || activeMood === 'boiling' ? (
            <g>
              <circle cx="150" cy="180" r="14" fill="#031b33"/>
              <circle cx="145" cy="175" r="5" fill="#fff"/>
              <circle cx="250" cy="180" r="14" fill="#031b33"/>
              <circle cx="245" cy="175" r="5" fill="#fff"/>
              <path d="M130,158 L165,170" stroke="#031b33" strokeWidth="5.5" strokeLinecap="round"/>
              <path d="M270,158 L235,170" stroke="#031b33" strokeWidth="5.5" strokeLinecap="round"/>
            </g>
          ) : activeMood === 'surprised' ? (
            <g>
              <ellipse cx="150" cy="180" rx="12" ry="17" fill="#031b33"/>
              <circle cx="147" cy="175" r="4" fill="#fff"/>
              <ellipse cx="250" cy="180" rx="12" ry="17" fill="#031b33"/>
              <circle cx="247" cy="175" r="4" fill="#fff"/>
            </g>
          ) : (
            /* neutral */
            <g>
              <circle cx="150" cy="180" r="14" fill="#031b33"/>
              <circle cx="145" cy="175" r="5" fill="#fff"/>
              <circle cx="153" cy="183" r="2.5" fill="#fff"/>
              <circle cx="250" cy="180" r="14" fill="#031b33"/>
              <circle cx="245" cy="175" r="5" fill="#fff"/>
              <circle cx="253" cy="183" r="2.5" fill="#fff"/>
            </g>
          )}

          {/* Dynamic Mouth based on mood */}
          {activeMood === 'happy' ? (
            <g>
              <path d="M182,196 Q200,202 218,196 Q200,236 182,196 Z" fill="#b3243d" stroke="#031b33" strokeWidth={4.5} strokeLinejoin="round"/>
              <path d="M186,208 Q200,204 214,208 Q200,232 186,208 Z" fill="#ff6b8b"/>
            </g>
          ) : activeMood === 'angry' || activeMood === 'boiling' ? (
            <path d="M188,206 Q200,196 212,206" fill="none" stroke="#031b33" strokeWidth={4} strokeLinecap="round"/>
          ) : activeMood === 'surprised' ? (
            <circle cx="200" cy="205" r="9" fill="#031b33"/>
          ) : (
            /* neutral */
            <path d="M188,198 Q200,208 212,198" fill="none" stroke="#031b33" strokeWidth={4} strokeLinecap="round"/>
          )}

          {/* Central "N" insignia */}
          <text x="200" y="278" fontFamily="system-ui, sans-serif" fontWeight={900} fontSize={64} fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 2px 10px rgba(255,255,255,0.6))">N</text>

          {/* Hats Overlay */}
          {hat && hat !== 'none' && (
            <g>
              {hat === 'crown' && (
                <g transform="translate(0, 15)">
                  <path d="M160,95 L170,65 L185,80 L200,55 L215,80 L230,65 L240,95 Z" fill="#ffd700" stroke="#b8860b" strokeWidth="2.5" strokeLinejoin="round" />
                  <circle cx="170" cy="62" r="3.5" fill="#ff0000" />
                  <circle cx="200" cy="52" r="3.5" fill="#0000ff" />
                  <circle cx="230" cy="62" r="3.5" fill="#ff0000" />
                </g>
              )}
              {hat === 'wizard' && (
                <g transform="translate(0, 15)">
                  <path d="M140,95 L200,30 L260,95 Z" fill="#4a148c" stroke="#1a0033" strokeWidth="2.5" />
                  <path d="M130,95 L270,95 L270,102 L130,102 Z" fill="#ffd700" />
                  <polygon points="195,65 200,55 205,65 195,65" fill="#ffd700" />
                  <polygon points="185,80 190,72 195,80 185,80" fill="#ffd700" />
                </g>
              )}
              {hat === 'party' && (
                <g transform="translate(0, 15)">
                  <path d="M150,95 L200,40 L250,95 Z" fill="#ff4081" stroke="#c2185b" strokeWidth="2.5" />
                  <path d="M175,67 L225,67 L200,40 Z" fill="#00e676" />
                  <circle cx="200" cy="35" r="7" fill="#ffeb3b" />
                </g>
              )}
              {hat === 'detective' && (
                <g transform="translate(0, 15)">
                  <ellipse cx="200" cy="95" rx="55" ry="15" fill="#795548" stroke="#3e2723" strokeWidth="2.5" />
                  <path d="M155,95 C155,65 245,65 245,95 Z" fill="#795548" stroke="#3e2723" strokeWidth="2.5" />
                  <rect x="154" y="87" width="92" height="8" fill="#3e2723" />
                </g>
              )}
              {hat === 'ninja' && (
                <g transform="translate(0, 30)">
                  <rect x="135" y="125" width="130" height="14" rx="3" fill="#212121" />
                  <rect x="180" y="127" width="40" height="10" rx="1" fill="#e0e0e0" />
                  <circle cx="200" cy="132" r="2" fill="#212121" />
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
    </motion.div>
  );
});

Mascot.displayName = 'Mascot';
