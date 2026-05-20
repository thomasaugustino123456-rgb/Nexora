import { ChallengeStep, PlantType } from '../types';

export interface BookSection {
  heading: string;
  text: string;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  coverColor: string;
  category: 'challenge' | 'plant' | 'health' | 'research';
  content: {
    title: string;
    sections: BookSection[];
  };
}

export const KNOWLEDGE_BOOKS: Book[] = [
  // --- CHALLENGE BOOKS ---
  {
    id: 'guide-pushups',
    title: 'The Pushup Protocol',
    description: 'Mastering the foundation of physical power.',
    icon: 'Zap',
    coverColor: 'bg-blue-600',
    category: 'challenge',
    content: {
      title: 'Structural Integrity: The Pushup Guide',
      sections: [
        {
          heading: 'Why Pushups?',
          text: 'Pushups are the ultimate test of functional strength. They build your chest, shoulders, triceps, and core simultaneously. In the Nexus, we use them as a daily anchor to ground your biological frequency.'
        },
        {
          heading: 'Proper Form',
          text: 'Keep your core tight, glutes engaged, and back flat. Lower yourself until your chest nearly touches the floor, then explode upward. Do not sag your hips, bro.'
        },
        {
          heading: 'Evolution Path',
          text: 'Start with what you can handle. Consistent daily reps are better than one high-volume session. Over time, your neural pathways will adapt to the load.'
        }
      ]
    }
  },
  {
    id: 'guide-water',
    title: 'Hydration Logic',
    description: 'Optimizing your biological coolant system.',
    icon: 'Droplet',
    coverColor: 'bg-cyan-500',
    category: 'challenge',
    content: {
      title: 'H2O Optimization Protocol',
      sections: [
        {
          heading: 'The Bio-Efficiency Loop',
          text: 'Water isn\'t just for thirst. It’s the medium for every chemical reaction in your body. Low hydration leads to brain fog and reduced physical output.'
        },
        {
          heading: 'Implementation',
          text: 'The Nexus suggests tracking every glass. Aim for consistent intake throughout the day rather than chugging a gallon at night. Your kidneys will thank you.'
        }
      ]
    }
  },
  {
    id: 'guide-breathing',
    title: 'Vagal Nerve Hacks',
    description: 'Controlled respiration for neural stability.',
    icon: 'Wind',
    coverColor: 'bg-indigo-500',
    category: 'challenge',
    content: {
      title: 'Resonance Breathing: Manual Override',
      sections: [
        {
          heading: 'The Parasympathetic Hook',
          text: 'By slowing your breath to 6 cycles per minute, you signal your nervous system to exit "fight or flight" mode. This is the fastest way to lower cortisol in the Nexus.'
        },
        {
          heading: 'Technique',
          text: 'Follow the expansion circle in the challenge. Inhale deeply through the nose, expand the belly, and exhale slowly through the mouth.'
        }
      ]
    }
  },
  {
    id: 'guide-gratitude',
    title: 'Cognitive Reframing',
    description: 'Rewiring the brain for abundance.',
    icon: 'Heart',
    coverColor: 'bg-rose-500',
    category: 'challenge',
    content: {
      title: 'Neural Gratitude: The Positive Feedback Loop',
      sections: [
        {
          heading: 'The Negativity Bias',
          text: 'Humans are evolved to notice threats more than rewards. By manually recording wins, you train your brain to identify opportunities and success patterns.'
        },
        {
          heading: 'Nexus Implementation',
          text: 'Write three specific things you are grateful for. Keep them varied. This simple act reduces activity in the amygdala, your brain\'s fear center.'
        }
      ]
    }
  },
  {
    id: 'guide-drawing',
    title: 'Creative Synapse',
    description: 'Unlocking non-linear problem solving.',
    icon: 'Palette',
    coverColor: 'bg-amber-500',
    category: 'challenge',
    content: {
      title: 'Creative Flow: The Sketch Protocol',
      sections: [
        {
          heading: 'Right-Brain Activation',
          text: 'Most of our day is Spent in analytical, left-brain mode. Drawing even for 60 seconds forces your brain to engage visual-spatial networks, sparking innovation.'
        },
        {
          heading: 'Focus Tip',
          text: 'Don\'t worry about being an "artist." The goal is the connection between eye, hand, and mind. It\'s a form of active meditation.'
        }
      ]
    }
  },

  // --- PLANT BOOKS ---
  {
    id: 'plant-crystal-guide',
    title: 'Crystal Prism-Root',
    description: 'The geometry of digital life.',
    icon: 'Zap',
    coverColor: 'bg-purple-500',
    category: 'plant',
    content: {
      title: 'Crystalline Vitality',
      sections: [
        {
          heading: 'Structural Mechanics',
          text: 'The Crystal root is rare. It feeds on the electricity of your consistency. It does not need water, but it needs your presence in the Nexus every 24 hours.'
        },
        {
          heading: 'Reward Protocol',
          text: 'Fully grown Crystal plants produce rare resonance that boosts your weekly XP gains by 5%.'
        }
      ]
    }
  },
  {
    id: 'plant-zen-guide',
    title: 'The Zen Bonsai',
    description: 'Cultivating inner peace through digital flora.',
    icon: 'Flower',
    coverColor: 'bg-emerald-500',
    category: 'plant',
    content: {
      title: 'Botany of the Void: Zen Bonsai',
      sections: [
        {
          heading: 'Origin',
          text: 'Born in the quietest corners of the Nexus Grid, the Zen Bonsai reflects the user\'s consistency. It thrives on calm, daily interactions.'
        },
        {
          heading: 'Care Routine',
          text: 'Check health daily. If the bonsai turns blue, it lacks attention. Growth is slow but permanent—a symbol of the long-term journey.'
        }
      ]
    }
  },
  {
    id: 'plant-desert-guide',
    title: 'Crystal Cactus',
    description: 'Resilience in the harshest digital environments.',
    icon: 'Sun',
    coverColor: 'bg-orange-500',
    category: 'plant',
    content: {
      title: 'Arid Protocols: The Crystal Cactus',
      sections: [
        {
          heading: 'Bio-Architecture',
          text: 'The Crystal Cactus stores energy in its translucent spines. It is highly resistant to neglect but glows brightest when synchronized with a heavy workout streak.'
        },
        {
          heading: 'Optimization',
          text: 'Do not overwater. This plant prefers high-intensity days followed by recovery. It is the perfect companion for the "Intense" commitment level.'
        }
      ]
    }
  },

  // --- HEALTH & RESEARCH ---
  {
    id: 'research-sleep',
    title: 'Circadian Mastery',
    description: 'The science of the recovery phase.',
    icon: 'Moon',
    coverColor: 'bg-slate-900',
    category: 'health',
    content: {
      title: 'Neural Refresh: The Sleep Protocol',
      sections: [
        {
          heading: 'The Glymphatic System',
          text: 'While you sleep, your brain literally washes away metabolic waste. Skipping sleep is like skipping a system update—you\'ll run on buggy, slow hardware.'
        },
        {
          heading: 'Nexus Tips',
          text: 'Stop blue light intake 60 minutes before shutdown. Keep your sleeping chamber cool. Use the meditation module to lower heart rate before dock.'
        }
      ]
    }
  },
  {
    id: 'research-focus',
    title: 'Dopamine Detoxing',
    description: 'Reclaiming your attention from the noise.',
    icon: 'Eye',
    coverColor: 'bg-purple-600',
    category: 'health',
    content: {
      title: 'Attention Sovereignty',
      sections: [
        {
          heading: 'The Addiction Loop',
          text: 'Modern apps are designed to hijack your dopamine. Nexora is designed to help you reclaim it. By focusing on simple, manual tasks like drawing or bubbles, you reset your threshold for pleasure.'
        },
        {
          heading: 'Actionable Advice',
          text: 'Spend 10 minutes in "Zen Mode" daily. No notifications, no scrolling, just existence. Notice the world outside the screen, bro.'
        }
      ]
    }
  }
];
