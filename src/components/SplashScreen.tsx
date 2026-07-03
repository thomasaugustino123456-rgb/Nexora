import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isReady?: boolean;
  onFinish?: () => void;
}

export function SplashScreen({ isReady = false, onFinish }: SplashScreenProps) {
  const [showText, setShowText] = useState(false);
  const [exitSplash, setExitSplash] = useState(false);
  const [isMinTimePassed, setIsMinTimePassed] = useState(false);
  const [farewellStarted, setFarewellStarted] = useState(false);

  // Guarantee approximately 400ms minimum display time so the premium animation is never skipped instantly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinTimePassed(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize the exit timeline with the real application loading state once minimum display time is met
  useEffect(() => {
    if (isReady && isMinTimePassed && !farewellStarted) {
      setFarewellStarted(true);

      // Stage 1: The mascot tilts, smiles, and winks immediately (T = 0ms)

      // Stage 2: Smoothly shrink the mascot and pop the "Nexora" brand logo with soft elastic curve (T = 150ms)
      const tPop = setTimeout(() => {
        setShowText(true);
      }, 150);

      // Stage 3: Initiate the smooth fade out of the entire splash container (T = 350ms)
      const tExit = setTimeout(() => {
        setExitSplash(true);
      }, 350);

      // Stage 4: Immediately unmount the splash and render the fully hydrated application (T = 500ms)
      const tFinish = setTimeout(() => {
        if (onFinish) {
          onFinish();
        }
      }, 500);

      return () => {
        clearTimeout(tPop);
        clearTimeout(tExit);
        clearTimeout(tFinish);
      };
    }
  }, [isReady, isMinTimePassed, farewellStarted, onFinish]);

  // Handle automatic transition when used as a standard Suspense fallback without an external state coordinator
  useEffect(() => {
    if (!onFinish) {
      const t1 = setTimeout(() => {
        setFarewellStarted(true);
        setShowText(true);
      }, 500);
      const t2 = setTimeout(() => {
        setExitSplash(true);
      }, 900);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [onFinish]);

  // Morph the mouth path smoothly for a happy, slightly wider smile upon farewell
  const mouthPathOuter = farewellStarted 
    ? "M182,196 Q200,204 218,196 Q200,238 182,196 Z" 
    : "M188,198 Q200,208 212,198 Q200,228 188,198 Z";

  const mouthPathInner = farewellStarted
    ? "M186,206 Q200,202 214,206 Q200,232 186,206 Z"
    : "M192,208 Q200,202 208,208 Q200,224 192,208 Z";

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
          transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: all;
          will-change: opacity, transform;
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
          transition: transform 0.45s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.35s ease;
          animation: facialBreathing 2.4s infinite ease-in-out;
          will-change: transform, opacity;
          z-index: 2;
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
          transition: d 0.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Dynamic Tilt & Scale on Farewell */
        .face-container.farewell-active {
          animation: farewellTilt 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
        }

        /* Farewell Wink overriding regular blink */
        .left-eye.wink-active {
          animation: winkAnimation 0.35s ease-in-out forwards !important;
        }

        /* Stage 2: Clean Elastic Brand Logotype & Glow */
        .brand-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 70%);
          opacity: 0;
          transform: scale(0.6);
          transition: transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;
          pointer-events: none;
          z-index: 1;
          will-change: transform, opacity;
        }

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
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
          z-index: 3;
          will-change: transform, opacity;
        }

        /* =========================================
           DYNAMIC TIMELINE TRANSITION STATES
           ========================================= */
        #splashScreen.show-text .face-container {
          opacity: 0;
          transform: scale(0.3) translateY(40px);
          pointer-events: none;
        }
        #splashScreen.show-text .brand-glow {
          opacity: 1;
          transform: scale(1.15);
        }
        #splashScreen.show-text .brand-text {
          opacity: 1;
          transform: scale(1);
        }
        #splashScreen.exit-splash {
          opacity: 0;
          transform: scale(1.03);
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

        /* Gentle head tilt during farewell */
        @keyframes farewellTilt {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(7deg) scale(1.04); }
        }

        /* Instant elastic wink animation */
        @keyframes winkAnimation {
          0% { transform: scaleY(1); }
          40% { transform: scaleY(0.08); }
          100% { transform: scaleY(1); }
        }
      `}</style>

      <div className="splash-content">
        {/* Synchronized Facial Matrix */}
        <div className={`face-container ${farewellStarted ? 'farewell-active' : ''}`}>
          <svg viewBox="0 0 400 400" width="100%" height="100%">
            {/* Left Eye Vector (Winks during farewell) */}
            <g className={`left-eye ${farewellStarted ? 'wink-active' : ''}`}>
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
                d={mouthPathOuter} 
                fill="#b3243d" 
                stroke="#031b33" 
                strokeWidth="4.5" 
                strokeLinejoin="round" 
              />
              <path 
                d={mouthPathInner} 
                fill="#ff6b8b" 
              />
            </g>
          </svg>
        </div>

        {/* Premium Soft Radial Ambient Glow */}
        <div className="brand-glow" />

        {/* Premium Text Typography Target */}
        <div className="brand-text">nexora</div>
      </div>
    </div>
  );
}
