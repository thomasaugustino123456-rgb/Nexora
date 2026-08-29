import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    __nexora_deferred_prompt?: any;
    __nexora_is_challenge_active?: boolean;
    __nexora_is_rewards_active?: boolean;
  }
}

const SESSION_SHOW_COUNT_KEY = 'nexora_pwa_show_count';
const SESSION_SWITCH_COUNT_KEY = 'nexora_pwa_switch_count';
const SESSION_DISMISSED_KEY = 'nexora_pwa_dismissed';
const LOCAL_INSTALLED_KEY = 'nexora_pwa_installed';

function getSessionNumber(key: string, defaultVal: number): number {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const val = sessionStorage.getItem(key);
    return val !== null ? parseInt(val, 10) || 0 : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setSessionNumber(key: string, val: number) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, String(val));
  } catch {}
}

function getSessionBool(key: string, defaultVal: boolean): boolean {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const val = sessionStorage.getItem(key);
    return val !== null ? val === 'true' : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setSessionBool(key: string, val: boolean) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, String(val));
  } catch {}
}

/**
 * Check if runtime is currently in standalone / installed PWA mode
 */
export function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(LOCAL_INSTALLED_KEY) === 'true') {
      return true;
    }
  } catch {}
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// Valid app sections that count towards section switches when transitioning
const MAIN_APP_SECTIONS = new Set([
  'home',
  'progress',
  'profile',
  'social',
  'settings',
  'shop',
  'library',
  'archives',
  'leaderboard',
  'house',
  'plant',
  'garden',
  'notebook',
  'nexus-vision',
  'device-showcase',
  'plan-builder',
  'hydration-detail',
]);

/**
 * PWA installation hook for Nexora.
 * - Displays on Landing page and Home section.
 * - Suppressed on Auth/Login/Signup, Onboarding, and during active Tasks/Challenges.
 * - Appears on app open; if dismissed or hidden, reappears every 3 section switches up to 4 times max.
 * - Executes direct native prompt or web app package download on Install click without instructional popups.
 */
