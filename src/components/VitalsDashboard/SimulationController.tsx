import React, { useState } from 'react';
import { Sliders, Terminal, Play, AlertTriangle, ShieldCheck, HeartPulse, UserX, Copy, Check, Radio } from 'lucide-react';
import type { VitalStatus } from '../../types/medical';
import { medicalAudio } from '../../utils/audio';

interface SimulationControllerProps {
  bpm: number;
  setBpm: (val: number) => void;
  resp: number;
  setResp: (val: number) => void;
  motion: number;
  setMotion: (val: number) => void;
  finger: boolean;
  setFinger: (val: boolean) => void;
  status: VitalStatus;
  triggerEmergencyAlert: (reason: string) => void;
}

export const SimulationController: React.FC<SimulationControllerProps> = ({
  bpm,
  setBpm,
  resp,
  setResp,
  motion,
  setMotion,
  finger,
  setFinger,
  status,
  triggerEmergencyAlert
}) => {
  const [copied, setCopied] = useState(false);

  // Serial JSON frame format specified by ESP32 firmware
  const currentJsonFrame = {
    bpm: finger ? bpm : 0,
    resp,
    finger,
    motion: Number(motion.toFixed(2)),
    fallAlert: status === 'CHUTE_DETECTEE' || status === 'MALAISE_IMMINENT',
    status
  };

  const jsonString = JSON.stringify(currentJsonFrame, null, 2);

  const handleCopyJson = () => {
    medicalAudio.playUiClick();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (
    newBpm: number,
    newResp: number,
    newMotion: number,
    hasFinger: boolean,
    isFall: boolean = false
  ) => {
    medicalAudio.playUiClick();
    setBpm(newBpm);
    setResp(newResp);
    setMotion(newMotion);
    setFinger(hasFinger);
    if (isFall) {
      triggerEmergencyAlert('Chute brutale détectée (Accélération > 2.5g) avec bradycardie réactionnelle');
    }
  };

  return (
    <div className="bg-[#0b1020]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide">
              Simulateur Clinique & Moniteur Série ESP32
            </h3>
            <p className="text-xs text-slate-400">
              Générez instantanément des profils hémodynamiques et d'urgence pour validation télémédicale
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono shadow-inner">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>UART: 115200 bauds • cycle 500 ms</span>
          </span>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="mt-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2.5">
          Scénarios Physiologiques & Événements Critiques
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => applyPreset(74, 16, 0.98, true)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Normal (74 BPM)</span>
          </button>

          <button
            onClick={() => applyPreset(132, 22, 1.15, true)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-500/50 text-slate-200 hover:text-rose-300 text-xs font-semibold transition cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Tachycardie (132)</span>
          </button>

          <button
            onClick={() => applyPreset(44, 11, 0.95, true)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/40 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 text-xs font-semibold transition cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <HeartPulse className="w-4 h-4 text-amber-400" />
            <span>Bradycardie (44)</span>
          </button>

          <button
            onClick={() => applyPreset(82, 7, 0.92, true)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Bradypnée (7)</span>
          </button>

          <button
            onClick={() => applyPreset(0, 14, 0.99, false)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <UserX className="w-4 h-4 text-slate-400" />
            <span>Doigt Retiré</span>
          </button>

          <button
            onClick={() => applyPreset(38, 9, 3.25, true, true)}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-rose-900/80 hover:from-rose-900 hover:to-rose-800 border-2 border-rose-500 text-white text-xs font-extrabold transition cursor-pointer shadow-lg shadow-rose-950/60 hover:scale-[1.02]"
          >
            <AlertTriangle className="w-4 h-4 text-rose-300 animate-bounce" />
            <span>Chute & Malaise</span>
          </button>
        </div>
      </div>

      {/* Sliders & Serial Monitor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pt-5 border-t border-slate-800/80">
        {/* Sliders Area (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
            Ajustement Analogique Précis
          </span>

          {/* BPM Slider */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Fréquence Cardiaque (BPM)</span>
              <span className="font-mono text-emerald-400 font-bold">{bpm} battements/min</span>
            </div>
            <input
              type="range"
              min={35}
              max={170}
              value={bpm}
              disabled={!finger}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer disabled:opacity-30"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>35 (Bradycardie sévère)</span>
              <span>60-100 (Normale)</span>
              <span>170 (Tachycardie extrême)</span>
            </div>
          </div>

          {/* Respiration Slider */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Fréquence Respiratoire (FR / CPM)</span>
              <span className="font-mono text-cyan-400 font-bold">{resp} cycles/min</span>
            </div>
            <input
              type="range"
              min={5}
              max={38}
              value={resp}
              onChange={(e) => setResp(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5 (Bradypnée)</span>
              <span>12-20 (Normale)</span>
              <span>38 (Tachypnée aiguë)</span>
            </div>
          </div>

          {/* Motion Slider */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Accélération Totale / Choc Thoracique (g)</span>
              <span className="font-mono text-indigo-400 font-bold">{motion.toFixed(2)} g</span>
            </div>
            <input
              type="range"
              min={0.8}
              max={4.0}
              step={0.05}
              value={motion}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMotion(val);
                if (val >= 2.5) {
                  triggerEmergencyAlert('Pic d\'impact supérieur à 2.5g détecté sur le MPU6050');
                }
              }}
              className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.0g (Repos)</span>
              <span className="text-rose-400">&gt; 2.5g (Seuil critique de chute)</span>
              <span>4.0g</span>
            </div>
          </div>

          {/* Toggle Finger */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-300 font-medium">
              Détecteur de Présence Doigt (MAX30102)
            </span>
            <button
              onClick={() => {
                medicalAudio.playUiClick();
                setFinger(!finger);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                finger
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
              }`}
            >
              {finger ? 'DOIGT DÉTECTÉ (OK)' : 'DOIGT ABSENT (ALERTE)'}
            </button>
          </div>
        </div>

        {/* Live Serial JSON Monitor (1 col) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs flex flex-col justify-between shadow-inner">
          <div>
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2 mb-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">Trame Série JSON ESP32</span>
              </div>
              <button
                onClick={handleCopyJson}
                className="hover:text-white transition text-xs flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 text-[11px] leading-relaxed overflow-x-auto selection:bg-emerald-950/80">
              {jsonString}
            </pre>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
            <span>UART: 115200 bps (500 ms)</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Flux Actif</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
