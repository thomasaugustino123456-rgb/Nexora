import React from 'react';
import { motion } from 'motion/react';

export function GoldenTrophy() {
  return (
    <div className="relative flex items-center justify-center">
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes sparklePulse { 0%, 100% { transform: scale(1) translateY(0); opacity: 0.8; } 50% { transform: scale(1.15) translateY(-5px); opacity: 1; } }
        @keyframes glowingEffect { 0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 200, 0, 0.4)); } 50% { filter: drop-shadow(0 0 35px rgba(255, 200, 0, 1)); } }
        .animate-rays { transform-origin: 200px 200px; animation: spin 15s linear infinite; }
        .animate-glow { animation: glowingEffect 2s ease-in-out infinite; }
        .sparkle-pulse { animation: sparklePulse 2s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <g id="star">
            <path d="M 0,-25 Q 0,0 25,0 Q 0,0 0,25 Q 0,0 -25,0 Q 0,0 0,-25 Z" />
          </g>
          <path id="ray" d="M190,200 L120,-100 L280,-100 Z" fill="#FFC800" opacity="0.25" />
        </defs>

        <g className="animate-rays">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <use key={deg} href="#ray" transform={`rotate(${deg} 200 200)`} />
          ))}
        </g>

        <motion.use 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
          href="#star" x="80" y="80" className="sparkle-pulse" fill="#FF9600" 
        />
        <motion.use 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
          href="#star" x="320" y="100" className="sparkle-pulse" fill="#FFE866" 
        />
        <motion.use 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }}
          href="#star" x="100" y="280" className="sparkle-pulse" fill="#FFC800" 
        />
        <motion.use 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }}
          href="#star" x="310" y="270" className="sparkle-pulse" fill="#FF9600" 
        />

        <motion.g 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          style={{ transformOrigin: '200px 200px' }}
        >
          <motion.g animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <g className="animate-glow">
              <path d="M 120,150 C 10,140 10,270 120,240" fill="none" stroke="#E5A900" strokeWidth="26" strokeLinecap="round"/>
              <path d="M 120,150 C 10,140 10,270 120,240" fill="none" stroke="#FFC800" strokeWidth="18" strokeLinecap="round"/>
              <path d="M 280,150 C 390,140 390,270 280,240" fill="none" stroke="#E5A900" strokeWidth="26" strokeLinecap="round"/>
              <path d="M 280,150 C 390,140 390,270 280,240" fill="none" stroke="#FFC800" strokeWidth="18" strokeLinecap="round"/>

              <rect x="175" y="235" width="50" height="60" fill="#CC8900" rx="5" />
              <rect x="175" y="240" width="50" height="50" fill="#FFC800" rx="5" />
              <rect x="180" y="240" width="15" height="50" fill="#FFE866" rx="3" />

              <rect x="110" y="325" width="180" height="40" rx="12" fill="#8E5018" />
              <rect x="110" y="315" width="180" height="35" rx="12" fill="#AF6A29" />
              <rect x="130" y="295" width="140" height="35" rx="10" fill="#8E5018" />
              <rect x="130" y="285" width="140" height="30" rx="10" fill="#AF6A29" />

              <path d="M 100,140 A 100,100 0 0,0 300,140 A 100,100 0 0,1 100,140 Z" fill="#E5A900"/>
              <path d="M 100,140 A 100,100 0 0,0 300,140 Z" fill="#FFC800"/>
              <path d="M 200,240 A 100,100 0 0,0 300,140 L 280,140 A 80,80 0 0,1 200,220 Z" fill="#E5A900" opacity="0.8"/>
              <path d="M 115,155 A 85,85 0 0,0 170,230 A 90,90 0 0,1 115,155 Z" fill="#FFFFFF" opacity="0.5"/>

              <ellipse cx="200" cy="140" rx="100" ry="30" fill="#FFC800" />
              <ellipse cx="200" cy="138" rx="94" ry="26" fill="#FFE866" />
              <ellipse cx="200" cy="142" rx="88" ry="22" fill="#CC8900" />

              <g transform="translate(0, 15)">
                <polygon points="200,155 212,175 235,180 218,198 222,220 200,210 178,220 182,198 165,180 188,175" fill="#E5A900" />
                <polygon points="200,150 212,170 235,175 218,193 222,215 200,205 178,215 182,193 165,175 188,170" fill="#FFF" />
              </g>
            </g>
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}

