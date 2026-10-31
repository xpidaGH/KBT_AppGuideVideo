import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudioRecorder } from './components/StudioRecorder';
import { BlueprintsHub } from './components/BlueprintsHub';
import { BenchmarkLab } from './components/BenchmarkLab';
import { UserGuideModal } from './components/UserGuideModal';
import { InstallationModal } from './components/InstallationModal';
import { ArchitectureMapModal } from './components/ArchitectureMapModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { BrandAssetsModal } from './components/BrandAssetsModal';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { getSavedTheme, applyTheme } from './utils/themeManager';
import { SupportedLanguageCode } from './types';
import { LANGUAGE_MAP, SUPPORTED_LANGUAGES } from './data/languages';
import { KEYBOARD_SHORTCUTS, KeyboardShortcutDef } from './data/recorderConfig';
import { audioNotification } from './utils/audioNotification';
import {
  Video,
  BookOpen,
  Download,
  GitBranch,
  Languages,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  Keyboard,
  CheckCircle2,
  XCircle,
  Activity,
  Sliders,
  Palette,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'studio' | 'blueprints' | 'benchmarks'>('studio');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>('en');

  // Modals
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
  const [isArchitectureMapOpen, setIsArchitectureMapOpen] = useState<boolean>(false);
  const [isBrandAssetsOpen, setIsBrandAssetsOpen] = useState<boolean>(false);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Keyboard Shortcuts Configuration
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutDef[]>(() => {
    try {
      const stored = localStorage.getItem('kbt_custom_shortcuts_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return KEYBOARD_SHORTCUTS;
  });

  // Cloud Sync State
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kbt_cloud_sync_enabled_v1') !== 'false';
    } catch (e) {
      return true;
    }
  });

  // Hotkey Trigger Visual HUD Toast (2-second temporary on-screen toast)
  const [hotkeyToast, setHotkeyToast] = useState<{ action: string; label: string; key: string } | null>(null);

  // Export Completion Toast
  const [exportToast, setExportToast] = useState<{
    fileName: string;
    format: string;
    sizeMb: string;
    success: boolean;
  } | null>(null);

  // Initialize active UI theme variation and CSS variables
  useEffect(() => {
    const saved = getSavedTheme();
    applyTheme(saved);
  }, []);

  // Global Keyboard Listener in App component
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K / Cmd+K to open Global Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Prevent hijacking text inputs
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      const match = shortcuts.find((s) => {
        const keyMatches =
          s.key.toLowerCase() === e.key.toLowerCase() ||
          s.code.toLowerCase() === e.code.toLowerCase() ||
          (s.key === ' ' && (e.code === 'Space' || e.key === ' '));
        const ctrlMatches = s.requiresCtrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatches = s.requiresShift ? e.shiftKey : !e.shiftKey;
        return keyMatches && ctrlMatches && shiftMatches;
      });

      if (match) {
        if (match.code === 'Space' || match.key === ' ' || match.requiresCtrl) {
          e.preventDefault();
        }
        window.dispatchEvent(
          new CustomEvent('kbt-hotkey', { detail: { action: match.action, source: 'keyboard' } })
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  // Listen for 'kbt-hotkey' event for 2-second temporary HUD toast notification
  useEffect(() => {
    let timer: number;
    const handleHotkeyEvent = (e: any) => {
      const action = e.detail?.action;
      if (action) {
        const match = shortcuts.find((s) => s.action === action);
        setHotkeyToast({
          action,
          label: match ? match.description : action,
          key: match ? match.displayKey : '',
        });

        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          setHotkeyToast(null);
        }, 2000);
      }
    };

    window.addEventListener('kbt-hotkey', handleHotkeyEvent);
    return () => {
      window.removeEventListener('kbt-hotkey', handleHotkeyEvent);
      window.clearTimeout(timer);
    };
  }, [shortcuts]);

  // Listen for 'kbt-export-complete' event
  useEffect(() => {
    let timer: number;
    const handleExportComplete = (e: any) => {
      const detail = e.detail || {};
      audioNotification.playExportSuccessSound();
      setExportToast({
        fileName: detail.fileName || 'tutorial_recording.mp4',
        format: (detail.format || 'mp4').toUpperCase(),
        sizeMb: detail.sizeMb || '12.4',
        success: detail.success !== false,
      });

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setExportToast(null);
      }, 4500);
    };

    window.addEventListener('kbt-export-complete', handleExportComplete);
    return () => {
      window.removeEventListener('kbt-export-complete', handleExportComplete);
      window.clearTimeout(timer);
    };
  }, []);

  const handleResetShortcuts = () => {
    localStorage.removeItem('kbt_custom_shortcuts_v1');
    setShortcuts(KEYBOARD_SHORTCUTS);
  };

  const currentLang = LANGUAGE_MAP[selectedLanguage] || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header with GitHub sync, Global Search, and visible focus rings */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        onOpenArchitectureMap={() => setIsArchitectureMapOpen(true)}
        onOpenBrandAssets={() => setIsBrandAssetsOpen(true)}
        onOpenThemeSettings={() => setIsThemeSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        audioLevel={audioLevel}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 space-y-6">
        {/* Splash Banner */}
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/30 to-zinc-900 border border-indigo-900/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  KBT_AppGuideVideo Systems Capstone
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  OBS, Camtasia, Scribe & Loom Engineering Studio
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Software Tutorial Creation, Low-Level SIMD Capture & 22-Language Systems Architecture
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Empowering international computer science and systems programming students to capture raw GPU textures, vectorize color spaces in SIMD assembly, mux hardware containers, stream reactive telemetry lakes, and synthesize multi-lingual voiceovers across mobile, web, and desktop.
              </p>

              {/* Splash Screen Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="btn-splash-user-guide"
                  onClick={() => setIsUserGuideOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open 22-Language User Guide (USER_GUIDE.md)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-splash-install-guide"
                  onClick={() => setIsInstallGuideOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Native Install Guide (Android, iOS, Windows, macOS)</span>
                </button>

                <button
                  id="btn-splash-brand-assets"
                  onClick={() => setIsBrandAssetsOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime-950/40 hover:bg-lime-900/50 text-lime-300 border border-lime-500/40 font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
                >
                  <Sparkles className="w-4 h-4 text-lime-400" />
                  <span>Brand & App Icons</span>
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Studio Settings</span>
                </button>

                {/* Language Selector */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
                  <Languages className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-400">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguageCode)}
                    aria-label="Select Current Applet Language"
                    className="bg-transparent text-white font-bold cursor-pointer focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-100">
                        {lang.flag} {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="hidden lg:grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px]">PILLARS</span>
                <div className="text-lg font-bold text-indigo-400">5 Modules</div>
                <span className="text-[10px] text-zinc-400">VRAM to Mainframe</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px]">LANGUAGES</span>
                <div className="text-lg font-bold text-purple-400">22 Complete</div>
                <span className="text-[10px] text-zinc-400">Full I18n & TTS</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px]">SHORTCUT</span>
                <div className="text-lg font-bold text-emerald-400">Ctrl+E Fast</div>
                <span className="text-[10px] text-zinc-400">Zero-Wait Export</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px]">OUTPUT FORMAT</span>
                <div className="text-lg font-bold text-amber-400">1080p 60FPS</div>
                <span className="text-[10px] text-zinc-400">YouTube & LMS Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Studio Screen Recorder & Interactive Compositor */}
        {currentTab === 'studio' && (
          <StudioRecorder
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            recordingSeconds={recordingSeconds}
            setRecordingSeconds={setRecordingSeconds}
            setAudioLevel={setAudioLevel}
          />
        )}

        {/* Tab 2: 22-Language Production Capstone Blueprints Hub */}
        {currentTab === 'blueprints' && <BlueprintsHub />}

        {/* Tab 3: Interactive SIMD & DSP Benchmark Lab */}
        {currentTab === 'benchmarks' && <BenchmarkLab />}
      </main>

      {/* Footer & Global Keyboard Shortcuts Legend */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 text-xs text-zinc-500">
        <div
          id="footer-keyboard-shortcuts-legend"
          className="px-4 sm:px-6 py-2.5 bg-zinc-900/40 border-b border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Keyboard className="w-3 h-3 text-indigo-400" />
              <span>Hotkeys</span>
            </span>
            <span className="text-zinc-400 font-medium text-[11px] hidden sm:inline">
              Global Studio Shortcuts (Press or click key):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {shortcuts.map((sc) => (
              <button
                key={sc.action + sc.displayKey}
                type="button"
                id={`footer-shortcut-${sc.displayKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('kbt-hotkey', { detail: { action: sc.action } })
                  )
                }
                title={`Hotkey [${sc.displayKey}]: ${sc.description}`}
                className="shortcut-legend-pill inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 hover:border-indigo-500/50 border border-zinc-800 text-zinc-300 hover:text-white transition active:scale-95 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-amber-300 font-mono font-bold text-[10px] shadow-xs">
                  {sc.displayKey}
                </kbd>
                <span className="text-[11px] font-sans text-zinc-400">{sc.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Meta & Documentation Links */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-zinc-400">KBT_AppGuideVideo</span>
            <span>•</span>
            <span>International Systems Programming & Multimedia Engineering Curriculum</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsUserGuideOpen(true)} className="hover:text-zinc-300 transition">
              USER_GUIDE.md (22 Languages)
            </button>
            <span>•</span>
            <button onClick={() => setIsInstallGuideOpen(true)} className="hover:text-zinc-300 transition">
              INSTALLATION.md (Multi-Platform)
            </button>
            <span>•</span>
            <button onClick={() => setIsArchitectureMapOpen(true)} className="hover:text-zinc-300 transition">
              Architecture Map
            </button>
          </div>
        </div>
      </footer>

      {/* Temporary Visual Indicator Toast: 2 seconds on kbt-hotkey event */}
      {hotkeyToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-indigo-500/70 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{hotkeyToast.label}</span>
              {hotkeyToast.key && (
                <kbd className="px-1.5 py-0.2 rounded bg-zinc-950 border border-zinc-700 text-amber-300 font-mono text-[10px]">
                  {hotkeyToast.key}
                </kbd>
              )}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">{hotkeyToast.action} triggered</div>
          </div>
        </div>
      )}

      {/* Global Export Completion Toast */}
      {exportToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-emerald-500/70 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 duration-300"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Export Successfully Completed!</div>
            <div className="text-[11px] text-zinc-300 font-mono">
              {exportToast.fileName} ({exportToast.sizeMb} MB • {exportToast.format})
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <InstallationModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />

      <ArchitectureMapModal
        isOpen={isArchitectureMapOpen}
        onClose={() => setIsArchitectureMapOpen(false)}
      />

      <BrandAssetsModal
        isOpen={isBrandAssetsOpen}
        onClose={() => setIsBrandAssetsOpen(false)}
      />

      <ThemeSettingsModal
        isOpen={isThemeSettingsOpen}
        onClose={() => setIsThemeSettingsOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenDoc={(docType) => {
          if (docType === 'user-guide') setIsUserGuideOpen(true);
          else if (docType === 'installation') setIsInstallGuideOpen(true);
          else if (docType === 'architecture') setIsArchitectureMapOpen(true);
          else if (docType === 'brand-assets') setIsBrandAssetsOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shortcuts={shortcuts}
        onUpdateShortcuts={setShortcuts}
        onResetShortcuts={handleResetShortcuts}
        cloudSyncEnabled={cloudSyncEnabled}
        onToggleCloudSync={(enabled) => {
          setCloudSyncEnabled(enabled);
          localStorage.setItem('kbt_cloud_sync_enabled_v1', enabled ? 'true' : 'false');
        }}
      />
    </div>
  );
}
