import React, { useState } from 'react';
import { 
  Heart, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import type { VitalSigns, PatientProfile } from '../../../types/medical';
import { Heart3DCanvas } from '../Heart3DCanvas';
import { OledDisplaySimulator } from '../OledDisplaySimulator';
import { OscilloscopeCanvas } from '../OscilloscopeCanvas';
import { SimulationController } from '../SimulationController';
import { AnatomyPulseWidget } from '../AnatomyPulseWidget';
import { medicalAudio } from '../../../utils/audio';

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

  // Simulation Console Drawer: CLOSED by default for real clinical & hardware demonstration
  const [showSimDrawer, setShowSimDrawer] = useState(false);

  return (
    <div className="w-full space-y-8 animate-fadeIn font-mono text-slate-100">
      
      {/* Row 1: 4 High-Density ICU Vitals Tiles with Generous Breathing Room */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Tile 1: FC (BPM) */}
        <div className="bg-[#070b16]/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60" />
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="font-bold tracking-wider">FRÉQUENCE CARDIAQUE (POULS)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold">MAX30102</span>
          </div>
          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-5xl font-black text-emerald-400 font-mono tracking-tight">
              {vitals.finger ? bpm : '--'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">BPM</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between border-t border-slate-800/80 pt-2">
            <span>Cible : 60-100</span>
            <span className={`font-bold ${vitals.finger ? 'text-emerald-400' : 'text-slate-500'}`}>
              {vitals.finger ? 'Rythme Sinusal' : 'En attente doigt'}
            </span>
          </div>
        </div>

        {/* Tile 2: FR (CPM) */}
        <div className="bg-[#070b16]/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-sky-400 opacity-60" />
          <div className="flex items-center justify-between text-xs text-cyan-400">
            <span className="font-bold tracking-wider">FRÉQUENCE RESPIRATOIRE</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-bold">MPU6050</span>
          </div>
          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-5xl font-black text-cyan-400 font-mono tracking-tight">
              {vitals.resp}
            </span>
            <span className="text-xs text-slate-400 font-semibold">CPM</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between border-t border-slate-800/80 pt-2">
            <span>Cible : 12-20</span>
            <span className="text-cyan-400 font-bold">Eupnée Régulière</span>
          </div>
        </div>

        {/* Tile 3: MPU6050 Motion / Shock */}
        <div className="bg-[#070b16]/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-60" />
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span className="font-bold tracking-wider">ACCÉLÉROMÈTRE / CHOC</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400 font-bold">6-DOF</span>
          </div>
          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-5xl font-black text-amber-400 font-mono tracking-tight">
              {vitals.motion.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-semibold">g</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between border-t border-slate-800/80 pt-2">
            <span>Seuil critique &gt; 2.5g</span>
            <span className="text-amber-400 font-bold">Repos : 1.0g</span>
          </div>
        </div>

        {/* Tile 4: Syncope / Malaise Algorithm Status */}
        <div className={`bg-[#070b16]/90 border rounded-2xl p-5 shadow-xl transition-all duration-300 relative overflow-hidden group ${
          vitals.fallAlert || vitals.status === 'CHUTE_DETECTEE' || vitals.status === 'MALAISE_IMMINENT'
            ? 'border-rose-500 animate-pulse bg-rose-950/40' 
            : 'border-indigo-500/30 hover:border-indigo-500/50'
        }`}>
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            vitals.fallAlert || vitals.status === 'CHUTE_DETECTEE' || vitals.status === 'MALAISE_IMMINENT'
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-indigo-500 to-purple-400 opacity-60'
          }`} />
          <div className="flex items-center justify-between text-xs text-indigo-400">
            <span className="font-bold tracking-wider">DÉTECTION SYNCOPE VAGALE</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-bold">ALGORITHME</span>
          </div>
          <div className="flex items-baseline gap-2.5 my-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              vitals.fallAlert || vitals.status === 'CHUTE_DETECTEE' 
                ? 'text-rose-500' 
                : vitals.status === 'MALAISE_IMMINENT'
                ? 'text-rose-400'
                : 'text-indigo-300'
            }`}>
              {vitals.fallAlert || vitals.status === 'CHUTE_DETECTEE' 
                ? 'ALERTE CHUTE' 
                : vitals.status === 'MALAISE_IMMINENT'
                ? 'MALAISE IMMINENT'
                : 'SÉCURISÉ'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between border-t border-slate-800/80 pt-2">
            <span>Délai d'intervention</span>
            <span className="text-indigo-400 font-bold">15s sécurité SAMU</span>
          </div>
        </div>

      </div>

      {/* Row 2: 3D Anatomical Heart Stage (8 cols) + Physical OLED Hardware Unit (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Stage: 3D Heart Screen & Advanced Hemodynamic Telemetry (8 cols) */}
        <div className="xl:col-span-8 bg-[#050811] border border-slate-800/90 rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between space-y-6">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2.5 text-white font-bold">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="tracking-wide">ANATOMIE CARDIAQUE 3D • SYNCHRONISATION EN TEMPS RÉEL</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 font-mono font-bold">
              MODÈLE HAUTE PRÉCISION • 60 FPS
            </span>
          </div>

          {/* Central 3D Heart Stage with Structured Frame & Connected Caliper Badges */}
          <div className="relative w-full mx-auto h-[380px] my-1 flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 border border-slate-900">
            {/* HUD Grid Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none rounded-2xl" />

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
              </g>
            </svg>

            {/* Caliper Badge 1: Top-Left */}
            <div className="absolute top-3 left-3 z-20 pointer-events-auto bg-[#070d1e]/95 border border-emerald-500/50 rounded-xl px-3 py-2 shadow-xl font-mono text-left">
              <div className="text-[9px] text-emerald-400 font-bold tracking-wider">CROSSE AORTIQUE</div>
              <div className="text-xs font-black text-white">118 / 76 <span className="text-[8px] text-slate-400">mmHg</span></div>
            </div>

            {/* Caliper Badge 2: Top-Right */}
            <div className="absolute top-3 right-3 z-20 pointer-events-auto bg-[#070d1e]/95 border border-cyan-500/50 rounded-xl px-3 py-2 shadow-xl font-mono text-right">
              <div className="text-[9px] text-cyan-400 font-bold tracking-wider">TRONC PULMONAIRE</div>
              <div className="text-xs font-black text-white">15 <span className="text-[8px] text-slate-400">mmHg (PAP)</span></div>
            </div>

            {/* Caliper Badge 3: Bottom-Left */}
            <div className="absolute bottom-3 left-3 z-20 pointer-events-auto bg-[#070d1e]/95 border border-sky-500/50 rounded-xl px-3 py-2 shadow-xl font-mono text-left">
              <div className="text-[9px] text-sky-400 font-bold tracking-wider">VENTRICULE GAUCHE</div>
              <div className="text-xs font-black text-white">FE: 65% <span className="text-[8px] text-slate-400">NORM</span></div>
            </div>

            {/* Caliper Badge 4: Bottom-Right */}
            <div className="absolute bottom-3 right-3 z-20 pointer-events-auto bg-[#070d1e]/95 border border-rose-500/50 rounded-xl px-3 py-2 shadow-xl font-mono text-right">
              <div className="text-[9px] text-rose-400 font-bold tracking-wider">APEX CARDIAQUE</div>
              <div className="text-xs font-black text-white">{vitals.finger ? `${bpm} BPM LIVE` : '-- EN ATTENTE'}</div>
            </div>
          </div>

          {/* Lower Section: ICU Critical Care Hemodynamics Matrix */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tracking-wide">PARAMÈTRES HÉMODYNAMIQUES & INDEX DE PERFUSION</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Liaison I2C 0x57/0x68 Active
              </span>
            </div>

            {/* 4 Clinical Hemodynamic Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Tile 1: PAM (Pression Artérielle Moyenne) */}
              <div className="bg-[#070d1e]/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm hover:border-slate-700 transition">
                <div className="text-[10px] text-slate-400 font-medium">Pression Art. Moyenne</div>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  90 <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                </div>
                <div className="text-[9px] text-emerald-500 font-semibold mt-1">Cible : 70-105 mmHg</div>
              </div>

              {/* Tile 2: Débit Cardiaque (Cardiac Output) */}
              <div className="bg-[#070d1e]/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm hover:border-slate-700 transition">
                <div className="text-[10px] text-slate-400 font-medium">Débit Cardiaque (CO)</div>
                <div className="text-xl font-black text-cyan-400 mt-1">
                  {cardiacOutput} <span className="text-[10px] text-slate-400 font-normal">L/min</span>
                </div>
                <div className="text-[9px] text-cyan-500 font-semibold mt-1">Vol. Éjection : 70 mL</div>
              </div>

              {/* Tile 3: Indice de Perfusion (PI) */}
              <div className="bg-[#070d1e]/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm hover:border-slate-700 transition">
                <div className="text-[10px] text-slate-400 font-medium">Indice Perfusion (PI)</div>
                <div className="text-xl font-black text-sky-400 mt-1">
                  4.2 <span className="text-[10px] text-slate-400 font-normal">%</span>
                </div>
                <div className="text-[9px] text-sky-400 font-semibold mt-1">Perfusion Optimale</div>
              </div>

              {/* Tile 4: Résistance Vasculaire Systémique (RVS) */}
              <div className="bg-[#070d1e]/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-sm hover:border-slate-700 transition">
                <div className="text-[10px] text-slate-400 font-medium">Résistance Vasc. (RVS)</div>
                <div className="text-xl font-black text-amber-400 mt-1">
                  1120 <span className="text-[10px] text-slate-400 font-normal">dyn·s</span>
                </div>
                <div className="text-[9px] text-amber-500 font-semibold mt-1">Post-charge Normale</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Stage: OLED Simulator & Peripheral Guidance (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* OLED SSD1306 Display Mirror */}
          <OledDisplaySimulator 
            bpm={vitals.bpm}
            resp={vitals.resp}
            finger={vitals.finger}
            motion={vitals.motion}
            status={vitals.status}
          />

          {/* Clinical Peripheral & Acquisition Card */}
          <div className="bg-[#050811] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>CANAUX D'ACQUISITION EN DIRECT</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">115200 bps</span>
            </div>

            {/* Volunteer Guidance Prompt */}
            <div className={`p-3.5 rounded-2xl border text-[11px] leading-relaxed ${
              vitals.finger 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-900/80 border-slate-700 text-slate-300'
            }`}>
              <div className="flex items-center space-x-2 font-bold mb-1">
                {vitals.finger ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Volontaire connecté ({patient.prenom} {patient.nom})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>En attente de captation</span>
                  </>
                )}
              </div>
              <p className="text-slate-400">
                {vitals.finger
                  ? 'Mesure photopléthysmographique (PPG) et biomécanique en cours de streaming sans latence.'
                  : 'Placez l\'index sur la diode optique MAX30102 pour initialiser le pouls et l\'onde dicrote.'}
              </p>
            </div>

            {/* Bus status table */}
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center p-2 rounded-xl bg-black/50 border border-slate-900">
                <span className="text-slate-400">MAX30102 PPG Oximetry</span>
                <span className="text-emerald-400 font-bold">0x57 (3.3V)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-black/50 border border-slate-900">
                <span className="text-slate-400">MPU6050 Accéléromètre</span>
                <span className="text-cyan-400 font-bold">0x68 (3.3V)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-black/50 border border-slate-900">
                <span className="text-slate-400">OLED SSD1306 Display</span>
                <span className="text-amber-400 font-bold">0x3C (3.3V)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Dual Real-Time Sweep Oscilloscopes in Full Width */}
      <div className="bg-[#050811] border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <OscilloscopeCanvas
          bpm={vitals.bpm}
          resp={vitals.resp}
          finger={vitals.finger}
          isAlarmActive={isAlarmActive}
          soundEnabled={soundEnabled}
        />
      </div>

      {/* Row 4: Thoracic Dynamics & Sensor Map (Full Width with Ample Breathing Room) */}
      <div className="w-full">
        <AnatomyPulseWidget 
          bpm={vitals.bpm}
          resp={vitals.resp}
          motion={vitals.motion}
          finger={vitals.finger}
          status={vitals.status}
        />
      </div>

      {/* Row 5: Simulation Console (Closed by default for real hardware demonstration) */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => {
              medicalAudio.playUiClick();
              setShowSimDrawer(prev => !prev);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition shadow-md cursor-pointer w-fit"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>
              {showSimDrawer
                ? 'Masquer le Simulateur Clinique & Console Série'
                : 'Ouvrir le Banc d\'Essai & Simulateur Clinique (Optionnel)'}
            </span>
            {showSimDrawer ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          
          <span className="text-[11px] font-mono text-slate-500">
            Démonstration clinique : capteurs physiques MAX30102 & MPU6050 reliés en direct
          </span>
        </div>

        {showSimDrawer && (
          <div className="animate-fadeIn mt-4">
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
        )}
      </div>

    </div>
  );
};
