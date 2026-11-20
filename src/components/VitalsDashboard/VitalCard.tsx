import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { medicalAudio } from '../../utils/audio';
import { UI_STYLES } from '../../types/themeStyles';
import type { UIStyleId } from '../../types/themeStyles';

interface VitalCardProps {
  title: string;
  subtitle: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'danger' | 'neutral';
  statusText: string;
  normalRange: string;
  min: number;
  max: number;
  currentNumeric?: number;
  additionalInfo?: string;
  glowColor?: string;
  theme?: 'light' | 'dark';
  currentStyle?: UIStyleId;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  title,
  subtitle,
  value,
  unit,
  icon: Icon,
  status,
  statusText,
  normalRange,
  min,
  max,
  currentNumeric,
  additionalInfo,
  currentStyle = 'ICU_OBSIDIAN'
}) => {
  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.ICU_OBSIDIAN;
  const isLight = styleConfig.themeMode === 'light';

  const style = {
    container: 'bg-[#0a0f1d] border border-slate-800 hover:border-slate-700 shadow-xl shadow-slate-950/70',
    title: 'text-slate-400',
    subtitle: 'text-white',
    text: status === 'danger' ? 'text-rose-400' : status === 'warning' ? 'text-amber-400' : 'text-emerald-400',
    badge: status === 'danger' ? 'bg-rose-950/80 text-rose-300 border-rose-500/50' : 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40',
    circleStroke: status === 'danger' ? '#f43f5e' : status === 'warning' ? '#f59e0b' : '#10b981',
    iconBg: 'bg-slate-800 text-slate-300'
  };
  
  let pct = 50;
  if (typeof currentNumeric === 'number') {
    pct = Math.min(100, Math.max(0, ((currentNumeric - min) / (max - min)) * 100));
  }

  const radius = 24;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (pct / 100) * circ;

  return (
    <div
      onMouseEnter={() => medicalAudio.playUiClick()}
      className={`rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden relative ${style.container}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${style.iconBg} group-hover:scale-105 transition-transform shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest block ${style.title}`}>
              {title}
            </span>
            <h4 className={`text-xs font-bold tracking-wide ${style.subtitle}`}>
              {subtitle}
            </h4>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
          {statusText}
        </span>
      </div>

      {/* Value Display with Circular Radial Progress Dial */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-baseline space-x-2">
          <span className={`text-4xl font-extrabold font-mono tracking-tight ${style.text}`}>
            {value}
          </span>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            {unit}
          </span>
        </div>

        {/* Circular Mini Radial Gauge */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke={isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)'}
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke={style.circleStroke}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circ}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className={`absolute text-[10px] font-mono font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>

      {/* Contextual Bottom Information */}
      <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
        isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
      }`}>
        <span>Cible: {normalRange}</span>
        {additionalInfo && <span className="font-medium">{additionalInfo}</span>}
      </div>
    </div>
  );
};
