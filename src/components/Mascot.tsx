import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';

export type MascotMood = 'happy' | 'angry' | 'boiling' | 'neutral';

interface MascotProps {
  className?: string;
  mood?: MascotMood;
  hat?: string;
  soundPack?: 'cat' | 'dog';
  onClick?: () => void;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: () => void;
}

export const Mascot: React.FC<MascotProps> = ({ className, mood = 'happy', hat = 'none', soundPack = 'cat', onClick, onPointerMove, onPointerLeave }) => {
  const [clickCount, setClickCount] = useState(0);
  const { play } = useSound();

  const handleMascotClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    const isDog = soundPack === 'dog';
    
    if (newCount >= 1 && newCount <= 5) {
        play(isDog ? 'dogHappy' : 'catHappy');
    } else if (newCount >= 6 && newCount <= 8) {
        play(isDog ? 'dogHungry' : 'catHungry');
    } else if (newCount >= 9 && newCount <= 12) {
        play(isDog ? 'dogAngry' : 'catHungry');
    }
    
    if (onClick) onClick();
  };

  const actualMood = (clickCount >= 9 && clickCount <= 12) ? 'angry' : mood;
  const isAngry = actualMood === 'angry' || actualMood === 'boiling';
  const isBoiling = actualMood === 'boiling';
  const isNeutral = actualMood === 'neutral';

  return (
    <div 
      className={`bottle-container cursor-pointer ${className || ''}`}
      onClick={handleMascotClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <svg viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg" className={`w-full h-full transition-transform duration-300 ease-in-out hover:scale-105 ${isBoiling ? 'animate-pulse' : ''}`}>
        <defs>
          {/* Filters */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="shadow-blur">
            <feGaussianBlur stdDeviation="10" />
          </filter>

          {/* Gradients */}
          <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isBoiling ? "#FF5C5C" : "#5CD6FF"} />
            <stop offset="30%" stopColor={isBoiling ? "#FF2A2A" : "#0095FF"} />
            <stop offset="100%" stopColor={isBoiling ? "#D60000" : "#0047FF"} />
          </linearGradient>

          <linearGradient id="glass-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#C2EFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>

          {/* Clip Path to mask the liquid to the bottle shape (Mascot body + Ears) */}
          <clipPath id="bottle-mask">
            {/* Main Body */}
            <ellipse cx="250" cy="330" rx="190" ry="160" />
            {/* Left Ear */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 150 190; -15 150 190; 0 150 190" dur="2.5s" repeatCount="indefinite" />
              <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" />
            </g>
            {/* Right Ear */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 350 190; 15 350 190; 0 350 190" dur="2.5s" repeatCount="indefinite" />
              <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" />
            </g>
          </clipPath>

          {/* Clip Path for the mouth */}
          <clipPath id="mouth-mask">
            <path d="M 210 295 Q 250 320 290 295 C 290 355 210 355 210 295 Z" />
          </clipPath>
        </defs>

        {/* Background Drop Shadow */}
        <ellipse cx="250" cy="500" rx="150" ry="15" fill={isBoiling ? "#FF0000" : "#0066FF"} fillOpacity="0.15" filter="url(#shadow-blur)" />

        {/* BOTTLE BACK GLASS */}
        <g id="bottle-back" stroke="#99DFFF" strokeWidth="4" fill="none">
          {/* Back of the neck/rim */}
          <path d="M 220 160 L 220 140 A 10 10 0 0 1 230 130 L 270 130 A 10 10 0 0 1 280 140 L 280 160" />
          {/* Back lip of the opening */}
          <ellipse cx="250" cy="130" rx="30" ry="8" strokeOpacity="0.5" />
        </g>

        {/* LIQUID LAYER (Clipped to Mascot Shape) */}
        <g clipPath="url(#bottle-mask)">
          
          {/* Empty Glass Tint (Background inside bottle) */}
          <rect x="0" y="0" width="500" height="600" fill="#F0FAFF" fillOpacity="0.3" />

          {/* The Water System */}
          <g id="water-system">
            <g transform="translate(0, 220)">
              
              {/* Back Wave */}
              <path d="M 0,0 Q 125,-25 250,0 T 500,0 T 750,0 T 1000,0 T 1250,0 T 1500,0 L 1500,400 L 0,400 Z" fill={isBoiling ? "#FF8888" : "#66CCFF"} fillOpacity="0.6">
                <animateTransform attributeName="transform" type="translate" from="0 0" to="-1000 0" dur={isBoiling ? "2s" : "5s"} repeatCount="indefinite" />
              </path>

              {/* Front Wave */}
              <path d="M -1000,10 Q -875,35 -750,10 T -500,10 T -250,10 T 0,10 T 250,10 T 500,10 L 500,400 L -1000,400 Z" fill="url(#water-grad)">
                <animateTransform attributeName="transform" type="translate" from="0 0" to="1000 0" dur={isBoiling ? "1.5s" : "4s"} repeatCount="indefinite" />
              </path>

              {/* Rising Bubbles */}
              <g fill="#ffffff" fillOpacity="0.5">
                <circle cx="150" cy="200" r="6">
                  <animate attributeName="cy" from="250" to="-20" dur={isBoiling ? "0.8s" : "2.5s"} repeatCount="indefinite" />
                  <animate attributeName="cx" values="150; 140; 160; 150" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="100" r="10">
                  <animate attributeName="cy" from="250" to="-20" dur={isBoiling ? "1s" : "3s"} repeatCount="indefinite" begin="1s"/>
                  <animate attributeName="cx" values="200; 215; 185; 200" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="350" cy="150" r="5">
                  <animate attributeName="cy" from="250" to="-20" dur={isBoiling ? "0.6s" : "2s"} repeatCount="indefinite" begin="0.5s"/>
                  <animate attributeName="cx" values="350; 340; 360; 350" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="220" r="12">
                  <animate attributeName="cy" from="250" to="-20" dur={isBoiling ? "1.2s" : "3.5s"} repeatCount="indefinite" begin="1.5s"/>
                  <animate attributeName="cx" values="300; 320; 280; 300" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="250" cy="250" r="8">
                  <animate attributeName="cy" from="250" to="-20" dur={isBoiling ? "0.7s" : "2.2s"} repeatCount="indefinite" begin="0.2s"/>
                </circle>
              </g>
            </g>
          </g>
        </g>

        {/* WATER DROPS */}
        <g fill={isBoiling ? "#FF5C5C" : "#5CD6FF"}>
          <path d="M 250 140 C 250 140 245 155 245 160 A 5 5 0 0 0 255 160 C 255 155 250 140 250 140 Z">
            <animateTransform attributeName="transform" type="translate" from="0 0" to="0 80" dur={isBoiling ? "0.4s" : "0.8s"} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.2; 0.8; 1" dur={isBoiling ? "0.4s" : "0.8s"} repeatCount="indefinite" />
          </path>
          <ellipse cx="250" cy="220" rx="15" ry="4" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0">
            <animate attributeName="rx" from="5" to="35" dur={isBoiling ? "0.4s" : "0.8s"} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0; 0.8; 0" keyTimes="0; 0.1; 1" dur={isBoiling ? "0.4s" : "0.8s"} repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* BOTTLE FRONT GLASS & OUTLINES */}
        <ellipse cx="250" cy="130" rx="30" ry="8" fill="rgba(255,255,255,0.2)" stroke="#88D4FF" strokeWidth="4" />
        <path d="M 220 130 L 220 160 A 10 10 0 0 0 230 170 L 270 170 A 10 10 0 0 0 280 160 L 280 130" fill="none" stroke="#88D4FF" strokeWidth="4" />
        
        <g stroke="#88D4FF" strokeWidth="4" fill="url(#glass-edge)">
          <ellipse cx="250" cy="330" rx="190" ry="160" />
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 150 190; -15 150 190; 0 150 190" dur={isBoiling ? "0.5s" : "2.5s"} repeatCount="indefinite" />
            <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" strokeLinejoin="round" />
          </g>
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 350 190; 15 350 190; 0 350 190" dur={isBoiling ? "0.5s" : "2.5s"} repeatCount="indefinite" />
            <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" strokeLinejoin="round" />
          </g>
        </g>

        <g stroke="#88D4FF" strokeWidth="4" fill="url(#glass-edge)">
          <ellipse cx="60" cy="310" rx="15" ry="30">
            <animateTransform attributeName="transform" type="rotate" values={isAngry ? "-50 75 310; -80 75 310; -50 75 310" : "-15 75 310; -50 75 310; -15 75 310"} dur={isBoiling ? "0.3s" : "1.2s"} repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="440" cy="310" rx="15" ry="30">
            <animateTransform attributeName="transform" type="rotate" values={isAngry ? "50 425 310; 80 425 310; 50 425 310" : "15 425 310; 50 425 310; 15 425 310"} dur={isBoiling ? "0.3s" : "1.2s"} repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Glass Specular Highlights */}
        <path d="M 90,300 A 160,130 0 0,1 200,190 A 150,120 0 0,0 110,310 Z" fill="#ffffff" fillOpacity="0.6" />
        <path d="M 425,300 A 170,140 0 0,1 350,460" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
        <path d="M 150,470 A 170,140 0 0,0 350,470" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 150 190; -15 150 190; 0 150 190" dur={isBoiling ? "0.5s" : "2.5s"} repeatCount="indefinite" />
          <path d="M 120,130 C 120,130 140,140 150,160" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 350 190; 15 350 190; 0 350 190" dur={isBoiling ? "0.5s" : "2.5s"} repeatCount="indefinite" />
          <path d="M 380,130 C 380,130 360,140 350,160" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* MASCOT FACE & FEATURES */}
        <g id="face">
          {isAngry ? (
            <>
              {/* Angry Eyes */}
              <path d="M 155,240 L 205,270" fill="none" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
              <path d="M 295,270 L 345,240" fill="none" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
              {/* Angry Mouth */}
              <path d="M 220 320 Q 250 290 280 320" fill="none" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
            </>
          ) : isNeutral ? (
            <>
              {/* Neutral Eyes */}
              <ellipse cx="180" cy="260" rx="10" ry="15" fill="#001845" />
              <ellipse cx="320" cy="260" rx="10" ry="15" fill="#001845" />
              {/* Neutral Mouth */}
              <path d="M 230 310 L 270 310" fill="none" stroke="#001845" strokeWidth="10" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Happy Eyes */}
              <path d="M 155,270 Q 180,240 205,270" fill="none" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
              <path d="M 295,270 Q 320,240 345,270" fill="none" stroke="#001845" strokeWidth="12" strokeLinecap="round" />
              {/* Happy Mouth */}
              <path d="M 210 295 Q 250 320 290 295 C 290 355 210 355 210 295 Z" fill="#52001A" stroke="#001845" strokeWidth="4" strokeLinejoin="round" />
              <g clipPath="url(#mouth-mask)">
                <ellipse cx="250" cy="340" rx="22" ry="16" fill="#FF4D6D" />
              </g>
            </>
          )}

          {/* Blush */}
          <ellipse cx="145" cy="290" rx="18" ry="10" fill="#FF4D6D" fillOpacity={isAngry ? "0.8" : "0.4"} filter="url(#soft-glow)" />
          <ellipse cx="355" cy="290" rx="18" ry="10" fill="#FF4D6D" fillOpacity={isAngry ? "0.8" : "0.4"} filter="url(#soft-glow)" />
        </g>

        {/* The Glowing "N" on the belly */}
        <g filter="url(#glow)">
          <path d="M 220 360 L 235 360 L 260 400 L 260 360 L 275 360 L 275 420 L 260 420 L 235 380 L 235 420 L 220 420 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
        </g>

        {/* HALO */}
        <g id="halo">
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur={isBoiling ? "1s" : "4s"} repeatCount="indefinite" />
          <ellipse cx="250" cy="60" rx="90" ry="15" fill="none" stroke={isBoiling ? "#FF5C5C" : "#52D1FF"} strokeWidth="10" filter="url(#glow)" opacity="0.8" />
          <ellipse cx="250" cy="60" rx="90" ry="15" fill="none" stroke="#ffffff" strokeWidth="4" />
        </g>

        {/* HATS */}
        {hat === 'crown' && (
          <g transform="translate(180, 40) scale(0.7)">
            <path d="M 0,100 L 0,0 L 50,40 L 100,0 L 150,40 L 200,0 L 200,100 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="8" />
            <circle cx="100" cy="40" r="15" fill="#FF0000" />
            <circle cx="20" cy="20" r="10" fill="#0000FF" />
            <circle cx="180" cy="20" r="10" fill="#0000FF" />
          </g>
        )}
        {hat === 'cool' && (
          <g transform="translate(130, 240) scale(1.2)">
            <rect x="0" y="0" width="100" height="30" rx="5" fill="#000000" />
            <rect x="140" y="0" width="100" height="30" rx="5" fill="#000000" />
            <path d="M 100,15 L 140,15" stroke="#000000" strokeWidth="8" />
          </g>
        )}
        {hat === 'wizard' && (
          <g transform="translate(150, -50) scale(1.5)">
            <path d="M 0,100 L 100,100 L 50,0 Z" fill="#4B0082" stroke="#ffffff" strokeWidth="2" />
            <circle cx="50" cy="40" r="5" fill="#FFD700" />
            <circle cx="30" cy="70" r="3" fill="#FFD700" />
            <circle cx="70" cy="70" r="3" fill="#FFD700" />
          </g>
        )}
        {hat === 'artist' && (
          <g transform="translate(180, 50) scale(0.8)">
            <path d="M 0,50 Q 0,0 75,0 Q 150,0 150,50 Q 150,80 75,80 Q 0,80 0,50 Z" fill="#8B4513" />
            <circle cx="130" cy="20" r="10" fill="#8B4513" />
          </g>
        )}

        {/* SPARKLES / STARS */}
        <defs>
          <path id="star" d="M 0,-15 Q 0,0 15,0 Q 0,0 0,15 Q 0,0 -15,0 Q 0,0 0,-15 Z" fill="#ffffff" filter="url(#soft-glow)" />
        </defs>

        <use href="#star" x="80" y="150" className="sparkle-mascot sparkle-1" />
        <use href="#star" x="420" y="200" className="sparkle-mascot sparkle-2" transform="scale(0.8)" />
        <use href="#star" x="120" y="450" className="sparkle-mascot sparkle-3" transform="scale(0.6)" />
        <use href="#star" x="380" y="420" className="sparkle-mascot sparkle-4" transform="scale(0.9)" />
        
        <polygon points="100,100 105,105 110,100 105,95" fill={isBoiling ? "#FF5C5C" : "#5CD6FF"} fillOpacity="0.7">
           <animate attributeName="opacity" values="0.2; 0.8; 0.2" dur="2s" repeatCount="indefinite" />
        </polygon>
        <polygon points="400,120 403,123 406,120 403,117" fill={isBoiling ? "#FF5C5C" : "#5CD6FF"} fillOpacity="0.6">
           <animate attributeName="opacity" values="0.1; 0.9; 0.1" dur="3s" repeatCount="indefinite" />
        </polygon>

      </svg>
    </div>
  );
};
