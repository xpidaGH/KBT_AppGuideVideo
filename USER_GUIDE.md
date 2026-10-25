# KBT_AppGuideVideo - Software User Guide & Capstone Engineering Manual

**Version**: 2.4.0  
**Target Audience**: Advanced International Programming Students & Media Systems Engineers  
**Supported Languages**: 22 Languages (English, French, German, Italian, Spanish, Portuguese, Indonesian, Swahili, Turkish, Russian, Chinese, Japanese, Arabic, Urdu, Hindi, Vietnamese, Korean, Farsi, Marathi, Bangla, Tamil, Telugu)  
**Inspirations**: OBS Studio, Camtasia, ScreenFlow, Scribe, Guidde, and Loom

---

## 1. Executive Summary & Architectural Philosophy

Modern screen recording and tutorial creation systems are often mistaken for simple GUI applications. In reality, modern tools like OBS Studio, Camtasia, and Loom operate as **high-throughput real-time operating system subsystems, SIMD-accelerated computer vision pipelines, and distributed cloud render farms**.

**KBT_AppGuideVideo** provides an international capstone architecture across 22 programming languages structured under 5 engineering pillars:

1. **Desktop & Low-Level Architecture** (`C++`, `Rust`, `Go`, `C`, `Assembly (x86_64 AVX2 / ARM NEON)`, `PowerShell`)
2. **Multi-Platform Mobile Systems** (`Dart/Flutter`, `Kotlin`, `Java`, `Swift`)
3. **Distributed Web & Cloud Pipelines** (`TypeScript`, `JavaScript`, `Python`, `C#`)
4. **Enterprise Data & Analytics Engine** (`SQL`, `R`, `Scala`, `Java`)
5. **Legacy & Core Business Logic Translation** (`PHP`, `Ruby`, `MATLAB`, `COBOL`)

---

## 2. The 5 Core Engineering Pillars in Detail

### Pillar 1: Desktop & Low-Level Architecture (C++, Rust, Go, C, Assembly, PowerShell)
*Persona: The High-Performance Native Capture Engine (OBS Studio & Camtasia)*
- **Zero-Copy Frame Capture**: Hooks directly into OS GPU display engines (`Windows IDXGIOutputDuplication`, `macOS ScreenCaptureKit`, `Linux PipeWire`) bypassing userland RAM copies.
- **SIMD Color Space Conversion**: Transforms packed `BGRA32` to planar `NV12` (YUV 4:2:0) utilizing 256-bit AVX2 vector instructions (or ARM NEON on Apple Silicon) with memory alignment optimizations.
- **Lock-Free Asynchronous Ring Buffer**: Implemented in Rust to decouple the 60FPS frame capture thread from asynchronous disk I/O, preventing frame jitter.
- **Hardware-Accelerated Muxing**: Direct C++ bindings to `libavcodec` and `libavformat` utilizing NVENC (NVIDIA), AMF (AMD), or QuickSync (Intel) for h.264/h.265 video with AAC audio.
- **OS Automation & Stress Testing**: PowerShell and Bash scripts for headless continuous stress-testing and virtual audio loopback assertion.

### Pillar 2: Multi-Platform Mobile Systems (Dart/Flutter, Kotlin, Java, Swift)
*Persona: The Ambient Mobile Recorder & Screen-Off Daemon (Loom Mobile)*
- **Foreground MediaProjection Daemon**: Kotlin service utilizing persistent notifications and strict low-memory killer (OOM) avoidance.
- **Hardware MediaCodec Surface Pipe**: Java/Kotlin byte surface feeding hardware video encoders without CPU heap saturation.
- **Native MethodChannel Interop**: Dart/Flutter architecture managing capture lifecycles, configuration, and binary PCM audio gain manipulation via JNI.
- **Resiliency Engine**: Automatic handling of incoming cellular calls, screen rotation mid-stream, battery saver mode throttling, and storage limits.

### Pillar 3: Distributed Web & Cloud Pipelines (TypeScript, JavaScript, Python, C#)
*Persona: The Headless Browser Automator & AI Voiceover Render Farm (Guidde & Loom Web)*
- **DOM Event Capture Engine**: Client-side TypeScript telemetry interceptor logging mouse clicks, bounding client rectangles, keypresses, and DOM mutations in a strict JSON schema.
- **Headless Render Cluster**: Node.js / C# worker farm orchestrating headless Playwright/Puppeteer instances, executing deterministic timeline replays.
- **AI Synthesis & Video Asset Composite**: Python FastAPI microservice utilizing `MoviePy` and `FFmpeg` to stitch mouse ripple animations, callout badges, and text-to-speech audio onto the final MP4.

### Pillar 4: Enterprise Data & Analytics Engine (SQL, R, Scala, Java)
*Persona: The Interaction Telemetry Lake & Quality of Service Analytics Platform*
- **High-Throughput Streaming Ingestion**: Scala Akka/Pekko stream processing millions of user interaction events per second.
- **Relational Interaction Database**: TimescaleDB / PostgreSQL schema mapping student cohorts, video timeline chapter markers, and click heatmap coordinates.
- **Retention Modeling & Anomaly Detection**: R scripts evaluating learning metrics to flag confusing segments where viewers pause, rewind, or exit.

