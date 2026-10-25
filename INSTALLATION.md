# KBT_AppGuideVideo - Multi-Platform Native Installation & Deployment Guide

This guide provides step-by-step instructions for engineering instructors and students to build and package **KBT_AppGuideVideo** as a native application across:
- **Android** (.apk / .aab for Google Play & Sideloading)
- **iOS** (PWA offline installation & Apple App Store via Capacitor)
- **Windows** (.exe / .msi installer via Tauri / Rust)
- **macOS** (.dmg / .app bundle with Apple Silicon & Intel support)
- **Linux** (.AppImage / .deb via PipeWire)

---

## 1. Prerequisites & Environment Setup

Ensure the following runtimes are installed on your build machine:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **Git**: For version control and asset tagging
- **Rust & Cargo**: (For Windows, macOS, and Linux native Tauri builds): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

Clone and install dependencies:
```bash
git clone https://github.com/kbt-systems/kbt-appguidevideo.git
cd kbt-appguidevideo
npm install
npm run build
```

---

## 2. Android APK & AAB (Google Play / Direct Sideloading)

Android enforces strict background process limits. The native wrapper uses **Capacitor** with an Android **Foreground MediaProjection Service**.

### Step 2.1: Initialize Capacitor for Android
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "KBT AppGuideVideo" "com.kbt.appguidevideo" --web-dir=dist
npx cap add android
```

### Step 2.2: Configure Android Permissions
Edit `android/app/src/main/AndroidManifest.xml` and add the foreground service and projection permissions inside `<manifest>`:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="KBT AppGuideVideo"
    android:hardwareAccelerated="true">
    
    <!-- Foreground capture daemon service -->
    <service
        android:name=".services.MediaProjectionDaemonService"
        android:enabled="true"
        android:exported="false"
        android:foregroundServiceType="mediaProjection" />
</application>
```

### Step 2.3: Build Signed APK and Android App Bundle (AAB)
```bash
# Sync web distribution to Android asset folder
npm run build
npx cap sync android

# Build release APK
cd android
./gradlew assembleRelease

# Output APK path:
# android/app/build/outputs/apk/release/app-release-unsigned.apk

# Build Google Play AAB:
./gradlew bundleRelease
# Output AAB path:
# android/app/build/outputs/bundle/release/app-release.aab
```

