import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ToastAlert {
  id: string;
  type: 'emergency' | 'traffic' | 'bed' | 'resource';
  title: string;
  message: string;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  alerts: ToastAlert[];
  removeAlert: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);

  useEffect(() => {
    const metaEnv = (import.meta as any).env || {};
    const socketUrl = metaEnv.VITE_SOCKET_URL || window.location.origin;

    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 5000
    });

    const handleConnect = () => {
      console.log('Realtime socket connected:', s.id);
      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleIncomingEmergency = (data: any) => {
      addToast({
        type: 'emergency',
        title: `🚨 INCOMING EMERGENCY: ${data.triage_level || 'Urgent'}`,
        message: `Ambulance approaching ${data.hospital_name || 'Hospital'}. Patient: ${data.patient_name || 'Patient'}. ETA: ${data.eta || 12} mins.`
      });
    };

    const handleTrafficPriority = (data: any) => {
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

    const handleResourceAlert = (data: any) => {
      addToast({
        type: 'resource',
        title: `⚠️ ${data.title}`,
        message: data.message
      });
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('incoming_emergency_alert', handleIncomingEmergency);
    s.on('signal-status-changed', handleTrafficPriority);
    s.on('bed_reserved', handleBedReserved);
    s.on('resource_alert', handleResourceAlert);

    setSocket(s);

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('incoming_emergency_alert', handleIncomingEmergency);
      s.off('signal-status-changed', handleTrafficPriority);
      s.off('bed_reserved', handleBedReserved);
      s.off('resource_alert', handleResourceAlert);
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

  return (
    <SocketContext.Provider value={{ socket, connected, alerts, removeAlert }}>
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