export function usePWAInstall(currentScreen: string, isTaskActiveOverride?: boolean) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return window.__nexora_deferred_prompt || null;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandalone());
  const [isPrompting, setIsPrompting] = useState<boolean>(false);
  const [showCount, setShowCount] = useState<number>(() =>
    getSessionNumber(SESSION_SHOW_COUNT_KEY, 0)
  );
  const [switchCount, setSwitchCount] = useState<number>(() =>
    getSessionNumber(SESSION_SWITCH_COUNT_KEY, 0)
  );
  const [isDismissed, setIsDismissed] = useState<boolean>(() =>
    getSessionBool(SESSION_DISMISSED_KEY, false)
  );

  const prevSectionRef = useRef<string>(currentScreen);
  const countedCurrentScreenRef = useRef<string | null>(null);

  // Central event capture for beforeinstallprompt and appinstalled
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      if (e.matches || checkIsStandalone()) {
        setIsInstalled(true);
        try {
          localStorage.setItem(LOCAL_INSTALLED_KEY, 'true');
        } catch {}
      }
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleDisplayChange);
    } else {
      mql.addListener(handleDisplayChange);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__nexora_deferred_prompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      window.__nexora_deferred_prompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      try {
        localStorage.setItem(LOCAL_INSTALLED_KEY, 'true');
      } catch {}
    };

    const handleCustomPromptReady = (e: any) => {
      const prompt = e?.detail || window.__nexora_deferred_prompt;
      if (prompt) {
        setDeferredPrompt(prompt);
      }
    };

    const handleCustomInstalled = () => {
      window.__nexora_deferred_prompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      try {
        localStorage.setItem(LOCAL_INSTALLED_KEY, 'true');
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('nexora:pwa-prompt-ready', handleCustomPromptReady);
    window.addEventListener('nexora:pwa-installed', handleCustomInstalled);

    if (window.__nexora_deferred_prompt) {
      setDeferredPrompt(window.__nexora_deferred_prompt);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleDisplayChange);
      } else {
        mql.removeListener(handleDisplayChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('nexora:pwa-prompt-ready', handleCustomPromptReady);
      window.removeEventListener('nexora:pwa-installed', handleCustomInstalled);
    };
  }, []);

  // Determine if user is currently taking a task/challenge/protocol
  const isTakingTask =
    isTaskActiveOverride ||
    currentScreen === 'challenge' ||
    (typeof window !== 'undefined' &&
      (Boolean(window.__nexora_is_challenge_active) ||
        Boolean(window.__nexora_is_rewards_active)));

  // Track section switches across main app tabs (tasks/challenges are excluded)
  useEffect(() => {
    if (isInstalled || isTakingTask) return;

    const prev = prevSectionRef.current;
    if (prev !== currentScreen) {
      prevSectionRef.current = currentScreen;

      // Only count transitions between distinct recognized main app sections
      if (MAIN_APP_SECTIONS.has(prev) && MAIN_APP_SECTIONS.has(currentScreen)) {
        setSwitchCount((curr) => {
          const nextCount = curr + 1;
          if (nextCount >= 3) {
            // After 3 section switches, allow the card to reappear if under 4 limit
            setSessionNumber(SESSION_SWITCH_COUNT_KEY, 0);
            if (showCount < 4) {
              setIsDismissed(false);
              setSessionBool(SESSION_DISMISSED_KEY, false);
            }
            return 0;
          } else {
            setSessionNumber(SESSION_SWITCH_COUNT_KEY, nextCount);
            return nextCount;
          }
        });
      }
    }
  }, [currentScreen, isInstalled, isTakingTask, showCount]);

  // Qualifying screens: strictly Landing page or main app Home section
  const isQualifyingScreen =
    (currentScreen === 'landing' || currentScreen === 'home') && !isTakingTask;

  const isInstallable = Boolean(
    deferredPrompt ||
      (typeof window !== 'undefined' && Boolean(window.__nexora_deferred_prompt))
  );

  // Visibility calculation:
  // 1. Must have genuine browser installation prompt available (isInstallable)
  // 2. Must be on qualifying screen (landing or home)
  // 3. Not already installed
  // 4. Not currently dismissed or suppressed
  // 5. Must not have exceeded the 4-times appearance limit
  // 6. Must not be taking a task
  const isVisible =
    isQualifyingScreen &&
    isInstallable &&
    !isInstalled &&
    !isDismissed &&
    showCount < 4;

  // Increment show count when displayed
  useEffect(() => {
    if (isVisible) {
      if (countedCurrentScreenRef.current !== currentScreen) {
        countedCurrentScreenRef.current = currentScreen;
        setShowCount((prev) => {
          const next = prev + 1;
          setSessionNumber(SESSION_SHOW_COUNT_KEY, next);
          if (next >= 4) {
            setIsDismissed(true);
            setSessionBool(SESSION_DISMISSED_KEY, true);
          }
          return next;
        });
      }
    } else {
      countedCurrentScreenRef.current = null;
    }
  }, [isVisible, currentScreen]);

  // Installation trigger handler - connects directly to native browser beforeinstallprompt
  const triggerInstall = useCallback(async (): Promise<boolean> => {
    const promptEvent =
      (typeof window !== 'undefined' && window.__nexora_deferred_prompt) ||
      deferredPrompt;

    if (!promptEvent || typeof promptEvent.prompt !== 'function') {
      return false;
    }

    setIsPrompting(true);

    try {
      // 1. Invoke native browser installation prompt directly
      await promptEvent.prompt();

      // 2. Await genuine user choice from browser dialog
      const choiceResult = await promptEvent.userChoice;

      // 3. Clear consumed prompt reference
      if (typeof window !== 'undefined') {
        window.__nexora_deferred_prompt = null;
      }
      setDeferredPrompt(null);

      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        try {
          localStorage.setItem(LOCAL_INSTALLED_KEY, 'true');
        } catch {}
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Nexora PWA] Install prompt error:', err);
      return false;
    } finally {
      setIsPrompting(false);
    }
  }, [deferredPrompt]);

  // Dismiss action: hide immediately, reset switch counter, start counting 3 switches
  const dismiss = useCallback(() => {
    setIsDismissed(true);
    setSessionBool(SESSION_DISMISSED_KEY, true);
    setSwitchCount(0);
    setSessionNumber(SESSION_SWITCH_COUNT_KEY, 0);
  }, []);

  return {
    isVisible,
    isInstalled,
    isPrompting,
    isInstallable,
    showCount,
    switchCount,
    triggerInstall,
    dismiss,
  };
}
