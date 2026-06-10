import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Share2, Plus, Sparkles, Camera, ArrowLeft, RefreshCw, Check, Film, Upload, Trash2, ArrowUpDown, ChevronDown, ChevronUp, AlertCircle, Smile, X } from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';

interface VideoItem {
  id: string;
  title: string;
  creator: string;
  creatorPhoto?: string;
  videoUrl: string;
  description: string;
  likes: number;
  dislikes: number;
  commentsCount: number;
  likedBy: string[];
  dislikedBy: string[];
}

interface TikTokReelsProps {
  onBack: () => void;
  user: any;
  showToast: (m: string, t?: 'success' | 'info' | 'error') => void;
  play: (soundKey: any) => void;
}

const STOCK_REELS: VideoItem[] = [
  {
    id: 'reef1',
    title: 'Aesthetic Deep Orbit',
    creator: 'SpaceVoyager',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-star-fields-in-outer-space-42617-large.mp4',
    description: 'Traversing the cosmic boundaries under full offline engine capability. Focus sequence is solid! #space #ambient #nature',
    likes: 342,
    dislikes: 12,
    commentsCount: 22,
    likedBy: [],
    dislikedBy: []
  },
  {
    id: 'reef2',
    title: 'Cyberpunk Shinjuku Nights',
    creator: 'CyberRunner',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-looking-street-filled-with-neon-signs-and-lights-40019-large.mp4',
    description: 'Late night coding vibes under high emission holographic spectrums. Let\'s optimize the nexus! #neon #programming',
    likes: 852,
    dislikes: 3,
    commentsCount: 94,
    likedBy: [],
    dislikedBy: []
  },
  {
    id: 'reef3',
    title: 'Forest Deep Stream Therapy',
    creator: 'ZenMaster',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    description: 'Calibrate your respiratory breathing multiplier with this natural audio sync. Stream focus, offline. #nature #ambient',
    likes: 194,
    dislikes: 8,
    commentsCount: 15,
    likedBy: [],
    dislikedBy: []
  }
];

