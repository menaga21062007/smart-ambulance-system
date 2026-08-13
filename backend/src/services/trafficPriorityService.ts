import { getDb } from '../database/db';
import { CONFIG } from '../config';

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export async function processAmbulanceTrafficProximity(
  ambulanceId: number,
  latitude: number,
  longitude: number,
  emergencyRequestId?: number
): Promise<{ triggeredSignals: any[]; activeSignals: any[] }> {
  const db = await getDb();
  const signals = await db.all('SELECT * FROM traffic_signals');

  const triggeredSignals: any[] = [];

  for (const signal of signals) {
    const distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      signal.latitude,
      signal.longitude
    );

    // If within emergency radius threshold (e.g. 500 meters) and not already in emergency mode
    if (distanceMeters <= CONFIG.SIGNAL_EMERGENCY_RADIUS_METERS) {
      if (signal.emergency_mode === 0 || signal.current_status !== 'GREEN') {
        // Activate Emergency Priority
        await db.run(
          `UPDATE traffic_signals 
           SET current_status = 'GREEN', emergency_mode = 1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [signal.id]
        );

        // Record Priority Event
        await db.run(
          `INSERT INTO signal_priority_events (signal_id, ambulance_id, emergency_request_id, approved_at, status, notes)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'AUTO_APPROVED', ?)`,
          [signal.id, ambulanceId, emergencyRequestId || null, `Auto-triggered green priority (Distance: ${Math.round(distanceMeters)}m)`]
        );

        triggeredSignals.push({
          ...signal,
          current_status: 'GREEN',
          emergency_mode: 1,
          distance_meters: Math.round(distanceMeters)
        });
      }
    } else if (distanceMeters > CONFIG.SIGNAL_EMERGENCY_RADIUS_METERS + 200 && signal.emergency_mode === 1) {
      // Ambulance passed the signal -> Reset back to normal RED/cycle
      await db.run(
        `UPDATE traffic_signals 
         SET current_status = 'RED', emergency_mode = 0, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [signal.id]
      );
    }
  }

  const updatedSignals = await db.all('SELECT * FROM traffic_signals');
  return { triggeredSignals, activeSignals: updatedSignals };
}
