import React from 'react';
import { ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';

interface SignalPriorityOverlayProps {
  signalName: string;
  countdown: number;
  direction: string;
}

export const SignalPriorityOverlay: React.FC<SignalPriorityOverlayProps> = ({
  signalName,
  countdown,
  direction
}) => {
  return (
    <div className="absolute top-3 left-3 z-30 bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/60 shadow-2xl shadow-cyan-950/80 space-y-2 animate-pulse-glow max-w-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-extrabold text-cyan-400">
          <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>Ambulance Entry Priority Active</span>
        </div>
        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase">
          Automatically Activated
        </span>
      </div>

      <div className="text-xs space-y-1">
        <div className="font-extrabold text-white text-sm">{signalName}</div>
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>Direction Corridor: <b className="text-emerald-400">{direction} Bound</b></span>
          <span className="text-cyan-400 font-extrabold text-xs">{countdown}s</span>
        </div>
      </div>
    </div>
  );
};
