import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
function BookIllustration({ bookId }: { bookId: string }) {
  // Render a personalized aesthetic animated scene depending on the book
  switch (bookId) {
    case 'guide-pushups':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={pushupProtocolImg} 
            alt="The Pushups Protocol" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'guide-water':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={hydrationLogicImg} 
            alt="Hydration Logic" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'guide-breathing':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={vagalNerveImg} 
            alt="Vagal Nerve Hacks" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'guide-gratitude':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-rose-400 via-pink-500 to-rose-500 overflow-hidden flex items-center justify-center border border-rose-300 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_70%)]" />
          
          {/* Heart symbols glowing */}
          <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 3.5 }} className="absolute top-8 left-12 text-white/40">
            <Heart size={20} fill="currentColor" />
          </motion.div>
          <motion.div animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }} className="absolute bottom-8 right-12 text-white/30">
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

    case 'guide-drawing':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={creativeSynapseImg} 
            alt="Creative Synapse" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
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

    case 'plant-desert-guide':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={crystalCactusImg} 
            alt="Crystal Cactus" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'research-sleep':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={circadianMasteryImg} 
            alt="Circadian Mastery" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
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

    case 'guide-posture':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={postureProtocolImg} 
            alt="The Posture Protocol" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'research-cold':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={thermalHormesisImg} 
            alt="Thermal Hormesis" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'research-fasting':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={autophagySyncImg} 
            alt="Autophagy Sync" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'plant-mycelium':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={symbioticFungiImg} 
            alt="Symbiotic Fungi" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'guide-binaural':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={binauralBrainwavesImg} 
            alt="Auditory Brainwaves" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'guide-forest':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={forestBathingImg} 
            alt="Phytoncide Bathing" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'guide-saccadic':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={optimalSaccadesImg} 
            alt="Optimal Saccades" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'research-nutrition':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={nootropicNutritionImg} 
            alt="Nootropic Nutrition" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'plant-carnivorous':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={carnivorousPitcherImg} 
            alt="Carnivorous Catch" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'research-neurogenesis':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={neurogenesisSynapseImg} 
            alt="Neurogenesis Synapse" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'app-purpose':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={nexoraGuideImg} 
            alt="Nexora Ecosystem" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'self-care':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={selfCareImg} 
            alt="Self-Care & Balance" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'challenge-practice':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={challengePracticeImg} 
            alt="Challenge Drills" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'shop-upgrades':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={shopBuyingGuideImg} 
            alt="Ecosystem Shop" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'winter-warmth':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={winterDrinksImg} 
            alt="Cozy Winter Fluids" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'immune-water':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={waterImmunityImg} 
            alt="Immunity & Hydration" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'warning-adaptation':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={warningSignsImg} 
            alt="The Stagnation Signs" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'sport-essentials':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={sportNeedsImg} 
            alt="Sport Kinetics & Recovery" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'coffee-counting':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={coffeeTeaIntakeImg} 
            alt="The Hydration Debate" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'heart-hydraulic':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={hydrateHeartImg} 
            alt="Heart Valve Hydraulics" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'cellular-glow':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={healthySkinImg} 
            alt="Dermal Moisture Sync" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'neural-fluid':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={waterBrainImg} 
            alt="The Hydrated Brain" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'active-mom':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={momHealthImg} 
            alt="The Energetic Mom" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'womens-wellness-deep':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={womensWellnessImg} 
            alt="Women's Somatic Wellness" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'pregnant-joy':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={pregnancyHydrationImg} 
            alt="Pregnancy Refreshment" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'period-hydration-deep':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={periodHydrationImg} 
            alt="Cycle Flow Support" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      );

    case 'mens-activities-deep':
      return (
        <div className="relative w-full h-48 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/65 shadow-md group bg-slate-100">
          <img 
            src={challengePracticeImg} 
            alt="Men's Biomechanical Training" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
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
  const [activeLessonStep, setActiveLessonStep] = useState<number>(0);
  const [lessonFinished, setLessonFinished] = useState(false);

  // Playful cozy quotes system inspired by Plant Nanny and cozy gardening games
  const [tipIndex] = useState(() => Math.floor(Math.random() * 5));
  const cozyTips = [
    "💧 Hi friend! Keep going, little sprout! Every drop of daily knowledge makes your habits grow stronger! 🌿",
    "🌱 Water your habits, nurture your mind, and take three deep breaths. You're doing wonderful!",
    "🌸 'To grow a beautiful garden, you must nourish the soil every single day.' Let's read a cozy dossier!",
    "☀️ Did you drink your active water glass today? Let's sip some cool water together while exploring!",
    "🍀 Your healthy botanical habits garden is looking incredibly lush, vibrant, and well-watered today!"
  ];

  // Read books state
  const completedBookIds = useMemo(() => {
    return settings.readBookIds || [];
  }, [settings.readBookIds]);

  // Clean, beautifully organized categories with cozy garden emojis
  const categories = [
    { id: 'all', label: '🌸 All Seeds', icon: Compass },
    { id: 'challenge', label: '💧 Life Habits', icon: Zap },
    { id: 'plant', label: '🌱 Botany Care', icon: Flower },
    { id: 'health', label: '☀️ Sun Wisdom', icon: Sun },
  ];

  // Choosing randomized priority seeds to read/train
  const handleLetTrain = () => {
    const unread = KNOWLEDGE_BOOKS.filter(b => !completedBookIds.includes(b.id));
    const targetBook = unread.length > 0 
      ? unread[Math.floor(Math.random() * unread.length)] 
      : KNOWLEDGE_BOOKS[Math.floor(Math.random() * KNOWLEDGE_BOOKS.length)];

    if (targetBook) {
      triggerReadingSession(targetBook);
    }
  };

  const triggerReadingSession = (book: Book) => {
    setSelectedBook(book);
    setActiveLessonStep(0);
    setLessonFinished(false);
    if (settings.soundEnabled) {
      try { play('select_task'); } catch (e) {}
    }
  };

  // Safe processing of reading completion
  const completeLesson = () => {
    if (!selectedBook) return;

    const isAlreadyRead = completedBookIds.includes(selectedBook.id);
    
    if (!isAlreadyRead) {
      const nextReadBookIds = [...completedBookIds, selectedBook.id];
      onUpdateSettings({
        readBookIds: nextReadBookIds
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

  // Filter book list
  const filteredBooks = useMemo(() => {
    return KNOWLEDGE_BOOKS.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

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
            <h2 className="text-xl font-bold tracking-tight text-[#4F3F34] font-sans">Cozy Garden Library</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-emerald-800 bg-[#E6F4EA] border border-emerald-200 px-3 py-0.5 rounded-full uppercase tracking-wider">
                🌱 Grown: {completedBookIds.length} / {KNOWLEDGE_BOOKS.length} seeds
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
        
        {/* Plant Nanny Inspiration Header & Interactive Mascot Dialog Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6.5 sm:p-8 rounded-[2.8rem] bg-white border-2 border-[#E9E4D4] shadow-[0_8px_30px_rgba(100,80,60,0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#E7F5ED] rounded-full blur-3xl -mr-16 -mt-16 opacity-70" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
              {/* Cute cozy companion avatar */}
              <div className="w-18 h-18 bg-[#FFF9EE] border-2 border-[#FBDCA3] rounded-3xl flex items-center justify-center p-2 shadow-sm shrink-0">
                <Mascot mood="happy" className="w-full h-full" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Botanical Caretip
                </div>
                <h1 className="text-2xl font-extrabold text-[#4F3F34] leading-tight">
                  Water Your Habits Today!
                </h1>
                <p className="text-[#7D6B58] text-sm max-w-xl leading-relaxed">
                  {cozyTips[tipIndex]}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="shrink-0 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleLetTrain}
                className="w-full md:w-auto px-7 py-4 bg-[#69C496] hover:bg-[#58B383] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-[0_6px_18px_rgba(105,196,150,0.3)] cursor-pointer border-b-4 border-[#419E6E] active:border-b-0 active:translate-y-1 transition-all"
              >
                🌱 Open Random Seed
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search & Organization Section: Clean, cozy, and highly organized */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4.5 rounded-[2.2rem] border-2 border-[#E9E4D4] shadow-[0_6px_22px_rgba(100,80,60,0.03)] relative z-20">
          {/* Cozy Search Tool */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8975] w-4.5 h-4.5 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search botanical seeds, habits, care tips..."
              className="w-full bg-[#FAF7F2] text-[#4F3F34] pl-11 pr-4 py-3 rounded-2xl border-2 border-[#E9E4D4] focus:outline-none focus:border-[#69C496] focus:bg-white font-medium text-xs placeholder-[#9A8975]/60 transition-all"
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

          {/* Plant Nanny-style Cozy Tabs Selection */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar pt-2 md:pt-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    if (settings.soundEnabled) {
                      try { play('click'); } catch (e) {}
                    }
                  }}
                  className={`px-4.5 py-3 rounded-2xl border-2 text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#69C496] text-white border-[#58B383] shadow-md shadow-[#69C496]/20' 
                      : 'bg-white text-[#7D6B58] border-[#E9E4D4] hover:bg-[#FAF7F2] hover:border-[#D6CDBC]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seeds Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-[#9A8975] uppercase tracking-wider">
              🌿 Greenhouse Seeds Inventory ({filteredBooks.length})
            </h3>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-[#E9E4D4] p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <Flower className="w-8 h-8" />
              </div>
              <p className="font-extrabold text-[#7D6B58] text-sm uppercase tracking-wide">No habit seeds found in this garden zone</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                className="text-[10px] text-emerald-800 bg-[#E6F4EA] font-bold uppercase tracking-wider border border-emerald-200 px-4.5 py-2.5 rounded-xl transition-all hover:bg-emerald-100"
              >
                Clear Filters & Search
              </button>
            </div>
          ) : (
            /* Redesigned grid of dossiers modeled exactly like beautiful botanical cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const bookIsDone = completedBookIds.includes(book.id);
                const isChallenge = book.category === 'challenge';
                const isPlant = book.category === 'plant';
                
                return (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => triggerReadingSession(book)}
                    className="group bg-white rounded-[2.2rem] border-2 border-[#E9E4D4] hover:border-[#69C496] p-4.5 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(100,80,60,0.06)] flex flex-col gap-4.5 cursor-pointer relative"
                  >
                    {/* Visual Vector Cover Header containing preloaded cartoon illustrations */}
                    <div className="rounded-2xl overflow-hidden relative shadow-sm h-48 bg-[#FAF7F2] flex items-center justify-center">
                      <BookIllustration bookId={book.id} />
                      
                      {/* Interactive Watering Can Overlay Indicator */}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full border border-[#E9E4D4] flex items-center gap-1.5 shadow-sm">
                        <span className="text-[10px] font-bold text-[#4F3F34]">
                          {isChallenge ? '💧 Habit Seed' : isPlant ? '🌱 Plant Pet' : '☀️ Sun Secret'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Detail Section */}
                    <div className="space-y-3 flex-1 px-1">
                      <div className="flex items-center justify-between">
                        {bookIsDone ? (
                          <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] border border-[#A5D6A7] px-3 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Fully Grown
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Needs Watering
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

                    {/* Plant Nanny Moisture Tracking Progress Bar */}
                    <div className="bg-[#FAF7F2] border-t-2 border-[#E9E4D4]/60 pt-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#9A8975] uppercase px-1">
                        <span>Hydration Progress</span>
                        <span className={bookIsDone ? 'text-emerald-700' : 'text-amber-700'}>
                          {bookIsDone ? '100% Watered' : '0% Dry Seed'}
                        </span>
                      </div>
                      
                      {/* Double border-rounded bar */}
                      <div className="h-4 bg-amber-100/30 rounded-full border-2 border-[#E9E4D4] overflow-hidden p-[2px]">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            bookIsDone ? 'bg-gradient-to-r from-[#69C496] to-[#58B383]' : 'bg-[#E9E4D4]'
                          }`}
                          style={{ width: bookIsDone ? '100%' : '10%' }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 px-1 text-[10px] font-bold text-[#9A8975] uppercase">
                      <span>{isChallenge ? '#HealthSprout' : isPlant ? '#CozyBotany' : '#SunShine'}</span>
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

        {/* Footer trademark core - made wholesome */}
        <p className="text-center text-[10px] text-[#9A8975] font-extrabold uppercase tracking-widest pt-12">
          🌸 Nexora Botanical Oasis • Drink Water & Stay Happy! 🌸
        </p>

      </div>

      {/* COZY opened BOOK SHELF DIALOG WORKSPACE (Fades, clean card structures, beautiful Serif reading fonts) */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col justify-between overflow-hidden"
          >
            {/* Opened Book Top Navigation */}
            <div className="bg-[#FAF7F2] border-b-2 border-[#E9E4D4] px-6 py-4.5 flex items-center justify-between gap-6">
              <button 
                onClick={() => setSelectedBook(null)}
                className="p-3 hover:bg-[#FAF7F2]/90 rounded-2xl text-[#4F3F34] border-2 border-[#E9E4D4] shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Plant Growth Water Progress Indicator */}
              <div className="flex-1 flex gap-2">
                {selectedBook.content.sections.map((_, idx) => {
                  const isActive = idx === activeLessonStep;
                  const isCompleted = idx < activeLessonStep;
                  return (
                    <div 
                      key={idx} 
                      className="h-3.5 flex-1 bg-white rounded-full overflow-hidden border-2 border-[#E9E4D4] p-0.5"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : isActive ? '60%' : '0%' }}
                        className="h-full bg-gradient-to-r from-[#69C496] to-[#58B383] rounded-full"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Water Levels Met */}
              <span className="text-[11px] font-bold text-[#7D6B58] uppercase">
                Watering: {activeLessonStep + 1} / {selectedBook.content.sections.length}
              </span>
            </div>

            {/* Book Body: Paper-colored reading view with handwritten-style clean layout */}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-center items-center">
              <div className="max-w-2xl w-full">
                
                {lessonFinished ? (
                  /* Super Cute Confetti & Grown Celebration state */
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8 py-6"
                  >
                    {/* Cute Mascot Jumping for Joy */}
                    <div className="relative inline-block w-40 h-40">
                      <div className="absolute inset-0 bg-[#E7F5ED] rounded-full blur-2xl opacity-60 scale-125" />
                      <div className="w-full h-full bg-white rounded-[2.5rem] border-2 border-[#E9E4D4] shadow-sm p-4 relative z-10 flex items-center justify-center">
                        <Mascot mood="happy" className="w-full h-full transform hover:scale-105 transition-transform" />
                      </div>
                      
                      {/* Floating floral and water emojis */}
                      <span className="absolute -top-3 -right-3 text-2xl animate-bounce">💧</span>
                      <span className="absolute -bottom-2 -left-3 text-2xl animate-pulse">🌸</span>
                      <span className="absolute top-1/2 -left-6 text-xl">🌟</span>
                    </div>

                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#A5D6A7]">
                        🌿 HYDRATION INTAKE COMPLETELY GROWING!
                      </span>
                      <h2 className="text-3xl font-extrabold text-[#4F3F34] tracking-tight">
                        Seed Fully Watered!
                      </h2>
                      <p className="text-sm font-medium text-[#7D6B58] max-w-sm mx-auto leading-relaxed">
                        Splendid! You have successfully watered the <span className="text-[#69C496] font-bold">{selectedBook.title}</span> habit seed!
                      </p>
                    </div>

                    {/* Rewards Grid Styled clean and cozy */}
                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                      <div className="bg-white border-2 border-[#E9E4D4] p-4.5 rounded-[1.8rem] flex flex-col items-center shadow-sm">
                        <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Tokens Awarded
                        </span>
                        <span className="text-lg font-bold text-[#4F3F34] mt-2">
                          +10 🪙
                        </span>
                      </div>
                      <div className="bg-white border-2 border-[#E9E4D4] p-4.5 rounded-[1.8rem] flex flex-col items-center shadow-sm">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Botanical XP
                        </span>
                        <span className="text-lg font-bold text-[#4F3F34] mt-2">
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
                        <p className="text-[9px] font-bold text-[#9A8975] uppercase tracking-wider leading-none">Sprout Seed Advisor</p>
                        <p className="text-xs text-[#7D6B58] font-semibold mt-1.5 leading-relaxed">
                          "Fantastic! That water seed went deep down into your mind roots! Drink another cup for extra happiness, friend!"
                        </p>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  /* Reading Book Frame */
                  <div className="space-y-6 w-full">
                    
                    {/* Plant Nanny Advice Balloon */}
                    <div className="flex flex-col sm:flex-row gap-4.5 items-center sm:items-start bg-[#E8F5E9] border-2 border-[#C8E6C9] rounded-[2.2rem] p-5.5 shadow-sm relative overflow-hidden w-full">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-6 -mt-6 pointer-events-none" />
                      
                      {/* Active Mascot guide */}
                      <div className="w-16 h-16 bg-white rounded-2xl border-2 border-emerald-100 flex items-center justify-center p-2 shrink-0 shadow-sm">
                        <Mascot 
                          mood={activeLessonStep === 0 ? "happy" : activeLessonStep === 1 ? "surprised" : "happy"} 
                          className="w-full h-full" 
                        />
                      </div>
                      
                      <div className="space-y-0.5 relative z-10 flex-1 text-center sm:text-left">
                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Garden Greenhouse Companion</p>
                        <h4 className="text-base font-extrabold text-[#4F3F34] leading-tight">
                          {activeLessonStep === 0 
                            ? "Nurturing the mental roots..." 
                            : activeLessonStep === 1 
                              ? "Look at those leaves growing!" 
                              : "Beautiful habit maturity!"}
                        </h4>
                        <p className="text-xs text-[#7D6B58] font-medium leading-relaxed">
                          Let's explore this beautiful wisdom page, cozy comrade!
                        </p>
                      </div>
                    </div>

                    {/* Paper Book Reading Content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeLessonStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-[2.5rem] border-2 border-[#E9E4D4] p-8 space-y-6 shadow-[0_8px_30px_rgba(100,80,60,0.03)]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-[#69C496] rounded-full" />
                          <h3 className="text-xl font-extrabold text-[#4F3F34] uppercase tracking-tight">
                            {selectedBook.content.sections[activeLessonStep]?.heading}
                          </h3>
                        </div>
                        
                        {/* Cozy custom font paragraph */}
                        <p className="text-sm sm:text-base text-[#4F3F34] font-medium leading-relaxed whitespace-pre-line font-serif pt-1">
                          {selectedBook.content.sections[activeLessonStep]?.text}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                  </div>
                )}

              </div>
            </div>

            {/* Bottom Book Controls: Bubbly cute rounded controls */}
            <div className="bg-[#FAF7F2] border-t-2 border-[#E9E4D4] px-6 py-5 flex items-center justify-center">
              <div className="max-w-md w-full">
                {lessonFinished ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedBook(null);
                      if (settings.soundEnabled) {
                        try { play('click'); } catch (e) {}
                      }
                    }}
                    className="w-full bg-[#69C496] hover:bg-[#58B383] text-white py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#69C496]/25 cursor-pointer text-center border-b-4 border-[#419E6E] active:border-b-0 active:translate-y-0.5 transition-all"
                  >
                    Finish Watering & Close Seed
                  </motion.button>
                ) : (
                  <div className="flex gap-4">
                    {activeLessonStep > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveLessonStep(prev => prev - 1);
                          if (settings.soundEnabled) {
                            try { play('click'); } catch (e) {}
                          }
                        }}
                        className="bg-white hover:bg-[#FAF7F2] text-[#7D6B58] py-4 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider border-2 border-[#E9E4D4] transition-all cursor-pointer shadow-sm"
                      >
                        Previous Page
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const nextStep = activeLessonStep + 1;
                        if (nextStep < selectedBook.content.sections.length) {
                          setActiveLessonStep(nextStep);
                          if (settings.soundEnabled) {
                            try { play('click'); } catch (e) {}
                          }
                        } else {
                          completeLesson();
                        }
                      }}
                      className="flex-1 bg-[#69C496] hover:bg-[#58B383] text-white py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md shadow-[#69C496]/20 cursor-pointer text-center border-b-4 border-[#419E6E] active:border-b-0 active:translate-y-0.5 transition-all"
                    >
                      {activeLessonStep + 1 === selectedBook.content.sections.length ? 'Nourish Seed' : 'Next Page'}
                    </motion.button>
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
