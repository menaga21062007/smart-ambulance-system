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
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Realtime socket connected:', s.id);
      setConnected(true);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    // Realtime Emergency Incoming Alert
    s.on('incoming_emergency_alert', (data: any) => {
      addToast({
        type: 'emergency',
        title: `🚨 INCOMING EMERGENCY: ${data.triage_level || 'Urgent'}`,
        message: `Ambulance approaching ${data.hospital_name || 'Hospital'}. Patient: ${data.patient_name}. ETA: ${data.eta} mins.`
      });
    });

    // Traffic priority alert
    s.on('traffic_priority_triggered', (data: any) => {
      addToast({
        type: 'traffic',
        title: '🚥 TRAFFIC PRIORITY ACTIVATED',
        message: `Emergency Green Priority triggered for ${data.signals?.length || 1} traffic signal(s) along ambulance route.`
      });
    });

    // Bed Reservation Alert
    s.on('bed_reserved', (data: any) => {
      addToast({
        type: 'bed',
        title: '🛏️ BED RESERVED',
        message: `Bed ${data.bed_number} successfully reserved for Patient #${data.patient_id}.`
      });
    });

    // Resource Alert
    s.on('resource_alert', (data: any) => {
      addToast({
        type: 'resource',
        title: `⚠️ ${data.title}`,
        message: data.message
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const addToast = (alert: Omit<ToastAlert, 'id' | 'timestamp'>) => {
    const newToast: ToastAlert = {
      ...alert,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString()
    };
    setAlerts((prev) => [newToast, ...prev].slice(0, 5)); // Keep latest 5
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
