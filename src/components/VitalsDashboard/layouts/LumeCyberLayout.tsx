import React, { useState } from 'react';
import type { VitalSigns, PatientProfile } from '../../../types/medical';
import { Heart3DCanvas } from '../Heart3DCanvas';
import { OscilloscopeCanvas } from '../OscilloscopeCanvas';
import { medicalAudio } from '../../../utils/audio';

interface LumeCyberLayoutProps {
  vitals: VitalSigns;
  patient: PatientProfile;
  soundEnabled: boolean;
  isAlarmActive: boolean;
  onTriggerEmergencyAlert: (reason: string) => void;
}

export const LumeCyberLayout: React.FC<LumeCyberLayoutProps> = ({
  vitals,
  patient,
  soundEnabled,
  isAlarmActive,
  onTriggerEmergencyAlert
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState<'AI_INSIGHTS' | 'MEDS'>('AI_INSIGHTS');

  const bpm = vitals.finger && vitals.bpm > 0 ? vitals.bpm : 0;

  // Hourly Candlestick Mock Data for Lume Heart Rate Card
  const hourlyCandles = [
    { hour: '1.0', min: 72, max: 98, avg: 85 },
    { hour: '2.0', min: 68, max: 115, avg: 90 },
    { hour: '3.0', min: 75, max: 130, avg: 102 },
    { hour: '4.0', min: 80, max: 145, avg: 112 },
    { hour: '5.0', min: 70, max: 125, avg: 98 },
    { hour: '6.0', min: 72, max: 110, avg: 92 },
    { hour: '7.0', min: 78, max: 155, avg: 118 },
    { hour: '8.0', min: 82, max: 164, avg: 124 },
    { hour: '9.0', min: 74, max: 120, avg: 96 }
  ];

  return (
    <div className="w-full space-y-5 animate-fadeIn font-sans text-slate-200">
      
      {/* Top Browser Bar (Like Lume shot: saaswit.com/cardiac-monitoring) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#080b14]/90 border border-slate-800/80 shadow-lg text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-bold">saaswit.com/cardiac-monitoring</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>PULSE : {bpm} BPM</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Patiente : {patient.prenom} {patient.nom} (26 SA)</span>
        </div>
      </div>

      {/* TOP ROW: 2 WIDE CARDS (Left: Cardiac Mapping 3D | Right: ECG Recording Oscilloscope) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Card 1 (Left 5 cols): "Cardiac Mapping" with Translucent 3D Heart & Callout Pointers */}
        <div className="lg:col-span-5 bg-[#080b14]/95 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-extrabold text-white tracking-wider uppercase font-mono">
                Cardiac Mapping
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 font-bold">
              Laser X-Ray
            </span>
          </div>

          {/* Central Translucent Holographic 3D Heart */}
          <div className="relative w-full h-84 flex items-center justify-center my-2">
            
            {/* Holographic matrix grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            {/* The 3D Heart */}
            <div className="w-full h-full relative z-10 pointer-events-none select-none">
              <Heart3DCanvas 
                vitals={vitals} 
                isAlarmActive={isAlarmActive} 
                currentStyle="LUME_CYBER" 
                hideOverlayCards={true}
              />
            </div>

            {/* SVG Anatomical Callout Leader Lines & Arrow Pointers (Lume Signature Style) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
              viewBox="0 0 400 340"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glowRose" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 1. Top-Left Arrow / Leader: Blood Pressure -> Crosse Aortique */}
              <g filter="url(#glowCyan)">
                <polyline 
                  points="115,40 155,40 188,115" 
                  fill="none" 
                  stroke="#00f2fe" 
                  strokeWidth="1.75" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
                <circle cx="115" cy="40" r="3" fill="#00f2fe" />
                <circle cx="188" cy="115" r="7" fill="none" stroke="#00f2fe" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="188" cy="115" r="4" fill="#04060a" stroke="#00f2fe" strokeWidth="2" />
                <circle cx="188" cy="115" r="1.5" fill="#00f2fe" />
              </g>

              {/* 2. Top-Right Arrow / Leader: Glucose Level -> Veine Cave & Tronc */}
              <g filter="url(#glowAmber)">
                <polyline 
                  points="285,40 245,40 224,110" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="1.75" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
                <circle cx="285" cy="40" r="3" fill="#f59e0b" />
                <circle cx="224" cy="110" r="7" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="224" cy="110" r="4" fill="#04060a" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="224" cy="110" r="1.5" fill="#f59e0b" />
              </g>

              {/* 3. Bottom-Left Arrow / Leader: Blood Count -> Paroi Myocardique */}
              <g filter="url(#glowCyan)">
                <polyline 
                  points="115,298 145,298 168,208" 
                  fill="none" 
                  stroke="#00f2fe" 
                  strokeWidth="1.75" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
                <circle cx="115" cy="298" r="3" fill="#00f2fe" />
                <circle cx="168" cy="208" r="7" fill="none" stroke="#00f2fe" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="168" cy="208" r="4" fill="#04060a" stroke="#00f2fe" strokeWidth="2" />
                <circle cx="168" cy="208" r="1.5" fill="#00f2fe" />
              </g>

              {/* 4. Bottom-Right Arrow / Leader: Heart Rate -> Apex Cardiaque */}
              <g filter="url(#glowRose)">
                <polyline 
                  points="285,298 250,298 220,235" 
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="1.75" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                />
                <circle cx="285" cy="298" r="3" fill="#f43f5e" />
                <circle cx="220" cy="235" r="7" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="220" cy="235" r="4" fill="#04060a" stroke="#f43f5e" strokeWidth="2" />
                <circle cx="220" cy="235" r="1.5" fill="#f43f5e" />
              </g>
            </svg>

            {/* Callout 1: Top-Left -> Blood Pressure */}
            <div className="absolute top-4 left-2 z-20 pointer-events-auto bg-[#04060a]/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xl text-left">
              <div className="text-[9px] text-slate-400 font-mono">Blood pressure</div>
              <div className="text-xs font-mono font-black text-white">118/76</div>
              <div className="w-12 h-0.5 bg-cyan-500/60 mt-1" />
            </div>

            {/* Callout 2: Top-Right -> Glucose Level */}
            <div className="absolute top-4 right-2 z-20 pointer-events-auto bg-[#04060a]/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xl text-right">
              <div className="text-[9px] text-slate-400 font-mono">Glucose Level</div>
              <div className="text-xs font-mono font-black text-amber-400">181 <span className="text-[8px] text-slate-400">mg/dL</span></div>
              <div className="w-12 h-0.5 bg-amber-500/60 mt-1 ml-auto" />
            </div>

            {/* Callout 3: Bottom-Left -> Blood Count */}
            <div className="absolute bottom-4 left-2 z-20 pointer-events-auto bg-[#04060a]/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xl text-left">
              <div className="text-[9px] text-slate-400 font-mono">Blood Count</div>
              <div className="text-xs font-mono font-black text-cyan-400">79%</div>
              <div className="w-12 h-0.5 bg-cyan-500/60 mt-1" />
            </div>

            {/* Callout 4: Bottom-Right -> Heart Rate */}
            <div className="absolute bottom-4 right-2 z-20 pointer-events-auto bg-[#04060a]/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xl text-right">
              <div className="text-[9px] text-slate-400 font-mono">Heart Rate</div>
              <div className="text-xs font-mono font-black text-rose-400">{bpm} <span className="text-[8px] text-slate-400">bpm</span></div>
              <div className="w-12 h-0.5 bg-rose-500/60 mt-1 ml-auto" />
            </div>

          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>MAX30102 PPG Optical</span>
            <span className="text-cyan-400 font-bold">100 Hz Sweep</span>
          </div>
        </div>

        {/* Card 2 (Right 7 cols): "ECG Recording" Dual Sweep Track (Like Lume shot) */}
        <div className="lg:col-span-7 bg-[#080b14]/95 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-extrabold text-white tracking-wider uppercase font-mono">
                ECG Recording
              </h3>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs">
              <span className="text-slate-400">M HR: <b className="text-white">--</b></span>
              <span className="text-slate-400">REGULAR HR: <b className="text-emerald-400">67</b></span>
              <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 font-bold border border-rose-500/40">
                PULSE : {bpm}
              </span>
            </div>
          </div>

          {/* Real-Time Sweep Waveforms (Electric Cyan ECG + Amber RESP) */}
          <div className="my-2">
            <OscilloscopeCanvas
              bpm={vitals.bpm}
              resp={vitals.resp}
              finger={vitals.finger}
              isAlarmActive={isAlarmActive}
              soundEnabled={soundEnabled}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>Liaison UART Série : 115200 bauds</span>
            <span className="text-emerald-400">Synchronisation ESP32 OK</span>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: 3 ANALYTICAL CARDS (Heart Rate Candlestick, BP Dual Bars, Blood Glucose Scatter) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 3: Heart Rate Hourly Candlestick Distribution (Like Lume Shot) */}
        <div className="bg-[#080b14]/95 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">Heart Rate</span>
            <span className="text-xs font-mono font-black text-cyan-400">93-164 bpm</span>
          </div>

          {/* Candlestick / Pill Bar Chart */}
          <div className="h-28 flex items-end justify-between gap-1.5 pt-4">
            {hourlyCandles.map((c, i) => {
              const bottomPercent = ((c.min - 60) / 110) * 100;
              const heightPercent = ((c.max - c.min) / 110) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full relative h-full flex items-end justify-center">
                    {/* Background line */}
                    <div className="absolute w-[1px] bg-slate-700 h-full" />
                    {/* Floating Pill Candlestick */}
                    <div 
                      className="w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 group-hover:bg-cyan-300 transition-colors z-10"
                      style={{ 
                        height: `${Math.max(15, heightPercent)}%`,
                        marginBottom: `${Math.max(0, bottomPercent)}%`
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-2">{c.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800 mt-2 flex justify-between">
            <span>Dispersion horaire</span>
            <span className="text-emerald-400 font-bold">Stable</span>
          </div>
        </div>

        {/* Card 4: Blood Pressure Dual Horizontal Progress Bars (Like Lume Shot) */}
        <div className="bg-[#080b14]/95 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Blood Pressure</span>
            <span className="text-xs font-mono font-bold text-slate-400">Avg 115-74 mmHg</span>
          </div>

          <div className="text-2xl font-mono font-black text-white my-1">
            118/76 <span className="text-xs font-sans text-slate-400">mmHg</span>
          </div>

          {/* Systolic & Diastolic Progress Bars */}
          <div className="space-y-3 my-2">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400">Systolic: <b className="text-cyan-400">118 mmHg</b></span>
                <span className="text-cyan-400 font-bold">2% ↑</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full w-[65%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400">Diastolic: <b className="text-amber-400">76 mmHg</b></span>
                <span className="text-amber-400 font-bold">1% ↓</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full w-[45%]" />
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>Profil Obstétrique (26 SA)</span>
            <span className="text-emerald-400 font-bold">Optimal</span>
          </div>
        </div>

        {/* Card 5: Blood Glucose Scatter Plot Matrix (Like Lume Shot) */}
        <div className="bg-[#080b14]/95 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Blood Glucose</span>
            <div className="flex items-center gap-2 text-[9px] font-mono">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Normal</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Low/High</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Alert</span>
            </div>
          </div>

          {/* Scatter Plot Dots SVG */}
          <div className="h-28 w-full relative flex items-center">
            <svg className="w-full h-full" viewBox="0 0 200 80">
              {/* Horizontal grid lines */}
              <line x1="0" y1="20" x2="200" y2="20" stroke="#1e293b" strokeDasharray="2 2" />
              <line x1="0" y1="40" x2="200" y2="40" stroke="#1e293b" strokeDasharray="2 2" />
              <line x1="0" y1="60" x2="200" y2="60" stroke="#1e293b" strokeDasharray="2 2" />

              {/* Mon - Sun Scatter Dots */}
              {/* Mon */}
              <circle cx="20" cy="42" r="3.5" fill="#10b981" />
              <circle cx="20" cy="28" r="3" fill="#f59e0b" />
              {/* Tue */}
              <circle cx="50" cy="38" r="3.5" fill="#10b981" />
              <circle cx="50" cy="44" r="3" fill="#10b981" />
              {/* Wed */}
              <circle cx="80" cy="22" r="3.5" fill="#f59e0b" />
              <circle cx="80" cy="40" r="3" fill="#10b981" />
              {/* Thu */}
              <circle cx="110" cy="36" r="3.5" fill="#10b981" />
              <circle cx="110" cy="50" r="3" fill="#10b981" />
              {/* Fri */}
              <circle cx="140" cy="40" r="3.5" fill="#10b981" />
              <circle cx="140" cy="18" r="3" fill="#f43f5e" />
              {/* Sat */}
              <circle cx="170" cy="38" r="3.5" fill="#10b981" />
              <circle cx="170" cy="65" r="3" fill="#f59e0b" />
              {/* Sun */}
              <circle cx="190" cy="42" r="3.5" fill="#10b981" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

      </div>

      {/* BOTTOM TAB FOOTER (Like Lume Shot: AI Analytics Insights | Medication List | PULSE 174) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#080b14]/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              medicalAudio.playUiClick();
              setActiveBottomTab('AI_INSIGHTS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              activeBottomTab === 'AI_INSIGHTS' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Analytics Insights
          </button>

          <button
            onClick={() => {
              medicalAudio.playUiClick();
              setActiveBottomTab('MEDS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              activeBottomTab === 'MEDS' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Medication List
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">Statut Hémodynamique :</span>
          <button 
            onClick={() => onTriggerEmergencyAlert('Test Alerte Déclenchée depuis Lume Cyber')}
            className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 hover:bg-rose-950 text-emerald-400 hover:text-rose-400 border border-emerald-500/40 hover:border-rose-500/40 font-bold transition cursor-pointer"
          >
            PULSE {bpm} • SINUSAL OK
          </button>
        </div>
      </div>

    </div>
  );
};
