# KBT_AppGuideVideo - Software User Guide & Capstone Engineering Suite

[![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)](https://github.com/kbt-systems/kbt-appguidevideo)
[![Languages](https://img.shields.io/badge/languages-22%20Supported-success.svg)](https://github.com/kbt-systems/kbt-appguidevideo)
[![License](https://img.shields.io/badge/license-Apache--2.0-green.svg)](LICENSE)

An advanced multi-platform screen recording, telemetry logging, and interactive tutorial creation studio designed for international computer science and systems programming students.

Inspired by **OBS Studio, Camtasia, ScreenFlow, Scribe, Guidde, and Loom**, this system combines rapid cross-platform delivery with low-level systems architectures, SIMD vectorization algorithms, and distributed render pipelines across **22 international programming languages**.

---

## 🌟 Key Features

- 🎥 **Studio Screen & Camera Recorder**:
  - Live capture via `getDisplayMedia` or interactive embedded IDE Simulator.
  - Floating, draggable Loom-style circular webcam bubble.
  - Canvas compositor with mouse click ripple animations and cursor highlight halos.
  - Real-time Web Audio API VU meter and Fast Fourier Transform (FFT) waveform.
  - Client-side production export to **MP4** and **WebM** containers (1080p 60FPS / 720p 30FPS).

- 📝 **Visual Annotations & Captions Engine**:
  - **Timed Text Metadata Tracks (Softsubs)**: Timestamped cue editor with direct export to **WebVTT (`.vtt`)** and **SubRip (`.srt`)** for YouTube and LMS platforms.
  - **Automated Scribe/Guidde Workflow Guides**: Captures clicks, coordinates, keystrokes, and DOM mutations into step-by-step interactive documentation with code blocks.
  - **22 International Languages**: Instant one-click translation across 22 languages.

- 🗣️ **Cross-Browser Text-to-Speech (TTS)**:
  - Powered by native browser `window.speechSynthesis`.
  - Smart system voice matcher selecting the optimal voice for each of the 22 languages.
  - Full play, pause, resume, stop, and speech rate / pitch controls.
  - Dynamic audio waveform animation and synchronous step highlighting.

- 📚 **Comprehensive 22-Language User Guide**:
  - Accessible directly in-app via the **"User Guide"** button in 22 languages with integrated TTS.
  - Complete documentation mirrored in `USER_GUIDE.md`.

- 💻 **22-Language Production Capstone Blueprints**:
  - Complete, runnable, syntax-highlighted code modules covering all 5 architectural pillars.
  - Interactive benchmarks & simulators (SIMD AVX2 color conversion speed, Rust lock-free ring buffer, MATLAB audio noise filter, COBOL batch manifest billing report, and SQL telemetry queries).

- 📦 **Multi-Platform Native Installers**:
  - End-to-end instructions in `INSTALLATION.md` for Android (APK/AAB), iOS (PWA/Capacitor), Windows (.exe/.msi via Tauri), macOS (.dmg universal), and Linux (.AppImage/.deb).

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
