import { useEffect, useRef, useState, useCallback } from "react";

const SOUNDS = {
  stadium:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215630/mixkit-stadium-crowd-light-applause-362_ockkrm.wav",
  losing:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215702/mixkit-player-losing-or-failing-2042_mdtjny.wav",
  emergency:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215665/mixkit-retro-game-emergency-alarm-1000_zgbifn.wav",
  continue:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215724/mixkit-winning-a-coin-video-game-2069_tfy0tj.wav",
  trophy1:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775217014/mixkit-game-level-completed-2059_wsmqov.wav",
  trophy2:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775217027/mixkit-game-experience-level-increased-2062_iy7cdf.wav",
  trophy3:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775217571/mixkit-completion-of-a-level-2063_cnwcwe.wav",
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
  coin: "https://actions.google.com/sounds/v1/ui/gameshow_correct_answer.ogg",
  water:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775302429/mixkit-liquid-bubble-3000_dvewrr.wav",
  nav_switch:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215538/mixkit-retro-arcade-casino-notification-211_chrmoj.wav",
  header_switch:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215960/mixkit-explainer-video-game-alert-sweep-236_xmqkot.wav",
  fire_streak:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1731515665/mixkit-fire-spell-cast-2311_u5x6zv.wav",
  fire_ambient:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1731515702/mixkit-gentle-fire-crackling-1339_y8zxvj.wav",
  challenge_unlock:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320911/mixkit-unlock-new-item-game-notification-254_wdigpd.wav",
  flame_complete:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320170/mixkit-completion-of-a-level-2063_1_l36yrp.wav",
  trophy_fanfare:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215716/mixkit-medieval-show-fanfare-announcement-226_mxkbi8.wav",
  trophy_triplets:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223058/mixkit-funky-triplets-1141_yeizgw.mp3",
};

// Advanced Audio Engine
let audioContext: AudioContext | null = null;
const bufferCache: { [key: string]: AudioBuffer } = {};
const musicNodes: {
  [key: string]: { audio: HTMLAudioElement; gain: GainNode };
} = {};
let activeMusicKey: string | null = null;
let initialized = false;

