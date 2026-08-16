import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Building2,
  TrafficCone,
  Bed,
  Stethoscope,
  Sparkles,
  Package,
  BarChart3,
  Bell,
  LogOut,
  FileCheck,
  ChevronRight,
  Home,
  UserCheck,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const { user } = useAuth();

  const sections = [
    {
      title: 'COMMAND CENTER',
      items: [
        { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard, roles: ['System Administrator', 'Emergency Hospital Staff', 'Doctor', 'Nurse or Ward Manager'] },
        { id: 'ambulance', label: 'Ambulance GPS', icon: Truck, roles: ['System Administrator', 'Ambulance Staff'] },
        { id: 'hospital', label: 'Emergency Patients', icon: Building2, roles: ['System Administrator', 'Emergency Hospital Staff'] },
        { id: 'traffic', label: 'Traffic Control', icon: TrafficCone, roles: ['System Administrator', 'Traffic-Control Operator'] },
      ]
    },
    {
      title: 'PATIENT CARE WORKFLOW',
      items: [
        { id: 'admissions', label: 'Admissions & Intake', icon: FileCheck, roles: ['System Administrator', 'Emergency Hospital Staff', 'Nurse or Ward Manager'] },
        { id: 'doctor', label: 'Doctor Clinical Portal', icon: Stethoscope, roles: ['System Administrator', 'Doctor'] },
        { id: 'wards', label: 'Bed Management', icon: Bed, roles: ['System Administrator', 'Emergency Hospital Staff', 'Nurse or Ward Manager'] },
        { id: 'cleaning', label: 'Cleaning Tasks', icon: Sparkles, roles: ['System Administrator', 'Cleaning Staff', 'Nurse or Ward Manager'] },
      ]
    },
    {
      title: 'RESOURCE & ANALYTICS',
      items: [
        { id: 'resources', label: 'Resource Management', icon: Package, roles: ['System Administrator', 'Emergency Hospital Staff', 'Doctor'] },
        { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['System Administrator', 'Emergency Hospital Staff', 'Ambulance Staff'] },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['System Administrator', 'Emergency Hospital Staff'] },
      ]
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-6 shrink-0 transition-colors shadow-xl">
        
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] uppercase font-extrabold text-cyan-400/80 tracking-wider">
              {sec.title}
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isRoleRecommended = item.roles.includes(user?.role_name || '');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all relative ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border-l-4 border-cyan-400 shadow-lg shadow-cyan-950/50'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {isRoleRecommended && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        <div className="pt-4 border-t border-slate-800 space-y-1">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 px-2 py-1.5 flex items-center justify-around text-[10px] shadow-2xl">
        {sections[0].items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg font-bold transition-all ${
                isActive ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
