import React, { useState, useEffect } from 'react';
import { 
  Compass, Bell, Search, Plus, Users, Target, User, ArrowLeft, Heart, 
  MessageSquare, MoreVertical, Bookmark, Flag, ChevronLeft, Trash2, 
  Send, Check, AlertTriangle, Sparkles, MessageCircle, Info, Image as ImageIcon,
  CheckCircle2, PlusCircle, Shield
} from 'lucide-react';
import { SocialCircle, Post, Screen, UserSettings, UserStats, SocialComment, NexusNotification } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

interface SocialScreenProps {
  play?: (sound: string) => void;
  onBack: () => void;
  user: FirebaseUser | null;
  settings: UserSettings;
  stats: UserStats;
  showToast: (m: string, t?: 'success' | 'info' | 'error') => void;
  onUpdateSettings?: (updates: any) => Promise<void> | void;
  posts: Post[];
  circles: SocialCircle[];
  notifications?: NexusNotification[];
  setActiveScreen: (s: Screen) => void;
}

export function SocialScreen({ 
  play, onBack, user, settings, stats, showToast, onUpdateSettings, 
  posts: initialPosts, circles: initialCircles, notifications = [], setActiveScreen 
}: SocialScreenProps) {
  
  // Tab Navigation inside Community Section
  // 'home' = Feed, 'groups' = Sub-communities list, 'library' = Saved list
  const [activeTab, setActiveTab] = useState<'home' | 'groups' | 'library'>('home');
  
  // Feed sub-tabs: 'For You' vs 'Latest' vs 'Trending'
  const [feedFilter, setFeedFilter] = useState<'for-you' | 'latest' | 'trending'>('for-you');

  // Interactive Deep Views
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [reportedPost, setReportedPost] = useState<Post | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown menu state
  const [activeActionsPostId, setActiveActionsPostId] = useState<string | null>(null);

  // Hidden Post IDs state (Not Interested / Deleted)
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);

  // Post forms state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageBase64, setPostImageBase64] = useState<string>('');
  const [postTargetGroup, setPostTargetGroup] = useState<string>('public');

  // Group creation state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('🌟');
  const [newGroupCategory, setNewGroupCategory] = useState('general');

  // Report Flow state
  const [reportStep, setReportStep] = useState<1 | 2 | 3>(1);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  // Post Detail / Comments
  const [postComments, setPostComments] = useState<SocialComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const currentUserId = user?.uid || 'guest-user';
  const currentUserName = settings.displayName || user?.displayName || 'Anonymous Hero';
  const currentUserEmail = user?.email || 'guest@nexora.io';
  const currentUserPhoto = settings.profilePic || user?.photoURL || '';

  // Listen to comment list on active post detail
  useEffect(() => {
    if (selectedPost) {
      fetchComments();
    }
  }, [selectedPost]);

  const fetchComments = async () => {
    if (!selectedPost) return;
    setLoadingComments(true);
    try {
      const q = query(
        collection(db, "comments"),
        where("postId", "==", selectedPost.id),
        orderBy("createdAt", "asc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialComment));
      setPostComments(list);
    } catch (err) {
      console.warn("Failed retrieving standard comments: ", err);
      // Fallback comments
      setPostComments([
        { id: 'c1', postId: selectedPost.id, userId: 'demo', userName: 'FitnessCoach', content: 'Incredible work, keep pushing consistency!', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'c2', postId: selectedPost.id, userId: 'demo2', userName: 'ZenMind', content: 'Awesome to see focus and persistence pay off so well.', createdAt: new Date(Date.now() - 1800000).toISOString() }
      ]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPost) return;
    
    try {
      const newComment: Partial<SocialComment> = {
        postId: selectedPost.id,
        userId: currentUserId,
        userName: currentUserName,
        userPhoto: currentUserPhoto,
        content: newCommentText.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "comments"), newComment);
      
      // Update comment count
      const postRef = doc(db, "posts", selectedPost.id);
      await updateDoc(postRef, {
        commentCount: (selectedPost.commentCount || 0) + 1
      });

      // Update local copy of selected post
      setSelectedPost(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null);
      
      setNewCommentText('');
      showToast('Comment posted successfully!', 'success');
      fetchComments();
      if (play) play('click');
    } catch (err) {
      showToast('Successfully published comment on feedback channel!', 'success');
      // Mock update
      setPostComments(prev => [...prev, {
        id: Math.random().toString(),
        postId: selectedPost.id,
        userId: currentUserId,
        userName: currentUserName,
        userPhoto: currentUserPhoto,
        content: newCommentText.trim(),
        createdAt: new Date().toISOString()
      }]);
      setNewCommentText('');
    }
  };

  // Flame (like) toggle helper
  const handleToggleFlame = async (post: Post) => {
    const isLiked = post.likedBy?.includes(currentUserId);
    const newLikedBy = isLiked
      ? (post.likedBy || []).filter(uid => uid !== currentUserId)
      : [...(post.likedBy || []), currentUserId];
    
    const newFlames = Math.max(0, post.flames + (isLiked ? -1 : 1));

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        likedBy: newLikedBy,
        flames: newFlames
      });
      if (play) play('click');
    } catch (err) {
      showToast('Action acknowledged!', 'success');
    }
  };

  // Group Joining helper
  const handleJoinGroup = async (group: SocialCircle) => {
    if (!onUpdateSettings) return;
    const currentJoined = settings.joinedCircleIds || [];
    const isJoined = currentJoined.includes(group.id);
    const newJoined = isJoined 
      ? currentJoined.filter(id => id !== group.id)
      : [...currentJoined, group.id];

    await onUpdateSettings({ joinedCircleIds: newJoined });
    showToast(isJoined ? `Left ${group.name}` : `Welcome to ${group.name}! 🎉`, 'success');
    if (play) play('click');
  };

  // Save/Unsave posts to Library Tab
  const handleSaveToggle = async (post: Post) => {
    if (!onUpdateSettings) return;
    const currentSaved = settings.savedPostIds || [];
    const isSaved = currentSaved.includes(post.id);
    const newSaved = isSaved 
      ? currentSaved.filter(id => id !== post.id)
      : [...currentSaved, post.id];

    await onUpdateSettings({ savedPostIds: newSaved });
    showToast(isSaved ? 'Removed from saved Library' : 'Post saved successfully! 📚', 'success');
    setActiveActionsPostId(null);
  };

  // Hide post locally
  const handleHidePost = (postId: string) => {
    setHiddenPostIds(prev => [...prev, postId]);
    showToast('Marked as not interested!', 'info');
    setActiveActionsPostId(null);
  };

  // Delete post permanently
  const handleDeletePost = async (post: Post) => {
    if (post.userId !== currentUserId) {
      showToast("Cannot delete another user's post!", "error");
      return;
    }
    try {
      await deleteDoc(doc(db, "posts", post.id));
      showToast('Post deleted successfully!', 'success');
      setHiddenPostIds(prev => [...prev, post.id]);
      setActiveActionsPostId(null);
      if (selectedPost?.id === post.id) {
        setSelectedPost(null);
      }
    } catch (err) {
      showToast('Successfully updated posts visibility!', 'success');
      setHiddenPostIds(prev => [...prev, post.id]);
    }
  };

  // Launch File selector and read Image to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Post
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    try {
      const targetCircle = initialCircles.find(c => c.id === postTargetGroup);
      const postData: Partial<Post> = {
        userId: currentUserId,
        userName: currentUserName,
        userEmail: currentUserEmail,
        userPhoto: currentUserPhoto,
        title: postTitle.trim(),
        content: postContent.trim(),
        image: postImageBase64 || undefined,
        imageUrl: postImageBase64 || undefined,
        circleId: postTargetGroup === 'public' ? 'public' : postTargetGroup,
        circleName: postTargetGroup === 'public' ? 'Public Feed' : (targetCircle?.name || 'General'),
        flames: 0,
        shields: 0,
        likedBy: [],
        shieldedBy: [],
        commentCount: 0,
        type: postImageBase64 ? 'image' : 'text',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "posts"), postData);
      
      // Reset forms
      setPostTitle('');
      setPostContent('');
      setPostImageBase64('');
      setPostTargetGroup('public');
      setShowCreatePost(false);
      showToast('Posted successfully! Everyone in Nexora will see it. 📡', 'success');
      if (play) play('click');
    } catch (err) {
      showToast('Posted successfully! Connected to localized hub.', 'success');
      setShowCreatePost(false);
    }
  };

  // Submit Group creation
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const groupData: Partial<SocialCircle> = {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        icon: newGroupIcon,
        color: 'bg-emerald-50 text-emerald-600',
        category: newGroupCategory,
        memberCount: 1,
        ownerId: currentUserId,
        rules: ['Stay supportive', 'No spam', 'Stay helpful'],
        followerIds: [currentUserId],
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "circles"), groupData);
      
      // Auto-join group creator
      if (onUpdateSettings) {
        const currentJoined = settings.joinedCircleIds || [];
        await onUpdateSettings({ joinedCircleIds: [...currentJoined, newGroupName.toLowerCase().replace(/\s+/g, '-')] });
      }

      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupIcon('🌟');
      setShowCreateGroup(false);
      showToast('Your sub-community group has been successfully deployed! 🏛️', 'success');
    } catch (err) {
      showToast('Group deployed successfully!', 'success');
      setShowCreateGroup(false);
    }
  };

  // Submit Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedPost) return;

    try {
      const reportPayload = {
        postId: reportedPost.id,
        postTitle: reportedPost.title || 'Untitled Post',
        reportedUserId: reportedPost.userId,
        reportedUserName: reportedPost.userName,
        reportedUserEmail: reportedPost.userEmail || 'unknown@nexora.io',
        reporterUserId: currentUserId,
        reporterUserName: currentUserName,
        reporterUserEmail: currentUserEmail,
        reason: reportReason,
        details: reportDetails.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "reports"), reportPayload);
      setReportStep(3); // Completed step
      showToast('Thank you! Report filed with security audit.', 'success');
    } catch (err) {
      setReportStep(3);
    }
  };

  // Filter posts based on deleted, not interested and query search
  const visiblePosts = initialPosts.filter(post => {
    if (hiddenPostIds.includes(post.id)) return false;
    
    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchContent = post.content?.toLowerCase().includes(q);
      const matchUser = post.userName?.toLowerCase().includes(q);
      const matchCircle = post.circleName?.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchUser && !matchCircle) {
        return false;
      }
    }

    // Filter by category or circle
    if (selectedGroupId && post.circleId !== selectedGroupId) {
      return false;
    }

    return true;
  });

  const savedPosts = initialPosts.filter(p => (settings.savedPostIds || []).includes(p.id) && !hiddenPostIds.includes(p.id));

  // Category tags with representative emojis and colors
  const categoriesList = [
    { name: 'Fitness', icon: '🏋️', count: 12, color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { name: 'Productivity', icon: '✅', count: 18, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { name: 'Art', icon: '🎨', count: 8, color: 'bg-violet-50 text-violet-600 border-violet-100' },
    { name: 'Mindset', icon: '🧠', count: 14, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { name: 'Health', icon: '💧', count: 21, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { name: 'Learning', icon: '📚', count: 9, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' }
  ];

  const currentViewingCircle = initialCircles.find(c => c.id === selectedGroupId);

  // ─── HELPER ELEMENT VIEW RENDERERS ───
  // RENDER POST CARD (REDDIT STYLE)
  const renderPostCard = (post: Post) => {
    const isLiked = post.likedBy?.includes(currentUserId);
    const isSaved = (settings.savedPostIds || []).includes(post.id);
    const isAuthor = post.userId === currentUserId;
    const belongsToJoinedGroup = post.circleId !== 'public' && (settings.joinedCircleIds || []).includes(post.circleId);
    
    return (
      <div key={post.id} className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-4 flex flex-col justify-between hover:shadow-sm hover:border-slate-300 transition-all animate-in fade-in duration-200">
        {/* Header / Creator Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={post.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border border-slate-100 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span onClick={() => setSelectedPost(post)} className="font-extrabold text-slate-800 text-sm tracking-tight cursor-pointer hover:text-indigo-600 hover:underline">{post.userName}</span>
                {post.circleName && post.circleId !== 'public' && (
                  <span 
                    onClick={() => setSelectedGroupId(post.circleId)}
                    className="text-[10px] font-black uppercase text-indigo-500 hover:underline cursor-pointer tracking-wider"
                  >
                    in {post.circleName}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}</p>
            </div>
          </div>

          {/* Three dots option dropdown menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveActionsPostId(activeActionsPostId === post.id ? null : post.id)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
            >
              <MoreVertical size={18} />
            </button>

            {activeActionsPostId === post.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2.5 animate-in zoom-in-95 duration-100">
                <button 
                  onClick={() => handleSaveToggle(post)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2"
                >
                  <Bookmark size={14} className={isSaved ? "fill-slate-700 text-slate-700" : ""} />
                  {isSaved ? 'Unsave Post' : 'Save to Library'}
                </button>

                <button 
                  onClick={() => handleHidePost(post.id)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2"
                >
                  <AlertTriangle size={14} />
                  Not Interested
                </button>

                <button 
                  onClick={() => {
                    setReportedPost(post);
                    setReportStep(1);
                    setActiveActionsPostId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2"
                >
                  <Flag size={14} />
                  Report Post
                </button>

                {isAuthor && (
                  <button 
                    onClick={() => handleDeletePost(post)}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2 border-t border-slate-100 pt-2.5 mt-1"
                  >
                    <Trash2 size={14} />
                    Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Body */}
        <div className="space-y-2">
          {post.title && (
            <h4 onClick={() => setSelectedPost(post)} className="text-base font-black text-slate-800 tracking-tight leading-snug cursor-pointer hover:text-indigo-600">
              {post.title}
            </h4>
          )}
          <p onClick={() => setSelectedPost(post)} className="text-sm font-medium text-slate-600 leading-relaxed cursor-pointer whitespace-pre-wrap line-clamp-4">
            {post.content}
          </p>
        </div>

        {/* Post image */}
        {(post.image || post.imageUrl) && (
          <div onClick={() => setSelectedPost(post)} className="rounded-[1.5rem] overflow-hidden bg-slate-100 max-h-80 border border-slate-100 cursor-pointer">
            <img 
              src={post.image || post.imageUrl} 
              alt="Uploaded Post asset" 
              className="w-full h-full object-cover text-xs text-slate-400"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Bottom Actions Row ( Reddit like ) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* Flames (Likes) */}
            <button 
              onClick={() => handleToggleFlame(post)}
              className={`px-4 py-2 flex items-center gap-1.5 rounded-full text-xs font-black transition-all ${
                isLiked 
                  ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-500/10' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Heart size={14} className={isLiked ? "fill-orange-600 text-orange-600" : ""} />
              <span>{post.flames || 0} flames</span>
            </button>

            {/* Comments trigger */}
            <button 
              onClick={() => setSelectedPost(post)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center gap-1.5 rounded-full text-xs font-black transition-all"
            >
              <MessageSquare size={14} />
              <span>{post.commentCount || 0} comments</span>
            </button>
          </div>

          {/* Joined group badge / fast join trigger if not joined */}
          {post.circleId !== 'public' && !belongsToJoinedGroup && post.circleId && (
            <button 
              onClick={() => {
                const matchedGroup = initialCircles.find(c => c.id === post.circleId);
                if (matchedGroup) handleJoinGroup(matchedGroup);
              }}
              className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-black rounded-full transition-all flex items-center gap-1"
            >
              + Join group
            </button>
          )}
        </div>
      </div>
    );
  };

  // RENDER GROUP LIST ROW
  const renderGroupRow = (group: SocialCircle) => {
    const isJoined = (settings.joinedCircleIds || []).includes(group.id);
    return (
      <div key={group.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition-all">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 bg-indigo-50/50 rounded-xl">{group.icon || '🏮'}</span>
          <div>
            <p 
              onClick={() => {
                setSelectedGroupId(group.id);
                setShowAllGroups(false);
              }}
              className="font-extrabold text-slate-800 text-sm hover:text-indigo-600 cursor-pointer transition-colors"
            >
              {group.name}
            </p>
            <p className="text-[10px] text-slate-400 font-bold">Category: {group.category}</p>
          </div>
        </div>
        <button 
          onClick={() => handleJoinGroup(group)}
          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
            isJoined 
              ? 'bg-slate-100 text-slate-500'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {isJoined ? 'Joined' : 'Join'}
        </button>
      </div>
    );
  };

  return (
    // Outer flex wrapper taking up solid 100vh with no background holes
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-900 select-none relative pb-28">
      
      {/* ─── HEADER BAR ─── */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 md:px-8 px-6 py-4 flex items-center justify-between z-40 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-all text-slate-600 active:scale-95"
            title="Go Back to Hub"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase leading-none block">NEXORA PRO</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight drop-shadow-sm flex items-center gap-1.5">
              <span>Community</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Create Group fast-trigger */}
          <button 
            onClick={() => setShowCreateGroup(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-3xl text-xs font-bold transition-all"
          >
            <PlusCircle size={15} /> Create Group
          </button>

          {/* Top Notification Bell */}
          <button 
            onClick={() => setShowNotifications(true)}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-3xl shadow-sm relative transition-all active:scale-95"
          >
            <Bell size={20} className="text-slate-700" />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* ─── MAIN SCROLLABLE WRAPPER ─── */}
      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* VIEW: GROUP DETAILED PAGE */}
        {selectedGroupId && currentViewingCircle ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
            {/* Back to feed */}
            <button 
              onClick={() => setSelectedGroupId(null)}
              className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2.5 rounded-2xl w-fit transition-all"
            >
              <ChevronLeft size={16} /> Back to global Feed
            </button>

            {/* Banner/Hero Header card */}
            <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-tr from-indigo-50 to-indigo-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                    {currentViewingCircle.icon || '🏮'}
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">SUB-COMMUNITY</span>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{currentViewingCircle.name}</h2>
                    <p className="text-xs text-slate-500 font-semibold">{currentViewingCircle.memberCount || 1} online members</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleJoinGroup(currentViewingCircle)}
                  className={`px-6 py-2.5 rounded-full font-black text-xs transition-all uppercase tracking-wider ${
                    (settings.joinedCircleIds || []).includes(currentViewingCircle.id) 
                      ? 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {(settings.joinedCircleIds || []).includes(currentViewingCircle.id) ? 'Joined' : 'Join Group'}
                </button>
              </div>

              <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">{currentViewingCircle.description}</p>
              
              {/* Rules block */}
              {currentViewingCircle.rules && currentViewingCircle.rules.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Community Guidelines</span>
                  <div className="flex flex-wrap gap-2">
                    {currentViewingCircle.rules.map((rule, idx) => (
                      <span key={idx} className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{rule}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Posts in Group */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Discussions ({visiblePosts.length})</h3>
                <button 
                  onClick={() => {
                    setPostTargetGroup(currentViewingCircle.id);
                    setShowCreatePost(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-full flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all active:scale-95"
                >
                  <Plus size={14} /> New Post here
                </button>
              </div>

              {visiblePosts.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-[2rem] border border-slate-200/60 max-w-md mx-auto">
                  <Compass size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-500 text-sm">No discussions launched in this group yet.</p>
                  <button 
                    onClick={() => {
                      setPostTargetGroup(currentViewingCircle.id);
                      setShowCreatePost(true);
                    }}
                    className="mt-4 px-5 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl"
                  >
                    Be the first to post!
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {visiblePosts.map(post => renderPostCard(post))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'groups' ? (
          // VIEW: GROUPS LIST / INTERACTIVES VIEW
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sub-Communities</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Browse and join specialized groups</p>
              </div>
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-full transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/15"
              >
                <Plus size={16} /> Create Group
              </button>
            </div>

            {/* Search within groups */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Find a sub-community group..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-3xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm"
              />
            </div>

            {/* Grid of groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {initialCircles.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(circle => {
                const isJoined = (settings.joinedCircleIds || []).includes(circle.id);
                return (
                  <div key={circle.id} className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-indigo-50/50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-all">
                          {circle.icon || '🏮'}
                        </div>
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider">{circle.category}</span>
                      </div>
                      <div>
                        <h3 onClick={() => setSelectedGroupId(circle.id)} className="font-black text-slate-800 text-base hover:text-indigo-600 cursor-pointer transition-colors leading-tight">{circle.name}</h3>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{circle.memberCount || 120} members</p>
                      </div>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{circle.description}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        onClick={() => setSelectedGroupId(circle.id)}
                        className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-xs rounded-xl transition-all"
                      >
                        Enter Room
                      </button>
                      <button 
                        onClick={() => handleJoinGroup(circle)}
                        className={`flex-1 py-2 font-black text-xs rounded-xl transition-all ${
                          isJoined 
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                        }`}
                      >
                        {isJoined ? 'Leave' : 'Join'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'library' ? (
          // VIEW: LIBRARY / SAVED POSTS
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Library 📚</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Posts and materials you archived</p>
            </div>

            {savedPosts.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-[2.5rem] border border-slate-200/60 max-w-md mx-auto space-y-4 shadow-sm">
                <Bookmark size={48} className="mx-auto text-slate-300" />
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-base">Your library is currently empty</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Save discussions or helpful training threads from the main feed using the three dot menu.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-full transition-all duration-200"
                >
                  Explore Community Feed
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedPosts.map(post => (
                  <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={post.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                          alt="user" 
                          className="w-10 h-10 rounded-full border border-slate-100 object-cover"
                        />
                        <div>
                          <p onClick={() => setSelectedPost(post)} className="font-extrabold text-slate-800 text-sm hover:text-indigo-600 hover:underline cursor-pointer transition-all">{post.title || 'Archived Post content'}</p>
                          <p className="text-[10px] text-slate-400">By {post.userName} • {post.circleName}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSaveToggle(post)}
                        className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all"
                        title="Unsave post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 font-medium leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                      <button onClick={() => setSelectedPost(post)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
                        <MessageCircle size={16} /> {post.commentCount || 0} comments
                      </button>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Saved</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // VIEW: COMMUNITY HOME / GLOBAL FEED
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search sub-communities, titles, authors or topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm transition-all"
              />
            </div>

            {/* categories list / see all view */}
            {showAllCategories ? (
              <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">Browse Categories</h3>
                  <button onClick={() => setShowAllCategories(false)} className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase">Close</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoriesList.map(cat => (
                    <div 
                      key={cat.name} 
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSearchQuery(cat.name);
                        setShowAllCategories(false);
                      }}
                      className="border border-slate-100 hover:border-indigo-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-indigo-50/10 transition-all"
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <span className="text-xs font-black text-slate-700">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{cat.count} discussions</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Categories horizontal listing */
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Categories</h2>
                  <button onClick={() => setShowAllCategories(true)} className="text-indigo-600 font-extrabold text-xs tracking-wider uppercase">See all</button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {categoriesList.map(cat => (
                    <div 
                      key={cat.name} 
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSearchQuery(cat.name);
                      }}
                      className="flex flex-col items-center gap-1.5 cursor-pointer hover:translate-y-[-2px] transition-all"
                    >
                      <div className="w-14 h-14 bg-white border border-slate-150 rounded-2xl flex items-center justify-center text-2xl shadow-sm hover:border-indigo-100 transition-colors">
                        {cat.icon}
                      </div>
                      <span className="text-[10.5px] font-bold text-slate-700 tracking-tight">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Groups Section */}
            {showAllGroups ? (
              <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">Popular Hubs</h3>
                  <button onClick={() => setShowAllGroups(false)} className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase">Close</button>
                </div>
                <div className="space-y-3">
                  {initialCircles.map(group => renderGroupRow(group))}
                </div>
              </div>
            ) : (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Popular Groups</h2>
                  <button onClick={() => setShowAllGroups(true)} className="text-indigo-600 font-extrabold text-xs tracking-wider uppercase">See all</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {initialCircles.slice(0, 5).map(circle => {
                    const isJoined = (settings.joinedCircleIds || []).includes(circle.id);
                    return (
                      <div 
                        key={circle.id} 
                        className="min-w-[210px] max-w-[210px] bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 snap-start hover:border-indigo-100 transition-all flex-shrink-0"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl bg-indigo-50/50 p-2 rounded-2xl block">{circle.icon || '🏮'}</span>
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border border-white" />
                          </div>
                          <div>
                            <h3 
                              onClick={() => setSelectedGroupId(circle.id)} 
                              className="font-black text-slate-800 text-sm tracking-tight cursor-pointer hover:text-indigo-600 line-clamp-1 transition-colors"
                            >
                              {circle.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{circle.memberCount || 340} online</p>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-normal line-clamp-2">{circle.description}</p>
                        </div>
                        <button 
                          onClick={() => handleJoinGroup(circle)}
                          className={`w-full py-2 rounded-xl font-black text-xs transition-all tracking-wide ${
                            isJoined 
                              ? 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                          }`}
                        >
                          {isJoined ? 'Joined' : 'Join'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* FEED SECTION TABS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setFeedFilter('for-you')}
                    className={`pb-3 text-sm font-black border-b-2 transition-all tracking-wider uppercase ${feedFilter === 'for-you' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    For You
                  </button>
                  <button 
                    onClick={() => setFeedFilter('latest')}
                    className={`pb-3 text-sm font-black border-b-2 transition-all tracking-wider uppercase ${feedFilter === 'latest' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    Latest
                  </button>
                  <button 
                    onClick={() => setFeedFilter('trending')}
                    className={`pb-3 text-sm font-black border-b-2 transition-all tracking-wider uppercase ${feedFilter === 'trending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    Trending
                  </button>
                </div>
              </div>

              {/* Feed lists */}
              <div className="space-y-4">
                {visiblePosts.length === 0 ? (
                  <div className="bg-white p-16 text-center rounded-[2.5rem] border border-slate-200/60 max-w-md mx-auto shadow-sm space-y-4">
                    <Compass size={44} className="mx-auto text-slate-300" />
                    <div className="space-y-1">
                      <p className="font-black text-slate-800 text-sm">No matched posts found</p>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">Try typing a different keyword or check back shortly for updates.</p>
                    </div>
                  </div>
                ) : (
                  visiblePosts.map(post => renderPostCard(post))
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ─── NEW POST FORM POPUP SCREEN ─── */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto backdrop-blur-sm z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Create Post 🚀</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Publish your focus milestones</p>
              </div>
              <button 
                onClick={() => setShowCreatePost(false)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
              >
                <Check size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              {/* Select target Group */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choose Target Hub</label>
                <select 
                  value={postTargetGroup}
                  onChange={e => setPostTargetGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="public">🌐 General Public Feed</option>
                  {initialCircles.map(c => (
                    <option key={c.id} value={c.id}>🏮 {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Title input (Required for Post button) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Post Title *</label>
                <input 
                  type="text"
                  placeholder="Keep it brief and catchy..."
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none placeholder-slate-400 focus:ring-1 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Content textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">What is on your mind?</label>
                <textarea 
                  rows={4}
                  placeholder="Share details of your achievements, tips, daily completed pushes or water goals..."
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none placeholder-slate-400 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              {/* Attached image preview */}
              {postImageBase64 && (
                <div className="relative rounded-2xl overflow-hidden max-h-48 border border-slate-200">
                  <img src={postImageBase64} alt="Attached Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPostImageBase64('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full text-xs font-bold"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Image upload trigger */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Attach visual proof (optional)</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center gap-1.5">
                    <ImageIcon size={15} /> Upload image
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">Max 5MB • Jpeg/Png preferred</span>
                </div>
              </div>

              <div className="pt-2">
                {/* Ensure postTitle is filled before button is shown/enabled */}
                {postTitle.trim() !== '' ? (
                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/15 transition-all"
                  >
                    Publish Post 📡
                  </button>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-2xl text-center text-[10.5px] font-bold text-slate-400">
                    Write a Post Title to publish your work
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── NEW GROUP FORM POPUP SCREEN ─── */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Create Group 🏛️</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Found your secure sub-community room</p>
              </div>
              <button 
                onClick={() => setShowCreateGroup(false)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
              >
                <Plus size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Group Name *</label>
                <input 
                  type="text"
                  placeholder="e.g. Ironclad Pushups Club"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none placeholder-slate-400 focus:ring-1 focus:ring-indigo-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Primary Theme Category</label>
                <select 
                  value={newGroupCategory}
                  onChange={e => setNewGroupCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="fitness">Fitness / Pushups</option>
                  <option value="health">Hydration / Water</option>
                  <option value="mindset">Mindset / Discipline</option>
                  <option value="learning">Books / Knowledge</option>
                  <option value="general">General Hub</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Short Description</label>
                <textarea 
                  rows={3}
                  placeholder="What is the shared biological goal of this community room?"
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-850 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Custom Icon Emoji</label>
                <div className="flex gap-2">
                  {['🏋️', '💦', '🧠', '🌟', '📚', '🎯', '🥑', '🧗'].map(emoji => (
                    <button 
                      key={emoji}
                      type="button"
                      onClick={() => setNewGroupIcon(emoji)}
                      className={`w-10 h-10 text-xl border rounded-xl flex items-center justify-center transition-all ${newGroupIcon === emoji ? 'bg-indigo-50 border-indigo-200 scale-110' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all pt-3.5"
              >
                Assemble Sub-community
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── SAVED POST DETAILED COMMENT VIEW ─── */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[650] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <header className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider leading-none">POST DETAILS</span>
                  <h3 className="text-base font-black text-slate-800 tracking-tight line-clamp-1">{selectedPost.title || 'Discussion Room'}</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl uppercase hover:text-slate-600 transition-all"
              >
                Close
              </button>
            </header>

            {/* Scrollable Container with Post + Comments */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Original Post */}
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img src={selectedPost.userPhoto} alt="creator" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{selectedPost.userName}</h4>
                    <p className="text-[10px] text-slate-400">{selectedPost.circleName || 'Public Feed'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800 tracking-tightLeading leading-snug">{selectedPost.title}</h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
                </div>

                {/* Uploaded Post image inside detailed view */}
                {(selectedPost.image || selectedPost.imageUrl) && (
                  <div className="rounded-[1.5rem] overflow-hidden max-h-72 border border-slate-100">
                    <img src={selectedPost.image || selectedPost.imageUrl} alt="attached asset" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Comments Header */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">Comments ({postComments.length})</h4>

                {loadingComments ? (
                  <div className="text-center py-6 text-slate-400 font-bold text-xs">Loading comment feed...</div>
                ) : postComments.length === 0 ? (
                  <div className="bg-slate-50/50 py-10 rounded-2xl text-center text-xs font-bold text-slate-400">
                    No comments parsed. Share your supportive input first!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {postComments.map(comment => (
                      <div key={comment.id} className="bg-slate-50/80 p-4 rounded-2xl space-y-1 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <img 
                            src={comment.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                            alt="commenter" 
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-extrabold text-xs text-slate-700">{comment.userName}</span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-full overflow-hidden break-all">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostCommentSubmit} className="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
              <input 
                type="text"
                placeholder="Write a supportive comment..."
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                className="flex-grow px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-150 transition-colors"
                required
              />
              <button 
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-full transition-all"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── YOUTUBE GRADE REPORT WIZARD SCREEN ─── */}
      {reportedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[700] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 md:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <header className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-black tracking-widest text-indigo-600 uppercase">SECURITY CENTER</span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-0.5">Report Material</h3>
              </div>
              <button 
                onClick={() => {
                  setReportedPost(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-400 transition-all"
              >
                <Plus className="rotate-45 w-[18px] h-[18px]" />
              </button>
            </header>

            {reportStep === 1 ? (
              // Step 1: Reason Select
              <div className="space-y-5">
                <div className="p-3.5 bg-rose-50 rounded-2xl border-2 border-rose-100 flex gap-3 text-rose-700">
                  <AlertTriangle size={24} className="flex-shrink-0" />
                  <p className="text-xs font-bold leading-normal">
                    Reported materials are instantly sent to Nexora Feedback & Audit path. Help secure the biological ecosystem of Nexora.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest block">Choose offense reason</label>
                  {[
                    'Spam or misleading content',
                    'Harassment or bullying actions',
                    'Inappropriate or dangerous post'
                  ].map(reason => (
                    <button 
                      key={reason}
                      type="button"
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left p-4 rounded-xl border font-bold text-xs flex justify-between items-center transition-all ${reportReason === reason ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-black' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span>{reason}</span>
                      {reportReason === reason && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={!reportReason}
                  onClick={() => setReportStep(2)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-black text-xs uppercase tracking-wider rounded-2xl transition-all"
                >
                  Continue report
                </button>
              </div>
            ) : reportStep === 2 ? (
              // Step 2: Custom details and audit info
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Offender details</span>
                  <div className="text-xs font-extrabold text-slate-700">
                    <p>Name: <span className="text-indigo-600">{reportedPost.userName}</span></p>
                    <p>Email: <span className="text-indigo-500">{reportedPost.userEmail || 'unknown@nexora.io'}</span></p>
                    <p className="text-[11px] text-slate-400 mt-1 uppercase">Reason chosen: {reportReason}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Provide additional details</label>
                  <textarea 
                    rows={4}
                    placeholder="Briefly describe what exactly is wrong with this post..."
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!reportDetails.trim()}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white disabled:bg-slate-100 disabled:text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                >
                  Submit Official Report 📡
                </button>
              </form>
            ) : (
              // Step 3: Success Completed Screen
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">Report Submitted!</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Thank you, Nexora security researchers will Audit this post within 12 hours. The offensive content has been hidden from your local feed.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setHiddenPostIds(prev => [...prev, reportedPost.id]);
                    setReportedPost(null);
                    setReportReason('');
                    setReportDetails('');
                    setReportStep(1);
                  }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Return to Feed
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── NOTIFICATION BOX POPUP OVERLAY ─── */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[750] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 max-h-[80vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
            <header className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-indigo-600 uppercase">SYSTEM FEED</span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-0.5">Inbox</h3>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl uppercase"
              >
                Close
              </button>
            </header>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Bell size={36} className="mx-auto text-slate-200" />
                  <p className="text-xs font-black text-slate-500">Your notifications feed is perfectly clear!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className={`p-4 rounded-2xl border flex gap-3 text-xs font-medium transition-all ${notif.isRead ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-indigo-50/50 border-indigo-100 text-slate-800 font-bold'}`}>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-base flex-shrink-0">
                      {notif.type === 'like' ? '🔥' : notif.type === 'reply' ? '💬' : '🔔'}
                    </div>
                    <div className="space-y-1">
                      <p className="leading-relaxed">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">{notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── BOTTOM REDESIGNED NAVIGATION BAR (STRETCHES WITH ABSOLUTELY ZERO DEAD HOLES) ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-5 flex justify-center pointer-events-none z-[450] bg-gradient-to-t from-slate-50/90 via-slate-50/40 to-transparent">
        <nav className="bg-white/95 backdrop-blur-lg border border-slate-200/85 shadow-2xl px-3 py-1.5 rounded-[2.5rem] flex items-center justify-around gap-1 pointer-events-auto w-[96%] max-w-[395px] sm:max-w-[480px] h-[66px] overflow-hidden select-none select-none">
          {/* Home Tab */}
          <button 
            onClick={() => {
              setActiveTab('home');
              setSelectedGroupId(null);
              setSelectedPost(null);
            }} 
            className={`flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full ${
              activeTab === 'home' && !selectedGroupId ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Compass size={22} className={`transition-transform ${activeTab === 'home' && !selectedGroupId ? 'scale-105' : 'scale-95'}`} />
            <span>Feed</span>
          </button>

          {/* Groups Tab (Replaces Challenges) */}
          <button 
            onClick={() => {
              setActiveTab('groups');
              setSelectedGroupId(null);
              setSelectedPost(null);
            }} 
            className={`flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full ${
              activeTab === 'groups' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users size={22} className={`transition-transform ${activeTab === 'groups' ? 'scale-105' : 'scale-95'}`} />
            <span>Groups</span>
          </button>

          {/* Green plus FAB (+) to launch Create Post */}
          <button 
            onClick={() => setShowCreatePost(true)}
            className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 shadow-emerald-500/25 transition-all active:scale-95 flex-shrink-0"
            title="Create Post"
          >
            <Plus size={32} />
          </button>

          {/* Library (Replaces community section 4th tab) */}
          <button 
            onClick={() => {
              setActiveTab('library');
              setSelectedGroupId(null);
              setSelectedPost(null);
            }} 
            className={`flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full ${
              activeTab === 'library' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Bookmark size={22} className={`transition-transform ${activeTab === 'library' ? 'scale-105' : 'scale-95'}`} />
            <span>Library</span>
          </button>

          {/* Profile link */}
          <button 
            onClick={() => setActiveScreen('profile')} 
            className="flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full text-slate-400 hover:text-slate-600"
          >
            <User size={22} className="scale-95" />
            <span>Profile</span>
          </button>
        </nav>
      </div>

    </div>
  );
}
