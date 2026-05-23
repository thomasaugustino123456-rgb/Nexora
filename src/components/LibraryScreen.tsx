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
    { id: 'inventory', label: 'Vault', icon: Package, desc: 'Skins & Meditations' },
    { id: 'media', label: 'Media', icon: Video, desc: 'Nexus Recorded Records' },
    { id: 'creative', label: 'Sketches', icon: Palette, desc: 'Neural Canvas Art' },
    { id: 'archive', label: 'Protocols', icon: StickyNote, desc: 'Gratitude & Pins' },
  ];

  const isPlayingMusic = (item: LibraryItem) => {
    return item.type === 'music' && item.activated;
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent pb-36 overflow-x-hidden w-full">
      {/* Dynamic Header incorporating Theme settings-header-bg */}
      <div className="sticky top-0 z-[100] settings-header-bg backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-[#E9E4D4] shadow-sm">
        <button 
          onClick={onBack} 
          className="p-3 bg-white/65 hover:bg-white border border-[#E9E4D4] shadow-sm rounded-2xl text-blue-900/80 hover:text-[#4F3F34] active:scale-95 transition-all text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5"
        >
          <ChevronRight className="rotate-180 text-[#69C496]" size={16} /> BACK
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase text-[#69C496] tracking-[0.2em] animate-pulse">Your Treasury</p>
          <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Vault System</h2>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-white border border-[#E9E4D4] flex items-center justify-center text-[#69C496] shadow-sm">
          <Package size={18} />
        </div>
      </div>

      <div className="px-4 md:px-6 mt-6">
        {/* Dynamic, Theme-matching Description */}
        <div className="max-w-2xl mx-auto glass-card p-5 flex items-start gap-4 mb-6">
          <div className="p-3 bg-[#69C496]/10 border border-[#69C496]/25 rounded-2xl text-[#69C496] flex-shrink-0 animate-pulse">
            <Sparkles size={16} className="fill-[#69C496]/20" />
          </div>
          <div>
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-wide">Nexus Asset Treasury</h3>
            <p className="text-[11px] text-blue-900/80 font-semibold leading-relaxed mt-1">
              Equip unlocked skins for your companion mascot, toggle therapeutic audio tracks, replay your pinned protocols, and review your neural sketch achievements.
            </p>
          </div>
        </div>

        {/* Elegant Bento Navigation Tabs matching the organic look */}
        <div className="max-w-2xl mx-auto flex gap-3 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left flex-shrink-0 min-w-[130px] sm:min-w-[155px] hover:scale-[1.02] active:scale-[0.98] ${
                  isActive 
                    ? 'bg-gradient-to-tr from-[#69C496] to-[#51AF7E] text-white border-[#51AF7E] shadow-md shadow-[#69C496]/30' 
                    : 'bg-white text-blue-900 border-[#E9E4D4] hover:bg-white/90 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={isActive ? 'text-white' : 'text-[#69C496]'} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full block ${isActive ? 'text-[#E8F5EE]' : 'text-blue-900/60'}`}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 max-w-2xl mx-auto space-y-6">
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
                  <span className="text-[10px] font-black uppercase text-blue-900/60 tracking-wider">Stored Items</span>
                  <span className="text-[10px] font-black text-[#69C496] uppercase bg-[#69C496]/10 px-2 py-0.5 rounded-full">{items.length} Unlocked</span>
                </div>
                
                {items.length === 0 ? (
                  <div className="border-2 border-dashed border-[#E9E4D4] rounded-[2.5rem] p-12 text-center bg-white/70 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#69C496]/10 rounded-full flex items-center justify-center text-[#69C496]">
                      <Package size={28} />
                    </div>
                    <h4 className="text-blue-900 font-black uppercase text-xs">Treasury is Empty</h4>
                    <p className="text-blue-900/60 text-[11px] max-w-xs leading-relaxed">
                      Visit the Shop section to purchase beautiful skins for your mascot, unlock organic backgrounds, and grab sound packs!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E9E4D4] bg-white border border-[#E9E4D4] rounded-[2.5rem] p-6 shadow-sm">
                    {items.map(item => {
                      const isMusic = item.type === 'music';
                      const isSkin = item.type === 'skin';
                      const isSoundPack = item.type === 'sound-pack';
                      const active = item.activated;

                      return (
                        <div key={item.id} className="flex items-center gap-4 py-4 first:pt-1 last:pb-1">
                          {/* Avatar Display */}
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border transition-all ${
                              active 
                                ? 'bg-gradient-to-br from-[#69C496] to-[#51AF7E] border-[#51AF7E] text-white' 
                                : 'bg-[#FFFDF9] border-[#E9E4D4]'
                            }`}>
                              {item.icon}
                            </div>
                            {active && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#69C496] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#69C496]"></span>
                              </span>
                            )}
                          </div>

                          {/* Data Column */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-blue-900 text-xs sm:text-sm uppercase tracking-wide truncate">{item.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[8px] font-black text-blue-900/60 bg-[#FAF7F2] border border-[#E9E4D4] px-2 py-0.5 rounded">
                                {item.type}
                              </span>
                              {isMusic && (
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                                  active 
                                    ? 'bg-[#E8F5EE] text-[#69C496] animate-pulse' 
                                    : 'bg-[#FAF7F2] text-blue-900/40'
                                }`}>
                                  <Disc size={8} className={active ? 'animate-spin' : ''} />
                                  {active ? 'Playing' : 'In Library'}
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

                          {/* Trigger Area */}
                          <div className="flex gap-2.5">
                            <button
                              onClick={() => {
                                if (active) {
                                  onDeactivate(item.id);
                                } else {
                                  onActivate(item.id);
                                }
                              }}
                              className={`px-3 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 border min-w-[90px] justify-center ${
                                active 
                                  ? 'bg-[#FDF2F2] text-red-600 border-red-200 hover:bg-[#FCE8E8]' 
                                  : 'bg-[#E8F5EE] text-[#69C496] border-[#D0EFE0] hover:bg-[#DDF7EB]'
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
                              className="p-2 text-blue-900/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
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
                  <span className="text-[10px] font-black uppercase text-blue-900/60 tracking-wider">Recorded Reels</span>
                  <span className="text-[10px] font-black text-[#69C496] uppercase bg-[#69C496]/10 px-2 py-0.5 rounded-full">{savedVideos.length} Saved</span>
                </div>

                {savedVideos.length === 0 ? (
                  <div className="border-2 border-dashed border-[#E9E4D4] rounded-[2.5rem] p-12 text-center bg-white/70 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#69C496]/10 rounded-full flex items-center justify-center text-[#69C496]">
                      <Video size={28} />
                    </div>
                    <h4 className="text-blue-900 font-black uppercase text-xs">No Records Found</h4>
                    <p className="text-blue-900/60 text-[11px] max-w-xs leading-relaxed">
                      Make awesome custom animations and records inside the Nexora Studio sandbox to store files!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {savedVideos.map(video => (
                      <div key={video.id} className="bg-white border border-[#E9E4D4] rounded-2xl overflow-hidden shadow-sm group relative flex flex-col">
                        <div className="aspect-[9/16] bg-slate-950 relative">
                          {video.videoUrl && (
                            <video 
                              src={video.videoUrl} 
                              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                              muted
                              loop
                              playsInline
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button 
                              onClick={() => onPlayVideo(video)}
                              className="w-11 h-11 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-110 active:scale-90 transition-transform"
                            >
                              <Play size={18} fill="white" className="ml-0.5" />
                            </button>
                          </div>
                          <button 
                            onClick={() => onDeleteVideo(video.id)}
                            className="absolute top-2 right-2 p-2 bg-red-600/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="p-3 bg-white border-t border-[#E9E4D4]">
                          <p className="text-[10px] font-black text-blue-900 uppercase truncate mb-1">{video.caption || 'Nexus Clip'}</p>
                          <p className="text-[8px] font-bold text-blue-900/40 uppercase">{new Date(video.createdAt).toLocaleDateString()}</p>
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
                  <span className="text-[10px] font-black uppercase text-blue-900/60 tracking-wider">Canvas Artworks</span>
                  <span className="text-[10px] font-black text-[#69C496] uppercase bg-[#69C496]/10 px-2 py-0.5 rounded-full">{(stats.drawings?.length || 0)} Saved</span>
                </div>

                {!stats.drawings || stats.drawings.length === 0 ? (
                  <div className="border-2 border-dashed border-[#E9E4D4] rounded-[2.5rem] p-12 text-center bg-white/70 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#69C496]/10 rounded-full flex items-center justify-center text-[#69C496]">
                      <Palette size={28} />
                    </div>
                    <h4 className="text-blue-900 font-black uppercase text-xs">No Canvas Artworks</h4>
                    <p className="text-blue-900/60 text-[11px] max-w-xs leading-relaxed">
                      Express your creative skills in the drawing steps during the Core Challenge flow.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {stats.drawings.map((drawing, idx) => (
                      <div key={idx} className="bg-white border border-[#E9E4D4] rounded-2xl overflow-hidden shadow-sm group aspect-square relative p-2">
                        <div className="w-full h-full bg-[#FFFDF9] rounded-xl relative overflow-hidden flex items-center justify-center">
                          <img src={drawing} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button 
                              onClick={() => onDeleteDrawing(idx)}
                              className="p-3 bg-red-600 text-white rounded-xl shadow border border-red-500 hover:scale-110 active:scale-95 transition-transform"
                            >
                              <Trash2 size={14} />
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-[10px] font-black uppercase text-blue-900/60 tracking-wider">Pinned Protocols</span>
                    <span className="text-[10px] font-black text-[#69C496] bg-[#69C496]/10 px-2 py-0.5 rounded-full">Practice Arena</span>
                  </div>

                  <div className="flex items-start gap-3 bg-[#E8F5EE] border border-[#D0EFE0] p-4 rounded-2xl text-blue-900 leading-relaxed text-[11px] font-semibold shadow-sm">
                    <AlertCircle size={15} className="text-[#69C496] mt-0.5 flex-shrink-0" />
                    <p>
                      Replaying challenges here runs in <span className="font-bold text-[#4F3F34]">Practice Mode</span>. Work out or practice as many times as you like! Practice mode provides experience but does not increment competitive streaks or trophies.
                    </p>
                  </div>

                  {(!settings.savedChallengeIds || settings.savedChallengeIds.length === 0) ? (
                    <div className="border border-dashed border-[#E9E4D4] rounded-[2.5rem] p-8 text-center bg-white/75 flex flex-col items-center gap-2">
                      <p className="text-xs font-black text-blue-900/40 uppercase">No Pinned Protocols</p>
                      <p className="text-[10px] text-blue-900/50 max-w-xs">
                        Pin interesting challenges from your main feeding screen to collect them here for warmups!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E9E4D4] bg-white border border-[#E9E4D4] rounded-[2.5rem] p-5 shadow-sm">
                      {settings.savedChallengeIds.map(cid => (
                        <div key={cid} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#E8F5EE] text-[#69C496] rounded-xl border border-[#D0EFE0]">
                              <Zap size={14} className="fill-[#69C496]/40" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-blue-900 uppercase tracking-tight">{cid.replace(/-/g, ' ')}</p>
                              <span className="text-[8px] font-black text-blue-900/40 uppercase tracking-wider block mt-0.5">UNLIMITED REPLAYS</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onPlayChallenge(cid)}
                              className="px-4 py-2 bg-[#E8F5EE] hover:bg-[#DDF7EB] text-[#69C496] border border-[#D0EFE0] rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                            >
                              <Play size={10} fill="currentColor" /> Take Challenge
                            </button>
                            
                            <button 
                              onClick={() => onDeleteChallenge(cid)} 
                              className="p-2 text-blue-900/30 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gratitude signals */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-black uppercase text-blue-900/60 tracking-wider px-1">Neuro-Gratitude Signals</span>
                  {(!stats.gratitudeEntries || stats.gratitudeEntries.length === 0) ? (
                    <div className="border border-dashed border-[#E9E4D4] rounded-[2.5rem] p-8 text-center bg-white/75 flex flex-col items-center gap-2">
                      <p className="text-xs font-black text-blue-900/40 uppercase font-bold">No Records Saved</p>
                      <p className="text-[10px] text-blue-900/50">Your active gratitude thoughts will automatically save here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E9E4D4] bg-white border border-[#E9E4D4] rounded-[2.5rem] p-5 shadow-sm">
                      {stats.gratitudeEntries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1">
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-blue-900/80 leading-relaxed italic">"{entry.text}"</p>
                            <span className="text-[8px] font-black text-blue-900/40 uppercase tracking-wider block mt-1.5">{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          <button 
                            onClick={() => onDeleteNote(entry.id)} 
                            className="p-2 text-blue-900/30 hover:text-red-500 hover:bg-gradient-to-br rounded-xl"
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
