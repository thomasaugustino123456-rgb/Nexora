import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles, Loader2 } from 'lucide-react';
import {
  usePWAInstallEngine,
  usePWAAppearanceManager,
  PWAAppearanceOptions,
} from '../hooks/usePWAInstall';

export interface PWAInstallerCardProps extends PWAAppearanceOptions {
  className?: string;
}

/**
 * Top-positioned, compact native PWA installer card for Nexora.
 * Strictly adheres to native prompt execution and appearance limits.
 */
export function PWAInstallerCard({
  currentScreen,
  isAuthScreen = false,
  isGatewayScreen = false,
  isOnboardingScreen = false,
  className = '',
}: PWAInstallerCardProps) {
  const engine = usePWAInstallEngine();
  const { isVisible, handleDismiss, handleInstallSuccess } = usePWAAppearanceManager(
    engine,
    {
      currentScreen,
      isAuthScreen,
      isGatewayScreen,
      isOnboardingScreen,
    }
  );

  const [isInstalling, setIsInstalling] = useState(false);

  if (!isVisible) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstalling || engine.isPrompting) return;
    setIsInstalling(true);

    try {
      const outcome = await engine.triggerInstall();
      if (outcome === 'accepted') {
        handleInstallSuccess();
      }
    } catch (err) {
      console.warn('[Nexora PWA Card] Native install prompt error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="nexora-pwa-installer-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`w-full max-w-md mx-auto px-4 pt-3 pb-2 select-none ${className}`}
        >
          <div className="relative overflow-hidden bg-[#0D1B4C]/95 backdrop-blur-md border border-[#2A4387] rounded-2xl shadow-xl p-3 flex items-center justify-between gap-3 text-white">
            {/* Ambient subtle glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4FD1C5]/10 rounded-full blur-2xl pointer-events-none" />

            {/* App Icon & Details */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-[#142A68] border border-[#3B5998] flex items-center justify-center overflow-hidden shadow-inner">
                <img
                  src="/icon-192.png"
                  alt="Nexora Mascot"
                  className="w-9 h-9 object-contain drop-shadow"
                  onError={(e) => {
                    // Fallback to mascot image if icon not loaded
                    (e.currentTarget as HTMLImageElement).src = '/nexora_mascot_new.png';
                  }}
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wide text-white truncate">
                    Nexora
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-[#4FD1C5]/20 text-[#4FD1C5] rounded-full uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" /> Fast
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-300 truncate">
                  Install app for offline flow
                </span>
              </div>
            </div>

            {/* Actions: Install Button + Dismiss Icon */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                id="pwa-install-action-btn"
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling || engine.isPrompting}
                aria-label="Install Nexora Web App"
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#38B2AC] to-[#3182CE] hover:from-[#319795] hover:to-[#2B6CB0] active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isInstalling || engine.isPrompting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>INSTALL</span>
              </button>

              <button
                id="pwa-dismiss-action-btn"
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss installation prompt"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
