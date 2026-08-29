import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Loader2, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export interface PWAInstallerCardProps {
  currentScreen: string;
  isTaskActive?: boolean;
  className?: string;
}

/**
 * Top-positioned native PWA installer card for Nexora.
 * - Displays on Landing page and Home section.
 * - Suppressed on Auth/Login/Signup, Onboarding, and during active Tasks.
 * - Reappears after every 3 section switches up to 4 times per cycle.
 * - Direct install / package download without manual instructions.
 */
export function PWAInstallerCard({
  currentScreen,
  isTaskActive = false,
  className = '',
}: PWAInstallerCardProps) {
  const { isVisible, isPrompting, isInstalled, triggerInstall, dismiss } = usePWAInstall(
    currentScreen,
    isTaskActive
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (!isVisible || isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstalling || isPrompting) return;
    setIsInstalling(true);

    try {
      const success = await triggerInstall();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => {
          dismiss();
        }, 1200);
      }
    } catch (err) {
      console.warn('[Nexora PWA Card] Install error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && !isInstalled && (
        <motion.div
          id="nexora-pwa-installer-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`w-full max-w-md mx-auto px-4 pt-3 pb-2 select-none ${className}`}
        >
          <div className="relative overflow-hidden bg-[#0D1B4C]/95 backdrop-blur-md border border-[#2A4387] rounded-2xl shadow-xl p-3.5 flex items-center justify-between gap-3 text-white">
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
                    (e.currentTarget as HTMLImageElement).src = '/nexora_mascot_new.png';
                  }}
                />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black tracking-wide text-white truncate">
                  Install Nexora
                </span>
                <span className="text-[11px] font-medium text-slate-300 truncate">
                  Install Nexora on your device for faster access.
                </span>
              </div>
            </div>

            {/* Actions: Install Button + Dismiss Icon */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                id="pwa-install-action-btn"
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling || isPrompting || justInstalled}
                aria-label="Install Nexora Web App"
                className={`px-3.5 py-1.5 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-75 cursor-pointer ${
                  justInstalled
                    ? 'bg-emerald-600'
                    : 'bg-gradient-to-r from-[#38B2AC] to-[#3182CE] hover:from-[#319795] hover:to-[#2B6CB0]'
                }`}
              >
                {isInstalling || isPrompting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : justInstalled ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>
                  {isInstalling || isPrompting
                    ? 'INSTALLING...'
                    : justInstalled
                    ? 'INSTALLED'
                    : 'INSTALL'}
                </span>
              </button>

              <button
                id="pwa-dismiss-action-btn"
                type="button"
                onClick={dismiss}
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
