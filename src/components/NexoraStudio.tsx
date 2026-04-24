import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Video, RotateCw, Check, Image as ImageIcon, 
  Type, Smile, Mic, Music, Sparkles, ArrowRight, Send, 
  Trash2, Volume2, Monitor, Play, Pause, Layers
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
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  
  // Custom video state for stage 2
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
  }, [stage]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 }, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapturePhoto = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        // Apply "Effect" (Simplified for demo: drawing a heart)
        if (selectedEffect === 'heart') {
          ctx.fillStyle = '#ff4b81';
          ctx.font = '80px Arial';
          ctx.fillText('❤️', canvas.width / 2 - 40, 100);
        }
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
    setStickers([...stickers, { id: Math.random().toString(), type, x: 50, y: 50 }]);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between pointer-events-none">
        <button 
          onClick={onClose}
          className="p-3 bg-black/20 backdrop-blur-xl rounded-full text-white/80 hover:text-white pointer-events-auto transition-all active:scale-95"
        >
          <X size={24} />
        </button>
        <div className="bg-black/20 backdrop-blur-xl px-4 py-2 rounded-full pointer-events-auto">
          <p className="text-xs font-black text-white/60 tracking-widest uppercase">
            Nexora Studio <span className="text-orange-500">Stage {stage}/3</span>
          </p>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

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
              className="w-full h-full object-cover"
            />
            
            {/* Effects Overlay Simple Demo */}
            {selectedEffect === 'heart' && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 text-8xl animate-bounce">
                ❤️
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center gap-8 bg-gradient-to-t from-black/80 to-transparent">
              {/* Effects Selector */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar w-full max-w-sm px-4">
                {['none', 'heart', 'sparkles', 'retro', 'neon'].map(eff => (
                  <button 
                    key={eff}
                    onClick={() => setSelectedEffect(eff === 'none' ? null : eff)}
                    className={`w-12 h-12 shrink-0 rounded-xl border-2 transition-all flex items-center justify-center ${selectedEffect === eff || (eff === 'none' && !selectedEffect) ? 'border-orange-500 bg-orange-500/20' : 'border-white/20 bg-white/10'}`}
                  >
                    {eff === 'none' ? <RotateCw size={18} className="text-white/40" /> : <Sparkles size={18} className="text-white" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-12">
                <label className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl text-white cursor-pointer hover:bg-white/20 transition-all active:scale-95">
                  <ImageIcon size={24} />
                  <input type="file" accept="video/*,image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <div className="relative group">
                  <button 
                    onClick={isRecording ? stopRecording : handleCapturePhoto}
                    onContextMenu={(e) => { e.preventDefault(); startRecording(); }}
                    className={`w-20 h-20 rounded-full border-4 ${isRecording ? 'border-red-500 p-2' : 'border-white p-1'} transition-all`}
                  >
                    <div className={`w-full h-full rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white'} transition-all`} />
                  </button>
                  {!isRecording && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg pointer-events-none">
                      <p className="text-[10px] text-white/60 uppercase font-black tracking-widest whitespace-nowrap">Press for photo • Hold for video</p>
                    </div>
                  )}
                </div>

                <button className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl text-white opacity-40">
                  <RotateCw size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div 
            key="stage2"
            initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
            className="w-full h-full flex flex-col md:flex-row"
          >
            {/* Preview Area */}
            <div className="flex-1 relative bg-neutral-900 overflow-hidden flex items-center justify-center">
              {mediaType === 'video' ? (
                <video src={capturedMedia!} autoPlay loop className="max-h-full w-auto" />
              ) : (
                <img src={capturedMedia!} className="max-h-full w-auto" />
              )}

              {/* Render Text Overlay */}
              {textOverlay && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-black drop-shadow-lg text-center px-6">
                  {textOverlay}
                </div>
              )}

              {/* Render Stickers */}
              {stickers.map(s => (
                <div key={s.id} className="absolute text-5xl cursor-move" style={{ top: `${s.y}%`, left: `${s.x}%` }}>
                  {s.type === 'fire' ? '🔥' : s.type === 'nexus' ? '✨' : '💎'}
                </div>
              ))}
            </div>

            {/* Sidebar / Tools */}
            <div className="w-full md:w-80 bg-black/90 p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
              <h2 className="text-xl font-black text-white italic tracking-tighter">EDIT VIBE</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3 text-orange-500">
                    <Type size={18} />
                    <p className="text-xs font-black uppercase tracking-widest">Add Text</p>
                  </div>
                  <input 
                    type="text" 
                    value={textOverlay} 
                    onChange={(e) => setTextOverlay(e.target.value)}
                    placeholder="Type something clean..."
                    className="w-full bg-black/40 text-white p-3 rounded-xl border border-white/5 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3 text-blue-400">
                    <Smile size={18} />
                    <p className="text-xs font-black uppercase tracking-widest">Stickers</p>
                  </div>
                  <div className="flex gap-2">
                    {['fire', 'nexus', 'diamond', 'rocket'].map(s => (
                      <button 
                        key={s}
                        onClick={() => addSticker(s)}
                        className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500/20 transition-colors"
                      >
                        {s === 'fire' ? '🔥' : s === 'nexus' ? '✨' : s === 'diamond' ? '💎' : '🚀'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3 text-green-400">
                    <Mic size={18} />
                    <p className="text-xs font-black uppercase tracking-widest">Audio & Voice</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 p-2 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <Music size={14} /> Import
                    </button>
                    <button className="flex-1 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center justify-center gap-2">
                      <Mic size={14} /> Record
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3 text-purple-400">
                    <Monitor size={18} />
                    <p className="text-xs font-black uppercase tracking-widest">Quality</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Standard', 'HD', '4K', 'Ultra'].map((q: any) => (
                      <button 
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${quality === q ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 flex gap-3">
                <button 
                  onClick={() => setStage(1)}
                  className="flex-1 p-4 bg-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs"
                >
                  Regret
                </button>
                <button 
                  onClick={() => setStage(3)}
                  className="flex-[2] p-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div 
            key="stage3"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}
            className="w-full max-w-xl p-8"
          >
            <div className="glass-card overflow-hidden bg-white/10 border-white/20">
              <div className="flex flex-col md:flex-row h-full">
                {/* Visual Preview */}
                <div className="w-full md:w-64 bg-black/40 flex items-center justify-center relative p-4">
                  {mediaType === 'video' ? (
                    <video src={capturedMedia!} className="w-full aspect-[9/16] rounded-xl object-cover shadow-2xl" />
                  ) : (
                    <img src={capturedMedia!} className="w-full aspect-[9/16] rounded-xl object-cover shadow-2xl" />
                  )}
                  <div className="absolute top-6 left-6 text-2xl">✨</div>
                </div>

                {/* Post Options */}
                <div className="flex-1 p-8 flex flex-col gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-2 italic tracking-tighter">FINAL VIBE</h2>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Details & Shadows</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Caption</p>
                    <textarea 
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write something that resonates... 🏮"
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 outline-none focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                      <p className="text-[10px] text-white/40 uppercase font-black mb-1">Quality</p>
                      <p className="text-sm text-white font-black">{quality}</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                      <p className="text-[10px] text-white/40 uppercase font-black mb-1">Account</p>
                      <p className="text-sm text-white font-black truncate">@{user?.displayName || 'Anonymous'}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex gap-4">
                    <button 
                      onClick={() => setStage(2)}
                      className="p-4 text-white/40 hover:text-white transition-colors"
                    >
                      <RotateCw size={20} />
                    </button>
                    <button 
                      onClick={() => onPost({ 
                        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Mock upload
                        caption,
                        userName: user?.displayName || 'Anonymous',
                        userPhoto: user?.photoURL || '',
                        quality,
                        type: mediaType
                      })}
                      className="flex-1 p-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Post Globally <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
              Your vibe will be shared with the entire Nexus community
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
