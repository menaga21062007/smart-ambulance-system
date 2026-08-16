import React from 'react';
import { AlertTriangle, RefreshCw, Radio, Navigation, WifiOff } from 'lucide-react';
import { Button } from '../ui/Button';

interface MapErrorStateProps {
  type: 'GPS_DENIED' | 'GPS_UNAVAILABLE' | 'NETWORK_OFFLINE' | 'TILE_FAILURE' | 'INVALID_COORDS';
  message?: string;
  onRetry?: () => void;
  onUseFallback?: () => void;
}

export const MapErrorState: React.FC<MapErrorStateProps> = ({
  type,
  message,
  onRetry,
  onUseFallback
}) => {
  const getDetails = () => {
    switch (type) {
      case 'GPS_DENIED':
        return {
          title: 'GPS Location Permission Denied',
          desc: message || 'Browser location permission was denied. Enable GPS permissions in browser settings or use fallback telemetry.',
          icon: Radio,
          color: 'text-amber-400 bg-amber-950/80 border-amber-800'
        };
      case 'GPS_UNAVAILABLE':
        return {
          title: 'GPS Signal Temporarily Unavailable',
          desc: message || 'Satellite GPS signal lost. Showing last known coordinates until connection is restored.',
          icon: Navigation,
          color: 'text-rose-400 bg-rose-950/80 border-rose-800'
        };
      case 'NETWORK_OFFLINE':
        return {
          title: 'Real-Time Network Connection Offline',
          desc: message || 'Live WebSocket stream disconnected. Using standalone demonstration fallback dataset.',
          icon: WifiOff,
          color: 'text-amber-400 bg-amber-950/80 border-amber-800'
        };
      case 'TILE_FAILURE':
        return {
          title: 'Map Tiles Loading Failure',
          desc: message || 'OpenStreetMap tile server temporarily unreachable. Coordinates & vector markers active.',
          icon: AlertTriangle,
          color: 'text-purple-400 bg-purple-950/80 border-purple-800'
        };
      default:
        return {
          title: 'Invalid Coordinate Telemetry',
          desc: message || 'Latitude/Longitude values out of valid bounds. Re-centering on default hospital coordinates.',
          icon: AlertTriangle,
          color: 'text-rose-400 bg-rose-950/80 border-rose-800'
        };
    }
  };

  const info = getDetails();
  const Icon = info.icon;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl border border-slate-800 animate-fade-in">
      <div className={`p-4 rounded-2xl border ${info.color} animate-pulse`}>
        <Icon className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h4 className="text-base font-extrabold text-white">{info.title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{info.desc}</p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry} className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </Button>
        )}

        {onUseFallback && (
          <Button variant="outline" size="sm" onClick={onUseFallback} className="border-slate-800 text-slate-300 hover:bg-slate-800 font-bold">
            Use Last Known Location
          </Button>
        )}
      </div>
    </div>
  );
};
