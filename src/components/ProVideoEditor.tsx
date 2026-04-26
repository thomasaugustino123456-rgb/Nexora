import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Check, Scissors, Music, Trash2, Play, Pause, 
  RotateCcw, History, Plus, ChevronRight, Layers, Volume2 
} from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { showToast } from '../lib/toast';

interface ProVideoEditorProps {
  media: {url: string, type: 'video' | 'photo'}[];
  onBack: () => void;
  onComplete: (newMedia: {url: string, type: 'video' | 'photo'}[]) => void;
}

export function ProVideoEditor({ media, onBack, onComplete }: ProVideoEditorProps) {
  const [clips, setClips] = useState<{ id: string, url: string, type: string, duration: number, startTime: number }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Normalize clips whenever media changes if we don't have clips yet
  useEffect(() => {
    if (media.length > 0 && clips.length === 0) {
      const initialClips = media.map((item, i) => ({ 
        id: Math.random().toString(36).substr(2, 9), 
        url: item.url, 
        type: item.type,
        duration: 10, 
        startTime: i * 10 
      }));
      setClips(initialClips);
      setSelectedClipId(initialClips[0].id);
      setIsReady(true);
    }
  }, [media, clips.length]);

  const totalDuration = clips.reduce((acc, clip) => acc + clip.duration, 0);

  useEffect(() => {
    let animationFrame: number;
    if (isPlaying) {
      const start = Date.now() - (currentTime * 1000);
      const step = () => {
        const now = Date.now();
        const nextTime = (now - start) / 1000;
        if (nextTime >= totalDuration) {
          setIsPlaying(false);
          setCurrentTime(0);
        } else {
          setCurrentTime(nextTime);
          animationFrame = requestAnimationFrame(step);
        }
      };
      animationFrame = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, totalDuration]);

  const activeClip = clips.find(c => currentTime >= c.startTime && currentTime < c.startTime + c.duration) || clips[clips.length - 1];

  // Sync video time with timeline
  useEffect(() => {
    if (videoRef.current && activeClip?.type === 'video') {
      const video = videoRef.current;
      const relativeTime = currentTime - (activeClip.startTime || 0);

      // Only sync if significant difference to avoid flickering
      if (Math.abs(video.currentTime - relativeTime) > 0.15) {
        video.currentTime = Math.max(0, relativeTime);
      }
      
      if (isPlaying) {
        video.play().catch(e => console.log("Play error:", e));
      } else {
        video.pause();
      }
    }
  }, [currentTime, isPlaying, activeClip?.id, activeClip?.url]);

  const handleSplit = () => {
    if (!selectedClipId) return;
    const clipIndex = clips.findIndex(c => c.id === selectedClipId);
    if (clipIndex === -1) return;

    const clip = clips[clipIndex];
    const relativeTime = currentTime - clip.startTime;
    
    if (relativeTime <= 0.5 || relativeTime >= clip.duration - 0.5) return;

    const newClip1 = { ...clip, duration: relativeTime };
    const newClip2 = { 
      ...clip, 
      id: Math.random().toString(), 
      duration: clip.duration - relativeTime,
      startTime: clip.startTime + relativeTime 
    };

    const newClips = [...clips];
    newClips.splice(clipIndex, 1, newClip1, newClip2);
    
    // Recalculate all start times
    let currentStart = 0;
    const updatedClips = newClips.map(c => {
      const updated = { ...c, startTime: currentStart };
      currentStart += c.duration;
      return updated;
    });

    setClips(updatedClips);
    vibrate(VIBRATION_PATTERNS.CLICK);
  };

  const handleDelete = () => {
    if (!selectedClipId || clips.length <= 1) return;
    const filtered = clips.filter(c => c.id !== selectedClipId);
    
    let currentStart = 0;
    const updatedClips = filtered.map(c => {
      const updated = { ...c, startTime: currentStart };
      currentStart += c.duration;
      return updated;
    });

    setClips(updatedClips);
    setSelectedClipId(updatedClips[0]?.id || null);
    vibrate(VIBRATION_PATTERNS.CLICK);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(file));
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    }
  };

  return (
    <div className="w-full h-full bg-neutral-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
         <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl">
            <ArrowLeft size={20} />
         </button>
         <div className="text-center">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Pro Editor Beta</h2>
            <p className="text-[10px] font-bold text-orange-500">{currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s</p>
         </div>
         <button 
          onClick={() => onComplete(clips.map(c => ({ url: c.url, type: c.type as 'video' | 'photo' })))}
          className="px-6 py-2 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl"
         >
            Finish
         </button>
      </div>

      {/* Main Preview Area */}
      <div className="flex-[1.5] relative flex items-center justify-center p-4 min-h-0 bg-black/20">
         <div className="relative aspect-[9/16] h-full max-h-[420px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
            {!isReady ? (
              <div className="flex flex-col items-center gap-4">
                 <RotateCcw className="text-white/20 animate-spin" size={48} />
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-widest text-center">Reconstructing<br/>Digital Reality...</p>
              </div>
            ) : activeClip?.type === 'video' ? (
              <video 
                ref={videoRef}
                src={activeClip.url} 
                key={`${activeClip.id}-${activeClip.url}`}
                className="w-full h-full object-cover"
                loop 
                playsInline
                preload="auto"
                onError={(e) => {
                  console.error('Video Error:', e);
                  showToast('Video Load Error 🚫', 'error');
                }}
              />
            ) : (
              <img 
                src={activeClip?.url} 
                className="w-full h-full object-cover" 
                onError={() => showToast('Image Load Error 🚫', 'error')}
              />
            )}
            {audioUrl && <audio src={audioUrl} autoPlay={isPlaying} />}
            
            <div 
              className="absolute inset-0 flex items-center justify-center bg-transparent cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}
            >
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all border border-white/20"
                    >
                      <Play size={40} className="ml-2" />
                    </motion.button>
                  )}
                </AnimatePresence>
            </div>
         </div>
      </div>

      {/* Timeline Controls */}
      <div className="flex-1 bg-neutral-900 border-t border-white/10 p-4 space-y-4 flex flex-col justify-end">
         {/* Simple Timeline */}
         <div className="relative h-24 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center px-4 gap-1 select-none">
            {clips.map(clip => (
               <div 
                key={clip.id}
                onClick={() => {
                  setSelectedClipId(clip.id);
                  setCurrentTime(clip.startTime);
                }}
                style={{ width: `${(clip.duration / totalDuration) * 100}%` }}
                className={`h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer grow-0 flex-shrink-0 relative ${selectedClipId === clip.id ? 'border-orange-500 scale-[1.02] shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-white/10 grayscale-[0.8]'}`}
               >
                  {clip.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                       <Play size={16} className="text-white/40" />
                       <video src={clip.url} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    </div>
                  ) : (
                    <img src={clip.url} className="w-full h-full object-cover" />
                  )}
               </div>
            ))}

            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-10 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            />
         </div>

         {/* Audio Track */}
         <div className="flex items-center gap-4">
            <div className="flex-1 h-12 bg-black/40 rounded-xl border border-dashed border-white/10 flex items-center px-4 justify-between">
               <div className="flex items-center gap-3">
                  <Music size={16} className={audioUrl ? 'text-orange-500 animate-pulse' : 'text-white/20'} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{audioUrl ? 'Synced Beat Track' : 'Add Background Audio'}</span>
               </div>
               <button onClick={() => audioInputRef.current?.click()} className="text-orange-500"><Plus size={18} /></button>
               <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
            </div>
         </div>

         {/* Tool Bar */}
         <div className="grid grid-cols-4 gap-4">
            <button 
              onClick={handleSplit}
              className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
            >
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/10">
                  <Scissors size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40">Split</span>
            </button>
            <button 
              onClick={handleDelete}
              className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
            >
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-red-500/40 group-hover:text-red-500 group-hover:bg-red-500/10">
                  <Trash2 size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Delete</span>
            </button>
            <button className="flex flex-col items-center gap-2 group active:scale-95 transition-all opacity-40">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                  <History size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Restore</span>
            </button>
            <button className="flex flex-col items-center gap-2 group active:scale-95 transition-all">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-white">
                  <RotateCcw size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Reset</span>
            </button>
         </div>
      </div>
    </div>
  );
}
