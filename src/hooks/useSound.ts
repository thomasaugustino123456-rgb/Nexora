import { useState, useCallback } from "react";

// Exact Cloudinary Sound Assets (User Uploaded)
export const SOUNDS = {
  // Top sections / headers
  header_switch:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215960/mixkit-explainer-video-game-alert-sweep-236_xmqkot.wav",

  // Navigation / buttons / clicks
  nav_switch:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215538/mixkit-retro-arcade-casino-notification-211_chrmoj.wav",
  click:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215538/mixkit-retro-arcade-casino-notification-211_chrmoj.wav",

  // Streak flame & celebrations
  fire_streak:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320170/mixkit-completion-of-a-level-2063_1_l36yrp.wav",
  flame_complete:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320170/mixkit-completion-of-a-level-2063_1_l36yrp.wav",
  stadium:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215630/mixkit-stadium-crowd-light-applause-362_ockkrm.wav",

  // Challenges
  challenge_unlock:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320911/mixkit-unlock-new-item-game-notification-254_wdigpd.wav",
  quest_complete:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320911/mixkit-unlock-new-item-game-notification-254_wdigpd.wav",

  // Chest rewards
  chest_reveal:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088376/mixkit-game-experience-level-increased-2062_cyf4kz.wav",
  chest_click:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088375/mixkit-quick-win-video-game-notification-269_ec7wwz.wav",
  chest_land:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088375/mixkit-martial-arts-punch-2052_l0noe5.wav",

  // Economy & Hydration
  coin:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215724/mixkit-winning-a-coin-video-game-2069_tfy0tj.wav",
  continue:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215724/mixkit-winning-a-coin-video-game-2069_tfy0tj.wav",
  water:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775302429/mixkit-liquid-bubble-3000_dvewrr.wav",

  // Level & Trophies
  trophy1:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775217014/mixkit-game-level-completed-2059_wsmqov.wav",
  trophy2:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775217027/mixkit-game-experience-level-increased-2062_iy7cdf.wav",
  trophy3:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775217571/mixkit-completion-of-a-level-2063_cnwcwe.wav",
  trophy_fanfare:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215716/mixkit-medieval-show-fanfare-announcement-226_mxkbi8.wav",
  trophy_triplets:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223058/mixkit-funky-triplets-1141_yeizgw.mp3",

  // Game alerts & Mascots
  losing:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215702/mixkit-player-losing-or-failing-2042_mdtjny.wav",
  emergency:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215665/mixkit-retro-game-emergency-alarm-1000_zgbifn.wav",
  catHappy:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775219001/mixkit-sweet-kitty-meow-93_ljrmhr.wav",
  catHungry:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775219244/mixkit-domestic-cat-hungry-meow-45_dq4uqm.wav",
  dogHappy:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775220706/mixkit-happy-puppy-barks-741_ojdzpc.wav",
  dogHungry:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775220865/mixkit-dog-whimper-really-sad-468_s79aym.wav",
  dogAngry:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775220940/mixkit-hellhound-monster-attack-dog-wolf-creature-3015_lyv8jn.wav",
  mascotPop:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215538/mixkit-retro-arcade-casino-notification-211_chrmoj.wav",

  // Music Tracks
  "music-fanfare":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215716/mixkit-medieval-show-fanfare-announcement-226_mxkbi8.wav",
  "music-funkee":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223016/mixkit-funkee-monkeee-1140_od4pxc.mp3",
  "music-triplets":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223058/mixkit-funky-triplets-1141_yeizgw.mp3",
  "music-forest":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223233/mixkit-forest-treasure-138_a82rdf.mp3",
  "music-cbpd":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223304/mixkit-cbpd-400_hxdsvf.mp3",
  "music-nba":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223411/mixkit-g-eazy-nba-type-403_kai44j.mp3",
  "music-complicated":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223497/mixkit-complicated-281_iqtv8a.mp3",
  "music-lofi":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223016/mixkit-funkee-monkeee-1140_od4pxc.mp3",
  "music-cyber":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223304/mixkit-cbpd-400_hxdsvf.mp3",
  "music-nature":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223233/mixkit-forest-treasure-138_a82rdf.mp3",
  "music-synthwave":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223411/mixkit-g-eazy-nba-type-403_kai44j.mp3",
  "pro-music-quantum-zen":
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223058/mixkit-funky-triplets-1141_yeizgw.mp3",
};

