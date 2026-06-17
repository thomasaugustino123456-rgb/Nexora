import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Share2, Plus, Sparkles, Camera, ArrowLeft, RefreshCw, Check, Film, Upload, Trash2, ArrowUpDown, ChevronDown, ChevronUp, AlertCircle, Smile, X, Scissors, Volume2, Sliders, Type, Mic, Music, VolumeX, Volume1 } from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, increment, query, orderBy, limit } from 'firebase/firestore';

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
  mediaSequence?: { url: string; type: 'video' | 'image' }[];
  audioUrl?: string;
  isAuthorized?: boolean;
  type?: 'video' | 'photo';
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
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
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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

  // Real Media Staging & Control States
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Multiple files slideshow state
  const [stagedMediaList, setStagedMediaList] = useState<{ url: string; type: 'video' | 'image' }[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isEditorVideoPlaying, setIsEditorVideoPlaying] = useState(true);

  // Audio backing states
  const [stagedMusic, setStagedMusic] = useState<{ url: string; name: string; volume: number; splits: { id: string; start: number; end: number }[]; currentSplitIndex: number } | null>(null);
  const [stagedVoice, setStagedVoice] = useState<{ url: string; name: string; volume: number; splits: { id: string; start: number; end: number }[]; currentSplitIndex: number } | null>(null);

  const editorCanvasRef = useRef<HTMLDivElement>(null);
  const editorVideoRef = useRef<HTMLVideoElement>(null);

  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const voiceAudioRef = useRef<HTMLAudioElement>(null);

  // Active Dragging State for Overlay Items
  const [draggingItem, setDraggingItem] = useState<{ id: string; type: 'text' | 'sticker' } | null>(null);
  
  // Slideshow tracker for active viewing grid
  const [currentSlideshowIndex, setCurrentSlideshowIndex] = useState(0);
  
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

  // Advanced TikTok Pro Video Editor States
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [videoTimelineClips, setVideoTimelineClips] = useState<string[]>(['Main Foottrack']);
  const [stagedMusicName, setStagedMusicName] = useState<string | null>(null);
  const [editorBrightness, setEditorBrightness] = useState(100);
  const [editorContrast, setEditorContrast] = useState(100);
  const [editorSaturation, setEditorSaturation] = useState(100);
  const [isAutoQualityActive, setIsAutoQualityActive] = useState(false);
  const [editorTexts, setEditorTexts] = useState<{ id: string; text: string; x: number; y: number }[]>([]);
  const [editorStickers, setEditorStickers] = useState<{ id: string; sticker: string; x: number; y: number }[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceRecordDuration, setVoiceRecordDuration] = useState(0);
  const [stagedVoiceName, setStagedVoiceName] = useState<string | null>(null);
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);
  const [editorTextInputVal, setEditorTextInputVal] = useState('');
  const [editingToolActiveTab, setEditingToolActiveTab] = useState<'none' | 'text' | 'adjust' | 'stickers' | 'voice'>('none');

  // Input elements refs for editor uploads
  const musicUploadInputRef = useRef<HTMLInputElement>(null);
  const customStickerInputRef = useRef<HTMLInputElement>(null);
  const voiceRecordTimerRef = useRef<any>(null);

  // Floating animation elements
  const [floatingParticles, setFloatingParticles] = useState<{ id: string; x: number; y: number; emoji: string }[]>([]);

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

  // Real-time Firestore document sync
  useEffect(() => {
    const qVideos = query(collection(db, 'social_videos'), orderBy('createdAt', 'desc'));
    console.log("Firestore Audit: Querying collection 'social_videos' in TikTokReels...");
    const unsub = onSnapshot(qVideos, (snapshot) => {
      console.log(`Firestore Audit: Collection 'social_videos' queried. Retrieved ${snapshot.size} documents.`);
      const dbVideos = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const detectedType = data.type || (data.videoUrl && (
          data.videoUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || 
          data.videoUrl.includes('images.unsplash.com') ||
          data.videoUrl.includes('image')
        ) ? 'photo' : 'video');
        
        return {
          id: docSnap.id,
          title: data.caption?.split(':')[0]?.trim() || 'Custom Reel',
          creator: data.userName || 'Anonymous Coder',
          creatorPhoto: data.userPhoto || undefined,
          videoUrl: data.videoUrl,
          description: data.caption || '',
          likes: data.likes || 0,
          dislikes: 0,
          commentsCount: data.commentCount || 0,
          likedBy: data.likedBy || [],
          dislikedBy: [],
          mediaSequence: data.mediaSequence || [],
          audioUrl: data.audioUrl || undefined,
          isAuthorized: data.isAuthorized ?? true,
          type: detectedType
        };
      });
      setReelsList(dbVideos.length > 0 ? [...dbVideos, ...STOCK_REELS] : STOCK_REELS);
    }, (err) => {
      console.warn("Failed loading physical reels from Firestore:", err);
    });
    return () => unsub();
  }, []);

  // Sync comments in real-time for active reel
  useEffect(() => {
    const activeReel = reelsList[currentIndex];
    if (!activeReel?.id || activeReel.id.startsWith('reef')) return;
    
    const qComments = query(collection(db, 'social_videos', activeReel.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubComments = onSnapshot(qComments, (snapshot) => {
      const dbComments = snapshot.docs.map(commDoc => {
         const crData = commDoc.data();
         return {
            id: commDoc.id,
            author: crData.userName || 'Anonymous Transponder',
            photo: crData.userPhoto || undefined,
            text: crData.content || '',
            time: 'Recent'
         };
      });
      setCommentsList(prev => ({
         ...prev,
         [activeReel.id]: dbComments
      }));
    }, (err) => {
      console.warn("Failed loading comments dynamically:", err);
    });
    return () => unsubComments();
  }, [currentIndex, reelsList]);

  // Start webcam feed for the staging creator step
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (showCreatorEngine && creatorStep === 'camera') {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing === 'front' ? 'user' : 'environment' },
        audio: true
      })
      .then(stream => {
        activeStream = stream;
        setCameraStream(stream);
        setCameraError(null);
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.warn("Camera blocked or inaccessible:", err);
        setCameraError("Camera permission blocked or unfulfilled. Using professional typing simulation loop.");
        showToast("Simulation fallback started.", "info");
      });
    } else {
      setCameraStream(null);
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCreatorEngine, creatorStep, cameraFacing]);

  // Slideshow intervals for published media slideshow
  useEffect(() => {
    setCurrentSlideshowIndex(0);
    const activeItem = reelsList[currentIndex];
    if (!activeItem || !activeItem.mediaSequence || activeItem.mediaSequence.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
       setCurrentSlideshowIndex(prev => {
          const nextVal = prev + 1;
          if (nextVal >= (activeItem.mediaSequence?.length || 0)) {
             return 0;
          }
          return nextVal;
       });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, reelsList]);

  // Slideshow intervals for staging slideshow editor
  useEffect(() => {
    setActiveMediaIndex(0);
    if (creatorStep !== 'edit' || stagedMediaList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveMediaIndex(prev => {
        const nextVal = prev + 1;
        if (nextVal >= stagedMediaList.length) return 0;
        return nextVal;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [stagedMediaList, creatorStep]);

  // Pause others when currentIndex changes
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const vid = videoRefs.current[key];
      if (vid) {
        if (reelsList[currentIndex] && key === reelsList[currentIndex].id) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
          vid.currentTime = 0;
        }
      }
    });
  }, [currentIndex, reelsList]);

  const spawnParticles = (emoji: string) => {
    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: 'particle_' + Date.now() + '_' + i + '_' + Math.random(),
      x: -40 + Math.random() * 80, // offset X
      y: -20 - Math.random() * 80, // offset Y
      emoji
    }));
    setFloatingParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 1500);
  };

  // Drag text/sticker systems setup
  const handleItemDragStart = (e: React.MouseEvent | React.TouchEvent, id: string, type: 'text' | 'sticker') => {
    setDraggingItem({ id, type });
    vibrate(VIBRATION_PATTERNS.CLICK);
  };

  const handlePointerDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingItem || !editorCanvasRef.current) return;
    const rect = editorCanvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate percentage of bounds
    const relativeX = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const relativeY = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    
    if (draggingItem.type === 'text') {
      setEditorTexts(prev => prev.map(t => t.id === draggingItem.id ? { ...t, x: relativeX, y: relativeY } : t));
    } else {
      setEditorStickers(prev => prev.map(s => s.id === draggingItem.id ? { ...s, x: relativeX, y: relativeY } : s));
    }
  };

  const handlePointerDragEnd = () => {
    setDraggingItem(null);
  };

  // Handle upvoting
  const handleLike = async (id: string) => {
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    spawnParticles('🔥');
    const userId = user?.uid || 'guest';
    let nextLikedBy: string[] = [];
    let nextLikesVal = 0;

    setReelsList(prev => prev.map(reel => {
      if (reel.id === id) {
        const alreadyLiked = reel.likedBy.includes(userId);
        const alreadyDisliked = (reel.dislikedBy || []).includes(userId);
        let updatedLikedBy = [...reel.likedBy];
        let updatedDislikedBy = [...(reel.dislikedBy || [])];
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
        nextLikedBy = updatedLikedBy;
        nextLikesVal = Math.max(0, reel.likes + diffLike);
        return {
          ...reel,
          likedBy: updatedLikedBy,
          dislikedBy: updatedDislikedBy,
          likes: nextLikesVal,
          dislikes: Math.max(0, (reel.dislikes || 0) + diffDislike)
        };
      }
      return reel;
    }));

    if (!id.startsWith('reef')) {
      try {
        await updateDoc(doc(db, 'social_videos', id), {
          likedBy: nextLikedBy,
          likes: nextLikesVal
        });
      } catch (err) {
        console.warn("Failed registering interactive like to db:", err);
      }
    }
    play('quest_complete');
  };

  // Handle downvoting
  const handleDislike = (id: string) => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    spawnParticles('❄️');
    setReelsList(prev => prev.map(reel => {
      if (reel.id === id) {
        const userId = user?.uid || 'guest';
        const alreadyLiked = reel.likedBy.includes(userId);
        const alreadyDisliked = (reel.dislikedBy || []).includes(userId);
        let updatedLikedBy = [...reel.likedBy];
        let updatedDislikedBy = [...(reel.dislikedBy || [])];
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
          dislikes: Math.max(0, (reel.dislikes || 0) + diffDislike)
        };
      }
      return reel;
    }));
  };

  // Adding comment
  const handleAddComment = async () => {
    if (!newCommentInput.trim()) return;
    const activeReelId = reelsList[currentIndex].id;
    const newCommentText = newCommentInput.trim();
    setNewCommentInput('');

    const newComment = {
      id: 'local-' + Date.now(),
      author: user?.displayName || 'Anonymous Transponder',
      photo: user?.photoURL || undefined,
      text: newCommentText,
      time: 'Just now'
    };

    setCommentsList(prev => ({
      ...prev,
      [activeReelId]: [newComment, ...(prev[activeReelId] || [])]
    }));

    setReelsList(prev => prev.map(r => r.id === activeReelId ? { ...r, commentsCount: r.commentsCount + 1 } : r));
    vibrate(VIBRATION_PATTERNS.CLICK);

    if (!activeReelId.startsWith('reef')) {
      try {
        await addDoc(collection(db, 'social_videos', activeReelId, 'comments'), {
          videoId: activeReelId,
          userId: user?.uid || 'guest',
          userName: user?.displayName || 'Anonymous Transponder',
          userPhoto: user?.photoURL || '',
          content: newCommentText,
          createdAt: new Date().toISOString()
        });
        await updateDoc(doc(db, 'social_videos', activeReelId), {
          commentCount: increment(1)
        });
      } catch (err) {
        console.warn("Failed recording live comment to Firestore:", err);
      }
    }
  };

  // Real Camera Recording triggers
  const recordingTimerRef = useRef<any>(null);
  const handleToggleRecord = () => {
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setRecordingSeconds(selectedSecondsLimit);
      recordedChunksRef.current = [];

      if (cameraStream) {
        try {
          const recorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
          mediaRecorderRef.current = recorder;
          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };
          recorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const localUrl = URL.createObjectURL(blob);
            setRecordedVideoBlobUrl(localUrl);
            setStagedMediaList([{ url: localUrl, type: 'video' }]);
            setCreatorStep('edit');
            showToast('Recording processed successfully!', 'success');
          };
          recorder.start();
        } catch (e) {
          console.warn("Failed to start MediaRecorder:", e);
          startSimulationFallback();
        }
      } else {
        startSimulationFallback();
      }
    }
  };

  const startSimulationFallback = () => {
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(recordingTimerRef.current);
          setIsRecording(false);
          const mockUrl = 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-star-fields-in-outer-space-42617-large.mp4';
          setRecordedVideoBlobUrl(mockUrl);
          setStagedMediaList([{ url: mockUrl, type: 'video' }]);
          setCreatorStep('edit');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Multi-Files Upload with dynamic Type mapping
  const handleLocalFileChoose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      vibrate(VIBRATION_PATTERNS.CLICK);
      const tempMedia: { url: string; type: 'video' | 'image' }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const localUrl = URL.createObjectURL(file);
        const isImg = file.type.startsWith('image/');
        tempMedia.push({
          url: localUrl,
          type: isImg ? 'image' : 'video'
        });
      }
      setStagedMediaList(tempMedia);
      setRecordedVideoBlobUrl(tempMedia[0].url);
      setCreatorStep('edit');
      showToast('Native files staged successfully!', 'success');
    }
  };

  // Publishing TikTok loop
  const handlePublishReel = async () => {
    if (!editorTitle.trim() || !editorDescription.trim()) {
      showToast('Headline Title and Description are required!', 'error');
      return;
    }
    setIsPosting(true);
    setUploadPercent(0);
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);

    // Smooth numerical upload counter
    const uploaderInterval = setInterval(async () => {
      setUploadPercent(prev => {
        if (prev >= 100) {
          clearInterval(uploaderInterval);
          finishPublication();
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const finishPublication = async () => {
    try {
      const pTitle = editorTitle;
      const pDesc = editorDescription;
      const firstMedia = stagedMediaList[0];
      const videoPath = firstMedia?.url || 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-star-fields-in-outer-space-42617-large.mp4';
      const mType = firstMedia?.type || 'video';

      // Write to live database collection
      console.log("Firestore Audit: Writing new reel to collection 'social_videos'...");
      const docRef = await addDoc(collection(db, 'social_videos'), {
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Anonymous Transponder',
        userPhoto: user?.photoURL || '',
        videoUrl: videoPath,
        caption: `${pTitle}: ${pDesc}`,
        likes: 0,
        likedBy: [],
        commentCount: 0,
        saves: 0,
        savedBy: [],
        repostCount: 0,
        createdAt: new Date().toISOString(),
        type: mType,
        platform: 'nexora',
        isAuthorized: true,
        mediaSequence: stagedMediaList
      });
      console.log(`Firestore Audit: Successful write. Collection: 'social_videos', Document ID: '${docRef.id}'`);

      setIsPosting(false);
      setShowCreatorEngine(false);
      setEditorTitle('');
      setEditorDescription('');
      setRecordedVideoBlobUrl(null);
      setStagedMediaList([]);
      setHasNewCustomVideo(true);
      showToast('TikTok Loop broadcasted live to everyone!', 'success');
    } catch (err) {
      console.warn("Failed core publication database commit:", err);
      setIsPosting(false);
      showToast('Database publish failed, but loop stored locally!', 'info');
      // Local fallback
      const localReel: VideoItem = {
        id: 'local-' + Date.now(),
        title: editorTitle,
        creator: user?.displayName || 'Anonymous Transponder',
        creatorPhoto: user?.photoURL || undefined,
        videoUrl: recordedVideoBlobUrl || 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-star-fields-in-outer-space-42617-large.mp4',
        description: `${editorDescription} #nexora`,
        likes: 1,
        dislikes: 0,
        commentsCount: 0,
        likedBy: [user?.uid || 'guest'],
        dislikedBy: []
      };
      setReelsList(prev => [localReel, ...prev]);
      setCurrentIndex(0);
    }
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const activeReel = reelsList[currentIndex];
  const isImage = activeReel && (
    activeReel.type === 'photo' || 
    (activeReel.videoUrl && (
      activeReel.videoUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || 
      activeReel.videoUrl.includes('images.unsplash.com') ||
      activeReel.videoUrl.includes('image')
    ))
  );
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
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden flex flex-col">
      
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
        
        {/* Dynamic loop video or image */}
        <div className="relative w-full h-full flex items-center justify-center">
          {isImage ? (
            <img
              src={activeReel.videoUrl}
              alt={activeReel.title}
              className={`w-full h-full object-cover select-none pointer-events-auto transition-all duration-300 ${getFilterStyle(activeFilter)}`}
              draggable={false}
              referrerPolicy="no-referrer"
            />
          ) : (
            <video
              ref={el => { videoRefs.current[activeReel.id] = el; }}
              src={activeReel.videoUrl}
              className={`w-full h-full object-cover select-none pointer-events-auto transition-all duration-300 ${getFilterStyle(activeFilter)}`}
              loop
              muted={isMuted}
              autoPlay
              playsInline
            />
          )}
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
          
          {/* Floating animated particles particles */}
          {floatingParticles.map(p => (
             <motion.div
               key={p.id}
               initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
               animate={{ opacity: 0, x: p.x, y: p.y, scale: 2.2, rotate: p.x * 2.5 }}
               transition={{ duration: 1.2, ease: "easeOut" }}
               className="absolute pointer-events-none text-3xl select-none z-50"
               style={{ bottom: '60px', right: '10px' }}
             >
                {p.emoji}
             </motion.div>
          ))}
          
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

          {/* Upvote / Like (Glowing Fire Sticker 🔥) */}
          <button 
            onClick={() => handleLike(activeReel.id)}
            className="flex flex-col items-center text-center group relative cursor-pointer"
          >
             <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl group-active:scale-95 ${
                activeReel.likedBy.includes(user?.uid || 'guest') 
                  ? 'bg-gradient-to-tr from-amber-600 to-red-600 border border-amber-400/50 shadow-red-900/40 scale-110' 
                  : 'bg-black/60 backdrop-blur-md border border-white/10 hover:border-amber-500/40'
             }`}>
                <motion.span 
                  animate={activeReel.likedBy.includes(user?.uid || 'guest') ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-2xl"
                >
                   🔥
                </motion.span>
             </div>
             <span className={`text-[10px] font-black mt-1 tracking-wider ${activeReel.likedBy.includes(user?.uid || 'guest') ? 'text-amber-400' : 'text-zinc-300'}`}>
                {activeReel.likes}
             </span>
          </button>

          {/* Downvote (Ice Cold Sticker ❄️) */}
          <button 
            onClick={() => handleDislike(activeReel.id)}
            className="flex flex-col items-center text-center group relative cursor-pointer"
          >
             <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl group-active:scale-95 ${
                activeReel.dislikedBy.includes(user?.uid || 'guest') 
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 border border-cyan-400/50 shadow-blue-900/40 scale-110' 
                  : 'bg-black/60 backdrop-blur-md border border-white/10 hover:border-cyan-500/40'
             }`}>
                <motion.span 
                  animate={activeReel.dislikedBy.includes(user?.uid || 'guest') ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-2xl"
                >
                   ❄️
                </motion.span>
             </div>
             <span className={`text-[10px] font-black mt-1 tracking-wider ${activeReel.dislikedBy.includes(user?.uid || 'guest') ? 'text-cyan-400' : 'text-zinc-300'}`}>
                {activeReel.dislikes}
             </span>
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
                        ref={cameraVideoRef}
                        className={`absolute inset-0 w-full h-full object-cover transform ${cameraFacing === 'front' ? 'scale-x-[-1]' : ''}`}
                        autoPlay
                        playsInline
                        muted
                      />
                      
                      {cameraError && (
                         <div className="absolute top-14 left-4 right-4 bg-red-950/80 border border-red-500/35 backdrop-blur-md p-3 rounded-2xl z-20 text-center text-[10px] text-red-300 font-bold select-none leading-relaxed">
                            ⚠️ {cameraError}
                         </div>
                      )}

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
                            <p className="font-extrabold text-sm">{isRecording ? `Recording (${recordingSeconds}s)` : 'Awaiting Record Command'}</p>
                            <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">Recording uses your actual web camera and saves custom, high-fidelity media loops.</p>
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
                           multiple
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

             {/* Advanced TikTok-Style Non-Linear Creator Editor */}
             {creatorStep === 'edit' && (
                <div className="flex-1 flex flex-col justify-between bg-black text-white p-4 rounded-3xl overflow-y-auto no-scrollbar max-h-[80vh]">
                   
                   {/* Editor Header */}
                   <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                      <div className="flex items-center gap-1.5 text-purple-400">
                         <Sparkles size={16} className="animate-pulse" />
                         <span className="text-xs font-black uppercase tracking-wider">TikTok Pro Studio</span>
                      </div>
                      <span className="text-[9px] bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-full font-bold border border-purple-800/20">NON-LINEAR ENGINE v1.2</span>
                   </div>

                   {/* Video Active Canvas Display */}
                   <div 
                     ref={editorCanvasRef}
                     onMouseMove={handlePointerDragMove}
                     onTouchMove={handlePointerDragMove}
                     onMouseUp={handlePointerDragEnd}
                     onTouchEnd={handlePointerDragEnd}
                     onMouseLeave={handlePointerDragEnd}
                     className="relative w-full aspect-[9/13] max-h-[300px] bg-neutral-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center cursor-crosshair select-none"
                   >
                     {stagedMediaList.length > 0 && stagedMediaList[activeMediaIndex]?.type === 'image' ? (
                        <img 
                          src={stagedMediaList[activeMediaIndex].url}
                          alt="staged editor slide"
                          className="w-full h-full object-contain transition-all duration-350"
                          style={{
                             filter: `brightness(${editorBrightness}%) contrast(${editorContrast}%) saturate(${editorSaturation}%) ${isAutoQualityActive ? 'contrast(120%) saturate(110%) brightness(105%)' : ''}`
                          }}
                        />
                     ) : (
                        <video 
                          ref={editorVideoRef}
                          src={recordedVideoBlobUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                        className={`w-full h-full object-cover transition-all duration-300`}
                        style={{
                           filter: `brightness(${editorBrightness}%) contrast(${editorContrast}%) saturate(${editorSaturation}%) ${isAutoQualityActive ? 'contrast(120%) saturate(110%) brightness(105%) shadow-[inset_0_0_20px_rgba(147,51,234,0.4)]' : ''}`
                        }}
                        autoPlay
                        loop
                        muted
                      />
                     )}
                     
                     {/* Play/Pause stop-motion trigger for manual video playback */}
                     {stagedMediaList.length > 0 && stagedMediaList[activeMediaIndex]?.type !== 'image' && (
                        <button
                          type="button"
                          onClick={() => {
                             vibrate(VIBRATION_PATTERNS.CLICK);
                             if (editorVideoRef.current) {
                                if (isEditorVideoPlaying) {
                                   editorVideoRef.current.pause();
                                   setIsEditorVideoPlaying(false);
                                   showToast('Video paused', 'info');
                                } else {
                                   editorVideoRef.current.play().catch(() => {});
                                   setIsEditorVideoPlaying(true);
                                   showToast('Video playing', 'success');
                                }
                             }
                          }}
                          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-black/75 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all z-35 shadow-lg"
                        >
                           {isEditorVideoPlaying ? '⏸️' : '▶️'}
                        </button>
                     )}

                     {/* Staging Slider Indicators if slideshow exists */}
                     {stagedMediaList.length > 1 && (
                        <div className="absolute top-4 left-4 right-16 flex gap-1 z-35 bg-black/20 p-1 rounded-full">
                           {stagedMediaList.map((_, sidx) => (
                              <div 
                                key={sidx}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${activeMediaIndex === sidx ? 'bg-purple-500 scale-y-110' : 'bg-white/20'}`}
                              />
                           ))}
                        </div>
                     )}

                     {/* Auto Quality Flare FX */}
                     {isAutoQualityActive && (
                        <div className="absolute inset-0 border-2 border-purple-500/50 pointer-events-none animate-pulse rounded-3xl bg-gradient-to-tr from-purple-500/5 to-transparent shadow-[inset_0_0_20px_rgba(147,51,234,0.4)]" />
                     )}

                      {/* Text Overlays Render */}
                      {editorTexts.map(t => (
                        <div 
                          key={t.id}
                          onMouseDown={(e) => handleItemDragStart(e, t.id, 'text')}
                          onTouchStart={(e) => handleItemDragStart(e, t.id, 'text')}
                          className="absolute bg-zinc-950/95 backdrop-blur-md text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full border border-purple-500/40 flex items-center gap-2 select-none shadow-xl cursor-grab active:cursor-grabbing z-40 transition-shadow hover:shadow-purple-500/20"
                          style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                           <span>{t.text}</span>
                           <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                setEditorTexts(prev => prev.filter(item => item.id !== t.id));
                                vibrate(VIBRATION_PATTERNS.CLICK);
                             }}
                             className="w-4 h-4 rounded-full bg-red-600/90 text-white flex items-center justify-center text-[8px] hover:bg-red-700"
                           >
                              ✕
                           </button>
                        </div>
                      ))}

                      {/* Sticker Overlays Render */}
                      {editorStickers.map(s => (
                        <div 
                          key={s.id}
                          onMouseDown={(e) => handleItemDragStart(e, s.id, 'sticker')}
                          onTouchStart={(e) => handleItemDragStart(e, s.id, 'sticker')}
                          className="absolute text-3xl select-none flex items-center gap-1 cursor-grab active:cursor-grabbing z-40"
                          style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                           <span>{s.sticker}</span>
                           <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                setEditorStickers(prev => prev.filter(item => item.id !== s.id));
                                vibrate(VIBRATION_PATTERNS.CLICK);
                             }}
                             className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center text-[8px] opacity-100"
                           >
                              ✕
                           </button>
                        </div>
                      ))}

                      {/* Staged Music Active Indicator */}
                      {stagedMusicName && (
                        <div className="absolute bottom-4 left-4 bg-purple-600/90 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 animate-bounce shadow">
                           <Music size={10} className="animate-spin" />
                           <span className="uppercase tracking-widest text-[#FCFAF6]">{stagedMusicName}</span>
                        </div>
                      )}

                      {/* Staged Voice Track Indicator */}
                      {stagedVoiceName && (
                        <div className="absolute bottom-4 right-4 bg-orange-600/90 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse shadow">
                           <Mic size={10} />
                           <span className="uppercase tracking-widest text-[#FCFAF6]">{stagedVoiceName}</span>
                        </div>
                      )}
                   </div>

                   {/* Non-Linear Sequence Audio/Video Timeline */}
                   <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 my-2 space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-zinc-500">
                         <span>Multitrack Layering</span>
                         <span className="text-purple-400 font-mono">00:00 / 00:15</span>
                      </div>

                      {/* Timeline Slots */}
                      <div className="space-y-1.5">
                         {/* Video Track */}
                         <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            {videoTimelineClips.map((clip, idx) => (
                               <div key={idx} className="h-7 min-w-[90px] bg-zinc-800 rounded-lg flex items-center justify-between px-2 text-[9px] font-bold border border-zinc-700/50">
                                  <span>{clip} {idx > 0 ? `#${idx + 1}` : ''}</span>
                                  <span className="text-[8px] text-zinc-500">{(15 / videoTimelineClips.length).toFixed(1)}s</span>
                               </div>
                            ))}
                         </div>

                         {/* Music Track slot (visible if loaded) */}
                         {stagedMusic && (
                           <div className="bg-purple-950/40 border border-purple-900/40 rounded-xl p-2.5 text-[8px] font-bold text-purple-300 space-y-1.5 animate-fade-in">
                              <div className="flex items-center justify-between uppercase">
                                 <span className="flex items-center gap-1"><Music size={8} className="animate-spin" /> BACKING TRACK: {stagedMusic.name}</span>
                                 <button 
                                   onClick={() => {
                                      vibrate(VIBRATION_PATTERNS.CLICK);
                                      setStagedMusic(null);
                                      setStagedMusicName(null);
                                      showToast('Backing music removed', 'info');
                                   }}
                                   className="text-red-400 font-extrabold flex items-center gap-0.5 hover:text-red-300 font-sans"
                                 >
                                    🗑️ DEL
                                 </button>
                              </div>
                              
                              {/* Volume slider */}
                              <div className="flex items-center gap-2">
                                 <span>VOL: {stagedMusic.volume}%</span>
                                 <input 
                                   type="range"
                                   min="0"
                                   max="150"
                                   value={stagedMusic.volume}
                                   onChange={(e) => {
                                      const nv = Number(e.target.value);
                                      setStagedMusic(prev => prev ? { ...prev, volume: nv } : null);
                                    }}
                                   className="flex-1 h-1 bg-zinc-800 rounded accent-purple-500 cursor-pointer"
                                 />
                              </div>

                              {/* Split controls */}
                              <div className="flex gap-2 pt-0.5">
                                 <button
                                   onClick={() => {
                                      vibrate(VIBRATION_PATTERNS.CLICK);
                                      setStagedMusic(prev => {
                                         if (!prev) return null;
                                         const nextId = 'split-' + (prev.splits.length + 1);
                                         return {
                                            ...prev,
                                            splits: [...prev.splits, { id: nextId, start: 5, end: 12 }],
                                            currentSplitIndex: prev.splits.length
                                         };
                                      });
                                      showToast('Music track split created!', 'success');
                                   }}
                                   className="bg-purple-900/60 px-2 py-0.5 rounded text-[8px] font-black uppercase text-purple-200"
                                 >
                                    ✂️ Split Segment
                                 </button>
                                 {stagedMusic.splits.length > 1 && (
                                    <button
                                      onClick={() => {
                                         vibrate(VIBRATION_PATTERNS.CLICK);
                                         setStagedMusic(prev => {
                                            if (!prev) return null;
                                            const updated = prev.splits.filter((_, k) => k !== prev.currentSplitIndex);
                                            return {
                                               ...prev,
                                               splits: updated,
                                               currentSplitIndex: Math.max(0, updated.length - 1)
                                            };
                                         });
                                         showToast('Selected splits block removed', 'info');
                                      }}
                                      className="bg-red-950/40 text-red-300 border border-red-900/30 px-2 py-0.5 rounded text-[8px]"
                                    >
                                       🗑️ Delete segment ({stagedMusic.splits[stagedMusic.currentSplitIndex]?.id})
                                    </button>
                                 )}
                              </div>
                           </div>
                         )}

                         {/* Voice Track slot (visible if loaded) */}
                         {stagedVoice && (
                           <div className="bg-orange-950/40 border border-orange-900/40 rounded-xl p-2.5 text-[8px] font-bold text-orange-300 space-y-1.5 animate-fade-in">
                              <div className="flex items-center justify-between uppercase">
                                 <span className="flex items-center gap-1"><Mic size={8} /> VOICE DUB TRACK</span>
                                 <button 
                                   onClick={() => {
                                      vibrate(VIBRATION_PATTERNS.CLICK);
                                      setStagedVoice(null);
                                      setStagedVoiceName(null);
                                      showToast('Voice track deleted', 'info');
                                   }}
                                   className="text-red-400 font-extrabold flex items-center gap-0.5 hover:text-red-300 font-sans"
                                 >
                                    🗑️ DEL
                                 </button>
                              </div>

                              {/* Volume slider */}
                              <div className="flex items-center gap-2">
                                 <span>VOL: {stagedVoice.volume}%</span>
                                 <input 
                                   type="range"
                                   min="0"
                                   max="150"
                                   value={stagedVoice.volume}
                                   onChange={(e) => {
                                      const nv = Number(e.target.value);
                                      setStagedVoice(prev => prev ? { ...prev, volume: nv } : null);
                                    }}
                                   className="flex-1 h-1 bg-zinc-805 rounded accent-orange-500 cursor-pointer"
                                 />
                              </div>

                              {/* Split controls */}
                              <div className="flex gap-2 pt-0.5">
                                 <button
                                   onClick={() => {
                                      vibrate(VIBRATION_PATTERNS.CLICK);
                                      setStagedVoice(prev => {
                                         if (!prev) return null;
                                         const nextId = 'voice-split-' + (prev.splits.length + 1);
                                         return {
                                            ...prev,
                                            splits: [...prev.splits, { id: nextId, start: 4, end: 10 }],
                                            currentSplitIndex: prev.splits.length
                                         };
                                      });
                                      showToast('Voice split slice added!', 'success');
                                   }}
                                   className="bg-orange-900/60 px-2 py-0.5 rounded text-[8px] font-black uppercase text-orange-200"
                                 >
                                    ✂️ Split Voice
                                 </button>
                                 {stagedVoice.splits.length > 1 && (
                                    <button
                                      onClick={() => {
                                         vibrate(VIBRATION_PATTERNS.CLICK);
                                         setStagedVoice(prev => {
                                            if (!prev) return null;
                                            const updated = prev.splits.filter((_, k) => k !== prev.currentSplitIndex);
                                            return {
                                               ...prev,
                                               splits: updated,
                                               currentSplitIndex: Math.max(0, updated.length - 1)
                                            };
                                         });
                                         showToast('Voice recording segment deleted', 'info');
                                      }}
                                      className="bg-red-950/40 text-red-300 border border-red-900/30 px-2 py-0.5 rounded text-[8px]"
                                    >
                                       🗑️ Delete segment ({stagedVoice.splits[stagedVoice.currentSplitIndex]?.id})
                                    </button>
                                 )}
                              </div>
                           </div>
                         )}
                      </div>
                   </div>

                   {/* Sub-interface expanders depending on menu clicks */}
                   <AnimatePresence mode="wait">
                      {editingToolActiveTab === 'text' && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10 }}
                           className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-3 my-1"
                         >
                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Type Overlay Text</span>
                            <div className="flex gap-2">
                               <input 
                                 type="text"
                                 placeholder="e.g. Focus Level: MAX"
                                 value={editorTextInputVal}
                                 onChange={e => setEditorTextInputVal(e.target.value)}
                                 className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold' outline-none text-white focus:border-purple-500"
                               />
                               <button 
                                 onClick={() => {
                                    if (!editorTextInputVal.trim()) return;
                                    setEditorTexts(prev => [
                                       ...prev,
                                       {
                                          id: 'text_' + Date.now(),
                                          text: editorTextInputVal.trim(),
                                          x: 15 + Math.random() * 40,
                                          y: 20 + Math.random() * 50
                                       }
                                    ]);
                                    setEditorTextInputVal('');
                                    setEditingToolActiveTab('none');
                                    vibrate(VIBRATION_PATTERNS.CLICK);
                                    showToast('Text layer injected to session.', 'success');
                                 }}
                                 className="px-4 py-2 bg-purple-600 rounded-xl font-bold text-xs uppercase tracking-widest text-[#FCFAF6] hover:bg-purple-700"
                               >
                                  Add
                               </button>
                            </div>
                         </motion.div>
                      )}

                      {editingToolActiveTab === 'adjust' && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10 }}
                           className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-3 my-1 text-xs"
                         >
                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Post-Grading Visual Controls</span>
                            <div className="space-y-2.5">
                               {/* Brightness */}
                               <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-zinc-400 w-16">BRIGHT:</span>
                                  <input 
                                    type="range" 
                                    min="50" 
                                    max="150" 
                                    value={editorBrightness} 
                                    onChange={e => setEditorBrightness(parseInt(e.target.value))} 
                                    className="flex-1 accent-purple-600"
                                  />
                                  <span className="font-mono text-[9px] text-zinc-400">{editorBrightness}%</span>
                               </div>
                               {/* Contrast */}
                               <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-zinc-400 w-16">CONTRAST:</span>
                                  <input 
                                    type="range" 
                                    min="50" 
                                    max="150" 
                                    value={editorContrast} 
                                    onChange={e => setEditorContrast(parseInt(e.target.value))} 
                                    className="flex-1 accent-purple-600"
                                  />
                                  <span className="font-mono text-[9px] text-zinc-400">{editorContrast}%</span>
                               </div>
                               {/* Saturation */}
                               <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] font-bold text-zinc-400 w-16">SATURATE:</span>
                                  <input 
                                    type="range" 
                                    min="50" 
                                    max="150" 
                                    value={editorSaturation} 
                                    onChange={e => setEditorSaturation(parseInt(e.target.value))} 
                                    className="flex-1 accent-purple-600"
                                  />
                                  <span className="font-mono text-[9px] text-zinc-400">{editorSaturation}%</span>
                               </div>
                            </div>
                         </motion.div>
                      )}

                      {editingToolActiveTab === 'stickers' && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10 }}
                           className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-3.5 my-1"
                         >
                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider text-center block">Stickers Studio Pack</span>
                            
                            {/* Stickers Palette Tray */}
                            <div className="grid grid-cols-6 gap-2 justify-center max-h-24 overflow-y-auto no-scrollbar">
                               {['🔥', '⚡', '🔱', '✨', '🏆', '💎', '🎨', '🧠', '🤯', '🦁', '🛸', '🎈'].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => {
                                       setEditorStickers(prev => [
                                          ...prev,
                                          {
                                             id: 'sticker_' + Date.now(),
                                             sticker: s,
                                             x: 20 + Math.random() * 40,
                                             y: 20 + Math.random() * 50
                                          }
                                       ]);
                                       vibrate(VIBRATION_PATTERNS.CLICK);
                                    }}
                                    className="text-2xl hover:scale-110 active:scale-90 transition-transform bg-zinc-950 p-1.5 rounded-xl border border-zinc-800"
                                  >
                                     {s}
                                  </button>
                               ))}
                            </div>

                            {/* Custom File Upload Keyboard sticker mimicking */}
                            <div className="pt-2 border-t border-zinc-800 text-center">
                               <button
                                 onClick={() => customStickerInputRef.current?.click()}
                                 className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-wider text-purple-400 hover:text-white"
                               >
                                  Upload Sticker Keyboard file
                               </button>
                               <input 
                                 type="file" 
                                 ref={customStickerInputRef} 
                                 accept="image/*" 
                                 className="hidden" 
                                 onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                       const r = new FileReader();
                                       r.onload = (event) => {
                                          setEditorStickers(prev => [
                                             ...prev,
                                             {
                                                id: 'sticker_' + Date.now(),
                                                sticker: '⭐', // Fallback visual
                                                x: 30,
                                                y: 40
                                             }
                                          ]);
                                          showToast('Custom uploaded sticker loaded.', 'success');
                                       };
                                       r.readAsDataURL(file);
                                    }
                                 }}
                               />
                            </div>
                         </motion.div>
                      )}

                      {editingToolActiveTab === 'voice' && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10 }}
                           className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center space-y-3 my-1"
                         >
                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Voice Rec Dubber</span>
                            
                            <div className="flex flex-col items-center justify-center space-y-2">
                               {isVoiceRecording ? (
                                  <div className="flex items-center gap-2">
                                     <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                                     <span className="font-mono text-xs font-bold text-red-500">RECORDING: {voiceRecordDuration}s</span>
                                  </div>
                               ) : (
                                  <p className="text-[10px] text-zinc-400">Layer recorded voiceover on top of original audio stream.</p>
                               )}

                               <button
                                 onClick={() => {
                                    vibrate(VIBRATION_PATTERNS.CLICK);
                                    if (isVoiceRecording) {
                                       // Stop recording
                                       setIsVoiceRecording(false);
                                       clearInterval(voiceRecordTimerRef.current);
                                       setStagedVoiceName('Dubbed Track.mp3');
                                       showToast('Voice track successfully synced to multitrack.', 'success');
                                    } else {
                                       // Start recording simulated timer
                                       setIsVoiceRecording(true);
                                       setVoiceRecordDuration(0);
                                       voiceRecordTimerRef.current = setInterval(() => {
                                          setVoiceRecordDuration(prev => prev + 1);
                                       }, 1000);
                                    }
                                 }}
                                 className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest text-[#FCFAF6] ${isVoiceRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
                               >
                                  {isVoiceRecording ? 'Stop Recording' : 'Start Recording'}
                               </button>
                            </div>
                         </motion.div>
                      )}
                   </AnimatePresence>

                   {/* Swipe/Scroll Horizontal Advanced Pro tools bar */}
                   <div className="pt-2 border-t border-zinc-900">
                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 text-center select-none">
                         
                         {/* Split track */}
                         <button
                           onClick={() => {
                              vibrate(VIBRATION_PATTERNS.CLICK);
                              setVideoTimelineClips(prev => [...prev, 'Split Track Clip']);
                              showToast('Split command executed: non-linear cuts completed.', 'success');
                           }}
                           className="flex-col flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 border border-zinc-900/60 p-2.5 rounded-xl shrink-0 min-w-[76px] space-y-1 active:scale-95 transition-all"
                         >
                            <Scissors size={14} className="text-pink-500" />
                            <span className="text-[8px] font-black uppercase text-zinc-300">SPLIT</span>
                         </button>

                         {/* Sound Upload */}
                         <button
                           onClick={() => musicUploadInputRef.current?.click()}
                           className="flex-col flex items-center justify-center bg-zinc-950 hover:bg-zinc-900 border border-zinc-900/60 p-2.5 rounded-xl shrink-0 min-w-[76px] space-y-1 active:scale-95 transition-all"
                         >
                            <Music size={14} className="text-cyan-400" />
                            <span className="text-[8px] font-black uppercase text-zinc-300">SOUNDS</span>
                         </button>
                         <input 
                           type="file" 
                           ref={musicUploadInputRef} 
                           accept="audio/*" 
                           className="hidden" 
                           onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 setStagedMusicName(file.name);
                                 showToast(`Music file "${file.name}" synchronized!`, 'success');
                              }
                           }}
                         />

                         {/* Filtering Sliders layout */}
                         <button
                           onClick={() => {
                              vibrate(VIBRATION_PATTERNS.CLICK);
                              setEditingToolActiveTab(prev => prev === 'adjust' ? 'none' : 'adjust');
                           }}
                           className={`flex-col flex items-center justify-center border p-2.5 rounded-xl shrink-0 min-w-[76px] space-y-1 active:scale-95 transition-all ${editingToolActiveTab === 'adjust' ? 'bg-purple-900/40 border-purple-500' : 'bg-zinc-950 border-zinc-900/60 hover:bg-zinc-900'}`}
                         >
                            <Sliders size={14} className="text-yellow-400" />
                            <span className="text-[8px] font-black uppercase text-zinc-300">ADJUST</span>
                         </button>

                         {/* Auto-adjustment quality toggle trigger */}
                         <button
                           onClick={() => {
                              vibrate(VIBRATION_PATTERNS.CLICK);
                              setIsAutoQualityActive(prev => !prev);
                              showToast(isAutoQualityActive ? 'Auto adjustment profile deactivated.' : 'Auto-adjustment smart lighting applied!', 'info');
                           }}
                           className={`flex-col flex items-center justify-center border p-2.5 rounded-xl shrink-0 min-w-[76px] space-y-1 active:scale-95 transition-all ${isAutoQualityActive ? 'bg-purple-900/40 border-purple-500 animate-pulse' : 'bg-zinc-950 border-zinc-900/60 hover:bg-zinc-900'}`}
                         >
                            <Sparkles size={14} className="text-emerald-400" />
                            <span className="text-[8px] font-black uppercase text-zinc-300">AUTO-IQ</span>
                         </button>

                         {/* Text Inject Overlay tool */}
                         <button
                           onClick={() => {
                              vibrate(VIBRATION_PATTERNS.CLICK);
                              setEditingToolActiveTab(prev => prev === 'text' ? 'none' : 'text');
                           }}
                           className={`flex-col flex items-center justify-center border p-2.5 rounded-xl shrink-0 min-w-[76px] space-y-1 active:scale-95 transition-all ${editingToolActiveTab === 'text' ? 'bg-purple-900/40 border-purple-500' : 'bg-zinc-950 border-zinc-900/60 hover:bg-zinc-900'}`}
                         >
                            <Type size={14} className="text-orange-400" />
                            <span className="text-[8px] font-black uppercase text-zinc-300">TEXT</span>
                         </button>

                         {/* Stickers tab expander overlay */}
                         <button
                           onClick={() => {
                              vibrate(VIBRATION_PATTERNS.CLICK);
                              setEditingToolActiveTab(prev => prev === 'stickers' ? 'none' : 'stickers');
                           }}
                           className={`flex-col flex items-center justify-center border p-2.5 rounded-xl shrink-0 min-w-[76px] space-y-1 active:scale-95 transition-all ${editingToolActiveTab === 'stickers' ? 'bg-purple-900/40 border-purple-500' : 'bg-zinc-950 border-zinc-900/60 hover:bg-zinc-900'}`}
                         >
                            <Smile size={14} className="text-pink-400" />
                            <span className="text-[8px] font-black uppercase text-zinc-300">STICKERS</span>
                         </button>

                         {/* Voice recorder */}
                         <button
                           onClick={() => {
                              vibrate(VIBRATION_PATTERNS.CLICK);
                              setEditingToolActiveTab(prev => prev === 'voice' ? 'none' : 'voice');
                           }}
                           className={`flex-col flex items-center justify-center border p-2.5 rounded-xl shrink-0 min-w-[76px] space-y-1 active:scale-95 transition-all ${editingToolActiveTab === 'voice' ? 'bg-purple-900/40 border-purple-500' : 'bg-zinc-950 border-zinc-900/60 hover:bg-zinc-900'}`}
                         >
                            <Mic size={14} className="text-[#69C496]" />
                            <span className="text-[8px] font-black uppercase text-zinc-300">DUB REC</span>
                         </button>

                      </div>
                   </div>

                   {/* Footer navigation */}
                   <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => {
                           vibrate(VIBRATION_PATTERNS.CLICK);
                           setCreatorStep('camera');
                        }}
                        className="flex-1 py-3 bg-zinc-900 border border-zinc-800 font-black uppercase text-[10px] tracking-widest text-zinc-400 rounded-2xl active:scale-95 transition-all"
                      >
                         Cancel Stage
                      </button>
                      <button 
                        onClick={() => {
                           vibrate(VIBRATION_PATTERNS.CLICK);
                           setCreatorStep('details');
                        }}
                        className="flex-[2] py-3 bg-purple-600 hover:bg-purple-700 font-black uppercase text-[10px] tracking-widest text-[#FCFAF6] rounded-2xl shadow-lg shadow-purple-900/20 active:scale-95 transition-all"
                      >
                         Finished & Post
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
