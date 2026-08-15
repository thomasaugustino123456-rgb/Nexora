import React from 'react';
import nexoraAppIconImg from '../assets/images/nexora_app_icon.png';

interface MascotImageProps {
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  theme?: string;
}

export function MascotImage({ className = "w-16 h-16 rounded-2xl", alt = "Nexora Mascot Logo", style }: MascotImageProps) {
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
        src={nexoraAppIconImg} 
        alt={alt}
        className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(59,130,246,0.2)] select-none pointer-events-none"
        style={{
          imageRendering: "auto",
          WebkitFontSmoothing: "antialiased"
        }}
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="sync"
        // @ts-ignore
        fetchPriority="high"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== "/nexora_mascot_new.png" && !target.src.endsWith("/nexora_mascot_new.png")) {
            target.src = "/nexora_mascot_new.png";
          }
        }}
      />
    </div>
  );
}

