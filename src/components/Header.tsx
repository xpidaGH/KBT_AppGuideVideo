import React from 'react';
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
} from 'lucide-react';
import { SupportedLanguageCode, LanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../data/languages';

interface HeaderProps {
  currentTab: 'studio' | 'blueprints' | 'benchmarks';
  setCurrentTab: (tab: 'studio' | 'blueprints' | 'benchmarks') => void;
  selectedLanguage: SupportedLanguageCode;
  onLanguageChange: (lang: SupportedLanguageCode) => void;
  onOpenUserGuide: () => void;
  onOpenInstallGuide: () => void;
  onOpenArchitectureMap: () => void;
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
  isRecording,
  recordingSeconds,
  audioLevel,
}) => {
  const currentLangInfo: LanguageInfo = LANGUAGE_MAP[selectedLanguage] || SUPPORTED_LANGUAGES[0];

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
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Video className="w-5 h-5 text-white" />
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4" title="Live Recording Active">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-zinc-950 shadow-sm shadow-red-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">
                KBT_AppGuideVideo
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden md:block">
              Multi-Platform Capture & 22-Language Capstone Architecture
            </p>
          </div>
        </div>

        {/* Prominent Visual Recording Indicator (Pulsing Red Dot, REC Badge & Live Timer) */}
        <div
          id="header-recording-indicator"
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
            isRecording
              ? 'bg-red-950/80 border-red-500/70 shadow-lg shadow-red-500/20 text-red-200 ring-1 ring-red-500/40'
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
              {/* Concentric pulsing / blinking red dot */}
              <div className="relative flex items-center justify-center w-3 h-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-md shadow-red-500 animate-pulse"></span>
              </div>

              {/* Bold REC label & monospace elapsed timer */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-widest text-red-400 uppercase font-mono">
                  REC
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  {formatTime(recordingSeconds)}
                </span>
              </div>

              {/* Live Audio Activity Bars during recording */}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setCurrentTab('studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'benchmarks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>SIMD & DSP Benchmarks</span>
          </button>
        </div>

        {/* Right Tools: Architecture Map, User Guide, Install Guide, Language Selector */}
        <div className="flex items-center gap-2">
          {/* Live Mic VU meter indicator */}
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Architecture Map</span>
          </button>

          <button
            onClick={onOpenInstallGuide}
            title="Download & Multi-Platform Native Installation Guide (INSTALLATION.md)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Native Install</span>
          </button>

          <button
            onClick={onOpenUserGuide}
            title="Open 22-Language Software User Guide (USER_GUIDE.md)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 text-xs font-medium transition shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>User Guide</span>
          </button>

          {/* 22 Language Selector Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium cursor-pointer hover:border-zinc-700 transition">
              <Languages className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-sm">{currentLangInfo.flag}</span>
              <span className="hidden md:inline font-mono text-[11px]">{currentLangInfo.code.toUpperCase()}</span>
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguageCode)}
              aria-label="Select Internationalization Language"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
