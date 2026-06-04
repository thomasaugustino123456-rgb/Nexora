import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, Bookmark, History, Search, Image as ImageIcon, Sparkles, Download } from 'lucide-react';
import { UserStats } from '../types';

export function GalleryScreen({ stats, onBack }: { stats: UserStats, onBack: () => void }) {
  const drawings = stats.drawings || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto w-full space-y-8 pb-32"
    >
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-blue-900 hover:scale-105 active:scale-95 transition-transform">
           <ArrowLeft size={24} />
        </button>
        <div>
           <h2 className="text-3xl font-black text-blue-900 tracking-tight">Masterpieces</h2>
           <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Your Creative Evolution</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {drawings.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-20 space-y-4">
             <ImageIcon size={64} className="mx-auto" />
             <p className="font-black uppercase tracking-widest text-xs">No masterpieces yet, bro!</p>
          </div>
        ) : (
          drawings.map((drawing: string, i: number) => (
            <motion.div key={i} className="glass-card p-2 aspect-square relative group overflow-hidden">
               <img src={drawing} alt={`Masterpiece ${i}`} className="w-full h-full object-cover rounded-2xl" />
               <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <button className="p-2 bg-white text-blue-600 rounded-xl shadow-lg">
                   <Download size={18} />
                 </button>
                 <Sparkles size={18} className="text-yellow-400 animate-pulse" />
               </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
