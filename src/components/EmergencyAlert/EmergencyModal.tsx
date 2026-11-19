import React, { useEffect, useState } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  CheckCircle2, 
  ShieldAlert, 
  MapPin, 
  Radio, 
  BellOff, 
  Bell, 
  MessageSquare
} from 'lucide-react';
import { medicalAudio } from '../../utils/audio';
import type { PatientProfile, VitalSigns } from '../../types/medical';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  patient: PatientProfile;
  vitals: VitalSigns;
  soundEnabled: boolean;
  onConfirmEmergency: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  reason,
  patient,
  vitals,
  soundEnabled,
  onConfirmEmergency
}) => {
  const [countdown, setCountdown] = useState(15);
  const [isDispatched, setIsDispatched] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      medicalAudio.stopAlarm();
      setCountdown(15);
      setIsDispatched(false);
      setIsSirenMuted(false);
      return;
    }

    // Start siren if sound enabled and not muted
    if (soundEnabled && !isSirenMuted) {
      medicalAudio.startEmergencyAlarm();
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      medicalAudio.stopAlarm();
    };
  }, [isOpen, soundEnabled, isSirenMuted]);

  // Dispatch emergency when countdown reaches 0
  useEffect(() => {
    if (isOpen && countdown === 0 && !isDispatched) {
      setIsDispatched(true);
      onConfirmEmergency();
    }
  }, [isOpen, countdown, isDispatched, onConfirmEmergency]);

  if (!isOpen) return null;

  const toggleSirenMute = () => {
    if (isSirenMuted) {
      setIsSirenMuted(false);
      if (soundEnabled) medicalAudio.startEmergencyAlarm();
    } else {
      setIsSirenMuted(true);
      medicalAudio.stopAlarm();
    }
  };

  const handleCancelByUser = () => {
    medicalAudio.stopAlarm();
    onClose();
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (countdown / 15) * circumference;

  const emergencySmsText = `[URGENCE VITALE - CHUTE/SYNCOPE TÉLÉSURVEILLÉE]
Patiente: ${patient.prenom} ${patient.nom} (${patient.age} ans - ${patient.isPregnant ? `${patient.semainesAmenorrhee} SA` : 'Non enceinte'})
Constantes: FC ${vitals.bpm} BPM | FR ${vitals.resp} CPM | Accélération ${vitals.motion}g
Adresse: ${patient.adresse} (GPS: 33.5731 N, 7.5898 W)
SAMU 580 & Dr. Radi prévenus automatiquement.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
      {/* Screen edge pulsing red vignette */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-rose-600/60 animate-alarm" />

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-950 via-neutral-950 to-slate-950 border-2 border-rose-600 rounded-3xl shadow-[0_0_80px_rgba(244,63,94,0.4)] p-6 md:p-8 animate-alarm overflow-hidden">
        
        {/* Top Warning Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-900/60">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-rose-600/25 border-2 border-rose-500 rounded-2xl text-rose-500 animate-pulse shadow-lg shadow-rose-900/50">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-rose-400 block">
                Protocole de Sécurité Clinique • Priorité 1 (Urgence Vitale)
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
                ALERTE CHUTE & MALAISE DÉTECTÉE (SYNCOPE)
              </h2>
            </div>
          </div>

          <button
            onClick={toggleSirenMute}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer shadow"
          >
            {isSirenMuted ? <Bell className="w-4 h-4 text-slate-400" /> : <BellOff className="w-4 h-4 text-amber-400 animate-bounce" />}
            <span className="font-mono">{isSirenMuted ? 'Activer Sirène' : 'Couper Sirène'}</span>
          </button>
        </div>

        {/* Dynamic State: 15s Countdown or Emergency Dispatched */}
        {!isDispatched ? (
          <div className="mt-6 flex flex-col items-center text-center">
            {/* High-Tech Circular Countdown HUD */}
            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  stroke="rgba(51, 65, 85, 0.5)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  stroke="#ef4444"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear filter drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-black font-mono text-white tracking-tight glow-ruby">
                  {countdown}
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-rose-400">
                  Secondes
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-200 max-w-lg leading-relaxed">
              Une décélération brutale et une anomalie des constantes vitales ont été enregistrées.
              <span className="block text-rose-400 font-bold mt-1 text-sm bg-rose-950/60 p-2 rounded-xl border border-rose-500/30">
                Motif: {reason}
              </span>
              Si vous êtes consciente et allez bien, appuyez sur le bouton vert ci-dessous pour désamorcer l'alerte avant l'envoi aux secours (SAMU 580).
            </p>

            {/* Cancel or Immediate Trigger Buttons */}
            <div className="mt-6 w-full flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCancelByUser}
                className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base flex items-center justify-center space-x-2 shadow-2xl shadow-emerald-950 transition hover:scale-[1.02] cursor-pointer"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>JE VAIS BIEN / FAUSSE ALERTE (ANNULER)</span>
              </button>

              <button
                onClick={() => {
                  setCountdown(0);
                  setIsDispatched(true);
                  onConfirmEmergency();
                }}
                className="py-4 px-5 rounded-2xl bg-rose-950/90 hover:bg-rose-900 border-2 border-rose-600 text-rose-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Appel Secours Immédiat</span>
              </button>
            </div>
          </div>
        ) : (
          /* Dispatched Confirmation Screen */
          <div className="mt-6 space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-rose-950/60 border-2 border-rose-500 flex items-start space-x-3.5 shadow-2xl">
              <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h4 className="text-base font-black text-rose-100 uppercase tracking-wide">
                  PROCÉDURE D'URGENCE ACTIVÉE • SAMU 580 & MÉDECIN NOTIFIÉS
                </h4>
                <p className="text-xs text-rose-300 mt-1">
                  Les constantes biomédicales et les coordonnées GPS ont été transmises à la régulation médicale.
                </p>
              </div>
            </div>

            {/* Incident Summary Card */}
            <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Patiente:</span>
                <span className="text-white font-bold">{patient.prenom} {patient.nom} ({patient.age} ans - {patient.isPregnant ? `${patient.semainesAmenorrhee} SA` : 'Non enceinte'})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Constantes au moment du malaise:</span>
                <span className="text-rose-400 font-extrabold">FC: {vitals.bpm} BPM • FR: {vitals.resp} CPM • Impact: {vitals.motion}g</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Localisation GPS Domicile:</span>
                <span className="text-slate-200 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{patient.adresse}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Secours & Contacts :</span>
                <span className="text-emerald-400 font-bold">SAMU (580) • Dr. Radi • Karim El Amrani</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="tel:580"
                className="flex-1 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-rose-950 transition hover:scale-[1.02]"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Appeler Directement le SAMU 580</span>
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(emergencySmsText)}`}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp d'Urgence</span>
              </a>

              <button
                onClick={handleCancelByUser}
                className="py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-slate-900 flex justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>ESP32 Telemetry Sentinel Active (COM4 @ 115200)</span>
          </span>
          <span>Système de Télésurveillance Médicale Connectée</span>
        </div>
      </div>
    </div>
  );
};
