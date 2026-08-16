import React from 'react';
import { Truck, Building2, Maximize2, Minimize2, ZoomIn, ZoomOut, Eye, EyeOff, Navigation, Layers } from 'lucide-react';

interface MapControlsProps {
  onCenterAmbulance: () => void;
  onCenterHospital: () => void;
  onFitBounds: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleSignals: () => void;
  onToggleRoute: () => void;
  onToggleFullscreen: () => void;
  showSignals: boolean;
  showRoute: boolean;
  isFullscreen: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onCenterAmbulance,
  onCenterHospital,
  onFitBounds,
  onZoomIn,
  onZoomOut,
  onToggleSignals,
  onToggleRoute,
  onToggleFullscreen,
  showSignals,
  showRoute,
  isFullscreen
}) => {
  return (
    <div className="absolute top-3 right-3 z-30 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl">
      <button
        onClick={onCenterAmbulance}
        title="Center on Ambulance"
        className="p-2 bg-slate-950 hover:bg-slate-800 text-cyan-400 rounded-lg transition-colors border border-slate-800"
      >
        <Truck className="w-4 h-4" />
      </button>

      <button
        onClick={onCenterHospital}
        title="Center on Hospital"
        className="p-2 bg-slate-950 hover:bg-slate-800 text-rose-400 rounded-lg transition-colors border border-slate-800"
      >
        <Building2 className="w-4 h-4" />
      </button>

      <button
        onClick={onFitBounds}
        title="Fit All Markers"
        className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-lg transition-colors border border-slate-800"
      >
        <Layers className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-800 my-0.5" />

      <button
        onClick={onZoomIn}
        title="Zoom In"
        className="p-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg transition-colors border border-slate-800"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        onClick={onZoomOut}
        title="Zoom Out"
        className="p-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg transition-colors border border-slate-800"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-800 my-0.5" />

      <button
        onClick={onToggleSignals}
        title={showSignals ? 'Hide Signals' : 'Show Signals'}
        className={`p-2 rounded-lg transition-colors border ${
          showSignals ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-slate-950 text-slate-500 border-slate-800'
        }`}
      >
        {showSignals ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      <button
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        className="p-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg transition-colors border border-slate-800"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
