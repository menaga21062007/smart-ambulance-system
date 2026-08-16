import React from 'react';
import { Navigation, Radio, CheckCircle2, AlertCircle, Power } from 'lucide-react';

interface GPSStatusPanelProps {
  isGpsActive: boolean;
  accuracy: number;
  speed: number;
  vehicleNumber: string;
  onToggleGps: () => void;
}

export const GPSStatusPanel: React.FC<GPSStatusPanelProps> = ({
  isGpsActive,
  accuracy,
  speed,
  vehicleNumber,
  onToggleGps
}) => {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg border ${
          isGpsActive
            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 animate-pulse'
            : 'bg-rose-950/80 text-rose-400 border-rose-800'
        }`}>
          <Radio className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white">{vehicleNumber}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isGpsActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {isGpsActive ? 'GPS STREAMING LIVE' : 'GPS PAUSED'}
            </span>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center space-x-3 mt-0.5">
            <span>Accuracy: <b className="text-emerald-400">±{accuracy}m</b></span>
            <span>Speed: <b className="text-cyan-400">{speed} km/h</b></span>
            <span>Last Sync: <b className="text-slate-300">Just Now</b></span>
          </div>
        </div>
      </div>

      <button
        onClick={onToggleGps}
        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors ${
          isGpsActive
            ? 'bg-rose-600 hover:bg-rose-500 text-white'
            : 'bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow-md'
        }`}
      >
        <Power className="w-3.5 h-3.5" />
        <span>{isGpsActive ? 'Pause GPS' : 'Start GPS Stream'}</span>
      </button>
    </div>
  );
};
