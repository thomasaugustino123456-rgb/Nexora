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
  if (now - lastVibrateTime < 50) return; // Prevent excessive buzzing frequencies
  lastVibrateTime = now;
  try {
    vibrate(6); // 6ms lightweight physical haptic feedback tick
  } catch (e) {
    console.warn("Vibration feedback failed:", e);
  }
}

// 🪙 High-pitch crisp metallic chime with frequency pitch shift
function playTing() {
  try {
    const ctx = getParticleAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    const randomPitch = 1350 + Math.random() * 300;
    osc.type = "sine";
    osc.frequency.setValueAtTime(randomPitch, now);
    osc.frequency.exponentialRampToValueAtTime(randomPitch * 1.45, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.14);
  } catch (e) {
    console.warn("Audio error (Coin):", e);
  }
}

// 🍃 Soft rustling organic leaf breeze
function playWhoosh() {
  try {
    const ctx = getParticleAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140 + Math.random() * 40, now);
    osc.frequency.linearRampToValueAtTime(260 + Math.random() * 60, now + 0.18);
    
    gainNode.gain.setValueAtTime(0.015, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.22);
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
      osc.frequency.setValueAtTime(freq + Math.random() * 100, now + i * 0.03);
      
      gainNode.gain.setValueAtTime(0, now + i * 0.03);
      gainNode.gain.linearRampToValueAtTime(0.012, now + i * 0.03 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.16);
    });
  } catch (e) {
    console.warn("Audio error (Star):", e);
  }
}

