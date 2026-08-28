import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

interface PWAInstallModalProps {
  isLoggedIn: boolean;
  activeScreen?: string;
  hat?: string;
  challengeStep?: string | number | null;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isLoggedIn,
  activeScreen = 'home',
  challengeStep,
}) => {
  // Never show on onboarding or excluded screens
  const isExcludedScreen =
    activeScreen === 'onboarding' ||
    activeScreen === 'challenge' ||
    activeScreen === 'trophy-rewards' ||
    activeScreen === 'rewards' ||
    activeScreen === 'plan-builder' ||
    (challengeStep !== null && challengeStep !== undefined) ||
    Boolean(typeof window !== 'undefined' && (window as any).__nexora_is_challenge_active);

  // Check if running in native standalone PWA mode
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return (window as any).deferredPrompt || null;
    }
    return null;
  });

  // Track how many times user clicked "X" close button in this session (Max 5 times)
  const [dismissCount, setDismissCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(sessionStorage.getItem('nexora_pwa_dismiss_count') || '0', 10);
  });

  const [landingDismissed, setLandingDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('nexora_pwa_landing_dismissed') === 'true';
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/icon-192.png');

  // Track section switches inside app so banner shows every 2 section changes
  const sectionSwitchesRef = useRef<number>(0);
  const prevScreenRef = useRef<string>(activeScreen);
  const prevLoggedInRef = useRef<boolean>(isLoggedIn);
  const initialShowTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor standalone display mode changes & listen for PWA install events
  useEffect(() => {
    const checkMode = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      if (standalone) {
        setIsStandalone(true);
        localStorage.setItem('nexora_pwa_installed', 'true');
      }
    };

    checkMode();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsStandalone(true);
        localStorage.setItem('nexora_pwa_installed', 'true');
        setIsOpen(false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleMediaChange);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      setIsStandalone(false);
      try {
        localStorage.setItem('nexora_pwa_installed', 'false');
        sessionStorage.setItem('nexora_pwa_installed', 'false');
      } catch (_) {}
    };

    const handleCustomPromptEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        (window as any).deferredPrompt = customEvent.detail;
        setDeferredPrompt(customEvent.detail);
        setIsStandalone(false);
        try {
          localStorage.setItem('nexora_pwa_installed', 'false');
          sessionStorage.setItem('nexora_pwa_installed', 'false');
        } catch (_) {}
      }
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsOpen(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      try {
        localStorage.setItem('nexora_pwa_installed', 'true');
        sessionStorage.setItem('nexora_pwa_installed', 'true');
      } catch (_) {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-deferred-prompt', handleCustomPromptEvent);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-deferred-prompt', handleCustomPromptEvent);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleMediaChange);
      }
    };
  }, []);

  // 1. Initial trigger on landing page (logged out) - shows ONLY ONCE
  useEffect(() => {
    if (isStandalone || landingDismissed || dismissCount >= 5 || isExcludedScreen) return;

    if (!isLoggedIn) {
      initialShowTimerRef.current = setTimeout(() => {
        if (!isStandalone && !landingDismissed && dismissCount < 5 && !isExcludedScreen) {
          setIsOpen(true);
        }
      }, 2000);
    }

    return () => {
      if (initialShowTimerRef.current) clearTimeout(initialShowTimerRef.current);
    };
  }, [isLoggedIn, isStandalone, landingDismissed, dismissCount, isExcludedScreen]);

  // 2. Section switch handler inside app (logged in): triggers every 2 section changes
  useEffect(() => {
    if (isExcludedScreen) {
      if (isOpen) setIsOpen(false);
      return;
    }

    if (!isLoggedIn || isStandalone || dismissCount >= 5) return;

    if (activeScreen !== prevScreenRef.current) {
      prevScreenRef.current = activeScreen;
      sectionSwitchesRef.current += 1;

      if (sectionSwitchesRef.current % 2 === 0 && !isOpen && dismissCount < 5) {
        const timer = setTimeout(() => {
          if (!isStandalone && dismissCount < 5 && !isOpen && !isExcludedScreen) {
            setIsOpen(true);
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [activeScreen, isLoggedIn, isStandalone, dismissCount, isOpen, isExcludedScreen]);

  const handleDismiss = () => {
    if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
    setIsOpen(false);
    setShowManualGuide(false);

    if (!isLoggedIn) {
      setLandingDismissed(true);
      sessionStorage.setItem('nexora_pwa_landing_dismissed', 'true');
    }

    const nextCount = dismissCount + 1;
    setDismissCount(nextCount);
    sessionStorage.setItem('nexora_pwa_dismiss_count', nextCount.toString());
    sessionStorage.setItem('nexora_install_prompt_dismissed', 'true');

    if (nextCount >= 5) {
      sessionStorage.setItem('nexora_pwa_final_dismissed', 'true');
    }
  };

  const handleInstallClick = async () => {
    if (navigator.vibrate) {
      try { navigator.vibrate([15, 30, 15]); } catch (_) {}
    }

    const currentPrompt = deferredPrompt || (window as any).deferredPrompt;

    if (currentPrompt) {
      try {
        await currentPrompt.prompt();
        const choiceResult = await currentPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsStandalone(true);
          setIsOpen(false);
          try {
            localStorage.setItem('nexora_pwa_installed', 'true');
            sessionStorage.setItem('nexora_pwa_installed', 'true');
          } catch (_) {}
        } else {
          handleDismiss();
        }
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      } catch (err) {
        console.error('Error triggering PWA installation:', err);
        // Show manual fallback guide if native prompt fails
        setShowManualGuide(true);
      }
    } else {
      // If native deferred prompt is not currently available or browser uses manual menu install
      setShowManualGuide((prev) => !prev);
    }
  };

  if (isStandalone || !isOpen || dismissCount >= 5 || isExcludedScreen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-2 sm:top-4 left-0 right-0 z-[9999] flex justify-center px-3 sm:px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="pointer-events-auto w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 text-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 overflow-hidden relative"
          >
            {/* Subtle top glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

            <div className="flex items-center justify-between gap-2.5 sm:gap-3">
              {/* Left Side: App Logo ONLY */}
              <div className="relative shrink-0">
                <img
                  src={logoSrc}
                  alt="Nexora App Logo"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-cyan-400/40 shadow-md shadow-cyan-500/20"
                  onError={() => {
                    if (logoSrc !== '/nexora_mascot_logo.png') {
                      setLogoSrc('/nexora_mascot_logo.png');
                    }
                  }}
                />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              </div>

              {/* Middle Section: Clean Title & Message */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">
                    Install Nexora
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/30 text-[9px] font-black text-cyan-300 uppercase tracking-wider shrink-0">
                    <Sparkles size={10} className="mr-0.5" /> ({dismissCount + 1}/5)
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 truncate font-medium mt-0.5">
                  Fast access & home screen app!
                </p>
              </div>

              {/* Right Side: Install Button + Close X */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wide shadow-md shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download size={13} className="shrink-0" />
                  <span>Install</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors border border-slate-700/50 shrink-0 cursor-pointer"
                  aria-label="Not Now"
                  title="Not Now"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Manual iOS Fallback Guide (Only if browser truly lacks native PWA install support) */}
            {showManualGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 pt-2.5 border-t border-slate-800 text-left"
              >
                <div className="bg-slate-800/70 border border-cyan-500/30 rounded-xl p-3 space-y-2">
                  <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Share size={12} /> Add to Home Screen:
                  </p>
                  <ol className="text-[11px] text-slate-300 space-y-1.5 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[9px] shrink-0">1</span>
                      Tap <Share size={12} className="inline text-blue-400 mx-0.5" /> <strong>Share</strong> in your browser menu.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[9px] shrink-0">2</span>
                      Tap <PlusSquare size={12} className="inline text-cyan-400 mx-0.5" /> <strong>Add to Home Screen</strong>.
                    </li>
                  </ol>
                  <button
                    onClick={handleDismiss}
                    className="w-full mt-1 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    Got It
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
