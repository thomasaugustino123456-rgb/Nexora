import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Sparkles } from "lucide-react";
import { vibrate } from "../lib/vibrate";
import { UserStats } from "../types";

const CHEST_SOUNDS = {
  reveal: "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088376/mixkit-game-experience-level-increased-2062_cyf4kz.wav",
  click: "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088375/mixkit-quick-win-video-game-notification-269_ec7wwz.wav",
  land: "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088375/mixkit-martial-arts-punch-2052_l0noe5.wav"
};

const playChestAudio = (type: "reveal" | "click" | "land", soundEnabled?: boolean) => {
  if (soundEnabled === false) return;
  try {
    const audio = new Audio(CHEST_SOUNDS[type]);
    audio.play().catch(e => console.warn("Chest sound play failed:", e));
  } catch (err) {
    console.warn("Chest audio error:", err);
  }
};

interface XpRewardsScreenProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats> | ((prev: UserStats) => UserStats)) => void;
  settings?: any;
  onFinish: () => void;
}

export function XpRewardsScreen({
  stats,
  onUpdateStats,
  settings,
  onFinish,
}: XpRewardsScreenProps) {
  const [clickCount, setClickCount] = useState(0);
  const [systemLock, setSystemLock] = useState(false);
  const [showXpText, setShowXpText] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [gems, setGems] = useState<Array<{ id: number; tx: string; ty: string; size: number; color: string }>>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Status message controls
  const [statusText, setStatusText] = useState("Tap the Blue Chest 4 Times to Release Magic!");
  const [statusColor, setStatusColor] = useState("#00d4ff");

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Web Audio Synthesis for Magical XP SFX
  const playSoundEffect = (type: "tap" | "epic_launch", clickIdx = 0) => {
    if (settings?.soundEnabled === false) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      if (type === "tap") {
        // High quality resonant magical wood tap + bell resonance
        const baseFreq = 100 + clickIdx * 45; // rising pitch for tension!

        // Wood low thud
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq / 2, now + 0.22);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.45, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

        // High crystal tinkles
        for (let i = 0; i < 4; i++) {
          const tOsc = ctx.createOscillator();
          const tGain = ctx.createGain();
          tOsc.type = "sine";
          tOsc.frequency.setValueAtTime(1000 + clickIdx * 300 + i * 200, now);
          tGain.gain.setValueAtTime(0, now);
          tGain.gain.linearRampToValueAtTime(0.04, now + 0.01);
          tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          tOsc.connect(tGain);
          tGain.connect(ctx.destination);
          tOsc.start(now);
          tOsc.stop(now + 0.12);
        }
      } else if (type === "epic_launch") {
        // Sub bass blast
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(180, now);
        subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.45);

        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(0.6, now + 0.02);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.5);

        // Laser Sweep (swoosh aura)
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(100, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + 0.55);
        filter.Q.setValueAtTime(4.0, now);

        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
          noiseData[i] = Math.random() * 2 - 1;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        noiseSrc.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseSrc.start(now);
        noiseSrc.stop(now + 0.6);

        // Sweet arpeggiated victory melody (C6 -> E6 -> G6 -> C7 chimes)
        const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
        notes.forEach((freq, idx) => {
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chimeOsc.type = "sine";
          chimeOsc.frequency.setValueAtTime(freq, now + idx * 0.08);

          chimeGain.gain.setValueAtTime(0, now + idx * 0.08);
          chimeGain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.005);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(ctx.destination);
          chimeOsc.start(now + idx * 0.08);
          chimeOsc.stop(now + idx * 0.08 + 0.5);
        });
      }
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  };

  const handleChestClick = () => {
    if (systemLock) return;

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount === 1) {
      // Click 1: Play click, strong vibration, and schedule landing sound on landing impact
      vibrate([100, 30, 80]);
      playChestAudio("click", settings?.soundEnabled);
      playSoundEffect("tap", 1);
      setStatusText("3 Taps Left... Feel the Magic!");
      setStatusColor("#00f0ff");
      setTimeout(() => {
        playChestAudio("land", settings?.soundEnabled);
        vibrate(90);
      }, 400);
    } else if (nextCount === 2) {
      // Click 2: Play click, stronger vibration, and schedule landing sound
      vibrate([120, 30, 100]);
      playChestAudio("click", settings?.soundEnabled);
      playSoundEffect("tap", 2);
      setStatusText("2 Taps Left... Energy is Surging!");
      setStatusColor("#a832fc");
      setTimeout(() => {
        playChestAudio("land", settings?.soundEnabled);
        vibrate(110);
      }, 450);
    } else if (nextCount === 3) {
      // Click 3: Play click, intense buildup vibration, and schedule landing sound
      vibrate([150, 25, 130, 25, 120]);
      playChestAudio("click", settings?.soundEnabled);
      playSoundEffect("tap", 3);
      setStatusText("FINAL TAP DEPLOYMENT INITIALIZED!!!");
      setStatusColor("#ff00d0");
      setTimeout(() => {
        playChestAudio("land", settings?.soundEnabled);
        vibrate(140);
      }, 500);
    } else if (nextCount === 4) {
      setSystemLock(true);
      executeEpicFinalLaunch();
    }
  };

  const executeEpicFinalLaunch = () => {
    // 1. Play massive launch chime + laser sweep + Sound 1 (reveal) + Sound 2 (click/launch)
    playSoundEffect("epic_launch");
    playChestAudio("click", settings?.soundEnabled);
    playChestAudio("reveal", settings?.soundEnabled);

    // 2. Heavy explosion vibration so the user REALLY feels it!
    vibrate([200, 50, 250, 50, 300, 40, 350]);

    setStatusText("XP Core Harvest Transferred!");
    setStatusColor("#00f0ff");

    // 3. Exact frame of landing impact is 680ms
    setTimeout(() => {
      playChestAudio("land", settings?.soundEnabled);
      vibrate(220);
      setShowXpText(true);

      // Populate magical crystals
      const newGems = [];
      const blastDensity = 28;
      for (let i = 0; i < blastDensity; i++) {
        const angle = Math.PI + Math.random() * Math.PI; // top-hemisphere scatter
        const distance = 130 + Math.random() * 160;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance - 50;

        const baseSize = 7 + Math.random() * 8; // Tidy premium size
        const color = Math.random() > 0.5 ? "#00f0ff" : "#bd00ff";

        newGems.push({
          id: i,
          tx: `${targetX}px`,
          ty: `${targetY}px`,
          size: baseSize,
          color,
        });
      }
      setGems(newGems);

      // Update actual user stats (award 500 XP and flag XP chest as claimed)
      onUpdateStats((prev) => ({
        ...prev,
        xp: (prev.xp || 0) + 500,
        hasClaimedXpChest: true,
      }));

      // Make "Next" button appear
      setTimeout(() => {
        setShowNext(true);
      }, 1000);
    }, 680);
  };

  return (
    <div className="fixed inset-0 z-[1001] bg-[#0a0f14] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* COGNITIVE SCOPED STYLES FROM HTML DESIGN SHEET */}
      <style>{`
        .chest-stage-xp {
          width: 360px;
          height: 360px;
          position: relative;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          padding-bottom: 20px;
        }

        /* BASE GROUND GLOW */
        .jump-glow-xp {
          position: absolute;
          bottom: 25px;
          width: 200px;
          height: 20px;
          background: radial-gradient(ellipse at center, rgba(0, 183, 255, 0.8) 0%, rgba(0, 183, 255, 0) 70%);
          filter: blur(8px);
          opacity: 0.4;
          z-index: 1;
          transition: opacity 0.4s ease;
          will-change: transform, opacity;
        }

        /* MAGICAL BURST AURA */
        .burst-aura-xp {
          position: absolute;
          bottom: 100px;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(0, 240, 255, 0.9) 0%, rgba(189, 0, 255, 0) 70%);
          border-radius: 50%;
          filter: blur(15px);
          opacity: 0;
          z-index: 2;
          transform: scale(0.5);
          pointer-events: none;
        }
        .burst-active-xp {
          animation: auraFlashXp 0.6s ease-out forwards;
        }

        /* MAIN RIGID WRAPPER */
        .chest-wrapper-xp {
          width: 240px;
          height: 216px;
          position: relative;
          z-index: 3;
          transform-origin: center bottom; 
          will-change: transform, opacity;
          transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .chest-mesh-xp {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* LID & LOCK RIGIDITY */
        .box-lid-xp, .box-lock-xp {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          will-change: transform;
        }
        .box-lid-xp { transform-origin: 240px 135px; }
        .box-lock-xp { transform-origin: 150px 135px; }

        /* OPENED STATE TRANSFORMS */
        .svg-opened-xp .box-lid-xp { transform: translate(25px, -55px) rotate(35deg); }
        .svg-opened-xp .box-lock-xp { transform: translate(45px, -25px) rotate(55deg) scale(0.9); opacity: 0.2; }

        /* PERMANENT DISAPPEAR STATE */
        .chest-wrapper-xp.fade-away-xp {
          opacity: 0 !important;
          transform: scale(0.1) translateY(80px) !important;
          pointer-events: none;
        }

        /* =========================================
           THE IDLE LOOP PHYSICS
           ========================================= */
        .idle-physics-xp { animation: idleBouncingXp 2.5s infinite ease-in-out; }
        .idle-glow-xp { animation: idleGlowPulseXp 2.5s infinite ease-in-out; }

        @keyframes idleBouncingXp {
          0%, 15%, 100% { transform: scale(1, 1) translateY(0); }
          20% { transform: scale(1.02, 0.98) translateY(0); }
          35% { transform: scale(0.99, 1.01) translateY(-10px); }
          45% { transform: scale(1, 1) translateY(-12px); }
          55% { transform: scale(0.99, 1.01) translateY(-3px); }
          60% { transform: scale(1.03, 0.97) translateY(0); }
          70% { transform: scale(0.99, 1.01) translateY(-2px); }
          80% { transform: scale(1, 1) translateY(0); }
        }

        @keyframes idleGlowPulseXp {
          0%, 15%, 100% { transform: scale(1); opacity: 0.4; }
          20% { transform: scale(1.05); opacity: 0.5; }
          35%, 45% { transform: scale(0.9); opacity: 0.2; } 
          60% { transform: scale(1.1); opacity: 0.6; } 
        }

        /* =========================================
           PROGRESSIVE CLICK JUMP PHYSICS TIER SYSTEM
           ========================================= */
        .jump-tier-xp-1 { animation: jumpPhysicsXp1 0.4s ease-out forwards; }
        @keyframes jumpPhysicsXp1 {
          0% { transform: scale(1, 1) translateY(0); }
          25% { transform: scale(1.04, 0.96) translateY(2px); }
          60% { transform: scale(0.98, 1.02) translateY(-20px); }
          100% { transform: scale(1, 1) translateY(0); }
        }

        .jump-tier-xp-2 { animation: jumpPhysicsXp2 0.45s ease-out forwards; }
        @keyframes jumpPhysicsXp2 {
          0% { transform: scale(1, 1) translateY(0); }
          25% { transform: scale(1.05, 0.95) translateY(2px); }
          55% { transform: scale(0.97, 1.03) translateY(-45px); }
          100% { transform: scale(1, 1) translateY(0); }
        }

        .jump-tier-xp-3 { animation: jumpPhysicsXp3 0.5s ease-out forwards; }
        @keyframes jumpPhysicsXp3 {
          0% { transform: scale(1, 1) translateY(0); }
          20% { transform: scale(1.06, 0.94) translateY(3px); }
          50% { transform: scale(0.96, 1.04) translateY(-75px); }
          100% { transform: scale(1, 1) translateY(0); }
        }

        .jump-tier-xp-4 { animation: jumpPhysicsXp4 1.0s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        @keyframes jumpPhysicsXp4 {
          0% { transform: scale(1, 1) translateY(0); }
          8% { transform: scale(1.07, 0.93) translateY(3px); } 
          25% { transform: scale(0.95, 1.05) translateY(-110px); } 
          45% { transform: scale(1, 1) translateY(-120px); } 
          62% { transform: scale(0.98, 1.02) translateY(-15px); } 
          68% { transform: scale(1.09, 0.91) translateY(0); } 
          100% { transform: scale(1, 1) translateY(0); } 
        }

        @keyframes auraFlashXp {
          0% { transform: scale(0.2); opacity: 0; }
          25% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        /* =========================================
           CLEAN REWARD VISUALS ENGINE
           ========================================= */
        .xp-gem {
          position: absolute;
          bottom: 120px;
          left: calc(50% - 8px);
          transform: rotate(45deg);
          border-radius: 3px;
          z-index: 4;
          pointer-events: none;
          box-shadow: 0 0 15px currentColor;
          animation: launchGemEpicXp 1.8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
        }

        @keyframes launchGemEpicXp {
          0% { transform: translate(0, 0) rotate(45deg) scale(0.2); opacity: 1; }
          25% { scale: 2.2; filter: drop-shadow(0 0 25px currentColor); opacity: 1; } 
          45% { transform: translate(var(--tx), var(--ty)) rotate(270deg) scale(1.8); opacity: 1; }
          100% { transform: translate(var(--tx), calc(var(--ty) - 80px)) rotate(540deg) scale(0); opacity: 0; }
        }

        .xp-text-pop-massive {
          position: absolute;
          bottom: 45%;
          font-weight: 900;
          font-size: 34px; /* Reduced for clean premium sizing */
          color: #00f0ff;
          text-shadow: 0 0 20px rgba(0, 240, 255, 0.8), 0 0 5px #000;
          z-index: 5;
          pointer-events: none;
          animation: massiveFloatXpPermanent 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes massiveFloatXpPermanent {
          0% { transform: scale(0.5) translateY(40px); opacity: 0; }
          25% { transform: scale(1.3) translateY(0); opacity: 1; } 
          50% { transform: scale(1.15) translateY(-8px); opacity: 1; }
          100% { transform: scale(1.0) translateY(-15px); opacity: 1; }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-between min-h-[85vh]">
        
        {/* Top Header */}
        <div className="space-y-3 mt-4">
          <p className="text-[#00d4ff] font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-1">
            <Sparkles size={14} className="animate-pulse" />
            Official App Challenge Bonus!
            <Sparkles size={14} className="animate-pulse" />
          </p>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            Nexora Blue Magical Chest
          </h2>
        </div>

        {/* Dynamic Tips */}
        <div 
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

        {/* Master Chest Stage */}
        <div 
          onClick={handleChestClick}
          className="chest-stage-xp select-none"
        >
          {/* Ground Glow */}
          <div className={`jump-glow-xp ${clickCount === 0 ? "idle-glow-xp" : ""}`} />
          
          {/* Burst Aura */}
          <div className={`burst-aura-xp ${clickCount >= 4 ? "burst-active-xp" : ""}`} />

          {/* Epic Chest Wrapper with progressive jump physics classes */}
          <div 
            className={`chest-wrapper-xp ${
              clickCount === 0 
                ? "idle-physics-xp" 
                : clickCount === 1 
                ? "jump-tier-xp-1" 
                : clickCount === 2 
                ? "jump-tier-xp-2" 
                : clickCount === 3 
                ? "jump-tier-xp-3" 
                : "jump-tier-xp-4"
            } ${clickCount >= 4 ? "fade-away-xp" : ""}`}
          >
            <svg 
              className={`chest-mesh-xp ${clickCount >= 4 ? "svg-opened-xp" : ""}`} 
              viewBox="0 0 300 280"
            >
              <defs>
                <linearGradient id="blueWood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0088ff"/>
                  <stop offset="100%" stopColor="#003399"/>
                </linearGradient>
                <linearGradient id="silverTrim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="40%" stopColor="#bceaff"/>
                  <stop offset="100%" stopColor="#4aa3df"/>
                </linearGradient>
                <linearGradient id="darkSilver" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bceaff"/>
                  <stop offset="100%" stopColor="#2c628c"/>
                </linearGradient>
              </defs>

              {/* CHEST BASE */}
              <g className="box-base-xp">
                <path d="M30,135 L270,135 L255,245 C255,255 245,265 230,265 L70,265 C55,265 45,255 45,245 Z" fill="url(#blueWood)" stroke="#001a4d" strokeWidth="6" strokeLinejoin="round"/>
                <path d="M35,170 L265,170 M40,205 L260,205 M43,235 L257,235" stroke="#002266" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
                <path d="M65,135 L105,135 L95,265 L60,265 Z" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="5" strokeLinejoin="round"/>
                <path d="M195,135 L235,135 L240,265 L205,265 Z" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="5" strokeLinejoin="round"/>
                <rect x="40" y="235" width="220" height="30" rx="8" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="5" strokeLinejoin="round"/>
                <rect x="35" y="230" width="40" height="40" rx="10" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="5"/>
                <rect x="225" y="230" width="40" height="40" rx="10" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="5"/>
                <circle cx="55" cy="250" r="4.5" fill="#ffffff" stroke="#001a4d" strokeWidth="2"/>
                <circle cx="245" cy="250" r="4.5" fill="#ffffff" stroke="#001a4d" strokeWidth="2"/>
              </g>

              {/* CHEST LID */}
              <g className="box-lid-xp">
                <path d="M30,135 C30,20 270,20 270,135 Z" fill="url(#blueWood)" stroke="#001a4d" strokeWidth="6" strokeLinejoin="round"/>
                <path d="M40,100 Q150,80 260,100 M55,65 Q150,40 245,65 M85,35 Q150,20 215,35" stroke="#002266" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
                <path d="M65,135 L105,135 C105,65 145,40 150,40 C120,40 65,60 65,135 Z" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="5" strokeLinejoin="round"/>
                <path d="M235,135 L195,135 C195,65 155,40 150,40 C180,40 235,60 235,135 Z" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="5" strokeLinejoin="round"/>
                <rect x="20" y="115" width="260" height="25" rx="8" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="6" strokeLinejoin="round"/>
                <circle cx="50" cy="127" r="4.5" fill="#ffffff" stroke="#001a4d" strokeWidth="2"/>
                <circle cx="85" cy="127" r="4.5" fill="#ffffff" stroke="#001a4d" strokeWidth="2"/>
                <circle cx="215" cy="127" r="4.5" fill="#ffffff" stroke="#001a4d" strokeWidth="2"/>
                <circle cx="250" cy="127" r="4.5" fill="#ffffff" stroke="#001a4d" strokeWidth="2"/>
              </g>

              {/* MAGICAL LOCK */}
              <g className="box-lock-xp">
                <path d="M125,135 C125,100 175,100 175,135" fill="none" stroke="url(#darkSilver)" strokeWidth="16" strokeLinecap="round"/>
                <ellipse cx="150" cy="160" rx="42" ry="36" fill="url(#silverTrim)" stroke="#001a4d" strokeWidth="5"/>
                <ellipse cx="150" cy="160" rx="32" ry="26" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.8"/>
                <circle cx="150" cy="152" r="7" fill="#00d4ff"/>
                <path d="M145,152 L155,152 L158,170 L142,170 Z" fill="#00d4ff"/>
              </g>
            </svg>
          </div>

          {/* Massive Reward Floating Text */}
          {showXpText && (
            <div className="xp-text-pop-massive">
              +500 XP
            </div>
          )}

          {/* Crystal Particle Explosion */}
          {gems.map((gem) => (
            <div
              key={gem.id}
              className="xp-gem animate-pulse"
              style={{
                "--tx": gem.tx,
                "--ty": gem.ty,
                width: `${gem.size}px`,
                height: `${gem.size}px`,
                color: gem.color,
                backgroundColor: "currentColor",
              } as React.CSSProperties}
            />
          ))}

        </div>

        {/* Display Current XP */}
        <div className="text-blue-300/40 text-xs font-mono tracking-wider mb-2 uppercase">
          Current XP: {stats.xp || 0}
        </div>

        {/* Continue Button */}
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
                className="px-8 py-4 bg-[#00d4ff] hover:bg-[#3ce2ff] text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-[#00d4ff]/20 flex items-center gap-2 border-2 border-[#bceaff] transition-all cursor-pointer relative z-[1002]"
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
