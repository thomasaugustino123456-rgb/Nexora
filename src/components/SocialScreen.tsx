import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { ArrowLeft, Plus, Video, MoreHorizontal, Trash2, Bookmark, Flag, EyeOff, Share2, MessageSquare, Heart, RefreshCw, Send, X, Search, Award, User, Flame } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, collection, query, orderBy, onSnapshot, setDoc, updateDoc, increment, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, SocialCircle, SocialComment, NexusNotification, Screen, UserSettings, UserStats } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { VideoPlayer } from './VideoPlayer';

interface SocialScreenProps {
  onBack: () => void;
  user: FirebaseUser | null;
  settings: UserSettings;
  stats: UserStats;
  showToast: (m: string, t?: 'success' | 'info' | 'error') => void;
  onUpdateSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  posts: Post[];
  circles: SocialCircle[];
  notifications: NexusNotification[];
  setActiveScreen: (s: Screen) => void;
  play: (soundKey: any) => void;
}

// Memoized Post Card for speed
const PostCard = React.memo(({ post, user, settings, circles, savedPosts, toggleSavePost, handleAction, setSelectedPost, setViewingCircle, handleToggleJoin, hidePost, handleDeletePost, showToast }: any) => {
  const isOwner = user?.uid === post.userId;
  const isSaved = savedPosts.includes(post.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.div 
      layoutId={post.id}
      className="glass-card p-6 space-y-4 hover:shadow-xl transition-all cursor-pointer group hover:translate-y-[-2px] active:scale-[0.99]"
      onClick={() => setSelectedPost(post)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border border-white shadow-sm">
            {post.userPhoto ? <img src={post.userPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User className="w-full h-full p-2 text-blue-400" />}
          </div>
          <div>
            <h4 className="font-black text-blue-900 text-sm leading-none">{post.userName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const circle = circles.find((c: any) => c.id === post.circleId);
                  if (circle) setViewingCircle(circle);
                }}
                className="text-[10px] font-black text-blue-400 uppercase tracking-tighter hover:text-blue-600 active:scale-95 transition-all"
              >
                n/{post.circleName.replace(/\s+/g, '').toLowerCase()}
              </button>
              {!(settings.joinedCircleIds || []).includes(post.circleId) && post.circleId !== 'nexora-general' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const circle = circles.find((c: any) => c.id === post.circleId);
                    if (circle) handleToggleJoin(circle);
                  }}
                  className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  JOIN
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2 text-blue-900/20 hover:text-blue-900/60 transition-colors">
            <MoreHorizontal size={20} />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-[120]" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-10 bg-white rounded-2xl shadow-2xl border border-blue-50 py-2 w-48 z-[130] overflow-hidden"
                >
                  {isOwner ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); handleDeletePost(post.id); }} className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3">
                        <Trash2 size={16} /> Delete Post
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); toggleSavePost(post.id); }} className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-blue-900/60 hover:bg-blue-50'}`}>
                        <Bookmark size={16} className={isSaved ? "fill-blue-600" : ""} /> {isSaved ? 'Saved in Library' : 'Save to Library'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); toggleSavePost(post.id); }} className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-blue-900/60 hover:bg-blue-50'}`}>
                        <Bookmark size={16} className={isSaved ? "fill-blue-600" : ""} /> {isSaved ? 'Saved' : 'Save Post'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); showToast('Post Reported', 'error'); }} className="w-full px-4 py-3 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-3">
                        <Flag size={16} /> Report Post
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); hidePost(post.id); }} className="w-full px-4 py-3 text-left text-sm font-bold text-blue-900/30 hover:bg-blue-50 flex items-center gap-3">
                        <EyeOff size={16} /> Not Interested
                      </button>
                    </>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); showToast('Link copied!', 'info'); }} className="w-full px-4 py-3 text-left text-sm font-bold text-blue-900/60 hover:bg-blue-50 flex items-center gap-3 border-t border-blue-50 mt-1">
                    <Share2 size={16} /> Share Link
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-blue-900/80 font-medium line-clamp-3 leading-relaxed">
        {post.content}
      </p>

      {post.type === 'video' && post.videoUrl && (
        <div className="pt-2" onClick={e => e.stopPropagation()}>
          <VideoPlayer url={post.videoUrl} />
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-blue-50" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl transition-all active:scale-90 text-blue-900/30 hover:bg-blue-50" onClick={() => handleAction(post.id, 'flame')}>
           <Flame size={20} className={(post.likedBy || []).includes(user?.uid || '') ? "fill-orange-500 text-orange-500" : ""} />
           <span className="text-sm font-black">{post.flames || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl transition-all active:scale-90 text-blue-900/30 hover:bg-blue-50" onClick={() => handleAction(post.id, 'shield')}>
           <Award size={20} className={(post.shieldedBy || []).includes(user?.uid || '') ? "fill-blue-500 text-blue-500" : ""} />
           <span className="text-sm font-black">{post.shields || 0}</span>
        </div>
        <button onClick={() => setSelectedPost(post)} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-slate-400 hover:bg-slate-50 ml-auto transition-all">
          <MessageSquare size={20} />
          <span className="text-sm font-black">{post.commentCount || 0}</span>
        </button>
      </div>
    </motion.div>
  );
});

