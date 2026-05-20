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
  },
  {
    id: 'guide-posture',
    title: 'The Posture Protocol',
    description: 'Establish absolute skeletal integrity and eliminate cerebral drainage.',
    icon: 'Shield',
    coverColor: 'bg-emerald-600',
    category: 'challenge',
    content: {
      title: 'Structural Spine Restoration: The Posture Blueprint',
      sections: [
        {
          heading: 'Cerebral Kinetic Alignment',
          text: 'Slouching isn\'t just a bad visual habit, bro; it is physical drainage. When your head tilts forward, the muscular skeletal load on your cervical spine increases by up to 30 pounds. This sustained muscle contraction constricts major blood pathways, reducing blood and oxygen supply directly to your logic centers and resulting in rapid cognitive exhaustion.'
        },
        {
          heading: 'The Ergonomic Lockout Technique',
          text: 'To lock down perfect thoracic extension, apply the "Scapular Trigger." Draw your shoulder blades gently down and back as if sliding them into your back pockets. Elevate your sternum by two inches, and pull your ears directly back over your shoulders. Plant both feet flatly on the support deck to evenly anchor pelvic weight, immediately releasing pressure and easing deep breathing.'
        },
        {
          heading: 'Isometric Spinal Maintenance',
          text: 'Set an hourly micro-cue. Every 60 minutes, perform a "Wall Angel" or simple chin-tuck lock. Press your back of head, shoulders, and hips flat against a secure surface, holding for 30 seconds. This simple isometric activation resets neural tone, reinforces structural muscle memory, and locks in pristine vertical alignment.'
        }
      ]
    }
  },
  {
    id: 'research-cold',
    title: 'Thermal Hormesis',
    description: 'Trigger systemic vaso-constriction and norepinephrine release.',
    icon: 'Snowflake',
    coverColor: 'bg-blue-500',
    category: 'health',
    content: {
      title: 'Arctic Neuro-Chemical Reboot: Thermal Hormesis',
      sections: [
        {
          heading: 'The Norepinephrine Surge',
          text: 'Plunging into cold water (below 55°F/13°C) triggers an immediate thermal response. Your body initiates a dramatic, safe endocrine surge, releasing norepinephrine up to 500% above baseline. This is not just a wake-up call; norepinephrine acts as a powerful anti-inflammatory and cognitive optimizer that clears neural fog instantly.'
        },
        {
          heading: 'Systemic Vaso-Constriction Loop',
          text: 'Cold water exposure forces blood away from your extremities and inward to secure vital organs, activating deep internal warmth. This vaso-constriction flushes metabolic debris from peripheral tissues. When you exit, natural dilatory warming floods clean, high-oxygen blood back to your limbs, triggering a supreme feeling of physical restoration.'
        },
        {
          heading: 'Somatic Breath Hardening',
          text: 'The initial cold contact triggers an automatic hyperventilation reflex. To conquer this, you must run our "Calm Control" protocol. Override the panic signal by long, slow exhales. Keeping your respirations steady at 6 breaths per minute under extreme cold exposure builds immense mental power, transferring absolute composure into daily high-pressure life situations.'
        }
      ]
    }
  },
  {
    id: 'research-fasting',
    title: 'Autophagy Sync',
    description: 'Initiate cellular self-cleaning and elevate ketone utility.',
    icon: 'Activity',
    coverColor: 'bg-indigo-600',
    category: 'health',
    content: {
      title: 'Cellular Reclamation Cycles: Autophagy Sync',
      sections: [
        {
          heading: 'Molecular Housekeeping',
          text: 'When you secure a metabolic fasting window of 16 hours or more, your cells trigger "autophagy"—designing internal cleanup systems that identify, digest, and recycle damaged organelles, stale proteins, and metabolic garbage. This is cellular rejuvenation, removing dysfunctional structures and restoring high cellular performance.'
        },
        {
          heading: 'Ketotic Cognitive Fueling',
          text: 'As liver glycogen stores decrease, your hepatocytes transition to burning fat reserves, synthesizing ketones (beta-hydroxybutyrate). Ketones are a super-clean, high-output fuel source for cerebral mitochondria, producing more adenosine triphosphate (ATP) per oxygen unit than glucose while generating zero toxic oxidative waste products.'
        },
        {
          heading: 'Strategic Re-entry Matrix',
          text: 'How you conclude a fasting cycle is critical, bro. Avoid blasting your system with rapid high-glycemic carbohydrates or cheap processed snacks. This causes massive insulin spikes and digest fatigue. Re-entry should consist of clean bone broths, healthy fats like avocado, and easily digestible amino acids, maintaining high focus levels.'
        }
      ]
    }
  },
  {
    id: 'plant-mycelium',
    title: 'Symbiotic Fungi',
    description: 'Deploy subterranean mycelial networks to synchronize resource routing.',
    icon: 'Sprout',
    coverColor: 'bg-purple-800',
    category: 'plant',
    content: {
      title: 'Wood Wide Web Logic: Symbiotic Mycelium',
      sections: [
        {
          heading: 'Dynamic Subterranean Routing',
          text: 'Beneath the forest floor lies an organic network of ultra-thin mycelial threads. These fungi fuse directly with plant root tips, creating a massive, collaborative distribution web. Rather than engaging in selfish isolate competition, flora and fungi use this highway sync to feed nutrition, sugars, and warnings directly to weaker trees.'
        },
        {
          heading: 'Chemical Signal Transmission',
          text: 'When a plant is attacked by defensive pests, it transmits warning signals through the mycelial network to adjacent flora. Upon receiving this warning, neighboring plants immediately begin synthesizing protective defense chemicals. This subterranean internet teaches a profound lesson in interconnected, collaborative community resilience.'
        },
        {
          heading: 'The Soil Enrichment Engine',
          text: 'Fruiting mushrooms represent only the tiny surface tip of a vast organic engine that continuously decomposes tough raw matter into rich, fertile soils. Similarly, your daily micro habits and deep archives logs are the underlying subterranean foundation that feeds and nurtures your visual garden greenhouse.'
        }
      ]
    }
  },
  {
    id: 'guide-binaural',
    title: 'Auditory Brainwaves',
    description: 'Leverage binaural frequency delta/theta differentials to guide mental focus.',
    icon: 'Music',
    coverColor: 'bg-pink-600',
    category: 'challenge',
    content: {
      title: 'Neuro-Entrainment Harmonics: Auditory Brainwaves',
      sections: [
        {
          heading: 'The Differential Frequency Trick',
          text: 'When you feed a sound of 400Hz to your left ear and 440Hz to your right ear, your temporal lobe cannot process them as separate inputs. Instead, it synthesizes an internal "differential beat" of exactly 40Hz. This cognitive differential matches a perfect Gamma wave frequency, pulling your neural circuits into dynamic focus.'
        },
        {
          heading: 'Somatic Frequency Zones',
          text: 'By changing these differential margins, you can easily guide your focus state. Set a 4Hz to 7Hz differential to tap into creative Theta waves, perfect for freeform sketching or creative synapse exercises. Switch to 10Hz to 14Hz Alpha waves to foster a relaxed, calm working flow state that minimizes systemic anxiety.'
        },
        {
          heading: 'Acoustic Isolation Cues',
          text: 'Combine binaural frequency loops with continuous brown or pink ambient noise. This acoustic texture blankets distracting room echoes and sudden outer noises, protecting your working memory from shock disruptions. Put on your headphones, trigger the sound waves, and establish complete acoustic isolation.'
        }
      ]
    }
  },
  {
    id: 'guide-forest',
    title: 'Phytoncide Bathing',
    description: 'Inhale airborne organic terpenes to reduce systemic cytokine indices.',
    icon: 'Compass',
    coverColor: 'bg-teal-600',
    category: 'challenge',
    content: {
      title: 'Somatic Forest Immersion: Phytoncide Chemistry',
      sections: [
        {
          heading: 'Inhaling Organic Shields',
          text: 'Redwood trees and old-growth pines release "phytoncides"—antimicrobial organic compounds designed to protect the tree from invasive insects or fungal rot. When humans inhale these active terpenes during forest walking, our bodies trigger a rapid protective response, boosting natural killer white blood cells.'
        },
        {
          heading: 'Cortisol Suppression Dynamics',
          text: 'Spending as little as 30 minutes walking calmly through old growth forests suppresses cortisol by more than 16% and lowers elevated systolic blood pressure. This isn\'t just a simple feeling of calm; it represents direct systemic reduction of inflammatory cytokine markers, refreshing your biological health.'
        },
        {
          heading: 'The Sensory Grounding Trail',
          text: 'Maximize forest bathing by engaging all your senses. Observe the rich green lichen, touch the rough redwood bark, and inhale the earthy petrichor. This multi-layered focus anchors your sensory attention to the present moment, clearing away heavy digital memory overload and restoring your mental capacity.'
        }
      ]
    }
  },
  {
    id: 'guide-saccadic',
    title: 'Optimal Saccades',
    description: 'Deploy rapid optical pursuit drills to coordinate spatial balance.',
    icon: 'Eye',
    coverColor: 'bg-blue-800',
    category: 'challenge',
    content: {
      title: 'Target Saccadic Drills: Eye Movement Protocol',
      sections: [
        {
          heading: 'The Optical Brain Connection',
          text: 'Your eye tracking movement is highly tied to your cerebellum and prefrontal cortex. Staring continuously at a static screen at a single fixed distance causes visual muscle strain and limits peripheral sensory inputs, triggering systemic fatigue and shutting down spatial tracking circuits.'
        },
        {
          heading: 'Pursuit Tracking Training',
          text: 'Perform rapid horizontal saccades to re-engage your cerebellum. Extend both thumbs outward, and hold them 18 inches apart at eye level. Rapidly look back and forth from left thumb to right thumb without moving your neck, repeating for 30 cycles. This physical action refreshes optic coordination and resets cognitive reflexes.'
        },
        {
          heading: 'The Near-Far Reset Loop',
          text: 'Prevent visual degradation by running the 20-20-20 rule. Every 20 minutes, focus your eyes on an object at least 20 feet away for 20 seconds. This shifts your ciliary lens muscles from deep near-contraction into absolute relaxation, instantly relieving optic strain and supporting sustained focus.'
        }
      ]
    }
  },
  {
    id: 'research-nutrition',
    title: 'Nootropic Nutrition',
    description: 'Feed essential lipids and antioxidants to build high-fidelity myelin sheaths.',
    icon: 'Flame',
    coverColor: 'bg-orange-600',
    category: 'health',
    content: {
      title: 'Cortical Cellular Fueling: Nootropic Nutrition',
      sections: [
        {
          heading: 'The Myelin Lipid Shield',
          text: 'Your brain cells communicate through long axons wrapped inside insulated protective sleeves called myelin sheaths. These sheaths are composed of 80% natural lipids. Consuming clean, high-fidelity essential fatty acids (specifically omega-3 DHA and EPA found in walnuts and wild-derived fish) reinforces this vital insulating shield, accelerating nerve signals.'
        },
        {
          heading: 'Antioxidant Oxidative Block',
          text: 'Your brain consumes a massive 20% of your body\'s total oxygen supply, exposing its cells to continuous oxidative friction. Dark polyphenol-rich foods like wild blueberries, clean raw cacao, and green tea act as powerful antioxidant filters, sweeping away free radicals before they can damage your cells.'
        },
        {
          heading: 'The Blood-Brain Integrity Barrier',
          text: 'Your blood-brain barrier is highly selective, letting only vital fuels pass through. Feed it clean, whole foods and avoid processed seed oils or excess refined sugars that trigger gut inflammation. A clean, calm gut microbiome communicates directly with your brain via the vagus pathway to ensure superb daily mood balance.'
        }
      ]
    }
  },
  {
    id: 'plant-carnivorous',
    title: 'Carnivorous Catch',
    description: 'Thrive on nutrient deficits with precise fluid biochemical traps.',
    icon: 'Flower',
    coverColor: 'bg-violet-600',
    category: 'plant',
    content: {
      title: 'Carnivorous Adaptations: The Pitcher Protocol',
      sections: [
        {
          heading: 'Thriving in Barren Swamps',
          text: 'The Carnivorous Pitcher plant thrives in acidic soils entirely devoid of typical plant nutrition like nitrogen and phosphorus. Rather than suffering from these severe deficits, this plant evolved leaves into beautiful fluid cavities that attract, capture, and digest external elements.'
        },
        {
          heading: 'The Slip Surface Geometry',
          text: 'The rim of the pitcher is coated in slippery waxes and water-receptive grooves. When a target steps onto this rim, it loses traction instantly and slides into the digestive reservoir. This is nature\'s absolute peak optimization: utilizing geometry rather than spending active energy to capture resources.'
        },
        {
          heading: 'Converting Inputs to Growth',
          text: 'Inside the pitcher, active enzymatic fluids break down raw material into basic elements, supplying the plant with premium energy. In your digital journey, view heavy challenges not as stressful blockers, but as delicious raw inputs to digest and convert directly into experience milestones.'
        }
      ]
    }
  },
  {
    id: 'research-neurogenesis',
    title: 'Neurogenesis Synapse',
    description: 'Synthesize brain-derived neurotrophic factor to forge neural pathways.',
    icon: 'LineChart',
    coverColor: 'bg-purple-600',
    category: 'health',
    content: {
      title: 'Adult Cortical Expansion: Neurogenesis Synapse',
      sections: [
        {
          heading: 'The Adult Neurogenesis Proof',
          text: 'For decades, doctors falsely assumed that humans were born with a fixed set of brain cells that slowly decayed over time. Modern neuroscience has proven that your hippocampus continues synthesizing brand new neurons throughout your adult life, a remarkable process known as adult neurogenesis.'
        },
        {
          heading: 'The BDNF Growth Catalyst',
          text: 'Brain-Derived Neurotrophic Factor (BDNF) acts as an organic fertilizer for your gray matter, protecting existing cells and triggering the growth of fresh neural connections. You can dramatically ramp up BDNF synthesis through daily aerobic exercise, deep restorative sleep, and consistent learning challenges.'
        },
        {
          heading: 'Synaptic Pruning Sovereignty',
          text: 'Your brain continuously runs a baseline optimization script: "use it or lose it." Pathways that are rarely activated are pruned away, while circuits that you consistently trigger are heavily reinforced with thick protective myelin. Consistently review these archives, clear daily goals, and feed your mental garden.'
        }
      ]
    }
  },
  {
    id: 'app-purpose',
    title: 'Nexora Ecosystem',
    description: 'Deconstruct how Nexora gamifies somatic wellness and real-life focus anchors.',
    icon: 'Compass',
    coverColor: 'bg-emerald-700',
    category: 'research',
    content: {
      title: 'Nexora Ecosystem: Core Architectural Philosophy',
      sections: [
        {
          heading: 'Connecting Digital and Biological Gardens',
          text: 'Nexora is not just an ordinary gamified tracker, bro. It functions as a gorgeous cyber-biological greenhouse where your real-world activities act as nourishment. When you complete real physiological anchors (hydration checks, pushups, resonant breathing cycles), you earn Life Essences to feed and grow high-tech bioluminescent plant species digitally.'
        },
        {
          heading: 'Dopamine Loop Re-alignment',
          text: 'Traditional gaming loops deplete your dopamine receptors by rewarding unproductive digital milestones. Nexora flips this dynamic on its head. By aligning gamified growth with genuine, highly optimized habits, we turn your natural desire for achievement into a powerful driver for absolute physical and mental wellness.'
        },
        {
          heading: 'Building Your Virtual Oasis',
          text: 'Each plant you cultivate and each book you unlock represents direct real-world dedication. Your digital showcase acts as a visual monument to your real physical health. As your garden flourishes with colorful alien flora, you are building an authentic, beautiful representation of your own resilient and optimized mind.'
        }
      ]
    }
  },
  {
    id: 'self-care',
    title: 'Self-Care & Balance',
    description: 'Learn to synchronize circadian rhythms, hydration, and positive cognitive loops.',
    icon: 'Heart',
    coverColor: 'bg-rose-500',
    category: 'health',
    content: {
      title: 'Somatic Wellness Mastery: The Self-Care Protocol',
      sections: [
        {
          heading: 'Circadian Light Alignment',
          text: 'Taking care of yourself begins with the solar clock, bro. Gaze directly at natural sunlight within 30 minutes of waking for 5 to 10 minutes. This photons-to-retina cascade triggers cortisol release at the perfect biological peak while programming your internal sleep clock for automatic, deep melatonin synthesis tonight.'
        },
        {
          heading: 'Somatic Rest Cycles',
          text: 'True high-productivity rests on a foundation of deliberate relaxation. Build micro-sessions of continuous deep, quiet breathing or simple floor stretching. Releasing mechanical tension from your hips and shoulders lowers systemic muscle tightness, sending clear safety signals directly back to your nervous system.'
        },
        {
          heading: 'The Positive Memory Anchor',
          text: 'Self-care isn\'t soft; it is supreme strategic maintenance. Maintain a high-contrast cognitive framework by documenting three daily small wins inside Nexora. This physical reinforcement fires dopamine loops that actively shield your emotional reserves, preventing toxic burnout and sustaining your drive.'
        }
      ]
    }
  },
  {
    id: 'challenge-practice',
    title: 'Challenge Drills',
    description: 'Optimize the execution of physical, hydration, and breathing protocols.',
    icon: 'Dumbbell',
    coverColor: 'bg-amber-600',
    category: 'challenge',
    content: {
      title: 'Rhythmic Physical Mastery: Practicing Challenges',
      sections: [
        {
          heading: 'The Daily Anchoring Ritual',
          text: 'Do not approach challenges as a set of exhausting, high-friction chores. Anchor them to existing environmental cues instead. Trigger five deep resonance breaths immediately when walking up stairs, or perform a set of clean pushups right after closing your evening work terminal. Anchoring wipes away decision friction completely.'
        },
        {
          heading: 'Pristine Kinetic Standards',
          text: 'Never trade quality for raw numbers. Five absolutely flawless, slow, deeply controlled pushups with absolute core lockout are infinitely superior to twenty quick, sloppy repetitions. By emphasizing biomechanical perfection, you optimize deep motor-neuron connectivity and protect your joints from microscopic damage.'
        },
        {
          heading: 'Adapting the Intensity Dial',
          text: 'Listen to your body daily. If your nervous system feels completely drained from heavy real-world tasks, turn down the intense exercises and pivot to longer, soothing Vagal breathing sessions. Consistency is the ultimate multiplier; adapting your challenges ensures you never break the streak.'
        }
      ]
    }
  },
  {
    id: 'shop-upgrades',
    title: 'Ecosystem Shop',
    description: 'Unlock exotic seeds, legendary custom pots, and biological boosters.',
    icon: 'ShoppingBag',
    coverColor: 'bg-violet-700',
    category: 'research',
    content: {
      title: 'Upgrade Dynamics: The Merchant Blueprint',
      sections: [
        {
          heading: 'Exotic Bio-Seed Sourcing',
          text: 'Your earned Essences are the currency of progress inside Nexora, bro. Visit our interactive Merchant shop to secure exotic seeds, such as the Symbiotic Mycelium, Carnivorous Pitcher, or Crystal Cactus. Every seed represents distinct visual growth patterns and introduces a fresh theme to your greenhouse.'
        },
        {
          heading: 'The Power of Organic Upgrades',
          text: 'Buying custom handcrafted pots and biological soil boosters will speed up plant germination and enhance beauty. Advanced pots offer structural bonuses like hydration optimization, helping you grow magnificent rare botanical specimens with easier maintenance loops.'
        },
        {
          heading: 'Ecosystem Balance Loop',
          text: 'Maintain a diversified garden! Unlocking a broad variety of flora in the shop keeps your digital environment highly resilient. The broader and healthier your garden grows, the greater your passive daily wellness bonuses become, mirroring the balanced variety of your own real-life habits.'
        }
      ]
    }
  },
  {
    id: 'winter-warmth',
    title: 'Cozy Winter Fluids',
    description: 'What to drink in freezing winter to trigger rapid thermal response.',
    icon: 'Droplet',
    coverColor: 'bg-cyan-600',
    category: 'health',
    content: {
      title: 'The Thermogenic Fluid Shield: Winter Warmth',
      sections: [
        {
          heading: 'The Thermogenic Fluid Shield',
          text: 'When winter winds freeze, bro, staying warm isn\'t just about cozy coats. Drinking warm beverages like herbal tisanes, lemon-ginger brews, or clean hot water initiates internal thermogenesis. The heat warms your esophagus and thoracic vessels directly, speeding up blood circulation to chilly extremities!'
        },
        {
          heading: 'The Hidden Winter Dehydration Trap',
          text: 'Did you know you dehydrate just as fast in the winter, bro? Cold dry air depletes moisture from your breath, but since you don\'t feel hot, you forget to drink. Keep an eye on your water schedule to maintain premium metabolic rate and keep body temperature steady.'
        },
        {
          heading: 'Perfect Warming Recipes',
          text: 'Boil clean filtered water, add a thick slice of fiery ginger, a splash of raw lemon juice, and a tiny pinch of cayenne pepper! This simple, sugar-free formula opens up blood vessels, fires thermoreceptors, and builds instant internal fire without heavy caffeine crashes.'
        }
      ]
    }
  },
  {
    id: 'immune-water',
    title: 'Immunity & Hydration',
    description: 'Discover how drinking proper amounts of water supercharges lymphatic cells.',
    icon: 'Shield',
    coverColor: 'bg-emerald-600',
    category: 'health',
    content: {
      title: 'The Lymphatic Transport System: Immunity Booster',
      sections: [
        {
          heading: 'The Lymphatic Transport System',
          text: 'Your immune cells travel in a clean fluid called lymph, which is 95% water, bro. When you are dehydrated, your lymph becomes thick and sluggish. Drinking enough water ensures your white blood cell defenders can flow at high speeds to neutralize pathogens before they multiply!'
        },
        {
          heading: 'Mucosal Barrier Integrity',
          text: 'The wet membranes in your nose and throat are your body\'s frontline shields. They secrete active immunoglobulins to trap viruses. If you dry out, these mucosal shields crack wide open, leaving you vulnerable. Keep your body wet to keep the shield up!'
        },
        {
          heading: 'Consistent Flushing Action',
          text: 'Make a habit of sipping clean water consistently. This flushes lingering dry throat microbes down into the stomach, where active digestive enzymes safely destroy them. Hydrating is simple, natural, and highly bulletproof disease prevention.'
        }
      ]
    }
  },
  {
    id: 'warning-adaptation',
    title: 'The Stagnation Signs',
    description: 'Red flags that show your body is crying for physical challenges and drills.',
    icon: 'Activity',
    coverColor: 'bg-red-500',
    category: 'challenge',
    content: {
      title: 'Warning Signs of Stagnation: Time to Practice',
      sections: [
        {
          heading: 'Mental Fog and Low Drive',
          text: 'When you omit daily physical challenges, your dopamine receptors become sluggish, bro. If you find yourself scrolling mindlessly, feeling morning lethargy, or lacking cognitive focus, it is a warning sign of sensory deprivation. Your body is screaming for movement and oxygen!'
        },
        {
          heading: 'Chronic Joint & Spine Tightness',
          text: 'Sitting idle for hours causes cervical and lumbar joints to dry out, resulting in constant muscle tension. This mechanical lock reduces the blood supply to your spinal muscles. Don\'t ignore stiffness; it\'s your skeletal blueprint warning you to complete stretching drills.'
        },
        {
          heading: 'Unlocking the Adaptation Spark',
          text: 'Bust through stagnation instantly. Run a single set of maximum pushups or trigger a 5-minute deep Vagal breathing loop. This rapid metabolic shift restarts dopamine production, opens blood flow, and signals your neurochemistry to re-engage with your day.'
        }
      ]
    }
  },
  {
    id: 'sport-essentials',
    title: 'Sport Kinetics & Recovery',
    description: 'Essential requirements, fuel, and somatic practices for peak performance.',
    icon: 'Trophy',
    coverColor: 'bg-amber-500',
    category: 'challenge',
    content: {
      title: 'Peak Somatic Vigor: Sport & Athletics Blueprint',
      sections: [
        {
          heading: 'The Muscle Glycogen Load',
          text: 'Performing sports requires proper muscular fuel and active range of motion, bro. Without healthy electrolyte balances (sodium, potassium, magnesium), your muscles suffer microscopic muscle spasms and lactic acid backup, leading to painful cramps and slow recovery times.'
        },
        {
          heading: 'Dynamic vs. Static Warmups',
          text: 'Never run sports with cold joints. Initiate dynamic lunges, arm circles, and leg swings to warm synovial fluid first. Save deep, static stretches for after your activity when the tissues are warm, enabling perfect flexibility and structural safety.'
        },
        {
          heading: 'Post-Sport Supercompensation',
          text: 'Your recovery window determines your progress. Consume clean, simple proteins, plenty of clean fluids, and ensure 8+ hours of deep restorative sleep. This accelerates myelin synthesis, repairs muscle fibers, and builds awesome athletic endurance.'
        }
      ]
    }
  },
  {
    id: 'coffee-counting',
    title: 'The Hydration Debate',
    description: 'Do caffeinated coffee and tea actually count toward your daily water metrics?',
    icon: 'Flame',
    coverColor: 'bg-orange-500',
    category: 'research',
    content: {
      title: 'The True Fluid Metrics: Coffee, Tea & Water Intake',
      sections: [
        {
          heading: 'The Mild Diuretic Reality',
          text: 'Many people claim coffee and tea don\'t count because caffeine acts as a diuretic, bro. But science shows that for regular drinkers, a light moderate caffeine load does not cause net body water loss! Your body easily adapts to the formula, absorbing the hydration benefits.'
        },
        {
          heading: 'Establishing Clean Limits',
          text: 'While the fluids do count, avoid overloading your system with sugary syrups, artificial creamers, or excessive amounts of concentrated caffeine. Too much caffeine triggers cortisol spikes, elevating baseline stress and disrupting evening restorative REM sleep cycles.'
        },
        {
          heading: 'The Pure Water Baseline',
          text: 'Treat coffee and tea as bonus fluids, but keep clean, pure mineral water as your absolute main hydration anchor. Drinking crisp, unflavored water ensures your kidneys filter metabolic elements with zero extra digestive stress, maintaining high energy.'
        }
      ]
    }
  },
  {
    id: 'heart-hydraulic',
    title: 'Heart Hydraulics',
    description: 'How hydration maintains healthy blood viscosity and relieves cardiac strain.',
    icon: 'Heart',
    coverColor: 'bg-red-600',
    category: 'health',
    content: {
      title: 'Cardiovascular Pressure Balance: Hydration Hydraulics',
      sections: [
        {
          heading: 'The Viscosity Struggle',
          text: 'Your heart is a robust hydraulic pump, bro. When you skip drinking fluids, your total blood volume drops, making blood thick and honey-like. To maintain adequate oxygen flow, your heart has to pump double as hard, skyrocketing blood pressure!'
        },
        {
          heading: 'Vascular Compression Support',
          text: 'Drinking proper fluids keeps blood vessels elastic and flexible. It ensures smooth blood flow, allowing high-quality oxygen and vital nutrients to enter your organs smoothly while putting zero unnecessary friction on your arterial walls.'
        },
        {
          heading: 'Establishing Long-Term Vigor',
          text: 'Sipping clean water throughout the day acts as a continuous somatic heart massage. It guarantees proper stroke volume and maintains balanced blood pressure baseline values, building resilient, bulletproof cardiovascular health.'
        }
      ]
    }
  },
  {
    id: 'cellular-glow',
    title: 'Dermal Moisture Sync',
    description: 'Pristine glowing skin begins at the deep cellular and digestive level.',
    icon: 'Palette',
    coverColor: 'bg-pink-500',
    category: 'health',
    content: {
      title: 'Cosmetic Cellular Rejuvenation: Healthy Skin From Within',
      sections: [
        {
          heading: 'The Deep Intestinal Connection',
          text: 'Outer skin health is a direct mirror of inner digestion and cellular hydration, bro. Costly visual face creams can only do so much. When your gut barriers are dry and inflamed, toxins enter blood pathways and flare up on your face as dry skin and blemishes.'
        },
        {
          heading: 'Saturating the Collagen Matrix',
          text: 'Your skin feels plump and bouncy when your dermal collagen matrix is fully saturated with water molecules. Proper hydration optimizes sebum balance, naturally lubricating your face, closing active pores, and creating a gorgeous, energetic glowing look!'
        },
        {
          heading: 'The Inner Rejuvenation Routine',
          text: 'Ditch the sugary sodas that trigger skin glycation. Drink fresh lemon-infused water, consume clean fats (omega-3s), and maintain consistent water habits. Your skin cells will flush out accumulated micro-debris, radiating high-fidelity vitality.'
        }
      ]
    }
  },
  {
    id: 'neural-fluid',
    title: 'The Hydrated Brain',
    description: 'Maintain cognitive focus by preventing cerebral shrinkage.',
    icon: 'BookOpen',
    coverColor: 'bg-blue-600',
    category: 'research',
    content: {
      title: 'Cerebral Tissue Hydraulics: Water and Your Brain',
      sections: [
        {
          heading: 'Cerebral Tissue Shrinkage',
          text: 'Your brain cells are 75% water, bro. When hydration drops by mere 2%, your brain tissue physically starts to shrink away from the skull, triggering headaches and forcing the brain to spend massive energetic reserves just to process basic logic tasks!'
        },
        {
          heading: 'Synaptic Signal Speed',
          text: 'Cognitive focus relies on rapid electrical charge transfers between synapses. Water facilitates clean, fast movement of vital sodium and potassium ions through cell borders. Keep your brain fully hydrated to lock in rapid reflexes and high memory recall.'
        },
        {
          heading: 'Clearing Out Cerebral Debris',
          text: 'During sleep, your brain is washed by cerebrospinal fluid, removing accumulated metabolic toxins. Drinking a tall, clean glass of water right when waking instantly rehydrates this clearing system, throwing away morning fog and starting your brain engine.'
        }
      ]
    }
  },
  {
    id: 'active-mom',
    title: 'The Energetic Mom',
    description: 'Fun actionable tricks for busy mothers to stay healthy, hydrated, and active.',
    icon: 'Compass',
    coverColor: 'bg-teal-500',
    category: 'health',
    content: {
      title: 'High-Energy Motherhood: Active Parenting Blueprint',
      sections: [
        {
          heading: 'The Active Family Hydration Game',
          text: 'Being a mother is a supreme high-intensity workout, bro! Turn daily hydration into a playful garden challenge with your children. Play the "Plant Nanny" rule: every time your child drinks, you take a refreshing zip. This keeps the whole team hydrated and smiling!'
        },
        {
          heading: 'Playground Kinetic Drills',
          text: 'Do not stress if you cannot visit a commercial gym. Turn playground time into clean functional movement! While your kids play, do slow calf raises, beautiful bench steps, or perfect wall pushups. Your children get to watch a passionate, healthy role model!'
        },
        {
          heading: 'Crafting Micro Rest Zones',
          text: 'Moms carry immense cognitive loads. Carve out tiny 2-minute "Me-Time" breathing boxes. Practice slow nasal inhales and long, calming mouth sighs while holding a warm ceramic cup. This simple vagal reset clears stress loops, keeping you patient and strong.'
        }
      ]
    }
  },
  {
    id: 'womens-wellness-deep',
    title: 'Women\'s Somatic Wellness',
    description: 'Synchronize sleep, physical training, and hydration for peak vital balances.',
    icon: 'Activity',
    coverColor: 'bg-rose-600',
    category: 'health',
    content: {
      title: 'Somatic Synergies: Women\'s Health & Active Recovery',
      sections: [
        {
          heading: 'Hormonal Fluid Fluctuations',
          text: 'A woman\'s biological cycle triggers natural fluid retention and temperature changes, bro. During high-progesterone phases, metabolic rate goes up, increasing sweat and water needs. Adjust your intake margins, adding light sea salt to keep minerals solid.'
        },
        {
          heading: 'Restorative Sleep Architecture',
          text: 'Quality rest is crucial for female nervous system recovery. Turn off bright LED phone screens 1 hour before bed, and sleep in a cool, dark room. High hydration and physical movement through the day help guarantee deeper slow-wave sleep cycles.'
        },
        {
          heading: 'Somatic Exercise Balancing',
          text: 'Don\'t drain your energy by pushing heavy training when your body feels flat. Match exercises to your natural energy flow: do intense workouts during peak strength states, and switch to gentle pelvic flows, yoga, or walks during quiet recovery states.'
        }
      ]
    }
  },
  {
    id: 'pregnant-joy',
    title: 'Pregnancy Refreshment',
    description: 'Making the beautiful pregnancy journey a refreshing, hydrated, and joyful path.',
    icon: 'Heart',
    coverColor: 'bg-purple-500',
    category: 'health',
    content: {
      title: 'The Maternal Hydraulic Loop: Pregnancy Hydration',
      sections: [
        {
          heading: 'The Twin Hydraulic Loop',
          text: 'During pregnancy, your body synthesizes a massive 50% more blood, bro! This beautiful fluid supports the growing placenta and baby. Excellent hydration is vital to maintain amniotic fluid levels and ensure proper nutrient pathways reach the child.'
        },
        {
          heading: 'Cooling Down Morning Distress',
          text: 'Morning sickness can dry you out rapidly. Battle this by sipping cold, sparkling strawberry or ginger-lemon-infused water in tiny, easy portions. Ginger calms the stomach nerves naturally, while the bubbly water quickly cools down core temperatures.'
        },
        {
          heading: 'Low-Impact Muscle Care',
          text: 'Support your back and pelvis by doing gentle swimming, cozy forest walks, and soft stretching. Keep a colourful, happy bottle nearby to sip constantly, washing away leg cramps and keeping your joints fully cushioned and happy.'
        }
      ]
    }
  },
  {
    id: 'period-hydration-deep',
    title: 'Cycle Flow Support',
    description: 'Sipping clean warm fluids to soothe uterine cramps and optimize cycle energy.',
    icon: 'Activity',
    coverColor: 'bg-pink-600',
    category: 'health',
    content: {
      title: 'Somatic Menstruation Support: Warm Hydration Protocols',
      sections: [
        {
          heading: 'Flushing Out Cycle Fatigue',
          text: 'Menstruation is a highly active biological process, bro. Dehydration limits healthy blood circulation, worsening uterine cramps and triggering severe cycle headaches. Keep sipping warm water to relax smooth muscles and soothe tension.'
        },
        {
          heading: 'Preventing the Bloating Loop',
          text: 'It sounds paradoxical, but holding back on drinking water actually forces your body to hold on to excess fluids, causing uncomfortable bloating! Flooding your system with clean water signals your kidneys to release extra sodium, clearing out bulk swelling.'
        },
        {
          heading: 'Soothing Mineral Tea Formulas',
          text: 'Brew warm chamomile, raspberry leaf, or peppermint tea during your cycle. These natural infusions contain active antispasmodic compounds that calm uterine contractions naturally, comforting your mind while keeping your body wet.'
        }
      ]
    }
  },
  {
    id: 'mens-activities-deep',
    title: 'Men\'s Biomechanical Training',
    description: 'Essential strength exercises, core stabilization, and structural safety.',
    icon: 'Dumbbell',
    coverColor: 'bg-blue-600',
    category: 'challenge',
    content: {
      title: 'Men\'s Functional Longevity: Key Biomechanics Protocols',
      sections: [
        {
          heading: 'The Core Lockout Foundation',
          text: 'For men, building real functional strength requires complete stabilization, bro. Before picking up any weight, lock your transverse abdominis and squeeze your glutes. This forms a protective internal belt, securing your spine during high-load exercises.'
        },
        {
          heading: 'Multi-Joint Compound Drills',
          text: 'Prioritize full compound movements like goblet squats, clean pushups, pull-ups, and farmer carries. These natural, three-dimensional physical drills activate multiple muscle groups synchronously, developing clean, athletic bone density.'
        },
        {
          heading: 'Hydrating the Skeletal System',
          text: 'Cartilage inside joints is 80% water. Heavy physical workouts put massive mechanical compression on knees and back disks. Continuous hydration acts as a thick, flexible sponge that absorbs workout impact, guaranteeing healthy joints and longevity.'
        }
      ]
    }
  },
  {
    id: 'context-clues-traveling',
    title: 'How to use Context Clues while Traveling',
    description: 'Deconstruct verbal and visual signposts to decode foreign scenery like a detective master.',
    icon: 'Compass',
    coverColor: 'bg-[#7B5E43]',
    category: 'research',
    content: {
      title: 'How to use Context Clues while Traveling',
      sections: [
        {
          heading: 'The Traveling Detective: Visual Decoding',
          text: 'Traveling is not merely about sightseeing, bro; it is an active exercise in semiotics—the decoding of symbols, behaviors, and environmental signposts. Just like a detective holding a magnifying glass, your mind must search for critical visual indicators to read unfamiliar spaces. Pay close attention to localized patterns: the density of local residents in small side-street eateries (the ultimate signal of high price-to-quality ratios), the directional flow of pedestrians in the morning (which pins down local transport hubs or secret markets), and structural architectural transitions (like shifting roofing materials or window treatments) which tell you when you are entering distinct historic, socioeconomic, or cultural zones.'
        },
        {
          heading: 'Deciphering Verbal and Textual Clues',
          text: 'When you do not speak the regional language, context clues are your ultimate translator, bro! Analyze the layout of written words in public signs: the size, color coding, and placement of phrases can easily distinguish a helpful warning from general promotional information. Combine these symbols with human feedback: track micro-expressions of shopkeepers or transit agents, look at body language angles during conversations (are they open and leaning in, or defensive and closed?), and note the voice pitch and cadence. This allows you to decipher complex social agreements, locate hidden treasures, and stay safe in foreign surroundings.'
        },
        {
          heading: 'Spatial Mapping and Cognitive Anchors',
          text: 'To travel like an absolute master, build a continuous spatial map of your surroundings using permanent cognitive landmarks—historical towers, large green park belts, or distinct hills. Never glue your eyes to digital screens! Look up and actively search for environmental markers. Note the smells (salt air, baked spices, high exhaust fumes) to recognize micro-neighborhoods, and track the position of the sun to maintain orientation. By consciously reading these environmental anchors, your hippocampus stays fully awake, creating deep, everlasting memories of your journeys.'
        }
      ]
    }
  },
  {
    id: 'perfect-water-time',
    title: 'Perfect Water Timings',
    description: 'Align fluid intake with biological clocks to maximize metabolic and hormonal efficiency.',
    icon: 'Droplet',
    coverColor: 'bg-[#4F86C6]',
    category: 'health',
    content: {
      title: 'When Will Be the Perfect Time to Drink Water',
      sections: [
        {
          heading: 'The Circadian Fluid Balance',
          text: 'Timing your hydration is just as critical as the volume you drink, bro! When you wake up after 8 hours of sleep, your body is naturally dehydrated and your blood density is at its highest. Flooding your system with a large glass of warm water inside the first 10 minutes acts as an instant mechanical jumpstart for your entire metabolic loop. This dilutes your morning blood, flushes out accumulated metabolic compounds from your kidney filters, and activates cortisol excretion curves to naturally wake up your brain without caffeinated jitters.'
        },
        {
          heading: 'Meal-Time Hydration Mechanics',
          text: 'A huge physiological mistake is gulping freezing water during heavy meals. This dilutes stomach acids, shifting your digestive pH levels and leading to slow nutrient absorption and uncomfortable bloating, bro! The ideal schedule is: drink one large glass of water exactly 30 minutes before a meal to prep the stomach linings and hydrate saliva glands, and wait at least 30 to 45 minutes after eating to let your gastric enzymes break down proteins and fats fully.'
        },
        {
          heading: 'Bedtime Hydration and Sleep Loops',
          text: 'Before sleeping, your cells undergo extensive rebuilding. Sip half a glass of lukewarm water 30 minutes before bed. This provides your body with the fluid needed to maintain cardiovascular pressure through the night, preventing muscle cramps and reducing morning throat dryness. Combine this with pre-workout hydration (a glass of water 20 minutes before physical exertion) to keep your blood plasma thick and cushion your cartilage rings fully.'
        }
      ]
    }
  },
  {
    id: 'fruits-body-guide',
    title: 'Fruits for Your Body',
    description: 'Deconstruct the biochemical keys of healthy fruits vs. high-fructose industrial items.',
    icon: 'Flower',
    coverColor: 'bg-[#E59A54]',
    category: 'health',
    content: {
      title: 'The Somatic Fruit Guide: What to Eat vs. What to Avoid',
      sections: [
        {
          heading: 'Super-Fruits for High Vitality',
          text: 'Fruits are natural bio-capsules of structured water, enzymes, and essential trace minerals, bro! To optimize cellular energy, focus on low-glycemic, antioxidant-dense options. Avocados are the ultimate crown jewel: loaded with clean monounsaturated fats that lubricate blood vessels and assist in absorbing fat-soluble vitamins. Blueberries, organic blackberries, and raspberries are packed with active anthocyanins that cross the blood-brain barrier to reduce brain fog and support memory systems. Lemons, limes, and grapefruits contain highly bioavailable vitamin C and natural organic acids that alkalize urine buffers and stimulate liver detoxification.'
        },
        {
          heading: 'Fruits to Limit and Strategic Timings',
          text: 'Not all fruit sugars are created equal, bro! Industrial, oversized modern fruits like seedless seed grapes, sweet mangoes, pineapples, and dried dates contain highly concentrated amounts of free fructose. Eating these in massive quantities on an empty stomach triggers rapid liver fat buildup and spikes blood sugar levels, causing a heavy insulin crash. If you enjoy sweet tropical fruits, eat them strategically: immediately after a high-intensity workout (when your liver/muscle glycogen stores are dry and ready for rapid refilling) or paired with healthy proteins and fats (like walnuts or Greek yogurt) to slow down sugar absorption.'
        },
        {
          heading: 'The Artificial Fruit Traps',
          text: 'Avoid processed juices, canned fruits swimming in thick corn-syrup glaze, and pasteurized purées, bro! When you filter out the natural insoluble fibers from fruits, you transform a beautiful healthy food into an aggressive liquid sugar bomb. Without the structural fiber matrix to buffer gut transit, the fructose floods your portal vein instantly, taxing your liver metabolic pathways, triggering gut irritation, and leaving you feeling exhausted and hungry soon after.'
        }
      ]
    }
  },
  {
    id: 'how-grow-faster',
    title: 'How to Grow Faster',
    description: 'Unlock the biological keys of human growth hormone, deep sleep, and structural nutrients.',
    icon: 'Zap',
    coverColor: 'bg-[#7B5EAB]',
    category: 'health',
    content: {
      title: 'Human Growth Dynamics: How to Grow Faster',
      sections: [
        {
          heading: 'Activating Human Growth Hormone (HGH)',
          text: 'Human physical and cognitive growth occurs in rapid cellular surges, heavily governed by the endocrine system, bro! The ultimate master key is Human Growth Hormone (HGH), secreted by your pituitary gland. HGH peaks dramatically during slow-wave Deep Sleep (stages 3 & 4), which occurs primarily within the first 3 hours of your sleep cycle. To maximize this growth window, establish a rigid sleep schedule: sleep before 10 PM in a fully blacked-out, cold bedroom (65°F/18°C), and avoid eating high-sugar foods or heavy carbs 2 hours before bed, as high insulin levels instantly block HGH secretion!'
        },
        {
          heading: 'Somatic Exercises to Stimulate Bone Length',
          text: 'To maximize height and align your bones elegantly, you must put safe mechanical stress on your skeletal framework, bro! Engage in regular high-impact training like basketball vertical drills, jumping rope, sprinting, and hanging from a pull-up bar for 60 to 90 seconds. These movements trigger micro-tears in the epiphyseal plates of long bones, which heal thicker and stronger. Combine this with deep hanging stretches (to decompress the spinal vertebral discs) and posture correction drills to lock in your spine\'s vertical length.'
        },
        {
          heading: 'The Growth Nutrition Blueprint',
          text: 'Your bones and joints cannot expand without a continuous supply of vital building materials, bro! Supercharge your meals with bioavailable calcium (found in raw dairy or dark leafy greens) paired with Vitamin D3 and K2 to guide that calcium out of your blood vessels and lock it directly into your bone matrix. Combine this with grass-fed collagen or gelatin, bone broth, and high-quality zinc/magnesium (from pumpkin seeds, eggs, and red meat) to synthesize thick collagen webs that support height extension and accelerate physical organ growth.'
        }
      ]
    }
  }
];
