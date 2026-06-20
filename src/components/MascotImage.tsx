import React, { useState } from 'react';

// Use the premium custom generated Nexora Mascot squircle app icon
const nexoraAppIcon = "/src/assets/images/nexora_mascot_logo_1781981236517.jpg";

interface MascotImageProps {
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export function MascotImage({ className = "w-16 h-16 rounded-2xl", alt = "Nexora Mascot Logo", style }: MascotImageProps) {
  const [hasError, setHasError] = useState(false);

  // Fallback beautiful vector representation of our digital companion/slime mascot!
  const renderFallbackSlime = () => (
    <div 
      className={`relative bg-gradient-to-tr from-[#3b82f6] via-[#1d4ed8] to-[#1e3a8a] shadow-md flex items-center justify-center overflow-hidden shrink-0 select-none ${className}`}
      style={{ ...style, display: 'flex' }}
    >
      {/* Ambient Inner Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-white/20 to-transparent pointer-events-none opacity-40" />
      
      {/* Sleek Slime Companion Vector SVG */}
      <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Soft floating shadow below */}
        <ellipse cx="50" cy="85" rx="30" ry="6" fill="#000000" opacity="0.25" />
        
        {/* Core Slime Body */}
        <path 
          d="M 50 15 C 72 15, 88 35, 88 58 C 88 78, 71 84, 50 84 C 29 84, 12 78, 12 58 C 12 35, 28 15, 50 15 Z" 
          fill="url(#slimeGradient)" 
          stroke="#E0F2FE" 
          strokeWidth="2.5" 
        />
        
        {/* Slime Cute Shiny Highlight Accent */}
        <path 
          d="M 28 32 C 34 26, 42 24, 50 24" 
          stroke="#FFFFFF" 
          strokeWidth="3" 
          strokeLinecap="round" 
          opacity="0.6" 
        />

        {/* Big sparkling eyes */}
        <g>
          {/* Left Eye */}
          <circle cx="38" cy="52" r="6.5" fill="#000" />
          <circle cx="40" cy="49" r="2.5" fill="#FFFFFF" />
          <circle cx="36" cy="54" r="1.5" fill="#FFFFFF" />
          
          {/* Right Eye */}
          <circle cx="62" cy="52" r="6.5" fill="#000" />
          <circle cx="64" cy="49" r="2.5" fill="#FFFFFF" />
          <circle cx="60" cy="54" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Cute happy smiling mouth */}
        <path d="M 46 64 Q 50 68 54 64" stroke="#000" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Kawaii pink blush cheeks */}
        <circle cx="28" cy="59" r="3.5" fill="#F472B6" opacity="0.65" />
        <circle cx="72" cy="59" r="3.5" fill="#F472B6" opacity="0.65" />

        <defs>
          <linearGradient id="slimeGradient" x1="50" y1="15" x2="50" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  if (hasError) {
    return renderFallbackSlime();
  }

  // We load the restored, high-resolution original slime mascot image from Cloudinary directly!
  // To make it look incredibly sharp and clear, we set high-contrast rendering properties.
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className}`} 
      style={{ 
        ...style,
        background: "transparent",
        display: 'flex'
      }}
    >
      <img 
        src={nexoraAppIcon} 
        alt={alt}
        className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(59,130,246,0.2)] select-none"
        style={{
          imageRendering: "auto",
          WebkitFontSmoothing: "antialiased"
        }}
        referrerPolicy="no-referrer"
        onError={() => {
          console.warn("MascotImage: Cloudinary URL failed to load under sandbox, switching to gorgeous fallback slime SVG.");
          setHasError(true);
        }}
      />
    </div>
  );
}
