import React, { useState } from 'react';

const nexoraAppIcon = "https://res.cloudinary.com/ddtfq9acc/image/upload/q_auto/f_auto/v1780831447/file_00000000659471f48492f78ba083fafc_wt3p7m.png";

interface MascotImageProps {
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export function MascotImage({ className = "w-16 h-16 rounded-2xl", alt = "Nexora Mascot Logo", style }: MascotImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Elegant high-performance fallback representation of our digital companion/mascot!
    return (
      <div 
        className={`relative bg-gradient-to-tr from-cyan-400 via-indigo-500 to-blue-600 shadow-md flex items-center justify-center overflow-hidden shrink-0 select-none ${className}`}
        style={{ ...style, display: 'flex' }}
      >
        {/* Ambient Inner Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-white/20 to-transparent pointer-events-none opacity-40" />
        
        {/* Sleek Mascot SVG */}
        <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Holographic Glowing Celestial Halo */}
          <ellipse cx="50" cy="22" rx="22" ry="5.5" stroke="#A7F3D0" strokeWidth="4.5" strokeDasharray="4 2" />
          
          {/* Subtle Antenna Flow */}
          <path d="M 50 35 L 50 25" stroke="#A7F3D0" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="25" r="3" fill="#6EE7B7" />

          {/* Core Rounded Robot Body */}
          <rect x="25" y="34" width="50" height="50" rx="18" fill="url(#coreGradient)" stroke="#E0F2FE" strokeWidth="2.5" />
          
          {/* Screen Display Face Mask */}
          <rect x="30" y="39" width="40" height="40" rx="14" fill="#0F172A" />

          {/* Cute Glowing LED Eyes */}
          <g>
            {/* Left Eye */}
            <circle cx="43" cy="54" r="5" fill="#38BDF8" className="animate-pulse" />
            <circle cx="45" cy="52" r="1.5" fill="#FFFFFF" />
            {/* Right Eye */}
            <circle cx="57" cy="54" r="5" fill="#38BDF8" className="animate-pulse" />
            <circle cx="59" cy="52" r="1.5" fill="#FFFFFF" />
          </g>

          {/* Smiling LED Arc */}
          <path d="M 45 64 Q 50 68 55 64" stroke="#6EE7B7" strokeWidth="3.5" strokeLinecap="round" />

          {/* Rosy Digital Blush */}
          <circle cx="36" cy="62" r="2" fill="#F472B6" opacity="0.6" />
          <circle cx="64" cy="62" r="2" fill="#F472B6" opacity="0.6" />

          <defs>
            <linearGradient id="coreGradient" x1="25" y1="34" x2="75" y2="84" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <img 
      src={nexoraAppIcon} 
      alt={alt}
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      onError={() => {
        console.warn("Cloudinary URL failed to load under sandbox, switching to gorgeous fallback SVG.");
        setHasError(true);
      }}
    />
  );
}
