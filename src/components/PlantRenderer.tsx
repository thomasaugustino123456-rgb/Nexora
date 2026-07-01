import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { PlantType } from '../types';
import { useSound } from '../hooks/useSound';
import { GardenerDrone } from './GardenerDrone';
import { NanoBees, SpiritButterfly } from './EcosystemCompanions';
import { SunRenderer } from './SunRenderer';

interface PlantRendererProps {
  type: PlantType;
  stage: number;
  isThirsty: boolean;
  isDead: boolean;
  activeEcosystemItemIds?: string[];
  isForestActive?: boolean;
  droneTargetPos?: { x: number; y: number } | null;
  onDronePositionChange?: (pos: { x: number, y: number }) => void;
  className?: string;
}

export const PlantRenderer: React.FC<PlantRendererProps> = ({ 
  type, 
  stage, 
  isThirsty, 
  isDead, 
  activeEcosystemItemIds = [],
  isForestActive = false,
  droneTargetPos = null,
  onDronePositionChange,
  className = ""
}) => {
  const { play } = useSound();
  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isLunging, setIsLunging] = useState(false);

  const activePot = activeEcosystemItemIds.find(id => id.startsWith('pot_'));
  const activeColor = activeEcosystemItemIds.find(id => id.startsWith('color_bio_'));

  const plantColors: Record<string, string> = {
    'color_bio_01': '#2dd4bf', // Biolume Teal
    'color_bio_02': '#f472b6', // Biolume Pink
  };

  const potStyles: Record<string, { body: string; shadow: string; accent: string }> = {
    'pot_cyber_01': { body: '#1e293b', shadow: '#0f172a', accent: '#f472b6' },
    'pot_zen_01': { body: '#d1d5db', shadow: '#9ca3af', accent: '#4b5563' },
  };

  const getPotStyle = () => potStyles[activePot || ''] || { body: '#F39E7D', shadow: '#E0E0E0', accent: '#BDBDBD' };

  const renderPotWrapper = (defaultPot: React.ReactNode) => {
    if (activePot) {
      const style = getPotStyle();
      return (
        <g>
          <path d="M 55,140 L 145,140 L 130,195 L 70,195 Z" fill={style.body} stroke="#1e293b" strokeWidth="4" />
          <path d="M 55,140 L 145,140 L 140,150 L 60,150 Z" fill={style.shadow} />
          {activePot === 'pot_cyber_01' && (
             <motion.rect x="75" y="165" width="50" height="4" fill={style.accent} rx="2" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
          )}
          <ellipse cx="100" cy="140" rx="42" ry="7" fill="#5D4037" stroke="#1e293b" strokeWidth="2" />
        </g>
      );
    }
    return defaultPot;
  };

  const handlePlantClick = () => {
    if (isDead) return;

    if (type === 'mourningSprout') {
      if (isShaking) return;
      setIsShaking(true);
      play('dogHungry'); // A whimper-like sound for the sad plant
      setTimeout(() => setIsShaking(false), 1000);
      return;
    }

    if (type !== 'boredFlower') return;
    
    setClickCount(prev => prev + 1);
    play('water'); // Lighter sound for the flower
    setTimeout(() => setClickCount(0), 1000);
  };

  const getPlantColors = () => {
    if (isDead) return { primary: '#8B4513', secondary: '#5D4037', accent: '#3E2723' };
    
    if (activeColor && !isDead) {
      const color = plantColors[activeColor];
      return { primary: color, secondary: color, accent: '#FFFFFF' };
    }

    if (isThirsty) return { primary: '#C5E1A5', secondary: '#9CCC65', accent: '#7CB342' };
    
    switch (type) {
      case 'slime-berry': return { primary: '#10b981', secondary: '#059669', accent: '#34d399' };
      case 'solar-flare-pea': return { primary: '#f59e0b', secondary: '#d97706', accent: '#fef08a' };
      case 'moon-sprout': return { primary: '#6366f1', secondary: '#4f46e5', accent: '#a5b4fc' };
      case 'star-silk-leaf': return { primary: '#d946ef', secondary: '#c026d3', accent: '#f5d0fe' };
      case 'dream-shroom': return { primary: '#f43f5e', secondary: '#e11d48', accent: '#fda4af' };
      case 'luck-lotus': return { primary: '#F472B6', secondary: '#EC4899', accent: '#FDF2F8' };
      case 'luck-fern': return { primary: '#10B981', secondary: '#047857', accent: '#A7F3D0' };
      case 'luck-clover': return { primary: '#FBBF24', secondary: '#B45309', accent: '#FEF3C7' };
      case 'luck-orchid': return { primary: '#818CF8', secondary: '#4338CA', accent: '#E0E7FF' };
      case 'luck-cactus': return { primary: '#22C55E', secondary: '#15803D', accent: '#F43F5E' };
      case 'premium-cactus': return { primary: '#4CAF50', secondary: '#388E3C', accent: '#FF4081' };
      case 'zen': return { primary: '#4CAF50', secondary: '#388E3C', accent: '#2E7D32' };
      case 'desert': return { primary: '#81C784', secondary: '#43A047', accent: '#FB8C00' };
      case 'tropical': return { primary: '#00C853', secondary: '#00E676', accent: '#FF4081' };
      case 'forest': return { primary: '#2E7D32', secondary: '#1B5E20', accent: '#8D6E63' };
      case 'meadow': return { primary: '#AED581', secondary: '#7CB342', accent: '#E91E63' };
      case 'crystal': return { primary: '#B2EBF2', secondary: '#4DD0E1', accent: '#D1C4E9' };
      case 'volcano': return { primary: '#FF5722', secondary: '#BF360C', accent: '#FFEB3B' };
      case 'sprout': return { primary: '#66BB6A', secondary: '#43A047', accent: '#F39E7D' };
      default: return { primary: '#4CAF50', secondary: '#388E3C', accent: '#2E7D32' };
    }
  };

  const colors = getPlantColors();

  const renderSprout = () => (
    <motion.g
      whileTap={{ scale: 0.9, rotate: [0, -4, 4, 0] }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Terracotta Pot with Adorable Anime Smiley Face */}
      {renderPotWrapper(
        <g id="pot">
          {/* Main Body */}
          <path 
            d="M 60,140 Q 60,185 75,195 L 125,195 Q 140,185 140,140 Z" 
            fill="#F39E7D" 
            stroke="black" 
            strokeWidth="6" 
            strokeLinejoin="round" 
          />
          {/* Pot Rim */}
          <path 
            d="M 50,130 Q 50,115 100,115 Q 150,115 150,130 L 150,145 Q 150,155 100,155 Q 50,155 50,145 Z" 
            fill="#F39E7D" 
            stroke="black" 
            strokeWidth="6" 
            strokeLinejoin="round" 
          />
          {/* Soil */}
          <path 
            d="M 60,135 Q 60,125 100,125 Q 140,125 140,135 Q 140,145 100,145 Q 60,145 60,135" 
            fill="#7C5547" 
            stroke="black" 
            strokeWidth="3" 
          />
          {/* Highlights and Texture */}
          <path d="M 65,130 Q 75,125 90,125" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
          <circle cx="80" cy="170" r="2" fill="black" opacity="0.6" />
          <circle cx="110" cy="180" r="2" fill="black" opacity="0.6" />
          <circle cx="95" cy="165" r="1.5" fill="black" opacity="0.6" />

          {/* Adorable cartoon eyes and smiling face on standard pot */}
          <circle cx="90" cy="160" r="3.2" fill="black" />
          <circle cx="89" cy="158.5" r="1" fill="white" />
          <circle cx="110" cy="160" r="3.2" fill="black" />
          <circle cx="109" cy="158.5" r="1" fill="white" />
          <ellipse cx="83" cy="163.5" rx="3" ry="1.5" fill="#E57373" opacity="0.6" />
          <ellipse cx="117" cy="163.5" rx="3" ry="1.5" fill="#E57373" opacity="0.6" />
          <path d="M 97,162.5 Q 100,165.5 103,162.5" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {!isDead && (
        <g id="plant-growth">
          {/* Seed State */}
          {stage === 0 && (
            <g>
              <motion.ellipse 
                cx="100" cy="132" rx="7.5" ry="5.5" 
                fill="#C4A484" stroke="black" strokeWidth="2.5"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
              />
              {/* Cozy closed sleeping baby eyes */}
              <path d="M 96,131 Q 97.5,133 99,131 M 101,131 Q 102.5,133 104,131" stroke="black" strokeWidth="1.2" fill="none" />
              {/* Slanted tiny baby green shoot leaf */}
              <path d="M 100,128 Q 103,120 108,124 Q 105,127 100,128" fill="#81C784" stroke="black" strokeWidth="1.5" />
            </g>
          )}

          {/* Stage 1: Curved, chunky organic sprout shoot with baby leaf */}
          {stage === 1 && (
            <g>
              <motion.path 
                d="M 97,135 Q 92,120 95,110 Q 101,110 103,135 Z" 
                fill="#81C784" 
                stroke="black" 
                strokeWidth="3" 
                strokeLinejoin="round"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
              />
              <motion.g 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: 0.15 }}
                transform="translate(95, 110)"
              >
                <path 
                  d="M 0,0 C -12,-3 -18,-12 -14,-15 C -10,-18 -3,-12 0,0" 
                  fill="#4CAF50" 
                  stroke="black" 
                  strokeWidth="2.5" 
                />
                {/* Glossy highlight line on leaf */}
                <path d="M -8,-9 Q -4,-12 0,-3" fill="none" stroke="white" strokeWidth="1.2" opacity="0.3" />
              </motion.g>
            </g>
          )}

          {/* Stage 2: Stronger stem branching with double hearts leaves */}
          {stage === 2 && (
            <g>
              <motion.path 
                d="M 96,135 Q 90,111 93,95 Q 101,95 104,135 Z" 
                fill="#81C784" 
                stroke="black" 
                strokeWidth="3.5" 
                strokeLinejoin="round"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
              />
              <g transform="translate(93, 100)">
                <motion.g initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1 }}>
                  <path 
                    d="M 0,0 C -18,-5 -26,-22 -18,-26 C -10,-30 -3,-15 0,0" 
                    fill="#4CAF50" 
                    stroke="black" 
                    strokeWidth="2.5" 
                    strokeLinejoin="round"
                  />
                  <path d="M -12,-16 Q -7,-20 0,-5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" />
                </motion.g>
                <motion.g initial={{ scale: 0, rotate: 15 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2 }}>
                  <path 
                    d="M 0,0 C 18,-5 26,-22 18,-26 C 10,-30 3,-15 0,0" 
                    fill="#388E3C" 
                    stroke="black" 
                    strokeWidth="2.5" 
                    strokeLinejoin="round"
                  />
                  <path d="M 12,-16 Q 7,-20 0,-5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
                </motion.g>
              </g>
            </g>
          )}

          {/* Stage 3: Branched stem and multiple artist-vector cartoon leaves */}
          {stage === 3 && (
            <g>
              <motion.path 
                d="M 95,135 Q 85,100 90,80 Q 102,80 105,135 Z" 
                fill="#81C784" 
                stroke="black" 
                strokeWidth="4" 
                strokeLinejoin="round"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
              />
              <path d="M 90,111 Q 76,98 70,95" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 101,106 Q 116,94 122,90" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round" />

              {/* Side left leaf */}
              <g transform="translate(70, 95)">
                <motion.path 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
                  d="M 0,0 C -15,-3 -22,-14 -15,-18 C -8,-21 -2,-10 0,0" 
                  fill="#4CAF50" stroke="black" strokeWidth="2.5" 
                />
              </g>
              {/* Side right leaf */}
              <g transform="translate(122, 90)">
                <motion.path 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                  d="M 0,0 C 15,-3 22,-14 15,-18 C 8,-21 2,-10 0,0" 
                  fill="#2E7D32" stroke="black" strokeWidth="2.5" 
                />
              </g>
              {/* Center twin leaves on top of stem */}
              <g transform="translate(90, 80)">
                <motion.path 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25 }}
                  d="M 0,0 C -18,-8 -25,-22 -17,-26 C -9,-29 -3,-14 0,0" 
                  fill="#4CAF50" stroke="black" strokeWidth="2.5" 
                />
                <motion.path 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                  d="M 0,0 C 18,-8 25,-22 17,-26 C 9,-29 3,-14 0,0" 
                  fill="#388E3C" stroke="black" strokeWidth="2.5" 
                />
              </g>
            </g>
          )}

          {/* Stage 4: Bushy cartoon layers of leaves and a beautiful pink blossom bud */}
          {stage === 4 && (
            <g>
              <motion.path 
                d="M 94,135 Q 82,90 88,65 Q 104,65 106,135 Z" 
                fill="#81C784" 
                stroke="black" 
                strokeWidth="4" 
                strokeLinejoin="round"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
              />
              <path d="M 88,105 Q 70,95 62,90" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <path d="M 102,100 Q 120,90 126,85" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />

              {/* Bushy left cluster */}
              <g transform="translate(62, 90)">
                <path d="M 0,0 C -16,-5 -22,-16 -15,-20 C -8,-23 -2,-11 0,0" fill="#4CAF50" stroke="black" strokeWidth="2.5" />
                <path d="M 0,0 C -6,-14 -14,-22 -7,-26 C 0,-28 3,-14 0,0" fill="#81C784" stroke="black" strokeWidth="2.2" />
              </g>
              {/* Bushy right cluster */}
              <g transform="translate(126, 85)">
                <path d="M 0,0 C 16,-5 22,-16 15,-20 C 8,-23 2,-11 0,0" fill="#2E7D32" stroke="black" strokeWidth="2.5" />
                <path d="M 0,0 C 5,-14 12,-22 6,-26 C 0,-28 -3,-14 0,0" fill="#388E3C" stroke="black" strokeWidth="2.2" />
              </g>
              {/* Double top leaves */}
              <g transform="translate(88, 65)">
                <path d="M 0,0 C -20,-8 -28,-24 -19,-28 C -10,-31 -3,-15 0,0" fill="#4CAF50" stroke="black" strokeWidth="2.5" />
                <path d="M 0,0 C 20,-8 28,-24 19,-28 C 10,-31 3,-15 0,0" fill="#388E3C" stroke="black" strokeWidth="2.5" />
              </g>
              {/* Shiny blooming bud at tip! */}
              <g transform="translate(88, 65)">
                <motion.circle 
                  cx="0" cy="-2" r="9" 
                  fill="#FF8A80" stroke="black" strokeWidth="2.5" 
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <path d="-6,-1 Q 0,-7 6,-1" stroke="black" strokeWidth="1.5" fill="none" />
                <path d="-4,3 Q 0,-2 4,3" stroke="black" strokeWidth="1.2" fill="none" />
              </g>
            </g>
          )}

          {/* Stage 5: Ultimate bloom - Smiling daisy cartoon flower head on top sways with wind */}
          {stage >= 5 && (
            <g>
              <motion.path 
                d="M 94,135 Q 82,90 88,58 Q 104,58 106,135 Z" 
                fill="#81C784" 
                stroke="black" 
                strokeWidth="4.2" 
                strokeLinejoin="round"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
              />
              <path d="M 88,105 Q 68,95 60,90" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <path d="M 102,100 Q 122,90 130,85" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />

              {/* Shaded lower leaves */}
              <g transform="translate(60, 90)">
                <path d="M 0,0 C -15,-4 -20,-15 -14,-18 C -8,-21 -2,-10 0,0" fill="#4CAF50" stroke="black" strokeWidth="2.5" />
                <path d="M 0,0 C -5,-12 -12,-20 -6,-24 C 0,-25 2,-12 0,0" fill="#81C784" stroke="black" strokeWidth="2.5" />
              </g>
              <g transform="translate(130, 85)">
                <path d="M 0,0 C 15,-4 20,-15 14,-18 C 8,-21 2,-10 0,0" fill="#2E7D32" stroke="black" strokeWidth="2.5" />
                <path d="M 0,0 C 5,-12 12,-20 6,-24 C 0,-25 -2,-12 0,0" fill="#388E3C" stroke="black" strokeWidth="2.5" />
              </g>

              {/* Glowing, swaying active flower head */}
              <g transform="translate(88, 58)">
                <motion.g
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  style={{ transformOrigin: "center bottom" }}
                >
                  {/* Thick, beautiful vector cartoon petals (Pink and Orange combo) */}
                  <g fill="#F48FB1" stroke="black" strokeWidth="3" strokeLinejoin="round">
                    <ellipse cx="0" cy="-24" rx="10" ry="18" />
                    <ellipse cx="0" cy="22" rx="10" ry="18" />
                    <ellipse cx="-24" cy="-1" rx="18" ry="10" />
                    <ellipse cx="24" cy="-1" rx="18" ry="10" />
                    
                    <ellipse cx="-16" cy="-17" rx="13" ry="13" transform="rotate(45 -16 -17)" />
                    <ellipse cx="16" cy="15" rx="13" ry="13" transform="rotate(45 16 15)" />
                    <ellipse cx="-16" cy="15" rx="13" ry="13" transform="rotate(-45 -16 15)" />
                    <ellipse cx="16" cy="-17" rx="13" ry="13" transform="rotate(-45 16 -17)" />
                  </g>
                  {/* Outer petal dark shadows for stunning cartoon contrast */}
                  <circle cx="0" cy="-1" r="19" fill="none" stroke="black" strokeWidth="1" opacity="0.1" />

                  {/* Bright yellow flower face core */}
                  <circle cx="0" cy="-1" r="17.5" fill="#FFF176" stroke="black" strokeWidth="3" />

                  {/* Adorable shiny smiley anime face */}
                  <circle cx="-6" cy="-4" r="2.2" fill="black" />
                  <circle cx="6" cy="-4" r="2.2" fill="black" />
                  {/* Tiny reflective sparkles in eyes */}
                  <circle cx="-5.5" cy="-4.8" r="0.6" fill="white" />
                  <circle cx="6.5" cy="-4.8" r="0.6" fill="white" />
                  <ellipse cx="-11" cy="-1" rx="2.5" ry="1.2" fill="#E57373" />
                  <ellipse cx="11" cy="-1" rx="2.5" ry="1.2" fill="#E57373" />
                  {/* Sweet open smiley vector mouth */}
                  <path d="M -3,2 Q 0,4.5 3,2" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
                </motion.g>
              </g>
            </g>
          )}

          {/* Growth Energy Sparks */}
          {stage >= 5 && (
            <motion.g animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Sparkles className="text-yellow-400 absolute top-0 left-0" style={{ transform: 'translate(40px, 40px)' }} />
              <Sparkles className="text-yellow-400 absolute top-0 right-0" style={{ transform: 'translate(140px, 60px)' }} />
            </motion.g>
          )}
        </g>
      )}
    </motion.g>
  );

  const renderZen = () => (
    <g>
      {/* Pot - Zen Stone Basin */}
      {renderPotWrapper(
        <g>
          <rect x="50" y="160" width="100" height="30" rx="15" fill="#90A4AE" />
          <rect x="45" y="155" width="110" height="5" rx="2" fill="#78909C" />
        </g>
      )}
      
      {!isDead && (
        <g>
          {/* Moss */}
          {stage >= 1 && <motion.ellipse cx="100" cy="160" rx="40" ry="10" fill="#689F38" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
          
          {/* Bamboo */}
          {stage >= 2 && (
            <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: 'bottom' }}>
              <rect x="120" y="80" width="8" height="80" rx="2" fill="#8BC34A" />
              <rect x="120" y="100" width="8" height="2" fill="#558B2F" />
              <rect x="120" y="120" width="8" height="2" fill="#558B2F" />
            </motion.g>
          )}

          {/* Bonsai Structure */}
          {stage >= 3 && (
            <motion.path 
              d="M 85,160 Q 70,120 100,100 Q 130,80 110,60" 
              stroke="#5D4037" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          )}

          {/* Leaves */}
          {stage >= 4 && (
            <g>
              <motion.circle cx="110" cy="60" r="20" fill={colors.primary} opacity="0.8" initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.circle cx="75" cy="115" r="15" fill={colors.secondary} opacity="0.8" initial={{ scale: 0 }} animate={{ scale: 1 }} />
            </g>
          )}

          {stage >= 5 && <Sparkles className="text-yellow-400 absolute top-10 right-10 animate-pulse" />}
        </g>
      )}
    </g>
  );

  const renderDesert = () => (
    <g>
      {/* Tera Cotta Pot */}
      <path d="M 60,150 L 140,150 L 130,190 L 70,190 Z" fill="#E64A19" />
      <rect x="55" y="145" width="90" height="10" rx="2" fill="#BF360C" />
      
      {!isDead && (
        <g>
          {/* Cactus Body */}
          {stage >= 1 && (
            <motion.rect x="92" y="100" width="16" height="50" rx="8" fill={colors.primary} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: 'bottom' }} />
          )}
          
          {stage >= 2 && (
            <motion.path d="M 92,120 Q 70,120 75,100" stroke={colors.primary} strokeWidth="12" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
          )}

          {stage >= 3 && (
            <motion.path d="M 108,130 Q 130,130 125,110" stroke={colors.primary} strokeWidth="12" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
          )}

          {/* Spines */}
          {stage >= 4 && (
            <g opacity="0.6">
              <line x1="100" y1="110" x2="105" y2="110" stroke="white" strokeWidth="1" />
              <line x1="95" y1="130" x2="90" y2="130" stroke="white" strokeWidth="1" />
              <line x1="75" y1="105" x2="70" y2="105" stroke="white" strokeWidth="1" />
            </g>
          )}

          {/* Tropical Flower */}
          {stage >= 5 && (
            <motion.circle cx="100" cy="95" r="8" fill={colors.accent} initial={{ scale: 0 }} animate={{ scale: 1 }} />
          )}
        </g>
      )}
    </g>
  );

  const renderTropical = () => (
    <g>
      {/* Modern White Pot */}
      <rect x="65" y="150" width="70" height="40" rx="4" fill="#F5F5F5" />
      <rect x="60" y="145" width="80" height="8" rx="2" fill="#EEEEEE" />

      {!isDead && (
        <g>
          {/* Monstera Stem */}
          {stage >= 1 && (
            <motion.path d="M 100,150 Q 80,100 120,80" stroke="#81C784" strokeWidth="3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
          )}

          {/* Large Heart Leaf */}
          {stage >= 2 && (
            <motion.path 
              d="M 120,80 Q 150,50 120,20 Q 90,50 120,80" 
              fill={colors.primary} 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              style={{ transformOrigin: '120px 80px' }}
            />
          )}

          {stage >= 3 && (
             <motion.path 
             d="M 100,150 Q 130,120 80,90" 
             stroke="#81C784" 
             strokeWidth="3" 
             fill="none" 
             initial={{ pathLength: 0 }} 
             animate={{ pathLength: 1 }} 
           />
          )}

          {/* Second Leaf */}
          {stage >= 4 && (
            <motion.path 
              d="M 80,90 Q 50,60 80,30 Q 110,60 80,90" 
              fill={colors.secondary} 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              style={{ transformOrigin: '80px 90px' }}
            />
          )}

          {/* Bird of Paradise Flower */}
          {stage >= 5 && (
            <g>
              <motion.path d="M 100,150 L 100,50" stroke="#81C784" strokeWidth="2" />
              <motion.path d="M 100,50 Q 120,30 150,40" fill={colors.accent} initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.path d="M 100,50 Q 110,20 130,10" fill="#FF9100" initial={{ scale: 0 }} animate={{ scale: 1 }} />
            </g>
          )}
        </g>
      )}
    </g>
  );

  const renderForest = () => (
    <g>
      {/* Tree Trunk Pot/Base */}
      <rect x="60" y="160" width="80" height="30" rx="5" fill="#5D4037" />
      
      {!isDead && (
        <g>
          {/* Main Trunk */}
          {stage >= 1 && (
            <motion.path d="M 100,165 L 100,100" stroke="#795548" strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
          )}

          {/* Branches */}
          {stage >= 2 && (
            <motion.path d="M 100,130 Q 80,110 70,115" stroke="#795548" strokeWidth="6" strokeLinecap="round" />
          )}

          {/* Canopy */}
          {stage >= 3 && (
            <motion.circle cx="100" cy="80" r="30" fill={colors.primary} opacity="0.9" initial={{ scale: 0 }} animate={{ scale: 1 }} />
          )}

          {/* Ferns at base */}
          {stage >= 4 && (
            <g>
              <motion.path d="M 70,165 Q 50,140 60,130" stroke="#4CAF50" strokeWidth="2" fill="none" />
              <motion.path d="M 130,165 Q 150,140 140,130" stroke="#4CAF50" strokeWidth="2" fill="none" />
            </g>
          )}

          {/* Mushrooms */}
          {stage >= 5 && (
            <g>
              <circle cx="85" cy="160" r="5" fill="white" />
              <path d="M 80,160 Q 85,145 90,160" fill="#F44336" />
              <circle cx="115" cy="162" r="4" fill="white" />
              <path d="M 111,162 Q 115,150 119,162" fill="#F44336" />
            </g>
          )}
        </g>
      )}
    </g>
  );

  const renderMeadow = () => (
    <g>
      {/* Woven Basket Pot */}
      <rect x="60" y="155" width="80" height="35" rx="8" fill="#D7CCC8" />
      <line x1="60" y1="165" x2="140" y2="165" stroke="#A1887F" strokeWidth="1" />
      <line x1="60" y1="175" x2="140" y2="175" stroke="#A1887F" strokeWidth="1" />
      
      {!isDead && (
        <g>
          {/* Stems */}
          {stage >= 1 && <motion.path d="M 80,155 L 70,100" stroke="#689F38" strokeWidth="2" />}
          {stage >= 2 && <motion.path d="M 100,155 L 105,80" stroke="#689F38" strokeWidth="2" />}
          {stage >= 3 && <motion.path d="M 120,155 L 135,110" stroke="#689F38" strokeWidth="2" />}

          {/* Wildflowers */}
          {stage >= 4 && (
            <g>
              <motion.circle cx="70" cy="100" r="8" fill="#F06292" initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.circle cx="105" cy="80" r="10" fill="#FFD54F" initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.circle cx="135" cy="110" r="7" fill="#BA68C8" initial={{ scale: 0 }} animate={{ scale: 1 }} />
            </g>
          )}

          {/* Lavender stalks */}
          {stage >= 5 && (
            <g>
              <rect x="90" y="90" width="4" height="20" rx="2" fill="#9575CD" opacity="0.8" />
              <rect x="115" y="100" width="4" height="25" rx="2" fill="#9575CD" opacity="0.8" />
            </g>
          )}
        </g>
      )}
    </g>
  );

  const renderCrystal = () => (
    <g>
      {/* Obsidian Pot */}
      <path d="M 60,150 L 140,150 L 130,195 L 70,195 Z" fill="#212121" />
      <rect x="55" y="145" width="90" height="10" rx="1" fill="#000000" />
      
      {!isDead && (
        <g>
          {/* Main Crystal */}
          {stage >= 1 && (
            <motion.path 
              d="M 100,150 L 80,100 L 100,60 L 120,100 Z" 
              fill="url(#crystalGradient)" 
              stroke="#B2EBF2" 
              strokeWidth="1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ transformOrigin: '100px 150px' }}
            />
          )}

          {/* Side Crystals */}
          {stage >= 2 && (
            <motion.path 
              d="M 85,150 L 65,120 L 80,100 Z" 
              fill="#E1F5FE" 
              opacity="0.7"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          )}

          {/* Luminescent Vines */}
          {stage >= 3 && (
            <motion.path 
              d="M 100,150 Q 140,140 150,110" 
              stroke="#B2EBF2" 
              strokeWidth="2" 
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          )}

          {stage >= 4 && (
            <motion.circle cx="150" cy="110" r="4" fill="#00BCD4" initial={{ scale: 0 }} animate={{ scale: 1 }} />
          )}

          {/* Infinite energy glow */}
          {stage >= 5 && (
            <motion.circle 
              cx="100" 
              cy="100" 
              r="40" 
              fill="url(#glowRadial)" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: [0.2, 0.4, 0.2] }} 
              transition={{ repeat: 0 /* fixed */, duration: 3 }}
            />
          )}
        </g>
      )}

      <defs>
        <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F7FA" />
          <stop offset="100%" stopColor="#80DEEA" />
        </linearGradient>
        <radialGradient id="glowRadial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00BCD4" stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );

  const renderVolcano = () => (
    <g>
      {/* Basalt Rock Pot */}
      <path d="M 50,150 L 150,150 L 140,195 L 60,195 Z" fill="#263238" />
      <motion.path 
        d="M 50,150 Q 100,165 150,150" 
        stroke="#FF5722" 
        strokeWidth="2" 
        fill="none"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: 0 /* fixed */, duration: 2 }}
      />
      
      {!isDead && (
        <g>
          {/* Obsidian Stems with Lava Veins */}
          {stage >= 1 && (
            <motion.path 
              d="M 100,152 L 100,80" 
              stroke="#212121" 
              strokeWidth="10" 
              strokeLinecap="round" 
              initial={{ scaleY: 0 }} 
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: 'bottom' }}
            />
          )}

          {stage >= 2 && (
            <motion.path 
              d="M 100,120 Q 70,100 60,110" 
              stroke="#212121" 
              strokeWidth="6" 
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
          )}

          {/* Glowing Leaves/Embers */}
          {stage >= 3 && (
            <motion.circle 
              cx="100" 
              cy="70" 
              r="25" 
              fill={colors.primary} 
              opacity="0.9"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          )}

          {stage >= 4 && (
            <g>
              <motion.circle cx="60" cy="110" r="12" fill={colors.secondary} initial={{ scale: 0 }} animate={{ scale: 1 }} />
              <motion.path 
                 d="M 100,70 L 110,40" 
                 stroke={colors.accent} 
                 strokeWidth="2" 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: [0.4, 1, 0.4] }} 
                 transition={{ repeat: 0 /* fixed */, duration: 1.5 }}
              />
            </g>
          )}

          {/* Fire Blooms / Lava Flows */}
          {stage >= 5 && (
            <g>
               <motion.circle 
                 cx="100" cy="50" r="10" fill={colors.accent} 
                 initial={{ scale: 0 }} 
                 animate={{ scale: [1, 1.2, 1] }} 
                 transition={{ repeat: 0 /* fixed */, duration: 1 }}
               />
               <motion.path 
                 d="M 100,150 Q 160,180 180,160" 
                 stroke={colors.primary} 
                 strokeWidth="3" 
                 fill="none"
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
               />
            </g>
          )}
        </g>
      )}
    </g>
  );

  const renderBoredFlower = () => {
    const flowerColors = {
      petal: "#F37385",
      petalDark: "#E15A6C",
      face: "#FFCF3E",
      faceShade: "#E6B828",
      pot: "#FF9F1C",
      potDark: "#E68A10",
      stem: "#4D7C0F",
      leaf: "#65A30D"
    };

    return (
      <g onClick={handlePlantClick} style={{ cursor: 'pointer' }}>
        <defs>
          <pattern id="halftone" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="black" opacity="0.2" />
          </pattern>
        </defs>

        {/* Pot */}
        <g id="flower-pot">
          <path d="M 60,165 L 140,165 L 135,195 L 65,195 Z" fill={flowerColors.pot} stroke="#000" strokeWidth="2" />
          <path d="M 55,155 L 145,155 L 145,165 L 55,165 Z" fill={flowerColors.pot} stroke="#000" strokeWidth="2" />
          {/* Halftone Shading on Pot */}
          <path d="M 115,165 L 140,165 L 135,195 L 110,195 Z" fill="url(#halftone)" opacity="0.5" />
          <ellipse cx="100" cy="155" rx="45" ry="5" fill="#5D4037" />
        </g>

        {stage >= 1 && (
          <g>
            {/* Stem */}
            <path 
              d="M 100,155 Q 95,130 100,100" 
              stroke={flowerColors.stem} 
              strokeWidth="5" 
              fill="none"
              strokeLinecap="round"
            />

            {/* Leaves */}
            <g id="flower-leaves">
              {/* Left Leaf */}
              <path 
                d="M 98,140 Q 60,120 70,160 Z" 
                stroke="#000" strokeWidth="2" fill={flowerColors.leaf}
              />
              <path d="M 70,160 L 98,140" stroke="#000" strokeWidth="1" opacity="0.3" />
              {/* Right Leaf */}
              <path 
                d="M 102,130 Q 140,110 130,150 Z" 
                stroke="#000" strokeWidth="2" fill={flowerColors.leaf}
              />
              <path d="M 102,130 L 130,150" stroke="#000" strokeWidth="1" opacity="0.3" />
            </g>

            {/* Petals - Static as requested */}
            {stage >= 2 && (
              <g id="petals">
                {/* 6 Petals */}
                <ellipse cx="100" cy="55" rx="20" ry="25" fill={flowerColors.petal} stroke="#000" strokeWidth="2" />
                <ellipse cx="135" cy="70" rx="25" ry="20" fill={flowerColors.petal} stroke="#000" strokeWidth="2" />
                <ellipse cx="135" cy="110" rx="25" ry="20" fill={flowerColors.petal} stroke="#000" strokeWidth="2" />
                <ellipse cx="100" cy="125" rx="20" ry="25" fill={flowerColors.petal} stroke="#000" strokeWidth="2" />
                <ellipse cx="65" cy="110" rx="25" ry="20" fill={flowerColors.petal} stroke="#000" strokeWidth="2" />
                <ellipse cx="65" cy="70" rx="25" ry="20" fill={flowerColors.petal} stroke="#000" strokeWidth="2" />
              </g>
            )}

            {/* Face - Animated eyes */}
            {stage >= 3 && (
              <g id="flower-face">
                <circle cx="100" cy="90" r="35" fill={flowerColors.face} stroke="#000" strokeWidth="2" />
                {/* Halftone Shading on Cheeks */}
                <path d="M 70,100 Q 75,115 100,115 Q 125,115 130,100" fill="url(#halftone)" opacity="0.6" stroke="none" />
                
                {/* Nose/Snout area */}
                <path d="M 95,95 Q 100,105 105,95" stroke="#000" strokeWidth="1.5" fill="none" />
                
                {/* Bored Eyes */}
                <g id="eyes">
                  {/* Left Eye */}
                  <g transform="translate(82, 80)">
                    <rect x="-12" y="-10" width="24" height="20" rx="10" fill="white" stroke="#000" strokeWidth="1.5" />
                    {/* Shifting Pupil */}
                    <motion.circle 
                      r="4" fill="black"
                      animate={{ cx: [-4, 4, -4] }}
                      transition={{ duration: 6, repeat: 0 /* fixed */, ease: "easeInOut" }}
                    />
                    {/* Eyelid (Blinking) */}
                    <motion.rect 
                      x="-13" y="-11" width="26" height="22" fill={flowerColors.face}
                      initial={{ scaleY: 0.5 }}
                      animate={{ scaleY: [0.5, 0.5, 1, 0.5, 0.5] }}
                      transition={{ duration: 4, repeat: 0 /* fixed */, times: [0, 0.8, 0.85, 0.9, 1] }}
                      style={{ originY: 0 }}
                    />
                  </g>
                  {/* Right Eye */}
                  <g transform="translate(118, 80)">
                    <rect x="-12" y="-10" width="24" height="20" rx="10" fill="white" stroke="#000" strokeWidth="1.5" />
                    {/* Shifting Pupil */}
                    <motion.circle 
                      r="4" fill="black"
                      animate={{ cx: [-4, 4, -4] }}
                      transition={{ duration: 6, repeat: 0 /* fixed */, ease: "easeInOut" }}
                    />
                    {/* Eyelid (Blinking) */}
                    <motion.rect 
                      x="-13" y="-11" width="26" height="22" fill={flowerColors.face}
                      initial={{ scaleY: 0.5 }}
                      animate={{ scaleY: [0.5, 0.5, 1, 0.5, 0.5] }}
                      transition={{ duration: 4, repeat: 0 /* fixed */, times: [0, 0.8, 0.85, 0.9, 1] }}
                      style={{ originY: 0 }}
                    />
                  </g>
                </g>

                {/* Bored Mouth */}
                <circle cx="100" cy="115" r="4" fill="none" stroke="#000" strokeWidth="1.5" />
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderMourningSprout = () => {
    const mourningColors = {
      pot: "#F16EA9",
      potDark: "#ED458C",
      sand: "#FEE7B6",
      sandDark: "#FCD385",
      stem: "#8DB600",
      head: "#6D3F1B",
      headDetail: "#4A2B12",
      caterpillar: "#B2D300",
      tear: "#A0D6FF",
      petal: "#FFC107"
    };

    return (
      <g onClick={handlePlantClick} style={{ cursor: 'pointer' }}>
        {/* Sand/Ground pooling */}
        <ellipse cx="100" cy="185" rx="55" ry="12" fill={mourningColors.sand} stroke="#000" strokeWidth="2" />
        <path d="M 60,185 Q 100,195 140,185" fill="none" stroke="#D4A373" strokeWidth="1" opacity="0.3" />
        
        {/* Fallen Petals on sand */}
        <path d="M 60,188 Q 50,180 55,192 Z" fill={mourningColors.petal} stroke="#000" strokeWidth="1.5" transform="rotate(-20, 60, 188)" />
        <path d="M 140,190 Q 150,182 145,194 Z" fill={mourningColors.petal} stroke="#000" strokeWidth="1.5" transform="rotate(15, 140, 190)" />

        {/* Pot */}
        <path d="M 70,140 L 130,140 L 125,185 L 75,185 Z" fill={mourningColors.pot} stroke="#000" strokeWidth="3" />
        <path d="M 65,125 L 135,125 L 135,140 L 65,140 Z" fill={mourningColors.pot} stroke="#000" strokeWidth="3" />
        <path d="M 110,140 L 130,140 L 125,185 L 105,185 Z" fill={mourningColors.potDark} opacity="0.3" />

        {stage >= 1 && (
          <g>
            {/* Stem */}
            <path d="M 100,125 L 100,80" stroke={mourningColors.stem} strokeWidth="8" strokeLinecap="round" />
            
            {/* Leaves */}
            <path d="M 100,120 Q 75,100 85,130 Z" fill={mourningColors.stem} stroke="#000" strokeWidth="2" />
            <path d="M 100,110 Q 125,90 115,120 Z" fill={mourningColors.stem} stroke="#000" strokeWidth="2" />

            {/* Head - The Sphere */}
            {stage >= 2 && (
              <motion.g
                animate={isShaking ? { rotate: [-10, 10, -5, 5, 0] } : {}}
                transition={{ duration: 0.5 }}
                style={{ originX: "100px", originY: "80px" }}
              >
                {/* Petals behind head */}
                <g opacity={stage >= 3 ? 1 : 0}>
                   <path d="M 75,60 Q 60,40 85,55 Z" fill={mourningColors.petal} stroke="#000" strokeWidth="2" />
                   <path d="M 125,60 Q 140,40 115,55 Z" fill={mourningColors.petal} stroke="#000" strokeWidth="2" />
                   <path d="M 70,100 Q 50,110 80,95 Z" fill={mourningColors.petal} stroke="#000" strokeWidth="2" />
                </g>

                <circle cx="100" cy="70" r="40" fill={mourningColors.head} stroke="#000" strokeWidth="3" />
                
                {/* Head Striations (Dark lines) */}
                <path d="M 100,30 L 100,110" stroke={mourningColors.headDetail} strokeWidth="1" opacity="0.3" />
                <path d="M 75,40 Q 100,70 75,100" stroke={mourningColors.headDetail} strokeWidth="1" opacity="0.3" fill="none" />
                <path d="M 125,40 Q 100,70 125,100" stroke={mourningColors.headDetail} strokeWidth="1" opacity="0.3" fill="none" />

                {/* Caterpillar on top */}
                <g transform="translate(105, 30) rotate(-10)">
                   <path d="M 0,0 Q 5,-10 10,0 Q 15,-10 20,0" stroke={mourningColors.caterpillar} strokeWidth="6" fill="none" strokeLinecap="round" />
                   <circle cx="2" cy="-2" r="1.5" fill="#000" />
                </g>

                {/* Face */}
                {stage >= 4 && (
                  <g>
                    {/* Blushing */}
                    <circle cx="75" cy="85" r="8" fill="#FF80AB" opacity="0.4" />
                    <circle cx="125" cy="85" r="8" fill="#FF80AB" opacity="0.4" />

                    {/* Sad Eyes */}
                    <motion.g animate={isShaking ? { scale: 1.2 } : { scale: 1 }}>
                       <path d="M 80,75 Q 85,70 90,75" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                       <path d="M 110,75 Q 115,70 120,75" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                       {/* Tears tracks */}
                       <motion.path 
                         d="M 85,78 L 85,95" stroke={mourningColors.tear} strokeWidth="2" strokeLinecap="round"
                         animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: 0 /* fixed */, duration: 2 }}
                       />
                       <motion.path 
                         d="M 115,78 L 115,95" stroke={mourningColors.tear} strokeWidth="2" strokeLinecap="round"
                         animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: 0 /* fixed */, duration: 2, delay: 1 }}
                       />
                    </motion.g>

                    {/* Mouth */}
                    <path d="M 95,95 Q 100,85 105,95" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </g>
                )}
              </motion.g>
            )}

            {/* Falling Tears - Droplets */}
            {stage >= 4 && (
               <g>
                  {[0, 1, 2].map(i => (
                    <motion.circle
                      key={i}
                      r="2"
                      fill={mourningColors.tear}
                      initial={{ cx: i === 0 ? 85 : 115, cy: 95, opacity: 0 }}
                      animate={{ 
                        cy: [95, 180], 
                        opacity: [0, 1, 1, 0],
                        scale: [1, 1, 0.5] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: 0 /* fixed */, 
                        delay: i * 0.7,
                        ease: "easeIn" 
                      }}
                    />
                  ))}
                  {/* Puddles in sand */}
                  <motion.circle 
                    cx="85" cy="180" r="4" fill={mourningColors.tear} opacity="0.4"
                    animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: 0 /* fixed */, duration: 2 }}
                  />
                  <motion.circle 
                    cx="115" cy="182" r="4" fill={mourningColors.tear} opacity="0.4"
                    animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: 0 /* fixed */, duration: 2, delay: 1 }}
                  />
               </g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderBreezeTulip = () => {
    const tulipColors = {
      petal: "#29B6F6",
      petalDark: "#039BE5",
      leaf: "#7CB342",
      leafDark: "#558B2F",
      potTop: "#FB8C00",
      potBody: "#FBC02D",
      puddle: "#0288D1",
      tongue: "#FF5252",
      scent: "#F06292",
      eye: "#8BC34A"
    };

    return (
      <g onClick={handlePlantClick} style={{ cursor: 'pointer' }}>
         <defs>
          <filter id="eyeSparkle">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Blue Puddle Base */}
        <ellipse cx="100" cy="192" rx="60" ry="10" fill={tulipColors.puddle} opacity="0.8" />
        <circle cx="120" cy="190" r="3" fill={tulipColors.puddle} />
        <circle cx="80" cy="195" r="2" fill={tulipColors.puddle} />

        {/* Pot - Stationary */}
        <g id="tulip-pot">
          <rect x="70" y="165" width="60" height="25" rx="8" fill={tulipColors.potBody} stroke="#4E342E" strokeWidth="2" />
          <rect x="68" y="155" width="64" height="12" rx="4" fill={tulipColors.potTop} stroke="#4E342E" strokeWidth="2" />
          {/* Decorative Waves on pot */}
          <path d="M 70,175 Q 75,185 80,175 Q 85,165 90,175 Q 95,185 100,175 Q 105,165 110,175 Q 115,185 120,175 Q 125,165 130,175" fill="none" stroke="#4E342E" strokeWidth="1.5" />
        </g>

        {stage >= 1 && (
          <motion.g
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: 0 /* fixed */, ease: "easeInOut" }}
            style={{ originX: "100px", originY: "160px" }}
          >
            {/* Stem */}
            <path d="M 100,155 Q 95,120 100,90" stroke={tulipColors.leafDark} strokeWidth="6" fill="none" strokeLinecap="round" />

            {/* Leaves */}
            {/* Left Leaf - Pointing down */}
            <path d="M 98,150 Q 50,130 60,180 Z" fill={tulipColors.leaf} stroke="#33691E" strokeWidth="2" />
            {/* Right Leaf - Waving up */}
            <path d="M 102,145 Q 140,110 150,50 Q 120,100 102,145 Z" fill={tulipColors.leaf} stroke="#33691E" strokeWidth="2" />

            {/* Blue Tulip Head */}
            {stage >= 2 && (
              <g transform="translate(100, 70)">
                {/* Petals */}
                <path d="M -40,-40 Q -50,-80 0,-100 Q 50,-80 40,-40 Q 0,-20 -40,-40 Z" fill={tulipColors.petal} stroke="#01579B" strokeWidth="3" />
                <path d="M -20,-45 Q 0,-90 20,-45 Z" fill={tulipColors.petalDark} stroke="#01579B" strokeWidth="2" opacity="0.6" />
                
                {/* Face */}
                {stage >= 3 && (
                  <g>
                    {/* Eyebrows/Markings */}
                    <ellipse cx="-15" cy="-75" rx="5" ry="3" fill="#01579B" opacity="0.4" />
                    <ellipse cx="15" cy="-75" rx="5" ry="3" fill="#01579B" opacity="0.4" />

                    {/* Happy Green Eyes */}
                    <g transform="translate(-18, -50)">
                      <circle r="12" fill={tulipColors.eye} stroke="#000" strokeWidth="1" />
                      <circle r="4" cx="3" cy="-3" fill="white" />
                      {/* Blink Eyelid */}
                      <motion.rect 
                        x="-14" y="-15" width="28" height="28" fill={tulipColors.petal}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: [0, 0, 1, 0, 0] }}
                        transition={{ duration: 5, repeat: 0 /* fixed */, times: [0, 0.8, 0.85, 0.9, 1] }}
                        style={{ originY: 0 }}
                      />
                    </g>
                    <g transform="translate(18, -50)">
                      <circle r="12" fill={tulipColors.eye} stroke="#000" strokeWidth="1" />
                      <circle r="4" cx="3" cy="-3" fill="white" />
                      {/* Blink Eyelid */}
                      <motion.rect 
                        x="-14" y="-15" width="28" height="28" fill={tulipColors.petal}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: [0, 0, 1, 0, 0] }}
                        transition={{ duration: 5, repeat: 0 /* fixed */, times: [0, 0.8, 0.85, 0.9, 1] }}
                        style={{ originY: 0 }}
                      />
                    </g>

                    {/* Happy Smile */}
                    <motion.path 
                      d="M -10,-35 Q 0,-25 10,-35" 
                      fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round"
                      animate={{ d: ["M -10,-35 Q 0,-25 10,-35", "M -15,-35 Q 0,-15 15,-35", "M -10,-35 Q 0,-25 10,-35"] }}
                      transition={{ duration: 5, repeat: 0 /* fixed */, ease: "easeInOut" }}
                    />
                  </g>
                )}
              </g>
            )}
          </motion.g>
        )}

        {/* Wind Effects & Scent */}
        {stage >= 4 && (
          <g>
            {/* Wind Lines */}
            {[0, 1, 2].map(i => (
              <motion.path
                key={`wind-${i}`}
                d={`M -50,${40 + i * 40} Q 0,${30 + i * 40} 50,${50 + i * 40}`}
                stroke="white"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 300, opacity: [0, 0.3, 0] }}
                transition={{ duration: 3, repeat: 0 /* fixed */, delay: i * 1, ease: "linear" }}
              />
            ))}

            {/* Sparkles in Wind */}
            {[0, 1, 2].map(i => (
              <motion.g
                key={`sparkle-${i}`}
                initial={{ x: -20, y: 50 + i * 30, opacity: 0 }}
                animate={{ x: 220, opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: 0 /* fixed */, delay: i * 1.5 }}
              >
                <circle r="2" fill="#E1F5FE" />
              </motion.g>
            ))}

            {/* Scent Particles - Pink Mist */}
            {[0, 1, 2].map(i => (
               <motion.circle
                  key={`scent-${i}`}
                  r="3"
                  fill={tulipColors.scent}
                  initial={{ cx: 0, cy: 60, opacity: 0 }}
                  animate={{ 
                    cx: [0, 90], 
                    cy: [60, 50],
                    opacity: [0, 0.4, 0],
                    scale: [1, 1.2, 0]
                  }}
                  transition={{ duration: 3, repeat: 0 /* fixed */, delay: i * 1 }}
               />
            ))}
          </g>
        )}
      </g>
    );
  };

  const renderHappyTulip = () => {
    const happyColors = {
      petal: "#FF5252",
      petalDark: "#D32F2F",
      leaf: "#4CAF50",
      leafDark: "#388E3C",
      stem: "#8BC34A",
      pot: "#FFA726",
      potDark: "#FB8C00",
    };

    return (
      <g onClick={handlePlantClick} style={{ cursor: 'pointer' }}>
        <defs>
          <pattern id="happyDotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="black" opacity="0.1" />
          </pattern>
        </defs>

        {/* Shadow */}
        <ellipse cx="110" cy="195" rx="50" ry="10" fill="black" opacity="0.1" />

        {/* Pot - Stationary */}
        <g id="happy-pot">
          <path d="M 70,140 L 130,140 L 125,185 L 75,185 Z" fill={happyColors.pot} stroke="#3E2723" strokeWidth="2" />
          <path d="M 65,125 L 135,125 L 135,145 L 65,145 Z" fill={happyColors.potDark} stroke="#3E2723" strokeWidth="2" />
          <rect x="70" y="145" width="60" height="40" fill="url(#happyDotPattern)" pointerEvents="none" />
          {/* Highlight on pot */}
          <path d="M 75,130 L 75,180" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </g>

        {stage >= 1 && (
          <g>
            {/* Stem */}
            <path d="M 100,125 L 100,80" stroke={happyColors.stem} strokeWidth="6" fill="none" strokeLinecap="round" />

            {/* Waving Leaves */}
            <motion.path 
              d="M 100,115 Q 70,100 80,140" 
              fill={happyColors.leaf} stroke="#1B5E20" strokeWidth="2"
              animate={{ d: ["M 100,115 Q 70,100 80,140", "M 100,115 Q 60,95 85,145", "M 100,115 Q 70,100 80,140"] }}
              transition={{ duration: 2, repeat: 0 /* fixed */, ease: "easeInOut" }}
            />
            <motion.path 
              d="M 100,105 Q 130,90 120,130" 
              fill={happyColors.leaf} stroke="#1B5E20" strokeWidth="2"
              animate={{ d: ["M 100,105 Q 130,90 120,130", "M 100,105 Q 140,85 115,135", "M 100,105 Q 130,90 120,130"] }}
              transition={{ duration: 2, repeat: 0 /* fixed */, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Happy Tulip Head */}
            {stage >= 2 && (
              <motion.g
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: 0 /* fixed */, ease: "easeInOut" }}
                style={{ originX: "100px", originY: "110px" }}
              >
                {/* Tulip Shape */}
                <path d="M 60,60 C 60,10 80,0 100,30 C 120,0 140,10 140,60 C 140,100 100,115 60,60" fill={happyColors.petal} stroke="#B71C1C" strokeWidth="3" />
                <path d="M 100,30 C 100,60 100,90 100,115" stroke="#B71C1C" strokeWidth="1" opacity="0.3" />
                
                {/* Dotted shading on head */}
                <path d="M 60,60 C 60,10 80,0 100,30 C 120,0 140,10 140,60 C 140,100 100,115 60,60" fill="url(#happyDotPattern)" pointerEvents="none" />

                {/* Face */}
                {stage >= 3 && (
                  <g>
                    {/* Blushing */}
                    <circle cx="80" cy="85" r="8" fill="#FF8A80" opacity="0.4" />
                    <circle cx="120" cy="85" r="8" fill="#FF8A80" opacity="0.4" />

                    {/* Happy Eyes */}
                    <g transform="translate(85, 75)">
                      <ellipse rx="8" ry="12" fill="white" stroke="#000" strokeWidth="1.5" />
                      <circle cx="0" cy="2" r="5" fill="#000" />
                      <circle cx="2" cy="-2" r="2" fill="white" />
                      {/* Blink */}
                      <motion.rect 
                        x="-10" y="-15" width="20" height="30" fill={happyColors.petal}
                        animate={{ scaleY: [0, 0, 1, 0, 0] }}
                        transition={{ duration: 4, repeat: 0 /* fixed */, times: [0, 0.8, 0.85, 0.9, 1] }}
                        style={{ originY: 0 }}
                      />
                    </g>
                    <g transform="translate(115, 75)">
                      <ellipse rx="8" ry="12" fill="white" stroke="#000" strokeWidth="1.5" />
                      <circle cx="0" cy="2" r="5" fill="#000" />
                      <circle cx="2" cy="-2" r="2" fill="white" />
                      {/* Blink */}
                      <motion.rect 
                        x="-10" y="-15" width="20" height="30" fill={happyColors.petal}
                        animate={{ scaleY: [0, 0, 1, 0, 0] }}
                        transition={{ duration: 4, repeat: 0 /* fixed */, times: [0, 0.8, 0.85, 0.9, 1] }}
                        style={{ originY: 0 }}
                      />
                    </g>

                    {/* Happy Open Smile */}
                    <motion.path 
                      d="M 90,95 Q 100,105 110,95 L 110,100 Q 100,110 90,100 Z"
                      fill="black"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: 0 /* fixed */ }}
                      style={{ originX: "100px", originY: "100px" }}
                    />
                    <path d="M 90,95 Q 100,105 110,95" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}

                {/* Sparkles */}
                {stage >= 4 && (
                  <g>
                    {[0, 1, 2, 3].map(i => (
                      <motion.path
                        key={`sparkle-${i}`}
                        d="M 0,-4 L 1,0 L 4,1 L 1,2 L 0,6 L -1,2 L -4,1 L -1,0 Z"
                        fill="#FFD54F"
                        initial={{ x: 100 + (i % 2 === 0 ? -40 : 40), y: 40 + i * 15, scale: 0 }}
                        animate={{ 
                          scale: [0, 1, 0],
                          y: [40 + i * 15, 20 + i * 15]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: 0 /* fixed */, 
                          delay: i * 0.5,
                          ease: "easeOut" 
                        }}
                      />
                    ))}
                  </g>
                )}
              </motion.g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderDistressedRose = () => {
    const roseColors = {
      petal: "#C62828",
      petalDark: "#8E0000",
      leaf: "#81C784",
      leafDark: "#2E7D32",
      stem: "#689F38",
      pot: "#4FC3F7",
      potDark: "#0288D1",
      caterpillar: "#FFD54F",
      soil: "#5D4037",
    };

    return (
      <g onClick={handlePlantClick} style={{ cursor: 'pointer' }}>
        {/* Background Blob */}
        <path d="M 40,50 Q 0,100 40,150 Q 100,180 160,150 Q 200,100 160,50 Q 100,20 40,50" fill="#FFF3E0" opacity="0.5" />

        {/* Shadow */}
        <ellipse cx="110" cy="195" rx="55" ry="10" fill="black" opacity="0.1" />

        {/* Pot - Stationary */}
        <g>
          {/* Main Pot Body */}
          <path d="M 75,145 L 125,145 L 120,185 L 80,185 Z" fill={roseColors.pot} stroke="#01579B" strokeWidth="2" />
          {/* Pot Rim */}
          <rect x="70" y="135" width="60" height="15" rx="2" fill={roseColors.potDark} stroke="#01579B" strokeWidth="2" />
          {/* Soil */}
          <path d="M 75,145 Q 100,140 125,145" fill="none" stroke={roseColors.soil} strokeWidth="4" />
          <circle cx="85" cy="142" r="1.5" fill={roseColors.soil} />
          <circle cx="100" cy="143" r="2" fill={roseColors.soil} />
          <circle cx="115" cy="142" r="1.5" fill={roseColors.soil} />
        </g>

        {stage >= 1 && (
          <g>
            {/* Stem - Stationary */}
            <path d="M 100,135 Q 90,100 100,70" stroke={roseColors.stem} strokeWidth="6" fill="none" strokeLinecap="round" />

            {/* Leaves with Dynamic Bite Marks */}
            <motion.g>
              {/* Left Leaf */}
              <g transform="translate(100, 115)">
                <path d="M 0,0 Q -40,-10 -60,20 Q -40,30 0,0" fill={roseColors.leaf} stroke="#1B5E20" strokeWidth="2" />
                {/* Bite Mark 1 - Left */}
                <motion.path 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 4, repeat: 0 /* fixed */ }}
                  d="M -45,5 Q -48,0 -52,5 Q -55,10 -52,15" fill="#FFF3E0" stroke="#1B5E20" strokeWidth="1" 
                />
              </g>

              {/* Right Leaf */}
              <g transform="translate(100, 100)">
                <path d="M 0,0 Q 40,-10 60,20 Q 40,30 0,0" fill={roseColors.leaf} stroke="#1B5E20" strokeWidth="2" />
                {/* Bite Mark 2 - Right */}
                <motion.path 
                  animate={{ scale: [1, 1.3, 1] }} 
                  transition={{ duration: 5, repeat: 0 /* fixed */ }}
                  d="M 40,0 Q 45,-5 50,0 Q 55,5 50,10" fill="#FFF3E0" stroke="#1B5E20" strokeWidth="1" 
                />
              </g>
            </motion.g>

            {/* Rose Head */}
            {stage >= 2 && (
              <g transform="translate(100, 60)">
                {/* Petals */}
                <path d="M -30,-10 C -40,-50 0,-60 0,-20 C 0,-60 40,-50 30,-10 C 30,20 0,40 -30,-10" fill={roseColors.petal} stroke="#B71C1C" strokeWidth="3" />
                <path d="M -15,-20 C -20,-40 0,-40 0,-20" fill={roseColors.petalDark} opacity="0.3" />
                <path d="M 15,-20 C 20,-40 0,-40 0,-20" fill={roseColors.petalDark} opacity="0.3" />
                
                {/* Yellow Spears/Antennae on top */}
                <line x1="-15" y1="-45" x2="-25" y2="-65" stroke="black" strokeWidth="1.5" />
                <circle cx="-25" cy="-65" r="4" fill="#FFB300" stroke="black" strokeWidth="1" />
                <line x1="0" y1="-50" x2="0" y2="-75" stroke="black" strokeWidth="1.5" />
                <circle cx="0" cy="-75" r="4" fill="#FFB300" stroke="black" strokeWidth="1" />
                <line x1="15" y1="-45" x2="25" y2="-65" stroke="black" strokeWidth="1.5" />
                <circle cx="25" cy="-65" r="4" fill="#FFB300" stroke="black" strokeWidth="1" />

                {/* Face */}
                {stage >= 3 && (
                  <g>
                    {/* Blushing */}
                    <circle cx="-15" cy="15" r="6" fill="#EF9A9A" opacity="0.4" />
                    <circle cx="15" cy="15" r="6" fill="#EF9A9A" opacity="0.4" />

                    {/* Dizzy Swirl Eyes */}
                    <g transform="translate(-15, 5)">
                      <motion.path 
                        d="M -5,0 A 5,5 0 1,1 5,0 A 5,5 0 1,1 -5,0 M -3,0 A 3,3 0 1,0 3,0" 
                        stroke="black" fill="none" strokeWidth="1"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: 0 /* fixed */, ease: "linear" }}
                      />
                    </g>
                    <g transform="translate(15, 5)">
                      <motion.path 
                        d="M -5,0 A 5,5 0 1,1 5,0 A 5,5 0 1,1 -5,0 M -3,0 A 3,3 0 1,0 3,0" 
                        stroke="black" fill="none" strokeWidth="1"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: 0 /* fixed */, ease: "linear" }}
                      />
                    </g>

                    {/* Nervous Mouth */}
                    <path d="M -5,22 Q 0,18 5,22" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </g>
                )}

                {/* Caterpillar on Head */}
                <g transform="translate(20, -35) rotate(30)">
                  <motion.path 
                    animate={{ x: [0, 1, 0], scaleY: [1, 1.1, 1] }}
                    transition={{ duration: 0.3, repeat: 0 /* fixed */ }}
                    d="M 0,0 Q 5,-10 10,0 Q 15,-10 20,0" stroke={roseColors.caterpillar} strokeWidth="6" fill="none" strokeLinecap="round" 
                  />
                  <circle cx="20" cy="0" r="1" fill="black" />
                </g>

                {/* Dust Cloud */}
                {stage >= 4 && (
                  <g>
                    {[0, 1, 2].map(i => (
                      <motion.circle
                        key={`dust-${i}`}
                        r="2"
                        fill="#EEEEEE"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 0.6, 0],
                          scale: [0, 1.5, 0],
                          x: [0, (i - 1) * 20],
                          y: [0, -30]
                        }}
                        transition={{ duration: 2, repeat: 0 /* fixed */, delay: i * 0.6 }}
                      />
                    ))}
                  </g>
                )}
              </g>
            )}

            {/* Caterpillars on Leaves */}
            {stage >= 3 && (
              <g>
                {/* Left Leaf Caterpillar */}
                <g transform="translate(50, 115) rotate(-20)">
                  <motion.path 
                    animate={{ x: [0, 0.5, 0], scaleY: [1, 1.2, 1] }}
                    transition={{ duration: 0.25, repeat: 0 /* fixed */ }}
                    d="M 0,0 Q 5,-8 10,0 Q 15,-8 20,0" stroke={roseColors.caterpillar} strokeWidth="5" fill="none" strokeLinecap="round" 
                  />
                  <circle cx="20" cy="0" r="1" fill="black" />
                </g>

                {/* Right Leaf Caterpillar */}
                <g transform="translate(130, 105) rotate(10)">
                  <motion.path 
                    animate={{ x: [0, -0.5, 0], scaleY: [1, 1.15, 1] }}
                    transition={{ duration: 0.35, repeat: 0 /* fixed */, delay: 0.1 }}
                    d="M 0,0 Q 5,-8 10,0 Q 15,-8 20,0" stroke={roseColors.caterpillar} strokeWidth="5" fill="none" strokeLinecap="round" 
                  />
                  <circle cx="20" cy="0" r="1" fill="black" />
                </g>
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderSlimeBerry = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <path d="M 60,140 Q 60,185 75,195 L 125,195 Q 140,185 140,140 Z" fill="#334155" stroke="black" strokeWidth="5" />
            <path d="M 50,135 Q 50,125 100,125 Q 150,125 150,135 Q 150,145 100,145 Q 50,145 50,135" fill="#475569" stroke="black" strokeWidth="3" />
            <ellipse cx="100" cy="135" rx="40" ry="8" fill="#1e293b" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Glowing Slime Stem */}
            {stage >= 1 && (
              <motion.path
                d="M 100,135 Q 90,110 110,85 T 100,50"
                stroke={colors.primary}
                strokeWidth={5 + stage}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* Swirling Slime Leaves */}
            {stage >= 2 && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transform="translate(100, 105)">
                <circle cx="-15" cy="-5" r="10" fill={colors.accent} opacity="0.8" />
                <path d="M 0,0 C -5,-15 -20,-15 -15,-5 Z" fill={colors.primary} stroke="black" strokeWidth="2" />
              </motion.g>
            )}
            {stage >= 3 && (
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transform="translate(100, 85)">
                <circle cx="15" cy="-5" r="12" fill={colors.accent} opacity="0.8" />
                <path d="M 0,0 C 5,-15 20,-15 15,-5 Z" fill={colors.primary} stroke="black" strokeWidth="2" />
              </motion.g>
            )}
            {/* Giant Squishy Slimeberry Character on Top! */}
            {stage >= 4 && (
              <motion.g
                initial={{ scale: 0, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                transform="translate(100, 50)"
              >
                {/* Slime Berry Main Sphere */}
                <ellipse cx="0" cy="-10" rx="22" ry="18" fill="url(#slimeGrad)" stroke="black" strokeWidth="3" />
                {/* Face feature */}
                <circle cx="-8" cy="-12" r="2.5" fill="black" />
                <circle cx="8" cy="-12" r="2.5" fill="black" />
                <circle cx="-9" cy="-14" r="1" fill="white" />
                <circle cx="7" cy="-14" r="1" fill="white" />
                <path d="M -4,-6 Q 0,-2 4,-6" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                {/* Blushing */}
                <ellipse cx="-13" cy="-8" rx="3.5" ry="1.5" fill="#f43f5e" opacity="0.4" />
                <ellipse cx="13" cy="-8" rx="3.5" ry="1.5" fill="#f43f5e" opacity="0.4" />
                
                {stage >= 5 && (
                  <motion.path
                    d="M 0,-28 L -5,-35 L 0,-42 L 5,-35 Z"
                    fill="#fbbf24"
                    stroke="#d97706"
                    strokeWidth="1.5"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.g>
            )}
            <defs>
              <radialGradient id="slimeGrad" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor={colors.accent} />
                <stop offset="100%" stopColor={colors.secondary} />
              </radialGradient>
            </defs>
          </g>
        )}
      </g>
    );
  };

  const renderSolarFlarePea = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <path d="M 65,140 L 75,195 L 125,195 L 135,140 Z" fill="#2d0f02" stroke="black" strokeWidth="5" />
            <rect x="50" y="130" width="100" height="12" rx="4" fill="#3c1401" stroke="black" strokeWidth="3" />
            <ellipse cx="100" cy="135" rx="35" ry="6" fill="#120400" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Fiery Solar Vines */}
            {stage >= 1 && (
              <motion.path
                d="M 100,135 C 120,110 80,85 100,45"
                stroke={colors.primary}
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* Flame-like leaves */}
            {stage >= 2 && (
              <g transform="translate(100, 100)">
                <path d="M 0,0 Q -25,-10 -20,-25 Q -10,-15 0,0" fill={colors.secondary} stroke="black" strokeWidth="2" />
              </g>
            )}
            {stage >= 3 && (
              <g transform="translate(100, 75)">
                <path d="M 0,0 Q 25,-10 20,-25 Q 10,-15 0,0" fill={colors.primary} stroke="black" strokeWidth="2" />
              </g>
            )}
            {/* Lava Flare Pea Pod */}
            {stage >= 4 && (
              <motion.g
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring" }}
                transform="translate(100, 45)"
              >
                {/* Outer Pod */}
                <path d="M -15,-5 C -40,-35 40,-35 15,-5 C 5,5 -5,5 -15,-5 Z" fill={colors.secondary} stroke="black" strokeWidth="2.5" />
                {/* Golden glowing peas inside */}
                <circle cx="-8" cy="-14" r="7.5" fill={colors.accent} stroke="black" strokeWidth="1.5" />
                <circle cx="8" cy="-14" r="7.5" fill={colors.accent} stroke="black" strokeWidth="1.5" />
                {stage >= 5 && (
                  <motion.g animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                    <circle cx="0" cy="-14" r="28" fill="none" stroke={colors.accent} strokeWidth="2.5" strokeDasharray="4 6" />
                  </motion.g>
                )}
              </motion.g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderMoonSprout = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <rect x="55" y="140" width="90" height="55" rx="10" fill="#1e1e38" stroke="black" strokeWidth="5" />
            <ellipse cx="100" cy="140" rx="45" ry="8" fill="#111126" stroke="black" strokeWidth="3" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Cosmic Stem */}
            {stage >= 1 && (
              <motion.path
                d="M 100,135 Q 115,100 90,70 T 100,35"
                stroke={colors.primary}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* Crescent Moon Leaves */}
            {stage >= 2 && (
              <g transform="translate(90, 95) rotate(-35)">
                <path d="M 0,-15 A 15,15 0 0,0 0,15 A 10,12 0 0,1 0,-15" fill={colors.accent} stroke="black" strokeWidth="1.5" />
              </g>
            )}
            {stage >= 3 && (
              <g transform="translate(110, 75) rotate(35)">
                <path d="M 0,-15 A 15,15 0 0,1 0,15 A 10,12 0 0,0 0,-15" fill={colors.primary} stroke="black" strokeWidth="1.5" />
              </g>
            )}
            {/* Magical Glowing Moon on Top */}
            {stage >= 4 && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transform="translate(100, 35)"
              >
                <circle cx="0" cy="-12" r="20" fill="url(#moonGrad)" stroke="black" strokeWidth="2.5" />
                {/* Crates and texture details */}
                <circle cx="-6" cy="-18" r="4.5" fill={colors.primary} opacity="0.3" />
                <circle cx="8" cy="-8" r="3" fill={colors.primary} opacity="0.3" />
                <circle cx="-5" cy="-4" r="3.5" fill={colors.primary} opacity="0.3" />
                
                {stage >= 5 && (
                  <motion.g animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}>
                    <circle cx="0" cy="-12" r="35" fill={colors.accent} opacity="0.15" />
                  </motion.g>
                )}
              </motion.g>
            )}
            <defs>
              <radialGradient id="moonGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor={colors.accent} />
                <stop offset="100%" stopColor={colors.secondary} />
              </radialGradient>
            </defs>
          </g>
        )}
      </g>
    );
  };

  const renderStarSilkLeaf = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <path d="M 52,142 C 55,190 70,195 100,195 C 130,195 145,190 148,142 Z" fill="#311042" stroke="black" strokeWidth="5" />
            <ellipse cx="100" cy="142" rx="48" ry="10" fill="#1c0528" stroke="black" strokeWidth="3" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Streaming Star Grass Vines */}
            {stage >= 1 && (
              <g>
                <motion.path d="M 100,140 Q 75,90 40,75" stroke={colors.primary} strokeWidth={4} strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                <motion.path d="M 100,140 Q 125,90 160,75" stroke={colors.primary} strokeWidth={4} strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
              </g>
            )}
            {stage >= 2 && (
              <g>
                <motion.path d="M 100,140 Q 82,75 70,50" stroke={colors.secondary} strokeWidth={4} strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                <motion.path d="M 100,140 Q 118,75 130,50" stroke={colors.secondary} strokeWidth={4} strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
              </g>
            )}
            {stage >= 3 && (
              <motion.path d="M 100,140 Q 100,65 100,30" stroke={colors.accent} strokeWidth={5} strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            )}
            {/* Shimmering Stars on Leaf Tips */}
            {stage >= 4 && (
              <g>
                <motion.polygon points="40,75 43,80 49,81 44,86 46,92 40,88 34,92 36,86 31,81 37,80" fill={colors.accent} stroke="black" strokeWidth="1" animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2 }} />
                <motion.polygon points="160,75 163,80 169,81 164,86 166,92 160,88 154,92 156,86 151,81 157,80" fill={colors.accent} stroke="black" strokeWidth="1" animate={{ scale: [1.2, 0.8, 1.2] }} transition={{ repeat: Infinity, duration: 2.2 }} />
                
                {stage >= 5 && (
                  <motion.g transform="translate(100, 30)" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}>
                    <polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" fill="#fef08a" stroke="black" strokeWidth="2.5" />
                  </motion.g>
                )}
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderDreamShroom = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <path d="M 50,150 Q 80,205 100,205 Q 120,205 150,150 Z" fill="#1f2937" stroke="black" strokeWidth="5" />
            <rect x="40" y="140" width="120" height="12" rx="6" fill="#374151" stroke="black" strokeWidth="3.5" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Magic Mushroom Stem */}
            {stage >= 1 && (
              <motion.path
                d="M 100,145 Q 98,110 100,80"
                stroke="#ffedd5"
                strokeWidth={14 + stage * 2}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* Mini sub-mushrooms */}
            {stage >= 2 && (
              <g transform="translate(85, 135) scale(0.65)">
                <path d="M 0,0 L 0,-25" stroke="#ffedd5" strokeWidth="8" strokeLinecap="round" />
                <path d="M -15,-20 Q 0,-38 15,-20 Z" fill={colors.primary} stroke="black" strokeWidth="2" />
              </g>
            )}
            {stage >= 3 && (
              <g transform="translate(115, 135) scale(0.55) rotate(15)">
                <path d="M 0,0 L 0,-25" stroke="#ffedd5" strokeWidth="8" strokeLinecap="round" />
                <path d="M -15,-20 Q 0,-38 15,-20 Z" fill={colors.secondary} stroke="black" strokeWidth="2" />
              </g>
            )}
            {/* Magical Glowing Giant Cap */}
            {stage >= 4 && (
              <motion.g
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring" }}
                transform="translate(100, 80)"
              >
                {/* Cap Back Outline */}
                <path d="M -35,-5 Q 0,-45 35,-5 C 25,-2 15,0 0,0 C -15,0 -25,-2 -35,-5 Z" fill={colors.primary} stroke="black" strokeWidth="3" />
                {/* Cap spots */}
                <circle cx="-15" cy="-22" r="5" fill="white" opacity="0.9" />
                <circle cx="15" cy="-18" r="4" fill="white" opacity="0.9" />
                <circle cx="0" cy="-30" r="3.5" fill="white" opacity="0.9" />
                
                {stage >= 5 && (
                  <motion.g animate={{ y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 2.2 }}>
                    <path d="M -42,3 Q 0,8 42,3" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.75" />
                    {/* Glowing Sparkles */}
                    <circle cx="-25" cy="15" r="2" fill={colors.accent} />
                    <circle cx="0" cy="22" r="2.5" fill="white" />
                    <circle cx="28" cy="13" r="1.8" fill={colors.accent} />
                  </motion.g>
                )}
              </motion.g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderLuckLotus = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <rect x="45" y="160" width="110" height="30" rx="6" fill="#0f172a" stroke="black" strokeWidth="5" />
            <rect x="40" y="155" width="120" height="5" rx="2.5" fill="#1e293b" stroke="black" strokeWidth="2.5" />
            <ellipse cx="100" cy="155" rx="55" ry="5" fill="#020617" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Emerald Lotus Pad base */}
            {stage >= 1 && (
              <motion.ellipse
                cx="100" cy="150" rx="45" ry="9"
                fill="#047857"
                stroke="black"
                strokeWidth="2.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
            {/* Glowing Lotus stalk */}
            {stage >= 2 && (
              <motion.line
                x1="100" y1="150" x2="100" y2="105"
                stroke="#10b981"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ y2: 150 }}
                animate={{ y2: 105 }}
              />
            )}
            {/* First level Petals */}
            {stage >= 3 && (
              <g transform="translate(100, 105)">
                <path d="M -25,0 C -38,-25 -10,-35 0,-15 C 10,-35 38,-25 25,0 Z" fill={colors.secondary} stroke="black" strokeWidth="2" />
              </g>
            )}
            {/* Gorgeous multilayered blossomed lotus */}
            {stage >= 4 && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transform="translate(100, 105)"
              >
                {/* Foreground bright petals */}
                <path d="M -18,0 C -30,-20 -5,-30 0,-10 C 5,-30 30,-20 18,0 Z" fill={colors.primary} stroke="black" strokeWidth="2" />
                {/* Lotus Core */}
                <circle cx="0" cy="-5" r="6" fill="#fbbf24" stroke="black" strokeWidth="1.5" />
                <circle cx="0" cy="-5" r="3" fill="#f59e0b" />
                
                {stage >= 5 && (
                  <motion.g animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 2.8 }}>
                    <path d="M -30,-5 Q 0,-40 30,-5" fill="none" stroke={colors.accent} strokeWidth="2" opacity="0.65" />
                  </motion.g>
                )}
              </motion.g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderLuckFern = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <path d="M 60,140 Q 55,185 75,195 L 125,195 Q 145,185 140,140 Z" fill="#201c18" stroke="black" strokeWidth="5" />
            <ellipse cx="100" cy="140" rx="42" ry="7" fill="#151210" stroke="#201c18" strokeWidth="3" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Arching Frond Stem */}
            {stage >= 1 && (
              <motion.path
                d="M 100,140 Q 65,95 85,40"
                stroke={colors.secondary}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* pinnate frond leaves */}
            {stage >= 2 && (
              <g>
                <path d="M 85,120 Q 55,115 72,105 Q 85,112 85,120" fill={colors.primary} stroke="black" strokeWidth="1.5" />
                <path d="M 82,100 Q 52,95 69,85 Q 80,92 82,100" fill={colors.primary} stroke="black" strokeWidth="1.5" />
              </g>
            )}
            {stage >= 3 && (
              <g>
                <path d="M 80,80 Q 50,72 67,62 Q 78,72 80,80" fill={colors.accent} stroke="black" strokeWidth="1.5" />
                <path d="M 81,62 Q 55,52 70,45 Q 80,52 81,62" fill={colors.accent} stroke="black" strokeWidth="1.5" />
              </g>
            )}
            {/* Gorgeous full symmetrical secondary frond */}
            {stage >= 4 && (
              <motion.path
                d="M 100,140 Q 135,95 115,40"
                stroke={colors.primary}
                strokeWidth={4.5}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {stage >= 4 && (
              <g>
                <path d="M 115,120 Q 145,115 128,105 Q 115,112 115,120" fill={colors.secondary} stroke="black" strokeWidth="1.5" />
                <path d="M 118,100 Q 148,95 131,85 Q 120,92 118,100" fill={colors.secondary} stroke="black" strokeWidth="1.5" />
                <path d="M 120,80 Q 150,72 133,62 Q 122,72 120,80" fill={colors.accent} stroke="black" strokeWidth="1.5" />
              </g>
            )}
            {stage >= 5 && (
              <g>
                <circle cx="85" cy="40" r="4.5" fill="#fef08a" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle cx="115" cy="40" r="4.5" fill="#fef08a" className="animate-ping" style={{ animationDuration: '3.5s' }} />
              </g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderLuckClover = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <path d="M 60,140 Q 60,185 75,195 L 125,195 Q 140,185 140,140 Z" fill="#92400e" stroke="black" strokeWidth="5" />
            <ellipse cx="100" cy="140" rx="42" ry="7" fill="#78350f" stroke="black" strokeWidth="3" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Golden spiraling stalk */}
            {stage >= 1 && (
              <motion.path
                d="M 100,140 Q 112,110 88,92 T 100,55"
                stroke={colors.primary}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* Symmetrical heart leaf 1 & 2 */}
            {stage >= 2 && (
              <g transform="translate(100, 55)">
                <path d="M 0,0 C -25,-10 -25,-30 0,-15" fill={colors.secondary} stroke="black" strokeWidth="2" />
                <path d="M 0,0 C 25,-10 25,-30 0,-15" fill={colors.secondary} stroke="black" strokeWidth="2" />
              </g>
            )}
            {/* Third leaf */}
            {stage >= 3 && (
              <g transform="translate(100, 55)">
                <path d="M 0,0 C -10,-25 -30,-25 -15,0" fill={colors.primary} stroke="black" strokeWidth="2" />
              </g>
            )}
            {/* Legendary Fourth gold Leaf! */}
            {stage >= 4 && (
              <g transform="translate(100, 55)">
                <path d="M 0,0 C 10,-25 30,-25 15,0" fill={colors.accent} stroke="black" strokeWidth="2" />
              </g>
            )}
            {stage >= 5 && (
              <motion.g animate={{ y: [-2, 2, -2], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} transform="translate(100, 30)">
                {/* Gold sparkle halos */}
                <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#fbbf24" stroke="black" strokeWidth="1" />
              </motion.g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderLuckOrchid = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <path d="M 55,145 Q 60,195 80,195 L 120,195 Q 140,195 145,145 Z" fill="#1e1e24" stroke="black" strokeWidth="5" />
            <ellipse cx="100" cy="145" rx="45" ry="8" fill="#0c0c0e" stroke="black" strokeWidth="3" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Glass-like violet vine */}
            {stage >= 1 && (
              <motion.path
                d="M 100,140 Q 115,105 85,80 T 105,40"
                stroke={colors.secondary}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* Orchid leaves */}
            {stage >= 2 && (
              <g transform="translate(90, 110) rotate(-15)">
                <ellipse cx="0" cy="0" rx="18" ry="6" fill={colors.primary} stroke="black" strokeWidth="1.5" />
              </g>
            )}
            {stage >= 3 && (
              <g transform="translate(110, 95) rotate(15)">
                <ellipse cx="0" cy="0" rx="18" ry="6" fill={colors.primary} stroke="black" strokeWidth="1.5" />
              </g>
            )}
            {/* Intricate Celestial Lavender Orchid Flower bloom */}
            {stage >= 4 && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transform="translate(105, 40)"
              >
                {/* Five Petals */}
                <path d="M 0,0 C -15,-25 -30,-5 0,-5" fill={colors.accent} stroke="black" strokeWidth="1.5" />
                <path d="M 0,0 C 15,-25 30,-5 0,-5" fill={colors.accent} stroke="black" strokeWidth="1.5" />
                <path d="M 0,0 C -25,12 0,28 0,0" fill={colors.primary} stroke="black" strokeWidth="1.5" />
                <path d="M 0,0 C 25,12 0,28 0,0" fill={colors.primary} stroke="black" strokeWidth="1.5" />
                {/* Lip/Center */}
                <circle cx="0" cy="-2" r="5.5" fill="#f472b6" stroke="black" strokeWidth="1.5" />
                <circle cx="0" cy="-2" r="2.5" fill="#e11d48" />
                
                {stage >= 5 && (
                  <motion.g animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    <circle cx="0" cy="-2" r="20" fill="none" stroke={colors.accent} strokeWidth="2.5" strokeDasharray="3 5" />
                  </motion.g>
                )}
              </motion.g>
            )}
          </g>
        )}
      </g>
    );
  };

  const renderPremiumCactus = () => {
    return (
      <g className="run-growth">
        <defs>
          <linearGradient id="potLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF8A65"/><stop offset="100%" stopColor="#E64A19"/></linearGradient>
          <linearGradient id="potDark" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#E64A19"/><stop offset="100%" stopColor="#BF360C"/></linearGradient>
          
          <linearGradient id="cactusLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4CAF50"/><stop offset="100%" stopColor="#388E3C"/></linearGradient>
          <linearGradient id="cactusDark" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#388E3C"/><stop offset="100%" stopColor="#2E7D32"/></linearGradient>
          
          <linearGradient id="flowerGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#FF4081"/><stop offset="100%" stopColor="#FF80AB"/></linearGradient>
        </defs>

        {/* Sparkle Layer */}
        {stage >= 5 && (
          <motion.g 
            className="bloom-sparkle" 
            fill="#FF80AB"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1 }}
          >
            <circle cx="100" cy="25" r="4"/><circle cx="70" cy="45" r="3"/><circle cx="130" cy="45" r="3"/>
            <circle cx="80" cy="20" r="2.5"/><circle cx="120" cy="20" r="2.5"/>
          </motion.g>
        )}

        <g stroke="#0F172A" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Left Branch Arm Path Outline */}
          {stage >= 2 && (
            <motion.path 
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="cactus-arm-left" 
              d="M75,130 C50,130 45,100 45,90 C45,75 60,75 60,90 C60,105 70,110 75,110" 
              fill="none"
            />
          )}
          
          {/* Right Branch Arm Path Outline */}
          {stage >= 3 && (
            <motion.path 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="cactus-arm-right" 
              d="M125,105 C130,105 140,100 140,85 C140,70 155,70 155,85 C155,100 150,120 125,120" 
              fill="none"
            />
          )}

          {/* Main Vertical Spine Trunk Outline */}
          {stage >= 1 && (
            <motion.path 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="cactus-trunk" 
              d="M75,175 C75,100 72,50 100,50 C128,50 125,100 125,175 Z" 
              fill="none"
            />
          )}

          {/* Top Flower Petal Structure Outline */}
          {stage >= 4 && (
            <motion.g 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="cactus-flower"
            >
              <path d="M100,50 C85,45 80,25 100,25 C120,25 115,45 100,50 Z" fill="none" />
              <path d="M100,50 C90,40 100,15 100,15 C100,15 110,40 100,50 Z" fill="none" />
            </motion.g>
          )}

          {/* Static Potted Base Outline Geometry */}
          <path d="M60,175 L140,175 L130,230 L70,230 Z" fill="none" />
          <rect x="52" y="162" width="96" height="14" rx="4" fill="none" />
          <ellipse cx="100" cy="164" rx="42" ry="5" fill="none" />
        </g>

        {/* COLOR FILL REVENUE CORE LAYER */}
        
        {/* Left Arm Color Fill Modules */}
        {stage >= 2 && (
          <motion.g 
            initial={{ scale: 0, rotate: 20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <path d="M75,130 C50,130 45,100 45,90 C45,75 60,75 60,90 C60,105 70,110 75,110" fill="url(#cactusLight)" />
            <path d="M60,90 C60,105 70,110 75,110 L75,130 C58,130 57,110 57,90 Z" fill="url(#cactusDark)" />
          </motion.g>
        )}

        {/* Right Arm Color Fill Modules */}
        {stage >= 3 && (
          <motion.g 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <path d="M125,105 C130,105 140,100 140,85 C140,70 155,70 155,85 C155,100 150,120 125,120" fill="url(#cactusDark)" />
          </motion.g>
        )}

        {/* Main Trunk Split-Shading Elements */}
        {stage >= 1 && (
          <motion.g 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <path d="M100,52 C76,52 77,100 77,173 L100,173 Z" fill="url(#cactusLight)" />
            <path d="M100,52 C124,52 123,100 123,173 L100,173 Z" fill="url(#cactusDark)" />
            
            {/* Clean Cartoon Ridge Rib Lines */}
            <path d="M88,65 C86,100 88,140 90,173" fill="none" stroke="#388E3C" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M112,65 C114,100 112,140 110,173" fill="none" stroke="#2E7D32" strokeWidth="3.5" strokeLinecap="round" />
          </motion.g>
        )}

        {/* Flower Shading Core Overlay */}
        {stage >= 4 && (
          <motion.g 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            fill="url(#flowerGrad)"
          >
            <path d="M100,50 C85,45 80,25 100,25 C120,25 115,45 100,50 Z" />
            <path d="M100,50 C90,40 100,15 100,15 C100,15 110,40 100,50 Z" opacity="0.9"/>
            <circle cx="100" cy="40" r="3.5" fill="#FFEB3B" />
          </motion.g>
        )}

        {/* Terracotta Planter Shading Core Array */}
        <ellipse cx="100" cy="164" rx="40" ry="4" fill="#5C4033" />
        <path d="M54,164 L100,164 L100,174 L54,174 Z" fill="url(#potLight)" />
        <path d="M100,164 L146,164 L146,174 L100,174 Z" fill="url(#potDark)" />
        <path d="M100,177 L62,177 L71,228 L100,228 Z" fill="url(#potLight)" />
        <path d="M100,177 L138,177 L129,228 L100,228 Z" fill="url(#potDark)" />
      </g>
    );
  };

  const renderLuckCactus = () => {
    return (
      <g>
        {/* Pot */}
        {renderPotWrapper(
          <g>
            <rect x="52" y="145" width="96" height="50" rx="12" fill="#7f1d1d" stroke="black" strokeWidth="5" />
            <ellipse cx="100" cy="145" rx="48" ry="7" fill="#450a0a" stroke="black" strokeWidth="3" />
          </g>
        )}
        {!isDead && (
          <g>
            {/* Neon Green Cactus Base */}
            {stage >= 1 && (
              <motion.rect
                x="88" y="70" width="24" height="75" rx="12"
                fill={colors.primary}
                stroke="black"
                strokeWidth={3}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                style={{ transformOrigin: "bottom" }}
              />
            )}
            {/* Glowing Pink Needles & Details */}
            {stage >= 1 && (
              <g stroke={colors.accent} strokeWidth="1.5">
                <line x1="88" y1="120" x2="80" y2="120" />
                <line x1="112" y1="110" x2="120" y2="110" />
                <line x1="88" y1="90" x2="80" y2="85" />
                <line x1="112" y1="85" x2="120" y2="90" />
              </g>
            )}
            {/* Left branch arm */}
            {stage >= 2 && (
              <motion.path
                d="M 88,100 H 70 V 80"
                stroke={colors.secondary}
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* Right branch arm */}
            {stage >= 3 && (
              <motion.path
                d="M 112,90 H 130 V 70"
                stroke={colors.secondary}
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            )}
            {/* Retro wave giant bloom on top */}
            {stage >= 4 && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transform="translate(100, 68)"
              >
                {/* Hot pink starburst bloom */}
                <polygon points="0,-15 4,-5 14,-10 8,0 15,10 5,6 0,15 -5,6 -15,10 -8,0 -14,-10 -4,-5" fill={colors.accent} stroke="black" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3.5" fill="#fef08a" stroke="black" strokeWidth="1" />
              </motion.g>
            )}
            {stage >= 5 && (
              <motion.g animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                <rect x="40" y="50" width="120" height="2" fill={colors.accent} />
              </motion.g>
            )}
          </g>
        )}
      </g>
    );
  };

  const getEcosystemRenderer = () => {
    switch (type) {
      case 'slime-berry': return renderSlimeBerry();
      case 'solar-flare-pea': return renderSolarFlarePea();
      case 'moon-sprout': return renderMoonSprout();
      case 'star-silk-leaf': return renderStarSilkLeaf();
      case 'dream-shroom': return renderDreamShroom();
      case 'luck-lotus': return renderLuckLotus();
      case 'luck-fern': return renderLuckFern();
      case 'luck-clover': return renderLuckClover();
      case 'luck-orchid': return renderLuckOrchid();
      case 'luck-cactus': return renderLuckCactus();
      case 'premium-cactus': return renderPremiumCactus();
      case 'zen': return renderZen();
      case 'desert': return renderDesert();
      case 'tropical': return renderTropical();
      case 'forest': return renderForest();
      case 'meadow': return renderMeadow();
      case 'crystal': return renderCrystal();
      case 'volcano': return renderVolcano();
      case 'sprout': return renderSprout();
      case 'boredFlower': return renderBoredFlower();
      case 'mourningSprout': return renderMourningSprout();
      case 'breezeTulip': return renderBreezeTulip();
      case 'happyTulip': return renderHappyTulip();
      case 'distressedRose': return renderDistressedRose();
      default: return renderZen();
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.svg 
        viewBox="0 0 200 200" 
        className={`w-72 h-72 overflow-visible drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)] ${className}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          ...(isShaking ? { x: [-2, 2, -2, 2, 0] } : (isDead ? { y: 2, scale: 0.98 } : {}))
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        onClick={handlePlantClick}
        style={{
          filter: activeColor ? `drop-shadow(0 0 15px ${plantColors[activeColor]}88)` : 'none'
        }}
      >
        <defs>
          <radialGradient id="soilGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="100%" stopColor="#3E2723" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ground/Shadow */}
        <ellipse cx="100" cy="190" rx="50" ry="10" fill="rgba(0,0,0,0.05)" />

        {getEcosystemRenderer()}

      {stage === 0 && !isDead && (
        <g id="animated-seed" className="pointer-events-none">
          {/* Ambient Outer Energy Halo */}
          <motion.circle 
            cx="100" cy="142" r="16"
            fill="none" stroke={colors.accent || '#38bdf8'} strokeWidth="1.5" strokeDasharray="3 4"
            animate={{ rotate: 360, scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          />
          {/* Level 0 Magic Seed */}
          <motion.g
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: [0, -4, 0] }}
            transition={{
              scale: { type: 'spring', stiffness: 200 },
              y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
            }}
          >
            {/* Pulsing Core */}
            <ellipse cx="100" cy="142" rx="8" ry="12" fill={colors.primary || '#D7CCC8'} stroke="black" strokeWidth="2.5" />
            <ellipse cx="98" cy="138" rx="2.5" ry="4" fill={colors.accent || '#FFFFFF'} opacity="0.6" />
          </motion.g>
        </g>
      )}

      {/* Dead State Marker */}
      {isDead && (
        <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <text x="100" y="140" textAnchor="middle" fontSize="12" fill={colors.secondary} className="font-black tracking-tighter">🥀 DEAD</text>
        </motion.g>
      )}

      {/* Thirsty Effect */}
      {isThirsty && !isDead && (
        <motion.g animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
           <text x="100" y="50" textAnchor="middle" fontSize="14" fill="#607D8B" className="font-black opacity-30 tracking-[0.2em]">THIRSTY</text>
        </motion.g>
      )}

      {/* AUTO-MIST REALISTIC DROPS */}
      {activeEcosystemItemIds.includes('eco_sprinkler_01') && !isDead && (
        <g className="pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.path
              key={i}
              d="M 0,0 Q 3,-5 6,0 Q 3,10 0,0"
              fill="#7dd3fc"
              filter="url(#glow)"
              initial={{ x: 50 + Math.random() * 100, y: -20, opacity: 0, scale: 0 }}
              animate={{
                y: [0, 160 + Math.random() * 20],
                opacity: [0, 1, 0.8, 0],
                scale: [0.6, 1.2, 0.9],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 0.7 + Math.random() * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "circIn"
              }}
            />
          ))}
        </g>
      )}

      </motion.svg>

      {/* 2D CARTOON SUN (UV Halo Upgrade) */}
      {activeEcosystemItemIds.includes('eco_uv_lamp_01') && !isDead && (
        <SunRenderer />
      )}

      {/* ECOSYSTEM COMPANIONS - RENDERED OUTSIDE SVG IN RELATIVE DIV */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-72 h-72 overflow-visible">
          <AnimatePresence>
            {activeEcosystemItemIds.includes('eco_nanobees_01') && !isDead && (
              <NanoBees key="bees" isForestActive={isForestActive} />
            )}
            {activeEcosystemItemIds.includes('eco_butterfly_01') && !isDead && (
              <SpiritButterfly key="butterfly" isForestActive={isForestActive} />
            )}
          </AnimatePresence>

          {/* DRAGGABLE GARDENER DRONE */}
          {activeEcosystemItemIds.includes('eco_drone_01') && !isDead && (
            <GardenerDrone 
              mood={isThirsty ? 'working' : 'idle'} 
              targetPos={droneTargetPos}
              onPositionChange={onDronePositionChange}
              className="pointer-events-auto"
            />
          )}
        </div>
      </div>
    </div>
  );
};
