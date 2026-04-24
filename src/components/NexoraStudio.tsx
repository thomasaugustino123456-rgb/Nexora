import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Video, RotateCw, Check, Image as ImageIcon, 
  Type, Smile, Mic, Music, Sparkles, ArrowRight, Send, 
  Trash2, Volume2, Monitor, Play, Pause, Layers, FlipHorizontal, Focus
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
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  
  // Edit state for stage 2
  const [textOverlay, setTextOverlay] = useState('');
  const [stickers, setStickers] = useState<{ id: string, type: string, x: number, y: number }[]>([]);
  const [quality, setQuality] = useState<'Standard' | 'HD' | '4K' | 'Ultra'>('HD');
  const [caption, setCaption] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (stage === 1) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [stage, facingMode]);

  const startCamera = async () => {
    try {
      if (streamRef.current) stopCamera();
      
      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleCapturePhoto = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle mirroring for front camera
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0);
        
        setCapturedMedia(canvas.toDataURL('image/jpeg'));
        setMediaType('photo');
        setStage(2);
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const chunks: Blob[] = [];
    mediaRecorderRef.current = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      setCapturedMedia(URL.createObjectURL(blob));
      setMediaType('video');
      setStage(2);
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedMedia(url);
      setMediaType(file.type.startsWith('video') ? 'video' : 'photo');
      setStage(2);
    }
  };

  const addSticker = (type: string) => {
    setStickers([...stickers, { id: Math.random().toString(), type, x: 40 + Math.random() * 20, y: 40 + Math.random() * 20 }]);
  };

  const getEffectFilter = () => {
    switch(selectedEffect) {
      case 'retro': return 'sepia(0.8) contrast(1.2)';
      case 'neon': return 'hue-rotate(90deg) saturate(2)';
      case 'noir': return 'grayscale(1) contrast(1.5)';
      case 'chrome': return 'contrast(1.4) saturate(1.8) brightness(1.1)';
      default: return 'none';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.div 
            key="stage1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ filter: getEffectFilter(), transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              className="w-full h-full object-cover"
            />
            
            {/* Visual Overlays for Effects */}
            {selectedEffect === 'heart' && (
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none text-9xl animate-pulse">
                ❤️
              </div>
            )}
            {selectedEffect === 'sparkles' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-50">
                <div className="absolute top-10 left-10 animate-spin text-4xl">✨</div>
                <div className="absolute bottom-40 right-20 animate-bounce text-4xl">✨</div>
                <div className="absolute top-1/2 right-40 animate-pulse text-4xl">✨</div>
              </div>
            )}

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
               <button onClick={onClose} className="p-3 bg-black/30 backdrop-blur-xl rounded-2xl text-white hover:bg-white/10 transition-all">
                  <X size={24} />
               </button>
               <div className="flex flex-col gap-4">
                  <button onClick={toggleCamera} className="p-4 bg-black/30 backdrop-blur-xl rounded-2xl text-white hover:bg-white/10 transition-all" title="Switch Camera">
                     <RotateCw size={24} />
                  </button>
                  <button className="p-4 bg-black/30 backdrop-blur-xl rounded-2xl text-white hover:bg-white/10 transition-all">
                     <Volume2 size={24} />
                  </button>
               </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center gap-10 z-20">
              {/* Effects Row */}
              <div className="flex gap-6 overflow-x-auto no-scrollbar w-full max-w-md px-4 py-2">
                {['none', 'heart', 'sparkles', 'retro', 'neon', 'noir', 'chrome'].map(eff => (
                  <button 
                    key={eff}
                    onClick={() => setSelectedEffect(eff === 'none' ? null : eff)}
                    className="group shrink-0 flex flex-col items-center gap-2"
                  >
                    <div className={`w-14 h-14 rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden ${selectedEffect === eff || (eff === 'none' && !selectedEffect) ? 'border-orange-500 bg-orange-500/20' : 'border-white/20 bg-white/10 group-hover:border-white/40'}`}>
                      {eff === 'none' ? <RotateCw className="text-white/40" size={20} /> : 
                       eff === 'heart' ? <span className="text-xl">❤️</span> : 
                       eff === 'sparkles' ? <Sparkles className="text-yellow-400" size={20} /> :
                       <div className={`w-full h-full bg-gradient-to-br ${eff === 'retro' ? 'from-orange-800 to-amber-900' : eff === 'neon' ? 'from-purple-600 to-pink-600' : eff === 'noir' ? 'from-neutral-900 to-neutral-700' : 'from-blue-400 to-cyan-400'}`} />}
                    </div>
                    <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">{eff}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-12">
                <label className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl text-white cursor-pointer hover:bg-white/20 transition-all active:scale-95 border border-white/10">
                  <ImageIcon size={24} />
                  <input type="file" accept="video/*,image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <div className="relative group">
                   <button 
                     onClick={isRecording ? stopRecording : handleCapturePhoto}
                     onMouseDown={() => startRecording()}
                     onMouseUp={() => stopRecording()}
                     onTouchStart={() => startRecording()}
                     onTouchEnd={() => stopRecording()}
                     className={`w-24 h-24 rounded-full border-4 ${isRecording ? 'border-red-500 p-2' : 'border-white p-1.5'} transition-all hover:scale-105 active:scale-90`}
                   >
                     <div className={`w-full h-full rounded-full ${isRecording ? 'bg-red-500 rounded-lg animate-pulse' : 'bg-white'} transition-all`} />
                   </button>
                   {!isRecording && (
                     <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10">
                       <p className="text-[10px] text-white font-black uppercase tracking-widest whitespace-nowrap">Tap for Photo • Hold for Video</p>
                     </div>
                   )}
                </div>

                <div className="w-12 h-12" /> {/* Layout Balance */}
              </div>
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div 
            key="stage2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full relative bg-neutral-950 flex flex-col md:flex-row"
          >
            {/* Main Preview */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4">
               <div className="relative w-full h-full max-w-sm aspect-[9/16] bg-black shadow-3xl rounded-[3rem] overflow-hidden border-8 border-white/5">
                  {mediaType === 'video' ? (
                    <video src={capturedMedia!} autoPlay loop playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={capturedMedia!} className="w-full h-full object-cover" />
                  )}

                  {/* Rendering Text Overlay */}
                  <AnimatePresence>
                    {textOverlay && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-x-0 top-1/4 flex items-center justify-center p-6 pointer-events-none"
                      >
                        <p className="text-white text-4xl font-black italic drop-shadow-[0_4px_16px_rgba(0,0,0,1)] text-center leading-tight uppercase tracking-tighter">
                          {textOverlay}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Rendering Stickers */}
                  {stickers.map(s => (
                    <motion.div 
                      key={s.id} 
                      drag 
                      dragConstraints={{ top: -200, left: -100, right: 100, bottom: 200 }}
                      className="absolute text-5xl cursor-grab active:cursor-grabbing z-30" 
                      style={{ top: `${s.y}%`, left: `${s.x}%` }}
                    >
                      {s.type === 'fire' ? '🔥' : s.type === 'nexus' ? '✨' : s.type === 'diamond' ? '💎' : '🚀'}
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Vertical Bar (Right Side) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 p-6 flex flex-col gap-5 z-40">
               {[
                 { id: 'text', icon: <Type size={22} />, label: 'Type' },
                 { id: 'stickers', icon: <Smile size={22} />, label: 'Vibe' },
                 { id: 'music', icon: <Music size={22} />, label: 'Audio' },
                 { id: 'quality', icon: <Monitor size={22} />, label: 'Res' },
                 { id: 'layers', icon: <Sparkles size={22} />, label: 'Magic' }
               ].map(tool => (
                 <button 
                  key={tool.id}
                  className="flex flex-col items-center gap-1.5 group"
                 >
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 active:scale-90 transition-all shadow-2xl group-hover:shadow-orange-500/20">
                      {tool.icon}
                    </div>
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest group-hover:text-orange-500 transition-colors">{tool.label}</span>
                 </button>
               ))}
            </div>

            {/* Edit Drawer (Top Centered) */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-40">
               <input 
                 type="text" 
                 value={textOverlay} 
                 onChange={(e) => setTextOverlay(e.target.value)}
                 placeholder="CAPTION THE VIBE..."
                 className="w-full bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 text-white placeholder-white/10 font-black focus:border-orange-500 outline-none text-center uppercase tracking-[0.2em] shadow-3xl text-sm"
               />
               <div className="mt-4 flex justify-center gap-4">
                 {['fire', 'nexus', 'diamond', 'rocket'].map(s => (
                   <button 
                    key={s} 
                    onClick={() => addSticker(s)} 
                    className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl hover:bg-orange-500/20 hover:border-orange-500 border border-white/10 transition-all text-2xl flex items-center justify-center"
                   >
                      {s === 'fire' ? '🔥' : s === 'nexus' ? '✨' : s === 'diamond' ? '💎' : '🚀'}
                   </button>
                 ))}
               </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-10 inset-x-0 px-10 flex justify-between items-center z-40">
               <button onClick={() => setStage(1)} className="px-6 py-3 text-white/40 font-black uppercase text-xs tracking-widest hover:text-white transition-all">
                  Retake
               </button>
               <button 
                onClick={() => setStage(3)}
                className="group px-10 py-5 bg-orange-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-500/20"
               >
                Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div 
            key="stage3"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col md:flex-row items-center justify-center p-8 gap-12"
          >
            {/* Minimalist Preview */}
            <div className="w-full max-w-[260px] aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)] border-4 border-white/5 relative">
               {mediaType === 'video' ? (
                 <video src={capturedMedia!} autoPlay loop playsInline className="w-full h-full object-cover" />
               ) : (
                 <img src={capturedMedia!} className="w-full h-full object-cover" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Final Posting Form */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex flex-col gap-8 shadow-3xl">
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">Publish</h2>
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em]">Global Nexus Release</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                    <Sparkles size={20} className="text-orange-500" />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Description</p>
                     <span className="px-2 py-0.5 bg-white/5 rounded-full text-[8px] text-white/30 font-black uppercase">Auth: @{user?.displayName?.replace(/\s+/g, '')}</span>
                  </div>
                  <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Capture the vibe of this moment forever..."
                    className="w-full h-40 bg-black/40 border border-white/10 rounded-[2rem] p-6 text-white placeholder-white/10 outline-none focus:border-orange-500 transition-all resize-none font-bold"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                     <div className="flex items-center gap-2 mb-2">
                        <Monitor size={14} className="text-purple-400" />
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Quality</span>
                     </div>
                     <p className="text-base text-white font-black">{quality} Vibe</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                     <div className="flex items-center gap-2 mb-2">
                        <ArrowRight size={14} className="text-blue-400" />
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Share</span>
                     </div>
                     <p className="text-base text-white font-black truncate">The Nexus</p>
                  </div>
               </div>

               <div className="flex gap-4 pt-4 mt-auto">
                  <button onClick={() => setStage(2)} className="w-16 h-16 bg-white/5 rounded-3xl text-white/20 hover:text-white transition-all flex items-center justify-center">
                     <RotateCw size={24} />
                  </button>
                  <button 
                    onClick={() => onPost({ 
                      videoUrl: capturedMedia, 
                      caption,
                      userName: user?.displayName || 'Anonymous',
                      userPhoto: user?.photoURL || '',
                      quality,
                      platform: 'nexora',
                      type: mediaType
                    })}
                    className="flex-1 p-5 bg-white text-black rounded-3xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Post Now <Send size={22} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
