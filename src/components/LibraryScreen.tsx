import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Package, Video, Trash2, CheckCircle2, XCircle, 
  ChevronRight, Play, Book as BookIcon, Palette, StickyNote,
  Zap, Gift, Star, Shield
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
  onBack
}: LibraryScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');

  const tabs = [
    { id: 'inventory', label: 'Vault', icon: Package },
    { id: 'media', label: 'Media', icon: Video },
    { id: 'creative', label: 'Canvas', icon: Palette },
    { id: 'archive', label: 'Logs', icon: StickyNote },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbff] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#f8fbff]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-blue-100">
        <button 
          onClick={onBack}
          className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-900 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-xs font-black text-blue-900 uppercase tracking-[0.3em]">Personal Library</h2>
          <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Asset Management Hub</p>
        </div>
        <div className="w-12 h-12" />
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-2 py-4 overflow-x-auto no-scrollbar bg-white/50 border-b border-blue-50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                  : 'bg-white text-blue-900/40 hover:bg-blue-50'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em]">Stored Assets</h3>
                <span className="text-[10px] font-bold text-blue-500">{items.length} Units</span>
              </div>
              
              {items.length === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-blue-50 rounded-full text-blue-200">
                    <Package size={48} />
                  </div>
                  <p className="text-sm font-bold text-blue-900/40 uppercase tracking-widest">Vault is empty, bro.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {items.map(item => (
                    <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded-full">
                            {item.type}
                          </span>
                          {item.activated && (
                            <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => item.activated ? onDeactivate(item.id) : onActivate(item.id)}
                          className={`p-3 rounded-xl transition-all ${
                            item.activated 
                              ? 'bg-amber-50 text-amber-600' 
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {item.activated ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
               <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em]">Nexus Records</h3>
                <span className="text-[10px] font-bold text-blue-500">{savedVideos.length} Downloads</span>
              </div>

              {savedVideos.length === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-blue-50 rounded-full text-blue-200">
                    <Video size={48} />
                  </div>
                  <p className="text-sm font-bold text-blue-900/40 uppercase tracking-widest">No recordings found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {savedVideos.map(video => (
                    <div key={video.id} className="glass-card overflow-hidden group">
                      <div className="aspect-[9/16] bg-blue-900 relative">
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
                            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform"
                          >
                            <Play size={20} fill="white" />
                          </button>
                        </div>
                        <button 
                          onClick={() => onDeleteVideo(video.id)}
                          className="absolute top-2 right-2 p-2 bg-red-600/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-black text-blue-900 uppercase truncate mb-1">{video.caption || 'Nexus Clip'}</p>
                        <p className="text-[8px] font-bold text-blue-400 uppercase">{new Date(video.createdAt).toLocaleDateString()}</p>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em]">Neural Artifacts</h3>
                <span className="text-[10px] font-bold text-blue-500">{stats.drawings?.length || 0} Sketches</span>
              </div>

              {!stats.drawings || stats.drawings.length === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-blue-50 rounded-full text-blue-200">
                    <Palette size={48} />
                  </div>
                  <p className="text-sm font-bold text-blue-900/40 uppercase tracking-widest">The canvas is blank, bro.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {stats.drawings.map((drawing, idx) => (
                    <div key={idx} className="glass-card overflow-hidden group aspect-square">
                      <div className="w-full h-full bg-white relative">
                        <img src={drawing} className="w-full h-full object-contain" />
                        <button 
                          onClick={() => onDeleteDrawing(idx)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em]">Log History</h3>
              </div>

              {/* Gratitude Entries */}
              <div className="space-y-3">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest px-2">Neuro-Gratitude Signals</p>
                {(!stats.gratitudeEntries || stats.gratitudeEntries.length === 0) ? (
                  <p className="text-xs font-bold text-blue-900/20 text-center py-4 uppercase">No logs recorded</p>
                ) : (
                  stats.gratitudeEntries.map(entry => (
                    <div key={entry.id} className="glass-card p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-blue-900">{entry.text}</p>
                        <p className="text-[8px] font-bold text-blue-400 uppercase mt-1">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => onDeleteNote(entry.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Saved Challenges */}
              <div className="space-y-3 pt-4">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest px-2">Pinned Protocols</p>
                {(!settings.savedChallengeIds || settings.savedChallengeIds.length === 0) ? (
                  <p className="text-xs font-bold text-blue-900/20 text-center py-4 uppercase">No pinned protocols</p>
                ) : (
                  settings.savedChallengeIds.map(cid => (
                    <div key={cid} className="glass-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Zap size={14} />
                        </div>
                        <p className="text-xs font-black text-blue-900 uppercase tracking-tight">{cid}</p>
                      </div>
                      <button onClick={() => onDeleteChallenge(cid)} className="text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-10 opacity-20 text-center space-y-2">
          <BookIcon size={32} className="mx-auto text-blue-900" />
          <p className="text-[8px] font-black text-blue-900 uppercase tracking-[0.5em]">Nexus Digital Vault v2.0</p>
      </div>
    </div>
  );
}
