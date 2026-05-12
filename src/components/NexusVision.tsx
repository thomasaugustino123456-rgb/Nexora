import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Zap, Shield, Search, ArrowLeft, Loader2, Sparkles, Activity, Fingerprint } from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { UserStats, DailyProgress } from '../types';
import { analyzeHabits } from '../services/aiService';

const Typewriter = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, 15 + Math.random() * 25); // Varying speed for "human" feel
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text]);

  return <p>{displayedText}</p>;
};

export function NexusVision({ stats, history, onBack }: { stats: UserStats, history: DailyProgress[], onBack: () => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);

  const steps = [
    "Initializing Neural Link...",
    "Accessing Biological Data...",
    "Analyzing Behavioral Patterns...",
    "Calculating Growth Trajectory...",
    "Synthesizing Optimization Protocol..."
  ];

  const handleStartScan = async () => {
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    setIsScanning(true);
    setResult(null);
    setScanStep(0);

    // Simulate steps for UI polish
    for (let i = 0; i < steps.length; i++) {
      setScanStep(i);
      await new Promise(r => setTimeout(r, 800));
    }

    const aiRes = await analyzeHabits(stats, history);
    setResult(aiRes);
    setIsScanning(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-6 overflow-hidden select-none"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Aurora Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black text-white italic tracking-tighter">NEXUS VISION</h2>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Advanced Neural Lab</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {!isScanning && !result ? (
            <motion.div 
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-12"
            >
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-40 h-40 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 relative z-10"
                >
                  <Brain size={64} className="text-white" />
                </motion.div>
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">BIO-SCAN READY</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                  Let the Nexora AI analyze your growth patterns and provide professional optimization steps.
                </p>
              </div>

              <button 
                onClick={handleStartScan}
                className="group relative px-12 py-6 bg-white rounded-full font-black text-slate-950 uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <span className="relative z-10">Initiate Deep Scan</span>
                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
              </button>
            </motion.div>
          ) : isScanning ? (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md space-y-12"
            >
              {/* Laser Animation */}
              <div className="relative w-full aspect-square border-2 border-white/5 rounded-[3rem] overflow-hidden bg-white/5">
                 <motion.div 
                    animate={{ y: [0, 400, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)] z-20"
                 />
                 <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Fingerprint size={200} className="text-blue-400" />
                 </div>
                 
                 {/* Fast Scrolling Data Stream */}
                 <div className="absolute inset-0 flex flex-col gap-1 p-4 opacity-10 select-none overflow-hidden font-mono text-[8px] text-blue-300">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ x: -100 }}
                        animate={{ x: [null, 400] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1, ease: "linear" }}
                      >
                        {Math.random().toString(16).substring(2, 20)} NEURAL_PATH_0x{i.toString(16)} [ACTIVE]
                      </motion.div>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{steps[scanStep]}</span>
                  <span className="text-[10px] font-black text-white">{Math.round((scanStep + 1) / steps.length * 100)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                      className="h-full bg-blue-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(scanStep + 1) / steps.length * 100}%` }}
                   />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl space-y-8"
            >
               <div className="flex items-center gap-4 text-emerald-400 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <h3 className="font-black italic tracking-tight text-xl uppercase">Analysis Verified</h3>
               </div>

               <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <Sparkles className="text-amber-400/40" size={24} />
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white text-xl md:text-2xl font-medium leading-relaxed italic relative"
                  >
                    <Typewriter text={result} />
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-6 bg-blue-400 align-middle ml-1"
                    />
                  </motion.div>

                  {/* Neural Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] bg-[size:20px_20px]" />
                  </div>

                  <div className="mt-8 flex gap-4">
                    <div className="px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center gap-2">
                       <Activity size={16} className="text-blue-400" />
                       <span className="text-[10px] font-black text-blue-400 uppercase">Pro Quality AI</span>
                    </div>
                  </div>
               </div>

               <button 
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.CLICK);
                  setResult(null);
                }}
                className="w-full py-6 rounded-3xl bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-widest hover:bg-white/10 transition-all"
               >
                 Re-Analyze Biological Vector
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Cores Active</span>
        </div>
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Powered by Gen-7 Nexus Bio-Engine</p>
      </div>
    </motion.div>
  );
}
