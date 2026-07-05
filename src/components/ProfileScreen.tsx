import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Shield,
  Target,
  Award,
  Star,
  History,
  Camera,
  Crown,
  Globe,
  MessageSquare,
  Zap,
  Clock,
  MoreHorizontal,
  Video,
  Plus,
  Info,
  Users,
  Layout,
  Book,
} from "lucide-react";
import { FirebaseUser } from "../firebase";
import { UserSettings, UserStats, SocialCircle, Screen } from "../types";
import { LeagueIcon } from "./LeaderboardScreen";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { ArchitectLab } from "./ArchitectLab";

export function ProfileScreen({
  settings,
  setSettings,
  stats,
  user,
  setActiveScreen,
  circles,
  onUpdateProfile,
  deleteAccount,
}: {
  settings: UserSettings;
  setSettings: (
    s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings),
  ) => void;
  stats: UserStats;
  user: FirebaseUser | null;
  setActiveScreen: (screen: Screen) => void;
  circles: SocialCircle[];
  onUpdateProfile: (name: string, photo: string, location: string) => void;
  deleteAccount: () => Promise<void>;
}) {
  const [showArchitect, setShowArchitect] = useState(false);
  const currentXP = stats.xp || 0;
  const nextLevelXP = (stats.level || 1) * 1000;
  const progressPercent = (currentXP / nextLevelXP) * 100;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(
    settings.displayName || user?.displayName || "Nexora User",
  );
  const [editPhoto, setEditPhoto] = useState(
    settings.profilePic || user?.photoURL || "",
  );
  const [editLocation, setEditLocation] = useState(
      settings.location || "",
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditName(settings.displayName || user?.displayName || "Nexora User");
    setEditPhoto(settings.profilePic || user?.photoURL || "");
    setEditLocation(settings.location || "");
  }, [settings.displayName, settings.profilePic, settings.location, user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Clear input so user can pick the exact same photo again if they want
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(
          "Image is too large! Please choose a smaller one, bro (Max 5MB).",
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Compress using canvas to ensure it fits in localStorage/Firestore
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          width = Math.round(width);
          height = Math.round(height);

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            setEditPhoto(dataUrl);

            // Auto-save the profile picture immediately so the user doesn't have to find the Save button
            onUpdateProfile(
              editName || settings.displayName || "Pioneer",
              dataUrl,
              editLocation,
            );
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    onUpdateProfile(editName, editPhoto, editLocation);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto w-full space-y-8 pb-32"
    >
      <div className="flex flex-col items-center gap-6 pt-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500 rounded-[2.5rem] rotate-6 scale-105 opacity-20 blur-xl group-hover:rotate-12 transition-transform duration-500" />
          <div className="w-32 h-32 rounded-[2.5rem] bg-white border-4 border-white shadow-2xl relative z-10 overflow-hidden">
            {editPhoto ? (
              <img
                src={editPhoto}
                className="w-full h-full object-cover shadow-inner"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={64} className="m-8 text-blue-200" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl z-20 border-4 border-white hover:scale-110 active:scale-95 transition-all"
          >
            <Camera size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <div className="text-center space-y-2">
          {isEditing ? (
            <div className="flex flex-col items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-4xl font-black text-blue-900 tracking-tight leading-none text-center bg-blue-50 border-none rounded-2xl p-2 w-full max-w-sm focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="text-lg text-blue-700 tracking-tight text-center bg-blue-50 border-none rounded-2xl p-2 w-full max-w-xs focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Location"
              />
              <button
                onClick={saveProfile}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100"
              >
                Sync Changes
              </button>
            </div>
          ) : (
            <h2
              onClick={() => setIsEditing(true)}
              className="text-4xl font-black text-blue-900 tracking-tight leading-none cursor-pointer hover:opacity-70"
            >
              {settings.displayName || user?.displayName || "Nexora User"}
            </h2>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center mt-3">
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100/80">
              Level {stats.level || 1} Pioneer
            </span>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-blue-200" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveScreen("archives")}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 rounded-full flex items-center gap-1.5 cursor-pointer transition-all font-black text-[9px] uppercase tracking-widest"
            >
              <Book size={12} className="stroke-[2.5]" />
              <span>Nexus Wisdom</span>
            </motion.button>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-blue-200" />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-[9px] font-black text-blue-900/40 uppercase tracking-widest leading-none flex items-center gap-1 hover:text-blue-650 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-100/80 transition-all"
            >
              {isEditing ? "Cancel Edit" : "Edit Page"}
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black text-blue-900/30 uppercase tracking-[0.25em]">
            Evolution Path
          </h3>
          <span className="text-[10px] font-black text-blue-500">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
        <div className="w-full h-3 bg-blue-50 rounded-full overflow-hidden shadow-inner flex p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_#3b82f6]"
          />
        </div>
      </div>

      {/* Upgraded Arena League Tier progression grid */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-blue-50 pb-4">
          <div>
            <h3 className="text-xs font-black text-blue-900/30 uppercase tracking-[0.25em] mb-1">
              Arena Standing & Ranks
            </h3>
            <p className="text-[10px] uppercase font-black text-blue-500 tracking-wider">
              {settings.league || 'Bronze'} League Tier
            </p>
          </div>
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center p-1 shadow-inner">
            <LeagueIcon
              league={settings.league || 'Bronze'}
              active={true}
              className="w-14 h-14"
            />
          </div>
        </div>

        {/* List of leagues arrangement with requirements */}
        <div className="space-y-3">
          {[
            { name: 'Bronze', levels: 'Levels 1 - 4', minLvl: 1 },
            { name: 'Silver', levels: 'Levels 5 - 9', minLvl: 5 },
            { name: 'Gold', levels: 'Levels 10 - 14', minLvl: 10 },
            { name: 'Platinum', levels: 'Levels 15 - 19', minLvl: 15 },
            { name: 'Diamond', levels: 'Levels 20 - 24', minLvl: 20 },
            { name: 'Master', levels: 'Levels 25 - 29', minLvl: 25 },
            { name: 'Champion', levels: 'Levels 30 - 34', minLvl: 30 },
            { name: 'Divine', levels: 'Levels 35 - 39', minLvl: 35 },
            { name: 'Nexus', levels: 'Levels 40+', minLvl: 40 },
          ].map((lg) => {
            const userLvl = stats.level || Math.floor((stats.totalPoints || 0) / 100) + 1;
            const isUnlocked = userLvl >= lg.minLvl;
            const isCurrent = settings.league === lg.name;

            return (
              <div
                key={lg.name}
                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-200 ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-400/50 shadow-md shadow-blue-500/5 relative py-4 scale-[1.02]'
                    : isUnlocked
                    ? 'bg-slate-50/50 border-slate-100/50'
                    : 'bg-slate-100/30 border-dashed border-slate-200/50 opacity-60'
                }`}
              >
                {/* Check / Lock Indicators */}
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center relative">
                  <LeagueIcon
                    league={lg.name}
                    active={isCurrent || isUnlocked}
                    className="w-9 h-9"
                  />
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-[6px] font-black uppercase text-yellow-950 px-1 py-0.5 rounded shadow">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Rank Details */}
                <span className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-black uppercase tracking-wider ${
                        isCurrent ? 'text-blue-900 font-extrabold' : 'text-slate-700'
                      }`}
                    >
                      {lg.name} League
                    </h4>
                    {isCurrent && (
                      <span className="text-[7px] font-black text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                        Current Rank
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">
                    {lg.levels}
                  </p>
                </span>

                {/* Right Action Side */}
                <div className="text-right flex-shrink-0">
                  {isUnlocked ? (
                    <span className="text-[10.5px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/10 uppercase">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10.5px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/10 uppercase tracking-tight">
                      Lvl {lg.minLvl} REQUIRED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Things Section */}
      <div className="space-y-6">
        <h3 className="text-center text-[10px] font-black text-blue-900/30 uppercase tracking-[0.4em]">
          Nexus Support Protocols
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure? This will permanently delete your account and all data.",
                )
              ) {
                deleteAccount();
              }
            }}
            className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-red-400 group transition-all"
          >
            <div className="p-3 bg-red-50 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">
                Delete Account
              </p>
              <p className="text-[8px] text-blue-400 font-bold uppercase mt-1">
                Permanent Removal
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveScreen("social")}
            className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-blue-400 group transition-all"
          >
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">
                Nexus Hub
              </p>
              <p className="text-[8px] text-blue-400 font-bold uppercase mt-1">
                Social Protocols
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveScreen("leaderboard")}
            className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-yellow-400 group transition-all"
          >
            <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600 group-hover:scale-110 transition-transform">
              <Globe size={24} />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">
                Global Rank
              </p>
              <p className="text-[8px] text-blue-400 font-bold uppercase mt-1">
                Check Peer Standing
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveScreen("progress")}
            className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-indigo-400 group transition-all"
          >
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <div>
              <p className="font-black text-blue-900 text-[10px] uppercase tracking-widest">
                Brain Hub
              </p>
              <p className="text-[8px] text-blue-400 font-bold uppercase mt-1">
                Access Neural Logs
              </p>
            </div>
          </button>
        </div>

        <div className="glass-card p-8 bg-blue-900 text-white border-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-black flex items-center gap-2">
                Data Protection <Shield size={18} className="text-blue-400" />
              </h4>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">
                Integrity: 100% Secured
              </p>
            </div>
            <Info size={32} className="opacity-20" />
          </div>
          <p className="text-xs mt-4 opacity-80 leading-relaxed font-medium">
            Your progress and biological data are synchronized across the Nexus
            Grid. No hackers or bugs can breach the Bio-ID lock, bro. 🔥
          </p>
        </div>
      </div>

      {/* Persistence Debug Panel */}
      <div className="glass-card p-8 space-y-6 border-amber-300 bg-amber-50/10">
        <div className="flex items-center justify-between border-b border-amber-200/50 pb-4">
          <div>
            <h3 className="text-xs font-black text-amber-850 uppercase tracking-[0.25em] mb-1">
              Persistence Debug Panel
            </h3>
            <p className="text-[10px] uppercase font-black text-amber-600 tracking-wider">
              Identity & Firestore Mapping Verification
            </p>
          </div>
          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">
            DEBUG ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1 bg-white p-4 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
              Auth Account Email
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 break-all select-all">
              {user?.email || "No Email Associated / Anonymous"}
            </span>
          </div>

          <div className="space-y-1 bg-white p-4 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
              Auth Account UID
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 break-all select-all">
              {user?.uid || "Not Authenticated"}
            </span>
          </div>

          <div className="space-y-1 bg-white p-4 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
              Firestore Doc Path
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 break-all select-all">
              {user ? `users/${user.uid}` : "No Document Path (Anonymous)"}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
          <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">💡 Debugger Insights:</span>
          Compare the <strong className="text-blue-900">Auth Account Email</strong> and <strong className="text-blue-900">UID</strong> displayed above with your browser-side or console logs to verify that the active Google account credentials match the loaded Firestore user settings and daily progress documents.
        </div>
      </div>

      {/* Commander Deck Control for admin privileges */}
      {(user?.uid === "G77faQhRPfe5jr4hbY0O0L4fNUs2" || user?.email === "thomasaugustino12345678@gmail.com") && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.4em]">
              Commander Security Center
            </h3>
            <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm">
              ADMIN CONTROL
            </span>
          </div>

          <button
            onClick={() => setActiveScreen("admin")}
            className="w-full glass-card p-6 flex items-center justify-between bg-gradient-to-br from-red-605 to-rose-700 border-none text-white shadow-xl shadow-red-500/20 group hover:scale-[1.02] transition-all"
            style={{ backgroundColor: "#be123c", backgroundImage: "linear-gradient(to bottom right, #be123c, #9f1239)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:rotate-12 transition-transform">
                <Shield size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase tracking-wider italic">
                  Commander Control Deck
                </p>
                <p className="text-[10px] font-medium opacity-85">
                  Inspect System Metrics, User Databases, Signals & Transmissions
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[9px] font-black uppercase rounded-lg border border-white/10 tracking-widest relative z-10">
              LAUNCH ⚡
            </span>
          </button>
        </div>
      )}

      {/* Nexora Architect Lab for Pro Users */}
      {settings.isPro && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.4em]">
              Nexora Architect
            </h3>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm">
              PRO FEATURE
            </span>
          </div>

          {!showArchitect ? (
            <button
              onClick={() => setShowArchitect(true)}
              className="w-full glass-card p-6 flex items-center justify-between bg-gradient-to-br from-blue-500 to-indigo-600 border-none text-white shadow-xl shadow-blue-500/20 group hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:rotate-12 transition-transform">
                  <Layout size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-wider italic">
                    Architect Lab
                  </p>
                  <p className="text-[10px] font-medium opacity-70">
                    Customize your Interface & Navigation
                  </p>
                </div>
              </div>
              <Plus
                size={24}
                className="opacity-40 group-hover:opacity-100 transition-opacity"
              />
            </button>
          ) : (
            <div className="space-y-4">
              <ArchitectLab
                settings={settings}
                onUpdateSettings={(updates) =>
                  setSettings((prev) => ({ ...prev, ...updates }))
                }
                onClose={() => setShowArchitect(false)}
              />
              <button
                onClick={() => setShowArchitect(false)}
                className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-colors"
              >
                Close Architect Lab
              </button>
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-8">
        <h3 className="text-xs font-black text-blue-900/30 uppercase tracking-[0.25em] mb-6">
          Achievements Unlock
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {stats.trophies && stats.trophies.length > 0
            ? stats.trophies.map((t, i) => (
                <div
                  key={t.id || i}
                  className="min-w-[120px] aspect-[4/5] bg-blue-50 rounded-[2rem] border-2 border-white flex flex-col items-center justify-center p-4 text-center hover:scale-105 transition-all"
                >
                  <div
                    className={`p-3 rounded-2xl shadow-sm mb-3 ${t.type === "golden" ? "bg-yellow-50 text-yellow-600" : t.type === "ice" ? "bg-blue-50 text-blue-400" : "bg-red-50 text-red-400"}`}
                  >
                    <Award size={24} />
                  </div>
                  <p className="font-black text-blue-900 uppercase text-[8px] tracking-widest leading-tight">
                    {t.id.split("-")[0]} Rank
                  </p>
                  <p className="text-[6px] font-bold text-blue-400/60 mt-1 uppercase italic">
                    {t.type}
                  </p>
                </div>
              ))
            : [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="min-w-[120px] aspect-[4/5] bg-blue-50 rounded-[2rem] border-2 border-white flex flex-col items-center justify-center p-4 text-center grayscale opacity-40"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm mb-3">
                    <Award size={24} className="text-blue-500" />
                  </div>
                  <p className="font-black text-blue-900 uppercase text-[8px] tracking-widest leading-tight">
                    Elite Pioneer
                  </p>
                </div>
              ))}
        </div>
      </div>
    </motion.div>
  );
}
