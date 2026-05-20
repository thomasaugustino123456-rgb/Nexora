import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Book as BookIcon, 
  Zap, 
  Droplet, 
  Wind, 
  Flower, 
  Sun, 
  Moon, 
  Eye, 
  ChevronRight, 
  X, 
  Heart, 
  Palette, 
  Search, 
  Sparkles, 
  Check, 
  Clock, 
  BookOpen,
  Award,
  Lock,
  Compass,
  Trophy,
  Volume2
} from 'lucide-react';
import { KNOWLEDGE_BOOKS, Book } from '../constants/library';
import { UserStats, UserSettings } from '../types';

// Map icons cleanly
const ICON_MAP: Record<string, any> = {
  Zap,
  Droplet,
  Wind,
  Flower,
  Sun,
  Moon,
  Eye,
  Heart,
  Palette,
  BookOpen: BookIcon
};

// Beautiful vector illustrations for book covers matching their exact concept
function BookIllustration({ bookId, iconName }: { bookId: string; iconName: string }) {
  const IconComponent = ICON_MAP[iconName] || BookIcon;

  // Render a personalized aesthetic theme depending on the book
  switch (bookId) {
    case 'guide-pushups':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 overflow-hidden flex items-center justify-center border-b-4 border-blue-900 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]" />
          <div className="absolute w-24 h-24 rounded-full border border-white/20 animate-spin-slow" style={{ animationDuration: '20s' }} />
          <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" />
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl relative z-10 text-white shadow-lg animate-pulse">
            <IconComponent size={32} />
          </div>
        </div>
      );
    case 'guide-water':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 overflow-hidden flex items-center justify-center border-b-4 border-cyan-800 shadow-inner">
          <div className="absolute top-2 left-6 w-3 h-3 rounded-full bg-white/20 animate-bounce" />
          <div className="absolute bottom-4 right-10 w-2 h-2 rounded-full bg-white/30" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-white/15 rounded-t-full relative flex items-center justify-center">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl relative z-10 text-white shadow-xl">
              <IconComponent size={32} />
            </div>
          </div>
        </div>
      );
    case 'guide-breathing':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 overflow-hidden flex items-center justify-center border-b-4 border-indigo-900 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_10%,transparent_80%)]" />
          <motion.div 
            animate={{ scale: [1, 1.25, 1] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
            className="absolute w-20 h-20 rounded-full bg-white/10 flex items-center justify-center"
          />
          <motion.div 
            animate={{ scale: [1, 1.4, 1] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} 
            className="absolute w-28 h-28 rounded-full bg-white/5"
          />
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl relative z-10 text-white shadow-xl">
            <IconComponent size={32} />
          </div>
        </div>
      );
    case 'guide-gratitude':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 overflow-hidden flex items-center justify-center border-b-4 border-rose-900 shadow-inner">
          <div className="absolute w-12 h-12 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="p-4 bg-white/15 backdrop-blur-lg rounded-2xl relative z-10 text-pink-100 shadow-xl border border-white/10">
            <IconComponent size={32} className="fill-white" />
          </div>
        </div>
      );
    case 'guide-drawing':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 overflow-hidden flex items-center justify-center border-b-4 border-orange-900 shadow-inner">
          <div className="absolute top-2 left-2 w-12 h-12 rounded-full border border-white/10" />
          <div className="absolute right-4 bottom-4 w-16 h-16 rounded-full border border-white/5" />
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl relative z-10 text-white shadow-xl">
            <IconComponent size={32} />
          </div>
        </div>
      );
    case 'plant-crystal-guide':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-800 overflow-hidden flex items-center justify-center border-b-4 border-purple-900 shadow-inner">
          <div className="absolute -inset-1 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.05),transparent)] animate-spin-slow" />
          <div className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl relative z-10 text-indigo-200 shadow-xl border border-white/15">
            <IconComponent size={32} />
          </div>
        </div>
      );
    case 'plant-zen-guide':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-700 overflow-hidden flex items-center justify-center border-b-4 border-emerald-950 shadow-inner">
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-emerald-300/10" />
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl relative z-10 text-white shadow-lg">
            <IconComponent size={32} />
          </div>
        </div>
      );
    case 'plant-desert-guide':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 overflow-hidden flex items-center justify-center border-b-4 border-red-950 shadow-inner">
          <div className="absolute top-6 left-12 w-8 h-8 rounded-full bg-yellow-300 opacity-20 blur-sm" />
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl relative z-10 text-white shadow-lg">
            <IconComponent size={32} />
          </div>
        </div>
      );
    case 'research-sleep':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 overflow-hidden flex items-center justify-center border-b-4 border-black shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:10px_10px]" />
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl relative z-10 text-indigo-400 shadow-xl border border-white/5">
            <IconComponent size={32} />
          </div>
        </div>
      );
    case 'research-focus':
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-700 overflow-hidden flex items-center justify-center border-b-4 border-purple-950 shadow-inner">
          <div className="absolute w-24 h-24 rounded-full border-4 border-white/5 scale-110" />
          <div className="p-4 bg-white/25 backdrop-blur-md rounded-2xl relative z-10 text-white shadow-xl">
            <IconComponent size={32} />
          </div>
        </div>
      );
    default:
      return (
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center border-b-4 border-blue-900 shadow-inner">
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-lg">
            <IconComponent size={32} />
          </div>
        </div>
      );
  }
}

