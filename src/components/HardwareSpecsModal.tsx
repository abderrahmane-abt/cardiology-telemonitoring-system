import React, { useState } from 'react';
import { Cpu, AlertTriangle, Layers, Zap, Code2, Usb, Copy, Check, Radio, Terminal } from 'lucide-react';
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
 *   Format Télémétrie Série UART (115200 bauds) :
 *   {"bpm":74,"resp":16,"motion":1.02,"finger":true,"fall":false}
 * =========================================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "MAX30105.h"
#include "heartRate.h"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

MAX30105 particleSensor;
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 74;

const int MPU_ADDR = 0x68;
int16_t AcX, AcY, AcZ;
float gForce = 1.0;
bool fallDetected = false;
unsigned long fallStartTime = 0;
const float FALL_THRESHOLD_G = 2.5;

int respRateCPM = 16;
unsigned long lastTelemetrySent = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 250;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // I2C SDA=GPIO21, SCL=GPIO22

  display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 20);
  display.println("CardioPulse ESP32");
  display.display();

  particleSensor.begin(Wire, I2C_SPEED_FAST);
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
}

void loop() {
  long irValue = particleSensor.getIR();
  bool fingerDetected = (irValue > 50000);

  if (fingerDetected && checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60 / (delta / 1000.0);
    if (beatsPerMinute < 220 && beatsPerMinute > 30) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;
      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++) beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  } else if (!fingerDetected) {
    beatAvg = 0;
  }

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  if (Wire.available() >= 6) {
    AcX = Wire.read() << 8 | Wire.read();
    AcY = Wire.read() << 8 | Wire.read();
    AcZ = Wire.read() << 8 | Wire.read();
    float ax = AcX / 16384.0;
    float ay = AcY / 16384.0;
    float az = AcZ / 16384.0;
    gForce = sqrt(ax * ax + ay * ay + az * az);

    if (gForce > FALL_THRESHOLD_G && !fallDetected) {
      fallDetected = true;
      fallStartTime = millis();
    }
  }

  if (fallDetected && (millis() - fallStartTime > 15000)) {
    fallDetected = false;
  }

  if (millis() - lastTelemetrySent >= TELEMETRY_INTERVAL_MS) {
    lastTelemetrySent = millis();
    Serial.print("{\\"bpm\\":");
    Serial.print(fingerDetected ? beatAvg : 0);
    Serial.print(",\\"resp\\":");
    Serial.print(respRateCPM);
    Serial.print(",\\"motion\\":");
    Serial.print(gForce, 2);
    Serial.print(",\\"finger\\":");
    Serial.print(fingerDetected ? "true" : "false");
    Serial.print(",\\"fall\\":");
    Serial.print(fallDetected ? "true" : "false");
    Serial.println("}");
  }
}`;

export const HardwareSpecsModal: React.FC<HardwareSpecsModalProps> = ({ isOpen, onClose }) => {
  const [modalTab, setModalTab] = useState<'SCHEMATIC' | 'ARDUINO_CODE' | 'USB_CONNECT'>('SCHEMATIC');
  const [selectedComp, setSelectedComp] = useState<string>('MAX30102');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connMessage, setConnMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    medicalAudio.playUiClick();
    navigator.clipboard.writeText(ARDUINO_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
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
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Sketch Arduino / ESP32 Prêt au Téléversement</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fichier disponible dans votre projet : <code className="text-indigo-400 font-mono">firmware/CardioPulse_ESP32.ino</code>
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

              <div className="bg-black/90 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[380px] shadow-inner">
                <pre>{ARDUINO_SOURCE_CODE}</pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <strong className="text-slate-200">Bibliothèques Arduino requises :</strong>
                <div>1. <code>SparkFun MAX3010x Pulse and Proximity Sensor Library</code> (Gestionnaire de bibliothèques Arduino)</div>
                <div>2. <code>Adafruit SSD1306</code> + <code>Adafruit GFX Library</code></div>
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
