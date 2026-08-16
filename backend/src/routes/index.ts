import { Router } from 'express';
import { login, getDemoAccounts, getCurrentUser } from '../controllers/authController';
import {
  getHospitals,
  getHospitalWards,
  getHospitalBeds,
  updateBedStatus,
  getHospitalResources,
  updateResource
} from '../controllers/hospitalController';
import { getAmbulances, updateAmbulanceLocation } from '../controllers/ambulanceController';
import {
  createEmergencyRequest,
  getEmergencyRequests,
  getBedRecommendations,
  reserveBed,
  confirmAdmission,
  processDischarge
} from '../controllers/emergencyController';
import {
  getTrafficSignals,
  overrideSignalStatus,
  getSignalHistory
} from '../controllers/trafficController';
import {
  getBedsNeedingCleaning,
  startCleaning,
  completeCleaning
} from '../controllers/cleaningController';
import { getAnalyticsSummary } from '../controllers/reportsController';
import { resetMapDemoData } from '../controllers/adminController';
import { authenticateJWT, requireRoles } from '../middleware/auth';
import { getDb } from '../database/db';

const router = Router();

// Public / Health / Auth Routes
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'carelink-backend', timestamp: new Date().toISOString() });
});
router.post('/auth/login', login);
router.get('/auth/demo-accounts', getDemoAccounts);
router.get('/auth/me', authenticateJWT, getCurrentUser);

// Hospital & Resource Routes
router.get('/hospitals', getHospitals);
router.get('/hospitals/:id/wards', getHospitalWards);
router.get('/hospitals/:id/beds', getHospitalBeds);
router.get('/beds', async (req, res) => {
  const db = await getDb();
  const beds = await db.all('SELECT * FROM beds');
  res.json(beds);
});
router.patch('/beds/:id/status', authenticateJWT, updateBedStatus);
router.get('/hospitals/:id/resources', getHospitalResources);
router.get('/resources', async (req, res) => {
  const db = await getDb();
  const resources = await db.all('SELECT * FROM hospital_resources');
  res.json(resources);
});
router.patch('/resources/:id', authenticateJWT, updateResource);

// Ambulance & Telemetry Routes
router.get('/ambulances', getAmbulances);
router.patch('/ambulances/:id/location', updateAmbulanceLocation);
router.post('/ambulances/:id/location', updateAmbulanceLocation);
router.get('/ambulances/:id/location', async (req, res) => {
  const db = await getDb();
  const loc = await db.get('SELECT * FROM ambulance_locations WHERE ambulance_id = ? ORDER BY id DESC LIMIT 1', [req.params.id]);
  res.json(loc || { latitude: 12.9650, longitude: 77.5880, accuracy: 12 });
});

// Emergency & Patient Routes
router.post('/emergency-requests', authenticateJWT, createEmergencyRequest);
router.get('/emergency-requests', getEmergencyRequests);
router.get('/emergency-requests/:id/recommended-beds', getBedRecommendations);
router.post('/bed-reservations', authenticateJWT, reserveBed);
router.post('/admissions', authenticateJWT, confirmAdmission);
router.post('/discharges', authenticateJWT, processDischarge);

// Traffic Control & Priority Routes
router.get('/traffic-signals', getTrafficSignals);
router.patch('/traffic-signals/:id/override', authenticateJWT, overrideSignalStatus);
router.get('/traffic-signals/history', getSignalHistory);
router.post('/ambulance-signal-requests', async (req, res) => {
  const db = await getDb();
  const { ambulance_id, traffic_signal_id, distance_in_meters, approach_direction, patient_priority, gps_accuracy } = req.body;
  const result = await db.run(
    `INSERT INTO ambulance_signal_requests (ambulance_id, traffic_signal_id, distance_in_meters, approach_direction, patient_priority, gps_accuracy, status)
     VALUES (?, ?, ?, ?, ?, ?, 'AMBULANCE_PRIORITY_ACTIVE')`,
    [ambulance_id || 1, traffic_signal_id || 1, distance_in_meters || 200, approach_direction || 'North', patient_priority || 'Critical/Red', gps_accuracy || 12]
  );
  res.json({ message: 'Priority request logged', id: result.lastID });
});

router.get('/ambulance-signal-requests/active', async (req, res) => {
  const db = await getDb();
  const active = await db.all("SELECT * FROM ambulance_signal_requests WHERE status = 'AMBULANCE_PRIORITY_ACTIVE'");
  res.json(active);
});

// Admin Routes
router.post('/admin/reset-map-demo', authenticateJWT, requireRoles(['System Administrator']), resetMapDemoData);

// Bed Cleaning Workflow Routes
router.get('/cleaning/beds', getBedsNeedingCleaning);
router.post('/beds/:id/start-cleaning', authenticateJWT, startCleaning);
router.post('/beds/:id/complete-cleaning', authenticateJWT, completeCleaning);

// Reports & Analytics Routes
router.get('/reports/analytics', getAnalyticsSummary);

export default router;
