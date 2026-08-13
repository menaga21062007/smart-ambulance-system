import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'smart_ambulance_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: '24h',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../database.sqlite'),
  SIGNAL_EMERGENCY_RADIUS_METERS: 500, // 500 meters threshold for emergency green light
  RESERVATION_EXPIRY_MINUTES: 30,
};
