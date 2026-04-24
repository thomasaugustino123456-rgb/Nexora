import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, Bookmark, History, Search } from 'lucide-react';
import { UserStats } from '../types';
import { VideoPlayer } from './VideoPlayer';

export function GalleryScreen({ stats, onBack }: { stats: UserStats, onBack: () => void }) {
  const savedVideos = stats.savedVideos || [];

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
           <h2 className="text-3xl font-black text-blue-900 tracking-tight">The Library</h2>
           <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Curated Focus Collection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {savedVideos.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-20 space-y-4">
             <Bookmark size={64} className="mx-auto" />
             <p className="font-black uppercase tracking-widest text-xs">Your library is waiting for vibes, bro...</p>
          </div>
        ) : (
          savedVideos.map((vid: any) => (
            <motion.div key={vid.id} className="glass-card p-6 space-y-4">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="font-black text-blue-900 text-xs uppercase tracking-tighter">Saved Experience</h4>
                 <Video size={16} className="text-blue-200" />
               </div>
               <VideoPlayer url={vid.url} />
               <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest text-center italic">{new Date(vid.savedAt).toLocaleDateString()}</p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
