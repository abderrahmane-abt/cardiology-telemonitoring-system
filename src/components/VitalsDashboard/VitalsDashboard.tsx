import React, { useState } from 'react';
import { AlertTriangle, Sliders } from 'lucide-react';
import type { VitalSigns, PatientProfile } from '../../types/medical';
import type { UIStyleId } from '../../types/themeStyles';
import { MaraBureauLayout } from './layouts/MaraBureauLayout';
import { NickelFoxLayout } from './layouts/NickelFoxLayout';
import { LumeCyberLayout } from './layouts/LumeCyberLayout';
import { IcuCockpitLayout } from './layouts/IcuCockpitLayout';
import { SimulationController } from './SimulationController';
import { medicalAudio } from '../../utils/audio';

interface VitalsDashboardProps {
  vitals: VitalSigns;
  patient: PatientProfile;
  soundEnabled: boolean;
  isAlarmActive: boolean;
  theme?: 'light' | 'dark';
  currentStyle?: UIStyleId;
  onUpdateBpm: (val: number) => void;
  onUpdateResp: (val: number) => void;
  onUpdateMotion: (val: number) => void;
  onUpdateFinger: (val: boolean) => void;
  onTriggerEmergencyAlert: (reason: string) => void;
}

export const VitalsDashboard: React.FC<VitalsDashboardProps> = ({
  vitals,
  patient,
  soundEnabled,
  isAlarmActive,
  currentStyle = 'MEDICARE_LIGHT',
  onUpdateBpm,
  onUpdateResp,
  onUpdateMotion,
  onUpdateFinger,
  onTriggerEmergencyAlert
}) => {
  const [showSimDrawer, setShowSimDrawer] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 relative">
      
      {/* Critical Alert Banner if Fall / Syncope Detected */}
      {(vitals.fallAlert || isAlarmActive) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-alarm shadow-xl shadow-rose-600/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                ALERTE CHUTE OU SYNCOPE EN COURS • COMPTE À REBOURS DE SÉCURITÉ (15s)
              </h4>
              <p className="text-xs text-rose-100 mt-0.5">
                Impact biomécanique ou effondrement du pouls enregistré par le boîtier ESP32.
              </p>
            </div>
          </div>
          <button
            onClick={() => onTriggerEmergencyAlert('Alerte manuelle depuis le bandeau de surveillance')}
            className="px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md transition cursor-pointer shrink-0"
          >
            Ouvrir Protocole SOS (141)
          </button>
        </div>
      )}

      {/* DYNAMIC LAYOUT ARCHITECTURE ROUTER (Based on currentStyle) */}
      {currentStyle === 'MEDICARE_LIGHT' && (
        <MaraBureauLayout
          vitals={vitals}
          patient={patient}
          soundEnabled={soundEnabled}
          isAlarmActive={isAlarmActive}
          onTriggerEmergencyAlert={onTriggerEmergencyAlert}
        />
      )}

      {currentStyle === 'CARDIOCARE_OCEAN' && (
        <NickelFoxLayout
          vitals={vitals}
          patient={patient}
          soundEnabled={soundEnabled}
          isAlarmActive={isAlarmActive}
          onTriggerEmergencyAlert={onTriggerEmergencyAlert}
        />
      )}

      {currentStyle === 'LUME_CYBER' && (
        <LumeCyberLayout
          vitals={vitals}
          patient={patient}
          soundEnabled={soundEnabled}
          isAlarmActive={isAlarmActive}
          onTriggerEmergencyAlert={onTriggerEmergencyAlert}
        />
      )}

      {currentStyle === 'ICU_OBSIDIAN' && (
        <IcuCockpitLayout
          vitals={vitals}
          patient={patient}
          soundEnabled={soundEnabled}
          isAlarmActive={isAlarmActive}
          onUpdateBpm={onUpdateBpm}
          onUpdateResp={onUpdateResp}
          onUpdateMotion={onUpdateMotion}
          onUpdateFinger={onUpdateFinger}
          onTriggerEmergencyAlert={onTriggerEmergencyAlert}
        />
      )}

      {/* Simulation Console Floating Quick Toggle (available in any layout to test presets) */}
      {currentStyle !== 'ICU_OBSIDIAN' && (
        <div className="pt-4 border-t border-slate-500/20">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                medicalAudio.playUiClick();
                setShowSimDrawer(!showSimDrawer);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition shadow"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>{showSimDrawer ? 'Masquer la console simulateur ESP32' : 'Ouvrir le banc d\'essai & simulation ESP32'}</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              Générez tachycardie, bradycardie ou chute pour tester les réactions du layout
            </span>
          </div>

          {showSimDrawer && (
            <div className="animate-fadeIn">
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
      )}

    </div>
  );
};
