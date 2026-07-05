import React from 'react';

export interface MascotV2Props {
  className?: string;
  isSmiling?: boolean; // We can control if it smiles or concentrates, or let the CSS timeline toggle it automatically!
}

export const MascotV2 = React.memo(({ className, isSmiling }: MascotV2Props) => {
  return (
    <div className={`relative select-none flex items-center justify-center ${className || ''}`} style={{ width: '100%', height: '100%' }}>
      {/* SCOPED CSS ANIMATIONS AS REQUESTED */}
      <style>{`
        /* =========================================
           MASTER ANIMATION TIMELINES (7s Loop)
           ========================================= */
        
        /* 1. Body idle breathing */
        @keyframes bodyBreathe {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          50% { transform: scale(1.02, 0.98) translateY(4px); }
        }

        /* 2. Halo float */
        @keyframes haloFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }

        /* 3. Blinking (Independent Loop) */
        @keyframes blink {
          0%, 46%, 49%, 100% { transform: scaleY(1); }
          47.5% { transform: scaleY(0.1); }
        }

        /* 4. Face Direction (Looking down at book vs up at user) */
        @keyframes faceDirection {
          0%, 48% { transform: translate(-18px, 22px); } /* Looking down at book */
          55%, 85% { transform: translate(0px, 0px); }   /* Looking up at user */
          90%, 100% { transform: translate(-18px, 22px); }
        }

        /* 5. Mouth Swapping (Concentrated vs Smile) */
        @keyframes toggleSmile {
          0%, 48% { opacity: 0; transform: scale(0.8); }
          55%, 85% { opacity: 1; transform: scale(1); }
          90%, 100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes toggleConc {
          0%, 48% { opacity: 1; transform: scale(1); }
          55%, 85% { opacity: 0; transform: scale(0.8); }
          90%, 100% { opacity: 1; transform: scale(1); }
        }

        /* 6. Pen Writing Physics */
        @keyframes writeMotion {
          /* Rapid writing jitters */
          0%, 8%, 16%, 24%, 32%, 40%, 48% { transform: translate(0px, 0px) rotate(0deg); }
          4%, 20%, 36% { transform: translate(-5px, 3px) rotate(-4deg); }
          12%, 28%, 44% { transform: translate(4px, -2px) rotate(3deg); }
          
          /* Pause, lift pen, and look up */
          50% { transform: translate(0px, 0px) rotate(0deg); }
          55%, 85% { transform: translate(15px, -20px) rotate(15deg); }
          
          /* Return pen to book and resume writing */
          90% { transform: translate(0px, 0px) rotate(0deg); }
          94% { transform: translate(-5px, 3px) rotate(-4deg); }
          97% { transform: translate(4px, -2px) rotate(3deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }

        /* Assigning Keyframes */
        .v2-body-group { transform-origin: 200px 320px; animation: bodyBreathe 3s ease-in-out infinite; }
        .v2-halo { transform-origin: 200px 70px; animation: haloFloat 4s ease-in-out infinite; }
        .v2-eyes-blink { transform-origin: 200px 170px; animation: blink 4s linear infinite; }
        
        .v2-face-anim { animation: faceDirection 7s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .v2-mouth-smiling { transform-origin: 200px 190px; animation: toggleSmile 7s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .v2-mouth-concentrated { transform-origin: 200px 190px; animation: toggleConc 7s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        
        /* Anchored exactly at the pen tip so it rotates naturally */
        .v2-right-arm-anim { transform-origin: 145px 255px; animation: writeMotion 7s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}</style>

      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[320px] max-h-[320px] overflow-visible">
        <defs>
          {/* Gradients for the glowing jelly look */}
          <radialGradient id="bodyGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#bceaff" />
            <stop offset="60%" stopColor="#38b6ff" />
            <stop offset="100%" stopColor="#0066cc" />
          </radialGradient>

          <radialGradient id="handGlow" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#bceaff" />
            <stop offset="100%" stopColor="#0088ff" />
          </radialGradient>

          <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#73d2ff" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#cff0ff" stopOpacity="1"/>
            <stop offset="100%" stopColor="#73d2ff" stopOpacity="0.8"/>
          </linearGradient>
          
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#0066cc" floodOpacity="0.2"/>
          </filter>
        </defs>

        {/* Floor shadow */}
        <ellipse cx="200" cy="330" rx="130" ry="15" fill="#0066cc" opacity="0.15" filter="blur(5px)" />

        {/* HALO */}
        <g className="v2-halo">
          <ellipse cx="200" cy="70" rx="60" ry="12" fill="none" stroke="url(#haloGrad)" strokeWidth="6" />
          <ellipse cx="200" cy="70" rx="55" ry="8" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8"/>
        </g>

        {/* MAIN ANIMATED BODY GROUP */}
        <g className="v2-body-group" filter="url(#shadow)">
          
          {/* Cat Ears */}
          <path d="M 110,130 Q 90,80 140,110 Z" fill="url(#bodyGlow)" stroke="#0088ff" strokeWidth="2"/>
          <path d="M 290,130 Q 310,80 260,110 Z" fill="url(#bodyGlow)" stroke="#0088ff" strokeWidth="2"/>

          {/* Main Blob Body */}
          <path d="M 60,220 
                   C 60,120 120,90 200,90 
                   C 280,90 340,120 340,220 
                   C 340,320 280,330 200,330 
                   C 120,330 60,320 60,220 Z" 
                fill="url(#bodyGlow)" />
          
          {/* Bright top highlight */}
          <path d="M 120,110 C 160,95 240,95 280,110 C 260,130 140,130 120,110 Z" fill="#ffffff" opacity="0.4" filter="blur(4px)" />

          {/* Letter N (Shifted slightly right to balance the book) */}
          <text x="235" y="285" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="45" fill="#ffffff" textAnchor="middle" letterSpacing="-2px" filter="drop-shadow(0px 2px 4px rgba(0,100,200,0.5))">N</text>

          {/* DYNAMIC FACE GROUP (Moves down to look at book, moves up to look at user) */}
          <g className="v2-face-anim">
            
            {/* Blinking Eyes */}
            <g className="v2-eyes-blink">
              {/* Left Eye */}
              <circle cx="155" cy="170" r="14" fill="#001a33" />
              <circle cx="150" cy="165" r="5" fill="#ffffff" />
              <circle cx="158" cy="173" r="2" fill="#ffffff" />
              
              {/* Right Eye */}
              <circle cx="245" cy="170" r="14" fill="#001a33" />
              <circle cx="240" cy="165" r="5" fill="#ffffff" />
              <circle cx="248" cy="173" r="2" fill="#ffffff" />
            </g>

            {/* Writing Mouth (Concentrated line) */}
            <g className="v2-mouth-concentrated" style={isSmiling === true ? { display: 'none' } : undefined}>
              <path d="M 194,188 Q 200,192 206,188" fill="none" stroke="#001a33" strokeWidth="3" strokeLinecap="round"/>
            </g>

            {/* Smiling Mouth (Breaks 4th wall) */}
            <g className="v2-mouth-smiling" style={isSmiling === false ? { display: 'none' } : undefined}>
              <path d="M 190,185 Q 200,195 210,185" fill="none" stroke="#001a33" strokeWidth="3" strokeLinecap="round"/>
              <path d="M 190,185 C 190,200 210,200 210,185 Z" fill="#ff4d4d" />
              <path d="M 194,190 C 194,198 206,198 206,190 Z" fill="#b30000" /> 
            </g>
            
          </g>

          {/* LEFT ARM & BOOK DIRECTLY ON BELLY */}
          <g transform="translate(120, 275) scale(0.85) rotate(-5)">
            {/* Book Core */}
            <path d="M -50,-20 L 30,-30 L 50,20 L -30,30 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/> 
            <path d="M -45,-25 L 35,-35 L 55,15 L -25,25 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1"/> 
            <path d="M -40,-30 L 40,-40 L 60,10 L -20,20 Z" fill="#3498db" stroke="#2980b9" strokeWidth="2"/> 
            
            {/* Text Lines on Pages */}
            <line x1="-30" y1="-20" x2="20" y2="-25" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
            <line x1="-25" y1="-10" x2="25" y2="-15" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
            <line x1="-20" y1="0" x2="30" y2="-5" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
            <line x1="-15" y1="10" x2="15" y2="5" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
            
            {/* Left Arm holding the left side of the book */}
            <ellipse cx="-45" cy="-5" rx="22" ry="28" fill="url(#handGlow)" stroke="#0088ff" strokeWidth="2" transform="rotate(-20 -45 -5)"/>
          </g>

          {/* RIGHT ARM & PEN (Animates exactly over the book) */}
          <g className="v2-right-arm-anim">
            <g transform="translate(145, 255) scale(0.8)">
              {/* Pen Body (Angled to fit the hand) */}
              <path d="M 8,-8 L 40,-75 L 58,-65 L 25,2 Z" fill="#f1c40f" stroke="#d4ac0d" strokeWidth="2" strokeLinejoin="round"/>
              {/* Pen Tip */}
              <path d="M 8,-8 L 0,0 L 25,2 Z" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="1" strokeLinejoin="round"/>
              {/* Ink Dot */}
              <circle cx="0" cy="0" r="2.5" fill="#2c3e50"/>
              
              {/* Right Arm gripping the pen */}
              <ellipse cx="38" cy="-35" rx="22" ry="28" fill="url(#handGlow)" stroke="#0088ff" strokeWidth="2" transform="rotate(35 38 -35)"/>
            </g>
          </g>

          {/* Floating ambient sparkles */}
          <circle cx="90" cy="110" r="3" fill="#ffffff" opacity="0.6"/>
          <path d="M 310,130 L 315,120 L 320,130 L 310,130 Z" fill="#ffffff" opacity="0.8"/>
          <circle cx="280" cy="230" r="2" fill="#ffffff" opacity="0.5"/>
          <circle cx="100" cy="240" r="2.5" fill="#ffffff" opacity="0.7"/>

        </g>
      </svg>
    </div>
  );
});

MascotV2.displayName = 'MascotV2';
