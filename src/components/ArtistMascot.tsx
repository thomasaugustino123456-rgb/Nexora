import React from 'react';

export function ArtistMascot({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <clipPath id="bottle-mask">
            <ellipse cx="250" cy="350" rx="150" ry="130" />
            <path d="M 150,250 C 130,190 140,160 150,150 C 170,150 190,190 210,220 Z" />
            <path d="M 350,250 C 370,190 360,160 350,150 C 330,150 310,190 290,220 Z" />
          </clipPath>
        </defs>

        {/* Floor/Shadow */}
        <ellipse cx="400" cy="550" rx="300" ry="20" fill="#000" opacity="0.05" />

        {/* EASEL AND PAPER */}
        <g transform="translate(450, 150)">
          {/* Easel Legs */}
          <path d="M 50,0 L 0,400 M 50,0 L 100,400 M 50,20 L 50,420" stroke="#5d4037" strokeWidth="8" strokeLinecap="round" />
          {/* Easel Support Bar */}
          <rect x="-20" y="300" width="140" height="15" rx="5" fill="#795548" />
          {/* The Art Paper */}
          <rect x="-10" y="50" width="120" height="250" fill="white" stroke="#d1d5db" strokeWidth="2" />
          {/* The drawing on the paper */}
          <path 
            className="pencil-line" 
            d="M 10,100 Q 30,80 50,120 T 90,100 T 110,150" 
            fill="none" 
            stroke="#0284C7" 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{
              strokeDasharray: 200,
              animation: 'drawLine 2s infinite ease-in-out'
            }}
          />
        </g>

        {/* MASCOT BODY GROUP */}
        <g className="mascot-body" style={{ animation: 'artistSway 4s infinite ease-in-out', transformOrigin: 'center bottom' }}>
          {/* LIQUID LAYER */}
          <g clipPath="url(#bottle-mask)">
            <rect x="100" y="200" width="300" height="300" fill="#f0f9ff" opacity="0.4" />
            <g transform="translate(0, 240)">
              <path d="M 0,0 Q 125,-15 250,0 T 500,0 L 500,500 L 0,500 Z" fill="url(#water-grad)">
                <animateTransform attributeName="transform" type="translate" from="-50 0" to="50 0" dur="3s" repeatCount="indefinite" />
              </path>
            </g>
          </g>

          {/* BOTTLE OUTLINE */}
          <g fill="rgba(255,255,255,0.2)" stroke="#7dd3fc" strokeWidth="4">
            <ellipse cx="250" cy="350" rx="150" ry="130" />
            <path d="M 150,250 C 130,190 140,160 150,150 C 170,150 190,190 210,220 Z" />
            <path d="M 350,250 C 370,190 360,160 350,150 C 330,150 310,190 290,220 Z" />
          </g>

          {/* FIXED ARTIST BERET */}
          <g transform="translate(250, 165)">
            <path d="M -80,-15 Q -80,-55 0,-55 Q 80,-55 80,-15 Q 80,10 -80,10 Z" fill="#374151" />
            <rect x="-2" y="-65" width="4" height="12" fill="#374151" rx="2" />
          </g>

          {/* Face */}
          <g>
            <path d="M 180,300 Q 200,290 220,300" fill="none" stroke="#0c4a6e" strokeWidth="5" strokeLinecap="round" />
            <path d="M 280,300 Q 300,290 320,300" fill="none" stroke="#0c4a6e" strokeWidth="5" strokeLinecap="round" />
            <path d="M 235,340 Q 250,355 265,340" fill="none" stroke="#0c4a6e" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Left Arm (Holding Palette) */}
          <g transform="translate(80, 360) rotate(-20)">
            <ellipse cx="0" cy="0" rx="30" ry="20" fill="#eab308" />
            <circle cx="-10" cy="-5" r="4" fill="#ef4444" />
            <circle cx="10" cy="-5" r="4" fill="#3b82f6" />
            <circle cx="0" cy="8" r="4" fill="#22c55e" />
            <path d="M 40,20 Q 20,40 0,0" fill="none" stroke="#7dd3fc" strokeWidth="12" strokeLinecap="round" />
          </g>

          {/* Right Arm (Drawing Arm) */}
          <g className="drawing-arm" style={{ animation: 'sketch 2s infinite ease-in-out', transformOrigin: '380px 350px' }}>
            <path d="M 380,350 Q 420,350 480,280" fill="none" stroke="#7dd3fc" strokeWidth="15" strokeLinecap="round" />
            <g transform="translate(480, 280) rotate(-45)">
              <rect x="0" y="0" width="8" height="40" fill="#fbbf24" />
              <path d="M 0,0 L 8,0 L 4,-8 Z" fill="#4b5563" />
              <rect x="0" y="35" width="8" height="5" fill="#f87171" />
            </g>
          </g>

          {/* Logo and Halo */}
          <g transform="translate(235, 395) scale(0.6)">
            <path d="M 0 0 L 10 0 L 30 40 L 30 0 L 45 0 L 45 60 L 30 60 L 10 20 L 10 60 L 0 60 Z" fill="white" filter="url(#glow)" />
          </g>
          <ellipse cx="250" cy="80" rx="60" ry="10" fill="none" stroke="#60a5fa" strokeWidth="4" filter="url(#glow)" opacity="0.6" />
        </g>

        <style>{`
          @keyframes sketch {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(15px, -10px) rotate(5deg); }
            50% { transform: translate(5px, 15px) rotate(-3deg); }
            75% { transform: translate(20px, 5px) rotate(2deg); }
          }
          @keyframes drawLine {
            0%, 100% { stroke-dashoffset: 200; }
            50% { stroke-dashoffset: 0; }
          }
          @keyframes artistSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(2deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}
