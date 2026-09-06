import React from 'react';

interface AnimatedEffectPreviewProps {
  effectId: string;
  className?: string;
}

export const AnimatedEffectPreview: React.FC<AnimatedEffectPreviewProps> = ({
  effectId,
  className = 'w-12 h-12',
}) => {
  const clean = effectId.toLowerCase().replace('effect-', '');

  if (clean === 'sparkles') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} overflow-visible`}>
        <defs>
          <radialGradient id="prevSparkleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#prevSparkleGlow)" className="animate-pulse" />
        {/* Diamond 1 */}
        <path
          d="M 50 15 L 56 44 L 85 50 L 56 56 L 50 85 L 44 56 L 15 50 L 44 44 Z"
          fill="#fde047"
          stroke="#ca8a04"
          strokeWidth="1.5"
          className="animate-spin"
          style={{ transformOrigin: '50px 50px', animationDuration: '10s' }}
        />
        <circle cx="28" cy="28" r="3.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2s' }} />
        <circle cx="72" cy="72" r="3" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2.5s' }} />
      </svg>
    );
  }

  if (clean === 'embers') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} overflow-visible`}>
        <defs>
          <radialGradient id="prevEmberGlow" cx="50%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#ff5500" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="55" r="42" fill="url(#prevEmberGlow)" className="animate-pulse" />
        {/* Rising Ember Sparks */}
        <circle cx="45" cy="65" r="7" fill="#f97316" />
        <circle cx="45" cy="65" r="3.5" fill="#fef08a" />
        <circle cx="62" cy="45" r="5.5" fill="#ef4444" className="animate-pulse" />
        <circle cx="62" cy="45" r="2.5" fill="#fde047" />
        <circle cx="35" cy="35" r="4" fill="#fbbf24" className="animate-ping" style={{ animationDuration: '2.2s' }} />
        <circle cx="52" cy="20" r="3" fill="#ffffff" />
      </svg>
    );
  }

  if (clean === 'orbs') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} overflow-visible`}>
        <defs>
          <radialGradient id="prevOrbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="url(#prevOrbGlow)" />
        {/* Orbital Track */}
        <ellipse cx="50" cy="50" rx="38" ry="16" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" transform="rotate(-20 50 50)" />
        {/* Core Center Orb */}
        <circle cx="50" cy="50" r="10" fill="#8b5cf6" />
        <circle cx="47" cy="47" r="3.5" fill="#e9d5ff" />
        {/* Orbiting Planet 1 */}
        <circle cx="20" cy="40" r="6" fill="#06b6d4" />
        <circle cx="18" cy="38" r="2" fill="#cffafe" />
        {/* Orbiting Planet 2 */}
        <circle cx="80" cy="60" r="5.5" fill="#f43f5e" />
        <circle cx="78" cy="58" r="2" fill="#ffe4e6" />
      </svg>
    );
  }

  if (clean === 'neon' || clean === 'neon_glow') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} overflow-visible`}>
        {/* Concentric rings */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#00f2fe" strokeWidth="3" strokeDasharray="8 6" className="animate-spin" style={{ transformOrigin: '50px 50px', animationDuration: '8s' }} />
        <circle cx="50" cy="50" r="26" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="6 4" className="animate-pulse" />
        <circle cx="50" cy="50" r="12" fill="#00f2fe" opacity="0.8" className="animate-ping" style={{ animationDuration: '2s' }} />
        <circle cx="50" cy="50" r="6" fill="#ffffff" />
      </svg>
    );
  }

  if (clean === 'gold_dust' || clean === 'gold-dust') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} overflow-visible`}>
        <defs>
          <radialGradient id="prevGoldHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="url(#prevGoldHalo)" className="animate-pulse" />
        <polygon points="50,15 54,28 67,30 57,38 60,51 50,43 40,51 43,38 33,30 46,28" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
        <circle cx="28" cy="65" r="3.5" fill="#fde047" className="animate-ping" style={{ animationDuration: '1.8s' }} />
        <circle cx="72" cy="62" r="4" fill="#fbbf24" className="animate-ping" style={{ animationDuration: '2.2s' }} />
        <circle cx="50" cy="78" r="3" fill="#ffffff" />
      </svg>
    );
  }

  if (clean === 'lightning') {
    return (
      <svg viewBox="0 0 100 100" className={`${className} overflow-visible`}>
        <defs>
          <radialGradient id="prevLightningHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="url(#prevLightningHalo)" className="animate-pulse" />
        <path
          d="M 52 15 L 34 50 L 50 50 L 44 85 L 68 45 L 52 45 Z"
          fill="#fef08a"
          stroke="#0284c7"
          strokeWidth="2"
          strokeLinejoin="round"
          className="animate-pulse"
        />
        <circle cx="26" cy="48" r="2.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '1.5s' }} />
        <circle cx="74" cy="52" r="2.5" fill="#67e8f9" className="animate-ping" style={{ animationDuration: '1.9s' }} />
      </svg>
    );
  }

  return <span className="text-3xl">✨</span>;
};
