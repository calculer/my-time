// Web Audio API generator for ambient sounds and timer chimes
// No external MP3 downloads or network dependencies needed!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbient: string = 'none';

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play pleasant crystal two-tone chime
  playChime(type: 'workComplete' | 'breakComplete' | 'start' = 'workComplete') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'workComplete') {
        // Joyful ascending harmonious chime (E5 -> A5 -> C#6)
        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.25);
        osc2.frequency.setValueAtTime(1108.73, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc1.start(now);
        osc2.start(now + 0.1);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      } else if (type === 'breakComplete') {
        // Gentle descending chime (A5 -> F#5)
        osc1.frequency.setValueAtTime(880.0, now);
        osc1.frequency.exponentialRampToValueAtTime(739.99, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc1.start(now);
        osc1.stop(now + 1.0);
      } else {
        // Soft single start tone
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.start(now);
        osc1.stop(now + 0.5);
      }
    } catch {
      // Audio autoplay might be blocked before first user click
    }
  }

  // Start continuous ambient noise
  setAmbient(type: 'none' | 'rain' | 'cafe' | 'whitenoise', volume: number = 0.5) {
    if (this.currentAmbient === type && this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(volume, 1)) * 0.4, this.getContext().currentTime);
      return;
    }

    this.stopAmbient();

    if (type === 'none') {
      this.currentAmbient = 'none';
      return;
    }

    try {
      const ctx = this.getContext();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'whitenoise') {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } else if (type === 'rain') {
        // Pink noise approximation
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      } else if (type === 'cafe') {
        // Brownish warm murmur
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter
      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else if (type === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.max(0, Math.min(volume, 1)) * 0.35, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(0);

      this.ambientSource = whiteNoise;
      this.ambientGain = gain;
      this.currentAmbient = type;
    } catch {
      // Audio autoplay might be blocked
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
        this.ambientSource.disconnect();
      } catch {
        // Already stopped
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    this.currentAmbient = 'none';
  }
}

export const soundEngine = new SoundEngine();

// System / Browser Notification helper
export async function sendNotification(title: string, body: string, icon = '/icon-192.svg') {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon });
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, { body, icon });
      return true;
    }
  }

  return false;
}
