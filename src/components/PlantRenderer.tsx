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
  const [isLunging, setIsLunging] = useState(false);

  const handlePlantClick = () => {
    if (type !== 'carnivore' || isDead) return;
    
    setClickCount(prev => prev + 1);
    
    if (clickCount >= 1) {
      setIsLunging(true);
      play('dogAngry');
      setTimeout(() => {
        setIsLunging(false);
        setClickCount(0);
      }, 1000);
    } else {
      play('dogAngry'); 
      setTimeout(() => setClickCount(0), 1000);
    }
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

  const renderCarnivore = () => {
    const colors = {
      pot: "#B36340",
      potDark: "#85452B",
      potLight: "#D9805F",
      stem: "#3A7A40",
      leaf: "#7CB342",
      leafDark: "#558B2F",
      head: "#2E7D32",
      insideMouth: "#85261F",
      tongue: "#FF5252",
      teeth: "#FFFFFF",
    };

    return (
      <g onClick={handlePlantClick} style={{ cursor: 'pointer' }}>
        {/* Pot */}
        <path d="M 60,165 L 140,165 L 135,195 L 65,195 Z" fill={colors.pot} stroke="#000" strokeWidth="2" />
        <path d="M 55,155 L 145,155 L 145,165 L 55,165 Z" fill={colors.potDark} stroke="#000" strokeWidth="2" />
        <ellipse cx="100" cy="155" rx="45" ry="5" fill="#5D4037" />

        {stage >= 1 && (
          <g>
            {/* Stem */}
            <motion.path 
              d="M 100,155 Q 90,130 100,100" 
              stroke={colors.stem} 
              strokeWidth="10" 
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: 1,
                d: isLunging ? "M 100,155 Q 85,120 120,90" : "M 100,155 Q 90,130 100,100"
              }}
              transition={{ duration: isLunging ? 0.2 : 0.5 }}
            />

            {/* Leaves */}
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
              {/* Left Leaf */}
              <motion.path 
                d="M 95,150 Q 50,110 55,160 Z" 
                stroke="#000" strokeWidth="1.5" fill={colors.leaf}
                animate={{ rotate: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
              {/* Right Leaf */}
              <motion.path 
                d="M 105,150 Q 150,110 145,160 Z" 
                stroke="#000" strokeWidth="1.5" fill={colors.leaf}
                animate={{ rotate: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
              />
            </motion.g>

            {/* The Head (Mouth) */}
            {stage >= 2 && (
              <motion.g
                animate={isLunging ? { 
                  x: 30, y: -20, rotate: 20, scale: 1.1 
                } : clickCount === 1 ? {
                  y: -10, rotate: -5
                } : { 
                  x: 0, y: 0, rotate: 0, scale: 1 
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                style={{ originX: "100px", originY: "100px" }}
              >
                {/* Back of Head */}
                <ellipse cx="100" cy="80" rx="45" ry="35" fill={colors.head} stroke="#000" strokeWidth="2" />
                
                {/* Inside Mouth */}
                <path d="M 60,85 Q 100,120 140,85 Q 100,50 60,85" fill={colors.insideMouth} stroke="#000" strokeWidth="1" />
                
                {/* Tongue */}
                <motion.path 
                  d="M 85,90 Q 105,110 120,85" 
                  stroke={colors.tongue} strokeWidth="8" fill="none" strokeLinecap="round"
                  animate={{ y: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />

                {/* Teeth (Upper) */}
                <path d="M 65,77 L 70,87 L 75,77 L 85,87 L 95,77 L 105,87 L 115,77 L 125,87 L 135,77" fill={colors.teeth} stroke="#000" strokeWidth="0.5" />
                {/* Teeth (Lower) */}
                <path d="M 65,93 L 70,83 L 75,93 L 85,83 L 95,93 L 105,83 L 115,93 L 125,83 L 135,93" fill={colors.teeth} stroke="#000" strokeWidth="0.5" />

                {/* Upper Jaw/Lip */}
                <path d="M 55,85 Q 100,45 145,85 L 140,85 Q 100,55 60,85 Z" fill={colors.head} stroke="#000" strokeWidth="2" />
                {/* Lower Jaw/Lip */}
                <path d="M 55,85 Q 100,125 145,85 L 140,85 Q 100,115 60,85 Z" fill={colors.head} stroke="#000" strokeWidth="2" />

                {/* Angry Eyes/Brows */}
                <g>
                  {/* Left Eye */}
                  <path d="M 75,65 Q 85,55 95,65" stroke="#000" strokeWidth="4" fill="none" />
                  <circle cx="85" cy="70" r="4" fill="#000" />
                  {/* Right Eye */}
                  <path d="M 105,65 Q 115,55 125,65" stroke="#000" strokeWidth="4" fill="none" />
                  <circle cx="115" cy="70" r="4" fill="#000" />
                </g>

                {/* Extra Foliage for higher stages */}
                {stage >= 4 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <circle cx="90" cy="50" r="5" fill={colors.leaf} stroke="#000" strokeWidth="1" />
                    <circle cx="110" cy="50" r="5" fill={colors.leaf} stroke="#000" strokeWidth="1" />
                  </motion.g>
                )}
              </motion.g>
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
      case 'carnivore': return renderCarnivore();
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
