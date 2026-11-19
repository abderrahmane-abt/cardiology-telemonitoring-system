import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  User, 
  Calendar, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  BatteryMedium, 
  Cpu, 
  Radio, 
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { medicalAudio } from '../utils/audio';

interface HeaderProps {
  activeTab: 'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS';
  setActiveTab: (tab: 'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  openHardwareModal: () => void;
  isAlarmActive: boolean;
  isPregnant: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  openHardwareModal,
  isAlarmActive,
  isPregnant
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (tab: 'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS') => {
    medicalAudio.playUiClick();
    setActiveTab(tab);
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      setTimeout(() => medicalAudio.playHeartbeat(75, 98), 50);
    }
  };

  return (
    <header className="bg-[#070c18]/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Clinical System Identification */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 ring-1 ring-white/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight text-white font-mono flex items-center space-x-1.5">
                  <span>PULSE-ESP32</span>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  CardioPulse TeleMed v2.6
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                Moniteur de Signes Vitaux Portable & Télémédecine Clinique
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Bento Segmented Controller) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => handleTabClick('DASHBOARD')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'DASHBOARD'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Monitoring Direct</span>
            </button>

            <button
              onClick={() => handleTabClick('PATIENT')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'PATIENT'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Fiche Patient</span>
              {isPregnant && (
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => handleTabClick('HISTORY')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendrier & Relevés</span>
            </button>

            <button
              onClick={() => handleTabClick('SOS')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'SOS'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isAlarmActive ? 'animate-bounce' : ''}`} />
              <span>Urgence SOS (580)</span>
            </button>
          </nav>

          {/* Telemetry Status & Utility Actions */}
          <div className="flex items-center space-x-3">
            {/* Live Clock with Tabular Monospace */}
            <div className="hidden lg:flex flex-col text-right font-mono">
              <span className="text-xs font-bold text-slate-100 tracking-wider">
                {time.toLocaleTimeString('fr-FR')}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">
                {time.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Hardware Status Pills */}
            <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono">
              {/* ESP32 Status */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-emerald-400">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>ESP32 OK</span>
              </div>

              {/* Battery Indicator */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
                <span>88% (3.95V)</span>
              </div>
            </div>

            {/* Hardware Architecture Modal Trigger */}
            <button
              onClick={() => {
                medicalAudio.playUiClick();
                openHardwareModal();
              }}
              title="Architecture Électronique & Câblage ESP32"
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-indigo-400 transition cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
            </button>

            {/* Audio Mute / Unmute */}
            <button
              onClick={handleToggleSound}
              title={soundEnabled ? 'Désactiver les signaux sonores' : 'Activer le bip cardiaque & sirène'}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-950'
                  : 'bg-slate-900/80 border-slate-800 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/80 text-[11px] font-semibold">
          <button
            onClick={() => handleTabClick('DASHBOARD')}
            className={`py-1 px-2.5 rounded-lg flex items-center space-x-1.5 ${
              activeTab === 'DASHBOARD' ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Monitoring</span>
          </button>
          <button
            onClick={() => handleTabClick('PATIENT')}
            className={`py-1 px-2.5 rounded-lg flex items-center space-x-1.5 ${
              activeTab === 'PATIENT' ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient</span>
          </button>
          <button
            onClick={() => handleTabClick('HISTORY')}
            className={`py-1 px-2.5 rounded-lg flex items-center space-x-1.5 ${
              activeTab === 'HISTORY' ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Historique</span>
          </button>
          <button
            onClick={() => handleTabClick('SOS')}
            className={`py-1 px-2.5 rounded-lg flex items-center space-x-1.5 ${
              activeTab === 'SOS' ? 'text-rose-400 font-bold bg-rose-950/40' : 'text-rose-400/70'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOS (580)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
