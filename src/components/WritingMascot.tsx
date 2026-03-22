import React from 'react';

export function WritingMascot({ className = "" }: { className?: string }) {
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
        <ellipse cx="350" cy="550" rx="250" ry="20" fill="#000" opacity="0.05" />

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

          {/* Glasses */}
          <g transform="translate(250, 290)">
            <circle cx="-40" cy="0" r="25" fill="none" stroke="#1e40af" strokeWidth="6" />
            <circle cx="40" cy="0" r="25" fill="none" stroke="#1e40af" strokeWidth="6" />
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#1e40af" strokeWidth="6" />
            <line x1="-65" y1="0" x2="-90" y2="-20" stroke="#1e40af" strokeWidth="6" strokeLinecap="round" />
            <line x1="65" y1="0" x2="90" y2="-20" stroke="#1e40af" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* Face */}
          <g>
            <circle cx="210" cy="290" r="5" fill="#0c4a6e" />
            <circle cx="290" cy="290" r="5" fill="#0c4a6e" />
            <path d="M 235,330 Q 250,345 265,330" fill="none" stroke="#0c4a6e" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Left Arm (Holding Book) */}
          <g transform="translate(120, 380) rotate(-10)">
            <path d="M 0,0 Q -40,40 -20,80" fill="none" stroke="#7dd3fc" strokeWidth="15" strokeLinecap="round" />
          </g>

          {/* BOOK (Held by left arm, written on by right arm) */}
          <g transform="translate(350, 420) rotate(-15)">
            {/* Book Cover Back */}
            <path d="M -150,-50 L 50,-50 L 70,50 L -130,50 Z" fill="#1e3a8a" stroke="#1e40af" strokeWidth="4" strokeLinejoin="round" />
            {/* Pages */}
            <path d="M -140,-40 L 40,-40 L 60,40 L -120,40 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2" strokeLinejoin="round" />
            <path d="M -135,-35 L 45,-35 L 65,45 L -115,45 Z" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" strokeLinejoin="round" />
            {/* Writing Lines */}
            <line x1="-100" y1="-20" x2="20" y2="-20" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            <line x1="-90" y1="0" x2="30" y2="0" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            <line x1="-80" y1="20" x2="0" y2="20" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            
            {/* The drawing/writing line animation */}
            <path 
              className="pencil-line" 
              d="M -80,20 Q -40,10 0,20" 
              fill="none" 
              stroke="#0284C7" 
              strokeWidth="3" 
              strokeLinecap="round"
              style={{
                strokeDasharray: 100,
                animation: 'drawLine 2s infinite ease-in-out'
              }}
            />
          </g>

          {/* Right Arm (Writing Arm) */}
          <g className="drawing-arm" style={{ animation: 'sketch 2s infinite ease-in-out', transformOrigin: '380px 350px' }}>
            <path d="M 380,350 Q 420,380 390,430" fill="none" stroke="#7dd3fc" strokeWidth="15" strokeLinecap="round" />
            {/* Pen */}
            <g transform="translate(390, 430) rotate(30)">
              <rect x="-4" y="-30" width="8" height="40" fill="#ef4444" rx="2" />
              <path d="M -4,10 L 4,10 L 0,20 Z" fill="#9ca3af" />
              <circle cx="0" cy="20" r="1.5" fill="#1e3a8a" />
            </g>
          </g>
        </g>

        <style>
          {`
            @keyframes artistSway {
              0%, 100% { transform: rotate(-2deg); }
              50% { transform: rotate(2deg); }
            }
            @keyframes sketch {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              25% { transform: translate(15px, -5px) rotate(5deg); }
              50% { transform: translate(30px, 0px) rotate(0deg); }
              75% { transform: translate(15px, 5px) rotate(-5deg); }
            }
            @keyframes drawLine {
              0% { stroke-dashoffset: 100; }
              50%, 100% { stroke-dashoffset: 0; }
            }
          `}
        </style>
      </svg>
    </div>
  );
}
