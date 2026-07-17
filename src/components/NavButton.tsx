import React from 'react';
import { motion } from 'motion/react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { useSound } from '../hooks/useSound';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  glow?: boolean;
}

export function NavButton({ active, onClick, icon, label, glow }: NavButtonProps) {
  const { play } = useSound();

  const handleClick = () => {
    vibrate(VIBRATION_PATTERNS.CLICK || 15);
    play('nav_switch');
    onClick();
  };

  return (
    <button 
      id={`nav-button-${label.toLowerCase()}`}
      onClick={handleClick}
      className={`flex flex-col items-center justify-center gap-0.5 transition-all flex-shrink-0 cursor-pointer px-1.5 py-1 min-w-[42px] sm:min-w-[60px] relative rounded-xl outline-none select-none`}
    >
      {/* Golden Glowing Pulsing background behind icon if glow is active */}
      {glow && !active && (
        <motion.div 
          className="absolute inset-[1px] bg-yellow-400/10 rounded-[14px] border border-yellow-400/30"
          animate={{
            boxShadow: [
              "0 0 2px rgba(250,204,21,0.15)",
              "0 0 12px rgba(250,204,21,0.5)",
              "0 0 2px rgba(250,204,21,0.15)"
            ],
            borderColor: [
              "rgba(250,204,21,0.25)",
              "rgba(250,204,21,0.6)",
              "rgba(250,204,21,0.25)"
            ]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Premium background indicator under active button */}
      {active && (
        <motion.div 
          layoutId="bottom-nav-active-pill"
          className="absolute inset-[1px] bg-[#69C496]/10 rounded-[14px] border border-[#69C496]/15"
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        />
      )}

      {/* Icon Area */}
      <div className={`relative z-10 transition-transform duration-300 ${
        active 
          ? 'text-[#69C496] scale-105' 
          : glow
            ? 'text-yellow-500 scale-105 animate-pulse'
            : 'text-[#7D6B58]/60 hover:text-[#4F3F34] scale-95'
      }`}>
        {icon}
        {/* Sparkle badge for golden glow */}
        {glow && !active && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
        )}
      </div>

      {/* Label Text */}
      <span className={`relative z-10 text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider transition-colors duration-300 ${
        active 
          ? 'text-[#69C496]' 
          : glow
            ? 'text-yellow-600 font-extrabold'
            : 'text-[#7D6B58]/60'
      }`}>
        {label}
      </span>

      {/* Extra-subtle indicator spot below */}
      {active && (
        <motion.span 
          layoutId="bottom-nav-indicator-dot"
          className="absolute bottom-0 w-1 h-1 rounded-full bg-[#69C496]"
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        />
      )}
    </button>
  );
}
