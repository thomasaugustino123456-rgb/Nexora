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
  select_task:
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

  // Lightning & Thunder Celebration (dedicated to the Lightning celebration page)
  lightning:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215960/mixkit-explainer-video-game-alert-sweep-236_xmqkot.wav",
  lightning_thunder:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088375/mixkit-martial-arts-punch-2052_l0noe5.wav",

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
const lastPlayTimestamps: Map<string, number> = new Map();

// Active playback set to prevent garbage-collection cutoffs during long celebrations
const activeAudioElements: Set<HTMLAudioElement> = new Set();
const activeAudioSources: Set<AudioBufferSourceNode> = new Set();

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
    // Trigger pre-fetching for all key sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      if (url && !key.startsWith("music")) {
        loadSoundBuffer(key, url).catch(() => {});
      }
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
 * Plays the sound cleanly to completion without cutting off mid-stream.
 */
export function playSound(soundKey: SoundKey, volume = 0.52) {
  if (!soundKey) return;
  const keyStr = String(soundKey);
  const effectiveKey = (SOUNDS as any)[keyStr] ? keyStr : "nav_switch";
  const url = (SOUNDS as any)[effectiveKey];
  if (!url) return;

  // Debounce (100ms) to prevent accidental double-triggers from simultaneous touch/click or rapid screen transitions
  const now = Date.now();
  const lastTime = lastPlayTimestamps.get(effectiveKey) || 0;
  if (now - lastTime < 100) return;
  lastPlayTimestamps.set(effectiveKey, now);

  try {
    const ctx = getOrCreateAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      // Method 1: Web Audio Buffer (True 0.00ms hardware latency, plays cleanly to end)
      const buffer = audioBufferCache.get(effectiveKey);
      if (buffer) {
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        activeAudioSources.add(source);
        source.onended = () => {
          activeAudioSources.delete(source);
          try {
            source.disconnect();
            gainNode.disconnect();
          } catch {}
        };

        source.start(0);
        return;
      }

      // If buffer is loading, initiate fetch for next time
      loadSoundBuffer(effectiveKey, url).catch(() => {});
    }

    // Method 2: HTML5 Audio with active retention (Guarantees no garbage-collection cutoff)
    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    audio.volume = volume;

    activeAudioElements.add(audio);
    const cleanup = () => {
      activeAudioElements.delete(audio);
      audio.removeEventListener("ended", cleanup);
      audio.removeEventListener("error", cleanup);
    };
    audio.addEventListener("ended", cleanup);
    audio.addEventListener("error", cleanup);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        cleanup();
      });
    }
  } catch (err) {
    // Audio execution guard
  }
}

/**
 * Synthesizes a dedicated, authentic cartoon lightning strike and thunder sound effect
 * created specifically for the Lightning Celebration Page.
 * 
 * Generates:
 * 1. Pre-discharge high-voltage electric ionization charge (0 - 50ms)
 * 2. Supersonic electric whip crack & dual detuned arc buzz (50 - 180ms)
 * 3. Thunderous deep sub-bass shockwave impact with analog saturation (65 - 650ms)
 * 4. Secondary electrical arc sparks matching the flashing screen bolts (220ms & 380ms)
 * 5. Rolling low-frequency thunder rumble (100ms - 1300ms) that smoothly fades
 *    as the lightning overlay clears and transitions to the mascot.
 */
