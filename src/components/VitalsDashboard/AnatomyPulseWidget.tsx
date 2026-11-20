import React, { useState, useEffect } from 'react';
import { Wind, Activity, Compass, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

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
  // Cardiac pulse period for optical PPG indicator
  const cardiacSec = bpm > 0 && finger ? (60 / bpm).toFixed(2) : '0.8';

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
              CINÉTIQUE RESPIRATOIRE & BIOMÉCANIQUE CLINIQUE
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
          <div className="w-full flex justify-between items-center text-xs font-mono">
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
          <div className="my-4 relative flex items-center justify-center w-full h-44">
            <svg viewBox="0 0 200 200" className="w-44 h-44 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.25)]">
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
          <div className="w-full grid grid-cols-2 gap-2 text-center text-xs font-mono border-t border-slate-900 pt-3">
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

        {/* PANEL 2: Holographic Pleuro-Pulmonary Dynamics (Lungs) */}
        <div className="bg-[#050813]/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-cyan-500/50 transition-all duration-300 shadow-lg">
          <div className="w-full flex justify-between items-center text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>Expansion Pulmonaire</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
              {resp} CPM
            </span>
          </div>

          {/* Holographic Lungs Visualizer */}
          <div className="my-2 relative flex items-center justify-center w-full h-48 overflow-hidden">
            {/* Ambient Cyan Bioluminescent Aura */}
            <div
              className="absolute w-36 h-36 rounded-full bg-cyan-500/15 blur-2xl transition-all pointer-events-none"
              style={{
                animation: resp > 0 ? `ping ${respRateSec}s cubic-bezier(0, 0, 0.2, 1) infinite` : 'none'
              }}
            />

            {/* High-Precision Anatomical Lung Graphic with Bronchial Arborization */}
            <svg
              viewBox="0 0 200 200"
              className="w-44 h-44 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.45)]"
              style={{
                animation: resp > 0 ? `breathingPulseGlow ${respRateSec}s ease-in-out infinite` : 'none',
                transformOrigin: 'center center'
              }}
            >
              <defs>
                {/* Lobe Bioluminescent Gradient */}
                <linearGradient id="lungHoloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#0284c7" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0.4" />
                </linearGradient>

                {/* Bronchial Tree Glow Gradient */}
                <linearGradient id="bronchiGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Larynx / Thyroid Cartilage */}
              <rect x="94" y="16" width="12" height="10" rx="3" fill="#38bdf8" opacity="0.9" />
              
              {/* Trachea with segmented cartilaginous rings */}
              <line x1="100" y1="26" x2="100" y2="70" stroke="url(#bronchiGlow)" strokeWidth="6" strokeLinecap="round" />
              {[32, 40, 48, 56, 64].map((y) => (
                <line key={y} x1="93" y1={y} x2="107" y2={y} stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
              ))}

              {/* Carina Bifurcation & Main Bronchi */}
              <path d="M100,70 Q92,78 78,92" fill="none" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
              <path d="M100,70 Q108,78 122,92" fill="none" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />

              {/* RIGHT LUNG (Trilobed: Superior, Middle, Inferior) */}
              <path
                d="M74,78 
                   C60,70 42,80 34,102 
                   C26,124 28,150 44,166 
                   C58,178 78,172 84,158 
                   C88,144 88,102 84,86 
                   Z"
                fill="url(#lungHoloGrad)"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Interlobar Fissures (Right) */}
              <path d="M34,115 Q56,122 84,120" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />
              <path d="M42,145 Q64,142 82,148" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />

              {/* LEFT LUNG (Bilobed with Cardiac Notch) */}
              <path
                d="M126,78 
                   C140,70 158,80 166,102 
                   C174,124 172,150 156,166 
                   C142,178 126,170 120,152 
                   C115,138 116,118 120,105 
                   C122,94 122,86 126,78 
                   Z"
                fill="url(#lungHoloGrad)"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Oblique Fissure (Left) */}
              <path d="M162,118 Q140,135 120,146" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />

              {/* Secondary & Tertiary Bronchial Arborization Lines */}
              {/* Right branches */}
              <path d="M78,92 Q62,105 48,118" fill="none" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
              <path d="M78,92 Q72,118 68,142" fill="none" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
              <path d="M48,118 Q40,130 38,140" fill="none" stroke="#e0f2fe" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M68,142 Q60,154 54,162" fill="none" stroke="#e0f2fe" strokeWidth="1.2" strokeLinecap="round" />

              {/* Left branches */}
              <path d="M122,92 Q138,105 152,118" fill="none" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
              <path d="M122,92 Q128,118 132,142" fill="none" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
              <path d="M152,118 Q160,130 162,140" fill="none" stroke="#e0f2fe" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M132,142 Q140,154 146,162" fill="none" stroke="#e0f2fe" strokeWidth="1.2" strokeLinecap="round" />

              {/* Airway Inhalation Flow Points (Glowing cyan nodes) */}
              <circle cx="100" cy="70" r="3" fill="#ffffff" />
              <circle cx="78" cy="92" r="2.5" fill="#38bdf8" />
              <circle cx="122" cy="92" r="2.5" fill="#38bdf8" />
              <circle cx="48" cy="118" r="2" fill="#7dd3fc" />
              <circle cx="152" cy="118" r="2" fill="#7dd3fc" />
            </svg>
          </div>

          {/* Metric Telemetry Footer */}
          <div className="w-full grid grid-cols-2 gap-2 text-center text-xs font-mono border-t border-slate-900 pt-3">
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

        {/* PANEL 3: Futuristic Holographic Mannequin & Sensor Mapping */}
        <div className="bg-[#050813]/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-emerald-500/50 transition-all duration-300 shadow-lg overflow-hidden">
          <div className="w-full flex justify-between items-center text-xs font-mono">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Cartographie Anatomique</span>
            </span>
            <span className="text-emerald-400 flex items-center space-x-1 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Nœuds Synchronisés</span>
            </span>
          </div>

          {/* Futuristic Biometric Cybernetic Mannequin */}
          <div className="my-2 relative flex items-center justify-center w-full h-48">
            {/* Hologram Scanner Vertical Bar */}
            <div className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-hologram-scan pointer-events-none z-10" />

            <svg viewBox="0 0 160 210" className="w-36 h-48 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              {/* Coordinate Grid Lines */}
              <line x1="20" y1="105" x2="140" y2="105" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="80" y1="20" x2="80" y2="190" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Anatomical Human Body Contour */}
              {/* Cranium & Neck */}
              <circle cx="80" cy="28" r="14" fill="#070d1d" stroke="#475569" strokeWidth="1.5" />
              <path d="M75,42 L75,50 M85,42 L85,50" stroke="#475569" strokeWidth="1.5" />

              {/* Torso & Pelvis */}
              <path
                d="M62,50 
                   C54,54 48,68 50,95 
                   C52,118 56,128 60,138 
                   L100,138 
                   C104,128 108,118 110,95 
                   C112,68 106,54 98,50 
                   Z"
                fill="#070d1d"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Clavicles & Ribcage Arc */}
              <path d="M64,56 Q80,62 96,56" fill="none" stroke="#334155" strokeWidth="1.2" />
              <path d="M60,76 Q80,84 100,76" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              <path d="M62,94 Q80,102 98,94" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

              {/* Left Arm & Forearm reaching down to index finger */}
              <path d="M62,50 L42,90 L34,125" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              {/* Right Arm */}
              <path d="M98,50 L118,90 L126,125" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

              {/* Legs */}
              <path d="M68,138 L64,180 L62,202" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M92,138 L96,180 L98,202" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

              {/* SENSOR 1: MPU6050 Thoracic Node on Sternum (cx: 80, cy: 78) */}
              <circle cx="80" cy="78" r="14" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" className="animate-spin" />
              <circle cx="80" cy="78" r="8" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" strokeWidth="1.5" />
              <circle cx="80" cy="78" r="3.5" fill="#06b6d4" className="animate-ping" />
              
              {/* High-tech target reticle over Sternum */}
              <line x1="80" y1="68" x2="80" y2="88" stroke="#38bdf8" strokeWidth="1" />
              <line x1="70" y1="78" x2="90" y2="78" stroke="#38bdf8" strokeWidth="1" />

              {/* Callout Line & Label for MPU6050 */}
              <polyline points="88,74 135,55 155,55" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="155" cy="55" r="2" fill="#06b6d4" />
              <text x="135" y="48" fill="#38bdf8" fontSize="7" fontFamily="monospace" fontWeight="bold">MPU6050</text>
              <text x="135" y="65" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">Sternum (6-DOF)</text>

              {/* SENSOR 2: MAX30102 Optical PPG on Left Finger (cx: 34, cy: 125) */}
              <circle cx="34" cy="125" r="12" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" className="animate-spin" />
              <circle 
                cx="34" 
                cy="125" 
                r="6" 
                fill="rgba(244,63,94,0.3)" 
                stroke="#f43f5e" 
                strokeWidth="1.5"
                style={{
                  animation: bpm > 0 && finger ? `ping ${cardiacSec}s cubic-bezier(0, 0, 0.2, 1) infinite` : 'none'
                }}
              />
              <circle cx="34" cy="125" r="3.5" fill="#f43f5e" />

              {/* Callout Line & Label for MAX30102 */}
              <polyline points="30,128 15,152 2,152" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="2" cy="152" r="2" fill="#f43f5e" />
              <text x="5" y="146" fill="#fb7185" fontSize="7" fontFamily="monospace" fontWeight="bold">MAX30102</text>
              <text x="5" y="160" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">Doigt (PPG/FC)</text>
            </svg>
          </div>

          {/* Metric Telemetry Footer */}
          <div className="w-full flex items-center justify-between text-xs font-mono border-t border-slate-900 pt-3 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span className="text-[11px] font-semibold text-slate-300">Pouls Digital (PPG)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className="text-[11px] font-semibold text-slate-300">Respiration & Chute (Thorax)</span>
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
