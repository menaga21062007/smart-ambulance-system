export type RoleName =
  | 'System Administrator'
  | 'Ambulance Staff'
  | 'Emergency Hospital Staff'
  | 'Doctor'
  | 'Nurse or Ward Manager'
  | 'Cleaning Staff'
  | 'Traffic-Control Operator';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: RoleName;
  hospital_id?: number;
  hospital_name?: string;
  phone?: string;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  emergency_capacity: number;
  status: string;
}

export interface Ward {
  id: number;
  hospital_id: number;
  name: string;
  ward_type: string;
  floor: string;
  department: string;
}

export type BedStatus =
  | 'Available'
  | 'Reserved'
  | 'Occupied'
  | 'Under Cleaning'
  | 'Out of Service'
  | 'Maintenance'
  | 'Blocked'
  | 'Waiting for Inspection';

export interface Bed {
  id: number;
  ward_id: number;
  ward_name?: string;
  floor?: string;
  bed_number: string;
  bed_type: string;
  status: BedStatus;
  required_equipment?: string;
  isolation_capable: number | boolean;
  current_patient_id?: number;
  patient_name?: string;
  last_cleaned_at?: string;
  updated_at?: string;
}

export type TriageLevel =
  | 'Critical/Red'
  | 'Urgent/Yellow'
  | 'Moderate/Green'
  | 'Non-Urgent'
  | 'Unknown';

export interface Patient {
  id: number;
  name?: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  allergies?: string;
  existing_conditions?: string;
  symptoms: string;
  emergency_type: string;
  triage_level?: TriageLevel;
}

export interface Ambulance {
  id: number;
  vehicle_number: string;
  driver_name: string;
  contact_number: string;
  current_latitude: number;
  current_longitude: number;
  gps_enabled: number | boolean;
  status: 'Available' | 'On Route' | 'Arrived' | 'Completed';
  updated_at?: string;
}

export interface EmergencyRequest {
  id: number;
  patient_id: number;
  patient_name?: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  symptoms?: string;
  emergency_type?: string;
  triage_level?: TriageLevel;
  ambulance_id: number;
  vehicle_number?: string;
  destination_hospital_id: number;
  hospital_name?: string;
  current_latitude: number;
  current_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  estimated_arrival_time: number;
  status: string;
  created_at: string;
}

export interface TrafficSignal {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  normal_cycle: string;
  current_status: 'RED' | 'YELLOW' | 'GREEN';
  emergency_mode: number | boolean;
  distance_meters?: number;
  updated_at?: string;
}

export interface Resource {
  id: number;
  hospital_id: number;
  name: string;
  resource_type: string;
  total_quantity: number;
  available_quantity: number;
  minimum_threshold: number;
  location: string;
  status: string;
}

export interface SystemNotification {
  id: number;
  hospital_id?: number;
  type: string;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  created_at: string;
}

export interface BedRecommendation {
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
