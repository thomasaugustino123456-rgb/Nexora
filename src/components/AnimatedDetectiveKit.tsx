import React from 'react';

export function AnimatedDetectiveKit({
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
          @keyframes floatItemDet {
            0% { 
              transform: translateY(0px); 
              filter: drop-shadow(0 8px 6px rgba(0, 0, 0, 0.15)); 
            }
            100% { 
              transform: translateY(-8px); 
              filter: drop-shadow(0 15px 10px rgba(0, 0, 0, 0.08)); 
            }
          }

          @keyframes investigateCluesDet {
            0% { transform: translateY(0px) rotate(-5deg); }
            100% { transform: translateY(-8px) rotate(5deg); }
          }

          .animate-float-det {
            animation: floatItemDet 3s ease-in-out infinite alternate;
          }

          .animate-magnifying-glass {
            transform-origin: 230px 150px;
            animation: investigateCluesDet 2s ease-in-out infinite alternate;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-float-det' : ''}`}
      >
        <defs>
          {/* Fedora Hat Gradients */}
          <linearGradient id="hatGradDet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5a2b"/>
            <stop offset="100%" stopColor="#5c4033"/>
          </linearGradient>

          <linearGradient id="bandGradDet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a2a2a"/>
            <stop offset="100%" stopColor="#111111"/>
          </linearGradient>

          {/* Trench Coat Gradients */}
          <linearGradient id="coatGradDet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c2b280"/>
            <stop offset="50%" stopColor="#d2c290"/>
            <stop offset="100%" stopColor="#a89a67"/>
          </linearGradient>

          {/* Magnifying Glass Gradients */}
          <linearGradient id="glassGradDet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)"/>
            <stop offset="50%" stopColor="rgba(135, 206, 235, 0.2)"/>
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)"/>
          </linearGradient>

          <linearGradient id="metalRimDet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eceff1"/>
            <stop offset="100%" stopColor="#78909c"/>
          </linearGradient>

          {/* Drop Shadows for 3D depth */}
          <filter id="clothingShadowDet" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* 1. TRENCH COAT COLLAR (BASE) */}
        <g filter="url(#clothingShadowDet)">
          {/* Left Lapel */}
          <path d="M 30 240 L 100 280 L 140 280 L 90 200 Z" fill="url(#coatGradDet)"/>
          {/* Right Lapel */}
          <path d="M 270 240 L 200 280 L 160 280 L 210 200 Z" fill="url(#coatGradDet)"/>
          {/* Coat Back Collar */}
          <path d="M 90 200 C 150 230, 210 200, 210 200 L 160 280 L 140 280 Z" fill="#a89a67"/>
          
          {/* Collar Buttons / Detail Lines */}
          <path d="M 80 235 L 110 265" stroke="#8b7754" strokeWidth="3" strokeLinecap="round"/>
          <path d="M 220 235 L 190 265" stroke="#8b7754" strokeWidth="3" strokeLinecap="round"/>
        </g>

        {/* 2. CLASSIC FEDORA HAT (TOP) */}
        <g filter="url(#clothingShadowDet)">
          {/* Back of the hat brim */}
          <ellipse cx="150" cy="55" rx="75" ry="20" fill="#4a3328"/>
          
          {/* Crown of the hat */}
          <path d="M 100 60 C 100 10, 130 25, 150 25 C 170 25, 200 10, 200 60 Z" fill="url(#hatGradDet)"/>
          
          {/* Dark Ribbon Band */}
          <path d="M 100 60 C 100 70, 200 70, 200 60 L 200 50 C 200 60, 100 60, 100 50 Z" fill="url(#bandGradDet)"/>
          
          {/* Front curving brim */}
          <path d="M 70 60 C 100 85, 200 85, 230 60 C 250 70, 220 95, 150 95 C 80 95, 50 70, 70 60 Z" fill="url(#hatGradDet)"/>
        </g>

        {/* 3. HOVERING MAGNIFYING GLASS */}
        <g className={animate ? "animate-magnifying-glass" : ""} filter="url(#clothingShadowDet)">
          {/* Wooden Handle */}
          <rect x="235" y="160" width="14" height="60" rx="7" fill="#5d4037" transform="rotate(-35 242 190)"/>
          
          {/* Silver Rim */}
          <circle cx="215" cy="140" r="32" fill="none" stroke="url(#metalRimDet)" strokeWidth="6"/>
          
          {/* Glass Lens */}
          <circle cx="215" cy="140" r="29" fill="url(#glassGradDet)"/>
          
          {/* Light Reflection on the glass */}
          <path d="M 198 123 Q 215 115 230 130" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        </g>
      </svg>
    </div>
  );
}
