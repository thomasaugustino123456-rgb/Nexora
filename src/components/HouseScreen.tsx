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

  // Room 2 States (Cartoon)
  const [screenOn, setScreenOn] = useState(false);
  const [ballBouncing, setBallBouncing] = useState(false);
  const [curtainsSwaying, setCurtainsSwaying] = useState(false);
  const [booksWobbling, setBooksWobbling] = useState(false);

  // Room 3 States (Cozy)
  const [fireTaps, setFireTaps] = useState(0);
  const [isNightMode, setIsNightMode] = useState(false);
  const [chairLeftBouncing, setChairLeftBouncing] = useState(false);
  const [chairRightBouncing, setChairRightBouncing] = useState(false);
  const [coffeeTableBouncing, setCoffeeTableBouncing] = useState(false);
  const [smallTableBouncing, setSmallTableBouncing] = useState(false);
  const [shelfItem1Jiggling, setShelfItem1Jiggling] = useState(false);
  const [shelfItem2Jiggling, setShelfItem2Jiggling] = useState(false);
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

  const bounceBall = () => {
    vibrate(10);
    setBallBouncing(true);
    setTimeout(() => setBallBouncing(false), 1000);
  };

  const swayCurtains = () => {
    vibrate(5);
    setCurtainsSwaying(true);
    setTimeout(() => setCurtainsSwaying(false), 1500);
  };

  const wobbleBooks = () => {
    vibrate(5);
    setBooksWobbling(true);
    setTimeout(() => setBooksWobbling(false), 1000);
  };

  const toggleScreen = () => {
    vibrate(10);
    setScreenOn(!screenOn);
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
    setScreenOn(false);
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
            {activeRoom === 0 ? 'Interactive 3D Room' : activeRoom === 1 ? 'Cartoon Studio' : 'Cozy Miniature'}
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
                  <filter id="screenGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="cartoonFloor" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C26A3B" />
                    <stop offset="100%" stopColor="#9A4E26" />
                  </linearGradient>
                </defs>

                {/* Room Background (Isometric) */}
                <g id="cartoon-base">
                  <polygon points="400,300 100,450 100,80 400,50" fill="#F4A460" />
                  <polygon points="400,300 700,450 700,80 400,50" fill="#ECA058" />
                  <polygon points="400,300 100,450 400,600 700,450" fill="url(#cartoonFloor)" />
                </g>

                {/* Window & Curtains (Isometric) */}
                <g id="window-area-iso">
                  <polygon points="480,210 600,270 600,150 480,90" fill="#FFFFFF" />
                  <polygon points="490,205 590,255 590,160 490,110" fill="#81D4FA" />
                  
                  <motion.g 
                    id="curtains-iso" 
                    onClick={swayCurtains} 
                    className="cursor-pointer"
                    animate={curtainsSwaying ? { rotateY: [0, 15, -15, 10, 0] } : {}}
                    transition={{ duration: 1.5 }}
                    style={{ transformOrigin: "540px 150px" }}
                  >
                    <polygon points="475,80 500,100 500,220 475,200" fill="#00897B" />
                    <polygon points="580,140 605,160 605,280 580,260" fill="#00897B" />
                    <polygon points="470,70 610,140 610,110 470,40" fill="#00796B" />
                  </motion.g>
                </g>

                {/* Rug */}
                <ellipse cx="400" cy="480" rx="180" ry="40" fill="#A5D6A7" opacity="0.6" transform="rotate(15 400 480)" />

                {/* Movable Items */}
                <motion.g id="picture-cartoon" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="120,180 180,210 180,120 120,90" fill="#5D4037" />
                  <polygon points="130,175 170,195 170,130 130,110" fill="#FFF" />
                  <circle cx="150" cy="150" r="10" fill="#FFB300" />
                </motion.g>

                <motion.g id="bookshelf-iso" drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing" onClick={wobbleBooks}>
                  <polygon points="620,380 680,410 680,150 620,120" fill="#5D4037" />
                  <polygon points="680,410 710,395 710,135 680,150" fill="#3E2723" />
                  <polygon points="620,120 680,150 710,135 650,105" fill="#6D4C41" />
                  
                  <motion.g animate={booksWobbling ? { rotate: [0, 4, -3, 2, 0] } : {}} transition={{ duration: 0.6 }} style={{ transformOrigin: "650px 250px" }}>
                    <rect x="630" y="200" width="10" height="40" fill="#D32F2F" transform="skewY(25)" />
                    <rect x="645" y="190" width="8" height="45" fill="#1976D2" transform="skewY(25)" />
                    <rect x="655" y="210" width="12" height="30" fill="#388E3C" transform="skewY(25)" />
                  </motion.g>
                </motion.g>

                <motion.g id="desk-iso" drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="200,400 350,475 350,385 200,310" fill="#8D6E63" />
                  <polygon points="350,475 380,460 380,370 350,385" fill="#6D4C41" />
                  <polygon points="200,310 350,385 380,370 230,295" fill="#A1887F" />
                  {/* Drawers */}
                  <rect x="210" y="330" width="40" height="15" fill="#5D4037" transform="skewY(25)" rx="2" />
                  <rect x="210" y="355" width="40" height="15" fill="#5D4037" transform="skewY(25)" rx="2" />
                </motion.g>

                <motion.g id="chair-cartoon-iso" drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <rect x="380" y="450" width="6" height="40" fill="#424242" />
                  <rect x="420" y="470" width="6" height="40" fill="#424242" />
                  <polygon points="370,450 430,480 450,470 390,440" fill="#FF7043" />
                  <polygon points="430,480 450,470 450,410 430,420" fill="#F4511E" />
                  <polygon points="390,440 450,470 450,410 390,380" fill="#FF8A65" />
                </motion.g>

                <motion.g id="computer-iso" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={toggleScreen} className="cursor-grab active:cursor-grabbing">
                  <polygon points="280,360 330,385 330,335 280,310" fill="#212121" />
                  <polygon points="330,385 345,377 345,327 330,335" fill="#111" />
                  <polygon points="285,355 325,375 325,340 285,320" fill={screenOn ? "#E0F7FA" : "#111"} className="transition-colors duration-300" />
                  {screenOn && <polygon points="285,355 325,375 325,340 285,320" fill="#E3F2FD" opacity="0.5" filter="url(#screenGlow)" />}
                </motion.g>

                <motion.g id="basketball-iso" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={bounceBall} className="cursor-grab active:cursor-grabbing" animate={ballBouncing ? { y: [0, 10, -120, 0, 5, -40, 0], scaleY: [1, 0.9, 1.1, 1, 0.95, 1.02, 1], scaleX: [1, 1.1, 0.9, 1, 1.05, 0.98, 1] } : {}} transition={{ duration: 1, ease: "easeOut" }} style={{ transformOrigin: "520px 520px" }}>
                  <circle cx="520" cy="520" r="25" fill="#FF8C00" />
                  <path d="M 495,520 A 25,25 0 0,0 545,520" fill="none" stroke="#3E2723" strokeWidth="2" />
                  <path d="M 520,495 A 25,25 0 0,0 520,545" fill="none" stroke="#3E2723" strokeWidth="2" />
                </motion.g>
              </svg>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap pointer-events-none">
                Tap the Basketball, Computer, or Bookshelf!
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
                  <pattern id="brick-back-iso" width="60" height="30" patternUnits="userSpaceOnUse">
                    <rect width="60" height="30" fill="#D35400" />
                    <rect width="60" height="14" fill="#E67E22" />
                    <rect x="30" y="15" width="60" height="14" fill="#E67E22" />
                  </pattern>
                  <radialGradient id="fireGlowGradIso" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF9C4" stopOpacity="1" />
                    <stop offset="100%" stopColor="#D84315" stopOpacity="0" />
                  </radialGradient>
                  <filter id="blurGlowCozyIso">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Architecture (Isometric) */}
                <g id="cozy-base">
                  <polygon points="400,300 100,450 100,80 400,50" fill="#CA6F1E" />
                  <polygon points="400,300 700,450 700,80 400,50" fill="url(#brick-back-iso)" />
                  <polygon points="400,300 100,450 400,600 700,450" fill="#5D4037" />
                </g>

                {/* Shelf & Items */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="120,150 180,180 180,350 120,320" fill="#F5F5F5" />
                  <polygon points="120,220 180,250 180,255 120,225" fill="#E0E0E0" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerJiggle(setShelfItem1Jiggling)} animate={shelfItem1Jiggling ? { rotate: [0, 5, -5, 2, 0], scale: [1, 1.1, 1.1, 1.05, 1] } : {}} className="cursor-grab active:cursor-grabbing" transform="translate(150, 200)">
                  <circle cx="0" cy="0" r="12" fill="#FF5252" /> 
                  <circle cx="0" cy="0" r="9" fill="#FFFFFF" /> 
                </motion.g>

                {/* Window */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="480,180 580,230 580,130 480,80" fill="#FDFEFE" />
                  <polygon points="485,175 575,220 575,135 485,90" fill={isNightMode ? "#1A237E" : "#B2EBF2"} className="transition-colors duration-800" />
                </motion.g>

                {/* Fireplace (Corner) */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="350,300 450,350 450,250 350,200" fill="#E64A19" /> 
                  <polygon points="370,310 430,340 430,280 370,250" fill="#212121" /> 
                </motion.g>

                <motion.g id="fire-trigger-iso" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={handleFireClick} className="cursor-grab active:cursor-grabbing">
                  <motion.g 
                    animate={{ 
                      opacity: fireTaps === 4 ? 0.1 : [0.8, 0.95, 0.8],
                      scale: fireTaps === 2 || fireTaps === 3 ? 1.6 : fireTaps === 4 ? 0.5 : [0.95, 1, 0.95],
                      filter: fireTaps === 2 || fireTaps === 3 ? "brightness(1.4) saturate(1.5)" : fireTaps === 4 ? "grayscale(1) brightness(0.2)" : "none"
                    }} 
                    transition={{ duration: 0.5 }}
                    style={{ transformOrigin: "400px 300px" }}
                  >
                    <circle cx="400" cy="300" r="30" fill="url(#fireGlowGradIso)" />
                    <path d="M 390,310 Q 400,270 410,300 Q 420,260 430,310 Z" fill="#FFC107" filter="url(#blurGlowCozyIso)" />
                  </motion.g>
                </motion.g>

                {/* Lamp */}
                <motion.g id="lamp-right-iso" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={toggleNightMode} className="cursor-grab active:cursor-grabbing" animate={lampWobbling ? { rotate: [0, 5, -3, 0] } : {}} style={{ transformOrigin: "bottom center" }}>
                  <rect x="630" y="380" width="10" height="20" fill="#FBC02D" rx="3" /> 
                  <polygon points="635,340 655,385 615,385" fill="#FFF59D" filter="url(#blurGlowCozyIso)" /> 
                  {!isNightMode && <circle cx="635,360" r="40" fill="url(#lampGlow)" opacity="0.6" style={{ pointerEvents: "none" }} />}
                </motion.g>

                {/* Rug */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.02 }} className="cursor-grab active:cursor-grabbing">
                  <polygon points="400,400 250,475 400,550 550,475" fill="#FDFEFE" opacity="0.4" />
                </motion.g>

                {/* Furniture */}
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setChairLeftBouncing)} animate={chairLeftBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "250px 450px" }}>
                  <polygon points="210,450 290,490 290,430 210,390" fill="#A1887F" /> 
                  <polygon points="210,390 290,430 270,410 200,370" fill="#8D6E63" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setCoffeeTableBouncing)} animate={coffeeTableBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "400px 475px" }}>
                  <polygon points="350,475 450,525 450,515 350,465" fill="#FFFFFF" />
                  <polygon points="350,475 350,485 450,535 450,525" fill="#E0E0E0" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setChairRightBouncing)} animate={chairRightBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "550px 450px" }}>
                  <polygon points="510,490 590,450 590,390 510,430" fill="#A1887F" /> 
                  <polygon points="510,430 590,390 570,370 500,410" fill="#8D6E63" />
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
              onClick={bounceBall}
              className="p-4 rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-200 flex items-center gap-3"
            >
              <Sparkles size={24} />
              <span className="font-black uppercase tracking-widest text-xs">Bounce Ball</span>
            </button>
            
            <button 
              onClick={toggleScreen}
              className={`p-4 rounded-3xl transition-all shadow-xl flex items-center gap-3 ${
                screenOn ? 'bg-cyan-400 text-cyan-900 shadow-cyan-200' : 'bg-white/10 text-white/40'
              }`}
            >
              <Lightbulb size={24} />
              <span className="font-black uppercase tracking-widest text-xs">{screenOn ? 'Screen On' : 'Screen Off'}</span>
            </button>

            <button 
              onClick={wobbleBooks}
              className="p-4 rounded-3xl bg-purple-500 text-white shadow-xl shadow-purple-200 flex items-center gap-3"
            >
              <Sparkles size={24} />
              <span className="font-black uppercase tracking-widest text-xs">Wobble Books</span>
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
