import React from 'react';
import { motion } from 'motion/react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { useSound } from '../hooks/useSound';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export function NavButton({ active, onClick, icon, label }: NavButtonProps) {
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
      className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all flex-shrink-0 cursor-pointer p-1.5 min-w-[50px] relative rounded-xl outline-none select-none`}
    >
      {/* Premium background indicator under active button */}
      {active && (
        <motion.div 
          layoutId="bottom-nav-active-pill"
          className="absolute inset-0 bg-[#69C496]/10 rounded-2xl border border-[#69C496]/20"
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        />
      )}

      {/* Icon Area */}
      <div className={`relative z-10 transition-transform duration-300 ${
        active 
          ? 'text-[#69C496] scale-105' 
          : 'text-[#7D6B58]/60 hover:text-[#4F3F34]'
      }`}>
        {icon}
      </div>

      {/* Label Text */}
      <span className={`relative z-10 text-[8.5px] font-black uppercase tracking-[0.08em] transition-colors duration-300 ${
        active 
          ? 'text-[#69C496]' 
          : 'text-[#7D6B58]/60'
      }`}>
        {label}
      </span>

      {/* Extra-subtle indicator spot below */}
      {active && (
        <motion.span 
          layoutId="bottom-nav-indicator-dot"
          className="absolute bottom-1 w-1 h-1 rounded-full bg-[#69C496]"
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        />
      )}
    </button>
  );
}
