import React from 'react';
import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-blue-50 flex items-center justify-center z-[1000] overflow-hidden">
      {/* Background Pulsing Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-400 rounded-full blur-3xl"
        />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Mascot Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8
          }}
          className="relative w-48 h-48 drop-shadow-[0_20px_50px_rgba(59,130,246,0.5)]"
        >
          <img 
            src="https://i.postimg.cc/qv3DJHS5/Chat-GPT-Image-Mar-23-2026-05-09-17-PM-removebg-preview.png" 
            alt="Nexora Mascot" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
          
          {/* Sparkles around mascot */}
          <motion.div 
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -top-4 -right-4 text-2xl"
          >
            ✨
          </motion.div>
          <motion.div 
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
            className="absolute -bottom-2 -left-4 text-2xl"
          >
            🏮
          </motion.div>
        </motion.div>

        {/* Text and Loading Status */}
        <div className="flex flex-col items-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-blue-900 italic tracking-tighter uppercase mb-1"
          >
            Nexora
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="w-48 h-1.5 bg-blue-100 rounded-full overflow-hidden mt-4 shadow-inner">
              <motion.div 
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full"
              />
            </div>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mt-3 animate-pulse">
              SYNCING VIBES...
            </p>
          </motion.div>
        </div>
      </div>

      {/* Version footprint */}
      <div className="absolute bottom-8 text-[9px] text-blue-900/20 font-black uppercase tracking-widest">
        ESTABLISHING NEURAL LINK V2.4.0
      </div>
    </div>
  );
}
