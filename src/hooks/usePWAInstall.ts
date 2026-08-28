import { useState, useEffect, useCallback, useRef } from 'react';

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isPrompting: boolean;
  triggerInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

declare global {
  interface Window {
    __nexora_deferred_prompt?: any;
  }
}

// Global helper to read early-captured prompt
const getGlobalPrompt = (): any => {
  if (typeof window === 'undefined') return null;
  return window.__nexora_deferred_prompt || null;
};

const promptListeners = new Set<(prompt: any) => void>();

if (typeof window !== 'undefined') {
  // Listen for the custom event dispatched by early capture in index.html
  window.addEventListener('nexora:pwa-prompt-ready', (e: any) => {
    const prompt = e?.detail || window.__nexora_deferred_prompt;
    promptListeners.forEach((listener) => listener(prompt));
  });

  window.addEventListener('nexora:pwa-installed', () => {
    window.__nexora_deferred_prompt = null;
    promptListeners.forEach((listener) => listener(null));
  });

  // Direct listeners in case the event fired after bundle load
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    window.__nexora_deferred_prompt = e;
    promptListeners.forEach((listener) => listener(e));
  });

  window.addEventListener('appinstalled', () => {
    window.__nexora_deferred_prompt = null;
    promptListeners.forEach((listener) => listener(null));
  });
}

/**
 * Installation Engine: Handles genuine browser PWA installation events and execution.
 * Completely independent from user data, authentication, and database logic.
 */
export function usePWAInstallEngine(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => getGlobalPrompt());
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    return isStandaloneMode || isIOSStandalone;
  });
  const [isPrompting, setIsPrompting] = useState<boolean>(false);

  // Monitor standalone display-mode changes & appinstalled event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches || (window.navigator as any).standalone === true);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      mediaQuery.addListener(handleDisplayModeChange);
    }

    const handlePromptUpdate = (prompt: any) => {
      setDeferredPrompt(prompt);
    };
    promptListeners.add(handlePromptUpdate);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        window.__nexora_deferred_prompt = null;
      }
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // If global prompt was already set before effect mounted
    const currentGlobal = getGlobalPrompt();
    if (currentGlobal && !deferredPrompt) {
      setDeferredPrompt(currentGlobal);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
      promptListeners.delete(handlePromptUpdate);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptToUse = deferredPrompt || getGlobalPrompt();

    if (!promptToUse || typeof promptToUse.prompt !== 'function') {
      return 'unavailable';
    }

    try {
      setIsPrompting(true);
      await promptToUse.prompt();
      const choiceResult = await promptToUse.userChoice;

      if (choiceResult && choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__nexora_deferred_prompt = null;
        }
        setIsInstalled(true);
        return 'accepted';
      } else {
        return 'dismissed';
      }
    } catch (err) {
      console.warn('[Nexora PWA Engine] Error invoking native prompt:', err);
      return 'unavailable';
    } finally {
      setIsPrompting(false);
    }
  }, [deferredPrompt]);

  return {
    isInstallable: Boolean((deferredPrompt || getGlobalPrompt()) && !isInstalled),
    isInstalled,
    isPrompting,
    triggerInstall,
  };
}

const MAX_AUTO_APPEARANCES = 5;
const SWITCHES_THRESHOLD = 3;
const AUTO_APPEARANCE_STORAGE_KEY = 'nexora_pwa_auto_impressions_count';

export interface PWAAppearanceOptions {
  currentScreen: string; // e.g. 'landing', 'auth', 'home', 'garden', 'profile', etc.
  isAuthScreen?: boolean;
  isGatewayScreen?: boolean;
  isOnboardingScreen?: boolean;
}

/**
 * Appearance Manager: Governs strictly when the top installer card is eligible to render.
 */
export function usePWAAppearanceManager(
  engine: PWAInstallState,
  options: PWAAppearanceOptions
) {
  const [sessionDismissed, setSessionDismissed] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const switchCountRef = useRef<number>(0);
  const lastScreenRef = useRef<string>(options.currentScreen);

  // Read stored auto impressions count from localStorage
  const getAutoImpressionsCount = (): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem(AUTO_APPEARANCE_STORAGE_KEY);
      const parsed = parseInt(raw || '0', 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  };

  const incrementAutoImpressionsCount = (): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const current = getAutoImpressionsCount();
      const updated = current + 1;
      localStorage.setItem(AUTO_APPEARANCE_STORAGE_KEY, updated.toString());
      return updated;
    } catch {
      return 0;
    }
  };

// Evaluate forbidden screens
  const isForbiddenScreen =
    options.isAuthScreen ||
    options.isGatewayScreen ||
    options.isOnboardingScreen ||
    options.currentScreen === 'landing' ||
    options.currentScreen === 'auth' ||
    options.currentScreen === 'login' ||
    options.currentScreen === 'signup' ||
    options.currentScreen === 'gateway' ||
    options.currentScreen === 'onboarding';

  // Track section switches in logged-in state inside main app
  useEffect(() => {
    if (isForbiddenScreen || engine.isInstalled || !engine.isInstallable) {
      setIsVisible(false);
      return;
    }

    // Inside main app screens: Track section changes
    if (lastScreenRef.current !== options.currentScreen) {
      lastScreenRef.current = options.currentScreen;
      switchCountRef.current += 1;

      // When threshold of 3 switches is reached inside the main app
      if (switchCountRef.current >= SWITCHES_THRESHOLD) {
        if (!sessionDismissed && getAutoImpressionsCount() < MAX_AUTO_APPEARANCES) {
          setIsVisible(true);
        }
      }
    }
  }, [
    options.currentScreen,
    options.isAuthScreen,
    options.isGatewayScreen,
    options.isOnboardingScreen,
    isForbiddenScreen,
    engine.isInstallable,
    engine.isInstalled,
    sessionDismissed,
  ]);

  // When card becomes visible automatically, increment count
  const recordedVisibilityRef = useRef<boolean>(false);
  useEffect(() => {
    if (isVisible && !recordedVisibilityRef.current) {
      recordedVisibilityRef.current = true;
      incrementAutoImpressionsCount();
    } else if (!isVisible) {
      recordedVisibilityRef.current = false;
    }
  }, [isVisible]);

  // Handle explicit dismissal by user
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setSessionDismissed(true);
    switchCountRef.current = 0; // Reset switch counter for future cycles
  }, []);

  // Handle successful install
  const handleInstallSuccess = useCallback(() => {
    setIsVisible(false);
    setSessionDismissed(true);
  }, []);

  return {
    isVisible: isVisible && engine.isInstallable && !engine.isInstalled && !isForbiddenScreen,
    handleDismiss,
    handleInstallSuccess,
  };
}
