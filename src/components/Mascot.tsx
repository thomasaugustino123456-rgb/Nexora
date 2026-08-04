import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useSound } from '../hooks/useSound';


import { MascotMood } from '../types';
export type { MascotMood };

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
      case 'fire-slim':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#fde047',
          bodyStop2: '#ff5500',
          bodyEnd: '#dc2626',
          armEnd: '#ff5500',
          stroke: '#991b1b',
          halo1: '#fef08a',
          halo2: '#ff8c00',
        };
      case 'water-slim':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#a5f3fc',
          bodyStop2: '#06b6d4',
          bodyEnd: '#0e7490',
          armEnd: '#06b6d4',
          stroke: '#164e63',
          halo1: '#e0f2fe',
          halo2: '#0284c7',
        };
      case 'shield-slim':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#c7d2fe',
          bodyStop2: '#4338ca',
          bodyEnd: '#1e1b4b',
          armEnd: '#4338ca',
          stroke: '#312e81',
          halo1: '#e0e7ff',
          halo2: '#6366f1',
        };
      case 'lightning-slim':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#fef08a',
          bodyStop2: '#eab308',
          bodyEnd: '#a16207',
          armEnd: '#eab308',
          stroke: '#713f12',
          halo1: '#fef9c3',
          halo2: '#00e5ff',
        };
      case 'earth-slim':
        return {
          bodyStart: '#ffffff',
          bodyStop1: '#bbf7d0',
          bodyStop2: '#22c55e',
          bodyEnd: '#15803d',
          armEnd: '#22c55e',
          stroke: '#14532d',
          halo1: '#dcfce7',
          halo2: '#16a34a',
        };
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
              {(hat === 'crown' || hat === 'skin-crown') && (
                <g transform="translate(47, -108) scale(1.02)">
                  <defs>
                    <linearGradient id="mascotGoldGradCrown" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fff176"/>
                      <stop offset="30%" stopColor="#ffd54f"/>
                      <stop offset="70%" stopColor="#ffb300"/>
                      <stop offset="100%" stopColor="#f57f17"/>
                    </linearGradient>
                    <linearGradient id="mascotDarkGoldGradCrown" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffca28"/>
                      <stop offset="100%" stopColor="#ff8f00"/>
                    </linearGradient>
                    <linearGradient id="mascotVelvetGradCrown" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#c62828"/>
                      <stop offset="50%" stopColor="#8e0000"/>
                      <stop offset="100%" stopColor="#5c0000"/>
                    </linearGradient>
                    <radialGradient id="mascotRubyGradCrown" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ff8a80"/>
                      <stop offset="40%" stopColor="#ff1744"/>
                      <stop offset="100%" stopColor="#b71c1c"/>
                    </radialGradient>
                    <radialGradient id="mascotSapphireGradCrown" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#80d8ff"/>
                      <stop offset="40%" stopColor="#00b0ff"/>
                      <stop offset="100%" stopColor="#01579b"/>
                    </radialGradient>
                    <radialGradient id="mascotEmeraldGradCrown" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#b9f6ca"/>
                      <stop offset="40%" stopColor="#00e676"/>
                      <stop offset="100%" stopColor="#1b5e20"/>
                    </radialGradient>
                  </defs>

                  {/* Back Inner Velvet Cushion */}
                  <path d="M 50 200 C 50 70, 250 70, 250 200 Z" fill="url(#mascotVelvetGradCrown)"/>
                  <path d="M 150 90 Q 150 150 150 200" stroke="#7f0000" strokeWidth="4" fill="none"/>
                  <path d="M 100 110 Q 120 160 130 200" stroke="#7f0000" strokeWidth="3" fill="none"/>
                  <path d="M 200 110 Q 180 160 170 200" stroke="#7f0000" strokeWidth="3" fill="none"/>

                  {/* Main Gold Crown Structure */}
                  <ellipse cx="150" cy="195" rx="100" ry="25" fill="url(#mascotDarkGoldGradCrown)"/>
                  <path d="M 50 200 L 30 110 L 95 155 L 150 50 L 205 155 L 270 110 L 250 200 Z" fill="url(#mascotGoldGradCrown)" stroke="#c56000" strokeWidth="2" strokeLinejoin="round"/>
                  
                  {/* 3D Gold Extrusions */}
                  <path d="M 50 200 L 30 110 L 40 115 L 60 200 Z" fill="url(#mascotDarkGoldGradCrown)"/>
                  <path d="M 150 50 L 158 60 L 110 165 L 95 155 Z" fill="url(#mascotDarkGoldGradCrown)"/>
                  <path d="M 270 110 L 250 200 L 240 200 L 260 115 Z" fill="url(#mascotDarkGoldGradCrown)"/>

                  {/* Thick Gold Base Rim */}
                  <path d="M 40 230 Q 150 270 260 230 L 250 195 Q 150 225 50 195 Z" fill="url(#mascotGoldGradCrown)" stroke="#c56000" strokeWidth="2"/>
                  <path d="M 45 220 Q 150 255 255 220" fill="none" stroke="#ffe082" strokeWidth="3"/>

                  {/* Gemstones */}
                  <g>
                    <ellipse cx="150" cy="215" rx="15" ry="20" fill="url(#mascotRubyGradCrown)" stroke="#ffecb3" strokeWidth="2"/>
                    <path d="M 145 205 Q 155 200 155 210" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                  <circle cx="95" cy="208" r="12" fill="url(#mascotSapphireGradCrown)" stroke="#ffecb3" strokeWidth="2"/>
                  <path d="M 90 202 Q 100 200 100 205" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="205" cy="208" r="12" fill="url(#mascotEmeraldGradCrown)" stroke="#ffecb3" strokeWidth="2"/>
                  <path d="M 200 202 Q 210 200 210 205" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>

                  {/* Peak Diamonds */}
                  <path d="M 150 35 L 165 50 L 150 65 L 135 50 Z" fill="url(#mascotRubyGradCrown)" stroke="#ffecb3" strokeWidth="2"/>
                  <circle cx="30" cy="110" r="10" fill="url(#mascotSapphireGradCrown)" stroke="#ffecb3" strokeWidth="1.5"/>
                  <circle cx="270" cy="110" r="10" fill="url(#mascotEmeraldGradCrown)" stroke="#ffecb3" strokeWidth="1.5"/>

                  {/* Tiny Gold Beads along the base */}
                  <circle cx="65" cy="200" r="3" fill="#ffffff"/>
                  <circle cx="125" cy="213" r="3" fill="#ffffff"/>
                  <circle cx="175" cy="213" r="3" fill="#ffffff"/>
                  <circle cx="235" cy="200" r="3" fill="#ffffff"/>
                </g>
              )}
              {(hat === 'wizard' || hat === 'skin-wizard') && (
                <g transform="translate(45, -135) scale(1.03)">
                  <defs>
                    <linearGradient id="mascotVelvetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4a148c"/>
                      <stop offset="50%" stopColor="#1a237e"/>
                      <stop offset="100%" stopColor="#0d1137"/>
                    </linearGradient>
                    <linearGradient id="mascotGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fff9c4"/>
                      <stop offset="50%" stopColor="#fbc02d"/>
                      <stop offset="100%" stopColor="#f57f17"/>
                    </linearGradient>
                    <filter id="mascotMagicGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <g>
                    <path d="M 40 220 Q 150 250 260 220 C 290 200 10 200 40 220 Z" fill="url(#mascotVelvetGrad)" stroke="#000000" strokeWidth="1.5"/>
                    <path d="M 40 220 Q 150 250 260 220 Q 150 240 40 220" fill="none" stroke="url(#mascotGoldGrad)" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M 70 208 L 100 80 Q 150 20 200 80 Q 220 150 160 200 Q 150 208 70 208 Z" fill="url(#mascotVelvetGrad)" stroke="#000000" strokeWidth="1.5"/>
                    <path d="M 120 70 L 123 76 L 129 76 L 125 80 L 126 86 L 120 83 L 114 86 L 115 80 L 111 76 L 117 76 Z" fill="url(#mascotGoldGrad)"/>
                    <path d="M 180 110 L 182 113 L 186 113 L 183 115 L 184 119 L 180 117 L 176 119 L 177 115 L 174 113 L 178 113 Z" fill="url(#mascotGoldGrad)"/>
                    <path d="M 160 150 L 163 156 L 169 156 L 165 160 L 166 166 L 160 163 L 154 166 L 155 160 L 151 156 L 157 156 Z" fill="url(#mascotGoldGrad)"/>
                    <path d="M 145 95 A 15 15 0 1 1 145 125 A 20 20 0 0 0 145 95 Z" fill="url(#mascotGoldGrad)"/>
                    <path d="M 75 208 L 82 180 Q 150 190 208 178 L 222 201 L 160 200 Q 150 208 75 208 Z" fill="#283593" stroke="#000000" strokeWidth="1"/>
                    <rect x="135" y="180" width="30" height="25" rx="3" fill="url(#mascotGoldGrad)" stroke="#3e2723" strokeWidth="1.5"/>
                    <circle cx="150" cy="192.5" r="7" fill="#00e5ff" filter="url(#mascotMagicGlow)"/>
                  </g>
                </g>
              )}
              {hat === 'party' && (
                <g transform="translate(0, 15)">
                  <path d="M150,95 L200,40 L250,95 Z" fill="#ff4081" stroke="#c2185b" strokeWidth="2.5" />
                  <path d="M175,67 L225,67 L200,40 Z" fill="#00e676" />
                  <circle cx="200" cy="35" r="7" fill="#ffeb3b" />
                </g>
              )}
              {(hat === 'detective' || hat === 'skin-detective') && (
                <g id="mascot-detective-wearable">
                  <defs>
                    <linearGradient id="mascotHatGradDet" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#9c6d42"/>
                      <stop offset="50%" stopColor="#7a522e"/>
                      <stop offset="100%" stopColor="#54371d"/>
                    </linearGradient>
                    <linearGradient id="mascotCoatGradDet" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d4c394"/>
                      <stop offset="50%" stopColor="#e3d4aa"/>
                      <stop offset="100%" stopColor="#bfae80"/>
                    </linearGradient>
                    <linearGradient id="mascotCoatShadowGradDet" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a39265"/>
                      <stop offset="100%" stopColor="#7a6b43"/>
                    </linearGradient>
                    <linearGradient id="mascotGlassGradDet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)"/>
                      <stop offset="40%" stopColor="rgba(186, 230, 253, 0.45)"/>
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)"/>
                    </linearGradient>
                    <linearGradient id="mascotMetalRimDet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f3f4f6"/>
                      <stop offset="50%" stopColor="#d1d5db"/>
                      <stop offset="100%" stopColor="#6b7280"/>
                    </linearGradient>
                    <filter id="mascotClothingShadowDet" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.35"/>
                    </filter>
                  </defs>

                  {/* A. DETECTIVE TRENCH COAT (Body Clothe - Covers Mascot Body, leaves mouth & hands visible) */}
                  <g filter="url(#mascotClothingShadowDet)">
                    {/* Coat Body Base */}
                    <path d="M 50 220 C 50 195, 350 195, 350 220 C 365 310, 330 345, 200 348 C 70 345, 35 310, 50 220 Z" fill="url(#mascotCoatGradDet)"/>

                    {/* Shoulder Capelet / Epaulets (Classic Sherlock style) */}
                    <path d="M 45 220 C 110 195, 290 195, 355 220 C 330 250, 270 255, 200 258 C 130 255, 70 250, 45 220 Z" fill="url(#mascotCoatShadowGradDet)"/>

                    {/* Coat Open V-Neck Collar (Exposes mouth & center nicely) */}
                    <path d="M 140 205 L 200 240 L 260 205 L 235 200 L 200 220 L 165 200 Z" fill="#4a3728"/>

                    {/* Coat Lapels */}
                    <path d="M 125 200 L 175 255 L 200 240 L 160 195 Z" fill="url(#mascotCoatGradDet)" stroke="#8c7a52" strokeWidth="1.5"/>
                    <path d="M 275 200 L 225 255 L 200 240 L 240 195 Z" fill="url(#mascotCoatGradDet)" stroke="#8c7a52" strokeWidth="1.5"/>

                    {/* Double Breasted Buttons */}
                    <circle cx="170" cy="275" r="5" fill="#3e2723"/>
                    <circle cx="230" cy="275" r="5" fill="#3e2723"/>
                    <circle cx="170" cy="305" r="5" fill="#3e2723"/>
                    <circle cx="230" cy="305" r="5" fill="#3e2723"/>

                    {/* Trench Coat Belt & Brass Buckle */}
                    <rect x="75" y="290" width="250" height="18" rx="4" fill="#6d5438"/>
                    <rect x="182" y="286" width="36" height="26" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/>
                    <rect x="190" y="291" width="20" height="16" rx="2" fill="#4a3728"/>

                    {/* Sleeve Cuffs for Mascot Hands */}
                    <rect x="58" y="215" width="28" height="16" rx="5" fill="#7a6b43" transform="rotate(-15 72 223)"/>
                    <rect x="314" y="215" width="28" height="16" rx="5" fill="#7a6b43" transform="rotate(15 328 223)"/>
                  </g>

                  {/* B. DETECTIVE DEERSTALKER HAT (Covers Mascot Ears) */}
                  <g filter="url(#mascotClothingShadowDet)">
                    {/* Ear Flaps covering cat ears at (125,120) and (275,120) */}
                    <path d="M 85 110 C 80 145, 120 160, 145 135 Z" fill="#6d4c33" stroke="#3e2723" strokeWidth="2"/>
                    <path d="M 315 110 C 320 145, 280 160, 255 135 Z" fill="#6d4c33" stroke="#3e2723" strokeWidth="2"/>

                    {/* Main Crown of Deerstalker Hat */}
                    <path d="M 100 135 C 100 60, 150 45, 200 45 C 250 45, 300 60, 300 135 Z" fill="url(#mascotHatGradDet)"/>

                    {/* Hat Plaid / Panel Seam Lines */}
                    <path d="M 200 45 C 200 90, 200 120, 200 135" stroke="#3e2723" strokeWidth="2" strokeDasharray="4 2"/>
                    <path d="M 150 55 C 160 90, 170 115, 175 135" stroke="#3e2723" strokeWidth="1.5"/>
                    <path d="M 250 55 C 240 90, 230 115, 225 135" stroke="#3e2723" strokeWidth="1.5"/>

                    {/* Front Curved Brim shading forehead */}
                    <path d="M 85 130 C 130 155, 270 155, 315 130 C 325 142, 280 162, 200 162 C 120 162, 75 142, 85 130 Z" fill="#54371d"/>

                    {/* Back Curved Brim */}
                    <path d="M 100 125 C 70 120, 75 140, 95 135 Z" fill="#3e2723"/>
                    <path d="M 300 125 C 330 120, 325 140, 305 135 Z" fill="#3e2723"/>

                    {/* Dark Leather Hat Band & Buckle */}
                    <path d="M 100 135 C 140 145, 260 145, 300 135 L 300 125 C 260 135, 140 135, 100 125 Z" fill="#1f1a17"/>
                    <rect x="188" y="126" width="24" height="14" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5"/>

                    {/* Top Knot / Tie */}
                    <ellipse cx="200" cy="45" rx="10" ry="6" fill="#3e2723"/>
                  </g>

                  {/* C. HAND LENS / MAGNIFYING GLASS (Held near Mascot's Right Hand) */}
                  <g filter="url(#mascotClothingShadowDet)">
                    {/* Wooden Handle extending to right hand at (326, 225) */}
                    <rect x="270" y="200" width="16" height="55" rx="8" fill="#4a2c11" stroke="#261405" strokeWidth="2" transform="rotate(-40 278 227)"/>
                    
                    {/* Metallic Rim */}
                    <circle cx="235" cy="175" r="34" fill="none" stroke="url(#mascotMetalRimDet)" strokeWidth="7"/>

                    {/* Crystalline Glass Lens */}
                    <circle cx="235" cy="175" r="30" fill="url(#mascotGlassGradDet)"/>

                    {/* Glossy Lens Reflection */}
                    <path d="M 215 155 Q 235 145 255 160" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none"/>
                    <path d="M 210 165 Q 220 155 230 162" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" fill="none"/>
                  </g>
                </g>
              )}
              {(hat === 'ninja' || hat === 'skin-ninja') && (
                <g id="mascot-ninja-wearable">
                  <defs>
                    <linearGradient id="mascotNinjaFabricGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2a2d32"/>
                      <stop offset="50%" stopColor="#1a1c1e"/>
                      <stop offset="100%" stopColor="#0f1012"/>
                    </linearGradient>
                    <linearGradient id="mascotNinjaMetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#e5e7eb"/>
                      <stop offset="50%" stopColor="#9ca3af"/>
                      <stop offset="100%" stopColor="#4b5563"/>
                    </linearGradient>
                    <linearGradient id="mascotNinjaSashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#dc2626"/>
                      <stop offset="50%" stopColor="#ef4444"/>
                      <stop offset="100%" stopColor="#991b1b"/>
                    </linearGradient>
                    <filter id="mascotNinjaShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.5"/>
                    </filter>
                  </defs>

                  {/* A. NINJA BODY SUIT / GI (Down Clothes - Covers Mascot Body completely) */}
                  <g filter="url(#mascotNinjaShadow)">
                    {/* Shinobi Tunic Body Base */}
                    <path d="M 45 220 C 45 190, 355 190, 355 220 C 370 310, 335 348, 200 350 C 65 348, 30 310, 45 220 Z" fill="url(#mascotNinjaFabricGrad)"/>

                    {/* Crossed Gi Lapels (V-Neck Ninja Uniform) */}
                    <path d="M 120 220 L 200 280 L 280 220 L 255 210 L 200 250 L 145 210 Z" fill="#111315" stroke="#374151" strokeWidth="2"/>

                    {/* Shoulder Armor Pads / Pauldrons */}
                    <path d="M 45 210 C 70 195, 120 205, 125 230 C 95 240, 55 235, 45 210 Z" fill="#1f2328" stroke="#374151" strokeWidth="1.5"/>
                    <path d="M 355 210 C 330 195, 280 205, 275 230 C 305 240, 345 235, 355 210 Z" fill="#1f2328" stroke="#374151" strokeWidth="1.5"/>

                    {/* Red Obi Waist Sash & Belt */}
                    <rect x="70" y="280" width="260" height="22" rx="4" fill="url(#mascotNinjaSashGrad)"/>
                    <path d="M 230 295 Q 240 335 250 350 Q 230 335 220 295 Z" fill="url(#mascotNinjaSashGrad)"/>
                    <path d="M 245 295 Q 260 330 275 342 Q 255 330 240 295 Z" fill="#991b1b"/>

                    {/* Tucked Silver Shuriken on Sash */}
                    <g transform="translate(140, 291) scale(0.85)">
                      <path d="M 12 0 L 15 8 L 24 12 L 15 16 L 12 24 L 9 16 L 0 12 L 9 8 Z" fill="url(#mascotNinjaMetalGrad)"/>
                      <circle cx="12" cy="12" r="3" fill="#111827"/>
                    </g>

                    {/* Ninja Forearm Gauntlets & Arm Wraps */}
                    <rect x="52" y="215" width="30" height="18" rx="6" fill="#111315" stroke="#4b5563" strokeWidth="1.5" transform="rotate(-15 67 224)"/>
                    <rect x="318" y="215" width="30" height="18" rx="6" fill="#111315" stroke="#4b5563" strokeWidth="1.5" transform="rotate(15 333 224)"/>
                  </g>

                  {/* B. NINJA HOOD / COWL TOP (Covers Mascot Ears) */}
                  <g filter="url(#mascotNinjaShadow)">
                    {/* Waving Ribbon Tails on the Back Right */}
                    <g>
                      <path d="M 300 120 Q 360 100 375 145 Q 335 130 300 130 Z" fill="url(#mascotNinjaFabricGrad)"/>
                      <path d="M 300 125 Q 365 140 350 185 Q 330 155 300 135 Z" fill="#1c1e22"/>
                    </g>

                    {/* Main Top Hood Cowl (Covers Ears at 125,120 and 275,120 completely!) */}
                    <path d="M 75 125 C 75 55, 130 40, 200 40 C 270 40, 325 55, 325 125 C 325 155, 275 160, 200 160 C 125 160, 75 155, 75 125 Z" fill="url(#mascotNinjaFabricGrad)"/>

                    {/* Silver Metal Forehead Protector Plate */}
                    <rect x="120" y="98" width="160" height="32" rx="6" fill="url(#mascotNinjaMetalGrad)" stroke="#1f2937" strokeWidth="2.5"/>
                    <circle cx="132" cy="114" r="3" fill="#1f2937"/>
                    <circle cx="268" cy="114" r="3" fill="#1f2937"/>

                    {/* Engraved Shinobi Symbol on Forehead Plate */}
                    <path d="M 200 104 L 204 111 L 211 114 L 204 117 L 200 124 L 196 117 L 189 114 L 196 111 Z" fill="#1f2937"/>

                    {/* Lower Forehead Cowl Fold */}
                    <path d="M 80 145 Q 200 158 320 145 L 320 158 Q 200 170 80 158 Z" fill="#111315"/>
                  </g>

                  {/* C. NINJA LOWER MASK (Covers Mouth Completely - Only Eyes visible in slot) */}
                  <g filter="url(#mascotNinjaShadow)">
                    {/* Lower Face Mask starting at y=188 (covers mouth at y=196..208) */}
                    <path d="M 70 190 C 110 182, 290 182, 330 190 C 345 235, 290 250, 200 252 C 110 250, 55 235, 70 190 Z" fill="url(#mascotNinjaFabricGrad)"/>

                    {/* Fabric Folds across mask */}
                    <path d="M 90 205 Q 200 222 310 205" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
                    <path d="M 110 222 Q 200 236 290 222" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>

                    {/* Side Mask Ties / Knots */}
                    <circle cx="325" cy="195" r="8" fill="#111315"/>
                    <circle cx="75" cy="195" r="8" fill="#111315"/>
                  </g>
                </g>
              )}
              {(hat === 'cool' || hat === 'skin-cool') && (
                <g transform="translate(40, 95) scale(0.8)">
                  <defs>
                    <linearGradient id="mascotLensGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF007F"/>
                      <stop offset="50%" stopColor="#9D00FF"/>
                      <stop offset="100%" stopColor="#00E5FF"/>
                    </linearGradient>
                    <linearGradient id="mascotFrameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2a2a2a"/>
                      <stop offset="100%" stopColor="#0a0a0a"/>
                    </linearGradient>
                    <clipPath id="mascotLensClip">
                      <path d="M50,55 C65,40 145,40 160,55 L152,125 C135,150 75,150 58,125 Z" />
                      <path d="M240,55 C255,40 335,40 350,55 L342,125 C325,150 265,150 248,125 Z" />
                    </clipPath>
                  </defs>
                  <g stroke="#000" strokeWidth="2">
                    <path d="M40,45 L10,25 C5,20 5,15 15,20 L46,50 Z" fill="#111" />
                    <path d="M360,45 L390,25 C395,20 395,15 385,20 L354,50 Z" fill="#111" />
                    <path d="M40,45 C60,25 150,25 170,45 L164,130 C140,165 65,165 46,130 Z" fill="url(#mascotFrameGradient)" />
                    <path d="M230,45 C250,25 340,25 360,45 L354,130 C330,165 255,165 236,130 Z" fill="url(#mascotFrameGradient)" />
                    <path d="M 165,55 Q 200,40 235,55 L 235,70 Q 200,60 165,70 Z" fill="url(#mascotFrameGradient)" />
                  </g>
                  <g>
                    <path d="M50,55 C65,40 145,40 160,55 L152,125 C135,150 75,150 58,125 Z" fill="url(#mascotLensGradient)" />
                    <path d="M240,55 C255,40 335,40 350,55 L342,125 C325,150 265,150 248,125 Z" fill="url(#mascotLensGradient)" />
                  </g>
                  <g clipPath="url(#mascotLensClip)">
                    <g className="animate-pulse">
                      <rect x="-50" y="-50" width="60" height="300" fill="rgba(255, 255, 255, 0.35)" transform="skewX(-35)" />
                      <rect x="25" y="-50" width="15" height="300" fill="rgba(255, 255, 255, 0.2)" transform="skewX(-35)" />
                    </g>
                  </g>
                  <path d="M50,38 C60,32 70,30 80,30" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M350,38 C340,32 330,30 320,30" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
                </g>
              )}
              {(hat === 'artist' || hat === 'skin-artist') && (
                <g transform="translate(0, 10)">
                  <path d="M130,95 Q200,45 260,90 Q200,85 130,95 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                  <circle cx="200" cy="52" r="4" fill="#991b1b" />
                </g>
              )}
              {(hat === 'viking' || hat === 'skin-viking') && (
                <g transform="translate(32, -90) scale(1.12)">
                  <defs>
                    <linearGradient id="mascotVikingIron" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#b0bec5"/>
                      <stop offset="50%" stopColor="#78909c"/>
                      <stop offset="100%" stopColor="#455a64"/>
                    </linearGradient>
                    <linearGradient id="mascotVikingSilver" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#eceff1"/>
                      <stop offset="100%" stopColor="#90a4ae"/>
                    </linearGradient>
                    <linearGradient id="mascotVikingHorn" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d7ccc8"/>
                      <stop offset="30%" stopColor="#efebe9"/>
                      <stop offset="100%" stopColor="#ffffff"/>
                    </linearGradient>
                    <filter id="mascotVikingHornShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <g filter="url(#mascotVikingHornShadow)">
                    <path d="M 85,150 Q 5,140 15,30 Q 55,70 85,110 Z" fill="url(#mascotVikingHorn)" stroke="#5d4037" strokeWidth="2"/>
                    <ellipse cx="80" cy="130" rx="12" ry="24" fill="url(#mascotVikingSilver)" stroke="#37474f" strokeWidth="2" transform="rotate(-15 80 130)"/>
                  </g>
                  <g filter="url(#mascotVikingHornShadow)">
                    <path d="M 215,150 Q 295,140 285,30 Q 245,70 215,110 Z" fill="url(#mascotVikingHorn)" stroke="#5d4037" strokeWidth="2"/>
                    <ellipse cx="220" cy="130" rx="12" ry="24" fill="url(#mascotVikingSilver)" stroke="#37474f" strokeWidth="2" transform="rotate(15 220 130)"/>
                  </g>
                  <path d="M 70,165 A 80,80 0 0,1 230,165 Z" fill="url(#mascotVikingIron)" stroke="#263238" strokeWidth="3"/>
                  <path d="M 140,165 L 145,86 L 155,86 L 160,165 Z" fill="url(#mascotVikingSilver)" stroke="#263238" strokeWidth="2"/>
                  <path d="M 145,86 L 150,60 L 155,86 Z" fill="url(#mascotVikingSilver)" stroke="#263238" strokeWidth="2"/>
                  <rect x="60" y="165" width="180" height="20" rx="6" fill="url(#mascotVikingSilver)" stroke="#263238" strokeWidth="3"/>
                  <circle cx="75" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
                  <circle cx="105" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
                  <circle cx="135" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
                  <circle cx="165" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
                  <circle cx="195" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
                  <circle cx="225" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
                </g>
              )}
              {(hat === 'space' || hat === 'skin-space') && (
                <g transform="translate(0, 10)">
                  <circle cx="200" cy="180" r="115" fill="none" stroke="#22d3ee" strokeWidth="6" opacity="0.8" filter="drop-shadow(0 0 10px rgba(34,211,238,0.6))" />
                  <ellipse cx="200" cy="170" rx="90" ry="60" fill="#0284c7" opacity="0.35" />
                  <path d="M130,140 Q200,120 270,140 Q240,180 130,140 Z" fill="#ffffff" opacity="0.2" />
                </g>
              )}
              {(hat === 'emperor' || hat === 'skin-emperor') && (
                <g transform="translate(0, 10)">
                  <path d="M150,95 L165,50 L185,75 L200,40 L215,75 L235,50 L250,95 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
                  <circle cx="165" cy="48" r="4" fill="#ef4444" />
                  <circle cx="200" cy="38" r="5" fill="#3b82f6" />
                  <circle cx="235" cy="48" r="4" fill="#ef4444" />
                  <ellipse cx="200" cy="215" rx="168" ry="138" fill="none" stroke="#fbbf24" strokeWidth="4" strokeDasharray="8,6" opacity="0.7" />
                </g>
              )}
              {(hat === 'voidwalker' || hat === 'skin-voidwalker') && (
                <g transform="translate(0, 10)">
                  <path d="M135,115 C135,50 265,50 265,115 C265,130 135,130 135,115 Z" fill="#0f172a" stroke="#a855f7" strokeWidth="3" />
                  <ellipse cx="200" cy="115" rx="55" ry="12" fill="#3b0764" />
                  <circle cx="175" cy="115" r="5" fill="#c084fc" filter="drop-shadow(0 0 6px #c084fc)" />
                  <circle cx="225" cy="115" r="5" fill="#c084fc" filter="drop-shadow(0 0 6px #c084fc)" />
                </g>
              )}
              {(hat === 'godmode' || hat === 'skin-godmode') && (
                <g transform="translate(0, 5)">
                  <path d="M70,120 L70,220 M55,120 L55,150 Q70,165 85,150 L85,120" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <polygon points="70,105 63,120 77,120" fill="#f59e0b" />
                  <polygon points="55,110 50,122 60,122" fill="#f59e0b" />
                  <polygon points="85,110 80,122 90,122" fill="#f59e0b" />
                  <ellipse cx="200" cy="215" rx="175" ry="50" fill="none" stroke="#6366f1" strokeWidth="3" transform="rotate(-15 200 215)" opacity="0.8" />
                </g>
              )}
              {(hat === 'apex' || hat === 'pro-apex' || hat === 'skin-pro-apex' || hat === 'pro-skin-apex') && (
                <g transform="translate(0, 15)">
                  <rect x="120" y="160" width="160" height="30" rx="8" fill="#0284c7" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="3" filter="drop-shadow(0 0 12px #38bdf8)" />
                  <line x1="130" y1="175" x2="270" y2="175" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="4,4" />
                  <text x="200" y="181" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#38bdf8" textAnchor="middle">QUANTUM HUD v2.0</text>
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
