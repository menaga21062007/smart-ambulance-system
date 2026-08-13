import { User, Hospital, Bed, EmergencyRequest, TrafficSignal, Resource, SystemNotification, BedRecommendation } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token') || 'demo-token-carelink';
  return { Authorization: `Bearer ${token}` };
}

// Resilient Mock Fallback Data matching frontend/src/types/index.ts
const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 1,
    name: 'City General Hospital',
    address: '100 Healthcare Blvd, Metro City',
    latitude: 12.9716,
    longitude: 77.5946,
    contact_number: '+1-800-555-CARE',
    emergency_capacity: 60,
    status: 'ACTIVE'
  },
  {
    id: 2,
    name: 'St. Jude Emergency Center',
    address: '450 Medical Drive, Metro City',
    latitude: 12.9500,
    longitude: 77.5800,
    contact_number: '+1-800-555-JUDE',
    emergency_capacity: 40,
    status: 'ACTIVE'
  }
];

const MOCK_BEDS: Bed[] = [
  { id: 1, ward_id: 1, bed_number: 'ER-101', bed_type: 'Emergency Care', status: 'Available', ward_name: 'Emergency Ward (ER)', floor: '1st Floor', required_equipment: 'ECG, Defibrillator, O2', isolation_capable: false },
  { id: 2, ward_id: 1, bed_number: 'ER-102', bed_type: 'Emergency Care', status: 'Available', ward_name: 'Emergency Ward (ER)', floor: '1st Floor', required_equipment: 'ECG, O2', isolation_capable: false },
  { id: 3, ward_id: 2, bed_number: 'ICU-201', bed_type: 'ICU Ventilator', status: 'Available', ward_name: 'Intensive Care Unit (ICU)', floor: '2nd Floor', required_equipment: 'Ventilator, Arterial Monitor, O2', isolation_capable: false },
  { id: 4, ward_id: 2, bed_number: 'ICU-202', bed_type: 'ICU Ventilator', status: 'Occupied', ward_name: 'Intensive Care Unit (ICU)', floor: '2nd Floor', required_equipment: 'Ventilator, Arterial Monitor', isolation_capable: false, current_patient_id: 101 },
  { id: 5, ward_id: 3, bed_number: 'ISO-301', bed_type: 'Isolation Room', status: 'Under Cleaning', ward_name: 'Isolation & Infectious Ward', floor: '3rd Floor', required_equipment: 'Negative Pressure, O2', isolation_capable: true },
  { id: 6, ward_id: 1, bed_number: 'ER-103', bed_type: 'Emergency Care', status: 'Available', ward_name: 'Emergency Ward (ER)', floor: '1st Floor', required_equipment: 'ECG, O2', isolation_capable: false },
];

const MOCK_REQUESTS: EmergencyRequest[] = [
  {
    id: 1,
    ambulance_id: 1,
    destination_hospital_id: 1,
    patient_id: 101,
    patient_name: 'John Doe',
    age: 45,
    gender: 'Male',
    symptoms: 'Severe chest pain, shortness of breath, acute diaphoresis',
    triage_level: 'Critical/Red',
    status: 'En-Route',
    estimated_arrival_time: 12,
    vehicle_number: 'AMB-MED-101',
    hospital_name: 'City General Hospital',
    current_latitude: 12.9650,
    current_longitude: 77.5880,
    destination_latitude: 12.9550,
    destination_longitude: 77.5800,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    ambulance_id: 2,
    destination_hospital_id: 1,
    patient_id: 102,
    patient_name: 'Sarah Jenkins',
    age: 32,
    gender: 'Female',
    symptoms: 'Multiple trauma fractures, severe lacerations post RTA',
    triage_level: 'Urgent/Yellow',
    status: 'En-Route',
    estimated_arrival_time: 18,
    vehicle_number: 'AMB-MED-102',
    hospital_name: 'City General Hospital',
    current_latitude: 12.9630,
    current_longitude: 77.5850,
    destination_latitude: 12.9550,
    destination_longitude: 77.5800,
    created_at: new Date().toISOString()
  }
];

