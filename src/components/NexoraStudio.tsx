import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Video, RotateCw, Check, Image as ImageIcon, 
  Type, Smile, Mic, Music, Sparkles, ArrowRight, Send, 
  Trash2, Volume2, Monitor, Play, Pause, Layers, FlipHorizontal, Focus,
  Scissors, Palette, Wand2, Ghost, ArrowLeft, RefreshCw
} from 'lucide-react';
import { ProVideoEditor } from './ProVideoEditor';
import { showToast } from '../lib/toast';

interface NexoraStudioProps {
  onBack: () => void;
  onPost?: (videoData: any) => void;
  user: any;
}

type StudioStage = 1 | 2 | 3;

export function NexoraStudio({ onBack, onPost, user }: NexoraStudioProps) {
  const [stage, setStage] = useState<StudioStage>(1);
  const [capturedMedia, setCapturedMedia] = useState<{
    url: string, 
    type: 'video' | 'photo',
    duration?: number,
    originalDuration?: number,
    trimStart?: number
  }[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isAutoSwitch, setIsAutoSwitch] = useState(false);
  const [mediaType, setMediaType] = useState<'video' | 'photo' | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  
  // Edit state for stage 2
  const [textOverlay, setTextOverlay] = useState('');
  const [stickers, setStickers] = useState<{ id: string, type: string, x: number, y: number }[]>([]);
  const [quality, setQuality] = useState<'Standard' | 'HD' | '4K' | 'Ultra'>('HD');
  const [useWatermark, setUseWatermark] = useState(true);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [caption, setCaption] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDraggingToDelete, setIsDraggingToDelete] = useState(false);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isProEditing, setIsProEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const currentMedia = capturedMedia[currentMediaIndex];
    if (stage === 2 && currentMedia?.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      if (isPaused) {
        if (!video.paused) video.pause();
      } else {
        // Only trigger play if it's not actually playing
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Auto-play prevented, waiting for interaction:", error);
            });
          }
        }
      }
    }
  }, [isPaused, stage, currentMediaIndex, capturedMedia, selectedEffect, activeTool]);

  useEffect(() => {
    let interval: any;
    if (isAutoSwitch && capturedMedia.length > 1 && stage === 2) {
      interval = setInterval(() => {
        setCurrentMediaIndex(prev => (prev + 1) % capturedMedia.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoSwitch, capturedMedia, stage]);

  const createdUrls = useRef<Set<string>>(new Set());

  // Improved cleanup
  const revokeUrl = (url: string) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      createdUrls.current.delete(url);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs ONLY when studio completely unmounts
      createdUrls.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    showToast(`Loading ${files.length} Media... ⏳`, 'info');
    
    const newMedia = await Promise.all(files.map(file => {
      return new Promise<{
        url: string, 
        type: 'video' | 'photo', 
        duration: number, 
        originalDuration: number, 
        trimStart: number
      }>((resolve) => {
        const url = URL.createObjectURL(file);
        createdUrls.current.add(url);
        const type = file.type.startsWith('video') ? 'video' : 'photo';
        
        if (type === 'video') {
          const video = document.createElement('video');
          video.src = url;
          video.preload = 'metadata';
          video.playsInline = true;
          video.muted = true;
          
          const timeoutId = setTimeout(() => {
             // Fallback if metadata takes too long (e.g. mobile Safari issues)
             resolve({ url, type, duration: 30, originalDuration: 30, trimStart: 0 });
          }, 8000); // More time for mobile

          video.onloadedmetadata = () => {
            clearTimeout(timeoutId);
            const validDuration = video.duration && isFinite(video.duration) ? video.duration : 30;
            // Safari mobile duration fix
            if (validDuration === Infinity) {
              video.currentTime = 1e101;
              video.ontimeupdate = () => {
                video.ontimeupdate = null;
                const dur = video.duration;
                video.currentTime = 0;
                resolve({ url, type, duration: dur, originalDuration: dur, trimStart: 0 });
              };
            } else {
              resolve({ 
                url, 
                type, 
                duration: validDuration, 
                originalDuration: validDuration, 
                trimStart: 0 
              });
            }
          };
          video.onerror = (e) => {
            console.error("Video error during metadata load:", e);
            clearTimeout(timeoutId);
            resolve({ url, type, duration: 15, originalDuration: 15, trimStart: 0 });
          };
          video.load();
        } else {
          resolve({ url, type, duration: 5, originalDuration: 5, trimStart: 0 });
        }
      });
    }));
    
    setCapturedMedia(prev => [...prev, ...newMedia]);
    if (capturedMedia.length === 0) {
      setCurrentMediaIndex(0);
      setMediaType(newMedia[0].type);
    }
    setStage(2);
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    showToast(`${newMedia.length} Media Loaded! 🏮`, 'success');
    e.target.value = '';
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioFile) revokeUrl(audioFile);
      const newAudioUrl = URL.createObjectURL(file);
      createdUrls.current.add(newAudioUrl);
      setAudioFile(newAudioUrl);
      showToast('Audio Link Synced! 🎵', 'success');
    }
    e.target.value = '';
  };

  const addSticker = (type: string) => {
    setStickers([...stickers, { id: Math.random().toString(), type, x: 50, y: 50 }]);
    vibrate(VIBRATION_PATTERNS.CLICK);
  };

  const removeSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
    vibrate(VIBRATION_PATTERNS.CLICK);
  };

  const getEffectFilter = () => {
    let filter = '';
    switch(selectedEffect) {
      case 'retro': filter = 'sepia(0.8) contrast(1.2) brightness(0.9)'; break;
      case 'neon': filter = 'hue-rotate(90deg) saturate(2) brightness(1.2)'; break;
      case 'noir': filter = 'grayscale(1) contrast(1.5)'; break;
      case 'cyber': filter = 'hue-rotate(180deg) invert(0.1) saturate(1.5)'; break;
      default: filter = 'none';
    }
    
    if (aiEnhanced) {
      filter = filter === 'none' ? 'saturate(1.4) brightness(1.1) contrast(1.1)' : `${filter} saturate(1.3) contrast(1.1)`;
    }
    
    return filter;
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black text-white font-sans">
      <AnimatePresence mode="wait">
        {isProEditing ? (
          <ProVideoEditor 
            media={capturedMedia}
            initialAudio={audioFile}
            onBack={() => setIsProEditing(false)}
            onComplete={(newMedia, newAudioUrl) => {
              try {
                // Ensure media has required properties for Studio stage
                const validatedMedia = newMedia.map(m => ({
                  ...m,
                  originalDuration: m.duration || 10,
                  trimStart: m.trimStart || 0
                }));
                
                setCapturedMedia(validatedMedia as any);
                setCurrentMediaIndex(0); 
                if (newAudioUrl !== undefined) {
                  setAudioFile(newAudioUrl);
                }
                setIsProEditing(false);
                vibrate(VIBRATION_PATTERNS.SUCCESS);
                showToast('Edits Locked In! 🔒', 'success');
              } catch (err) {
                console.error("Editor completion error:", err);
                showToast('Failed to lock edits 🚫', 'error');
              }
            }}
          />
        ) : (
          <div className="w-full h-full relative">
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
                  <input ref={fileInputRef} type="file" accept="video/*,image/*" multiple onChange={handleFileUpload} className="hidden" />
                  
                  <div className="flex flex-col items-center gap-2 pt-4">
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                      Optimized for 9:16 mobile vlogs 🏮
                    </p>
                    <button 
                      onClick={() => {
                        createdUrls.current.forEach(url => URL.revokeObjectURL(url));
                        createdUrls.current.clear();
                        setCapturedMedia([]);
                        showToast('Memory Sanitized! 🧼', 'success');
                      }}
                      className="text-[8px] text-orange-500/40 font-black uppercase tracking-widest hover:text-orange-500"
                    >
                      Clear Memory Cache
                    </button>
                  </div>
               </div>

               <button onClick={onBack} className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] hover:text-white pt-10">
                 Exit Studio
               </button>
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div 
            key="stage2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden"
          >
             <button onClick={onBack} className="absolute top-8 left-8 w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-[100] shadow-lg border border-white/10">
               <ArrowLeft size={24} />
             </button>

            {/* Full Screen Editor Preview */}
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
               <div 
                className="relative w-full h-full max-w-md aspect-[9/16] bg-neutral-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-700"
                style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}
                onClick={() => setIsPaused(!isPaused)}
               >
                {isCinematic && (
                  <>
                    <div className="absolute top-0 inset-x-0 h-[12%] bg-black z-50 transition-all duration-700" />
                    <div className="absolute bottom-0 inset-x-0 h-[12%] bg-black z-50 transition-all duration-700" />
                  </>
                )}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`${currentMediaIndex}-${capturedMedia[currentMediaIndex]?.url}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full"
                  >
                    {capturedMedia.length > 0 && capturedMedia[currentMediaIndex] ? (
                      capturedMedia[currentMediaIndex].type === 'video' ? (
                        <video 
                          key={`video-${capturedMedia[currentMediaIndex].url}`}
                          ref={videoRef}
                          src={capturedMedia[currentMediaIndex].url} 
                          playsInline 
                          muted 
                          loop
                          className="w-full h-full object-cover"
                          style={{ 
                            filter: getEffectFilter(), 
                            WebkitTransform: 'translateZ(0)', 
                            transform: 'translateZ(0)',
                            willChange: 'transform, filter'
                          }}
                          onLoadedData={(e) => {
                             const video = e.currentTarget;
                             if (capturedMedia[currentMediaIndex].trimStart) {
                               video.currentTime = capturedMedia[currentMediaIndex].trimStart!;
                             }
                             if (!isPaused) {
                               video.play().catch(err => {
                                 console.log("Play failed, waiting for user:", err);
                               });
                             }
                           }}
                           onTimeUpdate={(e) => {
                             const video = e.currentTarget;
                             const media = capturedMedia[currentMediaIndex];
                             if (!media) return;
                             const endTime = (media.trimStart || 0) + (media.duration || video.duration);
                             if (video.currentTime >= endTime) {
                               video.currentTime = media.trimStart || 0;
                             }
                           }}
                           onEnded={(e) => {
                              const media = capturedMedia[currentMediaIndex];
                              if (!media) return;
                              e.currentTarget.currentTime = media.trimStart || 0;
                              e.currentTarget.play().catch(()=>{});
                           }}
                         />
                      ) : (
                        <img 
                          src={capturedMedia[currentMediaIndex].url} 
                          className="w-full h-full object-cover" 
                        />
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-4 h-full justify-center">
                         <RotateCw className="text-white/20 animate-spin" size={48} />
                         <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Warping Reality...</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                  {/* Play/Pause Overlay */}
                  <AnimatePresence>
                    {isPaused && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 z-[60]"
                      >
                         <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                            <Play size={40} className="text-white ml-2" />
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {audioFile && <audio src={audioFile} autoPlay loop />}

                  {/* Manual Switch Arrows */}
                  {capturedMedia.length > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-20 pointer-events-none">
                       <button 
                        onClick={() => setCurrentMediaIndex(prev => (prev - 1 + capturedMedia.length) % capturedMedia.length)}
                        className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white pointer-events-auto active:scale-90"
                       >
                         <ArrowLeft size={20} />
                       </button>
                       <button 
                        onClick={() => setCurrentMediaIndex(prev => (prev + 1) % capturedMedia.length)}
                        className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white pointer-events-auto active:scale-90"
                       >
                         <ArrowRight size={20} />
                       </button>
                    </div>
                  )}

                  {/* Visual Overlays */}
                  <AnimatePresence>
                    {textOverlay && (
                      <motion.div 
                        drag
                        dragMomentum={false}
                        onDragStart={() => setIsDraggingToDelete(true)}
                        onDragEnd={(_, info) => {
                          setIsDraggingToDelete(false);
                          if (info.point.y < 120) {
                            setTextOverlay('');
                          }
                        }}
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center p-12 z-40 pointer-events-none"
                      >
                        <p className="text-white text-4xl font-black italic text-center leading-tight uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-auto cursor-drag active:cursor-grabbing bg-black/10 backdrop-blur-sm px-4 py-2 rounded-xl">
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
                      onDragStart={() => setIsDraggingToDelete(true)}
                      onDragEnd={(_, info) => {
                        setIsDraggingToDelete(false);
                        // If dragged to the top area (trash zone)
                        if (info.point.y < 120) {
                          removeSticker(s.id);
                        }
                      }}
                      className="absolute text-7xl cursor-grab active:cursor-grabbing pointer-events-auto z-30" 
                      style={{ top: `${s.y}%`, left: `${s.x}%` }}
                    >
                      {s.type === 'fire' ? '🔥' : s.type === 'nexus' ? '✨' : s.type === 'diamond' ? '💎' : s.type === 'rocket' ? '🚀' : s.type}
                    </motion.div>
                  ))}
                  
                  {useWatermark && (
                    <div className="absolute top-6 right-6 opacity-30 z-50 pointer-events-none flex flex-col items-end">
                       <p className="text-[10px] font-black italic tracking-tighter text-white">NEXORA</p>
                       <div className="w-8 h-[1px] bg-orange-500" />
                    </div>
                  )}
               </div>
            </div>

            {/* Trash Zone */}
            <AnimatePresence>
              {isDraggingToDelete && (
                <motion.div 
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  className="absolute top-24 left-1/2 -track-x-1/2 z-[100] flex flex-col items-center gap-2"
                >
                   <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-bounce">
                      <Trash2 size={32} className="text-white" />
                   </div>
                   <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Release to Delete</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sidebar Actions (TikTok Style) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col items-center gap-6 z-50">
               {[
                 { id: 'text', icon: <Type size={20} />, label: 'Text' },
                 { id: 'vibe', icon: <Smile size={20} />, label: 'Vibe' },
                 { id: 'music', icon: <Music size={20} />, label: 'Audio' },
                 { id: 'magic', icon: <Wand2 size={20} />, label: 'Lens' },
                 { id: 'settings', icon: <Monitor size={20} />, label: 'Setup' },
                 { id: 'edit', icon: <Scissors size={20} />, label: 'Sync' }
               ].map(tool => (
                 <button 
                  key={tool.id}
                  onClick={() => {
                    if (tool.id === 'edit') {
                      setIsProEditing(true);
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      return;
                    }
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
                onClick={() => {
                  setIsAutoSwitch(!isAutoSwitch);
                  vibrate(VIBRATION_PATTERNS.CLICK);
                }}
                className="flex flex-col items-center gap-1.5 group"
               >
                  <div className={`w-14 h-14 bg-black/40 backdrop-blur-3xl rounded-3xl border border-white/10 flex items-center justify-center transition-all shadow-xl hover:bg-white/10 active:scale-90 ${isAutoSwitch ? 'text-green-400' : 'text-white/20'}`}>
                    <RefreshCw size={20} className={isAutoSwitch ? 'animate-spin-slow' : ''} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{isAutoSwitch ? 'Auto ON' : 'Swipe'}</span>
               </button>
            </div>

            {/* Top Close */}
            <div className="absolute top-8 left-8 z-50">
               <button onClick={onBack} className="w-14 h-14 bg-black/40 backdrop-blur-3xl rounded-3xl text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 shadow-2xl border border-white/10">
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
                   <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-3xl">
                      <div className="flex flex-col gap-4">
                         <div className="grid grid-cols-4 gap-2">
                            {['fire', 'nexus', 'diamond', 'rocket', '❤️', '🎎', '🐉', '⛩️', '🏮', '✨', '⚡', '🤖'].map(s => (
                              <button key={s} onClick={() => s.length > 2 ? addSticker(s.slice(0, 5)) : addSticker(s)} className="w-full aspect-square bg-white/5 rounded-2xl hover:bg-orange-500/20 border border-white/10 transition-all text-xl flex items-center justify-center">
                                 {s === 'fire' ? '🔥' : s === 'nexus' ? '✨' : s === 'diamond' ? '💎' : s === 'rocket' ? '🚀' : s}
                              </button>
                            ))}
                         </div>
                         <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Paste Emoji or Type Sticker..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  addSticker((e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs font-bold outline-none focus:border-orange-500"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-black uppercase">ENTER</div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
              {activeTool === 'music' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-sm p-6 z-50"
                >
                   <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-3xl space-y-4">
                      <button 
                        onClick={() => audioInputRef.current?.click()}
                        className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                      >
                         Add Music or Sounds <Music size={16} />
                      </button>
                      <input ref={audioInputRef} type="file" accept="*/*" onChange={handleAudioUpload} className="hidden" />
                      
                      {audioFile && (
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center animate-pulse">
                                 <Music size={14} className="text-white" />
                              </div>
                              <span className="text-[10px] text-white font-black uppercase tracking-widest">Linked Frequency Active</span>
                           </div>
                           <button onClick={() => setAudioFile(null)} className="text-red-500">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      )}
                   </div>
                </motion.div>
              )}
              {activeTool === 'magic' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-sm p-6 z-50"
                >
                   <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-3xl flex justify-center gap-3">
                      {['none', 'retro', 'neon', 'noir', 'cyber'].map(eff => (
                        <button 
                          key={eff}
                          onClick={() => {
                            setSelectedEffect(eff === 'none' ? null : eff);
                            vibrate(VIBRATION_PATTERNS.CLICK);
                          }}
                          className={`w-14 h-14 rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden ${selectedEffect === eff || (eff === 'none' && !selectedEffect) ? 'border-orange-500 bg-orange-500/20 scale-110' : 'border-white/10 bg-white/5'}`}
                        >
                          <div className={`w-full h-full bg-gradient-to-br ${eff === 'none' ? 'from-transparent to-transparent' : eff === 'retro' ? 'from-amber-800 to-orange-950' : eff === 'neon' ? 'from-pink-600 to-indigo-600' : eff === 'noir' ? 'from-neutral-900 to-neutral-700' : 'from-cyan-400 to-blue-600'}`} />
                        </button>
                      ))}
                   </div>
                </motion.div>
              )}
              {activeTool === 'settings' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-sm p-6 z-50"
                >
                   <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-3xl space-y-6">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Render Quality</p>
                         <div className="grid grid-cols-4 gap-2">
                           {['Standard', 'HD', '4K', 'Ultra'].map(q => (
                             <button 
                                key={q}
                                onClick={() => setQuality(q as any)}
                                className={`py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${quality === q ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                             >
                               {q}
                             </button>
                           ))}
                         </div>
                      </div>

                      <div className="space-y-3">
                         {[
                           { id: 'watermark', label: 'Nexora Watermark', state: useWatermark, setter: setUseWatermark },
                           { id: 'ai', label: 'AI Vibe Enhancer', state: aiEnhanced, setter: setAiEnhanced },
                           { id: 'cinematic', label: 'Cinematic Ratio', state: isCinematic, setter: setIsCinematic }
                         ].map(setting => (
                           <div key={setting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{setting.label}</span>
                              <button 
                                onClick={() => setting.setter(!setting.state)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${setting.state ? 'bg-orange-500' : 'bg-white/10'}`}
                              >
                                 <motion.div 
                                    animate={{ x: setting.state ? 24 : 4 }}
                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                 />
                              </button>
                           </div>
                         ))}
                      </div>
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
            className="fixed inset-0 bg-neutral-950 p-8 overflow-y-auto overflow-x-hidden z-50 flex flex-col"
          >
             <button onClick={() => setStage(2)} className="fixed top-8 left-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-[100] shadow-lg">
               <ArrowLeft size={24} />
             </button>

            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-start mx-auto mt-20 md:mt-16 pb-32">
               {/* Preview Card */}
               <div className="relative group mx-auto">
                  <div className="w-[280px] aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,1)] border-4 border-white/5 relative bg-black transform rotate-1 group-hover:rotate-0 transition-transform duration-700">
                    {isCinematic && (
                      <>
                        <div className="absolute top-0 inset-x-0 h-[10%] bg-black z-50 pointer-events-none" />
                        <div className="absolute bottom-0 inset-x-0 h-[10%] bg-black z-50 pointer-events-none" />
                      </>
                    )}
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={`${currentMediaIndex}-${capturedMedia[currentMediaIndex]?.url}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                      >
                        {capturedMedia[currentMediaIndex]?.type === 'video' ? (
                          <video 
                            key={`preview-v-${capturedMedia[currentMediaIndex].url}`}
                            src={capturedMedia[currentMediaIndex].url} 
                            playsInline 
                            muted
                            autoPlay
                            className="w-full h-full object-cover"
                            style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)', willChange: 'transform' }}
                            onLoadedData={(e) => { 
                              const video = e.currentTarget;
                              if (capturedMedia[currentMediaIndex].trimStart) {
                                video.currentTime = capturedMedia[currentMediaIndex].trimStart!;
                              }
                              video.play().catch(() => {});
                            }}
                            onTimeUpdate={(e) => {
                              const video = e.currentTarget;
                              const media = capturedMedia[currentMediaIndex];
                              if (!media) return;
                              const currentValidTime = video.currentTime;
                              const endTime = (media.trimStart || 0) + (media.duration || video.duration);
                              if (currentValidTime >= endTime) {
                                setCurrentMediaIndex((currentMediaIndex + 1) % capturedMedia.length);
                              }
                            }}
                          />
                        ) : (
                          capturedMedia[currentMediaIndex] && (
                            <img 
                              src={capturedMedia[currentMediaIndex].url} 
                              className="w-full h-full object-cover" 
                              onLoad={() => {
                                setTimeout(() => {
                                  if (stage === 3) setCurrentMediaIndex((currentMediaIndex + 1) % capturedMedia.length);
                                }, 3000);
                              }}
                            />
                          )
                        )}
                      </motion.div>
                    </AnimatePresence>
                    {audioFile && <audio src={audioFile} autoPlay loop />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {useWatermark && (
                      <div className="absolute top-6 right-6 opacity-30 z-50 pointer-events-none flex flex-col items-end">
                         <p className="text-[10px] font-black italic tracking-tighter text-white">NEXORA</p>
                         <div className="w-8 h-[1px] bg-orange-500" />
                      </div>
                    )}
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
                        if (onPost) {
                          onPost({ 
                            userId: user?.uid,
                            videoUrl: capturedMedia[0]?.url || '', 
                            audioUrl: audioFile,
                            caption,
                            userName: user?.displayName || 'Anonymous',
                            userPhoto: user?.photoURL || '',
                            quality,
                            platform: 'nexora',
                            type: capturedMedia[0]?.type || 'video',
                            createdAt: new Date().toISOString(),
                            likes: 0,
                            likedBy: [],
                            saves: 0,
                            savedBy: [],
                            commentCount: 0,
                            repostCount: 0
                          });
                        }
                      }}
                      className="flex-1 h-16 bg-orange-500 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-all active:scale-95"
                    >
                      Publish to Reels <Send size={20} />
                    </button>
                  </div>
               </div>
            </div>
            
            <button onClick={onBack} className="absolute bottom-10 text-[9px] text-white/20 font-black uppercase tracking-[0.4em] hover:text-white transition-colors">
               Cancel Broadcast
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
