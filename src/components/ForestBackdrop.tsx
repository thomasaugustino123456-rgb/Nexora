import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useSound } from '../hooks/useSound';

interface TreeProps {
  x: number;
  y: number;
  scale: number;
  color: string;
  delay: number;
}

const Tree: React.FC<TreeProps> = ({ x, y, scale, color, delay }) => {
  return (
    <motion.g
      initial={{ x, y, scale: 0 }}
      animate={{ scale }}
      transition={{ type: 'spring', damping: 20, stiffness: 100, delay }}
      className="pointer-events-none"
    >
      <motion.path
        d="M 0,0 Q -10,-40 0,-100 Q 10,-40 0,0"
        fill={color}
        animate={{
          rotate: [-1, 1, -1],
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 2
        }}
        style={{ originY: '0px' }}
      />
      <motion.circle
        cx="0" cy="-100" r="35"
        fill={color}
        opacity="0.8"
        animate={{
          scale: [1, 1.05, 1],
          y: [-100, -102, -100]
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 2
        }}
      />
      <motion.circle
        cx="-20" cy="-80" r="25"
        fill={color}
        opacity="0.7"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 5 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 3
        }}
      />
      <motion.circle
        cx="20" cy="-80" r="25"
        fill={color}
        opacity="0.7"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 3
        }}
      />
    </motion.g>
  );
};

export const ForestBackdrop: React.FC = () => {
  const { playMusic, stopAllMusic } = useSound();

  useEffect(() => {
    playMusic('music-forest');
    return () => stopAllMusic();
  }, []);

  const trees = useMemo(() => [
    { x: 10, y: 80, scale: 0.8, color: '#064e3b', delay: 0.1 },
    { x: 25, y: 85, scale: 1.2, color: '#065f46', delay: 0.3 },
    { x: 40, y: 78, scale: 0.9, color: '#047857', delay: 0.5 },
    { x: 60, y: 82, scale: 1.1, color: '#065f46', delay: 0.2 },
    { x: 75, y: 88, scale: 1.3, color: '#064e3b', delay: 0.4 },
    { x: 90, y: 80, scale: 0.7, color: '#047857', delay: 0.6 },
    // Foreground smaller shrubs
    { x: 15, y: 92, scale: 0.4, color: '#10b981', delay: 0.7 },
    { x: 50, y: 95, scale: 0.5, color: '#059669', delay: 0.8 },
    { x: 80, y: 93, scale: 0.4, color: '#10b981', delay: 0.9 },
  ], []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden touch-none" style={{ transform: 'translateZ(0)' }}>
      {/* Distant Hills */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <path d="M 0,600 Q 200,450 400,550 T 800,500 T 1200,580 L 1200,800 L 0,800 Z" fill="#064e3b" />
        <path d="M 0,650 Q 300,550 600,620 T 1200,590 L 1200,800 L 0,800 Z" fill="#047857" />
      </svg>

      {/* Layered Trees */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {trees.map((t, i) => (
          <Tree key={i} {...t} x={t.x} y={t.y} />
        ))}
      </svg>
      
      {/* Subtle Mist/Atmosphere */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-green-900/10 to-transparent mix-blend-overlay"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </div>
  );
};
