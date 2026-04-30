import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { ArrowLeft, Plus, Video, MoreHorizontal, Trash2, Bookmark, Flag, EyeOff, Share2, MessageSquare, Heart, RefreshCw, Send, X, Search, Award, User, Flame, ChevronRight, Bell } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, collection, query, orderBy, onSnapshot, setDoc, updateDoc, increment, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, SocialCircle, SocialComment, NexusNotification, Screen, UserSettings, UserStats } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { VideoPlayer } from './VideoPlayer';
import { CreateCircleWizard } from './CreateCircleWizard';

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

  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard! 🔗', 'info');
      } catch (err) {
        showToast('Failed to copy link', 'error');
      }
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim() || !user) return;
    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.uid,
        reporterName: user.displayName,
        reporterEmail: user.email,
        postId: post.id,
        postAuthorId: post.userId,
        postAuthorName: post.userName,
        postContent: post.content,
        reason: reportReason,
        location: window.location.href,
        createdAt: new Date().toISOString()
      });
      showToast('Nexus Security alerted. Thank you.', 'success');
      setIsReporting(false);
      setReportReason('');
    } catch (err) {
      showToast('Failed to send report', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <>
      <motion.div 
        layoutId={post.id}
        className="bg-white border border-slate-200/60 p-5 space-y-4 hover:border-blue-200 transition-all cursor-pointer group active:scale-[0.99] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
        onClick={() => setSelectedPost(post)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden ring-2 ring-slate-50 shadow-sm shrink-0">
              {post.userPhoto ? <img src={post.userPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User className="w-full h-full p-2.5 text-slate-400" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-slate-900 text-sm">{post.userName}</h4>
                {post.milestoneData && <Award size={14} className="text-orange-500" />}
                <span className="text-[10px] text-slate-400 font-medium ml-1">· {format(parseISO(post.createdAt), 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const circle = circles.find((c: any) => c.id === post.circleId);
                    if (circle) setViewingCircle(circle);
                  }}
                  className="text-[10px] font-bold text-blue-500 hover:underline transition-all"
                >
                  n/{post.circleName.replace(/\s+/g, '').toLowerCase()}
                </button>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
              <MoreHorizontal size={18} />
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[120]" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-10 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 w-48 z-[130] overflow-hidden"
                  >
                    {isOwner ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); handleDeletePost(post.id); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3">
                          <Trash2 size={14} /> Delete Signal
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); toggleSavePost(post.id); }} className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-3 ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                          <Bookmark size={14} className={isSaved ? "fill-blue-600" : ""} /> {isSaved ? 'Saved in Library' : 'Save Signal'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); toggleSavePost(post.id); }} className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-3 ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                          <Bookmark size={14} className={isSaved ? "fill-blue-600" : ""} /> {isSaved ? 'Saved' : 'Save Signal'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); setIsReporting(true); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-3">
                          <Flag size={14} /> Report Pulse
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); hidePost(post.id); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-400 hover:bg-slate-50 flex items-center gap-3">
                          <EyeOff size={14} /> Not Interested
                        </button>
                      </>
                    )}
                    <button onClick={handleShare} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 border-t border-slate-50 mt-1">
                      <Share2 size={14} /> Share Link
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-slate-900 font-medium text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {post.type === 'video' && post.videoUrl && (
          <div className="pt-1 rounded-2xl overflow-hidden shadow-inner bg-black/5" onClick={e => e.stopPropagation()}>
            <VideoPlayer url={post.videoUrl} />
          </div>
        )}

        <div className="flex items-center justify-between pt-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-6">
            <button 
              className="flex items-center gap-1.5 transition-all active:scale-90 text-slate-400 hover:text-orange-500 cursor-pointer" 
              onClick={(e) => { e.stopPropagation(); handleAction(post.id, 'flame'); }}
            >
               <motion.div whileTap={{ scale: 1.5 }}>
                 <Flame size={18} className={(post.likedBy || []).includes(user?.uid || '') ? "fill-orange-500 text-orange-500" : ""} />
               </motion.div>
               <span className="text-xs font-bold">{post.flames || 0}</span>
            </button>
            <button 
              className="flex items-center gap-1.5 transition-all active:scale-90 text-slate-400 hover:text-blue-500 cursor-pointer" 
              onClick={(e) => { e.stopPropagation(); handleAction(post.id, 'shield'); }}
            >
               <motion.div whileTap={{ scale: 1.5 }}>
                 <Award size={18} className={(post.shieldedBy || []).includes(user?.uid || '') ? "fill-blue-500 text-blue-500" : ""} />
               </motion.div>
               <span className="text-xs font-bold">{post.shields || 0}</span>
            </button>
            <button onClick={() => setSelectedPost(post)} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-all">
              <MessageSquare size={18} />
              <span className="text-xs font-bold">{post.commentCount || 0}</span>
            </button>
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleSavePost(post.id); }} className={`p-2 rounded-full transition-all ${isSaved ? 'text-blue-600' : 'text-slate-300 hover:bg-slate-100'}`}>
            <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReporting && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-blue-900/60 backdrop-blur-xl p-4" onClick={() => setIsReporting(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-sm p-8 rounded-[2rem] shadow-2xl relative"
            >
              <h3 className="text-xl font-black text-slate-900 mb-4 italic uppercase tracking-tighter">Report Pulse</h3>
              <p className="text-xs text-slate-500 mb-6 font-bold leading-relaxed">Broadcast the violation to Security. Detail exactly what's wrong.</p>
              <textarea 
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                placeholder="Reason for report..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold h-32 resize-none focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsReporting(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
                <button 
                  disabled={isSubmittingReport || !reportReason.trim()}
                  onClick={handleReport}
                  className="flex-[2] py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Reporting...' : 'Alert Security'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
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
  
  // New States for Wizard and Sorting
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    category: '',
    name: '',
    description: '',
    rules: [] as string[],
    icon: '🏮',
    color: 'bg-blue-100'
  });
  const [expandedRules, setExpandedRules] = useState(false);
  const [sortOrder, setSortOrder] = useState<'hot' | 'new' | 'top' | 'best'>('new');
  const [isFollowingNode, setIsFollowingNode] = useState(false);
  
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
        await updateDoc(postRef, { 
          likedBy: newLikedBy, 
          flames: newLikedBy.length 
        });
      } else {
        const newShieldedBy = isShielded ? shieldedBy.filter(id => id !== userId) : [...shieldedBy, userId];
        await updateDoc(postRef, { 
          shieldedBy: newShieldedBy, 
          shields: newShieldedBy.length 
        });
      }
    } catch (err) { 
      showToast('Interaction failed', 'error');
      console.error('Action failed:', err); 
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Erase this Signal from the Nexus permanently? 🛡️')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      showToast('Signal erased.', 'success');
      if (selectedPost?.id === postId) setSelectedPost(null);
    } catch (err) { showToast('Operation failed', 'error'); }
  };

  const toggleSavePost = (id: string) => {
    const isSaved = savedPosts.includes(id);
    const newSaved = isSaved ? savedPosts.filter(i => i !== id) : [...savedPosts, id];
    setSavedPosts(newSaved);
    vibrate(VIBRATION_PATTERNS.CLICK);
    showToast(isSaved ? 'Removed from Library' : 'Saved to Library! 📡', 'success');
  };

  const hidePost = (id: string) => {
    setHiddenPosts(prev => [...prev, id]);
    showToast('Signal dampened.', 'info');
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

  const handleToggleFollowNode = async (circleId: string) => {
    if (!user) return;
    vibrate(VIBRATION_PATTERNS.CLICK);
    const notifIds = settings.notifEnabledCircleIds || [];
    const isFollowing = notifIds.includes(circleId);
    const newNotifIds = isFollowing ? notifIds.filter(id => id !== circleId) : [...notifIds, circleId];
    
    try {
      onUpdateSettings({ notifEnabledCircleIds: newNotifIds });
      // Update circle followerIds for server-side push notifications logic
      const circleRef = doc(db, 'circles', circleId);
      const circle = circles.find(c => c.id === circleId);
      if (circle) {
        const followerIds = circle.followerIds || [];
        const newFollowers = isFollowing ? followerIds.filter(id => id !== user.uid) : [...followerIds, user.uid];
        await updateDoc(circleRef, { followerIds: newFollowers });
      }
      setIsFollowingNode(!isFollowing);
      showToast(isFollowing ? 'Notifications Muted' : 'Signals Subscribed! 🔔', 'success');
    } catch (err) { showToast('Subscription failed', 'error'); }
  };

  const handleCreateCircleWizard = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    try {
      if (circleToEdit) {
        const circleRef = doc(db, 'circles', circleToEdit.id);
        await updateDoc(circleRef, {
          name: data.name,
          description: data.description,
          rules: data.rules,
          icon: data.icon,
          color: data.color,
          category: data.category
        });
        showToast('Node Decrypted & Rebuilt! 🏮', 'success');
      } else {
        const circleData: Omit<SocialCircle, 'id'> = {
          name: data.name,
          description: data.description,
          rules: data.rules,
          icon: data.icon,
          color: data.color,
          category: data.category || 'General',
          memberCount: 1,
          ownerId: user.uid,
          followerIds: [user.uid],
          createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'circles'), circleData);
        // Join the circle automatically
        const joinedIds = settings.joinedCircleIds || [];
        onUpdateSettings({ joinedCircleIds: [...joinedIds, docRef.id] });
        showToast('Node Initialized! 🏮', 'success');
        play('quest_complete');
      }
      setIsCreatingCircle(false);
      setCircleToEdit(null);
    } catch (err) { 
      showToast('Nexus sync failed', 'error'); 
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortPosts = (postsToSort: Post[]) => {
    return [...postsToSort].sort((a, b) => {
      if (sortOrder === 'new') return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
      if (sortOrder === 'top') return (b.flames + b.shields) - (a.flames + a.shields);
      if (sortOrder === 'hot') {
        const scoreA = (a.flames + a.shields) / ((Date.now() - parseISO(a.createdAt).getTime()) / 3600000 + 2);
        const scoreB = (b.flames + b.shields) / ((Date.now() - parseISO(b.createdAt).getTime()) / 3600000 + 2);
        return scoreB - scoreA;
      }
      return 0;
    });
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
      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      // Broadcast notifications to followers
      if (circle && circle.followerIds) {
        const followersToNotify = circle.followerIds.filter(id => id !== user.uid);
        for (const followerId of followersToNotify) {
          await addDoc(collection(db, 'users', followerId, 'notifications'), {
            type: 'post',
            senderId: user.uid,
            senderName: user.displayName || 'Anonymous',
            message: `posted a new Signal in n/${circle.name.toLowerCase()}`,
            targetId: docRef.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }

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

  const [showSortDropdown, setShowSortDropdown] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto w-full space-y-6 pb-24 scroll-smooth"
    >
      <div className="flex items-center justify-between sticky top-0 bg-blue-50/90 backdrop-blur-xl z-[100] py-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-900 hover:scale-105 active:scale-95 transition-all">
              <ArrowLeft size={22} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Nexus Pulse</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Relay Active</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setShowSearch(!showSearch)} className="p-3.5 bg-white text-slate-600 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
                <Search size={18} />
             </button>
             <button onClick={() => setIsCreatingPost(true)} className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                <Plus size={18} />
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
        <div className="relative">
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-300 transition-all shadow-sm"
          >
            {sortOrder === 'hot' && <Flame size={14} className="text-orange-500" />}
            {sortOrder === 'new' && <RefreshCw size={14} className="text-blue-500" />}
            {sortOrder === 'top' && <Award size={14} className="text-purple-500" />}
            {sortOrder === 'best' && <Heart size={14} className="text-red-500" />}
            <span className="uppercase tracking-widest">{sortOrder}</span>
            <ChevronRight size={14} className={`transition-transform ${showSortDropdown ? 'rotate-90' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showSortDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-1 z-50 min-w-[140px] overflow-hidden"
                >
                  {[
                    { id: 'hot', icon: <Flame size={14} />, label: 'Hot' },
                    { id: 'new', icon: <RefreshCw size={14} />, label: 'New' },
                    { id: 'top', icon: <Award size={14} />, label: 'Top' },
                    { id: 'best', icon: <Heart size={14} />, label: 'Best' }
                  ].map(btn => (
                    <button 
                      key={btn.id}
                      onClick={() => { setSortOrder(btn.id as any); setShowSortDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${sortOrder === btn.id ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                    >
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 gap-6">
          {sortPosts(filteredPosts).length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
             <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Committes</h3>
                <button 
                  onClick={() => setIsCreatingCircle(true)}
                  className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                >
                   Initialize Node <Plus size={14} />
                </button>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {circles.map(circle => (
                  <motion.div 
                    key={circle.id}
                    layoutId={circle.id}
                    onClick={() => setViewingCircle(circle)}
                    className="bg-white border border-slate-200/80 p-5 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all cursor-pointer group active:scale-[0.99] flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:rotate-6 transition-transform shrink-0 ${circle.color || 'bg-blue-100'}`}>
                         {circle.icon || '🏮'}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">n/{circle.name.replace(/\s+/g, '').toLowerCase()}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{circle.memberCount || 0} Members · {circle.category}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleFollowNode(circle.id); }}
                          className={`p-2.5 rounded-xl transition-all ${settings.notifEnabledCircleIds?.includes(circle.id) ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-slate-50 text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                        >
                           <Bell size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingCircle(circle); setExpandedRules(true); }}
                          className="p-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-all"
                        >
                           <Search size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 line-clamp-2 leading-relaxed px-1">
                       {circle.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleToggleJoin(circle); }}
                         className={`flex-1 py-2.5 rounded-xl font-black text-[10px] tracking-widest transition-all ${settings.joinedCircleIds?.includes(circle.id) ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}
                       >
                          {settings.joinedCircleIds?.includes(circle.id) ? 'CONNECTED' : 'INITIALIZE'}
                       </button>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 space-y-6 sticky top-24 shadow-sm">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Flame size={20} className="text-orange-500" />
                  Hot Nodes
                </h3>
                <div className="space-y-4">
                  {circles.slice(0, 5).map((circle, i) => (
                    <div key={circle.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors" onClick={() => setViewingCircle(circle)}>
                      <span className="text-sm font-black text-slate-300 w-4">{i + 1}</span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${circle.color || 'bg-blue-100'}`}>
                        {circle.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-none truncate underline decoration-transparent group-hover:decoration-blue-500 transition-all">n/{circle.name.split(' ')[0].toLowerCase()}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">Active Now</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 mb-4">You have joined {(settings.joinedCircleIds || []).length} community nodes.</p>
                <button onClick={() => showToast('Rules of the Nexus applied!', 'info')} className="w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all border border-slate-100">
                  Community Charter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="max-w-2xl mx-auto w-full space-y-4">
           <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Incoming Signals</h3>
             <button onClick={() => showToast('All marked as read', 'info')} className="text-[10px] font-bold text-blue-500 hover:underline">Mark all read</button>
           </div>
           {notifications.length === 0 ? (
             <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-slate-100 rounded-[32px]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <Bell size={40} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Awaiting Transmissions</p>
                  <p className="text-xs text-slate-400 max-w-[200px] mx-auto mt-1">Your personal signal relay is quiet. Check back later for activity in your nodes.</p>
                </div>
             </div>
           ) : (
             notifications.map(notif => (
               <motion.div 
                 key={notif.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${!notif.isRead ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-slate-100'}`}
               >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                     {notif.type === 'like' ? <Flame size={18} /> : 
                      notif.type === 'reply' ? <MessageSquare size={18} /> : 
                      <Award size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                      <span className="font-black">{notif.senderName}</span> {notif.message}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                      {format(parseISO(notif.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
               </motion.div>
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

        {isCreatingCircle && (
          <CreateCircleWizard 
            onClose={() => { setIsCreatingCircle(false); setCircleToEdit(null); }}
            onComplete={handleCreateCircleWizard}
            isSubmitting={isSubmitting}
            initialData={circleToEdit}
          />
        )}

        {viewingCircle && (
          <div className="fixed inset-0 z-[1000] flex flex-col bg-slate-50/95 backdrop-blur-xl overflow-y-auto" onClick={() => setViewingCircle(null)}>
             <div className="w-full max-w-4xl mx-auto min-h-screen bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
               <div className={`h-48 relative ${viewingCircle.color || 'bg-blue-600'} transition-all`}>
                  <button onClick={() => setViewingCircle(null)} className="absolute top-6 left-6 p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-2xl transition-all backdrop-blur-md">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="absolute top-6 right-6 flex items-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleFollowNode(viewingCircle.id); }}
                      className={`p-2.5 rounded-2xl transition-all backdrop-blur-md ${settings.notifEnabledCircleIds?.includes(viewingCircle.id) ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/40'}`}
                    >
                      <Bell size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setExpandedRules(true); }}
                      className="p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-2xl transition-all backdrop-blur-md"
                    >
                      <Info size={20} />
                    </button>
                    <button 
                      onClick={() => handleToggleJoin(viewingCircle)}
                      className={`px-6 py-2.5 rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl active:scale-95 ${settings.joinedCircleIds?.includes(viewingCircle.id) ? 'bg-white text-blue-600 shadow-blue-900/10' : 'bg-orange-600 text-white shadow-orange-900/10'}`}
                    >
                       {settings.joinedCircleIds?.includes(viewingCircle.id) ? 'LEAVE' : 'JOIN NODE'}
                    </button>
                  </div>
                  <div className="absolute -bottom-12 left-8 flex items-end gap-5">
                    <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center text-5xl shadow-2xl ring-8 ring-white ${viewingCircle.color || 'bg-blue-100'}`}>
                      {viewingCircle.icon}
                    </div>
                    <div className="pb-4">
                      <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">n/{viewingCircle.name.replace(/\s+/g, '').toLowerCase()}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">{viewingCircle.memberCount} active transponders</p>
                    </div>
                  </div>
               </div>

               <div className="flex-1 p-8 pt-20">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6 relative">
                    <div className="relative">
                      <button 
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm"
                      >
                        {sortOrder === 'hot' && <Flame size={14} className="text-orange-500" />}
                        {sortOrder === 'new' && <RefreshCw size={14} className="text-blue-500" />}
                        {sortOrder === 'top' && <Award size={14} className="text-purple-500" />}
                        <span className="uppercase tracking-widest">{sortOrder}</span>
                        <ChevronRight size={14} className={`transition-transform ${showSortDropdown ? 'rotate-90' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {showSortDropdown && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full left-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-1 z-50 min-w-[140px] overflow-hidden"
                            >
                              {['hot', 'new', 'top'].map(s => (
                                <button 
                                  key={s}
                                  onClick={() => { setSortOrder(s as any); setShowSortDropdown(false); }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sortOrder === s ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                                >
                                  {s === 'hot' && <Flame size={12} />}
                                  {s === 'new' && <RefreshCw size={12} />}
                                  {s === 'top' && <Award size={12} />}
                                  {s}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <button onClick={() => { setIsCreatingPost(true); setSelectedCircleId(viewingCircle.id); }} className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-90 transition-all">
                      <Plus size={16} /> New Signal
                    </button>
                  </div>

                  <div className="space-y-6 max-w-2xl mx-auto">
                     {sortPosts(posts.filter(p => p.circleId === viewingCircle.id)).length === 0 ? (
                        <div className="py-24 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                           <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                             <RefreshCw size={32} className="animate-spin-slow" />
                           </div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting first frequency broadcast...</p>
                        </div>
                     ) : (
                        sortPosts(posts.filter(p => p.circleId === viewingCircle.id)).map(post => (
                          <PostCard 
                            key={post.id} post={post} user={user} settings={settings} circles={circles} savedPosts={savedPosts} toggleSavePost={toggleSavePost} handleAction={handleAction} setSelectedPost={setSelectedPost} setViewingCircle={setViewingCircle} handleToggleJoin={handleToggleJoin} hidePost={() => {}} handleDeletePost={handleDeletePost} showToast={showToast}
                          />
                        ))
                     )}
                  </div>
               </div>
             </div>

             {/* Community Info Overlay */}
             <AnimatePresence>
                {expandedRules && (
                  <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => setExpandedRules(false)}>
                    <motion.div 
                      key="community-info"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onClick={e => e.stopPropagation()}
                      className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                      <div className={`p-8 ${viewingCircle.color || 'bg-blue-600'} text-white`}>
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-2xl font-black italic uppercase tracking-tighter">Node Protocol</h3>
                           <button onClick={() => setExpandedRules(false)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all">
                              <X size={20} />
                           </button>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/30">
                              {viewingCircle.icon}
                           </div>
                           <div>
                              <h4 className="text-xl font-black italic">n/{viewingCircle.name.toLowerCase()}</h4>
                              <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{viewingCircle.category} Spectrum</p>
                           </div>
                        </div>
                      </div>
                      
                      <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                        <section>
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Mission Statement</h5>
                           <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{viewingCircle.description}"</p>
                        </section>

                        <section>
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Frequency Rules</h5>
                           <div className="space-y-3">
                              {(viewingCircle.rules || ['Be respectful', 'Stay on topic', 'No spam']).map((rule, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                                   <span className="text-xs font-black text-blue-500">{i + 1}</span>
                                   <p className="text-xs font-bold text-slate-600 leading-tight">{rule}</p>
                                </div>
                              ))}
                           </div>
                        </section>

                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center opacity-40">
                           <span className="text-[9px] font-black uppercase tracking-widest">Est. {format(parseISO(viewingCircle.createdAt || new Date().toISOString()), 'MMM yyyy')}</span>
                           <Award size={16} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
             </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

