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
  coin:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215724/mixkit-winning-a-coin-video-game-2069_tfy0tj.wav",
  water:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775302429/mixkit-liquid-bubble-3000_dvewrr.wav",
  nav_switch:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215538/mixkit-retro-arcade-casino-notification-211_chrmoj.wav",
  header_switch:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1777215960/mixkit-explainer-video-game-alert-sweep-236_xmqkot.wav",
  fire_streak:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320170/mixkit-completion-of-a-level-2063_1_l36yrp.wav",
  fire_ambient: "",
  challenge_unlock:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320911/mixkit-unlock-new-item-game-notification-254_wdigpd.wav",
  flame_complete:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1778320170/mixkit-completion-of-a-level-2063_1_l36yrp.wav",
  trophy_fanfare:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775215716/mixkit-medieval-show-fanfare-announcement-226_mxkbi8.wav",
  trophy_triplets:
    "https://res.cloudinary.com/dfoty883a/video/upload/v1775223058/mixkit-funky-triplets-1141_yeizgw.mp3",
  bubble_gum_pop: "",
  slime_squish: "",
  fire_spark: "",
  lunar_hum: "",
  silk_rustle: "",
  dream_chord: "",
  lotus_splash: "",
  fern_rustle: "",
  clover_shine: "",
  orchid_spark: "",
  cactus_prick: "",
  cactus_bloom: "",
  bamboo_knock: "",
  star_chime: "",
  sprout_pop: "",
  zen_gong: "",
  desert_wind: "",
  tropical_chirp: "",
  forest_rustle: "",
  meadow_breeze: "",
  crystal_ting: "",
  volcano_rumble: "",
  flower_sigh: "",
  sprout_cry: "",
  tulip_breeze: "",
  tulip_laugh: "",
  rose_sigh: "",
  shroom_glow: "",
  chest_reveal:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088376/mixkit-game-experience-level-increased-2062_cyf4kz.wav",
  chest_click:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088375/mixkit-quick-win-video-game-notification-269_ec7wwz.wav",
  chest_land:
    "https://res.cloudinary.com/ddtfq9acc/video/upload/v1783088375/mixkit-martial-arts-punch-2052_l0noe5.wav",
  mascotPop: "",
};

// Advanced Audio Engine with zero-latency instant feedback
let audioContext: AudioContext | null = null;
const bufferCache: { [key: string]: AudioBuffer } = {};
const rawBuffers: { [key: string]: ArrayBuffer } = {};
const audioCacheMap: Map<string, HTMLAudioElement> = new Map();
const lastPlayTimestamps: Map<string, number> = new Map();

const musicNodes: {
  [key: string]: { audio: HTMLAudioElement; gain: GainNode };
} = {};
let activeMusicKey: string | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioContext = new AudioCtxClass();
    }
  }
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function decodeAllRawBuffers() {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  Object.entries(rawBuffers).forEach(([key, ab]) => {
    if (!bufferCache[key] && ab && ab.byteLength > 0) {
      try {
        ctx.decodeAudioData(
          ab.slice(0),
          (decoded) => {
            bufferCache[key] = decoded;
          },
          () => {}
        ).catch(() => {});
      } catch {
        // Ignore decode sync exceptions
      }
    }
  });
}

// Unlock audio context and trigger immediate decoding on any user interaction
if (typeof window !== "undefined") {
  const unlock = () => {
    const ctx = getOrCreateAudioContext();
    if (ctx) {
      decodeAllRawBuffers();
    }
  };
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("mousedown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
  window.addEventListener("pointerdown", unlock, { passive: true });
}

// Immediate Preload & Cache at module load
if (typeof window !== "undefined") {
  Object.entries(SOUNDS).forEach(([key, url]) => {
    if (url) {
      // Pre-instantiate HTMLAudioElement cache for instant playback
      try {
        const audio = new Audio(url);
        audio.preload = "auto";
        audioCacheMap.set(key, audio);
      } catch {}

      // Pre-fetch raw buffer for Web Audio zero-latency decoding
      if (!key.startsWith("music")) {
        fetch(url)
          .then((res) => {
            if (!res.ok) return null;
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("text/html")) return null;
            return res.arrayBuffer();
          })
          .then((ab) => {
            if (ab && ab.byteLength > 0) {
              rawBuffers[key] = ab;
              decodeAllRawBuffers();
            }
          })
          .catch(() => {});
      }
    }
  });
}

