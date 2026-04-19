import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Library, X, Sparkles, Share2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { PlantRenderer } from './PlantRenderer';
import { PlantType } from '../types';
import { vibrate } from '../lib/vibrate';

interface PlantCompletionCardProps {
  type: PlantType;
  ecosystemName: string;
  onSaveToLibrary: (imageData: string) => void;
  onClose: () => void;
}

export const PlantCompletionCard: React.FC<PlantCompletionCardProps> = ({
  type,
  ecosystemName,
  onSaveToLibrary,
  onClose
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const plantRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSaveToLibrary = async () => {
    if (!plantRef.current || isSaving) return;
    vibrate(20);
    setIsSaving(true);
    
    try {
      // Capture the plant renderer as a PNG
      const dataUrl = await toPng(plantRef.current, { 
        backgroundColor: 'transparent',
        width: 300,
        height: 300,
        style: {
          transform: 'scale(1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      });
      
      onSaveToLibrary(dataUrl);
      setSaveSuccess(true);
      
      // Reset success state after a while
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save to library:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToPhone = async () => {
    if (!plantRef.current || isSaving) return;
    vibrate(30);
    setIsSaving(true);
    
    try {
      const dataUrl = await toPng(plantRef.current, { 
        backgroundColor: '#F0F9FF', // Nice light blue background for the saved file
        width: 500,
        height: 500,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }
      });
      
      const link = document.createElement('a');
      link.download = `Nexora_${ecosystemName}_Legendary.png`;
      link.href = dataUrl;
      link.click();
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save to phone:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
    >
      <motion.div
        ref={cardRef}
        initial={{ scale: 0.5, opacity: 0, rotate: -5, y: 100 }}
        animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, scaleY: 0.2, filter: 'blur(20px)' }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          opacity: { duration: 0.2 }
        }}
        className="relative glass-card w-full max-w-sm bg-white p-8 overflow-hidden flex flex-col items-center gap-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-4 border-yellow-400"
      >
        {/* Background Confetti Aura */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,_rgba(255,223,0,0.15)_0%,_transparent_70%)]"
          />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-1 z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2"
          >
            <Sparkles className="text-yellow-500 fill-yellow-500" size={20} />
            <h2 className="text-sm font-black text-yellow-600 uppercase tracking-[0.3em]">Legendary Growth</h2>
            <Sparkles className="text-yellow-500 fill-yellow-500" size={20} />
          </motion.div>
          <motion.h3 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-3xl font-black text-blue-900 leading-tight italic"
          >
            {ecosystemName}
          </motion.h3>
        </div>

        {/* The Capture Area */}
        <div className="relative group">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-emerald-50 p-8 rounded-[3rem] shadow-inner border-2 border-dashed border-blue-100 flex items-center justify-center"
          >
            <div ref={plantRef} className="w-56 h-56 flex items-center justify-center">
              <PlantRenderer type={type} stage={5} isThirsty={false} isDead={false} />
            </div>
          </motion.div>
          
          {/* Animated sparkles around the plant */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                x: Math.sin(i) * 120,
                y: Math.cos(i) * 120
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            >
              <Sparkles size={16} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        <p className="text-xs font-bold text-blue-900/40 text-center px-4 leading-relaxed z-10">
          Bro, your discipline is insane! You've successfully cultivated the legendary {ecosystemName}. Capture this moment!
        </p>

        <div className="w-full grid grid-cols-1 gap-3 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveToLibrary}
            disabled={isSaving || saveSuccess}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
              saveSuccess 
                ? 'bg-emerald-500 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check size={18} /> Saved to Library
              </>
            ) : (
              <>
                <Library size={18} /> Save to Library
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveToPhone}
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all shadow-lg border-2 ${
              downloadSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-white border-blue-100 text-blue-900 hover:bg-blue-50 shadow-gray-200/50'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check size={18} /> Saved to Files
              </>
            ) : (
              <>
                <Download size={18} /> Save to Phone
              </>
            )}
          </motion.button>
        </div>

        {/* Success burst animation */}
        <AnimatePresence>
          {(saveSuccess || downloadSuccess) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              <div className="w-64 h-64 rounded-full border-8 border-yellow-400 opacity-20" />
              <div className="absolute w-full h-full">
                {[...Array(12)].map((_, i) => (
                   <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-8 bg-yellow-400 rounded-full"
                    animate={{ 
                      x: Math.sin(i * 30 * (Math.PI / 180)) * 200,
                      y: Math.cos(i * 30 * (Math.PI / 180)) * 200,
                      rotate: i * 30,
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 0.8 }}
                   />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
