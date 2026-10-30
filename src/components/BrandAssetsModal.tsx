import React, { useState } from 'react';
import {
  X,
  Laptop,
  Smartphone,
  Globe,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Code2,
  Terminal,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Eye,
  Maximize2
} from 'lucide-react';

interface BrandAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandAssetsModal: React.FC<BrandAssetsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile' | 'web' | 'integration'>('desktop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [useSquircleMask, setUseSquircleMask] = useState<boolean>(true);
  const [useGlow, setUseGlow] = useState<boolean>(true);
  const [previewSize, setPreviewSize] = useState<number>(64);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (path: string, filename: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-900 to-black p-1 mask-squircle border border-lime-400/40 shadow-lg shadow-lime-500/20 flex items-center justify-center">
              <img
                src="/assets/web-header-logo.png"
                alt="KBT Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white font-mono flex items-center gap-1.5">
                  <span className="text-lime-400">KBT</span> Brand & Multi-Platform App Icons
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-lime-950 text-lime-400 border border-lime-500/30">
                  Cyber-Tech Spider
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Desktop Title Bars, Mobile App Bars (iOS/Android), and Web Header Bars with Squircle Masking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('/assets/kbt-logo-transparent.png', 'kbt-brand-logo.png')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-500/20 hover:bg-lime-500/30 text-lime-300 border border-lime-500/40 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Master PNG</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
              aria-label="Close brand modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-6 py-2">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'desktop'
                  ? 'bg-lime-500 text-zinc-950 font-bold shadow-md shadow-lime-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Desktop Title Bars (Windows / macOS)</span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'mobile'
                  ? 'bg-lime-500 text-zinc-950 font-bold shadow-md shadow-lime-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile App Bars (iOS / Android)</span>
            </button>

            <button
              onClick={() => setActiveTab('web')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'web'
                  ? 'bg-lime-500 text-zinc-950 font-bold shadow-md shadow-lime-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Web Header Bars (Browsers / Apps)</span>
            </button>

            <button
              onClick={() => setActiveTab('integration')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'integration'
                  ? 'bg-lime-500 text-zinc-950 font-bold shadow-md shadow-lime-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Integration Specs & Tailwind Mask</span>
            </button>
          </div>

          {/* Interactive Styling Toggles */}
          <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useSquircleMask}
                onChange={(e) => setUseSquircleMask(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-lime-500 focus:ring-0"
              />
              <span>Squircle Mask</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useGlow}
                onChange={(e) => setUseGlow(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-lime-500 focus:ring-0"
              />
              <span>Neon Glow</span>
            </label>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DESKTOP TITLE BARS */}
          {activeTab === 'desktop' && (
            <div className="space-y-6">
              {/* Introduction Card */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-lime-400" />
                    Application Icon (App Icon) in Desktop Title Bars
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Optimized for Windows 10/11 system title bars, macOS Sonoma/Sequoia window proxy headers, and Tauri v2 desktop bundles.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('/assets/desktop-app-icon.png', 'kbt-desktop-icon.png')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5 text-lime-400" />
                    <span>Download PNG (512x512)</span>
                  </button>
                </div>
              </div>

              {/* Title Bar Simulation: macOS vs Windows */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* macOS Window Title Bar Simulation */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                    <span className="font-semibold text-white">macOS Title Bar Simulation</span>
                    <span className="font-mono text-[10px]">Universal Binary (.app / .dmg)</span>
                  </div>

                  {/* Window Frame Mockup */}
                  <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/95 overflow-hidden shadow-2xl">
                    {/* macOS Title Bar Header */}
                    <div className="h-9 px-3 bg-zinc-800/90 border-b border-zinc-700/60 flex items-center justify-between select-none">
                      {/* Traffic Lights */}
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500/90 border border-red-600/50"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500/90 border border-yellow-600/50"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500/90 border border-green-600/50"></span>
                      </div>

                      {/* Centered Document Proxy Icon & Title */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                        <div className={`w-4 h-4 rounded overflow-hidden ${useSquircleMask ? 'mask-squircle' : ''}`}>
                          <img
                            src="/assets/desktop-app-icon.png"
                            alt="macOS App Icon"
                            className={`w-full h-full object-cover ${useGlow ? 'filter drop-shadow-[0_0_4px_rgba(163,230,53,0.6)]' : ''}`}
                          />
                        </div>
                        <span className="font-medium tracking-tight">KBT_AppGuideVideo — Studio Recorder</span>
                      </div>

                      <div className="w-12"></div>
                    </div>

                    {/* Window Mock Content */}
                    <div className="p-4 bg-zinc-950/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="/assets/desktop-app-icon.png"
                          alt="Desktop Icon"
                          className="w-12 h-12 rounded-xl border border-zinc-800 shadow-md"
                        />
                        <div>
                          <div className="text-xs font-bold text-white font-mono">Tauri v2 Native Bundle</div>
                          <div className="text-[11px] text-zinc-400">Target: macOS ARM64 & x86_64</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                        Sandboxed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Windows 11 Title Bar Simulation */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                    <span className="font-semibold text-white">Windows 11 Title Bar Simulation</span>
                    <span className="font-mono text-[10px]">WiX / NSIS (.msi / .exe)</span>
                  </div>

                  {/* Window Frame Mockup */}
                  <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/95 overflow-hidden shadow-2xl">
                    {/* Windows Title Bar Header */}
                    <div className="h-9 px-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between select-none">
                      {/* App Icon + Title */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                        <div className="w-4 h-4 rounded overflow-hidden">
                          <img
                            src="/assets/desktop-app-icon.png"
                            alt="Windows App Icon"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-xs">KBT_AppGuideVideo (Production Build)</span>
                      </div>

                      {/* Windows Window Controls */}
                      <div className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 text-xs">
                          ―
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 text-xs">
                          ▢
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white text-zinc-400 text-xs transition">
                          ✕
                        </div>
                      </div>
                    </div>

                    {/* Window Mock Content */}
                    <div className="p-4 bg-zinc-950/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="/assets/desktop-app-icon.png"
                          alt="Desktop Icon"
                          className="w-12 h-12 rounded-xl border border-zinc-800 shadow-md"
                        />
                        <div>
                          <div className="text-xs font-bold text-white font-mono">Tauri / Rust Backend</div>
                          <div className="text-[11px] text-zinc-400">Target: Windows x64 Native</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-lime-950 text-lime-300 font-mono border border-lime-800">
                        DirectX / DXGI
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Multi-Resolution Scale Ladder */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider font-mono">
                    Desktop Title Bar & System Icon Scale Ladder (16px to 256px)
                  </h4>
                  <span className="text-xs text-zinc-400 font-mono">Pixel-accurate alignment</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {/* 16px */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-between gap-3 text-center">
                    <span className="text-[10px] font-mono text-zinc-400">16x16 Title Bar</span>
                    <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg">
                      <img
                        src="/assets/desktop-app-icon.png"
                        alt="16px icon"
                        style={{ width: 16, height: 16 }}
                        className={useSquircleMask ? 'mask-squircle' : 'rounded-sm'}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">System Tray</span>
                  </div>

                  {/* 24px */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-between gap-3 text-center">
                    <span className="text-[10px] font-mono text-zinc-400">24x24 Proxy</span>
                    <div className="w-9 h-9 flex items-center justify-center bg-zinc-900 rounded-lg">
                      <img
                        src="/assets/desktop-app-icon.png"
                        alt="24px icon"
                        style={{ width: 24, height: 24 }}
                        className={useSquircleMask ? 'mask-squircle' : 'rounded'}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">macOS Proxy</span>
                  </div>

                  {/* 32px */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-between gap-3 text-center">
                    <span className="text-[10px] font-mono text-zinc-400">32x32 Taskbar</span>
                    <div className="w-11 h-11 flex items-center justify-center bg-zinc-900 rounded-lg">
                      <img
                        src="/assets/desktop-app-icon.png"
                        alt="32px icon"
                        style={{ width: 32, height: 32 }}
                        className={useSquircleMask ? 'mask-squircle' : 'rounded-md'}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">Taskbar Icon</span>
                  </div>

                  {/* 48px */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-between gap-3 text-center">
                    <span className="text-[10px] font-mono text-zinc-400">48x48 Dialog</span>
                    <div className="w-14 h-14 flex items-center justify-center bg-zinc-900 rounded-lg">
                      <img
                        src="/assets/desktop-app-icon.png"
                        alt="48px icon"
                        style={{ width: 48, height: 48 }}
                        className={useSquircleMask ? 'mask-squircle' : 'rounded-lg'}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">About Dialog</span>
                  </div>

                  {/* 64px */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-between gap-3 text-center">
                    <span className="text-[10px] font-mono text-zinc-400">64x64 Launch</span>
                    <div className="w-18 h-18 flex items-center justify-center bg-zinc-900 rounded-lg">
                      <img
                        src="/assets/desktop-app-icon.png"
                        alt="64px icon"
                        style={{ width: 64, height: 64 }}
                        className={useSquircleMask ? 'mask-squircle' : 'rounded-xl'}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">Desktop Shortcut</span>
                  </div>

                  {/* 128px */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-between gap-3 text-center">
                    <span className="text-[10px] font-mono text-zinc-400">128x128 HiDPI</span>
                    <div className="w-20 h-20 flex items-center justify-center bg-zinc-900 rounded-lg overflow-hidden">
                      <img
                        src="/assets/desktop-app-icon.png"
                        alt="128px icon"
                        className={`w-full h-full object-cover ${useSquircleMask ? 'mask-squircle' : 'rounded-xl'}`}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">Retina / 4K</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE APP BARS (iOS / Android) */}
          {activeTab === 'mobile' && (
            <div className="space-y-6">
              {/* Introduction Card */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-lime-400" />
                    Brand Logo of Mobile App Bars (iOS & Android)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Adaptive squircle geometry configured according to iOS Human Interface Guidelines and Android Material 3 specs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('/assets/mobile-appbar-logo.png', 'kbt-mobile-logo.png')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5 text-lime-400" />
                    <span>Download Mobile Asset</span>
                  </button>
                </div>
              </div>

              {/* Mobile App Bar Simulation: iOS vs Android */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* iOS Navigation Bar Mockup */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                    <span className="font-semibold text-white">iOS UINavigationBar Simulation</span>
                    <span className="font-mono text-[10px]">Capacitor / Swift</span>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                    {/* iOS Status Bar + Dynamic Island */}
                    <div className="h-8 px-5 bg-zinc-950 flex items-center justify-between text-[11px] font-semibold text-white select-none">
                      <span>9:41</span>
                      {/* Dynamic Island pill */}
                      <div className="w-20 h-4 bg-black rounded-full border border-zinc-800"></div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span>5G</span>
                        <div className="w-4 h-2.5 border border-white rounded-xs p-0.5">
                          <div className="h-full bg-white rounded-xs"></div>
                        </div>
                      </div>
                    </div>

                    {/* iOS Navigation App Bar */}
                    <div className="h-12 px-4 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between">
                      {/* Back button */}
                      <button className="text-lime-400 text-xs font-medium flex items-center gap-1">
                        ‹ Back
                      </button>

                      {/* Brand Logo in iOS App Bar */}
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 bg-gradient-to-br from-zinc-900 to-black p-0.5 border border-lime-400/30 flex items-center justify-center ${useSquircleMask ? 'mask-squircle' : 'rounded-lg'}`}>
                          <img
                            src="/assets/mobile-appbar-logo.png"
                            alt="iOS App Bar Logo"
                            className={`w-full h-full object-contain ${useGlow ? 'filter drop-shadow-[0_0_6px_rgba(163,230,53,0.5)]' : ''}`}
                          />
                        </div>
                        <span className="font-bold text-xs text-white tracking-tight">KBT Studio</span>
                      </div>

                      {/* Action Icon */}
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-300">
                        ⋮
                      </div>
                    </div>

                    {/* Mobile Screen Mockup Body */}
                    <div className="p-4 space-y-2 bg-zinc-950/90">
                      <div className="h-3 bg-zinc-800/80 rounded w-2/3"></div>
                      <div className="h-2 bg-zinc-800/50 rounded w-1/2"></div>
                      <div className="p-3 mt-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-zinc-300 font-mono">MediaProjection State</span>
                        <span className="text-[10px] text-lime-400 font-mono">READY</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Android Material 3 Top App Bar Mockup */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                    <span className="font-semibold text-white">Android Material 3 Top App Bar</span>
                    <span className="font-mono text-[10px]">Capacitor / Kotlin</span>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                    {/* Android Status Bar */}
                    <div className="h-6 px-4 bg-zinc-950 flex items-center justify-between text-[10px] font-mono text-zinc-400 select-none">
                      <span>12:00</span>
                      <div className="flex items-center gap-1">
                        <span>● LTE</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Android Top App Bar */}
                    <div className="h-14 px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                      {/* Nav Icon */}
                      <div className="flex items-center gap-3">
                        <button className="text-zinc-300 text-base">☰</button>
                        {/* Brand Logo in Android Top App Bar */}
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 bg-zinc-900 p-0.5 border border-yellow-400/30 flex items-center justify-center ${useSquircleMask ? 'mask-squircle' : 'rounded-full'}`}>
                            <img
                              src="/assets/mobile-appbar-logo.png"
                              alt="Android App Bar Logo"
                              className={`w-full h-full object-contain ${useGlow ? 'filter drop-shadow-[0_0_6px_rgba(163,230,53,0.5)]' : ''}`}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white tracking-tight">KBT_AppGuide</div>
                            <div className="text-[9px] text-zinc-400">Tutorial Engine</div>
                          </div>
                        </div>
                      </div>

                      {/* Android Actions */}
                      <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <span>🔍</span>
                        <span>⋮</span>
                      </div>
                    </div>

                    {/* Mobile Screen Mockup Body */}
                    <div className="p-4 space-y-2 bg-zinc-950/90">
                      <div className="h-3 bg-zinc-800/80 rounded w-3/4"></div>
                      <div className="h-2 bg-zinc-800/50 rounded w-1/3"></div>
                      <div className="p-3 mt-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-zinc-300 font-mono">Foreground Service</span>
                        <span className="text-[10px] text-emerald-400 font-mono">FOREGROUND_ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Dimension Spec Card */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h4 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider font-mono">
                  Mobile App Bar & Adaptive Icon Sizing
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px]">Small Bar</span>
                    <div className="font-bold text-white mt-1">24x24 px</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Compact mobile status badge</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px]">Standard App Bar</span>
                    <div className="font-bold text-white mt-1">32x32 px</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">iOS UINavigationBar / Material 3</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px]">Prominent Bar</span>
                    <div className="font-bold text-white mt-1">48x48 px</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Collapsing Large TopAppBar</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px]">PWA & Adaptive</span>
                    <div className="font-bold text-white mt-1">192 & 512 px</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Home screen adaptive icon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEB HEADER BARS */}
          {activeTab === 'web' && (
            <div className="space-y-6">
              {/* Introduction Card */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-lime-400" />
                    Brand (App) Logo of Web Header Bars (Web Browsers / Web Apps)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Tailored for web browsers (Chrome, Firefox, Safari, Edge), responsive navigation headers, and desktop PWAs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('/assets/web-header-logo.png', 'kbt-web-header-logo.png')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5 text-lime-400" />
                    <span>Download Web Logo</span>
                  </button>
                </div>
              </div>

              {/* Web Browser Tab & Header Simulation */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                  <span className="font-semibold text-white">Full Browser & Web Navigation Bar Simulation</span>
                  <span className="font-mono text-[10px]">Vite + React SPA</span>
                </div>

                <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950 overflow-hidden shadow-2xl">
                  {/* Browser Window Controls + Tabs */}
                  <div className="h-10 px-3 bg-zinc-900 border-b border-zinc-800 flex items-center gap-3">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                    </div>

                    {/* Active Tab with Favicon */}
                    <div className="h-7 px-3 rounded-t-lg bg-zinc-950 border-t border-l border-r border-zinc-800 flex items-center gap-2 text-xs text-white">
                      <img
                        src="/assets/desktop-app-icon.png"
                        alt="Favicon"
                        className="w-3.5 h-3.5 rounded-xs"
                      />
                      <span className="text-[11px] font-medium">KBT_AppGuideVideo</span>
                      <span className="text-zinc-500 text-[10px] ml-1">✕</span>
                    </div>

                    {/* New Tab Button */}
                    <span className="text-zinc-500 text-xs">+</span>
                  </div>

                  {/* Browser Address Bar */}
                  <div className="h-9 px-4 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <span>‹</span>
                      <span>›</span>
                      <span>↻</span>
                    </div>

                    {/* URL Bar */}
                    <div className="flex-1 max-w-lg h-6 px-3 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-[11px] font-mono text-zinc-300">
                      <span className="text-emerald-400">🔒</span>
                      <span>https://kbt-appguide.studio/recorder</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <span>⭐</span>
                      <span>⋮</span>
                    </div>
                  </div>

                  {/* Web Header Bar Component (Live in this app!) */}
                  <div className="px-5 py-3 bg-zinc-950/95 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`relative w-10 h-10 bg-gradient-to-br from-zinc-900 to-black p-1 border border-yellow-400/30 flex items-center justify-center ${useSquircleMask ? 'mask-squircle' : 'rounded-xl'}`}>
                        <img
                          src="/assets/web-header-logo.png"
                          alt="Web Header Bar Logo"
                          className={`w-full h-full object-contain ${useGlow ? 'filter drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]' : ''}`}
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-white font-mono flex items-center gap-1.5">
                          <span className="text-lime-400">KBT</span>
                          <span>_AppGuideVideo</span>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-zinc-800 text-lime-400 border border-lime-500/30">
                            v2.4
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          Multi-Platform Capture & 22-Language Architecture
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
                        Studio Recorder
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium">
                        Live Capture
                      </div>
                    </div>
                  </div>

                  {/* Web Content Placeholder */}
                  <div className="p-6 bg-zinc-950 text-center text-xs text-zinc-500 font-mono">
                    ✦ The Web Header Bar logo is actively rendered with real-time .mask-squircle utility and neon lime circuitry glow ✦
                  </div>
                </div>
              </div>

              {/* Web Header Responsive Breakpoints */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h4 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider font-mono">
                  Responsive Breakpoint Layouts for Web Navigation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px]">Mobile Web (&lt; 640px)</span>
                    <div className="font-bold text-white mt-1">w-8 h-8 (32px)</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Compact icon without subtitle to maximize viewport area</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px]">Tablet / Laptop (640px - 1024px)</span>
                    <div className="font-bold text-white mt-1">w-10 h-10 (40px)</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Full brand monogram with version tag badge</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 font-mono text-[10px]">Ultra-Wide / 4K (&gt; 1440px)</span>
                    <div className="font-bold text-white mt-1">w-12 h-12 (48px)</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Retina-sharp SVG/PNG with extended drop-shadow</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTEGRATION SPECS & TAILWIND */}
          {activeTab === 'integration' && (
            <div className="space-y-6">
              {/* Integration Guide Summary */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-lime-400" />
                  kbt-integration-guide.txt Production Specifications
                </h3>
                <p className="text-xs text-zinc-300">
                  Follow these step-by-step instructions to integrate the KBT App Logo (green/yellow cyber spider) across your multi-platform codebase:
                </p>
              </div>

              {/* Code Snippet 1: index.css Mask Utility */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    1. Tailwind CSS Squircle Mask Utility (src/index.css)
                  </span>
                  <button
                    onClick={() =>
                      copyCode(
                        `@layer utilities {\n  .mask-squircle {\n    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="black" d="M 0,50 C 0,4 4,0 50,0 C 96,0 100,4 100,50 C 100,96 96,100 50,100 C 4,100 0,96 0,50 Z"/></svg>');\n    mask-size: 100% 100%;\n    mask-repeat: no-repeat;\n    -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="black" d="M 0,50 C 0,4 4,0 50,0 C 96,0 100,4 100,50 C 100,96 96,100 50,100 C 4,100 0,96 0,50 Z"/></svg>');\n    -webkit-mask-size: 100% 100%;\n    -webkit-mask-repeat: no-repeat;\n  }\n}`,
                        'css-mask'
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition"
                  >
                    {copiedKey === 'css-mask' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy CSS</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-lime-300 overflow-x-auto">
{`@layer utilities {
  .mask-squircle {
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="black" d="M 0,50 C 0,4 4,0 50,0 C 96,0 100,4 100,50 C 100,96 96,100 50,100 C 4,100 0,96 0,50 Z"/></svg>');
    mask-size: 100% 100%;
    mask-repeat: no-repeat;
    -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="black" d="M 0,50 C 0,4 4,0 50,0 C 96,0 100,4 100,50 C 100,96 96,100 50,100 C 4,100 0,96 0,50 Z"/></svg>');
    -webkit-mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
  }
}`}
                </pre>
              </div>

              {/* Code Snippet 2: React AppIconImage Component */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    2. React AppIconImage Component
                  </span>
                  <button
                    onClick={() =>
                      copyCode(
                        `export const AppIconImage: React.FC = () => {\n  return (\n    <div className="relative w-24 h-24 bg-gradient-to-br from-zinc-900 to-black p-4 mask-squircle flex items-center justify-center border border-yellow-400/20">\n      <img \n        src="/assets/kbt-logo-transparent.png" \n        alt="KBT App Logo" \n        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"\n      />\n    </div>\n  );\n};`,
                        'react-component'
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition"
                  >
                    {copiedKey === 'react-component' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy TSX</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
{`export const AppIconImage: React.FC = () => {
  return (
    <div className="relative w-24 h-24 bg-gradient-to-br from-zinc-900 to-black p-4 mask-squircle flex items-center justify-center border border-yellow-400/20">
      <img 
        src="/assets/kbt-logo-transparent.png" 
        alt="KBT App Logo" 
        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
      />
    </div>
  );
};`}
                </pre>
              </div>

              {/* Code Snippet 3: Terminal Command for Tauri Icons */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    3. Tauri CLI Automatic Multi-Platform Icon Generator
                  </span>
                  <button
                    onClick={() =>
                      copyCode('npm run tauri icon ./public/assets/kbt-logo-transparent.png', 'tauri-cmd')
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition"
                  >
                    {copiedKey === 'tauri-cmd' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Command</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-lime-400">
                  $ npm run tauri icon ./public/assets/kbt-logo-transparent.png
                </div>
                <p className="text-[11px] text-zinc-400">
                  Automatically populates Windows <code className="text-zinc-200 font-mono">icon.ico</code>, macOS <code className="text-zinc-200 font-mono">icon.icns</code>, and multi-resolution PNGs across <code className="text-zinc-200 font-mono">src-tauri/icons/</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/90 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400"></span>
            <span>Asset Palette: Lime Green (#a3e635) & Cyber Yellow (#facc15)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
