import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, Sparkles, Lightbulb, MousePointer2, Move, RefreshCw, ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight, Archive, X, ShoppingBag, Flame, Coins, Plus, Trash2, CupSoda } from 'lucide-react';
import { vibrate, VIBRATION_PATTERNS } from '../lib/vibrate';
import { UserStats, UserSettings, HouseItem, PlacedHouseItem } from '../types';
import { HOUSE_ITEMS } from '../constants/houseItems';
import { HouseItemSVG } from './HouseItemSVG';
import { SpaceMascot } from './SpaceMascot';
import { Mascot } from './Mascot';
import { WaterStep } from '../App';

export function HouseScreen({ 
  onBack, 
  stats, 
  settings, 
  onBuyItem, 
  onPlaceItem, 
  onRemoveItem,
  onUpdateItemPosition,
  onUpdateSettings,
  onUpdateStats,
  showToast
}: { 
  onBack: () => void;
  stats: UserStats;
  settings: UserSettings;
  onBuyItem: (id: string, currency: 'streak' | 'coins') => void;
  onPlaceItem: (id: string, x: number, y: number, room: number) => void;
  onRemoveItem: (index: number) => void;
  onUpdateItemPosition: (index: number, x: number, y: number) => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onUpdateStats: (stats: Partial<UserStats>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [activeRoom, setActiveRoom] = useState(0); // 0: Isometric, 1: Cartoon, 2: Cozy
  const [showStorage, setShowStorage] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showWaterChallenge, setShowWaterChallenge] = useState(false);
  const [placementMode, setPlacementMode] = useState<string | null>(null);

  // Mascot States
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [mascotPos, setMascotPos] = useState(settings.mascotPos || { x: 600, y: 400 });
  const [mascotSize, setMascotSize] = useState(settings.mascotSize || 1);
  
  const [showSizeCustomizer, setShowSizeCustomizer] = useState(false);
  const [mascotReaction, setMascotReaction] = useState<{ text: string, type: 'good' | 'bad' | 'neutral' } | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);
  const [lastPlacedItemName, setLastPlacedItemName] = useState<string | undefined>();
  const [isMascotOnFire, setIsMascotOnFire] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<any>(null);

  // Room 1 States (Isometric)
  const [lightOn, setLightOn] = useState(true);
  const [plantShaking, setPlantShaking] = useState(false);

  // Room 2 States (4-Mini-Rooms)
  const [room2Lamps, setRoom2Lamps] = useState([false, false, false, false]);
  const [room2ComputerOn, setRoom2ComputerOn] = useState(false);
  const [room2LaptopOn, setRoom2LaptopOn] = useState(false);

  const toggleRoom2Lamp = (index: number) => {
    vibrate(10);
    setRoom2Lamps(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const toggleRoom2Computer = () => {
    vibrate(10);
    setRoom2ComputerOn(!room2ComputerOn);
  };

  const toggleRoom2Laptop = () => {
    vibrate(10);
    setRoom2LaptopOn(!room2LaptopOn);
  };

  // Room 3 States (Cozy)
  const [fireTaps, setFireTaps] = useState(0);
  const [isNightMode, setIsNightMode] = useState(false);
  const [chairLeftBouncing, setChairLeftBouncing] = useState(false);
  const [chairRightBouncing, setChairRightBouncing] = useState(false);
  const [coffeeTableBouncing, setCoffeeTableBouncing] = useState(false);
  const [smallTableBouncing, setSmallTableBouncing] = useState(false);
  const [shelfItem1Jiggling, setShelfItem1Jiggling] = useState(false);
  const [shelfItem2Jiggling, setShelfItem2Jiggling] = useState(false);
  const [shelfItem3Jiggling, setShelfItem3Jiggling] = useState(false);
  const [lampWobbling, setLampWobbling] = useState(false);

  const toggleLight = () => {
    vibrate(10);
    setLightOn(!lightOn);
  };

  const shakePlant = () => {
    vibrate(5);
    setPlantShaking(true);
    setTimeout(() => setPlantShaking(false), 900);
  };

  // Room 3 Handlers
  const handleFireClick = () => {
    vibrate(10);
    setFireTaps(prev => (prev >= 4 ? 0 : prev + 1));
  };

  const toggleNightMode = () => {
    vibrate(15);
    setIsNightMode(!isNightMode);
    setLampWobbling(true);
    setTimeout(() => setLampWobbling(false), 500);
  };

  const triggerBounce = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    vibrate(5);
    setter(true);
    setTimeout(() => setter(false), 500);
  };

  const triggerJiggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    vibrate(5);
    setter(true);
    setTimeout(() => setter(false), 400);
  };

  const handleZoom = (delta: number) => {
    vibrate(5);
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const resetRoom = () => {
    vibrate(20);
    setResetKey(prev => prev + 1);
    setZoom(1);
    setLightOn(true);
    setRoom2Lamps([false, false, false, false]);
    setRoom2ComputerOn(false);
    setRoom2LaptopOn(false);
    setFireTaps(0);
    setIsNightMode(false);
  };

  const isItemPlaced = (itemId: string) => {
    return (settings.placedHouseItems || []).some(p => p.itemId === itemId && p.room === activeRoom);
  };

  const handleLongPressStart = (index: number) => {
    const timer = setTimeout(() => {
      vibrate([50, 50, 50]);
      setItemToRemove(index);
    }, 1500); // 1.5s is better for UX than 5s, but I'll use 2s to be safe
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMascotLongPressStart = () => {
    const timer = setTimeout(() => {
      vibrate([50, 50, 50]);
      setShowSizeCustomizer(true);
    }, 3000); // Increased to 3s as requested
    setLongPressTimer(timer);
  };

  const getMascotPlacementReaction = (x: number, y: number) => {
    // Find if mascot is on an item
    const placedItems = (settings.placedHouseItems || []).filter(p => p.room === activeRoom);
    let itemOn: PlacedHouseItem | null = null;
    
    // Simple proximity check
    for (const item of placedItems) {
      const dist = Math.sqrt(Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2));
      if (dist < 60) {
        itemOn = item;
        break;
      }
    }

    if (itemOn) {
      const itemData = HOUSE_ITEMS.find(i => i.id === itemOn?.itemId);
      if (!itemData) return null;

      // Good places: chairs, beds, sofas, tables
      const goodItems = ['Chair', 'Bed', 'Sofa', 'Table', 'Armchair', 'Desk'];
      const badItems = ['Fireplace', 'Trash', 'Dirty']; // Fireplace is handled separately for "boiling" but can have a reaction too

      if (goodItems.some(keyword => itemData.name.includes(keyword))) {
        return {
          text: `Yo bro, this ${itemData.name} is so comfy! I could stay here all day, it feels amazing! ✨`,
          type: 'good' as const
        };
      } else if (itemData.name.includes('Fireplace')) {
        return {
          text: `AAAH! It's way too hot here bro! Don't leave me on the fire, it's dangerous! 🔥`,
          type: 'bad' as const
        };
      } else {
        return {
          text: `Placed on the ${itemData.name}, huh? It's okay, but I've seen better spots, bro! 🏠`,
          type: 'neutral' as const
        };
      }
    }

    // Check if on floor (base logic)
    if (y > 400) {
      return {
        text: "The floor is a bit cold, but I like the space to move around, bro! 👟",
        type: 'neutral' as const
      };
    }

    return null;
  };

  const handleFeedMascot = () => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    setIsFeeding(true);
    setMascotReaction({
      text: "Mmm, that's some good stuff, bro! 🍕 I'm feeling so much more energized now. Thanks for the snack! You're the best!",
      type: 'good'
    });
    
    // Give a tiny bit of XP for caring for the mascot
    onUpdateStats({ xp: stats.xp + 1 });
    
    setTimeout(() => setIsFeeding(false), 3000);
  };

  const renderPlacedItems = () => {
    return (settings.placedHouseItems || [])
      .filter(p => p.room === activeRoom)
      .map((p, index) => (
        <motion.g 
          key={`${p.itemId}-${index}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ x: p.x, y: p.y }}
          drag
          dragMomentum={false}
          onDragEnd={(e, info) => {
            vibrate(5);
            onUpdateItemPosition(index, p.x + info.offset.x, p.y + info.offset.y);
          }}
          onPointerDown={() => handleLongPressStart(index)}
          onPointerUp={handleLongPressEnd}
          onPointerLeave={handleLongPressEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <HouseItemSVG itemId={p.itemId} lightOn={lightOn} plantShaking={plantShaking} shakePlant={shakePlant} toggleLight={toggleLight} room2Lamps={room2Lamps} toggleRoom2Lamp={toggleRoom2Lamp} room2ComputerOn={room2ComputerOn} toggleRoom2Computer={toggleRoom2Computer} room2LaptopOn={room2LaptopOn} toggleRoom2Laptop={toggleRoom2Laptop} fireTaps={fireTaps} handleFireClick={handleFireClick} isNightMode={isNightMode} />
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              vibrate(10);
              onRemoveItem(index);
            }}
            className="p-1 bg-red-500 text-white rounded-full shadow-lg"
            style={{ transform: 'translate(10px, -10px)' }}
          >
            <X size={12} />
          </motion.button>
        </motion.g>
      ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-[#1a1a2e] z-[150] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="p-6 flex items-center justify-between z-20">
        <button 
          onClick={onBack} 
          className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            My Nexora Space <Sparkles size={18} className="text-yellow-400" />
          </h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            {activeRoom === 0 ? 'Interactive 3D Room' : activeRoom === 1 ? 'Miniature 4-Room House' : 'Cozy Miniature'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.CLICK);
              setShowShop(true);
            }}
            className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Shop</span>
          </button>
          <button 
            onClick={() => {
              vibrate(10);
              setShowStorage(true);
            }}
            className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md flex items-center gap-2"
          >
            <Archive size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Library</span>
          </button>
          <button 
            onClick={() => {
              vibrate(10);
              setActiveRoom(prev => (prev + 1) % 3);
            }}
            className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md flex items-center gap-2"
          >
            <RefreshCw size={20} className={`transition-transform duration-500 ${activeRoom !== 0 ? 'rotate-180' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Switch Room</span>
          </button>
        </div>
      </header>

      {/* Instructions Overlay */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-black text-white/60 uppercase tracking-widest">
            <Move size={12} /> Drag items
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-1 text-[10px] font-black text-white/60 uppercase tracking-widest">
            <MousePointer2 size={12} /> Tap to interact
          </div>
        </div>
      </div>

      {/* Main Room Container */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden" key={resetKey}>
        {/* Side Navigation Buttons */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center z-30 pointer-events-none">
          {/* Left Button */}
          <div className="pointer-events-auto">
            <AnimatePresence>
              {activeRoom > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => {
                    vibrate(10);
                    setActiveRoom(prev => prev - 1);
                  }}
                  className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 shadow-2xl group"
                >
                  <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Right Button */}
          <div className="pointer-events-auto">
            <AnimatePresence>
              {activeRoom < 2 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => {
                    vibrate(10);
                    setActiveRoom(prev => prev + 1);
                  }}
                  className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 shadow-2xl group"
                >
                  <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeRoom === 0 ? (
            <motion.div 
              key="room-0"
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: zoom, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateY: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full max-w-4xl aspect-[4/3] relative"
              drag
              dragConstraints={{ left: -400 * zoom, right: 400 * zoom, top: -300 * zoom, bottom: 300 * zoom }}
              dragElastic={0.1}
            >
              <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFF9C4" stopOpacity={lightOn ? 0.4 : 0} />
                    <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D9B08C" />
                    <stop offset="100%" stopColor="#BC8F6F" />
                  </linearGradient>

                  <pattern id="floorPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="40" stroke="#A67C52" strokeWidth="1" opacity="0.3" />
                  </pattern>
                </defs>

                {/* Room Background */}
                <g id="room-base">
                  {/* Left Wall */}
                  <polygon points="400,300 100,450 100,80 400,50" fill={lightOn ? "#354751" : "#1a2429"} className="transition-colors duration-500" />
                  {/* Right Wall */}
                  <polygon points="400,300 700,450 700,80 400,50" fill={lightOn ? "#4a6677" : "#25333b"} className="transition-colors duration-500" />
                  {/* Floor */}
                  <polygon points="400,300 100,450 400,600 700,450" fill="url(#floorGrad)" />
                  <polygon points="400,300 100,450 400,600 700,450" fill="url(#floorPattern)" />
                  
                  {/* Baseboards */}
                  <polygon points="400,300 100,450 100,435 400,285" fill="#1C262B" opacity="0.5" />
                  <polygon points="400,300 700,450 700,435 400,285" fill="#293942" opacity="0.5" />
                </g>

                {renderPlacedItems()}

                <AnimatePresence>
                  {lightOn && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none">
                      <polygon points="400,215 150,550 650,550" fill="url(#beamGrad)" style={{ mixBlendMode: 'overlay' }} />
                      <polygon points="400,215 250,500 550,500" fill="url(#beamGrad)" opacity="0.5" />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>
            </motion.div>
          ) : activeRoom === 1 ? (
            <motion.div 
              key="room-1"
              initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
              animate={{ opacity: 1, scale: zoom, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateY: -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full max-w-4xl aspect-[4/3] relative"
              drag
              dragConstraints={{ left: -400 * zoom, right: 400 * zoom, top: -300 * zoom, bottom: 300 * zoom }}
              dragElastic={0.1}
            >
              <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                <defs>
                  <filter id="screenGlowRoom2" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Reusable Book */}
                  <g id="book1"><rect width="8" height="25" fill="#D32F2F" rx="1"/></g>
                  <g id="book2"><rect width="10" height="20" fill="#1976D2" rx="1"/></g>
                  <g id="book3"><rect width="6" height="28" fill="#FBC02D" rx="1"/></g>
                  <g id="book4"><rect width="12" height="22" fill="#388E3C" rx="1"/></g>
                  
                  {/* Reusable Pillow */}
                  <g id="pillow-pink"><circle cx="0" cy="0" r="10" fill="#E91E63"/></g>
                  <g id="pillow-yellow"><rect x="-12" y="-8" width="24" height="16" fill="#FBC02D" rx="3"/></g>
                  <g id="pillow-orange"><rect x="-10" y="-10" width="20" height="20" fill="#F57C00" rx="3"/></g>
                </defs>

                {/* Room Background */}
                <g id="room-tl">
                  {/* Background */}
                  <rect width="400" height="220" fill="#A5D68B"/>
                  <path d="M20,0 v220 M60,0 v220 M100,0 v220 M140,0 v220 M180,0 v220 M220,0 v220 M260,0 v220 M300,0 v220 M340,0 v220 M380,0 v220" stroke="#8BC34A" strokeWidth="20" opacity="0.6"/>
                  <polygon points="0,220 400,220 400,300 0,300" fill="#E06287"/>
                  
                  {/* Ambient Sunbeam */}
                  <polygon points="120,0 280,0 40,300 -120,300" fill="#FFFFFF" opacity="0.15" pointer-events="none"/>
                </g>

                <g id="room-tr" transform="translate(400, 0)">
                  <rect width="400" height="220" fill="#4DB6AC"/>
                  <polygon points="0,220 400,220 400,300 0,300" fill="#00695C"/>
                  <polygon points="200,0 350,0 150,300 -50,300" fill="#FFFFFF" opacity="0.1" pointer-events="none"/>
                </g>

                <g id="room-bl" transform="translate(0, 300)">
                  <rect width="400" height="220" fill="#E6C89C"/>
                  <polygon points="0,220 400,220 400,300 0,300" fill="#BA6824"/>
                  <polygon points="100,0 250,0 50,300 -100,300" fill="#FFFFFF" opacity="0.15" pointer-events="none"/>
                </g>

                <g id="room-br" transform="translate(400, 300)">
                  <rect width="400" height="220" fill="#F4DEBA"/>
                  <polygon points="0,220 400,220 400,300 0,300" fill="#50A29C"/>
                  <polygon points="200,0 350,0 150,300 -50,300" fill="#FFFFFF" opacity="0.15" pointer-events="none"/>
                </g>

                {renderPlacedItems()}
              </svg>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap pointer-events-none">
                Tap Lamps & Screens to Interact!
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="room-2"
              initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
              animate={{ opacity: 1, scale: zoom, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateY: -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full max-w-4xl aspect-[4/3] relative"
              drag
              dragConstraints={{ left: -400 * zoom, right: 400 * zoom, top: -300 * zoom, bottom: 300 * zoom }}
              dragElastic={0.1}
            >
              <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                <defs>
                  <pattern id="checker" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
                    <rect width="20" height="20" fill="#81D4FA" />
                    <rect width="10" height="10" fill="#E1F5FE" />
                    <rect x="10" y="10" width="10" height="10" fill="#E1F5FE" />
                  </pattern>

                  <pattern id="checker-skewed" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(0.8) skewX(-20)">
                    <rect width="20" height="20" fill="#4FC3F7" />
                    <rect width="10" height="10" fill="#B3E5FC" />
                    <rect x="10" y="10" width="10" height="10" fill="#B3E5FC" />
                  </pattern>

                  <pattern id="wood-cozy" width="40" height="100" patternUnits="userSpaceOnUse">
                    <rect width="40" height="100" fill="#5D4037" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#3E2723" strokeWidth="2" />
                    <line x1="0" y1="30" x2="40" y2="30" stroke="#3E2723" strokeWidth="1" />
                  </pattern>

                  <pattern id="brick-back" width="60" height="30" patternUnits="userSpaceOnUse">
                    <rect width="60" height="30" fill="#D35400" />
                    <rect width="60" height="14" fill="#E67E22" />
                    <rect x="30" y="15" width="60" height="14" fill="#E67E22" />
                    <line x1="0" y1="15" x2="60" y2="15" stroke="#A04000" strokeWidth="2" />
                  </pattern>

                  <radialGradient id="fireGlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF9C4" stopOpacity="1" />
                    <stop offset="100%" stopColor="#D84315" stopOpacity="0" />
                  </radialGradient>
                  
                  <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FFEA00" stopOpacity="0" />
                  </radialGradient>

                  <filter id="blurGlowCozy">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Architecture */}
                <polygon points="0,0 800,0 600,100 200,100" fill="#FFF8E1" />
                <rect x="200" y="100" width="400" height="250" fill="url(#brick-back)" />
                <polygon points="0,0 200,100 200,350 0,600" fill="#CA6F1E" />
                <polygon points="800,0 600,100 600,350 800,600" fill="#E67E22" />
                <polygon points="0,600 200,350 600,350 800,600" fill="url(#wood-cozy)" />

                {renderPlacedItems()}

                {isNightMode && <rect x="0" y="0" width="800" height="600" fill="#0A0A1A" opacity="0.65" style={{ mixBlendMode: 'multiply' }} className="pointer-events-none" />}
              </svg>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap pointer-events-none">
                {fireTaps === 0 ? "Tap Fire 2x to Increase, 4x to Off" : fireTaps < 4 ? "Fire is ROARING!" : "Fire is OUT. (Tap once to reset)"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <footer className="p-8 flex flex-wrap justify-center gap-4 z-20">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-3xl border border-white/10">
          <button 
            onClick={() => {
              vibrate(10);
              setShowWaterChallenge(true);
            }}
            className="p-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
            title="Water Drinking Challenge"
          >
            <CupSoda size={20} />
          </button>
          <button 
            onClick={() => handleZoom(-0.1)}
            className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <ZoomOut size={20} />
          </button>
          <div className="px-2 text-[10px] font-black text-white/60 uppercase tracking-widest w-12 text-center">
            {Math.round(zoom * 100)}%
          </div>
          <button 
            onClick={() => handleZoom(0.1)}
            className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            onClick={() => setZoom(1)}
            className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <Maximize size={20} />
          </button>
        </div>

        {activeRoom === 0 ? (
          <>
            <button 
              onClick={toggleLight}
              className={`p-4 rounded-3xl transition-all shadow-xl flex items-center gap-3 ${
                lightOn ? 'bg-yellow-400 text-yellow-900 shadow-yellow-200' : 'bg-white/10 text-white/40'
              }`}
            >
              <Lightbulb size={24} />
              <span className="font-black uppercase tracking-widest text-xs">{lightOn ? 'Light On' : 'Light Off'}</span>
            </button>
            
            <button 
              onClick={shakePlant}
              className="p-4 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-200 flex items-center gap-3"
            >
              <Sparkles size={24} />
              <span className="font-black uppercase tracking-widest text-xs">Tickle Plant</span>
            </button>
          </>
        ) : activeRoom === 1 ? (
          <>
            <button 
              onClick={() => {
                vibrate(15);
                setRoom2Lamps([!room2Lamps[0], !room2Lamps[1], !room2Lamps[2], !room2Lamps[3]]);
              }}
              className={`p-4 rounded-3xl transition-all shadow-xl flex items-center gap-3 ${
                room2Lamps.some(l => l) ? 'bg-yellow-400 text-yellow-900 shadow-yellow-200' : 'bg-white/10 text-white/40'
              }`}
            >
              <Lightbulb size={24} />
              <span className="font-black uppercase tracking-widest text-xs">All Lamps</span>
            </button>
            
            <button 
              onClick={toggleRoom2Computer}
              className={`p-4 rounded-3xl transition-all shadow-xl flex items-center gap-3 ${
                room2ComputerOn ? 'bg-green-500 text-white shadow-green-200' : 'bg-white/10 text-white/40'
              }`}
            >
              <Sparkles size={24} />
              <span className="font-black uppercase tracking-widest text-xs">PC Screen</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleFireClick}
              className={`p-4 rounded-3xl transition-all shadow-xl flex items-center gap-3 ${
                fireTaps === 4 ? 'bg-white/10 text-white/40' : 'bg-red-500 text-white shadow-red-200'
              }`}
            >
              <Sparkles size={24} />
              <span className="font-black uppercase tracking-widest text-xs">
                {fireTaps === 4 ? 'Fire Out' : fireTaps >= 2 ? 'Roaring Fire' : 'Stoke Fire'}
              </span>
            </button>
            
            <button 
              onClick={toggleNightMode}
              className={`p-4 rounded-3xl transition-all shadow-xl flex items-center gap-3 ${
                isNightMode ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-yellow-400 text-yellow-900'
              }`}
            >
              <Lightbulb size={24} />
              <span className="font-black uppercase tracking-widest text-xs">{isNightMode ? 'Night Mode' : 'Day Mode'}</span>
            </button>
          </>
        )}

        <button 
          onClick={resetRoom}
          className="p-4 rounded-3xl bg-white/10 text-white/60 hover:bg-white/20 transition-all flex items-center gap-3"
        >
          <RefreshCw size={24} />
          <span className="font-black uppercase tracking-widest text-xs">Reset</span>
        </button>
      </footer>

      {/* Water Challenge Modal */}
      <AnimatePresence>
        {showWaterChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-blue-900/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-blue-50 flex items-center justify-between bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-xl text-white">
                    <CupSoda size={20} />
                  </div>
                  <h3 className="font-black text-blue-900 uppercase tracking-tight">Water Challenge</h3>
                </div>
                <button 
                  onClick={() => setShowWaterChallenge(false)}
                  className="p-2 rounded-xl hover:bg-blue-100 text-blue-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <WaterStep 
                  goal={settings.waterGoal || 8} 
                  progress={stats.waterDrank || 0}
                  onUpdate={(val) => {
                    // Reward for drinking
                    const pointsToAdd = 5;
                    const xpToAdd = 10;
                    const coinsToAdd = 5;
                    
                    // Update stats with rewards
                    onUpdateStats({ 
                      waterDrank: val,
                      xp: (stats.xp || 0) + xpToAdd,
                      coins: (stats.coins || 0) + coinsToAdd,
                      totalPoints: (stats.totalPoints || 0) + pointsToAdd
                    });

                    // Check for streak reward (if they hit a milestone, e.g., every 4 glasses)
                    if (val > 0 && val % 4 === 0) {
                      onUpdateStats({ streak: (stats.streak || 0) + 1 });
                      showToast("Streak +1 for staying hydrated! 💧", "success");
                    }
                    
                    vibrate(VIBRATION_PATTERNS.SUCCESS);
                  }}
                  onContinue={() => setShowWaterChallenge(false)}
                  activeSkin={settings.activeSkin}
                  settings={settings}
                  play={() => {}} // Pass dummy play or actual play if available
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Background Glow */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${
        lightOn ? 'bg-yellow-500/5' : 'bg-transparent'
      }`} />

      {/* Space Mascot Integration */}
      <SpaceMascot 
        onboardingStep={onboardingStep}
        setOnboardingStep={setOnboardingStep}
        isNewUser={!settings.spaceOnboardingCompleted}
        onCompleteOnboarding={() => {
          vibrate(VIBRATION_PATTERNS.SUCCESS);
          onUpdateSettings({ spaceOnboardingCompleted: true, mascotSize: 0.6 });
          setMascotSize(0.6);
        }}
        placedItemsCount={(settings.placedHouseItems || []).length}
        lastPlacedItemName={lastPlacedItemName}
        isNightMode={activeRoom === 2 ? isNightMode : !lightOn}
        onFire={isMascotOnFire}
        placementReaction={mascotReaction}
        onPanicEnd={(penalty) => {
          if (penalty) {
            vibrate(VIBRATION_PATTERNS.ERROR);
            onUpdateStats({ 
              xp: Math.max(0, stats.xp - 2),
              coins: Math.max(0, stats.coins - 2),
              totalPoints: Math.max(0, stats.totalPoints - 2)
            });
          }
          setIsMascotOnFire(false);
        }}
      />

      {/* Movable Mascot in Room */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          <motion.g
            drag
            dragMomentum={false}
            style={{ x: mascotPos.x, y: mascotPos.y, scale: mascotSize }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onDragEnd={(e, info) => {
              const newX = mascotPos.x + info.offset.x;
              const newY = mascotPos.y + info.offset.y;
              setMascotPos({ x: newX, y: newY });
              onUpdateSettings({ mascotPos: { x: newX, y: newY } });
              
              // Placement reaction
              const reaction = getMascotPlacementReaction(newX, newY);
              if (reaction) {
                setMascotReaction(reaction);
                // Clear reaction after some time if needed, or let SpaceMascot handle it
              }

              // Fire detection (Room 3)
              if (activeRoom === 2 && fireTaps < 4) {
                // Fire is roughly at 400, 250 in Cozy room
                const dist = Math.sqrt(Math.pow(newX - 400, 2) + Math.pow(newY - 250, 2));
                if (dist < 80) {
                  setIsMascotOnFire(true);
                } else {
                  setIsMascotOnFire(false);
                }
              }
            }}
            onPointerDown={handleMascotLongPressStart}
            onPointerUp={handleLongPressEnd}
            onPointerLeave={handleLongPressEnd}
            className="pointer-events-auto cursor-grab active:cursor-grabbing"
          >
            <Mascot 
              className="w-24 h-24" 
              mood={isMascotOnFire ? 'boiling' : isFeeding ? 'happy' : (activeRoom === 2 ? (isNightMode ? 'neutral' : 'happy') : (lightOn ? 'happy' : 'neutral'))} 
            />
          </motion.g>
        </svg>
      </div>

      {/* Mascot Size Customizer Modal */}
      <AnimatePresence>
        {showSizeCustomizer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a2e] border-2 border-white/10 rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <motion.div style={{ scale: mascotSize }}>
                  <Mascot mood="happy" className="w-24 h-24" />
                </motion.div>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                Mascot Size
              </h3>
              <p className="text-sm text-white/60 mb-8">
                "How big do you want me to be in your space, bro?"
              </p>
              
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => {
                    setMascotSize(prev => Math.max(0.3, prev - 0.1));
                    vibrate(5);
                  }}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                  Zoom In (Small)
                </button>
                <button
                  onClick={() => {
                    setMascotSize(prev => Math.min(2.5, prev + 0.1));
                    vibrate(5);
                  }}
                  className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-600 transition-all"
                >
                  Zoom Out (Big)
                </button>
              </div>

              <button
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.SUCCESS);
                  onUpdateSettings({ mascotSize });
                  setShowSizeCustomizer(false);
                }}
                className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
              >
                Save Size
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Removal Confirmation Modal */}
      <AnimatePresence>
        {itemToRemove !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a2e] border-2 border-white/10 rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-24 h-24 mx-auto mb-6">
                <Mascot mood="neutral" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                Remove this object?
              </h3>
              <p className="text-sm text-white/60 mb-8">
                "Do you want to remove this object from the room and put it back in the Library, bro?"
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setItemToRemove(null)}
                  className="py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.CLICK);
                    onRemoveItem(itemToRemove);
                    setItemToRemove(null);
                  }}
                  className="py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowShop(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a2e] border-2 border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500 rounded-2xl text-white shadow-lg shadow-yellow-500/20">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Nexora Shop</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Equip your space with style</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <Flame size={14} className="text-orange-500" />
                    <span className="text-sm font-black text-white">{stats.streak}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-sm font-black text-white">{stats.coins}</span>
                  </div>
                  <button 
                    onClick={() => setShowShop(false)}
                    className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {HOUSE_ITEMS.filter(item => item.room === activeRoom).map(item => {
                    const isOwned = (settings.purchasedHouseItemIds || []).includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                          isOwned ? 'bg-white/5 border-white/10 opacity-60' : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="text-4xl">{item.icon}</div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">{item.name}</h4>
                          <p className="text-[10px] text-white/40 font-bold">{item.description}</p>
                        </div>
                        
                        {isOwned ? (
                          <div className="mt-auto px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            Owned
                          </div>
                        ) : (
                          <div className="mt-auto flex flex-col gap-2 w-full">
                            <button
                              onClick={() => {
                                vibrate(10);
                                onBuyItem(item.id, 'streak');
                              }}
                              disabled={stats.streak < item.price}
                              className="w-full py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                            >
                              <Flame size={12} /> {item.price}
                            </button>
                            <button
                              onClick={() => {
                                vibrate(10);
                                onBuyItem(item.id, 'coins');
                              }}
                              disabled={stats.coins < item.coinPrice}
                              className="w-full py-2 bg-yellow-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                            >
                              <Coins size={12} /> {item.coinPrice}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library Modal */}
      <AnimatePresence>
        {showStorage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowStorage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a2e] border-2 border-white/10 rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                    <Archive size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">House Library</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Your collection of house goods</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowStorage(false)}
                  className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 min-h-[300px] flex flex-col gap-4">
                {settings.purchasedHouseItemIds && settings.purchasedHouseItemIds.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {settings.purchasedHouseItemIds.map(itemId => {
                      const item = HOUSE_ITEMS.find(h => h.id === itemId);
                      if (!item) return null;
                      const placedCount = (settings.placedHouseItems || []).filter(p => p.itemId === itemId).length;
                      
                      return (
                        <button
                          key={itemId}
                          onClick={() => {
                            vibrate(10);
                            onPlaceItem(itemId, 400, 300, activeRoom);
                            setLastPlacedItemName(item.name);
                            setShowStorage(false);
                          }}
                          className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-all flex flex-col items-center gap-2 group relative"
                        >
                          <div className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                          <span className="text-[10px] font-black text-white uppercase tracking-tight">{item.name}</span>
                          {placedCount > 0 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">
                              {placedCount}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                            <Plus size={20} className="text-white" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      <Archive size={40} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white/80">Storage is Empty</h4>
                      <p className="text-sm text-white/40 max-w-xs mx-auto">
                        Buy items from the Shop to fill your library and design your space!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
