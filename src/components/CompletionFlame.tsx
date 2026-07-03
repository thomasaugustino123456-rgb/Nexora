import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import { ChevronRight, Flame, Sparkles } from "lucide-react";
import { useSound } from "../hooks/useSound";

interface CompletionFlameProps {
  streak: number;
  xpEarned: number;
  onContinue: () => void;
  settings?: any;
  isNewStreak?: boolean;
}

export function CompletionFlame({
  streak,
  xpEarned,
  onContinue,
  settings,
  isNewStreak = true,
}: CompletionFlameProps) {
  const { play } = useSound();
  const [showContent, setShowContent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(isNewStreak ? streak - 1 : streak);
  const [showContinue, setShowContinue] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playRisingSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 1.3);

      filter.type = "lowpass";
      filter.Q.setValueAtTime(3, ctx.currentTime);
      filter.frequency.setValueAtTime(140, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 1.3);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3); // Gentle soft volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch (e) {
      console.warn("Audio synthesis failed:", e);
    }
  };

  const triggerHaptic = (duration: number | number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  };

  const executeChallengeWin = (newStreak?: number) => {
    setIsAnimating(true);
    
    // 1. 350ms: Ultra-light warning tick (compression tension)
    setTimeout(() => triggerHaptic(12), 350);

    // 2. 1300ms: Soft rising sound + Heavy impact pulse (Perfect sync with flame climax)
    setTimeout(() => {
      playRisingSound();
      triggerHaptic(50);
      if (newStreak !== undefined) {
        setCurrentStreak(newStreak);
      } else {
        setCurrentStreak(streak);
      }
    }, 1300);

    // 3. 1900ms: Double success 'heartbeat' (settling glory)
    setTimeout(() => {
      triggerHaptic([35, 60, 35]);
    }, 1900);
  };

  useEffect(() => {
    // Expose to window for developer-callable testing as requested
    (window as any).executeChallengeWin = (num?: number) => {
      executeChallengeWin(num);
    };

    const timer = setTimeout(() => {
      setShowContent(true);
      if (isNewStreak) {
        executeChallengeWin();
      } else {
        setCurrentStreak(streak);
      }
    }, 100);

    const btnTimer = setTimeout(() => setShowContinue(true), 4500);

    return () => {
      clearTimeout(timer);
      clearTimeout(btnTimer);
      delete (window as any).executeChallengeWin;
    };
  }, [isNewStreak, streak]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#131f24] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <style>{`
        .flame-svg-wrapper {
          width: 200px;
          height: 240px;
          position: relative;
        }

        .glow-bloom {
          transform-origin: 100px 145px;
          opacity: 0;
        }
        .auto-animate .glow-bloom {
          animation: energyBloom 1.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .flame-container {
          transform-origin: 100px 215px;
          opacity: 0;
          transform: scale(0);
        }

        .auto-animate .flame-container {
          animation: superSqueezeToFlame 1.7s cubic-bezier(0.25, 1, 0.4, 1) forwards,
                     duolingoIdleBounce 2.4s ease-in-out infinite 1.7s;
        }

        .gloss-shine {
          transform: translateX(-160px) rotate(-25px);
        }
        .auto-animate .gloss-shine {
          animation: glossSweep 0.65s cubic-bezier(0.3, 0.8, 0.4, 1) forwards;
          animation-delay: 1.55s;
        }

        .streak-text-milestone {
          color: #ff9600;
          font-size: 5rem;
          font-weight: 900;
          margin-top: -10px;
          opacity: 0;
          transform: scale(0.4);
          font-style: italic;
          line-height: 1;
        }

        .auto-animate .streak-text-milestone {
          animation: textPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          animation-delay: 1.3s;
        }

        .spark-milestone { opacity: 0; }
        .auto-animate .spark-milestone {
          animation: ascendParticleMilestone 2.2s linear infinite;
          transform-origin: bottom center;
        }
        .auto-animate .spark-1 { animation-delay: 1.6s; }
        .auto-animate .spark-2 { animation-delay: 2.0s; }
        .auto-animate .spark-3 { animation-delay: 2.4s; }

        @keyframes superSqueezeToFlame {
          0% { transform: scale(0, 0); opacity: 0; }
          15% { transform: scale(0.6, 0.04); opacity: 1; }
          38% { transform: scale(0.35, 0.35) translateY(12px); }
          48% { transform: scale(0.55, 0.16) translateY(16px); }
          58% { transform: scale(0.65, 1.7) translateY(-32px); }
          70% { transform: scale(1.24, 0.88) translateY(4px); }
          84% { transform: scale(0.96, 1.03) translateY(-2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes energyBloom {
          0% { transform: scale(0.2); opacity: 0; }
          50% { opacity: 0.2; }
          58% { transform: scale(1.4); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.3; }
        }

        @keyframes duolingoIdleBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.03, 0.97) translateY(-6px); }
        }

        @keyframes glossSweep {
          0% { transform: translateX(-160px) translateY(-50px) rotate(-25px); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateX(210px) translateY(50px) rotate(-25px); opacity: 0; }
        }

        @keyframes textPopIn {
          0% { opacity: 0; transform: scale(0.4) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes ascendParticleMilestone {
          0% { transform: translateY(190px) translateX(0) scale(0.4); opacity: 0; }
          25% { opacity: 1; }
          85% { opacity: 0.7; }
          100% { transform: translateY(30px) translateX(-30px) scale(0); opacity: 0; }
        }
      `}</style>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex flex-col items-center justify-center ${isAnimating ? 'auto-animate' : ''}`}
          >
            <div className="flame-svg-wrapper">
              <svg viewBox="0 0 200 250" width="100%" height="100%">
                <defs>
                  <mask id="flameMask">
                    <path d="M100,30 C135,75 165,110 165,150 C165,190 135,215 100,215 C65,215 35,190 35,150 C35,105 60,85 75,60 C85,42 92,33 100,30 Z" fill="#FFFFFF"/>
                  </mask>
                  <linearGradient id="bgGlow" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#FF4B4B" stopOpacity="0"/>
                    <stop offset="100%" stopColor="#FF9600" stopOpacity="0.4"/>
                  </linearGradient>
                  <linearGradient id="outerFlame" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#FF4B4B"/>
                    <stop offset="60%" stopColor="#FF9600"/>
                    <stop offset="100%" stopColor="#FFD000"/>
                  </linearGradient>
                  <linearGradient id="innerFlame" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#FF9600"/>
                    <stop offset="50%" stopColor="#FFD000"/>
                    <stop offset="100%" stopColor="#FFFF80"/>
                  </linearGradient>
                </defs>

                <circle className="glow-bloom" cx="100" cy="145" r="75" fill="url(#bgGlow)" />

                <g className="flame-container">
                  <path d="M100,30 C135,75 165,110 165,150 C165,190 135,215 100,215 C65,215 35,190 35,150 C35,105 60,85 75,60 C85,42 92,33 100,30 Z" fill="url(#outerFlame)" />
                  <g mask="url(#flameMask)">
                    <rect className="gloss-shine" x="-50" y="20" width="45" height="250" fill="#FFFFFF" opacity="0.3" />
                  </g>
                  <path d="M100,75 C122,105 140,125 140,155 C140,180 122,195 100,195 C78,195 60,180 60,155 C60,125 80,110 90,95 C95,87 97,80 100,75 Z" fill="url(#innerFlame)" />
                  <ellipse cx="100" cy="160" rx="16" ry="24" fill="#FFFFFF" opacity="0.32" />
                </g>

                <circle className="spark-milestone spark-1" cx="95" cy="0" r="3.5" fill="#FFD000" />
                <circle className="spark-milestone spark-2" cx="115" cy="0" r="2.5" fill="#FFFF80" />
                <circle className="spark-milestone spark-3" cx="85" cy="0" r="4" fill="#FF4B4B" />
              </svg>
            </div>

            <div className="streak-text-milestone">
              {currentStreak}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 space-y-2"
            >
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                DAY STREAK!
              </h2>
              <p className="text-orange-400 font-bold tracking-widest text-sm uppercase">
                Challenge Complete • {xpEarned} XP Earned
              </p>
            </motion.div>

            <div className="flex gap-4 mt-8">
              {[
                { icon: <Flame className="text-orange-500" />, label: "On Fire" },
                { icon: <Sparkles className="text-yellow-400" />, label: "Legendary" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + i * 0.1 }}
                  className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10"
                >
                  {item.icon}
                  <span className="text-white font-black uppercase text-[10px] tracking-widest">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {showContinue && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    play("nav_switch");
                    onContinue();
                  }}
                  className="group relative bg-[#58cc02] hover:bg-[#46a302] px-12 py-5 rounded-[2rem] flex items-center gap-4 transition-all shadow-[0_8px_0_#46a302] mt-16 active:translate-y-1 active:shadow-none"
                >
                  <span className="text-white font-black text-xl italic uppercase tracking-tighter">
                    Continue to Reward
                  </span>
                  <div className="bg-white/20 p-2 rounded-xl group-hover:translate-x-2 transition-transform">
                    <ChevronRight className="text-white" size={24} />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
