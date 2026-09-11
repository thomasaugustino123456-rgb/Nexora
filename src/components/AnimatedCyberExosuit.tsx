import React from 'react';

export function AnimatedCyberExosuit({
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
          @keyframes corePulse {
            0%, 100% { 
              transform: scale(1);
              filter: drop-shadow(0 0 8px #38bdf8);
            }
            50% { 
              transform: scale(1.08);
              filter: drop-shadow(0 0 16px #00f0ff);
            }
          }
          @keyframes floatSuit {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-6px); }
          }
          .animate-core-pulse {
            transform-origin: 150px 165px;
            animation: corePulse 2s ease-in-out infinite;
          }
          .animate-float-suit {
            animation: floatSuit 3s ease-in-out infinite alternate;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-float-suit' : ''}`}
      >
        <defs>
          <linearGradient id="shopArmorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="shopArmorPlate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <radialGradient id="shopPlasmaCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="80%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <filter id="shopArmorShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Cyber Chestplate & Pauldrons */}
        <g filter="url(#shopArmorShadow)">
          {/* Main Contoured Chest Torso */}
          <path
            d="M 85 85 Q 150 105 215 85 C 245 125, 235 200, 205 235 C 175 255, 125 255, 95 235 C 65 200, 55 125, 85 85 Z"
            fill="url(#shopArmorGrad)"
            stroke="#0284c7"
            strokeWidth="3.5"
          />

          {/* Pauldrons / Shoulder Guards with Sleeve Openings */}
          <path d="M 60 90 L 85 85 L 80 135 L 55 125 Z" fill="url(#shopArmorPlate)" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 240 90 L 215 85 L 220 135 L 245 125 Z" fill="url(#shopArmorPlate)" stroke="#38bdf8" strokeWidth="2" />

          {/* Segmented Armor Plating */}
          <path d="M 95 105 L 135 115 L 130 150 L 90 140 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M 205 105 L 165 115 L 170 150 L 210 140 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M 98 185 L 135 185 L 130 220 L 105 210 Z" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M 202 185 L 165 185 L 170 220 L 195 210 Z" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />

          {/* Neon Blue Power Lines */}
          <path d="M 150 95 L 150 135" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <path d="M 115 150 L 135 160 M 185 150 L 165 160" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
          <path d="M 150 195 L 150 240" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

          {/* Central Plasma Power Core / Arc-Reactor */}
          <circle cx="150" cy="165" r="26" fill="#0f172a" stroke="#0284c7" strokeWidth="3" />
          <g className={animate ? 'animate-core-pulse' : ''}>
            <circle cx="150" cy="165" r="20" fill="url(#shopPlasmaCore)" />
            <circle cx="150" cy="165" r="14" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x="150" y="172" fontSize="16" fontFamily="system-ui, sans-serif" fontWeight="900" fill="#ffffff" textAnchor="middle">N</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
