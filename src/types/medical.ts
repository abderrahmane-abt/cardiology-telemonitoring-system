export type VitalStatus = 
  | 'NORMAL'
  | 'TACHYCARDIE'
  | 'BRADYCARDIE'
  | 'TACHYPNEE'
  | 'BRADYPNEE'
  | 'CHUTE_DETECTEE'
  | 'MALAISE_IMMINENT'
  | 'DOIGT_NON_DETECTE';

export interface VitalSigns {
  bpm: number;
  resp: number;
  spo2?: number;
  finger: boolean;
  motion: number; // in g
  fallAlert: boolean;
  status: VitalStatus;
  timestamp: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'F' | 'M';

export interface PatientProfile {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  dateNaissance: string;
  genre: Gender;
  taille: number; // in cm
  poids: number; // in kg
  groupeSanguin: BloodGroup;
  isPregnant: boolean;
  semainesAmenorrhee?: number; // SA if pregnant
  antecedents: string[];
  traitements: string[];
  medecinRef: string;
  notesCliniques: string;
  adresse: string;
  telephone: string;
}

export interface EmergencyContact {
  id: string;
  role: 'MEDECIN' | 'PROCHE' | 'SAMU' | 'POMPIERS';
  nom: string;
  details: string; // e.g. "Cardiologue référent - CHU", "Époux"
  telephone: string;
  email?: string;
  priorite: number;
}

export interface MeasurementRecord {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  bpm: number;
  resp: number;
  motion: number;
  status: VitalStatus;
  finger: boolean;
  anomalyDetected: boolean;
  notes?: string;
}

export interface DayStats {
  date: string;
  avgBpm: number;
  minBpm: number;
  maxBpm: number;
  avgResp: number;
  minResp: number;
  maxResp: number;
  totalAlerts: number;
  durationMinutes: number;
}

export interface HardwareInfo {
  esp32Status: 'CONNECTED' | 'DISCONNECTED';
  port: string;
  baudRate: number;
  batteryPct: number;
  batteryVoltage: number;
  i2cOled: boolean;
  i2cMax30102: boolean;
  i2cMpu6050: boolean;
}
