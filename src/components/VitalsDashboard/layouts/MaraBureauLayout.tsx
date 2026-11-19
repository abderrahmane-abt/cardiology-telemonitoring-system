import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Droplets, 
  TrendingUp, 
  ShieldCheck, 
  Brain, 
  Wind
} from 'lucide-react';
import type { VitalSigns, PatientProfile } from '../../../types/medical';
import { Heart3DCanvas } from '../Heart3DCanvas';
import { medicalAudio } from '../../../utils/audio';

interface MaraBureauLayoutProps {
  vitals: VitalSigns;
  patient: PatientProfile;
  soundEnabled: boolean;
  isAlarmActive: boolean;
  onTriggerEmergencyAlert: (reason: string) => void;
}

export const MaraBureauLayout: React.FC<MaraBureauLayoutProps> = ({
  vitals,
  patient,
  isAlarmActive,
  onTriggerEmergencyAlert
}) => {
  const [selectedOrgan, setSelectedOrgan] = useState<'HEART' | 'BRAIN' | 'LUNGS'>('HEART');

  const bpm = vitals.finger && vitals.bpm > 0 ? vitals.bpm : 0;
  const strokeVolume = Math.round(70 - Math.abs(bpm - 75) * 0.2);
  const cardiacOutput = bpm > 0 ? ((bpm * strokeVolume) / 1000).toFixed(1) : '0.0';

  const diseaseRisks = [
    { name: 'Coronary Heart Disease', risk: 'Faible', score: '12%', status: 'safe' },
    { name: 'A Stroke (AVC)', risk: 'Optimale', score: '8%', status: 'safe' },
    { name: 'Heart Failure (Insuffisance)', risk: 'Surveillance', score: '14%', status: 'monitor' },
    { name: 'Arrhythmia', risk: vitals.status === 'NORMAL' ? 'Rythme Sinusal' : 'À Vérifier', score: 'Norm', status: vitals.status === 'NORMAL' ? 'safe' : 'alert' },
    { name: 'Myocardial Infarction', risk: 'Protégé', score: '4%', status: 'safe' }
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn text-slate-800">
      {/* Layout Split: Left (60% Bento Metrics & Organs) + Right (40% 3D Heart & Disease Risks) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 7 cols */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Header Title with Breadcrumb & Inspiration Tag */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
                <span className="text-sm font-semibold text-slate-400">• Métriques Vitales</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Suivi télémétrique ambulatoire — Mme {patient.prenom} {patient.nom} ({patient.semainesAmenorrhee ?? 26} SA)
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              Style Mara Bureau
            </span>
          </div>

          {/* 6 BENTO METRIC CARDS GRID (2 cols x 3 rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Card 1: Blood Pressure */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500">Pression Artérielle</span>
                <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">118/76</span>
                <span className="text-[11px] text-slate-400 font-semibold">mmHg</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <span>Normotension</span> • <span className="font-mono text-slate-500">120/80 cible</span>
              </div>
              {/* Sinusoidal Wave SVG */}
              <div className="h-10 mt-3 flex items-end">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path 
                    d="M 0 15 Q 12 5, 25 15 T 50 15 T 75 15 T 100 15" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                  <circle cx="75" cy="15" r="3.5" fill="#3b82f6" />
                </svg>
              </div>
            </div>

            {/* Card 2: Cardiac Output */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500">Débit Cardiaque</span>
                <span className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                  <Droplets className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">{cardiacOutput}</span>
                <span className="text-[11px] text-slate-400 font-semibold">L/Min</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Vol. Éjection : <span className="font-mono font-bold text-slate-700">{strokeVolume} mL</span>
              </div>
              {/* Stylized Vertical Bar Graph */}
              <div className="h-10 mt-3 flex items-end gap-1.5 justify-between">
                {[45, 65, 80, 55, 90, 70, 85, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-slate-100 rounded-t-sm h-full flex items-end">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-500 ${i === 4 ? 'bg-blue-600' : 'bg-blue-300'}`} 
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Oxygen Saturation (SpO2) */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500">Saturation O2</span>
                <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Wind className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">{vitals.finger ? '98' : '--'}</span>
                <span className="text-[11px] text-slate-400 font-semibold">% SpO2</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Excellente oxygénation
              </div>
              {/* Smooth Rising Curve */}
              <div className="h-10 mt-3 flex items-end">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path 
                    d="M 0 25 C 25 22, 50 18, 70 10 S 90 6, 100 5" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="5" r="3.5" fill="#10b981" />
                </svg>
              </div>
            </div>

            {/* Card 4: Fréquence Cardiaque (FC) */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500">Pouls Cardiaque</span>
                <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                  <Heart className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-rose-600">{bpm}</span>
                <span className="text-[11px] text-slate-400 font-semibold">BPM</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                MAX30102 • <span className="text-emerald-600 font-semibold">Rythme Sinusal</span>
              </div>
              {/* Pulsing Curve */}
              <div className="h-10 mt-3 flex items-end">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path 
                    d="M 0 15 L 20 15 L 26 5 L 34 25 L 40 15 L 60 15 L 66 7 L 74 23 L 80 15 L 100 15" 
                    fill="none" 
                    stroke="#f43f5e" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 5: Fréquence Respiratoire (FR) */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500">Respiration MPU</span>
                <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900">{vitals.resp}</span>
                <span className="text-[11px] text-slate-400 font-semibold">CPM</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Inclinomètre • <span className="font-semibold text-emerald-600">Eupnéique</span>
              </div>
              {/* Respiratory sine wave */}
              <div className="h-10 mt-3 flex items-end">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path 
                    d="M 0 15 Q 16 0, 33 15 T 66 15 T 100 15" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 6: Ejection Fraction / Syncope Protection */}
            <div 
              onClick={() => onTriggerEmergencyAlert('Test Alerte Déclenchée depuis Mara Bureau')}
              className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-500">Sécurité Syncope</span>
                <span className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-teal-600">
                  {vitals.fallAlert ? 'ALERTE' : 'SÉCURITÉ'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Choc MPU : <span className="font-mono font-bold">{vitals.motion.toFixed(2)} g</span>
              </div>
              {/* Progress bars */}
              <div className="h-10 mt-3 flex items-center">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${vitals.fallAlert ? 'bg-rose-500 w-full' : 'bg-teal-500 w-1/4'}`}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* "• My Body Condition" ORGAN CAROUSEL (Directly from Mara Bureau design) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">My Body Condition</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Surveillance multisystémique</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Organ 1: Heart */}
              <div 
                onClick={() => {
                  medicalAudio.playUiClick();
                  setSelectedOrgan('HEART');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedOrgan === 'HEART' 
                    ? 'border-blue-500 bg-blue-50/40 shadow-sm scale-[1.02]' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3 mx-auto">
                  <Heart className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-center">
                  <button className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs shadow-sm shadow-blue-500/30">
                    My Heart
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">
                    <span className="font-mono font-bold text-slate-800">{bpm} BPM</span> • Sinusal
                  </p>
                </div>
              </div>

              {/* Organ 2: Brain */}
              <div 
                onClick={() => {
                  medicalAudio.playUiClick();
                  setSelectedOrgan('BRAIN');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedOrgan === 'BRAIN' 
                    ? 'border-blue-500 bg-blue-50/40 shadow-sm scale-[1.02]' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 mb-3 mx-auto">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                    My Brain
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Perfusion cérébrale <span className="font-semibold text-emerald-600">Stable</span>
                  </p>
                </div>
              </div>

              {/* Organ 3: Lungs */}
              <div 
                onClick={() => {
                  medicalAudio.playUiClick();
                  setSelectedOrgan('LUNGS');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedOrgan === 'LUNGS' 
                    ? 'border-blue-500 bg-blue-50/40 shadow-sm scale-[1.02]' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-3 mx-auto">
                  <Wind className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                    My Lungs
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">
                    <span className="font-mono font-bold text-slate-800">{vitals.resp} CPM</span> • Eupnée
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 5 cols (Dominant 3D Heart in Circular Halo + Disease Risks + AI Doctor) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* 3D Heart Card with Circular Ripple Halo (Matching Mara Bureau Shot) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
            
            {/* Header info */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Surveillance Cardiaque 3D</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                Vue Fixe
              </span>
            </div>

            {/* Circular Ripple Pedestal & 3D Three.js Heart */}
            <div className="relative w-full h-84 flex items-center justify-center my-2">
              
              {/* Concentric ripple halo circles in the background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full border border-blue-100/80 animate-ping opacity-20" />
                <div className="absolute w-64 h-64 rounded-full border border-slate-100 shadow-inner" />
                <div className="absolute w-52 h-52 rounded-full border border-blue-50 shadow-sm" />
                <div className="absolute w-40 h-40 rounded-full bg-gradient-to-b from-blue-50/50 to-transparent" />
              </div>

              {/* The Live 3D Heart Canvas */}
              <div className="w-full h-full relative z-10 pointer-events-none select-none">
                <Heart3DCanvas 
                  vitals={vitals} 
                  isAlarmActive={isAlarmActive} 
                  currentStyle="MEDICARE_LIGHT" 
                  hideOverlayCards={true}
                />
              </div>

              {/* SVG Anatomical Leader Lines & Arrow Pointers (Mara Bureau Signature Medical Style) */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
                viewBox="0 0 400 340"
                preserveAspectRatio="none"
              >
                {/* 1. Right Leader Arrow: Blood Flow Card -> Aortic Arch */}
                <g>
                  <polyline 
                    points="270,55 240,55 212,110" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="1.75" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="4 2"
                  />
                  <circle cx="270" cy="55" r="3" fill="#2563eb" />
                  <circle cx="212" cy="110" r="7" fill="none" stroke="#2563eb" strokeWidth="1" opacity="0.6" className="animate-ping" />
                  <circle cx="212" cy="110" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="212" cy="110" r="1.5" fill="#2563eb" />
                </g>

                {/* 2. Left Leader Arrow: Systolic Pressure Card -> Aortic Valve Root */}
                <g>
                  <polyline 
                    points="130,55 160,55 186,115" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1.75" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="4 2"
                  />
                  <circle cx="130" cy="55" r="3" fill="#10b981" />
                  <circle cx="186" cy="115" r="7" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.6" className="animate-ping" />
                  <circle cx="186" cy="115" r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <circle cx="186" cy="115" r="1.5" fill="#10b981" />
                </g>

                {/* 3. Bottom Leader Arrow: Apex Synchrony Badge -> Apical Ventricle */}
                <g>
                  <polyline 
                    points="200,285 200,242" 
                    fill="none" 
                    stroke="#f43f5e" 
                    strokeWidth="1.75" 
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                  />
                  <circle cx="200" cy="285" r="2.5" fill="#f43f5e" />
                  <circle cx="200" cy="242" r="7" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" className="animate-ping" />
                  <circle cx="200" cy="242" r="4" fill="#ffffff" stroke="#f43f5e" strokeWidth="2" />
                  <circle cx="200" cy="242" r="1.5" fill="#f43f5e" />
                </g>
              </svg>

              {/* Floating "Pression Systolique" badge on the Left */}
              <div className="absolute top-6 left-3 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 shadow-md z-20 pointer-events-auto">
                <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Pression Systolique</span>
                </div>
                <div className="text-xs font-mono font-black text-slate-900 mt-0.5">
                  118 <span className="text-[9px] text-slate-500 font-semibold">mmHg</span>
                </div>
              </div>

              {/* Floating "Blood Flow" card attached to the heart on the Right (Like Mara Bureau shot) */}
              <div className="absolute top-6 right-3 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-lg z-20 pointer-events-auto">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Blood Flow</span>
                </div>
                <div className="text-sm font-mono font-extrabold text-slate-900 mt-0.5">
                  {cardiacOutput} <span className="text-[10px] text-slate-500">L/min</span>
                </div>
                {/* Mini vertical bars visualizer */}
                <div className="flex items-end gap-1 mt-1.5 h-3.5 w-16">
                  {[40, 70, 55, 90, 65].map((val, i) => (
                    <div key={i} className="flex-1 bg-blue-100 rounded-t-sm h-full flex items-end">
                      <div className="w-full bg-blue-600 rounded-t-sm" style={{ height: `${val}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Bottom Apex Synchrony Badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full px-3 py-1 shadow-sm z-20 pointer-events-auto flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-slate-700">Apex Cardiaque : Synchrone ({bpm} BPM)</span>
              </div>

            </div>

            {/* Disease Risks List (Matching Mara Bureau Shot) */}
            <div className="pt-4 border-t border-slate-100 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Disease Risks • Analyse Clinique
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Indice Stable
                </span>
              </div>

              <div className="space-y-2">
                {diseaseRisks.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px]">{index + 1}.</span>
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[11px] font-bold text-slate-500">{item.score}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'safe' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : item.status === 'alert' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.risk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
