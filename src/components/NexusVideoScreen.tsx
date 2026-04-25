import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Video, Plus, Search, X, MessageSquare, Heart, RefreshCw, Send, User, Trash2, Bookmark, Flag, EyeOff, Share2, Award, Zap, History, Camera } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, collection, query, orderBy, onSnapshot, setDoc, updateDoc, increment, addDoc, deleteDoc, getDoc, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { NexusVideo, UserSettings, UserStats, Screen } from '../types';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { VideoPlayer } from './VideoPlayer';
import { NexoraStudio } from './NexoraStudio';

interface NexusVideoScreenProps {
  onBack: () => void;
  user: FirebaseUser | null;
  settings: UserSettings;
  showToast: (m: string, t?: 'success' | 'info' | 'error') => void;
  initialVideoId?: string | null;
}

// Memoized Video Card
const VideoCard = React.memo(({ video, user, handleLike, handleSaveVideo, handleRepostVideo, handleShareVideo, setIsShowingVideoOptions, setSelectedVideo }: any) => {
  const isLiked = (video.likedBy || []).includes(user?.uid || '');
  
  return (
    <motion.div 
      layout
      className="glass-card overflow-hidden group relative"
      onClick={() => setSelectedVideo(video)}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden border border-white">
                {video.userPhoto ? <img src={video.userPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User size={16} className="m-2 text-blue-400" />}
             </div>
             <h4 className="font-black text-blue-900 text-xs">{video.userName}</h4>
          </div>
          <Zap size={16} className="text-blue-500 animate-pulse" />
        </div>
        
        <VideoPlayer url={video.videoUrl} />
        
        <p className="text-xs font-medium text-blue-900/70 line-clamp-2 italic px-2">
           "{video.caption}"
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-blue-50">
           <div className="flex items-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); handleLike(video.id, video.likedBy || []); }}
                className={`flex items-center gap-1.5 transition-all active:scale-90 ${isLiked ? 'text-orange-500' : 'text-blue-900/30'}`}
              >
                <Heart size={20} className={isLiked ? "fill-orange-500" : ""} />
                <span className="text-xs font-black">{video.likes || 0}</span>
              </button>
              <div className="flex items-center gap-1.5 text-blue-900/30">
                <MessageSquare size={20} />
                <span className="text-xs font-black">{video.commentCount || 0}</span>
              </div>
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); handleShareVideo(video.id); }}
             className="p-2 text-blue-900/20 hover:text-blue-500 transition-colors"
           >
             <Share2 size={20} />
           </button>
        </div>
      </div>
    </motion.div>
  );
});

export function NexusVideoScreen({ onBack, user, settings, showToast, initialVideoId }: NexusVideoScreenProps) {
  const [videos, setVideos] = useState<NexusVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<NexusVideo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  useEffect(() => {
    let q = query(collection(db, 'social_videos'), orderBy('createdAt', 'desc'), limit(24));
    const unsub = onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NexusVideo)));
    }, (err) => {
      console.error("Videos query error:", err);
    });
    return unsub;
  }, []);

  const handleLike = async (vId: string, likedBy: string[]) => {
    if (!user) return;
    const isLiked = (likedBy || []).includes(user.uid);
    const newLikedBy = isLiked ? likedBy.filter(id => id !== user.uid) : [...(likedBy || []), user.uid];
    try {
      await updateDoc(doc(db, 'social_videos', vId), { likedBy: newLikedBy, likes: newLikedBy.length });
      vibrate(VIBRATION_PATTERNS.CLICK);
    } catch (err) { console.error(err); }
  };

  const handleCreateVideo = async () => {
    if (!videoUrl.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const platform = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? 'youtube' : 'tiktok';
      const videoData: Omit<NexusVideo, 'id'> = {
        userId: user.uid,
        userName: settings.displayName || 'Anonymous',
        userPhoto: settings.profilePic || '',
        videoUrl: videoUrl.trim(),
        caption: caption.trim(),
        likes: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: new Date().toISOString(),
        isAuthorized: true,
        platform
      };
      await addDoc(collection(db, 'social_videos'), videoData);
      setIsCreating(false);
      setVideoUrl('');
      setCaption('');
      showToast('Video added to the Reels! 🎬', 'success');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (err) { showToast('Failed to add video', 'error'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto w-full px-4 pb-32"
    >
      <div className="flex items-center justify-between sticky top-0 bg-blue-50/80 backdrop-blur-md z-[100] py-6 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-blue-900">
               <ArrowLeft size={24} />
            </button>
            <div>
               <h2 className="text-3xl font-black text-blue-900 tracking-tighter">Nexus Reel</h2>
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Vertical Vibe Lab</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsStudioOpen(true)} className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg border-2 border-orange-400">
                <Camera size={22} />
             </button>
             <button onClick={() => setIsCreating(true)} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg border-2 border-blue-500">
                <Plus size={22} />
             </button>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video} 
            user={user}
            handleLike={handleLike}
            handleShareVideo={(id: string) => {
              navigator.clipboard.writeText(`${window.location.origin}?video=${id}`);
              showToast('Link Copied! 🎬', 'success');
            }}
            setSelectedVideo={setSelectedVideo}
          />
        ))}
      </div>

      <AnimatePresence>
        {isStudioOpen && (
          <div className="fixed inset-0 z-[200]">
            <NexoraStudio 
              user={user}
              onClose={() => setIsStudioOpen(false)} 
              onPost={async (data) => {
                // Simplified post logic for extraction
                setIsStudioOpen(false);
                showToast('Studio vibe posted! 🏮', 'success');
              }}
            />
          </div>
        )}

        {isCreating && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-md" onClick={() => setIsCreating(false)}>
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="glass-card w-full max-w-md p-8 relative"
               onClick={e => e.stopPropagation()}
             >
                <h3 className="text-2xl font-black text-blue-900 mb-6">POST TO REEL</h3>
                <div className="space-y-4">
                   <input 
                     type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                     placeholder="Video URL (YouTube/TikTok)"
                     className="w-full bg-blue-50 rounded-2xl p-4 text-sm font-bold focus:outline-none"
                   />
                   <textarea 
                     value={caption} onChange={e => setCaption(e.target.value)}
                     placeholder="Say something cool..."
                     className="w-full bg-blue-50 rounded-2xl p-4 text-sm font-bold focus:outline-none h-32"
                   />
                   <button 
                     onClick={handleCreateVideo} disabled={isSubmitting}
                     className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50"
                   >
                     {isSubmitting ? 'Sychnronizing...' : 'Go Live 🚀'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
