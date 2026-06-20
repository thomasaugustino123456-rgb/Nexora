import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { vibrate, VIBRATION_PATTERNS } from "../lib/vibrate";
import { UserStats } from "../types";
import { GardenState } from "../types/garden";

interface MascotSecretCelebrationProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats> | ((prev: UserStats) => UserStats)) => void;
  gardenState: GardenState;
  setGardenState: React.Dispatch<React.SetStateAction<GardenState>>;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "coin" | "star" | "flame" | "leaf" | "sparkle";
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  swaySpeed?: number;
  swayOffset?: number;
  bounceCount?: number;
  maxLife?: number;
  life?: number;
}

// Motivational Speeches
const MOTIVATIONAL_BUBBLES = [
  "Small steps become big wins.",
  "You are growing every day.",
  "Keep your streak alive.",
  "One challenge at a time.",
  "Progress beats perfection.",
  "Your future self will thank you.",
];

// Synthesis helper for premium haptic sounds
function playSynthSound(type: "coin" | "sparkle" | "reward") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const dest = ctx.destination;

    if (type === "coin") {
      // Clean high-pitch retro coin bell sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      
      // Dual resonant harmony
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc1.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.08); // C6
      osc2.frequency.setValueAtTime(1318.5, ctx.currentTime); // E6

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);

    } else if (type === "sparkle") {
      // Rapid shimmering arpeggio
      const notes = [1200, 1500, 1800, 2200];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.15);
        
        osc.connect(gain);
        gain.connect(dest);
        
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.25);
      });

    } else if (type === "reward") {
      // Satisfying full major-triad chord crescendo
      const baseFreqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // Uplifting glide upward
        osc.frequency.exponentialRampToValueAtTime(freq * 2, ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        // Lowpass filter for deep smooth warmth
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start();
        osc.stop(ctx.currentTime + 0.75);
      });
    }
  } catch (err) {
    console.warn("Mascot celebration synth error:", err);
  }
}

