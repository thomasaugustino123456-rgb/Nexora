import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, Sparkles, Shield, Zap, Music, Gift, Check, RotateCcw } from "lucide-react";
import { ShopItem, UserSettings } from "../types";
import { translate } from "../lib/translations";
import { AnimatedSunglasses } from "./AnimatedSunglasses";
import { AnimatedNinjaMask } from "./AnimatedNinjaMask";
import { AnimatedVikingHat } from "./AnimatedVikingHat";
import { AnimatedDetectiveKit } from "./AnimatedDetectiveKit";
import { AnimatedWizardHat } from "./AnimatedWizardHat";
import { AnimatedRoyalCrown } from "./AnimatedRoyalCrown";
import { AnimatedEffectPreview } from "./AnimatedEffectPreview";
import { LivingMascot } from "./LivingMascot";
import { MascotCollectionSection } from "./MascotCollectionSection";
import { getMascotItemCategory, normalizeWearableId, normalizeEffectId, MascotSlotCategory, isWearableCategory, getWearableSubCategory } from "../lib/mascotSystem";

export const SHOP_ITEMS: ShopItem[] = [
  // Power-ups
  {
    id: "streak-protection",
    name: "Streak Shield",
    description: "Protects your streak for 24 hours.",
    price: 6,
    coinPrice: 150,
    rarity: "common",
    effect: "streak-protection",
    icon: "🛡️",
  },
  {
    id: "double-points",
    name: "Double XP",
    description: "Earn 2x points for all challenges today.",
    price: 14,
    coinPrice: 300,
    rarity: "uncommon",
    effect: "double-points",
    icon: "⚡",
  },
  {
    id: "plant-recovery",
    name: "Nano Fertilizer",
    description: "Instantly restores 25% plant health.",
    price: 8,
    coinPrice: 200,
    rarity: "uncommon",
    effect: "power-up",
    icon: "🧪",
  },
  {
    id: "coin-magnet",
    name: "Coin Magnet",
    description: "Earn 30% more coins today.",
    price: 15,
    coinPrice: 400,
    rarity: "uncommon",
    effect: "power-up",
    icon: "🧲",
  },
  {
    id: "xp-boost",
    name: "XP Overdrive",
    description: "Triple XP for the next 3 challenges.",
    price: 25,
    coinPrice: 800,
    rarity: "rare",
    effect: "double-points",
    icon: "🚀",
  },

  // Mascot Wearables & Masks
  {
    id: "skin-cool",
    name: "Cool Shades",
    description: "Some stylish sunglasses.",
    price: 12,
    coinPrice: 120,
    rarity: "common",
    effect: "wearable",
    icon: "🕶️",
  },
  {
    id: "skin-artist",
    name: "Artist Beret",
    description: "For the creative souls.",
    price: 18,
    coinPrice: 135,
    rarity: "common",
    effect: "wearable",
    icon: "🎨",
  },
  {
    id: "skin-viking",
    name: "Viking Helm",
    description: "For the warriors of consistency.",
    price: 25,
    coinPrice: 150,
    rarity: "common",
    effect: "wearable",
    icon: "🪖",
  },
  {
    id: "skin-ninja",
    name: "Ninja Mask",
    description: "Silent but consistent.",
    price: 22,
    coinPrice: 110,
    rarity: "common",
    effect: "wearable",
    icon: "🥷",
  },
  {
    id: "skin-detective",
    name: "Detective Hat",
    description: "Solving the mystery of productivity.",
    price: 16,
    coinPrice: 95,
    rarity: "common",
    effect: "wearable",
    icon: "🕵️",
  },
  {
    id: "skin-crown",
    name: "Royal Crown",
    description: "A majestic crown for your mascot.",
    price: 28,
    coinPrice: 750,
    rarity: "rare",
    effect: "wearable",
    icon: "👑",
  },
  {
    id: "skin-wizard",
    name: "Wizard Hat",
    description: "A magical hat for a magical bottle.",
    price: 35,
    coinPrice: 900,
    rarity: "rare",
    effect: "wearable",
    icon: "🧙",
  },
  {
    id: "skin-space",
    name: "Space Helmet",
    description: "To the moon with your habits!",
    price: 45,
    coinPrice: 1200,
    rarity: "rare",
    effect: "wearable",
    icon: "👨‍🚀",
  },
  {
    id: "skin-apex",
    name: "Quantum Cyber Visor",
    description: "High-tech neon heads-up display analyzing your daily habit metrics.",
    price: 32,
    coinPrice: 900,
    rarity: "epic",
    effect: "wearable",
    icon: "🥽",
  },
  {
    id: "skin-cape",
    name: "Hero Crimson Cape",
    description: "Flowing ruby hero cape with a golden celestial crest on the chest.",
    price: 24,
    coinPrice: 650,
    rarity: "uncommon",
    effect: "wearable",
    icon: "🦸",
  },
  {
    id: "skin-armor",
    name: "Cybernetic Exosuit",
    description: "Reinforced titanium chestplate and glowing plasma power core.",
    price: 42,
    coinPrice: 1100,
    rarity: "epic",
    effect: "wearable",
    icon: "🦾",
  },

  // Effects Power (Particle auras and elemental energy)
  {
    id: "effect-sparkles",
    name: "Starlight Sparkles",
    description: "Twinkling celestial diamond motes with warm starlight aura.",
    price: 18,
    coinPrice: 450,
    rarity: "uncommon",
    effect: "effect-power",
    icon: "✨",
  },
  {
    id: "effect-embers",
    name: "Blazing Fire Embers",
    description: "Rising fiery ember motes and radiant flame heat aura.",
    price: 22,
    coinPrice: 600,
    rarity: "rare",
    effect: "effect-power",
    icon: "🔥",
  },
  {
    id: "effect-orbs",
    name: "Cosmic Planetary Orbs",
    description: "Glowing planetary spheres revolving in 3D orbit around the mascot.",
    price: 30,
    coinPrice: 950,
    rarity: "rare",
    effect: "effect-power",
    icon: "🪐",
  },
  {
    id: "effect-neon",
    name: "Cyber Neon Pulse",
    description: "Futuristic concentric shockwave rings and cyan energetic pulse.",
    price: 25,
    coinPrice: 800,
    rarity: "rare",
    effect: "effect-power",
    icon: "⚡",
  },
  {
    id: "effect-gold-dust",
    name: "Imperial Gold Dust",
    description: "Regal glittering golden stardust halo for disciplined champions.",
    price: 40,
    coinPrice: 1400,
    rarity: "epic",
    effect: "effect-power",
    icon: "👑",
  },
  {
    id: "effect-lightning",
    name: "Storm Lightning Arcs",
    description: "Crackling high-voltage electric plasma arcs radiating pure power.",
    price: 50,
    coinPrice: 1800,
    rarity: "legendary",
    effect: "effect-power",
    icon: "🌩️",
  },

  // Mascot Base Skins (Living Mascot Body Themes)
  {
    id: "skin-emperor",
    name: "Golden Emperor Skin",
    description: "Elite golden skin reflecting true daily discipline.",
    price: 80,
    coinPrice: 3500,
    rarity: "epic",
    effect: "skin",
    icon: "👑✨",
  },
  {
    id: "skin-voidwalker",
    name: "Void Walker Skin",
    description: "A legendary cosmic theme for long-term achievers.",
    price: 95,
    coinPrice: 4500,
    rarity: "epic",
    effect: "skin",
    icon: "🌌👾",
  },
  {
    id: "skin-godmode",
    name: "Cosmic Overlord Skin",
    description: "The ultimate mythical costume showing global mastery.",
    price: 250,
    coinPrice: 12000,
    rarity: "legendary",
    effect: "skin",
    icon: "🪐🔱",
  },

  // Sound packs & Music
  {
    id: "sound-dog",
    name: "Dog Sound Pack",
    description: "Make your mascot bark!",
    price: 5,
    coinPrice: 150,
    rarity: "common",
    effect: "sound-pack",
    icon: "🐶",
  },
  {
    id: "music-fanfare",
    name: "Medieval Fanfare",
    description: "A royal announcement!",
    price: 2,
    coinPrice: 75,
    rarity: "common",
    effect: "music",
    icon: "🎺",
  },
  {
    id: "music-funkee",
    name: "Funkee Monkeee",
    description: "Get groovy!",
    price: 2,
    coinPrice: 75,
    rarity: "common",
    effect: "music",
    icon: "🐒",
  },
  {
    id: "music-triplets",
    name: "Funky Triplets",
    description: "A rhythmic delight.",
    price: 2,
    coinPrice: 75,
    rarity: "common",
    effect: "music",
    icon: "🥁",
  },
  {
    id: "music-forest",
    name: "Forest Treasure",
    description: "A magical forest journey.",
    price: 2,
    coinPrice: 75,
    rarity: "common",
    effect: "music",
    icon: "🌲",
  },
  {
    id: "music-cbpd",
    name: "CBPD Beat",
    description: "A cool urban beat.",
    price: 2,
    coinPrice: 75,
    rarity: "common",
    effect: "music",
    icon: "🎧",
  },
  {
    id: "music-nba",
    name: "NBA Type Beat",
    description: "Ready for the game!",
    price: 2,
    coinPrice: 75,
    rarity: "common",
    effect: "music",
    icon: "🏀",
  },
  {
    id: "music-complicated",
    name: "Complicated",
    description: "A complex melody.",
    price: 2,
    coinPrice: 75,
    rarity: "common",
    effect: "music",
    icon: "🧩",
  },
  {
    id: "music-epic-orchestra",
    name: "Symphonic Anthem Pack",
    description: "An epic, majestic full orchestra theme.",
    price: 60,
    coinPrice: 2500,
    rarity: "epic",
    effect: "music",
    icon: "🎼🎭",
  },
  {
    id: "badge-ultimate",
    name: "Ultimate Mythic Emblem",
    description: "Show off a prestigious shiny emblem beside your username.",
    price: 300,
    coinPrice: 15000,
    rarity: "legendary",
    effect: "power-up",
    icon: "⚜️🏅",
  },

  // Gifts
  {
    id: "gift-lucky",
    name: "Lucky Clover",
    description: "A small gift with big surprise potential.",
    price: 5,
    coinPrice: 150,
    rarity: "common",
    effect: "gift",
    icon: "🍀",
  },
  {
    id: "gift-party",
    name: "Party Popper",
    description: "Celebrate your progress with a surprise!",
    price: 7,
    coinPrice: 150,
    rarity: "common",
    effect: "gift",
    icon: "🎉",
  },
  {
    id: "gift-mystery",
    name: "Mystery Gift",
    description: "A surprise gift box! (Buy one, get one free!)",
    price: 8,
    coinPrice: 250,
    rarity: "uncommon",
    effect: "gift",
    icon: "🎁",
  },
  {
    id: "gift-premium",
    name: "Premium Gift",
    description: "A high-value surprise for your library.",
    price: 18,
    coinPrice: 450,
    rarity: "uncommon",
    effect: "gift",
    icon: "💝",
  },
  {
    id: "gift-gold",
    name: "Golden Chest",
    description: "Contains rare items and majestic skins.",
    price: 30,
    coinPrice: 1000,
    rarity: "rare",
    effect: "gift",
    icon: "💰",
  },
  {
    id: "gift-diamond",
    name: "Diamond Box",
    description: "The ultimate gift for the most dedicated users.",
    price: 60,
    coinPrice: 1500,
    rarity: "rare",
    effect: "gift",
    icon: "💎",
  },
  // Pro Exclusive Items
  {
    id: "pro-skin-apex",
    name: "Apex Quantum Visor",
    description: "Pro-exclusive cyberpunk holographic helm with reactive particle halo.",
    price: 50,
    coinPrice: 2000,
    rarity: "legendary",
    effect: "wearable",
    icon: "🥽✨",
    proOnly: true,
  },
  {
    id: "pro-music-quantum-zen",
    name: "Quantum Zen Soundscape",
    description: "Pro-exclusive binaural focus beats for ultra-deep work & meditation.",
    price: 0,
    coinPrice: 0,
    rarity: "epic",
    effect: "music",
    icon: "🧘‍♂️⚡",
    proOnly: true,
  },
  {
    id: "pro-powerup-overdrive",
    name: "Neural Overdrive Chip",
    description: "Pro-exclusive chip granting 3x rewards on all completed daily habits.",
    price: 30,
    coinPrice: 1200,
    rarity: "legendary",
    effect: "power-up",
    icon: "🦾🔥",
    proOnly: true,
  },
];

