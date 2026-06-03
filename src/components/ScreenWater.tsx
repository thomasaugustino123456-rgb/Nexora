import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface SimulatedIceCube {
  id: number;
  homeX: number;
  x: number;
  vx: number;
  size: number;
  baseRotation: number;
  floatPhase: number;
  floatSpeed: number;
}

export const ScreenWater: React.FC<ScreenWaterProps> = React.memo(({ progress }) => {
  const [tilt, setTilt] = useState(0);
  const [splashes, setSplashes] = useState<SplashParticle[]>([]);
  const lastProgressRef = useRef(progress);

  // We start the water level from the absolute bottom edge of the device screen (1000 in SVG space)
  // When progress = 0: currentY is 1000 (meaning water is gently sloshing at the absolute bottom edge, visible and interactive)
  // When progress = 1: currentY is 100 (near the top of the screen)
  const currentY = 1000 - (progress * 900);

  // Initialize 10 ice cubes spaced evenly across the screen width (from x = 100 to 900)
  const [iceCubes, setIceCubes] = useState<SimulatedIceCube[]>(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const homeX = 90 + i * 90; // Distributed beautifully
      return {
        id: i,
        homeX,
        x: homeX,
        vx: 0,
        size: 40 + Math.random() * 20, // Variation in chunkiness
        baseRotation: (Math.random() - 0.5) * 60,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.015 + Math.random() * 0.015,
      };
    });
  });

  // Track orientation of the device with a desktop cursor fallback
  useEffect(() => {
    let active = true;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!active) return;
      if (e.gamma !== null) {
        // gamma is left-to-right tilt in degrees [-90, 90]
        const clamped = Math.max(-30, Math.min(30, e.gamma));
        setTilt(clamped * 0.7); // smooth responsiveness scaling factor
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!active) return;
      // desktop cursor fallback with smooth transition
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

  // Frame-by-frame high performance physics simulation for the ice cubes
  useEffect(() => {
    let active = true;
    let frameId: number;
    let time = 0;

    const simulatePhysics = () => {
      if (!active) return;
      time += 1;

      setIceCubes(prevCubes => {
        // Step 1: Apply physics forces (gravity/tilt force & subtle home restoring force)
        let updated = prevCubes.map(cube => {
          // Tilt force acts as horizontal gravity
          const gravityForce = tilt * 0.28; 
          
          // Home restoring spring force: stronger when tilt feels closer to 0
          const tiltFactor = Math.max(0, 1 - Math.abs(tilt) / 10);
          const springForce = (cube.homeX - cube.x) * (0.012 + tiltFactor * 0.022);
          
          const totalForce = gravityForce + springForce;
          
          let nextVx = cube.vx + totalForce;
          nextVx *= 0.86; // drag/friction friction
          
          return {
            ...cube,
            x: cube.x + nextVx,
            vx: nextVx,
          };
        });

        // Sort dynamically from left to right to resolve overlaps cleanly
        updated.sort((a, b) => a.x - b.x);

        // Limit boundaries and resolve overlap collisions
        // minSeparation incorporates the sizes of the ice cubes
        for (let iteration = 0; iteration < 4; iteration++) {
          // Boundaries [60, 940]
          for (let i = 0; i < updated.length; i++) {
            const minBoundary = 60 + updated[i].size / 2;
            const maxBoundary = 940 - updated[i].size / 2;
            if (updated[i].x < minBoundary) {
              updated[i].x = minBoundary;
              updated[i].vx = Math.max(0, updated[i].vx);
            }
            if (updated[i].x > maxBoundary) {
              updated[i].x = maxBoundary;
              updated[i].vx = Math.min(0, updated[i].vx);
            }
          }

          // Push apart overlaps (colliding circles/boxes physics)
          for (let i = 0; i < updated.length - 1; i++) {
            const c1 = updated[i];
            const c2 = updated[i + 1];
            // Minimum distance between the centers of two cubes
            const minSeparation = (c1.size + c2.size) * 0.55; 
            const dist = c2.x - c1.x;
            
            if (dist < minSeparation) {
              const overlap = minSeparation - dist;
              // Push them apart
              updated[i].x -= overlap * 0.5;
              updated[i + 1].x += overlap * 0.5;
              
              // Bounce velocities
              const bounce = 0.15;
              const tempVx = updated[i].vx;
              updated[i].vx = updated[i].vx * bounce - overlap * 0.05;
              updated[i + 1].vx = tempVx * bounce + overlap * 0.05;
            }
          }
        }

        return updated;
      });

      frameId = requestAnimationFrame(simulatePhysics);
    };

    frameId = requestAnimationFrame(simulatePhysics);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, [tilt]);

  // Spawn visual splash bubble/droplets when the water rises (clicked "+1")
  useEffect(() => {
    if (progress > lastProgressRef.current) {
      const newParticles: SplashParticle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: 200 + Math.random() * 600, // disperse across user screen width
        y: currentY,
        vx: (Math.random() - 0.5) * 12,
        vy: -6 - Math.random() * 10, // upward splash force
        radius: 4 + Math.random() * 6,
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
                vy: p.vy + 0.45, // gravity downward acceleration
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

  // Water is always rendered so that sloshing is displayed at the absolute bottom.
  const isVisible = true;

  // Track time inside Render Cycle for independent float bobbing
  const [time, setTime] = useState(0);
  useEffect(() => {
    let active = true;
    let frameId: number;
    const tick = () => {
      if (!active) return;
      setTime(prev => prev + 1);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, []);

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
        .anim-screen-wave-1 {
          animation: fullWaveScroll1 6.5s linear infinite;
        }
        .anim-screen-wave-2 {
          animation: fullWaveScroll2 9.5s linear infinite;
        }
      `}</style>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
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
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.97" /> {/* Luxury navy deep ocean */}
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

                {/* Ultimate crisp refractive Ice Cube Gradient */}
                <linearGradient id="ice-cube-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="30%" stopColor="#E0F2FE" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#BAE6FD" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
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
                    d={`M -500,${currentY - 12} Q -250,${currentY - 32} 0,${currentY - 12} T 500,${currentY - 12} T 1000,${currentY - 12} T 1500,${currentY - 12} Q 1750,${currentY - 32} 2000,${currentY - 12} L 2000,1200 L -500,1200 Z`}
                    fill="url(#screen-water-back-grad)"
                  />
                </g>

                {/* 2. LAYER 2: Front Water Waves Body */}
                <g className="anim-screen-wave-1">
                  <path
                    d={`M -500,${currentY} Q -250,${currentY + 22} 0,${currentY} T 500,${currentY} T 1000,${currentY} T 1500,${currentY} Q 1750,${currentY + 22} 2000,${currentY} L 2000,1200 L -500,1200 Z`}
                    fill="url(#screen-water-gradient)"
                  />
                </g>

                {/* 3. LAYER 3: Surface Glow Accent */}
                <g className="anim-screen-wave-1">
                  <path
                    d={`M -500,${currentY} Q -250,${currentY + 22} 0,${currentY} T 500,${currentY} T 1000,${currentY} T 1500,${currentY} Q 1750,${currentY + 22} 2000,${currentY} L 2000,${currentY + 45} L -500,${currentY + 45} Z`}
                    fill="url(#screen-surface-glow)"
                  />
                </g>

                {/* DYNAMIC COLLIDING FLOATING ICE CUBES (Float SNUGLY on top of the sloshing surface level) */}
                {iceCubes.map(cube => {
                  // Precise trigonometric vertical height representation on the tilted water surface line
                  const tiltRad = (tilt * Math.PI) / 180;
                  const surfaceY = currentY + (cube.x - 500) * Math.sin(tiltRad);

                  // Gentle decoupling harmonic water bobbing for this specific cube
                  const bobbing = Math.sin(time * cube.floatSpeed + cube.floatPhase) * 10;
                  // Rest fully partially submerged
                  const finalY = surfaceY + bobbing - 5;

                  // Rotate dynamically depending on the sliding velocity and physical tilt of water
                  const dynamicRotation = cube.baseRotation + (cube.vx * 3.2) + (tilt * 0.4);

                  return (
                    <g 
                      key={cube.id} 
                      transform={`translate(${cube.x}, ${finalY}) rotate(${dynamicRotation})`}
                      className="drop-shadow-[0_8px_16px_rgba(14,165,233,0.25)]"
                    >
                      {/* Outer Frosty Cube Rim */}
                      <rect 
                        x={-cube.size / 2} 
                        y={-cube.size / 2} 
                        width={cube.size} 
                        height={cube.size} 
                        rx={cube.size * 0.22} 
                        fill="url(#ice-cube-grad)" 
                        stroke="#F0F9FF" 
                        strokeWidth="2.5"
                        strokeOpacity="0.85"
                      />
                      
                      {/* Frozen Air Core Accent */}
                      <rect 
                        x={-cube.size * 0.3} 
                        y={-cube.size * 0.3} 
                        width={cube.size * 0.6} 
                        height={cube.size * 0.6} 
                        rx={cube.size * 0.12} 
                        fill="#BAE6FD" 
                        fillOpacity="0.45" 
                        stroke="#FFFFFF" 
                        strokeWidth="1.2" 
                        strokeOpacity="0.5"
                      />

                      {/* Glossy Top-Left Reflection Lines */}
                      <path 
                        d={`M ${-cube.size * 0.34} ${-cube.size * 0.34} L ${-cube.size * 0.1} ${-cube.size * 0.34}`} 
                        stroke="#FFFFFF" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeOpacity="0.9"
                      />
                      <path 
                        d={`M ${-cube.size * 0.34} ${-cube.size * 0.34} L ${-cube.size * 0.34} ${-cube.size * 0.1}`} 
                        stroke="#FFFFFF" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeOpacity="0.9"
                      />

                      {/* Sparkly Ambient Tiny Frozen Air Bubbles */}
                      <circle cx={cube.size * 0.16} cy={cube.size * 0.16} r={cube.size * 0.05} fill="#FFFFFF" fillOpacity="0.7" />
                      <circle cx={-cube.size * 0.14} cy={cube.size * 0.2} r={cube.size * 0.03} fill="#FFFFFF" fillOpacity="0.55" />
                    </g>
                  );
                })}

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
                    strokeWidth="1.2"
                    strokeOpacity="0.6"
                  />
                ))}
              </motion.g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ScreenWater.displayName = 'ScreenWater';
