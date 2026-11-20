// ============================================================
// Royal Palace Ambient Soundscape & Footsteps Engine
// Generates:
// 1. Tactile Palace Footsteps (hardwood parquet & velvet runner)
// 2. Lush Royal Music Box & Orchestral Strings Soundscape
// 3. Audio Ducking for Video Memories
// ============================================================

type AudioStateListener = (isPlaying: boolean) => void;

class RoyalSoundscape {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private masterGain: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private listeners: AudioStateListener[] = [];

  // Footstep mechanics
  private isLeftFoot = false;
  private lastStepTime = 0;
  private footstepGain: GainNode | null = null;

  // Romantic royal progression in F major & D minor (Waltz / Ballad)
  // Fmaj9 -> Am7 -> Dm9 -> Bbmaj7 -> Gm9 -> C9sus4 -> F
  private melodyProgression = [
    // 1. F major 9: Pure nostalgia & sweet beginning
    {
      bass: 174.61, // F3
      pianoChord: [220.00, 261.63, 329.63, 392.00], // A3, C4, E4, G4
      celestaArp: [523.25, 659.25, 783.99, 659.25, 523.25, 392.00], // C5, E5, G5, E5, C5, G4
    },
    // 2. A minor 7: Tender reflection & quiet butterflies
    {
      bass: 220.00, // A3
      pianoChord: [261.63, 329.63, 392.00, 493.88], // C4, E4, G4, B4
      celestaArp: [659.25, 783.99, 987.77, 783.99, 659.25, 493.88], // E5, G5, B5, G5, E5, B4
    },
    // 3. D minor 9: Deep devotion & emotional longing
    {
      bass: 146.83, // D3
      pianoChord: [220.00, 261.63, 329.63, 349.23], // A3, C4, E4, F4
      celestaArp: [587.33, 698.46, 880.00, 698.46, 587.33, 440.00], // D5, F5, A5, F5, D5, A4
    },
    // 4. Bb major 7: Soaring romantic radiance (The Princess Look)
    {
      bass: 116.54, // Bb2
      pianoChord: [174.61, 233.08, 293.66, 349.23], // F3, Bb3, D4, F4
      celestaArp: [466.16, 587.33, 698.46, 880.00, 698.46, 587.33], // Bb4, D5, F5, A5, F5, D5
    },
    // 5. G minor 9: Soft vulnerability & sincere apology
    {
      bass: 98.00, // G2
      pianoChord: [146.83, 196.00, 220.00, 293.66], // D3, G3, A3, D4
      celestaArp: [392.00, 493.88, 587.33, 739.99, 587.33, 493.88], // G4, B4, D5, F#5, D5, B4
    },
    // 6. C 9 sus4 -> C 7: Building hope & resolution back home
    {
      bass: 130.81, // C3
      pianoChord: [196.00, 261.63, 293.66, 349.23], // G3, C4, D4, F4
      celestaArp: [523.25, 587.33, 659.25, 783.99, 659.25, 523.25], // C5, D5, E5, G5, E5, C5
    },
  ];
  private step = 0;

  // Ensure AudioContext is active (works even before music is toggled)
  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // ── 1. TACTILE PALACE FOOTSTEPS ──────────────────────────────
  // Simulates leather shoes stepping across hardwood parquet and velvet carpet
  public playFootstep(twoSteps = true) {
    try {
      const now = performance.now();
      // Debounce rapid continuous triggers to natural human walking cadence (~240ms)
      if (now - this.lastStepTime < 240) return;
      this.lastStepTime = now;

      const ctx = this.getContext();
      const t0 = ctx.currentTime;

      // First step immediately
      this.synthesizeSingleStep(ctx, t0, this.isLeftFoot);
      this.isLeftFoot = !this.isLeftFoot;

      // Natural second pacing step if walking forward/backward
      if (twoSteps) {
        window.setTimeout(() => {
          if (!this.ctx || this.ctx.state === 'closed') return;
          this.synthesizeSingleStep(this.ctx, this.ctx.currentTime, this.isLeftFoot);
          this.isLeftFoot = !this.isLeftFoot;
        }, 260);
      }
    } catch {
      // Audio permission fallback
    }
  }

  private synthesizeSingleStep(ctx: AudioContext, time: number, isLeft: boolean) {
    if (!this.footstepGain) {
      this.footstepGain = ctx.createGain();
      this.footstepGain.gain.setValueAtTime(0.42, ctx.currentTime);
      this.footstepGain.connect(ctx.destination);
    }

    // Stereo Panner (subtle left/right placement)
    let panner: StereoPannerNode | null = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(isLeft ? -0.16 : 0.16, time);
      panner.connect(this.footstepGain);
    }
    const stepTarget: AudioNode = panner || this.footstepGain;

    // A. Floor Low Resonance / Muffled Heel Thud
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    const thudFreq = isLeft ? 102 : 112; // Slight pitch variation between feet

    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(thudFreq, time);
    thudOsc.frequency.exponentialRampToValueAtTime(42, time + 0.08);

    thudGain.gain.setValueAtTime(0.0001, time);
    thudGain.gain.linearRampToValueAtTime(0.24, time + 0.004);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

    thudOsc.connect(thudGain);
    thudGain.connect(stepTarget);
    thudOsc.start(time);
    thudOsc.stop(time + 0.13);

