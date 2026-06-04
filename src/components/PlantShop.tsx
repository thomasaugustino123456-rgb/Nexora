import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  X,
  Zap,
  Sparkles,
  Heart,
  Bot,
  Droplets,
  Sun,
  Wind,
  Palette,
  Box,
  Bug,
  Ghost,
  Map as MapIcon,
} from "lucide-react";
import { UserStats, UserSettings } from "../types";
import { vibrate } from "../lib/vibrate";
import { GardenerDrone } from "./GardenerDrone";

interface PlantShopProps {
  onClose: () => void;
  stats: UserStats;
  settings: UserSettings;
  onPurchase: (item: EcosystemItem) => void;
  onToggleActive: (itemId: string) => void;
}

export interface EcosystemItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "companion" | "growth-tech" | "visual" | "pot" | "color";
  icon: React.ReactNode;
  effect?: string;
  metadata?: any;
}

export const SHOP_ITEMS: EcosystemItem[] = [
  {
    id: "eco_drone_01",
    name: "Gardener Drone V2",
    description:
      "Draggable smart bot. Triple-tap to call it to a spot. Boosts growth by 12%.",
    price: 1000,
    type: "companion",
    icon: <Bot className="text-blue-400" />,
    effect: "+12% Growth / Interactive",
  },
  {
    id: "eco_nanobees_01",
    name: "Nano-Bees Swarm",
    description:
      "A micro-swarm of robotic pollinators that dance around your plant.",
    price: 2000,
    type: "companion",
    icon: <Bug className="text-yellow-400" />,
    effect: "+20% Passive Growth",
  },
  {
    id: "eco_butterfly_01",
    name: "Spirit Butterfly",
    description: "A bioluminescent butterfly that brings peace and focus.",
    price: 3500,
    type: "companion",
    icon: <Ghost className="text-purple-400" />,
    effect: "Legendary Multiplier (x1.5)",
  },
  {
    id: "eco_sprinkler_01",
    name: "Auto-Mist System",
    description: 'Realistic mist drops. Extends "Thirsty" timer to 48 hours.',
    price: 600,
    type: "growth-tech",
    icon: <Droplets className="text-cyan-400" />,
    effect: "+12h Resistance",
  },
  {
    id: "eco_uv_lamp_01",
    name: "Cartoon Sun Halo",
    description:
      "A cheerful sun that reflects light to your plant. Double growth from habits.",
    price: 1800,
    type: "growth-tech",
    icon: <Sun className="text-amber-400" />,
    effect: "2x Growth Rate",
  },
  // POTS
  {
    id: "pot_cyber_01",
    name: "Cyberpunk Planter",
    description: "Neon-infused base for a futuristic look.",
    price: 800,
    type: "pot",
    icon: <Box className="text-fuchsia-400" />,
    effect: "Visual Style",
  },
  {
    id: "pot_zen_01",
    name: "Stone Zen Basin",
    description: "Natural carved stone for ultimate calm.",
    price: 800,
    type: "pot",
    icon: <Box className="text-gray-400" />,
    effect: "Visual Style",
  },
  // COLORS
  {
    id: "eco_forest_01",
    name: "Ancient Sacred Forest",
    description:
      "Transform your plant space into a lush forest with ambient nature sounds and swaying trees.",
    price: 2500,
    type: "visual",
    icon: <MapIcon className="text-green-500" />,
    effect: "Deep Forest Backdrop / Sounds",
  },
  {
    id: "color_bio_01",
    name: "Biolume Teal",
    description: "Give your plant a glowing teal bioluminescent tint.",
    price: 1200,
    type: "color",
    icon: <Palette className="text-teal-400" />,
    effect: "Glow Effect",
  },
  {
    id: "color_bio_02",
    name: "Biolume Pink",
    description: "Give your plant a glowing pink bioluminescent tint.",
    price: 1200,
    type: "color",
    icon: <Palette className="text-pink-400" />,
    effect: "Glow Effect",
  },
];

export const PlantShop: React.FC<PlantShopProps> = ({
  onClose,
  stats,
  settings,
  onPurchase,
  onToggleActive,
}) => {
  const [activeTab, setActiveTab] = useState<
    "all" | "companion" | "growth-tech" | "pot" | "color"
  >("all");
  const purchased = settings.purchasedEcosystemItemIds || [];
  const activeItems = settings.activeEcosystemItemIds || [];

  const filteredItems = SHOP_ITEMS.filter(
    (item) => activeTab === "all" || item.type === activeTab,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-blue-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-blue-50 to-white border-b border-blue-100 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-2 bg-blue-900/5 hover:bg-blue-900/10 rounded-full transition-colors"
          >
            <X size={20} className="text-blue-900" />
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
              <ShoppingBag className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">
                Ecosystem Lab
              </h2>
              <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">
                Upgrade your garden architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <div className="flex-1 bg-white p-3 rounded-2xl border border-blue-100 flex items-center justify-center gap-2 shadow-sm">
              <Sparkles className="text-amber-400" size={16} />
              <span className="font-black text-blue-900 text-sm tracking-tighter">
                {stats.coins}{" "}
                <span className="text-[8px] opacity-40">COINS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-8 py-4 gap-2 bg-white sticky top-0 z-10 overflow-x-auto no-scrollbar">
          {(["all", "companion", "growth-tech", "pot", "color"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  vibrate(5);
                  setActiveTab(tab);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20"
                    : "bg-gray-100 text-blue-900/40 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-4 custom-scrollbar">
          {filteredItems.map((item) => {
            const isPurchased = purchased.includes(item.id);
            const isActive = activeItems.includes(item.id);
            const canAfford = stats.coins >= item.price;

            return (
              <motion.div
                key={item.id}
                layout
                className={`p-5 rounded-3xl border-2 transition-all group ${
                  isActive
                    ? "border-blue-500 bg-blue-50/30"
                    : "border-gray-100 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-4 rounded-2xl shadow-inner ${isActive ? "bg-blue-100" : "bg-gray-50"}`}
                  >
                    {item.id === "eco_drone_01" ? (
                      <div className="scale-[0.5] -mx-8 -my-8">
                        <GardenerDrone mood={isActive ? "happy" : "idle"} />
                      </div>
                    ) : (
                      item.icon
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-black text-blue-900 leading-tight tracking-tight">
                        {item.name}
                      </h3>
                      {isActive && (
                        <span className="text-[8px] bg-green-500 text-white px-2 py-1 rounded-full font-black uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-blue-900/60 font-medium leading-relaxed mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-blue-900/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1">
                          <Zap size={10} className="text-amber-500" />
                          {item.effect}
                        </span>
                      </div>

                      {isPurchased ? (
                        <button
                          onClick={() => {
                            vibrate(10);
                            onToggleActive(item.id);
                          }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            isActive
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-blue-900 text-white hover:bg-blue-800"
                          }`}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            vibrate(15);
                            onPurchase(item);
                          }}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all ${
                            canAfford
                              ? "bg-blue-600 text-white shadow-blue-600/20 hover:scale-105 active:scale-95"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                          }`}
                        >
                          {item.price} <span className="text-[8px]">COINS</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
