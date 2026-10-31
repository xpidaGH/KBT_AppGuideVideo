import React, { useState, useEffect } from 'react';
import {
  Video,
  Code2,
  GitBranch,
  Gauge,
  BookOpen,
  Download,
  Languages,
  Mic,
  Activity,
  Search,
  Github,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Settings,
  Sparkles,
  Palette,
} from 'lucide-react';
import { SupportedLanguageCode, LanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../data/languages';
import { githubSyncService, GitHubSyncStatus } from '../services/githubSync';

interface HeaderProps {
  currentTab: 'studio' | 'blueprints' | 'benchmarks';
  setCurrentTab: (tab: 'studio' | 'blueprints' | 'benchmarks') => void;
  selectedLanguage: SupportedLanguageCode;
  onLanguageChange: (lang: SupportedLanguageCode) => void;
  onOpenUserGuide: () => void;
  onOpenInstallGuide: () => void;
  onOpenArchitectureMap: () => void;
  onOpenBrandAssets?: () => void;
  onOpenThemeSettings?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  isRecording: boolean;
  recordingSeconds: number;
  audioLevel: number; // 0 to 1
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedLanguage,
  onLanguageChange,
  onOpenUserGuide,
  onOpenInstallGuide,
  onOpenArchitectureMap,
  onOpenBrandAssets,
  onOpenThemeSettings,
  onOpenSearch,
  onOpenSettings,
  isRecording,
  recordingSeconds,
  audioLevel,
}) => {
  const currentLangInfo: LanguageInfo = LANGUAGE_MAP[selectedLanguage] || SUPPORTED_LANGUAGES[0];
  const [hotkeyGlowPulse, setHotkeyGlowPulse] = useState<boolean>(false);
  const [ghSyncStatus, setGhSyncStatus] = useState<GitHubSyncStatus>(() => githubSyncService.getStatus());

  // Listen to 'kbt-hotkey' custom event for glowing pulse animation on recording timer
  useEffect(() => {
    let timeoutId: number;
    const handleHotkeyEvent = () => {
      setHotkeyGlowPulse(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setHotkeyGlowPulse(false);
      }, 1000);
    };

    const handleGhSync = (e: any) => {
      if (e.detail?.status) {
        setGhSyncStatus(e.detail.status);
      }
    };

    window.addEventListener('kbt-hotkey', handleHotkeyEvent);
    window.addEventListener('kbt-github-sync', handleGhSync);
    return () => {
      window.removeEventListener('kbt-hotkey', handleHotkeyEvent);
      window.removeEventListener('kbt-github-sync', handleGhSync);
      window.clearTimeout(timeoutId);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b transition-all duration-300 text-zinc-100 px-4 py-2.5 ${
        isRecording
          ? 'border-red-500/50 shadow-[0_4px_25px_-5px_rgba(239,68,68,0.25)]'
          : 'border-zinc-800'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Tally Status */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenBrandAssets}
            role="button"
            tabIndex={0}
            title="KBT Brand Identity & Multi-Platform App Icons (Click to view icon suite)"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-900 to-black p-1 mask-squircle border border-yellow-400/30 shadow-md shadow-lime-500/10 cursor-pointer hover:border-lime-400 hover:scale-105 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
          >
            <img
              src="/assets/web-header-logo.png"
              alt="KBT App Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
            />
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4" title="Live Recording Active">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-zinc-950 shadow-sm shadow-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={onOpenBrandAssets}
                className="font-extrabold text-base tracking-tight text-white font-mono flex items-center gap-1 cursor-pointer hover:text-lime-300 transition"
              >
                <span className="text-lime-400">KBT</span>
                <span>_AppGuideVideo</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-lime-400 border border-lime-500/30">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden md:block">
              Multi-Platform Capture & 22-Language Capstone Architecture
            </p>
          </div>
        </div>

        {/* GitHub Sync Status Indicator Badge */}
        <div
          id="header-github-sync-status"
          onClick={onOpenSettings}
          title={`GitHub Sync Status: ${ghSyncStatus.toUpperCase()} (Click to configure in Settings)`}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
            ghSyncStatus === 'synced'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
              : ghSyncStatus === 'syncing'
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Github className="w-3.5 h-3.5" />
          {ghSyncStatus === 'synced' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Synced</span>
            </>
          ) : ghSyncStatus === 'syncing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span>Unsynced</span>
            </>
          )}
        </div>

        {/* Prominent Visual Recording Indicator (Pulsing Red Dot, REC Badge & Live Timer) */}
        <div
          id="header-recording-indicator"
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
            isRecording
              ? hotkeyGlowPulse
                ? 'bg-red-950 border-red-400 shadow-[0_0_35px_rgba(239,68,68,0.9)] ring-4 ring-red-500/80 animate-pulse scale-105 text-white'
                : 'bg-red-950/80 border-red-500/70 shadow-lg shadow-red-500/20 text-red-200 ring-1 ring-red-500/40'
              : 'bg-zinc-900/70 border-zinc-800 text-zinc-500'
          }`}
          title={
            isRecording
              ? 'Recording in progress! Press Space to stop/pause or toggle controls.'
              : 'Capture Standby (Press Space or click Start Recording)'
          }
        >
          {isRecording ? (
            <>
              <div className="relative flex items-center justify-center w-3 h-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-md shadow-red-500 ${
                    hotkeyGlowPulse ? 'scale-125 ring-2 ring-red-300' : 'animate-pulse'
                  }`}
                ></span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-widest text-red-400 uppercase font-mono">
                  REC
                </span>
                <span
                  className={`text-xs font-mono font-bold tracking-wider transition-all ${
                    hotkeyGlowPulse
                      ? 'text-red-100 drop-shadow-[0_0_8px_rgba(239,68,68,1)] scale-110 font-extrabold'
                      : 'text-white'
                  }`}
                >
                  {formatTime(recordingSeconds)}
                </span>
              </div>

              <div
                className="hidden sm:flex items-center gap-0.5 pl-1.5 border-l border-red-500/30 h-3"
                title={`Live Mic Audio Signal: ${Math.round(audioLevel * 100)}%`}
              >
                <span
                  className="w-0.5 rounded-full bg-red-400 transition-all duration-75"
                  style={{ height: `${Math.max(4, Math.min(12, audioLevel * 20))}px` }}
                />
                <span
                  className="w-0.5 rounded-full bg-red-300 transition-all duration-75"
                  style={{ height: `${Math.max(6, Math.min(14, audioLevel * 30))}px` }}
                />
                <span
                  className="w-0.5 rounded-full bg-red-400 transition-all duration-75"
                  style={{ height: `${Math.max(4, Math.min(12, audioLevel * 22))}px` }}
                />
              </div>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
              <span className="text-[10px] font-mono tracking-wider font-semibold text-zinc-400 uppercase">
                STANDBY
              </span>
            </>
          )}
        </div>

        {/* Tab Navigation with focus rings */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setCurrentTab('studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
              currentTab === 'studio'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Studio Recorder</span>
          </button>

          <button
            onClick={() => setCurrentTab('blueprints')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
              currentTab === 'blueprints'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>22-Language Blueprints</span>
          </button>

          <button
            onClick={() => setCurrentTab('benchmarks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
              currentTab === 'benchmarks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>SIMD & DSP Benchmarks</span>
          </button>
        </div>

        {/* Right Tools: Global Search, Architecture Map, User Guide, Install Guide, Settings, Language Selector */}
        <div className="flex items-center gap-2">
          {/* Global Search Button (Ctrl+K) */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              title="Search documentation, blueprints, and recordings (Ctrl+K)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden lg:inline px-1 rounded bg-zinc-950 border border-zinc-700 text-[9px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Live Mic VU meter */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <Mic className={`w-3.5 h-3.5 ${audioLevel > 0.1 ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(5, audioLevel * 100))}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={onOpenArchitectureMap}
            title="Unified Cross-Language Architecture Map"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Architecture Map</span>
          </button>

          {onOpenBrandAssets && (
            <button
              onClick={onOpenBrandAssets}
              title="KBT Brand Logo & Multi-Platform App Icons (Desktop, Mobile, Web)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-lime-950/40 hover:bg-lime-900/50 text-lime-300 hover:text-lime-200 border border-lime-500/30 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Brand Icons</span>
            </button>
          )}

          <button
            onClick={onOpenInstallGuide}
            title="Download & Multi-Platform Native Installation Guide (INSTALLATION.md)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Native Install</span>
          </button>

          <button
            onClick={onOpenUserGuide}
            title="Open 22-Language Software User Guide (USER_GUIDE.md)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 text-xs font-medium transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>User Guide</span>
          </button>

          {/* Theme Settings Button (5 UI Themes) */}
          {onOpenThemeSettings && (
            <button
              onClick={onOpenThemeSettings}
              title="Theme Settings — Select from 5 distinct UI theme variations"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer shadow-xs"
            >
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Theme Settings</span>
            </button>
          )}

          {/* 22 Language Selector Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium cursor-pointer hover:border-zinc-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
              <Languages className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-sm">{currentLangInfo.flag}</span>
              <span className="hidden md:inline font-mono text-[11px]">{currentLangInfo.code.toUpperCase()}</span>
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguageCode)}
              aria-label="Select Internationalization Language"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-zinc-900 text-zinc-100">
                  {lang.flag} {lang.name} ({lang.nativeName}) - [{lang.bcp47}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
