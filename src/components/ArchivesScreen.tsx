import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Book as BookIcon, Zap, Droplet, Wind, Flower, Sun, Moon, Eye, ChevronRight, X, Heart, Palette } from 'lucide-react';
import { KNOWLEDGE_BOOKS, Book } from '../constants/library';
import { Screen } from '../types';

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

export function ArchivesScreen({ onBack }: { onBack: () => void }) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  return (
    <div className="min-h-screen bg-[#f8fbff] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#f8fbff]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-blue-100">
        <button 
          onClick={onBack}
          className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-900 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-xs font-black text-blue-900 uppercase tracking-[0.3em]">Knowledge Hub</h2>
          <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Retention Protocol Alpha</p>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      <div className="px-6 pt-8 space-y-8 max-w-2xl mx-auto">
        {/* Intro */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-blue-900 tracking-tight leading-none">
            Nexus <span className="text-blue-500">Library</span>
          </h1>
          <p className="text-sm font-medium text-blue-900/40 leading-relaxed">
            Access the deep archives of biological optimization and Nexus lore, bro. Knowledge is power.
          </p>
        </div>

        {/* Categories */}
        {['challenge', 'plant', 'health'].map(category => {
          const books = KNOWLEDGE_BOOKS.filter(b => b.category === category);
          if (books.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <h3 className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em] px-1">
                {category === 'challenge' ? 'Protocol Manuals' : category === 'plant' ? 'Botany Archives' : 'Bio-Hacking Research'}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {books.map(book => {
                  const Icon = ICON_MAP[book.icon] || BookIcon;
                  return (
                    <motion.button
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass-card p-5 flex items-center gap-4 text-left group relative overflow-hidden"
                    >
                      <div className={`p-4 ${book.coverColor} rounded-2xl text-white shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">{book.title}</h4>
                        <p className="text-xs text-blue-400 font-medium line-clamp-1">{book.description}</p>
                      </div>
                      <ChevronRight size={16} className="text-blue-200" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white overflow-y-auto"
          >
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 ${selectedBook.coverColor} px-6 pt-12 pb-8 text-white relative`}>
              <button 
                onClick={() => setSelectedBook(null)}
                className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center mt-4 space-y-4">
                <div className="p-6 bg-white/10 backdrop-blur-md rounded-[2.5rem] shadow-2xl">
                  {React.createElement(ICON_MAP[selectedBook.icon] || BookIcon, { size: 48 })}
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight">{selectedBook.content.title}</h2>
                  <p className="text-xs font-black uppercase tracking-widest opacity-70 italic">{selectedBook.description}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-10 max-w-2xl mx-auto space-y-10">
              {selectedBook.content.sections.map((section, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={idx} 
                  className="space-y-3"
                >
                  <h3 className="text-lg font-black text-blue-900 border-l-4 border-blue-500 pl-4 uppercase tracking-tight">
                    {section.heading}
                  </h3>
                  <p className="text-blue-900/70 text-sm font-medium leading-relaxed">
                    {section.text}
                  </p>
                </motion.div>
              ))}

              <div className="pt-10 pb-20">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-transform"
                >
                  Terminate Reading Session
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
