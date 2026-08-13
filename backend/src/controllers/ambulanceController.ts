import { Request, Response } from 'express';
import { getDb } from '../database/db';
import { processAmbulanceTrafficProximity } from '../services/trafficPriorityService';
import { emitGlobal, emitToRoom } from '../services/socketService';

export async function getAmbulances(req: Request, res: Response) {
  try {
    const db = await getDb();
    const ambulances = await db.all('SELECT * FROM ambulances');
    return res.json(ambulances);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateAmbulanceLocation(req: Request, res: Response) {
  try {
    const ambulanceId = req.params.id;
    const { latitude, longitude, status, emergency_request_id } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    const db = await getDb();
    await db.run(
      `UPDATE ambulances 
       SET current_latitude = ?, current_longitude = ?, status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [latitude, longitude, status, ambulanceId]
    );

    if (emergency_request_id) {
      await db.run(
        `UPDATE emergency_requests 
         SET current_latitude = ?, current_longitude = ? 
         WHERE id = ?`,
        [latitude, longitude, emergency_request_id]
      );
    }

    // Process traffic proximity trigger
    const proximityResult = await processAmbulanceTrafficProximity(
      Number(ambulanceId),
      latitude,
      longitude,
      emergency_request_id
    );

    const payload = {
      ambulance_id: Number(ambulanceId),
      emergency_request_id,
      latitude,
      longitude,
      status,
      triggered_signals: proximityResult.triggeredSignals,
      updated_at: new Date().toISOString()
    };

    // Emit live location via Socket.IO
    emitGlobal('ambulance_location_feed', payload);

    if (proximityResult.triggeredSignals.length > 0) {
      emitGlobal('traffic_priority_triggered', {
        ambulance_id: Number(ambulanceId),
        signals: proximityResult.triggeredSignals
      });
    }

    return res.json({
      message: 'Location updated successfully',
      ambulance_id: Number(ambulanceId),
      triggered_signals: proximityResult.triggeredSignals
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
