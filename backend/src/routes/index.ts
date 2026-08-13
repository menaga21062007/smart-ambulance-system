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
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// Public / Auth Routes
router.post('/auth/login', login);
router.get('/auth/demo-accounts', getDemoAccounts);
router.get('/auth/me', authenticateJWT, getCurrentUser);

// Hospital Routes
router.get('/hospitals', getHospitals);
router.get('/hospitals/:id/wards', getHospitalWards);
router.get('/hospitals/:id/beds', getHospitalBeds);
router.patch('/beds/:id/status', authenticateJWT, updateBedStatus);
router.get('/hospitals/:id/resources', getHospitalResources);
router.patch('/resources/:id', authenticateJWT, updateResource);

// Ambulance Routes
router.get('/ambulances', getAmbulances);
router.patch('/ambulances/:id/location', updateAmbulanceLocation);

// Emergency & Patient Routes
router.post('/emergency-requests', authenticateJWT, createEmergencyRequest);
router.get('/emergency-requests', getEmergencyRequests);
router.get('/emergency-requests/:id/recommended-beds', getBedRecommendations);
router.post('/bed-reservations', authenticateJWT, reserveBed);
router.post('/admissions', authenticateJWT, confirmAdmission);
router.post('/discharges', authenticateJWT, processDischarge);

// Traffic Control Routes
router.get('/traffic-signals', getTrafficSignals);
router.patch('/traffic-signals/:id/override', authenticateJWT, overrideSignalStatus);
router.get('/traffic-signals/history', getSignalHistory);

// Bed Cleaning Workflow Routes
router.get('/cleaning/beds', getBedsNeedingCleaning);
router.post('/beds/:id/start-cleaning', authenticateJWT, startCleaning);
router.post('/beds/:id/complete-cleaning', authenticateJWT, completeCleaning);

// Reports & Analytics Routes
router.get('/reports/analytics', getAnalyticsSummary);

export default router;
