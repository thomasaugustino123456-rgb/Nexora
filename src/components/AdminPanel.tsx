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
  RefreshCw
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc
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

// Active tabs mapping
// default tab: 'overview' (displays nice high-level stats cards & beautiful charts)
// 'tab_population': deep dive into current registrants list
// 'tab_cultivated': list of users who have planted botanical companions
// 'tab_arsenal': greenhouse inventories of all users
// 'tab_signals': signals & feedback messaging logs with read/unread tracking
// 'tab_broadcast': broadcaster workspace
type AdminSectionTab = "overview" | "tab_population" | "tab_cultivated" | "tab_arsenal" | "tab_signals" | "tab_broadcast";

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUserId,
  currentUserEmail,
  onBack,
  showToast
}) => {
  const [usersList, setUsersList] = useState<UserDetail[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackLog[]>([]);
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
      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, "users"));
      const parsedUsers: UserDetail[] = [];
      
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const userStats = data.stats || {};
        
        parsedUsers.push({
          uid: docSnap.id,
          email: data.email || "No Email",
          displayName: data.displayName || "Anonymous User",
          role: data.role || "user",
          streak: typeof data.streak === "number" ? data.streak : (userStats.streak || 0),
          bestStreak: typeof data.bestStreak === "number" ? data.bestStreak : (userStats.bestStreak || 0),
          totalPoints: typeof data.totalPoints === "number" ? data.totalPoints : (userStats.totalPoints || 0),
          level: typeof data.level === "number" ? data.level : (userStats.level || 1),
          coins: typeof data.coins === "number" ? data.coins : (userStats.coins || 0),
          xp: typeof data.xp === "number" ? data.xp : (userStats.xp || 0),
          plantState: data.plantState,
          garden: data.garden,
          purchasedItems: data.purchasedItems || [],
          purchasedHouseItemIds: data.purchasedHouseItemIds || []
        });
      });
      setUsersList(parsedUsers);

      // 2. Fetch Feedbacks
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
      
      // Sort Feedbacks by Date descending
      parsedFeedbacks.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setFeedbacks(parsedFeedbacks);
      
      // Set the first feedback as selected as default in details panel
      if (parsedFeedbacks.length > 0) {
        setSelectedFeedback(parsedFeedbacks[0]);
      }
    } catch (error) {
      console.error("AdminPanel: Error loading cloud database metrics:", error);
      showToast("Sync Failure: Restricted operational path", "error");
    } finally {
      setIsLoading(false);
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
    else if (u.level <= 30) levelBuckets["Level 11-10"]++;
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

  const chartColors = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6", "#EF4444"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Command Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Control Deck Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl active:scale-95 transition-all outline-none border border-white/10"
            title="Return to profile"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-[#69C496] uppercase font-mono">SECURE INTERFACE HOST</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
              Command Center <Shield size={20} className="text-red-500" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">{currentUserEmail}</span>
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Root Level Sovereign</span>
          </div>
          <button
            onClick={fetchAdminData}
            title="Reload Cloud State"
            className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync Cloud</span>
          </button>
        </div>
      </header>

      {/* Main Command Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col gap-6 relative z-10">
        
        {/* Interactive Interactive Bento Matrix boxes */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bento box 1: Active Population */}
          <div
            onClick={() => setActiveTab("tab_population")}
            className={`p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden shadow-xl hover:scale-[1.03] active:scale-[0.98] ${
              activeTab === "tab_population"
                ? "bg-slate-900 border-emerald-500/50 shadow-emerald-950/20"
                : "bg-slate-900/60 border-white/5 hover:border-white/10"
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
              activeTab === "tab_population" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"
            }`}>
              <Users size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Population</span>
            <div className="text-3xl font-black text-white mt-2 tracking-tight">
              {isLoading ? "..." : totalUsersCount}
            </div>
            <p className="text-[9px] font-bold mt-2 uppercase text-emerald-400 flex items-center gap-1">
              Active accounts index <Sparkles size={10} />
            </p>
          </div>

          {/* Bento box 2: Soils Cultivated */}
          <div
            onClick={() => setActiveTab("tab_cultivated")}
            className={`p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden shadow-xl hover:scale-[1.03] active:scale-[0.98] ${
              activeTab === "tab_cultivated"
                ? "bg-slate-900 border-blue-500/50 shadow-blue-950/20"
                : "bg-slate-900/60 border-white/5 hover:border-white/10"
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
              activeTab === "tab_cultivated" ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-slate-400"
            }`}>
              <Sprout size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">Planted Companions</span>
            <div className="text-3xl font-black text-white mt-2 tracking-tight">
              {isLoading ? "..." : totalSeedsPlantedCount}
            </div>
            <p className="text-[9px] font-bold mt-2 uppercase text-blue-400 flex items-center gap-1">
              Planted companion seeds <Droplets size={10} />
            </p>
          </div>

          {/* Bento box 3: Greenhouse Arsenal */}
          <div
            onClick={() => setActiveTab("tab_arsenal")}
            className={`p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden shadow-xl hover:scale-[1.03] active:scale-[0.98] ${
              activeTab === "tab_arsenal"
                ? "bg-slate-900 border-amber-500/50 shadow-amber-950/20"
                : "bg-slate-900/60 border-white/5 hover:border-white/10"
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
              activeTab === "tab_arsenal" ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-slate-400"
            }`}>
              <Layers size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Greenhouse Stash</span>
            <div className="text-3xl font-black text-white mt-2 tracking-tight">
              {isLoading ? "..." : totalSeedsInInventory}
            </div>
            <p className="text-[9px] font-bold mt-2 uppercase text-amber-400 flex items-center gap-1">
              Unplanted reserve seeds <Trophy size={10} />
            </p>
          </div>

          {/* Bento box 4: User signals / Signals message logs */}
          <div
            onClick={() => setActiveTab("tab_signals")}
            className={`p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden shadow-xl hover:scale-[1.03] active:scale-[0.98] ${
              activeTab === "tab_signals"
                ? "bg-slate-900 border-red-500/50 shadow-red-950/20"
                : "bg-slate-900/60 border-white/5 hover:border-white/10"
            }`}
          >
            <div className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
              activeTab === "tab_signals" ? "bg-red-500/20 text-red-400" : "bg-white/5 text-slate-400"
            }`}>
              <MessageSquare size={18} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Transmissions Received</span>
            <div className="text-3xl font-black text-white mt-2 tracking-tight flex items-center gap-2">
              {isLoading ? "..." : totalFeedbackCount}
              {/* Green notification indicator light */}
              {!isLoading && feedbacks.some((fb) => !readFeedbackIds.includes(fb.id)) && (
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" title="Fresh feedback available!" />
              )}
            </div>
            <p className="text-[9px] font-bold mt-2 uppercase text-red-400 flex items-center gap-1">
              Operator feedbacks log <Bell size={10} />
            </p>
          </div>
        </section>

        {/* Workspace Operations Tab Buttons BAR */}
        <section className="flex bg-slate-900/40 border border-white/5 p-1 rounded-3xl gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-slate-800 text-white shadow-md border border-white/5"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📊 Command Dashboard
          </button>
          <button
            onClick={() => setActiveTab("tab_population")}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_population"
                ? "bg-slate-800 text-white shadow-md border border-white/5"
                : "text-slate-400 hover:text-white"
            }`}
          >
            👥 Accounts Inventory ({totalUsersCount})
          </button>
          <button
            onClick={() => setActiveTab("tab_cultivated")}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_cultivated"
                ? "bg-slate-800 text-white shadow-md border border-white/5"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌿 Placed Gardeners ({cultivatedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("tab_arsenal")}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_arsenal"
                ? "bg-slate-800 text-white shadow-md border border-white/5"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🎒 Stash Vaults ({arsenalUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("tab_signals")}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_signals"
                ? "bg-slate-800 text-white shadow-md border border-white/5"
                : "text-slate-400 hover:text-white"
            }`}
          >
            💬 Signal Transmissions ({totalFeedbackCount})
            {feedbacks.some((fb) => !readFeedbackIds.includes(fb.id)) && (
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("tab_broadcast")}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "tab_broadcast"
                ? "bg-slate-800 text-white shadow-md border border-white/5"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📢 Headquarters Broadcaster
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
              <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-[#69C496]">Siphoning Cloud Metrics...</p>
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
              
              {/* TABS 1: OVERVIEW METRIC DASHBOARD (With Highly Optimized legibility Charts) */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Line Chart curve */}
                  <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-[9px] font-black text-[#69C496] uppercase tracking-[0.2em]">Discipline Engagement Vector</span>
                        <h3 className="text-base font-black text-white uppercase mt-1">XP Milestones of Top Players</h3>
                      </div>
                      <TrendingUp size={18} className="text-blue-500" />
                    </div>
                    
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={xpProgressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem" }}
                            labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: "11px" }}
                            itemStyle={{ fontSize: "12px", padding: "2px 0" }}
                          />
                          <Line type="monotone" dataKey="XP" stroke="#3b82f6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Coins" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-4 text-center">
                      Reflecting dynamic XP peaks relative to user account vaults
                    </p>
                  </div>

                  {/* Pie chart with descriptive breakdowns */}
                  <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-[9px] font-black text-[#8D7D62] uppercase tracking-[0.2em]">User Tier Matrix</span>
                        <h3 className="text-base font-black text-white uppercase mt-1">Player Experience Buckets</h3>
                      </div>
                      <PieChartIcon size={18} className="text-amber-500" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="h-60 w-full flex items-center justify-center">
                        {levelChartData.length === 0 ? (
                          <p className="text-slate-500 text-xs font-bold uppercase">No user level aggregates</p>
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
                                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Explicit Legend indicators for quick understanding */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Level Distributions Detailed</h4>
                        {levelChartData.map((bucket, index) => {
                          const percent = ((bucket.value / totalUsersCount) * 100).toFixed(0);
                          return (
                            <div key={bucket.name} className="flex items-center justify-between bg-white/[0.02] p-2 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                                <span className="text-xs font-bold text-slate-300">{bucket.name}</span>
                              </div>
                              <span className="text-xs font-black text-white">{bucket.value} accounts ({percent}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart: Popular plant companion selections */}
                  <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col shadow-xl lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Botanical trends metric</span>
                        <h3 className="text-base font-black text-white uppercase mt-1">Ecosystem companion selection distribution</h3>
                      </div>
                      <Sprout size={18} className="text-[#69C496]" />
                    </div>

                    <div className="h-72 w-full mt-4">
                      {plantChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Ecosystem companions not seeded yet</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={plantChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem" }}
                            />
                            <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]}>
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
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col gap-5 shadow-xl">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="text-base font-black text-white uppercase">Sovereign Accounts Registry</h3>
                      <p className="text-[10px] text-slate-400">Search and deep-dive into registered operative profiles</p>
                    </div>
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search by nickname or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-white/5 rounded-2xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/5">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-950/50 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                          <th className="p-4 font-bold">NickName / Contact</th>
                          <th className="p-4 font-bold">Total Power (XP)</th>
                          <th className="p-4 font-bold">Experience level</th>
                          <th className="p-4 font-bold">Vault Balance</th>
                          <th className="p-4 font-bold">Active Streak</th>
                          <th className="p-4 text-center font-bold">Interactions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300 font-semibold font-mono">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 font-bold uppercase tracking-wider">
                              No matching citizen accounts found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.uid} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 font-sans">
                                <span className="text-white font-black text-sm block">{u.displayName}</span>
                                <span className="text-[10.5px] text-slate-400 font-mono select-all bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 mt-1 block w-fit">
                                  {u.email}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
                                  <Star size={14} className="text-blue-400" fill="currentColor" /> {u.xp} XP
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 bg-slate-950 border border-white/10 text-blue-300 rounded-lg font-black text-[10.5px]">
                                  Lvl {u.level}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-amber-400 flex items-center gap-1 mt-2">
                                <Coins size={14} /> {u.coins}
                              </td>
                              <td className="p-4">
                                <span className="flex items-center gap-1 text-orange-400 font-black">
                                  <Flame size={15} /> {u.streak}d
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setSelectedUser(u)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] rounded-xl tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md"
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
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col gap-4 shadow-xl">
                  <div>
                    <h3 className="text-base font-black text-white uppercase">Ecosystem Garden Active Logs</h3>
                    <p className="text-[10px] text-slate-400">Reviewing placed companion status and growth points progression among citizens</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cultivatedUsers.length === 0 ? (
                      <div className="col-span-2 p-8 text-center text-slate-500 font-bold uppercase tracking-wider bg-slate-950/20 rounded-2xl border border-white/5">
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
                            className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex flex-col gap-4 relative hover:border-white/10 transition-colors"
                          >
                            <div className="flex justify-between items-start border-b border-white/5 pb-3">
                              <div>
                                <h4 className="font-black text-sm text-white">{u.displayName}</h4>
                                <span className="text-[10px] text-slate-400 font-mono select-all block mt-0.5">{u.email}</span>
                              </div>
                              <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider block">
                                Companion Deployed
                              </span>
                            </div>

                            <div className="grid grid-flow-row gap-3">
                              {plant && (
                                <div className="flex items-center justify-between bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                                      <Sprout size={18} />
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">Primary Capsule</span>
                                      <span className="font-black text-xs uppercase text-white mt-0.5 block">{plant.type}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">Vitality</span>
                                    <span className="font-black text-xs text-rose-400 block">{plant.health}% Health</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">Phase</span>
                                    <span className="font-black text-xs text-blue-400 block">Stage {plant.stage}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-400">Total Placed Seeds (3x3 Grid):</span>
                                <span className="px-2 py-0.5 bg-slate-900 border border-white/5 text-emerald-300 rounded font-bold text-[10px]">
                                  {placedCount} Soils Active
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedUser(u)}
                              className="mt-2 w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-black text-[10px] uppercase rounded-xl transition-all border border-white/5"
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
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex flex-col gap-4 shadow-xl">
                  <div>
                    <h3 className="text-base font-black text-white uppercase">Sovereign Greenland Seed Silos</h3>
                    <p className="text-[10px] text-slate-400">Checking unplanted botanical seeds sitting in operative greenhouse vaults</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {arsenalUsers.length === 0 ? (
                      <div className="col-span-2 p-8 text-center text-slate-500 font-bold uppercase tracking-wider bg-slate-950/20 rounded-2xl border border-white/5">
                        No seed inventory found in citizen inventories
                      </div>
                    ) : (
                      arsenalUsers.map((u) => {
                        const inventory = u.garden?.inventory || {};
                        const items = Object.entries(inventory).filter(([_, count]) => (count || 0) > 0);
                        
                        return (
                          <div
                            key={u.uid}
                            className="bg-slate-950/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-white/10 transition-colors"
                          >
                            <div className="flex justify-between items-start border-b border-white/5 pb-3">
                              <div>
                                <h4 className="font-black text-sm text-white">{u.displayName}</h4>
                                <span className="text-[10px] text-slate-400 font-mono select-all block mt-0.5">{u.email}</span>
                              </div>
                              <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/10 text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-wider block">
                                Vault Reserve
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 py-1">
                              {items.map(([seedId, quantity]) => (
                                <span
                                  key={seedId}
                                  className="px-3 py-1 bg-slate-900 text-slate-200 border border-white/5 rounded-xl text-[10.5px] font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm"
                                >
                                  {seedId.replace("-", " ")}
                                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-black rounded text-[9.5px]">
                                    {quantity}
                                  </span>
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={() => setSelectedUser(u)}
                              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-black text-[10px] uppercase rounded-xl transition-all border border-white/5 mt-2"
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

              {/* TAB 5: SIGNALS AND FEEDBACK ROOM (Dynamic notification dots, unread read logic) */}
              {activeTab === "tab_signals" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
                  
                  {/* Left Column: List of Feedback Cards */}
                  <div className="lg:col-span-5 flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Incoming Signal List</span>
                    {feedbacks.length === 0 ? (
                      <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl text-center shadow-xl">
                        <Inbox className="mx-auto text-slate-500 mb-2" size={32} />
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
                            className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between gap-4 relative ${
                              isCurrentlySelected
                                ? "bg-slate-800 border-red-500/40 shadow-inner"
                                : "bg-slate-900 border-white/5 hover:border-white/10"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#8D7D62]/20 text-[#DBCBB1] text-[8.5px] font-black uppercase rounded-md block">
                                  {fb.category}
                                </span>
                                {/* Green notification dot lamp representing New/Unread message */}
                                {!isRead && (
                                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse border-2 border-slate-950 flex-shrink-0" title="Unread Transmission Notification!" />
                                )}
                              </div>
                              <span className="text-white font-black text-sm block mt-1.5 truncate">{fb.userName}</span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block">{fb.userEmail}</span>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-[9px] font-mono text-slate-500 block">Open ➔</span>
                              <div className="flex items-center gap-0.5 bg-yellow-500/15 text-yellow-500 px-1.5 py-0.5 rounded text-[10px] font-black">
                                <Star size={10} fill="currentColor" /> {fb.rating}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Deep message viewing details container */}
                  <div className="lg:col-span-7 bg-slate-900 border border-white/5 p-6 rounded-3xl shadow-xl min-h-[400px] flex flex-col justify-between relative">
                    {selectedFeedback ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start border-b border-white/5 pb-4 flex-wrap gap-2">
                          <div>
                            <span className="text-[8px] font-black text-[#69C496] uppercase tracking-widest font-mono">Transmission Signal Active</span>
                            <h3 className="text-lg font-black text-white uppercase mt-0.5">{selectedFeedback.userName}</h3>
                            <span className="text-xs text-slate-400 font-mono select-all block mt-0.5">{selectedFeedback.userEmail}</span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2.5 py-1 bg-slate-950 text-yellow-500 border border-yellow-500/10 rounded-lg text-xs font-black flex items-center gap-1">
                              <Star size={12} fill="currentColor" /> {selectedFeedback.rating} Rating
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-1">Ref Ref: {selectedFeedback.id}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Signals Context Message:</span>
                          <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 text-slate-200 text-sm font-semibold leading-relaxed whitespace-pre-wrap select-all shadow-inner">
                            {selectedFeedback.message}
                          </div>
                        </div>

                        {/* Interactive quick feedback dismiss verification block */}
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 mt-2">
                          <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                          <div className="text-left">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wide block">Reviewed & Authenticated</span>
                            <p className="text-[10px] text-slate-400">This feedback read indicator has been permanent-cleared. The green notice light has disappeared.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500 gap-2">
                        <AlertTriangle size={32} className="text-slate-400 mb-1" />
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Select an Operative Signal to inspect</span>
                        <p className="text-[10px] text-slate-500 uppercase text-center">Feedback signal deep-dive metrics are ready to expand</p>
                      </div>
                    )}

                    <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500 uppercase font-mono">
                      <span>COMMAND MONITOR SECURE SYSTEM</span>
                      <span>Ver 2.50.0</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: HEADQUARTERS BROADCASTER WORKSPACE */}
              {activeTab === "tab_broadcast" && (
                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-5 max-w-2xl mx-auto pb-8">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-[#69C496] uppercase font-mono">Broadcast Core Interface</span>
                    <h3 className="text-base font-black text-white uppercase mt-0.5">Real-time HQ Broadcast transmit</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      Instantly queue a notification badge with custom advice or alert indicators inside every user's personal in-app control screen. Keep messages high value and supportive!
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Alert Type Category</label>
                    <select
                      value={broadcastType}
                      onChange={(e: any) => setBroadcastType(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 font-semibold"
                    >
                      <option value="system">🛠️ System (Informational / Feature Releases)</option>
                      <option value="reward">🎁 Reward (Bonus points, XP boosts or item alerts)</option>
                      <option value="alert">🚨 Security Alert (Check-ins or milestone maintenance)</option>
                      <option value="mascot">✨ Companion guidance (Supportive tips from guides)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Dispatch Header Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Extreme discipline Boost Activated!"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Directive Context Details</label>
                    <textarea
                      placeholder="Input the guidance directive to transmit instantly to all user accounts..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 font-semibold resize-none"
                    />
                  </div>

                  <button
                    onClick={handleBroadcast}
                    disabled={isBroadcasting}
                    className="w-full py-4 bg-gradient-to-r from-red-650 to-rose-700 hover:from-red-600 hover:to-rose-600 border-none text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all text-center flex items-center justify-center gap-2 mt-2"
                    style={{ backgroundColor: "#be123c", backgroundImage: "linear-gradient(to bottom right, #be123c, #9f1239)" }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DETAILED USER PROFILE DEEP-DIVE SLIDEOUT DRAWER */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setSelectedUser(null)} />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-xl h-full bg-slate-950 border-l border-white/10 z-10 flex flex-col justify-between shadow-2xl p-6 sm:p-8 overflow-y-auto font-mono text-xs"
            >
              <div className="flex flex-col gap-6">
                
                {/* Header Profile Summary info */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="flex flex-col font-sans">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">CITIZEN PROFILE DEEP DIVE</span>
                    <h2 className="text-xl font-black text-white mt-1 uppercase tracking-tight">{selectedUser.displayName}</h2>
                    <span className="text-xs text-slate-400 font-mono select-all block mt-0.5">{selectedUser.email}</span>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 font-black uppercase text-[9px] rounded-lg tracking-wider border border-white/10 transition-all shadow"
                  >
                    Close Esc
                  </button>
                </div>

                {/* Sub Stats Grid layout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border border-white/5 p-4 rounded-2xl text-left block">
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-tight">Level Status</span>
                    <span className="text-sm font-black text-white mt-1">Lvl {selectedUser.level}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-tight">Sovereign XP</span>
                    <span className="text-sm font-black text-blue-300 mt-1">{selectedUser.xp} XP</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-tight">Streak active</span>
                    <span className="text-sm font-black text-orange-400 mt-1">{selectedUser.streak} days</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-tight">Coins balance</span>
                    <span className="text-sm font-black text-amber-500 mt-1">{selectedUser.coins}</span>
                  </div>
                </div>

                {/* Botanical Companion Overview */}
                <div className="flex flex-col gap-2 font-sans">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <Sprout size={14} /> Botanical Companion Stats
                  </h4>
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                    {selectedUser.plantState ? (
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Active Companion</span>
                          <span className="text-sm font-black text-white mt-0.5 uppercase tracking-wide font-mono">
                            {selectedUser.plantState.type}
                          </span>
                        </div>
                        <div className="flex gap-4 font-mono text-[10px]">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase font-black text-right block">Phase level</span>
                            <span className="font-black text-emerald-400 text-right mt-0.5 block">Stage {selectedUser.plantState.stage}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase font-black text-right block">Vitality</span>
                            <span className="font-black text-rose-400 text-right mt-0.5 block">{selectedUser.plantState.health}% Health</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase font-black text-right block">Status</span>
                            <span className="font-black text-amber-300 text-right mt-0.5 block">
                              {selectedUser.plantState.isThirsty ? "⚠️ Thirsty" : "✅ Sated"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide py-1 text-center font-mono">
                        No active capsule deployed on standard companion state
                      </p>
                    )}

                    {/* Stored Seeds details */}
                    <div className="border-t border-white/5 pt-3">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block mb-2">
                        Greenhouse Silo Seed Reserves
                      </span>
                      {selectedUser.garden?.inventory && Object.keys(selectedUser.garden.inventory).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedUser.garden.inventory).map(([id, quantity]) => {
                            if (!quantity) return null;
                            return (
                              <span
                                key={id}
                                className="px-2.5 py-1 bg-slate-950 text-emerald-400 border border-emerald-500/10 rounded-lg text-[9.5px] font-black uppercase tracking-wide flex items-center gap-1.5"
                              >
                                {id.replace("-", " ")} <span className="px-1 py-0.5 bg-emerald-400/10 text-emerald-300 rounded font-bold">{quantity}</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-500 font-semibold italic">No unplanted custom seed stocks detected.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purchased Shop Inventory */}
                <div className="flex flex-col gap-2 font-sans">
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
                    <Trophy size={14} /> Shop transactions & Custom Assets
                  </h4>
                  <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block mb-2">
                        Unlocked Gear Items
                      </span>
                      {selectedUser.purchasedItems && selectedUser.purchasedItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.purchasedItems.map((itemId) => (
                            <span
                              key={itemId}
                              className="px-2 py-0.5 bg-slate-950 text-amber-300 border border-amber-500/10 rounded text-[9px] font-black uppercase font-mono"
                            >
                              {itemId.replace("skin-", "").replace("sound-", "")}
                            </span>
                          ))}
                        </div>
                      ) : selectedUser.purchasedHouseItemIds && selectedUser.purchasedHouseItemIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.purchasedHouseItemIds.map((itemId) => (
                            <span
                              key={itemId}
                              className="px-2 py-0.5 bg-slate-950 text-amber-300 border border-amber-500/10 rounded text-[9px] font-black uppercase font-mono"
                            >
                              {itemId.replace("house-", "")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-500 font-semibold italic">No shop purchase histories reported</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security ID Ref */}
                <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase font-black">Authorized Operative ID:</span>
                  <span className="text-[9.5px] font-mono text-slate-400 break-all bg-slate-950 p-3 rounded-xl border border-white/5 select-all">
                    {selectedUser.uid}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all text-center border border-white/10"
                >
                  Return to Control Deck
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
