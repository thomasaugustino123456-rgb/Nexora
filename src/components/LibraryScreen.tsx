import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Video, Trash2, CheckCircle2, Play, Pause,
  Palette, StickyNote, Zap, Heart, Disc, Eye, Sparkles, AlertCircle,
  ChevronRight
} from 'lucide-react';
import { LibraryItem, UserStats, UserSettings, NexusVideo } from '../types';

interface LibraryScreenProps {
  items: LibraryItem[];
  stats: UserStats;
  settings: UserSettings;
  savedVideos: NexusVideo[];
  onPlayVideo: (v: NexusVideo) => void;
  onDeleteVideo: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDeleteDrawing: (index: number) => void;
  onDeleteChallenge: (id: string) => void;
  onBack: () => void;
  onPlayChallenge: (cid: string) => void;
}

type Tab = 'inventory' | 'media' | 'creative' | 'archive';

export function LibraryScreen({
  items,
  stats,
  settings,
  savedVideos,
  onPlayVideo,
  onDeleteVideo,
  onActivate,
  onDeactivate,
  onDelete,
  onDeleteNote,
  onDeleteDrawing,
  onDeleteChallenge,
  onPlayChallenge,
  onBack
}: LibraryScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');

  const tabs = [
    { id: 'inventory', label: 'Vault', icon: Package, desc: 'Cosmetic Skins & Music' },
    { id: 'media', label: 'Media', icon: Video, desc: 'Nexus Recorded Reels' },
    { id: 'creative', label: 'Sketches', icon: Palette, desc: 'Neural Canvas Artworks' },
    { id: 'archive', label: 'Protocols', icon: StickyNote, desc: 'Gratitude & Replay Pins' },
  ];

  // Helper to determine if an item is currently playing
  const isPlayingMusic = (item: LibraryItem) => {
    return item.type === 'music' && item.activated;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F3F7FA] via-white to-white pb-36 overflow-x-hidden w-full">
      {/* 1. Sticky Premium Header - Styled exactly like the Rank section's leaderboard bar */}
      <div className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
        <button 
          onClick={onBack} 
          className="p-3 bg-slate-50 border border-slate-100 shadow-sm rounded-2xl text-blue-900/60 hover:text-blue-900 hover:bg-slate-100 active:scale-95 transition-all text-[12px] font-black uppercase tracking-wider flex items-center gap-1"
        >
          <ChevronRight className="rotate-180" size={16} /> BACK
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] animate-pulse">Your Treasury</p>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Vault System</h2>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
          <Package size={18} className="text-blue-600" />
        </div>
      </div>

      <div className="px-4 md:px-6 mt-4">
        {/* 2. Flat High-Prestige Description Card */}
        <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-[2rem] p-5 shadow-sm flex items-start gap-4 mb-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 mt-0.5 flex-shrink-0 animate-bounce">
            <Sparkles size={16} className="text-indigo-600 fill-indigo-100" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Nexus Asset Treasury</h3>
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
              Toggle purchased custom songs, equip exclusive skins for your mascot, replay pinned step guidelines, and admire your sketches dynamically.
            </p>
          </div>
        </div>

        {/* 3. Horizontal Bento Tabs - Elegant flat continuous layout */}
        <div className="max-w-2xl mx-auto flex gap-2.5 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left flex-shrink-0 min-w-[125px] sm:min-w-[145px] hover:scale-[1.02] active:scale-[0.98] ${
                  isActive 
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full block ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 max-w-2xl mx-auto space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Stored Items</span>
                <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">{items.length} Unlocked</span>
              </div>
              
              {items.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <Package size={28} />
                  </div>
                  <h4 className="text-slate-800 font-black uppercase text-xs">Treasury is Empty</h4>
                  <p className="text-slate-400 text-[11px] max-w-xs leading-relaxed">
                    Check out the Shop tab to buy awesome skins for your mascot, unlock background music tracks, and claim sound packs!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white border border-slate-150 rounded-[2rem] p-4 shadow-sm">
                  {items.map(item => {
                    const isMusic = item.type === 'music';
                    const isSkin = item.type === 'skin';
                    const isSoundPack = item.type === 'sound-pack';
                    const active = item.activated;

                    return (
                      <div key={item.id} className="flex items-center gap-4 py-3.5 first:pt-1 last:pb-1">
                        {/* Interactive Avatar Container */}
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border transition-all ${
                            active 
                              ? 'bg-blue-550 border-blue-400 text-white ring-2 ring-blue-105' 
                              : 'bg-slate-50 border-slate-100'
                          }`}>
                            {item.icon}
                          </div>
                          {active && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                          )}
                        </div>

                        {/* Text Information & Status Label */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wide truncate">{item.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-100 border border-slate-150 px-2 py-0.5 rounded">
                              {item.type}
                            </span>
                            {isMusic && (
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                                active 
                                  ? 'bg-emerald-50 text-emerald-600 animate-pulse' 
                                  : 'bg-slate-100 text-slate-400'
                              }`}>
                                <Disc size={8} className={active ? 'animate-spin' : ''} />
                                {active ? 'Now Playing 🟢' : 'Stopped 🔴'}
                              </span>
                            )}
                            {isSkin && active && (
                              <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                                Equipped 👑
                              </span>
                            )}
                            {isSoundPack && active && (
                              <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                                System Voice Active 🔊
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Action Control */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (active) {
                                onDeactivate(item.id);
                              } else {
                                onActivate(item.id);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 border min-w-[85px] justify-center ${
                              active 
                                ? 'bg-red-50 text-red-500 border-red-100' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}
                          >
                            {isMusic ? (
                              active ? (
                                <>
                                  <Pause size={10} fill="currentColor" /> Turn Off
                                </>
                              ) : (
                                <>
                                  <Play size={10} fill="currentColor" /> Turn On
                                </>
                              )
                            ) : (
                              active ? 'Equipped • Off' : 'Active • On'
                            )}
                          </button>
                          
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recorded Reels</span>
                <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">{savedVideos.length} Saved</span>
              </div>

              {savedVideos.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <Video size={28} />
                  </div>
                  <h4 className="text-slate-800 font-black uppercase text-xs">No Records Found</h4>
                  <p className="text-slate-400 text-[11px] max-w-xs leading-relaxed">
                    Make awesome custom videos and animations using the Nexora Studio workspace to preserve real-time updates!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {savedVideos.map(video => (
                    <div key={video.id} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm group relative flex flex-col">
                      <div className="aspect-[9/16] bg-slate-900 relative">
                        {video.videoUrl && (
                          <video 
                            src={video.videoUrl} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            muted
                            loop
                            playsInline
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button 
                            onClick={() => onPlayVideo(video)}
                            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-110 active:scale-90 transition-transform"
                          >
                            <Play size={16} fill="white" />
                          </button>
                        </div>
                        <button 
                          onClick={() => onDeleteVideo(video.id)}
                          className="absolute top-2 right-2 p-2 bg-red-650/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="p-3 bg-white">
                        <p className="text-[10px] font-black text-slate-800 uppercase truncate mb-1">{video.caption || 'Nexus Clip'}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(video.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'creative' && (
            <motion.div
              key="creative"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sketches & Sketches</span>
                <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">{(stats.drawings?.length || 0)} Saved</span>
              </div>

              {!stats.drawings || stats.drawings.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <Palette size={28} />
                  </div>
                  <h4 className="text-slate-800 font-black uppercase text-xs">No Canvas Artworks</h4>
                  <p className="text-slate-400 text-[11px] max-w-xs leading-relaxed">
                    Unleash your creative skills by performing the Interactive Drawing Step of Challenge protocol!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {stats.drawings.map((drawing, idx) => (
                    <div key={idx} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm group aspect-square relative p-2">
                      <div className="w-full h-full bg-slate-50 rounded-xl relative overflow-hidden flex items-center justify-center">
                        <img src={drawing} className="w-full h-full object-contain" />
                        
                        {/* Action Overlays */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => onDeleteDrawing(idx)}
                            className="p-2.5 bg-red-650 text-white rounded-xl shadow border border-red-500 hover:scale-110"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'archive' && (
            <motion.div
              key="archive"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Pinned Protocols - Savable Challenge Flow */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pinned Protocols (Replay Arenas)</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Practice Mode</span>
                </div>

                {/* Sub-notification warning explaining practice details */}
                <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-100 p-3.5 rounded-2xl text-blue-900 leading-relaxed text-[11px] font-semibold">
                  <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Replaying pinned challenges here runs them in <span className="font-bold text-blue-950">Practice Mode</span>. Work out, meditate, or write as many times as you want! <span className="font-bold">Note:</span> Practice sessions yield standard focus improvements but do NOT grant XP, coins, streaks, or trophies.
                  </p>
                </div>

                {(!settings.savedChallengeIds || settings.savedChallengeIds.length === 0) ? (
                  <div className="border border-dashed border-slate-200 rounded-[2rem] p-8 text-center flex flex-col items-center gap-2">
                    <p className="text-xs font-black text-slate-450 uppercase">No Pinned Protocols</p>
                    <p className="text-[10px] text-slate-400 max-w-xs">
                      During active challenge screens, click the "Pin" icon to save that specific step guideline for quick access back here!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white border border-slate-150 rounded-[2rem] p-4 shadow-sm">
                    {settings.savedChallengeIds.map(cid => (
                      <div key={cid} className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-1D0">
                            <Zap size={14} className="fill-blue-50" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{cid}</p>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mt-0.5">UNLIMITED PRACTICES</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onPlayChallenge(cid)}
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                          >
                            <Play size={10} fill="currentColor" /> Take Challenge
                          </button>
                          
                          <button 
                            onClick={() => onDeleteChallenge(cid)} 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gratitude Entries */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">Neuro-Gratitude Signals (Gratitude Journals)</span>
                {(!stats.gratitudeEntries || stats.gratitudeEntries.length === 0) ? (
                  <div className="border border-dashed border-slate-200 rounded-[2rem] p-8 text-center flex flex-col items-center gap-2">
                    <p className="text-xs font-black text-slate-450 uppercase">No Notes Captured</p>
                    <p className="text-[10px] text-slate-400">Complete the Gratitude Journal step in active daily challenges to preserve notes here!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white border border-slate-150 rounded-[2rem] p-4 shadow-sm">
                    {stats.gratitudeEntries.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-slate-700 leading-relaxed italic">"{entry.text}"</p>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mt-1.5">{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={() => onDeleteNote(entry.id)} 
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}
