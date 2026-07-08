import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Plus, X, Tag, Calendar, History, Trash2, Save, ArrowLeft, Pencil, BookOpen, PenTool, Brain, Sparkles, ChevronLeft, Zap, Shield, Wand2, Loader2 } from 'lucide-react';
import { UserStats } from '../types';
import { analyzeNoteMood } from '../services/aiService';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { SocialCircle, Screen } from '../types';
import { NexusLinkRenderer } from './NexusLinkRenderer';
import { MascotV2 } from './MascotV2';
import { db, auth } from '../firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

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

export function NotebookScreen({ 
  stats, 
  setStats, 
  onBack, 
  showToast,
  setActiveScreen,
  circles = []
}: { 
  stats: UserStats, 
  setStats: (s: UserStats | ((prev: UserStats) => UserStats)) => void, 
  onBack: () => void, 
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void,
  setActiveScreen?: (s: Screen) => void,
  circles?: SocialCircle[]
}) {
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

    // Sync to notebooks Firestore collection under user UID
    const user = auth.currentUser;
    if (user) {
      const noteDocRef = doc(db, "notebooks", user.uid);
      setDoc(noteDocRef, {
        userId: user.uid,
        userName: user.displayName || "Champion",
        userEmail: user.email || `${user.uid}@nexora.app`,
        notes: newEntries,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch((err) => {
        console.error("Failed to write to notebooks collection", err);
      });
    }

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
               <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-blue-900 tracking-tight leading-none italic">Brain Dump</h2>
                  <div className="w-12 h-12 -mt-2 -mb-2 overflow-visible flex items-center justify-center select-none">
                     <MascotV2 className="w-full h-full" isSmiling={true} />
                  </div>
               </div>
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
           <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
              <div className="w-32 h-32 relative">
                <MascotV2 className="w-full h-full" isSmiling={false} />
              </div>
              <p className="font-black uppercase tracking-[0.3em] text-[10px] text-blue-900/40 text-center">
                No brain dumps yet, bro!<br/>Tap the '+' button above to manifest your first thought!
              </p>
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
                       <p className="text-sm font-medium text-blue-900/40 line-clamp-3 leading-relaxed italic">{"\""}<NexusLinkRenderer text={note.text.split(': ')[1] || note.text} circles={circles} setActiveScreen={setActiveScreen} />{"\""}</p>
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

             <div className="flex flex-col gap-5 flex-1 overflow-y-auto mb-4">
                {/* Title Section */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1">
                    <PenTool size={10} /> Manifest Title / Topic
                  </label>
                  <input 
                    autoFocus
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter note title..."
                    className="w-full bg-transparent text-lg font-bold text-black border-b-2 border-stone-200 focus:border-emerald-500 focus:outline-none pb-2 placeholder:text-stone-300"
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen size={10} /> Thought Flow / Manifest Body
                  </label>
                  <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write body content of your dump here..."
                    className="w-full h-full min-h-[120px] bg-transparent text-sm font-medium text-black focus:outline-none resize-none leading-relaxed placeholder:text-stone-300 border border-stone-200 rounded-2xl p-4 bg-stone-50 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
             </div>

             <AnimatePresence>
               {neuralInsight && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   className="mb-4 p-4 bg-blue-900/5 rounded-3xl border border-blue-900/10 space-y-3"
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

             <div className="pt-4 flex items-center justify-between border-t border-stone-200">
                <div className="flex gap-2">
                  {/* Delete Button (Compact) */}
                  <button 
                    title="Delete Note"
                    onClick={() => {
                      const newEntries = entries.filter((e: any) => e.id !== activeNote?.id);
                      setStats({ ...stats, gratitudeEntries: newEntries });
                      
                      // Update notebooks Firestore collection under user UID
                      const user = auth.currentUser;
                      if (user) {
                        const noteDocRef = doc(db, "notebooks", user.uid);
                        setDoc(noteDocRef, {
                          userId: user.uid,
                          userName: user.displayName || "Champion",
                          userEmail: user.email || `${user.uid}@nexora.app`,
                          notes: newEntries,
                          updatedAt: serverTimestamp(),
                        }, { merge: true }).catch((err) => {
                          console.error("Failed to update notes in notebooks collection after deletion", err);
                        });
                      }

                      setIsCreating(false);
                      showToast('Note Deleted', 'info');
                    }}
                    className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 bg-red-500/10 rounded-xl active:scale-90 transition-all border border-red-200/40"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  {/* Neural Mode Button (Compact) */}
                  <button 
                    onClick={handleNeuralAnalysis}
                    disabled={isAnalyzing || !content.trim()}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border ${
                      isAnalyzing 
                        ? 'bg-blue-50 border-blue-100 text-blue-400' 
                        : 'bg-blue-950 text-white border-blue-900 hover:bg-blue-900 active:scale-95'
                    }`}
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                    {isAnalyzing ? 'Analyzing...' : 'Neural Mode'}
                  </button>
                </div>

                {/* Finish Button (Compact) */}
                <button 
                  onClick={handleSave}
                  className="px-5 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center gap-2 border border-emerald-500 shadow-sm"
                >
                  <Save size={14} /> Commit
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