async function initContext() {
  if (initialized) return audioContext;

  if (!audioContext) {
    audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  initialized = true;
  return audioContext;
}

// Global Interaction Listener to unlock AudioContext
if (typeof window !== "undefined") {
  const unlock = () => {
    initContext();
    document.removeEventListener("touchstart", unlock);
    document.removeEventListener("mousedown", unlock);
    document.removeEventListener("keydown", unlock);
  };
  document.addEventListener("touchstart", unlock);
  document.addEventListener("mousedown", unlock);
  document.addEventListener("keydown", unlock);
}

// Preload buffers (Effects only at module load)
if (typeof window !== "undefined") {
  Object.entries(SOUNDS).forEach(async ([key, url]) => {
    if (!key.startsWith("music")) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Audio: Preload failed for ${key} due to status ${response.status}`);
          return;
        }
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
          console.warn(`Audio: Preload failed for ${key} - returned HTML instead of audio`);
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          console.warn(`Audio: Preload failed for ${key} - empty arrayBuffer`);
          return;
        }

        let isDecoded = false;
        let attemptsCount = 0;
        // We wait for the first user interaction to decode
        const checkCtx = () => {
          if (isDecoded) return true;
          if (attemptsCount > 30) {
            // Stop trying after several attempts
            return true;
          }
          if (audioContext && audioContext.state !== "suspended") {
            attemptsCount++;
            try {
              audioContext.decodeAudioData(
                arrayBuffer,
                (buffer) => {
                  bufferCache[key] = buffer;
                  isDecoded = true;
                },
                (err) => {
                  console.warn(`Audio: Error decoding ${key}:`, err);
                  isDecoded = true; // stop trying
                }
              ).catch((err) => {
                console.warn(`Audio: Promise caught error decoding ${key}:`, err);
                isDecoded = true; // stop trying
              });
            } catch (err) {
              console.warn(`Audio: Sync catch error decoding ${key}:`, err);
              isDecoded = true; // stop trying
            }
            return true;
          }
          return false;
        };

        // Polling check or wait for first play
        const interval = setInterval(() => {
          if (checkCtx() || isDecoded) clearInterval(interval);
        }, 1000);
      } catch (e) {
        console.warn(`Failed to preload ${key}:`, e);
      }
    }
  });
}

const getMusicNode = async (key: string) => {
  if (musicNodes[key]) return musicNodes[key];

  const url = (SOUNDS as any)[key];
  if (!url) return null;

  try {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";

    const ctx = await initContext();
    if (!ctx) return null;
    const source = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();
    source.connect(gain);
    gain.connect(ctx.destination);

    musicNodes[key] = { audio, gain };
    return musicNodes[key];
  } catch (err) {
    console.warn("Audio: Error setting up music node:", err);
    return null;
  }
};

// High-fidelity fallback synthesizer for offline or 404 assets
function synthesizeFallbackSound(soundKey: string, ctx: AudioContext) {
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (soundKey === "coin") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (soundKey === "nav_switch" || soundKey === "header_switch") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (soundKey === "water") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (soundKey === "losing") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.45);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (soundKey === "emergency") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(250, now + 0.2);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (soundKey === "continue" || soundKey === "challenge_unlock" || soundKey === "flame_complete") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
      osc.frequency.setValueAtTime(392.00, now + 0.2); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.3); // C5

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (err) {
    console.warn("Audio Fallback Synthesizer failed:", err);
  }
}

export function useSound() {
  const [currentMusic, setCurrentMusic] = useState<string | null>(
    activeMusicKey,
  );

  const play = useCallback(async (soundKey: keyof typeof SOUNDS) => {
    try {
      const ctx = await initContext();
      if (!ctx) return;
      let buffer = bufferCache[soundKey];

      if (!buffer && !soundKey.startsWith("music")) {
        // Try decoding now if it was fetched but not decoded
        const url = SOUNDS[soundKey];
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            const contentType = resp.headers.get("content-type") || "";
            if (!contentType.includes("text/html")) {
              const ab = await resp.arrayBuffer();
              if (ab.byteLength > 0) {
                buffer = await ctx.decodeAudioData(ab);
                bufferCache[soundKey] = buffer;
              }
            }
          }
        } catch (fetchErr) {
          console.warn(`Audio: On-demand fetch/decode failed for ${soundKey}:`, fetchErr);
        }
      }

      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } else {
        // Fallback programmatic synthesizer if no buffer could be downloaded/decoded!
        console.log(`Audio: Fallback browser-synthesizer invoked for ${soundKey}`);
        synthesizeFallbackSound(soundKey as string, ctx);
      }
    } catch (e) {
      console.error("Audio Engine Error:", e);
    }
  }, []);

  const stop = useCallback(async (soundKey: keyof typeof SOUNDS) => {
    const node = await getMusicNode(soundKey as string);
    if (node) {
      node.audio.pause();
      node.audio.currentTime = 0;
    }
  }, []);

  const playMusic = useCallback(async (musicKey: string | null) => {
    if (activeMusicKey === musicKey) return;

    // Stop previous
    if (activeMusicKey) {
      const prevNode = await getMusicNode(activeMusicKey);
      if (prevNode) {
        prevNode.audio.pause();
        prevNode.audio.currentTime = 0;
      }
    }

    if (musicKey) {
      const node = await getMusicNode(musicKey);
      if (node) {
        node.audio.loop = true;
        node.audio.play().catch((e) => console.error(e));
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
      musicNodes[key].audio.pause();
      musicNodes[key].audio.currentTime = 0;
    });
    activeMusicKey = null;
    setCurrentMusic(null);
  }, []);

  return { play, stop, playMusic, stopAllMusic, currentMusic };
}
