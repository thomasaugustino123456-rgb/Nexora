import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Home, Sparkles, Lightbulb, MousePointer2, Move, RefreshCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
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
                  <linearGradient id="sunRays" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="screenGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Room Background */}
                <rect x="0" y="0" width="800" height="420" fill="#F4A460" />
                <rect x="100" y="0" width="40" height="420" fill="#ECA058" opacity="0.5"/>
                <rect x="300" y="0" width="40" height="420" fill="#ECA058" opacity="0.5"/>
                <rect x="500" y="0" width="40" height="420" fill="#ECA058" opacity="0.5"/>
                <rect x="700" y="0" width="40" height="420" fill="#ECA058" opacity="0.5"/>

                <rect x="0" y="420" width="800" height="180" fill="#C26A3B" />
                <rect x="0" y="420" width="800" height="20" fill="#9A4E26" />
                <rect x="0" y="440" width="800" height="5" fill="#81401F" />

                <ellipse cx="400" cy="520" rx="250" ry="60" fill="#8FBC8F" />
                <ellipse cx="400" cy="520" rx="230" ry="50" fill="#A5D6A7" />

                {/* Window & Curtains */}
                <g id="window-area">
                  <rect x="180" y="80" width="220" height="180" fill="#FFFFFF" rx="5" />
                  <rect x="190" y="90" width="200" height="160" fill="#81D4FA" />
                  <rect x="285" y="90" width="10" height="160" fill="#FFFFFF" />
                  <rect x="190" y="165" width="200" height="10" fill="#FFFFFF" />
                  
                  <motion.g 
                    id="curtains" 
                    onClick={swayCurtains} 
                    className="cursor-pointer"
                    animate={curtainsSwaying ? { rotate: [0, 3, -2, 1, 0] } : {}}
                    transition={{ duration: 1.5 }}
                    style={{ transformOrigin: "250px 80px" }}
                  >
                    <path d="M 400,80 Q 420,180 370,250 L 420,280 L 420,80 Z" fill="#00897B" />
                    <path d="M 180,80 Q 160,180 210,250 L 160,280 L 160,80 Z" fill="#00897B" />
                    <rect x="160" y="70" width="260" height="35" fill="#00796B" rx="5" />
                    <rect x="160" y="100" width="260" height="10" fill="#00695C" rx="2" />
                  </motion.g>
                </g>

                <polygon points="190,90 390,90 680,600 150,600" fill="url(#sunRays)" style={{ mixBlendMode: 'overlay' }} />

                {/* Movable Items */}
                <motion.g id="picture-cartoon" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} className="cursor-grab active:cursor-grabbing">
                  <rect x="40" y="120" width="80" height="110" fill="#5D4037" rx="3" />
                  <rect x="45" y="125" width="70" height="100" fill="#FFF" />
                  <circle cx="80" cy="160" r="15" fill="#FFB300" />
                  <polygon points="45,225 70,180 90,200 115,160 115,225" fill="#4CAF50" />
                </motion.g>

                <motion.g id="bookshelf" drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing" onClick={wobbleBooks}>
                  <rect x="580" y="100" width="160" height="340" fill="#5D4037" />
                  <rect x="590" y="110" width="140" height="320" fill="#3E2723" />
                  <rect x="580" y="180" width="160" height="10" fill="#6D4C41" />
                  <rect x="580" y="260" width="160" height="10" fill="#6D4C41" />
                  <rect x="580" y="350" width="160" height="10" fill="#6D4C41" />

                  <motion.g animate={booksWobbling ? { rotate: [0, 4, -3, 2, 0] } : {}} transition={{ duration: 0.6 }} style={{ transformOrigin: "650px 180px" }}>
                    <rect x="600" y="130" width="20" height="50" fill="#D32F2F" />
                    <rect x="625" y="120" width="15" height="60" fill="#1976D2" />
                    <rect x="645" y="140" width="18" height="40" fill="#388E3C" />
                    <polygon points="675,180 665,180 685,130 695,130" fill="#FBC02D" />
                  </motion.g>
                </motion.g>

                <motion.g id="desk" drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <rect x="180" y="440" width="300" height="20" fill="#000" opacity="0.2" rx="10" />
                  <rect x="190" y="360" width="70" height="100" fill="#A1887F" />
                  <rect x="195" y="365" width="60" height="25" fill="#8D6E63" rx="2" />
                  <circle cx="225" cy="377" r="3" fill="#3E2723" />
                  <rect x="195" y="395" width="60" height="25" fill="#8D6E63" rx="2" />
                  <circle cx="225" cy="407" r="3" fill="#3E2723" />
                  <rect x="195" y="425" width="60" height="25" fill="#8D6E63" rx="2" />
                  <circle cx="225" cy="437" r="3" fill="#3E2723" />
                  <rect x="450" y="360" width="15" height="100" fill="#8D6E63" />
                  <rect x="170" y="345" width="310" height="15" fill="#6D4C41" rx="3" />
                </motion.g>

                <motion.g id="chair-cartoon" drag dragMomentum={false} whileDrag={{ scale: 1.05 }} className="cursor-grab active:cursor-grabbing">
                  <rect x="330" y="380" width="10" height="80" fill="#424242" />
                  <rect x="380" y="380" width="10" height="80" fill="#424242" />
                  <rect x="320" y="370" width="80" height="15" fill="#FF7043" rx="5" />
                  <rect x="325" y="300" width="70" height="70" fill="#FF8A65" rx="10" />
                </motion.g>

                <motion.g id="computer" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={toggleScreen} className="cursor-grab active:cursor-grabbing">
                  <rect x="295" y="330" width="10" height="15" fill="#616161" />
                  <rect x="280" y="340" width="40" height="5" fill="#424242" rx="2" />
                  <rect x="250" y="270" width="100" height="60" fill="#212121" rx="4" />
                  <rect x="255" y="275" width="90" height="50" fill={screenOn ? "#E0F7FA" : "#111"} className="transition-colors duration-300" />
                  {screenOn && <rect x="255" y="275" width="90" height="50" fill="#E3F2FD" opacity="0.5" filter="url(#screenGlow)" />}
                </motion.g>

                <motion.g id="basketball" drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={bounceBall} className="cursor-grab active:cursor-grabbing" animate={ballBouncing ? { y: [0, 10, -120, 0, 5, -40, 0], scaleY: [1, 0.9, 1.1, 1, 0.95, 1.02, 1], scaleX: [1, 1.1, 0.9, 1, 1.05, 0.98, 1] } : {}} transition={{ duration: 1, ease: "easeOut" }} style={{ transformOrigin: "520px 520px" }}>
                  <circle cx="520" cy="520" r="25" fill="#FF8C00" />
                  <path d="M 495,520 A 25,25 0 0,0 545,520" fill="none" stroke="#3E2723" strokeWidth="2" />
                  <path d="M 520,495 A 25,25 0 0,0 520,545" fill="none" stroke="#3E2723" strokeWidth="2" />
                  <path d="M 505,500 A 30,30 0 0,1 505,540" fill="none" stroke="#3E2723" strokeWidth="2" />
                  <path d="M 535,500 A 30,30 0 0,0 535,540" fill="none" stroke="#3E2723" strokeWidth="2" />
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
                  <polygon points="70,90 150,140 150,330 70,420" fill="#F5F5F5" />
                  <polygon points="70,185 150,210 150,215 70,195" fill="#E0E0E0" />
                  <polygon points="70,275 150,275 150,280 70,285" fill="#E0E0E0" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerJiggle(setShelfItem1Jiggling)} animate={shelfItem1Jiggling ? { rotate: [0, 5, -5, 2, 0], scale: [1, 1.1, 1.1, 1.05, 1] } : {}} className="cursor-grab active:cursor-grabbing" transform="translate(110, 160)">
                  <circle cx="0" cy="0" r="18" fill="#FF5252" /> 
                  <circle cx="0" cy="0" r="14" fill="#FFFFFF" /> 
                  <rect x="-1" y="-10" width="2" height="10" fill="#333" rx="1" /> 
                  <rect x="-1" y="-1" width="8" height="2" fill="#333" rx="1" />
                  <path d="M -12,-15 L -18,-20" stroke="#FF5252" strokeWidth="4" strokeLinecap="round" /> 
                  <path d="M 12,-15 L 18,-20" stroke="#FF5252" strokeWidth="4" strokeLinecap="round" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerJiggle(setShelfItem2Jiggling)} animate={shelfItem2Jiggling ? { rotate: [0, 5, -5, 2, 0], scale: [1, 1.1, 1.1, 1.05, 1] } : {}} className="cursor-grab active:cursor-grabbing" transform="translate(90, 245)">
                  <rect x="0" y="0" width="45" height="25" fill="#4FC3F7" rx="3" />
                  <rect x="0" y="0" width="45" height="8" fill="#03A9F4" rx="2" />
                  <rect x="18" y="12" width="10" height="4" fill="#E1F5FE" rx="1" />
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
                    style={{ transformOrigin: "400px 330px" }}
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
                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setChairLeftBouncing)} animate={chairLeftBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "240px 420px" }}>
                  <rect x="210" y="420" width="6" height="40" fill="#8D6E63" /> 
                  <rect x="270" y="420" width="6" height="40" fill="#8D6E63" /> 
                  <rect x="190" y="440" width="8" height="30" fill="#6D4C41" /> 
                  <rect x="280" y="440" width="8" height="30" fill="#6D4C41" /> 
                  <polygon points="190,440 288,440 276,425 210,425" fill="#A1887F" /> 
                  <polygon points="195,435 280,435 265,420 215,420" fill="url(#checker-skewed)" />
                  <polygon points="215,420 265,420 260,360 220,360" fill="url(#checker)" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setSmallTableBouncing)} animate={smallTableBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "400px 430px" }}>
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

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setChairRightBouncing)} animate={chairRightBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "560px 420px" }}>
                  <rect x="530" y="420" width="6" height="40" fill="#8D6E63" /> 
                  <rect x="590" y="420" width="6" height="40" fill="#8D6E63" /> 
                  <rect x="510" y="440" width="8" height="30" fill="#6D4C41" /> 
                  <rect x="600" y="440" width="8" height="30" fill="#6D4C41" /> 
                  <polygon points="510,440 608,440 596,425 530,425" fill="#A1887F" /> 
                  <polygon points="515,435 600,435 585,420 535,420" fill="url(#checker-skewed)" />
                  <polygon points="535,420 585,420 580,360 540,360" fill="url(#checker)" />
                </motion.g>

                <motion.g drag dragMomentum={false} whileDrag={{ scale: 1.1 }} onClick={() => triggerBounce(setCoffeeTableBouncing)} animate={coffeeTableBouncing ? { scale: [1, 1.05, 0.95, 1.02, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] } : {}} className="cursor-grab active:cursor-grabbing" style={{ transformOrigin: "400px 520px" }}>
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
