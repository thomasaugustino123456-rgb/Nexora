import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useSound } from '../hooks/useSound';
import { MASCOT_IMAGE_SRC } from '../lib/mascot';


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

  // Render floating cute mascot image
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
      <img
        src={MASCOT_IMAGE_SRC}
        alt="Nexora Mascot"
        className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.35)]"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  );
});

Mascot.displayName = 'Mascot';
