import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { TrafficSignal, Hospital } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TrafficCone, ShieldAlert, CheckCircle2, XCircle, Clock, Radio, Play, Pause, AlertTriangle, ArrowUpRight, Check, X } from 'lucide-react';

export const TrafficDashboard: React.FC = () => {
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeAmbulancePos] = useState({ lat: 12.9650, lng: 77.5880 });
  const [actionMsg, setActionMsg] = useState('');

  // Priority Signal Simulation State
  const [priorityState, setPriorityState] = useState<'NORMAL' | 'PRIORITY_REQUESTED' | 'APPROVED' | 'AMBULANCE_PRIORITY_ACTIVE' | 'RETURNING_TO_NORMAL'>('AMBULANCE_PRIORITY_ACTIVE');
  const [approachDirection, setApproachDirection] = useState<'North' | 'South' | 'East' | 'West'>('North');
  const [countdown, setCountdown] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);

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
            setTimeout(() => setPriorityState('NORMAL'), 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [priorityState, isPaused, countdown]);

  const handleApprove = () => {
    setPriorityState('AMBULANCE_PRIORITY_ACTIVE');
    setCountdown(30);
    setIsPaused(false);
    setActionMsg('Priority Request APPROVED by Traffic Operator! "Ambulance Entry Priority" signal active.');
  };

  const handleReject = () => {
    setPriorityState('NORMAL');
    setActionMsg('Priority Request REJECTED by Traffic Operator. Normal signal cycle restored.');
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    setActionMsg(isPaused ? 'Signal Priority Resumed.' : 'Signal Priority Paused.');
  };

  const handleManualOverride = async (signalId: number, status: 'GREEN' | 'RED', emergencyMode: boolean) => {
    setActionMsg('');
    try {
      await api.overrideSignal(signalId, status, emergencyMode);
      setPriorityState(emergencyMode ? 'AMBULANCE_PRIORITY_ACTIVE' : 'NORMAL');
      setActionMsg(`Traffic Signal #${signalId} overridden to ${status} (Emergency Mode: ${emergencyMode ? 'ON' : 'OFF'})`);
      
      const s = await api.getTrafficSignals();
      setSignals(s);
      const hist = await api.getSignalHistory();
      setHistory(hist);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Prominent Warning Banner 1 */}
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

        <Badge status="Available" pulse>Simulated Mode</Badge>
      </div>

      {/* Header Card */}
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-purple-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-950 text-purple-400 border border-purple-800 rounded-2xl animate-float">
            <TrafficCone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Traffic Priority Signal Controller
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </h2>
            <p className="text-xs text-slate-400">Software-only geofence trigger • Haversine 300m/500m proximity matrix</p>
          </div>
        </div>

        {/* Direction Switcher & Mode Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-xs font-bold text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400">Approach:</span>
            <select
              value={approachDirection}
              onChange={(e) => setApproachDirection(e.target.value as any)}
              className="bg-transparent text-cyan-400 font-extrabold focus:outline-none cursor-pointer"
            >
              <option value="North" className="bg-slate-900 text-white">North Bound</option>
              <option value="South" className="bg-slate-900 text-white">South Bound</option>
              <option value="East" className="bg-slate-900 text-white">East Bound</option>
              <option value="West" className="bg-slate-900 text-white">West Bound</option>
            </select>
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
        
        {/* Live Map (7 Cols) */}
        <div className="lg:col-span-7 h-[480px]">
          <Card className="h-full p-2 relative">
            <LeafletMap
              hospitals={hospitals}
              trafficSignals={signals}
              ambulancePosition={{ lat: activeAmbulancePos.lat, lng: activeAmbulancePos.lng, vehicle_number: 'AMB-MED-101' }}
            />
          </Card>
        </div>

        {/* Active Signal Control Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Priority Virtual Signal State Card */}
          <Card className="space-y-4 border-l-4 border-l-cyan-400">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">Virtual Signal State</span>
                <h3 className="text-base font-extrabold text-white">Ambulance Entry Priority</h3>
              </div>
              <Badge status={priorityState === 'AMBULANCE_PRIORITY_ACTIVE' ? 'Available' : 'Occupied'} pulse>
                {priorityState}
              </Badge>
            </div>

            {/* Countdown & Direction Telemetry */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Priority Countdown</span>
                <span className="text-2xl font-extrabold text-cyan-400 animate-pulse">{countdown}s</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Direction Corridor</span>
                <span className="text-base font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> {approachDirection}
                </span>
              </div>
            </div>

            {/* Operator Control Actions (Approve, Reject, Pause, Manual Override, End Priority) */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Operator Action Controls</span>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" /> Approve Request
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleReject}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" /> Reject Request
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePause}
                  className="border-slate-800 text-slate-200 hover:bg-slate-800 flex items-center justify-center gap-1 font-bold"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  {isPaused ? 'Resume Priority' : 'Pause Priority'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManualOverride(1, 'GREEN', true)}
                  className="border-purple-800 text-purple-300 hover:bg-purple-950/50 font-bold"
                >
                  Manual Override
                </Button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPriorityState('NORMAL')}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 font-bold"
              >
                End Priority & Reset Signal
              </Button>
            </div>
          </Card>

          {/* List of Signal Controllers */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold text-white uppercase">Traffic Signal Matrix ({signals.length})</h3>
              <span className="text-[10px] font-bold text-cyan-400">Proximity: 300m / 500m</span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {signals.map((sig) => (
                <div key={sig.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-white block">{sig.name}</span>
                    <span className="text-[10px] text-slate-400">Normal Cycle: {sig.normal_cycle}</span>
                  </div>
                  <Badge status={sig.current_status === 'GREEN' ? 'Available' : 'Occupied'} pulse={Boolean(sig.emergency_mode)}>
                    {sig.current_status}
                  </Badge>
                </div>
              ))}
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
                <th className="pb-2">Event Status</th>
                <th className="pb-2">Approach Direction</th>
                <th className="pb-2">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/50">
                  <td className="py-2.5 font-mono text-[11px] text-slate-400">{h.requested_at}</td>
                  <td className="py-2.5 font-bold text-white">{h.signal_name}</td>
                  <td className="py-2.5 text-cyan-400 font-bold">{h.vehicle_number || 'AMB-MED-101'}</td>
                  <td className="py-2.5">
                    <Badge status="Available">{h.status}</Badge>
                  </td>
                  <td className="py-2.5 text-emerald-400 font-bold">{approachDirection} Bound</td>
                  <td className="py-2.5 text-slate-400">{h.notes || 'Auto Geofence Proximity Trigger'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
