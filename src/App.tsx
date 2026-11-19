import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { VitalsDashboard } from './components/VitalsDashboard/VitalsDashboard';
import { PatientRecordView } from './components/PatientFile/PatientRecordView';
import { HistoryCalendarView } from './components/History/HistoryCalendarView';
import { EmergencySosView } from './components/EmergencyAlert/EmergencySosView';
import { EmergencyModal } from './components/EmergencyAlert/EmergencyModal';
import { HardwareSpecsModal } from './components/HardwareSpecsModal';
import { DevStyleSwitcher } from './components/DevStyleSwitcher';
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

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PATIENT' | 'HISTORY' | 'SOS'>('DASHBOARD');

  // Multi-Style UI/UX Design System State (4 Styles for evaluation)
  const [currentStyle, setCurrentStyle] = useState<UIStyleId>(() => {
    const saved = localStorage.getItem('drhjr_ui_style') as UIStyleId;
    return (saved && UI_STYLES[saved]) ? saved : 'MEDICARE_LIGHT';
  });

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.MEDICARE_LIGHT;

  // Theme State synchronized with current style mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => styleConfig.themeMode);

  useEffect(() => {
    localStorage.setItem('drhjr_ui_style', currentStyle);
    setTheme(styleConfig.themeMode);
  }, [currentStyle, styleConfig]);

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

  // Live Vitals State
  const [bpm, setBpm] = useState<number>(74);
  const [resp, setResp] = useState<number>(16);
  const [motion, setMotion] = useState<number>(1.02);
  const [finger, setFinger] = useState<boolean>(true);
  const [fallAlert, setFallAlert] = useState<boolean>(false);

  // Sync audio mute state with medicalAudio instance
  useEffect(() => {
    medicalAudio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Compute Clinical Vital Status
  const status: VitalStatus = useMemo(() => {
    if (!finger) return 'DOIGT_NON_DETECTE';
    if (fallAlert || motion >= 2.5) return 'CHUTE_DETECTEE';
    if (bpm > 100) return 'TACHYCARDIE';
    if (bpm < 60) return 'BRADYCARDIE';
    if (resp > 20) return 'TACHYPNEE';
    if (resp < 12) return 'BRADYPNEE';
    return 'NORMAL';
  }, [finger, fallAlert, motion, bpm, resp]);

  const vitals: VitalSigns = {
    bpm: finger ? bpm : 0,
    resp,
    finger,
    motion,
    fallAlert,
    status,
    timestamp: new Date().toISOString()
  };

  // Trigger Emergency Countdown Alarm
  const triggerEmergencyAlert = useCallback((reason: string) => {
    setFallAlert(true);
    setEmergencyReason(reason);
    setIsEmergencyModalOpen(true);
  }, []);

  // Handle subtle biological physiological jitter (subtle real human variance)
  useEffect(() => {
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
  }, [finger, fallAlert, bpm]);

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
          theme={theme}
          onTriggerEmergency={() => triggerEmergencyAlert('Déclenchement manuel du test d\'urgence vitale')}
          openHardwareModal={() => setIsHardwareModalOpen(true)}
          currentStyle={currentStyle}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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

        {/* Clinical Footer */}
        <footer className={`border-t py-4 text-center text-xs font-mono transition-colors ${
          styleConfig.topbarBorder
        } ${styleConfig.topbarBg} ${styleConfig.subText}`}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Projet Télésurveillance Médicale Connectée (ESP32) • Faculté de Médecine & Ingénierie Biomédicale</span>
            <span className={styleConfig.mainText}>
              DrHJR Clinical TeleMed • Novembre 2026
            </span>
          </div>
        </footer>
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

      {/* Floating Interactive Dev Style Switcher Pill & Drawer */}
      <DevStyleSwitcher
        currentStyle={currentStyle}
        onSelectStyle={setCurrentStyle}
      />
    </div>
  );
};

export default App;
