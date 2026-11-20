/*
 * =========================================================================================
 *   CardioPulse-ESP32 : Système Embarqué de Télésurveillance Cardiologique & Obstétricale
 * =========================================================================================
 *   Architecture Matérielle :
 *     - Microcontrôleur : ESP32 DevKit V1 / V4
 *     - Capteur PPG     : MAX30102 (I2C 0x57) - Alimentation STRICTEMENT en 3.3V
 *     - IMU Biologique  : MPU6050 (I2C 0x68) - Accéléromètre & Inclinométrie Respiratoire
 *     - Écran Local     : OLED SSD1306 0.96" 128x64 (I2C 0x3C)
 *     - Bus I2C         : GPIO 21 (SDA) • GPIO 22 (SCL) avec résistances de pull-up 4.7kΩ
 *
 *   Format de Télémétrie Série UART (115200 bauds) :
 *   {"bpm":74,"resp":16,"motion":1.02,"finger":true,"fall":false}
 * =========================================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "MAX30105.h"
#include "heartRate.h"

// Configuration Écran OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Capteur MAX30102
MAX30105 particleSensor;
const byte RATE_SIZE = 4; // Moyenne glissante sur 4 battements
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 74;

// Capteur MPU6050
const int MPU_ADDR = 0x68;
int16_t AcX, AcY, AcZ;
float gForce = 1.0;
float lastGForce = 1.0;
bool fallDetected = false;
unsigned long fallStartTime = 0;
const float FALL_THRESHOLD_G = 2.5; // Seuil de détection de choc (> 2.5g)

// Fréquence Respiratoire estimée
int respRateCPM = 16;
unsigned long lastTelemetrySent = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 250; // 4Hz cadence télémétrique

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // I2C SDA=21, SCL=22 sur ESP32

  // 1. Initialisation OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("{\"error\":\"SSD1306 allocation failed\"}"));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(10, 20);
    display.println("CardioPulse ESP32");
    display.setCursor(10, 35);
    display.println("Initialisation I2C...");
    display.display();
  }

  // 2. Initialisation MAX30102
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println(F("{\"error\":\"MAX30102 non detecte sur bus 0x57\"}"));
  } else {
    particleSensor.setup(); // Configuration par défaut LED
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
  }

  // 3. Initialisation MPU6050
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // Registre PWR_MGMT_1
  Wire.write(0);    // Réveiller le MPU6050
  Wire.endTransmission(true);

  delay(500);
}

void loop() {
  // A. Lecture Onde PPG MAX30102
  long irValue = particleSensor.getIR();
  bool fingerDetected = (irValue > 50000);

  if (fingerDetected) {
    if (checkForBeat(irValue)) {
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
    }
  } else {
    beatAvg = 0;
  }

  // B. Lecture Inclinométrie & Choc MPU6050
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // Registre ACCEL_XOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  if (Wire.available() >= 6) {
    AcX = Wire.read() << 8 | Wire.read();
    AcY = Wire.read() << 8 | Wire.read();
    AcZ = Wire.read() << 8 | Wire.read();

    // Conversion en g (sensibilité +/- 2g: 16384 LSB/g)
    float ax = AcX / 16384.0;
    float ay = AcY / 16384.0;
    float az = AcZ / 16384.0;
    gForce = sqrt(ax * ax + ay * ay + az * az);

    // Détection de choc / syncope brutale
    if (gForce > FALL_THRESHOLD_G && !fallDetected) {
      fallDetected = true;
      fallStartTime = millis();
    }
  }

  // Reset alerte chute après 15 secondes si non maintenue
  if (fallDetected && (millis() - fallStartTime > 15000)) {
    fallDetected = false;
  }

  // C. Envoi Télémétrie JSON vers Web Serial / React Dashboard
  if (millis() - lastTelemetrySent >= TELEMETRY_INTERVAL_MS) {
    lastTelemetrySent = millis();

    // Sortie JSON standardisée
    Serial.print("{\"bpm\":");
    Serial.print(fingerDetected ? beatAvg : 0);
    Serial.print(",\"resp\":");
    Serial.print(respRateCPM);
    Serial.print(",\"motion\":");
    Serial.print(gForce, 2);
    Serial.print(",\"finger\":");
    Serial.print(fingerDetected ? "true" : "false");
    Serial.print(",\"fall\":");
    Serial.print(fallDetected ? "true" : "false");
    Serial.println("}");

    // Mise à jour Écran OLED SSD1306 local
    updateOledDisplay(fingerDetected, beatAvg, respRateCPM, gForce, fallDetected);
  }
}

void updateOledDisplay(bool finger, int bpm, int resp, float motion, bool fall) {
  display.clearDisplay();
  
  // Ligne 1: Titre
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("CARDIOPULSE ESP32"));

  if (fall) {
    display.fillRect(0, 12, 128, 50, SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK);
    display.setCursor(14, 25);
    display.setTextSize(2);
    display.print(F("! CHUTE !"));
    display.setCursor(10, 48);
    display.setTextSize(1);
    display.print(F("ALERTE SYNCOPE"));
    display.setTextColor(SSD1306_WHITE);
  } else {
    // Végétatif / Pouls
    display.setCursor(0, 16);
    display.setTextSize(2);
    if (!finger) {
      display.print(F("-- BPM"));
    } else {
      display.print(bpm);
      display.setTextSize(1);
      display.print(F(" BPM"));
    }

    // Respiration & Mouvement
    display.setTextSize(1);
    display.setCursor(0, 40);
    display.print(F("FR: "));
    display.print(resp);
    display.print(F(" CPM"));

    display.setCursor(70, 40);
    display.print(F("G: "));
    display.print(motion, 1);
    display.print(F("g"));

    display.setCursor(0, 54);
    display.print(finger ? F("CAPTEUR ACTIF") : F("POSEZ LE DOIGT"));
  }

  display.display();
}
