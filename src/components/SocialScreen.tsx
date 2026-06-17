import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Plus, MoreHorizontal, Trash2, Bookmark, Flag, EyeOff, 
  Share2, MessageSquare, Heart, RefreshCw, Send, X, Search, Award, 
  User, Flame, ChevronRight, Bell, Info, Compass, Sparkles, 
  ChevronUp, ChevronDown, Image as ImageIcon, Video, AlertCircle, Check, MapPin, Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, collection, query, orderBy, onSnapshot, setDoc, updateDoc, increment, addDoc, deleteDoc } from 'firebase/firestore';
import { db, trackEvent } from '../firebase';
import { Post, SocialCircle, SocialComment, NexusNotification, Screen, UserSettings, UserStats } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { CreateGroupWizard } from './CreateGroupWizard';
import { TikTokReels } from './TikTokReels';

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

// Global parsed n/ Link Renderer helper
export function renderParsedText(
  text: string, 
  circles: SocialCircle[], 
  onNavigateToGroup: (c: SocialCircle) => void
) {
  if (!text) return '';
  const regex = /n\/([a-zA-Z0-9_\-]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    const groupName = match[1];
    const foundCircle = circles.find(
      c => c.name.toLowerCase().replace(/\s+/g, '') === groupName.toLowerCase()
    );

    if (foundCircle) {
      parts.push(
        <span
          key={`link-${matchIndex}`}
          onClick={(e) => {
            e.stopPropagation();
            vibrate(VIBRATION_PATTERNS.CLICK);
            onNavigateToGroup(foundCircle);
          }}
          className="text-blue-500 font-extrabold cursor-pointer hover:underline bg-blue-50 px-1 py-0.5 rounded transition-all"
        >
          n/{groupName}
        </span>
      );
    } else {
      parts.push(`n/${groupName}`);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const SocialScreen = React.memo(({ 
  onBack, user, settings, stats, showToast, onUpdateSettings, 
  posts, circles, notifications, setActiveScreen, play 
}: SocialScreenProps) => {

  const [activeTab, setActiveTab] = useState<'home' | 'reels' | 'circles' | 'inbox' | 'library'>('home');
  const [sortOrder, setSortOrder] = useState<'hot' | 'new' | 'top' | 'best'>('new');
  
  // Navigation & View overlays
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewingCircle, setViewingCircle] = useState<SocialCircle | null>(null);
  const [selectedNotificationPost, setSelectedNotificationPost] = useState<Post | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  
  // Circle editing/wizard
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);
  const [circleToEdit, setCircleToEdit] = useState<SocialCircle | null>(null);
  const [expandedRules, setExpandedRules] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Advanced blue expandable quick "+" menu
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postUploadType, setPostUploadType] = useState<'text' | 'image' | 'video'>('text');
  const [newPostHeadline, setNewPostHeadline] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCircleId, setSelectedCircleId] = useState('nexora-general');
  const [stagedMediaProgress, setStagedMediaProgress] = useState<number | null>(null);
  const [stagedMediaUrl, setStagedMediaUrl] = useState<string>('');

  // Comment updates (X style)
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [newCommentInput, setNewCommentInput] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<SocialComment | null>(null);

  // Local storage cache keys
  const [savedPosts, setSavedPosts] = useLocalStorage<string[]>('nexora_saved_posts', []);
  const [hiddenPosts, setHiddenPosts] = useState<string[]>([]);
  const [joinedCircleIds, setJoinedCircleIds] = useState<string[]>(settings.joinedCircleIds || ['nexora-general']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bind notifications setup onmount
  useEffect(() => {
    if (settings.joinedCircleIds) {
      setJoinedCircleIds(settings.joinedCircleIds);
    }
  }, [settings.joinedCircleIds]);

  // Comments watcher
  useEffect(() => {
    const postToUse = selectedPost || selectedNotificationPost;
    if (!postToUse) {
      setComments([]);
      return;
    }
    const qComments = query(collection(db, 'posts', postToUse.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubComments = onSnapshot(qComments, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialComment)));
    }, (error) => {
      console.error("Comments subscription failed:", error);
    });
    return () => unsubComments();
  }, [selectedPost, selectedNotificationPost]);

  // Handle post upvote/downvote counters
  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!user) {
      showToast('Authentication credentials is required.', 'info');
      return;
    }
    vibrate(VIBRATION_PATTERNS.CLICK);
    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Upvote logic (likedBy/flames), Downvote logic (downvotedBy/shields)
    const userId = user.uid;
    let likedBy = post.likedBy || [];
    let downvotedBy = post.shieldedBy || []; // Recycled shieldedBy as downvote array for model speed

    let alreadyLiked = likedBy.includes(userId);
    let alreadyDownvoted = downvotedBy.includes(userId);

    try {
      if (voteType === 'up') {
        if (alreadyLiked) {
          likedBy = likedBy.filter(id => id !== userId);
        } else {
          likedBy = [...likedBy, userId];
          if (alreadyDownvoted) {
            downvotedBy = downvotedBy.filter(id => id !== userId);
          }
        }
      } else {
        if (alreadyDownvoted) {
          downvotedBy = downvotedBy.filter(id => id !== userId);
        } else {
          downvotedBy = [...downvotedBy, userId];
          if (alreadyLiked) {
            likedBy = likedBy.filter(id => id !== userId);
          }
        }
      }

      await updateDoc(postRef, {
        likedBy,
        shieldedBy: downvotedBy,
        flames: likedBy.length,
        shields: downvotedBy.length
      });

      showToast(voteType === 'up' ? 'Feedback Upvoted! 🔥' : 'Dampened with Downvote', 'success');
      play('quest_complete');
    } catch (err) {
      showToast('Transmission Interrupted: vote failed', 'error');
    }
  };

  // Safe delete
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Erase this broadcasting signal permanently?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      showToast('Signal deleted from global grid successfully', 'success');
      if (selectedPost?.id === postId) setSelectedPost(null);
      if (selectedNotificationPost?.id === postId) setSelectedNotificationPost(null);
    } catch (err) {
      showToast('Action forbidden by network node', 'error');
    }
  };

  // Staged Media Selector trigger
  const handleStagedMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      vibrate(VIBRATION_PATTERNS.CLICK);
      setStagedMediaProgress(10);
      let progress = 10;
      const interval = setInterval(() => {
        progress += 30;
        if (progress >= 100) {
          clearInterval(interval);
          setStagedMediaProgress(100);
          const localUrl = URL.createObjectURL(file);
          setStagedMediaUrl(localUrl);
          showToast('Media stage compression succeeded!', 'success');
        } else {
          setStagedMediaProgress(progress);
        }
      }, 150);
    }
  };

  // Reddit rules: NO POST WITHOUT A HEADLINE !
  const handleCreateBroadcastingPost = async () => {
    if (!newPostHeadline.trim()) {
      showToast('Reddit Regulation: Headline Title is mandatory to broadcast!', 'error');
      return;
    }
    if (!newPostContent.trim()) {
      showToast('Post body context is required', 'error');
      return;
    }
    if (!user) return;

    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    try {
      setIsPostingComment(true);
      const circle = circles.find(c => c.id === selectedCircleId);
      
      const postData: any = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous Explorer',
        userEmail: user.email || '',
        userPhoto: user.photoURL || '',
        circleId: selectedCircleId,
        circleName: circle?.name || 'General',
        title: newPostHeadline.trim(),
        content: newPostContent.trim(),
        type: postUploadType,
        flames: 1,
        shields: 0,
        likedBy: [user.uid],
        shieldedBy: [],
        commentCount: 0,
        createdAt: new Date().toISOString()
      };

      if (postUploadType === 'image') {
        postData.imageUrl = stagedMediaUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';
      } else if (postUploadType === 'video') {
        postData.videoUrl = stagedMediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      }

      const docRef = await addDoc(collection(db, 'posts'), postData);

      // Trigger notifications for followers of the node
      if (circle && circle.followerIds) {
        const otherMembers = circle.followerIds.filter(id => id !== user.uid);
        for (const follower of otherMembers) {
          await addDoc(collection(db, 'users', follower, 'notifications'), {
            type: 'post',
            senderId: user.uid,
            senderName: user.displayName || 'Anonymous Explorer',
            message: `broadcasted a new node signal in n/${circle.name.toLowerCase()}: "${newPostHeadline.substring(0, 30)}..."`,
            targetId: docRef.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }

      setNewPostHeadline('');
      setNewPostContent('');
      setStagedMediaUrl('');
      setStagedMediaProgress(null);
      setIsCreatingPost(false);
      showToast('Signal broadcasting live to everyone in the Nexus!', 'success');
      play('quest_complete');
    } catch (err) {
      showToast('Transmission encryption collapsed.', 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  // Group join toggle
  const handleToggleJoinCircle = async (circle: SocialCircle) => {
    if (!user) return;
    vibrate(VIBRATION_PATTERNS.CLICK);
    const isJoined = joinedCircleIds.includes(circle.id);
    let updated;
    if (isJoined) {
      updated = joinedCircleIds.filter(id => id !== circle.id);
    } else {
      updated = [...joinedCircleIds, circle.id];
    }
    
    try {
      onUpdateSettings({ joinedCircleIds: updated });
      setJoinedCircleIds(updated);
      await updateDoc(doc(db, 'circles', circle.id), {
        memberCount: Math.max(1, circle.memberCount + (isJoined ? -1 : 1))
      });
      showToast(isJoined ? `Detached from n/${circle.name.toLowerCase()}` : `Joined n/${circle.name.toLowerCase()}! 🏮`, 'success');
    } catch (err) {
      showToast('Frequency sync collapse.', 'error');
    }
  };

  // Node subscription frequency toggle (bell)
  const handleToggleNotifyCircle = async (circleId: string) => {
    if (!user) return;
    vibrate(VIBRATION_PATTERNS.CLICK);
    const notifIds = settings.notifEnabledCircleIds || [];
    const isSub = notifIds.includes(circleId);
    let updated;

    if (isSub) {
      updated = notifIds.filter(id => id !== circleId);
    } else {
      updated = [...notifIds, circleId];
    }

    try {
      onUpdateSettings({ notifEnabledCircleIds: updated });
      const circle = circles.find(c => c.id === circleId);
      if (circle) {
         const oldFollowers = circle.followerIds || [];
         const updatedFollowers = isSub ? oldFollowers.filter(id => id !== user.uid) : [...oldFollowers, user.uid];
         await updateDoc(doc(db, 'circles', circleId), { followerIds: updatedFollowers });
      }
      showToast(isSub ? 'Subreddit updates silent' : 'Updates turned ON for this group! 🔔', 'success');
    } catch (err) {
      showToast('Uplink command interrupted.', 'error');
    }
  };

  // Create Subcommunity integration
  const handleDeployNewCircle = async (data: any) => {
    if (!user) return;
    const cleanName = data.name.trim().toLowerCase().replace(/\s+/g, '');
    const alreadyExists = circles.some(c => c.name.trim().toLowerCase().replace(/\s+/g, '') === cleanName);
    if (alreadyExists) {
      showToast(`A subcommunity named n/${cleanName} already exists! Try a different name.`, 'error');
      return;
    }

    try {
      setIsPostingComment(true);
      const circleData: Omit<SocialCircle, 'id'> = {
        name: data.name.trim(),
        description: data.description.trim(),
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
      const updatedJoined = [...joinedCircleIds, docRef.id];
      onUpdateSettings({ joinedCircleIds: updatedJoined });
      setJoinedCircleIds(updatedJoined);
      
      showToast(`n/${data.name} subcommunity fully operational! 🏮`, 'success');
      setIsCreatingCircle(false);
      play('quest_complete');
    } catch (err) {
      showToast('Subcommunity creation permission error.', 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  // X Style Reply additions
  const handleAddComment = async () => {
    const postToUse = selectedPost || selectedNotificationPost;
    if (!newCommentInput.trim() || !postToUse || !user) return;
    setIsPostingComment(true);
    vibrate(VIBRATION_PATTERNS.CLICK);
    try {
      const commentData: Omit<SocialComment, 'id'> = {
        postId: postToUse.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous Pilot',
        userPhoto: user.photoURL || '',
        content: newCommentInput.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId: replyingTo ? replyingTo.id : undefined
      };

      await addDoc(collection(db, 'posts', postToUse.id, 'comments'), commentData);
      await updateDoc(doc(db, 'posts', postToUse.id), { commentCount: increment(1) });
      
      // Update local listing counts
      if (selectedPost) {
         setSelectedPost(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null);
      }
      if (selectedNotificationPost) {
         setSelectedNotificationPost(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null);
      }

      setNewCommentInput('');
      setReplyingTo(null);
      showToast('Transmission comment response loaded.', 'success');
    } catch (err) {
      showToast('Comment sync rejected.', 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  // Sort Formulas
  const getSortedPosts = (items: Post[]) => {
    let result = [...items];
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.title?.toLowerCase().includes(s) || 
        r.content.toLowerCase().includes(s) ||
        r.circleName.toLowerCase().includes(s)
      );
    }

    return result.sort((a, b) => {
      if (sortOrder === 'new') {
        return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
      }
      if (sortOrder === 'best') {
        return b.flames - a.flames; // Pure upvoted top
      }
      if (sortOrder === 'hot') {
        // Hot includes combination of comments and upvotes
        const scoreA = (a.flames + (a.commentCount || 0) * 2) / ((Date.now() - parseISO(a.createdAt).getTime()) / 3600000 + 2);
        const scoreB = (b.flames + (b.commentCount || 0) * 2) / ((Date.now() - parseISO(b.createdAt).getTime()) / 3600000 + 2);
        return scoreB - scoreA;
      }
      if (sortOrder === 'top') {
        return (b.flames + b.shields) - (a.flames + a.shields);
      }
      return 0;
    });
  };

  // Bookmark toggle
  const toggleSaveGeneralPost = (id: string) => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    const existed = savedPosts.includes(id);
    if (existed) {
      setSavedPosts(savedPosts.filter(i => i !== id));
      showToast('Post unsaved', 'info');
    } else {
      setSavedPosts([...savedPosts, id]);
      showToast('Post stored in secure library!', 'success');
    }
  };

  if (false && activeTab === 'reels') {
    return (
      <div className="fixed inset-0 w-full h-full bg-black z-[1000] overflow-hidden flex flex-col">
        <TikTokReels 
          onBack={() => {
            setActiveTab('home');
            vibrate(VIBRATION_PATTERNS.CLICK);
          }}
          user={user}
          showToast={showToast}
          play={play}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 flex flex-col font-sans relative">
      {/* Top Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-50">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community</h1>
            <p className="text-slate-500 text-sm">Connect, share and grow together.</p>
        </div>
        <button className="p-3 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <Bell size={20} className="text-slate-700" />
            <span className="absolute top-4 right-6 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
        </button>
      </header>
      
      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search communities or topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm"
            />
            <button className="absolute right-3 top-3 p-2 bg-slate-50 rounded-2xl">
                <Search size={18} className="text-slate-400" />
            </button>
        </div>
      </div>

      {/* Categories */}
      <section className="px-6 py-4">
         <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-black text-slate-900">Categories</h2>
             <button className="text-indigo-600 font-bold text-sm">See all</button>
         </div>
         <div className="grid grid-cols-6 gap-2">
            {[ {name: 'Fitness', icon: '🏋️'}, {name: 'Productivity', icon: '✅'}, {name: 'Art', icon: '🎨'}, {name: 'Mindset', icon: '🧠'}, {name: 'Health', icon: '💧'}, {name: 'Learning', icon: '📚'} ].map(cat => (
                <div key={cat.name} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">{cat.icon}</div>
                    <span className="text-[10px] font-bold text-slate-700">{cat.name}</span>
                </div>
            ))}
         </div>
      </section>

      {/* Popular Groups */}
      <section className="px-6 py-4">
         <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-black text-slate-900">Popular Groups</h2>
             <button className="text-indigo-600 font-bold text-sm">See all</button>
         </div>
         <div className="flex gap-4 overflow-x-auto pb-4">
            {circles.slice(0, 3).map(circle => (
                <div key={circle.id} className="min-w-[200px] bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                    <div className="text-4xl">{circle.icon || '🏮'}</div>
                    <h3 className="font-black text-slate-900">{circle.name}</h3>
                    <p className="text-xs text-slate-500">{circle.memberCount} members</p>
                    <button className="w-full py-2 bg-emerald-500/10 text-emerald-600 font-black text-sm rounded-xl">Join</button>
                </div>
            ))}
         </div>
      </section>

      {/* Filter and Feed */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">


        {/* TAB 1: HOME MIXED FEED */}
        {activeTab === 'home' && (
          <div className="space-y-6">
             
             {/* Feed navigation, Sort controllers */}
             <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Feed Sorting:</span>
                   
                   {/* Cool dynamic picker: changes sticker bases */}
                   <div className="flex gap-1">
                     {[
                       { id: 'new', label: 'New', icon: <RefreshCw size={12} className="text-blue-500" /> },
                       { id: 'hot', label: 'Hot', icon: <Flame size={12} className="text-orange-500" /> },
                       { id: 'best', label: 'Best', icon: <Heart size={12} className="text-red-500" /> },
                       { id: 'top', label: 'Top', icon: <Award size={12} className="text-purple-500" /> }
                     ].map(btn => (
                        <button
                          key={btn.id}
                          onClick={() => {
                            setSortOrder(btn.id as any);
                            vibrate(VIBRATION_PATTERNS.CLICK);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${sortOrder === btn.id ? 'bg-slate-100 text-slate-800 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                           {btn.icon}
                           <span>{btn.label}</span>
                        </button>
                     ))}
                   </div>
                </div>

                <div className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase bg-slate-50 px-2 py-1 rounded-lg">
                   ACTIVE SIGNAL RELAY
                </div>
             </div>

             {/* Feed Content: Reddit Style post cards */}
             <div className="space-y-4">
                {getSortedPosts(posts).length === 0 ? (
                  <div className="py-20 text-center bg-white border border-slate-100 rounded-[2rem] p-8">
                     <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
                     <p className="font-extrabold text-sm text-slate-950">Awaiting Submissions</p>
                     <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">None matched your query. Use the floating blue "+" button to dispatch the first protocol post!</p>
                  </div>
                ) : (
                  getSortedPosts(posts).map(post => {
                    const isOwner = user?.uid === post.userId;
                    const isSaved = savedPosts.includes(post.id);
                    // Dynamically matching active circles
                    const groupCircle = circles.find(c => c.id === post.circleId);

                    return (
                      <motion.article 
                        key={post.id}
                        layoutId={post.id}
                        className="bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-3xl p-5 shadow-sm space-y-3 cursor-pointer"
                        onClick={() => setSelectedPost(post)}
                      >
                         {/* Card Header (Reddit style group name, icon on top, followed by user name) */}
                         <div className="flex items-center justify-between">
                            <div className="flex items-start gap-2.5">
                               {/* Group Badge */}
                               <div 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   if (groupCircle) setViewingCircle(groupCircle);
                                 }}
                                 className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 cursor-pointer ${groupCircle?.color || 'bg-slate-100'}`}
                               >
                                  {groupCircle?.icon || '🏮'}
                               </div>
                               <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         if (groupCircle) setViewingCircle(groupCircle);
                                       }}
                                       className="text-xs font-black text-slate-900 hover:underline hover:text-indigo-600 transition-colors"
                                     >
                                        n/{post.circleName.replace(/\s+/g, '').toLowerCase()}
                                     </button>
                                     <span className="text-slate-300 text-[10px]">·</span>
                                     <span className="text-[10px] text-slate-400 font-bold">u/{post.userName}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                     {format(parseISO(post.createdAt), 'MMM d · h:mm a')}
                                  </p>
                               </div>
                            </div>
                            
                            {/* Actions bar */}
                            <div className="flex items-center gap-1">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); toggleSaveGeneralPost(post.id); }}
                                 className={`p-2 rounded-xl transition-all ${isSaved ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:text-slate-600 bg-slate-50/50'}`}
                                 title="Save Post to Library"
                               >
                                  <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
                               </button>
                               {isOwner && (
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                                   className="p-2 bg-slate-50/50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                                   title="Scrub Signal"
                                 >
                                    <Trash2 size={15} />
                                 </button>
                               )}
                            </div>
                         </div>

                         {/* Post Title & Content */}
                         <div className="space-y-1">
                            <h3 className="font-extrabold text-sm text-slate-950 leading-snug">
                               {post.title || 'Untitled Signal Beacon'}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed break-words font-medium">
                               {renderParsedText(post.content, circles, (c) => setViewingCircle(c))}
                            </p>
                         </div>

                         {/* Media attachments */}
                         {post.imageUrl && (
                           <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-72 bg-slate-50">
                              <img src={post.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           </div>
                         )}

                         {post.videoUrl && (
                           <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-72 bg-black flex items-center justify-center">
                              <video src={post.videoUrl} className="w-full max-h-full" controls muted playsInline />
                           </div>
                         )}

                         {/* Reddit Score controller, X comment actions */}
                         <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
                            
                            {/* Up/Down votes */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50" onClick={e => e.stopPropagation()}>
                               <button 
                                 onClick={() => handleVote(post.id, 'up')}
                                 className={`p-1 rounded-lg transition-colors ${post.likedBy?.includes(user?.uid || '') ? 'text-orange-500 bg-orange-50/50' : 'text-slate-400 hover:text-slate-800'}`}
                                 title="Upvote"
                               >
                                  <ChevronUp size={16} strokeWidth={3} />
                               </button>
                               
                               <span className="px-1.5 font-mono text-[10px] font-extrabold text-slate-700 min-w-4 text-center">
                                  {(post.likedBy?.length || 0) - (post.shieldedBy?.length || 0)}
                                </span>

                               <button 
                                 onClick={() => handleVote(post.id, 'down')}
                                 className={`p-1 rounded-lg transition-colors ${post.shieldedBy?.includes(user?.uid || '') ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-800'}`}
                                 title="Downvote"
                               >
                                  <ChevronDown size={16} strokeWidth={3} stroke="currentColor" fill="none" />
                               </button>
                            </div>

                            {/* Comment X style actions */}
                            <button 
                              onClick={() => setSelectedPost(post)}
                              className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"
                            >
                               <MessageSquare size={14} />
                               <span className="font-extrabold text-[10px] tracking-wide">{post.commentCount || 0} Comments</span>
                            </button>

                         </div>
                      </motion.article>
                    );
                  })
                )}
             </div>

          </div>
        )}

        {/* TAB 3: GROUPS LIST / SUBCOMMUNITIES */}
        {activeTab === 'circles' && (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Subcommunities n/ Grid</h3>
                   <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">Reddit system sub communities. Click links to travel.</p>
                </div>
                <button 
                  onClick={() => { setIsCreatingCircle(true); vibrate(VIBRATION_PATTERNS.CLICK); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
                >
                   Create Subcommunity <Plus size={14} />
                </button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {circles.map(c => {
                  const isJoined = joinedCircleIds.includes(c.id);
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => setViewingCircle(c)}
                      className="bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-3xl p-5 shadow-sm flex items-center gap-4 cursor-pointer relative overflow-hidden group"
                    >
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0 transition-transform group-hover:scale-105 group-hover:rotate-3 ${c.color || 'bg-amber-100'}`}>
                          {c.icon || '🏮'}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm truncate group-hover:text-indigo-600 transition-colors">
                            n/{c.name.replace(/\s+/g, '').toLowerCase()}
                          </h4>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">{c.memberCount || 1} Members</p>
                          <p className="text-[10px] text-slate-400 truncate mt-1 leading-normal italic font-semibold">"{c.description}"</p>
                       </div>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           handleToggleJoinCircle(c);
                         }}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isJoined ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white shadow-sm'}`}
                       >
                          {isJoined ? 'Joined' : 'Join'}
                       </button>
                    </div>
                  );
               })}
             </div>
          </div>
        )}

        {/* TAB 4: INBOX / NOTIFICATIONS PROTOCOL */}
        {activeTab === 'inbox' && (
          <div className="space-y-4 max-w-xl mx-auto">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Post Notification Inbox</h3>
                <button 
                  onClick={() => showToast('Signals cleared!', 'info')} 
                  className="text-[10px] text-indigo-500 font-extrabold hover:underline"
                >
                  Clear Signal Logs
                </button>
             </div>

             {notifications.length === 0 ? (
               <div className="py-24 text-center bg-white border border-slate-100 rounded-[2rem] p-8 text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Bell size={40} className="text-slate-300" />
                  <p className="text-slate-900 font-extrabold text-sm">Signal Grid is Quiet</p>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">No new alerts received from joined Subcommunities. Subscribe to bell frequencies to catch and stream alerts!</p>
               </div>
             ) : (
               notifications.map(n => {
                 // Try to locate corresponding post
                 const associatedPost = posts.find(p => p.id === n.targetId);

                 return (
                   <motion.div 
                     key={n.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     onClick={() => {
                        vibrate(VIBRATION_PATTERNS.CLICK);
                        setSelectedNotification(n);
                        if (user?.uid) {
                           try {
                              updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), { isRead: true });
                           } catch (err) {
                              console.log("Trace error:", err);
                           }
                        }
                     }}
                     className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all flex items-start gap-4 cursor-pointer"
                   >
                     <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <Flame size={18} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                           <span className="font-extrabold text-slate-900">@{n.senderName}</span> {n.message}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">
                           {format(parseISO(n.createdAt), 'MMM d, h:mm a')}
                        </p>
                     </div>
                     <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 self-center" />
                   </motion.div>
                 );
               })
             )}
          </div>
        )}

        {/* TAB 5: DATA LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-4">
             <div className="px-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Library Bookmark Index</h3>
                <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-wide">Saved data telemetry cache</p>
             </div>

             {posts.filter(p => savedPosts.includes(p.id)).length === 0 ? (
               <div className="py-24 text-center bg-white border border-slate-100 rounded-[2rem] text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Bookmark size={36} className="text-slate-200" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Library cache is clear.</p>
               </div>
             ) : (
                <div className="space-y-4">
                   {posts.filter(p => savedPosts.includes(p.id)).map(post => (
                     <article 
                       key={post.id}
                       className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2 cursor-pointer"
                       onClick={() => setSelectedPost(post)}
                     >
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider bg-indigo-50 px-2 py-0.5 rounded-lg">n/{post.circleName.toLowerCase()}</span>
                           <button 
                             onClick={(e) => { e.stopPropagation(); toggleSaveGeneralPost(post.id); }}
                             className="text-red-500 hover:underline text-[10px] font-bold"
                           >
                              Remove
                           </button>
                        </div>
                        <h4 className="font-black text-sm text-slate-950">{post.title}</h4>
                        <p className="text-xs text-slate-500 truncate">{post.content}</p>
                     </article>
                   ))}
                </div>
             )}
          </div>
        )}

      </main>

      {/* COMPLETED: Redesigned BLUE "+" FAB with cool expansion and visual upload trigger options! */}
      {activeTab === 'home' && (
        <div className="fixed bottom-6 right-6 z-[400] flex flex-col items-end gap-3">
           <AnimatePresence>
             {isFabExpanded && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 15 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 15 }}
                 className="flex flex-col gap-2 items-end mb-1"
               >
                  {/* Create text post */}
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900/80 px-2.5 py-1 rounded-lg">Text Dispatch</span>
                     <button 
                       onClick={() => {
                          setPostUploadType('text');
                          setStagedMediaUrl('');
                          setIsCreatingPost(true);
                          setIsFabExpanded(false);
                          vibrate(VIBRATION_PATTERNS.CLICK);
                       }}
                       className="w-11 h-11 rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                     >
                        <MessageSquare size={16} />
                     </button>
                  </div>

                  {/* Create Image post */}
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900/80 px-2.5 py-1 rounded-lg">Upload Photo</span>
                     <button 
                       onClick={() => {
                          setPostUploadType('image');
                          setStagedMediaUrl('');
                          setIsCreatingPost(true);
                          setIsFabExpanded(false);
                          vibrate(VIBRATION_PATTERNS.CLICK);
                       }}
                       className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                     >
                        <ImageIcon size={16} />
                     </button>
                  </div>

                  {/* Create Video post */}
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900/80 px-2.5 py-1 rounded-lg">Upload Video Clip</span>
                     <button 
                       onClick={() => {
                          setPostUploadType('video');
                          setStagedMediaUrl('');
                          setIsCreatingPost(true);
                          setIsFabExpanded(false);
                          vibrate(VIBRATION_PATTERNS.CLICK);
                       }}
                       className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                     >
                        <Video size={16} />
                     </button>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           <button 
             onClick={() => {
                vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                setIsFabExpanded(!isFabExpanded);
             }}
             className={`w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all transform ${isFabExpanded ? 'rotate-45 bg-slate-950' : ''}`}
           >
              <Plus size={24} strokeWidth={3} />
           </button>
        </div>
      )}

      {/* OVERLAY 1: Create Reddit Style headline post modal */}
      <AnimatePresence>
        {isCreatingPost && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4" onClick={() => setIsCreatingPost(false)}>
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 15 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 15 }}
               onClick={e => e.stopPropagation()}
               className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative flex flex-col border border-slate-100 max-h-[90vh]"
             >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                   <div className="flex items-center gap-2">
                      <Sparkles className="text-amber-500 w-4 h-4" />
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                         New {postUploadType.toUpperCase()} Dispatch Protocol
                      </h3>
                   </div>
                   <button onClick={() => setIsCreatingPost(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                      <X size={18} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                   {/* Target Subreddit Circle picker */}
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Target n/ Subreddit</label>
                      <select 
                        value={selectedCircleId}
                        onChange={e => setSelectedCircleId(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                      >
                         {circles.map(c => (
                           <option key={c.id} value={c.id}>n/{c.name.replace(/\s+/g, '').toLowerCase()}</option>
                         ))}
                      </select>
                   </div>

                   {/* MANDATORY REDDIT HEADLINE RULE */}
                   <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headline Title (Reddit Mandated)</label>
                         <span className="text-[9px] text-red-500 font-bold">Required</span>
                      </div>
                      <input 
                        type="text"
                        placeholder="Interesting, catchy headline describing topic..."
                        value={newPostHeadline}
                        onChange={e => setNewPostHeadline(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-300 outline-none focus:border-indigo-500"
                        maxLength={60}
                      />
                   </div>

                   {/* Description Body */}
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Body context</label>
                      <textarea 
                        placeholder="Write descriptions, milestones accomplishment tags..."
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-300 outline-none h-28 resize-none focus:border-indigo-500"
                      />
                   </div>

                   {/* Media stage trigger */}
                   {postUploadType !== 'text' && (
                     <div className="pt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Attachment Loader</p>
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-3">
                           {stagedMediaProgress !== null ? (
                             <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black text-indigo-500 uppercase">
                                   <span>COMPRESSING MEDIA QUALITY</span>
                                   <span>{stagedMediaProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                   <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${stagedMediaProgress}%` }} />
                                </div>
                             </div>
                           ) : stagedMediaUrl ? (
                             <div className="flex items-center gap-3 justify-center text-emerald-500 text-xs font-bold">
                                <div className="space-y-2 w-full p-1">
                                   <div className="flex items-center gap-1.5 justify-center text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                      <Check size={14} strokeWidth={3} /> Media Staged 100%
                                   </div>
                                   <div className="relative max-h-40 rounded-xl overflow-hidden border border-slate-200 flex justify-center bg-zinc-950 p-1">
                                      {postUploadType === 'image' ? (
                                        <img src={stagedMediaUrl} className="max-h-36 object-contain rounded-lg" />
                                      ) : (
                                        <video src={stagedMediaUrl} className="max-h-36 object-contain rounded-lg shadow-inner" autoPlay loop muted playsInline />
                                      )}
                                      <button 
                                        type="button"
                                        onClick={(ev) => {
                                           ev.stopPropagation();
                                           setStagedMediaUrl('');
                                        }}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center rounded-full text-xs font-bold shadow shadow-black/30 hover:scale-105 active:scale-95 transition-all"
                                      >
                                         ✕
                                      </button>
                                   </div>
                                </div>
                             </div>
                           ) : (
                             <button
                               onClick={() => fileInputRef.current?.click()}
                               className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-wider"
                             >
                                Browse Photos / files
                             </button>
                           )}
                           <input 
                             type="file"
                             ref={fileInputRef}
                             onChange={handleStagedMediaChange}
                             accept={postUploadType === 'image' ? 'image/*' : 'video/*'}
                             className="hidden"
                           />
                        </div>
                     </div>
                   )}
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4">
                   <button 
                     type="button"
                     disabled={isPostingComment || !newPostHeadline.trim() || !newPostContent.trim()}
                     onClick={handleCreateBroadcastingPost}
                     className="w-full py-3.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-black uppercase text-xs tracking-widest rounded-xl shadow-lg active:scale-95 transition-all text-center"
                   >
                      {isPostingComment ? 'Broadcasting...' : 'Broadcast Signal Live'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY 2: X-style Post comments full detail container overlay */}
      <AnimatePresence>
        {(selectedPost || selectedNotificationPost) && (
          (() => {
            const currentObj = (selectedPost || selectedNotificationPost)!;
            const isSaved = savedPosts.includes(currentObj.id);
            const parentGroup = circles.find(c => c.id === currentObj.circleId);

            return (
              <div 
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6" 
                onClick={() => { setSelectedPost(null); setSelectedNotificationPost(null); }}
              >
                 <motion.div 
                   initial={{ scale: 0.95, opacity: 0, y: 15 }}
                   animate={{ scale: 1, opacity: 1, y: 0 }}
                   exit={{ scale: 0.95, opacity: 0, y: 15 }}
                   onClick={e => e.stopPropagation()}
                   className="bg-white w-full max-w-2xl h-full max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative border border-slate-100"
                 >
                    {/* Header bar inside details */}
                    <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setSelectedPost(null); setSelectedNotificationPost(null); }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                          >
                             <ArrowLeft size={18} />
                          </button>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Signal detail spectrum</span>
                       </div>
                       <button 
                         onClick={() => { setSelectedPost(null); setSelectedNotificationPost(null); }}
                         className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl"
                       >
                          <X size={18} />
                       </button>
                    </header>

                    {/* Scrolling contents with comment index */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                       
                       {/* Actual Main Post card content details */}
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border bg-slate-100 flex items-center justify-center">
                               {currentObj.userPhoto ? (
                                 <img src={currentObj.userPhoto} className="w-full h-full object-cover" />
                               ) : (
                                  <User className="w-full h-full p-2.5 text-slate-400" />
                               )}
                             </div>
                             <div>
                                <h3 className="text-sm font-black text-slate-900">u/{currentObj.userName}</h3>
                                <p className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wide mt-0.5">n/{currentObj.circleName.toLowerCase()}</p>
                             </div>
                          </div>

                          <div className="space-y-1.5">
                             <h4 className="font-extrabold text-base text-slate-950">{currentObj.title}</h4>
                             <p className="text-xs text-slate-700 leading-relaxed break-words font-medium">
                                {renderParsedText(currentObj.content, circles, (c) => {
                                  setSelectedPost(null);
                                  setSelectedNotificationPost(null);
                                  setViewingCircle(c);
                                })}
                             </p>
                          </div>

                          {currentObj.imageUrl && (
                            <div className="rounded-xl overflow-hidden max-h-64 border bg-slate-100">
                               <img src={currentObj.imageUrl} className="w-full h-full object-cover" />
                            </div>
                          )}

                          {currentObj.videoUrl && (
                            <div className="rounded-xl overflow-hidden max-h-64 border bg-black flex items-center justify-center">
                               <video src={currentObj.videoUrl} className="w-full max-h-full" controls />
                            </div>
                          )}

                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                             Dispatched: {format(parseISO(currentObj.createdAt), 'MMMM do, yyyy h:mm a')}
                          </div>
                       </div>

                       {/* X Style Connecting Comments container */}
                       <div className="space-y-4 pt-6 border-t border-slate-100">
                          <div className="flex justify-between items-center">
                             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Responses ({comments.length})</h4>
                          </div>

                          {comments.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400 leading-normal font-semibold">
                               Awaiting first response telemetry. Participate below!
                            </div>
                          ) : (
                            <div className="space-y-4 relative pl-3 border-l border-slate-100">
                               {comments.map((comment, index) => (
                                 <div key={comment.id} className="relative flex gap-3 text-slate-800">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border overflow-hidden flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase shrink-0">
                                       {comment.userName.substring(0,2)}
                                    </div>
                                    <div className="flex-1">
                                       <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-200/50">
                                          <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1 col-span-2">
                                             <span>@{comment.userName}</span>
                                             <span>{format(parseISO(comment.createdAt), 'h:mm a')}</span>
                                          </div>
                                          <p className="text-xs font-semibold text-slate-700 leading-snug">
                                             {renderParsedText(comment.content, circles, (c) => {
                                                setSelectedPost(null);
                                                setSelectedNotificationPost(null);
                                                setViewingCircle(c);
                                             })}
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Replies sending bar bottom */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 block shrink-0">
                       <div className="flex items-center gap-3">
                          <input 
                            type="text"
                            placeholder="Connect and post response to timeline..."
                            value={newCommentInput}
                            onChange={e => setNewCommentInput(e.target.value)}
                            onKeyDown={e => {
                               if (e.key === 'Enter' && !isPostingComment && newCommentInput.trim()) {
                                  handleAddComment();
                               }
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                          />
                          <button 
                            onClick={handleAddComment}
                            disabled={isPostingComment || !newCommentInput.trim()}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold text-xs shrink-0"
                          >
                             Reply
                          </button>
                       </div>
                    </div>

                 </motion.div>
              </div>
            );
          })()
        )}
      </AnimatePresence>

      {/* OVERLAY 2.5: Clean, distraction-free Notification detail viewport page */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[2000] bg-zinc-950 flex flex-col p-6 items-center justify-center">
             <motion.div
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl space-y-6 text-center text-white"
             >
                <div className="w-16 h-16 rounded-3xl bg-zinc-800 text-amber-400 flex items-center justify-center text-2xl mx-auto border border-zinc-700 shadow-inner">
                   🔔
                </div>

                <div className="space-y-1">
                   <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Signal Transmission Received</h3>
                   <p className="text-xl font-bold tracking-tight text-zinc-100">@{selectedNotification.senderName}</p>
                   <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                     {selectedNotification.createdAt ? format(parseISO(selectedNotification.createdAt), 'MMMM d, yyyy · h:mm a') : 'Recent'}
                   </p>
                </div>

                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-left">
                   <p className="text-sm font-semibold text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap break-words">{selectedNotification.message}</p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                   {posts.find(p => p.id === selectedNotification.targetId) && (
                     <button
                       onClick={() => {
                          const assoc = posts.find(p => p.id === selectedNotification.targetId);
                          if (assoc) {
                             setSelectedPost(assoc);
                          }
                          setSelectedNotification(null);
                          vibrate(VIBRATION_PATTERNS.CLICK);
                       }}
                       className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                     >
                        View Associated Post
                     </button>
                   )}
                   <button
                     onClick={() => {
                        setSelectedNotification(null);
                        vibrate(VIBRATION_PATTERNS.CLICK);
                     }}
                     className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-transform active:scale-95 cursor-pointer"
                   >
                      Back to Inbox
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY 3: Specific n/ Subreddit page view with membership rules and post limits */}
      <AnimatePresence>
        {viewingCircle && (
          <div className="fixed inset-0 z-[1000] flex flex-col bg-slate-50/95 backdrop-blur-md overflow-y-auto" onClick={() => setViewingCircle(null)}>
             <div className="w-full max-w-3xl mx-auto min-h-screen bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Banner branding */}
                <div className={`h-40 relative bg-gradient-to-r ${viewingCircle.color || 'from-indigo-400 to-indigo-600'} flex items-end px-8 pb-4 shrink-0`}>
                   
                   {/* Left Back button */}
                   <button 
                     onClick={() => setViewingCircle(null)} 
                     className="absolute top-6 left-6 p-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200/50 rounded-xl shadow-md z-10 transition-all cursor-pointer"
                     title="Close specific group view"
                   >
                      <ArrowLeft size={18} className="text-black font-black" />
                   </button>

                   {/* Right actions */}
                   <div className="absolute top-6 right-6 flex items-center gap-2">
                      <button 
                        onClick={() => { setExpandedRules(true); vibrate(VIBRATION_PATTERNS.CLICK); }}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm"
                        title="About Rules"
                      >
                         <Info size={18} className="text-black font-black" />
                      </button>
                      <button 
                        onClick={() => handleToggleNotifyCircle(viewingCircle.id)} 
                        className={`p-2 rounded-xl backdrop-blur-sm transition-colors ${settings.notifEnabledCircleIds?.includes(viewingCircle.id) ? 'bg-orange-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                        title="Toggle Notification Bell"
                      >
                         <Bell size={18} className="text-black font-black" />
                      </button>
                   </div>

                   <div className="flex items-end gap-4 translate-y-12">
                      <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl ring-4 ring-white ${viewingCircle.color || 'bg-amber-100'}`}>
                         {viewingCircle.icon || '🏮'}
                      </div>
                      <div className="pb-2">
                         <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            n/{viewingCircle.name.replace(/\s+/g, '').toLowerCase()}
                         </h2>
                         <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mt-2">
                            {viewingCircle.memberCount || 1} Registered members · {viewingCircle.category} Spectrum
                         </p>
                      </div>
                   </div>
                </div>

                {/* Main panel */}
                <div className="flex-1 p-6 pt-16 space-y-6">
                   
                   {/* Subreddit controls inside */}
                   <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => handleToggleJoinCircle(viewingCircle)}
                           className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow transition-all active:scale-95 ${joinedCircleIds.includes(viewingCircle.id) ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-indigo-100'}`}
                         >
                            {joinedCircleIds.includes(viewingCircle.id) ? 'Joined membership' : 'Join group'}
                         </button>
                         
                         {/* Create post button inside group: locked unless joined! */}
                         <button 
                           onClick={() => {
                              if (!joinedCircleIds.includes(viewingCircle.id)) {
                                 showToast('Please join the membership to unlock broadcasting post rights.', 'info');
                                 return;
                              }
                              setSelectedCircleId(viewingCircle.id);
                              setIsCreatingPost(true);
                           }}
                           className={`ml-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${joinedCircleIds.includes(viewingCircle.id) ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                         >
                            Add Post
                         </button>
                      </div>

                      {/* Info triggers */}
                      <button 
                        onClick={() => setExpandedRules(true)} 
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 flex items-center gap-1"
                      >
                         <Info size={14} /> Read Rules Charter
                      </button>
                   </div>

                   {/* Filter feed unique */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Timeline Broadcaster</span>
                         
                         <div className="flex gap-1.5">
                            {['new', 'hot', 'top'].map(s => (
                              <button 
                                key={s} 
                                onClick={() => setSortOrder(s as any)}
                                className={`text-[10px] px-2.5 py-1.5 rounded-lg uppercase tracking-wider font-extrabold transition-all ${sortOrder === s ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}
                              >
                                 {s}
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* Listing group posts */}
                      <div className="space-y-4 max-w-xl mx-auto">
                         {getSortedPosts(posts.filter(p => p.circleId === viewingCircle.id)).length === 0 ? (
                           <div className="py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                              <AlertCircle size={32} className="text-slate-300 mx-auto mb-2 animate-bounce" />
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Awaiting first group pulse...</p>
                           </div>
                         ) : (
                            getSortedPosts(posts.filter(p => p.circleId === viewingCircle.id)).map(p => (
                              <article 
                                key={p.id}
                                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-200 transition-all cursor-pointer space-y-2"
                                onClick={() => setSelectedPost(p)}
                              >
                                 <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                                    <span>Posted by u/{p.userName}</span>
                                    <span>{format(parseISO(p.createdAt), 'MMM d, h:mm a')}</span>
                                 </div>
                                 <h4 className="font-extrabold text-sm text-slate-950 leading-snug">{p.title}</h4>
                                 <p className="text-xs text-slate-600 leading-normal">{p.content}</p>
                              </article>
                            ))
                         )}
                      </div>

                   </div>

                </div>

             </div>

             {/* About group rules inner popover */}
             <AnimatePresence>
                {expandedRules && (
                  <div className="fixed inset-0 z-[1150] flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4" onClick={() => setExpandedRules(false)}>
                     <motion.div 
                       initial={{ scale: 0.9, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ scale: 0.9, opacity: 0 }}
                       onClick={e => e.stopPropagation()}
                       className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border"
                     >
                       <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                          <h3 className="font-black text-lg uppercase tracking-tight">n/{viewingCircle.name} Charter</h3>
                          <button onClick={() => setExpandedRules(false)} className="p-1 hover:bg-white/20 text-white rounded-lg">
                             <X size={18} />
                          </button>
                       </div>
                       
                       <div className="p-6 space-y-4">
                          <div>
                             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vision mandate</h4>
                             <p className="text-xs text-slate-600 font-medium leading-relaxed italic mt-1 font-sans">"{viewingCircle.description}"</p>
                          </div>

                          <div className="pt-2 border-t font-sans">
                             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Behavioral Guidelines (Rules)</h4>
                             <div className="space-y-2">
                                {(viewingCircle.rules || ['Be respectful', 'Stay on topic']).map((rule, index) => (
                                   <div key={index} className="p-3 bg-slate-50 border rounded-xl text-xs font-bold text-slate-600 leading-snug flex gap-2.5 items-start">
                                      <span className="text-indigo-600 font-extrabold">{index + 1}</span>
                                      <span>{rule}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                     </motion.div>
                  </div>
                )}
             </AnimatePresence>

          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY 4: REDDIT PROTOCOL GROUP CREATOR WIZARD */}
      <AnimatePresence>
         {isCreatingCircle && (
           <CreateGroupWizard 
             onClose={() => { setIsCreatingCircle(false); setCircleToEdit(null); }}
             onComplete={handleDeployNewCircle}
             isSubmitting={isPostingComment}
             initialData={circleToEdit}
           />
         )}
      </AnimatePresence>

      {/* REDESIGNED BOTTOM TAB SECTIONS BAR TO MATCH MAIN NAV BAR STYLE */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-5 flex justify-center pointer-events-none z-[450] bg-gradient-to-t from-slate-50/90 via-slate-50/40 to-transparent">
         <nav className="bg-white/95 backdrop-blur-lg border border-slate-200/80 shadow-2xl px-2.5 py-1.5 rounded-3xl flex items-center justify-around gap-1 pointer-events-auto w-[92%] max-w-[395px] sm:max-w-[480px] h-[64px] overflow-hidden select-none">
            {/* Home */}
            <button className="flex flex-col items-center gap-1">
                <Compass size={24} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400">Home</span>
            </button>
            {/* Challenges */}
            <button className="flex flex-col items-center gap-1">
                <Target size={24} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400">Challenges</span>
            </button>
            {/* FAB (+) */}
            <button className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Plus size={32} />
            </button>
            {/* Community */}
            <button className="flex flex-col items-center gap-1">
                <Users size={24} className="text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-600">Community</span>
            </button>
            {/* Profile */}
            <button className="flex flex-col items-center gap-1">
                <User size={24} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400">Profile</span>
            </button>
         </nav>
      </div>

    </div>
  );
});
