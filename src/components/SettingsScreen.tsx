import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, LogOut, Bell, Shield, User, Globe, Mail, MessageSquare, 
  Trash2, ChevronLeft, RefreshCw, Smartphone, Zap, Flame, 
  Droplets, Target, Clock, Volume2, Palette, Sparkles, 
  ShieldCheck, BrainCircuit, Info, CreditCard, Check, BookOpen, AlertCircle, Video
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserSettings } from '../types';

interface SettingsScreenProps {
  user: FirebaseUser | null;
  settings: UserSettings;
  setSettings: (s: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  isPro: boolean;
  onBack: () => void;
  onLogout: () => void;
  fcmToken: string | null;
  fcmError: string | null;
  onRetryFCM: () => void;
  onSendTestNotification: () => void;
  onSendMotivation: () => void;
  onSendTestEmail: () => void;
  onClearCache: () => void;
  onExportData: () => void;
  onSubmitFeedback: (f: { rating: number, message: string, category: string }) => void;
  onShowManifesto: () => void;
  showToast: (m: string, t?: 'success' | 'info' | 'error') => void;
  sendNotification: (title: string, body: string) => void;
}

export function SettingsScreen({ 
  user, settings, setSettings, isPro, onBack, onLogout, 
  fcmToken, fcmError, onRetryFCM, onSendTestNotification, 
  onSendMotivation, onSendTestEmail, onClearCache, onExportData,
  onSubmitFeedback, onShowManifesto, showToast, sendNotification 
}: SettingsScreenProps) {
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);
  const [feedback, setFeedback] = React.useState({ rating: 5, message: '', category: 'General' });
  
