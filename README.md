# KBT_AppGuideVideo - Software User Guide & Capstone Engineering Suite

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/kbt-systems/kbt-appguidevideo)
[![Languages](https://img.shields.io/badge/languages-22%20Supported-success.svg)](#22-supported-languages)
[![Firebase](https://img.shields.io/badge/database-Firestore%20Sync-orange.svg)](#firebase-firestore-cloud-sync--project-archive)
[![AI Subtitles](https://img.shields.io/badge/AI-Gemini%20API-purple.svg)](#ai-powered-voiceover-synthesis--smart-scripting-gemini-api)
[![Audio](https://img.shields.io/badge/audio-LUFS%20Normalization%20%2B%20Noise%20Gate-cyan.svg)](#lufs-loudness-normalization--smart-audio-mixer)
[![Analytics](https://img.shields.io/badge/Recharts-Export%20Analytics-emerald.svg)](#recharts-export-analytics--benchmarklab-debugger)
[![Voice Commands](https://img.shields.io/badge/speech-Web%20Speech%20API-red.svg)](#ai-powered-voice-command-recognition-system)

An enterprise-grade multimedia capture, video encoding, systems telemetry, multi-track audio engineering, and interactive tutorial authoring suite designed for international computer science and systems programming students.

Inspired by **OBS Studio, Camtasia, ScreenFlow, Scribe, Guidde, and Loom**, this system combines rapid cross-platform video capture with low-level systems architectures, SIMD vectorization algorithms, and distributed render pipelines across **22 international programming languages**.

---

## 🌟 Comprehensive Feature Suite

### 1. ⚡ Fast Export Hotkey & Dedicated Export Configuration
- **Instant Hotkey (<kbd>Ctrl+E</kbd> / <kbd>Cmd+E</kbd>)**: Triggers immediate export of the active recording project based on current format and quality parameters without opening multi-step dialogs.
- **Advanced Export (<kbd>Ctrl+Shift+E</kbd>)**: Opens the quality preset and configuration modal.
- **Export Sub-Menu in Settings**: Dedicated section inside `SettingsModal` allowing users to bind and customize distinct hotkeys for Fast Export versus Advanced Export via the `kbt-hotkey` event bus.
- **Reset Studio Hotkey (<kbd>Shift+R</kbd>)**: Instantly resets color filters, screen annotation strokes, crop framing, and project metadata to default values.

### 2. 🎙️ AI-Powered Voice Command Recognition System
- **Hands-Free Control via Web Speech API**: Integrated voice controller running continuous speech recognition mapped directly to the `kbt-hotkey` event bus.
- **Supported Natural Language Phrases**:
  - *"start recording"*, *"record"*, *"begin recording"* &rarr; `TOGGLE_RECORDING`
  - *"stop recording"*, *"finish recording"*, *"stop"* &rarr; `TOGGLE_RECORDING`
  - *"toggle camera"*, *"camera"*, *"webcam"* &rarr; `TOGGLE_CAM`
  - *"toggle mic"*, *"mute microphone"* &rarr; `TOGGLE_MIC`
  - *"fast export"*, *"quick export"* &rarr; `FAST_EXPORT`
  - *"reset studio"*, *"clear studio"* &rarr; `RESET_STUDIO`
  - *"toggle draw"*, *"highlight"* &rarr; `TOGGLE_DRAW`
  - *"toggle crop"* &rarr; `TOGGLE_CROP`
  - *"toggle timer"* &rarr; `TOGGLE_TIMER`
- Visual pulsing microphone HUD displays real-time transcript and confidence feedback.

### 3. 🎥 Multi-Cam Director & Picture-in-Picture (PiP) Layout
- **Multi-Source Video Input Switching**: Switch seamlessly between Primary display, IDE simulator, secondary webcam, or external hardware capture cards.
- **Configurable PiP Framing**:
  - **Corner Positioning**: Top-Left, Top-Right, Bottom-Left, Bottom-Right.
  - **Custom Geometry**: Circle (Loom bubble), Rounded Rectangle, or Square.
  - **Size Scaling**: Small (100px), Medium (150px), Large (220px).
  - **Accent Borders & Mirroring**: Custom border colors and horizontal camera flip.

### 4. 📈 Real-Time Video Encoding Progress Bar & Auditory Feedback
- **Header Progress Percentage Pill**: Displays dynamic encoding percentage (`Exporting 45%...`) in the top studio navigation deck.
- **Bottom Encoding Progress Bar**: Full-width gradient progress bar (`0%` to `100%`) positioned beneath the main stage during video rendering.
- **Web Audio Success Chime**: Non-intrusive auditory confirmation melody synthesized directly via the Web Audio API on successful render completion (D5 &rarr; A5 &rarr; F#6).

### 5. 📋 Pre-Export Summary & Detailed Post-Export Analytics Modal
- **Pre-Export Summary**: Displays calculated estimate of duration, bitrate, and expected file size based on resolution and selected codec preset.
- **Post-Export Report Modal**: Automatically launches upon export completion:
  - Total render time (seconds) and effective encoding speed.
  - Final file size vs. estimated uncompressed raw size with exact storage savings (e.g. *72% savings*).
  - Average bitrate (Mbps) and dropped frame count (0 drops).
  - One-click **Download File** and **Share Snippet** buttons with centered animated success badge.

### 6. 🗂️ Global Export Templates (Firestore Synced)
- **Instant Mode Switching**:
  - **Presentation Ready**: 1080p 60fps MP4 (H.264), -14 LUFS loudness target, crisp standard grading.
  - **Mobile Social**: 1080x1920 (9:16) 30fps MP4, -11 LUFS target, punchy contrast LUT for TikTok/Reels/Shorts.
  - **Raw Archive**: 1080p 60fps WebM (VP9 lossless profile), -23 LUFS broadcast standard.
- **Cloud Persistence**: Saved templates sync automatically across user devices via Firebase Firestore (`/exportTemplates`).

### 7. 📊 BenchmarkLab: Recharts Export Analytics & Hotkey Event Bus Debugger
- **Visual Analytics Powered by Recharts**:
  - **Average Render Time Bar Chart**: Render durations across MP4, WebM, and GIF formats.
  - **Export Format Distribution Pie Chart**: Visual breakdown of most utilized export containers.
  - **Total File Size Generated Area Chart**: Cumulative bytes saved and bandwidth consumed.
  - **Live Hardware Performance Stream Line Chart**: Live tracking of frame drop rate, encoding speed, and CPU utilization.
- **Hotkey Event Bus Debugger Modal**: Interactive inspector listing all active window event listeners with manual event triggers to verify event bus routing.

### 8. 🐙 Version Control Tab: GitHub Repository Metadata Sync
- **GitHub Authentication**: Connect via Firebase GitHub Auth or Personal Access Token (PAT) with `repo` scope permissions.
- **Repository Browser & Tree View**: Fetches remote repository list and visualizes full project tree structure with selectable checkboxes.
- **One-Click Metadata Push**: Serializes current studio state, subtitles, scribe steps, and configuration into `kbt_studio_metadata.json` and commits directly to the remote repository via the GitHub REST API (`/repos/{owner}/{repo}/contents/{path}`).
- **Header Sync Badge**: Live pill indicator in the header reflecting `'Synced'`, `'Syncing'`, or `'Unsynced'` status.

### 9. 🎚️ LUFS Loudness Normalization & Smart Audio Mixer
- **ITU-R BS.1770-4 Standard Normalization**: Built-in K-weighting pre-filter and psychoacoustic loudness measurement.
- **Preset Loudness Targets**:
  - `-14 LUFS`: YouTube & Streaming Video standard.
  - `-16 LUFS`: Apple Podcasts & Voiceover standard.
  - `-23 LUFS`: EBU R128 / ATSC A/85 Television Broadcast standard.
  - `-11 LUFS`: Mobile Social (TikTok, Instagram Reels).
- **Multi-Track Mixer**: Independent gain sliders, mute switches, digital noise gate (-42 dB threshold), and dynamic range compressor.

### 10. 🤖 AI-Powered Voiceover Synthesis & Smart Scripting (Gemini API)
- **Voiceover Synthesis Studio**: Converts written lesson scripts into multi-language speech tracks using Gemini 3.8 Flash (`/api/gemini/voiceover`).
- **Selectable Voice Personas**: Puck (Energetic Engineer), Charon (Authoritative Architect), Kore (Warm Educator), Fenrir (Technical Deep-Dive), and Aoede (Expressive Narrator).
- **Smart Scripting Assistant**: Analyzes project metadata and suggests structured tutorial outline headers and timestamps using Gemini 3.8 Flash (`/api/gemini/outline`).

### 11. 🖼️ Project Archive Sidebar with Static Screenshot Thumbnails
- **Instant Visual Identification**: Every saved session automatically captures and stores a static thumbnail JPEG snapshot directly from the recording canvas.
- **Archive Cards**: Displays thumbnail image preview, duration badge, resolution, aspect ratio, and one-click session restore.

### 12. ⚡ Studio Actions 1-Click Execution Sidebar
- **Visual Control Alternative**: Retractable sidebar listing all recording and studio commands with one-click buttons, providing complete workflow control for users who prefer visual interaction over hotkeys.

### 13. 🔍 Global Search Modal (<kbd>Ctrl+K</kbd>) & Accessibility Focus Rings
- **Unified Quick Finder**: Instant search across blueprints, documentation, and saved recording sessions.
- **Accessibility Hardening**: Distinct, accessible Tailwind focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`) applied to all interactive elements.

### 14. 🌓 Global Dark / Light UI Theme Switcher
- **Tailwind Dark Mode**: Seamlessly toggles between sleek dark studio theme and high-contrast light theme with persistent storage in localStorage.

---

## ⌨️ Default Keyboard Shortcuts

| Shortcut | Action | Description |
|---|---|---|
| <kbd>Ctrl+E</kbd> | `FAST_EXPORT` | Immediately render and export active project |
| <kbd>Ctrl+Shift+E</kbd> | `ADVANCED_EXPORT` | Open export options and quality preset dialog |
| <kbd>Shift+R</kbd> | `RESET_STUDIO` | Reset filters, annotations, crop, and metadata |
| <kbd>Space</kbd> | `TOGGLE_RECORDING` | Start or stop video recording |
| <kbd>X</kbd> | `TOGGLE_CROP` | Toggle interactive video cropping tool |
| <kbd>F</kbd> | `CYCLE_FILTER` | Cycle through color grading LUTs and retro filters |
| <kbd>T</kbd> | `TOGGLE_TIMER` | Toggle on-canvas timer overlay |
| <kbd>C</kbd> | `TOGGLE_CAM` | Toggle camera bubble |
| <kbd>M</kbd> | `TOGGLE_MIC` | Toggle microphone audio track |
| <kbd>P</kbd> | `PREVIEW_TTS` | Preview TTS speech synthesis in active language |
| <kbd>D</kbd> | `TOGGLE_DRAW` | Toggle real-time screen drawing & highlighter |
| <kbd>G</kbd> | `TOGGLE_TELEMETRY` | Toggle real-time GPU/CPU D3 telemetry overlay |
| <kbd>Ctrl+K</kbd> | `GLOBAL_SEARCH` | Open Global Search modal |

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies & Standards |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Video Compositor** | HTML5 Canvas 2D, MediaStream Capture, Interactive Cropping Engine, WebM VP9 / MP4 H.264 / GIF89a Encoders |
| **Audio Pipeline** | Web Audio API, ITU-R BS.1770-4 LUFS Normalizer, MultiTrack Audio Mixer, Digital Noise Gate, Frequency Spectrum Visualizer |
| **Speech & Voice** | Web Speech API (continuous voice command controller), SpeechSynthesisUtterance |
| **Analytics & Viz** | Recharts (Bar, Pie, Area, Line charts for export metrics), D3.js (spline telemetry) |
| **Version Control** | GitHub REST API (`v3`), Tree View selector, Commit & Push engine |
| **AI Systems** | Google Gemini API (`gemini-3.8-flash`) for Smart Scripting and Voiceover synthesis |
| **Database & Sync** | Firebase Firestore (security rules with ABAC), Firebase Auth |
| **Backend Proxy** | Express full-stack entrypoint (`server.ts`), Vite middleware mode |

---

## 🌐 22 Supported Languages

1. English (`en`)
2. Spanish (`es`)
3. French (`fr`)
4. German (`de`)
5. Italian (`it`)
6. Portuguese (`pt`)
7. Russian (`ru`)
8. Japanese (`ja`)
9. Korean (`ko`)
10. Chinese Simplified (`zh`)
11. Arabic (`ar`)
12. Hindi (`hi`)
13. Turkish (`tr`)
14. Dutch (`nl`)
15. Polish (`pl`)
16. Swedish (`sv`)
17. Indonesian (`id`)
18. Vietnamese (`vi`)
19. Thai (`th`)
20. Greek (`el`)
21. Czech (`cs`)
22. Hebrew (`he`)

---

## 🧪 Verification & Interactive Testing Protocol

1. **Test Fast Export (<kbd>Ctrl+E</kbd>)**:
   - Press <kbd>Ctrl+E</kbd> or click **Fast Export** in the top toolbar.
   - Observe the header percentage pill animate, the bottom progress bar fill, and the auditory success chime play.
   - Verify the **Post-Export Report Modal** opens displaying bitrate, render time, and file size savings.

2. **Test Voice Command Recognition**:
   - Click the microphone icon on the **Voice Commands** pill in the toolbar.
   - Speak *"start recording"*, *"toggle camera"*, or *"fast export"*.
   - Confirm the on-screen hotkey HUD toast confirms the action.

3. **Test Multi-Cam Director**:
   - Click **Multi-Cam** in the toolbar.
   - Switch secondary input device and adjust picture-in-picture position to **Bottom-Right** and shape to **Circle**.
   - Verify the camera bubble repositions cleanly.

4. **Test Global Export Templates**:
   - Click **Templates** in the toolbar.
   - Select **Mobile Social** (9:16 vertical 1080x1920) or **Presentation Ready**.
   - Confirm the aspect ratio, format, and resolution update instantly.

5. **Test BenchmarkLab Recharts Dashboard & Debugger**:
   - Navigate to the **BenchmarkLab** tab.
   - Switch to the **Export Analytics & Recharts** sub-tab to inspect render time bars, format distribution pie, and live performance stream.
   - Click **Hotkey Event Bus Debugger** to inspect listeners and trigger manual test events.

6. **Test GitHub Version Control Sync**:
   - Open **Settings** &rarr; **Version Control** tab.
   - Enter a GitHub Personal Access Token with `repo` scope, select a repository, and browse the file tree.
   - Click **Push Metadata to GitHub** and observe the header sync badge update to **'Synced'**.

7. **Test Static Screenshot Thumbnails**:
   - Complete a recording session.
   - Open the **Archive** sidebar and verify the session card displays a static thumbnail screenshot image captured from the recording canvas.
