import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Sparkles, Award } from "lucide-react";
import { vibrate } from "../lib/vibrate";
import { UserStats } from "../types";

interface RewardsScreenProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats> | ((prev: UserStats) => UserStats)) => void;
  settings?: any;
  onFinish: () => void;
}

export function RewardsScreen({
  stats,
  onUpdateStats,
  settings,
  onFinish,
}: RewardsScreenProps) {
  const [tapCount, setTapCount] = useState(0);
  const [coinsAdded, setCoinsAdded] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [statusText, setStatusText] = useState("Tap the Box 3 Times to Open");
  const [statusColor, setStatusColor] = useState("#788f9a");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Web Audio Synthesis for AAA juicy SFX
  const playSoundEffect = (type: "thud1" | "thud2" | "launch" | "coin", coinIndex = 0) => {
    if (settings?.soundEnabled === false) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      if (type === "thud1") {
        // Tap 1: Heavy wooden thud + chain rattle (Low pitch)
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(85, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        // Chain metal clink rattle simulation
        for (let i = 0; i < 3; i++) {
          const rattleOsc = ctx.createOscillator();
          const rattleGain = ctx.createGain();
          rattleOsc.type = "sine";
          rattleOsc.frequency.setValueAtTime(1800 + i * 500, now);
          rattleGain.gain.setValueAtTime(0, now);
          rattleGain.gain.linearRampToValueAtTime(0.05, now + 0.01 + i * 0.01);
          rattleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + i * 0.02);
          
          rattleOsc.connect(rattleGain);
          rattleGain.connect(ctx.destination);
          rattleOsc.start(now);
          rattleOsc.stop(now + 0.15);
        }

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

      } else if (type === "thud2") {
        // Tap 2: Slightly higher pitch wooden thud for tension
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        // Chain metal clink rattle simulation (higher pitch)
        for (let i = 0; i < 3; i++) {
          const rattleOsc = ctx.createOscillator();
          const rattleGain = ctx.createGain();
          rattleOsc.type = "sine";
          rattleOsc.frequency.setValueAtTime(2200 + i * 600, now);
          rattleGain.gain.setValueAtTime(0, now);
          rattleGain.gain.linearRampToValueAtTime(0.06, now + 0.01 + i * 0.01);
          rattleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + i * 0.02);
          
          rattleOsc.connect(rattleGain);
          rattleGain.connect(ctx.destination);
          rattleOsc.start(now);
          rattleOsc.stop(now + 0.15);
        }

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

      } else if (type === "launch") {
        // Tap 3 (Immediate): Cinematic swoosh + shatter/pop blast
        // Swoosh noise setup
        const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(120, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.4);
        filter.Q.setValueAtTime(3.0, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseNode.start(now);
        noiseNode.stop(now + 0.5);

        // Power pop/shatter bass element
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(150, now);
        subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.35);

        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.35);

        // High crystal shatter/shimmer
        const shimmerOsc = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmerOsc.type = "sine";
        shimmerOsc.frequency.setValueAtTime(3000, now);
        shimmerOsc.frequency.exponentialRampToValueAtTime(100, now + 0.4);

        shimmerGain.gain.setValueAtTime(0, now);
        shimmerGain.gain.linearRampToValueAtTime(0.12, now + 0.01);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(ctx.destination);
        shimmerOsc.start(now);
        shimmerOsc.stop(now + 0.4);

      } else if (type === "coin") {
        // High register crystal coin chime hitting a solid surface (ping!)
        // Pitch escalates for each coin (0 to 4)
        const baseFreqs = [987.77, 1109.73, 1318.51, 1479.98, 1661.22]; // B5, C#6, E6, F#6, G#6
        const f = baseFreqs[coinIndex] || 1318.51;

        // Multi-partial metallic chime synthesis (fundamental + high partials)
        const partials = [1.0, 2.2, 3.4, 4.8];
        const partialGains = [0.18, 0.08, 0.04, 0.02];

        partials.forEach((mult, index) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(f * mult, now);

          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(partialGains[index], now + 0.005);
          // Exponential decay, fundamental decays slower than high partials
          const decay = 0.4 / mult;
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + decay);
        });
      }
    } catch (e) {
      console.warn("Audio synthesis failed:", e);
    }
  };

  const handleChestClick = () => {
    if (tapCount >= 3) return;

    const nextTap = tapCount + 1;
    setTapCount(nextTap);
    vibrate(15);

    if (nextTap === 1) {
      playSoundEffect("thud1");
      setStatusText("2 Taps Remaining...");
      setStatusColor("#788f9a");
    } else if (nextTap === 2) {
      playSoundEffect("thud2");
      setStatusText("FINAL TAP INITIALIZED!!!");
      setStatusColor("#FF9600");
    } else if (nextTap === 3) {
      playSoundEffect("launch");
      setStatusText("Protocol Rewards Disbursed!");
      setStatusColor("#FFD000");

      // Dim out instruction text
      setTimeout(() => {
        setStatusColor("rgba(120, 143, 154, 0)");
      }, 900);

      // Start coins sequence
      animateCoinCounter();
    }
  };

  const animateCoinCounter = () => {
    // Coins appear 1050ms after the tap-3 transition triggers (perfectly synced with cinematicCoin1-5 animations)
    setTimeout(() => {
      let currentCoins = 0;
      const interval = setInterval(() => {
        currentCoins++;
        setCoinsAdded(currentCoins);
        playSoundEffect("coin", currentCoins - 1);
        vibrate(8);

        // Increment user's actual coins count in the backend on each step!
        onUpdateStats((prev) => ({
          ...prev,
          coins: (prev.coins || 0) + 1,
        }));

        if (currentCoins >= 5) {
          clearInterval(interval);
          // Make "Next" button appear when the chest box animation and coin counters are finished!
          setTimeout(() => {
            setShowNext(true);
          }, 600);
        }
      }, 120);
    }, 1050);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0d1518] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* EXPLICIT STYLES FOR CINEMATIC 3D CHEST & COIN PHYSICS */}
      <style>{`
        /* THE MASTER VIEWPORT CONTAINER */
        .chest-stage {
          width: 260px;
          height: 260px;
          position: relative;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* SPINNING BACKGROUND GLOW */
        .reward-glow {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 300px;
          height: 300px;
          opacity: 0;
          transform: scale(0.4);
          pointer-events: none;
          z-index: 1;
        }
        .tap-3 .reward-glow {
          animation: glowBurst 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards, spinGlow 15s linear infinite;
          animation-delay: 0.48s;
        }

        /* CORE JUMP MESH */
        .box-mesh {
          width: 100%;
          height: 100%;
          transform-origin: 100px 160px;
          position: relative;
          z-index: 2;
        }

        /* 3-TAP JUMP PHYSICS + VANISH TRIGGER */
        .tap-1 .box-mesh { animation: popJump1 0.45s ease-in-out forwards; }
        .tap-2 .box-mesh { animation: popJump2 0.6s ease-in-out forwards; }
        .tap-3 .box-mesh { animation: finalLaunchOpenVanish 1.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }

        .box-lid { transform-origin: 100px 75px; }
        .tap-3 .box-lid { animation: lidSpringBack 0.52s cubic-bezier(0.175, 0.885, 0.32, 1.4) forwards; animation-delay: 0.48s; }

        .box-lock { transform-origin: 100px 112px; }
        .tap-3 .box-lock { animation: lockSnapFall 0.45s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards; animation-delay: 0.48s; }

        /* =======================================================
           3D CINEMATIC COIN PHYSICS (Slightly lowered to frame center)
           ======================================================= */
        .coin-wrapper {
          position: absolute;
          top: 80px;
          left: 105px;
          width: 46px;
          height: 46px;
          opacity: 0;
          z-index: 10;
          pointer-events: none;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
        }

        .coin-wrapper svg {
          animation: coinGlowPulse 1.2s ease-in-out infinite alternate;
        }

        .tap-3 #coin1 { animation: cinematicCoin1 1.1s cubic-bezier(0.215, 0.610, 0.355, 1) forwards; animation-delay: 0.52s; }
        .tap-3 #coin2 { animation: cinematicCoin2 1.15s cubic-bezier(0.215, 0.610, 0.355, 1) forwards; animation-delay: 0.56s; }
        .tap-3 #coin3 { animation: cinematicCoin3 1.05s cubic-bezier(0.215, 0.610, 0.355, 1) forwards; animation-delay: 0.50s; }
        .tap-3 #coin4 { animation: cinematicCoin4 1.2s cubic-bezier(0.215, 0.610, 0.355, 1) forwards; animation-delay: 0.60s; }
        .tap-3 #coin5 { animation: cinematicCoin5 1.25s cubic-bezier(0.215, 0.610, 0.355, 1) forwards; animation-delay: 0.64s; }

        /* REWARD COUNTER POP */
        .reward-counter {
          position: absolute;
          top: -60px;
          font-size: 3.5rem;
          font-weight: 900;
          color: #FFD000;
          text-shadow: 0 5px 0 #0F172A, 0 8px 25px rgba(255,208,0,0.5);
          opacity: 0;
          transform: scale(0.5);
          z-index: 100;
          pointer-events: none;
          width: 100%;
          text-align: center;
          transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.4);
        }
        .tap-3 .reward-counter {
          animation: counterPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.3) forwards;
          animation-delay: 0.9s;
        }

        /* =======================================================
           THE REWARD PHYSICS & VANISH MATRIX
           ======================================================= */
        @keyframes popJump1 {
          0% { transform: scale(1) translateY(0); }
          15% { transform: scale(1.15, 0.85) translateY(4px); }
          45% { transform: scale(0.92, 1.08) translateY(-25px) rotate(4deg); }
          70% { transform: scale(1.18, 0.82) translateY(0); }
          100% { transform: scale(1) translateY(0); }
        }

        @keyframes popJump2 {
          0% { transform: scale(1) translateY(0); }
          15% { transform: scale(1.24, 0.76) translateY(6px); }
          45% { transform: scale(0.88, 1.15) translateY(-55px) rotate(-6deg); }
          72% { transform: scale(1.28, 0.72) translateY(0); }
          100% { transform: scale(1) translateY(0); }
        }

        /* THE LAUNCH + EXPLOSIVE VORTEX VANISH */
        @keyframes finalLaunchOpenVanish {
          0% { transform: scale(1) translateY(0); filter: brightness(1); opacity: 1; }
          10% { transform: scale(1.35, 0.55) translateY(12px); }
          32% { transform: scale(0.76, 1.35) translateY(-100px); }
          48% { transform: scale(1.45, 0.55) translateY(0); filter: brightness(1.2); } /* Slams down open */
          
          /* THE SUCK OUT / VANISH SEQUENCE: Starts around 0.85s */
          65% { transform: scale(1.6, 0.3) translateY(15px); opacity: 1; filter: brightness(2); }
          78% { transform: scale(0.05, 2.5) translateY(-40px); opacity: 0.3; }
          85% { transform: scale(0) translateY(-60px); opacity: 0; }
          100% { transform: scale(0) translateY(0); opacity: 0; }
        }

        @keyframes lidSpringBack {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-76deg) translateY(-12px); }
        }

        @keyframes lockSnapFall {
          0% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: translateY(80px) rotate(-45deg); opacity: 0; }
        }

        @keyframes glowBurst { 100% { opacity: 0.55; transform: scale(1.3); } }
        @keyframes spinGlow { 100% { transform: scale(1.3) rotate(360deg); } }
        
        @keyframes coinGlowPulse {
          0% { filter: drop-shadow(0 0 2px rgba(255, 208, 0, 0.5)); }
          100% { filter: drop-shadow(0 0 14px rgba(255, 208, 0, 0.95)); }
        }

        @keyframes counterPopIn {
          100% { opacity: 1; transform: scale(1) translateY(100px); } /* Shifts down gracefully when box clears */
        }

        /* 3D COIN DROP SETTLES CENTER GRID INSTEAD */
        @keyframes cinematicCoin1 {
          0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
          35% { transform: translate(-90px, -140px) scale(2.4) rotate(-60deg); opacity: 1; }
          65% { transform: translate(-100px, 10px) scale(1) rotate(-110deg); opacity: 1; }
          82% { transform: translate(-105px, -10px) scale(1.05) rotate(-130deg); opacity: 1; }
          100% { transform: translate(-102px, 0px) scale(1) rotate(-120deg); opacity: 1; }
        }
        @keyframes cinematicCoin2 {
          0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
          35% { transform: translate(-45px, -170px) scale(2.5) rotate(-30deg); opacity: 1; }
          65% { transform: translate(-50px, 15px) scale(1) rotate(-70deg); opacity: 1; }
          82% { transform: translate(-53px, -5px) scale(1.05) rotate(-85deg); opacity: 1; }
          100% { transform: translate(-51px, 5px) scale(1) rotate(-80deg); opacity: 1; }
        }
        @keyframes cinematicCoin3 {
          0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
          35% { transform: translate(0px, -190px) scale(2.7) rotate(0deg); opacity: 1; }
          65% { transform: translate(0px, 20px) scale(1) rotate(0deg); opacity: 1; }
          82% { transform: translate(0px, -2px) scale(1.05) rotate(5deg); opacity: 1; }
          100% { transform: translate(0px, 10px) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes cinematicCoin4 {
          0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
          35% { transform: translate(45px, -170px) scale(2.5) rotate(30deg); opacity: 1; }
          65% { transform: translate(50px, 15px) scale(1) rotate(70deg); opacity: 1; }
          82% { transform: translate(53px, -5px) scale(1.05) rotate(85deg); opacity: 1; }
          100% { transform: translate(51px, 5px) scale(1) rotate(80deg); opacity: 1; }
        }
        @keyframes cinematicCoin5 {
          0% { transform: translate(0, 0) scale(0.3) rotate(0deg); opacity: 0; }
          35% { transform: translate(90px, -140px) scale(2.4) rotate(60deg); opacity: 1; }
          65% { transform: translate(100px, 10px) scale(1) rotate(110deg); opacity: 1; }
          82% { transform: translate(105px, -10px) scale(1.05) rotate(130deg); opacity: 1; }
          100% { transform: translate(102px, 0px) scale(1) rotate(120deg); opacity: 1; }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-between min-h-[80vh]">
        {/* Top Header */}
        <div className="space-y-3 mt-4">
          <p className="text-yellow-500 font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-1">
            <Sparkles size={14} className="animate-pulse" />
            Claim Your Reward, Bro!
            <Sparkles size={14} className="animate-pulse" />
          </p>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            Epic Chest Disbursed
          </h2>
        </div>

        {/* Dynamic Tip / Instructions */}
        <div 
          className="test-tip" 
          style={{ 
            color: statusColor, 
            transition: "all 0.4s ease-in-out",
            fontWeight: 800,
            fontSize: "1.1rem",
            textTransform: "uppercase",
            letterSpacing: "1.5px"
          }}
        >
          {statusText}
        </div>

        {/* The Master Viewport Container */}
        <div 
          id="pwaChest"
          onClick={handleChestClick}
          className={`chest-stage select-none ${
            tapCount === 1 ? "tap-1" : tapCount === 2 ? "tap-2" : tapCount >= 3 ? "tap-3" : ""
          }`}
        >
          {/* Big Core Total Counter */}
          <div className="reward-counter" id="coinCounter">
            +{coinsAdded}
          </div>

          {/* Spinning Background Glow */}
          <svg className="reward-glow" viewBox="0 0 200 200">
            <g fill="#FFD000" opacity="0.3">
              <path d="M100,100 L80,0 L120,0 Z"/>
              <path d="M100,100 L200,80 L200,120 Z"/>
              <path d="M100,100 L120,200 L80,200 Z"/>
              <path d="M100,100 L0,120 L0,80 Z"/>
              <path d="M100,100 L170,30 L140,15 Z"/>
              <path d="M100,100 L170,170 L185,140 Z"/>
            </g>
          </svg>

          {/* COIN VECTOR MESHES */}
          <div className="coin-wrapper" id="coin1">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#FF9600" stroke="#0F172A" strokeWidth="3.5"/>
              <circle cx="20" cy="20" r="14" fill="#FFD000"/>
              <path d="M14,14 L26,14 L26,18 L20,18 L20,22 L26,22 L26,26 L14,26 Z" fill="#FF9600" opacity="0.3"/>
              <rect x="18" y="10" width="4" height="20" rx="2" fill="#FFF" opacity="0.5"/>
            </svg>
          </div>
          <div className="coin-wrapper" id="coin2">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#FF9600" stroke="#0F172A" strokeWidth="3.5"/>
              <circle cx="20" cy="20" r="14" fill="#FFD000"/>
              <path d="M14,14 L26,14 L26,18 L20,18 L20,22 L26,22 L26,26 L14,26 Z" fill="#FF9600" opacity="0.3"/>
              <rect x="18" y="10" width="4" height="20" rx="2" fill="#FFF" opacity="0.5"/>
            </svg>
          </div>
          <div className="coin-wrapper" id="coin3">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#FF9600" stroke="#0F172A" strokeWidth="3.5"/>
              <circle cx="20" cy="20" r="14" fill="#FFD000"/>
              <path d="M14,14 L26,14 L26,18 L20,18 L20,22 L26,22 L26,26 L14,26 Z" fill="#FF9600" opacity="0.3"/>
              <rect x="18" y="10" width="4" height="20" rx="2" fill="#FFF" opacity="0.5"/>
            </svg>
          </div>
          <div className="coin-wrapper" id="coin4">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#FF9600" stroke="#0F172A" strokeWidth="3.5"/>
              <circle cx="20" cy="20" r="14" fill="#FFD000"/>
              <path d="M14,14 L26,14 L26,18 L20,18 L20,22 L26,22 L26,26 L14,26 Z" fill="#FF9600" opacity="0.3"/>
              <rect x="18" y="10" width="4" height="20" rx="2" fill="#FFF" opacity="0.5"/>
            </svg>
          </div>
          <div className="coin-wrapper" id="coin5">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#FF9600" stroke="#0F172A" strokeWidth="3.5"/>
              <circle cx="20" cy="20" r="14" fill="#FFD000"/>
              <path d="M14,14 L26,14 L26,18 L20,18 L20,22 L26,22 L26,26 L14,26 Z" fill="#FF9600" opacity="0.3"/>
              <rect x="18" y="10" width="4" height="20" rx="2" fill="#FFF" opacity="0.5"/>
            </svg>
          </div>

          {/* Main Chest Mesh */}
          <svg className="box-mesh" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="chestnutWood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B4A"/>
                <stop offset="100%" stopColor="#D84324"/>
              </linearGradient>
              <linearGradient id="cartoonGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD000"/>
                <stop offset="100%" stopColor="#FF9600"/>
              </linearGradient>
              <linearGradient id="silverLock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F8FAFC"/>
                <stop offset="100%" stopColor="#94A3B8"/>
              </linearGradient>
            </defs>

            {/* BASE */}
            <g className="box-base">
              <rect x="30" y="75" width="140" height="85" rx="14" fill="url(#chestnutWood)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
              <path d="M34,125 L166,125 L166,146 C166,154 154,156 146,156 L54,156 C46,156 34,154 34,146 Z" fill="#0F172A" opacity="0.14" />
              <rect x="30" y="82" width="20" height="78" rx="4" fill="url(#cartoonGold)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
              <rect x="150" y="82" width="20" height="78" rx="4" fill="url(#cartoonGold)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
            </g>

            {/* LID */}
            <g className="box-lid">
              <path d="M30,75 L45,45 L155,45 L170,75 Z" fill="url(#chestnutWood)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
              <path d="M30,75 L45,45 L62,45 L48,75 Z" fill="url(#cartoonGold)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
              <path d="M170,75 L155,45 L138,45 L152,75 Z" fill="url(#cartoonGold)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
              <rect x="24" y="71" width="152" height="13" rx="5" fill="url(#cartoonGold)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
              <rect x="85" y="71" width="30" height="25" rx="4" fill="url(#cartoonGold)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
            </g>

            {/* LOCK */}
            <g className="box-lock">
              <rect x="94" y="112" width="12" height="15" fill="url(#silverLock)" stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round"/>
              <circle cx="100" cy="112" r="15" fill="url(#silverLock)" stroke="#0F172A" strokeWidth="4.5" />
              <circle cx="100" cy="112" r="4" fill="#0F172A" />
            </g>
          </svg>
        </div>

        {/* Display Current Coin Balance Info */}
        <div className="text-blue-200/50 text-xs font-mono tracking-wider mb-2">
          COIN BALANCE: {(stats.coins || 0)}
        </div>

        {/* Next Button appearing when Chest Box animation is finished */}
        <div className="h-20 flex items-center justify-center w-full mb-8">
          <AnimatePresence>
            {showNext && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  vibrate(20);
                  onFinish();
                }}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-yellow-500/20 flex items-center gap-2 border-2 border-yellow-300 transition-all cursor-pointer relative z-[1001]"
              >
                Continue to Trophies
                <ChevronRight size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
