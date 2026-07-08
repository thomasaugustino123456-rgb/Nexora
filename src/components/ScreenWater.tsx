import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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

interface CartoonIceCube {
  id: number;
  layer: 'top' | 'middle' | 'bottom';
  homeX: number;
  x: number;
  vx: number;
  size: number;
  baseRotation: number;
  rot: number;
  vrot: number;
  floatPhase: number;
  floatSpeed: number;
}

export const ScreenWater: React.FC<ScreenWaterProps> = React.memo(({ progress }) => {
  const [tilt, setTilt] = useState(0);
  const [smoothTilt, setSmoothTilt] = useState(0); // smooth lagging tilt for fluid physics inertia
  const [splashes, setSplashes] = useState<SplashParticle[]>([]);
  const lastProgressRef = useRef(progress);

  // Reducer factor to sit water lower at the bottom for an elegant background footer base on laptop/tablet!
  // When progress = 0: currentY is 935 (low, refined, stable base layer)
  // When progress = 1: currentY is 150 (completely filling background)
  const currentY = 935 - (progress * 780);

  // Initialize 5 ice cubes with optimized, balanced sizing to prevent looking too big on any screen:
  const [iceCubes, setIceCubes] = useState<CartoonIceCube[]>(() => {
    const layers: { layer: 'top' | 'middle' | 'bottom'; homeX: number; size: number }[] = [
      // Top floaters
      { layer: 'top', homeX: 450, size: 46 },
      { layer: 'top', homeX: 540, size: 48 },
      // Mid drifters (suspended inside water depth)
      { layer: 'middle', homeX: 420, size: 40 },
      { layer: 'middle', homeX: 560, size: 42 },
      // Bottom sinkers (heavy glass slide/clatter on screen bottom floor)
      { layer: 'bottom', homeX: 490, size: 52 }
    ];

    return layers.map((item, idx) => ({
      id: idx,
      layer: item.layer,
      homeX: item.homeX,
      x: item.homeX,
      vx: 0,
      size: item.size,
      baseRotation: (Math.random() - 0.5) * 40,
      rot: (Math.random() - 0.5) * 20,
      vrot: 0,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: 0.015 + Math.random() * 0.015,
    }));
  });

  const tiltRef = useRef(0);
  const smoothTiltRef = useRef(0);

  // Device orientation capture (with desktop hover cursor fallback)
  useEffect(() => {
    let active = true;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!active) return;
      if (e.gamma !== null) {
        // Subtle tilt clamp for refined organic feel
        const clamped = Math.max(-3, Math.min(3, e.gamma));
        setTilt(clamped);
        tiltRef.current = clamped;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!active) return;
      const ratio = (e.clientX / window.innerWidth) - 0.5; // [-0.5, 0.5]
      const nextTilt = ratio * 5;
      setTilt(nextTilt);
      tiltRef.current = nextTilt;
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      active = false;
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Central Animation and Simulation Frame loop
  // Runs continuously and reads stable Refs to avoid tearing down on state changes!
  const [time, setTime] = useState(0);
  useEffect(() => {
    let active = true;
    let frameId: number;

    const runSimulationLoop = () => {
      if (!active) return;
      
      // Update global physics timer
      setTime(prev => prev + 1);

      // Smoothly interpolate physical tilt values using Spring Inertia (avoids quick shifts)
      const currentTilt = tiltRef.current;
      const prevSmooth = smoothTiltRef.current;
      const diff = currentTilt - prevSmooth;
      const nextSmooth = prevSmooth + diff * 0.04;
      smoothTiltRef.current = nextSmooth;
      setSmoothTilt(nextSmooth);

      // Solve 3-layer Ice Cube sliding physics and collisions
      setIceCubes(prevCubes => {
        let updated = prevCubes.map(cube => {
          let gravityMult = 0.45;
          if (cube.layer === 'bottom') gravityMult = 0.72;
          if (cube.layer === 'middle') gravityMult = 0.22;

          const gravityAcc = nextSmooth * gravityMult;

          // Spring returns cubes smoothly back toward "homeX" when tilt returns to neutral
          const tiltFactor = Math.max(0, 1 - Math.abs(nextSmooth) / 12);
          const springFactor = cube.layer === 'middle' ? 0.008 : 0.015;
          const springRestor = (cube.homeX - cube.x) * springFactor * (0.15 + tiltFactor * 0.85);

          const netForce = gravityAcc + springRestor;

          let nextVx = cube.vx + netForce;
          
          let friction = 0.88;
          if (cube.layer === 'middle') friction = 0.78;
          if (cube.layer === 'bottom') friction = 0.92;
          nextVx *= friction;

          let nextVrot = cube.vrot + (nextVx * 0.15) - (cube.rot - cube.baseRotation) * 0.03;
          nextVrot *= 0.9;

          return {
            ...cube,
            x: cube.x + nextVx,
            vx: nextVx,
            rot: cube.rot + nextVrot,
            vrot: nextVrot
          };
        });

        // Resolve collision stacking overlays independently inside each depth layer
        const layers: ('top' | 'middle' | 'bottom')[] = ['top', 'middle', 'bottom'];
        
        layers.forEach(lyr => {
          const layerIndices = updated
            .map((c, i) => ({ cube: c, idx: i }))
            .filter(item => item.cube.layer === lyr);

          layerIndices.sort((a, b) => a.cube.x - b.cube.x);

          for (let pass = 0; pass < 5; pass++) {
            // Apply screen boundaries
            for (let i = 0; i < layerIndices.length; i++) {
              const item = layerIndices[i];
              const minB = 65 + item.cube.size / 2;
              const maxB = 935 - item.cube.size / 2;
              if (updated[item.idx].x < minB) {
                updated[item.idx].x = minB;
                updated[item.idx].vx = Math.max(0, updated[item.idx].vx);
              }
              if (updated[item.idx].x > maxB) {
                updated[item.idx].x = maxB;
                updated[item.idx].vx = Math.min(0, updated[item.idx].vx);
              }
            }

            // Resolve mutual overlap pushes
            for (let i = 0; i < layerIndices.length - 1; i++) {
              const item1 = layerIndices[i];
              const item2 = layerIndices[i + 1];
              const c1 = updated[item1.idx];
              const c2 = updated[item2.idx];

              const minGap = (c1.size + c2.size) * 0.48;
              const dist = c2.x - c1.x;

              if (dist < minGap) {
                const overlap = minGap - dist;
                updated[item1.idx].x -= overlap * 0.52;
                updated[item2.idx].x += overlap * 0.52;

                const tempVx = updated[item1.idx].vx;
                updated[item1.idx].vx = updated[item1.idx].vx * 0.2 - overlap * 0.05;
                updated[item2.idx].vx = tempVx * 0.2 + overlap * 0.05;
                
                updated[item1.idx].vrot -= overlap * 0.3;
                updated[item2.idx].vrot += overlap * 0.3;
              }
            }
          }
        });

        return updated;
      });

      frameId = requestAnimationFrame(runSimulationLoop);
    };

    frameId = requestAnimationFrame(runSimulationLoop);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Spawn visual splash bubble/droplets when the water level rises (clicked "+1")
  useEffect(() => {
    if (progress > lastProgressRef.current) {
      const newParticles: SplashParticle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: 200 + Math.random() * 600,
        y: currentY,
        vx: (Math.random() - 0.5) * 14,
        vy: -7 - Math.random() * 11,
        radius: 4 + Math.random() * 6,
      }));

      setSplashes(prev => [...prev, ...newParticles]);

      // Physics loop for particles
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
                vy: p.vy + 0.48,
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

  // Calculations for organic sloshing waves
  const angleRad = (smoothTilt * Math.PI) / 180;
  const leftY = currentY + 500 * Math.sin(angleRad);
  const rightY = currentY - 500 * Math.sin(angleRad);

  const waveCycle1 = Math.sin(time * 0.04) * 8;
  const waveCycle2 = Math.cos(time * 0.05) * 7;

  const foregroundWaterPath = `
    M 0,${leftY + waveCycle1}
    C 250,${leftY + (rightY - leftY) * 0.25 + waveCycle1 + 8}
      750,${rightY - (rightY - leftY) * 0.25 + waveCycle2 - 8}
      1000,${rightY + waveCycle2}
    L 1000,2000
    L 0,2000
    Z
  `;

  const leftYBack = (currentY - 18) + 500 * Math.sin(angleRad * 0.88);
  const rightYBack = (currentY - 18) - 500 * Math.sin(angleRad * 0.88);
  const waveCycleBack = Math.cos(time * 0.03) * 9;

  const backgroundWaterPath = `
    M 0,${leftYBack + waveCycleBack}
    C 280,${leftYBack + (rightYBack - leftYBack) * 0.28 + waveCycleBack + 4}
      720,${rightYBack - (rightYBack - leftYBack) * 0.28 + waveCycleBack - 4}
      1000,${rightYBack - waveCycleBack}
    L 1000,2000
    L 0,2000
    Z
  `;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 select-none overflow-hidden w-full h-full">
      <AnimatePresence>
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
              {/* Immersive high-end glass and water linear gradients */}
              <linearGradient id="screen-water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.88" />
                <stop offset="35%" stopColor="#0EA5E9" stopOpacity="0.94" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.98" />
              </linearGradient>

              <linearGradient id="screen-water-back-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.65" />
              </linearGradient>

              {/* Ambient glow highlight gradient for the liquid surface */}
              <linearGradient id="screen-surface-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.0" />
              </linearGradient>

              {/* Modern Frosted Glossy Glass Ice Cube Gradients */}
              <linearGradient id="ice-cube-glass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="30%" stopColor="#E0F2FE" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#BAE6FD" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.75" />
              </linearGradient>

              <linearGradient id="ice-inner-glow" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 1. LOWER PARALLAX BACKGROUND WATER LAYER */}
            <path
              d={backgroundWaterPath}
              fill="url(#screen-water-back-grad)"
            />

            {/* 2. SPLASH PARTICLES */}
            {splashes.map(p => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={p.radius}
                fill="#E0F2FE"
                fillOpacity="0.85"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />
            ))}

            {/* 3. DYNAMIC FOREGROUND WATER BODY LAYER */}
            <path
              d={foregroundWaterPath}
              fill="url(#screen-water-gradient)"
            />

            {/* 4. SURFACE GLOW AMBIENT HIGHLIGHT */}
            <path
              d={foregroundWaterPath}
              fill="url(#screen-surface-glow)"
              opacity="0.3"
            />

            {/* 5. GORGEOUS GLOSSY GLASS ICE CUBES WITH PHYSICS TILT STACKING */}
            {iceCubes.map(cube => {
              const surfaceYAtX = currentY + (cube.x - 500) * Math.sin(angleRad);
              const bobbing = Math.sin(time * cube.floatSpeed + cube.floatPhase) * 6;
              
              let renderY = currentY;

              if (cube.layer === 'top') {
                renderY = surfaceYAtX + bobbing - (cube.size * 0.28);
              } else if (cube.layer === 'middle') {
                const spaceBelowSurface = 1000 - surfaceYAtX;
                renderY = surfaceYAtX + (spaceBelowSurface * 0.38) + bobbing;
              } else {
                renderY = 938 + (bobbing * 0.2);
              }

              renderY = Math.max(renderY, currentY - cube.size * 0.4);

              return (
                <g
                  key={cube.id}
                  transform={`translate(${cube.x}, ${renderY}) rotate(${cube.rot})`}
                >
                  {/* Real soft background projection drop shadow for glass material */}
                  <rect
                    x={-cube.size / 2}
                    y={-cube.size / 2}
                    width={cube.size}
                    height={cube.size}
                    rx={cube.size * 0.28}
                    ry={cube.size * 0.28}
                    fill="#0284C7"
                    opacity="0.14"
                    transform="translate(2, 4)"
                  />

                  {/* Glass Glossy Body */}
                  <rect
                    x={-cube.size / 2}
                    y={-cube.size / 2}
                    width={cube.size}
                    height={cube.size}
                    rx={cube.size * 0.28}
                    ry={cube.size * 0.28}
                    fill="url(#ice-cube-glass)"
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeOpacity="0.85"
                    strokeLinejoin="round"
                  />

                  {/* 3D Glass Depth Inner Glow */}
                  <rect
                    x={-cube.size / 2 + 1.5}
                    y={-cube.size / 2 + 1.5}
                    width={cube.size - 3}
                    height={cube.size - 3}
                    rx={cube.size * 0.24}
                    ry={cube.size * 0.24}
                    fill="url(#ice-inner-glow)"
                    pointerEvents="none"
                  />

                  {/* Refractive Inner Glossy Facets */}
                  <path
                    d={`M ${-cube.size * 0.28} ${cube.size * 0.2} L ${cube.size * 0.2} ${cube.size * 0.2} L ${cube.size * 0.2} ${-cube.size * 0.28}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                  />

                  {/* Glossy Upper Left Highlight Arc */}
                  <path
                    d={`M ${-cube.size * 0.35} ${-cube.size * 0.1} A ${cube.size * 0.25} ${cube.size * 0.25} 0 0 1 ${-cube.size * 0.1} ${-cube.size * 0.35}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.9"
                  />

                  {/* Extra Linear Glass Highlight */}
                  <path
                    d={`M ${-cube.size * 0.38} ${-cube.size * 0.22} L ${-cube.size * 0.22} ${-cube.size * 0.38}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.75"
                  />

                  {/* Soft Internal Frozen Air Bubbles */}
                  <circle cx={-cube.size * 0.15} cy={cube.size * 0.1} r={cube.size * 0.05} fill="#FFFFFF" fillOpacity="0.75" />
                  <circle cx={cube.size * 0.18} cy={-cube.size * 0.12} r={cube.size * 0.03} fill="#FFFFFF" fillOpacity="0.85" />
                </g>
              );
            })}
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

ScreenWater.displayName = 'ScreenWater';
