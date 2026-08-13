import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  activeTab: string;
  onNavigateHome: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeTab, onNavigateHome }) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Command Dashboard';
      case 'ambulance': return 'Ambulance Tracking & Telemetry';
      case 'hospital': return 'Emergency ER & Bed Recommendations';
      case 'traffic': return 'Traffic Priority Control';
      case 'wards': return 'Bed Management Matrix';
      case 'doctor': return 'Doctor Clinical Portal';
      case 'cleaning': return 'Sanitization Tasks';
      case 'resources': return 'Emergency Resource Monitor';
      case 'notifications': return 'System Notifications';
      case 'admissions': return 'Admission & Discharge';
      case 'reports': return 'Operational Analytics';
      default: return 'Command Dashboard';
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 hover:text-hospital-600 dark:hover:text-hospital-400 transition-colors font-semibold"
      >
        <Home className="w-3.5 h-3.5" />
        <span>CareLink ER</span>
      </button>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      <span className="font-bold text-navy-800 dark:text-slate-200">
        {getTabTitle(activeTab)}
      </span>
    </nav>
  );
};
