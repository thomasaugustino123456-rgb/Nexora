import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mascot } from './Mascot';
import { vibrate } from '../lib/vibrate';

interface SpaceMascotProps {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  isNewUser: boolean;
  onCompleteOnboarding: () => void;
  placedItemsCount: number;
  lastPlacedItemName?: string;
  isNightMode: boolean;
  onFire?: boolean;
  placementReaction?: { text: string, type: 'good' | 'bad' | 'neutral' } | null;
  onPanicEnd?: (penalty: boolean) => void;
}

export const SpaceMascot: React.FC<SpaceMascotProps> = ({
  onboardingStep,
  setOnboardingStep,
  isNewUser,
  onCompleteOnboarding,
  placedItemsCount,
  lastPlacedItemName,
  isNightMode,
  onFire,
  placementReaction,
  onPanicEnd
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [showMascot, setShowMascot] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);

  // Stage 1: Onboarding
  useEffect(() => {
    if (isNewUser && onboardingStep === 0) {
      setTimeout(() => {
        setShowMascot(true);
        setMessage("Welcome to your Nexora Space, bro! 🚀 I'm your guide and companion in this journey. This is your personal sanctuary where you can build your dream room, relax after a long day, and see your progress come to life in a fun way!");
      }, 1000);
    } else if (!isNewUser) {
      setShowMascot(true);
    }
  }, [isNewUser, onboardingStep]);

  // Recognition logic
  useEffect(() => {
    if (lastPlacedItemName && onboardingStep >= 2) {
      setMessage(`Wow, bro! That ${lastPlacedItemName} looks absolutely legendary in this spot! 🔥 You've got some serious style. Every item you place makes this space feel more like home. Keep it up!`);
    }
  }, [lastPlacedItemName, onboardingStep]);

  // Placement Reaction logic
  useEffect(() => {
    if (placementReaction) {
      setMessage(placementReaction.text);
    }
  }, [placementReaction]);

  // Light logic
  useEffect(() => {
    if (isNightMode) {
      setIsSleeping(true);
      setMessage("Yo bro, it's getting pretty dark out there... I'm starting to feel a bit sleepy. It's important to rest well so we can crush our goals tomorrow! Goodnight, friend! 😴🌙");
    } else {
      setIsSleeping(false);
      setMessage("Good morning, bro! ☀️ I feel so refreshed and energized! The sunlight is perfect for some decorating. What should we add to the room today? Let's make it epic!");
    }
  }, [isNightMode]);

  // Fire logic
  useEffect(() => {
    if (onFire) {
      setMessage("AAAH! BRO, HELP! IT'S BURNING! 🔥🔥🔥 GET ME OUT OF HERE FAST! I'M NOT A ROASTED MARSHMALLOW! MOVE ME AWAY FROM THE FIRE QUICKLY!");
      setCountdown(5);
      vibrate([100, 50, 100]);
    } else {
      if (countdown !== null) {
        setMessage("Phew! That was a close one, bro. Thanks for saving me! 🙌 My glass was almost starting to melt. You're a real one for looking out for me like that!");
        setCountdown(null);
        if (onPanicEnd) onPanicEnd(false);
      }
    }
  }, [onFire]);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => (prev !== null ? prev - 1 : null));
        vibrate(20);
      }, 1000);
    } else if (countdown === 0) {
      if (onPanicEnd) onPanicEnd(true);
      setCountdown(null);
      setMessage("Ouch! That really hurt... My points! 😭");
      const timer2 = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer2);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleContinue = () => {
    vibrate(10);
    if (isNewUser) {
      if (onboardingStep === 0) {
        setOnboardingStep(1);
        setMessage("Let's get started, bro! First, you'll need some cool items to fill this empty space. You can earn coins by completing your daily routines and challenges!");
      } else if (onboardingStep === 1) {
        setOnboardingStep(2);
        setMessage("What are you going to buy to fill your room? Check out the Shop to find some epic furniture and decorations! Once you buy them, they'll be in your Library.");
      } else if (onboardingStep === 2) {
        onCompleteOnboarding();
        setMessage("You're all set, bro! 🚀 Remember, you can drag me around, and if you hold me for a bit, you can even change my size! Have fun building your space!");
      } else {
        setMessage(null);
      }
    } else {
      setMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[160]">
      <AnimatePresence>
        {showMascot && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute bottom-20 right-4 w-56 h-56 pointer-events-auto"
          >
            <div className="relative">
              {message && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="absolute bottom-full right-0 mb-6 w-80 p-6 bg-white rounded-[2.5rem] shadow-2xl border-4 border-indigo-500 text-base font-bold text-indigo-900 z-[200]"
                >
                  <div className="leading-relaxed">
                    {message}
                  </div>
                  {countdown !== null && (
                    <div className={`mt-3 text-3xl font-black text-center ${countdown <= 2 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                      {countdown}s
                    </div>
                  )}
                  <button
                    onClick={handleContinue}
                    className="mt-6 w-full py-4 bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    {isNewUser && onboardingStep === 2 ? 'Let\'s Go, Bro! 🚀' : 'Got it, bro! 👍'}
                  </button>
                  <div className="absolute bottom-[-10px] right-8 w-5 h-5 bg-white border-r-2 border-b-2 border-indigo-500 rotate-45" />
                </motion.div>
              )}
              <Mascot 
                mood={onFire ? 'boiling' : isSleeping ? 'neutral' : 'happy'} 
                className={`w-full h-full ${isSleeping ? 'opacity-80 grayscale-[0.5]' : ''}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
