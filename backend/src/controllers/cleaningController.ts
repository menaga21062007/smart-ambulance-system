import { Request, Response } from 'express';
import { getDb } from '../database/db';
import { emitGlobal } from '../services/socketService';

export async function getBedsNeedingCleaning(req: Request, res: Response) {
  try {
    const db = await getDb();
    const beds = await db.all(
      `SELECT b.*, w.name as ward_name, w.floor, cr.id as cleaning_record_id, cr.started_at, cr.notes as cleaning_notes
       FROM beds b
       JOIN wards w ON b.ward_id = w.id
       LEFT JOIN cleaning_records cr ON b.id = cr.bed_id AND cr.completed_at IS NULL
       WHERE b.status = 'Under Cleaning' OR b.status = 'Waiting for Inspection'`
    );
    return res.json(beds);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function startCleaning(req: Request, res: Response) {
  try {
    const bedId = req.params.id;
    const user = (req as any).user;
    const db = await getDb();

    await db.run(
      `UPDATE cleaning_records SET assigned_to = ?, started_at = CURRENT_TIMESTAMP WHERE bed_id = ? AND completed_at IS NULL`,
      [user?.id || 6, bedId]
    );

    return res.json({ message: 'Cleaning in progress', bed_id: bedId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function completeCleaning(req: Request, res: Response) {
  try {
    const bedId = req.params.id;
    const { notes } = req.body;
    const user = (req as any).user;
    const db = await getDb();

    // Mark bed as Available & update last_cleaned_at
    await db.run(
      `UPDATE beds 
       SET status = 'Available', last_cleaned_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [bedId]
    );

    // Update cleaning record
    await db.run(
      `UPDATE cleaning_records 
       SET completed_at = CURRENT_TIMESTAMP, inspection_status = 'PASSED', notes = COALESCE(?, notes)
       WHERE bed_id = ? AND completed_at IS NULL`,
      [notes || 'Sanitization completed and verified ready for patient intake', bedId]
    );

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
       VALUES (?, 'CLEANING_COMPLETED', 'BED', ?, 'Under Cleaning', 'Available')`,
      [user?.id || 6, bedId]
    );

    emitGlobal('bed_cleaning_completed', { bed_id: bedId, status: 'Available' });

    return res.json({ message: 'Bed cleaned, sanitized, and set to Available', bed_id: bedId, status: 'Available' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
