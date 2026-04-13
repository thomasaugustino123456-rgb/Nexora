import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
        setMessage("Welcome to your Nexora Space! 🚀 I'm your guide. This is where you can build your dream room and relax.");
      }, 1000);
    } else if (!isNewUser) {
      setShowMascot(true);
    }
  }, [isNewUser, onboardingStep]);

  // Recognition logic
  useEffect(() => {
    if (lastPlacedItemName && onboardingStep >= 2) {
      setMessage(`Wow! A ${lastPlacedItemName}? That looks absolutely amazing in this spot! 🔥`);
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastPlacedItemName, onboardingStep]);

  // Light logic
  useEffect(() => {
    if (isNightMode) {
      setIsSleeping(true);
      setMessage("It's getting dark... I'm feeling a bit sleepy. Goodnight, friend! 😴");
    } else {
      setIsSleeping(false);
      setMessage("Good morning! I feel so refreshed and ready to decorate! ☀️");
    }
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [isNightMode]);

  // Fire logic
  useEffect(() => {
    if (onFire) {
      setMessage("HELP! IT'S BURNING! GET ME OUT OF HERE FAST! 🔥🔥🔥");
      setCountdown(5);
      vibrate([100, 50, 100]);
    } else {
      if (countdown !== null) {
        setMessage("Phew! That was a close one. Thanks for saving me, bro! 🙌");
        setCountdown(null);
        if (onPanicEnd) onPanicEnd(false);
        const timer = setTimeout(() => setMessage(null), 3000);
        return () => clearTimeout(timer);
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
    if (onboardingStep === 0) {
      setOnboardingStep(1);
      setMessage("Let's get started! First, you'll need some items to fill this empty space.");
    } else if (onboardingStep === 1) {
      setOnboardingStep(2);
      setMessage("What are you going to buy to fill your room? Check out the Shop to find some cool stuff!");
    } else if (onboardingStep === 2) {
      onCompleteOnboarding();
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
            className="absolute bottom-20 right-4 w-48 h-48 pointer-events-auto"
          >
            <div className="relative">
              {message && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-white rounded-2xl shadow-2xl border-2 border-indigo-500 text-sm font-bold text-indigo-900"
                >
                  {message}
                  {countdown !== null && (
                    <div className={`mt-2 text-2xl font-black text-center ${countdown <= 2 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                      {countdown}s
                    </div>
                  )}
                  {isNewUser && onboardingStep < 3 && (
                    <button
                      onClick={handleContinue}
                      className="mt-3 w-full py-2 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                    >
                      {onboardingStep === 2 ? 'Finished' : 'Continue'}
                    </button>
                  )}
                  <div className="absolute bottom-[-10px] right-8 w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-500 rotate-45" />
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
