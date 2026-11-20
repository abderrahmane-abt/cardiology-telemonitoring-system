import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Cpu,
  Menu,
  Usb
} from 'lucide-react';
import type { PatientProfile, VitalSigns } from '../types/medical';
import { medicalAudio } from '../utils/audio';
import { UI_STYLES } from '../types/themeStyles';
import type { UIStyleId } from '../types/themeStyles';
import type { ConnectionMode, ConnectionStatus } from '../services/telemetryService';

interface TopNavbarProps {
  activeTab: 'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS';
  patient: PatientProfile;
  vitals: VitalSigns;
  isAlarmActive: boolean;
  theme?: 'light' | 'dark';
  onTriggerEmergency: () => void;
  openHardwareModal: () => void;
  currentStyle?: UIStyleId;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  hardwareStatus?: {
    mode: ConnectionMode;
    status: ConnectionStatus;
    packets: number;
    onConnectUsb: () => void;
    onDisconnect: () => void;
  };
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  patient,
  vitals,
  isAlarmActive,
  onTriggerEmergency,
  openHardwareModal,
  currentStyle = 'ICU_OBSIDIAN',
  isSidebarCollapsed,
  onToggleSidebar,
  hardwareStatus
}) => {
  const [timeStr, setTimeStr] = useState('');

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.ICU_OBSIDIAN;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (vitals.status) {
      case 'NORMAL':
        return {
          label: 'Rythme Sinusal',
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2
        };
      case 'TACHYCARDIE':
        return {
          label: `Tachycardie (${vitals.bpm} BPM)`,
          classes: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
          icon: Flame
        };
      case 'BRADYCARDIE':
        return {
          label: `Bradycardie (${vitals.bpm} BPM)`,
          classes: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: AlertTriangle
        };
      case 'CHUTE_DETECTEE':
        return {
          label: 'ALERTE CHUTE',
          classes: 'bg-rose-600 text-white animate-bounce shadow-md shadow-rose-500/40 font-bold',
          icon: ShieldAlert
        };
      case 'MALAISE_IMMINENT':
        return {
          label: 'MALAISE VAGAL',
          classes: 'bg-rose-500/25 text-rose-300 border-2 border-rose-500 animate-pulse font-bold',
          icon: AlertTriangle
        };
      case 'DOIGT_NON_DETECTE':
        return {
          label: 'Capteur en attente',
          classes: 'bg-slate-800 text-slate-300 border border-slate-700 animate-pulse',
          icon: AlertTriangle
        };
      default:
        return {
          label: 'Vigilance Clinique',
          classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: AlertTriangle
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const tabTitles = {
    DASHBOARD: {
      title: 'Surveillance Télémétrique',
      badge: 'ESP32 • Temps Réel'
    },
    PATIENT: {
      title: 'Dossier Patiente',
      badge: 'Biométrie & Obstétrique'
    },
    HISTORY: {
      title: 'Journal & Historique',
      badge: 'Constantes & Rapports'
    },
    SOS: {
      title: 'Centrale d\'Urgence',
      badge: 'Protocole SAMU 580'
    }
  };

  return (
    <header className={`h-16 px-5 sm:px-6 flex items-center justify-between border-b transition-colors duration-200 relative z-30 ${
      styleConfig.topbarBg
    } ${styleConfig.topbarBorder} ${styleConfig.mainText} shadow-md backdrop-blur-md`}>
      
      {/* Left: Menu & Module Context */}
      <div className="flex items-center gap-3 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={() => {
              medicalAudio.playUiClick();
              onToggleSidebar();
            }}
            title={isSidebarCollapsed ? "Déplier le menu" : "Replier le menu"}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-extrabold text-white tracking-wide">
            {tabTitles[activeTab].title}
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold hidden lg:inline">
            {tabTitles[activeTab].badge}
          </span>
        </div>
      </div>

      {/* Center: Patient Identity Badge (Clear & Uncluttered) */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-white">{patient.prenom} {patient.nom}</span>
        <span className="text-slate-400">({patient.age} ans)</span>
        <span className="px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
          {patient.semainesAmenorrhee ?? 26} SA
        </span>
        <span className="text-slate-700">•</span>
        <span className="text-rose-400 font-bold">{patient.groupeSanguin}</span>
      </div>

      {/* Right: Status, Hardware USB, Clock & Emergency Trigger */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Live Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${statusBadge.classes}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{statusBadge.label}</span>
        </div>

        {/* Hardware Web Serial USB Button */}
        {hardwareStatus && (
          hardwareStatus.mode === 'WEB_SERIAL' && hardwareStatus.status === 'CONNECTED' ? (
            <button
              onClick={() => {
                medicalAudio.playUiClick();
                hardwareStatus.onDisconnect();
              }}
              title="ESP32 connecté en direct USB via Web Serial. Cliquez pour déconnecter."
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 font-mono text-xs font-bold transition hover:bg-emerald-500/30 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Usb className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">ESP32 En Ligne</span>
            </button>
          ) : (
            <button
              onClick={() => {
                medicalAudio.playUiClick();
                hardwareStatus.onConnectUsb();
              }}
              title="Connecter votre Arduino / ESP32 directement via câble USB"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 font-mono text-xs font-semibold transition cursor-pointer"
            >
              <Usb className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Connecter USB</span>
            </button>
          )
        )}

        {/* Compact Digital Clock & Hardware Link Modal */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs bg-slate-900/80 border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
          <span className="text-slate-700">•</span>
          <button 
            onClick={openHardwareModal} 
            title="Consulter l'architecture ESP32"
            className="flex items-center gap-1 hover:text-emerald-400 transition-colors text-emerald-400 cursor-pointer font-bold"
          >
            <Cpu className="w-3 h-3" />
            <span>ESP32</span>
          </button>
        </div>

        {/* SOS Emergency Test Button */}
        <button
          onClick={() => {
            medicalAudio.playUiClick();
            onTriggerEmergency();
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
            isAlarmActive 
              ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/50' 
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-95'
          }`}
        >
          <Bell className="w-3.5 h-3.5 animate-bounce" />
          <span>TEST ALERTE</span>
        </button>
      </div>
    </header>
  );
};
