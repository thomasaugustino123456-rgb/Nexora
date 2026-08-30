import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Sparkles, Zap, Flame, Coins, Trophy } from "lucide-react";
import { useSound } from "../hooks/useSound";

interface MascotCelebrationScreenProps {
  settings?: any;
  sessionXP?: number;
  sessionCoins?: number;
  sessionStreak?: number;
  isCustomPlan?: boolean;
  onContinue: () => void;
}

const CELEBRATION_MESSAGES = [
  "Incredible focus today, bro! You are literally unstoppable! 🚀",
  "My cat ears are tingling! That was an absolutely legendary session! 🐾",
  "Boom! Another challenge destroyed! Keep shining like a star! ⭐",
  "Even the cosmos are jealous of your consistency! Legendary work! 🌌",
  "That level of focus is pure magic! Nexora is super proud of you! ✨",
  "Absolute perfection! You did that with style, bro! 🛡️",
  "Your dedication is inspiring! Let's keep this momentum rolling! ⚡"
];

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: "circle" | "ring" | "square" | "star";
  color: string;
}

export function MascotCelebrationScreen({
  settings,
  sessionXP = 20,
  sessionCoins = 25,
  sessionStreak = 1,
  isCustomPlan = false,
  onContinue
}: MascotCelebrationScreenProps) {
  const [mascotStyle, setMascotStyle] = useState<"slime" | "star_jump" | "happy_shuffle">(() => {
    const base = isCustomPlan ? "star_jump" : "slime";
    const key = isCustomPlan ? "nexora_last_custom_style" : "nexora_last_official_style";
    const lastShown = localStorage.getItem(key);

    if (lastShown) {
      let nextStyle: "slime" | "star_jump" | "happy_shuffle" = base;
      if (isCustomPlan) {
        if (lastShown === "star_jump") {
          nextStyle = "happy_shuffle";
        } else if (lastShown === "happy_shuffle") {
          nextStyle = "slime";
        } else {
          nextStyle = "star_jump";
        }
      } else {
        if (lastShown === "slime") {
          nextStyle = "star_jump";
        } else if (lastShown === "star_jump") {
          nextStyle = "happy_shuffle";
        } else {
          nextStyle = "slime";
        }
      }
      localStorage.setItem(key, nextStyle);
      return nextStyle;
    }

    localStorage.setItem(key, base);
    return base;
  });

  const [randomMessage, setRandomMessage] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [clickScale, setClickScale] = useState(1);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; r: number; color: string; vx: number; vy: number; rot: number; rotSpeed: number }>>([]);
  
  // Stages of the animation
  // "lightning" -> "mascot_big" -> "mascot_normal"
  const [animationStage, setAnimationStage] = useState<"lightning" | "mascot_big" | "mascot_normal">("lightning");
  
  // Card reveal control
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0); // 1 = Coins, 2 = Streak, 3 = XP
  
  // Counting numbers
  const [coinDisplay, setCoinDisplay] = useState(0);
  const [streakDisplay, setStreakDisplay] = useState(0);
  const [xpDisplay, setXpDisplay] = useState(0);

  // Background pointer interactivity
  const [pointer, setPointer] = useState({ x: typeof window !== "undefined" ? window.innerWidth / 2 : 200, y: typeof window !== "undefined" ? window.innerHeight / 2 : 300 });
  const [backgroundShapes, setBackgroundShapes] = useState<FloatingShape[]>([]);

  const { play } = useSound();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const backgroundRequestRef = useRef<number | null>(null);
  const hasPlayedEntranceAudioRef = useRef(false);

  // Safe device vibration wrapper
  const triggerVibration = (pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Pure Cloudinary Audio Mapping with gentle, balanced, pleasant volume
  const playCelebrationAudio = (type: "lightning" | "squash" | "coin" | "streak" | "xp" | "cheer") => {
    if (settings?.soundEnabled === false) return;
    try {
      if (type === "lightning") {
        play("challenge_unlock", 0.32);
      } else if (type === "cheer") {
        play("stadium", 0.34);
      } else if (type === "squash") {
        play("nav_switch", 0.28);
      } else if (type === "coin") {
        play("coin", 0.36);
      } else if (type === "streak") {
        play("fire_streak", 0.36);
      } else if (type === "xp") {
        play("challenge_unlock", 0.35);
      }
    } catch (e) {
      console.warn("Celebration audio error:", e);
    }
  };

  // Generate background playful floating items (harmonized to gold/amber theme, highly subtle)
  useEffect(() => {
    const totalShapes = 5;
    const colors = ["rgba(251,191,36,0.12)", "rgba(245,158,11,0.1)", "rgba(217,119,6,0.08)"];
    const types: ("circle" | "ring" | "star")[] = ["circle", "ring", "star"];
    
    const shapes: FloatingShape[] = Array.from({ length: totalShapes }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.0,
      vy: (Math.random() - 0.5) * 1.0,
      size: 15 + Math.random() * 20,
      opacity: 0.15 + Math.random() * 0.2,
      type: types[Math.floor(Math.random() * types.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setBackgroundShapes(shapes);
  }, []);

  // Update background playful floating items position + cursor repulsion
  useEffect(() => {
    if (backgroundShapes.length === 0) return;

    let activeShapes = [...backgroundShapes];

    const updateDrift = () => {
      activeShapes = activeShapes.map((shape) => {
        let nvx = shape.vx;
        let nvy = shape.vy;

        // Repel from cursor pointer
        const dx = shape.x - pointer.x;
        const dy = shape.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 160 && dist > 1) {
          const force = (160 - dist) / 160;
          nvx += (dx / dist) * force * 0.4;
          nvy += (dy / dist) * force * 0.4;
        }

        // Apply friction to keep it organic
        nvx *= 0.98;
        nvy *= 0.98;

        // Keep a minimum cruise velocity
        const speed = Math.sqrt(nvx * nvx + nvy * nvy);
        if (speed < 0.4) {
          nvx += (Math.random() - 0.5) * 0.15;
          nvy += (Math.random() - 0.5) * 0.15;
        }

        let nx = shape.x + nvx;
        let ny = shape.y + nvy;

        // Bounce from boundaries
        if (nx < -50) nx = window.innerWidth + 50;
        if (nx > window.innerWidth + 50) nx = -50;
        if (ny < -50) ny = window.innerHeight + 50;
        if (ny > window.innerHeight + 50) ny = -50;

        return {
          ...shape,
          x: nx,
          y: ny,
          vx: nvx,
          vy: nvy
        };
      });

      setBackgroundShapes(activeShapes);
      backgroundRequestRef.current = requestAnimationFrame(updateDrift);
    };

    backgroundRequestRef.current = requestAnimationFrame(updateDrift);
    return () => {
      if (backgroundRequestRef.current) cancelAnimationFrame(backgroundRequestRef.current);
    };
  }, [pointer, backgroundShapes.length]);

  // Handle the complete sequence timing & animation states
  useEffect(() => {
    setRandomMessage(CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]);

    // 1. Play Cloudinary unlocked sound & shake (exactly once)
    if (!hasPlayedEntranceAudioRef.current) {
      hasPlayedEntranceAudioRef.current = true;
      playCelebrationAudio("lightning");
    }
    triggerVibration([80, 40, 120, 60, 200, 50, 250]);

    // 2. Transits from lightning to "Mascot Big" at 1.3 seconds
    const toBigTimer = setTimeout(() => {
      setAnimationStage("mascot_big");
      playCelebrationAudio("cheer");
      triggerConfettiExplosion();
      triggerVibration([80, 100, 80]);
    }, 1300);

    // 3. Transits to "Mascot Normal" size at 3.0 seconds, showing speech bubble immediately
    const toNormalTimer = setTimeout(() => {
      setAnimationStage("mascot_normal");
      playCelebrationAudio("squash");
      triggerVibration(40);
    }, 3000);

    // 4. Sequential Cards pop sequence starts after mascot reduces (at 3.6 seconds)
    const card1Timer = setTimeout(() => {
      setActiveCardIndex(1); // Coins reveal
      playCelebrationAudio("squash");
      triggerVibration(25);
    }, 3600);

    return () => {
      clearTimeout(toBigTimer);
      clearTimeout(toNormalTimer);
      clearTimeout(card1Timer);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Handle Count-up triggers for sequential stats cards
  useEffect(() => {
    if (activeCardIndex === 1) {
      // Coins count-up
      playCelebrationAudio("coin");
      triggerVibration([30, 25]);
      let current = 0;
      const target = sessionCoins || 25;
      const stepTime = Math.max(15, Math.floor(600 / target));
      const interval = setInterval(() => {
        current += Math.ceil(target / 15) || 1;
        if (current >= target) {
          setCoinDisplay(target);
          clearInterval(interval);
          // Proceed to next card after 750ms
          setTimeout(() => {
            setActiveCardIndex(2);
          }, 750);
        } else {
          setCoinDisplay(current);
        }
      }, stepTime);
      return () => clearInterval(interval);
    } else if (activeCardIndex === 2) {
      // Streak count-up (counts from sessionStreak - 1 to sessionStreak)
      playCelebrationAudio("streak");
      triggerVibration([35, 30]);
      const prevStreak = Math.max(0, sessionStreak - 1);
      setStreakDisplay(prevStreak);
      const timer = setTimeout(() => {
        setStreakDisplay(sessionStreak);
        // Proceed to next card after 750ms
        setTimeout(() => {
          setActiveCardIndex(3);
        }, 750);
      }, 350);
      return () => clearTimeout(timer);
    } else if (activeCardIndex === 3) {
      // XP count-up
      playCelebrationAudio("xp");
      triggerVibration([40, 35]);
      let current = 0;
      const target = sessionXP || 20;
      const stepTime = Math.max(15, Math.floor(600 / target));
      const interval = setInterval(() => {
        current += Math.ceil(target / 15) || 1;
        if (current >= target) {
          setXpDisplay(target);
          clearInterval(interval);
          // Show continue button state
          setTimeout(() => {
            setActiveCardIndex(4);
          }, 300);
        } else {
          setXpDisplay(current);
        }
      }, stepTime);
      return () => clearInterval(interval);
    }
  }, [activeCardIndex]);

  // Confetti Physics simulation on canvas
  const triggerConfettiExplosion = () => {
    const pieces: any[] = [];
    const colors = ["#FF4B4B", "#FF9600", "#FFD000", "#58CC02", "#1CB0F6", "#FF7BE5", "#8E2DE2"];
    
    // Spawn 120 physical confetti particles
    for (let i = 0; i < 120; i++) {
      pieces.push({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.45,
        r: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: -12 - Math.random() * 15,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }
    setConfetti(pieces);
  };

  // Canvas confetti animation hook
  useEffect(() => {
    if (confetti.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    let activeConfetti = [...confetti];

    const updateConfetti = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      activeConfetti.forEach((p) => {
        p.vy += 0.40; // Gravity
        p.vx *= 0.96; // Air resistance
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        
        if (p.id % 3 === 0) {
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        } else if (p.id % 3 === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.r);
          ctx.lineTo(p.r, p.r);
          ctx.lineTo(-p.r, p.r);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      activeConfetti = activeConfetti.filter(p => p.y < window.innerHeight + 50);

      if (activeConfetti.length > 0) {
        requestRef.current = requestAnimationFrame(updateConfetti);
      }
    };

    requestRef.current = requestAnimationFrame(updateConfetti);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [confetti]);

  const handleMascotTap = () => {
    setClickScale(0.85);
    setTimeout(() => {
      setClickScale(1.1);
      setTimeout(() => {
        setClickScale(1);
      }, 150);
    }, 100);

    triggerVibration([40, 45]);
    triggerConfettiExplosion();
    playCelebrationAudio("cheer");
    setMascotStyle(prev => {
      const next = prev === "slime" ? "star_jump" : prev === "star_jump" ? "happy_shuffle" : "slime";
      const key = isCustomPlan ? "nexora_last_custom_style" : "nexora_last_official_style";
      localStorage.setItem(key, next);
      return next;
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setPointer({ x: e.clientX, y: e.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setPointer({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  return (
    <div 
      id="mascot-celebration-container"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="fixed inset-0 z-[1002] bg-[#0c141d] flex flex-col items-center justify-between p-4 sm:p-6 text-center overflow-hidden font-sans select-none"
    >
      {/* 1. CARTOONISH LIGHTNING FLASH INTRO LAYER */}
      <AnimatePresence>
        {animationStage === "lightning" && (
          <motion.div
            id="lightning-intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-[1010] bg-[#05090f] flex items-center justify-center pointer-events-none overflow-hidden"
          >
            {/* Screen flashing backdrop with dynamic electrical radiance */}
            <motion.div
              animate={{
                backgroundColor: [
                  "rgba(12,20,29,1)",
                  "rgba(255,255,255,0.98)",
                  "rgba(0,240,255,0.4)",
                  "rgba(255,229,0,0.95)",
                  "rgba(5,9,15,1)",
                  "rgba(255,255,255,0.85)",
                  "rgba(12,20,29,1)"
                ]
              }}
              transition={{ duration: 1.1, ease: "easeInOut", repeat: 0 }}
              className="absolute inset-0 z-0"
            />

            {/* Radial electric plasma aura burst */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.8, 1.4, 2.2], opacity: [0, 0.9, 0.6, 0] }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute w-[450px] h-[450px] rounded-full bg-radial from-[#FFE500]/60 via-[#00F0FF]/30 to-transparent blur-2xl z-[1]"
            />

            {/* Expanding electrical shockwave rings */}
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: [0.2, 2.6], opacity: [1, 0] }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute w-64 h-64 rounded-full border-4 border-[#00F0FF] filter drop-shadow-[0_0_15px_#00F0FF] z-[2]"
            />
            <motion.div
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: [0.1, 2.2], opacity: [1, 0] }}
              transition={{ duration: 0.85, delay: 0.15, ease: "easeOut" }}
              className="absolute w-64 h-64 rounded-full border-4 border-[#FFE500] filter drop-shadow-[0_0_20px_#FFE500] z-[2]"
            />

            {/* Dynamic Electric plasma sparks & embers */}
            <div className="absolute inset-0 flex items-center justify-center z-[3]">
              {[
                { x: -140, y: -180, delay: 0.05, size: 8, color: "#FFE500" },
                { x: 160, y: -140, delay: 0.1, size: 10, color: "#00F0FF" },
                { x: -180, y: 80, delay: 0.15, size: 9, color: "#FFE500" },
                { x: 190, y: 120, delay: 0.08, size: 12, color: "#00F0FF" },
                { x: -90, y: -220, delay: 0.2, size: 7, color: "#FFFFFF" },
                { x: 110, y: 230, delay: 0.12, size: 9, color: "#FFE500" },
                { x: -220, y: -40, delay: 0.18, size: 11, color: "#00F0FF" },
                { x: 210, y: -60, delay: 0.14, size: 8, color: "#FFE500" },
              ].map((spark, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: spark.x,
                    y: spark.y,
                    scale: [0, 1.5, 0.4, 0],
                    opacity: [1, 1, 0.8, 0],
                  }}
                  transition={{ duration: 0.95, delay: spark.delay, ease: "easeOut" }}
                  className="absolute rounded-full filter drop-shadow-[0_0_8px_currentColor]"
                  style={{
                    width: spark.size,
                    height: spark.size,
                    backgroundColor: spark.color,
                    color: spark.color,
                  }}
                />
              ))}
            </div>

            {/* Multi-layered dynamic electric lightning bolt SVG */}
            <svg viewBox="0 0 400 600" className="w-full h-full max-w-lg relative z-10 filter drop-shadow-[0_0_28px_rgba(255,229,0,0.95)]">
              {/* Outer Cyan Electric Aura Glow Stroke */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 0.9, 1, 0],
                  scale: [1, 1.06, 0.96, 1],
                  x: [0, -6, 6, 0]
                }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                d="M 220,-20 L 170,180 L 260,150 L 140,340 L 280,310 L 180,470 L 220,450 L 160,620"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "blur(4px)" }}
              />

              {/* Main Golden Neon Bolt Body */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 1, 1, 0],
                  scale: [1, 1.04, 0.97, 1],
                  x: [0, -8, 8, 0]
                }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                d="M 220,-20 L 170,180 L 260,150 L 140,340 L 280,310 L 180,470 L 220,450 L 160,620"
                fill="none"
                stroke="#FFE500"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Inner Pure White Supercharged Energy Core */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 1, 1, 0],
                  x: [0, -8, 8, 0]
                }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                d="M 220,-20 L 170,180 L 260,150 L 140,340 L 280,310 L 180,470 L 220,450 L 160,620"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Branching Fork 1 (Left Cyan) */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 1, 0.9, 0],
                  x: [0, 6, -6, 0]
                }}
                transition={{ duration: 0.9, delay: 0.12, ease: "easeInOut" }}
                d="M 170,180 L 100,230 L 140,250 L 80,340 L 120,350 L 70,440"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Branching Fork 2 (Right Yellow/Cyan) */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 1, 0.9, 0],
                  x: [0, -6, 6, 0]
                }}
                transition={{ duration: 0.85, delay: 0.18, ease: "easeInOut" }}
                d="M 280,310 L 340,330 L 310,380 L 370,420 L 330,470"
                fill="none"
                stroke="#FFE500"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Branching Fork 3 (Upper Left) */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 1, 0.8, 0],
                  x: [0, 4, -4, 0]
                }}
                transition={{ duration: 0.75, delay: 0.22, ease: "easeInOut" }}
                d="M 120,50 L 90,130 L 130,140 L 70,220"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Comic Cartoon action explosive text badge */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0, rotate: -25 }}
              animate={{ 
                scale: [0.1, 1.35, 1, 1.05, 0.3], 
                opacity: [0, 1, 1, 1, 0], 
                rotate: [-25, 8, -4, -2, 18] 
              }}
              transition={{ duration: 1.15, ease: "easeOut" }}
              className="absolute z-20 flex items-center justify-center font-black text-6xl md:text-8xl text-[#FFE500] italic tracking-wider filter drop-shadow-[0_8px_0_#000] drop-shadow-[0_0_30px_rgba(255,229,0,0.8)]"
              style={{ 
                WebkitTextStroke: "3.5px #000",
                textShadow: "0 0 25px rgba(0,240,255,0.8)"
              }}
            >
              KABOOM! ⚡
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STYLING WITH PHYSICS KEYFRAMES */}
      <style>{`
        /* ORGANIC WEIGHT SQUASH & STRETCH JUMP */
        .slime-celebrate-core {
          transform-origin: 200px 345px;
          animation: organicWeightBounce 1.4s infinite ease-in-out 0.8s;
        }

        /* CHEERING ARMS */
        .left-arm-cheer {
          transform-origin: 74px 225px;
          animation: rhythmicCheerLeft 1.4s infinite ease-in-out 0.8s;
        }

        .right-arm-cheer {
          transform-origin: 326px 225px;
          animation: rhythmicCheerRight 1.4s infinite ease-in-out 0.8s;
        }

        /* INERTIA HALO FLOAT */
        .halo-inertia {
          transform-origin: 200px 75px;
          animation: haloDragPhysics 1.4s infinite ease-in-out 0.8s;
        }

        @keyframes organicWeightBounce {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          40% { transform: scale(0.97, 1.03) translateY(-8px); }
          75% { transform: scale(1.04, 0.96) translateY(5px); }
        }

        @keyframes rhythmicCheerLeft {
          0%, 100% { transform: rotate(-12deg); }
          40% { transform: rotate(18deg) translate(5px, -10px); }
          75% { transform: rotate(-22deg); }
        }

        @keyframes rhythmicCheerRight {
          0%, 100% { transform: rotate(12deg); }
          40% { transform: rotate(-18deg) translate(-5px, -10px); }
          75% { transform: rotate(22deg); }
        }

        @keyframes haloDragPhysics {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(7px); }
          75% { transform: translateY(-9px); }
        }

        /* SQUASH & STRETCH FOR CARD REVEAL */
        @keyframes cardSquashStretch {
          0% { transform: scale(0.3, 1.7) translateY(50px); opacity: 0; }
          40% { transform: scale(1.25, 0.75) translateY(-10px); opacity: 1; }
          70% { transform: scale(0.88, 1.12) translateY(4px); }
          100% { transform: scale(1, 1) translateY(0); opacity: 1; }
        }

        .animate-card-bounce {
          animation: cardSquashStretch 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        /* STAR JUMP STYLE KEYFRAMES */
        .jump-physics-core {
          transform-origin: 200px 345px;
          animation: heavyStarJump 2s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }

        .arm-left {
          transform-origin: 74px 225px;
          animation: armThrowLeft 2s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        .arm-right {
          transform-origin: 326px 225px;
          animation: armThrowRight 2s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }

        .mascot-eyes {
          transform-origin: center;
          animation: eyeJoySquint 2s infinite ease-in-out;
        }

        .mascot-mouth {
          transform-origin: 200px 205px;
          animation: mouthScreamJoy 2s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }

        .mascot-halo {
          transform-origin: 200px 75px;
          animation: haloLagPhysics 2s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }

        .floor-shadow {
          transform-origin: 200px 365px;
          animation: shadowJumpPhysics 2s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }

        @keyframes heavyStarJump {
          0% { transform: translateY(0) scale(1, 1); }
          15% { transform: translateY(10px) scale(1.2, 0.8); }
          30% { transform: translateY(-120px) scale(0.85, 1.15); }
          45% { transform: translateY(-140px) scale(1.05, 0.95); }
          65% { transform: translateY(15px) scale(1.25, 0.75); }
          80%, 100% { transform: translateY(0) scale(1, 1); }
        }

        @keyframes armThrowLeft {
          0%, 15% { transform: rotate(-15deg); }
          45% { transform: rotate(140deg) translate(-20px, 30px); }
          65% { transform: rotate(-30deg); }
          80%, 100% { transform: rotate(-15deg); }
        }

        @keyframes armThrowRight {
          0%, 15% { transform: rotate(15deg); }
          45% { transform: rotate(-140deg) translate(20px, 30px); }
          65% { transform: rotate(30deg); }
          80%, 100% { transform: rotate(15deg); }
        }

        @keyframes eyeJoySquint {
          0%, 10% { transform: scaleY(1); }
          15% { transform: scaleY(0.4); }
          40%, 55% { transform: scaleY(1.1); }
          65% { transform: scaleY(0.4); }
          80%, 100% { transform: scaleY(1); }
        }

        @keyframes mouthScreamJoy {
          0%, 15% { transform: scale(1); }
          45% { transform: scale(1.4, 1.8) translateY(10px); }
          65% { transform: scale(1.2, 0.5); }
          80%, 100% { transform: scale(1); }
        }

        @keyframes haloLagPhysics {
          0%, 15% { transform: translateY(0); }
          30% { transform: translateY(20px); }
          45% { transform: translateY(-15px) scale(1.1); }
          65% { transform: translateY(-30px); }
          80%, 100% { transform: translateY(0); }
        }

        @keyframes shadowJumpPhysics {
          0%, 10% { transform: scale(1); opacity: 0.5; }
          15% { transform: scale(1.3); opacity: 0.7; }
          45% { transform: scale(0.3); opacity: 0.1; }
          65% { transform: scale(1.4); opacity: 0.8; }
          80%, 100% { transform: scale(1); opacity: 0.5; }
        }

        .jump-text {
          font-size: 20px;
          font-weight: 900;
          color: #fbbf24;
          letter-spacing: 1.5px;
          white-space: nowrap;
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.2);
          opacity: 0;
          transform: translateY(10px);
          animation: slideUpText 0.8s ease-out 0.4s forwards;
        }

        @keyframes slideUpText {
          to { opacity: 1; transform: translateY(0); }
        }

        /* HAPPY SHUFFLE STYLE KEYFRAMES */
        .shuffle-pivot {
          transform-origin: 200px 345px;
          animation: metronomeSway 1.6s infinite ease-in-out;
        }

        .gravity-dip {
          transform-origin: 200px 345px;
          animation: weightTransferDip 0.8s infinite ease-in-out;
        }

        .shuffle-arm-left {
          transform-origin: 74px 225px;
          animation: danceBeatLeft 1.6s infinite ease-in-out;
        }
        
        .shuffle-arm-right {
          transform-origin: 326px 225px;
          animation: danceBeatRight 1.6s infinite ease-in-out;
        }

        .shuffle-mascot-halo {
          transform-origin: 200px 75px;
          animation: haloInertiaDrag 1.6s infinite ease-in-out;
        }

        .shuffle-floor-shadow {
          transform-origin: 200px 355px;
          animation: shadowSway 1.6s infinite ease-in-out;
        }

        .music-notes-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .note {
          position: absolute;
          opacity: 0;
          fill: #00d4ff;
          filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.6));
          animation: floatUpNote 2s infinite ease-in;
        }
        .note:nth-child(1) { left: 60px; top: 280px; animation-delay: 0.2s; transform: scale(0.8); }
        .note:nth-child(2) { left: 280px; top: 260px; animation-delay: 0.9s; transform: scale(1.1); }
        .note:nth-child(3) { left: 100px; top: 240px; animation-delay: 1.5s; transform: scale(0.9); }

        @keyframes metronomeSway {
          0%, 100% { transform: translateX(-15px) rotate(-12deg); }
          50% { transform: translateX(15px) rotate(12deg); }
        }

        @keyframes weightTransferDip {
          0%, 100% { transform: translateY(-5px) scale(0.98, 1.05); }
          50% { transform: translateY(8px) scale(1.04, 0.96); }
        }

        @keyframes danceBeatLeft {
          0%, 100% { transform: rotate(-45deg) translateY(-15px); }
          50% { transform: rotate(10deg) translateY(5px); }
        }

        @keyframes danceBeatRight {
          0%, 100% { transform: rotate(-10deg) translateY(5px); }
          50% { transform: rotate(45deg) translateY(-15px); }
        }

        @keyframes haloInertiaDrag {
          0%, 100% { transform: translateX(10px) translateY(2px) rotate(8deg); }
          50% { transform: translateX(-10px) translateY(2px) rotate(-8deg); }
        }

        @keyframes shadowSway {
          0%, 100% { transform: translateX(-15px) scale(0.9); }
          50% { transform: translateX(15px) scale(0.9); }
        }

        @keyframes floatUpNote {
          0% { opacity: 0; transform: translateY(0) rotate(-15deg); }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-120px) rotate(15deg); }
        }

        .shuffle-text {
          font-size: 18px;
          font-weight: 900;
          color: #fbbf24;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          white-space: nowrap;
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.2);
          opacity: 0;
          transform: translateY(10px);
          animation: slideUpText 0.8s ease-out 0.4s forwards;
        }
      `}</style>

      {/* Interactive canvas for confetti */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" style={{ width: "100%", height: "100%" }} />

      {/* 2. PLAYFUL INTERACTIVE BACKGROUND WITH DRIVING SHAPES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft background glow circles responding to cursor coordinates */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[110px] opacity-35 transition-all duration-300 pointer-events-none"
          style={{
            left: `${pointer.x - 250}px`,
            top: `${pointer.y - 250}px`,
            background: isHovered 
              ? "radial-gradient(circle, rgba(28,176,246,0.5) 0%, rgba(88,204,2,0.2) 60%, transparent 100%)" 
              : "radial-gradient(circle, rgba(28,176,246,0.3) 0%, rgba(12,20,29,0) 70%)"
          }}
        />

        {/* Playfully rendering whimsical drifting shapes */}
        {backgroundShapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute transition-transform duration-75 pointer-events-none"
            style={{
              left: `${shape.x}px`,
              top: `${shape.y}px`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              opacity: shape.opacity,
              transform: "translate(-50%, -50%)"
            }}
          >
            {shape.type === "circle" && (
              <div className="w-full h-full rounded-full" style={{ backgroundColor: shape.color }} />
            )}
            {shape.type === "ring" && (
              <div className="w-full h-full rounded-full border-[3px] bg-transparent" style={{ borderColor: shape.color }} />
            )}
            {shape.type === "square" && (
              <div className="w-full h-full rounded-lg rotate-12" style={{ backgroundColor: shape.color }} />
            )}
            {shape.type === "star" && (
              <Sparkles size={shape.size} style={{ color: shape.color }} />
            )}
          </div>
        ))}
      </div>

      {/* EXPLICIT ORNAMENTAL STAR BUSTS (SUBTLE, FRAMING THE MASCOT) */}
      <div className="absolute top-[20%] left-[10%] opacity-25 animate-pulse pointer-events-none z-0">
        <Sparkles size={32} className="text-[#fbbf24]" />
      </div>
      <div className="absolute top-[22%] right-[12%] opacity-20 animate-bounce pointer-events-none z-0">
        <Sparkles size={28} className="text-[#f59e0b]" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-between min-h-[92vh] py-2">
        
        {/* TOP COMPACT PLAYFUL INTRO */}
        <div className="w-full h-6" />

        {/* INTERACTIVE MASCOT DISPLAY & SPEECH BUBBLE */}
        <div className="relative w-full flex flex-col items-center justify-center my-4 min-h-[280px]">
          
          {/* Comic/Duolingo styled Speech Bubble */}
          <AnimatePresence>
            {animationStage === "mascot_normal" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 140, damping: 15 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-[#faf8f2] text-[#451a03] px-5 py-3.5 rounded-2xl shadow-[0_8px_0_rgba(63,31,4,0.15)] z-20 border-[4px] border-[#fbbf24] relative"
              >
                {/* Tapered triangular tail shape matching the border and background */}
                <div className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 w-6 h-4 pointer-events-none">
                  <svg viewBox="0 0 24 16" className="w-full h-full drop-shadow-[0_3px_0_rgba(63,31,4,0.15)]">
                    <polygon points="12,16 2,0 22,0" fill="#fbbf24" />
                    <polygon points="12,11 5,0 19,0" fill="#faf8f2" />
                  </svg>
                </div>
                <p className="text-[14px] font-extrabold leading-snug">
                  {randomMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Scaling Mascot Stage */}
          <motion.div
            id="celebration-mascot-rig"
            animate={{
              scale: animationStage === "lightning" ? 0 : animationStage === "mascot_big" ? 1.6 : 1.1,
              y: animationStage === "mascot_big" ? 25 : 0
            }}
            transition={{
              type: "spring",
              stiffness: animationStage === "mascot_big" ? 120 : 180,
              damping: animationStage === "mascot_big" ? 12 : 16
            }}
            className="relative flex items-center justify-center w-52 h-52 mt-8 cursor-pointer touch-none !overflow-visible"
            style={{ transform: `scale(${clickScale})` }}
            onClick={handleMascotTap}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          >
            {/* Clean horizontal shadow under the mascot (replaces empty progress-like rings) */}
            <div className="absolute bottom-1.5 w-32 h-3 bg-black/45 rounded-full blur-[2px]" />
            
            {/* Custom vector real physics slime-mascot */}
            <div className="relative w-44 h-44 -translate-y-2 hover:scale-105 transition-all duration-300 !overflow-visible">
               {mascotStyle === "slime" ? (
                <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
                  <defs>
                    <radialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
                      <stop offset="0%" stopColor="#ffffff"/>
                      <stop offset="25%" stopColor="#a3e3ff"/>
                      <stop offset="70%" stopColor="#21a7f0"/>
                      <stop offset="100%" stopColor="#0066cc"/>
                    </radialGradient>
                    <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#b8f1ff"/>
                      <stop offset="50%" stopColor="#ffffff"/>
                      <stop offset="100%" stopColor="#b8f1ff"/>
                    </linearGradient>
                    <linearGradient id="armGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#21a7f0" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>

                  <g className="slime-celebrate-core">
                    <g className="halo-inertia">
                      <ellipse cx="200" cy="75" rx="95" ry="16" fill="none" stroke="url(#haloGrad)" strokeWidth={9} filter="drop-shadow(0 0 8px rgba(184,241,255,0.7))"/>
                    </g>

                    {/* Cat-ears */}
                    <path d="M125,120 Q105,75 140,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2}/>
                    <path d="M275,120 Q295,75 260,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2}/>

                    {/* Body */}
                    <ellipse cx="200" cy="215" rx="160" ry="130" fill="url(#bodyGrad)"/>

                    {/* Left Arm */}
                    <g className="left-arm-cheer">
                      <ellipse cx="74" cy="225" rx="18" ry="24" fill="url(#armGrad)" transform="rotate(-15 74 225)"/>
                    </g>

                    {/* Right Arm */}
                    <g className="right-arm-cheer">
                      <ellipse cx="326" cy="225" rx="18" ry="24" fill="url(#armGrad)" transform="rotate(15 326 225)"/>
                    </g>

                    {/* Happy Eyes */}
                    <g stroke="#031b33" strokeWidth={6.5} strokeLinecap="round" fill="none">
                      <path d="M125,185 Q145,165 165,185" />
                      <path d="M235,185 Q255,165 275,185" />
                    </g>

                    {/* Open Tongue Mouth */}
                    <path d="M182,196 Q200,202 218,196 Q200,236 182,196 Z" fill="#b3243d" stroke="#031b33" strokeWidth={4.5} strokeLinejoin="round"/>
                    <path d="M186,208 Q200,204 214,208 Q200,232 186,208 Z" fill="#ff6b8b"/>

                    {/* Giant Central "N" insignia */}
                    <text x="200" y="278" fontFamily="system-ui, sans-serif" fontWeight={900} fontSize={64} fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 2px 10px rgba(255,255,255,0.6))">N</text>
                  </g>
                </svg>
              ) : mascotStyle === "star_jump" ? (
                <div className="w-full h-full relative !overflow-visible">
                  <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
                    <defs>
                      <radialGradient id="bodyGrad-sj" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#ffffff"/>
                        <stop offset="25%" stopColor="#a3e3ff"/>
                        <stop offset="70%" stopColor="#21a7f0"/>
                        <stop offset="100%" stopColor="#0066cc"/>
                      </radialGradient>
                      <linearGradient id="haloGrad-sj" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b8f1ff"/>
                        <stop offset="50%" stopColor="#ffffff"/>
                        <stop offset="100%" stopColor="#b8f1ff"/>
                      </linearGradient>
                      <linearGradient id="armGrad-sj" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#21a7f0" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>

                    <ellipse cx="200" cy="365" rx="140" ry="18" fill="#000000" className="floor-shadow"/>

                    <g className="jump-physics-core">
                      <g className="mascot-halo">
                        <ellipse cx="200" cy="75" rx="95" ry="16" fill="none" stroke="url(#haloGrad-sj)" strokeWidth={9} filter="drop-shadow(0 0 8px rgba(184,241,255,0.7))"/>
                      </g>

                      <path d="M125,120 Q105,75 140,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2}/>
                      <path d="M275,120 Q295,75 260,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2}/>

                      <ellipse cx="200" cy="215" rx="160" ry="130" fill="url(#bodyGrad-sj)"/>

                      <g className="arm-left">
                        <ellipse cx="74" cy="225" rx="18" ry="24" fill="url(#armGrad-sj)"/>
                      </g>

                      <g className="arm-right">
                        <ellipse cx="326" cy="225" rx="18" ry="24" fill="url(#armGrad-sj)"/>
                      </g>

                      <g className="mascot-eyes">
                        <g>
                          <circle cx="145" cy="180" r="24" fill="#031b33"/>
                          <circle cx="145" cy="180" r="21" fill="#002d5a"/>
                          <circle cx="138" cy="172" r="8" fill="#ffffff"/>
                          <circle cx="152" cy="188" r="3" fill="#ffffff"/>
                        </g>
                        <g>
                          <circle cx="255" cy="180" r="24" fill="#031b33"/>
                          <circle cx="255" cy="180" r="21" fill="#002d5a"/>
                          <circle cx="248" cy="172" r="8" fill="#ffffff"/>
                          <circle cx="262" cy="188" r="3" fill="#ffffff"/>
                        </g>
                      </g>

                      <g className="mascot-mouth">
                        <path d="M188,198 Q200,208 212,198 Q200,228 188,198 Z" fill="#b3243d" stroke="#031b33" strokeWidth={4.5} strokeLinejoin="round"/>
                        <path d="M192,208 Q200,202 208,208 Q200,224 192,208 Z" fill="#ff6b8b"/>
                      </g>

                      <text x="200" y="278" fontFamily="system-ui, sans-serif" fontWeight={900} fontSize={64} fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 2px 10px rgba(255,255,255,0.6))">N</text>
                    </g>
                  </svg>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 jump-text">LEVEL UP!</div>
                </div>
              ) : (
                <div className="w-full h-full relative !overflow-visible">
                  <svg className="music-notes-container absolute inset-0 w-full h-full" viewBox="0 0 380 380" style={{ overflow: "visible" }}>
                    <g className="note"><path d="M20,30 A6,6 0 1,1 14,24 L14,5 L28,2 L28,12 L16,15 L16,24 A6,6 0 1,1 20,30 Z"/></g>
                    <g className="note"><path d="M20,30 A6,6 0 1,1 14,24 L14,5 L28,2 L28,12 L16,15 L16,24 A6,6 0 1,1 20,30 Z"/></g>
                    <g className="note"><path d="M20,30 A6,6 0 1,1 14,24 L14,5 L28,2 L28,12 L16,15 L16,24 A6,6 0 1,1 20,30 Z"/></g>
                  </svg>

                  <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible", zIndex: 2 }}>
                    <defs>
                      <radialGradient id="bodyGrad-hs" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#ffffff"/>
                        <stop offset="25%" stopColor="#a3e3ff"/>
                        <stop offset="70%" stopColor="#21a7f0"/>
                        <stop offset="100%" stopColor="#0066cc"/>
                      </radialGradient>
                      <linearGradient id="haloGrad-hs" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b8f1ff"/>
                        <stop offset="50%" stopColor="#ffffff"/>
                        <stop offset="100%" stopColor="#b8f1ff"/>
                      </linearGradient>
                      <linearGradient id="armGrad-hs" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#21a7f0" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>

                    <ellipse cx="200" cy="355" rx="120" ry="14" fill="#000000" opacity="0.4" className="shuffle-floor-shadow"/>

                    <g className="shuffle-pivot">
                      <g className="gravity-dip">
                        
                        <g className="shuffle-mascot-halo">
                          <ellipse cx="200" cy="75" rx="95" ry="16" fill="none" stroke="url(#haloGrad-hs)" strokeWidth={9} filter="drop-shadow(0 0 8px rgba(184,241,255,0.7))"/>
                        </g>

                        <path d="M125,120 Q105,75 140,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2}/>
                        <path d="M275,120 Q295,75 260,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2}/>

                        <ellipse cx="200" cy="215" rx="160" ry="130" fill="url(#bodyGrad-hs)"/>

                        <g className="shuffle-arm-left">
                          <ellipse cx="74" cy="225" rx="18" ry="24" fill="url(#armGrad-hs)"/>
                        </g>

                        <g className="shuffle-arm-right">
                          <ellipse cx="326" cy="225" rx="18" ry="24" fill="url(#armGrad-hs)"/>
                        </g>

                        <g stroke="#031b33" strokeWidth="6.5" strokeLinecap="round" fill="none">
                          <path d="M125,185 Q145,165 165,185" />
                          <path d="M235,185 Q255,165 275,185" />
                        </g>

                        <path d="M188,198 Q200,208 212,198 Q200,228 188,198 Z" fill="#b3243d" stroke="#031b33" strokeWidth={4} strokeLinejoin="round"/>
                        <path d="M192,208 Q200,202 208,208 Q200,224 192,208 Z" fill="#ff6b8b"/>

                        <text x="200" y="278" fontFamily="system-ui, sans-serif" fontWeight={900} fontSize={64} fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 2px 10px rgba(255,255,255,0.6))">N</text>

                      </g>
                    </g>
                  </svg>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 shuffle-text">PERFECT RHYTHM!</div>
                </div>
              )}

              {/* Rosy blushing cheeks */}
              <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
                <div className="w-[120px] h-[100px] relative">
                  <div className="absolute left-[20px] bottom-[28px] w-5 h-2.5 bg-pink-500/35 rounded-full blur-[1px] animate-pulse" />
                  <div className="absolute right-[20px] bottom-[28px] w-5 h-2.5 bg-pink-500/35 rounded-full blur-[1px] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Premium Style Toggle Badge */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0a141d]/90 backdrop-blur-md hover:bg-[#fbbf24]/20 border border-[#fbbf24]/40 text-[#fbbf24] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20">
              <span>Mascot Style: {mascotStyle === "slime" ? "Cat-Eared Slime" : mascotStyle === "star_jump" ? "Star Jump" : "Happy Shuffle"}</span>
              <span className="text-[8px] opacity-60 text-white/70 font-medium">| Tap Mascot to Swap</span>
            </div>
          </motion.div>
        </div>

        {/* 3-CARD COMPACT SEQUENCE SHAPED AS A SMALL POLISHED GRID */}
        <div className="w-full grid grid-cols-3 gap-2 mt-8 mb-2 max-w-[340px] px-1 mx-auto">
          
          {/* Card 1: COINS */}
          <div className="min-h-[100px] flex items-stretch">
            {activeCardIndex >= 1 ? (
              <div
                id="coin-stat-card"
                className="animate-card-bounce w-full bg-[#1e1b15] border-2 border-[#fbbf24]/50 rounded-xl p-2 flex flex-col items-center justify-between shadow-[0_4px_0_#b45309]"
              >
                <div className="text-[9px] font-black text-[#fbbf24] uppercase tracking-wider">
                  COINS
                </div>
                <div className="w-8 h-8 rounded-full bg-[#fbbf24]/15 flex items-center justify-center my-0.5">
                  <Coins size={18} className="text-[#fbbf24]" />
                </div>
                <div className="text-base font-black text-white">
                  +{coinDisplay}
                </div>
              </div>
            ) : (
              <div className="w-full border-2 border-dashed border-gray-800 rounded-xl" />
            )}
          </div>

          {/* Card 2: STREAK */}
          <div className="min-h-[100px] flex items-stretch">
            {activeCardIndex >= 2 ? (
              <div
                id="streak-stat-card"
                className="animate-card-bounce w-full bg-[#1e1b15] border-2 border-[#fbbf24]/50 rounded-xl p-2 flex flex-col items-center justify-between shadow-[0_4px_0_#b45309]"
              >
                <div className="text-[9px] font-black text-[#fbbf24] uppercase tracking-wider">
                  STREAK
                </div>
                <div className="w-8 h-8 rounded-full bg-[#fbbf24]/15 flex items-center justify-center my-0.5">
                  <Flame size={18} className="text-[#fbbf24]" />
                </div>
                <div className="text-base font-black text-white">
                  {streakDisplay} Day{streakDisplay > 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <div className="w-full border-2 border-dashed border-gray-800 rounded-xl" />
            )}
          </div>

          {/* Card 3: XP */}
          <div className="min-h-[100px] flex items-stretch">
            {activeCardIndex >= 3 ? (
              <div
                id="xp-stat-card"
                className="animate-card-bounce w-full bg-[#1e1b15] border-2 border-[#fbbf24]/50 rounded-xl p-2 flex flex-col items-center justify-between shadow-[0_4px_0_#b45309]"
              >
                <div className="text-[9px] font-black text-[#fbbf24] uppercase tracking-wider">
                  ENERGY XP
                </div>
                <div className="w-8 h-8 rounded-full bg-[#fbbf24]/15 flex items-center justify-center my-0.5">
                  <Zap size={18} className="text-[#fbbf24]" />
                </div>
                <div className="text-base font-black text-white">
                  +{xpDisplay} XP
                </div>
              </div>
            ) : (
              <div className="w-full border-2 border-dashed border-gray-800 rounded-xl" />
            )}
          </div>

        </div>

        {/* ACTIONS / CONTINUE BUTTON */}
        <div className="w-full max-w-[340px] h-16 relative flex items-center justify-center mt-3">
          <AnimatePresence>
            {activeCardIndex >= 4 && (
              <motion.button
                id="celebration-continue-btn"
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 15 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerVibration(25);
                  onContinue();
                }}
                className="group relative w-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#d97706] py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none cursor-pointer"
              >
                <span className="text-amber-950 font-black text-base uppercase tracking-wider font-sans">
                  CONTINUE CHALLENGE
                </span>
                <div className="bg-amber-950/15 p-1 rounded-lg group-hover:translate-x-1.5 transition-transform">
                  <ChevronRight className="text-amber-950" size={16} />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
