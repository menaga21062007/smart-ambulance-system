import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { TrafficSignal, Hospital } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TrafficCone, ShieldAlert, CheckCircle2, XCircle, Clock, Radio } from 'lucide-react';

export const TrafficDashboard: React.FC = () => {
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeAmbulancePos] = useState({ lat: 12.9650, lng: 77.5880 });
  const [actionMsg, setActionMsg] = useState('');

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

  const handleManualOverride = async (signalId: number, status: 'GREEN' | 'RED', emergencyMode: boolean) => {
    setActionMsg('');
    try {
      await api.overrideSignal(signalId, status, emergencyMode);
      setActionMsg(`Traffic Signal #${signalId} overridden to ${status} (Emergency Priority Mode: ${emergencyMode ? 'ON' : 'OFF'})`);
      
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
      
      {/* Banner */}
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-purple-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-950 text-purple-400 border border-purple-800 rounded-2xl">
            <TrafficCone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Traffic Signal Priority Simulation</h2>
            <p className="text-xs text-slate-400">Emergency signal priority management & automated 500-meter proximity triggers.</p>
          </div>
        </div>

        <div className="bg-amber-950/80 text-amber-300 border border-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Demonstration Simulation Mode
        </div>
      </Card>

      {/* Safety Notice */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-xs text-slate-300 flex items-center gap-2">
        <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
        <span><b>Safety Notice:</b> This software prototype simulates emergency traffic signal priority for demonstration purposes. It does not directly control real public traffic signals.</span>
      </div>

      {actionMsg && (
        <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map */}
        <div className="lg:col-span-7 h-[460px]">
          <Card className="h-full p-2">
            <LeafletMap
              hospitals={hospitals}
              trafficSignals={signals}
              ambulancePosition={{ lat: activeAmbulancePos.lat, lng: activeAmbulancePos.lng, vehicle_number: 'AMB-MED-101' }}
            />
          </Card>
        </div>

        {/* Signal Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">Signal Controllers ({signals.length})</h3>
              <span className="text-[10px] font-bold text-cyan-400">Radius: 500m</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              {signals.map((sig) => {
                const isPriorityGreen = sig.emergency_mode || sig.current_status === 'GREEN';

                return (
                  <div
                    key={sig.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-2.5 transition-all ${
                      isPriorityGreen
                        ? 'bg-emerald-950/40 border-emerald-700 shadow-md shadow-emerald-950/50'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{sig.name}</span>
                      <Badge status={sig.current_status === 'GREEN' ? 'Available' : 'Occupied'} pulse={Boolean(isPriorityGreen)}>
                        {sig.current_status} {isPriorityGreen ? '• PRIORITY' : ''}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold"
                        onClick={() => handleManualOverride(sig.id, 'GREEN', true)}
                      >
                        Force Green Priority
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-800 text-slate-300 hover:bg-slate-800"
                        onClick={() => handleManualOverride(sig.id, 'RED', false)}
                      >
                        Reset Red Cycle
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>

      {/* History Table */}
      <Card className="space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" /> Priority Signal Event History Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="pb-2">Time</th>
                <th className="pb-2">Traffic Signal</th>
                <th className="pb-2">Ambulance</th>
                <th className="pb-2">Event Status</th>
                <th className="pb-2">Trigger Source</th>
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
                  <td className="py-2.5 text-slate-400">{h.notes || 'Auto Geofence Proximity'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
