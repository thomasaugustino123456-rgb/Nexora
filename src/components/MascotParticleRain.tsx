import React, { useEffect, useRef } from "react";
import { vibrate } from "../lib/vibrate";

let particleAudioCtx: AudioContext | null = null;

function getParticleAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!particleAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      particleAudioCtx = new AudioCtx();
    }
  }
  if (particleAudioCtx && particleAudioCtx.state === "suspended") {
    particleAudioCtx.resume().catch(() => {});
  }
  return particleAudioCtx;
}

// Cooldown tracker for audio triggers to prevent sonic overloading
const lastSoundTimes = {
  coin: 0,
  leaf: 0,
  star: 0,
};

let lastVibrateTime = 0;

function triggerLightVibration() {
  const now = Date.now();
  if (now - lastVibrateTime < 60) return; // Prevent excessive buzzing frequencies
  lastVibrateTime = now;
  try {
    vibrate(6); // 6ms lightweight physical haptic feedback tick
  } catch (e) {
    console.warn("Vibration feedback failed:", e);
  }
}

// 🪙 Tiny high-pitch metal chime
function playTing() {
  try {
    const ctx = getParticleAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(2100, now + 0.04);
    
    // Low, safe volume that remains highly pleasant
    gainNode.gain.setValueAtTime(0.015, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {
    console.warn("Audio error (Coin):", e);
  }
}

// 🍃 Soft rustling wing/leaf breeze
function playWhoosh() {
  try {
    const ctx = getParticleAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.012, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    console.warn("Audio error (Leaf):", e);
  }
}

// ⭐ Magical cascading crystal sparkles
function playSparkle() {
  try {
    const ctx = getParticleAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const freqs = [1050, 1320, 1580, 2100];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.035);
      
      gainNode.gain.setValueAtTime(0, now + i * 0.035);
      gainNode.gain.linearRampToValueAtTime(0.01, now + i * 0.035 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.035 + 0.14);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + i * 0.035);
      osc.stop(now + i * 0.035 + 0.15);
    });
  } catch (e) {
    console.warn("Audio error (Star):", e);
  }
}

function playThrottledSound(type: "coin" | "leaf" | "star") {
  const now = Date.now();
  const cooldown = type === "leaf" ? 120 : type === "star" ? 150 : 80;
  if (now - lastSoundTimes[type] < cooldown) return;
  lastSoundTimes[type] = now;
  
  if (type === "coin") {
    playTing();
  } else if (type === "leaf") {
    playWhoosh();
  } else if (type === "star") {
    playSparkle();
  }
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "coin" | "star" | "leaf";
  size: number;
  rotation: number;
  rotationSpeed: number;
  
  // Custom interactive & physical telemetry
  swaySpeed: number;       // Swaying cycle speed
  swayOffset: number;      // Random sway phase start
  bounceCount: number;     // Bounces before rest
  restingObstacleIndex: number; // Index of the element it is resting on (-1 if none)
  isResting: boolean;      // True when sitting on the bottom floor
  restTimer: number;       // Frames remaining at rest
  maxRestTimer: number;    // Reference to initial resting limit
  opacity: number;         // Opacity for fade out
  scaleX: number;          // Width coefficient for spinning coins
  twinklePhase: number;    // Star shine frequency phase
  colorHue: number;        // Decorative hue shift for variety
}

interface Obstacle {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function MascotParticleRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const nextIdRef = useRef<number>(0);

  // Dynamic Horizontal Gravity / Tilt Factor
  const tiltXRef = useRef<number>(0);

  // Keep a reference to calculated DOM obstacles to avoid layout thrashing on every frame
  const obstaclesRef = useRef<Obstacle[]>([]);
  const frameCountRef = useRef<number>(0);

