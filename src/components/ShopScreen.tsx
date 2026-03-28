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
  onBuy, 
  onBack 
}: { 
  streak: number; 
  purchasedItems: string[]; 
  onBuy: (item: ShopItem) => void; 
  onBack: () => void; 
}) {
  const [plan, setPlan] = React.useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const getPlanUrl = () => {
    switch (plan) {
      case 'weekly': return import.meta.env.VITE_LEMON_SQUEEZY_WEEKLY_URL;
      case 'monthly': return import.meta.env.VITE_LEMON_SQUEEZY_MONTHLY_URL;
      case 'yearly': return import.meta.env.VITE_LEMON_SQUEEZY_YEARLY_URL;
      default: return '';
    }
  };

  const getPrice = () => {
    switch (plan) {
      case 'weekly': return '$3.99';
      case 'monthly': return '$9.99';
      case 'yearly': return '$29.90';
      default: return '';
    }
  };

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
        <div className="col-span-2 glass-card p-6 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-2xl text-amber-500">Nexora Pro</h3>
              <p className="text-sm text-slate-400">Unlock the full potential of your journey.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white">{getPrice()}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">{plan}</div>
            </div>
          </div>

          <div className="flex p-1 bg-slate-900/50 rounded-xl gap-1">
            {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  plan === p 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
                {p === 'yearly' && <span className="ml-1 text-[10px] opacity-70">(-75%)</span>}
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              const url = getPlanUrl();
              if (!url) {
                alert("Payment link not configured. Please check your App Settings and ensure all Pro plan URLs are saved.");
                return;
              }
              window.open(url, '_blank');
            }}
            className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-amber-600 transition-all active:scale-95 shadow-xl shadow-amber-500/20"
          >
            Upgrade Now
          </button>

          <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            <span>✨ Unlimited AI</span>
            <span>•</span>
            <span>👑 Exclusive Skins</span>
            <span>•</span>
            <span>📊 Deep Insights</span>
          </div>
        </div>
        {SHOP_ITEMS.map((item) => (
          <div key={item.id} className="glass-card p-4 flex flex-col gap-2">
            <div className="text-4xl">{item.icon}</div>
            <h3 className="font-bold">{item.name}</h3>
            <p className="text-xs text-slate-400">{item.description}</p>
            <button 
              onClick={() => onBuy(item)}
              disabled={streak < item.price || purchasedItems.includes(item.id)}
              className="mt-auto bg-emerald-500 text-white py-2 rounded-lg font-bold disabled:opacity-50"
            >
              {purchasedItems.includes(item.id) ? 'Purchased' : `${item.price} Streak`}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