export function playLightningThunder(volume = 0.9) {
  try {
    const ctx = getOrCreateAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // 1. Initial High-Voltage Electric Arc Crackle (The "ZAP / SNAP")
      const crackleSize = Math.floor(ctx.sampleRate * 0.22);
      const crackleBuffer = ctx.createBuffer(1, crackleSize, ctx.sampleRate);
      const crackleData = crackleBuffer.getChannelData(0);
      for (let i = 0; i < crackleSize; i++) {
        // High density random spark impulses
        const rand = Math.random() * 2 - 1;
        crackleData[i] = rand * (Math.random() > 0.08 ? 0.9 : 2.2);
      }

      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer;

      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = "bandpass";
      crackleFilter.frequency.setValueAtTime(4200, now);
      crackleFilter.frequency.exponentialRampToValueAtTime(750, now + 0.18);
      crackleFilter.Q.setValueAtTime(6.5, now);

      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(volume * 0.95, now);
      crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      crackleSource.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(ctx.destination);

      crackleSource.start(now);
      crackleSource.stop(now + 0.23);

      // 2. Dual High-Voltage Buzzing Sawtooth Electric Arc (1800Hz -> 180Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc2.type = "sawtooth";

      osc1.frequency.setValueAtTime(1750, now);
      osc1.frequency.exponentialRampToValueAtTime(190, now + 0.18);

      osc2.frequency.setValueAtTime(1790, now); // Detuned for electrical phase buzz
      osc2.frequency.exponentialRampToValueAtTime(180, now + 0.18);

      const arcFilter = ctx.createBiquadFilter();
      arcFilter.type = "lowpass";
      arcFilter.frequency.setValueAtTime(3800, now);
      arcFilter.frequency.exponentialRampToValueAtTime(600, now + 0.18);

      const arcGain = ctx.createGain();
      arcGain.gain.setValueAtTime(volume * 0.55, now);
      arcGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

      osc1.connect(arcFilter);
      osc2.connect(arcFilter);
      arcFilter.connect(arcGain);
      arcGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.2);

      // 3. Thunderous Deep Sub-Bass Shockwave Impact ("KABOOM!")
      const boomOsc = ctx.createOscillator();
      boomOsc.type = "triangle";
      boomOsc.frequency.setValueAtTime(140, now + 0.02);
      boomOsc.frequency.exponentialRampToValueAtTime(26, now + 0.55);

      // Soft distortion waveshaper for thunderous acoustic weight
      const waveShaper = ctx.createWaveShaper();
      const nSamples = 1024;
      const curve = new Float32Array(nSamples);
      for (let i = 0; i < nSamples; ++i) {
        const x = (i * 2) / nSamples - 1;
        curve[i] = ((3 + 12) * x * 20 * (Math.PI / 180)) / (Math.PI + 12 * Math.abs(x));
      }
      waveShaper.curve = curve;
      waveShaper.oversample = "2x";

      const boomGain = ctx.createGain();
      boomGain.gain.setValueAtTime(0.001, now);
      boomGain.gain.setValueAtTime(volume * 1.0, now + 0.03);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      boomOsc.connect(waveShaper);
      waveShaper.connect(boomGain);
      boomGain.connect(ctx.destination);

      boomOsc.start(now + 0.02);
      boomOsc.stop(now + 0.7);

      // 4. Secondary Electrical Sparks at +200ms & +360ms (matching lightning fork pulses)
      [0.2, 0.36].forEach((delayTime, idx) => {
        const sparkTime = now + delayTime;
        const sparkOsc = ctx.createOscillator();
        sparkOsc.type = "sawtooth";
        sparkOsc.frequency.setValueAtTime(1400 - idx * 250, sparkTime);
        sparkOsc.frequency.exponentialRampToValueAtTime(240, sparkTime + 0.09);

        const sparkGain = ctx.createGain();
        sparkGain.gain.setValueAtTime(volume * 0.35, sparkTime);
        sparkGain.gain.exponentialRampToValueAtTime(0.001, sparkTime + 0.09);

        sparkOsc.connect(sparkGain);
        sparkGain.connect(ctx.destination);
        sparkOsc.start(sparkTime);
        sparkOsc.stop(sparkTime + 0.1);
      });

      // 5. Rolling Low-Frequency Thunder Rumble (Atmospheric decay over 1.25s)
      const rumbleSize = Math.floor(ctx.sampleRate * 1.3);
      const rumbleBuffer = ctx.createBuffer(1, rumbleSize, ctx.sampleRate);
      const rumbleData = rumbleBuffer.getChannelData(0);
      let lastVal = 0;
      for (let i = 0; i < rumbleSize; i++) {
        const white = Math.random() * 2 - 1;
        lastVal = (lastVal + 0.025 * white) / 1.025;
        rumbleData[i] = lastVal * 3.8;
      }
      const rumbleSource = ctx.createBufferSource();
      rumbleSource.buffer = rumbleBuffer;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = "lowpass";
      rumbleFilter.frequency.setValueAtTime(240, now + 0.04);
      rumbleFilter.frequency.exponentialRampToValueAtTime(45, now + 1.25);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.001, now);
      rumbleGain.gain.setValueAtTime(volume * 0.8, now + 0.05);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);

      rumbleSource.start(now + 0.04);
      rumbleSource.stop(now + 1.3);
    }
  } catch (e) {
    // Web audio execution safety fallback
  }

  // Pure lightning impact audio layer (no other pages' sounds)
  try {
    playSound("lightning_thunder", volume * 0.95);
  } catch (e) {}
}

export function useSound() {
  const [currentMusic, setCurrentMusic] = useState<string | null>(
    activeMusicKey
  );

  const play = useCallback((soundKey: SoundKey, volume = 0.65) => {
    playSound(soundKey, volume);
  }, []);

  const playLightning = useCallback((vol = 0.85) => {
    playLightningThunder(vol);
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
    if (!musicKey) {
      if (activeMusicKey) {
        const prevAudio = getMusicElement(activeMusicKey);
        if (prevAudio) {
          try {
            prevAudio.pause();
            prevAudio.currentTime = 0;
          } catch {}
        }
      }
      activeMusicKey = null;
      setCurrentMusic(null);
      return;
    }

    if (activeMusicKey === musicKey) {
      const audio = getMusicElement(musicKey);
      if (audio && audio.paused) {
        audio.play().catch(() => {});
      }
      return;
    }

    if (activeMusicKey) {
      const prevAudio = getMusicElement(activeMusicKey);
      if (prevAudio) {
        try {
          prevAudio.pause();
          prevAudio.currentTime = 0;
        } catch {}
      }
    }

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
    playLightning,
    stop,
    playMusic,
    stopAllMusic,
    currentMusic,
  };
}

