import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Droplet, 
  Thermometer, 
  Wind, 
  Flame, 
  Footprints, 
  Moon, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import type { VitalSigns, PatientProfile } from '../../../types/medical';
import { Heart3DCanvas } from '../Heart3DCanvas';
import { medicalAudio } from '../../../utils/audio';

interface NickelFoxLayoutProps {
  vitals: VitalSigns;
  patient: PatientProfile;
  soundEnabled: boolean;
  isAlarmActive: boolean;
  onTriggerEmergencyAlert: (reason: string) => void;
}

export const NickelFoxLayout: React.FC<NickelFoxLayoutProps> = ({
  vitals,
  patient,
  isAlarmActive,
  onTriggerEmergencyAlert
}) => {
  const [trendPeriod, setTrendPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');

  const bpm = vitals.finger && vitals.bpm > 0 ? vitals.bpm : 0;
  const strokeVolume = Math.round(70 - Math.abs(bpm - 75) * 0.2);
  const cardiacOutput = bpm > 0 ? ((bpm * strokeVolume) / 1000).toFixed(1) : '0.0';

  const healthMetrics = [
    {
      title: 'Blood Pressure',
      value: '118 / 76',
      unit: 'mmHg',
      status: 'Normal',
      icon: Activity,
      color: 'text-rose-400 bg-rose-500/10'
    },
    {
      title: 'Oxygen Saturation',
      value: vitals.finger ? '98%' : '--',
      unit: 'SpO2',
      status: 'Normal',
      icon: Droplet,
      color: 'text-sky-400 bg-sky-500/10'
    },
    {
      title: 'Body Temperature',
      value: '36.6',
      unit: '°C',
      status: 'Normal',
      icon: Thermometer,
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      title: 'Respiratory Rate',
      value: String(vitals.resp),
      unit: '/min',
      status: 'Normal',
      icon: Wind,
      color: 'text-teal-400 bg-teal-500/10'
    }
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn text-slate-100">
      
      {/* 3-COLUMN PANORAMIC LAYOUT (Left, Center, Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: 3 cols */}
        <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
          
          {/* Card 1: Heart Rate Mountain Area Chart (NickelFox Style) */}
          <div className="bg-[#0c142b]/80 border border-slate-700/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Heart className="w-4 h-4 animate-pulse" />
                </span>
                <span className="text-xs font-bold text-slate-300">Heart Rate</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-extrabold text-white">{bpm}</span>
                <span className="text-[10px] text-slate-400 ml-1">bpm</span>
                <div className="text-[10px] text-emerald-400 font-bold">Normal</div>
              </div>
            </div>

            {/* Filled Mountain Area SVG Chart */}
            <div className="mt-4 h-24 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="nfHeartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 0 60 Q 30 50, 60 55 T 100 30 T 140 45 T 170 35 L 200 50 L 200 80 L 0 80 Z" 
                  fill="url(#nfHeartGrad)" 
                />
                <path 
                  d="M 0 60 Q 30 50, 60 55 T 100 30 T 140 45 T 170 35 L 200 50" 
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="2.5" 
                />
                {/* Current Value Scrubber Flag */}
                <circle cx="140" cy="45" r="4" fill="#ffffff" stroke="#f43f5e" strokeWidth="2" />
              </svg>
              <div className="absolute top-2 left-28 bg-[#1e294b] text-[10px] font-mono px-2 py-0.5 rounded-md text-white font-bold border border-slate-600 shadow">
                {bpm} bpm
              </div>
            </div>
            
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
              <span>12AM</span>
              <span>6AM</span>
              <span>12PM</span>
              <span>6PM</span>
              <span>12AM</span>
            </div>
          </div>

          {/* Card 2: Health Metrics List (NickelFox Style) */}
          <div className="bg-[#0c142b]/80 border border-slate-700/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
              <span>Health Metrics</span>
              <span className="text-[10px] font-mono text-slate-500">Live ESP32</span>
            </div>

            <div className="space-y-3">
              {healthMetrics.map((metric, i) => {
                const IconComponent = metric.icon;
                return (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#070d1e]/60 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${metric.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400">{metric.title}</div>
                        <div className="text-xs font-mono font-bold text-white">
                          {metric.value} <span className="text-[10px] text-slate-400">{metric.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <span>{metric.status}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* CENTER COLUMN: 6 cols (Dominant Realistic 3D Heart + Connected Telemetry Badges & Leader Lines) */}
        <div className="lg:col-span-6 bg-[#0c142b]/80 border border-slate-700/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between min-h-[520px]">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-extrabold text-white tracking-wide">Surveillance Cardiaque 3D • Biomédicale</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#070d1e] text-cyan-400 font-bold border border-cyan-500/30">
              Anatomie Synchronisée
            </span>
          </div>

          {/* Central 3D Heart Stage with Bioluminescent Aura, Leader Lines & Floating Badges */}
          <div className="relative w-full h-[450px] flex items-center justify-center my-auto">
            
            {/* Bioluminescent background aura */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-88 h-88 rounded-full bg-gradient-to-tr from-cyan-500/15 via-rose-500/10 to-transparent blur-3xl" />
              <div className="absolute w-76 h-76 rounded-full border border-cyan-500/20 animate-pulse" />
              <div className="absolute w-60 h-60 rounded-full border border-cyan-400/15" />
            </div>

            {/* 3D Heart Canvas */}
            <div className="w-full h-full relative z-10 pointer-events-none select-none">
              <Heart3DCanvas 
                vitals={vitals} 
                isAlarmActive={isAlarmActive} 
                currentStyle="CARDIOCARE_OCEAN" 
                hideOverlayCards={true}
              />
            </div>

            {/* SVG Anatomical Callout Leader Lines (NickelFox Signature Style) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
              viewBox="0 0 500 450"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="nfGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="nfGlowRose" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="nfGlowEmerald" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="nfGlowSky" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 1. Top-Left Arrow / Leader: Heart Rate -> Nœud Sinusal / Atrium Droit */}
              <g filter="url(#nfGlowRose)">
                <polyline 
                  points="160,55 195,55 220,150" 
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="1.75" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
                <circle cx="160" cy="55" r="3" fill="#f43f5e" />
                <circle cx="220" cy="150" r="7" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="220" cy="150" r="4" fill="#070d1e" stroke="#f43f5e" strokeWidth="2" />
                <circle cx="220" cy="150" r="1.5" fill="#f43f5e" />
              </g>

              {/* 2. Top-Right Arrow / Leader: Cardiac Output -> Crosse Aortique */}
              <g filter="url(#nfGlowCyan)">
                <polyline 
                  points="340,55 305,55 275,135" 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="1.75" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
                <circle cx="340" cy="55" r="3" fill="#06b6d4" />
                <circle cx="275" cy="135" r="7" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="275" cy="135" r="4" fill="#070d1e" stroke="#06b6d4" strokeWidth="2" />
                <circle cx="275" cy="135" r="1.5" fill="#06b6d4" />
              </g>

              {/* 3. Bottom-Left Arrow / Leader: Looks Good -> Ventricule Gauche */}
              <g filter="url(#nfGlowEmerald)">
                <polyline 
                  points="180,395 210,395 230,290" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="1.75" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
                <circle cx="180" cy="395" r="3" fill="#10b981" />
                <circle cx="230" cy="290" r="7" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="230" cy="290" r="4" fill="#070d1e" stroke="#10b981" strokeWidth="2" />
                <circle cx="230" cy="290" r="1.5" fill="#10b981" />
              </g>

              {/* 4. Bottom-Right Arrow / Leader: Blood Pressure -> Tronc Artériel Coronarien */}
              <g filter="url(#nfGlowSky)">
                <polyline 
                  points="340,395 305,395 275,280" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="1.75" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
                <circle cx="340" cy="395" r="3" fill="#38bdf8" />
                <circle cx="275" cy="280" r="7" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="275" cy="280" r="4" fill="#070d1e" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="275" cy="280" r="1.5" fill="#38bdf8" />
              </g>
            </svg>

            {/* Top-Left Badge: Heart Rate Range */}
            <div className="absolute top-2 left-2 z-20 pointer-events-auto bg-[#070d1e]/90 border border-slate-700/80 rounded-2xl p-2.5 shadow-xl backdrop-blur-md">
              <div className="text-[10px] font-medium text-slate-400">Heart Rate</div>
              <div className="text-xl font-mono font-extrabold text-white flex items-baseline gap-1 mt-0.5">
                <span>{bpm}</span>
                <span className="text-xs font-sans text-slate-400">bpm</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Normal (60-100)</span>
              </div>
            </div>

            {/* Top-Right Badge: Cardiac Output */}
            <div className="absolute top-2 right-2 z-20 pointer-events-auto bg-[#070d1e]/90 border border-slate-700/80 rounded-2xl p-2.5 shadow-xl backdrop-blur-md text-right">
              <div className="text-[10px] font-medium text-slate-400">Cardiac Output</div>
              <div className="text-xl font-mono font-extrabold text-cyan-400 mt-0.5">
                {cardiacOutput} <span className="text-xs font-sans text-slate-400">L/min</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                SV : {strokeVolume} mL/batt
              </div>
            </div>

            {/* Bottom-Left Badge: Heart Health Looks Good */}
            <div className="absolute bottom-2 left-2 z-20 pointer-events-auto bg-[#070d1e]/90 border border-slate-700/80 rounded-2xl p-2.5 shadow-xl backdrop-blur-md max-w-[210px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <span className="w-4 h-4 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-[9px]">
                  🫀
                </span>
                <span>{patient.prenom} {patient.nom}</span>
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">Looks Good!</div>
              <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
                Perfusion et index cardiaque stables ({patient.semainesAmenorrhee ?? 26} SA).
              </p>
            </div>

            {/* Bottom-Right Badge: Blood Pressure */}
            <div className="absolute bottom-2 right-2 z-20 pointer-events-auto bg-[#070d1e]/90 border border-slate-700/80 rounded-2xl p-2.5 shadow-xl backdrop-blur-md text-right">
              <div className="text-[10px] font-medium text-slate-400">Blood Pressure</div>
              <div className="text-xl font-mono font-extrabold text-white flex items-baseline justify-end gap-1 mt-0.5">
                <span>118 / 76</span>
                <span className="text-[10px] font-sans text-slate-400">mmHg</span>
              </div>
              <div className="text-[10px] text-sky-400 flex items-center justify-end gap-1 mt-0.5 font-semibold">
                <span>Optimale DLG</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: 3 cols (Heart Activity + Daily Summary + Health Score 94) */}
        <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
          
          {/* Card 1: Heart Activity (Dark Red Card with glowing red ECG wave) */}
          <div 
            onClick={() => onTriggerEmergencyAlert('Test Alerte Déclenchée depuis CardioCare')}
            className="bg-gradient-to-b from-[#1b0c16]/90 to-[#0e0710]/90 border border-rose-900/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-rose-200">Heart Activity</span>
              </div>
              <Maximize2 className="w-3.5 h-3.5 text-rose-400/60" />
            </div>

            {/* Glowing Red ECG Tracing SVG */}
            <div className="mt-4 h-24 flex items-center justify-center relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
                <path 
                  d="M 0 30 L 30 30 L 40 30 L 45 10 L 52 50 L 60 20 L 65 35 L 70 30 L 110 30 L 115 12 L 122 48 L 130 18 L 135 34 L 140 30 L 200 30" 
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="2.5" 
                  className="filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                />
              </svg>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-semibold pt-2 border-t border-rose-950/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Normal Sinus Rhythm • No irregularities</span>
            </div>
          </div>

          {/* Card 2: Daily Summary (Calories, Steps, Sleep) */}
          <div className="bg-[#0c142b]/80 border border-slate-700/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
              <span>Daily Summary</span>
              <span className="text-[10px] font-mono text-slate-500">Aujourd'hui</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2.5 rounded-2xl bg-[#070d1e]/60 border border-slate-800">
                <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <div className="text-xs font-mono font-bold text-white">320</div>
                <div className="text-[9px] text-slate-400">kcal</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1">+12% ↑</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#070d1e]/60 border border-slate-800">
                <Footprints className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                <div className="text-xs font-mono font-bold text-white">8,420</div>
                <div className="text-[9px] text-slate-400">pas</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1">+8% ↑</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#070d1e]/60 border border-slate-800">
                <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <div className="text-xs font-mono font-bold text-white">7h 36m</div>
                <div className="text-[9px] text-slate-400">sommeil</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1">+5% ↑</div>
              </div>
            </div>
          </div>

          {/* Card 3: Heart Health Score 94 Radial Ring */}
          <div className="bg-[#0c142b]/80 border border-slate-700/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex items-center justify-between">
            {/* Radial Ring */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e294b"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="94, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-mono font-black text-white">94</span>
                <span className="block text-[8px] font-bold text-slate-400">Score</span>
              </div>
            </div>

            {/* Score Breakdown List */}
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Rhythm:</span>
                <span className="text-emerald-400 font-bold font-mono">Excellent</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Blood Pressure:</span>
                <span className="text-emerald-400 font-bold font-mono">Good</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Activity Level:</span>
                <span className="text-emerald-400 font-bold font-mono">Good</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Recovery:</span>
                <span className="text-emerald-400 font-bold font-mono">Excellent</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM FULL-WIDTH CARD: Heart Rate Trend Timeline (NickelFox Style) */}
      <div className="bg-[#0c142b]/80 border border-slate-700/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-sm font-extrabold text-white tracking-tight">Heart Rate Trend</h3>
            <span className="text-xs text-slate-400 font-mono">Chronogramme 24h</span>
          </div>

          {/* Period selector pills */}
          <div className="flex items-center bg-[#070d1e] p-1 rounded-2xl border border-slate-800 self-start">
            {(['Day', 'Week', 'Month', 'Year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => {
                  medicalAudio.playUiClick();
                  setTrendPeriod(period);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  trendPeriod === period
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Full-width Wave Chart with Interactive Scrubber */}
        <div className="relative h-28 w-full flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="nfFullGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path 
              d="M 0 75 Q 80 65, 150 70 T 300 45 T 450 60 T 600 35 T 750 55 T 900 40 L 1000 65 L 1000 100 L 0 100 Z" 
              fill="url(#nfFullGrad)" 
            />
            <path 
              d="M 0 75 Q 80 65, 150 70 T 300 45 T 450 60 T 600 35 T 750 55 T 900 40 L 1000 65" 
              fill="none" 
              stroke="#f43f5e" 
              strokeWidth="2.5" 
            />
            {/* Scrubber vertical line & point */}
            <line x1="580" y1="0" x2="580" y2="100" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="580" cy="38" r="5" fill="#ffffff" stroke="#f43f5e" strokeWidth="2.5" />
          </svg>

          {/* Floating Scrubber Tag at 58% */}
          <div className="absolute top-2 left-[54%] bg-slate-800/95 border border-slate-600 rounded-xl px-2.5 py-1 text-center shadow-lg font-mono text-xs">
            <span className="font-extrabold text-white">{bpm} bpm</span>
            <span className="block text-[9px] text-slate-400">10:24 AM</span>
          </div>
        </div>

        <div className="flex justify-between text-xs font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
          <span>12AM</span>
          <span>3AM</span>
          <span>6AM</span>
          <span>9AM</span>
          <span>12PM</span>
          <span>3PM</span>
          <span>6PM</span>
          <span>9PM</span>
          <span>12AM</span>
        </div>
      </div>

    </div>
  );
};
