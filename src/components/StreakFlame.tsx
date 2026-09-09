import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { playSound } from "../hooks/useSound";
import { triggerHaptic } from "../lib/mascotHaptics";

export interface StreakFlameProps {
  mode: "frozen" | "broken" | "restored" | "active";
  className?: string;
  onShatterComplete?: () => void;
  onTapFlame?: () => void;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  mode,
  className = "",
  onShatterComplete,
  onTapFlame,
}) => {
  // Phase for broken sequence:
  // "preview": frozen flame shown intact (user sees Freeze Streak first)
  // "cracking": violent shivers and ice fractures branching across the frozen flame
  // "shattered": explosive shatter, parts fall onto invisible ground and stay there permanently
  const [brokenPhase, setBrokenPhase] = useState<"preview" | "cracking" | "shattered">("preview");
  const [rattleKey, setRattleKey] = useState<number>(0);

  useEffect(() => {
    if (mode === "broken") {
      setBrokenPhase("preview");
      
      // Step 1: Tranquil Freeze Streak shown intact for 850ms
      const crackTimer = setTimeout(() => {
        setBrokenPhase("cracking");
        try {
          playSound("water");
          triggerHaptic("tap");
        } catch (e) {}
      }, 850);

      // Step 2: Shatters violently at 1650ms into broken parts that land on the invisible ground
      const shatterTimer = setTimeout(() => {
        setBrokenPhase("shattered");
        try {
          playSound("losing");
          triggerHaptic("powerActivation");
        } catch (e) {}
        if (onShatterComplete) {
          onShatterComplete();
        }
      }, 1650);

      return () => {
        clearTimeout(crackTimer);
        clearTimeout(shatterTimer);
      };
    } else {
      setBrokenPhase("preview");
    }
  }, [mode, onShatterComplete]);

  // Click on flame or shards: MUST NEVER change state!
  // Frozen stays frozen. Broken stays broken. Healthy stays healthy.
  const handleFlameTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTapFlame) {
      onTapFlame();
    }
    if (mode === "frozen") {
      try {
        playSound("water");
        triggerHaptic("tap");
      } catch (e) {}
    } else if (mode === "broken") {
      setRattleKey((k) => k + 1);
      try {
        playSound("click");
        triggerHaptic("tap");
      } catch (e) {}
    } else {
      try {
        playSound("fire_streak");
        triggerHaptic("tap");
      } catch (e) {}
    }
  };

  const isRestoredOrActive = mode === "restored" || mode === "active";

  return (
    <div
      onClick={handleFlameTap}
      className={`relative flex items-center justify-center select-none cursor-pointer ${className}`}
    >
      {/* SVG Goo Filter */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0">
        <defs>
          <filter id="fire-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <style>{`
        /* Flame container styles */
        .streak-flame-wrapper {
          position: relative;
          width: 200px;
          height: 250px;
          transition: filter 0.8s ease, transform 0.4s ease;
        }

        .streak-flame-wrapper.frozen-flame {
          filter: url(#fire-goo) drop-shadow(0 0 28px rgba(0, 210, 255, 0.85));
        }

        .streak-flame-wrapper.restored-flame {
          filter: url(#fire-goo) drop-shadow(0 0 30px rgba(255, 140, 0, 0.9));
        }

        /* Base Flame Elements */
        .flame-base-layer {
          position: absolute;
          bottom: 20px;
          left: 50%;
          width: 130px;
          height: 130px;
          border-radius: 50% 0 50% 50%;
          transform: translateX(-50%) rotate(-45deg);
          transition: background 0.8s ease, transform 0.6s ease;
        }

        .flame-core-layer {
          position: absolute;
          bottom: 35px;
          left: 50%;
          width: 75px;
          height: 75px;
          border-radius: 50% 0 50% 50%;
          transform: translateX(-50%) rotate(-45deg);
          transition: background 0.8s ease, transform 0.6s ease;
        }

        .flame-particle-element {
          position: absolute;
          bottom: 40px;
          border-radius: 50%;
        }

        /* Ice Crystal Overlay */
        .ice-crystals-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10;
        }

        .ice-crystal-shard {
          position: absolute;
          background: linear-gradient(135deg, #ffffff 0%, #a8efff 50%, #00d2ff 100%);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.8);
          filter: drop-shadow(0 2px 8px rgba(0, 195, 255, 0.6));
        }

        /* Crystal positions */
        .cry-1 { width: 35px; height: 55px; top: 40px; left: 80px; transform: scale(1) rotate(15deg); }
        .cry-2 { width: 25px; height: 40px; top: 80px; left: 45px; transform: scale(1) rotate(-20deg); }
        .cry-3 { width: 30px; height: 50px; top: 90px; left: 120px; transform: scale(1) rotate(35deg); }
        .cry-4 { width: 20px; height: 35px; top: 130px; left: 90px; transform: scale(1) rotate(-10deg); }

        @keyframes freeze-gentle-breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 25px rgba(0, 210, 255, 0.8)); }
          50% { transform: scale(1.02); filter: drop-shadow(0 0 32px rgba(0, 235, 255, 0.95)); }
        }

        @keyframes ice-shiver-violent {
          0% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(1.05) rotate(-3deg); }
          40% { transform: scale(0.96) rotate(3deg); }
          60% { transform: scale(1.04) rotate(-2deg); }
          80% { transform: scale(0.98) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes pulse-core-restored {
          0% { transform: translateX(-50%) rotate(-45deg) scale(0.95); }
          100% { transform: translateX(-50%) rotate(-45deg) scale(1.08); }
        }

        @keyframes rise-up-restored {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-130px) scale(0.2); opacity: 0; }
        }
      `}</style>

      {/* HEALTHY / RESTORED STATE (Hot Glowing Living Flame) */}
      {isRestoredOrActive && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [0.92, 1.05, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="streak-flame-wrapper restored-flame"
        >
          {/* Particles */}
          <div
            className="flame-particle-element"
            style={{
              width: "55px",
              height: "55px",
              left: "22%",
              background: "#ff6a00",
              animation: "rise-up-restored 1.2s linear infinite",
            }}
          />
          <div
            className="flame-particle-element"
            style={{
              width: "70px",
              height: "70px",
              left: "38%",
              background: "#ff8c00",
              animation: "rise-up-restored 1.5s linear infinite",
            }}
          />
          <div
            className="flame-particle-element"
            style={{
              width: "45px",
              height: "45px",
              left: "58%",
              background: "#ff6a00",
              animation: "rise-up-restored 1.1s linear infinite",
            }}
          />
          <div
            className="flame-particle-element"
            style={{
              width: "80px",
              height: "80px",
              left: "28%",
              background: "#ff3c00",
              animation: "rise-up-restored 1.7s linear infinite",
            }}
          />

          {/* Flame Base */}
          <div
            className="flame-base-layer"
            style={{
              background: "linear-gradient(to top right, #ff2a00 0%, #ff8c00 100%)",
            }}
          />
          {/* Flame Core */}
          <div
            className="flame-core-layer"
            style={{
              background: "linear-gradient(to top right, #ffb300 0%, #ffffff 100%)",
              animation: "pulse-core-restored 1.5s ease-in-out infinite alternate",
            }}
          />
        </motion.div>
      )}

      {/* FROZEN STATE (Ice Freeze Flame - stays frozen on tap) */}
      {mode === "frozen" && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="streak-flame-wrapper frozen-flame"
          style={{ animation: "freeze-gentle-breathe 3s ease-in-out infinite" }}
        >
          {/* Frosted particles */}
          <div
            className="flame-particle-element"
            style={{
              width: "55px",
              height: "55px",
              left: "22%",
              background: "#00d2ff",
              opacity: 0.35,
            }}
          />
          <div
            className="flame-particle-element"
            style={{
              width: "70px",
              height: "70px",
              left: "38%",
              background: "#00b4d8",
              opacity: 0.4,
            }}
          />
          <div
            className="flame-particle-element"
            style={{
              width: "45px",
              height: "45px",
              left: "58%",
              background: "#48cae4",
              opacity: 0.3,
            }}
          />
          <div
            className="flame-particle-element"
            style={{
              width: "80px",
              height: "80px",
              left: "28%",
              background: "#0077b6",
              opacity: 0.35,
            }}
          />

          {/* Frozen Flame Base */}
          <div
            className="flame-base-layer"
            style={{
              background: "linear-gradient(to top right, #0055ff 0%, #00d2ff 70%, #e0ffff 100%)",
            }}
          />
          {/* Frozen Flame Core */}
          <div
            className="flame-core-layer"
            style={{
              background: "linear-gradient(to top right, #80e5ff 0%, #ffffff 100%)",
            }}
          />

          {/* Sharp Ice Crystals */}
          <div className="ice-crystals-container">
            <div className="ice-crystal-shard cry-1" />
            <div className="ice-crystal-shard cry-2" />
            <div className="ice-crystal-shard cry-3" />
            <div className="ice-crystal-shard cry-4" />
          </div>

          {/* Frost sparkle stars */}
          <div className="absolute top-8 left-12 w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
          <div className="absolute top-16 right-10 w-2.5 h-2.5 bg-cyan-200 rounded-full animate-pulse opacity-85" />
          <div className="absolute bottom-16 left-16 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60" />
        </motion.div>
      )}

      {/* BROKEN STATE: Freeze Streak shown first -> Cracks branch -> Shatters onto Invisible Land and stays permanently visible! */}
      {mode === "broken" && (
        <div className="relative w-[280px] h-[270px] flex items-center justify-center overflow-visible">
          {brokenPhase !== "shattered" ? (
            /* Phase 1 & 2: Freeze streak intact, then violent cracks branch across it */
            <motion.div
              key="broken-freeze-preview"
              className="streak-flame-wrapper frozen-flame relative"
              style={{
                animation:
                  brokenPhase === "cracking"
                    ? "ice-shiver-violent 0.22s ease-in-out infinite"
                    : "freeze-gentle-breathe 3s ease-in-out infinite",
              }}
            >
              {/* Frosted particles */}
              <div
                className="flame-particle-element"
                style={{
                  width: "55px",
                  height: "55px",
                  left: "22%",
                  background: "#00d2ff",
                  opacity: 0.35,
                }}
              />
              <div
                className="flame-particle-element"
                style={{
                  width: "70px",
                  height: "70px",
                  left: "38%",
                  background: "#00b4d8",
                  opacity: 0.4,
                }}
              />

              {/* Flame Base */}
              <div
                className="flame-base-layer"
                style={{
                  background:
                    "linear-gradient(to top right, #0055ff 0%, #00d2ff 70%, #e0ffff 100%)",
                }}
              />
              {/* Flame Core */}
              <div
                className="flame-core-layer"
                style={{
                  background:
                    "linear-gradient(to top right, #80e5ff 0%, #ffffff 100%)",
                }}
              />

              {/* Sharp Ice Crystals */}
              <div className="ice-crystals-container">
                <div className="ice-crystal-shard cry-1" />
                <div className="ice-crystal-shard cry-2" />
                <div className="ice-crystal-shard cry-3" />
                <div className="ice-crystal-shard cry-4" />
              </div>

              {/* Jagged Ice Crack SVG Overlay - branches rapidly when cracking begins */}
              {brokenPhase === "cracking" && (
                <svg
                  viewBox="0 0 200 250"
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                >
                  <motion.path
                    d="M 100 20 L 95 60 L 115 95 L 85 140 L 110 180 L 98 230"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    style={{ filter: "drop-shadow(0 0 6px #00d2ff)" }}
                  />
                  <motion.path
                    d="M 115 95 L 145 110 L 160 135"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.95 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                    style={{ filter: "drop-shadow(0 0 4px #00d2ff)" }}
                  />
                  <motion.path
                    d="M 85 140 L 55 155 L 40 180"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.95 }}
                    transition={{ duration: 0.4, delay: 0.18 }}
                    style={{ filter: "drop-shadow(0 0 4px #00d2ff)" }}
                  />
                </svg>
              )}
            </motion.div>
          ) : (
            /* Phase 3: Shattered Pieces Burst and Land on the Invisible Ground, STAYING PERMANENTLY VISIBLE */
            <motion.div
              key={`shattered-landed-pieces-${rattleKey}`}
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 w-full h-full pointer-events-auto flex items-center justify-center select-none"
            >
              {/* INVISIBLE LAND (Ground Platform) - Shards land squarely on this plane */}
              <div
                id="invisible-streak-land"
                className="absolute pointer-events-none"
                style={{
                  top: "205px",
                  width: "270px",
                  height: "2px",
                  opacity: 0, // completely invisible as requested
                }}
              />

              {/* Realistic Ground Contact Shadows directly on the invisible land */}
              <div
                className="absolute pointer-events-none"
                style={{ top: "202px", width: "260px" }}
              >
                <div className="absolute left-2 w-14 h-2.5 rounded-full bg-cyan-950/20 blur-[2px]" />
                <div className="absolute left-14 w-16 h-3 rounded-full bg-cyan-950/25 blur-[2px]" />
                <div className="absolute left-28 w-18 h-3.5 rounded-full bg-cyan-950/30 blur-[2.5px]" />
                <div className="absolute right-14 w-16 h-3 rounded-full bg-cyan-950/25 blur-[2px]" />
                <div className="absolute right-2 w-14 h-2.5 rounded-full bg-cyan-950/20 blur-[2px]" />
              </div>

              {/* Shard 1: Top Apex Shard (Lands on Far Left Ground) */}
              <motion.div
                initial={{ x: 0, y: -45, rotate: 0, scale: 0.8 }}
                animate={{
                  x: [0, -45, -78, -75],
                  y: [-45, -70, 78, 70, 74],
                  rotate: [0, -50, -82, -78],
                  scale: 1,
                }}
                transition={{
                  duration: 0.85,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-12 h-16 bg-gradient-to-tr from-blue-700 via-cyan-400 to-white shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(50% 0%, 100% 70%, 75% 100%, 0% 60%)",
                  filter: "drop-shadow(0 2px 6px rgba(0,210,255,0.7))",
                }}
              >
                <div
                  className="absolute inset-0 bg-white/30"
                  style={{ clipPath: "polygon(50% 0%, 80% 60%, 50% 100%, 15% 50%)" }}
                />
              </motion.div>

              {/* Shard 2: Upper Right Blade (Lands on Far Right Ground) */}
              <motion.div
                initial={{ x: 10, y: -40, rotate: 0, scale: 0.8 }}
                animate={{
                  x: [10, 50, 75, 72],
                  y: [-40, -65, 80, 72, 76],
                  rotate: [0, 45, 75, 70],
                  scale: 1,
                }}
                transition={{
                  duration: 0.9,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-12 h-16 bg-gradient-to-tl from-blue-600 via-cyan-300 to-white shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(30% 0%, 100% 40%, 65% 100%, 0% 75%)",
                  filter: "drop-shadow(0 2px 6px rgba(0,210,255,0.7))",
                }}
              />

              {/* Shard 3: Upper Left Shoulder (Lands on Mid-Left Ground) */}
              <motion.div
                initial={{ x: -15, y: -15, rotate: 0, scale: 0.85 }}
                animate={{
                  x: [-15, -45, -50, -48],
                  y: [-15, -30, 82, 75, 78],
                  rotate: [0, -35, -28, -25],
                  scale: 1,
                }}
                transition={{
                  duration: 0.92,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-13 h-13 bg-gradient-to-br from-cyan-200 via-blue-500 to-blue-800 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(15% 10%, 85% 0%, 100% 85%, 20% 100%)",
                  filter: "drop-shadow(0 2px 5px rgba(0,180,255,0.6))",
                }}
              />

              {/* Shard 4: Mid Right Flank (Lands on Mid-Right Ground) */}
              <motion.div
                initial={{ x: 20, y: -10, rotate: 0, scale: 0.85 }}
                animate={{
                  x: [20, 50, 48, 46],
                  y: [-10, -25, 82, 76, 78],
                  rotate: [0, 40, 36, 34],
                  scale: 1,
                }}
                transition={{
                  duration: 0.95,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-13 h-13 bg-gradient-to-bl from-white via-cyan-400 to-blue-700 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(35% 0%, 100% 30%, 80% 100%, 0% 80%)",
                  filter: "drop-shadow(0 2px 5px rgba(0,180,255,0.6))",
                }}
              />

              {/* Shard 5: Core Diamond Shard (Lands Near Center Ground) */}
              <motion.div
                initial={{ x: 0, y: 0, rotate: 0, scale: 0.9 }}
                animate={{
                  x: [0, -12, -18, -16],
                  y: [0, -15, 84, 78, 80],
                  rotate: [0, 20, 16, 14],
                  scale: 1,
                }}
                transition={{
                  duration: 0.88,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-10 h-11 bg-gradient-to-tr from-cyan-400 via-white to-cyan-100 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  filter: "drop-shadow(0 0 8px rgba(0,230,255,0.8))",
                }}
              />

              {/* Shard 6: Lower Left Base Chunk (Lands on Near-Left Ground) */}
              <motion.div
                initial={{ x: -20, y: 20, rotate: 0, scale: 0.9 }}
                animate={{
                  x: [-20, -32, -34, -32],
                  y: [20, 15, 86, 80, 82],
                  rotate: [0, -20, -16, -14],
                  scale: 1,
                }}
                transition={{
                  duration: 0.82,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-12 h-11 bg-gradient-to-tr from-blue-800 to-cyan-400 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(0% 20%, 90% 0%, 100% 70%, 10% 100%)",
                  filter: "drop-shadow(0 2px 5px rgba(0,180,255,0.6))",
                }}
              />

              {/* Shard 7: Lower Right Base Chunk (Lands on Near-Right Ground) */}
              <motion.div
                initial={{ x: 20, y: 20, rotate: 0, scale: 0.9 }}
                animate={{
                  x: [20, 32, 28, 26],
                  y: [20, 15, 86, 80, 82],
                  rotate: [0, 25, 20, 18],
                  scale: 1,
                }}
                transition={{
                  duration: 0.84,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-12 h-11 bg-gradient-to-tl from-blue-700 to-cyan-200 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(20% 0%, 100% 25%, 80% 100%, 0% 75%)",
                  filter: "drop-shadow(0 2px 5px rgba(0,180,255,0.6))",
                }}
              />

              {/* Shard 8: Far Left Outer Splinter */}
              <motion.div
                initial={{ x: -10, y: -25, rotate: 0, scale: 0.7 }}
                animate={{
                  x: [-10, -65, -96, -94],
                  y: [-25, -45, 86, 81, 83],
                  rotate: [0, -70, -102, -98],
                  scale: 0.9,
                }}
                transition={{
                  duration: 1.0,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-8 h-9 bg-gradient-to-tr from-cyan-400 to-white shadow-sm cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(50% 0%, 100% 100%, 0% 80%)",
                  filter: "drop-shadow(0 1px 4px rgba(0,210,255,0.6))",
                }}
              />

              {/* Shard 9: Far Right Outer Splinter */}
              <motion.div
                initial={{ x: 10, y: -25, rotate: 0, scale: 0.7 }}
                animate={{
                  x: [10, 65, 94, 92],
                  y: [-25, -45, 86, 81, 83],
                  rotate: [0, 70, 102, 98],
                  scale: 0.9,
                }}
                transition={{
                  duration: 1.02,
                  times: [0, 0.25, 0.75, 0.88, 1],
                  ease: "easeOut",
                }}
                className="absolute w-8 h-9 bg-gradient-to-tl from-cyan-400 to-white shadow-sm cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                style={{
                  clipPath: "polygon(50% 0%, 100% 80%, 0% 100%)",
                  filter: "drop-shadow(0 1px 4px rgba(0,210,255,0.6))",
                }}
              />

              {/* Broken Center Remnant Stump - firmly sitting on the invisible ground */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.95 }}
                transition={{ duration: 0.35 }}
                className="absolute w-14 h-9 bg-gradient-to-t from-blue-900/60 via-blue-600/40 to-cyan-300/40 backdrop-blur-sm border-t border-cyan-300/50 shadow-sm flex items-center justify-center pointer-events-auto"
                style={{
                  top: "172px",
                  clipPath:
                    "polygon(0% 100%, 0% 40%, 25% 65%, 45% 30%, 70% 55%, 85% 25%, 100% 50%, 100% 100%)",
                }}
              >
                <div className="w-6 h-0.5 bg-cyan-200/70 rounded-full" />
              </motion.div>

              {/* Fine Ice Sparkles lingering across the landed shards on the invisible land */}
              <div className="absolute top-[182px] left-10 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-80 pointer-events-none" />
              <div className="absolute top-[184px] right-12 w-2 h-2 bg-cyan-200 rounded-full animate-pulse opacity-90 pointer-events-none" />
              <div className="absolute top-[188px] left-28 w-1 h-1 bg-white rounded-full animate-pulse opacity-75 pointer-events-none" />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

