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

export function calculateApproachDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): 'North' | 'South' | 'East' | 'West' {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  if (Math.abs(dLat) > Math.abs(dLon)) {
    return dLat > 0 ? 'North' : 'South';
  } else {
    return dLon > 0 ? 'East' : 'West';
  }
}

export async function processAmbulanceTrafficProximity(
  ambulanceId: number,
  latitude: number,
  longitude: number,
  accuracy: number = 10,
  emergencyRequestId?: number,
  triageLevel: string = 'Critical/Red'
): Promise<{ triggeredSignals: any[]; activeSignals: any[]; requests: any[] }> {
  const db = await getDb();
  const signals = await db.all('SELECT * FROM traffic_signals');
  const triggeredSignals: any[] = [];
  const processedRequests: any[] = [];

  // Log location update
  await db.run(
    `INSERT INTO ambulance_locations (ambulance_id, emergency_request_id, latitude, longitude, accuracy, recorded_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [ambulanceId, emergencyRequestId || null, latitude, longitude, accuracy]
  );

  for (const signal of signals) {
    const distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      signal.latitude,
      signal.longitude
    );

    const direction = calculateApproachDirection(
      latitude,
      longitude,
      signal.latitude,
      signal.longitude
    );

    // Rule 1: GPS Accuracy check
    if (accuracy > 30) {
      await db.run(
        `INSERT INTO ambulance_signal_requests 
         (ambulance_id, emergency_request_id, traffic_signal_id, distance_in_meters, approach_direction, patient_priority, gps_accuracy, status, safety_block_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'SAFETY_BLOCKED', 'GPS accuracy exceeds 30m threshold')`,
        [ambulanceId, emergencyRequestId || null, signal.id, distanceMeters, direction, triageLevel, accuracy]
      );
      continue;
    }

    // Determine configured threshold based on triage
    let thresholdMeters = 300; // Default Critical
    if (triageLevel.includes('Yellow') || triageLevel.includes('Urgent')) {
      thresholdMeters = 250;
    } else if (triageLevel.includes('Green') || triageLevel.includes('Moderate') || triageLevel.includes('Non-Urgent')) {
      // Moderate/Non-Urgent do not trigger automatic priority
      continue;
    }

    // Rule 2: Proximity Check
    if (distanceMeters <= thresholdMeters) {
      // Check for conflicting active priority at same signal
      const existingActive = await db.get(
        `SELECT * FROM ambulance_signal_requests 
         WHERE traffic_signal_id = ? AND status IN ('AUTO_APPROVED', 'ACTIVE', 'AMBULANCE_PRIORITY_ACTIVE') AND ambulance_id != ?`,
        [signal.id, ambulanceId]
      );

      if (existingActive) {
        // Multi-ambulance conflict handling: Queue lower priority
        await db.run(
          `INSERT INTO ambulance_signal_requests 
           (ambulance_id, emergency_request_id, traffic_signal_id, distance_in_meters, approach_direction, patient_priority, gps_accuracy, status, auto_approval_reason)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFLICT_QUEUED', 'Queued: Conflicting higher-priority active at signal')`,
          [ambulanceId, emergencyRequestId || null, signal.id, distanceMeters, direction, triageLevel, accuracy]
        );
        continue;
      }

      // Auto-Activate Signal Priority
      await db.run(
        `UPDATE traffic_signals 
         SET current_status = 'GREEN', emergency_mode = 1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [signal.id]
      );

      // Record Auto-Approved Request
      const autoReason = `Auto-Activated: ${triageLevel} triage within ${Math.round(distanceMeters)}m (${direction} Bound)`;
      const result = await db.run(
        `INSERT INTO ambulance_signal_requests 
         (ambulance_id, emergency_request_id, traffic_signal_id, distance_in_meters, approach_direction, patient_priority, gps_accuracy, status, auto_approval_reason, validation_result, activated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'AMBULANCE_PRIORITY_ACTIVE', ?, 'VALIDATED_OK', CURRENT_TIMESTAMP)`,
        [ambulanceId, emergencyRequestId || null, signal.id, distanceMeters, direction, triageLevel, accuracy, autoReason]
      );

      // Audit Log
      await db.run(
        `INSERT INTO audit_logs (action, entity_type, entity_id, new_value)
         VALUES ('AUTO_SIGNAL_PRIORITY_ACTIVATED', 'traffic_signals', ?, ?)`,
        [signal.id, `Activated green entry priority for Ambulance #${ambulanceId} (${Math.round(distanceMeters)}m)`]
      );

      triggeredSignals.push({
        ...signal,
        current_status: 'GREEN',
        emergency_mode: 1,
        distance_meters: Math.round(distanceMeters),
        approach_direction: direction
      });

      processedRequests.push({
        id: result.lastID,
        signal_id: signal.id,
        status: 'AMBULANCE_PRIORITY_ACTIVE',
        reason: autoReason
      });

    } else if (distanceMeters > thresholdMeters + 150 && signal.emergency_mode === 1) {
      // Ambulance passed the signal -> Auto reset to Normal
      await db.run(
        `UPDATE traffic_signals 
         SET current_status = 'RED', emergency_mode = 0, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [signal.id]
      );

      await db.run(
        `UPDATE ambulance_signal_requests 
         SET status = 'PASSED', completed_at = CURRENT_TIMESTAMP 
         WHERE traffic_signal_id = ? AND ambulance_id = ? AND status = 'AMBULANCE_PRIORITY_ACTIVE'`,
        [signal.id, ambulanceId]
      );
    }
  }

  const updatedSignals = await db.all('SELECT * FROM traffic_signals');
  const recentRequests = await db.all('SELECT * FROM ambulance_signal_requests ORDER BY id DESC LIMIT 10');

  return { triggeredSignals, activeSignals: updatedSignals, requests: recentRequests };
}
