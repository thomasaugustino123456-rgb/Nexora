import React, { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";
import { ChevronRight, Flame, Sparkles } from "lucide-react";
import { useSound } from "../hooks/useSound";

const AnimatedNumber = ({
  value,
  isNewStreak,
}: {
  value: number;
  isNewStreak: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState(
    isNewStreak ? (value > 0 ? value - 1 : 0) : value,
  );

  useEffect(() => {
    if (!isNewStreak) return;

    const controls = animate(displayValue, value, {
      duration: 1.2,
      ease: [0.34, 1.56, 0.64, 1], // Custom bouncy ease
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value, isNewStreak]);

  return <>{displayValue}</>;
};

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
  const [isBouncing, setIsBouncing] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const perfMode = settings?.performanceMode;

  useEffect(() => {
    // 1. Initial sequence
    const timer = setTimeout(() => {
      setShowContent(true);
      if (settings?.soundEnabled !== false) {
        play("flame_complete");
      }
      setIsBouncing(isNewStreak);
      if (isNewStreak) {
        setTimeout(() => setIsBouncing(false), 800);
      }
    }, 50);

    // Delay before they can click continue to ensure they hear/see the glory
    const btnTimer = setTimeout(() => setShowContinue(true), 4800);

    // Ambient fire loop - separated to avoid restarts
    let fireLoop: NodeJS.Timeout;
    if (settings?.soundEnabled !== false) {
      fireLoop = setInterval(() => {
        play("fire_ambient");
      }, 5000);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(btnTimer);
      if (fireLoop) clearInterval(fireLoop);
    };
  }, [play, isNewStreak, settings?.soundEnabled]); // Removed showContent from deps

  return (
    <div className="fixed inset-0 z-[1000] bg-blue-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center"
          >
            {/* Background Glow */}
            {!perfMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.3, scale: 1.8 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                className="absolute w-72 h-72 bg-orange-600 rounded-full blur-[130px] pointer-events-none"
              />
            )}

            {/* The Flame Animation */}
            <motion.div
              initial={{ scale: 0, y: 100 }}
              animate={{
                scale: isBouncing ? [1, 1.25, 1] : 1,
                y: 0,
              }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
              className="relative w-64 h-64 mb-6 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-[0_0_40px_rgba(255,100,0,0.7)]"
              >
                <defs>
                  <linearGradient
                    id="duoFlame"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFD54F" />
                    <stop offset="50%" stopColor="#FFB300" />
                    <stop offset="100%" stopColor="#FF6D00" />
                  </linearGradient>
                </defs>

                <motion.path
                  d="M100,180 C140,180 170,140 170,100 C170,40 100,10 100,10 C100,10 30,40 30,100 C30,140 60,180 100,180 Z"
                  fill="url(#duoFlame)"
                  animate={
                    !perfMode
                      ? {
                          scaleY: [1, 1.04, 1],
                          scaleX: [1, 0.98, 1],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.path
                  d="M100,165 C125,165 145,140 145,110 C145,80 100,50 100,50 C100,50 55,80 55,110 C55,140 75,165 100,165 Z"
                  fill="#FFF"
                  opacity="0.3"
                  animate={
                    !perfMode
                      ? {
                          y: [0, 4, 0],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </svg>

              {/* Day Number with Count-Up Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute inset-0 flex items-center justify-center pt-8"
              >
                <div className="text-8xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] italic">
                  <AnimatedNumber value={streak} isNewStreak={isNewStreak} />
                </div>
              </motion.div>
            </motion.div>

            {/* Labels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2 mb-12"
            >
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                DAY STREAK!
              </h2>
              <p className="text-orange-300 font-bold tracking-widest text-sm uppercase">
                Challenge Complete • {xpEarned} XP Earned
              </p>
            </motion.div>

            {/* Features Staggered */}
            <div className="flex gap-4 mb-16">
              {[
                {
                  icon: <Flame className="text-orange-500" />,
                  label: "On Fire",
                },
                {
                  icon: <Sparkles className="text-yellow-400" />,
                  label: "Legendary",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10"
                >
                  {item.icon}
                  <span className="text-white font-black uppercase text-xs tracking-widest">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Continue Button */}
            <AnimatePresence>
              {showContinue && (
                <motion.button
                  key="continue-btn"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    play("nav_switch");
                    onContinue();
                  }}
                  className="group relative bg-orange-500 hover:bg-orange-600 px-12 py-5 rounded-[2rem] flex items-center gap-4 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.4)] mt-12"
                >
                  <span className="text-white font-black text-xl italic uppercase tracking-tighter">
                    Continue to Trophy Reward
                  </span>
                  <div className="bg-white/20 p-2 rounded-xl group-hover:translate-x-2 transition-transform">
                    <ChevronRight className="text-white" size={24} />
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-1/2 h-full bg-white/20 skew-x-12"
                    />
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
