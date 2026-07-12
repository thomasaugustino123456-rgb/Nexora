import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, LogOut, Bell, Shield, User, Globe, Mail, MessageSquare, 
  Trash2, ChevronLeft, RefreshCw, Smartphone, Zap, Flame, 
  Droplets, Target, Clock, Volume2, Palette, Sparkles, 
  ShieldCheck, BrainCircuit, Info, CreditCard, Check, BookOpen, AlertCircle, Video,
  Layout, BoxSelect, Lock, Key, EyeOff, MessageSquareOff
} from 'lucide-react';
// import { auth, FirebaseUser, EmailAuthProvider, linkWithCredential, updatePassword, sendPasswordResetEmail, GoogleAuthProvider, reauthenticateWithPopup } from '../firebase';
// FirebaseUser is now defined locally or imported elsewhere, check imports
type FirebaseUser = any; // Temporary fix

import { UserSettings } from '../types';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { translate } from '../lib/translations';


interface SettingsScreenProps {
  user: FirebaseUser | null;
  settings: UserSettings;
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  isPro: boolean;
  onBack: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  fcmToken: string | null;
  fcmError: string | null;
  onRetryFCM: () => Promise<string | null>;
  onSendTestNotification: () => void;
  onSendMotivation: () => void;
  onSendTestEmail: () => void;
  onClearCache: () => void;
  onExportData: () => void;
  onSubmitFeedback: (f: { rating: number, message: string, category: string }) => void;
  onShowManifesto: () => void;
  showToast: (m: string, t?: 'success' | 'info' | 'error') => void;
  sendNotification: (title: string, body: string) => void;
  onOpenArchitectLab: () => void;
  onOpenDeviceShowcase?: () => void;
  rollbackBackupData: any;
  onRollbackRestore: () => void;
  onSimulateUpdate: () => void;
  currentAppVersion: string;
  isStandalone?: boolean;
  onTriggerPwaInstall?: () => void;
}

