import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Image as ImageIcon, Check, Landmark, Shield, HelpCircle, Lock, Eye, Star, Palette, Award, Sparkles, Sliders, Trash2 } from 'lucide-react';
import { SocialCircle } from '../types';

interface CreateCircleWizardProps {
  onClose: () => void;
  onComplete: (data: any) => void;
  isSubmitting: boolean;
  initialData?: SocialCircle | null;
}

export function CreateCircleWizard({ onClose, onComplete, isSubmitting, initialData }: CreateCircleWizardProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(initialData?.category || '');
  const [communityType, setCommunityType] = useState<'public' | 'restricted' | 'private'>('public');
  
  // Identifiers state
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [whatGroupIsFor, setWhatGroupIsFor] = useState('');
  const [rolesInput, setRolesInput] = useState('Creator, Moderator, Contributor');
  
  // Step 4 state
  const [primaryPurpose, setPrimaryPurpose] = useState('');

  // Step 5 state (Aesthetics & Uploads)
  const [selectedSticker, setSelectedSticker] = useState('✨');
  const [selectedColor, setSelectedColor] = useState('bg-indigo-100');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [customBgUrl, setCustomBgUrl] = useState('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);

  // 20 Interactive community categories requested
  const categories20 = [
    { name: "Anime & Cosplay", icon: "🎏" },
    { name: "Art", icon: "🎨" },
    { name: "Collectibles & other hobbies", icon: "🧩" },
    { name: "Education", icon: "📚" },
    { name: "Fashion & Beauty", icon: "💄" },
    { name: "Food & Drink", icon: "🍹" },
    { name: "Games", icon: "🎮" },
    { name: "Health", icon: "🥦" },
    { name: "Home & Garden", icon: "🏡" },
    { name: "Movie & TV", icon: "🍿" },
    { name: "Music", icon: "🎵" },
    { name: "Culture", icon: "⛩️" },
    { name: "Place & Travel", icon: "✈️" },
    { name: "News", icon: "📰" },
    { name: "Pop Culture", icon: "⚡" },
    { name: "Q&As & Stories", icon: "💬" },
    { name: "Reading and Writing", icon: "✍️" },
    { name: "Sports", icon: "⚽" },
    { name: "Wellness", icon: "🧘" },
    { name: "Science", icon: "🔬" }
  ];

  // Dynamic context stickers based on Category selection
  const contextualStickers = useMemo(() => {
    const key = category.toLowerCase();
    if (key.includes("game")) return ["🎮", "🕹️", "👾", "🏆", "⚔️", "🎯", "🔥", "👑"];
    if (key.includes("anime") || key.includes("cosplay")) return ["🌸", "🏮", "🦊", "🍥", "🎭", "🍱", "✨", "💫"];
    if (key.includes("art")) return ["🎨", "🖌️", "📐", "✏️", "🗿", "🏺", "🖼️", "🌈"];
    if (key.includes("music")) return ["🎵", "🎹", "🎸", "🎧", "🎤", "🎷", "🥁", "🎶"];
    if (key.includes("food") || key.includes("drink")) return ["🍹", "🍕", "🍔", "🍣", "🌮", "🧁", "🍩", "🍓"];
    if (key.includes("health") || key.includes("wellness") || key.includes("sport")) return ["🧘", "⚽", "🏋️", "🏃", "🎽", "🥑", "🥦", "🍎"];
    return ["✨", "🏮", "🦾", "🧠", "🌿", "⚡", "🏆", "🛡️", "🎯", "👑", "🧿", "🍀"];
  }, [category]);

  const colors = [
    { class: 'bg-indigo-100', text: 'text-indigo-600', hex: '#E0E7FF' },
    { class: 'bg-emerald-100', text: 'text-emerald-600', hex: '#D1FAE5' },
    { class: 'bg-amber-100', text: 'text-amber-600', hex: '#FEF3C7' },
    { class: 'bg-rose-100', text: 'text-rose-600', hex: '#FFE4E6' },
    { class: 'bg-purple-100', text: 'text-purple-600', hex: '#F3E8FF' },
    { class: 'bg-sky-100', text: 'text-sky-600', hex: '#E0F2FE' }
  ];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  // Live File reader helpers (Faster base64 mapping)
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingIcon(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomIconUrl(reader.result as string);
      setIsUploadingIcon(false);
    };
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBg(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomBgUrl(reader.result as string);
      setIsUploadingBg(false);
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = () => {
    const rulesArray = rolesInput.split(',').map(r => r.trim()).filter(Boolean);
    const finalData = {
      name: name.trim(),
      description: description.trim(),
      category: category,
      icon: customIconUrl ? "🖼️" : (selectedSticker || "🏮"),
      color: selectedColor,
      communityType: communityType,
      whatGroupIsFor: whatGroupIsFor.trim(),
      roles: rulesArray,
      primaryPurpose: primaryPurpose || "Collaboration",
      bgThemeColor: selectedColor,
      sticker: selectedSticker,
      customIconUrl: customIconUrl || null,
      customBgUrl: customBgUrl || null,
      rules: ["Be kind and respectful", "No spamming or self-promotion", "Follow community-specific guides"]
    };
    onComplete(finalData);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] border border-slate-100"
      >
        {/* Header Block / Progress bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">SUB-COMMUNITY PROTOCOL</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">
              {step === 1 && "Select Community Vibe"}
              {step === 2 && "Configure Visibilities"}
              {step === 3 && "Core Credentials"}
              {step === 4 && "Choose Main Goals"}
              {step === 5 && "Publish & Aesthetics"}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-all"
            title="Cancel Setup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Step Tracker Indicator */}
        <div className="bg-slate-100/50 h-1.5 w-full shrink-0 flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className={`h-full flex-1 transition-all duration-300 ${i <= step ? 'bg-indigo-500' : 'bg-slate-200'}`} 
            />
          ))}
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Categories (20 Options) */}
            {step === 1 && (
              <motion.div 
                key="choice-step-1"
                initial={{ opacity: 0, translate: '10px' }}
                animate={{ opacity: 1, translate: '0px' }}
                exit={{ opacity: 0, translate: '-10px' }}
                className="space-y-5"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-700">What is your Community about?</h4>
                  <p className="text-xs text-slate-400 mt-1">This classifies your room so members sharing similar interests can search and join easily.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
                  {categories20.map((cat) => (
                    <button 
                      key={cat.name}
                      onClick={() => {
                        setCategory(cat.name);
                        // Make sticker selection default to corresponding emoji
                        setSelectedSticker(cat.icon);
                      }}
                      className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 group ${category === cat.name ? 'border-indigo-500 bg-indigo-50/60 font-black text-indigo-700' : 'border-slate-100 hover:border-slate-200 bg-white font-semibold text-slate-600'}`}
                    >
                      <span className="text-lg bg-slate-50 p-1.5 rounded-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                      <span className="text-xs tracking-tight line-clamp-1">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Community Type visibilities */}
            {step === 2 && (
              <motion.div 
                key="choice-step-2"
                initial={{ opacity: 0, translate: '10px' }}
                animate={{ opacity: 1, translate: '0px' }}
                exit={{ opacity: 0, translate: '-10px' }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Configure Circle Privacy & Access</h4>
                  <p className="text-xs text-slate-400 mt-1">Determine how users find, join, and contribute to your sub-community thread.</p>
                </div>

                <div className="space-y-3.5">
                  {[
                    {
                      id: 'public' as const,
                      title: 'Public Group for anyone',
                      desc: 'Anyone can see your room, browse posts, and join immediately without approval.',
                      icon: Eye,
                      pillColor: 'bg-emerald-50 text-emerald-600',
                      badge: 'Open Access'
                    },
                    {
                      id: 'restricted' as const,
                      title: 'Restricted community',
                      desc: 'Anyone can view it and search posts, but they cannot join. Only the creator can actively admit members.',
                      icon: Shield,
                      pillColor: 'bg-amber-50 text-amber-600',
                      badge: 'Moderate Security'
                    },
                    {
                      id: 'private' as const,
                      title: 'Private Group',
                      desc: 'Only approved members can see the room, browse posts, or submit any content.',
                      icon: Lock,
                      pillColor: 'bg-rose-50 text-rose-600',
                      badge: 'Invite Only'
                    }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCommunityType(type.id)}
                      className={`w-full p-4.5 rounded-3xl border text-left flex gap-4 transition-all relative ${communityType === type.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-150 bg-white hover:border-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${communityType === type.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <type.icon size={18} />
                      </div>
                      <div className="space-y-1 pr-16">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black tracking-tight ${communityType === type.id ? 'text-indigo-600' : 'text-slate-800'}`}>{type.title}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${type.id === communityType ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{type.badge}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{type.desc}</p>
                      </div>
                      {communityType === type.id && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Identity & Roles */}
            {step === 3 && (
              <motion.div 
                key="choice-step-3"
                initial={{ opacity: 0, translate: '10px' }}
                animate={{ opacity: 1, translate: '0px' }}
                exit={{ opacity: 0, translate: '-10px' }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Name & Identify your Group</h4>
                  <p className="text-xs text-slate-400 mt-1">Provide attractive titles, descriptions, and customizable badge roles for your room.</p>
                </div>

                <div className="space-y-3.5">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Room Name *</label>
                    <input 
                      type="text"
                      maxLength={32}
                      placeholder="e.g. Weightless Gamers"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4.5 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-400/80 focus:bg-indigo-50/5"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Group Description *</label>
                    <textarea 
                      rows={2}
                      maxLength={140}
                      placeholder="e.g. A supportive group of developers maintaining balance, eating clean and discussing art together!"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-4.5 py-3 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none resize-none focus:border-indigo-400/80"
                    />
                  </div>

                  {/* What it is for (Detail Purpose) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">What the room is for</label>
                    <input 
                      type="text"
                      maxLength={80}
                      placeholder="e.g. Sharing cosplay updates and supportive design guidelines"
                      value={whatGroupIsFor}
                      onChange={e => setWhatGroupIsFor(e.target.value)}
                      className="w-full px-4.5 py-3 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400/80"
                    />
                  </div>

                  {/* Roles list */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Customizable Member Roles (comma separated)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Creator, Elder, Mentor, Recruit"
                      value={rolesInput}
                      onChange={e => setRolesInput(e.target.value)}
                      className="w-full px-4.5 py-3 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400/80"
                    />
                    <p className="text-[9px] text-slate-400 ml-1 font-bold">These badge titles will represent user hierarchies inside chats/posts.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Choose Room Primary Purpose */}
            {step === 4 && (
              <motion.div 
                key="choice-step-4"
                initial={{ opacity: 0, translate: '10px' }}
                animate={{ opacity: 1, translate: '0px' }}
                exit={{ opacity: 0, translate: '-10px' }}
                className="space-y-5"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-700">What is the group's highest priority goal?</h4>
                  <p className="text-xs text-slate-400 mt-1">This focuses your members on a core objective to drive maximum discussion value.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                  {[
                    { id: 'Daily Challenges', title: 'Complete Daily Challenges', icon: Award, desc: 'Engage submembers in interactive health hacks and fitness routines.' },
                    { id: 'Achievements', title: 'Share Achievements & Progress', icon: Star, desc: 'Celebrate unlockable badges, records, and customized milestone events.' },
                    { id: 'Collaboration', title: 'Seek Q&As & Collaboration', icon: HelpCircle, desc: 'Interact with specialists, share guides, and review daily designs.' },
                    { id: 'Habits', title: 'Build Supportive Habits', icon: Sparkles, desc: 'Stay accountable with water records, mindfulness streaking and focuses.' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPrimaryPurpose(p.id)}
                      className={`p-4 rounded-3xl border text-left flex gap-3 transition-colors ${primaryPurpose === p.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-150 bg-white hover:border-slate-200'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${primaryPurpose === p.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        <p.icon size={16} />
                      </div>
                      <div>
                        <p className={`text-xs font-black ${primaryPurpose === p.id ? 'text-indigo-600' : 'text-slate-750'}`}>{p.title}</p>
                        <p className="text-[10px] text-slate-400 leading-normal font-semibold mt-0.5">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Stickers, Theme & Image Upload */}
            {step === 5 && (
              <motion.div 
                key="choice-step-5"
                initial={{ opacity: 0, translate: '10px' }}
                animate={{ opacity: 1, translate: '0px' }}
                exit={{ opacity: 0, translate: '-10px' }}
                className="space-y-5"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Aesthetic custom theme setup</h4>
                  <p className="text-xs text-slate-400 mt-1">Set background colors, contextual room stickers, and upload personalized iconography.</p>
                </div>

                {/* Subgrid layout */}
                <div className="space-y-4">
                  {/* Row 1: Sticker Select & Color Select */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sticker Section */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Room Badge Stickers</label>
                      <div className="flex flex-wrap gap-2">
                        {contextualStickers.map((stick) => (
                          <button
                            key={stick}
                            onClick={() => setSelectedSticker(stick)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${selectedSticker === stick ? 'bg-white scale-110 shadow-md ring-2 ring-indigo-500' : 'hover:scale-105 bg-slate-100 opacity-60 hover:opacity-100'}`}
                          >
                            {stick}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Palette section */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Theme Accent</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {colors.map((c) => (
                          <button
                            key={c.class}
                            onClick={() => setSelectedColor(c.class)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-8 h-8 rounded-full border-4 transition-all relative ${selectedColor === c.class ? 'border-indigo-600 scale-110 shadow-md' : 'border-white'}`}
                          >
                            {selectedColor === c.class && (
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] text-indigo-700 font-bold">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Icon & Banner Image Upload Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Custom Image logo */}
                    <div className="border border-dashed border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-350 transition-colors">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Group Avatar Pic</span>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">Upload custom avatar picture as room logo.</p>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shrink-0">
                          <ImageIcon size={12} />
                          Browse
                          <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
                        </label>
                        <div className="flex-1 overflow-hidden">
                          {isUploadingIcon ? (
                            <span className="text-[10px] text-slate-450 font-bold italic">Reading...</span>
                          ) : customIconUrl ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-md">ADDED</span>
                              <img src={customIconUrl} className="w-6 h-6 rounded-md object-cover" alt="Preview logo" />
                              <button
                                type="button"
                                onClick={() => setCustomIconUrl('')}
                                className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-md transition-colors"
                                title="Delete Image"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">None chosen</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Custom Background banner */}
                    <div className="border border-dashed border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-350 transition-colors">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Background Banner</span>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">Upload customized wallpaper theme for faster render.</p>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shrink-0">
                          <ImageIcon size={12} />
                          Browse
                          <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                        </label>
                        <div className="flex-1 overflow-hidden">
                          {isUploadingBg ? (
                            <span className="text-[10px] text-slate-450 font-bold italic">Reading...</span>
                          ) : customBgUrl ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-md">ADDED</span>
                              <img src={customBgUrl} className="w-10 h-5 rounded-md object-cover" alt="Preview theme" />
                              <button
                                type="button"
                                onClick={() => setCustomBgUrl('')}
                                className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-md transition-colors"
                                title="Delete Image"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">None chosen</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls footer */}
        <div className="px-8 py-5 border-t border-slate-100 shrink-0 bg-slate-50/50 flex gap-4">
          <button 
            onClick={handleBack}
            className="flex-1 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-705 rounded-xl font-black uppercase text-[10.5px] tracking-wider transition-all shadow-sm active:scale-95"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            disabled={
              isSubmitting || 
              isUploadingIcon || 
              isUploadingBg ||
              (step === 1 && !category) || 
              (step === 3 && (!name.trim() || !description.trim())) ||
              (step === 4 && !primaryPurpose)
            }
            onClick={handleNext}
            className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none text-white rounded-xl font-black uppercase text-[10.5px] tracking-wider shadow-lg active:scale-95 transition-all"
          >
            {isSubmitting 
              ? 'Initializing Node...' 
              : step === 5 
                ? 'Create Group 🚀' 
                : 'Next Question'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
