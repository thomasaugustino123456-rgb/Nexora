import React from 'react';

export function AnimatedHeroCape({
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
          @keyframes billowCape {
            0% { transform: rotate(-3deg) scaleY(1); }
            50% { transform: rotate(2deg) scaleY(1.03); }
            100% { transform: rotate(-3deg) scaleY(1); }
          }
          @keyframes heroGlow {
            0%, 100% { filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.4)); }
            50% { filter: drop-shadow(0 8px 16px rgba(239, 68, 68, 0.6)); }
          }
          .animate-cape-billow {
            transform-origin: 150px 40px;
            animation: billowCape 3s ease-in-out infinite, heroGlow 3s ease-in-out infinite;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-cape-billow' : ''}`}
      >
        <defs>
          <linearGradient id="shopCapeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="85%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
          <linearGradient id="shopGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <filter id="shopCapeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Flowing Cape Drape */}
        <path
          d="M 100 45 C 50 110, 20 185, 28 250 C 32 275, 75 282, 115 282 C 160 282, 200 278, 200 278 C 200 278, 240 282, 285 282 C 325 282, 368 275, 372 250 C 380 185, 350 110, 300 45 Z"
          transform="scale(0.75) translate(50, 20)"
          fill="url(#shopCapeGrad)"
          filter="url(#shopCapeShadow)"
        />

        {/* Deep Velvet Shadow Folds */}
        <g transform="scale(0.75) translate(50, 20)">
          <path d="M 100 45 Q 65 150 60 260 Q 105 272 135 270 Q 115 150 118 47 Z" fill="#7f1d1d" opacity="0.6" />
          <path d="M 300 45 Q 335 150 340 260 Q 295 272 265 270 Q 285 150 282 47 Z" fill="#7f1d1d" opacity="0.6" />
          <path d="M 160 48 Q 155 160 160 270 Q 200 268 200 268 Q 200 268, 240 270 Q 245 160, 240 48 Z" fill="#991b1b" opacity="0.5" />
          {/* Golden Hem Trim */}
          <path
            d="M 32 255 Q 60 282 115 282 Q 160 282 200 278 Q 240 282 285 282 Q 340 282 368 255"
            fill="none"
            stroke="url(#shopGoldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* Golden Collar Drape & Celestial Crest Clasp */}
        <path
          d="M 90 70 Q 150 95 210 70 L 202 82 Q 150 105 98 82 Z"
          fill="url(#shopGoldGrad)"
          stroke="#b45309"
          strokeWidth="1.5"
        />
        {/* Golden Celestial Star Medallion */}
        <circle cx="150" cy="92" r="16" fill="url(#shopGoldGrad)" stroke="#fef08a" strokeWidth="2" filter="url(#shopCapeShadow)" />
        <circle cx="150" cy="92" r="8" fill="#ef4444" />
        {/* 8-Point Star */}
        <path
          d="M 150 80 L 153 89 L 162 92 L 153 95 L 150 104 L 147 95 L 138 92 L 147 89 Z"
          fill="#fef08a"
        />
      </svg>
    </div>
  );
}
