import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Cpu,
  Menu
} from 'lucide-react';
import type { PatientProfile, VitalSigns } from '../types/medical';
import { medicalAudio } from '../utils/audio';
import { UI_STYLES } from '../types/themeStyles';
import type { UIStyleId } from '../types/themeStyles';

interface TopNavbarProps {
  activeTab: 'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS';
  patient: PatientProfile;
  vitals: VitalSigns;
  isAlarmActive: boolean;
  theme: 'light' | 'dark';
  onTriggerEmergency: () => void;
  openHardwareModal: () => void;
  currentStyle?: UIStyleId;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  patient,
  vitals,
  isAlarmActive,
  theme,
  onTriggerEmergency,
  openHardwareModal,
  currentStyle = 'MEDICARE_LIGHT',
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.MEDICARE_LIGHT;
  const isLight = styleConfig.themeMode === 'light';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (vitals.status) {
      case 'NORMAL':
        return {
          label: 'Rythme Sinusal Normal',
          classes: theme === 'dark' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2
        };
      case 'TACHYCARDIE':
        return {
          label: `Tachycardie (${vitals.bpm} BPM)`,
          classes: 'bg-rose-500/15 text-rose-500 border-rose-500/30 animate-pulse',
          icon: Flame
        };
      case 'BRADYCARDIE':
        return {
          label: `Bradycardie (${vitals.bpm} BPM)`,
          classes: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
          icon: AlertTriangle
        };
      case 'CHUTE_DETECTEE':
        return {
          label: 'ALERTE CHUTE / SYNCOPE',
          classes: 'bg-rose-600 text-white animate-bounce shadow-md shadow-rose-500/40',
          icon: ShieldAlert
        };
      case 'DOIGT_NON_DETECTE':
        return {
          label: 'Capteur MAX30102 Déconnecté',
          classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
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
      title: 'Surveillance Cardiologique & Télémétrie',
      subtitle: 'Flux temps réel ESP32 • PPG MAX30102 & Inclinométrie Thoracique MPU6050'
    },
    PATIENT: {
      title: 'Fiche & Dossier Médical Personnalisé',
      subtitle: `Dossier de Mme ${patient.prenom} ${patient.nom} • Suivi de Grossesse ${patient.semainesAmenorrhee ?? 26} SA`
    },
    HISTORY: {
      title: 'Calendrier & Journal d\'Audit Clinique',
      subtitle: 'Historique chronologique des constantes, moyennes et rapports téléchargeables'
    },
    SOS: {
      title: 'Centre d\'Urgence & Protocole Syncope (SAMU 580)',
      subtitle: 'Procédure d\'intervention rapide, géolocalisation et liaison avec les secours'
    }
  };

  return (
    <header className={`h-18 px-6 flex items-center justify-between border-b transition-colors duration-200 relative z-30 ${
      styleConfig.topbarBg
    } ${styleConfig.topbarBorder} ${styleConfig.mainText} shadow-sm backdrop-blur-md`}>
      {/* Tab Context / Title & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={() => {
              medicalAudio.playUiClick();
              onToggleSidebar();
            }}
            title={isSidebarCollapsed ? "Déplier le menu latéral" : "Replier le menu latéral"}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {tabTitles[activeTab].title}
          </h1>
          <p className="text-xs text-slate-400 font-sans hidden sm:block">
            {tabTitles[activeTab].subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Patient Pill, Status Badge, Time, SOS Trigger */}
      <div className="flex items-center gap-3">
        {/* Patient Obstetric Pill */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{patient.prenom} {patient.nom}</span>
          <span className="text-slate-400">({patient.age} ans)</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px]">
            {patient.semainesAmenorrhee ?? 26} SA
          </span>
        </div>

        {/* Live Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${statusBadge.classes}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{statusBadge.label}</span>
        </div>

        {/* Live Clock & Hardware Beacon */}
        <div className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{dateStr}</span>
          <span>•</span>
          <span>{timeStr}</span>
          <span className="text-slate-400">•</span>
          <button 
            onClick={openHardwareModal} 
            title="Consulter l'architecture ESP32"
            className="flex items-center gap-1 hover:text-emerald-500 transition-colors text-emerald-600 dark:text-emerald-400"
          >
            <Cpu className="w-3 h-3" />
            <span>ESP32 OK</span>
          </button>
        </div>

        {/* SOS Emergency Button */}
        <button
          onClick={() => {
            medicalAudio.playUiClick();
            onTriggerEmergency();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
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
