import { Server, Socket } from 'socket.io';
import { processAmbulanceTrafficProximity } from './trafficPriorityService';

let ioInstance: Server | null = null;

export function initializeSocketIO(io: Server) {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Emit backend connection status
    socket.emit('backend-status-changed', {
      status: 'connected',
      service: 'carelink-backend',
      timestamp: new Date().toISOString()
    });

    // Join specific room
    socket.on('join_room', (data: { room: string }) => {
      if (data && data.room) {
        socket.join(data.room);
      }
    });

    // Handle ambulance location update from mobile GPS
    socket.on('ambulance-location-update', async (data: any) => {
      console.log(`[GPS] Location update received for Ambulance #${data.ambulanceId || 1}`);

      const lat = data.location?.latitude || data.latitude || 12.9650;
      const lng = data.location?.longitude || data.longitude || 77.5880;
      const accuracy = data.location?.accuracy || data.accuracy || 10;
      const triage = data.triageLevel || 'Critical/Red';

      // Broadcast location update
      io.emit('ambulance-location-updated', {
        ambulanceId: data.ambulanceId || 1,
        location: { latitude: lat, longitude: lng, accuracy },
        timestamp: Date.now()
      });

      // Run automatic traffic proximity decision engine
      const res = await processAmbulanceTrafficProximity(
        data.ambulanceId || 1,
        lat,
        lng,
        accuracy,
        data.emergencyRequestId,
        triage
      );

      if (res.triggeredSignals && res.triggeredSignals.length > 0) {
        res.triggeredSignals.forEach((sig) => {
          console.log(`[Signal] Automatic priority activated for ${sig.name}`);

          io.emit('signal-status-changed', {
            signalId: sig.id,
            signalName: sig.name,
            ambulanceId: data.ambulanceId || 1,
            status: 'AMBULANCE_PRIORITY_ACTIVE',
            direction: sig.approach_direction || 'North',
            distance: sig.distance_meters,
            reason: `Critical ambulance within automatic priority radius (${sig.distance_meters}m)`
          });

          io.emit('signal-priority-activated', {
            signalId: sig.id,
            signalName: sig.name,
            ambulanceId: data.ambulanceId || 1,
            activatedAt: new Date().toISOString()
          });
        });
      }
    });

    // Legacy handler fallback
    socket.on('ambulance_location_update', (data: any) => {
      socket.broadcast.emit('live_ambulance_location', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

export function getIO(): Server | null {
  return ioInstance;
}

export function emitToRoom(room: string, event: string, payload: any) {
  if (ioInstance) {
    ioInstance.to(room).emit(event, payload);
    ioInstance.emit(event, payload);
  }
}

export function emitGlobal(event: string, payload: any) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}
