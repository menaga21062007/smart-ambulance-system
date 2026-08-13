import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

export function initializeSocketIO(io: Server) {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join specific role/hospital room
    socket.on('join_room', (data: { room: string }) => {
      if (data && data.room) {
        socket.join(data.room);
        console.log(`Socket ${socket.id} joined room: ${data.room}`);
      }
    });

    // Handle ambulance live location broadcast
    socket.on('ambulance_location_update', (data: any) => {
      // Broadcast to hospital room and traffic_control room
      socket.broadcast.emit('live_ambulance_location', data);
      if (data.hospital_id) {
        io.to(`hospital_${data.hospital_id}`).emit('ambulance_location_feed', data);
      }
      io.to('traffic_control').emit('traffic_ambulance_feed', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

export function getIO(): Server | null {
  return ioInstance;
}

export function emitToRoom(room: string, event: string, payload: any) {
  if (ioInstance) {
    ioInstance.to(room).emit(event, payload);
    ioInstance.emit(event, payload); // Also emit globally for top-level header alert toasts
  }
}

export function emitGlobal(event: string, payload: any) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}
