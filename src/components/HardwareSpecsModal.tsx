import React, { useState } from 'react';
import { Cpu, AlertTriangle, Layers, Zap, Code2, Usb, Copy, Check, Radio, Terminal, Info } from 'lucide-react';
import { telemetryService } from '../services/telemetryService';
import { medicalAudio } from '../utils/audio';

interface HardwareSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARDUINO_SOURCE_CODE = `/*
 * =========================================================================================
 *   CardioPulse-ESP32 : Système Embarqué de Télésurveillance Cardiologique & Obstétricale
 * =========================================================================================
 *   Architecture Matérielle :
 *     - Microcontrôleur : ESP32 DevKit V1 / V4
 *     - Capteur PPG     : MAX30102 (I2C 0x57) - Alimentation STRICTEMENT en 3.3V
 *     - IMU Biologique  : MPU6050 (I2C 0x68) - Accéléromètre & Inclinométrie Respiratoire
 *     - Écran Local     : OLED SSD1306 0.96" 128x64 (I2C 0x3C)
 *     - Bus I2C         : GPIO 21 (SDA) • GPIO 22 (SCL)
 *   Télémétrie Série UART (115200 bauds) :
 *     {"bpm":74,"resp":16,"spo2":98,"motion":1.02,"finger":true,"fall":false}
 * =========================================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SDA_PIN 21
#define SCL_PIN 22
#define MAX_ADDR 0x57
#define MPU_ADDR 0x68
#define IGNORER_ERREURS 0

#define SPO2_A 110.0f
#define SPO2_B 25.0f

#define FALL_IMPACT_G 2.5f
#define FALL_STILL_G 0.25f
#define FALL_STILL_MS 1500
#define FALL_WINDOW_MS 6000
#define FALL_ALERT_MS 15000

#define FALL_IDLE 0
#define FALL_CHECK 1
#define FALL_ALERT 2

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
bool oledOk = false, ppgOk = false, mpuOk = false;

const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
int bpmAvg = 0;
bool finger = false;
uint32_t sampleIdx = 0, lastBeatIdx = 0;
float fastV = 0, slowV = 0, env = 0;
bool beatInit = false, beatHigh = false;

float dcRed = 0, dcIr = 0, fRed = 0, fIr = 0;
float sumSqRed = 0, sumSqIr = 0;
uint16_t spoN = 0;
bool spoInit = false, spoSkip = true;
float spo2f = 0;
int spo2 = 0;

float angleFast = 0, angleSlow = 0;
bool angleInit = false, breathHigh = false;
unsigned long lastBreath = 0;
float intervals[4];
byte intSpot = 0, intCount = 0;
float respRate = 0;

byte fallState = FALL_IDLE;
float currentG = 1.0f;
unsigned long tImpact = 0, tStill = 0, tAlert = 0, tFall = 0;
unsigned long tMpu = 0, tOled = 0, tSerial = 0;

bool writeReg(uint8_t addr, uint8_t reg, uint8_t val) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.write(val);
  return Wire.endTransmission() == 0;
}

bool readRegs(uint8_t addr, uint8_t reg, uint8_t *dst, uint8_t n) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom((uint8_t)addr, (size_t)n) != n) return false;
  for (uint8_t i = 0; i < n; i++) dst[i] = Wire.read();
  return true;
}

bool maxInit() {
  uint8_t id;
  if (!readRegs(MAX_ADDR, 0xFF, &id, 1)) return false;
  writeReg(MAX_ADDR, 0x09, 0x40);
  delay(100);
  writeReg(MAX_ADDR, 0x04, 0);
  writeReg(MAX_ADDR, 0x05, 0);
  writeReg(MAX_ADDR, 0x06, 0);
  writeReg(MAX_ADDR, 0x08, 0x1F);
  writeReg(MAX_ADDR, 0x09, 0x03);
  writeReg(MAX_ADDR, 0x0A, 0x27);
  writeReg(MAX_ADDR, 0x0C, 0x3F);
  writeReg(MAX_ADDR, 0x0D, 0x3F);
  return true;
}

void resetHeart() {
  bpmAvg = 0; lastBeatIdx = 0; rateSpot = 0; beatInit = false; beatHigh = false;
  for (byte i = 0; i < RATE_SIZE; i++) rates[i] = 0;
}

void processSample(uint32_t ir) {
  sampleIdx++;
  finger = (ir > 50000);
  if (!finger) { resetHeart(); return; }
  if (!beatInit) {
    fastV = slowV = ir; env = 0;
    beatInit = true; beatHigh = false;
    return;
  }
  fastV += 0.2f * (ir - fastV);
  slowV += 0.02f * (ir - slowV);
  float ac = fastV - slowV;
  env = fmaxf(fabsf(ac), env * 0.995f);
  float th = 0.5f * env;
  if (!beatHigh && env > 30 && ac > th) {
    uint32_t dt = (sampleIdx - lastBeatIdx) * 10;
    if (lastBeatIdx == 0 || dt >= 300) {
      beatHigh = true;
      if (lastBeatIdx != 0 && dt <= 2000) {
        float bpm = 60000.0f / dt;
        rates[rateSpot++] = (byte)bpm;
        rateSpot %= RATE_SIZE;
        int sum = 0, n = 0;
        for (byte i = 0; i < RATE_SIZE; i++) if (rates[i] > 0) { sum += rates[i]; n++; }
        bpmAvg = sum / n;
      }
      lastBeatIdx = sampleIdx;
    }
  } else if (beatHigh && ac < 0) {
    beatHigh = false;
  }
}

void resetSpO2() {
  spoInit = false; spoSkip = true;
  sumSqRed = sumSqIr = 0; spoN = 0;
  spo2f = 0; spo2 = 0;
}

void processSpO2(uint32_t red, uint32_t ir) {
  if (!finger) { resetSpO2(); return; }
  if (!spoInit) {
    dcRed = fRed = red;
    dcIr = fIr = ir;
    spoInit = true;
    return;
  }
  dcRed += 0.01f * (red - dcRed);
  dcIr += 0.01f * (ir - dcIr);
  fRed += 0.2f * (red - fRed);
  fIr += 0.2f * (ir - fIr);
  float acR = fRed - dcRed;
  float acI = fIr - dcIr;
  sumSqRed += acR * acR;
  sumSqIr += acI * acI;
  if (++spoN >= 300) {
    if (spoSkip) {
      spoSkip = false;
    } else {
      float rmsR = sqrtf(sumSqRed / spoN);
      float rmsI = sqrtf(sumSqIr / spoN);
      if (rmsR > 5 && rmsI > 5 && dcRed > 0 && dcIr > 0) {
        float R = (rmsR / dcRed) / (rmsI / dcIr);
        float s = SPO2_A - SPO2_B * R;
        if (s >= 70.0f) {
          if (s > 100.0f) s = 100.0f;
          spo2f = (spo2f == 0) ? s : 0.7f * spo2f + 0.3f * s;
          spo2 = (int)(spo2f + 0.5f);
        }
      }
    }
    sumSqRed = sumSqIr = 0; spoN = 0;
  }
}

void updateHeart() {
  uint8_t wr, rd;
  if (!readRegs(MAX_ADDR, 0x04, &wr, 1) || !readRegs(MAX_ADDR, 0x06, &rd, 1)) return;
  int n = (wr - rd) & 0x1F;
  while (n-- > 0) {
    uint8_t b[6];
    if (!readRegs(MAX_ADDR, 0x07, b, 6)) return;
    uint32_t red = (((uint32_t)b[0] << 16) | ((uint32_t)b[1] << 8) | b[2]) & 0x3FFFF;
    uint32_t ir  = (((uint32_t)b[3] << 16) | ((uint32_t)b[4] << 8) | b[5]) & 0x3FFFF;
    processSample(ir);
    processSpO2(red, ir);
  }
  if (lastBeatIdx != 0 && (sampleIdx - lastBeatIdx) * 10 > 5000) bpmAvg = 0;
}

bool mpuInit() {
  bool ok = writeReg(MPU_ADDR, 0x6B, 0x00);
  writeReg(MPU_ADDR, 0x1C, 0x10);
  return ok;
}

bool mpuReadAngle(float &angle) {
  uint8_t b[6];
  if (!readRegs(MPU_ADDR, 0x3B, b, 6)) return false;
  int16_t ay = (int16_t)((b[2] << 8) | b[3]);
  int16_t az = (int16_t)((b[4] << 8) | b[5]);
  angle = atan2((float)ay, (float)az) * 180.0f / PI;
  return true;
}

void updateBreathing() {
  float a;
  if (!mpuReadAngle(a)) return;
  if (!angleInit) { angleFast = angleSlow = a; angleInit = true; }
  angleFast += 0.15f * (a - angleFast);
  angleSlow += 0.01f * (a - angleSlow);
  float sig = angleFast - angleSlow;
  const float TH = 0.15f;
  unsigned long now = millis();
  if (!breathHigh && sig > TH) {
    breathHigh = true;
    if (now - lastBreath > 1500) {
      if (lastBreath != 0) {
        intervals[intSpot] = (now - lastBreath) / 1000.0f;
        intSpot = (intSpot + 1) % 4;
        if (intCount < 4) intCount++;
        float sum = 0;
        for (byte i = 0; i < intCount; i++) sum += intervals[i];
        respRate = 60.0f / (sum / intCount);
      }
      lastBreath = now;
    }
  } else if (breathHigh && sig < -TH) {
    breathHigh = false;
  }
  if (lastBreath != 0 && now - lastBreath > 15000) {
    respRate = 0; intCount = 0; lastBreath = 0;
  }
}

bool mpuReadG(float &g) {
  uint8_t b[6];
  if (!readRegs(MPU_ADDR, 0x3B, b, 6)) return false;
  int16_t ax = (int16_t)((b[0] << 8) | b[1]);
  int16_t ay = (int16_t)((b[2] << 8) | b[3]);
  int16_t az = (int16_t)((b[4] << 8) | b[5]);
  g = sqrtf((float)ax * ax + (float)ay * ay + (float)az * az) / 4096.0f;
  return true;
}

void updateFall() {
  float g;
  if (!mpuReadG(g)) return;
  currentG = g;
  unsigned long now = millis();
  switch (fallState) {
    case FALL_IDLE:
      if (g > FALL_IMPACT_G) {
        fallState = FALL_CHECK;
        tImpact = now;
        tStill = 0;
      }
      break;
    case FALL_CHECK:
      if (now - tImpact > FALL_WINDOW_MS) {
        fallState = FALL_IDLE;
        break;
      }
      if (now - tImpact < 500) break;
      if (fabsf(g - 1.0f) < FALL_STILL_G) {
        if (tStill == 0) tStill = now;
        if (now - tStill >= FALL_STILL_MS) {
          fallState = FALL_ALERT;
          tAlert = now;
          Serial.println("ALERTE : chute detectee !");
        }
      } else {
        tStill = 0;
      }
      break;
    case FALL_ALERT:
      if (now - tAlert > FALL_ALERT_MS) fallState = FALL_IDLE;
      break;
  }
}

void updateOled() {
  oled.clearDisplay();
  if (fallState == FALL_ALERT) {
    static bool blink = false;
    blink = !blink;
    oled.fillRect(0, 0, 128, 64, blink ? SSD1306_WHITE : SSD1306_BLACK);
    oled.setTextColor(blink ? SSD1306_BLACK : SSD1306_WHITE);
    oled.setTextSize(3);
    oled.setCursor(10, 6);
    oled.print("CHUTE!");
    oled.setTextSize(1);
    oled.setCursor(10, 40);
    oled.print("Patient immobile");
    oled.setCursor(10, 52);
    oled.print("Verifier maintenant");
    oled.display();
    return;
  }

  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.print("Signes vitaux (demo)");

  oled.setTextSize(2);
  oled.setCursor(0, 14);
  oled.print("FC ");
  if (bpmAvg > 0) oled.print(bpmAvg); else oled.print("--");
  oled.setTextSize(1);
  oled.print(" bpm");

  oled.setTextSize(2);
  oled.setCursor(0, 34);
  oled.print("SpO2 ");
  if (spo2 > 0) oled.print(spo2); else oled.print("--");
  oled.setTextSize(1);
  oled.print(" %");

  oled.setCursor(0, 56);
  if (!finger) oled.print("Pose ta main");
  oled.display();
}

void showError() {
  Serial.println("Erreur capteur - verifie le cablage");
  if (!oledOk) return;
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(1);
  oled.setCursor(0, 0);
  oled.println("Erreur capteur :");
  if (!ppgOk) oled.println("- MAX30102 absent");
  if (!mpuOk) oled.println("- MPU6050 absent");
  oled.display();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000);

  oledOk = oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  ppgOk = maxInit();
  mpuOk = mpuInit();

  if ((!oledOk || !ppgOk || !mpuOk) && !IGNORER_ERREURS) {
    showError();
    while (1) delay(100);
  }
}

void loop() {
  updateHeart();

  if (millis() - tMpu >= 40) {
    tMpu = millis();
    updateBreathing();
  }

  if (millis() - tFall >= 10) {
    tFall = millis();
    updateFall();
  }

  if (oledOk && millis() - tOled >= 500) {
    tOled = millis();
    updateOled();
  }

  // --- TÉLÉMÉTRIE SÉRIE UART VERS DASHBOARD WEB ---
  if (millis() - tSerial >= 100) {
    tSerial = millis();
    Serial.print("{\\"bpm\\":");
    Serial.print(finger ? bpmAvg : 0);
    Serial.print(",\\"resp\\":");
    Serial.print((int)respRate);
    Serial.print(",\\"spo2\\":");
    Serial.print(spo2);
    Serial.print(",\\"motion\\":");
    Serial.print(currentG, 2);
    Serial.print(",\\"finger\\":");
    Serial.print(finger ? "true" : "false");
    Serial.print(",\\"fall\\":");
    Serial.print(fallState == FALL_ALERT ? "true" : "false");
    Serial.println("}");
  }
}`;

