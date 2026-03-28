import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, Eye, Star, Trophy as TrophyIcon, Book } from 'lucide-react';
import { UserSettings, UserStats, Trophy, ChallengeStep } from '../types';

export function LibraryScreen({
  settings,
  stats,
  onBack,
  onPlayChallenge,
  onViewTrophy,
  onOpenNotebook
}: {
  settings: UserSettings;
  stats: UserStats;
  onBack: () => void;
  onPlayChallenge: (challengeId: ChallengeStep) => void;
  onViewTrophy: (trophy: Trophy) => void;
  onOpenNotebook: () => void;
}) {
  const savedChallenges = settings.savedChallengeIds || [];
  const savedTrophies = (stats.trophies || []).filter(t => settings.savedTrophyIds?.includes(t.id));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 pb-24"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black">Library</h1>
      </div>

      <h2 className="text-xl font-bold mb-4">Gratitude Jar</h2>
      <div className="glass-card p-6 mb-8 border-l-8 border-l-amber-400">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Gratitude Notebook</h3>
            <p className="text-sm text-blue-900/60">View and edit your saved entries.</p>
          </div>
          <button 
            onClick={onOpenNotebook}
            className="bg-amber-500 text-white p-3 rounded-xl shadow-lg"
          >
            <Book size={24} />
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Saved Challenges</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {savedChallenges.map((challengeId) => (
          <div key={challengeId} className="glass-card p-4 flex flex-col gap-2">
            <h3 className="font-bold capitalize">{challengeId}</h3>
            <button 
              onClick={() => onPlayChallenge(challengeId as ChallengeStep)}
              className="mt-auto bg-blue-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Play size={16} /> Take Again
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Saved Trophies</h2>
      <div className="grid grid-cols-2 gap-4">
        {savedTrophies.map((trophy) => (
          <div key={trophy.id} className="glass-card p-4 flex flex-col gap-2">
            <TrophyIcon className={`w-12 h-12 ${trophy.type === 'golden' ? 'text-amber-500' : 'text-slate-400'}`} />
            <h3 className="font-bold capitalize">{trophy.type} Trophy</h3>
            <button 
              onClick={() => onViewTrophy(trophy)}
              className="mt-auto bg-amber-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Eye size={16} /> View
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
