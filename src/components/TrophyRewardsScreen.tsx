import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy as TrophyIcon,
  Sparkles,
  Check,
  Download,
  Share2,
} from "lucide-react";
import { GoldenTrophy, IceTrophy, BrokenTrophy } from "./Trophies";
import { useSound } from "../hooks/useSound";
import { TrophyType } from "../types";
import { vibrate } from "../lib/vibrate";

interface TrophyRewardsScreenProps {
  trophyType: TrophyType;
  onFinish: () => void;
  settings?: any;
}

export function TrophyRewardsScreen({
  trophyType,
  onFinish,
  settings,
}: TrophyRewardsScreenProps) {
  const { play, stop, playMusic, stopAllMusic } = useSound();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // 1. Stop all previous background music immediately (so fanfare is heard clearly)
    stopAllMusic();

    if (settings?.soundEnabled === false) {
      const timer = setTimeout(() => setShowButton(true), 1500);
      return () => clearTimeout(timer);
    }

    // Play a triumphant song using a BufferSource so it plays EXACTLY once and to the end!
    // No overlapping trophy sounds, just the main theme.
    const musicKey =
      trophyType === "golden" ? "trophy_fanfare" : "trophy_triplets";

    const musicTimer = setTimeout(() => {
      try {
        play(musicKey as any);
      } catch (e) {
        console.error("Music blocked");
      }
    }, 100);
    vibrate(20);

    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(musicTimer);
      // DO NOT call stopAllMusic() here, so that the fanfare completes playing smoothly to the end!
    };
  }, [play, stopAllMusic, trophyType, settings?.soundEnabled]);

  const themeConfig = {
    golden: {
      bg: "from-[#faf8f4] via-[#f4efe3] to-[#e7dec7]",
      accentText: "text-amber-600",
      accentTitle: "text-amber-950",
      descText: "text-amber-900/70",
      tagBg: "bg-amber-500/10 border border-amber-500/20",
      tagText: "text-amber-800",
      buttonBg: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-xl shadow-amber-500/20 border-t border-white/20",
      buttonText: "text-amber-950",
    },
    ice: {
      bg: "from-[#f3fafd] via-[#e2f1f7] to-[#cbe5f2]",
      accentText: "text-sky-600",
      accentTitle: "text-sky-950",
      descText: "text-sky-900/70",
      tagBg: "bg-sky-500/10 border border-sky-500/20",
      tagText: "text-sky-800",
      buttonBg: "bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 shadow-xl shadow-sky-500/20 border-t border-white/20",
      buttonText: "text-white",
    },
    broken: {
      bg: "from-[#fafafa] via-[#f1f1f1] to-[#dedede]",
      accentText: "text-gray-600",
      accentTitle: "text-gray-900",
      descText: "text-gray-600/70",
      tagBg: "bg-gray-500/10 border border-gray-500/20",
      tagText: "text-gray-800",
      buttonBg: "bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 shadow-xl shadow-gray-600/20 border-t border-white/10",
      buttonText: "text-white",
    }
  }[trophyType] || {
    bg: "from-[#faf8f4] via-[#f4efe3] to-[#e7dec7]",
    accentText: "text-amber-600",
    accentTitle: "text-amber-950",
    descText: "text-amber-900/70",
    tagBg: "bg-amber-500/10 border border-amber-500/20",
    tagText: "text-amber-800",
    buttonBg: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-xl shadow-amber-500/20 border-t border-white/20",
    buttonText: "text-amber-950",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed inset-0 z-[1000] bg-radial ${themeConfig.bg} overflow-y-auto w-full h-full no-scrollbar`}
      style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: 'contain' }}
    >
      <div className="min-h-[120vh] sm:min-h-screen flex flex-col items-center justify-start py-12 px-6 text-center relative w-full pb-32">
        {/* Background Decor */}
        <div className="fixed inset-0 pointer-events-none w-full h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center opacity-5"
          >
            <div className="w-[150%] aspect-square bg-[conic-gradient(from_0deg,transparent_0deg,#3b82f6_20deg,transparent_40deg)]" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8"
        >
          <div className="space-y-2">
            <p className={`${themeConfig.accentText} font-black uppercase tracking-[0.4em] text-xs`}>
              Achievement Unlocked
            </p>
            <h2 className={`text-5xl font-black ${themeConfig.accentTitle} italic tracking-tighter uppercase`}>
              {trophyType === "golden"
                ? "Pure Victory"
                : trophyType === "ice"
                  ? "Frozen Solid"
                  : "Shattered Soul"}
            </h2>
          </div>

          <motion.div
            className="w-80 h-80 relative"
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          >
            {trophyType === "golden" && <GoldenTrophy />}
            {trophyType === "ice" && <IceTrophy />}
            {trophyType === "broken" && <BrokenTrophy />}

            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 blur-3xl -z-10 rounded-full ${trophyType === "golden" ? "bg-yellow-400" : "bg-blue-300"}`}
            />
          </motion.div>

          <div className="space-y-4 max-w-xs">
            <p className={`${themeConfig.descText} font-medium leading-relaxed italic`}>
              "
              {trophyType === "golden"
                ? "You've proven your discipline today, bro. This golden treasure belongs to the elite."
                : "Consistency is freezing up. Don't let your discipline slip into the cold abyss!"}
              "
            </p>

            <div className="flex items-center justify-center gap-3">
              <div className={`px-4 py-2 ${themeConfig.tagBg} rounded-full flex items-center gap-2`}>
                <Sparkles size={14} className={themeConfig.accentText} />
                <span className={`text-[10px] font-black ${themeConfig.tagText} uppercase`}>
                  Season 1 Rare
                </span>
              </div>
              <div className={`px-4 py-2 ${themeConfig.tagBg} rounded-full flex items-center gap-2`}>
                <Check size={14} className="text-green-600" />
                <span className={`text-[10px] font-black ${themeConfig.tagText} uppercase`}>
                  Verified
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showButton && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-4"
              >
                <button
                  onClick={() => {
                    play("nav_switch");
                    onFinish();
                  }}
                  className={`w-full ${themeConfig.buttonBg} ${themeConfig.buttonText} py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all active:scale-95 text-lg cursor-pointer`}
                >
                  Finished
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={async () => {
                      const el = document.querySelector(".trophy-card-capture");
                      if (el) {
                        vibrate(20);
                        const { toPng } = await import("html-to-image");
                        const dataUrl = await toPng(el as HTMLElement, {
                          backgroundColor: "#fff",
                        });
                        const link = document.createElement("a");
                        link.download = `Nexora_Trophy_${trophyType}.png`;
                        link.href = dataUrl;
                        link.click();
                      }
                    }}
                    className="flex-1 py-4 bg-black/5 hover:bg-black/10 text-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={14} /> Save Card
                  </button>
                  <button
                    onClick={async () => {
                      vibrate(10);
                      // Use a clean origin URL so it works in any browser
                      const baseUrl =
                        window.location.origin +
                        (window.location.pathname === "/"
                          ? ""
                          : window.location.pathname);
                      const shareUrl = `${baseUrl}`;
                      const shareText = `Bro, check my discipline stats! I just earned a ${trophyType.toUpperCase()} trophy on Nexora! 🏆🚀`;

                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: "Nexora Elite Rank",
                            text: shareText,
                            url: shareUrl,
                          });
                        } catch (e) {
                          await navigator.clipboard.writeText(shareUrl);
                          alert("Profile link copied! 📋");
                        }
                      } else {
                        await navigator.clipboard.writeText(shareUrl);
                        alert(
                          "Profile link copied to clipboard! 📋 Past it anywhere, bro!",
                        );
                      }
                    }}
                    className="flex-1 py-4 bg-black/5 hover:bg-black/10 text-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 size={14} /> Share Rank
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Capture element for Save Card */}
        <div className="fixed -left-[2000px] top-0">
          <div className="trophy-card-capture bg-white w-[400px] p-12 flex flex-col items-center text-center gap-8 border-8 border-blue-500">
            <h2 className="text-4xl font-black text-blue-900 italic uppercase">
              Nexora Champion
            </h2>
            <div className="w-64 h-64">
              {trophyType === "golden" && <GoldenTrophy />}
              {trophyType === "ice" && <IceTrophy />}
              {trophyType === "broken" && <BrokenTrophy />}
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-black text-blue-600 uppercase tracking-widest">
                {trophyType === "golden"
                  ? "Golden Victory"
                  : trophyType === "ice"
                    ? "Frozen CONSISTENCY"
                    : "SHATTERED"}
              </p>
              <p className="text-gray-500 font-bold italic">
                "Discipline created a legend today."
              </p>
            </div>
          </div>
        </div>

        {/* Floating Sparkles */}
        <div className="fixed inset-0 pointer-events-none w-full h-full z-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 100,
                opacity: 0,
              }}
              animate={{
                y: -100,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
