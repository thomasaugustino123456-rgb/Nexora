import React from 'react';
import { vibrate } from '../lib/vibrate';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  const handleClick = () => {
    vibrate(15);
    onClick();
  };

  return (
    <button 
      id={`nav-button-${label.toLowerCase()}`}
      onClick={handleClick}
      className={`flex flex-col items-center gap-0.5 sm:gap-1 transition-all flex-shrink-0 ${active ? 'scale-105 sm:scale-110' : 'text-blue-900/30 hover:text-blue-900/50'}`}
      style={active ? { color: 'var(--accent-color)' } : {}}
    >
      <div className="scale-90 sm:scale-100">
        {icon}
      </div>
      <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
