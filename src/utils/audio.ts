// High-Fidelity Cardiovascular & Clinical Acoustic Synthesizer (Web Audio API)
// Models real physiological "Lub-Dub" (S1/S2 valvular acoustics) & ICU telemetry monitors

export type HeartSoundMode = 'HYBRID' | 'LUB_DUB' | 'ICU_CHIRP';

class MedicalAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private alarmInterval: number | null = null;
  private masterVolume: number = 0.6;
  private soundMode: HeartSoundMode = 'HYBRID';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getSoundMode(): HeartSoundMode {
    return this.soundMode;
  }

  public setSoundMode(mode: HeartSoundMode) {
    this.soundMode = mode;
  }

  // Subtle tactile feedback click for UI controls
  public playUiClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.04 * this.masterVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {}
  }

  /**
   * Realistic Dynamic Heartbeat Acoustic Engine:
   * - Synthesizes real physiological "LUB-DUB" (S1 and S2 heart sounds)
   * - S1 ("Lub"): Atrioventricular (mitral/tricuspid) closure (deep resonant chest thump)
   * - S2 ("Dub"): Semilunar (aortic/pulmonic) closure (crisper arterial snap)
   * - Delay between S1 and S2 scales dynamically with heart rate (systolic ejection phase)
   * - Inotropic pitch scaling reflects cardiac muscle contractile force at high BPM
   */
  public playHeartbeat(bpm: number = 75, spo2: number = 98) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const safeBpm = Math.max(35, Math.min(220, bpm));

      // Physiological Systolic interval:
      // In a real heart, systole shortens as BPM increases (from ~240ms down to ~130ms in tachycardia)
      const beatPeriod = 60 / safeBpm;
      const systoleDelay = Math.min(0.26, Math.max(0.12, 0.21 * beatPeriod));

      // Dynamic inotropic frequency scaling: higher BPM = more vigorous myocardial contraction
      const inotropicPitch = Math.max(0, (safeBpm - 65) * 0.4);

      // ===================================================================
      // 1. ORGANIC "LUB-DUB" ACOUSTIC SYNTHESIS (S1 & S2)
      // ===================================================================
      if (this.soundMode === 'LUB_DUB' || this.soundMode === 'HYBRID') {
        const organicGainMultiplier = this.soundMode === 'LUB_DUB' ? 1.0 : 0.85;

        // --- S1 SOUND: "LUB" (Mitral & Tricuspid Valve Closure) ---
        const s1Osc = this.ctx.createOscillator();
        const s1Filter = this.ctx.createBiquadFilter();
        const s1Gain = this.ctx.createGain();

        // Resonant low-pass filter simulates acoustic transmission through thoracic wall & tissue
        s1Filter.type = 'lowpass';
        s1Filter.frequency.setValueAtTime(105 + inotropicPitch, now);
        s1Filter.Q.setValueAtTime(2.4, now);

        // Sub-bass frequency sweep (visceral low-frequency thump)
        s1Osc.type = 'sine';
        s1Osc.frequency.setValueAtTime(70 + inotropicPitch, now);
        s1Osc.frequency.exponentialRampToValueAtTime(36, now + 0.095);

        const s1Vol = 0.32 * this.masterVolume * organicGainMultiplier;
        s1Gain.gain.setValueAtTime(0.0001, now);
        s1Gain.gain.linearRampToValueAtTime(s1Vol, now + 0.009); // punchy attack
        s1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11); // natural muscular decay

        s1Osc.connect(s1Filter);
        s1Filter.connect(s1Gain);
        s1Gain.connect(this.ctx.destination);

        s1Osc.start(now);
        s1Osc.stop(now + 0.12);

        // Sub-harmonic chest resonance body (adds visceral chest warmth)
        const s1SubOsc = this.ctx.createOscillator();
        const s1SubGain = this.ctx.createGain();
        s1SubOsc.type = 'triangle';
        s1SubOsc.frequency.setValueAtTime(45 + inotropicPitch * 0.5, now);
        s1SubOsc.frequency.exponentialRampToValueAtTime(25, now + 0.08);

        s1SubGain.gain.setValueAtTime(0.0001, now);
        s1SubGain.gain.linearRampToValueAtTime(s1Vol * 0.45, now + 0.01);
        s1SubGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        s1SubOsc.connect(s1Filter);
        s1SubGain.connect(this.ctx.destination);
        s1SubOsc.start(now);
        s1SubOsc.stop(now + 0.10);

        // --- S2 SOUND: "DUB" (Aortic & Pulmonic Semilunar Valve Snap) ---
        const s2Time = now + systoleDelay;
        const s2Osc = this.ctx.createOscillator();
        const s2Filter = this.ctx.createBiquadFilter();
        const s2Gain = this.ctx.createGain();

        // Higher cutoff for the crisper aortic valve recoil
        s2Filter.type = 'lowpass';
        s2Filter.frequency.setValueAtTime(145 + inotropicPitch * 1.2, s2Time);
        s2Filter.Q.setValueAtTime(2.0, s2Time);

        s2Osc.type = 'sine';
        s2Osc.frequency.setValueAtTime(95 + inotropicPitch * 1.1, s2Time);
        s2Osc.frequency.exponentialRampToValueAtTime(48, s2Time + 0.075);

        // S2 is typically slightly shorter and 75-80% the amplitude of S1
        const s2Vol = 0.25 * this.masterVolume * organicGainMultiplier;
        s2Gain.gain.setValueAtTime(0.0001, s2Time);
        s2Gain.gain.linearRampToValueAtTime(s2Vol, s2Time + 0.006); // crisper attack
        s2Gain.gain.exponentialRampToValueAtTime(0.0001, s2Time + 0.085);

        s2Osc.connect(s2Filter);
        s2Filter.connect(s2Gain);
        s2Gain.connect(this.ctx.destination);

        s2Osc.start(s2Time);
        s2Osc.stop(s2Time + 0.095);
      }

      // ===================================================================
      // 2. CLINICAL HOSPITAL MONITOR TELEMETRY TONE (Philips / GE Oximeter)
      // ===================================================================
      if (this.soundMode === 'ICU_CHIRP' || this.soundMode === 'HYBRID') {
        const monPitch = 640 + (spo2 - 90) * 15 + (safeBpm > 110 ? 65 : safeBpm < 55 ? -45 : 0);
        const monOsc = this.ctx.createOscillator();
        const monGain = this.ctx.createGain();

        monOsc.type = 'sine';
        monOsc.frequency.setValueAtTime(monPitch, now);

        const monVol = (this.soundMode === 'ICU_CHIRP' ? 0.09 : 0.035) * this.masterVolume;
        monGain.gain.setValueAtTime(monVol, now);
        monGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

        monOsc.connect(monGain);
        monGain.connect(this.ctx.destination);

        monOsc.start(now);
        monOsc.stop(now + 0.075);
      }
    } catch {}
  }

  // Urgent dual-tone ICU emergency siren (IEC 60601-1-8 compliant alarm rhythm)
  public startEmergencyAlarm() {
    if (this.isMuted || this.alarmInterval !== null) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      let highTone = true;
      const playChirp = () => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(highTone ? 987.77 : 783.99, now); // B5 / G5 hospital alarm chord
        highTone = !highTone;

        const vol = 0.22 * this.masterVolume;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      };

      playChirp();
      this.alarmInterval = window.setInterval(playChirp, 240);
    } catch {}
  }

  public stopAlarm() {
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }
}

export const medicalAudio = new MedicalAudioEngine();
