import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { LootDropResult, PLANT_ARCHETYPES } from '../types/garden';
import { VIBRATION_PATTERNS, vibrate } from '../lib/vibrate';

// Custom synthesizer using Web Audio API to play high-quality ambient reward soundscapes
export const playLootSound = (type: 'appear' | 'click' | 'success' | 'woosh') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === 'appear') {
      // Celestial rising major-seventh dynamic sweep
      const freqs = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99]; // Cmaj7 climb
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        
        // Custom envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        
        osc.start(now + i * 0.08);
        osc.stop(now + 2.0);
      });
    } else if (type === 'success') {
      // Uplifting double chime for success switch
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + i * 0.05 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        
        osc.start(now + i * 0.05);
        osc.stop(now + 1.0);
      });
    } else if (type === 'woosh') {
      // Quick swoosh sweeping glide
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.35);
      
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // standard click pitch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(160, now + 0.05);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (err) {
    console.warn("Audio feedback context failed:", err);
  }
};

export const LootCard = ({ loot, onCollect }: { loot: LootDropResult, onCollect: () => void }) => {
  const [showStats, setShowStats] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // Elegant combination of visual & audio sparkles
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    playLootSound('appear');
  }, []);

  const handleDownloadCertificate = (e: React.MouseEvent) => {
    // Prevent backdrop triggers
    e.stopPropagation();
    vibrate(20);
    playLootSound('click');

    const signatureStr = `
🌟 OFFICIAL NEXORA CELESTIAL SEED CERTIFICATE 🌟
===================================================
A legendary artifact has materialized on your horizon, bro!

Artifact Type: Cosmic Plant Seed
Botanical Name: ${loot.seedName || "Celestial Sprout"}
Classification: ${loot.rarity || "Rare"} Grade
Growth Time: ${PLANT_ARCHETYPES[loot.seedId || '']?.growthTimeMinutes || 30} minutes
Water Cycles Required: ${PLANT_ARCHETYPES[loot.seedId || '']?.waterRequired || 3} waterings
Reward Yield: ${PLANT_ARCHETYPES[loot.seedId || '']?.coinReward || 20} coins & ${PLANT_ARCHETYPES[loot.seedId || '']?.xpReward || 50} XP

Hold this certificate with high dignity. Success is forged 
through daily consistency!

Certificate Hash: ${Math.random().toString(36).substring(2, 15).toUpperCase()}
Issued On: ${new Date().toUTCString()}
Keep your discipline sharp, legend! 🌿🚀
===================================================
`;

    const blob = new Blob([signatureStr], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${loot.seedName?.toLowerCase() || 'seed'}_certificate_nexora.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const seedArchetype = PLANT_ARCHETYPES[loot.seedId || ""];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
      {/* Absolute glow halo background */}
      <div className="absolute w-[450px] h-[450px] bg-amber-500/20 rounded-full blur-[80px] animate-pulse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 50, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.4, y: -100, rotateY: -90 }}
        transition={{ type: 'spring', damping: 15, stiffness: 120 }}
        className="w-full max-w-sm bg-[#1E1B15] border-4 border-amber-400 p-8 rounded-[2.5rem] tracking-tight text-center relative shadow-[0_0_50px_rgba(245,158,11,0.5)] overflow-hidden flex flex-col items-center"
      >
        {/* Shimmer light bar across card */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

        {/* Floating Sparkles in card corners */}
        <div className="absolute top-4 left-4 text-amber-300">
          <Sparkles size={20} className="animate-pulse" />
        </div>
        <div className="absolute top-4 right-4 text-amber-300">
          <Sparkles size={20} className="animate-bounce" />
        </div>

        {/* Top Header */}
        <div className="rounded-full bg-amber-400/10 px-4 py-1.5 border border-amber-400/20 text-xs text-amber-300 font-extrabold tracking-widest uppercase mb-4 animate-pulse">
          Celestial Seed
        </div>

        {/* Big Cosmic Seed Illustration */}
        <div className="relative my-6 group">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl scale-125 animate-ping-slow" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-8xl select-none filter drop-shadow-[0_10px_15px_rgba(245,158,11,0.4)]"
          >
            🌱
          </motion.div>
        </div>

        {/* Name and Rarity */}
        <h2 className="text-3xl font-black text-amber-100 tracking-tighter">
          {loot.seedName}
        </h2>
        
        <p className={`text-sm font-black uppercase tracking-widest mt-1 px-4 py-1 rounded-full ${
          loot.rarity === 'Legendary' ? 'text-rose-400 bg-rose-500/10' :
          loot.rarity === 'Epic' ? 'text-fuchsia-400 bg-fuchsia-500/10' :
          loot.rarity === 'Rare' ? 'text-blue-400 bg-blue-500/10' :
          'text-emerald-400 bg-emerald-500/10'
        }`}>
          {loot.rarity} Grade
        </p>

        {/* Custom expandable seed specs */}
        <AnimatePresence>
          {showStats && seedArchetype && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-black/40 rounded-2xl p-4 mt-6 text-left border border-amber-400/10 space-y-2.5 overflow-hidden"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-300/60 font-black uppercase">Growth Rate:</span>
                <span className="text-amber-200 font-mono font-bold">{seedArchetype.growthTimeMinutes} minutes</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-300/60 font-black uppercase">Water required:</span>
                <span className="text-amber-200 font-mono font-bold">{seedArchetype.waterRequired} drops</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-300/60 font-black uppercase">Coins return:</span>
                <span className="text-green-400 font-mono font-bold">+{seedArchetype.coinReward} coins</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-300/60 font-black uppercase">XP return:</span>
                <span className="text-blue-400 font-mono font-bold">+{seedArchetype.xpReward} XP</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive action grid */}
        <div className="w-full space-y-3 mt-8">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleDownloadCertificate}
              className={`py-4 rounded-2xl font-black uppercase tracking-wider text-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 ${
                downloadSuccess 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                  : 'bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-750'
              }`}
            >
              {downloadSuccess ? <CheckCircle2 size={16} /> : <Download size={16} />}
              {downloadSuccess ? 'Downloaded!' : 'Save Certificate'}
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                vibrate(10);
                playLootSound('click');
                setShowStats(!showStats);
              }}
              className="py-4 bg-stone-800 text-amber-400 font-black uppercase tracking-wider text-xs border border-amber-400/15 rounded-2xl transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Info size={16} />
              {showStats ? 'Hide details' : 'Review Seed'}
            </button>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              vibrate(VIBRATION_PATTERNS.CLICK);
              playLootSound('woosh');
              onCollect();
            }}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            Ready to grow! 🚀
          </button>
        </div>

        {/* Decorative branding footer */}
        <p className="mt-6 text-[9px] text-amber-400/20 font-black uppercase tracking-[0.2em]">
          COSMIC NEXUS GUARANTEE
        </p>
      </motion.div>
    </div>
  );
};