  // Handle device orientation on mobile & tablet
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null) {
        // Clamp gamma and map to normalized tilt force [-1.2, 1.2]
        const clampedGamma = Math.max(-60, Math.min(60, event.gamma));
        tiltXRef.current = clampedGamma / 45; // Lean magnitude
      }
    };

    // Fallback for desktop (tilt based on cursor position relative to screen center)
    const handleMouseMove = (event: MouseEvent) => {
      const screenWidth = window.innerWidth;
      const normalizedX = (event.clientX / screenWidth) * 2 - 1; // Map to [-1, 1]
      tiltXRef.current = normalizedX * 0.85;
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const updateObstacles = () => {
    const ids = ["metric-streak", "metric-xp", "metric-coins", "card-start-protocol"];
    const list: Obstacle[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          list.push({
            id,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          });
        }
      }
    });
    obstaclesRef.current = list;
  };

  const spawnParticles = () => {
    const width = window.innerWidth;
    const newParticles: Particle[] = [];

    // Query card/box positions immediately on spawn
    updateObstacles();

    // Adjusted quantity: Leaves to 15, Coins to 10, Stars (others) to 5
    const counts = { coin: 10, leaf: 15, star: 5 };

    (Object.keys(counts) as Array<"coin" | "star" | "leaf">).forEach((type) => {
      const qty = counts[type];
      for (let i = 0; i < qty; i++) {
        const startX = Math.random() * width;
        // Start above viewport
        const startY = -60 - Math.random() * 240;

        newParticles.push({
          id: nextIdRef.current++,
          x: startX,
          y: startY,
          vx: (Math.random() - 0.5) * 3, // Initial slight wind drift
          vy: type === "coin" ? 3 + Math.random() * 4 : type === "star" ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
          type,
          size: type === "coin" ? 24 + Math.random() * 6 : type === "leaf" ? 22 + Math.random() * 6 : 20 + Math.random() * 5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: type === "leaf" ? (Math.random() - 0.5) * 0.04 : (Math.random() - 0.5) * 0.12,
          swaySpeed: 0.015 + Math.random() * 0.03,
          swayOffset: Math.random() * Math.PI * 2,
          bounceCount: 0,
          restingObstacleIndex: -1,
          isResting: false,
          restTimer: 240 + Math.floor(Math.random() * 120), // 4 to 6 seconds standing time
          maxRestTimer: 360,
          opacity: 1.0,
          scaleX: 1.0,
          twinklePhase: Math.random() * Math.PI,
          colorHue: Math.floor(Math.random() * 10) - 5,
        });
      }
    });

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animationFrameIdRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    }
  };

  useEffect(() => {
    const handleTrigger = () => {
      spawnParticles();
    };

    window.addEventListener("trigger-mascot-celebration", handleTrigger);
    return () => {
      window.removeEventListener("trigger-mascot-celebration", handleTrigger);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  const renderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tiltX = tiltXRef.current;
    const horizontalWindForce = tiltX * 0.42;
    const phoneBottom = canvas.height - 24;

    // Periodically refresh card obstacle positions (every 15 frames) to stay in sync with layouts
    frameCountRef.current++;
    if (frameCountRef.current % 15 === 0) {
      updateObstacles();
    }

    const obstacles = obstaclesRef.current;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      const sizeOffset = p.size / 2;

      // 1. PHYSICAL UPDATES BASED ON STATE
      if (p.restingObstacleIndex !== -1) {
        // --- RESTING ON TOP OF STAT BOX CARD ---
        const obs = obstacles[p.restingObstacleIndex];
        if (!obs) {
          // Obstacle container disappeared, fall off
          p.restingObstacleIndex = -1;
        } else {
          // Slide horizontally on top of card if device is tilted
          p.y = obs.top - sizeOffset;
          p.vy = 0;

          if (Math.abs(tiltX) > 0.12) {
            p.vx += horizontalWindForce * 0.45;
            p.vx = Math.max(-6, Math.min(6, p.vx));
            p.x += p.vx;
            // Roll animation
            p.rotation += p.vx * 0.025;
            p.restTimer -= 1.0; // Decay faster when sliding
          } else {
            p.vx *= 0.85; // Settle
            p.x += p.vx;
          }

          // Slide off Left or Right edges!
          if (p.x < obs.left || p.x > obs.right) {
            p.restingObstacleIndex = -1; // Resume free fall
            p.isResting = false;
          }

          p.restTimer--;
          if (p.restTimer <= 65) {
            p.opacity = Math.max(0, p.restTimer / 65);
          }
        }
      } else if (p.isResting) {
        // --- RESTING ON PHONE FLOOR ---
        if (Math.abs(tiltX) > 0.15) {
          p.vx += horizontalWindForce * 0.5;
          p.vx = Math.max(-8, Math.min(8, p.vx));
          p.x += p.vx;
          p.rotation += p.vx * 0.02;
          p.restTimer -= 1.5;
        } else {
          p.vx *= 0.85;
          p.x += p.vx;
        }

        p.restTimer--;
        if (p.restTimer <= 65) {
          p.opacity = Math.max(0, p.restTimer / 65);
        }
      } else {
        // --- FREE FALL STATE ---
        p.vx += horizontalWindForce * 0.35;
        p.vx *= 0.98; // Air friction

        if (p.type === "leaf") {
          // LEAF: Lightweight fluttering gravity physics
          const leafGravity = 0.08;
          p.vy = Math.min(1.8, p.vy + leafGravity); // Slower fall speed cap
          const sway = Math.sin(Date.now() * p.swaySpeed + p.swayOffset);
          p.x += p.vx + sway * 1.5; // Beautiful swaying flutter
          p.y += p.vy;
          p.rotation += p.rotationSpeed * p.scaleX + sway * 0.012;
        } else if (p.type === "star") {
          // STAR: Twinkling moderate gravity
          const starGravity = 0.18;
          p.vy = Math.min(4.5, p.vy + starGravity);
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
        } else if (p.type === "coin") {
          // COIN: Heavyweight physical gravity
          const coinGravity = 0.34;
          p.vy = Math.min(8.0, p.vy + coinGravity); // Heavy metal drop
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          // Rotate 3D coin visual scale
          p.scaleX = Math.abs(Math.sin(Date.now() * 0.0075 + p.swayOffset));
        }

        // Screen Side wrapping
        if (p.x < -100) p.x = canvas.width + 50;
        if (p.x > canvas.width + 100) p.x = -50;

        // A. Collide with Top face of Card Box Obstacles
        let hitCard = false;
        for (let idx = 0; idx < obstacles.length; idx++) {
          const obs = obstacles[idx];
          if (p.x >= obs.left && p.x <= obs.right) {
            const nextY = p.y + p.vy;
            // Detect if falling bottom edge crosses obstacle top face
            if (p.y + sizeOffset <= obs.top + 4 && nextY + sizeOffset >= obs.top - 4) {
              hitCard = true;
              if (p.type === "coin") {
                if (p.bounceCount < 3) {
                  // HEAVY COIN BOUNCING: elastic collision
                  p.y = obs.top - sizeOffset;
                  p.vy = -Math.abs(p.vy) * 0.45;
                  p.vx += (Math.random() - 0.5) * 2.2;
                  p.bounceCount++;
                  playThrottledSound("coin");
                  triggerLightVibration();
                } else {
                  // Settle on card
                  p.y = obs.top - sizeOffset;
                  p.vy = 0;
                  p.vx = 0;
                  p.restingObstacleIndex = idx;
                  playThrottledSound("coin");
                  triggerLightVibration();
                }
              } else if (p.type === "star") {
                if (p.bounceCount < 1) {
                  p.y = obs.top - sizeOffset;
                  p.vy = -Math.abs(p.vy) * 0.32;
                  p.bounceCount++;
                  playThrottledSound("star");
                  triggerLightVibration();
                } else {
                  p.y = obs.top - sizeOffset;
                  p.vy = 0;
                  p.vx = 0;
                  p.restingObstacleIndex = idx;
                  playThrottledSound("star");
                  triggerLightVibration();
                }
              } else {
                // Leaf settles gently with zero bouncing
                p.y = obs.top - sizeOffset;
                p.vy = 0;
                p.vx = 0;
                p.restingObstacleIndex = idx;
                playThrottledSound("leaf");
                triggerLightVibration();
              }
              break; // exit obstaclegrid checks
            }
          }
        }

        // B. Collide with screen floor
        if (!hitCard && p.y >= phoneBottom - sizeOffset) {
          p.y = phoneBottom - sizeOffset;

          if (p.type === "coin" && p.bounceCount < 3) {
            // High quality elastic bounce simulation on floor
            p.vy = -Math.abs(p.vy) * 0.44;
            p.vx += (Math.random() - 0.5) * 2.0;
            p.bounceCount++;
            playThrottledSound("coin");
            triggerLightVibration();
          } else if (p.type === "star" && p.bounceCount < 1) {
            p.vy = -Math.abs(p.vy) * 0.28;
            p.bounceCount++;
            playThrottledSound("star");
            triggerLightVibration();
          } else {
            p.isResting = true;
            p.vy = 0;
            p.vx = 0;
            playThrottledSound(p.type);
            triggerLightVibration();
          }
        }
      }

      // Filter out vanished/deleted particles
      if (p.x < -p.size || p.x > canvas.width + p.size || p.opacity <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      // 2. STICKER GRAPHICS RENDERING (Apple Sticker die-cut style)
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === "coin") {
        ctx.scale(p.scaleX, 1.0);

        // A. 3D Hard Shadow for premium sticker look
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 5;
        ctx.shadowOffsetX = 1;

        // B. Die-cut white border
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Turn off shadows for interior styling
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowOffsetX = 0;

        // C. Shiny gold metallic gradient
        const coinGrad = ctx.createRadialGradient(-p.size * 0.12, -p.size * 0.12, p.size * 0.05, 0, 0, p.size * 0.52);
        coinGrad.addColorStop(0, "#FFE875");  // reflective gold center
        coinGrad.addColorStop(0.5, "#F59E0B"); // warm golden body
        coinGrad.addColorStop(1, "#B45309");   // dark brass rim accent

        ctx.fillStyle = coinGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.52, 0, Math.PI * 2);
        ctx.fill();

        // D. Embossed inner leaf stamp
        ctx.strokeStyle = "rgba(255, 232, 117, 0.95)";
        ctx.lineWidth = p.size * 0.055;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        // Central Embossed Currency Dollar/Gold Star Symbol
        ctx.fillStyle = "#FFE875";
        drawStarPath(ctx, 0, 0, 5, p.size * 0.22, p.size * 0.1);
        ctx.fill();

        // E. Laminated Gloss reflection arc overlay
        ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.52, Math.PI * 1.0, Math.PI * 1.8);
        ctx.quadraticCurveTo(p.size * 0.25, -p.size * 0.25, -p.size * 0.52, 0);
        ctx.closePath();
        ctx.fill();

      } else if (p.type === "leaf") {
        // A. 3D Hard Shadow for leaf sticker
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 4;
        ctx.shadowOffsetX = 1;

        // B. Pure white die-cut silhouette border (padded)
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.65);
        ctx.quadraticCurveTo(-p.size * 0.55, -p.size * 0.12, 0, p.size * 0.58);
        ctx.quadraticCurveTo(p.size * 0.55, -p.size * 0.12, 0, -p.size * 0.65);
        ctx.closePath();
        ctx.fill();

        // Turn off shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowOffsetX = 0;

        // C. Rich botanical leaf body gradient
        const leafGrad = ctx.createLinearGradient(0, -p.size * 0.5, 0, p.size * 0.5);
        leafGrad.addColorStop(0, "#8FB339");  // Warm spring lime
        leafGrad.addColorStop(0.4, "#4ADE80"); // Radiant green
        leafGrad.addColorStop(1, "#059669");   // Saturated jade shade

        ctx.fillStyle = leafGrad;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.56);
        ctx.quadraticCurveTo(-p.size * 0.44, -p.size * 0.1, 0, p.size * 0.48);
        ctx.quadraticCurveTo(p.size * 0.44, -p.size * 0.1, 0, -p.size * 0.56);
        ctx.closePath();
        ctx.fill();

        // D. Intricate leafy veins
        ctx.strokeStyle = "rgba(217, 249, 157, 0.85)";
        ctx.lineWidth = p.size * 0.08;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.4);
        ctx.lineTo(0, p.size * 0.32);
        ctx.stroke();

        // E. High quality gloss reflection
        ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.56);
        ctx.quadraticCurveTo(-p.size * 0.34, -p.size * 0.1, 0, p.size * 0.4);
        ctx.quadraticCurveTo(-p.size * 0.18, -p.size * 0.1, 0, -p.size * 0.56);
        ctx.closePath();
        ctx.fill();

      } else if (p.type === "star") {
        // A. Star sticker drop-shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.13)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 4;
        ctx.shadowOffsetX = 1;

        // B. Solid white star sticker border
        ctx.fillStyle = "#FFFFFF";
        drawStarPath(ctx, 0, 0, 5, p.size * 0.6, p.size * 0.28);
        ctx.fill();

        // Turn off shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowOffsetX = 0;

        // C. Bright neon-candy sunset gradient
        const starGrad = ctx.createLinearGradient(-p.size * 0.45, -p.size * 0.45, p.size * 0.45, p.size * 0.45);
        starGrad.addColorStop(0, "#F59E0B"); // Warm honey orange
        starGrad.addColorStop(0.5, "#EC4899"); // Premium candy pink
        starGrad.addColorStop(1, "#3B82F6");   // High-voltage electric blue

        ctx.fillStyle = starGrad;
        drawStarPath(ctx, 0, 0, 5, p.size * 0.5, p.size * 0.23);
        ctx.fill();

        // D. Laminated specular glares
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(-p.size * 0.12, -p.size * 0.12, p.size * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (particlesRef.current.length > 0) {
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    } else {
      animationFrameIdRef.current = null;
    }
  };

  const drawStarPath = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        updateObstacles();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[500]"
      style={{ mixBlendMode: "normal" }} // Change blend mode to allow clear rendering of solid borders and shadows!
    />
  );
}