const getMusicNode = async (key: string) => {
  if (musicNodes[key]) return musicNodes[key];

  let url = (SOUNDS as any)[key];
  if (!url) {
    url = (SOUNDS as any)["music-funkee"] || "https://res.cloudinary.com/dfoty883a/video/upload/v1775223016/mixkit-funkee-monkeee-1140_od4pxc.mp3";
  }

  try {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";

    // Direct simple playback node — no Web Audio API wrap for maximum CORS / mobile compatibility!
    musicNodes[key] = { audio, gain: {} as any };
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
      gainNode.gain.linearRampToValueAtTime(0.06, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (soundKey === "nav_switch" || soundKey === "header_switch") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (soundKey === "water") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (soundKey === "losing") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.45);
      gainNode.gain.setValueAtTime(0.07, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (soundKey === "emergency") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(250, now + 0.2);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (soundKey === "bubble_gum_pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.1);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundKey === "slime_squish") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.18);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (soundKey === "fire_spark") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundKey === "lunar_hum") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (soundKey === "silk_rustle") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (soundKey === "dream_chord") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.setValueAtTime(392.00, now + 0.08); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.16); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.24); // E5
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (soundKey === "lotus_splash") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundKey === "fern_rustle") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (soundKey === "clover_shine") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (soundKey === "orchid_spark") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.06); // C6
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (soundKey === "cactus_prick") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.setValueAtTime(100, now + 0.02);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (soundKey === "cactus_bloom") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(261.63, now);
      osc.frequency.linearRampToValueAtTime(523.25, now + 0.25);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (soundKey === "bamboo_knock") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(380, now);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (soundKey === "star_chime") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (soundKey === "sprout_pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (soundKey === "zen_gong") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(110, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
    } else if (soundKey === "desert_wind") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (soundKey === "tropical_chirp") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.linearRampToValueAtTime(1500, now + 0.08);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (soundKey === "forest_rustle") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundKey === "meadow_breeze") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (soundKey === "crystal_ting") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(2048, now);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (soundKey === "volcano_rumble") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.8);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (soundKey === "flower_sigh") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (soundKey === "sprout_cry") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.6);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (soundKey === "tulip_breeze") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.linearRampToValueAtTime(450, now + 0.15);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundKey === "tulip_laugh") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(800, now + 0.05);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundKey === "rose_sigh") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.45);
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (soundKey === "shroom_glow") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
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
    } else if (soundKey === "chest_click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (soundKey === "chest_land") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (soundKey === "chest_reveal") {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
      notes.forEach((freq, idx) => {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
        subGain.gain.setValueAtTime(0, now + idx * 0.08);
        subGain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now + idx * 0.08);
        subOsc.stop(now + idx * 0.08 + 0.4);
      });
    } else if (soundKey === "catHappy" || soundKey === "meow") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.32);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (soundKey === "catHungry") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.linearRampToValueAtTime(700, now + 0.15);
      osc.frequency.linearRampToValueAtTime(390, now + 0.38);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.22, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (soundKey === "dogHappy" || soundKey === "bark") {
      [0, 0.12].forEach((delay) => {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(340, now + delay);
        subOsc.frequency.exponentialRampToValueAtTime(150, now + delay + 0.09);
        subGain.gain.setValueAtTime(0.28, now + delay);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now + delay);
        subOsc.stop(now + delay + 0.095);
      });
    } else if (soundKey === "dogHungry" || soundKey === "dogAngry") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.14);
      gainNode.gain.setValueAtTime(0.24, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundKey === "mascotPop" || soundKey === "pop") {
      // Soft, warm, bubbly pop sound (< 220ms) under 250ms
      osc.type = "sine";
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.18);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
      osc.start(now);
      osc.stop(now + 0.20);
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

  const play = useCallback((soundKey: keyof typeof SOUNDS) => {
    if (!soundKey) return;

    // Duplicate Prevention (Debounce 90ms for exact same sound key)
    const now = Date.now();
    const keyStr = String(soundKey);
    const lastTime = lastPlayTimestamps.get(keyStr) || 0;
    if (now - lastTime < 90) {
      return; // Suppress duplicate play call within 90ms
    }
    lastPlayTimestamps.set(keyStr, now);

    try {
      const ctx = getOrCreateAudioContext();
      const buffer = bufferCache[keyStr];

      if (ctx && buffer) {
        // High-speed zero-latency Web Audio Buffer playback (< 1ms)
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
      } else {
        // Preloaded HTML5 Audio element playback
        const cachedAudio = audioCacheMap.get(keyStr);
        if (cachedAudio) {
          cachedAudio.currentTime = 0;
          cachedAudio.volume = 0.35;
          cachedAudio.play().catch((err) => {
            console.warn(`Cached audio play deferred for ${keyStr}:`, err);
          });
        } else {
          // Direct HTML5 Audio fallback
          const url = SOUNDS[soundKey];
          if (url) {
            const audio = new Audio(url);
            audio.volume = 0.35;
            audio.play().catch((err) => {
              console.warn(`Audio play failed for ${soundKey}:`, err);
            });
          }
        }
      }
    } catch (e) {
      console.warn("Audio Engine Error:", e);
    }
  }, []);

  const playButtonClick = useCallback(() => play("nav_switch"), [play]);
  const playSectionSwitch = useCallback(() => play("nav_switch"), [play]);
  const playShopPurchase = useCallback(() => play("coin"), [play]);
  const playChestClick = useCallback(() => play("chest_click"), [play]);
  const playChestLand = useCallback(() => play("chest_land"), [play]);
  const playChestReveal = useCallback(() => play("chest_reveal"), [play]);
  const playFlameComplete = useCallback(() => play("flame_complete"), [play]);
  const playMascotCelebration = useCallback(() => play("stadium"), [play]);

  const stop = useCallback(async (soundKey: keyof typeof SOUNDS) => {
    const node = await getMusicNode(soundKey as string);
    if (node) {
      try {
        node.audio.pause();
        node.audio.currentTime = 0;
      } catch {
        // ignore pause errors
      }
    }
  }, []);

  const playMusic = useCallback(async (musicKey: string | null) => {
    if (activeMusicKey === musicKey) return;

    // Stop previous
    if (activeMusicKey) {
      const prevNode = await getMusicNode(activeMusicKey);
      if (prevNode) {
        try {
          prevNode.audio.pause();
          prevNode.audio.currentTime = 0;
        } catch {
          // ignore pause errors
        }
      }
    }

    if (musicKey) {
      const node = await getMusicNode(musicKey);
      if (node) {
        node.audio.loop = true;
        const promise = node.audio.play();
        if (promise !== undefined) {
          promise.catch((e) => {
            const msg = String(e?.message || e || "");
            if (e?.name !== "AbortError" && !msg.includes("interrupted") && !msg.includes("pause")) {
              console.warn("Audio play notice:", e);
            }
          });
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
        musicNodes[key].audio.pause();
        musicNodes[key].audio.currentTime = 0;
      } catch {
        // ignore pause errors
      }
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
