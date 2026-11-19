import React from 'react';
import { Heart } from 'lucide-react';
import type { VitalSigns, PatientProfile } from '../../../types/medical';
import { Heart3DCanvas } from '../Heart3DCanvas';
import { OledDisplaySimulator } from '../OledDisplaySimulator';
import { OscilloscopeCanvas } from '../OscilloscopeCanvas';
import { SimulationController } from '../SimulationController';
import { AnatomyPulseWidget } from '../AnatomyPulseWidget';

interface IcuCockpitLayoutProps {
  vitals: VitalSigns;
  patient: PatientProfile;
  soundEnabled: boolean;
  isAlarmActive: boolean;
  onUpdateBpm: (bpm: number) => void;
  onUpdateResp: (resp: number) => void;
  onUpdateMotion: (motion: number) => void;
  onUpdateFinger: (finger: boolean) => void;
  onTriggerEmergencyAlert: (reason: string) => void;
}

export const IcuCockpitLayout: React.FC<IcuCockpitLayoutProps> = ({
  vitals,
  patient,
  soundEnabled,
  isAlarmActive,
  onUpdateBpm,
  onUpdateResp,
  onUpdateMotion,
  onUpdateFinger,
  onTriggerEmergencyAlert
}) => {
  const bpm = vitals.finger && vitals.bpm > 0 ? vitals.bpm : 0;
  const strokeVolume = 70; // mL standard ejection fraction
  const cardiacOutput = bpm > 0 ? ((bpm * strokeVolume) / 1000).toFixed(1) : '0.0';

  return (
    <div className="w-full space-y-6 animate-fadeIn font-mono text-slate-100">
      
      {/* Cockpit Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-black/90 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-white tracking-widest uppercase">
            MONITEUR CRITIQUE INTELLIVUE • SALLE DE SURVEILLANCE
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>PATIENTE : <b className="text-white">{patient.prenom} {patient.nom} ({patient.semainesAmenorrhee ?? 26} SA)</b></span>
          <span>•</span>
          <span>BUS I2C : <b className="text-emerald-400">0x3C, 0x57, 0x68</b></span>
          <span>•</span>
          <span>BAUD : <b className="text-cyan-400">115200 bps</b></span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
            STATUT : NORMAL
          </span>
        </div>
      </div>

      {/* Row 1: 4 High-Density ICU Vitals Tiles with Large Phosphor Digits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tile 1: FC (BPM) */}
        <div className="bg-[#050811] border-2 border-emerald-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="font-bold">FC (POULS)</span>
            <span className="text-[10px] text-slate-500">MAX30102</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">{bpm}</span>
            <span className="text-xs text-slate-400">BPM</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Cible: 60-100</span>
            <span className="text-emerald-400 font-bold">Sinusal</span>
          </div>
        </div>

        {/* Tile 2: FR (CPM) */}
        <div className="bg-[#050811] border-2 border-cyan-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-cyan-400">
            <span className="font-bold">FR (RESPIRATION)</span>
            <span className="text-[10px] text-slate-500">MPU6050</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-cyan-400 font-mono tracking-tight">{vitals.resp}</span>
            <span className="text-xs text-slate-400">CPM</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Cible: 12-20</span>
            <span className="text-cyan-400 font-bold">Eupnée</span>
          </div>
        </div>

        {/* Tile 3: MPU6050 Motion / Shock */}
        <div className="bg-[#050811] border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span className="font-bold">ACCÉLÉRATION CHOC</span>
            <span className="text-[10px] text-slate-500">MPU6050</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">
              {vitals.motion.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">g</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Seuil critique &gt; 2.5g</span>
            <span className="text-amber-400 font-bold">Repos 1.0g</span>
          </div>
        </div>

        {/* Tile 4: Syncope Algorithm Status */}
        <div className={`bg-[#050811] border-2 rounded-2xl p-4 shadow-xl ${
          vitals.fallAlert ? 'border-rose-500 animate-pulse bg-rose-950/40' : 'border-indigo-500/40'
        }`}>
          <div className="flex items-center justify-between text-xs text-indigo-400">
            <span className="font-bold">DÉTECTION SYNCOPE</span>
            <span className="text-[10px] text-slate-500">ALGO CLINIQUE</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black font-mono tracking-tight ${
              vitals.fallAlert ? 'text-rose-500' : 'text-indigo-300'
            }`}>
              {vitals.fallAlert ? 'ALERTE CHUTE' : 'SÉCURISÉ'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Délai d'intervention</span>
            <span className="text-indigo-400 font-bold">15s sécurité</span>
          </div>
        </div>

      </div>

      {/* Row 2: 3D Heart Screen + Real Hardware OLED SSD1306 Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3D Heart Screen & Advanced Hemodynamic Telemetry (7 cols) */}
        <div className="lg:col-span-7 bg-[#050811] border border-slate-800 rounded-3xl p-5 shadow-2xl relative flex flex-col justify-between">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>CARDIOLOGIE 3D ANATOMIQUE • TEMPS RÉEL</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 font-mono font-bold">
              VUE FIXE STABILISÉE
            </span>
          </div>

          {/* Central 3D Heart Stage with Structured Frame & Connected Caliper Badges */}
          <div className="relative w-full max-w-xl mx-auto h-[350px] my-2 flex items-center justify-center">
            {/* HUD Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none rounded-2xl" />

            {/* 3D Heart Canvas */}
            <div className="w-full h-full relative z-10 pointer-events-none select-none">
              <Heart3DCanvas 
                vitals={vitals} 
                isAlarmActive={isAlarmActive} 
                currentStyle="ICU_OBSIDIAN" 
                hideOverlayCards={true}
              />
            </div>

            {/* SVG Clinical Caliper Leader Lines & Crosshair Reticles */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
              viewBox="0 0 540 340"
              preserveAspectRatio="none"
            >
              {/* 1. Caliper Top-Left: CROSSE AORTIQUE */}
              <g>
                <polyline 
                  points="140,32 195,32 245,115" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3"
                />
                <circle cx="140" cy="32" r="2.5" fill="#10b981" />
                <circle cx="245" cy="115" r="7" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="245" cy="115" r="3.5" fill="#050811" stroke="#10b981" strokeWidth="1.5" />
                <line x1="241" y1="115" x2="249" y2="115" stroke="#10b981" strokeWidth="1" />
                <line x1="245" y1="111" x2="245" y2="119" stroke="#10b981" strokeWidth="1" />
              </g>

              {/* 2. Caliper Top-Right: TRONC PULMONAIRE */}
              <g>
                <polyline 
                  points="400,32 345,32 295,115" 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3"
                />
                <circle cx="400" cy="32" r="2.5" fill="#06b6d4" />
                <circle cx="295" cy="115" r="7" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="295" cy="115" r="3.5" fill="#050811" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1="291" y1="115" x2="299" y2="115" stroke="#06b6d4" strokeWidth="1" />
                <line x1="295" y1="111" x2="295" y2="119" stroke="#06b6d4" strokeWidth="1" />
              </g>

              {/* 3. Caliper Bottom-Left: VENTRICULE GAUCHE */}
              <g>
                <polyline 
                  points="140,308 195,308 235,225" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3"
                />
                <circle cx="140" cy="308" r="2.5" fill="#38bdf8" />
                <circle cx="235" cy="225" r="7" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="235" cy="225" r="3.5" fill="#050811" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="231" y1="225" x2="239" y2="225" stroke="#38bdf8" strokeWidth="1" />
                <line x1="235" y1="221" x2="235" y2="229" stroke="#38bdf8" strokeWidth="1" />
              </g>

              {/* 4. Caliper Bottom-Right: APEX CARDIAQUE */}
              <g>
                <polyline 
                  points="400,308 345,308 295,248" 
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3"
                />
                <circle cx="400" cy="308" r="2.5" fill="#f43f5e" />
                <circle cx="295" cy="248" r="7" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" className="animate-ping" />
                <circle cx="295" cy="248" r="3.5" fill="#050811" stroke="#f43f5e" strokeWidth="1.5" />
                <line x1="291" y1="248" x2="299" y2="248" stroke="#f43f5e" strokeWidth="1" />
                <line x1="295" y1="244" x2="295" y2="252" stroke="#f43f5e" strokeWidth="1" />
              </g>
            </svg>

            {/* Caliper Badge 1: Top-Left */}
            <div className="absolute top-2 left-2 z-20 pointer-events-auto bg-[#070d1e]/95 border border-emerald-500/50 rounded-xl px-2.5 py-1.5 shadow-xl font-mono text-left">
              <div className="text-[9px] text-emerald-400 font-bold tracking-wider">CROSSE AORTIQUE</div>
              <div className="text-xs font-black text-white">118 / 76 <span className="text-[8px] text-slate-400">mmHg</span></div>
            </div>

            {/* Caliper Badge 2: Top-Right */}
            <div className="absolute top-2 right-2 z-20 pointer-events-auto bg-[#070d1e]/95 border border-cyan-500/50 rounded-xl px-2.5 py-1.5 shadow-xl font-mono text-right">
              <div className="text-[9px] text-cyan-400 font-bold tracking-wider">TRONC PULMONAIRE</div>
              <div className="text-xs font-black text-white">15 <span className="text-[8px] text-slate-400">mmHg (PAP)</span></div>
            </div>

            {/* Caliper Badge 3: Bottom-Left */}
            <div className="absolute bottom-2 left-2 z-20 pointer-events-auto bg-[#070d1e]/95 border border-sky-500/50 rounded-xl px-2.5 py-1.5 shadow-xl font-mono text-left">
              <div className="text-[9px] text-sky-400 font-bold tracking-wider">VENTRICULE GAUCHE</div>
              <div className="text-xs font-black text-white">FE: 65% <span className="text-[8px] text-slate-400">NORM</span></div>
            </div>

            {/* Caliper Badge 4: Bottom-Right */}
            <div className="absolute bottom-2 right-2 z-20 pointer-events-auto bg-[#070d1e]/95 border border-rose-500/50 rounded-xl px-2.5 py-1.5 shadow-xl font-mono text-right">
              <div className="text-[9px] text-rose-400 font-bold tracking-wider">APEX CARDIAQUE</div>
              <div className="text-xs font-black text-white">{bpm} <span className="text-[8px] text-slate-400">BPM LIVE</span></div>
            </div>
          </div>

          {/* Lower Section: ICU Critical Care Hemodynamics Matrix (Philips IntelliVue Standard) */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tracking-wide">PARAMÈTRES HÉMODYNAMIQUES & INDEX DE PERFUSION</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Liaison I2C 0x57/0x68 Active
              </span>
            </div>

            {/* 4 Clinical Hemodynamic Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Tile 1: PAM (Pression Artérielle Moyenne) */}
              <div className="bg-[#070d1e]/90 border border-slate-800/90 rounded-2xl p-3 shadow-sm hover:border-slate-700 transition">
                <div className="text-[10px] text-slate-400 font-medium">Pression Art. Moyenne</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  90 <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                </div>
                <div className="text-[9px] text-emerald-500 font-semibold mt-1">Cible : 70-105 mmHg</div>
              </div>

              {/* Tile 2: Débit Cardiaque (Cardiac Output) */}
              <div className="bg-[#070d1e]/90 border border-slate-800/90 rounded-2xl p-3 shadow-sm hover:border-slate-700 transition">
                <div className="text-[10px] text-slate-400 font-medium">Débit Cardiaque (CO)</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5">
                  {cardiacOutput} <span className="text-[10px] text-slate-400 font-normal">L/min</span>
                </div>
                <div className="text-[9px] text-cyan-500 font-semibold mt-1">Vol. Éjection : 70 mL</div>
              </div>

              {/* Tile 3: Indice de Perfusion (PI) */}
              <div className="bg-[#070d1e]/90 border border-slate-800/90 rounded-2xl p-3 shadow-sm hover:border-slate-700 transition">
                <div className="text-[10px] text-slate-400 font-medium">Indice Perfusion (PI)</div>
                <div className="text-xl font-black text-sky-400 mt-0.5">
                  4.2 <span className="text-[10px] text-slate-400 font-normal">%</span>
                </div>
                <div className="text-[9px] text-sky-400 font-semibold mt-1">Perfusion Optimale</div>
              </div>

              {/* Tile 4: Résistance Vasculaire Systémique (RVS) */}
              <div className="bg-[#070d1e]/90 border border-slate-800/90 rounded-2xl p-3 shadow-sm hover:border-slate-700 transition">
                <div className="text-[10px] text-slate-400 font-medium">Résistance Vasc. (RVS)</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">
                  1120 <span className="text-[10px] text-slate-400 font-normal">dyn·s</span>
                </div>
                <div className="text-[9px] text-amber-500 font-semibold mt-1">Post-charge Normale</div>
              </div>
            </div>

            {/* Realtime Telemetry Status Banner */}
            <div className="p-2.5 rounded-xl bg-black/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Synchronisation optique MAX30102 (IR 880nm + Rouge 660nm)</span>
              </div>
              <span className="font-mono text-cyan-400 font-bold">Bus I2C mutualisé OK</span>
            </div>
          </div>

        </div>

        {/* Physical OLED Simulator + Obstetric Warning (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <OledDisplaySimulator 
            bpm={vitals.bpm}
            resp={vitals.resp}
            finger={vitals.finger}
            motion={vitals.motion}
            status={vitals.status}
          />
          <AnatomyPulseWidget 
            bpm={vitals.bpm}
            resp={vitals.resp}
            motion={vitals.motion}
            finger={vitals.finger}
            status={vitals.status}
          />
        </div>

      </div>

      {/* Row 3: Dual Real-Time Sweep Oscilloscopes */}
      <div className="bg-[#050811] border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <OscilloscopeCanvas
          bpm={vitals.bpm}
          resp={vitals.resp}
          finger={vitals.finger}
          isAlarmActive={isAlarmActive}
          soundEnabled={soundEnabled}
        />
      </div>

      {/* Row 4: Complete ESP32 Serial Simulation Console */}
      <SimulationController
        bpm={vitals.bpm}
        setBpm={onUpdateBpm}
        resp={vitals.resp}
        setResp={onUpdateResp}
        motion={vitals.motion}
        setMotion={onUpdateMotion}
        finger={vitals.finger}
        setFinger={onUpdateFinger}
        status={vitals.status}
        triggerEmergencyAlert={onTriggerEmergencyAlert}
      />

    </div>
  );
};