  const COLORS = [
    { name: 'Classic Blue', value: '#3b82f6' },
    { name: 'Sunset Orange', value: '#f97316' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Rose', value: '#f43f5e' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-2xl mx-auto w-full space-y-8 pb-40"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-blue-900 active:scale-95 transition-all">
           <ChevronLeft size={24} />
        </button>
        <div>
           <h2 className="text-3xl font-black text-blue-900 tracking-tight">System Settings</h2>
           <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Global Control Center</p>
        </div>
      </div>

      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden"
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
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-transform"
              >
                DISMISS PROTOCOL
              </button>
            </motion.div>
          </div>
        )}

        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-600" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-blue-900 leading-tight">Sync Feedback</h3>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Direct Link to HQ</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-2 px-1">Satisfaction Level</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num}
                        onClick={() => setFeedback(prev => ({ ...prev, rating: num }))}
                        className={`flex-1 py-3 rounded-xl font-black transition-all ${feedback.rating === num ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-blue-50 text-blue-900/40'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-2 px-1">Data Category</label>
                  <select 
                    value={feedback.category}
                    onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-blue-50 border-none rounded-xl py-3 px-4 font-bold text-blue-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>General</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>UI/UX Design</option>
                    <option>Motivation Sync</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-2 px-1">Detailed Log</label>
                  <textarea 
                    value={feedback.message}
                    onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us what's on your mind, bro..."
                    className="w-full bg-blue-50 border-none rounded-2xl py-3 px-4 font-bold text-blue-900 min-h-[120px] focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black shadow-sm active:scale-95 transition-transform"
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => {
                    onSubmitFeedback(feedback);
                    setShowFeedbackModal(false);
                    setFeedback({ rating: 5, message: '', category: 'General' });
                  }}
                  disabled={!feedback.message.trim()}
                  className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-transform disabled:opacity-50"
                >
                  TRANSMIT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {/* Account Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <User size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">Account & Identity</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <div className="flex items-center gap-3">
                 <div className="w-14 h-14 rounded-full bg-white overflow-hidden shadow-inner border-2 border-white">
                    {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center text-blue-400 font-bold">U</div>}
                 </div>
                 <div>
                    <input 
                      type="text" 
                      value={settings.displayName || ''} 
                      onChange={(e) => setSettings({ displayName: e.target.value })}
                      placeholder={user?.displayName || 'Nexora User'}
                      className="font-black text-blue-900 bg-transparent border-none p-0 focus:ring-0 w-full text-lg leading-none"
                    />
                    <p className="text-[10px] text-blue-900/40 font-bold uppercase mt-1">{user?.email}</p>
                 </div>
              </div>
              <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${isPro ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-gray-100 text-gray-400'}`}>
                {isPro ? <><Crown size={10} /> Nexus Pro</> : 'Free Tier'}
              </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Target size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">Performance Goals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest px-2 flex items-center gap-2">
                <Flame size={12} className="text-orange-500" /> Pushups Target
              </label>
              <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                 <button onClick={() => setSettings({ pushupsGoal: Math.max(1, (settings.pushupsGoal || 0) - 1) })} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-blue-600 font-black">-</button>
                 <span className="flex-1 text-center font-black text-blue-900">{settings.pushupsGoal}</span>
                 <button onClick={() => setSettings({ pushupsGoal: (settings.pushupsGoal || 0) + 1 })} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-blue-600 font-black">+</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest px-2 flex items-center gap-2">
                <Droplets size={12} className="text-blue-500" /> Water Goal (Liters)
              </label>
              <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                 <button onClick={() => setSettings({ waterGoal: Math.max(1, (settings.waterGoal || 0) - 1) })} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-blue-600 font-black">-</button>
                 <span className="flex-1 text-center font-black text-blue-900">{settings.waterGoal}L</span>
                 <button onClick={() => setSettings({ waterGoal: (settings.waterGoal || 0) + 1 })} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-blue-600 font-black">+</button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest px-2">Daily Challenge Target</label>
              <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                 <button onClick={() => setSettings({ challengeCountGoal: Math.max(1, (settings.challengeCountGoal || 0) - 1) })} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-blue-600 font-black">-</button>
                 <span className="flex-1 text-center font-black text-blue-900">{settings.challengeCountGoal} Stages Per Day</span>
                 <button onClick={() => setSettings({ challengeCountGoal: (settings.challengeCountGoal || 0) + 1 })} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-blue-600 font-black">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Timing */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">Cron & Schedule</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
               <div>
                 <p className="font-bold text-blue-900 text-sm">Morning Routine Trigger</p>
                 <p className="text-[10px] text-blue-900/40 font-medium tracking-tight">Main daily reset alert</p>
               </div>
               <input 
                type="time" 
                value={settings.reminderTime} 
                onChange={(e) => setSettings({ reminderTime: e.target.value })}
                className="bg-white px-4 py-2 rounded-xl text-blue-900 font-black text-sm border-2 border-blue-100 shadow-sm focus:ring-0 focus:border-blue-300"
               />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
               <div>
                 <p className="font-bold text-blue-900 text-sm">Evening Checkpoint</p>
                 <p className="text-[10px] text-blue-900/40 font-medium tracking-tight">End of day sync alert</p>
               </div>
               <input 
                type="time" 
                value={settings.reminderTime2 || '21:00'} 
                onChange={(e) => setSettings({ reminderTime2: e.target.value })}
                className="bg-white px-4 py-2 rounded-xl text-blue-900 font-black text-sm border-2 border-blue-100 shadow-sm focus:ring-0 focus:border-blue-300"
               />
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
               <div>
                 <p className="font-black text-orange-600 text-sm">Peak Motivation Blast</p>
                 <p className="text-[10px] text-orange-900/40 font-medium tracking-tight">AI-powered energy spike</p>
               </div>
               <input 
                type="time" 
                value={settings.motivationTime || '12:00'} 
                onChange={(e) => setSettings({ motivationTime: e.target.value })}
                className="bg-white px-4 py-2 rounded-xl text-orange-600 font-black text-sm border-2 border-orange-100 shadow-sm focus:ring-0 focus:border-orange-300"
               />
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Palette size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">User Experience</h3>
          </div>

