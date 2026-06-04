import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Book as BookIcon, 
  Zap, 
  Droplet, 
  Wind, 
  Flower, 
  Sun, 
  Moon, 
  Eye, 
  ChevronRight, 
  X, 
  Heart, 
  Palette, 
  Search, 
  Sparkles, 
  Check, 
  Clock, 
  BookOpen,
  Award,
  Lock,
  Compass,
  Trophy,
  Volume2,
  Dumbbell,
  ShoppingBag,
  Shield,
  Activity,
  Flame
} from 'lucide-react';
import { KNOWLEDGE_BOOKS, Book } from '../constants/library';
import { UserStats, UserSettings } from '../types';
import { Mascot } from './Mascot';

// Import custom generated high-quality images dynamically
import pushupProtocolImg from '../assets/images/pushup_protocol_1779266637886.png';
import hydrationLogicImg from '../assets/images/hydration_logic_1779266652867.png';
import vagalNerveImg from '../assets/images/vagal_nerve_1779266670752.png';
import creativeSynapseImg from '../assets/images/creative_synapse_1779266690417.png';
import crystalCactusImg from '../assets/images/crystal_cactus_1779266705542.png';
import circadianMasteryImg from '../assets/images/circadian_mastery_1779266725119.png';
import postureProtocolImg from '../assets/images/posture_protocol_1779268031305.png';
import thermalHormesisImg from '../assets/images/thermal_hormesis_1779268048761.png';
import autophagySyncImg from '../assets/images/autophagy_sync_1779268068080.png';
import symbioticFungiImg from '../assets/images/symbiotic_fungi_1779268089516.png';
import binauralBrainwavesImg from '../assets/images/binaural_brainwaves_1779268106033.png';
import forestBathingImg from '../assets/images/forest_bathing_1779268121767.png';
import optimalSaccadesImg from '../assets/images/optimal_saccades_1779268139737.png';
import nootropicNutritionImg from '../assets/images/nootropic_nutrition_1779268157558.png';
import carnivorousPitcherImg from '../assets/images/carnivorous_pitcher_1779268179856.png';
import neurogenesisSynapseImg from '../assets/images/neurogenesis_synapse_1779268200962.png';
import nexoraGuideImg from '../assets/images/nexora_guide_img_1779270251768.png';
import selfCareImg from '../assets/images/self_care_img_1779270269714.png';
import challengePracticeImg from '../assets/images/challenge_practice_img_1779270288112.png';
import shopBuyingGuideImg from '../assets/images/shop_buying_guide_1779270367530.png';

// New Plant Nanny styled cartoon image imports for winter hydration, immunity, warning signs, sports, moms, cycle care, pregnancy, etc.
import winterDrinksImg from '../assets/images/winter_drinks_1779272127025.png';
import waterImmunityImg from '../assets/images/water_immunity_1779272143781.png';
import warningSignsImg from '../assets/images/warning_signs_1779272160669.png';
import sportNeedsImg from '../assets/images/sport_needs_1779272176008.png';
import coffeeTeaIntakeImg from '../assets/images/coffee_tea_intake_1779272190292.png';
import hydrateHeartImg from '../assets/images/hydrate_heart_1779272205883.png';
import healthySkinImg from '../assets/images/healthy_skin_1779272228661.png';
import waterBrainImg from '../assets/images/water_brain_1779272246743.png';
import momHealthImg from '../assets/images/mom_health_1779272263291.png';
import womensWellnessImg from '../assets/images/womens_wellness_1779272279548.png';
import pregnancyHydrationImg from '../assets/images/pregnancy_hydration_1779272296073.png';
import periodHydrationImg from '../assets/images/period_hydration_1779272315074.png';

// Map icons cleanly
const ICON_MAP: Record<string, any> = {
  Zap,
  Droplet,
  Wind,
  Flower,
  Sun,
  Moon,
  Eye,
  Heart,
  Palette,
  Compass,
  Dumbbell,
  ShoppingBag,
  Shield,
  Activity,
  Flame,
  Trophy,
  BookOpen: BookIcon
};

