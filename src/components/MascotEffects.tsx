import React from 'react';

export function normalizeEffect(effect?: string): string {
  if (!effect || effect === 'none') return 'none';
  const clean = effect.toLowerCase().replace('effect-', '');
  if (clean.includes('sparkle') || clean.includes('star')) return 'sparkles';
  if (clean.includes('ember') || clean.includes('fire') || clean.includes('flame')) return 'embers';
  if (clean.includes('orb') || clean.includes('cosmic') || clean.includes('planet')) return 'orbs';
  if (clean.includes('neon') || clean.includes('cyber') || clean.includes('glow')) return 'neon_glow';
  if (clean.includes('gold') || clean.includes('dust') || clean.includes('emperor')) return 'gold_dust';
  if (clean.includes('lightning') || clean.includes('storm') || clean.includes('thunder') || clean.includes('electric')) return 'lightning';
  return clean;
}

interface EffectProps {
  effect?: string;
  uid?: string;
}

export const MascotBackgroundEffect: React.FC<EffectProps> = ({ effect, uid = 'fx' }) => {
  const norm = normalizeEffect(effect);
  if (norm === 'none') return null;

  return (
    <g className="mascot-bg-effect-layer" pointerEvents="none">
      <defs>
        {/* Sparkles Filters & Gradients */}
        <radialGradient id={`fx-sparkle-halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>

        {/* Embers Filters & Gradients */}
        <radialGradient id={`fx-ember-glow-${uid}`} cx="50%" cy="65%" r="60%">
          <stop offset="0%" stopColor="#ff5500" stopOpacity="0.5" />
          <stop offset="40%" stopColor="#dc2626" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
        </radialGradient>

        {/* Orbs Cosmic Ring & Gradient */}
        <radialGradient id={`fx-orb-cosmic-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Neon Pulse Gradient */}
        <linearGradient id={`fx-neon-cyan-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#4facfe" />
        </linearGradient>

        {/* Gold Dust Gradient */}
        <radialGradient id={`fx-gold-halo-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        {/* Lightning Plasma */}
        <radialGradient id={`fx-lightning-halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Starlight Sparkles Background Aura */}
      {norm === 'sparkles' && (
        <g>
          {/* Pulsing Starlight Aura */}
          <ellipse cx="200" cy="215" rx="195" ry="165" fill={`url(#fx-sparkle-halo-${uid})`} className="animate-pulse" />
          
          {/* Rotating celestial diamond glints behind */}
          <g className="animate-spin" style={{ transformOrigin: '200px 215px', animationDuration: '24s' }}>
            <circle cx="200" cy="55" r="4" fill="#fef08a" opacity="0.8" />
            <circle cx="65" cy="200" r="3" fill="#a5f3fc" opacity="0.8" />
            <circle cx="335" cy="200" r="3" fill="#a5f3fc" opacity="0.8" />
            <circle cx="110" cy="100" r="2.5" fill="#ffffff" opacity="0.7" />
            <circle cx="290" cy="100" r="2.5" fill="#ffffff" opacity="0.7" />
          </g>

          {/* Gentle background stardust motes */}
          <g opacity="0.85">
            <path d="M 80 130 L 85 140 L 95 145 L 85 150 L 80 160 L 75 150 L 65 145 L 75 140 Z" fill="#fef08a" transform="scale(0.8) translate(20, 20)" />
            <path d="M 320 130 L 325 140 L 335 145 L 325 150 L 320 160 L 315 150 L 305 145 L 315 140 Z" fill="#fde047" transform="scale(0.8) translate(30, 20)" />
          </g>
        </g>
      )}

      {/* 2. Blazing Fire Embers Background */}
      {norm === 'embers' && (
        <g>
          {/* Warm Flame Body Aura */}
          <ellipse cx="200" cy="235" rx="205" ry="155" fill={`url(#fx-ember-glow-${uid})`} className="animate-pulse" style={{ animationDuration: '2s' }} />

          {/* Rising Ember Flares */}
          <g className="animate-pulse" style={{ animationDuration: '1.4s' }}>
            {/* Background ember 1 */}
            <circle cx="105" cy="260" r="6" fill="#f97316" opacity="0.75" />
            <circle cx="105" cy="260" r="3" fill="#fef08a" opacity="0.9" />

            {/* Background ember 2 */}
            <circle cx="295" cy="250" r="5" fill="#ef4444" opacity="0.75" />
            <circle cx="295" cy="250" r="2.5" fill="#fbbf24" opacity="0.9" />

            {/* High rising ember 3 */}
            <circle cx="150" cy="85" r="4.5" fill="#ff5500" opacity="0.8" />
            <circle cx="250" cy="80" r="4" fill="#fbbf24" opacity="0.8" />
            
            {/* Ambient fire spark points */}
            <polygon points="190,60 193,68 200,70 193,72 190,80 187,72 180,70 187,68" fill="#fde047" opacity="0.75" />
          </g>
        </g>
      )}

      {/* 3. Cosmic Orbs Background */}
      {norm === 'orbs' && (
        <g>
          {/* Deep Cosmic Aura */}
          <ellipse cx="200" cy="215" rx="210" ry="170" fill={`url(#fx-orb-cosmic-${uid})`} className="animate-pulse" style={{ animationDuration: '4s' }} />

          {/* Cosmic Planetary Orbital Ring */}
          <ellipse
            cx="200"
            cy="215"
            rx="185"
            ry="65"
            fill="none"
            stroke="#c084fc"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.45"
            transform="rotate(-18 200 215)"
          />

          {/* Background Orbiting Planetary Orbs */}
          {/* Orb A: Violet Moon */}
          <g transform="translate(60, 160)">
            <circle cx="0" cy="0" r="14" fill="#8b5cf6" opacity="0.9" />
            <circle cx="-3" cy="-3" r="5" fill="#e9d5ff" opacity="0.7" />
            <circle cx="0" cy="0" r="17" fill="none" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.5" />
          </g>

          {/* Orb B: Stellar Aqua Sphere */}
          <g transform="translate(340, 260)">
            <circle cx="0" cy="0" r="12" fill="#06b6d4" opacity="0.9" />
            <circle cx="-2" cy="-2" r="4" fill="#cffafe" opacity="0.8" />
            <circle cx="0" cy="0" r="15" fill="none" stroke="#67e8f9" strokeWidth="1.5" opacity="0.5" />
          </g>

          {/* Orb C: Radiant Golden Sunlet */}
          <g transform="translate(200, 60)">
            <circle cx="0" cy="0" r="9" fill="#eab308" opacity="0.9" />
            <circle cx="-2" cy="-2" r="3" fill="#fef08a" opacity="0.9" />
          </g>
        </g>
      )}

      {/* 4. Cyber Neon Pulse Background */}
      {norm === 'neon_glow' && (
        <g>
          {/* Concentric Neon Rings */}
          <ellipse
            cx="200"
            cy="215"
            rx="185"
            ry="150"
            fill="none"
            stroke={`url(#fx-neon-cyan-${uid})`}
            strokeWidth="3.5"
            strokeDasharray="14 8"
            opacity="0.75"
            className="animate-pulse"
            style={{ animationDuration: '2.2s' }}
          />
          <ellipse
            cx="200"
            cy="215"
            rx="205"
            ry="165"
            fill="none"
            stroke="#ec4899"
            strokeWidth="2"
            strokeDasharray="8 6"
            opacity="0.5"
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />

          {/* Holographic grid tick lines */}
          <line x1="40" y1="215" x2="65" y2="215" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="335" y1="215" x2="360" y2="215" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="200" y1="50" x2="200" y2="75" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>
      )}

      {/* 5. Imperial Gold Dust Background */}
      {norm === 'gold_dust' && (
        <g>
          {/* Golden Sun Halo */}
          <ellipse cx="200" cy="205" rx="195" ry="165" fill={`url(#fx-gold-halo-${uid})`} className="animate-pulse" style={{ animationDuration: '2.5s' }} />

          {/* Golden Aura Ring */}
          <ellipse
            cx="200"
            cy="215"
            rx="178"
            ry="142"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeDasharray="8 6"
            opacity="0.75"
          />

          {/* Crown-like floating sunbeams */}
          <g opacity="0.8">
            <line x1="200" y1="65" x2="200" y2="40" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            <line x1="130" y1="90" x2="115" y2="70" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="270" y1="90" x2="285" y2="70" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="75" y1="180" x2="55" y2="175" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="325" y1="180" x2="345" y2="175" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* 6. Storm Lightning Arcs Background */}
      {norm === 'lightning' && (
        <g>
          {/* Electric Plasma Halo */}
          <ellipse cx="200" cy="215" rx="195" ry="160" fill={`url(#fx-lightning-halo-${uid})`} className="animate-pulse" style={{ animationDuration: '1.2s' }} />

          {/* Crackling Electric Arcs */}
          <g stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
            <path d="M 60 160 L 75 185 L 68 200 L 90 225" />
            <path d="M 340 160 L 325 185 L 332 200 L 310 225" />
            <path d="M 170 65 L 185 85 L 180 95 L 200 110" />
            <path d="M 230 65 L 215 85 L 220 95 L 205 110" />
          </g>
          <g stroke="#fef08a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
            <path d="M 65 170 L 75 185 L 82 210" />
            <path d="M 335 170 L 325 185 L 318 210" />
          </g>
        </g>
      )}
    </g>
  );
};

export const MascotForegroundEffect: React.FC<EffectProps> = ({ effect, uid = 'fx' }) => {
  const norm = normalizeEffect(effect);
  if (norm === 'none') return null;

  return (
    <g className="mascot-fg-effect-layer" pointerEvents="none">
      {/* 1. Starlight Sparkles Foreground Glints */}
      {norm === 'sparkles' && (
        <g>
          {/* Sparkle Diamond 1 - Near Right Shoulder */}
          <path
            d="M 315 155 Q 320 160 325 160 Q 320 160 315 165 Q 320 160 315 155 Z"
            fill="#fde047"
            transform="scale(1.8) translate(-140, -60)"
            className="animate-pulse"
            style={{ animationDuration: '1.8s' }}
          />
          {/* Sparkle Diamond 2 - Near Left Cheek */}
          <path
            d="M 100 170 Q 105 175 110 175 Q 105 175 100 180 Q 105 175 100 170 Z"
            fill="#ffffff"
            transform="scale(1.4) translate(-20, -40)"
            className="animate-pulse"
            style={{ animationDuration: '2.4s' }}
          />
          {/* Sparkle Diamond 3 - Center Chest Light */}
          <circle cx="200" cy="275" r="3.5" fill="#ffffff" opacity="0.9" className="animate-ping" style={{ animationDuration: '3s' }} />
        </g>
      )}

      {/* 2. Blazing Fire Embers Foreground */}
      {norm === 'embers' && (
        <g>
          {/* Rising Ember 1 in front of body */}
          <g className="animate-pulse" style={{ animationDuration: '1.2s' }}>
            <circle cx="165" cy="285" r="4.5" fill="#ff5500" opacity="0.9" />
            <circle cx="165" cy="285" r="2" fill="#fef08a" />
          </g>
          {/* Rising Ember 2 */}
          <g className="animate-pulse" style={{ animationDuration: '1.6s' }}>
            <circle cx="235" cy="270" r="5" fill="#f97316" opacity="0.9" />
            <circle cx="235" cy="270" r="2.5" fill="#ffffff" />
          </g>
          {/* Micro ember near head */}
          <circle cx="140" cy="150" r="3" fill="#fde047" opacity="0.85" />
          <circle cx="260" cy="140" r="2.5" fill="#fde047" opacity="0.85" />
        </g>
      )}

      {/* 3. Cosmic Orbs Foreground - Crossing in front */}
      {norm === 'orbs' && (
        <g>
          {/* Foreground Planet 1: Luminous Pearl passing in front of body */}
          <g transform="translate(140, 240)" className="animate-pulse" style={{ animationDuration: '3s' }}>
            <circle cx="0" cy="0" r="15" fill="#f43f5e" opacity="0.95" />
            <circle cx="-3" cy="-3" r="5" fill="#ffe4e6" opacity="0.9" />
            <circle cx="0" cy="0" r="18" fill="none" stroke="#fda4af" strokeWidth="2" opacity="0.6" />
          </g>

          {/* Foreground Planet 2: Emerald Energy Orb */}
          <g transform="translate(260, 220)" className="animate-pulse" style={{ animationDuration: '2.5s' }}>
            <circle cx="0" cy="0" r="13" fill="#10b981" opacity="0.95" />
            <circle cx="-3" cy="-3" r="4" fill="#d1fae5" opacity="0.9" />
            <circle cx="0" cy="0" r="16" fill="none" stroke="#6ee7b7" strokeWidth="2" opacity="0.6" />
          </g>
        </g>
      )}

      {/* 4. Cyber Neon Pulse Foreground */}
      {norm === 'neon_glow' && (
        <g>
          {/* Neon energy nodes on front perimeter */}
          <circle cx="95" cy="220" r="4.5" fill="#00f2fe" opacity="0.9" className="animate-ping" style={{ animationDuration: '2s' }} />
          <circle cx="305" cy="220" r="4.5" fill="#ec4899" opacity="0.9" className="animate-ping" style={{ animationDuration: '2.5s' }} />
          
          {/* Cyber scanner beam arc */}
          <path
            d="M 120 285 Q 200 315 280 285"
            fill="none"
            stroke="#00f2fe"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      )}

      {/* 5. Imperial Gold Dust Foreground */}
      {norm === 'gold_dust' && (
        <g>
          {/* Cascading Golden Stardust Flakes */}
          <g className="animate-pulse" style={{ animationDuration: '1.5s' }}>
            <polygon points="150,230 153,237 160,239 153,241 150,248 147,241 140,239 147,237" fill="#fde047" opacity="0.9" />
            <polygon points="250,240 253,247 260,249 253,251 250,258 247,251 240,249 247,247" fill="#fbbf24" opacity="0.9" />
            <polygon points="200,300 202,305 208,306 202,308 200,314 198,308 192,306 198,305" fill="#ffffff" opacity="0.85" />
          </g>
        </g>
      )}

      {/* 6. Storm Lightning Arcs Foreground */}
      {norm === 'lightning' && (
        <g>
          {/* Snapping front lightning spark */}
          <path
            d="M 185 240 L 195 255 L 190 262 L 205 275"
            stroke="#fef08a"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <circle cx="185" cy="240" r="3" fill="#ffffff" />
          <circle cx="205" cy="275" r="3" fill="#67e8f9" />
        </g>
      )}
    </g>
  );
};
