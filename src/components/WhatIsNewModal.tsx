import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, X } from 'lucide-react';

export function WhatIsNewModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/updates.json')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error('Failed to fetch updates:', err));
  }, []);

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-blue-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full text-blue-100 transition-colors" title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-blue-900 leading-tight">Nexora Manifesto</h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Version History & Review</p>
          </div>
        </div>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
          {(data.history || []).map((release: any) => (
            <div key={release.version} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[2px] flex-1 bg-blue-100"></div>
                <div className="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                  v{release.version} — {release.date}
                </div>
                <div className="h-[2px] flex-1 bg-blue-100"></div>
              </div>
              
              <div className="pl-4 border-l-2 border-blue-500/20 space-y-4">
                <h3 className="text-lg font-black text-blue-900 uppercase tracking-tight">{release.title}</h3>
                {release.updates.map((update: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded-md">
                        {update.category}
                      </span>
                      <h4 className="text-sm font-black text-blue-900 tracking-tight">{update.title}</h4>
                    </div>
                    <p className="text-xs text-blue-700/80 leading-relaxed font-medium">
                      {update.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-blue-100 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
          >
            Got it, bro!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
