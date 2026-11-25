import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Copy,
  Check,
  Share2,
  Users,
  Coins,
  ArrowRight,
  QrCode,
  Sparkles,
  UserPlus,
  Clock,
  ShieldCheck,
  Sprout,
  Flame,
  Trophy,
} from "lucide-react";
import { Mascot } from "./Mascot";
import { ReferralRecord, UserSettings } from "../types";
import { vibrate, VIBRATION_PATTERNS } from "../lib/vibrate";
import { copyToClipboard } from "../lib/clipboard";
import {
  buildReferralShareUrl,
  REFERRAL_REWARD_COINS,
  ReferrerPublicProfile,
  subscribeToReferrals,
} from "../services/referralService";

const transitionEase = [0.16, 1, 0.3, 1] as const;

interface ReferralPromptModalProps {
  isOpen: boolean;
  settings: UserSettings;
  onAccept: () => void;
  onLater: () => void;
}

export function ReferralPromptModal({
  isOpen,
  settings,
  onAccept,
  onLater,
}: ReferralPromptModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="referral-prompt-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[950] flex items-center justify-center p-4 sm:p-6 bg-[#1C1714]/60 backdrop-blur-md"
        >
          <motion.div
            key="referral-prompt-card"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-md bg-[#FAF7F2] border border-[#E9E4D4] rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden text-center"
          >
            {/* Soft warm glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#69C496]/20 blur-3xl" />

            {/* Animated Mascot Stage */}
            <div className="relative flex flex-col items-center justify-center pt-2 pb-3">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, -3, 3, 0],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <Mascot
                  className="w-28 h-28 sm:w-32 sm:h-32"
                  mood="celebrating"
                  hat={settings?.activeHat || "none"}
                  theme={settings?.activeSkin || "standard"}
                  effect={settings?.activeEffect || "none"}
                  performanceMode={settings?.performanceMode}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, ease: transitionEase }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/70 text-amber-900 text-xs font-extrabold"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>+{REFERRAL_REWARD_COINS} Coins per friend</span>
              </motion.div>
            </div>

            {/* Copy */}
            <div className="relative z-10 space-y-2.5 mt-2">
              <h2 className="text-2xl font-black text-[#4F3F34] tracking-tight leading-tight text-balance">
                Bring Your Friends Into Nexora
              </h2>
              <p className="text-sm sm:text-[15px] font-semibold text-[#6F5C4E] leading-relaxed">
                Share the app with friends to make the app fun and you can get more coins! Every friend who accepts and creates a new account earns you{" "}
                <span className="font-black text-amber-700">+{REFERRAL_REWARD_COINS} Coins</span>.
              </p>
            </div>

            {/* Actions */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
              <button
                type="button"
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
                  onLater();
                }}
                className="order-2 sm:order-1 min-h-[48px] px-5 py-3 rounded-2xl bg-white border border-[#E9E4D4] text-[#6F5C4E] font-bold text-sm hover:bg-[#F3EEE5] active:scale-[0.98] transition-all cursor-pointer"
              >
                Do it later
              </button>
              <button
                type="button"
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                  onAccept();
                }}
                className="order-1 sm:order-2 min-h-[48px] px-5 py-3 rounded-2xl bg-[#69C496] hover:bg-[#58b586] text-white font-black text-sm shadow-lg shadow-[#69C496]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accept</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type ReferralFlowStep = "congrats" | "share" | "tracker";

interface ReferralShareFlowModalProps {
  isOpen: boolean;
  initialStep?: ReferralFlowStep;
  userUid: string;
  settings: UserSettings;
  referralCount: number;
  referralCoinsEarned: number;
  showToast: (msg: string, type?: "success" | "info" | "error") => void;
  onClose: () => void;
}

