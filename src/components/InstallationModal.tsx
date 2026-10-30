import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Apple,
  Terminal,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Package,
  Sparkles,
  Globe,
} from 'lucide-react';
import { triggerDownload } from '../utils/vttSrtExport';

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallationModal: React.FC<InstallationModalProps> = ({ isOpen, onClose }) => {
  const [activePlatform, setActivePlatform] = useState<
    'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'brand-icons'
  >('android');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadInstallationGuide = () => {
    fetch('/INSTALLATION.md')
      .then((res) => res.text())
      .then((text) => triggerDownload(text, 'INSTALLATION.md', 'text/markdown'))
      .catch(() => {
        // Fallback if not loaded
        triggerDownload(
          '# KBT_AppGuideVideo Installation Guide\nSee repository INSTALLATION.md',
          'INSTALLATION.md',
          'text/markdown'
        );
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl h-[88vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">
                Multi-Platform Native Installation (INSTALLATION.md)
              </h2>
              <p className="text-xs text-zinc-400">
                Direct Download Links & Step-by-Step Build Instructions for Students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadInstallationGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download INSTALLATION.md</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-6 gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActivePlatform('android')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activePlatform === 'android'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (APK / AAB)</span>
          </button>

          <button
            onClick={() => setActivePlatform('ios')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activePlatform === 'ios'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iOS (PWA / IPA)</span>
          </button>

          <button
            onClick={() => setActivePlatform('windows')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activePlatform === 'windows'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Windows (.exe / .msi)</span>
          </button>

          <button
            onClick={() => setActivePlatform('macos')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activePlatform === 'macos'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>macOS Universal (.dmg)</span>
          </button>

          <button
            onClick={() => setActivePlatform('linux')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activePlatform === 'linux'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Linux (.AppImage / .deb)</span>
          </button>

          <button
            onClick={() => setActivePlatform('brand-icons')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activePlatform === 'brand-icons'
                ? 'bg-lime-500 text-zinc-950 font-bold shadow-md shadow-lime-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span>App Icons & Brand Suite</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activePlatform === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs">
                <strong>Android Capture Engine</strong>: Leverages Capacitor + MediaProjection foreground service with ongoing notification. Immune to Android OS low-memory kill (LMK) policies.
              </div>

              {/* Direct Download Card for Students */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    Direct Sideload Android APK
                  </h4>
                  <p className="text-xs text-zinc-400">
                    File: <code className="text-zinc-300">KBT_AppGuideVideo_v2.4.apk</code> (Android 9.0+)
                  </p>
                </div>
                <button
                  onClick={() =>
                    alert('Direct APK download link configured. Host file at /downloads/android/KBT_AppGuideVideo_v2.4.apk')
                  }
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK (Release)</span>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-zinc-300">Build Instructions (CLI):</h4>
                <div className="relative p-3 rounded-xl bg-zinc-900/90 font-mono text-xs text-zinc-300 border border-zinc-800">
                  <pre className="whitespace-pre-wrap">{`npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk`}</pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run build && npx cap sync android && cd android && ./gradlew assembleRelease',
                        'android_cmd'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedIndex === 'android_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Apple className="w-4 h-4 text-zinc-300" />
                  Option A: Offline Progressive Web App (PWA) on iPhone/iPad
                </h4>
                <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-1.5 pl-2 leading-relaxed">
                  <li>Open this web application in <strong>Safari</strong> on iOS.</li>
                  <li>Tap the <strong>Share</strong> icon (square with arrow pointing up).</li>
                  <li>Scroll down and select <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>"Add"</strong>. The app launches fullscreen with offline synthesis!</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-zinc-300">Option B: Native IPA via Capacitor & Xcode:</h4>
                <div className="relative p-3 rounded-xl bg-zinc-900/90 font-mono text-xs text-zinc-300 border border-zinc-800">
                  <pre className="whitespace-pre-wrap">{`npm install @capacitor/ios
npx cap add ios
npm run build && npx cap sync ios
npx cap open ios
# Build & Archive in Xcode for student iPads & iPhones`}</pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run build && npx cap sync ios && npx cap open ios',
                        'ios_cmd'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedIndex === 'ios_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'windows' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-blue-300 text-xs">
                <strong>Windows Native Duplication Engine</strong>: Wrapped with <strong>Tauri + Rust</strong> for direct DirectX 11 Desktop Duplication API (IDXGIOutputDuplication) zero-copy texture grab.
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-400" />
                    Windows Installer (.exe / .msi)
                  </h4>
                  <p className="text-xs text-zinc-400">
                    File: <code className="text-zinc-300">KBT_AppGuideVideo_2.4.0_x64-setup.exe</code>
                  </p>
                </div>
                <button
                  onClick={() =>
                    alert('Windows installer download link configured. Host setup file at /downloads/windows/KBT_AppGuideVideo_2.4.0_x64-setup.exe')
                  }
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .exe Setup</span>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-zinc-300">Tauri CLI Build Command:</h4>
                <div className="relative p-3 rounded-xl bg-zinc-900/90 font-mono text-xs text-zinc-300 border border-zinc-800">
                  <pre className="whitespace-pre-wrap">{`npm run build
npm run tauri build
# Generated: src-tauri/target/release/bundle/nsis/KBT_AppGuideVideo_2.4.0_x64-setup.exe`}</pre>
                  <button
                    onClick={() => copyToClipboard('npm run build && npm run tauri build', 'win_cmd')}
                    className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedIndex === 'win_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'macos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-purple-300 text-xs">
                <strong>macOS Universal Binary</strong>: Integrates Apple ScreenCaptureKit with Metal texture pipelines for both M1/M2/M3/M4 Apple Silicon and Intel x86_64 architectures.
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Apple className="w-4 h-4 text-purple-400" />
                    macOS Universal Disk Image (.dmg)
                  </h4>
                  <p className="text-xs text-zinc-400">
                    File: <code className="text-zinc-300">KBT_AppGuideVideo_2.4.0_universal.dmg</code>
                  </p>
                </div>
                <button
                  onClick={() =>
                    alert('macOS disk image download link configured. Host file at /downloads/macos/KBT_AppGuideVideo_2.4.0_universal.dmg')
                  }
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .dmg</span>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-zinc-300">Universal Build Command:</h4>
                <div className="relative p-3 rounded-xl bg-zinc-900/90 font-mono text-xs text-zinc-300 border border-zinc-800">
                  <pre className="whitespace-pre-wrap">{`npm run tauri build -- --target universal-apple-darwin
# Output: src-tauri/target/universal-apple-darwin/release/bundle/dmg/KBT_AppGuideVideo_2.4.0_universal.dmg`}</pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run tauri build -- --target universal-apple-darwin',
                        'mac_cmd'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedIndex === 'mac_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'linux' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300 text-xs">
                <strong>Linux Desktop</strong>: Native PipeWire portal capture for Ubuntu, Debian, Fedora, Arch, and Red Hat.
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-zinc-300">Linux Package Build:</h4>
                <div className="relative p-3 rounded-xl bg-zinc-900/90 font-mono text-xs text-zinc-300 border border-zinc-800">
                  <pre className="whitespace-pre-wrap">{`# Build AppImage & Debian package
npm run tauri build
chmod +x src-tauri/target/release/bundle/appimage/KBT_AppGuideVideo_2.4.0_amd64.AppImage
./src-tauri/target/release/bundle/appimage/KBT_AppGuideVideo_2.4.0_amd64.AppImage`}</pre>
                  <button
                    onClick={() => copyToClipboard('npm run tauri build', 'linux_cmd')}
                    className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {copiedIndex === 'linux_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePlatform === 'brand-icons' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-lime-950/30 border border-lime-800/40 text-lime-300 text-xs flex items-center justify-between">
                <div>
                  <strong>KBT App Logo & Brand Identity</strong>: Cyber-tech green (#a3e635) and yellow (#facc15) spider emblem with squircle geometric masking across all build outputs.
                </div>
                <button
                  onClick={() => triggerDownload(
                    JSON.stringify({
                      brand: "KBT_AppGuideVideo",
                      palette: { neonGreen: "#a3e635", cyberYellow: "#facc15", background: "#09090b" },
                      assets: [
                        { type: "desktop_app_icon", file: "/assets/desktop-app-icon.png", target: "Windows Title Bars / macOS Proxy" },
                        { type: "mobile_appbar_logo", file: "/assets/mobile-appbar-logo.png", target: "iOS & Android Mobile App Bars" },
                        { type: "web_header_logo", file: "/assets/web-header-logo.png", target: "Web Browser Headers & Tabs" }
                      ]
                    }, null, 2),
                    'kbt-brand-manifest.json',
                    'application/json'
                  )}
                  className="px-3 py-1.5 rounded-lg bg-lime-500/20 hover:bg-lime-500/30 text-lime-300 font-mono text-[11px] border border-lime-500/40"
                >
                  Download Manifest
                </button>
              </div>

              {/* 3 Targets Showcase Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Desktop Title Bars */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Laptop className="w-4 h-4 text-lime-400" />
                    <span>1. Desktop Title Bars</span>
                  </div>
                  <div className="h-32 bg-zinc-950 rounded-lg p-2 flex flex-col items-center justify-center border border-zinc-800 gap-2">
                    <div className="w-14 h-14 bg-zinc-900 mask-squircle border border-yellow-400/30 p-1 flex items-center justify-center">
                      <img
                        src="/assets/desktop-app-icon.png"
                        alt="Desktop App Icon"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">16px to 512px (.ico / .icns)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Sized for macOS window proxy icon and Windows 10/11 system title bars with crisp edge-contrast.
                  </p>
                </div>

                {/* 2. Mobile App Bars */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Smartphone className="w-4 h-4 text-lime-400" />
                    <span>2. Mobile App Bars</span>
                  </div>
                  <div className="h-32 bg-zinc-950 rounded-lg p-2 flex flex-col items-center justify-center border border-zinc-800 gap-2">
                    <div className="w-14 h-14 bg-zinc-900 mask-squircle border border-lime-400/30 p-1 flex items-center justify-center">
                      <img
                        src="/assets/mobile-appbar-logo.png"
                        alt="Mobile App Bar Logo"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">24px to 48px & 192px adaptive</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Optimized for iOS UINavigationBar and Android TopAppBar with authentic superellipse squircle curvature.
                  </p>
                </div>

                {/* 3. Web Header Bars */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Globe className="w-4 h-4 text-lime-400" />
                    <span>3. Web Header Bars</span>
                  </div>
                  <div className="h-32 bg-zinc-950 rounded-lg p-2 flex flex-col items-center justify-center border border-zinc-800 gap-2">
                    <div className="w-14 h-14 bg-zinc-900 mask-squircle border border-yellow-400/30 p-1 flex items-center justify-center">
                      <img
                        src="/assets/web-header-logo.png"
                        alt="Web Header Logo"
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Chrome / Safari / Edge</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Integrated directly in the active navigation header with live .mask-squircle utility and neon lime circuitry glow.
                  </p>
                </div>
              </div>

              {/* Terminal command */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs flex items-center justify-between">
                <span className="text-lime-400">$ npm run tauri icon ./public/assets/kbt-logo-transparent.png</span>
                <button
                  onClick={() => copyToClipboard('npm run tauri icon ./public/assets/kbt-logo-transparent.png', 'brand_tauri_cmd')}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                >
                  {copiedIndex === 'brand_tauri_cmd' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* HTML Embed Snippet for Instructor's Course Website */}
          <div className="mt-6 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <h4 className="font-semibold text-xs text-zinc-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Website Download Links HTML Snippet (Embed on your university course portal):
            </h4>
            <div className="relative p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-400 border border-zinc-800 overflow-x-auto">
              <pre>{`<a href="/downloads/android/KBT_AppGuideVideo_v2.4.apk">Android APK</a>
<a href="/downloads/windows/KBT_AppGuideVideo_2.4.0_x64-setup.exe">Windows .exe</a>
<a href="/downloads/macos/KBT_AppGuideVideo_2.4.0_universal.dmg">macOS .dmg</a>
<a href="/downloads/linux/KBT_AppGuideVideo_2.4.0_amd64.AppImage">Linux AppImage</a>`}</pre>
              <button
                onClick={() =>
                  copyToClipboard(
                    `<a href="/downloads/android/KBT_AppGuideVideo_v2.4.apk">Android APK</a>\n<a href="/downloads/windows/KBT_AppGuideVideo_2.4.0_x64-setup.exe">Windows .exe</a>\n<a href="/downloads/macos/KBT_AppGuideVideo_2.4.0_universal.dmg">macOS .dmg</a>\n<a href="/downloads/linux/KBT_AppGuideVideo_2.4.0_amd64.AppImage">Linux AppImage</a>`,
                    'html_embed'
                  )
                }
                className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                {copiedIndex === 'html_embed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/90 text-xs text-zinc-500 flex justify-between items-center">
          <span>KBT Cross-Platform Capstone Packaging Engine</span>
          <button onClick={onClose} className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