### Pillar 5: Legacy & Core Business Logic Translation (PHP, Ruby, MATLAB, COBOL)
*Persona: The Legacy Asset Inventory System & Waveform Analysis Matrix*
- **Distributed Media Catalog API**: PHP 8.3 and Ruby on Rails RESTful backends handling chunked S3 multi-part uploads, metadata parsing, and LMS authorization.
- **Digital Audio Signal Processing (DSP)**: MATLAB scripts running Fast Fourier Transform (FFT) analysis to remove background hiss, normalize audio, and detect silence intervals for automatic trimming.
- **Batch Manifest Billing Engine**: COBOL-85 batch job processing day-end video catalogs and computing bandwidth distribution charges across academic network nodes.

---

## 3. Studio Screen Recording & Real-time Compositor

1. **Screen Capture Mode**: Click **"Start Capture"** to request browser display sharing (`getDisplayMedia`) or use the built-in **Interactive IDE Simulator**.
2. **Camera Bubble**: Toggle the floating circular webcam bubble. Click and drag it to reposition anywhere on the canvas, just like Loom.
3. **Canvas Compositor Effects**:
   - **Click Ripple Animations**: Every mouse click renders a glowing, expanding concentric ripple to draw student attention.
   - **Cursor Highlight Halo**: A soft amber glow tracks the mouse pointer to prevent lost focus.
   - **Audio VU Meter**: Real-time Decibel audio monitoring connected to your microphone via the Web Audio API.
4. **Recording Lifecycle**:
   - `Record` (Red Button) -> Live recording counter starts.
   - `Pause / Resume` -> Seamless pause without breaking the container stream.
   - `Stop & Review` -> Generates instant playback preview and enables one-click MP4 / WebM export.

---

## 4. Visual Annotations: Softsubs vs Scribe Workflows

Toggle the **"Add Visual Annotations"** switch in the control bar to choose between two industry-standard documentation paradigms:

### Paradigm A: Timed Text Metadata Tracks (Softsubs)
- Create and edit timestamped subtitle cues (e.g. `00:00:01.000 -> 00:00:05.500`).
- Softsubs render cleanly on top of the live video player.
- **Export Options**:
  - **WebVTT (`.vtt`)**: Compatible with HTML5 `<track>` tags and modern web video players.
  - **SubRip (`.srt`)**: Compatible with YouTube Studio, Vimeo, Canvas LMS, Blackboard, and Moodle.

### Paradigm B: Automated Scribe/Guidde Workflow Guides
- Automatically logs user interactions as structured step cards.
- Each step records the exact coordinate `(x, y)`, action type (`CLICK`, `TYPE`, `NAVIGATE`), target element name, screenshot preview, and editable instructions.
- Export as Markdown documentation or interactive JSON schema.

### 22-Language Instant Translation
- Select any of the **22 supported international languages** from the language dropdown.
- All annotation titles, descriptions, and subtitle tracks are translated instantly for international students!

---

## 5. Native Text-to-Speech (TTS) Voiceover Engine

- Powered by the native browser `window.speechSynthesis` API.
- **Smart Voice Discovery**: Automatically queries available operating system voices (Google, Microsoft, Apple, Android) and selects the best native match for the selected language code (e.g. `fr-FR`, `de-DE`, `es-ES`, `zh-CN`, `ja-JP`, `ar-SA`, `hi-IN`).
- **Full Playback Controls**:
  - `Play Voiceover`: Reads the annotations or user guide aloud.
  - `Pause / Resume`: Temporarily halts narration without losing the position.
  - `Stop`: Cancels active speech synthesis.
  - `Speed & Pitch`: Calibrate voice speed from 0.75x to 1.5x.
- **Active Step Synchronization**: During playback, the current workflow step is highlighted with an active glowing ring and animated sound waves.

---

## 6. Multi-Platform Native Installation (Android, iOS, Windows, macOS, Linux)

To compile and distribute KBT_AppGuideVideo as a native desktop or mobile package for students:
- Click the **"Native Install Guide"** button in the header.
- Refer to `INSTALLATION.md` for complete CLI build scripts:
  - **Android APK / AAB**: Built via Capacitor 6 + Android Gradle with foreground MediaProjection service.
  - **iOS Application**: Built via Capacitor or installed as an offline Progressive Web App (PWA).
  - **Windows Desktop (`.exe` / `.msi`)**: Built via Tauri (Rust native backend) or Electron.
  - **macOS (`.dmg`)**: Built with ScreenCaptureKit Swift bindings.
  - **Linux (`.AppImage` / `.deb`)**: Built with PipeWire backend.

---

## 7. Keyboard Shortcuts & Productivity Tips

| Action | Shortcut | Description |
|---|---|---|
| Toggle Recording | `Space` / `R` | Start or pause the current recording session |
| Stop Recording | `Esc` / `S` | Finalize session and open export modal |
| Toggle Annotations | `Alt + A` | Switch visual annotations drawer visibility |
| Switch Mode | `Tab` | Switch between Softsubs and Scribe Workflow view |
| Next Step Voice | `Alt + N` | Trigger TTS speech for next workflow step |
| User Guide Modal | `?` or `F1` | Open this 22-Language User Guide |

---

*Authored by KBT Systems Architecture Group - Inspiring the next generation of systems software engineers worldwide.*
