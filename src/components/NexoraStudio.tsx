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
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Edit state for stage 2
  const [textOverlay, setTextOverlay] = useState('');
  const [stickers, setStickers] = useState<{ id: string, type: string, x: number, y: number }[]>([]);
  const [quality, setQuality] = useState<'Standard' | 'HD' | '4K' | 'Ultra'>('HD');
  const [caption, setCaption] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (stage === 1) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [stage, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      };

      console.log("Requesting camera with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera stream obtained:", stream.id);
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    } catch (err: any) {
      console.error("Camera access error details:", err);
      setCameraError(err.message || 'Camera blocked or unavailable');
      
      // Try fallback to simpler constraints
      try {
        console.log("Attempting fallback camera constraints...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraError(null);
        }
      } catch (fallbackErr) {
        setCameraError('Fully blocked. Check browser permissions, bro! 🛡️');
      }
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
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Finalize effect drawing on capture if needed
        setCapturedMedia(canvas.toDataURL('image/jpeg'));
        setMediaType('photo');
        setStage(2);
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      startCamera();
      return;
    }
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
      case 'retro': return 'sepia(0.8) contrast(1.2) brightness(0.9)';
      case 'neon': return 'hue-rotate(90deg) saturate(2) brightness(1.2)';
      case 'noir': return 'grayscale(1) contrast(1.5)';
      case 'cyber': return 'hue-rotate(180deg) invert(0.1) saturate(1.5)';
      default: return 'none';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-sans select-none">
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
            
            {/* Real-time Visual Overlays */}
            <div className="absolute inset-0 pointer-events-none z-10">
               {selectedEffect === 'heart' && (
                 <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl animate-pulse drop-shadow-[0_0_50px_rgba(255,0,0,0.8)] z-10">
                   ❤️
                 </div>
               )}
               {selectedEffect === 'nexus' && (
                 <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-[90vw] h-[90vw] border-[10px] border-orange-500/20 rounded-full"
                    />
                    <Sparkles className="text-orange-500 absolute w-48 h-48 animate-pulse" />
                 </div>
               )}
               {selectedEffect === 'ghost' && (
                 <div className="absolute inset-0 bg-white/5 backdrop-blur-sm mix-blend-overlay flex items-center justify-center opacity-20">
                    <Ghost size={400} className="text-white animate-bounce" />
                 </div>
               )}
            </div>

            {cameraError && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-10 text-center">
                 <div className="max-w-xs space-y-4">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Camera size={40} className="text-red-500" />
                    </div>
                    <p className="text-white font-black uppercase text-sm tracking-widest leading-loose">{cameraError}</p>
                    <button 
                      onClick={() => startCamera()}
                      className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                      Retry Connection
                    </button>
                    <button 
                      onClick={onClose}
                      className="block mx-auto text-white/40 font-bold text-[10px] uppercase tracking-widest pt-4"
                    >
                      Go Back
                    </button>
                 </div>
              </div>
            )}

            {/* Stage 1 Top Interface */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-30">
               <button onClick={onClose} className="w-14 h-14 bg-black/40 backdrop-blur-3xl rounded-3xl text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 shadow-2xl border border-white/10">
                  <X size={28} />
               </button>
               
               <div className="flex flex-col gap-5">
                  <button onClick={toggleCamera} className="w-14 h-14 bg-black/40 backdrop-blur-3xl rounded-3xl text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 shadow-2xl border border-white/10">
                     <RotateCw size={28} />
                  </button>
                  <button className="w-14 h-14 bg-black/40 backdrop-blur-3xl rounded-3xl text-white flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 shadow-2xl border border-white/10">
                     <Monitor size={28} />
                  </button>
               </div>
            </div>

            {/* Stage 1 Bottom Feed */}
            <div className="absolute bottom-0 left-0 right-0 p-10 pt-32 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center gap-12 z-30">
              {/* Horizontal Effects Selection */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar w-full max-w-lg px-8 pb-4">
                {['none', 'heart', 'nexus', 'ghost', 'retro', 'neon', 'noir', 'cyber'].map(eff => (
                  <button 
                    key={eff}
                    onClick={() => setSelectedEffect(eff === 'none' ? null : eff)}
                    className="flex flex-col items-center gap-3 shrink-0"
                  >
                    <div className={`w-18 h-18 rounded-3xl border-2 transition-all flex items-center justify-center overflow-hidden ${selectedEffect === eff || (eff === 'none' && !selectedEffect) ? 'border-orange-500 bg-orange-500/20 scale-110 shadow-lg shadow-orange-500/20' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                      {eff === 'none' ? <div className="w-8 h-8 rounded-full border-2 border-white/20" /> : 
                       eff === 'heart' ? <span className="text-2xl">❤️</span> : 
                       eff === 'nexus' ? <Sparkles className="text-orange-500" size={24} /> :
                       eff === 'ghost' ? <Ghost className="text-white/40" size={24} /> :
                       <div className={`w-full h-full bg-gradient-to-br ${eff === 'retro' ? 'from-amber-800 to-orange-950' : eff === 'neon' ? 'from-pink-600 to-indigo-600' : eff === 'noir' ? 'from-neutral-900 to-neutral-700' : 'from-cyan-400 to-blue-600'}`} />}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${selectedEffect === eff || (eff === 'none' && !selectedEffect) ? 'text-orange-500' : 'text-white/30'}`}>{eff}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-16">
                <label className="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-3xl text-white flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all border border-white/10 shadow-2xl overflow-hidden active:scale-90">
                  <ImageIcon size={22} />
                  <input type="file" accept="video/*,image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <div className="relative">
                   <button 
                     onClick={isRecording ? stopRecording : handleCapturePhoto}
                     onMouseDown={() => startRecording()}
                     onMouseUp={() => stopRecording()}
                     onTouchStart={() => startRecording()}
                     onTouchEnd={() => stopRecording()}
                     className={`w-28 h-28 rounded-full border-8 ${isRecording ? 'border-red-500 animate-pulse active:scale-95' : 'border-white hover:scale-105 active:scale-90'} shadow-2xl transition-all flex items-center justify-center p-2.5`}
                   >
                     <div className={`w-full h-full rounded-full ${isRecording ? 'bg-red-500 rounded-2xl' : 'bg-white'} transition-all`} />
                   </button>
                   {!isRecording && (
                     <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 shadow-2xl">
                       <p className="text-[9px] text-white font-black uppercase tracking-[0.2em] whitespace-nowrap">Tap: Take • Hold: Film</p>
                     </div>
                   )}
                </div>

                <div className="w-16 h-16" /> {/* Placeholder for symmetrical balance */}
              </div>
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div 
            key="stage2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full relative bg-black flex items-center justify-center"
          >
            {/* Full Screen Live Edit Preview */}
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
                          <p className="text-white text-5xl font-black italic text-center leading-none uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
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
                        className="absolute text-7xl cursor-grab active:cursor-grabbing" 
                        style={{ top: `${s.y}%`, left: `${s.x}%` }}
                      >
                        {s.type === 'fire' ? '🔥' : s.type === 'nexus' ? '✨' : s.type === 'diamond' ? '💎' : '🚀'}
                      </motion.div>
                    ))}
                  </div>
               </div>
            </div>

            {/* TOP ACTIONS ROW - HORIZONTAL & TRANSPARENT GLASS (TikTok Style Request) */}
            <div className="absolute top-16 right-6 left-auto flex flex-row items-center gap-4 z-50">
               {[
                 { id: 'text', icon: <Type size={22} />, label: 'Text' },
                 { id: 'vibe', icon: <Smile size={22} />, label: 'Sticker' },
                 { id: 'audio', icon: <Music size={22} />, label: 'Voices' },
                 { id: 'magic', icon: <Wand2 size={22} />, label: 'Lenses' },
                 { id: 'cut', icon: <Scissors size={22} />, label: 'Trim' }
               ].map(tool => (
                 <button 
                  key={tool.id}
                  onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                  className="flex flex-col items-center gap-1.5"
                 >
                    <div className={`w-14 h-14 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center justify-center text-white transition-all shadow-xl ${activeTool === tool.id ? 'bg-orange-500 border-orange-500 scale-110' : 'hover:bg-white/20 active:scale-90'}`}>
                      {tool.icon}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${activeTool === tool.id ? 'text-orange-500' : 'text-white/40'}`}>{tool.label}</span>
                 </button>
               ))}
            </div>

            {/* CONTEXTUAL TOOL DRAWER - Only shows for active tool */}
            <AnimatePresence>
              {activeTool && (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-sm p-6 z-50"
                >
                   <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-3xl">
                      {activeTool === 'text' && (
                        <div className="space-y-4">
                           <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.3em] text-center">Type Your Energy</p>
                           <input 
                              autoFocus
                              type="text" 
                              value={textOverlay} 
                              onChange={(e) => setTextOverlay(e.target.value)}
                              placeholder="CAPTION IT..."
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black text-center text-xl uppercase tracking-tighter outline-none focus:border-orange-500"
                           />
                           <button onClick={() => setActiveTool(null)} className="w-full py-4 bg-orange-500 rounded-2xl text-black font-black uppercase text-[10px] tracking-widest">Done</button>
                        </div>
                      )}
                      {activeTool === 'vibe' && (
                        <div className="flex justify-center gap-5">
                           {['fire', 'nexus', 'diamond', 'rocket'].map(s => (
                             <button key={s} onClick={() => addSticker(s)} className="w-16 h-16 bg-white/5 rounded-3xl hover:bg-orange-500/20 hover:border-orange-500 border border-white/10 transition-all text-3xl flex items-center justify-center">
                                {s === 'fire' ? '🔥' : s === 'nexus' ? '✨' : s === 'diamond' ? '💎' : '🚀'}
                             </button>
                           ))}
                        </div>
                      )}
                      {activeTool === 'audio' && (
                         <div className="flex flex-col gap-4">
                            <button className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-between">
                               Import From Phone <Music size={16} />
                            </button>
                            <button className="p-5 bg-orange-500/20 border border-orange-500/30 rounded-2xl text-orange-500 font-black uppercase text-[10px] tracking-widest flex items-center justify-between">
                               Record Voiceover <Mic size={16} />
                            </button>
                         </div>
                      )}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Nav Stage 2 */}
            <div className="absolute bottom-10 inset-x-0 px-10 flex justify-between items-center z-50">
               <button onClick={() => setStage(1)} className="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-3xl text-white/40 hover:text-white flex items-center justify-center transition-all border border-white/10">
                  <RotateCw size={24} />
               </button>
               
               <button 
                onClick={() => setStage(3)}
                className="px-12 py-6 bg-white text-black rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
               >
                Next <ArrowRight size={20} />
               </button>
            </div>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div 
            key="stage3"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative bg-neutral-950 flex flex-col items-center justify-center p-10"
          >
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-16 items-center">
               {/* Final Gaze Preview */}
               <div className="relative group mx-auto">
                  <div className="w-[300px] aspect-[9/16] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)] border-8 border-white/5 relative bg-black transform -rotate-2 group-hover:rotate-0 transition-transform duration-700">
                    {mediaType === 'video' ? (
                      <video src={capturedMedia!} autoPlay loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={capturedMedia!} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-8 right-8 text-white">
                       <p className="text-xs font-black italic mb-2">@{user?.displayName?.replace(/\s+/g, '')}</p>
                       <p className="text-[10px] opacity-60 leading-relaxed line-clamp-2">{caption || 'Vibe captured.'}</p>
                    </div>
                  </div>
               </div>

               {/* Configuration */}
               <div className="space-y-10">
                  <div>
                    <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none mb-3">Post Vibe</h2>
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em] pl-1">Stage 3/3: Digital Release</p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between px-2">
                        <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Add Description</p>
                        <Palette size={14} className="text-orange-500" />
                     </div>
                     <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Say something about your edit, bro!  Lanterns up. 🏮"
                        className="w-full h-44 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-white placeholder-white/10 font-bold focus:border-orange-500 outline-none transition-all resize-none shadow-inner"
                     />
                  </div>

                  <div className="flex gap-4">
                     <div className="flex-1 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                        <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-2">Quality</p>
                        <select 
                          value={quality}
                          onChange={(e: any) => setQuality(e.target.value)}
                          className="bg-transparent text-white font-black text-base outline-none cursor-pointer w-full"
                        >
                           <option value="Standard">Standard</option>
                           <option value="HD">High Definition</option>
                           <option value="4K">4K Master</option>
                           <option value="Ultra">Ultra Raw</option>
                        </select>
                     </div>
                     <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 w-24 flex items-center justify-center">
                        <FlipHorizontal className="text-white/20" size={24} />
                     </div>
                  </div>

                  <div className="pt-8 flex gap-5">
                    <button onClick={() => setStage(2)} className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all">
                       <Scissors size={28} />
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
                      className="flex-1 h-20 bg-orange-500 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.4em] flex items-center justify-center gap-4 shadow-[0_20px_60px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Post Globally <Send size={24} />
                    </button>
                  </div>
               </div>
            </div>
            
            <button onClick={onClose} className="absolute bottom-12 text-[10px] text-white/20 font-black uppercase tracking-[0.5em] hover:text-red-500 transition-colors">
               Cancel & Discard Edit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
