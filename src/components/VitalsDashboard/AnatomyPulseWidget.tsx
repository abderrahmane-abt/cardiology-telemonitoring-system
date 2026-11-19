import React from 'react';
import { Wind, Activity, Compass, CheckCircle2 } from 'lucide-react';

interface AnatomyPulseWidgetProps {
  bpm: number;
  resp: number;
  motion: number;
  finger: boolean;
  status: string;
}

export const AnatomyPulseWidget: React.FC<AnatomyPulseWidgetProps> = ({
  resp,
  motion,
  finger,
  status
}) => {
  // Compute respiratory cycle duration
  const respRateSec = resp > 0 ? (60 / resp).toFixed(2) : '4';
  const isAlarm = status.includes('CHUTE') || status.includes('MALAISE');

  // Simulated thoracic angle based on motion and normal respiratory excursion (+/- 1.5 deg)
  const thoracicAngle = (Math.sin(Date.now() / 800) * 1.8).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background ambient medical glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase block">
              Biomécanique Thoracique & Cartographie Capteurs
            </span>
            <h3 className="text-sm font-extrabold text-white tracking-wide">
              Dynamique Respiratoire & Inclinométrie MPU6050
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${finger ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span>{finger ? 'Flux Bio-Optique Actif' : 'Signal Doigt Interrompu'}</span>
          </span>
        </div>
      </div>

      {/* Grid: 3 Interactive Bio Panels (No redundant heart) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        
        {/* Panel 1: Thoracic Inclinometer & MPU6050 Tilt Indicator */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-between relative group hover:border-cyan-500/40 transition-all duration-300">
          <div className="w-full flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold uppercase flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Inclinométrie Thoracique</span>
            </span>
            <span>{thoracicAngle}°</span>
          </div>

          {/* Dynamic Inclinometer Gauge */}
          <div className="my-5 relative flex items-center justify-center w-28 h-28">
            <div className="absolute inset-0 rounded-full border border-slate-800 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-dashed border-slate-700/60" />
            </div>

            {/* Level bubble / needle */}
            <div 
              className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute rounded-full transition-transform duration-300 shadow-md shadow-cyan-500/50"
              style={{ transform: `rotate(${Number(thoracicAngle) * 4}deg)` }}
            />
            <div className="w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 z-10 shadow-lg shadow-cyan-400/80 animate-pulse" />
            
            <span className="absolute bottom-1 text-[9px] font-mono text-slate-500">
              Seuil: Δθ &gt; 0.15°
            </span>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] font-mono border-t border-slate-900 pt-2.5">
            <div className="bg-slate-900/60 rounded p-1">
              <span className="text-slate-500 block">Accélération</span>
              <strong className={motion >= 2.5 ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                {motion.toFixed(2)} g
              </strong>
            </div>
            <div className="bg-slate-900/60 rounded p-1">
              <span className="text-slate-500 block">État Postural</span>
              <strong className={motion >= 2.5 ? 'text-rose-400' : 'text-emerald-400'}>
                {motion >= 2.5 ? 'Impact Chute' : 'Vertical / Repos'}
              </strong>
            </div>
          </div>
        </div>

        {/* Panel 2: Expanding Lungs Model */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-between relative group hover:border-cyan-500/40 transition-all duration-300">
          <div className="w-full flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold uppercase flex items-center space-x-1">
              <Wind className="w-3.5 h-3.5" />
              <span>Expansion Thoracique</span>
            </span>
            <span>{resp} CPM</span>
          </div>

          {/* Animated Lungs SVG */}
          <div className="my-5 relative flex items-center justify-center">
            <div
              className="absolute w-28 h-28 rounded-full bg-cyan-500/10 blur-xl transition-all"
              style={{
                animation: resp > 0 ? `ping ${respRateSec}s cubic-bezier(0, 0, 0.2, 1) infinite` : 'none'
              }}
            />

            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              style={{
                animation: resp > 0 ? `lungsBreatheAnim ${respRateSec}s ease-in-out infinite` : 'none',
                transformOrigin: 'center center'
              }}
            >
              <defs>
                <linearGradient id="lungGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="60%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0c4a6e" />
                </linearGradient>
              </defs>

              {/* Trachea */}
              <rect x="47" y="10" width="6" height="24" rx="2" fill="#38bdf8" />
              <path d="M47,32 L36,44 M53,32 L64,44" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

              {/* Left Lung */}
              <path
                d="M38,42 C30,42 20,52 20,68 C20,82 28,88 38,88 C44,88 44,78 44,65 C44,52 42,42 38,42 Z"
                fill="url(#lungGrad)"
                stroke="#7dd3fc"
                strokeWidth="1.2"
              />

              {/* Right Lung */}
              <path
                d="M62,42 C70,42 80,52 80,68 C80,82 72,88 62,88 C56,88 56,78 56,65 C56,52 58,42 62,42 Z"
                fill="url(#lungGrad)"
                stroke="#7dd3fc"
                strokeWidth="1.2"
              />

              {/* Bronchial arborization */}
              <path
                d="M36,52 Q30,62 26,72 M38,62 Q34,70 32,80 M64,52 Q70,62 74,72 M62,62 Q66,70 68,80"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] font-mono border-t border-slate-900 pt-2.5">
            <div className="bg-slate-900/60 rounded p-1">
              <span className="text-slate-500 block">Cycle Respiratoire</span>
              <strong className="text-cyan-300">{respRateSec} s / cycle</strong>
            </div>
            <div className="bg-slate-900/60 rounded p-1">
              <span className="text-slate-500 block">Ratio In/Ex</span>
              <strong className="text-slate-300">40% / 60%</strong>
            </div>
          </div>
        </div>

        {/* Panel 3: Holographic Body Silhouette with ESP32 Hardware Mapping */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-between relative group hover:border-emerald-500/40 transition-all duration-300">
          <div className="w-full flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span className="text-emerald-400 font-semibold uppercase flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Cartographie Capteurs</span>
            </span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Liaison I2C OK</span>
            </span>
          </div>

          {/* Holographic Body Silhouette */}
          <div className="my-2 relative flex items-center justify-center">
            <svg viewBox="0 0 100 140" className="w-24 h-32 opacity-85">
              {/* Human Head */}
              <circle cx="50" cy="16" r="10" fill="none" stroke="#64748b" strokeWidth="1.5" />
              {/* Torso & Limbs */}
              <path
                d="M38,32 C38,28 62,28 62,32 L68,68 L60,70 L58,110 L52,110 L50,85 L48,110 L42,110 L40,70 L32,68 Z"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Arms */}
              <path d="M38,32 L22,65 L18,85" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M62,32 L78,65 L82,85" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

              {/* SENSOR 1: MPU6050 Thoracic Node on Sternum (cx: 50, cy: 45) */}
              <circle cx="50" cy="46" r="4.5" fill="#06b6d4" className="animate-pulse" />
              <circle cx="50" cy="46" r="8" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.6" className="animate-ping" />

              {/* SENSOR 2: MAX30102 Optical PPG on Left Finger (cx: 18, cy: 85) */}
              <circle cx="18" cy="85" r="4.5" fill="#f43f5e" className="animate-pulse" />
              <circle cx="18" cy="85" r="8" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" className="animate-ping" />

              {/* Pointer Lines & Callout Labels */}
              <line x1="50" y1="46" x2="78" y2="46" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" />
              <text x="80" y="49" fill="#06b6d4" fontSize="7" fontFamily="monospace">MPU6050</text>

              <line x1="18" y1="85" x2="35" y2="98" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
              <text x="37" y="101" fill="#f43f5e" fontSize="7" fontFamily="monospace">MAX30102</text>
            </svg>
          </div>

          <div className="w-full flex items-center justify-between text-[10px] font-mono border-t border-slate-900 pt-2.5 text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Pouls (Doigt)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>FR / Impact (Thorax)</span>
            </span>
          </div>
        </div>

      </div>

      {/* Global Clinical Status Banner */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-400">
          <span>Surveillance Clinique :</span>
          <span className={`font-bold ${isAlarm ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isAlarm ? 'ANOMALIE HÉMODYNAMIQUE' : 'PARAMÈTRES PHYSIOLOGIQUES STABLES'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          UART 115200 bauds • Bus I2C mutualisé (GPIO 21 SDA / GPIO 22 SCL)
        </div>
      </div>
    </div>
  );
};
