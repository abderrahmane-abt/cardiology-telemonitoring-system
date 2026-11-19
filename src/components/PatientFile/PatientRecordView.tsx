import React, { useState } from 'react';
import { 
  User, 
  Baby, 
  Scale, 
  Ruler, 
  Heart, 
  Droplet, 
  FileText, 
  AlertTriangle, 
  Check, 
  Edit3, 
  Save, 
  Calendar, 
  Phone, 
  MapPin, 
  Stethoscope,
  ShieldCheck
} from 'lucide-react';
import type { PatientProfile } from '../../types/medical';
import { medicalAudio } from '../../utils/audio';
import { UI_STYLES } from '../../types/themeStyles';
import type { UIStyleId } from '../../types/themeStyles';

interface PatientRecordViewProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  currentStyle?: UIStyleId;
}

export const PatientRecordView: React.FC<PatientRecordViewProps> = ({
  patient,
  onUpdatePatient,
  currentStyle = 'MEDICARE_LIGHT'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PatientProfile>({ ...patient });
  const [newAntecedent, setNewAntecedent] = useState('');
  const [newTraitement, setNewTraitement] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const inputClass = isLight
    ? 'bg-white border border-slate-300 text-slate-900 focus:border-blue-500'
    : 'bg-slate-900 border border-slate-700 text-white focus:border-indigo-500';

  const headingText = isLight ? 'text-slate-900' : 'text-white';
  const subText = isLight ? 'text-slate-500' : 'text-slate-400';
  const subtleBorder = isLight ? 'border-slate-100' : 'border-slate-800';

  // Calculate BMI: weight(kg) / (height(m))^2
  const heightM = formData.taille / 100;
  const bmi = heightM > 0 ? Number((formData.poids / (heightM * heightM)).toFixed(1)) : 0;

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Insuffisance pondérale (Maigreur)', color: 'text-cyan-400', badge: 'bg-cyan-950/70 border-cyan-500/40' };
    if (val < 25.0) return { label: 'Corpulence normale (Optimale)', color: 'text-emerald-400', badge: 'bg-emerald-950/70 border-emerald-500/40' };
    if (val < 30.0) return { label: 'Surpoids modéré', color: 'text-amber-400', badge: 'bg-amber-950/70 border-amber-500/40' };
    if (val < 35.0) return { label: 'Obésité modérée (Classe 1)', color: 'text-orange-400', badge: 'bg-orange-950/70 border-orange-500/40' };
    return { label: 'Obésité sévère / morbide', color: 'text-rose-400', badge: 'bg-rose-950/70 border-rose-500/40' };
  };

  const bmiCat = getBmiCategory(bmi);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    medicalAudio.playUiClick();
    onUpdatePatient(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const addAntecedent = () => {
    if (newAntecedent.trim()) {
      medicalAudio.playUiClick();
      setFormData({
        ...formData,
        antecedents: [...formData.antecedents, newAntecedent.trim()]
      });
      setNewAntecedent('');
    }
  };

  const removeAntecedent = (idx: number) => {
    medicalAudio.playUiClick();
    setFormData({
      ...formData,
      antecedents: formData.antecedents.filter((_, i) => i !== idx)
    });
  };

  const addTraitement = () => {
    if (newTraitement.trim()) {
      medicalAudio.playUiClick();
      setFormData({
        ...formData,
        traitements: [...formData.traitements, newTraitement.trim()]
      });
      setNewTraitement('');
    }
  };

  const removeTraitement = (idx: number) => {
    medicalAudio.playUiClick();
    setFormData({
      ...formData,
      traitements: formData.traitements.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className={`space-y-6 animate-fadeIn ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
      {/* Top Header Card */}
      <div className={`${cardClass} rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300`}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className={`text-xl font-extrabold tracking-tight ${headingText}`}>
                {patient.prenom} {patient.nom}
              </h2>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                {patient.id}
              </span>
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-rose-950/70 text-rose-400 border border-rose-500/40">
                {patient.groupeSanguin}
              </span>
              {patient.isPregnant && (
                <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/50">
                  <Baby className="w-3.5 h-3.5 text-pink-400" />
                  <span>Grossesse : {patient.semainesAmenorrhee} SA</span>
                </span>
              )}
            </div>
            <p className={`text-xs mt-1 flex items-center space-x-3 ${subText}`}>
              <span>{patient.genre === 'F' ? 'Femme' : 'Homme'} • {patient.age} ans</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Née le {patient.dateNaissance}</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>Dossier médical actualisé</span>
            </span>
          )}
          <button
            onClick={() => {
              medicalAudio.playUiClick();
              if (isEditing) {
                setFormData({ ...patient });
              }
              setIsEditing(!isEditing);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow hover:scale-[1.02] ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isEditing ? 'Annuler' : 'Modifier le Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content (Bento Style) */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Biometrics, BMI & Obstetric Status (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Biometrics & BMI Card */}
          <div className={`${cardClass} rounded-3xl p-6 transition-all duration-300`}>
            <div className={`flex items-center space-x-2.5 pb-4 border-b ${subtleBorder}`}>
              <Scale className="w-5 h-5 text-indigo-400" />
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${headingText}`}>
                Biométrie & Indice de Masse Corporelle (IMC)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Taille */}
              <div className={`${innerBoxClass} rounded-2xl p-4 shadow-inner`}>
                <div className={`flex items-center justify-between text-xs ${subText}`}>
                  <span className="font-medium">Taille Stature</span>
                  <Ruler className="w-4 h-4 text-indigo-400" />
                </div>
                {isEditing ? (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="number"
                      value={formData.taille}
                      onChange={(e) => setFormData({ ...formData, taille: Number(e.target.value) })}
                      className={`w-full rounded-lg px-2.5 py-1 font-mono font-bold ${inputClass}`}
                    />
                    <span className={`text-xs ${subText}`}>cm</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-baseline space-x-1.5">
                    <span className={`text-3xl font-mono font-black ${headingText}`}>{formData.taille}</span>
                    <span className={`text-xs font-semibold ${subText}`}>cm</span>
                  </div>
                )}
              </div>

              {/* Poids */}
              <div className={`${innerBoxClass} rounded-2xl p-4 shadow-inner`}>
                <div className={`flex items-center justify-between text-xs ${subText}`}>
                  <span className="font-medium">Poids Corporel</span>
                  <Scale className="w-4 h-4 text-indigo-400" />
                </div>
                {isEditing ? (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="number"
                      value={formData.poids}
                      onChange={(e) => setFormData({ ...formData, poids: Number(e.target.value) })}
                      className={`w-full rounded-lg px-2.5 py-1 font-mono font-bold ${inputClass}`}
                    />
                    <span className={`text-xs ${subText}`}>kg</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-baseline space-x-1.5">
                    <span className={`text-3xl font-mono font-black ${headingText}`}>{formData.poids}</span>
                    <span className={`text-xs font-semibold ${subText}`}>kg</span>
                  </div>
                )}
              </div>

              {/* Calcul IMC */}
              <div className={`${innerBoxClass} rounded-2xl p-4 shadow-inner`}>
                <div className={`flex items-center justify-between text-xs ${subText}`}>
                  <span className="font-medium">Calcul Automatique IMC</span>
                  <Heart className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className={`text-3xl font-mono font-black ${bmiCat.color}`}>{bmi}</span>
                  <span className={`text-xs font-semibold ${subText}`}>kg/m²</span>
                </div>
                <div className="mt-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${bmiCat.badge}`}>
                    {bmiCat.label}
                  </span>
                </div>
              </div>
            </div>

            {/* BMI Reference Bar */}
            <div className="mt-5 pt-3.5 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex justify-between font-mono mb-1.5 text-[10px]">
                <span className="text-cyan-400">&lt;18.5 Maigreur</span>
                <span className="text-emerald-400 font-bold">18.5 - 24.9 Normal</span>
                <span className="text-amber-400">25 - 29.9 Surpoids</span>
                <span className="text-rose-400">&ge;30 Obésité</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                <div className="w-[18.5%] bg-cyan-500/80" />
                <div className="w-[30%] bg-emerald-500/80" />
                <div className="w-[20%] bg-amber-500/80" />
                <div className="w-[31.5%] bg-rose-500/80" />
              </div>
            </div>
          </div>

          {/* Module Grossesse & Cardiologie Obstétrique */}
          <div className={`${cardClass} rounded-3xl p-6 relative overflow-hidden transition-all duration-300`}>
            <div className={`flex items-center justify-between pb-4 border-b ${subtleBorder}`}>
              <div className="flex items-center space-x-2.5">
                <Baby className="w-5 h-5 text-pink-400" />
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${headingText}`}>
                  Statut de Grossesse & Cardiologie Obstétrique
                </h3>
              </div>

              {isEditing ? (
                <div className="flex items-center space-x-3">
                  <label className={`text-xs font-medium ${subText}`}>Patiente Enceinte :</label>
                  <select
                    value={formData.isPregnant ? 'YES' : 'NO'}
                    onChange={(e) => setFormData({ ...formData, isPregnant: e.target.value === 'YES' })}
                    className={`text-xs rounded-lg px-2.5 py-1 ${inputClass}`}
                  >
                    <option value="YES">Oui</option>
                    <option value="NO">Non</option>
                  </select>
                </div>
              ) : (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  formData.isPregnant 
                    ? isLight ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-pink-950/70 text-pink-300 border-pink-500/50' 
                    : isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {formData.isPregnant ? `Grossesse en cours (${formData.semainesAmenorrhee} SA)` : 'Non Enceinte'}
                </span>
              )}
            </div>

            {formData.isPregnant && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-pink-50/60 border-pink-200' : 'bg-pink-950/20 border-pink-500/30'}`}>
                    <span className={`text-xs font-semibold block ${isLight ? 'text-pink-800' : 'text-pink-300'}`}>
                      Semaines d'Aménorrhée (SA)
                    </span>
                    {isEditing ? (
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="number"
                          min={1}
                          max={42}
                          value={formData.semainesAmenorrhee || 26}
                          onChange={(e) => setFormData({ ...formData, semainesAmenorrhee: Number(e.target.value) })}
                          className={`w-24 rounded-lg px-2.5 py-1 font-mono font-bold ${inputClass}`}
                        />
                        <span className={`text-xs ${isLight ? 'text-pink-700' : 'text-pink-300'}`}>Semaines</span>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-baseline space-x-2">
                        <span className="text-4xl font-mono font-black text-pink-500">
                          {formData.semainesAmenorrhee || 26}
                        </span>
                        <span className={`text-xs font-semibold ${subText}`}>SA (2ème Trimestre)</span>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-2xl border ${innerBoxClass}`}>
                    <span className={`text-xs font-medium block ${subText}`}>
                      Fréquence Cardiaque Basale Attendue
                    </span>
                    <span className={`text-xl font-mono font-black mt-1 block ${headingText}`}>
                      75 - 95 BPM (Physiologique)
                    </span>
                    <span className={`text-[11px] mt-1 block ${subText}`}>
                      Débit cardiaque augmenté de ~35-45% au repos
                    </span>
                  </div>
                </div>

                {/* Clinical Obstetric Warning */}
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isLight 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-gradient-to-r from-amber-950/40 to-slate-950 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="flex items-center space-x-2 font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Recommandations Cliniques Spécifiques au Malaise Vagal Gestationnel</span>
                  </div>
                  <p className={`leading-relaxed ${isLight ? 'text-amber-800' : 'text-amber-300/90'}`}>
                    <strong>Syndrome de compression cave :</strong> À partir de 20 SA, le décubitus dorsal strict comprime la veine cave inférieure, réduisant brutalement le retour veineux et déclenchant une hypotension orthostatique et un malaise vagal.
                  </p>
                  <p className={`text-[11px] font-semibold ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
                    → Conduite à tenir impérative : Positionner immédiatement la patiente en <strong>Décubitus Latéral Gauche (DLG)</strong> pour décomprimer la veine cave.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Antécédents & Traitements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Antécédents */}
            <div className={`${cardClass} rounded-3xl p-5 transition-all duration-300`}>
              <div className={`flex items-center space-x-2 pb-3 border-b ${subtleBorder}`}>
                <FileText className="w-4 h-4 text-indigo-400" />
                <h4 className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>Antécédents Médicaux</h4>
              </div>

              <div className="mt-3.5 space-y-2">
                {formData.antecedents.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${innerBoxClass}`}>
                    <span>{item}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeAntecedent(idx)}
                        className="text-rose-400 hover:text-rose-300 ml-2 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-3 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ajouter un antécédent..."
                    value={newAntecedent}
                    onChange={(e) => setNewAntecedent(e.target.value)}
                    className={`flex-1 text-xs rounded-lg px-2.5 py-1.5 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={addAntecedent}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Traitements en cours */}
            <div className={`${cardClass} rounded-3xl p-5 transition-all duration-300`}>
              <div className={`flex items-center space-x-2 pb-3 border-b ${subtleBorder}`}>
                <Droplet className="w-4 h-4 text-emerald-400" />
                <h4 className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>Traitements en Cours</h4>
              </div>

              <div className="mt-3.5 space-y-2">
                {formData.traitements.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${innerBoxClass}`}>
                    <span>{item}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeTraitement(idx)}
                        className="text-rose-400 hover:text-rose-300 ml-2 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-3 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ajouter un traitement..."
                    value={newTraitement}
                    onChange={(e) => setNewTraitement(e.target.value)}
                    className={`flex-1 text-xs rounded-lg px-2.5 py-1.5 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={addTraitement}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Coordination Médicale & Coordonnées (1 col) */}
        <div className="space-y-6">

          {/* Médecin & Clinique */}
          <div className={`${cardClass} rounded-3xl p-6 space-y-4 transition-all duration-300`}>
            <div className={`flex items-center space-x-2.5 pb-3 border-b ${subtleBorder}`}>
              <Stethoscope className="w-5 h-5 text-indigo-400" />
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${headingText}`}>
                Médecin Référent de Suivi
              </h3>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-indigo-50/70 border-indigo-200' : 'bg-indigo-950/30 border-indigo-500/30'}`}>
              <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase">
                Praticien Télé-Cardiologie
              </span>
              <h4 className={`text-sm font-bold ${isLight ? 'text-indigo-950' : 'text-white'}`}>
                {formData.medecinRef}
              </h4>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Centre Hospitalier Universitaire • Surveillance Hémodynamique Connectée
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className={`block mb-1 ${subText}`}>Téléphone de la patiente</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className={`w-full rounded-lg p-2 font-mono ${inputClass}`}
                  />
                ) : (
                  <div className={`flex items-center space-x-2 font-mono ${headingText}`}>
                    <Phone className={`w-3.5 h-3.5 ${subText}`} />
                    <span>{formData.telephone}</span>
                  </div>
                )}
              </div>

              <div>
                <span className={`block mb-1 ${subText}`}>Adresse de résidence (Intervention Secours)</span>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className={`w-full rounded-lg p-2 ${inputClass}`}
                  />
                ) : (
                  <div className={`flex items-start space-x-2 ${headingText}`}>
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{formData.adresse}</span>
                  </div>
                )}
              </div>

              <div>
                <span className={`block mb-1 ${subText}`}>Notes Cliniques Synthétiques</span>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.notesCliniques}
                    onChange={(e) => setFormData({ ...formData, notesCliniques: e.target.value })}
                    className={`w-full rounded-lg p-2 text-xs ${inputClass}`}
                  />
                ) : (
                  <p className={`p-3 rounded-xl border leading-relaxed text-xs ${innerBoxClass}`}>
                    {formData.notesCliniques}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-indigo-950 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer le Dossier</span>
              </button>
            )}
          </div>

          {/* Quick Info Box */}
          <div className={`${cardClass} rounded-2xl p-4 text-xs space-y-2 transition-all duration-300`}>
            <div className={`flex items-center space-x-1.5 font-semibold ${headingText}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Conformité Télémédecine & Sécurité RGPD</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${subText}`}>
              Dossier patient chiffré en conformité avec les directives hospitalières de télésurveillance médicale ambulatoire.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
