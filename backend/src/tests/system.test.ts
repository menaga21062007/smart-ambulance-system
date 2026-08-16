import request from 'supertest';
import { app } from '../server';
import { getDb, closeDb } from '../database/db';
import { initializeSchema } from '../database/schema';
import { seedDatabase } from '../database/seed';
import { calculateDistanceMeters, processAmbulanceTrafficProximity } from '../services/trafficPriorityService';
import { recommendBedsForPatient } from '../services/recommendationEngine';

beforeAll(async () => {
  await initializeSchema();
  await seedDatabase();
});

afterAll(async () => {
  await closeDb();
});

describe('Smart Ambulance System API & Unit Tests', () => {
  let authToken: string;

  it('1. GET /health - Should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(['ok', 'UP']).toContain(res.body.status);
    expect(res.body.service).toBe('carelink-backend');
  });

  it('2. GET /api/auth/demo-accounts - Should return list of pre-seeded demo users', async () => {
    const res = await request(app).get('/api/auth/demo-accounts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('3. POST /api/auth/login - Should authenticate valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hospital.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('4. Unit Test: Haversine Distance & Traffic Priority Proximity', () => {
    const dist = calculateDistanceMeters(12.9716, 77.5946, 12.9712, 77.5940);
    expect(dist).toBeLessThan(500);
  });

  it('5. Unit Test: Bed Recommendation Scoring Algorithm', async () => {
    const recommendation = await recommendBedsForPatient(1, {
      id: 99,
      name: 'Test Critical Patient',
      age: 60,
      gender: 'Male',
      triage_level: 'Critical/Red',
      symptoms: 'Cardiac Arrest',
      required_equipment: 'Ventilator, Oxygen'
    });

    expect(recommendation.primary).not.toBeNull();
    expect(['ICU bed', 'Emergency bed']).toContain(recommendation.primary?.bed_type);
  });

  it('6. GET /api/hospitals - Should list active hospitals', async () => {
    const res = await request(app).get('/api/hospitals');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('7. GET /api/traffic-signals - Should list traffic signals', async () => {
    const res = await request(app).get('/api/traffic-signals');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('8. Bed Status Workflow Test - Available -> Reserved -> Occupied -> Under Cleaning', async () => {
    const db = await getDb();
    
    // Pick an available bed
    const availableBed = await db.get("SELECT * FROM beds WHERE status = 'Available' LIMIT 1");
    expect(availableBed).toBeDefined();

    // Reserve Bed
    const reserveRes = await request(app)
      .post('/api/bed-reservations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ bed_id: availableBed.id, patient_id: 1 });
    expect(reserveRes.status).toBe(200);

    // Admit Patient
    const admitRes = await request(app)
      .post('/api/admissions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ bed_id: availableBed.id, patient_id: 1, attending_doctor: 'Dr. House' });
    expect(admitRes.status).toBe(200);

    // Discharge Patient
    const dischargeRes = await request(app)
      .post('/api/discharges')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ bed_id: availableBed.id, patient_id: 1, discharge_type: 'NORMAL' });
    expect(dischargeRes.status).toBe(200);

    // Complete Cleaning
    const cleanRes = await request(app)
      .post(`/api/beds/${availableBed.id}/complete-cleaning`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ notes: 'Tested and cleaned' });
    expect(cleanRes.status).toBe(200);

    // Check final status is back to Available
    const finalBed = await db.get('SELECT status FROM beds WHERE id = ?', [availableBed.id]);
    expect(finalBed.status).toBe('Available');
  });
});
