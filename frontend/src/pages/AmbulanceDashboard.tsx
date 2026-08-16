import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MapView } from '../components/map/MapView';
import { Hospital, TrafficSignal, TriageLevel } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Truck, Navigation, AlertTriangle, CheckCircle2, ShieldCheck, MapPin, Gauge, Activity, Radio, Power } from 'lucide-react';

export const AmbulanceDashboard: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [patientName, setPatientName] = useState('John Doe');
  const [age, setAge] = useState('45');
  const [gender, setGender] = useState('Male');
  const [symptoms, setSymptoms] = useState('Severe chest pain, shortness of breath, acute diaphoresis');
  const [triageLevel, setTriageLevel] = useState<TriageLevel>('Critical/Red');

  // GPS Telemetry State
  const [isGpsActive, setIsGpsActive] = useState(true);
  const [posIndex, setPosIndex] = useState(0);
  const [actionMsg, setActionMsg] = useState('');
  const [priorityTriggered, setPriorityTriggered] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(12);

  // Simulated GPS Waypoints route
  const waypoints = [
    { lat: 12.9650, lng: 77.5880 },
    { lat: 12.9630, lng: 77.5850 },
    { lat: 12.9600, lng: 77.5820 },
    { lat: 12.9580, lng: 77.5800 },
    { lat: 12.9550, lng: 77.5800 }, // Near City General Hospital
  ];

  const currentPos = waypoints[posIndex];

  useEffect(() => {
    async function loadData() {
      try {
        const h = await api.getHospitals();
        setHospitals(h);
        const s = await api.getTrafficSignals();
        setSignals(s);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // Browser Geolocation API & Waypoint Fallback
  useEffect(() => {
    let interval: any;
    let watchId: number;

    if (isGpsActive) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setGpsAccuracy(Math.round(pos.coords.accuracy));
            api.updateAmbulanceLocation(1, pos.coords.latitude, pos.coords.longitude).then((res: any) => {
              if (res && res.priorityTriggered) {
                setPriorityTriggered(true);
                setActionMsg('AUTOMATED GEOFENCE TRIGGER: "Ambulance Entry Priority" signal auto-activated!');
              }
            }).catch(console.error);
          },
          (err) => {
            console.warn('Browser GPS watch failed, falling back to route waypoint simulation:', err.message);
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      }

      // Waypoint loop for demonstration animation
      interval = setInterval(async () => {
        setPosIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % waypoints.length;
          const nextPos = waypoints[nextIndex];

          api.updateAmbulanceLocation(1, nextPos.lat, nextPos.lng).then((res: any) => {
            if (res && res.priorityTriggered) {
              setPriorityTriggered(true);
              setActionMsg('AUTOMATED GEOFENCE TRIGGER: "Ambulance Entry Priority" signal auto-activated within 300m!');
            }
          }).catch(console.error);

          return nextIndex;
        });
      }, 3500);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (watchId && 'geolocation' in navigator) navigator.geolocation.clearWatch(watchId);
    };
  }, [isGpsActive]);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg('');
    try {
      await api.createEmergencyRequest({
        ambulance_id: 1,
        hospital_id: 1,
        patient_name: patientName,
        age: parseInt(age, 10),
        gender,
        symptoms,
        triage_level: triageLevel,
        estimated_arrival_time: 12
      });
      setActionMsg(`Emergency Intake Registered for ${patientName}! CareLink ER & Traffic Controllers Notified.`);
      setIsGpsActive(true);
    } catch (err: any) {
      setActionMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Telemetry Header */}
      <Card className="bg-slate-900/90 border-slate-800 border-l-4 border-l-cyan-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-2xl animate-float">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Ambulance Telemetry & Patient Registration
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            </h2>
            <p className="text-xs text-slate-400">AMB-MED-101 • Advanced Life Support Vehicle • Geolocation API Live</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge status={isGpsActive ? 'Available' : 'Occupied'} pulse={isGpsActive}>
            {isGpsActive ? 'GPS STREAMING LIVE' : 'GPS PAUSED'}
          </Badge>

          <Button
            variant={isGpsActive ? 'danger' : 'primary'}
            size="sm"
            onClick={() => setIsGpsActive(!isGpsActive)}
            className={isGpsActive ? 'bg-rose-600 font-extrabold' : 'bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow-lg shadow-cyan-950'}
          >
            {isGpsActive ? 'Pause GPS Stream' : 'Start Live GPS Navigation'}
          </Button>
        </div>
      </Card>

      {actionMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border animate-slide-up ${
          priorityTriggered
            ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700 animate-cyan-pulse'
            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Reusable Leaflet Map (7 Cols) */}
        <div className="lg:col-span-7">
          <MapView
            hospitals={hospitals}
            trafficSignals={signals}
            ambulancePosition={{ lat: currentPos.lat, lng: currentPos.lng, vehicle_number: 'AMB-MED-101', accuracy: gpsAccuracy, speed: 48 }}
            isGpsActive={isGpsActive}
            onGpsToggle={setIsGpsActive}
          />
        </div>

        {/* Patient Intake Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> Patient Emergency Intake Form
              </h3>
              <p className="text-[11px] text-slate-400">Broadcast patient vitals to target hospital ER decision engine.</p>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-200 block mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-200 block mb-1">Triage Urgency Level</label>
                <select
                  value={triageLevel}
                  onChange={(e) => setTriageLevel(e.target.value as TriageLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="Critical/Red">Critical / Red (Immediate ER)</option>
                  <option value="Urgent/Yellow">Urgent / Yellow (Prompt Care)</option>
                  <option value="Moderate/Green">Moderate / Green (Standard Care)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-200 block mb-1">Symptoms & Clinical Notes</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
                ></textarea>
              </div>

              <Button variant="primary" size="md" className="w-full font-extrabold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950 transition-all duration-300 hover:scale-[1.02]">
                Register & Stream Vitals to ER
              </Button>
            </form>
          </Card>
        </div>

      </div>

    </div>
  );
};
