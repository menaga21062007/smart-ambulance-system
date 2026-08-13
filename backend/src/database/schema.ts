import { getDb } from './db';

export async function initializeSchema() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS hospitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      contact_number TEXT NOT NULL,
      emergency_capacity INTEGER DEFAULT 50,
      status TEXT DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      hospital_id INTEGER,
      phone TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS wards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      ward_type TEXT NOT NULL,
      floor TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS beds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ward_id INTEGER NOT NULL,
      bed_number TEXT NOT NULL,
      bed_type TEXT NOT NULL,
      status TEXT DEFAULT 'Available',
      required_equipment TEXT,
      isolation_capable INTEGER DEFAULT 0,
      current_patient_id INTEGER,
      last_cleaned_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ward_id) REFERENCES wards(id)
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      gender TEXT,
      blood_group TEXT,
      allergies TEXT,
      existing_conditions TEXT,
      symptoms TEXT,
      emergency_type TEXT,
      contact_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ambulances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_number TEXT UNIQUE NOT NULL,
      driver_name TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      current_latitude REAL NOT NULL,
      current_longitude REAL NOT NULL,
      gps_enabled INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Available',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emergency_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      ambulance_id INTEGER NOT NULL,
      destination_hospital_id INTEGER NOT NULL,
      current_latitude REAL NOT NULL,
      current_longitude REAL NOT NULL,
      destination_latitude REAL NOT NULL,
      destination_longitude REAL NOT NULL,
      estimated_arrival_time INTEGER,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (ambulance_id) REFERENCES ambulances(id),
      FOREIGN KEY (destination_hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS triage_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      assessed_by INTEGER NOT NULL,
      triage_level TEXT NOT NULL,
      condition_notes TEXT,
      required_department TEXT,
      required_equipment TEXT,
      assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (assessed_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS bed_reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bed_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      emergency_request_id INTEGER,
      reserved_by INTEGER NOT NULL,
      reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      status TEXT DEFAULT 'ACTIVE',
      FOREIGN KEY (bed_id) REFERENCES beds(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (reserved_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS admissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      bed_id INTEGER NOT NULL,
      admitted_by INTEGER NOT NULL,
      admission_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      attending_doctor TEXT,
      notes TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (bed_id) REFERENCES beds(id),
      FOREIGN KEY (admitted_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS discharges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      bed_id INTEGER NOT NULL,
      discharged_by INTEGER NOT NULL,
      discharge_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      discharge_type TEXT DEFAULT 'NORMAL',
      notes TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (bed_id) REFERENCES beds(id),
      FOREIGN KEY (discharged_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      total_quantity INTEGER NOT NULL,
      available_quantity INTEGER NOT NULL,
      minimum_threshold INTEGER NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'AVAILABLE',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    );

    CREATE TABLE IF NOT EXISTS resource_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      resource_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'IN_USE',
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (resource_id) REFERENCES resources(id)
    );

    CREATE TABLE IF NOT EXISTS traffic_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      normal_cycle TEXT DEFAULT 'AUTO_60S',
      current_status TEXT DEFAULT 'RED',
      emergency_mode INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS signal_priority_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      signal_id INTEGER NOT NULL,
      ambulance_id INTEGER NOT NULL,
      emergency_request_id INTEGER,
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME,
      ended_at DATETIME,
      status TEXT DEFAULT 'PENDING',
      approved_by INTEGER,
      notes TEXT,
      FOREIGN KEY (signal_id) REFERENCES traffic_signals(id),
      FOREIGN KEY (ambulance_id) REFERENCES ambulances(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      hospital_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'UNREAD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cleaning_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bed_id INTEGER NOT NULL,
      patient_id INTEGER,
      assigned_to INTEGER,
      started_at DATETIME,
      completed_at DATETIME,
      inspection_status TEXT DEFAULT 'PENDING',
      notes TEXT,
      FOREIGN KEY (bed_id) REFERENCES beds(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      old_value TEXT,
      new_value TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT
    );
  `);
}
