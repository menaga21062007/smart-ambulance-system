import React from 'react';
import { BedStatus, TriageLevel } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  status?: BedStatus | string;
  triage?: TriageLevel | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  triage,
  size = 'md',
  pulse = false
}) => {
  let styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (status) {
    switch (status) {
      case 'Available':
        styleClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-700 font-extrabold shadow-xs shadow-emerald-950';
        break;
      case 'Reserved':
        styleClasses = 'bg-cyan-950/80 text-cyan-300 border-cyan-700 font-extrabold shadow-xs shadow-cyan-950';
        break;
      case 'Occupied':
        styleClasses = 'bg-rose-950/80 text-rose-300 border-rose-700 font-extrabold shadow-xs shadow-rose-950';
        break;
      case 'Under Cleaning':
        styleClasses = 'bg-amber-950/80 text-amber-300 border-amber-700 font-extrabold shadow-xs shadow-amber-950';
        break;
      case 'Out of Service':
        styleClasses = 'bg-slate-800 text-slate-400 border-slate-700 font-bold';
        break;
      case 'Maintenance':
        styleClasses = 'bg-purple-950/80 text-purple-300 border-purple-700 font-extrabold shadow-xs shadow-purple-950';
        break;
    }
  }

  if (triage) {
    if (triage.includes('Critical') || triage.includes('Red')) {
      styleClasses = 'bg-rose-950/90 text-rose-300 border-rose-700 font-extrabold shadow-xs shadow-rose-950';
    } else if (triage.includes('Urgent') || triage.includes('Yellow')) {
      styleClasses = 'bg-amber-950/90 text-amber-300 border-amber-700 font-extrabold shadow-xs shadow-amber-950';
    } else if (triage.includes('Moderate') || triage.includes('Green')) {
      styleClasses = 'bg-emerald-950/90 text-emerald-300 border-emerald-700 font-extrabold shadow-xs shadow-emerald-950';
    } else {
      styleClasses = 'bg-cyan-950/90 text-cyan-300 border-cyan-700 font-extrabold shadow-xs shadow-cyan-950';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${sizeClasses} ${styleClasses}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children || status || triage}
    </span>
  );
};
