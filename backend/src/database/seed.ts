import bcrypt from 'bcryptjs';
import { getDb } from './db';

export async function seedDatabase() {
  const db = await getDb();

  // Check if roles exist
  const roleCount = await db.get('SELECT COUNT(*) as count FROM roles');
  if (roleCount.count > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial database...');

  // 1. Roles
  const roles = [
    { id: 1, name: 'System Administrator', description: 'Full system management' },
    { id: 2, name: 'Ambulance Staff', description: 'Ambulance GPS & Patient Intake' },
    { id: 3, name: 'Emergency Hospital Staff', description: 'Triage & Bed Reservations' },
    { id: 4, name: 'Doctor', description: 'Diagnosis, Treatment & Discharge Approval' },
    { id: 5, name: 'Nurse or Ward Manager', description: 'Bed assignment & Patient Admission' },
    { id: 6, name: 'Cleaning Staff', description: 'Bed sanitization & readiness' },
    { id: 7, name: 'Traffic-Control Operator', description: 'Emergency signal priority control' },
  ];

  for (const r of roles) {
    await db.run('INSERT INTO roles (id, name, description) VALUES (?, ?, ?)', [r.id, r.name, r.description]);
  }

  // 2. Hospitals
  await db.run(`
    INSERT INTO hospitals (id, name, address, latitude, longitude, contact_number, emergency_capacity, status)
    VALUES 
    (1, 'City General Hospital', '120 Healthcare Avenue, Downtown', 12.9716, 77.5946, '+1-800-555-0199', 60, 'ACTIVE'),
    (2, 'St. Jude Emergency Medical Center', '45 North Expressway, Sector 4', 12.9850, 77.6080, '+1-800-555-0288', 40, 'ACTIVE')
  `);

  // 3. Pre-seeded Users (Password: password123)
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = [
    { name: 'Dr. Sarah Connor', email: 'admin@hospital.com', role_id: 1, hospital_id: 1, phone: '+1-555-0101' },
    { name: 'John Miller (Paramedic)', email: 'ambulance@emergency.com', role_id: 2, hospital_id: 1, phone: '+1-555-0102' },
    { name: 'Nurse Clara Oswald', email: 'emergency@hospital.com', role_id: 3, hospital_id: 1, phone: '+1-555-0103' },
    { name: 'Dr. Gregory House', email: 'doctor@hospital.com', role_id: 4, hospital_id: 1, phone: '+1-555-0104' },
    { name: 'Nurse Jack Harkness', email: 'nurse@hospital.com', role_id: 5, hospital_id: 1, phone: '+1-555-0105' },
    { name: 'Samwise Gamgee (Sanitization)', email: 'cleaner@hospital.com', role_id: 6, hospital_id: 1, phone: '+1-555-0106' },
    { name: 'Alex Mercer (Traffic Ops)', email: 'traffic@city.gov', role_id: 7, hospital_id: null, phone: '+1-555-0107' },
  ];

  for (const u of users) {
    await db.run(
      'INSERT INTO users (name, email, password_hash, role_id, hospital_id, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u.name, u.email, passwordHash, u.role_id, u.hospital_id, u.phone, 'ACTIVE']
    );
  }

  // 4. Wards
  const wards = [
    { id: 1, hospital_id: 1, name: 'Emergency Trauma Ward', ward_type: 'Emergency', floor: '1st Floor', department: 'Emergency Medicine' },
    { id: 2, hospital_id: 1, name: 'Intensive Care Unit (ICU)', ward_type: 'ICU', floor: '2nd Floor', department: 'Critical Care' },
    { id: 3, hospital_id: 1, name: 'General Medical Ward A', ward_type: 'General', floor: '3rd Floor', department: 'Internal Medicine' },
    { id: 4, hospital_id: 1, name: 'Isolation Ward', ward_type: 'Isolation', floor: '4th Floor', department: 'Infectious Diseases' },
    { id: 5, hospital_id: 1, name: 'Pediatric Care Ward', ward_type: 'Pediatric', floor: '2nd Floor B', department: 'Pediatrics' },
    { id: 6, hospital_id: 2, name: 'St. Jude ER Department', ward_type: 'Emergency', floor: 'Ground Floor', department: 'Emergency Medicine' },
  ];

  for (const w of wards) {
    await db.run(
      'INSERT INTO wards (id, hospital_id, name, ward_type, floor, department) VALUES (?, ?, ?, ?, ?, ?)',
      [w.id, w.hospital_id, w.name, w.ward_type, w.floor, w.department]
    );
  }

  // 5. Beds across various states
  const beds = [
    { id: 1, ward_id: 1, bed_number: 'ER-101', bed_type: 'Emergency bed', status: 'Available', equipment: 'Oxygen, Patient Monitor', isolation: 0 },
    { id: 2, ward_id: 1, bed_number: 'ER-102', bed_type: 'Emergency bed', status: 'Reserved', equipment: 'Oxygen, Defibrillator', isolation: 0 },
    { id: 3, ward_id: 1, bed_number: 'ER-103', bed_type: 'Emergency bed', status: 'Occupied', equipment: 'Ventilator, Oxygen', isolation: 0 },
    { id: 4, ward_id: 2, bed_number: 'ICU-201', bed_type: 'ICU bed', status: 'Available', equipment: 'Ventilator, Oxygen, Vital Monitor, Infusion Pump', isolation: 0 },
    { id: 5, ward_id: 2, bed_number: 'ICU-202', bed_type: 'ICU bed', status: 'Under Cleaning', equipment: 'Ventilator, Oxygen, Vital Monitor', isolation: 0 },
    { id: 6, ward_id: 2, bed_number: 'ICU-203', bed_type: 'ICU bed', status: 'Occupied', equipment: 'Ventilator, Oxygen', isolation: 0 },
    { id: 7, ward_id: 3, bed_number: 'GEN-301', bed_type: 'General ward bed', status: 'Available', equipment: 'Standard Oxygen', isolation: 0 },
    { id: 8, ward_id: 3, bed_number: 'GEN-302', bed_type: 'General ward bed', status: 'Occupied', equipment: 'None', isolation: 0 },
    { id: 9, ward_id: 4, bed_number: 'ISO-401', bed_type: 'Isolation bed', status: 'Available', equipment: 'Ventilator, Negative Pressure, Oxygen', isolation: 1 },
    { id: 10, ward_id: 5, bed_number: 'PED-501', bed_type: 'Pediatric bed', status: 'Available', equipment: 'Pediatric Monitor, Oxygen', isolation: 0 },
  ];

  for (const b of beds) {
    await db.run(
      'INSERT INTO beds (id, ward_id, bed_number, bed_type, status, required_equipment, isolation_capable) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [b.id, b.ward_id, b.bed_number, b.bed_type, b.status, b.equipment, b.isolation]
    );
  }

  // 6. Ambulances
  await db.run(`
    INSERT INTO ambulances (id, vehicle_number, driver_name, contact_number, current_latitude, current_longitude, gps_enabled, status)
    VALUES 
    (1, 'AMB-MED-101', 'John Miller', '+1-555-9001', 12.9550, 77.5800, 1, 'Available'),
    (2, 'AMB-MED-102', 'Robert Vance', '+1-555-9002', 12.9600, 77.5850, 1, 'On Route'),
    (3, 'AMB-MED-103', 'Elena Rostova', '+1-555-9003', 12.9780, 77.6000, 1, 'Available')
  `);

  // 7. Hospital Resources
  const resources = [
    { hospital_id: 1, name: 'Ventilator Units', type: 'EQUIPMENT', total: 15, avail: 4, min: 2, loc: 'ICU & ER' },
    { hospital_id: 1, name: 'Medical Oxygen Cylinders (50L)', type: 'CONSUMABLE', total: 100, avail: 28, min: 15, loc: 'Central Gas Storage' },
    { hospital_id: 1, name: 'ICU Beds', type: 'BED', total: 10, avail: 2, min: 2, loc: 'Floor 2' },
    { hospital_id: 1, name: 'Operating Rooms', type: 'FACILITY', total: 4, avail: 1, min: 1, loc: 'Floor 3 Surgical Wing' },
    { hospital_id: 1, name: 'O-Negative Blood Units', type: 'BLOOD', total: 20, avail: 5, min: 5, loc: 'Blood Bank' },
    { hospital_id: 1, name: 'Wheelchairs', type: 'EQUIPMENT', total: 25, avail: 12, min: 5, loc: 'ER Reception' },
  ];

  for (const res of resources) {
    await db.run(
      'INSERT INTO resources (hospital_id, name, resource_type, total_quantity, available_quantity, minimum_threshold, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [res.hospital_id, res.name, res.type, res.total, res.avail, res.min, res.loc, 'AVAILABLE']
    );
  }

  // 8. Traffic Signals along ambulance path
  const signals = [
    { id: 1, name: 'Signal #1 - Central Boulevard Crossing', lat: 12.9620, lng: 77.5850, cycle: 'AUTO_60S', status: 'RED' },
    { id: 2, name: 'Signal #2 - Metro Flyover Junction', lat: 12.9660, lng: 77.5890, cycle: 'AUTO_60S', status: 'RED' },
    { id: 3, name: 'Signal #3 - Hospital Avenue Ramp', lat: 12.9700, lng: 77.5930, cycle: 'AUTO_45S', status: 'RED' },
    { id: 4, name: 'Signal #4 - Emergency Wing Gate', lat: 12.9712, lng: 77.5940, cycle: 'AUTO_30S', status: 'RED' },
  ];

  for (const s of signals) {
    await db.run(
      'INSERT INTO traffic_signals (id, name, latitude, longitude, normal_cycle, current_status) VALUES (?, ?, ?, ?, ?, ?)',
      [s.id, s.name, s.lat, s.lng, s.cycle, s.status]
    );
  }

  // 9. Initial Sample Patient & Active Emergency
  await db.run(`
    INSERT INTO patients (id, name, age, gender, blood_group, allergies, existing_conditions, symptoms, emergency_type, contact_info)
    VALUES (1, 'David Miller', 48, 'Male', 'O+', 'Penicillin', 'Hypertension', 'Acute Chest Pain, Dyspnea', 'CARDIAC', '+1-555-8822')
  `);

  await db.run(`
    INSERT INTO emergency_requests (id, patient_id, ambulance_id, destination_hospital_id, current_latitude, current_longitude, destination_latitude, destination_longitude, estimated_arrival_time, status)
    VALUES (1, 1, 1, 1, 12.9550, 77.5800, 12.9716, 77.5946, 12, 'ACTIVE')
  `);

  await db.run(`
    INSERT INTO triage_assessments (patient_id, assessed_by, triage_level, condition_notes, required_department, required_equipment)
    VALUES (1, 2, 'Critical/Red', 'Suspected Myocardial Infarction. Requires immediate ICU / Cardiac ER with ventilator support.', 'Critical Care', 'Ventilator, Oxygen')
  `);

  // 10. Sample Notifications
  await db.run(`
    INSERT INTO notifications (hospital_id, type, title, message, status)
    VALUES 
    (1, 'EMERGENCY_INCOMING', 'Critical Patient En-Route', 'Ambulance AMB-MED-101 approaching with Critical/Red Cardiac emergency. ETA: 12 mins.', 'UNREAD'),
    (1, 'RESOURCE_ALERT', 'Low Oxygen Threshold', 'Medical Oxygen Cylinders level is approaching minimum threshold (28 remaining).', 'UNREAD')
  `);

  console.log('Database seeded successfully!');
}
