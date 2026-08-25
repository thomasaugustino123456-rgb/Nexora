import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Users,
  Sprout,
  Trophy,
  Coins,
  Shield,
  Star,
  Search,
  Bell,
  Send,
  Sparkles,
  BookOpen,
  MessageSquare,
  TrendingUp,
  PieChart as PieChartIcon,
  Flame,
  User,
  Heart,
  Droplets,
  Calendar,
  Layers,
  HelpCircle,
  Eye,
  CheckCircle,
  Inbox,
  AlertTriangle,
  RefreshCw,
  Flag,
  ShieldAlert,
  Trash2,
  UserX,
  CheckCircle2,
  Filter,
  Mail
} from "lucide-react";
import { AdminGmailSupport } from "./AdminGmailSupport";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

interface AdminPanelProps {
  currentUserId: string;
  currentUserEmail: string | null;
  onBack: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

interface UserDetail {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  streak: number;
  bestStreak: number;
  totalPoints: number;
  level: number;
  coins: number;
  xp: number;
  createdAt?: string;
  plantState?: {
    type: string;
    stage: number;
    health: number;
    isThirsty: boolean;
    growthPoints: number;
  };
  garden?: {
    tiles?: any[];
    inventory?: Record<string, number>;
  };
  purchasedItems?: string[];
  purchasedHouseItemIds?: string[];
}

interface FeedbackLog {
  id: string;
  category: string;
  message: string;
  userEmail: string;
  userName: string;
  rating: number;
  createdAt: any;
}

export interface CommunityReport {
  id: string;
  reporterId: string;
  reporterName?: string;
  reporterEmail?: string;
  reportedUserId: string;
  reportedUserName?: string;
  targetType: "post" | "comment";
  targetId: string;
  postId?: string;
  targetContent: string;
  reason: string;
  details?: string;
  customNotes?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: any;
}

// Active tabs mapping
// default tab: 'overview' (displays nice high-level stats cards & beautiful charts)
// 'tab_population': deep dive into current registrants list
// 'tab_cultivated': list of users who have planted botanical companions
// 'tab_arsenal': greenhouse inventories of all users
// 'tab_signals': signals & feedback messaging logs with read/unread tracking
// 'tab_reports': community incident reports (post & comment reporting + bans)
// 'tab_broadcast': broadcaster workspace
// 'tab_gmail': official support Gmail inbox viewer
type AdminSectionTab = "overview" | "tab_population" | "tab_cultivated" | "tab_arsenal" | "tab_signals" | "tab_reports" | "tab_broadcast" | "tab_gmail";

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUserId,
  currentUserEmail,
  onBack,
  showToast
}) => {
  const [usersList, setUsersList] = useState<UserDetail[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackLog[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
  const [reportFilter, setReportFilter] = useState<"all" | "pending" | "resolved" | "post" | "comment">("all");
  const [banDurationModalUser, setBanDurationModalUser] = useState<{ uid: string; userName: string; reportId?: string } | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminSectionTab>("overview");

  // Track read feedbacks using local state backed by localStorage
  const [readFeedbackIds, setReadFeedbackIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("admin_read_feedback_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track active feedback displaying in details card
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackLog | null>(null);

  // Broadcast dispatch states
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"system" | "reward" | "alert" | "mascot">("system");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Security Credentials validation
  const isAuthorized =
    currentUserId === "G77faQhRPfe5jr4hbY0O0L4fNUs2" ||
    currentUserEmail === "thomasaugustino12345678@gmail.com";

  useEffect(() => {
    if (!isAuthorized) {
      showToast("Access Denied: Admin Credentials Missing", "error");
      onBack();
      return;
    }
    fetchAdminData();
  }, [isAuthorized]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Users, Leaderboard, Rank, and Deleted Users in parallel safely
      const [usersResult, lbResult, rankResult, deletedResult] = await Promise.allSettled([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "leaderboard")),
        getDocs(collection(db, "rank")),
        getDocs(collection(db, "deleted_users"))
      ]);

      const deletedIds = new Set<string>();
      if (deletedResult.status === "fulfilled") {
        deletedResult.value.forEach((d) => {
          deletedIds.add(d.id);
          const data = d.data();
          if (data?.uid) deletedIds.add(data.uid);
          if (data?.userId) deletedIds.add(data.userId);
        });
      }

      const userMap = new Map<string, UserDetail>();

      const processDocData = (docId: string, data: any) => {
        if (!data || docId.startsWith("bot-") || deletedIds.has(docId) || data.deleted === true || data.isDeleted === true) return;
        const uid = docId;
        const userStats = data.stats || {};

        const existing = userMap.get(uid);

        const email = data.email || data.Email || data["Email address"] || existing?.email || "No Email";
        const displayName = data.displayName || data.accountName || data.name || data.Name || existing?.displayName || "Anonymous User";
        const role = data.role || existing?.role || "user";
        
        const streak = Math.max(
          typeof data.streak === "number" ? data.streak : 0,
          typeof userStats.streak === "number" ? userStats.streak : 0,
          existing?.streak || 0
        );
        const bestStreak = Math.max(
          typeof data.bestStreak === "number" ? data.bestStreak : 0,
          typeof userStats.bestStreak === "number" ? userStats.bestStreak : 0,
          existing?.bestStreak || 0
        );
        const totalPoints = Math.max(
          typeof data.totalPoints === "number" ? data.totalPoints : 0,
          typeof data.weeklyPoints === "number" ? data.weeklyPoints : 0,
          typeof data.points === "number" ? data.points : 0,
          typeof userStats.totalPoints === "number" ? userStats.totalPoints : 0,
          existing?.totalPoints || 0
        );
        const level = Math.max(
          typeof data.level === "number" ? data.level : 1,
          typeof userStats.level === "number" ? userStats.level : 1,
          existing?.level || 1
        );
        const coins = Math.max(
          typeof data.coins === "number" ? data.coins : 0,
          typeof userStats.coins === "number" ? userStats.coins : 0,
          existing?.coins || 0
        );
        const xp = Math.max(
          typeof data.xp === "number" ? data.xp : 0,
          typeof data.weeklyXP === "number" ? data.weeklyXP : 0,
          typeof userStats.xp === "number" ? userStats.xp : 0,
          totalPoints,
          existing?.xp || 0
        );

        const plantState = data.plantState || userStats.plantState || existing?.plantState;
        const garden = data.garden || userStats.garden || existing?.garden;
        const purchasedItems = data.purchasedItems || userStats.purchasedItems || existing?.purchasedItems || [];
        const purchasedHouseItemIds = data.purchasedHouseItemIds || existing?.purchasedHouseItemIds || [];

        userMap.set(uid, {
          uid,
          email,
          displayName,
          role,
          streak,
          bestStreak,
          totalPoints,
          level,
          coins,
          xp,
          createdAt: data.createdAt || existing?.createdAt,
          plantState,
          garden,
          purchasedItems,
          purchasedHouseItemIds
        });
      };

      if (usersResult.status === "fulfilled") {
        usersResult.value.forEach((docSnap) => processDocData(docSnap.id, docSnap.data()));
      }
      if (lbResult.status === "fulfilled") {
        lbResult.value.forEach((docSnap) => processDocData(docSnap.id, docSnap.data()));
      }
      if (rankResult.status === "fulfilled") {
        rankResult.value.forEach((docSnap) => processDocData(docSnap.id, docSnap.data()));
      }

      const parsedUsers = Array.from(userMap.values());
      setUsersList(parsedUsers);
      if (parsedUsers.length > 0 && !selectedUser) {
        setSelectedUser(parsedUsers[0]);
      }

      // 2. Fetch Feedbacks safely
      try {
        const feedbackSnap = await getDocs(collection(db, "feedback"));
        const parsedFeedbacks: FeedbackLog[] = [];
        feedbackSnap.forEach((fbDoc) => {
          const fbData = fbDoc.data();
          parsedFeedbacks.push({
            id: fbDoc.id,
            category: fbData.category || "General",
            message: fbData.message || "",
            userEmail: fbData.userEmail || "Anonymous",
            userName: fbData.userName || "user",
            rating: fbData.rating || 5,
            createdAt: fbData.createdAt
          });
        });
        
        parsedFeedbacks.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        
        setFeedbacks(parsedFeedbacks);
        if (parsedFeedbacks.length > 0 && !selectedFeedback) {
          setSelectedFeedback(parsedFeedbacks[0]);
        }
      } catch (fbErr) {
        console.warn("Could not fetch feedback logs:", fbErr);
      }

      // 3. Fetch Community Reports safely (Firestore + LocalStorage)
      try {
        const parsedReports: CommunityReport[] = [];

        // Fetch from community_reports collection
        try {
          const reportsSnap = await getDocs(collection(db, "community_reports"));
          reportsSnap.forEach((rDoc) => {
            const rData = rDoc.data();
            const id = rDoc.id || rData.id;
            parsedReports.push({
              id: id,
              reporterId: rData.reporterId || rData.reporterUserId || "",
              reporterName: rData.reporterName || rData.reporterUserName || "Anonymous",
              reporterEmail: rData.reporterEmail || rData.reporterUserEmail || "",
              reportedUserId: rData.reportedUserId || "",
              reportedUserName: rData.reportedUserName || "Unknown User",
              targetType: rData.targetType || "post",
              targetId: rData.targetId || "",
              postId: rData.postId || "",
              targetContent: rData.targetContent || "",
              reason: rData.reason || "Inappropriate Content",
              details: rData.details || rData.customNotes || "",
              customNotes: rData.customNotes || rData.details || "",
              status: rData.status || "pending",
              createdAt: rData.createdAt
            });
          });
        } catch (e) {
          console.warn("Error reading community_reports collection:", e);
        }

        // Fetch from legacy reports collection for compatibility
        try {
          const legacySnap = await getDocs(collection(db, "reports"));
          legacySnap.forEach((rDoc) => {
            const rData = rDoc.data();
            const id = rDoc.id || rData.id;
            if (!parsedReports.some((pr) => pr.id === id)) {
              parsedReports.push({
                id: id,
                reporterId: rData.reporterId || rData.reporterUserId || "",
                reporterName: rData.reporterName || rData.reporterUserName || "Anonymous",
                reporterEmail: rData.reporterEmail || rData.reporterUserEmail || "",
                reportedUserId: rData.reportedUserId || "",
                reportedUserName: rData.reportedUserName || "Unknown User",
                targetType: rData.targetType || "post",
                targetId: rData.targetId || "",
                postId: rData.postId || "",
                targetContent: rData.targetContent || "",
                reason: rData.reason || "Inappropriate Content",
                details: rData.details || rData.customNotes || "",
                customNotes: rData.customNotes || rData.details || "",
                status: rData.status || "pending",
                createdAt: rData.createdAt
              });
            }
          });
        } catch (e) {
          console.warn("Error reading legacy reports collection:", e);
        }

        // Merge local storage reports if any are missing from Firestore
        try {
          const localStored = localStorage.getItem("nexora_community_reports");
          if (localStored) {
            const localArr: any[] = JSON.parse(localStored);
            localArr.forEach((lRep) => {
              if (lRep && lRep.id && !parsedReports.some((pr) => pr.id === lRep.id)) {
                parsedReports.push({
                  id: lRep.id,
                  reporterId: lRep.reporterId || lRep.reporterUserId || "",
                  reporterName: lRep.reporterName || lRep.reporterUserName || "Anonymous",
                  reporterEmail: lRep.reporterEmail || lRep.reporterUserEmail || "",
                  reportedUserId: lRep.reportedUserId || "",
                  reportedUserName: lRep.reportedUserName || "Unknown User",
                  targetType: lRep.targetType || "post",
                  targetId: lRep.targetId || "",
                  postId: lRep.postId || "",
                  targetContent: lRep.targetContent || "",
                  reason: lRep.reason || "Inappropriate Content",
                  details: lRep.details || lRep.customNotes || "",
                  customNotes: lRep.customNotes || lRep.details || "",
                  status: lRep.status || "pending",
                  createdAt: lRep.createdAt
                });
              }
            });
          }
        } catch (e) {
          console.warn("Error reading local reports", e);
        }

        parsedReports.sort((a, b) => {
          const getTime = (val: any) => {
            if (typeof val === "number") return val;
            if (typeof val === "string") return new Date(val).getTime() || 0;
            if (val?.seconds) return val.seconds * 1000;
            return 0;
          };
          return getTime(b.createdAt) - getTime(a.createdAt);
        });

        // Deduplicate reports by targetId and targetType so each reported post/comment appears as 1 single entry
        const dedupedMap = new Map<string, CommunityReport>();
        parsedReports.forEach((rep) => {
          const key = (rep.targetId && rep.targetType) ? `${rep.targetType}_${rep.targetId}` : rep.id;
          if (!dedupedMap.has(key)) {
            dedupedMap.set(key, rep);
          } else {
            const existing = dedupedMap.get(key)!;
            if (existing.status !== "pending" && rep.status === "pending") {
              dedupedMap.set(key, rep);
            }
          }
        });
        const finalReportsList = Array.from(dedupedMap.values());

        setReports(finalReportsList);
        if (finalReportsList.length > 0 && !selectedReport) {
          setSelectedReport(finalReportsList[0]);
        }
      } catch (repErr) {
        console.warn("Could not fetch community reports:", repErr);
      }
    } catch (error) {
      console.error("AdminPanel: Error loading cloud database metrics:", error);
      showToast("Sync Failure: Restricted operational path", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReportedContent = async (rep: CommunityReport) => {
    try {
      if (rep.targetType === "post") {
        await deleteDoc(doc(db, "posts", rep.targetId)).catch((e) => console.warn(e));
        await deleteDoc(doc(db, "community_posts", rep.targetId)).catch((e) => console.warn(e));

        try {
          const localPosts = localStorage.getItem("nexora_community_posts");
          if (localPosts) {
            const parsed = JSON.parse(localPosts);
            const filtered = parsed.filter((p: any) => p.id !== rep.targetId);
            localStorage.setItem("nexora_community_posts", JSON.stringify(filtered));
          }
        } catch (e) {}
      } else if (rep.targetType === "comment") {
        if (rep.postId) {
          await deleteDoc(doc(db, "posts", rep.postId, "comments", rep.targetId)).catch((e) => console.warn(e));
          await deleteDoc(doc(db, "community_posts", rep.postId, "comments", rep.targetId)).catch((e) => console.warn(e));
        }
        await deleteDoc(doc(db, "comments", rep.targetId)).catch((e) => console.warn(e));
      }

      const updatedReports = reports.map((r) => r.id === rep.id ? { ...r, status: "resolved" as const } : r);
      setReports(updatedReports);
      localStorage.setItem("nexora_community_reports", JSON.stringify(updatedReports));
      await setDoc(doc(db, "community_reports", rep.id), { status: "resolved" }, { merge: true }).catch((e) => console.warn(e));

      showToast(`Reported ${rep.targetType} deleted & report resolved!`, "success");
    } catch (err) {
      console.error("Error deleting reported content:", err);
      showToast("Error deleting reported content", "error");
    }
  };

  const handleBanUser = async (reportedUserId: string, banType: "7d" | "30d" | "permanent" | "unban", reportId?: string) => {
    try {
      const isBanning = banType !== "unban";
      let bannedUntil: string | null = null;
      let isPermanent = false;

      if (banType === "7d") {
        bannedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (banType === "30d") {
        bannedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (banType === "permanent") {
        bannedUntil = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
        isPermanent = true;
      }

      const banPayload = {
        communityBanned: isBanning,
        communityBannedUntil: bannedUntil,
        communityBannedPermanent: isPermanent,
        communityBanReason: banReasonInput || "Violation of community rules",
        bannedAt: isBanning ? new Date().toISOString() : null
      };

      await setDoc(doc(db, "users", reportedUserId), banPayload, { merge: true }).catch((e) => console.warn(e));
      await setDoc(doc(db, "user_settings", reportedUserId), banPayload, { merge: true }).catch((e) => console.warn(e));

      if (reportId) {
        const updatedReports = reports.map((r) => r.id === reportId ? { ...r, status: "resolved" as const } : r);
        setReports(updatedReports);
        localStorage.setItem("nexora_community_reports", JSON.stringify(updatedReports));
        await setDoc(doc(db, "community_reports", reportId), { status: "resolved" }, { merge: true }).catch((e) => console.warn(e));
      }

      setBanDurationModalUser(null);
      setBanReasonInput("");

      if (isBanning) {
        showToast(`User banned successfully (${banType === "7d" ? "1 week" : banType === "30d" ? "1 month" : "Permanent"})!`, "success");
      } else {
        showToast("User unbanned successfully!", "success");
      }
    } catch (err) {
      console.error("Error setting user ban:", err);
      showToast("Error setting user ban", "error");
    }
  };

  // Flag feedback as read and dismiss green dot
  const handleSelectFeedback = (fb: FeedbackLog) => {
    setSelectedFeedback(fb);
    if (!readFeedbackIds.includes(fb.id)) {
      const updated = [...readFeedbackIds, fb.id];
      setReadFeedbackIds(updated);
      localStorage.setItem("admin_read_feedback_ids", JSON.stringify(updated));
    }
  };

  // Transmit Broadcast Notification globally to all users' document paths
  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      showToast("Please supply a dispatch title & guidance context", "info");
      return;
    }

    setIsBroadcasting(true);
    try {
      let broadcastCount = 0;
      for (const u of usersList) {
        const notifRef = collection(db, "users", u.uid, "notifications");
        await addDoc(notifRef, {
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
          read: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
        broadcastCount++;
      }

      showToast(`Transmit Successful: Dispatched system directive to ${broadcastCount} operatives!`, "success");
      setBroadcastTitle("");
      setBroadcastMessage("");
    } catch (e) {
      console.error("AdminPanel: Broadcast Delivery failure", e);
      showToast("Dispatch Failed: High priority protocol lock active", "error");
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!isAuthorized) return null;

  // Filter accounts according to query
  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cultivated users index (at least one plant placed on tiles or plantState exists)
  const cultivatedUsers = usersList.filter((u) => {
    let hasPlanted = false;
    if (u.plantState && u.plantState.type) hasPlanted = true;
    if (u.garden?.tiles) {
      u.garden.tiles.forEach((tile) => {
        if (tile && tile.plantId) hasPlanted = true;
      });
    }
    return hasPlanted;
  });

  // Stored arsenal users index (having items in greenhouse inventory)
  const arsenalUsers = usersList.filter((u) => {
    if (!u.garden?.inventory) return false;
    return Object.values(u.garden.inventory).some((cnt) => (cnt || 0) > 0);
  });

  // Numeric summary calculations
  const totalUsersCount = usersList.length;
  const totalFeedbackCount = feedbacks.length;
  
  // Plant count on current active tiles
  let totalSeedsPlantedCount = 0;
  let totalSeedsInInventory = 0;
  usersList.forEach((u) => {
    if (u.garden?.tiles) {
      u.garden.tiles.forEach(tile => {
        if (tile && tile.plantId) totalSeedsPlantedCount++;
      });
    } else if (u.plantState && u.plantState.type) {
      totalSeedsPlantedCount++;
    }
    if (u.garden?.inventory) {
      Object.values(u.garden.inventory).forEach(count => {
        totalSeedsInInventory += (count || 0);
      });
    }
  });

  // Pie Chart: Level Buckets
  const levelBuckets = { "Level 1-10": 0, "Level 11-30": 0, "Level 31-50": 0, "Level 50+": 0 };
  usersList.forEach((u) => {
    if (u.level <= 10) levelBuckets["Level 1-10"]++;
    else if (u.level <= 30) levelBuckets["Level 11-30"]++;
    else if (u.level <= 50) levelBuckets["Level 31-50"]++;
    else levelBuckets["Level 50+"]++;
  });
  const levelChartData = Object.entries(levelBuckets).map(([key, value]) => ({
    name: key,
    value
  })).filter(item => item.value > 0);

  // Ecosystem Trends: Botanical companion counts layout
  const plantTypeCounts: Record<string, number> = {};
  usersList.forEach((u) => {
    const pType = u.plantState?.type || "None/Sprout";
    plantTypeCounts[pType] = (plantTypeCounts[pType] || 0) + 1;
  });
  const plantChartData = Object.entries(plantTypeCounts).map(([key, value]) => ({
    name: key,
    value
  }));

  // Line Chart: Engagement curve of active players
  const topUsersByXp = [...usersList].sort((a, b) => b.xp - a.xp).slice(0, 10);
  const xpProgressionData = topUsersByXp.map((u, i) => ({
    index: `#${i + 1}`,
    name: u.displayName.length > 8 ? u.displayName.slice(0, 7) + ".." : u.displayName,
    XP: u.xp,
    Coins: u.coins
  }));

  const chartColors = ["#059669", "#10B981", "#34D399", "#0284C7", "#F59E0B", "#EF4444"];

  return (
    <div className="min-h-screen bg-[#F4F9F4] text-slate-800 flex flex-col font-sans relative overflow-hidden">
      {/* Light Emerald Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E1EFE1_1px,transparent_1px),linear-gradient(to_bottom,#E1EFE1_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-300/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 left-1/4 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Control Deck Header - White & Green */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl active:scale-95 transition-all outline-none border border-emerald-200 shadow-xs"
            title="Return to profile"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase font-mono">SECURE INTERFACE HOST</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              Command Center <Shield size={20} className="text-emerald-600" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase">{currentUserEmail}</span>
            <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Root Level Sovereign
            </span>
          </div>
          <button
            onClick={fetchAdminData}
            title="Reload Cloud State"
            className="p-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync Cloud</span>
          </button>
        </div>
      </header>

      {/* Main Command Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col gap-6 relative z-10">
        
        {/* Interactive Bento Matrix boxes */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bento box 1: Active Population */}
          <div
            onClick={() => setActiveTab("tab_population")}
            className={`p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === "tab_population"
                ? "bg-white border-2 border-emerald-500 shadow-md shadow-emerald-500/10"
                : "bg-white border-emerald-100/90 hover:border-emerald-300"
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
              activeTab === "tab_population" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              <Users size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Total Population</span>
            <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
              {isLoading ? "..." : totalUsersCount}
            </div>
            <p className="text-[9px] font-bold mt-2 uppercase text-emerald-700 flex items-center gap-1">
              Active accounts index <Sparkles size={10} />
            </p>
          </div>

          {/* Bento box 2: Soils Cultivated */}
          <div
            onClick={() => setActiveTab("tab_cultivated")}
            className={`p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === "tab_cultivated"
                ? "bg-white border-2 border-emerald-500 shadow-md shadow-emerald-500/10"
                : "bg-white border-emerald-100/90 hover:border-emerald-300"
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
              activeTab === "tab_cultivated" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              <Sprout size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Planted Companions</span>
            <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
              {isLoading ? "..." : totalSeedsPlantedCount}
            </div>
            <p className="text-[9px] font-bold mt-2 uppercase text-emerald-700 flex items-center gap-1">
              Planted companion seeds <Droplets size={10} />
            </p>
          </div>

          {/* Bento box 3: Greenhouse Arsenal */}
          <div
            onClick={() => setActiveTab("tab_arsenal")}
            className={`p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === "tab_arsenal"
                ? "bg-white border-2 border-emerald-500 shadow-md shadow-emerald-500/10"
                : "bg-white border-emerald-100/90 hover:border-emerald-300"
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
              activeTab === "tab_arsenal" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              <Layers size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Greenhouse Stash</span>
            <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
              {isLoading ? "..." : totalSeedsInInventory}
            </div>
            <p className="text-[9px] font-bold mt-2 uppercase text-emerald-700 flex items-center gap-1">
              Unplanted reserve seeds <Trophy size={10} />
            </p>
          </div>

          {/* Bento box 4: User signals / Signals message logs */}
          <div
            onClick={() => setActiveTab("tab_signals")}
            className={`p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === "tab_signals"
                ? "bg-white border-2 border-emerald-500 shadow-md shadow-emerald-500/10"
                : "bg-white border-emerald-100/90 hover:border-emerald-300"
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
              activeTab === "tab_signals" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              <MessageSquare size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Transmissions Received</span>
            <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight flex items-center gap-2">
              {isLoading ? "..." : totalFeedbackCount}
              {/* Green notification indicator light */}
              {!isLoading && feedbacks.some((fb) => !readFeedbackIds.includes(fb.id)) && (
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" title="Fresh feedback available!" />
              )}
            </div>
            <p className="text-[9px] font-bold mt-2 uppercase text-emerald-700 flex items-center gap-1">
              Operator feedbacks log <Bell size={10} />
            </p>
          </div>
        </section>

        {/* Workspace Operations Tab Buttons BAR */}
        <section className="flex bg-emerald-50/80 border border-emerald-200/80 p-1.5 rounded-3xl gap-1.5 overflow-x-auto no-scrollbar shadow-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-emerald-900 hover:bg-white/80"
            }`}
          >
            📊 Command Dashboard
          </button>
          <button
            onClick={() => setActiveTab("tab_population")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_population"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-emerald-900 hover:bg-white/80"
            }`}
          >
            👥 Accounts ({totalUsersCount})
          </button>
          <button
            onClick={() => setActiveTab("tab_cultivated")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_cultivated"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-emerald-900 hover:bg-white/80"
            }`}
          >
            🌿 Gardeners ({cultivatedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("tab_arsenal")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_arsenal"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-emerald-900 hover:bg-white/80"
            }`}
          >
            🎒 Vaults ({arsenalUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("tab_signals")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_signals"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-emerald-900 hover:bg-white/80"
            }`}
          >
            💬 Signals ({totalFeedbackCount})
            {feedbacks.some((fb) => !readFeedbackIds.includes(fb.id)) && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("tab_reports")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_reports"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-emerald-900 hover:bg-white/80"
            }`}
          >
            🛡️ Reports ({reports.length})
            {reports.some((r) => r.status === "pending") && (
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("tab_broadcast")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_broadcast"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-emerald-900 hover:bg-white/80"
            }`}
          >
            📢 Broadcaster
          </button>
          <button
            onClick={() => setActiveTab("tab_gmail")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_gmail"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:text-emerald-900 hover:bg-white/80"
            }`}
          >
            <Mail size={14} className="text-red-500" />
            <span>Support Gmail</span>
          </button>
        </section>

        {/* Tab content views rendering */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700 font-mono">Siphoning Cloud Metrics...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col gap-6"
            >
              
              {/* TABS 1: OVERVIEW METRIC DASHBOARD */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Line Chart curve */}
                  <div className="bg-white border border-emerald-100/90 p-6 rounded-3xl flex flex-col shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.2em] font-mono">Discipline Engagement Vector</span>
                        <h3 className="text-base font-black text-slate-900 uppercase mt-1">XP Milestones of Top Players</h3>
                      </div>
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                        <TrendingUp size={18} />
                      </div>
                    </div>
                    
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={xpProgressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2ECE2" opacity={0.8} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ background: "#ffffff", border: "1px solid #d1fae5", borderRadius: "1rem", color: "#065f46", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
                            labelStyle={{ color: "#047857", fontWeight: "bold", fontSize: "11px" }}
                            itemStyle={{ fontSize: "12px", padding: "2px 0" }}
                          />
                          <Line type="monotone" dataKey="XP" stroke="#059669" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Coins" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-4 text-center">
                      Reflecting dynamic XP peaks relative to user account vaults
                    </p>
                  </div>

                  {/* Pie chart with descriptive breakdowns */}
                  <div className="bg-white border border-emerald-100/90 p-6 rounded-3xl flex flex-col shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.2em] font-mono">User Tier Matrix</span>
                        <h3 className="text-base font-black text-slate-900 uppercase mt-1">Player Experience Buckets</h3>
                      </div>
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                        <PieChartIcon size={18} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="h-60 w-full flex items-center justify-center">
                        {levelChartData.length === 0 ? (
                          <p className="text-slate-400 text-xs font-bold uppercase">No user level aggregates</p>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={levelChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={75}
                                dataKey="value"
                              >
                                {levelChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ background: "#ffffff", border: "1px solid #d1fae5", borderRadius: "1rem", color: "#065f46" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Explicit Legend indicators */}
                      <div className="flex flex-col gap-2.5">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Level Distributions Detailed</h4>
                        {levelChartData.map((bucket, index) => {
                          const percent = ((bucket.value / totalUsersCount) * 100).toFixed(0);
                          return (
                            <div key={bucket.name} className="flex items-center justify-between bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                                <span className="text-xs font-bold text-slate-700">{bucket.name}</span>
                              </div>
                              <span className="text-xs font-black text-slate-900">{bucket.value} ({percent}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart: Popular plant companion selections */}
                  <div className="bg-white border border-emerald-100/90 p-6 rounded-3xl flex flex-col shadow-xs lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.2em] font-mono">Botanical trends metric</span>
                        <h3 className="text-base font-black text-slate-900 uppercase mt-1">Ecosystem companion selection distribution</h3>
                      </div>
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                        <Sprout size={18} />
                      </div>
                    </div>

                    <div className="h-72 w-full mt-4">
                      {plantChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Ecosystem companions not seeded yet</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={plantChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2ECE2" opacity={0.8} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ background: "#ffffff", border: "1px solid #d1fae5", borderRadius: "1rem", color: "#065f46" }}
                            />
                            <Bar dataKey="value" fill="#059669" radius={[8, 8, 0, 0]}>
                              {plantChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ACTIVE POPULATION INVENTORY LIST */}
              {activeTab === "tab_population" && (
                <div className="bg-white border border-emerald-100/90 p-6 rounded-3xl flex flex-col gap-5 shadow-xs">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 uppercase">Sovereign Accounts Registry</h3>
                      <p className="text-[10px] text-slate-500">Search and inspect registered operative profiles</p>
                    </div>
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search by nickname or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-600 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-emerald-900 font-mono text-[9px] uppercase tracking-wider">
                          <th className="p-4 font-bold">NickName / Contact</th>
                          <th className="p-4 font-bold">Total Power (XP)</th>
                          <th className="p-4 font-bold">Experience level</th>
                          <th className="p-4 font-bold">Vault Balance</th>
                          <th className="p-4 font-bold">Active Streak</th>
                          <th className="p-4 text-center font-bold">Interactions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100/70 text-slate-700 font-semibold font-mono">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                              No matching citizen accounts found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.uid} className="hover:bg-emerald-50/40 transition-colors">
                              <td className="p-4 font-sans">
                                <span className="text-slate-900 font-black text-sm block">{u.displayName}</span>
                                <span className="text-[10.5px] text-emerald-800 font-mono select-all bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 mt-1 block w-fit">
                                  {u.email}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                                  <Star size={14} className="text-amber-500" fill="currentColor" /> {u.xp} XP
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-black text-[10.5px]">
                                  Lvl {u.level}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-amber-600 flex items-center gap-1 mt-2">
                                <Coins size={14} /> {u.coins}
                              </td>
                              <td className="p-4">
                                <span className="flex items-center gap-1 text-orange-600 font-black">
                                  <Flame size={15} /> {u.streak}d
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setSelectedUser(u)}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] rounded-xl tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xs"
                                >
                                  Deep Inspect 🔍
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: PLANTED COMPANIONS DETAILED LIST */}
              {activeTab === "tab_cultivated" && (
                <div className="bg-white border border-emerald-100/90 p-6 rounded-3xl flex flex-col gap-4 shadow-xs">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">Ecosystem Garden Active Logs</h3>
                    <p className="text-[10px] text-slate-500">Reviewing placed companion status and growth progression</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cultivatedUsers.length === 0 ? (
                      <div className="col-span-2 p-8 text-center text-slate-400 font-bold uppercase tracking-wider bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        No companions planted on citizen grid soils yet
                      </div>
                    ) : (
                      cultivatedUsers.map((u) => {
                        const plant = u.plantState;
                        const tiles = u.garden?.tiles || [];
                        const placedCount = tiles.filter(t => t && t.plantId).length;
                        
                        return (
                          <div
                            key={u.uid}
                            className="bg-emerald-50/30 border border-emerald-100 p-5 rounded-2xl flex flex-col gap-4 relative hover:border-emerald-300 transition-colors shadow-xs"
                          >
                            <div className="flex justify-between items-start border-b border-emerald-100 pb-3">
                              <div>
                                <h4 className="font-black text-sm text-slate-900">{u.displayName}</h4>
                                <span className="text-[10px] text-emerald-800 font-mono select-all block mt-0.5">{u.email}</span>
                              </div>
                              <span className="px-2 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-[9px] font-black uppercase tracking-wider block">
                                Companion Deployed
                              </span>
                            </div>

                            <div className="grid grid-flow-row gap-3">
                              {plant && (
                                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100 shadow-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                                      <Sprout size={18} />
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block font-mono">Primary Capsule</span>
                                      <span className="font-black text-xs uppercase text-slate-900 mt-0.5 block">{plant.type}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block font-mono">Vitality</span>
                                    <span className="font-black text-xs text-rose-600 block">{plant.health}% Health</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block font-mono">Phase</span>
                                    <span className="font-black text-xs text-emerald-700 block">Stage {plant.stage}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-600">Total Placed Seeds (3x3 Grid):</span>
                                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px]">
                                  {placedCount} Soils Active
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedUser(u)}
                              className="mt-2 w-full py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 font-black text-[10px] uppercase rounded-xl transition-all border border-emerald-200 shadow-xs"
                            >
                              Inspect Garden Drawer 🔍
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: STORED SEEDS GREENHOUSE ARSENAL */}
              {activeTab === "tab_arsenal" && (
                <div className="bg-white border border-emerald-100/90 p-6 rounded-3xl flex flex-col gap-4 shadow-xs">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">Sovereign Greenland Seed Silos</h3>
                    <p className="text-[10px] text-slate-500">Checking unplanted botanical seeds sitting in operative vaults</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {arsenalUsers.length === 0 ? (
                      <div className="col-span-2 p-8 text-center text-slate-400 font-bold uppercase tracking-wider bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        No seed inventory found in citizen inventories
                      </div>
                    ) : (
                      arsenalUsers.map((u) => {
                        const inventory = u.garden?.inventory || {};
                        const items = Object.entries(inventory).filter(([_, count]) => (count || 0) > 0);
                        
                        return (
                          <div
                            key={u.uid}
                            className="bg-emerald-50/30 border border-emerald-100 p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-emerald-300 transition-colors shadow-xs"
                          >
                            <div className="flex justify-between items-start border-b border-emerald-100 pb-3">
                              <div>
                                <h4 className="font-black text-sm text-slate-900">{u.displayName}</h4>
                                <span className="text-[10px] text-emerald-800 font-mono select-all block mt-0.5">{u.email}</span>
                              </div>
                              <span className="px-2 py-1 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-[9px] font-black uppercase tracking-wider block">
                                Vault Reserve
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 py-1">
                              {items.map(([seedId, quantity]) => (
                                <span
                                  key={seedId}
                                  className="px-3 py-1 bg-white text-slate-800 border border-emerald-200 rounded-xl text-[10.5px] font-bold uppercase tracking-wide flex items-center gap-2 shadow-xs"
                                >
                                  {seedId.replace("-", " ")}
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded text-[9.5px]">
                                    {quantity}
                                  </span>
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={() => setSelectedUser(u)}
                              className="w-full py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 font-black text-[10px] uppercase rounded-xl transition-all border border-emerald-200 shadow-xs mt-2"
                            >
                              Account details 🔍
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: SIGNALS AND FEEDBACK ROOM */}
              {activeTab === "tab_signals" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
                  
                  {/* Left Column: List of Feedback Cards */}
                  <div className="lg:col-span-5 flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 font-mono">Incoming Signal List</span>
                    {feedbacks.length === 0 ? (
                      <div className="bg-white border border-emerald-100 p-8 rounded-3xl text-center shadow-xs">
                        <Inbox className="mx-auto text-slate-400 mb-2" size={32} />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">No signals reported yet</p>
                      </div>
                    ) : (
                      feedbacks.map((fb) => {
                        const isRead = readFeedbackIds.includes(fb.id);
                        const isCurrentlySelected = selectedFeedback?.id === fb.id;
                        
                        return (
                          <div
                            key={fb.id}
                            onClick={() => handleSelectFeedback(fb)}
                            className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between gap-4 relative shadow-xs ${
                              isCurrentlySelected
                                ? "bg-emerald-50/80 border-2 border-emerald-500 shadow-sm"
                                : "bg-white border-emerald-100 hover:border-emerald-300"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[8.5px] font-black uppercase rounded-md block">
                                  {fb.category}
                                </span>
                                {/* Green notification dot lamp */}
                                {!isRead && (
                                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-white flex-shrink-0" title="Unread Transmission Notification!" />
                                )}
                              </div>
                              <span className="text-slate-900 font-black text-sm block mt-1.5 truncate">{fb.userName}</span>
                              <span className="text-[10px] text-slate-500 font-mono truncate block">{fb.userEmail}</span>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-[9px] font-mono text-emerald-700 font-bold block">Open ➔</span>
                              <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-black">
                                <Star size={10} fill="currentColor" /> {fb.rating}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Deep message viewing details container */}
                  <div className="lg:col-span-7 bg-white border border-emerald-100 p-6 rounded-3xl shadow-xs min-h-[400px] flex flex-col justify-between relative">
                    {selectedFeedback ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start border-b border-emerald-100 pb-4 flex-wrap gap-2">
                          <div>
                            <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest font-mono">Transmission Signal Active</span>
                            <h3 className="text-lg font-black text-slate-900 uppercase mt-0.5">{selectedFeedback.userName}</h3>
                            <span className="text-xs text-slate-500 font-mono select-all block mt-0.5">{selectedFeedback.userEmail}</span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-black flex items-center gap-1">
                              <Star size={12} fill="currentColor" /> {selectedFeedback.rating} Rating
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-1">Ref: {selectedFeedback.id}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Signals Context Message:</span>
                          <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 text-slate-800 text-sm font-semibold leading-relaxed whitespace-pre-wrap select-all">
                            {selectedFeedback.message}
                          </div>
                        </div>

                        {/* Reviewed verification block */}
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 mt-2">
                          <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                          <div className="text-left">
                            <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wide block">Reviewed & Authenticated</span>
                            <p className="text-[10px] text-slate-600">This feedback read indicator has been cleared.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 gap-2">
                        <AlertTriangle size={32} className="text-emerald-500 mb-1" />
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Select an Operative Signal to inspect</span>
                        <p className="text-[10px] text-slate-400 uppercase text-center">Feedback signal deep-dive metrics are ready to expand</p>
                      </div>
                    )}

                    <div className="border-t border-emerald-100 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400 uppercase font-mono">
                      <span>COMMAND MONITOR SECURE SYSTEM</span>
                      <span>Ver 2.50.0</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COMMUNITY INCIDENT REPORTS & MODERATION */}
              {activeTab === "tab_reports" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
                  {/* Left Column: Report List & Filtering */}
                  <div className="lg:col-span-5 flex flex-col gap-3 max-h-[620px] overflow-y-auto pr-2">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
                        Incident Reports ({reports.length})
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-xl border border-emerald-200">
                        <button
                          onClick={() => setReportFilter("all")}
                          className={`px-2 py-1 text-[8.5px] font-black uppercase rounded-lg transition-all ${
                            reportFilter === "all" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setReportFilter("pending")}
                          className={`px-2 py-1 text-[8.5px] font-black uppercase rounded-lg transition-all ${
                            reportFilter === "pending" ? "bg-amber-500 text-white" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => setReportFilter("post")}
                          className={`px-2 py-1 text-[8.5px] font-black uppercase rounded-lg transition-all ${
                            reportFilter === "post" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Posts
                        </button>
                        <button
                          onClick={() => setReportFilter("comment")}
                          className={`px-2 py-1 text-[8.5px] font-black uppercase rounded-lg transition-all ${
                            reportFilter === "comment" ? "bg-emerald-700 text-white" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Comments
                        </button>
                      </div>
                    </div>

                    {reports.length === 0 ? (
                      <div className="bg-white border border-emerald-100 p-8 rounded-3xl text-center shadow-xs">
                        <Shield className="mx-auto text-emerald-600 mb-2" size={32} />
                        <p className="text-slate-600 text-xs font-bold uppercase tracking-wide">No incident reports registered</p>
                        <p className="text-[10px] text-slate-400 mt-1">Community environment is safe and calm</p>
                      </div>
                    ) : (
                      reports
                        .filter((r) => {
                          if (reportFilter === "pending") return r.status === "pending";
                          if (reportFilter === "resolved") return r.status === "resolved";
                          if (reportFilter === "post") return r.targetType === "post";
                          if (reportFilter === "comment") return r.targetType === "comment";
                          return true;
                        })
                        .map((rep) => {
                          const isCurrentlySelected = selectedReport?.id === rep.id;
                          return (
                            <div
                              key={rep.id}
                              onClick={() => setSelectedReport(rep)}
                              className={`p-4 rounded-2xl cursor-pointer border transition-all flex flex-col gap-2 relative shadow-xs ${
                                isCurrentlySelected
                                  ? "bg-emerald-50/80 border-2 border-emerald-500 shadow-sm"
                                  : "bg-white border-emerald-100 hover:border-emerald-300"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded-md ${
                                    rep.targetType === "post" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                                  }`}>
                                    {rep.targetType}
                                  </span>
                                  <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded-md ${
                                    rep.status === "pending" ? "bg-amber-100 text-amber-800 animate-pulse font-bold" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {rep.status}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400">
                                  {rep.createdAt ? new Date(typeof rep.createdAt === "number" ? rep.createdAt : (rep.createdAt?.seconds ? rep.createdAt.seconds * 1000 : Date.now())).toLocaleDateString() : "Recent"}
                                </span>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <span className="text-slate-900 font-black text-xs truncate">
                                  Offender: {rep.reportedUserName || "Unknown User"}
                                </span>
                                <span className="text-[10px] text-rose-600 font-bold truncate">
                                  Reason: {rep.reason}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 line-clamp-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100 italic">
                                "{rep.targetContent || "No preview text"}"
                              </p>
                            </div>
                          );
                        })
                    )}
                  </div>

                  {/* Right Column: Detailed Report Inspection & Admin Action Controls */}
                  <div className="lg:col-span-7 bg-white border border-emerald-100 p-6 rounded-3xl shadow-xs min-h-[440px] flex flex-col justify-between relative">
                    {selectedReport ? (
                      <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-start border-b border-emerald-100 pb-4 flex-wrap gap-2">
                          <div>
                            <span className="text-[8.5px] font-black text-rose-600 uppercase tracking-widest font-mono flex items-center gap-1">
                              <ShieldAlert size={12} /> Community Moderation Case
                            </span>
                            <h3 className="text-lg font-black text-slate-900 uppercase mt-0.5">
                              Reported User: {selectedReport.reportedUserName || "Unknown User"}
                            </h3>
                            <span className="text-xs text-slate-500 font-mono select-all block mt-0.5">
                              User ID: {selectedReport.reportedUserId}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                              selectedReport.status === "pending" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}>
                              {selectedReport.status}
                            </span>
                            <span className="text-[9.5px] text-slate-400 font-mono mt-0.5">Report ID: {selectedReport.id}</span>
                          </div>
                        </div>

                        {/* Reported Content Box */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1 font-mono">
                            <Flag size={12} className="text-rose-600" /> Reported {selectedReport.targetType} Content:
                          </span>
                          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 text-slate-900 text-sm font-semibold leading-relaxed whitespace-pre-wrap select-all">
                            "{selectedReport.targetContent || "No text content available"}"
                          </div>
                        </div>

                        {/* Report Reason & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100 flex flex-col gap-1">
                            <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider font-mono">Primary Violation Category</span>
                            <span className="text-xs font-black text-rose-600 uppercase">{selectedReport.reason}</span>
                            {selectedReport.details && (
                              <span className="text-[10.5px] text-slate-600 mt-1">{selectedReport.details}</span>
                            )}
                          </div>

                          <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100 flex flex-col gap-1">
                            <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider font-mono">Reporter Identification</span>
                            <span className="text-xs font-bold text-slate-800">{selectedReport.reporterName || "Anonymous Reporter"}</span>
                            <span className="text-[10px] text-slate-500 font-mono truncate">{selectedReport.reporterEmail || selectedReport.reporterId}</span>
                          </div>
                        </div>

                        {/* Custom Notes if provided */}
                        {selectedReport.customNotes && (
                          <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100 flex flex-col gap-1">
                            <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider font-mono">Reporter's Additional Statement</span>
                            <p className="text-xs text-slate-700 italic">"{selectedReport.customNotes}"</p>
                          </div>
                        )}

                        {/* Admin Action Buttons */}
                        <div className="border-t border-emerald-100 pt-4 flex flex-wrap gap-3 items-center justify-between">
                          <button
                            onClick={() => handleDeleteReportedContent(selectedReport)}
                            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                          >
                            <Trash2 size={14} /> Delete Reported {selectedReport.targetType}
                          </button>

                          <button
                            onClick={() => setBanDurationModalUser({
                              uid: selectedReport.reportedUserId,
                              userName: selectedReport.reportedUserName || "User",
                              reportId: selectedReport.id
                            })}
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                          >
                            <UserX size={14} /> Ban User Account
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 gap-2">
                        <Flag size={36} className="text-emerald-500 mb-1" />
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Select an Incident Report to moderate</span>
                        <p className="text-[10px] text-slate-400 uppercase text-center">Inspect content violations and execute moderation actions</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: HEADQUARTERS BROADCASTER WORKSPACE */}
              {activeTab === "tab_broadcast" && (
                <div className="bg-white border border-emerald-100 p-6 rounded-3xl shadow-xs flex flex-col gap-5 max-w-2xl mx-auto pb-8">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-emerald-700 uppercase font-mono">Broadcast Core Interface</span>
                    <h3 className="text-base font-black text-slate-900 uppercase mt-0.5">Real-time HQ Broadcast transmit</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                      Instantly queue a notification badge with custom advice or alert indicators inside every user's personal in-app control screen.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-600 uppercase font-black tracking-wider font-mono">Alert Type Category</label>
                    <select
                      value={broadcastType}
                      onChange={(e: any) => setBroadcastType(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-200 rounded-2xl px-4 py-3 text-slate-800 text-xs focus:outline-none focus:border-emerald-600 font-semibold"
                    >
                      <option value="system">🛠️ System (Informational / Feature Releases)</option>
                      <option value="reward">🎁 Reward (Bonus points, XP boosts or item alerts)</option>
                      <option value="alert">🚨 Security Alert (Check-ins or milestone maintenance)</option>
                      <option value="mascot">✨ Companion guidance (Supportive tips from guides)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-600 uppercase font-black tracking-wider font-mono">Dispatch Header Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Extreme discipline Boost Activated!"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-600 uppercase font-black tracking-wider font-mono">Directive Context Details</label>
                    <textarea
                      placeholder="Input the guidance directive to transmit instantly to all user accounts..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-emerald-50/50 border border-emerald-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-600 font-semibold resize-none"
                    />
                  </div>

                  <button
                    onClick={handleBroadcast}
                    disabled={isBroadcasting}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 border-none text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all text-center flex items-center justify-center gap-2 mt-2"
                  >
                    {isBroadcasting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Transmitting protocol alerts...
                      </>
                    ) : (
                      <>
                        Deliver HQ Broadcast dispatch <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 8: OFFICIAL SUPPORT GMAIL INBOX */}
              {activeTab === "tab_gmail" && (
                <AdminGmailSupport showToast={showToast} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETAILED USER PROFILE SLIDEOUT DRAWER */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setSelectedUser(null)} />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-xl h-full bg-white border-l border-emerald-200 z-10 flex flex-col justify-between shadow-2xl p-6 sm:p-8 overflow-y-auto font-mono text-xs text-slate-800"
            >
              <div className="flex flex-col gap-6">
                
                {/* Header Profile Summary info */}
                <div className="flex justify-between items-start border-b border-emerald-100 pb-4">
                  <div className="flex flex-col font-sans">
                    <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest font-mono">CITIZEN PROFILE DEEP DIVE</span>
                    <h2 className="text-xl font-black text-slate-900 mt-1 uppercase tracking-tight">{selectedUser.displayName}</h2>
                    <span className="text-xs text-slate-500 font-mono select-all block mt-0.5">{selectedUser.email}</span>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black uppercase text-[9px] rounded-lg tracking-wider border border-emerald-200 transition-all shadow-xs"
                  >
                    Close Esc
                  </button>
                </div>

                {/* Sub Stats Grid layout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-left">
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-tight">Level Status</span>
                    <span className="text-sm font-black text-slate-900 mt-1">Lvl {selectedUser.level}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-tight">Sovereign XP</span>
                    <span className="text-sm font-black text-emerald-700 mt-1">{selectedUser.xp} XP</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-tight">Streak active</span>
                    <span className="text-sm font-black text-orange-600 mt-1">{selectedUser.streak} days</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-tight">Coins balance</span>
                    <span className="text-sm font-black text-amber-600 mt-1">{selectedUser.coins}</span>
                  </div>
                </div>

                {/* Botanical Companion Overview */}
                <div className="flex flex-col gap-2 font-sans">
                  <h4 className="text-xs font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                    <Sprout size={14} /> Botanical Companion Stats
                  </h4>
                  <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl flex flex-col gap-3">
                    {selectedUser.plantState ? (
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">Active Companion</span>
                          <span className="text-sm font-black text-slate-900 mt-0.5 uppercase tracking-wide font-mono">
                            {selectedUser.plantState.type}
                          </span>
                        </div>
                        <div className="flex gap-4 font-mono text-[10px]">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase font-black text-right block">Phase level</span>
                            <span className="font-black text-emerald-700 text-right mt-0.5 block">Stage {selectedUser.plantState.stage}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase font-black text-right block">Vitality</span>
                            <span className="font-black text-rose-600 text-right mt-0.5 block">{selectedUser.plantState.health}% Health</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase font-black text-right block">Status</span>
                            <span className="font-black text-amber-700 text-right mt-0.5 block">
                              {selectedUser.plantState.isThirsty ? "⚠️ Thirsty" : "✅ Sated"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide py-1 text-center font-mono">
                        No active capsule deployed on standard companion state
                      </p>
                    )}

                    {/* Stored Seeds details */}
                    <div className="border-t border-emerald-100 pt-3">
                      <span className="text-[9px] text-slate-600 uppercase font-black tracking-wider block mb-2 font-mono">
                        Greenhouse Silo Seed Reserves
                      </span>
                      {selectedUser.garden?.inventory && Object.keys(selectedUser.garden.inventory).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedUser.garden.inventory).map(([id, quantity]) => {
                            if (!quantity) return null;
                            return (
                              <span
                                key={id}
                                className="px-2.5 py-1 bg-white text-emerald-800 border border-emerald-200 rounded-lg text-[9.5px] font-black uppercase tracking-wide flex items-center gap-1.5 shadow-xs"
                              >
                                {id.replace("-", " ")} <span className="px-1 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold">{quantity}</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-400 font-semibold italic">No unplanted seed stocks detected.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purchased Shop Inventory */}
                <div className="flex flex-col gap-2 font-sans">
                  <h4 className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1">
                    <Trophy size={14} /> Shop transactions & Custom Assets
                  </h4>
                  <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-600 uppercase font-black tracking-wider block mb-2 font-mono">
                        Unlocked Gear Items
                      </span>
                      {selectedUser.purchasedItems && selectedUser.purchasedItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.purchasedItems.map((item: any, idx: number) => {
                            const itemStr = typeof item === "string" ? item : (item?.itemId || item?.id || item?.name || "");
                            const displayName = typeof item === "object" && item && "name" in item ? item.name : itemStr.replace("skin-", "").replace("sound-", "");
                            const key = typeof item === "string" ? item : (item?.id || item?.itemId || `item-${idx}`);
                            return (
                              <span
                                key={key}
                                className="px-2 py-0.5 bg-white text-amber-800 border border-amber-200 rounded text-[9px] font-black uppercase font-mono shadow-xs"
                              >
                                {displayName}
                              </span>
                            );
                          })}
                        </div>
                      ) : selectedUser.purchasedHouseItemIds && selectedUser.purchasedHouseItemIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.purchasedHouseItemIds.map((item: any, idx: number) => {
                            const itemStr = typeof item === "string" ? item : (item?.itemId || item?.id || item?.name || "");
                            const displayName = typeof item === "object" && item && "name" in item ? item.name : itemStr.replace("house-", "");
                            const key = typeof item === "string" ? item : (item?.id || item?.itemId || `house-item-${idx}`);
                            return (
                              <span
                                key={key}
                                className="px-2 py-0.5 bg-white text-amber-800 border border-amber-200 rounded text-[9px] font-black uppercase font-mono shadow-xs"
                              >
                                {displayName}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-400 font-semibold italic">No shop purchase histories reported</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security ID Ref */}
                <div className="flex flex-col gap-1 border-t border-emerald-100 pt-4">
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase font-black">Authorized Operative ID:</span>
                  <span className="text-[9.5px] font-mono text-slate-600 break-all bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 select-all">
                    {selectedUser.uid}
                  </span>
                </div>
              </div>

              <div className="border-t border-emerald-100 pt-4 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all text-center shadow-md"
                >
                  Return to Control Deck
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ban User Duration Selection Modal */}
      <AnimatePresence>
        {banDurationModalUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-emerald-100 p-6 rounded-3xl max-w-md w-full shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserX className="text-rose-600" size={20} />
                  <h3 className="text-sm font-black uppercase text-slate-900">Ban User: {banDurationModalUser.userName}</h3>
                </div>
                <button
                  onClick={() => setBanDurationModalUser(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Select the ban duration for user <span className="font-bold text-amber-700">{banDurationModalUser.userName}</span>. Banned users will be blocked from community actions.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-600 font-bold uppercase font-mono">Reason for Ban (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Repeated harassment or inappropriate language"
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                <button
                  onClick={() => handleBanUser(banDurationModalUser.uid, "7d", banDurationModalUser.reportId)}
                  className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-amber-300 flex items-center justify-center gap-2"
                >
                  ⏱️ Ban for 1 Week (7 Days)
                </button>
                <button
                  onClick={() => handleBanUser(banDurationModalUser.uid, "30d", banDurationModalUser.reportId)}
                  className="w-full py-3 bg-orange-50 hover:bg-orange-100 text-orange-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-orange-300 flex items-center justify-center gap-2"
                >
                  📅 Ban for 1 Month (30 Days)
                </button>
                <button
                  onClick={() => handleBanUser(banDurationModalUser.uid, "permanent", banDurationModalUser.reportId)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  🚫 Ban Permanently
                </button>
                <button
                  onClick={() => handleBanUser(banDurationModalUser.uid, "unban", banDurationModalUser.reportId)}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-emerald-300 flex items-center justify-center gap-2"
                >
                  ✅ Unban / Lift Ban
                </button>
              </div>

              <button
                onClick={() => setBanDurationModalUser(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors mt-1"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