export function IceTrophy() {
  return (
    <div className="relative flex items-center justify-center">
      <style>{`
        @keyframes coldPulse { 0%, 100% { filter: drop-shadow(0 0 5px rgba(173, 216, 230, 0.3)); } 50% { filter: drop-shadow(0 0 15px rgba(200, 240, 255, 0.6)); } }
        .animate-cold { animation: coldPulse 3s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <motion.g 
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: '200px 200px' }}
        >
          <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <g className="animate-cold">
              <path d="M 120,150 C 10,140 10,270 120,240" fill="none" stroke="#7CB9E8" strokeWidth="26" strokeLinecap="round"/>
              <path d="M 120,150 C 10,140 10,270 120,240" fill="none" stroke="#B0E0E6" strokeWidth="18" strokeLinecap="round"/>
              <path d="M 280,150 C 390,140 390,270 280,240" fill="none" stroke="#7CB9E8" strokeWidth="26" strokeLinecap="round"/>
              <path d="M 280,150 C 390,140 390,270 280,240" fill="none" stroke="#B0E0E6" strokeWidth="18" strokeLinecap="round"/>

              <rect x="175" y="235" width="50" height="60" fill="#5D8AA8" rx="5" />
              <rect x="175" y="240" width="50" height="50" fill="#89CFF0" rx="5" />
              <rect x="180" y="240" width="15" height="50" fill="#F0FFFF" rx="3" opacity="0.6" />

              <rect x="110" y="325" width="180" height="40" rx="12" fill="#4B5320" opacity="0.8" />
              <rect x="110" y="315" width="180" height="35" rx="12" fill="#5F6366" />
              <rect x="130" y="295" width="140" height="35" rx="10" fill="#4B5320" opacity="0.8" />
              <rect x="130" y="285" width="140" height="30" rx="10" fill="#5F6366" />

              <path d="M 100,140 A 100,100 0 0,0 300,140 A 100,100 0 0,1 100,140 Z" fill="#5D8AA8"/>
              <path d="M 100,140 A 100,100 0 0,0 300,140 Z" fill="#89CFF0"/>
              <path d="M 200,240 A 100,100 0 0,0 300,140 L 280,140 A 80,80 0 0,1 200,220 Z" fill="#5D8AA8" opacity="0.6"/>
              <path d="M 115,155 A 85,85 0 0,0 170,230 A 90,90 0 0,1 115,155 Z" fill="#FFFFFF" opacity="0.4"/>

              <ellipse cx="200" cy="140" rx="100" ry="30" fill="#89CFF0" />
              <ellipse cx="200" cy="138" rx="94" ry="26" fill="#F0FFFF" />
              <ellipse cx="200" cy="142" rx="88" ry="22" fill="#5D8AA8" />

              <g transform="translate(0, 15)">
                <polygon points="200,150 225,185 200,220 175,185" fill="#FFFFFF" />
                <polygon points="200,158 215,185 200,212 185,185" fill="#89CFF0" opacity="0.5" />
              </g>
              
              <circle cx="150" cy="180" r="4" fill="white" opacity="0.6" />
              <circle cx="250" cy="210" r="3" fill="white" opacity="0.4" />
              <circle cx="210" cy="160" r="5" fill="white" opacity="0.5" />
            </g>
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}

export function BrokenTrophy() {
  return (
    <div className="relative flex items-center justify-center">
      <style>{`
        @keyframes anticipationShake { 0%, 20% { transform: translateX(0); } 22%, 26%, 30% { transform: translateX(-2px) rotate(-1deg); } 24%, 28%, 32% { transform: translateX(2px) rotate(1deg); } 34%, 100% { transform: translateX(0); } }
        @keyframes breakAndFallLeft { 0%, 35% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 45% { transform: translate(-15px, -10px) rotate(-10deg); } 100% { transform: translate(-60px, 180px) rotate(-45deg); opacity: 0.8; } }
        @keyframes breakAndFallRight { 0%, 35% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 45% { transform: translate(20px, -5px) rotate(15deg); } 100% { transform: translate(80px, 200px) rotate(60deg); opacity: 0.8; } }
        @keyframes breakAndFallTop { 0%, 35% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 50% { transform: translate(5px, -20px) rotate(5deg); } 100% { transform: translate(10px, 220px) rotate(20deg); opacity: 0.6; } }
        @keyframes crackSlow { 0%, 25% { stroke-dashoffset: 100; opacity: 0; } 35% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
        .trophy-group { animation: anticipationShake 5s ease-in-out infinite; transform-origin: center bottom; }
        .piece-left { animation: breakAndFallLeft 5s ease-in infinite; transform-origin: center; }
        .piece-right { animation: breakAndFallRight 5s ease-in infinite; transform-origin: center; }
        .piece-top { animation: breakAndFallTop 5s ease-in infinite; transform-origin: center; }
        .crack-line { stroke: #333; stroke-width: 4; stroke-linecap: round; fill: none; stroke-dasharray: 100; animation: crackSlow 5s ease-in infinite; }
      `}</style>
      <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <g className="trophy-group">
          <g>
            <rect x="175" y="235" width="50" height="60" fill="#9E9E9E" rx="5" />
            <rect x="175" y="240" width="50" height="50" fill="#BDBDBD" rx="5" />
            <rect x="110" y="325" width="180" height="40" rx="12" fill="#616161" />
            <rect x="110" y="315" width="180" height="35" rx="12" fill="#757575" />
          </g>

          <g className="piece-top">
            <ellipse cx="200" cy="140" rx="100" ry="30" fill="#BDBDBD" />
            <ellipse cx="200" cy="142" rx="88" ry="22" fill="#757575" />
          </g>

          <g className="piece-left">
            <path d="M 120,150 C 10,140 10,210 50,220" fill="none" stroke="#BDBDBD" strokeWidth="26" strokeLinecap="round"/>
            <path d="M 120,150 C 10,140 10,210 50,220" fill="none" stroke="#E0E0E0" strokeWidth="18" strokeLinecap="round"/>
            <path d="M 100,140 A 100,100 0 0,0 200,240 L 200,140 Z" fill="#9E9E9E"/>
            <path d="M 200,165 L 188,185 L 165,190 L 182,208 L 200,220 L 200,165" fill="#BDBDBD" />
          </g>

          <g className="piece-right">
            <path d="M 280,150 C 390,140 390,270 280,240" fill="none" stroke="#BDBDBD" strokeWidth="26" strokeLinecap="round"/>
            <path d="M 280,150 C 390,140 390,270 280,240" fill="none" stroke="#E0E0E0" strokeWidth="18" strokeLinecap="round"/>
            <path d="M 200,240 A 100,100 0 0,0 300,140 L 200,140 Z" fill="#BDBDBD"/>
            <path d="M 200,165 L 212,185 L 235,190 L 218,208 L 200,220 L 200,165" fill="#E0E0E0" />
          </g>

          <path d="M 200,140 L 215,180 L 195,210 L 205,240" className="crack-line" />
        </g>
      </svg>
    </div>
  );
}

export async function playTrophySound(type: 'golden' | 'ice' | 'broken') {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  
  // Resume context in case it was suspended by browser policy
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const startTime = ctx.currentTime + 0.05; // Small buffer

  if (type === 'golden') {
    // Triumphant shimmer
    const playNote = (freq: number, time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 1);
    };
    playNote(523.25, startTime); // C5
    playNote(659.25, startTime + 0.15); // E5
    playNote(783.99, startTime + 0.3); // G5
    playNote(1046.50, startTime + 0.45); // C6
  } else if (type === 'ice') {
    // Freezing crackle
    for (let i = 0; i < 12; i++) {
      const time = startTime + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(2000 + Math.random() * 3000, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  } else if (type === 'broken') {
    // Shattering
    for (let i = 0; i < 25; i++) {
      const time = startTime + Math.random() * 0.6;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100 + Math.random() * 1200, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.2);
    }
  }
}
