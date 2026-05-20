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
  Volume2
} from 'lucide-react';
import { KNOWLEDGE_BOOKS, Book } from '../constants/library';
import { UserStats, UserSettings } from '../types';
import { Mascot } from './Mascot';

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
  BookOpen: BookIcon
};

// Beautiful native vector illustrations for book covers – high quality, animated, and no watermarks!
function BookIllustration({ bookId }: { bookId: string }) {
  // Render a personalized aesthetic animated scene depending on the book
  switch (bookId) {
    case 'guide-pushups':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 overflow-hidden flex items-center justify-center border border-indigo-900/50 shadow-inner group">
          {/* Neon Grid Gridline Backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
          
          <div className="absolute bottom-2 inset-x-0 flex justify-center">
            {/* Ground mat */}
            <div className="w-4/5 h-1.5 bg-blue-800/40 rounded-full blur-[1px]" />
          </div>

          {/* Athletic Bald Man doing pushups vector */}
          <svg viewBox="0 0 300 150" className="w-44 h-24 relative z-10">
            {/* Vector athlete */}
            <g className="origin-bottom-left transition-transform duration-1000">
              {/* Dynamic pushup animation */}
              <motion.g
                animate={{ 
                  y: [0, 16, 0],
                  rotate: [0, -3, 0]
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                {/* Floor mat */}
                <rect x="20" y="115" width="260" height="4" rx="2" fill="#2563eb" opacity="0.3" />
                
                {/* Arm bending */}
                <path d="M 125,115 L 120,95 L 115,80" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                
                {/* Head (Bald Man) */}
                <circle cx="108" cy="62" r="10" fill="#fda4af" />
                {/* Head contour */}
                <circle cx="105" cy="59" r="8" fill="#fecdd3" opacity="0.9" />
                
                {/* Torso & Legs alignment */}
                <path d="M 115,80 L 195,90 L 255,105" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" fill="none" />
                <path d="M 115,80 L 195,90 L 255,105" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" fill="none" />
                
                {/* Training shirt sleeve */}
                <path d="M 115,80 L 145,84" stroke="#000" strokeWidth="14" strokeLinecap="round" opacity="0.15" />
                
                {/* Training Shorts */}
                <path d="M 185,88 L 210,92" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" />
                {/* Training Shorts details */}
                <path d="M 188,88 L 205,92" stroke="#60a5fa" strokeWidth="10" strokeLinecap="round" />
                
                {/* Back Foot support */}
                <path d="M 255,105 L 260,115" stroke="#fecdd3" strokeWidth="6" strokeLinecap="round" fill="none" />
              </motion.g>
            </g>
          </svg>

          {/* Muscle force ring indicators */}
          <motion.div 
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-dashed border-blue-400/20" 
          />
        </div>
      );

    case 'guide-water':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-600 overflow-hidden flex items-center justify-center border border-sky-300 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_60%)]" />
          
          {/* Abstract bubbles */}
          <motion.div animate={{ y: [-10, -80], opacity: [0, 0.4, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 0.5 }} className="absolute bottom-4 left-10 w-3 h-3 rounded-full bg-white/40" />
          <motion.div animate={{ y: [-10, -90], opacity: [0, 0.5, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 2 }} className="absolute bottom-6 right-16 w-2 h-2 rounded-full bg-white/50" />
          <motion.div animate={{ y: [-15, -70], opacity: [0, 0.3, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} className="absolute bottom-2 left-1/2 w-1.5 h-1.5 rounded-full bg-white/30" />

          {/* Girl drinking water illustration */}
          <svg viewBox="0 0 200 150" className="w-36 h-28 relative z-10">
            {/* Hair ponytail */}
            <path d="M 72,55 C 60,30 35,45 28,65 C 22,80 30,100 45,95 C 40,88 41,75 52,68 C 55,65 60,65 72,55" fill="#1e293b" />
            
            {/* Head and Neck */}
            <path d="M 85,95 L 85,115 L 98,115 L 95,95 Z" fill="#ffd4c4" />
            <circle cx="85" cy="70" r="22" fill="#ffd4c4" />
            
            {/* Ear */}
            <ellipse cx="68" cy="73" r="5" ry="6" fill="#fca5a5" />
            
            {/* Closed eye */}
            <path d="M 84,68 Q 90,71 96,68" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
            
            {/* Blue training shirt */}
            <path d="M 50,118 C 50,110 65,112 85,114 C 105,112 120,110 120,118 L 120,150 L 50,150 Z" fill="#3b82f6" />
            
            {/* Glass Cup with floating dynamic water */}
            <g className="origin-bottom-left">
              <motion.g
                animate={{ rotate: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                {/* Drinking glass casing */}
                <path d="M 103,73 L 118,93" stroke="#fff" strokeWidth="24" strokeLinecap="round" opacity="0.4" />
                {/* Water line inside */}
                <path d="M 105,75 L 115,88" stroke="#0ea5e9" strokeWidth="18" strokeLinecap="round" />
                
                {/* Hand holding glass */}
                <path d="M 125,95 C 130,90 125,75 110,85" stroke="#ffd4c4" strokeWidth="6" strokeLinecap="round" fill="none" />
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'guide-breathing':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-violet-500 via-indigo-500 to-indigo-700 overflow-hidden flex items-center justify-center border border-indigo-400 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_10%,transparent_80%)]" />
          
          {/* Smooth expanding respiratory resonance feedback rings */}
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
            className="absolute w-28 h-28 rounded-full border-2 border-white/20 flex items-center justify-center"
          />
          <motion.div 
            animate={{ scale: [1, 1.7, 1], opacity: [0.2, 0, 0.2] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} 
            className="absolute w-36 h-36 rounded-full border border-white/10"
          />

          {/* Floating musical notes and sound cues */}
          <motion.div animate={{ y: [0, -15, 0], x:[0, 5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5 }} className="absolute top-12 left-12 text-indigo-200 opacity-60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </motion.div>
          
          <motion.div animate={{ y: [0, 15, 0], x:[0, -5, 0] }} transition={{ repeat: Infinity, duration: 3.5 }} className="absolute bottom-12 right-12 text-white/50 opacity-40 text-xs font-mono select-none">
            ♫ 5.5s
          </motion.div>

          {/* Soothing Vagal response silhouette face & soothing hand on neck */}
          <svg viewBox="0 0 200 150" className="w-36 h-28 relative z-10">
            {/* Face outline (woman with purple/pink hair) */}
            <path d="M 50,150 C 45,100 60,35 110,35 C 150,35 155,75 145,95 C 135,115 118,125 108,135 L 105,150 Z" fill="#71717a" opacity="0.1" />
            
            {/* Gorgeous colorful hair overlay with absolute high performance */}
            <path d="M 60,150 C 52,110 55,50 100,45 C 145,40 160,80 150,110 C 140,140 120,150 108,150 Z" fill="url(#purple-hair)" />
            
            {/* Beautiful gradient definitions */}
            <defs>
              <linearGradient id="purple-hair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d946ef" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* Glowing neck nerves vagus pathways */}
            <path d="M 98,90 Q 94,103 91,120" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" fill="none" className="animate-pulse" />
            <path d="M 103,94 Q 100,108 98,124" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" fill="none" className="animate-pulse" />
            
            {/* Eyes closed peacefully */}
            <path d="M 120,70 Q 126,73 132,70" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            
            {/* Soothing Blue / Cyan hand gently touching neck */}
            <motion.path 
              animate={{ y: [0, 2, 0], scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              d="M 130,115 C 110,105 85,95 88,85 C 90,80 95,85 105,95 C 110,100 120,105 130,115 Z" 
              fill="#22d3ee" 
              opacity="0.85" 
            />
          </svg>
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
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 overflow-hidden flex items-center justify-center border border-orange-300 shadow-inner group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.4),transparent_60%)]" />
          
          {/* Floating light splatters in warm tones */}
          <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.9, 0.5] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-6 right-20 w-3 h-3 rounded-full bg-yellow-200" />
          <motion.div animate={{ scale: [1.1, 0.7, 1.1], opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }} className="absolute bottom-10 left-10 w-4 h-4 rounded-full bg-amber-200" />

          {/* Artist girl drawing on easel scene */}
          <svg viewBox="0 0 200 150" className="w-40 h-32 relative z-10">
            {/* Background window */}
            <rect x="130" y="10" width="50" height="70" rx="6" fill="#bfdbfe" opacity="0.4" stroke="#fff" strokeWidth="2" />
            <line x1="155" y1="10" x2="155" y2="80" stroke="#fff" strokeWidth="1.5" />
            <line x1="130" y1="45" x2="180" y2="45" stroke="#fff" strokeWidth="1.5" />

            {/* Easel stand */}
            <path d="M 50,130 L 70,30 L 90,130 M 70,30 L 70,140" stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Canvas */}
            <rect x="40" y="45" width="50" height="60" rx="3" fill="#fff" stroke="#1e293b" strokeWidth="3" />
            {/* Outline of portrait on canvas */}
            <circle cx="65" cy="70" r="14" fill="#fed7aa" opacity="0.6" />
            <path d="M 55,75 Q 65,80 75,75" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Anime Artist girl painting layout */}
            <g>
              {/* Back Hair ponytail */}
              <circle cx="106" cy="66" r="15" fill="#111827" />
              
              {/* Head & neck */}
              <circle cx="112" cy="75" r="12" fill="#ffd4c4" />
              
              {/* Apron */}
              <path d="M 103,115 C 103,98 123,98 123,115 L 123,150 L 103,150 Z" fill="#065f46" stroke="#111827" strokeWidth="2.5" />
              
              {/* Arm reaching out with brush */}
              <motion.path 
                animate={{ rotate: [-2, 3, -2], x: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                d="M 100,103 L 80,95 L 68,96 L 75,102" 
                stroke="#ffd4c4" 
                strokeWidth="7" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none" 
              />
              
              {/* Stylus holder line */}
              <line x1="68" y1="96" x2="57" y2="84" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
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
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-amber-200 via-orange-300 to-rose-400 overflow-hidden flex items-center justify-center border border-orange-300 shadow-inner group">
          <div className="absolute top-6 left-12 w-14 h-14 rounded-full bg-yellow-100 opacity-40 blur-md" />
          
          {/* Shimmering desert ambient waves */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-orange-400/30 to-transparent" />

          {/* Majestic round succulent cactus with massive pink lotus blossom on top */}
          <svg viewBox="0 0 200 150" className="w-36 h-28 relative z-10">
            {/* Ground Soil sand */}
            <ellipse cx="100" cy="115" rx="55" ry="12" fill="#ea580c" opacity="0.4" />
            
            {/* Round spherical cactus */}
            <circle cx="100" cy="74" r="32" fill="#059669" stroke="#1e293b" strokeWidth="4.5" />
            
            {/* Visual Ribs vertical curves */}
            <path d="M 82,54 Q 100,48 118,54" stroke="#047857" strokeWidth="4.5" fill="none" opacity="0.5" />
            <path d="M 82,94 Q 100,100 118,94" stroke="#047857" strokeWidth="4.5" fill="none" opacity="0.5" />
            <path d="M 100,42 L 100,106" stroke="#047857" strokeWidth="4.5" fill="none" opacity="0.6" />
            <path d="M 78,74 Q 100,74 122,74" stroke="#047857" strokeWidth="4.5" fill="none" opacity="0.5" />

            {/* Spike indicators (defensive needles) */}
            <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
              {/* Spikes all around boundary */}
              <line x1="68" y1="74" x2="58" y2="74" />
              <line x1="132" y1="74" x2="142" y2="74" />
              <line x1="78" y1="52" x2="70" y2="44" />
              <line x1="122" y1="52" x2="130" y2="44" />
              <line x1="78" y1="96" x2="70" y2="104" />
              <line x1="122" y1="96" x2="130" y2="104" />
              <line x1="100" y1="42" x2="100" y2="34" />
            </g>

            {/* Glowing neon pink lotus blossom blooming perfectly on top of cactus */}
            <g className="origin-bottom">
              <motion.g
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                {/* Back petals */}
                <path d="M 80,44 C 80,24 100,10 100,44 Z" fill="#ec4899" stroke="#1e293b" strokeWidth="3" />
                <path d="M 120,44 C 120,24 100,10 100,44 Z" fill="#ec4899" stroke="#1e293b" strokeWidth="3" />
                
                {/* Mid petals */}
                <path d="M 90,44 C 75,20 100,4 100,44 Z" fill="#f43f5e" stroke="#1e293b" strokeWidth="3" />
                <path d="M 110,44 C 125,20 100,4 100,44 Z" fill="#f43f5e" stroke="#1e293b" strokeWidth="3" />
                
                {/* Central lotus heart */}
                <circle cx="100" cy="38" r="5" fill="#eab308" />
              </motion.g>
            </g>
          </svg>
        </div>
      );

    case 'research-sleep':
      return (
        <div className="relative w-full h-48 rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
          {/* Dual-themed split sun & moon backdrop clock dials */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-orange-500/10 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:12px_12px]" />

          {/* Celestial dial spinning slowly */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }} 
            className="absolute w-36 h-36 rounded-full border border-dashed border-white/5 flex items-center justify-center opacity-60"
          />

          {/* Left shows woman sleeping peacefully on soft pillow under star-lit moon; 
              Right shows her meditating in front of giant radiant sun and sleep-cycle clock */}
          <svg viewBox="0 0 200 150" className="w-44 h-32 relative z-10">
            {/* Split boundary Line (harmonic curve) */}
            <path d="M 100,0 C 95,50 105,100 100,150" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />

            {/* Left Zone: Sleeping peaceful female */}
            <g transform="translate(-5, 0)">
              {/* Crescent Moon */}
              <path d="M 30,22 C 30,42 45,46 50,44 C 40,42 36,32 40,22 Z" fill="#fbbf24" opacity="0.85" />
              {/* Pillow */}
              <ellipse cx="44" cy="98" rx="20" ry="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
              {/* Sleep Head on pillow */}
              <circle cx="44" cy="85" r="14" fill="#fed7aa" stroke="#1e293b" strokeWidth="2" />
              <path d="M 32,85 C 32,70 56,70 56,85 Z" fill="#3b82f6" /> {/* Sleep mask */}
              {/* Peaceful breath indicator */}
              <motion.circle 
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.7, 0.2] }}
                transition={{ repeat: Infinity, duration: 4 }}
                cx="58" cy="85" r="3" fill="#60a5fa" 
              />
            </g>

            {/* Right Zone: Meditating in lotus posture */}
            <g transform="translate(10, 0)">
              {/* Giant radiating Sun / Clock dial */}
              <circle cx="150" cy="40" r="18" fill="#eab308" opacity="0.2" />
              <circle cx="150" cy="40" r="14" fill="#eab308" opacity="0.6" stroke="#eab308" strokeWidth="2.5" />
              {/* Clock pointer */}
              <line x1="150" y1="40" x2="150" y2="30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
              <line x1="150" y1="40" x2="158" y2="40" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />

              {/* Meditating figure in front */}
              <g transform="translate(125, 68)">
                {/* Torso Zen lotus pose */}
                <path d="M 25,25 L 12,45 L 38,45 Z" fill="#10b981" stroke="#1e293b" strokeWidth="2" />
                {/* Meditating Head */}
                <circle cx="25" cy="14" r="8" fill="#fed7aa" stroke="#1e293b" strokeWidth="2" />
                <path d="M 18,14 Q 25,6 32,14 Z" fill="#f43f5e" /> {/* Hair bun */}
                
                {/* Left/Right raised hands */}
                <circle cx="8" cy="38" r="3" fill="#fed7aa" />
                <circle cx="42" cy="38" r="3" fill="#fed7aa" />
              </g>
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

  // Read books state
  const completedBookIds = useMemo(() => {
    return settings.readBookIds || [];
  }, [settings.readBookIds]);

  // Categories helper
  const categories = [
    { id: 'all', label: 'All Zones', icon: Compass },
    { id: 'challenge', label: 'Protocols', icon: Zap },
    { id: 'plant', label: 'Botany', icon: Flower },
    { id: 'health', label: 'Bio-Hacks', icon: Sun },
  ];

  // Random tip or training book
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

  // Complete current reading session
  const completeLesson = () => {
    if (!selectedBook) return;

    const isAlreadyRead = completedBookIds.includes(selectedBook.id);
    
    // Build update payload
    if (!isAlreadyRead) {
      const nextReadBookIds = [...completedBookIds, selectedBook.id];
      onUpdateSettings({
        readBookIds: nextReadBookIds
      });

      // Award +50 XP and +10 Coins!
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-x-hidden selection:bg-blue-500/20 pb-24">
      
      {/* Dynamic Warm Ambient Glows layered exactly like the Subscription page but adapted to light bright high contrast */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[100vw] h-[100vw] rounded-full bg-gradient-to-br from-sky-200/20 via-blue-100/5 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[100vw] h-[100vw] rounded-full bg-gradient-to-tl from-emerald-100/25 via-teal-50/10 to-transparent blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.015] mix-blend-overlay" />
      </div>

      {/* Sticky High-contrast Professional Navigation Header */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-md px-6 py-5 border-b border-slate-200/60 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-sm border border-slate-200/80 text-slate-705 group cursor-pointer transition-all"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
          </motion.button>
          
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-none uppercase tracking-wide">Nexus wisdom core</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Readiness: {completedBookIds.length} / {KNOWLEDGE_BOOKS.length} Dossiers
              </span>
            </div>
          </div>
        </div>

        {/* Currency Stat */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-xs font-black text-amber-800">🪙 {stats.coins || 0}</span>
        </div>
      </div>

      {/* Spacious layouts tailored exactly to match the aesthetic of the SubscriptionScreen */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* Banner Hero block - restructured to match subscription transparency block style */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-[3.5rem] bg-gradient-to-br from-blue-500/5 via-blue-600/5 to-transparent border border-blue-200/60 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-16 bg-blue-400/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200/30">
                <Sparkles size={11} className="text-blue-500" /> COGNITIVE DOCKET
              </div>
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tight text-slate-900 leading-tight uppercase">
                INTEGRITY RESYNC LORE
              </h1>
              <p className="text-slate-500 text-sm max-w-xl leading-relaxed font-medium">
                Welcome to the Nexus archives. Review your active neural files, master physiological hacks, and synchronize technical data. Completing cognitive updates awards elite performance credentials and coins.
              </p>
              
              {/* Sleek inline badges showing structure and no Duolingo noise */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
                {[
                  { icon: <Zap size={14} className="text-blue-600" />, text: 'Task Mechanics' },
                  { icon: <Flower size={14} className="text-emerald-600" />, text: 'Flora Analytics' },
                  { icon: <Sun size={14} className="text-amber-600" />, text: 'Circadian Balance' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-tight bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/30">
                    <div className="p-1 bg-white rounded-md shadow-sm border border-slate-100">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA action button styled cleanly without cartoon chunky aspects */}
            <div className="w-full md:w-auto flex flex-col items-center gap-3 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLetTrain}
                className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-blue-500/25 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/35 transition-all"
              >
                Inquire Unprocessed Dossier
              </motion.button>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                Selects prioritized unread file
              </span>
            </div>
          </div>
        </motion.div>

        {/* Search controls - clean modern glass look */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-slate-200/60 shadow-sm relative z-20">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files, bio-hacks or flora..."
              className="w-full bg-white text-slate-800 pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 focus:outline-none focus:border-blue-500 font-semibold text-xs placeholder-slate-400 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-150 hover:bg-slate-200 text-slate-500 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sliding Category filter nodes */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Redesigned grid of dossiers modeled exactly like the clean stacked cards format of Subscription page */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              Synchronizable Dossier Registry ({filteredBooks.length})
            </h3>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[3rem] border border-slate-200 p-8 space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="font-extrabold text-slate-600 text-sm uppercase tracking-wide">No lore elements match the query</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                className="text-[9px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl border border-blue-100 transition-all"
              >
                Flush Search Criteria
              </button>
            </div>
          ) : (
            /* GRID: Styled like SubscriptionScreen cards - stacked look, beautiful shadows, responsive padding */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const bookIsDone = completedBookIds.includes(book.id);
                return (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => triggerReadingSession(book)}
                    className="group bg-white rounded-[2.5rem] border border-slate-200 hover:border-blue-400 p-5 transition-all hover:shadow-xl hover:shadow-slate-100 flex flex-col gap-5 cursor-pointer relative"
                  >
                    {/* Visual Vector Cover Header containing custom-drawn high quality illustration */}
                    <BookIllustration bookId={book.id} />

                    {/* Meta Section */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-black text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-150/40 px-2.5 py-1 rounded-full">
                          {book.category === 'challenge' ? 'Task Protocol' : book.category === 'plant' ? 'Greenhouse Flora' : 'System BioResearch'}
                        </span>

                        {bookIsDone ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-black text-[8.5px] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                            <Check className="w-3 h-3 stroke-[3]" /> Integrated
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-blue-700 font-black text-[8.5px] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full uppercase">
                            <Clock className="w-3 h-3" /> Sync Ready
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2">
                          {book.description}
                        </p>
                      </div>
                    </div>

                    {/* Launch footer and card separation line */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 text-[9px] font-black uppercase tracking-wider">
                      <span className="text-slate-400">
                        {book.category === 'challenge' 
                          ? '#TaskScience' 
                          : book.category === 'plant' 
                            ? '#BotanyMaturity' 
                            : '#BioArchitecture'}
                      </span>
                      
                      <span className="text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Verify dossier <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer trademark core */}
        <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] pt-12">
          Nexora Discipline Engineering Lab • Memory Core Authorized
        </p>

      </div>

      {/* LUXURIOUS GLASS-MORPHIC FULL-SCREEN LESSON DRAWER (Clean, high-tech, responsive, replaces cartoony Duolingo styles) */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="fixed inset-0 z-50 bg-[#f8fbff] flex flex-col justify-between overflow-hidden"
          >
            {/* Modal Header: High frequency progress tracker */}
            <div className="bg-white/90 border-b border-slate-200/60 px-6 py-5 flex items-center justify-between gap-6 backdrop-blur-md">
              <button 
                onClick={() => setSelectedBook(null)}
                className="p-3 hover:bg-slate-100 rounded-2xl text-slate-500 border border-slate-200/50 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Sophisticated status metric bars */}
              <div className="flex-1 flex gap-2.5">
                {selectedBook.content.sections.map((_, idx) => {
                  const isActive = idx === activeLessonStep;
                  const isCompleted = idx < activeLessonStep;
                  return (
                    <div 
                      key={idx} 
                      className="h-2 flex-1 bg-slate-100/85 rounded-full overflow-hidden border border-slate-200/50 p-0"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : isActive ? '60%' : '0%' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.25)]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Core Index code */}
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Nodes: {activeLessonStep + 1} / {selectedBook.content.sections.length}
              </span>
            </div>

            {/* Modal Body: Active chapter text and beautifully integrated Companion Mascot */}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-center items-center">
              <div className="max-w-2xl w-full space-y-8">
                
                {lessonFinished ? (
                  /* Elegant Synchronized celebration status card */
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8"
                  >
                    {/* Genuine Companion Mascot reacting happily to synchronization */}
                    <div className="relative inline-block w-36 h-36">
                      <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-15 scale-125 animate-pulse" />
                      <div className="w-full h-full bg-white rounded-[2.5rem] border border-slate-200/80 shadow-md p-3 relative z-10">
                        <Mascot mood="happy" theme="sunset" className="w-full h-full" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-200/30">
                        <Check size={10} className="stroke-[3]" /> SYNCHRONIZATION COMPLETE
                      </span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        Dossier Integrated
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto leading-relaxed">
                        Excellent work, comrade. You have successfully processed and stored the structural files from <span className="text-blue-600 font-extrabold">{selectedBook.title}</span>.
                      </p>
                    </div>

                    {/* Rewards - displayed cleanly like in the Subscription compare module */}
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col items-center shadow-sm">
                        <span className="bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-wider border border-amber-200/30">
                          Tokens Awarded
                        </span>
                        <span className="text-xl font-black text-slate-900 mt-2.5">
                          +10 🪙
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col items-center shadow-sm">
                        <span className="bg-blue-500/10 text-blue-700 px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-wider border border-blue-200/30">
                          Neural XP synced
                        </span>
                        <span className="text-xl font-black text-slate-900 mt-2.5">
                          +50 ✨
                        </span>
                      </div>
                    </div>

                    {/* Companion advice node replacing robotic text logs */}
                    <div className="bg-slate-50 border border-slate-200/70 rounded-3xl p-5 flex gap-4 items-center justify-start text-left max-w-md mx-auto">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shrink-0 shadow-sm p-1">
                        <Mascot mood="happy" className="w-full h-full" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Companion Advice</p>
                        <p className="text-xs text-slate-600 font-semibold mt-1.5 leading-relaxed">
                          "Fabulous job, brother! Your cognitive database is expanding. Let's maintain this momentum."
                        </p>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  /* Core chapter details */
                  <div className="space-y-8 w-full">
                    
                    {/* Integrated Companion Mascot Guide Speech bubble */}
                    <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start bg-blue-500/5 border border-blue-200/50 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden w-full">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                      
                      {/* Live Companion Mascot widget */}
                      <div className="w-20 h-20 bg-white rounded-[2rem] border border-blue-100 flex items-center justify-center p-2.5 shrink-0 shadow-md">
                        <Mascot 
                          mood={activeLessonStep === 0 ? "happy" : activeLessonStep === 1 ? "surprised" : "happy"} 
                          className="w-full h-full" 
                        />
                      </div>
                      
                      <div className="space-y-1 relative z-10 flex-1 text-center sm:text-left">
                        <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest leading-none">Companion Mascot Guide</p>
                        <h4 className="text-base font-black text-slate-900 leading-snug uppercase mt-1">
                          {activeLessonStep === 0 
                            ? "INITIATING PARALLEL LORE ALIGNMENT..." 
                            : activeLessonStep === 1 
                              ? "EXCELLENT DEEP RECEPTIVITY STATUS!" 
                              : "CRITICAL PROTOCOL INTEGRATION STEP!"}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Let's deconstruct this physiological pathway together, brother!
                        </p>
                      </div>
                    </div>

                    {/* Section Text Content card replacing Duolingo chunky cards */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeLessonStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-6 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
                          <h3 className="text-xl font-black text-slate-900 leading-none uppercase tracking-tight">
                            {selectedBook.content.sections[activeLessonStep]?.heading}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                          {selectedBook.content.sections[activeLessonStep]?.text}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                  </div>
                )}

              </div>
            </div>

            {/* Modal Bottom control panel: Modern clean buttons tailored to match Subscription Screen standards */}
            <div className="bg-white border-t border-slate-200/60 px-6 py-6 flex items-center justify-center backdrop-blur-md">
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
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4.5 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 cursor-pointer text-center"
                  >
                    Seal Cognitive Integration
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
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-4.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
                      >
                        Recovers Previous Node
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
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4.5 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/25 cursor-pointer text-center"
                    >
                      {activeLessonStep + 1 === selectedBook.content.sections.length ? 'Finalize Synchronization' : 'Assimilate Next Node'}
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
