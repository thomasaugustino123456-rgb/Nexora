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
  Trophy as TrophyIcon,
  Star,
  Target,
  MessageSquare,
  BoxSelect,
  Plus,
  Save,
  Sparkles,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import { UserSettings } from '../types';

interface ArchitectLabProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onClose: () => void;
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

const HOME_SECTIONS = [
  { id: 'stats', label: 'Statistics Bar', icon: BarChart2, configKey: 'hideStats' },
  { id: 'protocol', label: 'Daily Protocol Card', icon: Zap, configKey: 'hideFlow' }, // 'hideFlow' maps to the protocol/checklist area
  { id: 'quests', label: 'Daily Quests', icon: Star, configKey: 'hideQuests' },
  { id: 'plans', label: 'Custom Protocols', icon: Layout, configKey: 'hideCustomPlans' },
  { id: 'trophies', label: 'Trophy Display', icon: TrophyIcon, configKey: 'hideTrophies' },
  { id: 'mascot', label: 'Nexora Mascot', icon: Smartphone, configKey: 'hideMascot' }, // Adding a hypothetical hideMascot
];

const PREMIUM_THEMES = [
  { id: 'standard', label: 'Classic Nexora', color: 'bg-blue-600', textColor: 'text-white' },
  { id: 'oceanic_midnight', label: 'Oceanic Midnight', color: 'bg-gradient-to-r from-cyan-500 to-blue-600', textColor: 'text-cyan-400' },
  { id: 'neural_bio', label: 'Neural Bio-Link', color: 'bg-emerald-600', textColor: 'text-white' },
  { id: 'obsidian', label: 'Obsidian Void', color: 'bg-slate-950', textColor: 'text-blue-400' },
  { id: 'sunset', label: 'Retention Sand (Organic & Warm)', color: 'bg-gradient-to-r from-[#FCFAF6] via-[#FAF7F2] to-[#E9E4D4]', textColor: 'text-[#4F3F34]' },
];

export function ArchitectLab({ settings, onUpdateSettings, onClose }: ArchitectLabProps) {
  const currentOrder = settings.navOrder || NAV_ITEMS.map(i => i.id);
  const hiddenItems = settings.hiddenNavItems || [];
  
  const sectionOrder = settings.layoutConfig?.sectionOrder || HOME_SECTIONS.map(s => s.id);
  const layoutConfig = settings.layoutConfig || {};

  const activeTheme = settings.activeSkin || 'standard';

  const handleReorder = (newOrder: string[]) => {
    onUpdateSettings({ navOrder: newOrder });
  };

  const handleSectionReorder = (newOrder: string[]) => {
    onUpdateSettings({ 
      layoutConfig: { 
        ...layoutConfig, 
        sectionOrder: newOrder 
      } 
    });
  };

  const toggleVisibility = (id: string) => {
    if (id === 'home' || id === 'profile') return;
    const newHidden = hiddenItems.includes(id)
      ? hiddenItems.filter(i => i !== id)
      : [...hiddenItems, id];
    onUpdateSettings({ hiddenNavItems: newHidden });
  };

  const toggleSectionVisibility = (configKey: string) => {
    onUpdateSettings({
      layoutConfig: {
        ...layoutConfig,
        [configKey]: !((layoutConfig as any)[configKey])
      }
    });
  };

  return (
    <div className="flex flex-col space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <Layout size={24} />
          </div>
          <div>
            <h3 className="font-black text-2xl text-blue-900 tracking-tight">ARCHITECT LAB</h3>
            <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em]">Personalize your Neuro-Interface</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/50 hover:bg-white rounded-2xl text-blue-600 transition-colors shadow-lg shadow-blue-100"
        >
          <X size={24} />
        </button>
      </div>

      {/* Theme Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-blue-900/40 uppercase tracking-[0.2em]">Neural Interface Skins</h4>
          <span className="text-[10px] font-bold text-blue-400">PRO FEATURE</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PREMIUM_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onUpdateSettings({ activeSkin: theme.id })}
              className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                activeTheme === theme.id 
                  ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' 
                  : 'border-white bg-white hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-8 h-8 rounded-lg ${theme.color} shadow-lg`} />
                <div>
                  <span className="font-black text-blue-900 text-xs block">{theme.label}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${activeTheme === theme.id ? 'text-blue-500' : 'text-slate-400'}`}>
                    {activeTheme === theme.id ? 'Active Skin' : 'Neural Core'}
                  </span>
                </div>
              </div>
              {activeTheme === theme.id && (
                <div className="absolute top-0 right-0 p-2">
                  <CheckCircle2 size={14} className="text-blue-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-blue-900/40 uppercase tracking-[0.2em]">Navigation Interface</h4>
          <span className="text-[10px] font-bold text-blue-400">DRAG TO ARRANGE</span>
        </div>
        
        <Reorder.Group axis="y" values={currentOrder} onReorder={handleReorder} className="space-y-2">
          {currentOrder.map((id) => {
            const item = NAV_ITEMS.find(n => n.id === id);
            if (!item) return null;
            const isHidden = hiddenItems.includes(id);
            const canHide = id !== 'home' && id !== 'profile';

            return (
              <Reorder.Item 
                key={id} 
                value={id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing ${
                  isHidden ? 'bg-slate-50 border-slate-100 opacity-50' : 'bg-white border-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <GripVertical size={16} className="text-slate-300" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHidden ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white'}`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <span className="font-black text-blue-900">{item.label}</span>
                    <p className="text-[9px] font-bold text-blue-900/30 uppercase">{id === 'social' ? 'Hidden by System' : isHidden ? 'Hidden from Bar' : 'Active Channel'}</p>
                  </div>
                </div>
                {canHide && id !== 'social' && (
                  <button onClick={() => toggleVisibility(id)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    {isHidden ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-blue-500" />}
                  </button>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      {/* Home Screen Layout Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-blue-900/40 uppercase tracking-[0.2em]">Home Grid Composition</h4>
          <span className="text-[10px] font-bold text-blue-400">DRAG TO ARRANGE</span>
        </div>

        <Reorder.Group axis="y" values={sectionOrder} onReorder={handleSectionReorder} className="space-y-2">
          {sectionOrder.map((id) => {
            const section = HOME_SECTIONS.find(s => s.id === id);
            if (!section) return null;
            const isHidden = (layoutConfig as any)[section.configKey];

            return (
              <Reorder.Item 
                key={id} 
                value={id}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing ${
                  isHidden ? 'bg-slate-50 border-slate-100 opacity-50' : 'bg-white border-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <GripVertical size={16} className="text-slate-300" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHidden ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white'}`}>
                    <section.icon size={18} />
                  </div>
                  <div>
                    <span className="font-black text-blue-900">{section.label}</span>
                    <p className="text-[9px] font-bold text-blue-900/30 uppercase">{isHidden ? 'Deactivated' : 'Active Module'}</p>
                  </div>
                </div>
                <button onClick={() => toggleSectionVisibility(section.configKey)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  {isHidden ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-emerald-500" />}
                </button>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <MousePointer2 size={24} />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-tight mb-1">Architectural Integrity</h4>
            <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-widest">
              Design is not just what it looks like. Design is how it works. Your custom layout is automatically synced and persistent across all sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
