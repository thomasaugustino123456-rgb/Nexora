import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, X, Tag, Calendar, History, Trash2, Save, ArrowLeft, Pencil, BookOpen, PenTool, Brain, Sparkles, ChevronLeft, Zap, Shield, Wand2, Loader2 } from 'lucide-react';
import { UserStats } from '../types';
import { analyzeNoteMood } from '../services/aiService';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';

const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, 10 + Math.random() * 20);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return <p>{displayedText}</p>;
};

export function NotebookScreen({ stats, setStats, onBack, showToast }: { stats: UserStats, setStats: (s: UserStats | ((prev: UserStats) => UserStats)) => void, onBack: () => void, showToast: (msg: string, type?: 'success' | 'info' | 'error') => void }) {
  const [activeNote, setActiveNote] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Growth');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [neuralInsight, setNeuralInsight] = useState<any>(null);
  
  const entries = stats.gratitudeEntries || [];

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    const newEntry = {
      id: activeNote?.id || Date.now().toString(),
      text: `${title}: ${content}`,
      date: new Date().toISOString(),
      category: category,
      neuralInsight: neuralInsight
    };
    
    let newEntries;
    if (activeNote) {
      newEntries = entries.map((e: any) => e.id === activeNote.id ? newEntry : e);
    } else {
      newEntries = [newEntry, ...entries];
    }
    
    setStats({ ...stats, gratitudeEntries: newEntries });
    setActiveNote(newEntry);
    setIsCreating(false);
    showToast('Manifest Saved! 📓', 'success');
  };

  const handleNeuralAnalysis = async () => {
    if (!content.trim()) return;
    vibrate(VIBRATION_PATTERNS.HEAVY_LIGHT);
    setIsAnalyzing(true);
    const result = await analyzeNoteMood(title, content);
    setNeuralInsight(result);
    setIsAnalyzing(false);
    if (result) {
      showToast('Neural Insight Generated!', 'success');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto w-full flex flex-col h-[85vh] bg-stone-50/50 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative"
    >
      <div className="p-8 pb-4 flex items-center justify-between relative z-10">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-blue-900/60 hover:text-blue-900 active:scale-95 transition-all">
               <ArrowLeft size={24} />
            </button>
            <div>
               <h2 className="text-3xl font-black text-blue-900 tracking-tight leading-none italic">Brain Dump</h2>
               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-1">Mental Nexus Storage</p>
            </div>
         </div>
         <button 
           onClick={() => { setActiveNote(null); setTitle(''); setContent(''); setIsCreating(true); }}
           className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg border-2 border-emerald-500 active:scale-90 transition-all hover:bg-emerald-700 hover:rotate-3"
         >
           <Plus size={24} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar">
         {entries.length === 0 && !isCreating ? (
           <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 pointer-events-none grayscale">
              <Brain size={120} />
              <p className="font-black uppercase tracking-[0.5em] text-xs">Awaiting Genius Output...</p>
           </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {entries.map((note: any) => (
                 <motion.div 
                   key={note.id} 
                   layoutId={note.id}
                   onClick={() => { 
                     setActiveNote(note); 
                     // Try to split title and content back
                     const parts = note.text.split(': ');
                     setTitle(parts[0] || '');
                     setContent(parts.slice(1).join(': ') || '');
                     setIsCreating(true); 
                   }}
                   className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group active:scale-[0.98] relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 space-y-3">
                       <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">{note.category || 'Focus'}</span>
                       <h3 className="text-xl font-black text-blue-900 line-clamp-1">{note.text.split(': ')[0]}</h3>
                       <p className="text-sm font-medium text-blue-900/40 line-clamp-3 leading-relaxed italic">"{note.text.split(': ')[1] || note.text}"</p>
                    </div>
                 </motion.div>
               ))}
            </div>
         )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 bg-stone-50 z-50 flex flex-col p-8"
          >
             <div className="flex items-center justify-between mb-8">
                <button onClick={() => setIsCreating(false)} className="text-blue-900/40 font-black flex items-center gap-2 hover:text-blue-900 transition-colors">
                   <ChevronLeft size={20} /> Close Editor
                </button>
                <div className="flex gap-2">
                   {['Growth', 'Idea', 'Vibe', 'System'].map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => setCategory(cat)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${category === cat ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-blue-900/40'}`}
                     >
                       {cat}
                     </button>
                   ))}
                </div>
             </div>

             <input 
               autoFocus
               type="text" value={title} onChange={e => setTitle(e.target.value)}
               placeholder="MANIFEST TITLE..."
               className="w-full bg-transparent text-4xl font-black text-blue-900 uppercase tracking-tighter focus:outline-none mb-6 placeholder:opacity-10"
             />

             <textarea 
               value={content} onChange={e => setContent(e.target.value)}
               placeholder="START THE FLOW OF FOCUS..."
               className="w-full flex-1 bg-transparent text-lg font-medium text-blue-900/60 focus:outline-none resize-none placeholder:opacity-10 leading-relaxed italic"
             />

             <AnimatePresence>
               {neuralInsight && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   className="mb-6 p-6 bg-blue-900/5 rounded-3xl border border-blue-900/10 space-y-3"
                 >
                   <div className="flex items-center gap-2 text-blue-600">
                     <Sparkles size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Neural Insight Protocol</span>
                   </div>
                   <div>
                     <p className="text-xs font-bold text-blue-900/40 uppercase mb-1">Detected Mood: {neuralInsight.mood}</p>
                     <div className="text-sm font-medium text-blue-900">
                       <Typewriter text={neuralInsight.neural_insight} />
                     </div>
                   </div>
                   <div className="flex items-center gap-2 pt-2 border-t border-blue-900/5">
                     <Zap size={14} className="text-amber-500" />
                     <p className="text-[10px] font-black text-blue-900/60 uppercase">Action: {neuralInsight.biological_recommendation}</p>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="pt-8 flex items-center justify-between">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const newEntries = entries.filter((e: any) => e.id !== activeNote?.id);
                      setStats({ ...stats, gratitudeEntries: newEntries });
                      setIsCreating(false);
                      showToast('Note Deleted', 'info');
                    }}
                    className="p-5 text-red-400 hover:text-red-600 active:scale-90 transition-all bg-red-500/5 rounded-2xl"
                  >
                    <Trash2 size={24} />
                  </button>
                  <button 
                    onClick={handleNeuralAnalysis}
                    disabled={isAnalyzing || !content.trim()}
                    className={`flex items-center gap-3 px-6 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                      isAnalyzing ? 'bg-blue-100 text-blue-400' : 'bg-blue-900 text-white shadow-xl shadow-blue-900/20 hover:scale-105'
                    }`}
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                    {isAnalyzing ? 'Analyzing Node...' : 'Neural Mode'}
                  </button>
                </div>
                <button 
                  onClick={handleSave}
                  className="px-10 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center gap-3"
                >
                  <Save size={20} /> Commit to Memory
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
