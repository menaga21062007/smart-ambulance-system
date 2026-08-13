import { getDb } from '../database/db';

export interface PatientDetails {
  id: number;
  name?: string;
  age?: number;
  gender?: string;
  triage_level: string;
  symptoms?: string;
  required_equipment?: string;
  isolation_required?: boolean;
}

export interface BedRecommendationResult {
  bed_id: number;
  bed_number: string;
  bed_type: string;
  ward_id: number;
  ward_name: string;
  ward_type: string;
  floor: string;
  hospital_id: number;
  score: number;
  match_reason: string;
  missing_requirements: string[];
  equipment: string;
  isolation_capable: boolean;
}

export async function recommendBedsForPatient(
  hospitalId: number,
  patient: PatientDetails
): Promise<{ primary: BedRecommendationResult | null; alternatives: BedRecommendationResult[]; warning?: string }> {
  const db = await getDb();

  // Fetch all Available beds in the target hospital
  const beds = await db.all(
    `SELECT b.*, w.name as ward_name, w.ward_type, w.floor, w.hospital_id
     FROM beds b
     JOIN wards w ON b.ward_id = w.id
     WHERE w.hospital_id = ? AND b.status = 'Available'`,
    [hospitalId]
  );

  if (!beds || beds.length === 0) {
    // Check alternative hospitals nearby
    const altHospitals = await db.all(
      `SELECT h.id, h.name, COUNT(b.id) as available_beds
       FROM hospitals h
       JOIN wards w ON w.hospital_id = h.id
       JOIN beds b ON b.ward_id = w.id
       WHERE h.id != ? AND b.status = 'Available'
       GROUP BY h.id`,
      [hospitalId]
    );

    return {
      primary: null,
      alternatives: [],
      warning: `No available beds in selected hospital. Nearby hospitals with beds: ${
        altHospitals.map((h: any) => `${h.name} (${h.available_beds} beds free)`).join(', ') || 'None'
      }`
    };
  }

  const scoredBeds: BedRecommendationResult[] = beds.map((bed: any) => {
    let score = 50; // Base score
    const matchReasons: string[] = [];
    const missingRequirements: string[] = [];

    // Triage Level Matching
    if (patient.triage_level === 'Critical/Red') {
      if (bed.ward_type === 'ICU' || bed.bed_type === 'ICU bed') {
        score += 40;
        matchReasons.push('Optimal ICU bed for Critical/Red patient');
      } else if (bed.ward_type === 'Emergency') {
        score += 25;
        matchReasons.push('Emergency Ward bed for immediate critical stabilization');
      }
    } else if (patient.triage_level === 'Urgent/Yellow') {
      if (bed.ward_type === 'Emergency' || bed.ward_type === 'General') {
        score += 35;
        matchReasons.push('Suitable Emergency/General bed for Urgent patient');
      }
    } else if (patient.triage_level === 'Moderate/Green' || patient.triage_level === 'Non-Urgent') {
      if (bed.ward_type === 'General') {
        score += 35;
        matchReasons.push('Standard General Ward bed');
      }
    }

    // Equipment Matching (e.g. Ventilator, Oxygen)
    const requiredEqs = patient.required_equipment ? patient.required_equipment.toLowerCase().split(',').map(s => s.trim()) : [];
    const bedEqs = bed.required_equipment ? bed.required_equipment.toLowerCase() : '';

    for (const req of requiredEqs) {
      if (req && bedEqs.includes(req)) {
        score += 15;
        matchReasons.push(`Equipped with requested ${req}`);
      } else if (req) {
        score -= 10;
        missingRequirements.push(req);
      }
    }

    // Isolation Capability Matching
    if (patient.isolation_required) {
      if (bed.isolation_capable === 1) {
        score += 30;
        matchReasons.push('Has negative-pressure isolation capability');
      } else {
        score -= 40;
        missingRequirements.push('Isolation room setup');
      }
    }

    // Floor / Proximity bonus (Ground/1st Floor = quicker ER access)
    if (bed.floor.includes('1st') || bed.floor.includes('Ground')) {
      score += 10;
      matchReasons.push('Located on lower floor close to Emergency ER entrance');
    }

    return {
      bed_id: bed.id,
      bed_number: bed.bed_number,
      bed_type: bed.bed_type,
      ward_id: bed.ward_id,
      ward_name: bed.ward_name,
      ward_type: bed.ward_type,
      floor: bed.floor,
      hospital_id: bed.hospital_id,
      score,
      match_reason: matchReasons.join('. ') || 'Available general bed match',
      missing_requirements: missingRequirements,
      equipment: bed.required_equipment || 'Standard',
      isolation_capable: bed.isolation_capable === 1
    };
  });

  // Sort by score descending
  scoredBeds.sort((a, b) => b.score - a.score);

  return {
    primary: scoredBeds[0] || null,
    alternatives: scoredBeds.slice(1, 5)
  };
}
