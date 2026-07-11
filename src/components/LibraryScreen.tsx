import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Video, Trash2, CheckCircle2, Play, Pause,
  Palette, StickyNote, Zap, Heart, Disc, Eye, Sparkles, AlertCircle,
  ChevronRight
} from 'lucide-react';
import { LibraryItem, UserStats, UserSettings, NexusVideo } from '../types';
import { translate } from '../lib/translations';

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
  const lang = settings.language || 'en';
  const [activeTab, setActiveTab] = useState<Tab>('inventory');

  const tabs = [
    { id: 'inventory', label: translate('Vault', lang), icon: Package, desc: translate('Skins & Tracks', lang) },
    // { id: 'media', label: translate('Media', lang), icon: Video, desc: translate('Saved Reels & Clips', lang) },
    { id: 'creative', label: translate('Sketches', lang), icon: Palette, desc: translate('Saved Masterpieces', lang) },
    { id: 'archive', label: translate('Protocols', lang), icon: StickyNote, desc: translate('Saved Brain Dumps', lang) },
  ];

  return (
    <div className="w-full flex flex-col pb-20">
      {/* Flat Native Header Section */}
      <div className="flex items-center justify-between py-5 border-b border-[#E9E4D4]/40 mb-6 px-1">
        <button 
          onClick={onBack} 
          className="p-2.5 bg-white hover:bg-[#FAF7F2] border border-[#E9E4D4]/60 rounded-xl text-[#4F3F34] active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
        >
          <ChevronRight className="rotate-180 text-[#69C496]" size={14} /> {translate("BACK", lang)}
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black uppercase text-[#69C496] tracking-[0.18em]">{translate("Retention Treasury", lang)}</p>
          <h2 className="text-base font-black text-[#4F3F34] uppercase tracking-tight">{translate("Vault System", lang)}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E4D4]/60 flex items-center justify-center text-[#69C496] shadow-sm">
          <Package size={16} />
        </div>
      </div>

      <div className="px-1 mt-2">
        {/* Flat Integrated Subheader */}
        <div className="max-w-2xl mx-auto flex items-start gap-3 mb-6 px-1">
          <div className="p-2 bg-[#69C496]/10 rounded-xl text-[#69C496] flex-shrink-0">
            <Sparkles size={13} className="fill-[#69C496]/20 animate-pulse" />
          </div>
          <div>
            <h3 className="text-[11px] font-black text-[#4F3F34] uppercase tracking-wide">{translate("Integrated Treasury", lang)}</h3>
            <p className="text-[10px] text-[#4F3F34]/60 font-medium leading-relaxed mt-0.5">
              {translate("Select unlocks for your biological companion, trigger therapeutic audio streams, relive curated challenges, and appreciate your custom generated assets, bro.", lang)}
            </p>
          </div>
        </div>

        {/* Flat Minimalist Navigation Tabs - Non-scrollable, beautiful and clean */}
        <div className="max-w-2xl mx-auto flex items-center justify-between border-b border-[#E9E4D4]/30 pb-1 mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 flex flex-col items-center py-3 px-1 border-b-2 transition-all relative hover:scale-105 active:scale-95 ${
                  isActive 
                    ? 'border-[#69C496] text-[#4F3F34]' 
                    : 'border-transparent text-[#4F3F34]/50 hover:text-[#4F3F34]/80'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={14} className={isActive ? 'text-[#69C496]' : 'text-[#4F3F34]/40'} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wide opacity-65">
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
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-[#69C496]/10 rounded-xl flex items-center justify-center text-[#69C496] mb-1">
                      <Package size={22} />
                    </div>
                    <h4 className="text-[#4F3F34] font-black uppercase text-[11px] tracking-wide">Treasury is Empty</h4>
                    <p className="text-[#4F3F34]/50 text-[10px] max-w-xs leading-relaxed font-semibold">
                      Navigate to the Eco Store to trigger and cultivate beautiful botanical companion skins, customized focus backgrounds, and custom ambient sounds, bro!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {items.map(item => {
                      const isMusic = item.type === 'music';
                      const isSkin = item.type === 'skin';
                      const isSoundPack = item.type === 'sound-pack';
                      const active = item.activated;

                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between gap-4 py-4 border-b border-[#E9E4D4]/30 hover:bg-[#FAF7F2]/30 px-2 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Item display icon */}
                            <div className="relative shrink-0">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border transition-all ${
                                active 
                                  ? 'bg-[#FAF7F2] border-[#69C496]/40 text-[#4F3F34]' 
                                  : 'bg-white border-[#E9E4D4]/50'
                              }`}>
                                {item.icon}
                              </div>
                              {active && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#69C496]"></span>
                                </span>
                              )}
                            </div>

                            {/* Detail display panel */}
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-[#4F3F34] text-xs sm:text-sm uppercase tracking-wide truncate">{item.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[7.5px] font-black text-[#4F3F34]/50 bg-[#FAF7F2] border border-[#E9E4D4]/45 px-1.5 py-0.5 rounded uppercase">
                                  {item.type}
                                </span>
                                {isMusic && (
                                  <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                    active 
                                      ? 'bg-[#E8F5EE] text-[#69C496]' 
                                      : 'bg-[#FAF7F2] text-[#4F3F34]/30'
                                  }`}>
                                    <Disc size={8} className={active ? 'animate-spin' : ''} />
                                    {active ? 'Playing' : 'In Library'}
                                  </span>
                                )}
                                {isSkin && active && (
                                  <span className="text-[7.5px] font-black text-amber-600 bg-amber-50 px-1 py-0.5 rounded uppercase">
                                    Equipped 👑
                                  </span>
                                )}
                                {isSoundPack && active && (
                                  <span className="text-[7.5px] font-black text-[#69C496] bg-[#E8F5EE] px-1 py-0.5 rounded uppercase">
                                    Sound Active 🔊
                                  </span>
                                )}
                              </div>
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
                              className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1 border min-w-[80px] justify-center active:scale-95 ${
                                active 
                                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20' 
                                  : 'bg-[#69C496]/10 text-[#69C496] border-[#69C496]/20 hover:bg-[#69C496]/20'
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
                              className="p-1.5 text-[#4F3F34]/30 hover:text-red-500 transition-all rounded-lg"
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
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-[#69C496]/10 rounded-xl flex items-center justify-center text-[#69C496] mb-1">
                      <Video size={22} />
                    </div>
                    <h4 className="text-[#4F3F34] font-black uppercase text-[11px] tracking-wide">No Recorded Material</h4>
                    <p className="text-[#4F3F34]/50 text-[10px] max-w-xs leading-relaxed font-semibold">
                      Build and capture visual layout compositions inside the Nexora Studio sandbox to store video reels here, bro.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {savedVideos.map(video => (
                      <div key={video.id} className="border border-[#E9E4D4]/40 rounded-2xl overflow-hidden shadow-sm group relative flex flex-col bg-white">
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
                        <div className="p-3 bg-white border-t border-[#E9E4D4]/30">
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
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-[#69C496]/10 rounded-xl flex items-center justify-center text-[#69C496] mb-1">
                      <Palette size={22} />
                    </div>
                    <h4 className="text-[#4F3F34] font-black uppercase text-[11px] tracking-wide">Art Treasury Empty</h4>
                    <p className="text-[#4F3F34]/50 text-[10px] max-w-xs leading-relaxed font-semibold">
                      Draw on the digital drawing board during focus tasks to secure beautiful canvas artwork logs here, bro.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {stats.drawings.map((drawing, idx) => (
                      <div key={idx} className="group aspect-square relative p-1 rounded-2xl border border-[#E9E4D4]/40 hover:border-[#69C496]/50 bg-[#FFFDF9] overflow-hidden transition-all shadow-sm">
                        <img src={drawing} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => onDeleteDrawing(idx)}
                            className="p-2.5 bg-rose-600 text-white rounded-xl shadow-lg border border-rose-500 hover:scale-110 active:scale-95 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[10px] font-black uppercase text-[#4F3F34]/60 tracking-wider">Saved Arena Protocols</span>
                    <span className="text-[9px] font-black text-[#69C496] bg-[#E8F5EE] border border-[#D0EFE0] px-2 py-0.5 rounded-full">Practice Mode</span>
                  </div>

                  <div className="flex items-start gap-3 bg-[#E8F5EE]/40 border border-[#D0EFE0]/50 p-3.5 rounded-xl text-[#4F3F34] leading-relaxed text-[10px] font-semibold">
                    <AlertCircle size={14} className="text-[#69C496] mt-0.5 flex-shrink-0" />
                    <p>
                      Replaying challenges processes in <span className="font-extrabold">Practice Mode</span>. Earn XP but do not wipe competitive streaks, bro!
                    </p>
                  </div>

                  {(!settings.savedChallengeIds || settings.savedChallengeIds.length === 0) ? (
                    <div className="py-8 text-center flex flex-col items-center gap-1">
                      <p className="text-[10px] font-black text-[#4F3F34]/40 uppercase">No Saved Protocols</p>
                      <p className="text-[9px] text-[#4F3F34]/50 max-w-sm leading-relaxed font-medium">
                        Pin challenges from active streams to save them for practice!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {settings.savedChallengeIds.map(cid => (
                        <div key={cid} className="flex items-center justify-between py-3.5 border-b border-[#E9E4D4]/30 hover:bg-[#FAF7F2]/30 px-2 rounded-xl transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#E8F5EE] text-[#69C496] rounded-lg border border-[#D0EFE0]/60">
                              <Zap size={12} className="fill-[#69C496]/40" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-[#4F3F34] uppercase tracking-tight">{cid.replace(/-/g, ' ')}</p>
                              <span className="text-[7.5px] font-black text-[#4F3F34]/40 uppercase tracking-wider block mt-0.5">UNLIMITED REPLAYS</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onPlayChallenge(cid)}
                              className="px-3 py-1.5 bg-[#E8F5EE]/80 hover:bg-[#DDF7EB] text-[#69C496] border border-[#D0EFE0] rounded-lg font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                            >
                              <Play size={10} fill="currentColor" /> Replay
                            </button>
                            
                            <button 
                              onClick={() => onDeleteChallenge(cid)} 
                              className="p-1.5 text-[#4F3F34]/30 hover:text-red-500 transition-all"
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
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-black uppercase text-[#4F3F34]/60 tracking-wider px-1">Recorded Manifest Logs</span>
                  {(!stats.gratitudeEntries || stats.gratitudeEntries.length === 0) ? (
                    <div className="py-8 text-center flex flex-col items-center gap-1">
                      <p className="text-[10px] font-black text-[#4F3F34]/40 uppercase font-bold">No Brain Dumps Stored</p>
                      <p className="text-[9px] text-[#4F3F34]/50 leading-relaxed font-medium">Your gratitude entries and thought dumps will sync here, bro.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {stats.gratitudeEntries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between gap-4 py-3.5 border-b border-[#E9E4D4]/30 hover:bg-[#FAF7F2]/30 px-2 rounded-xl transition-all">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#4F3F34] leading-relaxed italic">"{entry.text}"</p>
                            <span className="text-[7.5px] font-black text-[#4F3F34]/40 uppercase tracking-widest block mt-1">{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          <button 
                            onClick={() => onDeleteNote(entry.id)} 
                            className="p-1.5 text-[#4F3F34]/30 hover:text-rose-500 transition-all"
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
