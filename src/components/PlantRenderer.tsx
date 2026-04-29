import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PlantType } from '../types';
import { useSound } from '../hooks/useSound';

interface PlantRendererProps {
  type: PlantType;
  stage: number;
  isThirsty: boolean;
  isDead: boolean;
}

export const PlantRenderer: React.FC<PlantRendererProps> = ({ type, stage, isThirsty, isDead }) => {
  const { play } = useSound();
  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isLunging, setIsLunging] = useState(false);

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
    if (isThirsty) return { primary: '#C5E1A5', secondary: '#9CCC65', accent: '#7CB342' };
    
    switch (type) {
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
      whileTap={{ scale: 0.9, rotate: [0, -5, 5, 0] }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Terracotta Pot */}
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
      </g>

      {!isDead && (
        <g id="plant-growth">
          {/* Seed State */}
          {stage === 0 && (
            <motion.circle 
              cx="100" cy="130" r="6" 
              fill="#D7CCC8" stroke="black" strokeWidth="2"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
            />
          )}

          {/* Stem */}
          {stage >= 1 && (
            <motion.path 
              d={`M 100,135 L 100,${135 - (stage * 15)}`} 
              stroke="#A5D6A7" 
              strokeWidth="6" 
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              className="plant-stem"
            />
          )}

          {/* Leaves - The Classic Heart Style */}
          {stage >= 2 && (
            <g transform={`translate(100, ${135 - (stage * 15)})`}>
              <motion.g 
                initial={{ scale: 0, rotate: -20 }} 
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Left Leaf */}
                <path 
                  d="M 0,0 C -15,-10 -25,-20 -20,-30 C -15,-35 -5,-30 0,-15 C 5,-30 15,-35 20,-30 C 25,-20 15,-10 0,0" 
                  fill={colors.primary} 
                  stroke="black" 
                  strokeWidth="3" 
                  transform="scale(0.8) translate(-15, -5) rotate(-30)"
                />
              </motion.g>
              {stage >= 3 && (
                <motion.g 
                  initial={{ scale: 0, rotate: 20 }} 
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* Right Leaf */}
                  <path 
                    d="M 0,0 C -15,-10 -25,-20 -20,-30 C -15,-35 -5,-30 0,-15 C 5,-30 15,-35 20,-30 C 25,-20 15,-10 0,0" 
                    fill={colors.primary} 
                    stroke="black" 
                    strokeWidth="3" 
                    transform="scale(0.8) translate(15, -5) rotate(30)"
                  />
                </motion.g>
              )}
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
      <rect x="50" y="160" width="100" height="30" rx="15" fill="#90A4AE" />
      <rect x="45" y="155" width="110" height="5" rx="2" fill="#78909C" />
      
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
              transition={{ repeat: Infinity, duration: 3 }}
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
        transition={{ repeat: Infinity, duration: 2 }}
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
                 transition={{ repeat: Infinity, duration: 1.5 }}
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
                 transition={{ repeat: Infinity, duration: 1 }}
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
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Eyelid (Blinking) */}
                    <motion.rect 
                      x="-13" y="-11" width="26" height="22" fill={flowerColors.face}
                      initial={{ scaleY: 0.5 }}
                      animate={{ scaleY: [0.5, 0.5, 1, 0.5, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }}
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
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Eyelid (Blinking) */}
                    <motion.rect 
                      x="-13" y="-11" width="26" height="22" fill={flowerColors.face}
                      initial={{ scaleY: 0.5 }}
                      animate={{ scaleY: [0.5, 0.5, 1, 0.5, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }}
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
                         animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                       />
                       <motion.path 
                         d="M 115,78 L 115,95" stroke={mourningColors.tear} strokeWidth="2" strokeLinecap="round"
                         animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}
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
                        repeat: Infinity, 
                        delay: i * 0.7,
                        ease: "easeIn" 
                      }}
                    />
                  ))}
                  {/* Puddles in sand */}
                  <motion.circle 
                    cx="85" cy="180" r="4" fill={mourningColors.tear} opacity="0.4"
                    animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <motion.circle 
                    cx="115" cy="182" r="4" fill={mourningColors.tear} opacity="0.4"
                    animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}
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
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
                        transition={{ duration: 5, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }}
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
                        transition={{ duration: 5, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }}
                        style={{ originY: 0 }}
                      />
                    </g>

                    {/* Happy Smile */}
                    <motion.path 
                      d="M -10,-35 Q 0,-25 10,-35" 
                      fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round"
                      animate={{ d: ["M -10,-35 Q 0,-25 10,-35", "M -15,-35 Q 0,-15 15,-35", "M -10,-35 Q 0,-25 10,-35"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
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
                transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "linear" }}
              />
            ))}

            {/* Sparkles in Wind */}
            {[0, 1, 2].map(i => (
              <motion.g
                key={`sparkle-${i}`}
                initial={{ x: -20, y: 50 + i * 30, opacity: 0 }}
                animate={{ x: 220, opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 1.5 }}
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
                  transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
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
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path 
              d="M 100,105 Q 130,90 120,130" 
              fill={happyColors.leaf} stroke="#1B5E20" strokeWidth="2"
              animate={{ d: ["M 100,105 Q 130,90 120,130", "M 100,105 Q 140,85 115,135", "M 100,105 Q 130,90 120,130"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Happy Tulip Head */}
            {stage >= 2 && (
              <motion.g
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
                        transition={{ duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }}
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
                        transition={{ duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }}
                        style={{ originY: 0 }}
                      />
                    </g>

                    {/* Happy Open Smile */}
                    <motion.path 
                      d="M 90,95 Q 100,105 110,95 L 110,100 Q 100,110 90,100 Z"
                      fill="black"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
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
                          repeat: Infinity, 
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
                  transition={{ duration: 4, repeat: Infinity }}
                  d="M -45,5 Q -48,0 -52,5 Q -55,10 -52,15" fill="#FFF3E0" stroke="#1B5E20" strokeWidth="1" 
                />
              </g>

              {/* Right Leaf */}
              <g transform="translate(100, 100)">
                <path d="M 0,0 Q 40,-10 60,20 Q 40,30 0,0" fill={roseColors.leaf} stroke="#1B5E20" strokeWidth="2" />
                {/* Bite Mark 2 - Right */}
                <motion.path 
                  animate={{ scale: [1, 1.3, 1] }} 
                  transition={{ duration: 5, repeat: Infinity }}
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
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </g>
                    <g transform="translate(15, 5)">
                      <motion.path 
                        d="M -5,0 A 5,5 0 1,1 5,0 A 5,5 0 1,1 -5,0 M -3,0 A 3,3 0 1,0 3,0" 
                        stroke="black" fill="none" strokeWidth="1"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
                    transition={{ duration: 0.3, repeat: Infinity }}
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
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
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
                    transition={{ duration: 0.25, repeat: Infinity }}
                    d="M 0,0 Q 5,-8 10,0 Q 15,-8 20,0" stroke={roseColors.caterpillar} strokeWidth="5" fill="none" strokeLinecap="round" 
                  />
                  <circle cx="20" cy="0" r="1" fill="black" />
                </g>

                {/* Right Leaf Caterpillar */}
                <g transform="translate(130, 105) rotate(10)">
                  <motion.path 
                    animate={{ x: [0, -0.5, 0], scaleY: [1, 1.15, 1] }}
                    transition={{ duration: 0.35, repeat: Infinity, delay: 0.1 }}
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

  const getEcosystemRenderer = () => {
    switch (type) {
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
    <motion.svg 
      viewBox="0 0 200 200" 
      className="w-72 h-72 drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
    >
      {/* Ground/Shadow */}
      <ellipse cx="100" cy="190" rx="50" ry="10" fill="rgba(0,0,0,0.05)" />

      {getEcosystemRenderer()}

      {stage === 0 && !isDead && type !== 'sprout' && (
        <motion.ellipse 
          cx="100" cy="145" rx="6" ry="4"
          fill="#D7CCC8" stroke="black" strokeWidth="2"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
        />
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
    </motion.svg>
  );
};
