import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star } from 'lucide-react';
import { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'streak-protection', name: 'Streak Protection', description: 'Protects your streak for a day.', price: 50, effect: 'streak-protection', icon: '🛡️' },
  { id: 'double-points', name: 'Double Points', description: 'Get double points for challenges.', price: 100, effect: 'double-points', icon: '⚡' },
  { id: 'skin-crown', name: 'Royal Crown', description: 'A majestic crown for your mascot.', price: 200, effect: 'skin', icon: '👑' },
  { id: 'skin-cool', name: 'Cool Shades', description: 'Some stylish sunglasses.', price: 150, effect: 'skin', icon: '🕶️' },
  { id: 'skin-wizard', name: 'Wizard Hat', description: 'A magical hat for a magical bottle.', price: 250, effect: 'skin', icon: '🧙' },
  { id: 'skin-artist', name: 'Artist Beret', description: 'For the creative souls.', price: 180, effect: 'skin', icon: '🎨' },
  ...Array.from({ length: 94 }, (_, i) => ({
    id: `item-${i + 6}`,
    name: `Power Item ${i + 6}`,
    description: `This is a powerful item that gives you special effects.`,
    price: (i + 1) * 10 + 50,
    effect: 'Special Effect',
    icon: '✨',
  }))
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
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 pb-24"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black">Shop</h1>
        <div className="ml-auto flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full text-amber-500 font-bold">
          <Star size={20} />
          {streak} Streak
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SHOP_ITEMS.map((item) => (
          <div key={item.id} className="glass-card p-4 flex flex-col gap-2">
            <div className="text-4xl">{item.icon}</div>
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-xs text-slate-400">{item.description}</p>
            <button 
              onClick={() => onBuy(item)}
              disabled={(!isPro && streak < item.price) || purchasedItems.includes(item.id)}
              className="mt-auto bg-emerald-500 text-white py-2 rounded-lg font-bold disabled:opacity-50"
            >
              {purchasedItems.includes(item.id) ? 'Purchased' : isPro ? 'Free' : `${item.price} Streak`}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
