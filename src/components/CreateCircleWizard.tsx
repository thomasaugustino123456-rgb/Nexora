import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Image as ImageIcon, Check } from 'lucide-react';
import { SocialCircle } from '../types';

interface CreateCircleWizardProps {
  onClose: () => void;
  onComplete: (data: any) => void;
  isSubmitting: boolean;
  initialData?: SocialCircle | null;
}

export function CreateCircleWizard({ onClose, onComplete, isSubmitting, initialData }: CreateCircleWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    category: initialData?.category || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    rules: initialData?.rules || [] as string[],
    icon: initialData?.icon || '🏮',
    color: initialData?.color || 'bg-blue-100',
    customCategory: ''
  });

  const categories = [
    { id: 'Pushups', icon: '🦾' },
    { id: 'Water', icon: '💧' },
    { id: 'Breathing', icon: '🌬️' },
    { id: 'Art', icon: '🎨' },
    { id: 'Focus', icon: '🧠' },
    { id: 'Meditation', icon: '🧘' },
    { id: 'Gratitude', icon: '🙏' },
    { id: 'Custom', icon: '✨' }
  ];

  const emojis = ['🏮', '🦾', '🧠', '🌿', '⚡', '🏆', '⚓', '🛡️', '🎯', '🔥', '💎', '🌈'];
  const colors = ['bg-blue-100', 'bg-orange-100', 'bg-green-100', 'bg-purple-100', 'bg-red-100', 'bg-yellow-100'];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete({ ...data, category: data.category === 'Custom' ? data.customCategory : data.category });
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-blue-900/60 backdrop-blur-xl p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="bg-blue-600 p-8 text-white relative shrink-0">
          <div className="relative z-10">
            <h3 className="text-2xl font-black italic uppercase tracking-tight">Initialize Node</h3>
            <p className="text-xs font-bold text-white/60 mt-1">Refining Sector {step} of 3</p>
          </div>
          <button onClick={onClose} className="absolute top-8 right-8 p-1 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <div className="absolute top-0 right-0 w-32 h-full flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
             <Plus size={160} className="rotate-12 translate-x-12" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Activity Nucleus</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setData(prev => ({ ...prev, category: cat.id }))}
                        className={`p-4 rounded-3xl border-2 transition-all text-left flex items-center gap-3 ${data.category === cat.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className={`text-sm font-bold ${data.category === cat.id ? 'text-blue-600' : 'text-slate-500'}`}>{cat.id}</span>
                      </button>
                    ))}
                  </div>
                  {data.category === 'Custom' && (
                    <motion.input 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text" 
                      placeholder="Specify focus (e.g. Weightlifting)"
                      value={data.customCategory}
                      onChange={(e) => setData(prev => ({ ...prev, customCategory: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder-slate-300 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Node Identity</label>
                    <input 
                      type="text" 
                      placeholder="Collective Name (e.g. The Iron Protocol)"
                      value={data.name}
                      onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mission Statement</label>
                    <textarea 
                      placeholder="Brief description of the node's focus..."
                      value={data.description}
                      onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold h-24 resize-none outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Rules</label>
                    <textarea 
                      placeholder="Rule 1\nRule 2\nRule 3..."
                      onChange={e => setData(prev => ({ ...prev, rules: e.target.value.split('\n').filter(r => r.trim()) }))}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-[11px] font-bold h-24 resize-none outline-none focus:ring-2 focus:ring-blue-100 placeholder-slate-300"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col items-center gap-6">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Visual Signal</label>
                  <div className={`w-28 h-28 rounded-[32px] ${data.color} flex items-center justify-center text-5xl shadow-2xl relative overflow-hidden`}>
                     <span className="relative z-10">{data.icon}</span>
                     <div className="absolute inset-0 bg-white/10" />
                  </div>
                  
                  <div className="grid grid-cols-6 gap-3">
                    {emojis.map(emoji => (
                      <button 
                        key={emoji}
                        onClick={() => setData(prev => ({ ...prev, icon: emoji }))}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${data.icon === emoji ? 'bg-blue-100 scale-110 shadow-md ring-2 ring-blue-500' : 'bg-slate-50 hover:bg-slate-100 grayscale hover:grayscale-0'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {colors.map(color => (
                      <button 
                        key={color}
                        onClick={() => setData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-4 transition-all ${color} ${data.color === color ? 'border-primary scale-125' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                  
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 tracking-tighter hover:bg-blue-50 px-4 py-2 rounded-full transition-all">
                    <ImageIcon size={14} /> Upload Custom Signal (Optional)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 border-t border-slate-50 shrink-0">
          <div className="flex gap-4">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
              >
                Back
              </button>
            )}
            <button 
              disabled={isSubmitting || (step === 1 && !data.category) || (step === 2 && (!data.name || !data.description))}
              onClick={handleNext}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Syncing...' : step === 3 ? 'Initialize Node 🏮' : 'Continue Protocol'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
