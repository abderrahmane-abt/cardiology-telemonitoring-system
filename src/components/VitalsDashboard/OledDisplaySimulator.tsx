import React from 'react';
import { Eye, BatteryMedium, Wifi } from 'lucide-react';

interface OledDisplaySimulatorProps {
  bpm: number;
  resp: number;
  finger: boolean;
  motion: number;
  status: string;
}

export const OledDisplaySimulator: React.FC<OledDisplaySimulatorProps> = ({
  bpm,
  resp,
  finger,
  status
}) => {
  const isAlarm = status.includes('CHUTE') || status.includes('MALAISE');

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Écran Embarqué Patient (OLED SSD1306)
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
          I2C: 0x3C • 128×64 px
        </span>
      </div>

      {/* Realistic OLED Bezel with Screws and Pixel Screen */}
      <div className="my-3 p-3 bg-neutral-900 rounded-xl border-2 border-neutral-700 shadow-inner relative">
        {/* Screw accents */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-neutral-600 border border-neutral-500" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neutral-600 border border-neutral-500" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-neutral-600 border border-neutral-500" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-neutral-600 border border-neutral-500" />

        {/* OLED Screen Area (0.96" Dual Color: Yellow Top 16px, Blue Bottom 48px) */}
        <div className={`w-full bg-black rounded p-2.5 font-mono select-none overflow-hidden border border-neutral-800 shadow-2xl ${isAlarm ? 'animate-pulse' : ''}`}>
          
          {/* Top Yellow Band (16px high on real SSD1306) */}
          <div className="flex items-center justify-between text-yellow-400 text-[11px] font-bold pb-1 border-b border-yellow-400/30">
            <div className="flex items-center space-x-1">
              <span>PULSE-ESP32</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <Wifi className="w-3 h-3 text-yellow-400" />
              <div className="flex items-center">
                <BatteryMedium className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[9px]">88%</span>
              </div>
            </div>
          </div>

          {/* Bottom Blue Band (48px high on real SSD1306) */}
          <div className="pt-2 text-cyan-400 text-xs">
            {isAlarm ? (
              <div className="bg-cyan-400 text-black p-1 text-center font-extrabold uppercase rounded">
                ! ALERTE CHUTE 15S !
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-cyan-500/80 block uppercase">Pouls (FC)</span>
                  <span className="text-xl font-extrabold text-cyan-300">
                    {finger ? `${bpm}` : '--'} <span className="text-[10px] font-normal">BPM</span>
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-cyan-500/80 block uppercase">Resp (FR)</span>
                  <span className="text-xl font-extrabold text-cyan-300">
                    {resp} <span className="text-[10px] font-normal">CPM</span>
                  </span>
                </div>
              </div>
            )}

            {/* Mini Pixel Oscilloscope bar */}
            <div className="mt-2 pt-1 border-t border-cyan-900/60 flex justify-between items-center text-[9px] text-cyan-400/90">
              <span className="truncate">ETAT: {status}</span>
              <span className="tracking-widest">▲_/\_▲_</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500 flex justify-between items-center">
        <span>Affichage local sur le boîtier 3D patient</span>
        <span className="text-emerald-500 font-semibold">Tension : 3.3V</span>
      </div>
    </div>
  );
};
