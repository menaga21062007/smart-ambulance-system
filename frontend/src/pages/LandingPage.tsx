import React from 'react';
import { CareLinkLogo } from '../components/CareLinkLogo';
import { Button } from '../components/ui/Button';
import {
  Activity,
  Truck,
  BedDouble,
  Package,
  TrafficCone,
  Bell,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Clock,
  MapPin,
  HeartPulse,
  ChevronRight,
  PhoneCall,
  AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const features = [
    {
      title: 'Real-Time Ambulance GPS',
      description: 'Live GPS stream via Geolocation API with route waypoints, speed telemetry, and instant ETA calculations transmitted directly to hospital ER.',
      icon: Truck,
      color: 'text-cyan-400 bg-cyan-950/80 border border-cyan-800'
    },
    {
      title: 'Emergency Bed Allocation',
      description: 'AI decision-support recommendation engine filtering ICU, Isolation, and Emergency beds by patient triage score & equipment needs.',
      icon: BedDouble,
      color: 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
    },
    {
      title: 'Hospital Resource Monitoring',
      description: 'Track ICU beds, ventilators, medical oxygen cylinders, blood units, and wheelchairs with automated stock threshold meters.',
      icon: Package,
      color: 'text-amber-400 bg-amber-950/80 border border-amber-800'
    },
    {
      title: 'Automatic Signal-Priority Simulation',
      description: 'Software-only geofenced 300m/250m proximity detection granting simulated green-light priority to approaching emergency ambulances.',
      icon: TrafficCone,
      color: 'text-purple-400 bg-purple-950/80 border border-purple-800'
    },
    {
      title: 'Live Emergency Notifications',
      description: 'Sub-second real-time alert broadcasts for incoming critical patients, bed reservations, and resource shortage warnings.',
      icon: Bell,
      color: 'text-rose-400 bg-rose-950/80 border border-rose-800'
    },
    {
      title: 'Patient Admission Workflow',
      description: 'Streamlined state machine tracking bed status from Available → Reserved → Occupied → Under Cleaning → Available.',
      icon: CheckCircle2,
      color: 'text-teal-400 bg-teal-950/80 border border-teal-800'
    }
  ];

  const stats = [
    { value: '48', label: 'Available Beds', color: 'text-emerald-400' },
    { value: '3', label: 'Active Ambulances', color: 'text-cyan-400' },
    { value: '12', label: 'Emergency Patients', color: 'text-amber-400' },
    { value: '4', label: 'Available ICU Beds', color: 'text-teal-400' },
    { value: '99.8%', label: 'Signal Priority Rate', color: 'text-purple-400' }
  ];

  const workflowSteps = [
    { step: '01', title: 'Ambulance Registered', desc: 'Paramedics register patient vitals & enable live GPS location sharing.' },
    { step: '02', title: 'GPS Shared', desc: 'Real-time telemetry stream transmits speed, accuracy, and heading.' },
    { step: '03', title: 'Hospital Notified', desc: 'Destination ER receives incoming notification & patient triage data.' },
    { step: '04', title: 'Bed Reserved', desc: 'AI algorithm recommends optimal bed; staff confirms reservation.' },
    { step: '05', title: 'Simulated Signal Priority', desc: 'Software decision engine auto-activates simulated green priority corridor.' },
    { step: '06', title: 'Patient Admitted', desc: 'Immediate ER admission; bed status transitions to Occupied.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <CareLinkLogo size="md" light />

          <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-300">
            <button onClick={() => onNavigate('landing')} className="text-cyan-400 font-extrabold">Home</button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-cyan-400 transition-colors">Command Dashboard</button>
            <button onClick={() => onNavigate('ambulance')} className="hover:text-cyan-400 transition-colors">Ambulance GPS</button>
            <button onClick={() => onNavigate('hospital')} className="hover:text-cyan-400 transition-colors">Emergency ER</button>
            <button onClick={() => onNavigate('traffic')} className="hover:text-cyan-400 transition-colors">Traffic Control</button>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => onNavigate('login')} className="border-slate-800 text-slate-200 hover:bg-slate-800">
              Staff Login
            </Button>
            <Button variant="primary" size="sm" onClick={() => onNavigate('dashboard')} className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow-lg shadow-cyan-950">
              Open ER Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Mandatory Software Simulation Disclaimer Banner */}
      <div className="bg-amber-950/90 border-b border-amber-800/80 text-amber-200 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Traffic Signal Simulation — Demonstration Mode</strong>: This software prototype simulates emergency traffic priority. It does not directly control real public traffic signals.
        </span>
      </div>

      {/* Hero Section with Healthcare Image & Dark Overlay */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 lg:py-24">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80')`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>CareLink Medical Center • Connected Care. Faster Response. Better Outcomes.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              CareLink Smart Ambulance, Emergency Bed & Priority Signal System
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
              Coordinate ambulance GPS, emergency beds, hospital resources, and simulated traffic priority through one connected platform.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={() => onNavigate('dashboard')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow-xl shadow-cyan-950"
              >
                Open ER Dashboard
              </Button>

              <Button
                variant="outline"
                size="lg"
                icon={<Truck className="w-5 h-5 text-cyan-400" />}
                onClick={() => onNavigate('ambulance')}
                className="border-slate-800 text-white hover:bg-slate-900 font-bold"
              >
                Track Ambulance
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('hospital')}
                className="border-slate-800 text-slate-300 hover:bg-slate-900 font-bold"
              >
                Explore System
              </Button>
            </div>

            {/* Quick Telemetry Strip */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Response Time SLA</span>
                <span className="font-extrabold text-emerald-400 text-sm sm:text-base">Under 8 Mins</span>
              </div>
              <div>
                <span className="text-slate-400 block">Signal Auto-Priority</span>
                <span className="font-extrabold text-cyan-400 text-sm sm:text-base">300m / 250m Radius</span>
              </div>
              <div>
                <span className="text-slate-400 block">AI Bed Allocation</span>
                <span className="font-extrabold text-white text-sm sm:text-base">Instant Match</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Statistics Counter Bar */}
      <section className="bg-slate-900/90 border-y border-slate-800 py-8 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className={`text-3xl sm:text-4xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Capabilities Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-extrabold text-cyan-400 tracking-widest">Platform Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">CareLink Emergency Ecosystem</h2>
          <p className="text-xs sm:text-sm text-slate-400">CareLink Medical Center integrates all 7 key user roles into one synchronized digital emergency workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-cyan-500/50 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency Workflow Stepper Section */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold text-cyan-400 tracking-widest">End-To-End Lifecycle</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Seamless Emergency Patient Journey</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {workflowSteps.map((ws, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative shadow-lg">
                <span className="text-2xl font-extrabold text-cyan-400 opacity-40 block mb-2">{ws.step}</span>
                <h4 className="font-extrabold text-xs text-white mb-1">{ws.title}</h4>
                <p className="text-[11px] text-slate-400">{ws.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust, Security & Mandatory Disclaimer Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>JWT Authentication & Role-Based Access Control (RBAC)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Built for Speed, Reliability, and Patient Care</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              CareLink Medical Center enforces strict role-based access control, Socket.IO real-time telemetry, automated bed recommendation algorithms, and full audit logging for medical professionals.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('dashboard')}
            className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold shadow-xl shadow-cyan-950"
          >
            Access System Command Center
          </Button>
        </div>
      </section>

      {/* Professional Hospital Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <CareLinkLogo size="md" light />
            <div className="flex flex-wrap gap-6 text-slate-300 font-semibold">
              <button onClick={() => onNavigate('landing')} className="hover:text-white">Home</button>
              <button onClick={() => onNavigate('dashboard')} className="hover:text-white">Emergency Dashboard</button>
              <button onClick={() => onNavigate('ambulance')} className="hover:text-white">Ambulance GPS</button>
              <button onClick={() => onNavigate('hospital')} className="hover:text-white">Bed Reservation</button>
              <button onClick={() => onNavigate('traffic')} className="hover:text-white">Traffic Simulation</button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 CareLink Medical Center. Connected Care. Faster Response. Better Outcomes.
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 max-w-xl text-center">
              ⚠️ <b>Educational Prototype Disclaimer</b>: This system is a software prototype for educational and demonstration purposes. It does not replace qualified medical professionals and does not directly control officially operated public traffic signals.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