export function SocialScreen({ onBack, user, settings, stats, showToast, onUpdateSettings, posts, circles, notifications, setActiveScreen, play }: SocialScreenProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'circles' | 'inbox'>('feed');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);
  const [circleToEdit, setCircleToEdit] = useState<SocialCircle | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewingCircle, setViewingCircle] = useState<SocialCircle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState('nexora-general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<SocialComment | null>(null);
  const [savedPosts, setSavedPosts] = useLocalStorage<string[]>('nexora_saved_posts', []);
  const [savedComments, setSavedComments] = useLocalStorage<string[]>('nexora_saved_comments', []);
  const [hiddenPosts, setHiddenPosts] = useState<string[]>([]);
  const [hiddenComments, setHiddenComments] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedPost) {
      setComments([]);
      return;
    }
    const qComments = query(collection(db, 'posts', selectedPost.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubComments = onSnapshot(qComments, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialComment)));
    });
    return () => unsubComments();
  }, [selectedPost]);

  const handleAction = async (postId: string, type: 'flame' | 'shield') => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const likedBy = post.likedBy || [];
    const shieldedBy = post.shieldedBy || [];
    const userId = user.uid;
    const isLiked = likedBy.includes(userId);
    const isShielded = shieldedBy.includes(userId);
    vibrate(VIBRATION_PATTERNS.CLICK);
    const postRef = doc(db, 'posts', postId);
    try {
      if (type === 'flame') {
        const newLikedBy = isLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId];
        await updateDoc(postRef, { likedBy: newLikedBy, flames: newLikedBy.length });
      } else {
        const newShieldedBy = isShielded ? shieldedBy.filter(id => id !== userId) : [...shieldedBy, userId];
        await updateDoc(postRef, { shieldedBy: newShieldedBy, shields: newShieldedBy.length });
      }
    } catch (err) { console.error('Action failed:', err); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post, bro? 🛡️')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      showToast('Post deleted', 'success');
      if (selectedPost?.id === postId) setSelectedPost(null);
    } catch (err) { showToast('Failed to delete', 'error'); }
  };

  const toggleSavePost = (id: string) => {
    const isSaved = savedPosts.includes(id);
    const newSaved = isSaved ? savedPosts.filter(i => i !== id) : [...savedPosts, id];
    setSavedPosts(newSaved);
    vibrate(VIBRATION_PATTERNS.CLICK);
    showToast(isSaved ? 'Removed from Library' : 'Saved to Library! 📚', 'success');
  };

  const handleToggleJoin = async (circle: SocialCircle) => {
    if (!user) return;
    vibrate(VIBRATION_PATTERNS.CLICK);
    const joinedIds = settings.joinedCircleIds || [];
    const isJoining = !joinedIds.includes(circle.id);
    const newJoinedIds = isJoining ? [...joinedIds, circle.id] : joinedIds.filter(id => id !== circle.id);
    try {
      onUpdateSettings({ joinedCircleIds: newJoinedIds });
      await updateDoc(doc(db, 'circles', circle.id), { memberCount: circle.memberCount + (isJoining ? 1 : -1) });
      showToast(isJoining ? `Joined ${circle.name}! 🏮` : `Left ${circle.name}`, 'success');
    } catch (err) { showToast('Sync failed', 'error'); }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;
    setIsSubmitting(true);
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    try {
      const circle = circles.find(c => c.id === selectedCircleId);
      const postData: Omit<Post, 'id'> = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        circleId: selectedCircleId,
        circleName: circle?.name || 'General',
        content: newPostContent.trim(),
        type: newVideoUrl.trim() ? 'video' : 'text',
        videoUrl: newVideoUrl.trim() || undefined,
        flames: 0,
        shields: 0,
        likedBy: [],
        shieldedBy: [],
        commentCount: 0,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'posts'), postData);
      setIsCreatingPost(false);
      setNewPostContent('');
      setNewVideoUrl('');
      showToast('Post transmitted to the Nexus! 🚀', 'success');
    } catch (err) { showToast('Transmission failed', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedPost || !user) return;
    setIsPostingComment(true);
    vibrate(VIBRATION_PATTERNS.CLICK);
    try {
      const commentData: Omit<SocialComment, 'id'> = {
        postId: selectedPost.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId: replyingTo ? replyingTo.id : undefined
      };
      await addDoc(collection(db, 'posts', selectedPost.id, 'comments'), commentData);
      await updateDoc(doc(db, 'posts', selectedPost.id), { commentCount: increment(1) });
      setNewComment('');
      setReplyingTo(null);
    } catch (err) { showToast('Comment failed', 'error'); }
    finally { setIsPostingComment(false); }
  };

  const filteredPosts = posts.filter(p => !hiddenPosts.includes(p.id));
  const activeCirclePosts = viewingCircle ? posts.filter(p => p.circleId === viewingCircle.id) : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto w-full space-y-6 pb-24"
    >
      <div className="flex items-center justify-between sticky top-0 bg-blue-50/80 backdrop-blur-md z-[100] py-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-blue-900 hover:scale-105 active:scale-95 transition-transform">
              <ArrowLeft size={24} />
            </button>
            <div onClick={() => setActiveScreen('nexus-video')} className="cursor-pointer group">
              <h2 className="text-3xl font-black text-blue-900 tracking-tight group-hover:text-blue-600 transition-colors">The Nexus</h2>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <Video size={12} /> Watch Nexo Reels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setShowSearch(!showSearch)} className="p-4 bg-white text-blue-900 rounded-2xl shadow-sm">
                <Search size={20} />
             </button>
             <button onClick={() => setIsCreatingPost(true)} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                <Plus size={20} />
             </button>
          </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <input 
              autoFocus
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search the pulse, nodes, or frequencies..."
              className="w-full bg-white border-2 border-blue-100 rounded-2xl p-4 font-bold text-blue-900 placeholder-blue-200 focus:outline-none focus:border-blue-300"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 p-1.5 bg-blue-50/50 rounded-2xl w-fit">
        <button onClick={() => {
          if (settings.soundEnabled) play('header_switch');
          setActiveTab('feed');
        }} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-900/40 hover:text-blue-600'}`}>Pulse Feed</button>
        <button onClick={() => {
          if (settings.soundEnabled) play('header_switch');
          setActiveTab('circles');
        }} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'circles' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-900/40 hover:text-blue-600'}`}>Nodes</button>
        <button onClick={() => {
          if (settings.soundEnabled) play('header_switch');
          setActiveTab('inbox');
        }} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'inbox' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-900/40 hover:text-blue-600'}`}>
          Inbox
          {notifications.some(n => !n.isRead) && <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />}
        </button>
      </div>

      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center opacity-20">
               <RefreshCw size={64} className="mx-auto mb-4 animate-spin-slow" />
               <p className="font-black uppercase tracking-widest text-xs">Waiting for Signal...</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <PostCard 
                key={post.id}
                post={post}
                user={user}
                settings={settings}
                circles={circles}
                savedPosts={savedPosts}
                toggleSavePost={toggleSavePost}
                handleAction={handleAction}
                setSelectedPost={setSelectedPost}
                setViewingCircle={setViewingCircle}
                handleToggleJoin={handleToggleJoin}
                hidePost={(id: string) => setHiddenPosts(prev => [...prev, id])}
                handleDeletePost={handleDeletePost}
                showToast={showToast}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'circles' && (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-blue-900 italic">Active Nodes</h3>
              <button 
                onClick={() => setIsCreatingCircle(true)}
                className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
              >
                 Initialize Node <Plus size={14} />
              </button>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {circles.map(circle => (
                <motion.div 
                  key={circle.id}
                  layoutId={circle.id}
                  onClick={() => setViewingCircle(circle)}
                  className="glass-card p-6 cursor-pointer group hover:bg-white transition-colors"
                >
                   <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:rotate-12 transition-transform ${circle.color || 'bg-blue-100'}`}>
                         {circle.icon || '🏮'}
                      </div>
                      <div className="text-right">
                         <span className="block text-[8px] font-black text-blue-400 uppercase tracking-widest">Efficiency</span>
                         <span className="text-sm font-black text-blue-900">{circle.memberCount || 0}</span>
                      </div>
                   </div>
                   <h4 className="text-lg font-black text-blue-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{circle.name}</h4>
                   <p className="text-xs font-medium text-blue-900/40 line-clamp-2 mt-2 leading-relaxed">
                      {circle.description}
                   </p>
                </motion.div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="space-y-4">
           {notifications.length === 0 ? (
             <div className="py-20 text-center opacity-20">
                <Bookmark size={64} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Awaiting Transmissions...</p>
             </div>
           ) : (
             notifications.map(notif => (
               <div key={notif.id} className={`glass-card p-4 flex items-center gap-4 ${!notif.isRead ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                     {notif.type === 'like' ? <Heart size={20} /> : notif.type === 'reply' ? <MessageSquare size={20} /> : <Award size={20} />}
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-blue-900">{notif.senderName}</p>
                     <p className="text-xs font-medium text-blue-900/60 mt-0.5">{notif.message}</p>
                     <p className="text-[8px] font-black text-blue-400 uppercase mt-2">{format(parseISO(notif.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
               </div>
             ))
           )}
        </div>
      )}


      {/* Modals and Overlays */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-blue-900/60 backdrop-blur-xl p-4 sm:p-8" onClick={() => setSelectedPost(null)}>
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               onClick={e => e.stopPropagation()}
               className="bg-white w-full max-w-2xl h-full max-h-[85vh] rounded-[2.5rem] shadow-[0_0_80px_rgba(30,58,138,0.3)] overflow-hidden flex flex-col relative"
             >
                <div className="absolute top-6 right-6 z-10">
                   <button onClick={() => setSelectedPost(null)} className="p-3 bg-blue-50 text-blue-900 rounded-2xl hover:scale-110 active:scale-90 transition-all">
                      <X size={24} />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-xl">
                         {selectedPost.userPhoto ? <img src={selectedPost.userPhoto} className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-blue-400" />}
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-blue-900">{selectedPost.userName}</h3>
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{format(parseISO(selectedPost.createdAt), 'MMMM do, yyyy')}</p>
                      </div>
                   </div>

                   <p className="text-2xl font-black text-blue-900 leading-tight tracking-tight italic">
                      "{selectedPost.content}"
                   </p>

                   {selectedPost.type === 'video' && selectedPost.videoUrl && (
                     <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-blue-50">
                        <VideoPlayer url={selectedPost.videoUrl} />
                     </div>
                   )}

                   <div className="space-y-6">
                      <div className="flex items-center justify-between border-b-2 border-blue-50 pb-4">
                         <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Signal Comments</h4>
                         <span className="text-xs font-bold text-blue-400">{comments.length} Transmissions</span>
                      </div>
                      
                      <div className="space-y-4">
                         {comments.map(comment => (
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
                                     onClick={() => setReplyingTo(comment)}
                                     className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                                   >
                                     <MessageSquare size={10} /> Reply
                                   </button>
                                   <span className="text-[10px] font-bold text-blue-300">{format(parseISO(comment.createdAt), 'MMM d, h:mm a')}</span>
                                </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-blue-50/50 border-t-2 border-white backdrop-blur-sm">
                   {replyingTo && (
                     <div className="flex items-center justify-between mb-4 bg-blue-100/50 px-4 py-2 rounded-xl">
                       <span className="text-[10px] font-black uppercase text-blue-600">Replying to {replyingTo.userName}</span>
                       <button onClick={() => setReplyingTo(null)} className="text-blue-400 hover:text-blue-600 p-1"><X size={12} /></button>
                     </div>
                   )}
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                         <User size={20} />
                      </div>
                      <input 
                        type="text" 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Join the frequency..." 
                        className="flex-1 bg-transparent text-sm font-bold text-blue-900 placeholder-blue-300 focus:outline-none"
                      />
                      <button 
                        onClick={handlePostComment}
                        disabled={isPostingComment || !newComment.trim()}
                        className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                      >
                         <Send size={20} />
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}

        {isCreatingPost && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-blue-900/60 backdrop-blur-xl p-4" onClick={() => setIsCreatingPost(false)}>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               onClick={e => e.stopPropagation()}
               className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative"
             >
                <button onClick={() => setIsCreatingPost(false)} className="absolute top-6 right-6 p-2 text-blue-900/20 hover:text-blue-900">
                   <X size={24} />
                </button>
                <h3 className="text-3xl font-black text-blue-900 mb-8 italic tracking-tighter uppercase">Nexus Burst</h3>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4">Target Node</label>
                      <select 
                        value={selectedCircleId} 
                        onChange={e => setSelectedCircleId(e.target.value)}
                        className="w-full bg-blue-50 rounded-2xl p-4 font-bold text-blue-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                         {circles.map(c => <option key={c.id} value={c.id}>n/{c.name.toLowerCase()}</option>)}
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4">Signal Content</label>
                      <textarea 
                        value={newPostContent} 
                        onChange={e => setNewPostContent(e.target.value)}
                        placeholder="Broadcast your frequency..."
                        className="w-full bg-blue-50 rounded-3xl p-6 font-bold text-blue-900 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                      />
                   </div>

                   <button 
                     onClick={() => setShowVideoInput(!showVideoInput)}
                     className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${showVideoInput ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-400'}`}
                   >
                      <Video size={14} /> {showVideoInput ? 'Active Signal' : 'Add Video Signal'}
                   </button>

                   {showVideoInput && (
                     <input 
                        type="text"
                        value={newVideoUrl}
                        onChange={e => setNewVideoUrl(e.target.value)}
                        placeholder="Enter URL (YouTube/TikTok)"
                        className="w-full bg-blue-50 rounded-2xl p-4 font-bold text-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 border-2 border-blue-100"
                     />
                   )}

                   <button 
                     onClick={handleCreatePost}
                     disabled={isSubmitting || !newPostContent.trim()}
                     className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
                   >
                      {isSubmitting ? 'Sychnronizing...' : 'Go Live! 🚀'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}

        {viewingCircle && (
          <div className="fixed inset-0 z-[1000] flex flex-col bg-white" onClick={() => setViewingCircle(null)}>
             <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-6 flex items-center justify-between border-b border-blue-50">
                <div className="flex items-center gap-4">
                   <button onClick={() => setViewingCircle(null)} className="p-3 bg-blue-50 text-blue-900 rounded-2xl">
                      <ArrowLeft size={24} />
                   </button>
                   <div>
                      <h3 className="text-xl font-black text-blue-900 italic">n/{viewingCircle.name.toLowerCase()}</h3>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{viewingCircle.memberCount} Focused Members</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleToggleJoin(viewingCircle)}
                  className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95 ${settings.joinedCircleIds?.includes(viewingCircle.id) ? 'bg-blue-50 text-blue-900' : 'bg-blue-600 text-white shadow-blue-200'}`}
                >
                   {settings.joinedCircleIds?.includes(viewingCircle.id) ? 'LEAVE NODE' : 'JOIN NODE'}
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="glass-card p-8 bg-blue-600 relative overflow-hidden text-white mb-8 shadow-2xl shadow-blue-100">
                   <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center text-4xl mb-6 backdrop-blur-sm border border-white/30">
                        {viewingCircle.icon}
                      </div>
                      <h4 className="text-3xl font-black italic mb-2">The Node Pulse</h4>
                      <p className="font-medium text-blue-50/80 leading-relaxed max-w-lg italic">"{viewingCircle.description}"</p>
                   </div>
                   <Award size={180} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                   {activeCirclePosts.length === 0 ? (
                      <div className="py-20 text-center opacity-20">
                         <RefreshCw size={64} className="mx-auto mb-4 animate-spin-slow" />
                         <p className="font-black uppercase tracking-widest text-xs">Waiting for Signal in this Node...</p>
                      </div>
                   ) : (
                      activeCirclePosts.map(post => (
                        <PostCard 
                          key={post.id} post={post} user={user} settings={settings} circles={circles} savedPosts={savedPosts} toggleSavePost={toggleSavePost} handleAction={handleAction} setSelectedPost={setSelectedPost} setViewingCircle={setViewingCircle} handleToggleJoin={handleToggleJoin} hidePost={() => {}} handleDeletePost={handleDeletePost} showToast={showToast}
                        />
                      ))
                   )}
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

