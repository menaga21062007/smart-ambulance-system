import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDb } from '../database/db';

export async function resetMapDemoData(req: AuthRequest, res: Response) {
  try {
    const db = await getDb();

    // Clear map & signal simulation tables only
    await db.run('DELETE FROM ambulance_locations');
    await db.run('DELETE FROM ambulance_signal_requests');
    await db.run('DELETE FROM signal_priority_events');

    // Reset traffic signals to default normal state
    await db.run(
      `UPDATE traffic_signals 
       SET current_status = 'RED', emergency_mode = 0, updated_at = CURRENT_TIMESTAMP`
    );

    // Audit log entry
    await db.run(
      `INSERT INTO audit_logs (user_id, action, entity_type, new_value)
       VALUES (?, 'RESET_MAP_DEMO_DATA', 'SYSTEM_MAP', 'Map tracking history, active signal requests, and demo routes reset by Administrator')`,
      [req.user?.id || 1]
    );

    res.json({
      message: 'Map demonstration data reset successfully. Patient, hospital, bed, resource, and user records preserved.',
      reset_at: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: `Failed to reset map demonstration data: ${error.message}` });
  }
}
