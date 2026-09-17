import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Sparkles, Zap, Flame, Coins, Trophy } from "lucide-react";
import { useSound, playLightningThunder, unlockAudio } from "../hooks/useSound";

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

export type CelebrationMascotStyle =
  | "slime"
  | "star_jump"
  | "happy_shuffle"
  | "trophy_flip"
  | "lightning_supercharge"
  | "breakdance_spin"
  | "duo_high_five";

export function MascotCelebrationScreen({
  settings,
  sessionXP = 20,
  sessionCoins = 25,
  sessionStreak = 1,
  isCustomPlan = false,
  onContinue
}: MascotCelebrationScreenProps) {
  const [mascotStyle] = useState<CelebrationMascotStyle>(() => {
    const base: CelebrationMascotStyle = isCustomPlan ? "star_jump" : "slime";
    const key = isCustomPlan ? "nexora_last_custom_style" : "nexora_last_official_style";
    const lastShown = localStorage.getItem(key) as CelebrationMascotStyle | null;

    const allStyles: CelebrationMascotStyle[] = [
      "slime",
      "star_jump",
      "happy_shuffle",
      "trophy_flip",
      "lightning_supercharge",
      "breakdance_spin",
      "duo_high_five"
    ];

    if (lastShown && allStyles.includes(lastShown)) {
      const currIdx = allStyles.indexOf(lastShown);
      const nextStyle = allStyles[(currIdx + 1) % allStyles.length];
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

  // Dedicated audio mapping for the first celebration screen (Mascot & Lightning)
  const playCelebrationAudio = (type: "lightning" | "squash" | "coin" | "streak" | "xp" | "cheer") => {
    if (settings?.soundEnabled === false) return;
    try {
      if (type === "lightning") {
        unlockAudio();
        // Play the dedicated cartoon lightning & thunder sound effect
        playLightningThunder(0.92);
      } else if (type === "cheer") {
        // Stadium crowd cheering when mascot appears
        play("stadium", 0.45);
      } else if (type === "squash") {
        play("nav_switch", 0.35);
      } else if (type === "coin") {
        play("coin", 0.45);
      } else if (type === "streak") {
        play("fire_streak", 0.45);
      } else if (type === "xp") {
        play("xp_gain", 0.45);
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

        /* 4 HIGH-IMPACT CELEBRATION ANIMATIONS */
        /* 1. AUTHENTIC GYMNASTIC BACKFLIP (Stays strictly on position, crouches, jumps straight UP, backflips with behind & front lines, lands cleanly on feet) */
        .trophy-flip-core {
          transform-origin: 200px 225px;
          animation: realGymnastBackflip 3s infinite cubic-bezier(0.2, 0.8, 0.25, 1);
        }

        .backflip-behind-lines {
          animation: backflipBehindWhoosh 3s infinite ease-out;
        }

        .backflip-front-lines {
          animation: backflipFrontWhoosh 3s infinite ease-out;
        }

        .landing-impact-burst {
          transform-origin: 200px 355px;
          animation: landingImpactPulse 3s infinite ease-out;
        }

        .trophy-item {
          transform-origin: 200px 70px;
          animation: trophyFloatRays 3s infinite ease-in-out;
        }

        .trophy-shadow {
          transform-origin: 200px 365px;
          animation: backflipShadowTrack 3s infinite ease-in-out;
        }

        @keyframes realGymnastBackflip {
          /* 0% - 15%: Standing in position, ready & centered */
          0%, 15% {
            transform: translateY(0px) scale(1, 1) rotate(0deg);
          }
          /* 15% - 24%: Deep athletic crouch on the exact spot, gathering explosive spring power */
          24% {
            transform: translateY(22px) scale(1.18, 0.82) rotate(0deg);
          }
          /* 24% - 40%: Explosive vertical jump straight UP (NO rotation yet, pure vertical lift!) */
          40% {
            transform: translateY(-135px) scale(0.9, 1.18) rotate(0deg);
          }
          /* 40% - 48%: Apex reached, tucking knees to initiate backward pitch */
          48% {
            transform: translateY(-155px) scale(0.85, 0.85) rotate(-65deg);
          }
          /* 48% - 60%: Completely inverted upside down in mid-air (head goes back and behind in 3D arc) */
          58% {
            transform: translateY(-165px) scale(0.88, 0.88) rotate(-180deg);
          }
          /* 60% - 70%: Completing the backward arc, body whips around in front */
          68% {
            transform: translateY(-135px) scale(0.85, 0.95) rotate(-295deg);
          }
          /* 70% - 78%: Extending limbs to spot landing, descending vertically straight down to the spot */
          76% {
            transform: translateY(-38px) scale(0.94, 1.1) rotate(-360deg);
          }
          /* 78% - 86%: Solid landing touchdown on the exact spot, squashing into knees to absorb force */
          84% {
            transform: translateY(18px) scale(1.22, 0.78) rotate(-360deg);
          }
          /* 86% - 92%: Elastic rebound to upright stance */
          91% {
            transform: translateY(-4px) scale(0.98, 1.02) rotate(-360deg);
          }
          /* 92% - 100%: Sticks the landing, standing tall and proud in victory pose */
          100% {
            transform: translateY(0px) scale(1, 1) rotate(-360deg);
          }
        }

        /* Speed lines that pass BEHIND the mascot during jump & backflip initiation */
        @keyframes backflipBehindWhoosh {
          0%, 20% { opacity: 0; stroke-dashoffset: 300; }
          26% { opacity: 0.95; stroke-dashoffset: 140; }
          44% { opacity: 1; stroke-dashoffset: 0; }
          56% { opacity: 0.2; }
          66%, 100% { opacity: 0; stroke-dashoffset: 300; }
        }

        /* Speed lines that whip IN FRONT of the mascot as the flip completes and descends */
        @keyframes backflipFrontWhoosh {
          0%, 46% { opacity: 0; stroke-dashoffset: 300; }
          56% { opacity: 1; stroke-dashoffset: 90; }
          70% { opacity: 0.95; stroke-dashoffset: 0; }
          80% { opacity: 0.2; }
          86%, 100% { opacity: 0; stroke-dashoffset: 300; }
        }

        /* Impact burst on ground when landing */
        @keyframes landingImpactPulse {
          0%, 78% { opacity: 0; transform: scale(0.3); }
          84% { opacity: 1; transform: scale(1.25); }
          92% { opacity: 0; transform: scale(1.6); }
          100% { opacity: 0; transform: scale(0.3); }
        }

        @keyframes backflipShadowTrack {
          0%, 15% { transform: scale(1); opacity: 0.4; }
          24% { transform: scale(1.26); opacity: 0.58; }
          /* Shadow shrinks when high in the air */
          40% { transform: scale(0.42); opacity: 0.12; }
          58% { transform: scale(0.32); opacity: 0.08; }
          68% { transform: scale(0.45); opacity: 0.14; }
          /* Shadow snaps wide on touchdown */
          84% { transform: scale(1.35); opacity: 0.65; }
          91% { transform: scale(0.96); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.4; }
        }

        @keyframes trophyFloatRays {
          0%, 100% { transform: translateY(-8px) scale(1); filter: drop-shadow(0 0 10px rgba(251,191,36,0.7)); }
          58% { transform: translateY(-24px) scale(1.22) rotate(6deg); filter: drop-shadow(0 0 24px rgba(251,191,36,1)); }
          76% { transform: translateY(-12px) scale(1.05); }
        }

        /* 2. LIGHTNING SUPERCHARGE */
        .supercharge-vibrate {
          transform-origin: 200px 220px;
          animation: highVoltageJitter 0.16s infinite linear;
        }

        .electric-arc-left {
          animation: electricFlickerLeft 0.3s infinite steps(2, start);
        }

        .electric-arc-right {
          animation: electricFlickerRight 0.25s infinite steps(2, start);
        }

        @keyframes highVoltageJitter {
          0% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(-2px, 1.5px) scale(1.02); }
          40% { transform: translate(2px, -1.5px) scale(0.99); }
          60% { transform: translate(-1.5px, -1px) scale(1.03); }
          80% { transform: translate(1.5px, 2px) scale(0.99); }
          100% { transform: translate(0, 0) scale(1); }
        }

        @keyframes electricFlickerLeft {
          0%, 100% { opacity: 0.3; transform: scale(0.9) rotate(-5deg); }
          50% { opacity: 1; transform: scale(1.15) rotate(5deg); }
        }

        @keyframes electricFlickerRight {
          0%, 100% { opacity: 1; transform: scale(1.1) rotate(5deg); }
          50% { opacity: 0.2; transform: scale(0.85) rotate(-5deg); }
        }

        /* 3. AUTHENTIC B-BOY BREAKDANCE ROUTINE (Top-rock bounce + 6-step footwork + windmill spin + iconic 1-hand freeze hold) */
        .breakdance-bboy-groove {
          transform-origin: 200px 330px;
          animation: bboyBreakdanceMaster 3.6s infinite cubic-bezier(0.25, 1, 0.5, 1);
        }

        .breakdance-disc-floor {
          transform-origin: 200px 360px;
          animation: breakdanceFloorPulse 1.8s infinite ease-in-out;
        }

        .breakdance-notes-orbit {
          animation: breakdanceNotesDrift 6s infinite linear;
          transform-origin: 200px 220px;
        }

        @keyframes bboyBreakdanceMaster {
          /* PHASE 1: Top-rock groove to the beat (0% - 22%) */
          0% { transform: translateY(0) rotate(0deg) scale(1, 1); }
          6% { transform: translateY(-8px) rotate(-7deg) scale(0.98, 1.02); }
          12% { transform: translateY(4px) rotate(7deg) scale(1.03, 0.97); }
          18% { transform: translateY(-8px) rotate(-6deg) scale(0.98, 1.02); }
          
          /* PHASE 2: Drop low into 6-step footwork sweep (22% - 44%) */
          25% { transform: translateY(22px) rotate(16deg) scale(1.14, 0.86); }
          32% { transform: translateY(18px) rotate(-18deg) scale(1.12, 0.88); }
          40% { transform: translateY(24px) rotate(20deg) scale(1.15, 0.85); }
          
          /* PHASE 3: Windmill spin dynamic swirl (44% - 66%) */
          48% { transform: translateY(14px) rotate(110deg) scale(0.95, 0.95); }
          56% { transform: translateY(10px) rotate(230deg) scale(0.92, 0.92); }
          64% { transform: translateY(8px) rotate(340deg) scale(0.98, 0.98); }
          
          /* PHASE 4: POP INTO AN ICONIC ONE-HAND B-BOY FREEZE! (66% - 86%) */
          70%, 84% { transform: translateY(10px) rotate(-28deg) scale(1.08, 0.94); }
          
          /* PHASE 5: Spring back up onto feet (86% - 100%) */
          90% { transform: translateY(-12px) rotate(4deg) scale(0.96, 1.04); }
          96% { transform: translateY(3px) rotate(0deg) scale(1.02, 0.98); }
          100% { transform: translateY(0) rotate(0deg) scale(1, 1); }
        }

        @keyframes breakdanceFloorPulse {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.18); opacity: 0.65; }
        }

        @keyframes breakdanceNotesDrift {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 4. DUO HIGH FIVE */
        .duo-high-five-core {
          transform-origin: 200px 345px;
          animation: duoHighFiveLeap 1.9s infinite cubic-bezier(0.22, 1, 0.36, 1);
        }

        .slap-burst-ring {
          transform-origin: 310px 175px;
          animation: slapBurstFlash 1.9s infinite cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes duoHighFiveLeap {
          0% { transform: translateY(0) scale(1); }
          20% { transform: translateY(14px) scale(1.18, 0.82); }
          50% { transform: translateY(-38px) scale(1.26, 1.22); }
          65% { transform: translateY(-28px) scale(1.3, 1.26); }
          85% { transform: translateY(6px) scale(1.1, 0.9); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes slapBurstFlash {
          0%, 45% { transform: scale(0.2); opacity: 0; }
          52% { transform: scale(1.4); opacity: 1; }
          65% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(0.2); opacity: 0; }
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
        
        {/* TOP CELEBRATION HEADER */}
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-2">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/40 px-3.5 py-1 rounded-full text-amber-300 text-[11px] font-black tracking-widest uppercase shadow-sm">
            <Sparkles size={12} className="text-yellow-400 animate-spin" />
            <span>CHALLENGE COMPLETE</span>
            <Sparkles size={12} className="text-yellow-400 animate-spin" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
            Victory Celebration!
          </h1>
        </div>

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
              ) : mascotStyle === "happy_shuffle" ? (
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
              ) : mascotStyle === "trophy_flip" ? (
                <div className="w-full h-full relative !overflow-visible">
                  <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
                    <defs>
                      <radialGradient id="bodyGrad-tf" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="25%" stopColor="#a3e3ff" />
                        <stop offset="70%" stopColor="#21a7f0" />
                        <stop offset="100%" stopColor="#0066cc" />
                      </radialGradient>
                      <linearGradient id="goldGrad-tf" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fffbeb" />
                        <stop offset="30%" stopColor="#fde047" />
                        <stop offset="70%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#ca8a04" />
                      </linearGradient>
                      <linearGradient id="backflipTrailGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0} />
                        <stop offset="50%" stopColor="#ffffff" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id="backflipFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
                        <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    {/* Dynamic floor shadow tracks jump height & landing impact */}
                    <ellipse cx="200" cy="365" rx="130" ry="16" fill="#000000" className="trophy-shadow" />

                    {/* 1. ACROBATIC LINES BEHIND: Launch bursts & backward trajectory looping BEHIND the mascot */}
                    <g className="backflip-behind-lines" fill="none" strokeLinecap="round" opacity={0}>
                      {/* Launch air bursts shooting downward from takeoff point */}
                      <line x1="160" y1="330" x2="160" y2="370" stroke="#ffffff" strokeWidth={3} />
                      <line x1="200" y1="335" x2="200" y2="380" stroke="#38bdf8" strokeWidth={4} />
                      <line x1="240" y1="330" x2="240" y2="370" stroke="#ffffff" strokeWidth={3} />
                      
                      {/* Backward trajectory loop passing behind the jumping mascot */}
                      <path d="M170,330 C90,260 80,95 200,50" stroke="url(#backflipTrailGrad)" strokeWidth={7} strokeDasharray="320" />
                      <path d="M185,325 C120,250 115,115 200,75" stroke="#ffffff" strokeWidth={3.5} strokeDasharray="260" opacity={0.9} />
                    </g>

                    {/* Floating Gold Champion Trophy */}
                    <g className="trophy-item">
                      <g filter="drop-shadow(0 0 12px rgba(251,191,36,0.8))">
                        <path d="M170,40 L230,40 L222,80 Q200,105 178,80 Z" fill="url(#goldGrad-tf)" stroke="#ca8a04" strokeWidth={2.5} />
                        <path d="M172,48 C150,50 150,72 174,74" fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
                        <path d="M228,48 C250,50 250,72 226,74" fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
                        <rect x="195" y="85" width="10" height="15" rx="2" fill="#ca8a04" />
                        <path d="M180,100 L220,100 L225,108 L175,108 Z" fill="#b45309" />
                        <polygon points="200,52 203,61 212,61 205,66 208,75 200,69 192,75 195,66 188,61 197,61" fill="#ffffff" />
                      </g>
                    </g>

                    {/* 2. THE MASCOT CORE (Stays strictly on center position, crouches, leaps straight UP, backflips, sticks landing) */}
                    <g className="trophy-flip-core">
                      {/* Ears */}
                      <path d="M125,120 Q105,75 140,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2.5} />
                      <path d="M275,120 Q295,75 260,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2.5} />

                      {/* Mascot Slime Body */}
                      <ellipse cx="200" cy="215" rx="160" ry="130" fill="url(#bodyGrad-tf)" />

                      {/* Joyous Champion Facial Features (Eyes, mouth, cheeks flip naturally with body) */}
                      <g>
                        {/* Cheeks */}
                        <ellipse cx="120" cy="205" rx="14" ry="7" fill="#ff6b8b" opacity={0.65} />
                        <ellipse cx="280" cy="205" rx="14" ry="7" fill="#ff6b8b" opacity={0.65} />
                        
                        {/* Happy champion eyes */}
                        <path d="M132,175 Q147,155 162,175" stroke="#031b33" strokeWidth={6} strokeLinecap="round" fill="none" />
                        <path d="M238,175 Q253,155 268,175" stroke="#031b33" strokeWidth={6} strokeLinecap="round" fill="none" />
                        
                        {/* Open joyous mouth */}
                        <path d="M185,195 Q200,205 215,195 Q200,230 185,195 Z" fill="#b3243d" stroke="#031b33" strokeWidth={4} strokeLinejoin="round" />
                        <path d="M190,206 Q200,200 210,206 Q200,224 190,206 Z" fill="#ff6b8b" />
                      </g>

                      {/* Athletic tucked arms */}
                      <ellipse cx="78" cy="180" rx="18" ry="24" fill="#60a5fa" stroke="#0284c7" strokeWidth={2} transform="rotate(-30 78 180)" />
                      <ellipse cx="322" cy="180" rx="18" ry="24" fill="#60a5fa" stroke="#0284c7" strokeWidth={2} transform="rotate(30 322 180)" />

                      {/* Chest Emblem */}
                      <text x="200" y="278" fontFamily="system-ui, sans-serif" fontWeight={900} fontSize={64} fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 2px 10px rgba(255,255,255,0.6))">N</text>
                    </g>

                    {/* 3. ACROBATIC LINES IN FRONT: Forward whip lines wrapping over apex and IN FRONT of mascot */}
                    <g className="backflip-front-lines" fill="none" strokeLinecap="round" opacity={0}>
                      {/* Arc coming over apex and swooping down IN FRONT of body */}
                      <path d="M200,50 C320,95 310,260 230,330" stroke="url(#backflipFrontGrad)" strokeWidth={7} strokeDasharray="320" />
                      <path d="M200,75 C285,115 280,250 215,325" stroke="#ffffff" strokeWidth={3.5} strokeDasharray="260" opacity={0.95} />
                    </g>

                    {/* 4. GROUND IMPACT BURST: Expanding rings on touchdown */}
                    <g className="landing-impact-burst" opacity={0}>
                      <ellipse cx="200" cy="360" rx="65" ry="12" fill="none" stroke="#ffffff" strokeWidth={3} />
                      <ellipse cx="200" cy="360" rx="95" ry="16" fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="8 6" />
                      <circle cx="130" cy="355" r="4" fill="#fde047" />
                      <circle cx="270" cy="355" r="4" fill="#fde047" />
                      <circle cx="165" cy="368" r="3" fill="#ffffff" />
                      <circle cx="235" cy="368" r="3" fill="#ffffff" />
                    </g>
                  </svg>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 shuffle-text text-amber-400">CHAMPION BACKFLIP! 🏆</div>
                </div>
              ) : mascotStyle === "lightning_supercharge" ? (
                <div className="w-full h-full relative !overflow-visible">
                  <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
                    <defs>
                      <radialGradient id="bodyGrad-ls" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#e0f2fe" />
                        <stop offset="30%" stopColor="#38bdf8" />
                        <stop offset="70%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#0369a1" />
                      </radialGradient>
                      <linearGradient id="electricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="50%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                    </defs>

                    <ellipse cx="200" cy="355" rx="130" ry="14" fill="#000000" opacity="0.45" />

                    {/* Electric Arcs */}
                    <g className="electric-arc-left" stroke="url(#electricGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 10px rgba(56,189,248,0.9))">
                      <path d="M70,140 L50,180 L80,195 L40,260" />
                      <path d="M100,100 L85,130 L105,145 L75,200" />
                    </g>

                    <g className="electric-arc-right" stroke="url(#electricGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 10px rgba(253,224,71,0.9))">
                      <path d="M330,140 L350,180 L320,195 L360,260" />
                      <path d="M300,100 L315,130 L295,145 L325,200" />
                    </g>

                    {/* Vibrating High-Voltage Mascot */}
                    <g className="supercharge-vibrate">
                      <ellipse cx="200" cy="72" rx="98" ry="16" fill="none" stroke="#38bdf8" strokeWidth={10} filter="drop-shadow(0 0 16px rgba(56,189,248,1))" />

                      <path d="M125,120 Q105,70 140,88 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth={3} />
                      <path d="M275,120 Q295,70 260,88 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth={3} />

                      <ellipse cx="200" cy="215" rx="160" ry="130" fill="url(#bodyGrad-ls)" stroke="#7dd3fc" strokeWidth="3" />

                      {/* Supercharged Glowing Electric Eyes */}
                      <g filter="drop-shadow(0 0 8px rgba(253,224,71,1))">
                        <circle cx="145" cy="180" r="24" fill="#0f172a" />
                        <circle cx="145" cy="180" r="18" fill="#38bdf8" />
                        <polygon points="145,168 141,180 148,180 143,192 151,178 145,178" fill="#fef08a" />

                        <circle cx="255" cy="180" r="24" fill="#0f172a" />
                        <circle cx="255" cy="180" r="18" fill="#38bdf8" />
                        <polygon points="255,168 251,180 258,180 253,192 261,178 255,178" fill="#fef08a" />
                      </g>

                      <path d="M180,205 Q200,225 220,205" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                      <path d="M185,208 L195,208 M205,208 L215,208" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

                      <ellipse cx="68" cy="225" rx="20" ry="24" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
                      <ellipse cx="332" cy="225" rx="20" ry="24" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />

                      <text x="200" y="278" fontFamily="system-ui, sans-serif" fontWeight={900} fontSize={64} fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 0 16px rgba(56,189,248,1))">N</text>
                    </g>
                  </svg>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 shuffle-text text-cyan-400">SUPERCHARGED! ⚡</div>
                </div>
              ) : mascotStyle === "breakdance_spin" ? (
                <div className="w-full h-full relative !overflow-visible">
                  <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
                    <defs>
                      <radialGradient id="bodyGrad-bd" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="25%" stopColor="#a3e3ff" />
                        <stop offset="70%" stopColor="#21a7f0" />
                        <stop offset="100%" stopColor="#0066cc" />
                      </radialGradient>
                      <radialGradient id="danceFloorGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
                        <stop offset="70%" stopColor="#0284c7" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                      </radialGradient>
                    </defs>

                    {/* Dynamic Dance Floor with Pulsing Audio Beat Ripple Rings */}
                    <ellipse cx="200" cy="360" rx="140" ry="18" fill="url(#danceFloorGlow)" className="breakdance-disc-floor" />
                    <ellipse cx="200" cy="360" rx="110" ry="14" fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="10 8" className="breakdance-disc-floor" />
                    <ellipse cx="200" cy="360" rx="80" ry="10" fill="#000000" opacity={0.4} />

                    {/* Orbiting Musical Notes & Beat Sparks */}
                    <g className="breakdance-notes-orbit">
                      <text x="75" y="130" fontSize="26" filter="drop-shadow(0 0 8px rgba(56,189,248,0.8))">🎵</text>
                      <text x="325" y="140" fontSize="22" filter="drop-shadow(0 0 8px rgba(251,191,36,0.8))">✨</text>
                      <text x="85" y="275" fontSize="22" filter="drop-shadow(0 0 8px rgba(96,165,250,0.8))">🎶</text>
                      <text x="315" y="280" fontSize="24" filter="drop-shadow(0 0 8px rgba(244,63,94,0.8))">💫</text>
                    </g>

                    {/* Authentic B-Boy Breakdance Routine (Top-rock bounce + 6-step sweep + windmill + 1-hand freeze) */}
                    <g className="breakdance-bboy-groove">
                      {/* Slime cat ears */}
                      <path d="M125,120 Q105,75 140,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2.5} />
                      <path d="M275,120 Q295,75 260,88 Z" fill="#21a7f0" stroke="#0055b3" strokeWidth={2.5} />

                      {/* Iconic Nexora Blue Slime Body */}
                      <ellipse cx="200" cy="215" rx="160" ry="130" fill="url(#bodyGrad-bd)" />

                      {/* Street B-Boy Backwards Snapback Cap in Gold/Amber */}
                      <g>
                        {/* Cap crown */}
                        <path d="M135,145 C135,85 265,85 265,145 Z" fill="#f59e0b" stroke="#b45309" strokeWidth={3} />
                        {/* Backwards visor curved behind */}
                        <path d="M125,145 C125,160 275,160 275,145 Q200,165 125,145 Z" fill="#d97706" stroke="#b45309" strokeWidth={2} />
                        {/* Gold star insignia on cap */}
                        <polygon points="200,105 203,113 212,113 205,118 208,126 200,121 192,126 195,118 188,113 197,113" fill="#ffffff" />
                      </g>

                      {/* Cute Rosy Blushing Cheeks */}
                      <ellipse cx="115" cy="205" rx="14" ry="7" fill="#ff6b8b" opacity={0.7} />
                      <ellipse cx="285" cy="205" rx="14" ry="7" fill="#ff6b8b" opacity={0.7} />

                      {/* Expressive B-Boy Mascot Eyes (Big sparkly left eye, stylish confident wink on right eye) */}
                      <g>
                        {/* Left eye: Wide sparkly anime pupil */}
                        <circle cx="145" cy="180" r="15" fill="#031b33" />
                        <ellipse cx="142" cy="175" rx="5" ry="6" fill="#ffffff" />
                        <circle cx="149" cy="184" r="2.5" fill="#ffffff" />
                        <path d="M132,166 Q146,158 160,166" stroke="#0055b3" strokeWidth={3} strokeLinecap="round" fill="none" />

                        {/* Right eye: Playful wink for the freeze */}
                        <path d="M240,180 Q255,168 270,180" stroke="#031b33" strokeWidth={5} strokeLinecap="round" fill="none" />
                        <path d="M242,166 Q255,158 268,166" stroke="#0055b3" strokeWidth={3} strokeLinecap="round" fill="none" />
                      </g>

                      {/* Confident B-Boy Smirk & Smile */}
                      <path d="M185,198 Q200,206 215,198 Q202,228 185,198 Z" fill="#b3243d" stroke="#031b33" strokeWidth={3.5} strokeLinejoin="round" />
                      <path d="M190,207 Q200,202 210,207 Q200,223 190,207 Z" fill="#ff6b8b" />

                      {/* B-Boy Arms: Left arm planted for 1-hand freeze, Right arm gesturing peace sign */}
                      {/* Left planted arm */}
                      <ellipse cx="70" cy="235" rx="20" ry="26" fill="#60a5fa" stroke="#0284c7" strokeWidth={2.5} transform="rotate(35 70 235)" />
                      {/* Right gesturing arm with peace sign */}
                      <g transform="rotate(-30 330 190)">
                        <ellipse cx="330" cy="190" rx="20" ry="26" fill="#60a5fa" stroke="#0284c7" strokeWidth={2.5} />
                        <line x1="336" y1="170" x2="344" y2="155" stroke="#60a5fa" strokeWidth={6} strokeLinecap="round" />
                        <line x1="344" y1="172" x2="356" y2="160" stroke="#60a5fa" strokeWidth={6} strokeLinecap="round" />
                      </g>

                      {/* Chest Emblem */}
                      <text x="200" y="278" fontFamily="system-ui, sans-serif" fontWeight={900} fontSize={64} fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 2px 10px rgba(255,255,255,0.6))">N</text>
                    </g>
                  </svg>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 shuffle-text text-cyan-300">B-BOY FREEZE! 🕺</div>
                </div>
              ) : (
                /* DUO HIGH FIVE */
                <div className="w-full h-full relative !overflow-visible">
                  <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: "visible" }}>
                    <defs>
                      <radialGradient id="bodyGrad-hf" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="25%" stopColor="#fef08a" />
                        <stop offset="70%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </radialGradient>
                    </defs>

                    <ellipse cx="200" cy="360" rx="130" ry="15" fill="#000000" opacity="0.4" />

                    {/* High-five dynamic shockwave impact ring */}
                    <g className="slap-burst-ring">
                      <circle cx="310" cy="175" r="45" fill="none" stroke="#fbbf24" strokeWidth="6" strokeDasharray="8 6" />
                      <circle cx="310" cy="175" r="30" fill="rgba(251,191,36,0.3)" />
                      <path d="M310,120 L310,105 M355,150 L370,145 M350,210 L365,220 M270,210 L255,225" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                    </g>

                    {/* Mascot Leaping Core */}
                    <g className="duo-high-five-core">
                      <ellipse cx="200" cy="75" rx="95" ry="16" fill="none" stroke="#fde047" strokeWidth={9} filter="drop-shadow(0 0 8px rgba(253,224,71,0.7))" />

                      <path d="M125,120 Q105,75 140,88 Z" fill="#f59e0b" stroke="#b45309" strokeWidth={2} />
                      <path d="M275,120 Q295,75 260,88 Z" fill="#f59e0b" stroke="#b45309" strokeWidth={2} />

                      <ellipse cx="200" cy="215" rx="160" ry="130" fill="url(#bodyGrad-hf)" stroke="#fde047" strokeWidth="2.5" />

                      <g>
                        <circle cx="145" cy="180" r="25" fill="#451a03" />
                        <circle cx="138" cy="172" r="9" fill="#ffffff" />
                        <circle cx="153" cy="188" r="4" fill="#ffffff" />

                        <circle cx="255" cy="180" r="25" fill="#451a03" />
                        <circle cx="248" cy="172" r="9" fill="#ffffff" />
                        <circle cx="263" cy="188" r="4" fill="#ffffff" />
                      </g>

                      <path d="M182,198 Q200,208 218,198 Q200,234 182,198 Z" fill="#991b1b" stroke="#451a03" strokeWidth={4.5} strokeLinejoin="round" />
                      <path d="M188,212 Q200,206 212,212 Q200,230 188,212 Z" fill="#f87171" />

                      <ellipse cx="74" cy="230" rx="18" ry="24" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />

                      {/* Giant Outstretched High Five Hand */}
                      <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))">
                        <ellipse cx="320" cy="180" rx="26" ry="32" fill="#fbbf24" stroke="#b45309" strokeWidth="3" transform="rotate(-15 320 180)" />
                        <circle cx="312" cy="155" r="9" fill="#fde047" stroke="#b45309" strokeWidth="2" />
                        <circle cx="328" cy="158" r="9" fill="#fde047" stroke="#b45309" strokeWidth="2" />
                        <circle cx="340" cy="168" r="8" fill="#fde047" stroke="#b45309" strokeWidth="2" />
                      </g>

                      <text x="200" y="278" fontFamily="system-ui, sans-serif" fontWeight={900} fontSize={64} fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 2px 10px rgba(255,255,255,0.6))">N</text>
                    </g>
                  </svg>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 shuffle-text text-amber-300">HIGH FIVE! ✋</div>
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
