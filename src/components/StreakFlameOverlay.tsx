import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { StreakFlame } from "./StreakFlame";
import { triggerHaptic } from "../lib/mascotHaptics";
import { playSound } from "../hooks/useSound";

export interface StreakFlameOverlayProps {
  status: "frozen" | "broken" | "active" | "restored";
  streakCount: number;
  onDismiss: () => void;
}

export const StreakFlameOverlay: React.FC<StreakFlameOverlayProps> = ({
  status,
  streakCount,
  onDismiss,
}) => {
  const [isDismissing, setIsDismissing] = useState(false);

  // Initial ambient sound and haptic when overlay opens based on status
  useEffect(() => {
    try {
      if (status === "frozen") {
        playSound("water");
        triggerHaptic("tap");
      } else if (status === "broken") {
        playSound("losing");
        triggerHaptic("powerActivation");
      } else {
        playSound("fire_streak");
        triggerHaptic("tap");
      }
    } catch (e) {}
  }, [status]);

  // Clicking outside / around the flame exits the streak page
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isDismissing) return;
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleCloseButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDismissing) return;
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const flameMode =
    status === "active" || status === "restored"
      ? "restored"
      : status === "frozen"
      ? "frozen"
      : "broken";

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          id="streak-flame-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none cursor-pointer bg-gradient-to-b from-sky-50/90 via-white/95 to-blue-50/90 backdrop-blur-3xl overflow-hidden p-4"
          style={{
            WebkitBackdropFilter: "blur(32px)",
            backdropFilter: "blur(32px)",
          }}
        >
          {/* Subtle Ambient Orbs */}
          {flameMode === "restored" ? (
            <>
              <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-200/35 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
            </>
          ) : (
            <>
              <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-200/35 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />
            </>
          )}

          {/* Top Exit / Dismiss Button */}
          <motion.button
            id="streak-overlay-dismiss-btn"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={handleCloseButton}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-slate-200/70 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-95 z-30"
            title="Exit Streak Page"
          >
            <X size={18} />
          </motion.button>

          {/* Central Container - clicking inside keeps state unchanged and prevents background dismiss */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center max-w-sm w-full cursor-default"
          >
            {/* Streak Flame Component */}
            <StreakFlame mode={flameMode} />

            {/* Streak Counter Number Underneath */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="mt-4 flex items-center justify-center select-none"
            >
              <span
                id="streak-overlay-counter"
                className={`text-5xl sm:text-6xl font-black tracking-tight tabular-nums ${
                  flameMode === "restored"
                    ? "text-orange-500"
                    : flameMode === "frozen"
                    ? "text-cyan-700"
                    : "text-slate-700"
                }`}
              >
                {streakCount}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
