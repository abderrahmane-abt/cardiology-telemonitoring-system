import React, { useState } from 'react';
import { Palette, Check, Sparkles, X, Layers } from 'lucide-react';
import { UI_STYLES } from '../types/themeStyles';
import type { UIStyleId } from '../types/themeStyles';
import { medicalAudio } from '../utils/audio';

interface DevStyleSwitcherProps {
  currentStyle: UIStyleId;
  onSelectStyle: (style: UIStyleId) => void;
}

export const DevStyleSwitcher: React.FC<DevStyleSwitcherProps> = ({
  currentStyle,
  onSelectStyle
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: UIStyleId) => {
    medicalAudio.playUiClick();
    onSelectStyle(id);
  };

  const styleList = Object.values(UI_STYLES);
  const activeConfig = UI_STYLES[currentStyle];

  return (
    <>
      {/* Floating Bottom-Right Dev Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            medicalAudio.playUiClick();
            setIsOpen(prev => !prev);
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-2xl border transition-all duration-300 font-sans text-xs font-bold ${
            isOpen
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 scale-105 shadow-indigo-500/40'
              : 'bg-slate-900/95 hover:bg-slate-800 text-white border-slate-700/80 hover:border-indigo-500/50 hover:scale-105 shadow-black/60 backdrop-blur-xl'
          }`}
        >
          <div className="p-1 rounded-lg bg-indigo-500/30 text-indigo-300">
            <Palette className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-indigo-400">
              Dev Switcher
            </span>
            <span className="block text-xs font-bold leading-none">
              {activeConfig.shortLabel}
            </span>
          </div>
          <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* Modal / Flyout Drawer for Style Selection */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 rounded-full" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Sélecteur de Styles UI/UX Cliniques
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium">
                      4 Thèmes Prêts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Testez et comparez en direct les 4 ambiances graphiques avec votre ami pour choisir la version finale.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of 4 Styles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              {styleList.map((style) => {
                const isSelected = style.id === currentStyle;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleSelect(style.id)}
                    className={`p-4 rounded-2xl text-left border transition-all duration-300 relative group overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Active Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {style.themeMode === 'light' ? 'Mode Clair' : 'Mode Sombre'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans truncate">
                        {style.inspiration}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {style.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1 mb-3">
                      {style.tagline}
                    </p>

                    {/* Color Palette Previews & Heart Mode */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                      <span>Palette :</span>
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" 
                          style={{ backgroundColor: style.accentPrimary }} 
                          title="Primaire"
                        />
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" 
                          style={{ backgroundColor: style.accentSecondary }} 
                          title="Secondaire"
                        />
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" 
                          style={{ backgroundColor: style.accentDanger }} 
                          title="Urgence / FC"
                        />
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" 
                          style={{ backgroundColor: style.accentWarning }} 
                          title="Avertissement"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions & Tip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Le choix est instantanément sauvegardé en mémoire locale.</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
              >
                Appliquer & Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
