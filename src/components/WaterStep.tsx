import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { WaterMascot } from './WaterMascot';
import { HappyMascot } from './HappyMascot';
import { UserSettings } from '../types';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';

interface WaterStepProps {
  goal: number;
  progress: number;
  onUpdate: (v: number) => void;
  onContinue: () => void;
  activeSkin?: string;
  settings: UserSettings;
  play: (s: string) => void;
}

export function WaterStep({ 
  goal, 
  progress, 
  onUpdate, 
  onContinue, 
  activeSkin = 'none', 
  settings, 
  play 
}: WaterStepProps) {
  const isFinished = progress >= goal;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto w-full"
    >
      <div className="w-full max-w-[300px] lg:max-w-[400px]">
        <WaterMascot progress={Math.min(progress / goal, 1)} className="drop-shadow-2xl" />
      </div>
      
      <div className="glass-card w-full p-10 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-blue-900/80">Drink Water</h2>
          <p className="text-blue-900/50 font-medium">{progress} / {goal} glasses</p>
          
          <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((progress / goal) * 100, 100)}%` }}
              className="h-full bg-blue-400 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isFinished && <HappyMascot size={40} hat={activeSkin} settings={settings} />}
          {!isFinished ? (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.CLICK);
                if (settings.soundEnabled) {
                  play('water');
                }
                onUpdate(progress + 1);
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Drink +1 💧
            </button>
          ) : (
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                onContinue();
              }} 
              className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