// Beautiful native vector illustrations for book covers – high quality, animated, and no watermarks!
function AestheticImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className="relative w-full h-full bg-[#FAF7F2] flex items-center justify-center overflow-hidden">
      {/* Sleek, soft pulsing vector placeholder prior to asset rendering */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#E9E4D4] animate-pulse flex items-center justify-center">
          <BookIcon className="w-8 h-8 text-[#7D6B58] opacity-35" />
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${className} ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-500 ease-out`}
      />
    </div>
  );
}

const IMAGE_BOOKS_MAP: Record<string, { src: string; alt: string }> = {
  'guide-pushups': { src: pushupProtocolImg, alt: "The Pushups Protocol" },
  'guide-water': { src: hydrationLogicImg, alt: "Hydration Logic" },
  'guide-breathing': { src: vagalNerveImg, alt: "Vagal Nerve Hacks" },
  'guide-drawing': { src: creativeSynapseImg, alt: "Creative Synapse" },
  'plant-desert-guide': { src: crystalCactusImg, alt: "Crystal Cactus" },
  'research-sleep': { src: circadianMasteryImg, alt: "Circadian Mastery" },
  'guide-posture': { src: postureProtocolImg, alt: "The Posture Protocol" },
  'research-cold': { src: thermalHormesisImg, alt: "Thermal Hormesis" },
  'research-fasting': { src: autophagySyncImg, alt: "Autophagy Sync" },
  'plant-mycelium': { src: symbioticFungiImg, alt: "Symbiotic Fungi" },
  'guide-binaural': { src: binauralBrainwavesImg, alt: "Auditory Brainwaves" },
  'guide-forest': { src: forestBathingImg, alt: "Phytoncide Bathing" },
  'guide-saccadic': { src: optimalSaccadesImg, alt: "Optimal Saccades" },
  'research-nutrition': { src: nootropicNutritionImg, alt: "Nootropic Nutrition" },
  'plant-carnivorous': { src: carnivorousPitcherImg, alt: "Carnivorous Catch" },
  'research-neurogenesis': { src: neurogenesisSynapseImg, alt: "Neurogenesis Synapse" },
  'app-purpose': { src: nexoraGuideImg, alt: "Nexora Ecosystem" },
  'self-care': { src: selfCareImg, alt: "Self-Care & Balance" },
  'challenge-practice': { src: challengePracticeImg, alt: "Challenge Drills" },
  'shop-upgrades': { src: shopBuyingGuideImg, alt: "Ecosystem Shop" },
  'winter-warmth': { src: winterDrinksImg, alt: "Cozy Winter Fluids" },
  'immune-water': { src: waterImmunityImg, alt: "Immunity & Hydration" },
  'warning-adaptation': { src: warningSignsImg, alt: "The Stagnation Signs" },
  'sport-essentials': { src: sportNeedsImg, alt: "Sport Kinetics & Recovery" },
  'coffee-counting': { src: coffeeTeaIntakeImg, alt: "The Hydration Debate" },
  'heart-hydraulic': { src: hydrateHeartImg, alt: "Heart Valve Hydraulics" },
  'cellular-glow': { src: healthySkinImg, alt: "Dermal Moisture Sync" },
  'neural-fluid': { src: waterBrainImg, alt: "The Hydrated Brain" },
  'active-mom': { src: momHealthImg, alt: "The Energetic Mom" },
  'womens-wellness-deep': { src: womensWellnessImg, alt: "Women's Somatic Wellness" },
  'pregnant-joy': { src: pregnancyHydrationImg, alt: "Pregnancy Refreshment" },
  'period-hydration-deep': { src: periodHydrationImg, alt: "Cycle Flow Support" },
  'mens-activities-deep': { src: challengePracticeImg, alt: "Men's Biomechanical Training" }
};

function BookIllustration({ bookId }: { bookId: string }) {
  const mapped = IMAGE_BOOKS_MAP[bookId];
  if (mapped) {
    return (
      <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
        <AestheticImage
          src={mapped.src}
          alt={mapped.alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    );
  }

  // Render a personalized aesthetic animated scene depending on the book
  switch (bookId) {

    case 'guide-gratitude':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-rose-400 via-pink-500 to-rose-500 overflow-hidden flex items-center justify-center border border-rose-300 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_70%)]" />
          
          {/* Heart symbols glowing */}
          <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ type: "tween", repeat: Infinity, duration: 3.5 }} className="absolute top-8 left-12 text-white/40">
            <Heart size={20} fill="currentColor" />
          </motion.div>
          <motion.div animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.3, 0.6, 0.3] }} transition={{ type: "tween", repeat: Infinity, duration: 4, delay: 1 }} className="absolute bottom-8 right-12 text-white/30">
            <Heart size={16} fill="currentColor" />
          </motion.div>

          {/* Brain-headed cute character mascot with positive speech bubble */}
          <div className="flex flex-col items-center justify-center scale-90 relative z-10 w-full mt-2">
            
            <div className="flex items-center gap-3">
              {/* Cute brain character representation */}
              <svg viewBox="0 0 120 120" className="w-18 h-18">
                {/* Body orange */}
                <rect x="35" y="45" width="50" height="50" rx="14" fill="#f59e0b" stroke="#1e293b" strokeWidth="4" />
                {/* Brain lobes pink */}
                <path d="M 33,45 C 33,25 50,22 60,32 C 70,22 87,25 87,45 Z" fill="#f472b6" stroke="#1e293b" strokeWidth="4" />
                {/* Eyes resting peacefully */}
                <path d="M 48,58 Q 53,61 58,58" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Mouth smiling cute */}
                <path d="M 54,68 Q 60,74 66,68" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Blush */}
                <circle cx="43" cy="65" r="4" fill="#ec4899" opacity="0.4" />
                <circle cx="77" cy="65" r="4" fill="#ec4899" opacity="0.4" />
                {/* Small hands pressed in appreciation */}
                <path d="M 52,78 Q 60,72 68,78" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>

              {/* Speech/thought bubble with exact text (without any watermark) */}
              <div className="bg-white text-[7.5px] font-black leading-tight text-slate-800 p-2.5 rounded-2xl relative shadow-md border-2 border-pink-100 max-w-[140px]">
                <p>"I now focus on my learning and growth. I'm a work in progress, and that's okay"</p>
                {/* Tail */}
                <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l-2 border-b-2 border-pink-100 rotate-45" />
              </div>
            </div>

          </div>
        </div>
      );

    case 'plant-zen-guide':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 overflow-hidden flex items-center justify-center border border-emerald-300 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_header,rgba(255,255,255,0.25),transparent_70%)]" />
          
          {/* Floating leaf loops */}
          <motion.div animate={{ y: [0, 40], x: [0, -20], rotate: [0, 360], opacity: [0, 0.7, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-4 right-16 text-emerald-100">🍃</motion.div>
          <motion.div animate={{ y: [0, 50], x: [0, 15], rotate: [0, -360], opacity: [0, 0.5, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 2.5 }} className="absolute top-2 left-20 text-emerald-200">🍃</motion.div>

          {/* Classic Zen Bonsai tree in reddish dish */}
          <svg viewBox="0 0 200 150" className="w-36 h-28 relative z-10">
            {/* Ceramic Bowl dish at the bottom */}
            <path d="M 50,112 L 150,112 L 140,126 L 60,126 Z" fill="#b91c1c" stroke="#1e293b" strokeWidth="3.5" />
            
            {/* Soil inside */}
            <ellipse cx="100" cy="112" rx="46" ry="6" fill="#78350f" stroke="#1e293b" strokeWidth="2" />

            {/* Curving styled Bonsai trunk */}
            <path d="M 100,112 C 95,95 85,85 110,65 C 120,55 95,45 100,30" stroke="#78350f" strokeWidth="11" strokeLinecap="round" fill="none" className="transition-all" />
            <path d="M 100,112 C 95,95 85,85 110,65 C 120,55 95,45 100,30" stroke="#92400e" strokeWidth="7" strokeLinecap="round" fill="none" />
            
            {/* Fluffy green cloud foliage layers */}
            <g>
              {/* Back foliage layer */}
              <circle cx="100" cy="24" r="16" fill="#047857" stroke="#1e293b" strokeWidth="3" />
              <circle cx="86" cy="26" r="11" fill="#047857" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="114" cy="26" r="12" fill="#047857" stroke="#1e293b" strokeWidth="3" />
              
              {/* Highlight layer */}
              <circle cx="100" cy="24" r="12" fill="#10b981" />
              <circle cx="88" cy="26" r="8" fill="#10b981" />
              <circle cx="112" cy="26" r="9" fill="#10b981" />
            </g>

            <g transform="translate(18, 30)">
              <circle cx="100" cy="24" r="14" fill="#047857" stroke="#1e293b" strokeWidth="3" />
              <circle cx="88" cy="26" r="10" fill="#047857" stroke="#1e293b" strokeWidth="3" />
              <circle cx="112" cy="26" r="11" fill="#047857" stroke="#1e293b" strokeWidth="3" />
              <circle cx="100" cy="24" r="10" fill="#10b981" />
              <circle cx="90" cy="26" r="7" fill="#10b981" />
              <circle cx="110" cy="26" r="8" fill="#10b981" />
            </g>

            <g transform="translate(-18, 42)">
              <circle cx="100" cy="24" r="13" fill="#047857" stroke="#1e293b" strokeWidth="3" />
              <circle cx="89" cy="26" r="9" fill="#047857" stroke="#1e293b" strokeWidth="3" />
              <circle cx="111" cy="26" r="9" fill="#047857" stroke="#1e293b" strokeWidth="3" />
              <circle cx="100" cy="24" r="9" fill="#10b981" />
              <circle cx="91" cy="26" r="6" fill="#10b981" />
              <circle cx="109" cy="26" r="6" fill="#10b981" />
            </g>
          </svg>
        </div>
      );

    case 'research-focus':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center border border-indigo-950/40 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_70%)]" />

          {/* Sweating cartoon leaf avatar looking nervously at glowing purple smartphone */}
          <svg viewBox="0 0 200 150" className="w-40 h-32 relative z-10">
            {/* Screen Purple Glowing spot spotlights */}
            <motion.ellipse 
              animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              cx="115" cy="85" rx="30" ry="25" 
              fill="#a855f7" 
              opacity="0.5" 
              className="blur-xl" 
            />

            {/* Sweating character (avatar with green leaf on head) */}
            <g transform="translate(15, 10)">
              {/* Head white round bubble */}
              <rect x="35" y="40" width="60" height="60" rx="20" fill="#fff" stroke="#1e293b" strokeWidth="4" />
              {/* Leaf hat green */}
              <path d="M 50,40 C 45,20 65,15 65,40 C 65,15 85,20 80,40 Z" fill="#22c55e" stroke="#1e293b" strokeWidth="3" />
              
              {/* Wide nervous eyes */}
              <ellipse cx="50" cy="65" r="9" fill="#1e293b" />
              <ellipse cx="80" cy="65" r="9" fill="#1e293b" />
              <circle cx="52" cy="62" r="3" fill="#fff" />
              <circle cx="82" cy="62" r="3" fill="#fff" />
              
              {/* Sweat droplets */}
              <motion.path 
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                d="M 38,58 Q 36,63 38,65 Q 40,63 38,58" fill="#38bdf8" 
              />
              <motion.path 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: 0.4 }}
                d="M 92,62 Q 90,68 92,70 Q 94,68 92,62" fill="#38bdf8" 
              />
              
              {/* Nervous squiggly mouth */}
              <path d="M 58,82 Q 62,78 65,82 Q 68,86 72,82" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </g>

            {/* Glowing violet smartphone page containing text "DOPAMINE DETOX: HELP OR HARM?" */}
            <g transform="translate(100, 62)">
              <motion.g
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                {/* Phone housing */}
                <rect x="15" y="4" width="34" height="52" rx="4" fill="#0f0f17" stroke="#3b0764" strokeWidth="3" />
                {/* Main page screen */}
                <rect x="18" y="7" width="28" height="46" rx="2" fill="#d8b4fe" />
                
                {/* Text lines (simulating "DOPAMINE DETOX") */}
                <rect x="21" y="11" width="22" height="3" fill="#701a75" rx="0.5" />
                <rect x="21" y="16" width="18" height="2" fill="#701a75" rx="0.5" opacity="0.8" />
                
                {/* Help or Harm? */}
                <circle cx="24" cy="24" r="2.5" fill="#f43f5e" />
                <circle cx="32" cy="24" r="2.5" fill="#10b981" />
                
                <rect x="21" y="30" width="22" height="1.5" fill="#3b0764" rx="0.5" />
                <rect x="21" y="34" width="15" height="1.5" fill="#3b0764" rx="0.5" />
              </motion.g>
            </g>
          </svg>
        </div>
      );



    case 'context-clues-traveling':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#FEF9C3] via-[#FFFBEB] to-[#FEF08A] overflow-hidden flex items-center justify-center border-b-4 border-amber-200 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.25),transparent_70%)]" />
          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            <circle cx="100" cy="85" r="50" fill="#FEF08A" opacity="0.6" filter="blur(4px)" />
            <g fill="#FBBF24">
              <path d="M 40,30 Q 40,40 30,40 Q 40,40 40,50 Q 40,40 40,30 Z" opacity="0.8" />
              <path d="M 160,50 Q 160,55 155,55 Q 160,55 160,60 Q 160,55 165,55 Q 160,55 160,50 Z" opacity="0.8" />
              <circle cx="35" cy="80" r="2" />
              <circle cx="165" cy="110" r="3" />
            </g>
            <g stroke="#1a2a3a" strokeWidth="4" strokeLinejoin="round">
              <path d="M 68,60 C 68,50 78,52 82,59" fill="#60A5FA" />
              <path d="M 132,60 C 132,50 122,52 118,59" fill="#60A5FA" />
              <path d="M 60,110 C 60,75 140,75 140,110 C 140,135 60,135 60,110 Z" fill="#3B82F6" />
              <path d="M 68,95 C 68,85 132,85 132,95" stroke="#93C5FD" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
            </g>
            <g>
              <circle cx="88" cy="100" r="8" fill="#0F172A" />
              <circle cx="86" cy="98" r="3" fill="#FFFFFF" />
              <circle cx="90" cy="102" r="1.5" fill="#FFFFFF" />
              <circle cx="112" cy="100" r="8" fill="#0F172A" />
              <circle cx="110" cy="98" r="3" fill="#FFFFFF" />
              <circle cx="114" cy="102" r="1.5" fill="#FFFFFF" />
              <path d="M 96,108 Q 100,114 104,108" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 97,109 Q 100,114 103,109" fill="#EF4444" />
              <circle cx="78" cy="106" r="4" fill="#F472B6" opacity="0.6" />
              <circle cx="122" cy="106" r="4" fill="#F472B6" opacity="0.6" />
            </g>
            <g stroke="#1a2a3a" strokeWidth="3.5" strokeLinejoin="round">
              <path d="M 72,120 L 128,120 L 125,135 L 75,135 Z" fill="#A16207" />
              <path d="M 92,120 L 100,128 L 108,120 Z" fill="#FFFFFF" />
              <path d="M 98,125 L 102,125 L 104,138 L 100,143 L 96,138 Z" fill="#1E293B" strokeWidth="1" />
              <path d="M 72,120 L 92,124 L 90,135 L 75,135 Z" fill="#854D0E" />
              <path d="M 128,120 L 108,124 L 110,135 L 125,135 Z" fill="#854D0E" />
            </g>
            <text x="100" y="117" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle" fontStyle="italic" stroke="#2563EB" strokeWidth="0.5">N</text>
            <g stroke="#1a2a3a" strokeWidth="4" strokeLinejoin="round">
              <path d="M 52,70 Q 100,60 148,70 Q 100,75 52,70 Z" fill="#78350F" />
              <path d="M 70,68 C 70,40 130,40 130,68 Z" fill="#78350F" />
              <path d="M 70,64 Q 100,60 130,64 L 129,68 Q 100,64 71,68 Z" fill="#451A03" />
            </g>
            <g stroke="#1a2a3a" strokeWidth="3" strokeLinejoin="round" transform="translate(4, -4)">
              <circle cx="145" cy="118" r="7" fill="#60A5FA" />
              <circle cx="145" cy="118" r="5" fill="#3B82F6" stroke="none" />
              <path d="M 149,122 L 162,138" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="164" cy="102" r="14" fill="#93C5FD" opacity="0.5" stroke="#475569" strokeWidth="3" />
              <path d="M 158,96 Q 166,92 170,98" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );

    case 'perfect-water-time':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#ECECFB] via-[#E0E0FC] to-[#D4D4FB] overflow-hidden flex items-center justify-center border-b-4 border-[#5E5EDD]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_60%)]" />
          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            <circle cx="100" cy="80" r="45" fill="#818CF8" opacity="0.25" filter="blur(6px)" />
            <path d="M 20,110 Q 50,60 100,50 T 180,60" fill="none" stroke="#60A5FA" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
            <path d="M 10,95 Q 60,110 110,85 T 190,110" fill="none" stroke="#22D3EE" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
            <g fill="#22D3EE" opacity="0.6">
              <path d="M 40,65 Q 40,75 35,75 Q 30,75 35,65 Z" transform="rotate(-15, 35, 70)" />
              <path d="M 165,85 Q 165,95 160,95 Q 155,95 160,85 Z" transform="rotate(20, 160, 90)" />
            </g>
            <g>
              <path d="M 75,50 C 60,50 45,70 42,95 C 40,110 50,130 65,135 C 70,120 75,90 75,50 Z" fill="#4338CA" />
              <path d="M 125,50 C 140,50 155,70 158,95 C 160,110 150,130 135,135 C 130,120 125,90 125,50 Z" fill="#4338CA" />
              <path d="M 90,85 L 110,85 L 115,110 L 85,110 Z" fill="#FCE7F3" />
              <path d="M 75,110 C 75,100 125,100 125,110 L 135,140 L 65,140 Z" fill="#EEF2F6" stroke="#E2E8F0" strokeWidth="1" />
              <path d="M 82,60 C 82,45 118,45 118,60 C 118,75 110,90 100,90 C 90,90 82,75 82,60 Z" fill="#FCE7F3" />
              <path d="M 100,32 C 70,32 55,55 52,80 C 50,95 56,110 68,115 C 62,95 72,70 100,70" fill="#8B5CF6" />
              <path d="M 98,32 C 125,32 140,55 145,80 C 148,95 142,110 130,115 C 136,95 126,70 98,70" fill="#A21CAF" />
              <path d="M 100,32 C 85,30 75,42 85,55 C 92,48 100,42 100,32" fill="#D946EF" />
              <path d="M 52,80 C 45,98 50,120 62,130 C 65,120 58,100 52,80 Z" fill="#D946EF" />
              <path d="M 145,80 C 152,98 147,120 135,130 C 132,120 139,100 145,80 Z" fill="#8B5CF6" />
              <path d="M 88,65 Q 93,68 96,64" stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 104,65 Q 107,68 112,64" stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 95,64 L 97,62" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 105,64 L 103,62" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 97,76 Q 100,79 103,76" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" fill="none" />
              <ellipse cx="87" cy="71" rx="3" ry="2" fill="#F472B6" opacity="0.6" />
              <ellipse cx="113" cy="71" rx="3" ry="2" fill="#F472B6" opacity="0.6" />
            </g>
            <g transform="translate(14, 0)">
              <ellipse cx="100" cy="115" rx="5" ry="5" fill="#FCE7F3" stroke="#4338CA" strokeWidth="1.5" />
              <path d="M 94,98 L 106,98 L 103,115 L 97,115 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" opacity="0.9" />
              <path d="M 95,103 L 105,103 L 103,115 L 97,115 Z" fill="#0EA5E9" opacity="0.75" />
              <path d="M 100,94 Q 100,98 98,98 Q 100,98 100,102 Q 100,98 102,98 Q 100,98 100,94 Z" fill="#FFFFFF" />
            </g>
          </svg>
        </div>
      );

    case 'fruits-body-guide':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#FEF2E6] via-[#FFF8F2] to-[#FDE8D2] overflow-hidden flex items-center justify-center border-b-4 border-[#FFA07A]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_60%)]" />
          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            <circle cx="100" cy="80" r="45" fill="#F97316" opacity="0.15" filter="blur(6px)" />
            <g transform="translate(138, 70) scale(0.95)" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round">
              <path d="M 10,0 C 18,-10 25,5 23,16 C 21,24 10,28 0,22 C -8,17 -5,5 10,0 Z" fill="#15803D" />
              <path d="M 8,2 C 13,-6 18,5 17,13 C 15,19 7,22 -1,17 C -7,13 -4,5 8,2 Z" fill="#A3E635" />
              <circle cx="8" cy="11" r="5" fill="#78350F" stroke="#1e293b" strokeWidth="1" />
            </g>
            <g transform="translate(42, 75)" stroke="#1e293b" strokeWidth="1.5">
              <circle cx="0" cy="0" r="7.5" fill="#1E3A8A" />
              <path d="M -3,-5 Q 0,-3 3,-5 L 2,-7 Q 0,-5 -2,-7 Z" fill="#1E40AF" />
              <circle cx="-2.5" cy="-2.5" r="1.5" fill="#FFFFFF" stroke="none" />
            </g>
            <g transform="translate(34, 95) scale(0.85)" stroke="#1e293b" strokeWidth="1" fill="#BE123C">
              <circle cx="0" cy="0" r="3" />
              <circle cx="4" cy="1" r="3" />
              <circle cx="-4" cy="1" r="3" />
              <circle cx="2" cy="4" r="3.5" />
              <circle cx="-2" cy="4" r="3.5" />
              <circle cx="0" cy="7" r="3" />
              <path d="M -2,-2 L 2,-2 L 0,-5 Z" fill="#15803D" stroke="#1e293b" strokeWidth="1" />
            </g>
            <g>
              <path d="M 75,50 C 60,50 45,70 42,95 C 40,110 50,130 65,135 C 70,120 75,90 75,50 Z" fill="#4338CA" />
              <path d="M 125,50 C 140,50 155,70 158,95 C 160,110 150,130 135,135 C 130,120 125,90 125,50 Z" fill="#4338CA" />
              <path d="M 90,85 L 110,85 L 115,110 L 85,110 Z" fill="#FCE7F3" />
              <path d="M 75,110 C 75,100 125,100 125,110 L 132,140 L 68,140 Z" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
              <path d="M 82,60 C 82,45 118,45 118,60 C 118,75 110,90 100,90 C 90,90 82,75 82,60 Z" fill="#FCE7F3" />
              <path d="M 100,32 C 70,32 55,55 52,80 C 50,95 56,110 68,115 C 62,95 72,70 100,70" fill="#8B5CF6" />
              <path d="M 98,32 C 125,32 140,55 145,80 C 148,95 142,110 130,115 C 136,95 126,70 98,70" fill="#A21CAF" />
              <path d="M 100,32 C 85,30 75,42 85,55 C 92,48 100,42 100,32" fill="#D946EF" />
              <path d="M 52,80 C 45,98 50,120 62,130 C 65,120 58,100 52,80 Z" fill="#D946EF" />
              <path d="M 145,80 C 152,98 147,120 135,130 C 132,120 139,100 145,80 Z" fill="#8B5CF6" />
              <path d="M 88,64 Q 92,67 96,64" stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 104,64 Q 108,67 112,64" stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 97,74 Q 100,79 103,74" stroke="#A21CAF" strokeWidth="2" strokeLinecap="round" fill="none" />
              <ellipse cx="87" cy="71" rx="3" ry="1.8" fill="#F472B6" opacity="0.6" />
              <ellipse cx="113" cy="71" rx="3" ry="1.8" fill="#F472B6" opacity="0.6" />
            </g>
            <g transform="translate(-16, 12)">
              <ellipse cx="100" cy="108" rx="4.5" ry="4.5" fill="#FCE7F3" stroke="#4338CA" strokeWidth="1.5" />
              <path d="M 100,97 Q 100,101 98,101 Q 100,101 100,105 Q 100,101 102,101 Q 100,101 100,97 Z" fill="#FBBF24" />
            </g>
          </svg>
        </div>
      );

    case 'how-grow-faster':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#ECE8F7] via-[#E2DCF3] to-[#D5CDEC] overflow-hidden flex items-center justify-center border-b-4 border-[#735EA9]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_60%)]" />
          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            <circle cx="100" cy="80" r="45" fill="#C084FC" opacity="0.2" filter="blur(6px)" />
            <g opacity="0.6">
              <path d="M 60,65 L 75,50 L 90,65" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 110,65 L 125,50 L 140,65" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 85,45 L 100,30 L 115,45" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="45" r="2.5" fill="#FBBF24" />
              <circle cx="150" cy="45" r="2.5" fill="#FBBF24" />
              <circle cx="100" cy="18" r="3" fill="#34D399" />
            </g>
            <g transform="translate(0, 5)">
              <path d="M 75,50 C 60,50 45,70 42,95 C 40,110 50,130 65,135 C 70,120 75,90 75,50 Z" fill="#4338CA" />
              <path d="M 125,50 C 140,50 155,70 158,95 C 160,110 150,130 135,135 C 130,120 125,90 125,50 Z" fill="#4338CA" />
              <path d="M 90,85 L 110,85 L 115,110 L 85,110 Z" fill="#FCE7F3" />
              <path d="M 75,110 C 75,100 125,100 125,110 L 132,140 L 68,140 Z" fill="#DDD6FE" stroke="#C7D2FE" strokeWidth="1" />
              <path d="M 82,57 C 82,42 118,42 118,57 C 118,72 110,87 100,87 C 90,87 82,72 82,57 Z" fill="#FCE7F3" />
              <path d="M 100,28 C 70,28 55,51 52,76 C 50,91 56,106 68,111 C 62,91 74,66 100,66" fill="#8B5CF6" />
              <path d="M 98,28 C 125,28 140,51 145,76 C 148,91 142,106 130,111 C 136,91 126,66 98,66" fill="#A21CAF" />
              <path d="M 100,28 C 85,26 75,38 85,51 C 92,44 100,38 100,28" fill="#D946EF" />
              <path d="M 52,76 C 45,94 50,116 62,126 C 65,116 58,96 52,76 Z" fill="#D946EF" />
              <path d="M 145,76 C 152,94 147,116 135,126 C 132,116 139,96 145,76 Z" fill="#8B5CF6" />
              <path d="M 87,58 Q 91,54 95,58" stroke="#4338CA" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 105,58 Q 109,54 113,58" stroke="#4338CA" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="91" cy="56" r="1.5" fill="#4338CA" />
              <circle cx="109" cy="56" r="1.5" fill="#4338CA" />
              <path d="M 97,71 Q 100,75 103,71" stroke="#A21CAF" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 98,72 Q 100,75 102,72" fill="#F472B6" />
              <ellipse cx="86" cy="65" rx="3.2" ry="1.8" fill="#F472B6" opacity="0.6" />
              <ellipse cx="114" cy="65" rx="3.2" ry="1.8" fill="#F472B6" opacity="0.6" />
            </g>
          </svg>
        </div>
      );

    case 'retention-progress-engine':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#ECEFFE] via-[#E2E6FF] to-[#D0D7FF] overflow-hidden flex items-center justify-center border-b-4 border-[#6366F1]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
          
          {/* Animated sparkly stars floating up */}
          <motion.span animate={{ y: [0, -45], x: [0, -10], opacity: [0, 1, 0], scale: [0.6, 1.1, 0.6] }} transition={{ repeat: Infinity, duration: 4.8, ease: "easeOut" }} className="absolute text-yellow-400 font-extrabold top-12 left-10 text-xs">⭐</motion.span>
          <motion.span animate={{ y: [0, -50], x: [0, 12], opacity: [0, 0.9, 0], scale: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 5.2, delay: 1.5, ease: "easeOut" }} className="absolute text-amber-400 font-extrabold top-8 right-12 text-[10px]">✨</motion.span>

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* Colorful progress bars staircase */}
            <rect x="30" y="110" width="30" height="15" rx="3" fill="#D0D3FE" stroke="#4338CA" strokeWidth="2.5" />
            <rect x="65" y="90" width="30" height="35" rx="3" fill="#A5B4FC" stroke="#4338CA" strokeWidth="2.5" />
            <rect x="100" y="70" width="30" height="55" rx="3" fill="#818CF8" stroke="#4338CA" strokeWidth="2.5" />
            <rect x="135" y="50" width="30" height="75" rx="3" fill="#6366F1" stroke="#4338CA" strokeWidth="2.5" />

            {/* Glowing flag at the peak */}
            <path d="M 150,50 L 150,22" stroke="#4338CA" strokeWidth="3" strokeLinecap="round" />
            <motion.path 
              animate={{ d: ["M 150,22 L 170,27 L 150,32 Z", "M 150,22 L 166,25 L 150,30 Z", "M 150,22 L 170,27 L 150,32 Z"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              d="M 150,22 L 170,27 L 150,32 Z" fill="#F43F5E" stroke="#4338CA" strokeWidth="2.5" 
            />

            {/* Cute leafy character climbing up */}
            <g transform="translate(68, 5)">
              <motion.g
                animate={{ y: [42, 22, 42], x: [0, 35, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              >
                {/* Character core body */}
                <rect x="10" y="20" width="22" height="22" rx="7" fill="#FFF" stroke="#4338CA" strokeWidth="2.5" />
                {/* Green sprout head leaf */}
                <path d="M 21,20 C 18,10 28,8 24,20" fill="#10B981" stroke="#4338CA" strokeWidth="2" />
                {/* Cheerful happy eyes */}
                <circle cx="16" cy="29" r="2" fill="#4338CA" />
                <circle cx="26" cy="29" r="2" fill="#4338CA" />
                {/* Smiling mouth */}
                <path d="M 19,34 Q 21,37 23,34" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" fill="none" />
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'retention-smart-nudges':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#FEEFF6] via-[#FCE3F0] to-[#FAD4E8] overflow-hidden flex items-center justify-center border-b-4 border-[#EC4899]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
          
          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* Soft cloud base */}
            <path d="M 40,110 C 30,110 25,100 35,90 C 25,80 40,65 55,75 C 65,60 90,65 85,85 C 95,95 85,110 70,110 Z" fill="#FFF" stroke="#9D174D" strokeWidth="2" opacity="0.85" />
            
            {/* Floating music/ring vibrations */}
            <g opacity="0.7" fill="#EC4899">
              <motion.path animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 1.8 }} d="M 140,50 C 145,45 152,48 150,55" stroke="#EC4899" strokeWidth="2" fill="none" strokeLinecap="round" />
              <motion.path animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.7, 0.2] }} transition={{ repeat: Infinity, duration: 2, delay: 0.4 }} d="M 145,42 C 154,36 162,41 158,52" stroke="#EC4899" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>

            {/* Swinging Hanging smart bell */}
            <g transform="translate(100, 30)">
              <motion.g
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                style={{ transformOrigin: "50px 10px" }}
              >
                {/* Support rope bar */}
                <path d="M 50,10 L 50,30" stroke="#9D174D" strokeWidth="2.5" />
                
                {/* Cute Bell body */}
                <path d="M 33,65 C 33,40 67,40 67,65 Z" fill="#FDE047" stroke="#9D174D" strokeWidth="3" />
                <rect x="28" y="65" width="44" height="6" rx="2.5" fill="#FACC15" stroke="#9D174D" strokeWidth="3" />
                
                {/* Little cartoon eyes on the bell */}
                <ellipse cx="44" cy="55" rx="2" ry="2.5" fill="#9D174D" />
                <ellipse cx="56" cy="55" rx="2" ry="2.5" fill="#9D174D" />
                {/* Happy smile */}
                <path d="M 48,60 Q 50,62 52,60" stroke="#9D174D" strokeWidth="1.8" fill="none" />

                {/* Swinging clapper */}
                <motion.circle 
                  animate={{ x: [-4, 4, -4] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  cx="50" cy="77" r="5" fill="#F43F5E" stroke="#9D174D" strokeWidth="2.5" 
                />
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'retention-secure-lockbox':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#E6F9F1] via-[#D1F3E4] to-[#BEEBD6] overflow-hidden flex items-center justify-center border-b-4 border-[#10B981]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />
          
          {/* Nano-bees hovering protecting */}
          <motion.div animate={{ y: [0, -12, 0], x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.2 }} className="absolute text-emerald-800 top-11 left-12 text-sm">🐝</motion.div>
          <motion.div animate={{ y: [0, 10, 0], x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3.8, delay: 1 }} className="absolute text-emerald-800 bottom-14 right-14 text-xs">🐝</motion.div>

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* Secure gold treasure chest */}
            <g stroke="#064E3B" strokeWidth="3" strokeLinejoin="round">
              {/* Chest base brown/gold */}
              <rect x="55" y="75" width="90" height="42" rx="8" fill="#F59E0B" />
              {/* Steel corners protection */}
              <path d="M 55,75 L 70,75 L 70,117 L 55,117 Z" fill="#059669" />
              <path d="M 145,75 L 130,75 L 130,117 L 145,117 Z" fill="#059669" />
              
              {/* Lid curve arch */}
              <path d="M 55,75 C 55,48 145,48 145,75 Z" fill="#D97706" />
              <path d="M 55,75 C 55,48 70,50 70,75 Z" fill="#059669" />
              <path d="M 145,75 C 145,48 130,50 130,75 Z" fill="#059669" />
            </g>

            {/* Big cute lock right in the middle */}
            <g transform="translate(88, 62)">
              <motion.g
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                {/* Lock shackle path steel */}
                <path d="M 10,12 L 10,-4 C 10,-10 26,-10 26,-4 L 26,12" stroke="#059669" strokeWidth="4.5" fill="none" />
                
                {/* Locking body gold */}
                <rect x="0" y="8" width="36" height="30" rx="9" fill="#047857" stroke="#064E3B" strokeWidth="2.5" />
                
                {/* Cute smiling eyes in lock */}
                <circle cx="11" cy="20" r="2.2" fill="#FFF" />
                <circle cx="25" cy="20" r="2.2" fill="#FFF" />
                <path d="M 15,28 Q 18,31 21,28" stroke="#FFF" strokeWidth="2" strokeLinecap="round" fill="none" />
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'retention-team-responders':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#FEF7E6] via-[#FDEED3] to-[#FCDFA8] overflow-hidden flex items-center justify-center border-b-4 border-[#F59E0B]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
          
          {/* Pulsing light bulb for ideas inspiration */}
          <motion.div animate={{ scale: [0.95, 1.12, 0.95], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute text-yellow-500 top-8 right-16 text-lg">💡</motion.div>

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* The artist drawing tablet desk */}
            <rect x="35" y="45" width="130" height="85" rx="10" fill="#2D3748" stroke="#78350F" strokeWidth="3" />
            <rect x="42" y="52" width="116" height="71" rx="4" fill="#E2E8F0" />

            {/* Drawn sketch: Cute companion character waving hello with cartoon heart */}
            <g transform="translate(68, 55)">
              {/* Sprout head */}
              <circle cx="32" cy="32" r="16" fill="#FFF" stroke="#2D3748" strokeWidth="2.5" />
              <path d="M 32,16 C 30,5 38,5 36,16" fill="#22C55E" stroke="#2D3748" strokeWidth="1.8" />
              <path d="M 26,28 Q 32,32 38,28" stroke="#2D3748" strokeWidth="2" fill="none" />
              <path d="M 30,42 Q 32,45 34,42" fill="#EF4444" />
              <motion.path 
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ type: "tween", repeat: Infinity, duration: 1.5 }}
                d="M 52,20 C 50,16 56,12 56,18 L 52,20" fill="#EF4444" 
              />
            </g>

            {/* Floating digital animator hand/pencil */}
            <g transform="translate(132, 60)">
              <motion.g
                animate={{ x: [-8, 6, -8], y: [6, -6, 6] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                {/* Yellow Pencil tool */}
                <path d="M -15,22 L 15,-8 L 22,-1 L -8,29 Z" fill="#FBBF24" stroke="#2D3748" strokeWidth="2.5" />
                {/* Pencil eraser red */}
                <rect x="18" y="-4" width="6" height="6" fill="#FB7185" stroke="#2D3748" strokeWidth="1.5" transform="rotate(45)" />
                {/* Pencil lead tip drawing */}
                <path d="M -15,22 L -19,29 L -10,27 Z" fill="#1E293B" stroke="#2D3748" strokeWidth="2" />
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'retention-alien-botany':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#F5EFFF] via-[#EAE1FF] to-[#DBD2FF] overflow-hidden flex items-center justify-center border-b-4 border-[#8B5CF6]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.355),transparent_60%)]" />

          {/* Bioluminescent flying particles */}
          <motion.div animate={{ opacity: [0.1, 0.9, 0.1], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute text-cyan-400 font-bold top-10 left-16 text-[8px]">✦</motion.div>
          <motion.div animate={{ opacity: [0.2, 1, 0.2], y: [0, -25, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 1 }} className="absolute text-fuchsia-400 font-bold bottom-16 right-20 text-[6px]">✦</motion.div>

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* Round glass terrarium dome dome */}
            <circle cx="100" cy="85" r="45" fill="#FFF" stroke="#5B21B6" strokeWidth="3" opacity="0.2" />
            <path d="M 57,98 C 57,53 143,53 143,98 Z" fill="none" stroke="#5B21B6" strokeWidth="3.2" strokeLinecap="round" />
            <ellipse cx="100" cy="98" rx="43" ry="12" fill="#DDD6FE" stroke="#5B21B6" strokeWidth="3" />

            {/* Glowing neon alien botany mushroom character */}
            <g transform="translate(73, 50)">
              {/* Stem */}
              <rect x="22" y="24" width="12" height="26" rx="5" fill="#E879F9" stroke="#5B21B6" strokeWidth="2.5" />
              
              {/* Neon glowing bioluminescent cap */}
              <motion.path 
                animate={{ fill: ["#A78BFA", "#C084FC", "#F472B6", "#A78BFA"] }}
                transition={{ repeat: Infinity, duration: 4.2 }}
                d="M 6,24 C 6,4 50,4 50,24 Z" stroke="#5B21B6" strokeWidth="3" 
              />
              
              {/* Bright glowing spots on alien cap */}
              <circle cx="20" cy="14" r="3" fill="#FFF" opacity="0.8" />
              <circle cx="36" cy="12" r="2.5" fill="#FFF" opacity="0.8" />
              <circle cx="14" cy="20" r="2" fill="#FFF" opacity="0.8" />
              <circle cx="42" cy="19" r="2" fill="#FFF" opacity="0.8" />
              
              {/* Cute sleeping cozy face */}
              <path d="M 24,32 Q 28,34 32,32" stroke="#5B21B6" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>

            {/* Nurturing robot drone hover hovering on side */}
            <g transform="translate(130, 32)">
              <motion.g
                animate={{ y: [-4, 5, -4], rotate: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
              >
                {/* Drone metallic chassis */}
                <ellipse cx="20" cy="25" rx="14" ry="10" fill="#94A3B8" stroke="#5B21B6" strokeWidth="2.5" />
                {/* Drone propeller blades */}
                <path d="M 6,15 L 34,15" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                <circle cx="20" cy="15" r="3" fill="#475569" />
                
                {/* Drone round cyclic laser optics glowing light */}
                <circle cx="20" cy="25" r="4" fill="#06B6D4" />

                {/* Laser beam focusing coordinates */}
                <motion.line 
                  animate={{ opacity: [0.1, 0.7, 0.1], strokeWidth: [1, 3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  x1="20" y1="35" x2="-20" y2="52" stroke="#22D3EE" 
                />
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'retention-habit-blueprint':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#EEF4FF] via-[#E0EBFF] to-[#CDDFFF] overflow-hidden flex items-center justify-center border-b-4 border-[#3B82F6]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />

          {/* Animated reward level scores popping up */}
          <motion.div animate={{ y: [42, -50], opacity: [0, 1, 0], scale: [0.7, 1.1, 0.7] }} transition={{ repeat: Infinity, duration: 2.8, ease: "easeOut" }} className="absolute text-[#3B82F6] font-black text-xs left-10 pt-10">+10 XP</motion.div>
          <motion.div animate={{ y: [48, -42], opacity: [0, 1, 0], scale: [0.7, 1.1, 0.7] }} transition={{ repeat: Infinity, duration: 3, delay: 1.3, ease: "easeOut" }} className="absolute text-amber-600 font-black text-xs right-8 pt-12">+5 COINS</motion.div>

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* Comic style fight slash stars */}
            <path d="M 50,45 Q 100,25 100,5" fill="none" stroke="#BFDBFE" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
            <path d="M 150,45 Q 100,25 100,5" fill="none" stroke="#BFDBFE" strokeWidth="6" strokeLinecap="round" opacity="0.4" />

            {/* Retro Gameboy console framing */}
            <rect x="52" y="30" width="96" height="106" rx="14" fill="#93C5FD" stroke="#1E40AF" strokeWidth="3" />
            <rect x="62" y="40" width="76" height="52" rx="4" fill="#1E40AF" stroke="#1E40AF" strokeWidth="2" />
            
            {/* Pixels screens */}
            <rect x="64" y="42" width="72" height="48" rx="2" fill="#86EFAC" />

            {/* Cute mini active platform level avatar */}
            <g transform="translate(85, 52)">
              <motion.g
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              >
                {/* Body sprout */}
                <rect x="4" y="12" width="22" height="20" rx="6" fill="#FFF" stroke="#1E40AF" strokeWidth="2.5" />
                <path d="M 15,12 C 12,3 20,3 18,12" stroke="#1E40AF" strokeWidth="2" fill="none" />
                {/* Sword held hero */}
                <path d="M 26,22 L 36,12" stroke="#1E40AF" strokeWidth="3.2" strokeLinecap="round" />
                <line x1="30" y1="18" x2="33" y2="21" stroke="#1E40AF" strokeWidth="2" />
                {/* Little dot eyes */}
                <circle cx="10" cy="20" r="1.5" fill="#1E40AF" />
                <circle cx="20" cy="20" r="1.5" fill="#1E40AF" />
              </motion.g>
            </g>

            {/* Gaming D-pad buttons */}
            <rect x="65" y="104" width="24" height="6" rx="2.5" fill="#1E40AF" />
            <rect x="74" y="95" width="6" height="24" rx="2.5" fill="#1E40AF" />
            
            <circle cx="118" cy="107" r="5" fill="#F43F5E" />
            <circle cx="130" cy="107" r="5" fill="#FBBF24" />
          </svg>
        </div>
      );

    case 'retention-focus-isolation':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#EFF1F5] via-[#E2E4EB] to-[#CED2DE] overflow-hidden flex items-center justify-center border-b-4 border-[#1E293B]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />

          {/* Sound wave lines fading */}
          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.45, 0.1] }} transition={{ repeat: Infinity, duration: 3.5 }} className="absolute w-28 h-28 border border-slate-400 rounded-full" />
          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.5, 0.1] }} transition={{ repeat: Infinity, duration: 3.5, delay: 1.5 }} className="absolute w-36 h-36 border border-slate-300 rounded-full" />

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* Transparent Isolation protective forcefield shield dome */}
            <circle cx="100" cy="80" r="48" fill="#F1F5F9" opacity="0.3" stroke="#475569" strokeWidth="2" strokeDasharray="5 5" />
            
            {/* Headset noise-canceling bands */}
            <g transform="translate(68, 48)">
              {/* Cute cozy character sitting in pad */}
              <rect x="15" y="20" width="34" height="34" rx="11" fill="#FFF" stroke="#1E293B" strokeWidth="3" />
              {/* Closed relaxed eyes */}
              <path d="M 21,34 Q 24,37 26,34" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 38,34 Q 41,37 43,34" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              {/* Smiling peaceful lips */}
              <path d="M 29,42 Q 32,44 35,42" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Sprout atop head */}
              <path d="M 32,20 C 30,8 38,8 36,20" fill="#22C55E" stroke="#1E293B" strokeWidth="2.2" />

              {/* Big thick headphone ears cups enclosing him */}
              <motion.g animate={{ y: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                {/* Band */}
                <path d="M 12,25 C 12,5 52,5 52,25" stroke="#1E293B" strokeWidth="3.5" fill="none" />
                {/* Left cup */}
                <rect x="8" y="24" width="8" height="15" rx="3.5" fill="#3B82F6" stroke="#1E293B" strokeWidth="2.5" />
                {/* Right cup */}
                <rect x="48" y="24" width="8" height="15" rx="3.5" fill="#3B82F6" stroke="#1E293B" strokeWidth="2.5" />
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'retention-anti-burnout':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#FFF0F0] via-[#FDE2E2] to-[#FCD3D3] overflow-hidden flex items-center justify-center border-b-4 border-[#EF4444]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />

          {/* Hot amber sun on one side */}
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute text-amber-500 top-6 left-10 text-base">☀️</motion.div>
          {/* Cool sleep moon on the other side */}
          <motion.div animate={{ y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute text-indigo-500 top-8 right-12 text-base">🌙</motion.div>

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* The compass architecture ring */}
            <circle cx="100" cy="80" r="42" fill="#FFF" stroke="#991B1B" strokeWidth="3" />
            <circle cx="100" cy="80" r="34" fill="none" stroke="#FEE2E2" strokeWidth="2" strokeDasharray="3 3" />

            {/* Central pivot point */}
            <circle cx="100" cy="80" r="4" fill="#991B1B" />

            {/* Spirit Butterfly balancing indicator pointer */}
            <g transform="translate(100, 80)">
              <motion.g
                animate={{ rotate: [-22, 22, -22] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              >
                {/* Pointer needles */}
                <path d="M 0,0 L 0,-30 L 3,-25 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <path d="M 0,0 L 0,30 L -3,25 Z" fill="#94A3B8" stroke="#991B1B" strokeWidth="1.5" />

                {/* Animated soft butterfly wings resting upon pointer */}
                <g transform="translate(0, -32) scale(0.65)" stroke="#991B1B" strokeWidth="1.8">
                  <motion.path 
                    animate={{ rotateY: [0, 68, 0] }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                    style={{ transformOrigin: "0px 0px" }}
                    d="M 0,0 C 12,-15 25,-5 20,4 C 18,10 5,5 0,0" fill="#EF4444" 
                  />
                  <motion.path 
                    animate={{ rotateY: [0, -68, 0] }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                    style={{ transformOrigin: "0px 0px" }}
                    d="M 0,0 C -12,-15 -25,-5 -20,4 C -18,10 -5,5 0,0" fill="#EF4444" 
                  />
                </g>
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'retention-secure-sharing':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#E6F8FA] via-[#D1F2F5] to-[#BFECEF] overflow-hidden flex items-center justify-center border-b-4 border-[#06B6D4]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />

          {/* Glowing firefly delivering letters */}
          <motion.div animate={{ y: [2, -18, 2], x: [-15, 15, -15], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute text-cyan-700 font-extrabold top-12 left-1/2 -translate-x-1/2 text-sm z-20">✉️</motion.div>

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* Left plant pot */}
            <g transform="translate(42, 85)" stroke="#164E63" strokeWidth="2.5" strokeLinejoin="round">
              <path d="M 4,20 L 26,20 L 22,36 L 8,36 Z" fill="#A5F3FC" />
              {/* Cute leaf sprout */}
              <circle cx="15" cy="18" r="10" fill="#FFF" />
              <path d="M 15,10 C 13,2 20,2 18,10" fill="#14B8A6" />
              <circle cx="12" cy="16" r="1" fill="#164E63" />
              <circle cx="18" cy="16" r="1" fill="#164E63" />
            </g>

            {/* Right plant pot */}
            <g transform="translate(128, 85)" stroke="#164E63" strokeWidth="2.5" strokeLinejoin="round">
              <path d="M 4,20 L 26,20 L 22,36 L 8,36 Z" fill="#A5F3FC" />
              {/* Cute leaf sprout */}
              <circle cx="15" cy="18" r="10" fill="#FFF" />
              <path d="M 15,10 C 13,2 20,2 18,10" fill="#14B8A6" />
              <circle cx="12" cy="16" r="1" fill="#164E63" />
              <circle cx="18" cy="16" r="1" fill="#164E63" />
            </g>

            {/* Beautiful glowing green connecting trail vine */}
            <motion.path 
              animate={{ strokeDashoffset: [0, -40] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              strokeDasharray="4 6"
              d="M 57,98 C 80,75 118,75 143,98" fill="none" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" 
            />

            {/* Golden glowing central connection spark heart */}
            <motion.path 
              animate={{ scale: [0.95, 1.25, 0.95], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              d="M 100,74 C 98,70 102,66 100,70 L 100,74" stroke="#F59E0B" strokeWidth="3.2" strokeLinecap="round" 
            />
          </svg>
        </div>
      );

    case 'retention-future-upgrades':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-[#FFF0F2] via-[#FDE2E6] to-[#FCD3DB] overflow-hidden flex items-center justify-center border-b-4 border-[#F43F5E]/15 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />

          {/* Dotted target upgrades spark */}
          <motion.div animate={{ scale: [0.93, 1.1, 0.93] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute text-rose-500 top-10 right-14 text-[11px] font-black">⚙️ FUTURE</motion.div>

          <svg viewBox="0 0 200 150" className="w-44 h-36 relative z-10 transition-transform duration-500 group-hover:scale-105">
            {/* The Blueprint blueprint background paper sheets grid grid */}
            <rect x="35" y="35" width="130" height="96" rx="8" fill="#1E3A8A" stroke="#881337" strokeWidth="2.5" />
            <line x1="35" y1="59" x2="165" y2="59" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="35" y1="83" x2="165" y2="83" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="35" y1="107" x2="165" y2="107" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="67" y1="35" x2="67" y2="131" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="100" y1="35" x2="100" y2="131" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="133" y1="35" x2="133" y2="131" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" />

            {/* Futuristic drafted layout of robotic helper or mega-cactus and mechanics arm coordinates */}
            <g opacity="0.9" stroke="#93C5FD" strokeWidth="2" strokeDasharray="2 2" fill="none">
              <ellipse cx="100" cy="90" rx="20" ry="25" />
              <path d="M 100,115 L 100,123" strokeWidth="3" />
              
              {/* Top antennas / sunglasses draft */}
              <line x1="88" y1="78" x2="112" y2="78" strokeWidth="2.5" />
              <circle cx="92" cy="78" r="4" fill="#93C5FD" />
              <circle cx="108" cy="78" r="4" fill="#93C5FD" />

              {/* Upgraded micro-drip arm robotic nozzle helper */}
              <motion.path 
                animate={{ rotate: [-8, 12, -8] }}
                transition={{ repeat: Infinity, duration: 3 }}
                style={{ transformOrigin: "145px 55px" }}
                d="M 145,55 Q 120,45 110,65 L 104,60" stroke="#FFF" strokeWidth="2.5" 
              />
            </g>

            {/* Glowing upgrade sparkles design */}
            <g fill="#FFF">
              <motion.circle animate={{ r: [1.5, 3.5, 1.5] }} transition={{ repeat: Infinity, duration: 1.5 }} cx="62" cy="50" r="2.5" />
              <motion.circle animate={{ r: [1.5, 3.5, 1.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }} cx="138" cy="115" r="2.5" />
            </g>
          </svg>
        </div>
      );

    default:
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center border-b-4 border-blue-900 shadow-inner">
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-lg">
            <BookIcon size={32} />
          </div>
        </div>
      );
  }
}

export function ArchivesScreen({ 
  stats, 
  onUpdateStats, 
  settings, 
  onUpdateSettings, 
  play, 
  onBack 
}: { 
  stats: UserStats;
  onUpdateStats: (s: any | ((prev: any) => any)) => void;
  settings: UserSettings;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
  play: (sound: string) => void;
  onBack: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'challenge' | 'plant' | 'health'>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [lessonFinished, setLessonFinished] = useState(false);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBookClaimStatus = (bookId: string) => {
    const lastClaim = settings.bookClaimTimestamps?.[bookId] || 0;
    const cooldownMs = 1.5 * 24 * 60 * 60 * 1000; // 36 hours (1.5 days)
    const timePassed = now - lastClaim;
    const isCooldownActive = lastClaim > 0 && timePassed < cooldownMs;
    const timeRemainingMs = isCooldownActive ? cooldownMs - timePassed : 0;

    let countdownStr = '';
    if (isCooldownActive) {
      const totalSecs = Math.floor(timeRemainingMs / 1000);
      const days = Math.floor(totalSecs / (24 * 3600));
      const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      if (days > 0) {
        countdownStr = `${days}d ${hours}h`;
      } else if (hours > 0) {
        countdownStr = `${hours}h ${mins}m`;
      } else {
        countdownStr = `${mins}m ${secs}s`;
      }
    }

    return {
      isCooldownActive,
      timeRemainingMs,
      countdownStr
    };
  };

  // Playful cozy tips indices
  const [tipIndex] = useState(() => Math.floor(Math.random() * 5));
  const cozyTips = [
    "💧 Hi friend! Keep going, little sprout! Every drop of daily knowledge makes your habits grow stronger! 🌿",
    "🌱 Water your habits, nurture your mind, and take three deep breaths. You're doing wonderful!",
    "🌸 'To grow a beautiful garden, you must nourish the soil every single day.' Let's read a cozy dossier!",
    "☀️ Did you drink your active water glass today? Let's sip some cool water together while exploring!",
    "🍀 Your healthy botanical habits garden is looking incredibly lush, vibrant, and well-watered today!"
  ];

  // Completed books tracker from settings
  const completedBookIds = useMemo(() => {
    return settings.readBookIds || [];
  }, [settings.readBookIds]);

  // Map and expand knowledge books with custom editorial contents and titles matching Plant Nanny premium feel
  const mappedBooks: Book[] = useMemo(() => {
    return KNOWLEDGE_BOOKS.map(book => {
      if (book.id === 'research-sleep') {
        return {
          ...book,
          title: 'Mental Fortitude: Overcoming Laziness',
          description: 'Learn to build strong mental guards.',
          content: {
            title: 'Mental Fortitude: Overcoming Laziness',
            sections: [
              {
                heading: 'Somatic Inertia vs. Intention',
                text: 'Daily mental blocks are not laziness, comrade; they are simply cognitive drag. In the Nexora Academy, we recognize that the brain naturally resists high-friction tasks to conserve energy. This inertia is perfectly normal, but it can be bypassed. By establishing a simple 5-minute activation anchor, you can slip right past your amygdala\'s security warning system and step directly into a calm, rewarding state of focus.'
              },
              {
                heading: 'Developing Strong Mental Guards',
                text: 'To build absolute mental fortitude, we must eliminate sensory noise. Park your smartphone in another room, shutdown non-essential tabs, and layout one clear objective. When you restrict outward distractions, your dopamine baseline resets, forcing your prefrontal command centers to lock securely onto your chosen task with absolute focus and clarity.'
              },
              {
                heading: 'The 5-Minute Activation Trigger',
                text: 'Forget preparing for high-volume sprints. Instead, commit to working for only five minutes. Start the physical process of writing, sketching, or typing. In ninety percent of cases, this tiny physical momentum breaks the initial dread. Once active, the cerebral friction melts away, replacing your reservation with beautiful, self-sustaining flow.'
              }
            ]
          }
        };
      }
      if (book.id === 'guide-water') {
        return {
          ...book,
          title: 'Advanced Fertilizers',
          description: 'Learn to nourish your botanical plants with trace nutrients.',
          content: {
            title: 'Trace Element Optimization: Advanced Fertilizers',
            sections: [
              {
                heading: 'Understanding Soil Chemistry',
                text: 'For a plant to grow beautiful foliage, simple watering is not enough, little sprout! The soil requires a balanced trace element profile, including nitrogen, phosphorus, potassium, and magnesium. These organic minerals power the biological engine of the root, helping the plant build strong cell walls.'
              },
              {
                heading: 'The Micro-Dosing Principle',
                text: 'Flooding the roots with high concentrations of heavy fertilizer will cause chemical burns. Instead, apply the gentle micro-dosing protocol. Dilute the trace minerals slowly in room-temperature water every third watering cycle. This allows the root-hairs to absorb the nutrients smoothly and safely without systemic shock.'
              },
              {
                heading: 'Nurture Your Growth Roots',
                text: 'Just like your digital greenhouse flowers, your real life habits require subtle, daily nourishment. Reading a lesson, sipping clean mineral water, and writing down micro-wins are the natural fertilizers that feed your subconscious mind. Watch your habits grow into a magnificent lush garden today!'
              }
            ]
          }
        };
      }
      if (book.id === 'plant-desert-guide') {
        return {
          ...book,
          title: 'Pest Prevention',
          description: 'Defend your flora and greenhouse against invasive digital pests.',
          content: {
            title: 'Botanical Defense Blueprint: Pest Prevention',
            sections: [
              {
                heading: 'Spotting the Hidden Invaders',
                text: 'Greenhouse safety is built on continuous, mindful observation. Common pests like spider mites, mealybugs, and whiteflies often start in small, invisible clusters on the undersides of new leaves. If ignored, they multiply rapidly, draining the sap and vitality of your beautiful flowers.'
              },
              {
                heading: 'Organic Defense Shields',
                text: 'Instead of using harsh, toxic chemical sprays, deploy natural organic defenses. Mild mixtures of neem oil, pure horticultural soap, and lukewarm water create a protective barrier on the leaf tissue. Spray the leaves gently once a week to repel pests while keeping your plants perfectly moist and clean.'
              },
              {
                heading: 'Mental Pest Filters',
                text: 'In your daily work routine, notifications, clickbait headlines, and sudden alerts are the digital pests that drain your cognitive energy. Build robust filters: turn on do-not-disturb, block invasive apps, and spray your day with quiet blocks of focus. Keep your mental workspace lush, clean, and pest-free!'
              }
            ]
          }
        };
      }
      if (book.id === 'womens-wellness-deep') {
        return {
          ...book,
          title: 'Mantra Secrets',
          description: 'Align your neural pathways and quiet stress with ancient chants.',
          content: {
            title: 'Resonance Chanting: Mantra Secrets',
            sections: [
              {
                heading: 'The Sonic Brain wave Connection',
                text: 'Ancient auditory mantras are not mystical magic; they are practical resonant engineering. Repeating a low, rhythmic phonetic vibration creates a steady, gentle hum throughout your vocal cords and chest tissue. This sonic wave stimulates your cranial nerves, sending a strong signaling sequence to slow your heart rate.'
              },
              {
                heading: 'Releasing Daily Muscle Tension',
                text: 'When we hold thoughts of worry, our physical muscles contract—especially around our jaw, neck, and shoulders. Speaking or sub-vocally repeating a calming mantra overrides this contraction. The continuous vocal resonance acts like an internal ultrasonic massage, breaking down lactic acid and melting stress.'
              },
              {
                heading: 'Designing Your Personal Cue',
                text: 'Select a humble word or short supportive phrase to act as your semantic anchoring prompt, such as "Peace" or "Stillness." When focus starts to fade, close your eyes, take three deep breaths, and slow repeat your anchor. This immediately redirects chaotic frontal-lobe loops back to baseline centering.'
              }
            ]
          }
        };
      }
      if (book.id === 'active-mom') {
        return {
          ...book,
          title: 'Morning Clarity',
          description: 'Waken your biomechanics with simple morning hydration triggers.',
          content: {
            title: 'Somatic Awakening Loop: Morning Clarity',
            sections: [
              {
                heading: 'The Overnight Dehydration Shock',
                text: 'During a typical eight-hour sleep, your body breathes out nearly a liter of moisture. When you open your eyes in the morning, your tissues are extremely desiccated. This overnight dehydration manifests as fuzzy morning fatigue, leaden eyelids, and a slow, reluctant cognitive startup.'
              },
              {
                heading: 'The 10-Ounce Water Kickstart',
                text: 'Before touching your phone, brewing heavy coffee, or planning your day, drink ten ounces of room-temperature mineral water. This instant infusion restarts liver enzymes, hydrates dehydrated red blood cells, and boosts blood flow to your brain, washing away sleep inertia in seconds.'
              },
              {
                heading: 'Morning Focus Alignment',
                text: 'Pair your morning glass with a brief visual checkout. Look out a window or gaze at your thriving digital plants. Let natural light enter your eyes to lock down your circadian clock. This simple, graceful sequence sets a beautiful, hydrated tone for every challenge that awaits you.'
              }
            ]
          }
        };
      }
      return book;
    });
  }, [KNOWLEDGE_BOOKS]);

  // Extract featured insight book definition (Mental Fortitude)
  const featuredBook = useMemo(() => {
    return mappedBooks.find(b => b.id === 'research-sleep') || mappedBooks[0];
  }, [mappedBooks]);

  // Group books for the carousels
  const plantMasterclassBooks = useMemo(() => {
    const list = mappedBooks.filter(b => b.category === 'plant' || b.id === 'guide-water' || b.id === 'plant-desert-guide');
    return [...list].sort((a, b) => {
      if (a.id === 'guide-water') return -1;
      if (b.id === 'guide-water') return 1;
      if (a.id === 'plant-desert-guide') return -1;
      if (b.id === 'plant-desert-guide') return 1;
      return 0;
    });
  }, [mappedBooks]);

  const mindsetMeditationBooks = useMemo(() => {
    const list = mappedBooks.filter(b => 
      b.id !== 'research-sleep' && 
      b.id !== 'guide-water' && 
      b.id !== 'plant-desert-guide' && 
      b.category !== 'plant'
    );
    return [...list].sort((a, b) => {
      if (a.id === 'womens-wellness-deep') return -1;
      if (b.id === 'womens-wellness-deep') return 1;
      if (a.id === 'active-mom') return -1;
      if (b.id === 'active-mom') return 1;
      return 0;
    });
  }, [mappedBooks]);

  // Clean, beautifully organized categories with cozy garden emojis
  const categories = [
    { id: 'all', label: '🌸 All Seeds', icon: Compass },
    { id: 'challenge', label: '💧 Life Habits', icon: Zap },
    { id: 'plant', label: '🌱 Botany Care', icon: Flower },
    { id: 'health', label: '☀️ Sun Wisdom', icon: Sun },
  ];

  // Trigger automated reading search helper
  const handleLetTrain = () => {
    const unread = mappedBooks.filter(b => !completedBookIds.includes(b.id));
    const targetBook = unread.length > 0 
      ? unread[Math.floor(Math.random() * unread.length)] 
      : mappedBooks[Math.floor(Math.random() * mappedBooks.length)];

    if (targetBook) {
      triggerReadingSession(targetBook);
    }
  };

  const triggerReadingSession = (book: Book) => {
    setSelectedBook(book);
    setLessonFinished(false);
    if (settings.soundEnabled) {
      try { play('select_task'); } catch (e) {}
    }
  };

  // Process completed lesson
  const completeLesson = () => {
    if (!selectedBook) return;

    const { isCooldownActive } = getBookClaimStatus(selectedBook.id);
    
    if (!isCooldownActive) {
      const nextReadBookIds = completedBookIds.includes(selectedBook.id)
        ? completedBookIds
        : [...completedBookIds, selectedBook.id];
      const nextClaimTimestamps = {
        ...(settings.bookClaimTimestamps || {}),
        [selectedBook.id]: Date.now()
      };

      onUpdateSettings({
        readBookIds: nextReadBookIds,
        bookClaimTimestamps: nextClaimTimestamps
      });

      // Award cozy garden incentives (+50 XP and +10 Coins!)
      onUpdateStats((prev: any) => ({
        ...prev,
        coins: (prev.coins || 0) + 10,
        xp: (prev.xp || 0) + 50
      }));

      if (settings.soundEnabled) {
        try { play('fire_streak'); } catch (e) {}
      }
    }

    setLessonFinished(true);
  };

  // Filter book list for search results view
  const filteredBooks = useMemo(() => {
    return mappedBooks.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [mappedBooks, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4F3F34] font-sans relative overflow-x-hidden selection:bg-emerald-500/20 pb-28">
      
      {/* Playful, cozy background elements similar to Plant Nanny soft garden vibes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[-15%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-emerald-100/35 via-amber-50/10 to-transparent blur-[80px]" />
        <div className="absolute bottom-[10%] right-[-15%] w-[85vw] h-[85vw] rounded-full bg-gradient-to-tl from-sky-100/30 via-emerald-50/10 to-transparent blur-[100px]" />
        {/* Subtle decorative leaf symbols dancing in background */}
        <div className="absolute top-24 left-[8%] w-6 h-6 text-emerald-200/40 transform rotate-12">🌿</div>
        <div className="absolute top-[45%] right-[6%] w-8 h-8 text-amber-200/35 transform -rotate-45">🌸</div>
        <div className="absolute bottom-36 left-[4%] w-7 h-7 text-sky-200/40 transform rotate-45">💧</div>
      </div>

      {/* Cozy Rounded Sticky Navigation Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md px-6 py-4.5 border-b-2 border-[#E9E4D4]/85 shadow-[0_4px_20px_rgba(100,80,60,0.03)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-3 bg-white hover:bg-[#FAF7F2] rounded-2.5xl shadow-[0_4px_12px_rgba(100,80,60,0.06)] border-2 border-[#E9E4D4] text-[#4F3F34] group cursor-pointer transition-all"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
          </motion.button>
          
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#4F3F34] font-sans">Nexora Academy</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-emerald-800 bg-[#E6F4EA] border border-emerald-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                🌱 Grown: {completedBookIds.length} / {mappedBooks.length} Insights
              </span>
            </div>
          </div>
        </div>

        {/* Currency & Growth Points */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-sm">
          <span className="text-xs font-bold text-amber-800 flex items-center gap-1">🪙 {stats.coins || 0}</span>
          <span className="text-[10px] text-amber-600/80 font-bold">|</span>
          <span className="text-[10px] font-bold text-emerald-800">✨ {stats.xp || 0} XP</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 space-y-10">
        
        {/* Wholesome Companion Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2.2rem] bg-white border-2 border-[#E9E4D4] shadow-[0_8px_30px_rgba(100,80,60,0.04)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#E7F5ED] rounded-full blur-3xl -mr-12 -mt-12 opacity-70" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
              <div className="w-16 h-16 bg-[#FFF9EE] border-2 border-[#FBDCA3] rounded-3xl flex items-center justify-center p-2 shadow-sm shrink-0">
                <Mascot mood="happy" className="w-full h-full" />
              </div>
              
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Botanical Library Advisor
                </div>
                <h1 className="text-xl font-extrabold text-[#4F3F34] leading-tight">
                  Water Your Habits Today!
                </h1>
                <p className="text-[#7D6B58] text-xs max-w-xl leading-relaxed">
                  {cozyTips[tipIndex]}
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleLetTrain}
                className="w-full md:w-auto px-6 py-3.5 bg-[#69C496] hover:bg-[#58B383] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-[0_6px_18px_rgba(105,196,150,0.3)] cursor-pointer border-b-4 border-[#419E6E] active:border-b-0 active:translate-y-1 transition-all"
              >
                🌱 Open Random Seed
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search Input Bar */}
        <div className="flex items-stretch justify-between bg-white p-3.5 rounded-[1.8rem] border-2 border-[#E9E4D4]/90 shadow-[0_6px_22px_rgba(100,80,60,0.02)] relative z-20">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8975] w-4.5 h-4.5 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search botanical seeds, habits, or care tips..."
              className="w-full bg-[#FAF7F2] text-[#4F3F34] pl-11 pr-4 py-3 rounded-2xl border-2 border-[#E9E4D4]/80 focus:outline-none focus:border-[#69C496] focus:bg-white font-medium text-xs placeholder-[#9A8975]/60 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-[#E9E4D4] text-[#4F3F34] rounded-full hover:bg-red-100 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* SECTION CONDITIONAL RENDERING: editorial vs search results */}
        {searchQuery ? (
          /* SEARCH RESULTS GRID VIEW */
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-[#9A8975] uppercase tracking-wider">
                🔍 Search Results ({filteredBooks.length})
              </h3>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-[#E9E4D4] p-8 space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <Flower className="w-8 h-8" />
                </div>
                <p className="font-extrabold text-[#7D6B58] text-sm uppercase tracking-wide">No habit seeds found in this garden zone</p>
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="text-[10px] text-emerald-800 bg-[#E6F4EA] font-bold uppercase tracking-wider border border-emerald-200 px-4.5 py-2.5 rounded-xl transition-all hover:bg-emerald-100"
                >
                  Clear Search Query
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => {
                  const { isCooldownActive, countdownStr } = getBookClaimStatus(book.id);
                  return (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => triggerReadingSession(book)}
                      className="group bg-white rounded-[2.2rem] border-2 border-[#E9E4D4] hover:border-[#69C496] p-4.5 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(100,80,60,0.06)] flex flex-col gap-4.5 cursor-pointer relative"
                    >
                      <div className="rounded-2xl overflow-hidden relative shadow-sm h-48 bg-[#FAF7F2] flex items-center justify-center">
                        <BookIllustration bookId={book.id} />
                      </div>

                      <div className="space-y-3 flex-1 px-1">
                        <div className="flex items-center justify-between">
                          {isCooldownActive ? (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full uppercase flex items-center gap-1">
                              ⏳ Rest {countdownStr}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-800 bg-[#E6F4EA] border border-emerald-200 px-3 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse">
                              ✨ Claimable
                            </span>
                          )}
                          <span className="text-[10px] text-emerald-800 bg-[#E8F5E9] border border-emerald-100 px-2 py-0.5 rounded-md font-bold">
                            🪙 +10
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-[#4F3F34] text-lg leading-snug group-hover:text-[#69C496] transition-colors">
                            {book.title}
                          </h4>
                          <p className="text-xs text-[#7D6B58] font-medium leading-relaxed line-clamp-2">
                            {book.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 px-1 text-[10px] font-bold text-[#9A8975] uppercase">
                        <span>⏱️ 2 min read</span>
                        <span className="text-[#69C496] font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          Nurture seed <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* PART 1.2 & 1.3: PREMIUM MAGAZINE EDITORIAL LAYOUT */
          <div className="space-y-12">
            
            {/* HERO ARTICLE CARD (FEATURED INSIGHT) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#9A8975] uppercase tracking-wider px-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured Insight
              </h3>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => triggerReadingSession(featuredBook)}
                className="group w-full bg-white rounded-[2.8rem] border-2 border-[#E9E4D4] hover:border-[#69C496] p-6.5 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(100,80,60,0.06)] flex flex-col md:flex-row gap-8 cursor-pointer relative overflow-hidden"
              >
                {/* Image panel left (on desktop) */}
                <div className="w-full md:w-[48%] h-64 sm:h-76 rounded-3xl overflow-hidden relative shrink-0 bg-[#FAF7F2] flex items-center justify-center shadow-inner">
                  <BookIllustration bookId={featuredBook.id} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Content details right */}
                <div className="flex-1 flex flex-col justify-between py-1 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 bg-[#FFF3E0] text-amber-900 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">
                        🌱 Daily Mindset Strategy
                      </span>
                      {(() => {
                        const status = getBookClaimStatus(featuredBook.id);
                        return status.isCooldownActive ? (
                          <span className="px-3.5 py-1.5 bg-amber-50 text-amber-950 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none flex items-center gap-1">
                            ⏳ Cooldown {status.countdownStr}
                          </span>
                        ) : (
                          <span className="px-3.5 py-1.5 bg-emerald-50 text-[#2E7D32] border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none flex items-center gap-1 animate-pulse">
                            ✨ Claimable
                          </span>
                        );
                      })()}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4F3F34] leading-tight group-hover:text-[#69C496] transition-colors">
                      {featuredBook.title}
                    </h2>

                    <p className="text-sm text-[#7D6B58] font-medium leading-relaxed max-w-lg">
                      {featuredBook.description} Our core biological guards must be locked in to prevent digital stagnation. Get direct actionable tactics from Sprout.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#FAF7F2]">
                    <span className="text-xs font-bold text-[#9A8975] uppercase flex items-center gap-1.5">
                      ⏱️ 2 min read
                    </span>

                    <button className="px-6 py-3 bg-[#69C496] hover:bg-[#58B383] text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#69C496]/20 transition-all border-b-2 border-[#419E6E]">
                      <BookOpen className="w-4 h-4" />
                      Read Insight
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* SLIDER CAROUSEL 1: 🌱 Plant Masterclass */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#9A8975] uppercase tracking-wider px-2 flex items-center gap-1.5">
                🌱 Plant Masterclass
              </h3>

              <div className="overflow-x-auto flex gap-6 pb-6 px-1.5 select-none no-scrollbar snap-x snap-mandatory">
                {plantMasterclassBooks.map((book) => {
                  const { isCooldownActive, countdownStr } = getBookClaimStatus(book.id);
                  return (
                    <motion.div
                      key={book.id}
                      whileHover={{ scale: 1.015 }}
                      onClick={() => triggerReadingSession(book)}
                      className="group flex-shrink-0 w-64 bg-white rounded-[2rem] border-2 border-[#E9E4D4] hover:border-[#69C496] p-4.5 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-[0_10px_28px_rgba(100,80,60,0.05)] snap-start flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Compact thumbnail vertically on top */}
                        <div className="h-40 rounded-2xl overflow-hidden relative bg-[#FAF7F2] flex items-center justify-center">
                          <BookIllustration bookId={book.id} />
                        </div>

                        {/* Text and labels beneath */}
                        <div className="space-y-1 px-1">
                          <h4 className="font-extrabold text-[#4F3F34] text-base leading-snug group-hover:text-[#69C496] transition-colors line-clamp-2">
                            {book.title}
                          </h4>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${isCooldownActive ? 'text-amber-700' : 'text-emerald-700 animate-pulse'}`}>
                            {isCooldownActive ? `⏳ COOLDOWN ${countdownStr}` : '✨ CLAIMABLE 🪙'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* SLIDER CAROUSEL 2: 🧠 Mindset & Meditation */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#9A8975] uppercase tracking-wider px-2 flex items-center gap-1.5">
                🧠 Mindset & Meditation
              </h3>

              <div className="overflow-x-auto flex gap-6 pb-6 px-1.5 select-none no-scrollbar snap-x snap-mandatory">
                {mindsetMeditationBooks.map((book) => {
                  const { isCooldownActive, countdownStr } = getBookClaimStatus(book.id);
                  return (
                    <motion.div
                      key={book.id}
                      whileHover={{ scale: 1.015 }}
                      onClick={() => triggerReadingSession(book)}
                      className="group flex-shrink-0 w-64 bg-white rounded-[2rem] border-2 border-[#E9E4D4] hover:border-[#69C496] p-4.5 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-[0_10px_28px_rgba(100,80,60,0.05)] snap-start flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Compact thumbnail vertically on top */}
                        <div className="h-40 rounded-2xl overflow-hidden relative bg-[#FAF7F2] flex items-center justify-center">
                          <BookIllustration bookId={book.id} />
                        </div>

                        {/* Text and labels beneath */}
                        <div className="space-y-1 px-1">
                          <h4 className="font-extrabold text-[#4F3F34] text-base leading-snug group-hover:text-[#69C496] transition-colors line-clamp-2">
                            {book.title}
                          </h4>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${isCooldownActive ? 'text-amber-700' : 'text-emerald-700 animate-pulse'}`}>
                            {isCooldownActive ? `⏳ COOLDOWN ${countdownStr}` : '✨ CLAIMABLE 🪙'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Footer info banner */}
        <p className="text-center text-[10px] text-[#9A8975] font-extrabold uppercase tracking-widest pt-12">
          🌸 Nexora Botanical Oasis • Learn & Stay Healthy! 🌸
        </p>

      </div>

      {/* PART 2: THE ARTICLE DETAIL VIEW (READING SCREEN MODAL) */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 24, stiffness: 180 }}
            className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col justify-between overflow-hidden"
          >
            {/* Elegant transparent sticky header for dismiss actions */}
            <div className="bg-[#FAF7F2]/90 backdrop-blur-md border-b-2 border-[#E9E4D4] px-6 py-4 flex items-center justify-between gap-6 shrink-0 relative z-10">
              <button 
                onClick={() => setSelectedBook(null)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] rounded-2xl text-[#4F3F34] border-2 border-[#E9E4D4] shadow-sm cursor-pointer font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                Exit Reading
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E6F4EA] border border-emerald-200 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#69C496] animate-pulse" />
                <span className="text-[10px] font-extrabold text-[#2F7A54] uppercase tracking-wider">
                  Continuous Classroom
                </span>
              </div>
            </div>

            {/* Seamless, Vertically Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto w-full flex flex-col items-center">
              
              {/* IMMERSIVE VERTICAL STACKED VIEW */}
              <div className="w-full max-w-2xl px-6 py-6 pb-32 space-y-10">
                
                {lessonFinished ? (
                  /* REWARD ACQUISITION JUMP STATE */
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8 py-12"
                  >
                    {/* Cute Mascot Jumping for Joy */}
                    <div className="relative inline-block w-40 h-40">
                      <div className="absolute inset-0 bg-[#E7F5ED] rounded-full blur-2xl opacity-60 scale-125" />
                      <div className="w-full h-full bg-white rounded-[2.5rem] border-2 border-[#E9E4D4] shadow-sm p-4 relative z-10 flex items-center justify-center">
                        <Mascot mood="happy" className="w-full h-full transform hover:scale-105 transition-transform" />
                      </div>
                      
                      <span className="absolute -top-3 -right-3 text-2xl animate-bounce">💧</span>
                      <span className="absolute -bottom-2 -left-3 text-2xl animate-pulse">🌸</span>
                      <span className="absolute top-1/2 -left-6 text-xl">🌟</span>
                    </div>

                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#A5D6A7]">
                        🌿 HYDRATION INSIGHT GROWING COMPLETE!
                      </span>
                      <h2 className="text-3xl font-extrabold text-[#4F3F34] tracking-tight font-sans">
                        Seed Fully Nourished!
                      </h2>
                      <p className="text-sm font-medium text-[#7D6B58] max-w-sm mx-auto leading-relaxed">
                        Splendid work, friend! You have successfully watered and harvested the <span className="text-[#69C496] font-bold">{selectedBook.title}</span> knowledge capsule!
                      </p>
                    </div>

                    {/* Rewards Grid */}
                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                      <div className="bg-white border-2 border-[#E9E4D4] p-4.5 rounded-[1.8rem] flex flex-col items-center shadow-sm">
                        <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Tokens Awarded
                        </span>
                        <span className="text-lg font-bold text-[#4F3F34] mt-2 font-sans">
                          +10 🪙
                        </span>
                      </div>
                      <div className="bg-white border-2 border-[#E9E4D4] p-4.5 rounded-[1.8rem] flex flex-col items-center shadow-sm">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Botanical XP
                        </span>
                        <span className="text-lg font-bold text-[#4F3F34] mt-2 font-sans">
                          +50 ✨
                        </span>
                      </div>
                    </div>

                    {/* Interactive advice from garden buddy */}
                    <div className="bg-[#FFFDF9] border-2 border-[#F6EED4] rounded-3xl p-5 flex gap-4.5 items-center justify-start text-left max-w-md mx-auto shadow-sm">
                      <div className="w-12 h-12 bg-white rounded-2xl border-2 border-[#FBDCA3] shrink-0 p-1">
                        <Mascot mood="happy" className="w-full h-full" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-[#9A8975] uppercase tracking-wider leading-none">Sprout Companion</p>
                        <p className="text-xs text-[#7D6B58] font-bold mt-1.5 leading-relaxed">
                          "Fantastic! That water seed went deep down into your mind roots! Keep sipping cool fluids for daily growth!"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBook(null)}
                      className="w-full max-w-xs bg-[#69C496] hover:bg-[#58B383] text-white py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#69C496]/25 cursor-pointer text-center border-b-4 border-[#419E6E] active:border-b-0 active:translate-y-0.5 transition-all mt-6"
                    >
                      Finish Watering and Go Back
                    </button>

                  </motion.div>
                ) : (
                  /* IMMERSIVE WRAPPER-FREE VERTICAL TEXT VIEW */
                  <div className="space-y-10">
                    
                    {/* a) TOP HERO ILLUSTRATION BANNER */}
                    <div className="w-full h-64 sm:h-80 rounded-[2.5rem] overflow-hidden relative shadow-sm bg-[#FAF7F2] flex items-center justify-center border-2 border-[#E9E4D4]">
                      <BookIllustration bookId={selectedBook.id} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* b) MAIN HEADLINE INFORMATION */}
                    <div className="space-y-3">
                      <span className="px-3.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        🌱 Wisdom Dossier #{selectedBook.id.substring(0, 5).toUpperCase()}
                      </span>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#4F3F34] tracking-tight leading-tight pt-1 font-sans">
                        {selectedBook.title}
                      </h1>
                    </div>

                    {/* c) SUBTLE SEPARATOR */}
                    <div className="h-0.5 w-full bg-[#E9E4D4]" />

                    {/* d) FULL UNINTERRUPTED ARTICLE BODIES */}
                    <div className="space-y-8">
                      {selectedBook.content.sections.map((section, index) => {
                        const isEven = index % 2 === 1;
                        
                        return (
                          <div key={index} className="space-y-4">
                            {/* Section Heading */}
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-6 bg-[#69C496] rounded-full" />
                              <h3 className="text-lg font-bold text-[#4F3F34] uppercase tracking-tight font-sans">
                                {section.heading}
                              </h3>
                            </div>

                            {/* Section Text with inline callout/wisdom accent style conditional */}
                            {isEven ? (
                              /* Inline Callout - Botanical Style Advice */
                              <div className="bg-[#EBF7F0] border-l-4 border-[#69C496] p-6 rounded-r-3xl my-6 shadow-sm">
                                <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                                  🌟 Deep Mind Root Accent
                                </span>
                                <p className="text-sm font-semibold text-[#4F3F34] mt-2.5 italic leading-relaxed font-serif">
                                  {section.text}
                                </p>
                              </div>
                            ) : (
                              /* Standard elegant prose text */
                              <p className="text-sm sm:text-base text-[#4F3F34] font-medium leading-loose whitespace-pre-line font-serif pr-2">
                                {section.text}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* e) THE REWARD TRIGGER (Placed exclusively at the absolute bottom of the scroll) */}
                    <div className="pt-10 border-t border-[#E9E4D4] flex flex-col items-center">
                      <div className="w-full bg-white p-6.5 rounded-[2.2rem] border-2 border-[#E9E4D4] text-center space-y-5 shadow-sm max-w-lg">
                        {(() => {
                          const status = getBookClaimStatus(selectedBook.id);
                          return (
                            <>
                              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase inline-block ${status.isCooldownActive ? 'text-amber-800 bg-amber-50 border border-amber-200' : 'text-emerald-800 bg-[#E6F4EA] border border-emerald-200'}`}>
                                {status.isCooldownActive ? '⏳ Regrowing Wisdom Capsule' : '🎁 Completed Reading Incentives'}
                              </span>
                              
                              <div className="space-y-1">
                                <h4 className="text-lg font-extrabold text-[#4F3F34]">{status.isCooldownActive ? 'Wisdom Capsule Absorbed' : 'Nourish with Wisdom'}</h4>
                                <p className="text-xs text-[#7D6B58] font-medium max-w-sm mx-auto leading-relaxed">
                                  {status.isCooldownActive 
                                    ? `This botanical knowledge seed has been watered. You can claim another harvest reward in ${status.countdownStr}.` 
                                    : 'Harvest this seed knowledge capsule to claim +10 Coins and +50 XP directly!'}
                                </p>
                              </div>

                              <button
                                onClick={status.isCooldownActive ? undefined : completeLesson}
                                disabled={status.isCooldownActive}
                                className={`w-full py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all select-none ${status.isCooldownActive 
                                  ? 'bg-amber-100 text-amber-900/60 border-b-2 border-amber-200/50 cursor-not-allowed' 
                                  : 'bg-[#69C496] hover:bg-[#58B383] text-white shadow-lg shadow-[#69C496]/20 cursor-pointer border-b-4 border-[#419E6E] active:border-b-0 active:translate-y-0.5'}`}
                              >
                                {status.isCooldownActive 
                                  ? `⏳ Regenerating (${status.countdownStr} left)` 
                                  : '🌿 Claim Knowledge & Rewards (+10 Coins, +50 XP)'}
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

