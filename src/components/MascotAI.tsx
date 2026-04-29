import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserStats, UserSettings } from '../types';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function MascotAI({ stats, settings, showToast }: { stats: UserStats, settings: UserSettings, showToast?: (m: string, t: any) => void }) {
  const [message, setMessage] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const userMsg = message;
    setMessage("");
    setLoading(true);
    setResponse("");
    
    try {
      const prompt = `You are Nexora, a friendly water-bottle mascot for a productivity and wellness app. 
      The user says: "${userMsg}"
      Respond as Nexora. Be friendly, helpful, and encouraging. 
      Keep it short (max 2-3 sentences). 
      User stats: Streak ${stats.streak}, Points ${stats.totalPoints}, Level ${stats.level || 1}.
      Your current outfit is: ${settings.activeSkin || 'none'}.`;
      
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      setResponse(result.response.text() || "I'm here for you, bro! 🌊");
    } catch (error: any) {
      console.error('Mascot AI Chat Error:', error);
      setResponse("I'm a bit parched right now, but I'm still cheering for you! 🚀");
      showToast?.(`AI Error: ${error.message || 'Connection failed'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateMotivation = async () => {
    setLoading(true);
    try {
      const prompt = `You are Nexora, a friendly water-bottle mascot for a productivity and wellness app. 
      The user's current streak is ${stats.streak} days. 
      Their total points are ${stats.totalPoints}.
      They have ${stats.trophies.length} trophies.
      Give them a short, punchy, and super friendly motivational message (max 2 sentences). 
      Be encouraging and maybe a bit bubbly!`;
      
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      setResponse(result.response.text() || "You're doing great, bro! Keep that streak alive! 🌊");
    } catch (error: any) {
      console.error('Mascot AI Motivation Error:', error);
      setResponse("I'm always here to cheer you on! Let's crush today! 🚀");
      showToast?.(`Motivation AI Error: ${error.message || 'Sync failed'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !response) {
      generateMotivation();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-24 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-64 glass-card p-4 shadow-2xl border-2 border-blue-200"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nexora Says:</span>
              <button onClick={() => setIsOpen(false)} className="text-blue-900/20 hover:text-blue-900/40">
                <X size={14} />
              </button>
            </div>
            {loading ? (
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              <p className="text-sm font-medium text-blue-900 leading-relaxed italic">"{response}"</p>
            )}
            
            <form onSubmit={handleChat} className="mt-4 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something..."
                className="flex-1 text-[10px] bg-white/50 border border-blue-200 rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-blue-900"
              />
              <button 
                type="submit"
                disabled={loading}
                className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </form>

            <button 
              onClick={() => { setResponse(""); generateMotivation(); }}
              className="mt-3 text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <Sparkles size={10} /> Get more wisdom
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
