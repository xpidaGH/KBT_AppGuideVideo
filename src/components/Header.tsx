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
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-zinc-100 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Tally Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Video className="w-5 h-5 text-white" />
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-zinc-950"></span>
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
              {isRecording ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-medium animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  REC {formatTime(recordingSeconds)}
                </div>
              ) : (
                <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-mono">
                  OBS/Loom/Scribe Studio
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 hidden md:block">
              Multi-Platform Capture & 22-Language Capstone Architecture
            </p>
          </div>
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
