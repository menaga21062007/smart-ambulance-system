import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { CONFIG } from './config';
import { initializeSchema } from './database/schema';
import { seedDatabase } from './database/seed';
import { initializeSocketIO } from './services/socketService';
import routes from './routes';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// API Base Router
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Initialize Socket.IO handlers
initializeSocketIO(io);

// Start server after initializing database
async function startServer() {
  try {
    console.log('Initializing SQLite Database...');
    await initializeSchema();
    await seedDatabase();

    server.listen(CONFIG.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚑 Smart Emergency Care Backend running on port ${CONFIG.PORT}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server };
