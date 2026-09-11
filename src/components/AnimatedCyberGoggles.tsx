import React from 'react';

export function AnimatedCyberGoggles({
  className = "w-20 h-12",
  animate = true
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {animate && (
        <style>{`
          @keyframes floatGoggles {
            0% { 
              transform: translateY(0px); 
              filter: drop-shadow(0 4px 8px rgba(6, 182, 212, 0.4)); 
            }
            100% { 
              transform: translateY(-5px); 
              filter: drop-shadow(0 8px 16px rgba(6, 182, 212, 0.6)); 
            }
          }

          @keyframes hudPulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }

          @keyframes scanReticle {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .animate-float-goggles {
            animation: floatGoggles 3s ease-in-out infinite alternate;
          }

          .animate-hud-pulse {
            animation: hudPulse 2s ease-in-out infinite;
          }

          .animate-scan-reticle {
            transform-origin: 140px 100px;
            animation: scanReticle 8s linear infinite;
          }
        `}</style>
      )}
      <svg
        viewBox="0 0 400 200"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? 'animate-float-goggles' : ''}`}
      >
        <defs>
          {/* Cyber Goggle Holographic Cyan Lens Gradient */}
          <linearGradient id="shopGoggleLensGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#0891b2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.95" />
          </linearGradient>

          {/* Premium Graphite Frame Gradient */}
          <linearGradient id="shopGoggleFrameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Glowing HUD Filter */}
          <filter id="shopGoggleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Tactical Side Straps (Elastic Headband wrapping to sides) */}
        <path d="M 68 100 C 45 98, 25 96, 12 94" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M 68 100 C 45 98, 25 96, 12 94" stroke="#06b6d4" strokeWidth="3.5" strokeDasharray="8 4" strokeLinecap="round" fill="none" />
        <path d="M 332 100 C 355 98, 375 96, 388 94" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M 332 100 C 355 98, 375 96, 388 94" stroke="#06b6d4" strokeWidth="3.5" strokeDasharray="8 4" strokeLinecap="round" fill="none" />

        {/* Side Adjustment Buckles */}
        <rect x="58" y="88" width="16" height="24" rx="4" fill="#334155" stroke="#06b6d4" strokeWidth="2" />
        <rect x="326" y="88" width="16" height="24" rx="4" fill="#334155" stroke="#06b6d4" strokeWidth="2" />

        {/* 2. Goggle Dual Ocular Outer Frames (🥽 Contoured Goggles Silhouette) */}
        {/* Left Eyepiece Outer Bezel */}
        <path
          d="M 78 72 C 74 54, 186 54, 182 72 L 180 128 C 178 146, 76 146, 76 128 Z"
          fill="url(#shopGoggleFrameGrad)"
          stroke="#06b6d4"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Right Eyepiece Outer Bezel */}
        <path
          d="M 218 72 C 214 54, 326 54, 322 72 L 324 128 C 324 146, 222 146, 220 128 Z"
          fill="url(#shopGoggleFrameGrad)"
          stroke="#06b6d4"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Ergonomic Center Nose Bridge */}
        <path d="M 180 88 Q 200 80 220 88 L 220 106 Q 200 98 180 106 Z" fill="#1e293b" stroke="#06b6d4" strokeWidth="2.5" />
        <circle cx="200" cy="94" r="3.5" fill="#38bdf8" />

        {/* 3. Luminous Cyan Visor Goggle Lenses */}
        {/* Left Lens */}
        <rect x="84" y="64" width="92" height="68" rx="18" fill="url(#shopGoggleLensGrad)" stroke="#38bdf8" strokeWidth="2" />
        {/* Right Lens */}
        <rect x="224" y="64" width="92" height="68" rx="18" fill="url(#shopGoggleLensGrad)" stroke="#38bdf8" strokeWidth="2" />

        {/* 4. Digital HUD Reticles & Cybernetic Scanning Telemetry */}
        <g className={animate ? 'animate-hud-pulse' : ''}>
          {/* Left Lens HUD */}
          <circle cx="130" cy="98" r="18" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="5 3" />
          <path d="M 122 98 L 138 98 M 130 90 L 130 106" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" />
          <path d="M 96 78 L 102 78 L 102 84 M 164 78 L 158 78 L 158 84 M 96 118 L 102 118 L 102 112 M 164 118 L 158 118 L 158 112" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
          <text x="130" y="125" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#a5f3fc" textAnchor="middle">QUANTUM</text>

          {/* Right Lens HUD */}
          <circle cx="270" cy="98" r="18" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 254 104 L 260 92 L 266 102 L 272 90 L 278 100 L 286 94" fill="none" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 236 78 L 242 78 L 242 84 M 304 78 L 298 78 L 298 84 M 236 118 L 242 118 L 242 112 M 304 118 L 298 118 L 298 112" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
          <text x="270" y="125" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#a5f3fc" textAnchor="middle">HUD v2.0</text>
        </g>

        {/* 5. Goggle Glossy Curved Lens Reflection (Signature 🥽 Glass Arc) */}
        <path d="M 96 76 Q 130 66 164 76" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
        <path d="M 236 76 Q 270 66 304 76" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
        <circle cx="106" cy="112" r="3" fill="#ffffff" opacity="0.6" />
        <circle cx="246" cy="112" r="3" fill="#ffffff" opacity="0.6" />

        {/* 6. Temple Cyber LEDs */}
        <circle cx="72" cy="80" r="3.5" fill="#00f0ff" filter="url(#shopGoggleGlow)" />
        <circle cx="328" cy="80" r="3.5" fill="#00f0ff" filter="url(#shopGoggleGlow)" />
      </svg>
    </div>
  );
}