export type SoundKey = keyof typeof SOUNDS | (string & {});

// Global Audio Context & Buffers
let audioContext: AudioContext | null = null;
const audioBufferCache: Map<string, AudioBuffer> = new Map();
const pendingFetchMap: Map<string, Promise<AudioBuffer | null>> = new Map();
const audioPool: Map<string, HTMLAudioElement[]> = new Map();
const poolIndex: Map<string, number> = new Map();
const lastPlayTimestamps: Map<string, number> = new Map();

// Music Controller
const musicNodes: { [key: string]: HTMLAudioElement } = {};
let activeMusicKey: string | null = null;

export function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioContext = new AudioCtxClass();
      }
    }
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
  } catch (e) {
    // Context initialization notice
  }
  return audioContext;
}

// Global user gesture unlocker for Chrome, Safari iOS, and PWAs
let isUnlocked = false;
export function unlockAudio() {
  const ctx = getOrCreateAudioContext();
  if (ctx) {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    // Play a 1-sample silent buffer to unlock the audio subsystem
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {}
  }

  if (!isUnlocked) {
    isUnlocked = true;
    // Pre-warm HTML5 audio elements on first touch
    audioPool.forEach((elements) => {
      elements.forEach((el) => {
        try {
          el.load();
        } catch {}
      });
    });
  }
}

if (typeof window !== "undefined") {
  const unlockEvents = [
    "touchstart",
    "touchend",
    "pointerdown",
    "mousedown",
    "keydown",
    "click",
  ];
  const onUserGesture = () => {
    unlockAudio();
  };
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, onUserGesture, {
      passive: true,
      capture: true,
    });
    document.addEventListener(evt, onUserGesture, {
      passive: true,
      capture: true,
    });
  });
}

// Helper to load and decode a single sound into Web Audio buffer
export async function loadSoundBuffer(key: string, url: string): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(key)) {
    return audioBufferCache.get(key)!;
  }
  if (pendingFetchMap.has(key)) {
    return pendingFetchMap.get(key)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const ctx = getOrCreateAudioContext();
      if (!ctx) return null;
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferCache.set(key, decodedBuffer);
      return decodedBuffer;
    } catch (err) {
      return null;
    } finally {
      pendingFetchMap.delete(key);
    }
  })();

  pendingFetchMap.set(key, fetchPromise);
  return fetchPromise;
}

// Pre-load all Cloudinary sound buffers immediately upon page boot
if (typeof window !== "undefined") {
  Object.entries(SOUNDS).forEach(([key, url]) => {
    if (!url) return;

    if (!key.startsWith("music")) {
      // HTML5 pool fallback
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < 2; i++) {
        try {
          const audio = new Audio();
          audio.crossOrigin = "anonymous";
          audio.preload = "auto";
          audio.src = url;
          pool.push(audio);
        } catch {}
      }
      audioPool.set(key, pool);
      poolIndex.set(key, 0);

      // Web Audio Buffer prefetch
      loadSoundBuffer(key, url).catch(() => {});
    }
  });
}

const getMusicElement = (key: string): HTMLAudioElement | null => {
  if (musicNodes[key]) return musicNodes[key];
  const url = (SOUNDS as any)[key] || SOUNDS["music-funkee"];
  if (!url) return null;

  try {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.src = url;
    audio.loop = true;
    audio.volume = 0.4;
    musicNodes[key] = audio;
    return audio;
  } catch {
    return null;
  }
};

/**
 * Direct zero-latency sound play function.
 * Can be called from any component, hook, or event handler.
 */
