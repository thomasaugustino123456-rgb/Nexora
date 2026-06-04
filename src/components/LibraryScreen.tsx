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
    { id: 'inventory', label: 'Vault', icon: Package, desc: 'Skins & Tracks' },
    { id: 'media', label: 'Media', icon: Video, desc: 'Saved Reels & Clips' },
    { id: 'creative', label: 'Sketches', icon: Palette, desc: 'Saved Masterpieces' },
    { id: 'archive', label: 'Protocols', icon: StickyNote, desc: 'Saved Brain Dumps' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFAF6] pb-36 overflow-x-hidden w-full">
      {/* Dynamic Header incorporating Sunset Sand Theme style */}
      <div className="sticky top-0 z-[100] bg-[#FAF7F2]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-[#E9E4D4] shadow-sm">
        <button 
          onClick={onBack} 
          className="p-2.5 bg-white hover:bg-[#FAF7F2] border border-[#E9E4D4] shadow-sm rounded-xl text-[#4F3F34] active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
        >
          <ChevronRight className="rotate-180 text-[#69C496]" size={14} /> BACK
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black uppercase text-[#69C496] tracking-[0.22em] animate-pulse">Retention Treasury</p>
          <h2 className="text-base font-black text-[#4F3F34] uppercase tracking-tight">Vault System</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E4D4] flex items-center justify-center text-[#69C496] shadow-sm">
          <Package size={16} />
        </div>
      </div>

      <div className="px-4 md:px-6 mt-6">
        {/* Dynamic description of the Vault section */}
        <div className="max-w-2xl mx-auto bg-white border border-[#E9E4D4] rounded-3xl p-5 flex items-start gap-4 mb-6 shadow-sm">
          <div className="p-3 bg-[#69C496]/10 border border-[#69C496]/20 rounded-2xl text-[#69C496] flex-shrink-0 animate-pulse">
            <Sparkles size={16} className="fill-[#69C496]/20" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#4F3F34] uppercase tracking-wide">Integrated Treasury</h3>
            <p className="text-[11px] text-[#4F3F34]/70 font-bold leading-relaxed mt-1">
              Select unlocks for your biological companion, trigger therapeutic audio streams, relive curated challenges, and appreciate your custom generated assets, bro.
            </p>
          </div>
        </div>

        {/* Bento Navigation Tabs with Sunset/Sand accents */}
        <div className="max-w-2xl mx-auto flex gap-3 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left flex-shrink-0 min-w-[135px] sm:min-w-[155px] hover:scale-[1.02] active:scale-[0.98] ${
                  isActive 
                    ? 'bg-[#4F3F34] text-[#FCFAF6] border-[#4F3F34] shadow-md shadow-[#4F3F34]/20' 
                    : 'bg-white text-[#4F3F34] border-[#E9E4D4] hover:bg-[#FAF7F2] shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={14} className={isActive ? 'text-[#69C496]' : 'text-[#69C496]'} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full block ${isActive ? 'text-[#FAF7F2]/60' : 'text-[#4F3F34]/40'}`}>
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
                  <span className="text-[10px] font-black uppercase text-[#4F3F34]/60 tracking-wider">Acquired Collectibles</span>
                  <span className="text-[10px] font-black text-[#69C496] uppercase bg-[#E8F5EE] border border-[#D0EFE0] px-2 py-0.5 rounded-full">{items.length} Unlocked</span>
                </div>
                
                {items.length === 0 ? (
                  <div className="border border-dashed border-[#E9E4D4] rounded-[2.5rem] p-12 text-center bg-white flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#69C496]/10 rounded-full flex items-center justify-center text-[#69C496]">
                      <Package size={28} />
                    </div>
                    <h4 className="text-[#4F3F34] font-black uppercase text-xs">Treasury is Empty</h4>
                    <p className="text-[#4F3F34]/50 text-[11px] max-w-xs leading-relaxed font-bold">
                      Navigate to the Eco Store to trigger and cultivate beautiful botanical companion skins, customized focus backgrounds, and custom ambient sounds, bro!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E9E4D4] bg-white border border-[#E9E4D4] rounded-[2rem] p-5 shadow-sm">
                    {items.map(item => {
                      const isMusic = item.type === 'music';
                      const isSkin = item.type === 'skin';
                      const isSoundPack = item.type === 'sound-pack';
                      const active = item.activated;

                      return (
                        <div key={item.id} className="flex items-center gap-4 py-4 first:pt-1 last:pb-1">
                          {/* Item display icon */}
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border transition-all ${
                              active 
                                ? 'bg-[#FAF7F2] border-[#69C496] text-[#4F3F34]' 
                                : 'bg-[#FFFDF9] border-[#E9E4D4]'
                            }`}>
                              {item.icon}
                            </div>
                            {active && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#69C496] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#69C496]"></span>
                              </span>
                            )}
                          </div>

                          {/* Detail display panel */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-[#4F3F34] text-xs sm:text-sm uppercase tracking-wide truncate">{item.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[8px] font-black text-[#4F3F34]/60 bg-[#FAF7F2] border border-[#E9E4D4] px-2 py-0.5 rounded uppercase">
                                {item.type}
                              </span>
                              {isMusic && (
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                                  active 
                                    ? 'bg-[#E8F5EE] text-[#69C496] animate-pulse' 
                                    : 'bg-[#FAF7F2] text-[#4F3F34]/40'
                                }`}>
                                  <Disc size={8} className={active ? 'animate-spin' : ''} />
                                  {active ? 'Playing Track' : 'In Library'}
                                </span>
                              )}
                              {isSkin && active && (
                                <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                                  Equipped Mascot 👑
                                </span>
                              )}
                              {isSoundPack && active && (
                                <span className="text-[8px] font-black text-[#69C496] bg-[#E8F5EE] px-1.5 py-0.5 rounded uppercase">
                                  Auditory Sync Active 🔊
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Control buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (active) {
                                  onDeactivate(item.id);
                                } else {
                                  onActivate(item.id);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1 border min-w-[85px] justify-center active:scale-95 ${
                                active 
                                  ? 'bg-[#FDF2F2] text-red-600 border-red-200 hover:bg-[#FCE8E8]' 
                                  : 'bg-[#E8F5EE] text-[#69C496] border-[#D0EFE0] hover:bg-[#DDF7EB]'
                              }`}
                            >
                              {isMusic ? (
                                active ? (
                                  <>
                                    <Pause size={10} fill="currentColor" /> Pause
                                  </>
                                ) : (
                                  <>
                                    <Play size={10} fill="currentColor" /> Play
                                  </>
                                )
                              ) : (
                                active ? 'Deactivate' : 'Activate'
                              )}
                            </button>
                            
                            <button
                              onClick={() => onDelete(item.id)}
                              className="p-1.5 text-[#4F3F34]/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
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
                  <span className="text-[10px] font-black uppercase text-[#4F3F34]/60 tracking-wider">Recorded Reels</span>
                  <span className="text-[10px] font-black text-[#69C496] uppercase bg-[#E8F5EE] border border-[#D0EFE0] px-2 py-0.5 rounded-full">{savedVideos.length} Saved</span>
                </div>

                {savedVideos.length === 0 ? (
                  <div className="border border-dashed border-[#E9E4D4] rounded-[2.5rem] p-12 text-center bg-white flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#69C496]/10 rounded-full flex items-center justify-center text-[#69C496]">
                      <Video size={28} />
                    </div>
                    <h4 className="text-[#4F3F34] font-black uppercase text-xs">No Recorded Material</h4>
                    <p className="text-[#4F3F34]/50 text-[11px] max-w-xs leading-relaxed font-bold">
                      Build and capture visual layout compositions inside the Nexora Studio sandbox to store video reels here, bro.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {savedVideos.map(video => (
                      <div key={video.id} className="bg-white border border-[#E9E4D4] rounded-2xl overflow-hidden shadow-sm group relative flex flex-col">
                        <div className="aspect-[9/16] bg-stone-900 relative">
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
                              className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-110 active:scale-90 transition-transform"
                            >
                              <Play size={16} fill="white" className="ml-0.5" />
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
                          <p className="text-[10px] font-black text-[#4F3F34] uppercase truncate mb-1">{video.caption || 'Nexus Clip'}</p>
                          <p className="text-[8px] font-bold text-[#4F3F34]/40 uppercase">{new Date(video.createdAt).toLocaleDateString()}</p>
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
                  <span className="text-[10px] font-black uppercase text-[#4F3F34]/60 tracking-wider">Canvas Artworks</span>
                  <span className="text-[10px] font-black text-[#69C496] uppercase bg-[#E8F5EE] border border-[#D0EFE0] px-2 py-0.5 rounded-full">{(stats.drawings?.length || 0)} Saved</span>
                </div>

                {!stats.drawings || stats.drawings.length === 0 ? (
                  <div className="border border-dashed border-[#E9E4D4] rounded-[2.5rem] p-12 text-center bg-white flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#69C496]/10 rounded-full flex items-center justify-center text-[#69C496]">
                      <Palette size={28} />
                    </div>
                    <h4 className="text-[#4F3F34] font-black uppercase text-xs">Art Treasury Empty</h4>
                    <p className="text-[#4F3F34]/50 text-[11px] max-w-xs leading-relaxed font-bold">
                      Draw on the digital drawing board during focus tasks to secure beautiful canvas artwork logs here, bro.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {stats.drawings.map((drawing, idx) => (
                      <div key={idx} className="bg-white border border-[#E9E4D4] rounded-2xl overflow-hidden shadow-sm group aspect-square relative p-2">
                        <div className="w-full h-full bg-[#FFFDF9] rounded-xl relative overflow-hidden flex items-center justify-center border border-[#E9E4D4]">
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
                    <span className="text-[10px] font-black uppercase text-[#4F3F34]/60 tracking-wider">Saved Arena Protocols</span>
                    <span className="text-[10px] font-black text-[#69C496] bg-[#E8F5EE] border border-[#D0EFE0] px-2 py-0.5 rounded-full">Replay Gym</span>
                  </div>

                  <div className="flex items-start gap-3 bg-[#E8F5EE] border border-[#D0EFE0] p-4 rounded-2xl text-[#4F3F34] leading-relaxed text-[11px] font-bold shadow-sm">
                    <AlertCircle size={15} className="text-[#69C496] mt-0.5 flex-shrink-0" />
                    <p>
                      Replaying challenges in the Library processes in <span className="font-extrabold text-[#4F3F34]">Practice Mode</span>. Work out or practice as many times as you like, bro! Complete loops earn XP but do not wipe competitive streaks.
                    </p>
                  </div>

                  {(!settings.savedChallengeIds || settings.savedChallengeIds.length === 0) ? (
                    <div className="border border-dashed border-[#E9E4D4] rounded-[2.5rem] p-8 text-center bg-white flex flex-col items-center gap-2 shadow-sm">
                      <p className="text-xs font-black text-[#4F3F34]/40 uppercase">No Saved Protocols</p>
                      <p className="text-[10px] text-[#4F3F34]/50 max-w-sm leading-relaxed font-bold">
                        Pin and store interest-driven challenges from your active streams to capture them here for target practice!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E9E4D4] bg-white border border-[#E9E4D4] rounded-[2rem] p-5 shadow-sm">
                      {settings.savedChallengeIds.map(cid => (
                        <div key={cid} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1 animate-fadeIn">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#E8F5EE] text-[#69C496] rounded-xl border border-[#D0EFE0]">
                              <Zap size={14} className="fill-[#69C496]/40" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-[#4F3F34] uppercase tracking-tight">{cid.replace(/-/g, ' ')}</p>
                              <span className="text-[8px] font-black text-[#4F3F34]/40 uppercase tracking-wider block mt-0.5">UNLIMITED REPLAYS</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onPlayChallenge(cid)}
                              className="px-4 py-2 bg-[#E8F5EE] hover:bg-[#DDF7EB] text-[#69C496] border border-[#D0EFE0] rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                            >
                              <Play size={10} fill="currentColor" /> Replay
                            </button>
                            
                            <button 
                              onClick={() => onDeleteChallenge(cid)} 
                              className="p-2 text-[#4F3F34]/30 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brain Dump Manifest Logs */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-black uppercase text-[#4F3F34]/60 tracking-wider px-1">Recorded Manifest Logs</span>
                  {(!stats.gratitudeEntries || stats.gratitudeEntries.length === 0) ? (
                    <div className="border border-dashed border-[#E9E4D4] rounded-[2.5rem] p-8 text-center bg-white flex flex-col items-center gap-2 shadow-sm">
                      <p className="text-xs font-black text-[#4F3F34]/40 uppercase font-bold">No Brain Dumps Stored</p>
                      <p className="text-[10px] text-[#4F3F34]/50 leading-relaxed font-bold">Your active gratitude and dump thoughts will sync right here, bro.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E9E4D4] bg-white border border-[#E9E4D4] rounded-[2rem] p-5 shadow-sm">
                      {stats.gratitudeEntries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between gap-4 py-4 first:pt-1 last:pb-1">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#4F3F34] leading-relaxed italic">"{entry.text}"</p>
                            <span className="text-[8px] font-black text-[#4F3F34]/40 uppercase tracking-widest block mt-1.5">{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          <button 
                            onClick={() => onDeleteNote(entry.id)} 
                            className="p-2 text-[#4F3F34]/30 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
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
