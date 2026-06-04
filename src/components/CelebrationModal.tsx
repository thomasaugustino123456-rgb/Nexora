import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { Mascot } from './Mascot';
import { UserSettings } from '../types';

interface CelebrationModalProps {
  settings: UserSettings;
  onFinish: () => void;
}

export function CelebrationModal({ settings, onFinish }: CelebrationModalProps) {
  const [page, setPage] = useState(1);

  const pages = [
    {
      title: "BOOM! SPACEHOUSE UNLOCKED! 🚀",
      description: "You've nurtured 3 ecosystems and proven your consistency. The Nexora HQ has granted you access to your very own SpaceHouse!",
      icon: <Trophy className="text-amber-500" size={48} />,
      mascotMood: 'happy' as const
    },
    {
      title: "YOUR OWN SANCTUARY 🏠",
      description: "In the SpaceHouse, you can collect items from the shop, decorate your space, and chill with your mascot. It's the ultimate base for habit masters.",
      icon: <Star className="text-yellow-500" size={48} />,
      mascotMood: 'happy' as const
    },
    {
      title: "READY TO EXPLORE? 🛸",
      description: "Your journey as a consistency legend enters a new phase. Go ahead and step into your new home, bro!",
      icon: <CheckCircle2 className="text-emerald-500" size={48} />,
      mascotMood: 'happy' as const
    }
  ];

  const currentPage = pages[page - 1];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden border-4 border-blue-500"
      >
        <div className="bg-gradient-to-b from-blue-50 to-white p-8 space-y-8 text-center relative">
          {/* Animated Background Rays */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.3)_10deg,transparent_20deg)]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              key={page}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10 border-2 border-white"
            >
              {currentPage.icon}
            </motion.div>

            <div className="mb-8">
              <Mascot 
                className="w-28 h-28" 
                hat={settings.activeSkin} 
                soundPack={settings.isDogSoundPackActive ? 'dog' : 'cat'}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-blue-950 leading-tight">
                  {currentPage.title}
                </h2>
                <p className="text-blue-900/60 font-medium leading-relaxed">
                  {currentPage.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-4 pt-4">
            {page < 3 ? (
              <button
                onClick={() => setPage(page + 1)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group transition-all"
              >
                CONTINUE
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={onFinish}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                FINISHED! 🚀
              </button>
            )}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === page ? 'bg-blue-600 w-6' : 'bg-blue-200'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
