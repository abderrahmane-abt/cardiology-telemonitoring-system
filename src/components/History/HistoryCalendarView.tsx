import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Printer, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Wind, 
  FileText, 
  Stethoscope
} from 'lucide-react';
import type { MeasurementRecord, PatientProfile } from '../../types/medical';
import { medicalAudio } from '../../utils/audio';
import { UI_STYLES } from '../../types/themeStyles';
import type { UIStyleId } from '../../types/themeStyles';

interface HistoryCalendarViewProps {
  records: MeasurementRecord[];
  patient: PatientProfile;
  currentStyle?: UIStyleId;
}

export const HistoryCalendarView: React.FC<HistoryCalendarViewProps> = ({
  records,
  patient,
  currentStyle = 'MEDICARE_LIGHT'
}) => {
  const availableDates = Array.from(new Set(records.map(r => r.date))).sort().reverse();
  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] || '2026-11-17');
  const [filterType, setFilterType] = useState<'ALL' | 'NORMAL' | 'ANOMALY'>('ALL');
  const [showPrintModal, setShowPrintModal] = useState(false);

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
  const selectClass = isLight
    ? 'bg-white border border-slate-300 text-slate-900 shadow-xs'
    : 'bg-slate-950 border border-slate-700 text-white shadow-inner';

  const dayRecords = records.filter(r => r.date === selectedDate);
  const filteredRecords = dayRecords.filter(r => {
    if (filterType === 'NORMAL') return !r.anomalyDetected;
    if (filterType === 'ANOMALY') return r.anomalyDetected;
    return true;
  });

  const bpmValues = dayRecords.map(r => r.bpm).filter(b => b > 0);
  const respValues = dayRecords.map(r => r.resp).filter(res => res > 0);

  const avgBpm = bpmValues.length > 0 ? Math.round(bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length) : 0;
  const minBpm = bpmValues.length > 0 ? Math.min(...bpmValues) : 0;
  const maxBpm = bpmValues.length > 0 ? Math.max(...bpmValues) : 0;

  const avgResp = respValues.length > 0 ? Math.round(respValues.reduce((a, b) => a + b, 0) / respValues.length) : 0;
  const minResp = respValues.length > 0 ? Math.min(...respValues) : 0;
  const maxResp = respValues.length > 0 ? Math.max(...respValues) : 0;

  const totalAlerts = dayRecords.filter(r => r.anomalyDetected).length;

  const handleDateChange = (date: string) => {
    medicalAudio.playUiClick();
    setSelectedDate(date);
  };

  const handleFilterChange = (filter: 'ALL' | 'NORMAL' | 'ANOMALY') => {
    medicalAudio.playUiClick();
    setFilterType(filter);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-6 animate-fadeIn ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
      {/* Top Bar: Date Selector & Actions */}
      <div className={`${cardClass} rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300`}>
        
        {/* Date Selector Navigation */}
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-mono uppercase tracking-widest block ${subText}`}>
              Historique des Enregistrements Télémétriques
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <select
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`font-extrabold text-sm rounded-xl px-3.5 py-1.5 focus:outline-none font-mono cursor-pointer ${selectClass}`}
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Export / Print Report Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              medicalAudio.playUiClick();
              setShowPrintModal(true);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs transition shadow-xl shadow-indigo-950/40 cursor-pointer hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            <span>Générer Rapport Clinique Imprimable</span>
          </button>
        </div>
      </div>

      {/* Day Statistics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FC Moyenne */}
        <div className={`${cardClass} rounded-2xl p-5 transition-all duration-300`}>
          <div className={`flex items-center justify-between text-xs ${subText}`}>
            <span className="font-medium">FC Moyenne Journalière</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-4xl font-black font-mono text-emerald-500">
              {avgBpm}
            </span>
            <span className={`text-xs font-mono font-semibold ${subText}`}>BPM</span>
          </div>
          <div className={`mt-3 text-[11px] font-mono flex justify-between border-t ${subtleBorder} pt-2 ${subText}`}>
            <span>Min: <strong className={headingText}>{minBpm}</strong></span>
            <span>Max: <strong className={headingText}>{maxBpm}</strong></span>
          </div>
        </div>

        {/* FR Moyenne */}
        <div className={`${cardClass} rounded-2xl p-5 transition-all duration-300`}>
          <div className={`flex items-center justify-between text-xs ${subText}`}>
            <span className="font-medium">FR Moyenne Journalière</span>
            <Wind className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-4xl font-black font-mono text-cyan-500">
              {avgResp}
            </span>
            <span className={`text-xs font-mono font-semibold ${subText}`}>CPM</span>
          </div>
          <div className={`mt-3 text-[11px] font-mono flex justify-between border-t ${subtleBorder} pt-2 ${subText}`}>
            <span>Min: <strong className={headingText}>{minResp}</strong></span>
            <span>Max: <strong className={headingText}>{maxResp}</strong></span>
          </div>
        </div>

        {/* Alertes & Anomalies */}
        <div className={`${cardClass} rounded-2xl p-5 transition-all duration-300`}>
          <div className={`flex items-center justify-between text-xs ${subText}`}>
            <span className="font-medium">Alertes Enregistrées</span>
            <AlertTriangle className={`w-4 h-4 ${totalAlerts > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className={`text-4xl font-black font-mono ${totalAlerts > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {totalAlerts}
            </span>
            <span className={`text-xs font-semibold ${subText}`}>événement(s)</span>
          </div>
          <div className={`mt-3 text-[11px] border-t ${subtleBorder} pt-2 ${subText}`}>
            {totalAlerts === 0 ? 'Constantes stables' : 'Surveillance cardiologique recommandée'}
          </div>
        </div>

        {/* Sessions & Durée */}
        <div className={`${cardClass} rounded-2xl p-5 transition-all duration-300`}>
          <div className={`flex items-center justify-between text-xs ${subText}`}>
            <span className="font-medium">Relevés Enregistrés</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-4xl font-black font-mono text-indigo-500">
              {dayRecords.length}
            </span>
            <span className={`text-xs font-semibold ${subText}`}>sessions</span>
          </div>
          <div className={`mt-3 text-[11px] border-t ${subtleBorder} pt-2 font-mono ${subText}`}>
            Télésurveillance active
          </div>
        </div>
      </div>

      {/* Daily Trend Chart (SVG Visualization) */}
      <div className={`${cardClass} rounded-3xl p-6 transition-all duration-300`}>
        <div className={`flex items-center justify-between pb-4 border-b ${subtleBorder}`}>
          <div className="flex items-center space-x-2.5">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className={`text-sm font-extrabold uppercase tracking-wider ${headingText}`}>
              Courbe d'Évolution Chronologique des Constantes
            </h3>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-emerald-500">
              <span className="w-3 h-1 bg-emerald-500 rounded-full" />
              <span>FC (BPM)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-cyan-500">
              <span className="w-3 h-1 bg-cyan-500 rounded-full" />
              <span>FR (CPM)</span>
            </span>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="mt-6 h-56 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="20" x2="700" y2="20" stroke={isLight ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
            <line x1="0" y1="65" x2="700" y2="65" stroke={isLight ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
            <line x1="0" y1="110" x2="700" y2="110" stroke={isLight ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
            <line x1="0" y1="155" x2="700" y2="155" stroke={isLight ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
            <line x1="0" y1="190" x2="700" y2="190" stroke={isLight ? "#cbd5e1" : "#334155"} />

            {/* Normal Range Shade for BPM */}
            <rect x="0" y="55" width="700" height="75" fill="#10b981" fillOpacity={isLight ? 0.08 : 0.04} />

            {/* FC Polyline */}
            {dayRecords.length > 1 && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                points={dayRecords.map((r, i) => {
                  const x = (i / (dayRecords.length - 1)) * 680 + 10;
                  const y = 180 - ((r.bpm - 30) / 120) * 160;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}

            {/* FR Polyline */}
            {dayRecords.length > 1 && (
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                points={dayRecords.map((r, i) => {
                  const x = (i / (dayRecords.length - 1)) * 680 + 10;
                  const y = 180 - ((r.resp - 5) / 30) * 150;
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}

            {/* Data points */}
            {dayRecords.map((r, i) => {
              const x = (i / (dayRecords.length - 1 || 1)) * 680 + 10;
              const yBpm = 180 - ((r.bpm - 30) / 120) * 160;
              return (
                <g key={r.id}>
                  <circle
                    cx={x}
                    cy={yBpm}
                    r={r.anomalyDetected ? 7 : 4.5}
                    fill={r.anomalyDetected ? '#f43f5e' : '#10b981'}
                    stroke={isLight ? "#ffffff" : "#050811"}
                    strokeWidth="2.5"
                  />
                  <text
                    x={x}
                    y={198}
                    fill={isLight ? "#64748b" : "#94a3b8"}
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {r.time.substring(0, 5)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Measurement Sessions Log Table */}
      <div className={`${cardClass} rounded-3xl p-6 transition-all duration-300`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b ${subtleBorder} gap-3`}>
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className={`text-sm font-extrabold uppercase tracking-wider ${headingText}`}>
              Journal Chronologique Détaillé des Relevés
            </h3>
          </div>

          {/* Filter Tabs */}
          <div className={`flex items-center space-x-1.5 p-1 rounded-2xl border text-xs ${innerBoxClass}`}>
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                filterType === 'ALL' ? 'bg-indigo-600 text-white shadow' : `${subText} hover:${headingText}`
              }`}
            >
              Tous ({dayRecords.length})
            </button>
            <button
              onClick={() => handleFilterChange('NORMAL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                filterType === 'NORMAL' ? 'bg-emerald-600 text-white shadow' : `${subText} hover:${headingText}`
              }`}
            >
              Normaux
            </button>
            <button
              onClick={() => handleFilterChange('ANOMALY')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                filterType === 'ANOMALY' ? 'bg-rose-600 text-white shadow' : `${subText} hover:${headingText}`
              }`}
            >
              Alertes / Anomalies ({totalAlerts})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className={`border-b ${subtleBorder} ${subText} uppercase text-[10px] tracking-wider`}>
                <th className="py-3 px-3">Horodatage</th>
                <th className="py-3 px-3">Fréquence Cardiaque</th>
                <th className="py-3 px-3">Fréquence Respiratoire</th>
                <th className="py-3 px-3">Accélération (MPU)</th>
                <th className="py-3 px-3">Statut Clinique</th>
                <th className="py-3 px-3">Observations Cliniques</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${subtleBorder}`}>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className={`py-3 px-3 font-bold ${headingText}`}>{r.time}</td>
                    <td className="py-3 px-3">
                      <span className={`font-black ${r.bpm > 100 ? 'text-rose-500' : r.bpm < 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {r.bpm} BPM
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-cyan-500 font-black">{r.resp} CPM</span>
                    </td>
                    <td className={`py-3 px-3 ${subText}`}>
                      {r.motion.toFixed(2)} g
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.status === 'NORMAL' 
                          ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40'
                          : isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className={`py-3 px-3 font-sans text-xs ${subText}`}>
                      {r.notes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={`py-8 text-center font-sans ${subText}`}>
                    Aucun enregistrement ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Clinical Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <div className="flex items-center space-x-2 text-indigo-900">
                  <Stethoscope className="w-7 h-7 text-indigo-700" />
                  <h1 className="text-xl font-black tracking-tight uppercase">
                    Rapport Clinique de Télésurveillance Médicale
                  </h1>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-sans">
                  Plateforme Médicale Connectée PULSE-ESP32 • Unité de Télé-Cardiologie & Surveillance Ambulatoire
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-600">
                <p>Émis le : {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
                <p>Praticien : {patient.medecinRef}</p>
              </div>
            </div>

            {/* Patient Summary Box */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-100 rounded-2xl border border-slate-300 text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Patiente</span>
                <strong className="text-sm text-slate-900">{patient.nom} {patient.prenom}</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Âge / Groupe</span>
                <strong className="text-sm text-slate-900">{patient.age} ans • {patient.groupeSanguin}</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Statut Gestationnel</span>
                <strong className="text-sm text-pink-700">
                  {patient.isPregnant ? `Enceinte (${patient.semainesAmenorrhee} SA)` : 'Non enceinte'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[10px]">IMC Biométrique</span>
                <strong className="text-sm text-slate-900">
                  {(patient.poids / ((patient.taille / 100) ** 2)).toFixed(1)} kg/m²
                </strong>
              </div>
            </div>

            {/* Day Observations Summary */}
            <div className="mt-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                Synthèse Hémodynamique du {selectedDate}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block">FC Moyenne</span>
                  <span className="text-lg font-bold text-emerald-700">{avgBpm} BPM (Min: {minBpm} / Max: {maxBpm})</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block">FR Moyenne</span>
                  <span className="text-lg font-bold text-cyan-700">{avgResp} CPM (Min: {minResp} / Max: {maxResp})</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block">Alertes Critiques</span>
                  <span className={`text-lg font-bold ${totalAlerts > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {totalAlerts} relevée(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Session Table for Report */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-2">
                Relevés Chronologiques de la Session
              </h3>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-200 text-slate-700 font-mono text-[10px]">
                  <tr>
                    <th className="p-2 border border-slate-300">Heure</th>
                    <th className="p-2 border border-slate-300">FC (BPM)</th>
                    <th className="p-2 border border-slate-300">FR (CPM)</th>
                    <th className="p-2 border border-slate-300">Statut</th>
                    <th className="p-2 border border-slate-300">Observations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {dayRecords.map((r) => (
                    <tr key={r.id} className={r.anomalyDetected ? 'bg-rose-50' : ''}>
                      <td className="p-2 border border-slate-300 font-bold">{r.time}</td>
                      <td className="p-2 border border-slate-300">{r.bpm} BPM</td>
                      <td className="p-2 border border-slate-300">{r.resp} CPM</td>
                      <td className="p-2 border border-slate-300">{r.status}</td>
                      <td className="p-2 border border-slate-300 font-sans">{r.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Doctor Signature Zone */}
            <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-xs font-sans">
              <div>
                <p className="font-semibold text-slate-800">Validation Médicale & Conclusions :</p>
                <p className="text-slate-600 mt-1 max-w-md text-[11px]">
                  Document généré automatiquement à des fins de téléconsultation et de surveillance continue à domicile.
                </p>
              </div>
              <div className="text-right border-t border-slate-400 pt-2 px-8">
                <p className="text-[10px] text-slate-500 font-mono uppercase">Cachet et Signature du Médecin Traitant</p>
                <p className="text-xs font-bold text-slate-800 mt-8">{patient.medecinRef}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end space-x-3 no-print">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Lancer l'Impression / Sauvegarder en PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
