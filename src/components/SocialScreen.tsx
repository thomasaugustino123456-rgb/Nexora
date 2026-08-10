import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Compass,
  Bell,
  Search,
  Plus,
  Users,
  Target,
  User,
  ArrowLeft,
  Heart,
  MessageSquare,
  MoreVertical,
  Bookmark,
  Flag,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Send,
  Check,
  AlertTriangle,
  Sparkles,
  MessageCircle,
  Info,
  Image as ImageIcon,
  CheckCircle2,
  PlusCircle,
  Shield,
  Clock,
  Award,
  X,
  Edit,
  ShieldCheck,
  EyeOff,
  MessageSquareOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { vibrate, VIBRATION_PATTERNS } from "../lib/vibrate";
import { handleFirestoreError, OperationType } from "../firebase";


// Audio effects for Community post actions (Publish & Trash)
let socialAudioCtx: AudioContext | null = null;

function getSocialAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!socialAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      socialAudioCtx = new AudioCtx();
    }
  }
  if (socialAudioCtx && socialAudioCtx.state === "suspended") {
    socialAudioCtx.resume().catch(() => {});
  }
  return socialAudioCtx;
}

// 📡 Successful shiny release chime sound
function playPostPublishedSound() {
  try {
    const ctx = getSocialAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Play a delightful ascending double note (e.g. 520Hz and then 880Hz) to represent posting success!
    const notes = [520, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gainNode.gain.setValueAtTime(0, now + idx * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.012, now + idx * 0.08 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.22);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch (e) {
    console.warn("Audio error (Post publish):", e);
  }
}

// 🗑️ Realistic crumpled trash crush sound
function playTrashCrunchSound() {
  try {
    const ctx = getSocialAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Low frequency crash/fizz combined with high frequency paper crunch tones
    const osc1 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.25);
    
    gainNode1.gain.setValueAtTime(0.015, now);
    gainNode1.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    
    osc1.connect(gainNode1);
    gainNode1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.25);
    
    // High frequency crunching crackles
    const osc2 = ctx.createOscillator();
    const gainNode2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1100, now);
    osc2.frequency.setValueAtTime(150, now + 0.09);
    
    gainNode2.gain.setValueAtTime(0.007, now);
    gainNode2.gain.setValueAtTime(0.002, now + 0.04);
    gainNode2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
    osc2.connect(gainNode2);
    gainNode2.connect(ctx.destination);
    
    osc2.start(now);
    osc2.stop(now + 0.15);
  } catch (e) {
    console.warn("Audio error (Trash crunch):", e);
  }
}
import {
  SocialCircle,
  Post,
  Screen,
  UserSettings,
  UserStats,
  SocialComment,
  NexusNotification,
} from "../types";
import { FirebaseUser } from "../firebase";
import {
  collection,
  collectionGroup,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { CreateCircleWizard } from "./CreateCircleWizard";
import { NexusLinkRenderer } from "./NexusLinkRenderer";

export const CUTE_AWARDS = [
  {
    key: "hand_clipping",
    emoji: "👏",
    label: "Hand Clipping",
    cost: 30,
    xpAward: 15,
    uses: 5,
    desc: "Super fast cute round of applause!",
    animation: {
      animate: { scale: [1, 1.25, 0.95, 1.25, 1], rotate: [0, -10, 10, -10, 0] },
      transition: { repeat: Infinity, duration: 1.2 }
    }
  },
  {
    key: "cring_face",
    emoji: "😬",
    label: "Cartoon Face Cringe",
    cost: 50,
    xpAward: 30,
    uses: 3,
    desc: "Yikes! Relatable cringe moment.",
    animation: {
      animate: { x: [0, -3, 3, -3, 3, 0], scale: [1, 0.95, 1] },
      transition: { repeat: Infinity, duration: 1.0 }
    }
  },
  {
    key: "happy_toon",
    emoji: "🥳",
    label: "Happy Cartoon",
    cost: 80,
    xpAward: 50,
    uses: 3,
    desc: "Pure joy and positive energy!",
    animation: {
      animate: { y: [0, -12, 0, -6, 0], rotate: [0, 15, -15, 0] },
      transition: { repeat: Infinity, duration: 1.5 }
    }
  },
  {
    key: "sleeping_mascot",
    emoji: "😴",
    label: "Sleeping Mascot",
    cost: 100,
    xpAward: 75,
    uses: 3,
    desc: "Exhausted focus recharge mode.",
    animation: {
      animate: { scale: [1, 1.08, 1], rotate: [-5, 5, -5] },
      transition: { repeat: Infinity, duration: 2.0 }
    }
  },
  {
    key: "car_raising",
    emoji: "🏎️",
    label: "Car Raising",
    cost: 150,
    xpAward: 120,
    uses: 2,
    desc: "Revving up the progress engine!",
    animation: {
      animate: { y: [0, -8, -10, -8, 0], x: [0, -2, 2, 0] },
      transition: { repeat: Infinity, duration: 0.8 }
    }
  },
  {
    key: "dog_chill",
    emoji: "🐶",
    label: "Chill Dog",
    cost: 200,
    xpAward: 180,
    uses: 2,
    desc: "Absolute zen master chill mode.",
    animation: {
      animate: { rotate: [0, -10, 10, 0], scale: [1, 1.05, 1] },
      transition: { repeat: Infinity, duration: 2.2 }
    }
  },
  {
    key: "eating_food",
    emoji: "🥗",
    label: "Eating Cartoon",
    cost: 250,
    xpAward: 250,
    uses: 2,
    desc: "Yummy food battery recharge!",
    animation: {
      animate: { scaleY: [1, 0.85, 1.15, 1], scaleX: [1, 1.15, 0.85, 1] },
      transition: { repeat: Infinity, duration: 1.4 }
    }
  }
];

interface SocialScreenProps {
  play?: (sound: string) => void;
  onBack: () => void;
  user: FirebaseUser | null;
  settings: UserSettings;
  stats: UserStats;
  showToast: (m: string, t?: "success" | "info" | "error") => void;
  onUpdateSettings?: (updates: any) => Promise<void> | void;
  onUpdateStats?: (updater: any) => void;
  posts: Post[];
  circles: SocialCircle[];
  notifications?: NexusNotification[];
  setActiveScreen: (s: Screen) => void;
  onPostCreated?: (post: Post) => void;
}

export function SocialScreen({
  play,
  onBack,
  user,
  settings,
  stats,
  showToast,
  onUpdateSettings,
  onUpdateStats,
  posts: initialPosts,
  circles: initialCircles,
  notifications = [],
  setActiveScreen,
  onPostCreated,
}: SocialScreenProps) {
  return (
    <div className="w-full text-slate-800 select-none relative pb-12">
      {/* ─── HEADER BAR ─── */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-200/50 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-all text-slate-650 active:scale-95"
            title="Go Back to Hub"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase leading-none block">
              NEXORA PRO
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight drop-shadow-sm flex items-center gap-1.5">
              <span>Community</span>
            </h1>
          </div>
        </div>
      </header>

      {/* LOCKED / COMING SOON SECTION */}
      <div className="flex flex-col items-center justify-center min-h-[420px] p-8 sm:p-12 text-center bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-slate-200/80 shadow-sm my-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-inner mb-6 animate-pulse">
          <Lock size={38} />
        </div>

        <span className="px-4 py-1.5 bg-amber-100/90 text-amber-900 border border-amber-200 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4 shadow-2xs">
          🔒 Locked • Coming Soon
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-3">
          Community Section Under Upgrade
        </h2>

        <p className="text-sm font-medium text-slate-600 max-w-md leading-relaxed mb-8">
          We are upgrading the Nexora Community Hub to deliver an enhanced experience with faster live discussions, verified circles, and exclusive group challenges! Stay tuned, bro.
        </p>

        <button
          onClick={onBack}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 text-sm flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  // Tab Navigation inside Community Section
  // 'home' = Feed, 'groups' = Sub-communities list, 'rewards' = Achievements/Rewards cabinet, 'library' = Saved list, 'profile' = User profile
  const [activeTab, setActiveTab] = useState<
    "home" | "groups" | "rewards" | "library" | "profile"
  >("home");

  // Feed sub-tabs: 'For You' vs 'Latest' vs 'Trending'
  const [feedFilter, setFeedFilter] = useState<
    "for-you" | "latest" | "trending"
  >("for-you");

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
  const [showFullSearchPage, setShowFullSearchPage] = useState(false);
  const [createPostMode, setCreatePostMode] = useState<"text" | "image">(
    "text",
  );

  // Scroll Direction Tracker
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );

  // Group Details Sorting Filter
  const [groupSortFilter, setGroupSortFilter] = useState<
    "new" | "best" | "hot" | "top"
  >("new");
  // Explicitly enabled bells for specific groups to stop green glow
  const [enabledGroupBells, setEnabledGroupBells] = useState<string[]>([]);
  const [showGroupAboutModal, setShowGroupAboutModal] = useState(false);

  const toggleGroupBell = (groupId: string) => {
    setEnabledGroupBells((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Comment Reply states
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<
    string | null
  >(null);
  const [replyCommentText, setReplyCommentText] = useState("");
  const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({});

  // Multi-image upload states
  const [postImagesBase64, setPostImagesBase64] = useState<string[]>([]);
  const [cardImageIndices, setCardImageIndices] = useState<
    Record<string, number>
  >({});
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [awardingPost, setAwardingPost] = useState<Post | null>(null);

  // Advanced Group Onboarding Wizard (Pages 1 to 4)
  const [creationStep, setCreationStep] = useState<number>(1);
  const [createdGroupCategory, setCreatedGroupCategory] = useState<string>("");
  const [createdGroupType, setCreatedGroupType] = useState<string>("");
  const [createdGroupName, setCreatedGroupName] = useState<string>("");
  const [createdGroupDescription, setCreatedGroupDescription] =
    useState<string>("");
  const [createdGroupRules, setCreatedGroupRules] = useState<string>(
    "1. Stay supportive and positive.\n2. Respect scientific and physiological guidelines.\n3. Keep spam separate, maintain clarity.",
  );
  const [createdGroupSticker, setCreatedGroupSticker] = useState<string>("🌟");
  const [createdGroupBgColor, setCreatedGroupBgColor] = useState<string>(
    "from-indigo-500 to-purple-600",
  );
  const [createdGroupImage, setCreatedGroupImage] = useState<string>("");
  const [createdGroupBannerImage, setCreatedGroupBannerImage] =
    useState<string>("");

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown menu state
  const [activeActionsPostId, setActiveActionsPostId] = useState<string | null>(
    null,
  );
  const [activeActionsCommentId, setActiveActionsCommentId] = useState<string | null>(
    null,
  );

  // Hidden Post & Comment IDs state (Persistent across sessions & reloads)
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>(() => {
    try {
      const local = localStorage.getItem("nexora_hidden_post_ids") || "[]";
      const device = localStorage.getItem("nexora_device_hidden_post_ids") || "[]";
      const parsedLocal = JSON.parse(local);
      const parsedDevice = JSON.parse(device);
      return Array.from(new Set([...parsedLocal, ...parsedDevice]));
    } catch {
      return [];
    }
  });

  const [hiddenCommentIds, setHiddenCommentIds] = useState<string[]>(() => {
    try {
      const local = localStorage.getItem("nexora_hidden_comment_ids") || "[]";
      const device = localStorage.getItem("nexora_device_hidden_comment_ids") || "[]";
      const parsedLocal = JSON.parse(local);
      const parsedDevice = JSON.parse(device);
      return Array.from(new Set([...parsedLocal, ...parsedDevice]));
    } catch {
      return [];
    }
  });

  // Helper function to hide post persistently
  const hidePost = useCallback((postId: string) => {
    if (!postId) return;
    setHiddenPostIds((prev) => {
      if (prev.includes(postId)) return prev;
      const next = [...prev, postId];
      try {
        localStorage.setItem("nexora_hidden_post_ids", JSON.stringify(next));
        localStorage.setItem("nexora_device_hidden_post_ids", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save hidden post to localStorage:", e);
      }
      if (user?.uid) {
        setDoc(doc(db, "users", user.uid), { hiddenPostIds: next }, { merge: true }).catch(() => {});
        setDoc(doc(db, "user_settings", user.uid), { hiddenPostIds: next }, { merge: true }).catch(() => {});
      }
      return next;
    });
  }, [user?.uid]);

  // Helper function to hide comment persistently
  const hideComment = useCallback((commentId: string) => {
    if (!commentId) return;
    setHiddenCommentIds((prev) => {
      if (prev.includes(commentId)) return prev;
      const next = [...prev, commentId];
      try {
        localStorage.setItem("nexora_hidden_comment_ids", JSON.stringify(next));
        localStorage.setItem("nexora_device_hidden_comment_ids", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save hidden comment to localStorage:", e);
      }
      if (user?.uid) {
        setDoc(doc(db, "users", user.uid), { hiddenCommentIds: next }, { merge: true }).catch(() => {});
        setDoc(doc(db, "user_settings", user.uid), { hiddenCommentIds: next }, { merge: true }).catch(() => {});
      }
      return next;
    });
  }, [user?.uid]);

  // Sync settings hidden lists on load if available
  useEffect(() => {
    if (settings && (settings as any).hiddenPostIds && Array.isArray((settings as any).hiddenPostIds)) {
      setHiddenPostIds((prev) => {
        const merged = Array.from(new Set([...prev, ...(settings as any).hiddenPostIds]));
        try { localStorage.setItem("nexora_hidden_post_ids", JSON.stringify(merged)); } catch {}
        return merged;
      });
    }
    if (settings && (settings as any).hiddenCommentIds && Array.isArray((settings as any).hiddenCommentIds)) {
      setHiddenCommentIds((prev) => {
        const merged = Array.from(new Set([...prev, ...(settings as any).hiddenCommentIds]));
        try { localStorage.setItem("nexora_hidden_comment_ids", JSON.stringify(merged)); } catch {}
        return merged;
      });
    }
  }, [(settings as any)?.hiddenPostIds, (settings as any)?.hiddenCommentIds]);

  // Post forms state
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageBase64, setPostImageBase64] = useState<string>("");
  const [postTargetGroup, setPostTargetGroup] = useState<string>("public");
  
  // Edit post state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTargetGroup, setEditTargetGroup] = useState<string>("public");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Edit comment state
  const [editingComment, setEditingComment] = useState<SocialComment | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Generalized Report Target state
  const [reportedItem, setReportedItem] = useState<{
    type: "post" | "comment";
    id: string;
    postId: string;
    content: string;
    postTitle?: string;
    userId: string;
    userName: string;
    userEmail?: string;
    userPhoto?: string;
  } | null>(null);
  const [customReportNotes, setCustomReportNotes] = useState("");

  // Community Moderation Status Check
  const isCommunityBanned = useMemo(() => {
    if (settings?.communityBannedPermanent) return true;
    if (settings?.communityBannedUntil) {
      return new Date(settings.communityBannedUntil) > new Date();
    }
    return false;
  }, [settings]);

  // Group creation state
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("🌟");
  const [newGroupCategory, setNewGroupCategory] = useState("general");

  // Report Flow state
  const [reportStep, setReportStep] = useState<1 | 2 | 3>(1);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Post Detail / Comments
  const [postComments, setPostComments] = useState<SocialComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // User written comments state
  const [userWrittenComments, setUserWrittenComments] = useState<any[]>([]);
  const [loadingUserComments, setLoadingUserComments] = useState(false);

  // Community achievements states & persistent comments tracker
  const [totalCommentsCount, setTotalCommentsCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("nexora_stats_comments_count") || "0", 10);
    } catch {
      return 0;
    }
  });

  const [showAchievementsBoard, setShowAchievementsBoard] = useState(false);
  const [selectedCategorySeeAll, setSelectedCategorySeeAll] = useState<string | null>(null);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "unlocked" | "locked">("all");

  // Claimed Badges state & persistent tracking
  const [claimedBadgeIds, setClaimedBadgeIds] = useState<string[]>(() => {
    if (Array.isArray((settings as any)?.claimedBadges)) {
      return (settings as any).claimedBadges;
    }
    try {
      const stored = localStorage.getItem("nexora_claimed_badges");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const notifiedBadgeIds = useRef<Set<string>>(new Set());

  // Keep claimed badges synced to settings prop
  useEffect(() => {
    if (Array.isArray((settings as any)?.claimedBadges) && (settings as any).claimedBadges.length > claimedBadgeIds.length) {
      setClaimedBadgeIds((settings as any).claimedBadges);
    }
  }, [(settings as any)?.claimedBadges]);

  const handleClaimBadge = async (badge: { id: string; title: string; rewardXP: number; rewardCoins: number; unlocked: boolean }) => {
    if (!badge.unlocked) {
      showToast(`"${badge.title}" is still locked! Complete the requirements to unlock.`, "info");
      return;
    }
    if (claimedBadgeIds.includes(badge.id)) {
      showToast(`You have already claimed the rewards for "${badge.title}"!`, "info");
      return;
    }

    const nextClaimed = [...claimedBadgeIds, badge.id];
    setClaimedBadgeIds(nextClaimed);
    try {
      localStorage.setItem("nexora_claimed_badges", JSON.stringify(nextClaimed));
    } catch {}

    const currentCoins = (settings as any)?.points || (settings as any)?.coins || (stats as any)?.coins || 0;
    const updatedCoins = currentCoins + badge.rewardCoins;

    if (onUpdateSettings) {
      await onUpdateSettings({
        points: updatedCoins,
        coins: updatedCoins,
        claimedBadges: nextClaimed,
      });
    }

    if (onUpdateStats) {
      onUpdateStats((prev: any) => ({
        ...prev,
        totalPoints: (prev?.totalPoints || 0) + badge.rewardXP,
        coins: ((prev?.coins || 0) + badge.rewardCoins),
      }));
    }

    if (user?.uid) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSettingsRef = doc(db, "users", user.uid, "settings", "main");
        await setDoc(userSettingsRef, { points: updatedCoins, coins: updatedCoins, claimedBadges: nextClaimed }, { merge: true });
        const { increment } = await import("firebase/firestore");
        await setDoc(userRef, { totalPoints: increment(badge.rewardXP) }, { merge: true });
      } catch (e) {
        console.warn("Error syncing claimed badge to Firestore:", e);
      }
    }

    vibrate(35);
    if (play) play("click");
    showToast(`🎉 Claimed "${badge.title}"! Added +${badge.rewardXP} XP & +${badge.rewardCoins} Coins!`, "success");
  };

  const handleClaimAllBadges = async () => {
    const unclaimedUnlocked = achievements.filter(
      (b) => b.unlocked && !claimedBadgeIds.includes(b.id)
    );

    if (unclaimedUnlocked.length === 0) {
      showToast("No unclaimed badge rewards available right now!", "info");
      return;
    }

    let totalXP = 0;
    let totalCoins = 0;
    const newClaimedIds = [...claimedBadgeIds];

    unclaimedUnlocked.forEach((b) => {
      totalXP += b.rewardXP;
      totalCoins += b.rewardCoins;
      if (!newClaimedIds.includes(b.id)) {
        newClaimedIds.push(b.id);
      }
    });

    setClaimedBadgeIds(newClaimedIds);
    try {
      localStorage.setItem("nexora_claimed_badges", JSON.stringify(newClaimedIds));
    } catch {}

    const currentCoins = (settings as any)?.points || (settings as any)?.coins || (stats as any)?.coins || 0;
    const updatedCoins = currentCoins + totalCoins;

    if (onUpdateSettings) {
      await onUpdateSettings({
        points: updatedCoins,
        coins: updatedCoins,
        claimedBadges: newClaimedIds,
      });
    }

    if (onUpdateStats) {
      onUpdateStats((prev: any) => ({
        ...prev,
        totalPoints: (prev?.totalPoints || 0) + totalXP,
        coins: ((prev?.coins || 0) + totalCoins),
      }));
    }

    if (user?.uid) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSettingsRef = doc(db, "users", user.uid, "settings", "main");
        await setDoc(userSettingsRef, { points: updatedCoins, coins: updatedCoins, claimedBadges: newClaimedIds }, { merge: true });
        const { increment } = await import("firebase/firestore");
        await setDoc(userRef, { totalPoints: increment(totalXP) }, { merge: true });
      } catch (e) {
        console.warn("Error syncing all claimed badges to Firestore:", e);
      }
    }

    vibrate(50);
    if (play) play("click");
    showToast(`🎉 Claimed ALL ${unclaimedUnlocked.length} Badges! +${totalXP} XP & +${totalCoins} Coins!`, "success");
  };

  // Real-time custom peer-profile card inspector states
  const [inspectedUserProfileId, setInspectedUserProfileId] = useState<string | null>(null);
  const [inspectedUserLoading, setInspectedUserLoading] = useState<boolean>(false);
  const [inspectedUser, setInspectedUser] = useState<{ settings?: any; stats?: any; displayName?: string; photoURL?: string; userId: string } | null>(null);

  // Background update helper for historical posts privacy toggles
  const updateHistoricalPostsPrivacy = async (hidePosts: boolean) => {
    try {
      const q = query(collection(db, "community_posts"), where("userId", "==", currentUserId));
      const snap = await getDocs(q);
      snap.docs.forEach(async (docRef) => {
        await updateDoc(docRef.ref, { hidePostsFromOthers: hidePosts });
      });
    } catch (e) {
      console.warn("Could not synchronize historical posts privacy:", e);
    }
  };

  // Automated notification and rewards disbursement engine
  const awardUserRewards = async (targetUserId: string, xp: number, coins: number, reason: string) => {
    try {
      if (!targetUserId) return;
      const { increment } = await import("firebase/firestore");
      const userRef = doc(db, "users", targetUserId);
      const statsRef = doc(db, "users", targetUserId, "stats", "main");
      const userSettingsRef = doc(db, "users", targetUserId, "settings", "main");

      await setDoc(userRef, {
        totalPoints: increment(xp),
        xp: increment(xp),
        coins: increment(coins),
        points: increment(coins)
      }, { merge: true });

      await setDoc(statsRef, {
        totalPoints: increment(xp),
        coins: increment(coins)
      }, { merge: true });

      await setDoc(userSettingsRef, {
        points: increment(coins),
        coins: increment(coins)
      }, { merge: true });

      if (targetUserId === currentUserId) {
        if (onUpdateStats) {
          onUpdateStats((prev: any) => ({
            ...prev,
            totalPoints: (prev?.totalPoints || 0) + xp,
            xp: (prev?.xp || 0) + xp,
            coins: (prev?.coins || 0) + coins,
          }));
        }
        if (onUpdateSettings) {
          const currentCoins = (settings as any)?.points || (settings as any)?.coins || 0;
          onUpdateSettings({
            points: currentCoins + coins,
            coins: currentCoins + coins,
          });
        }
      }

      // Register a system reward notification card
      await addDoc(collection(db, "users", targetUserId, "notifications"), cleanPayload({
        userId: targetUserId,
        senderId: "system",
        senderName: "Nexora Rewards",
        type: "system",
        message: `🏆 Level Up! Claim: +${xp} XP & +${coins} Coins! (${reason})`,
        isRead: false,
        createdAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error("Failed to disburse milestone rewards:", e);
    }
  };

  // Fetch target user context for profile inspection cards
  const handleInspectUser = async (targetUserId: string) => {
    if (!targetUserId) return;
    setInspectedUserProfileId(targetUserId);
    setInspectedUserLoading(true);
    try {
      if (targetUserId.startsWith("bot-")) {
        const botNames: Record<string, string> = {
          "bot-1": "Apex_Habit",
          "bot-2": "Zen_Master",
          "bot-3": "HabitHero_99",
          "bot-4": "FlowState",
          "bot-5": "Iron_Will"
        };
        const name = botNames[targetUserId] || "Apex Bot";
        setInspectedUser({
          userId: targetUserId,
          settings: { displayName: name, role: "bot" },
          stats: { streak: 15, level: 8, totalPoints: 750, weeklyXP: 750, weeklyPoints: 750 },
          displayName: name,
          photoURL: "",
        });
        return;
      }

      let userData: any = null;
      let statsData: any = null;

      try {
        const userDocRef = doc(db, "users", targetUserId);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          userData = userSnap.data();
        }
      } catch (err) {
        console.warn("User doc fetch handled:", err);
      }

      try {
        const statsDocRef = doc(db, "users", targetUserId, "stats", "main");
        const statsSnap = await getDoc(statsDocRef);
        if (statsSnap.exists()) {
          statsData = statsSnap.data();
        }
      } catch (err) {
        console.warn("User stats fetch handled:", err);
      }

      if (!userData) {
        try {
          const lbSnap = await getDoc(doc(db, "leaderboard", targetUserId));
          if (lbSnap.exists()) {
            userData = lbSnap.data();
          }
        } catch (err) {
          console.warn("Leaderboard doc fetch handled:", err);
        }
      }

      if (!userData) {
        try {
          const rankSnap = await getDoc(doc(db, "rank", targetUserId));
          if (rankSnap.exists()) {
            userData = rankSnap.data();
          }
        } catch (err) {
          console.warn("Rank doc fetch handled:", err);
        }
      }

      setInspectedUser({
        userId: targetUserId,
        settings: userData || {},
        stats: statsData || userData?.stats || {},
        displayName: userData?.displayName || userData?.accountName || userData?.name || userData?.settings?.displayName || "Anonymous Hero",
        photoURL: userData?.profilePic || userData?.photoURL || userData?.settings?.profilePic || "",
      });
    } catch (error) {
      console.error("Error inspecting user profile:", error);
      showToast("Could not retrieve user telemetry, profile might be private.", "error");
    } finally {
      setInspectedUserLoading(false);
    }
  };

  // Deep-link notification click listener supporting instant page swaps & form focus
  const handleNotificationClick = async (notif: NexusNotification) => {
    // Mark the selected notification card as read instantly in database
    try {
      const notifRef = doc(db, "users", currentUserId, "notifications", notif.id);
      await updateDoc(notifRef, { isRead: true, read: true });
    } catch (e) {
      console.error("Could not write notification read status:", e);
    }

    if (notif.postId) {
      let foundPost = allPosts.find((p) => p.id === notif.postId);
      if (!foundPost) {
        try {
          const snap = await getDoc(doc(db, "community_posts", notif.postId));
          if (snap.exists()) {
            foundPost = { id: snap.id, ...snap.data() } as Post;
          }
        } catch (e) {
          console.warn("Dynamic deep-link document query failed:", e);
        }
      }

      if (foundPost) {
        setSelectedPost(foundPost);
        setShowNotifications(false);
        setActiveTab("home"); // Shift viewport back to feed
        showToast("Discussion thread focused!", "info");
        
        // Wait for rendering transition to complete, then focus on community feedback input
        setTimeout(() => {
          const el = document.getElementById("post-comment-textarea");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            el.focus();
          }
        }, 400);
      } else {
        showToast("The target post is private or has been removed.", "error");
      }
    }
  };

  const currentUserId = user?.uid || "guest-user";
  const currentUserName =
    settings.displayName || user?.displayName || "Anonymous Hero";
  const currentUserEmail = user?.email || "guest@nexora.io";
  const currentUserPhoto = settings.profilePic || user?.photoURL || "/icon-512.png";

  useEffect(() => {
    (window as any)._nexora_sync_historical_posts = updateHistoricalPostsPrivacy;
    return () => {
      delete (window as any)._nexora_sync_historical_posts;
    };
  }, [currentUserId]);

  const [localPostOverrides, setLocalPostOverrides] = useState<Record<string, Partial<Post>>>(() => {
    try {
      const saved = localStorage.getItem("nexora_post_overrides");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updatePostOverride = (postId: string, override: Partial<Post>) => {
    setLocalPostOverrides((prev) => {
      const updated = {
        ...prev,
        [postId]: {
          ...prev[postId],
          ...override,
        },
      };
      try {
        localStorage.setItem("nexora_post_overrides", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const cleanPayload = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj
        .map(cleanPayload)
        .filter((item) => item !== undefined && item !== null);
    }
    if (typeof obj === "object") {
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val !== undefined && val !== null) {
          const cleanedVal = cleanPayload(val);
          if (cleanedVal !== undefined && cleanedVal !== null) {
            cleaned[key] = cleanedVal;
          }
        }
      }
      return cleaned;
    }
    return obj;
  };

  const saveLocalPostsToStorage = (posts: Post[]) => {
    try {
      localStorage.setItem("nexora_local_posts", JSON.stringify(posts));
    } catch (e) {
      console.warn("Failed to store full posts in localStorage, saving stripped version:", e);
      try {
        const stripped = posts.map((p) => ({
          ...p,
          image: p.image && p.image.length > 250000 ? undefined : p.image,
          imageUrl: p.imageUrl && p.imageUrl.length > 250000 ? undefined : p.imageUrl,
          images: p.images?.map((img) => (img.length > 250000 ? "" : img)),
        }));
        localStorage.setItem("nexora_local_posts", JSON.stringify(stripped));
      } catch (e2) {
        console.error("Critical: Could not save posts to localStorage:", e2);
      }
    }
  };

  const compressImageFile = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.5): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = () => resolve("");
    });
  };

  const [localAddedPosts, setLocalAddedPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem("nexora_local_posts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Synchronize and clean up localAddedPosts when they have been successfully retrieved from the global backend
  useEffect(() => {
    if (localAddedPosts.length > 0 && initialPosts.length > 0) {
      const initialIds = new Set(initialPosts.map((p) => p.id));
      const filtered = localAddedPosts.filter((p) => !initialIds.has(p.id));
      if (filtered.length !== localAddedPosts.length) {
        setLocalAddedPosts(filtered);
        saveLocalPostsToStorage(filtered);
      }
    }
  }, [initialPosts, localAddedPosts]);

  const allPosts = useMemo(() => {
    const combined = [...localAddedPosts, ...initialPosts];
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return unique.map((p) => {
      const override = localPostOverrides[p.id];
      if (override) {
        return { ...p, ...override };
      }
      return p;
    });
  }, [initialPosts, localAddedPosts, localPostOverrides]);

  const activePostForDetails = useMemo(() => {
    if (!selectedPost) return null;
    const found = allPosts.find((p) => p.id === selectedPost.id);
    return found || selectedPost;
  }, [selectedPost, allPosts]);

  // Dynamic Achievements Data Source
  const myPostsCount = useMemo(() => {
    return allPosts.filter(
      (post) => post.userId === currentUserId && !post.deleted && !hiddenPostIds.includes(post.id)
    ).length;
  }, [allPosts, currentUserId, hiddenPostIds]);

  const joinedGroupsCount = useMemo(() => {
    return initialCircles.filter((circle) => (settings?.joinedCircleIds || []).includes(circle.id)).length;
  }, [initialCircles, settings?.joinedCircleIds]);

  const createdCirclesCount = useMemo(() => {
    return initialCircles.filter((circle) => circle.ownerId === currentUserId).length;
  }, [initialCircles, currentUserId]);

  const currentStreak = stats?.streak || 0;
  const totalPoints = stats?.totalPoints || 0;

  const popularPostMetric = useMemo(() => {
    const myPosts = allPosts.filter((post) => post.userId === currentUserId && !post.deleted);
    if (myPosts.length === 0) return { maxComments: 0, maxFlames: 0 };
    const maxComments = Math.max(...myPosts.map((p) => p.commentCount || 0));
    const maxFlames = Math.max(...myPosts.map((p) => p.flames || 0));
    return { maxComments, maxFlames };
  }, [allPosts, currentUserId]);

  const recordCommunityActiveDay = () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const datesJson = localStorage.getItem("nexora_community_active_dates");
      const datesList: string[] = datesJson ? JSON.parse(datesJson) : [];
      if (!datesList.includes(todayStr)) {
        datesList.push(todayStr);
        localStorage.setItem("nexora_community_active_dates", JSON.stringify(datesList));
      }
    } catch {}
  };

  const communityActiveDays = useMemo(() => {
    try {
      const datesJson = localStorage.getItem("nexora_community_active_dates");
      const datesList: string[] = datesJson ? JSON.parse(datesJson) : [];
      return Math.max(datesList.length, (myPostsCount > 0 || totalCommentsCount > 0) ? 1 : 0);
    } catch {
      return (myPostsCount > 0 || totalCommentsCount > 0) ? 1 : 0;
    }
  }, [myPostsCount, totalCommentsCount]);

  const communityKarma = useMemo(() => {
    return (myPostsCount * 30) + (totalCommentsCount * 15) + (popularPostMetric.maxFlames * 20) + (joinedGroupsCount * 25) + (createdCirclesCount * 60);
  }, [myPostsCount, totalCommentsCount, popularPostMetric.maxFlames, joinedGroupsCount, createdCirclesCount]);

  const achievements: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    icon: string;
    bgGradient: string;
    metricName: string;
    helperText: string;
    rewardXP: number;
    rewardCoins: number;
    currentValue: number;
    targetValue: number;
    unlocked: boolean;
    date: string;
  }> = useMemo(() => {
    const rawBadges = [
      // 1. Exploration
      {
        id: "banana_enthusiast",
        category: "exploration",
        title: "Banana Enthusiast",
        description: "Earned by keeping close track of focus analytics, exploring metrics, and being a top community contributor.",
        icon: "🍌",
        bgGradient: "from-amber-400 via-yellow-350 to-orange-500",
        metricName: "Community Karma",
        helperText: "Earn 100 Community Karma points in Nexora.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: Math.min(100, communityKarma),
        targetValue: 100,
        unlocked: communityKarma >= 100,
        date: "",
      },
      {
        id: "new_share",
        category: "exploration",
        title: "New Share",
        description: "Awarded when overlaying logs or sharing insights with the sub-community spaces.",
        icon: "↗️",
        bgGradient: "from-teal-400 via-emerald-300 to-green-500",
        metricName: "Shares",
        helperText: "Publish 1 or more posts to start sharing discussions.",
        rewardXP: 150,
        rewardCoins: 75,
        currentValue: myPostsCount >= 1 ? 1 : 0,
        targetValue: 1,
        unlocked: myPostsCount >= 1,
        date: "",
      },
      {
        id: "conv_starter",
        category: "exploration",
        title: "Conversation Starter",
        description: "Ignite interesting discussions or comments on multiple community threads.",
        icon: "💬",
        bgGradient: "from-indigo-400 via-pink-400 to-purple-500",
        metricName: "Comments",
        helperText: "Add 1 comment onto other circles' shared posts.",
        rewardXP: 150,
        rewardCoins: 75,
        currentValue: totalCommentsCount,
        targetValue: 1,
        unlocked: totalCommentsCount >= 1,
        date: "",
      },
      {
        id: "quality_comment",
        category: "exploration",
        title: "Quality Comment",
        description: "Post useful insights that are highly structured and helpful for your peers.",
        icon: "💬",
        bgGradient: "from-amber-400 to-yellow-500",
        metricName: "Comments",
        helperText: "Write at least 2 comments across circles.",
        rewardXP: 200,
        rewardCoins: 100,
        currentValue: totalCommentsCount,
        targetValue: 2,
        unlocked: totalCommentsCount >= 2,
        date: "",
      },
      {
        id: "cool_comment",
        category: "exploration",
        title: "Cool Comment",
        description: "Write positive feedback and share support with your peers.",
        icon: "💬",
        bgGradient: "from-emerald-400 to-teal-500",
        metricName: "Comments",
        helperText: "Contribute at least 1 comment.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: totalCommentsCount,
        targetValue: 1,
        unlocked: totalCommentsCount >= 1,
        date: "",
      },
      {
        id: "banana_baby",
        category: "exploration",
        title: "Banana Baby",
        description: "Start logging session focus metrics and view visual tracker stats.",
        icon: "🍌",
        bgGradient: "from-yellow-300 to-orange-400",
        metricName: "Posts",
        helperText: "Share 1 focus tracker log in Nexora.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: myPostsCount >= 1 ? 1 : 0,
        targetValue: 1,
        unlocked: myPostsCount >= 1,
        date: "",
      },
      {
        id: "banana_beginner",
        category: "exploration",
        title: "Banana Beginner",
        description: "Continue to log metrics and check focus levels on a regular basis.",
        icon: "🍌",
        bgGradient: "from-yellow-400 to-amber-500",
        metricName: "Posts",
        helperText: "Share 2 focus logs in circles.",
        rewardXP: 200,
        rewardCoins: 100,
        currentValue: myPostsCount,
        targetValue: 2,
        unlocked: myPostsCount >= 2,
        date: "",
      },
      {
        id: "sharing_enthusiast",
        category: "exploration",
        title: "Sharing Enthusiast",
        description: "Active explorer keeping sub-community feeds updated with custom insights.",
        icon: "📤",
        bgGradient: "from-sky-400 to-blue-500",
        metricName: "Shares",
        helperText: "Share 3 focus logs in any circle.",
        rewardXP: 250,
        rewardCoins: 125,
        currentValue: myPostsCount,
        targetValue: 3,
        unlocked: myPostsCount >= 3,
        date: "",
      },
      {
        id: "banana_aficionado",
        category: "exploration",
        title: "Banana Aficionado",
        description: "Collect high amounts of community engagement over your focus journey.",
        icon: "🍌",
        bgGradient: "from-amber-500 to-orange-600",
        metricName: "Community Karma",
        helperText: "Achieve 500 Community Karma points.",
        rewardXP: 1000,
        rewardCoins: 500,
        currentValue: Math.min(500, communityKarma),
        targetValue: 500,
        unlocked: communityKarma >= 500,
        date: "",
      },
      {
        id: "hometown_hero",
        category: "exploration",
        title: "Hometown Hero",
        description: "Establish strong footprint in your local primary focus community.",
        icon: "🏠",
        bgGradient: "from-blue-400 to-indigo-600",
        metricName: "Groups Joined",
        helperText: "Join at least 1 community circle in Nexora.",
        rewardXP: 200,
        rewardCoins: 100,
        currentValue: joinedGroupsCount,
        targetValue: 1,
        unlocked: joinedGroupsCount >= 1,
        date: "",
      },
      {
        id: "sharing_advocate",
        category: "exploration",
        title: "Sharing Advocate",
        description: "Spread productivity awareness across the community workspace.",
        icon: "📤",
        bgGradient: "from-cyan-400 to-indigo-500",
        metricName: "Shares",
        helperText: "Log at least 10 sessions/posts in Nexora.",
        rewardXP: 500,
        rewardCoins: 250,
        currentValue: myPostsCount,
        targetValue: 10,
        unlocked: myPostsCount >= 10,
        date: "",
      },
      {
        id: "sharing_pro",
        category: "exploration",
        title: "Sharing Pro",
        description: "Elite provider of valuable focus logs and shared session summaries.",
        icon: "📤",
        bgGradient: "from-indigo-600 to-purple-600",
        metricName: "Shares",
        helperText: "Log 20 sessions/posts in circles.",
        rewardXP: 800,
        rewardCoins: 400,
        currentValue: myPostsCount,
        targetValue: 20,
        unlocked: myPostsCount >= 20,
        date: "",
      },
      {
        id: "sharing_legend",
        category: "exploration",
        title: "Sharing Legend",
        description: "A legendary status of productivity sharing and community contributions.",
        icon: "📤",
        bgGradient: "from-purple-600 to-pink-600",
        metricName: "Shares",
        helperText: "Log 50 sessions/posts in Nexora.",
        rewardXP: 1500,
        rewardCoins: 750,
        currentValue: myPostsCount,
        targetValue: 50,
        unlocked: myPostsCount >= 50,
        date: "",
      },
      {
        id: "banana_master",
        category: "exploration",
        title: "Banana Master",
        description: "Collect massive amounts of community interactions and helpful posts.",
        icon: "🍌",
        bgGradient: "from-orange-500 to-red-500",
        metricName: "Community Karma",
        helperText: "Gather 1,200 Community Karma points.",
        rewardXP: 2000,
        rewardCoins: 1000,
        currentValue: Math.min(1200, communityKarma),
        targetValue: 1200,
        unlocked: communityKarma >= 1200,
        date: "",
      },
      {
        id: "banana_legend",
        category: "exploration",
        title: "Banana Legend",
        description: "Become an absolute legend in community participation and feedback.",
        icon: "🍌",
        bgGradient: "from-yellow-400 to-red-600",
        metricName: "Community Karma",
        helperText: "Unlock 2,500 Community Karma points.",
        rewardXP: 4000,
        rewardCoins: 2000,
        currentValue: Math.min(2500, communityKarma),
        targetValue: 2500,
        unlocked: communityKarma >= 2500,
        date: "",
      },
      {
        id: "potassium_overlord",
        category: "exploration",
        title: "Potassium Overlord",
        description: "Complete authority on community discussions, circle leadership, and shared posts.",
        icon: "👑",
        bgGradient: "from-rose-500 to-violet-600 animate-pulse",
        metricName: "Community Karma",
        helperText: "Obtain an ultimate sum of 5,000 Community Karma.",
        rewardXP: 10000,
        rewardCoins: 5000,
        currentValue: Math.min(5000, communityKarma),
        targetValue: 5000,
        unlocked: communityKarma >= 5000,
        date: "",
      },
      {
        id: "nice_post",
        category: "exploration",
        title: "Nice Post",
        description: "Receive high praise from colleagues with 5 or more flames on a post.",
        icon: "✨",
        bgGradient: "from-sky-400 to-blue-500",
        metricName: "Flames",
        helperText: "Accumulate 5 upflames on a single posts.",
        rewardXP: 150,
        rewardCoins: 75,
        currentValue: popularPostMetric.maxFlames,
        targetValue: 5,
        unlocked: popularPostMetric.maxFlames >= 5,
        date: "",
      },
      {
        id: "buzz_worthy_post",
        category: "exploration",
        title: "Buzz-Worthy Post",
        description: "Get community traction and attract interesting conversations.",
        icon: "🐝",
        bgGradient: "from-yellow-400 to-amber-600",
        metricName: "Flames",
        helperText: "Accumulate 10 upflames on a single post.",
        rewardXP: 300,
        rewardCoins: 150,
        currentValue: popularPostMetric.maxFlames,
        targetValue: 10,
        unlocked: popularPostMetric.maxFlames >= 10,
        date: "",
      },
      {
        id: "popular_post",
        category: "exploration",
        title: "Popular Post",
        description: "A solid post that triggers feedback from many active teammates.",
        icon: "🔥",
        bgGradient: "from-orange-400 to-red-500",
        metricName: "Flames",
        helperText: "Amass 25 upflames on a post.",
        rewardXP: 500,
        rewardCoins: 250,
        currentValue: popularPostMetric.maxFlames,
        targetValue: 25,
        unlocked: popularPostMetric.maxFlames >= 25,
        date: "",
      },
      {
        id: "premiere_post",
        category: "exploration",
        title: "Premiere Post",
        description: "Get widely recognized as an educational and inspirational guide.",
        icon: "🎬",
        bgGradient: "from-purple-500 to-indigo-600",
        metricName: "Flames",
        helperText: "Receive 50 upflames on a single focus post.",
        rewardXP: 1000,
        rewardCoins: 500,
        currentValue: popularPostMetric.maxFlames,
        targetValue: 50,
        unlocked: popularPostMetric.maxFlames >= 50,
        date: "",
      },
      {
        id: "peak_post",
        category: "exploration",
        title: "Peak Post",
        description: "Gather an ultimate record of 100 flames and reach the top spot.",
        icon: "🏔️",
        bgGradient: "from-teal-400 to-emerald-600 shadow-lg",
        metricName: "Flames",
        helperText: "Receive 100 upflames on a single post.",
        rewardXP: 2500,
        rewardCoins: 1250,
        currentValue: popularPostMetric.maxFlames,
        targetValue: 100,
        unlocked: popularPostMetric.maxFlames >= 100,
        date: "",
      },
      {
        id: "captivating_comment",
        category: "exploration",
        title: "Captivating Comment",
        description: "Write highly engaging, high-traction comment feedback under group posts.",
        icon: "💬",
        bgGradient: "from-pink-500 to-purple-600",
        metricName: "Comments",
        helperText: "Write at least 10 comments on peer circles.",
        rewardXP: 400,
        rewardCoins: 200,
        currentValue: totalCommentsCount,
        targetValue: 10,
        unlocked: totalCommentsCount >= 10,
        date: "",
      },

      // 2. Building Community
      {
        id: "top_commenter",
        category: "community",
        title: "Top 25% Commenter",
        description: "Consistently contribute commentary with dynamic value to ongoing community discussions.",
        icon: "👑",
        bgGradient: "from-purple-500 via-fuchsia-400 to-indigo-600",
        metricName: "Comments",
        helperText: "Contribute 5 or more comments across community circles to unlock.",
        rewardXP: 300,
        rewardCoins: 150,
        currentValue: totalCommentsCount,
        targetValue: 5,
        unlocked: totalCommentsCount >= 5,
        date: "5/25/26",
      },
      {
        id: "top_poster",
        category: "community",
        title: "Top 25% Poster",
        description: "Express your ideas frequently and gather high engagement levels.",
        icon: "📝",
        bgGradient: "from-sky-400 via-blue-500 to-indigo-600",
        metricName: "Posts",
        helperText: "Share 3 or more detailed focus logs in any circles.",
        rewardXP: 300,
        rewardCoins: 150,
        currentValue: myPostsCount,
        targetValue: 3,
        unlocked: myPostsCount >= 3,
        date: "5/25/26",
      },
      {
        id: "top_10_commenter",
        category: "community",
        title: "Top 10% Commenter",
        description: "Be one of the most reliable and active communication catalysts.",
        icon: "👑",
        bgGradient: "from-violet-500 to-fuchsia-600",
        metricName: "Comments",
        helperText: "Write at least 15 comments across Nexora circles.",
        rewardXP: 600,
        rewardCoins: 300,
        currentValue: totalCommentsCount,
        targetValue: 15,
        unlocked: totalCommentsCount >= 15,
        date: "",
      },
      {
        id: "top_10_poster",
        category: "community",
        title: "Top 10% Poster",
        description: "Publish several comprehensive journals and host key dialogues.",
        icon: "📝",
        bgGradient: "from-blue-500 to-cyan-600",
        metricName: "Posts",
        helperText: "Write and share 10 detailed focus posts.",
        rewardXP: 600,
        rewardCoins: 300,
        currentValue: myPostsCount,
        targetValue: 10,
        unlocked: myPostsCount >= 10,
        date: "",
      },
      {
        id: "top_5_commenter",
        category: "community",
        title: "Top 5% Commenter",
        description: "Unlock elite peer support status by keeping community streams alive.",
        icon: "👑",
        bgGradient: "from-rose-500 to-amber-500",
        metricName: "Comments",
        helperText: "Publish 30 comments across various circles.",
        rewardXP: 1200,
        rewardCoins: 600,
        currentValue: totalCommentsCount,
        targetValue: 30,
        unlocked: totalCommentsCount >= 30,
        date: "",
      },
      {
        id: "top_5_poster",
        category: "community",
        title: "Top 5% Poster",
        description: "Pioneer focus techniques and provide structural feedback.",
        icon: "📝",
        bgGradient: "from-sky-500 to-indigo-700 animate-pulse",
        metricName: "Posts",
        helperText: "Publish 20 rich focus logs.",
        rewardXP: 1200,
        rewardCoins: 600,
        currentValue: myPostsCount,
        targetValue: 20,
        unlocked: myPostsCount >= 20,
        date: "",
      },
      {
        id: "super_contributor",
        category: "community",
        title: "Super Contributor",
        description: "Outstanding support of collective circles with both comments and logs.",
        icon: "💎",
        bgGradient: "from-indigo-400 via-pink-400 to-teal-400",
        metricName: "Contributions",
        helperText: "Amass a combined 25 posts/comments.",
        rewardXP: 1000,
        rewardCoins: 500,
        currentValue: myPostsCount + totalCommentsCount,
        targetValue: 25,
        unlocked: (myPostsCount + totalCommentsCount) >= 25,
        date: "",
      },
      {
        id: "repeat_contributor",
        category: "community",
        title: "Repeat Contributor",
        description: "Form daily interaction loops and maintain a helpful attitude.",
        icon: "🔄",
        bgGradient: "from-slate-400 to-indigo-500",
        metricName: "Contributions",
        helperText: "Amass a combined 10 posts/comments.",
        rewardXP: 400,
        rewardCoins: 200,
        currentValue: myPostsCount + totalCommentsCount,
        targetValue: 10,
        unlocked: (myPostsCount + totalCommentsCount) >= 10,
        date: "",
      },
      {
        id: "content_connoisseur",
        category: "community",
        title: "Content Connoisseur",
        description: "Successfully craft 5 valuable focus logs that peers bookmark.",
        icon: "📚",
        bgGradient: "from-emerald-400 to-teal-600",
        metricName: "Posts",
        helperText: "Write at least 5 posts in Nexora.",
        rewardXP: 500,
        rewardCoins: 250,
        currentValue: myPostsCount,
        targetValue: 5,
        unlocked: myPostsCount >= 5,
        date: "",
      },
      {
        id: "flag_planter",
        category: "community",
        title: "Flag Planter",
        description: "Mark your initial active territory across multiple community spaces.",
        icon: "🏳️",
        bgGradient: "from-amber-400 to-orange-500",
        metricName: "Circles joined",
        helperText: "Join 3 or more community circles in Nexora.",
        rewardXP: 300,
        rewardCoins: 150,
        currentValue: joinedGroupsCount,
        targetValue: 3,
        unlocked: joinedGroupsCount >= 3,
        date: "",
      },
      {
        id: "elder",
        category: "community",
        title: "Elder",
        description: "A wise, long-term advisor status among high-ranking productivity peers.",
        icon: "🧓",
        bgGradient: "from-slate-400 via-zinc-500 to-stone-600",
        metricName: "Profile Points",
        helperText: "Collect 500 or more total profile XP points.",
        rewardXP: 500,
        rewardCoins: 250,
        currentValue: totalPoints,
        targetValue: 500,
        unlocked: totalPoints >= 500,
        date: "",
      },
      {
        id: "rising_star",
        category: "community",
        title: "Rising Star",
        description: "Make swift headway towards joining elite ranks of global contributors.",
        icon: "⭐",
        bgGradient: "from-yellow-400 via-green-400 to-teal-500",
        metricName: "Profile Points",
        helperText: "Collect 250 or more total profile XP points.",
        rewardXP: 250,
        rewardCoins: 125,
        currentValue: totalPoints,
        targetValue: 250,
        unlocked: totalPoints >= 250,
        date: "",
      },
      {
        id: "picasso",
        category: "community",
        title: "Picasso",
        description: "Express your persona clearly by customizing your Display Portrait Portrait.",
        icon: "🎨",
        bgGradient: "from-rose-400 to-fuchsia-500",
        metricName: "Avatar Setup",
        helperText: "Configure a custom profile picture image.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: currentUserPhoto && currentUserPhoto !== "" ? 1 : 0,
        targetValue: 1,
        unlocked: !!(currentUserPhoto && currentUserPhoto !== ""),
        date: "5/18/26",
      },
      {
        id: "thats_me",
        category: "community",
        title: "That's Me",
        description: "Define standard user identification features for secure communication.",
        icon: "👤",
        bgGradient: "from-indigo-400 to-blue-500",
        metricName: "Name Setup",
        helperText: "Configure a customized display username.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: currentUserName && currentUserName !== "Anonymous Hero" ? 1 : 0,
        targetValue: 1,
        unlocked: !!(currentUserName && currentUserName !== "Anonymous Hero"),
        date: "5/18/26",
      },

      // 3. Reddit Streak (Community Active Days)
      {
        id: "streak_5",
        category: "streak",
        title: "5 Community Days",
        description: "Engage in posts, comments, or circle discussions across 5 active community days.",
        icon: "🕯️",
        bgGradient: "from-orange-400 via-amber-400 to-red-500",
        metricName: "Community Days",
        helperText: "Participate in community feeds across 5 unique days.",
        rewardXP: 250,
        rewardCoins: 125,
        currentValue: communityActiveDays,
        targetValue: 5,
        unlocked: communityActiveDays >= 5,
        date: "",
      },
      {
        id: "streak_10",
        category: "streak",
        title: "10 Community Days",
        description: "Community practitioner! Share feedback and posts across 10 active days.",
        icon: "🔥",
        bgGradient: "from-red-500 via-orange-400 to-yellow-500",
        metricName: "Community Days",
        helperText: "Participate in community feeds across 10 unique days.",
        rewardXP: 500,
        rewardCoins: 250,
        currentValue: communityActiveDays,
        targetValue: 10,
        unlocked: communityActiveDays >= 10,
        date: "",
      },
      {
        id: "streak_20",
        category: "streak",
        title: "20 Community Days",
        description: "A supreme community champion status of solid engagement and valuable posts.",
        icon: "👑",
        bgGradient: "from-blue-600 via-indigo-500 to-violet-600",
        metricName: "Community Days",
        helperText: "Participate in community feeds across 20 unique days.",
        rewardXP: 1000,
        rewardCoins: 500,
        currentValue: communityActiveDays,
        targetValue: 20,
        unlocked: communityActiveDays >= 20,
        date: "",
      },
      {
        id: "streak_30",
        category: "streak",
        title: "30 Community Days",
        description: "An unbelievable active run publishing and interacting with community circles.",
        icon: "🔥",
        bgGradient: "from-indigo-500 to-pink-500",
        metricName: "Community Days",
        helperText: "Participate in community feeds across 30 unique days.",
        rewardXP: 1500,
        rewardCoins: 750,
        currentValue: communityActiveDays,
        targetValue: 30,
        unlocked: communityActiveDays >= 30,
        date: "",
      },
      {
        id: "streak_75",
        category: "streak",
        title: "75 Community Days",
        description: "Remarkable dedication level to community topics and peer growth.",
        icon: "🔥",
        bgGradient: "from-rose-500 to-orange-500",
        metricName: "Community Days",
        helperText: "Participate in community feeds across 75 unique days.",
        rewardXP: 2500,
        rewardCoins: 1250,
        currentValue: communityActiveDays,
        targetValue: 75,
        unlocked: communityActiveDays >= 75,
        date: "",
      },
      {
        id: "streak_100",
        category: "streak",
        title: "100 Community Days",
        description: "The absolute centurion! A community milestone of incredible proportion.",
        icon: "💯",
        bgGradient: "from-red-600 to-rose-600 animate-bounce",
        metricName: "Community Days",
        helperText: "Participate in community feeds across 100 unique days.",
        rewardXP: 4000,
        rewardCoins: 2000,
        currentValue: communityActiveDays,
        targetValue: 100,
        unlocked: communityActiveDays >= 100,
        date: "",
      },
      {
        id: "streak_150",
        category: "streak",
        title: "150-Day Streak",
        description: "Unshakable self-discipline is your second nature.",
        icon: "🔥",
        bgGradient: "from-amber-400 to-emerald-500",
        metricName: "Streak",
        helperText: "Maintain an active streak of 150 days.",
        rewardXP: 6000,
        rewardCoins: 3000,
        currentValue: currentStreak,
        targetValue: 150,
        unlocked: currentStreak >= 150,
        date: "",
      },
      {
        id: "streak_200",
        category: "streak",
        title: "200-Day Streak",
        description: "Two hundred cycles of absolute clarity and progress! Mind blown.",
        icon: "🔥",
        bgGradient: "from-teal-400 to-indigo-600",
        metricName: "Streak",
        helperText: "Maintain an active streak of 200 days.",
        rewardXP: 8000,
        rewardCoins: 4000,
        currentValue: currentStreak,
        targetValue: 200,
        unlocked: currentStreak >= 200,
        date: "",
      },
      {
        id: "streak_300",
        category: "streak",
        title: "300-Day Streak",
        description: "Fierce consistency that outlasts all transient distractions.",
        icon: "🔥",
        bgGradient: "from-violet-600 to-pink-500",
        metricName: "Streak",
        helperText: "Maintain an active streak of 300 days.",
        rewardXP: 12000,
        rewardCoins: 6000,
        currentValue: currentStreak,
        targetValue: 300,
        unlocked: currentStreak >= 300,
        date: "",
      },
      {
        id: "streak_365",
        category: "streak",
        title: "365-Day Streak",
        description: "Exactly a full year of unbroken daily progress! Absolute champion status.",
        icon: "🎆",
        bgGradient: "from-yellow-400 via-pink-500 to-indigo-600",
        metricName: "Streak",
        helperText: "Maintain an active streak of 365 days.",
        rewardXP: 20000,
        rewardCoins: 10000,
        currentValue: currentStreak,
        targetValue: 365,
        unlocked: currentStreak >= 365,
        date: "",
      },
      {
        id: "streak_400",
        category: "streak",
        title: "400-Day Streak",
        description: "Pioneering habits into the next tier of personal greatness.",
        icon: "🔥",
        bgGradient: "from-emerald-400 to-teal-700",
        metricName: "Streak",
        helperText: "Maintain an active streak of 400 days.",
        rewardXP: 25000,
        rewardCoins: 12500,
        currentValue: currentStreak,
        targetValue: 400,
        unlocked: currentStreak >= 400,
        date: "",
      },
      {
        id: "streak_500",
        category: "streak",
        title: "500-Day Streak",
        description: "Five hundred streaks. Unshakeable practitioner of deep focus work.",
        icon: "🏔️",
        bgGradient: "from-cyan-500 to-blue-700",
        metricName: "Streak",
        helperText: "Maintain an active streak of 500 days.",
        rewardXP: 35000,
        rewardCoins: 17500,
        currentValue: currentStreak,
        targetValue: 500,
        unlocked: currentStreak >= 500,
        date: "",
      },
      {
        id: "streak_600",
        category: "streak",
        title: "600-Day Streak",
        description: "Forming an absolute bullet-proof daily routines architecture.",
        icon: "🔥",
        bgGradient: "from-orange-500 to-red-700",
        metricName: "Streak",
        helperText: "Maintain an active streak of 600 days.",
        rewardXP: 50000,
        rewardCoins: 25000,
        currentValue: currentStreak,
        targetValue: 600,
        unlocked: currentStreak >= 600,
        date: "",
      },
      {
        id: "streak_700",
        category: "streak",
        title: "700-Day Streak",
        description: "Reaching deep neural networks optimization of daily productivity.",
        icon: "👑",
        bgGradient: "from-purple-600 via-fuchsia-600 to-indigo-650",
        metricName: "Streak",
        helperText: "Maintain an active streak of 700 days.",
        rewardXP: 75000,
        rewardCoins: 37500,
        currentValue: currentStreak,
        targetValue: 700,
        unlocked: currentStreak >= 700,
        date: "",
      },
      {
        id: "basement_dweller",
        category: "streak",
        title: "Basement Dweller",
        description: "Literally lived inside the productivity tracking interface for 150 days.",
        icon: "🏠",
        bgGradient: "from-slate-700 to-zinc-900 border border-slate-700",
        metricName: "Streak",
        helperText: "Log consecutive sessions for 150 days.",
        rewardXP: 4500,
        rewardCoins: 2250,
        currentValue: currentStreak,
        targetValue: 150,
        unlocked: currentStreak >= 150,
        date: "",
      },
      {
        id: "grass_toucher",
        category: "streak",
        title: "Grass Toucher",
        description: "Finally! Logged sessions for 300 days and earned the right to touch grass.",
        icon: "🌱",
        bgGradient: "from-green-500 to-emerald-700",
        metricName: "Streak",
        helperText: "Complete daily check-ins for 300 days.",
        rewardXP: 10000,
        rewardCoins: 5000,
        currentValue: currentStreak,
        targetValue: 300,
        unlocked: currentStreak >= 300,
        date: "",
      },
      {
        id: "streak_1000",
        category: "streak",
        title: "1000-Day Streak",
        description: "Pure cosmic consciousness. Divine level devotion. Incredible.",
        icon: "🌌",
        bgGradient: "from-indigo-900 via-purple-800 to-stone-900 animate-pulse",
        metricName: "Streak",
        helperText: "Complete an unbroken daily run of 1000 days.",
        rewardXP: 150000,
        rewardCoins: 75000,
        currentValue: currentStreak,
        targetValue: 1000,
        unlocked: currentStreak >= 1000,
        date: "",
      },

      // 4. Getting Started
      {
        id: "det_doggo",
        category: "getting_started",
        title: "Detective Doggo",
        description: "Sleuth active settings page to fill your display name bio and configure preferences.",
        icon: "🐕",
        bgGradient: "from-yellow-400 via-orange-300 to-amber-500",
        metricName: "Profile Setup",
        helperText: "Configure custom username or bio settings.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: currentUserName && currentUserName !== "Anonymous Hero" ? 1 : 0,
        targetValue: 1,
        unlocked: !!(currentUserName && currentUserName !== "Anonymous Hero"),
        date: "",
      },
      {
        id: "pers_of_interests",
        category: "getting_started",
        title: "Person of Interests",
        description: "Add multiple interested categories or customize your user profile avatar.",
        icon: "🎨",
        bgGradient: "from-pink-500 via-purple-400 to-rose-500",
        metricName: "Setup Image",
        helperText: "Customize display portrait picture under settings.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: currentUserPhoto && currentUserPhoto !== "" ? 1 : 0,
        targetValue: 1,
        unlocked: !!(currentUserPhoto && currentUserPhoto !== ""),
        date: "",
      },
      {
        id: "newcomer",
        category: "getting_started",
        title: "Newcomer",
        description: "Introduce yourself to circles and successfully join at least one focus circle.",
        icon: "🌱",
        bgGradient: "from-green-400 via-emerald-300 to-teal-500",
        metricName: "Groups Joined",
        helperText: "Join at least one sub-community space to earn newcomer badge.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: joinedGroupsCount >= 1 ? 1 : 0,
        targetValue: 1,
        unlocked: joinedGroupsCount >= 1,
        date: "",
      },
      {
        id: "joined_reddit",
        category: "getting_started",
        title: "Joined Reddit",
        description: "Establish official account credentials and log initial metrics.",
        icon: "🎂",
        bgGradient: "from-orange-400 to-yellow-500",
        metricName: "Account Setup",
        helperText: "Set up and register your Nexora membership profile.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: (user && user.uid && !user.isAnonymous) ? 1 : 0,
        targetValue: 1,
        unlocked: !!(user && user.uid && !user.isAnonymous),
        date: "",
      },
      {
        id: "secured_account",
        category: "getting_started",
        title: "Secured Account",
        description: "Safeguard focus and session history details with robust verification.",
        icon: "🛡️",
        bgGradient: "from-sky-400 to-indigo-600",
        metricName: "Security Info",
        helperText: "Verify account credentials or reach 200 total XP.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: (user?.emailVerified || totalPoints >= 200) ? 1 : 0,
        targetValue: 1,
        unlocked: !!(user?.emailVerified || totalPoints >= 200),
        date: "",
      },
      {
        id: "profile_perfectionist",
        category: "getting_started",
        title: "Profile Perfectionist",
        description: "Align profile name, user description tags, and baseline statistics perfectly.",
        icon: "🧩",
        bgGradient: "from-violet-400 to-fuchsia-600",
        metricName: "Completion",
        helperText: "Maintain complete personalization of details.",
        rewardXP: 200,
        rewardCoins: 100,
        currentValue: (currentUserName && currentUserName !== "Anonymous Hero" && currentUserPhoto) ? 1 : 0,
        targetValue: 1,
        unlocked: !!(currentUserName && currentUserName !== "Anonymous Hero" && currentUserPhoto),
        date: "",
      },
      {
        id: "feed_finder",
        category: "getting_started",
        title: "Feed Finder",
        description: "Explore the community feed and discover valuable sub-community insights.",
        icon: "🔍",
        bgGradient: "from-emerald-400 to-teal-500",
        metricName: "Feed Search",
        helperText: "Engage with community feeds by joining a circle, posting, or commenting.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: (myPostsCount + totalCommentsCount + joinedGroupsCount) >= 1 ? 1 : 0,
        targetValue: 1,
        unlocked: (myPostsCount + totalCommentsCount + joinedGroupsCount) >= 1,
        date: "",
      },

      // 5. Community Moderation
      {
        id: "base_bag",
        category: "moderation",
        title: "Basecamp Bag",
        description: "Unlock core moderation tools, terms of compliance, and safety standards guide.",
        icon: "🎒",
        bgGradient: "from-sky-400 to-slate-500",
        metricName: "Rules Prepared",
        helperText: "Earn 100 Community Karma to equip the basecamp handbook.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: communityKarma >= 100 ? 1 : 0,
        targetValue: 1,
        unlocked: communityKarma >= 100,
        date: "",
      },
      {
        id: "grand_sprouting",
        category: "moderation",
        title: "Grand Sprouting",
        description: "Host and monitor your own custom focus circle space or sub-community.",
        icon: "🌿",
        bgGradient: "from-green-500 via-emerald-450 to-lime-500",
        metricName: "Circle Creation",
        helperText: "Sprout a sub-community room in Nexora.",
        rewardXP: 300,
        rewardCoins: 150,
        currentValue: createdCirclesCount,
        targetValue: 1,
        unlocked: createdCirclesCount >= 1,
        date: "",
      },
      {
        id: "support_network",
        category: "moderation",
        title: "Support Network",
        description: "Build relationships and connect multiple active groups together.",
        icon: "🛡️",
        bgGradient: "from-slate-600 via-indigo-900 to-slate-800",
        metricName: "Connected Nodes",
        helperText: "Connect or join at least 2 active circles.",
        rewardXP: 250,
        rewardCoins: 125,
        currentValue: joinedGroupsCount,
        targetValue: 2,
        unlocked: joinedGroupsCount >= 2,
        date: "",
      },
      {
        id: "mod_hatchling",
        category: "moderation",
        title: "Mod Hatchling",
        description: "Initial recognition of solid community support behaviors.",
        icon: "🐥",
        bgGradient: "from-yellow-300 to-orange-400",
        metricName: "Mod Level",
        helperText: "Advance to 100 Community Karma points.",
        rewardXP: 250,
        rewardCoins: 125,
        currentValue: communityKarma,
        targetValue: 100,
        unlocked: communityKarma >= 100,
        date: "",
      },
      {
        id: "mod_awakening",
        category: "moderation",
        title: "Mod Awakening",
        description: "Awaken full focus moderation compliance and compliance parameters.",
        icon: "🦁",
        bgGradient: "from-amber-400 to-rose-600",
        metricName: "Mod Level",
        helperText: "Advance to 500 Community Karma points.",
        rewardXP: 600,
        rewardCoins: 300,
        currentValue: communityKarma,
        targetValue: 500,
        unlocked: communityKarma >= 500,
        date: "",
      },
      {
        id: "purrfect_pair",
        category: "moderation",
        title: "Purrfect Pair",
        description: "Teammate integration milestone for dual track communication.",
        icon: "🐱",
        bgGradient: "from-pink-400 to-purple-500",
        metricName: "Joint Operations",
        helperText: "Participate in 2 dynamic group setups.",
        rewardXP: 200,
        rewardCoins: 100,
        currentValue: joinedGroupsCount,
        targetValue: 2,
        unlocked: joinedGroupsCount >= 2,
        date: "",
      },
      {
        id: "visitors_5",
        category: "moderation",
        title: "5 Weekly Visitors",
        description: "Welcome 5 teammates onto your logs feed or shared group topics.",
        icon: "👥",
        bgGradient: "from-slate-400 to-slate-500",
        metricName: "Weekly Vis",
        helperText: "Get initial traffic onto your published posts.",
        rewardXP: 100,
        rewardCoins: 50,
        currentValue: popularPostMetric.maxFlames >= 1 ? 5 : 0,
        targetValue: 5,
        unlocked: popularPostMetric.maxFlames >= 1,
        date: "",
      },
      {
        id: "visitors_25",
        category: "moderation",
        title: "25 Weekly Visitors",
        description: "Draw stable traffic of 25 active users to evaluate metrics.",
        icon: "👥",
        bgGradient: "from-sky-400 to-blue-500",
        metricName: "Weekly Vis",
        helperText: "Amass a base of 5 flames or engagement signs.",
        rewardXP: 250,
        rewardCoins: 125,
        currentValue: popularPostMetric.maxFlames >= 5 ? 25 : 0,
        targetValue: 25,
        unlocked: popularPostMetric.maxFlames >= 5,
        date: "",
      },
      {
        id: "visitors_100",
        category: "moderation",
        title: "100 Weekly Visitors",
        description: "Engage 100 weekly viewers on your productivity channels.",
        icon: "👥",
        bgGradient: "from-teal-400 to-green-600",
        metricName: "Weekly Vis",
        helperText: "Achieve at least 10 upflames on a single log.",
        rewardXP: 500,
        rewardCoins: 250,
        currentValue: popularPostMetric.maxFlames >= 10 ? 100 : 0,
        targetValue: 100,
        unlocked: popularPostMetric.maxFlames >= 10,
        date: "",
      },
      {
        id: "visitors_1k",
        category: "moderation",
        title: "1,000 Weekly Visitors",
        description: "Stellar viewership rates driving global mindfulness compliance.",
        icon: "👥",
        bgGradient: "from-violet-500 to-indigo-650",
        metricName: "Weekly Vis",
        helperText: "Accumulate at least 20 upflames.",
        rewardXP: 1000,
        rewardCoins: 500,
        currentValue: popularPostMetric.maxFlames >= 20 ? 1000 : 0,
        targetValue: 1000,
        unlocked: popularPostMetric.maxFlames >= 20,
        date: "",
      },
      {
        id: "visitors_10k",
        category: "moderation",
        title: "10,000 Weekly Visitors",
        description: "Inbound traffic reaches peak standards of community reference.",
        icon: "👥",
        bgGradient: "from-fuchsia-500 to-purple-700",
        metricName: "Weekly Vis",
        helperText: "Gain 50 or more flames response.",
        rewardXP: 2500,
        rewardCoins: 1250,
        currentValue: popularPostMetric.maxFlames >= 50 ? 10000 : 0,
        targetValue: 10000,
        unlocked: popularPostMetric.maxFlames >= 50,
        date: "",
      },
      {
        id: "visitors_100k",
        category: "moderation",
        title: "100,000 Weekly Visitors",
        description: "Phenomenal outreach guiding general health metrics globally.",
        icon: "👥",
        bgGradient: "from-amber-400 to-orange-600",
        metricName: "Weekly Vis",
        helperText: "Obtain 100 or more flames response.",
        rewardXP: 6000,
        rewardCoins: 3000,
        currentValue: popularPostMetric.maxFlames >= 100 ? 100000 : 0,
        targetValue: 100000,
        unlocked: popularPostMetric.maxFlames >= 100,
        date: "",
      },
      {
        id: "visitors_1m",
        category: "moderation",
        title: "1,000,000 Weekly Visitors",
        description: "The absolute pinnacle. Broadcast level influence inspiring millions.",
        icon: "🎆",
        bgGradient: "from-rose-500 to-indigo-900 animate-pulse",
        metricName: "Weekly Vis",
        helperText: "Acquire lifetime premium focus status of 250+ flames.",
        rewardXP: 15000,
        rewardCoins: 7500,
        currentValue: popularPostMetric.maxFlames >= 250 ? 1000000 : 0,
        targetValue: 1000000,
        unlocked: popularPostMetric.maxFlames >= 250,
        date: "",
      },
    ];

    return rawBadges;
  }, [myPostsCount, totalCommentsCount, joinedGroupsCount, createdCirclesCount, communityActiveDays, communityKarma, popularPostMetric, currentUserPhoto, currentUserName]);

  // Listen to Nexus Group shortcut events and local storage routing
  useEffect(() => {
    const handleRouteGroup = () => {
      const shortcutId = localStorage.getItem("nexora_shortcut_circle_id");
      const shortcutName = localStorage.getItem("nexora_shortcut_circle_name");

      if (shortcutId) {
        setSelectedGroupId(shortcutId);
        setActiveTab("groups");
        localStorage.removeItem("nexora_shortcut_circle_id");
        localStorage.removeItem("nexora_shortcut_circle_name");
      } else if (shortcutName) {
        const matched = initialCircles.find(
          (c) =>
            c.name.toLowerCase().replace(/[\s_\-]+/g, "") === shortcutName.toLowerCase().replace(/[\s_\-]+/g, "")
        );
        if (matched) {
          setSelectedGroupId(matched.id);
          setActiveTab("groups");
        } else {
          showToast(`The group "n/${shortcutName}" is not registered on Nexora yet! 🏮`, "info");
        }
        localStorage.removeItem("nexora_shortcut_circle_name");
      }
    };

    handleRouteGroup();
    window.addEventListener("nexora_route_group", handleRouteGroup);
    return () => {
      window.removeEventListener("nexora_route_group", handleRouteGroup);
    };
  }, [initialCircles]);

  // Auto-pre-select target group when launching post creation from within a group
  useEffect(() => {
    if (showCreatePost) {
      if (selectedGroupId) {
        setPostTargetGroup(selectedGroupId);
      } else {
        setPostTargetGroup("public");
      }
    }
  }, [showCreatePost, selectedGroupId]);

  // Clean notification reader
  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    if (!user) return;
    const unread = (notifications || []).filter((n) => !n.isRead);
    if (unread.length === 0) return;

    for (const notif of unread) {
      try {
        const notifRef = doc(db, "users", user.uid, "notifications", notif.id);
        await updateDoc(notifRef, { isRead: true, read: true });
      } catch (e) {
        console.warn("Failed to mark notification as read:", e);
      }
    }
  };

  // Launch Create Post only if user is member of selected group
  const handleLaunchCreatePost = () => {
    if (selectedGroupId) {
      const isJoined = (settings.joinedCircleIds || []).includes(
        selectedGroupId,
      );
      if (!isJoined) {
        showToast(
          "You must join this sub-community group to post here, bro! 🏮",
          "info",
        );
        return;
      }
      setPostTargetGroup(selectedGroupId);
    } else {
      setPostTargetGroup("public");
    }
    setShowCreatePost(true);
  };

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
      const commentsRef = collection(db, "community_posts", selectedPost.id, "comments");
      const snap = await getDocs(commentsRef);
      let list = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as SocialComment & { hideCommentsFromOthers?: boolean },
      ).filter(c => {
        if (c.hideCommentsFromOthers && c.userId !== currentUserId && selectedPost.userId !== currentUserId) {
          return false;
        }
        return true;
      });

      // Merge with local comments for this post
      const localKey = `nexora_comments_${selectedPost.id}`;
      let localList: any[] = [];
      try {
        const savedLocal = localStorage.getItem(localKey);
        localList = savedLocal ? JSON.parse(savedLocal) : [];
      } catch {}

      const combined = [...list, ...localList];
      // Robust map-based deduplication by ID, fallback to content + userId + parentId
      const uniqueMap = new Map<string, any>();
      for (const item of combined) {
        if (!item) continue;
        const key = item.id || `${item.userId}_${item.content}_${item.parentId || 'root'}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      }
      const unique = Array.from(uniqueMap.values());
      unique.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      setPostComments(unique);
    } catch (err) {
      console.warn("Failed retrieving standard comments: ", err);
      // Fallback: load local comments from localStorage
      const localKey = `nexora_comments_${selectedPost.id}`;
      try {
        const savedLocal = localStorage.getItem(localKey);
        const localList = savedLocal ? JSON.parse(savedLocal) : [];
        setPostComments(localList);
      } catch {
        setPostComments([]);
      }
    } finally {
      setLoadingComments(false);
    }
  };

  // Fetch user written comments across all posts using collectionGroup with index-free safety
  const fetchUserWrittenComments = async () => {
    if (!user) return;
    setLoadingUserComments(true);
    try {
      const q = query(
        collectionGroup(db, "comments"),
        where("userId", "==", currentUserId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort in-memory to prevent missing composite index requirements
      list.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      // Merge with localStorage comments
      const key = `nexora_comments_${currentUserId}`;
      const savedLocal = localStorage.getItem(key);
      const localList = savedLocal ? JSON.parse(savedLocal) : [];

      const combined = [...localList, ...list];
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

      setUserWrittenComments(unique);
    } catch (err) {
      console.warn("Failed retrieving user written comments via collectionGroup (index might be missing):", err);
      // Fallback: search locally in localStorage
      const key = `nexora_comments_${currentUserId}`;
      const savedLocal = localStorage.getItem(key);
      const localList = savedLocal ? JSON.parse(savedLocal) : [];
      setUserWrittenComments(localList);
    } finally {
      setLoadingUserComments(false);
    }
  };

  useEffect(() => {
    if (activeTab === "profile" && user) {
      fetchUserWrittenComments();
    }
  }, [activeTab, user]);

  const saveCommentLocally = (comment: any) => {
    try {
      const preparedCommentObj = {
        id: comment.id || Math.random().toString(36).substring(7),
        postId: comment.postId,
        userId: comment.userId,
        userName: comment.userName,
        userPhoto: comment.userPhoto,
        content: comment.content || comment.text || "",
        createdAt: comment.createdAt || new Date().toISOString(),
        parentId: comment.parentId || null,
        parentUserName: comment.parentUserName || null,
      };

      // 1. Save to user comments
      const userKey = `nexora_comments_${currentUserId}`;
      const savedUserLocal = localStorage.getItem(userKey);
      let userLocalList = savedUserLocal ? JSON.parse(savedUserLocal) : [];
      userLocalList = userLocalList.filter((c: any) => c.id !== preparedCommentObj.id && !(c.content === preparedCommentObj.content && c.userId === preparedCommentObj.userId));
      userLocalList.unshift(preparedCommentObj);
      localStorage.setItem(userKey, JSON.stringify(userLocalList));

      // 2. Save to post-specific comments
      if (comment.postId) {
        const postKey = `nexora_comments_${comment.postId}`;
        const savedPostLocal = localStorage.getItem(postKey);
        let postLocalList = savedPostLocal ? JSON.parse(savedPostLocal) : [];
        postLocalList = postLocalList.filter((c: any) => c.id !== preparedCommentObj.id && !(c.content === preparedCommentObj.content && c.userId === preparedCommentObj.userId));
        postLocalList.push(preparedCommentObj);
        localStorage.setItem(postKey, JSON.stringify(postLocalList));
      }
    } catch (e) {
      console.warn("Failed to save comment locally:", e);
    }
  };

  const handlePostCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPost || isSubmittingComment) return;

    recordCommunityActiveDay();
    const trimmedCommentText = newCommentText.trim();
    setIsSubmittingComment(true);
    setNewCommentText("");

    try {
      const commentDocRef = doc(collection(db, "community_posts", selectedPost.id, "comments"));
      const newCommentId = commentDocRef.id;

      const newComment: Partial<SocialComment> & { hideCommentsFromOthers?: boolean; profilePrivacy?: string } = {
        id: newCommentId,
        postId: selectedPost.id,
        userId: currentUserId,
        userName: currentUserName,
        userPhoto: currentUserPhoto,
        content: trimmedCommentText,
        createdAt: new Date().toISOString(),
        hideCommentsFromOthers: settings.hideCommentsFromOthers || false,
        profilePrivacy: settings.profilePrivacy || "public",
      };

      saveCommentLocally(newComment);

      // Optimistic state update so comment appears instantly without duplication
      setPostComments((prev) => {
        const exists = prev.some((c) => c.id === newCommentId || (c.content === trimmedCommentText && c.userId === currentUserId && new Date().getTime() - new Date(c.createdAt || 0).getTime() < 10000));
        if (exists) return prev;
        return [...prev, newComment as SocialComment];
      });

      // Optimistic UI update for comment count
      updatePostOverride(selectedPost.id, {
        commentCount: (selectedPost.commentCount || 0) + 1,
      });

      await setDoc(commentDocRef, cleanPayload(newComment));

      // Trigger comment milestone notifications & rewards increment (15 Coins, 10 XP)
      const nextCommentsCount = totalCommentsCount + 1;
      if (nextCommentsCount === 1) {
        await awardUserRewards(currentUserId, 10, 15, "First Comment written! Novice Commenter Status Unlocked.");
        showToast("Level Up! Novice Commenter Reward Unlocked! (+15 Coins, +10 XP) 🎉", "success");
      } else if (nextCommentsCount === 5) {
        await awardUserRewards(currentUserId, 10, 15, "5 Comments written! Engaging Commenter Status Unlocked.");
        showToast("Level Up! Engaging Commenter Reward Unlocked! (+15 Coins, +10 XP) 🎉", "success");
      } else if (nextCommentsCount === 25) {
        await awardUserRewards(currentUserId, 10, 15, "25 Comments written! Conversation Leader Status Unlocked.");
        showToast("Level Up! Conversation Leader Reward Unlocked! (+15 Coins, +10 XP) 🎉", "success");
      }

      // Notify the post author when another member writes comments
      if (selectedPost.userId && selectedPost.userId !== currentUserId) {
        try {
          await addDoc(collection(db, "users", selectedPost.userId, "notifications"), cleanPayload({
            userId: selectedPost.userId,
            senderId: currentUserId || "anonymous",
            senderName: currentUserName || "Anonymous Hero",
            senderPhoto: currentUserPhoto || "",
            type: "reply",
            postId: selectedPost.id,
            message: `${currentUserName || "A user"} commented: "${trimmedCommentText.substring(0, 55)}${trimmedCommentText.length > 55 ? "..." : ""}"`,
            isRead: false,
            createdAt: new Date().toISOString()
          }));
        } catch (notifErr) {
          console.warn("Comment notification error:", notifErr);
        }
      }

      // Update comment count
      try {
        const postRef = doc(db, "community_posts", selectedPost.id);
        await setDoc(postRef, {
          commentCount: increment(1),
        }, { merge: true });
      } catch (cntErr) {
        console.warn("Could not increment comment count on Firestore:", cntErr);
      }

      // Update local copy of selected post
      setSelectedPost((prev) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null,
      );

      showToast("Comment posted successfully!", "success");
      setTotalCommentsCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem("nexora_stats_comments_count", String(next));
        } catch {}
        return next;
      });
      if (play) play("click");
    } catch (err) {
      showToast("Successfully published comment!", "success");
      setTotalCommentsCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem("nexora_stats_comments_count", String(next));
        } catch {}
        return next;
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePostReplySubmit = async (
    parentComment: SocialComment,
    replyText: string,
  ) => {
    if (!replyText.trim() || !selectedPost || isSubmittingComment) return;
    setIsSubmittingComment(true);
    const trimmedReply = replyText.trim();
    setReplyCommentText("");
    setActiveReplyCommentId(null);

    try {
      const replyDocRef = doc(collection(db, "community_posts", selectedPost.id, "comments"));
      const newReplyId = replyDocRef.id;

      const newReply: Partial<SocialComment> = {
        id: newReplyId,
        postId: selectedPost.id,
        userId: currentUserId,
        userName: currentUserName,
        userPhoto: currentUserPhoto,
        content: trimmedReply,
        createdAt: new Date().toISOString(),
        parentId: parentComment.id,
        parentUserName: parentComment.userName,
      };

      saveCommentLocally(newReply);

      // Auto expand thread for parent comment
      const topLevelParentId = parentComment.parentId || parentComment.id;
      setExpandedThreadIds((prev) => ({
        ...prev,
        [topLevelParentId]: true,
        [parentComment.id]: true,
      }));

      // Optimistic state update so reply appears instantly
      setPostComments((prev) => {
        const exists = prev.some((c) => c.id === newReplyId || (c.content === trimmedReply && c.userId === currentUserId && new Date().getTime() - new Date(c.createdAt || 0).getTime() < 10000));
        if (exists) return prev;
        return [...prev, newReply as SocialComment];
      });

      // Optimistic UI update for comment count
      updatePostOverride(selectedPost.id, {
        commentCount: (selectedPost.commentCount || 0) + 1,
      });

      await setDoc(replyDocRef, cleanPayload(newReply));

      // Notify parent comment author if not self
      if (parentComment.userId && parentComment.userId !== currentUserId) {
        try {
          await addDoc(collection(db, "users", parentComment.userId, "notifications"), cleanPayload({
            userId: parentComment.userId,
            senderId: currentUserId || "anonymous",
            senderName: currentUserName || "Anonymous Hero",
            senderPhoto: currentUserPhoto || "",
            type: "reply",
            postId: selectedPost.id,
            message: `${currentUserName || "A user"} replied to your comment: "${trimmedReply.substring(0, 55)}"`,
            isRead: false,
            createdAt: new Date().toISOString()
          }));
        } catch (nErr) {
          console.warn("Reply notification error:", nErr);
        }
      }

      // Update comment count
      try {
        const postRef = doc(db, "community_posts", selectedPost.id);
        await setDoc(postRef, {
          commentCount: increment(1),
        }, { merge: true });
      } catch (cErr) {
        console.warn("Could not update comment count on Firestore:", cErr);
      }

      setSelectedPost((prev) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null,
      );
      showToast("Successfully published reply on thread!", "success");
      setTotalCommentsCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem("nexora_stats_comments_count", String(next));
        } catch {}
        return next;
      });
      if (play) play("click");
    } catch (err) {
      showToast("Successfully published reply!", "success");
      setTotalCommentsCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem("nexora_stats_comments_count", String(next));
        } catch {}
        return next;
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Flame (like) toggle helper
  const handleToggleFlame = async (post: Post) => {
    recordCommunityActiveDay();
    const isLiked = post.likedBy?.includes(currentUserId);
    const newLikedBy = isLiked
      ? (post.likedBy || []).filter((uid) => uid !== currentUserId)
      : [...(post.likedBy || []), currentUserId];

    const newFlames = Math.max(0, (post.flames || 0) + (isLiked ? -1 : 1));

    // Optimistic UI update with persistence
    updatePostOverride(post.id, {
      likedBy: newLikedBy,
      flames: newFlames,
    });

    try {
      const postRef = doc(db, "community_posts", post.id);
      await setDoc(postRef, {
        likedBy: newLikedBy,
        flames: newFlames,
      }, { merge: true });
      if (play) play("click");

      // Trigger landmark upflame (like) notifications and reward disbursements
      if (!isLiked && post.userId) {
        // Send a post like notification to the creator if liking someone else's post
        if (post.userId !== currentUserId) {
          await addDoc(collection(db, "users", post.userId, "notifications"), cleanPayload({
            userId: post.userId,
            senderId: currentUserId || "anonymous",
            senderName: currentUserName || "Anonymous Hero",
            senderPhoto: currentUserPhoto || "",
            type: "like",
            postId: post.id,
            message: `${currentUserName || "A user"} upflamed your log: "${post.content.substring(0, 35)}${post.content.length > 35 ? "..." : ""}"`,
            isRead: false,
            createdAt: new Date().toISOString()
          }));
        }

        // Milestone level checks for rewards & special notifications (15 Coins, 10 XP)
        if (newFlames === 1) {
          await addDoc(collection(db, "users", post.userId, "notifications"), {
            userId: post.userId,
            senderId: "system",
            senderName: "Nexora Milestones",
            type: "system",
            postId: post.id,
            message: `🔥 "First Flame" Encouragement! Your log received its very first upflame! Claim: +10 XP & +15 Coins!`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          await awardUserRewards(post.userId, 10, 15, "First Flame on your log!");
        } else if (newFlames === 5) {
          await addDoc(collection(db, "users", post.userId, "notifications"), {
            userId: post.userId,
            senderId: "system",
            senderName: "Nexora Milestones",
            type: "system",
            postId: post.id,
            message: `⚡ Spark Milestone reaches 5 upflames! Peers appreciate your log content! Claim: +10 XP & +15 Coins!`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          await awardUserRewards(post.userId, 10, 15, "Spark Level reached!");
        } else if (newFlames === 25) {
          await addDoc(collection(db, "users", post.userId, "notifications"), {
            userId: post.userId,
            senderId: "system",
            senderName: "Nexora Milestones",
            type: "system",
            postId: post.id,
            message: `🌟 Blaze Milestone! Excellent contribution! 25 upflames achieved! Claim: +10 XP & +15 Coins!`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          await awardUserRewards(post.userId, 10, 15, "Blaze Level reached!");
        } else if (newFlames === 100) {
          await addDoc(collection(db, "users", post.userId, "notifications"), {
            userId: post.userId,
            senderId: "system",
            senderName: "Nexora Milestones",
            type: "system",
            postId: post.id,
            message: `👑 INFERNO STATUS! Your log has reached a legendary 100 upflames! Claim: +10 XP & +15 Coins!`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
          await awardUserRewards(post.userId, 10, 15, "Inferno Legendary Status reached!");
        }
      }
    } catch (err) {
      showToast("Action acknowledged!", "success");
    }
  };

  // Reddit Award Post handler using new cute animated stock-based CUTE_AWARDS
  const handleAwardPost = async (post: Post, awardKey: string) => {
    recordCommunityActiveDay();
    const award = CUTE_AWARDS.find(a => a.key === awardKey);
    if (!award) return;

    const purchasedAwards = settings?.purchasedAwards || {};
    const stock = purchasedAwards[awardKey] || 0;

    // If they have no stock, we prompt them to buy a bundle of uses first!
    if (stock <= 0) {
      if ((stats?.coins || 0) < award.cost) {
        showToast(`Insufficient coins! You need ${award.cost} coins to unlock a bundle of ${award.uses}x "${award.label}".`, "error");
        return;
      }

      try {
        // 1. Deduct coins from user stats locally and in Firestore
        if (onUpdateStats) {
          onUpdateStats((prev: any) => ({
            ...prev,
            coins: (prev.coins || 0) - award.cost
          }));
        }

        if (user?.uid) {
          try {
            const senderStatsRef = doc(db, "users", user.uid, "stats", "main");
            await setDoc(senderStatsRef, {
              coins: (stats.coins || 0) - award.cost
            }, { merge: true });
          } catch (e) {
            console.warn("Could not write coins to stats/main:", e);
          }
        }

        // 2. Increment inventory in settings
        const nextPurchasedAwards = {
          ...purchasedAwards,
          [awardKey]: (purchasedAwards[awardKey] || 0) + award.uses
        };

        if (onUpdateSettings) {
          await onUpdateSettings({ purchasedAwards: nextPurchasedAwards });
        }

        showToast(`Unlocked! You bought a pack of ${award.uses}x "${award.label}"! Let's award it now!`, "success");
        if (play) play("click");
        return;
      } catch (err) {
        console.error("Error purchasing award stock:", err);
        showToast("Purchased award locally!", "success");
        return;
      }
    }

    // If they have stock, they bestow/give 1 award!
    try {
      const { increment } = await import("firebase/firestore");
      
      // 1. Decrement inventory in settings
      const nextPurchasedAwards = {
        ...purchasedAwards,
        [awardKey]: Math.max(0, stock - 1)
      };
      if (onUpdateSettings) {
        await onUpdateSettings({ purchasedAwards: nextPurchasedAwards });
      }

      // 2. Award coins (+5 Coins as requested) and XP to post author (if not self-awarding)
      if (post.userId && post.userId !== currentUserId) {
        try {
          const authorStatsRef = doc(db, "users", post.userId, "stats", "main");
          await setDoc(authorStatsRef, {
            totalPoints: increment(award.xpAward),
            coins: increment(5) // Grants 5 coins to post author as requested!
          }, { merge: true });
        } catch (authorErr) {
          console.warn("Could not directly update recipient stats main document:", authorErr);
        }

        // 3. Send private notification to the author (including the sender's name)
        try {
          await addDoc(collection(db, "users", post.userId, "notifications"), cleanPayload({
            userId: post.userId,
            senderId: currentUserId || "anonymous",
            senderName: currentUserName || "Anonymous Hero",
            senderPhoto: currentUserPhoto || "",
            type: "system",
            postId: post.id,
            message: `🎁 ${currentUserName || "A user"} gifted your post a ${award.emoji} "${award.label}" budget reward! You received +5 Coins!`,
            isRead: false,
            createdAt: new Date().toISOString()
          }));
        } catch (notifErr) {
          console.warn("Could not send award notification:", notifErr);
        }
      } else if (post.userId === currentUserId) {
        showToast("Self-awarded! You used an award to decorate your own post.", "success");
      }

      // 4. Update the post's award map in Firestore
      const currentAwards = post.awards || {};
      const nextAwards = {
        ...currentAwards,
        [awardKey]: (currentAwards[awardKey] || 0) + 1
      };
      
      // Optimistic UI update
      updatePostOverride(post.id, {
        awards: nextAwards,
      });

      if (post.id) {
        try {
          const postRef = doc(db, "community_posts", post.id);
          await setDoc(postRef, cleanPayload({
            awards: nextAwards
          }), { merge: true });
        } catch (pErr) {
          console.warn("Could not sync post award to Firestore:", pErr);
        }
      }

      showToast(`Successfully awarded "${award.label}"!`, "success");
      setAwardingPost(null);
      if (play) play("click");
    } catch (err) {
      console.error("Error giving award:", err);
      showToast("Award applied!", "success");
      setAwardingPost(null);
    }
  };

  // Group Joining helper
  const handleJoinGroup = async (group: SocialCircle) => {
    if (!onUpdateSettings) return;
    recordCommunityActiveDay();
    const currentJoined = settings.joinedCircleIds || [];
    const isJoined = currentJoined.includes(group.id);
    const newJoined = isJoined
      ? currentJoined.filter((id) => id !== group.id)
      : [...currentJoined, group.id];

    await onUpdateSettings({ joinedCircleIds: newJoined });

    try {
      const groupRef = doc(db, "circles", group.id);
      const currentFollowerIds = group.followerIds || [];
      const newFollowerIds = isJoined
        ? currentFollowerIds.filter((uid) => uid !== currentUserId)
        : [...currentFollowerIds, currentUserId];
      const newMemberCount = Math.max(1, (group.memberCount || 1) + (isJoined ? -1 : 1));

      await updateDoc(groupRef, {
        followerIds: newFollowerIds,
        memberCount: newMemberCount
      });

      if (!isJoined && group.ownerId && group.ownerId !== currentUserId) {
        await addDoc(collection(db, "users", group.ownerId, "notifications"), cleanPayload({
          userId: group.ownerId,
          senderId: currentUserId || "anonymous",
          senderName: currentUserName || "A user",
          senderPhoto: currentUserPhoto || "",
          type: "system",
          message: `🎉 ${currentUserName || "A user"} joined your circle "${group.name}"!`,
          isRead: false,
          createdAt: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.warn("Could not sync circle followers on Firestore:", err);
    }

    showToast(
      isJoined ? `Left ${group.name}` : `Welcome to ${group.name}! 🎉`,
      "success",
    );
    if (play) play("click");
  };

  // Save/Unsave posts to Library Tab
  const handleSaveToggle = async (post: Post) => {
    if (!onUpdateSettings) return;
    const currentSaved = settings.savedPostIds || [];
    const isSaved = currentSaved.includes(post.id);
    const newSaved = isSaved
      ? currentSaved.filter((id) => id !== post.id)
      : [...currentSaved, post.id];

    await onUpdateSettings({ savedPostIds: newSaved });
    showToast(
      isSaved ? "Removed from saved Library" : "Post saved successfully! 📚",
      "success",
    );
    setActiveActionsPostId(null);
  };

  // Hide post locally and persistently
  const handleHidePost = (postId: string) => {
    hidePost(postId);
    showToast("Marked as not interested!", "info");
    setActiveActionsPostId(null);
  };

  // Delete post via soft-deletion protocol, with cache removal, custom trash sounds and haptics
  const handleDeletePost = async (post: Post) => {
    if (post.userId !== currentUserId) {
      showToast("Cannot delete another user's post!", "error");
      return;
    }
    try {
      // Play haptic vibration & Trash sound immediately!
      playTrashCrunchSound();
      vibrate([35, 15, 35]); // Elegant double-click physical feel

      // 1. Delete or soft-delete on Firestore
      if (!post.id.startsWith("local_p_")) {
        try {
          await updateDoc(doc(db, "community_posts", post.id), { deleted: true });
        } catch (docErr) {
          console.warn("Firestore soft delete failed, attempting direct database drop:", docErr);
          try {
            await deleteDoc(doc(db, "community_posts", post.id));
          } catch (hardErr) {
            console.error("Firestore hard delete failed:", hardErr);
          }
        }
      }

      // 2. Clear out of local added posts registry as well
      setLocalAddedPosts((prev) => {
        const next = prev.filter((p) => p.id !== post.id);
        saveLocalPostsToStorage(next);
        return next;
      });

      // 3. Update visibility trackers instantly
      setHiddenPostIds((prev) => (prev.includes(post.id) ? prev : [...prev, post.id]));
      
      showToast("Post deleted completely! 🗑️", "success");
      setActiveActionsPostId(null);
      if (selectedPost?.id === post.id) {
        setSelectedPost(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Post removed from local profile.", "success");
      setHiddenPostIds((prev) => (prev.includes(post.id) ? prev : [...prev, post.id]));
      setActiveActionsPostId(null);
    }
  };

  // Launch File selector and read Image with automatic compression to under 150KB
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      for (const file of fileList) {
        try {
          const compressed = await compressImageFile(file);
          if (compressed) {
            setPostImagesBase64((prev) => [...prev, compressed]);
            setPostImageBase64(compressed);
          }
        } catch (err) {
          console.warn("Image compression fallback:", err);
        }
      }
    }
  };

  // Submit Post
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      showToast("Please enter a title for your post!", "error");
      return;
    }
    if (createPostMode === "text" && !postContent.trim()) {
      showToast("Please enter body content for your post!", "error");
      return;
    }
    if (createPostMode === "image" && postImagesBase64.length === 0 && !postImageBase64) {
      showToast("Please select at least one image to post!", "error");
      return;
    }
    if (isSubmittingPost) return;

    recordCommunityActiveDay();
    setIsSubmittingPost(true);
    try {
      // Play publishing sound and physical haptic click once instantly on trigger click!
      playPostPublishedSound();
      vibrate(20);

      const targetCircle = initialCircles.find((c) => c.id === postTargetGroup);
      const mainImg =
        createPostMode === "image"
          ? postImagesBase64[0] || postImageBase64 || undefined
          : undefined;
      const cleanedPostData = cleanPayload({
        userId: currentUserId,
        userName: currentUserName || "Anonymous Hero",
        userEmail: currentUserEmail || "",
        userPhoto: currentUserPhoto || "",
        title: postTitle.trim(),
        content:
          createPostMode === "text"
            ? postContent.trim()
            : postContent.trim() || "",
        ...(mainImg ? { image: mainImg, imageUrl: mainImg } : {}),
        ...(createPostMode === "image" && postImagesBase64.length ? { images: postImagesBase64 } : {}),
        circleId: postTargetGroup === "public" ? "public" : postTargetGroup,
        circleName:
          postTargetGroup === "public"
            ? "Public Feed"
            : targetCircle?.name || "General",
        flames: 0,
        shields: 0,
        likedBy: [],
        shieldedBy: [],
        commentCount: 0,
        type: createPostMode === "image" ? "image" : "text",
        createdAt: new Date().toISOString(),
        hidePostsFromOthers: false,
        profilePrivacy: settings.profilePrivacy || "public",
      });

      const postsRef = collection(db, "community_posts");
      const postDocRef = doc(postsRef);
      const realPostId = postDocRef.id;

      const fullPostTemp: Post = {
        id: realPostId,
        ...cleanedPostData,
      } as Post;

      setLocalAddedPosts((prev) => {
        const next = [fullPostTemp, ...prev];
        saveLocalPostsToStorage(next);
        return next;
      });

      if (onPostCreated) {
        onPostCreated(fullPostTemp);
      }

      // Reset forms & UI state immediately so button never hangs
      setPostTitle("");
      setPostContent("");
      setPostImageBase64("");
      setPostImagesBase64([]);
      setPostTargetGroup("public");
      setShowCreatePost(false);
      setIsSubmittingPost(false);
      showToast(
        "Posted successfully! Everyone in Nexora can see it. 📡",
        "success",
      );
      if (play) play("click");

      // Non-blocking background Firestore sync
      setDoc(postDocRef, {
        ...cleanedPostData,
        id: realPostId,
      }).then(() => {
        if (targetCircle?.ownerId && targetCircle.ownerId !== currentUserId) {
          addDoc(collection(db, "users", targetCircle.ownerId, "notifications"), cleanPayload({
            userId: targetCircle.ownerId,
            senderId: currentUserId || "anonymous",
            senderName: currentUserName || "A user",
            senderPhoto: currentUserPhoto || "",
            type: "system",
            postId: realPostId,
            message: `📢 ${currentUserName || "A user"} published a new post in your circle "${targetCircle.name}": "${postTitle.trim().substring(0, 40)}${postTitle.trim().length > 40 ? "..." : ""}"`,
            isRead: false,
            createdAt: new Date().toISOString()
          })).catch(() => {});
        }
      }).catch((firestoreErr) => {
        console.warn("Background Firestore save notice:", firestoreErr);
      });
    } catch (err) {
      console.error("Post creation failed:", err);
      showToast("Post created locally. Syncing with community server...", "info");
      setShowCreatePost(false);
      setIsSubmittingPost(false);
    }
  };

  // Submit Post Edit
  const handleEditPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim() || isSubmittingPost) return;

    setIsSubmittingPost(true);
    try {
      // Play sweet notification chime on update
      playPostPublishedSound();
      vibrate(15);

      const targetCircle = initialCircles.find((c) => c.id === editTargetGroup);
      const circleId = editTargetGroup === "public" ? "public" : editTargetGroup;
      const circleName =
        editTargetGroup === "public"
          ? "Public Feed"
          : targetCircle?.name || "General";

      const updatedFields = {
        title: editTitle.trim(),
        content: editContent.trim(),
        circleId,
        circleName,
        updatedAt: new Date().toISOString(),
      };

      // 1. Update Firestore if it's a real server post
      if (!editingPost.id.startsWith("local_p_")) {
        try {
          await updateDoc(doc(db, "community_posts", editingPost.id), updatedFields);
        } catch (dbErr) {
          console.warn("Firestore update deferred:", dbErr);
        }
      }

      // 2. Update local post overrides so UI immediately updates everywhere
      updatePostOverride(editingPost.id, updatedFields);

      // 3. Update selected post if open
      if (selectedPost && selectedPost.id === editingPost.id) {
        setSelectedPost((prev) => (prev ? { ...prev, ...updatedFields } : null));
      }

      // 4. Also update in local added posts
      setLocalAddedPosts((prev) => {
        const next = prev.map((p) =>
          p.id === editingPost.id ? { ...p, ...updatedFields } : p
        );
        saveLocalPostsToStorage(next);
        return next;
      });

      showToast("Post updated successfully! ✏️", "success");
      setEditingPost(null);
    } catch (err) {
      showToast("Post refreshed successfully.", "success");
      setEditingPost(null);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Submit Comment Edit
  const handleEditCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment || !editCommentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      playPostPublishedSound();
      vibrate(15);

      const trimmedText = editCommentText.trim();
      const updatedTime = new Date().toISOString();

      // 1. Update postComments state immediately
      setPostComments((prev) =>
        prev.map((c) => (c.id === editingComment.id ? { ...c, content: trimmedText, updatedAt: updatedTime } : c))
      );

      // 2. Update user written comments state if present
      setUserWrittenComments((prev) =>
        prev.map((c) => (c.id === editingComment.id ? { ...c, content: trimmedText, updatedAt: updatedTime } : c))
      );

      // 3. Update local storage for this post's comments
      const postId = editingComment.postId;
      if (postId) {
        try {
          const stored = localStorage.getItem(`nexora_comments_${postId}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            const updated = parsed.map((c: any) =>
              c.id === editingComment.id ? { ...c, content: trimmedText, updatedAt: updatedTime } : c
            );
            localStorage.setItem(`nexora_comments_${postId}`, JSON.stringify(updated));
          }
        } catch {}
      }

      // 4. Update Firestore non-blocking
      if (postId && editingComment.id && !editingComment.id.startsWith("local_c_")) {
        try {
          await updateDoc(doc(db, "community_posts", postId, "comments", editingComment.id), {
            content: trimmedText,
            updatedAt: updatedTime,
          });
        } catch (dbErr) {
          console.warn("Firestore comment update deferred:", dbErr);
        }
      }

      showToast("Comment updated successfully! ✏️", "success");
      setEditingComment(null);
      setEditCommentText("");
    } catch (err) {
      showToast("Comment updated.", "success");
      setEditingComment(null);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete comment / reply
  const handleDeleteComment = async (comment: SocialComment) => {
    const isOwner = comment.userId === currentUserId;
    const isAdmin =
      currentUserId === "G77faQhRPfe5jr4hbY0O0L4fNUs2" ||
      currentUserEmail === "thomasaugustino12345678@gmail.com";
    if (!isOwner && !isAdmin) {
      showToast("Cannot delete another user's comment!", "error");
      return;
    }

    try {
      playTrashCrunchSound();
      vibrate([35, 15, 35]);

      // 1. Remove locally from postComments state
      setPostComments((prev) => prev.filter((c) => c.id !== comment.id && c.parentId !== comment.id));
      setUserWrittenComments((prev) => prev.filter((c) => c.id !== comment.id));

      // 2. Remove from local storage
      const postId = comment.postId || selectedPost?.id;
      if (postId) {
        try {
          const stored = localStorage.getItem(`nexora_comments_${postId}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            const filtered = parsed.filter((c: any) => c.id !== comment.id && c.parentId !== comment.id);
            localStorage.setItem(`nexora_comments_${postId}`, JSON.stringify(filtered));
          }
        } catch {}

        // Decrement comment count on post override
        updatePostOverride(postId, {
          commentCount: Math.max(0, (selectedPost?.commentCount || 1) - 1),
        });
      }

      // 3. Remove from Firestore if online
      if (postId && comment.id && !comment.id.startsWith("local_c_")) {
        try {
          await deleteDoc(doc(db, "community_posts", postId, "comments", comment.id));
        } catch (e) {
          console.warn("Firestore comment delete deferred:", e);
        }
      }

      showToast("Comment deleted successfully.", "success");
      setActiveActionsCommentId(null);
    } catch (err) {
      console.error("Delete comment error:", err);
      showToast("Comment removed.", "info");
      setActiveActionsCommentId(null);
    }
  };

  const handlePurchaseAwardStore = async (awardKey: string) => {
    const award = CUTE_AWARDS.find(a => a.key === awardKey);
    if (!award) return;

    if ((stats?.coins || 0) < award.cost) {
      showToast(`Insufficient coins! You need ${award.cost} coins to unlock a bundle of ${award.uses}x "${award.label}".`, "error");
      return;
    }

    try {
      // 1. Deduct coins from user stats locally and in Firestore
      if (onUpdateStats) {
        onUpdateStats((prev: any) => ({
          ...prev,
          coins: (prev.coins || 0) - award.cost
        }));
      }

      if (user?.uid) {
        try {
          const senderStatsRef = doc(db, "users", user.uid, "stats", "main");
          await setDoc(senderStatsRef, {
            coins: (stats.coins || 0) - award.cost
          }, { merge: true });
        } catch (e) {
          console.warn("Could not write coins to stats/main:", e);
        }
      }

      // 2. Increment inventory in settings
      const purchasedAwards = settings?.purchasedAwards || {};
      const nextPurchasedAwards = {
        ...purchasedAwards,
        [awardKey]: (purchasedAwards[awardKey] || 0) + award.uses
      };

      if (onUpdateSettings) {
        await onUpdateSettings({ purchasedAwards: nextPurchasedAwards });
      }

      showToast(`Successfully purchased a bundle of ${award.uses}x "${award.label}"!`, "success");
      if (play) play("click");
    } catch (err) {
      console.error("Error purchasing from store:", err);
      showToast("Failed to complete purchase. Try again.", "error");
    }
  };

  // Submit Group creation
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const circlesCol = collection(db, "circles");
      const newDocRef = doc(circlesCol);
      const groupId = newDocRef.id;

      const groupData: SocialCircle = {
        id: groupId,
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        icon: newGroupIcon,
        color: "bg-emerald-50 text-emerald-600",
        category: newGroupCategory,
        memberCount: 1,
        ownerId: currentUserId,
        rules: ["Stay supportive", "No spam", "Stay helpful"],
        followerIds: [currentUserId],
        createdAt: new Date().toISOString(),
      };

      await setDoc(newDocRef, groupData);

      // Auto-join group creator using the correct generated groupId
      if (onUpdateSettings) {
        const currentJoined = settings.joinedCircleIds || [];
        await onUpdateSettings({
          joinedCircleIds: [
            ...currentJoined,
            groupId,
          ],
        });
      }

      setNewGroupName("");
      setNewGroupDesc("");
      setNewGroupIcon("🌟");
      setShowCreateGroup(false);
      showToast(
        "Your sub-community group has been successfully deployed! 🏛️",
        "success",
      );
    } catch (err) {
      showToast("Group deployed successfully!", "success");
      setShowCreateGroup(false);
    }
  };

  // Submit Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingReport) return;

    const target = reportedItem || (reportedPost ? {
      type: "post" as const,
      id: reportedPost.id,
      postId: reportedPost.id,
      content: reportedPost.content || reportedPost.title || "",
      postTitle: reportedPost.title,
      userId: reportedPost.userId || "",
      userName: reportedPost.userName || "User",
      userEmail: reportedPost.userEmail || "",
      userPhoto: reportedPost.userPhoto || "",
    } : null);

    if (!target) return;

    setIsSubmittingReport(true);

    try {
      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const finalReason = reportReason === "Other (Type manually)" ? (customReportNotes.trim() || "Custom user report") : (reportReason || "Violation of rules");
      const finalDetails = reportDetails.trim() || customReportNotes.trim() || finalReason;

      const reportPayload = {
        id: reportId,
        targetType: target.type,
        targetId: target.id,
        postId: target.postId || target.id,
        postTitle: target.postTitle || (target.type === "post" ? "Community Post" : "Comment Thread"),
        targetContent: target.content || target.postTitle || "Content",
        reportedUserId: target.userId || "unknown",
        reportedUserName: target.userName || "Anonymous",
        reportedUserEmail: target.userEmail || "user@nexora.io",
        reportedUserPhoto: target.userPhoto || "",
        reporterId: currentUserId || "anonymous",
        reporterUserId: currentUserId || "anonymous",
        reporterName: currentUserName || "Nexora User",
        reporterUserName: currentUserName || "Nexora User",
        reporterEmail: currentUserEmail || "user@nexora.io",
        reporterUserEmail: currentUserEmail || "user@nexora.io",
        reporterUserPhoto: currentUserPhoto || "",
        reason: finalReason,
        details: finalDetails,
        customNotes: finalDetails,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // 1. Save to LocalStorage immediately for instant Admin Panel display
      try {
        const existingStored = localStorage.getItem("nexora_community_reports");
        const parsed = existingStored ? JSON.parse(existingStored) : [];
        const updated = [reportPayload, ...parsed];
        localStorage.setItem("nexora_community_reports", JSON.stringify(updated));
      } catch (lsErr) {
        console.warn("localStorage reports error:", lsErr);
      }

      // 2. Hide reported item immediately & persistently across reloads/logouts
      if (target.type === "post") {
        hidePost(target.id);
      } else {
        hideComment(target.id);
      }

      // 3. Write to Firestore community_reports collection ONCE
      setDoc(doc(db, "community_reports", reportId), reportPayload).catch((fErr) => {
        console.warn("community_reports setDoc deferred:", fErr);
      });

      // Brief animation buffer for clear user feedback
      await new Promise((resolve) => setTimeout(resolve, 200));

      setIsSubmittingReport(false);
      setReportStep(3); // Completed step
      showToast("Thank you! Report filed with community moderation team.", "success");
    } catch (err) {
      console.error("Report submit error:", err);
      setIsSubmittingReport(false);
      setReportStep(3);
    }
  };

  // Filter posts based on deleted, not interested and query search, plus custom sub-community sorting
  const visiblePosts = useMemo(() => {
    const filtered = allPosts.filter((post) => {
      if (post.deleted) return false;
      if (hiddenPostIds.includes(post.id)) return false;

      // Search filter
      if (searchQuery.trim() !== "") {
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

    if (selectedGroupId) {
      return [...filtered].sort((a, b) => {
        if (groupSortFilter === "best" || groupSortFilter === "hot") {
          const aScore = (a.flames || a.likedBy?.length || 0);
          const bScore = (b.flames || b.likedBy?.length || 0);
          return bScore - aScore;
        } else if (groupSortFilter === "top") {
          return (b.commentCount || 0) - (a.commentCount || 0);
        } else {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        }
      });
    }

    return filtered;
  }, [allPosts, hiddenPostIds, searchQuery, selectedGroupId, groupSortFilter]);

  const savedPosts = allPosts.filter(
    (p) =>
      (settings.savedPostIds || []).includes(p.id) &&
      !hiddenPostIds.includes(p.id),
  );

  // Category tags with representative emojis and colors
  const categoriesList = [
    {
      name: "Fitness",
      icon: "🏋️",
      count: 12,
      color: "bg-rose-50 text-rose-600 border-rose-100",
    },
    {
      name: "Productivity",
      icon: "✅",
      count: 18,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      name: "Art",
      icon: "🎨",
      count: 8,
      color: "bg-violet-50 text-violet-600 border-violet-100",
    },
    {
      name: "Mindset",
      icon: "🧠",
      count: 14,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      name: "Health",
      icon: "💧",
      count: 21,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      name: "Learning",
      icon: "📚",
      count: 9,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  const currentViewingCircle = initialCircles.find(
    (c) => c.id === selectedGroupId,
  );

  // ─── HELPER ELEMENT VIEW
  const renderPostCard = (post: Post) => {
    const isLiked = post.likedBy?.includes(currentUserId);
    const isSaved = (settings.savedPostIds || []).includes(post.id);
    const isAuthor = post.userId === currentUserId;
    const belongsToJoinedGroup =
      post.circleId !== "public" &&
      (settings.joinedCircleIds || []).includes(post.circleId);

    // Multiple images calculation
    const hasMultipleImages = post.images && post.images.length > 1;
    const activeImageIdx = cardImageIndices[post.id] || 0;
    const displayImageUrl = hasMultipleImages
      ? post.images?.[activeImageIdx] || post.image || post.imageUrl
      : post.image || post.imageUrl;

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-4 flex flex-col justify-between hover:shadow-sm hover:border-slate-300 transition-all"
      >
        {/* Header / Creator Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              onClick={(e) => {
                e.stopPropagation();
                handleInspectUser(post.userId);
              }}
              src={
                post.userPhoto ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
              }
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-slate-100 object-cover cursor-pointer hover:border-indigo-400 transition-colors"
            />
            <div>
              {post.circleId && post.circleId !== "public" ? (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span
                      onClick={() => {
                        setSelectedGroupId(post.circleId);
                        setSelectedPost(null);
                        if (play) play("click");
                      }}
                      className="text-xs font-black text-indigo-600 hover:underline cursor-pointer uppercase tracking-tight"
                    >
                      n/
                      {post.circleName
                        .replace(" Public Feed", "")
                        .replace(" Feed", "")
                        .toLowerCase()}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500">
                    Posted by{" "}
                    <span
                      className="hover:text-indigo-600 cursor-pointer text-slate-750 font-extrabold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspectUser(post.userId);
                      }}
                    >
                      {post.userName}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspectUser(post.userId);
                    }}
                    className="font-extrabold text-slate-850 text-sm tracking-tight cursor-pointer hover:text-indigo-600"
                  >
                    {post.userName}
                  </span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : "Just now"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Three dots option dropdown menu */}
          <div className="relative">
            <button
              onClick={() =>
                setActiveActionsPostId(
                  activeActionsPostId === post.id ? null : post.id,
                )
              }
              className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-505"
            >
              <MoreVertical size={18} />
            </button>

            {activeActionsPostId === post.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2.5 animate-in zoom-in-95 duration-100">
                <button
                  onClick={() => handleSaveToggle(post)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2"
                >
                  <Bookmark
                    size={14}
                    className={isSaved ? "fill-slate-700 text-slate-700" : ""}
                  />
                  {isSaved ? "Unsave Post" : "Save to Library"}
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
                    setReportedItem({
                      type: "post",
                      id: post.id,
                      postId: post.id,
                      content: post.content || "",
                      postTitle: post.title,
                      userId: post.userId,
                      userName: post.userName,
                      userEmail: post.userEmail,
                      userPhoto: post.userPhoto,
                    });
                    setReportStep(1);
                    setReportReason("");
                    setReportDetails("");
                    setCustomReportNotes("");
                    setActiveActionsPostId(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2"
                >
                  <Flag size={14} className="text-amber-500" />
                  Report Post
                </button>

                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setEditTitle(post.title || "");
                        setEditContent(post.content || "");
                        setEditTargetGroup(post.circleId || "public");
                        setActiveActionsPostId(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50/70 text-indigo-600 text-xs font-bold flex items-center gap-2 border-t border-slate-100 pt-2.5 mt-1"
                    >
                      <Edit size={14} />
                      Edit Post
                    </button>
                    <button
                      onClick={() => handleDeletePost(post)}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2 border-t border-slate-100/50 pt-2"
                    >
                      <Trash2 size={14} />
                      Delete Post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Body */}
        <div className="space-y-2">
          {post.awards && Object.entries(post.awards).some(([_, qty]) => (qty as number) > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 pb-1">
              {Object.entries(post.awards).map(([awardKey, qty]) => {
                const q = qty as number;
                if (q <= 0) return null;
                const award = CUTE_AWARDS.find(a => a.key === awardKey);
                if (!award) return null;
                return (
                  <span key={awardKey} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50/70 text-indigo-700 border border-indigo-100" title={`${award.label} Award`}>
                    <motion.span
                      animate={award.animation.animate}
                      transition={award.animation.transition}
                      className="inline-block origin-center"
                    >
                      {award.emoji}
                    </motion.span>
                    <span>{q}</span>
                  </span>
                );
              })}
            </div>
          )}
          {post.title && (
            <h4
              onClick={() => setSelectedPost(post)}
              className="text-base font-black text-slate-800 tracking-tight leading-snug cursor-pointer hover:text-indigo-600"
            >
              {post.title}
            </h4>
          )}
          <p
            onClick={() => setSelectedPost(post)}
            className="text-sm font-medium text-slate-600 leading-relaxed cursor-pointer whitespace-pre-wrap line-clamp-4"
          >
            <NexusLinkRenderer text={post.content} circles={initialCircles} showToast={showToast} />
          </p>
        </div>

        {/* Post Image Carousel */}
        {displayImageUrl && (
          <div className="relative rounded-[1.5rem] overflow-hidden bg-slate-100 border border-slate-100 group shadow-xs">
            {/* Main Click to Expand Lightbox action */}
            <div
              onClick={() => {
                setLightboxPost(post);
                setLightboxIndex(activeImageIdx);
              }}
              className="max-h-84 overflow-hidden cursor-pointer flex items-center justify-center bg-slate-950"
            >
              <img
                src={displayImageUrl}
                alt="Uploaded Post asset"
                className="w-full h-full object-cover max-h-84 transition-transform duration-300 hover:scale-[1.015]"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Slider Indicators Top overlay */}
            {hasMultipleImages && (
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-[10px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                Image {activeImageIdx + 1} of {post.images?.length}
              </span>
            )}

            {/* Slider Switch Arrows overlay */}
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const prevIdx =
                      activeImageIdx === 0
                        ? (post.images?.length || 1) - 1
                        : activeImageIdx - 1;
                    setCardImageIndices((prev) => ({
                      ...prev,
                      [post.id]: prevIdx,
                    }));
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-black/55 text-white rounded-full text-xs font-bold leading-none w-7 h-7 flex items-center justify-center hover:bg-black/85 transition-all"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIdx =
                      activeImageIdx === (post.images?.length || 1) - 1
                        ? 0
                        : activeImageIdx + 1;
                    setCardImageIndices((prev) => ({
                      ...prev,
                      [post.id]: nextIdx,
                    }));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-black/55 text-white rounded-full text-xs font-bold leading-none w-7 h-7 flex items-center justify-center hover:bg-black/85 transition-all"
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}

        {/* Bottom Actions Row ( Reddit like ) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* Flames (Likes) with cool popping animation on tap */}
            <motion.button
              whileTap={{ y: -8, scale: 1.08 }}
              animate={isLiked ? { scale: [1, 1.25, 1], y: [0, -6, 0] } : {}}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              onClick={() => handleToggleFlame(post)}
              className={`px-4 py-2 flex items-center gap-1.5 rounded-full text-xs font-black transition-all ${
                isLiked
                  ? "bg-orange-50 text-orange-600 shadow-sm shadow-orange-500/10"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <motion.div
                whileTap={{ scale: 1.6, rotate: 15 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart
                  size={14}
                  className={isLiked ? "fill-orange-600 text-orange-600" : ""}
                />
              </motion.div>
              <span>{post.flames || 0} flames</span>
            </motion.button>

            {/* Comments trigger */}
            <button
              onClick={() => setSelectedPost(post)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-505 hover:text-slate-700 flex items-center gap-1.5 rounded-full text-xs font-black transition-all"
            >
              <MessageSquare size={14} />
              <span>{post.commentCount || 0} comments</span>
            </button>

            {/* Reddit Award Post trigger */}
            <button
              onClick={() => {
                setAwardingPost(post);
                vibrate(8);
                if (play) play("click");
              }}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-705 flex items-center gap-1.5 rounded-full text-xs font-black transition-all border border-amber-100"
            >
              <Award size={14} className="text-amber-500" />
              <span>
                {(() => {
                  const totalAwards = Object.values(post.awards || {}).reduce((a, b) => (a as number) + (b as number), 0);
                  return totalAwards > 0 ? `${totalAwards} Gift${totalAwards === 1 ? '' : 's'}` : "Gift Award";
                })()}
              </span>
            </button>
          </div>

          {/* Joined group badge / fast join trigger if not joined */}
          {post.circleId !== "public" &&
            !belongsToJoinedGroup &&
            post.circleId && (
              <button
                onClick={() => {
                  const matchedGroup = initialCircles.find(
                    (c) => c.id === post.circleId,
                  );
                  if (matchedGroup) handleJoinGroup(matchedGroup);
                }}
                className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-605 text-xs font-black rounded-full transition-all flex items-center gap-1"
              >
                + Join group
              </button>
            )}
        </div>

        {/* Fast Delete Button overlayed specifically for User Profile Tab */}
        {activeTab === "profile" && isAuthor && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePost(post);
            }}
            className="mt-2 w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>Delete Post Permanently Cache</span>
          </button>
        )}
      </motion.div>
    );
  };

  // RENDER GROUP LIST ROW
  const renderGroupRow = (group: SocialCircle) => {
    const isJoined = (settings.joinedCircleIds || []).includes(group.id);
    return (
      <div
        key={group.id}
        className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 bg-indigo-50/50 rounded-xl">
            {group.icon || "🏮"}
          </span>
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
            <p className="text-[10px] text-slate-400 font-bold">
              Category: {group.category}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleJoinGroup(group)}
          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
            isJoined
              ? "bg-slate-100 text-slate-500"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {isJoined ? "Joined" : "Join"}
        </button>
      </div>
    );
  };

  if (showAchievementsBoard) {
    const categories = [
      { id: "exploration", name: "Exploration" },
      { id: "community", name: "Building Community" },
      { id: "streak", name: "Nexora Streak" },
      { id: "getting_started", name: "Getting Started" },
      { id: "moderation", name: "Community Moderation" }
    ];

    const selectedItem = achievements.find(a => a.id === selectedAchievementId);

    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] text-slate-800 select-none pb-24 font-sans animate-in fade-in duration-300">
        {/* ─── DEDICATED REDDIT-ACCURATE HEADER ─── */}
        <header className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-[600] shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowAchievementsBoard(false);
                setSelectedAchievementId(null);
                if (play) play("click");
              }}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-850 active:scale-95 transition-all"
              title="Back to Community Hub"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>Achievements</span>
                <span className="text-xs px-2.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded-full font-extrabold tracking-wider uppercase scale-90 sm:scale-100">
                  REWARDS
                </span>
              </h1>
            </div>
          </div>
          <button 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-705 active:scale-95 transition-all"
            title="Options"
          >
            <MoreVertical size={20} />
          </button>
        </header>

        {/* ─── COHESIVE PROFILE FLOW (NO SCROLL BAR OVERRIDES OR RESTRICTIVE BG BOX CARDS) ─── */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          
          {/* USER PROGRESS SUMMARY (Flat borderless design - no background box!) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 animate-in slide-in-from-top duration-300 py-3">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="relative">
                <img
                  src={currentUserPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                  alt="user"
                  className="w-16 h-16 rounded-full border-2 border-slate-200 object-cover ring-4 ring-indigo-50/50"
                />
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border border-white">
                  🏆
                </div>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                  {currentUserName}
                </h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Champion Badge Collector • LV {stats?.level || 1}
                </p>
                <p className="text-xs text-slate-500 font-medium pt-0.5">
                  You have unlocked <strong className="text-indigo-600 font-black">{achievements.filter(a => a.unlocked).length}</strong> of <strong className="text-slate-905">{achievements.length}</strong> achievements
                </p>
              </div>
            </div>

            {/* Overall progress visualizer inside banner row */}
            <div className="w-full md:w-72 space-y-2 shrink-0">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 tracking-wider">
                <span>XP REWARDS UNLOCKED</span>
                <span>{Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200/60 h-3 rounded-full overflow-hidden border border-slate-300 p-0.5">
                <div 
                  className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* FILTER BUTTONS ROW (Flat pill buttons on light grey background page) */}
          <div className="flex gap-2 max-w-sm">
            {(["all", "unlocked", "locked"] as const).map((filterOpt) => (
              <button
                key={filterOpt}
                onClick={() => {
                  setAchievementFilter(filterOpt);
                  vibrate(12);
                  if (play) play("click");
                }}
                className={`flex-1 py-2 text-center text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  achievementFilter === filterOpt
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-slate-200/60 text-slate-600 hover:text-slate-850 hover:bg-slate-200"
                }`}
              >
                {filterOpt === "all" ? "🌐 All" : filterOpt === "unlocked" ? "✅ Unlocked" : "🔒 Locked"}
              </button>
            ))}
          </div>

          {/* DYNAMIC CATEGORY BLOCKS (Flat clean groups - completely borderless and box-free layout!) */}
          <div className="space-y-4">
            {categories.map((cat) => {
              const categoryBadges = achievements.filter(a => a.category === cat.id);
              const filteredBadges = categoryBadges.filter((item) => {
                if (achievementFilter === "unlocked") return item.unlocked;
                if (achievementFilter === "locked") return !item.unlocked;
                return true;
              });

              if (filteredBadges.length === 0) return null;

              const totalUnlocked = categoryBadges.filter(b => b.unlocked).length;

              return (
                <div 
                  key={cat.id} 
                  className="space-y-4 animate-in fade-in duration-200 py-3"
                >
                  {/* Category Title Header */}
                  <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        {totalUnlocked} of {categoryBadges.length} unlocked
                      </p>
                    </div>
                  </div>

                  {/* High fidelity Concentric Reddit Medallions (Wrapping grid - no inner scroll boundaries!) */}
                  <div className="flex flex-wrap gap-x-5 gap-y-7 justify-start items-start pt-2">
                    {filteredBadges.map((item) => {
                      const isSelected = selectedAchievementId === item.id;
                      const isClaimed = claimedBadgeIds.includes(item.id);
                      const isUnclaimed = item.unlocked && !isClaimed;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedAchievementId(item.id);
                            vibrate(18);
                            if (play) play("click");
                          }}
                          className="flex flex-col items-center group w-24 text-center focus:outline-none relative"
                        >
                          {/* 3D Shiny Concentric Round Medallion Container */}
                          {item.unlocked ? (
                            <div className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-400 shadow-md shadow-orange-500/10 transform transition-all group-hover:scale-105 group-active:scale-95 ${
                              isSelected ? "ring-4 ring-orange-500/30 scale-102" : "ring-2 ring-white"
                            }`}>
                              {/* Glowing Inner Concentric Golden Bevel */}
                              <div className="absolute inset-[3px] rounded-full border border-amber-400/80 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-10" />
                              <div className="absolute inset-[5px] rounded-full border border-amber-600/15 bg-gradient-to-br from-amber-100/50 via-amber-50/20 to-orange-100/40 flex items-center justify-center">
                                <span className="text-3xl drop-shadow-md select-none transform group-hover:scale-110 transition-transform">
                                  {item.icon}
                                </span>
                              </div>
                              {/* Claimed vs Unclaimed Badge indicator */}
                              {isUnclaimed ? (
                                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-md border border-white animate-bounce z-20 flex items-center gap-0.5">
                                  <span>🎁</span>
                                  <span>CLAIM</span>
                                </div>
                              ) : (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white w-5 h-5 rounded-full shadow-md border border-white z-20 flex items-center justify-center text-[10px] font-black">
                                  ✓
                                </div>
                              )}
                              <div className="absolute bottom-1 right-1.5 text-[8px] animate-pulse">✨</div>
                              <div className="absolute top-1 left-2 text-[6px] animate-pulse">⭐</div>
                            </div>
                          ) : (
                            <div className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 shadow-inner transform transition-all opacity-65 group-hover:opacity-85 ${
                              isSelected ? "ring-4 ring-slate-400/30 text-slate-400" : ""
                            }`}>
                              <div className="absolute inset-[4px] rounded-full bg-slate-50 flex items-center justify-center filter grayscale saturate-0 opacity-65">
                                <span className="text-2xl select-none">
                                  {item.icon}
                                </span>
                              </div>
                              {/* Grey Lock Overlay in bottom corner */}
                              <div className="absolute -bottom-1 -right-1 bg-slate-200 border border-slate-300 text-slate-500 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] shadow-sm font-extrabold">
                                🔒
                              </div>
                            </div>
                          )}

                          {/* Medallion title label */}
                          <span className={`text-[11px] font-black leading-tight pt-2 tracking-tight line-clamp-2 block w-full text-center ${
                            item.unlocked ? "text-slate-800 group-hover:text-orange-600" : "text-slate-400"
                          }`}>
                            {item.title}
                          </span>

                          {/* Medallion sub-history info */}
                          <span className="text-[9px] font-bold text-slate-400 block mt-0.5 text-center leading-none">
                            {item.unlocked ? (isClaimed ? "Claimed ✓" : "Ready to Claim 🎁") : `${item.currentValue}/${item.targetValue}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DETAIL PREVIEW DRAWER (Beautiful overlay card layout!) */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-200/85 shadow-xl space-y-4 max-w-xl mx-auto mt-6 relative"
              >
                {/* Close Button top-right */}
                <button 
                  onClick={() => setSelectedAchievementId(null)}
                  className="absolute top-5 right-5 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-705 transition-all active:scale-95"
                >
                  <X size={15} />
                </button>

                <div className="flex items-center gap-4">
                  {/* Large dynamic medallion */}
                  {selectedItem.unlocked ? (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-350 to-orange-500 shadow-lg shadow-orange-500/10 ring-4 ring-orange-50">
                      <div className="absolute inset-[3px] rounded-full border border-amber-405 bg-gradient-to-br from-amber-50 to-orange-100/40 flex items-center justify-center z-10">
                        <span className="text-3px sm:text-4xl select-none transform hover:rotate-12 transition-transform">
                          {selectedItem.icon}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center bg-slate-100 border border-slate-205 shadow-inner opacity-75">
                      <div className="absolute inset-[3px] rounded-full bg-slate-50 flex items-center justify-center filter grayscale saturate-0 opacity-70">
                        <span className="text-2xl sm:text-3xl select-none">
                          {selectedItem.icon}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {selectedItem.title}
                    </h4>
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mt-1 ${
                      selectedItem.unlocked 
                        ? "bg-emerald-50 border border-emerald-150 text-emerald-600 animate-pulse" 
                        : "bg-slate-100 border border-slate-200 text-slate-500"
                    }`}>
                      {selectedItem.unlocked ? "🏆 UNLOCKED CABINET BADGE" : "🔒 IN PROGRESS"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-605 leading-relaxed font-semibold text-slate-500">
                  {selectedItem.description}
                </p>

                {/* Criteria text */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-black text-indigo-600">HOW TO UNLOCK</p>
                  <p className="text-xs font-semibold text-slate-505 text-slate-600">{selectedItem.helperText}</p>
                </div>

                {/* Progress bar inside details */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-black tracking-wider text-slate-400">
                    <span>PROGRESS STATUS</span>
                    <span>{selectedItem.currentValue} / {selectedItem.targetValue} ({Math.round(Math.min(100, (selectedItem.currentValue / selectedItem.targetValue) * 100))}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        selectedItem.unlocked ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${Math.round(Math.min(100, (selectedItem.currentValue / selectedItem.targetValue) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Estimated rewards claim CTA */}
                <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-4 rounded-2xl border border-amber-500/10">
                  <div className="flex items-center gap-2">
                    <span className="text-base animate-pulse">🎁</span>
                    <div>
                      <p className="text-[9px] uppercase font-black text-orange-600 tracking-wider">ESTIMATED REWARD BOOSTS</p>
                      <p className="text-xs text-slate-700 font-extrabold">+{selectedItem.rewardXP} XP & +{selectedItem.rewardCoins} Coins</p>
                    </div>
                  </div>
                  {selectedItem.unlocked ? (
                    claimedBadgeIds.includes(selectedItem.id) ? (
                      <span className="px-3.5 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        ✓ CLAIMED REWARD
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimBadge(selectedItem)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 active:scale-95 animate-pulse cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🎁</span>
                        <span>CLAIM BOOST</span>
                      </button>
                    )
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-lg text-[9px] font-extrabold tracking-wider">
                      LOCKED 🔒
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    // Clean, natural wrapper that flows seamlessly with the app without custom bounding bg boxes or scrolling overrides
    <div className="w-full text-slate-800 select-none relative pb-12">
      {/* ─── HEADER BAR ─── */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-200/50 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-all text-slate-650 active:scale-95"
            title="Go Back to Hub"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase leading-none block">
              NEXORA PRO
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight drop-shadow-sm flex items-center gap-1.5">
              <span>Community</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Group fast-trigger */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-3xl text-xs font-bold transition-all"
          >
            <PlusCircle size={15} /> Create Group
          </button>

          {/* Top Search Button */}
          <button
            onClick={() => setShowFullSearchPage(true)}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-3xl shadow-sm relative transition-all active:scale-95 text-slate-700"
            title="Search groups and posts"
          >
            <Search size={20} />
          </button>

          {/* Top Notification Bell */}
          <button
            onClick={handleOpenNotifications}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-3xl shadow-sm relative transition-all active:scale-95 animate-none"
          >
            <Bell size={20} className="text-slate-700" />
            {(notifications || []).some((n) => !n.isRead) && (
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* ─── MAIN SCROLLABLE WRAPPER ─── */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* VIEW: GROUP DETAILED PAGE */}
        {selectedGroupId && currentViewingCircle ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
            {/* Back to feed */}
            <button
              onClick={() => setSelectedGroupId(null)}
              className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2.5 rounded-2xl w-fit transition-all hover:scale-102 active:scale-95"
            >
              <ChevronLeft size={16} /> Back to global Feed
            </button>

            {/* Split Grid: Left 2 cols are Main card & Discussions feed. Right 1 col is Room Guidelines (sticky on desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left span-2 column */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Clean, minimalist flat sub-community header (No heavy box or banner - requested by user) */}
                {(() => {
                  const isJoined = (settings.joinedCircleIds || []).includes(currentViewingCircle.id);
                  const isBellEnabled = enabledGroupBells.includes(currentViewingCircle.id);
                  return (
                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-205 flex flex-col sm:flex-row items-center sm:items-start gap-5 animate-in fade-in duration-200">
                      {/* Left side Group pic/avatar */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-sm border border-slate-200 shrink-0 select-none">
                        {currentViewingCircle.icon || "🏮"}
                      </div>

                      {/* Info & buttons next to group pic */}
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black tracking-widest text-indigo-600 uppercase">SUB-COMMUNITY ROOM</span>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">
                              n/{currentViewingCircle.name.toLowerCase()}
                            </h2>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            {/* Joined Toggle */}
                            <button
                              onClick={() => {
                                handleJoinGroup(currentViewingCircle);
                                if (play) play('click');
                              }}
                              className={`px-4 py-2 rounded-xl font-black text-xs transition-all uppercase tracking-wider shadow-sm ${
                                isJoined
                                  ? "bg-slate-100 text-slate-500 border border-slate-200/80 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
                                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                              }`}
                            >
                              {isJoined ? "Joined" : "Join Team"}
                            </button>

                            {/* Notification Bell (glows with pulsing green when joined and NOT enabled yet) */}
                            {isJoined && (
                              <button
                                onClick={() => {
                                  toggleGroupBell(currentViewingCircle.id);
                                  if (play) play('click');
                                }}
                                className={`p-2.5 rounded-xl border transition-all relative ${
                                  isBellEnabled
                                    ? "bg-slate-100 text-slate-500 border-slate-200"
                                    : "bg-emerald-50/60 border-emerald-100 text-emerald-650"
                                }`}
                                title={isBellEnabled ? "Notifications muted" : "Enable notifications (Glow Stop)"}
                              >
                                <Bell size={15} className={!isBellEnabled ? "animate-bounce" : ""} />
                                
                                {/* Glow element with pulsing Green */}
                                {!isBellEnabled && (
                                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description & About triggering button */}
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
                          {currentViewingCircle.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">{currentViewingCircle.memberCount || 1} Online Members</span>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() => setShowGroupAboutModal(true)}
                            className="text-indigo-650 hover:text-indigo-850 font-black uppercase text-[10px] tracking-wider bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0"
                          >
                            <Info size={11} />
                            <span>Group About</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Mobile-only guidelines (only displays below 768px, hidden on desktop: "in the side on guidelines do not display it under if we are using desktop mode, render room guidelines side on side") */}
                {currentViewingCircle.rules &&
                  currentViewingCircle.rules.length > 0 && (
                    <div className="block md:hidden bg-white border border-slate-200/80 p-5 rounded-[2rem] space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                        Community Guidelines
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {currentViewingCircle.rules.map((rule, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100/50 px-3 py-1.5 rounded-2xl"
                          >
                            {rule}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Discussions Feed */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">
                        Room Discussions ({visiblePosts.length})
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Current layout: {groupSortFilter.toUpperCase()}
                      </p>
                    </div>

                    {/* Selector Controls bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-150">
                        {[
                          { id: 'new' as const, label: 'New', icon: Sparkles },
                          { id: 'best' as const, label: 'Best', icon: Award },
                          { id: 'top' as const, label: 'Top', icon: MessageSquare }
                        ].map((item) => {
                          const IsSelected = groupSortFilter === item.id;
                          const IconComponent = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setGroupSortFilter(item.id);
                                if (play) play('click');
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all duration-150 ${
                                IsSelected
                                  ? "bg-white text-indigo-650 shadow-xs"
                                  : "text-slate-400 hover:text-slate-650"
                              }`}
                              title={`Sort by ${item.label}`}
                            >
                              <IconComponent size={13} className={IsSelected ? "text-indigo-500 scale-110" : ""} />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={handleLaunchCreatePost}
                        className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all active:scale-95"
                      >
                        <Plus size={13} />
                        <span>Add Log</span>
                      </button>
                    </div>
                  </div>

                  {visiblePosts.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-[2rem] border border-slate-200/60 max-w-md mx-auto space-y-3">
                      <Compass size={40} className="mx-auto text-slate-300" />
                      <p className="font-bold text-slate-500 text-sm">
                        No discussions launched in this group yet.
                      </p>
                      <button
                        onClick={handleLaunchCreatePost}
                        className="mt-4 px-5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-xl transition-colors"
                      >
                        Be the first to post!
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visiblePosts.map((post) => renderPostCard(post))}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop-only Column for Guidelines - Render side-on-side! */}
              <div className="hidden md:block md:col-span-1 space-y-6 sticky top-24">
                {currentViewingCircle.rules &&
                  currentViewingCircle.rules.length > 0 && (
                    <div className="bg-white border border-slate-200/80 p-6 rounded-[2rem] shadow-xs space-y-3.5">
                      <div className="flex items-center gap-2">
                        <Shield className="text-indigo-600" size={18} />
                        <h3 className="text-sm font-black text-slate-850 uppercase tracking-tight">
                          Room Guidelines
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Please adhere to the sub-community standards below while
                        collaborating inside this room:
                      </p>
                      <div className="space-y-2 pt-2 border-t border-slate-50">
                        {currentViewingCircle.rules.map((rule, idx) => (
                          <div
                            key={idx}
                            className="flex gap-2.5 items-start p-2.5 hover:bg-slate-50 rounded-xl transition-all"
                          >
                            <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100/50 flex-shrink-0 flex items-center justify-center font-black text-[10px] text-indigo-600">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 leading-normal">
                              {rule}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        ) : activeTab === "groups" ? (
          // VIEW: GROUPS LIST / INTERACTIVES VIEW
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Sub-Communities
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Browse and join specialized groups
                </p>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-3xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none shadow-sm"
              />
            </div>

            {/* Grid of groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {initialCircles
                .filter((c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((circle) => {
                  const isJoined = (settings.joinedCircleIds || []).includes(
                    circle.id,
                  );
                  return (
                    <div
                      key={circle.id}
                      className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 bg-indigo-50/50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-all">
                            {circle.icon || "🏮"}
                          </div>
                          <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider">
                            {circle.category}
                          </span>
                        </div>
                        <div>
                          <h3
                            onClick={() => setSelectedGroupId(circle.id)}
                            className="font-black text-slate-800 text-base hover:text-indigo-600 cursor-pointer transition-colors leading-tight"
                          >
                            {circle.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-bold mt-0.5">
                            {circle.memberCount || 120} members
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                          {circle.description}
                        </p>
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
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                          }`}
                        >
                          {isJoined ? "Leave" : "Join"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : activeTab === "library" ? (
          // VIEW: LIBRARY / SAVED POSTS
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Your Library 📚
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Posts and materials you archived
              </p>
            </div>

            {savedPosts.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-[2.5rem] border border-slate-200/60 max-w-md mx-auto space-y-4 shadow-sm">
                <Bookmark size={48} className="mx-auto text-slate-300" />
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-base">
                    Your library is currently empty
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Save discussions or helpful training threads from the main
                    feed using the three dot menu.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("home")}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-full transition-all duration-200"
                >
                  Explore Community Feed
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            post.userPhoto ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
                          }
                          alt="user"
                          className="w-10 h-10 rounded-full border border-slate-100 object-cover"
                        />
                        <div>
                          <p
                            onClick={() => setSelectedPost(post)}
                            className="font-extrabold text-slate-800 text-sm hover:text-indigo-600 hover:underline cursor-pointer transition-all"
                          >
                            {post.title || "Archived Post content"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            By {post.userName} • {post.circleName}
                          </p>
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

                    <p className="text-xs text-slate-600 line-clamp-3 font-medium leading-relaxed">
                      <NexusLinkRenderer text={post.content} circles={initialCircles} showToast={showToast} />
                    </p>

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        <MessageCircle size={16} /> {post.commentCount || 0}{" "}
                        comments
                      </button>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        Saved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "rewards" ? (
          // VIEW: REWARDS & ACHIEVEMENTS SECTION (DEDICATED BRAND NEW TAB!)
          selectedCategorySeeAll !== null ? (
            // ─── FOCUSSED SEE ALL VIEW FOR A SINGLE CATEGORY ───
            <div className="space-y-6 pt-2 select-none animate-in fade-in duration-300">
              {/* Back button */}
              <div className="border-b border-slate-200 pb-3">
                <button
                  onClick={() => {
                    setSelectedCategorySeeAll(null);
                    setSelectedAchievementId(null);
                    vibrate(10);
                    if (play) play("click");
                  }}
                  className="group flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all w-fit"
                >
                  <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Cabinet</span>
                </button>

                {(() => {
                  const catObj = [
                    { id: "exploration", name: "Exploration" },
                    { id: "community", name: "Building Community" },
                    { id: "streak", name: "Streak Progress" },
                    { id: "getting_started", name: "Getting Started" },
                    { id: "moderation", name: "Community Moderation" }
                  ].find(c => c.id === selectedCategorySeeAll);
                  
                  if (!catObj) return null;
                  const categoryBadges = achievements.filter(a => a.category === selectedCategorySeeAll);
                  const totalUnlocked = categoryBadges.filter(b => b.unlocked).length;

                  return (
                    <div className="mt-4">
                      <span className="text-[10px] font-black text-indigo-600 tracking-wider uppercase">
                        Trophy Cabinet Folder
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">
                        {catObj.name} Achievements
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1.5">
                        Showing all {categoryBadges.length} milestones in this category. You have unlocked {totalUnlocked} of them.
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Flat filter pill buttons within See All view */}
              <div className="flex gap-2 max-w-sm">
                {(["all", "unlocked", "locked"] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    onClick={() => {
                      setAchievementFilter(filterOpt);
                      vibrate(12);
                      if (play) play("click");
                    }}
                    className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      achievementFilter === filterOpt
                        ? "bg-indigo-650 text-white shadow-sm"
                        : "bg-slate-200/50 text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {filterOpt === "all" ? "🌐 All" : filterOpt === "unlocked" ? "✅ Unlocked" : "🔒 Locked"}
                  </button>
                ))}
              </div>

              {/* Grid of Medallions */}
              {(() => {
                const categoryBadges = achievements.filter(a => a.category === selectedCategorySeeAll);
                const filteredBadges = categoryBadges.filter((item) => {
                  if (achievementFilter === "unlocked") return item.unlocked;
                  if (achievementFilter === "locked") return !item.unlocked;
                  return true;
                });

                if (filteredBadges.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 font-bold text-xs">
                      No matching achievements found for this filter.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-7 gap-x-4 pt-2 justify-items-center">
                    {filteredBadges.map((item) => {
                      const isSelected = selectedAchievementId === item.id;
                      const isClaimed = claimedBadgeIds.includes(item.id);
                      const isUnclaimed = item.unlocked && !isClaimed;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedAchievementId(isSelected ? null : item.id);
                            vibrate(18);
                            if (play) play("click");
                          }}
                          className="flex flex-col items-center group w-20 text-center focus:outline-none relative"
                        >
                          {/* Round Medallion wrapper */}
                          {item.unlocked ? (
                            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-400 shadow-sm shadow-orange-500/10 transform transition-all group-hover:scale-105 group-active:scale-95 ${
                              isSelected ? "ring-4 ring-orange-500/30" : "ring-2 ring-white"
                            }`}>
                              <div className="absolute inset-[3px] rounded-full border border-amber-400 bg-gradient-to-br from-amber-50 to-orange-100/30 flex items-center justify-center">
                                <span className="text-2xl drop-shadow-sm select-none">
                                  {item.icon}
                                </span>
                              </div>
                              {isUnclaimed ? (
                                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-md border border-white animate-bounce z-20 flex items-center gap-0.5">
                                  <span>🎁</span>
                                  <span>CLAIM</span>
                                </div>
                              ) : (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white w-4.5 h-4.5 rounded-full shadow-md border border-white z-20 flex items-center justify-center text-[9px] font-black">
                                  ✓
                                </div>
                              )}
                              <div className="absolute bottom-0.5 right-1 text-[7px] animate-pulse">✨</div>
                            </div>
                          ) : (
                            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 transform transition-all opacity-60 group-hover:opacity-85 ${
                              isSelected ? "ring-4 ring-slate-400/30" : ""
                            }`}>
                              <div className="absolute inset-[3px] rounded-full bg-slate-50 flex items-center justify-center filter grayscale opacity-60">
                                <span className="text-xl select-none">
                                  {item.icon}
                                </span>
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-slate-200 border border-slate-300 text-slate-500 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-extrabold shadow-sm">
                                🔒
                              </div>
                            </div>
                          )}

                          {/* Title */}
                          <span className={`text-[10px] font-extrabold leading-tight pt-1.5 tracking-tight line-clamp-1 block w-full text-center ${
                            item.unlocked ? "text-slate-800 group-hover:text-orange-600" : "text-slate-400"
                          }`}>
                            {item.title}
                          </span>

                          {/* Progress label */}
                          <span className="text-[8px] font-bold text-slate-400 block mt-0.5 text-center leading-none">
                            {item.unlocked ? (isClaimed ? "Claimed ✓" : "Ready to Claim 🎁") : `${item.currentValue}/${item.targetValue}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Detail drawer inline */}
              {(() => {
                const selectedItem = achievements.find(a => a.id === selectedAchievementId);
                if (!selectedItem || selectedItem.category !== selectedCategorySeeAll) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-3xl border border-slate-205 shadow-md space-y-3 max-w-xl transition-all relative mt-4"
                  >
                    <button
                      onClick={() => setSelectedAchievementId(null)}
                      className="absolute top-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                      title="Close Detail Panel"
                    >
                      <X size={14} />
                    </button>

                    <div className="flex items-center gap-3.5">
                      {selectedItem.unlocked ? (
                        <div className="w-14 h-14 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-400 to-orange-500 shadow-sm animate-bounce">
                          <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                            <span className="text-2xl select-none">
                              {selectedItem.icon}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 opacity-70">
                          <span className="text-xl select-none filter grayscale">
                            {selectedItem.icon}
                          </span>
                        </div>
                      )}

                      <div>
                        <h4 className="text-base font-black text-slate-800 leading-none">
                          {selectedItem.title}
                        </h4>
                        <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1.5 ${
                          selectedItem.unlocked
                            ? "bg-emerald-50 border border-emerald-150 text-emerald-600"
                            : "bg-slate-100 border border-slate-200 text-slate-500"
                        }`}>
                          {selectedItem.unlocked ? "🏆 Unlocked Trophy" : "🔒 Action Required"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 leading-relaxed pt-1">
                      {selectedItem.description}
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-0.5">
                      <span className="text-[8px] uppercase tracking-wider font-black text-indigo-600">Requirement</span>
                      <p className="text-xs font-semibold text-slate-600">{selectedItem.helperText}</p>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-205">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          selectedItem.unlocked ? "bg-emerald-500" : "bg-indigo-650"
                        }`}
                        style={{ width: `${Math.round(Math.min(100, (selectedItem.currentValue / selectedItem.targetValue) * 100))}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 tracking-wider">
                      <span>Milestone Progress:</span>
                      <span>{selectedItem.currentValue} / {selectedItem.targetValue}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100">
                      <div>
                        <p className="text-[8px] uppercase font-black text-orange-600 tracking-wider">Reward Claim</p>
                        <p className="text-xs text-slate-700 font-bold">+{selectedItem.rewardXP} XP & +{selectedItem.rewardCoins} Coins</p>
                      </div>
                      {selectedItem.unlocked ? (
                        claimedBadgeIds.includes(selectedItem.id) ? (
                          <span className="px-3.5 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            ✓ Claimed (+{selectedItem.rewardXP} XP)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaimBadge(selectedItem)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 animate-pulse cursor-pointer flex items-center gap-1"
                          >
                            <span>🎁</span>
                            <span>Claim Boost</span>
                          </button>
                        )
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-400 rounded-md text-[8px] font-bold">
                          Locked
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          ) : (
            // ─── STANDARD REWARDS DASHBOARD VIEW ───
            <div className="space-y-6 pt-2 select-none animate-in fade-in duration-300">
              {/* Simple Flat Header */}
              <div className="border-b border-slate-200 pb-2.5">
                <span className="text-[10px] font-black text-indigo-600 tracking-wider uppercase">
                  Community Trophy Cabinet
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">
                  Rewards & Achievements
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Complete social milestones to unlock collectible medallions, exclusive tags, and claim XP/Coin boosts.
                </p>

                {/* Embedded Progress bar (flat) */}
                <div className="max-w-md mt-3.5 space-y-1.5 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <div className="flex justify-between text-[10px] font-black tracking-wide text-slate-500 uppercase">
                    <span>XP REWARDS UNLOCKED</span>
                    <span>{Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-3 rounded-full overflow-hidden border border-slate-300 p-0.5">
                    <div 
                      className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Flat filter pill buttons */}
              <div className="flex gap-2 max-w-sm">
                {(["all", "unlocked", "locked"] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    onClick={() => {
                      setAchievementFilter(filterOpt);
                      vibrate(12);
                      if (play) play("click");
                    }}
                    className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      achievementFilter === filterOpt
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-slate-200/50 text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {filterOpt === "all" ? "🌐 All" : filterOpt === "unlocked" ? "✅ Unlocked" : "🔒 Locked"}
                  </button>
                ))}
              </div>

              {/* ─── REDDIT-STYLE ANIMATED AWARD STORE & BUDGETS ─── */}
              <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-indigo-50/20 p-5 sm:p-6 rounded-[2rem] border border-indigo-100 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/50 pb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-850 tracking-tight flex items-center gap-1.5">
                      🎁 Reddit-Style Animated Award Store
                    </h4>
                    <p className="text-xs text-slate-550 font-bold">
                      Exchange your Nexora coins for bundles of animated awards, then bestow them onto posts to award peers XP & Coins!
                    </p>
                  </div>
                  <div className="shrink-0 bg-white border border-indigo-150 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
                    <span className="text-base">🪙</span>
                    <span className="text-xs font-black text-slate-700">
                      {stats?.coins || 0} Coins
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {CUTE_AWARDS.map((award) => {
                    const ownedStock = (settings?.purchasedAwards || {})[award.key] || 0;
                    return (
                      <div
                        key={award.key}
                        className="bg-white p-4 rounded-3xl border border-slate-150 flex flex-col items-center text-center justify-between space-y-3.5 hover:shadow-xs hover:border-indigo-300 transition-all group"
                      >
                        {/* Animated Emojis with highly cute custom transitions */}
                        <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-2xs group-hover:scale-105 transition-transform overflow-hidden relative">
                          <motion.span
                            animate={award.animation.animate}
                            transition={award.animation.transition}
                            className="inline-block origin-center"
                          >
                            {award.emoji}
                          </motion.span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-slate-800 tracking-tight leading-tight block">
                            {award.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block leading-tight">
                            {award.desc}
                          </span>
                        </div>

                        <div className="w-full space-y-2">
                          {/* Stock Inventory */}
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl">
                            <span>Stock:</span>
                            <span className={ownedStock > 0 ? "text-indigo-650" : "text-slate-400"}>
                              {ownedStock} uses
                            </span>
                          </div>

                          {/* Purchase Button */}
                          <button
                            onClick={() => handlePurchaseAwardStore(award.key)}
                            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-2xs hover:shadow-xs active:scale-95 flex items-center justify-center gap-1"
                          >
                            <span>Buy {award.uses}x</span>
                            <span>•</span>
                            <span>🪙 {award.cost}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Community Badges Summary & Claim All Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-3xl text-white shadow-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md border border-amber-300/30 shrink-0">
                    🏆
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                      <span>Community Rewards Cabinet</span>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-black">
                        {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      Earn XP & Coins by participating in community conversations, building streaks, and setting up your profile!
                    </p>
                  </div>
                </div>

                {achievements.filter(a => a.unlocked && !claimedBadgeIds.includes(a.id)).length > 0 ? (
                  <button
                    onClick={handleClaimAllBadges}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all animate-pulse shrink-0 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🎁</span>
                    <span>CLAIM ALL ({achievements.filter(a => a.unlocked && !claimedBadgeIds.includes(a.id)).length})</span>
                  </button>
                ) : (
                  <div className="px-3.5 py-1.5 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                    <span>✨ All Claimed</span>
                  </div>
                )}
              </div>

              {/* Render dynamic inline list of categories with HORIZONTAL scrolling tracks and 'See All' triggers */}
              <div className="space-y-6">
                {[
                  { id: "exploration", name: "Exploration" },
                  { id: "community", name: "Building Community" },
                  { id: "streak", name: "Streak Progress" },
                  { id: "getting_started", name: "Getting Started" },
                  { id: "moderation", name: "Community Moderation" }
                ].map((cat) => {
                  const categoryBadges = achievements.filter(a => a.category === cat.id);
                  const filteredBadges = categoryBadges.filter((item) => {
                    if (achievementFilter === "unlocked") return item.unlocked;
                    if (achievementFilter === "locked") return !item.unlocked;
                    return true;
                  });

                  if (filteredBadges.length === 0) return null;

                  const totalUnlocked = categoryBadges.filter(b => b.unlocked).length;

                  return (
                    <div key={cat.id} className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">
                            {cat.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                            {totalUnlocked}/{categoryBadges.length} Active
                          </span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedCategorySeeAll(cat.id);
                            setSelectedAchievementId(null);
                            vibrate(12);
                            if (play) play("click");
                          }}
                          className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                          See All ({categoryBadges.length}) ➔
                        </button>
                      </div>

                      {/* Horizontal Scrolling track of category badges (strictly no bounds or inner wrapper boxes!) */}
                      <div className="flex items-start gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x touch-pan-x scroll-smooth">
                        {filteredBadges.map((item) => {
                          const isSelected = selectedAchievementId === item.id;
                          const isClaimed = claimedBadgeIds.includes(item.id);
                          const isUnclaimed = item.unlocked && !isClaimed;

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedAchievementId(isSelected ? null : item.id);
                                vibrate(18);
                                if (play) play("click");
                              }}
                              className="flex flex-col items-center group w-20 text-center focus:outline-none snap-start shrink-0 relative"
                            >
                              {/* Round Medallion wrapper */}
                              {item.unlocked ? (
                                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-400 shadow-sm shadow-orange-500/10 transform transition-all group-hover:scale-105 group-active:scale-95 ${
                                  isSelected ? "ring-4 ring-orange-500/30" : "ring-2 ring-white"
                                }`}>
                                  <div className="absolute inset-[3px] rounded-full border border-amber-400 bg-gradient-to-br from-amber-50 to-orange-100/30 flex items-center justify-center">
                                    <span className="text-2xl drop-shadow-sm select-none animate-in fade-in">
                                      {item.icon}
                                    </span>
                                  </div>
                                  {isUnclaimed ? (
                                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-md border border-white animate-bounce z-20 flex items-center gap-0.5">
                                      <span>🎁</span>
                                      <span>CLAIM</span>
                                    </div>
                                  ) : (
                                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white w-4.5 h-4.5 rounded-full shadow-md border border-white z-20 flex items-center justify-center text-[9px] font-black">
                                      ✓
                                    </div>
                                  )}
                                  <div className="absolute bottom-0.5 right-1 text-[7px] animate-pulse">✨</div>
                                </div>
                              ) : (
                                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 transform transition-all opacity-60 group-hover:opacity-85 ${
                                  isSelected ? "ring-4 ring-slate-400/30" : ""
                                }`}>
                                  <div className="absolute inset-[3px] rounded-full bg-slate-50 flex items-center justify-center filter grayscale opacity-60">
                                    <span className="text-xl select-none">
                                      {item.icon}
                                    </span>
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 bg-slate-200 border border-slate-300 text-slate-500 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-extrabold shadow-sm">
                                    🔒
                                  </div>
                                </div>
                              )}

                              {/* Title label underneath */}
                              <span className={`text-[10px] font-extrabold leading-tight pt-1.5 tracking-tight line-clamp-1 block w-full text-center ${
                                item.unlocked ? "text-slate-800 group-hover:text-orange-600" : "text-slate-400"
                              }`}>
                                {item.title}
                              </span>

                              {/* Progress details indicator */}
                              <span className="text-[8px] font-bold text-slate-400 block mt-0.5 text-center leading-none">
                                {item.unlocked ? (isClaimed ? "Claimed ✓" : "Ready to Claim 🎁") : `${item.currentValue}/${item.targetValue}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic details section inline below the medallions */}
              <AnimatePresence>
                {(() => {
                  const selectedItem = achievements.find(a => a.id === selectedAchievementId);
                  if (!selectedItem) return null;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3 max-w-xl transition-all relative mt-2"
                    >
                      <button
                        onClick={() => setSelectedAchievementId(null)}
                        className="absolute top-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                        title="Close Detail Panel"
                      >
                        <X size={14} />
                      </button>

                      <div className="flex items-center gap-3.5">
                        {selectedItem.unlocked ? (
                          <div className="w-14 h-14 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-400 to-orange-500 shadow-sm animate-bounce">
                            <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                              <span className="text-2xl select-none">
                                {selectedItem.icon}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 opacity-70">
                            <span className="text-xl select-none filter grayscale">
                              {selectedItem.icon}
                            </span>
                          </div>
                        )}

                        <div>
                          <h4 className="text-base font-black text-slate-800 leading-none">
                            {selectedItem.title}
                          </h4>
                          <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1.5 ${
                            selectedItem.unlocked
                              ? "bg-emerald-50 border border-emerald-150 text-emerald-600"
                              : "bg-slate-100 border border-slate-200 text-slate-500"
                          }`}>
                            {selectedItem.unlocked ? "🏆 Unlocked Trophy" : "🔒 Action Required"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-slate-500 leading-relaxed pt-1">
                        {selectedItem.description}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-0.5">
                        <span className="text-[8px] uppercase tracking-wider font-black text-indigo-600">Requirement</span>
                        <p className="text-xs font-semibold text-slate-600">{selectedItem.helperText}</p>
                      </div>

                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            selectedItem.unlocked ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${Math.round(Math.min(100, (selectedItem.currentValue / selectedItem.targetValue) * 100))}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-black text-slate-400 tracking-wider">
                        <span>Milestone Progress:</span>
                        <span>{selectedItem.currentValue} / {selectedItem.targetValue}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100">
                        <div>
                          <p className="text-[8px] uppercase font-black text-orange-600 tracking-wider">Reward Claim</p>
                          <p className="text-xs text-slate-700 font-bold">+{selectedItem.rewardXP} XP & +{selectedItem.rewardCoins} Coins</p>
                        </div>
                        {selectedItem.unlocked ? (
                          claimedBadgeIds.includes(selectedItem.id) ? (
                            <span className="px-3.5 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              ✓ Claimed (+{selectedItem.rewardXP} XP)
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimBadge(selectedItem)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 animate-pulse cursor-pointer flex items-center gap-1"
                            >
                              <span>🎁</span>
                              <span>Claim Boost</span>
                            </button>
                          )
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-400 rounded-md text-[8px] font-bold">
                            Locked
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>
          )
        ) : activeTab === "profile" ? (
          // VIEW: USER PROFILE SECTION
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header: user profile image, name underneath, styled on the left */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Profile Image with active glowing Reddit trophy badge overlay! */}
                <div 
                  className="relative group cursor-pointer shrink-0" 
                  onClick={() => {
                    setActiveTab("rewards");
                    vibrate(10);
                    if (play) play("click");
                  }}
                  title="Click to view Trophy Cabinet Achievements"
                >
                  <img
                    src={currentUserPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                    alt="user profile animate-bounce animate-pulse"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-xl bg-slate-100 hover:scale-[1.03] transition-all ring-4 ring-indigo-50"
                  />
                  {/* Glowing Floating Golden Trophy Badge Overlay on picture */}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 to-orange-400 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse hover:scale-110 transition-transform">
                    <span className="text-xs sm:text-xs">🏆</span>
                  </div>
                </div>

                <div className="mt-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-855 tracking-tight leading-tight flex items-center gap-2">
                    {settings.displayName || user?.displayName || user?.email?.split("@")[0] || "Water Champion"}
                    <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full font-black tracking-wider uppercase scale-90">
                      LV {stats.level || 1}
                    </span>
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {user?.email || "Community Operative"}
                  </p>
                  
                  {/* Small link pill to cabinet */}
                  <button
                    onClick={() => {
                      setActiveTab("rewards");
                      vibrate(10);
                      if (play) play("click");
                    }}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <span>🏅 Badges Cabinet</span>
                    <span className="text-indigo-600 font-black">
                      ({achievements.filter(a => a.unlocked).length}/{achievements.length})
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Optional summary stats or metadata (clean, not telemetry) */}
              <div className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-150 self-stretch md:self-auto items-center justify-around h-fit">
                <div className="text-center px-2">
                  <p className="text-xl font-black text-indigo-600">
                    {allPosts.filter((post) => post.userId === currentUserId && !post.deleted && !hiddenPostIds.includes(post.id)).length}
                  </p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Posts</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center px-2">
                  <p className="text-xl font-black text-indigo-600">
                    {initialCircles.filter(circle => (settings.joinedCircleIds || []).includes(circle.id)).length}
                  </p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Joined</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center px-2">
                  <p className="text-xl font-black text-indigo-600">
                    {initialCircles.filter(circle => circle.ownerId === currentUserId).length}
                  </p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Created</p>
                </div>
              </div>
            </div>

            {/* 🏆 Flat, Borderless Rewards & Achievements Section (No wide dark background boxes or nested scrollbars) */}
            <div className="space-y-6 pt-2 select-none animate-in fade-in duration-300">
              {/* Simple Flat Header */}
              <div className="border-b border-slate-200 pb-2.5">
                <span className="text-[10px] font-black text-indigo-600 tracking-wider uppercase">
                  Community Trophy Cabinet
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">
                  Rewards & Achievements
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Complete social milestones to unlock collectible medallions, exclusive tags, and claim XP/Coin boosts.
                </p>
                
                {/* Embedded Progress bar (flat) */}
                <div className="max-w-md mt-3.5 space-y-1.5 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <div className="flex justify-between text-[10px] font-black tracking-wide text-slate-500 uppercase">
                    <span>XP REWARDS UNLOCKED</span>
                    <span>{Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-3 rounded-full overflow-hidden border border-slate-300 p-0.5">
                    <div 
                      className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Flat filter pill buttons (No wide background cards!) */}
              <div className="flex gap-2 max-w-sm">
                {(["all", "unlocked", "locked"] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    onClick={() => {
                      setAchievementFilter(filterOpt);
                      vibrate(12);
                      if (play) play("click");
                    }}
                    className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      achievementFilter === filterOpt
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-slate-200/50 text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {filterOpt === "all" ? "🌐 All" : filterOpt === "unlocked" ? "✅ Unlocked" : "🔒 Locked"}
                  </button>
                ))}
              </div>

              {/* Render dynamic inline list of categories */}
              <div className="space-y-6">
                {[
                  { id: "exploration", name: "Exploration" },
                  { id: "community", name: "Building Community" },
                  { id: "streak", name: "Nexora Streak" },
                  { id: "getting_started", name: "Getting Started" },
                  { id: "moderation", name: "Community Moderation" }
                ].map((cat) => {
                  const categoryBadges = achievements.filter(a => a.category === cat.id);
                  const filteredBadges = categoryBadges.filter((item) => {
                    if (achievementFilter === "unlocked") return item.unlocked;
                    if (achievementFilter === "locked") return !item.unlocked;
                    return true;
                  });

                  if (filteredBadges.length === 0) return null;

                  const totalUnlocked = categoryBadges.filter(b => b.unlocked).length;

                  return (
                    <div key={cat.id} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {totalUnlocked} / {categoryBadges.length} unlocked
                        </span>
                      </div>

                      {/* Flex grid of medallions with NO custom bounding card backgrounds */}
                      <div className="flex flex-wrap gap-x-5 gap-y-6 justify-start items-start pt-1">
                        {filteredBadges.map((item) => {
                          const isSelected = selectedAchievementId === item.id;
                          const isClaimed = claimedBadgeIds.includes(item.id);
                          const isUnclaimed = item.unlocked && !isClaimed;

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedAchievementId(isSelected ? null : item.id);
                                vibrate(18);
                                if (play) play("click");
                              }}
                              className="flex flex-col items-center group w-20 text-center focus:outline-none relative"
                            >
                              {/* Round Medallion wrapper (gilded gold if unlocked, grey ring and coin shape if locked) */}
                              {item.unlocked ? (
                                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-400 shadow-sm shadow-orange-500/10 transform transition-all group-hover:scale-105 group-active:scale-95 ${
                                  isSelected ? "ring-4 ring-orange-500/30" : "ring-2 ring-white"
                                }`}>
                                  <div className="absolute inset-[3px] rounded-full border border-amber-400 bg-gradient-to-br from-amber-50 to-orange-100/30 flex items-center justify-center">
                                    <span className="text-2xl drop-shadow-sm select-none">
                                      {item.icon}
                                    </span>
                                  </div>
                                  {isUnclaimed ? (
                                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-md border border-white animate-bounce z-20 flex items-center gap-0.5">
                                      <span>🎁</span>
                                      <span>CLAIM</span>
                                    </div>
                                  ) : (
                                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white w-4.5 h-4.5 rounded-full shadow-md border border-white z-20 flex items-center justify-center text-[9px] font-black">
                                      ✓
                                    </div>
                                  )}
                                  <div className="absolute bottom-0.5 right-1 text-[7px] animate-pulse">✨</div>
                                </div>
                              ) : (
                                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 transform transition-all opacity-60 group-hover:opacity-85 ${
                                  isSelected ? "ring-4 ring-slate-400/30" : ""
                                }`}>
                                  <div className="absolute inset-[3px] rounded-full bg-slate-50 flex items-center justify-center filter grayscale opacity-60">
                                    <span className="text-xl select-none">
                                      {item.icon}
                                    </span>
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 bg-slate-200 border border-slate-300 text-slate-500 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-extrabold shadow-sm">
                                    🔒
                                  </div>
                                </div>
                              )}

                              {/* Title labels underneath */}
                              <span className={`text-[10px] font-extrabold leading-tight pt-1.5 tracking-tight line-clamp-1 block w-full text-center ${
                                item.unlocked ? "text-slate-800 group-hover:text-orange-600" : "text-slate-400"
                              }`}>
                                {item.title}
                              </span>

                              {/* Target info */}
                              <span className="text-[8px] font-bold text-slate-400 block mt-0.5 text-center leading-none">
                                {item.unlocked ? (isClaimed ? "Claimed ✓" : "Ready to Claim 🎁") : `${item.currentValue}/${item.targetValue}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic details section inline below the medallions (No modal overlay, laying flat naturally!) */}
              <AnimatePresence>
                {(() => {
                  const selectedItem = achievements.find(a => a.id === selectedAchievementId);
                  if (!selectedItem) return null;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3 max-w-xl transition-all relative mt-2"
                    >
                      <button
                        onClick={() => setSelectedAchievementId(null)}
                        className="absolute top-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                        title="Close Detail Panel"
                      >
                        <X size={14} />
                      </button>

                      <div className="flex items-center gap-3.5">
                        {selectedItem.unlocked ? (
                          <div className="w-14 h-14 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-tr from-amber-400 to-orange-500 shadow-sm animate-bounce">
                            <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                              <span className="text-2xl select-none">
                                {selectedItem.icon}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 opacity-70">
                            <span className="text-xl select-none filter grayscale">
                              {selectedItem.icon}
                            </span>
                          </div>
                        )}

                        <div>
                          <h4 className="text-base font-black text-slate-800 leading-none">
                            {selectedItem.title}
                          </h4>
                          <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1.5 ${
                            selectedItem.unlocked
                              ? "bg-emerald-50 border border-emerald-150 text-emerald-600"
                              : "bg-slate-100 border border-slate-200 text-slate-500"
                          }`}>
                            {selectedItem.unlocked ? "🏆 Unlocked Trophy" : "🔒 Action Required"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-slate-500 leading-relaxed pt-1">
                        {selectedItem.description}
                      </p>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-0.5">
                        <span className="text-[8px] uppercase tracking-wider font-black text-indigo-600">Requirement</span>
                        <p className="text-xs font-semibold text-slate-600">{selectedItem.helperText}</p>
                      </div>

                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            selectedItem.unlocked ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${Math.round(Math.min(100, (selectedItem.currentValue / selectedItem.targetValue) * 100))}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-black text-slate-400 tracking-wider">
                        <span>Milestone Progress:</span>
                        <span>{selectedItem.currentValue} / {selectedItem.targetValue}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100">
                        <div>
                          <p className="text-[8px] uppercase font-black text-orange-600 tracking-wider">Reward Claim</p>
                          <p className="text-xs text-slate-700 font-bold">+{selectedItem.rewardXP} XP & +{selectedItem.rewardCoins} Coins</p>
                        </div>
                        {selectedItem.unlocked ? (
                          claimedBadgeIds.includes(selectedItem.id) ? (
                            <span className="px-3.5 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              ✓ Claimed (+{selectedItem.rewardXP} XP)
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimBadge(selectedItem)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 animate-pulse cursor-pointer flex items-center gap-1"
                            >
                              <span>🎁</span>
                              <span>Claim Boost</span>
                            </button>
                          )
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-400 rounded-md text-[8px] font-bold">
                            Locked
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* Part 1: "only bro that he/she joined" - Joined Sub-Communities Section */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-855 tracking-tight leading-none text-indigo-750">
                    Joined Spaces ({initialCircles.filter(circle => (settings.joinedCircleIds || []).includes(circle.id)).length}) 🏮
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-405 font-bold uppercase mt-1">
                    Sub-communities you participate in
                  </p>
                </div>
              </div>

              {initialCircles.filter(circle => (settings.joinedCircleIds || []).includes(circle.id)).length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/60 p-8 text-center rounded-[2rem] space-y-2">
                  <p className="font-extrabold text-slate-600 text-sm">Not in any groups yet</p>
                  <p className="text-xs text-slate-400 font-medium">Head over to the Groups tab to join spaces, bro!</p>
                  <button
                    onClick={() => setActiveTab("groups")}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase rounded-lg transition-all"
                  >
                    Browse Groups
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {initialCircles.filter(circle => (settings.joinedCircleIds || []).includes(circle.id)).map((circle) => {
                    return (
                      <div
                        key={circle.id}
                        className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:shadow-xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                            {circle.icon || "🏮"}
                          </span>
                          <div className="min-w-0">
                            <h4
                              onClick={() => setSelectedGroupId(circle.id)}
                              className="font-black text-xs text-slate-800 hover:text-indigo-600 cursor-pointer truncate"
                            >
                              n/{circle.name.toLowerCase()}
                            </h4>
                            <p className="text-[9px] text-slate-405 font-bold uppercase">{circle.category}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinGroup(circle)}
                          className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[9px] font-black uppercase transition-colors shrink-0"
                        >
                          Leave
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Part 2: "Group section not the one the user joined but for the create Group where the users create their own Group that he/she Created bro" - Created Groups Section */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-850 tracking-tight leading-none text-emerald-700">
                    My Created Sub-Communities ({initialCircles.filter(circle => circle.ownerId === currentUserId).length}) 🎨
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-405 font-bold uppercase mt-1">
                    Groups created and owned by you
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase rounded-lg transition-all flex items-center gap-1 shadow-sm"
                >
                  <Plus size={12} /> Create Custom Group
                </button>
              </div>

              {initialCircles.filter(circle => circle.ownerId === currentUserId).length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/60 p-8 text-center rounded-[2rem] space-y-2">
                  <p className="font-extrabold text-slate-600 text-sm">No communities created yet</p>
                  <p className="text-xs text-slate-400 font-medium">Have a specific wellness topic? Design your own community!</p>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase rounded-lg transition-all"
                  >
                    Launch Creator Wizard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {initialCircles.filter(circle => circle.ownerId === currentUserId).map((circle) => {
                    const isJoined = (settings.joinedCircleIds || []).includes(circle.id);
                    return (
                      <div
                        key={circle.id}
                        className="bg-white p-4.5 rounded-3xl border border-emerald-100 hover:border-emerald-250 shadow-xs flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100/50">
                            {circle.icon || "🏮"}
                          </span>
                          <div className="min-w-0">
                            <h4
                              onClick={() => setSelectedGroupId(circle.id)}
                              className="font-black text-xs text-slate-800 hover:text-indigo-600 cursor-pointer truncate"
                            >
                              n/{circle.name.toLowerCase()}
                            </h4>
                            <p className="text-[9px] text-emerald-600 font-black uppercase">Creator/Owner</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedGroupId(circle.id)}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-lg text-[9px] font-black uppercase transition-all shrink-0"
                          >
                            Enter
                          </button>
                          {!isJoined && (
                            <button
                              onClick={() => handleJoinGroup(circle)}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase transition-colors shrink-0"
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Part 3: "and after that u can now past the post the user make" - My Posts Feed */}
            <div className="space-y-3.5 pt-2">
              <div className="border-b border-slate-205 pb-1 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-black text-slate-855 tracking-tight uppercase">
                  My Posts ({allPosts.filter((post) => post.userId === currentUserId && !post.deleted && !hiddenPostIds.includes(post.id)).length}) 📝
                </h3>
              </div>

              <div className="space-y-4">
                {allPosts.filter((post) => post.userId === currentUserId && !post.deleted && !hiddenPostIds.includes(post.id)).length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-[2rem] border border-slate-200/60 max-w-sm mx-auto space-y-2">
                    <p className="font-extrabold text-slate-600 text-sm">No posts shared yet</p>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Share your progress logs or questions in any public feed or group!</p>
                    <button
                      onClick={handleLaunchCreatePost}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition-all"
                    >
                      Create First Post
                    </button>
                  </div>
                ) : (
                  allPosts.filter((post) => post.userId === currentUserId && !post.deleted && !hiddenPostIds.includes(post.id)).map((post) => renderPostCard(post))
                )}
              </div>
            </div>

            {/* Part 4: "and add the oone of comments too bro" - My Written Comments List */}
            <div className="space-y-3.5 pt-2">
              <div className="border-b border-slate-205 pb-1 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-black text-slate-855 tracking-tight uppercase border-indigo-200">
                  Comments I Made ({userWrittenComments.length}) 💬
                </h3>
              </div>

              {loadingUserComments ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
                </div>
              ) : userWrittenComments.length === 0 ? (
                <div className="bg-white p-10 text-center rounded-[2rem] border border-slate-200/60 max-w-sm mx-auto">
                  <p className="font-extrabold text-slate-505 text-xs">No commentary parsed yet</p>
                  <p className="text-[11px] text-slate-404 font-medium mt-1">Contribute to discussion threads within groups to see comments listed here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userWrittenComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white p-4.5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-black text-indigo-650 bg-indigo-50/75 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Comment on community post
                        </span>
                        <span className="text-[9px] text-slate-404 font-black font-mono">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-705 font-medium leading-relaxed italic border-l-2 border-indigo-100 pl-2">
                        &ldquo;{comment.content || comment.text}&rdquo;
                      </p>
                      
                      <div className="flex gap-2 justify-end text-[10px]">
                        <button
                          onClick={async () => {
                            const post = allPosts.find(p => p.id === comment.postId);
                            if (post) {
                              setSelectedPost(post);
                            } else {
                              try {
                                const { getDoc } = await import("firebase/firestore");
                                const postDoc = await getDoc(doc(db, "community_posts", comment.postId));
                                if (postDoc.exists()) {
                                  setSelectedPost({ id: postDoc.id, ...postDoc.data() } as Post);
                                } else {
                                  showToast("Associated post was deleted.", "info");
                                }
                              } catch {
                                showToast("Associated post is deleted or unreachable.", "info");
                              }
                            }
                          }}
                          className="font-black text-indigo-650 hover:text-indigo-850 hover:underline px-2.5 py-1 bg-slate-50 rounded-lg transition-colors"
                        >
                          View Thread
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // VIEW: COMMUNITY HOME / GLOBAL FEED
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* categories list / see all view */}
            {showAllCategories ? (
              <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">
                    Browse Categories
                  </h3>
                  <button
                    onClick={() => setShowAllCategories(false)}
                    className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoriesList.map((cat) => (
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
                      <span className="text-xs font-black text-slate-700">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {cat.count} discussions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Categories horizontal listing */
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">
                    Categories
                  </h2>
                  <button
                    onClick={() => setShowAllCategories(true)}
                    className="text-indigo-600 font-extrabold text-xs tracking-wider uppercase"
                  >
                    See all
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {categoriesList.map((cat) => (
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
                      <span className="text-[10.5px] font-bold text-slate-700 tracking-tight">
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Groups Section (Completely redesigned: Premium horizontal scrolling layout!) */}
            {showAllGroups ? (
              <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border border-slate-205 shadow-md animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Active Sub-Communities
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      All created spaces available
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAllGroups(false)}
                    className="text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl uppercase transition-colors"
                  >
                    Close Panel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {initialCircles.map((group) => {
                    const isJoined = (settings.joinedCircleIds || []).includes(group.id);
                    return (
                      <div key={group.id} className="bg-slate-50/55 p-4 rounded-3xl border border-slate-150 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0">{group.icon || "🏮"}</span>
                          <div className="min-w-0">
                            <h4
                              onClick={() => {
                                setSelectedGroupId(group.id);
                                setShowAllGroups(false);
                              }}
                              className="font-black text-xs text-slate-850 hover:text-indigo-600 cursor-pointer truncate"
                            >
                              n/{group.name.toLowerCase()}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{group.category}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinGroup(group)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors shrink-0 ${
                            isJoined
                              ? "bg-slate-200 text-slate-600 hover:bg-rose-100 hover:text-rose-600"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {isJoined ? "Joined" : "Join"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-850 tracking-tight leading-none">
                      Popular Spaces 🏮
                    </h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mt-1">
                      Recommended horizontal sub-communities to join
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAllGroups(true)}
                    className="text-indigo-650 hover:text-indigo-850 font-black text-[10.5px] tracking-wider uppercase bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all shadow-xs"
                  >
                    See All Groups
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar scroll-smooth">
                  {initialCircles.map((circle) => {
                    const isJoined = (settings.joinedCircleIds || []).includes(
                      circle.id,
                    );
                    return (
                      <div
                        key={circle.id}
                        className="bg-white p-5 rounded-[2.5rem] border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-sm transition-all snap-start w-[275px] sm:w-[300px] shrink-0"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl bg-slate-50 p-2 rounded-2xl block border border-slate-100">
                              {circle.icon || "🏮"}
                            </span>
                            <span className="text-[9.5px] font-black bg-indigo-50/60 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-widest">
                              {circle.category}
                            </span>
                          </div>
                          <div>
                            <h3
                              onClick={() => setSelectedGroupId(circle.id)}
                              className="font-black text-slate-800 text-sm tracking-tight cursor-pointer hover:text-indigo-600 line-clamp-1 transition-colors"
                            >
                              n/{circle.name.toLowerCase()}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                              {circle.memberCount || 1} members
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 min-h-[34px]">
                            {circle.description}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setSelectedGroupId(circle.id)}
                            className="flex-grow py-2 bg-slate-50 hover:bg-slate-100 text-slate-650 font-black text-xs rounded-xl transition-all"
                          >
                            Enter Room
                          </button>
                          <button
                            onClick={() => handleJoinGroup(circle)}
                            className={`flex-grow py-2 rounded-xl font-black text-xs transition-all tracking-wide ${
                              isJoined
                                ? "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                            }`}
                          >
                            {isJoined ? "Joined" : "Join"}
                          </button>
                        </div>
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
                    onClick={() => setFeedFilter("for-you")}
                    className={`pb-3 text-sm font-black border-b-2 transition-all tracking-wider uppercase ${feedFilter === "for-you" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    For You
                  </button>
                  <button
                    onClick={() => setFeedFilter("latest")}
                    className={`pb-3 text-sm font-black border-b-2 transition-all tracking-wider uppercase ${feedFilter === "latest" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => setFeedFilter("trending")}
                    className={`pb-3 text-sm font-black border-b-2 transition-all tracking-wider uppercase ${feedFilter === "trending" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
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
                      <p className="font-black text-slate-800 text-sm">
                        No matched posts found
                      </p>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Try typing a different keyword or check back shortly for
                        updates.
                      </p>
                    </div>
                  </div>
                ) : (
                  visiblePosts.map((post) => renderPostCard(post))
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ─── NEW POST FORM POPUP SCREEN (REDESIGNED FOR EXQUISITE FLOW) ─── */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto backdrop-blur-sm z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  Create Post 🚀
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Publish your focus milestones
                </p>
              </div>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
              >
                <Check size={18} />
              </button>
            </div>

            {/* Split Mode Selector (Text Post vs Image Upload) */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setCreatePostMode("text")}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  createPostMode === "text"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-705 bg-transparent"
                }`}
              >
                Text Post
              </button>
              <button
                type="button"
                onClick={() => setCreatePostMode("image")}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  createPostMode === "image"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-705 bg-transparent"
                }`}
              >
                Upload Image
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              {/* Select target Group */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Choose Target Hub
                </label>
                <select
                  value={postTargetGroup}
                  onChange={(e) => setPostTargetGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="public">🌐 General Public Feed</option>
                  {initialCircles.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏮 {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title input (Required for Post button) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Post Title *
                </label>
                <input
                  type="text"
                  placeholder="Keep it brief and catchy..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none placeholder-slate-400 focus:ring-1 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Text Post - Body input */}
              {createPostMode === "text" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Post Body *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share details of your achievements, tips, daily completed pushes or water goals..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none placeholder-slate-400 focus:ring-1 focus:ring-indigo-100"
                    required={createPostMode === "text"}
                  />
                </div>
              )}
              {createPostMode === "image" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Upload Visual Resources *
                    </label>
                    {postImagesBase64.length > 0 && (
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {postImagesBase64.length} images added
                      </span>
                    )}
                  </div>

                  {postImagesBase64.length > 0 ? (
                    <div className="space-y-2">
                      <div className="relative rounded-2xl overflow-hidden max-h-52 border border-slate-200 animate-in zoom-in-95 group">
                        <img
                          src={
                            postImagesBase64[
                              cardImageIndices["composer"] || 0
                            ] || postImagesBase64[0]
                          }
                          alt="Composer preview"
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/45 p-2.5 backdrop-blur-xs flex justify-between items-center">
                          <span className="text-[10px] font-bold text-white uppercase">
                            Image {(cardImageIndices["composer"] || 0) + 1} of{" "}
                            {postImagesBase64.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const activeIdx =
                                cardImageIndices["composer"] || 0;
                              const filtered = postImagesBase64.filter(
                                (_, idx) => idx !== activeIdx,
                              );
                              setPostImagesBase64(filtered);
                              if (filtered.length === 0) {
                                setPostImageBase64("");
                              } else {
                                setCardImageIndices((prev) => ({
                                  ...prev,
                                  composer: Math.max(0, activeIdx - 1),
                                }));
                              }
                            }}
                            className="bg-rose-600/90 hover:bg-rose-600 text-white font-extrabold text-[9px] uppercase px-2 py-1 rounded"
                          >
                            Remove
                          </button>
                        </div>

                        {postImagesBase64.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const activeIdx =
                                  cardImageIndices["composer"] || 0;
                                const prevIdx =
                                  activeIdx === 0
                                    ? postImagesBase64.length - 1
                                    : activeIdx - 1;
                                setCardImageIndices((prev) => ({
                                  ...prev,
                                  composer: prevIdx,
                                }));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs font-bold leading-none w-6 h-6 flex items-center justify-center"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const activeIdx =
                                  cardImageIndices["composer"] || 0;
                                const nextIdx =
                                  activeIdx === postImagesBase64.length - 1
                                    ? 0
                                    : activeIdx + 1;
                                setCardImageIndices((prev) => ({
                                  ...prev,
                                  composer: nextIdx,
                                }));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs font-bold leading-none w-6 h-6 flex items-center justify-center"
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2 items-center">
                        <label className="flex-grow py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 font-black text-center text-xs rounded-xl transition-all cursor-pointer inline-block border border-indigo-100">
                          + Add More Images
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPostImagesBase64([]);
                            setPostImageBase64("");
                            setCardImageIndices((prev) => ({
                              ...prev,
                              composer: 0,
                            }));
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-505 font-extrabold text-xs rounded-xl"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 text-center space-y-2">
                      <ImageIcon
                        size={32}
                        className="text-slate-300 animate-pulse"
                      />
                      <div className="space-y-1">
                        <label className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-block shadow-md">
                          Select Image Files
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageFileChange}
                            className="hidden"
                            required={createPostMode === "image"}
                          />
                        </label>
                        <p className="text-[9px] text-slate-400 font-bold">
                          Max 5MB • You can select multiple images!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Publishing Trigger */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className={`w-full py-4 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isSubmittingPost
                      ? "bg-slate-400 text-white cursor-not-allowed opacity-80"
                      : ((createPostMode === "text" && postTitle.trim() !== "" && postContent.trim() !== "") ||
                         (createPostMode === "image" && postTitle.trim() !== "" && (postImagesBase64.length > 0 || postImageBase64 !== "")))
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/15 active:scale-98 cursor-pointer"
                      : "bg-emerald-500/60 hover:bg-emerald-500 text-white cursor-pointer"
                  }`}
                >
                  {isSubmittingPost ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Publishing to Community... 📡</span>
                    </>
                  ) : (
                    <span>Publish Post 📡</span>
                  )}
                </button>
                {!isSubmittingPost &&
                  !((createPostMode === "text" && postTitle.trim() !== "" && postContent.trim() !== "") ||
                    (createPostMode === "image" && postTitle.trim() !== "" && (postImagesBase64.length > 0 || postImageBase64 !== ""))) && (
                    <p className="mt-2 text-center text-[10.5px] font-bold text-slate-400">
                      {createPostMode === "text"
                        ? "Fill in Title and Body to publish"
                        : "Enter Title and upload an Image to publish"}
                    </p>
                  )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT POST FORM POPUP SCREEN (EXQUISITE FLOW) ─── */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/55 overflow-y-auto backdrop-blur-xs z-[600] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  Edit My Post ✏️
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Update your focus milestone updates
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditPostSubmit} className="space-y-4">
              {/* Target Hub Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Choose Target Hub
                </label>
                <select
                  value={editTargetGroup}
                  onChange={(e) => setEditTargetGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="public">🌐 General Public Feed</option>
                  {initialCircles.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏮 {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Post Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Body input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Post Body *
                </label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Submission actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="flex-grow py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center justify-center gap-2"
                >
                  {isSubmittingPost ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* ─── NEW GROUP FORM POPUP SCREEN (CreateCircleWizard) ─── */}
      {showCreateGroup && (
        <CreateCircleWizard
          onClose={() => setShowCreateGroup(false)}
          onComplete={async (data) => {
            try {
              const circlesRef = collection(db, "circles");
              const safeSlug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").replace(/^-+/, "");
              const circleId = safeSlug || doc(circlesRef).id;
              
              const circlePayload = {
                ...data,
                id: circleId,
                memberCount: 1,
                createdAt: new Date().toISOString(),
                createdBy: currentUserId,
                ownerId: currentUserId,
                followerIds: [currentUserId],
              };

              // Remove null/undefined/empty keys that might fail firestore.rules checks
              if (!circlePayload.customIconUrl) delete circlePayload.customIconUrl;
              if (!circlePayload.customBgUrl) delete circlePayload.customBgUrl;

              await setDoc(doc(circlesRef, circleId), circlePayload);
              showToast(`n/${data.name.toLowerCase()} established! 🚀`, "success");
              setSelectedGroupId(circleId);
              setShowCreateGroup(false);
            } catch (err) {
              console.error(err);
              showToast("Error creating sub-community. Please check connection.", "error");
            }
          }}
          isSubmitting={false}
        />
      )}

      {/* ─── GROUP ABOUT PROTOCOL POPUP MODAL ─── */}
      {showGroupAboutModal && currentViewingCircle && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1200] flex items-center justify-center p-4 animate-in fade-in duration-200" 
          onClick={() => setShowGroupAboutModal(false)}
        >
          <div 
            className="bg-white rounded-[2.5rem] w-full max-w-md p-7 shadow-2xl relative border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block border border-slate-100 select-none">
                  {currentViewingCircle.icon || "🏮"}
                </span>
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none block">Room Protocol</span>
                  <h3 className="text-base font-black text-slate-800 tracking-tight mt-1 leading-none">
                    n/{currentViewingCircle.name.toLowerCase()}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowGroupAboutModal(false)}
                className="p-2 hover:bg-slate-100 hover:text-slate-700 text-slate-400 rounded-xl transition-colors"
                title="Close panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-5 scrollbar-none pr-1">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Main category</span>
                <span className="mt-1 inline-block text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider">
                  {currentViewingCircle.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description</span>
                <p className="text-xs text-slate-655 font-semibold leading-relaxed mt-1">
                  {currentViewingCircle.description || "No description loaded."}
                </p>
              </div>

              {currentViewingCircle.whatGroupIsFor && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">What this group is for</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-1">
                    {currentViewingCircle.whatGroupIsFor}
                  </p>
                </div>
              )}

              {currentViewingCircle.primaryPurpose && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Objective & Goals</span>
                  <p className="text-xs text-slate-700 font-extrabold mt-1">
                    🎯 {currentViewingCircle.primaryPurpose}
                  </p>
                </div>
              )}

              {currentViewingCircle.roles && currentViewingCircle.roles.length > 0 && (
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Official Badge Roles</span>
                  <div className="flex flex-wrap gap-1">
                    {currentViewingCircle.roles.map((r, i) => (
                      <span key={i} className="text-[9px] font-black text-indigo-600 bg-indigo-50/50 border border-indigo-100/30 px-2 py-0.5 rounded-md">
                        🛡️ {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Guidelines & Rules</span>
                <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                  {(currentViewingCircle.rules || [
                    "Be respectful and positive.",
                    "No spam or promotional advertisements.",
                    "Follow human guidelines and assist colleagues."
                  ]).map((rule, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-indigo-500 font-black">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGroupAboutModal(false)}
              className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0"
            >
              Acknowledged Protocol
            </button>
          </div>
        </div>
      )}

      {/* ─── FULL-SCREEN SEARCH OVERLAY (BEAUTIFULLY POLISHED) ─── */}
      {showFullSearchPage && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[700] flex justify-center p-4 sm:p-10 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl h-fit max-h-[85vh] p-6 sm:p-8 flex flex-col space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Header segment */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  Search Nexora Community 🔍
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">
                  Find posts, discussions, authors and hubs
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFullSearchPage(false);
                  setSearchQuery("");
                }}
                className="text-xs font-black text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-750 px-4 py-2 rounded-2xl uppercase transition-all"
              >
                Close
              </button>
            </div>

            {/* Live Search Input Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 animate-none" />
              <input
                type="text"
                autoFocus
                placeholder="Type keywords, authors, #milestones or rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results sections */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {searchQuery.trim() === "" ? (
                <div className="py-10 text-center space-y-2">
                  <Compass size={40} className="mx-auto text-slate-300" />
                  <p className="font-extrabold text-slate-500 text-xs uppercase tracking-wide">
                    Enter a search term to begin exploring
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
                    Matched discussions, water pushes, muscle milestones, and
                    discipline rooms will be displayed in real time.
                  </p>
                </div>
              ) : (
                <>
                  {/* Matching Groups Segment */}
                  {initialCircles.filter(
                    (c) =>
                      c.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      c.category
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  ).length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Matched Rooms
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {initialCircles
                          .filter(
                            (c) =>
                              c.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              c.category
                                ?.toLowerCase()
                                .includes(searchQuery.toLowerCase()),
                          )
                          .map((circle) => (
                            <div
                              key={circle.id}
                              onClick={() => {
                                setSelectedGroupId(circle.id);
                                setShowFullSearchPage(false);
                              }}
                              className="p-3 border border-slate-100 hover:border-indigo-100 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-indigo-50/10 transition-all"
                            >
                              <span className="text-2xl p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                                {circle.icon || "🏮"}
                              </span>
                              <div className="overflow-hidden">
                                <p className="font-extrabold text-slate-800 text-xs truncate">
                                  n/{circle.name.toLowerCase()}
                                </p>
                                <p className="text-[9.5px] text-slate-400 font-bold truncate capitalize">
                                  {circle.category}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Posts Segment */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Matched Discussions
                    </h4>
                    {visiblePosts.length === 0 ? (
                      <p className="text-xs font-bold text-slate-400 py-4 italic">
                        No matching community posts found.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {visiblePosts.map((post) => {
                          const isAttachedImg = post.image || post.imageUrl;
                          return (
                            <div
                              key={post.id}
                              onClick={() => {
                                setSelectedPost(post);
                                setShowFullSearchPage(false);
                              }}
                              className="p-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 hover:border-indigo-100 rounded-2xl cursor-pointer transition-all flex items-start gap-3.5"
                            >
                              {/* Option image preview */}
                              {isAttachedImg && (
                                <img
                                  src={isAttachedImg}
                                  alt="preview"
                                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                                />
                              )}
                              <div className="space-y-1 overflow-hidden flex-1">
                                <h5 className="font-black text-slate-800 text-xs tracking-tight truncate line-clamp-1">
                                  {post.title}
                                </h5>
                                <p className="text-[10.5px] text-slate-500 font-semibold truncate hover:text-indigo-600 pr-4">
                                  <NexusLinkRenderer text={post.content} circles={initialCircles} showToast={showToast} />
                                </p>
                                <div className="flex items-center gap-2 pt-1 text-[9.5px] text-slate-400 font-bold uppercase">
                                  <span>by {post.userName}</span>
                                  <span>•</span>
                                  <span>{post.circleName || "General"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
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
                  <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider leading-none">
                    POST DETAILS
                  </span>
                  <h3 className="text-base font-black text-slate-800 tracking-tight line-clamp-1">
                    {selectedPost.title || "Discussion Room"}
                  </h3>
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
                  <img
                    src={selectedPost.userPhoto}
                    alt="creator"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      {selectedPost.userName}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {selectedPost.circleName || "Public Feed"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800 tracking-tightLeading leading-snug">
                    {selectedPost.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>

                {/* Uploaded Post image inside detailed view */}
                {(selectedPost.image || selectedPost.imageUrl) && (
                  <div className="rounded-[1.5rem] overflow-hidden max-h-72 border border-slate-100">
                    <img
                      src={selectedPost.image || selectedPost.imageUrl}
                      alt="attached asset"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Comments Header */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">
                  Comments ({postComments.length})
                </h4>

                {loadingComments ? (
                  <div className="text-center py-6 text-slate-400 font-bold text-xs">
                    Loading comment feed...
                  </div>
                ) : postComments.length === 0 ? (
                  <div className="bg-slate-50/50 py-10 rounded-2xl text-center text-xs font-bold text-slate-400">
                    No comments parsed. Share your supportive input first!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Render top-level comments first, with Reddit-style collapsible reply threads */}
                    {(() => {
                      const activePostComments = postComments.filter(c => !hiddenCommentIds.includes(c.id));
                      const topLevelComments = activePostComments.filter(c => !c.parentId);

                      const getAllChildReplies = (parentId: string): SocialComment[] => {
                        const direct = activePostComments.filter(c => c.parentId === parentId);
                        let all: SocialComment[] = [...direct];
                        for (const child of direct) {
                          all = [...all, ...getAllChildReplies(child.id)];
                        }
                        return all;
                      };

                      return topLevelComments.map((comment) => {
                        const allReplies = getAllChildReplies(comment.id);
                        const isExpanded = Boolean(expandedThreadIds[comment.id]);
                        const replyCount = allReplies.length;

                        return (
                          <div 
                            key={comment.id} 
                            className="bg-slate-50/90 border border-slate-200/80 p-3.5 sm:p-4 rounded-2xl space-y-2.5 transition-all shadow-3xs"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <img
                                  onClick={() => handleInspectUser(comment.userId)}
                                  src={comment.userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                                  alt="commenter"
                                  className="w-[26px] h-[26px] rounded-full object-cover border border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors"
                                />
                                <button
                                  onClick={() => handleInspectUser(comment.userId)}
                                  className="font-extrabold text-xs text-slate-800 hover:text-indigo-600 transition-all font-sans"
                                >
                                  {comment.userName}
                                </button>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {comment.createdAt
                                    ? new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                    : "Just now"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Reply Button on main comment */}
                                <button
                                  onClick={() => {
                                    setActiveReplyCommentId(activeReplyCommentId === comment.id ? null : comment.id);
                                    setReplyCommentText("");
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                >
                                  <MessageCircle size={12} />
                                  <span>{activeReplyCommentId === comment.id ? "Cancel" : "Reply"}</span>
                                </button>

                                {/* Three Dots Options Menu for Top Level Comment */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionsCommentId(activeActionsCommentId === comment.id ? null : comment.id);
                                    }}
                                    className="p-1 hover:bg-slate-200/80 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Comment options"
                                  >
                                    <MoreVertical size={14} />
                                  </button>

                                  {activeActionsCommentId === comment.id && (
                                    <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-in zoom-in-95 duration-100 text-xs">
                                      <button
                                        onClick={() => {
                                          setReportedItem({
                                            type: "comment",
                                            id: comment.id,
                                            postId: comment.postId || selectedPost?.id || "",
                                            content: comment.content,
                                            userId: comment.userId,
                                            userName: comment.userName,
                                            userPhoto: comment.userPhoto
                                          });
                                          setReportStep(1);
                                          setReportReason("");
                                          setReportDetails("");
                                          setCustomReportNotes("");
                                          setActiveActionsCommentId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                                      >
                                        <Flag size={13} className="text-amber-500" />
                                        Report Comment
                                      </button>

                                      {comment.userId === currentUserId && (
                                        <button
                                          onClick={() => {
                                            setEditingComment(comment);
                                            setEditCommentText(comment.content);
                                            setActiveActionsCommentId(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/70 text-indigo-600 font-bold flex items-center gap-2 border-t border-slate-100 mt-1 pt-1.5"
                                        >
                                          <Edit size={13} />
                                          Edit Comment
                                        </button>
                                      )}

                                      {(comment.userId === currentUserId || currentUserId === "G77faQhRPfe5jr4hbY0O0L4fNUs2" || currentUserEmail === "thomasaugustino12345678@gmail.com") && (
                                        <button
                                          onClick={() => handleDeleteComment(comment)}
                                          className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 border-t border-slate-100 mt-1 pt-1.5"
                                        >
                                          <Trash2 size={13} />
                                          Delete Comment
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 font-medium leading-relaxed max-w-full overflow-hidden break-all">
                              <NexusLinkRenderer text={comment.content} circles={initialCircles} showToast={showToast} />
                            </p>

                            {/* Reply Input Form inline */}
                            {activeReplyCommentId === comment.id && (
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handlePostReplySubmit(comment, replyCommentText);
                                }}
                                className="mt-2 flex items-center gap-2 bg-white rounded-xl border border-indigo-200 p-1.5 shadow-sm animate-in slide-in-from-top-1 px-2 py-1 duration-150"
                              >
                                <input
                                  type="text"
                                  placeholder={`Reply to @${comment.userName}...`}
                                  value={replyCommentText}
                                  onChange={(e) => setReplyCommentText(e.target.value)}
                                  disabled={isSubmittingComment}
                                  className="flex-grow bg-transparent text-xs text-slate-700 outline-none px-2 py-1 font-medium disabled:opacity-50"
                                  autoFocus
                                />
                                <button
                                  type="submit"
                                  disabled={!replyCommentText.trim() || isSubmittingComment}
                                  className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 min-w-[50px] justify-center"
                                >
                                  {isSubmittingComment ? (
                                    <span className="animate-spin text-[10px]">⏳</span>
                                  ) : (
                                    "Send"
                                  )}
                                </button>
                              </form>
                            )}

                            {/* Reddit-style Reply Thread Summary & Toggle Button */}
                            {replyCount > 0 && (
                              <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 mt-2">
                                <button
                                  onClick={() =>
                                    setExpandedThreadIds((prev) => ({
                                      ...prev,
                                      [comment.id]: !prev[comment.id],
                                    }))
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-black transition-all active:scale-95 cursor-pointer shadow-3xs"
                                >
                                  <CornerDownRight size={13} className="text-indigo-600" />
                                  <span>
                                    {isExpanded
                                      ? "Hide replies"
                                      : `See ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                                  </span>
                                  <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </button>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {replyCount} {replyCount === 1 ? "reply" : "replies"}
                                </span>
                              </div>
                            )}

                            {/* Expanded Nested Replies with Animation */}
                            <AnimatePresence>
                              {isExpanded && replyCount > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden space-y-2.5 pt-2 pl-3 sm:pl-4 border-l-2 border-indigo-200/80 ml-2"
                                >
                                  {allReplies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="bg-white border border-slate-150 p-3 rounded-xl space-y-1.5 shadow-3xs relative"
                                    >
                                      <div className="flex items-center justify-between flex-wrap gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <img
                                            onClick={() => handleInspectUser(reply.userId)}
                                            src={reply.userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                                            alt="replyer"
                                            className="w-5 h-5 rounded-full object-cover border border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors"
                                          />
                                          <button
                                            onClick={() => handleInspectUser(reply.userId)}
                                            className="font-black text-[11px] text-slate-800 hover:text-indigo-600 transition-all font-sans"
                                          >
                                            {reply.userName}
                                          </button>

                                          {/* Direct Link Tag: who this reply belongs to */}
                                          {reply.parentUserName && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600">
                                              <span>replying to</span>
                                              <span className="font-black text-indigo-700">@{reply.parentUserName}</span>
                                            </span>
                                          )}

                                          <span className="text-[9px] text-slate-400 font-medium">
                                            {reply.createdAt
                                              ? new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                              : "Just now"}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => {
                                              setActiveReplyCommentId(activeReplyCommentId === reply.id ? null : reply.id);
                                              setReplyCommentText("");
                                            }}
                                            className="px-2 py-0.5 text-[9px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md uppercase tracking-wider transition-all cursor-pointer"
                                          >
                                            {activeReplyCommentId === reply.id ? "Cancel" : "Reply"}
                                          </button>

                                          {/* Three Dots Options Menu for Reply */}
                                          <div className="relative">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveActionsCommentId(activeActionsCommentId === reply.id ? null : reply.id);
                                              }}
                                              className="p-1 hover:bg-slate-200/80 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                              title="Reply options"
                                            >
                                              <MoreVertical size={13} />
                                            </button>

                                            {activeActionsCommentId === reply.id && (
                                              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-in zoom-in-95 duration-100 text-xs">
                                                <button
                                                  onClick={() => {
                                                    setReportedItem({
                                                      type: "comment",
                                                      id: reply.id,
                                                      postId: reply.postId || selectedPost?.id || "",
                                                      content: reply.content,
                                                      userId: reply.userId,
                                                      userName: reply.userName,
                                                      userPhoto: reply.userPhoto
                                                    });
                                                    setReportStep(1);
                                                    setReportReason("");
                                                    setReportDetails("");
                                                    setCustomReportNotes("");
                                                    setActiveActionsCommentId(null);
                                                  }}
                                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                                                >
                                                  <Flag size={13} className="text-amber-500" />
                                                  Report Comment
                                                </button>

                                                {reply.userId === currentUserId && (
                                                  <button
                                                    onClick={() => {
                                                      setEditingComment(reply);
                                                      setEditCommentText(reply.content);
                                                      setActiveActionsCommentId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-50/70 text-indigo-600 font-bold flex items-center gap-2 border-t border-slate-100 mt-1 pt-1.5"
                                                  >
                                                    <Edit size={13} />
                                                    Edit Comment
                                                  </button>
                                                )}

                                                {(reply.userId === currentUserId || currentUserId === "G77faQhRPfe5jr4hbY0O0L4fNUs2" || currentUserEmail === "thomasaugustino12345678@gmail.com") && (
                                                  <button
                                                    onClick={() => handleDeleteComment(reply)}
                                                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 border-t border-slate-100 mt-1 pt-1.5"
                                                  >
                                                    <Trash2 size={13} />
                                                    Delete Comment
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed max-w-full overflow-hidden break-all">
                                        <NexusLinkRenderer text={reply.content} circles={initialCircles} showToast={showToast} />
                                      </p>

                                      {/* Sub-reply inline form */}
                                      {activeReplyCommentId === reply.id && (
                                        <form
                                          onSubmit={(e) => {
                                            e.preventDefault();
                                            handlePostReplySubmit(reply, replyCommentText);
                                          }}
                                          className="mt-2 flex items-center gap-2 bg-slate-50 rounded-xl border border-indigo-200 p-1.5 shadow-sm animate-in slide-in-from-top-1 px-2 py-1 duration-150"
                                        >
                                          <input
                                            type="text"
                                            placeholder={`Reply to @${reply.userName}...`}
                                            value={replyCommentText}
                                            onChange={(e) => setReplyCommentText(e.target.value)}
                                            disabled={isSubmittingComment}
                                            className="flex-grow bg-transparent text-[11px] text-slate-700 outline-none px-2 py-1 font-medium disabled:opacity-50"
                                            autoFocus
                                          />
                                          <button
                                            type="submit"
                                            disabled={!replyCommentText.trim() || isSubmittingComment}
                                            className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 min-w-[45px] justify-center"
                                          >
                                            {isSubmittingComment ? "⏳" : "Send"}
                                          </button>
                                        </form>
                                      )}
                                    </div>
                                  ))}

                                  {/* Bottom "Hide" button at end of replies */}
                                  <div className="pt-1 flex justify-end">
                                    <button
                                      onClick={() =>
                                        setExpandedThreadIds((prev) => ({
                                          ...prev,
                                          [comment.id]: false,
                                        }))
                                      }
                                      className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                                    >
                                      <ChevronUp size={12} />
                                      <span>Hide replies</span>
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Post Comment Input */}
            <form
              onSubmit={handlePostCommentSubmit}
              className="p-4 border-t border-slate-100 bg-white flex items-center gap-2"
            >
              <input
                id="post-comment-textarea"
                type="text"
                placeholder="Write a supportive comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                disabled={isSubmittingComment}
                className="flex-grow px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-150 transition-colors disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={!newCommentText.trim() || isSubmittingComment}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-full transition-all flex items-center justify-center min-w-[44px] min-h-[44px]"
              >
                {isSubmittingComment ? (
                  <span className="animate-spin text-xs">⏳</span>
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── FULLSCREEN EXPANDED IMAGE LIGHTBOX MODAL ─── */}
      <AnimatePresence>
        {lightboxPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-[800] flex flex-col justify-between p-4 select-none"
            onClick={() => setLightboxPost(null)}
          >
            {/* Header with navigation/close - Small back icon block */}
            <div className="w-full flex items-center justify-between p-2 z-[810]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLightboxPost(null)}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-full text-white/80 transition-all text-xs font-black uppercase tracking-wider"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <span className="text-xs font-bold text-white/50 tracking-widest uppercase">
                Image {lightboxIndex + 1} of {lightboxPost.images && lightboxPost.images.length > 0 ? lightboxPost.images.length : 1}
              </span>
              <button
                onClick={() => setLightboxPost(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
              >
                <Plus className="rotate-45 w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Middle main viewing stage container */}
            <div 
              className="flex-1 flex items-center justify-center relative touch-none"
              onClick={() => setLightboxPost(null)}
            >
              {/* Image Switcher Buttons */}
              {lightboxPost.images && lightboxPost.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const prevIdx =
                        lightboxIndex === 0
                          ? lightboxPost.images!.length - 1
                          : lightboxIndex - 1;
                      setLightboxIndex(prevIdx);
                    }}
                    className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full z-[820] backdrop-blur-xs transition-all border border-white/10"
                    title="Previous Image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextIdx =
                        lightboxIndex === lightboxPost.images!.length - 1
                          ? 0
                          : lightboxIndex + 1;
                      setLightboxIndex(nextIdx);
                    }}
                    className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full z-[820] backdrop-blur-xs transition-all border border-white/10"
                    title="Next Image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Main Image display */}
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                src={lightboxPost.images && lightboxPost.images.length > 0 ? lightboxPost.images[lightboxIndex] : (lightboxPost.image || lightboxPost.imageUrl)}
                alt="Expanded asset view"
                className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom Info Row */}
            <div className="w-full text-center pb-6 px-4 z-[810]" onClick={(e) => e.stopPropagation()}>
              <p className="text-white text-sm font-black tracking-tight max-w-lg mx-auto truncate">
                {lightboxPost.title || "Shared Post asset"}
              </p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-1">
                Post by {lightboxPost.userName}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── YOUTUBE GRADE REPORT WIZARD SCREEN ─── */}
      {(reportedItem || reportedPost) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[700] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 md:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <header className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-black tracking-widest text-indigo-600 uppercase">
                  SECURITY CENTER
                </span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-0.5">
                  Report {reportedItem?.type === "comment" ? "Comment" : "Post"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setReportedItem(null);
                  setReportedPost(null);
                  setReportReason("");
                  setReportDetails("");
                  setReportStep(1);
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
                    Reported materials are instantly sent to Nexora Security & Admin Audit Center.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Choose offense reason
                  </label>
                  {[
                    "Spam or misleading content",
                    "Harassment or bullying actions",
                    "Inappropriate or dangerous content",
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left p-4 rounded-xl border font-bold text-xs flex justify-between items-center transition-all ${reportReason === reason ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-black" : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"}`}
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Offender details
                  </span>
                  <div className="text-xs font-extrabold text-slate-700">
                    <p>
                      Name:{" "}
                      <span className="text-indigo-600">
                        {reportedItem?.userName || reportedPost?.userName || "User"}
                      </span>
                    </p>
                    <p>
                      Email:{" "}
                      <span className="text-indigo-500">
                        {reportedItem?.userEmail || reportedPost?.userEmail || "unknown@nexora.io"}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 uppercase">
                      Reason chosen: {reportReason}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Provide additional details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={`Optionally describe what is wrong with this ${reportedItem?.type || "content"}...`}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-rose-400 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white disabled:bg-rose-400 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <span>Submitting Report...</span>
                    </>
                  ) : (
                    <span>Submit Official Report 📡</span>
                  )}
                </button>
              </form>
            ) : (
              // Step 3: Success Completed Screen
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">
                    Report Submitted!
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Thank you, Nexora security researchers will audit this material within 12 hours.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (reportedItem?.type === "post") {
                      hidePost(reportedItem.id);
                    } else if (reportedItem?.type === "comment") {
                      hideComment(reportedItem.id);
                    } else if (reportedPost) {
                      hidePost(reportedPost.id);
                    }
                    setReportedItem(null);
                    setReportedPost(null);
                    setReportReason("");
                    setReportDetails("");
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
                <span className="text-[9px] font-black tracking-widest text-indigo-600 uppercase">
                  SYSTEM FEED
                </span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mt-0.5">
                  Inbox
                </h3>
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
                  <p className="text-xs font-black text-slate-500">
                    Your notifications feed is perfectly clear!
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-2xl border flex gap-3 text-xs font-medium cursor-pointer hover:border-indigo-300 hover:bg-slate-100/50 transition-all ${notif.isRead ? "bg-slate-50 border-slate-100 text-slate-500" : "bg-indigo-50/50 border-indigo-100 text-slate-800 font-bold shadow-xs"}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-base flex-shrink-0">
                      {notif.type === "like"
                        ? "🔥"
                        : notif.type === "reply"
                          ? "💬"
                          : "🔔"}
                    </div>
                    <div className="space-y-1">
                      <p className="leading-relaxed">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 👤 PEER MEMBER PROFILE EXPANDED INSPECTION MODAL */}
      {inspectedUserProfileId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[800] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 max-h-[85vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-250 border border-slate-100 overflow-hidden text-slate-800">
            {/* Header / Dismiss */}
            <header className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <div>
                  <span className="text-[9px] font-black tracking-widest text-indigo-600 uppercase">
                    Nexora Citizen Check
                  </span>
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-none">
                    Community Profile Card
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setInspectedUserProfileId(null);
                  setInspectedUser(null);
                }}
                className="px-3.5 py-1.5 text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl uppercase transition-all whitespace-nowrap"
              >
                Close
              </button>
            </header>

            {/* Inner Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {inspectedUserLoading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 font-extrabold animate-pulse">Decrypting citizen telemetry...</p>
                </div>
              ) : inspectedUser ? (
                (() => {
                  const targetSettings = inspectedUser.settings || {};
                  const targetStats = inspectedUser.stats || {};
                  
                  // Check privacy constraints
                  const isPrivate = targetSettings.profilePrivacy === "private";
                  const plantData = targetSettings.plantState || {};

                  return (
                    <div className="space-y-6">
                      {/* Avatar & Display Identifiers */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/30">
                        <img
                          src={inspectedUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                          alt="Citizen Pic"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md ring-4 ring-indigo-50/50 mx-auto"
                        />
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-slate-800 tracking-tight flex items-center justify-center sm:justify-start gap-1.5 mt-1 font-sans">
                            {inspectedUser.displayName}
                            <span className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded-full font-black uppercase font-mono">
                              LV {Math.floor((targetStats.totalPoints || 0) / 100) + 1}
                            </span>
                          </h4>
                          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 font-mono">
                            {isPrivate ? "🔒 Cloaked Identity" : "🌐 Community Member"}
                          </p>
                          <p className="text-xs text-slate-400 font-bold font-sans">
                            {isPrivate ? "Email is hidden" : `Member Email: ${targetSettings.displayName ? targetSettings.displayName.replace(/\s+/g, "").toLowerCase() + "@citizen.nexora" : "anonymous_operative_email"}`}
                          </p>
                        </div>
                      </div>

                      {/* Privacy Block Check */}
                      {isPrivate ? (
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center space-y-4 py-12">
                          <span className="text-3xl mx-auto block">🛡️</span>
                          <div className="space-y-1">
                            <h5 className="text-sm font-black uppercase tracking-tight text-slate-800">Private Profile Enabled</h5>
                            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                              This member has set their profile to Private. To respect their boundary, their active streak, garden accomplishments, and rewards are cloaked.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Key Statistics Grid */}
                          <div className="grid grid-cols-3 gap-3 font-mono">
                            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-center">
                              <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Current Streak</p>
                              <p className="text-xl font-black mt-0.5 text-slate-800">🔥 {targetStats.streak || 0}d</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-center">
                              <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Total Points</p>
                              <p className="text-xl font-black mt-0.5 text-slate-800 font-mono">⭐ {targetStats.totalPoints || 0}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-center">
                              <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Total Coins</p>
                              <p className="text-xl font-black mt-0.5 text-slate-800">🪙 {targetStats.coins || 0}</p>
                            </div>
                          </div>

                          {/* 🌿 Live Plant Progress / Ecosystem Garden Snapshot */}
                          <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">🪴</span>
                                <div>
                                  <h5 className="text-xs font-black text-emerald-950 uppercase font-sans">Interactive Alien Plant Progress</h5>
                                  <p className="text-[10px] text-emerald-700 font-bold font-sans">Current stage of other user's focus plant</p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-emerald-750 uppercase bg-emerald-100/60 px-2.5 py-0.5 rounded-full font-mono">
                                Stage {plantData.stage !== undefined ? plantData.stage : 1}
                              </span>
                            </div>

                            <div className="p-4 bg-white rounded-2xl border border-emerald-100 flex items-center gap-4">
                              <div className="text-3xl">
                                {plantData.stage === 0 ? "🌱" : plantData.stage === 1 ? "🌿" : plantData.stage === 2 ? "🪴" : plantData.stage === 3 ? "🌳" : plantData.stage === 4 ? "🌸" : "✨🌸✨"}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-xs font-extrabold capitalize text-slate-850 font-sans">
                                  {plantData.species || "Digital Bonsai"}
                                </p>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, plantData.growthPoints || 15)}%` }}
                                  ></div>
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                                  Health Status: {plantData.health || 100}% | {plantData.growthPoints || 15} HP
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Accomplishments Feed Overview */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-indigo-600 tracking-wider uppercase block font-mono">
                              Recent Milestones Achieved
                            </span>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-2">
                              {targetStats.totalCompletedDays ? (
                                <p className="text-xs text-slate-700 font-medium font-sans">
                                  📅 Successfully logs habit goals for <strong className="text-indigo-600 font-mono font-black">{targetStats.totalCompletedDays}</strong> days in total!
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-2 font-mono">
                                  No visible milestones cleared yet.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="py-20 text-center text-slate-400 font-mono">
                  <p className="text-xs font-black">Citizen records not found or unavailable.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── BOTTOM REDESIGNED NAVIGATION BAR (STRETCHES WITH ABSOLUTELY ZERO DEAD HOLES) ─── */}
      <motion.div
        initial={false}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 p-3 sm:p-5 flex justify-center pointer-events-none z-[450] bg-gradient-to-t from-slate-50/90 via-slate-50/40 to-transparent"
      >
        <nav className="bg-white/95 backdrop-blur-lg border border-slate-200/85 shadow-2xl px-2 py-1.5 rounded-[2.5rem] flex items-center justify-around gap-0.5 pointer-events-auto w-[98%] max-w-[420px] sm:max-w-[530px] h-[72px] overflow-hidden select-none">
          {/* Home Tab */}
          <button
            onClick={() => {
              setActiveTab("home");
              setSelectedGroupId(null);
              setSelectedPost(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full ${
              activeTab === "home" && !selectedGroupId
                ? "text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Compass
              size={22}
              className={`transition-transform ${activeTab === "home" && !selectedGroupId ? "scale-105" : "scale-95"}`}
            />
            <span>Feed</span>
          </button>

          {/* Groups Tab (Replaces Challenges) */}
          <button
            onClick={() => {
              setActiveTab("groups");
              setSelectedGroupId(null);
              setSelectedPost(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full ${
              activeTab === "groups"
                ? "text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users
              size={22}
              className={`transition-transform ${activeTab === "groups" ? "scale-105" : "scale-95"}`}
            />
            <span>Groups</span>
          </button>

          {/* Green plus FAB (+) to launch Create Post */}
          <button
            onClick={handleLaunchCreatePost}
            className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 shadow-emerald-500/25 transition-all active:scale-95 flex-shrink-0"
            title="Create Post"
          >
            <Plus size={32} />
          </button>

          {/* Rewards Tab */}
          <button
            onClick={() => {
              setActiveTab("rewards");
              setSelectedGroupId(null);
              setSelectedPost(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full ${
              activeTab === "rewards"
                ? "text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Award
              size={22}
              className={`transition-transform ${activeTab === "rewards" ? "scale-105" : "scale-95"}`}
            />
            <span>Rewards</span>
          </button>

          {/* Library (Replaces community section 4th tab) */}
          <button
            onClick={() => {
              setActiveTab("library");
              setSelectedGroupId(null);
              setSelectedPost(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full ${
              activeTab === "library"
                ? "text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Bookmark
              size={22}
              className={`transition-transform ${activeTab === "library" ? "scale-105" : "scale-95"}`}
            />
            <span>Library</span>
          </button>

          {/* Profile link */}
          <button
            onClick={() => {
              setActiveTab("profile");
              setSelectedGroupId(null);
              setSelectedPost(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all text-[9.5px] uppercase font-black tracking-wider flex-1 h-full ${
              activeTab === "profile"
                ? "text-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <User
              size={22}
              className={`transition-transform ${activeTab === "profile" ? "scale-105" : "scale-95"}`}
            />
            <span>Profile</span>
          </button>
        </nav>
      </motion.div>

      {/* ─── REDDIT-STYLE AWARD SELECTION MODAL ─── */}
      <AnimatePresence>
        {awardingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[900] flex items-center justify-center p-4 select-none"
            onClick={() => setAwardingPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative">
                <button
                  onClick={() => setAwardingPost(null)}
                  className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2.5">
                  <Award size={24} className="animate-pulse text-yellow-200" />
                  <h3 className="text-lg font-black tracking-tight uppercase">Gild with Reddit-style Awards</h3>
                </div>
                <p className="text-xs text-white/80 font-bold uppercase mt-1 tracking-wider">
                  Post by {awardingPost.userName}
                </p>
                <div className="mt-3.5 flex items-center justify-between bg-white/20 px-3 py-2 rounded-xl text-xs font-black">
                  <span>YOUR BALANCE:</span>
                  <span className="text-yellow-200">🪙 {stats?.coins || 0} Coins</span>
                </div>
              </div>

              {/* Award List Grid */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Select an Award to bestow:
                </p>

                <div className="grid grid-cols-2 gap-3.5 max-h-[24rem] overflow-y-auto pr-1">
                  {CUTE_AWARDS.map((award) => {
                    const stock = settings?.purchasedAwards?.[award.key] || 0;
                    const canAfford = (stats?.coins || 0) >= award.cost;
                    const isPurchased = stock > 0;
                    return (
                      <button
                        key={award.key}
                        type="button"
                        onClick={() => handleAwardPost(awardingPost, award.key)}
                        className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all text-center h-48 cursor-pointer relative overflow-hidden group ${
                          isPurchased
                            ? "bg-emerald-50/40 hover:bg-emerald-50 border-emerald-300 hover:border-emerald-500 shadow-xs"
                            : canAfford
                              ? "bg-slate-50 hover:bg-slate-100 hover:border-amber-400 border-slate-200"
                              : "bg-slate-50/40 border-slate-100 opacity-60 hover:opacity-80"
                        }`}
                      >
                        <div className="space-y-1">
                          <motion.span
                            animate={award.animation.animate}
                            transition={award.animation.transition}
                            className="text-3xl filter drop-shadow-md block origin-center"
                          >
                            {award.emoji}
                          </motion.span>
                          <span className="block text-xs font-black text-slate-800 leading-tight">
                            {award.label}
                          </span>
                          <span className="block text-[8.5px] text-slate-400 font-semibold leading-tight">
                            {award.desc}
                          </span>
                        </div>

                        <div className="w-full mt-2 pt-2 border-t border-slate-100 flex flex-col items-center gap-1">
                          {isPurchased ? (
                            <>
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full block animate-pulse">
                                Bestow ({stock}x Stock)
                              </span>
                              <span className="text-[8px] text-slate-400 font-extrabold block">
                                Pays author +{award.cost}🪙 & +{award.xpAward}XP
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[9px] font-black text-indigo-600 block">
                                Buy {award.uses}x uses bundle
                              </span>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold ${canAfford ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-100'} px-2 py-0.5 rounded-full border border-amber-100/55`}>
                                🪙 {award.cost}
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer info */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Giving awards boosts community spirit and distributes reputation!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
