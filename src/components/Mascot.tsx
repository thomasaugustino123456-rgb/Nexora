import React from 'react';
import { motion } from 'motion/react';
import { useSound } from '../hooks/useSound';

export type MascotMood = 'happy' | 'angry' | 'boiling' | 'neutral' | 'surprised';

export interface MascotProps {
  className?: string;
  mood?: MascotMood;
  hat?: string;
  theme?: string;
  effect?: string; 
  soundPack?: 'cat' | 'dog';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: () => void;
  isSitting?: boolean;
  performanceMode?: boolean;
}

const nexoraAppIcon = "/nexora-mascot.png";

export const Mascot = React.memo(({ 
  className, 
  onClick,
  onPointerMove,
  onPointerLeave,
}: MascotProps) => {

  const handleMascotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <motion.div
      className={`relative select-none ${className || ''}`}
      onClick={handleMascotClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      whileTap={{ scale: 0.95 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <img 
        src={nexoraAppIcon} 
        alt="Nexora Mascot"
        className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(59,130,246,0.2)]"
        style={{
          imageRendering: "auto",
          WebkitFontSmoothing: "antialiased"
        }}
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </motion.div>
  );
});
