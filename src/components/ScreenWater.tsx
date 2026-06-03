import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mascotSwimsuitImg from '../assets/images/mascot_swimsuit_1780494337310.png';

interface ScreenWaterProps {
  progress: number; // 0 to 1 (0% to 100%)
}

interface SplashParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const ScreenWater: React.FC<ScreenWaterProps> = React.memo(({ progress }) => {
  const [tilt, setTilt] = useState(0);
  const [splashes, setSplashes] = useState<SplashParticle[]>([]);
  const lastProgressRef = useRef(progress);

  // Compute the exact Y coordinate in a 1000x1000 coordinate system
  // progress = 0 -> water level at bottom (1020)
  // progress = 1 -> water level at top (80)
  const currentY = 1020 - (progress * 940);

  // Smooth floating position for mascot
  // Mascot should float and bob snuggly on the water surface in the middle (x = 500)
  const mascotY = currentY - 110;

  // Track orientation of the device
  useEffect(() => {
    let active = true;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!active) return;
      if (e.gamma !== null) {
        // gamma is left-to-right tilt in degrees [-90, 90]
        const clamped = Math.max(-30, Math.min(30, e.gamma));
        setTilt(clamped * 0.6); // smooth scale
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!active) return;
      // desktop cursor fallback
      const ratio = (e.clientX / window.innerWidth) - 0.5; // [-0.5, 0.5]
      setTilt(ratio * 25);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      active = false;
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Spawn visual splash bubble/droplets when the water rises (clicked "+1")
  useEffect(() => {
    if (progress > lastProgressRef.current) {
      const newParticles: SplashParticle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: 450 + Math.random() * 100, // cluster around the mascot
        y: currentY,
        vx: (Math.random() - 0.5) * 8,
        vy: -4 - Math.random() * 8, // projectile upward
        radius: 3 + Math.random() * 5,
      }));

      setSplashes(prev => [...prev, ...newParticles]);

      // Simple animation loop for splash physics
      let frameId: number;
      let startTime = Date.now();

      const updatePhysics = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 1200) {
          setSplashes(prev => prev.filter(p => !newParticles.some(n => n.id === p.id)));
          return;
        }

        setSplashes(prev =>
          prev.map(p => {
            if (newParticles.some(n => n.id === p.id)) {
              return {
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.35, // Gravity force pulling down
              };
            }
            return p;
          })
        );
        frameId = requestAnimationFrame(updatePhysics);
      };

      frameId = requestAnimationFrame(updatePhysics);

      return () => {
        cancelAnimationFrame(frameId);
      };
    }
    lastProgressRef.current = progress;
  }, [progress, currentY]);

  // Don't show anything structure-wise if progress is 0, keeping it super clean
  const isVisible = progress > 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 select-none overflow-hidden">
      {/* Wave styles & animations */}
      <style>{`
        @keyframes fullWaveScroll1 {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-500px); }
        }
        @keyframes fullWaveScroll2 {
          0% { transform: translateX(-250px); }
          100% { transform: translateX(250px); }
        }
        @keyframes floatSwimsuitMascot {
          0%, 100% { transform: translateY(-4px) rotate(-1.5deg); }
          50% { transform: translateY(6px) rotate(2deg); }
        }
        .anim-screen-wave-1 {
          animation: fullWaveScroll1 6s linear infinite;
        }
        .anim-screen-wave-2 {
          animation: fullWaveScroll2 9s linear infinite;
        }
        .anim-swimsuit-float {
          animation: floatSwimsuitMascot 3.6s ease-in-out infinite;
          transform-origin: center bottom;
        }
      `}</style>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
          >
            <svg 
              viewBox="0 0 1000 1000" 
              preserveAspectRatio="none" 
              className="absolute inset-0 w-full h-full"
            >
              <defs>
                {/* Immersive responsive glowing gradients */}
                <linearGradient id="screen-water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" /> {/* Vivid sky blue water top */}
                  <stop offset="25%" stopColor="#0EA5E9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.96" /> {/* Luxury navy deep ocean */}
                </linearGradient>

                <linearGradient id="screen-water-back-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.6" />
                </linearGradient>

                {/* Ambient glow highlight gradient for the liquid surface */}
                <linearGradient id="screen-surface-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* ROTATING MAIN LIQUID ASSEMBLY (Responds instantly to Gyro / Accelerator Tilt) */}
              <motion.g
                animate={{ rotate: tilt }}
                style={{ transformOrigin: `500px ${currentY}px` }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
              >
                {/* 1. LAYER 1: Parallax Ambient Waves Backing */}
                <g className="anim-screen-wave-2">
                  <path
                    d={`M -500,${currentY - 10} Q -250,${currentY - 30} 0,${currentY - 10} T 500,${currentY - 10} T 1000,${currentY - 10} T 1500,${currentY - 10} Q 1750,${currentY - 30} 2000,${currentY - 10} L 2000,1200 L -500,1200 Z`}
                    fill="url(#screen-water-back-grad)"
                  />
                </g>

                {/* 2. LAYER 2: Front Water Waves Body */}
                <g className="anim-screen-wave-1">
                  <path
                    d={`M -500,${currentY} Q -250,${currentY + 25} 0,${currentY} T 500,${currentY} T 1000,${currentY} T 1500,${currentY} Q 1750,${currentY + 25} 2000,${currentY} L 2000,1200 L -500,1200 Z`}
                    fill="url(#screen-water-gradient)"
                  />
                </g>

                {/* 3. LAYER 3: Surface Glow Accent */}
                <g className="anim-screen-wave-1">
                  <path
                    d={`M -500,${currentY} Q -250,${currentY + 25} 0,${currentY} T 500,${currentY} T 1000,${currentY} T 1500,${currentY} Q 1750,${currentY + 25} 2000,${currentY} L 2000,${currentY + 40} L -500,${currentY + 40} Z`}
                    fill="url(#screen-surface-glow)"
                  />
                </g>

                {/* SPLASH PARTICLES (Spawned on tap progress changes) */}
                {splashes.map(p => (
                  <circle
                    key={p.id}
                    cx={p.x}
                    cy={p.y}
                    r={p.radius}
                    fill="#E0F2FE"
                    fillOpacity="0.75"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                  />
                ))}

                {/* FLOATING SWIMSUIT MASCOT (Placed directly at surface center on top of water) */}
                <motion.g
                  animate={{
                    y: mascotY,
                    rotate: tilt * 0.4,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 75,
                    damping: 14,
                  }}
                  style={{ transformOrigin: '500px 500px' }}
                >
                  <g className="anim-swimsuit-float">
                    {/* Ring donut back half */}
                    <g opacity="0.95">
                      <path d="M 410,10 A 90,36 0 0,1 590,10" fill="none" stroke="#FF5C8A" strokeWidth="32" strokeLinecap="round" />
                      <path d="M 435,10 A 65,22 0 0,1 565,10" fill="none" stroke="#FFF7ED" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
                    </g>

                    {/* Cute transparent swimsuit mascot image (Sits perfectly inside swim ring) */}
                    <image
                      href={mascotSwimsuitImg}
                      x="400"
                      y="-110"
                      width="200"
                      height="200"
                    />

                    {/* Ring donut front half */}
                    <g>
                      <path d="M 590,10 A 90,36 0 0,1 410,10" fill="none" stroke="#FF5C8A" strokeWidth="32" strokeLinecap="round" />
                      
                      {/* Tropical white stripes decoration on swim ring */}
                      <path d="M 432,23 C 435,20 433,16 431,10" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 500,28 C 500,21 500,16 500,10" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 568,23 C 565,20 567,16 569,10" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round" />
                      
                      <path d="M 462,26 C 463,21 461,16 460,11" fill="none" stroke="#FFA6C9" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 535,26 C 534,21 536,16 537,11" fill="none" stroke="#FFA6C9" strokeWidth="8" strokeLinecap="round" />
                    </g>
                  </g>
                </motion.g>
              </motion.g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ScreenWater.displayName = 'ScreenWater';
