# 🫀 Cardiology Telemonitoring System (CardioPulse-ESP32)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.3-cyan.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-rose.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-indigo.svg)](https://vitejs.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-blue.svg)](https://tailwindcss.com/)

An advanced, real-time biomedical telemonitoring application designed for clinical cardiovascular and obstetric surveillance. Built for connected hardware (ESP32, MAX30102 optical PPG pulse sensor, and MPU6050 thoracic biomechanical sensor), this system integrates photoplethysmography (PPG), respiratory cycles, posture/syncope fall-detection algorithms, and an accelerated 3D anatomical beating heart model.

---

## ⚡ Quickstart (Run Locally in 2 Minutes)

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (bundled with Node.js)

### Installation & Launch

```bash
# 1. Clone this repository
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git

# 2. Enter the project directory
cd cardiology-telemonitoring-system

# 3. Install dependencies
npm install

# 4. Start the local development server
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🌟 Key Clinical Features

1. **Photorealistic 3D Beating Heart Model:**
   - Real-time GLB skeletal animation synchronized with patient heart rate (BPM).
   - Anatomical leader lines and caliper badges pointing to the **Aortic Arch**, **Pulmonary Trunk**, **Left Ventricle**, and **Cardiac Apex**.
   - Dual-tier in-memory and CacheStorage API caching (0 ms reload boot time).

2. **Real-time Biomedical Oscilloscopes:**
   - High-fidelity **Photoplethysmography (PPG)** dicrotic notch pulse wave simulation.
   - **Thoracic Respiratory Inclinometry** based on MPU6050 accelerometer axis tracking.
   - Trace freeze, gain toggle, and sweep speed controls (25 mm/s / 50 mm/s).

3. **Multi-View Clinical Layout Switcher (DEV Switcher):**
   - **Mara Bureau Style:** Crisp clinical light theme for outpatient consultation.
   - **Nickel Fox Style:** High-contrast hospital dashboard with deep indigo glassmorphism.
   - **Lume Cyber Style:** Futuristic neon cyber-medical telemetry mode.
   - **ICU Hôpital Style:** Philips IntelliVue-inspired obsidian cockpit featuring Mean Arterial Pressure (MAP), Cardiac Output (CO), Perfusion Index (PI), and Systemic Vascular Resistance (SVR).

4. **Syncope Detection & Emergency Protocol (580):**
   - Continuous posture and shock threshold monitoring (>2.5g impact detection).
   - Automated 15-second countdown with visual and acoustic distress beacons.
   - One-click bypass / cancellation button (`JE VAIS BIEN`) for false alarms.
   - Emergency dispatch procedure with GPS coordinates and tele-assistance hotline (**580**).

5. **Physical Hardware Simulator:**
   - Virtual **SSD1306 OLED (128x64)** patient monitor mimicking on-device firmware display.
   - ESP32 Serial UART telemetry generator (115200 bauds, JSON telemetry frames).
   - Clinical stress-testing profiles (Sinusal, Tachycardia, Bradycardia, Finger Removed, Syncope Fall).

---

## 🛠️ Hardware BOM & Architecture (ESP32)

| Component | Interface | Operating Voltage | Function |
|---|---|---|---|
| **ESP32 DevKit V1** | UART / WiFi / BLE | 3.3V (LDO) | Central microcontroller, dual-core processing |
| **MAX30102** | I2C (0x57) | 3.3V | Optical PPG biosensor (IR 880nm + Red 660nm) |
| **MPU6050** | I2C (0x68) | 3.3V | 6-DOF IMU (accelerometer for respiratory expansion & falls) |
| **SSD1306 OLED** | I2C (0x3C) | 3.3V | 0.96" local patient vital signs display |

> **Wiring Note:** The I2C bus is shared on **GPIO 21 (SDA)** and **GPIO 22 (SCL)** with 4.7kΩ pull-up resistors to 3.3V.

---

## 📦 Project Structure

```
├── public/
│   └── models/
│       └── heart.glb               # High-definition 3D anatomical heart asset
├── src/
│   ├── components/
│   │   ├── DevStyleSwitcher.tsx     # Floating multi-theme selector
│   │   ├── EmergencyAlert/          # Emergency modal & protocol view
│   │   ├── Sidebar.tsx              # Collapsible icon-rail clinical menu
│   │   ├── TopNavbar.tsx            # Patient status bar
│   │   └── VitalsDashboard/         # 3D canvas, oscilloscopes, OLED simulator, layouts
│   ├── types/
│   │   ├── medical.ts               # Clinical telemetry type definitions
│   │   └── themeStyles.ts           # 4-theme styling & shader configurations
│   ├── utils/
│   │   ├── modelCache.ts            # Fast multi-tier 3D model cache
│   │   └── mockData.ts              # Clinical case study & parameters
│   ├── App.tsx                      # Main app shell & routing
│   └── main.tsx                     # React application entrypoint
├── index.html                       # HTML5 template with asset preloading
├── vite.config.ts                   # Vite bundler configuration
└── package.json
```

---

## 📜 License
Distributed under the MIT License. Developed for research and biomedical educational demonstration.
