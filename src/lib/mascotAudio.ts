// Procedural Web Audio API sound synthesizer for Nexora Living Mascots
// 100% offline, lightweight, and crystal-clear sound effects

class MascotAudioEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playMascotSound(mascotId: string, isRare = false, soundEnabled = true) {
    if (!soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      switch (mascotId) {
        case 'fire-slim':
          this.playFireSound(now, isRare);
          break;
        case 'water-slim':
          this.playWaterSound(now, isRare);
          break;
        case 'shield-slim':
          this.playShieldSound(now, isRare);
          break;
        case 'lightning-slim':
          this.playLightningSound(now, isRare);
          break;
        case 'earth-slim':
          this.playEarthSound(now, isRare);
          break;
        case 'blue-slim':
        default:
          this.playBlueSound(now, isRare);
          break;
      }
    } catch (e) {
      console.warn('Mascot procedural audio deferred:', e);
    }
  }

  private playBlueSound(now: number, isRare: boolean) {
    if (!this.ctx) return;
    // Gentle pop + soft chime sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(isRare ? 960 : 640, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);

    if (isRare) {
      // Add secondary pleasant chime
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'triangle';
      chime.frequency.setValueAtTime(1280, now + 0.1);
      chimeGain.gain.setValueAtTime(0.2, now + 0.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      chime.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chime.start(now + 0.1);
      chime.stop(now + 0.61);
    }
  }

  private playFireSound(now: number, isRare: boolean) {
    if (!this.ctx) return;
    // Whoosh + flame crackle burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isRare ? 0.6 : 0.42));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (isRare ? 0.61 : 0.43));
  }

  private playWaterSound(now: number, isRare: boolean) {
    if (!this.ctx) return;
    // Water drop splash
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  private playLightningSound(now: number, isRare: boolean) {
    if (!this.ctx) return;
    // Electric zap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.setValueAtTime(350, now + 0.04);
    osc.frequency.setValueAtTime(1800, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  private playEarthSound(now: number, isRare: boolean) {
    if (!this.ctx) return;
    // Deep stone rumble + leaf rustle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.49);
  }

  private playShieldSound(now: number, isRare: boolean) {
    if (!this.ctx) return;
    // Protective resonant shield hum
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    osc.frequency.setValueAtTime(440, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.51);
  }
}

export const mascotAudio = new MascotAudioEngine();
