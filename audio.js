/**
 * audio.js - Web Audio API Sound Synthesizer
 * 100% self-contained: No external audio assets required.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.ambientGain = null;
    this.isPlayingAmbient = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  // Deep space-whoosh atmospheric re-entry sound
  playWhoosh(duration = 2.8) {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(120, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(150, now + duration);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Subtle velocity-sensitive scroll aerodynamic whoosh
  playSubtleScrollWhoosh(velocity = 1.0) {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const duration = 0.55;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const startFreq = 220 + Math.min(800, Math.abs(velocity) * 180);
    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + duration);

    const gain = this.ctx.createGain();
    const peakVol = Math.min(0.07, 0.015 + Math.abs(velocity) * 0.015);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakVol, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Joyful magical chime arpeggio
  playChime() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    const now = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.25);
    });
  }

  // Realistic balloon popping sound
  playPop() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;

    // 1. Snappy pitch sweep
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);

    // 2. High-frequency noise snap
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2000, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.05);
  }

  // Celebratory fanfare
  playFanfare() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const chords = [
      { t: 0.0, freqs: [392.00, 493.88, 587.33] },
      { t: 0.18, freqs: [440.00, 554.37, 659.25] },
      { t: 0.36, freqs: [523.25, 659.25, 783.99] },
      { t: 0.58, freqs: [587.33, 739.99, 880.00, 1174.66] }
    ];

    chords.forEach(c => {
      c.freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + c.t);

        const duration = (c.t >= 0.58) ? 1.8 : 0.22;
        gain.gain.setValueAtTime(0.001, now + c.t);
        gain.gain.linearRampToValueAtTime(0.09, now + c.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + c.t + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + c.t);
        osc.stop(now + c.t + duration);
      });
    });
  }

  // Tactile iOS tick
  playClick() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.025);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Background party chimes / ambient glow
  startAmbient() {
    if (this.isPlayingAmbient || !this.ctx) return;
    this.resume();

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    const freqs = [261.63, 329.63, 392.00, 523.25]; // C Major warmth
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700 + idx * 60, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(this.ambientGain);
      osc.start();
    });

    this.isPlayingAmbient = true;
  }
}

window.soundEngine = new SoundEngine();
