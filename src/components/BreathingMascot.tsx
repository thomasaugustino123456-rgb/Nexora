import React from 'react';

interface BreathingMascotProps {
  className?: string;
  phase: 'In' | 'Out';
}

export const BreathingMascot: React.FC<BreathingMascotProps> = ({ className, phase }) => {
  return (
    <div className={`bottle-container ${className || ''}`}>
      <svg viewBox="0 0 500 650" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id="glow-breath" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="water-grad-breath" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <clipPath id="bottle-mask-breath">
            <ellipse cx="250" cy="350" rx="190" ry="160" />
            <path d="M 120,230 C 100,170 110,140 120,130 C 140,130 160,170 180,200 Z" />
            <path d="M 380,230 C 400,170 390,140 380,130 C 360,130 340,170 320,200 Z" />
          </clipPath>
        </defs>

        {/* Pulsing Aura Background */}
        <circle 
          className={`aura transition-all duration-[5000ms] ease-in-out ${phase === 'In' ? 'scale-110 opacity-40' : 'scale-100 opacity-20'}`} 
          cx="250" cy="350" r="220" fill="url(#water-grad-breath)" 
          style={{ transformOrigin: 'center' }}
        />

        {/* Soft Floor Shadow */}
        <ellipse cx="250" cy="560" rx="120" ry="10" fill="#0066FF" fillOpacity="0.1" />

        <g 
          className={`zen-group transition-all duration-[5000ms] ease-in-out ${phase === 'In' ? 'scale-[1.08] translate-y-[-10px]' : 'scale-100 translate-y-0'}`}
          style={{ transformOrigin: 'center' }}
        >
          {/* LIQUID LAYER */}
          <g clipPath="url(#bottle-mask-breath)">
            <rect x="0" y="0" width="500" height="700" fill="#F0F9FF" fillOpacity="0.4" />
            
            {/* Water Surface that rises/falls with breath */}
            <g transform={`translate(0, ${phase === 'In' ? 200 : 250})`} style={{ transition: 'transform 5s ease-in-out' }}>
              <path d="M -500,0 Q -250,-20 0,0 T 500,0 T 1000,0 L 1000,500 L -500,500 Z" fill="url(#water-grad-breath)">
                <animateTransform attributeName="transform" type="translate" from="0 0" to="-500 0" dur="10s" repeatCount="indefinite" />
              </path>
            </g>
          </g>

          {/* BOTTLE BODY */}
          <g fill="rgba(255,255,255,0.2)" stroke="#7DD3FC" strokeWidth="4">
            <ellipse cx="250" cy="350" rx="190" ry="160" />
            {/* Ears */}
            <path d="M 120,230 C 100,170 110,140 120,130 C 140,130 160,170 180,200 Z" />
            <path d="M 380,230 C 400,170 390,140 380,130 C 360,130 340,170 320,200 Z" />
          </g>

          {/* CALM FACE */}
          <g transform="translate(0, 20)">
            {/* Peacefully Closed Eyes */}
            <path d="M 170,300 Q 190,315 210,300" fill="none" stroke="#0C4A6E" strokeWidth="6" strokeLinecap="round" />
            <path d="M 290,300 Q 310,315 330,300" fill="none" stroke="#0C4A6E" strokeWidth="6" strokeLinecap="round" />
            
            {/* Gentle Exhale Mouth */}
            <circle cx="250" cy="340" r={phase === 'In' ? 8 : 14} fill="none" stroke="#0C4A6E" strokeWidth="3" style={{ transition: 'r 5s ease-in-out' }}>
              <animate attributeName="opacity" values="0.3; 1; 0.3" dur="6s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Resting Arms */}
          <ellipse cx="65" cy="360" rx="12" ry="25" fill="rgba(255,255,255,0.4)" stroke="#7DD3FC" strokeWidth="3" transform="rotate(10, 65, 360)" />
          <ellipse cx="435" cy="360" rx="12" ry="25" fill="rgba(255,255,255,0.4)" stroke="#7DD3FC" strokeWidth="3" transform="rotate(-10, 435, 360)" />

          {/* Glowing Heart/Logo */}
          <g transform="translate(235, 385) scale(0.6)">
            <path d="M 0 0 L 10 0 L 30 40 L 30 0 L 45 0 L 45 60 L 30 60 L 10 20 L 10 60 L 0 60 Z" fill="white" filter="url(#glow-breath)">
              <animate attributeName="opacity" values="0.4; 1; 0.4" dur="6s" repeatCount="indefinite" />
            </path>
          </g>

          {/* Calm Halo */}
          <ellipse cx="250" cy="80" rx="70" ry="12" fill="none" stroke="white" strokeWidth="5" filter="url(#glow-breath)" opacity="0.6">
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,10; 0,0" dur="4s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Floating Particles */}
        <circle r="4" fill="white" fillOpacity="0.6">
          <animate attributeName="cx" values="100; 120; 100" dur="5s" repeatCount="indefinite" />
          <animate attributeName="cy" values="500; 100" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle r="3" fill="white" fillOpacity="0.4">
          <animate attributeName="cx" values="400; 380; 400" dur="4s" repeatCount="indefinite" />
          <animate attributeName="cy" values="550; 150" dur="10s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};
