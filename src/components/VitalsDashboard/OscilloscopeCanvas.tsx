import React, { useEffect, useRef, useState } from 'react';
import { Activity, Wind, AlertCircle, Pause, Play, ZoomIn, SlidersHorizontal } from 'lucide-react';
import { medicalAudio } from '../../utils/audio';

interface OscilloscopeProps {
  bpm: number;
  resp: number;
  finger: boolean;
  isAlarmActive: boolean;
  soundEnabled: boolean;
}

export const OscilloscopeCanvas: React.FC<OscilloscopeProps> = ({
  bpm,
  resp,
  finger,
  isAlarmActive,
  soundEnabled
}) => {
  const ppgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const respCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isFrozen, setIsFrozen] = useState(false);
  const [gain, setGain] = useState<number>(1.0);
  const [speed, setSpeed] = useState<number>(1.0);

  const lastBeatTimeRef = useRef<number>(performance.now());
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const respRef = useRef(resp);
  respRef.current = resp;
  const fingerRef = useRef(finger);
  fingerRef.current = finger;
  const isFrozenRef = useRef(isFrozen);
  isFrozenRef.current = isFrozen;
  const gainRef = useRef(gain);
  gainRef.current = gain;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Real-time 60fps animation loop with phosphor glow
  useEffect(() => {
    let animId: number;
    let t = 0;

    const ppgBuffer: number[] = new Array(320).fill(0);
    const respBuffer: number[] = new Array(320).fill(0);

    const render = (now: number) => {
      const currentBpm = bpmRef.current;
      const currentResp = respRef.current;
      const hasFinger = fingerRef.current;
      const frozen = isFrozenRef.current;
      const currentGain = gainRef.current;
      const currentSpeed = speedRef.current;

      if (!frozen) {
        t += 0.016 * currentSpeed;

        // 1. Calculate PPG Waveform Sample with Physiological Dicrotic Notch
        let ppgVal = 0;
        if (hasFinger && currentBpm > 0) {
          const beatPeriod = 60 / currentBpm;
          const phase = (t % beatPeriod) / beatPeriod;

          if (phase < 0.22) {
            // Rapid systolic ejection
            const sub = phase / 0.22;
            ppgVal = Math.sin(sub * Math.PI * 0.5);
          } else if (phase < 0.42) {
            // Systolic decline towards incisura
            const sub = (phase - 0.22) / 0.2;
            ppgVal = 1 - 0.58 * Math.sin(sub * Math.PI * 0.5);
          } else if (phase < 0.62) {
            // Dicrotic peak (aortic valve rebound)
            const sub = (phase - 0.42) / 0.2;
            ppgVal = 0.42 + 0.22 * Math.sin(sub * Math.PI);
          } else {
            // Diastolic runoff decay
            const sub = (phase - 0.62) / 0.38;
            ppgVal = 0.42 * Math.exp(-sub * 3.2);
          }

          // Trigger harmonic ICU cardiac beep
          const timeSinceLastBeat = (now - lastBeatTimeRef.current) / 1000;
          if (timeSinceLastBeat >= beatPeriod * 0.94) {
            lastBeatTimeRef.current = now;
            if (soundEnabledRef.current && !isAlarmActive) {
              medicalAudio.playHeartbeat(currentBpm, 98);
            }
          }
        } else {
          // Flatline electrical noise
          ppgVal = (Math.random() - 0.5) * 0.03;
        }

        ppgBuffer.push(ppgVal * currentGain);
        if (ppgBuffer.length > 320) ppgBuffer.shift();

        // 2. Calculate Respiration Sample
        let respVal = 0;
        if (currentResp > 0) {
          const respPeriod = 60 / currentResp;
          const respPhase = (t % respPeriod) / respPeriod;
          if (respPhase < 0.4) {
            respVal = 0.5 - 0.5 * Math.cos((respPhase / 0.4) * Math.PI);
          } else {
            respVal = 0.5 + 0.5 * Math.cos(((respPhase - 0.4) / 0.6) * Math.PI);
          }
        }
        respBuffer.push(respVal * currentGain);
        if (respBuffer.length > 320) respBuffer.shift();
      }

      // --- Draw Phosphor PPG Canvas ---
      const ppgCanvas = ppgCanvasRef.current;
      if (ppgCanvas) {
        const ctx = ppgCanvas.getContext('2d');
        if (ctx) {
          const w = ppgCanvas.width;
          const h = ppgCanvas.height;

          ctx.clearRect(0, 0, w, h);

          // Subtle background gradient under the curve
          const step = w / (ppgBuffer.length - 1);
          const midY = h * 0.85;
          const amplitude = h * 0.7;

          // Gradient fill
          if (hasFinger) {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
            grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

            ctx.beginPath();
            ctx.moveTo(0, midY);
            ppgBuffer.forEach((val, i) => {
              const x = i * step;
              const y = midY - val * amplitude;
              ctx.lineTo(x, y);
            });
            ctx.lineTo(w, midY);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
          }

          // Phosphor Glowing Beam line
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = hasFinger ? '#10b981' : '#64748b';
          ctx.shadowColor = hasFinger ? '#34d399' : 'transparent';
          ctx.shadowBlur = 10;

          ppgBuffer.forEach((val, i) => {
            const x = i * step;
            const y = midY - val * amplitude;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Sweeping dot head
          if (ppgBuffer.length > 0 && hasFinger && !frozen) {
            const lastVal = ppgBuffer[ppgBuffer.length - 1];
            const lx = (ppgBuffer.length - 1) * step;
            const ly = midY - lastVal * amplitude;
            ctx.beginPath();
            ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#6ee7b7';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 16;
            ctx.fill();
          }
        }
      }

      // --- Draw Respiration Canvas ---
      const respCanvas = respCanvasRef.current;
      if (respCanvas) {
        const ctx = respCanvas.getContext('2d');
        if (ctx) {
          const w = respCanvas.width;
          const h = respCanvas.height;

          ctx.clearRect(0, 0, w, h);

          const step = w / (respBuffer.length - 1);
          const midY = h * 0.85;
          const amplitude = h * 0.65;

          // Gradient fill
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

          ctx.beginPath();
          ctx.moveTo(0, midY);
          respBuffer.forEach((val, i) => {
            const x = i * step;
            const y = midY - val * amplitude;
            ctx.lineTo(x, y);
          });
          ctx.lineTo(w, midY);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();

          // Main line
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#06b6d4';
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 10;

          respBuffer.forEach((val, i) => {
            const x = i * step;
            const y = midY - val * amplitude;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Sweeping dot head
          if (respBuffer.length > 0 && !frozen) {
            const lastVal = respBuffer[respBuffer.length - 1];
            const lx = (respBuffer.length - 1) * step;
            const ly = midY - lastVal * amplitude;
            ctx.beginPath();
            ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#a5f3fc';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 16;
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isAlarmActive]);

  const toggleFreeze = () => {
    medicalAudio.playUiClick();
    setIsFrozen(!isFrozen);
  };

  const cycleGain = () => {
    medicalAudio.playUiClick();
    setGain((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 0.75 : 1.0));
  };

  const cycleSpeed = () => {
    medicalAudio.playUiClick();
    setSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 0.75 : 1.0));
  };

  return (
    <div className="space-y-4">
      {/* Top Oscilloscope Toolbar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white font-bold">OSCILLOSCOPES BIOMÉDICAUX CLINIQUE</span>
          <span className="text-slate-600">|</span>
          <span>Dicrote Artérielle & Expansion Thoracique</span>
        </div>

        {/* Oscilloscope Interactive Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFreeze}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              isFrozen
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isFrozen ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isFrozen ? 'REPRENDRE' : 'GELER TRACÉ'}</span>
          </button>

          <button
            onClick={cycleGain}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gain: {gain}x</span>
          </button>

          <button
            onClick={cycleSpeed}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{speed === 1.0 ? '25 mm/s' : speed === 1.5 ? '50 mm/s' : '12.5 mm/s'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Canvases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waveform 1: PPG Pulse Wave */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                  Onde Pléthysmographique PPG
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  MAX30102 • IR 880nm • Échantillonnage 100 Hz
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-extrabold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-inner">
                {finger ? `${bpm} BPM` : 'DÉCONNECTÉ'}
              </span>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 ecg-grid">
            <div className="scanline" />
            <canvas
              ref={ppgCanvasRef}
              width={640}
              height={144}
              className="w-full h-full block"
            />
            {!finger && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center space-x-2 text-amber-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 animate-bounce" />
                <span>Capteur non en contact avec le doigt (Vérifier MAX30102)</span>
              </div>
            )}
            {isFrozen && (
              <div className="absolute top-2 right-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold">
                Tracé Figé (Analyse)
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400 font-mono">
            <span>Encoche dicrote artérielle identifiable</span>
            <span className="text-emerald-400">Indice de perfusion : 4.2%</span>
          </div>
        </div>

        {/* Waveform 2: Thoracic Respiration Curve */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                  Dynamique Respiratoire Thoracique
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Inclinométrie MPU6050 (GY-521) • Accélérométrie 25 Hz
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-extrabold text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2.5 py-0.5 rounded-full shadow-inner">
                {resp} CPM
              </span>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 resp-grid">
            <canvas
              ref={respCanvasRef}
              width={640}
              height={144}
              className="w-full h-full block"
            />
            {isFrozen && (
              <div className="absolute top-2 right-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold">
                Tracé Figé (Analyse)
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400 font-mono">
            <span>Inspiration (40%) / Expiration (60%)</span>
            <span className="text-cyan-400">Seuil détection: Δθ &gt; 0.15°</span>
          </div>
        </div>
      </div>
    </div>
  );
};
