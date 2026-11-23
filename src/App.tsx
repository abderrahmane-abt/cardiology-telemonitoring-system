import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { VitalsDashboard } from './components/VitalsDashboard/VitalsDashboard';
import { PatientRecordView } from './components/PatientFile/PatientRecordView';
import { HistoryCalendarView } from './components/History/HistoryCalendarView';
import { EmergencySosView } from './components/EmergencyAlert/EmergencySosView';
import { EmergencyModal } from './components/EmergencyAlert/EmergencyModal';
import { HardwareSpecsModal } from './components/HardwareSpecsModal';
import { UI_STYLES } from './types/themeStyles';
import type { UIStyleId } from './types/themeStyles';
import { 
  initialPatient, 
  defaultEmergencyContacts, 
  generateMockHistory 
} from './utils/mockData';
import type { 
  PatientProfile, 
  EmergencyContact, 
  MeasurementRecord, 
  VitalSigns, 
  VitalStatus 
} from './types/medical';
import { medicalAudio } from './utils/audio';
import { telemetryService, type ConnectionMode, type ConnectionStatus } from './services/telemetryService';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS'>('DASHBOARD');

  // UI Theme: Theme 4 (ICU Obsidian - Critical Care Hospital Cockpit)
  const currentStyle: UIStyleId = 'ICU_OBSIDIAN';
  const styleConfig = UI_STYLES.ICU_OBSIDIAN;

  // Theme State (Dark mode for ICU Obsidian cockpit)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Sidebar Collapsed State (Closed by default: icon-rail with menu button to expand)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('drhjr_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true; // DEFAULT: CLOSED (true)
  });

  const toggleSidebar = useCallback(() => {
    medicalAudio.playUiClick();
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('drhjr_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  // Audio State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);

  // Patient Profile state (persisted in localStorage)
  const [patient, setPatient] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem('drhjr_patient_data');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return initialPatient;
  });

  // Emergency Contacts state
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('drhjr_contacts_data');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return defaultEmergencyContacts;
  });

  // Measurement Records state
  const [records, setRecords] = useState<MeasurementRecord[]>(() => {
    const saved = localStorage.getItem('drhjr_records_data');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return generateMockHistory();
  });

  // Live Vitals State - Default: DOIGT RETIRÉ (En attente du doigt du volontaire)
  const [bpm, setBpm] = useState<number>(0);
  const [resp, setResp] = useState<number>(16);
  const [spo2, setSpo2] = useState<number>(98);
  const [motion, setMotion] = useState<number>(1.02);
  const [finger, setFinger] = useState<boolean>(false);
  const [fallAlert, setFallAlert] = useState<boolean>(false);

  // Hardware Web Serial / Telemetry Connection State
  const [connStatus, setConnStatus] = useState<ConnectionStatus>(telemetryService.getStatus());
  const [connMode, setConnMode] = useState<ConnectionMode>(telemetryService.getMode());
  const [packetsCount, setPacketsCount] = useState<number>(0);

  // Sync audio mute state with medicalAudio instance
  useEffect(() => {
    medicalAudio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Trigger Emergency Countdown Alarm
  const triggerEmergencyAlert = useCallback((reason: string) => {
    setFallAlert(true);
    setEmergencyReason(reason);
    setIsEmergencyModalOpen(true);
  }, []);

  // Subscribe to real-time hardware frames (Web Serial / ESP32)
  useEffect(() => {
    const unsubFrame = telemetryService.subscribe((frame) => {
      setBpm(frame.bpm);
      setResp(frame.resp);
      if (typeof frame.spo2 === 'number' && frame.spo2 > 0) {
        setSpo2(frame.spo2);
      }
      setMotion(frame.motion);
      setFinger(frame.finger);
      setPacketsCount(telemetryService.getPacketsCount());
      if (frame.fallAlert) {
        triggerEmergencyAlert('Alerte chute / syncope détectée par le capteur ESP32');
      }
    });

    const unsubStatus = telemetryService.onStatusChange((newStatus, newMode) => {
      setConnStatus(newStatus);
      setConnMode(newMode);
    });

    return () => {
      unsubFrame();
      unsubStatus();
    };
  }, [triggerEmergencyAlert]);

  // Compute Clinical Vital Status (Detecting Malaise Vagal / Lipothymie / Chute / Tachycardie)
  const status: VitalStatus = useMemo(() => {
    if (!finger) return 'DOIGT_NON_DETECTE';
    if (fallAlert || motion >= 2.5) return 'CHUTE_DETECTEE';
    if (bpm < 48 || (bpm < 52 && resp < 11)) return 'MALAISE_IMMINENT';
    if (bpm > 100) return 'TACHYCARDIE';
    if (bpm < 60) return 'BRADYCARDIE';
    if (resp > 20) return 'TACHYPNEE';
    if (resp < 12) return 'BRADYPNEE';
    return 'NORMAL';
  }, [finger, fallAlert, motion, bpm, resp]);

  const vitals: VitalSigns = {
    bpm: finger ? bpm : 0,
    resp,
    spo2,
    finger,
    motion,
    fallAlert,
    status,
    timestamp: new Date().toISOString()
  };

  // Handle subtle biological physiological jitter in simulation mode only
  useEffect(() => {
    if (connMode !== 'SIMULATED') return;
    const interval = setInterval(() => {
      if (finger && !fallAlert && bpm > 0) {
        // Natural sinus jitter (+/- 1 BPM occasionally)
        setBpm(prev => {
          if (prev <= 40 || prev >= 140) return prev;
          const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.7 ? 1 : 0);
          return Math.max(35, Math.min(160, prev + delta));
        });
        // Natural motion micro-fluctuations
        setMotion(prev => {
          if (prev >= 2.4) return prev;
          return Number((0.98 + (Math.random() - 0.5) * 0.05).toFixed(2));
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [connMode, finger, fallAlert, bpm]);

  // Persist patient update
  const handleUpdatePatient = (updated: PatientProfile) => {
    setPatient(updated);
    localStorage.setItem('drhjr_patient_data', JSON.stringify(updated));
  };

  // Persist contacts update
  const handleUpdateContacts = (updated: EmergencyContact[]) => {
    setContacts(updated);
    localStorage.setItem('drhjr_contacts_data', JSON.stringify(updated));
  };

  // Handle emergency dispatched confirmation
  const handleConfirmEmergency = () => {
    const now = new Date();
    const newRecord: MeasurementRecord = {
      id: `REC-${now.getTime()}`,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      bpm,
      resp,
      motion,
      status: 'CHUTE_DETECTEE',
      finger,
      anomalyDetected: true,
      notes: `Alerte Malaise Syncope confirmée. SAMU 141 et Dr. Radi alertés.`
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('drhjr_records_data', JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 relative ${
      styleConfig.appBg
    } ${styleConfig.mainText}`}>
      {/* Sleek Medical SaaS Sidebar (Inspired by Behance & Dribbble Designs) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patient={patient}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        theme={theme}
        setTheme={setTheme}
        openHardwareModal={() => setIsHardwareModalOpen(true)}
        isAlarmActive={isEmergencyModalOpen || fallAlert}
        currentStyle={currentStyle}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Clinical Navbar */}
        <TopNavbar
          activeTab={activeTab}
          patient={patient}
          vitals={vitals}
          isAlarmActive={isEmergencyModalOpen || fallAlert}
          onTriggerEmergency={() => triggerEmergencyAlert('Déclenchement manuel du test d\'urgence vitale')}
          openHardwareModal={() => setIsHardwareModalOpen(true)}
          currentStyle={currentStyle}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          hardwareStatus={{
            mode: connMode,
            status: connStatus,
            packets: packetsCount,
            onConnectUsb: () => telemetryService.connectSerial(),
            onDisconnect: () => telemetryService.disconnect()
          }}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 max-w-[1560px] w-full mx-auto p-4 sm:p-6 lg:p-8 xl:p-10">
          {activeTab === 'DASHBOARD' && (
            <VitalsDashboard
              vitals={vitals}
              patient={patient}
              soundEnabled={soundEnabled}
              isAlarmActive={isEmergencyModalOpen || fallAlert}
              theme={theme}
              currentStyle={currentStyle}
              onUpdateBpm={setBpm}
              onUpdateResp={setResp}
              onUpdateMotion={setMotion}
              onUpdateFinger={setFinger}
              onTriggerEmergencyAlert={triggerEmergencyAlert}
            />
          )}

          {activeTab === 'PATIENT' && (
            <PatientRecordView
              patient={patient}
              onUpdatePatient={handleUpdatePatient}
              currentStyle={currentStyle}
            />
          )}

          {activeTab === 'HISTORY' && (
            <HistoryCalendarView
              records={records}
              patient={patient}
              currentStyle={currentStyle}
            />
          )}

          {activeTab === 'SOS' && (
            <EmergencySosView
              contacts={contacts}
              patient={patient}
              vitals={vitals}
              onTriggerManualEmergency={() => triggerEmergencyAlert('Déclenchement manuel du bouton SOS par la patiente')}
              onUpdateContacts={handleUpdateContacts}
              currentStyle={currentStyle}
            />
          )}
        </main>
      </div>

      {/* Emergency Modal with 15-second countdown */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => {
          setIsEmergencyModalOpen(false);
          setFallAlert(false);
          setMotion(1.02);
          if (bpm < 50) setBpm(74);
        }}
        reason={emergencyReason}
        patient={patient}
        vitals={vitals}
        soundEnabled={soundEnabled}
        onConfirmEmergency={handleConfirmEmergency}
      />

      {/* Hardware Architecture & BOM Reference Modal */}
      <HardwareSpecsModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
      />
    </div>
  );
};

export default App;