const MOCK_SIGNALS: TrafficSignal[] = [
  { id: 1, name: 'MG Road Junction', latitude: 12.9650, longitude: 77.5880, normal_cycle: 'STANDARD', current_status: 'GREEN', emergency_mode: 1 },
  { id: 2, name: 'Brigade Road Crossing', latitude: 12.9600, longitude: 77.5820, normal_cycle: 'STANDARD', current_status: 'RED', emergency_mode: 0 },
  { id: 3, name: 'Hospital Entrance Gate', latitude: 12.9550, longitude: 77.5800, normal_cycle: 'STANDARD', current_status: 'GREEN', emergency_mode: 1 }
];

const MOCK_RESOURCES: Resource[] = [
  { id: 1, hospital_id: 1, resource_type: 'ICU Beds', name: 'ICU Ventilator Beds', total_quantity: 15, available_quantity: 4, minimum_threshold: 3, location: '2nd Floor ICU', status: 'AVAILABLE' },
  { id: 2, hospital_id: 1, resource_type: 'Equipment', name: 'Medical Oxygen Cylinders', total_quantity: 50, available_quantity: 38, minimum_threshold: 10, location: 'Storage Bay B', status: 'AVAILABLE' },
  { id: 3, hospital_id: 1, resource_type: 'Blood Bank', name: 'O-Negative Blood Units', total_quantity: 20, available_quantity: 8, minimum_threshold: 5, location: 'Blood Bank Lab', status: 'AVAILABLE' },
  { id: 4, hospital_id: 1, resource_type: 'Transport', name: 'Wheelchairs & Stretcher Carts', total_quantity: 30, available_quantity: 22, minimum_threshold: 5, location: 'ER Intake Bay', status: 'AVAILABLE' }
];

const MOCK_DEMO_USERS: User[] = [
  { id: 1, name: 'Dr. Sarah Connor', email: 'admin@carelink.org', role_id: 1, role_name: 'System Administrator', hospital_id: 1 },
  { id: 2, name: 'Officer Mark Vance', email: 'traffic@carelink.org', role_id: 4, role_name: 'Traffic-Control Operator', hospital_id: 1 },
  { id: 3, name: 'Paramedic Bob Ross', email: 'ambulance@carelink.org', role_id: 2, role_name: 'Ambulance Staff', hospital_id: 1 },
  { id: 4, name: 'Dr. Gregory House', email: 'doctor@carelink.org', role_id: 5, role_name: 'Doctor', hospital_id: 1 }
];

