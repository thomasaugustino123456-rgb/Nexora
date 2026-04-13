import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // Power-ups
  { id: 'streak-protection', name: 'Streak Shield', description: 'Protects your streak for 24 hours.', price: 10, coinPrice: 150, effect: 'streak-protection', icon: '🛡️' },
  { id: 'double-points', name: 'Double XP', description: 'Earn 2x points for all challenges today.', price: 20, coinPrice: 300, effect: 'double-points', icon: '⚡' },
  
  // Mascot Skins (Hats/Accessories)
  { id: 'skin-crown', name: 'Royal Crown', description: 'A majestic crown for your mascot.', price: 50, coinPrice: 750, effect: 'skin', icon: '👑' },
  { id: 'skin-cool', name: 'Cool Shades', description: 'Some stylish sunglasses.', price: 25, coinPrice: 375, effect: 'skin', icon: '🕶️' },
  { id: 'skin-wizard', name: 'Wizard Hat', description: 'A magical hat for a magical bottle.', price: 60, coinPrice: 900, effect: 'skin', icon: '🧙' },
  { id: 'skin-artist', name: 'Artist Beret', description: 'For the creative souls.', price: 35, coinPrice: 525, effect: 'skin', icon: '🎨' },
  { id: 'skin-viking', name: 'Viking Helm', description: 'For the warriors of consistency.', price: 45, coinPrice: 675, effect: 'skin', icon: '🪖' },
  { id: 'skin-space', name: 'Space Helmet', description: 'To the moon with your habits!', price: 80, coinPrice: 1200, effect: 'skin', icon: '👨‍🚀' },
  { id: 'skin-ninja', name: 'Ninja Mask', description: 'Silent but consistent.', price: 40, coinPrice: 600, effect: 'skin', icon: '🥷' },
  { id: 'skin-detective', name: 'Detective Hat', description: 'Solving the mystery of productivity.', price: 30, coinPrice: 450, effect: 'skin', icon: '🕵️' },
  { id: 'sound-dog', name: 'Dog Sound Pack', description: 'Make your mascot bark!', price: 10, coinPrice: 150, effect: 'sound-pack', icon: '🐶' },
  { id: 'music-fanfare', name: 'Medieval Fanfare', description: 'A royal announcement!', price: 5, coinPrice: 75, effect: 'music', icon: '🎺' },
  { id: 'music-funkee', name: 'Funkee Monkeee', description: 'Get groovy!', price: 5, coinPrice: 75, effect: 'music', icon: '🐒' },
  { id: 'music-triplets', name: 'Funky Triplets', description: 'A rhythmic delight.', price: 5, coinPrice: 75, effect: 'music', icon: '🥁' },
  { id: 'music-forest', name: 'Forest Treasure', description: 'A magical forest journey.', price: 5, coinPrice: 75, effect: 'music', icon: '🌲' },
  { id: 'music-cbpd', name: 'CBPD Beat', description: 'A cool urban beat.', price: 5, coinPrice: 75, effect: 'music', icon: '🎧' },
  { id: 'music-nba', name: 'NBA Type Beat', description: 'Ready for the game!', price: 5, coinPrice: 75, effect: 'music', icon: '🏀' },
  { id: 'music-complicated', name: 'Complicated', description: 'A complex melody.', price: 5, coinPrice: 75, effect: 'music', icon: '🧩' },

  // Gifts
  { id: 'gift-mystery', name: 'Mystery Gift', description: 'A surprise gift box! (Buy one, get one free!)', price: 15, coinPrice: 225, effect: 'gift', icon: '🎁' },
  { id: 'gift-premium', name: 'Premium Gift', description: 'A high-value surprise for your library.', price: 30, coinPrice: 450, effect: 'gift', icon: '💝' },
  { id: 'gift-gold', name: 'Golden Chest', description: 'Contains legendary items and rare skins.', price: 50, coinPrice: 750, effect: 'gift', icon: '💰' },
  { id: 'gift-lucky', name: 'Lucky Clover', description: 'A small gift with a big surprise potential.', price: 10, coinPrice: 150, effect: 'gift', icon: '🍀' },
  { id: 'gift-party', name: 'Party Popper', description: 'Celebrate your progress with a surprise!', price: 12, coinPrice: 180, effect: 'gift', icon: '🎉' },
  { id: 'gift-diamond', name: 'Diamond Box', description: 'The ultimate gift for the most dedicated users.', price: 100, coinPrice: 1500, effect: 'gift', icon: '💎' },
];