    // B. Leather Sole Tap / Hardwood Click
    // Short burst of bandpass filtered noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.045);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isLeft ? 980 : 1120, time);
    noiseFilter.Q.setValueAtTime(2.2, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, time);
    noiseGain.gain.linearRampToValueAtTime(0.16, time + 0.003);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(stepTarget);

    noiseSource.start(time);
    noiseSource.stop(time + 0.05);

    // C. Velvet Carpet Brush Friction
    const carpetFilter = ctx.createBiquadFilter();
    carpetFilter.type = 'highpass';
    carpetFilter.frequency.setValueAtTime(2600, time);

    const carpetGain = ctx.createGain();
    carpetGain.gain.setValueAtTime(0.0001, time);
    carpetGain.gain.linearRampToValueAtTime(0.045, time + 0.006);
    carpetGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

    const carpetNoise = ctx.createBufferSource();
    carpetNoise.buffer = noiseBuffer;

    carpetNoise.connect(carpetFilter);
    carpetFilter.connect(carpetGain);
    carpetGain.connect(stepTarget);

    carpetNoise.start(time);
    carpetNoise.stop(time + 0.065);
  }

  // ── 2. ROYAL MUSIC BOX & ORCHESTRAL SOUNDSCAPE ──────────────
  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    if (this.isPlaying) return;
    try {
      const ctx = this.getContext();

      // Master output node
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.24, ctx.currentTime + 2.0);

      // Dedicated ducking gain for video overlay compatibility
      this.duckGain = ctx.createGain();
      this.duckGain.gain.setValueAtTime(1.0, ctx.currentTime);

      this.masterGain.connect(this.duckGain);
      this.duckGain.connect(ctx.destination);

      this.isPlaying = true;
      this.notifyListeners(true);
      this.playNextBar();
    } catch {
      // Audio context blocked until user interaction
    }
  }

  public stop() {
    this.isPlaying = false;
    this.notifyListeners(false);
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.masterGain && this.ctx && this.ctx.state !== 'closed') {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      } catch {
        // ignore
      }
    }
  }

  // Duck music when watching a video memory
  public duck() {
    if (this.ctx && this.duckGain && this.isPlaying) {
      try {
        const now = this.ctx.currentTime;
        this.duckGain.gain.cancelScheduledValues(now);
        this.duckGain.gain.linearRampToValueAtTime(0.06, now + 0.4);
      } catch {
        // ignore
      }
    }
  }

  // Restore music when video modal closes
  public unduck() {
    if (this.ctx && this.duckGain && this.isPlaying) {
      try {
        const now = this.ctx.currentTime;
        this.duckGain.gain.cancelScheduledValues(now);
        this.duckGain.gain.linearRampToValueAtTime(1.0, now + 1.2);
      } catch {
        // ignore
      }
    }
  }

  private playNextBar = () => {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const prog = this.melodyProgression[this.step % this.melodyProgression.length];
    this.step++;
    const now = this.ctx.currentTime;
    const barDuration = 5.2;

    // 1. Warm Acoustic Grand Piano / Harp Tone
    // Dual harmonics: fundamental sine + soft octave overtone
    const bassOsc1 = this.ctx.createOscillator();
    const bassOsc2 = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    const bassFilter = this.ctx.createBiquadFilter();

    bassOsc1.type = 'sine';
    bassOsc1.frequency.setValueAtTime(prog.bass, now);

    bassOsc2.type = 'triangle';
    bassOsc2.frequency.setValueAtTime(prog.bass * 2, now);

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(320, now);

    bassGain.gain.setValueAtTime(0.0001, now);
    bassGain.gain.linearRampToValueAtTime(0.11, now + 0.08);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + barDuration);

    bassOsc1.connect(bassFilter);
    bassOsc2.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);

    bassOsc1.start(now);
    bassOsc2.start(now);
    bassOsc1.stop(now + barDuration + 0.2);
    bassOsc2.stop(now + barDuration + 0.2);

    // Warm Chamber String Pad
    prog.pianoChord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(540 + idx * 70, now);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.042, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + barDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + barDuration + 0.2);
    });

    // 2. Delicate Royal Music Box (Celesta Bell Arpeggios)
    prog.celestaArp.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const chimeTime = now + 0.35 + i * 0.68;

      // Pure bell sine
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      // Shimmering metallic overtone (2.76x frequency for crystalline chime bell)
      const overtoneOsc = this.ctx.createOscillator();
      const overtoneGain = this.ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, chimeTime);

      overtoneOsc.type = 'sine';
      overtoneOsc.frequency.setValueAtTime(freq * 2.76, chimeTime);

      chimeGain.gain.setValueAtTime(0.0001, chimeTime);
      chimeGain.gain.linearRampToValueAtTime(0.075, chimeTime + 0.008);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 1.8);

      overtoneGain.gain.setValueAtTime(0.0001, chimeTime);
      overtoneGain.gain.linearRampToValueAtTime(0.02, chimeTime + 0.006);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.6);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.masterGain);

      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(this.masterGain);

      chimeOsc.start(chimeTime);
      chimeOsc.stop(chimeTime + 1.9);

      overtoneOsc.start(chimeTime);
      overtoneOsc.stop(chimeTime + 0.7);
    });

    this.timer = window.setTimeout(this.playNextBar, barDuration * 1000 - 350);
  };

  public onStateChange(listener: AudioStateListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(playing: boolean) {
    this.listeners.forEach((l) => l(playing));
  }

  public getActive() {
    return this.isPlaying;
  }
}

export const soundscape = new RoyalSoundscape();
