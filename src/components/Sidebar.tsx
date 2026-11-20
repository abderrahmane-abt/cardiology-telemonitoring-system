import React from 'react';
import { 
  Activity, 
  User, 
  Calendar, 
  ShieldAlert, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Radio, 
  Heart,
  Menu,
  PanelLeftClose
} from 'lucide-react';
import type { PatientProfile } from '../types/medical';
import { medicalAudio } from '../utils/audio';
import { UI_STYLES } from '../types/themeStyles';
import type { UIStyleId } from '../types/themeStyles';

interface SidebarProps {
  activeTab: 'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS';
  setActiveTab: (tab: 'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS') => void;
  patient: PatientProfile;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  openHardwareModal: () => void;
  isAlarmActive: boolean;
  currentStyle?: UIStyleId;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  patient,
  soundEnabled,
  setSoundEnabled,
  openHardwareModal,
  isAlarmActive,
  currentStyle = 'ICU_OBSIDIAN',
  isCollapsed: propIsCollapsed,
  onToggleCollapse
}) => {
  // Default to CLOSED (true) keeping only icons visible
  const [internalCollapsed, setInternalCollapsed] = React.useState(true);
  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => {
    medicalAudio.playUiClick();
    setInternalCollapsed(prev => !prev);
  });

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.ICU_OBSIDIAN;
  const isLight = styleConfig.themeMode === 'light';

  const handleTabClick = (tab: 'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS') => {
    medicalAudio.playUiClick();
    setActiveTab(tab);
  };

  const navItems = [
    {
      id: 'DASHBOARD' as const,
      label: 'Monitoring & Cardiologie',
      sublabel: 'Vue 3D & Constantes',
      icon: Activity,
      badge: 'LIVE'
    },
    {
      id: 'PATIENT' as const,
      label: 'Dossier Patient',
      sublabel: `${patient.prenom} (26 SA)`,
      icon: User
    },
    {
      id: 'HISTORY' as const,
      label: 'Calendrier & Relevés',
      sublabel: 'Historique & Rapports',
      icon: Calendar
    },
    {
      id: 'SOS' as const,
      label: 'Urgence SOS (580)',
      sublabel: 'SAMU & Protocole Syncope',
      icon: ShieldAlert,
      isEmergency: true
    }
  ];

  return (
    <aside 
      className={`flex-shrink-0 flex flex-col justify-between border-r transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${styleConfig.sidebarBg} ${styleConfig.sidebarBorder} ${styleConfig.mainText}`}
    >
      {/* Top Brand & Collapse Toggle */}
      <div>
        {isCollapsed ? (
          /* Collapsed Header: Toggle Menu Button & Mini Heart Icon */
          <div className={`py-4 px-2 border-b flex flex-col items-center gap-3 ${
            isLight ? 'border-slate-100' : 'border-slate-800/80'
          }`}>
            <button
              onClick={toggleCollapse}
              title="Ouvrir le menu latéral"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                isLight 
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-700 hover:border-slate-300' 
                  : 'border-slate-700 hover:bg-slate-800 text-slate-200 hover:border-slate-600'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm text-white transition-all cursor-pointer"
              onClick={toggleCollapse}
              title="CardioPulse TeleMed v2.6 (Cliquer pour ouvrir)"
              style={{
                backgroundColor: isAlarmActive ? '#f43f5e' : styleConfig.accentPrimary,
                boxShadow: `0 4px 12px ${isAlarmActive ? 'rgba(244,63,94,0.4)' : styleConfig.accentPrimary + '40'}`
              }}
            >
              <Heart className="w-4.5 h-4.5 fill-current" />
            </div>
          </div>
        ) : (
          /* Expanded Header: Full Brand Name & Close Button */
          <div className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'border-slate-100' : 'border-slate-800/80'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm text-white transition-all flex-shrink-0"
                style={{
                  backgroundColor: isAlarmActive ? '#f43f5e' : styleConfig.accentPrimary,
                  boxShadow: `0 4px 12px ${isAlarmActive ? 'rgba(244,63,94,0.4)' : styleConfig.accentPrimary + '40'}`
                }}
              >
                <Heart className="w-4.5 h-4.5 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold tracking-tight text-sm truncate ${styleConfig.mainText}`}>
                    CardioPulse <span style={{ color: styleConfig.accentPrimary }}>TeleMed</span>
                  </span>
                  <span 
                    className="text-[9px] px-1 py-0.2 rounded-full font-mono font-bold"
                    style={{
                      backgroundColor: `${styleConfig.accentPrimary}20`,
                      color: styleConfig.accentPrimary
                    }}
                  >
                    v2.6
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-none mt-0.5 truncate">
                  Système ESP32
                </p>
              </div>
            </div>

            {/* Menu collapse button */}
            <button
              onClick={toggleCollapse}
              title="Replier le menu (afficher uniquement les icônes)"
              className={`p-1.5 rounded-lg border transition-colors flex-shrink-0 ${
                isLight 
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800' 
                  : 'border-slate-700/80 hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <div className={`p-2 space-y-1.5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {!isCollapsed && (
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Menu Clinique
            </p>
          )}

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            if (isCollapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={`${item.label} • ${item.sublabel}`}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 relative group ${
                    isActive
                      ? item.isEmergency
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : isLight
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : isLight
                        ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.isEmergency && isAlarmActive && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                  {item.badge && (
                    <span 
                      className="absolute -top-1 -right-1 text-[8px] px-1 py-0.2 rounded-full font-mono font-bold text-white shadow-xs"
                      style={{ backgroundColor: styleConfig.accentPrimary }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group relative ${
                  isActive
                    ? item.isEmergency
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-medium'
                      : isLight
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium shadow-sm'
                        : 'bg-white/10 text-white border border-white/15 font-medium shadow-sm'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <div 
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? item.isEmergency
                        ? 'bg-white/20 text-white'
                        : isLight
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-white/15 text-white'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span 
                        className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold tracking-wider text-white"
                        style={{ backgroundColor: styleConfig.accentPrimary }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.isEmergency && isAlarmActive && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                  <span className={`text-[10px] block truncate ${
                    isActive ? (isLight ? 'text-emerald-700' : 'text-slate-200') : 'text-slate-400'
                  }`}>
                    {item.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Architecture Button (Pulled Down), Patient Card & Sound Toggle */}
      <div className={`p-2.5 space-y-2 border-t ${
        isLight ? 'border-slate-100 bg-slate-50/70' : 'border-slate-800/80 bg-slate-950'
      }`}>
        {isCollapsed ? (
          /* Collapsed Bottom: Architecture Icon, Initial Avatar & Audio Button */
          <div className="flex flex-col items-center gap-2.5 py-1">
            <button
              onClick={() => {
                medicalAudio.playUiClick();
                openHardwareModal();
              }}
              title="Architecture Matérielle & Règles Critiques de Sécurité"
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-500 hover:text-cyan-700 hover:border-cyan-300 shadow-2xs'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-500" />
            </button>

            <div 
              title={`${patient.prenom} ${patient.nom} (${patient.semainesAmenorrhee ?? 26} SA - ${patient.groupeSanguin})`}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 flex items-center justify-center text-white text-xs font-bold shadow-xs cursor-pointer hover:scale-105 transition-transform"
            >
              AE
            </div>

            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                medicalAudio.setMuted(!next);
                if (next) medicalAudio.playUiClick();
              }}
              title={soundEnabled ? 'Couper les bips sonores' : 'Activer les bips sonores'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                soundEnabled
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : isLight
                    ? 'bg-white text-slate-400 border border-slate-200'
                    : 'bg-slate-800/60 text-slate-500 border border-slate-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          /* Expanded Bottom: Architecture Button + Full Patient Glance & Audio Switcher */
          <>
            {/* Architecture Matérielle & Règles Critiques Button (Pulled Down to the Bottom) */}
            <button
              onClick={() => {
                medicalAudio.playUiClick();
                openHardwareModal();
              }}
              title="Architecture Matérielle & Règles Critiques de Sécurité"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border ${
                isLight
                  ? 'bg-white border-slate-200/90 text-slate-700 hover:border-cyan-400 hover:text-cyan-700 shadow-2xs'
                  : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400'
              }`}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                isLight ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-800 text-cyan-400'
              }`}>
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold block truncate">Architecture Matérielle</span>
                <span className="text-[10px] text-slate-400 block truncate">Règles Critiques & Sécurité</span>
              </div>
            </button>

            {/* Quick Patient Glance */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
              isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                AE
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold truncate block ${styleConfig.mainText}`}>
                  {patient.prenom} {patient.nom}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span>{patient.groupeSanguin}</span>
                  <span>•</span>
                  <span className="text-amber-500 font-semibold">{patient.semainesAmenorrhee ?? 26} SA</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  medicalAudio.setMuted(!next);
                  if (next) medicalAudio.playUiClick();
                }}
                title={soundEnabled ? 'Couper les bips sonores' : 'Activer les bips sonores'}
                className={`flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs transition-all ${
                  soundEnabled
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : isLight
                      ? 'bg-white text-slate-400 border border-slate-200'
                      : 'bg-slate-800/60 text-slate-500 border border-slate-800'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-mono">{soundEnabled ? 'Son ON' : 'Muet'}</span>
              </button>

              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span className="text-emerald-500 font-bold">88%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
