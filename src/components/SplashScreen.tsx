import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
}

export function SplashScreen({ isReady = false, onFinish }: SplashScreenProps) {
  const [showText, setShowText] = useState(false);
  const [exitSplash, setExitSplash] = useState(false);

  useEffect(() => {
    if (isReady) {
      // Stage 1: Wait for data readiness, then trigger the elastic mascot -> brand-text morph
      setShowText(true);

      // Stage 2: Hold brand-text visual focus, then initiate dissolution (exit-splash)
      const fadeTimer = setTimeout(() => {
        setExitSplash(true);
      }, 1700);

      // Stage 3: After the 0.6s exit transition finishes, unmount and render the app
      const finishTimer = setTimeout(() => {
        if (onFinish) {
          onFinish();
        }
      }, 1700 + 600);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [isReady, onFinish]);

  // Handle automatic transition when used as a standard Suspense fallback
  useEffect(() => {
    if (!onFinish) {
      const t1 = setTimeout(() => {
        setShowText(true);
      }, 1800);
      const t2 = setTimeout(() => {
        setExitSplash(true);
      }, 3500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [onFinish]);

  return (
    <div 
      id="splashScreen"
      className={`fixed inset-0 w-screen h-screen flex items-center justify-center z-[99999] overflow-hidden ${
        showText ? 'show-text' : ''
      } ${exitSplash ? 'exit-splash' : ''}`}
    >
      <style>{`
        /* =========================================
           10x PREMIUM DUOLINGO-STYLE OVERLAY
           ========================================= */
        #splashScreen {
          /* Subtle premium radial gradient to match the richness of the original mascot asset */
          background: radial-gradient(circle at center, #10a3ff 0%, #0088ee 100%);
          opacity: 1;
          transition: opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: all;
        }

        .splash-content {
          position: relative;
          width: 350px;
          height: 350px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Stage 1: The Living Floating Face Cluster */
        .face-container {
          position: absolute;
          width: 240px;
          height: 240px;
          opacity: 1;
          transform: scale(1);
          transform-origin: center center;
          transition: transform 0.55s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.45s ease;
          animation: facialBreathing 2.4s infinite ease-in-out;
        }

        /* CRITICAL FIX: Explicit local center pinning for flawless synchronized blinking */
        .left-eye {
          transform-origin: 135px 180px;
          animation: synchronizedBlink 4s infinite ease-in-out;
        }

        .right-eye {
          transform-origin: 265px 180px;
          animation: synchronizedBlink 4s infinite ease-in-out;
        }

        /* Mouth reacts elastically to the eye blinks */
        .mascot-mouth {
          transform-origin: 200px 205px;
          animation: mouthReact 4s infinite ease-in-out;
        }

        /* Stage 2: Clean Elastic Brand Logotype */
        .brand-text {
          position: absolute;
          font-size: 62px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 6px;
          text-transform: lowercase;
          text-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
          opacity: 0;
          transform: scale(0.7);
          /* High-end cinematic snap curve */
          transition: transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.45s ease;
        }

        /* =========================================
           DYNAMIC TIMELINE TRANSITION STATES
           ========================================= */
        #splashScreen.show-text .face-container {
          opacity: 0;
          transform: scale(0.35) translateY(40px);
          pointer-events: none;
        }
        #splashScreen.show-text .brand-text {
          opacity: 1;
          transform: scale(1);
        }
        #splashScreen.exit-splash {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
        }

        /* =========================================
           10x ANIMATION PHYSICS KEYFRAMES
           ========================================= */
        /* Liquid float cycle */
        @keyframes facialBreathing {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02, 0.98); }
        }
        
        /* Perfect synchronized double-blink cycle */
        @keyframes synchronizedBlink {
          0%, 40%, 44%, 52%, 56%, 100% { transform: scaleY(1); }
          42%, 54% { transform: scaleY(0.05); }
        }

        /* Mouth squishes slightly during blinks for extra character personality */
        @keyframes mouthReact {
          0%, 40%, 44%, 52%, 56%, 100% { transform: scale(1); }
          42%, 54% { transform: scale(1.15, 0.75); }
        }
      `}</style>

      <div className="splash-content">
        {/* Synchronized Facial Matrix */}
        <div className="face-container">
          <svg viewBox="0 0 400 400" width="100%" height="100%">
            {/* Left Eye Vector */}
            <g className="left-eye">
              <circle cx="135" cy="180" r="25" fill="#031b33" />
              <circle cx="135" cy="180" r="22" fill="#002d5a" />
              <circle cx="127" cy="171" r="8.5" fill="#ffffff" />
              <circle cx="142" cy="189" r="3.5" fill="#ffffff" />
            </g>
            
            {/* Right Eye Vector (Mirrored exactly to match Left Eye parameters) */}
            <g className="right-eye">
              <circle cx="265" cy="180" r="25" fill="#031b33" />
              <circle cx="265" cy="180" r="22" fill="#002d5a" />
              <circle cx="257" cy="171" r="8.5" fill="#ffffff" />
              <circle cx="272" cy="189" r="3.5" fill="#ffffff" />
            </g>

            {/* Dynamic Interlinked Mouth Vector */}
            <g className="mascot-mouth">
              <path 
                d="M188,198 Q200,208 212,198 Q200,228 188,198 Z" 
                fill="#b3243d" 
                stroke="#031b33" 
                strokeWidth="4.5" 
                strokeLinejoin="round" 
              />
              <path 
                d="M192,208 Q200,202 208,208 Q200,224 192,208 Z" 
                fill="#ff6b8b" 
              />
            </g>
          </svg>
        </div>

        {/* Premium Text Typography Target */}
        <div className="brand-text">nexora</div>
      </div>
    </div>
  );
}