export function ShopScreen({
  streak,
  coins,
  purchasedItems,
  isPro,
  onBuy,
  onBack,
  settings,
  onEquipMascotSlot,
  onUnequipMascotSlot,
}: {
  streak: number;
  coins: number;
  purchasedItems: string[];
  isPro: boolean;
  onBuy: (item: ShopItem, currency: "streak" | "coins") => void;
  onBack: () => void;
  settings?: UserSettings;
  onEquipMascotSlot?: (itemId: string, category: MascotSlotCategory) => void;
  onUnequipMascotSlot?: (category: MascotSlotCategory) => void;
}) {
  const lang = settings?.language || "en";
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'skins' | 'wearables' | 'effects' | 'powerups' | 'music' | 'gifts'>('all');

  const activeSkin = settings?.activeSkin || 'blue-slim';
  const activeHat = settings?.activeHat || 'none';
  const activeEffect = settings?.activeEffect || 'none';

  const getSkinLabel = (id: string) => {
    const map: Record<string, string> = {
      'blue-slim': 'Blue Slim (Classic)',
      'fire-slim': 'Fire Slim 🔥',
      'water-slim': 'Water Slim 💧',
      'shield-slim': 'Shield Slim 🛡️',
      'lightning-slim': 'Lightning Slim ⚡',
      'earth-slim': 'Earth Slim 🌿',
      'skin-emperor': 'Golden Emperor 👑',
      'skin-voidwalker': 'Void Walker 🌌',
      'skin-godmode': 'Cosmic Overlord 🪐',
    };
    return map[id] || id;
  };

  const getHatLabel = (id: string) => {
    const map: Record<string, string> = {
      'none': 'None Equipped',
      'cool': 'Cool Shades 🕶️',
      'artist': 'Artist Beret 🎨',
      'viking': 'Viking Helm 🪖',
      'ninja': 'Ninja Mask 🥷',
      'detective': 'Detective Hat 🕵️',
      'crown': 'Royal Crown 👑',
      'wizard': 'Wizard Hat 🧙',
      'space': 'Space Helmet 👨‍🚀',
      'apex': 'Apex Quantum Visor 🥽',
    };
    return map[id] || id;
  };

  const getEffectLabel = (id: string) => {
    const map: Record<string, string> = {
      'none': 'None Equipped',
      'sparkles': 'Starlight Sparkles ✨',
      'embers': 'Blazing Embers 🔥',
      'orbs': 'Cosmic Planetary Orbs 🪐',
      'neon': 'Cyber Neon Pulse ⚡',
      'gold-dust': 'Imperial Gold Dust 👑',
      'lightning': 'Storm Lightning Arcs 🌩️',
    };
    return map[id] || id;
  };

  const featuredItem = SHOP_ITEMS[0];
  const powerUps = SHOP_ITEMS.filter(
    (item) =>
      item.effect === "streak-protection" ||
      item.effect === "double-points" ||
      item.effect === "power-up",
  );
  const musicSounds = SHOP_ITEMS.filter(
    (item) => item.effect === "music" || item.effect === "sound-pack",
  );
  const wearables = SHOP_ITEMS.filter((item) => item.effect === "wearable");
  const effectsPower = SHOP_ITEMS.filter((item) => item.effect === "effect-power");
  const baseSkins = SHOP_ITEMS.filter((item) => item.effect === "skin");
  const gifts = SHOP_ITEMS.filter((item) => item.effect === "gift");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 sm:p-6 pb-28 max-w-3xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2.5 mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-1.5 rounded-full hover:bg-blue-100 active:scale-95 transition-all cursor-pointer text-blue-900 shrink-0"
            title="Back"
          >
            <ArrowLeft size={22} className="stroke-[2.5]" />
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight truncate">
            Nexora {translate("Shop", lang)}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-200/90 px-3 sm:px-3.5 py-1.5 rounded-full text-amber-800 font-black shadow-xs text-sm sm:text-base">
            <Star size={18} className="fill-amber-400 text-amber-500 shrink-0" />
            <span className="tabular-nums">{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-50/90 border border-yellow-200/90 px-3 sm:px-3.5 py-1.5 rounded-full text-yellow-900 font-black shadow-xs text-sm sm:text-base">
            <div className="w-5 h-5 bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-[11px] font-black text-yellow-950 border border-yellow-600/50 shadow-xs shrink-0">
              $
            </div>
            <span className="tabular-nums">{coins}</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3-SLOT LIVE WARDROBE STAGE */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-blue-50/90 via-white to-amber-50/70 rounded-3xl p-5 sm:p-6 border-2 border-blue-200/90 shadow-md mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* Realtime Mascot Avatar Rendering all 3 slots simultaneously */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/95 rounded-2xl border border-blue-100 shadow-sm shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 relative flex items-center justify-center">
              <LivingMascot
                mascotId={activeSkin as any}
                hat={activeHat as any}
                effect={activeEffect as any}
                interactive={true}
                showSpeech={false}
                className="w-full h-full"
              />
            </div>
            <div className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest mt-2 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" />
              Live 3-Slot Wardrobe
            </div>
          </div>

          {/* 3 Slot Equipment Status Cards */}
          <div className="flex-1 w-full space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider rounded-full">
                  Triple-Slot System
                </span>
                <span className="text-[11px] text-blue-900/70 font-semibold">
                  Wear 1 from each category at the same time
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Slot 1: Mascot Skin */}
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider block mb-0.5">
                    🎨 Slot 1: Body Skin
                  </span>
                  <p className="text-xs font-black text-slate-800 truncate" title={getSkinLabel(activeSkin)}>
                    {getSkinLabel(activeSkin)}
                  </p>
                </div>
                {activeSkin !== 'blue-slim' && (
                  <button
                    onClick={() => onEquipMascotSlot?.('blue-slim', 'skin')}
                    className="mt-2.5 text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={11} /> Reset Base
                  </button>
                )}
              </div>

              {/* Slot 2: Wearable & Mask */}
              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider block mb-0.5">
                    🥷 Slot 2: Wearable & Mask
                  </span>
                  <p className="text-xs font-black text-slate-800 truncate" title={getHatLabel(activeHat)}>
                    {getHatLabel(activeHat)}
                  </p>
                </div>
                {activeHat !== 'none' && (
                  <button
                    onClick={() => onUnequipMascotSlot?.('wearable')}
                    className="mt-2.5 text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Unequip Slot
                  </button>
                )}
              </div>

              {/* Slot 3: Effects Power */}
              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider block mb-0.5">
                    ⚡ Slot 3: Effects Power
                  </span>
                  <p className="text-xs font-black text-slate-800 truncate" title={getEffectLabel(activeEffect)}>
                    {getEffectLabel(activeEffect)}
                  </p>
                </div>
                {activeEffect !== 'none' && (
                  <button
                    onClick={() => onUnequipMascotSlot?.('effect-power')}
                    className="mt-2.5 text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Unequip Slot
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Item Deal */}
      <div className="mb-8">
        <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-3">
          Featured Deal
        </h2>
        <div className="relative overflow-hidden glass-card p-5 sm:p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-200">
          <div className="absolute top-0 right-0 p-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
            Hot!
          </div>
          <div className="flex items-center gap-5">
            <div className="text-5xl drop-shadow-lg flex items-center justify-center min-w-[64px]">
              {featuredItem.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-blue-900">
                {featuredItem.name}
              </h3>
              <p className="text-xs text-blue-900/60 mb-3">
                {featuredItem.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onBuy(featuredItem, "streak")}
                  disabled={
                    (!(isPro && featuredItem.effect === "music") &&
                      streak < featuredItem.price) ||
                    purchasedItems.includes(featuredItem.id)
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-black transition-all active:scale-95 shadow-md shadow-blue-200 disabled:opacity-50 text-xs cursor-pointer"
                >
                  {purchasedItems.includes(featuredItem.id)
                    ? "Purchased"
                    : isPro && featuredItem.effect === "music"
                      ? "Free"
                      : `${featuredItem.price} Streak`}
                </button>
                {featuredItem.coinPrice && (
                  <button
                    onClick={() => onBuy(featuredItem, "coins")}
                    disabled={
                      (!(isPro && featuredItem.effect === "music") &&
                        coins < featuredItem.coinPrice) ||
                      purchasedItems.includes(featuredItem.id)
                    }
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-black transition-all active:scale-95 shadow-md shadow-yellow-200 disabled:opacity-50 text-xs cursor-pointer"
                  >
                    {purchasedItems.includes(featuredItem.id)
                      ? "Purchased"
                      : isPro && featuredItem.effect === "music"
                        ? "Free"
                        : `${featuredItem.coinPrice} Coins`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {[
          { id: 'all', label: 'All Items', icon: Star },
          { id: 'skins', label: '🎨 Base Skins', icon: Sparkles },
          { id: 'wearables', label: '🥷 Wearables & Masks', icon: Shield },
          { id: 'effects', label: '⚡ Effects Power', icon: Zap },
          { id: 'powerups', label: '🛡️ Power-Ups', icon: Shield },
          { id: 'music', label: '🎵 Music & Sounds', icon: Music },
          { id: 'gifts', label: '🎁 Gifts', icon: Gift },
        ].map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                  : 'bg-white text-blue-900/70 border border-blue-100 hover:bg-blue-50'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Categories Content */}
      <div className="space-y-10">
        {/* 1. Base Mascot Skins (Collection) */}
        {(selectedCategory === 'all' || selectedCategory === 'skins') && (
          <section>
            <MascotCollectionSection
              coins={coins}
              activeMascotSkin={activeSkin}
              purchasedItems={purchasedItems}
              activeHat={activeHat}
              activeEffect={activeEffect}
              onEquip={(mascotId) => {
                onEquipMascotSlot ? onEquipMascotSlot(mascotId, 'skin') : onBuy({ id: mascotId, name: mascotId, price: 0, coinPrice: 0, effect: 'skin', icon: '✨', description: '' }, 'coins');
              }}
              onBuy={(item, currency) => onBuy({ id: item.id, name: item.name, price: 0, coinPrice: item.coinPrice, effect: 'skin', icon: '✨', description: '' }, 'coins')}
            />
          </section>
        )}

        {/* 2. Mascot Wearables & Masks Horizontal Showcase */}
        {(selectedCategory === 'all' || selectedCategory === 'wearables') && (
          <section>
            <MascotSkinsHorizontalShowcase
              skins={wearables}
              streak={streak}
              coins={coins}
              isPro={isPro}
              purchasedItems={purchasedItems}
              activeHat={activeHat}
              onBuy={onBuy}
              onEquipMascotSlot={onEquipMascotSlot}
              onUnequipMascotSlot={onUnequipMascotSlot}
            />
          </section>
        )}

        {/* 3. Effects Power Auras Showcase */}
        {(selectedCategory === 'all' || selectedCategory === 'effects') && (
          <section>
            <MascotEffectsHorizontalShowcase
              effects={effectsPower}
              streak={streak}
              coins={coins}
              isPro={isPro}
              purchasedItems={purchasedItems}
              activeEffect={activeEffect}
              onBuy={onBuy}
              onEquipMascotSlot={onEquipMascotSlot}
              onUnequipMascotSlot={onUnequipMascotSlot}
            />
          </section>
        )}

        {/* 4. Power-Ups */}
        {(selectedCategory === 'all' || selectedCategory === 'powerups') && (
          <section>
            <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">
              Power-Ups & Boosters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {powerUps.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  streak={streak}
                  coins={coins}
                  isPro={isPro}
                  purchasedItems={purchasedItems}
                  settings={settings}
                  onBuy={onBuy}
                  onEquipMascotSlot={onEquipMascotSlot}
                  onUnequipMascotSlot={onUnequipMascotSlot}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Music & Sound Packs */}
        {(selectedCategory === 'all' || selectedCategory === 'music') && (
          <section>
            <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">
              Music & Sound Packs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {musicSounds.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  streak={streak}
                  coins={coins}
                  isPro={isPro}
                  purchasedItems={purchasedItems}
                  settings={settings}
                  onBuy={onBuy}
                  onEquipMascotSlot={onEquipMascotSlot}
                  onUnequipMascotSlot={onUnequipMascotSlot}
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. Mystery Gifts */}
        {(selectedCategory === 'all' || selectedCategory === 'gifts') && (
          <section>
            <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">
              Mystery Gifts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  streak={streak}
                  coins={coins}
                  isPro={isPro}
                  purchasedItems={purchasedItems}
                  settings={settings}
                  onBuy={onBuy}
                  onEquipMascotSlot={onEquipMascotSlot}
                  onUnequipMascotSlot={onUnequipMascotSlot}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

function ShopItemCard({
  item,
  streak,
  coins,
  isPro,
  purchasedItems,
  settings,
  onBuy,
  onEquipMascotSlot,
  onUnequipMascotSlot,
}: {
  item: ShopItem;
  streak: number;
  coins: number;
  isPro: boolean;
  purchasedItems: string[];
  settings?: UserSettings;
  onBuy: (item: ShopItem, currency: "streak" | "coins") => void;
  onEquipMascotSlot?: (itemId: string, category: MascotSlotCategory) => void;
  onUnequipMascotSlot?: (category: MascotSlotCategory) => void;
}) {
  const isFreeForPro = isPro && (item.effect === "music" || item.price === 0);
  const isProLocked = item.proOnly && !isPro;
  const isPurchased = purchasedItems.includes(item.id);

  const category = getMascotItemCategory(item.id, item.effect);
  const isMascotItem = category === 'skin' || isWearableCategory(category) || category === 'effect-power';

  let isEquipped = false;
  if (isMascotItem) {
    if (category === 'skin') {
      isEquipped = (settings?.activeSkin || 'blue-slim') === item.id;
    } else if (category === 'wearable-eye') {
      isEquipped = (settings?.activeEye || 'none') === normalizeWearableId(item.id);
    } else if (category === 'wearable-head') {
      isEquipped = (settings?.activeHat || 'none') === normalizeWearableId(item.id);
    } else if (category === 'wearable-clothes') {
      isEquipped = (settings?.activeClothes || 'none') === normalizeWearableId(item.id);
    } else if (isWearableCategory(category)) {
      const sub = getWearableSubCategory(item.id);
      const norm = normalizeWearableId(item.id);
      if (sub === 'eye') isEquipped = (settings?.activeEye || 'none') === norm;
      else if (sub === 'clothes') isEquipped = (settings?.activeClothes || 'none') === norm;
      else isEquipped = (settings?.activeHat || 'none') === norm;
    } else if (category === 'effect-power') {
      isEquipped = (settings?.activeEffect || 'none') === normalizeEffectId(item.id);
    }
  }

  // Rarity badges mapping
  const rarityConfig = {
    common: { bg: "bg-slate-100 text-slate-600 border-slate-200", label: "Common" },
    uncommon: { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "Uncommon" },
    rare: { bg: "bg-blue-50 text-blue-600 border-blue-100", label: "Rare" },
    epic: { bg: "bg-purple-50 text-purple-700 border-purple-200", label: "Epic" },
    legendary: { bg: "bg-amber-50 text-amber-700 border-amber-300 animate-pulse", label: "Legendary" },
  };

  const rarityName = item.rarity || "common";
  const { bg: rarityBg, label: rarityLabel } = rarityConfig[rarityName];

  return (
    <div
      className={`glass-card p-5 flex flex-col justify-between gap-4 border hover:border-blue-300 transition-all duration-300 relative ${
        item.proOnly
          ? "border-amber-300 bg-amber-50/20"
          : rarityName === "epic" 
            ? "ring-1 ring-purple-400/20 shadow-purple-500/5 shadow-md" 
            : rarityName === "legendary"
              ? "ring-2 ring-amber-400/30 shadow-amber-500/10 shadow-lg"
              : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl p-2 bg-slate-50 rounded-xl relative flex items-center justify-center min-w-[54px] min-h-[54px] shrink-0">
          {item.effect === "effect-power" ? (
            <AnimatedEffectPreview effectId={item.id} className="w-12 h-12" />
          ) : item.id === "skin-cool" ? (
            <AnimatedSunglasses className="w-12 h-8" />
          ) : item.id === "skin-ninja" ? (
            <AnimatedNinjaMask className="w-10 h-10" />
          ) : item.id === "skin-viking" ? (
            <AnimatedVikingHat className="w-10 h-10" />
          ) : item.id === "skin-detective" ? (
            <AnimatedDetectiveKit className="w-10 h-10" />
          ) : item.id === "skin-wizard" ? (
            <AnimatedWizardHat className="w-10 h-10" />
          ) : item.id === "skin-crown" ? (
            <AnimatedRoyalCrown className="w-10 h-10" />
          ) : (
            item.icon
          )}
          {item.proOnly && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow">
              PRO
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-1">
            <h3 className="font-bold text-blue-950 text-sm truncate">{item.name}</h3>
            <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded border ${rarityBg}`}>
              {rarityLabel}
            </span>
            {item.proOnly && (
              <span className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[8px] font-black uppercase rounded-full flex items-center gap-0.5">
                👑 Pro Exclusive
              </span>
            )}
            {isFreeForPro && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black uppercase rounded-full">
                Pro Free
              </span>
            )}
          </div>
          <p className="text-[10px] text-blue-900/60 font-medium leading-tight line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-auto">
        {isProLocked ? (
          <div className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-2 rounded-lg text-[10px] font-black text-center uppercase tracking-wider shadow">
            👑 PRO MEMBERSHIP REQUIRED
          </div>
        ) : isPurchased ? (
          isMascotItem ? (
            isEquipped ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-300 py-1.5 rounded-lg text-[10px] font-black text-center flex items-center justify-center gap-1">
                  <Check size={12} /> EQUIPPED
                </div>
                <button
                  onClick={() => onUnequipMascotSlot?.(category)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Unequip
                </button>
              </div>
            ) : (
              <button
                onClick={() => onEquipMascotSlot?.(item.id, category)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <Zap size={12} /> EQUIP TO MASCOT
              </button>
            )
          ) : (
            <div className="w-full bg-slate-100 text-slate-500 py-1.5 rounded-lg text-[10px] font-black text-center uppercase tracking-wider">
              Purchased & In Vault
            </div>
          )
        ) : (
          <div className="flex gap-1.5">
            {item.price > 0 && (
              <button
                onClick={() => onBuy(item, "streak")}
                disabled={!isFreeForPro && streak < item.price}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isFreeForPro ? "Free" : `${item.price} Streak`}
              </button>
            )}
            {item.coinPrice !== undefined && (
              <button
                onClick={() => onBuy(item, "coins")}
                disabled={!isFreeForPro && coins < item.coinPrice}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isFreeForPro ? "Free" : `${item.coinPrice} Coins`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MascotSkinsHorizontalShowcase({
  skins,
  streak,
  coins,
  isPro,
  purchasedItems,
  activeHat,
  onBuy,
  onEquipMascotSlot,
  onUnequipMascotSlot,
}: {
  skins: ShopItem[];
  streak: number;
  coins: number;
  isPro: boolean;
  purchasedItems: string[];
  activeHat?: string;
  onBuy: (item: ShopItem, currency: "streak" | "coins") => void;
  onEquipMascotSlot?: (itemId: string, category: MascotSlotCategory) => void;
  onUnequipMascotSlot?: (category: MascotSlotCategory) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / (clientWidth * 0.85));
      if (index >= 0 && index < skins.length) {
        setActiveIndex(index);
      }
    }
  };

  const scrollToItem = (index: number) => {
    if (!containerRef.current) return;
    const targetIndex = Math.max(0, Math.min(index, skins.length - 1));
    const cardElement = containerRef.current.children[targetIndex] as HTMLElement;
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveIndex(targetIndex);
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-xs font-black text-blue-900/50 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500 fill-amber-400" />
          Mascot Wearables & Masks (Slot 2)
        </h2>
        <p className="text-[11px] text-blue-900/60 font-medium">
          Equips on your mascot head or face alongside your body skin and effects power!
        </p>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 pt-1 scrollbar-none scroll-smooth"
      >
        {skins.map((item, idx) => {
          const isFreeForPro = isPro && (item.effect === "music" || item.price === 0);
          const isProLocked = item.proOnly && !isPro;
          const isPurchased = purchasedItems.includes(item.id);
          const isEquipped = (activeHat || 'none') === normalizeWearableId(item.id);

          const rarityConfig = {
            common: { bg: "bg-slate-100 text-slate-600 border-slate-200", label: "Common" },
            uncommon: { bg: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Uncommon" },
            rare: { bg: "bg-blue-50 text-blue-600 border-blue-200", label: "Rare" },
            epic: { bg: "bg-purple-100 text-purple-700 border-purple-300", label: "Epic" },
            legendary: { bg: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse", label: "Legendary" },
          };
          const rarityName = item.rarity || "common";
          const { bg: rarityBg, label: rarityLabel } = rarityConfig[rarityName];

          return (
            <div
              key={item.id}
              className="w-[280px] sm:w-[320px] snap-center shrink-0 glass-card p-5 flex flex-col justify-between border border-blue-100/90 bg-white/95 shadow-md hover:shadow-lg transition-all rounded-2xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top Header */}
              <div className="flex items-center justify-between gap-2 z-10 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border ${rarityBg}`}>
                    {rarityLabel}
                  </span>
                  {item.proOnly && (
                    <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-black uppercase rounded-full">
                      👑 Pro
                    </span>
                  )}
                  {isFreeForPro && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded-full">
                      Pro Free
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {idx + 1} of {skins.length}
                </span>
              </div>

              {/* Card Body Showcase */}
              <div className="flex items-center gap-4 my-2 z-10">
                <div className="flex items-center justify-center shrink-0 text-5xl drop-shadow-md py-1">
                  {item.id === "skin-cool" ? (
                    <AnimatedSunglasses className="w-20 h-12" />
                  ) : item.id === "skin-ninja" ? (
                    <AnimatedNinjaMask className="w-18 h-18" />
                  ) : item.id === "skin-viking" ? (
                    <AnimatedVikingHat className="w-18 h-18" />
                  ) : item.id === "skin-detective" ? (
                    <AnimatedDetectiveKit className="w-18 h-18" />
                  ) : item.id === "skin-wizard" ? (
                    <AnimatedWizardHat className="w-18 h-18" />
                  ) : item.id === "skin-crown" ? (
                    <AnimatedRoyalCrown className="w-18 h-18" />
                  ) : (
                    item.icon
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-base font-black text-blue-950 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs text-blue-900/70 font-medium leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="z-10 pt-3 border-t border-slate-100 mt-2">
                {isProLocked ? (
                  <div className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-2.5 rounded-xl text-xs font-black text-center uppercase tracking-wider shadow-md">
                    👑 PRO MEMBERSHIP REQUIRED
                  </div>
                ) : isPurchased ? (
                  isEquipped ? (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 bg-emerald-100 border border-emerald-300 text-emerald-800 py-2.5 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1.5">
                        <Check size={14} /> EQUIPPED IN SLOT 2
                      </div>
                      <button
                        onClick={() => onUnequipMascotSlot?.('wearable')}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        Unequip
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onEquipMascotSlot?.(item.id, 'wearable')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md shadow-blue-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap size={14} /> EQUIP WEARABLE
                    </button>
                  )
                ) : (
                  <div className="flex gap-2">
                    {item.price > 0 && (
                      <button
                        onClick={() => onBuy(item, "streak")}
                        disabled={!isFreeForPro && streak < item.price}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-200 cursor-pointer"
                      >
                        {isFreeForPro ? "Free with Pro" : `${item.price} Streak`}
                      </button>
                    )}
                    {item.coinPrice !== undefined && (
                      <button
                        onClick={() => onBuy(item, "coins")}
                        disabled={!isFreeForPro && coins < item.coinPrice}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-yellow-200 cursor-pointer"
                      >
                        {isFreeForPro ? "Free with Pro" : `${item.coinPrice} Coins`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {skins.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => scrollToItem(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === idx
                ? "w-6 bg-blue-600 shadow-sm"
                : "w-2 bg-blue-200 hover:bg-blue-300"
            }`}
            title={s.name}
          />
        ))}
      </div>
    </div>
  );
}

function MascotEffectsHorizontalShowcase({
  effects,
  streak,
  coins,
  isPro,
  purchasedItems,
  activeEffect,
  onBuy,
  onEquipMascotSlot,
  onUnequipMascotSlot,
}: {
  effects: ShopItem[];
  streak: number;
  coins: number;
  isPro: boolean;
  purchasedItems: string[];
  activeEffect?: string;
  onBuy: (item: ShopItem, currency: "streak" | "coins") => void;
  onEquipMascotSlot?: (itemId: string, category: MascotSlotCategory) => void;
  onUnequipMascotSlot?: (category: MascotSlotCategory) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    if (clientWidth > 0) {
      const index = Math.round(scrollLeft / (clientWidth * 0.85));
      if (index >= 0 && index < effects.length) {
        setActiveIndex(index);
      }
    }
  };

  const scrollToItem = (index: number) => {
    if (!containerRef.current) return;
    const targetIndex = Math.max(0, Math.min(index, effects.length - 1));
    const cardElement = containerRef.current.children[targetIndex] as HTMLElement;
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveIndex(targetIndex);
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-xs font-black text-blue-900/50 uppercase tracking-widest flex items-center gap-1.5">
          <Zap size={14} className="text-amber-500 fill-amber-400" />
          Effects Power Auras (Slot 3)
        </h2>
        <p className="text-[11px] text-blue-900/60 font-medium">
          Radiant elemental particles, orbiting spheres, and shockwaves that float around your mascot!
        </p>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 pt-1 scrollbar-none scroll-smooth"
      >
        {effects.map((item, idx) => {
          const isPurchased = purchasedItems.includes(item.id);
          const isEquipped = (activeEffect || 'none') === normalizeEffectId(item.id);

          const rarityConfig = {
            common: { bg: "bg-slate-100 text-slate-600 border-slate-200", label: "Common" },
            uncommon: { bg: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Uncommon" },
            rare: { bg: "bg-blue-50 text-blue-600 border-blue-200", label: "Rare" },
            epic: { bg: "bg-purple-100 text-purple-700 border-purple-300", label: "Epic" },
            legendary: { bg: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse", label: "Legendary" },
          };
          const rarityName = item.rarity || "rare";
          const { bg: rarityBg, label: rarityLabel } = rarityConfig[rarityName];

          return (
            <div
              key={item.id}
              className="w-[280px] sm:w-[320px] snap-center shrink-0 glass-card p-5 flex flex-col justify-between border border-amber-200/60 bg-gradient-to-br from-white via-white to-amber-50/40 shadow-md hover:shadow-lg transition-all rounded-2xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top Header */}
              <div className="flex items-center justify-between gap-2 z-10 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border ${rarityBg}`}>
                    {rarityLabel}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[9px] font-black uppercase rounded-full">
                    ⚡ Slot 3
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {idx + 1} of {effects.length}
                </span>
              </div>

              {/* Card Body Showcase */}
              <div className="flex items-center gap-4 my-2 z-10">
                <div className="flex items-center justify-center shrink-0 w-20 h-20 bg-slate-900/5 rounded-2xl p-2 border border-slate-200/50">
                  <AnimatedEffectPreview effectId={item.id} className="w-full h-full" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-base font-black text-blue-950 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-xs text-blue-900/70 font-medium leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="z-10 pt-3 border-t border-slate-100 mt-2">
                {isPurchased ? (
                  isEquipped ? (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 bg-amber-100 border border-amber-300 text-amber-800 py-2.5 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1.5">
                        <Check size={14} /> EQUIPPED IN SLOT 3
                      </div>
                      <button
                        onClick={() => onUnequipMascotSlot?.('effect-power')}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        Unequip
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onEquipMascotSlot?.(item.id, 'effect-power')}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md shadow-amber-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap size={14} /> EQUIP EFFECT
                    </button>
                  )
                ) : (
                  <div className="flex gap-2">
                    {item.price > 0 && (
                      <button
                        onClick={() => onBuy(item, "streak")}
                        disabled={streak < item.price}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-200 cursor-pointer"
                      >
                        {item.price} Streak
                      </button>
                    )}
                    {item.coinPrice !== undefined && (
                      <button
                        onClick={() => onBuy(item, "coins")}
                        disabled={coins < item.coinPrice}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-yellow-200 cursor-pointer"
                      >
                        {item.coinPrice} Coins
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {effects.map((e, idx) => (
          <button
            key={e.id}
            onClick={() => scrollToItem(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === idx
                ? "w-6 bg-amber-500 shadow-sm"
                : "w-2 bg-amber-200 hover:bg-amber-300"
            }`}
            title={e.name}
          />
        ))}
      </div>
    </div>
  );
}

