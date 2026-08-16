import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital, TrafficSignal } from '../../types';
import { MapControls } from './MapControls';
import { GPSStatusPanel } from './GPSStatusPanel';
import { SignalPriorityOverlay } from './SignalPriorityOverlay';
import { MapErrorState } from './MapErrorState';

// Custom Marker Icons
const ambulanceIcon = L.divIcon({
  className: 'custom-ambulance-marker',
  html: `
    <div class="relative flex items-center justify-center w-10 h-10 bg-cyan-600 border-2 border-white rounded-full shadow-xl shadow-cyan-950 text-white animate-pulse">
      <span class="absolute -top-1 -right-1 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
      </span>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const hospitalIcon = L.divIcon({
  className: 'custom-hospital-marker',
  html: `
    <div class="flex items-center justify-center w-9 h-9 bg-rose-600 border-2 border-white rounded-2xl shadow-lg text-white">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

const getSignalIcon = (status: string, priority: boolean) => L.divIcon({
  className: 'custom-signal-marker',
  html: `
    <div class="flex items-center justify-center w-8 h-8 ${
      priority ? 'bg-emerald-500 border-2 border-emerald-300 animate-pulse shadow-lg shadow-emerald-950' : status === 'GREEN' ? 'bg-emerald-600' : 'bg-rose-600'
    } border-2 border-white rounded-xl text-white font-extrabold text-[10px]">
      ${priority ? 'PRIO' : status}
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

interface MapViewProps {
  hospitals?: Hospital[];
  trafficSignals?: TrafficSignal[];
  ambulancePosition?: { lat: number; lng: number; vehicle_number?: string; speed?: number; heading?: number; accuracy?: number };
  activePrioritySignal?: { name: string; countdown: number; direction: string } | null;
  onGpsToggle?: (enabled: boolean) => void;
  isGpsActive?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  hospitals = [],
  trafficSignals = [],
  ambulancePosition = { lat: 12.9650, lng: 77.5880, vehicle_number: 'AMB-MED-101', speed: 45, accuracy: 12 },
  activePrioritySignal,
  onGpsToggle,
  isGpsActive = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  const [showSignals, setShowSignals] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tileError, setTileError] = useState(false);

  // Validate coordinates
  const isValidCoords = (lat: number, lng: number) =>
    typeof lat === 'number' && typeof lng === 'number' && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = isValidCoords(ambulancePosition.lat, ambulancePosition.lng) ? ambulancePosition.lat : 12.9650;
    const initialLng = isValidCoords(ambulancePosition.lat, ambulancePosition.lng) ? ambulancePosition.lng : 77.5880;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    tiles.on('tileerror', () => {
      setTileError(true);
    });

    tiles.addTo(map);

    mapInstanceRef.current = map;

    // Handle container resize
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Ambulance Marker
    if (ambulancePosition && isValidCoords(ambulancePosition.lat, ambulancePosition.lng)) {
      const ambMarker = L.marker([ambulancePosition.lat, ambulancePosition.lng], { icon: ambulanceIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-1 space-y-1">
            <h4 class="font-extrabold text-cyan-400 text-xs">${ambulancePosition.vehicle_number || 'AMB-MED-101'}</h4>
            <p class="text-[11px] text-slate-300">Live GPS Telemetry Stream</p>
            <div class="text-[10px] text-slate-400">Lat: ${ambulancePosition.lat.toFixed(4)}, Lng: ${ambulancePosition.lng.toFixed(4)}</div>
            <div class="text-[10px] text-emerald-400 font-bold">Accuracy: ±${ambulancePosition.accuracy || 12}m • Speed: ${ambulancePosition.speed || 45} km/h</div>
          </div>
        `);
      markersRef.current['ambulance'] = ambMarker;
    }

    // Hospital Markers
    hospitals.forEach((h) => {
      if (isValidCoords(h.latitude, h.longitude)) {
        const hMarker = L.marker([h.latitude, h.longitude], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-1 space-y-1">
              <h4 class="font-extrabold text-rose-400 text-xs">${h.name}</h4>
              <p class="text-[11px] text-slate-300">${h.address}</p>
              <div class="text-[10px] text-emerald-400 font-bold">Emergency Capacity: ${h.emergency_capacity || 50} beds</div>
            </div>
          `);
        markersRef.current[`hospital_${h.id}`] = hMarker;
      }
    });

    // Traffic Signal Markers
    if (showSignals) {
      trafficSignals.forEach((s) => {
        if (isValidCoords(s.latitude, s.longitude)) {
          const isPrio = Boolean(s.emergency_mode || s.current_status === 'GREEN');
          const sMarker = L.marker([s.latitude, s.longitude], { icon: getSignalIcon(s.current_status, isPrio) })
            .addTo(map)
            .bindPopup(`
              <div class="p-1 space-y-1">
                <h4 class="font-extrabold text-purple-400 text-xs">${s.name}</h4>
                <p class="text-[11px] text-slate-300">Status: <b class="${isPrio ? 'text-emerald-400' : 'text-rose-400'}">${s.current_status}</b></p>
                <div class="text-[10px] text-slate-400">Software-only Simulation Signal</div>
              </div>
            `);
          markersRef.current[`signal_${s.id}`] = sMarker;
        }
      });
    }

    // Draw Route Polyline
    if (showRoute && ambulancePosition && isValidCoords(ambulancePosition.lat, ambulancePosition.lng) && hospitals.length > 0) {
      const routePoints: [number, number][] = [
        [ambulancePosition.lat, ambulancePosition.lng],
        [12.9630, 77.5850],
        [12.9600, 77.5820],
        [12.9580, 77.5800],
        [hospitals[0].latitude, hospitals[0].longitude]
      ];

      polylineRef.current = L.polyline(routePoints, {
        color: '#06B6D4',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);
    }
  }, [hospitals, trafficSignals, ambulancePosition, showSignals, showRoute]);

  // Controls Handlers
  const handleCenterAmbulance = () => {
    if (mapInstanceRef.current && ambulancePosition && isValidCoords(ambulancePosition.lat, ambulancePosition.lng)) {
      mapInstanceRef.current.setView([ambulancePosition.lat, ambulancePosition.lng], 15);
    }
  };

  const handleCenterHospital = () => {
    if (mapInstanceRef.current && hospitals.length > 0) {
      mapInstanceRef.current.setView([hospitals[0].latitude, hospitals[0].longitude], 15);
    }
  };

  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    const group = L.featureGroup(Object.values(markersRef.current));
    if (group.getBounds().isValid()) {
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  };

  return (
    <div className={`map-container rounded-2xl bg-slate-950 border border-slate-800 transition-all ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen min-h-screen' : ''
    }`}>
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Controls */}
      <MapControls
        onCenterAmbulance={handleCenterAmbulance}
        onCenterHospital={handleCenterHospital}
        onFitBounds={handleFitBounds}
        onZoomIn={() => mapInstanceRef.current?.zoomIn()}
        onZoomOut={() => mapInstanceRef.current?.zoomOut()}
        onToggleSignals={() => setShowSignals(!showSignals)}
        onToggleRoute={() => setShowRoute(!showRoute)}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        showSignals={showSignals}
        showRoute={showRoute}
        isFullscreen={isFullscreen}
      />

      {/* GPS Status Telemetry Bar */}
      <GPSStatusPanel
        isGpsActive={isGpsActive}
        accuracy={ambulancePosition.accuracy || 12}
        speed={ambulancePosition.speed || 45}
        vehicleNumber={ambulancePosition.vehicle_number || 'AMB-MED-101'}
        onToggleGps={() => onGpsToggle?.(!isGpsActive)}
      />

      {/* Active Priority Overlay */}
      {activePrioritySignal && (
        <SignalPriorityOverlay
          signalName={activePrioritySignal.name}
          countdown={activePrioritySignal.countdown}
          direction={activePrioritySignal.direction}
        />
      )}

      {/* Tile Loading Error Overlay */}
      {tileError && (
        <MapErrorState
          type="TILE_FAILURE"
          onRetry={() => setTileError(false)}
          onUseFallback={handleCenterAmbulance}
        />
      )}
    </div>
  );
};
