import React, { useState } from 'react';
import { GardenState, createInitialGardenState, PLANT_ARCHETYPES } from '../types/garden';
import { motion } from 'motion/react';
import { ArrowLeft, Flower2, Droplet, Sprout } from 'lucide-react';

export const GardenScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [garden, setGarden] = useState<GardenState>(createInitialGardenState());

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] text-[#4A443A] overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b border-stone-200">
        <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-[#5A5040]">Cozy Garden</h1>
        <div className="flex items-center gap-2">
          <Flower2 size={24} className="text-[#8D7D62]" />
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col items-center justify-center overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {garden.tiles.map((tile) => (
            <div 
              key={tile.tileIndex}
              className="w-24 h-24 bg-[#EFE8DC] border-2 border-stone-200 rounded-2xl flex items-center justify-center relative shadow-inner"
            >
              {tile.plantId ? (
                <div className={`p-2 rounded-full ${PLANT_ARCHETYPES[tile.plantId].themeColor}`}>
                  <Sprout size={32} />
                </div>
              ) : (
                <div className="text-stone-300 font-bold text-xs uppercase tracking-widest">Soil</div>
              )}
              {tile.waterCount > 0 && (
                <div className="absolute top-1 right-1 bg-blue-100 text-blue-600 rounded-full p-1 border border-blue-200">
                  <Droplet size={12} />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="p-4 border-t border-stone-200 text-center">
        <p className="text-sm text-stone-500">Your garden is empty. Complete tasks to earn mystery seeds!</p>
      </footer>
    </div>
  );
};
