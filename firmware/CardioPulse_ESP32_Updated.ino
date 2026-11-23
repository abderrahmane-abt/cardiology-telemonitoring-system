#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Prototype pedagogique uniquement - pas un appareil de diagnostic.
#define SDA_PIN 21
#define SCL_PIN 22
#define MAX_ADDR 0x57
#define MPU_ADDR 0x68
#define IGNORER_ERREURS 0 // mettre 1 pour continuer meme si un capteur ne repond pas

// --- Reglages SpO2 (estimation NON calibree) ---
#define SPO2_A 110.0f // SpO2 = A - B * R (R = rapport rouge/IR)
#define SPO2_B 25.0f

// --- Reglages detection de chute ---
#define FALL_IMPACT_G 2.5f   // choc : acceleration superieure a 2.5 g
#define FALL_STILL_G 0.25f   // "immobile" : |acceleration - 1 g| < 0.25 g
#define FALL_STILL_MS 1500   // duree d'immobilite apres le choc pour confirmer
#define FALL_WINDOW_MS 6000  // delai max apres le choc pour confirmer la chute
#define FALL_ALERT_MS 15000  // duree d'affichage de l'alerte

#define FALL_IDLE 0
#define FALL_CHECK 1
#define FALL_ALERT 2

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
bool oledOk = false, ppgOk = false, mpuOk = false;

// --- Pouls ---
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
int bpmAvg = 0;
bool finger = false;
uint32_t sampleIdx = 0, lastBeatIdx = 0;
float fastV = 0, slowV = 0, env = 0;
bool beatInit = false, beatHigh = false;

// --- SpO2 ---
float dcRed = 0, dcIr = 0, fRed = 0, fIr = 0;
float sumSqRed = 0, sumSqIr = 0;
uint16_t spoN = 0;
bool spoInit = false, spoSkip = true;
float spo2f = 0;
int spo2 = 0;

// --- Respiration ---
float angleFast = 0, angleSlow = 0;
bool angleInit = false, breathHigh = false;
unsigned long lastBreath = 0;
float intervals[4];
byte intSpot = 0, intCount = 0;
float respRate = 0;

// --- Chute & Mouvement ---
byte fallState = FALL_IDLE;
float currentG = 1.0f;
unsigned long tImpact = 0, tStill = 0, tAlert = 0, tFall = 0;
unsigned long tMpu = 0, tOled = 0, tSerial = 0;

// ---------- Fonctions I2C ----------
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

// ---------- MAX30102 ----------
bool maxInit() {
  uint8_t id;
  if (!readRegs(MAX_ADDR, 0xFF, &id, 1)) return false;
  writeReg(MAX_ADDR, 0x09, 0x40); // reset
  delay(100);
  writeReg(MAX_ADDR, 0x04, 0);    // vider le FIFO
  writeReg(MAX_ADDR, 0x05, 0);
  writeReg(MAX_ADDR, 0x06, 0);
  writeReg(MAX_ADDR, 0x08, 0x1F); // pas de moyennage, rollover
  writeReg(MAX_ADDR, 0x09, 0x03); // mode SpO2 (rouge + IR)
  writeReg(MAX_ADDR, 0x0A, 0x27); // plage 4096, 100 Hz, 411 us
  writeReg(MAX_ADDR, 0x0C, 0x3F); // courant LED rouge
  writeReg(MAX_ADDR, 0x0D, 0x3F); // courant LED IR
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

// ---------- MPU6050 ----------
bool mpuInit() {
  bool ok = writeReg(MPU_ADDR, 0x6B, 0x00); // reveil MPU6050
  writeReg(MPU_ADDR, 0x1C, 0x10);          // plage +-8 g (4096 LSB/g)
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

// ---------- Affichage OLED ----------
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

  // --- [TRANSMISSION TÉLÉMÉTRIQUE VERS LE SITE WEB] ---
  if (millis() - tSerial >= 100) {
    tSerial = millis();
    Serial.print("{\"bpm\":");
    Serial.print(finger ? bpmAvg : 0);
    Serial.print(",\"resp\":");
    Serial.print((int)respRate);
    Serial.print(",\"spo2\":");
    Serial.print(spo2);
    Serial.print(",\"motion\":");
    Serial.print(currentG, 2);
    Serial.print(",\"finger\":");
    Serial.print(finger ? "true" : "false");
    Serial.print(",\"fall\":");
    Serial.print(fallState == FALL_ALERT ? "true" : "false");
    Serial.println("}");
  }
}
