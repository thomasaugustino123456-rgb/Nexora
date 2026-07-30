import React from 'react';

export function AnimatedVikingHat({
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
          @keyframes floatItemViking {
            0% { 
              transform: translateY(0px); 
              filter: drop-shadow(0 8px 6px rgba(0, 0, 0, 0.15)); 
            }
            100% { 
              transform: translateY(-8px); 
              filter: drop-shadow(0 15px 10px rgba(0, 0, 0, 0.08)); 
            }
          }

          .animate-float-viking {
            animation: floatItemViking 3s ease-in-out infinite alternate;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 300 250"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-float-viking' : ''}`}
      >
        <defs>
          {/* Polished Iron Gradient for the Helmet Dome */}
          <linearGradient id="vikingIronGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b0bec5"/>
            <stop offset="50%" stopColor="#78909c"/>
            <stop offset="100%" stopColor="#455a64"/>
          </linearGradient>

          {/* Lighter Silver for the Rim and Rivets */}
          <linearGradient id="vikingSilverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eceff1"/>
            <stop offset="100%" stopColor="#90a4ae"/>
          </linearGradient>

          {/* Ivory/Bone Gradient for the Horns */}
          <linearGradient id="vikingHornGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d7ccc8"/>
            <stop offset="30%" stopColor="#efebe9"/>
            <stop offset="100%" stopColor="#ffffff"/>
          </linearGradient>

          {/* Drop shadow for the horns to give them 3D depth against the helmet */}
          <filter id="vikingHornShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* LEFT HORN */}
        <g filter="url(#vikingHornShadow)">
          <path d="M 85,150 Q 5,140 15,30 Q 55,70 85,110 Z" fill="url(#vikingHornGrad)" stroke="#5d4037" strokeWidth="2"/>
          {/* Left Horn Base Ring */}
          <ellipse cx="80" cy="130" rx="12" ry="24" fill="url(#vikingSilverGrad)" stroke="#37474f" strokeWidth="2" transform="rotate(-15 80 130)"/>
        </g>

        {/* RIGHT HORN */}
        <g filter="url(#vikingHornShadow)">
          <path d="M 215,150 Q 295,140 285,30 Q 245,70 215,110 Z" fill="url(#vikingHornGrad)" stroke="#5d4037" strokeWidth="2"/>
          {/* Right Horn Base Ring */}
          <ellipse cx="220" cy="130" rx="12" ry="24" fill="url(#vikingSilverGrad)" stroke="#37474f" strokeWidth="2" transform="rotate(15 220 130)"/>
        </g>

        {/* HELMET DOME */}
        {/* Perfect half circle for the top of the head */}
        <path d="M 70,165 A 80,80 0 0,1 230,165 Z" fill="url(#vikingIronGrad)" stroke="#263238" strokeWidth="3"/>

        {/* CENTER METAL BAND */}
        {/* Gives the helmet that classic reinforced Viking look */}
        <path d="M 140,165 L 145,86 L 155,86 L 160,165 Z" fill="url(#vikingSilverGrad)" stroke="#263238" strokeWidth="2"/>

        {/* TOP SPIKE */}
        <path d="M 145,86 L 150,60 L 155,86 Z" fill="url(#vikingSilverGrad)" stroke="#263238" strokeWidth="2"/>

        {/* BOTTOM METAL RIM */}
        <rect x="60" y="165" width="180" height="20" rx="6" fill="url(#vikingSilverGrad)" stroke="#263238" strokeWidth="3"/>

        {/* IRON RIVETS */}
        <circle cx="75" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
        <circle cx="105" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
        <circle cx="135" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
        <circle cx="165" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
        <circle cx="195" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>
        <circle cx="225" cy="175" r="4" fill="#ffffff" stroke="#263238" strokeWidth="1"/>

      </svg>
    </div>
  );
}
