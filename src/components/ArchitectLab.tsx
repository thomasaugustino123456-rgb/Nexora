import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Settings, 
  Home, 
  Zap, 
  BarChart2, 
  Package, 
  Eye, 
  EyeOff, 
  GripVertical,
  MousePointer2,
  Lock,
  Layout,
  Smartphone,
  Trophy as TrophyIcon
} from 'lucide-react';
import { UserSettings } from '../types';

interface ArchitectLabProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'social', label: 'Nexora', icon: Zap },
  { id: 'progress', label: 'Stats', icon: BarChart2 },
  { id: 'shop', label: 'Shop', icon: Package },
  { id: 'library', label: 'Library', icon: Package },
  { id: 'notebook', label: 'Notebook', icon: Smartphone },
  { id: 'leaderboard', label: 'Rank', icon: TrophyIcon },
  { id: 'profile', label: 'Profile', icon: Settings },
];

export function ArchitectLab({ settings, onUpdateSettings }: ArchitectLabProps) {
  const currentOrder = settings.navOrder || NAV_ITEMS.map(i => i.id);
  const hiddenItems = settings.hiddenNavItems || [];

  const handleReorder = (newOrder: string[]) => {
    onUpdateSettings({ navOrder: newOrder });
  };

  const toggleVisibility = (id: string) => {
    if (id === 'home' || id === 'profile') return; // Cannot hide core pages
    
    const newHidden = hiddenItems.includes(id)
      ? hiddenItems.filter(i => i !== id)
      : [...hiddenItems, id];
    
    onUpdateSettings({ hiddenNavItems: newHidden });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
          <Layout size={20} />
        </div>
        <div>
          <h3 className="font-black text-blue-900 leading-tight">UI Architect Lab</h3>
          <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Personalize your Command Center</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-bottom-dashed border-blue-100">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-blue-500" />
            <span className="text-xs font-black text-blue-900">NAVIGATION BAR</span>
          </div>
          <span className="text-[10px] font-bold text-blue-900/30">DRAG TO REORDER</span>
        </div>

        <Reorder.Group axis="y" values={currentOrder} onReorder={handleReorder} className="space-y-3">
          {currentOrder.map((id) => {
            const item = NAV_ITEMS.find(n => n.id === id);
            if (!item) return null;
            const isHidden = hiddenItems.includes(id);
            const canHide = id !== 'home' && id !== 'profile';

            return (
              <Reorder.Item 
                key={id} 
                value={id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                  isHidden ? 'bg-blue-50/50 opacity-60 border-blue-100' : 'bg-white border-blue-50 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="cursor-grab active:cursor-grabbing text-blue-200 group-hover:text-blue-400 transition-colors">
                    <GripVertical size={16} />
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                    isHidden ? 'bg-blue-100 text-blue-300' : 'bg-blue-500 text-white shadow-blue-200'
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-blue-900">{item.label}</p>
                    <p className="text-[10px] font-bold text-blue-900/40 uppercase">
                      {isHidden ? 'Hidden from Bar' : 'Active Navigation'}
                    </p>
                  </div>
                </div>

                {canHide ? (
                  <button
                    onClick={() => toggleVisibility(id)}
                    className={`p-2 rounded-lg transition-all ${
                      isHidden ? 'text-blue-400 hover:bg-blue-100' : 'text-blue-200 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                ) : (
                  <div className="p-2 text-blue-100">
                    <Lock size={16} />
                  </div>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100/50">
          <div className="flex gap-3">
            <MousePointer2 className="text-amber-500 flex-shrink-0" size={16} />
            <p className="text-[10px] font-bold text-amber-700 leading-none">
              <span className="block mb-1 text-xs">ARCHITECT TIP:</span>
              Clean layouts foster focus. Hide sections you don't use daily to reduce your cognitive load.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-blue-500" />
          <span className="text-xs font-black text-blue-900">CHALLENGE ARCHIVE</span>
        </div>
        <p className="text-[10px] font-bold text-blue-900/50 uppercase leading-relaxed mb-4">
          Pro users can filter official apps challenges. Archived challenges won't show up in your daily flow.
        </p>
        
        <button className="btn-primary w-full py-3 text-xs opacity-50 cursor-not-allowed">
          Manage Archived Challenges (Manual Skip Enabled)
        </button>
      </div>
    </div>
  );
}
