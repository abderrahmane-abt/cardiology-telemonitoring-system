import type { PatientProfile, EmergencyContact, MeasurementRecord, HardwareInfo } from '../types/medical';

export const initialPatient: PatientProfile = {
  id: 'PAT-2026-089',
  nom: 'El Amrani',
  prenom: 'Amina',
  age: 28,
  dateNaissance: '1998-04-12',
  genre: 'F',
  taille: 168,
  poids: 64,
  groupeSanguin: 'O+',
  isPregnant: true,
  semainesAmenorrhee: 26,
  antecedents: [
    'Malaise vagal orthostatique récurrent',
    'Anémie ferriprive modérée (Hb 10.8 g/dL)',
    'Épisode de tachycardie sinusale réactionnelle au T2'
  ],
  traitements: [
    'Tardyferon B9 (Fer + Folates) : 1 cp le matin',
    'Magnésium B6 : 2 cp / jour',
    'Bas de contention classe 2 en position debout'
  ],
  medecinRef: 'Dr. H. Radi (Cardiologie & Médecine Interne)',
  notesCliniques: 'Grossesse évolutive à 26 SA. Débit cardiaque majoré de 40%. Éviter le décubitus dorsal prolongé afin de prévenir la compression de la veine cave inférieure et la syncope vagale positionnelle.',
  adresse: '142 Boulevard d\'Anfa, Résidence Al Manar, Casablanca',
  telephone: '+212 6 61 78 92 10'
};

export const defaultEmergencyContacts: EmergencyContact[] = [
  {
    id: 'c1',
    role: 'MEDECIN',
    nom: 'Dr. H. Radi',
    details: 'Cardiologue Référent - Clinique Universitaire',
    telephone: '+212 5 22 45 88 90',
    email: 'service.cardiologie@chu-telemed.ma',
    priorite: 1
  },
  {
    id: 'c2',
    role: 'PROCHE',
    nom: 'Karim El Amrani',
    details: 'Époux / Personne de confiance',
    telephone: '+212 6 61 34 56 78',
    email: 'karim.elamrani@gmail.com',
    priorite: 2
  },
  {
    id: 'c3',
    role: 'SAMU',
    nom: 'SAMU Médical (National)',
    details: 'Service d\'Aide Médicale Urgente (Maroc)',
    telephone: '580',
    priorite: 3
  },
  {
    id: 'c4',
    role: 'POMPIERS',
    nom: 'Protection Civile (Secours)',
    details: 'Secours d\'urgence & Évacuation (Maroc)',
    telephone: '150',
    priorite: 4
  }
];

export const defaultHardwareInfo: HardwareInfo = {
  esp32Status: 'CONNECTED',
  port: 'COM4 (USB-UART CP2102)',
  baudRate: 115200,
  batteryPct: 88,
  batteryVoltage: 3.95,
  i2cOled: true,
  i2cMax30102: true,
  i2cMpu6050: true
};

// Generates realistic mock historical sessions for calendar navigation
export const generateMockHistory = (): MeasurementRecord[] => {
  const records: MeasurementRecord[] = [];
  const dates = [
    '2026-11-17', // Today
    '2026-11-16',
    '2026-11-15',
    '2026-11-14',
    '2026-11-13'
  ];

  dates.forEach((date, dateIdx) => {
    // Generate 6 sessions per day
    const times = ['08:15:00', '10:30:00', '12:45:00', '15:20:00', '18:10:00', '21:30:00'];
    
    times.forEach((time, tIdx) => {
      let bpm = Math.round(72 + Math.sin(tIdx + dateIdx) * 10);
      let resp = Math.round(15 + Math.cos(tIdx) * 3);
      let motion = 0.98 + (tIdx % 2 === 0 ? 0.04 : 0.01);
      let status: MeasurementRecord['status'] = 'NORMAL';
      let anomalyDetected = false;
      let notes = 'Signes vitaux stables.';

      // Introduce occasional clinical event in past days
      if (dateIdx === 0 && tIdx === 3) {
        // Earlier today at 15:20: slight tachycardia
        bpm = 106;
        resp = 21;
        status = 'TACHYCARDIE';
        anomalyDetected = true;
        notes = 'Élévation modérée de la FC suite à un effort de marche.';
      } else if (dateIdx === 1 && tIdx === 4) {
        // Yesterday at 18:10: brief orthostatic hypotension with bradycardia
        bpm = 54;
        resp = 12;
        status = 'BRADYCARDIE';
        anomalyDetected = true;
        notes = 'Épisode de fatigue posturale signalée par la patiente.';
      } else if (dateIdx === 2 && tIdx === 2) {
        // Nov 15: Minor fall alert that was safely cancelled
        bpm = 48;
        motion = 2.75;
        status = 'CHUTE_DETECTEE';
        anomalyDetected = true;
        notes = 'Impact détecté. Compte à rebours annulé par la patiente (glissade mineure sans perte de connaissance).';
      }

      records.push({
        id: `REC-${date}-${tIdx}`,
        timestamp: `${date}T${time}`,
        date,
        time,
        bpm,
        resp,
        motion,
        status,
        finger: true,
        anomalyDetected,
        notes
      });
    });
  });

  return records;
};

export const CLINICAL_CONSTANTS = {
  BPM_NORMAL_MIN: 60,
  BPM_NORMAL_MAX: 100,
  RESP_NORMAL_MIN: 12,
  RESP_NORMAL_MAX: 20,
  FALL_ACCEL_THRESHOLD: 2.5, // in g
  COUNTDOWN_DURATION_SEC: 15
};
