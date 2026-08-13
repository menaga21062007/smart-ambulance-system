import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { CareLinkLogo } from './CareLinkLogo';
import {
  Bell,
  ChevronDown,
  CheckCircle2,
  Shield,
  Radio,
  Clock as ClockIcon,
  LogOut,
  Search,
  Activity
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNavigateHome,
  onLogout
}) => {
  const { user, demoAccounts, loginAsDemoUser } = useAuth();
  const { connected, alerts, removeAlert } = useSocket();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAlertDrawer, setShowAlertDrawer] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' • ' +
        now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: CareLink Logo */}
        <button onClick={onNavigateHome} className="focus:outline-none shrink-0">
          <CareLinkLogo size="md" light />
        </button>

        {/* Center: Search Input & Hospital Operational Status */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, bed number, or ambulance ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-500"
            />
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>City General ER • Operational</span>
          </div>
        </div>

        {/* Right: Clock, Notifications & Role Switcher */}
        <div className="flex items-center space-x-3 shrink-0">
          
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-extrabold text-cyan-300">
            <ClockIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeString}</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertDrawer(!showAlertDrawer)}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors border border-slate-800 shadow-sm"
              title="Real-time Alerts"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {alerts.length}
                </span>
              )}
            </button>

            {showAlertDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-rose-400" /> System Alerts ({alerts.length})
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowAlertDrawer(false);
                    }}
                    className="text-xs text-cyan-400 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No active alerts. System operating normally.</p>
                  ) : (
                    alerts.map((a) => (
                      <div
                        key={a.id}
                        className={`p-3 rounded-xl border text-xs relative ${
                          a.type === 'emergency'
                            ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                            : a.type === 'traffic'
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                            : 'bg-cyan-950/40 border-cyan-800 text-cyan-200'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between mb-1">
                          <span>{a.title}</span>
                          <span className="text-[10px] opacity-75">{a.timestamp}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90">{a.message}</p>
                        <button
                          onClick={() => removeAlert(a.id)}
                          className="mt-2 text-[10px] font-bold underline hover:opacity-100"
                        >
                          Dismiss
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 transition-all text-xs font-semibold text-slate-200"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-extrabold leading-none text-white">{user?.name}</div>
                <div className="text-[10px] text-cyan-400 font-bold mt-0.5">{user?.role_name}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-slide-up">
                <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Switch Demo User Role</span>
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        loginAsDemoUser(acc);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        user?.id === acc.id
                          ? 'bg-slate-800 border border-slate-700 text-white font-bold'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">{acc.name}</div>
                        <div className="text-[10px] text-slate-400">{acc.role_name}</div>
                      </div>
                      {user?.id === acc.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left p-2.5 rounded-xl text-xs text-rose-400 font-bold hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
