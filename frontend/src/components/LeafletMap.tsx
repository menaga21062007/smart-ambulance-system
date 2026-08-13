import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hospital, TrafficSignal } from '../types';

interface MapProps {
  hospitals: Hospital[];
  trafficSignals: TrafficSignal[];
  ambulancePosition?: { lat: number; lng: number; vehicle_number?: string };
  routeWaypoints?: Array<[number, number]>;
  center?: [number, number];
  zoom?: number;
}

export const LeafletMap: React.FC<MapProps> = ({
  hospitals,
  trafficSignals,
  ambulancePosition,
  routeWaypoints = [],
  center = [12.9650, 77.5880],
  zoom = 13
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      leafletInstance.current = map;
    }

    const map = leafletInstance.current;
    const markers = markersRef.current;
    if (!markers) return;

    markers.clearLayers();

    // 1. Add Hospital Markers
    hospitals.forEach((h) => {
      const hospitalIcon = L.divIcon({
        className: 'custom-hospital-icon',
        html: `
          <div style="background:#0284c7; border:2px solid white; color:white; font-weight:bold; font-size:12px; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(2,132,199,0.8);">
            🏥
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const m = L.marker([h.latitude, h.longitude], { icon: hospitalIcon });
      m.bindPopup(`
        <div style="font-family:sans-serif; padding:4px;">
          <b style="font-size:14px; color:#0f172a;">${h.name}</b><br/>
          <span style="font-size:12px; color:#475569;">${h.address}</span><br/>
          <span style="font-size:11px; color:#0284c7; font-weight:bold;">Emergency Capacity: ${h.emergency_capacity} Beds</span>
        </div>
      `);
      markers.addLayer(m);
    });

    // 2. Add Traffic Signal Markers
    trafficSignals.forEach((s) => {
      const isEmergencyGreen = s.emergency_mode || s.current_status === 'GREEN';

      const signalIcon = L.divIcon({
        className: 'custom-signal-icon',
        html: `
          <div style="background:${isEmergencyGreen ? '#10b981' : '#ef4444'}; border:2px solid white; color:white; font-weight:bold; font-size:10px; padding:4px 6px; border-radius:12px; display:flex; align-items:center; gap:4px; box-shadow:${isEmergencyGreen ? '0 0 16px #10b981' : '0 0 6px rgba(0,0,0,0.4)'}">
            <span>🚦</span>
            <span>${isEmergencyGreen ? 'PRIORITY GREEN' : 'RED'}</span>
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });

      const m = L.marker([s.latitude, s.longitude], { icon: signalIcon });
      m.bindPopup(`
        <div style="font-family:sans-serif; padding:4px;">
          <b style="font-size:13px; color:#0f172a;">${s.name}</b><br/>
          <span style="font-size:11px; color:${isEmergencyGreen ? '#10b981' : '#ef4444'}; font-weight:bold;">Status: ${s.current_status}</span>
        </div>
      `);
      markers.addLayer(m);
    });

    // 3. Add Route Polyline
    if (routeWaypoints && routeWaypoints.length > 1) {
      const routeLine = L.polyline(routeWaypoints, {
        color: '#f43f5e',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10'
      });
      markers.addLayer(routeLine);
    }

    // 4. Add Ambulance Location Marker
    if (ambulancePosition) {
      const ambIcon = L.divIcon({
        className: 'custom-amb-icon',
        html: `
          <div style="background:#f43f5e; border:3px solid white; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px #f43f5e; animation: pulse 1.5s infinite;">
            🚑
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const ambMarker = L.marker([ambulancePosition.lat, ambulancePosition.lng], { icon: ambIcon });
      ambMarker.bindPopup(`
        <div style="font-family:sans-serif; padding:4px;">
          <b style="font-size:14px; color:#f43f5e;">Ambulance ${ambulancePosition.vehicle_number || 'AMB-101'}</b><br/>
          <span style="font-size:11px; color:#475569;">GPS Position: ${ambulancePosition.lat.toFixed(4)}, ${ambulancePosition.lng.toFixed(4)}</span>
        </div>
      `);
      markers.addLayer(ambMarker);
    }
  }, [hospitals, trafficSignals, ambulancePosition, routeWaypoints]);

  return (
    <div className="w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative">
      <div ref={mapRef} className="w-full h-full z-0"></div>
    </div>
  );
};
