import React from 'react';

export function AnimatedSunglasses({
  className = "w-20 h-10",
  animate = true
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {animate && (
        <style>{`
          @keyframes floatGlasses {
            0% { 
              transform: translateY(0px); 
              filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5)); 
            }
            100% { 
              transform: translateY(-6px); 
              filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.3)); 
            }
          }

          @keyframes lensShine {
            0%, 20% { transform: translateX(-150px); }
            80%, 100% { transform: translateX(500px); }
          }

          .animate-float-glasses {
            animation: floatGlasses 3.5s ease-in-out infinite alternate;
          }

          .animate-lens-shine {
            animation: lensShine 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 400 200"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-float-glasses' : ''}`}
      >
        <defs>
          {/* Cool Synthwave/Cyberpunk Sunset Gradient for the Lenses */}
          <linearGradient id="shopLensGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF007F" />   {/* Neon Pink */}
            <stop offset="50%" stopColor="#9D00FF" />  {/* Deep Purple */}
            <stop offset="100%" stopColor="#00E5FF" /> {/* Cyber Cyan */}
          </linearGradient>

          {/* Subtle Gradient for the Frames to give them a premium plastic look */}
          <linearGradient id="shopFrameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>

          {/* Clip path to keep the light reflection strictly inside the lenses */}
          <clipPath id="shopLensClip">
            {/* Left Lens Shape */}
            <path d="M50,55 C65,40 145,40 160,55 L152,125 C135,150 75,150 58,125 Z" />
            {/* Right Lens Shape */}
            <path d="M240,55 C255,40 335,40 350,55 L342,125 C325,150 265,150 248,125 Z" />
          </clipPath>
        </defs>

        {/* The Glasses Frame */}
        <g stroke="#000" strokeWidth="2">
          {/* Earpieces (gives a 3D folded-back illusion) */}
          <path d="M40,45 L10,25 C5,20 5,15 15,20 L46,50 Z" fill="#111" />
          <path d="M360,45 L390,25 C395,20 395,15 385,20 L354,50 Z" fill="#111" />

          {/* Left Outer Frame */}
          <path d="M40,45 C60,25 150,25 170,45 L164,130 C140,165 65,165 46,130 Z" fill="url(#shopFrameGradient)" />
          {/* Right Outer Frame */}
          <path d="M230,45 C250,25 340,25 360,45 L354,130 C330,165 255,165 236,130 Z" fill="url(#shopFrameGradient)" />
          
          {/* Center Bridge */}
          <path d="M 165,55 Q 200,40 235,55 L 235,70 Q 200,60 165,70 Z" fill="url(#shopFrameGradient)" />
        </g>

        {/* The Lenses */}
        <g>
          {/* Left Lens Color */}
          <path d="M50,55 C65,40 145,40 160,55 L152,125 C135,150 75,150 58,125 Z" fill="url(#shopLensGradient)" />
          {/* Right Lens Color */}
          <path d="M240,55 C255,40 335,40 350,55 L342,125 C325,150 265,150 248,125 Z" fill="url(#shopLensGradient)" />
        </g>

        {/* The Animated Shine Reflection */}
        <g clipPath="url(#shopLensClip)">
          <g className={animate ? "animate-lens-shine" : ""}>
            {/* Main thick glare */}
            <rect x="-50" y="-50" width="60" height="300" fill="rgba(255, 255, 255, 0.35)" transform="skewX(-35)" />
            {/* Smaller secondary glare */}
            <rect x="25" y="-50" width="15" height="300" fill="rgba(255, 255, 255, 0.2)" transform="skewX(-35)" />
          </g>
        </g>

        {/* Little white reflection highlights on the top corners of the frames */}
        <path d="M50,38 C60,32 70,30 80,30" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
        <path d="M350,38 C340,32 330,30 320,30" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