function playThrottledSound(type: "coin" | "leaf" | "star") {
  const now = Date.now();
  const cooldown = type === "leaf" ? 100 : type === "star" ? 120 : 70;
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

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
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
  
  // Custom 3D & physical mechanics
  swaySpeed: number;
  swayOffset: number;
  pitchAngle: number;
  pitchSpeed: number;
  bounceCount: number;
  restingObstacleIndex: number;
  isResting: boolean;
  restTimer: number;
  maxRestTimer: number;
  opacity: number;
  scaleX: number;
  twinklePhase: number;
  colorVariant: number;
  trail: TrailPoint[];
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

  // User Pointer Position for interactive push force
  const pointerRef = useRef<{ x: number; y: number; active: boolean; lastPush: number }>({
    x: -999,
    y: -999,
    active: false,
    lastPush: 0,
  });

  // Keep a reference to calculated DOM obstacles
  const obstaclesRef = useRef<Obstacle[]>([]);
  const frameCountRef = useRef<number>(0);

  // Handle device orientation on mobile & desktop pointer
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null) {
        const clampedGamma = Math.max(-60, Math.min(60, event.gamma));
        tiltXRef.current = clampedGamma / 45;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const screenWidth = window.innerWidth;
      const normalizedX = (event.clientX / screenWidth) * 2 - 1;
      tiltXRef.current = normalizedX * 0.85;

      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      pointerRef.current.active = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        pointerRef.current.x = event.touches[0].clientX;
        pointerRef.current.y = event.touches[0].clientY;
        pointerRef.current.active = true;
      }
    };

    const handlePointerEnd = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handlePointerEnd);
    window.addEventListener("mouseup", handlePointerEnd);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handlePointerEnd);
      window.removeEventListener("mouseup", handlePointerEnd);
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

  const spawnParticles = (originRect?: DOMRect) => {
    const width = window.innerWidth;
    const newParticles: Particle[] = [];

    updateObstacles();

    // Balanced item counts: 14 leaves, 12 coins, 8 XP badges
    const counts = { coin: 12, leaf: 14, star: 8 };

    const hasOrigin = originRect && originRect.width > 0;
    const originX = hasOrigin ? originRect.left + originRect.width / 2 : width / 2;
    const originY = hasOrigin ? originRect.top + originRect.height / 2 : -40;

    (Object.keys(counts) as Array<"coin" | "star" | "leaf">).forEach((type) => {
      const qty = counts[type];
      for (let i = 0; i < qty; i++) {
        let startX: number;
        let startY: number;
        let vx: number;
        let vy: number;

        if (hasOrigin) {
          // Explosive fountain burst outward from logo
          startX = originX + (Math.random() - 0.5) * 20;
          startY = originY + (Math.random() - 0.5) * 20;
          const spreadAngle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8; // Upward fan arc
          const speed = type === "coin" 
            ? 7 + Math.random() * 8 
            : type === "star" 
            ? 5 + Math.random() * 7 
            : 3.5 + Math.random() * 5.5;
          vx = Math.cos(spreadAngle) * speed;
          vy = Math.sin(spreadAngle) * speed;
        } else {
          // Standard top-screen rain shower
          startX = Math.random() * width;
          startY = -60 - Math.random() * 200;
          vx = (Math.random() - 0.5) * 3;
          vy = type === "coin" ? 3 + Math.random() * 4 : type === "star" ? 2 + Math.random() * 3 : 1 + Math.random() * 2;
        }

        newParticles.push({
          id: nextIdRef.current++,
          x: startX,
          y: startY,
          vx,
          vy,
          type,
          size: type === "coin" ? 26 + Math.random() * 6 : type === "leaf" ? 26 + Math.random() * 7 : 24 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: type === "leaf" ? (Math.random() - 0.5) * 0.05 : (Math.random() - 0.5) * 0.14,
          swaySpeed: 0.018 + Math.random() * 0.03,
          swayOffset: Math.random() * Math.PI * 2,
          pitchAngle: Math.random() * Math.PI,
          pitchSpeed: 0.04 + Math.random() * 0.06,
          bounceCount: 0,
          restingObstacleIndex: -1,
          isResting: false,
          restTimer: 240 + Math.floor(Math.random() * 120),
          maxRestTimer: 360,
          opacity: 1.0,
          scaleX: 1.0,
          twinklePhase: Math.random() * Math.PI * 2,
          colorVariant: Math.floor(Math.random() * 3),
          trail: [],
        });
      }
    });

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animationFrameIdRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    }
  };

  useEffect(() => {
    const handleTrigger = (event: Event) => {
      const customEvent = event as CustomEvent;
      const rect = customEvent.detail?.rect as DOMRect | undefined;
      spawnParticles(rect);
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

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = displayWidth + "px";
      canvas.style.height = displayHeight + "px";
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const tiltX = tiltXRef.current;
    const horizontalWindForce = tiltX * 0.45;
    const phoneBottom = displayHeight - 24;

    frameCountRef.current++;
    if (frameCountRef.current % 15 === 0) {
      updateObstacles();
    }

    const obstacles = obstaclesRef.current;
    const ptr = pointerRef.current;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      const sizeOffset = p.size / 2;

      // --- Interactive Pointer Impulse Push ---
      if (ptr.active) {
        const dx = p.x - ptr.x;
        const dy = p.y - ptr.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 95;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * 3.5;
          const nx = dx / dist;
          const ny = dy / dist;
          p.vx += nx * force;
          p.vy += ny * force;
          p.isResting = false;
          p.restingObstacleIndex = -1;

          const now = Date.now();
          if (now - ptr.lastPush > 80) {
            ptr.lastPush = now;
            playThrottledSound(p.type);
            triggerLightVibration();
          }
        }
      }

      // 1. PHYSICAL UPDATES BASED ON STATE
      if (p.restingObstacleIndex !== -1) {
        // --- RESTING ON TOP OF STAT BOX CARD ---
        const obs = obstacles[p.restingObstacleIndex];
        if (!obs) {
          p.restingObstacleIndex = -1;
        } else {
          p.y = obs.top - sizeOffset;
          p.vy = 0;

          if (Math.abs(tiltX) > 0.12) {
            p.vx += horizontalWindForce * 0.45;
            p.vx = Math.max(-6, Math.min(6, p.vx));
            p.x += p.vx;
            p.rotation += p.vx * 0.025;
            p.restTimer -= 1.0;
          } else {
            p.vx *= 0.85;
            p.x += p.vx;
          }

          if (p.x < obs.left || p.x > obs.right) {
            p.restingObstacleIndex = -1;
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
        p.vx *= 0.985; // Air friction

        if (p.type === "leaf") {
          // LEAF: Natural fluttering air buoyancy
          const leafGravity = 0.09;
          p.vy = Math.min(2.2, p.vy + leafGravity);
          const sway = Math.sin(Date.now() * p.swaySpeed + p.swayOffset);
          p.x += p.vx + sway * 1.8;
          p.y += p.vy;
          p.rotation += p.rotationSpeed * p.scaleX + sway * 0.015;
          p.pitchAngle += p.pitchSpeed;
        } else if (p.type === "star") {
          // STAR / XP BADGE: Energetic physics
          const starGravity = 0.22;
          p.vy = Math.min(5.2, p.vy + starGravity);
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.twinklePhase += 0.08;

          // Motion trail for fast XP badges
          if (Math.hypot(p.vx, p.vy) > 3.0 && Math.random() < 0.4) {
            p.trail.push({ x: p.x, y: p.y, opacity: 0.8 });
            if (p.trail.length > 5) p.trail.shift();
          }
        } else if (p.type === "coin") {
          // COIN: Heavyweight 3D metallic drop
          const coinGravity = 0.38;
          p.vy = Math.min(8.5, p.vy + coinGravity);
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          // Smooth 3D Coin Rotation calculation
          p.scaleX = Math.cos(Date.now() * 0.008 + p.swayOffset);
        }

        // Screen Side wrapping
        if (p.x < -100) p.x = displayWidth + 50;
        if (p.x > displayWidth + 100) p.x = -50;

        // Obstacle Collisions
        let hitCard = false;
        for (let idx = 0; idx < obstacles.length; idx++) {
          const obs = obstacles[idx];
          if (p.x >= obs.left && p.x <= obs.right) {
            const nextY = p.y + p.vy;
            if (p.y + sizeOffset <= obs.top + 4 && nextY + sizeOffset >= obs.top - 4) {
              hitCard = true;
              if (p.type === "coin") {
                if (p.bounceCount < 3) {
                  p.y = obs.top - sizeOffset;
                  p.vy = -Math.abs(p.vy) * 0.46;
                  p.vx += (Math.random() - 0.5) * 2.5;
                  p.bounceCount++;
                  playThrottledSound("coin");
                  triggerLightVibration();
                } else {
                  p.y = obs.top - sizeOffset;
                  p.vy = 0;
                  p.vx = 0;
                  p.restingObstacleIndex = idx;
                  playThrottledSound("coin");
                  triggerLightVibration();
                }
              } else if (p.type === "star") {
                if (p.bounceCount < 2) {
                  p.y = obs.top - sizeOffset;
                  p.vy = -Math.abs(p.vy) * 0.35;
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
                p.y = obs.top - sizeOffset;
                p.vy = 0;
                p.vx = 0;
                p.restingObstacleIndex = idx;
                playThrottledSound("leaf");
                triggerLightVibration();
              }
              break;
            }
          }
        }

        // Screen Floor Collision
        if (!hitCard && p.y >= phoneBottom - sizeOffset) {
          p.y = phoneBottom - sizeOffset;

          if (p.type === "coin" && p.bounceCount < 3) {
            p.vy = -Math.abs(p.vy) * 0.44;
            p.vx += (Math.random() - 0.5) * 2.2;
            p.bounceCount++;
            playThrottledSound("coin");
            triggerLightVibration();
          } else if (p.type === "star" && p.bounceCount < 2) {
            p.vy = -Math.abs(p.vy) * 0.30;
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

      // Filter out vanished particles
      if (p.x < -p.size || p.x > displayWidth + p.size || p.opacity <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      // --- RENDERING PARTICLE GRAPHICS ---

      // Render Motion Trails for XP Stars
      if (p.type === "star" && p.trail.length > 0) {
        for (let t = 0; t < p.trail.length; t++) {
          const pt = p.trail[t];
          pt.opacity -= 0.12;
          if (pt.opacity <= 0) continue;
          ctx.save();
          ctx.globalAlpha = pt.opacity * p.opacity * 0.5;
          ctx.fillStyle = "#F59E0B";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (p.size * 0.18) * (t / p.trail.length), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        p.trail = p.trail.filter((pt) => pt.opacity > 0);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === "coin") {
        // ==========================================
        // 🪙 HIGH DEFINITION 3D GOLDEN COIN
        // ==========================================
        const absScaleX = Math.max(0.12, Math.abs(p.scaleX));
        ctx.scale(p.scaleX, 1.0);

        // A. Drop Shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 6;

        // B. 3D Side Rim Edge Thickness when coin spins side-on
        if (absScaleX < 0.88) {
          const rimWidth = (1 - absScaleX) * 7;
          ctx.fillStyle = "#78350F"; // Polished bronze/brass side rim
          ctx.beginPath();
          ctx.arc(rimWidth * (p.scaleX > 0 ? 0.3 : -0.3), 0, p.size * 0.58, 0, Math.PI * 2);
          ctx.fill();
        }

        // C. Crisp White Die-Cut Outer Frame
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.58, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = "transparent";

        // D. Rich Multi-Stage Gold Gradient
        const coinGrad = ctx.createRadialGradient(-p.size * 0.15, -p.size * 0.15, p.size * 0.05, 0, 0, p.size * 0.52);
        coinGrad.addColorStop(0, "#FFFBEB");  // Ultra-bright specular core
        coinGrad.addColorStop(0.3, "#FCD34D"); // Warm gold body
        coinGrad.addColorStop(0.7, "#F59E0B"); // Deep golden amber
        coinGrad.addColorStop(1, "#B45309");   // Polished bronze outer rim

        ctx.fillStyle = coinGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.52, 0, Math.PI * 2);
        ctx.fill();

        // E. Concentric Embossed Inner Ridge
        ctx.strokeStyle = "rgba(254, 240, 138, 0.9)";
        ctx.lineWidth = p.size * 0.05;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.40, 0, Math.PI * 2);
        ctx.stroke();

        // F. Central Currency "N" / Star Emblem
        ctx.fillStyle = "#FEF08A";
        ctx.font = `black ${Math.round(p.size * 0.4)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("N", 0, p.size * 0.02);

        // G. Glossy Specular Reflection Sheen Arc
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.52, Math.PI * 0.95, Math.PI * 1.85);
        ctx.quadraticCurveTo(p.size * 0.2, -p.size * 0.2, -p.size * 0.52, 0);
        ctx.closePath();
        ctx.fill();

      } else if (p.type === "leaf") {
        // ==========================================
        // 🍃 LUSH BOTANICAL PLANT LEAF
        // ==========================================
        const pitchScale = Math.cos(p.pitchAngle) * 0.25 + 0.9;
        ctx.scale(1.0, pitchScale);

        // A. Soft Organic Drop Shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
        ctx.shadowBlur = 7;
        ctx.shadowOffsetY = 5;

        // B. Pure White Die-Cut Silhouette Frame
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.72);
        ctx.quadraticCurveTo(-p.size * 0.62, -p.size * 0.1, 0, p.size * 0.65);
        ctx.quadraticCurveTo(p.size * 0.62, -p.size * 0.1, 0, -p.size * 0.72);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = "transparent";

        // C. Multi-tone Emerald to Lime Botanical Gradient
        const leafGrad = ctx.createLinearGradient(0, -p.size * 0.6, 0, p.size * 0.6);
        leafGrad.addColorStop(0, "#A3E635");  // Fresh lime tip highlight
        leafGrad.addColorStop(0.35, "#4ADE80"); // Vibrant spring green
        leafGrad.addColorStop(0.75, "#10B981"); // Saturated emerald body
        leafGrad.addColorStop(1, "#047857");   // Deep forest green base

        ctx.fillStyle = leafGrad;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.64);
        ctx.quadraticCurveTo(-p.size * 0.52, -p.size * 0.08, 0, p.size * 0.56);
        ctx.quadraticCurveTo(p.size * 0.52, -p.size * 0.08, 0, -p.size * 0.64);
        ctx.closePath();
        ctx.fill();

        // D. Intricate Leaf Stem & Secondary Veins
        ctx.strokeStyle = "rgba(236, 253, 245, 0.85)";
        ctx.lineWidth = p.size * 0.06;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.5);
        ctx.lineTo(0, p.size * 0.42); // Central vein
        ctx.stroke();

        // Secondary Vein Branches
        ctx.lineWidth = p.size * 0.035;
        const veinOffsets = [-0.25, -0.05, 0.15];
        veinOffsets.forEach((vOffset) => {
          ctx.beginPath();
          ctx.moveTo(0, p.size * vOffset);
          ctx.lineTo(-p.size * 0.22, p.size * (vOffset - 0.12));
          ctx.moveTo(0, p.size * vOffset);
          ctx.lineTo(p.size * 0.22, p.size * (vOffset - 0.12));
          ctx.stroke();
        });

        // E. Laminated Dewdrop Specular Highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.36)";
        ctx.beginPath();
        ctx.ellipse(-p.size * 0.12, -p.size * 0.2, p.size * 0.1, p.size * 0.22, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === "star") {
        // ==========================================
        // ⭐ RADIANT CRYSTAL XP BADGE
        // ==========================================
        const pulse = Math.sin(p.twinklePhase) * 0.12 + 1.0;
        ctx.scale(pulse, pulse);

        // A. Shimmering Glow Aura & Shadow
        ctx.shadowColor = "rgba(245, 158, 11, 0.45)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        // B. White Die-Cut Star Badge Frame
        ctx.fillStyle = "#FFFFFF";
        drawStarPath(ctx, 0, 0, 8, p.size * 0.62, p.size * 0.34);
        ctx.fill();

        ctx.shadowColor = "transparent";

        // C. Multi-Color Sunset Crystal Gradient
        const starGrad = ctx.createLinearGradient(-p.size * 0.5, -p.size * 0.5, p.size * 0.5, p.size * 0.5);
        starGrad.addColorStop(0, "#F59E0B"); // Bright amber gold
        starGrad.addColorStop(0.4, "#EC4899"); // Radiant neon pink
        starGrad.addColorStop(0.8, "#8B5CF6"); // Deep electric violet
        starGrad.addColorStop(1, "#3B82F6");   // High-voltage blue

        ctx.fillStyle = starGrad;
        drawStarPath(ctx, 0, 0, 8, p.size * 0.52, p.size * 0.28);
        ctx.fill();

        // D. Inner XP Emblem Core
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#4338CA"; // Deep indigo text
        ctx.font = `900 ${Math.round(p.size * 0.24)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("XP", 0, p.size * 0.02);

        // E. Sparkling Cross Flare Glints
        const glintOpacity = Math.abs(Math.sin(p.twinklePhase * 1.5)) * 0.8;
        ctx.strokeStyle = `rgba(255, 255, 255, ${glintOpacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.65, 0);
        ctx.lineTo(p.size * 0.65, 0);
        ctx.moveTo(0, -p.size * 0.65);
        ctx.lineTo(p.size * 0.65, 0);
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();

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
      style={{ mixBlendMode: "normal" }}
    />
  );
}