export function ShopScreen({ 
  streak, 
  coins,
  purchasedItems, 
  isPro,
  onBuy, 
  onBack 
}: { 
  streak: number; 
  coins: number;
  purchasedItems: string[]; 
  isPro: boolean;
  onBuy: (item: ShopItem, currency: 'streak' | 'coins') => void; 
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
      <div className="flex items-center flex-wrap gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-blue-100 transition-colors">
          <ArrowLeft size={24} className="text-blue-900" />
        </button>
        <h1 className="text-3xl font-black text-blue-900">Nexora Shop</h1>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2 bg-amber-100 border border-amber-200 px-4 py-2 rounded-full text-amber-600 font-bold shadow-sm">
            <Star size={20} className="fill-amber-500" />
            {streak}
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-200 px-4 py-2 rounded-full text-yellow-700 font-bold shadow-sm">
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black text-yellow-700 border border-yellow-600">
              $
            </div>
            {coins}
          </div>
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
              <div className="flex gap-2">
                <button 
                  onClick={() => onBuy(featuredItem, 'streak')}
                  disabled={(!isPro && streak < featuredItem.price) || purchasedItems.includes(featuredItem.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 text-xs"
                >
                  {purchasedItems.includes(featuredItem.id) ? 'Purchased' : isPro ? 'Free' : `${featuredItem.price} Streak`}
                </button>
                {featuredItem.coinPrice && (
                  <button 
                    onClick={() => onBuy(featuredItem, 'coins')}
                    disabled={(!isPro && coins < featuredItem.coinPrice) || purchasedItems.includes(featuredItem.id)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-yellow-200 disabled:opacity-50 text-xs"
                  >
                    {purchasedItems.includes(featuredItem.id) ? 'Purchased' : isPro ? 'Free' : `${featuredItem.coinPrice} Coins`}
                  </button>
                )}
              </div>
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
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => onBuy(item, 'streak')}
                      disabled={(!isPro && streak < item.price) || purchasedItems.includes(item.id)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50"
                    >
                      {purchasedItems.includes(item.id) ? 'Purchased' : isPro ? 'Free' : `${item.price} Streak`}
                    </button>
                    {item.coinPrice && (
                      <button 
                        onClick={() => onBuy(item, 'coins')}
                        disabled={(!isPro && coins < item.coinPrice) || purchasedItems.includes(item.id)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50"
                      >
                        {purchasedItems.includes(item.id) ? 'Purchased' : isPro ? 'Free' : `${item.coinPrice} Coins`}
                      </button>
                    )}
                  </div>
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
                <div className="mt-auto w-full flex flex-col gap-2">
                  <button 
                    onClick={() => onBuy(item, 'streak')}
                    disabled={(!isPro && streak < item.price) || purchasedItems.includes(item.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {purchasedItems.includes(item.id) ? 'Purchased' : isPro ? 'Free' : `${item.price} Streak`}
                  </button>
                  {item.coinPrice && (
                    <button 
                      onClick={() => onBuy(item, 'coins')}
                      disabled={(!isPro && coins < item.coinPrice) || purchasedItems.includes(item.id)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50"
                    >
                      {purchasedItems.includes(item.id) ? 'Purchased' : isPro ? 'Free' : `${item.coinPrice} Coins`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
