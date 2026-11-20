# 🫀 CardioPulse-ESP32 Telemonitoring System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20(Zero%20Setup)-emerald?style=for-the-badge&logo=githubpages&logoColor=white)](https://abderrahmane-abt.github.io/cardiology-telemonitoring-system/)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.3-cyan.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-rose.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-indigo.svg)](https://vitejs.dev/)
[![Web Serial API](https://img.shields.io/badge/Web%20Serial-USB%20Direct-amber.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
[![Theme: ICU Obsidian](https://img.shields.io/badge/Theme-ICU%20Obsidian-purple.svg)](#)

An advanced, real-time clinical telemonitoring platform engineered for medical faculties, university hospitals (CHU), and biomedical research demonstrations.

Built with direct **ESP32 microcontroller hardware integration**, the system processes live photoplethysmography (**PPG MAX30102**), thoracic respiratory inclinometry (**MPU6050**), and emergency fall/syncope telemetry, accompanied by an accelerated **3D anatomical beating heart model** and dual-channel sweep oscilloscopes.

---

## 🌐 INSTANT ACCESS: Live Online Web App (No Installation Required)

For doctors, faculty evaluators, or team members who simply want to test or use the platform:
👉 **[Open Live Telemonitoring System](https://abderrahmane-abt.github.io/cardiology-telemonitoring-system/)**

> [!NOTE]
> Because GitHub Pages is served over secure **HTTPS**, **direct USB hardware connection with your ESP32 works directly in the browser** via the Web Serial API (Chrome, Edge, Brave, or Opera on desktop). No local server required!

---

## 🚀 LOCAL METHOD: 1-Click Automated Launchers

> [!TIP]
> **Why use this method?**  
> You don't need to manually configure libraries, update Node.js, install npm packages, or type URLs. The scripts handle **100% of the setup automatically** and launch the application directly in your browser.

---

### 🐧 For Linux / Ubuntu / Debian / macOS Users

#### Step 1: Open your Terminal
On Ubuntu, press `Ctrl` + `Alt` + `T` to open a terminal window.

#### Step 2: Clone the repository and enter the directory
```bash
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
cd cardiology-telemonitoring-system
```

#### Step 3: Run the script
```bash
chmod +x run.sh && ./run.sh
```

#### ✨ What the script does for you automatically:
1. **Checks Node.js:** If Node.js is missing or too old (< v18), the script prompts you with `[Y/n]` and automatically installs the official **Node.js 20 LTS** using `apt`.
2. **Installs Libraries:** Runs `npm install` automatically on first launch.
3. **Starts the Server:** Launches the local Vite development server.
4. **Opens Browser:** Automatically opens your default web browser to:  
   👉 **`http://localhost:5173`**

#### 🔄 How to catch up on latest updates:
Whenever updates are pushed to GitHub, simply run:
```bash
git pull && ./run.sh
```

---

### 🪟 For Windows 10 / 11 Users (No Terminal Skills Needed!)

#### Step 1: Clone or Download the project
Clone via Git:
```powershell
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
```
*(Or click the green **Code ➔ Download ZIP** button on GitHub and extract the folder).*

#### Step 2: Double-click `run.bat`
1. Open the project folder in Windows File Explorer.
2. Locate the file named **`run.bat`**.
3. **Double-click it!**

#### ✨ What the Windows script does for you automatically:
1. **Verifies Node.js:** If Node.js is missing, it will automatically attempt to install Node.js 20 LTS using Windows Package Manager (`winget`) or direct you to the official installer.
2. **Installs Libraries:** Automatically runs `npm install` if `node_modules` is not found.
3. **Spins up the Engine:** Launches the Vite local telemetry server.
4. **Opens Browser:** Automatically pops open your default web browser to:  
   👉 **`http://localhost:5173`**

*(PowerShell users can also run `.\run.bat` or `.\run.ps1`).*

---

## 💻 SECONDARY METHOD: Manual Terminal Commands (For Developers)

If you are a developer and prefer running standard terminal commands yourself without using the helper scripts:

### 1. Manual Setup on Ubuntu / Debian / Linux Mint

> [!IMPORTANT]
> **Do not use `sudo apt install nodejs` alone!**  
> The default Ubuntu apt repository contains an ancient Node.js version (v12/v14). Vite and React 19 require **Node.js $\ge$ 18.0.0** (Node 20 LTS is strongly recommended).

```bash
# 1. Update package lists and install build tools
sudo apt update
sudo apt install -y git curl build-essential

# 2. Add NodeSource Node 20 LTS repository & install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Verify installed versions
node -v   # Output should be v20.x.x
npm -v    # Output should be 9.x or 10.x

# 4. Clone repository
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
cd cardiology-telemonitoring-system

# 5. Install dependencies and run development server
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

*(Alternative: install via [NVM](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`)*

---

### 2. Manual Setup on Windows 10 / 11

1. Download and install **Node.js 20 LTS** from [https://nodejs.org/](https://nodejs.org/) *(check "Add to PATH" during installation)*.
2. Download and install **Git for Windows** from [https://git-scm.com/](https://git-scm.com/).
3. Open **PowerShell** or **Command Prompt** and run:
   ```powershell
   git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
   cd cardiology-telemonitoring-system
   npm install
   npm run dev
   ```
4. Open **`http://localhost:5173`** in your browser.

---

### 3. Manual Setup on macOS

Using [Homebrew](https://brew.sh/):
```bash
brew install node git
git clone https://github.com/abderrahmane-abt/cardiology-telemonitoring-system.git
cd cardiology-telemonitoring-system
npm install
npm run dev
```

---

## 🔌 Hardware Setup & Arduino / ESP32 Integration

The system supports **direct plug-and-play USB connection** via the Web Serial API (Chrome / Edge / Opera) without needing any backend server or serial bridge.

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
