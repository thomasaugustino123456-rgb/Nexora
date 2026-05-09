import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy as TrophyIcon, Sparkles, Check, Download, Share2 } from 'lucide-react';
import { GoldenTrophy, IceTrophy, BrokenTrophy } from './Trophies';
import { useSound } from '../hooks/useSound';
import { TrophyType } from '../types';
import { auth } from '../firebase';
import { vibrate } from '../lib/vibrate';

interface TrophyRewardsScreenProps {
  trophyType: TrophyType;
  onFinish: () => void;
}

export function TrophyRewardsScreen({ trophyType, onFinish }: TrophyRewardsScreenProps) {
  const { play, stop } = useSound();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Play the reward song
    const song = trophyType === 'golden' ? 'trophy1' : (trophyType === 'ice' ? 'losing' : 'losing');
    play(song as any);
    
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);

    return () => {
      // We don't necessarily stop the trophy song if they finish quickly, but the next screen might play music
    };
  }, [play, trophyType]);

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center opacity-5"
        >
          <div className="w-[150%] aspect-square bg-[conic-gradient(from_0deg,transparent_0deg,#3b82f6_20deg,transparent_40deg)]" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8"
      >
        <div className="space-y-2">
          <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs">Achievement Unlocked</p>
          <h2 className="text-5xl font-black text-blue-900 italic tracking-tighter uppercase">
            {trophyType === 'golden' ? 'Pure Victory' : trophyType === 'ice' ? 'Frozen Solid' : 'Shattered Soul'}
          </h2>
        </div>

        <motion.div 
          className="w-80 h-80 relative"
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          {trophyType === 'golden' && <GoldenTrophy />}
          {trophyType === 'ice' && <IceTrophy />}
          {trophyType === 'broken' && <BrokenTrophy />}
          
          <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
             transition={{ duration: 2, repeat: Infinity }}
             className={`absolute inset-0 blur-3xl -z-10 rounded-full ${trophyType === 'golden' ? 'bg-yellow-400' : 'bg-blue-300'}`}
          />
        </motion.div>

        <div className="space-y-4 max-w-xs">
          <p className="text-blue-900/60 font-medium leading-relaxed italic">
            "{trophyType === 'golden' 
              ? "You've proven your discipline today, bro. This golden treasure belongs to the elite." 
              : "Consistency is freezing up. Don't let your discipline slip into the cold abyss!"}"
          </p>
          
          <div className="flex items-center justify-center gap-3">
             <div className="px-4 py-2 bg-blue-50 rounded-full flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" />
                <span className="text-[10px] font-black text-blue-900 uppercase">Season 1 Rare</span>
             </div>
             <div className="px-4 py-2 bg-blue-50 rounded-full flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                <span className="text-[10px] font-black text-blue-900 uppercase">Verified</span>
             </div>
          </div>
        </div>

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-4"
            >
              <button
                onClick={() => {
                  play('nav_switch');
                  onFinish();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all active:scale-95 text-lg"
              >
                Finished
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                    const el = document.querySelector('.trophy-card-capture');
                    if (el) {
                      vibrate(20);
                      const { toPng } = await import('html-to-image');
                      const dataUrl = await toPng(el as HTMLElement, { backgroundColor: '#fff' });
                      const link = document.createElement('a');
                      link.download = `Nexora_Trophy_${trophyType}.png`;
                      link.href = dataUrl;
                      link.click();
                    }
                  }}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-blue-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={14} /> Save Card
                </button>
                <button 
                  onClick={async () => {
                    vibrate(10);
                    const shareUrl = `${window.location.origin}${window.location.pathname}?user=${auth.currentUser?.uid || ''}`;
                    const shareText = `Bro, check my discipline rank! I just earned a ${trophyType.toUpperCase()} trophy on Nexora! 🏆🚀`;
                    
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'Nexora Achievement',
                          text: shareText,
                          url: shareUrl
                        });
                      } catch (e) {
                         // Fallback to clipboard if share cancelled
                         await navigator.clipboard.writeText(`${shareText}\n\nView here: ${shareUrl}`);
                      }
                    } else {
                      await navigator.clipboard.writeText(`${shareText}\n\nView here: ${shareUrl}`);
                      alert('Share link copied to clipboard! 📋 Past it anywhere, bro!');
                    }
                  }}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-blue-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 size={14} /> Share Rank
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Capture element for Save Card */}
      <div className="fixed -left-[2000px] top-0">
        <div className="trophy-card-capture bg-white w-[400px] p-12 flex flex-col items-center text-center gap-8 border-8 border-blue-500">
           <h2 className="text-4xl font-black text-blue-900 italic uppercase">Nexora Champion</h2>
           <div className="w-64 h-64">
              {trophyType === 'golden' && <GoldenTrophy />}
              {trophyType === 'ice' && <IceTrophy />}
              {trophyType === 'broken' && <BrokenTrophy />}
           </div>
           <div className="space-y-4">
              <p className="text-2xl font-black text-blue-600 uppercase tracking-widest">
                {trophyType === 'golden' ? 'Golden Victory' : trophyType === 'ice' ? 'Frozen CONSISTENCY' : 'SHATTERED'}
              </p>
              <p className="text-gray-500 font-bold italic">"Discipline created a legend today."</p>
           </div>
        </div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100,
              opacity: 0
            }}
            animate={{ 
              y: -100,
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
