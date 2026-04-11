import { motion } from 'motion/react';
import { LibraryItem, UserStats, UserSettings } from '../types';
import { ArrowLeft, Trash2, Power, PowerOff, Package, Book, Image as ImageIcon, Sparkles, Music, Play, Pause, Volume2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function LibraryScreen({ 
  items, 
  stats,
  settings,
  onActivate, 
  onDeactivate, 
  onDelete, 
  onDeleteNote,
  onDeleteChallenge,
  onDeleteDrawing,
  onBack 
}: { 
  items: LibraryItem[]; 
  stats: UserStats;
  settings: UserSettings;
  onActivate: (id: string) => void; 
  onDeactivate: (id: string) => void; 
  onDelete: (id: string) => void; 
  onDeleteNote: (id: string) => void; 
  onDeleteChallenge: (id: string) => void;
  onDeleteDrawing: (index: number) => void;
  onBack: () => void; 
}) {
  const powerUps = items.filter(item => item.type === 'power-up');
  const skins = items.filter(item => item.type === 'skin');
  const musicItems = items.filter(item => item.type === 'music' || item.type === 'sound-pack');
  const gifts = items.filter(item => item.type === 'gift');
  const notes = stats.gratitudeEntries || [];
  const drawings = stats.drawings || [];
  const savedChallenges = settings.savedChallengeIds || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 pb-24 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-blue-100 transition-colors">
          <ArrowLeft size={24} className="text-blue-900" />
        </button>
        <h1 className="text-3xl font-black text-blue-900">My Library</h1>
        <div className="ml-auto p-2 bg-blue-100 rounded-xl">
          <Package size={24} className="text-blue-600" />
        </div>
      </div>

      {(items.length === 0 && notes.length === 0 && drawings.length === 0 && savedChallenges.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Package size={40} className="text-blue-200" />
          </div>
          <h2 className="text-xl font-bold text-blue-900 mb-2">Your library is empty</h2>
          <p className="text-blue-900/40 max-w-xs">Buy items in the shop or save notes to see them here!</p>
          <button 
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Shop Items Section */}
          {(powerUps.length > 0 || skins.length > 0 || musicItems.length > 0 || gifts.length > 0) && (
            <div className="space-y-8">
              {powerUps.length > 0 && (
                <section>
                  <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Active Power-Ups</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {powerUps.map((item) => (
                      <LibraryItemCard 
                        key={item.id} 
                        item={item} 
                        onActivate={onActivate} 
                        onDeactivate={onDeactivate} 
                        onDelete={onDelete} 
                      />
                    ))}
                  </div>
                </section>
              )}

              {musicItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Music size={16} className="text-blue-400" />
                    <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Music & Sound Packs</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {musicItems.map((item) => (
                      <LibraryItemCard 
                        key={item.id} 
                        item={item} 
                        onActivate={onActivate} 
                        onDeactivate={onDeactivate} 
                        onDelete={onDelete} 
                      />
                    ))}
                  </div>
                </section>
              )}

              {skins.length > 0 && (
                <section>
                  <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Mascot Styles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {skins.map((item) => (
                      <LibraryItemCard 
                        key={item.id} 
                        item={item} 
                        onActivate={onActivate} 
                        onDeactivate={onDeactivate} 
                        onDelete={onDelete} 
                      />
                    ))}
                  </div>
                </section>
              )}

              {gifts.length > 0 && (
                <section>
                  <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Mystery Gifts</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gifts.map((item) => (
                      <LibraryItemCard 
                        key={item.id} 
                        item={item} 
                        onActivate={onActivate} 
                        onDeactivate={onDeactivate} 
                        onDelete={onDelete} 
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Saved Challenges Section */}
          {savedChallenges.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-blue-400" />
                <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest">Saved Challenges</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedChallenges.map((challengeId, i) => (
                  <div key={i} className="glass-card p-4 flex items-center justify-between border-l-4 border-l-blue-400">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="text-blue-900 font-bold capitalize">{challengeId}</p>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Challenge</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteChallenge(challengeId)}
                      className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes Section */}
          {notes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Book size={16} className="text-blue-400" />
                <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest">My Saved Notes</h2>
              </div>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="glass-card p-4 flex flex-col gap-3 border-l-4 border-l-amber-400">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-blue-900 font-medium text-sm whitespace-pre-wrap">{note.text}</p>
                      <button 
                        onClick={() => onDeleteNote(note.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="text-[10px] font-bold text-blue-900/30 uppercase">
                      {format(parseISO(note.date), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Drawings Section */}
          {drawings.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={16} className="text-blue-400" />
                <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest">My Masterpieces</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {drawings.map((drawing, i) => (
                  <div key={i} className="bg-white p-2 rounded-2xl shadow-md border-2 border-blue-100 overflow-hidden group relative">
                    <img src={drawing} alt={`Drawing ${i}`} className="w-full aspect-square object-cover rounded-xl" loading="lazy" />
                    <button 
                      onClick={() => onDeleteDrawing(i)}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Drawing"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="mt-2 flex justify-between items-center px-1">
                      <span className="text-[10px] font-bold text-blue-400">#{i + 1}</span>
                      <Sparkles size={12} className="text-blue-300" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </motion.div>
  );
}

function LibraryItemCard({ 
  item, 
  onActivate, 
  onDeactivate, 
  onDelete 
}: { 
  item: LibraryItem; 
  onActivate: (id: string) => void; 
  onDeactivate: (id: string) => void; 
  onDelete: (id: string) => void; 
}) {
  const isMusic = item.type === 'music' || item.type === 'sound-pack';

  return (
    <div className={`glass-card p-4 flex items-center gap-4 transition-all ${item.activated ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100' : 'border-transparent'}`}>
      <div className="relative">
        <div className="text-4xl drop-shadow-sm">{item.icon}</div>
        {item.activated && isMusic && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full shadow-md"
          >
            <Volume2 size={10} />
          </motion.div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-blue-900 truncate">{item.name}</h3>
        <p className="text-[10px] text-blue-900/40 font-medium">
          {item.activated ? (isMusic ? 'Now Playing' : 'Currently Active') : 'Inactive'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {item.activated ? (
          <button 
            onClick={() => onDeactivate(item.id)}
            className={`p-2 rounded-lg transition-colors ${isMusic ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            title={isMusic ? "Stop Music" : "Deactivate"}
          >
            {isMusic ? <Pause size={18} /> : <PowerOff size={18} />}
          </button>
        ) : (
          <button 
            onClick={() => onActivate(item.id)}
            className={`p-2 rounded-lg transition-colors ${isMusic ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
            title={isMusic ? "Play Music" : "Activate"}
          >
            {isMusic ? <Play size={18} /> : <Power size={18} />}
          </button>
        )}
        <button 
          onClick={() => onDelete(item.id)}
          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          title="Delete (Return to Shop)"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