Sign the APK with your university/institution keystore:
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.keystore app-release-unsigned.apk alias_name
zipalign -v 4 app-release-unsigned.apk KBT_AppGuideVideo_v2.4.apk
```

---

## 3. iOS Deployment (PWA & Native IPA via Capacitor)

### Option A: Direct Progressive Web App (PWA) Offline Installation (Recommended for Quick Student Access)
1. Open the application URL in **Safari on iOS**.
2. Tap the **Share** button (box with upward arrow) in the Safari toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"**. The application will now run standalone with full-screen viewport, offline asset caching, and native webview audio synthesis.

### Option B: Native iOS Application (.ipa) via Capacitor & Xcode
```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
```
In **Xcode**:
1. Select your developer signing team under **Signing & Capabilities**.
2. Add `Privacy - Microphone Usage Description` and `Privacy - Camera Usage Description` in `Info.plist`.
3. Choose **Product > Archive** to generate the distribution `.ipa` file or test on connected iPads/iPhones.

---

## 4. Windows Desktop Application (.exe / .msi Installer)

We use **Tauri** to wrap the application with a high-performance Rust backend capable of direct Windows Desktop Duplication API (`IDXGIOutputDuplication`) interop.

### Step 4.1: Install Tauri CLI
```bash
npm install --save-dev @tauri-apps/cli
npx tauri init
```

### Step 4.2: Configure `src-tauri/tauri.conf.json`
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:3000",
    "distDir": "../dist"
  },
  "package": {
    "productName": "KBT_AppGuideVideo",
    "version": "2.4.0"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["msi", "nsis"],
      "identifier": "com.kbt.appguidevideo",
      "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.ico"]
    },
    "windows": [
      {
        "title": "KBT AppGuideVideo Studio",
        "width": 1440,
        "height": 900,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

### Step 4.3: Compile the Windows Installer
```bash
npm run tauri build
```
- **Output Setup Installer (.exe)**: `src-tauri/target/release/bundle/nsis/KBT_AppGuideVideo_2.4.0_x64-setup.exe`
- **Output Enterprise Installer (.msi)**: `src-tauri/target/release/bundle/msi/KBT_AppGuideVideo_2.4.0_x64_en-US.msi`

---

## 5. macOS Desktop Application (.dmg Bundle)

Build high-performance universal binaries supporting both Apple Silicon (M1/M2/M3/M4 with ARM NEON SIMD) and Intel x86_64 chips.

```bash
# Build universal binary for Apple Silicon & Intel
npm run tauri build -- --target universal-apple-darwin
```
- **Output Disk Image (.dmg)**: `src-tauri/target/universal-apple-darwin/release/bundle/dmg/KBT_AppGuideVideo_2.4.0_universal.dmg`
- **Output macOS App Bundle**: `src-tauri/target/universal-apple-darwin/release/bundle/macos/KBT_AppGuideVideo.app`

Students can drag and drop `KBT_AppGuideVideo.app` directly into their `Applications` folder!

---

## 6. Linux Desktop (.AppImage & .deb)

For Ubuntu, Debian, Fedora, Arch, and Red Hat distributions with **PipeWire** zero-copy capture:

```bash
# Ubuntu / Debian build requirements:
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Build AppImage & Debian package
npm run tauri build
```
- **Portable Linux Binary**: `src-tauri/target/release/bundle/appimage/KBT_AppGuideVideo_2.4.0_amd64.AppImage`
- **Debian Package**: `src-tauri/target/release/bundle/deb/kbt-appguidevideo_2.4.0_amd64.deb`

Run standalone on Linux:
```bash
chmod +x KBT_AppGuideVideo_2.4.0_amd64.AppImage
./KBT_AppGuideVideo_2.4.0_amd64.AppImage
```

---

## 7. Direct Website Download Links Architecture

To embed direct download links on your university course portal or class website:

```html
<div class="download-grid">
  <!-- Android -->
  <a href="/downloads/android/KBT_AppGuideVideo_v2.4.apk" class="download-card">
    <span class="icon">🤖</span>
    <strong>Android APK</strong>
    <span>Direct Sideload (Android 9+)</span>
  </a>

  <!-- Windows -->
  <a href="/downloads/windows/KBT_AppGuideVideo_2.4.0_x64-setup.exe" class="download-card">
    <span class="icon">🪟</span>
    <strong>Windows Installer (.exe)</strong>
    <span>Windows 10 / 11 64-bit</span>
  </a>

  <!-- macOS -->
  <a href="/downloads/macos/KBT_AppGuideVideo_2.4.0_universal.dmg" class="download-card">
    <span class="icon">🍎</span>
    <strong>macOS Universal (.dmg)</strong>
    <span>Apple Silicon & Intel Mac</span>
  </a>

  <!-- Linux -->
  <a href="/downloads/linux/KBT_AppGuideVideo_2.4.0_amd64.AppImage" class="download-card">
    <span class="icon">🐧</span>
    <strong>Linux (.AppImage)</strong>
    <span>Universal Linux (PipeWire enabled)</span>
  </a>
</div>
```

---

## 8. Verification & Student Troubleshooting

| Issue | Root Cause | Solution |
|---|---|---|
| Black screen in recording | Missing OS Screen Recording permissions | In macOS System Settings > Privacy & Security > Screen Recording, grant permissions to the app. In Windows, ensure DXGI Desktop Duplication is permitted. |
| Microphone silent | Audio context suspended | Click anywhere inside the applet window to resume the Web Audio AudioContext. |
| TTS audio not speaking | System voice not loaded yet | Speech synthesis voices load asynchronously; wait 1-2 seconds or select a different system voice from the dropdown. |
| Android capture crash | Missing Foreground service declaration | Verify `MediaProjectionDaemonService` is declared with `foregroundServiceType="mediaProjection"` in `AndroidManifest.xml`. |
