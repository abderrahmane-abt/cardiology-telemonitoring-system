import React, { useState } from 'react';
import { Cpu, AlertTriangle, Layers, Zap } from 'lucide-react';

interface HardwareSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareSpecsModal: React.FC<HardwareSpecsModalProps> = ({ isOpen, onClose }) => {
  const [selectedComp, setSelectedComp] = useState<string>('MAX30102');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-widest">
                Jumeau Numérique Électronique & Câblage ESP32
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Architecture Matérielle & Règles Critiques de Sécurité
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-sm font-bold transition hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6 text-xs text-slate-300">
          
          {/* Critical Warnings from Faculty Guide */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border-2 border-rose-500/50 text-rose-200 space-y-2.5 shadow-xl">
            <div className="flex items-center space-x-2 font-bold text-rose-400 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
              <span>Consignes Impératives du Guide de Faculté de Médecine</span>
            </div>
            <ul className="space-y-2 list-disc list-inside text-rose-300/90 leading-relaxed text-[11px]">
              <li>
                <strong>Alimentation MAX30102 STRICTEMENT en 3.3V :</strong> Ne JAMAIS connecter le module MAX30102 à la broche 5V sous peine de destruction irréversible des LED émettrices et photodiode.
              </li>
              <li>
                <strong>Calibrage Préalable du MT3608 au Multimètre :</strong> Avant de brancher la sortie du Step-Up MT3608 sur la broche VIN de l'ESP32, il <strong>faut</strong> visser le potentiomètre en laiton pour régler la tension à <strong>exactement 5.0V</strong> (les modules sortent d'usine à 18-24V !).
              </li>
              <li>
                <strong>Isolation de l'Alimentation USB :</strong> Mettre l'interrupteur batterie physique sur <strong>OFF</strong> lors du téléversement du code Arduino via le câble micro-USB/USB-C.
              </li>
            </ul>
          </div>

          {/* Interactive Visual Electronic Schematic */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Schéma Fonctionnel & Bus I2C Mutualisé</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Cliquez sur un module pour inspecter</span>
            </div>

            {/* Circuit diagram nodes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              {/* Node: ESP32 */}
              <div 
                onClick={() => setSelectedComp('ESP32')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  selectedComp === 'ESP32' ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] text-indigo-400 font-bold block">CPU MAÎTRE</span>
                <strong className="text-white text-xs block mt-1">ESP32 DevKit V4</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">GPIO 21 (SDA) • GPIO 22 (SCL)</span>
              </div>

              {/* Node: MAX30102 */}
              <div 
                onClick={() => setSelectedComp('MAX30102')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  selectedComp === 'MAX30102' ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] text-rose-400 font-bold block">I2C: 0x57 • 3.3V STRICT</span>
                <strong className="text-white text-xs block mt-1">MAX30102 (PPG)</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">LED IR 880nm / Rouge 660nm</span>
              </div>

              {/* Node: MPU6050 */}
              <div 
                onClick={() => setSelectedComp('MPU6050')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  selectedComp === 'MPU6050' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] text-cyan-400 font-bold block">I2C: 0x68 • 3.3V/5V</span>
                <strong className="text-white text-xs block mt-1">MPU6050 (GY-521)</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">Inclinomètre & Chute &gt; 2.5g</span>
              </div>

              {/* Node: MT3608 */}
              <div 
                onClick={() => setSelectedComp('MT3608')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  selectedComp === 'MT3608' ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] text-amber-400 font-bold block">STEP-UP 3.7V $\rightarrow$ 5.0V</span>
                <strong className="text-white text-xs block mt-1">MT3608 Boost</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">Sortie VIN: 5.00V Régulé</span>
              </div>
            </div>
          </div>

          {/* BOM Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Nomenclature Officielle des Composants (BOM)</span>
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Composant</th>
                    <th className="p-3">Rôle Médical / Fonction</th>
                    <th className="p-3">Bus / Pinout</th>
                    <th className="p-3">Alimentation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white">ESP32 DevKit V4</td>
                    <td className="p-3 text-slate-300">Microcontrôleur central, filtrage passe-bas, série UART 115200</td>
                    <td className="p-3 text-indigo-400">Maître I2C (GPIO 21 SDA / GPIO 22 SCL)</td>
                    <td className="p-3 text-emerald-400 font-bold">5.0V sur VIN</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white">MAX30102</td>
                    <td className="p-3 text-slate-300">Oxymétrie de pouls & onde PPG (Infrarouge 880nm / Rouge 660nm)</td>
                    <td className="p-3 text-indigo-400">I2C (Adresse 0x57)</td>
                    <td className="p-3 text-rose-400 font-extrabold">3.3V STRICT</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white">MPU6050 (GY-521)</td>
                    <td className="p-3 text-slate-300">Accéléromètre/Gyroscope 6 axes : Fréquence respiratoire & Chute</td>
                    <td className="p-3 text-indigo-400">I2C (Adresse 0x68)</td>
                    <td className="p-3 text-emerald-400">3.3V / 5V</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white">OLED SSD1306</td>
                    <td className="p-3 text-slate-300">Écran d'affichage local 0.96" (128x64 px) pour le patient</td>
                    <td className="p-3 text-indigo-400">I2C (Adresse 0x3C)</td>
                    <td className="p-3 text-emerald-400">3.3V</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white">MT3608</td>
                    <td className="p-3 text-slate-300">Convertisseur Step-Up Boost DC-DC élève 3.7V à 5.0V constants</td>
                    <td className="p-3 text-slate-400">Entre interrupteur et VIN ESP32</td>
                    <td className="p-3 text-amber-400 font-bold">5.0V Régulé</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white">TP4056 + LiPo</td>
                    <td className="p-3 text-slate-300">Module de charge USB-C & Batterie LiPo 3.7V 1000mAh</td>
                    <td className="p-3 text-slate-400">Alimentation autonome nomade</td>
                    <td className="p-3 text-emerald-400">3.7V nominal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-950 transition"
          >
            Fermer le Guide Matériel
          </button>
        </div>
      </div>
    </div>
  );
};
