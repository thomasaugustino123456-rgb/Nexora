import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star } from 'lucide-react';
import { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // Power-ups
  { id: 'streak-protection', name: 'Streak Shield', description: 'Protects your streak for 24 hours.', price: 10, effect: 'streak-protection', icon: '🛡️' },
  { id: 'double-points', name: 'Double XP', description: 'Earn 2x points for all challenges today.', price: 20, effect: 'double-points', icon: '⚡' },
  
  // Mascot Skins (Hats/Accessories)
  { id: 'skin-crown', name: 'Royal Crown', description: 'A majestic crown for your mascot.', price: 50, effect: 'skin', icon: '👑' },
  { id: 'skin-cool', name: 'Cool Shades', description: 'Some stylish sunglasses.', price: 25, effect: 'skin', icon: '🕶️' },
  { id: 'skin-wizard', name: 'Wizard Hat', description: 'A magical hat for a magical bottle.', price: 60, effect: 'skin', icon: '🧙' },
  { id: 'skin-artist', name: 'Artist Beret', description: 'For the creative souls.', price: 35, effect: 'skin', icon: '🎨' },
  { id: 'skin-viking', name: 'Viking Helm', description: 'For the warriors of consistency.', price: 45, effect: 'skin', icon: '🪖' },
  { id: 'skin-space', name: 'Space Helmet', description: 'To the moon with your habits!', price: 80, effect: 'skin', icon: '👨‍🚀' },
  { id: 'skin-ninja', name: 'Ninja Mask', description: 'Silent but consistent.', price: 40, effect: 'skin', icon: '🥷' },
  { id: 'skin-detective', name: 'Detective Hat', description: 'Solving the mystery of productivity.', price: 30, effect: 'skin', icon: '🕵️' },
];

export function ShopScreen({ 
  streak, 
  purchasedItems, 
  isPro,
  onBuy, 
  onBack 
}: { 
  streak: number; 
  purchasedItems: string[]; 
  isPro: boolean;
  onBuy: (item: ShopItem) => void; 
  onBack: () => void; 
}) {
  const featuredItem = SHOP_ITEMS[0];
  const powerUps = SHOP_ITEMS.filter(item => item.effect !== 'skin');
  const skins = SHOP_ITEMS.filter(item => item.effect === 'skin');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 pb-24 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-blue-100 transition-colors">
          <ArrowLeft size={24} className="text-blue-900" />
        </button>
        <h1 className="text-3xl font-black text-blue-900">Nexora Shop</h1>
        <div className="ml-auto flex items-center gap-2 bg-amber-100 border border-amber-200 px-4 py-2 rounded-full text-amber-600 font-bold shadow-sm">
          <Star size={20} className="fill-amber-500" />
          {streak} Streak
        </div>
      </div>

      {/* Featured Item */}
      <div className="mb-10">
        <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Featured Deal</h2>
        <div className="relative overflow-hidden glass-card p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-200">
          <div className="absolute top-0 right-0 p-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
            Hot!
          </div>
          <div className="flex items-center gap-6">
            <div className="text-6xl drop-shadow-lg">{featuredItem.icon}</div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-blue-900">{featuredItem.name}</h3>
              <p className="text-sm text-blue-900/60 mb-4">{featuredItem.description}</p>
              <button 
                onClick={() => onBuy(featuredItem)}
                disabled={(!isPro && streak < featuredItem.price) || purchasedItems.includes(featuredItem.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {purchasedItems.includes(featuredItem.id) ? 'Purchased' : isPro ? 'Free' : `Get for ${featuredItem.price} Streak`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-10">
        <section>
          <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Power-Ups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {powerUps.map((item) => (
              <div key={item.id} className="glass-card p-5 flex items-center gap-4 hover:border-blue-300 transition-colors">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900">{item.name}</h3>
                  <p className="text-[10px] text-blue-900/40 font-medium leading-tight mb-2">{item.description}</p>
                  <button 
                    onClick={() => onBuy(item)}
                    disabled={(!isPro && streak < item.price) || purchasedItems.includes(item.id)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-xs font-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {purchasedItems.includes(item.id) ? 'Purchased' : isPro ? 'Free' : `${item.price} Streak`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">Mascot Styles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {skins.map((item) => (
              <div key={item.id} className="glass-card p-4 flex flex-col items-center text-center gap-3 hover:border-blue-300 transition-colors">
                <div className="text-5xl drop-shadow-md">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-blue-900 text-sm">{item.name}</h3>
                  <p className="text-[10px] text-blue-900/40 font-medium leading-tight mb-3">{item.description}</p>
                </div>
                <button 
                  onClick={() => onBuy(item)}
                  disabled={(!isPro && streak < item.price) || purchasedItems.includes(item.id)}
                  className="mt-auto w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {purchasedItems.includes(item.id) ? 'Purchased' : isPro ? 'Free' : `${item.price} Streak`}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
