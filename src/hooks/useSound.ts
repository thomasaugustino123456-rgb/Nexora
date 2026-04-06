import { useEffect, useRef, useState, useCallback } from 'react';

const SOUNDS = {
  stadium: "https://res.cloudinary.com/dfoty883a/video/upload/v1775215630/mixkit-stadium-crowd-light-applause-362_ockkrm.wav",
  losing: "https://res.cloudinary.com/dfoty883a/video/upload/v1775215702/mixkit-player-losing-or-failing-2042_mdtjny.wav",
  emergency: "https://res.cloudinary.com/dfoty883a/video/upload/v1775215665/mixkit-retro-game-emergency-alarm-1000_zgbifn.wav",
  continue: "https://res.cloudinary.com/dfoty883a/video/upload/v1775215724/mixkit-winning-a-coin-video-game-2069_tfy0tj.wav",
  trophy1: "https://res.cloudinary.com/dfoty883a/video/upload/v1775217014/mixkit-game-level-completed-2059_wsmqov.wav",
  trophy2: "https://res.cloudinary.com/dfoty883a/video/upload/v1775217027/mixkit-game-experience-level-increased-2062_iy7cdf.wav",
  trophy3: "https://res.cloudinary.com/dfoty883a/video/upload/v1775217571/mixkit-completion-of-a-level-2063_cnwcwe.wav",
  catHappy: "https://res.cloudinary.com/dfoty883a/video/upload/v1775219001/mixkit-sweet-kitty-meow-93_ljrmhr.wav",
  catHungry: "https://res.cloudinary.com/dfoty883a/video/upload/v1775219244/mixkit-domestic-cat-hungry-meow-45_dq4uqm.wav",
  dogHappy: "https://res.cloudinary.com/dfoty883a/video/upload/v1775220706/mixkit-happy-puppy-barks-741_ojdzpc.wav",
  dogHungry: "https://res.cloudinary.com/dfoty883a/video/upload/v1775220865/mixkit-dog-whimper-really-sad-468_s79aym.wav",
  dogAngry: "https://res.cloudinary.com/dfoty883a/video/upload/v1775220940/mixkit-hellhound-monster-attack-dog-wolf-creature-3015_lyv8jn.wav",
  'music-fanfare': "https://res.cloudinary.com/dfoty883a/video/upload/v1775215716/mixkit-medieval-show-fanfare-announcement-226_mxkbi8.wav",
  'music-funkee': "https://res.cloudinary.com/dfoty883a/video/upload/v1775223016/mixkit-funkee-monkeee-1140_od4pxc.mp3",
  'music-triplets': "https://res.cloudinary.com/dfoty883a/video/upload/v1775223058/mixkit-funky-triplets-1141_yeizgw.mp3",
  'music-forest': "https://res.cloudinary.com/dfoty883a/video/upload/v1775223233/mixkit-forest-treasure-138_a82rdf.mp3",
  'music-cbpd': "https://res.cloudinary.com/dfoty883a/video/upload/v1775223304/mixkit-cbpd-400_hxdsvf.mp3",
  'music-nba': "https://res.cloudinary.com/dfoty883a/video/upload/v1775223411/mixkit-g-eazy-nba-type-403_kai44j.mp3",
  'music-complicated': "https://res.cloudinary.com/dfoty883a/video/upload/v1775223497/mixkit-complicated-281_iqtv8a.mp3",
  coin: "https://res.cloudinary.com/dfoty883a/video/upload/v1775223550/mixkit-arcade-game-jump-coin-216_tq8v2j.wav",
  water: "https://res.cloudinary.com/dfoty883a/video/upload/v1775302429/mixkit-liquid-bubble-3000_dvewrr.wav",
};

// Module-level cache for audio objects
const audioCache: { [key: string]: HTMLAudioElement } = {};

// Initialize audio objects once
if (typeof window !== 'undefined') {
  Object.entries(SOUNDS).forEach(([key, url]) => {
    const audio = new Audio(url);
    audio.preload = "auto";
    audioCache[key] = audio;
  });
}

export function useSound() {
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);

  const play = useCallback((soundKey: keyof typeof SOUNDS, loop: boolean = false) => {
    console.log(`Playing sound: ${soundKey} (loop: ${loop})`);
    const audio = audioCache[soundKey];
    if (audio) {
      audio.loop = loop;
      audio.currentTime = 0;
      audio.play().catch(e => {
        // Only log if it's not a common interaction-required error
        if (e.name !== 'NotAllowedError') {
          console.error(`Error playing sound ${soundKey}:`, e);
        }
      });
    }
  }, []);

  const stop = useCallback((soundKey: keyof typeof SOUNDS) => {
    const audio = audioCache[soundKey];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const playMusic = useCallback((musicKey: string | null) => {
    // Stop current music if any
    if (currentMusic && audioCache[currentMusic]) {
      audioCache[currentMusic].pause();
      audioCache[currentMusic].currentTime = 0;
    }

    if (musicKey && audioCache[musicKey]) {
      const audio = audioCache[musicKey];
      audio.loop = true;
      audio.play().catch(e => {
        if (e.name !== 'NotAllowedError') {
          console.error(`Error playing music ${musicKey}:`, e);
        }
      });
      setCurrentMusic(musicKey);
    } else {
      setCurrentMusic(null);
    }
  }, [currentMusic]);

  const stopAllMusic = useCallback(() => {
    Object.keys(SOUNDS).forEach(key => {
      if (key.startsWith('music') || key === 'music-fanfare') {
        const audio = audioCache[key];
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    });
    setCurrentMusic(null);
  }, []);

  return { play, stop, playMusic, stopAllMusic, currentMusic };
}

