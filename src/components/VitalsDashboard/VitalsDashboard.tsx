import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { VitalSigns, PatientProfile } from '../../types/medical';
import type { UIStyleId } from '../../types/themeStyles';
import { IcuCockpitLayout } from './layouts/IcuCockpitLayout';

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
  onUpdateBpm,
  onUpdateResp,
  onUpdateMotion,
  onUpdateFinger,
  onTriggerEmergencyAlert
}) => {
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

      {/* ICU Cockpit Layout (Hospital Critical Care Cockpit - Theme 4) */}
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
    </div>
  );
};
