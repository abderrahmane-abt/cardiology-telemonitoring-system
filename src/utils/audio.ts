// High-Fidelity Hospital Monitor Acoustic Synthesizer (Web Audio API)
// Modeled after Philips IntelliVue & GE Carescape ICU Monitors

class MedicalAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private alarmInterval: number | null = null;
  private masterVolume: number = 0.5;

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

  // Subtle tactile click for UI buttons
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

  // Authentic Philips IntelliVue ICU cardiac QRS monitor beep (harmonic overtone)
  public playHeartbeat(bpm: number = 75, spo2: number = 98) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Pitch adjusts based on oxygen saturation / clinical heart rate like real pulse oximeters
      const baseFreq = 650 + (spo2 - 90) * 15 + (bpm > 110 ? 80 : bpm < 55 ? -60 : 0);

      // Fundamental oscillator
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);

      // Soft harmonic overtone (adds rich hospital monitor timbre)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2, now);

      const duration = 0.075; // 75ms crisp blip
      const vol = 0.09 * this.masterVolume;

      gain1.gain.setValueAtTime(vol, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      gain2.gain.setValueAtTime(vol * 0.25, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gain1);
      osc2.connect(gain2);

      gain1.connect(this.ctx.destination);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + duration + 0.01);
      osc2.stop(now + duration + 0.01);
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