const SNIPPET_TELEMETRY = `// --- TÉLÉMÉTRIE WEB SÉRIE (À COLLER À LA FIN DE void loop()) ---
static unsigned long tSerial = 0;
if (millis() - tSerial >= 100) {
  tSerial = millis();
  Serial.print("{\\"bpm\\":"); Serial.print(finger ? bpmAvg : 0);
  Serial.print(",\\"resp\\":"); Serial.print((int)respRate);
  Serial.print(",\\"spo2\\":"); Serial.print(spo2);
  Serial.print(",\\"motion\\":1.0");
  Serial.print(",\\"finger\\":"); Serial.print(finger ? "true" : "false");
  Serial.print(",\\"fall\\":"); Serial.print(fallState == FALL_ALERT ? "true" : "false");
  Serial.println("}");
}`;

export const HardwareSpecsModal: React.FC<HardwareSpecsModalProps> = ({ isOpen, onClose }) => {
  const [modalTab, setModalTab] = useState<'SCHEMATIC' | 'ARDUINO_CODE' | 'USB_CONNECT'>('SCHEMATIC');
  const [selectedComp, setSelectedComp] = useState<string>('MAX30102');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connMessage, setConnMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    medicalAudio.playUiClick();
    navigator.clipboard.writeText(ARDUINO_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopySnippet = () => {
    medicalAudio.playUiClick();
    navigator.clipboard.writeText(SNIPPET_TELEMETRY);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const handleConnectUsb = async () => {
    medicalAudio.playUiClick();
    setIsConnecting(true);
    setConnMessage(null);
    const success = await telemetryService.connectSerial(115200);
    setIsConnecting(false);
    if (success) {
      setConnMessage('ESP32 connecté avec succès à 115200 bauds !');
    } else {
      setConnMessage('Connexion non établie (annulée ou port occupé).');
    }
  };

  const isConnected = telemetryService.getMode() === 'WEB_SERIAL' && telemetryService.getStatus() === 'CONNECTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-widest">
                  Hub Embarqué & Passerelle Télémétrique ESP32
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Intégration Matérielle & Code Arduino Prêt à Flasher
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-sm font-bold transition hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 mt-5 border-b border-slate-800 pb-3">
            <button
              onClick={() => { medicalAudio.playUiClick(); setModalTab('SCHEMATIC'); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                modalTab === 'SCHEMATIC'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Schéma Électronique & BOM</span>
            </button>

            <button
              onClick={() => { medicalAudio.playUiClick(); setModalTab('ARDUINO_CODE'); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                modalTab === 'ARDUINO_CODE'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Code Arduino (.ino) Prêt</span>
            </button>

            <button
              onClick={() => { medicalAudio.playUiClick(); setModalTab('USB_CONNECT'); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                modalTab === 'USB_CONNECT'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Usb className="w-4 h-4 text-cyan-400" />
              <span>Connexion Directe Web Serial</span>
            </button>
          </div>

          {/* TAB 1: SCHEMATIC & WARNINGS */}
          {modalTab === 'SCHEMATIC' && (
            <div className="mt-6 space-y-6 text-xs text-slate-300">
              {/* Critical Warnings */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border-2 border-rose-500/50 text-rose-200 space-y-2.5 shadow-xl">
                <div className="flex items-center space-x-2 font-bold text-rose-400 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
                  <span>Consignes Impératives du Guide de Faculté de Médecine</span>
                </div>
                <ul className="space-y-2 list-disc list-inside text-rose-300/90 leading-relaxed text-[11px]">
                  <li>
                    <strong>Alimentation MAX30102 STRICTEMENT en 3.3V :</strong> Ne JAMAIS connecter le module MAX30102 à la broche 5V sous peine de destruction irréversible des LED émettrices.
                  </li>
                  <li>
                    <strong>Calibrage Préalable du MT3608 au Multimètre :</strong> Avant de brancher la sortie du Step-Up MT3608 sur la broche VIN de l'ESP32, visser le potentiomètre en laiton pour régler la tension à <strong>exactement 5.0V</strong>.
                  </li>
                  <li>
                    <strong>Isolation de l'Alimentation USB :</strong> Mettre l'interrupteur batterie physique sur <strong>OFF</strong> lors du téléversement du code Arduino via le câble USB.
                  </li>
                </ul>
              </div>

              {/* Interactive Circuit Nodes */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Schéma Fonctionnel & Bus I2C Mutualisé</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Cliquez sur un module pour inspecter</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                  <div 
                    onClick={() => setSelectedComp('ESP32')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedComp === 'ESP32' ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-indigo-400 font-bold block">CPU MAÎTRE</span>
                    <strong className="text-white text-xs block mt-1">ESP32 DevKit V4</strong>
                    <span className="text-[10px] text-slate-400 mt-1 block">GPIO 21 (SDA) • GPIO 22 (SCL)</span>
                  </div>

                  <div 
                    onClick={() => setSelectedComp('MAX30102')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedComp === 'MAX30102' ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-rose-400 font-bold block">I2C: 0x57 • 3.3V STRICT</span>
                    <strong className="text-white text-xs block mt-1">MAX30102 (PPG)</strong>
                    <span className="text-[10px] text-slate-400 mt-1 block">LED IR 880nm / Rouge 660nm</span>
                  </div>

                  <div 
                    onClick={() => setSelectedComp('MPU6050')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedComp === 'MPU6050' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-cyan-400 font-bold block">I2C: 0x68 • 3.3V/5V</span>
                    <strong className="text-white text-xs block mt-1">MPU6050 (GY-521)</strong>
                    <span className="text-[10px] text-slate-400 mt-1 block">Inclinomètre & Chute &gt; 2.5g</span>
                  </div>

                  <div 
                    onClick={() => setSelectedComp('MT3608')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      selectedComp === 'MT3608' ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-amber-400 font-bold block">STEP-UP 3.7V $\rightarrow$ 5.0V</span>
                    <strong className="text-white text-xs block mt-1">MT3608 Boost</strong>
                    <span className="text-[10px] text-slate-400 mt-1 block">Sortie VIN: 5.00V Régulé</span>
                  </div>
                </div>
              </div>

              {/* BOM Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Nomenclature des Composants (BOM)</span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Composant</th>
                        <th className="p-3">Rôle Médical / Fonction</th>
                        <th className="p-3">Bus / Pinout</th>
                        <th className="p-3">Alimentation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                      <tr className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-white">ESP32 DevKit V4</td>
                        <td className="p-3 text-slate-300">Microcontrôleur central, série UART 115200 bauds</td>
                        <td className="p-3 text-indigo-400">GPIO 21 (SDA) • GPIO 22 (SCL)</td>
                        <td className="p-3 text-emerald-400 font-bold">5.0V sur VIN</td>
                      </tr>
                      <tr className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-white">MAX30102</td>
                        <td className="p-3 text-slate-300">Oxymétrie de pouls & onde PPG dicrote</td>
                        <td className="p-3 text-indigo-400">I2C (0x57)</td>
                        <td className="p-3 text-rose-400 font-extrabold">3.3V STRICT</td>
                      </tr>
                      <tr className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-white">MPU6050 (GY-521)</td>
                        <td className="p-3 text-slate-300">Accéléromètre 6-DOF : Cycles respiratoires & Chute &gt; 2.5g</td>
                        <td className="p-3 text-indigo-400">I2C (0x68)</td>
                        <td className="p-3 text-emerald-400">3.3V / 5V</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARDUINO CODE */}
          {modalTab === 'ARDUINO_CODE' && (
            <div className="mt-6 space-y-5">
              {/* Highlighted Solution for Existing Code */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900 border-2 border-cyan-500/40 text-slate-200 space-y-3 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
                    <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Vous avez déjà un code fonctionnel sur votre écran OLED ?</span>
                  </div>
                  <button
                    onClick={handleCopySnippet}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-cyan-950"
                  >
                    {copiedSnippet ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet ? 'Snippet Copié !' : 'Copier les 8 Lignes Telemetry'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Pas besoin de modifier vos capteurs ou votre écran !</strong> Votre ESP32 calcule déjà le pouls et la SpO2 mais les écrit uniquement sur l'OLED en I2C. Pour que les constantes s'affichent aussi en direct sur le site web, collez simplement ces 8 lignes à la fin de votre fonction <code className="text-cyan-300 font-mono">void loop()</code> :
                </p>
                <div className="bg-black/80 rounded-xl p-3 border border-cyan-500/30 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  <pre>{SNIPPET_TELEMETRY}</pre>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Ces 8 lignes utilisent directement vos variables existantes (<code className="text-slate-300">bpmAvg</code>, <code className="text-slate-300">spo2</code>, <code className="text-slate-300">respRate</code>, <code className="text-slate-300">finger</code>, <code className="text-slate-300">fallState</code>) sans ralentir le microcontrôleur.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Sketch Complet Arduino / ESP32</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fichier complet disponible dans votre dépôt : <code className="text-indigo-400 font-mono">firmware/CardioPulse_ESP32_Updated.ino</code>
                  </p>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-950"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Code Copié !' : 'Copier le Code C++'}</span>
                </button>
              </div>

              <div className="bg-black/90 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[340px] shadow-inner">
                <pre>{ARDUINO_SOURCE_CODE}</pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <strong className="text-slate-200">Bibliothèques Arduino requises :</strong>
                <div>1. <code>Adafruit SSD1306</code> + <code>Adafruit GFX Library</code> (Gestionnaire de bibliothèques Arduino)</div>
                <div className="text-[10px] text-emerald-400 font-semibold">* Le pilote MAX30102 et MPU6050 fonctionne directement via registres I2C natifs (Wire.h), sans bibliothèque externe supplémentaire requise !</div>
              </div>
            </div>
          )}

          {/* TAB 3: WEB SERIAL USB DIRECT CONNECTION */}
          {modalTab === 'USB_CONNECT' && (
            <div className="mt-6 space-y-6 text-xs text-slate-300">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                      <Usb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Connexion USB Directe (Sans Backend Local)</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Le navigateur lit directement les trames JSON du port série via l'API Web Serial standard.
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}>
                    {isConnected ? 'ESP32 EN LIGNE' : 'SIMULATION ACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800">
                    <span className="text-slate-500 block">VITESSE UART</span>
                    <strong className="text-white text-xs mt-0.5 block">115200 bauds</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800">
                    <span className="text-slate-500 block">TRAMES REÇUES</span>
                    <strong className="text-cyan-400 text-xs mt-0.5 block">{telemetryService.getPacketsCount()} paquets</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800">
                    <span className="text-slate-500 block">SUPPORT NAVIGATEUR</span>
                    <strong className="text-emerald-400 text-xs mt-0.5 block">
                      {telemetryService.isSerialSupported() ? 'Compatible (Chrome/Edge)' : 'Non supporté'}
                    </strong>
                  </div>
                </div>

                {connMessage && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px]">
                    {connMessage}
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-2">
                  {isConnected ? (
                    <button
                      onClick={async () => {
                        medicalAudio.playUiClick();
                        await telemetryService.disconnect();
                        setConnMessage('ESP32 déconnecté. Retour au simulateur.');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition shadow-lg"
                    >
                      Déconnecter le Port Série
                    </button>
                  ) : (
                    <button
                      disabled={isConnecting}
                      onClick={handleConnectUsb}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer transition shadow-lg shadow-cyan-950 flex items-center space-x-2"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>{isConnecting ? 'Connexion en cours...' : 'Sélectionner le Port COM (ESP32)'}</span>
                    </button>
                  )}
                </div>

                {/* Practical Web Serial Troubleshooting Card */}
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Pourquoi le bouton « Se connecter » reste grisé dans la fenêtre du navigateur ?</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                    <li>
                      <strong className="text-white">1. Cliquez sur la ligne du port dans la liste :</strong> Dans la fenêtre Chrome/Edge, le bouton « Se connecter » reste désactivé tant que vous n'avez pas cliqué directement sur le nom du port (ex: <em>CP2102</em> ou <em>USB-SERIAL CH340</em>) pour le sélectionner en bleu.
                    </li>
                    <li>
                      <strong className="text-white">2. Vérifiez le câble USB (Données vs Charge-seule) :</strong> Si la liste est complètement vide, votre câble micro-USB est souvent un câble de « charge seule » (2 fils sans broches de données D+/D-). Testez avec un autre câble USB certifié données (vous devez entendre le son de connexion Windows).
                    </li>
                    <li>
                      <strong className="text-white">3. Pilote USB-UART (CH340 ou CP2102) :</strong> Si le Gestionnaire de périphériques affiche <em>USB2.0-Serial</em> avec un triangle jaune ⚠️, installez le pilote officiel <strong>CH341SER</strong> ou <strong>CP210x</strong>.
                    </li>
                    <li>
                      <strong className="text-white">4. Fermez l'IDE Arduino / Moniteur Série :</strong> Sur Windows, un port COM ne peut être ouvert que par une seule application à la fois. Si le moniteur série d'Arduino ou PuTTY est ouvert, fermez-le.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-950 transition"
          >
            Fermer le Guide Matériel
          </button>
        </div>
      </div>
    </div>
  );
};
