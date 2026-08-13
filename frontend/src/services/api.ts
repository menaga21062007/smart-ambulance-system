import { User, Hospital, Bed, EmergencyRequest, TrafficSignal, Resource, SystemNotification, BedRecommendation } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token') || 'demo-token-carelink';
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Server Error (${res.status}): ${text.slice(0, 120)}`);
    }
    return text;
  }

  if (!res.ok) {
    throw new Error(data.error || 'An API error occurred');
  }
  return data;
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  getDemoAccounts: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return handleResponse(res);
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Hospitals & Beds
  getHospitals: async (): Promise<Hospital[]> => {
    const res = await fetch(`${API_BASE}/hospitals`);
    return handleResponse(res);
  },

  getHospitalBeds: async (hospitalId: number): Promise<Bed[]> => {
    const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/beds`);
    return handleResponse(res);
  },

  updateBedStatus: async (bedId: number, status: string, notes?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/beds/${bedId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, notes })
    });
    return handleResponse(res);
  },

  getHospitalResources: async (hospitalId: number): Promise<Resource[]> => {
    const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/resources`);
    return handleResponse(res);
  },

  updateResource: async (resourceId: number, available_quantity: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/resources/${resourceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ available_quantity })
    });
    return handleResponse(res);
  },

  // Ambulances & Location
  getAmbulances: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/ambulances`);
    return handleResponse(res);
  },

  updateAmbulanceLocation: async (ambulanceId: number, latitude: number, longitude: number, status?: string, emergency_request_id?: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/ambulances/${ambulanceId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ latitude, longitude, status, emergency_request_id })
    });
    return handleResponse(res);
  },

  // Emergency & Workflows
  createEmergencyRequest: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/emergency-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  getEmergencyRequests: async (): Promise<EmergencyRequest[]> => {
    const res = await fetch(`${API_BASE}/emergency-requests`);
    return handleResponse(res);
  },

  getBedRecommendations: async (requestId: number): Promise<{ primary: BedRecommendation; alternatives: BedRecommendation[]; warning?: string }> => {
    const res = await fetch(`${API_BASE}/emergency-requests/${requestId}/recommended-beds`);
    return handleResponse(res);
  },

  reserveBed: async (bed_id: number, patient_id: number, emergency_request_id?: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/bed-reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ bed_id, patient_id, emergency_request_id })
    });
    return handleResponse(res);
  },

  confirmAdmission: async (patient_id: number, bed_id: number, attending_doctor?: string, notes?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ patient_id, bed_id, attending_doctor, notes })
    });
    return handleResponse(res);
  },

  processDischarge: async (patient_id: number, bed_id: number, discharge_type?: string, notes?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/discharges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ patient_id, bed_id, discharge_type, notes })
    });
    return handleResponse(res);
  },

  // Traffic Signals
  getTrafficSignals: async (): Promise<TrafficSignal[]> => {
    const res = await fetch(`${API_BASE}/traffic-signals`);
    return handleResponse(res);
  },

  overrideSignal: async (signalId: number, current_status: string, emergency_mode: boolean): Promise<any> => {
    const res = await fetch(`${API_BASE}/traffic-signals/${signalId}/override`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ current_status, emergency_mode })
    });
    return handleResponse(res);
  },

  getSignalHistory: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/traffic-signals/history`);
    return handleResponse(res);
  },

  // Cleaning Workflow
  getBedsNeedingCleaning: async (): Promise<Bed[]> => {
    const res = await fetch(`${API_BASE}/cleaning/beds`);
    return handleResponse(res);
  },

  startCleaning: async (bedId: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/beds/${bedId}/start-cleaning`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  completeCleaning: async (bedId: number, notes?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/beds/${bedId}/complete-cleaning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ notes })
    });
    return handleResponse(res);
  },

  // Reports
  getAnalyticsSummary: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/reports/analytics`);
    return handleResponse(res);
  }
};
