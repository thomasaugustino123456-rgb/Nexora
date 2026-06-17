import React, { useState } from 'react';
import { Compass, Bell, Search, Plus, Users, Target, User, ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import { SocialCircle, Post, Screen, UserSettings, UserStats } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface SocialScreenProps {
  onBack: () => void;
  user: FirebaseUser | null;
  settings: UserSettings;
  stats: UserStats;
  showToast: (m: string, t?: 'success' | 'info' | 'error') => void;
  posts: Post[];
  circles: SocialCircle[];
  setActiveScreen: (s: Screen) => void;
}

export function SocialScreen({ onBack, user, settings, stats, showToast, posts, circles, setActiveScreen }: SocialScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community</h1>
            <p className="text-slate-500 text-sm">Connect, share and grow together.</p>
        </div>
        <button className="p-3 bg-white border border-slate-100 rounded-3xl shadow-sm relative">
            <Bell size={20} className="text-slate-700" />
            <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
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
            <button className="absolute right-2 top-2 p-3 bg-slate-100 rounded-2xl">
                <div className="w-5 h-5 border-2 border-slate-400 rounded-md"></div>
            </button>
        </div>
      </div>

      {/* Categories */}
      <section className="px-6 py-4">
         <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-black text-slate-900">Categories</h2>
             <button className="text-indigo-600 font-bold text-sm">See all</button>
         </div>
         <div className="grid grid-cols-6 gap-2">
            {[ {name: 'Fitness', icon: '🏋️'}, {name: 'Productivity', icon: '✅'}, {name: 'Art', icon: '🎨'}, {name: 'Mindset', icon: '🧠'}, {name: 'Health', icon: '💧'}, {name: 'Learning', icon: '📚'} ].map(cat => (
                <div key={cat.name} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">{cat.icon}</div>
                    <span className="text-[9px] font-bold text-slate-700">{cat.name}</span>
                </div>
            ))}
         </div>
      </section>

      {/* Popular Groups */}
      <section className="px-6 py-4">
         <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-black text-slate-900">Popular Groups</h2>
             <button className="text-indigo-600 font-bold text-sm">See all</button>
         </div>
         <div className="flex gap-4 overflow-x-auto pb-4">
            {circles.slice(0, 3).map(circle => (
                <div key={circle.id} className="min-w-[180px] bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <div className="text-3xl">{circle.icon || '🏮'}</div>
                    <h3 className="font-black text-slate-900 text-sm">{circle.name}</h3>
                    <p className="text-[10px] text-slate-400">{circle.memberCount} members</p>
                    <button className="w-full py-2 bg-emerald-500/10 text-emerald-600 font-black text-xs rounded-xl">Join</button>
                </div>
            ))}
         </div>
      </section>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex items-center justify-around z-50">
        <button onClick={() => setActiveScreen('home')} className="flex flex-col items-center gap-1">
            <Compass size={24} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">Home</span>
        </button>
        <button onClick={() => setActiveScreen('challenge')} className="flex flex-col items-center gap-1">
            <Target size={24} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">Challenges</span>
        </button>
        <button className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 -mt-8">
            <Plus size={32} />
        </button>
        <button className="flex flex-col items-center gap-1">
            <Users size={24} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600">Community</span>
        </button>
        <button onClick={() => setActiveScreen('profile')} className="flex flex-col items-center gap-1">
            <User size={24} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">Profile</span>
        </button>
      </nav>
    
    </div>
  );
}
