import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Check, PackageCheck, Hand } from "lucide-react";
import { ShopItem, UserSettings } from "../types";
import { useSound } from "../hooks/useSound";
import { vibrate } from "../lib/vibrate";
import { AnimatedSunglasses } from "./AnimatedSunglasses";
import { AnimatedNinjaMask } from "./AnimatedNinjaMask";
import { AnimatedVikingHat } from "./AnimatedVikingHat";
import { AnimatedDetectiveKit } from "./AnimatedDetectiveKit";
import { AnimatedWizardHat } from "./AnimatedWizardHat";
import { AnimatedRoyalCrown } from "./AnimatedRoyalCrown";

export interface ShopChestUnboxingModalProps {
  item: ShopItem | null;
  settings?: UserSettings;
  onClose: () => void;
}

export function ShopChestUnboxingModal({
  item,
  settings,
  onClose,
}: ShopChestUnboxingModalProps) {
  // Stages: 'falling' -> 'idle' -> 'tap1' -> 'tap2' -> 'tap3' -> 'revealed'
  const [isLanded, setIsLanded] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const idleVibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { play } = useSound();

  // 1. Natural Duolingo-style Falling, Upside-Down Bonk, Flip Jump, and Squash-Stretch Land Sequence
  useEffect(() => {
    if (!item) return;

    setIsLanded(false);
    setTapCount(0);
    setIsRevealed(false);

    // Initial swoosh / arrival alert
    if (settings?.soundEnabled !== false) {
      play("header_switch");
    }
    // Continuous medium haptic start
    vibrate([35, 20, 35]);

    // Timed SFX & Haptics aligned with keyframe physics:
    // 1. Upside-down Head Bonk at ~580ms
    const headBonkTimer = setTimeout(() => {
      if (settings?.soundEnabled !== false) {
        play("chest_click");
      }
      vibrate([40, 25, 40]);
    }, 580);

    // 2. Heavy Squash & Stretch Landing at ~1420ms
    const landImpactTimer = setTimeout(() => {
      if (settings?.soundEnabled !== false) {
        play("chest_land");
      }
      vibrate([48, 25, 48]);
    }, 1420);

    // 3. Fall animation finishes at ~1850ms, enters interactive idle state
    const settleTimer = setTimeout(() => {
      setIsLanded(true);

      // Continuous medium rhythmic vibration while waiting for user interaction
      idleVibrationIntervalRef.current = setInterval(() => {
        vibrate([35, 25, 35]);
      }, 2400);
    }, 1850);

    return () => {
      clearTimeout(headBonkTimer);
      clearTimeout(landImpactTimer);
      clearTimeout(settleTimer);
      if (idleVibrationIntervalRef.current) {
        clearInterval(idleVibrationIntervalRef.current);
      }
    };
  }, [item, play, settings?.soundEnabled]);

  // Clear idle vibration as soon as user starts interacting
  const stopIdleVibration = () => {
    if (idleVibrationIntervalRef.current) {
      clearInterval(idleVibrationIntervalRef.current);
      idleVibrationIntervalRef.current = null;
    }
  };

  // 2. Chest Click Handler (3-step kinetic physics: Shake -> Jump 1 -> Jump 2 -> Explosive Opening)
  const handleChestClick = useCallback(() => {
    if (!isLanded || isRevealed || tapCount >= 3) return;

    stopIdleVibration();
    const nextTaps = tapCount + 1;
    setTapCount(nextTaps);

    if (nextTaps === 1) {
      // Tap 1: Medium bounce vibration + click sound
      vibrate([42, 25, 42]);
      if (settings?.soundEnabled !== false) play("chest_click");
      setTimeout(() => {
        if (settings?.soundEnabled !== false) play("chest_land");
      }, 350);
    } else if (nextTaps === 2) {
      // Tap 2: Energetic medium double vibration + anticipation jump
      vibrate([50, 30, 50]);
      if (settings?.soundEnabled !== false) play("chest_click");
      setTimeout(() => {
        if (settings?.soundEnabled !== false) play("chest_land");
      }, 420);
    } else if (nextTaps >= 3) {
      // Tap 3: Celebration unboxing medium-plus vibration + reveal fanfare
      vibrate([60, 35, 60, 35, 80]);
      if (settings?.soundEnabled !== false) {
        play("chest_click");
        setTimeout(() => {
          play("chest_reveal");
        }, 480);
      }

      // Smoothly transition into the revealed circular item stage after explosive vortex vanish
      setTimeout(() => {
        setIsRevealed(true);
      }, 1050);
    }
  }, [isLanded, tapCount, isRevealed, play, settings?.soundEnabled]);

  // 3. Dismissal Handler
  const handleDismiss = useCallback(() => {
    if (!isRevealed) return;
    vibrate(28);
    if (settings?.soundEnabled !== false) {
      play("click");
    }
    onClose();
  }, [isRevealed, play, settings?.soundEnabled, onClose]);

  if (!item) return null;

  const rarityColor =
    item.rarity === "legendary"
      ? "from-amber-400 via-orange-500 to-yellow-300"
      : item.rarity === "epic"
      ? "from-purple-400 via-pink-500 to-indigo-400"
      : item.rarity === "rare"
      ? "from-blue-400 via-cyan-400 to-teal-300"
      : "from-emerald-400 via-teal-400 to-cyan-400";

  const rarityRingColor =
    item.rarity === "legendary"
      ? "border-amber-400/80 shadow-amber-400/50"
      : item.rarity === "epic"
      ? "border-purple-400/80 shadow-purple-400/50"
      : item.rarity === "rare"
      ? "border-blue-400/80 shadow-blue-400/50"
      : "border-emerald-400/80 shadow-emerald-400/50";

  return (
    <AnimatePresence>
      <div
        id="shopChestUnboxingModal"
        onClick={isRevealed ? handleDismiss : undefined}
        className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-4 select-none backdrop-blur-md bg-slate-900/25"
        style={{
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Kinetic Duolingo-style Physics & Animations */}
        <style>{`
          .shop-chest-viewport {
            width: 300px;
            height: 300px;
            position: relative;
            cursor: pointer;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }

          .shop-reward-glow {
            position: absolute;
            top: 0px;
            left: 0px;
            width: 300px;
            height: 300px;
            opacity: 0;
            transform: scale(0.4);
            pointer-events: none;
            z-index: 1;
          }
          .shop-tap-3 .shop-reward-glow {
            animation: shopGlowBurst 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.25) forwards, shopSpinGlow 15s linear infinite;
            animation-delay: 0.48s;
          }

          .shop-box-mesh {
            width: 100%;
            height: 100%;
            transform-origin: 150px 270px;
            position: relative;
            z-index: 2;
            overflow: visible;
          }

          /* DUOLINGO-STYLE FALL, HEAD-BONK, FLIP-JUMP, AND SQUASH-STRETCH LANDING */
          @keyframes shopDuolingoFallPhysics {
            0% {
              transform: translateY(-800px) rotate(-160deg) scale(0.7, 1.35);
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            /* 32%: Hits ground upside-down on its top lid! */
            32% {
              transform: translateY(18px) rotate(-185deg) scale(1.36, 0.64);
            }
            /* 38%: Rebounds slightly upside-down */
            38% {
              transform: translateY(-12px) rotate(-200deg) scale(0.88, 1.16);
            }
            /* 44%: Compression before jumping up and flipping */
            44% {
              transform: translateY(8px) rotate(-180deg) scale(1.24, 0.76);
            }
            /* 62%: Jumps high into the air and flips upright (180 -> 360 deg) */
            62% {
              transform: translateY(-115px) rotate(-340deg) scale(0.82, 1.26);
            }
            /* 78%: Hits ground upright with massive juicy squash! */
            78% {
              transform: translateY(16px) rotate(-360deg) scale(1.46, 0.56);
            }
            /* 86%: Deep rebound stretch upward */
            86% {
              transform: translateY(-22px) rotate(-360deg) scale(0.86, 1.20);
            }
            /* 93%: Soft settling compression */
            93% {
              transform: translateY(5px) rotate(-360deg) scale(1.10, 0.92);
            }
            /* 100%: Resting upright */
            100% {
              transform: translateY(0px) rotate(-360deg) scale(1, 1);
            }
          }

          .shop-fall-animation .shop-box-mesh {
            animation: shopDuolingoFallPhysics 1.85s cubic-bezier(0.28, 0.84, 0.42, 1) forwards;
          }

          /* Idle Anticipation Wobble + Organic Shake (After Landing) */
          @keyframes shopIdleDuolingoBounce {
            0%, 100% { transform: scale(1) translateY(0); }
            45% { transform: scale(1.06, 0.94) translateY(0); }
            65% { transform: scale(0.94, 1.06) translateY(-14px); }
            78% { transform: scale(1.04, 0.96) translateY(0); }
          }
          @keyframes shopAnticipationDuolingoShake {
            0%, 70%, 100% { transform: rotate(0deg) scale(1); }
            74% { transform: rotate(-6deg) scale(1.05) translateY(-3px); }
            78% { transform: rotate(6deg) scale(1.05) translateY(2px); }
            82% { transform: rotate(-5deg) scale(1.04) translateY(-2px); }
            86% { transform: rotate(5deg) scale(1.04) translateY(2px); }
            90% { transform: rotate(-2deg) scale(1.02) translateY(0); }
            94% { transform: rotate(2deg) scale(1.02) translateY(0); }
          }

          .shop-stage-idle .shop-box-mesh {
            animation: shopIdleDuolingoBounce 1.8s ease-in-out infinite, shopAnticipationDuolingoShake 2.4s ease-in-out infinite;
          }

          /* 3-TAP JUMP & SQUASH PHYSICS */
          .shop-tap-1 .shop-box-mesh { animation: shopPopJump1 0.45s ease-in-out forwards; }
          .shop-tap-2 .shop-box-mesh { animation: shopPopJump2 0.6s ease-in-out forwards; }
          .shop-tap-3 .shop-box-mesh { animation: shopFinalLaunchVanish 1.25s cubic-bezier(0.25, 1, 0.5, 1) forwards; }

          .shop-box-lid { transform-origin: 150px 145px; }
          .shop-tap-3 .shop-box-lid { animation: shopLidSpringBack 0.52s cubic-bezier(0.175, 0.885, 0.32, 1.4) forwards; animation-delay: 0.48s; }

          .shop-box-lock { transform-origin: 150px 150px; }
          .shop-tap-3 .shop-box-lock { animation: shopLockSnapFall 0.45s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards; animation-delay: 0.48s; }

          @keyframes shopPopJump1 {
            0% { transform: scale(1) translateY(0); }
            15% { transform: scale(1.18, 0.82) translateY(5px); }
            45% { transform: scale(0.90, 1.10) translateY(-30px) rotate(5deg); }
            70% { transform: scale(1.20, 0.80) translateY(0); }
            100% { transform: scale(1) translateY(0); }
          }

          @keyframes shopPopJump2 {
            0% { transform: scale(1) translateY(0); }
            15% { transform: scale(1.28, 0.72) translateY(8px); }
            45% { transform: scale(0.85, 1.18) translateY(-65px) rotate(-7deg); }
            72% { transform: scale(1.30, 0.70) translateY(0); }
            100% { transform: scale(1) translateY(0); }
          }

          @keyframes shopFinalLaunchVanish {
            0% { transform: scale(1) translateY(0) opacity(1); filter: brightness(1); }
            10% { transform: scale(1.35, 0.55) translateY(14px); }
            32% { transform: scale(0.76, 1.35) translateY(-110px); }
            48% { transform: scale(1.45, 0.55) translateY(0); filter: brightness(1.3); } 
            65% { transform: scale(1.6, 0.3) translateY(18px); opacity: 1; filter: brightness(2.2); }
            78% { transform: scale(0.05, 2.5) translateY(-40px); opacity: 0.3; }
            85% { transform: scale(0) translateY(-60px); opacity: 0; }
            100% { transform: scale(0) translateY(0); opacity: 0; }
          }

          @keyframes shopLidSpringBack {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-78deg) translateY(-14px); }
          }

          @keyframes shopLockSnapFall {
            0% { transform: scale(1) translateY(0); opacity: 1; }
            100% { transform: translateY(110px) rotate(-45deg); opacity: 0; }
          }

          @keyframes shopGlowBurst { 100% { opacity: 0.85; transform: scale(1.4); } }
          @keyframes shopSpinGlow { 100% { transform: scale(1.4) rotate(360deg); } }

          /* Circular Float Item Animation */
          @keyframes shopCircularFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(1.5deg); }
          }
          .animate-shop-circle-float {
            animation: shopCircularFloat 3.2s ease-in-out infinite;
          }

          @keyframes shopAuraSpinFast {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          .animate-shop-sunrays {
            animation: shopAuraSpinFast 20s linear infinite;
          }
        `}</style>

        {/* ========================================================================= */}
        {/* STAGE 1: KINETIC CHEST BOX (DROP, SHAKE, JUMP & POPPING VORTEX)           */}
        {/* ========================================================================= */}
        {!isRevealed && (
          <div className="relative flex flex-col items-center justify-center">
            {/* The Master Kinetic Chest Stage */}
            <div
              id="shopKineticChest"
              onClick={handleChestClick}
              className={`shop-chest-viewport ${
                !isLanded
                  ? "shop-fall-animation"
                  : tapCount === 1
                  ? "shop-tap-1"
                  : tapCount === 2
                  ? "shop-tap-2"
                  : tapCount >= 3
                  ? "shop-tap-3"
                  : "shop-stage-idle"
              }`}
            >
              {/* CIRCULAR GLOWING AURA BACKGROUND */}
              <div className="shop-reward-glow">
                <svg className="w-full h-full" viewBox="0 0 300 300">
                  <g fill="#FFD000">
                    <path d="M150,150 L120,0 L180,0 Z" />
                    <path d="M150,150 L300,120 L300,180 Z" />
                    <path d="M150,150 L180,300 L120,300 Z" />
                    <path d="M150,150 L0,180 L0,120 Z" />
                    <path d="M150,150 L255,45 L210,22 Z" />
                    <path d="M150,150 L255,255 L277,210 Z" />
                    <path d="M150,150 L45,255 L90,277 Z" />
                    <path d="M150,150 L45,45 L22,90 Z" />
                  </g>
                </svg>
              </div>

              {/* Core Jump Mesh Housing SVG with Physics */}
              <div className="shop-box-mesh">
                <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 300 300">
                  <defs>
                    <linearGradient id="woodGradShop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A64B24" />
                      <stop offset="100%" stopColor="#54210B" />
                    </linearGradient>
                    <linearGradient id="goldGradShop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFF275" />
                      <stop offset="40%" stopColor="#FFC107" />
                      <stop offset="100%" stopColor="#E67E00" />
                    </linearGradient>
                    <linearGradient id="darkGoldShop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFC107" />
                      <stop offset="100%" stopColor="#994D00" />
                    </linearGradient>
                  </defs>

                  {/* CHEST BASE */}
                  <g>
                    <path
                      d="M30,145 L270,145 L255,255 C255,265 245,275 230,275 L70,275 C55,275 45,265 45,255 Z"
                      fill="url(#woodGradShop)"
                      stroke="#2D1104"
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M35,180 L265,180 M40,215 L260,215 M43,245 L257,245"
                      stroke="#3A1705"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    <path
                      d="M65,145 L105,145 L95,275 L60,275 Z"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M195,145 L235,145 L240,275 L205,275 Z"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="5"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="40"
                      y="245"
                      width="220"
                      height="30"
                      rx="8"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="5"
                    />
                    <rect
                      x="35"
                      y="240"
                      width="40"
                      height="40"
                      rx="10"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="5"
                    />
                    <rect
                      x="225"
                      y="240"
                      width="40"
                      height="40"
                      rx="10"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="5"
                    />
                    <circle cx="55" cy="260" r="5" fill="#FFE082" stroke="#2D1104" strokeWidth="2" />
                    <circle cx="245" cy="260" r="5" fill="#FFE082" stroke="#2D1104" strokeWidth="2" />
                  </g>

                  {/* CHEST LID (Springs back on tap 3) */}
                  <g className="shop-box-lid">
                    <path
                      d="M30,145 C30,30 270,30 270,145 Z"
                      fill="url(#woodGradShop)"
                      stroke="#2D1104"
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M40,110 Q150,90 260,110 M55,75 Q150,50 245,75 M85,45 Q150,30 215,45"
                      stroke="#3A1705"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                    <path
                      d="M65,145 L105,145 C105,75 145,50 150,50 C120,50 65,70 65,145 Z"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="5"
                    />
                    <path
                      d="M235,145 L195,145 C195,75 155,50 150,50 C180,50 235,70 235,145 Z"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="5"
                    />
                    <rect
                      x="20"
                      y="125"
                      width="260"
                      height="25"
                      rx="8"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="6"
                    />
                    <circle cx="50" cy="137" r="5" fill="#FFE082" stroke="#2D1104" strokeWidth="2" />
                    <circle cx="85" cy="137" r="5" fill="#FFE082" stroke="#2D1104" strokeWidth="2" />
                    <circle cx="215" cy="137" r="5" fill="#FFE082" stroke="#2D1104" strokeWidth="2" />
                    <circle cx="250" cy="137" r="5" fill="#FFE082" stroke="#2D1104" strokeWidth="2" />
                  </g>

                  {/* CHEST LOCK (Snaps & falls on tap 3) */}
                  <g className="shop-box-lock">
                    <path
                      d="M125,145 C125,110 175,110 175,145"
                      fill="none"
                      stroke="url(#darkGoldShop)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <ellipse
                      cx="150"
                      cy="170"
                      rx="40"
                      ry="34"
                      fill="url(#goldGradShop)"
                      stroke="#2D1104"
                      strokeWidth="5"
                    />
                    <circle cx="150" cy="162" r="7" fill="#2D1104" />
                    <path d="M145,162 L155,162 L158,180 L142,180 Z" fill="#2D1104" />
                  </g>
                </svg>
              </div>
            </div>

            {/* ONLY SHOW BUTTON ONCE CHEST HAS LANDED AND BEFORE THE FIRST TAP */}
            {isLanded && tapCount === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-6 text-center"
              >
                <button
                  onClick={handleChestClick}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm tracking-wide shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-2 mx-auto animate-bounce"
                >
                  <Hand className="w-4 h-4 text-yellow-200" />
                  <span>Tap Chest to Open</span>
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: CIRCULAR LUXURY ITEM CARD DESIGN WITH RADIANT GOLDEN HALO        */}
        {/* ========================================================================= */}
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.25, y: 80 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative flex flex-col items-center justify-center text-center max-w-sm w-full mx-auto"
          >
            {/* SPINNING CIRCULAR SUNBEAMS AURA */}
            <div className="absolute top-1/2 left-1/2 w-[420px] h-[420px] pointer-events-none -z-10">
              <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/40 to-amber-500/50 blur-3xl animate-pulse" />
              <svg
                className="absolute top-1/2 left-1/2 w-[420px] h-[420px] animate-shop-sunrays opacity-70"
                viewBox="0 0 300 300"
              >
                <g fill="#FFD000">
                  <path d="M150,150 L115,0 L185,0 Z" />
                  <path d="M150,150 L300,115 L300,185 Z" />
                  <path d="M150,150 L185,300 L115,300 Z" />
                  <path d="M150,150 L0,185 L0,115 Z" />
                  <path d="M150,150 L260,40 L205,15 Z" />
                  <path d="M150,150 L260,260 L285,205 Z" />
                  <path d="M150,150 L40,260 L95,285 Z" />
                  <path d="M150,150 L40,40 L15,95 Z" />
                </g>
              </svg>
            </div>

            {/* CIRCULAR REWARD MEDALLION / CARD CONTAINER */}
            <div className="animate-shop-circle-float w-full flex flex-col items-center">
              {/* PRIMARY CIRCULAR ITEM HALO */}
              <div
                className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-white/95 to-slate-50/90 backdrop-blur-xl border-4 ${rarityRingColor} shadow-2xl flex items-center justify-center mb-5`}
              >
                {/* Floating Stardust particles */}
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <Sparkles className="w-4 h-4 text-white animate-spin" />
                </div>

                {/* ITEM ICON / ACCESSORY */}
                <div className="flex items-center justify-center">
                  {item.id === "skin-cool" ? (
                    <AnimatedSunglasses className="w-28 h-20 drop-shadow-lg" />
                  ) : item.id === "skin-ninja" ? (
                    <AnimatedNinjaMask className="w-24 h-24 drop-shadow-lg" />
                  ) : item.id === "skin-viking" ? (
                    <AnimatedVikingHat className="w-24 h-24 drop-shadow-lg" />
                  ) : item.id === "skin-detective" ? (
                    <AnimatedDetectiveKit className="w-24 h-24 drop-shadow-lg" />
                  ) : item.id === "skin-wizard" ? (
                    <AnimatedWizardHat className="w-24 h-24 drop-shadow-lg" />
                  ) : item.id === "skin-crown" ? (
                    <AnimatedRoyalCrown className="w-24 h-24 drop-shadow-lg" />
                  ) : (
                    <div className="text-7xl sm:text-8xl filter drop-shadow-xl select-none">
                      {typeof item.icon === "string" ? item.icon : "✨"}
                    </div>
                  )}
                </div>
              </div>

              {/* CIRCULAR PILL RARITY BADGE */}
              <div className="mb-2">
                <span
                  className={`inline-block px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${rarityColor} shadow-md border border-white/40`}
                >
                  {item.rarity || "COMMON"} ITEM
                </span>
              </div>

              {/* ITEM TITLE & DESCRIPTION */}
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1 text-shadow-sm">
                {item.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold mb-4 max-w-xs line-clamp-2">
                {item.description || "Unlocked from Nexora Official Shop!"}
              </p>

              {/* SAVED TO LIBRARY BADGE */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white rounded-full py-1.5 px-4 text-xs font-black shadow-lg shadow-emerald-500/30 mb-5 border border-emerald-300">
                <PackageCheck className="w-4 h-4" />
                <span>Saved to your Library</span>
              </div>

              {/* CIRCULAR CLAIM BUTTON */}
              <button
                onClick={handleDismiss}
                className="w-full max-w-xs py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-amber-300"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Collect Item</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
