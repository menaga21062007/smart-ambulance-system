import React from 'react';
import { CareLinkLogo } from './CareLinkLogo';
import { ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 text-xs py-8 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <CareLinkLogo size="sm" />
            <p className="text-[11px] leading-relaxed">
              CareLink Medical Center emergency platform connecting ambulances, ER staff, beds, and traffic control systems.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-navy-800 dark:text-white mb-2 uppercase text-[10px] tracking-wider">Emergency Contact</h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-hospital-600 dark:text-hospital-400">
                <PhoneCall className="w-3.5 h-3.5" /> Hotline: +1-800-555-0199
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> emergency@carelink.health
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> 120 Healthcare Avenue, Downtown
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-navy-800 dark:text-white mb-2 uppercase text-[10px] tracking-wider">Security & Standards</h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> HIPAA & Role-Based Access
              </div>
              <p className="text-[10px]">Encrypted data transmission & audit logging enabled.</p>
            </div>
          </div>

          <div className="bg-hospital-50 dark:bg-navy-800 border border-hospital-100 dark:border-navy-700 p-3 rounded-xl text-[10px] space-y-1">
            <div className="font-extrabold text-hospital-600 dark:text-hospital-300 uppercase">Prototype Safety Notice</div>
            <p className="leading-tight">
              This software prototype is for educational and demonstration purposes. It does not directly control real city traffic signals or make final medical decisions.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-navy-800 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400">
          <div>© 2026 CareLink Medical Center. Connected Care. Faster Response. Better Outcomes.</div>
          <div className="mt-2 sm:mt-0">Privacy Policy • Terms of Service • System Status: Operational</div>
        </div>

      </div>
    </footer>
  );
};
