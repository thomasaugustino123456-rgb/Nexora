import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { PlantRenderer } from './PlantRenderer';
import { PlantType } from '../types';
import { vibrate } from '../lib/vibrate';

interface PlantCompletionCardProps {
  type: PlantType;
  ecosystemName: string;
  onSaveToLibrary: (imageData: string) => void;
  onClose: () => void;
  stats?: any;
  settings?: any;
  onSwitchType?: (type: PlantType) => void;
}

const ECOSYSTEM_PATH: PlantType[] = [
  'sprout', 'zen', 'desert', 'tropical', 'forest', 'meadow', 'crystal', 'volcano', 
  'boredFlower', 'mourningSprout', 'breezeTulip', 'happyTulip', 'distressedRose', 
  'premium-cactus', 'lucky-bamboo', 'cosmic-star-flower', 'bubble-gum-succulent', 'neon-mushroom'
];

export const PlantCompletionCard: React.FC<PlantCompletionCardProps> = ({
  type,
  ecosystemName,
  onSaveToLibrary,
  onClose,
  stats,
  onSwitchType
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Find index in collection
  const plantIndex = ECOSYSTEM_PATH.indexOf(type) !== -1 ? ECOSYSTEM_PATH.indexOf(type) + 1 : 1;

  const handleCapture = async () => {
    if (!cardRef.current || isSaving) return;
    vibrate(20);
    setIsSaving(true);
    
    try {
      const dataUrl = await toPng(cardRef.current, { 
        backgroundColor: '#10a3a8', // Immersive teal background
        pixelRatio: 4, // Ultra-sharp 4x high-definition (HD)
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      });
      
      // Trigger download
      const link = document.createElement('a');
      link.download = `Nexora_Postcard_${ecosystemName}.png`;
      link.href = dataUrl;
      link.click();
      
      // Save to library as well
      onSaveToLibrary(dataUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to capture postcard image:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-4 bg-[#10a3a8] overflow-y-auto no-scrollbar">
      <style>{`
        /* --- GENTLE FLOAT ANIMATION --- */
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-gentle-float {
          animation: gentleFloat 4s ease-in-out infinite;
        }

        /* --- THE SQUARE POSTCARD (Plant Nanny Style) --- */
        .postcard-container {
          width: 100%;
          max-width: 360px;
          aspect-ratio: 1 / 1;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
        }

        /* Top 82% - Artwork Section */
        .postcard-artwork-sec {
          flex: 82;
          background: linear-gradient(to bottom, #a1e0ff, #e3f6ff);
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          overflow: hidden;
        }

        /* Soft green grass hill background */
        .postcard-grass-hill {
          position: absolute;
          bottom: -15px;
          width: 115%;
          height: 65px;
          background: #7bd062;
          border-radius: 50%;
          z-index: 1;
        }

        /* Plant wrapper sizing & floating */
        .postcard-plant-wrap {
          width: 210px;
          height: 210px;
          z-index: 2;
          margin-bottom: 16px;
          display: flex;
          align-items: end;
          justify-content: center;
        }

        /* Bottom 18% - Branding Bar */
        .postcard-footer-sec {
          flex: 18;
          background-color: #10a3a8;
          padding: 0 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: none !important;
        }

        /* Left Side: Logo & Brand Name */
        .brand-group-sec {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .app-mascot-icon {
          width: 24px;
          height: 24px;
          background-color: #ffffff;
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .app-name-sec {
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Right Side: Details */
        .plant-details-sec {
          text-align: right;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .plant-name-sec {
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          margin: 0;
        }

        .plant-stats-sec {
          color: rgba(255, 255, 255, 0.85);
          font-size: 11px;
          margin-top: 2px;
          font-weight: 500;
        }
      `}</style>

      {/* Dynamic Feedback Toasts */}
      <AnimatePresence>
        {downloadSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[1010] bg-emerald-500 border border-emerald-400 text-white font-bold py-2.5 px-6 rounded-full shadow-lg flex items-center gap-2 text-sm"
          >
            <Check size={16} className="text-white" /> Postcard Saved to Device!
          </motion.div>
        )}
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[1010] bg-sky-500 border border-sky-400 text-white font-bold py-2.5 px-6 rounded-full shadow-lg animate-pulse text-sm"
          >
            Generating Postcard...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          vibrate(20);
          onClose();
        }}
        className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
      >
        <X size={20} />
      </button>

      {/* Share Screen Viewport Wrapper */}
      <div className="w-full max-w-[380px] flex flex-col items-center select-none py-6">
        
        {/* 📸 THE SQUARE POSTCARD (Plant Nanny Style) */}
        <motion.div 
          ref={cardRef} 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="postcard-container"
        >
          {/* Top 82% (Artwork Section) */}
          <div className="postcard-artwork-sec">
            <div className="postcard-grass-hill" />

            {/* Plant Wrapper with gentle Float Animation & Large Centered Size */}
            <div className="postcard-plant-wrap animate-gentle-float">
              <PlantRenderer 
                type={type} 
                stage={5} 
                isThirsty={false} 
                isDead={false} 
                className="!w-full !h-full origin-bottom" 
              />
            </div>
          </div>

          {/* Bottom 18% (Branding Bar) */}
          <div className="postcard-footer-sec">
            {/* Left Side: App Mascot Logo & Name */}
            <div className="brand-group-sec">
              <div className="app-mascot-icon">
                <img 
                  src="/mascot.png" 
                  alt="Nexora Mascot" 
                  className="w-5 h-5 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="app-name-sec">
                Nexora
              </span>
            </div>

            {/* Right Side: Plant details */}
            <div className="plant-details-sec">
              <h3 className="plant-name-sec">
                {ecosystemName}
              </h3>
              <div className="plant-stats-sec">
                {stats?.streak || 14} Day Streak • #{plantIndex}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 📝 CONGRATS SECTION (Below the Card) */}
        <div className="text-center my-6 px-2.5 text-white">
          <h2 className="text-[22px] font-black mb-2 drop-shadow-sm font-sans tracking-wide">
            A Precious Moment
          </h2>
          <p className="text-sm leading-relaxed opacity-90 font-medium font-sans">
            What a lovely memory! Save this snap or share it with friends!
          </p>
        </div>

        {/* 🔘 ACTION BUTTONS CONTAINER */}
        <div className="w-full flex flex-col gap-3">
          {(() => {
            const currentIdx = ECOSYSTEM_PATH.indexOf(type);
            const nextType = (currentIdx !== -1 && currentIdx < ECOSYSTEM_PATH.length - 1) ? ECOSYSTEM_PATH[currentIdx + 1] : null;
            if (nextType && onSwitchType) {
              return (
                <button
                  onClick={() => {
                    vibrate(20);
                    onSwitchType(nextType);
                    onClose();
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-extrabold text-base cursor-pointer transition-transform duration-100 active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                >
                  Plant Next Ecosystem 🌿🚀
                </button>
              );
            }
            return null;
          })()}

          <button
            onClick={handleCapture}
            disabled={isSaving || downloadSuccess}
            className="w-full py-4 border-none rounded-2xl bg-white hover:bg-slate-50 text-[#10a3a8] font-bold text-base cursor-pointer transition-transform duration-100 active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
          >
            <Download size={18} />
            {isSaving ? "Generating..." : "Share with Friends"}
          </button>

          <button
            onClick={() => {
              vibrate(20);
              onClose();
            }}
            className="w-full py-4 rounded-2xl bg-white/25 hover:bg-white/30 text-white font-semibold text-base border border-white/40 backdrop-blur-sm transition-transform duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
};
