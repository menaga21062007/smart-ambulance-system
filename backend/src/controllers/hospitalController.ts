import { Request, Response } from 'express';
import { getDb } from '../database/db';
import { emitGlobal } from '../services/socketService';

export async function getHospitals(req: Request, res: Response) {
  try {
    const db = await getDb();
    const hospitals = await db.all('SELECT * FROM hospitals');
    return res.json(hospitals);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getHospitalWards(req: Request, res: Response) {
  try {
    const hospitalId = req.params.id;
    const db = await getDb();
    const wards = await db.all('SELECT * FROM wards WHERE hospital_id = ?', [hospitalId]);
    return res.json(wards);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getHospitalBeds(req: Request, res: Response) {
  try {
    const hospitalId = req.params.id;
    const db = await getDb();
    const beds = await db.all(
      `SELECT b.*, w.name as ward_name, w.ward_type, w.floor, p.name as patient_name
       FROM beds b
       JOIN wards w ON b.ward_id = w.id
       LEFT JOIN patients p ON b.current_patient_id = p.id
       WHERE w.hospital_id = ?`,
      [hospitalId]
    );
    return res.json(beds);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateBedStatus(req: Request, res: Response) {
  try {
    const bedId = req.params.id;
    const { status, notes } = req.body;
    const user = (req as any).user;

    const db = await getDb();
    const oldBed = await db.get('SELECT * FROM beds WHERE id = ?', [bedId]);

    if (!oldBed) {
      return res.status(404).json({ error: 'Bed not found' });
    }

    await db.run(
      `UPDATE beds 
       SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, bedId]
    );

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user?.id || 1, 'UPDATE_BED_STATUS', 'BED', bedId, oldBed.status, status]
    );

    emitGlobal('bed_status_changed', { bed_id: bedId, old_status: oldBed.status, new_status: status });

    return res.json({ message: 'Bed status updated successfully', bed_id: bedId, status });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getHospitalResources(req: Request, res: Response) {
  try {
    const hospitalId = req.params.id;
    const db = await getDb();
    const resources = await db.all('SELECT * FROM resources WHERE hospital_id = ?', [hospitalId]);
    return res.json(resources);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateResource(req: Request, res: Response) {
  try {
    const resourceId = req.params.id;
    const { available_quantity, total_quantity } = req.body;
    const db = await getDb();

    const resource = await db.get('SELECT * FROM resources WHERE id = ?', [resourceId]);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const newAvail = available_quantity !== undefined ? available_quantity : resource.available_quantity;
    const newTotal = total_quantity !== undefined ? total_quantity : resource.total_quantity;

    await db.run(
      `UPDATE resources 
       SET available_quantity = ?, total_quantity = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [newAvail, newTotal, resourceId]
    );

    // Check threshold warning trigger
    if (newAvail <= resource.minimum_threshold) {
      const title = `RESOURCE SHORTAGE ALERT: ${resource.name}`;
      const msg = `${resource.name} available quantity (${newAvail}) has reached minimum safety threshold (${resource.minimum_threshold}).`;
      
      await db.run(
        `INSERT INTO notifications (hospital_id, type, title, message) VALUES (?, ?, ?, ?)`,
        [resource.hospital_id, 'RESOURCE_ALERT', title, msg]
      );
      emitGlobal('resource_alert', { hospital_id: resource.hospital_id, resource_id: resourceId, title, message: msg });
    }

    return res.json({ message: 'Resource updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
