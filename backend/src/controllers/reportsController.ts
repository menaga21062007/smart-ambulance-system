import { Request, Response } from 'express';
import { getDb } from '../database/db';

export async function getAnalyticsSummary(req: Request, res: Response) {
  try {
    const db = await getDb();

    // Bed status breakdown
    const bedStats = await db.all(
      `SELECT status, COUNT(*) as count FROM beds GROUP BY status`
    );

    // Triage distribution in last 30 days
    const triageStats = await db.all(
      `SELECT triage_level, COUNT(*) as count FROM triage_assessments GROUP BY triage_level`
    );

    // Bed occupancy rate by ward
    const wardOccupancy = await db.all(
      `SELECT w.name as ward_name, 
              COUNT(b.id) as total_beds,
              SUM(CASE WHEN b.status = 'Occupied' THEN 1 ELSE 0 END) as occupied_beds,
              SUM(CASE WHEN b.status = 'Available' THEN 1 ELSE 0 END) as available_beds,
              SUM(CASE WHEN b.status = 'Reserved' THEN 1 ELSE 0 END) as reserved_beds,
              SUM(CASE WHEN b.status = 'Under Cleaning' THEN 1 ELSE 0 END) as cleaning_beds
       FROM wards w
       LEFT JOIN beds b ON w.id = b.ward_id
       GROUP BY w.id`
    );

    // Traffic signal priority statistics
    const signalEvents = await db.all(
      `SELECT status, COUNT(*) as count FROM signal_priority_events GROUP BY status`
    );

    // Totals
    const totalHospitals = await db.get('SELECT COUNT(*) as count FROM hospitals');
    const totalAmbulances = await db.get('SELECT COUNT(*) as count FROM ambulances');
    const totalPatients = await db.get('SELECT COUNT(*) as count FROM patients');

    return res.json({
      bedStats,
      triageStats,
      wardOccupancy,
      signalEvents,
      totals: {
        hospitals: totalHospitals.count,
        ambulances: totalAmbulances.count,
        patients: totalPatients.count
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
