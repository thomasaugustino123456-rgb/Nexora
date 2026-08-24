import { playSound } from '../hooks/useSound';

class MascotAudioEngine {
  public playMascotSound(mascotId: string, isRare = false, soundEnabled = true) {
    if (!soundEnabled) return;
    try {
      switch (mascotId) {
        case 'fire-slim':
          playSound(isRare ? 'flame_complete' : 'fire_streak');
          break;
        case 'water-slim':
          playSound('water');
          break;
        case 'shield-slim':
          playSound('challenge_unlock');
          break;
        case 'lightning-slim':
          playSound(isRare ? 'trophy2' : 'challenge_unlock');
          break;
        case 'earth-slim':
          playSound('coin');
          break;
        case 'blue-slim':
        default:
          playSound(isRare ? 'mascotPop' : 'nav_switch');
          break;
      }
    } catch (e) {
      // Sound trigger guard
    }
  }
}

export const mascotAudio = new MascotAudioEngine();

