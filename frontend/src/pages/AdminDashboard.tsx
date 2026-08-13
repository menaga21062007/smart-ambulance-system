import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Hospital, Bed, Resource, User, EmergencyRequest, TrafficSignal } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LeafletMap } from '../components/LeafletMap';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Building2,
  Truck,
  BedDouble,
  AlertCircle,
  ShieldCheck,
  Users,
  Activity,
  HeartPulse,
  TrendingUp,
  RefreshCw,
  Clock,
  Plus
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const h = await api.getHospitals();
      setHospitals(h);
      if (h.length > 0) {
        const b = await api.getHospitalBeds(h[0].id);
        setBeds(b);
        const r = await api.getHospitalResources(h[0].id);
        setResources(r);
      }
      const reqs = await api.getEmergencyRequests();
      setRequests(reqs);
      const s = await api.getTrafficSignals();
      setSignals(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const totalBeds = beds.length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const reservedBeds = beds.filter((b) => b.status === 'Reserved').length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const cleaningBeds = beds.filter((b) => b.status === 'Under Cleaning').length;
  const icuBeds = beds.filter((b) => b.bed_type.includes('ICU'));
  const availableIcu = icuBeds.filter((b) => b.status === 'Available').length;
  const ventilatorRes = resources.find((r) => r.name.includes('Ventilator'));

  const occupancyPct = totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0;

  const pieData = [
    { name: 'Available', value: availableBeds, color: '#10B981' },
    { name: 'Reserved', value: reservedBeds, color: '#06B6D4' },
    { name: 'Occupied', value: occupiedBeds, color: '#F43F5E' },
    { name: 'Cleaning', value: cleaningBeds, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome & Action Header Bar */}
      <Card className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400">
              CareLink Command Center
            </span>
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> City General Hospital
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Emergency Operations Command Room</h2>
          <p className="text-xs font-medium text-slate-400">Live telemetry integration of ambulances, triage admissions, hospital beds, and traffic priority controls.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={loadAll} className="border-slate-800 text-slate-200 hover:bg-slate-800">
            Refresh Telemetry
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow-lg shadow-cyan-950">
            Register Intake
          </Button>
        </div>
      </Card>

      {/* 4 Large Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Bed Occupancy */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Bed Occupancy Rate</span>
            <BedDouble className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400">{availableBeds} <span className="text-xs text-slate-400 font-bold">/ {totalBeds} Free</span></div>
            <div className="text-xs font-bold text-emerald-300 mt-1">{occupancyPct}% Occupancy Rate</div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${100 - occupancyPct}%` }}></div>
          </div>
        </Card>

        {/* Card 2: Active Ambulances */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Ambulances</span>
            <Truck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-cyan-400">3 <span className="text-xs text-slate-400 font-bold">En-Route</span></div>
            <div className="text-xs font-bold text-cyan-300 mt-1">Avg. ETA: 12 Mins</div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>GPS Tracking Active</span>
          </div>
        </Card>

        {/* Card 3: Critical Triage Queue */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Critical Patients</span>
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-rose-400">{requests.filter(r => r.triage_level?.includes('Red')).length}</div>
            <div className="text-xs font-bold text-rose-300 mt-1">Immediate ER Care Needed</div>
          </div>
          <Badge triage="Critical/Red" pulse>Immediate</Badge>
        </Card>

        {/* Card 4: ICU & Ventilators */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">ICU & Ventilators</span>
            <HeartPulse className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-purple-400">{availableIcu} <span className="text-xs text-slate-400 font-bold">ICU Beds Free</span></div>
            <div className="text-xs font-bold text-purple-300 mt-1">
              {ventilatorRes ? ventilatorRes.available_quantity : 4} Ventilators Available
            </div>
          </div>
          <Badge status="Available">Sufficient Stock</Badge>
        </Card>

      </div>

      {/* Middle Section: Live Map & Incoming Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Map (7 Cols) */}
        <div className="lg:col-span-7 h-[440px]">
          <Card className="h-full p-2">
            <LeafletMap
              hospitals={hospitals}
              trafficSignals={signals}
              ambulancePosition={{ lat: 12.9550, lng: 77.5800, vehicle_number: 'AMB-MED-101' }}
            />
          </Card>
        </div>

        {/* Real-time Emergency Queue & AI Bed Allocation (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Live Emergency Telemetry Feed
              </h3>
              <Badge status="Available">{requests.length} Incoming</Badge>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[310px]">
              {requests.map((r) => (
                <div key={r.id} className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">{r.patient_name}</span>
                    <Badge triage={r.triage_level} pulse={r.triage_level?.includes('Red')}>{r.triage_level}</Badge>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>ETA: <b className="text-rose-400">{r.estimated_arrival_time} Mins</b></span>
                    <span>Ambulance: <b className="text-white">{r.vehicle_number || 'AMB-101'}</b></span>
                  </div>
                  <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-xl border border-slate-800 line-clamp-1">
                    <b>Symptoms:</b> {r.symptoms}
                  </p>
                </div>
              ))}
            </div>

            <Button variant="primary" size="sm" className="w-full font-bold bg-cyan-600 hover:bg-cyan-500 text-white">
              View ER Bed Recommendation Engine
            </Button>
          </Card>
        </div>

      </div>

      {/* Bottom Section: Bed Distribution Donut Chart & Critical Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bed Status Distribution Donut Chart */}
        <Card className="space-y-4">
          <h3 className="text-sm font-extrabold text-white">Bed Status Distribution</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Resource Progress Meters */}
        <Card className="space-y-4">
          <h3 className="text-sm font-extrabold text-white">Critical Resource Stock Levels</h3>
          <div className="space-y-3">
            {resources.map((res) => {
              const pct = Math.round((res.available_quantity / res.total_quantity) * 100);
              const isLow = res.available_quantity <= res.minimum_threshold;
              return (
                <div key={res.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>{res.name}</span>
                    <span className={isLow ? 'text-rose-400 font-extrabold' : 'text-slate-300'}>
                      {res.available_quantity} / {res.total_quantity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all ${isLow ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

    </div>
  );
};
