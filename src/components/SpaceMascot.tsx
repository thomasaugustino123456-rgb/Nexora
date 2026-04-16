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
  x: number;
  y: number;
  size: number;
  onUpdatePos: (x: number, y: number) => void;
  onUpdateSize: (size: number) => void;
  showSizeCustomizer: boolean;
  setShowSizeCustomizer: (show: boolean) => void;
}

const VIBRATION_PATTERNS = {
  CLICK: 10,
  SUCCESS: [10, 30, 10],
  ERROR: [50, 100, 50],
};

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
  onPanicEnd,
  x,
  y,
  size,
  onUpdatePos,
  onUpdateSize,
  showSizeCustomizer,
  setShowSizeCustomizer
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [showMascot, setShowMascot] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const longPressRef = React.useRef<any>(null);

  // Stage 1: Onboarding
  useEffect(() => {
    if (isNewUser) {
      if (onboardingStep === 0) {
        setTimeout(() => {
          setShowMascot(true);
          setMessage("Welcome to your Nexora Space, bro! 🚀 I'm your guide and companion in this journey. This is your personal sanctuary where you can build your dream room, relax after a long day, and see your progress come to life in a fun way!");
        }, 1000);
      } else {
        setShowMascot(true);
      }
    } else {
      setShowMascot(true);
      setMessage(null);
    }
  }, [isNewUser, onboardingStep]);

  // Recognition logic
  useEffect(() => {
    if (lastPlacedItemName && !isNewUser) {
      setMessage(`Wow, bro! That ${lastPlacedItemName} looks absolutely legendary in this spot! 🔥 You've got some serious style. Every item you place makes this space feel more like home. Keep it up!`);
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastPlacedItemName, isNewUser]);

  // Placement Reaction logic
  useEffect(() => {
    if (placementReaction) {
      setMessage(placementReaction.text);
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [placementReaction]);

  // Light logic
  useEffect(() => {
    if (isNightMode) {
      setIsSleeping(true);
      if (!isNewUser) {
        setMessage("Yo bro, it's getting pretty dark out there... I'm starting to feel a bit sleepy. Goodnight! 😴🌙");
        const timer = setTimeout(() => setMessage(null), 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsSleeping(false);
      if (!isNewUser) {
        setMessage("Good morning, bro! ☀️ Let's make today epic!");
        const timer = setTimeout(() => setMessage(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isNightMode, isNewUser]);

  // Fire logic
  useEffect(() => {
    if (onFire) {
      setMessage("AAAH! BRO, HELP! IT'S BURNING! 🔥🔥🔥 GET ME OUT OF HERE FAST!");
      setCountdown(5);
      vibrate([100, 50, 100]);
    } else {
      if (countdown !== null) {
        setMessage("Phew! That was a close one, bro. Thanks for saving me! 🙌");
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
    if (isNewUser) {
      if (onboardingStep === 0) {
        setOnboardingStep(1);
        setMessage("Let's get started, bro! First, you'll need some cool items to fill this empty space. You can earn coins by completing your daily routines and challenges!");
      } else if (onboardingStep === 1) {
        setOnboardingStep(2);
        setMessage("What are you going to buy to fill your room? Check out the Shop to find some epic furniture and decorations! Once you buy them, they'll be in your Library.");
      } else if (onboardingStep === 2) {
        onCompleteOnboarding();
        setMessage("You're all set, bro! 🚀 Remember, you can drag me around, and if you hold me for 3 seconds, you can even change my size! Have fun building your space!");
        const timer = setTimeout(() => setMessage(null), 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setMessage(null);
    }
  };

  const startLongPress = () => {
    longPressRef.current = setTimeout(() => {
      vibrate([50, 50, 50]);
      setShowSizeCustomizer(true);
    }, 3000);
  };

  const endLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[160]">
      <AnimatePresence>
        {showMascot && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: x - 100, y: y - 100 }}
            animate={{ 
              x: x - 100, 
              y: y - 100, 
              scale: isDragging ? size * 1.1 : isSettling ? size * 0.95 : size, 
              opacity: 1,
              rotate: isDragging ? [0, -5, 5, 0] : 0
            }}
            transition={{
              type: "spring",
              stiffness: isDragging ? 400 : 250,
              damping: isDragging ? 30 : 25,
              rotate: { repeat: isDragging ? Infinity : 0, duration: 0.5 }
            }}
            exit={{ scale: 0, opacity: 0 }}
            className={`absolute w-56 h-56 pointer-events-auto transition-shadow ${
              isDragging ? 'cursor-grabbing z-[180]' : 'cursor-grab z-[160]'
            }`}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={() => {
              setIsDragging(true);
              setIsSettling(false);
              vibrate(5);
              startLongPress();
            }}
            onDragEnd={(e, info) => {
              setIsDragging(false);
              setIsSettling(true);
              endLongPress();
              onUpdatePos(x + info.offset.x, y + info.offset.y);
              vibrate(10);
              // Small delay for the "squish" effect to finish
              setTimeout(() => setIsSettling(false), 300);
            }}
            onPointerDown={isDragging ? undefined : startLongPress}
            onPointerUp={endLongPress}
            onPointerLeave={endLongPress}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -z-10 animate-pulse" />
              )}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-80 p-6 bg-white rounded-[2.5rem] shadow-2xl border-4 border-indigo-500 text-base font-bold text-indigo-900 z-[200] pointer-events-auto"
                  >
                    <div className="leading-relaxed">
                      {message}
                    </div>
                    {countdown !== null && (
                      <div className={`mt-3 text-3xl font-black text-center ${countdown <= 2 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
                        {countdown}s
                      </div>
                    )}
                    {isNewUser && (
                      <button
                        onClick={handleContinue}
                        className="mt-6 w-full py-4 bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                      >
                        {onboardingStep === 2 ? 'Let\'s Go, Bro! 🚀' : 'Got it, bro! 👍'}
                      </button>
                    )}
                    <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-r-2 border-b-2 border-indigo-500 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Mascot 
                mood={onFire ? 'boiling' : isSleeping ? 'neutral' : 'happy'} 
                className={`w-full h-full ${isSleeping ? 'opacity-80 grayscale-[0.5]' : ''}`}
                isSitting={!isDragging}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSizeCustomizer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border-2 border-indigo-100 flex items-center gap-4 pointer-events-auto z-[210]"
          >
            <button
              onClick={() => { vibrate(5); onUpdateSize(Math.max(0.3, size - 0.1)); }}
              className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center hover:bg-indigo-100 transition-colors"
            >
              <span className="text-2xl font-black">−</span>
            </button>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">Mascot Size</span>
              <span className="text-xl font-black text-indigo-900 leading-none">{Math.round(size * 100)}%</span>
            </div>
            <button
              onClick={() => { vibrate(5); onUpdateSize(Math.min(2.0, size + 0.1)); }}
              className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center hover:bg-indigo-100 transition-colors"
            >
              <span className="text-2xl font-black">+</span>
            </button>
            <button
              onClick={() => { vibrate(10); setShowSizeCustomizer(false); }}
              className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors ml-2"
            >
              <span className="font-black text-xs uppercase tracking-widest">OK</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
