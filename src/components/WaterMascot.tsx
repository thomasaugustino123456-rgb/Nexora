import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaterMascotProps {
  className?: string;
  progress: number; // 0 to 1 (0% to 100%)
}

interface Ripple {
  id: number;
  cx: number;
  cy: number;
  scaleMax: number;
}

export const WaterMascot = React.memo(({ className, progress }: WaterMascotProps) => {
  const [tilt, setTilt] = useState(0); // target tilt in degrees (-15 to 15)
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const lastProgressRef = useRef(progress);

  // Compute the current water level height (fillY)
  // 480 is the dry bottom of the mascot-bottle container
  // 170 is near the top neck of the container
  const fillY = 485 - (progress * 300);

  // Gyroscope / Accel & Desktop Hover Tilt Interaction
  useEffect(() => {
    let active = true;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!active) return;
      if (e.gamma !== null) {
        // Gamma representation is left-to-right phone tilt in degrees [-90, 90]
        const clamped = Math.max(-28, Math.min(28, e.gamma));
        setTilt(clamped * 0.5);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!active) return;
      // Elegant desktop fallback: use cursor position relative to window width
      const ratio = (e.clientX / window.innerWidth) - 0.5; // [-0.5, 0.5]
      setTilt(ratio * 20); // Tilt by up to [-10, 10] degrees
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      active = false;
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Ripple Generation Logic: Monitor progress increases (+1 water click!)
  useEffect(() => {
    if (progress > lastProgressRef.current) {
      // Create a series of staggered ripples for extra premium haptic/visual feel
      const newRipples: Ripple[] = [
        { id: Date.now(), cx: 250, cy: fillY, scaleMax: 4 },
        { id: Date.now() + 1, cx: 250, cy: fillY, scaleMax: 2.5 }
      ];

      setRipples(prev => [...prev, ...newRipples]);

      // Prune ripples after animation finishes
      setTimeout(() => {
        setRipples(prev => prev.filter(r => !newRipples.some(n => n.id === r.id)));
      }, 1200);
    }
    lastProgressRef.current = progress;
  }, [progress, fillY]);

  return (
    <div className={`relative w-full aspect-[4/5] max-w-[320px] md:max-w-[380px] mx-auto select-none ${className || ''}`}>
      
      {/* Self-contained CSS for high-performance responsive animations (Zero CPU drain on low-end devices) */}
      <style>{`
        @keyframes waveTranslation {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-300px); }
        }
        @keyframes waveTranslationDouble {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(150px); }
        }
        @keyframes floatIdle {
          0%, 100% { transform: translateY(-3px) rotate(-1.5deg); }
          50% { transform: translateY(4px) rotate(1.5deg); }
        }
        @keyframes riseBubble {
          0% { transform: translateY(50px) scale(0.7); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-160px) scale(1.1); opacity: 0; }
        }
        .anim-wave-1 {
          animation: waveTranslation 4.5s linear infinite;
        }
        .anim-wave-2 {
          animation: waveTranslationDouble 6.5s linear infinite;
        }
        .anim-mascot-float {
          animation: floatIdle 3.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .anim-bubble-bg {
          animation: riseBubble 4s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <svg viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_10px_25px_rgba(0,122,255,0.15)]">
        <defs>
          {/* Main seamless glass reflections gradient */}
          <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#E2F5FF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#B3E5FF" stopOpacity="0.45" />
          </linearGradient>

          {/* Smooth custom blue water gradient */}
          <linearGradient id="water-gradient-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" /> {/* Electric sky blue */}
            <stop offset="35%" stopColor="#0EA5E9" stopOpacity="0.95" /> {/* Ocean blue */}
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.99" /> {/* Deep blue */}
          </linearGradient>

          {/* Mask matching the iconic Mascot Jar Shell Shape (Ears + Rounded Body) */}
          <clipPath id="mascot-shell-mask">
            <ellipse cx="250" cy="330" rx="190" ry="160" />
            <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" />
            <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" />
          </clipPath>
        </defs>

        {/* Ambient Pool Shadow underneath Beaker */}
        <ellipse cx="250" cy="510" rx="140" ry="14" fill="#0284C7" fillOpacity="0.08" />

        {/* CONTAINER BACK GLASS LAYERS */}
        <g id="aquarium-shell-back" stroke="#A7F3D0" strokeWidth="1" fill="none">
          {/* Rim cap backing */}
          <ellipse cx="250" cy="130" rx="30" ry="8" stroke="#7DD3FC" strokeOpacity="0.4" strokeWidth="2" />
          <path d="M 220 160 L 220 140 A 10 10 0 0 1 230 130 L 270 130 A 10 10 0 0 1 280 140 L 280 160" stroke="#7DD3FC" strokeOpacity="0.3" strokeWidth="3" />
        </g>

        {/* WATER & LIQUID (Bounded cleanly to the Mascot Inner Shell) */}
        <g clipPath="url(#mascot-shell-mask)">
          {/* Clear Glass Empty Backing Tint */}
          <rect x="0" y="0" width="500" height="600" fill="#F0F9FF" fillOpacity="0.45" />
          <ellipse cx="250" cy="330" rx="175" ry="145" fill="#E0F2FE" fillOpacity="0.25" />

          {/* PHYSICAL WATER LAYER (Moves vertically as progress rises) */}
          <motion.g 
            animate={{ y: fillY }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          >
            {/* ROTATING SLOSH GROUP (Reacts dynamically to phone tilt physics) */}
            <motion.g
              animate={{ rotate: tilt }}
              style={{ transformOrigin: `250px 0px` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              {/* Secondary Background Waver (Adds parallax depth to active water) */}
              <g className="anim-wave-2" opacity="0.45">
                <path 
                  d="M -300,10 Q -225,-5 -150,10 T 0,10 T 150,10 T 300,10 T 450,10 T 600,10 T 750,10 T 900,10 L 900,600 L -300,600 Z" 
                  fill="#7DD3FC" 
                />
              </g>

              {/* Main Foreground Waving Body */}
              <g className="anim-wave-1">
                <path 
                  d="M -300,20 Q -225,5 -150,20 T 0,20 T 150,20 T 300,20 T 450,20 T 600,20 T 750,20 T 900,20 L 900,600 L -300,600 Z" 
                  fill="url(#water-gradient-blue)" 
                />
              </g>

              {/* Seamless Water Bubble Emitters (Hardware Accelerated CPU/Low-end friendliness) */}
              {progress > 0 && (
                <g fill="#FFFFFF" fillOpacity="0.6">
                  <circle cx="160" cy="200" r="5" className="anim-bubble-bg" style={{ animationDelay: '0s', animationDuration: '4.5s' }} />
                  <circle cx="210" cy="280" r="3.5" className="anim-bubble-bg" style={{ animationDelay: '1.2s', animationDuration: '3.8s' }} />
                  <circle cx="340" cy="240" r="4.5" className="anim-bubble-bg" style={{ animationDelay: '0.6s', animationDuration: '4.2s' }} />
                  <circle cx="280" cy="320" r="3" className="anim-bubble-bg" style={{ animationDelay: '2.1s', animationDuration: '3.5s' }} />
                </g>
              )}
            </motion.g>
          </motion.g>
        </g>

        {/* INTERACTIVE TAP RIPPLES (Super Immersive Visual Feedback!) */}
        <g id="water-ripples">
          <AnimatePresence>
            {ripples.map(r => (
              <motion.ellipse
                key={r.id}
                cx={r.cx}
                cy={r.cy}
                rx={12}
                ry={6}
                fill="none"
                stroke="#E0F2FE"
                strokeWidth="4"
                initial={{ scale: 0.1, opacity: 0.9 }}
                animate={{ scale: r.scaleMax, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>
        </g>

        {/* RESTORED VECTOR MASCOT FACIAL FEATURES */}
        <g transform={`translate(${tilt * 0.3}, -10)`}>
          {/* EYES */}
          <circle cx="210" cy="290" r="15" fill="#001845" />
          <circle cx="290" cy="290" r="15" fill="#001845" />
          {/* Pupils */}
          <circle cx="213" cy="285" r="5.5" fill="#fff" />
          <circle cx="293" cy="285" r="5.5" fill="#fff" />
          {/* Blush */}
          <ellipse cx="178" cy="312" rx="14" ry="7" fill="#FF4D6D" fillOpacity="0.25" />
          <ellipse cx="322" cy="312" rx="14" ry="7" fill="#FF4D6D" fillOpacity="0.25" />
          {/* Smiling Mouth */}
          <path 
            d="M 233 308 Q 250 328 267 308" 
            fill="none" stroke="#001845" strokeWidth="4" strokeLinecap="round"
          />
        </g>

        {/* CONTAINER GLASS SHELL & OUTLINES (Kept on top to maintain outer depth refraction) */}
        {/* Rim Opening */}
        <ellipse cx="250" cy="130" rx="30" ry="8" fill="rgba(255,255,255,0.25)" stroke="#38BDF8" strokeWidth="4" />
        <path d="M 220 130 L 220 160 A 10 10 0 0 0 230 170 L 270 170 A 10 10 0 0 0 280 160 L 280 130" fill="none" stroke="#38BDF8" strokeWidth="4" />

        {/* Main Beaker Jar Outlines */}
        <g stroke="#38BDF8" strokeWidth="4" fill="url(#glass-grad)" fillOpacity="0.25">
          <ellipse cx="250" cy="330" rx="190" ry="160" />
          <path d="M 120,210 C 100,150 110,120 120,110 C 140,110 160,150 180,180 Z" strokeLinejoin="round" />
          <path d="M 380,210 C 400,150 390,120 380,110 C 360,110 340,150 320,180 Z" strokeLinejoin="round" />
        </g>

        {/* Side Floating Refinement Handles */}
        <g stroke="#38BDF8" strokeWidth="4" fill="url(#glass-grad)">
          <ellipse cx="60" cy="310" rx="15" ry="30" transform="rotate(-15, 60, 310)" />
          <ellipse cx="440" cy="310" rx="15" ry="30" transform="rotate(15, 440, 310)" />
        </g>

        {/* Specular Shiny Glass Highlights */}
        {/* Main top left gloss curve */}
        <path d="M 92,290 A 160,130 0 0,1 210,195 A 150,120 0 0,0 112,305 Z" fill="#FFFFFF" fillOpacity="0.75" />
        {/* Side reflective highlight */}
        <path d="M 425,300 A 170,140 0 0,1 350,460" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
        {/* Bottom shine bounce reflection */}
        <path d="M 150,470 A 170,140 0 0,0 350,470" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" opacity="0.45" />

        {/* Ear Shiny Glass Lines */}
        <path d="M 120,135 C 120,135 138,143 148,162" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
        <path d="M 380,135 C 380,135 362,143 352,162" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.6" />

        {/* Sparkly Ambient Stars around Beaker (Adding extra magic!) */}
        <g fill="#FFFFFF">
          <polygon points="100,105 104,108 108,105 104,102" className="animate-pulse" style={{ animationDuration: '2.5s' }} />
          <polygon points="405,125 408,128 411,125 408,122" className="animate-pulse" style={{ animationDuration: '3.5s' }} />
          <polygon points="85,380 91,385 97,380 91,375" fill="#38BDF8" className="animate-pulse" style={{ animationDuration: '2.8s' }} />
          <polygon points="415,395 420,399 425,395 420,391" fill="#38BDF8" className="animate-pulse" style={{ animationDuration: '3.1s' }} />
        </g>
      </svg>
    </div>
  );
});
