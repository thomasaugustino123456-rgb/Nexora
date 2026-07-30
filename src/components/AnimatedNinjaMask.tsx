import React from 'react';

export function AnimatedNinjaMask({
  className = "w-20 h-20",
  animate = true
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {animate && (
        <style>{`
          @keyframes floatItemNinja {
            0% { 
              transform: translateY(0px); 
              filter: drop-shadow(0 8px 6px rgba(0, 0, 0, 0.15)); 
            }
            100% { 
              transform: translateY(-8px); 
              filter: drop-shadow(0 15px 10px rgba(0, 0, 0, 0.08)); 
            }
          }

          @keyframes ribbonWaveNinja {
            0% { transform: rotate(-5deg); }
            100% { transform: rotate(15deg); }
          }

          .animate-float-ninja {
            animation: floatItemNinja 3s ease-in-out infinite alternate;
          }

          .animate-ribbon-wave {
            transform-origin: 250px 120px;
            animation: ribbonWaveNinja 1.5s ease-in-out infinite alternate;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-float-ninja' : ''}`}
      >
        <defs>
          {/* Stealth Fabric Gradient */}
          <linearGradient id="ninjaFabricGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c2f33"/>
            <stop offset="100%" stopColor="#141518"/>
          </linearGradient>
          
          {/* Shinobi Metal Plate Gradient */}
          <linearGradient id="ninjaMetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db"/>
            <stop offset="50%" stopColor="#9ca3af"/>
            <stop offset="100%" stopColor="#4b5563"/>
          </linearGradient>

          <filter id="ninjaMaskShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Waving Ribbons on the right side */}
        <g className={animate ? "animate-ribbon-wave" : ""} filter="url(#ninjaMaskShadow)">
          <path d="M 250 120 Q 300 100 310 150 Q 280 130 250 130 Z" fill="url(#ninjaFabricGrad)"/>
          <path d="M 250 125 Q 310 140 290 190 Q 270 160 250 135 Z" fill="url(#ninjaFabricGrad)"/>
        </g>

        {/* The Main Mask Group */}
        <g filter="url(#ninjaMaskShadow)">
          
          {/* Top Headband Piece */}
          <path d="M 30 110 C 100 80, 200 80, 270 110 C 260 130, 180 120, 150 120 C 120 120, 40 130, 30 110 Z" fill="url(#ninjaFabricGrad)"/>
          
          {/* Silver Metal Forehead Plate */}
          <rect x="110" y="90" width="80" height="25" rx="5" fill="url(#ninjaMetalGrad)" stroke="#1f2937" strokeWidth="2"/>
          {/* Plate Rivets */}
          <circle cx="118" cy="102" r="2" fill="#1f2937"/>
          <circle cx="182" cy="102" r="2" fill="#1f2937"/>
          {/* Engraved symbol on the plate */}
          <path d="M 150 95 L 153 100 L 158 102 L 153 104 L 150 109 L 147 104 L 142 102 L 147 100 Z" fill="#374151"/>

          {/* Bottom Face Mask Piece */}
          <path d="M 25 155 C 80 135, 220 135, 275 155 C 290 220, 220 280, 150 285 C 80 280, 10 220, 25 155 Z" fill="url(#ninjaFabricGrad)"/>
          
          {/* Fabric folds */}
          <path d="M 60 170 Q 150 190 240 170" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
          <path d="M 90 210 Q 150 225 210 210" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
          
          {/* Side Knot */}
          <circle cx="255" cy="125" r="10" fill="url(#ninjaFabricGrad)"/>

        </g>
      </svg>
    </div>
  );
}
