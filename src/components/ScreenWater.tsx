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

  // We map progress 0 to 880 (instead of 1000) so there is always a visible sloshing level of water and ice cubes at the bottom!
  // When progress = 0: currentY is 880 (leaving a pleasant footer base of sloshing blue water)
  // When progress = 1: currentY is 80 (fully filling the screen)
  const currentY = 880 - (progress * 800);

  // Initialize 5 cartoon ice cubes distributed across 3 depth levels as requested:
  // Clustered around the center (400-600) to move freely and stack nicely
  const [iceCubes, setIceCubes] = useState<CartoonIceCube[]>(() => {
    const layers: { layer: 'top' | 'middle' | 'bottom'; homeX: number; size: number }[] = [
      // Top floaters
      { layer: 'top', homeX: 450, size: 68 },
      { layer: 'top', homeX: 540, size: 72 },
      // Mid drifters (suspended inside water depth)
      { layer: 'middle', homeX: 420, size: 62 },
      { layer: 'middle', homeX: 560, size: 65 },
      // Bottom sinkers (heavy glass slide/clatter on screen bottom floor)
      { layer: 'bottom', homeX: 490, size: 78 }
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

  // Device orientation capture (with desktop hover cursor fallback)
  useEffect(() => {
    let active = true;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!active) return;
      if (e.gamma !== null) {
        // Hyper-subtle tilt clamp - max 3 degrees left/right for an organic vibe
        const clamped = Math.max(-3, Math.min(3, e.gamma));
        setTilt(clamped);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!active) return;
      // desktop cursor fallback translates coordinate ratio beautifully
      const ratio = (e.clientX / window.innerWidth) - 0.5; // [-0.5, 0.5]
      setTilt(ratio * 5); // tilt by up to [-2.5, 2.5] degrees for a premium stable look
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
  // Handles floating water lag, splash particles, and the 3-layer ice cube physics
  const [time, setTime] = useState(0);
  useEffect(() => {
    let active = true;
    let frameId: number;

    const runSimulationLoop = () => {
      if (!active) return;
      
      // 1. Update global physics render clock
      setTime(prev => prev + 1);

      // 2. Smoothly interpolate physical tilt values using Spring Inertia (avoids quick shifts/paper feel)
      setSmoothTilt(prev => {
        const diff = tilt - prev;
        return prev + diff * 0.04; // Custom liquid sloshing wave factor for hyper-smooth realism
      });

      // 3. Solve 3-layer Ice Cube sliding physics, collisions, and screen-edge constraint formulas
      setIceCubes(prevCubes => {
        // Step A: Apply sliding friction & gravitational forces based on the current smooth ocean slope
        let updated = prevCubes.map(cube => {
          // Slide acceleration multiplier dependent on depth characteristics:
          // - Bottom sliding sinkers move rapidly & slip easily
          // - Top surface floating cubes drift responsively with waves
          // - Middle dense water-suspended cubes slide slower with drag resistance
          let gravityMult = 0.45;
          if (cube.layer === 'bottom') gravityMult = 0.72;
          if (cube.layer === 'middle') gravityMult = 0.22;

          const gravityAcc = smoothTilt * gravityMult;

          // Spring returns cubes smoothly back toward "homeX" when device returns portrait flat
          // Decreases force during high tilts to let ice cubes pile and stack fully together
          const tiltFactor = Math.max(0, 1 - Math.abs(smoothTilt) / 12);
          const springFactor = cube.layer === 'middle' ? 0.008 : 0.015;
          const springRestor = (cube.homeX - cube.x) * springFactor * (0.15 + tiltFactor * 0.85);

          const netForce = gravityAcc + springRestor;

          // Calculate next velocity
          let nextVx = cube.vx + netForce;
          
          // Apply friction coefficient mimicking viscous liquid resistance
          let friction = 0.88;
          if (cube.layer === 'middle') friction = 0.78; // heavy fluid dampening
          if (cube.layer === 'bottom') friction = 0.92; // smooth bottom slipping glass
          nextVx *= friction;

          // Align rotation inertia to sliding velocity
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

        // Step B: Resolve collision stacking overlays INDEPENDENTLY inside each depth layer segment
        // This stops top floating cubes from colliding with bottom sinkers, creating awesome depth stacks!
        const layers: ('top' | 'middle' | 'bottom')[] = ['top', 'middle', 'bottom'];
        
        layers.forEach(lyr => {
          // Extract indices for this layer
          const layerIndices = updated
            .map((c, i) => ({ cube: c, idx: i }))
            .filter(item => item.cube.layer === lyr);

          // Sort index elements from Left to Right position
          layerIndices.sort((a, b) => a.cube.x - b.cube.x);

          // Iterate to solve overlap collisions beautifully to stack on themselves
          for (let pass = 0; pass < 5; pass++) {
            // Apply bounds first
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

              // Stack boundary separation scale
              const minGap = (c1.size + c2.size) * 0.48;
              const dist = c2.x - c1.x;

              if (dist < minGap) {
                const overlap = minGap - dist;
                // Move apart symmetrically
                updated[item1.idx].x -= overlap * 0.52;
                updated[item2.idx].x += overlap * 0.52;

                // Transfer velocity bounce momentum
                const tempVx = updated[item1.idx].vx;
                updated[item1.idx].vx = updated[item1.idx].vx * 0.2 - overlap * 0.05;
                updated[item2.idx].vx = tempVx * 0.2 + overlap * 0.05;
                
                // Add animated tilt rolling clatter rotation
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
  }, [tilt, smoothTilt]);

  // Spawn visual splash bubble/droplets when the water level rises (clicked "+1")
  useEffect(() => {
    if (progress > lastProgressRef.current) {
      const newParticles: SplashParticle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: 200 + Math.random() * 600, // beautiful even screen distribution
        y: currentY,
        vx: (Math.random() - 0.5) * 14,
        vy: -7 - Math.random() * 11, // Upward splash propulsion
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
                vy: p.vy + 0.48, // Gravity force pulling down
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

  // Calculations for organic sloshing waves keeping borders clean & locked (No Paper tilting!)
  const angleRad = (smoothTilt * Math.PI) / 180;
  
  // Left and right fluid height levels in viewport coordinates
  // Width of container is 1000. Left edge is X=0, right edge is X=1000. Center is 500.
  const leftY = currentY + 500 * Math.sin(angleRad);
  const rightY = currentY - 500 * Math.sin(angleRad);

  // Dynamic wave bobbing patterns over time
  const waveCycle1 = Math.sin(time * 0.04) * 8;
  const waveCycle2 = Math.cos(time * 0.05) * 7;

  // Foreground liquid surface path with responsive bezier waves matching the container boundaries
  // Locked perfectly to the vertical left & right margins (0 and 1000), preventing paper rotating boundaries
  const foregroundWaterPath = `
    M 0,${leftY + waveCycle1}
    C 250,${leftY + (rightY - leftY) * 0.25 + waveCycle1 + 8}
      750,${rightY - (rightY - leftY) * 0.25 + waveCycle2 - 8}
      1000,${rightY + waveCycle2}
    L 1000,2000
    L 0,2000
    Z
  `;

  // Secondary volumetric background parallax slosh curve
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

  // Determine whether to display the sloshing liquid
  const isVisible = true;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 select-none overflow-hidden w-full h-full">
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
                {/* Immersive high-end glass and water linear gradients */}
                <linearGradient id="screen-water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.88" /> {/* Electric cyan surface */}
                  <stop offset="35%" stopColor="#0EA5E9" stopOpacity="0.94" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.98" /> {/* Deep ocean navy bottom */}
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

                {/* Vibrant cartoon style refractive ice cube gradient */}
                <linearGradient id="ice-cube-cartoon" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" /> {/* Crisp ice peak */}
                  <stop offset="25%" stopColor="#E0F2FE" />
                  <stop offset="75%" stopColor="#93C5FD" />
                  <stop offset="100%" stopColor="#38BDF8" /> {/* Cartoon blue shading */}
                </linearGradient>
              </defs>

              {/* 1. LOWER PARALLAX BACKGROUND WATER LAYER */}
              <path
                d={backgroundWaterPath}
                fill="url(#screen-water-back-grad)"
              />

              {/* 2. CHUNKY SPLASH PARTICLES SPLATERED DURING CLICKS */}
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

              {/* 5. GORGEOUSLY CONFIGURED CARTOON ICE CUBES WITH PHYSICS TILT STACKING */}
              {iceCubes.map(cube => {
                // Determine raw surface Y coordinate at our exact X coordinate
                const surfaceYAtX = currentY + (cube.x - 500) * Math.sin(angleRad);
                
                // Bobbing effects specific to each cube to increase playful organic movement
                const bobbing = Math.sin(time * cube.floatSpeed + cube.floatPhase) * 6;
                
                let renderY = currentY;

                if (cube.layer === 'top') {
                  // Floats on the moving wave surface, partially submerged
                  renderY = surfaceYAtX + bobbing - (cube.size * 0.28);
                } else if (cube.layer === 'middle') {
                  // Neutral buoyancy drifters midway inside water volume
                  const spaceBelowSurface = 1000 - surfaceYAtX;
                  renderY = surfaceYAtX + (spaceBelowSurface * 0.38) + bobbing;
                } else {
                  // Heavy sinkers resting at the floor level of the screen
                  renderY = 938 + (bobbing * 0.2);
                }

                // Make sure we clamp renderY so cubes don't float completely out of screen top water boundary
                renderY = Math.max(renderY, currentY - cube.size * 0.4);

                return (
                  <g
                    key={cube.id}
                    transform={`translate(${cube.x}, ${renderY}) rotate(${cube.rot})`}
                  >
                    {/* CARTOON BLOCK FRAME: Bold, thick physical outline for hand-drawn cartoon aesthetic */}
                    <rect
                      x={-cube.size / 2}
                      y={-cube.size / 2}
                      width={cube.size}
                      height={cube.size}
                      rx={cube.size * 0.22}
                      ry={cube.size * 0.22}
                      fill="url(#ice-cube-cartoon)"
                      stroke="#0F2A4A" // Solid cartoon dark navy ink stroke
                      strokeWidth="5"
                      strokeLinejoin="round"
                    />

                    {/* Cute cartoon frost cross-section facets and facets (for depth block appearance) */}
                    <path
                      d={`M ${-cube.size * 0.3} ${cube.size * 0.2} L ${cube.size * 0.25} ${cube.size * 0.25} L ${cube.size * 0.25} ${-cube.size * 0.3}`}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.65"
                    />

                    {/* Bold, bright glistening glossy highlight stroke in upper left corner */}
                    <path
                      d={`M ${-cube.size * 0.34} ${-cube.size * 0.12} A ${cube.size * 0.22} ${cube.size * 0.22} 0 0 1 ${-cube.size * 0.12} ${-cube.size * 0.34}`}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Cute tiny frozen air bubble sparkles inside the clear ice */}
                    <circle cx={-cube.size * 0.18} cy={cube.size * 0.08} r={cube.size * 0.07} fill="#FFFFFF" fillOpacity="0.6" />
                    <circle cx={cube.size * 0.15} cy={-cube.size * 0.15} r={cube.size * 0.05} fill="#FFFFFF" fillOpacity="0.85" />
                    <circle cx={cube.size * 0.1} cy={cube.size * 0.12} r={cube.size * 0.03} fill="#FFFFFF" fillOpacity="0.5" />
                  </g>
                );
              })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ScreenWater.displayName = 'ScreenWater';
