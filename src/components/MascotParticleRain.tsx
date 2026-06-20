import React, { useEffect, useRef } from "react";

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
  bounceCount: number;     // Bounces on floor before rest
  isResting: boolean;      // True when sitting on the bottom floor
  restTimer: number;       // Frames remaining at rest (e.g. 180 to 300 frames)
  maxRestTimer: number;    // Reference to initial resting limit
  opacity: number;         // Opacity for fade out
  scaleX: number;          // Width coefficient for spinning coins
  twinklePhase: number;    // Star shine frequency phase
  colorHue: number;        // Decorative hue shift for variety
}

export function MascotParticleRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const nextIdRef = useRef<number>(0);

  // Dynamic Horizontal Gravity / Tilt Factor
  // Map horizontal lean from -1.0 (Full Left) to +1.0 (Full Right)
  const tiltXRef = useRef<number>(0);

  // Handle device orientation on mobile & tablet
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Gamma is left/right tilt in degrees (-90 to 90)
      if (event.gamma !== null) {
        // Clamp gamma and map to normalized tilt force [-1.2, 1.2]
        const clampedGamma = Math.max(-60, Math.min(60, event.gamma));
        tiltXRef.current = clampedGamma / 45; // Lean magnitude
      }
    };

    // Soft fallback for desktop developers (tilt based on cursor relative to screen center)
    const handleMouseMove = (event: MouseEvent) => {
      const screenWidth = window.innerWidth;
      const normalizedX = (event.clientX / screenWidth) * 2 - 1; // Map to [-1, 1]
      // Smoothen desktop sway lean
      tiltXRef.current = normalizedX * 0.85;
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const spawnParticles = () => {
    const width = window.innerWidth;
    const newParticles: Particle[] = [];

    // Prompt specifies: Spawn 15 Coins, 15 Leaves, 10 Stars (Total of 40 elements)
    const counts = { coin: 15, leaf: 15, star: 10 };

    (Object.keys(counts) as Array<"coin" | "star" | "leaf">).forEach((type) => {
      const qty = counts[type];
      for (let i = 0; i < qty; i++) {
        // Spread cleanly across full width of screen
        const startX = Math.random() * width;
        // Start above the mobile viewport so they natural rain down
        const startY = -60 - Math.random() * 240;

        newParticles.push({
          id: nextIdRef.current++,
          x: startX,
          y: startY,
          vx: (Math.random() - 0.5) * 3, // Initial slight wind drift
          vy: 2 + Math.random() * 4,     // Natural drop speed
          type,
          size: type === "coin" ? 18 + Math.random() * 6 : type === "leaf" ? 16 + Math.random() * 7 : 14 + Math.random() * 5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          swaySpeed: 0.02 + Math.random() * 0.04,
          swayOffset: Math.random() * Math.PI * 2,
          bounceCount: 0,
          isResting: false,
          restTimer: 240 + Math.floor(Math.random() * 120), // 4 to 6 seconds standing time
          maxRestTimer: 300,
          opacity: 1.0,
          scaleX: 1.0,
          twinklePhase: Math.random() * Math.PI,
          colorHue: Math.floor(Math.random() * 15) - 7, // slight natural variation in color
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
    const gravity = 0.22;               // Natural gravity weight
    const horizontalWindForce = tiltX * 0.38; // Tilt acceleration
    const phoneBottom = canvas.height - 20;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];

      if (!p.isResting) {
        // --- 1. FREE-FALLING STATE ---

        // Apply dynamic lateral tilt force & natural resistance
        p.vx += horizontalWindForce * 0.3;
        p.vx *= 0.98; // Air resistance

        if (p.type === "leaf") {
          // Leaves: Elegant swaying left/right motion with slow natural fall
          p.vy = Math.min(2.5, p.vy + gravity * 0.25);
          const sway = Math.sin(Date.now() * p.swaySpeed + p.swayOffset);
          p.x += p.vx + sway * 1.4;
          p.y += p.vy;
          p.rotation += p.rotationSpeed * p.scaleX + sway * 0.015;
        } else if (p.type === "star") {
          // Stars: Twinkle and smooth fall with gentle side drift
          p.vy = Math.min(3.8, p.vy + gravity * 0.8);
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
        } else if (p.type === "coin") {
          // Coins: Fast spin & heavier gravity fall
          p.vy = Math.min(6.2, p.vy + gravity * 1.1);
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          // Simulated 3D gold coin spinning width oscillation
          p.scaleX = Math.abs(Math.sin((Date.now() * 0.006) + p.swayOffset));
        }

        // Offscreen boundary check: Prevent flying off top/sides before rendering fully
        if (p.x < -100) p.x = canvas.width + 50;
        if (p.x > canvas.width + 100) p.x = -50;

        // Floor threshold logic
        if (p.y >= phoneBottom - p.size / 2) {
          p.y = phoneBottom - p.size / 2;

          if (p.type === "coin" && p.bounceCount < 2) {
            // Satisfying bouncy coins!
            p.vy = -p.vy * 0.38; // elastic impact speed loss
            p.vx += (Math.random() - 0.5) * 1.5; // lateral dispersion
            p.bounceCount++;
          } else {
            // Anchor to floor and initiate resting lifecycle
            p.isResting = true;
            p.vy = 0;
            p.vx = 0;
          }
        }
      } else {
        // --- 2. RESTING ON THE BOTTOM STATE ---
        // Slide / slide-off-screen animation if user turns phone right/left
        if (Math.abs(tiltX) > 0.15) {
          // Tactile slide response
          p.vx += horizontalWindForce * 0.5;
          p.vx = Math.max(-8, Math.min(8, p.vx)); // limit terminal velocity
          
          p.x += p.vx;
          p.rotation += p.vx * 0.018; // roll beautifully along the floor
          p.restTimer -= 1.5; // hasten dissolution while moving
        } else {
          // Friction deceleration back to still position
          p.vx *= 0.85;
          p.x += p.vx;
        }

        // Natural settle limit timer tick down
        p.restTimer--;

        // Fade away smoothly at the tail-end of its lifetime
        if (p.restTimer <= 65) {
          p.opacity = Math.max(0, p.restTimer / 65);
        }

        // Prune offscreen items or fully faded out items
        if (p.x < -p.size || p.x > canvas.width + p.size || p.opacity <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
      }

      // Draw particle graphics with luxurious details
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === "coin") {
        // Coin Spin Scale
        ctx.scale(p.scaleX, 1.0);

        // Gold coin radial glow/gradient
        const coinGrad = ctx.createRadialGradient(0, 0, p.size * 0.1, 0, 0, p.size / 2);
        coinGrad.addColorStop(0, "#FDE047");  // inner gold shine
        coinGrad.addColorStop(0.7, "#EAB308"); // clean yellow-gold
        coinGrad.addColorStop(1, "#CA8A04");   // darker edge outline
        
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = coinGrad;
        ctx.fill();

        // Elegant inner minted circle
        ctx.strokeStyle = "#FEF08A";
        ctx.lineWidth = p.size * 0.08;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.28, 0, Math.PI * 2);
        ctx.stroke();

        // 3D Rim drop-shadow simulation
        ctx.strokeStyle = "#854D0E";
        ctx.lineWidth = p.size * 0.05;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.46, 0, Math.PI * 2);
        ctx.stroke();

      } else if (p.type === "leaf") {
        // Leaf shading with natural organic gradients
        const leafGrad = ctx.createLinearGradient(-p.size / 2, 0, p.size / 2, 0);
        leafGrad.addColorStop(0, "#4ADE80"); // Vibrant Spring Leaf Green
        leafGrad.addColorStop(1, "#15803D"); // Luxurious Forest Green
        
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.55);
        // Left leaf curvature
        ctx.quadraticCurveTo(-p.size * 0.45, -p.size * 0.1, 0, p.size * 0.5);
        // Right leaf curvature
        ctx.quadraticCurveTo(p.size * 0.45, -p.size * 0.1, 0, -p.size * 0.55);
        ctx.closePath();
        ctx.fillStyle = leafGrad;
        ctx.fill();

        // Beautiful lighter leaf ribs and veins
        ctx.strokeStyle = "#BBF7D0";
        ctx.lineWidth = p.size * 0.08;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.45);
        ctx.lineTo(0, p.size * 0.35);
        ctx.stroke();

      } else if (p.type === "star") {
        // Twinkling Small Star
        const twinkleFactor = 0.8 + Math.sin(Date.now() * 0.012 + p.twinklePhase) * 0.22;
        const currentSize = p.size * twinkleFactor;

        // Radiant starburst glow
        const starGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, currentSize / 2);
        starGrad.addColorStop(0, "#FFFFFF");
        starGrad.addColorStop(0.35, "#93C5FD"); // Soft neon cyan glow
        starGrad.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.shadowBlur = currentSize * 0.35;
        ctx.shadowColor = "#60A5FA";

        ctx.fillStyle = starGrad;
        drawStarPath(ctx, 0, 0, 5, currentSize / 2, currentSize / 4.5);
        ctx.fill();

        // Fast inner gloss fill
        ctx.fillStyle = "#F0F9FF";
        ctx.shadowBlur = 0;
        drawStarPath(ctx, 0, 0, 5, currentSize * 0.22, currentSize * 0.1);
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

  // 5-Point star path geometry mapping helper
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

  // Dimensions sync on startup & resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // direct initial sync

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[500]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
