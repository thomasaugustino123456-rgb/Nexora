import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Users, ShieldAlert, Sparkles, Globe, Lock, HelpCircle, Award } from 'lucide-react';
import { SocialCircle } from '../types';

interface CreateGroupWizardProps {
  onClose: () => void;
  onComplete: (data: any) => void;
  isSubmitting: boolean;
  initialData?: SocialCircle | null;
}

export function CreateGroupWizard({ onClose, onComplete, isSubmitting, initialData }: CreateGroupWizardProps) {
  const [step, setStep] = useState(1);
  const iconInputRef = React.useRef<HTMLInputElement>(null);
  const bgInputRef = React.useRef<HTMLInputElement>(null);

  const handleIconLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setData(prev => ({ ...prev, customIconUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setData(prev => ({ ...prev, customBgUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [data, setData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'General',
    description: initialData?.description || '',
    rules: initialData?.rules || ['No spam or promo.', 'Respect other members.', 'Keep progress tracking honest.'],
    icon: initialData?.icon || '🏮',
    color: initialData?.color || 'bg-blue-100',
    // Reddit-style detailed questions
    groupPurpose: 'Sharing Progress',
    visibility: 'public',
    weeklyCommitment: 'Daily',
    customCategory: '',
    customIconUrl: initialData?.customIconUrl || null as string | null,
    customBgUrl: initialData?.customBgUrl || null as string | null
  });

  const purposes = [
    { id: 'Sharing Progress', label: 'Sharing Progress & Streaks', desc: 'Post daily updates, motivate and keep each other accountable' },
    { id: 'Help & FAQ', label: 'Asking Help & FAQs', desc: 'Ask community experts, troubleshoot routines' },
    { id: 'Events', label: 'Organizing Group Challenges', desc: 'Compete in limited-time custom workout milestones' },
    { id: 'General Chat', label: 'Chill & Social Chat', desc: 'Converse on topics, share vibes and ideas' }
  ];

  const visibilityOptions = [
    { id: 'public', label: 'Public (Recommended)', desc: 'Anyone can search for and join this n/ group.', icon: <Globe size={18} className="text-emerald-500" /> },
    { id: 'restricted', label: 'Restricted Node', desc: 'Only approved users can post, but anyone can view.', icon: <Lock size={18} className="text-indigo-500" /> }
  ];

  const categories = [
    { id: 'General', icon: '🌍' },
    { id: 'Pushups', icon: '🦾' },
    { id: 'Water', icon: '💧' },
    { id: 'Breathing', icon: '🌬️' },
    { id: 'Art', icon: '🎨' },
    { id: 'Focus', icon: '🧠' },
    { id: 'Meditation', icon: '🧘' },
    { id: 'Custom', icon: '✨' }
  ];

  const emojis = ['🏮', '🦾', '🧠', '🌿', '⚡', '🏆', '⚓', '🛡️', '🎯', '🔥', '💎', '🌈', '🛸', '🚀', '👑', '👾'];
  const colors = [
    'from-blue-400 to-blue-600 bg-blue-500',
    'from-emerald-400 to-emerald-600 bg-emerald-500',
    'from-rose-400 to-rose-600 bg-rose-500',
    'from-amber-400 to-amber-600 bg-amber-500',
    'from-violet-400 to-violet-600 bg-violet-500',
    'from-cyan-400 to-cyan-600 bg-cyan-500'
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Validate and clean up name
      const formattedName = data.name.replace(/[^a-zA-Z0-9]/g, '');
      onComplete({
        ...data,
        name: formattedName,
        category: data.category === 'Custom' ? data.customCategory : data.category,
        rules: data.rules.filter(r => r.trim() !== '')
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] border border-slate-100"
      >
        {/* Header banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shrink-0 relative">
          <div className="relative z-10 flex items-center justify-between">
             <div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-blue-50">REDDIT PROTOCOL</span>
                <h3 className="text-xl font-black mt-1 uppercase tracking-tight">{initialData ? 'Update n/ Subcommunity' : 'Initialize n/ Subcommunity'}</h3>
                <p className="text-[10px] text-white/70 mt-1 uppercase tracking-widest font-semibold">Step {step} of 3</p>
             </div>
             <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                <X size={20} />
             </button>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
             <Users size={120} />
          </div>
        </div>

        {/* Dynamic step body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">1. n/ Community Intent</h4>
                   <p className="text-xs text-slate-400">Specify why you are setting up this node in the global network.</p>
                </div>

                <div className="space-y-3">
                  {purposes.map(purp => (
                    <button
                      type="button"
                      key={purp.id}
                      onClick={() => setData(prev => ({ ...prev, groupPurpose: purp.id }))}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${data.groupPurpose === purp.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{purp.label}</span>
                        {data.groupPurpose === purp.id && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{purp.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility Settings</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {visibilityOptions.map(opt => (
                       <button
                         type="button"
                         key={opt.id}
                         onClick={() => setData(prev => ({ ...prev, visibility: opt.id }))}
                         className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${data.visibility === opt.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                       >
                         <div className="mt-1">{opt.icon}</div>
                         <div>
                           <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                           <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</p>
                         </div>
                       </button>
                     ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">2. Subcommunity Parameters</h4>
                   <p className="text-xs text-slate-400">Rules, identifiers, objectives of the collective.</p>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                   <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subreddit Name ID</label>
                      <span className="text-[9px] text-slate-400 font-bold">Letters & Numbers only</span>
                   </div>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">n/</span>
                      <input 
                        type="text"
                        placeholder="e.g. DailyPushups"
                        value={data.name}
                        onChange={e => setData(prev => ({ ...prev, name: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                        maxLength={20}
                      />
                   </div>
                </div>

                {/* Vision / Description */}
                <div className="space-y-1.5">
                   <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Charter / Description</label>
                      <span className="text-[9px] text-slate-300 font-bold">{data.description.length}/100</span>
                   </div>
                   <textarea
                     placeholder="Explain what members of this n/ group should achieve..."
                     value={data.description}
                     onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 h-20 outline-none resize-none focus:ring-2 focus:ring-blue-100"
                     maxLength={100}
                   />
                </div>

                {/* Rules List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Group Guidelines & Charter (Rules)</label>
                   <textarea
                     placeholder="Rule 1&#10;Rule 2&#10;Rule 3..."
                     value={data.rules.join('\n')}
                     onChange={e => setData(prev => ({ ...prev, rules: e.target.value.split('\n') }))}
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 h-24 outline-none resize-none focus:ring-2 focus:ring-blue-100 placeholder-slate-300"
                   />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex flex-col items-center justify-center p-2"
              >
                <div className="text-center space-y-1 w-full">
                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">3. Spectrum Visualizer</h4>
                   <p className="text-xs text-slate-400">Design the custom landing beacon for members to spot.</p>
                </div>

                {/* Preview Badge with Custom Background Preview */}
                <div className="relative w-full max-w-sm h-32 rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-50 flex items-center p-6">
                   {data.customBgUrl ? (
                      <img src={data.customBgUrl} className="absolute inset-0 w-full h-full object-cover" />
                   ) : (
                      <div className={`absolute inset-0 bg-gradient-to-tr ${data.color} opacity-90`} />
                   )}
                   <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                   
                   <div className="relative z-10 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-3xl overflow-hidden shrink-0">
                         {data.customIconUrl ? (
                            <img src={data.customIconUrl} className="w-full h-full object-cover" />
                         ) : (
                            <span>{data.icon}</span>
                         )}
                      </div>
                      <div className="text-white drop-shadow-md">
                         <h5 className="font-black text-base">n/{data.name || 'YourGroupName'}</h5>
                         <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">{data.category} Spectrum</p>
                      </div>
                   </div>
                </div>

                {/* Custom Image Uploaders (Icon & Theme Background) */}
                <div className="grid grid-cols-2 gap-4 w-full pt-1">
                   <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Device Group Icon</p>
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${data.customIconUrl ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                         <Users size={14} />
                         <span>{data.customIconUrl ? 'Icon Uploaded!' : 'Choose Icon'}</span>
                      </button>
                      <input 
                        type="file" 
                        ref={iconInputRef} 
                        onChange={handleIconLocalUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <p className="text-[8px] text-slate-400 leading-normal">Replaces the emoji sticker badge with a custom PNG/JPG.</p>
                   </div>

                   <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Theme Background</p>
                      <button
                        type="button"
                        onClick={() => bgInputRef.current?.click()}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${data.customBgUrl ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                         <Sparkles size={14} />
                         <span>{data.customBgUrl ? 'Bg Uploaded!' : 'Choose Banner'}</span>
                      </button>
                      <input 
                        type="file" 
                        ref={bgInputRef} 
                        onChange={handleBgLocalUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <p className="text-[8px] text-slate-400 leading-normal">Replaces the solid color banner with a custom layout photo.</p>
                   </div>
                </div>

                {/* Emojis Selector */}
                <div className="space-y-2 w-full pt-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Or Select Node Sticker Sticker</p>
                  <div className="grid grid-cols-8 gap-1.5 max-w-sm mx-auto">
                    {emojis.map(emoji => (
                       <button
                         type="button"
                         key={emoji}
                         onClick={() => setData(prev => ({ ...prev, icon: emoji, customIconUrl: null }))}
                         className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-base hover:scale-105 transition-all ${data.icon === emoji && !data.customIconUrl ? 'bg-blue-50 ring-2 ring-blue-500 shadow-sm scale-105' : 'bg-slate-50 text-slate-500'}`}
                       >
                         {emoji}
                       </button>
                    ))}
                  </div>
                </div>

                {/* Gradients selection */}
                <div className="space-y-2 w-full pt-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Or Select Spectrum Flare Base</p>
                   <div className="flex justify-center gap-3">
                     {colors.map(col => {
                        const bgClass = col.split(' ').slice(0, 2).join(' ');
                        return (
                          <button
                            type="button"
                            key={col}
                            onClick={() => setData(prev => ({ ...prev, color: col, customBgUrl: null }))}
                            className={`w-7 h-7 rounded-full border-2 transition-all bg-gradient-to-tr ${bgClass} ${data.color === col && !data.customBgUrl ? 'border-blue-600 scale-125 shadow' : 'border-white'}`}
                          />
                        );
                     })}
                   </div>
                </div>

                {/* Category selector */}
                <div className="w-full pt-4 border-t border-slate-100 flex items-center gap-3 justify-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector:</span>
                   <div className="flex gap-1.5 overflow-x-auto max-w-xs no-scrollbar py-1">
                     {categories.map(c => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => setData(prev => ({ ...prev, category: c.id }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${data.category === c.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          <span>{c.icon}</span>
                          <span>{c.id}</span>
                        </button>
                     ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="p-6 bg-slate-50/60 border-t border-slate-100 shrink-0 flex gap-4">
           <button
             type="button"
             onClick={() => {
                if (step > 1) setStep(step - 1);
                else onClose();
             }}
             className="flex-1 py-3 bg-white border border-slate-200 font-bold text-slate-400 hover:text-slate-600 text-xs uppercase tracking-widest rounded-xl transition-all"
           >
              {step === 1 ? 'Cancel' : 'Back'}
           </button>
           <button
             type="button"
             disabled={isSubmitting || (step === 2 && (!data.name || !data.description))}
             onClick={handleNext}
             className="flex-[2] py-3 bg-blue-600 font-bold text-white text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-200"
           >
              {isSubmitting ? 'Transmitting...' : step === 3 ? 'Deploy Node 🏮' : 'Next Step'}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
