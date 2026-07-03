import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
}

export function SplashScreen({ isReady = false, onFinish }: SplashScreenProps) {
  const [exitSplash, setExitSplash] = useState(false);

  // Instantly trigger fade-out and unmount once the real app is hydrated and ready
  useEffect(() => {
    if (isReady) {
      setExitSplash(true);
      const timer = setTimeout(() => {
        if (onFinish) {
          onFinish();
        }
      }, 200); // Ultra-snappy 200ms fade transition
      return () => clearTimeout(timer);
    }
  }, [isReady, onFinish]);

  // Fallback for automatic transition when no external controller is present
  useEffect(() => {
    if (!onFinish) {
      const timer = setTimeout(() => {
        setExitSplash(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [onFinish]);

  return (
    <div 
      id="splashScreen"
      className={`fixed inset-0 w-screen h-screen flex flex-col items-center justify-center z-[99999] bg-slate-950 text-white select-none transition-opacity duration-200 will-change-opacity ${
        exitSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Sleek Pulsing App Icon */}
        <div className="relative">
          <img 
            src="/nexora_mascot_new.png" 
            alt="Nexora Mascot" 
            className="w-24 h-24 rounded-3xl object-contain animate-pulse"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/nexora-mascot.png";
            }}
          />
        </div>

        {/* Minimalist Brand Logo */}
        <div className="text-3xl font-black tracking-widest text-white uppercase font-sans">
          nexora
        </div>

        {/* Elegant Infinite Loading Bar */}
        <div className="w-24 h-1 bg-slate-800/80 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-full bg-blue-500 rounded-full animate-progress" />
        </div>
      </div>

      <style>{`
        @keyframes progressAnimation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progressAnimation 1s infinite linear;
          transform-origin: left;
        }
        .will-change-opacity {
          will-change: opacity;
        }
      `}</style>
    </div>
  );
}
