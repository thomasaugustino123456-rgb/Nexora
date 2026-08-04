import React, { useState } from 'react';
import { MASCOTS_DATA, MascotId } from '../lib/mascotSystem';
import { LivingMascot } from './LivingMascot';
import { Sparkles, Check, Lock, Flame, Droplets, Shield, Zap, Sprout } from 'lucide-react';

interface MascotCollectionSectionProps {
  coins: number;
  activeMascotSkin?: string;
  purchasedItems: string[];
  onEquip: (mascotId: string) => void;
  onBuy: (item: { id: string; name: string; coinPrice: number }, currency: 'coins') => void;
}

export const MascotCollectionSection: React.FC<MascotCollectionSectionProps> = React.memo(({
  coins,
  activeMascotSkin = 'blue-slim',
  purchasedItems,
  onEquip,
  onBuy
}) => {
  const [selectedMascotId, setSelectedMascotId] = useState<MascotId>(
    (activeMascotSkin as MascotId) || 'blue-slim'
  );

  const mascotsList = Object.values(MASCOTS_DATA);
  const selectedMascot = MASCOTS_DATA[selectedMascotId] || MASCOTS_DATA['blue-slim'];

  const isEquipped = activeMascotSkin === selectedMascot.id || (activeMascotSkin === 'standard' && selectedMascot.id === 'blue-slim');
  const isPurchased = selectedMascot.id === 'blue-slim' || purchasedItems.includes(selectedMascot.id);

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'fire':
        return <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-500 fill-cyan-500" />;
      case 'shield':
        return <Shield className="w-4 h-4 text-indigo-500 fill-indigo-500" />;
      case 'lightning':
        return <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'earth':
        return <Sprout className="w-4 h-4 text-emerald-500 fill-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-500 fill-sky-500" />;
    }
  };

  const isDogSoundPackActive = purchasedItems.includes('sound-dog') || purchasedItems.includes('dog-pack') || purchasedItems.includes('dog-sound');

  return (
    <div className="w-full my-4 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-blue-900/50 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500 fill-amber-400" />
          Nexora Living Mascots
        </h2>
      </div>

      {/* Selected Mascot Stage / Live Preview */}
      <div className="bg-white/80 backdrop-blur-md border border-blue-100/90 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center gap-5">
        {/* Interactive Mascot Preview Stage */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 relative flex items-center justify-center flex-shrink-0 bg-gradient-to-b from-blue-50/50 to-indigo-50/30 rounded-2xl p-2 border border-blue-100/60">
          <LivingMascot
            key={selectedMascot.id}
            mascotId={selectedMascot.id}
            className="w-full h-full"
            interactive={true}
            showSpeech={true}
            soundPack={isDogSoundPackActive ? 'dog' : 'cat'}
          />
        </div>

        {/* Mascot Information & Action */}
        <div className="flex-1 flex flex-col justify-between w-full space-y-3">
          <div>
            <div className="flex items-center gap-2">
              {getElementIcon(selectedMascot.element)}
              <h3 className="text-lg font-black text-slate-800">{selectedMascot.name}</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {selectedMascot.rarity}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-600 mt-1">
              <span className="text-amber-600 font-extrabold">Personality:</span> {selectedMascot.personalityTitle}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed line-clamp-2">
              {selectedMascot.personalityDesc}
            </p>
          </div>

          {/* Special Power Info */}
          <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100/80">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-xs font-black text-slate-800">
                {selectedMascot.powerName}: <span className="font-medium text-slate-600">{selectedMascot.powerDesc}</span>
              </span>
            </div>
          </div>

          {/* Equip or Purchase Button */}
          <div>
            {isEquipped ? (
              <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>EQUIPPED MASCOT</span>
              </div>
            ) : isPurchased ? (
              <button
                onClick={() => onEquip(selectedMascot.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>EQUIP {selectedMascot.name.toUpperCase()}</span>
              </button>
            ) : (
              <button
                onClick={() => onBuy({ id: selectedMascot.id, name: selectedMascot.name, coinPrice: selectedMascot.price }, 'coins')}
                disabled={coins < selectedMascot.price}
                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  coins >= selectedMascot.price
                    ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {coins >= selectedMascot.price ? (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>UNLOCK FOR {selectedMascot.price} COINS</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>NEED {selectedMascot.price} COINS (YOU HAVE {coins})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Mascot Selector Track (Placed directly under mascot preview) */}
      <div className="pt-1">
        <div className="flex overflow-x-auto gap-3 pb-2 pt-1 scrollbar-none snap-x">
          {mascotsList.map((m) => {
            const isSelected = selectedMascotId === m.id;
            const isOwned = m.id === 'blue-slim' || purchasedItems.includes(m.id);
            const isCurrentActive = activeMascotSkin === m.id || (activeMascotSkin === 'standard' && m.id === 'blue-slim');

            return (
              <button
                key={m.id}
                onClick={() => setSelectedMascotId(m.id)}
                className={`min-w-[115px] sm:min-w-[125px] p-2.5 rounded-2xl border text-center flex flex-col items-center flex-shrink-0 cursor-pointer transition-all snap-start relative ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20 scale-[1.02]'
                    : 'bg-white/80 border-blue-100/90 hover:bg-white hover:border-blue-200'
                }`}
              >
                {isCurrentActive && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                )}

                <div className="w-14 h-14 relative flex items-center justify-center my-0.5">
                  <LivingMascot
                    mascotId={m.id}
                    className="w-full h-full"
                    interactive={false}
                    showSpeech={false}
                  />
                </div>

                <span className="text-xs font-black text-slate-800 mt-1 leading-tight line-clamp-1">{m.name}</span>
                
                <span className="text-[10px] font-extrabold mt-0.5">
                  {isCurrentActive ? (
                    <span className="text-emerald-600">EQUIPPED</span>
                  ) : isOwned ? (
                    <span className="text-blue-600">OWNED</span>
                  ) : (
                    <span className="text-amber-600">🪙 {m.price}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

MascotCollectionSection.displayName = 'MascotCollectionSection';
