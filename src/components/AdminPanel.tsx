import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  HelpCircle
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
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
  const [activeTab, setActiveTab] = useState<"users" | "analytics" | "feedback" | "notifications">("users");

  // Notification Broadcaster State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"system" | "reward" | "alert" | "mascot">("system");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Authenticate Access
  const isAuthorized =
    currentUserId === "G77faQhRPfe5jr4hbY0O0L4fNUs2" ||
    currentUserEmail === "thomasaugustino12345678@gmail.com";

  useEffect(() => {
    if (!isAuthorized) {
      showToast("Access Denied: Admin Privilege Required", "error");
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
        // Fallback for stats that might be embedded in the doc or in a subcollection
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
    } catch (error) {
      console.error("Admin: Error fetching admin dashboard details:", error);
      showToast("Sync Error: Failed to retrieve system statistics", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Broadcast critical guidance notification to ALL users
  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      showToast("Please fill in both title and message text first", "info");
      return;
    }

    setIsBroadcasting(true);
    try {
      let broadcastCount = 0;
      for (const u of usersList) {
        // Build notification collection path for each user
        const notifRef = collection(db, "users", u.uid, "notifications");
        await addDoc(notifRef, {
          title: broadcastTitle,
          message: broadcastMessage,
          type: broadcastType,
          read: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 day expiration
        });
        broadcastCount++;
      }

      showToast(`Success: Broadcasted dispatch to ${broadcastCount} users!`, "success");
      setBroadcastTitle("");
      setBroadcastMessage("");
    } catch (e) {
      console.error("Admin: Broadcast Dispatch Failed", e);
      showToast("Broadcast Failed: Write operations restricted", "error");
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!isAuthorized) return null;

  // Search & Filter
  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute Analytics Data
  const totalUsersCount = usersList.length;
  const totalCoinsGenerated = usersList.reduce((acc, curr) => acc + (curr.coins || 0), 0);
  const totalXPGenerated = usersList.reduce((acc, curr) => acc + (curr.xp || 0), 0);
  
  // Calculate total seeds planted & in inventory
  let totalSeedsPlantedCount = 0;
  let totalSeedsInInventory = 0;
  usersList.forEach((u) => {
    if (u.garden?.tiles) {
      u.garden.tiles.forEach(tile => {
        if (tile && tile.plantId) totalSeedsPlantedCount++;
      });
    }
    if (u.garden?.inventory) {
      Object.values(u.garden.inventory).forEach(count => {
        totalSeedsInInventory += (count || 0);
      });
    }
  });

  // Level Distribution (Pie Chart Data)
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

  // Growth / Progress stats over categories (Line Graph Data)
  // Group metrics by active plant types as an activity index
  const plantTypeCounts: Record<string, number> = {};
  usersList.forEach((u) => {
    const pType = u.plantState?.type || "None/Sprout";
    plantTypeCounts[pType] = (plantTypeCounts[pType] || 0) + 1;
  });
  const plantChartData = Object.entries(plantTypeCounts).map(([key, value]) => ({
    name: key,
    value
  }));

  // Mock a structured line chart representing engagement levels based on total XP progression milestones among top users
  const topUsersByXp = [...usersList].sort((a, b) => b.xp - a.xp).slice(0, 7);
  const xpProgressionData = topUsersByXp.map((u, i) => ({
    index: `User ${i + 1}`,
    name: u.displayName.slice(0, 8),
    XP: u.xp,
    Coins: u.coins
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-12 relative overflow-hidden">
      {/* Decorative Blur Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 active:scale-95 transition-all text-slate-400 hover:text-white rounded-xl"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#69C496] uppercase">SYSTEM COMMAND</span>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Commander Control Deck <Shield size={18} className="text-emerald-500 animate-pulse" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase">{currentUserEmail || "Commander Mode"}</span>
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">PRO SECURE CONNECTION Verified</span>
          </div>
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-200 text-xs font-black uppercase tracking-wider rounded-xl border border-white/5"
          >
            Force Sync 🔄
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 mt-8 flex-1 flex flex-col gap-8">
        {/* Top Analytics Hero Bento - Real Backend Values */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden backdrop-blur shadow-xl">
            <div className="absolute top-4 right-4 text-blue-500 bg-blue-500/10 p-2 rounded-xl">
              <Users size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Population</span>
            <div className="text-3xl font-black text-white mt-1 tracking-tight">
              {isLoading ? "..." : totalUsersCount}
            </div>
            <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase">Registered User Profiles</p>
          </div>

          <div className="bg-slate-950/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden backdrop-blur shadow-xl">
            <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 p-2 rounded-xl">
              <Sprout size={20} />
            </div>
            <span className="text-[9px] font-black text-[#69C496] uppercase tracking-widest font-mono">Soils Cultivated</span>
            <div className="text-3xl font-black text-white mt-1 tracking-tight">
              {isLoading ? "..." : totalSeedsPlantedCount}
            </div>
            <p className="text-[9px] text-[#A2D2AB] font-bold mt-1.5 uppercase">Active planted Seeds</p>
          </div>

          <div className="bg-slate-950/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden backdrop-blur shadow-xl">
            <div className="absolute top-4 right-4 text-[#8D7D62] bg-[#8D7D62]/10 p-2 rounded-xl">
              <Layers size={20} />
            </div>
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Stored Arsenal</span>
            <div className="text-3xl font-black text-white mt-1 tracking-tight">
              {isLoading ? "..." : totalSeedsInInventory}
            </div>
            <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase">Seeds in inventories</p>
          </div>

          <div className="bg-slate-950/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden backdrop-blur shadow-xl">
            <div className="absolute top-4 right-4 text-rose-500 bg-rose-500/10 p-2 rounded-xl">
              <MessageSquare size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">User Signals</span>
            <div className="text-3xl font-black text-white mt-1 tracking-tight">
              {isLoading ? "..." : feedbacks.length}
            </div>
            <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase">Feedbacks Submitted</p>
          </div>
        </section>

        {/* Tab Controls */}
        <section className="flex border-b border-white/5 gap-2 overflow-x-auto pb-px">
          {(["users", "analytics", "feedback", "notifications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab
                  ? "border-[#69C496] text-white bg-slate-950/40"
                  : "border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
              }`}
            >
              {tab === "users" && "👥 Users Index"}
              {tab === "analytics" && "📊 System Charts"}
              {tab === "feedback" && `💬 Signals Room (${feedbacks.length})`}
              {tab === "notifications" && "📢 Broadcast Dispatch"}
            </button>
          ))}
        </section>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Securing System Decoders...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col gap-6"
            >
              {/* USERS INDEX */}
              {activeTab === "users" && (
                <div className="flex flex-col gap-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search accounts by username, display name, or email address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-[#69C496] transition-all"
                    />
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto bg-slate-950/40 border border-white/5 rounded-3xl shadow-xl">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
                          <th className="p-4 pl-6 font-bold">User Identity</th>
                          <th className="p-4 font-bold">Total Power (XP)</th>
                          <th className="p-4 font-bold">Level</th>
                          <th className="p-4 font-bold">Coins</th>
                          <th className="p-4 font-bold">Active Streak</th>
                          <th className="p-4 font-bold">Active Plant</th>
                          <th className="p-4 text-center pr-6 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500 font-bold uppercase tracking-wide">
                              No matching user records detected
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => {
                            const plantType = u.plantState?.type || "None";
                            const plantStage = u.plantState?.stage || 0;
                            
                            return (
                              <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 pl-6">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-white font-black text-sm">{u.displayName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono select-all bg-slate-900/40 px-1 py-0.5 rounded border border-white/5 w-fit">
                                      {u.email}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-slate-100">
                                  <span className="flex items-center gap-1.5">
                                    <Star size={12} className="text-blue-400" /> {u.xp || 0} XP
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="px-2 py-0.5 bg-slate-800 text-blue-300 rounded font-bold text-[10px]">
                                    Lvl {u.level}
                                  </span>
                                </td>
                                <td className="p-4 font-bold text-amber-400 flex items-center gap-1">
                                  <Coins size={12} /> {u.coins || 0}
                                </td>
                                <td className="p-4">
                                  <span className="flex items-center gap-1 text-orange-400 font-black">
                                    <Flame size={14} /> {u.streak}d
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="text-[10px] uppercase text-emerald-400 flex items-center gap-1">
                                    <Sprout size={12} /> {plantType} (S{plantStage})
                                  </span>
                                </td>
                                <td className="p-4 text-center pr-6">
                                  <button
                                    onClick={() => setSelectedUser(u)}
                                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 text-white font-black uppercase text-[9px] rounded-lg tracking-wider shadow transition-all"
                                  >
                                    Inspect Account 🔍
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SYSTEM CHARTS */}
              {activeTab === "analytics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                  {/* Line Graph: XP Milestone Progression of Top Players */}
                  <div className="bg-slate-950/40 border border-white/5 p-5 rounded-3xl flex flex-col justify-between shadow-xl">
                    <div className="mb-4">
                      <span className="text-[9px] font-black tracking-widest text-[#69C496] uppercase">XP & Coins Matrix</span>
                      <h3 className="text-sm font-black text-white uppercase mt-0.5">Top Performers Discipline Indexes</h3>
                    </div>
                    <div className="h-64 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={xpProgressionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem" }}
                            labelStyle={{ fontWeight: "bold" }}
                          />
                          <Line type="monotone" dataKey="XP" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="Coins" stroke="#f59e0b" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart: Level Buckets among Users */}
                  <div className="bg-slate-950/40 border border-white/5 p-5 rounded-3xl flex flex-col justify-between shadow-xl">
                    <div className="mb-4">
                      <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase">Power Segments</span>
                      <h3 className="text-sm font-black text-white uppercase mt-0.5">User Level bracket Distribution</h3>
                    </div>
                    <div className="h-64 mt-2 flex items-center justify-center">
                      {levelChartData.length === 0 ? (
                        <p className="text-slate-500 text-xs font-bold uppercase font-mono">No level stats available</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={levelChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {levelChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: "#000000", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem" }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Bar Chart: Botanical Selections mapping */}
                  <div className="bg-slate-950/40 border border-white/5 p-5 rounded-3xl flex flex-col justify-between shadow-xl md:col-span-2">
                    <div className="mb-4">
                      <span className="text-[9px] font-black tracking-widest text-[#8D7D62] uppercase">Ecosystem Trends</span>
                      <h3 className="text-sm font-black text-white uppercase mt-0.5">Primary botanical plant Selections across User base</h3>
                    </div>
                    <div className="h-64 mt-2">
                      {plantChartData.length === 0 ? (
                        <p className="text-slate-500 text-xs font-bold uppercase font-mono text-center">No plant choices parsed</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={plantChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                            <Tooltip
                              contentStyle={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem" }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[10, 10, 0, 0]}>
                              {plantChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SIGNALS ROOM (User Feedbacks) */}
              {activeTab === "feedback" && (
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 pb-6">
                  {feedbacks.length === 0 ? (
                    <div className="bg-slate-950/40 border border-white/5 p-8 rounded-3xl text-center shadow-xl">
                      <HelpCircle className="mx-auto text-slate-500 mb-2" size={32} />
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">No feedback signals received yet</p>
                    </div>
                  ) : (
                    feedbacks.map((fb) => (
                      <div
                        key={fb.id}
                        className="bg-slate-950/40 border border-white/5 p-5 rounded-3xl flex flex-col gap-2 relative shadow-lg"
                      >
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="flex flex-col">
                            <span className="px-2 py-0.5 bg-[#8D7D62]/20 text-[#DBCBB1] text-[9px] font-black uppercase rounded-lg w-fit">
                              {fb.category}
                            </span>
                            <span className="text-white font-bold text-sm mt-1">{fb.userName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{fb.userEmail}</span>
                          </div>

                          <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-lg text-xs font-black">
                            <Star size={12} fill="currentColor" /> {fb.rating}/5
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 font-semibold bg-slate-950/30 p-3 rounded-2xl border border-white/5 leading-relaxed mt-2 select-all">
                          {fb.message}
                        </p>

                        <div className="text-[8px] font-mono text-slate-500 text-right mt-1">
                          Ref ID: {fb.id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* BROADCAST DISPATCH */}
              {activeTab === "notifications" && (
                <div className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-5 max-w-2xl mx-auto pb-8">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-[#69C496] uppercase">HQ broadcast</span>
                    <h3 className="text-sm font-black text-white uppercase mt-0.5">Command Dispatch Broadcast</h3>
                    <p className="text-[10px] text-slate-400 leading-tight mt-1">
                      Transmit guidance, challenge updates or alerts. This operation queues real-time dispatch elements inside every account's in-app workspace instantly.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Alert Level Category</label>
                    <select
                      value={broadcastType}
                      onChange={(e: any) => setBroadcastType(e.target.value)}
                      className="w-full bg-slate-955 border border-white/5 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-[#69C496] transition-all font-semibold"
                    >
                      <option value="system">🛠️ System (Informational / Patch Updates)</option>
                      <option value="reward">🎁 Reward (Bonus points or item highlights)</option>
                      <option value="alert">🚨 Alert (Urgent check-ins or system maintenance)</option>
                      <option value="mascot">✨ Mascot (Encouraging advice from botanical guides)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Broadcaster Dispatch Title</label>
                    <input
                      type="text"
                      placeholder="e.g. System Protocol Upgrade Active!"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full bg-slate-955 border border-white/5 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-[#69C496] transition-all font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Broadcast Message Body</label>
                    <textarea
                      placeholder="Please structure your dispatch simply, clearly and encourage consistency..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-955 border border-white/5 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-[#69C496] transition-all font-semibold resize-none"
                    />
                  </div>

                  <button
                    onClick={handleBroadcast}
                    disabled={isBroadcasting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all text-center flex items-center justify-center gap-2 mt-2"
                  >
                    {isBroadcasting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Transmitting to users...
                      </>
                    ) : (
                      <>
                        Transmit Broadcast <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* USER DETAIL MODAL/DEEP-DIVE DRAWER */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm">
            {/* Backdrop Dismiss click */}
            <div className="absolute inset-0" onClick={() => setSelectedUser(null)} />

            {/* Inspect Panel Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-xl h-full bg-slate-950 border-l border-white/10 z-10 flex flex-col justify-between shadow-2xl p-6 sm:p-8 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">ACCOUNT CODENAME</span>
                    <h2 className="text-xl font-black text-white mt-0.5">{selectedUser.displayName}</h2>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 select-all">{selectedUser.email}</span>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all text-xs"
                  >
                    Dismiss Esc
                  </button>
                </div>

                {/* Sub Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-4 border border-white/5 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Level Target</span>
                    <span className="text-base font-black text-white mt-0.5">Lvl {selectedUser.level}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Accumulated XP</span>
                    <span className="text-base font-black text-blue-300 mt-0.5">{selectedUser.xp} XP</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Streak Days</span>
                    <span className="text-base font-black text-orange-400 mt-0.5">{selectedUser.streak} days</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Vault Coins</span>
                    <span className="text-base font-black text-amber-400 mt-0.5">{selectedUser.coins}</span>
                  </div>
                </div>

                {/* Botanical Ecosystem Overview */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <Sprout size={14} /> Botanical Ecosystem Overview
                  </h4>
                  <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                    {selectedUser.plantState ? (
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Active Companion</span>
                          <span className="text-sm font-black text-white mt-0.5 uppercase tracking-wide">
                            {selectedUser.plantState.type}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase font-black text-right">Growth stage</span>
                            <span className="text-xs font-black text-emerald-400 text-right">Stage {selectedUser.plantState.stage}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase font-black text-right">Vitality (Health)</span>
                            <span className="text-xs font-black text-rose-400 text-right">{selectedUser.plantState.health}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 uppercase font-black text-right">State</span>
                            <span className="text-xs font-black text-amber-300 text-right">
                              {selectedUser.plantState.isThirsty ? "⚠️ Thirsty" : "✅ Sated"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide py-1 text-center">
                        Active botanical capsule not deployed yet
                      </p>
                    )}

                    {/* Stored Seeds details */}
                    <div className="border-t border-white/5 pt-3">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block mb-2">
                        Total Plant Seeds Owned
                      </span>
                      {selectedUser.garden?.inventory && Object.keys(selectedUser.garden.inventory).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedUser.garden.inventory).map(([id, quantity]) => {
                            if (!quantity) return null;
                            return (
                              <span
                                key={id}
                                className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-lg text-[9px] font-black uppercase tracking-wide flex items-center gap-1.5"
                              >
                                {id.replace("-", " ")} <span className="px-1 py-0.5 bg-emerald-400/10 text-emerald-300 rounded font-bold">{quantity}</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-500 font-semibold italic">No greenhouse seed inventory initialized yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purchased Shop Inventory */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
                    <Trophy size={14} /> Shop purchases & Custom Assets
                  </h4>
                  <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block mb-2">
                        Purchased items & Gear
                      </span>
                      {selectedUser.purchasedItems && selectedUser.purchasedItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.purchasedItems.map((itemId) => (
                            <span
                              key={itemId}
                              className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/10 rounded text-[9px] font-black uppercase"
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
                              className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/10 rounded text-[9px] font-black uppercase"
                            >
                              {itemId.replace("house-", "")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-500 font-semibold italic">No shop transactions registered for this account.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technical Coordinates block */}
                <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase font-black">Authentication Ref:</span>
                  <span className="text-[9.5px] font-mono text-slate-400 break-all bg-slate-900/60 p-2.5 rounded-xl border border-white/5 select-all">
                    {selectedUser.uid}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all text-center"
                >
                  Dismiss Deep-Dive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
