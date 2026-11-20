import React, { useState, useEffect } from 'react';
import { Wind, Activity, Compass, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { Lungs3DCanvas } from './Lungs3DCanvas';
import { Anatomy3DCanvas } from './Anatomy3DCanvas';

interface AnatomyPulseWidgetProps {
  bpm: number;
  resp: number;
  motion: number;
  finger: boolean;
  status: string;
}

export const AnatomyPulseWidget: React.FC<AnatomyPulseWidgetProps> = ({
  bpm,
  resp,
  motion,
  finger,
  status
}) => {
  // Respiratory cycle timing (seconds per breath)
  const respRateSec = resp > 0 ? (60 / resp).toFixed(2) : '4.0';
  // Minute ventilation estimate (Vt ~ 500 mL)
  const minuteVentilation = resp > 0 ? (resp * 0.5).toFixed(1) : '0.0';

  const isAlarm = status.includes('CHUTE') || status.includes('MALAISE') || motion >= 2.5;

  // Real-time micro-angle excursion simulating thoracic tidal respiration or sudden fall
  const [liveAngle, setLiveAngle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (motion >= 2.5 || status.includes('CHUTE')) {
        setLiveAngle(88.4);
      } else {
        // Subtle physiological thoracic oscillation (+/- 1.4°)
        const base = Math.sin(Date.now() / 900) * 1.6;
        setLiveAngle(parseFloat(base.toFixed(1)));
      }
    }, 150);
    return () => clearInterval(timer);
  }, [motion, status]);

  return (
    <div className="bg-gradient-to-br from-[#070c18] via-[#050811] to-[#080e1e] border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background ambient medical glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block">
              CINÉTIQUE RESPIRATOIRE & BIOMÉCANIQUE 3D
            </span>
            <h3 className="text-base font-extrabold text-white tracking-wide">
              Dynamique Pleuro-Pulmonaire & Inclinométrie 6-DOF
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${finger ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span className="text-[11px] font-semibold">{finger ? 'Flux Bio-Optique Actif' : 'En Attente Capteur'}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold hidden md:inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Télémétrie I2C 400 kHz</span>
          </span>
        </div>
      </div>

      {/* Grid: 3 Interactive Bio Panels (High-Tech HUD styling matching 3D heart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* PANEL 1: Aviation / ICU Gyroscopic Attitude Inclinometer */}
        <div className="bg-[#050813]/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-cyan-500/50 transition-all duration-300 shadow-lg">
          <div className="w-full flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Inclinomètre Postural</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              motion >= 2.5 || status.includes('CHUTE') 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              MPU6050
            </span>
          </div>

          {/* Gyroscopic Artificial Horizon Dial */}
          <div className="my-2 relative flex items-center justify-center w-full h-52">
            <svg viewBox="0 0 200 200" className="w-48 h-48 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              {/* Outer Dial Ring */}
              <circle cx="100" cy="100" r="90" fill="#030611" stroke="#1e293b" strokeWidth="2" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Pitch Graduation Ticks */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="100"
                  y1="12"
                  x2="100"
                  y2={deg % 90 === 0 ? "22" : "17"}
                  stroke={deg % 90 === 0 ? "#06b6d4" : "#475569"}
                  strokeWidth={deg % 90 === 0 ? "2" : "1"}
                  transform={`rotate(${deg} 100 100)`}
                />
              ))}

              {/* Artificial Horizon Pitch Line (Rotates with dynamic live angle) */}
              <g transform={`rotate(${liveAngle * 2.5} 100 100)`} className="transition-transform duration-300">
                {/* Horizon Sky/Ground Divider */}
                <line x1="25" y1="100" x2="175" y2="100" stroke={motion >= 2.5 ? "#f43f5e" : "#06b6d4"} strokeWidth="2.5" />
                <line x1="60" y1="85" x2="140" y2="85" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
                <line x1="75" y1="70" x2="125" y2="70" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
                <line x1="60" y1="115" x2="140" y2="115" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
                <line x1="75" y1="130" x2="125" y2="130" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
              </g>

              {/* Fixed Aircraft / Center Reference Crosshair */}
              <circle cx="100" cy="100" r="5" fill="#f59e0b" stroke="#050811" strokeWidth="2" />
              <path d="M70,100 L90,100 L95,108 M130,100 L110,100 L105,108" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

              {/* Digital Angle Overlay inside dial */}
              <text x="100" y="160" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontFamily="monospace" fontWeight="bold">
                {liveAngle > 0 ? `+${liveAngle}°` : `${liveAngle}°`}
              </text>
            </svg>

            {/* Radar sweep ambient ring */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 pointer-events-none" />
          </div>

          {/* Metric Telemetry Footer */}
          <div className="w-full grid grid-cols-2 gap-2 text-center text-xs font-mono border-t border-slate-900 pt-3 mt-2">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2">
              <span className="text-[10px] text-slate-400 block">Accélération Triaxiale</span>
              <strong className={`text-sm ${motion >= 2.5 ? 'text-rose-400 font-black' : 'text-cyan-300'}`}>
                {motion.toFixed(2)} g
              </strong>
            </div>
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2">
              <span className="text-[10px] text-slate-400 block">Posture Clinique</span>
              <strong className={`text-sm ${motion >= 2.5 || status.includes('CHUTE') ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                {motion >= 2.5 || status.includes('CHUTE') ? 'Décubitus Brutal' : 'Orthostatique'}
              </strong>
            </div>
          </div>
        </div>

        {/* PANEL 2: Real 3D WebGL Lungs (Volumetric Respiration) */}
        <div className="bg-[#050813]/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-cyan-500/50 transition-all duration-300 shadow-lg">
          <div className="w-full flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>Expansion Pleuro-Pulmonaire</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
              {resp} CPM
            </span>
          </div>

          {/* Real 3D WebGL Lungs Canvas */}
          <div className="my-1 w-full">
            <Lungs3DCanvas resp={resp} finger={finger} isAlarmActive={isAlarm} />
          </div>

          {/* Metric Telemetry Footer */}
          <div className="w-full grid grid-cols-2 gap-2 text-center text-xs font-mono border-t border-slate-900 pt-3 mt-2">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2">
              <span className="text-[10px] text-slate-400 block">Cycle Respiratoire</span>
              <strong className="text-cyan-300 text-sm font-bold">
                {respRateSec} s / cycle
              </strong>
            </div>
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2">
              <span className="text-[10px] text-slate-400 block">Débit Minute Est. (V_E)</span>
              <strong className="text-cyan-300 text-sm font-bold">
                {minuteVentilation} L/min
              </strong>
            </div>
          </div>
        </div>

        {/* PANEL 3: Real 3D WebGL Holographic Mannequin & Sensor Mapping */}
        <div className="bg-[#050813]/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-emerald-500/50 transition-all duration-300 shadow-lg overflow-hidden">
          <div className="w-full flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Cartographie Corporelle 3D</span>
            </span>
            <span className="text-emerald-400 flex items-center space-x-1 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Nœuds Synchronisés</span>
            </span>
          </div>

          {/* Real 3D WebGL Human Anatomy Canvas */}
          <div className="my-1 w-full">
            <Anatomy3DCanvas bpm={bpm} finger={finger} motion={motion} isAlarmActive={isAlarm} />
          </div>

          {/* Metric Telemetry Footer */}
          <div className="w-full flex items-center justify-between text-xs font-mono border-t border-slate-900 pt-3 mt-2 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span className="text-[11px] font-semibold text-slate-300">MAX30102 (Doigt)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className="text-[11px] font-semibold text-slate-300">MPU6050 (Sternum)</span>
            </span>
          </div>
        </div>

      </div>

      {/* Global Clinical Status Banner (Elevated to Hospital Standards, No raw GPIO pin dumps) */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2.5">
          <span className="text-slate-400">Statut Hémodynamique :</span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1.5 ${
            isAlarm 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}>
            {isAlarm ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>ANOMALIE CLINIQUE OU IMPACT DÉTECTÉ</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PARAMÈTRES PHYSIOLOGIQUES STABLES</span>
              </>
            )}
          </span>
        </div>
        
        {/* Real medical reference standards */}
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span className="text-cyan-400 font-semibold">Cibles Physiologiques :</span>
          <span>Eupnée 12-20 CPM</span>
          <span className="text-slate-700">•</span>
          <span>Posture 0° ± 5°</span>
          <span className="text-slate-700">•</span>
          <span>Excursion Symétrique</span>
        </div>
      </div>
    </div>
  );
};
