import React from 'react';

export function AnimatedWizardHat({
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
          @keyframes floatItemWiz {
            0% { 
              transform: translateY(0px); 
              filter: drop-shadow(0 8px 8px rgba(100, 50, 255, 0.2)); 
            }
            100% { 
              transform: translateY(-8px); 
              filter: drop-shadow(0 18px 14px rgba(100, 50, 255, 0.15)); 
            }
          }

          @keyframes gemPulseWiz {
            0% { fill: #00e5ff; }
            100% { fill: #ffffff; }
          }

          .animate-float-wiz {
            animation: floatItemWiz 3.5s ease-in-out infinite alternate;
          }

          .animate-gem-pulse {
            animation: gemPulseWiz 2s ease-in-out infinite alternate;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-float-wiz' : ''}`}
      >
        <defs>
          {/* Velvety Blue Hat Gradient */}
          <linearGradient id="velvetGradWiz" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a148c"/>
            <stop offset="50%" stopColor="#1a237e"/>
            <stop offset="100%" stopColor="#0d1137"/>
          </linearGradient>

          {/* Shimmery Gold Gradient */}
          <linearGradient id="goldGradWiz" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff9c4"/>
            <stop offset="50%" stopColor="#fbc02d"/>
            <stop offset="100%" stopColor="#f57f17"/>
          </linearGradient>
          
          {/* Magic Glow Filter */}
          <filter id="magicGlowWiz" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Main Hat Group */}
        <g>
          {/* The Hat Brim - warped ellipse */}
          <path d="M 40 220 Q 150 250 260 220 C 290 200 10 200 40 220 Z" fill="url(#velvetGradWiz)" stroke="#000000" strokeWidth="1.5"/>
          
          {/* Gold Trim on Brim Edge */}
          <path d="M 40 220 Q 150 250 260 220 Q 150 240 40 220" fill="none" stroke="url(#goldGradWiz)" strokeWidth="3" strokeLinecap="round"/>

          {/* The Hat Body - Twisted Cone */}
          <path d="M 70 208 L 100 80 Q 150 20 200 80 Q 220 150 160 200 Q 150 208 70 208 Z" fill="url(#velvetGradWiz)" stroke="#000000" strokeWidth="1.5"/>

          {/* Gold Star Decorations */}
          <path d="M 120 70 L 123 76 L 129 76 L 125 80 L 126 86 L 120 83 L 114 86 L 115 80 L 111 76 L 117 76 Z" fill="url(#goldGradWiz)"/>
          <path d="M 180 110 L 182 113 L 186 113 L 183 115 L 184 119 L 180 117 L 176 119 L 177 115 L 174 113 L 178 113 Z" fill="url(#goldGradWiz)"/>
          <path d="M 160 150 L 163 156 L 169 156 L 165 160 L 166 166 L 160 163 L 154 166 L 155 160 L 151 156 L 157 156 Z" fill="url(#goldGradWiz)"/>
          
          {/* Crescent Moon */}
          <path d="M 145 95 A 15 15 0 1 1 145 125 A 20 20 0 0 0 145 95 Z" fill="url(#goldGradWiz)"/>

          {/* The Hat Band */}
          <path d="M 75 208 L 82 180 Q 150 190 208 178 L 222 201 L 160 200 Q 150 208 75 208 Z" fill="#283593" stroke="#000000" strokeWidth="1"/>

          {/* The Buckle and Gem */}
          <rect x="135" y="180" width="30" height="25" rx="3" fill="url(#goldGradWiz)" stroke="#3e2723" strokeWidth="1.5"/>
          <circle cx="150" cy="192.5" r="7" className={animate ? "animate-gem-pulse" : ""} fill="#00e5ff" filter="url(#magicGlowWiz)"/>
        </g>
      </svg>
    </div>
  );
}
