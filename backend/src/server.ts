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

const allowedOrigins = [
  'https://nimble-florentine-0de327.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow for demo prototyping
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
  }
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// API Base Router
app.use('/api', routes);

// Health check endpoints
const healthCheckHandler = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'carelink-backend',
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);

// Initialize Socket.IO handlers
initializeSocketIO(io);

// Start server after initializing database
async function startServer() {
  try {
    console.log('[API] Initializing SQLite Database...');
    await initializeSchema();
    await seedDatabase();

    server.listen(CONFIG.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚑 CareLink Smart Emergency Backend running on port ${CONFIG.PORT}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('[API] Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server };
