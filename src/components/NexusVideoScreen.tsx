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

// Memoized Video Card - Full Screen TikTok Style
const VideoCard = React.memo(({ video, user, handleLike, handleShareVideo, setSelectedVideo, index, activeIndex }: any) => {
  const isLiked = (video.likedBy || []).includes(user?.uid || '');
  
  return (
    <div className="h-screen w-full relative flex items-center justify-center bg-black snap-start overflow-hidden">
      {/* Background Video Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full max-w-[500px] relative bg-neutral-900">
            {video.type === 'photo' ? (
              <img src={video.videoUrl} className="w-full h-full object-cover" />
            ) : (
              <VideoPlayer url={video.videoUrl} fullScreen={true} />
            )}
          </div>
        </div>
      </div>

      {/* Static Overlay Guard (Black bars fade) */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Interaction Layer */}
      <div className="absolute inset-x-0 bottom-0 p-6 pb-24 z-20 pointer-events-none flex flex-col justify-end min-h-[40%]">
        <div className="max-w-[500px] mx-auto w-full pointer-events-auto flex items-end justify-between gap-4">
          
          {/* Info Side */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-white/80 overflow-hidden shadow-2xl bg-blue-100 flex-shrink-0">
                {video.userPhoto ? (
                  <img src={video.userPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={24} className="m-3 text-blue-400" />
                )}
              </div>
              <div className="drop-shadow-lg">
                <h4 className="font-black text-white text-lg tracking-tight">@{video.userName}</h4>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">Vibe Transmitting</span>
                </div>
              </div>
            </div>

            <p className="text-white font-semibold drop-shadow-md leading-relaxed text-sm pr-12 line-clamp-3 italic">
              "{video.caption}"
            </p>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <Zap size={12} className="text-orange-400" />
                <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{video.platform || 'Nexora'} Original</span>
              </div>
            </div>
          </div>

          {/* Action Side */}
          <div className="flex flex-col items-center gap-6 mb-4">
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); handleLike(video.id, video.likedBy || []); }}
                className={`p-4 rounded-full backdrop-blur-xl border border-white/20 transition-all active:scale-75 shadow-2xl ${isLiked ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <Heart size={28} className={isLiked ? "fill-white" : ""} />
              </button>
              <span className="text-[10px] font-black text-white drop-shadow-md uppercase tracking-tighter">{video.likes || 0} Signal</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => setSelectedVideo(video)}
                className="p-4 rounded-full backdrop-blur-xl border border-white/20 bg-white/10 text-white transition-all active:scale-75 hover:bg-white/20 shadow-2xl"
              >
                <MessageSquare size={28} />
              </button>
              <span className="text-[10px] font-black text-white drop-shadow-md uppercase tracking-tighter">{video.commentCount || 0} Pulse</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => handleShareVideo(video.id)}
                className="p-4 rounded-full backdrop-blur-xl border border-white/20 bg-white/10 text-white transition-all active:scale-75 hover:bg-white/20 shadow-2xl"
              >
                <Share2 size={28} />
              </button>
              <span className="text-[10px] font-black text-white drop-shadow-md uppercase tracking-tighter">Beam</span>
            </div>
          </div>

        </div>
      </div>
    </div>
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
  const [activeIndex, setActiveIndex] = useState(0);

  const [videoComments, setVideoComments] = useState<any[]>([]);
  const [newVideoComment, setNewVideoComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState<any | null>(null);

  useEffect(() => {
    if (!selectedVideo) return;
    const qComments = query(collection(db, 'social_videos', selectedVideo.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubComments = onSnapshot(qComments, (snapshot) => {
      setVideoComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubComments();
  }, [selectedVideo]);

  const handlePostVideoComment = async () => {
    if (!newVideoComment.trim() || !selectedVideo || !user) return;
    setIsPostingComment(true);
    vibrate(VIBRATION_PATTERNS.CLICK);
    try {
      const commentData = {
        videoId: selectedVideo.id,
        userId: user.uid,
        userName: settings.displayName || 'Anonymous',
        userPhoto: settings.profilePic || '',
        content: newVideoComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId: replyingToComment ? replyingToComment.id : undefined
      };
      await addDoc(collection(db, 'social_videos', selectedVideo.id, 'comments'), commentData);
      await updateDoc(doc(db, 'social_videos', selectedVideo.id), { commentCount: increment(1) });
      setNewVideoComment('');
      setReplyingToComment(null);
    } catch (err) { showToast('Comment failed', 'error'); }
    finally { setIsPostingComment(false); }
  };

  useEffect(() => {
    let q = query(collection(db, 'social_videos'), orderBy('createdAt', 'desc'), limit(30));
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
      showToast('Transmission Received! 🎬', 'success');
      vibrate(VIBRATION_PATTERNS.SUCCESS);
    } catch (err) { showToast('Sync failed', 'error'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col h-screen overflow-hidden"
    >
      {/* Top Controls Overlay */}
      <div className="absolute top-0 inset-x-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={onBack} className="p-3 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl text-white shadow-2xl active:scale-90 transition-all hover:bg-black/40">
             <ArrowLeft size={24} />
          </button>
          <div className="drop-shadow-2xl">
             <h2 className="text-2xl font-black text-white italic tracking-tighter leading-none">Nexo Reels</h2>
             <div className="flex items-center gap-2 mt-1">
               <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
               <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Frequency Alpha</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 pointer-events-auto">
           <button onClick={() => setIsStudioOpen(true)} className="p-4 bg-orange-500 text-white rounded-2xl shadow-2xl border border-orange-400 active:scale-95 transition-all hover:bg-orange-600">
              <Camera size={22} />
           </button>
           <button onClick={() => setIsCreating(true)} className="p-4 bg-white/10 backdrop-blur-2xl border border-white/10 text-white rounded-2xl shadow-2xl active:scale-95 transition-all hover:bg-white/20">
              <Plus size={22} />
           </button>
        </div>
      </div>

      {/* Snap Scroll Vertical Feed */}
      <div 
        className="flex-1 overflow-y-scroll snap-y snap-mandatory h-full no-scrollbar overscroll-none"
        onScroll={(e) => {
          const index = Math.round(e.currentTarget.scrollTop / window.innerHeight);
          if (index !== activeIndex) setActiveIndex(index);
        }}
      >
        {videos.length === 0 ? (
          <div className="h-screen w-full flex flex-col items-center justify-center text-white space-y-6">
             <div className="relative">
                <RefreshCw size={56} className="animate-spin text-orange-500 opacity-20" />
                <Zap size={24} className="absolute inset-0 m-auto text-orange-500" />
             </div>
             <p className="font-black italic uppercase tracking-[0.4em] text-white/20 text-xs">Awaiting Feed Integration...</p>
          </div>
        ) : (
          videos.map((video, i) => (
            <VideoCard 
              key={video.id + i} 
              video={video} 
              user={user}
              index={i}
              activeIndex={activeIndex}
              handleLike={handleLike}
              handleShareVideo={(id: string) => {
                navigator.clipboard.writeText(`${window.location.origin}?video=${id}`);
                showToast('Link Copied! 🎬', 'success');
              }}
              setSelectedVideo={setSelectedVideo}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {isStudioOpen && (
          <div className="fixed inset-0 z-[200]">
            <NexoraStudio 
              user={user}
              onBack={() => setIsStudioOpen(false)} 
              onPost={async (data) => {
                if (!user) return;
                try {
                  // Upload to Firebase Storage so it's publicly accessible
                  let finalVideoUrl = data.videoUrl;
                  if (finalVideoUrl.startsWith('blob:')) {
                    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                    const storage = getStorage();
                    const response = await fetch(finalVideoUrl);
                    const blob = await response.blob();
                    const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}.mp4`);
                    await uploadBytes(storageRef, blob);
                    finalVideoUrl = await getDownloadURL(storageRef);
                  }
                  
                  const videoData: Omit<NexusVideo, 'id'> = {
                    userId: user.uid,
                    userName: settings.displayName || 'Anonymous',
                    userPhoto: settings.profilePic || '',
                    videoUrl: finalVideoUrl,
                    caption: data.caption || 'New Studio Vibe! 🏮',
                    likes: 0,
                    likedBy: [],
                    commentCount: 0,
                    createdAt: new Date().toISOString(),
                    isAuthorized: true,
                    platform: 'nexora',
                    type: data.type || 'video'
                  };
                  await addDoc(collection(db, 'social_videos'), videoData);
                  setIsStudioOpen(false);
                  showToast('Studio vibe posted to Reels! 🏮', 'success');
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                } catch (err) {
                  console.error(err);
                  showToast('Failed to post vibe', 'error');
                }
              }}
            />
          </div>
        )}

        {isCreating && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl" onClick={() => setIsCreating(false)}>
             <motion.div 
               initial={{ scale: 0.9, y: 20, opacity: 0 }} 
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 20, opacity: 0 }}
               className="bg-white/95 backdrop-blur-2xl w-full max-w-md p-8 rounded-[3rem] relative shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/20"
               onClick={e => e.stopPropagation()}
             >
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-3xl font-black text-blue-900 italic tracking-tighter uppercase">Broadcast</h3>
                   <button onClick={() => setIsCreating(false)} className="p-3 bg-blue-50 text-blue-900 rounded-2xl">
                      <X size={24} />
                   </button>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4">Source URL</label>
                     <input 
                       type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                       placeholder="YouTube / TikTok Link"
                       className="w-full bg-blue-50 rounded-[1.5rem] p-5 text-sm font-bold border-2 border-transparent focus:border-blue-200 transition-all outline-none"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4">Signal Caption</label>
                     <textarea 
                       value={caption} onChange={e => setCaption(e.target.value)}
                       placeholder="What's the frequency, bro?"
                       className="w-full bg-blue-50 rounded-[1.5rem] p-5 text-sm font-bold border-2 border-transparent focus:border-blue-200 transition-all outline-none h-32 resize-none"
                     />
                   </div>

                   <button 
                     onClick={handleCreateVideo} disabled={isSubmitting || !videoUrl.trim()}
                     className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                   >
                     {isSubmitting ? 'Transmitting...' : 'Link Signal 🚀'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}

        {selectedVideo && (
          <div className="fixed inset-0 z-[1000] flex items-end justify-center pointer-events-none">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedVideo(null)} />
             <motion.div 
               initial={{ y: "100%" }} 
               animate={{ y: 0 }} 
               exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="bg-white/95 backdrop-blur-2xl w-full max-w-[500px] rounded-t-[3rem] h-[65vh] relative z-[1001] pointer-events-auto flex flex-col shadow-2xl"
               onClick={e => e.stopPropagation()}
             >
                <div className="p-8 pb-4 flex items-center justify-between">
                   <div>
                      <h3 className="text-2xl font-black text-blue-900 italic tracking-tighter">Nexus Feedback</h3>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">{selectedVideo.commentCount} Transmissions Active</p>
                   </div>
                   <button onClick={() => setSelectedVideo(null)} className="p-3 bg-blue-50 text-blue-900 rounded-2xl hover:scale-110 active:scale-90 transition-all">
                      <X size={20} />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar space-y-4">
                   {videoComments.length === 0 ? (
                     <div className="py-20 text-center opacity-20 space-y-4">
                        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto">
                          <MessageSquare size={40} className="text-blue-600" />
                        </div>
                        <p className="font-black uppercase tracking-[0.3em] text-[10px] italic">Quantum signals being processed...</p>
                     </div>
                   ) : (
                     videoComments.map(comment => (
                       <div key={comment.id} className={`flex gap-4 group ${comment.parentId ? 'ml-12 border-l-2 border-blue-200 pl-4' : ''}`}>
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 overflow-hidden shrink-0">
                             {comment.userPhoto ? <img src={comment.userPhoto} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-blue-200" />}
                          </div>
                          <div className="flex-1">
                            <div className="bg-blue-50/50 p-4 rounded-2xl rounded-tl-none">
                               <div className="flex justify-between items-start">
                                  <h5 className="text-[10px] font-black text-blue-900 uppercase mb-1">{comment.userName}</h5>
                               </div>
                               <p className="text-sm font-medium text-blue-900/80">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 px-2">
                               <button 
                                 onClick={() => setReplyingToComment(comment)}
                                 className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                               >
                                 <MessageSquare size={10} /> Reply
                               </button>
                            </div>
                          </div>
                       </div>
                     ))
                   )}
                </div>

                <div className="p-8 bg-white border-t border-blue-50 rounded-t-[2.5rem]">
                   {replyingToComment && (
                     <div className="flex items-center justify-between mb-4 bg-blue-100/50 px-4 py-2 rounded-xl">
                       <span className="text-[10px] font-black uppercase text-blue-600">Replying to {replyingToComment.userName}</span>
                       <button onClick={() => setReplyingToComment(null)} className="text-blue-400 hover:text-blue-600 p-1"><X size={12} /></button>
                     </div>
                   )}
                   <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-3xl border border-blue-100 shadow-inner group">
                      <input 
                        type="text" placeholder="Add a transmission..." 
                        value={newVideoComment}
                        onChange={(e) => setNewVideoComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePostVideoComment()}
                        className="bg-transparent border-none focus:outline-none flex-1 text-blue-900 font-bold text-sm ml-2" 
                      />
                      <button 
                        onClick={handlePostVideoComment}
                        disabled={!newVideoComment.trim() || isPostingComment}
                        className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg active:scale-90 transition-all hover:rotate-12 disabled:opacity-50"
                      >
                         <Send size={20} />
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
