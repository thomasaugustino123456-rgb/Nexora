import React from 'react';
import { motion } from 'motion/react';
import nexoraAppIconImg from '../assets/images/nexora_app_icon.png';

const nexoraAppIcon = nexoraAppIconImg;

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#081225] flex items-center justify-center z-[1000] overflow-hidden">
      {/* Background Pulsing Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500 rounded-full blur-3xl"
        />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* App Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, scaleY: 0.85 }}
          animate={{ scale: 1, opacity: 1, scaleY: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 240,
            damping: 18,
            duration: 0.8
          }}
          className="relative w-48 h-48 drop-shadow-[0_0_55px_rgba(59,130,246,0.6)]"
        >
          <div 
            className="w-full h-full rounded-[48px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-4 border-blue-500/45 bg-[#081225]"
          >
            <img 
              src={nexoraAppIcon} 
              alt="Nexora App Logo" 
              className="w-full h-full object-contain p-0.5 select-none pointer-events-none"
              style={{ imageRendering: "auto" }}
              referrerPolicy="no-referrer"
            />
          </div>
          
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
            🔥
          </motion.div>
        </motion.div>

        {/* Text and Loading Status */}
        <div className="flex flex-col items-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black text-white italic tracking-tighter uppercase mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          >
            Nexora
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="w-48 h-1.5 bg-blue-950 rounded-full overflow-hidden mt-4 shadow-inner">
              <motion.div 
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-[0_0_8px_#3b82f6]"
              />
            </div>
            <p className="text-[10px] text-blue-300 font-black uppercase tracking-[0.3em] mt-3 animate-pulse">
              CONNECTING NEXUS SYNC...
            </p>
          </motion.div>
        </div>
      </div>

      {/* Version footprint */}
      <div className="absolute bottom-8 text-[9px] text-blue-400/30 font-black uppercase tracking-widest">
        ESTABLISHING NEURAL LINK V6.0.0
      </div>
    </div>
  );
}
