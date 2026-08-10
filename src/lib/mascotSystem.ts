export type MascotId = 
  | 'blue-slim' 
  | 'fire-slim' 
  | 'water-slim' 
  | 'shield-slim' 
  | 'lightning-slim' 
  | 'earth-slim';

export type MascotRarity = 'Default' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface MascotConfig {
  id: MascotId;
  name: string;
  rarity: MascotRarity;
  price: number; // in coins
  personalityTitle: string;
  personalityDesc: string;
  powerName: string;
  powerDesc: string;
  element: 'neutral' | 'fire' | 'water' | 'shield' | 'lightning' | 'earth';
  colors: {
    bodyStart: string;
    bodyStop1: string;
    bodyStop2: string;
    bodyEnd: string;
    stroke: string;
    halo1: string;
    halo2: string;
    eyeColor: string;
    accentGlow: string;
  };
  dialogues: {
    morning: string[];
    afterOneChallenge: string[];
    afterAllChallenges: string[];
    missedDay: string[];
    longStreak: string[];
    rareTap: string[];
  };
}

export const MASCOTS_DATA: Record<MascotId, MascotConfig> = {
  'blue-slim': {
    id: 'blue-slim',
    name: 'Blue Slim',
    rarity: 'Default',
    price: 0,
    personalityTitle: 'Calm & Supportive',
    personalityDesc: 'Your faithful starting companion. Gentle, supportive, and always encouraging small daily steps.',
    powerName: 'Celestial Harmony',
    powerDesc: 'Emits a soothing starry aura that calms your mind and centers your focus.',
    element: 'neutral',
    colors: {
      bodyStart: '#ffffff',
      bodyStop1: '#a3e3ff',
      bodyStop2: '#21a7f0',
      bodyEnd: '#0066cc',
      stroke: '#0055b3',
      halo1: '#b8f1ff',
      halo2: '#38bdf8',
      eyeColor: '#031b33',
      accentGlow: '#38bdf8'
    },
    dialogues: {
      morning: [
        "Ready for today?",
        "Let's grow together.",
        "Small habits matter.",
        "Good morning! I'm right here with you."
      ],
      afterOneChallenge: [
        "Great start!",
        "Keep going.",
        "Momentum is building.",
        "That felt good, didn't it?"
      ],
      afterAllChallenges: [
        "You did it!",
        "Your plant is stronger.",
        "I'm proud of you!",
        "All goals crushed today! Amazing!"
      ],
      missedDay: [
        "Let's begin again.",
        "Progress is never lost.",
        "One step today is enough.",
        "Fresh day, fresh start, bro!"
      ],
      longStreak: [
        "Your consistency is incredible.",
        "You're becoming stronger every day.",
        "Unstoppable focus right here!"
      ],
      rareTap: [
        "You & me against the world, bro!",
        "Every single step builds a masterpiece.",
        "Pure celestial harmony flow!"
      ]
    }
  },
  'fire-slim': {
    id: 'fire-slim',
    name: 'Fire Slim',
    rarity: 'Epic',
    price: 250,
    personalityTitle: 'Energetic & Ambitious',
    personalityDesc: 'Fiery, highly motivated, and passionate. Ignites your drive to burn through challenges.',
    powerName: 'Inferno Wave',
    powerDesc: 'Spreads a wave of fire across the screen with rising embers and warm screen pulse.',
    element: 'fire',
    colors: {
      bodyStart: '#ffffff',
      bodyStop1: '#fde047',
      bodyStop2: '#ff5500',
      bodyEnd: '#dc2626',
      stroke: '#991b1b',
      halo1: '#fef08a',
      halo2: '#ff8c00',
      eyeColor: '#450a0a',
      accentGlow: '#ff5500'
    },
    dialogues: {
      morning: [
        "Fire up for today!",
        "Let's burn through those tasks!",
        "Feel the passion in your morning!"
      ],
      afterOneChallenge: [
        "Spark ignited!",
        "You're heating up!",
        "Keep feeding the flame!"
      ],
      afterAllChallenges: [
        "Absolute inferno victory!",
        "You destroyed today's goals!",
        "Your drive is blazing hot!"
      ],
      missedDay: [
        "Re-ignite the fire!",
        "Sparks turn into wildfires!",
        "Pick up the torch today!"
      ],
      longStreak: [
        "Your streak is an eternal flame!",
        "Unstoppable fiery discipline!",
        "You're burning through every obstacle!"
      ],
      rareTap: [
        "Your fire is growing stronger, bro!",
        "Inferno power activated! Feel the heat!",
        "Blaze bright! Nothing can stop us!"
      ]
    }
  },
  'water-slim': {
    id: 'water-slim',
    name: 'Water Slim',
    rarity: 'Rare',
    price: 250,
    personalityTitle: 'Peaceful & Caring',
    personalityDesc: 'Cool, serene, and deeply encouraging. Teaches fluidity, emotional balance, and effortless flow.',
    powerName: 'Oceanic Ripple',
    powerDesc: 'Creates expanding water waves with floating droplets and cool blue ambient lighting.',
    element: 'water',
    colors: {
      bodyStart: '#ffffff',
      bodyStop1: '#a5f3fc',
      bodyStop2: '#06b6d4',
      bodyEnd: '#0e7490',
      stroke: '#164e63',
      halo1: '#e0f2fe',
      halo2: '#0284c7',
      eyeColor: '#083344',
      accentGlow: '#06b6d4'
    },
    dialogues: {
      morning: [
        "Flow like water.",
        "Stay calm and keep growing.",
        "Peace fills every habit."
      ],
      afterOneChallenge: [
        "Smooth & fluid motion.",
        "One drop fills the bucket.",
        "Effortless progress."
      ],
      afterAllChallenges: [
        "A deep, serene victory.",
        "Your focus flows like a river.",
        "Beautiful harmony today."
      ],
      missedDay: [
        "Water adapts to any path.",
        "Gently return to your flow.",
        "Quiet minds rebuild fast."
      ],
      longStreak: [
        "An ocean built drop by drop.",
        "Incredible, serene consistency.",
        "Unshakable peaceful discipline."
      ],
      rareTap: [
        "Clear as crystal water, strong as the ocean wave!",
        "Flowing with infinite serenity!",
        "Your mind is as calm as deep waters."
      ]
    }
  },
  'shield-slim': {
    id: 'shield-slim',
    name: 'Shield Slim',
    rarity: 'Epic',
    price: 350,
    personalityTitle: 'Protective & Loyal',
    personalityDesc: 'A steadfast defender of your streak. Unwavering loyalty, shielding you from distractions.',
    powerName: 'Aegis Barrier',
    powerDesc: 'Projects a glowing circular energy shield that protects your progress and focus.',
    element: 'shield',
    colors: {
      bodyStart: '#ffffff',
      bodyStop1: '#c7d2fe',
      bodyStop2: '#4338ca',
      bodyEnd: '#1e1b4b',
      stroke: '#312e81',
      halo1: '#e0e7ff',
      halo2: '#6366f1',
      eyeColor: '#0f172a',
      accentGlow: '#6366f1'
    },
    dialogues: {
      morning: [
        "I stand guard over your streak.",
        "Shields up for a productive day!",
        "No distraction shall pass!"
      ],
      afterOneChallenge: [
        "Defense reinforced!",
        "First line secured.",
        "Solid stance, bro."
      ],
      afterAllChallenges: [
        "Perfection defense! All clear!",
        "Unbreakable fortification today!",
        "I'm proud to guard your growth."
      ],
      missedDay: [
        "Raise the shield again!",
        "Our defense holds strong.",
        "One step restores the fortress."
      ],
      longStreak: [
        "An ironclad habit fortress!",
        "Unbreakable dedication, sir!",
        "Your focus is impenetrable!"
      ],
      rareTap: [
        "No distraction can breach our shield!",
        "Aegis defense locked & loaded!",
        "Standing loyal beside you forever!"
      ]
    }
  },
  'lightning-slim': {
    id: 'lightning-slim',
    name: 'Lightning Slim',
    rarity: 'Legendary',
    price: 400,
    personalityTitle: 'Playful & Exciting',
    personalityDesc: 'High-speed energy and playful confidence. Sparks instant action and swift execution.',
    powerName: 'Voltaic Surge',
    powerDesc: 'Unleashes bright electrical arcs and energy streaks with instant vibration pulse.',
    element: 'lightning',
    colors: {
      bodyStart: '#ffffff',
      bodyStop1: '#fef08a',
      bodyStop2: '#eab308',
      bodyEnd: '#a16207',
      stroke: '#713f12',
      halo1: '#fef9c3',
      halo2: '#00e5ff',
      eyeColor: '#422006',
      accentGlow: '#eab308'
    },
    dialogues: {
      morning: [
        "Pure power!",
        "Speed through your goals!",
        "Fast, focused, unstoppable!"
      ],
      afterOneChallenge: [
        "Lightning fast!",
        "Zap! Task complete!",
        "Speed mode activated!"
      ],
      afterAllChallenges: [
        "Maximum electric victory!",
        "You crushed it at lightspeed!",
        "High voltage performance!"
      ],
      missedDay: [
        "Recharge your battery!",
        "Instant spark! Let's go!",
        "Shock the world today!"
      ],
      longStreak: [
        "Supercharged consistency!",
        "An electric streak of power!",
        "Limitless high-voltage focus!"
      ],
      rareTap: [
        "Voltaic Surge Overdrive! ⚡⚡",
        "Speed, accuracy, and electric energy!",
        "Feel the spark of infinite motivation!"
      ]
    }
  },
  'earth-slim': {
    id: 'earth-slim',
    name: 'Earth Slim',
    rarity: 'Rare',
    price: 300,
    personalityTitle: 'Wise & Patient',
    personalityDesc: 'Deeply grounded, patient, and wise. Rooted in ancient discipline, guiding steady long-term growth.',
    powerName: 'Gaia Bloom',
    powerDesc: 'Grows glowing emerald vines and leaves with a gentle grounding rumble.',
    element: 'earth',
    colors: {
      bodyStart: '#ffffff',
      bodyStop1: '#bbf7d0',
      bodyStop2: '#22c55e',
      bodyEnd: '#15803d',
      stroke: '#14532d',
      halo1: '#dcfce7',
      halo2: '#16a34a',
      eyeColor: '#052e16',
      accentGlow: '#22c55e'
    },
    dialogues: {
      morning: [
        "Deep roots build tall trees.",
        "Patience turns seeds into forests.",
        "Grounded in discipline."
      ],
      afterOneChallenge: [
        "A healthy shoot grows.",
        "Nurture every small win.",
        "Solid ground beneath you."
      ],
      afterAllChallenges: [
        "A bountiful harvest today!",
        "Deeply rooted victory!",
        "Wisdom and discipline fulfilled."
      ],
      missedDay: [
        "Even giant trees lose leaves.",
        "The soil is fertile today.",
        "Plant a new seed right now."
      ],
      longStreak: [
        "An ancient forest of discipline!",
        "Your roots grow deeper every day.",
        "Immovable stoic strength."
      ],
      rareTap: [
        "Gaia bloom surrounds you with vitality!",
        "Rooted firmly in timeless discipline.",
        "Growth is steady, natural, and unstoppable."
      ]
    }
  }
};