export function MascotSecretCelebration({
  stats,
  onUpdateStats,
  gardenState,
  setGardenState,
  showToast,
}: MascotSecretCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [speechPosition, setSpeechPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLuckyDrop, setActiveLuckyDrop] = useState<{
    type: "coins" | "xp" | "seed";
    amount: number;
    title: string;
  } | null>(null);

  // Keep track of the particles in a mutable ref for raw high-speed rendering
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const cooldownEndRef = useRef<number>(0);

  // Soft glow screen pulse state
  const [triggerGlowPulse, setTriggerGlowPulse] = useState(false);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{
        source: "logo" | "home";
        rect: DOMRect;
      }>;

      if (!customEvent.detail) return;

      const { rect } = customEvent.detail;
      const now = Date.now();

      // Check Cooldown
      if (now < cooldownEndRef.current) {
        // Cooldown active, only small bubble response or minor indicator
        showToast("The Mascot is breathing... Cooldown active! 🏮", "info");
        vibrate(VIBRATION_PATTERNS.CLICK);
        return;
      }

      // Lock cooldown 10 seconds
      cooldownEndRef.current = now + 10000;

      // Haptic confirmation
      vibrate([50, 40, 60]);

      // Play soft sound effects
      playSynthSound("reward");
      setTimeout(() => playSynthSound("coin"), 100);
      setTimeout(() => playSynthSound("sparkle"), 250);

      // Trigger soft screen pulse glow
      setTriggerGlowPulse(true);
      setTimeout(() => setTriggerGlowPulse(false), 900);

      // Position speech bubble exactly above the tapped element
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top - 60; // 60px padding above mascot
      setSpeechPosition({ x: Math.max(30, Math.min(window.innerWidth - 180, centerX)), y: Math.max(20, centerY) });

      // Random speech bubble
      const randSpeech = MOTIVATIONAL_BUBBLES[Math.floor(Math.random() * MOTIVATIONAL_BUBBLES.length)];
      setActiveSpeech(randSpeech);
      setTimeout(() => setActiveSpeech(null), 3000);

      // Spawn particles centered at the tapped mascot
      spawnMascotParticles(rect);

      // Determine surprise reward system (5% probability)
      const isLucky = Math.random() < 0.05;
      if (isLucky) {
        triggerSurpriseReward();
      }
    };

    window.addEventListener("trigger-mascot-celebration", handleTrigger);
    return () => {
      window.removeEventListener("trigger-mascot-celebration", handleTrigger);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [stats, onUpdateStats, gardenState, setGardenState]);

  const triggerSurpriseReward = () => {
    const choices: Array<"coins" | "xp" | "seed"> = ["coins", "xp", "seed"];
    const luckyType = choices[Math.floor(Math.random() * choices.length)];

    let rewardAmount = 0;
    let rewardText = "";

    if (luckyType === "coins") {
      rewardAmount = 10;
      rewardText = "+10 Coins";
      onUpdateStats((prev) => ({ ...prev, coins: prev.coins + 10 }));
    } else if (luckyType === "xp") {
      rewardAmount = 25;
      rewardText = "+25 XP";
      onUpdateStats((prev) => ({ ...prev, xp: prev.xp + 25 }));
    } else {
      // Seed drop
      rewardAmount = 1;
      rewardText = "+1 Slime-Berry Seed";
      setGardenState((prev) => ({
        ...prev,
        inventory: {
          ...(prev.inventory || {}),
          "slime-berry": (prev.inventory?.["slime-berry"] || 0) + 1,
        },
      }));
    }

    setActiveLuckyDrop({
      type: luckyType,
      amount: rewardAmount,
      title: rewardText,
    });

    // Vibrate & Notification
    vibrate([80, 50, 100]);
    showToast(`🎉 Lucky Drop Activated! Received ${rewardText} 🪙`, "success");
  };

  const spawnMascotParticles = (targetRect: DOMRect) => {
    const particles: Particle[] = [];
    const originX = targetRect.left + targetRect.width / 2;
    const originY = targetRect.top + targetRect.height / 3;

    // 🪙 Nexus Coins (15-20)
    const coinCount = 15 + Math.floor(Math.random() * 6);
    for (let i = 0; i < coinCount; i++) {
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 14,
        vy: -9 - Math.random() * 11,
        type: "coin",
        size: 14 + Math.random() * 6,
        color: "#EAB308", // Yellow Gold
        alpha: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.35,
        bounceCount: 0,
      });
    }

    // ⭐ XP Stars (10-15)
    const starCount = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < starCount; i++) {
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 10,
        vy: -12 - Math.random() * 8,
        type: "star",
        size: 16 + Math.random() * 8,
        color: "#3B82F6", // High-Contrast Sky Blue
        alpha: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      });
    }

    // 🔥 Streak Flames (5-8)
    const flameCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < flameCount; i++) {
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 6,
        vy: -8 - Math.random() * 7,
        type: "flame",
        size: 18 + Math.random() * 8,
        color: "#F97316", // Flame Orange
        alpha: 1.0,
        rotation: 0,
        rotationSpeed: 0,
        swaySpeed: 0.1 + Math.random() * 0.15,
        swayOffset: Math.random() * Math.PI,
      });
    }

    // 🌱 Plant Leaves (10-12)
    const leafCount = 10 + Math.floor(Math.random() * 3);
    for (let i = 0; i < leafCount; i++) {
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 8,
        vy: -7 - Math.random() * 6,
        type: "leaf",
        size: 12 + Math.random() * 6,
        color: "#22C55E", // Organic Leaf Green
        alpha: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        swaySpeed: 0.05 + Math.random() * 0.08,
        swayOffset: Math.random() * Math.PI,
      });
    }

    // ✨ Sparkles (20-30)
    const sparkleCount = 20 + Math.floor(Math.random() * 11);
    for (let i = 0; i < sparkleCount; i++) {
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * 12,
        vy: -5 - Math.random() * 14,
        type: "sparkle",
        size: 4 + Math.random() * 6,
        color: Math.random() > 0.5 ? "#FFFFFF" : "#60A5FA", // Silver white and cyan starbursts
        alpha: 1.0,
        rotation: Math.random() * Math.PI / 4,
        rotationSpeed: 0.02,
        maxLife: 40 + Math.floor(Math.random() * 40),
        life: 0,
      });
    }

    particlesRef.current = [...particlesRef.current, ...particles];

    // Ensure our canvas loop is active and running cleanly
    if (canvasRef.current && !animationFrameIdRef.current) {
      handleResize(); // ensure correct dimensions
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    }
  };

  const handleResize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Physical updates
      if (p.type === "sparkle") {
        p.life!++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // light gravity drift
        p.alpha = 1 - p.life! / p.maxLife!;
      } else if (p.type === "flame") {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // flame drifts up, small gravity weight
        p.vx += Math.sin(Date.now() * p.swaySpeed! + p.swayOffset!) * 0.12; // warm swaying
        p.alpha -= 0.012;
      } else if (p.type === "leaf") {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // leaf medium falling
        p.vx += Math.sin(Date.now() * p.swaySpeed! + p.swayOffset!) * 0.25; // fluttering
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.006;
      } else if (p.type === "star") {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // standard gravity
        p.rotation += p.rotationSpeed + Math.sin(Date.now() * 0.01) * 0.02;
        p.alpha -= 0.009;
      } else if (p.type === "coin") {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // strong coin weight
        p.rotation += p.rotationSpeed;

        // Bounce physics on structural virtual floor (85% of viewport height)
        const virtualFloor = canvas.height * 0.88;
        if (p.y + p.size / 2 >= virtualFloor && p.vy > 0) {
          if (p.bounceCount! < 2) {
            p.y = virtualFloor - p.size / 2;
            p.vy = -p.vy * 0.45; // bouncy rubber core friction loss
            p.vx *= 0.7; // slide friction
            p.bounceCount!++;
            vibrate(5); // soft micro vibrate on bounce
          } else {
            p.alpha -= 0.025; // dissolve slowly on floor
          }
        }
      }

      // Safeguard boundaries / alpha cleanup
      if (p.alpha <= 0 || p.x < -50 || p.x > canvas.width + 50 || p.y > canvas.height + 50) {
        particles.splice(i, 1);
        continue;
      }

      // Draw particle archetype beautifully
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === "coin") {
        // Gold Coin with Inner Ring & reflective glossy shine
        const spinScale = Math.abs(Math.cos(Date.now() * 0.01)); // simulated 3D spin rotation scale
        ctx.scale(spinScale, 1.0);

        // Gold coin body
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.size / 2);
        grad.addColorStop(0, "#FDE047"); // bright inner gold
        grad.addColorStop(0.7, "#EAB308"); // normal gold yellow
        grad.addColorStop(1, "#CA8A04"); // dark shaded gold border
        
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Embossed Inner Ring
        ctx.strokeStyle = "#FEF08A";
        ctx.lineWidth = p.size * 0.08;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        // Glossy glare slash cut
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.35, -p.size * 0.1);
        ctx.lineTo(p.size * 0.1, -p.size * 0.35);
        ctx.lineTo(p.size * 0.25, -p.size * 0.2);
        ctx.lineTo(-p.size * 0.2, p.size * 0.15);
        ctx.closePath();
        ctx.fill();

      } else if (p.type === "star") {
        // High-contrast glowing star
        ctx.shadowBlur = p.size * 0.4;
        ctx.shadowColor = "rgba(59, 130, 246, 0.6)";

        ctx.fillStyle = "#60A5FA"; // star outer light blue
        drawStar(ctx, 0, 0, 5, p.size / 2, p.size / 4);
        ctx.fill();

        // Shiny inner core
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#F0F9FF";
        drawStar(ctx, 0, 0, 5, p.size * 0.3, p.size * 0.15);
        ctx.fill();

      } else if (p.type === "flame") {
        // Flickering multi-layered warm fire flame
        const glow = ctx.createRadialGradient(0, p.size * 0.2, 1, 0, p.size * 0.2, p.size);
        glow.addColorStop(0, "#FEF08A"); // Yellow inner flame
        glow.addColorStop(0.3, "#F97316"); // Shimmering orange middle
        glow.addColorStop(1, "rgba(239, 68, 68, 0)"); // Fading red smoke edge

        ctx.beginPath();
        // organic flame shape teardrop curve top
        ctx.moveTo(0, -p.size * 0.65);
        ctx.quadraticCurveTo(p.size * 0.35, -p.size * 0.1, p.size * 0.35, p.size * 0.25);
        ctx.arc(0, p.size * 0.25, p.size * 0.35, 0, Math.PI);
        ctx.quadraticCurveTo(-p.size * 0.35, -p.size * 0.1, 0, -p.size * 0.65);
        ctx.closePath();
        ctx.fillStyle = glow;
        ctx.fill();

      } else if (p.type === "leaf") {
        // Forest lightweight leaves
        const grad = ctx.createLinearGradient(-p.size / 2, 0, p.size / 2, 0);
        grad.addColorStop(0, "#4ADE80"); // Bright leaf green
        grad.addColorStop(1, "#15803D"); // Deep forest green

        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.6);
        ctx.quadraticCurveTo(p.size * 0.45, -p.size * 0.1, 0, p.size * 0.5);
        ctx.quadraticCurveTo(-p.size * 0.45, -p.size * 0.1, 0, -p.size * 0.6);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Leaf primary central rib line
        ctx.strokeStyle = "#DCFCE7";
        ctx.lineWidth = p.size * 0.08;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.5);
        ctx.lineTo(0, p.size * 0.35);
        ctx.stroke();

      } else if (p.type === "sparkle") {
        // Magical twinkling cross sparkles
        const rad = p.size / 2;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.2;
        
        ctx.beginPath();
        ctx.moveTo(0, -rad);
        ctx.lineTo(0, rad);
        ctx.moveTo(-rad, 0);
        ctx.lineTo(rad, 0);
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    } else {
      animationFrameIdRef.current = null;
    }
  };

  // Helper method to draw a perfect 5-pointed star
  const drawStar = (
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
    let step = Math.PI / spikes;

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

  return (
    <>
      {/* Absolute overlay canvas that lets particles float seamlessly through the viewport */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[190]"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Ambient background soft screen pulse */}
      <AnimatePresence>
        {triggerGlowPulse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-blue-400 pointer-events-none z-[180] mix-blend-color-dodge"
          />
        )}
      </AnimatePresence>

      {/* Floating motivational speech bubble above the activated mascot */}
      <AnimatePresence>
        {activeSpeech && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            style={{
              position: "fixed",
              top: speechPosition.y,
              left: speechPosition.x,
              transform: "translateX(-50%)",
            }}
            className="z-[200] max-w-[200px] bg-[#EEF2F6] text-blue-950 px-4 py-2.5 rounded-2xl border-2 border-blue-100 shadow-xl flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Playful mini talk bubble pointer/caret shape */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#EEF2F6]" />
            <div className="absolute -bottom-[12.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-blue-100 -z-10" />

            <span className="text-xs font-black text-center leading-relaxed tracking-tight select-none">
              {activeSpeech}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Surprise reward floating card overlay */}
      <AnimatePresence>
        {activeLuckyDrop && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/45 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ scale: 0.75, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-gradient-to-tr from-slate-900 via-slate-800 to-[#1e293b] rounded-3xl p-6 shadow-2xl max-w-sm w-full relative overflow-hidden border border-amber-400/30 text-center space-y-5"
            >
              {/* Soft gold backdrop radial glow */}
              <div className="absolute -inset-10 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none opacity-55" />

              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-[0.2em] text-amber-400 uppercase">
                  ⭐ Mascot Easter Egg
                </span>
                <h3 className="text-2xl font-black text-white italic">
                  🎉 Lucky Drop!
                </h3>
              </div>

              {/* Reward Icon / Graphic */}
              <div className="w-24 h-24 mx-auto rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                {activeLuckyDrop.type === "coins" && (
                  <span className="text-5xl select-none animate-bounce">🪙</span>
                )}
                {activeLuckyDrop.type === "xp" && (
                  <span className="text-5xl select-none animate-bounce">⭐</span>
                )}
                {activeLuckyDrop.type === "seed" && (
                  <span className="text-5xl select-none animate-bounce">🌱</span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-300">
                  Your playful tap unlocked an extra bonus:
                </p>
                <div className="text-3xl font-black text-amber-400 tracking-tight">
                  {activeLuckyDrop.title}
                </div>
              </div>

              <button
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
                  setActiveLuckyDrop(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-950 font-black rounded-2xl shadow-xl shadow-amber-500/10 uppercase tracking-wider text-xs border border-amber-300/25 transition-all"
              >
                Claim Drop!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
