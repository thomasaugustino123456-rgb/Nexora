import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Home, Sparkles, Lightbulb, MousePointer2, Move, RefreshCw, ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';
import { vibrate } from '../lib/vibrate';

export function HouseScreen({ onBack }: { onBack: () => void }) {
  const [resetKey, setResetKey] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [activeRoom, setActiveRoom] = useState(0); // 0: Isometric, 1: Cartoon, 2: Cozy

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

  const handleZoom = (delta: number) => {
    vibrate(5);
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2));
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

                {/* Window (Fixed Perspective) */}
                <g id="window" className="pointer-events-none">
                  <polygon points="480,210 600,270 600,150 480,90" fill="#E0E0E0" />
                  <polygon points="490,205 590,255 590,160 490,110" fill="#2A3B45" />
                  <polygon points="495,202 585,247 585,165 495,120" fill="#112233" />
                  <circle cx="520" cy="150" r="1.5" fill="#FFFFFF" opacity="0.8"/>
                  <circle cx="560" cy="210" r="2" fill="#FFFFFF" opacity="0.6"/>
                  <circle cx="540" cy="180" r="1" fill="#FFFFFF" opacity="0.9"/>
                  <line x1="540" y1="142" x2="540" y2="225" stroke="#E0E0E0" strokeWidth="2" opacity="0.3" />
                  <line x1="495" y1="170" x2="585" y2="215" stroke="#E0E0E0" strokeWidth="2" opacity="0.3" />
                </g>

                {/* Picture Frame */}
                <motion.g id="picture" drag dragMomentum={false} whileDrag={{ scale: 1.1, zIndex: 50 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="300,160 220,200 220,120 300,80" fill="#111111" />
                  <polygon points="290,155 230,185 230,125 290,95" fill="#F5F5F5" />
                  <polygon points="230,185 250,165 260,175 290,140 290,155 230,185" fill="#4CAF50" />
                  <ellipse cx="265" cy="115" rx="10" ry="12" transform="rotate(-20 265 115)" fill="#FF9800" />
                </motion.g>

                {/* Rug */}
                <g id="rug" className="pointer-events-none">
                  <polygon points="400,340 220,430 400,520 580,430" fill="#00796B" opacity="0.9" />
                  <polygon points="400,355 245,430 400,505 555,430" fill="#009688" />
                  <polygon points="400,370 270,430 400,490 530,430" fill="#80CBC4" opacity="0.5" />
                </g>

                {/* Movable Items */}
                <motion.g id="table" drag dragMomentum={false} whileDrag={{ scale: 1.05, filter: "brightness(1.2)" }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="310,425 320,430 320,490 310,485" fill="#4E342E" />
                  <polygon points="320,430 325,427 325,487 320,490" fill="#3E2723" />
                  <polygon points="480,420 490,425 490,485 480,480" fill="#4E342E" />
                  <polygon points="490,425 495,422 495,482 490,485" fill="#3E2723" />
                  <polygon points="395,475 405,480 405,540 395,535" fill="#4E342E" />
                  <polygon points="405,480 410,477 410,537 405,540" fill="#3E2723" />
                  <polygon points="400,370 300,420 400,470 500,420" fill="#8D6E63" />
                  <polygon points="300,420 400,470 400,480 300,430" fill="#6D4C41" />
                  <polygon points="400,470 500,420 500,430 400,480" fill="#5D4037" />
                </motion.g>

                <motion.g id="laptop" drag dragMomentum={false} whileDrag={{ scale: 1.1, filter: "brightness(1.3)" }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="380,410 350,425 380,440 410,425" fill="#BDBDBD" />
                  <polygon points="350,425 380,410 380,385 350,400" fill="#9E9E9E" />
                  <polygon points="353,421 377,409 377,388 353,403" fill={lightOn ? "#E3F2FD" : "#1a2a3a"} className="transition-colors duration-500" />
                </motion.g>

                <motion.g id="chair" drag dragMomentum={false} whileDrag={{ scale: 1.05, filter: "brightness(1.2)" }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="500,455 505,457 505,502 500,500" fill="#424242" />
                  <polygon points="470,475 475,477 475,522 470,520" fill="#616161" />
                  <polygon points="435,458 440,460 440,505 435,503" fill="#757575" />
                  <polygon points="470,435 430,455 470,475 510,455" fill="#FF7043" />
                  <polygon points="430,455 470,475 470,480 430,460" fill="#F4511E" />
                  <polygon points="470,475 510,455 510,460 470,480" fill="#E64A19" />
                  <polygon points="470,435 510,455 510,395 470,375" fill="#FF8A65" />
                  <polygon points="510,455 515,457 515,397 510,395" fill="#E64A19" />
                  <polygon points="470,375 510,395 515,397 475,377" fill="#FFAB91" />
                </motion.g>

                <motion.g id="plant-group" drag dragMomentum={false} whileDrag={{ scale: 1.05, filter: "brightness(1.2)" }} className="cursor-grab active:cursor-grabbing" onClick={shakePlant}>
                  <g id="pot">
                    <polygon points="350,315 330,325 350,335 370,325" fill="#5D4037" />
                    <polygon points="330,325 350,335 345,365 335,355" fill="#4E342E" />
                    <polygon points="350,335 370,325 365,355 345,365" fill="#3E2723" />
                  </g>
                  <motion.g id="leaves" animate={plantShaking ? { rotate: [0, -4, 12, -8, 4, -2, 0], scaleY: [1, 0.9, 1.12, 0.95, 1.02, 0.99, 1], scaleX: [1, 1.08, 0.9, 1.04, 0.98, 1.01, 1] } : {}} transition={{ duration: 0.9, ease: "easeInOut" }} style={{ transformOrigin: "350px 335px" }}>
                    <polygon points="350,325 315,260 335,295" fill="#4CAF50" />
                    <polygon points="350,325 350,240 365,285" fill="#2E7D32" />
                    <polygon points="350,325 385,270 375,305" fill="#388E3C" />
                    <polygon points="350,325 305,290 330,315" fill="#81C784" />
                    <polygon points="350,325 385,305 365,320" fill="#A5D6A7" />
                  </motion.g>
                </motion.g>

                <g id="lamp-container">
                  <line x1="400" y1="-10" x2="400" y2="160" stroke="#111" strokeWidth="3" />
                  <motion.g id="lamp" onClick={toggleLight} className="cursor-pointer" animate={{ rotate: lightOn ? 0 : [0, 2, -2, 1, -1, 0] }} transition={{ duration: 0.5 }} style={{ transformOrigin: "400px 160px" }}>
                    <polygon points="390,160 410,160 415,165 385,165" fill="#424242" />
                    <polygon points="385,165 415,165 440,210 360,210" fill="#212121" />
                    <polygon points="400,200 440,210 400,220 360,210" fill={lightOn ? "#FBC02D" : "#333"} className="transition-colors duration-500" />
                    <AnimatePresence>
                      {lightOn && (
                        <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                          <ellipse cx="400" cy="210" rx="10" ry="5" fill="#FFF59D" filter="url(#glow)" />
                          <ellipse cx="400" cy="210" rx="15" ry="8" fill="#FFF" opacity="0.8" />
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </motion.g>
                </g>

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

                {/* ==========================================
                     TOP-LEFT ROOM (Green Stripes, Pink Floor) 
                     ========================================== */}
                <g id="room-tl">
                  {/* Background */}
                  <rect width="400" height="220" fill="#A5D68B"/>
                  <path d="M20,0 v220 M60,0 v220 M100,0 v220 M140,0 v220 M180,0 v220 M220,0 v220 M260,0 v220 M300,0 v220 M340,0 v220 M380,0 v220" stroke="#8BC34A" strokeWidth="20" opacity="0.6"/>
                  <polygon points="0,220 400,220 400,300 0,300" fill="#E06287"/>
                  
                  {/* Ambient Sunbeam */}
                  <polygon points="120,0 280,0 40,300 -120,300" fill="#FFFFFF" opacity="0.15" pointer-events="none"/>

                  {/* Window & Curtains */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="-30" y="20" width="80" height="120" fill="#E1F5FE"/>
                    <path d="M0,0 Q30,50 10,150 L-30,150 V0 Z" fill="#F48FB1"/>
                  </motion.g>
                  
                  {/* Wooden Wall Shelves */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="330" y="40" width="60" height="8" fill="#8D6E63"/>
                    <rect x="330" y="80" width="60" height="8" fill="#8D6E63"/>
                    <rect x="340" y="40" width="5" height="48" fill="#795548"/>
                    <use href="#book1" x="335" y="15"/> <use href="#book3" x="345" y="12"/>
                    <use href="#book2" x="355" y="60"/> <use href="#book4" x="368" y="58"/>
                  </motion.g>

                  {/* Yellow Dresser & Plant */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="10" y="150" width="60" height="80" fill="#FFCA28" rx="3"/>
                    <rect x="15" y="155" width="50" height="20" fill="#FFB300" rx="2"/>
                    <rect x="15" y="180" width="50" height="20" fill="#FFB300" rx="2"/>
                    <rect x="15" y="205" width="50" height="20" fill="#FFB300" rx="2"/>
                    <rect x="30" y="135" width="20" height="15" fill="#FFFFFF"/>
                    <path d="M40,135 Q30,110 25,125 Q40,135 45,115 Q50,135 55,120 Q40,135 40,135" fill="#4CAF50"/>
                  </motion.g>

                  {/* Yellow Vanity */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="85" y="150" width="50" height="40" fill="#FFCA28" rx="2"/>
                    <ellipse cx="110" cy="110" rx="20" ry="35" fill="#B3E5FC" stroke="#FFA000" strokeWidth="4"/>
                    <rect x="100" y="195" width="20" height="25" fill="#FFCA28"/>
                    <ellipse cx="110" cy="195" rx="15" ry="8" fill="#EC407A"/>
                  </motion.g>

                  {/* White Sofa */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="170" y="140" width="180" height="70" fill="#F5F5F5" rx="10"/>
                    <rect x="160" y="180" width="200" height="35" fill="#FFFFFF" rx="8"/>
                    <rect x="180" y="215" width="8" height="10" fill="#FFA000" rx="2"/>
                    <rect x="330" y="215" width="8" height="10" fill="#FFA000" rx="2"/>
                    <use href="#pillow-yellow" x="200" y="170" transform="rotate(-10 200 170)"/>
                    <use href="#pillow-pink" x="230" y="175"/>
                    <use href="#pillow-orange" x="290" y="172"/>
                    <use href="#pillow-yellow" x="320" y="175" transform="rotate(15 320 175)"/>
                  </motion.g>

                  {/* INTERACTIVE LAMP 1 */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    {room2Lamps[0] && <polygon points="365,110 250,300 450,300" fill="#FFF176" opacity="0.5" className="pointer-events-none"/>}
                    <g onClick={() => toggleRoom2Lamp(0)} className="cursor-pointer">
                      <rect x="363" y="110" width="4" height="110" fill="#757575"/>
                      <ellipse cx="365" cy="220" rx="15" ry="5" fill="#424242"/>
                      <polygon points="350,110 380,110 370,70 360,70" fill="#EC407A"/>
                      <circle cx="365" cy="105" r="6" fill={room2Lamps[0] ? "#FFF7B0" : "#888"} className="transition-colors duration-300"/>
                    </g>
                  </motion.g>
                </g>

                {/* ==========================================
                     TOP-RIGHT ROOM (Teal Walls, Yellow Rug) 
                     ========================================== */}
                <g id="room-tr" transform="translate(400, 0)">
                  <rect width="400" height="220" fill="#4DB6AC"/>
                  <polygon points="0,220 400,220 400,300 0,300" fill="#00695C"/>
                  {/* Yellow Striped Rug */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.02 }} className="cursor-grab active:cursor-grabbing">
                    <polygon points="30,230 360,230 380,290 10,290" fill="#FFCA28"/>
                    <polygon points="50,230 70,230 60,290 30,290" fill="#FFA000"/>
                    <polygon points="110,230 130,230 120,290 90,290" fill="#FFA000"/>
                    <polygon points="170,230 190,230 180,290 150,290" fill="#FFA000"/>
                    <polygon points="230,230 250,230 240,290 210,290" fill="#FFA000"/>
                    <polygon points="290,230 310,230 300,290 270,290" fill="#FFA000"/>
                  </motion.g>

                  <polygon points="200,0 350,0 150,300 -50,300" fill="#FFFFFF" opacity="0.1" pointer-events="none"/>

                  {/* Window */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="180" y="20" width="100" height="80" fill="#FFFFFF" stroke="#B2DFDB" strokeWidth="4"/>
                    <path d="M170,10 Q210,50 190,110 L170,110 Z" fill="#00796B"/>
                    <path d="M290,10 Q250,50 270,110 L290,110 Z" fill="#00796B"/>
                    <rect x="220" y="90" width="15" height="10" fill="#8D6E63"/>
                    <circle cx="227" cy="80" r="10" fill="#4CAF50"/>
                  </motion.g>

                  {/* Bed */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="60" y="160" width="160" height="30" fill="#8D6E63" rx="4"/>
                    <rect x="70" y="150" width="150" height="35" fill="#4CAF50" rx="5"/>
                    <rect x="70" y="165" width="150" height="25" fill="#388E3C" rx="5"/>
                    <rect x="50" y="140" width="40" height="20" fill="#FFB74D" rx="5" transform="rotate(-15 70 150)"/>
                    <polygon points="140,150 160,155 180,150 180,140 160,145 140,140" fill="#FFFFFF"/>
                  </motion.g>

                  {/* Nightstand */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="10" y="160" width="35" height="45" fill="#795548"/>
                    <rect x="15" y="150" width="25" height="10" fill="#212121" rx="2"/>
                    <text x="18" y="158" fontSize="6" fill="#00FF00" fontFamily="monospace">12:00</text>
                  </motion.g>

                  {/* Slippers */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} className="cursor-grab active:cursor-grabbing">
                    <ellipse cx="140" cy="245" rx="10" ry="5" fill="#8D6E63" transform="rotate(-20 140 245)"/>
                    <ellipse cx="160" cy="250" rx="10" ry="5" fill="#8D6E63" transform="rotate(-10 160 250)"/>
                  </motion.g>

                  {/* Tall Bookshelf */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="300" y="20" width="60" height="170" fill="#FFB300"/>
                    <rect x="305" y="25" width="50" height="160" fill="#6D4C41"/>
                    <rect x="305" y="60" width="50" height="4" fill="#FFB300"/>
                    <rect x="305" y="100" width="50" height="4" fill="#FFB300"/>
                    <rect x="305" y="140" width="50" height="4" fill="#FFB300"/>
                    <use href="#book1" x="310" y="35"/> <use href="#book3" x="325" y="32"/>
                    <use href="#book2" x="340" y="80"/> <use href="#book4" x="315" y="78"/>
                    <circle cx="330" cy="125" r="12" fill="#29B6F6"/>
                    <path d="M330,113 Q345,125 330,137" fill="none" stroke="#4CAF50" strokeWidth="3"/>
                    <rect x="328" y="137" width="4" height="4" fill="#BDBDBD"/>
                  </motion.g>

                  {/* Desk & Laptop */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <polygon points="340,170 400,190 400,230 340,200" fill="#8D6E63"/>
                    <rect x="360" y="200" width="30" height="40" fill="#5D4037"/>
                    <g onClick={toggleRoom2Laptop} className="cursor-pointer">
                      <polygon points="360,170 380,180 375,160 355,150" fill="#424242"/>
                      <polygon points="360,170 380,180 390,175 370,165" fill={room2LaptopOn ? "#E3F2FD" : "#BDBDBD"} className="transition-colors duration-300"/>
                      {room2LaptopOn && <polygon points="360,170 380,180 390,175 370,165" fill="#E3F2FD" opacity="0.5" filter="url(#screenGlowRoom2)"/>}
                    </g>
                  </motion.g>

                  {/* Chair */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="290" y="140" width="30" height="35" fill="#EC407A" rx="8"/>
                    <ellipse cx="305" cy="185" rx="20" ry="8" fill="#D81B60"/>
                    <rect x="303" y="188" width="4" height="20" fill="#424242"/>
                    <path d="M290,210 L320,210 M305,210 L305,215" stroke="#424242" strokeWidth="3"/>
                  </motion.g>

                  {/* INTERACTIVE LAMP 2 */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    {room2Lamps[1] && <polygon points="345,145 280,250 400,250" fill="#FFF176" opacity="0.5" className="pointer-events-none"/>}
                    <g onClick={() => toggleRoom2Lamp(1)} className="cursor-pointer">
                      <ellipse cx="335" cy="165" rx="8" ry="3" fill="#616161"/>
                      <path d="M335,165 L330,135 L345,140" fill="none" stroke="#757575" strokeWidth="2"/>
                      <polygon points="340,135 350,145 342,150" fill="#F44336"/>
                      <circle cx="345" cy="146" r="4" fill={room2Lamps[1] ? "#FFF7B0" : "#888"} className="transition-colors duration-300"/>
                    </g>
                  </motion.g>
                </g>

                {/* ==========================================
                     BOTTOM-LEFT ROOM (Tan Walls, PC Desk) 
                     ========================================== */}
                <g id="room-bl" transform="translate(0, 300)">
                  <rect width="400" height="220" fill="#E6C89C"/>
                  <polygon points="0,220 400,220 400,300 0,300" fill="#BA6824"/>
                  <polygon points="100,0 250,0 50,300 -100,300" fill="#FFFFFF" opacity="0.15" pointer-events="none"/>

                  {/* Window */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="80" y="30" width="120" height="100" fill="#E0F7FA"/>
                    <rect x="138" y="30" width="4" height="100" fill="#FFFFFF"/>
                    <rect x="80" y="78" width="120" height="4" fill="#FFFFFF"/>
                    <path d="M60,20 Q100,80 70,140 L60,140 Z" fill="#009688"/>
                    <path d="M220,20 Q180,80 210,140 L220,140 Z" fill="#009688"/>
                  </motion.g>

                  {/* Bed Edge */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="0" y="150" width="40" height="50" fill="#8D6E63"/>
                    <rect x="0" y="140" width="50" height="30" fill="#F44336" rx="5"/>
                    <rect x="-10" y="170" width="60" height="30" fill="#00BCD4" rx="5"/>
                    <rect x="-10" y="185" width="60" height="15" fill="#FFEB3B" rx="5"/>
                  </motion.g>

                  {/* Wall Frame */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="20" y="40" width="30" height="40" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="3"/>
                  </motion.g>

                  {/* Desk & PC */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="60" y="150" width="160" height="15" fill="#6D4C41" rx="2"/>
                    <rect x="70" y="165" width="40" height="40" fill="#8D6E63"/>
                    <rect x="75" y="170" width="30" height="10" fill="#5D4037"/>
                    <rect x="75" y="185" width="30" height="10" fill="#5D4037"/>
                    <rect x="200" y="165" width="10" height="50" fill="#5D4037"/>
                    
                    <g onClick={toggleRoom2Computer} className="cursor-pointer">
                      <rect x="110" y="100" width="50" height="35" fill="#424242" rx="2"/>
                      <rect x="115" y="105" width="40" height="25" fill={room2ComputerOn ? "#81C784" : "#222"} className="transition-colors duration-300"/>
                      {room2ComputerOn && <rect x="115" y="105" width="40" height="25" fill="#81C784" opacity="0.5" filter="url(#screenGlowRoom2)"/>}
                      <rect x="130" y="135" width="10" height="15" fill="#757575"/>
                      <rect x="120" y="145" width="30" height="5" fill="#424242"/>
                    </g>
                    <rect x="90" y="90" width="15" height="60" fill="#2E7D32" rx="2"/>
                    <rect x="50" y="190" width="15" height="20" fill="#212121" rx="2"/>
                    <circle cx="57" cy="195" r="3" fill="#757575"/>
                    <circle cx="57" cy="205" r="4" fill="#757575"/>
                  </motion.g>

                  {/* Basketball */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.2 }} className="cursor-grab active:cursor-grabbing">
                    <circle cx="230" cy="230" r="12" fill="#FF9800"/>
                    <path d="M220,230 A10,10 0 0,0 240,230 M230,218 A10,10 0 0,0 230,242" fill="none" stroke="#E65100" strokeWidth="1"/>
                  </motion.g>

                  {/* Crumpled Paper */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.2 }} className="cursor-grab active:cursor-grabbing">
                    <path d="M180,250 Q185,245 190,255 Q180,260 175,255 Z" fill="#FFFFFF"/>
                  </motion.g>
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.2 }} className="cursor-grab active:cursor-grabbing">
                    <path d="M90,260 Q95,255 100,262 Q90,268 85,263 Z" fill="#FFFFFF"/>
                  </motion.g>

                  {/* Tall Brown Bookshelf */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="250" y="30" width="50" height="190" fill="#5D4037"/>
                    <rect x="255" y="35" width="40" height="180" fill="#3E2723"/>
                    <rect x="255" y="70" width="40" height="4" fill="#5D4037"/>
                    <rect x="255" y="110" width="40" height="4" fill="#5D4037"/>
                    <rect x="255" y="150" width="40" height="4" fill="#5D4037"/>
                    <use href="#book1" x="260" y="45"/> <use href="#book3" x="270" y="42"/>
                    <circle cx="275" cy="95" r="10" fill="#29B6F6"/>
                    <path d="M275,85 Q285,95 275,105" fill="none" stroke="#FFCA28" strokeWidth="2"/>
                    <use href="#book2" x="260" y="130"/> <use href="#book4" x="280" y="128"/>
                  </motion.g>

                  {/* INTERACTIVE LAMP 3 */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    {room2Lamps[2] && <polygon points="265,160 180,280 350,280" fill="#FFF176" opacity="0.5" className="pointer-events-none"/>}
                    <g onClick={() => toggleRoom2Lamp(2)} className="cursor-pointer">
                      <rect x="260" y="175" width="10" height="5" fill="#757575"/>
                      <polygon points="255,160 275,160 270,150 260,150" fill="#AB47BC"/>
                      <circle cx="265" cy="160" r="3" fill={room2Lamps[2] ? "#FFF7B0" : "#888"} className="transition-colors duration-300"/>
                    </g>
                  </motion.g>
                </g>

                {/* ==========================================
                     BOTTOM-RIGHT ROOM (Beige Walls, White Sofa) 
                     ========================================== */}
                <g id="room-br" transform="translate(400, 300)">
                  <rect width="400" height="220" fill="#F4DEBA"/>
                  <polygon points="0,220 400,220 400,300 0,300" fill="#50A29C"/>
                  <ellipse cx="200" cy="260" rx="150" ry="30" fill="#81C784"/>
                  <ellipse cx="200" cy="260" rx="130" ry="20" fill="#A5D68B"/>
                  <polygon points="200,0 350,0 150,300 -50,300" fill="#FFFFFF" opacity="0.15" pointer-events="none"/>

                  {/* Wall Panels */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="60" y="30" width="40" height="60" fill="#FFF8E1" opacity="0.8"/>
                    <rect x="115" y="30" width="40" height="60" fill="#FFF8E1" opacity="0.8"/>
                    <rect x="170" y="30" width="40" height="60" fill="#FFF8E1" opacity="0.8"/>
                  </motion.g>

                  {/* Left Bookshelf */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="10" y="30" width="50" height="190" fill="#4DD0E1"/>
                    <rect x="15" y="35" width="40" height="180" fill="#00838F"/>
                    <rect x="15" y="70" width="40" height="4" fill="#4DD0E1"/>
                    <rect x="15" y="110" width="40" height="4" fill="#4DD0E1"/>
                    <rect x="15" y="150" width="40" height="4" fill="#4DD0E1"/>
                    <use href="#book2" x="20" y="50"/> <use href="#book3" x="35" y="42"/>
                    <use href="#book1" x="25" y="85"/> <use href="#book4" x="40" y="88"/>
                  </motion.g>

                  {/* Right Bookshelf */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="340" y="30" width="50" height="190" fill="#4DD0E1"/>
                    <rect x="345" y="35" width="40" height="180" fill="#00838F"/>
                    <rect x="345" y="70" width="40" height="4" fill="#4DD0E1"/>
                    <rect x="345" y="110" width="40" height="4" fill="#4DD0E1"/>
                    <rect x="345" y="150" width="40" height="4" fill="#4DD0E1"/>
                    <use href="#book4" x="350" y="48"/> <use href="#book1" x="370" y="45"/>
                    <use href="#book3" x="355" y="82"/> <use href="#book2" x="365" y="90"/>
                    <circle cx="365" cy="135" r="10" fill="#81C784"/>
                  </motion.g>

                  {/* White Sofa */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    <rect x="70" y="120" width="260" height="80" fill="#FFFFFF" rx="15"/>
                    <rect x="80" y="170" width="240" height="25" fill="#F5F5F5" rx="5"/>
                    <use href="#pillow-pink" x="95" y="160"/>
                    <use href="#pillow-orange" x="120" y="155"/>
                    <use href="#pillow-yellow" x="150" y="160" transform="rotate(10 150 160)"/>
                    <use href="#pillow-pink" x="200" y="155"/>
                    <use href="#pillow-yellow" x="240" y="160"/>
                    <use href="#pillow-orange" x="280" y="150" transform="rotate(-15 280 150)"/>
                  </motion.g>

                  {/* Beanbag Chair */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} className="cursor-grab active:cursor-grabbing">
                    <path d="M120,280 C100,280 90,250 110,220 C130,190 170,190 180,220 C200,250 180,280 150,280 Z" fill="#FF9800"/>
                    <path d="M140,240 Q150,230 160,240" fill="none" stroke="#E65100" strokeWidth="2"/>
                  </motion.g>

                  {/* Floor Laptop */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} className="cursor-grab active:cursor-grabbing">
                    <polygon points="300,260 330,260 320,240 290,240" fill="#424242"/>
                    <polygon points="300,260 330,260 340,270 310,270" fill="#BDBDBD"/>
                  </motion.g>

                  {/* INTERACTIVE LAMP 4 */}
                  <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                    {room2Lamps[3] && <polygon points="315,90 180,280 400,280" fill="#FFF176" opacity="0.5" className="pointer-events-none"/>}
                    <g onClick={() => toggleRoom2Lamp(3)} className="cursor-pointer">
                      <rect x="313" y="80" width="4" height="140" fill="#BCAAA4"/>
                      <ellipse cx="315" cy="220" rx="15" ry="5" fill="#8D6E63"/>
                      <polygon points="300,80 330,80 320,40 310,40" fill="#FFCA28"/>
                      <circle cx="315" cy="80" r="6" fill={room2Lamps[3] ? "#FFF7B0" : "#888"} className="transition-colors duration-300"/>
                    </g>
                  </motion.g>
                </g>
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

                {/* Shelf & Items */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="30,90 110,140 110,330 30,420" fill="#9E9E9E" />
                  <polygon points="70,90 150,140 110,140 30,90" fill="#757575" />
                  <polygon points="70,420 150,330 110,330 30,420" fill="#E0E0E0" />
                  <polygon points="150,140 150,330 110,330 110,140" fill="#616161" />
                  <polygon points="70,185 150,210 110,210 30,185" fill="#E0E0E0" />
                  <polygon points="70,185 150,210 150,215 70,190" fill="#F5F5F5" />
                  <polygon points="150,210 110,210 110,215 150,215" fill="#BDBDBD" />
                  <polygon points="70,190 150,215 110,215 30,190" fill="#757575" />
                  <polygon points="70,275 150,275 110,275 30,275" fill="#E0E0E0" />
                  <polygon points="70,275 150,275 150,280 70,280" fill="#F5F5F5" />
                  <polygon points="150,275 110,275 110,280 150,280" fill="#BDBDBD" />
                  <polygon points="70,280 150,280 110,280 30,280" fill="#757575" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerJiggle(setShelfItem1Jiggling)} animate={shelfItem1Jiggling ? { rotate: [0, 5, -5, 2, 0], scale: [1, 1.1, 1.1, 1.05, 1] } : {}} className="cursor-grab active:cursor-grabbing" transform="translate(90, 165)">
                  <ellipse cx="0" cy="18" rx="15" ry="5" fill="#000" opacity="0.4" />
                  <circle cx="-3" cy="-2" r="18" fill="#B71C1C" />
                  <circle cx="0" cy="0" r="18" fill="#FF5252" /> 
                  <circle cx="0" cy="0" r="14" fill="#FFFFFF" /> 
                  <rect x="-1" y="-10" width="2" height="10" fill="#333" rx="1" /> 
                  <rect x="-1" y="-1" width="8" height="2" fill="#333" rx="1" />
                  <path d="M -12,-15 L -18,-20" stroke="#FF5252" strokeWidth="4" strokeLinecap="round" /> 
                  <path d="M 12,-15 L 18,-20" stroke="#FF5252" strokeWidth="4" strokeLinecap="round" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerJiggle(setShelfItem2Jiggling)} animate={shelfItem2Jiggling ? { rotate: [0, 5, -5, 2, 0], scale: [1, 1.1, 1.1, 1.05, 1] } : {}} className="cursor-grab active:cursor-grabbing" transform="translate(60, 245)">
                  <polygon points="-10,30 30,30 40,25 0,25" fill="#000" opacity="0.4" />
                  <polygon points="0,0 40,0 30,-10 -10,-10" fill="#81D4FA" />
                  <polygon points="40,0 30,-10 30,15 40,25" fill="#0288D1" />
                  <rect x="0" y="0" width="40" height="25" fill="#4FC3F7" rx="2" />
                  <rect x="0" y="0" width="40" height="8" fill="#03A9F4" rx="2" />
                  <rect x="15" y="12" width="10" height="4" fill="#E1F5FE" rx="1" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerJiggle(setShelfItem3Jiggling)} animate={shelfItem3Jiggling ? { rotate: [0, 5, -5, 2, 0], scale: [1, 1.1, 1.1, 1.05, 1] } : {}} className="cursor-grab active:cursor-grabbing" transform="translate(70, 330)">
                  <ellipse cx="25" cy="48" rx="30" ry="7" fill="#000" opacity="0.4" />
                  <g transform="translate(0, 5) rotate(-10)">
                    <polygon points="12,0 20,-5 20,40 12,45" fill="#A5D6A7" /> 
                    <rect x="0" y="0" width="12" height="45" fill="#388E3C" rx="1" /> 
                    <polygon points="0,0 12,0 20,-5 8,-5" fill="#2E7D32" /> 
                  </g>
                  <g transform="translate(20, -5)">
                    <polygon points="12,0 18,-5 18,45 12,50" fill="#FFCDD2" />
                    <rect x="0" y="0" width="12" height="50" fill="#D32F2F" rx="1" />
                    <polygon points="0,0 12,0 18,-5 6,-5" fill="#B71C1C" />
                  </g>
                  <g transform="translate(40, 5) rotate(10)">
                    <polygon points="12,0 18,-5 18,40 12,45" fill="#BBDEFB" />
                    <rect x="0" y="0" width="12" height="45" fill="#1976D2" rx="1" />
                    <polygon points="0,0 12,0 18,-5 6,-5" fill="#0D47A1" />
                  </g>
                </motion.g>

                {/* Window */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <rect x="310" y="120" width="180" height="100" fill="#FDFEFE" rx="2" />
                  <rect x="315" y="125" width="170" height="90" fill={isNightMode ? "#1A237E" : "#B2EBF2"} className="transition-colors duration-800" />
                </motion.g>

                {/* Fireplace */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <rect x="330" y="240" width="140" height="110" fill="#E64A19" /> 
                  <rect x="345" y="260" width="110" height="90" fill="#212121" /> 
                </motion.g>

                <motion.g id="fire-trigger" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={handleFireClick} className="cursor-grab active:cursor-grabbing">
                  <motion.g 
                    animate={{ 
                      opacity: fireTaps === 4 ? 0.1 : [0.8, 0.95, 0.8],
                      scale: fireTaps === 2 || fireTaps === 3 ? 1.6 : fireTaps === 4 ? 0.5 : [0.95, 1, 0.95],
                      filter: fireTaps === 2 || fireTaps === 3 ? "brightness(1.4) saturate(1.5)" : fireTaps === 4 ? "grayscale(1) brightness(0.2)" : "none"
                    }} 
                    transition={{ duration: 0.5 }}
                    style={{ transformOrigin: "400px 315px" }}
                  >
                    <circle cx="400" cy="315" r="45" fill="url(#fireGlowGrad)" />
                    <path d="M 380,330 Q 390,280 400,320 Q 410,270 420,330 Z" fill="#FFC107" filter="url(#blurGlowCozy)" />
                  </motion.g>
                </motion.g>

                {/* Lamp */}
                <motion.g id="lamp-right" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={toggleNightMode} className="cursor-grab active:cursor-grabbing" animate={lampWobbling ? { rotate: [0, 5, -3, 0] } : {}} style={{ transformOrigin: "bottom center" }}>
                  <rect x="630" y="260" width="15" height="30" fill="#FBC02D" rx="5" /> 
                  <polygon points="637,210 660,265 615,265" fill="#FFF59D" filter="url(#blurGlowCozy)" /> 
                  {!isNightMode && <circle cx="637" cy="240" r="50" fill="url(#lampGlow)" opacity="0.8" style={{ pointerEvents: "none" }} />}
                </motion.g>

                {/* Rug */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.02 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="150,580 250,380 550,380 650,580" fill="#FDFEFE" opacity="0.9" />
                </motion.g>

                {/* Furniture */}
                <motion.g id="chair-left" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setChairLeftBouncing)} animate={chairLeftBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "240px 420px" }}>
                  <rect x="210" y="420" width="6" height="40" fill="#8D6E63" /> 
                  <rect x="270" y="420" width="6" height="40" fill="#8D6E63" /> 
                  <rect x="190" y="440" width="8" height="30" fill="#6D4C41" /> 
                  <rect x="280" y="440" width="8" height="30" fill="#6D4C41" /> 
                  <polygon points="190,440 288,440 276,425 210,425" fill="#A1887F" /> 
                  <polygon points="195,435 280,435 265,420 215,420" fill="url(#checker-skewed)" />
                  <polygon points="215,420 265,420 260,360 220,360" fill="url(#checker)" />
                </motion.g>

                <motion.g id="small-table" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setSmallTableBouncing)} animate={smallTableBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "400px 430px" }}>
                  <rect x="375" y="420" width="6" height="35" fill="#5D4037" />
                  <rect x="420" y="420" width="6" height="35" fill="#5D4037" />
                  <rect x="360" y="415" width="80" height="8" fill="#8D6E63" rx="2" />
                  <g transform="translate(400, 415)">
                    <path d="M -12,0 Q -12,-15 0,-15 Q 12,-15 12,0 Z" fill="#212121" /> 
                    <path d="M 8,-12 Q 18,-15 18,-4 Q 18,3 10,2" fill="none" stroke="#212121" strokeWidth="4" strokeLinecap="round" />
                    <path d="M -10,-8 L -18,-14" stroke="#212121" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="0" cy="-15" r="2.5" fill="#424242" />
                  </g>
                </motion.g>

                <motion.g id="chair-right" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setChairRightBouncing)} animate={chairRightBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "560px 420px" }}>
                  <rect x="530" y="420" width="6" height="40" fill="#8D6E63" /> 
                  <rect x="590" y="420" width="6" height="40" fill="#8D6E63" /> 
                  <rect x="510" y="440" width="8" height="30" fill="#6D4C41" /> 
                  <rect x="600" y="440" width="8" height="30" fill="#6D4C41" /> 
                  <polygon points="510,440 608,440 596,425 530,425" fill="#A1887F" /> 
                  <polygon points="515,435 600,435 585,420 535,420" fill="url(#checker-skewed)" />
                  <polygon points="535,420 585,420 580,360 540,360" fill="url(#checker)" />
                </motion.g>

                <motion.g id="coffee-table" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setCoffeeTableBouncing)} animate={coffeeTableBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "400px 520px" }}>
                  <rect x="345" y="480" width="10" height="65" fill="#8D6E63" rx="2" />
                  <rect x="465" y="480" width="10" height="65" fill="#8D6E63" rx="2" />
                  <rect x="315" y="520" width="12" height="75" fill="#5D4037" rx="2" />
                  <rect x="495" y="520" width="12" height="75" fill="#5D4037" rx="2" />
                  <polygon points="300,530 525,530 490,480 330,480" fill="#FFFFFF" />
                  <rect x="420" y="495" width="12" height="12" fill="#F5F5F5" rx="1" />
                </motion.g>

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

      {/* Ambient Background Glow */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${
        lightOn ? 'bg-yellow-500/5' : 'bg-transparent'
      }`} />
    </motion.div>
  );
}
