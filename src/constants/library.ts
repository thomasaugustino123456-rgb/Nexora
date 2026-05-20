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
  // --- CHALLENGE ZONE BOOKS ---
  {
    id: 'guide-pushups',
    title: 'The Pushup Protocol',
    description: 'Master skeletal alignment and explosive motor-neuron recruitment.',
    icon: 'Zap',
    coverColor: 'bg-blue-600',
    category: 'challenge',
    content: {
      title: 'Structural Force Dynamics: Pushup Blueprint',
      sections: [
        {
          heading: 'Neuromuscular Saturation',
          text: 'Pushups are not merely a random chest exercise, comrade; they represent the ultimate benchmark of kinetic-chain integrity. When you lock into a perfect pushup position, you are activating a complex neural loop that ignites your chest, anterior deltoids, triceps, and deep transverse abdominis simultaneously. In the Nexora Protocol, daily physical anchors serve to reset your bio-electric frequency and ground your central nervous system before cognitive deep dives.'
        },
        {
          heading: 'Biomechanics of safe torque',
          text: 'To avoid shoulder wear and joint degeneration, you must focus closely on biomechanical details. Begin by placing your palms flat on the deck, directly beneath your shoulders, with fingers spread wide to expand your grip surface. As you lower your torso, pull your elbows backward at a clean 45-degree angle, forming an arrow shape rather than a T. Maintain absolute core tension by squeezing your glutes and drawing your navel to your spine. Lower until your sternum brushes the deck, then explode upward to absolute lockout.'
        },
        {
          heading: 'Grease-The-Groove Progression',
          text: 'Forget training to failure; training to failure exhausts motor neurons and triggers systemic fatigue. Instead, implement our "Frequency Saturation" progression. Perform multiple non-exhausting sets (about 50-60% of your maximum rep capability) spread out through the day. This constant micro-stimulation triggers myelin sheath growth around your motor pathways, making the movement feel entirely effortless over a short two-week adaptation window.'
        }
      ]
    }
  },
  {
    id: 'guide-water',
    title: 'Hydration Logic',
    description: 'Deconstruct osmotic cell-clearance and cooling cycles.',
    icon: 'Droplet',
    coverColor: 'bg-cyan-500',
    category: 'challenge',
    content: {
      title: 'Oscillating Fluid Dynamics: Hydration Logic',
      sections: [
        {
          heading: 'The Aqueous Computer Science',
          text: 'Your cranium is essentially a supercomputer floating in a literal salt-water bath. The human brain is composed of approximately 75% water. When your systemic hydration falls by as little as 1% to 2%, your cellular osmotic balance shifts, slowing down nerve signal propagation. This cellular drag exhibits instantly as brain fog, delayed reaction speeds, working memory decay, and reduced physical coordination.'
        },
        {
          heading: 'Micro-Dosing vs Chugging',
          text: 'Gulping down a massive flask of pure tap water in under five seconds is highly inefficient. Doing so simply triggers a sharp volume expansion in your stomach, signaling your kidneys to flush the excess fluid immediately in an emergency reaction. Instead, practice the "Aqueous Micro-Dosing" protocol: take five to seven slow sips of cool, mineral-rich water every 30 to 45 minutes. This slow intake rate matches your gut absorption rate and ensures continuous cerebral hydration.'
        },
        {
          heading: 'Thermic Regulation Loop',
          text: 'Water is the primary coolant of human physiology. Under high intellectual stamina demands, your metabolic rate increases, releasing steady body heat. Perfect systemic hydration keeps your core temperatures balanced and maintains essential blood-plasma volumes. This directly prevents fatigue, keeps your joint cartilage thick and cushioned, and ensures rapid delivery of essential oxygen and glucose directly to your working muscle groups.'
        }
      ]
    }
  },
  {
    id: 'guide-breathing',
    title: 'Vagal Nerve Hacks',
    description: 'Slow respiratory feedback cycles to capture parasympathetic control.',
    icon: 'Wind',
    coverColor: 'bg-indigo-500',
    category: 'challenge',
    content: {
      title: 'Resonance Respiration: The Parasympathetic Override',
      sections: [
        {
          heading: 'The Vagal System Highway',
          text: 'The vagus nerve is the absolute superhighway of your parasympathetic nervous system, forming a vast bi-directional communication grid between your heart, lungs, stomach, and brain stem. When you experience high-stress spikes, your sympathetic nervous system hijacks this grid, locking you into a toxic "fight or flight" mode. By manually altering your respiratory patterns, you can instantly override this autonomic hijack.'
        },
        {
          heading: 'The 5.5-Second Resonance Loop',
          text: 'To activate the vagal brake, you must match your breathing to the natural resonant rhythm of your cardiovascular system. Inhale smoothly through your nostrils for exactly 5.5 seconds, allowing your diaphragm to expand outward, then exhale slowly through pursed lips for another 5.5 seconds. Repeating this resonant 11-second cycle six times per minute maximizes heart rate-variability (HRV) and locks your mind into a relaxed state of high alert.'
        },
        {
          heading: 'The Double Physiological Sigh',
          text: 'When acute anxiety strikes, use the rapid-response "Double Inhale Sigh." Take two sharp, successive breaths through your nose—one deep breath to inflate your lung lobes, followed immediately by a second quick sniff to pop open any collapsed microscopic air sacs. Release this air in a slow, audible exhale through your mouth. This instantly changes carbon dioxide ratios in your bloodstream, signaling your heart rate to slow.'
        }
      ]
    }
  },
  {
    id: 'guide-gratitude',
    title: 'Cognitive Reframing',
    description: 'Re-wire stimulus pathways of the cortex for objective confidence.',
    icon: 'Heart',
    coverColor: 'bg-rose-500',
    category: 'challenge',
    content: {
      title: 'Neuro-Plastic Redirection: Cognitive Reframing',
      sections: [
        {
          heading: 'Decoding Negativity Bias',
          text: 'From an evolutionary perspective, human consciousness is heavily wired to identify threats rather than appreciate rewards. Ancestral survival depended on noticing predators, meaning your amygdala is naturally sensitized to highlight risks, mistakes, and stressful problems. In the modern world, this bias causes continuous low-grade stress, saturating your bloodstream with lingering cortisol and reducing your daily capacity for growth.'
        },
        {
          heading: 'The Triad Victory Bio-Hack',
          text: 'To retrain your neurological pathways, you must run a deliberate "Victory Logging" script. Every evening, record exactly three highly specific micro-wins from your day. Do not write generic entries like "I ate nicely." Instead, describe concrete details: "I completed my deep work session with zero phone notifications." This active documentation forces your brain to search for progress tokens, gradually upgrading your cortical sensitivity to success patterns.'
        },
        {
          heading: 'Semantic System Override',
          text: 'The vocabulary you use inside your internal monologue directly programs your endocrine reactions. When you view a difficult task as an exhausting burden, your brain triggers a protective stress defense. Manually reprogram this reaction by modifying your verb usage: replace "I have to do this work" with "I get to master this challenge." This single word shift tricks the brain into viewing pressure as a playground, boosting intrinsic motivation.'
        }
      ]
    }
  },
  {
    id: 'guide-drawing',
    title: 'Creative Synapse',
    description: 'Trigger divergent thinking networks to break cognitive blocks.',
    icon: 'Palette',
    coverColor: 'bg-amber-500',
    category: 'challenge',
    content: {
      title: 'Divergent Spatial Synthesis: Sketch Protocol',
      sections: [
        {
          heading: 'Slipping Left-Brain Exhaustion',
          text: 'Modern tech routines demand intense left-brain analytical focus. Slogging through calculations, text logs, and structured lists for hours drains your logic circuits, causing severe executive fatigue. To restore balance, you must activate your right-brain divergent processing networks. Free sketching acts as a cognitive lever, shifting attention away from micro-analysis toward macro visual-spatial relationships.'
        },
        {
          heading: 'The 60-Second Doodle Link',
          text: 'Doodling is not a distraction; it is a rapid reboot button for your neural pathways. Moving a physical pen or digital cursor in freeform patterns triggers smooth ocular tracking, forcing your visual cortex to collaborate with your physical motor loops. This simple coordination clears heavy cognitive residue, reduces active brainwaves, and prepares your mind for creative breakthrough sessions.'
        },
        {
          heading: 'Aesthetic Flow State',
          text: 'Do not approach drawing with the stressing pressure of making "fine art." The therapeutic benefit of the Sketch Protocol is the connection between hand, eye, and mind. Abandon all expectations of perfection, sketch raw geometric shapes, trace your surroundings, or draw abstract symbols. This playful physical actions helps release mental stress, unlocking creative pathways and refreshing logic power.'
        }
      ]
    }
  },

  // --- BOTANY ZONE BOOKS ---
  {
    id: 'plant-zen-guide',
    title: 'The Zen Bonsai',
    description: 'Imbibe the lessons of slow, compound organic maturity.',
    icon: 'Flower',
    coverColor: 'bg-emerald-500',
    category: 'plant',
    content: {
      title: 'Slow Botany of the Void: Zen Bonsai',
      sections: [
        {
          heading: 'The Infinite Compound Loop',
          text: 'In our fast-paced society of instant notifications and gamified rewards, human attention spans are constantly fractured. Cultivating the Zen Bonsai in the Nexora Greenhouse serves as a direct antidote. Digital flora matures slowly, driven purely by the cadence of your daily consistent commitments. This organic pacing teaches your mind to appreciate the quiet power of compound micro-actions over long-term timelines.'
        },
        {
          heading: 'Visual Trimming Protocols',
          text: 'Pruning a Bonsai is a beautiful exercise in intentional edit. As you observe the branch formations, studying where light flows and where excess leaves block development, you are training your mind in executive planning. In life, edit is just as important as action; trimming away low-value habits and distractions is the only way to allow your energy to concentrate on truly magnificent branches.'
        },
        {
          heading: 'Patience as Cognitive Armor',
          text: 'As your Zen Bonsai grows, its trunk becomes thicker, twisting elegantly to reflect your daily patience. Letting page visits to your plant act as a mental checkpoint. When you feel anxious about a delayed reward in your physical life, look at your digital companion. Remember that magnificent things take seasons of quiet, underground preparation before they bloom.'
        }
      ]
    }
  },
  {
    id: 'plant-desert-guide',
    title: 'Crystal Cactus',
    description: 'Adapt to harsh deficits and deploy systemic spike defense.',
    icon: 'Sun',
    coverColor: 'bg-orange-500',
    category: 'plant',
    content: {
      title: 'Extreme Arid Adaptation: The Crystal Cactus',
      sections: [
        {
          heading: 'Metronome Deficit Storage',
          text: 'The Crystal Cactus is a magnificent masterclass in physical efficiency. Thriving in the driest micro-climates, this plant does not demand continuous superficial wetting. Instead, it absorbs moisture deeply during brief windows and stores it safely within its translucent crystalline tissues. It represents the ultimate physical spirit of stoic self-reliance under taxing dry spells.'
        },
        {
          heading: 'Spikes as Defensive Focus',
          text: 'Each needle on the cactus represents a highly optimized leaf that was rolled extremely tight to prevent evaporation and repel external predators. This teaches a valuable lesson for focus tracking: when you are locked inside a high-priority work sprint, you must roll up your boundary parameters. Deploy high-fidelity filters to guard your valuable time and deflect noisy alerts like defense pins.'
        },
        {
          heading: 'Streaks and Metabolic Fire',
          text: 'In the Greenhouse, Cactus growth spikes are tied precisely to your heaviest streak accomplishments. This mirrors biological hormesis—the process where exposing your body to short, controlled stressors (like intensive exercise or cold training) triggers cellular repair. Align your intensive days with the Cactus routines and watch your capacity for resilience expand.'
        }
      ]
    }
  },

  // --- BIO-SYSTEMS OVERRIDE BOOKS ---
  {
    id: 'research-sleep',
    title: 'Circadian Mastery',
    description: 'Execute deep cerebral waste-clearance and clock alignment.',
    icon: 'Moon',
    coverColor: 'bg-slate-900',
    category: 'health',
    content: {
      title: 'System Glymphatic Refresh: Sleep Optimization',
      sections: [
        {
          heading: 'The Cerebral Night Wash',
          text: 'While your conscious mind sleeps, your brain initiates a highly advanced neural cleaning process. The glymphatic system pumps cerebrospinal fluid throughout your cortical tissues, literally washing away metabolic waste and toxic proteins that accumulate during waking hours. Restricting this sleep window is equivalent to running software on fragmented, overheat server hardware.'
        },
        {
          heading: 'Lux frequency suppression',
          text: 'Your master biological clock is controlled by the suprachiasmatic nucleus, which monitors light intake. Exposure to high-intensity blue light after dusk blocks melatonin secretion. To fix this, build an ironclad light protocol: eliminate all digital screen inputs for 60 minutes before bed. This simple boundary triggers a massive melatonin cascade, prepping you for deep, refreshing sleep.'
        },
        {
          heading: 'Pre-Shutdown Docking Ritual',
          text: 'Treat your body like a vessel preparing to dock safely. Lower the ambient temperatures in your sleeping chamber; your brain requires a 1-degree drop in core heat to fall into deep non-REM sleep. Combine this cool temperature with a 5-minute resonance breathing set to settle your cardiovascular system, setting the stage for uninterrupted delta-wave sleep cycles.'
        }
      ]
    }
  },
  {
    id: 'research-focus',
    title: 'Dopamine Detoxing',
    description: 'Reclaim executive focus from chaotic digital stimulus loops.',
    icon: 'Eye',
    coverColor: 'bg-purple-600',
    category: 'health',
    content: {
      title: 'Striatum Sovereignty: Dopamine Calibration Protocol',
      sections: [
        {
          heading: 'The High-Frequency Hijack',
          text: 'Modern mobile feeds are designed to hijack your dopamine circuitry. By bombarding your brain with random, continuous micro-rewards, interfaces desensitize your ventral striatum. This constant saturation raises your baseline pleasure thresholds, making simple, long-term productive efforts like studying or physical exercise feel painfully dry and boring.'
        },
        {
          heading: 'Striatum Receptor Reboot',
          text: 'To escape this loop, you must initiate a deliberate "Dopamine Calibration" protocol. Design daily focus blocks of 60 to 90 minutes with zero distractions. Discard all notifications, lock down tab access, and allow your brain to sit with quiet, low-frequency tasks. This calm environment lets your dopamine receptors re-sensitize, restoring your baseline appreciation for slow, meaningful work.'
        },
        {
          heading: 'The Focus Space Matrix',
          text: 'True focus isn\'t a product of willpower; it is powered by intentional environment design. Remove temptation vectors by physically parking your smartphone in another room. Replace scroll triggers with rewarding, tactual activities like reading deep documentation, sketching on paper, or tending to physical plants. Reclaim control and enjoy focus sovereignty, bro.'
        }
      ]
    }
  }
];
