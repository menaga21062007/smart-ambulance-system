import { Request, Response } from 'express';
import { getDb } from '../database/db';
import { emitGlobal } from '../services/socketService';

export async function getTrafficSignals(req: Request, res: Response) {
  try {
    const db = await getDb();
    const signals = await db.all('SELECT * FROM traffic_signals');
    return res.json(signals);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function overrideSignalStatus(req: Request, res: Response) {
  try {
    const signalId = req.params.id;
    const { current_status, emergency_mode, notes } = req.body;
    const user = (req as any).user;
    const db = await getDb();

    const signal = await db.get('SELECT * FROM traffic_signals WHERE id = ?', [signalId]);
    if (!signal) {
      return res.status(404).json({ error: 'Traffic signal not found' });
    }

    const newStatus = current_status || signal.current_status;
    const newEmergencyMode = emergency_mode !== undefined ? (emergency_mode ? 1 : 0) : signal.emergency_mode;

    await db.run(
      `UPDATE traffic_signals 
       SET current_status = ?, emergency_mode = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [newStatus, newEmergencyMode, signalId]
    );

    // Audit log
    await db.run(
      `INSERT INTO signal_priority_events (signal_id, ambulance_id, approved_at, status, approved_by, notes)
       VALUES (?, 1, CURRENT_TIMESTAMP, ?, ?, ?)`,
      [signalId, newEmergencyMode ? 'MANUALLY_OVERRIDDEN' : 'RESET_TO_NORMAL', user?.id || 7, notes || `Manual operator override to ${newStatus}`]
    );

    emitGlobal('traffic_signal_updated', {
      signal_id: Number(signalId),
      current_status: newStatus,
      emergency_mode: newEmergencyMode
    });

    return res.json({
      message: 'Signal updated successfully',
      signal_id: Number(signalId),
      current_status: newStatus,
      emergency_mode: newEmergencyMode
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getSignalHistory(req: Request, res: Response) {
  try {
    const db = await getDb();
    const history = await db.all(
      `SELECT spe.*, ts.name as signal_name, a.vehicle_number, u.name as operator_name
       FROM signal_priority_events spe
       JOIN traffic_signals ts ON spe.signal_id = ts.id
       LEFT JOIN ambulances a ON spe.ambulance_id = a.id
       LEFT JOIN users u ON spe.approved_by = u.id
       ORDER BY spe.requested_at DESC LIMIT 50`
    );
    return res.json(history);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
