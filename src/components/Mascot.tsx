import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useSound } from '../hooks/useSound';

export type MascotMood = 'happy' | 'angry' | 'boiling' | 'neutral' | 'surprised';

interface MascotProps {
  className?: string;
  mood?: MascotMood;
  hat?: string;
  theme?: string;
  soundPack?: 'cat' | 'dog';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: () => void;
  isSitting?: boolean;
  performanceMode?: boolean;
}

const nexoraMascotImage = "/src/assets/images/nexora_mascot_logo_1781981236517.jpg";

export const Mascot = React.memo(({ 
  className, 
  mood = 'happy', 
  hat = 'none', 
  theme = 'standard',
  soundPack = 'cat', 
  onClick,
  onPointerMove,
  onPointerLeave,
  isSitting = false,
  performanceMode = false
}: MascotProps) => {
  const [clickCount, setClickCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();
  const controls = useAnimation();

  const handleMascotClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setClickCount(prev => {
      const newCount = prev + 1;
      const isDog = soundPack === 'dog';
      // Play high-quality sound responses
      if (newCount <= 5) play(isDog ? 'dogHappy' : 'catHappy');
      else if (newCount <= 12) play(isDog ? 'dogHungry' : 'catHungry');
      return newCount;
    });

    // Premium micro-scale feedback animation on click
    controls.start({
      scale: [1, 0.94, 1.05, 0.98, 1],
      rotate: [0, -2, 2, -1, 0],
      transition: { duration: 0.4, ease: "easeInOut" }
    });
    
    if (onClick) onClick(e);
  }, [soundPack, play, controls, onClick]);

  return (
    <motion.div 
      ref={containerRef}
      className={`mascot-bottle-container select-none relative flex items-center justify-center ${className || ''}`}
      onClick={handleMascotClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      animate={controls}
      style={{ 
        aspectRatio: '1/1',
        willChange: 'transform'
      }}
    >
      <style>{`
        @keyframes floatIdlePremium {
          0%, 100% { transform: translateY(-8px); }
          50% { transform: translateY(8px); }
        }
        .anim-mascot-float-premium {
          animation: floatIdlePremium 3s ease-in-out infinite;
        }
      `}</style>

      {/* Premium Rounded-Square Container with Soft Blue Glow & Subtle Shadow */}
      <div className="relative w-full h-full p-1 anim-mascot-float-premium">
        <div 
          className="w-full h-full rounded-[42px] overflow-hidden bg-[#081225] border-4 border-blue-500/30 shadow-[0_15px_45px_rgba(10,23,51,0.6),0_0_35px_rgba(59,130,246,0.35)] relative flex items-center justify-center transition-all duration-300"
          style={{
            background: "#081225"
          }}
        >
          {/* Soft inner glow highlight */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/[0.05] to-transparent pointer-events-none z-10" />

          {/* Official Mascot Artwork */}
          <img 
            src={nexoraMascotImage} 
            alt="Nexora Mascot Official Character" 
            className="w-full h-full object-cover shrink-0 select-none pointer-events-none"
            style={{
              imageRendering: "crisp-edges"
            }}
          />

          {/* Star lights sparkles overlay (keeps UI sparkling) */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 pointer-events-none z-20 opacity-70">
            <span className="text-yellow-400 text-xs animate-ping">✨</span>
            <span className="text-blue-400 text-xs animate-pulse delay-700">✦</span>
          </div>

          {/* Viking, crown, wizard, etc overlay mapping, scaled to sit nicely over the image */}
          {hat !== 'none' && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <svg 
                viewBox="0 0 500 600" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-full h-full"
              >
                <g id="mascot-active-accessory" transform="translate(0, 30)">
                  {hat === 'crown' && (
                    <path d="M 180,100 L 180,40 L 215,70 L 250,40 L 285,70 L 320,40 L 320,100 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="4" />
                  )}
                  {hat === 'cool' && (
                     <g transform="translate(140, 245)">
                       <rect x="0" y="0" width="80" height="25" rx="4" fill="#000" />
                       <rect x="140" y="0" width="80" height="25" rx="4" fill="#000" />
                       <rect x="80" y="10" width="60" height="5" fill="#000" />
                     </g>
                  )}
                  {hat === 'wizard' && (
                    <g transform="translate(160, 20)">
                       <polygon points="90,120 45,10 0,120" fill="#7C3AED" stroke="#5B21B6" strokeWidth="4" />
                       <path d="M 45,30 L 48,38 L 56,38 L 50,43 L 52,51 L 45,46 L 38,51 L 40,43 L 34,38 L 42,38 Z" fill="#FBBF24" />
                       <path d="M 27,75 L 29,79 L 34,79 L 30,82 L 31,87 L 27,84 L 23,87 L 24,82 L 20,79 L 25,79 Z" fill="#FBBF24" />
                       <path d="M 63,70 L 65,74 L 70,74 L 66,77 L 67,82 L 63,79 L 59,82 L 60,77 L 56,74 L 61,74 Z" fill="#FBBF24" />
                       <ellipse cx="45" cy="115" rx="60" ry="10" fill="#6D28D9" stroke="#4C1D95" strokeWidth="3" />
                    </g>
                  )}
                  {hat === 'artist' && (
                    <g transform="translate(160, 75)">
                       <ellipse cx="90" cy="30" rx="48" ry="16" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
                       <ellipse cx="90" cy="22" rx="40" ry="12" fill="#EF4444" />
                       <path d="M 90,14 L 90,2" stroke="#991B1B" strokeWidth="3.5" strokeLinecap="round" />
                    </g>
                  )}
                  {hat === 'viking' && (
                    <g transform="translate(160, 65)">
                       <path d="M 40,40 Q 12,15 22,0 Q 28,15 45,30 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2.5" />
                       <path d="M 140,40 Q 168,15 158,0 Q 152,15 135,30 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2.5" />
                       <path d="M 40,55 A 50,50 0 0,1 140,55 Z" fill="#64748B" stroke="#475569" strokeWidth="4" />
                       <rect x="85" y="5" width="10" height="50" fill="#475569" />
                       <rect x="40" y="50" width="100" height="8" fill="#475569" rx="3" />
                    </g>
                  )}
                  {hat === 'space' && (
                    <g transform="translate(160, 105)">
                       <circle cx="90" cy="110" r="105" fill="rgba(186, 230, 253, 0.15)" stroke="#0ea5e9" strokeWidth="3.5" strokeDasharray="4 4" />
                       <line x1="90" y1="5" x2="90" y2="-18" stroke="#0ea5e9" strokeWidth="3.5" />
                       <circle cx="90" cy="-20" r="6" fill="#f43f5e" />
                    </g>
                  )}
                  {hat === 'ninja' && (
                    <g transform="translate(160, 215)">
                       <rect x="35" y="10" width="112" height="26" rx="5" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
                       <path d="M 35,22 Q 15,10 10,24" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                       <path d="M 35,22 Q 13,32 12,38" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                       <ellipse cx="91" cy="23" rx="32" ry="5.5" fill="#f8fafc" />
                    </g>
                  )}
                  {hat === 'detective' && (
                    <g transform="translate(160, 75)">
                       <path d="M 40,55 A 50,50 0 0,1 140,55 Z" fill="#854D0E" stroke="#713F12" strokeWidth="3" />
                       <rect x="84" y="5" width="12" height="15" rx="3" fill="#A16207" />
                       <circle cx="90" cy="3" r="3.5" fill="#713F12" />
                       <path d="M 40,55 Q 5,55 35,45 Z" fill="#713F12" />
                       <path d="M 140,55 Q 175,55 145,45 Z" fill="#713F12" />
                    </g>
                  )}
                </g>
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

Mascot.displayName = 'Mascot';
