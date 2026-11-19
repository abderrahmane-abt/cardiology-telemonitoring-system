import React, { useState } from 'react';
import { 
  PhoneCall, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  UserCheck, 
  Ambulance, 
  Flame, 
  MessageSquare
} from 'lucide-react';
import type { EmergencyContact, PatientProfile, VitalSigns } from '../../types/medical';
import { medicalAudio } from '../../utils/audio';
import { UI_STYLES } from '../../types/themeStyles';
import type { UIStyleId } from '../../types/themeStyles';

interface EmergencySosViewProps {
  contacts: EmergencyContact[];
  patient: PatientProfile;
  vitals: VitalSigns;
  onTriggerManualEmergency: () => void;
  onUpdateContacts: (contacts: EmergencyContact[]) => void;
  currentStyle?: UIStyleId;
}

export const EmergencySosView: React.FC<EmergencySosViewProps> = ({
  contacts,
  patient,
  vitals,
  onTriggerManualEmergency,
  currentStyle = 'MEDICARE_LIGHT'
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [simulatedCallRole, setSimulatedCallRole] = useState<string | null>(null);

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.MEDICARE_LIGHT;
  const isLight = styleConfig.themeMode === 'light';

  const cardClass = isLight 
    ? 'bg-white border border-slate-200/90 shadow-sm text-slate-800' 
    : currentStyle === 'LUME_CYBER'
    ? 'bg-[#080b14]/95 border border-cyan-500/25 shadow-2xl text-slate-100'
    : currentStyle === 'ICU_OBSIDIAN'
    ? 'bg-[#050811] border border-slate-800 shadow-xl font-mono text-slate-100'
    : 'bg-[#0c142b]/80 border border-slate-700/60 shadow-2xl backdrop-blur-xl text-slate-100';

  const innerBoxClass = isLight
    ? 'bg-slate-50 border border-slate-200/80 text-slate-800'
    : currentStyle === 'LUME_CYBER'
    ? 'bg-[#04060a]/90 border border-slate-800 text-slate-200'
    : currentStyle === 'ICU_OBSIDIAN'
    ? 'bg-black/90 border border-slate-800 text-slate-200'
    : 'bg-[#070d1e]/60 border border-slate-800/80 text-slate-200';

  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-500' : 'text-slate-400';
  const subtleBorder = isLight ? 'border-slate-100' : 'border-slate-800';

  const emergencyMessage = `[URGENCE MÉDICALE TÉLÉSURVEILLANCE - ALERTE SYNCOPE]
Patiente : ${patient.prenom} ${patient.nom} (${patient.age} ans)
Statut : ${patient.isPregnant ? `Enceinte (${patient.semainesAmenorrhee} SA)` : 'Non enceinte'} - Groupe : ${patient.groupeSanguin}
Constantes Actuelles : FC: ${vitals.bpm} BPM | FR: ${vitals.resp} CPM | Mouvement: ${vitals.motion}g
Adresse Intervention : ${patient.adresse}
Coordonnées GPS : 33.5731° N, 7.5898° W
Médecin Référent : ${patient.medecinRef}
Heure de l'incident : ${new Date().toLocaleTimeString('fr-FR')}`;

  const handleCopyMessage = () => {
    medicalAudio.playUiClick();
    navigator.clipboard.writeText(emergencyMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const getRoleIcon = (role: EmergencyContact['role']) => {
    switch (role) {
      case 'MEDECIN': return UserCheck;
      case 'SAMU': return Ambulance;
      case 'POMPIERS': return Flame;
      default: return PhoneCall;
    }
  };

  return (
    <div className={`space-y-6 animate-fadeIn ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
      {/* Top Banner: Immediate SOS Trigger */}
      <div className={`border-2 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
        isLight 
          ? 'bg-gradient-to-r from-rose-50 via-white to-white border-rose-300' 
          : 'bg-gradient-to-r from-rose-950/80 via-[#0b1020] to-[#0b1020] border-rose-500/60'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-rose-600/25 border-2 border-rose-500 text-rose-500 shadow-xl shadow-rose-950/20">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-rose-500 block">
              Module de Déclenchement d'Urgence Prioritaire
            </span>
            <h2 className={`text-xl font-black tracking-wide ${headingText}`}>
              Assistance Immédiate & Protocoles Cliniques SOS (580)
            </h2>
            <p className={`text-xs mt-1 max-w-xl ${subText}`}>
              En cas de malaise brutal, perte de connaissance ou syncope imminente, déclenchez immédiatement le protocole de détresse avec transmission des constantes.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            medicalAudio.playUiClick();
            onTriggerManualEmergency();
          }}
          className="py-4 px-7 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-2xl shadow-rose-950/40 transition hover:scale-[1.02] cursor-pointer"
        >
          <ShieldAlert className="w-5 h-5" />
          <span>Déclencher Alerte SOS</span>
        </button>
      </div>

      {/* Grid: Emergency Contacts Directory (Left) + SOS Synthesis Dispatch Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contacts Directory (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`${cardClass} rounded-3xl p-6 transition-all duration-300`}>
            <div className={`flex items-center justify-between pb-4 border-b ${subtleBorder}`}>
              <div className="flex items-center space-x-2.5">
                <PhoneCall className="w-5 h-5 text-indigo-500" />
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${headingText}`}>
                  Répertoire d'Urgence Configuré
                </h3>
              </div>
              <span className={`text-xs font-mono ${subText}`}>
                Hiérarchie d'Appel Séquentielle
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => {
                const IconComponent = getRoleIcon(contact.role);
                return (
                  <div
                    key={contact.id}
                    className={`p-5 rounded-2xl border transition flex flex-col justify-between shadow-xs ${innerBoxClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          contact.role === 'SAMU' ? (isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/80 text-rose-400 border-rose-500/50') :
                          contact.role === 'MEDECIN' ? (isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-950/80 text-indigo-400 border-indigo-500/50') :
                          contact.role === 'POMPIERS' ? (isLight ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-orange-950/80 text-orange-400 border-orange-500/50') :
                          (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50')
                        }`}>
                          Priorité {contact.priorite} • {contact.role}
                        </span>
                        <IconComponent className={`w-4 h-4 ${subText}`} />
                      </div>

                      <h4 className={`text-sm font-extrabold mt-3 ${headingText}`}>
                        {contact.nom}
                      </h4>
                      <p className={`text-xs mt-0.5 ${subText}`}>
                        {contact.details}
                      </p>

                      <div className={`mt-3.5 flex items-center space-x-2 font-mono text-xs font-extrabold ${headingText}`}>
                        <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{contact.telephone}</span>
                      </div>
                    </div>

                    <div className={`mt-4 pt-3.5 border-t ${subtleBorder} flex space-x-2`}>
                      <button
                        onClick={() => {
                          medicalAudio.playUiClick();
                          setSimulatedCallRole(`${contact.nom} (${contact.telephone})`);
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                          isLight 
                            ? 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200' 
                            : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Appeler</span>
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(emergencyMessage)}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition ${
                          isLight
                            ? 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200'
                            : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidelines info card */}
          <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-3.5 ${cardClass}`}>
            <Ambulance className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h5 className={`font-bold text-xs ${headingText}`}>Numéros d'Urgence Nationaux (Maroc)</h5>
              <p className={`mt-1 leading-relaxed text-[11px] ${subText}`}>
                En cas d'urgence médicale vitale (arrêt cardio-respiratoire, syncope prolongée, perte de connaissance), composez en priorité absolue le <strong>580 (SAMU Maroc)</strong> ou le <strong>150 (Protection Civile)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* SOS Synthesis Card & Location (1 col) */}
        <div className="space-y-4">
          <div className={`${cardClass} rounded-3xl p-6 space-y-4 transition-all duration-300`}>
            <div className={`flex items-center space-x-2.5 pb-3 border-b ${subtleBorder} ${headingText}`}>
              <MapPin className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">
                Fiche Synthèse Télémédicale SOS
              </h3>
            </div>

            {/* Vitals summary */}
            <div className={`p-3.5 rounded-2xl border space-y-2 text-xs font-mono ${innerBoxClass}`}>
              <div className="flex justify-between">
                <span className={subText}>Pouls Cardiaque :</span>
                <span className={`font-black ${vitals.bpm > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {vitals.bpm} BPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className={subText}>Respiration :</span>
                <span className="text-cyan-500 font-black">{vitals.resp} CPM</span>
              </div>
              <div className="flex justify-between">
                <span className={subText}>Accéléromètre :</span>
                <span className="text-indigo-500 font-black">{vitals.motion.toFixed(2)} g</span>
              </div>
              <div className={`flex justify-between border-t ${subtleBorder} pt-2`}>
                <span className={subText}>Statut Clinique :</span>
                <span className="text-rose-500 font-black">{vitals.status}</span>
              </div>
            </div>

            {/* GPS coordinates & Map Link */}
            <div className="space-y-2">
              <span className={`text-[10px] font-mono uppercase tracking-widest block ${subText}`}>
                Localisation Satellite GPS Domicile
              </span>
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${innerBoxClass}`}>
                <span className={`font-bold ${headingText}`}>33.5731° N, 7.5898° W</span>
                <a
                  href="https://maps.google.com/?q=33.5731,-7.5898"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-500 hover:text-indigo-600 flex items-center space-x-1 font-sans text-xs font-bold"
                >
                  <span>Carte</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className={`text-[11px] ${subText}`}>
                {patient.adresse}
              </p>
            </div>

            {/* Formatted SMS payload */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-mono uppercase text-[10px] ${subText}`}>Trame SMS / WhatsApp</span>
                <button
                  onClick={handleCopyMessage}
                  className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded border cursor-pointer ${
                    isLight 
                      ? 'text-indigo-600 hover:text-indigo-800 bg-slate-100 border-slate-200' 
                      : 'text-indigo-400 hover:text-white bg-slate-900 border-slate-800'
                  }`}
                >
                  {copiedMessage ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMessage ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={6}
                value={emergencyMessage}
                className={`w-full text-[11px] font-mono p-3 rounded-xl leading-relaxed resize-none focus:outline-none border ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Call Active Modal */}
      {simulatedCallRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border-2 border-emerald-500 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 animate-pulse">
              <PhoneCall className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-extrabold tracking-widest">
                Liaison Vocale d'Urgence Établie
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Appel en Cours : {simulatedCallRole}
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Transmission instantanée de la synthèse médicale et des coordonnées géographiques au régulateur médical.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  medicalAudio.playUiClick();
                  setSimulatedCallRole(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Mettre fin à l'appel de simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