export function TikTokReels({ onBack, user, showToast, play }: TikTokReelsProps) {
  const [reelsList, setReelsList] = useState<VideoItem[]>(STOCK_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Camera Simulation and Upload Steps states
  const [showCreatorEngine, setShowCreatorEngine] = useState(false);
  const [creatorStep, setCreatorStep] = useState<'camera' | 'edit' | 'details'>('camera');
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(15);
  const [selectedSecondsLimit, setSelectedSecondsLimit] = useState<number>(15);
  const [activeFilter, setActiveFilter] = useState<string>('Normal');
  const [recordedVideoBlobUrl, setRecordedVideoBlobUrl] = useState<string | null>(null);
  
  // Editorial and input details
  const [editorDescription, setEditorDescription] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [hasNewCustomVideo, setHasNewCustomVideo] = useState(false);

  // Comments Drawer State
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [commentsList, setCommentsList] = useState<Record<string, { id: string; author: string; photo?: string; text: string; time: string }[]>>({
    'reef1': [
      { id: 'c1', author: 'NexusNovice', text: 'Stunning visual consistency bro! ✨', time: '12m ago' },
      { id: 'c2', author: 'ZenMeditator', text: 'Perfect ambient speed for standard deep state alignment.', time: '2h ago' }
    ],
    'reef2': [
      { id: 'c3', author: 'ByteSlinger', text: 'Need this layout in my personal terminal right now.', time: '3h ago' }
    ]
  });
  const [newCommentInput, setNewCommentInput] = useState('');

  // Refs for video playback control
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Snap to video helper
  const handleScrollToNext = (dir: 'next' | 'prev') => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    if (dir === 'next' && currentIndex < reelsList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (dir === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      showToast(dir === 'next' ? 'End of global reels feed' : 'Top of global reels feed', 'info');
    }
  };

  // Pause others when currentIndex changes
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const vid = videoRefs.current[key];
      if (vid) {
        if (key === reelsList[currentIndex].id) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
          vid.currentTime = 0;
        }
      }
    });
  }, [currentIndex, reelsList]);

  // Handle upvoting
  const handleLike = (id: string) => {
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    setReelsList(prev => prev.map(reel => {
      if (reel.id === id) {
        const userId = user?.uid || 'guest';
        const alreadyLiked = reel.likedBy.includes(userId);
        const alreadyDisliked = reel.dislikedBy.includes(userId);
        let updatedLikedBy = [...reel.likedBy];
        let updatedDislikedBy = [...reel.dislikedBy];
        let diffLike = 0;
        let diffDislike = 0;

        if (alreadyLiked) {
          updatedLikedBy = updatedLikedBy.filter(u => u !== userId);
          diffLike = -1;
        } else {
          updatedLikedBy.push(userId);
          diffLike = 1;
          if (alreadyDisliked) {
            updatedDislikedBy = updatedDislikedBy.filter(u => u !== userId);
            diffDislike = -1;
          }
        }
        return {
          ...reel,
          likedBy: updatedLikedBy,
          dislikedBy: updatedDislikedBy,
          likes: Math.max(0, reel.likes + diffLike),
          dislikes: Math.max(0, reel.dislikes + diffDislike)
        };
      }
      return reel;
    }));
    play('quest_complete');
  };

  // Handle downvoting
  const handleDislike = (id: string) => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    setReelsList(prev => prev.map(reel => {
      if (reel.id === id) {
        const userId = user?.uid || 'guest';
        const alreadyLiked = reel.likedBy.includes(userId);
        const alreadyDisliked = reel.dislikedBy.includes(userId);
        let updatedLikedBy = [...reel.likedBy];
        let updatedDislikedBy = [...reel.dislikedBy];
        let diffLike = 0;
        let diffDislike = 0;

        if (alreadyDisliked) {
          updatedDislikedBy = updatedDislikedBy.filter(u => u !== userId);
          diffDislike = -1;
        } else {
          updatedDislikedBy.push(userId);
          diffDislike = 1;
          if (alreadyLiked) {
            updatedLikedBy = updatedLikedBy.filter(u => u !== userId);
            diffLike = -1;
          }
        }
        return {
          ...reel,
          likedBy: updatedLikedBy,
          dislikedBy: updatedDislikedBy,
          likes: Math.max(0, reel.likes + diffLike),
          dislikes: Math.max(0, reel.dislikes + diffDislike)
        };
      }
      return reel;
    }));
  };

  // Adding comment
  const handleAddComment = () => {
    if (!newCommentInput.trim()) return;
    const activeReelId = reelsList[currentIndex].id;
    const newComment = {
      id: Math.random().toString(),
      author: user?.displayName || 'Anonymous Transponder',
      photo: user?.photoURL,
      text: newCommentInput.trim(),
      time: 'Just now'
    };

    setCommentsList(prev => ({
      ...prev,
      [activeReelId]: [newComment, ...(prev[activeReelId] || [])]
    }));

    setReelsList(prev => prev.map(r => r.id === activeReelId ? { ...r, commentsCount: r.commentsCount + 1 } : r));
    setNewCommentInput('');
    vibrate(VIBRATION_PATTERNS.CLICK);
  };

  // Simulated Camera Recording triggers
  const recordingTimerRef = useRef<any>(null);
  const handleToggleRecord = () => {
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    if (isRecording) {
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      // Finished simulation - lock mock video
      setRecordedVideoBlobUrl('https://assets.mixkit.co/videos/preview/mixkit-flying-through-star-fields-in-outer-space-42617-large.mp4');
      setCreatorStep('edit');
      showToast('Recording processed successfully at extreme 4K resolution!', 'success');
    } else {
      setIsRecording(true);
      setRecordingSeconds(selectedSecondsLimit);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(recordingTimerRef.current);
            setIsRecording(false);
            setRecordedVideoBlobUrl('https://assets.mixkit.co/videos/preview/mixkit-flying-through-star-fields-in-outer-space-42617-large.mp4');
            setCreatorStep('edit');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Simulate File uploading
  const handleLocalFileChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      vibrate(VIBRATION_PATTERNS.CLICK);
      setRecordedVideoBlobUrl('https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-developer-typing-on-a-computer-keyboard-40251-large.mp4');
      setCreatorStep('edit');
      showToast('Preserved native visual quality. Media staging completed!', 'success');
    }
  };

  // Publishing TikTok loop
  const handlePublishReel = () => {
    if (!editorTitle.trim() || !editorDescription.trim()) {
      showToast('Headline Title and Description are required!', 'error');
      return;
    }
    setIsPosting(true);
    setUploadPercent(0);
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);

    // Smooth numerical upload counter
    const uploaderInterval = setInterval(() => {
      setUploadPercent(prev => {
        if (prev >= 100) {
          clearInterval(uploaderInterval);
          setIsPosting(false);
          setShowCreatorEngine(false);

          // Add to reels state
          const newReel: VideoItem = {
            id: 'custom-' + Date.now(),
            title: editorTitle,
            creator: user?.displayName || 'Anonymous Coder',
            creatorPhoto: user?.photoURL || undefined,
            videoUrl: recordedVideoBlobUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-developer-typing-on-a-computer-keyboard-40251-large.mp4',
            description: `${editorDescription} #nexora #custom #reels`,
            likes: 1,
            dislikes: 0,
            commentsCount: 0,
            likedBy: [user?.uid || 'guest'],
            dislikedBy: []
          };

          setReelsList(prev => [newReel, ...prev]);
          setCurrentIndex(0);
          setEditorTitle('');
          setEditorDescription('');
          setRecordedVideoBlobUrl(null);
          setHasNewCustomVideo(true);
          showToast('TikTok Loop broadcasted live to everyone!', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const activeReel = reelsList[currentIndex];
  const activeComments = commentsList[activeReel?.id] || [];

  // Filter effect css settings
  const getFilterStyle = (filterName: string) => {
    switch (filterName) {
      case 'Cyberpunk': return 'hue-rotate-90 saturate-[1.8] contrast-125 brightness-110';
      case 'Retrowave': return 'sepia contrast-[1.4] saturate-[1.6] hue-rotate-[320deg]';
      case 'Space Glow': return 'saturate-[1.5] brightness-125 contrast-110';
      case 'Golden Hour': return 'sepia-[0.3] saturate-125 brightness-105';
      case 'Monolith': return 'grayscale contrast-200';
      default: return '';
    }
  };

  return (
    <div className="relative h-[92vh] max-h-[820px] rounded-[2.5rem] bg-black overflow-hidden flex flex-col shadow-2xl border border-slate-900">
      
      {/* Top absolute header controls with back, creator triggers */}
      <div className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-2xl transition-all border border-white/10 backdrop-blur-md active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex bg-black/40 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md items-center gap-1">
          <Film size={16} className="text-red-500 animate-pulse" />
          <span className="text-[10px] text-white uppercase font-black tracking-widest">Nexora Loops</span>
        </div>
        <button 
          onClick={() => {
            setCreatorStep('camera');
            setShowCreatorEngine(true);
          }}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all shadow-xl shadow-red-900/30 active:scale-95"
          title="Create Loop"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Snap loop scrolling viewport */}
      <div className="relative flex-1 bg-neutral-950 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Dynamic loop video */}
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={el => { videoRefs.current[activeReel.id] = el; }}
            src={activeReel.videoUrl}
            className={`w-full h-full object-cover select-none pointer-events-auto transition-all duration-300 ${getFilterStyle(activeFilter)}`}
            loop
            muted={isMuted}
            autoPlay
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Up / Down navigation buttons (guarantees scroll stops in video) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-30 flex flex-col gap-3">
          <button 
            disabled={currentIndex === 0}
            onClick={() => handleScrollToNext('prev')}
            className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-xl border border-white/5 backdrop-blur-md disabled:opacity-20 disabled:scale-100 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronUp size={20} />
          </button>
          <button 
            disabled={currentIndex === reelsList.length - 1}
            onClick={() => handleScrollToNext('next')}
            className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-xl border border-white/5 backdrop-blur-md disabled:opacity-20 disabled:scale-100 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Floating Side Action Panel (TikTok style) */}
        <div className="absolute right-4 bottom-24 z-30 flex flex-col items-center gap-6">
          
          {/* Creator Avatar */}
          <div className="relative flex flex-col items-center">
             <div className="w-12 h-12 rounded-full border-2 border-red-500 overflow-hidden shadow-lg bg-zinc-800">
                {activeReel.creatorPhoto ? (
                  <img src={activeReel.creatorPhoto} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs font-black text-rose-400">
                     {activeReel.creator.substring(0,2).toUpperCase()}
                  </div>
                )}
             </div>
             <div className="absolute -bottom-2 bg-red-600 text-white p-0.5 rounded-full text-[8px] font-bold">
                <Plus size={8} />
             </div>
          </div>

          {/* Upvote / Like */}
          <button 
            onClick={() => handleLike(activeReel.id)}
            className="flex flex-col items-center text-center group"
          >
             <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-md group-active:scale-90">
                <Heart size={20} fill={activeReel.likedBy.includes(user?.uid || 'guest') ? '#ef4444' : 'none'} className={activeReel.likedBy.includes(user?.uid || 'guest') ? 'text-red-500' : 'text-white'} />
             </div>
             <span className="text-[10px] text-white font-extrabold mt-1 tracking-wider">{activeReel.likes}</span>
          </button>

          {/* Downvote */}
          <button 
            onClick={() => handleDislike(activeReel.id)}
            className="flex flex-col items-center text-center group"
          >
             <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-md group-active:scale-90">
                <Smile size={20} className={`transform rotate-180 ${activeReel.dislikedBy.includes(user?.uid || 'guest') ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
             </div>
             <span className="text-[10px] text-white font-extrabold mt-1 tracking-wider">Down</span>
          </button>

          {/* Comments */}
          <button 
            onClick={() => setShowCommentsDrawer(true)}
            className="flex flex-col items-center text-center group"
          >
             <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-md group-active:scale-90">
                <MessageSquare size={20} />
             </div>
             <span className="text-[10px] text-white font-extrabold mt-1 tracking-wider">{activeReel.commentsCount}</span>
          </button>

          {/* Share */}
          <button 
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.CLICK);
              navigator.clipboard.writeText(`${window.location.origin}/reels/${activeReel.id}`);
              showToast('Loop Link Encrypted and Copied! 🔗', 'success');
            }}
            className="flex flex-col items-center text-center group"
          >
             <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-md group-active:scale-90">
                <Share2 size={20} />
             </div>
             <span className="text-[10px] text-zinc-400 font-bold mt-1 tracking-wider">Share</span>
          </button>

        </div>

        {/* Post metadata info bottom overlay */}
        <div className="absolute left-6 bottom-6 right-20 z-20 space-y-2 pointer-events-none text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-600 text-white font-black uppercase tracking-wider">LIVE</span>
            <p className="font-extrabold text-sm text-white drop-shadow-md">@{activeReel.creator}</p>
          </div>
          <h4 className="font-black text-xs text-slate-200 drop-shadow-md">{activeReel.title}</h4>
          <p className="text-xs text-zinc-300 leading-snug drop-shadow-md font-semibold font-sans">
            {activeReel.description}
          </p>
        </div>

      </div>

      {/* Numerical Publishing percentage upload indicator */}
      {isPosting && (
        <div className="absolute left-6 bottom-24 z-50 bg-slate-900 border border-slate-700/60 p-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce">
          <div className="w-10 h-14 bg-black rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center border border-slate-800">
             <Film size={18} className="text-red-500 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
               <p className="text-[9px] font-black tracking-widest text-white uppercase">EXPORT COMPRESSOR</p>
            </div>
            <p className="text-xs font-black text-rose-400 mt-0.5">Uploading Flow: {uploadPercent}%</p>
          </div>
        </div>
      )}

      {/* Dynamic Comments Drawer container */}
      <AnimatePresence>
        {showCommentsDrawer && (
          <>
            <div className="fixed inset-0 z-[120] bg-black/20" onClick={() => setShowCommentsDrawer(false)} />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute left-0 right-0 bottom-0 bg-zinc-900 rounded-t-[2.5rem] border-t border-zinc-800 p-6 z-[130] h-[55%] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                 <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Comments Spectrum ({activeComments.length})</h4>
                 <button onClick={() => setShowCommentsDrawer(false)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <X size={16} />
                 </button>
              </div>

              {/* Scrolling container */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                 {activeComments.length === 0 ? (
                   <div className="py-12 text-center opacity-30 text-zinc-500 text-xs font-bold">
                      Awaiting first protocol feedback. Share your thoughts!
                   </div>
                 ) : (
                   activeComments.map(comment => (
                     <div key={comment.id} className="flex gap-3 text-white">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-red-400 overflow-hidden uppercase">
                           {comment.author.substring(0, 2)}
                        </div>
                        <div className="flex-1">
                           <div className="bg-zinc-800/40 p-3 rounded-2xl rounded-tl-none border border-zinc-800">
                             <div className="flex justify-between">
                                <span className="text-[10px] text-zinc-400 font-extrabold">@{comment.author}</span>
                                <span className="text-[8px] text-zinc-500">{comment.time}</span>
                             </div>
                             <p className="text-xs font-medium text-slate-100 mt-1">{comment.text}</p>
                           </div>
                        </div>
                     </div>
                   ))
                 )}
              </div>

              {/* Input container */}
              <div className="pt-3 border-t border-zinc-800 flex items-center gap-3">
                 <input 
                   type="text"
                   placeholder="Join feed protocol comment..."
                   value={newCommentInput}
                   onChange={e => setNewCommentInput(e.target.value)}
                   className="flex-1 bg-zinc-800 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-red-500"
                 />
                 <button 
                   onClick={handleAddComment}
                   className="p-2.5 bg-red-600 rounded-xl text-white hover:bg-red-700 font-bold text-xs"
                 >
                    Send
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Creator Engine (Simulated 4K camera recorder) */}
      <AnimatePresence>
        {showCreatorEngine && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="absolute inset-0 bg-zinc-950 z-[200] flex flex-col p-6 text-white"
          >
             <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setShowCreatorEngine(false)}
                  className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-300"
                >
                   <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                   <span className="text-xs font-black uppercase tracking-widest text-zinc-200">CREATOR INTERFACE</span>
                </div>
                <div className="w-10 h-10" />
             </div>

             {/* Staging Camera Page */}
             {creatorStep === 'camera' && (
                <div className="flex-1 flex flex-col">
                   <div className="relative flex-1 bg-neutral-900 rounded-[2rem] border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center">
                      <video 
                        src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-developer-typing-on-a-computer-keyboard-40251-large.mp4"
                        className={`absolute inset-0 w-full h-full object-cover opacity-45 cursor-none pointer-events-none transform ${cameraFacing === 'front' ? 'scale-x-[-1]' : ''}`}
                        autoPlay
                        loop
                        muted
                      />
                      
                      {/* Grid overlays */}
                      <div className="absolute inset-0 border border-white/5 pointer-events-none flex flex-col justify-between">
                         <div className="h-1/3 border-b border-white/5" />
                         <div className="h-1/3 border-b border-white/5" />
                      </div>
                      <div className="absolute inset-0 pointer-events-none flex justify-between">
                         <div className="w-1/3 border-r border-white/5" />
                         <div className="w-1/3 border-r border-white/5" />
                      </div>

                      <div className="relative flex flex-col items-center justify-center space-y-4 p-8 text-center bg-black/60 rounded-[2rem] border border-white/10 z-10 m-4">
                         <Camera size={44} className={isRecording ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
                         <div>
                            <p className="font-extrabold text-sm">Awaiting Record Command</p>
                            <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">Simulating ultra high-fidelity UHD camera encoder interface.</p>
                         </div>
                      </div>

                      {/* Filter preview HUD overlay */}
                      <div className="absolute top-4 right-4 bg-black/50 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-bold text-red-400 flex items-center gap-1">
                         <Sparkles size={12} /> {activeFilter} Filter
                      </div>

                      {/* Bottom camera dashboard */}
                      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20">
                         
                         {/* File Uploader Next to record button */}
                         <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 bg-zinc-800/80 hover:bg-zinc-800 text-white rounded-2xl border border-white/10 transition-all active:scale-90 flex flex-col items-center gap-1"
                         >
                            <Upload size={18} />
                            <span className="text-[9px] font-bold">Staging</span>
                         </button>
                         <input 
                           type="file"
                           ref={fileInputRef}
                           onChange={handleLocalFileChoose}
                           accept="image/*,video/*"
                           className="hidden"
                         />

                         {/* Big red record button */}
                         <button 
                           onClick={handleToggleRecord}
                           className={`w-18 h-18 rounded-full border-4 border-white flex items-center justify-center transition-all ${isRecording ? 'bg-zinc-800 p-2Scale scale-110' : 'bg-red-600 hover:bg-red-500'}`}
                         >
                            {isRecording ? (
                              <div className="w-6 h-6 bg-red-600 rounded" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-red-600" />
                            )}
                         </button>

                         {/* Camera Lens switch */}
                         <button 
                           onClick={() => {
                             vibrate(VIBRATION_PATTERNS.CLICK);
                             setCameraFacing(prev => prev === 'back' ? 'front' : 'back');
                             showToast('Lens system shifted!', 'info');
                           }}
                           className="p-3 bg-zinc-800/80 hover:bg-zinc-800 text-white rounded-2xl border border-white/10 transition-all active:scale-90 flex flex-col items-center gap-1"
                         >
                            <RefreshCw size={18} className="transform hover:rotate-180 transition-transform duration-300" />
                            <span className="text-[9px] font-bold">Rotate</span>
                         </button>

                      </div>

                   </div>

                   {/* Seconds limit selection & Filter HUD */}
                   <div className="pt-4 grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 p-3 bg-zinc-900 rounded-2xl">
                         <p className="text-[9px] font-black uppercase text-zinc-500">Record Timeout Limit</p>
                         <div className="flex gap-2">
                           {[15, 30, 60].map(s => (
                              <button
                                key={s}
                                onClick={() => setSelectedSecondsLimit(s)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-black ${selectedSecondsLimit === s ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                              >
                                 {s}s
                              </button>
                           ))}
                         </div>
                      </div>
                      <div className="space-y-1.5 p-3 bg-zinc-900 rounded-2xl">
                         <p className="text-[9px] font-black uppercase text-zinc-500">Apply Filter Overlay</p>
                         <div className="flex overflow-x-auto gap-1.5 scrollbar-thin no-scrollbar">
                           {['Normal', 'Cyberpunk', 'Retrowave', 'Space Glow', 'Golden Hour', 'Monolith'].map(f => (
                              <button
                                key={f}
                                onClick={() => {
                                  setActiveFilter(f);
                                  vibrate(VIBRATION_PATTERNS.CLICK);
                                }}
                                className={`text-[10px] px-2 py-1.5 rounded-md font-bold whitespace-nowrap ${activeFilter === f ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                              >
                                 {f}
                              </button>
                           ))}
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {/* Filter editing stage */}
             {creatorStep === 'edit' && (
                <div className="flex-1 flex flex-col justify-between">
                   <div className="text-center py-4 bg-zinc-900 rounded-xl space-y-1">
                      <p className="text-sm font-black">Visual Post Processing</p>
                      <p className="text-[10px] text-zinc-400">Preview filters overlay active: {activeFilter}</p>
                   </div>

                   <div className="relative flex-1 max-h-[360px] bg-neutral-900 border border-zinc-800 rounded-[2rem] overflow-hidden my-4 flex items-center justify-center">
                      <video 
                        src={recordedVideoBlobUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-developer-typing-on-a-computer-keyboard-40251-large.mp4'}
                        className={`w-full h-full object-cover ${getFilterStyle(activeFilter)}`}
                        autoPlay
                        loop
                        muted
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent pointer-events-none" />
                   </div>

                   <div className="space-y-4">
                      <button 
                        onClick={() => setCreatorStep('details')}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-red-900/40"
                      >
                         Continue Post Stages
                      </button>
                      <button 
                        onClick={() => setCreatorStep('camera')}
                        className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs"
                      >
                         Re-record Footage
                      </button>
                   </div>
                </div>
             )}

             {/* Details & description step */}
             {creatorStep === 'details' && (
                <div className="flex-1 flex flex-col justify-between">
                   <div className="space-y-6">
                      
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reddit-Style Headline Title</label>
                         <input 
                           type="text"
                           placeholder="Describe your loop focus briefly..."
                           value={editorTitle}
                           onChange={e => setEditorTitle(e.target.value)}
                           className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs font-bold text-white placeholder-zinc-600 outline-none focus:border-red-600"
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">TikTok Description & Tags</label>
                         <textarea 
                           placeholder="Type tags like #space #workout #gym motivation guidelines here..."
                           value={editorDescription}
                           onChange={e => setEditorDescription(e.target.value)}
                           className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs font-bold text-white placeholder-zinc-600 outline-none h-32 resize-none focus:border-red-600"
                         />
                      </div>

                      <div className="p-4 bg-zinc-900 rounded-2xl flex items-start gap-3">
                         <AlertCircle size={16} className="text-purple-400 shrink-0 mt-0.5" />
                         <p className="text-[10px] text-zinc-400 leading-relaxed">Headline Title is mandatory. Once verified, this loop is added instantly to the global Nexus social spectrum.</p>
                      </div>

                   </div>

                   <button 
                     onClick={handlePublishReel}
                     className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold uppercase text-xs tracking-widest rounded-3xl"
                   >
                     Publish Loop Feed
                   </button>
                </div>
             )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