export function SettingsScreen({ 
  user, settings, setSettings, isPro, onBack, onLogout, onDeleteAccount,
  fcmToken, fcmError, onRetryFCM, onSendTestNotification, 
  onSendMotivation, onSendTestEmail, onClearCache, onExportData,
  onSubmitFeedback, onShowManifesto, showToast, sendNotification,
  onOpenArchitectLab,
  onOpenDeviceShowcase,
  rollbackBackupData,
  onRollbackRestore,
  onSimulateUpdate,
  currentAppVersion,
  isStandalone = false,
  onTriggerPwaInstall
}: SettingsScreenProps) {
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [mascotError, setMascotError] = React.useState(false);

  // Password actions state
  const [passwordInput, setPasswordInput] = React.useState('');
  const [isPasswordActionLoading, setIsPasswordActionLoading] = React.useState(false);

  // Community feedback inline state
  const [feedback, setFeedback] = React.useState({ rating: 5, message: '', category: 'General' });

  // Premium Code Entry state
  const [proCode, setProCode] = React.useState('');

  // Selected language state (bound to real settings.language)
  const selectedLanguage = settings.language || 'en';

  const hasPasswordProvider = user?.providerData?.some(
    (provider) => provider.providerId === 'password'
  );

  const handleSavePassword = async () => {
    // vibrate(15);
    // showToast('Firebase Auth is disabled. Transitioning to Supabase.', 'info');
  };

  const handleSendResetEmail = async () => {
    // vibrate(15);
    // showToast('Firebase Auth is disabled. Transitioning to Supabase.', 'info');
  };

  const handleActivateProCode = () => {
    vibrate(VIBRATION_PATTERNS.NOTIFY);
    const code = proCode.trim().toUpperCase();
    if (code === 'PRO100' || code === 'NEXORA' || code === 'DEVELOPER') {
      setSettings({ isPro: true });
      showToast('Nexus Pro Unlocked! Welcome to the Elite Tier, Operative! 🚀', 'success');
      setProCode('');
    } else if (code === 'RESET') {
      setSettings({ isPro: false });
      showToast('Nexus Pro reset to Free Tier.', 'info');
      setProCode('');
    } else {
      showToast('Invalid activation code, bro. Try "NEXORA" or "DEVELOPER" to test!', 'error');
    }
  };

  const handleInlineFeedbackSubmit = () => {
    vibrate(VIBRATION_PATTERNS.CLICK);
    if (!feedback.message.trim()) {
      showToast('Please enter a detailed message first, bro!', 'error');
      return;
    }
    onSubmitFeedback(feedback);
    showToast('Transmission complete! Feedback logged securely at HQ. 📡', 'success');
    setFeedback({ rating: 5, message: '', category: 'General' });
  };

  const COLORS = [
    { name: 'Classic Blue', value: '#3b82f6' },
    { name: 'Sunset Orange', value: '#f97316' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Rose', value: '#f43f5e' },
  ];

  // Map of categories on the Settings dashboard
  const CATEGORIES = [
    { id: 'account', label: 'Account', desc: 'Bio-ID, photo, and passwords', icon: User, color: 'text-amber-500 bg-amber-500/[0.06] border-amber-500/10' },
    { id: 'notifications', label: 'Notifications', desc: 'Push schedules, sound packs', icon: Bell, color: 'text-orange-500 bg-orange-500/[0.06] border-orange-500/10' },
    { id: 'goals', label: 'Goals', desc: 'Pushups, water, challenges', icon: Target, color: 'text-emerald-500 bg-emerald-500/[0.06] border-emerald-500/10' },
    { id: 'appearance', label: 'Appearance', desc: 'Theme colors, interface, performance', icon: Palette, color: 'text-purple-500 bg-purple-500/[0.06] border-purple-500/10' },
    { id: 'privacy', label: 'Privacy', desc: 'Cloaking feed, comment visibility', icon: Shield, color: 'text-rose-500 bg-rose-500/[0.06] border-rose-500/10' },
    { id: 'language', label: 'Language & Units', desc: 'Metric format, display locales', icon: Globe, color: 'text-indigo-500 bg-indigo-500/[0.06] border-indigo-500/10' },
    { id: 'backup', label: 'Backup & Sync', desc: 'Version snapshot, rollback protection', icon: RefreshCw, color: 'text-teal-500 bg-teal-500/[0.06] border-teal-500/10' },
    { id: 'sound', label: 'Sound', desc: 'Lofi state, mascot audio packs', icon: Volume2, color: 'text-pink-500 bg-pink-500/[0.06] border-pink-500/10' },
    { id: 'community', label: 'Community', desc: 'HQ feedback transmission center', icon: MessageSquare, color: 'text-amber-600 bg-amber-600/[0.06] border-amber-600/10' },
    { id: 'premium', label: 'Premium', desc: 'Unlock architect mode & elite perks', icon: Sparkles, color: 'text-yellow-600 bg-yellow-500/[0.06] border-yellow-500/10' },
    { id: 'device-showcase', label: 'Mockup Studio', desc: 'Frame screens in phone, tablet, laptop', icon: Smartphone, color: 'text-indigo-600 bg-indigo-600/[0.06] border-indigo-600/10' },
    { id: 'about', label: 'About & Security', desc: 'Integrity tests, manifesto, session exit', icon: Info, color: 'text-slate-500 bg-slate-500/[0.06] border-slate-500/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-2xl mx-auto w-full space-y-6 pb-40 px-3"
      id="settings-master-container"
    >
      <AnimatePresence>
        {/* Modals placed outside category routes */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden border border-[#E9E4D4]"
              id="privacy-protocol-modal"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-blue-900 leading-tight">Privacy Protocol</h3>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Security Level: Maximum</p>
                </div>
              </div>
              
              <div className="space-y-4 text-blue-900/70 text-sm font-medium leading-relaxed">
                <p>Bro, your privacy is our top priority. Here's how we keep your data strong:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <span>Your workout stats and habits are encrypted and tied directly to your unique Bio-ID.</span>
                  </li>
                  <li className="flex gap-3">
                    <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <span>We never share your location or identity with 3rd party protocols.</span>
                  </li>
                  <li className="flex gap-3">
                    <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <span>All communication is signed with advanced certificate verification.</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => { vibrate(10); setShowPrivacyModal(false); }}
                className="w-full bg-[#4F3F34] text-[#FCFAF6] py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wider text-xs"
                id="dismiss-privacy-modal-btn"
              >
                DISMISS PROTOCOL
              </button>
            </motion.div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden border border-[#E9E4D4]"
              id="delete-account-modal"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
              <div className="flex items-center gap-4 text-red-600">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black leading-tight">Terminal Action</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Account Deletion Protocol</p>
                </div>
              </div>
              
              <div className="space-y-4 text-blue-900/70 text-sm font-medium leading-relaxed">
                <p className="font-bold text-red-600">Warning: This action is irreversible, bro.</p>
                <p>Deleting your account will permanently erase your Bio-ID, workout history, and all earned trophies from our secure servers.</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { vibrate(10); setShowDeleteConfirm(false); }}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black shadow-sm hover:bg-gray-200 active:scale-95 transition-all text-xs"
                  id="cancel-delete-btn"
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
                    onDeleteAccount();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-red-700 active:scale-95 transition-all text-xs"
                  id="confirm-delete-btn"
                >
                  DELETE DATA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeCategory === null ? (
          /* ========================================================================= */
          /*                       MAIN SETTINGS DASHBOARD SCREEN                       */
          /* ========================================================================= */
          <motion.div
            key="settings-dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-4 sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md z-40 py-4 px-2 -mx-2 border-b border-[#E9E4D4]/30">
              <button 
                onClick={onBack} 
                className="p-3 bg-white rounded-2xl shadow-sm text-[#4F3F34] hover:scale-105 active:scale-95 transition-all border border-[#E9E4D4]"
                id="settings-back-btn"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h2 className="text-3xl font-black text-[#4F3F34] tracking-tight uppercase">{translate("System Settings", selectedLanguage)}</h2>
                <p className="text-[10px] font-black text-[#69C496] uppercase tracking-[0.3em] opacity-80">{translate("Global Control Center", selectedLanguage)}</p>
              </div>
            </div>

            {/* Quick Account Profile Card at the Top */}
            <div 
              onClick={() => { vibrate(10); setActiveCategory('account'); }}
              className="p-5 bg-white border border-[#E9E4D4] rounded-[2.5rem] shadow-sm hover:scale-[1.01] hover:border-[#69C496]/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
              id="dashboard-profile-banner"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-[#E9E4D4] overflow-hidden shadow-inner border-2 border-white shrink-0 relative">
                  <img src={settings.profilePic || user?.photoURL || "/icon-512.png"} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Bio" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-[#69C496] uppercase tracking-widest leading-none">Logged Operative</p>
                  <h3 className="font-black text-lg text-[#4F3F34] truncate mt-1">
                    {settings.displayName || user?.displayName || 'Nexora Citizen'}
                  </h3>
                  <p className="text-[10px] text-[#4F3F34]/55 truncate">{user?.email || 'offline_node@citizen.nexora'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isPro ? 'bg-amber-400 text-white shadow-lg shadow-amber-300/30' : 'bg-gray-100 text-gray-400'}`}>
                  {isPro ? <><Crown size={10} /> Nexus Pro</> : 'Free Tier'}
                </div>
                <ChevronLeft size={16} className="rotate-180 text-[#4F3F34]/30" />
              </div>
            </div>

            {/* Modern Settings Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="settings-grid">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <motion.div
                    key={cat.id}
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.CLICK);
                      if (cat.id === 'device-showcase') {
                        onOpenDeviceShowcase?.();
                      } else {
                        setActiveCategory(cat.id);
                      }
                    }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="p-5 bg-white border border-[#E9E4D4] rounded-3xl shadow-sm hover:shadow-md hover:border-[#69C496]/50 transition-all cursor-pointer flex gap-4 text-left items-start select-none"
                    id={`setting-card-${cat.id}`}
                  >
                    <div className={`p-3 rounded-2xl ${cat.color} shrink-0 border`}>
                      <IconComponent size={20} className="stroke-[2.2]" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="font-black text-[#4F3F34] text-[15px] tracking-tight flex items-center gap-1.5">
                        {translate(cat.label, selectedLanguage)}
                        {cat.id === 'premium' && !isPro && (
                          <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase animate-pulse">
                            Get
                          </span>
                        )}
                        {cat.id === 'premium' && isPro && (
                          <span className="text-[8px] bg-[#69C496] text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-xs font-bold text-[#4F3F34]/50 leading-snug">
                        {translate(cat.desc, selectedLanguage)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Version Badge Footer */}
            <div className="text-center pt-8 pb-4 space-y-2">
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-white border border-[#E9E4D4] rounded-full text-[8px] font-black text-[#4F3F34]/55 uppercase tracking-widest">
                  v{currentAppVersion} ALPHA
                </span>
                <span className="px-3 py-1 bg-[#E8F5EE] border border-[#D0EFE0] rounded-full text-[8px] font-black text-[#69C496] uppercase tracking-widest">
                  SECURE PROTOCOL
                </span>
              </div>
              <p className="text-[10px] text-[#4F3F34]/40 font-bold italic">"Consistency creates gods, bro. Don't stop now."</p>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /*                          DEDICATED SETTINGS PAGE                           */
          /* ========================================================================= */
          <motion.div
            key={`category-${activeCategory}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Dedicated Page Header */}
            <div className="flex items-center gap-4 sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-md z-40 py-4 px-2 -mx-2 border-b border-[#E9E4D4]/30">
              <button 
                onClick={() => { vibrate(10); setActiveCategory(null); }} 
                className="p-3 bg-white rounded-2xl shadow-sm text-[#4F3F34] hover:scale-105 active:scale-95 transition-all border border-[#E9E4D4]"
                id="subpage-back-btn"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-[#69C496] uppercase tracking-widest leading-none">{translate("Settings Area", selectedLanguage)}</p>
                <h2 className="text-2xl font-black text-[#4F3F34] tracking-tight uppercase truncate mt-0.5">
                  {translate(CATEGORIES.find(c => c.id === activeCategory)?.label || "", selectedLanguage)}
                </h2>
              </div>
            </div>

            <p className="text-xs font-semibold text-[#4F3F34]/65 leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-[#E9E4D4]/50">
              {translate(CATEGORIES.find(c => c.id === activeCategory)?.desc || "", selectedLanguage)}
            </p>

            {/* Category Page Router Content */}
            <div className="space-y-6">
              
              {/* === 1. ACCOUNT CATEGORY === */}
              {activeCategory === 'account' && (
                <div className="space-y-6" id="account-subpage">
                  {/* Bio-ID and Photo */}
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <User size={14} className="text-amber-500" /> Bio-ID Profile Setup
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#FAF7F2]/50 rounded-2xl border border-[#E9E4D4]/40">
                      <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shadow-inner border-2 border-[#E9E4D4] shrink-0 relative flex items-center justify-center">
                        <img src={settings.profilePic || user?.photoURL || "/icon-512.png"} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Avatar" />
                      </div>
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-[9px] font-black text-[#4F3F34]/40 uppercase tracking-widest block pl-0.5">Custom Display Name</label>
                        <input 
                          type="text" 
                          value={settings.displayName || ''} 
                          onChange={(e) => setSettings({ displayName: e.target.value })}
                          placeholder={settings.displayName || user?.displayName || 'Nexora User'}
                          className="font-black text-[#4F3F34] bg-white border border-[#E9E4D4] rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#69C496] w-full text-sm shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 bg-white border border-[#E9E4D4] rounded-2xl text-left">
                        <span className="text-[8px] font-black text-[#4F3F34]/40 uppercase tracking-widest block">Registered Email</span>
                        <span className="text-xs font-bold text-[#4F3F34] block truncate mt-0.5">{user?.email || 'Offline Node'}</span>
                      </div>
                      <div className="p-3 bg-white border border-[#E9E4D4] rounded-2xl text-left">
                        <span className="text-[8px] font-black text-[#4F3F34]/40 uppercase tracking-widest block">Access Tier</span>
                        <span className="text-xs font-black text-amber-600 uppercase tracking-wide block mt-0.5">
                          {isPro ? '💎 Nexus Pro' : 'Free Tier'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Credentials */}
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <Lock size={14} className="text-blue-500" /> Security Credentials
                    </h3>

                    <div className="p-4 bg-blue-50/20 border border-blue-50 rounded-2xl space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-white rounded-xl border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                          <Key size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-blue-900 text-xs">
                            {hasPasswordProvider ? 'Direct Email Login Connected' : 'Email Password Protocol'}
                          </h4>
                          <p className="text-[10px] text-blue-900/60 font-semibold leading-relaxed mt-0.5">
                            Set an offline password to sign in via credential triggers alongside your master Google Auth.
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-blue-100/50 pt-3 space-y-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-blue-900/40 uppercase tracking-widest pl-1">
                            {hasPasswordProvider ? 'Update Direct Password' : 'New Password (min 6 chars)'}
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="password" 
                              placeholder="Type security password"
                              value={passwordInput}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              disabled={isPasswordActionLoading}
                              className="flex-1 bg-white text-blue-900 placeholder-blue-900/30 rounded-xl px-4 py-2.5 text-xs font-bold border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <button
                              onClick={handleSavePassword}
                              disabled={isPasswordActionLoading}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shrink-0"
                            >
                              {isPasswordActionLoading ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-dashed border-blue-100/50 pt-3">
                          <span className="text-[9px] text-blue-900/40 font-black uppercase tracking-widest">Self Reset Trigger</span>
                          <button
                            onClick={handleSendResetEmail}
                            disabled={isPasswordActionLoading}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all"
                          >
                            ✉️ Send Reset Link to Gmail
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === 2. NOTIFICATIONS CATEGORY === */}
              {activeCategory === 'notifications' && (
                <div className="space-y-6" id="notifications-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm">
                    {/* Master switch */}
                    <div className="flex items-center justify-between p-4 bg-[#4F3F34] text-[#FCFAF6] rounded-2xl shadow-md">
                      <div>
                        <p className="font-black text-sm uppercase">Global Push State</p>
                        <p className="text-[9px] text-[#69C496] font-black uppercase tracking-widest">Master Feed Toggle</p>
                      </div>
                      <button 
                        onClick={() => setSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                        className={`w-14 h-8 rounded-full transition-all relative ${settings.notificationsEnabled ? 'bg-[#69C496]' : 'bg-black/20'}`}
                      >
                        <div className={`absolute top-1.5 w-5 h-5 rounded-full bg-white transition-all ${settings.notificationsEnabled ? 'left-7.5 shadow-md' : 'left-1.5'}`} />
                      </button>
                    </div>

                    {settings.notificationsEnabled ? (
                      <div className="space-y-4 pt-2">
                        {/* Time setup */}
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-black text-[#4F3F34]/40 uppercase tracking-widest pl-1">Daily Trigger Targets</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E4D4]/60">
                              <label className="text-[8px] font-black uppercase text-[#4F3F34]/40 block mb-1">Morning Trigger</label>
                              <input 
                                type="time" 
                                value={settings.reminderTime || '08:00'} 
                                onChange={(e) => setSettings({ reminderTime: e.target.value })}
                                className="w-full bg-transparent font-black text-[#4F3F34] outline-none text-xs"
                              />
                            </div>
                            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E4D4]/60">
                              <label className="text-[8px] font-black uppercase text-[#4F3F34]/40 block mb-1">Evening Trigger</label>
                              <input 
                                type="time" 
                                value={settings.reminderTime2 || '21:00'} 
                                onChange={(e) => setSettings({ reminderTime2: e.target.value })}
                                className="w-full bg-transparent font-black text-[#4F3F34] outline-none text-xs"
                              />
                            </div>
                            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E9E4D4]/60">
                              <label className="text-[8px] font-black uppercase text-[#4F3F34]/40 block mb-1">Motivation Sync</label>
                              <input 
                                type="time" 
                                value={settings.motivationTime || '12:00'} 
                                onChange={(e) => setSettings({ motivationTime: e.target.value })}
                                className="w-full bg-transparent font-black text-[#4F3F34] outline-none text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Frequency settings checkboxes */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-[#4F3F34]/40 uppercase tracking-widest pl-1">Frequency Channels</h4>
                          {[
                            { id: 'trophy', label: 'Trophy Earned Alerts', state: settings.badgeSettings?.trophyAlerts, setter: (v: boolean) => setSettings(prev => ({ ...prev, badgeSettings: { ...prev.badgeSettings!, trophyAlerts: v } })) },
                            { id: 'challenge', label: 'Daily Challenge Reminders', state: settings.badgeSettings?.dailyChallenge, setter: (v: boolean) => setSettings(prev => ({ ...prev, badgeSettings: { ...prev.badgeSettings!, dailyChallenge: v } })) },
                            { id: 'quest', label: 'New Quest Broadcasts', state: settings.badgeSettings?.dailyQuest, setter: (v: boolean) => setSettings(prev => ({ ...prev, badgeSettings: { ...prev.badgeSettings!, dailyQuest: v } })) },
                            { id: 'urgency', label: 'Dynamic Urgency (Pester Mode)', state: settings.badgeSettings?.dynamicUrgency, setter: (v: boolean) => setSettings(prev => ({ ...prev, badgeSettings: { ...prev.badgeSettings!, dynamicUrgency: v } })) },
                          ].map(b => (
                            <div key={b.id} className="flex items-center justify-between p-3.5 bg-[#FAF7F2]/50 rounded-2xl border border-[#E9E4D4]/40 text-[#4F3F34]">
                              <span className="text-[10px] font-black uppercase tracking-wider leading-none">{b.label}</span>
                              <button 
                                onClick={() => { vibrate(5); b.setter(!b.state); }}
                                className={`w-9 h-5 rounded-full transition-all relative ${b.state ? 'bg-[#69C496]' : 'bg-gray-200'}`}
                              >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${b.state ? 'left-5' : 'left-1'}`} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* FCM Token block */}
                        {fcmError ? (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="bg-red-500 p-2 rounded-xl text-white shadow-sm shrink-0">
                                <AlertCircle size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] text-red-600 font-black uppercase">FCM Feed Synced Failed</p>
                                <p className="text-[10px] text-red-900/60 font-bold leading-normal">System offline loop detected.</p>
                              </div>
                            </div>
                            <button 
                              onClick={onRetryFCM} 
                              className="p-2 px-3.5 bg-white text-red-500 rounded-xl shadow-sm border border-red-100 text-[10px] font-black uppercase active:scale-95 transition-transform"
                            >
                              Retry
                            </button>
                          </div>
                        ) : !fcmToken && (
                          <div className="p-4 bg-[#FAF7F2] border border-[#E9E4D4]/60 rounded-2xl flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm shrink-0">
                                <Smartphone size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] text-orange-600 font-black uppercase">Token Registry Pending</p>
                                <p className="text-[10px] text-[#4F3F34]/50 font-bold leading-normal">Requesting secure browser key...</p>
                              </div>
                            </div>
                            <button 
                              onClick={onRetryFCM} 
                              className="p-2 px-3.5 bg-white text-orange-600 rounded-xl shadow-sm border border-[#E9E4D4] text-[10px] font-black uppercase active:scale-95 transition-all"
                            >
                              Sync
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Broadcast Silenced</span>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">Enable Push State above to activate time schedule controls and frequency channels, bro.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === 3. GOALS CATEGORY === */}
              {activeCategory === 'goals' && (
                <div className="space-y-6" id="goals-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-5 shadow-sm">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <Target size={14} className="text-emerald-500" /> Biometrics Target Metrics
                    </h3>

                    {/* Pushups Goal */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4F3F34]/40 uppercase tracking-widest pl-2 flex items-center gap-2">
                        <Flame size={12} className="text-orange-500" /> Daily Pushups Count
                      </label>
                      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-2xl border border-[#E9E4D4]/40">
                        <button 
                          onClick={() => { vibrate(5); setSettings({ pushupsGoal: Math.max(1, (settings.pushupsGoal || 0) - 5) }); }} 
                          className="w-10 h-10 flex items-center justify-center bg-white border border-[#E9E4D4] rounded-xl shadow-sm text-[#4F3F34] font-black text-lg active:scale-95 transition-transform"
                        >-</button>
                        <span className="text-xl font-black text-[#4F3F34]">{settings.pushupsGoal} reps</span>
                        <button 
                          onClick={() => { vibrate(5); setSettings({ pushupsGoal: (settings.pushupsGoal || 0) + 5 }); }} 
                          className="w-10 h-10 flex items-center justify-center bg-white border border-[#E9E4D4] rounded-xl shadow-sm text-[#4F3F34] font-black text-lg active:scale-95 transition-transform"
                        >+</button>
                      </div>
                    </div>

                    {/* Water Goal */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4F3F34]/40 uppercase tracking-widest pl-2 flex items-center gap-2">
                        <Droplets size={12} className="text-blue-500" /> Daily Hydration Goal
                      </label>
                      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-2xl border border-[#E9E4D4]/40">
                        <button 
                          onClick={() => { vibrate(5); setSettings({ waterGoal: Math.max(1, (settings.waterGoal || 0) - 1) }); }} 
                          className="w-10 h-10 flex items-center justify-center bg-white border border-[#E9E4D4] rounded-xl shadow-sm text-[#4F3F34] font-black text-lg active:scale-95 transition-transform"
                        >-</button>
                        <span className="text-xl font-black text-[#4F3F34]">{settings.waterGoal} Liters</span>
                        <button 
                          onClick={() => { vibrate(5); setSettings({ waterGoal: (settings.waterGoal || 0) + 1 }); }} 
                          className="w-10 h-10 flex items-center justify-center bg-white border border-[#E9E4D4] rounded-xl shadow-sm text-[#4F3F34] font-black text-lg active:scale-95 transition-transform"
                        >+</button>
                      </div>
                    </div>

                    {/* Daily Challenge Targets */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4F3F34]/40 uppercase tracking-widest pl-2">
                        Daily Challenge Stages
                      </label>
                      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-2xl border border-[#E9E4D4]/40">
                        <button 
                          onClick={() => { vibrate(5); setSettings({ challengeCountGoal: Math.max(1, (settings.challengeCountGoal || 0) - 1) }); }} 
                          className="w-10 h-10 flex items-center justify-center bg-white border border-[#E9E4D4] rounded-xl shadow-sm text-[#4F3F34] font-black text-lg active:scale-95 transition-transform"
                        >-</button>
                        <span className="text-xl font-black text-[#4F3F34]">{settings.challengeCountGoal} Stages / Day</span>
                        <button 
                          onClick={() => { vibrate(5); setSettings({ challengeCountGoal: (settings.challengeCountGoal || 0) + 1 }); }} 
                          className="w-10 h-10 flex items-center justify-center bg-white border border-[#E9E4D4] rounded-xl shadow-sm text-[#4F3F34] font-black text-lg active:scale-95 transition-transform"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === 4. APPEARANCE CATEGORY === */}
              {activeCategory === 'appearance' && (
                <div className="space-y-6" id="appearance-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-6 shadow-sm">
                    {/* Theme colors dots selector */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-[#4F3F34]/40 uppercase tracking-widest pl-1">
                        Interface Frequency (Theme Accents)
                      </h4>
                      <div className="flex gap-4 p-4 bg-[#FAF7F2]/50 border border-[#E9E4D4]/30 rounded-2xl justify-center">
                        {COLORS.map(color => (
                          <button 
                            key={color.value}
                            onClick={() => { vibrate(10); setSettings({ themeColor: color.value }); }}
                            className={`w-11 h-11 rounded-full border-4 shadow-sm transition-all relative ${settings.themeColor === color.value ? 'scale-110 border-white ring-4 ring-[#69C496]/50' : 'border-white hover:scale-105 hover:shadow-md'}`}
                            style={{ backgroundColor: color.value }}
                          >
                            {settings.themeColor === color.value && (
                              <div className="absolute inset-0 flex items-center justify-center text-white">
                                <Check size={18} className="stroke-[3]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Performance toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#FAF7F2]/50 border border-[#E9E4D4]/40 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="text-[#69C496] shrink-0"><Zap size={16} /></div>
                        <div>
                          <span className="text-xs font-black text-[#4F3F34] uppercase tracking-tight block">Performance Mode</span>
                          <span className="text-[8px] font-bold text-[#4F3F34]/50 uppercase tracking-wider block">Optimize frame rendering rates</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { vibrate(10); setSettings({ performanceMode: !settings.performanceMode }); }}
                        className={`w-11 h-6 rounded-full transition-all relative ${settings.performanceMode ? 'bg-[#69C496]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${settings.performanceMode ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Architect Mode Button inside Appearance */}
                    {isPro ? (
                      <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shrink-0">
                            <Layout size={16} />
                          </div>
                          <div className="text-left">
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block leading-none">Architect Lab</span>
                            <span className="text-xs font-black text-indigo-900 mt-1 block">Full Interface Configurator</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-indigo-900/60 leading-normal font-bold">
                          Rearrange main dashboard modules, hide sections, and customize Nexora layout parameters.
                        </p>
                        <button 
                          onClick={() => { vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT); onOpenArchitectLab(); }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-xs tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          ENTER ARCHITECT LAB MODE
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200/50 rounded-2xl flex items-center justify-between gap-3 text-left">
                        <div className="min-w-0">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Custom Layout Locked</span>
                          <span className="text-xs font-black text-gray-500 mt-1 block">Architect Lab</span>
                          <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">Customizing workspace ordering and elements visibility is exclusive to Pro operatives.</p>
                        </div>
                        <button 
                          onClick={() => { vibrate(10); setActiveCategory('premium'); }}
                          className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 px-3.5 rounded-xl font-black text-[10px] uppercase tracking-wider shrink-0 active:scale-95 transition-all"
                        >
                          Unlock
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === 5. PRIVACY CATEGORY === */}
              {activeCategory === 'privacy' && (
                <div className="space-y-6" id="privacy-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm text-left">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <Shield size={14} className="text-rose-500" /> Privacy & Cloaking Protocols
                    </h3>

                    <div className="space-y-3.5">
                      {/* Profile Privacy Toggle */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAF7F2]/50 border border-[#E9E4D4]/40 rounded-2xl">
                        <div className="space-y-0.5 flex-1">
                          <h4 className="font-black text-[#4F3F34] text-xs uppercase flex items-center gap-1.5">
                            <span>Profile Privacy State</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase text-white ${settings.profilePrivacy === 'private' ? 'bg-rose-500' : 'bg-[#69C496]'}`}>
                              {settings.profilePrivacy === 'private' ? 'Cloaked' : 'Public'}
                            </span>
                          </h4>
                          <p className="text-[10px] text-[#4F3F34]/55 font-semibold leading-normal">
                            Cloak your daily streak counters and alien plants milestones from other peer citizen inspections.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            vibrate(10);
                            const nextVal = settings.profilePrivacy === 'private' ? 'public' : 'private';
                            setSettings({ profilePrivacy: nextVal });
                            showToast(`Profile privacy set to ${nextVal.toUpperCase()}`, 'success');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all ${settings.profilePrivacy === 'private' ? 'bg-rose-500' : 'bg-[#69C496]'}`}
                        >
                          {settings.profilePrivacy === 'private' ? 'Private' : 'Public'}
                        </button>
                      </div>

                      {/* Hide Posts Toggle */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAF7F2]/50 border border-[#E9E4D4]/40 rounded-2xl">
                        <div className="space-y-0.5 flex-1">
                          <h4 className="font-black text-[#4F3F34] text-xs uppercase flex items-center gap-1.5">
                            <EyeOff size={12} className="text-blue-500" />
                            <span>Hide My Feed Posts</span>
                          </h4>
                          <p className="text-[10px] text-[#4F3F34]/55 font-semibold leading-normal">
                            Dynamically exclude your published habit records from the general collective community boards.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            vibrate(10);
                            const nextVal = !settings.hidePostsFromOthers;
                            setSettings({ hidePostsFromOthers: nextVal });
                            showToast(nextVal ? 'Posts cloaked from public' : 'Posts restored to public', 'info');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${settings.hidePostsFromOthers ? 'bg-[#4F3F34] text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {settings.hidePostsFromOthers ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      {/* Hide Comments Toggle */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAF7F2]/50 border border-[#E9E4D4]/40 rounded-2xl">
                        <div className="space-y-0.5 flex-1">
                          <h4 className="font-black text-[#4F3F34] text-xs uppercase flex items-center gap-1.5">
                            <MessageSquareOff size={12} className="text-pink-500" />
                            <span>Hide My Comments</span>
                          </h4>
                          <p className="text-[10px] text-[#4F3F34]/55 font-semibold leading-normal">
                            Conceal comment triggers from other operatives under public chat discussion boards.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            vibrate(10);
                            const nextVal = !settings.hideCommentsFromOthers;
                            setSettings({ hideCommentsFromOthers: nextVal });
                            showToast(nextVal ? 'Comments hidden from other peers' : 'Comments visible to community', 'info');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${settings.hideCommentsFromOthers ? 'bg-[#4F3F34] text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {settings.hideCommentsFromOthers ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-[#E9E4D4] pt-4 mt-2">
                      <button 
                        onClick={() => { vibrate(10); setShowPrivacyModal(true); }}
                        className="w-full bg-[#FAF7F2] hover:bg-[#E9E4D4]/30 text-[#4F3F34] py-3.5 rounded-xl border border-[#E9E4D4] text-xs font-black uppercase tracking-wider transition-all"
                      >
                        VIEW PRIVACY MANIFESTO DETAILS
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === 6. LANGUAGE & UNITS CATEGORY === */}
              {activeCategory === 'language' && (
                <div className="space-y-6" id="language-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-5 shadow-sm text-left">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <Globe size={14} className="text-indigo-500" /> {translate("Region & Localisation Parameters", selectedLanguage)}
                    </h3>

                    {/* Metric / Imperial toggle */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-[#4F3F34]/40 uppercase tracking-widest pl-1">
                        {translate("Measurement Scale Systems", selectedLanguage)}
                      </h4>
                      <div className="flex bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#E9E4D4]/40 justify-between items-center gap-4">
                        <span className="text-xs font-black text-[#4F3F34] pl-2">{translate("System Standard", selectedLanguage)}</span>
                        <div className="flex bg-white p-1 rounded-xl shadow-inner border border-[#E9E4D4]/30">
                          <button 
                            onClick={() => { vibrate(5); setSettings({ unitSystem: 'metric' }); }}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${settings.unitSystem === 'metric' ? 'bg-[#4F3F34] text-[#FCFAF6] shadow-sm' : 'text-[#4F3F34]/50'}`}
                          >{translate("Metric", selectedLanguage)}</button>
                          <button 
                            onClick={() => { vibrate(5); setSettings({ unitSystem: 'imperial' }); }}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${settings.unitSystem === 'imperial' ? 'bg-[#4F3F34] text-[#FCFAF6] shadow-sm' : 'text-[#4F3F34]/50'}`}
                          >{translate("Imperial", selectedLanguage)}</button>
                        </div>
                      </div>
                    </div>

                    {/* Language selector */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-[#4F3F34]/40 uppercase tracking-widest pl-1">
                        {translate("Active App Language Locale", selectedLanguage)}
                      </h4>
                      <div className="relative">
                        <select 
                          value={selectedLanguage}
                          onChange={(e) => {
                            vibrate(10);
                            const val = e.target.value as any;
                            setSettings({ language: val });
                            showToast(`${translate("Language system remapped to", val)}: ${val.toUpperCase()}`, 'info');
                          }}
                          className="w-full bg-[#FAF7F2] border border-[#E9E4D4]/60 rounded-2xl py-3.5 px-4 font-black text-xs text-[#4F3F34] focus:outline-none focus:ring-2 focus:ring-[#69C496] appearance-none cursor-pointer"
                        >
                          <option value="en">🇺🇸 English (US)</option>
                          <option value="es">🇪🇸 Spanish (Castellano)</option>
                          <option value="de">🇩🇪 German (Deutsch)</option>
                          <option value="ja">🇯🇵 Japanese (日本語)</option>
                          <option value="fr">🇫🇷 French (Français)</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#4F3F34]/40">
                          <ChevronLeft size={16} className="rotate-270" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* === 8. BACKUP & SYNC CATEGORY === */}
              {activeCategory === 'backup' && (
                <div className="space-y-6" id="backup-subpage">
                  {/* System Version & Restore Snaps */}
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm text-left">
                    <div className="flex justify-between items-start pb-2 border-b border-[#E9E4D4]/40">
                      <div className="flex items-center gap-2">
                        <RefreshCw size={15} className="text-[#69C496] animate-spin-slow shrink-0" />
                        <div>
                          <h4 className="font-black text-xs text-[#4F3F34] uppercase tracking-tight">Version Snapshot</h4>
                          <span className="text-[8px] font-bold text-[#4F3F34]/40 uppercase tracking-widest block leading-none">Protection snapshot backup</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-[#E8F5EE] border border-[#D0EFE0] rounded-lg text-[9px] font-black text-[#69C496] uppercase">
                        v{currentAppVersion} Active
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-[#4F3F34]/60 leading-normal">
                      Nexora performs local automatic updates. If a recent version breaks any client-side records, rollback instantly using snapshot data here.
                    </p>

                    {rollbackBackupData ? (
                      <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Available Backup Snap</span>
                            <span className="text-xs font-black text-emerald-900 mt-0.5 block">Config: v{rollbackBackupData.version || '2.0.0'}</span>
                          </div>
                          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded">
                            {rollbackBackupData.backupTime ? new Date(rollbackBackupData.backupTime).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                        <button 
                          onClick={() => { vibrate(15); onRollbackRestore(); }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
                        >
                          RESTORE BACKUP v{rollbackBackupData.version}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E9E4D4]/40 text-center">
                        <span className="text-[9px] font-black text-[#4F3F34]/40 uppercase tracking-widest block">No Local Safety Snapshot Found</span>
                        <p className="text-[9px] text-[#4F3F34]/50 font-bold mt-0.5">Snapshots are populated securely before client update execution.</p>
                      </div>
                    )}

                    <button 
                      onClick={() => { vibrate(15); onSimulateUpdate(); }}
                      className="w-full bg-[#4F3F34] text-[#FCFAF6] py-3.5 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-[#3D2F26] transition-all"
                    >
                      🧪 Simulate Client Update (10s Timer)
                    </button>
                  </div>

                  {/* Nexus Lab Test Tools */}
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm text-left">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <BrainCircuit size={14} className="text-purple-500" /> Nexus Debug Lab Tools
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button onClick={onSendTestNotification} className="p-3.5 bg-white border border-[#E9E4D4] rounded-2xl text-[9px] font-black text-[#4F3F34] uppercase tracking-wider hover:bg-[#FAF7F2] transition-all flex flex-col items-center gap-1.5 active:scale-95">
                        <Smartphone size={14} className="text-blue-500" /> Push Alert Test
                      </button>
                      <button onClick={onSendMotivation} className="p-3.5 bg-white border border-[#E9E4D4] rounded-2xl text-[9px] font-black text-[#4F3F34] uppercase tracking-wider hover:bg-[#FAF7F2] transition-all flex flex-col items-center gap-1.5 active:scale-95">
                        <Zap size={14} className="text-yellow-500" /> AI Motivation
                      </button>
                      <button onClick={onExportData} className="p-3.5 bg-white border border-[#E9E4D4] rounded-2xl text-[9px] font-black text-[#4F3F34] uppercase tracking-wider hover:bg-[#FAF7F2] transition-all flex flex-col items-center gap-1.5 active:scale-95">
                        <Mail size={14} className="text-indigo-500" /> Export Records
                      </button>
                      <button onClick={onClearCache} className="p-3.5 bg-white border border-[#E9E4D4] rounded-2xl text-[9px] font-black text-[#4F3F34] uppercase tracking-wider hover:bg-[#FAF7F2] transition-all flex flex-col items-center gap-1.5 active:scale-95">
                        <RefreshCw size={14} className="text-rose-500" /> Reset Caches
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === 9. SOUND CATEGORY === */}
              {activeCategory === 'sound' && (
                <div className="space-y-6" id="sound-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm text-left">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <Volume2 size={14} className="text-pink-500" /> Soundscapes & Audio Signals
                    </h3>

                    <div className="space-y-2.5">
                      {/* Sound pack items */}
                      {[
                        { id: 'zen', label: 'Zen Mode (Background Lofi)', icon: <Sparkles size={14} className="text-[#69C496]" />, state: settings.zenModeEnabled, setter: (v: boolean) => setSettings({ zenModeEnabled: v }) },
                        { id: 'sounds', label: 'Audio Feedback Signals (SFX)', icon: <Volume2 size={14} className="text-pink-500" />, state: settings.soundEnabled, setter: (v: boolean) => setSettings({ soundEnabled: v }) },
                        { id: 'dog-pack', label: 'Mascot Audio Soundpack: Dog Mode', icon: <Droplets size={14} className="text-blue-500" />, state: settings.isDogSoundPackActive, setter: (v: boolean) => setSettings({ isDogSoundPackActive: v }) },
                        { id: 'quotes', label: 'Daily Motivational Audio Quotes', icon: <MessageSquare size={14} className="text-amber-500" />, state: settings.showQuotes, setter: (v: boolean) => setSettings({ showQuotes: v }) },
                      ].map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-[#FAF7F2]/50 border border-[#E9E4D4]/40 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0">{item.icon}</div>
                            <span className="text-[11px] font-black text-[#4F3F34] uppercase tracking-tight leading-none">{item.label}</span>
                          </div>
                          <button 
                            onClick={() => { vibrate(5); item.setter(!item.state); }}
                            className={`w-11 h-6 rounded-full transition-all relative ${item.state ? 'bg-[#69C496]' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${item.state ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === 10. COMMUNITY CATEGORY === */}
              {activeCategory === 'community' && (
                <div className="space-y-6" id="community-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm text-left">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} className="text-amber-500" /> Direct Transmission Feed back
                    </h3>
                    <p className="text-[11px] text-[#4F3F34]/60 leading-normal font-bold">
                      Discovered a glitch, or want to suggest a feature? Submit report payloads directly to Nexora High Command.
                    </p>

                    <div className="space-y-3 pt-2">
                      {/* Rating selection */}
                      <div>
                        <label className="text-[9px] font-black text-[#4F3F34]/40 uppercase tracking-widest block mb-2">Satisfaction Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(num => (
                            <button 
                              key={num}
                              onClick={() => { vibrate(10); setFeedback(prev => ({ ...prev, rating: num })); }}
                              className={`flex-1 py-3.5 rounded-xl font-black text-xs transition-all border ${feedback.rating === num ? 'bg-[#4F3F34] text-[#FCFAF6] border-[#4F3F34] shadow-md' : 'bg-[#FAF7F2] text-[#4F3F34]/40 border-[#E9E4D4]/50'}`}
                            >
                              {num} ★
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-[9px] font-black text-[#4F3F34]/40 uppercase tracking-widest block mb-2">Transmission Category</label>
                        <select 
                          value={feedback.category}
                          onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-[#FAF7F2] border border-[#E9E4D4]/60 rounded-2xl py-3 px-4 font-black text-xs text-[#4F3F34] focus:outline-none focus:ring-2 focus:ring-[#69C496]"
                        >
                          <option>General</option>
                          <option>Bug Report</option>
                          <option>Feature Request</option>
                          <option>UI/UX Design</option>
                          <option>Motivation Sync</option>
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="text-[9px] font-black text-[#4F3F34]/40 uppercase tracking-widest block mb-2">Report Logs</label>
                        <textarea 
                          value={feedback.message}
                          onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="What's on your mind, bro? Write details here..."
                          className="w-full bg-[#FAF7F2] border border-[#E9E4D4]/60 rounded-2xl py-3 px-4 font-bold text-xs text-[#4F3F34] min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#69C496] placeholder-[#4F3F34]/30"
                        />
                      </div>

                      <button 
                        onClick={handleInlineFeedbackSubmit}
                        disabled={!feedback.message.trim()}
                        className="w-full bg-[#69C496] hover:bg-[#58B383] text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-md active:scale-95 transition-all disabled:opacity-40"
                      >
                        TRANSMIT PAYLOAD TO HQ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === 11. PREMIUM CATEGORY === */}
              {activeCategory === 'premium' && (
                <div className="space-y-6" id="premium-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm text-left">
                    <div className="p-5 bg-gradient-to-br from-[#4F3F34] to-[#2E241E] text-[#FCFAF6] rounded-3xl relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 right-0 p-8 bg-amber-500/10 rounded-full blur-2xl" />
                      
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-md">
                          <Sparkles size={22} className="stroke-[2.2] fill-amber-300/30" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black tracking-widest text-[#69C496] uppercase leading-none block">Operative Elite tier</span>
                          <h3 className="text-xl font-black text-[#FCFAF6] mt-1 uppercase">Nexus Pro Membership</h3>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-4 border-t border-white/10 mt-4 text-xs font-bold text-[#FCFAF6]/80">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">✦</span>
                          <span>Architect Mode Layout config keys</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">✦</span>
                          <span>Unconstrained Alien plant growths & biometrics plots</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">✦</span>
                          <span>Infinite customized daily task plans</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">✦</span>
                          <span>Premium sound feedback bundles unlocked</span>
                        </div>
                      </div>
                    </div>

                    {/* Activation entry codes */}
                    <div className="p-4 bg-[#FAF7F2] border border-[#E9E4D4]/50 rounded-2xl space-y-3">
                      <h4 className="text-[10px] font-black text-[#4F3F34]/50 uppercase tracking-widest">Activate Dev Promo Codes</h4>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={proCode}
                          onChange={(e) => setProCode(e.target.value)}
                          placeholder="Type promo key e.g. NEXORA"
                          className="flex-1 bg-white border border-[#E9E4D4] rounded-xl px-4 py-2.5 text-xs font-bold text-[#4F3F34] uppercase focus:outline-none focus:ring-2 focus:ring-[#69C496] placeholder-[#4F3F34]/20"
                        />
                        <button
                          onClick={handleActivateProCode}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shrink-0"
                        >
                          Activate
                        </button>
                      </div>
                      <p className="text-[9px] text-[#4F3F34]/40 font-bold leading-normal">
                        Type 'NEXORA' or 'DEVELOPER' to unlock Pro instantly, or type 'RESET' to return to free tier for sandboxing tests.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* === 12. ABOUT CATEGORY === */}
              {activeCategory === 'about' && (
                <div className="space-y-6" id="about-subpage">
                  <div className="bg-white border border-[#E9E4D4] rounded-[2rem] p-6 space-y-4 shadow-sm text-left">
                    <h3 className="font-black text-[#4F3F34] text-xs uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} className="text-blue-500" /> Nexora Intelligence Protocol
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      <button 
                        onClick={() => { vibrate(10); setShowPrivacyModal(true); }}
                        className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#E9E4D4]/40 text-[#4F3F34] hover:bg-white transition-all group active:scale-95 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <ShieldCheck size={16} className="text-[#69C496]" />
                          <span className="text-xs font-black uppercase tracking-tight">Privacy security Protocol</span>
                        </div>
                        <ChevronLeft size={16} className="rotate-180 text-[#4F3F34]/30 group-hover:text-[#4F3F34]" />
                      </button>

                      <button 
                        onClick={onShowManifesto}
                        className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#E9E4D4]/40 text-[#4F3F34] hover:bg-white transition-all group active:scale-95 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen size={16} className="text-amber-500" />
                          <span className="text-xs font-black uppercase tracking-tight">Nexora Manifesto v1.2</span>
                        </div>
                        <ChevronLeft size={16} className="rotate-180 text-[#4F3F34]/30 group-hover:text-[#4F3F34]" />
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                        Nexora works as an independent, offline-first citizen bio-enhancer. All local assets remain yours to customize.
                      </p>
                    </div>
                  </div>

                  {/* Danger zone inside About */}
                  <div className="bg-white border-2 border-red-100 rounded-[2.5rem] p-6 space-y-4 shadow-sm text-left">
                    <h3 className="font-black text-red-600 text-xs uppercase tracking-widest flex items-center gap-2 pl-1">
                      <AlertCircle size={14} /> Critical Security Danger Zone
                    </h3>

                    <button 
                      onClick={() => { vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT); onLogout(); }}
                      className="w-full py-4.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <LogOut size={16} /> Terminate Active Session
                    </button>

                    <button 
                      onClick={() => { vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT); setShowDeleteConfirm(true); }}
                      className="w-full py-3.5 bg-white border border-red-200 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-95"
                    >
                      <Trash2 size={14} /> Clear all bio-data & erase node
                    </button>
                    
                    <p className="text-[9px] text-red-900/30 font-black text-center uppercase tracking-widest">
                      Warning: termination suspends local background biometrics syncing protocols.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Sub-page Save/Feedback Note */}
            <div className="pt-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E8F5EE] border border-[#D0EFE0] rounded-full text-[9px] font-black text-[#69C496] uppercase tracking-wider">
                <Check size={11} className="stroke-[3.5]" /> Changes Saved instantly at Nexus HQ
              </span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Sub-components
function Crown({ size, className }: { size: number, className?: string }) {
  return <Sparkles size={size} className={className} />;
}