export function playSound(soundKey: SoundKey, volume = 0.65) {
  if (!soundKey) return;
  const keyStr = String(soundKey);
  const effectiveKey = (SOUNDS as any)[keyStr] ? keyStr : "nav_switch";
  const url = (SOUNDS as any)[effectiveKey];
  if (!url) return;

  // Ultra-fast debounce (20ms) to prevent accidental double-triggers from simultaneous touch/click
  const now = Date.now();
  const lastTime = lastPlayTimestamps.get(effectiveKey) || 0;
  if (now - lastTime < 20) return;
  lastPlayTimestamps.set(effectiveKey, now);

  try {
    const ctx = getOrCreateAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      // Method 1: Web Audio Buffer (True 0.00ms hardware latency)
      const buffer = audioBufferCache.get(effectiveKey);
      if (buffer) {
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      }

      // If buffer is loading, initiate fetch and proceed to fallback
      loadSoundBuffer(effectiveKey, url).catch(() => {});
    }

    // Method 2: HTML5 Audio Pool (Direct Cloudinary Audio)
    const pool = audioPool.get(effectiveKey);
    if (pool && pool.length > 0) {
      const currentIndex = poolIndex.get(effectiveKey) || 0;
      const nextIndex = (currentIndex + 1) % pool.length;
      poolIndex.set(effectiveKey, nextIndex);

      const audioElement = pool[currentIndex];
      if (audioElement) {
        try {
          audioElement.currentTime = 0;
          audioElement.volume = volume;
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
          return;
        } catch {}
      }
    }

    // Method 3: Direct fallback on Cloudinary URL
    const fallbackAudio = new Audio(url);
    fallbackAudio.crossOrigin = "anonymous";
    fallbackAudio.volume = volume;
    fallbackAudio.play().catch(() => {});
  } catch (err) {
    // Audio execution guard
  }
}

export function useSound() {
  const [currentMusic, setCurrentMusic] = useState<string | null>(
    activeMusicKey
  );

  const play = useCallback((soundKey: SoundKey, volume = 0.65) => {
    playSound(soundKey, volume);
  }, []);

  const playButtonClick = useCallback(() => play("nav_switch"), [play]);
  const playSectionSwitch = useCallback(() => play("header_switch"), [play]);
  const playShopPurchase = useCallback(() => play("coin"), [play]);
  const playChestClick = useCallback(() => play("chest_click"), [play]);
  const playChestLand = useCallback(() => play("chest_land"), [play]);
  const playChestReveal = useCallback(() => play("chest_reveal"), [play]);
  const playFlameComplete = useCallback(() => play("flame_complete"), [play]);
  const playMascotCelebration = useCallback(() => play("stadium"), [play]);

  const stop = useCallback(async (soundKey: SoundKey) => {
    const audio = getMusicElement(soundKey as string);
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }, []);

  const playMusic = useCallback(async (musicKey: string | null) => {
    if (activeMusicKey === musicKey) return;

    if (activeMusicKey) {
      const prevAudio = getMusicElement(activeMusicKey);
      if (prevAudio) {
        try {
          prevAudio.pause();
          prevAudio.currentTime = 0;
        } catch {}
      }
    }

    if (musicKey) {
      const nextAudio = getMusicElement(musicKey);
      if (nextAudio) {
        nextAudio.loop = true;
        const promise = nextAudio.play();
        if (promise !== undefined) {
          promise.catch(() => {});
        }
        activeMusicKey = musicKey;
        setCurrentMusic(musicKey);
      }
    } else {
      activeMusicKey = null;
      setCurrentMusic(null);
    }
  }, []);

  const stopAllMusic = useCallback(() => {
    Object.keys(musicNodes).forEach((key) => {
      try {
        musicNodes[key].pause();
        musicNodes[key].currentTime = 0;
      } catch {}
    });
    activeMusicKey = null;
    setCurrentMusic(null);
  }, []);

  return {
    play,
    playButtonClick,
    playSectionSwitch,
    playShopPurchase,
    playChestClick,
    playChestLand,
    playChestReveal,
    playFlameComplete,
    playMascotCelebration,
    stop,
    playMusic,
    stopAllMusic,
    currentMusic,
  };
}

