# KBT_AppGuideVideo - Software User Guide & Capstone Engineering Suite

[![Version](https://img.shields.io/badge/version-2.5.0-blue.svg)](https://github.com/kbt-systems/kbt-appguidevideo)
[![Languages](https://img.shields.io/badge/languages-22%20Supported-success.svg)](https://github.com/kbt-systems/kbt-appguidevideo)
[![License](https://img.shields.io/badge/license-Apache--2.0-green.svg)](LICENSE)
[![Hotkeys](https://img.shields.io/badge/shortcuts-Global%20Hotkeys-indigo.svg)](#keyboard-shortcuts--hotkeys)

An advanced multi-platform screen recording, telemetry logging, and interactive tutorial creation studio designed for international computer science and systems programming students.

Inspired by **OBS Studio, Camtasia, ScreenFlow, Scribe, Guidde, and Loom**, this system combines rapid cross-platform delivery with low-level systems architectures, SIMD vectorization algorithms, and distributed render pipelines across **22 international programming languages**.

---

## 🌟 Key Features

- 🎥 **Studio Screen & Camera Recorder**:
  - Live capture via `getDisplayMedia` (native screen sharing) or interactive embedded IDE Simulator.
  - Floating, draggable Loom-style circular webcam bubble.
  - Multi-layer canvas compositor with mouse click ripple animations and cursor highlight halos.
  - Real-time Web Audio API VU meter and Fast Fourier Transform (FFT) waveform.
  - **Real-Time Recording Timer Overlay**: Configurable, toggleable recording clock directly composited onto video frames (`DEFAULT_STUDIO_CONFIG`, `TIMER_OVERLAY_STYLE`).
  - Client-side production export to **MP4** and **WebM** containers (1080p 60FPS / 720p 30FPS).

- 🎨 **Real-Time Video Filter & Color-Correction LUT Pipeline**:
  - Live hardware-accelerated 2D canvas color grading pipeline (`ctx.filter` & pixel-level algorithmic LUT).
  - Presets: **Normal (Raw)**, **Grayscale (ITU-R BT.709)**, **Sepia (Vintage Warm Film)**, **High Contrast (Punchy Clarity)**, **Warm Sunlight (Golden Hour)**, **Cyberpunk (Teal & Cool Cyan)**, **Bleach Bypass (Cinema Silver)**, and **Invert (Thermal / Night Vision)**.
  - Active LUT is rendered directly into the composited video stream (`canvas.captureStream()`) so exported MP4 and WebM videos have the chosen color grading baked in.
  - Interactive top-deck dropdown selector, quick-access preset swatch bar, and real-time canvas watermark HUD badge (`LUT: [PRESET]`).

- ⌨️ **Global Keyboard Listener & Shortcuts HUD**:
  - App-level global keyboard listener (`window.addEventListener('keydown')`) with intelligent form-input bypass.
  - Space key toggle for starting and stopping recording (`e.preventDefault()` prevents unwanted scrolling).
  - Dedicated hotkey `F` to cycle through color-correction LUT presets in real time.
  - Dedicated hotkey `T` to toggle real-time recording timer overlay on the video canvas.
  - Dedicated hotkey `C` to toggle circular camera bubble.
  - Dedicated hotkey `M` to toggle microphone audio track.
  - Dedicated hotkey `P` to trigger instant TTS preview in the active language.
  - Small, sleek **Shortcuts Overlay** HUD in `StudioRecorder` displaying active key mappings and recording state.

- 🗣️ **22-Language Text-to-Speech (TTS) & Volume Control**:
  - Direct integration with native browser `window.speechSynthesis`.
  - Configurable `ttsVolume` slider (0.0 to 1.0) linked directly to `SpeechSynthesisUtterance.volume`.
  - **Preview TTS** button to immediately verify audio settings using localized phrases in all 22 supported languages.
  - System voice auto-matcher selecting the optimal voice matching the language's BCP-47 tag.

- 📝 **Visual Annotations & Captions Engine**:
  - **Timed Text Metadata Tracks (Softsubs)**: Timestamped cue editor with direct export to **WebVTT (`.vtt`)** and **SubRip (`.srt`)** for YouTube and LMS platforms.
  - **Automated Scribe/Guidde Workflow Guides**: Captures clicks, coordinates, keystrokes, and DOM mutations into step-by-step interactive documentation with code blocks.
  - **22 International Languages**: One-click instant translation of tutorials and guides across 22 languages.

- 💻 **22-Language Production Capstone Blueprints Hub**:
  - Complete, runnable, syntax-highlighted code modules covering all 5 architectural pillars.
  - Interactive benchmarks & simulators (SIMD AVX2 color conversion speed, Rust lock-free ring buffer, MATLAB audio noise filter, COBOL batch manifest billing report, and SQL telemetry queries).

---

## ⌨️ Keyboard Shortcuts & Hotkeys

The application features a root-level global keyboard listener in the `App` component that continuously captures hotkeys while automatically ignoring input fields, textareas, and dropdown menus:

| Key | Action | Description |
|---|---|---|
| <kbd>Space</kbd> | `TOGGLE_RECORDING` | Starts or stops the recording session (prevents page scroll) |
| <kbd>F</kbd> | `CYCLE_FILTER` | Cycles through real-time video color-correction LUT presets |
| <kbd>T</kbd> | `TOGGLE_TIMER` | Toggles the real-time recording timer/clock overlay on canvas |
| <kbd>C</kbd> | `TOGGLE_CAM` | Toggles the circular Loom-style camera bubble on/off |
| <kbd>M</kbd> | `TOGGLE_MIC` | Toggles the microphone audio track on/off |
| <kbd>P</kbd> | `PREVIEW_TTS` | Triggers a quick TTS speech synthesis test in selected language |

These shortcuts are mapped in the small **Shortcuts Overlay** inside the `StudioRecorder` viewport. Users can collapse or expand this HUD anytime via the `Shortcuts` button in the top deck or the floating viewport pill.

---

## 🧪 How Students Can Test applet

Students, educators, and evaluators can verify the entire studio pipeline by following this step-by-step interactive test protocol:

### Step 1: Verify Global Hotkeys & Shortcuts Overlay
1. Ensure focus is outside any text inputs (click anywhere in the main studio viewport).
2. Press <kbd>Space</kbd>:
   - Observe that the recording starts immediately (`Start Recording` switches to active recording mode, timer starts counting, audio meter pulses).
   - Press <kbd>Space</kbd> again to stop recording and trigger the export preparation.
3. Press <kbd>F</kbd>:
   - Observe that the active Color-Correction LUT cycles in real-time (Normal -> Grayscale -> Sepia -> Hi-Contrast -> Warm -> Cool -> Bleach -> Invert).
   - Notice the live preview in the viewport and the `LUT: [NAME]` badge on the canvas update instantly.
4. Press <kbd>T</kbd>:
   - Notice the real-time recording clock overlay in the top-left corner of the video preview toggles on and off.
   - The checkbox labeled `Timer Overlay` in the top control deck updates in sync.
5. Press <kbd>C</kbd>:
   - Notice the circular Loom-style webcam bubble toggles visibility.
6. Press <kbd>M</kbd>:
   - Notice the microphone track toggles between active and muted.
7. Press <kbd>P</kbd>:
   - Listen to the browser's TTS synthesis voice recite the test phrase in the currently active language at the configured volume.
8. Inspect the **Shortcuts Overlay** in the bottom-left of the studio viewport:
   - Click the `X` button to minimize to a compact pill button.
   - Click the pill or the `Shortcuts` button in the top deck to expand the HUD back.

### Step 2: Test Timer Overlay Customization & Canvas Compositing
1. Check the `Timer Overlay` checkbox (`#recording-timer-overlay-checkbox`) or press <kbd>T</kbd>.
2. When recording is active, notice the timer badge displays:
   - A pulsing red dot indicating active recording.
   - Formatted duration counter `REC HH:MM:SS`.
   - Crisp rendering on top of the compositor canvas at 60 FPS.
3. When recording is stopped or idle, the overlay shows `IDLE 00:00:00` with an emerald indicator.

### Step 3: Test 22-Language TTS Voice & Volume Control
1. In the top control deck, locate the **TTS Vol** slider (`#tts-volume-slider-top`).
2. Slide the volume to `30%`, then click the **Preview TTS** button (`#preview-tts-button`) or press <kbd>P</kbd>.
   - Hear the synthesized utterance play at lower volume.
3. Slide the volume to `100%` and click **Preview TTS** again.
   - Hear the utterance speak at full volume.
4. Click the speaker icon to test one-click mute (0%) and unmute (100%).
5. Change the app language in the top bar (e.g., from English to French, Japanese, German, or Hindi):
   - Click **Preview TTS** to verify that the speech engine switches to the native test phrase and corresponding BCP-47 voice.

### Step 4: Test Real-Time Video Filter & Color-Correction LUT Pipeline
1. In the top deck, click the **LUT: [Name]** dropdown button (`#color-filter-lut-dropdown-btn`) or use the **Color LUT** quick preset pill bar:
   - Select **Grayscale**: verify black-and-white monochrome tone (ITU-R BT.709 standard).
   - Select **Sepia**: verify vintage warm amber grading.
   - Select **Hi-Contrast**: verify punchy contrast expansion and boosted highlight clarity.
   - Select **Warm LUT** or **Cool Teal**: verify color temperature balance shift.
   - Select **Invert**: verify inverted tonal luminescence for dark-mode thermal inspections.
2. Verify that the canvas watermark badge in the top-right corner displays `LUT: [NAME]`.
3. Press <kbd>Space</kbd> to record a short clip with an active filter applied, then export to MP4/WebM:
   - Verify that the exported video contains the filtered color correction burnt directly into the video stream before encoding.

### Step 5: Test Interactive IDE Simulator & Automated Scribe Step Capture
1. In the studio viewport, ensure `Embedded IDE Simulator` is selected.
2. Click on the buttons inside the simulator (`Run Build`, `Toggle Theme`, or input test text):
   - Notice the expanding ripple rings and cursor halo rendered on the compositor canvas.
   - Check the **Visual Annotations Drawer** below the viewport: new workflow steps are automatically captured with precise coordinates and timestamps.
3. Click **Add Step** or edit existing steps:
   - Edit titles, descriptions, and code snippets.
   - Switch between **Timed Softsubs** and **Workflow Guide (Scribe)** modes.
4. Click **Export WebVTT (.vtt)** or **Export SubRip (.srt)**:
   - Verify that standard timestamped caption files download immediately.

### Step 6: Test Hardware Container Export (MP4 / WebM)
1. Select output format quality (e.g. `1080p Full HD` at `60 FPS`).
2. Record for at least 3–5 seconds using <kbd>Space</kbd>.
3. Click **Stop & Export** or **Export MP4**:
   - The system muxes the recorded chunks into an MP4/WebM video container and initiates automatic download.
   - Open the downloaded video in VLC, QuickTime, or Chrome to verify audio/video sync, color LUT grading, and canvas graphics.

### Step 7: Test Systems Capstone Blueprints Hub & Benchmark Lab
1. Click the **Blueprints Hub** tab in the navigation bar:
   - Explore all 22 programming languages categorized by the 5 architectural pillars.
   - Click through C++, Rust, Kotlin, Go, Python, and COBOL to inspect production source code.
2. Click the **Benchmark Lab** tab:
   - Run the **AVX2 SIMD vs Scalar Benchmark** to measure throughput and speedup ratios.
   - Run the **Rust Lock-Free Ring Buffer Simulator** to inspect thread-safe packet transfer with zero drops.

---

## 📦 Cross-Platform Packaging

The KBT_AppGuideVideo suite is engineered for cross-platform deployment across Web (PWA), Desktop (Windows, macOS, Linux), and Mobile (Android, iOS).

```
                            [ KBT_AppGuideVideo Codebase ]
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
    [ Progressive Web App ]     [ Desktop Application ]       [ Mobile Application ]
    • Vite PWA Plugin           • Electron (electron-builder) • Capacitor Native Bridge
    • Service Worker Caching    • Tauri (Rust Core)           • Android MediaProjection
    • Web App Manifest          • Windows (.exe, .msi)        • iOS ReplayKit
    • Offline Asset Precaching  • macOS (.dmg Universal)      • Foreground Daemon
                                • Linux (.AppImage, .deb)
```

### 1. Web & Progressive Web App (PWA)

The web bundle compiles as a zero-dependency client SPA optimized for modern browsers:

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build
```

To configure PWA offline installation:
- **Manifest**: Located in `public/manifest.json` defining `display: standalone`, `theme_color: #09090b`, and icon assets (192x192, 512x512).
- **Service Worker**: Cache shell assets, fonts, and language data tables for offline recording capability.
- **HTTPS Requirement**: `navigator.mediaDevices.getDisplayMedia` requires a secure origin (HTTPS or `localhost`).

---

### 2. Desktop Native Packaging (Windows, macOS, Linux)

#### Option A: Electron Desktop Build

Electron provides complete access to OS desktop capture APIs and native menus:

```bash
# 1. Install Electron and packager
npm install -D electron electron-builder concurrently wait-on

# 2. Package for Windows
npx electron-builder --win nsis:ia32,x64

# 3. Package for macOS (Universal Binary for Intel & Apple Silicon)
npx electron-builder --mac dmg --universal

# 4. Package for Linux
npx electron-builder --linux AppImage deb
```

**Main Process Configuration (`electron/main.ts`)**:
```ts
import { app, BrowserWindow, desktopCapturer, session } from 'electron';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#09090b',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js',
    },
  });

  // Enable screen & window capture permissions
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' });
    });
  });

  mainWindow.loadURL(process.env.DEV_URL || `file://${__dirname}/../dist/index.html`);
}

app.whenReady().then(createWindow);
```

#### Option B: Tauri Native Packaging (Lightweight Rust Core)

For ultra-low memory overhead and direct SIMD AVX2 acceleration:

```bash
# 1. Install Tauri CLI
npm install -D @tauri-apps/cli

# 2. Initialize Tauri configuration
npx tauri init

# 3. Build native binaries (.msi for Windows, .dmg for macOS, .deb for Linux)
npx tauri build
```

---

### 3. Mobile Native Packaging (Android & iOS)

Using **Capacitor** to bridge the React application to Android Studio and Apple Xcode:

```bash
# 1. Install Capacitor core and CLI
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android @capacitor/ios

# 2. Initialize Capacitor project
npx cap init "KBT Studio" "com.kbt.appguidevideo" --web-dir dist

# 3. Build React assets
npm run build

# 4. Add platform projects
npx cap add android
npx cap add ios

# 5. Sync web build into native wrappers
npx cap sync
```

#### Android Configuration (`AndroidManifest.xml`)
To enable full-screen recording and microphone telemetry on Android:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />

    <application
        android:label="KBT Studio"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">
        <service
            android:name="com.kbt.appguidevideo.MediaProjectionService"
            android:foregroundServiceType="mediaProjection"
            android:exported="false" />
    </application>
</manifest>
```

Build the release APK/AAB:
```bash
npx cap open android
# In Android Studio: Build -> Generate Signed Bundle / APK
```

#### iOS Configuration (`Info.plist`)
For camera, microphone, and ReplayKit screen capture:
```xml
<key>NSCameraUsageDescription</key>
<string>KBT Studio requires camera access for the circular webcam bubble overlay.</string>
<key>NSMicrophoneUsageDescription</key>
<string>KBT Studio requires microphone access to record voiceover commentary.</string>
```

Build the iOS project:
```bash
npx cap open ios
# In Xcode: Product -> Archive
```

---

## 🏛️ The 5 Architectural Pillars & 22 Languages

```
[ FRONTEND CAPTURE & TELEMETRY ]
  ├── Desktop (C++, Rust) ───► Zero-Copy GPU Textures ──┐
  ├── Mobile (Flutter/Kotlin) ► Foreground Daemon ──────┤► [ RAW MULTIMEDIA STREAMS ]
  └── Web (TypeScript Extension) ► DOM Event Telemetry ┘             │
                                                                     ▼
[ DISTRIBUTED STORAGE & PROCESSING ]                         [ FFmpeg ENGINE CORE ]
  ├── PHP / Ruby (API Catalog & IAM Controls)                ├── libavcodec (NVENC / AMF)
  └── Python / C# (Microservice Headless Render Farm) ───────┤── Audio Muxer (PCM to AAC)
                                                              └── OUTPUT: Production MP4
                                                                      │
                                                                      ▼
[ ANALYTICS & SYSTEM MANAGEMENT ]                            [ LMS PLATFORMS / YOUTUBE ]
  ├── Scala / Java (High-Throughput Telemetry Ingestion)
  ├── SQL (Time-Series Interaction Mapping Database)
  └── R / MATLAB (Retention Modeling & Audio Signal Processing)
```

| Pillar | Languages | Focus Area |
|---|---|---|
| **1. Desktop & Low-Level** | C, C++, Rust, Go, Assembly (AVX2/NEON), PowerShell | Zero-copy VRAM capture, SIMD BGRA-to-NV12 color conversion, lock-free ring buffer, FFmpeg hardware muxing, OS audio driver automation |
| **2. Multi-Platform Mobile** | Kotlin, Java, Dart/Flutter, Swift | Android MediaProjection foreground service, OOM resiliency, JNI binary PCM buffer, iOS ReplayKit bridge |
| **3. Distributed Cloud & Web** | TypeScript, JavaScript, Python, C# | DOM event telemetry hooks, Playwright headless browser cluster, FastAPI + MoviePy AI narration render farm |
| **4. Enterprise Analytics** | SQL, R, Scala, Java | Akka/Pekko streaming telemetry ingestion, TimescaleDB interaction mapping, R student retention drop-off models |
| **5. Legacy & DSP Engines** | PHP, Ruby, MATLAB, COBOL | S3 multi-part chunked media catalog, MATLAB FFT audio hiss filter & silence trimmer, COBOL-85 bandwidth billing manifest |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Compile production bundle
npm run build
```

Open `http://localhost:3000` in your web browser.

---

## 📄 Documentation Links

- [Complete User Guide (USER_GUIDE.md)](./USER_GUIDE.md)
- [Native Installation & Build Manual (INSTALLATION.md)](./INSTALLATION.md)
