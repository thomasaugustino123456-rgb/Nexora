import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MascotId, MASCOTS_DATA, getMascotDialogue } from '../lib/mascotSystem';
import { mascotAudio } from '../lib/mascotAudio';
import { triggerHaptic } from '../lib/mascotHaptics';
import { useSound } from '../hooks/useSound';
import { Sparkles, Zap, Flame, Droplets, Shield, Sprout, Volume2, VolumeX } from 'lucide-react';
import { MascotMood } from '../types';

export interface LivingMascotProps {
  mascotId?: MascotId | string;
  className?: string;
  mood?: MascotMood;
  hat?: string;
  soundEnabled?: boolean;
  soundPack?: 'cat' | 'dog';
  vibrationEnabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  interactive?: boolean;
  showSpeech?: boolean;
  speechText?: string;
  onPowerTriggered?: () => void;
  sizeMultiplier?: number;
}

export const LivingMascot = React.memo(({
  mascotId = 'blue-slim',
  className = 'w-36 h-36',
  mood = 'happy',
  hat = 'none',
  soundEnabled = true,
  soundPack = 'cat',
  vibrationEnabled = true,
  onClick,
  interactive = true,
  showSpeech = true,
  speechText,
  onPowerTriggered,
  sizeMultiplier = 1
}: LivingMascotProps) => {
  const { play } = useSound();

  // Normalize mascotId
  const validMascotId: MascotId = (MASCOTS_DATA[mascotId as MascotId] ? mascotId : 'blue-slim') as MascotId;
  const config = MASCOTS_DATA[validMascotId];

  // Animation States
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeGlanceOffset, setEyeGlanceOffset] = useState(0);
  const [isSmiling, setIsSmiling] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [jumpPhase, setJumpPhase] = useState<'idle' | 'compress' | 'jump' | 'air' | 'landing' | 'bounce'>('idle');
  const [landingPuff, setLandingPuff] = useState(false);

  const [powerActive, setPowerActive] = useState(false);
  const [isRareTrigger, setIsRareTrigger] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [soundState, setSoundState] = useState(soundEnabled);
  const [vibeState, setVibeState] = useState(vibrationEnabled);

  const containerRef = useRef<HTMLDivElement>(null);
  const uid = React.useId().replace(/:/g, '');

  // Update sound/vibe when props change
  useEffect(() => {
    setSoundState(soundEnabled);
    setVibeState(vibrationEnabled);
  }, [soundEnabled, vibrationEnabled]);

  // Sync speech state when speechText prop updates
  useEffect(() => {
    if (speechText) {
      setIsTalking(true);
      const timer = setTimeout(() => setIsTalking(false), 2600);
      return () => clearTimeout(timer);
    }
  }, [speechText]);

  // Periodic blinking effect (every 4-7 seconds, duration 180ms)
  useEffect(() => {
    if (!interactive) return;

    const scheduleBlink = () => {
      const delay = 4000 + Math.random() * 3000;
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
        timer = scheduleBlink();
      }, delay);
    };

    let timer = scheduleBlink();
    return () => clearTimeout(timer);
  }, [interactive]);

  // Periodic subtle eye movement (every 8-12 seconds, glance left/right then center)
  useEffect(() => {
    if (!interactive) return;

    const scheduleGlance = () => {
      const delay = 8000 + Math.random() * 4000;
      return setTimeout(() => {
        const offset = Math.random() > 0.5 ? 3.5 : -3.5;
        setEyeGlanceOffset(offset);
        setTimeout(() => setEyeGlanceOffset(0), 1200);
        timer = scheduleGlance();
      }, delay);
    };

    let timer = scheduleGlance();
    return () => clearTimeout(timer);
  }, [interactive]);

  // Periodic subtle smile animation (every 15-20 seconds, duration 600ms)
  useEffect(() => {
    if (!interactive) return;

    const scheduleSmile = () => {
      const delay = 15000 + Math.random() * 5000;
      return setTimeout(() => {
        setIsSmiling(true);
        setTimeout(() => setIsSmiling(false), 600);
        timer = scheduleSmile();
      }, delay);
    };

    let timer = scheduleSmile();
    return () => clearTimeout(timer);
  }, [interactive]);

  // Handcrafted Tap Interaction: 580ms Squash & Stretch Jump Sequence
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;

    // Check chance for rare elemental interaction
    const rare = Math.random() < 0.12;
    setIsRareTrigger(rare);

    // Turn head/eyes slightly toward speech bubble & open mouth
    setIsTalking(true);
    setTimeout(() => setIsTalking(false), 2400);

    // 1. Compress body (80ms)
    setJumpPhase('compress');

    setTimeout(() => {
      // 2. Stretch & Jump (160ms)
      setJumpPhase('jump');
    }, 80);

    setTimeout(() => {
      // 3. Airtime (120ms)
      setJumpPhase('air');
    }, 240);

    setTimeout(() => {
      // 4. Landing (120ms): trigger landing impact pop, light haptic (25ms), & dust puff
      setJumpPhase('landing');
      if (soundState) {
        try {
          play('mascotPop');
        } catch (err) {}
      }
      triggerHaptic('tap', vibeState);
      setLandingPuff(true);
      setTimeout(() => setLandingPuff(false), 280);
    }, 360);

    setTimeout(() => {
      // 5. Bounce once (100ms)
      setJumpPhase('bounce');
    }, 480);

    setTimeout(() => {
      // 6. Return to idle (580ms total)
      setJumpPhase('idle');
    }, 580);

    // Trigger power overlay animation
    setPowerActive(true);
    setTimeout(() => setPowerActive(false), rare ? 1400 : 1000);

    // Trigger voice character audio
    if (soundState) {
      mascotAudio.playMascotSound(validMascotId, rare, true);
      try {
        if (soundPack === 'dog') {
          if (mood === 'angry' || mood === 'boiling') {
            play('dogAngry');
          } else if (mood === 'neutral') {
            play('dogHungry');
          } else {
            play('dogHappy');
          }
        } else {
          if (mood === 'neutral' || mood === 'angry' || mood === 'boiling') {
            play('catHungry');
          } else {
            play('catHappy');
          }
        }
      } catch (err) {
        console.warn('Mascot voice sound trigger error:', err);
      }
    }

    // Set contextual dialogue
    const dialogueCategory = rare ? 'rareTap' : (['morning', 'afterOneChallenge', 'longStreak'][Math.floor(Math.random() * 3)] as any);
    const msg = speechText || getMascotDialogue(validMascotId, dialogueCategory);
    setActiveDialogue(msg);

    if (onPowerTriggered) onPowerTriggered();
    if (onClick) onClick(e);
  };

  // Render elemental power screen/container effect overlay
  const renderPowerOverlay = () => {
    if (!powerActive) return null;

    switch (validMascotId) {
      case 'fire-slim':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0.8, 0], scale: [0.8, 1.3, 1.5, 1.8] }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-visible"
          >
            {/* Fire wave ring */}
            <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-500/40 via-red-500/50 to-amber-400/40 blur-xl animate-pulse" />
            {/* Embers */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                  animate={{
                    y: -60 - Math.random() * 40,
                    x: (Math.random() - 0.5) * 80,
                    opacity: 0,
                    scale: 0.2
                  }}
                  transition={{ duration: 0.9 + Math.random() * 0.3 }}
                  className="absolute w-3 h-3 bg-amber-300 rounded-full blur-[1px] shadow-[0_0_10px_#ffaa00]"
                />
              ))}
            </div>
          </motion.div>
        );

      case 'water-slim':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.6, 2.2] }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="w-full h-full rounded-full border-4 border-cyan-400/80 bg-cyan-500/20 blur-md" />
            {/* Floating water droplets */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: -50 - i * 10,
                  x: Math.sin(i) * 35,
                  opacity: 0,
                  scale: 0.5
                }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
                className="absolute w-2.5 h-2.5 bg-cyan-200 rounded-full shadow-[0_0_8px_#00e5ff]"
              />
            ))}
          </motion.div>
        );

      case 'lightning-slim':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.3, 1, 0] }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="w-full h-full rounded-full bg-yellow-300/30 blur-lg" />
            <Zap className="w-16 h-16 text-yellow-300 animate-ping absolute" strokeWidth={3} />
          </motion.div>
        );

      case 'earth-slim':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 0], scale: [0.7, 1.2, 1.4] }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="w-full h-full rounded-full bg-emerald-500/30 blur-md border-2 border-emerald-400/60" />
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ rotate: i * 60, y: 0, opacity: 1 }}
                animate={{ y: -45, opacity: 0 }}
                transition={{ duration: 0.9, delay: i * 0.05 }}
                className="absolute"
              >
                <Sprout className="w-5 h-5 text-emerald-300 drop-shadow-[0_0_6px_#22c55e]" />
              </motion.div>
            ))}
          </motion.div>
        );

      case 'shield-slim':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0.8, 0], scale: [0.6, 1.25, 1.3] }}
            transition={{ duration: 1.1 }}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="w-full h-full rounded-full border-4 border-indigo-400/90 bg-indigo-500/25 shadow-[0_0_20px_#6366f1] blur-[1px]" />
            <Shield className="w-12 h-12 text-indigo-200 animate-pulse absolute" />
          </motion.div>
        );

      case 'blue-slim':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 0], scale: [0.7, 1.3, 1.5] }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="w-full h-full rounded-full bg-sky-400/25 blur-lg" />
            <Sparkles className="w-10 h-10 text-sky-300 animate-spin absolute" />
          </motion.div>
        );
    }
  };

  const colors = config.colors;

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex items-center justify-center ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleTap}
    >
      {/* Speech Bubble Dialog */}
      <AnimatePresence>
        {showSpeech && activeDialogue && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.85 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md text-slate-800 px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/90 text-xs font-black whitespace-nowrap max-w-[200px] text-center"
          >
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200/90 rotate-45" />
            <span className="text-emerald-600 font-extrabold mr-1">[{config.name}]:</span>
            "{activeDialogue}"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power Overlay animation */}
      {renderPowerOverlay()}

      {/* Mascot Animated Vector Body Container */}
      <motion.div
        className="w-full h-full relative"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        animate={
          !interactive
            ? { y: 0, scaleX: 1, scaleY: 1, rotate: 0 }
            : jumpPhase === 'compress'
            ? { scaleX: 1.18, scaleY: 0.82, y: 0, rotate: 0 }
            : jumpPhase === 'jump'
            ? { scaleX: 0.88, scaleY: 1.18, y: -18, rotate: 2 }
            : jumpPhase === 'air'
            ? { scaleX: 0.98, scaleY: 1.02, y: -20, rotate: 2 }
            : jumpPhase === 'landing'
            ? { scaleX: 1.20, scaleY: 0.80, y: 0, rotate: 0 }
            : jumpPhase === 'bounce'
            ? { scaleX: 0.95, scaleY: 1.05, y: -3, rotate: 0 }
            : {
                y: [0, -4, 0],
                scaleX: [1, 1.015, 1],
                scaleY: [1, 0.985, 1],
                rotate: isRareTrigger ? [0, -8, 8, -4, 0] : 0
              }
        }
        transition={
          !interactive
            ? { duration: 0 }
            : jumpPhase === 'compress'
            ? { duration: 0.08, ease: 'easeOut' }
            : jumpPhase === 'jump'
            ? { duration: 0.16, ease: 'easeOut' }
            : jumpPhase === 'air'
            ? { duration: 0.12, ease: 'easeInOut' }
            : jumpPhase === 'landing'
            ? { duration: 0.12, ease: 'easeIn' }
            : jumpPhase === 'bounce'
            ? { duration: 0.10, ease: 'easeOut' }
            : {
                y: { repeat: Infinity, duration: 4.2, ease: 'easeInOut' },
                scaleX: { repeat: Infinity, duration: 3.8, ease: 'easeInOut' },
                scaleY: { repeat: Infinity, duration: 3.8, ease: 'easeInOut' },
                rotate: { duration: 0.9, ease: 'easeInOut' }
              }
        }
      >
        <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id={`bodyGrad-${uid}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={colors.bodyStart} />
              <stop offset="25%" stopColor={colors.bodyStop1} />
              <stop offset="70%" stopColor={colors.bodyStop2} />
              <stop offset="100%" stopColor={colors.bodyEnd} />
            </radialGradient>
            <linearGradient id={`haloGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.halo1} />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={colors.halo2} />
            </linearGradient>
            <linearGradient id={`armGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors.bodyStop2} stopOpacity={0.5} />
            </linearGradient>

            {/* Wearables Gradients & Filters */}
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

            {/* Detective Gradients */}
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

            {/* Ninja Gradients */}
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

            {/* Cool Shades Gradients */}
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

            {/* Viking Gradients */}
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

          {/* Dynamic Ground Shadow (Expands on landing impact) */}
          <ellipse 
            cx="200" 
            cy="355" 
            rx={jumpPhase === 'landing' ? 135 : jumpPhase === 'jump' || jumpPhase === 'air' ? 85 : 115} 
            ry={jumpPhase === 'landing' ? 18 : jumpPhase === 'jump' || jumpPhase === 'air' ? 9 : 14} 
            fill="#000000" 
            opacity={jumpPhase === 'jump' || jumpPhase === 'air' ? 0.09 : 0.18} 
            className="transition-all duration-150"
          />

          {/* Landing Dust Puff & Glow Burst Effect (GPU Accelerated) */}
          {landingPuff && (
            <motion.g initial={{ scale: 0.9, opacity: 0.9 }} animate={{ scale: 1.12, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}>
              <ellipse cx="200" cy="355" rx="130" ry="16" fill="none" stroke={colors.accentGlow || '#69C496'} strokeWidth="3" />
              <circle cx="120" cy="355" r="4" fill="#69C496" opacity="0.6" />
              <circle cx="280" cy="355" r="4" fill="#69C496" opacity="0.6" />
            </motion.g>
          )}

          {/* Animated Halo / Aura Ring (Slow 3 deg rotation, opacity pulse 0.85 -> 1.00) */}
          <motion.ellipse
            cx="200"
            cy="72"
            rx="92"
            ry="16"
            fill="none"
            stroke={`url(#haloGrad-${uid})`}
            strokeWidth={9}
            style={{ transformOrigin: '200px 72px', willChange: 'transform, opacity' }}
            animate={{ rotate: [0, 3, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 5.0, ease: 'easeInOut' }}
          />

          {/* Elemental Ear / Horn Features */}
          {validMascotId === 'fire-slim' && (
            <g className="animate-pulse">
              {/* Flame Horns */}
              <path d="M120,115 Q90,50 135,70 Q145,100 120,115 Z" fill="#ff5500" />
              <path d="M125,110 Q105,65 130,80 Z" fill="#fde047" />
              <path d="M280,115 Q310,50 265,70 Q255,100 280,115 Z" fill="#ff5500" />
              <path d="M275,110 Q295,65 270,80 Z" fill="#fde047" />
            </g>
          )}

          {validMascotId === 'water-slim' && (
            <g>
              {/* Aquatic Teardrop Ears */}
              <path d="M125,120 Q95,70 140,85 Z" fill={`url(#bodyGrad-${uid})`} stroke={colors.stroke} strokeWidth={2} />
              <path d="M275,120 Q305,70 260,85 Z" fill={`url(#bodyGrad-${uid})`} stroke={colors.stroke} strokeWidth={2} />
              <circle cx="115" cy="78" r="6" fill="#a5f3fc" opacity="0.8" />
              <circle cx="285" cy="78" r="6" fill="#a5f3fc" opacity="0.8" />
            </g>
          )}

          {validMascotId === 'lightning-slim' && (
            <g>
              {/* Lightning Horns */}
              <polygon points="120,120 100,75 125,80 110,40 145,85 130,90" fill="#fef08a" stroke="#eab308" strokeWidth="2" />
              <polygon points="280,120 300,75 275,80 290,40 255,85 270,90" fill="#fef08a" stroke="#eab308" strokeWidth="2" />
            </g>
          )}

          {validMascotId === 'earth-slim' && (
            <g>
              {/* Sprouting Leaf Ears */}
              <path d="M130,120 Q90,65 145,82 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
              <path d="M270,120 Q310,65 255,82 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
              <circle cx="200" cy="55" r="5" fill="#4ade80" />
            </g>
          )}

          {(validMascotId === 'blue-slim' || validMascotId === 'shield-slim') && (
            <g>
              {/* Cat ears */}
              <path d="M125,120 Q105,75 140,88 Z" fill={`url(#bodyGrad-${uid})`} stroke={colors.stroke} strokeWidth={2} />
              <path d="M275,120 Q295,75 260,88 Z" fill={`url(#bodyGrad-${uid})`} stroke={colors.stroke} strokeWidth={2} />
            </g>
          )}

          {/* Main Body */}
          <ellipse cx="200" cy="215" rx="160" ry="130" fill={`url(#bodyGrad-${uid})`} />

          {/* Shield Slim Protective Aura Ring */}
          {validMascotId === 'shield-slim' && (
            <ellipse cx="200" cy="215" rx="172" ry="142" fill="none" stroke="#818cf8" strokeWidth="4" strokeDasharray="12,8" opacity="0.85" />
          )}

          {/* Arms */}
          <ellipse cx="74" cy="225" rx="18" ry="24" fill={`url(#armGrad-${uid})`} transform="rotate(-15 74 225)" />
          <ellipse cx="326" cy="225" rx="18" ry="24" fill={`url(#armGrad-${uid})`} transform="rotate(15 326 225)" />

          {/* Signature Permanent Pink Shy Cheeks (Blush) */}
          <ellipse
            cx="120"
            cy="202"
            rx="14"
            ry="8"
            fill="#ff6b8b"
            opacity={isBlinking || isSmiling || mood === 'happy' ? 0.85 : 0.6}
            className="transition-opacity duration-300"
          />
          <ellipse
            cx="280"
            cy="202"
            rx="14"
            ry="8"
            fill="#ff6b8b"
            opacity={isBlinking || isSmiling || mood === 'happy' ? 0.85 : 0.6}
            className="transition-opacity duration-300"
          />

          {/* Eyes & Facial Expression System */}
          {(() => {
            const currentEyeOffset = isBlinking ? 0 : (isTalking ? 2 : eyeGlanceOffset);

            if (isBlinking) {
              return (
                <g stroke={colors.eyeColor} strokeWidth={6} strokeLinecap="round" fill="none">
                  {/* Blinking curved eyelids */}
                  <path d="M135,180 Q150,186 165,180" />
                  <path d="M235,180 Q250,186 265,180" />
                </g>
              );
            }

            if (mood === 'sad' || mood === 'grieving') {
              return (
                <g>
                  {/* Downturned Sad Eyes */}
                  <path d={`M${130 + currentEyeOffset},184 Q${150 + currentEyeOffset},170 ${170 + currentEyeOffset},184`} stroke={colors.eyeColor} strokeWidth={6} strokeLinecap="round" fill="none" />
                  <path d={`M${230 + currentEyeOffset},184 Q${250 + currentEyeOffset},170 ${270 + currentEyeOffset},184`} stroke={colors.eyeColor} strokeWidth={6} strokeLinecap="round" fill="none" />
                  
                  {/* Sad Eyebrows angled inward */}
                  <path d="M135,158 L165,166" stroke={colors.eyeColor} strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M265,158 L235,166" stroke={colors.eyeColor} strokeWidth="4.5" strokeLinecap="round" />

                  {/* Animated Teardrops Dripping Down Cheeks */}
                  <g className="animate-bounce">
                    <path d="M140,190 C136,196 136,204 140,208 C144,204 144,196 140,190 Z" fill="#38bdf8" />
                    <path d="M260,190 C256,196 256,204 260,208 C264,204 264,196 260,190 Z" fill="#38bdf8" />
                  </g>
                </g>
              );
            }

            if (mood === 'concerned') {
              return (
                <g>
                  {/* Wide Concerned Eyes */}
                  <circle cx={150 + currentEyeOffset} cy="180" r="15" fill={colors.eyeColor} />
                  <circle cx={146 + currentEyeOffset} cy="175" r="5" fill="#fff" />
                  <circle cx={250 + currentEyeOffset} cy="180" r="15" fill={colors.eyeColor} />
                  <circle cx={246 + currentEyeOffset} cy="175" r="5" fill="#fff" />
                  
                  {/* Worried Eyebrows */}
                  <path d="M135,162 Q150,158 165,165" stroke={colors.eyeColor} strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  <path d="M265,162 Q250,158 235,165" stroke={colors.eyeColor} strokeWidth="4.5" strokeLinecap="round" fill="none" />

                  {/* Sweat Drop on Forehead */}
                  <path d="M280,148 C276,154 276,162 280,166 C284,162 284,154 280,148 Z" fill="#60a5fa" className="animate-pulse" />
                </g>
              );
            }

            if (mood === 'hyped') {
              return (
                <g>
                  {/* Star Sparkling Eyes */}
                  <g transform={`translate(${135 + currentEyeOffset}, 166) scale(0.85)`}>
                    <polygon points="18,0 23,12 36,18 23,24 18,36 13,24 0,18 13,12" fill="#facc15" />
                  </g>
                  <g transform={`translate(${235 + currentEyeOffset}, 166) scale(0.85)`}>
                    <polygon points="18,0 23,12 36,18 23,24 18,36 13,24 0,18 13,12" fill="#facc15" />
                  </g>
                </g>
              );
            }

            if (mood === 'pouty') {
              return (
                <g>
                  {/* Pouty eyes looking down-left */}
                  <circle cx={148} cy="183" r="13" fill={colors.eyeColor} />
                  <circle cx={144} cy="180" r="4" fill="#fff" />
                  <circle cx={248} cy="183" r="13" fill={colors.eyeColor} />
                  <circle cx={244} cy="180" r="4" fill="#fff" />
                  <path d="M135,162 L165,164" stroke={colors.eyeColor} strokeWidth="4" strokeLinecap="round" />
                  <path d="M265,162 L235,164" stroke={colors.eyeColor} strokeWidth="4" strokeLinecap="round" />
                </g>
              );
            }

            if (mood === 'sleeping') {
              return (
                <g stroke={colors.eyeColor} strokeWidth={6} strokeLinecap="round" fill="none">
                  <path d="M135,182 Q150,188 165,182" />
                  <path d="M235,182 Q250,188 265,182" />
                  <text x="270" y="140" fill="#818cf8" fontSize="22" fontWeight="bold" className="animate-pulse">
                    Zzz...
                  </text>
                </g>
              );
            }

            if (mood === 'surprised') {
              return (
                <g>
                  <circle cx={150 + currentEyeOffset} cy="180" r="18" fill={colors.eyeColor} />
                  <circle cx={145 + currentEyeOffset} cy="173" r="7" fill="#fff" />
                  <circle cx={250 + currentEyeOffset} cy="180" r="18" fill={colors.eyeColor} />
                  <circle cx={245 + currentEyeOffset} cy="173" r="7" fill="#fff" />
                </g>
              );
            }

            if (mood === 'happy' && !isTalking) {
              return (
                <g stroke={colors.eyeColor} strokeWidth={7} strokeLinecap="round" fill="none">
                  <path d={`M${125 + currentEyeOffset},185 Q${145 + currentEyeOffset},165 ${165 + currentEyeOffset},185`} />
                  <path d={`M${235 + currentEyeOffset},185 Q${255 + currentEyeOffset},165 ${275 + currentEyeOffset},185`} />
                </g>
              );
            }

            if (mood === 'angry' || mood === 'boiling') {
              return (
                <g>
                  <circle cx={150 + currentEyeOffset} cy="180" r="14" fill={colors.eyeColor} />
                  <circle cx={145 + currentEyeOffset} cy="175" r="5" fill="#fff" />
                  <circle cx={250 + currentEyeOffset} cy="180" r="14" fill={colors.eyeColor} />
                  <circle cx={245 + currentEyeOffset} cy="175" r="5" fill="#fff" />
                  <path d="M130,158 L165,170" stroke={colors.eyeColor} strokeWidth="5.5" strokeLinecap="round" />
                  <path d="M270,158 L235,170" stroke={colors.eyeColor} strokeWidth="5.5" strokeLinecap="round" />
                </g>
              );
            }

            return (
              <g>
                <circle cx={150 + currentEyeOffset} cy="180" r="14" fill={colors.eyeColor} />
                <circle cx={145 + currentEyeOffset} cy="175" r="5" fill="#fff" />
                <circle cx={250 + currentEyeOffset} cy="180" r="14" fill={colors.eyeColor} />
                <circle cx={245 + currentEyeOffset} cy="175" r="5" fill="#fff" />
              </g>
            );
          })()}

          {/* Mouth Expressions - Clean, Glitch-Free Vector Rendering */}
          <g>
            {isTalking || isSmiling || mood === 'happy' || mood === 'hyped' ? (
              <g>
                <path
                  d="M182,194 Q200,216 218,194 Q200,228 182,194 Z"
                  fill="#b3243d"
                  stroke={colors.eyeColor}
                  strokeWidth={4.5}
                  strokeLinejoin="round"
                />
                <path d="M188,206 Q200,200 212,206 Q200,224 188,206 Z" fill="#ff6b8b" />
              </g>
            ) : mood === 'sad' || mood === 'grieving' ? (
              <path
                d="M180,212 Q200,196 220,212"
                fill="none"
                stroke={colors.eyeColor}
                strokeWidth={5}
                strokeLinecap="round"
              />
            ) : mood === 'concerned' ? (
              <path
                d="M182,206 Q191,200 200,206 Q209,212 218,206"
                fill="none"
                stroke={colors.eyeColor}
                strokeWidth={4.5}
                strokeLinecap="round"
              />
            ) : mood === 'pouty' ? (
              <path
                d="M188,208 Q200,200 212,208"
                fill="none"
                stroke={colors.eyeColor}
                strokeWidth={5}
                strokeLinecap="round"
              />
            ) : mood === 'angry' || mood === 'boiling' ? (
              <path
                d="M184,204 Q200,192 216,204"
                fill="none"
                stroke={colors.eyeColor}
                strokeWidth={5}
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M182,196 Q191,202 200,197 Q209,202 218,196"
                fill="none"
                stroke={colors.eyeColor}
                strokeWidth={4.5}
                strokeLinecap="round"
              />
            )}
          </g>

          {/* Wearables / Hats / Masks Overlay System */}
          {hat && hat !== 'none' && (
            <g id="living-mascot-wearable-overlay">
              {(hat === 'crown' || hat.includes('crown')) && (
                <g transform="translate(47, -108) scale(1.02)">
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

              {(hat === 'wizard' || hat.includes('wizard')) && (
                <g transform="translate(45, -135) scale(1.03)">
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

              {(hat === 'party' || hat.includes('party')) && (
                <g transform="translate(0, 15)">
                  <path d="M150,95 L200,40 L250,95 Z" fill="#ff4081" stroke="#c2185b" strokeWidth="2.5" />
                  <path d="M175,67 L225,67 L200,40 Z" fill="#00e676" />
                  <circle cx="200" cy="35" r="7" fill="#ffeb3b" />
                </g>
              )}

              {(hat === 'detective' || hat.includes('detective')) && (
                <g id="living-mascot-detective-wearable">
                  {/* Trench Coat */}
                  <g filter="url(#mascotClothingShadowDet)">
                    <path d="M 50 220 C 50 195, 350 195, 350 220 C 365 310, 330 345, 200 348 C 70 345, 35 310, 50 220 Z" fill="url(#mascotCoatGradDet)"/>
                    <path d="M 45 220 C 110 195, 290 195, 355 220 C 330 250, 270 255, 200 258 C 130 255, 70 250, 45 220 Z" fill="url(#mascotCoatShadowGradDet)"/>
                    <path d="M 140 205 L 200 240 L 260 205 L 235 200 L 200 220 L 165 200 Z" fill="#4a3728"/>
                    <path d="M 125 200 L 175 255 L 200 240 L 160 195 Z" fill="url(#mascotCoatGradDet)" stroke="#8c7a52" strokeWidth="1.5"/>
                    <path d="M 275 200 L 225 255 L 200 240 L 240 195 Z" fill="url(#mascotCoatGradDet)" stroke="#8c7a52" strokeWidth="1.5"/>
                    <circle cx="170" cy="275" r="5" fill="#3e2723"/>
                    <circle cx="230" cy="275" r="5" fill="#3e2723"/>
                    <circle cx="170" cy="305" r="5" fill="#3e2723"/>
                    <circle cx="230" cy="305" r="5" fill="#3e2723"/>
                    <rect x="75" y="290" width="250" height="18" rx="4" fill="#6d5438"/>
                    <rect x="182" y="286" width="36" height="26" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="2"/>
                    <rect x="190" y="291" width="20" height="16" rx="2" fill="#4a3728"/>
                    <rect x="58" y="215" width="28" height="16" rx="5" fill="#7a6b43" transform="rotate(-15 72 223)"/>
                    <rect x="314" y="215" width="28" height="16" rx="5" fill="#7a6b43" transform="rotate(15 328 223)"/>
                  </g>

                  {/* Deerstalker Hat */}
                  <g filter="url(#mascotClothingShadowDet)">
                    <path d="M 85 110 C 80 145, 120 160, 145 135 Z" fill="#6d4c33" stroke="#3e2723" strokeWidth="2"/>
                    <path d="M 315 110 C 320 145, 280 160, 255 135 Z" fill="#6d4c33" stroke="#3e2723" strokeWidth="2"/>
                    <path d="M 100 135 C 100 60, 150 45, 200 45 C 250 45, 300 60, 300 135 Z" fill="url(#mascotHatGradDet)"/>
                    <path d="M 200 45 C 200 90, 200 120, 200 135" stroke="#3e2723" strokeWidth="2" strokeDasharray="4 2"/>
                    <path d="M 150 55 C 160 90, 170 115, 175 135" stroke="#3e2723" strokeWidth="1.5"/>
                    <path d="M 250 55 C 240 90, 230 115, 225 135" stroke="#3e2723" strokeWidth="1.5"/>
                    <path d="M 85 130 C 130 155, 270 155, 315 130 C 325 142, 280 162, 200 162 C 120 162, 75 142, 85 130 Z" fill="#54371d"/>
                    <path d="M 100 125 C 70 120, 75 140, 95 135 Z" fill="#3e2723"/>
                    <path d="M 300 125 C 330 120, 325 140, 305 135 Z" fill="#3e2723"/>
                    <path d="M 100 135 C 140 145, 260 145, 300 135 L 300 125 C 260 135, 140 135, 100 125 Z" fill="#1f1a17"/>
                    <rect x="188" y="126" width="24" height="14" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5"/>
                    <ellipse cx="200" cy="45" rx="10" ry="6" fill="#3e2723"/>
                  </g>

                  {/* Hand Magnifying Glass */}
                  <g filter="url(#mascotClothingShadowDet)">
                    <rect x="270" y="200" width="16" height="55" rx="8" fill="#4a2c11" stroke="#261405" strokeWidth="2" transform="rotate(-40 278 227)"/>
                    <circle cx="235" cy="175" r="34" fill="none" stroke="url(#mascotMetalRimDet)" strokeWidth="7"/>
                    <circle cx="235" cy="175" r="30" fill="url(#mascotGlassGradDet)"/>
                    <path d="M 215 155 Q 235 145 255 160" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none"/>
                    <path d="M 210 165 Q 220 155 230 162" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" fill="none"/>
                  </g>
                </g>
              )}

              {(hat === 'ninja' || hat.includes('ninja')) && (
                <g id="living-mascot-ninja-wearable">
                  {/* Shinobi Gi Suit */}
                  <g filter="url(#mascotNinjaShadow)">
                    <path d="M 45 220 C 45 190, 355 190, 355 220 C 370 310, 335 348, 200 350 C 65 348, 30 310, 45 220 Z" fill="url(#mascotNinjaFabricGrad)"/>
                    <path d="M 120 220 L 200 280 L 280 220 L 255 210 L 200 250 L 145 210 Z" fill="#111315" stroke="#374151" strokeWidth="2"/>
                    <path d="M 45 210 C 70 195, 120 205, 125 230 C 95 240, 55 235, 45 210 Z" fill="#1f2328" stroke="#374151" strokeWidth="1.5"/>
                    <path d="M 355 210 C 330 195, 280 205, 275 230 C 305 240, 345 235, 355 210 Z" fill="#1f2328" stroke="#374151" strokeWidth="1.5"/>
                    <rect x="70" y="280" width="260" height="22" rx="4" fill="url(#mascotNinjaSashGrad)"/>
                    <path d="M 230 295 Q 240 335 250 350 Q 230 335 220 295 Z" fill="url(#mascotNinjaSashGrad)"/>
                    <path d="M 245 295 Q 260 330 275 342 Q 255 330 240 295 Z" fill="#991b1b"/>
                    <g transform="translate(140, 291) scale(0.85)">
                      <path d="M 12 0 L 15 8 L 24 12 L 15 16 L 12 24 L 9 16 L 0 12 L 9 8 Z" fill="url(#mascotNinjaMetalGrad)"/>
                      <circle cx="12" cy="12" r="3" fill="#111827"/>
                    </g>
                    <rect x="52" y="215" width="30" height="18" rx="6" fill="#111315" stroke="#4b5563" strokeWidth="1.5" transform="rotate(-15 67 224)"/>
                    <rect x="318" y="215" width="30" height="18" rx="6" fill="#111315" stroke="#4b5563" strokeWidth="1.5" transform="rotate(15 333 224)"/>
                  </g>

                  {/* Ninja Hood Cowl */}
                  <g filter="url(#mascotNinjaShadow)">
                    <g>
                      <path d="M 300 120 Q 360 100 375 145 Q 335 130 300 130 Z" fill="url(#mascotNinjaFabricGrad)"/>
                      <path d="M 300 125 Q 365 140 350 185 Q 330 155 300 135 Z" fill="#1c1e22"/>
                    </g>
                    <path d="M 75 125 C 75 55, 130 40, 200 40 C 270 40, 325 55, 325 125 C 325 155, 275 160, 200 160 C 125 160, 75 155, 75 125 Z" fill="url(#mascotNinjaFabricGrad)"/>
                    <rect x="120" y="98" width="160" height="32" rx="6" fill="url(#mascotNinjaMetalGrad)" stroke="#1f2937" strokeWidth="2.5"/>
                    <circle cx="132" cy="114" r="3" fill="#1f2937"/>
                    <circle cx="268" cy="114" r="3" fill="#1f2937"/>
                    <path d="M 200 104 L 204 111 L 211 114 L 204 117 L 200 124 L 196 117 L 189 114 L 196 111 Z" fill="#1f2937"/>
                    <path d="M 80 145 Q 200 158 320 145 L 320 158 Q 200 170 80 158 Z" fill="#111315"/>
                  </g>

                  {/* Ninja Lower Face Mask */}
                  <g filter="url(#mascotNinjaShadow)">
                    <path d="M 70 190 C 110 182, 290 182, 330 190 C 345 235, 290 250, 200 252 C 110 250, 55 235, 70 190 Z" fill="url(#mascotNinjaFabricGrad)"/>
                    <path d="M 90 205 Q 200 222 310 205" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
                    <path d="M 110 222 Q 200 236 290 222" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                    <circle cx="325" cy="195" r="8" fill="#111315"/>
                    <circle cx="75" cy="195" r="8" fill="#111315"/>
                  </g>
                </g>
              )}

              {(hat === 'cool' || hat.includes('cool') || hat.includes('shades')) && (
                <g transform="translate(40, 95) scale(0.8)">
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

              {(hat === 'artist' || hat.includes('artist') || hat.includes('beret')) && (
                <g transform="translate(0, 10)">
                  <path d="M130,95 Q200,45 260,90 Q200,85 130,95 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                  <circle cx="200" cy="52" r="4" fill="#991b1b" />
                </g>
              )}

              {(hat === 'viking' || hat.includes('viking')) && (
                <g transform="translate(32, -90) scale(1.12)">
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

              {(hat === 'space' || hat.includes('space')) && (
                <g transform="translate(0, 10)">
                  <circle cx="200" cy="180" r="115" fill="none" stroke="#22d3ee" strokeWidth="6" opacity="0.8" filter="drop-shadow(0 0 10px rgba(34,211,238,0.6))" />
                  <ellipse cx="200" cy="170" rx="90" ry="60" fill="#0284c7" opacity="0.35" />
                  <path d="M130,140 Q200,120 270,140 Q240,180 130,140 Z" fill="#ffffff" opacity="0.2" />
                </g>
              )}

              {(hat === 'emperor' || hat.includes('emperor')) && (
                <g transform="translate(0, 10)">
                  <path d="M150,95 L165,50 L185,75 L200,40 L215,75 L235,50 L250,95 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
                  <circle cx="165" cy="48" r="4" fill="#ef4444" />
                  <circle cx="200" cy="38" r="5" fill="#3b82f6" />
                  <circle cx="235" cy="48" r="4" fill="#ef4444" />
                  <ellipse cx="200" cy="215" rx="168" ry="138" fill="none" stroke="#fbbf24" strokeWidth="4" strokeDasharray="8,6" opacity="0.7" />
                </g>
              )}

              {(hat === 'voidwalker' || hat.includes('void')) && (
                <g transform="translate(0, 10)">
                  <path d="M135,115 C135,50 265,50 265,115 C265,130 135,130 135,115 Z" fill="#0f172a" stroke="#a855f7" strokeWidth="3" />
                  <ellipse cx="200" cy="115" rx="55" ry="12" fill="#3b0764" />
                  <circle cx="175" cy="115" r="5" fill="#c084fc" filter="drop-shadow(0 0 6px #c084fc)" />
                  <circle cx="225" cy="115" r="5" fill="#c084fc" filter="drop-shadow(0 0 6px #c084fc)" />
                </g>
              )}

              {(hat === 'godmode' || hat.includes('godmode') || hat.includes('overlord')) && (
                <g transform="translate(0, 5)">
                  <path d="M70,120 L70,220 M55,120 L55,150 Q70,165 85,150 L85,120" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <polygon points="70,105 63,120 77,120" fill="#f59e0b" />
                  <polygon points="55,110 50,122 60,122" fill="#f59e0b" />
                  <polygon points="85,110 80,122 90,122" fill="#f59e0b" />
                  <ellipse cx="200" cy="215" rx="175" ry="50" fill="none" stroke="#6366f1" strokeWidth="3" transform="rotate(-15 200 215)" opacity="0.8" />
                </g>
              )}

              {(hat === 'apex' || hat.includes('apex') || hat.includes('pro')) && (
                <g transform="translate(0, 15)">
                  <rect x="120" y="160" width="160" height="30" rx="8" fill="#0284c7" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="3" filter="drop-shadow(0 0 12px #38bdf8)" />
                  <line x1="130" y1="175" x2="270" y2="175" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="4,4" />
                  <text x="200" y="181" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#38bdf8" textAnchor="middle">QUANTUM HUD v2.0</text>
                </g>
              )}
            </g>
          )}

          {/* Central Insignia */}
          <text
            x="200"
            y="278"
            fontFamily="system-ui, sans-serif"
            fontWeight={900}
            fontSize={62}
            fill="#ffffff"
            textAnchor="middle"
            filter="drop-shadow(0 2px 8px rgba(255,255,255,0.7))"
          >
            N
          </text>
        </svg>
      </motion.div>
    </div>
  );
});

LivingMascot.displayName = 'LivingMascot';
