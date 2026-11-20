# 🫀 CardioPulse-ESP32 Telemonitoring System

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.3-cyan.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-rose.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-indigo.svg)](https://vitejs.dev/)
[![Web Serial API](https://img.shields.io/badge/Web%20Serial-USB%20Direct-amber.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
[![Theme: ICU Obsidian](https://img.shields.io/badge/Theme-ICU%20Obsidian-purple.svg)](#)

An advanced, real-time clinical telemonitoring platform engineered for medical faculties, university hospitals (CHU), and biomedical research demonstrations.

Built with direct **ESP32 microcontroller hardware integration**, the system processes live photoplethysmography (**PPG MAX30102**), thoracic respiratory inclinometry (**MPU6050**), and emergency fall/syncope telemetry, accompanied by an accelerated **3D anatomical beating heart model** and dual-channel sweep oscilloscopes.

---

## ⚡ 1-Click Launch (The Easiest Way)

We provide automated 1-click startup scripts for both Linux and Windows that verify prerequisites, install dependencies, launch the local development server, and automatically open your default browser:

### 🐧 Linux / macOS
```bash
# 1. Clone repository
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
cd cardiology-telemonitoring-system

# 2. Make executable and run
chmod +x run.sh
./run.sh
```

### 🪟 Windows 10 / 11
1. Open the project folder in File Explorer.
2. **Double-click `run.bat`** (or execute `.\run.bat` or `.\run.ps1` in PowerShell / Terminal).
3. The script will automatically verify Node.js, install packages, and open `http://localhost:5173` in your browser.

---

## 📋 Comprehensive Setup Guide by Operating System

### 🐧 Ubuntu / Debian / Linux Mint (Recommended Step-by-Step)

> [!IMPORTANT]
> **Avoid `sudo apt install nodejs` alone!**  
> On Ubuntu/Debian, the default repository installs an outdated Node.js (v12 or v14), which will cause Vite and React 19 to fail. Follow the steps below to install **Node.js 20 LTS** cleanly:

#### Step 1: Install Git, cURL & Build Tools
```bash
sudo apt update
sudo apt install -y git curl build-essential
```

#### Step 2: Install Node.js 20 LTS (via official NodeSource repository)
```bash
# Add NodeSource official repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and npm
sudo apt install -y nodejs

# Verify versions (Node must be >= 18.0.0, npm >= 9.x)
node -v
npm -v
```

*(Alternative without sudo: install via [NVM](https://github.com/nvm-sh/nvm): `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && source ~/.bashrc && nvm install 20`)*

#### Step 3: Clone, Install & Start
```bash
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
cd cardiology-telemonitoring-system
npm install
npm run dev
```

Open your browser at: 👉 **`http://localhost:5173`**

---

### 🪟 Windows 10 / 11 Setup

#### Step 1: Install Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/) and download the **Node.js 20 LTS (Long Term Support)** Windows Installer (`.msi`).
2. Run the installer. **Important:** Ensure the checkbox **"Add to PATH"** is selected.

#### Step 2: Install Git for Windows
1. Download Git from [https://git-scm.com/download/win](https://git-scm.com/download/win).
2. Install with default settings.

#### Step 3: Clone and Launch
Open **PowerShell** or **Command Prompt**:
```powershell
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
cd cardiology-telemonitoring-system
npm install
npm run dev
```
Or simply double-click `run.bat` in the folder.

---

### 🍏 macOS Setup

Using [Homebrew](https://brew.sh/):
```bash
# 1. Install Node.js and Git
brew install node git

# 2. Clone and start
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
cd cardiology-telemonitoring-system
chmod +x run.sh
./run.sh
```

---

## 🔌 Hardware Setup & Arduino / ESP32 Integration

The system supports **direct plug-and-play USB connection** via the Web Serial API (Chrome / Edge / Opera) without needing a backend server or serial bridge.

### 1. Bill of Materials (BOM)
| Component | Protocol | Bus Address | Function |
|---|---|---|---|
| **ESP32 DevKit V1** | UART / USB | 115200 bauds | Central microcontroller, dual-core acquisition |
| **MAX30102** | I2C | `0x57` | Optical PPG biosensor (Heart rate & SpO2) |
| **MPU6050** | I2C | `0x68` | 6-DOF IMU (Thoracic breathing excursion & Fall shock) |
| **SSD1306 OLED** | I2C | `0x3C` | 0.96" local patient monitor display |

### 2. Wiring Diagram
* **I2C Bus:**
  * **SDA** ➔ ESP32 **GPIO 21**
  * **SCL** ➔ ESP32 **GPIO 22**
  * **VCC** ➔ **3.3V**
  * **GND** ➔ **GND**
  *(4.7kΩ pull-up resistors recommended on SDA/SCL lines)*

### 3. Flash Arduino Firmware
1. Open the Arduino IDE.
2. Install board support for **ESP32** (by Espressif) and libraries:
   * `SparkFun MAX3010x Pulse and Proximity Sensor Library`
   * `Adafruit MPU6050` & `Adafruit BusIO`
   * `Adafruit SSD1306` & `Adafruit GFX Library`
   * `ArduinoJson` (v6 or v7)
3. Open the firmware source code located at:  
   👉 [`firmware/CardioPulse_ESP32.ino`](file:///home/moorix/Desktop/cardiology-telemonitoring-system/firmware/CardioPulse_ESP32.ino)
4. Select your ESP32 board and COM port, then click **Upload**.

### 4. Connect Web Application to Hardware
1. Open the web application at `http://localhost:5173` in Google Chrome or Microsoft Edge.
2. In the top navigation bar, click **"Connecter USB"**.
3. Select your ESP32 serial port (e.g. `ttyUSB0` / `ttyACM0` on Linux, `COM3` on Windows).
4. The monitor immediately transitions into **"ESP32 En Ligne"** mode and visualizes live volunteer telemetry!

> [!TIP]
> **Linux USB Permission Note:**  
> If your browser says "Access Denied" when connecting to `/dev/ttyUSB0` on Linux, add your user to the `dialout` group:  
> `sudo usermod -a -G dialout $USER`  
> *(Then log out and log back in for changes to take effect).*

---

## 🩺 Key Clinical Features

1. **Photorealistic 3D Beating Heart Model:**
   * Dynamic WebGL canvas driven by Three.js with real-time anatomical pulse contraction.
   * Anatomical callout reticles highlighting the *Aortic Arch*, *Pulmonary Trunk*, *Left Ventricle*, and *Apex Cordis*.
   * Persistent multi-tier model caching for instant 0 ms reloads.

2. **Dual-Channel High-Speed Oscilloscopes:**
   * **Channel 1 (Emerald):** Real-time Photoplethysmography (PPG) dicrotic wave tracing.
   * **Channel 2 (Cyan):** Thoracic expansion and breathing rhythm waveform.
   * Adjustable sweep speeds (25 mm/s and 50 mm/s) and freeze-frame analysis.

3. **Vagal Syncope & Fall Detection Algorithm:**
   * Continuous triaxial acceleration and postural pitch monitoring ($> 2.5g$ impact threshold).
   * Automated 15-second acoustic and visual alarm protocol with one-click false alarm cancellation (`JE VAIS BIEN`).
   * Emergency protocol dispatch with SAMU **580** hotline and WhatsApp emergency payload with GPS coordinates.

4. **Patient Biometric & Obstetric Record:**
   * Full patient identity (*Nom, Prénom, Âge, Taille, Poids, IMC calculé automatiquement*).
   * Obstetric tracking with Gestational Age in weeks of amenorrhea (**SA**).
   * Blood group and emergency contact directory.

5. **Historical Calendar & Clinical Reports:**
   * Date-indexed logging of vital sign measurements.
   * Trend tracking for tachycardia, bradycardia, and normocardia episodes.

---

## 🛠️ Tech Stack

* **Frontend Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build System & Bundler:** [Vite 8](https://vitejs.dev/)
* **Styling & HUD Design:** [Tailwind CSS v4](https://tailwindcss.com/) + Custom ICU Obsidian Theme
* **3D Visualizations:** [Three.js](https://threejs.org/) + WebGL GLTF Skeletal Loader
* **Hardware Interface:** Native Browser [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) (115200 bps UART)
* **Embedded Firmware:** Arduino C++ / ESP32 FreeRTOS

---

## 📄 License
This project is licensed under the [MIT License](LICENSE) - open for academic, clinical, and biomedical research use.
