import React from 'react';

export function AnimatedRoyalCrown({
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
          @keyframes floatItemCrown {
            0% { 
              transform: translateY(0px); 
              filter: drop-shadow(0 8px 8px rgba(255, 215, 0, 0.25)); 
            }
            100% { 
              transform: translateY(-8px); 
              filter: drop-shadow(0 18px 14px rgba(255, 215, 0, 0.15)); 
            }
          }

          @keyframes sweepShineCrown {
            0%, 20% { transform: translateX(-250px) skewX(-45deg); }
            80%, 100% { transform: translateX(350px) skewX(-45deg); }
          }

          @keyframes pulseGlowCrown {
            0% { filter: drop-shadow(0 0 3px rgba(255, 0, 85, 0.5)); }
            100% { filter: drop-shadow(0 0 10px rgba(255, 0, 85, 0.9)); }
          }

          .animate-float-crown {
            animation: floatItemCrown 3.5s ease-in-out infinite alternate;
          }

          .gold-shine-crown {
            animation: sweepShineCrown 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }

          .ruby-glow-crown {
            animation: pulseGlowCrown 2s ease-in-out infinite alternate;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-float-crown' : ''}`}
      >
        <defs>
          {/* Rich Gold Gradient for the main metal */}
          <linearGradient id="goldGradCrown" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff176"/>
            <stop offset="30%" stopColor="#ffd54f"/>
            <stop offset="70%" stopColor="#ffb300"/>
            <stop offset="100%" stopColor="#f57f17"/>
          </linearGradient>

          {/* Darker Gold for inner shadows/depth */}
          <linearGradient id="darkGoldGradCrown" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffca28"/>
            <stop offset="100%" stopColor="#ff8f00"/>
          </linearGradient>

          {/* Deep Royal Velvet Gradient */}
          <linearGradient id="velvetGradCrown" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c62828"/>
            <stop offset="50%" stopColor="#8e0000"/>
            <stop offset="100%" stopColor="#5c0000"/>
          </linearGradient>

          {/* Gemstone Gradients */}
          <radialGradient id="rubyGradCrown" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff8a80"/>
            <stop offset="40%" stopColor="#ff1744"/>
            <stop offset="100%" stopColor="#b71c1c"/>
          </radialGradient>

          <radialGradient id="sapphireGradCrown" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#80d8ff"/>
            <stop offset="40%" stopColor="#00b0ff"/>
            <stop offset="100%" stopColor="#01579b"/>
          </radialGradient>

          <radialGradient id="emeraldGradCrown" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#b9f6ca"/>
            <stop offset="40%" stopColor="#00e676"/>
            <stop offset="100%" stopColor="#1b5e20"/>
          </radialGradient>

          {/* Clip path to keep the shine strictly inside the gold */}
          <clipPath id="crownClipPath">
            <path d="M 50 230 L 30 110 L 95 155 L 150 50 L 205 155 L 270 110 L 250 230 Z" />
          </clipPath>
        </defs>

        {/* 1. The Back Inner Velvet Cushion */}
        <path d="M 50 200 C 50 70, 250 70, 250 200 Z" fill="url(#velvetGradCrown)"/>
        
        {/* Velvet fabric fold lines for realism */}
        <path d="M 150 90 Q 150 150 150 200" stroke="#7f0000" strokeWidth="4" fill="none"/>
        <path d="M 100 110 Q 120 160 130 200" stroke="#7f0000" strokeWidth="3" fill="none"/>
        <path d="M 200 110 Q 180 160 170 200" stroke="#7f0000" strokeWidth="3" fill="none"/>

        {/* 2. The Main Gold Crown Structure */}
        {/* Back inner rim */}
        <ellipse cx="150" cy="195" rx="100" ry="25" fill="url(#darkGoldGradCrown)"/>
        
        {/* Front Gold Spikes */}
        <path d="M 50 200 L 30 110 L 95 155 L 150 50 L 205 155 L 270 110 L 250 200 Z" fill="url(#goldGradCrown)" stroke="#c56000" strokeWidth="2" strokeLinejoin="round"/>
        
        {/* 3D Gold Extrusions */}
        <path d="M 50 200 L 30 110 L 40 115 L 60 200 Z" fill="url(#darkGoldGradCrown)"/>
        <path d="M 150 50 L 158 60 L 110 165 L 95 155 Z" fill="url(#darkGoldGradCrown)"/>
        <path d="M 270 110 L 250 200 L 240 200 L 260 115 Z" fill="url(#darkGoldGradCrown)"/>

        {/* Thick Gold Base Rim */}
        <path d="M 40 230 Q 150 270 260 230 L 250 195 Q 150 225 50 195 Z" fill="url(#goldGradCrown)" stroke="#c56000" strokeWidth="2"/>
        {/* Bottom Base Detail Line */}
        <path d="M 45 220 Q 150 255 255 220" fill="none" stroke="#ffe082" strokeWidth="3"/>

        {/* 3. The Sweeping Shine Animation */}
        <g clipPath="url(#crownClipPath)">
          <rect x="0" y="-50" width="40" height="400" fill="rgba(255, 255, 255, 0.4)" className={animate ? "gold-shine-crown" : ""} />
          <rect x="50" y="-50" width="15" height="400" fill="rgba(255, 255, 255, 0.2)" className={animate ? "gold-shine-crown" : ""} />
        </g>

        {/* 4. The Gemstones */}
        {/* Center Giant Ruby */}
        <g className={animate ? "ruby-glow-crown" : ""}>
          <ellipse cx="150" cy="215" rx="15" ry="20" fill="url(#rubyGradCrown)" stroke="#ffecb3" strokeWidth="2"/>
          <path d="M 145 205 Q 155 200 155 210" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
        </g>

        {/* Left Sapphire */}
        <circle cx="95" cy="208" r="12" fill="url(#sapphireGradCrown)" stroke="#ffecb3" strokeWidth="2"/>
        <path d="M 90 202 Q 100 200 100 205" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Right Emerald */}
        <circle cx="205" cy="208" r="12" fill="url(#emeraldGradCrown)" stroke="#ffecb3" strokeWidth="2"/>
        <path d="M 200 202 Q 210 200 210 205" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Peak Diamonds */}
        {/* Center Peak */}
        <path d="M 150 35 L 165 50 L 150 65 L 135 50 Z" fill="url(#rubyGradCrown)" stroke="#ffecb3" strokeWidth="2"/>
        {/* Left Peak */}
        <circle cx="30" cy="110" r="10" fill="url(#sapphireGradCrown)" stroke="#ffecb3" strokeWidth="1.5"/>
        {/* Right Peak */}
        <circle cx="270" cy="110" r="10" fill="url(#emeraldGradCrown)" stroke="#ffecb3" strokeWidth="1.5"/>

        {/* Tiny Gold Beads along the base */}
        <circle cx="65" cy="200" r="3" fill="#ffffff"/>
        <circle cx="125" cy="213" r="3" fill="#ffffff"/>
        <circle cx="175" cy="213" r="3" fill="#ffffff"/>
        <circle cx="235" cy="200" r="3" fill="#ffffff"/>
      </svg>
    </div>
  );
}