export function getMascotDialogue(
  mascotId: MascotId,
  context: 'morning' | 'afterOneChallenge' | 'afterAllChallenges' | 'missedDay' | 'longStreak' | 'rareTap'
): string {
  const mascot = MASCOTS_DATA[mascotId] || MASCOTS_DATA['blue-slim'];
  const list = mascot.dialogues[context] || mascot.dialogues.morning;
  return list[Math.floor(Math.random() * list.length)];
}

export function getMascotNotificationDetails(mascotId: string = 'blue-slim', challengesLeft: number = 2) {
  const normId = mascotId || 'blue-slim';
  let image = '/mascots/blue-slim-notification.png';
  let title = 'Blue Slim is waiting for you';
  let body = `You have ${challengesLeft} challenges left today. Let’s grow together.`;

  if (normId === 'fire-slim') {
    image = '/mascots/fire-slim-notification.png';
    title = 'Fire Slim is ignited! 🔥';
    body = `Keep your streak burning hot! You have ${challengesLeft} challenges left today. Let's destroy them!`;
  } else if (normId === 'earth-slim') {
    image = '/mascots/earth-slim-notification.png';
    title = 'Earth Slim is grounding you 🌿';
    body = `Bloom and grow! You have ${challengesLeft} challenges left today. Let’s nurture your streak.`;
  } else if (normId === 'water-slim') {
    image = '/mascots/water-slim-notification.png';
    title = 'Water Slim is flowing 💧';
    body = `Flow like water! ${challengesLeft} challenges remaining today. Stay serene and focused.`;
  } else if (normId === 'shield-slim') {
    image = '/mascots/shield-slim-notification.png';
    title = 'Shield Slim standing guard 🛡️';
    body = `Guard your streak! Complete your ${challengesLeft} remaining challenges and lock in victory.`;
  } else if (normId === 'lightning-slim') {
    image = '/mascots/lightning-slim-notification.png';
    title = 'Lightning Slim supercharged! ⚡';
    body = `Speed through your goals! ${challengesLeft} challenges left. 2 minutes at lightspeed!`;
  }

  return { image, title, body, mascotId: normId };
}

