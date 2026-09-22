class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialize on first interaction
  }

  private initCtx() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Ignore audio init exceptions
    }
  }

  private safeSetValue(param: AudioParam, value: number, time: number, fallbackValue = 440) {
    if (!this.ctx) return;
    const v = (typeof value === 'number' && Number.isFinite(value)) ? value : fallbackValue;
    const t = (typeof time === 'number' && Number.isFinite(time)) ? Math.max(0, time) : (this.ctx.currentTime || 0);
    try {
      param.setValueAtTime(v, t);
    } catch {
      // AudioParam fallback protection
    }
  }

  private safeRampValue(param: AudioParam, value: number, time: number, fallbackValue = 0.001) {
    if (!this.ctx) return;
    const v = (typeof value === 'number' && Number.isFinite(value)) ? value : fallbackValue;
    const t = (typeof time === 'number' && Number.isFinite(time)) ? Math.max(0, time) : (this.ctx.currentTime || 0) + 0.05;
    try {
      if (v > 0) {
        param.exponentialRampToValueAtTime(v, t);
      } else {
        param.linearRampToValueAtTime(Math.max(0, v), t);
      }
    } catch {
      // AudioParam fallback protection
    }
  }

  public toggleSound(force?: boolean): boolean {
    if (force !== undefined) {
      this.enabled = force;
    } else {
      this.enabled = !this.enabled;
    }
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      this.safeSetValue(osc.frequency, 800, now);
      this.safeRampValue(osc.frequency, 400, now + 0.05);

      this.safeSetValue(gain.gain, 0.15, now);
      this.safeRampValue(gain.gain, 0.01, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // audio safety
    }
  }

  public playSpinTick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      this.safeSetValue(osc.frequency, 320, now);
      this.safeRampValue(osc.frequency, 180, now + 0.04);

      this.safeSetValue(gain.gain, 0.1, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // audio safety
    }
  }

  public playCoin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      this.safeSetValue(osc1.frequency, 987.77, now); // B5
      this.safeSetValue(osc1.frequency, 1318.51, now + 0.08); // E6

      osc2.type = 'triangle';
      this.safeSetValue(osc2.frequency, 1975.53, now + 0.08); // B6

      this.safeSetValue(gain.gain, 0.2, now);
      this.safeRampValue(gain.gain, 0.01, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // audio safety
    }
  }

  public playWin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.09;

        osc.type = 'triangle';
        this.safeSetValue(osc.frequency, freq, startTime);

        this.safeSetValue(gain.gain, 0.25, startTime);
        this.safeRampValue(gain.gain, 0.01, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {
      // audio safety
    }
  }

  public playJackpot() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const fanfare = [
        { f: 523.25, d: 0.12 },
        { f: 523.25, d: 0.12 },
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.24 },
        { f: 783.99, d: 0.24 },
        { f: 1046.50, d: 0.5 },
      ];

      let current = this.ctx.currentTime;
      fanfare.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        this.safeSetValue(osc.frequency, n.f, current);

        this.safeSetValue(gain.gain, 0.2, current);
        this.safeRampValue(gain.gain, 0.01, current + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(current);
        osc.stop(current + n.d);

        current += n.d * 0.9;
      });
    } catch {
      // audio safety
    }
  }

  public playCrash() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      this.safeSetValue(osc.frequency, 150, now);
      this.safeRampValue(osc.frequency, 30, now + 0.4);

      this.safeSetValue(gain.gain, 0.3, now);
      this.safeRampValue(gain.gain, 0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // audio safety
    }
  }

  public playBeep(pitch: number = 600) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const validPitch = (typeof pitch === 'number' && Number.isFinite(pitch) && pitch > 20) ? pitch : 600;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      this.safeSetValue(osc.frequency, validPitch, now);

      this.safeSetValue(gain.gain, 0.12, now);
      this.safeRampValue(gain.gain, 0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // audio safety
    }
  }

  public playCardFlip() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      this.safeSetValue(osc.frequency, 450, now);
      this.safeRampValue(osc.frequency, 150, now + 0.06);

      this.safeSetValue(gain.gain, 0.12, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // audio safety
    }
  }

  public playCardDeal() {
    this.playCardFlip();
  }

  public playDiceRoll() {
    this.playSpinTick();
  }

  public playCannonShoot() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      this.safeSetValue(osc.frequency, 300, now);
      this.safeRampValue(osc.frequency, 60, now + 0.12);

      this.safeSetValue(gain.gain, 0.2, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // audio safety
    }
  }

  public playFishCatch() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [659.25, 880.00, 1174.66]; // E5, A5, D6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = now + idx * 0.05;
        osc.type = 'sine';
        this.safeSetValue(osc.frequency, freq, st);
        this.safeSetValue(gain.gain, 0.18, st);
        this.safeRampValue(gain.gain, 0.01, st + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(st);
        osc.stop(st + 0.18);
      });
    } catch {
      // audio safety
    }
  }

  public playSpin() {
    this.playSpinTick();
  }

  public playLose() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [392.00, 349.23, 329.63, 261.63]; // G4, F4, E4, C4
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = now + idx * 0.08;
        osc.type = 'sawtooth';
        this.safeSetValue(osc.frequency, freq, st);
        this.safeSetValue(gain.gain, 0.12, st);
        this.safeRampValue(gain.gain, 0.01, st + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(st);
        osc.stop(st + 0.15);
      });
    } catch {
      // audio safety
    }
  }

  public playChip() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      this.safeSetValue(osc.frequency, 1200, now);
      this.safeRampValue(osc.frequency, 800, now + 0.04);
      this.safeSetValue(gain.gain, 0.15, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // audio safety
    }
  }

  public playChipStack() {
    this.playChip();
    setTimeout(() => this.playChip(), 40);
  }

  public playCashoutDing() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [1318.51, 1567.98, 2093.0]; // E6, G6, C7
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = now + idx * 0.05;
        osc.type = 'sine';
        this.safeSetValue(osc.frequency, freq, st);
        this.safeSetValue(gain.gain, 0.2, st);
        this.safeRampValue(gain.gain, 0.001, st + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(st);
        osc.stop(st + 0.35);
      });
    } catch {
      // audio safety
    }
  }

  public playDiamondSparkle(step: number = 1) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const validStep = (typeof step === 'number' && Number.isFinite(step)) ? Math.max(1, Math.min(25, step)) : 1;
      const base = 523.25 * Math.pow(1.06, Math.min(20, validStep * 2));
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      this.safeSetValue(osc.frequency, base, now);
      this.safeRampValue(osc.frequency, base * 1.5, now + 0.12);
      this.safeSetValue(gain.gain, 0.2, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // audio safety
    }
  }

  public playExplosion() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Sub-bass thump
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      this.safeSetValue(osc1.frequency, 160, now);
      this.safeRampValue(osc1.frequency, 25, now + 0.45);
      this.safeSetValue(gain1.gain, 0.35, now);
      this.safeRampValue(gain1.gain, 0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Distortion crackle
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      this.safeSetValue(osc2.frequency, 80, now);
      this.safeRampValue(osc2.frequency, 30, now + 0.25);
      this.safeSetValue(gain2.gain, 0.15, now);
      this.safeRampValue(gain2.gain, 0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.25);
    } catch {
      // audio safety
    }
  }

  public playPlinkoPeg(ratio: number = 0.5) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const validRatio = (typeof ratio === 'number' && Number.isFinite(ratio)) ? Math.max(0, Math.min(1, ratio)) : 0.5;
      const now = this.ctx.currentTime;
      // Dynamic acoustic peg strike with slight harmonic overtone
      const freq = 380 + Math.min(650, validRatio * 550);
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      this.safeSetValue(osc1.frequency, freq, now);
      this.safeRampValue(osc1.frequency, freq * 0.6, now + 0.045);

      osc2.type = 'triangle';
      this.safeSetValue(osc2.frequency, freq * 1.5, now);
      this.safeRampValue(osc2.frequency, freq * 0.9, now + 0.03);

      this.safeSetValue(gain.gain, 0.12, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.045);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.045);
      osc2.stop(now + 0.045);
    } catch {
      // audio safety
    }
  }

  public playChickenHop(ratio: number = 0.5) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const validRatio = (typeof ratio === 'number' && Number.isFinite(ratio)) ? Math.max(0, Math.min(1, ratio)) : 0.5;
      const now = this.ctx.currentTime;
      const baseFreq = 300 + validRatio * 280;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      this.safeSetValue(osc.frequency, baseFreq, now);
      this.safeRampValue(osc.frequency, baseFreq * 1.8, now + 0.08);
      this.safeSetValue(gain.gain, 0.15, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // audio safety
    }
  }

  public playLudoStep() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      this.safeSetValue(osc.frequency, 520, now);
      this.safeRampValue(osc.frequency, 260, now + 0.06);
      this.safeSetValue(gain.gain, 0.12, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // audio safety
    }
  }

  public playLudoCapture() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      this.safeSetValue(osc.frequency, 220, now);
      this.safeRampValue(osc.frequency, 880, now + 0.2);
      this.safeSetValue(gain.gain, 0.2, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // audio safety
    }
  }

  public playJetFlight(multiplier: number = 1.0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const validMulti = (typeof multiplier === 'number' && Number.isFinite(multiplier) && multiplier > 1) ? multiplier : 1;
      const now = this.ctx.currentTime;
      const freq = Math.min(800, 180 + Math.log(validMulti) * 120);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      this.safeSetValue(osc.frequency, freq, now);
      this.safeSetValue(gain.gain, 0.04, now);
      this.safeRampValue(gain.gain, 0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // audio safety
    }
  }

  public playSuccess() {
    this.playCoin();
  }

  public playError() {
    this.playLose();
  }
}

export const soundService = new SoundFX();
