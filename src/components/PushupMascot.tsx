import React from 'react';

export const PushupMascot: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`gym-container ${className || ''}`}>
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
          <filter id="glow-pushup" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="slime-muscle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="water-grad-pushup" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <clipPath id="head-mask-pushup">
            <ellipse cx="0" cy="0" rx="60" ry="50" />
            <path d="M -40,-30 C -60,-60 -50,-80 -40,-85 C -20,-85 0,-60 10,-40 Z" />
            <path d="M 40,-30 C 60,-60 50,-80 40,-85 C 20,-85 0,-60 -10,-40 Z" />
          </clipPath>
        </defs>

        {/* Gym Floor */}
        <rect x="0" y="480" width="800" height="120" fill="#94a3b8" />
        <rect x="0" y="480" width="800" height="10" fill="#64748b" />
        
        {/* Shadow (Stays on floor) */}
        <ellipse cx="320" cy="510" rx="220" ry="25" fill="black" fillOpacity="0.15" />

        {/* HANDS (STAY ON THE FLOOR) */}
        <g fill="#1e3a8a">
          <rect x="445" y="475" width="40" height="12" rx="6" opacity="0.5" /> {/* Far hand */}
          <rect x="445" y="480" width="45" height="15" rx="7" /> {/* Near hand */}
        </g>

        {/* THE MAIN ANIMATED BODY */}
        <g className="main-body-pivot">
          
          {/* LEGS (Muscular) */}
          {/* Back Leg */}
          <path d="M 160,480 L 300,430" stroke="#1e40af" strokeWidth="35" strokeLinecap="round" />
          {/* Front Leg (Quads) */}
          <path d="M 160,480 L 320,440" stroke="#2563eb" strokeWidth="45" strokeLinecap="round" />
          
          {/* TORSO (Gym Bro Build) */}
          {/* Waist/Glutes */}
          <ellipse cx="310" cy="445" rx="40" ry="35" fill="#2563eb" transform="rotate(-15, 310, 445)" />
          
          {/* Abs/Midsection */}
          <path d="M 320,440 L 440,390" stroke="#2563eb" strokeWidth="60" strokeLinecap="round" />
          
          {/* Chest (Pecs) */}
          <ellipse cx="430" cy="400" rx="65" ry="45" fill="#2563eb" transform="rotate(-15, 430, 400)" />
          <path d="M 380,410 Q 430,440 480,400" fill="none" stroke="#1e40af" strokeWidth="2" opacity="0.3" />

          {/* ARMS (Longer, Muscle Defined) */}
          {/* Far Arm (Behind Body) */}
          <path className="arm-muscle" d="M 440,380 L 450,430 L 460,480" stroke="#1e3a8a" strokeWidth="22" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          
          {/* Near Arm (Muscular Triceps) */}
          <path className="arm-muscle" d="M 440,380 L 450,430 L 460,480" stroke="#2563eb" strokeWidth="28" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* THE HEAD (The Iconic Bottle) */}
          <g transform="translate(510, 340) rotate(15)">
            {/* Bottle Liquid */}
            <g clipPath="url(#head-mask-pushup)">
              <rect x="-100" y="-100" width="200" height="200" fill="#dbeafe" />
              <rect x="-100" y="-15" width="200" height="150" fill="url(#water-grad-pushup)">
                <animateTransform attributeName="transform" type="rotate" values="-8; 8; -8" dur="1.5s" repeatCount="indefinite" />
              </rect>
            </g>

            {/* Glass Shell */}
            <g fill="none" stroke="#93c5fd" strokeWidth="3">
              <ellipse cx="0" cy="0" rx="60" ry="50" fill="rgba(255,255,255,0.1)" />
              <path d="M -40,-30 C -60,-60 -50,-80 -40,-85 C -20,-85 0,-60 10,-40" strokeLinejoin="round" />
              <path d="M 40,-30 C 60,-60 50,-80 40,-85 C 20,-85 0,-60 -10,-40" strokeLinejoin="round" />
            </g>

            {/* Face (Determined Workout Face) */}
            <g transform="translate(-15, -10)">
              <path d="M -15,-5 L 5,0" stroke="#001845" strokeWidth="8" strokeLinecap="round" />
              <path d="M 25,-5 L 45,0" stroke="#001845" strokeWidth="8" strokeLinecap="round" />
              <circle cx="15" cy="20" r="5" fill="#001845" />
            </g>

            {/* Logo & Halo */}
            <path d="M -8,18 L -3,18 L 8,33 L 8,18 L 13,18 L 13,38 L 8,38 L -3,23 L -3,38 L -8,38 Z" fill="white" filter="url(#glow-pushup)" />
            <ellipse cx="0" cy="-110" rx="45" ry="10" fill="none" stroke="#60a5fa" strokeWidth="5" filter="url(#glow-pushup)" />

            {/* Sweat drop */}
            <circle cx="-35" cy="30" r="5" fill="#60a5fa" className="sweat" />
          </g>
        </g>

        {/* Floor Details */}
        <g opacity="0.3" stroke="#cbd5e0" strokeWidth="2">
          <line x1="50" y1="520" x2="150" y2="520" />
          <line x1="300" y1="560" x2="500" y2="560" />
          <line x1="650" y1="530" x2="750" y2="530" />
        </g>
      </svg>
    </div>
  );
};
