import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Video, RotateCw, Check, Image as ImageIcon, 
  Type, Smile, Mic, Music, Sparkles, ArrowRight, Send, 
  Trash2, Volume2, Monitor, Play, Pause, Layers, FlipHorizontal, Focus,
  Scissors, Palette, Wand2, Ghost
} from 'lucide-react';

interface NexoraStudioProps {
  onClose: () => void;
  onPost: (videoData: any) => void;
  user: any;
}

type StudioStage = 1 | 2 | 3;

export function NexoraStudio({ onClose, onPost, user }: NexoraStudioProps) {
  const [stage, setStage] = useState<StudioStage>(1);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'photo' | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  
  // Edit state for stage 2
  const [textOverlay, setTextOverlay] = useState('');
  const [stickers, setStickers] = useState<{ id: string, type: string, x: number, y: number }[]>([]);
  const [quality, setQuality] = useState<'Standard' | 'HD' | '4K' | 'Ultra'>('HD');
  const [caption, setCaption] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (capturedMedia) URL.revokeObjectURL(capturedMedia);
      const url = URL.createObjectURL(file);
      setCapturedMedia(url);
      setMediaType(file.type.startsWith('video') ? 'video' : 'photo');
      setStage(2);
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    }
  };

  const addSticker = (type: string) => {
    setStickers([...stickers, { id: Math.random().toString(), type, x: 40 + Math.random() * 20, y: 40 + Math.random() * 20 }]);
    vibrate(VIBRATION_PATTERNS.CLICK);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.div 
            key="stage1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full relative flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-950 to-black"
          >
            {/* Background Vibe */}
            <div className="absolute inset-0 opacity-20 overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070')] bg-cover bg-center mix-blend-overlay" />
               <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-3xl" />
            </div>

            <div className="relative z-10 space-y-10 max-w-sm w-full">
               <div className="relative w-32 h-32 mx-auto">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 rounded-[3rem] border-2 border-dashed border-orange-500/30"
                 />
                 <div className="absolute inset-2 bg-orange-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_80px_rgba(249,115,22,0.4)]">
                    <Video size={48} className="text-white" />
                 </div>
               </div>

               <div className="space-y-4">
                  <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Nexora<br /><span className="text-orange-500">Video Lab</span></h2>
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">Vertical Vibe Studio</p>
               </div>

               <div className="pt-8 space-y-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 group hover:bg-orange-500 hover:text-white"
                  >
                    Import From Phone <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="video/*,image/*" onChange={handleFileUpload} className="hidden" />
                  
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest pt-4">
                    Optimized for 9:16 mobile vlogs 🏮
                  </p>
               </div>

               <button onClick={onClose} className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] hover:text-white pt-10">
                 Exit Studio
               </button>
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div 
            key="stage2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full relative bg-black flex flex-center justify-center"
          >
            {/* Full Screen Editor Preview */}
            <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden flex items-center justify-center">
               <div className="relative w-full h-full max-w-md aspect-[9/16] bg-neutral-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                  {mediaType === 'video' ? (
                    <video src={capturedMedia!} autoPlay loop playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={capturedMedia!} className="w-full h-full object-cover" />
                  )}

                  {/* Overlays */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <AnimatePresence>
                      {textOverlay && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center p-12"
                        >
                          <p className="text-white text-4xl font-black italic text-center leading-tight uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                            {textOverlay}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {stickers.map(s => (
                      <motion.div 
                        key={s.id} 
                        drag 
                        dragMomentum={false}
                        className="absolute text-7xl cursor-grab active:cursor-grabbing pointer-events-auto" 
                        style={{ top: `${s.y}%`, left: `${s.x}%` }}
                      >
                        {s.type === 'fire' ? '🔥' : s.type === 'nexus' ? '✨' : s.type === 'diamond' ? '💎' : '🚀'}
                      </motion.div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Sidebar Actions (TikTok Style) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col items-center gap-6 z-50">
               {[
                 { id: 'text', icon: <Type size={20} />, label: 'Text' },
                 { id: 'vibe', icon: <Smile size={20} />, label: 'Vibe' },
                 { id: 'cut', icon: <Scissors size={20} />, label: 'Trim' },
                 { id: 'magic', icon: <Wand2 size={20} />, label: 'Lens' }
               ].map(tool => (
                 <button 
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(activeTool === tool.id ? null : tool.id);
                    vibrate(VIBRATION_PATTERNS.CLICK);
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                 >
                    <div className={`w-14 h-14 bg-black/40 backdrop-blur-3xl rounded-3xl border border-white/10 flex items-center justify-center text-white transition-all shadow-xl group-hover:bg-white/10 ${activeTool === tool.id ? 'bg-orange-500 border-orange-500 scale-110 shadow-orange-500/20' : 'active:scale-90'}`}>
                      {tool.icon}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${activeTool === tool.id ? 'text-orange-500' : 'text-white/40'}`}>{tool.label}</span>
                 </button>
               ))}
               
               <button 
                 onClick={() => setStage(1)}
                 className="flex flex-col items-center gap-1.5 group"
               >
                  <div className="w-14 h-14 bg-black/40 backdrop-blur-3xl rounded-3xl border border-white/10 flex items-center justify-center text-white/40 transition-all hover:text-white shadow-xl hover:bg-white/10 active:scale-90">
                    <RotateCw size={20} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Swap</span>
               </button>
            </div>

            {/* Top Close */}
            <div className="absolute top-8 left-8 z-50">
               <button onClick={onClose} className="w-14 h-14 bg-black/40 backdrop-blur-3xl rounded-3xl text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 shadow-2xl border border-white/10">
                  <X size={24} />
               </button>
            </div>

            {/* Contextual UI */}
            <AnimatePresence>
              {activeTool === 'text' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-sm p-6 z-50 pointer-events-auto"
                >
                   <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-3xl">
                      <input 
                          autoFocus
                          type="text" 
                          value={textOverlay} 
                          onChange={(e) => setTextOverlay(e.target.value)}
                          placeholder="CAPTION VIBE..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black text-center text-lg uppercase tracking-tighter outline-none focus:border-orange-500"
                      />
                      <button onClick={() => setActiveTool(null)} className="w-full py-3 mt-4 bg-orange-500 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest">Apply</button>
                   </div>
                </motion.div>
              )}
              {activeTool === 'vibe' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-sm p-6 z-50"
                >
                   <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-3xl flex justify-center gap-4">
                      {['fire', 'nexus', 'diamond', 'rocket'].map(s => (
                        <button key={s} onClick={() => addSticker(s)} className="w-14 h-14 bg-white/5 rounded-2xl hover:bg-orange-500/20 border border-white/10 transition-all text-2xl flex items-center justify-center">
                           {s === 'fire' ? '🔥' : s === 'nexus' ? '✨' : s === 'diamond' ? '💎' : '🚀'}
                        </button>
                      ))}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Primary Action */}
            <div className="absolute bottom-12 inset-x-0 px-8 flex justify-center items-center z-50">
               <button 
                onClick={() => {
                  setStage(3);
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                }}
                className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
               >
                Proceed To Post <ArrowRight size={20} />
               </button>
            </div>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div 
            key="stage3"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative bg-neutral-950 flex flex-col items-center justify-center p-8"
          >
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
               {/* Preview Card */}
               <div className="relative group mx-auto">
                  <div className="w-[280px] aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,1)] border-4 border-white/5 relative bg-black transform rotate-1 group-hover:rotate-0 transition-transform duration-700">
                    {mediaType === 'video' ? (
                      <video src={capturedMedia!} autoPlay loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={capturedMedia!} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-8 left-6 right-6 text-white">
                       <p className="text-[10px] font-black italic mb-1 uppercase tracking-widest">@{user?.displayName?.replace(/\s+/g, '')}</p>
                       <p className="text-[8px] opacity-60 leading-none">{caption || 'Nexora Studio Release'}</p>
                    </div>
                  </div>
               </div>

               {/* Meta Data */}
               <div className="space-y-8">
                  <div>
                    <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-3">Broadcast</h2>
                    <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em]">Nexora Content Engine 🏮</p>
                  </div>

                  <div className="space-y-4">
                     <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's the frequency, bro? 🏮"
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white placeholder-white/20 font-bold focus:border-orange-500 outline-none transition-all resize-none shadow-inner text-sm"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[7px] text-white/20 font-black uppercase tracking-widest mb-1">Renderer</p>
                        <select 
                          value={quality}
                          onChange={(e: any) => setQuality(e.target.value)}
                          className="bg-transparent text-white font-black text-sm outline-none cursor-pointer w-full"
                        >
                           <option value="Standard">Standard</option>
                           <option value="HD">HD Max</option>
                           <option value="4K">4K Vibe</option>
                        </select>
                     </div>
                     <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-white/20">
                        <Palette size={20} />
                     </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button onClick={() => setStage(2)} className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all">
                       <Scissors size={24} />
                    </button>
                    <button 
                      onClick={() => {
                        vibrate(VIBRATION_PATTERNS.SUCCESS);
                        onPost({ 
                          videoUrl: capturedMedia, 
                          caption,
                          userName: user?.displayName || 'Anonymous',
                          userPhoto: user?.photoURL || '',
                          quality,
                          platform: 'nexora',
                          type: mediaType
                        });
                      }}
                      className="flex-1 h-16 bg-orange-500 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-all active:scale-95"
                    >
                      Publish to Reels <Send size={20} />
                    </button>
                  </div>
               </div>
            </div>
            
            <button onClick={onClose} className="absolute bottom-10 text-[9px] text-white/20 font-black uppercase tracking-[0.4em] hover:text-white transition-colors">
               Cancel Broadcast
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const VIBRATION_PATTERNS = {
  CLICK: [10],
  SUCCESS: [10, 50, 10],
  ERROR: [50, 100, 50],
  LONG: [200]
};

const vibrate = (pattern: number[]) => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(pattern);
  }
};
