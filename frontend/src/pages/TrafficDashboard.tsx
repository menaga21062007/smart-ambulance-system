import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MapView } from '../components/map/MapView';
import { TrafficSignal, Hospital } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ResetMapDemoModal } from '../components/ResetMapDemoModal';
import { useAuth } from '../context/AuthContext';
import {
  TrafficCone,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  Play,
  Pause,
  AlertTriangle,
  ArrowUpRight,
  Check,
  X,
  RefreshCw,
  ShieldCheck,
  Zap,
  Activity,
  History
} from 'lucide-react';

interface EventTimelineItem {
  id: string;
  time: string;
  event: string;
  status: 'info' | 'success' | 'warning' | 'active';
}

export const TrafficDashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role_name === 'System Administrator';

  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeAmbulancePos] = useState({ lat: 12.9650, lng: 77.5880, vehicle_number: 'AMB-MED-101', speed: 48, accuracy: 12 });
  const [actionMsg, setActionMsg] = useState('');

  // Priority Signal State
  const [priorityState, setPriorityState] = useState<'NORMAL' | 'AMBULANCE_DETECTED' | 'VALIDATING' | 'AUTO_APPROVED' | 'AMBULANCE_PRIORITY_ACTIVE' | 'RETURNING_TO_NORMAL'>('AMBULANCE_PRIORITY_ACTIVE');
  const [approachDirection, setApproachDirection] = useState<'North' | 'South' | 'East' | 'West'>('North');
  const [countdown, setCountdown] = useState<number>(28);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Live Event Timeline
  const [timelineEvents, setTimelineEvents] = useState<EventTimelineItem[]>([
    { id: '1', time: '14:45:02', event: 'Ambulance #AMB-MED-101 detected within 300m radius', status: 'info' },
    { id: '2', time: '14:45:03', event: 'GPS validated (Accuracy: ±12m, Heading: North Bound)', status: 'info' },
    { id: '3', time: '14:45:03', event: 'Automatic Priority Activated for MG Road Junction', status: 'active' },
    { id: '4', time: '14:45:28', event: 'Ambulance passed signal #SIG-101', status: 'success' },
    { id: '5', time: '14:45:33', event: 'Signal returned to NORMAL cycle', status: 'info' }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const s = await api.getTrafficSignals();
        setSignals(s);
        const h = await api.getHospitals();
        setHospitals(h);
        const hist = await api.getSignalHistory();
        setHistory(hist);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // Countdown Timer
  useEffect(() => {
    let interval: any;
    if (priorityState === 'AMBULANCE_PRIORITY_ACTIVE' && !isPaused && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setPriorityState('RETURNING_TO_NORMAL');
            addTimelineEvent('Ambulance passed signal #SIG-101', 'success');
            setTimeout(() => {
              setPriorityState('NORMAL');
              addTimelineEvent('Signal returned to NORMAL cycle', 'info');
            }, 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [priorityState, isPaused, countdown]);

  const addTimelineEvent = (eventText: string, status: 'info' | 'success' | 'warning' | 'active') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const newEv: EventTimelineItem = {
      id: Math.random().toString(36).substring(2, 9),
      time: timeStr,
      event: eventText,
      status
    };
    setTimelineEvents((prev) => [newEv, ...prev].slice(0, 8));
  };

  const handleManualOverride = async (signalId: number, status: 'GREEN' | 'RED', emergencyMode: boolean) => {
    setActionMsg('');
    try {
      await api.overrideSignal(signalId, status, emergencyMode);
      setPriorityState(emergencyMode ? 'AMBULANCE_PRIORITY_ACTIVE' : 'NORMAL');
      setActionMsg(`Traffic Signal #${signalId} overridden to ${status} (Manual Override Mode: ${emergencyMode ? 'ON' : 'OFF'})`);
      addTimelineEvent(`Manual Override: Signal #${signalId} forced to ${status}`, 'warning');
      
      const s = await api.getTrafficSignals();
      setSignals(s);
      const hist = await api.getSignalHistory();
      setHistory(hist);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  const handleConfirmResetMap = async () => {
    setIsResetting(true);
    setActionMsg('');
    try {
      await api.resetMapDemoData();
      setPriorityState('NORMAL');
      setActionMsg('Map Demonstration Data reset successfully! Signal requests & demo routes reseeded.');
      addTimelineEvent('Administrator reset map demonstration data', 'warning');
      setIsResetModalOpen(false);

      const s = await api.getTrafficSignals();
      setSignals(s);
      const hist = await api.getSignalHistory();
      setHistory(hist);
    } catch (err: any) {
      setActionMsg(`Reset Error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Prominent Mandatory Simulation Disclaimer Banner */}
      <div className="bg-amber-950/90 border border-amber-800 p-4 rounded-2xl text-amber-200 text-xs font-bold flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-900/80 rounded-xl text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Traffic Signal Simulation — Demonstration Mode</h4>
            <p className="text-[11px] text-amber-300 font-medium">
              This software prototype simulates emergency traffic priority. It does not directly control real public traffic signals.
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="border-amber-700 text-amber-300 hover:bg-amber-900/50 text-xs font-extrabold flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Map Demo Data</span>
          </Button>
        )}
      </div>

      {/* Header Card */}
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-purple-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-950 text-purple-400 border border-purple-800 rounded-2xl animate-float">
            <TrafficCone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Automated Signal Priority Monitoring
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </h2>
            <p className="text-xs text-slate-400">Automatic software decision engine • GPS Validation & Proximity Matrix</p>
          </div>
        </div>

        {/* Direction Indicator & Auto Status */}
        <div className="flex items-center space-x-3">
          <Badge status="Available" pulse>AUTO-VALIDATION ACTIVE</Badge>
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-extrabold text-cyan-400">
            Radius: 300m (Critical) / 250m (Urgent)
          </div>
        </div>
      </Card>

      {actionMsg && (
        <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Reusable Leaflet Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <MapView
            hospitals={hospitals}
            trafficSignals={signals}
            ambulancePosition={activeAmbulancePos}
            activePrioritySignal={
              priorityState === 'AMBULANCE_PRIORITY_ACTIVE'
                ? { name: 'MG Road Junction', countdown, direction: approachDirection }
                : null
            }
          />

          {/* Real-time Event Timeline Component */}
          <Card className="space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" /> Live Signal Event Timeline
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {timelineEvents.map((te) => (
                <div
                  key={te.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-mono ${
                    te.status === 'active'
                      ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300 animate-pulse'
                      : te.status === 'success'
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                      : te.status === 'warning'
                      ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-bold text-[11px] text-slate-400 shrink-0 mr-3">{te.time}</span>
                  <span className="font-medium text-slate-200 flex-1 truncate">{te.event}</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 ml-2 shrink-0"></span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Automatic Monitoring & Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Automatic Decision Status Card */}
          <Card className="space-y-4 border-l-4 border-l-cyan-400">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">Automatic Decision Engine</span>
                <h3 className="text-base font-extrabold text-white">MG Road Junction (#SIG-101)</h3>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase animate-pulse">
                Automatically Activated
              </span>
            </div>

            {/* Validation Criteria Checklist */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center justify-between font-extrabold text-white">
                <span>Automatic Decision Rationale:</span>
                <span className="text-emerald-400">PASS (100% Validated)</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-center justify-between">
                  <span>• GPS Accuracy ($\le 30$m):</span>
                  <b className="text-emerald-400">12m (Valid)</b>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Patient Triage Level:</span>
                  <b className="text-rose-400">Critical/Red</b>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Geofence Distance ($\le 300$m):</span>
                  <b className="text-cyan-400">185m</b>
                </li>
                <li className="flex items-center justify-between">
                  <span>• Approach Direction:</span>
                  <b className="text-emerald-400">{approachDirection} Bound</b>
                </li>
              </ul>
            </div>

            {/* Operator Safety Controls */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Safety Oversight Controls</span>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManualOverride(1, 'RED', false)}
                  className="border-rose-800 text-rose-300 hover:bg-rose-950/50 font-bold text-xs"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Priority
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800 font-bold text-xs"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManualOverride(1, 'GREEN', true)}
                className="w-full border-purple-800 text-purple-300 hover:bg-purple-950/50 font-bold text-xs"
              >
                Manual Override Command
              </Button>
            </div>
          </Card>

          {/* Queued & Safety Blocked Panel */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <span className="font-extrabold text-white uppercase">Safety & Conflict Queue</span>
              <span className="text-[10px] font-bold text-amber-400">0 Safety Blocked</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">No Conflicting Ambulances</span>
                <span className="text-[10px] font-bold text-emerald-400">CLEAR</span>
              </div>
              <p className="text-[11px] text-slate-400">Queue evaluates triage priority & ETA if multi-ambulance approach occurs.</p>
            </div>
          </Card>

        </div>

      </div>

      {/* Audit History Table */}
      <Card className="space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" /> Priority Signal Event History Audit Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="pb-2">Time</th>
                <th className="pb-2">Traffic Signal</th>
                <th className="pb-2">Ambulance ID</th>
                <th className="pb-2">Decision Status</th>
                <th className="pb-2">Approach Direction</th>
                <th className="pb-2">Auto Validation Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/50">
                  <td className="py-2.5 font-mono text-[11px] text-slate-400">{h.requested_at}</td>
                  <td className="py-2.5 font-bold text-white">{h.signal_name}</td>
                  <td className="py-2.5 text-cyan-400 font-bold">{h.vehicle_number || 'AMB-MED-101'}</td>
                  <td className="py-2.5">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                      {h.status || 'AUTO_APPROVED'}
                    </span>
                  </td>
                  <td className="py-2.5 text-emerald-400 font-bold">{approachDirection} Bound</td>
                  <td className="py-2.5 text-slate-400">{h.notes || 'Auto-Activated: Critical triage within 185m'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Admin Reset Map Modal */}
      <ResetMapDemoModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmResetMap}
        isLoading={isResetting}
      />

    </div>
  );
};
