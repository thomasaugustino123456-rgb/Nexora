import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Home, Sparkles, Lightbulb, MousePointer2, Move, RefreshCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { vibrate } from '../lib/vibrate';

export function HouseScreen({ onBack }: { onBack: () => void }) {
  const [lightOn, setLightOn] = useState(true);
  const [plantShaking, setPlantShaking] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [zoom, setZoom] = useState(1);

  const toggleLight = () => {
    vibrate(10);
    setLightOn(!lightOn);
  };

  const shakePlant = () => {
    vibrate(5);
    setPlantShaking(true);
    setTimeout(() => setPlantShaking(false), 900);
  };

  const resetRoom = () => {
    vibrate(20);
    setResetKey(prev => prev + 1);
    setZoom(1);
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
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Interactive 3D Room</p>
        </div>
        <div className="w-12" />
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
        <motion.div 
          className="w-full max-w-4xl aspect-[4/3] relative"
          animate={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
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
              {/* Outer Frame */}
              <polygon points="480,210 600,270 600,150 480,90" fill="#E0E0E0" />
              {/* Inner Frame */}
              <polygon points="490,205 590,255 590,160 490,110" fill="#2A3B45" />
              {/* Glass */}
              <polygon points="495,202 585,247 585,165 495,120" fill="#112233" />
              {/* Stars */}
              <circle cx="520" cy="150" r="1.5" fill="#FFFFFF" opacity="0.8"/>
              <circle cx="560" cy="210" r="2" fill="#FFFFFF" opacity="0.6"/>
              <circle cx="540" cy="180" r="1" fill="#FFFFFF" opacity="0.9"/>
              {/* Panes */}
              <line x1="540" y1="142" x2="540" y2="225" stroke="#E0E0E0" strokeWidth="2" opacity="0.3" />
              <line x1="495" y1="170" x2="585" y2="215" stroke="#E0E0E0" strokeWidth="2" opacity="0.3" />
            </g>

            {/* Picture Frame (Movable & Fixed Perspective) */}
            <motion.g 
              id="picture" 
              drag 
              dragMomentum={false}
              whileDrag={{ scale: 1.1, zIndex: 50 }}
              className="cursor-grab active:cursor-grabbing"
            >
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
            
            {/* Table Group */}
            <motion.g 
              id="table" 
              drag 
              dragMomentum={false}
              whileDrag={{ scale: 1.05, filter: "brightness(1.2)" }}
              className="cursor-grab active:cursor-grabbing"
            >
              {/* Legs */}
              <polygon points="310,425 320,430 320,490 310,485" fill="#4E342E" />
              <polygon points="320,430 325,427 325,487 320,490" fill="#3E2723" />
              <polygon points="480,420 490,425 490,485 480,480" fill="#4E342E" />
              <polygon points="490,425 495,422 495,482 490,485" fill="#3E2723" />
              <polygon points="395,475 405,480 405,540 395,535" fill="#4E342E" />
              <polygon points="405,480 410,477 410,537 405,540" fill="#3E2723" />
              {/* Top */}
              <polygon points="400,370 300,420 400,470 500,420" fill="#8D6E63" />
              <polygon points="300,420 400,470 400,480 300,430" fill="#6D4C41" />
              <polygon points="400,470 500,420 500,430 400,480" fill="#5D4037" />
            </motion.g>

            {/* Laptop (Separate) */}
            <motion.g 
              id="laptop" 
              drag 
              dragMomentum={false}
              whileDrag={{ scale: 1.1, filter: "brightness(1.3)" }}
              className="cursor-grab active:cursor-grabbing"
            >
              <polygon points="380,410 350,425 380,440 410,425" fill="#BDBDBD" />
              <polygon points="350,425 380,410 380,385 350,400" fill="#9E9E9E" />
              <polygon points="353,421 377,409 377,388 353,403" fill={lightOn ? "#E3F2FD" : "#1a2a3a"} className="transition-colors duration-500" />
            </motion.g>

            {/* Chair Group */}
            <motion.g 
              id="chair" 
              drag 
              dragMomentum={false}
              whileDrag={{ scale: 1.05, filter: "brightness(1.2)" }}
              className="cursor-grab active:cursor-grabbing"
            >
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

            {/* Plant Group */}
            <motion.g 
              id="plant-group" 
              drag 
              dragMomentum={false}
              whileDrag={{ scale: 1.05, filter: "brightness(1.2)" }}
              className="cursor-grab active:cursor-grabbing"
              onClick={shakePlant}
            >
              {/* Pot (Static) */}
              <g id="pot">
                <polygon points="350,315 330,325 350,335 370,325" fill="#5D4037" />
                <polygon points="330,325 350,335 345,365 335,355" fill="#4E342E" />
                <polygon points="350,335 370,325 365,355 345,365" fill="#3E2723" />
              </g>
              {/* Leaves (Animated) */}
              <motion.g 
                id="leaves"
                animate={plantShaking ? {
                  rotate: [0, -4, 12, -8, 4, -2, 0],
                  scaleY: [1, 0.9, 1.12, 0.95, 1.02, 0.99, 1],
                  scaleX: [1, 1.08, 0.9, 1.04, 0.98, 1.01, 1]
                } : {}}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                style={{ transformOrigin: "350px 335px" }}
              >
                <polygon points="350,325 315,260 335,295" fill="#4CAF50" />
                <polygon points="350,325 350,240 365,285" fill="#2E7D32" />
                <polygon points="350,325 385,270 375,305" fill="#388E3C" />
                <polygon points="350,325 305,290 330,315" fill="#81C784" />
                <polygon points="350,325 385,305 365,320" fill="#A5D6A7" />
              </motion.g>
            </motion.g>

            {/* Lamp Group */}
            <g id="lamp-container">
              {/* Wire (Static) */}
              <line x1="400" y1="-10" x2="400" y2="160" stroke="#111" strokeWidth="3" />
              
              <motion.g 
                id="lamp" 
                onClick={toggleLight}
                className="cursor-pointer"
                animate={{ rotate: lightOn ? 0 : [0, 2, -2, 1, -1, 0] }}
                transition={{ duration: 0.5 }}
                style={{ transformOrigin: "400px 160px" }}
              >
                {/* Lampshade Top */}
                <polygon points="390,160 410,160 415,165 385,165" fill="#424242" />
                {/* Lampshade Body */}
                <polygon points="385,165 415,165 440,210 360,210" fill="#212121" />
                {/* Inside of Lampshade */}
                <polygon points="400,200 440,210 400,220 360,210" fill={lightOn ? "#FBC02D" : "#333"} className="transition-colors duration-500" />
                
                {/* Light Bulb Glow */}
                <AnimatePresence>
                  {lightOn && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <ellipse cx="400" cy="210" rx="10" ry="5" fill="#FFF59D" filter="url(#glow)" />
                      <ellipse cx="400" cy="210" rx="15" ry="8" fill="#FFF" opacity="0.8" />
                    </motion.g>
                  )}
                </AnimatePresence>
              </motion.g>
            </g>

            {/* Light Beam */}
            <AnimatePresence>
              {lightOn && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none"
                >
                  <polygon points="400,215 150,550 650,550" fill="url(#beamGrad)" style={{ mixBlendMode: 'overlay' }} />
                  <polygon points="400,215 250,500 550,500" fill="url(#beamGrad)" opacity="0.5" />
                </motion.g>
              )}
            </AnimatePresence>

          </svg>
        </motion.div>
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