export function ArchivesScreen({ 
  stats, 
  onUpdateStats, 
  settings, 
  onUpdateSettings, 
  play, 
  onBack 
}: { 
  stats: UserStats;
  onUpdateStats: (s: any | ((prev: any) => any)) => void;
  settings: UserSettings;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
  play: (sound: string) => void;
  onBack: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'challenge' | 'plant' | 'health'>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeLessonStep, setActiveLessonStep] = useState<number>(0);
  const [lessonFinished, setLessonFinished] = useState(false);

  // Read books state stored indexable in settings.readBookIds or locally
  const completedBookIds = useMemo(() => {
    return settings.readBookIds || [];
  }, [settings.readBookIds]);

  // Categories helper
  const categories = [
    { id: 'all', label: 'All Zones', icon: Compass },
    { id: 'challenge', label: 'Protocols', icon: Zap },
    { id: 'plant', label: 'Botany', icon: Flower },
    { id: 'health', label: 'Bio-Hacks', icon: Sun },
  ];

  // Random tip or training book
  const handleLetTrain = () => {
    // Find a book that is not yet read, or a random book
    const unread = KNOWLEDGE_BOOKS.filter(b => !completedBookIds.includes(b.id));
    const targetBook = unread.length > 0 
      ? unread[Math.floor(Math.random() * unread.length)] 
      : KNOWLEDGE_BOOKS[Math.floor(Math.random() * KNOWLEDGE_BOOKS.length)];

    if (targetBook) {
      triggerReadingSession(targetBook);
    }
  };

  const triggerReadingSession = (book: Book) => {
    setSelectedBook(book);
    setActiveLessonStep(0);
    setLessonFinished(false);
    if (settings.soundEnabled) {
      try { play('select_task'); } catch (e) {}
    }
  };

  // Complete current Duolingo reading session
  const completeLesson = () => {
    if (!selectedBook) return;

    const isAlreadyRead = completedBookIds.includes(selectedBook.id);
    
    // Build update payload
    if (!isAlreadyRead) {
      const nextReadBookIds = [...completedBookIds, selectedBook.id];
      onUpdateSettings({
        readBookIds: nextReadBookIds
      });

      // Award +50 XP and +10 Coins!
      onUpdateStats((prev: any) => ({
        ...prev,
        coins: (prev.coins || 0) + 10,
        xp: (prev.xp || 0) + 50
      }));

      if (settings.soundEnabled) {
        try { play('fire_streak'); } catch (e) {}
      }
    }

    setLessonFinished(true);
  };

  // Filter book list
  const filteredBooks = useMemo(() => {
    return KNOWLEDGE_BOOKS.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f1f6ff] pb-24 text-slate-800 font-sans">
      
      {/* Dynamic Header Bar / Duolingo Progress Tracker */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 border-b-2 border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-3 bg-white rounded-2xl shadow-sm border-2 border-slate-200/60 text-slate-700 hover:border-blue-400 active:translate-y-[2px] active:border-b-2 active:shadow-none cursor-pointer transition-all"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
          
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-none uppercase tracking-wide">Nexus Vault</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Read: {completedBookIds.length} / {KNOWLEDGE_BOOKS.length}
              </span>
            </div>
          </div>
        </div>

        {/* Currency Stat */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-sm">
          <span className="text-xs font-black text-amber-700">🪙 {stats.coins || 0}</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 pt-6 space-y-6">

        {/* Dynamic Highlight Card (Matching Let's Train Banner precisely) */}
        <div className="relative bg-gradient-to-br from-[#3b82f6] to-[#1e40af] text-white rounded-[2rem] p-6 shadow-xl overflow-hidden border-2 border-blue-400/25">
          {/* Subtle Decorative abstract backdrop */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -mr-4 -mt-4 blur-xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-44 h-44 border-4 border-white/5 rounded-full" />
          
          <div className="relative z-10 space-y-4">
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
                <Zap className="w-6 h-6 fill-white stroke-[2.5]" />
              </div>
              
              <span className="text-[8.5px] font-black bg-white/20 uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border border-white/15">
                Adaptation Target
              </span>
            </div>

            {/* Title / Body */}
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight leading-snug">
                Stuck on a block? Time to practice a little!
              </h1>
              <p className="text-xs text-blue-100 font-medium leading-relaxed max-w-[90%]">
                Review any active neural files and absorb technical data. Complete learning to earn rewards.
              </p>
            </div>

            {/* CTA action button with high-fidelity Duolingo 3D style */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLetTrain}
              className="w-full bg-white hover:bg-slate-50 text-blue-700 py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-center border-b-6 border-slate-300 hover:border-b-4 active:border-b-0 active:translate-y-[6px] transition-all cursor-pointer shadow-md"
            >
              Let's train
            </motion.button>
          </div>
        </div>

        {/* Search bar and toggle filters (Aligned with Duolingo search and icon filtering) */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dossiers, nodes or lore..."
              className="w-full bg-white text-slate-800 pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-sm shadow-sm placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category sliding selectors */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  if (settings.soundEnabled) {
                    try { play('click'); } catch (e) {}
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-xs font-black uppercase tracking-wider whitespace-nowrap active:translate-y-[2px] transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-700 border-b-4' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 border-b-4'
                }`}
              >
                <CatIcon className="w-4 h-4" />
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content Section: Lists of custom 3D cards */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Available Documents ({filteredBooks.length})
            </h3>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-slate-200 border-b-4 p-8 space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <p className="font-extrabold text-slate-600">No active cognitive logs matched your filter.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                className="text-xs text-blue-600 font-extrabold uppercase tracking-wider bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredBooks.map((book) => {
                const bookIsDone = completedBookIds.includes(book.id);
                // Beautiful category colors for standard chips
                const catInfo = categories.find(c => c.id === book.category);

                return (
                  <motion.div
                    key={book.id}
                    onClick={() => triggerReadingSession(book)}
                    className="group bg-white rounded-3xl border-2 border-slate-200 border-b-6 hover:border-blue-400 cursor-pointer p-4 transition-all hover:translate-y-[2px] hover:border-b-4 active:translate-y-[4px] active:border-b-2 flex flex-col gap-4 shadow-sm relative"
                  >
                    {/* Visual Cover Header */}
                    <BookIllustration bookId={book.id} iconName={book.icon} />

                    {/* Metadata body */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                          #{book.category === 'challenge' ? 'Protocol' : book.category === 'plant' ? 'Flora' : 'BioResearch'}
                        </span>

                        {bookIsDone ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-black text-[9px] bg-emerald-50 border border-emerald-100 px-2 rounded-full uppercase py-0.5">
                            <Check className="w-3 h-3 stroke-[3]" /> Completed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-blue-600 font-black text-[9px] bg-blue-50 border border-blue-100 px-2 rounded-full uppercase py-0.5">
                            <Clock className="w-3 h-3" /> Ready
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                          {book.description}
                        </p>
                      </div>
                    </div>

                    {/* Tags at the bottom */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px]">
                      <span className="text-slate-400 font-bold">
                        {book.category === 'challenge' 
                          ? '#TaskScience' 
                          : book.category === 'plant' 
                            ? '#EcosystemBotany' 
                            : '#BioSystemOverride'}
                      </span>
                      
                      <span className="text-blue-600 font-black uppercase flex items-center gap-1 hover:translate-x-1 transition-transform">
                        Launch <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info node */}
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-8">
          Nexora Digital Memory Core • Active Protocol Beta
        </p>

      </div>

      {/* Immersive interactive lesson modal (Duolingo style) */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 z-50 bg-[#f8fbff] flex flex-col justify-between"
          >
            {/* Modal Head: Lesson progress bar */}
            <div className="bg-white border-b-2 border-slate-200 px-6 py-5 flex items-center justify-between gap-6">
              <button 
                onClick={() => setSelectedBook(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>

              {/* Progress bars */}
              <div className="flex-1 flex gap-2">
                {selectedBook.content.sections.map((_, idx) => {
                  const isActive = idx === activeLessonStep;
                  const isCompleted = idx < activeLessonStep;
                  return (
                    <div 
                      key={idx} 
                      className="h-3 flex-1 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-200/50"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Step label */}
              <span className="text-xs font-black text-slate-400 uppercase">
                {activeLessonStep + 1} / {selectedBook.content.sections.length}
              </span>
            </div>

            {/* Modal Body: Active chapter step */}
            <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col justify-center items-center">
              <div className="max-w-md w-full space-y-8">
                
                {lessonFinished ? (
                  /* Completed Lesson Stats block */
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8"
                  >
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-20 scale-150 animate-pulse" />
                      <div className="w-28 h-28 bg-amber-100 rounded-[2.5rem] border-4 border-amber-300 shadow-xl flex items-center justify-center mx-auto relative z-10 text-amber-500">
                        <Trophy className="w-14 h-14" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-none uppercase">
                        Cognitive Sync Success!
                      </h2>
                      <p className="text-sm font-semibold text-slate-500">
                        You've fully integrated the technical files from <span className="text-blue-600 font-extrabold">{selectedBook.title}</span>.
                      </p>
                    </div>

                    {/* Interactive Reward Badges */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border-2 border-slate-200 border-b-4 p-5 rounded-2xl flex flex-col items-center">
                        <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider">
                          Coins Gained
                        </span>
                        <span className="text-2xl font-black text-slate-900 mt-2">
                          +10 🪙
                        </span>
                      </div>
                      <div className="bg-white border-2 border-slate-200 border-b-4 p-5 rounded-2xl flex flex-col items-center">
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider">
                          XP Synchronized
                        </span>
                        <span className="text-2xl font-black text-slate-900 mt-2">
                          +50 ✨
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex gap-4 items-center justify-start text-left">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-sm border border-blue-100">
                        <img 
                          src="https://api.dicebear.com/7.x/bottts/svg?seed=Nexora&backgroundColor=b6e3f4" 
                          alt="AI Guide" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest leading-none">Nexora Protocol AI</p>
                        <p className="text-xs text-blue-600 font-bold mt-1 leading-tight">
                          "Excellent work, comrade! Higher wisdom yields complete discipline."
                        </p>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  /* Standard Lesson screen details with high fidelity text and automated reactions */
                  <div className="space-y-6">
                    
                    {/* Visual Mascot Bubble (Duolingo Style overlay) */}
                    <div className="flex gap-4 items-start bg-blue-50 border-2 border-blue-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full -mr-8 -mt-8" />
                      
                      <div className="w-14 h-14 bg-white rounded-2xl border border-blue-150 flex items-center justify-center p-1 shrink-0 shadow-md">
                        <img 
                          src="https://api.dicebear.com/7.x/bottts/svg?seed=Nexora&backgroundColor=b6e3f4" 
                          alt="AI Guide" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="space-y-1 relative z-10 flex-1">
                        <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest leading-none">Mascot Guide</p>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">
                          {activeLessonStep === 0 
                            ? "Analyzing structural pathways..." 
                            : activeLessonStep === 1 
                              ? "Superb analytical response!" 
                              : "This is crucial for your streak, bro!"}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Follow along and assimilate the optimized parameters.
                        </p>
                      </div>
                    </div>

                    {/* Section Text Content card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeLessonStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-3xl border-2 border-slate-200 border-b-6 p-6 space-y-4 shadow-sm"
                      >
                        <h3 className="text-lg font-black text-blue-700 leading-none uppercase tracking-tight">
                          {selectedBook.content.sections[activeLessonStep]?.heading}
                        </h3>
                        
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {selectedBook.content.sections[activeLessonStep]?.text}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                  </div>
                )}

              </div>
            </div>

            {/* Modal Bottom: Command Bar buttons (Chunky tactile buttons) */}
            <div className="bg-white border-t-2 border-slate-200 px-6 py-6 flex items-center justify-center">
              <div className="max-w-md w-full">
                {lessonFinished ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedBook(null);
                      if (settings.soundEnabled) {
                        try { play('click'); } catch (e) {}
                      }
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-[0.15em] border-b-6 border-emerald-700 hover:border-b-4 active:border-b-0 active:translate-y-[6px] transition-all cursor-pointer shadow-md text-center"
                  >
                    Finish Lesson
                  </motion.button>
                ) : (
                  <div className="flex gap-4">
                    {activeLessonStep > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveLessonStep(prev => prev - 1);
                          if (settings.soundEnabled) {
                            try { play('click'); } catch (e) {}
                          }
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 px-6 rounded-2xl font-black text-sm uppercase border-b-6 border-slate-300 active:border-b-0 active:translate-y-[6px] transition-all cursor-pointer"
                      >
                        Back
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const nextStep = activeLessonStep + 1;
                        if (nextStep < selectedBook.content.sections.length) {
                          setActiveLessonStep(nextStep);
                          if (settings.soundEnabled) {
                            try { play('click'); } catch (e) {}
                          }
                        } else {
                          completeLesson();
                        }
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-[0.15em] border-b-6 border-blue-800 hover:border-b-4 active:border-b-0 active:translate-y-[6px] transition-all cursor-pointer shadow-md text-center text-ellipsis"
                    >
                      {activeLessonStep + 1 === selectedBook.content.sections.length ? 'Secure Synchronization' : 'Next Node'}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
