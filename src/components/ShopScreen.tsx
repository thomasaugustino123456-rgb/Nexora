import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, Sparkles } from "lucide-react";
import { ShopItem, UserSettings } from "../types";
import { translate } from "../lib/translations";
import { AnimatedSunglasses } from "./AnimatedSunglasses";
import { AnimatedNinjaMask } from "./AnimatedNinjaMask";
import { AnimatedVikingHat } from "./AnimatedVikingHat";
import { AnimatedDetectiveKit } from "./AnimatedDetectiveKit";
import { AnimatedWizardHat } from "./AnimatedWizardHat";
import { AnimatedRoyalCrown } from "./AnimatedRoyalCrown";
import { MascotCollectionSection } from "./MascotCollectionSection";

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

  // Mascot Skins (Hats/Accessories)
  {
    id: "skin-cool",
    name: "Cool Shades",
    description: "Some stylish sunglasses.",
    price: 12,
    coinPrice: 120,
    rarity: "common",
    effect: "skin",
    icon: "🕶️",
  },
  {
    id: "skin-artist",
    name: "Artist Beret",
    description: "For the creative souls.",
    price: 18,
    coinPrice: 135,
    rarity: "common",
    effect: "skin",
    icon: "🎨",
  },
  {
    id: "skin-viking",
    name: "Viking Helm",
    description: "For the warriors of consistency.",
    price: 25,
    coinPrice: 150,
    rarity: "common",
    effect: "skin",
    icon: "🪖",
  },
  {
    id: "skin-ninja",
    name: "Ninja Mask",
    description: "Silent but consistent.",
    price: 22,
    coinPrice: 110,
    rarity: "common",
    effect: "skin",
    icon: "🥷",
  },
  {
    id: "skin-detective",
    name: "Detective Hat",
    description: "Solving the mystery of productivity.",
    price: 16,
    coinPrice: 95,
    rarity: "common",
    effect: "skin",
    icon: "🕵️",
  },
  {
    id: "skin-crown",
    name: "Royal Crown",
    description: "A majestic crown for your mascot.",
    price: 28,
    coinPrice: 750,
    rarity: "rare",
    effect: "skin",
    icon: "👑",
  },
  {
    id: "skin-wizard",
    name: "Wizard Hat",
    description: "A magical hat for a magical bottle.",
    price: 35,
    coinPrice: 900,
    rarity: "rare",
    effect: "skin",
    icon: "🧙",
  },
  {
    id: "skin-space",
    name: "Space Helmet",
    description: "To the moon with your habits!",
    price: 45,
    coinPrice: 1200,
    rarity: "rare",
    effect: "skin",
    icon: "👨‍🚀",
  },
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
    effect: "skin",
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
}: {
  streak: number;
  coins: number;
  purchasedItems: string[];
  isPro: boolean;
  onBuy: (item: ShopItem, currency: "streak" | "coins") => void;
  onBack: () => void;
  settings?: UserSettings;
}) {
  const lang = settings?.language || "en";
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
  const skins = SHOP_ITEMS.filter((item) => item.effect === "skin");
  const gifts = SHOP_ITEMS.filter((item) => item.effect === "gift");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 pb-24 max-w-2xl mx-auto"
    >
      <div className="flex items-center flex-wrap gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-blue-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-blue-900" />
        </button>
        <h1 className="text-3xl font-black text-blue-900">Nexora {translate("Shop", lang)}</h1>
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
        <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">
          Featured Deal
        </h2>
        <div className="relative overflow-hidden glass-card p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-200">
          <div className="absolute top-0 right-0 p-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
            Hot!
          </div>
          <div className="flex items-center gap-6">
            <div className="text-6xl drop-shadow-lg flex items-center justify-center min-w-[70px]">
              {featuredItem.id === "skin-cool" ? (
                <AnimatedSunglasses className="w-20 h-12" />
              ) : featuredItem.id === "skin-ninja" ? (
                <AnimatedNinjaMask className="w-16 h-16" />
              ) : featuredItem.id === "skin-viking" ? (
                <AnimatedVikingHat className="w-16 h-16" />
              ) : featuredItem.id === "skin-detective" ? (
                <AnimatedDetectiveKit className="w-16 h-16" />
              ) : featuredItem.id === "skin-wizard" ? (
                <AnimatedWizardHat className="w-16 h-16" />
              ) : featuredItem.id === "skin-crown" ? (
                <AnimatedRoyalCrown className="w-16 h-16" />
              ) : (
                featuredItem.icon
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-blue-900">
                {featuredItem.name}
              </h3>
              <p className="text-sm text-blue-900/60 mb-4">
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 text-xs"
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
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-black transition-all active:scale-95 shadow-lg shadow-yellow-200 disabled:opacity-50 text-xs"
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

      {/* Categories */}
      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-black text-blue-900/40 uppercase tracking-widest mb-4">
            Power-Ups
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
                onBuy={onBuy}
              />
            ))}
          </div>
        </section>

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
                onBuy={onBuy}
              />
            ))}
          </div>
        </section>

        <section>
          <MascotCollectionSection
            coins={coins}
            activeMascotSkin={settings?.activeSkin || 'blue-slim'}
            purchasedItems={purchasedItems}
            onEquip={(mascotId) => onBuy({ id: mascotId, name: mascotId, price: 0, coinPrice: 0, effect: 'skin', icon: '✨', description: '' }, 'coins')}
            onBuy={(item, currency) => onBuy({ id: item.id, name: item.name, price: 0, coinPrice: item.coinPrice, effect: 'skin', icon: '✨', description: '' }, 'coins')}
          />
        </section>

        <section>
          <MascotSkinsHorizontalShowcase
            skins={skins}
            streak={streak}
            coins={coins}
            isPro={isPro}
            purchasedItems={purchasedItems}
            onBuy={onBuy}
          />
        </section>

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
                onBuy={onBuy}
              />
            ))}
          </div>
        </section>
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
  onBuy,
}: {
  item: ShopItem;
  streak: number;
  coins: number;
  isPro: boolean;
  purchasedItems: string[];
  onBuy: (item: ShopItem, currency: "streak" | "coins") => void;
}) {
  const isFreeForPro = isPro && (item.effect === "music" || item.price === 0);
  const isProLocked = item.proOnly && !isPro;

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
          {item.id === "skin-cool" ? (
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
          <p className="text-[10px] text-blue-900/40 font-medium leading-tight line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-auto">
        {isProLocked ? (
          <div className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-2 rounded-lg text-[10px] font-black text-center uppercase tracking-wider shadow">
            👑 PRO MEMBERSHIP REQUIRED
          </div>
        ) : (
          <>
            {item.price > 0 && (
              <button
                onClick={() => onBuy(item, "streak")}
                disabled={
                  (!isFreeForPro && streak < item.price) ||
                  purchasedItems.includes(item.id)
                }
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50"
              >
                {purchasedItems.includes(item.id)
                  ? "Purchased"
                  : isFreeForPro
                    ? "Free"
                    : `${item.price} Streak`}
              </button>
            )}
            {item.coinPrice !== undefined && (
              <button
                onClick={() => onBuy(item, "coins")}
                disabled={
                  (!isFreeForPro && coins < item.coinPrice) ||
                  purchasedItems.includes(item.id)
                }
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 disabled:opacity-50"
              >
                {purchasedItems.includes(item.id)
                  ? "Purchased"
                  : isFreeForPro
                    ? "Free"
                    : `${item.coinPrice} Coins`}
              </button>
            )}
          </>
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
  onBuy,
}: {
  skins: ShopItem[];
  streak: number;
  coins: number;
  isPro: boolean;
  purchasedItems: string[];
  onBuy: (item: ShopItem, currency: "streak" | "coins") => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

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
          Mascot Wearables & Masks
        </h2>
        <p className="text-[11px] text-blue-900/60 font-medium">
          Swipe or scroll horizontally to browse wearables
        </p>
      </div>

      {/* Horizontal Scroll Track - No Outer Box */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 pt-1 scrollbar-none scroll-smooth"
      >
        {skins.map((item, idx) => {
          const isFreeForPro = isPro && (item.effect === "music" || item.price === 0);
          const isProLocked = item.proOnly && !isPro;
          const isPurchased = purchasedItems.includes(item.id);

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
              {/* Subtle Background Accent */}
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
                ) : (
                  <div className="flex gap-2">
                    {item.price > 0 && (
                      <button
                        onClick={() => onBuy(item, "streak")}
                        disabled={
                          (!isFreeForPro && streak < item.price) || isPurchased
                        }
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-200"
                      >
                        {isPurchased
                          ? "Purchased"
                          : isFreeForPro
                            ? "Free with Pro"
                            : `${item.price} Streak`}
                      </button>
                    )}
                    {item.coinPrice !== undefined && (
                      <button
                        onClick={() => onBuy(item, "coins")}
                        disabled={
                          (!isFreeForPro && coins < item.coinPrice) || isPurchased
                        }
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-yellow-200"
                      >
                        {isPurchased
                          ? "Purchased"
                          : isFreeForPro
                            ? "Free with Pro"
                            : `${item.coinPrice} Coins`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Horizontal Pagination Dots */}
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