          <div className="space-y-6">
            {/* Theme Colors */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Interface Frequency (Theme)</p>
              <div className="flex gap-4">
                {COLORS.map(color => (
                  <button 
                    key={color.value}
                    onClick={() => setSettings({ themeColor: color.value })}
                    className={`w-10 h-10 rounded-full border-4 shadow-sm transition-all relative ${settings.themeColor === color.value ? 'scale-125 border-blue-200' : 'border-white hover:scale-110'}`}
                    style={{ backgroundColor: color.value }}
                  >
                    {settings.themeColor === color.value && <div className="absolute inset-0 flex items-center justify-center text-white"><Check size={16} /></div>}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'zen', label: 'Zen Mode (Background Lofi)', icon: <Sparkles size={14} />, state: settings.zenModeEnabled, setter: (v: boolean) => setSettings({ zenModeEnabled: v }) },
                { id: 'quotes', label: 'Enable Daily Motivation Quotes', icon: <MessageSquare size={14} />, state: settings.showQuotes, setter: (v: boolean) => setSettings({ showQuotes: v }) },
                { id: 'sounds', label: 'Audio Feedback (SFX)', icon: <Volume2 size={14} />, state: settings.soundEnabled, setter: (v: boolean) => setSettings({ soundEnabled: v }) },
                { id: 'dog-pack', label: 'Mascot Audio: Dog Mode', icon: <Droplets size={14} />, state: settings.isDogSoundPackActive, setter: (v: boolean) => setSettings({ isDogSoundPackActive: v }) },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100/20">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-500">{item.icon}</div>
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-tight">{item.label}</span>
                  </div>
                  <button 
                    onClick={() => item.setter(!item.state)}
                    className={`w-11 h-6 rounded-full transition-all relative ${item.state ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${item.state ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications Advanced */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">Precision Notifications</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 border-2 border-blue-400">
               <div>
                 <p className="font-black text-sm uppercase">Global Push State</p>
                 <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest">Master Switch</p>
               </div>
               <button 
                  onClick={() => setSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.notificationsEnabled ? 'bg-white/20' : 'bg-black/20'}`}
               >
                  <div className={`absolute top-1.5 w-5 h-5 rounded-full bg-white transition-all ${settings.notificationsEnabled ? 'left-7.5' : 'left-1.5'}`} />
               </button>
            </div>

            {settings.notificationsEnabled && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 gap-2 pt-2"
              >
                {[
                  { id: 'trophy', label: 'Trophy Alerts', state: settings.badgeSettings?.trophyAlerts, setter: (v: boolean) => setSettings(prev => ({ ...prev, badgeSettings: { ...prev.badgeSettings!, trophyAlerts: v } })) },
                  { id: 'challenge', label: 'Daily Challenge Reminders', state: settings.badgeSettings?.dailyChallenge, setter: (v: boolean) => setSettings(prev => ({ ...prev, badgeSettings: { ...prev.badgeSettings!, dailyChallenge: v } })) },
                  { id: 'quest', label: 'New Quest Alerts', state: settings.badgeSettings?.dailyQuest, setter: (v: boolean) => setSettings(prev => ({ ...prev, badgeSettings: { ...prev.badgeSettings!, dailyQuest: v } })) },
                  { id: 'urgency', label: 'Dynamic Urgency (Pester Mode)', state: settings.badgeSettings?.dynamicUrgency, setter: (v: boolean) => setSettings(prev => ({ ...prev, badgeSettings: { ...prev.badgeSettings!, dynamicUrgency: v } })) },
                ].map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 px-4 bg-white rounded-xl border border-blue-50 text-blue-900">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{b.label}</span>
                    <button 
                      onClick={() => b.setter(!b.state)}
                      className={`w-9 h-5 rounded-full transition-all relative ${b.state ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${b.state ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="flex items-center justify-between p-4 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-100 border-2 border-orange-400 mt-3 hover:translate-y-[-2px] transition-all cursor-pointer" onClick={() => setSettings({ isReelsDisabled: !settings.isReelsDisabled })}>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Video size={18} />
                 </div>
                 <div>
                   <p className="font-black text-sm uppercase">Nexora Reels Relay</p>
                   <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest">Main Media Feed Control</p>
                 </div>
               </div>
               <div 
                  className={`w-12 h-7 rounded-full transition-all relative ${!settings.isReelsDisabled ? 'bg-white' : 'bg-black/20'}`}
               >
                  <div className={`absolute top-1 w-5 h-5 rounded-full transition-all ${!settings.isReelsDisabled ? 'left-6 bg-orange-600' : 'left-1 bg-white/40'}`} />
               </div>
            </div>

            {fcmError && (
              <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center justify-between mt-4">
                 <div className="flex items-center gap-3">
                    <div className="bg-red-500 p-2 rounded-xl text-white">
                       <AlertCircleStatus size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-red-600 font-black uppercase mb-1">Frequency Sync Error</p>
                      <p className="text-[10px] text-red-900/60 font-medium">Worker thread disconnected, bro.</p>
                    </div>
                 </div>
                 <button onClick={onRetryFCM} className="p-2 bg-white text-red-500 rounded-full shadow-sm hover:rotate-180 transition-transform duration-500">
                   <RefreshCw size={16} />
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Units & Region */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Globe size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">Region & Units</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
             <div>
               <p className="font-bold text-blue-900 text-sm">Measurement System</p>
               <p className="text-[10px] text-blue-900/40 font-medium tracking-tight">Metric / Imperial toggle</p>
             </div>
             <div className="flex bg-white p-1 rounded-xl shadow-sm border border-blue-100">
                <button 
                  onClick={() => setSettings({ unitSystem: 'metric' })}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${settings.unitSystem === 'metric' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-blue-900/40'}`}
                >Metric</button>
                <button 
                  onClick={() => setSettings({ unitSystem: 'imperial' })}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${settings.unitSystem === 'imperial' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-blue-900/40'}`}
                >Imperial</button>
             </div>
          </div>
        </div>

        {/* Support & Dev Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">Nexus Lab Tools</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <button onClick={onSendTestNotification} className="p-4 bg-white border border-blue-100 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all flex flex-col items-center gap-2 active:scale-95">
                <Smartphone size={16} /> Notification Test
             </button>
             <button onClick={onSendMotivation} className="p-4 bg-white border border-orange-100 rounded-2xl text-[10px] font-black text-orange-600 uppercase tracking-widest hover:bg-orange-50 transition-all flex flex-col items-center gap-2 active:scale-95">
                <Zap size={16} /> AI Motivation
             </button>
             <button onClick={onExportData} className="p-4 bg-white border border-indigo-100 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-all flex flex-col items-center gap-2 active:scale-95">
                <Mail size={16} /> Data Export
             </button>
             <button onClick={onClearCache} className="p-4 bg-white border border-neutral-100 rounded-2xl text-[10px] font-black text-neutral-600 uppercase tracking-widest hover:bg-neutral-50 transition-all flex flex-col items-center gap-2 active:scale-95">
                <RefreshCw size={16} /> Clear Static
             </button>
          </div>
        </div>

        {/* Information Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Info size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-[10px] tracking-widest">Nexora Intelligence</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => setShowPrivacyModal(true)}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-50 text-blue-900 hover:bg-blue-50 transition-all group active:scale-95"
            >
               <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-tight">Privacy Protocol</span>
               </div>
               <ChevronLeft size={16} className="rotate-180 opacity-20 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-50 text-blue-900 hover:bg-blue-50 transition-all group active:scale-95"
            >
               <div className="flex items-center gap-3">
                  <BookOpen size={16} className="text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-tight">Terms of Engagement & Feedback</span>
               </div>
               <ChevronLeft size={16} className="rotate-180 opacity-20 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={onShowManifesto}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-50 text-blue-900 hover:bg-blue-50 transition-all group active:scale-95"
            >
               <div className="flex items-center gap-3">
                  <RefreshCw size={16} className="text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-tight">Nexora Manifesto v1.2</span>
               </div>
               <ChevronLeft size={16} className="rotate-180 opacity-20 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card p-6 border-2 border-red-50">
           <button 
             onClick={onLogout}
             className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
           >
             <LogOut size={18} /> Execute Logout Sequence
           </button>
           
           <p className="text-[9px] text-red-900/20 font-black text-center mt-6 uppercase tracking-widest">Warning: Session termination will pause background syncing</p>
        </div>

        <div className="text-center space-y-3 pt-6">
           <div className="flex justify-center gap-2">
             <div className="px-3 py-1 bg-blue-50 rounded-full text-[8px] font-black text-blue-400 uppercase tracking-widest border border-blue-100">Alpha v1.2.0-Alpha</div>
             <div className="px-3 py-1 bg-green-50 rounded-full text-[8px] font-black text-green-500 uppercase tracking-widest border border-green-100">Secure Protocol</div>
           </div>
           <p className="text-[10px] text-blue-500/40 font-bold italic">"Consistency creates gods, bro. Don't stop now."</p>
           
           <div className="flex justify-center gap-6 pt-4 grayscale opacity-20">
              <ShieldCheck size={16} />
              <Zap size={16} />
              <Droplets size={16} />
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// Sub-components used in badges
function Crown({ size, className }: { size: number, className?: string }) {
  return <Sparkles size={size} className={className} />;
}

function AlertCircleStatus({ size, className }: { size: number, className?: string }) {
  return <Shield size={size} className={className} />;
}

