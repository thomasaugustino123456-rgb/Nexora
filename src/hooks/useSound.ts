import { useEffect, useRef } from 'react';

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
  fanfare: "https://res.cloudinary.com/dfoty883a/video/upload/v1775215716/mixkit-medieval-show-fanfare-announcement-226_mxkbi8.wav",
  music1: "https://res.cloudinary.com/dfoty883a/video/upload/v1775223016/mixkit-funkee-monkeee-1140_od4pxc.mp3",
  music2: "https://res.cloudinary.com/dfoty883a/video/upload/v1775223058/mixkit-funky-triplets-1141_yeizgw.mp3",
  music3: "https://res.cloudinary.com/dfoty883a/video/upload/v1775223233/mixkit-forest-treasure-138_a82rdf.mp3",
  music4: "https://res.cloudinary.com/dfoty883a/video/upload/v1775223304/mixkit-cbpd-400_hxdsvf.mp3",
  music5: "https://res.cloudinary.com/dfoty883a/video/upload/v1775223411/mixkit-g-eazy-nba-type-403_kai44j.mp3",
  music6: "https://res.cloudinary.com/dfoty883a/video/upload/v1775223497/mixkit-complicated-281_iqtv8a.mp3",
};

export function useSound() {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      audioRefs.current[key] = new Audio(url);
    });
  }, []);

  const play = (soundKey: keyof typeof SOUNDS, loop: boolean = false) => {
    const audio = audioRefs.current[soundKey];
    if (audio) {
      audio.loop = loop;
      audio.currentTime = 0;
      audio.play().catch(e => console.error(`Error playing sound ${soundKey}:`, e));
    }
  };

  const stop = (soundKey: keyof typeof SOUNDS) => {
    const audio = audioRefs.current[soundKey];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  return { play, stop };
}