export function ReferralShareFlowModal({
  isOpen,
  initialStep = "congrats",
  userUid,
  settings,
  referralCount,
  referralCoinsEarned,
  showToast,
  onClose,
}: ReferralShareFlowModalProps) {
  const [step, setStep] = useState<ReferralFlowStep>(initialStep);
  const [copied, setCopied] = useState(false);
  const [records, setRecords] = useState<ReferralRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);

  useEffect(() => {
    if (!isOpen || !userUid) return;
    const unsubscribe = subscribeToReferrals(userUid, (items) => {
      setRecords(items);
    });
    return () => unsubscribe();
  }, [isOpen, userUid]);

  const inviteUrl = buildReferralShareUrl(userUid);
  const liveFriendsCount = Math.max(records.length, referralCount || 0);
  const liveCoinsEarned = Math.max(
    records.reduce((sum, r) => sum + (r.coinsAwarded || REFERRAL_REWARD_COINS), 0),
    referralCoinsEarned || 0,
    liveFriendsCount * REFERRAL_REWARD_COINS
  );

  const handleCopyLink = async () => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      showToast("Invite link copied! Share it with your friends.", "success");
      setTimeout(() => setCopied(false), 2200);
    } else {
      showToast("Could not copy automatically. Please copy the link manually.", "error");
    }
  };

  const handleNativeShare = async () => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Join me on Nexora!",
          text: "Build daily habits, grow your botanical garden, and level up with me on Nexora!",
          url: inviteUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
    await handleCopyLink();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="referral-flow-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[960] flex items-center justify-center p-4 sm:p-6 bg-[#1C1714]/65 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            key="referral-flow-shell"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#E9E4D4] rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden my-auto"
          >
            {/* Small Top-Right Close (X) Button with generous 44x44 mobile touch target */}
            <button
              type="button"
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                onClose();
              }}
              aria-label="Close invite hub"
              className="absolute top-3 right-3 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#7D6B58] hover:text-[#4F3F34] hover:bg-[#E9E4D4]/50 active:scale-90 transition-all cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <AnimatePresence mode="wait">
              {step === "congrats" && (
                <motion.div
                  key="step-congrats"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: transitionEase }}
                  className="flex flex-col items-center text-center pt-2"
                >
                  {/* Animated celebration particles */}
                  <div className="relative w-full flex items-center justify-center h-36">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-32 h-32 rounded-full bg-amber-300/35 blur-2xl"
                    />
                    <motion.div
                      initial={{ y: 20, scale: 0.7 }}
                      animate={{
                        y: [0, -14, 0, -7, 0],
                        rotate: [0, -4, 4, 0],
                        scale: 1,
                      }}
                      transition={{
                        y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                        scale: { type: "spring", stiffness: 300, damping: 18 },
                      }}
                      className="relative z-10"
                    >
                      <Mascot
                        className="w-28 h-28"
                        mood="celebrating"
                        hat={settings?.activeHat || "none"}
                        theme={settings?.activeSkin || "standard"}
                        effect={settings?.activeEffect || "none"}
                        performanceMode={settings?.performanceMode}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="space-y-3 mt-2"
                  >
                    <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700">
                      <Sparkles className="w-4 h-4 text-[#69C496]" />
                      <span>Invite Hub Unlocked</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#4F3F34] tracking-tight text-balance">
                      Congratulations!
                    </h2>
                    <p className="text-sm font-semibold text-[#6F5C4E] leading-relaxed max-w-sm mx-auto">
                      Your personal QR code and invite link are ready. Share them with friends—every time a friend accepts and creates a new account, you earn{" "}
                      <span className="font-black text-amber-700">+{REFERRAL_REWARD_COINS} Coins</span>!
                    </p>
                  </motion.div>

                  <button
                    type="button"
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      setStep("share");
                    }}
                    className="mt-7 w-full min-h-[50px] px-6 py-3.5 rounded-2xl bg-[#69C496] hover:bg-[#58b586] text-white font-black text-sm shadow-lg shadow-[#69C496]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Get My QR Code & Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === "share" && (
                <motion.div
                  key="step-share"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: transitionEase }}
                  className="flex flex-col items-center text-center pt-1"
                >
                  {/* Segmented View Switcher */}
                  <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE9DC] mb-5 mr-6">
                    <button
                      type="button"
                      onClick={() => {
                        vibrate(10);
                        setStep("share");
                      }}
                      className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-white text-[#4F3F34] shadow-xs cursor-pointer"
                    >
                      Share & QR
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        vibrate(10);
                        setStep("tracker");
                      }}
                      className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-[#7D6B58] hover:text-[#4F3F34] cursor-pointer"
                    >
                      Friend Counter ({liveFriendsCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Mascot
                        className="w-14 h-14"
                        mood="happy"
                        hat={settings?.activeHat || "none"}
                        theme={settings?.activeSkin || "standard"}
                        performanceMode={settings?.performanceMode}
                      />
                    </motion.div>
                    <div className="text-left">
                      <h3 className="text-lg font-black text-[#4F3F34] leading-tight">
                        Share With Your Friends
                      </h3>
                      <p className="text-xs font-semibold text-[#7D6B58]">
                        +{REFERRAL_REWARD_COINS} Coins when each friend joins
                      </p>
                    </div>
                  </div>

                  {/* QR Code Card */}
                  <motion.div
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08, ease: transitionEase }}
                    className="bg-white border border-[#E9E4D4] rounded-3xl p-5 shadow-sm flex flex-col items-center w-full"
                  >
                    <div className="p-3 bg-white rounded-2xl border border-[#E9E4D4]">
                      <QRCodeSVG
                        value={inviteUrl}
                        size={168}
                        level="M"
                        bgColor="#FFFFFF"
                        fgColor="#2D231C"
                      />
                    </div>
                    <p className="text-xs font-bold text-[#7D6B58] mt-3">
                      Have a friend scan this QR code with their camera
                    </p>
                  </motion.div>

                  {/* Copy Link Box */}
                  <div className="w-full mt-4 space-y-2.5">
                    <div className="flex items-center gap-2 bg-white border border-[#E9E4D4] rounded-2xl p-2 pl-3.5">
                      <span className="text-xs font-mono font-semibold text-[#4F3F34] truncate flex-1 text-left">
                        {inviteUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DC] border border-[#E9E4D4] text-[#4F3F34] font-bold text-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="min-h-[48px] px-4 py-3 rounded-2xl bg-white border border-[#E9E4D4] hover:bg-[#F3EEE5] text-[#4F3F34] font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-[#69C496]" />
                        <span>Send Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          vibrate(VIBRATION_PATTERNS.SUCCESS);
                          setStep("tracker");
                        }}
                        className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#69C496] hover:bg-[#58b586] text-white font-black text-sm shadow-lg shadow-[#69C496]/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>Yeah, shared!</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "tracker" && (
                <motion.div
                  key="step-tracker"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: transitionEase }}
                  className="flex flex-col pt-1"
                >
                  {/* Segmented View Switcher */}
                  <div className="flex justify-center mb-5 mr-6">
                    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE9DC]">
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(10);
                          setStep("share");
                        }}
                        className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-[#7D6B58] hover:text-[#4F3F34] cursor-pointer"
                      >
                        Share & QR
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(10);
                          setStep("tracker");
                        }}
                        className="min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-white text-[#4F3F34] shadow-xs cursor-pointer"
                      >
                        Friend Counter ({liveFriendsCount})
                      </button>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-3.5 mb-5">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="shrink-0"
                    >
                      <Mascot
                        className="w-16 h-16"
                        mood={liveFriendsCount > 0 ? "celebrating" : "happy"}
                        hat={settings?.activeHat || "none"}
                        theme={settings?.activeSkin || "standard"}
                        performanceMode={settings?.performanceMode}
                      />
                    </motion.div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-[#4F3F34] tracking-tight">
                        Friend Invite Counter
                      </h3>
                      <p className="text-xs font-semibold text-[#7D6B58] leading-snug mt-0.5">
                        Updates automatically in the background—even if you close this or log out.
                      </p>
                    </div>
                  </div>

                  {/* Live Stat Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white border border-[#E9E4D4] rounded-2xl p-4 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#7D6B58]">
                        <Users className="w-4 h-4 text-[#69C496]" />
                        <span>Friends Joined</span>
                      </div>
                      <motion.div
                        key={liveFriendsCount}
                        initial={{ scale: 1.15 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-black text-[#4F3F34] tabular-nums mt-1"
                      >
                        {liveFriendsCount}
                      </motion.div>
                    </div>

                    <div className="bg-white border border-[#E9E4D4] rounded-2xl p-4 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#7D6B58]">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>Coins Earned</span>
                      </div>
                      <motion.div
                        key={liveCoinsEarned}
                        initial={{ scale: 1.15 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-black text-amber-600 tabular-nums mt-1"
                      >
                        +{liveCoinsEarned}
                      </motion.div>
                    </div>
                  </div>

                  {/* Verified Tracking Explanation */}
                  <div className="flex items-start gap-2.5 bg-[#E8F5EE] border border-[#C6E8D6] rounded-2xl p-3.5 mb-4 text-left">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                      Coins are awarded automatically (+{REFERRAL_REWARD_COINS} per friend) as soon as your friend opens your link or QR and finishes creating a brand-new Nexora account.
                    </p>
                  </div>

                  {/* Joined Friends List */}
                  <div className="bg-white border border-[#E9E4D4] rounded-2xl p-4 max-h-48 overflow-y-auto space-y-2.5">
                    {records.length > 0 ? (
                      records.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center justify-between gap-3 py-1.5 border-b border-[#F3EEE5] last:border-b-0"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#E8F5EE] text-emerald-700 flex items-center justify-center shrink-0">
                              <UserPlus className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-black text-[#4F3F34] truncate">
                                {rec.friendName}
                              </p>
                              <p className="text-[11px] font-medium text-[#7D6B58]">
                                Joined {new Date(rec.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-amber-600 tabular-nums shrink-0">
                            +{rec.coinsAwarded} Coins
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center space-y-1.5">
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FAF7F2] text-[#7D6B58]">
                          <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-[#4F3F34]">
                          Waiting for your friends to accept
                        </p>
                        <p className="text-[11px] font-medium text-[#7D6B58]">
                          Tap X anytime—tracking keeps running automatically in the background.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick re-share button */}
                  <div className="mt-4 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl bg-white border border-[#E9E4D4] hover:bg-[#F3EEE5] text-[#4F3F34] font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Link Copied!" : "Copy Invite Link"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        vibrate(10);
                        setStep("share");
                      }}
                      className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#69C496] hover:bg-[#58b586] text-white font-black text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ReferralFriendWelcomeScreenProps {
  referrerProfile: ReferrerPublicProfile | null;
  onStartNewAccount: () => void;
  onAlreadyHaveAccount: () => void;
}

export function ReferralFriendWelcomeScreen({
  referrerProfile,
  onStartNewAccount,
  onAlreadyHaveAccount,
}: ReferralFriendWelcomeScreenProps) {
  const inviterName = referrerProfile?.displayName || "A Nexora Friend";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full bg-[#FAF7F2] text-[#4F3F34] flex flex-col justify-between px-5 py-8 sm:px-10 sm:py-12 relative overflow-x-hidden"
    >
      {/* Subtle Ambient Background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[540px] h-[360px] rounded-full bg-[#69C496]/18 blur-3xl" />

      {/* Top Wordmark */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <span className="text-xl font-black tracking-tight text-[#4F3F34] whitespace-nowrap">
          Nexora
        </span>
        <button
          type="button"
          onClick={() => {
            vibrate(10);
            onAlreadyHaveAccount();
          }}
          className="min-h-[44px] px-3 text-xs sm:text-sm font-bold text-[#6F5C4E] hover:text-[#4F3F34] transition-colors whitespace-nowrap cursor-pointer"
        >
          Log in
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-5xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left / Mascot Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: transitionEase }}
          className="lg:col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <div className="relative flex items-center justify-center mb-5">
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Mascot
                className="w-36 h-36 sm:w-44 sm:h-44"
                mood="welcoming"
                hat={referrerProfile?.activeHat || "none"}
                theme={referrerProfile?.activeSkin || "standard"}
              />
            </motion.div>
          </div>

          <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-2">
            Invited by {inviterName}
          </p>

          <h1 className="text-3xl sm:text-5xl font-black text-[#4F3F34] tracking-tight leading-[1.1] text-balance">
            Welcome to Nexora!
          </h1>

          <p className="mt-4 text-base sm:text-lg font-semibold text-[#6F5C4E] leading-relaxed max-w-lg">
            Your friend{" "}
            <span className="font-black text-[#4F3F34]">{inviterName}</span> invited you to turn daily habits into a fun RPG adventure. Start your new account to begin your streak!
          </p>

          <div className="mt-7 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onStartNewAccount();
              }}
              className="min-h-[52px] px-8 py-4 rounded-2xl bg-[#69C496] hover:bg-[#58b586] text-white font-black text-base shadow-xl shadow-[#69C496]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>Start a New Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Right / Feature Preview Grid */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: transitionEase }}
          className="lg:col-span-6 grid grid-cols-1 gap-4"
        >
          <div className="bg-white border border-[#E9E4D4] rounded-3xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#4F3F34]">
                Daily Habit Challenges
              </h3>
              <p className="text-sm font-medium text-[#6F5C4E] mt-0.5 leading-snug">
                Complete quick hydration, pushups, focus, and mindfulness quests to build unstoppable daily streaks.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E9E4D4] rounded-3xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#4F3F34]">
                Grow Your Botanical Garden
              </h3>
              <p className="text-sm font-medium text-[#6F5C4E] mt-0.5 leading-snug">
                Every completed habit nurtures rare plants, unlocks new ecosystems, and drops mystery loot seeds.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E9E4D4] rounded-3xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200/70 text-sky-600 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#4F3F34]">
                Compete & Unlock Gear
              </h3>
              <p className="text-sm font-medium text-[#6F5C4E] mt-0.5 leading-snug">
                Earn coins and XP to customize your mascot, climb leaderboards, and celebrate wins with friends.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center text-xs font-semibold text-[#7D6B58] pt-4">
        Creating your new account takes less than a minute and sends {inviterName} +{REFERRAL_REWARD_COINS} Coins automatically.
      </footer>
    </motion.div>
  );
}
