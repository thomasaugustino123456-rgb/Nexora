import React from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Bell, Shield, User, Globe, Mail, MessageSquare, Trash2, ChevronLeft, RefreshCw, Smartphone, Zap } from 'lucide-react';
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
  showToast: (m: string, t?: 'success' | 'info' | 'error') => void;
  sendNotification: (title: string, body: string) => void;
}

export function SettingsScreen({ 
  user, settings, setSettings, isPro, onBack, onLogout, 
  fcmToken, fcmError, onRetryFCM, onSendTestNotification, 
  onSendMotivation, onSendTestEmail, showToast, sendNotification 
}: SettingsScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-2xl mx-auto w-full space-y-8 pb-32"
    >
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-blue-900">
           <ChevronLeft size={24} />
        </button>
        <div>
           <h2 className="text-3xl font-black text-blue-900 tracking-tight">Settings</h2>
           <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Global Control Center</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <User size={18} className="text-blue-500" />
            <h3 className="font-black text-blue-900 uppercase text-xs tracking-widest">Account & Profile</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl overflow-hidden border border-blue-100">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-white overflow-hidden shadow-sm">
                    {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center text-blue-400 font-bold">U</div>}
                 </div>
                 <div>
                    <p className="font-black text-blue-900">{settings.displayName || user?.displayName || 'Nexora User'}</p>
                    <p className="text-[10px] text-blue-900/40 font-bold uppercase">{user?.email}</p>
                 </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isPro ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-gray-100 text-gray-400'}`}>
                {isPro ? 'Nexus Pro' : 'Free Tier'}
              </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
           <div className="flex items-center gap-3">
              <Bell size={18} className="text-blue-500" />
              <h3 className="font-black text-blue-900 uppercase text-xs tracking-widest">Communications</h3>
           </div>

           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900 text-sm">Push Notifications</p>
                  <p className="text-[10px] text-blue-900/40 font-medium italic">Get daily reminders & alerts</p>
                </div>
                <button 
                  onClick={() => setSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notificationsEnabled ? 'left-7' : 'left-1'}`} />
                </button>
             </div>

             {fcmError && (
               <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-red-600 font-black uppercase mb-1">Worker Setup Needed</p>
                    <p className="text-[10px] text-red-900/60 font-medium">Notifications aren't fully registered, bro.</p>
                  </div>
                  <button onClick={onRetryFCM} className="p-2 bg-white text-red-500 rounded-full shadow-sm">
                    <RefreshCw size={16} />
                  </button>
               </div>
             )}
           </div>
        </div>

        <div className="glass-card p-6">
           <button 
             onClick={onLogout}
             className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
           >
             <LogOut size={18} /> Logout Strategy
           </button>
        </div>

        <div className="text-center space-y-2">
           <p className="text-[10px] font-black text-blue-900/20 uppercase tracking-[0.3em]">Nexora Nexus v1.2.0-Alpha</p>
           <p className="text-[10px] text-blue-500/40 font-bold italic">"Efficiency through optimization, bro."</p>
        </div>
      </div>
    </motion.div>
  );
}