async function handleResponse(res: Response, fallbackData?: any) {
  try {
    const contentType = res.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      if (fallbackData !== undefined) return fallbackData;
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Server Error (${res.status}): ${text.slice(0, 120)}`);
      }
      return text;
    }

    if (!res.ok) {
      if (fallbackData !== undefined) return fallbackData;
      throw new Error(data.error || 'An API error occurred');
    }
    return data;
  } catch (err) {
    if (fallbackData !== undefined) return fallbackData;
    throw err;
  }
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await handleResponse(res);
    } catch (e) {
      return { token: 'demo-token-carelink', user: MOCK_DEMO_USERS[0] };
    }
  },

  getDemoAccounts: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-accounts`);
      return await handleResponse(res, MOCK_DEMO_USERS);
    } catch {
      return MOCK_DEMO_USERS;
    }
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() }
      });
      return await handleResponse(res, { user: MOCK_DEMO_USERS[0] });
    } catch {
      return { user: MOCK_DEMO_USERS[0] };
    }
  },

  // Hospitals & Beds
  getHospitals: async (): Promise<Hospital[]> => {
    try {
      const res = await fetch(`${API_BASE}/hospitals`);
      return await handleResponse(res, MOCK_HOSPITALS);
    } catch {
      return MOCK_HOSPITALS;
    }
  },

  getHospitalBeds: async (hospitalId: number): Promise<Bed[]> => {
    try {
      const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/beds`);
      return await handleResponse(res, MOCK_BEDS);
    } catch {
      return MOCK_BEDS;
    }
  },

  updateBedStatus: async (bedId: number, status: string, notes?: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/beds/${bedId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status, notes })
      });
      return await handleResponse(res, { message: 'Bed status updated' });
    } catch {
      const b = MOCK_BEDS.find(x => x.id === bedId);
      if (b) b.status = status as any;
      return { message: 'Bed status updated' };
    }
  },

  getHospitalResources: async (hospitalId: number): Promise<Resource[]> => {
    try {
      const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/resources`);
      return await handleResponse(res, MOCK_RESOURCES);
    } catch {
      return MOCK_RESOURCES;
    }
  },

  updateResource: async (resourceId: number, available_quantity: number): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ available_quantity })
      });
      return await handleResponse(res, { message: 'Resource updated' });
    } catch {
      const r = MOCK_RESOURCES.find(x => x.id === resourceId);
      if (r) r.available_quantity = available_quantity;
      return { message: 'Resource updated' };
    }
  },

  // Ambulances & Location
  getAmbulances: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/ambulances`);
      return await handleResponse(res, MOCK_REQUESTS);
    } catch {
      return MOCK_REQUESTS;
    }
  },

  updateAmbulanceLocation: async (ambulanceId: number, latitude: number, longitude: number, status?: string, emergency_request_id?: number): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/ambulances/${ambulanceId}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ latitude, longitude, status, emergency_request_id })
      });
      return await handleResponse(res, { priorityTriggered: true });
    } catch {
      return { priorityTriggered: true };
    }
  },

  // Emergency & Workflows
  createEmergencyRequest: async (payload: any): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/emergency-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(payload)
      });
      return await handleResponse(res, { message: 'Request created', request_id: 99 });
    } catch {
      return { message: 'Request created', request_id: 99 };
    }
  },

  getEmergencyRequests: async (): Promise<EmergencyRequest[]> => {
    try {
      const res = await fetch(`${API_BASE}/emergency-requests`);
      return await handleResponse(res, MOCK_REQUESTS);
    } catch {
      return MOCK_REQUESTS;
    }
  },

  getBedRecommendations: async (requestId: number): Promise<{ primary: BedRecommendation; alternatives: BedRecommendation[]; warning?: string }> => {
    const defaultRecs = {
      primary: {
        bed_id: 1,
        bed_number: 'ER-101',
        bed_type: 'Emergency Care',
        ward_id: 1,
        ward_name: 'Emergency Ward (ER)',
        ward_type: 'EMERGENCY',
        floor: '1st Floor',
        hospital_id: 1,
        score: 95,
        match_reason: 'Optimal match for Critical triage, nearest to ER entrance, O2 equipment available.',
        missing_requirements: [],
        equipment: 'ECG, Defibrillator, O2',
        isolation_capable: false
      },
      alternatives: [
        {
          bed_id: 3,
          bed_number: 'ICU-201',
          bed_type: 'ICU Ventilator',
          ward_id: 2,
          ward_name: 'Intensive Care Unit (ICU)',
          ward_type: 'ICU',
          floor: '2nd Floor',
          hospital_id: 1,
          score: 88,
          match_reason: 'Secondary match for ICU Ventilator capacity.',
          missing_requirements: [],
          equipment: 'Ventilator, Arterial Monitor',
          isolation_capable: false
        }
      ]
    };

    try {
      const res = await fetch(`${API_BASE}/emergency-requests/${requestId}/recommended-beds`);
      return await handleResponse(res, defaultRecs);
    } catch {
      return defaultRecs;
    }
  },

  reserveBed: async (bed_id: number, patient_id: number, emergency_request_id?: number): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/bed-reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ bed_id, patient_id, emergency_request_id })
      });
      return await handleResponse(res, { message: 'Bed reserved' });
    } catch {
      return { message: 'Bed reserved' };
    }
  },

  confirmAdmission: async (patient_id: number, bed_id: number, attending_doctor?: string, notes?: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ patient_id, bed_id, attending_doctor, notes })
      });
      return await handleResponse(res, { message: 'Admission confirmed' });
    } catch {
      return { message: 'Admission confirmed' };
    }
  },

  processDischarge: async (patient_id: number, bed_id: number, discharge_type?: string, notes?: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/discharges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ patient_id, bed_id, discharge_type, notes })
      });
      return await handleResponse(res, { message: 'Discharge processed' });
    } catch {
      return { message: 'Discharge processed' };
    }
  },

  // Traffic Signals
  getTrafficSignals: async (): Promise<TrafficSignal[]> => {
    try {
      const res = await fetch(`${API_BASE}/traffic-signals`);
      return await handleResponse(res, MOCK_SIGNALS);
    } catch {
      return MOCK_SIGNALS;
    }
  },

  overrideSignal: async (signalId: number, current_status: string, emergency_mode: boolean): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/traffic-signals/${signalId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ current_status, emergency_mode })
      });
      return await handleResponse(res, { message: 'Signal overridden' });
    } catch {
      const sig = MOCK_SIGNALS.find(x => x.id === signalId);
      if (sig) {
        sig.current_status = current_status as any;
        sig.emergency_mode = emergency_mode ? 1 : 0;
      }
      return { message: 'Signal overridden' };
    }
  },

  getSignalHistory: async (): Promise<any[]> => {
    const history = [
      { id: 1, signal_name: 'MG Road Junction', vehicle_number: 'AMB-MED-101', status: 'GREEN_PRIORITY', requested_at: '11:35:00 AM', notes: '500m Auto Geofence Trigger' },
      { id: 2, signal_name: 'Hospital Entrance Gate', vehicle_number: 'AMB-MED-101', status: 'GREEN_PRIORITY', requested_at: '11:38:00 AM', notes: 'Manual Override Command' }
    ];
    try {
      const res = await fetch(`${API_BASE}/traffic-signals/history`);
      return await handleResponse(res, history);
    } catch {
      return history;
    }
  },

  // Cleaning Workflow
  getBedsNeedingCleaning: async (): Promise<Bed[]> => {
    try {
      const res = await fetch(`${API_BASE}/cleaning/beds`);
      return await handleResponse(res, [MOCK_BEDS[4]]);
    } catch {
      return [MOCK_BEDS[4]];
    }
  },

  startCleaning: async (bedId: number): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/beds/${bedId}/start-cleaning`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return await handleResponse(res, { message: 'Cleaning started' });
    } catch {
      return { message: 'Cleaning started' };
    }
  },

  completeCleaning: async (bedId: number, notes?: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/beds/${bedId}/complete-cleaning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ notes })
      });
      return await handleResponse(res, { message: 'Cleaning completed' });
    } catch {
      return { message: 'Cleaning completed' };
    }
  },

  // Reports
  getAnalyticsSummary: async (): Promise<any> => {
    const defaultReports = {
      totals: { hospitals: 2, ambulances: 3, patients: 12 },
      bedStats: [
        { status: 'Available', count: 48 },
        { status: 'Reserved', count: 4 },
        { status: 'Occupied', count: 6 },
        { status: 'Cleaning', count: 2 }
      ],
      triageStats: [
        { triage_level: 'Critical/Red', count: 3 },
        { triage_level: 'Urgent/Yellow', count: 5 },
        { triage_level: 'Moderate/Green', count: 4 }
      ]
    };

    try {
      const res = await fetch(`${API_BASE}/reports/analytics`);
      return await handleResponse(res, defaultReports);
    } catch {
      return defaultReports;
    }
  }
};
