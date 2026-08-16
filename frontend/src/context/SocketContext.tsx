import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ToastAlert {
  id: string;
  type: 'emergency' | 'traffic' | 'bed' | 'resource';
  title: string;
  message: string;
  timestamp: string;
}

type ConnectionState = 'Connecting' | 'Connected' | 'Reconnecting' | 'Backend unavailable' | 'Demonstration mode';

interface SocketContextType {
  socket: Socket | null;
  connectionState: ConnectionState;
  connected: boolean;
  alerts: ToastAlert[];
  removeAlert: (id: string) => void;
  retryHealthCheck: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('Connecting');
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);

  const metaEnv = (import.meta as any).env || {};
  const isDev = Boolean(metaEnv.DEV);
  const apiUrl = metaEnv.VITE_API_URL || '';
  const socketUrl = metaEnv.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  const checkBackendHealth = async () => {
    setConnectionState('Connecting');
    try {
      const endpoint = apiUrl ? `${apiUrl}/api/health` : '/api/health';
      if (isDev) {
        console.log(`[API] Checking backend health at: ${endpoint}`);
      }

      const res = await fetch(endpoint, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          if (isDev) {
            console.log(`[API] Health check status: OK`, data);
          }
          setConnectionState('Connected');
          return true;
        }
      }
      throw new Error('Health check returned non-ok status');
    } catch (err: any) {
      if (isDev) {
        console.warn(`[API] Health check failed: ${err.message}. Entering Demonstration mode.`);
      }
      setConnectionState('Backend unavailable');
      return false;
    }
  };

  useEffect(() => {
    checkBackendHealth();

    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    const handleConnect = () => {
      if (isDev) {
        console.log(`[Socket] Connected: ${s.id}`);
      }
      setConnectionState('Connected');
    };

    const handleDisconnect = () => {
      if (isDev) {
        console.log(`[Socket] Disconnected`);
      }
      setConnectionState('Reconnecting');
    };

    const handleBackendStatus = (data: any) => {
      if (data && data.status === 'connected') {
        setConnectionState('Connected');
      }
    };

    const handleIncomingEmergency = (data: any) => {
      addToast({
        type: 'emergency',
        title: `🚨 INCOMING EMERGENCY: ${data.triage_level || 'Urgent'}`,
        message: `Ambulance approaching ${data.hospital_name || 'Hospital'}. Patient: ${data.patient_name || 'Patient'}. ETA: ${data.eta || 12} mins.`
      });
    };

    const handleTrafficPriority = (data: any) => {
      if (isDev) {
        console.log(`[Signal] Automatic priority activated:`, data);
      }
      addToast({
        type: 'traffic',
        title: '🚥 AUTOMATED TRAFFIC PRIORITY ACTIVATED',
        message: `Emergency Entry Priority auto-activated for ${data.signalName || 'MG Road Junction'} (${data.direction || 'North'} Bound).`
      });
    };

    const handleBedReserved = (data: any) => {
      addToast({
        type: 'bed',
        title: '🛏️ BED RESERVED',
        message: `Bed ${data.bed_number || 'ER-101'} successfully reserved for Patient #${data.patient_id || 101}.`
      });
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('backend-status-changed', handleBackendStatus);
    s.on('incoming_emergency_alert', handleIncomingEmergency);
    s.on('signal-status-changed', handleTrafficPriority);
    s.on('bed_reserved', handleBedReserved);

    setSocket(s);

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('backend-status-changed', handleBackendStatus);
      s.off('incoming_emergency_alert', handleIncomingEmergency);
      s.off('signal-status-changed', handleTrafficPriority);
      s.off('bed_reserved', handleBedReserved);
      s.disconnect();
    };
  }, []);

  const addToast = (alert: Omit<ToastAlert, 'id' | 'timestamp'>) => {
    const newToast: ToastAlert = {
      ...alert,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString()
    };
    setAlerts((prev) => [newToast, ...prev].slice(0, 5));
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const retryHealthCheck = async () => {
    await checkBackendHealth();
  };

  const isConnected = connectionState === 'Connected';

  return (
    <SocketContext.Provider value={{ socket, connectionState, connected: isConnected, alerts, removeAlert, retryHealthCheck }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
