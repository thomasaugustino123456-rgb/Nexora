import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt effect (for desktop)
  useEffect(() => {
    if (performanceMode) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const dx = e.clientX - mascotCenterX;
      // Calculate normalized tilt angle [-12, 12] degrees
      const maxDistance = window.innerWidth / 2;
      const angle = Math.max(-12, Math.min(12, (dx / maxDistance) * 15));
      setTilt(angle);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [performanceMode]);

  const handleMascotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Play sweet meow or woof bark based on soundpack and mood
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

  // Self-contained style tag for custom responsive animation keyframes (zero CPU drain)
  const styles = useMemo(() => `
    @keyframes mascotFloat {
      0%, 100% { transform: translateY(-2px) rotate(-1deg); }
      50% { transform: translateY(4px) rotate(1deg); }
    }
    @keyframes mascotPulseGlow {
      0%, 100% { opacity: 0.25; filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.3)); }
      50% { opacity: 0.6; filter: drop-shadow(0 0 25px rgba(56, 189, 248, 0.7)); }
    }
    @keyframes riseSparkle {
      0% { transform: translateY(40px) scale(0.6) rotate(0deg); opacity: 0; }
      50% { opacity: 0.9; }
      100% { transform: translateY(-120px) scale(1.1) rotate(180deg); opacity: 0; }
    }
    @keyframes waveTranslation {
      0% { transform: translateX(0px); }
      100% { transform: translateX(-300px); }
    }
    @keyframes waveTranslationDouble {
      0% { transform: translateX(-150px); }
      100% { transform: translateX(150px); }
    }
    @keyframes riseBubble {
      0% { transform: translateY(50px) scale(0.7); opacity: 0; }
      20% { opacity: 0.8; }
      80% { opacity: 0.5; }
      100% { transform: translateY(-160px) scale(1.1); opacity: 0; }
    }
    .anim-mascot-idle {
      animation: mascotFloat 3.8s ease-in-out infinite;
      transform-origin: center bottom;
    }
    .anim-sparkle {
      animation: riseSparkle 4.2s ease-in-out infinite;
    }
    .anim-wave-1 {
      animation: waveTranslation 4.5s linear infinite;
    }
    .anim-wave-2 {
      animation: waveTranslationDouble 6.5s linear infinite;
    }
    .anim-bubble-bg {
      animation: riseBubble 4s ease-in-out infinite;
      transform-origin: center;
    }
  `, []);

  // Gradients and Colors for each Shop Theme Skin
  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'ice':
        return {
          gradId: 'mascot-grad-ice',
          stop0: '#E2F5FF',
          stop100: '#7DD3FC',
          glassGrad: 'glass-grad-ice',
          glassStop0: '#FFFFFF',
          glassStop100: '#BAE6FD',
          borderColor: '#38BDF8',
          shadowColor: 'rgba(125, 211, 252, 0.25)'
        };
      case 'fire':
      case 'boiling':
        return {
          gradId: 'mascot-grad-fire',
          stop0: '#FDBA74',
          stop100: '#EF4444',
          glassGrad: 'glass-grad-fire',
          glassStop0: '#FFF7ED',
          glassStop100: '#FECDD3',
          borderColor: '#F97316',
          shadowColor: 'rgba(239, 68, 68, 0.25)'
        };
      case 'cosmic':
      case 'voidwalker':
        return {
          gradId: 'mascot-grad-cosmic',
          stop0: '#C084FC',
          stop100: '#4C1D95',
          glassGrad: 'glass-grad-cosmic',
          glassStop0: '#FAF5FF',
          glassStop100: '#E9D5FF',
          borderColor: '#8B5CF6',
          shadowColor: 'rgba(139, 92, 246, 0.25)'
        };
      case 'neon':
        return {
          gradId: 'mascot-grad-neon',
          stop0: '#34D399',
          stop100: '#0891B2',
          glassGrad: 'glass-grad-neon',
          glassStop0: '#ECFDF5',
          glassStop100: '#CFFAFE',
          borderColor: '#10B981',
          shadowColor: 'rgba(16, 185, 129, 0.25)'
        };
      case 'emperor':
        return {
          gradId: 'mascot-grad-emperor',
          stop0: '#FCD34D',
          stop100: '#D97706',
          glassGrad: 'glass-grad-emperor',
          glassStop0: '#FFFBEB',
          glassStop100: '#FDE68A',
          borderColor: '#F59E0B',
          shadowColor: 'rgba(245, 158, 11, 0.25)'
        };
      case 'godmode':
        return {
          gradId: 'mascot-grad-godmode',
          stop0: '#F472B6',
          stop100: '#6D28D9',
          glassGrad: 'glass-grad-godmode',
          glassStop0: '#FDF2F8',
          glassStop100: '#F5D0FE',
          borderColor: '#EC4899',
          shadowColor: 'rgba(236, 72, 153, 0.25)'
        };
      case 'standard':
      default:
        return {
          gradId: 'mascot-grad-std',
          stop0: '#38BDF8',
          stop100: '#1E40AF',
          glassGrad: 'glass-grad-std',
          glassStop0: '#FFFFFF',
          glassStop100: '#B3E5FF',
          borderColor: '#38BDF8',
          shadowColor: 'rgba(56, 189, 248, 0.25)'
        };
    }
  }, [theme]);

  // Render sparkles, embers, or orbs based on current effect setting
  const renderEffectParticles = () => {
    if (performanceMode || effect === 'none') return null;

    const items = [...Array(4)];
    const color = effect === 'embers' ? '#F97316' : effect === 'orbs' ? '#38BDF8' : effect === 'gold_dust' ? '#FBBF24' : '#FBBF24';

    return (
      <g fill={color} opacity="0.8" style={{ pointerEvents: 'none' }}>
        {items.map((_, i) => {
          const delay = `${i * 1.0}s`;
          const duration = `${3.0 + i * 0.8}s`;
          const cx = 130 + i * 80;
          return effect === 'sparkles' || effect === 'gold_dust' ? (
            <polygon
              key={i}
              points={`${cx},180 ${cx + 4},186 ${cx + 10},180 ${cx + 4},174`}
              className="anim-sparkle"
              style={{ animationDelay: delay, animationDuration: duration }}
            />
          ) : (
            <circle
              key={i}
              cx={cx}
              cy="200"
              r={effect === 'embers' ? 5 : 8}
              className="anim-sparkle"
              style={{ animationDelay: delay, animationDuration: duration }}
            />
          );
        })}
      </g>
    );
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative select-none ${className || ''}`}
      onClick={handleMascotClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      whileTap={{ scale: 0.95 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
    >
      <style>{styles}</style>

      <svg 
        viewBox="0 0 500 650" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
        style={{
          filter: `drop-shadow(0 10px 20px ${themeConfig.shadowColor})`,
          overflow: 'visible'
        }}
      >
        <defs>
          <linearGradient id={themeConfig.gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeConfig.stop0} />
            <stop offset="100%" stopColor={themeConfig.stop100} />
          </linearGradient>

          <linearGradient id={themeConfig.glassGrad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={themeConfig.glassStop0} stopOpacity="0.85" />
            <stop offset="40%" stopColor={themeConfig.glassStop0} stopOpacity="0.2" />
            <stop offset="100%" stopColor={themeConfig.glassStop100} stopOpacity="0.5" />
          </linearGradient>

          {/* Mask matching the iconic Mascot Jar shape */}
          <clipPath id="mascot-body-mask">
            <ellipse cx="250" cy="350" rx="190" ry="160" />
            <path d="M 120,230 C 100,170 110,140 120,130 C 140,130 160,170 180,200 Z" />
            <path d="M 380,230 C 400,170 390,140 380,130 C 360,130 340,170 320,200 Z" />
          </clipPath>
        </defs>

        {/* Ambient Pool Shadow underneath */}
        <ellipse cx="250" cy="530" rx="135" ry="12" fill="#000" fillOpacity="0.08" />

        {/* Effect Neon Glow */}
        {effect === 'neon_glow' && (
          <ellipse 
            cx="250" 
            cy="350" 
            rx="205" 
            ry="175" 
            fill="none" 
            stroke="#22D3EE" 
            strokeWidth="8" 
            style={{ animation: 'mascotPulseGlow 3s ease-in-out infinite' }} 
          />
        )}

        {/* Mascot Body Group (Floating & Tiltable) */}
        <g className={performanceMode ? '' : 'anim-mascot-idle'} style={{ transformOrigin: '250px 480px' }}>
          
          {/* LIQUID SHAPE & JAR INTERIOR */}
          <g clipPath="url(#mascot-body-mask)">
            {/* Clear Liquid Inner Glow */}
            <rect x="0" y="0" width="500" height="650" fill="#F8FAFC" fillOpacity="0.3" />
            
            {/* Animated sloshing water waves */}
            <g transform="translate(0, 180)">
              {/* Secondary Background Waver (Adds parallax depth to active water) */}
              <g className="anim-wave-2" opacity="0.45">
                <path 
                  d="M -300,10 Q -225,-5 -150,10 T 0,10 T 150,10 T 300,10 T 450,10 T 600,10 T 750,10 T 900,10 L 900,600 L -300,600 Z" 
                  fill={`url(#${themeConfig.gradId})`} 
                />
              </g>

              {/* Main Foreground Waving Body */}
              <g className="anim-wave-1">
                <path 
                  d="M -300,20 Q -225,5 -150,20 T 0,20 T 150,20 T 300,20 T 450,20 T 600,20 T 750,20 T 900,20 L 900,600 L -300,600 Z" 
                  fill={`url(#${themeConfig.gradId})`} 
                />
              </g>
            </g>

            {/* Ears Fill */}
            <path d="M 120,230 C 100,170 110,140 120,130 C 140,130 160,170 180,200 Z" fill={`url(#${themeConfig.gradId})`} />
            <path d="M 380,230 C 400,170 390,140 380,130 C 360,130 340,170 320,200 Z" fill={`url(#${themeConfig.gradId})`} />

            {/* Seamless Water Bubble Emitters (gentle, matching theme) */}
            {!performanceMode && (
              <g fill="#FFFFFF" fillOpacity="0.6">
                <circle cx="160" cy="350" r="5" className="anim-bubble-bg" style={{ animationDelay: '0s', animationDuration: '4.5s' }} />
                <circle cx="210" cy="430" r="3.5" className="anim-bubble-bg" style={{ animationDelay: '1.2s', animationDuration: '3.8s' }} />
                <circle cx="340" cy="390" r="4.5" className="anim-bubble-bg" style={{ animationDelay: '0.6s', animationDuration: '4.2s' }} />
                <circle cx="280" cy="470" r="3" className="anim-bubble-bg" style={{ animationDelay: '2.1s', animationDuration: '3.5s' }} />
              </g>
            )}
          </g>

          {/* FACIAL FEATURES */}
          <g transform={`translate(${tilt * 1.5}, 0)`} style={{ transformOrigin: '250px 350px', transition: 'transform 0.15s ease-out' }}>
            {/* EYES */}
            {mood === 'happy' ? (
              <>
                {/* Happy arcs */}
                <path d="M 185 300 Q 210 280 235 300" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                <path d="M 265 300 Q 290 280 315 300" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
              </>
            ) : mood === 'angry' ? (
              <>
                {/* Slanted Angry Eyes */}
                <circle cx="210" cy="300" r="14" fill="#1E293B" />
                <circle cx="290" cy="300" r="14" fill="#1E293B" />
                {/* Pupils */}
                <circle cx="214" cy="296" r="5" fill="#fff" />
                <circle cx="294" cy="296" r="5" fill="#fff" />
                {/* Angry Brows */}
                <path d="M 175 270 L 230 290" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                <path d="M 325 270 L 270 290" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
              </>
            ) : mood === 'surprised' || mood === 'boiling' ? (
              <>
                {/* Shocked/Surprised Eyes */}
                <circle cx="210" cy="300" r="18" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
                <circle cx="290" cy="300" r="18" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
                <circle cx="210" cy="300" r="6" fill="#1E293B" />
                <circle cx="290" cy="300" r="6" fill="#1E293B" />
              </>
            ) : (
              <>
                {/* Standard / Neutral Cute Eyes */}
                <circle cx="210" cy="300" r="15" fill="#1E293B" />
                <circle cx="290" cy="300" r="15" fill="#1E293B" />
                {/* Big glossy reflection */}
                <circle cx="214" cy="294" r="6" fill="#FFFFFF" />
                <circle cx="294" cy="294" r="6" fill="#FFFFFF" />
                <circle cx="204" cy="305" r="2.5" fill="#FFFFFF" opacity="0.8" />
                <circle cx="284" cy="305" r="2.5" fill="#FFFFFF" opacity="0.8" />
              </>
            )}

            {/* Cheek blushing (Adds extreme cuteness) */}
            <ellipse cx="172" cy="325" rx="14" ry="7" fill="#F43F5E" fillOpacity="0.4" />
            <ellipse cx="328" cy="325" rx="14" ry="7" fill="#F43F5E" fillOpacity="0.4" />

            {/* MOUTH */}
            {mood === 'happy' ? (
              <path d="M 235 322 Q 250 342 265 322" fill="none" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
            ) : mood === 'angry' ? (
              <path d="M 235 330 Q 250 315 265 330" fill="none" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
            ) : mood === 'surprised' || mood === 'boiling' ? (
              <circle cx="250" cy="332" r="11" fill="#1E293B" />
            ) : (
              <path d="M 238 326 Q 250 332 262 326" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            )}
            
            {/* Signature Glowing "N" Logo on stomach */}
            <g transform="translate(236.5, 380) scale(0.6)" opacity="0.95">
              <path 
                d="M 0 0 L 10 0 L 30 40 L 30 0 L 45 0 L 45 60 L 30 60 L 10 20 L 10 60 L 0 60 Z" 
                fill="#FFFFFF" 
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.95))'
                }}
              />
            </g>
          </g>

          {/* GLASS SHELL OUTER CONTOUR */}
          <ellipse cx="250" cy="350" rx="190" ry="160" fill={`url(#${themeConfig.glassGrad})`} fillOpacity="0.15" stroke={themeConfig.borderColor} strokeWidth="5" />
          
          {/* Side Floating Hands / Handles */}
          <g stroke={themeConfig.borderColor} strokeWidth="5" fill={`url(#${themeConfig.glassGrad})`}>
            <ellipse cx="60" cy="330" rx="15" ry="30" transform="rotate(-15, 60, 330)" />
            <ellipse cx="440" cy="330" rx="15" ry="30" transform="rotate(15, 440, 330)" />
          </g>
          
          {/* Ear contours */}
          <path d="M 120,230 C 100,170 110,140 120,130 C 140,130 160,170 180,200" fill="none" stroke={themeConfig.borderColor} strokeWidth="5" strokeLinecap="round" />
          <path d="M 380,230 C 400,170 390,140 380,130 C 360,130 340,170 320,200" fill="none" stroke={themeConfig.borderColor} strokeWidth="5" strokeLinecap="round" />

          {/* Lid/Bottle Opening Neck */}
          <ellipse cx="250" cy="130" rx="32" ry="9" fill="rgba(255,255,255,0.2)" stroke={themeConfig.borderColor} strokeWidth="5" />
          <path d="M 218,130 L 218,155 Q 218,165 228,165 L 272,165 Q 282,165 282,155 L 282,130" fill="none" stroke={themeConfig.borderColor} strokeWidth="5" />

          {/* SPECULAR REFLECTIVE GLASS HIGHLIGHTS */}
          <path d="M 95,310 A 160,130 0 0,1 215,210 A 150,120 0 0,0 115,325 Z" fill="#FFFFFF" fillOpacity="0.7" />
          <path d="M 415,310 A 160,130 0 0,1 350,450" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" opacity="0.3" />

          {/* HATS & ACCESSORIES (Custom Overlays) */}
          {hat !== 'none' && (
            <g transform={`translate(${tilt * 1.8}, ${-Math.abs(tilt) * 0.1})`} style={{ transformOrigin: '250px 130px', transition: 'transform 0.1s ease-out' }}>
              {hat === 'cool' && (
                /* Cool Sunglasses, fits right over the eyes */
                <g transform="translate(0, 15)">
                  <path d="M 170,285 L 330,285 L 320,320 Q 295,325 275,310 L 265,285 L 235,285 L 225,310 Q 205,325 180,320 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
                  {/* Gloss lines on sunglasses */}
                  <path d="M 182,295 L 210,295" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
                  <path d="M 290,295 L 318,295" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
                </g>
              )}

              {hat === 'artist' && (
                /* Artist Red Beret on left ear */
                <g transform="translate(15, 0)">
                  <ellipse cx="140" cy="140" rx="42" ry="17" fill="#EF4444" transform="rotate(-15, 140, 140)" />
                  <path d="M 125,128 Q 135,108 137,118" fill="none" stroke="#EF4444" strokeWidth="4" />
                  <ellipse cx="132" cy="142" rx="16" ry="6" fill="#B91C1C" transform="rotate(-15, 140, 140)" />
                </g>
              )}

              {hat === 'viking' && (
                /* Viking Helmet with epic white horns */
                <g transform="translate(0, -10)">
                  <path d="M 185,150 Q 250,95 315,150 Z" fill="#94A3B8" stroke="#475569" strokeWidth="3.5" />
                  <rect x="180" y="145" width="140" height="12" rx="3.5" fill="#64748B" />
                  {/* Horn Left */}
                  <path d="M 190,146 Q 145,115 130,145 Q 155,145 180,147 Z" fill="#F8FAFC" stroke="#475569" strokeWidth="2.5" />
                  {/* Horn Right */}
                  <path d="M 310,146 Q 355,115 370,145 Q 345,145 320,147 Z" fill="#F8FAFC" stroke="#475569" strokeWidth="2.5" />
                </g>
              )}

              {hat === 'ninja' && (
                /* Stealthy Ninja face mask block */
                <g transform="translate(0, 10)">
                  <path d="M 148,270 Q 250,225 352,270 L 336,375 Q 250,440 164,375 Z" fill="#1E293B" opacity="0.95" />
                  <path d="M 182,280 L 318,280 L 308,318 L 192,318 Z" fill="#0F172A" />
                </g>
              )}

              {hat === 'detective' && (
                /* Sherlock Brown Hat */
                <g transform="translate(0, -15)">
                  <ellipse cx="250" cy="140" rx="72" ry="24" fill="#854D0E" />
                  <path d="M 185,140 Q 250,75 315,140 Z" fill="#854D0E" stroke="#451A03" strokeWidth="2.5" />
                  <path d="M 175,140 Q 250,160 325,140" stroke="#451A03" strokeWidth="5.5" fill="none" />
                </g>
              )}

              {hat === 'crown' && (
                /* Royal Golden Crown with rubies */
                <g transform="translate(0, -25)">
                  <path d="M 185,145 L 195,100 L 222,122 L 250,90 L 278,122 L 305,100 L 315,145 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
                  <circle cx="195" cy="100" r="5.5" fill="#EF4444" />
                  <circle cx="250" cy="90" r="5.5" fill="#3B82F6" />
                  <circle cx="305" cy="100" r="5.5" fill="#10B981" />
                  <rect x="180" y="140" width="140" height="11" rx="3.5" fill="#F59E0B" />
                </g>
              )}

              {hat === 'wizard' && (
                /* Wizard Pointy Hat with Stars */
                <g transform="translate(0, -28)">
                  <path d="M 165,145 L 250,30 L 335,145 Z" fill="#7C3AED" stroke="#5B21B6" strokeWidth="3" />
                  <ellipse cx="250" cy="145" rx="95" ry="14" fill="#5B21B6" />
                  <polygon points="245,75 250,85 255,75" fill="#FBBF24" />
                  <polygon points="220,105 225,110 230,105" fill="#FBBF24" />
                  <polygon points="275,100 280,105 285,100" fill="#FBBF24" />
                </g>
              )}

              {hat === 'space' && (
                /* Translucent Glass Bubble Space Helmet */
                <g>
                  <circle cx="250" cy="300" r="180" fill="none" stroke="#22D3EE" strokeWidth="4.5" strokeDasharray="18, 12" opacity="0.85" />
                  <circle cx="250" cy="300" r="188" fill="none" stroke="#0891B2" strokeWidth="2" opacity="0.4" />
                  <rect x="245" y="105" width="10" height="30" fill="#0891B2" />
                  <circle cx="250" cy="105" r="7" fill="#EF4444" />
                </g>
              )}
            </g>
          )}

          {/* Sparkle/Ember Effect render overlay */}
          {renderEffectParticles()}
        </g>
      </svg>
    </motion.div>
  );
});

Mascot.displayName = 'Mascot';
