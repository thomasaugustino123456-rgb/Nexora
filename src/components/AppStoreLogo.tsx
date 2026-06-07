import React from 'react';

const nexoraAppIcon = "/nexora_app_icon.png?v=1.5.2";

interface AppStoreLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AppStoreLogo({ size = 'md', className = '' }: AppStoreLogoProps) {
  // Built-in responsive size presets
  const sizeMap = {
    xs: 'w-10 h-10',
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const finalClass = className || sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${finalClass}`} style={{ willChange: 'transform' }}>
      {/* Sleek App Store Shadow Depth */}
      <div className="absolute inset-0 bg-slate-950 rounded-[22%] shadow-[0_12px_28px_-6px_rgba(0,0,0,0.85)] border border-slate-800/40" />
      
      {/* Premium Multi-gradient Glow backing */}
      <div className="absolute inset-[1px] bg-[#0c1020] rounded-[21.5%] overflow-hidden flex items-center justify-center">
        {/* Dual brand spectrum circles inside background to mimic Play Store luxury */}
        <div className="absolute -top-4 -right-4 w-3/4 h-3/4 bg-cyan-400/12 blur-[16px] rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-3/4 h-3/4 bg-[#69C496]/12 blur-[16px] rounded-full" />
        
        {/* Core Mascot Icon Image */}
        <img
          src={nexoraAppIcon}
          alt="Nexora App Store Badge"
          className="w-[96%] h-[96%] object-cover rounded-[20%] select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        
        {/* 3D Glass Gloss Sheen overlay - creates authentic Play / Apple store light refraction */}
        <div 
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/28 via-white/5 to-transparent opacity-80"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 85%)'
          }}
        />
        
        {/* Fine inner highlight border for sharp 3D visual density */}
        <div className="absolute inset-0 border border-white/10 rounded-[20.5%] pointer-events-none" />
      </div>
    </div>
  );
}
