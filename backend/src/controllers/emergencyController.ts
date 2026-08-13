import { Request, Response } from 'express';
import { getDb } from '../database/db';
import { recommendBedsForPatient } from '../services/recommendationEngine';
import { emitGlobal, emitToRoom } from '../services/socketService';

export async function createEmergencyRequest(req: Request, res: Response) {
  try {
    const {
      patient_name,
      age,
      gender,
      blood_group,
      allergies,
      existing_conditions,
      symptoms,
      emergency_type,
      triage_level,
      required_equipment,
      isolation_required,
      ambulance_id,
      destination_hospital_id,
      current_latitude,
      current_longitude,
      estimated_arrival_time
    } = req.body;

    const user = (req as any).user;
    const db = await getDb();

    // 1. Create Patient record
    const patientResult = await db.run(
      `INSERT INTO patients (name, age, gender, blood_group, allergies, existing_conditions, symptoms, emergency_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_name || 'Unidentified Emergency Patient',
        age || null,
        gender || 'Unknown',
        blood_group || null,
        allergies || null,
        existing_conditions || null,
        symptoms,
        emergency_type
      ]
    );
    const patientId = patientResult.lastID;

    // 2. Fetch destination hospital coords
    const hospital = await db.get('SELECT * FROM hospitals WHERE id = ?', [destination_hospital_id]);
    if (!hospital) {
      return res.status(400).json({ error: 'Selected destination hospital not found' });
    }

    // 3. Create Emergency Request record
    const reqResult = await db.run(
      `INSERT INTO emergency_requests (
        patient_id, ambulance_id, destination_hospital_id, current_latitude, current_longitude,
        destination_latitude, destination_longitude, estimated_arrival_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        ambulance_id,
        destination_hospital_id,
        current_latitude || 12.9550,
        current_longitude || 77.5800,
        hospital.latitude,
        hospital.longitude,
        estimated_arrival_time || 15,
        'ACTIVE'
      ]
    );
    const requestId = reqResult.lastID;

    // 4. Create Triage record
    await db.run(
      `INSERT INTO triage_assessments (patient_id, assessed_by, triage_level, condition_notes, required_equipment)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, user?.id || 1, triage_level || 'Unknown', symptoms, required_equipment || null]
    );

    // 5. Update ambulance status
    await db.run(
      `UPDATE ambulances SET status = 'On Route', current_latitude = ?, current_longitude = ? WHERE id = ?`,
      [current_latitude, current_longitude, ambulance_id]
    );

    // 6. Generate Notification
    const notifTitle = `INCOMING EMERGENCY: ${triage_level || 'Urgent'}`;
    const notifMsg = `Patient ${patient_name || '#'+patientId} en-route to ${hospital.name}. ETA: ${estimated_arrival_time || 15} mins. Symptoms: ${symptoms}`;
    
    await db.run(
      `INSERT INTO notifications (hospital_id, type, title, message) VALUES (?, ?, ?, ?)`,
      [destination_hospital_id, 'EMERGENCY_INCOMING', notifTitle, notifMsg]
    );

    // 7. Calculate bed recommendations automatically
    const recommendations = await recommendBedsForPatient(destination_hospital_id, {
      id: patientId!,
      name: patient_name,
      age,
      gender,
      triage_level: triage_level || 'Urgent/Yellow',
      symptoms,
      required_equipment,
      isolation_required: Boolean(isolation_required)
    });

    const payload = {
      emergency_request_id: requestId,
      patient_id: patientId,
      patient_name: patient_name || 'Emergency Patient',
      triage_level,
      hospital_id: destination_hospital_id,
      hospital_name: hospital.name,
      ambulance_id,
      eta: estimated_arrival_time || 15,
      recommendations
    };

    emitToRoom(`hospital_${destination_hospital_id}`, 'incoming_emergency_alert', payload);
    emitGlobal('incoming_emergency_alert', payload);

    return res.status(201).json({
      message: 'Emergency request registered successfully',
      emergency_request_id: requestId,
      patient_id: patientId,
      recommendations
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getEmergencyRequests(req: Request, res: Response) {
  try {
    const db = await getDb();
    const requests = await db.all(
      `SELECT er.*, p.name as patient_name, p.age, p.gender, p.blood_group, p.symptoms, p.emergency_type,
              ta.triage_level, h.name as hospital_name, a.vehicle_number, a.driver_name
       FROM emergency_requests er
       JOIN patients p ON er.patient_id = p.id
       JOIN hospitals h ON er.destination_hospital_id = h.id
       JOIN ambulances a ON er.ambulance_id = a.id
       LEFT JOIN triage_assessments ta ON ta.patient_id = p.id
       ORDER BY er.created_at DESC`
    );
    return res.json(requests);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getBedRecommendations(req: Request, res: Response) {
  try {
    const requestId = req.params.id;
    const db = await getDb();
    const reqData = await db.get(
      `SELECT er.*, p.*, ta.triage_level, ta.required_equipment 
       FROM emergency_requests er
       JOIN patients p ON er.patient_id = p.id
       LEFT JOIN triage_assessments ta ON ta.patient_id = p.id
       WHERE er.id = ?`,
      [requestId]
    );

    if (!reqData) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }

    const recommendations = await recommendBedsForPatient(reqData.destination_hospital_id, {
      id: reqData.patient_id,
      name: reqData.name,
      age: reqData.age,
      gender: reqData.gender,
      triage_level: reqData.triage_level || 'Urgent/Yellow',
      symptoms: reqData.symptoms,
      required_equipment: reqData.required_equipment
    });

    return res.json(recommendations);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function reserveBed(req: Request, res: Response) {
  try {
    const { bed_id, patient_id, emergency_request_id } = req.body;
    const user = (req as any).user;
    const db = await getDb();

    // Check if bed is available
    const bed = await db.get('SELECT * FROM beds WHERE id = ?', [bed_id]);
    if (!bed) {
      return res.status(404).json({ error: 'Bed not found' });
    }
    if (bed.status !== 'Available') {
      return res.status(400).json({ error: `Bed ${bed.bed_number} is not available (Current status: ${bed.status})` });
    }

    // Update bed status -> Reserved
    await db.run(
      `UPDATE beds SET status = 'Reserved', current_patient_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [patient_id, bed_id]
    );

    // Create reservation record
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await db.run(
      `INSERT INTO bed_reservations (bed_id, patient_id, emergency_request_id, reserved_by, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [bed_id, patient_id, emergency_request_id || null, user?.id || 1, expiresAt]
    );

    // Update emergency request status
    if (emergency_request_id) {
      await db.run(`UPDATE emergency_requests SET status = 'BED_RESERVED' WHERE id = ?`, [emergency_request_id]);
    }

    emitGlobal('bed_reserved', { bed_id, bed_number: bed.bed_number, patient_id, reserved_by: user?.name || 'Staff' });

    return res.json({ message: `Bed ${bed.bed_number} successfully reserved`, bed_id, status: 'Reserved' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function confirmAdmission(req: Request, res: Response) {
  try {
    const { patient_id, bed_id, attending_doctor, notes } = req.body;
    const user = (req as any).user;
    const db = await getDb();

    // Update Bed -> Occupied
    await db.run(
      `UPDATE beds SET status = 'Occupied', current_patient_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [patient_id, bed_id]
    );

    // Record Admission
    await db.run(
      `INSERT INTO admissions (patient_id, bed_id, admitted_by, attending_doctor, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, bed_id, user?.id || 1, attending_doctor || 'Dr. Gregory House', notes || 'Patient admitted to assigned bed']
    );

    // Complete emergency request
    await db.run(
      `UPDATE emergency_requests SET status = 'COMPLETED' WHERE patient_id = ? AND status != 'COMPLETED'`,
      [patient_id]
    );

    emitGlobal('patient_admitted', { bed_id, patient_id });

    return res.json({ message: 'Patient admitted successfully', bed_id, status: 'Occupied' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function processDischarge(req: Request, res: Response) {
  try {
    const { patient_id, bed_id, discharge_type, notes } = req.body;
    const user = (req as any).user;
    const db = await getDb();

    // Update Bed -> Under Cleaning
    await db.run(
      `UPDATE beds SET status = 'Under Cleaning', current_patient_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [bed_id]
    );

    // Record Discharge
    await db.run(
      `INSERT INTO discharges (patient_id, bed_id, discharged_by, discharge_type, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, bed_id, user?.id || 1, discharge_type || 'NORMAL', notes || 'Patient discharged']
    );

    // Record Cleaning task for cleaning staff
    await db.run(
      `INSERT INTO cleaning_records (bed_id, patient_id, started_at, inspection_status, notes)
       VALUES (?, ?, CURRENT_TIMESTAMP, 'PENDING', 'Requires thorough sanitization post-discharge')`,
      [bed_id, patient_id]
    );

    emitGlobal('bed_cleaning_required', { bed_id, patient_id });

    return res.json({ message: 'Patient discharged. Bed queued for cleaning.', bed_id, status: 'Under Cleaning' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
