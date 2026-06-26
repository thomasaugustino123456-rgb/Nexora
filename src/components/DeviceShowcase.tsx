import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, Tablet, Laptop, Upload, Download, RotateCw, 
  Settings, Image as ImageIcon, Sparkles, Sliders, Eye,
  Palette, RefreshCw, Layers, Monitor, Trash2, ArrowLeft,
  Flame, Star, Coins, ArrowRight, HelpCircle, Check, Info, CheckCircle2
} from "lucide-react";
import { showToast } from "../lib/toast";
import { toPng } from "html-to-image";

interface DeviceShowcaseProps {
  onBack: () => void;
  userStats?: {
    streak: number;
    xp: number;
    coins: number;
  };
}

type DeviceType = "phone" | "tablet" | "laptop";
type Orientation = "portrait" | "landscape";
type ColorTheme = "silver" | "spacegray" | "obsidian" | "midnight" | "sunset";
type BackdropType = "studio" | "midnight" | "desk" | "pastel" | "transparent";

interface AppScreen {
  id: string;
  name: string;
  category: "nexora" | "challenges" | "user";
  icon: React.ReactNode;
  imageUrl?: string; // If pre-loaded image is used
  renderContent?: (stats: any, orientation: Orientation) => React.ReactNode;
}

export function DeviceShowcase({ onBack, userStats }: DeviceShowcaseProps) {
  const [device, setDevice] = useState<DeviceType>("phone");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [deviceColor, setDeviceColor] = useState<ColorTheme>("spacegray");
  const [backdrop, setBackdrop] = useState<BackdropType>("studio");
  
  // Custom uploaded image
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  
  // Controls
  const [tiltX, setTiltX] = useState<number>(0);
  const [tiltY, setTiltY] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [reflection, setReflection] = useState<number>(15); // Percentage
  const [shadowDepth, setShadowDepth] = useState<number>(40); // Percentage
  
  const [selectedScreenId, setSelectedScreenId] = useState<string>("home");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showcaseAreaRef = useRef<HTMLDivElement>(null);

  // Default stats falls back if not passed
  const stats = userStats || {
    streak: 2,
    xp: 576,
    coins: 260
  };

  // Adjust default orientation based on device
  useEffect(() => {
    if (device === "laptop") {
      setOrientation("landscape");
    } else if (device === "tablet") {
      setOrientation("portrait");
    }
  }, [device]);

  // Handle local image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
        setUploadedFileName(file.name);
        setSelectedScreenId("uploaded");
        showToast("Screen image imported successfully!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          setUploadedFileName(file.name);
          setSelectedScreenId("uploaded");
          showToast("Dropped screen image imported!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedFileName("");
    if (selectedScreenId === "uploaded") {
      setSelectedScreenId("home");
    }
    showToast("Uploaded screen cleared", "info");
  };

  // Export Mockup Canvas as Image
  const handleExport = async () => {
    if (!showcaseAreaRef.current) return;
    setIsExporting(true);
    showToast("Preparing presentation canvas... 📸", "info");

    try {
      // Small timeout to allow state to settle
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      const dataUrl = await toPng(showcaseAreaRef.current, {
        quality: 0.95,
        pixelRatio: 2, // Retinal high resolution
        backgroundColor: backdrop === "transparent" ? null : undefined,
      });

      const link = document.createElement("a");
      link.download = `nexora_mockup_${device}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      showToast("Mockup presentation exported successfully!", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Export failed. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // High fidelity vector screens mockups
  const APP_SCREENS: AppScreen[] = [
    {
      id: "home",
      name: "Dashboard Home",
      category: "nexora",
      icon: <Sparkles className="w-4 h-4" />,
      renderContent: (currentStats, currentOrientation) => (
        <div className="w-full h-full bg-[#FAF9F5] text-slate-800 flex flex-col font-sans select-none overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-md shadow-indigo-100 flex items-center justify-center text-white text-lg font-bold">
                N
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 leading-tight">Nexora</h3>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono">Flow Catalyst</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <Settings className="w-4 h-4" />
              </div>
              <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 flex items-center gap-1 text-[11px] font-extrabold text-amber-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> PRO
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white p-3 rounded-2xl border border-slate-100/80 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center mb-1">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Streak</span>
                <span className="text-base font-extrabold text-slate-800">{currentStats.streak}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-100/80 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">XP</span>
                <span className="text-base font-extrabold text-slate-800">{currentStats.xp}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-100/80 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mb-1">
                  <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coins</span>
                <span className="text-base font-extrabold text-slate-800">{currentStats.coins}</span>
              </div>
            </div>

            {/* Daily Protocol Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-md shadow-slate-100/50 space-y-4 relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-teal-50/50 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 tracking-wide uppercase">Daily Protocol</h4>
                  <p className="text-[10px] text-slate-400 font-bold font-mono">RESETS IN: 9H 22M 55S</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-1">
                <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-xs font-extrabold text-slate-700 block">0 / 3 Challenges Done</span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Daily Limit</span>
                </div>
                
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-teal-400 rounded-full" />
                </div>
              </div>

              <button className="w-full py-3.5 px-4 bg-teal-400 hover:bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-100 flex items-center justify-center gap-2 transition-transform active:scale-95">
                ⚡ Start Initial Challenge
              </button>

              <div className="border-t border-slate-50 pt-3 text-center">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Tap any category to run direct challenge</p>
              </div>
            </div>

            {/* Interactive Category Icons */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { emoji: "💪", bg: "bg-orange-50 border-orange-100 text-orange-600" },
                { emoji: "💧", bg: "bg-sky-50 border-sky-100 text-sky-600" },
                { emoji: "🧘", bg: "bg-purple-50 border-purple-100 text-purple-600" },
                { emoji: "🎨", bg: "bg-pink-50 border-pink-100 text-pink-600" },
                { emoji: "⚽", bg: "bg-slate-50 border-slate-100 text-slate-600" }
              ].map((cat, idx) => (
                <div key={idx} className={`aspect-square rounded-2xl border ${cat.bg} flex items-center justify-center text-lg shadow-sm font-semibold cursor-pointer`}>
                  {cat.emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "pushups",
      name: "Push-ups Challenge",
      category: "challenges",
      icon: <Smartphone className="w-4 h-4" />,
      renderContent: (currentStats, currentOrientation) => (
        <div className="w-full h-full bg-white text-slate-800 flex flex-col font-sans select-none overflow-y-auto">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-50">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-bold">
              &lt;
            </div>
            <span className="text-xs font-bold text-slate-500">Challenge 1/2</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              💾
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            {/* Mascot Illustration */}
            <div className="relative w-full max-w-[240px] aspect-[4/3] bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,246,255,1)_0%,rgba(255,255,255,0)_70%)]" />
              {/* Custom SVG Drawing of Sleeping/Resting Bunny */}
              <svg viewBox="0 0 100 60" className="w-36 h-auto drop-shadow-md">
                <rect x="5" y="45" width="90" height="2" fill="#E2E8F0" rx="1" />
                {/* Halo */}
                <ellipse cx="60" cy="22" rx="10" ry="3" fill="none" stroke="#93C5FD" strokeWidth="2" strokeDasharray="3 1" className="animate-spin" />
                {/* Body (Blue horizontal splat) */}
                <rect x="25" y="32" width="45" height="15" fill="#3B82F6" rx="7" />
                {/* Arm */}
                <rect x="52" y="38" width="12" height="6" fill="#1D4ED8" rx="3" />
                {/* Head (Flipped right) */}
                <circle cx="65" cy="35" r="10" fill="#3B82F6" />
                <circle cx="65" cy="35" r="8" fill="#60A5FA" />
                {/* Ears */}
                <path d="M 60,25 Q 56,15 62,18 Z" fill="#3B82F6" />
                <path d="M 66,25 Q 70,14 67,18 Z" fill="#3B82F6" />
                <path d="M 61,24 Q 58,17 62,19 Z" fill="#93C5FD" />
                <path d="M 65,24 Q 68,16 66,19 Z" fill="#93C5FD" />
                {/* Closed Eyes */}
                <path d="M 61,35 Q 63,37 65,35" fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 67,35 Q 69,37 71,35" fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" />
                {/* Nose */}
                <polygon points="65,37 67,37 66,38" fill="#1E3A8A" />
                {/* Zzz letter */}
                <text x="76" y="22" fontSize="6" fontWeight="bold" fill="#3B82F6" className="animate-bounce">Z</text>
                <text x="82" y="16" fontSize="4" fontWeight="bold" fill="#60A5FA" className="animate-pulse">z</text>
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Push-ups Challenge</h1>
              <p className="text-sm text-slate-500 font-semibold">Complete 80 push-ups</p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <button className="w-full py-4 bg-[#56C596] hover:bg-[#48b586] text-white rounded-3xl font-bold text-sm shadow-lg shadow-emerald-50 flex items-center justify-center gap-2 tracking-wide active:scale-95 transition-transform">
                I'm Done! 💪
              </button>
              <button className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-3xl font-bold text-sm tracking-wide active:scale-95 transition-transform border border-rose-100">
                Skip Challenge
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "water",
      name: "Drink Water",
      category: "challenges",
      icon: <Smartphone className="w-4 h-4" />,
      renderContent: (currentStats, currentOrientation) => (
        <div className="w-full h-full bg-white text-slate-800 flex flex-col font-sans select-none overflow-y-auto">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-50">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-bold">
              &lt;
            </div>
            <span className="text-xs font-bold text-slate-500">Challenge 2/2</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              💾
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            {/* Mascot Illustration */}
            <div className="relative w-full max-w-[240px] aspect-[4/3] bg-gradient-to-b from-sky-50/30 to-sky-100/30 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(224,242,254,0.6)_0%,rgba(255,255,255,0)_70%)]" />
              {/* Cute Water Beaker Mascot */}
              <svg viewBox="0 0 100 100" className="w-36 h-auto drop-shadow-md">
                {/* Water Liquid Fill */}
                <ellipse cx="50" cy="65" rx="26" ry="14" fill="#38BDF8" opacity="0.8" />
                <path d="M 23,60 Q 35,58 50,60 Q 65,62 77,60 L 74,75 Q 50,85 26,75 Z" fill="#0EA5E9" opacity="0.9" />
                
                {/* Beaker Glass Body */}
                <path d="M 40,30 L 40,35 Q 20,40 20,65 Q 20,85 50,85 Q 80,85 80,65 Q 80,40 60,35 L 60,30 Z" fill="none" stroke="#0EA5E9" strokeWidth="4" strokeLinejoin="round" />
                {/* Cap */}
                <rect x="42" y="24" width="16" height="7" fill="#0EA5E9" rx="3" />
                {/* Ear handles */}
                <path d="M 24,43 Q 14,48 20,56" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
                <path d="M 76,43 Q 86,48 80,56" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
                
                {/* Mascot Face */}
                <circle cx="43" cy="62" r="3" fill="#1E293B" />
                <circle cx="57" cy="62" r="3" fill="#1E293B" />
                {/* Cute smile */}
                <path d="M 48,65 Q 50,67 52,65" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                {/* Blushes */}
                <ellipse cx="38" cy="64" rx="2" ry="1" fill="#F43F5E" opacity="0.5" />
                <ellipse cx="62" cy="64" rx="2" ry="1" fill="#F43F5E" opacity="0.5" />
                
                {/* Water bubble */}
                <circle cx="50" cy="46" r="3" fill="#38BDF8" className="animate-bounce" />
                <circle cx="34" cy="54" r="1.5" fill="#E0F2FE" />
                <circle cx="64" cy="52" r="2" fill="#E0F2FE" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Drink Water</h1>
              <p className="text-sm text-slate-500 font-semibold">2 / 4.5 glasses</p>
              
              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden mx-auto">
                <div className="w-[44%] h-full bg-[#38BDF8] rounded-full" />
              </div>
            </div>

            <div className="w-full pt-4">
              <button className="w-full py-4 bg-[#56C596] hover:bg-[#48b586] text-white rounded-3xl font-bold text-sm shadow-lg shadow-emerald-50 flex items-center justify-center gap-2 tracking-wide active:scale-95 transition-transform">
                Drink +1 Water 💧
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const BACKDROPS = [
    { id: "studio", name: "Studio", class: "bg-gradient-to-tr from-[#FAF9F6] to-[#F1EFE9]", shadow: "shadow-2xl shadow-stone-400/50" },
    { id: "midnight", name: "Cosmic Glow", class: "bg-slate-950 bg-[radial-gradient(ellipse_at_top,rgba(30,41,59,0.9),rgba(3,7,18,1))]", shadow: "shadow-2xl shadow-indigo-950/80" },
    { id: "desk", name: "Oak Desk", class: "bg-amber-100 bg-[linear-gradient(rgba(217,119,6,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(217,119,6,0.04)_1px,transparent_1px)] bg-[size:24px_24px]", shadow: "shadow-2xl shadow-amber-900/40" },
    { id: "pastel", name: "Aurora Skies", class: "bg-gradient-to-tr from-rose-100 via-sky-100 to-indigo-100", shadow: "shadow-2xl shadow-indigo-200/50" },
    { id: "transparent", name: "Alpha Transparent", class: "bg-[size:16px_16px] bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-slate-100", shadow: "shadow-2xl shadow-slate-400/40" }
  ];

  const MATERIAL_THEMES = [
    { id: "silver", name: "Silver Metal", bezel: "bg-slate-200 border-slate-300", accent: "#E2E8F0" },
    { id: "spacegray", name: "Space Gray", bezel: "bg-slate-700 border-slate-800", accent: "#475569" },
    { id: "obsidian", name: "Obsidian Black", bezel: "bg-slate-900 border-slate-950", accent: "#0F172A" },
    { id: "midnight", name: "Midnight Teal", bezel: "bg-[#1E2E38] border-[#132027]", accent: "#134E5E" },
    { id: "sunset", name: "Sunset Gold", bezel: "bg-amber-50 border-amber-200", accent: "#FCD34D" }
  ];

  const currentTheme = MATERIAL_THEMES.find(t => t.id === deviceColor) || MATERIAL_THEMES[1];

  // Render mock screen content inside devices
  const renderScreen = () => {
    if (selectedScreenId === "uploaded" && uploadedImage) {
      return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
          <img 
            src={uploadedImage} 
            alt="Uploaded Screen mockup" 
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    const currentScreen = APP_SCREENS.find(s => s.id === selectedScreenId);
    if (currentScreen?.renderContent) {
      return currentScreen.renderContent(stats, orientation);
    }

    return (
      <div className="w-full h-full bg-[#FAF9F5] flex flex-col items-center justify-center text-slate-400 p-6 text-center select-none font-sans">
        <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
        <p className="text-xs font-semibold">Select or upload a screen to display</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 pb-16" id="device-showcase-screen">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-4 sticky top-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900">Nexora Mockup Studio</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[10px] font-extrabold uppercase">Beta</span>
            </div>
            <p className="text-xs text-slate-500">Design, customize, and export screenshots inside high-fidelity device frames</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all duration-300 transform active:scale-95 ${isExporting ? "animate-pulse" : ""}`}
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export Showcase"}
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left column: Showcase Sandbox */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Quick Preset Ribbons */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono mr-1">Device:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {[
                  { id: "phone", label: "Phone", icon: <Smartphone className="w-4 h-4" /> },
                  { id: "tablet", label: "Tablet", icon: <Tablet className="w-4 h-4" /> },
                  { id: "laptop", label: "Laptop", icon: <Laptop className="w-4 h-4" /> }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDevice(d.id as DeviceType);
                      showToast(`Switched to ${d.label} view`, "info");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${device === d.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {d.icon}
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {device !== "laptop" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono mr-1">Layout:</span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setOrientation("portrait")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orientation === "portrait" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation("landscape")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orientation === "landscape" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Landscape
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Rendering Canvas Frame */}
          <div 
            ref={showcaseAreaRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex-1 min-h-[460px] md:min-h-[580px] rounded-[2rem] relative flex items-center justify-center overflow-hidden transition-all duration-300 border border-slate-200/50 ${BACKDROPS.find(b => b.id === backdrop)?.class}`}
          >
            {/* Soft decorative shadow grid overlay */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/5 pointer-events-none" />

            {/* Simulated environment decorations */}
            {backdrop === "desk" && (
              <>
                <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-emerald-950/10 blur-xl pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-36 h-36 rounded-full bg-orange-950/10 blur-2xl pointer-events-none" />
              </>
            )}

            {/* MAIN DEVICE RENDERER CONTAINER */}
            <motion.div
              style={{
                perspective: "1200px",
                transformStyle: "preserve-3d"
              }}
              animate={{
                rotateX: tiltY,
                rotateY: tiltX,
                scale: scale
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative p-12 flex items-center justify-center"
            >
              <div className={`transition-all duration-500 ${BACKDROPS.find(b => b.id === backdrop)?.shadow} rounded-[2.5rem]`}>
                
                {/* 1. SMARTPHONE FRAME */}
                {device === "phone" && (
                  <div 
                    className={`p-[11px] rounded-[2.8rem] border-[4px] relative transition-colors duration-500 ${currentTheme.bezel}`}
                    style={{
                      width: orientation === "portrait" ? "280px" : "540px",
                      height: orientation === "portrait" ? "560px" : "280px"
                    }}
                  >
                    {/* Speaker/Notch grill */}
                    {orientation === "portrait" ? (
                      <div className="absolute top-3.5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        <div className="w-12 h-1 bg-slate-800 rounded-full" />
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                      </div>
                    ) : (
                      <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-28 bg-black rounded-full z-30 flex flex-col items-center justify-between py-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        <div className="w-1 h-12 bg-slate-800 rounded-full" />
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                      </div>
                    )}

                    {/* Left/Right Action Buttons */}
                    <div className="absolute left-[-6px] top-20 w-1.5 h-10 bg-slate-800 rounded-r-sm" />
                    <div className="absolute left-[-6px] top-32 w-1.5 h-14 bg-slate-800 rounded-r-sm" />
                    <div className="absolute right-[-6px] top-24 w-1.5 h-12 bg-slate-800 rounded-l-sm" />

                    {/* Phone Screen Glass Wrapper */}
                    <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative border border-slate-950/10 bg-white">
                      {renderScreen()}

                      {/* Glossy reflection glare overlay */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-white/[0.12] pointer-events-none z-20 transition-opacity"
                        style={{ opacity: reflection / 100 }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. TABLET FRAME */}
                {device === "tablet" && (
                  <div 
                    className={`p-[16px] rounded-[2.2rem] border-[5px] relative transition-colors duration-500 ${currentTheme.bezel}`}
                    style={{
                      width: orientation === "portrait" ? "420px" : "580px",
                      height: orientation === "portrait" ? "560px" : "420px"
                    }}
                  >
                    {/* Tablet Camera dot */}
                    <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-black z-30" />

                    {/* Tablet Screen Glass Wrapper */}
                    <div className="w-full h-full rounded-2xl overflow-hidden relative border border-slate-950/10 bg-white">
                      {renderScreen()}

                      {/* Glossy reflection glare overlay */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-white/[0.12] pointer-events-none z-20 transition-opacity"
                        style={{ opacity: reflection / 100 }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. LAPTOP FRAME */}
                {device === "laptop" && (
                  <div className="flex flex-col items-center">
                    {/* Laptop Screen Bezel */}
                    <div 
                      className={`p-3 rounded-t-2xl border-t-[4px] border-x-[4px] relative transition-colors duration-500 ${currentTheme.bezel}`}
                      style={{
                        width: "600px",
                        height: "360px"
                      }}
                    >
                      {/* Web Camera */}
                      <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black z-30" />

                      {/* Laptop Screen Screen Glass Wrapper */}
                      <div className="w-full h-full rounded-md overflow-hidden relative border border-slate-950/15 bg-white">
                        {renderScreen()}

                        {/* Glossy reflection glare overlay */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-white/[0.12] pointer-events-none z-20 transition-opacity"
                          style={{ opacity: reflection / 100 }}
                        />
                      </div>
                    </div>

                    {/* Laptop Bottom Base Hinge & Chassis */}
                    <div className="w-[680px] h-[12px] bg-slate-300 rounded-b-md relative shadow-md z-10">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-slate-400 rounded-b-md" />
                      
                      {/* Keyboard deck indentation line */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-slate-400/50 rounded-full" />
                    </div>
                    {/* Laptop Desk Foot support shadow */}
                    <div className="w-[620px] h-[6px] bg-black/10 rounded-full blur-sm mt-0.5" />
                  </div>
                )}

              </div>
            </motion.div>

            {/* Instruction watermarks/labels */}
            {selectedScreenId === "uploaded" && (
              <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] text-white flex items-center gap-1 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custom Image Framed</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Mockup Settings Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Section A: Screen Image Library */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">App Screen Content</h2>
            </div>
            
            <p className="text-xs text-slate-500">Choose a native Nexora screen mock or upload your own snapshot image below</p>

            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
              {APP_SCREENS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedScreenId(s.id);
                    showToast(`Active screen: ${s.name}`, "info");
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${selectedScreenId === s.id ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 font-extrabold" : "border-slate-100 hover:bg-slate-50 text-slate-600 font-bold"}`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    {s.icon}
                    <span>{s.name}</span>
                  </div>
                  {selectedScreenId === s.id && <Check className="w-4 h-4 text-indigo-500" />}
                </button>
              ))}

              {uploadedImage && (
                <button
                  onClick={() => setSelectedScreenId("uploaded")}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${selectedScreenId === "uploaded" ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 font-extrabold" : "border-slate-100 hover:bg-slate-50 text-slate-600 font-bold"}`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="truncate max-w-[140px]">{uploadedFileName || "Uploaded Custom Image"}</span>
                  </div>
                  {selectedScreenId === "uploaded" && <Check className="w-4 h-4 text-indigo-500" />}
                </button>
              )}
            </div>

            {/* Custom File Upload Block */}
            <div 
              onClick={triggerFileInput}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50/80 p-4 rounded-xl text-center cursor-pointer transition-colors space-y-1"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-black text-slate-600 uppercase tracking-wide">Import Screenshot</p>
              <p className="text-[10px] text-slate-400">Drag and drop or click to upload</p>
            </div>

            {uploadedImage && (
              <button 
                onClick={removeUploadedImage}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear Imported Image
              </button>
            )}
          </div>

          {/* Section B: Mockup Frame Finish & Environments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Hardware & Studio Settings</h2>
            </div>

            {/* Hardware Finish selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Device Hardware Color</label>
              <div className="grid grid-cols-5 gap-2">
                {MATERIAL_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setDeviceColor(theme.id as ColorTheme);
                      showToast(`Material: ${theme.name}`, "info");
                    }}
                    className={`aspect-square rounded-full flex items-center justify-center transition-transform active:scale-95 border-2 ${deviceColor === theme.id ? "border-indigo-600 shadow-md scale-105" : "border-slate-200"}`}
                    style={{ backgroundColor: theme.accent }}
                    title={theme.name}
                  >
                    {deviceColor === theme.id && <span className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Studio Environment Background selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Backdrop Ambient Environment</label>
              <div className="grid grid-cols-2 gap-2">
                {BACKDROPS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBackdrop(b.id as BackdropType);
                      showToast(`Environment: ${b.name}`, "info");
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left border flex flex-col justify-between gap-1.5 transition-all ${backdrop === b.id ? "border-indigo-500 bg-indigo-50/50 text-indigo-700" : "border-slate-100 hover:bg-slate-50 text-slate-600"}`}
                  >
                    <span>{b.name}</span>
                    <div className={`w-full h-2 rounded-full ${b.class} border border-slate-200/40`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section C: Fine-Tuning Camera Tilt & Depth Sliders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Fine-Tuning Controls</h2>
            </div>

            {/* 3D Camera Tilt Controls */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-extrabold text-slate-700">
                  <span className="flex items-center gap-1">Rotate X (Horizontal)</span>
                  <span className="font-mono text-[10px] text-slate-400">{tiltX}°</span>
                </div>
                <input 
                  type="range" 
                  min="-30" 
                  max="30" 
                  value={tiltX}
                  onChange={(e) => setTiltX(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-ew-resize h-1 bg-slate-100 rounded-lg appearance-none" 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-extrabold text-slate-700">
                  <span className="flex items-center gap-1">Rotate Y (Vertical)</span>
                  <span className="font-mono text-[10px] text-slate-400">{tiltY}°</span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="20" 
                  value={tiltY}
                  onChange={(e) => setTiltY(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-ns-resize h-1 bg-slate-100 rounded-lg appearance-none" 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-extrabold text-slate-700">
                  <span>Zoom Scale</span>
                  <span className="font-mono text-[10px] text-slate-400">{Math.round(scale * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.6" 
                  max="1.3" 
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-zoom-in h-1 bg-slate-100 rounded-lg appearance-none" 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-extrabold text-slate-700">
                  <span>Gloss Glass Reflection</span>
                  <span className="font-mono text-[10px] text-slate-400">{reflection}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  value={reflection}
                  onChange={(e) => setReflection(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none" 
                />
              </div>
            </div>

            {/* Reset Sliders button */}
            <button
              onClick={() => {
                setTiltX(0);
                setTiltY(0);
                setScale(1);
                setReflection(15);
                showToast("Camera and tilt reset", "info");
              }}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Visual Sliders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
